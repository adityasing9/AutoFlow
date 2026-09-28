import os
import hashlib
from pathlib import Path
from typing import Dict, Any, Tuple
from app.config.settings import settings

EXT_TYPE_MAP = {
    ".pdf": ("PDF", "DOCUMENT"),
    ".docx": ("DOCX", "DOCUMENT"),
    ".doc": ("DOC", "DOCUMENT"),
    ".txt": ("TXT", "DOCUMENT"),
    ".md": ("MARKDOWN", "DOCUMENT"),
    ".xlsx": ("EXCEL", "SPREADSHEET"),
    ".xls": ("EXCEL", "SPREADSHEET"),
    ".csv": ("CSV", "SPREADSHEET"),
    ".pptx": ("PPT", "PRESENTATION"),
    ".png": ("PNG", "MEDIA"),
    ".jpg": ("JPG", "MEDIA"),
    ".jpeg": ("JPG", "MEDIA"),
    ".zip": ("ZIP", "ARCHIVE"),
    ".tar": ("TAR", "ARCHIVE"),
    ".py": ("PYTHON", "CODE"),
    ".js": ("JAVASCRIPT", "CODE"),
    ".json": ("JSON", "CODE"),
}

class EventNormalizer:
    @staticmethod
    def get_hash(path_str: str) -> str:
        """Create a non-reversible SHA-256 hash to track file identity across renames/moves without leaking private path."""
        return hashlib.sha256(path_str.encode('utf-8', errors='ignore')).hexdigest()[:16]

    @staticmethod
    def normalize_path(raw_path: str) -> str:
        """Strip user home or absolute system roots and map to abstract tokens."""
        if not raw_path:
            return "<UNKNOWN>"
            
        p = Path(raw_path).resolve()
        workspace_path = Path(settings.WORKSPACE_DIR).resolve()
        
        # Check if inside workspace
        try:
            rel = p.relative_to(workspace_path)
            return f"<WORKSPACE>/{rel.as_posix()}"
        except ValueError:
            pass
            
        # Strip user home
        try:
            user_home = Path.home().resolve()
            rel = p.relative_to(user_home)
            return f"<USER_HOME>/{rel.as_posix()}"
        except ValueError:
            pass
            
        # Generic parent directory abstraction
        parent_name = p.parent.name or "ROOT"
        return f"<ROOT>/{parent_name}/{p.name}"

    @classmethod
    def classify_file(cls, path_str: str, is_directory: bool = False) -> Tuple[str, str]:
        """Returns (file_type, category)"""
        if is_directory:
            return ("DIRECTORY", "FOLDER")
            
        ext = Path(path_str).suffix.lower()
        return EXT_TYPE_MAP.get(ext, ("UNKNOWN", "OTHER"))

    @classmethod
    def normalize_event(
        cls,
        event_type: str,
        raw_path: str,
        is_directory: bool = False,
        extra_meta: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Transforms a raw system event into a privacy-preserving normalized event."""
        file_type, category = cls.classify_file(raw_path, is_directory)
        normalized_path = cls.normalize_path(raw_path)
        raw_hash = cls.get_hash(raw_path)
        
        meta = extra_meta or {}
        meta["extension"] = Path(raw_path).suffix.lower() if not is_directory else "dir"
        meta["is_directory"] = is_directory
        
        return {
            "event_type": event_type,
            "file_type": file_type,
            "category": category,
            "normalized_path": normalized_path,
            "raw_hash": raw_hash,
            "metadata_json": str(meta),
            "is_privacy_filtered": True
        }
