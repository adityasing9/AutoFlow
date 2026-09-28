import pytest
from app.services.ai_service.heuristic_provider import HeuristicLocalProvider
from app.services.ai_service.intent_engine import AIIntentEngine
from app.models.schemas import AIIntentAnalysis

def test_heuristic_provider_structured_output():
    provider = HeuristicLocalProvider()
    res = provider.generate_structured(
        prompt="User performs FILE_CREATED:PDF -> FILE_OPENED:PDF -> FILE_RENAMED:PDF -> FILE_MOVED:PDF repeatedly",
        schema=AIIntentAnalysis
    )
    assert isinstance(res, AIIntentAnalysis)
    assert res.workflow_name == "Study Material Organizer"
    assert res.confidence >= 0.90
    assert len(res.suggested_actions) == 4

def test_intent_engine_offline_fallback():
    # Test intent engine operates properly even if external LLM daemon is offline
    engine = AIIntentEngine(provider=HeuristicLocalProvider())
    analysis = engine.analyze_pattern(
        sequence=["FILE_CREATED:PDF", "FILE_OPENED:PDF", "FILE_RENAMED:PDF", "FILE_MOVED:PDF"],
        occurrences=11,
        avg_interval_seconds=120.0
    )
    assert analysis.intent == "Organize downloaded documents"
    assert analysis.workflow_name == "Study Material Organizer"
    assert analysis.confidence == 0.94
