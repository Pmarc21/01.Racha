from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.v1.api import api_router
from contextlib import asynccontextmanager
from app.core.db import User, create_db_and_tables
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.users import auth_backend, fastapi_users, current_active_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    await create_db_and_tables()
    yield
    # Shutdown code (if any)
app = FastAPI(title="Racha API", lifespan=lifespan)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(fastapi_users.get_auth_router(bearer_transport),
                    prefix="/auth/jwt", tags=["auth"])