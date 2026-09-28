from typing import Dict, List, Optional
from app.tools.base import BaseTool
from app.tools.file_tools import (
    FileReader, FileScanner, FileRenamer, FolderCreator, FileMover, FileCopier, DocumentReader
)

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        tools = [
            FileReader(),
            FileScanner(),
            FileRenamer(),
            FolderCreator(),
            FileMover(),
            FileCopier(),
            DocumentReader()
        ]
        for t in tools:
            self._tools[t.name] = t

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "permission_requirement": t.permission_requirement,
                "risk_level": t.risk_level
            }
            for t in self._tools.values()
        ]

tool_registry = ToolRegistry()
