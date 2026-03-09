"""
Guardrails — classifies LLM output as "task" or "response".

Flow:
    LLM Output → Guardrails Filter
        → "task"     → Save as .txt file in brain/tasks/
        → "response" → Send back to frontend
"""

import os
import json
from datetime import datetime


# Path to the tasks storage folder
TASKS_DIR = os.path.join(os.path.dirname(__file__), "tasks")


def ensure_tasks_dir():
    """Create the tasks directory if it doesn't exist."""
    if not os.path.exists(TASKS_DIR):
        os.makedirs(TASKS_DIR)


def validate_input(message: str) -> dict:
    """
    Check for prompt injection, jailbreaks, or dangerous instructions.
    
    Returns:
        {"is_safe": bool, "reason": str | None}
    """
    # Common patterns used in prompt injections or jailbreaks
    dangerous_patterns = [
        "ignore previous instructions",
        "ignore the above instructions",
        "ignore all previous",
        "system prompt",
        "dan mode",
        "do anything now",
        "you are now a",
        "jailbreak",
        "bypass",
        "override",
        "disregard"
    ]
    
    msg_lower = message.lower()
    for pattern in dangerous_patterns:
        if pattern in msg_lower:
            return {"is_safe": False, "reason": f"Input contained restricted pattern: '{pattern}'"}
            
    return {"is_safe": True, "reason": None}


def classify_output(intent: str, action_data: dict = None) -> str:
    """
    Determine if the brain output is a 'task' or a 'response'.

    Rules:
        - If intent is "action" → it's a task
        - If intent is "conversation" → it's a response
        - If action_data has requires_approval=True → it's a task

    Args:
        intent: "conversation" or "action" from the IntentRouter.
        action_data: Parsed action data (if any).

    Returns:
        "task" or "response"
    """
    if intent == "action":
        return "task"

    if action_data and action_data.get("requires_approval"):
        return "task"

    return "response"


def save_task(user_message: str, ai_response: str, action_data: dict = None, session_id: str = "default") -> str:
    """
    Save a task to a .txt file in brain/tasks/.
    """
    ensure_tasks_dir()

    # Find the next task number by looking for the highest existing number
    existing_tasks = [f for f in os.listdir(TASKS_DIR) if f.startswith("task") and f.endswith(".txt")]
    
    task_nums = []
    for f in existing_tasks:
        try:
            # Extract number from 'task{N}.txt'
            num_part = f.replace("task", "").replace(".txt", "")
            task_nums.append(int(num_part))
        except ValueError:
            continue
            
    next_num = max(task_nums) + 1 if task_nums else 1
    filename = f"task{next_num}.txt"
    filepath = os.path.join(TASKS_DIR, filename)

    # Build concise task content
    border = "=" * 40
    lines = [
        border,
        f"        NEURAL TASK ARCHIVE: {filename}",
        border,
        f"Timestamp  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Session    : {session_id}",
        f"Status     : LOGGED (Awaiting Connection)",
        "",
        "--- USER REQUEST ---",
        user_message,
        "",
        "--- AI INTERPRETATION ---",
        ai_response,
    ]

    if action_data:
        lines.extend([
            "",
            "--- ACTION METADATA ---",
            f"Type       : {action_data.get('action_type', 'unknown')}",
            f"Description: {action_data.get('action_description', '')}",
            f"Approval   : {'Required' if action_data.get('requires_approval') else 'Auto'}"
        ])
    
    lines.append("")
    lines.append(border)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"  [Guardrails] Task saved → {filename}")
    return filename


def process_filter(intent: str, user_message: str, ai_response: str, action_data: dict = None, session_id: str = "default") -> dict:
    """
    Main guardrails filter — classify and route the output.

    Returns:
        {
            "type": "task" | "response",
            "response": str,           # the AI response text
            "task_file": str | None     # path to saved task file (if task)
        }
    """
    output_type = classify_output(intent, action_data)

    if output_type == "task":
        task_file = save_task(user_message, ai_response, action_data, session_id)
        return {
            "type": "task",
            "response": ai_response,
            "task_file": task_file
        }
    else:
        return {
            "type": "response",
            "response": ai_response,
            "task_file": None
        }
