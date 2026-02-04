from fastapi import APIRouter, Body
from app.services.ai_service import get_llm_service
from pydantic import BaseModel

router = APIRouter()

class GenerateRequest(BaseModel):
    role: str
    difficulty: str
    topic: str = "General"

class EvaluateRequest(BaseModel):
    role: str
    question: str
    user_answer: str

@router.post("/generate")
async def debug_generate_question(request: GenerateRequest):
    llm = get_llm_service()
    question = await llm.generate_question(
        role=request.role,
        difficulty=request.difficulty,
        topic=request.topic
    )
    return {"question": question}

@router.post("/evaluate")
async def debug_evaluate_answer(request: EvaluateRequest):
    llm = get_llm_service()
    evaluation = await llm.evaluate_answer(
        role=request.role,
        question=request.question,
        user_answer=request.user_answer
    )
    return evaluation
