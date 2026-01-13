from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.v1.api import api_router
from contextlib import asynccontextmanager
from core.database import User, create_db_and_tables
from schemas.user import UserCreate, UserRead, UserUpdate
from core.users import auth_backend, fastapi_users, current_active_user

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
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
                    prefix="/auth/jwt", tags=["auth"])
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)