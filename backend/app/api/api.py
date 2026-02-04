from fastapi import APIRouter
from app.api.endpoints import auth, users, interviews, ai_debug

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(ai_debug.router, prefix="/ai-debug", tags=["ai-debug"])


