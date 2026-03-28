from fastapi import APIRouter
from api.v1.endpoints import actions, dashboard, recipes, menu

api_router = APIRouter()
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
