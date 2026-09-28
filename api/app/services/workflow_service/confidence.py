from typing import Dict, Any

class ConfidenceEngine:
    """
    Multi-Signal Confidence Evaluation Model (Academic Prototype)
    
    Formula:
    Final Confidence = (
        0.30 * FrequencyScore +
        0.25 * SequenceConsistencyScore +
        0.20 * TemporalConsistencyScore +
        0.10 * ContextSimilarityScore +
        0.15 * AIConfidenceScore
    )
    """

    @classmethod
    def calculate_confidence(
        cls,
        occurrences: int,
        sequence_length: int,
        interval_std_ratio: float = 0.8,
        context_match: bool = True,
        ai_confidence: float = 0.90
    ) -> float:
        # 1. Frequency Score: Saturates at 10 occurrences
        freq_score = min(1.0, occurrences / 10.0)
        
        # 2. Sequence Consistency: Longer consistent sequences give higher signal
        seq_score = min(1.0, 0.6 + (sequence_length * 0.1))
        
        # 3. Temporal Consistency: Predictable interval timing
        time_score = max(0.5, min(1.0, interval_std_ratio))
        
        # 4. Context Match: Extension and directory context
        context_score = 1.0 if context_match else 0.6
        
        # 5. AI Confidence
        ai_score = max(0.0, min(1.0, ai_confidence))
        
        # Weighted linear combination
        total = (
            (0.30 * freq_score) +
            (0.25 * seq_score) +
            (0.20 * time_score) +
            (0.10 * context_score) +
            (0.15 * ai_score)
        )
        
        return round(min(0.99, max(0.40, total)), 2)
