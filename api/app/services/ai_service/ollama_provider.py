import json
import httpx
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel
from app.services.ai_service.provider import LocalLLMProvider
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger("ollama_provider")

class OllamaProvider(LocalLLMProvider):
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=2.0) as client:
                res = client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    def model_info(self) -> Dict[str, Any]:
        healthy = self.health_check()
        return {
            "provider": "Ollama",
            "model": self.model,
            "base_url": self.base_url,
            "status": "ONLINE" if healthy else "UNAVAILABLE"
        }

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(f"{self.base_url}/api/generate", json=payload)
                resp.raise_for_status()
                return resp.json().get("response", "")
        except Exception as e:
            logger.error(f"Ollama generation failed: {e}")
            raise RuntimeError(f"Local Ollama generation error: {e}")

    def generate_structured(
        self, prompt: str, schema: Type[BaseModel], system_prompt: Optional[str] = None
    ) -> BaseModel:
        # Request JSON output format
        schema_json = schema.model_json_schema()
        json_instruction = (
            f"\nYou must output ONLY valid JSON adhering strictly to this schema: {json.dumps(schema_json)}.\n"
            "Do not include explanation or markdown code fences outside the JSON object."
        )
        full_prompt = f"{prompt}\n{json_instruction}"
        
        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "format": "json",
            "stream": False
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            with httpx.Client(timeout=35.0) as client:
                resp = client.post(f"{self.base_url}/api/generate", json=payload)
                resp.raise_for_status()
                raw_text = resp.json().get("response", "").strip()
                parsed = json.loads(raw_text)
                return schema.model_validate(parsed)
        except Exception as e:
            logger.error(f"Ollama structured generation failed: {e}")
            raise RuntimeError(f"Local Ollama structured output validation error: {e}")
