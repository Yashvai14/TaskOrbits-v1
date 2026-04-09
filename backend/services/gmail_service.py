import os
import imaplib
import email
from email.header import decode_header
from agent.workflow import process_message
from services.taskorbits_client import push_task_to_nextjs

GMAIL_USER     = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")   # Gmail App Password (not your real password)
IMAP_HOST      = "imap.gmail.com"

# ── Helpers ──────────────────────────────────────────────────────────────────

def _decode_header_value(raw: str) -> str:
    """Safely decode an email header that may be RFC-2047 encoded."""
    parts = decode_header(raw or "")
    decoded = []
    for part, enc in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(enc or "utf-8", errors="replace"))
        else:
            decoded.append(part)
    return " ".join(decoded)


def _extract_body(msg: email.message.Message) -> str:
    """Walk a (possibly multipart) email and return the first text/plain body."""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and part.get("Content-Disposition") is None:
                charset = part.get_content_charset() or "utf-8"
                return part.get_payload(decode=True).decode(charset, errors="replace")
    else:
        charset = msg.get_content_charset() or "utf-8"
        return msg.get_payload(decode=True).decode(charset, errors="replace")
    return ""


# ── Main polling function ─────────────────────────────────────────────────────

def poll_gmail():
    """
    Connect to Gmail via IMAP, fetch UNSEEN emails, run each through the
    LangGraph AI pipeline, push tasks to Next.js, then mark the email as read.
    Uses GMAIL_USER + GMAIL_APP_PASSWORD — no OAuth, no credentials.json.
    """
    if not GMAIL_USER or not GMAIL_PASSWORD:
        # Silently skip if env vars are not set
        return

    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST)
        mail.login(GMAIL_USER, GMAIL_PASSWORD)
        mail.select("inbox")

        # Search for unseen (unread) emails only from taskorbits5@gmail.com
        status, data = mail.search(None, 'UNSEEN', 'FROM', '"taskorbits5@gmail.com"')
        if status != "OK" or not data or not data[0]:
            mail.logout()
            return

        email_ids = data[0].split()
        if not email_ids:
            mail.logout()
            return
            
        print(f"[Gmail] {len(email_ids)} unread email(s) from taskorbits5@gmail.com. Processing...")

        for eid in email_ids:
            # Fetch full RFC 822 message
            _, msg_data = mail.fetch(eid, "(RFC822)")
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            subject = _decode_header_value(msg.get("Subject", ""))
            sender  = _decode_header_value(msg.get("From", ""))
            body    = _extract_body(msg)

            # Combine subject + body so the AI has full context
            full_text = f"Subject: {subject}\nFrom: {sender}\n\n{body}".strip()

            if not full_text:
                continue

            print(f"\n[Gmail] Email from {sender} | Subject: {subject[:60]}")
            print(f"        Body preview: {body[:100].strip()}...")

            # Run through LangGraph AI agent
            source_id = eid.decode()
            result = process_message(full_text, source_type="gmail", source_id=source_id)

            if result.get("is_task"):
                print(f"   -> AI: TASK detected (confidence: {result.get('confidence_score')}%)")
                success = push_task_to_nextjs(result)
                print(f"   -> Next.js push: {'OK' if success else 'FAILED'}")
                # Mark as read so we don't reprocess it next cycle
                mail.store(eid, "+FLAGS", "\\Seen")
            else:
                print(f"   -> AI: Not a task — {result.get('validation_reason')}")
                # Still mark as read to avoid re-checking non-task emails forever
                mail.store(eid, "+FLAGS", "\\Seen")

        mail.logout()

    except imaplib.IMAP4.error as e:
        print(f"[Gmail] IMAP error: {e}")
    except Exception as e:
        print(f"[Gmail] Unexpected error: {e}")
