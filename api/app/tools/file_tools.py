import os
import shutil
from pathlib import Path
from typing import Dict, Any, Tuple, List
from app.tools.base import BaseTool
from app.services.permission_service.sandbox import SandboxValidator

class FileReader(BaseTool):
    name = "FileReader"
    description = "Inspects file metadata and size within the sandbox."
    permission_requirement = "READ_FILE"
    risk_level = "LOW"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("path"):
            raise ValueError("Parameter 'path' is required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"action": "READ_METADATA", "path": params["path"], "simulated": True}

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        target = SandboxValidator.resolve_safe_path(params["path"])
        if not target.exists():
            raise FileNotFoundError(f"File not found: {params['path']}")
            
        stat = target.stat()
        return {
            "path": params["path"],
            "exists": True,
            "size_bytes": stat.st_size,
            "is_dir": target.is_dir(),
            "name": target.name
        }

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        return (execution_result.get("exists", False), "File metadata confirmed accessible.")

class FileScanner(BaseTool):
    name = "FileScanner"
    description = "Scans a folder within the workspace for files matching extension patterns."
    permission_requirement = "READ_FILE"
    risk_level = "LOW"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("folder"):
            raise ValueError("Parameter 'folder' is required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action": "SCAN_DIRECTORY",
            "folder": params["folder"],
            "pattern": params.get("pattern", "*"),
            "simulated": True
        }

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        target_dir = SandboxValidator.resolve_safe_path(params["folder"])
        pattern = params.get("pattern", "*")
        if not target_dir.exists():
            return {"folder": params["folder"], "files": [], "count": 0}
            
        files = [p.name for p in target_dir.glob(pattern) if p.is_file()]
        return {"folder": params["folder"], "files": files, "count": len(files)}

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        return (True, f"Scanned folder successfully. Discovered {execution_result.get('count', 0)} items.")

class FolderCreator(BaseTool):
    name = "FolderCreator"
    description = "Creates a destination folder within the safe workspace."
    permission_requirement = "CREATE_FOLDER"
    risk_level = "LOW"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("folder_path"):
            raise ValueError("Parameter 'folder_path' is required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"action": "CREATE_DIRECTORY", "folder": params["folder_path"], "simulated": True}

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        target = SandboxValidator.resolve_safe_path(params["folder_path"])
        created = False
        if not target.exists():
            target.mkdir(parents=True, exist_ok=True)
            created = True
        return {"folder_path": params["folder_path"], "created": created, "already_existed": not created}

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        target = SandboxValidator.resolve_safe_path(params["folder_path"])
        exists = target.exists() and target.is_dir()
        return (exists, f"Folder existence verified: {exists}")

class FileRenamer(BaseTool):
    name = "FileRenamer"
    description = "Renames a file within the sandbox."
    permission_requirement = "RENAME_FILE"
    risk_level = "LOW"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("source_path") or not params.get("new_name"):
            raise ValueError("Parameters 'source_path' and 'new_name' are required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action": "RENAME_FILE",
            "source": params["source_path"],
            "new_name": params["new_name"],
            "simulated": True
        }

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        src = SandboxValidator.resolve_safe_path(params["source_path"])
        if not src.exists():
            raise FileNotFoundError(f"Source file does not exist: {params['source_path']}")
            
        dest = src.parent / params["new_name"]
        SandboxValidator.resolve_safe_path(str(dest))
        
        src.rename(dest)
        return {"source_path": params["source_path"], "new_path": str(dest), "renamed": True}

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        dest = Path(execution_result["new_path"])
        exists = dest.exists()
        return (exists, f"Verification: Renamed file exists at {dest.name}")

class FileMover(BaseTool):
    name = "FileMover"
    description = "Moves a file from one directory to an approved destination folder in the workspace."
    permission_requirement = "MOVE_FILE"
    risk_level = "MEDIUM"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("source_path") or not params.get("dest_folder"):
            raise ValueError("Parameters 'source_path' and 'dest_folder' are required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action": "MOVE_FILE",
            "source": params["source_path"],
            "dest_folder": params["dest_folder"],
            "simulated": True
        }

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        src = SandboxValidator.resolve_safe_path(params["source_path"])
        dest_folder = SandboxValidator.resolve_safe_path(params["dest_folder"])
        
        if not src.exists():
            raise FileNotFoundError(f"Source file does not exist: {params['source_path']}")
            
        dest_folder.mkdir(parents=True, exist_ok=True)
        dest_file = dest_folder / src.name
        
        # Handle collision safely
        if dest_file.exists():
            base_name = dest_file.stem
            ext = dest_file.suffix
            counter = 1
            while dest_file.exists():
                dest_file = dest_folder / f"{base_name}_{counter}{ext}"
                counter += 1
                
        shutil.move(str(src), str(dest_file))
        return {
            "source_path": params["source_path"],
            "dest_folder": params["dest_folder"],
            "final_dest_file": str(dest_file),
            "moved": True
        }

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        dest_path = Path(execution_result["final_dest_file"])
        src_path = SandboxValidator.resolve_safe_path(params["source_path"])
        
        dest_exists = dest_path.exists()
        src_gone = not src_path.exists()
        
        success = dest_exists and src_gone
        msg = f"Verification: Destination file exists ({dest_exists}), Source file removed ({src_gone})"
        return (success, msg)

class FileCopier(BaseTool):
    name = "FileCopier"
    description = "Copies a file to an approved destination folder in the workspace."
    permission_requirement = "COPY_FILE"
    risk_level = "MEDIUM"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("source_path") or not params.get("dest_folder"):
            raise ValueError("Parameters 'source_path' and 'dest_folder' are required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action": "COPY_FILE",
            "source": params["source_path"],
            "dest_folder": params["dest_folder"],
            "simulated": True
        }

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        src = SandboxValidator.resolve_safe_path(params["source_path"])
        dest_folder = SandboxValidator.resolve_safe_path(params["dest_folder"])
        
        if not src.exists():
            raise FileNotFoundError(f"Source file does not exist: {params['source_path']}")
            
        dest_folder.mkdir(parents=True, exist_ok=True)
        dest_file = dest_folder / src.name
        shutil.copy2(str(src), str(dest_file))
        return {"source_path": params["source_path"], "dest_file": str(dest_file), "copied": True}

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        dest_path = Path(execution_result["dest_file"])
        return (dest_path.exists(), f"Destination copy verified at {dest_path.name}")

class DocumentReader(BaseTool):
    name = "DocumentReader"
    description = "Extracts lightweight text preview from documents within the sandbox."
    permission_requirement = "READ_FILE"
    risk_level = "LOW"

    def validate_inputs(self, params: Dict[str, Any]) -> None:
        if not params.get("path"):
            raise ValueError("Parameter 'path' is required.")

    def simulate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"action": "READ_PREVIEW", "path": params["path"], "simulated": True}

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        target = SandboxValidator.resolve_safe_path(params["path"])
        if not target.exists():
            raise FileNotFoundError(f"File not found: {params['path']}")
            
        preview = ""
        try:
            with open(target, "r", encoding="utf-8", errors="ignore") as f:
                preview = f.read(1024)
        except Exception:
            preview = "<Binary Document Content>"
            
        return {"path": params["path"], "preview": preview, "length": len(preview)}

    def verify(self, params: Dict[str, Any], execution_result: Dict[str, Any]) -> Tuple[bool, str]:
        return (True, "Document content preview generated safely.")
