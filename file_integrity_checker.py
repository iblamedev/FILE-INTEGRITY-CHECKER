#!/usr/bin/env python3
"""
File Integrity Checker
A comprehensive tool for detecting file tampering through hash comparison.
"""

import hashlib
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class FileIntegrityChecker:
    """Main class for file integrity checking operations."""
    
    def __init__(self, database_path: str = "integrity_database.json"):
        """Initialize the checker with a database file."""
        self.database_path = Path(database_path)
        self.database = self._load_database()
    
    def _load_database(self) -> Dict:
        """Load the integrity database from file."""
        if self.database_path.exists():
            try:
                with open(self.database_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: Could not load database: {e}")
                return {"files": {}, "metadata": {"created": datetime.now().isoformat()}}
        return {"files": {}, "metadata": {"created": datetime.now().isoformat()}}
    
    def _save_database(self) -> bool:
        """Save the integrity database to file."""
        try:
            self.database["metadata"]["last_updated"] = datetime.now().isoformat()
            with open(self.database_path, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            return True
        except IOError as e:
            print(f"Error saving database: {e}")
            return False
    
    @staticmethod
    def calculate_file_hash(file_path: str, algorithm: str = "sha256") -> Optional[str]:
        """Calculate hash of a file using specified algorithm."""
        try:
            hash_obj = hashlib.new(algorithm)
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_obj.update(chunk)
            return hash_obj.hexdigest()
        except (IOError, ValueError) as e:
            print(f"Error calculating hash for {file_path}: {e}")
            return None
    
    def add_file(self, file_path: str, description: str = "") -> bool:
        """Add a file to the integrity database."""
        file_path = os.path.abspath(file_path)
        
        if not os.path.exists(file_path):
            print(f"Error: File {file_path} does not exist")
            return False
        
        hash_value = self.calculate_file_hash(file_path)
        if hash_value is None:
            return False
        
        file_stat = os.stat(file_path)
        file_info = {
            "hash": hash_value,
            "algorithm": "sha256",
            "size": file_stat.st_size,
            "added_date": datetime.now().isoformat(),
            "last_checked": datetime.now().isoformat(),
            "description": description,
            "check_count": 1,
            "status": "verified"
        }
        
        self.database["files"][file_path] = file_info
        return self._save_database()
    
    def verify_file(self, file_path: str) -> Tuple[str, Dict]:
        """Verify a file's integrity against stored hash."""
        file_path = os.path.abspath(file_path)
        
        if file_path not in self.database["files"]:
            return "unknown", {"message": "File not in database"}
        
        if not os.path.exists(file_path):
            return "missing", {"message": "File no longer exists"}
        
        stored_info = self.database["files"][file_path]
        current_hash = self.calculate_file_hash(file_path, stored_info.get("algorithm", "sha256"))
        
        if current_hash is None:
            return "error", {"message": "Could not calculate current hash"}
        
        # Update check information
        self.database["files"][file_path]["last_checked"] = datetime.now().isoformat()
        self.database["files"][file_path]["check_count"] = stored_info.get("check_count", 0) + 1
        
        if current_hash == stored_info["hash"]:
            self.database["files"][file_path]["status"] = "verified"
            self._save_database()
            return "verified", {
                "message": "File integrity verified",
                "hash": current_hash,
                "last_checked": self.database["files"][file_path]["last_checked"]
            }
        else:
            self.database["files"][file_path]["status"] = "tampered"
            self.database["files"][file_path]["tampered_date"] = datetime.now().isoformat()
            self._save_database()
            return "tampered", {
                "message": "File has been modified",
                "expected_hash": stored_info["hash"],
                "current_hash": current_hash,
                "tampered_date": self.database["files"][file_path]["tampered_date"]
            }
    
    def verify_all_files(self) -> Dict[str, Dict]:
        """Verify all files in the database."""
        results = {}
        for file_path in self.database["files"]:
            status, info = self.verify_file(file_path)
            results[file_path] = {"status": status, "info": info}
        return results
    
    def remove_file(self, file_path: str) -> bool:
        """Remove a file from the integrity database."""
        file_path = os.path.abspath(file_path)
        if file_path in self.database["files"]:
            del self.database["files"][file_path]
            return self._save_database()
        return False
    
    def list_files(self) -> List[Dict]:
        """List all files in the database with their status."""
        files = []
        for file_path, info in self.database["files"].items():
            files.append({
                "path": file_path,
                "hash": info["hash"],
                "size": info["size"],
                "added_date": info["added_date"],
                "last_checked": info.get("last_checked", "Never"),
                "status": info.get("status", "unknown"),
                "description": info.get("description", ""),
                "check_count": info.get("check_count", 0)
            })
        return files
    
    def export_database(self, export_path: str) -> bool:
        """Export the database to a specified file."""
        try:
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(self.database, f, indent=2, ensure_ascii=False)
            return True
        except IOError as e:
            print(f"Error exporting database: {e}")
            return False
    
    def import_database(self, import_path: str, merge: bool = False) -> bool:
        """Import a database from a specified file."""
        try:
            with open(import_path, 'r', encoding='utf-8') as f:
                imported_data = json.load(f)
            
            if merge:
                self.database["files"].update(imported_data.get("files", {}))
            else:
                self.database = imported_data
            
            return self._save_database()
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error importing database: {e}")
            return False


def main():
    """Main CLI interface for the File Integrity Checker."""
    if len(sys.argv) < 2:
        print("File Integrity Checker")
        print("Usage:")
        print("  python file_integrity_checker.py add <file_path> [description]")
        print("  python file_integrity_checker.py verify <file_path>")
        print("  python file_integrity_checker.py verify-all")
        print("  python file_integrity_checker.py list")
        print("  python file_integrity_checker.py remove <file_path>")
        print("  python file_integrity_checker.py export <export_path>")
        print("  python file_integrity_checker.py import <import_path> [merge]")
        return
    
    checker = FileIntegrityChecker()
    command = sys.argv[1].lower()
    
    if command == "add":
        if len(sys.argv) < 3:
            print("Error: Please specify a file path")
            return
        file_path = sys.argv[2]
        description = sys.argv[3] if len(sys.argv) > 3 else ""
        if checker.add_file(file_path, description):
            print(f"✓ Added {file_path} to integrity database")
        else:
            print(f"✗ Failed to add {file_path}")
    
    elif command == "verify":
        if len(sys.argv) < 3:
            print("Error: Please specify a file path")
            return
        file_path = sys.argv[2]
        status, info = checker.verify_file(file_path)
        if status == "verified":
            print(f"✓ {file_path}: {info['message']}")
        elif status == "tampered":
            print(f"⚠ {file_path}: {info['message']}")
            print(f"  Expected: {info['expected_hash']}")
            print(f"  Current:  {info['current_hash']}")
        else:
            print(f"✗ {file_path}: {info['message']}")
    
    elif command == "verify-all":
        results = checker.verify_all_files()
        verified = sum(1 for r in results.values() if r["status"] == "verified")
        tampered = sum(1 for r in results.values() if r["status"] == "tampered")
        errors = len(results) - verified - tampered
        
        print(f"Verification Results:")
        print(f"  ✓ Verified: {verified}")
        print(f"  ⚠ Tampered: {tampered}")
        print(f"  ✗ Errors: {errors}")
        
        for file_path, result in results.items():
            if result["status"] != "verified":
                print(f"  {result['status'].upper()}: {file_path}")
    
    elif command == "list":
        files = checker.list_files()
        if not files:
            print("No files in database")
            return
        
        print(f"{'Status':<10} {'Path':<50} {'Size':<10} {'Checks':<8}")
        print("-" * 80)
        for file_info in files:
            status_symbol = "✓" if file_info["status"] == "verified" else "⚠" if file_info["status"] == "tampered" else "?"
            print(f"{status_symbol:<10} {file_info['path']:<50} {file_info['size']:<10} {file_info['check_count']:<8}")
    
    elif command == "remove":
        if len(sys.argv) < 3:
            print("Error: Please specify a file path")
            return
        file_path = sys.argv[2]
        if checker.remove_file(file_path):
            print(f"✓ Removed {file_path} from database")
        else:
            print(f"✗ File {file_path} not found in database")
    
    elif command == "export":
        if len(sys.argv) < 3:
            print("Error: Please specify export path")
            return
        export_path = sys.argv[2]
        if checker.export_database(export_path):
            print(f"✓ Database exported to {export_path}")
        else:
            print(f"✗ Failed to export database")
    
    elif command == "import":
        if len(sys.argv) < 3:
            print("Error: Please specify import path")
            return
        import_path = sys.argv[2]
        merge = len(sys.argv) > 3 and sys.argv[3].lower() == "merge"
        if checker.import_database(import_path, merge):
            action = "merged" if merge else "imported"
            print(f"✓ Database {action} from {import_path}")
        else:
            print(f"✗ Failed to import database")
    
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()