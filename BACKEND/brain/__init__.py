"""
Brain Module - The intelligence core of the AI Voice Assistant.

Components:
    - LLMHandler: OpenAI Chat Completions integration
    - MemoryHandler: Conversation history management
    - IntentRouter: Classifies user input as conversation vs action
    - ActionHandler: Orchestrates action execution (future MCP integration)
    - Prompts: System prompts and prompt templates
"""

from brain.llm import LLMHandler
from brain.memory import MemoryHandler
from brain.router import IntentRouter
from brain.actions import ActionHandler

__all__ = ["LLMHandler", "MemoryHandler", "IntentRouter", "ActionHandler"]
