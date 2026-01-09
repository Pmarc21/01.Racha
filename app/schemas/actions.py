from pydantic import BaseModel
from typing import Optional

class ActionBase(BaseModel):
    name: str
    description: Optional[str] = None
    points: int

class ActionCreate(ActionBase):
    pass
