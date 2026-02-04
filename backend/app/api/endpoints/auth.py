from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.api import deps
from app.core import security
from app.models.user import UserCreate, User, UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()

@router.post("/register", response_model=User)
async def register(
    user_in: UserCreate,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Create new user.
    """
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user_data = user_in.dict()
    hashed_password = security.get_password_hash(user_data.pop("password"))
    user_data["hashed_password"] = hashed_password
    
    # Insert
    result = await db.users.insert_one(user_data)
    
    # Return created user
    new_user = await db.users.find_one({"_id": result.inserted_id})
    new_user["_id"] = str(new_user["_id"])
    
    return User(**new_user)

@router.post("/login")
async def login(
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await db.users.find_one({"email": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {
        "access_token": security.create_access_token(user["_id"]),
        "token_type": "bearer",
    }
