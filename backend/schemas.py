from pydantic import BaseModel


class ClienteCreate(BaseModel):
    nombre: str
    telefono: str | None = None


class VentaItemIn(BaseModel):
    producto_id: int
    cantidad: int


class VentaCreate(BaseModel):
    cliente_id: int
    tipo_pago: str
    items: list[VentaItemIn]


class ProductoCreate(BaseModel):
    codigo: str
    nombre: str
    precio: float
    controla_stock: bool = False
    stock: int | None = None


class StockUpdate(BaseModel):
    stock: int


class PagoCreate(BaseModel):
    cliente_id: int
    monto: float


class GastoCreate(BaseModel):
    descripcion: str
    monto: float


class VentaUpdate(BaseModel):
    descripcion: str
    tipo_pago: str
    total: float
    cliente_id: int


# ----------------- Autenticación / multiempresa -----------------

class RegistroRequest(BaseModel):
    tipo: str  # "empresario" (crea empresa) o "usuario" (se une con código)
    nombre: str
    username: str
    password: str
    email: str | None = None
    empresa_nombre: str | None = None   # requerido si tipo == "empresario"
    empresa_codigo: str | None = None   # requerido si tipo == "usuario"


class LoginRequest(BaseModel):
    username: str
    password: str


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    username: str
    email: str | None = None
    telefono: str | None = None
    empresa_id: int
    empresa_nombre: str | None = None
    empresa_codigo: str | None = None
    empresa_logo: str | None = None
    empresa_tema: str | None = None
    rol: str

    class Config:
        from_attributes = True


class PerfilUpdate(BaseModel):
    nombre: str
    username: str
    email: str | None = None
    telefono: str | None = None


class LogoUpdate(BaseModel):
    logo: str | None = None


class PasswordChange(BaseModel):
    actual: str
    nueva: str


class TemaUpdate(BaseModel):
    tema: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class EmpresaNombreUpdate(BaseModel):
    nombre: str


class RolUpdate(BaseModel):
    rol: str


class EmpleadoOut(BaseModel):
    id: int
    nombre: str
    username: str
    email: str | None = None
    rol: str

    class Config:
        from_attributes = True
