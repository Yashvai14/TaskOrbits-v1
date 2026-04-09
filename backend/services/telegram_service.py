import os
import threading
import requests
from agent.workflow import process_message
from services.taskorbits_client import push_task_to_nextjs

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

last_update_id = None

def _process_and_push(text: str, chat_id: str, update_id: int):
    """Runs in a background thread — LLM + DB push never blocks the poll loop."""
    try:
        print(f"\n[Telegram] Received message from Chat {chat_id}: '{text}'")
        result = process_message(text, source_type="telegram", source_id=str(update_id))
        if result.get("is_task"):
            print(f"   -> Validation: PASS. Confidence: {result.get('confidence_score')}%. Decision: {result.get('decision')}")
            success = push_task_to_nextjs(result)
            print(f"   -> Next.js DB Push Success: {success}")
        else:
            print(f"   -> Validation: FAIL (Not a task). Reason: {result.get('validation_reason')}")
    except Exception as e:
        print(f"[Telegram] Processing error for update {update_id}: {e}")

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
