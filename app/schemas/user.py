from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # Para convertir ORM a dict