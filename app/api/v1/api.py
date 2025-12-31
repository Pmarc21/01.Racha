from fastapi import APIRouter
from app.api.v1.endpoints import actions, categories, dashboard, health, points

api_router = APIRouter()
api_router.include_router(actions.router, prefix="/actions", tags=["actions"])
# api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
# api_router.include_router(health.router, prefix="/health", tags=["health"])
# api_router.include_router(points.router, prefix="/points", tags=["points"])
