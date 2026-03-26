-- Enable the pgcrypto extension for UUID generation

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the users table

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    auth_provider TEXT DEFAULT 'email',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- Create the organizations table

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_type TEXT,
    team_size TEXT,
    logo_url TEXT,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);

--Organization Members (Roles)

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner','manager','member','freelancer')),
    joined_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

--Teams

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

--Team Members

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    UNIQUE(team_id, user_id)
);

--Invitations (Team Invite System)

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    role TEXT,
    invited_by UUID REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

--Dashboard Preferences

CREATE TABLE dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    kanban_enabled BOOLEAN DEFAULT true,
    calendar_enabled BOOLEAN DEFAULT false,
    timeline_enabled BOOLEAN DEFAULT false,
    daily_planner BOOLEAN DEFAULT false,
    ai_panel BOOLEAN DEFAULT true,
    analytics_enabled BOOLEAN DEFAULT false
);

-- projects table

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- tasks table

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),

    title TEXT NOT NULL,
    description TEXT,

    priority TEXT CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('todo','in_progress','done')) DEFAULT 'todo',

    due_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

--task_comments table

CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- AI logs

CREATE TABLE ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    prompt TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT now()
);

--google calendar tokens

CREATE TABLE calendar_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    expiry TIMESTAMP
);

--Useful Indexes (Important)

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_members_user ON organization_members(user_id);