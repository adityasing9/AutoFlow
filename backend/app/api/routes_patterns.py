import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.connection import get_db
from app.database.models import Pattern
from app.models.schemas import PatternResponse
from app.services.pattern_service.detector import PatternDetector
from app.services.pattern_service.graph import WorkflowGraphAnalyzer
from app.services.pattern_service.cache import pattern_cache

router = APIRouter(prefix="/patterns", tags=["Patterns"])

@router.get("", response_model=List[PatternResponse])
def get_patterns(db: Session = Depends(get_db)):
    patterns = db.query(Pattern).order_by(Pattern.occurrences.desc()).all()
    results = []
    for p in patterns:
        results.append(PatternResponse(
            id=p.id,
            pattern_code=p.pattern_code,
            name=p.name,
            sequence=json.loads(p.sequence_json),
            occurrences=p.occurrences,
            avg_interval_seconds=p.avg_interval_seconds,
            confidence=p.confidence,
            risk_level=p.risk_level,
            status=p.status,
            detected_at=p.detected_at,
            updated_at=p.updated_at
        ))
    return results

@router.post("/discover")
def trigger_pattern_discovery(db: Session = Depends(get_db)):
    detector = PatternDetector()
    discovered = detector.discover_patterns(db)
    return {
        "status": "SUCCESS",
        "discovered_count": len(discovered),
        "patterns": [p.pattern_code for p in discovered],
        "cache_stats": pattern_cache.get_stats()
    }

@router.get("/{pattern_id}/graph")
def get_pattern_graph(pattern_id: int, db: Session = Depends(get_db)):
    pattern = db.query(Pattern).filter_by(id=pattern_id).first()
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")
        
    sequence = json.loads(pattern.sequence_json)
    analyzer = WorkflowGraphAnalyzer()
    analyzer.build_from_sequences([sequence])
    return analyzer.to_json_graph()
