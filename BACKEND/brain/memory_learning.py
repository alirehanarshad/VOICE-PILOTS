"""
Memory Learning — Distills facts and preferences from conversation history.
"""
import json
import re
from brain.service import llm, pm

LEARNING_PROMPT = """Analyze the following conversation history between a User and an AI Assistant.
Extract any NEW permanent facts or user preferences revealed in this exchange.

The User wants us to specifically remember:
1. Their NAME (Ali Rehan Arshad, etc.)
2. What they DO (Job/Profession)
3. What they LIKE (Interests/Hobbies)
4. Products/Projects they are working on (e.g. Edith, smart glasses, Python apps)

Conversation History:
{history}

IMPORTANT:
- Output only valid JSON.
- If nothing new is found, return empty lists/dicts.
- Do NOT include thinking tags.

Output Format:
{{
    "facts": ["User's name is...", "User works as...", "User is building..."],
    "preferences": {{"favorite_topic": "...", "interest": "..."}}
}}
"""

async def learn_from_conversation(session_id: str, memory_service):
    """
    Analyzes the session history, extracts facts, and saves them to persistent memory.
    """
    history = memory_service.get_history(session_id)
    if not history or len(history) < 2:
        return

    # Format history for the LLM
    formatted_history = ""
    for msg in history:
        formatted_history += f"{msg['role'].upper()}: {msg['content']}\n"

    prompt = LEARNING_PROMPT.format(history=formatted_history)
    
    try:
        # Use simple generate (non-streaming) for this internal task
        raw_response = await llm.generate_response(prompt)
        
        # ROBUST JSON EXTRACTION: Find the range between first { and last }
        try:
            start_idx = raw_response.find('{')
            end_idx = raw_response.rfind('}')
            if start_idx != -1 and end_idx != -1:
                raw_json = raw_response[start_idx:end_idx+1]
            else:
                raw_json = raw_response
            
            data = json.loads(raw_json)
        except (json.JSONDecodeError, ValueError):
            # Fallback to older logic if rfind fails
            if "```" in raw_response:
                raw_json = raw_response.split("```")[1]
                if raw_json.startswith("json"):
                    raw_json = raw_json[4:]
                raw_json = raw_json.strip()
            else:
                raw_json = raw_response
            data = json.loads(raw_json)
        
        # Save to persistent memory
        new_facts = data.get("facts", [])
        for fact in new_facts:
            pm.add_fact(fact)
            
        new_prefs = data.get("preferences", {})
        for k, v in new_prefs.items():
            pm.set_preference(k, v)
            
        if new_facts or new_prefs:
            print(f"  [Learning] System learned {len(new_facts)} facts and {len(new_prefs)} preferences.")
            
    except Exception as e:
        print(f"  [Learning] Error during distillation: {e}")
