import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure we can import from the app directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load env vars
load_dotenv()

from app.services.ai_service import OllamaProvider, GroqProvider, get_llm_service

async def test_ai():
    print("--- Starting AI Model Test ---")
    
    # 1. Initialize Provider
    # You can manually switch to GroqProvider("your-key") if you want to test that
    try:
        # provider = get_llm_service() # Uses env vars
        # Forcing Ollama for this test unless you have GROQ_API_KEY set
        provider = OllamaProvider(model_name="mistral") 
        print(f"✅ AI Provider Initialized: {provider.__class__.__name__}")
    except Exception as e:
        print(f"❌ Failed to initialize AI Provider: {e}")
        return

    # 2. Test Question Generation
    print("\n[Test 1] Generating Question for 'Backend Developer' (Medium)...")
    try:
        question = await provider.generate_question(
            role="Backend Developer", 
            difficulty="Medium", 
            topic="Database Design"
        )
        print(f"⬇️  Generated Question:\n{question}")
    except Exception as e:
        print(f"❌ Question Generation Failed: {e}")

    # 3. Test Answer Evaluation
    mock_question = "Explain the difference between SQL and NoSQL databases."
    mock_answer = "SQL is relational and uses tables. NoSQL is non-relational and uses documents or key-pairs. SQL scales vertically, NoSQL scales horizontally."
    
    print(f"\n[Test 2] Evaluating Sample Answer...")
    print(f"Question: {mock_question}")
    print(f"Answer: {mock_answer}")
    
    try:
        evaluation = await provider.evaluate_answer(
            role="Backend Developer",
            question=mock_question,
            user_answer=mock_answer
        )
        print("⬇️  AI Evaluation Result:")
        import json
        print(json.dumps(evaluation, indent=2))
    except Exception as e:
        print(f"❌ Answer Evaluation Failed: {e}")

    print("\n--- Test Complete ---")

if __name__ == "__main__":
    asyncio.run(test_ai())
