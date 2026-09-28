import os
from pathlib import Path
from app.config.settings import settings

class SandboxViolationError(SecurityError if "SecurityError" in dir(__builtins__) else PermissionError):
    pass

class SandboxValidator:
    """
    Guarantees that automated file operations are strictly confined
    within the configured AutoFlow safe workspace. Prevents path traversal
    attacks (e.g. '../../Windows/System32').
    """
    
    @staticmethod
    def get_workspace_root() -> Path:
        p = Path(settings.WORKSPACE_DIR).resolve()
        p.mkdir(parents=True, exist_ok=True)
        return p

    @classmethod
    def resolve_safe_path(cls, path_str: str) -> Path:
        """
        Converts abstract tokens like <WORKSPACE>/... or relative paths
        to a fully validated Path within the safe workspace.
        Raises SandboxViolationError if the path escapes the sandbox.
        """
        if not path_str:
            raise SandboxViolationError("Path cannot be empty.")

        workspace_root = cls.get_workspace_root()
        
        # Replace abstract token if present
        clean_str = path_str.replace("<WORKSPACE>/", "").replace("<WORKSPACE>\\", "")
        
        target = (workspace_root / clean_str).resolve()
        
        # Security assertion: target MUST be relative to workspace_root
        try:
            target.relative_to(workspace_root)
        except ValueError:
            raise SandboxViolationError(
                f"Security violation: Target path '{path_str}' escapes sandbox '{workspace_root}'"
            )
            
        return target
