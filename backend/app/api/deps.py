from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_db() -> AsyncIOMotorDatabase:
    db = await get_database()
    return db

async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    # GUEST MODE: If no token, return a guest user
    if not token:
        return User(
            id="guest_id_00000000000000", # Fixed ID for guest
            email="guest@example.com",
            full_name="Guest User",
            disabled=False
        )

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
             # Fallback to guest instead of error for smooth persistence
             return User(
                id="guest_id_00000000000000",
                email="guest@example.com",
                full_name="Guest User",
                disabled=False
            )
    except (JWTError, ValidationError):
         # Fallback to guest
         return User(
            id="guest_id_00000000000000",
            email="guest@example.com",
            full_name="Guest User",
            disabled=False
        )
    
    try:
        user_doc = await db.users.find_one({"_id": ObjectId(token_data)})
    except:
        user_doc = None

    if not user_doc:
         # Fallback to guest if user deleted but valid token
         return User(
            id="guest_id_00000000000000",
            email="guest@example.com",
            full_name="Guest User",
            disabled=False
        )
    
    # helper to convert _id to id string for pydantic
    user_doc["_id"] = str(user_doc["_id"])
    return User(**user_doc)
