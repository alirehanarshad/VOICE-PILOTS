import json
import os
from config.settings import settings

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "memory.json")

class PersistentMemory:
    """
    Handles long-term memory stored on disk.
    Used for user preferences, recurring facts, and personhood.
    """
    def __init__(self):
        self.data = self._load()

    def _load(self):
        if os.path.exists(MEMORY_FILE):
            try:
                with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {"facts": [], "preferences": {}}
        return {"facts": [], "preferences": {}}

    def save(self):
        with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, indent=4, ensure_ascii=False)

    def add_fact(self, fact: str):
        if fact not in self.data["facts"]:
            self.data["facts"].append(fact)
            self.save()

    def delete_fact(self, fact: str):
        if fact in self.data["facts"]:
            self.data["facts"].remove(fact)
            self.save()

    def delete_preference(self, key: str):
        if key in self.data["preferences"]:
            del self.data["preferences"][key]
            self.save()

    def set_preference(self, key: str, value: str):
        self.data["preferences"][key] = value
        self.save()

    def clear_all(self):
        self.data = {"facts": [], "preferences": {}}
        self.save()

    def get_all(self) -> dict:
        return {
            "facts": list(self.data.get("facts", [])),
            "preferences": dict(self.data.get("preferences", {}))
        }

    def get_context_string(self) -> str:
        """Returns a string representation of all long-term memory for the system prompt."""
        context = []
        
        # User Portrait Section
        if self.data["facts"]:
            context.append("CORE USER PROFILE (Recall these details in conversation):")
            # De-duplicate and prioritize unique facts
            unique_facts = list(dict.fromkeys(self.data["facts"]))
            for fact in unique_facts[-15:]: # Show up to 15 facts
                context.append(f"- {fact}")
        
        if self.data["preferences"]:
            context.append("\nESTABLISHED USER PREFERENCES:")
            for k, v in self.data["preferences"].items():
                context.append(f"- {k}: {v}")
        
        return "\n".join(context) if context else ""

persistent_memory = PersistentMemory()
