from pydantic import BaseModel, Field


class ClienteCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    telefono: str | None = Field(None, max_length=30)


class VentaItemIn(BaseModel):
    producto_id: int
    cantidad: int = Field(..., ge=1, le=10_000)


class VentaCreate(BaseModel):
    cliente_id: int
    tipo_pago: str = Field(..., max_length=20)
    items: list[VentaItemIn]


class ProductoCreate(BaseModel):
    codigo: str | None = Field(None, max_length=50)  # se genera automáticamente
    nombre: str = Field(..., min_length=1, max_length=200)
    precio: float = Field(..., ge=0, le=100_000_000)
    controla_stock: bool = False
    stock: int | None = Field(None, ge=0)


class StockUpdate(BaseModel):
    stock: int = Field(..., ge=0)


class PagoCreate(BaseModel):
    cliente_id: int
    monto: float = Field(..., gt=0, le=100_000_000)
    venta_id: int | None = None


class GastoCreate(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=300)
    monto: float = Field(..., gt=0, le=100_000_000)


class VentaUpdate(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=300)
    tipo_pago: str = Field(..., max_length=20)
    total: float = Field(..., gt=0, le=100_000_000)
    cliente_id: int


# ----------------- Autenticación / multiempresa -----------------

class RegistroRequest(BaseModel):
    tipo: str = Field(..., max_length=20)
    nombre: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8, max_length=128)
    email: str | None = Field(None, max_length=200)
    empresa_nombre: str | None = Field(None, max_length=100)
    empresa_codigo: str | None = Field(None, max_length=20)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=200)


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
    nombre: str = Field(..., min_length=1, max_length=100)
    username: str = Field(..., min_length=3, max_length=30)
    email: str | None = Field(None, max_length=200)
    telefono: str | None = Field(None, max_length=30)


class LogoUpdate(BaseModel):
    logo: str | None = Field(None, max_length=200_000)


class PasswordChange(BaseModel):
    actual: str = Field(..., min_length=1, max_length=200)
    nueva: str = Field(..., min_length=8, max_length=128)


class TemaUpdate(BaseModel):
    tema: str = Field(..., max_length=20)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class EmpresaNombreUpdate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)


class RolUpdate(BaseModel):
    rol: str = Field(..., max_length=20)


class EmpleadoOut(BaseModel):
    id: int
    nombre: str
    username: str
    email: str | None = None
    rol: str

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    usuario: UsuarioOut
