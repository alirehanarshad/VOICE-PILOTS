"""
Intent Router — classifies and routes user messages.

Flow (from architecture diagram):
    User Message → Intent Router → Guardrails Filter
        → "conversation" → LLM response → Filter = "response" → Send to frontend
        → "action"       → ActionHandler → Filter = "task"     → Save to brain/tasks/
"""

from brain.llm import LLMHandler
from brain.memory import MemoryHandler
from brain.actions import ActionHandler
from brain.guardrails import process_filter, validate_input


class IntentRouter:
    """
    Central routing logic for the Brain.
    
    Takes a user message, classifies it, routes it
    to the appropriate handler, then runs it through
    the guardrails filter (task vs response).
    """

    def __init__(self, llm: LLMHandler, memory: MemoryHandler, actions: ActionHandler):
        self.llm = llm
        self.memory = memory
        self.actions = actions

    async def process(self, user_message: str, session_id: str = "default", pilot_name: str = "Assistant") -> dict:
        """
        Process a user message through the full brain pipeline.

        Args:
            user_message: The raw text from the user (from STT or typed).
            session_id: Conversation session identifier.
            pilot_name: The name of the AI pilot.

        Returns:
            {
                "intent": "conversation" | "action",
                "response": str,
                "action_data": dict | None,
                "output_type": "task" | "response",
                "task_file": str | None
            }
        """
        print(f"\n  [Router] Processing: \"{user_message[:80]}...\" (Pilot: {pilot_name})")

        # 0. Validate input (Safety Guardrail)
        validation = validate_input(user_message)
        if not validation["is_safe"]:
            print(f"  [Router] SHIELD TRIGGERED: {validation['reason']}")
            # Return a generic safety warning immediately
            return {
                "intent": "conversation",
                "response": "⚠️ **Security Alert**: I've detected an attempt to override my safety instructions or system prompt. I cannot process this request.",
                "action_data": None,
                "output_type": "response",
                "task_file": None
            }

        # 1. Store user message in memory
        self.memory.add_message("user", user_message, session_id)

        # 2. Classify intent (Unless Pilot is strictly conversational)
        if pilot_name in ["Zoya", "Aarav"]:
            intent = "conversation"
            print(f"  [Router] Intent overridden to conversation due to Pilot constraint ({pilot_name})")
        else:
            intent = await self.llm.classify_intent(user_message)
            print(f"  [Router] Intent: {intent}")

        # 3. Route based on intent
        if intent == "action":
            result = await self._handle_action(user_message, session_id, pilot_name)
        else:
            result = await self._handle_conversation(user_message, session_id, pilot_name)

        # 4. Run through guardrails filter (task vs response)
        filter_result = process_filter(
            intent=result["intent"],
            user_message=user_message,
            ai_response=result["response"],
            action_data=result.get("action_data"),
            session_id=session_id
        )
        print(f"  [Router] Filter result: {filter_result['type']}")

        # 5. Merge filter result into output
        result["output_type"] = filter_result["type"]
        result["task_file"] = filter_result["task_file"]

        # 6. Store assistant response in memory
        self.memory.add_message("assistant", result["response"], session_id)

        return result

    # ── Private Handlers ────────────────────────

    async def _handle_conversation(self, user_message: str, session_id: str, pilot_name: str) -> dict:
        """Handle a conversational message — just generate a response."""
        history = self.memory.get_history(session_id)
        # Remove the last message (the one we just added) so it doesn't duplicate
        history_for_llm = history[:-1] if history else []

        response = await self.llm.generate_response(user_message, history_for_llm, pilot_name)

        return {
            "intent": "conversation",
            "response": response,
            "action_data": None
        }

    async def _handle_action(self, user_message: str, session_id: str, pilot_name: str) -> dict:
        """Handle an action request — parse and route to ActionHandler."""
        # Parse what action the user wants
        action_data = await self.llm.parse_action(user_message)
        print(f"  [Router] Action parsed: {action_data}")

        # Execute through ActionHandler
        action_result = await self.actions.handle(action_data)

        # EXECUTION: In a real system, you'd perform the action here.
        # For now, we return a static response for tasks as requested.
        response = f"Task '{action_data.get('action_type')}' has been processed and logged."

        return {
            "intent": "action",
            "response": response,
            "action_data": action_data
        }
