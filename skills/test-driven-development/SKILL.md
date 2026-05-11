---
name: test-driven-development
description: Write tests before implementation when adding features, fixing bugs, or refactoring Express routes, service functions, React components, or Redux slices in GSM-APP.
license: Proprietary
metadata:
  author: gsm-app
  version: "1.0"
compatibility: Node.js 18+, Jest, React Testing Library, Supertest
---

# Test-Driven Development

Write the failing test first. Watch it fail. Write minimal code to pass it.

No production code without a failing test. Wrote code first? Delete it.

## Cycle

**RED** → write one failing test for one behavior  
**GREEN** → write the minimum code to pass it  
**REFACTOR** → clean up with tests still passing  

Run the test after each step. Never skip the failure verification.

## How to test each layer in this codebase

**Express route** — use Supertest against the full app:
```js
// tests/routes/orders.test.js
const request = require('supertest');
const app = require('../../app');

test('returns 401 when not authenticated', async () => {
  const res = await request(app).post('/api/orders').send({ clientId: 1 });
  expect(res.status).toBe(401);
});
```

**Redux slice** — call the reducer directly, no store needed:
```js
import reducer, { setFilter } from '../../features/slices/ordersSlice';

test('setFilter updates filter', () => {
  expect(reducer(undefined, setFilter('pending')).filter).toBe('pending');
});
```

**React component** — use React Testing Library, query by role or label:
```jsx
test('muestra error si no hay cliente seleccionado', async () => {
  render(<Provider store={store}><OrderForm /></Provider>);
  await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
  expect(await screen.findByText(/seleccioná un cliente/i)).toBeInTheDocument();
});
```

Run commands:
```bash
npx jest tests/routes/orders.test.js          # one backend test
cd client && npx react-scripts test --watchAll=false  # all frontend tests
```

## Gotchas

- **Test passes immediately**: you're testing already-existing behavior, not new behavior. Fix the test.
- **Route test returns 500 instead of expected status**: the global error handler in `app.js` is swallowing the error — check that `next(err)` is called correctly in the route.
- **Supertest hangs**: `app.js` registers cron jobs on import via `require('./jobs/...')`. Those jobs may open DB connections that prevent Jest from exiting. Add `--forceExit` to the Jest command or mock the jobs module.
- **React component test fails with "store not found"**: wrap with `<Provider store={store}>` — the component uses `useSelector` or `useDispatch`.
- **Redux thunk test is asserting on mock behavior**: mock `api/` functions, not the slice itself. The test should verify what the slice does with the returned data, not that `fetch` was called.
- **`userEvent` is undefined**: import `userEvent` from `@testing-library/user-event` — it's not in the default RTL export.

## Reference

For mocking patterns and anti-patterns, see [references/mocking.md](references/mocking.md).
