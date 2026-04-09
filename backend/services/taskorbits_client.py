import os
import requests
from typing import Dict, Any
from datetime import datetime, timezone

try:
    from dateutil import parser as dateutil_parser
    HAS_DATEUTIL = True
except ImportError:
    HAS_DATEUTIL = False

NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "super-secret-key-123")

def normalize_deadline(deadline_str: str) -> str | None:
    """Robustly parse any date string from the LLM and return ISO 8601 UTC string or None."""
    if not deadline_str:
        return None
    try:
        if HAS_DATEUTIL:
            dt = dateutil_parser.parse(deadline_str, default=datetime.now(timezone.utc))
        else:
            # Fallback: try native ISO parsing
            dt = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
        # Make UTC-aware if naive
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    except Exception:
        print(f"[taskorbits_client] Could not parse deadline: '{deadline_str}' — setting to null")
        return None

def push_task_to_nextjs(result: Dict[str, Any]) -> bool:
    """
    Pushes the LangGraph result to the Next.js API to save in the database.
    Only pushes if a task was extracted (i.e. is_task=True).
    """
    if not result.get('is_task') or result.get('decision') == 'discarded':
        return False
        
    extracted = result.get('extracted_task', {})
    if not extracted:
        return False

    payload = {
        "title": extracted.get("title", "Untitled Task"),
        "description": extracted.get("description", ""),
        "priority": extracted.get("priority", "medium"),
        "deadline": normalize_deadline(extracted.get("deadline")),
        "assigneeId": extracted.get("assigneeId", None),  # AI-resolved user ID
        "sourceType": result.get("source_type"),
        "sourceId": result.get("source_id"),
        "sourceUserId": result.get("source_user_id"),  # Raw platform sender ID
        "originalMessage": result.get("source_message"),
        "confidenceScore": result.get("confidence_score"),
        "extractionStatus": result.get("decision")
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {INTERNAL_API_SECRET}"
    }

    try:
        response = requests.post(
            f"{NEXTJS_URL}/api/tasks/external",
            json=payload,
            headers=headers
        )
        if response.status_code == 201:
            return True
        else:
            print(f"Error pushing to Next.js API: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"Error pushing to Next.js API: {e}")
        return False
