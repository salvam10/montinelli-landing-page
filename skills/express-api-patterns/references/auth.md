# Auth Middleware Patterns

## Session-based authentication (default)

All routes use `isAuthenticated`. There is no separate JWT session — JWT is only used for specific API tokens.

```js
// Inline guard (use when isAuthenticated is not exported from config/)
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'No autenticado' });
}
```

## Role-based access

```js
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Acceso denegado' });
}

// Usage: protect admin-only routes
router.get('/admin/orders', isAuthenticated, isAdmin, async (req, res, next) => { ... });
```

## OAuth routes

OAuth flows (Google, Facebook, GitHub) are in `routes/auth.js`. Do not duplicate them in other routers. The callback URLs must match what is registered in each provider's console and in `CLIENT_URL` env var.

## req.user shape

Populated by Passport after successful login. Contains at minimum:
- `req.user.id` — database user ID
- `req.user.role` — user role string
- `req.user.email`

Do not assume any other fields without checking `queries/users.js` for the session serialization.
