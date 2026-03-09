"""
MCP Client — manages Model Context Protocol servers and tool execution.
"""
import asyncio
import json
import os
from typing import Dict, Any, List

class MCPClient:
    """
    Client for managing MCP servers and executing tools.
    For now, this implements a direct tool registry while allowing
    expansion to external MCP servers.
    """

    def __init__(self):
        self.tools = {}
        self._initialize_internal_tools()

    def _initialize_internal_tools(self):
        """Register built-in system tools."""
        try:
            from brain.mcp.tools.browser import browser_search, browser_visit
            
            self.register_tool(
                "web_search", 
                browser_search, 
                "Search the web for real-time information.",
                {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
            )
            self.register_tool(
                "visit_url", 
                browser_visit, 
                "Visit a specific website to read its content.",
                {"type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]}
            )
        except ImportError:
            print("  [MCP] Browser tools not found, skipping registration.")


    def register_tool(self, name: str, handler, description: str, schema: dict):
        """Add a new tool to the registry."""
        self.tools[name] = {
            "handler": handler,
            "description": description,
            "schema": schema
        }

    async def execute(self, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """Call a registered tool."""
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' not found."}
        
        handler = self.tools[tool_name]["handler"]
        try:
            return await handler(**arguments)
        except Exception as e:
            return {"error": str(e)}

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Return tool metadata for the LLM."""
        return [
            {
                "name": name,
                "description": info["description"],
                "schema": info["schema"]
            }
            for name, info in self.tools.items()
        ]

mcp_client = MCPClient()
