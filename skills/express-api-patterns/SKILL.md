---
name: express-api-patterns
description: Write or modify Express routes, PostgreSQL queries, middleware, services, or cron jobs in GSM-APP following the established layered architecture.
license: Proprietary
metadata:
  author: gsm-app
  version: "1.0"
compatibility: Node.js 18+, Express 4, PostgreSQL, Passport.js
---

# Express API Patterns

## Layer responsibilities

```
routes/     HTTP only — parse req, call queries/services, send res
queries/    SQL only — pure async functions, no req/res ever
services/   Business logic — orchestrate queries + external calls
jobs/       Cron tasks — required at startup, must not crash server
db/         Single pg Pool export — import from here everywhere
```

## Rules

- Raw SQL never goes in `routes/` — always use `queries/`
- `req` and `res` never appear in `queries/` or `services/`
- All parameterized queries use `$1`, `$2` — never string interpolation
- Multi-table writes always use a transaction (`BEGIN`/`COMMIT`/`ROLLBACK`)
- All async errors go to `next(err)` — the global handler in `app.js` catches them
- Every non-public route gets `isAuthenticated` middleware before the handler
- Every cron job wraps its async logic in try/catch — a thrown error crashes the server on boot

## Gotchas

- **`db.getClient()` does not exist**: the pool exported from `db/` is a `pg.Pool`. For transactions use `const client = await pool.connect()`, then `client.query(...)`, and always `client.release()` in `finally`.
- **Route returns 200 with empty body**: a query returned `result.rows` but the caller forgot `.rows` — `db.query()` returns a `QueryResult` object, not an array.
- **Session lost after server restart**: sessions are stored in `var/db/sessions.db` (SQLite). If that file is deleted or the path changes, all users are logged out. The path is configured in `app.js` via `connect-sqlite3`.
- **OAuth callback fails locally**: Google/Facebook/GitHub OAuth callbacks require the exact redirect URI registered in the provider's console. In development this must match `CLIENT_URL` in `.env`.
- **`req.user` is undefined even after login**: the route is mounted before `passport.authenticate('session')` runs in `app.js`, or `passport.initialize()` is missing. Check middleware registration order.
- **Cron job runs twice**: `jobs/` files are `require()`d in `app.js`. If `app.js` is imported more than once (e.g., in tests), cron jobs register again. Use `--forceExit` in Jest or mock the jobs module.
- **Multi-table write partially committed**: a `throw` inside the try block after `BEGIN` but before `COMMIT` will leave the transaction open if `ROLLBACK` is not in the `catch`. Always use try/catch/finally with `client.release()`.

## Reference

Full route, query, and transaction examples: [references/patterns.md](references/patterns.md)  
Auth and role middleware patterns: [references/auth.md](references/auth.md)
