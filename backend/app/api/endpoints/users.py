from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from app.api import deps
from app.models.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    *,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    skills: list[str] = Body(None),
    experience_level: str = Body(None),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    user_data = jsonable_encoder(current_user)
    update_data = {}
    if skills is not None:
        update_data["skills"] = skills
    if experience_level is not None:
        update_data["experience_level"] = experience_level
        
    if update_data:
        await db.users.update_one(
            {"_id": current_user.id}, {"$set": update_data}
        )
        
    # Fetch updated
    # Note: user_id is generic objectId in pymongo, need to query
    from bson import ObjectId
    updated_user = await db.users.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    return User(**updated_user)
