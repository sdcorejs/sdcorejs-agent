---
name: sdcorejs-review-architecture
description: Cross-track architecture review checklist. Audits a feature or module for layering violations, abstraction leaks, circular dependencies, premature optimisation, missing seams, and architectural drift from the project's conventions. Different from `sdcorejs-review` (per-file / per-dimension review: code, security, performance, accessibility) — this is module/feature-level & structural, not line-level. Outputs a Critical/Important/Minor report. Triggers - "review kiến trúc", "architecture audit", "code structure check", "module này organize đúng chưa", "có circular dependency không", "abstraction leak", "should this be a separate module", or before a major feature merges. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep, Bash
---

# Review — Architecture (Cross-Track)

## Purpose
Code review (`sdcorejs-review`) catches line-level mistakes; architecture review catches structural ones — the kind that don't break a single file but accumulate into a swamp over 6 months. Run this before major features merge, after a refactor lands, or when a new contributor's code feels "off" but the per-file review is clean.

## When invoked
- Before merging a feature that adds new modules or moves existing ones
- After 3+ similar features ship and you suspect duplication / wrong abstraction
- User says "review kiến trúc", "audit module", "organize đúng chưa"
- Periodically — quarterly health check on the codebase

## What this skill checks (cross-track)

### 1. Layering — does code respect the dependency direction?

Every SDCoreJS stack has a layered architecture:

| Layer | angular | nestjs | nextjs |
|---|---|---|---|
| **UI / Presentation** | components, pages | controllers | app/, components/ |
| **Application / Workflow** | services that orchestrate | services (workflow), use-cases | route handlers, server actions |
| **Domain / Pure logic** | models, validators | entities, domain services, repositories | lib/, validators, schemas |
| **Infrastructure** | HTTP client, storage | TypeORM, message queue | DB clients, email, storage |

**Rule**: inner layers don't know about outer layers. Domain doesn't import UI; domain doesn't import the HTTP client directly (it depends on an interface implemented in infrastructure).

Probe:
```bash
# Domain importing UI (Critical)
grep -rE "from ['\"].*\b(components|controllers|pages|app/.*page)" src/domain/ src/lib/ 2>/dev/null

# Domain importing infrastructure (Important)
grep -rE "from ['\"].*\b(typeorm|http-client|storage)" src/domain/ src/lib/ 2>/dev/null
```

Findings:
- Critical: domain → UI imports
- Important: domain → infrastructure imports (should go through an injected interface)
- Minor: UI → infrastructure direct calls (bypasses the application layer)

### 2. Circular dependencies

Two files importing each other (directly or transitively) = a module that should have been one file, OR a missing extraction.

Probe:
```bash
# Tool: madge (Node), tsc --listFiles + custom script, or grep on suspicious patterns
npx --yes madge --circular --extensions ts,tsx src/ 2>/dev/null | head -20
```

Findings:
- Critical: any cycle in domain layer
- Important: any cycle in application layer
- Minor: cycles within a single module (e.g. siblings in same folder) — sometimes acceptable

### 3. Module boundaries — is the public API obvious?

Each module should have exactly ONE entry point that re-exports the public surface. Imports from outside should NEVER reach into internal files.

```typescript
// ❌ Reaching past the boundary
import { PriceCalculator } from '@/modules/billing/services/internal/price-calculator';

// ✅ Through the public API
import { PriceCalculator } from '@/modules/billing';
```

Probe: glob for `from '@/.*/internal/'` or `from '../../[a-z]+/[a-z]+/[a-z]+'` (3+ levels deep crossing module boundary).

Findings:
- Important: cross-module imports bypassing `index.ts` / `public-api.ts`
- Minor: missing `index.ts` for a module (no public API declared)

### 4. Abstraction leaks

The signature of a function should not betray its implementation. Common leaks:

| ❌ Leak | ✅ Tighter contract |
|---|---|
| `getUsers(query: SqlQuery)` | `getUsers(filter: UserFilter)` |
| `notify(email: SmtpMessage)` | `notify(to: User, event: DomainEvent)` |
| `save(entity: TypeOrmEntity)` | `save(user: User)` |
| `render(html: string)` | `render(content: Article)` |

Probe: type signatures in domain layer mentioning `Sql*`, `SmtpMessage`, `TypeORM*`, `Express.Request`, `NextRequest`, etc.

Findings:
- Important: domain types referencing infrastructure types
- Minor: helper utilities with leaky params (can be wrapped later)

### 5. Wrong-place files

Files in the wrong folder say something about either confused intent or rotting structure.

| Symptom | Likely fix |
|---|---|
| Validator inside `controllers/` | move to `domain/validators/` or `schemas/` |
| Business rule inside HTTP middleware | move to domain service |
| Component with DB query inline | extract to service / server action / route handler |
| `utils/everything.ts` 800 lines | split by purpose; if "miscellaneous" is the only honest grouping, you have a missing module |

Probe: file size + import direction.

### 6. Over-engineering / premature abstraction

| Symptom | Severity |
|---|---|
| Generic `BaseService<T>` with 1 user | Important — delete until 3rd user appears |
| 4-layer factory for what could be a function | Important — collapse |
| Interface with 1 implementation that's never mocked | Minor — remove the interface |
| Feature flag for `if (true)` shipped 6 months ago | Minor — remove the flag |
| Abstract class never extended | Important — make it concrete or delete |

Probe: 3-search — if a symbol/file is imported in fewer than 3 places, ask why the abstraction exists.

### 7. Missing seams

The opposite of over-engineering: code so tightly coupled that nothing can change without ripple. Symptoms:
- One service mutates a global cache + sends email + writes to DB + calls another service in a single function
- Every controller has a 50-line `try/catch` with the same error mapping
- Adding a new payment provider requires touching 8 files

Probe: cyclomatic complexity, fan-out per function (>5 external calls per function = candidate for breakup).

Findings:
- Important: god-functions / god-classes (>200 LoC, >5 responsibilities)
- Minor: repeated boilerplate that should be a decorator / middleware / wrapper

### 8. Drift from documented conventions

If `CLAUDE.md` / `AGENTS.md` / `_refs/` define a convention (e.g. "all NestJS validators use Zod via `ZodValidationGuard`") then code that doesn't follow it is drift. Drift compounds — by the time you have 50 drifted files, the convention is dead.

Probe: grep for the convention name vs the count of files in scope; ratio < 80% = drift finding.

### 9. Test architecture

Are tests in the right place + at the right layer (per `_refs/shared/testing-philosophy.md`)?
- Unit tests covering integration concerns (mocked DB testing SQL) → Important
- E2E tests for pure-logic edge cases that should be unit tests → Important
- No e2e for the feature's main user flow → Critical

### 10. Documentation entropy

- README / module-level docs say what the code did 6 months ago, not now → Minor
- TODO/FIXME with no date or assignee → Minor (use `_shared/auto-task-tracker` instead)
- Comments explaining `WHAT` that good naming would handle → cosmetic

## Output: Architecture Review Report

```markdown
# Architecture Review — <feature / module / repo>

## Scope
- Files reviewed: <N>
- Modules touched: <list>
- Reviewer: agent + <user>
- Date: <YYYY-MM-DD>

## Strengths
- <2-3 bullets — what's working well>

## Findings

### Critical (must fix before merge)
| # | File:line | Finding | Suggested fix |
|---|---|---|---|

### Important (should fix; defer with reason)
| # | File:line | Finding | Suggested fix |
|---|---|---|---|

### Minor (polish; pick up in cleanup sprint)
| # | File:line | Finding | Suggested fix |
|---|---|---|---|

## Architectural recommendations
- <higher-level suggestions: extract module X, retire abstraction Y, etc.>

## Next action
- Critical findings → invoke `orchestration/repair-loop` with the list
- Important → user decides per finding (fix now / defer with ticket)
- Minor → batch into a cleanup commit
```

## Rules

### MUST DO
- Run automated probes BEFORE manual review — cheap wins first
- Acknowledge strengths (not all-negative)
- Cite file:line for every finding
- Map each finding to a SEVERITY level (Critical / Important / Minor) with explicit criteria
- Recommend a fix path: invoke `orchestration/repair-loop` for Critical, defer with reason for Important, batch Minor
- Stop at architecture; don't dive into per-line review (that's `sdcorejs-review`)

### MUST NOT
- Flag every deviation as Critical — inflation makes the report ignorable
- Recommend "rewrite from scratch" — incremental, scoped fixes only
- Audit code the user didn't ask about — stay in scope
- Make architectural decisions for the user — surface tradeoffs, let them decide

## Anti-patterns

- **"Big bang refactor" findings** — the report should produce 5-15 actionable items, not a 6-month roadmap
- **Architecture review on a 3-file diff** — overkill; per-file review covers it
- **Citing principles without examples** — every finding has file:line + concrete fix
- **"This file is too long"** — define how long; show which responsibility to split out
- **Reviewing your own code** — agent fine; if it's the same dev who wrote it, get a peer eye too

## Cross-references
- Code / security / performance / accessibility review: `sdcorejs-review` (track + dimension aware)
- Repair loop: `orchestration/repair-loop` after findings

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
