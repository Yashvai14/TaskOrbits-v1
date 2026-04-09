# backend/gmail_fetcher.py
"""Gmail IMAP fetcher for TaskOrbits.

- Connects to Gmail via IMAP using credentials from .env.local.
- Searches for unread messages.
- **Filters**: only processes emails whose *From* name or address contains the word "taskorbits" (case‑insensitive).
- Parses subject/body into a task and stores it in the DB.
- Marks processed messages as Seen.
"""

import os
import logging
from datetime import datetime
from email import utils as email_utils
from email import policy as email_policy
from email.message import EmailMessage

from imapclient import IMAPClient
import email

from sqlalchemy.orm import Session

# Adjust these imports to match your project layout
from .models import Task  # type: ignore
from .database import get_db  # type: ignore

log = logging.getLogger("gmail_fetcher")
log.setLevel(logging.INFO)


def _is_taskorbits_email(msg: EmailMessage) -> bool:
    """Return True if the email appears to be sent by TaskOrbits.

    Checks both the display name and the email address for the substring
    "taskorbits" (case‑insensitive).
    """
    from_header = msg.get("From", "")
    name, address = email_utils.parseaddr(from_header)
    return address.lower() == "taskorbits5@gmail.com"


def _parse_email(msg: EmailMessage) -> dict | None:
    """Extract a title and optional description from the message.

    - Title: first short line of the plain‑text body or the subject if the body
      is empty or the first line is too long.
    - Description: remaining body lines.
    """
    subject = msg.get("Subject", "No subject")

    # Prefer plain‑text part; fallback to HTML stripped of tags (simple fallback).
    if msg.is_multipart():
        for part in msg.iter_parts():
            if part.get_content_type() == "text/plain":
                body = part.get_content()
                break
        else:
            body = ""
    else:
        body = msg.get_content()

    lines = [ln.strip() for ln in body.splitlines() if ln.strip()]
    title = lines[0] if lines and len(lines[0]) < 80 else subject
    description = "\n".join(lines[1:]) if len(lines) > 1 else ""
    return {"title": title, "description": description}


def fetch_unread_gmail_tasks():
    """Connect to Gmail, pull unread messages from TaskOrbits, and store them.
    This function is intended to be scheduled with APScheduler.
    """
    user = os.getenv("GMAIL_USER")
    pwd = os.getenv("GMAIL_APP_PASSWORD")
    if not user or not pwd:
        log.error("GMAIL_USER / GMAIL_APP_PASSWORD not set in environment")
        return

    try:
        with IMAPClient("imap.gmail.com", ssl=True) as client:
            client.login(user, pwd)
            client.select_folder("INBOX", readonly=False)
            uids = client.search(["UNSEEN"])  # you can extend the search query later
            log.info(f"Found {len(uids)} unread Gmail messages")

            if not uids:
                return

            # Obtain a DB session (your project likely provides a generator)
            db: Session = next(get_db())

            for uid in uids:
                raw = client.fetch(uid, ["RFC822"])[uid][b"RFC822"]
                email_msg = email.message_from_bytes(raw, policy=email_policy.default)

                if not _is_taskorbits_email(email_msg):
                    # Skip unrelated mail – keep it unread so the user can see it.
                    continue

                task_data = _parse_email(email_msg)
                if not task_data:
                    continue

                new_task = Task(
                    title=task_data["title"],
                    description=task_data["description"],
                    source="gmail",
                    created_at=datetime.utcnow(),
                    status="open",
                )
                db.add(new_task)
                db.commit()
                log.info(f"Created task from email UID {uid}: {task_data['title']}")

                # Mark as Seen so we don’t re‑process it.
                client.add_flags(uid, [b"\\Seen"])

            db.close()
            client.logout()
    except Exception as e:
        log.exception(f"Error while fetching Gmail tasks: {e}")
