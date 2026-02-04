from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Body
from app.api import deps
from app.models.user import User
from app.models.interview import Interview, InterviewCreate, Question, Answer, AnswerCreate, AIEvaluation
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.ai_service import get_llm_service
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Interview)
async def start_interview(
    interview_in: InterviewCreate,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Start a new interview.
    """
    interview_data = interview_in.dict()
    interview_data["user_id"] = str(current_user.id)
    interview_data["started_at"] = datetime.utcnow()
    interview_data["status"] = "InProgress"
    
    result = await db.interviews.insert_one(interview_data)
    
    # Generate first question immediately? Or let client ask for it?
    # Let's let client ask for next question.
    
    interview = await db.interviews.find_one({"_id": result.inserted_id})
    interview["_id"] = str(interview["_id"])
    return Interview(**interview)

@router.get("/", response_model=List[Interview])
async def get_interviews(
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Get all interviews for current user.
    """
    interviews = []
    cursor = db.interviews.find({"user_id": str(current_user.id)}).sort("started_at", -1)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        interviews.append(Interview(**doc))
    return interviews

@router.get("/{interview_id}", response_model=Interview)
async def get_interview(
    interview_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    interview = await db.interviews.find_one({"_id": ObjectId(interview_id), "user_id": str(current_user.id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    interview["_id"] = str(interview["_id"])
    return Interview(**interview)

@router.post("/{interview_id}/next_question", response_model=Question)
async def next_question(
    interview_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Generate and retrieve the next question.
    """
    interview = await db.interviews.find_one({"_id": ObjectId(interview_id), "user_id": str(current_user.id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    if interview["status"] == "Completed":
        raise HTTPException(status_code=400, detail="Interview is already completed")

    # Count existing questions to determine order
    count = await db.questions.count_documents({"interview_id": interview_id})
    order_index = count + 1
    
    # Logic to limit questions: e.g., 10 questions max
    if order_index > 10:
         return HTTPException(status_code=400, detail="Max questions reached. Please complete the interview.")

    # Generate Question using AI
    llm_service = get_llm_service()
    question_text = await llm_service.generate_question(
        role=interview["role"], 
        difficulty=interview["difficulty"], 
        topic="General" # Can be dynamic based on history
    )
    
    question_data = {
        "interview_id": interview_id,
        "question_text": question_text,
        "question_type": "Technical",
        "order_index": order_index
    }
    
    result = await db.questions.insert_one(question_data)
    question = await db.questions.find_one({"_id": result.inserted_id})
    question["_id"] = str(question["_id"])
    return Question(**question)

@router.post("/{interview_id}/submit_answer", response_model=Answer)
async def submit_answer(
    interview_id: str,
    answer_in: AnswerCreate,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Submit answer and get evaluation.
    """
    interview = await db.interviews.find_one({"_id": ObjectId(interview_id), "user_id": str(current_user.id)})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
        
    question = await db.questions.find_one({"_id": ObjectId(answer_in.question_id)})
    if not question:
         raise HTTPException(status_code=404, detail="Question not found")

    # Evaluate using AI
    llm_service = get_llm_service()
    evaluation_dict = await llm_service.evaluate_answer(
        role=interview["role"],
        question=question["question_text"],
        user_answer=answer_in.user_answer_text
    )
    
    # Parse evaluation to match Schema roughly or store flexible
    ai_evaluation = AIEvaluation(**evaluation_dict)
    
    answer_data = {
        "interview_id": interview_id,
        "question_id": answer_in.question_id,
        "user_answer_text": answer_in.user_answer_text,
        "ai_evaluation": ai_evaluation.dict(),
        "created_at": datetime.utcnow()
    }
    
    result = await db.answers.insert_one(answer_data)
    answer = await db.answers.find_one({"_id": result.inserted_id})
    answer["_id"] = str(answer["_id"])
    return Answer(**answer)

@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    # 1. Fetch all answers
    answers_cursor = db.answers.find({"interview_id": interview_id})
    answers = await answers_cursor.to_list(length=100)
    
    if not answers:
        # No answers submitted
        average_score = 0
        overall_feedback = "No questions were answered."
    else:
        # 2. Calculate Stats
        total_score = sum(a["ai_evaluation"]["score"] for a in answers)
        average_score = round(total_score / len(answers), 1)
        
        # 3. Aggregate Feedback (Simple Calculation for Speed)
        # We could use LLM here for a summary, but let's stick to stats for instant results
        # as per user request for "faster".
        weak_areas = []
        strong_areas = []
        for a in answers:
            if a["ai_evaluation"]["score"] < 6:
                weak_areas.extend(a["ai_evaluation"].get("missing_points", []))
            else:
                strong_areas.append("Good understanding of tested concepts")
        
        # Deduplicate
        weak_areas = list(set(weak_areas))[:5] 
        
        feedback_report = {
            "overall_score": average_score,
            "total_questions": len(answers),
            "summary": f"Candidate scored {average_score}/10 on average.",
            "weak_areas": weak_areas,
            "strengths": list(set(strong_areas))[:3]
        }

    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {
            "status": "Completed", 
            "completed_at": datetime.utcnow(),
            "feedback_report": feedback_report if answers else None
        }}
    )
    return {"message": "Interview completed", "report": feedback_report if answers else None}
