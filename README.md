# TaskFlow — Production-Ready SaaS Task Management System

TaskFlow is a multi-tenant project and task management SaaS platform inspired by productivity leaders Jira, Linear, and ClickUp, with a unique, professional B2B SaaS identity.

Built with modular Express, MongoDB Atlas, Socket.IO real-time updates, and a modern Vite + React 19 + Tailwind CSS frontend.

---

## 🌟 Feature Checklist

- [x] **1. Product Goal**: Fully functioning end-to-end multi-tenant SaaS. Zero mock buttons or fake API data.
- [x] **2. Technology Stack**: Modular Node.js + Express backend, MongoDB (Mongoose) with Prisma PostgreSQL schema specification, Socket.IO, JWT auth, Nodemailer, React 19 + Tailwind CSS.
- [x] **3. Product Design**: Original, high-velocity B2B interface. Linear/Jira productivity patterns, dark and light theme switcher, compact collapsible sidebar, clean typography.
- [x] **4. Authentication**: Registration, Login, Logout, JWT with secure cookies, Password Reset with OTP via Nodemailer, Profile management, and GitHub OAuth integration.
- [x] **5. Multi-Tenancy**: Organization & workspace creation, workspace switching, strict server-side tenant isolation (`requireWorkspaceRole` middleware), RBAC roles (`Owner`, `Admin`, `Member`, `Viewer`).
- [x] **6. Dashboard**: Workspace KPIs (Active Projects, Assigned to Me, Completion Rate, Overdue Alerts), Assigned task stream, Project health, Overdue alerts.
- [x] **7. Projects**: Project creation with unique uppercase keys (e.g. `TSK`, `ENG`), lead assignment, member directory, color badges, progress aggregation.
- [x] **8. Jira-Style Issue Management**: Atomic concurrency-safe key generation (`ProjectCounter`), title, rich markdown description, issue types (Task, Bug, Story, Epic, Improvement), statuses (Backlog, To Do, In Progress, In Review, Done, Cancelled), priorities (Lowest, Low, Medium, High, Urgent), assignees, story points, due dates, watchers, labels.
- [x] **9. Views**:
  - **Kanban Board**: Drag-and-drop between columns with optimistic UI updates and server persistence.
  - **List View**: Dense sortable table with inline status/priority editors.
  - **Table View**: Spreadsheet-style data grid with quick inspection.
  - **Filters**: Multi-filter bar by type, priority, assignee, sprint, search query with instant clearing.
- [x] **10. Issue Detail**: Slide-Over Drawer and dedicated full-page view (`/projects/:id/issues/:key`) with title editing, markdown description, comments with `@mentions`, watchers, duplicate, and delete actions.
- [x] **11. Team Collaboration**: Comments stream, comment editing/deletion with author & admin permissions, user `@mentions`, real-time Socket.IO event broadcasting.
- [x] **12. Sprints & Planning**: Agile sprint management, backlog list, move issues to sprints, start sprint with business rule enforcement (prevents multiple overlapping active sprints), complete sprint with rollover of incomplete items.
- [x] **13. Calendar & Reports**:
  - **Calendar**: Monthly grid mapping tickets to deadlines and milestone due dates.
  - **Reports**: 7-day velocity bar charts (Created vs Resolved), average cycle time, status distribution, assignee workload.
- [x] **14. Notifications**: In-app notification popover with real-time Socket.IO alerts (`notification:new`), unread count badges, mark as read, mark all read.
- [x] **15. Search & Productivity**: Global Command Palette (`Ctrl+K` / `Cmd+K`) searching across issues and projects with instant keyboard navigation, quick create modal (`C` shortcut).
- [x] **16. Settings & Billing Architecture**: Profile settings, password change, workspace settings, plan limits & entitlements view (Free, Pro, Enterprise).
- [x] **17. Database**: Relational document modeling in MongoDB with compound indexes, plus canonical normalized PostgreSQL schema in `bk/prisma/schema.prisma`.
- [x] **18. REST API**: Centralized error handling, standardized responses `{ success, data, msg }`, rate limiting, helmet security headers, healthcheck endpoint (`/api/health`).
- [x] **19. Frontend Engineering**: Clean component architecture, Context providers (`Auth`, `Workspace`, `Socket`, `Theme`), accessible UI primitives.
- [x] **20. UX Requirements**: Inline form validations, loading states, destructive action confirmations, responsive layouts.
- [x] **21. Security**: Strict server-side RBAC and tenant validation on every protected route, bcrypt hashing, rate limiting, helmet HTTP headers, IDOR protection.
- [x] **22. Testing**: Automated API integration test suite covering auth, tenant isolation, concurrency keys, kanban moves, sprint validations, and permissions.
- [x] **23. Deployment**: Dockerfile for backend, Dockerfile for frontend, Docker Compose configuration, healthcheck endpoint.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 1. Backend Setup
```bash
cd bk
npm install
# Configure your .env file (see .env.example)
npm run seed     # Seeds realistic demo users, workspace, and issues
npm run dev      # Starts Express + Socket.IO server at http://localhost:5000
```

### 2. Frontend Setup
```bash
cd fd
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

### 3. Demo Credentials
The seed script configures ready-to-test accounts:
- **Alex Rivera (Owner)**: `alex@taskflow.dev` / `password123`
- **Sarah Chen (Admin)**: `sarah@taskflow.dev` / `password123`
- **David Kim (Member)**: `david@taskflow.dev` / `password123`
- **Elena Rostova (Viewer)**: `elena@taskflow.dev` / `password123`

---

## 🧪 Running Automated Tests

Run the backend integration test suite:
```bash
cd bk
npm test
```
All 12 test suites verify:
- API health check
- Authentication & JWT issuance
- Multi-tenancy isolation and workspace boundaries
- Atomic sequential issue key generation (`TSK-1`, `TSK-2`)
- Kanban status movement
- Comments and `@mentions`
- Sprint overlapping restriction
- IDOR attack protection (rejects unauthorized workspace queries)
- Delivery analytics metrics
- Cascading delete cleanup

---

## 🐳 Docker Deployment

To launch both frontend and backend using Docker Compose:
```bash
docker compose up --build
```
- Backend will be accessible at: `http://localhost:5000`
- Frontend will be accessible at: `http://localhost:5173`

---

## 📡 API Reference

### Health
- `GET /api/health` — Service health & DB connection status

### Authentication
- `POST /api/auth/register` — Register user & bootstrap default workspace
- `POST /api/auth/login` — Login & receive JWT
- `GET /api/auth/profile` — Get authenticated user profile
- `PUT /api/auth/profile` — Update name, phone, avatar
- `PUT /api/auth/change-password` — Update password
- `POST /api/auth/forgot-password` — Send OTP via email
- `POST /api/auth/reset-password` — Verify OTP and reset password
- `GET /api/auth/logout` — Invalidate session

### Workspaces
- `POST /api/workspaces` — Create new workspace
- `GET /api/workspaces/my` — Get user's workspaces
- `GET /api/workspaces/:workspaceId` — Workspace details and members
- `PUT /api/workspaces/:workspaceId` — Update workspace settings (Admin/Owner)
- `DELETE /api/workspaces/:workspaceId` — Delete workspace (Owner only)
- `POST /api/workspaces/:workspaceId/invite` — Send email invitation
- `POST /api/workspaces/accept-invite` — Accept invitation token

### Projects & Issues
- `POST /api/projects` — Create project with unique key
- `GET /api/projects` — List workspace projects
- `POST /api/issues` — Create issue with atomic key `KEY-XXX`
- `GET /api/issues` — Query issues with multi-filters
- `GET /api/issues/:issueIdOrKey` — Issue detail with comments & links
- `PUT /api/issues/:issueId` — Update issue fields
- `PUT /api/issues/:issueId/move` — Move issue on Kanban board
- `DELETE /api/issues/:issueId` — Delete issue
- `POST /api/issues/:issueId/watch` — Toggle watcher

### Sprints & Planning
- `POST /api/sprints` — Create sprint
- `GET /api/sprints/project/:projectId` — Project sprints with burnup stats
- `PUT /api/sprints/:sprintId/start` — Start sprint (validates no overlapping active sprints)
- `PUT /api/sprints/:sprintId/complete` — Complete sprint and roll over open issues

### Analytics & Search
- `GET /api/analytics` — 7-day velocity, cycle time, status breakdown, workload
- `GET /api/search?q=...` — Global workspace search (Ctrl+K)
- `GET /api/notifications` — In-app alerts inbox
