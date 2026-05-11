# Full 4-Phase Debug Process

## Phase 1: Root Cause Investigation

Complete all steps before moving to Phase 2.

1. Read the full error message and stack trace — don't skim.
2. Reproduce consistently. Note exact steps.
3. Check `git diff` and recent commits for what changed.
4. In multi-layer systems, add diagnostic logs at every boundary and run once:
   - HTTP layer: request method, path, headers, body
   - Router layer: `req.user`, parsed params, middleware applied
   - Query layer: SQL params sent, rows returned
   - DB layer: actual query logged by PostgreSQL (`log_statement = 'all'` in dev)
5. Trace the bad value backward from where it's observed to where it originates.

## Phase 2: Pattern Analysis

1. Find a working route/component that is similar to the broken one.
2. List every difference, no matter how small.
3. Check: auth middleware order, parameterized query syntax, Redux `extraReducers` builder pattern.

## Phase 3: Hypothesis & Testing

1. Write: "I think X causes Y because Z."
2. Make the smallest possible change to test it.
3. If it doesn't work: form a new hypothesis. Do not add another change on top.

## Phase 4: Implementation

1. Write a failing test that reproduces the issue (see `test-driven-development` skill).
2. Implement the fix targeting the root cause only.
3. Run the full test suite — not just the new test.
4. If 3 different hypotheses have all failed: stop. The issue is architectural. Discuss before continuing.
