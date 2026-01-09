from fastapi import APIRouter
from api.v1.endpoints import actions, auth

api_router = APIRouter()
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])