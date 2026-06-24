from pydantic import BaseModel


class ClienteCreate(BaseModel):
    nombre: str
    telefono: str | None = None


class VentaCreate(BaseModel):
    cliente_id: int
    tipo_pago: str
    descripcion: str
    total: float


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
    empresa_nombre: str
    nombre: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    email: str
    empresa_id: int
    rol: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
