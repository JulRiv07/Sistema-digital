from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from backend.models import Base, Cliente, Venta, Pago, Gasto
from backend.database import engine, get_db
import backend.schemas as schemas


app = FastAPI(
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sistema-digital-red.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind = engine)

@app.get("/")
def inicio():
    return {" Mensaje " : "Backend Funcionando"}

@app.post("/clientes")
def crear_clientes(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    nuevo_cliente = Cliente(
        nombre = cliente.nombre, 
        telefono = cliente.telefono
    )

    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    return nuevo_cliente

@app.get("/clientes")
def listar_clientes(db: Session = Depends(get_db)):
    clientes = db.query(Cliente).all()
    return clientes

@app.post("/ventas")
def crear_venta(venta: schemas.VentaCreate, db: Session = Depends(get_db)):

    cliente = db.query(Cliente).filter(Cliente.id == venta.cliente_id).first()

    if not cliente:
        return {"error": "Cliente no existe"}

    nueva_venta = Venta(
        cliente_id=venta.cliente_id,
        tipo_pago=venta.tipo_pago.lower(),
        descripcion=venta.descripcion,
        total=venta.total
    )

    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)

    if venta.tipo_pago.lower() == "contado":

        nuevo_pago = Pago(
            cliente_id=venta.cliente_id,
            monto=venta.total
        )

        db.add(nuevo_pago)
        db.commit()
        
    return nueva_venta

from fastapi import Query

@app.get("/ventas")
def listar_ventas(mes: int = None, año: int = None, db: Session = Depends(get_db)):

    query = db.query(
        Venta.id,
        Venta.descripcion,
        Venta.total,
        Venta.tipo_pago,
        Venta.fecha,
        Venta.cliente_id,
        Cliente.nombre.label("cliente_nombre")
    ).join(Cliente)

    if mes and año:
        query = query.filter(
            func.extract("month", Venta.fecha) == mes,
            func.extract("year", Venta.fecha) == año
        )

    ventas = query.order_by(Venta.fecha.desc()).all()

    return [
        {
            "id": v.id,
            "descripcion": v.descripcion,
            "total": v.total,
            "tipo_pago": v.tipo_pago,
            "fecha": v.fecha,
            "cliente_id": v.cliente_id,
            "cliente_nombre": v.cliente_nombre
        }
        for v in ventas
    ]

@app.get("/clientes/{cliente_id}/deuda")
def calcular_deuda(cliente_id: int, db: Session = Depends(get_db)):
    
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        return{"Error": "Cliente no existe"}
    
    total_ventas = db.query(func.sum(Venta.total))\
        .filter(Venta.cliente_id == cliente_id)\
        .scalar() or 0
    
    total_pagos = db.query(func.sum(Pago.monto)) \
        .filter(Pago.cliente_id == cliente_id) \
        .scalar() or 0
    
    deuda = total_ventas - total_pagos

    return {
        "cliente": cliente.nombre,
        "total_ventas": total_ventas,
        "total_pagos": total_pagos,
        "deuda_actual": deuda
    }

@app.post("/pagos")
def registrar_pago(pago: schemas.PagoCreate, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id == pago.cliente_id).first()

    if not cliente:
        return {"error" : "Cliente no existe"}
    
    nuevo_pago = Pago(
        cliente_id = pago.cliente_id,
        monto = pago.monto
    )

    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)

    return nuevo_pago

@app.get("/pagos")
def listar_pagos(db: Session = Depends(get_db)):

    pagos = db.query(
        Pago.id,
        Pago.monto,
        Pago.fecha,
        Pago.cliente_id,
        Cliente.nombre.label("cliente_nombre")
    ).join(Cliente).all()

    return [
        {
            "id": p.id,
            "monto": p.monto,
            "fecha": p.fecha,
            "cliente_id": p.cliente_id,   # 🔥 AQUI
            "cliente_nombre": p.cliente_nombre
        }
        for p in pagos
    ]

@app.post("/gastos")
def crear_gasto(gasto: schemas.GastoCreate, db: Session = Depends(get_db)):

    nuevo_gasto = Gasto(
        descripcion=gasto.descripcion,
        monto=gasto.monto
    )

    db.add(nuevo_gasto)
    db.commit()
    db.refresh(nuevo_gasto)

    return nuevo_gasto

from fastapi import Query

@app.get("/gastos")
def listar_gastos(
    mes: int = Query(None),
    año: int = Query(None),
    db: Session = Depends(get_db)
):

    query = db.query(
        Gasto.id,
        Gasto.descripcion,
        Gasto.monto,
        Gasto.fecha
    )

    if mes:
        query = query.filter(func.extract("month", Gasto.fecha) == mes)

    if año:
        query = query.filter(func.extract("year", Gasto.fecha) == año)

    gastos = query.order_by(Gasto.fecha.desc()).all()

    return [
        {
            "id": g.id,
            "descripcion": g.descripcion,
            "monto": g.monto,
            "fecha": g.fecha
        }
        for g in gastos
    ]

@app.get("/clientes/{cliente_id}/estado")
def estado_cliente(cliente_id: int, db: Session = Depends(get_db)):

    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        return {"error" : "Cliente no existe"}
    
    ventas = db.query(Venta) \
        .filter(Venta.cliente_id == cliente_id) \
        .all()
    
    total_ventas = db.query(func.sum(Venta.total)) \
        .filter(Venta.cliente_id == cliente_id) \
        .scalar() or 0
    
    total_pagos = db.query(func.sum(Pago.monto)) \
        .filter(Pago.cliente_id == cliente_id) \
        .scalar() or 0
    
    deuda = total_ventas - total_pagos

    ventas_detalle = [
        {
            "Descripcion": v.descripcion,
            "Tipo_pago": v.tipo_pago,
            "Total": v.total,
            "Fecha": v.fecha
        }
        for v in ventas
    ]

    return {
        "Cliente" : cliente.nombre,
        "Ventas" : ventas_detalle,
        "Total_ventas": total_ventas,
        "Total_pagos": total_pagos,
        "Deuda_actual": deuda
    }

    

@app.get("/resumen")
def resumen_general(db: Session = Depends(get_db)):
    ahora = datetime.now()
    mes_actual = ahora.month
    año_actual = ahora.year

    ventas_mes = db.query(func.sum(Venta.total)) \
        .filter(func.extract("month", Venta.fecha) == mes_actual)\
        .filter(func.extract("year", Venta.fecha) == año_actual)\
        .scalar() or 0

    gastos_mes = db.query(func.sum(Gasto.monto))\
        .filter(func.extract("month", Gasto.fecha) == mes_actual)\
        .filter(func.extract("year", Gasto.fecha) == año_actual)\
        .scalar() or 0

    pago_mes = db.query(func.sum(Pago.monto)) \
        .filter(func.extract("month", Pago.fecha) == mes_actual)\
        .filter(func.extract("year", Pago.fecha) == año_actual)\
        .scalar() or 0

    total_ventas = db.query(func.sum(Venta.total)).scalar() or 0
    total_pagos = db.query(func.sum(Pago.monto)).scalar() or 0
    pendiente_total = total_ventas - total_pagos

    ganancia_mes = pago_mes - gastos_mes

    return {
        "vendido": ventas_mes,
        "gastos": gastos_mes,
        "pendiente": pendiente_total,
        "ganancia": ganancia_mes
    }

@app.get("/deudas")
def listar_deudas(db: Session = Depends(get_db)):

    sub_ventas = db.query(
        Venta.cliente_id,
        func.sum(Venta.total).label("total_ventas")
    ).group_by(Venta.cliente_id).subquery()

    sub_pagos = db.query(
        Pago.cliente_id,
        func.sum(Pago.monto).label("total_pagos")
    ).group_by(Pago.cliente_id).subquery()

    resultado = db.query(
        Cliente.id,
        Cliente.nombre,
        sub_ventas.c.total_ventas,
        func.coalesce(sub_pagos.c.total_pagos, 0).label("total_pagos"),
        (sub_ventas.c.total_ventas - func.coalesce(sub_pagos.c.total_pagos, 0)).label("deuda")
    )\
    .join(sub_ventas, Cliente.id == sub_ventas.c.cliente_id)\
    .outerjoin(sub_pagos, Cliente.id == sub_pagos.c.cliente_id)\
    .filter((sub_ventas.c.total_ventas - func.coalesce(sub_pagos.c.total_pagos, 0)) > 0)\
    .all()

    return [
        {
            "id": r.id,
            "nombre": r.nombre,
            "total_ventas": r.total_ventas,
            "total_pagos": r.total_pagos,
            "deuda": r.deuda
        }
        for r in resultado
    ]

@app.put("/clientes/{cliente_id}")
def editar_cliente(cliente_id: int, datos: schemas.ClienteCreate, db: Session = Depends(get_db)):

    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        return {"error": "Cliente no existe"}

    cliente.nombre = datos.nombre
    cliente.telefono = datos.telefono

    db.commit()
    db.refresh(cliente)

    return cliente

@app.delete("/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):

    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()

    if not cliente:
        return {"error": "Cliente no existe"}

    db.delete(cliente)
    db.commit()

    return {"mensaje": "Cliente eliminado"}

@app.put("/ventas/{venta_id}")
def editar_venta(venta_id: int, datos: schemas.VentaUpdate, db: Session = Depends(get_db)):

    venta = db.query(Venta).filter(Venta.id == venta_id).first()

    if not venta:
        return {"error": "Venta no existe"}

    venta.descripcion = datos.descripcion
    venta.tipo_pago = datos.tipo_pago.lower()
    venta.total = datos.total
    venta.cliente_id = datos.cliente_id

    db.commit()
    db.refresh(venta)

    return venta

@app.delete("/ventas/{venta_id}")
def eliminar_venta(venta_id: int, db: Session = Depends(get_db)):

    venta = db.query(Venta).filter(Venta.id == venta_id).first()

    if not venta:
        return {"error": "Venta no existe"}

    db.delete(venta)
    db.commit()

    return {"mensaje": "Venta eliminada"}

@app.put("/pagos/{pago_id}")
def editar_pago(pago_id: int, datos: schemas.PagoCreate, db: Session = Depends(get_db)):

    pago = db.query(Pago).filter(Pago.id == pago_id).first()

    if not pago:
        return {"error": "Pago no existe"}

    pago.monto = datos.monto
    pago.cliente_id = datos.cliente_id

    db.commit()
    db.refresh(pago)

    return pago

@app.delete("/pagos/{pago_id}")
def eliminar_pago(pago_id: int, db: Session = Depends(get_db)):

    pago = db.query(Pago).filter(Pago.id == pago_id).first()

    if not pago:
        return {"error": "Pago no existe"}

    db.delete(pago)
    db.commit()

    return {"mensaje": "Pago eliminado"}

@app.put("/gastos/{gasto_id}")
def editar_gasto(gasto_id: int, datos: schemas.GastoCreate, db: Session = Depends(get_db)):

    gasto = db.query(Gasto).filter(Gasto.id == gasto_id).first()

    if not gasto:
        return {"error": "Gasto no existe"}

    gasto.descripcion = datos.descripcion
    gasto.monto = datos.monto

    db.commit()
    db.refresh(gasto)

    return gasto

@app.delete("/gastos/{gasto_id}")
def eliminar_gasto(gasto_id: int, db: Session = Depends(get_db)):

    gasto = db.query(Gasto).filter(Gasto.id == gasto_id).first()

    if not gasto:
        return {"error": "Gasto no existe"}

    db.delete(gasto)
    db.commit()

    return {"mensaje": "Gasto eliminado"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}