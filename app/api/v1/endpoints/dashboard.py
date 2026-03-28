from datetime import date
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.actions import PREDEFINED_ACTIONS
from core.database import User, get_async_session
from core.users import current_active_user
from models.action_completion import ActionCompletion
from schemas.dashboard import (
    ActionStatus, DashboardResponse, ToggleResponse,
    DayDetail, HistoryResponse,
)

router = APIRouter()


async def _compute_total_points(session: AsyncSession, user_id) -> int:
    result = await session.execute(
        select(ActionCompletion.action_key, func.count())
        .where(ActionCompletion.user_id == user_id)
        .group_by(ActionCompletion.action_key)
    )
    total = 0
    for action_key, count in result.all():
        action = PREDEFINED_ACTIONS.get(action_key)
        if action:
            total += action["points"] * count
    return total


async def _today_completions(session: AsyncSession, user_id) -> set[str]:
    result = await session.execute(
        select(ActionCompletion.action_key)
        .where(ActionCompletion.user_id == user_id, ActionCompletion.date == date.today())
    )
    return {row[0] for row in result.all()}


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    completed_today = await _today_completions(session, user.id)
    total_points = await _compute_total_points(session, user.id)

    actions = []
    today_points = 0
    for key, action in PREDEFINED_ACTIONS.items():
        done = key in completed_today
        if done:
            today_points += action["points"]
        actions.append(ActionStatus(
            key=key,
            label=action["label"],
            emoji=action["emoji"],
            points=action["points"],
            completed=done,
        ))

    return DashboardResponse(
        date=date.today(),
        actions=actions,
        today_points=today_points,
        total_points=total_points,
    )


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    year: int = Query(...),
    month: int = Query(...),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1)
    else:
        last_day = date(year, month + 1, 1)

    result = await session.execute(
        select(ActionCompletion.date, ActionCompletion.action_key)
        .where(
            ActionCompletion.user_id == user.id,
            ActionCompletion.date >= first_day,
            ActionCompletion.date < last_day,
        )
        .order_by(ActionCompletion.date)
    )

    days_map: dict[date, list[str]] = defaultdict(list)
    for row_date, action_key in result.all():
        days_map[row_date].append(action_key)

    max_daily = sum(a["points"] for a in PREDEFINED_ACTIONS.values())

    days = []
    for d, action_keys in sorted(days_map.items()):
        points = sum(
            PREDEFINED_ACTIONS[k]["points"] for k in action_keys if k in PREDEFINED_ACTIONS
        )
        days.append(DayDetail(date=d, points=points, actions=action_keys))

    return HistoryResponse(days=days, max_daily_points=max_daily)


@router.post("/{action_key}/toggle", response_model=ToggleResponse)
async def toggle_action(
    action_key: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    if action_key not in PREDEFINED_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Acción '{action_key}' no existe")

    today = date.today()

    existing = await session.execute(
        select(ActionCompletion)
        .where(
            ActionCompletion.user_id == user.id,
            ActionCompletion.action_key == action_key,
            ActionCompletion.date == today,
        )
    )
    row = existing.scalar_one_or_none()

    if row:
        await session.delete(row)
        completed = False
    else:
        session.add(ActionCompletion(user_id=user.id, action_key=action_key, date=today))
        completed = True

    await session.commit()

    completed_today = await _today_completions(session, user.id)
    today_points = sum(
        PREDEFINED_ACTIONS[k]["points"] for k in completed_today if k in PREDEFINED_ACTIONS
    )
    total_points = await _compute_total_points(session, user.id)

    return ToggleResponse(
        action_key=action_key,
        completed=completed,
        today_points=today_points,
        total_points=total_points,
    )
