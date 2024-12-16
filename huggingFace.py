from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os


load_dotenv()

client = InferenceClient(api_key=os.getenv("API_KEY"))

messages = [
    {
        "role": "user",
        "content": "What is the capital of France?"
    }
]

completion = client.chat.completions.create(
    model="meta-llama/Llama-3.2-1B",
    messages=messages,
    max_tokens=500
)

print(completion.choices[0].message)
