"""
Action Handler — orchestrates user-requested actions.

From the architecture diagram:
    Action → Decision → MCP (future) → Task Performed
    Action → Needs Approval? → User Approval API → Yes/No

Currently returns descriptive responses about actions.
MCP tool execution will be wired in when you build that module.
"""


class ActionHandler:
    """
    Handles action requests parsed by the LLM.
    
    This is the bridge between the Brain and the MCP executor.
    For now, it returns status messages. When MCP is ready,
    actual tool calls will be routed through here.
    """

    def __init__(self):
        from brain.mcp_client import mcp_client
        self.mcp = mcp_client

    async def handle(self, action_data: dict) -> dict:
        """
        Process a parsed action.
        """
        action_type = action_data.get("action_type", "unknown")
        description = action_data.get("action_description", "")
        
        # RISK DETECTION: Automatically require approval for sensitive tasks
        high_risk_keywords = ["delete", "remove", "wipe", "format", "reset", "buy", "purchase", "install", "exec", "shutdown"]
        is_high_risk = any(kw in description.lower() for kw in high_risk_keywords)
        
        # Use explicit flag from LLM or our internal risk check
        needs_approval = action_data.get("requires_approval", True) or is_high_risk

        print(f"  [Actions] Handling: {action_type} — \"{description}\" (High Risk: {is_high_risk})")

        if needs_approval:
            return {
                "status": "pending_approval",
                "message": f"Action '{description}' requires your approval.",
                "action_type": action_type,
                "is_risky": is_high_risk
            }

        # Execute via MCP
        result = await self.mcp.execute(action_type, action_data.get("arguments", {}))
        
        return {
            "status": "completed",
            "message": str(result),
            "action_type": action_type
        }

