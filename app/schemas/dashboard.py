from pydantic import BaseModel
from datetime import date


class ActionStatus(BaseModel):
    key: str
    label: str
    emoji: str
    points: int
    completed: bool


class DashboardResponse(BaseModel):
    date: date
    actions: list[ActionStatus]
    today_points: int
    total_points: int


class ToggleResponse(BaseModel):
    action_key: str
    completed: bool
    today_points: int
    total_points: int


class DayDetail(BaseModel):
    date: date
    points: int
    actions: list[str]


class HistoryResponse(BaseModel):
    days: list[DayDetail]
    max_daily_points: int
