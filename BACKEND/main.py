import platform
import asyncio
import sys

if platform.system() == 'Windows':
    try:
        from asyncio import WindowsProactorEventLoopPolicy
        asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())
        print("  [Startup] Windows Proactor Event Loop Policy FORCED at Top Level.")
    except Exception as e:
        print(f"  [Startup] Failed to set ProactorEventLoopPolicy: {e}")
# --------------------------------------------

import io

# Force UTF-8 encoding for stdout/stderr to fix Windows encoding issues
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from api import chat, voice, websocket, memory, contact
from config.settings import settings

app = FastAPI(title="AI Voice Assistant Backend")

@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_event_loop()
    print(f"  [Startup] Event loop: {type(loop).__name__}")
    if platform.system() == 'Windows' and not isinstance(loop, asyncio.ProactorEventLoop):
        print("  [Startup] WARNING: Not using ProactorEventLoop on Windows! Subprocesses may fail.")

# Ensure static directories exist
os.makedirs(settings.TTS_OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.REFERENCE_VOICES_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(websocket.router, prefix="/api/ws", tags=["websocket"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])

@app.get("/")
async def root():
    return {"message": "AI Voice Assistant API is running"}
