# Test-E2E Knowledge — Angular Portal

> E2E patterns loaded on demand by `sdcorejs-test` when the project is an Angular
> portal and the detected level is e2e. Not a dispatchable skill — no frontmatter.
> The orchestrator owns dispatch + the run/report flow. This ref carries the full
> Mode-A / Mode-B procedure the orchestrator's Step 2 points to.

## Purpose
After `07-write-code` (or any sub-skill) has produced a feature, write E2E tests that exercise the happy path of that feature in a real browser. Catches integration bugs unit tests miss (routing, guards, form submission, table reload).

## Generation modes

**Mode A — fast happy-path** (default, after code generation): the feature + its intent are already known from this session. Detect framework → write the happy-path specs in §"What to test" → run → report. No gate needed.

**Mode B — inspector-JSON / code-driven (GATED).** Trigger: the user supplies an `sd-autoid-inspector` export (JSON/POM) OR says "viết test theo file đang code / theo màn này". An inspector export is a **selector inventory, not test intent** — generating straight from it produces a useless selector dump. So DO NOT write tests immediately. Run the SDLC gate first:

1. **Brainstorm** (`sdcorejs-brainstorm`) — explore WHAT to cover with the user: which flows matter, risk areas, positive vs negative vs navigation, in/out of scope. Output 2–3 coverage options + a recommendation. No code yet.
2. **Clarify requirements** (`sdcorejs-clarify-requirements`) — hard-confirm the blockers; each unanswered one stops generation:
   - **Framework + repo** — Robot Framework / Playwright / Cypress? Path to the existing suite (e.g. `nsp-automation-test`)?
   - **Feature / page under test** + route/URL, and the JIRA/Qmetry key for the suite name.
   - **Selectors** — the inspector export (paste or file path). **Prefer the MD-POM export** — the raw JSON has only the elements array (no page URL/title); MD-POM/md-table carry `meta.pageUrl`. If only JSON is given, ask for the route/URL explicitly. Confirm autoid coverage; list elements with no autoid so the dev backfills (review skill autoId section). Note: dropdown options / toasts / dialogs (CDK overlay) aren't in the scan — capture them here.
   - **Test cases** — explicit list with type tags: Positive / Negative / Navigation. For each: steps + **expected result / assertion** (this is the intent the JSON lacks).
   - **Auth + env** — login user/role, environment (QC/UAT/…) + how URLs/creds are provided (e.g. `Variables/ENV_QC.yaml`).
   - **Test data** — inline vs data-driven (Excel `DataTest/Excel`), and any prep/cleanup.
   - **Reuse** — which Page already has keyword resources (`UI_<Page>` / High / Verification) or page objects to extend rather than recreate.
3. **Plan** (`sdcorejs-write-plan` → `sdcorejs-review-plan`) — list the test cases + a keyword/page-object inventory (NEW vs REUSE) for approval. Generation waits for explicit OK.
4. **Generate** — only now write code, per the detected framework's conventions (Robot → load `_refs/angular/e2e-robot-conventions.md`). Map each inspector autoid → a Low-level action; compose High-level flows; add Verification/assertions from the clarified expected results; build the suite. Reuse existing keywords; create only what's missing.
5. **Verify** — run the suite (or dry-run if no env), report per §"Run + verify".

The gate is mandatory for Mode B: skipping brainstorm/clarify is the top cause of ineffective generated E2E (selectors with no assertions, wrong flows, duplicated keywords).

## Detect the test framework

Run these checks in the target project root:

1. `Glob`: look for `cypress.config.ts`, `cypress.config.js`, or `cypress/` directory → Cypress
2. `Glob`: look for `playwright.config.ts`, `playwright.config.js`, or `e2e/` directory containing `*.spec.ts` → Playwright
3. `Glob`: look for `*.robot` / `*.resource`, a `KeywordLibraries/` + `Projects/` + `Variables/` layout, or `requirements.txt` containing `robotframework` → **Robot Framework** (the QC `nsp-automation-test` baseline). Then load `_refs/angular/e2e-robot-conventions.md` and follow it.
4. Check `package.json` `devDependencies` for `cypress` or `@playwright/test`
5. If none found: report blocker, suggest the user pick one (default to Playwright for new portals; Robot Framework if the QC automation repo is the target).

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

If the entity has workflow or other action buttons (the actions pack of `angular-write-code`), add `<entity>-workflow.e2e.spec.ts` (or `<entity>-actions.e2e.spec.ts`) covering the action flow — typically submit / approve / reject for workflows; export / re-sync / etc. for custom side-effects.

## Naming + placement

### Cypress
- Path: `cypress/e2e/<module>/<entity>/<flow>.cy.ts`
- Example: `cypress/e2e/sales/product/product-create.cy.ts`

### Playwright
- Path: `e2e/<module>/<entity>/<flow>.e2e.spec.ts` (or follow project's existing convention)
- Example: `e2e/sales/product/product-create.e2e.spec.ts`

### Robot Framework
- Suite: `Projects/<Project>/Tests/<JIRA-KEY> [Role] <Title>.robot`
- Keywords split across `KeywordLibraries/<Project>/{LowLevelKeywords/UI_<Page>, HighLevelKeywords/HighLevelKeywords_<Page>, VerificationKeywords/VerificationKeywords_<Page>}.resource`; suite imports `<Project>General.resource`.
- Locators = `[data-autoid="…"]` from the inspector. Full conventions + the JSON→keyword mapping: `_refs/angular/e2e-robot-conventions.md`.

Always check existing tests in the project first — match their folder layout, fixture/keyword style, and helper imports rather than imposing a new convention.

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

# Robot Framework
robot --variablefile Variables/ENV_QC.yaml --outputdir results "Projects/<Project>/Tests/<suite>.robot"
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
- **Mode B: generating tests straight from an inspector JSON without the brainstorm → clarify → plan gate** — produces selector dumps with no real assertions/flows
- Emitting raw `Browser.*` / `page.*` calls inline in a Robot suite instead of Low/High/Verification keywords
- Re-creating keywords/page objects that already exist for the page (reuse + extend; never duplicate `OPEN BROWSER`, login, networkidle)
- Hardcoding environment URLs/creds in a suite instead of `Variables/ENV_<env>.yaml`
