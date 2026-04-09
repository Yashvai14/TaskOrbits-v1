import os
import time
import threading
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from agent.workflow import process_message
from services.taskorbits_client import push_task_to_nextjs

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID")

# Start from current time so we only pick up NEW messages after boot
# +0.001 so we DON'T re-process messages sent at boot second
_latest_ts: float = time.time()

def _extract_text(message: dict) -> str:
    """Extract plain text from a Slack message — handles text field and blocks."""
    # Direct text field (most common)
    text = message.get("text", "").strip()
    if text:
        return text
    # Fallback: rich text blocks
    for block in message.get("blocks", []):
        for element in block.get("elements", []):
            for inner in element if isinstance(element, list) else element.get("elements", []):
                if isinstance(inner, dict) and inner.get("type") == "text":
                    text += inner.get("text", "")
    return text.strip()

def _process_and_push(text: str, ts: str):
    """Runs in a background thread — LLM + DB push never blocks the poll loop."""
    try:
        print(f"   -> AI processing: '{text[:80]}'")
        result = process_message(text, source_type="slack", source_id=str(ts))
        if result.get("is_task"):
            score = result.get("confidence_score")
            decision = result.get("decision")
            print(f"   -> PASS. Confidence: {score}%. Decision: {decision}")
            success = push_task_to_nextjs(result)
            print(f"   -> Next.js DB Push: {'✅ Success' if success else '❌ Failed'}")
        else:
            print(f"   -> FAIL (not a task). Reason: {result.get('validation_reason')}")
    except Exception as e:
        print(f"[Slack] Processing error: {e}")

def poll_slack():
    global _latest_ts

    if not SLACK_BOT_TOKEN or SLACK_BOT_TOKEN == "YOUR_SLACK_BOT_TOKEN":
        return

    client = WebClient(token=SLACK_BOT_TOKEN)

    try:
        # Use _latest_ts + tiny epsilon so the oldest message we saw is NOT returned again
        oldest = str(_latest_ts + 0.000001)
        print(f"Polling Slack from {oldest}...")

        result = client.conversations_history(
            channel=SLACK_CHANNEL_ID,
            oldest=oldest,
            limit=20
        )
        messages = result.get("messages", [])

        if not messages:
            return  # Nothing new

        # Process oldest → newest
        for message in reversed(messages):
            ts_str = message.get("ts", "")
            if not ts_str:
                continue

            ts_float = float(ts_str)

            # Advance our pointer to the newest ts we've seen
            if ts_float > _latest_ts:
                _latest_ts = ts_float

            # Skip bot messages and system events (subtypes like channel_join, etc.)
            if message.get("bot_id"):
                continue
            subtype = message.get("subtype", "")
            if subtype and subtype not in ("", "me_message"):
                continue

            text = _extract_text(message)
            if not text:
                print(f"[Slack] Skipping message ts={ts_str} — no text found")
                continue

            print(f"\n[Slack] Received message: '{text}'")

            # Offload LLM + push to daemon thread — poll_slack returns instantly
            threading.Thread(
                target=_process_and_push,
                args=(text, ts_str),
                daemon=True
            ).start()

    except SlackApiError as e:
        err = e.response.get("error", str(e))
        print(f"[Slack] API error: {err}")
        if err == "channel_not_found":
            print("  -> Bot is not in the channel. Run: /invite @YourBotName in Slack.")
        elif err == "missing_scope":
            print("  -> Missing OAuth scope. Add 'channels:history' in Slack App settings.")
        elif err == "not_in_channel":
            print("  -> Bot needs to be invited to the channel first.")
    except Exception as e:
        print(f"[Slack] Unexpected error: {e}")
