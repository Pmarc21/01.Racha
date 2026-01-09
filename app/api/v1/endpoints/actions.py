from fastapi import APIRouter, Depends
from schemas.actions import ActionCreate
# from services.actions_service import apply_action
from api.deps import get_current_user

router = APIRouter()

@router.get("")
def create_action():
    return {"message":"hello"}
# @router.post("", response_model=ActionCreate)
# def create_action(
#     action: ActionCreate,
#     user=Depends(get_current_user),
# ):
#     return apply_action(user.id, action)
