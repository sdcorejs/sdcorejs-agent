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

### Naming And Convention Consistency

- When the resolved consistency scope is not `none`, apply
  `_refs/shared/review-consistency.md` instead of restating naming rules here.
- Compare against the project's own accepted conventions loaded through
  `sdcorejs-explore (conventions-read)`, not against generic taste.
- Report a consistency issue as `consistency`; do not relabel it as code style.

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

## Behavioral consistency baseline

Apply _refs/shared/review-consistency.md to naming/routes and comparable peers.
Load _refs/shared/review-data-completeness.md for data consumers, limits and
hardcoded assumptions; load _refs/shared/review-screen-patterns.md for UI flows.
Follow values through callers and server contracts. Test assertions must prove
the risk boundary (for example the final record beyond a cap), not merely the
request shape. Record missing evidence even in a one-line fix review.


## Evidence-backed risk baseline

For each review, preserve requested dimensions and emit review_baseline_version: 1.
Use requiredRiskCategories from _refs/shared/review-risk-contract.mjs. Emit a
risk_assessment with schema_version: 1, repository_id, current revision/diff_hash,
exact dimensions, and one row per required category. Rows contain category,
status (checked | not-applicable | no-evidence | gap), finding_refs, and either
fresh evidence (repository-relative path, one-based line, revision, diff_hash),
rule_source and confidence, or a concrete reason. Record source-only limitations.
Derive applicability from changed surfaces and bounded semantic neighbors;
never skip the baseline because the diff is small. Document-only scopes can
mark code categories not-applicable with the inspected scope as the reason.

Read _refs/shared/review-data-completeness.md for hardcoded assumptions and
complete-data claims; read _refs/shared/review-screen-patterns.md for comparable
list/detail/form/action flows. Read naming/route guidance in review-consistency.
Do not let exhaustive checklist reporting bury actionable findings.

Risk findings add risk: { category, path, semantic_role, trigger, rule_source, confidence,
test_gap, root_cause } to the existing durable finding shape. Link them from
assessment.finding_refs; retain existing severity, dimension and convention
classification. related_to may link secondary effects to the primary finding.
Use current_revision_map and current_diff_hash for freshness. A checked row
requires inspected source evidence; a missing repository is no-evidence.
Run evaluateReviewContract. risk_coverage unknown/incomplete prevents a
reviewed-complete claim; it does not fabricate a product defect. Legacy contexts
remain readable with unknown coverage. Structural validation never proves
source-to-finding effectiveness or rendered UI behavior.
