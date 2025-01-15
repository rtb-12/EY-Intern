from ollama import chat
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()

def get_llm_response(prompt: str, model: str = None) -> Optional[str]:
    print(f"Getting LLM response for prompt: {prompt}")
    try:
        model_name = model or os.getenv('LLM_MODEL')
        response = chat(model=model_name, messages=[{
            'role': 'user',
            'content': prompt,
        }])
        return response.message.content
    except Exception as e:
        print(f"Error getting LLM response: {str(e)}")
        return None