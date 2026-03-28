from fastapi import APIRouter
from api.v1.endpoints import actions

api_router = APIRouter()
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])