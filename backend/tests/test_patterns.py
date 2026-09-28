import pytest
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Event, Pattern
from app.services.pattern_service.detector import PatternDetector
from app.services.pattern_service.graph import WorkflowGraphAnalyzer
from app.services.pattern_service.cache import pattern_cache

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_repeated_workflow_discovery(db_session):
    detector = PatternDetector(min_occurrences=3, window_minutes=60)
    now = datetime.utcnow()
    
    # Insert 4 repeated sequences of: CREATE -> OPEN -> RENAME -> MOVE
    for i in range(4):
        h = f"hash_{i}"
        t_base = now - timedelta(minutes=(4 - i) * 5)
        for offset, evt in enumerate(["FILE_CREATED", "FILE_OPENED", "FILE_RENAMED", "FILE_MOVED"]):
            ev = Event(
                event_type=evt,
                file_type="PDF",
                category="DOCUMENT",
                normalized_path=f"<WORKSPACE>/Inbox/file_{i}.pdf",
                raw_hash=h,
                timestamp=t_base + timedelta(seconds=offset * 10)
            )
            db_session.add(ev)
    db_session.commit()
    
    discovered = detector.discover_patterns(db_session)
    assert len(discovered) > 0
    # Verify the sequence was discovered
    codes = [p.pattern_code for p in discovered]
    assert "P-001" in codes

def test_unrelated_noisy_events(db_session):
    detector = PatternDetector(min_occurrences=3, window_minutes=60)
    now = datetime.utcnow()
    
    # Insert unrelated sporadic events
    event_types = ["FILE_DELETED", "FOLDER_CREATED", "APPLICATION_OPENED", "FILE_CREATED"]
    for i, et in enumerate(event_types):
        ev = Event(
            event_type=et,
            file_type="UNKNOWN",
            normalized_path=f"<WORKSPACE>/random_{i}.txt",
            raw_hash=f"noise_hash_{i}",
            timestamp=now - timedelta(minutes=i * 2)
        )
        db_session.add(ev)
    db_session.commit()

    discovered = detector.discover_patterns(db_session)
    # Should not meet min_occurrences threshold of 3
    assert len(discovered) == 0

def test_workflow_graph_analyzer():
    analyzer = WorkflowGraphAnalyzer()
    seq1 = ["FILE_CREATED:PDF", "FILE_OPENED:PDF", "FILE_RENAMED:PDF", "FILE_MOVED:PDF"]
    seq2 = ["FILE_CREATED:PDF", "FILE_OPENED:PDF", "FILE_RENAMED:PDF", "FILE_MOVED:PDF"]
    
    analyzer.build_from_sequences([seq1, seq2])
    path = analyzer.get_longest_frequent_path(min_weight=1)
    assert path == seq1
    
    graph_json = analyzer.to_json_graph()
    assert len(graph_json["nodes"]) == 4
    assert len(graph_json["links"]) == 3

def test_pattern_detection_cache():
    pattern_cache.clear()
    sample_seq = ["FILE_CREATED:PDF", "FILE_OPENED:PDF"]
    
    assert pattern_cache.get(sample_seq) is None
    pattern_cache.put(sample_seq, {"occurrences": 5, "avg_interval": 12.5})
    
    cached = pattern_cache.get(sample_seq)
    assert cached is not None
    assert cached["occurrences"] == 5
    stats = pattern_cache.get_stats()
    assert stats["hits"] == 1
