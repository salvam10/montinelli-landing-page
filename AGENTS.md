# GSM-APP — Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms. This is the **single source of truth** for AI agents.
- Each skill provides detailed patterns on-demand. Load a skill only when you need it.
- The **Auto-invoke Skills** table below tells you which skill to load for each action.

## Project Overview

GSM-APP is a fullstack sales and distribution management platform for the **Kontevo** brand, deployed on Heroku.

| Component          | Technology                                               |
| ------------------ | -------------------------------------------------------- |
| **Backend**        | Node.js 18 + Express 4                                   |
| **Frontend**       | React 18 + Redux Toolkit + React Router v6               |
| **Database**       | PostgreSQL (via `pg` pool)                               |
| **Auth**           | Passport.js (local + Google + Facebook + GitHub OAuth)   |
| **Sessions**       | express-session + connect-sqlite3 (`var/db/sessions.db`) |
| **Styling**        | Tailwind CSS v3 + MUI v5                                 |
| **Charts**         | Recharts                                                 |
| **Tables**         | @mui/x-data-grid + @tanstack/react-table                 |
| **File uploads**   | Multer + Google Cloud Storage                            |
| **Notifications**  | Firebase Admin (push) + Nodemailer (email)               |
| **AI**             | OpenAI SDK                                               |
| **Scheduled jobs** | node-cron                                                |
| **Package Manager**| npm                                                      |
| **Deployment**     | Heroku (Procfile)                                        |

---

## Available Skills

| Skill                        | Description                                                                 | URL                                                           |
| ---------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `express-api-patterns`       | Write or modify Express routes, queries, middleware, services, or cron jobs | [SKILL.md](skills/express-api-patterns/SKILL.md)              |
| `react-redux-patterns`       | Write or modify React components, Redux slices, hooks, or pages             | [SKILL.md](skills/react-redux-patterns/SKILL.md)              |
| `systematic-debugging`       | Debug any bug, test failure, or unexpected behavior                         | [SKILL.md](skills/systematic-debugging/SKILL.md)              |
| `test-driven-development`    | Write tests before implementation for any layer                             | [SKILL.md](skills/test-driven-development/SKILL.md)           |
| `verification-before-completion` | Verify with commands before claiming any task done or bug fixed         | [SKILL.md](skills/verification-before-completion/SKILL.md)    |

---

<!-- AUTO-INVOKE:START -->

## Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action                                                    | Skill                          |
| --------------------------------------------------------- | ------------------------------ |
| Creating or modifying an Express route                    | `express-api-patterns`         |
| Creating or modifying a PostgreSQL query                  | `express-api-patterns`         |
| Creating or modifying a service or middleware             | `express-api-patterns`         |
| Creating or modifying a cron job                         | `express-api-patterns`         |
| Creating or modifying a React component or page           | `react-redux-patterns`         |
| Creating or modifying a Redux slice or async thunk        | `react-redux-patterns`         |
| Creating or modifying a custom hook                       | `react-redux-patterns`         |
| Creating or modifying the API fetch layer (`client/src/api/`) | `react-redux-patterns`     |
| Debugging a bug, test failure, or unexpected behavior     | `systematic-debugging`         |
| Writing tests for any layer                               | `test-driven-development`      |
| Fixing a bug                                              | `test-driven-development`      |
| Declaring a task done, a fix complete, or tests passing   | `verification-before-completion` |

<!-- AUTO-INVOKE:END -->

---

## Architecture

```
Request → Express middleware → Route handler → queries/ → PostgreSQL
                                     |
                                     └── services/ (business logic + external calls)

Auth: Passport.js session (SQLite store) + OAuth (Google, Facebook, GitHub)
Jobs: node-cron tasks registered at startup via require() in app.js
```

## Module Structure

```
app.js              ← Entry point: middleware, routers, cron job imports
routes/             ← Express routers (one file per domain)
queries/            ← SQL query functions — pure async, no req/res
services/           ← Business logic — orchestrates queries + external calls
jobs/               ← Cron tasks — must not throw (crashes server on boot)
config/             ← Passport strategies, Firebase Admin, env config
db/                 ← Single pg.Pool export — always import from here
utils/              ← Pure helpers — no DB, no HTTP

client/src/
  app/              ← Redux store (store.js)
  api/              ← Fetch wrappers per domain — credentials: include required
  features/         ← Feature modules: component + slice + test co-located
  pages/            ← Route-level pages (compose features)
  hooks/            ← Custom hooks
  helpers/          ← Pure functions — no React, no Redux
```

## Commands

```bash
# Backend
npm start               # Production server (node app.js)
npm run devStart        # Dev server (nodemon app.js)
npx jest --runInBand    # Run backend tests

# Frontend
cd client
npm start               # Dev server
npm run build           # Production build
npx react-scripts test --watchAll=false  # Run frontend tests
```

## Key Files

| File                              | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `app.js`                          | Express server, middleware order, router mounting, cron imports |
| `db/`                             | Single `pg.Pool` — import from here for all queries   |
| `config/`                         | Passport strategies, Firebase Admin, env config       |
| `var/db/sessions.db`              | SQLite session store — deleting logs out all users    |
| `client/src/app/store.js`         | Redux store — add slice reducers here                 |
| `client/src/api/`                 | Fetch wrappers — always include `credentials: 'include'` |
| `client/src/features/slices/`     | Shared Redux slices                                   |
| `client/tailwind.config.js`       | Tailwind v3 config (NOT v4)                           |
