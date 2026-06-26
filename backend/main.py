import re
import string
import secrets

from fastapi import FastAPI, Depends, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, or_
from datetime import datetime

from backend.models import Base, Empresa, Usuario, Cliente, Venta, Pago, Gasto, Producto, VentaItem
from backend.database import engine, get_db
import backend.schemas as schemas
from backend.auth import hash_password, verify_password, crear_token, get_usuario_actual


app = FastAPI(
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sistema-digital-red.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


@app.get("/")
def inicio():
    return {"Mensaje": "Backend Funcionando"}


def usuario_payload(usuario: Usuario, db: Session) -> dict:
    """Arma la salida del usuario incluyendo datos de su empresa."""
    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "username": usuario.username,
        "email": usuario.email,
        "telefono": usuario.telefono,
        "empresa_id": usuario.empresa_id,
        "empresa_nombre": empresa.nombre if empresa else None,
        "empresa_codigo": empresa.codigo if empresa else None,
        "empresa_logo": empresa.logo if empresa else None,
        "empresa_tema": (empresa.tema or "rosa") if empresa else "rosa",
        "rol": usuario.rol,
    }


def estadisticas_usuario(db: Session, empresa_id: int, usuario_id: int,
                         mes: int = None, anio: int = None) -> dict:
    """Calcula las estadísticas de lo que ha registrado un usuario.
    Si se pasa mes y anio, filtra solo ese período."""
    filtrar = mes is not None and anio is not None

    def suma(modelo, columna):
        q = db.query(func.sum(columna)).filter(
            modelo.empresa_id == empresa_id, modelo.usuario_id == usuario_id
        )
        if filtrar:
            q = q.filter(
                func.extract("month", modelo.fecha) == mes,
                func.extract("year", modelo.fecha) == anio,
            )
        return q.scalar() or 0

    def conteo(modelo):
        q = db.query(func.count(modelo.id)).filter(
            modelo.empresa_id == empresa_id, modelo.usuario_id == usuario_id
        )
        if filtrar:
            q = q.filter(
                func.extract("month", modelo.fecha) == mes,
                func.extract("year", modelo.fecha) == anio,
            )
        return q.scalar() or 0

    # Clientes se filtran por su fecha de creación
    cq = db.query(func.count(Cliente.id)).filter(
        Cliente.empresa_id == empresa_id, Cliente.usuario_id == usuario_id
    )
    if filtrar:
        cq = cq.filter(
            func.extract("month", Cliente.creado_en) == mes,
            func.extract("year", Cliente.creado_en) == anio,
        )
    clientes_count = cq.scalar() or 0

    return {
        "ventas_count": conteo(Venta),
        "ventas_total": suma(Venta, Venta.total),
        "pagos_count": conteo(Pago),
        "pagos_total": suma(Pago, Pago.monto),
        "gastos_count": conteo(Gasto),
        "gastos_total": suma(Gasto, Gasto.monto),
        "clientes_count": clientes_count,
    }


def validar_password(password: str):
    """Reglas mínimas de seguridad para la contraseña."""
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="La contraseña debe incluir letras y números")


def generar_codigo_empresa(db: Session) -> str:
    """Genera un código único de 8 caracteres para una empresa."""
    alfabeto = string.ascii_uppercase + string.digits
    while True:
        codigo = "".join(secrets.choice(alfabeto) for _ in range(8))
        if not db.query(Empresa).filter(Empresa.codigo == codigo).first():
            return codigo


# ===================== AUTENTICACIÓN =====================

@app.post("/registro", response_model=schemas.TokenResponse)
def registro(datos: schemas.RegistroRequest, db: Session = Depends(get_db)):

    tipo = (datos.tipo or "").strip().lower()
    if tipo not in ("empresario", "propietaria", "usuario"):
        raise HTTPException(status_code=400, detail="Tipo de registro inválido")

    # Reglas de seguridad de la contraseña
    validar_password(datos.password)

    # Validar nombre de usuario
    username = (datos.username or "").strip().lower()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="El nombre de usuario debe tener al menos 3 caracteres")
    if db.query(Usuario).filter(Usuario.username == username).first():
        raise HTTPException(status_code=400, detail="Ese nombre de usuario ya está en uso")

    # El correo es opcional, pero si lo dan, no puede repetirse
    if datos.email:
        if db.query(Usuario).filter(Usuario.email == datos.email).first():
            raise HTTPException(status_code=400, detail="Ese correo ya está registrado")

    if tipo in ("empresario", "propietaria"):
        # Crea una empresa nueva.
        # "empresario" = solo administra; "propietaria" = administra y también vende.
        if not datos.empresa_nombre or not datos.empresa_nombre.strip():
            raise HTTPException(status_code=400, detail="Falta el nombre de la empresa")
        empresa = Empresa(
            nombre=datos.empresa_nombre.strip(),
            codigo=generar_codigo_empresa(db),
        )
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        rol = "admin" if tipo == "empresario" else "propietaria"
    else:
        # Se une a una empresa existente con el código
        if not datos.empresa_codigo or not datos.empresa_codigo.strip():
            raise HTTPException(status_code=400, detail="Falta el código de la empresa")
        empresa = db.query(Empresa).filter(
            Empresa.codigo == datos.empresa_codigo.strip().upper()
        ).first()
        if not empresa:
            raise HTTPException(status_code=404, detail="No existe una empresa con ese código")
        rol = "empleado"

    usuario = Usuario(
        empresa_id=empresa.id,
        nombre=datos.nombre,
        username=username,
        email=datos.email,
        password_hash=hash_password(datos.password),
        rol=rol,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    token = crear_token(usuario)
    return {"access_token": token, "token_type": "bearer", "usuario": usuario_payload(usuario, db)}


@app.post("/login", response_model=schemas.TokenResponse)
def login(datos: schemas.LoginRequest, db: Session = Depends(get_db)):

    username = (datos.username or "").strip().lower()
    usuario = db.query(Usuario).filter(Usuario.username == username).first()

    if not usuario or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    token = crear_token(usuario)
    return {"access_token": token, "token_type": "bearer", "usuario": usuario_payload(usuario, db)}


@app.get("/me", response_model=schemas.UsuarioOut)
def me(usuario: Usuario = Depends(get_usuario_actual), db: Session = Depends(get_db)):
    return usuario_payload(usuario, db)


# ===================== PERFIL (cualquier usuario) =====================

@app.put("/perfil", response_model=schemas.UsuarioOut)
def actualizar_perfil(
    datos: schemas.PerfilUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    nombre = (datos.nombre or "").strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")

    username = (datos.username or "").strip().lower()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="El nombre de usuario debe tener al menos 3 caracteres")

    # username único entre OTROS usuarios
    if db.query(Usuario).filter(Usuario.username == username, Usuario.id != usuario.id).first():
        raise HTTPException(status_code=400, detail="Ese nombre de usuario ya está en uso")

    # email único (si lo dan) entre OTROS usuarios
    if datos.email:
        if db.query(Usuario).filter(Usuario.email == datos.email, Usuario.id != usuario.id).first():
            raise HTTPException(status_code=400, detail="Ese correo ya está en uso")

    usuario.nombre = nombre
    usuario.username = username
    usuario.email = datos.email or None
    usuario.telefono = datos.telefono or None
    db.commit()
    db.refresh(usuario)
    return usuario_payload(usuario, db)


@app.get("/perfil/estadisticas")
def mis_estadisticas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    return estadisticas_usuario(db, usuario.empresa_id, usuario.id)


@app.put("/perfil/password")
def cambiar_password(
    datos: schemas.PasswordChange,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    if not verify_password(datos.actual, usuario.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    validar_password(datos.nueva)
    usuario.password_hash = hash_password(datos.nueva)
    db.commit()
    return {"mensaje": "Contraseña actualizada"}


# ===================== ADMINISTRACIÓN DE EMPRESA (solo admin) =====================

# Roles con poderes de administración (empresario y propietaria)
ADMIN_ROLES = ("admin", "propietaria")
# Roles que pueden operar (registrar ventas, pagos): empleado y propietaria
OPERADOR_ROLES = ("empleado", "propietaria")


def requiere_admin(usuario: Usuario):
    if usuario.rol not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Solo el empresario puede hacer esto")


def requiere_empleado(usuario: Usuario):
    if usuario.rol not in OPERADOR_ROLES:
        raise HTTPException(status_code=403, detail="Esta acción es solo para empleados")


@app.get("/empresa/estadisticas")
def estadisticas_empresa(
    mes: int = None,
    anio: int = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    miembros = db.query(Usuario)\
        .filter(Usuario.empresa_id == usuario.empresa_id)\
        .order_by(Usuario.id)\
        .all()
    resultado = []
    for m in miembros:
        # El empresario que solo supervisa (rol admin) no aparece en stats
        if m.rol == "admin":
            continue
        stats = estadisticas_usuario(db, usuario.empresa_id, m.id, mes, anio)
        resultado.append({
            "id": m.id,
            "nombre": m.nombre,
            "username": m.username,
            "rol": m.rol,
            **stats,
        })
    return resultado


@app.get("/empresa/empleados", response_model=list[schemas.EmpleadoOut])
def listar_empleados(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    return db.query(Usuario)\
        .filter(Usuario.empresa_id == usuario.empresa_id)\
        .order_by(Usuario.id)\
        .all()


@app.put("/empresa/logo")
def cambiar_logo_empresa(
    datos: schemas.LogoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()
    empresa.logo = datos.logo or None
    db.commit()
    return {"mensaje": "Logo actualizado"}


TEMAS_VALIDOS = ("rosa", "azul", "amarillo", "verde", "lila", "oscuro")


@app.put("/empresa/tema")
def cambiar_tema_empresa(
    datos: schemas.TemaUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    tema = (datos.tema or "").strip().lower()
    if tema not in TEMAS_VALIDOS:
        raise HTTPException(status_code=400, detail="Tema inválido")
    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()
    empresa.tema = tema
    db.commit()
    return {"mensaje": "Tema actualizado", "tema": tema}


@app.get("/empresa/empleados/{usuario_id}/estadisticas")
def estadisticas_empleado(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    miembro = db.query(Usuario).filter(
        Usuario.id == usuario_id,
        Usuario.empresa_id == usuario.empresa_id,
    ).first()
    if not miembro:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return estadisticas_usuario(db, usuario.empresa_id, usuario_id)


@app.put("/empresa/nombre")
def cambiar_nombre_empresa(
    datos: schemas.EmpresaNombreUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    if not datos.nombre or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")

    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()
    empresa.nombre = datos.nombre.strip()
    db.commit()
    db.refresh(empresa)
    return {"mensaje": "Nombre actualizado", "nombre": empresa.nombre}


@app.put("/empresa/empleados/{usuario_id}/rol")
def cambiar_rol_empleado(
    usuario_id: int,
    datos: schemas.RolUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    nuevo_rol = (datos.rol or "").strip().lower()
    if nuevo_rol not in ("admin", "empleado", "propietaria"):
        raise HTTPException(status_code=400, detail="Rol inválido")

    miembro = db.query(Usuario).filter(
        Usuario.id == usuario_id,
        Usuario.empresa_id == usuario.empresa_id,
    ).first()
    if not miembro:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # No dejar la empresa sin ningún empresario
    if miembro.rol in ADMIN_ROLES and nuevo_rol not in ADMIN_ROLES:
        admins = db.query(Usuario).filter(
            Usuario.empresa_id == usuario.empresa_id,
            Usuario.rol.in_(ADMIN_ROLES),
        ).count()
        if admins <= 1:
            raise HTTPException(status_code=400, detail="Debe quedar al menos un empresario")

    miembro.rol = nuevo_rol
    db.commit()
    return {"mensaje": "Rol actualizado"}


@app.put("/empresa/codigo/regenerar")
def regenerar_codigo(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    empresa = db.query(Empresa).filter(Empresa.id == usuario.empresa_id).first()
    empresa.codigo = generar_codigo_empresa(db)
    db.commit()
    db.refresh(empresa)
    return {"mensaje": "Código regenerado", "codigo": empresa.codigo}


@app.delete("/empresa/empleados/{usuario_id}")
def quitar_empleado(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)

    if usuario_id == usuario.id:
        raise HTTPException(status_code=400, detail="No puedes quitarte a ti mismo")

    miembro = db.query(Usuario).filter(
        Usuario.id == usuario_id,
        Usuario.empresa_id == usuario.empresa_id,
    ).first()
    if not miembro:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # No dejar la empresa sin ningún empresario
    if miembro.rol in ADMIN_ROLES:
        admins = db.query(Usuario).filter(
            Usuario.empresa_id == usuario.empresa_id,
            Usuario.rol.in_(ADMIN_ROLES),
        ).count()
        if admins <= 1:
            raise HTTPException(status_code=400, detail="Debe quedar al menos un empresario")

    # Reasignar lo que registró al empresario actual, para no perder datos
    emp = usuario.empresa_id
    db.query(Venta).filter(Venta.empresa_id == emp, Venta.usuario_id == usuario_id)\
        .update({Venta.usuario_id: usuario.id})
    db.query(Pago).filter(Pago.empresa_id == emp, Pago.usuario_id == usuario_id)\
        .update({Pago.usuario_id: usuario.id})
    db.query(Gasto).filter(Gasto.empresa_id == emp, Gasto.usuario_id == usuario_id)\
        .update({Gasto.usuario_id: usuario.id})
    db.query(Cliente).filter(Cliente.empresa_id == emp, Cliente.usuario_id == usuario_id)\
        .update({Cliente.usuario_id: usuario.id})

    db.delete(miembro)
    db.commit()
    return {"mensaje": "Empleado quitado de la empresa"}


@app.delete("/empresa")
def eliminar_empresa(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    emp = usuario.empresa_id

    # Borrar en orden seguro por las llaves foráneas
    db.query(Pago).filter(Pago.empresa_id == emp).delete()
    db.query(Venta).filter(Venta.empresa_id == emp).delete()
    db.query(Gasto).filter(Gasto.empresa_id == emp).delete()
    db.query(Cliente).filter(Cliente.empresa_id == emp).delete()
    db.query(Usuario).filter(Usuario.empresa_id == emp).delete()
    db.query(Empresa).filter(Empresa.id == emp).delete()
    db.commit()
    return {"mensaje": "Empresa eliminada"}


# ===================== CLIENTES =====================

@app.post("/clientes")
def crear_clientes(
    cliente: schemas.ClienteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    nuevo_cliente = Cliente(
        empresa_id=usuario.empresa_id,
        usuario_id=usuario.id,
        nombre=cliente.nombre,
        telefono=cliente.telefono,
    )
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return nuevo_cliente


@app.get("/clientes")
def listar_clientes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    return db.query(Cliente).filter(Cliente.empresa_id == usuario.empresa_id).all()


# ===================== PRODUCTOS / INVENTARIO =====================

def producto_dict(p: Producto) -> dict:
    return {
        "id": p.id,
        "codigo": p.codigo,
        "nombre": p.nombre,
        "precio": p.precio,
        "controla_stock": p.controla_stock,
        "stock": p.stock,
    }


@app.get("/productos")
def listar_productos(
    q: str = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    query = db.query(Producto).filter(Producto.empresa_id == usuario.empresa_id)
    if q:
        patron = f"%{q.strip()}%"
        query = query.filter(or_(Producto.nombre.ilike(patron), Producto.codigo.ilike(patron)))
    productos = query.order_by(Producto.nombre).all()
    return [producto_dict(p) for p in productos]


@app.post("/productos")
def crear_producto(
    datos: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    codigo = (datos.codigo or "").strip()
    if not codigo or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail="El código y el nombre son obligatorios")

    existe = db.query(Producto).filter(
        Producto.empresa_id == usuario.empresa_id,
        func.lower(Producto.codigo) == codigo.lower(),
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")

    producto = Producto(
        empresa_id=usuario.empresa_id,
        usuario_id=usuario.id,
        codigo=codigo,
        nombre=datos.nombre.strip(),
        precio=datos.precio,
        controla_stock=bool(datos.controla_stock),
        stock=datos.stock if datos.controla_stock else None,
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto_dict(producto)


@app.put("/productos/{producto_id}")
def editar_producto(
    producto_id: int,
    datos: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    producto = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.empresa_id == usuario.empresa_id,
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no existe")

    codigo = (datos.codigo or "").strip()
    if not codigo or not datos.nombre.strip():
        raise HTTPException(status_code=400, detail="El código y el nombre son obligatorios")

    repetido = db.query(Producto).filter(
        Producto.empresa_id == usuario.empresa_id,
        func.lower(Producto.codigo) == codigo.lower(),
        Producto.id != producto_id,
    ).first()
    if repetido:
        raise HTTPException(status_code=400, detail="Ya existe un producto con ese código")

    producto.codigo = codigo
    producto.nombre = datos.nombre.strip()
    producto.precio = datos.precio
    producto.controla_stock = bool(datos.controla_stock)
    producto.stock = datos.stock if datos.controla_stock else None
    db.commit()
    db.refresh(producto)
    return producto_dict(producto)


@app.put("/productos/{producto_id}/stock")
def actualizar_stock(
    producto_id: int,
    datos: schemas.StockUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    producto = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.empresa_id == usuario.empresa_id,
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no existe")
    if not producto.controla_stock:
        raise HTTPException(status_code=400, detail="Este producto no maneja stock")
    if datos.stock < 0:
        raise HTTPException(status_code=400, detail="El stock no puede ser negativo")

    producto.stock = datos.stock
    db.commit()
    db.refresh(producto)
    return producto_dict(producto)


@app.delete("/productos/{producto_id}")
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    producto = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.empresa_id == usuario.empresa_id,
    ).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no existe")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado"}


# ===================== VENTAS =====================

@app.post("/ventas")
def crear_venta(
    venta: schemas.VentaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_empleado(usuario)
    cliente = db.query(Cliente).filter(
        Cliente.id == venta.cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    if not venta.items:
        raise HTTPException(status_code=400, detail="Agrega al menos un producto a la venta")

    # Validar productos y calcular total
    total = 0
    items_calculados = []
    for it in venta.items:
        if it.cantidad <= 0:
            raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a 0")
        producto = db.query(Producto).filter(
            Producto.id == it.producto_id,
            Producto.empresa_id == usuario.empresa_id,
        ).first()
        if not producto:
            raise HTTPException(status_code=404, detail="Uno de los productos no existe")
        if producto.controla_stock:
            if producto.stock is None or it.cantidad > producto.stock:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente de {producto.nombre} (disponible: {producto.stock or 0})",
                )
        subtotal = producto.precio * it.cantidad
        total += subtotal
        items_calculados.append((producto, it.cantidad, subtotal))

    descripcion = ", ".join(f"{cant}x {prod.nombre}" for prod, cant, _ in items_calculados)

    nueva_venta = Venta(
        empresa_id=usuario.empresa_id,
        usuario_id=usuario.id,
        cliente_id=venta.cliente_id,
        tipo_pago=venta.tipo_pago.lower(),
        descripcion=descripcion,
        total=total,
    )
    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)

    # Guardar el detalle y descontar stock
    for producto, cant, subtotal in items_calculados:
        db.add(VentaItem(
            venta_id=nueva_venta.id,
            producto_id=producto.id,
            nombre=producto.nombre,
            cantidad=cant,
            precio_unitario=producto.precio,
            subtotal=subtotal,
        ))
        if producto.controla_stock and producto.stock is not None:
            producto.stock -= cant
    db.commit()

    if venta.tipo_pago.lower() == "contado":
        nuevo_pago = Pago(
            empresa_id=usuario.empresa_id,
            usuario_id=usuario.id,
            cliente_id=venta.cliente_id,
            monto=total,
        )
        db.add(nuevo_pago)
        db.commit()

    return {"id": nueva_venta.id, "total": total, "descripcion": descripcion}


@app.get("/ventas")
def listar_ventas(
    mes: int = None,
    año: int = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    query = db.query(
        Venta.id,
        Venta.descripcion,
        Venta.total,
        Venta.tipo_pago,
        Venta.fecha,
        Venta.cliente_id,
        Cliente.nombre.label("cliente_nombre"),
    ).join(Cliente).filter(Venta.empresa_id == usuario.empresa_id)

    if mes and año:
        query = query.filter(
            func.extract("month", Venta.fecha) == mes,
            func.extract("year", Venta.fecha) == año,
        )

    ventas = query.order_by(Venta.fecha.desc()).all()

    venta_ids = [v.id for v in ventas]
    items_por_venta = {}
    if venta_ids:
        items = db.query(VentaItem).filter(VentaItem.venta_id.in_(venta_ids)).all()
        for it in items:
            items_por_venta.setdefault(it.venta_id, []).append({
                "nombre": it.nombre,
                "cantidad": it.cantidad,
                "precio_unitario": it.precio_unitario,
                "subtotal": it.subtotal,
            })

    return [
        {
            "id": v.id,
            "descripcion": v.descripcion,
            "total": v.total,
            "tipo_pago": v.tipo_pago,
            "fecha": v.fecha,
            "cliente_id": v.cliente_id,
            "cliente_nombre": v.cliente_nombre,
            "items": items_por_venta.get(v.id, []),
        }
        for v in ventas
    ]


@app.get("/clientes/{cliente_id}/deuda")
def calcular_deuda(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    total_ventas = db.query(func.sum(Venta.total)).filter(
        Venta.cliente_id == cliente_id,
        Venta.empresa_id == usuario.empresa_id,
    ).scalar() or 0

    total_pagos = db.query(func.sum(Pago.monto)).filter(
        Pago.cliente_id == cliente_id,
        Pago.empresa_id == usuario.empresa_id,
    ).scalar() or 0

    deuda = total_ventas - total_pagos

    return {
        "cliente": cliente.nombre,
        "total_ventas": total_ventas,
        "total_pagos": total_pagos,
        "deuda_actual": deuda,
    }


# ===================== PAGOS =====================

@app.post("/pagos")
def registrar_pago(
    pago: schemas.PagoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_empleado(usuario)
    cliente = db.query(Cliente).filter(
        Cliente.id == pago.cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    nuevo_pago = Pago(
        empresa_id=usuario.empresa_id,
        usuario_id=usuario.id,
        cliente_id=pago.cliente_id,
        monto=pago.monto,
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago


@app.get("/pagos")
def listar_pagos(
    mes: int = Query(None),
    anio: int = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    query = db.query(
        Pago.id,
        Pago.monto,
        Pago.fecha,
        Pago.cliente_id,
        Cliente.nombre.label("cliente_nombre"),
    ).join(Cliente).filter(Pago.empresa_id == usuario.empresa_id)

    if mes is not None and anio is not None:
        query = query.filter(
            extract("month", Pago.fecha) == mes,
            extract("year", Pago.fecha) == anio,
        )

    pagos = query.order_by(Pago.fecha.desc()).all()

    return [
        {
            "id": p.id,
            "monto": p.monto,
            "fecha": p.fecha,
            "cliente_id": p.cliente_id,
            "cliente_nombre": p.cliente_nombre,
        }
        for p in pagos
    ]


# ===================== GASTOS =====================

@app.post("/gastos")
def crear_gasto(
    gasto: schemas.GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    nuevo_gasto = Gasto(
        empresa_id=usuario.empresa_id,
        usuario_id=usuario.id,
        descripcion=gasto.descripcion,
        monto=gasto.monto,
    )
    db.add(nuevo_gasto)
    db.commit()
    db.refresh(nuevo_gasto)
    return nuevo_gasto


@app.get("/gastos")
def listar_gastos(
    mes: int = Query(None),
    año: int = Query(None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    query = db.query(
        Gasto.id,
        Gasto.descripcion,
        Gasto.monto,
        Gasto.fecha,
    ).filter(Gasto.empresa_id == usuario.empresa_id)

    if mes is not None:
        query = query.filter(func.extract("month", Gasto.fecha) == mes)

    if año is not None:
        query = query.filter(func.extract("year", Gasto.fecha) == año)

    gastos = query.order_by(Gasto.fecha.desc()).all()

    return [
        {
            "id": g.id,
            "descripcion": g.descripcion,
            "monto": g.monto,
            "fecha": g.fecha,
        }
        for g in gastos
    ]


@app.get("/clientes/{cliente_id}/estado")
def estado_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    ventas = db.query(Venta).filter(
        Venta.cliente_id == cliente_id,
        Venta.empresa_id == usuario.empresa_id,
    ).all()

    total_ventas = db.query(func.sum(Venta.total)).filter(
        Venta.cliente_id == cliente_id,
        Venta.empresa_id == usuario.empresa_id,
    ).scalar() or 0

    total_pagos = db.query(func.sum(Pago.monto)).filter(
        Pago.cliente_id == cliente_id,
        Pago.empresa_id == usuario.empresa_id,
    ).scalar() or 0

    deuda = total_ventas - total_pagos

    ventas_detalle = [
        {
            "Descripcion": v.descripcion,
            "Tipo_pago": v.tipo_pago,
            "Total": v.total,
            "Fecha": v.fecha,
        }
        for v in ventas
    ]

    return {
        "Cliente": cliente.nombre,
        "Ventas": ventas_detalle,
        "Total_ventas": total_ventas,
        "Total_pagos": total_pagos,
        "Deuda_actual": deuda,
    }


@app.get("/resumen")
def resumen_general(
    mes: int = None,
    anio: int = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    ahora = datetime.now()
    mes_sel = mes or ahora.month
    año_sel = anio or ahora.year
    emp = usuario.empresa_id

    ventas_mes = db.query(func.sum(Venta.total)).filter(
        Venta.empresa_id == emp,
        func.extract("month", Venta.fecha) == mes_sel,
        func.extract("year", Venta.fecha) == año_sel,
    ).scalar() or 0

    gastos_mes = db.query(func.sum(Gasto.monto)).filter(
        Gasto.empresa_id == emp,
        func.extract("month", Gasto.fecha) == mes_sel,
        func.extract("year", Gasto.fecha) == año_sel,
    ).scalar() or 0

    pago_mes = db.query(func.sum(Pago.monto)).filter(
        Pago.empresa_id == emp,
        func.extract("month", Pago.fecha) == mes_sel,
        func.extract("year", Pago.fecha) == año_sel,
    ).scalar() or 0

    # Pendiente del período: lo vendido menos lo cobrado en ese mes
    pendiente_mes = ventas_mes - pago_mes
    ganancia_mes = pago_mes - gastos_mes

    # El empleado no puede ver gastos ni ganancia
    if usuario.rol not in ADMIN_ROLES:
        return {
            "vendido": ventas_mes,
            "gastos": None,
            "pendiente": pendiente_mes,
            "ganancia": None,
        }

    return {
        "vendido": ventas_mes,
        "gastos": gastos_mes,
        "pendiente": pendiente_mes,
        "ganancia": ganancia_mes,
    }


@app.get("/deudas")
def listar_deudas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    emp = usuario.empresa_id

    sub_ventas = db.query(
        Venta.cliente_id,
        func.sum(Venta.total).label("total_ventas"),
    ).filter(Venta.empresa_id == emp).group_by(Venta.cliente_id).subquery()

    sub_pagos = db.query(
        Pago.cliente_id,
        func.sum(Pago.monto).label("total_pagos"),
    ).filter(Pago.empresa_id == emp).group_by(Pago.cliente_id).subquery()

    resultado = db.query(
        Cliente.id,
        Cliente.nombre,
        sub_ventas.c.total_ventas,
        func.coalesce(sub_pagos.c.total_pagos, 0).label("total_pagos"),
        (sub_ventas.c.total_ventas - func.coalesce(sub_pagos.c.total_pagos, 0)).label("deuda"),
    )\
        .join(sub_ventas, Cliente.id == sub_ventas.c.cliente_id)\
        .outerjoin(sub_pagos, Cliente.id == sub_pagos.c.cliente_id)\
        .filter(Cliente.empresa_id == emp)\
        .filter((sub_ventas.c.total_ventas - func.coalesce(sub_pagos.c.total_pagos, 0)) > 0)\
        .all()

    return [
        {
            "id": r.id,
            "nombre": r.nombre,
            "total_ventas": r.total_ventas,
            "total_pagos": r.total_pagos,
            "deuda": r.deuda,
        }
        for r in resultado
    ]


# ===================== EDITAR / ELIMINAR =====================

@app.put("/clientes/{cliente_id}")
def editar_cliente(
    cliente_id: int,
    datos: schemas.ClienteCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    cliente.nombre = datos.nombre
    cliente.telefono = datos.telefono
    db.commit()
    db.refresh(cliente)
    return cliente


@app.delete("/clientes/{cliente_id}")
def eliminar_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    cliente = db.query(Cliente).filter(
        Cliente.id == cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    db.delete(cliente)
    db.commit()
    return {"mensaje": "Cliente eliminado"}


@app.put("/ventas/{venta_id}")
def editar_venta(
    venta_id: int,
    datos: schemas.VentaUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    venta = db.query(Venta).filter(
        Venta.id == venta_id,
        Venta.empresa_id == usuario.empresa_id,
    ).first()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no existe")

    # El cliente nuevo también debe ser de la misma empresa
    cliente = db.query(Cliente).filter(
        Cliente.id == datos.cliente_id,
        Cliente.empresa_id == usuario.empresa_id,
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    venta.descripcion = datos.descripcion
    venta.tipo_pago = datos.tipo_pago.lower()
    venta.total = datos.total
    venta.cliente_id = datos.cliente_id
    db.commit()
    db.refresh(venta)
    return venta


@app.delete("/ventas/{venta_id}")
def eliminar_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    venta = db.query(Venta).filter(
        Venta.id == venta_id,
        Venta.empresa_id == usuario.empresa_id,
    ).first()

    if not venta:
        raise HTTPException(status_code=404, detail="Venta no existe")

    # 1) Devolver el stock de los productos vendidos
    items = db.query(VentaItem).filter(VentaItem.venta_id == venta.id).all()
    for it in items:
        if it.producto_id:
            producto = db.query(Producto).filter(
                Producto.id == it.producto_id,
                Producto.empresa_id == usuario.empresa_id,
            ).first()
            if producto and producto.controla_stock and producto.stock is not None:
                producto.stock += it.cantidad

    # 2) Borrar el detalle PRIMERO (SQL directo) y asegurarlo antes de la venta
    db.query(VentaItem).filter(VentaItem.venta_id == venta.id).delete(synchronize_session=False)
    db.flush()

    # 3) Ahora sí, borrar la venta
    db.delete(venta)
    db.commit()
    return {"mensaje": "Venta eliminada"}


@app.put("/pagos/{pago_id}")
def editar_pago(
    pago_id: int,
    datos: schemas.PagoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    pago = db.query(Pago).filter(
        Pago.id == pago_id,
        Pago.empresa_id == usuario.empresa_id,
    ).first()

    if not pago:
        raise HTTPException(status_code=404, detail="Pago no existe")

    pago.monto = datos.monto
    pago.cliente_id = datos.cliente_id
    db.commit()
    db.refresh(pago)
    return pago


@app.delete("/pagos/{pago_id}")
def eliminar_pago(
    pago_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    pago = db.query(Pago).filter(
        Pago.id == pago_id,
        Pago.empresa_id == usuario.empresa_id,
    ).first()

    if not pago:
        raise HTTPException(status_code=404, detail="Pago no existe")

    db.delete(pago)
    db.commit()
    return {"mensaje": "Pago eliminado"}


@app.put("/gastos/{gasto_id}")
def editar_gasto(
    gasto_id: int,
    datos: schemas.GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.empresa_id == usuario.empresa_id,
    ).first()

    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no existe")

    gasto.descripcion = datos.descripcion
    gasto.monto = datos.monto
    db.commit()
    db.refresh(gasto)
    return gasto


@app.delete("/gastos/{gasto_id}")
def eliminar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual),
):
    requiere_admin(usuario)
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.empresa_id == usuario.empresa_id,
    ).first()

    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no existe")

    db.delete(gasto)
    db.commit()
    return {"mensaje": "Gasto eliminado"}


@app.api_route("/health", methods=["GET", "HEAD"])
def health(request: Request):
    return {"status": "ok"}
