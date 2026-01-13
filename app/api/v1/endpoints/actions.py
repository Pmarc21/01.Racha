from fastapi import APIRouter, Depends
from schemas.actions import ActionCreate

router = APIRouter()

@router.get("")
def get_action():
    return {"message":"hello"}

@router.post("", response_model=ActionCreate)
def create_action(
    action: ActionCreate,
)-> ActionCreate:
    return {"message":"action_created"}
