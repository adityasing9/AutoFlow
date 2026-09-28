import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.database.models import Event, Pattern, PatternEvent
from app.services.pattern_service.cache import pattern_cache
from app.services.pattern_service.graph import WorkflowGraphAnalyzer
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger("pattern_detector")

class PatternDetector:
    """
    Pattern Discovery Engine:
    Discovers repetitive multi-step digital workflows from event streams.
    
    DSA Characteristics:
    - Algorithmic Approach: Sliding-Window Contiguous Subsequence Mining + Hash Mapping
    - Time Complexity: O(N * L) where N is number of events in window, L is max sequence length (2..5)
    - Space Complexity: O(K * L) where K is number of distinct discovered sequence patterns
    """
    def __init__(self, min_occurrences: int = None, window_minutes: int = None):
        self.min_occurrences = min_occurrences or settings.PATTERN_MIN_OCCURRENCES
        self.window_minutes = window_minutes or settings.PATTERN_TIME_WINDOW_MINUTES

    def _cluster_events_by_target(self, events: List[Event]) -> List[List[Event]]:
        """
        Group events either by correlated raw_hash (same target file across lifecycle)
        or by temporal proximity window.
        """
        clusters: Dict[str, List[Event]] = {}
        
        for ev in events:
            # Group by file hash if available
            key = ev.raw_hash if ev.raw_hash else "unkeyed"
            if key not in clusters:
                clusters[key] = []
            clusters[key].append(ev)
            
        return list(clusters.values())

    def discover_patterns(self, db: Session) -> List[Pattern]:
        """
        Scans recent events, mines repeated sequences, computes intervals,
        and saves or updates candidate Pattern entities in the database.
        """
        cutoff = datetime.utcnow() - timedelta(minutes=self.window_minutes * 10) # Look across reasonable historical window
        events = db.query(Event).filter(Event.timestamp >= cutoff).order_by(Event.timestamp.asc()).all()
        
        if len(events) < self.min_occurrences:
            return []
            
        clusters = self._cluster_events_by_target(events)
        
        # Mine sequences of length 2 to 4
        sequence_counts: Dict[str, Dict[str, Any]] = {}
        
        for group in clusters:
            if len(group) < 2:
                continue
            
            # Sort group chronologically
            group.sort(key=lambda x: x.timestamp)
            
            # Extract simple representation: [EVENT_TYPE (FILE_TYPE)]
            tokens = [f"{ev.event_type}:{ev.file_type}" for ev in group]
            
            # Extract n-grams
            for n in range(2, min(len(tokens) + 1, 5)):
                for i in range(len(tokens) - n + 1):
                    subseq = tokens[i:i+n]
                    subseq_key = "->".join(subseq)
                    
                    # Compute timestamps interval for this occurrence
                    t_start = group[i].timestamp
                    t_end = group[i+n-1].timestamp
                    duration_sec = max(1.0, (t_end - t_start).total_seconds())
                    
                    # Check cache for prior analysis
                    cached_data = pattern_cache.get(subseq)
                    
                    if subseq_key not in sequence_counts:
                        sequence_counts[subseq_key] = {
                            "tokens": subseq,
                            "occurrences": 0,
                            "intervals": [],
                            "sample_event_ids": []
                        }
                    
                    sequence_counts[subseq_key]["occurrences"] += 1
                    sequence_counts[subseq_key]["intervals"].append(duration_sec)
                    sequence_counts[subseq_key]["sample_event_ids"].append([group[j].id for j in range(i, i+n)])

        discovered_db_patterns = []
        pattern_idx = db.query(Pattern).count() + 1
        
        for seq_key, data in sequence_counts.items():
            if data["occurrences"] >= self.min_occurrences:
                tokens = data["tokens"]
                avg_interval = sum(data["intervals"]) / len(data["intervals"])
                
                # Check cache or save in cache
                pattern_cache.put(tokens, {
                    "occurrences": data["occurrences"],
                    "avg_interval": avg_interval
                })
                
                # Calculate initial heuristic confidence based on frequency & temporal stability
                freq_factor = min(1.0, data["occurrences"] / 10.0) * 0.4
                time_std = 0.3 if len(data["intervals"]) > 1 else 0.1
                base_confidence = min(0.98, round(0.50 + freq_factor + time_std, 2))
                
                # Classify risk
                risk = "LOW"
                for t in tokens:
                    if "DELETE" in t:
                        risk = "HIGH"
                        break
                    elif "MOVE" in t or "COPY" in t:
                        risk = "MEDIUM"
                
                # Check if this sequence already exists in DB
                existing = db.query(Pattern).filter_by(sequence_json=json.dumps(tokens)).first()
                if existing:
                    existing.occurrences = data["occurrences"]
                    existing.avg_interval_seconds = avg_interval
                    existing.confidence = base_confidence
                    existing.risk_level = risk
                    db.commit()
                    discovered_db_patterns.append(existing)
                else:
                    pattern_code = f"P-{pattern_idx:03d}"
                    pattern_idx += 1
                    new_pattern = Pattern(
                        pattern_code=pattern_code,
                        name=f"Workflow Candidate ({tokens[0]} → {tokens[-1]})",
                        sequence_json=json.dumps(tokens),
                        occurrences=data["occurrences"],
                        avg_interval_seconds=avg_interval,
                        confidence=base_confidence,
                        risk_level=risk,
                        status="DETECTED"
                    )
                    db.add(new_pattern)
                    db.commit()
                    db.refresh(new_pattern)
                    
                    # Associate sample event links
                    if data["sample_event_ids"]:
                        for order, ev_id in enumerate(data["sample_event_ids"][0]):
                            pe = PatternEvent(
                                pattern_id=new_pattern.id,
                                event_id=ev_id,
                                step_order=order + 1
                            )
                            db.add(pe)
                        db.commit()
                        
                    discovered_db_patterns.append(new_pattern)
                    logger.info(f"Discovered new pattern {new_pattern.pattern_code}: {seq_key} with {data['occurrences']} occurrences")

        return discovered_db_patterns
