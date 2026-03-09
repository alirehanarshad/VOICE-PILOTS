import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

async def list_models():
    load_dotenv()
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("No API Key")
        return
    
    client = AsyncGroq(api_key=api_key)
    try:
        models = await client.models.list()
        print("Available Models:")
        for model in models.data:
            print(f"- {model.id}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
