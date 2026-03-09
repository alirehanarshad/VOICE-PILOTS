"""
Memory Handler — manages conversation history for the Brain.

Supports:
    - Session-based memory (each conversation has its own buffer)
    - Configurable max message count (context window management)
    - Add / get / clear operations
"""

from typing import Optional


class MemoryHandler:
    """
    In-memory conversation history manager.
    
    Stores messages per session_id so multiple conversations
    can run independently.
    """

    def __init__(self, max_messages: int = 50):
        """
        Args:
            max_messages: Maximum number of messages to retain per session.
                          Oldest messages are trimmed when the limit is exceeded.
        """
        self.max_messages = max_messages
        # { session_id: [ {"role": "user"/"assistant", "content": "..."}, ... ] }
        self._sessions: dict[str, list[dict]] = {}

    # ── Public API ──────────────────────────────

    def add_message(self, role: str, content: str, session_id: str = "default") -> None:
        """Append a message to the session history."""
        if session_id not in self._sessions:
            self._sessions[session_id] = []

        self._sessions[session_id].append({
            "role": role,
            "content": content
        })

        # Trim oldest messages if we exceed the limit
        if len(self._sessions[session_id]) > self.max_messages:
            overflow = len(self._sessions[session_id]) - self.max_messages
            self._sessions[session_id] = self._sessions[session_id][overflow:]

    def get_history(self, session_id: str = "default") -> list[dict]:
        """Return the full message history for a session."""
        return self._sessions.get(session_id, [])

    def clear(self, session_id: Optional[str] = None) -> None:
        """
        Clear conversation history.
        
        Args:
            session_id: If provided, clear only that session.
                        If None, clear ALL sessions.
        """
        if session_id:
            self._sessions.pop(session_id, None)
        else:
            self._sessions.clear()

    def get_session_ids(self) -> list[str]:
        """Return all active session IDs."""
        return list(self._sessions.keys())

    def get_message_count(self, session_id: str = "default") -> int:
        """Return the number of messages in a session."""
        return len(self._sessions.get(session_id, []))
