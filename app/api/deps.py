from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from core.security import SECRET_KEY, ALGORITHM, TokenData
from sqlalchemy.orm import Session
from core.database import get_db
from repositories.user_repo import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credential_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credential_exception
    
    # Aquí obtendrías el usuario de la BD
    user = await get_user_from_db(username=token_data.username)
    if user is None:
        raise credential_exception
    return user

async def get_user_from_db(username: str, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.get_by_username(username)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user