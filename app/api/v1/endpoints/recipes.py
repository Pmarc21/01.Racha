from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.database import User, get_async_session
from core.users import current_active_user
from models.recipe import Recipe, RecipeIngredient
from schemas.recipe import RecipeCreate, RecipeOut

router = APIRouter()


@router.get("", response_model=list[RecipeOut])
async def list_recipes(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(Recipe)
        .where(Recipe.user_id == user.id)
        .options(selectinload(Recipe.ingredients))
        .order_by(Recipe.name)
    )
    return result.scalars().all()


@router.post("", response_model=RecipeOut)
async def create_recipe(
    data: RecipeCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    recipe = Recipe(user_id=user.id, name=data.name, meal_type=data.meal_type, notes=data.notes)
    for ing in data.ingredients:
        recipe.ingredients.append(
            RecipeIngredient(name=ing.name, quantity=ing.quantity, unit=ing.unit)
        )
    session.add(recipe)
    await session.commit()
    await session.refresh(recipe, ["ingredients"])
    return recipe


@router.put("/{recipe_id}", response_model=RecipeOut)
async def update_recipe(
    recipe_id: int,
    data: RecipeCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id, Recipe.user_id == user.id)
        .options(selectinload(Recipe.ingredients))
    )
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    recipe.name = data.name
    recipe.meal_type = data.meal_type
    recipe.notes = data.notes

    # Replace ingredients
    recipe.ingredients.clear()
    for ing in data.ingredients:
        recipe.ingredients.append(
            RecipeIngredient(name=ing.name, quantity=ing.quantity, unit=ing.unit)
        )

    await session.commit()
    await session.refresh(recipe, ["ingredients"])
    return recipe


@router.delete("/{recipe_id}")
async def delete_recipe(
    recipe_id: int,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(Recipe).where(Recipe.id == recipe_id, Recipe.user_id == user.id)
    )
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    await session.delete(recipe)
    await session.commit()
    return {"ok": True}
