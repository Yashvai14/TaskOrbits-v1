import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, BackgroundTasks, Header, HTTPException
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
from agent.workflow import process_message
from services.taskorbits_client import push_task_to_nextjs

from services.telegram_service import poll_telegram
from services.slack_service import poll_slack
from services.gmail_service import poll_gmail
from services.assistant_bot import poll_assistant_bot, send_morning_briefing, send_deadline_reminders, send_urgent_reminders, clear_webhook

def check_system_configs():
    telegram_ok = os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_BOT_TOKEN") != "YOUR_TELEGRAM_BOT_TOKEN"
    slack_ok = os.getenv("SLACK_BOT_TOKEN") and os.getenv("SLACK_BOT_TOKEN") != "YOUR_SLACK_BOT_TOKEN"
    gmail_ok = os.path.exists('credentials.json')
    assistant_ok = bool(os.getenv("TELEGRAM_ASSISTANT_BOT_TOKEN"))
    
    print("\n" + "="*30)
    print("🤖 TaskOrbits System Heartbeat")
    print("="*30)
    print(f"✔️ Telegram  : {'Connected and Polling' if telegram_ok else 'Not Configured'}")
    print(f"✔️ Slack     : {'Connected and Polling' if slack_ok else 'Not Configured (Missing SLACK_BOT_TOKEN)'}")
    print(f"✔️ Gmail     : {'Connected and Polling' if gmail_ok else 'Not Configured (Missing credentials.json)'}")
    print(f"✔️ AI Bot    : {'Running (query + notifications)' if assistant_ok else 'Not Configured (Missing TELEGRAM_ASSISTANT_BOT_TOKEN)'}")
    print("="*30 + "\n")

app = FastAPI(title="TaskOrbits AI Backend", version="1.0")

# Use thread pool so LLM-heavy jobs don't block each other
from apscheduler.executors.pool import ThreadPoolExecutor
scheduler = BackgroundScheduler(executors={'default': ThreadPoolExecutor(10)})

# Webhook Models
class WebhookPayload(BaseModel):
    message: str
    source_type: str
    source_id: str

def process_and_push(message: str, source_type: str, source_id: str):
    print(f"Processing ({source_type}): {source_id}")
    result = process_message(message, source_type, source_id)
    if result.get("is_task"):
        success = push_task_to_nextjs(result)
        print(f"Push success ({source_id}): {success}")
    else:
        print(f"Not a task ({source_id}): {result.get('validation_reason')}")

@app.on_event("startup")
def startup_event():
    check_system_configs()
    # Clear any stale webhook before polling starts
    clear_webhook()
    # Schedule polling — task bots every 30s, assistant every 10s
    scheduler.add_job(check_system_configs, 'interval', seconds=30, max_instances=1, coalesce=True)
    scheduler.add_job(poll_gmail,   'interval', seconds=30, max_instances=1, coalesce=True)
    scheduler.add_job(poll_slack,   'interval', seconds=30, max_instances=1, coalesce=True)
    scheduler.add_job(poll_telegram,'interval', seconds=30, max_instances=1, coalesce=True)
    # Assistant bot: NL queries run in threads, so single instance is safe
    scheduler.add_job(poll_assistant_bot, 'interval', seconds=10, max_instances=1, coalesce=True)
    # Proactive notifications
    scheduler.add_job(send_morning_briefing,  'cron', hour=9, minute=0, max_instances=1, coalesce=True)
    scheduler.add_job(send_deadline_reminders,'interval', hours=1,    max_instances=1, coalesce=True)  # 24hr warnings
    scheduler.add_job(send_urgent_reminders,  'interval', seconds=60, max_instances=1, coalesce=True)  # <30min warnings
    scheduler.start()
    print("APScheduler started.")
    print("  Task bots       : every 30s")
    print("  Assistant bot   : every 10s (up to 3 concurrent)")
    print("  Urgent reminders: every 60s (tasks due <30 min or just overdue)")
    print("  Daily briefing  : 9:00 AM")
    print("  Deadline check  : hourly (24hr window)")

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.post("/webhook/ingest")
async def ingest_webhook(
    payload: WebhookPayload, 
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    internal_secret = os.getenv("INTERNAL_API_SECRET", "super-secret-key-123")
    if not authorization or authorization != f"Bearer {internal_secret}":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    background_tasks.add_task(
        process_and_push, 
        payload.message, 
        payload.source_type, 
        payload.source_id
    )
    return {"status": "accepted", "message": "Processing in background"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "taskorbits-ai"}
