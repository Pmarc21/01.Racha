from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base


class WeeklyMenu(Base):
    __tablename__ = "weekly_menu"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", "day_of_week", "meal_type", "recipe_id", name="uq_menu_slot_recipe"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    week_start = Column(Date, nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    meal_type = Column(String(20), nullable=False)  # comida, cena
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    servings = Column(Integer, nullable=False, default=1)

    recipe = relationship("Recipe")
