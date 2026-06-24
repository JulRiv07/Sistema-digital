import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Carga las variables de un archivo .env si existe (útil en local).
# En Render las variables se configuran en el dashboard.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()