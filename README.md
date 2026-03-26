# TaskOrbits 🚀

**TaskOrbits** is a modern, high-velocity, full-stack AI-first Project Management Dashboard built to help teams organize, track, and execute tasks elegantly. It blends intuitive Kanban boards with detailed analytics and a native calendar agenda all inside a unified, beautiful workspace.

---

## 🏗️ Technology Stack

This application has been engineered explicitly for speed, scalability, and robust type safety leveraging the modern Next.js ecosystem.

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL 14+](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (v6.19.2)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Drag & Drop**: `@hello-pangea/dnd`
- **Icons**: `lucide-react`, `react-icons`

---

## ✨ Features and Capabilities

### 1. Robust Onboarding & Authentication
Seamless user entry pathways supporting individual professionals or enterprise organizations.
* **Authentication**: Token-based secure account creation and login.
* **Team Linking**: Unique multi-step onboarding flows asking you to build and customize your `Organization` and `Team` hierarchies before hitting the dashboard.

### 2. Intelligent Dashboard Suite
The main dashboard gives you extreme oversight over everything assigned to you or your team:
* **Metric Cards**: Real-time evaluation of completion rates and total backlog size.
* **Progress Graphs**: Weekly insight charts visualizing team velocity.
* **Alert Panels**: Automatically tracks when tasks slip past their established `DueDate`.
* **Activity Feeds**: An auto-generated log summarizing all major organizational changes tracking `createdAt` dates.

### 3. Dynamic Task Management (Kanban & List Mode)
Manage complex deliverables with simple interactions.
* **Drag-and-Drop Kanbans**: Visual pipelines divided by dynamic statuses (To Do, In Progress, Done). Simply drag a task column-to-column and watch the database sync automatically.
* **List Views**: Toggleable dense UI rows for users who need raw, structured data without Kanban white-space.
* **Inline Edits**: Select and alter Priorities (`Low`, `Medium`, `High`, `Urgent`) instantly on any card to update server-side flags without manual refreshes.

### 4. Interactive Team Building
* **Native API Invites**: Use the Team Tab to seamlessly insert email addresses. This injects `Invitations` into your organization linked directly to your primary database instance so collaboration can grow.

### 5. Automated Calendar Agenda
Never miss a deadline.
* The Calendar Tab actively monitors your PostgreSQL task entries. It separates cards linearly comparing their designated `DueDate` against dynamic system time, locking them intuitively into `Past Due`, `Due Today`, or `Upcoming`.

### 6. Analytics Deep-Dive
A dedicated visual dashboard parsing your exact workflow:
* **Generative Completion Rings**: Percentage-based metrics of completed workloads.
* **Pipeline Bars**: Linear tracking comparing pending versus finished projects.
* **Priority Distribution Maps**: Highlights how heavily stacked your workload is toward critical severity tasks.

---

## 🏃‍♂️ Getting Started Locally

### Prerequisites
Make sure you have Node installed (v18+) and a running instance of PostgreSQL.

### Installation

1. **Clone & Install**
   ```bash
   git clone <your-repo-url>
   cd taskorbits-v1
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` or `.env.local` file filling out your DB URL and keys.
   ```env
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/taskorbits"
   JWT_SECRET="your-super-secret-key"
   ```

3. **Prisma Setup**
   Run the Prisma generation and migration commands to shape your PostgreSQL database structure.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Launch the Server**
   ```bash
   npm run dev
   ```

Open up [http://localhost:3000](http://localhost:3000) inside your browser and start executing tasks!

---

## 📂 Project Structure Overview

*   **`/app`** - Your primary Next.js App Router handling layout roots, the landing-page components, UI routes `/dashboard`, `/authentication`, `/onboarding`, and nested REST APIs within `/api`.
*   **`/components`** - Cleanly separated UI modules holding `heroSection`, `TaskBoard`, `StatsCards`, etc.
*   **`/lib`** - Global utility exports including the `prisma.ts` singleton and authorization logic.
*   **`/prisma`** - Contains your core `schema.prisma` mapping User, Task, Organization, Team, and Invitation SQL relations.
