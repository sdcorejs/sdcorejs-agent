# Shared Code Review Reference

Stack-neutral fallback loaded by `sdcorejs-review` for `plain-angular`,
`plain-nestjs`, `plain-nextjs`, `general`, and any profile whose
track-specific code ref is absent or not applicable. The parent skill owns the
report format and `review_context`; this file only defines what to check.

## Scope

Use this reference when a project is not classified as an SDCoreJS framework
profile, or when the review needs a general code-quality baseline.

Do not enforce SDCoreJS Angular/Core UI/NestJS/build-website conventions unless
the parent review classified the project as that SDCoreJS profile. Do not invent
missing framework dependencies. Do not require a specific package manager,
script name, source root, monorepo layout, UI library, database, validation
library, or routing convention without evidence.

## Evidence Rules

- Cite `file:line` for file-level findings.
- If the concern is architectural or scope-level, mark it as `Scope` and cite
  the files or directories inspected.
- Prefer current project conventions over generic taste.
- Mark uncertain issues as `UNCLEAR` or `Needs verification`.
- Style nits are findings only when they hide bugs, maintainability risk, or a
  documented local convention violation.

## Checklist

### Correctness And Edge Cases

- Null/undefined, empty-list, missing-id, duplicate-submit, timeout, and error
  paths are handled intentionally.
- Async flows handle cancellation, retries, stale responses, and race
  conditions where relevant.
- Boundary conditions are covered: min/max values, pagination, date/timezone,
  currency/precision, enum fallbacks, and permission states.

### Type Safety

- Avoid unreasoned `any`, unsafe casts, non-null assertions, and broad
  catch-all objects in business or security-sensitive paths.
- Prefer explicit DTOs, interfaces, schemas, discriminated unions, type guards,
  or `unknown` plus narrowing.
- Public service/API contracts should describe what the layer actually accepts
  and returns; UI-only state should stay in UI view models.

### Input Validation And Error Handling

- Inputs from users, URLs, files, external APIs, jobs, and databases are
  validated at runtime using the project's actual validation mechanism.
- Errors are mapped to useful user/API responses without leaking stack traces,
  SQL fragments, secret values, or internal implementation details.
- Empty catch blocks, swallowed promises, and broad retries without limits are
  findings.

### Security-sensitive Smells

- Do not echo secret values. Report secret findings as
  `KEY_NAME=[REDACTED]`.
- Look for authorization bypass, injection, unsafe HTML rendering, path
  traversal, open redirects, unsafe file upload handling, token leakage, PII
  logging, and dangerous shell execution.
- Security findings should include OWASP-style risk when applicable, but only
  with concrete repo evidence.

### Dependency And Import Hygiene

- Imports should respect local boundaries and not reach into another module's
  internals when a public API exists.
- Server-only dependencies must not enter browser/client bundles.
- Browser-only dependencies must not run in backend/server contexts.
- Duplicate helper logic should reuse local shared utilities or direct
  dependencies when those are actually installed.

### Maintainability And Cohesion

- Files, functions, components, services, and handlers should have clear
  responsibility.
- Flag god-functions/classes, hidden side effects, duplicated business rules,
  confusing naming, dead code, unused exports, and comments that contradict
  behavior.
- Prefer small behavior-preserving fixes. Recommend a spec/plan for broad
  refactors.

### Tests And Regression Coverage

- Important behavior should have focused tests at the appropriate level.
- Do not require a particular test runner. Use scripts and tools present in the
  target project.
- Missing tests are higher severity when the changed code handles permissions,
  money, persistence, validation, workflows, or critical UI flows.

### Performance Obviousness

- Flag obvious N+1 calls, unbounded lists, synchronous blocking work in request
  paths, expensive rendering loops, repeated allocations in hot paths, and
  oversized assets where evidence is visible.
- Do not run or require performance tools unless available or explicitly
  approved.

### Accessibility For UI Scope Only

- For UI files/components/pages, check semantic controls, labels, keyboard
  reachability, focus visibility, error announcement, image alt text, heading
  hierarchy, color contrast evidence, and reduced-motion handling.
- For backend-only scope, accessibility is N/A unless the user asked for API
  usability, error-shape accessibility, generated docs, or generated UI.

## Probe Discipline

Discover review commands from package manager, lockfile, workspace config,
`package.json` scripts, installed tools, and the original failing command. Do
not hardcode `npm` or `tsc`. Do not invent missing scripts. Do not download
probe tools without explicit approval.

Record skipped probes with evidence, for example:

```yaml
probes_skipped:
  - probe: lint
    reason: no lint script found in package.json
  - probe: accessibility
    reason: backend-only file_scope
```

## Severity Guidance

- `Critical/BLOCKER`: data loss, auth bypass, serious secret/PII leak, likely
  production crash, injection risk, severe accessibility blocker in in-scope UI,
  or broken primary flow.
- `High/REQUIRED`: likely runtime failure, important validation/auth/data
  integrity risk, major maintainability or testability problem with evidence.
- `Medium/ADVISORY`: actionable maintainability, type-safety, UX, performance,
  or test gap that should be addressed but may not block release.
- `Low/ADVISORY`: small cleanup with real local convention or readability value.
- `Info/N/A`: positive notes, checked evidence, skipped/non-applicable items.

## Anti-patterns

- Applying SDCoreJS Core UI, SDCoreJS NestJS, or build-website rules to plain
  projects.
- Recommending dependency installs as a review finding without user-approved
  migration scope.
- Treating absent scripts or absent tools as code defects.
- Printing secrets or full lines containing secrets.
- Turning preferences into blockers.
