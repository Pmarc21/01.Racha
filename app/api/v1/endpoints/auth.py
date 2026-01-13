from fastapi import APIRouter
from fastapi_users.authentication import BearerTransport
from schemas.token import Token, UserLogin

router = APIRouter()
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")