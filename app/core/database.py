from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import UserBase
from models.action import Base as ActionBase

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
UserBase.metadata.create_all(bind=engine)
ActionBase.metadata_create_all(bind=engine)