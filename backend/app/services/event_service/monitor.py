import os
import time
import threading
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.database.connection import SessionLocal
from app.database.models import Event
from app.services.event_service.normalizer import EventNormalizer
from app.utils.logger import get_logger

logger = get_logger("event_monitor")

class AutoFlowFileSystemHandler(FileSystemEventHandler):
    def __init__(self, on_event_callback=None):
        super().__init__()
        self.on_event_callback = on_event_callback

    def _should_ignore(self, path: str) -> bool:
        p = Path(path)
        name = p.name
        if name.startswith(".") or name.startswith("~") or name.endswith(".tmp") or name.endswith(".crdownload"):
            return True
        return False

    def _record_event(self, event_type: str, src_path: str, is_directory: bool = False, dest_path: str = None):
        if self._should_ignore(src_path):
            return
            
        norm = EventNormalizer.normalize_event(
            event_type=event_type,
            raw_path=src_path,
            is_directory=is_directory,
            extra_meta={"dest_normalized": EventNormalizer.normalize_path(dest_path)} if dest_path else None
        )
        
        db: Session = SessionLocal()
        try:
            db_event = Event(
                event_type=norm["event_type"],
                file_type=norm["file_type"],
                category=norm["category"],
                normalized_path=norm["normalized_path"],
                raw_hash=norm["raw_hash"],
                metadata_json=norm["metadata_json"],
                is_privacy_filtered=True
            )
            db.add(db_event)
            db.commit()
            db.refresh(db_event)
            
            logger.info(f"Recorded event: {db_event.event_type} on {db_event.normalized_path}")
            
            if self.on_event_callback:
                self.on_event_callback(db_event)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record event: {e}")
        finally:
            db.close()

    def on_created(self, event):
        evt_type = "FOLDER_CREATED" if event.is_directory else "FILE_CREATED"
        self._record_event(evt_type, event.src_path, event.is_directory)

    def on_moved(self, event):
        # In file systems, renaming and moving are both moved events
        src_dir = Path(event.src_path).parent
        dest_dir = Path(event.dest_path).parent
        
        if src_dir == dest_dir:
            evt_type = "FILE_RENAMED"
        else:
            evt_type = "FILE_MOVED"
            
        self._record_event(evt_type, event.src_path, event.is_directory, dest_path=event.dest_path)

    def on_deleted(self, event):
        self._record_event("FILE_DELETED", event.src_path, event.is_directory)

    def on_modified(self, event):
        # In an academic prototype, on_modified often corresponds to FILE_OPENED / content written
        if not event.is_directory:
            self._record_event("FILE_OPENED", event.src_path, is_directory=False)

class ActivityMonitor:
    def __init__(self):
        self.observer = None
        self.is_running = False
        self._lock = threading.Lock()
        self.event_callbacks = []

    def register_callback(self, cb):
        self.event_callbacks.append(cb)

    def _dispatch_callbacks(self, event_obj):
        for cb in self.event_callbacks:
            try:
                cb(event_obj)
            except Exception as e:
                logger.error(f"Error in event callback: {e}")

    def start(self, watch_dir: str = None) -> bool:
        with self._lock:
            if self.is_running:
                logger.info("Monitor is already running.")
                return True
                
            target_path = Path(watch_dir or settings.WORKSPACE_DIR).resolve()
            target_path.mkdir(parents=True, exist_ok=True)
            
            handler = AutoFlowFileSystemHandler(on_event_callback=self._dispatch_callbacks)
            self.observer = Observer()
            self.observer.schedule(handler, str(target_path), recursive=True)
            self.observer.start()
            self.is_running = True
            logger.info(f"Activity Monitoring STARTED on: {target_path}")
            return True

    def stop(self) -> bool:
        with self._lock:
            if not self.is_running or not self.observer:
                logger.info("Monitor is not currently running.")
                return True
                
            self.observer.stop()
            self.observer.join(timeout=5)
            self.observer = None
            self.is_running = False
            logger.info("Activity Monitoring STOPPED.")
            return True

    def get_status(self) -> bool:
        return self.is_running

# Global singleton monitor
activity_monitor = ActivityMonitor()
