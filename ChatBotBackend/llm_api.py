from ollama import chat
from typing import Optional

def get_llm_response(prompt: str, model: str = 'llama3.2') -> Optional[str]:
    print(f"Getting LLM response for prompt: {prompt}")
    try:
        response = chat(model=model, messages=[{
            'role': 'user',
            'content': prompt,
        }])
        return response.message.content
    except Exception as e:
        print(f"Error getting LLM response: {str(e)}")
        return None