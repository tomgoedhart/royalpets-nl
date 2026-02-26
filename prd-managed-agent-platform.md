# PRD: OpenClaw Managed Agent Platform

## Overview
A SaaS platform that wraps OpenClaw to provide non-technical business owners with managed AI agents. Users "hire" agents (full-time, part-time, consultants, freelance teams) and pay by working hours, not tokens.

## Target Audience
- Non-technical business owners
- Team leaders who need work done without hiring human staff
- Small businesses wanting to automate operations

## Pricing Model
- Digital workers: $2/hour base rate
- Full-time agents: Discounted hourly rate
- Freelance/consultant agents: Premium hourly rate
- Team packages: Bundled pricing

## Core Features

### 1. Agent Marketplace
- Browse available pre-configured agents
- View agent profiles (personality, skills, rules)
- "Hire" agents with one click
- Different hire types: full-time, part-time, consultant, freelance team

### 2. Dashboard
- Overview of hired agents
- Real-time activity feed
- Usage tracking (hours, costs)
- Quick actions (chat, delegate task)

### 3. Agent Chat Interface
- Direct messaging with hired agents
- Group chats with multiple agents
- Thread-based conversations
- File sharing

### 4. Project Management
- Create projects
- Add/remove agents from projects
- Project-specific knowledge base
- Project chat rooms

### 5. Task Management System
- Create and delegate tasks to agents
- Kanban board view (To Do → In Progress → Review → Done)
- List view for simple task tracking
- Task details: assignee, deadline, priority, status
- Automatic task creation from chat messages

### 6. Calendar View
- Agent availability
- Scheduled tasks and deadlines
- Project timelines
- Meeting scheduling with agents

### 7. Knowledge Base
- Company-wide knowledge repository
- Project-specific knowledge
- Agent-generated documentation
- Searchable and organized by topic
- Version history

### 8. Agent Configuration
- View/edit agent personality
- Update agent rules and instructions
- Configure agent permissions
- Memory management (view/edit memory files)

### 9. Logs & Analytics
- Daily activity logs
- Agent performance metrics
- Cost tracking and billing
- Usage reports

## Technical Architecture

### Frontend
- Next.js 14+ with App Router
- shadcn/ui component library
- Tailwind CSS for styling
- React Query for server state
- Zustand for client state

### Backend
- OpenClaw Gateway API integration
- PostgreSQL for persistent data
- Redis for real-time state/cache
- WebSocket for real-time updates

### Agent Extensibility
- Plugin-style folder structure: `app/agents/[agent-name]/`
- Agent manifest system for registering pages/widgets
- Shared components library
- Config-driven UI extensions

### Authentication & Authorization
- Supabase Auth or Clerk
- Role-based access (admin, manager, viewer)
- Agent-specific permissions

## MVP Scope (Phase 1)
1. Agent marketplace (browse, view, hire)
2. Basic dashboard with hired agents
3. Simple chat interface
4. Task board (Kanban)
5. Basic knowledge base (file viewer)
6. Agent configuration (view personality/rules)
7. Usage tracking (hours logged)

## Future Enhancements (Phase 2+)
- Advanced billing with Stripe integration
- Custom agent creation wizard
- Third-party integrations (Slack, Notion, etc.)
- Mobile app
- Agent marketplace (user-created agents)
- Advanced analytics and reporting
