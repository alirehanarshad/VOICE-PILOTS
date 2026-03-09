"""
Custom uvicorn launcher that forces ProactorEventLoop on Windows BEFORE
uvicorn creates the event loop — solving the StatReload subprocess issue.
"""
import asyncio
import platform
import sys

# CRITICAL: Set BEFORE importing uvicorn, so it picks up the policy
if platform.system() == "Windows":
    try:
        from asyncio import WindowsProactorEventLoopPolicy
        asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())
        print("[Launcher] ProactorEventLoop policy set successfully.")
    except ImportError:
        print("[Launcher] WARNING: Could not set ProactorEventLoop.")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
