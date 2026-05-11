---
name: react-redux-patterns
description: Write or modify React components, Redux slices, custom hooks, or pages in GSM-APP client/ following the established feature-slice architecture.
license: Proprietary
metadata:
  author: gsm-app
  version: "1.0"
compatibility: React 18, Redux Toolkit, Tailwind CSS v3, MUI v5
---

# React + Redux Patterns

## Layer responsibilities

```
client/src/
  app/        Redux store — one store.js, slices added here
  api/        Fetch wrappers per domain — no Redux, no React
  features/   Feature modules — component + slice + test co-located
  pages/      Route-level pages — compose features, no local state
  hooks/      Custom hooks — encapsulate dispatch + selector pairs
  helpers/    Pure functions — no React, no Redux, no fetch
```

## Rules

- Data fetching always goes through `createAsyncThunk` + `api/` — never raw fetch inside a component
- Every fetch call must include `credentials: 'include'` — the session cookie won't travel without it
- Slices co-locate with their feature folder — never import a slice across feature boundaries
- Derived data lives in selectors, not in Redux state
- Tailwind v3 for layout/spacing, MUI v5 for DataGrid and icons — never mix `sx` prop and Tailwind class on the same element
- Use `recharts` for charts, `date-fns` + `date-fns-tz` for dates, `@mui/x-data-grid` for tabular data with sort/filter
- All user-visible text is in Spanish

## Gotchas

- **Fetch returns 401 even when logged in**: `credentials: 'include'` is missing from the fetch call. The session cookie is not sent without it, so Passport considers the request unauthenticated.
- **`createAsyncThunk` dispatched but state stays `idle`**: the thunk threw an error but `rejectWithValue` was not called in the catch block — RTK swallows unhandled rejections silently and the `rejected` case never fires.
- **MUI DataGrid className conflict with Tailwind**: applying both `sx={{ p: 2 }}` and `className="p-2"` on the same MUI element causes specificity conflicts — pick one styling system per element.
- **Component re-renders infinitely**: `useEffect` has a dependency that changes on every render (usually an object or array created inline). Move the value outside the component or memoize it.
- **`date-fns-tz` returns wrong timezone**: the timezone string must match the IANA format (`America/Argentina/Buenos_Aires`), not abbreviations like `ART`. Check the `.env` for `TZ` var.
- **Redux state persists between tests**: using the real store in component tests means one test's dispatch affects the next. Create a fresh store per test or use `msw` to intercept API calls instead.

## Reference

Slice, thunk, and component examples: [references/patterns.md](references/patterns.md)
