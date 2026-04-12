# TaskOrbits 🚀

**TaskOrbits** is a modern, high-velocity, full-stack AI-first Project Management Dashboard. Built to help teams organize, track, and execute tasks elegantly, it blends intuitive Kanban boards with detailed analytics, native calendar agendas, and autonomous AI agents. 

TaskOrbits isn't just a dashboard; it’s an automated task orchestration system. It connects directly with Slack, Telegram, and Gmail via IMAP to transform conversational messages into structured database tasks using an LLM-powered background worker. Furthermore, an **Autonomous Telegram AI Assistant** acts as your personal proxy, capable of answering queries about your tasks and preemptively reminding you of upcoming deadlines.

---

## 🏗️ Technology Stack

This application has been engineered explicitly for speed, scalability, and robust type safety leveraging the modern Next.js ecosystem and a powerful asynchronous Python backend.

### Frontend
- **Framework**: [Next.js 16.2](https://nextjs.org/) (App Router & Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (v6.19)
- **Language**: TypeScript

### AI Backend (Agent Orchestration)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with Uvicorn
- **AI Core**: [LangGraph](https://langchain-ai.github.io/langgraph/) & [LangChain](https://python.langchain.com/)
- **Local LLM Server**: [Ollama](https://ollama.ai/) (Llama-3.1 Model)
- **Scheduling**: APScheduler (For background bot polling & proactive reminders)
- **Language**: Python 3

---

## ✨ Features and Capabilities

### 1. Intelligent AI Task Orchestration (Backend)
- **Multi-Channel Ingestion**: Automatically poll Slack, Telegram, and Gmail (via IMAP) every 30 seconds.
- **LLM Parsing**: An Ollama-powered LangGraph workflow determines if an incoming message is a task, extracts titles, priorities (`Low`, `Medium`, `High`, `Urgent`), and deadlines.
- **Actionable AI Assistant**: A dedicated Telegram Assistant bot allows you to ask natural language questions (e.g., "What's on my plate today?") and receive real-time database-driven context.
- **Proactive Reminders**: The backend automatically schedules Morning Briefings (9:00 AM), deadline reminders (24h warning), and urgent warnings (under 30 mins remaining).

### 2. Intelligent Dashboard Suite (Frontend)
- **Metric Cards & Deep Analytics**: Real-time evaluation of completion rates, total backlog sizes, generative completion rings, and priority distribution maps.
- **AI Sidebar Insights**: Small generative AI-powered insights pushed directly from the FastAPI backend to keep you focused.

### 3. Dynamic Task Management (Kanban & List Mode)
- **Drag-and-Drop Kanbans**: Visual pipelines divided by dynamic statuses (To Do, In Progress, Done). Simply drag a task column-to-column.
- **List Views**: Toggleable dense UI rows for complete tabular oversight.
- **Inline Edits**: Instantly alter priorities or deadlines.

### 4. Robust Onboarding & Authentication
- **Token-based Security**: Custom JWT / BcryptJS implementation.
- **Team Management Flow**: Multi-step onboarding asking you to build `Organizations` and `Teams`.
- **API Email Invites**: Send native SMTP invites right from the Team Tab using `Nodemailer`.

### 5. Automated Calendar Agenda
- Your tasks are parsed linearly into `Past Due`, `Due Today`, or `Upcoming` based on dynamic system time.

---

## 📦 Detailed Dependencies

### Frontend (`package.json`)
*   `next` (16.2.1) & `react` / `react-dom` (19.2.3)
*   `tailwindcss` (4.2.1) & `@tailwindcss/postcss` 
*   `prisma` & `@prisma/client` (6.19.2) - Next-gen Node.js and TypeScript ORM for PostgreSQL.
*   `@hello-pangea/dnd` (18.0.1) - Flawless drag-and-drop lists.
*   `framer-motion` (12.36.0) - Micro-animations and page transitions.
*   `nodemailer` (8.0.5) - Email delivery protocol.
*   `jsonwebtoken` (9.0.3) & `bcryptjs` (3.0.3) - Encryption and stateless API authentication.
*   `lucide-react` & `react-icons` - Scalable interface typography icons.

### Backend (`requirements.txt`)
*   `fastapi` (0.111.0) & `uvicorn` (0.30.1) - High performance ASGI API mapping framework.
*   `langgraph` (0.1.4) & `langchain-ollama` (0.1.0) - Graph-based multi-agent routing using local LLM inference.
*   `apscheduler` (3.10.4) - Cron-like background threading architecture.
*   `pydantic` (2.8.2) - Strict type-hint validation for webhook and agent models.
*   `requests` (2.32.3) & `python-dotenv` (1.0.1)
*   `slack_sdk` (3.31.0) - For parsing Slack channels.
*   `google-api-python-client` (2.137.0), `google-auth` - For the IMAP Gmail integration script.

---

## 📂 Project Structure Overview

*   **`/app`**: Primary Next.js routes (`/dashboard`, `/analytics`, `/calendar`, `/team`) including `route.ts` API endpoints.
*   **`/backend`**: The Python FastAPI app. Includes `/agent` (LangGraph reasoning models), `/services` (Slack, Telegram, Gmail fetchers), and `main.py` scheduling processes.
*   **`/components`**: Reusable Next.js React UI modules (`TaskBoard`, `StatsCards`, `HeroSection`).
*   **`/prisma`**: `schema.prisma` architecture mapping Users, Tasks, Organizations, and Teams.
*   **`/lib`**: Global utility exports and Prisma singletons.
*   **`/database`**: Database dump files and auxiliary scripts.

---

## 🏃‍♂️ Getting Started Locally

### Prerequisites
1.  **Node.js 18+** installed.
2.  **Python 3.10+** installed.
3.  **PostgreSQL** instance running locally or on the cloud.
4.  **Ollama** installed locally and loaded with the `llama3.1` model (`ollama run llama3.1`).

### 1. Frontend Setup
```bash
git clone <your-repo-url>
cd taskorbits-v1

# Install node modules
npm install

# Create environment variables (.env.local)
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/taskorbits"
JWT_SECRET="your-super-secret-key"
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"' > .env.local

# Generate Prisma Client & Push DB Schema
npx prisma generate
npx prisma db push

# Run the UI instance
npm run dev
```

### 2. Backend Server Setup
```bash
# From the root directory, navigate into your backend folder
cd backend

# Create Virtual Environment & Install Modules
python -m venv venv
source venv/Scripts/activate  # (Windows)
# source venv/bin/activate    # (Mac/Linux)
pip install -r requirements.txt

# You MUST configure variables. Back out & add them to .env and .env.local:
# TELEGRAM_BOT_TOKEN="your_task_bot_token"
# TELEGRAM_ASSISTANT_BOT_TOKEN="your_ai_assistant_bot_token"
# SLACK_BOT_TOKEN="your_slack_token"
# INTERNAL_API_SECRET="shared-secret-with-frontend"
```
**Important for IMAP**: You must place a valid Google Credentials file inside the backend directory to permit task generation from Gmail. The agent will read valid IMAP payloads via app passwords.

```bash
# Boot the FastAPI Server & Background Workflows
uvicorn main:app --reload
```

Open up [http://localhost:3000](http://localhost:3000) inside your browser. Chat with your Telegram bot, email your connected Gmail inbox, and watch Tasks autonomously stream into your Kanban board!
