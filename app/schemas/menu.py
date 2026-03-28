from pydantic import BaseModel
from datetime import date


class MenuSlotIn(BaseModel):
    week_start: date
    day_of_week: int  # 0=Monday, 6=Sunday
    meal_type: str    # comida, cena
    recipe_id: int
    servings: int = 1


class MenuSlotOut(BaseModel):
    id: int
    day_of_week: int
    meal_type: str
    recipe_id: int
    recipe_name: str
    servings: int


class MenuWeekResponse(BaseModel):
    week_start: date
    slots: list[MenuSlotOut]


class ShoppingItem(BaseModel):
    name: str
    quantity: float
    unit: str


class ShoppingListResponse(BaseModel):
    week_start: date
    items: list[ShoppingItem]
