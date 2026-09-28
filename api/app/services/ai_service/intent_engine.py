from typing import Dict, Any, List
from app.services.ai_service.provider import LocalLLMProvider
from app.services.ai_service.ollama_provider import OllamaProvider
from app.services.ai_service.heuristic_provider import HeuristicLocalProvider
from app.models.schemas import AIIntentAnalysis
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger("intent_engine")

class LocalLLMFactory:
    @staticmethod
    def get_provider() -> LocalLLMProvider:
        mode = settings.LOCAL_LLM_PROVIDER.lower()
        if mode == "ollama":
            return OllamaProvider()
        elif mode == "heuristic":
            return HeuristicLocalProvider()
            
        # "auto" mode: check if Ollama is available, else fallback
        ollama = OllamaProvider()
        if ollama.health_check():
            logger.info("Local Ollama daemon is active and healthy.")
            return ollama
        else:
            logger.info("Ollama is not running. Using built-in local Heuristic Engine.")
            return HeuristicLocalProvider()

class AIIntentEngine:
    def __init__(self, provider: LocalLLMProvider = None):
        self.provider = provider or LocalLLMFactory.get_provider()

    def analyze_pattern(
        self,
        sequence: List[str],
        occurrences: int,
        avg_interval_seconds: float,
        context: str = ""
    ) -> AIIntentAnalysis:
        prompt = (
            f"You are the AutoFlow Privacy-Preserving Intent Interpreter.\n"
            f"Analyze the following detected computer workflow sequence:\n"
            f"Observed Sequence: {' -> '.join(sequence)}\n"
            f"Occurrences: {occurrences}\n"
            f"Average Interval: {round(avg_interval_seconds, 1)} seconds\n"
            f"Observed Context: {context or 'User repeatedly downloads or organizes documents in workspace'}\n\n"
            f"Determine the user's likely intent, suggest a concise workflow name, write a helpful explanation, "
            f"and propose safe automation steps."
        )

        system_prompt = (
            "You are an assistant for a local-first workflow discovery engine. "
            "You infer the user's intent from repetitive actions. "
            "Never suggest shell scripts or dangerous system commands. "
            "Only suggest structured, safe, sandboxable file operations."
        )

        try:
            analysis = self.provider.generate_structured(
                prompt=prompt,
                schema=AIIntentAnalysis,
                system_prompt=system_prompt
            )
            logger.info(f"AI successfully analyzed pattern: '{analysis.workflow_name}' (Confidence: {analysis.confidence})")
            return analysis
        except Exception as e:
            logger.warning(f"Structured AI generation error ({e}). Using heuristic fallback.")
            fallback = HeuristicLocalProvider()
            return fallback.generate_structured(prompt, AIIntentAnalysis)
