from datetime import timedelta
from core.security import (
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_password_hash,
)
from api.deps import get_user_from_db
from schemas.token import Token

async def authenticate_user(username: str, password: str):
    # Aquí harías una consulta a BD para obtener el usuario
    user = await get_user_from_db(username)  # Función de tu repo
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

async def login_for_access_token(username: str, password: str) -> Token:
    user = await authenticate_user(username, password)
    if not user:
        raise Exception("Credenciales inválidas")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")