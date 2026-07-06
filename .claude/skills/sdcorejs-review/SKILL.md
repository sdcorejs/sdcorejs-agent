---
name: sdcorejs-review
description: Read-only review/audit skill across SDCoreJS tracks. Use for code, architecture, security, performance, accessibility, existing-site audits, scored/full audits, or auto review after an executor. Detects stack/dimension, loads matching review refs, and reports actionable findings with file:line and fix. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Glob, Grep, Bash
---

# Review (unified, track + dimension aware)

## Purpose
One skill, every stack, five dimensions. Audit generated or modified code against
the conventions of whichever SDCoreJS track the project belongs to. **Read-only**:
surface violations the human reviewer should fix; never edit files. Auto-fix belongs
to `sdcorejs-repair-loop`.

This skill replaces the previous per-dimension review skills. The dimension knowledge
lives as reference docs loaded on demand; the dispatch surface and output format are
unified here.

## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
5. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## When to use
- After a track executor finishes a batch (automatic tail-chain default: `code`)
- Before merging a feature branch
- User says "review code", "security review", "performance review", "review a11y", "architecture review", "comprehensive audit", or "scored review"

## Step 0 - Context preflight

Before detecting track/dimension or reading files under review, run
`sdcorejs-explore (summary mode)` through `_refs/shared/project-context.md`.

- For an existing target project, read or refresh
  `<target>/.sdcorejs/summary.md` so review scope, module boundaries, route
  conventions, stack profile, and prior decisions are available before findings
  are classified.
- Keep the review itself read-only toward source code. If summary creation is
  blocked by tool mode or user policy, continue with targeted reads and report
  that summary refresh was skipped.
- Current diffs, failing tests, explicit review scope, and user corrections
  override stored summary context.

## Step 1 - Detect the track and dimension

**Track** (directory signals):
| Track | Signals |
|---|---|
| **angular** | `angular.json`; `@sdcorejs/angular`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` |
| **nestjs** | `nest-cli.json`; `@nestjs/*`; `*.controller.ts` / `*.service.ts` / `*.entity.ts` |
| **nextjs** | `next.config.*`; `next`; `src/app/[locale]/`; `page.tsx`, `middleware.ts` |
| **general** | no stack signal; run general code-quality checks only unless the user asked for a shared dimension |

**Dimension** (from intent; default `code`):
| Dimension | Use when |
|---|---|
| **code** (default) | "review code", "review", "audit module", per-file conventions; the tail-chain default after write-code |
| **architecture** | "architecture review", "architecture audit", "code structure check", "circular dependency", "abstraction leak", module boundaries, layering |
| **security** | "security review", "security audit", "SQL injection", "secrets", "CSP", "route guards" |
| **performance** | "performance review", "performance", "lighthouse", "N+1", "bundle size", "slow query" |
| **accessibility** | "review accessibility", "a11y", "WCAG", "aria", "keyboard nav", "contrast" (angular/nextjs only; nestjs has no UI) |
| **ALL** | "comprehensive audit / full audit / enterprise readiness" -> run code + architecture + security + performance + accessibility if UI |
| **site-audit** (nextjs only) | Existing whole-site audit: "audit site", "improve existing site", "what is missing on this site", "cloned site to improve"; run the 30-point build-website quality bar, read-only gap report, then hand to `sdcorejs-brainstorming` |

State the detected track and dimension(s) in the report header.

## Step 2 - Load the matching knowledge
For each selected dimension:
- **code** -> `_refs/<track>/review-code.md` (nextjs: `_refs/nextjs/build-website/review-code.md`)
- **architecture** -> `_refs/shared/review-architecture.md`
- **security** -> `_refs/shared/review-security.md` + `_refs/<track>/review-security.md` (nextjs under `build-website/`)
- **performance** -> `_refs/shared/review-performance.md` + `_refs/<track>/review-performance.md`
- **accessibility** -> `_refs/shared/review-accessibility.md` + `_refs/<track>/review-accessibility.md`
- **site-audit** (nextjs existing site) -> `_refs/nextjs/build-website/audit-existing-site.md`

Each ref supplies what to check: checklist, probes, severity criteria, and standards
mapping. The output format below is owned by this skill.

## Step 3 - Review
1. Read every file under review. Do not skim.
2. Run the dimension's probes; surface raw counts and exit codes before narrative.
3. Map each finding to severity using the ref's criteria. Group repeated violations.
4. Emit the unified report. For multi-dimension (`ALL`), one report with a section per dimension.

## Post-review tail

When `sdcorejs-review` is called from a code-generation finish gate, return the
report to the caller. The caller owns `sdcorejs-repair-loop`, acceptance
verification, branch-ready, auto-docs, task tracker, and memories.

When `sdcorejs-review` is invoked directly by the user:

1. Stay read-only; do not apply fixes from this skill.
2. If the review produced findings, warnings, or probe results, run
   `_refs/orchestration/tail/auto-docs.md` as a review-session summary under the
   detected track folder. Use status `reviewed`, not `done`.
3. Run `_refs/orchestration/tail/auto-task-tracker.md` immediately after
   auto-docs so blocking findings become visible follow-up tasks:
   `Critical`/`Important` in the default format, or `BLOCKER`/`REQUIRED` in
   Angular/NestJS code-review table mode.
4. If durable review knowledge surfaced, such as a recurring project convention
   or stakeholder rule, run `sdcorejs-explore (memories mode)`.
5. Offer `sdcorejs-repair-loop` as the next action for blocking findings:
   `Critical`/`Important` in the default format, or `BLOCKER`/`REQUIRED` in
   Angular/NestJS code-review table mode.

If the direct review found no issues and wrote no summary-worthy evidence, skip
auto-docs and state the residual test/probe gaps.

## Output format (all tracks and dimensions)

Match the user's language at runtime. Cite `file:line` for every finding. Add OWASP for security, WCAG for accessibility, breached budget for performance, and violated boundary/principle for architecture. `Tradeoff` is the cost/risk of the fix (`none` when strictly better).

```markdown
# Review - <module/feature> - <track> - <dimension(s)> - <date>

## Scope
- Track: <angular | nestjs | nextjs | general>
- Dimension(s): <code | architecture | security | performance | accessibility | all>
- Verification: `<build/test/probe cmd>` -> exit 0/failed; <N> passed

## Critical
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## Important
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## Minor
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## Strengths (mirror these)
| File:line | What's good | Reuse where |
|---|---|---|

## Next action
- Critical -> `sdcorejs-repair-loop`
- Important -> user decides fix now or defer with reason
- Minor -> batch into cleanup
```

- In default quick-table mode, a severity table with no rows must contain `_none_`; do not omit the heading.
- In default quick-table mode, the Strengths table is required with at least one row; never answer with only "Looks good". In Angular/NestJS code-review table mode, put positive observations in table rows using `Info / Kudos`, `Pass / Compliant`, `Excellent`, or `Checked`.
- Security/performance/accessibility/architecture refs may carry their own passed-checklist or manual-audit lists; include them under the relevant dimension section.

### Angular/NestJS code-review table mode
For **Angular** or **NestJS** track + **code** dimension quick reviews, use the table below instead of the Critical/Important/Minor/Strengths quick tables. In `ALL` reviews, use this table for the Angular/NestJS code section and keep the relevant dimension-specific format for other sections. Keep scored deep-review mode separate as described below.

Use the user's language for row text. Keep these column names exactly:

| # | Severity | Group | File/Line | Issue | Risk | Suggested fix | Gate |
| --: | -------- | ---- | --------- | ----- | ---- | ------------- | ---- |

Severity values:
- `🔴 Critical` - severe crash, total data loss, serious data leak, or severe user impact.
- `🟠 High` - major issue affecting core flow, build/release, data integrity, security, serious performance, or likely runtime failure.
- `🟡 Medium` - actionable warning affecting maintainability, UX, build warnings, type safety, testability, or future risk.
- `🟢 Low` - small naming, format, style, readability, comment, clean-code, or convention issue.
- `🔵 Info / Kudos` - useful positive note or praise.
- `🟢 Pass / Compliant` - checked criterion passed.
- `✨ Excellent` / `🌟 Excellent` - smart or above-expectation implementation.
- `✅ Checked` - confirms an item was checked and completed well.

Gate values:
- `BLOCKER` - must fix before merge/release; use for direct-impact Critical/High.
- `REQUIRED` - should fix before merge; use for clear security, authorization, validation, transaction, data integrity, type safety, migration, build warning, memory leak, or important convention violations.
- `RECOMMENDED` - should improve but does not necessarily block merge.
- `OPTIONAL` - small improvement suggestion.
- `PASS` - checked and compliant.
- `INFO` - note or praise; no action needed.

Sort rows by severity (`Critical`, `High`, `Medium`, `Low`, positive/info). If no issue exists for a checked group, add a `Pass / Compliant` or `Checked` row with `Gate=PASS`. If context is insufficient, use `INFO` or `RECOMMENDED` and state what evidence is missing instead of guessing.

After the table, add a short summary:
- Total issue count by severity.
- Blockers to fix before merge.
- Passed checklist items.
- Next step: small patch/snippet for small fixes; spec/plan for medium/large fixes with scope, affected files, risks, tests, and rollback when needed. For NestJS, prioritize security, authorization, validation boundary, transaction, data integrity, and DB constraints before style/convention.

### Scored deep-review mode (Angular code dimension)
For a full module/branch audit or "scored review / enterprise readiness" on an **Angular** project, use the 13-category scored format defined in `_refs/angular/review-code.md` instead of the quick tables.

## Rules

### MUST DO
- Detect track and dimension first; state both in the header.
- Read every file under review; cite `file:line` for every finding.
- Run the ref's probes / build / test and include exit codes.
- Sort by severity and group repeated violations. In default quick-table mode, include the Strengths table; in Angular/NestJS code-review table mode, include positive rows inside the required table.
- Match the user's language; distinguish a real bug from a style preference.
- For direct reviews with findings or probe evidence, run the Post-review tail so review sessions are recoverable.

### MUST NOT
- Edit files.
- Mark style preferences as Critical.
- Output a finding without a `file:line`.
- Duplicate findings across dimensions; keep structure findings in `architecture`, per-line defects in `code`.
- For security: read/echo `.env` / credentials, or run `npm audit fix --force`.

## Anti-patterns
- "Looks good" without evidence.
- Everything tagged Important.
- Reviewing without running the build/probes.
- Listing OWASP/WCAG generically with no evidence in this repo.
- Turning architecture review into a rewrite plan; recommend scoped, incremental fixes.

## Cross-references
- Dimension knowledge: `_refs/<track>/review-{code,security,performance,accessibility}.md`
- Shared baselines: `_refs/shared/review-{architecture,security,performance,accessibility}.md`
- Repair loop: `sdcorejs-repair-loop`
- Verification: `sdcorejs-ship (verify-before-done mode)`
- `_refs/orchestration/tail/auto-docs.md` - direct review-session summaries
- `_refs/orchestration/tail/auto-task-tracker.md` - living follow-up tasks from review findings
