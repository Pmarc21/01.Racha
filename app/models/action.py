from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base
from models.user import User

class Action(Base):
    __tablename__ = "actions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(100), unique=True, index=True, nullable=False)
    points = Column(Integer, nullable=False)
    user = Column(User)
    created_at = Column(DateTime, default=datetime.now())

    user = relationship("User", back_populates="actions")

