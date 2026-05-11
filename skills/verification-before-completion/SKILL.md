---
name: verification-before-completion
description: Run the actual verification command and show its output before declaring any task done, any bug fixed, or any test passing in GSM-APP. No claims without fresh evidence.
license: Proprietary
metadata:
  author: gsm-app
  version: "1.0"
---

# Verification Before Completion

Before claiming anything is done, fixed, or passing: run the command, read the output, then make the claim with that output attached.

## Gate

1. Identify what command proves the claim.
2. Run it fresh in this message.
3. Read exit code and full output.
4. Only then state the result — with the evidence.

## Commands by claim

| Claim | Command |
|-------|---------|
| Backend tests pass | `npx jest --runInBand` |
| Frontend tests pass | `cd client && npx react-scripts test --watchAll=false` |
| Route works | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/...` |
| No linter errors | `cd client && npx eslint src/ --max-warnings=0` |
| Schema is correct | `psql $DATABASE_URL -c "\d orders"` |
| Cron job registered | check server startup logs for `[cron]` lines |

## Gotchas

- **Linter passes but tests fail**: ESLint checks syntax and style, not logic. They are independent. A clean lint is not proof a route works.
- **One test passing is not "tests pass"**: always run the full suite with `--runInBand` (backend) or `--watchAll=false` (frontend) to catch regressions.
- **`curl` returns 200 but data is wrong**: check the response body, not just the status code. Pipe through `| jq .` to inspect it.
- **"The agent said it succeeded"**: agent success reports are not evidence. Run the verification command independently and read the output yourself.
- **Server not running**: backend tests via Supertest don't need the server running (Supertest starts it internally). `curl` tests do — start with `node app.js` first.
