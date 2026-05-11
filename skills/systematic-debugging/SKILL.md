---
name: systematic-debugging
description: Debug any bug, test failure, or unexpected behavior in GSM-APP by investigating root cause before attempting fixes. Covers Express routes, PostgreSQL queries, React components, Redux slices, cron jobs, and Firebase integration.
license: Proprietary
metadata:
  author: gsm-app
  version: "1.0"
compatibility: Node.js 18+, PostgreSQL, React 18
---

# Systematic Debugging

Never propose a fix before completing root cause investigation.

## Process

**Phase 1 — Root cause (mandatory before any fix)**

1. Read the full error: stack trace, HTTP status, line numbers, file paths.
2. Reproduce it consistently. If you can't, gather more data — don't guess.
3. Check recent changes: `git diff`, new env vars, schema migrations.
4. Add boundary logs at each layer and run once to see where it breaks:

```js
console.log('[router] req.user:', req.user?.id, 'body:', req.body);
console.log('[query]  params:', params, 'rows:', rows.length);
```

5. Trace backward from the bad output to where the bad value originates.

**Phase 2 — Find a working example, diff against broken**

**Phase 3 — Form one hypothesis, make the smallest possible change, verify**

**Phase 4 — Write a failing test, fix root cause, confirm no regressions**

If 3+ fixes haven't worked: stop, question the architecture, don't attempt fix #4.

## Gotchas

- **Auth 401 on valid session**: the session middleware order in `app.js` matters — `passport.initialize()` must come before `session()`, and `passport.authenticate('session')` must come after both. Changing order breaks all sessions.
- **`req.user` is undefined inside a route**: the route is missing the `isAuthenticated` middleware, or it was mounted before `passport.authenticate('session')` runs.
- **PostgreSQL "too many clients"**: the `db/` pool is being imported in multiple places that create new pools — there is one shared pool, always import from `db/index.js`, never instantiate `new Pool()` directly.
- **Cron job crashes on startup**: jobs in `jobs/` are `require()`d at the top of `app.js` and run immediately at import. A missing env var or a DB connection failure inside a job will crash the whole server on boot.
- **Firebase admin not initialized**: `firebase-admin` initialization lives in `config/` — if a route imports from `routes/firebase.js` before the config module has been loaded, you get "app not initialized". Always check that `config/` is loaded before `routes/`.
- **Redux thunk dispatched but state never updates**: `rejectWithValue` was not called in the catch block — the thunk threw and RTK swallowed it silently. Always wrap the async call and use `rejectWithValue(err.message)`.

## Reference

For the full 4-phase methodology, see [references/phases.md](references/phases.md).
