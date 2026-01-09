from pydantic import BaseModel
from typing import Optional
from schemas.user import User

class ActionBase(BaseModel):
    name: str
    description: Optional[str] = None
    points: int
    user_id: User.id

class ActionCreate(ActionBase):
    pass
