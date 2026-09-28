from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class BaseTool(ABC):
    name: str
    description: str
    permission_requirement: str
    risk_level: str

    @abstractmethod
    def validate_inputs(self, params: Dict[str, Any]) -> None:
        """Validates input parameters before execution."""
        pass

    @abstractmethod
    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Simulates what the tool will do without touching the filesystem."""
        pass

    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Executes the action within the sandbox."""
        pass

    @abstractmethod
    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        """Verifies whether the operation achieved its desired post-condition."""
        pass
