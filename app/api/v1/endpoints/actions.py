from fastapi import APIRouter, Depends
from schemas.actions import ActionCreate
from api.deps import get_current_user

router = APIRouter()

@router.get("")
def get_action():
    return {"message":"hello"}

@router.post("", response_model=ActionCreate)
def create_action(
    action: ActionCreate,
    user=Depends(get_current_user),
)-> ActionCreate:
    return {"message":"action_created"}
