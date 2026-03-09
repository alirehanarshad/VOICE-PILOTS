"""
LLM Handler — Groq + GPT-OSS 120B integration for the Brain.

Provides:
    - Conversational response generation (streaming)
    - Intent classification (fast, no-think mode)
    - Action parsing (fast, no-think mode)
    - Graceful fallback when API key is missing
"""

import json
import re
from groq import AsyncGroq
from brain.prompts import SYSTEM_PROMPT, INTENT_DETECTION_PROMPT, ACTION_PARSE_PROMPT, GRAND_ROUTER_PROMPT, build_messages
from config.settings import settings


class LLMHandler:
    """
    Core LLM interface using Groq's API with GPT-OSS 120B.
    """

    def __init__(
        self,
        model: str = None,
        temperature: float = None,
        max_tokens: int = None,
    ):
        self.model = model or settings.LLM_MODEL        # GPT-OSS 120B
        self.intent_model = settings.INTENT_MODEL       # GPT-OSS 120B
        self.temperature = temperature if temperature is not None else settings.LLM_TEMPERATURE
        self.max_tokens = max_tokens if max_tokens is not None else settings.LLM_MAX_TOKENS

        api_key = settings.GROQ_API_KEY
        self._available = bool(api_key and api_key != "your_groq_api_key_here")

        if self._available:
            self.client = AsyncGroq(api_key=api_key)
            print(f"  [Brain] LLM initialized — Response: {self.model} | Intent: {self.intent_model}")
        else:
            self.client = None
            print("  [Brain] WARNING: No valid GROQ_API_KEY found. LLM is disabled.")

    # ── Core Generation ─────────────────────────

    async def generate_response(self, user_message: str, history: list = None, pilot_name: str = "Assistant") -> str:
        """
        Generate a conversational response (blocking).
        """
        if not self._available:
            return self._fallback_response(user_message)

        pilot_name = pilot_name.title() if pilot_name else "Assistant"
        
        # Build dynamic system prompt
        from brain.prompts import AGENT_INSTRUCTIONS
        from brain.service import pm
        instr = AGENT_INSTRUCTIONS.get(pilot_name, f"You are {pilot_name}. Respond in the user's language.")
        
        # Get long-term context
        lt_context = pm.get_context_string()
        agent_instruction = f"Strictly adhere to these instructions:\n\n{instr}\n\nUSER FACTS (Reference only):\n{lt_context}" if lt_context else instr
        
        dynamic_system_prompt = SYSTEM_PROMPT.format(pilot_name=pilot_name, agent_specific_instruction=agent_instruction)
        messages = build_messages(dynamic_system_prompt, history or [], user_message)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
            )
            raw_content = response.choices[0].message.content.strip()
            
            # Robustly strip <think> blocks
            clean_content = self._clean_think_tags(raw_content)
            
            print(f"  [LLM] Raw response length: {len(raw_content)}")
            print(f"  [LLM] Clean response length: {len(clean_content)}")
            
            return clean_content

        except Exception as e:
            print(f"  [Brain] LLM Error: {e}")
            return f"I encountered an error processing your request. Please try again."

    async def generate_stream(self, user_message: str, history: list = None, pilot_name: str = "Assistant"):
        """
        Generate a conversational response (streaming).
        Yields tokens as they arrive.
        """
        if not self._available:
            yield self._fallback_response(user_message)
            return

        pilot_name = pilot_name.title() if pilot_name else "Assistant"
        
        from brain.prompts import AGENT_INSTRUCTIONS
        from brain.service import pm
        instr = AGENT_INSTRUCTIONS.get(pilot_name, f"You are {pilot_name}. Respond in the user's language.")
        
        # Get long-term context
        lt_context = pm.get_context_string()
        agent_instruction = f"Strictly adhere to these instructions:\n\n{instr}\n\nUSER FACTS (Reference only):\n{lt_context}" if lt_context else instr
        
        dynamic_system_prompt = SYSTEM_PROMPT.format(pilot_name=pilot_name, agent_specific_instruction=agent_instruction)
        messages = build_messages(dynamic_system_prompt, history or [], user_message)

        if user_message == "NO_SPEECH_DETECTED_FALLBACK_PHRASE":
            yield "I'm sorry, I didn't quite catch that. Could you please repeat?"
            return

        async def _try_stream(model_name: str):
            """Attempt to stream from a specific model."""
            stream = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                stream=True,
            )
            
            in_think_block = False
            think_buffer = ""

            async for chunk in stream:
                delta = chunk.choices[0].delta
                if not delta.content:
                    continue
                token = delta.content

                # Token-by-token <think> tag filtering (correct approach)
                think_buffer += token
                while think_buffer:
                    if in_think_block:
                        end_idx = think_buffer.find("</think>")
                        if end_idx != -1:
                            # Found end tag — yield what's after it
                            in_think_block = False
                            after = think_buffer[end_idx + len("</think>"):]
                            think_buffer = after
                        else:
                            think_buffer = ""  # still inside think block, discard
                    else:
                        start_idx = think_buffer.find("<think>")
                        if start_idx != -1:
                            # Yield everything before the think tag
                            before = think_buffer[:start_idx]
                            if before:
                                yield before
                            in_think_block = True
                            think_buffer = think_buffer[start_idx + len("<think>"):]
                        else:
                            # No think tag — yield all
                            yield think_buffer
                            think_buffer = ""
                            break

        try:
            async for token in _try_stream(self.model):
                yield token

        except Exception as e:
            error_msg = str(e)
            print(f"  [Brain] LLM Stream Error (model={self.model}): {error_msg}")
            
            # Auto-fallback to llama if the primary model fails
            if self.model != "llama-3.3-70b-versatile":
                print(f"  [Brain] Falling back to llama-3.3-70b-versatile...")
                try:
                    async for token in _try_stream("llama-3.3-70b-versatile"):
                        yield token
                    return
                except Exception as fallback_err:
                    print(f"  [Brain] Fallback also failed: {fallback_err}")
            
            yield f"I'm having trouble connecting to my AI backend right now. Error: {error_msg[:80]}"

    def _clean_think_tags(self, text: str) -> str:
        """Helper to strip <think>...</think> blocks."""
        # Standard block
        clean = re.sub(r'(?i)<think>.*?</think>', '', text, flags=re.DOTALL).strip()
        # Unclosed block
        clean = re.sub(r'(?i)<think>.*', '', clean, flags=re.DOTALL).strip()
        # Closing tag only
        clean = re.sub(r'(?i).*?</think>', '', clean, flags=re.DOTALL).strip()
        return clean

    # ── Intent Detection ────────────────────────

    async def classify_intent(self, user_message: str) -> str:
        """
        Classify user message as 'conversation' or 'action'.

        Returns:
            'conversation' or 'action'
        """
        if user_message == "NO_SPEECH_DETECTED_FALLBACK_PHRASE":
            return "conversation"
        
        if not self._available:
            return "conversation"

        prompt = INTENT_DETECTION_PROMPT.format(user_message=user_message)

        try:
            response = await self.client.chat.completions.create(
                model=self.intent_model,  # LLaMA 3.3 70B — fast & cheap
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=5,
            )
            raw_result = response.choices[0].message.content.strip()
            
            # Use regex to strip <think> blocks
            clean_result = re.sub(r'(?i)<think>.*?</think>', '', raw_result, flags=re.DOTALL).strip()
            clean_result = re.sub(r'(?i)<think>.*', '', clean_result, flags=re.DOTALL).strip()
            
            result = clean_result.lower()

            if "action" in result:
                return "action"
            return "conversation"

        except Exception as e:
            print(f"  [Brain] Intent classification error: {e}")
            return "conversation"

    # ── Action Parsing ──────────────────────────

    async def parse_action(self, user_message: str) -> dict:
        """
        Parse an action request into structured data.

        Returns:
            Dict with keys: action_type, action_description, requires_approval
        """
        if not self._available:
            return {
                "action_type": "unknown",
                "action_description": user_message,
                "requires_approval": True
            }

        prompt = ACTION_PARSE_PROMPT.format(user_message=user_message)

        try:
            response = await self.client.chat.completions.create(
                model=self.intent_model,  # LLaMA 3.3 70B — consistent with intent classification
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=100,
            )
            raw = response.choices[0].message.content.strip()

            # Extract JSON from response (handle markdown code blocks)
            if "```" in raw:
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            return json.loads(raw)

        except (json.JSONDecodeError, Exception) as e:
            print(f"  [Brain] Action parsing error: {e}")
            return {
                "action_type": "unknown",
                "action_description": user_message,
                "requires_approval": True
            }

    async def parse_grand_route(self, user_message: str) -> dict:
        """
        Executes the 7-step Grand Router prompt to simultaneously correct text,
        classify intent, and parse actions for 0ms latency.
        """
        fallback_result = {
            "Corrected_Text": user_message,
            "Intent": "Response",
            "Category": None,
            "Task": None,
            "Permission": "not_required",
            "Confidence_Score": 1.0,
            "Action_Description": "None",
            "Clarification_Question": "None"
        }

        if user_message == "NO_SPEECH_DETECTED_FALLBACK_PHRASE":
            return fallback_result
            
        if not self._available:
            return fallback_result

        prompt = GRAND_ROUTER_PROMPT.format(user_message=user_message)

        try:
            # We use LLaMA 70B for fast reasoning
            response = await self.client.chat.completions.create(
                model=self.intent_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=250,
                response_format={"type": "json_object"} # Guaranteed JSON
            )
            raw = response.choices[0].message.content.strip()

            result = json.loads(raw)
            return result
            
        except Exception as e:
            print(f"  [Brain] Grand Route Error: {e}")
            return fallback_result

    # ── Helpers ──────────────────────────────────

    def _fallback_response(self, user_message: str) -> str:
        """Fallback response when Groq API key is not configured."""
        return (
            "I'm currently running without an AI backend. "
            "Please add your GROQ_API_KEY to the .env file to enable full intelligence. "
            f"Your message was: \"{user_message}\""
        )

    @property
    def is_available(self) -> bool:
        """Check if the LLM is online and ready."""
        return self._available
