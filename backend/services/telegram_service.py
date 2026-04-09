import os
import threading
import requests
from agent.workflow import process_message
from services.taskorbits_client import push_task_to_nextjs

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

last_update_id = None

def send_tg_reply(chat_id: str, text: str):
    if TELEGRAM_BOT_TOKEN and TELEGRAM_BOT_TOKEN != "YOUR_TELEGRAM_BOT_TOKEN":
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            timeout=5
        )

def _process_and_push(text: str, chat_id: str, update_id: int):
    """Runs in a background thread — LLM + DB push never blocks the poll loop."""
    try:
        print(f"\n[Telegram] Received message from Chat {chat_id}: '{text}'")
        result = process_message(text, source_type="telegram", source_id=str(update_id))
        if result.get("is_task"):
            decision = result.get('decision', 'auto-created')
            print(f"   -> Validation: PASS. Confidence: {result.get('confidence_score')}%. Decision: {decision}")
            success = push_task_to_nextjs(result)
            print(f"   -> Next.js DB Push Success: {success}")
            
            # Send positive feedback back to user
            title = result.get('extracted_task', {}).get('title', 'Unknown Task')
            if decision == 'pending-review':
                send_tg_reply(chat_id, f"📝 <b>Task Under Review</b>\n\nI processed your request, but wasn't 100% sure about the details. It has been sent to the <b>AI Review</b> tab on your dashboard for approval.\n\n<b>Extracted:</b> {title}")
            else:
                send_tg_reply(chat_id, f"✅ <b>Task Created Successfully!</b>\n\n<b>{title}</b> has been added directly to your active Kanban board.")
        else:
            reason = result.get('validation_reason', 'Did not recognize a clear actionable intent.')
            print(f"   -> Validation: FAIL (Not a task). Reason: {reason}")
            
            # Send failure explanation to user
            send_tg_reply(chat_id, f"❌ <b>Task Creation Failed</b>\n\nI couldn't create a task from your message.\n\n<b>Reason:</b> {reason}\n\n<b>Fix:</b> Please try rephrasing with a clear action verb (like 'Please fix...', 'Remind me to...', or 'Add task to...').")
            
    except Exception as e:
        print(f"[Telegram] Processing error for update {update_id}: {e}")
        send_tg_reply(chat_id, "⚠️ <b>Error</b>\nAn internal error occurred while trying to process your request.")

def poll_telegram():
    global last_update_id
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN":
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    params = {
        "timeout": 0,   # Short-poll to avoid conflicts with assistant bot
        "allowed_updates": ["message"]
    }
    if last_update_id:
        params["offset"] = last_update_id + 1

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()

        if data.get("ok"):
            for update in data.get("result", []):
                update_id = update["update_id"]
                last_update_id = update_id

                message = update.get("message", {})
                text = message.get("text", "")
                chat_id = str(message.get("chat", {}).get("id", ""))

                if text:
                    # Offload LLM + push to daemon thread — poll returns instantly
                    threading.Thread(
                        target=_process_and_push,
                        args=(text, chat_id, update_id),
                        daemon=True
                    ).start()

    except Exception as e:
        print(f"[Telegram] Poll error: {e}")
