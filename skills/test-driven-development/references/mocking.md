# Mocking Patterns for GSM-APP Tests

## What to always mock in backend tests

```js
// Mock the DB pool — never hit the real database in unit tests
jest.mock('../../db', () => ({ query: jest.fn() }));

// Mock Firebase Admin — it tries to connect on import
jest.mock('../../config/firebase', () => ({
  admin: { messaging: () => ({ send: jest.fn() }) }
}));

// Mock nodemailer — avoid real email sends
jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail: jest.fn().mockResolvedValue({}) })
}));
```

## What to always mock in frontend tests

```js
// Mock the API layer, not fetch itself
jest.mock('../../api/ordersApi', () => ({
  fetchOrdersAPI: jest.fn().mockResolvedValue([]),
  createOrderAPI: jest.fn().mockResolvedValue({ id: 1 }),
}));
```

## Anti-patterns

- **Don't mock the module you're testing** — if you're testing `ordersSlice`, don't mock it.
- **Don't mock `db` and then assert it was called with exact SQL** — that tests the mock, not the code. Assert on the returned data shape instead.
- **Don't use `jest.spyOn` on internal functions** — test through the public interface (the route or the reducer).
- **Don't assert on class names or DOM structure** — use `getByRole`, `getByLabelText`, `getByText`. Class names change; roles don't.

## Integration vs unit

- **Unit**: mock `db`, test query functions in isolation.
- **Integration**: use Supertest against the real `app` object, mock only external services (Firebase, email, OpenAI).
- Never run integration tests against a real production database — use a test DB or mock the pool.
