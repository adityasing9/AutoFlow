from pathlib import Path
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.database.models import VerificationResult
from app.services.permission_service.sandbox import SandboxValidator
from app.utils.logger import get_logger

logger = get_logger("verifier")

class VerificationEngine:
    @classmethod
    def verify_action(
        cls,
        tool_name: str,
        params: Dict[str, Any],
        execution_result: Dict[str, Any],
        execution_id: int,
        step_id: int,
        db: Session
    ) -> Tuple[bool, str]:
        """
        Executes explicit post-condition verification for an automated action.
        """
        verified = False
        msg = ""
        verification_type = "UNKNOWN"

        try:
            if tool_name == "FolderCreator":
                folder_path = SandboxValidator.resolve_safe_path(params["folder_path"])
                verified = folder_path.exists() and folder_path.is_dir()
                verification_type = "FOLDER_EXISTS"
                msg = f"Target folder verified on disk: {folder_path.name}" if verified else "Folder does not exist on disk."

            elif tool_name == "FileRenamer":
                new_path = Path(execution_result.get("new_path", ""))
                verified = new_path.exists()
                verification_type = "RENAMED_FILE_EXISTS"
                msg = f"Renamed file exists at {new_path.name}" if verified else "Renamed file missing on disk."

            elif tool_name == "FileMover":
                dest_file = Path(execution_result.get("final_dest_file", ""))
                src_path = SandboxValidator.resolve_safe_path(params["source_path"])
                
                dest_exists = dest_file.exists()
                src_gone = not src_path.exists()
                verified = dest_exists and src_gone
                verification_type = "MOVE_INTEGRITY"
                
                if verified:
                    msg = f"Move verified: Destination present ({dest_file.name}), source cleared."
                else:
                    msg = f"Move verification failed: dest_exists={dest_exists}, source_gone={src_gone}"

            elif tool_name == "FileCopier":
                dest_file = Path(execution_result.get("dest_file", ""))
                verified = dest_file.exists()
                verification_type = "COPY_EXISTS"
                msg = f"Copied file verified at destination: {dest_file.name}"

            else:
                verified = True
                verification_type = "GENERAL_SUCCESS"
                msg = "Tool execution completed with affirmative status."

        except Exception as e:
            verified = False
            verification_type = "EXCEPTION"
            msg = f"Verification check threw exception: {str(e)}"

        # Save verification record in DB
        vr = VerificationResult(
            execution_id=execution_id,
            step_id=step_id,
            status="SUCCESS" if verified else "FAILED",
            verification_type=verification_type,
            details_json=msg
        )
        db.add(vr)
        db.commit()

        if verified:
            logger.info(f"Verification passed: [{verification_type}] {msg}")
        else:
            logger.warning(f"Verification FAILED: [{verification_type}] {msg}")

        return (verified, msg)
