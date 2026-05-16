---
name: angular-portal-e2e-test
description: Use after code is generated to write E2E tests covering the happy path of the just-built feature. Detects whether the target project uses Cypress or Playwright and follows that framework's conventions. Triggers - "viết e2e test", "thêm test cho", "e2e for X", "test luồng tạo mới", "test happy path". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 40 — E2E Test

## Purpose
After `07-write-code` (or any sub-skill) has produced a feature, write E2E tests that exercise the happy path of that feature in a real browser. Catches integration bugs unit tests miss (routing, guards, form submission, table reload).

## When to use
- Right after `12-init-entity` or `20-screen-list`/`21-screen-detail` finishes
- User asks "viết e2e test cho ...", "add e2e for ...", "test luồng ..."
- Before `50-review-code` — review reads test results to verify behavior

## Detect the test framework

Run these checks in the target project root:

1. `Glob`: look for `cypress.config.ts`, `cypress.config.js`, or `cypress/` directory → Cypress
2. `Glob`: look for `playwright.config.ts`, `playwright.config.js`, or `e2e/` directory containing `*.spec.ts` → Playwright
3. Check `package.json` `devDependencies` for `cypress` or `@playwright/test`
4. If neither found: report blocker, suggest the user install one (default to Playwright for new portals)

Use ONLY the framework already configured. Do not introduce a second framework.

## What to test (happy path coverage)

For a CRUD entity, write at minimum these specs:

### `<entity>-list.e2e.spec.ts`
- Navigate to `/<module>/<entity>` → expect at least 1 row visible (mock seed data)
- Type into the search/filter input → expect row count to change
- Click pagination next → expect page indicator updates
- Click row "Edit" action → expect URL becomes `/<module>/<entity>/update/:id`

### `<entity>-create.e2e.spec.ts`
- Click "Tạo mới" / "Create" button → expect URL becomes `/<module>/<entity>/create`
- Submit empty form → expect required-field error styling on at least one field
- Fill all required fields → click Save → expect success notify + navigation back to list
- Verify the new record appears in the list (search by code/name)

### `<entity>-update.e2e.spec.ts`
- Navigate to first row's update URL → expect form prefilled
- Modify one field → click Save → expect success notify + navigation back
- Open detail of that record → expect the modified value

### `<entity>-delete.e2e.spec.ts`
- Select a row's checkbox → click bulk delete → confirm in dialog → expect success notify + row gone

If the entity has workflow (`31-workflow-actions`), add `<entity>-workflow.e2e.spec.ts` covering submit / approve / reject.

## Naming + placement

### Cypress
- Path: `cypress/e2e/<module>/<entity>/<flow>.cy.ts`
- Example: `cypress/e2e/sales/product/product-create.cy.ts`

### Playwright
- Path: `e2e/<module>/<entity>/<flow>.e2e.spec.ts` (or follow project's existing convention)
- Example: `e2e/sales/product/product-create.e2e.spec.ts`

Always check existing tests in the project first — match their folder layout, fixture style, and helper imports rather than imposing a new convention.

## Test conventions

- Use data-test attributes when present (`[data-test="entity-create-btn"]`); fall back to text/role queries
- Wait for network idle after navigation (Playwright: `page.waitForLoadState('networkidle')`; Cypress: `cy.intercept(...)` and wait for the alias)
- Use the mock seed data from `<entity>.mock-data.ts` for first-row assertions (predictable values)
- Avoid hardcoded sleeps; use built-in waits (`expect(...).toBeVisible()`, `cy.contains(...).should(...)`)
- One scenario per spec file when flow is non-trivial; group related assertions inside one `test()` / `it()`
- Mark tests as `test.describe.configure({ mode: 'serial' })` if they share state (rare — prefer isolation)

## Run + verify

After generating specs, run them and report:

```bash
# Cypress
npx cypress run --spec "cypress/e2e/<module>/<entity>/**/*.cy.ts"

# Playwright
npx playwright test e2e/<module>/<entity>
```

Report:
- pass/fail count
- failing spec names + first error line
- if a spec fails because the feature has a real bug, route the user to `systematic-debugging` or fix the feature code (do NOT mark the test `test.skip`)
- if a spec fails because of test environment (no browser, no dev server running), surface the blocker with the exact command the user must run locally (`npm start` in another terminal, etc.)

## Anti-patterns
- Writing E2E tests without a running dev server / mock backend (tests will hang or 404)
- Asserting on transient toast text without timeout — flaky
- Testing every edge case in E2E (those belong in unit tests; E2E covers happy path + 1-2 critical errors)
- Using arbitrary `cy.wait(2000)` instead of waiting for an actual condition
- Skipping cleanup — leftover test records pollute the mock store; either reset localStorage in `beforeEach` or use unique codes per test (`code: 'TEST-' + Date.now()`)
- Mocking API calls in E2E (defeats the purpose; only mock the auth/permission layer if the dev environment requires it)
- Marking a failing test as `.skip` to make CI green
- Introducing a second framework when one is already configured
