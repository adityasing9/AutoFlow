from abc import ABC, abstractmethod
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel

class LocalLLMProvider(ABC):
    """
    Abstract interface for local-first AI inference engines.
    Ensures the AutoFlow architecture is decoupled from any specific model backend.
    """
    
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates raw text response from local LLM."""
        pass

    @abstractmethod
    def generate_structured(
        self, prompt: str, schema: Type[BaseModel], system_prompt: Optional[str] = None
    ) -> BaseModel:
        """Generates and validates structured JSON output conforming to a Pydantic schema."""
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Verifies if the local inference engine is reachable and operational."""
        pass

    @abstractmethod
    def model_info(self) -> Dict[str, Any]:
        """Returns metadata about the active local model runtime."""
        pass
