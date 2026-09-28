import json
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel
from app.services.ai_service.provider import LocalLLMProvider
from app.models.schemas import AIIntentAnalysis

class HeuristicLocalProvider(LocalLLMProvider):
    """
    Built-in Deterministic Local Provider.
    Operates 100% offline with zero dependencies or external network calls.
    Used for instant evaluation, test suites, or as a seamless local fallback
    when an external local LLM daemon (like Ollama) is not currently running.
    """
    def health_check(self) -> bool:
        return True

    def model_info(self) -> Dict[str, Any]:
        return {
            "provider": "Local Heuristic Engine",
            "model": "autoflow-rule-expert-v1",
            "status": "ONLINE (Built-in)",
            "privacy": "Zero-data-leakage / In-memory"
        }

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return (
            "Detected a repetitive workflow pattern involving file organization. "
            "Suggesting an automated pipeline to handle file movement and renaming safely."
        )

    def generate_structured(
        self, prompt: str, schema: Type[BaseModel], system_prompt: Optional[str] = None
    ) -> BaseModel:
        prompt_lower = prompt.lower()
        
        # Analyze tokens in prompt
        is_pdf = "pdf" in prompt_lower
        is_move = "move" in prompt_lower or "renam" in prompt_lower
        is_doc = "document" in prompt_lower or "docx" in prompt_lower
        
        if is_pdf or is_move:
            intent = "Organize downloaded documents"
            name = "Study Material Organizer"
            desc = "The user repeatedly organizes newly downloaded documents into subject directories."
            confidence = 0.94
            manual_effort = 55
            automated_effort = 4
            suggested_trigger = "FILE_CREATED in <WORKSPACE>/Inbox (Type: PDF)"
            suggested_actions = [
                {"step": 1, "tool": "FileReader", "action": "Inspect document metadata"},
                {"step": 2, "tool": "FolderCreator", "action": "Ensure destination subject directory exists"},
                {"step": 3, "tool": "FileRenamer", "action": "Standardize document naming convention"},
                {"step": 4, "tool": "FileMover", "action": "Move document to target subject folder"}
            ]
        elif "delete" in prompt_lower or "clean" in prompt_lower:
            intent = "Purge temporary cache files"
            name = "Temporary File Cleaner"
            desc = "Repeated deletion of temporary or scratch files in working folders."
            confidence = 0.88
            manual_effort = 20
            automated_effort = 2
            suggested_trigger = "SCHEDULED or ON_EVENT: High temporary file count"
            suggested_actions = [
                {"step": 1, "tool": "FileScanner", "action": "Scan for stale .tmp and .cache files"},
                {"step": 2, "tool": "FileRenamer", "action": "Quarantine old files"},
                {"step": 3, "tool": "FileMover", "action": "Move to Recycle/Trash buffer"}
            ]
        else:
            intent = "Automate repeated file management routine"
            name = "General Document Handler"
            desc = "Detected repetitive file lifecycle operations across the user workspace."
            confidence = 0.82
            manual_effort = 30
            automated_effort = 3
            suggested_trigger = "FILE_CREATED in <WORKSPACE>"
            suggested_actions = [
                {"step": 1, "tool": "FileScanner", "action": "Scan target items"},
                {"step": 2, "tool": "FileMover", "action": "Move to categorized directory"}
            ]

        data = {
            "intent": intent,
            "workflow_name": name,
            "description": desc,
            "confidence": confidence,
            "estimated_manual_actions_per_week": manual_effort,
            "estimated_automated_actions_per_run": automated_effort,
            "suggested_triggers": suggested_trigger,
            "suggested_actions": suggested_actions
        }
        
        return schema.model_validate(data)
