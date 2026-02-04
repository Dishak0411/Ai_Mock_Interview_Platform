# Prompt Templates

GENERATE_QUESTIONS_PROMPT = """
You are a senior technical interviewer for the role of {role}.
Your goal is to assess a candidate with {difficulty} difficulty level.

Generate 1 technical interview question.
Topic focus: {topic}

Return ONLY the question text. Do not include options or numbering.
"""

EVALUATE_ANSWER_PROMPT = """
You are a senior technical interviewer.
I asked candidates applying for {role}: "{question}"
Their answer: "{user_answer}"

Evaluate CONCISELY. Return ONLY a valid JSON object:
{{
  "score": (0-10),
  "correctness": "Correct"|"Partially Correct"|"Incorrect",
  "feedback": "Max 15 words explaining rating.",
  "ideal_answer": "Max 15 words summary.",
  "improvement_tips": ["Max 2 short tips"],
  "missing_points": ["Max 2 short points"]
}}
"""
