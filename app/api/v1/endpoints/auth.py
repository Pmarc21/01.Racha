from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from schemas.token import Token, UserLogin
from api.deps import get_current_user
from services.auth_service import login_for_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_for_access_token(form_data.username, form_data.password)

@router.post("/token", response_model=Token)
async def login_for_token(user: UserLogin):
    return await login_for_access_token(user.username, user.password)

@router.get("/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user