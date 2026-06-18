---
name: sdcorejs-debug
description: Use when the user reports a non-trivial bug and asks for diagnosis — "help me debug", "trace this bug", "why is this wrong", "systematic debugging", "fix this bug" (with a multi-line repro), or any failure that resists a one-line fix and needs reproduce → isolate → hypothesize → test → root-cause. Skip for trivial one-liners (typo, missing import, obvious null) and for cosmetic "small bug" asks — those don't need the discipline. Triggers - "help me debug", "trace bug", "why is this wrong/not running", "root-cause", "systematic debugging", localized equivalents, or any bug whose first-glance fix isn't obvious. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Bash, Grep, Glob, Edit
---

# Debug — Systematic Debugging Workflow

## Purpose
Debugging is search through a hypothesis space. The fastest path is the most disciplined one: reliable repro → minimal isolation → falsifiable hypothesis → root cause. Random fixes feel productive and waste hours.

## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## When invoked
- "not working", "bug", "fix bug", "broken", "doesn't work", "error", "throws", or localized equivalents
- Stack trace, console error, failing test, unexpected output
- "why is X behaving as Y", or localized equivalents

Do NOT invoke for:
- Feature requests phrased as "should also handle X" — that's `sdcorejs-brainstorming`
- Performance tuning without a specific anomaly — that's perf work, different discipline

## Workflow

### Step 1 — Reproduce reliably
Before touching any code:
- Get the exact reproduction steps from the user (or run them yourself)
- Confirm the bug fires on demand (≥3/3 attempts). If flaky, that itself is the bug — investigate the source of nondeterminism (timing, network, ordering, test isolation) before anything else.
- Capture the **observed** behavior precisely: full error message + stack trace + console output + network response (if relevant) + the input that triggered it.
- Note the **expected** behavior in the user's words.

If you cannot reproduce, STOP and tell the user. Ask for: environment (OS, browser, node version), exact input, and a screen recording or `curl` if applicable. Do not "fix" a bug you cannot trigger.

### Step 2 — Isolate
- Reduce the repro to the smallest possible input/state that still fails.
- For frontend: shrink to one component + one event + minimal data.
- For backend: shrink to one endpoint + one payload.
- For tests: a single `it()` block.

If the bug disappears when you simplify, the variable you just removed is the suspect — re-add and bisect.

### Step 3 — Hypothesize from observation, not from "what would fix it"
Bad hypothesis: "maybe I should add a `?.` here just in case"
Good hypothesis: "the stack trace says `Cannot read 'name' of undefined` at line 42. At line 42, we do `user.name`. So `user` is undefined when this code runs. Why?"

A good hypothesis:
- Is falsifiable (you can prove it wrong with a test or a log)
- Names a specific cause, not a symptom
- Explains 100% of the observed behavior, not 60%

If you have 3+ unfalsified hypotheses → STOP. You don't have enough information. Add logging, read more code, ask the user.

### Step 4 — Test the hypothesis
- Add a `console.log` / `logger.debug` / breakpoint at the point of suspicion
- Run the repro
- Read the actual values
- Confirm or reject the hypothesis

If rejected → form a new hypothesis from the new evidence. Do not silently move on; an unfalsified theory becomes a future regression.

### Step 5 — Find the root cause, not the symptom
Symptom: form crashes when `roleId` is null.
Symptom fix: `roleId ?? '00000000-0000-0000-0000-000000000000'`
Root cause: the API returns role as `{ id: null }` for users with no role, but the DTO declares `roleId: string` (required). The contract is wrong — either DTO is `roleId: string | null` or API should omit the field.
Root cause fix: align DTO with reality and handle null at the rendering layer.

When you have a fix in mind, ask: "If I revert this fix in 6 months, will the same bug come back?" If yes, you fixed a symptom.

### Step 6 — Verify
- Run the repro → bug gone
- Run the test suite — make sure you didn't break adjacent code
- Add a regression test for the bug if one doesn't exist
- When the user wants the fix saved, hand off to `sdcorejs-git (commit mode)` with a suggested `fix(scope):` message and a body explaining the root cause.

## Stack-specific guides

### Angular (browser)
- Open DevTools first — Console, Network, Application (storage), Performance
- Angular-specific errors: `NG0100` (ExpressionChangedAfterChecked) → side-effect in template or post-render mutation. Often the fix is `effect()` / `runOutsideAngular()` / OnPush + correct signal usage.
- `RxJS` leaks → check for missing `takeUntilDestroyed()` / `unsubscribe()`
- Change detection not firing → check `OnPush` + signal/input reference equality
- Use `ng.applyChanges()` / `ng.getComponent()` in console for live inspection

### NestJS (server)
- Set `LOG_LEVEL=debug` if available, or add `Logger.debug` at decision points
- Check the request ID in logs — trace end-to-end
- TypeORM: enable `logging: ['query', 'error']` in dev datasource to see SQL
- Permissions: trace `@HasPermission` decorator → `AuthGuard` → `SdContext` middleware
- Postgres: `EXPLAIN ANALYZE <query>` for slow queries; check pg_stat_activity for locks

### Next.js (SSR)
- Differentiate server-side vs client-side: server logs go to stdout, client logs go to browser
- Hydration mismatch → server HTML differs from client first render. Common causes: `Date.now()`, `Math.random()`, locale, `window`/`document` access in render
- API routes: check `revalidate` / `cache: 'no-store'` if you see stale data

## Rules

### MUST DO
- Reproduce reliably BEFORE proposing a fix
- Read the actual error message, not your memory of similar ones
- Form falsifiable hypotheses
- Find the root cause, not the symptom
- Add a regression test if one doesn't exist
- Hand off to `sdcorejs-git (commit mode)` for a commit only after verification passes and the user wants the change saved.

### MUST NOT
- Add `try/catch` to silence an error you don't understand
- Add `?.` or `?? defaultValue` without understanding why the value is missing
- Disable a failing test to "make CI green"
- Apply a fix without confirming the repro now passes
- Apply multiple fixes simultaneously when only one was needed (you won't know which one worked)
- Use `--no-verify` to bypass hooks during debugging
- Mark a bug "fixed" without running the original repro

## Anti-patterns
- **Shotgun debugging**: changing 5 things at once and seeing if the bug disappears. You'll fix it without knowing how, and it returns 3 weeks later.
- **Confirmation bias**: only looking at evidence that supports your favorite hypothesis. Actively seek evidence that would FALSIFY it.
- **Stack-trace blindness**: scrolling past the error message to start guessing. The stack trace usually names the line and value.
- **"Works on my machine"**: not reproducing the user's environment.
- **Mocking the bug away**: replacing real data with a mock that doesn't have the failing case.
- **Symptom whack-a-mole**: same bug with different shape returns every 2 months — that's a sign you've been fixing symptoms.
- **Heroic refactor mid-debug**: "while I'm here, let me clean up this file too" — refactor AFTER the fix lands and is verified.

## When to escalate
Tell the user and ask for help when:
- You have 3+ falsified hypotheses and no new lead
- The repro requires environment access you don't have (prod data, internal API, third-party service)
- The bug surfaces in code you cannot read (closed-source dependency)
- The fix would require a breaking change to a shared contract

Frame it as: "I tried X, Y, Z. Evidence so far: .... Remaining hypotheses: A vs B. Do you have any information that rules one out?" Translate at runtime.
