from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func 
from backend.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key = True, index=True)
    nombre = Column(String, nullable=False)
    telefono = Column(String)
    creado_en = Column(DateTime(timezone=True), server_default = func.now())

class Venta(Base):
    __tablename__ = "ventas"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    tipo_pago = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    total = Column(Float, nullable=False)

class Pago(Base):
    __tablename__ = "Pagos"

    id = Column(Integer, primary_key=True, index = True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    fecha = Column(DateTime(timezone=True), server_default= func.now())
    monto = Column(Float, nullable=False)

class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key= True, index=True)
    fecha = Column(DateTime(timezone=True), server_default= func.now())
    descripcion = Column(String, nullable=False)
    monto = Column(Float, nullable=False)






