import hashlib
import time
from typing import Dict, Any, Optional
from app.utils.logger import get_logger

logger = get_logger("pattern_cache")

class PatternDetectionCache:
    """
    Academic Optimization: Pattern Detection Cache
    Avoids expensive sequence mining and repeated AI intent analysis
    for identical event sequence hashes.
    
    Time Complexity:
    - Lookup: O(1) average
    - Insertion: O(1)
    """
    def __init__(self, max_size: int = 500, ttl_seconds: int = 3600):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.hits = 0
        self.misses = 0

    @staticmethod
    def generate_key(sequence: list) -> str:
        canonical_str = "->".join(str(step) for step in sequence)
        return hashlib.md5(canonical_str.encode('utf-8')).hexdigest()

    def get(self, sequence: list) -> Optional[Dict[str, Any]]:
        key = self.generate_key(sequence)
        item = self.cache.get(key)
        if not item:
            self.misses += 1
            return None
            
        # Check TTL
        if time.time() - item["timestamp"] > self.ttl_seconds:
            del self.cache[key]
            self.misses += 1
            return None
            
        self.hits += 1
        logger.info(f"Cache HIT for sequence key {key[:8]} (Total hits: {self.hits})")
        return item["data"]

    def put(self, sequence: list, data: Dict[str, Any]):
        if len(self.cache) >= self.max_size:
            # Evict oldest entry
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k]["timestamp"])
            del self.cache[oldest_key]
            
        key = self.generate_key(sequence)
        self.cache[key] = {
            "timestamp": time.time(),
            "data": data
        }

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_ratio = (self.hits / total) if total > 0 else 0.0
        return {
            "cache_size": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_ratio": round(hit_ratio, 4)
        }

    def clear(self):
        self.cache.clear()
        self.hits = 0
        self.misses = 0

pattern_cache = PatternDetectionCache()
