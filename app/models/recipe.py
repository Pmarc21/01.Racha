from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.id"), nullable=False)
    name = Column(String(100), nullable=False)
    meal_type = Column(String(20), nullable=False, default="comida")  # comida, cena
    notes = Column(Text, nullable=True, default="")

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    quantity = Column(String(20), nullable=False)
    unit = Column(String(30), nullable=False)

    recipe = relationship("Recipe", back_populates="ingredients")
