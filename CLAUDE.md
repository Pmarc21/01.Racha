# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Racha is a habit-tracking/gamification app where users log actions worth points and track daily streaks. Full-stack: FastAPI (async) + React/TypeScript with Mantine UI, all dockerized.

## Development Commands

```bash
# Start all services (API :8000, Frontend :5173, DB :5433, Dozzle :8080)
make docker-up

# Stop all services
make docker-down

# Reload just the API container
make docker-reload

# Stream API logs
make docker-logs

# Rebuild a specific service after dependency changes
docker compose up --build -d <service>
```

Both API and frontend have hot reload via mounted volumes. The frontend volume excludes `/app/node_modules` to preserve container-installed deps.

## Architecture

### Backend (`app/`)

FastAPI app with async SQLAlchemy + PostgreSQL (asyncpg). Auth handled by `fastapi-users` with JWT (UUID-based user IDs).

```
main.py              → App setup, CORS, router registration, DB init on startup
core/
  database.py        → Base, User model (SQLAlchemyBaseUserTableUUID), async engine/session
  users.py           → UserManager, JWT strategy, auth_backend, current_active_user dependency
models/
  base.py            → Re-exports Base from core.database (single metadata for all models)
  user.py            → Re-exports User from core.database
  action.py          → Action model (FK to user.id as UUID)
  daily_points.py    → DailyPoints model (FK to user.id as UUID)
schemas/             → Pydantic schemas (user inherits from fastapi_users schemas)
api/v1/endpoints/    → Route handlers (actions is stub, auth is legacy/unused)
repositories/        → UserRepository (async). Points/category repos are empty shells.
services/            → All empty shells (auth, points, actions, dashboard)
domain/              → All empty shells (points rules, habit limits, trend analysis)
```

**Key pattern:** All models must share the same `Base` from `core/database.py`. New models import Base via `models/base.py`. Models must be imported in `main.py` so `create_db_and_tables()` picks them up.

**Auth flow:** fastapi-users registers its own routers in `main.py` under `/auth/jwt`, `/auth`, `/users`. Login expects `application/x-www-form-urlencoded` (OAuth2 spec). Register expects JSON `{email, password}`.

### Frontend (`frontend/`)

React 19 + TypeScript + Vite + Mantine 8 (violet theme, dark mode default).

```
main.tsx             → MantineProvider wrapping AuthGate
auth/AuthGate.tsx    → Checks localStorage for access_token, gates App vs AuthScreens
auth/AuthScreens.tsx → Login/Register forms with Mantine components
App.tsx              → Post-auth main view (currently placeholder)
```

API base URL is hardcoded to `http://localhost:8000` in AuthScreens.

### Docker

- **api**: Python 3.12-slim, uvicorn with --reload, volume mounts `./app`
- **frontend**: Node 25-alpine, npm run dev, volume mounts `./frontend` (node_modules excluded)
- **db**: PostgreSQL 16, data in named volume `postgres_data`, init script at `docker/db/init.sql`
- **dozzle**: Log viewer at :8080

DB connection string in code: `postgresql+asyncpg://racha:racha@db:5432/racha`
Host-accessible DB port: 5433

## Important Notes

- No test framework is set up yet. No CI/CD.
- No database migrations — uses `Base.metadata.create_all` on startup. Changing models requires dropping/recreating tables or manually altering.
- JWT secret is hardcoded as `"SECRET"` in `core/users.py`.
- CORS is configured for `http://localhost:5173` only.
- The `services/` and `domain/` layers are scaffolded but completely empty.
