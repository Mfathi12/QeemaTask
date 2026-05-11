# Qeema Real-Time Service Management System

Qeema is a full-stack real-time service management platform composed of:
- `qeema-backend`: Node.js + Express + Prisma + Socket.io API server
- `qeema-project`: React + Vite admin dashboard

It supports authentication, role-based authorization, service catalog management, request lifecycle tracking, and live updates for admin operations.

## Project Overview

The system manages three core entities:
- `User` (roles: `ADMIN`, `MOBILE_USER`)
- `Service` (catalog with name, category, price)
- `Request` (service requests with status: `PENDING`, `IN_PROGRESS`, `COMPLETED`)

Primary flows:
- Mobile users authenticate and create service requests.
- Admin users manage services and users.
- Admin dashboard receives real-time events for new requests and status changes over Socket.io.

## Tech Stack

Backend (`../qeema-backend`)
- Node.js, TypeScript, Express 5
- Prisma ORM (`6.19.0`) with MySQL
- JWT auth (`jsonwebtoken`), password hashing (`bcrypt`)
- Socket.io (server)

Frontend (`./`)
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Axios API layer + React Router
- Socket.io client
- React Toastify notifications

## Repository Structure

```text
task_Qeema/
├─ qeema-backend/
│  ├─ prisma/
│  └─ src/
└─ qeema-project/
   └─ src/
```

## Setup Instructions

### 1) Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- MySQL running locally

### 2) Install dependencies

Backend:
```bash
cd ../qeema-backend
npm install
```

Frontend:
```bash
cd ../qeema-project
npm install
```

## Environment Variables

### Backend (`qeema-backend/.env`)

```env
DATABASE_URL="mysql://root:password@localhost:3306/qeema_db"
SECRET_KEY="replace-with-long-random-secret"
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=
```

Optional seed variables:
```env
# SEED_ADMIN_EMAIL=admin@qeema.local
# SEED_ADMIN_PASSWORD=Admin123!
# SEED_DISABLE=true
```

### Frontend (`qeema-project/.env`)

```env
# Optional for production / explicit API host:
# VITE_API_URL=https://api.example.com

# Dev proxy target (defaults to http://localhost:3000):
# VITE_PROXY_TARGET=http://localhost:3000
```

## Prisma Migration Steps

From `qeema-backend`:

```bash
# Generate Prisma client
npm run db:generate

# Create/apply migration in development
npm run db:migrate

# Optional: inspect data
npm run db:studio
```

On server startup, seed logic runs automatically (unless disabled) to ensure base admin and initial services exist.

## Running Backend and Frontend

### Development

Terminal 1 (Backend):
```cmd
cd ../qeema-backend
npm run dev
```

Terminal 2 (Frontend):
```cmd
cd ../qeema-project
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`


## Real-Time Socket.io Flow

1. Client authenticates via REST (`/api/auth/login`) and receives JWT.
2. Client connects to Socket.io and sends token in handshake auth.
3. Server validates token in socket auth middleware.
4. If user role is `ADMIN`, socket joins admin room (`admin`).
5. Request service emits:
   - `new-request` when a new request is created
   - `request-status-updated` when admin updates status
6. Admin dashboard listens and updates UI instantly without page refresh.

## API Overview

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/health` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/services` | `MOBILE_USER`, `ADMIN` |
| GET | `/services/:id` | `MOBILE_USER`, `ADMIN` |
| POST | `/services` | `ADMIN` |
| PATCH | `/services/:id` | `ADMIN` |
| DELETE | `/services/:id` | `ADMIN` |
| POST | `/requests` | `MOBILE_USER` |
| GET | `/requests` | `MOBILE_USER`, `ADMIN` |
| GET | `/requests/:id` | `MOBILE_USER`, `ADMIN` |
| PATCH | `/requests/:id/status` | `ADMIN` |
| GET | `/admin/users` | `ADMIN` |
| GET | `/admin/users/:id` | `ADMIN` |
| POST | `/admin/users` | `ADMIN` |
| PATCH | `/admin/users/:id` | `ADMIN` |
| DELETE | `/admin/users/:id` | `ADMIN` |

Authentication:
- Use `Authorization: Bearer <token>` for protected endpoints.

## AI Prompting Strategy

When using AI tools (Cursor/chat agents), use structured prompts:

1. Context first
   - Mention module and goal clearly (e.g., "backend requests status validation").
2. Constraints
   - Specify "do not change API contracts" or "no schema changes."
3. Output format
   - Ask for patch-ready code, test commands, and risk notes.
4. Verification demand
   - Require `tsc`, lint, and endpoint sanity checks before final answer.

### API validation checklist
- Health endpoint returns `200`.
- Auth register/login returns JWT and safe user payload.
- Role guards enforce `403` for unauthorized roles.
- Request status transitions persist and broadcast real-time events.
- CRUD endpoints return consistent `{ success, message, data }` shape.

## License

Private/internal project unless otherwise specified by repository owners.
