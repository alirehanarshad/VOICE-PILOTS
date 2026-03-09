from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from brain.llm import LLMHandler
from brain.memory import MemoryHandler
from brain.actions import ActionHandler
from brain.router import IntentRouter

router = APIRouter()

from brain.service import intent_router


class ChatMessage(BaseModel):
    message: str
    pilot: Optional[str] = None
    session_id: Optional[str] = "default"


@router.post("/")
async def chat_endpoint(chat_msg: ChatMessage):
    """
    Main chat endpoint — processes text through the brain pipeline.
    
    Flow: User Message → Intent Router → LLM/Action → Response
    """
    print(f"\n--- [CHAT API] New Message: {chat_msg.message} ---")

    result = await intent_router.process(
        user_message=chat_msg.message,
        session_id=chat_msg.session_id or "default",
        pilot_name=chat_msg.pilot or "Assistant"
    )

    # Generate TTS for conversational responses
    audio_url = None
    if result.get("output_type") == "response":
        from tts.edge_tts_service import tts_service
        audio_url = await tts_service.generate_speech(
            text=result["response"],
            agent_name=chat_msg.pilot or "Sofia"
        )

    return {
        "user_message": chat_msg.message,
        "ai_response": result["response"],
        "intent": result["intent"],
        "output_type": result.get("output_type", "response"),
        "audio_url": audio_url,
        "action_data": result.get("action_data"),
        "task_file": result.get("task_file")
    }
