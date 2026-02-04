from abc import ABC, abstractmethod
import json
import os
from openai import AsyncOpenAI
from app.services.prompts import GENERATE_QUESTIONS_PROMPT, EVALUATE_ANSWER_PROMPT

class LLMProvider(ABC):
    @abstractmethod
    async def generate_question(self, role: str, difficulty: str, topic: str = "General") -> str:
        pass

    @abstractmethod
    async def evaluate_answer(self, role: str, question: str, user_answer: str) -> dict:
        pass

class OllamaProvider(LLMProvider):
    def __init__(self, model_name: str = "mistral"):
        # Ollama usually exposes an OpenAI compatible API at /v1 or we can use raw HTTP
        # Using OpenAI client for compatibility with generic local setups usually working on localhost:11434/v1
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        self.client = AsyncOpenAI(
            base_url=base_url,
            api_key="ollama", # required but ignored
        )
        self.model_name = model_name

    async def generate_question(self, role: str, difficulty: str, topic: str = "General") -> str:
        prompt = GENERATE_QUESTIONS_PROMPT.format(role=role, difficulty=difficulty, topic=topic)
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

    async def evaluate_answer(self, role: str, question: str, user_answer: str) -> dict:
        prompt = EVALUATE_ANSWER_PROMPT.format(role=role, question=question, user_answer=user_answer)
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"} # valid for models that support it
        )
        
        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback if model doesn't return pure JSON
            # In production, we'd use a robust parser/retry logic
            print(f"Failed to parse JSON: {content}")
            return {
                "score": 0, 
                "correctness": "Error", 
                "feedback": "AI Error in processing response.",
                "ideal_answer": "N/A",
                "improvement_tips": [],
                "missing_points": [] 
            }

class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model_name: str = "mixtral-8x7b-32768"):
        self.client = AsyncOpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=api_key,
        )
        self.model_name = model_name

    async def generate_question(self, role: str, difficulty: str, topic: str = "General") -> str:
        prompt = GENERATE_QUESTIONS_PROMPT.format(role=role, difficulty=difficulty, topic=topic)
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()

    async def evaluate_answer(self, role: str, question: str, user_answer: str) -> dict:
        prompt = EVALUATE_ANSWER_PROMPT.format(role=role, question=question, user_answer=user_answer)
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"} # valid for models that support it
        )
        return json.loads(response.choices[0].message.content)

# Factory
def get_llm_service() -> LLMProvider:
    # Logic to switch based on env vars
    # For now default to Ollama, but user might want Groq
    # We can check if GROQ_API_KEY is set
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        return GroqProvider(api_key=groq_key)
    return OllamaProvider()
