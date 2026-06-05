---
name: sdcorejs-review-code
description: Single entry point for per-file code review across every SDCoreJS track. Auto-detects the stack from the project's directory architecture (Angular portal · NestJS · Next.js), loads the matching convention knowledge from `_refs/<track>/review-code.md`, and reviews against it; if the stack is out of scope it falls back to general code-quality standards. Outputs color-coded severity tables — 🔴 Critical / 🟡 Important / 🔵 Minor with **Fix** + **Tradeoff** columns, plus a 🟢 Strengths (mirror) table of patterns worth replicating. Angular projects can also request the 13-category scored deep-review. Read-only — never edits code. Triggers - "review code", "review code angular/nestjs/nextjs", "audit module", "audit backend", "rà soát code", "rà soát site này", "check conventions", "scored review", "đánh giá / chấm điểm code", "enterprise readiness", or automatic invocation after any `<track>-write-code` completes. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep, Bash
---

# Review — Code (unified, track-aware)

## Purpose
One skill, every stack. Audit generated or modified code against the conventions
of whichever SDCoreJS track the project belongs to. **Read-only** — surfaces
violations the human reviewer should fix; never edits code (auto-fix is
`orchestration/repair-loop`'s job).

This skill replaces the previous per-track `sdcorejs-review-code-{angular-portal,nestjs,nextjs}`
skills. The track-specific *knowledge* now lives as reference docs loaded on
demand; the dispatch surface and output format are unified here.

## When to use
- After `<track>-write-code` finishes a batch (automatic, via the tail-call chain)
- Before merging a feature branch
- User says "review code", "audit module X", "rà soát code", "rà soát site này",
  "check conventions", "scored review", "đánh giá / chấm điểm code"

## Step 0 — Detect the track from the directory architecture

Inspect the project root and the files under review. Pick the highest-confidence match:

| Track | Signals |
|---|---|
| **angular-portal** | `angular.json`; `@sdcorejs/angular` in `package.json`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` |
| **nestjs** | `nest-cli.json`; `@nestjs/*` deps; `*.controller.ts` / `*.service.ts` / `*.entity.ts`; `base/core-be/` |
| **nextjs** | `next.config.*`; `next` dep; `src/app/[locale]/`; `page.tsx`, `layout.tsx` |
| **(none match)** | → **general mode** (baseline standards below) |

If the project is a monorepo or the files under review clearly belong to one
stack, scope the review to that stack. State the detected track in the report header.

## Step 1 — Load the matching knowledge

- **angular-portal** → read `_refs/angular-portal/review-code.md`
- **nestjs** → read `_refs/nestjs/review-code.md`
- **nextjs** → read `_refs/nextjs/build-website/review-code.md`
- **none** → skip the load; use the **General baseline** below

Each track ref supplies *what to check* (checklist + bash probes + per-track
severity mapping). The **output format** below is owned by this skill and used
for all tracks.

## Step 2 — Review

1. Read every file under review — do not skim.
2. Run the track's probes (where the ref provides them); surface raw counts before narrative.
3. For Angular/NestJS where the ref names verification commands, run the build/test and include exit codes.
4. Map each finding to a severity (use the track ref's severity mapping; otherwise the general bands below).
5. Group repeated violations ("Same `inject()` violation in 5 files: …") — don't repeat one issue per file.
6. Emit the report in the unified format.

## General baseline (out-of-scope stacks)

When no SDCoreJS track is detected, review against language-agnostic standards:

- **Correctness** — logic errors, off-by-one, null/undefined handling, error paths, race conditions.
- **Security** — no hardcoded secrets/credentials/API keys, input validation at boundaries, no injection (SQL/command/XSS), safe deserialization.
- **Error handling** — failures handled or propagated; no silently swallowed exceptions; no bare `catch {}`.
- **Naming & readability** — intention-revealing names, consistent with the surrounding file's conventions.
- **Duplication / SRP** — no copy-paste blocks; functions do one thing; no god-objects.
- **Dead code & debug residue** — no commented-out blocks, `console.log`/`print` debug residue, `TODO` left as the implementation.
- **Tests** — meaningful tests exist for changed behavior; not placeholders.
- **Dependencies** — no unused imports; no unpinned/risky new deps added casually.

General severity bands:
- **🔴 Critical** — security hole, data loss, broken behavior, build/runtime break.
- **🟡 Important** — maintainability debt that will bite (duplication, missing error handling, unclear contracts).
- **🔵 Minor** — style, naming, doc nits that don't change behavior.
- **🟢 Strengths (mirror)** — well-factored code worth replicating elsewhere.

## Output format (ALL tracks)

Match the user's language (VI/EN) for headings and explanations. Cite `file:line`
for every finding — a finding without a location is un-actionable. Sort tables by
severity, stable within a severity (file path alphabetical). `Tradeoff` = the cost
or risk of applying the fix (write `none` when the fix is strictly better).

```markdown
# Code Review — <module/feature> — <detected track> — <date>

## Scope
- Files reviewed: <N>
- Track detected: <angular-portal | nestjs | nextjs | general>
- Verification: `<build cmd>` → exit 0/failed · `<test cmd>` → N passed, 0 failed

## 🔴 Critical
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|
| product.service.ts:42 | Hardcoded API URL | Move to `environment.apiUrl` | none |

## 🟡 Important
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|
| list.component.ts:88 | Missing `autoId` on 4 controls | Add `autoId` so E2E + inspector can target | none |

## 🔵 Minor
| File:line | Issue | Fix | Tradeoff |
|---|---|---|---|
| product.model.ts:12 | Field name not kebab-aligned | Rename to convention | small churn in imports |

## 🟢 Strengths (mirror these)
| File:line | What's good | Reuse where |
|---|---|---|
| detail.component.ts:30 | Clean 3-state CREATE/UPDATE/DETAIL pattern | All detail screens |

## Next action
- 🔴 Critical → `orchestration/repair-loop`
- 🟡 Important → user decides per finding
- 🔵 Minor → batch
```

- A severity table with no rows: write `_none_` rather than omitting the heading.
- The 🟢 Strengths table is required (min 1 row) — never a bare "Looks good!".

### Scored deep-review mode (Angular only)
For a full module/branch audit or when the user asks for a "scored review",
"đánh giá", "chấm điểm", or enterprise-readiness assessment on an **Angular**
project, use the 13-category scored format defined in
`_refs/angular-portal/review-code.md` instead of the quick tables.

## Rules

### MUST DO
- Detect the track first; state it in the report header.
- Read every file under review; cite `file:line` for every finding.
- Sort by severity, not file order; group repeated violations.
- Run the track ref's build/test verification commands and include exit codes.
- Match the user's language (VI/EN); distinguish "this is a bug" from "this is a style preference".
- Always include the 🟢 Strengths (mirror) table.

### MUST NOT
- Edit files (read-only review).
- Mark style preferences as 🔴 Critical.
- Output a finding without a `file:line` reference.
- Repeat the same issue once per file — group them.
- Invent issues that aren't in the code.
- Duplicate `review/architecture` / `review/security/<track>` findings (they own those axes).

## Anti-patterns
- "Looks good!" — give concrete observations and at least one 🟢 Strength.
- 🔴 Critical issues without an impact explanation or a Fix.
- Reviewing without running the build (might miss compile errors).
- Findings without suggested fixes or tradeoffs.

## Cross-references
- Track knowledge: `_refs/<track>/review-code.md` (nextjs: `_refs/nextjs/build-website/review-code.md`)
- Architecture review: `review/architecture`
- Security audit: `review/security/{angular-portal,nestjs,nextjs,shared}`
- Performance review: `review/performance/<track>`
- Accessibility review: `review/accessibility/<track>`
- Repair loop: `orchestration/repair-loop`

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
