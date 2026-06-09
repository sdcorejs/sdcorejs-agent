---
name: sdcorejs-review
description: Single entry point for reviewing/auditing code across every SDCoreJS track — dimension-aware: code conventions (default), security, performance, accessibility. Auto-detects the stack (Angular · NestJS · Next.js) + the dimension from intent, loads `_refs/<track>/review-<dimension>.md` (+ `_refs/shared/` baselines), emits a 🔴 Critical / 🟡 Important / 🔵 Minor report with file:line + Fix. "comprehensive audit / full audit" runs all dimensions; Angular code can request the 13-category scored review. Read-only. For module-level structure (layering, circular deps) use `sdcorejs-review-architecture`. Triggers - "review code", "audit module/backend", "security review / security", "performance review / performance / lighthouse", "review accessibility / a11y / WCAG", "audit existing site / what is missing on this site (nextjs)", "scored review", "comprehensive audit", or auto after `<track>-write-code`. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Glob, Grep, Bash
---

# Review (unified, track + dimension aware)

## Purpose
One skill, every stack, four dimensions. Audit generated or modified code against
the conventions of whichever SDCoreJS track the project belongs to. **Read-only** —
surfaces violations the human reviewer should fix; never edits (auto-fix is
`orchestration/repair-loop`'s job).

This skill replaces the previous `sdcorejs-review-{code,security,performance,accessibility}`
skills — the dimension knowledge now lives as reference docs loaded on demand; the
dispatch surface + output format are unified here. **Module-level structure review
(layering, circular deps, abstraction leaks) stays in `sdcorejs-review-architecture`.**

## When to use
- After `<track>-write-code` finishes a batch (automatic, via the tail-call chain → code dimension)
- Before merging a feature branch
- User says "review code / review", "security review", "performance review", "review a11y", "comprehensive audit", "scored review"

## Step 0 — Detect the track + the dimension

**Track** (directory signals):
| Track | Signals |
|---|---|
| **angular** | `angular.json`; `@sdcorejs/angular`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` |
| **nestjs** | `nest-cli.json`; `@nestjs/*`; `*.controller.ts` / `*.service.ts` / `*.entity.ts` |
| **nextjs** | `next.config.*`; `next`; `src/app/[locale]/`; `page.tsx`, `middleware.ts` |
| **(none)** | general code-quality baseline (code dimension only) |

**Dimension** (from intent — default `code`):
| Dimension | Use when |
|---|---|
| **code** (default) | "review code", "review", "audit module", per-file conventions; the tail-chain default after write-code |
| **security** | "security review", "security audit", "SQL injection", "secrets", "CSP", "route guards" |
| **performance** | "performance review", "performance", "lighthouse", "N+1", "bundle size", "slow query" |
| **accessibility** | "review accessibility", "a11y", "WCAG", "aria", "keyboard nav", "contrast" (angular/nextjs only — nestjs has no UI) |
| **ALL** | "comprehensive audit / full audit / enterprise readiness" → run code + security + performance + (a11y if UI) |
| **site-audit** (nextjs only) | EXISTING whole-site audit — "audit site", "improve existing site", "what is missing on this site", "cloned site to improve": run the 30-point build-website quality bar, read-only gap report, then hand to `sdcorejs-clarify-requirements` |

State the detected track + dimension(s) in the report header.

## Step 1 — Load the matching knowledge
For each selected dimension:
- **code** → `_refs/<track>/review-code.md` (nextjs: `_refs/nextjs/build-website/review-code.md`)
- **security** → `_refs/shared/review-security.md` + `_refs/<track>/review-security.md` (nextjs under `build-website/`)
- **site-audit** (nextjs existing site) → `_refs/nextjs/build-website/audit-existing-site.md` — its full procedure (build/lint/i18n/content probes + Lighthouse + the 30-check A1…I6 bar + gap-report template + handoff to `sdcorejs-clarify-requirements`). Read-only; never auto-fixes.
- **performance** → `_refs/shared/review-performance.md` + `_refs/<track>/review-performance.md`
- **accessibility** → `_refs/shared/review-accessibility.md` + `_refs/<track>/review-accessibility.md`

Each ref supplies *what to check* (checklist + probes + severity + OWASP/WCAG/budget mapping). The **output format** below is owned by this skill.

## Step 2 — Review
1. Read every file under review — don't skim.
2. Run the dimension's probes (the ref provides them); surface raw counts/exit codes before narrative.
3. Map each finding to severity (use the ref's mapping). Group repeated violations ("same issue in 5 files").
4. Emit the unified report. For multi-dimension (ALL), one report with a section per dimension.

## Output format (ALL tracks + dimensions)

Match the user's language at runtime. Cite `file:line` for every finding (+ OWASP for security, WCAG for a11y, breached budget for performance). `Tradeoff` = cost/risk of the fix (`none` when strictly better).

```markdown
# Review — <module/feature> — <track> — <dimension(s)> — <date>

## Scope
- Track: <angular | nestjs | nextjs | general> · Dimension(s): <code | security | performance | accessibility | all>
- Verification: `<build/test/probe cmd>` → exit 0/failed · N passed

## 🔴 Critical
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## 🟡 Important
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## 🔵 Minor
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|

## 🟢 Strengths (mirror these)
| File:line | What's good | Reuse where |
|---|---|---|

## Next action
- 🔴 Critical → `orchestration/repair-loop` · 🟡 Important → user decides · 🔵 Minor → batch
```

- A severity table with no rows: write `_none_`, don't omit the heading.
- The 🟢 Strengths table is required (min 1 row) — never a bare "Looks good!".
- security/performance/accessibility refs may carry their own Passed-checklist / manual-audit lists — include them under the relevant dimension section.

### Scored deep-review mode (Angular code dimension)
For a full module/branch audit or "scored review / enterprise readiness" on an **Angular** project, use the 13-category scored format defined in `_refs/angular/review-code.md` instead of the quick tables.

## Rules

### MUST DO
- Detect track + dimension first; state both in the header.
- Read every file under review; cite `file:line` (+ OWASP/WCAG/budget where the dimension applies).
- Run the ref's probes / build / test and include exit codes.
- Sort by severity; group repeated violations; always include the 🟢 Strengths table.
- Match the user's language; distinguish a real bug from a style preference.

### MUST NOT
- Edit files (read-only review).
- Mark style preferences as 🔴 Critical.
- Output a finding without a `file:line`.
- Duplicate `sdcorejs-review-architecture` findings (module structure belongs there).
- For security: read/echo `.env` / credentials, or run `npm audit fix --force`.

## Anti-patterns
- "Looks good!" — give concrete observations + ≥1 🟢 Strength.
- Everything tagged "Important" — nothing is, then.
- Reviewing without running the build/probes (misses compile + real issues).
- Listing OWASP/WCAG generically with no evidence in this repo.

## Cross-references
- Dimension knowledge: `_refs/<track>/review-{code,security,performance,accessibility}.md` + `_refs/shared/review-{security,performance,accessibility}.md`
- Module-level structure: `sdcorejs-review-architecture` (separate — layering, circular deps)
- Repair loop: `orchestration/repair-loop` · Verification: `orchestration/verify-before-done`

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
