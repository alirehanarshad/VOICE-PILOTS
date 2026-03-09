from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from stt.service import STTService
from brain.llm import LLMHandler
from brain.memory import MemoryHandler
from brain.actions import ActionHandler
from brain.router import IntentRouter
from typing import Optional
import traceback

router = APIRouter()
stt_service = STTService()

from brain.service import intent_router


@router.post("/process")
async def process_voice(file: UploadFile = File(...), pilot: Optional[str] = Form(None)):
    """
    Voice processing endpoint.
    
    Flow: Audio → STT → Brain Pipeline → Response
    """
    print(f"\n--- [VOICE API] New Request ---")
    
    try:
        # Read the uploaded file
        audio_content = await file.read()
        content_size = len(audio_content)
        
        print(f"  [VOICE API] Audio bytes received: {content_size} bytes")
        
        if content_size < 100:
            return JSONResponse(status_code=400, content={"error": "Empty audio"})

        # Transcribe audio via robust STT service
        transcript = await stt_service.transcribe(audio_content, pilot_name=pilot)
        
        return {
            "user_transcript": transcript or "",
            "ai_response": None,
            "intent": "conversation",
            "output_type": "response",
            "audio_url": None,
            "action_data": None
        }
    except Exception as e:
        print(f"  [VOICE API] Failure: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
