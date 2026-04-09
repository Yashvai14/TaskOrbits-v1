"""
TaskOrbits Telegram Assistant Bot
Full-featured personal task manager bot with commands, NL queries, and proactive notifications.
"""
import os
import time
import threading
import requests
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from agent.workflow import llm

# ── Config ──────────────────────────────────────────────────────────────────
ASSISTANT_BOT_TOKEN = os.getenv("TELEGRAM_ASSISTANT_BOT_TOKEN")
NEXTJS_URL = os.getenv("NEXTJS_URL", "http://localhost:3000")
INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "super-secret-key-123")
APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

# ── State ────────────────────────────────────────────────────────────────────
_last_update_id: int | None = None
_rate_limits: dict[str, list[float]] = defaultdict(list)   # chat_id => timestamps
_notified_deadlines: set[str] = set()   # task IDs already sent 24hr warning
_notified_urgent: set[str] = set()      # task IDs already sent <30min warning
_notified_overdue: set[str] = set()     # task IDs already sent overdue alert

RATE_LIMIT = 30   # max messages per minute per user

# ── Telegram API helpers ─────────────────────────────────────────────────────
def _tg(method: str, **kwargs):
    if not ASSISTANT_BOT_TOKEN:
        return None
    try:
        r = requests.post(
            f"https://api.telegram.org/bot{ASSISTANT_BOT_TOKEN}/{method}",
            json=kwargs,
            timeout=10
        )
        return r.json()
    except Exception as e:
        print(f"[TG] {method} error: {e}")
        return None

def send(chat_id: str, text: str, parse_mode: str = "HTML"):
    _tg("sendMessage", chat_id=chat_id, text=text[:4096], parse_mode=parse_mode)

# ── Rate limiter ─────────────────────────────────────────────────────────────
def _check_rate(chat_id: str) -> bool:
    now = time.time()
    window = [t for t in _rate_limits[chat_id] if now - t < 60]
    _rate_limits[chat_id] = window
    if len(window) >= RATE_LIMIT:
        return False
    _rate_limits[chat_id].append(now)
    return True

# ── Next.js API helpers ───────────────────────────────────────────────────────
def _headers():
    return {"Authorization": f"Bearer {INTERNAL_SECRET}"}

def get_user_by_telegram(chat_id: str) -> dict | None:
    try:
        r = requests.get(f"{NEXTJS_URL}/api/user/by-telegram/{chat_id}", headers=_headers(), timeout=5)
        if r.ok:
            data = r.json()
            return data.get("user")
    except Exception as e:
        print(f"[TG] get_user error: {e}")
    return None

def get_tasks_for_user(user_id: str) -> list:
    try:
        r = requests.get(f"{NEXTJS_URL}/api/tasks/for-user/{user_id}", headers=_headers(), timeout=5)
        if r.ok:
            return r.json().get("tasks", [])
    except Exception as e:
        print(f"[TG] get_tasks error: {e}")
    return []

def mark_task_done(task_id: str) -> bool:
    try:
        r = requests.patch(
            f"{NEXTJS_URL}/api/tasks/{task_id}",
            json={"status": "done"},
            headers=_headers(),
            timeout=5
        )
        return r.ok
    except:
        return False

def get_all_users_with_telegram() -> list:
    """Get all users who have a telegramId set, for proactive notifications."""
    try:
        r = requests.get(f"{NEXTJS_URL}/api/team/members", headers=_headers(), timeout=5)
        if r.ok:
            users = r.json().get("users", [])
            return [u for u in users if u.get("telegramId")]
    except Exception as e:
        print(f"[TG] get_all_users error: {e}")
    return []

# ── Formatting helpers ────────────────────────────────────────────────────────
PRIORITY_EMOJI = {"low": "⚪", "medium": "🟡", "high": "🔴", "urgent": "🚨"}
STATUS_EMOJI   = {"todo": "📋", "in_progress": "⚡", "done": "✅", "cancelled": "❌"}

def fmt_date(iso: str | None) -> str:
    if not iso:
        return "No deadline"
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = (dt - now).days
        rel = "today" if diff == 0 else f"tomorrow" if diff == 1 else f"in {diff}d" if diff > 0 else f"{abs(diff)}d ago"
        return f"{dt.strftime('%b %d, %I:%M %p')} ({rel})"
    except:
        return iso

def fmt_task_line(i: int, t: dict) -> str:
    pe = PRIORITY_EMOJI.get(t.get("priority", "medium"), "🟡")
    title = t.get("title", "Untitled")
    due = fmt_date(t.get("dueDate"))
    tid = t.get("id", "")[:8]
    return f"{i}. {pe} <b>{title}</b>\n   📅 {due} · ID: <code>{tid}</code>"

# ── Command handlers ──────────────────────────────────────────────────────────

def cmd_help(chat_id: str):
    send(chat_id, (
        "🤖 <b>TaskOrbits Assistant</b>\n\n"
        "<b>Commands</b>\n"
        "/mytasks — All your tasks grouped by status\n"
        "/deadlines — Upcoming deadlines in 7 days\n"
        "/overdue — Tasks past their deadline\n"
        "/done &lt;task_id&gt; — Mark a task as complete\n"
        "/task &lt;task_id&gt; — Full details of a task\n"
        "/help — This message\n\n"
        "<b>Natural Language</b>\n"
        "Just type anything! E.g.:\n"
        "• <i>What tasks do I have this week?</i>\n"
        "• <i>Is the landing page task done?</i>\n"
        "• <i>What's due tomorrow?</i>\n\n"
        f"🔗 <a href='{APP_URL}/dashboard'>Open Dashboard</a>"
    ))

def cmd_mytasks(chat_id: str, user: dict):
    tasks = get_tasks_for_user(user["id"])
    if not tasks:
        send(chat_id, "✅ No active tasks! Time to add some from the <a href='{}'>dashboard</a>.".format(APP_URL + "/dashboard"))
        return

    active = [t for t in tasks if t.get("status") != "done"]
    groups = {"todo": [], "in_progress": [], "done": []}
    for t in tasks:
        s = t.get("status", "todo")
        groups.setdefault(s, []).append(t)

    lines = [f"📋 <b>Your Tasks ({len(active)} active)</b>\n"]
    labels = {"todo": "📋 To Do", "in_progress": "⚡ In Progress", "done": "✅ Done"}
    for status, label in labels.items():
        ts = groups.get(status, [])
        if ts:
            lines.append(f"\n<b>{label}</b>")
            for i, t in enumerate(ts, 1):
                lines.append(fmt_task_line(i, t))

    lines.append(f"\n🔗 <a href='{APP_URL}/dashboard'>View Board</a>")
    send(chat_id, "\n".join(lines))

def cmd_deadlines(chat_id: str, user: dict):
    tasks = get_tasks_for_user(user["id"])
    now = datetime.now(timezone.utc)
    in_7d = []
    for t in tasks:
        if t.get("dueDate") and t.get("status") not in ["done", "cancelled"]:
            try:
                dt = datetime.fromisoformat(t["dueDate"].replace("Z", "+00:00"))
                if 0 <= (dt - now).days <= 7:
                    in_7d.append((dt, t))
            except:
                pass
    if not in_7d:
        send(chat_id, "🎉 No deadlines in the next 7 days! You're all clear.")
        return
    in_7d.sort(key=lambda x: x[0])
    lines = [f"⏰ <b>Upcoming Deadlines ({len(in_7d)})</b>\n"]
    for i, (dt, t) in enumerate(in_7d, 1):
        diff = (dt - now).days
        urgency = "🔥" if diff == 0 else "⚠️" if diff == 1 else "📅"
        lines.append(f"{i}. {urgency} <b>{t.get('title')}</b>\n   {dt.strftime('%b %d, %I:%M %p')} · {'Today' if diff == 0 else f'in {diff}d'}")
    send(chat_id, "\n".join(lines))

def cmd_overdue(chat_id: str, user: dict):
    tasks = get_tasks_for_user(user["id"])
    now = datetime.now(timezone.utc)
    overdue = []
    for t in tasks:
        if t.get("dueDate") and t.get("status") not in ["done", "cancelled"]:
            try:
                dt = datetime.fromisoformat(t["dueDate"].replace("Z", "+00:00"))
                if dt < now:
                    overdue.append((dt, t))
            except:
                pass
    if not overdue:
        send(chat_id, "🎉 No overdue tasks! Great work.")
        return
    overdue.sort(key=lambda x: x[0])
    lines = [f"🚨 <b>Overdue Tasks ({len(overdue)})</b>\n"]
    for i, (dt, t) in enumerate(overdue, 1):
        diff = abs((now - dt).days)
        lines.append(f"{i}. ❌ <b>{t.get('title')}</b>\n   Was due: {dt.strftime('%b %d')} · <b>{diff}d overdue</b>")
    lines.append(f"\n🔗 <a href='{APP_URL}/dashboard'>Fix on Dashboard</a>")
    send(chat_id, "\n".join(lines))

def cmd_done(chat_id: str, user: dict, args: str):
    if not args.strip():
        send(chat_id, "❓ Usage: /done &lt;task_id&gt;\nGet your task IDs by using /mytasks.")
        return
    task_id_prefix = args.strip().lower()
    tasks = get_tasks_for_user(user["id"])
    match = next((t for t in tasks if t["id"].startswith(task_id_prefix) or t["id"].lower() == task_id_prefix), None)
    if not match:
        send(chat_id, f"❌ No task found with ID <code>{task_id_prefix}</code>. Use /mytasks to get your task IDs.")
        return
    success = mark_task_done(match["id"])
    if success:
        send(chat_id, f'✅ <b>"{match.get("title")}"</b> marked as complete! 🎉')
    else:
        send(chat_id, "⚠️ Couldn't update the task. Please try from the dashboard.")

def cmd_task(chat_id: str, user: dict, args: str):
    if not args.strip():
        send(chat_id, "❓ Usage: /task &lt;task_id&gt;")
        return
    task_id_prefix = args.strip().lower()
    tasks = get_tasks_for_user(user["id"])
    t = next((x for x in tasks if x["id"].startswith(task_id_prefix)), None)
    if not t:
        send(chat_id, f"❌ Task <code>{task_id_prefix}</code> not found.")
        return
    pe = PRIORITY_EMOJI.get(t.get("priority", "medium"), "🟡")
    se = STATUS_EMOJI.get(t.get("status", "todo"), "📋")
    assignee = t.get("assignee", {}) or {}
    created = t.get("createdAt", "")[:10] if t.get("createdAt") else "N/A"
    send(chat_id, (
        f"{pe} <b>{t.get('title')}</b>\n\n"
        f"{t.get('description') or '<i>No description</i>'}\n\n"
        f"<b>Status:</b> {se} {t.get('status', 'todo').replace('_', ' ').title()}\n"
        f"<b>Priority:</b> {t.get('priority', 'medium').title()}\n"
        f"<b>Deadline:</b> {fmt_date(t.get('dueDate'))}\n"
        f"<b>Assigned to:</b> {assignee.get('name') or assignee.get('email') or 'Unassigned'}\n"
        f"<b>Created:</b> {created}\n\n"
        f"🔗 <a href='{APP_URL}/dashboard'>Open in Dashboard</a>"
    ))

# ── Natural Language Query ────────────────────────────────────────────────────
def handle_nl_query(chat_id: str, user: dict, text: str):
    tasks = get_tasks_for_user(user["id"])
    if not tasks:
        send(chat_id, "You don't have any tasks yet. Head to the dashboard to create some!")
        return

    def _run():
        now_str = datetime.now(timezone.utc).strftime("%A, %B %d %Y at %I:%M %p UTC")
        task_rows = []
        for t in tasks[:20]:  # cap at 20 for prompt size
            task_rows.append(
                f"- ID:{t['id'][:8]} | Title:{t.get('title')} | Status:{t.get('status')} "
                f"| Priority:{t.get('priority')} | Due:{t.get('dueDate','none')} "
                f"| Assignee:{t.get('assignee',{}).get('name','Unassigned') if t.get('assignee') else 'Unassigned'}"
            )

        prompt = f"""You are a friendly and concise Telegram task assistant for TaskOrbits.
Answer the user's question using ONLY the task data provided below. 
Keep your reply under 200 words. Use emojis sparingly. No markdown.

Current datetime: {now_str}
User name: {user.get('name') or user.get('email')}

User's task list:
{chr(10).join(task_rows)}

User's question: {text}

Respond directly and helpfully:"""

        try:
            reply = llm.invoke(prompt)
            send(chat_id, str(reply)[:2000])
        except Exception as e:
            print(f"[TG] NL query LLM error: {e}")
            send(chat_id, "🤔 I couldn't process that right now. Try /mytasks or /deadlines!")
    
    # Run in background thread so it never blocks the poll loop
    threading.Thread(target=_run, daemon=True).start()

# ── Resolver: route message to correct handler ───────────────────────────────
def handle_message(chat_id: str, text: str):
    if not _check_rate(chat_id):
        send(chat_id, "⚠️ Slow down! You're sending messages too quickly (max 30/min).")
        return

    text = text.strip()
    lower = text.lower()

    # Unauthenticated check
    user = get_user_by_telegram(chat_id)
    if not user:
        send(chat_id, (
            "🔐 Your Telegram account isn't linked yet.\n\n"
            f"Please go to <a href='{APP_URL}/dashboard/team'>Team Settings</a> "
            "and enter your Telegram Chat ID to connect your account."
        ))
        return

    # /start or /help
    if lower.startswith("/start") or lower.startswith("/help"):
        name = user.get("name") or "there"
        send(chat_id, f"👋 Welcome back, <b>{name}</b>! Ready to manage your tasks?\n")
        cmd_help(chat_id)
        return

    # /mytasks
    if lower.startswith("/mytasks"):
        cmd_mytasks(chat_id, user)
        return

    # /deadlines
    if lower.startswith("/deadlines"):
        cmd_deadlines(chat_id, user)
        return

    # /overdue
    if lower.startswith("/overdue"):
        cmd_overdue(chat_id, user)
        return

    # /done <id>
    if lower.startswith("/done"):
        cmd_done(chat_id, user, text[5:])
        return

    # /task <id>
    if lower.startswith("/task"):
        cmd_task(chat_id, user, text[5:])
        return

    # Natural language fallback
    handle_nl_query(chat_id, user, text)

# ── Proactive Notifications ───────────────────────────────────────────────────
def send_morning_briefing():
    """Runs at 9 AM — sends each user their daily task summary."""
    print("[TG] Running morning briefing notification...")
    for user in get_all_users_with_telegram():
        chat_id = user.get("telegramId")
        user_id = user.get("id")
        name = user.get("name") or "there"
        if not chat_id or not user_id:
            continue
        tasks = get_tasks_for_user(user_id)
        now = datetime.now(timezone.utc)
        due_today = [t for t in tasks if t.get("dueDate") and t.get("status") not in ["done","cancelled"]
                     and (datetime.fromisoformat(t["dueDate"].replace("Z","+00:00")) - now).days == 0]
        active = [t for t in tasks if t.get("status") not in ["done","cancelled"]]
        msg = f"☀️ <b>Good morning, {name}!</b>\n\n"
        msg += f"📊 You have <b>{len(active)} active task(s)</b>.\n"
        if due_today:
            msg += f"🔥 <b>{len(due_today)} due today:</b>\n"
            for t in due_today[:5]:
                msg += f"  • {t.get('title')}\n"
        else:
            msg += "✅ Nothing due today — have a great day!\n"
        msg += f"\n🔗 <a href='{APP_URL}/dashboard'>Open Dashboard</a>"
        send(str(chat_id), msg)

def send_deadline_reminders():
    """Runs every hour — sends 24hr warnings for upcoming deadlines."""
    for user in get_all_users_with_telegram():
        chat_id = user.get("telegramId")
        user_id = user.get("id")
        if not chat_id or not user_id:
            continue
        tasks = get_tasks_for_user(user_id)
        now = datetime.now(timezone.utc)
        for t in tasks:
            if not t.get("dueDate") or t.get("status") in ["done","cancelled"]:
                continue
            task_id = t.get("id","")
            if task_id in _notified_deadlines:
                continue
            try:
                dt = datetime.fromisoformat(t["dueDate"].replace("Z","+00:00"))
                diff_hrs = (dt - now).total_seconds() / 3600
                if 0 < diff_hrs <= 24:
                    _notified_deadlines.add(task_id)
                    send(str(chat_id), (
                        f"⏰ <b>Deadline Reminder</b>\n\n"
                        f"<b>{t.get('title')}</b> is due "
                        f"<b>{dt.strftime('%b %d at %I:%M %p')}</b> "
                        f"({int(diff_hrs)}h left)\n\n"
                        f"🔗 <a href='{APP_URL}/dashboard'>View Task</a>"
                    ))
            except:
                pass

def send_urgent_reminders():
    """Runs every 60s — fires urgent alerts for tasks due <30 min and just-overdue tasks."""
    for user in get_all_users_with_telegram():
        chat_id = user.get("telegramId")
        user_id = user.get("id")
        if not chat_id or not user_id:
            continue
        tasks = get_tasks_for_user(user_id)
        now = datetime.now(timezone.utc)
        for t in tasks:
            if not t.get("dueDate") or t.get("status") in ["done","cancelled"]:
                continue
            task_id = t.get("id","")
            try:
                dt = datetime.fromisoformat(t["dueDate"].replace("Z","+00:00"))
                diff_sec = (dt - now).total_seconds()
                diff_min = diff_sec / 60

                # ⏳ Urgent: due in 30 min or less (but not yet overdue)
                if 0 < diff_min <= 30 and task_id not in _notified_urgent:
                    _notified_urgent.add(task_id)
                    mins_left = int(diff_min)
                    send(str(chat_id), (
                        f"🔥 <b>URGENT — Task Due Soon!</b>\n\n"
                        f"<b>{t.get('title')}</b>\n"
                        f"Due in <b>{mins_left} minute{'s' if mins_left != 1 else ''}</b> "
                        f"({dt.strftime('%I:%M %p')})\n\n"
                        f"🔗 <a href='{APP_URL}/dashboard'>Open Dashboard</a>"
                    ))
                    print(f"[AssistantBot] Urgent reminder sent to {chat_id}: '{t.get('title')}' due in {mins_left}m")

                # ❌ Just went overdue (crossed deadline in last 2 min)
                elif -120 <= diff_sec < 0 and task_id not in _notified_overdue:
                    _notified_overdue.add(task_id)
                    send(str(chat_id), (
                        f"🚨 <b>Task is Now OVERDUE!</b>\n\n"
                        f"<b>{t.get('title')}</b> was due at "
                        f"<b>{dt.strftime('%b %d, %I:%M %p')}</b>\n\n"
                        f"Mark it done with /done {task_id[:8]} or "
                        f"🔗 <a href='{APP_URL}/dashboard'>update on the board</a>."
                    ))
                    print(f"[AssistantBot] Overdue alert sent to {chat_id}: '{t.get('title')}'")
            except Exception as e:
                print(f"[AssistantBot] Urgent reminder error: {e}")

def notify_task_assigned(task_id: str, task_title: str, assignee_telegram_id: str, due_date: str | None = None):
    """Called externally when a task is assigned to someone."""
    if not assignee_telegram_id:
        return
    due_str = fmt_date(due_date) if due_date else "No deadline"
    send(assignee_telegram_id, (
        f"📌 <b>New Task Assigned to You!</b>\n\n"
        f"<b>{task_title}</b>\n"
        f"📅 Due: {due_str}\n\n"
        f"🔗 <a href='{APP_URL}/dashboard'>Open Dashboard</a>"
    ))

# ── Main polling loop ─────────────────────────────────────────────────────────
def clear_webhook():
    """Delete stale Telegram webhook so short-polling works. Call once on startup."""
    if not ASSISTANT_BOT_TOKEN:
        return
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{ASSISTANT_BOT_TOKEN}/deleteWebhook",
            json={"drop_pending_updates": False},
            timeout=10
        )
        print(f"[AssistantBot] deleteWebhook: {resp.json().get('description', 'ok')}")
    except Exception as e:
        print(f"[AssistantBot] deleteWebhook warning: {e}")

def poll_assistant_bot():
    global _last_update_id
    if not ASSISTANT_BOT_TOKEN:
        return

    url = f"https://api.telegram.org/bot{ASSISTANT_BOT_TOKEN}/getUpdates"
    params = {
        "timeout": 0,               # Short-poll: returns immediately — no persistent held connection = no 409
        "allowed_updates": ["message"]
    }
    if _last_update_id:
        params["offset"] = _last_update_id + 1

    try:
        r = requests.get(url, params=params, timeout=8)
        r.raise_for_status()
        data = r.json()
        if data.get("ok"):
            for update in data.get("result", []):
                _last_update_id = update["update_id"]
                msg = update.get("message", {})
                text = msg.get("text", "")
                chat_id = str(msg.get("chat", {}).get("id", ""))
                if text and chat_id:
                    print(f"[AssistantBot] {chat_id}: '{text[:60]}'")
                    handle_message(chat_id, text)
    except Exception as e:
        print(f"[AssistantBot] Poll error: {e}")
