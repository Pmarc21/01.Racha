from pydantic import BaseModel


class IngredientIn(BaseModel):
    name: str
    quantity: str
    unit: str


class IngredientOut(BaseModel):
    id: int
    name: str
    quantity: str
    unit: str

    model_config = {"from_attributes": True}


class RecipeCreate(BaseModel):
    name: str
    meal_type: str
    notes: str = ""
    ingredients: list[IngredientIn]


class RecipeOut(BaseModel):
    id: int
    name: str
    meal_type: str
    notes: str
    ingredients: list[IngredientOut]

    model_config = {"from_attributes": True}
