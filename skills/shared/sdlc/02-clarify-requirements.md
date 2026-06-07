---
name: sdcorejs-clarify-requirements
description: Use AFTER `sdcorejs-brainstorm` has settled direction (or skip brainstorm if scope was already clear), BEFORE `sdcorejs-write-spec`. Hard-confirms the blocking inputs for the detected track — angular (module / entity / fields / layout / workflow), nestjs (module / entity / persistence / transactions), nextjs (domain / contact / hosting / languages / OG / caching). Each unanswered blocker prevents the spec stage. Triggers - "tạo CRUD cho ...", "thêm entity", "create screen", "build module", "set up backend module", "tạo landing page với ...", or any request missing concrete inputs for the track. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep, Bash
---

# 02 — Clarify Requirements (Cross-Track)

## Purpose
A spec has hard dependencies on details brainstorm doesn't cover. Angular needs module + entity + fields + layout; NestJS needs persistence + transactions + workflow + profile (`simple` default | `enterprise`); Next.js needs production domain + contact email + hosting. This skill blocks the spec stage until every required answer is on the table.

`sdcorejs-brainstorm` is open-ended exploration (2-3 options + recommendation). This skill is the gating checklist — different ergonomics.

## When to use
- Automatically after `sdcorejs-brainstorm` picks a direction
- When the user asks for concrete artifacts ("tạo CRUD product", "build user module", "make me a clinic landing site") and blockers are unanswered
- Restart point when requirements changed for an existing project (rebrand, language addition, persistence swap)

Skip if:
- All blocking questions for the detected track are already answered in the conversation or a spec doc

## Process

### Step 0 — Detect target track
Same detection as `sdcorejs-brainstorm` Step 0:

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
cd "$TARGET_ROOT"

if   [ -f angular.json ];                                                      then TRACK=angular
elif [ -f nest-cli.json ];                                                     then TRACK=nestjs
elif [ -f next.config.js ] || [ -f next.config.ts ] || [ -f next.config.mjs ]; then TRACK=nextjs
elif grep -q '"@nestjs/core"'  package.json 2>/dev/null;                       then TRACK=nestjs
elif grep -q '"next"'          package.json 2>/dev/null;                       then TRACK=nextjs
elif grep -q '"@angular/core"' package.json 2>/dev/null;                       then TRACK=angular
else TRACK=ASK_USER
fi
```

If detection fails, ask: "Project này thuộc track nào?" Do not proceed without a track.

### Step 0.5 — Vagueness gate: ROUTE TO `sdcorejs-brainstorm` if scope is too open

Clarify is a **hard-confirm** step — it asks blocking yes/no questions about concrete details. If the user hasn't picked a direction yet, clarify questions feel premature ("which layout?" when they don't know the goal yet) and the user gets frustrated.

Run this check BEFORE asking the first blocking question. If the request matches ≥1 of these signals, route to `sdcorejs-brainstorm` first:

**Vagueness signals**:
- The request describes a goal, not a feature ("muốn tracking promotions", "cần website cho công ty mình") — no concrete entity / page / module yet
- The user explicitly compares: "X hay Y", "side-drawer vs page", "REST vs gRPC", "Sanity vs Strapi"
- The user signals uncertainty: "không chắc", "đang phân vân", "explore options", "tôi đang nghĩ tới"
- More than one realistic interpretation of the request exists, and picking blindly would lock in the wrong choice for hours of code
- For nextjs: industry / target audience / page-set is not yet declared
- For angular / nestjs: it's unclear whether this needs a new module or fits an existing one

If ANY signal fires, say (in user's language):

> "Yêu cầu của bạn có vẻ chưa cố định hướng đi — mình invoke `sdcorejs-brainstorm` để khám phá 2-3 cách tiếp cận và chọn 1 trước khi vào clarify chi tiết. OK?"

Then invoke `sdcorejs-brainstorm`. After brainstorm settles a direction, control returns here.

**Why this matters** (borrowed from `superpowers:brainstorming` philosophy):
- Clarifying details before agreeing on direction = sunk-cost trap. User answers "use UnifiedSplit layout" then realises 30 min later they wanted side-drawer all along — clarify answers thrown away.
- Brainstorm is cheap. 5 minutes of "here are 3 approaches, pick one with reasoning" saves hours of mis-targeted code.
- If scope is genuinely clear (user said `tạo CRUD product trong module sales với fields code/name/price`), brainstorm IS overkill — proceed straight to Step 1.

This rule does NOT trigger if:
- The user explicitly says "skip brainstorm" / "bỏ qua brainstorm" / "go straight to clarify"
- The work is a known recipe with no decisions to explore (init portal, add screen to existing entity with known fields)

### Step 1 — Load the track-specific blocker checklist
Read `_refs/sdlc/<TRACK>.md` (the **Clarify** section). Each track defines:
- **Minimum-required** answers (the spec cannot draft without these)
- **Useful-optional** answers (defaults are safe if user skips)
- **Block-level grouping** (3-4 questions per group so the user is not overwhelmed)

### Step 2 — Detect language
Detect the user's session language from their messages:
- Vietnamese phrases → respond in Vietnamese with proper diacritics
- English → respond in English

Keep the response language consistent throughout the clarify session.

### Step 3 — Ask blocking questions in groups
Present 3-4 related questions per turn. Mark each `✓` once answered. Show progress so the user knows when they're close to done.

Do NOT bundle all questions in one wall of text — split into the blocks defined in `_refs/sdlc/<TRACK>.md`.

If the user provides PRD text, a screenshot, or a sample cURL/API contract, normalize it FIRST into the track's field/page contract before re-asking — don't repeat questions the artifacts already answered.

### Step 3.5 — Coverage approach question (always ask)

In addition to "test coverage level" (minimal / standard / full), ask ONE more question that the plan stage needs:

> **Coverage approach** — `post-hoc` (default) or `TDD`?
>
> - **post-hoc**: write code, then write tests for what was generated. Fastest path; good when the design is well-understood and the feature is mostly mechanical (CRUD scaffolding, theme application, content fill).
> - **TDD**: write failing test bones from acceptance criteria FIRST, implement to make them pass. Slower per file but catches design ambiguity early; good for business logic that's easy to get subtly wrong (transactions, workflows, validators, state machines, computed pricing).
>
> Default: `post-hoc` for CRUD / UI scaffolding; `TDD` for service-layer business logic and validators. Borrowed from `superpowers:test-driven-development`.

This answer goes into the spec (Architecture section) and the plan (test phase ordering — TDD shifts test bones BEFORE code tasks; post-hoc keeps the current ordering).

Defaults by track:
- **angular**: post-hoc for screens/forms, TDD for custom validators + mappers + services
- **nestjs**: TDD as default for services + validators + transactions; post-hoc for thin controllers + DTOs
- **nextjs**: post-hoc for pages/blocks/SEO/i18n (mostly declarative); TDD for contact-form API route + content-quality scripts

If user picks TDD, `sdcorejs-write-plan` will:
1. Add a **test-bones phase** BEFORE the code tasks — a failing test/skeleton for each unit with user-visible behavior
2. Add a **tests-fill phase** AFTER the code tasks — complete the test bodies against the actual implementation
3. Each acceptance criterion in the spec maps to a failing test in the test-bones phase

If user picks post-hoc, the current ordering stands: `write-code` first, then `sdcorejs-test` after.

### Step 4 — Surface defaults clearly
For each optional answer, propose the default explicitly so the user can accept fast:

> "Caching default 30-min ISR — OK?" (nextjs)
> "Detail layout default UnifiedCompact — OK?" (angular)
> "Persistence default TypeORM + Postgres — OK?" (nestjs)

If the user says "you decide", pick the default WITH explanation. Never silently choose.

### Step 5 — Infer-and-confirm where safe
If the user names an entity but skips fields, **infer a first-pass field set** from the entity semantics + track conventions (see `_refs/sdlc/<TRACK>.md`), then present it for confirmation:

> "Product → suy luận fields: code, name, category, price, status, description, image, createdAt. OK hay sửa?"

Inferring beats blank-questioning when there's a strong semantic match. Confirm before locking in.

### Step 6 — Produce the confirmed summary
Once all blockers are answered, emit a concise summary table in user's language. Use the layout from `_refs/sdlc/<TRACK>.md` (each track has its own summary template). End with:

> → Tiếp theo: `sdcorejs-write-spec` để mình draft spec; bạn duyệt rồi qua plan và viết code.

### Step 7 — Save durable answers as memory candidates
Track-level answers that will repeat across features (domain, hosting, brand colors for nextjs; baseline persistence + audit conventions for nestjs; portal language + Core UI version for angular) are good memory candidates. Suggest invoking `orchestration/memories` to persist them.

## Rules

### MUST DO
- BLOCK the spec stage until every minimum-required answer is on the table
- ASK in groups of 3-4 per turn — never dump the full checklist as one wall of text
- Convert relative dates to absolute (today is the date in `# currentDate`; "next week" → that date + 7d)
- Detect the user's session language and stick with it
- For Vietnamese sessions, all generated labels / suggestions must use full diacritics
- Infer fields/pages from semantics when safe — but always present for confirmation
- End with the confirmed summary table from `_refs/sdlc/<TRACK>.md`
- Suggest `orchestration/memories` for project-level answers that will repeat

### MUST NOT
- Generate code or commit files at this stage
- Re-ask questions the user already answered — read the conversation
- Combine unrelated questions into one mega-question
- Accept "thôi cứ làm đại" — push back: name the minimum subset that's still required ("Cần ít nhất X và Y trước; phần khác lấy default được")
- Defer answers that change the architecture (persistence, domain, layout) — those must be locked before the spec stage
- Mix angular blockers into a nextjs session, or vice versa — load the right `_refs/sdlc/<TRACK>.md`
- Ask a `non-tech` persona about `profile` (nestjs) — default `simple` silently; only surface `enterprise` to a technical user or when the user explicitly states multi-tenancy / multiple services

## Anti-patterns
- Skipping production domain (nextjs) → sitemap + OG URLs ship with `localhost:3000`
- Skipping contact email (nextjs) → form ships fake (`setTimeout`), defeats the point
- Skipping module ownership (angular/nestjs) → CRUD code generated in the wrong namespace, refactored later at 3x cost
- Skipping persistence + transaction style (nestjs) → service layer mixed with TypeORM, hard to swap or test
- Skipping profile (nestjs) → generated backend over-fits the enterprise shape (multi-tenant guards, `@shared` kernel, `AdminAuthGuard`) when the project is a simple single-tenant app; or under-fits by missing multi-tenant scaffolding when it's needed. For a `non-tech` persona, do NOT ask — default `simple` silently (persona rule: never expose architecture to non-tech users); still confirm the derived data model in plain terms. Offer `enterprise` only to a technical user, or when the user explicitly states multi-tenancy / multiple services.
- Default-everything without confirmation → wrong palette / wrong layout / wrong workflow / wrong endpoints
- Bundling 10+ questions in one wall of text → user gives up; ask in blocks

## Hand-off
On full confirmation:
1. Render the summary table
2. Hand off to `sdcorejs-write-spec` with: track, scope summary, confirmed answers, source artifacts (PRD/screenshot/cURL if provided)
3. Optionally suggest `orchestration/memories` for durable answers

## Related skills
- `_refs/sdlc/<TRACK>.md` — track-specific blocker checklist (Clarify section) + summary template
- `sdcorejs-brainstorm` — runs before this, sets direction
- `sdcorejs-write-spec` — runs after this, drafts the spec
- `orchestration/memories` — capture project-level answers (domain, hosting, conventions)
