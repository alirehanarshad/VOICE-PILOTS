from brain.llm import LLMHandler
from brain.memory import MemoryHandler
from brain.actions import ActionHandler
from brain.router import IntentRouter
from brain.persistent_memory import persistent_memory

# Centralized singleton instances to avoid redundant initialization
llm = LLMHandler()
memory = MemoryHandler()
actions = ActionHandler()
intent_router = IntentRouter(llm=llm, memory=memory, actions=actions)
pm = persistent_memory
