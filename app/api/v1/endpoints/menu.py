from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import date

from core.database import User, get_async_session
from core.users import current_active_user
from models.weekly_menu import WeeklyMenu
from models.recipe import Recipe, RecipeIngredient
from schemas.menu import (
    MenuSlotIn, MenuSlotOut, MenuWeekResponse,
    ShoppingItem, ShoppingListResponse,
)

router = APIRouter()

VALID_MEALS = {"comida", "cena"}


@router.get("", response_model=MenuWeekResponse)
async def get_menu(
    week_start: date = Query(...),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(WeeklyMenu)
        .where(WeeklyMenu.user_id == user.id, WeeklyMenu.week_start == week_start)
        .options(selectinload(WeeklyMenu.recipe))
    )
    rows = result.scalars().all()

    slots = [
        MenuSlotOut(
            id=r.id,
            day_of_week=r.day_of_week,
            meal_type=r.meal_type,
            recipe_id=r.recipe_id,
            recipe_name=r.recipe.name,
            servings=r.servings,
        )
        for r in rows
    ]
    return MenuWeekResponse(week_start=week_start, slots=slots)


@router.put("/slot", response_model=MenuSlotOut)
async def set_slot(
    data: MenuSlotIn,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    if data.meal_type not in VALID_MEALS:
        raise HTTPException(status_code=400, detail="meal_type debe ser comida o cena")
    if not 0 <= data.day_of_week <= 6:
        raise HTTPException(status_code=400, detail="day_of_week debe ser 0-6")

    recipe = await session.execute(
        select(Recipe).where(Recipe.id == data.recipe_id, Recipe.user_id == user.id)
    )
    recipe = recipe.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    existing = await session.execute(
        select(WeeklyMenu).where(
            WeeklyMenu.user_id == user.id,
            WeeklyMenu.week_start == data.week_start,
            WeeklyMenu.day_of_week == data.day_of_week,
            WeeklyMenu.meal_type == data.meal_type,
            WeeklyMenu.recipe_id == data.recipe_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Receta ya asignada a este slot")

    slot = WeeklyMenu(
        user_id=user.id,
        week_start=data.week_start,
        day_of_week=data.day_of_week,
        meal_type=data.meal_type,
        recipe_id=data.recipe_id,
        servings=data.servings,
    )
    session.add(slot)
    await session.commit()

    return MenuSlotOut(
        id=slot.id,
        day_of_week=slot.day_of_week,
        meal_type=slot.meal_type,
        recipe_id=slot.recipe_id,
        recipe_name=recipe.name,
        servings=slot.servings,
    )


@router.delete("/slot/{slot_id}")
async def remove_slot(
    slot_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(WeeklyMenu).where(WeeklyMenu.id == slot_id, WeeklyMenu.user_id == user.id)
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot no encontrado")
    await session.delete(slot)
    await session.commit()
    return {"ok": True}


@router.get("/shopping-list", response_model=ShoppingListResponse)
async def shopping_list(
    week_start: date = Query(...),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(WeeklyMenu)
        .where(WeeklyMenu.user_id == user.id, WeeklyMenu.week_start == week_start)
    )
    menu_rows = result.scalars().all()
    recipe_ids = [r.recipe_id for r in menu_rows]

    if not recipe_ids:
        return ShoppingListResponse(week_start=week_start, items=[])

    # Map recipe_id -> total servings across the week
    recipe_servings: dict[int, int] = defaultdict(int)
    for r in menu_rows:
        recipe_servings[r.recipe_id] += r.servings

    result = await session.execute(
        select(RecipeIngredient)
        .where(RecipeIngredient.recipe_id.in_(set(recipe_ids)))
    )
    ingredients = result.scalars().all()

    aggregated: dict[tuple[str, str], float] = defaultdict(float)
    name_display: dict[str, str] = {}

    for ing in ingredients:
        key = (ing.name.lower().strip(), ing.unit.lower().strip())
        try:
            qty = float(ing.quantity.replace(",", "."))
        except ValueError:
            qty = 1.0
        aggregated[key] += qty * recipe_servings[ing.recipe_id]
        name_display[ing.name.lower().strip()] = ing.name.strip()

    items = [
        ShoppingItem(
            name=name_display[name],
            quantity=round(qty, 2),
            unit=unit,
        )
        for (name, unit), qty in sorted(aggregated.items())
    ]

    return ShoppingListResponse(week_start=week_start, items=items)
