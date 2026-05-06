from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
from models.base import Base


class ActionCompletion(Base):
    __tablename__ = "action_completions"
    __table_args__ = (
        UniqueConstraint("user_id", "action_key", "date", name="uq_user_action_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.id"), nullable=False)
    action_key = Column(String(50), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
