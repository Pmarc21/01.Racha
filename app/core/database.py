from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base
from models.action import Action
from models.user import User

DATABASE_URL = "postgresql://racha:racha@db:5432/racha"  # Ajusta según tu config

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Para crear las tablas al iniciar
Base.metadata.create_all(bind=engine)