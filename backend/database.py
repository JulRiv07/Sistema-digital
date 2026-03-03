from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

DATABASE_URL = "sqlite:///./postres.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
sessionLocal = sessionmaker(bind = engine)

Base = declarative_base()

def get_db():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()

