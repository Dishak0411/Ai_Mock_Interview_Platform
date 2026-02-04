from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

# --- Schemas ---

class InterviewCreate(BaseModel):
    role: str
    difficulty: str
    mode: str = "Text" # Text or Voice

class Interview(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    role: str
    difficulty: str
    status: str = "InProgress" # InProgress, Completed
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    feedback_report: Optional[dict] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Question(BaseModel):
    id: Optional[str] = Field(alias="_id")
    interview_id: str
    question_text: str
    question_type: str = "Technical"
    order_index: int

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AnswerCreate(BaseModel):
    question_id: str
    user_answer_text: str

class AIEvaluation(BaseModel):
    score: int
    correctness: str
    feedback: str
    ideal_answer: str
    improvement_tips: List[str]
    missing_points: List[str]

class Answer(BaseModel):
    id: Optional[str] = Field(alias="_id")
    interview_id: str
    question_id: str
    user_answer_text: str
    ai_evaluation: AIEvaluation
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
