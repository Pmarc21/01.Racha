from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base


class DailyPoints(Base):
    __tablename__ = "daily_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("user.id"), nullable=False)
    date = Column(DateTime, default=datetime.now, nullable=False)
    total_points = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="daily_points")
