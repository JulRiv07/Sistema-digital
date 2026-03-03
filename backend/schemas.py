from pydantic import BaseModel

class ClienteCreate(BaseModel):
    nombre : str
    telefono: str | None = None

class VentaCreate(BaseModel):
    cliente_id: int
    tipo_pago: str
    descripcion: str
    total: float

class PagoCreate(BaseModel):
    cliente_id : int
    monto : float

class GastoCreate(BaseModel):
    descripcion: str
    monto: float