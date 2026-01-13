from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from core.security import SECRET_KEY, ALGORITHM, TokenData
from sqlalchemy.orm import Session
from core.database import get_db
from repositories.user_repo import UserRepository
