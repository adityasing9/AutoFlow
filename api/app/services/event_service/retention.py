from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.models import Event, Memory
from app.utils.logger import get_logger
import json

logger = get_logger("retention")

class RetentionManager:
    @staticmethod
    def cleanup_old_events(db: Session, detailed_days: int = 7, max_days: int = 30):
        """
        Maintains event storage efficiency:
        - Events within detailed_days remain fully detailed.
        - Events between detailed_days and max_days are summarized into daily aggregate memory records and deleted.
        - Events older than max_days are purged.
        """
        now = datetime.utcnow()
        cutoff_detailed = now - timedelta(days=detailed_days)
        cutoff_max = now - timedelta(days=max_days)
        
        # 1. Purge events older than max_days
        purged = db.query(Event).filter(Event.timestamp < cutoff_max).delete()
        if purged > 0:
            logger.info(f"Purged {purged} raw events older than {max_days} days.")
            
        # 2. Summarize events between detailed_days and max_days
        old_events = db.query(Event).filter(Event.timestamp < cutoff_detailed).all()
        if old_events:
            summary = {}
            for ev in old_events:
                key = f"{ev.event_type}_{ev.file_type}"
                summary[key] = summary.get(key, 0) + 1
                
            mem = Memory(
                memory_key=f"event_archive_{cutoff_detailed.strftime('%Y%m%d')}",
                memory_type="EVENT_SUMMARY",
                memory_value_json=json.dumps({
                    "archived_count": len(old_events),
                    "breakdown": summary,
                    "archived_at": now.isoformat()
                })
            )
            db.add(mem)
            # Remove the summarized events
            db.query(Event).filter(Event.timestamp < cutoff_detailed).delete()
            logger.info(f"Summarized and archived {len(old_events)} events into aggregated memory.")
            
        db.commit()
