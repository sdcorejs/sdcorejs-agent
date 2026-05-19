---
name: sdcorejs-clarify-requirements
description: Use AFTER `sdcorejs-brainstorm` has settled direction (or skip brainstorm if scope was already clear), BEFORE `sdcorejs-write-spec`. Hard-confirms the blocking inputs for the detected track — angular-portal (module / entity / fields / layout / workflow), nestjs (module / entity / persistence / transactions), nextjs (domain / contact / hosting / languages / OG / caching). Each unanswered blocker prevents the spec stage. Triggers - "tạo CRUD cho ...", "thêm entity", "create screen", "build module", "set up backend module", "tạo landing page với ...", or any request missing concrete inputs for the track. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep, Bash
---

# 02 — Clarify Requirements (Cross-Track)

## Purpose
A spec has hard dependencies on details brainstorm doesn't cover. Angular needs module + entity + fields + layout; NestJS needs persistence + transactions + workflow; Next.js needs production domain + contact email + hosting. This skill blocks the spec stage until every required answer is on the table.

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

if   [ -f angular.json ];                                                      then TRACK=angular-portal
elif [ -f nest-cli.json ];                                                     then TRACK=nestjs
elif [ -f next.config.js ] || [ -f next.config.ts ] || [ -f next.config.mjs ]; then TRACK=nextjs
elif grep -q '"@nestjs/core"'  package.json 2>/dev/null;                       then TRACK=nestjs
elif grep -q '"next"'          package.json 2>/dev/null;                       then TRACK=nextjs
elif grep -q '"@angular/core"' package.json 2>/dev/null;                       then TRACK=angular-portal
else TRACK=ASK_USER
fi
```

If detection fails, ask: "Project này thuộc track nào?" Do not proceed without a track.

### Step 1 — Load the track-specific blocker checklist
Read `skills/shared/sdlc/_refs/<TRACK>.md` (the **Clarify** section). Each track defines:
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

Do NOT bundle all questions in one wall of text — split into the blocks defined in `_refs/<TRACK>.md`.

If the user provides PRD text, a screenshot, or a sample cURL/API contract, normalize it FIRST into the track's field/page contract before re-asking — don't repeat questions the artifacts already answered.

### Step 4 — Surface defaults clearly
For each optional answer, propose the default explicitly so the user can accept fast:

> "Caching default 30-min ISR — OK?" (nextjs)
> "Detail layout default UnifiedCompact — OK?" (angular)
> "Persistence default TypeORM + Postgres — OK?" (nestjs)

If the user says "you decide", pick the default WITH explanation. Never silently choose.

### Step 5 — Infer-and-confirm where safe
If the user names an entity but skips fields, **infer a first-pass field set** from the entity semantics + track conventions (see `_refs/<TRACK>.md`), then present it for confirmation:

> "Product → suy luận fields: code, name, category, price, status, description, image, createdAt. OK hay sửa?"

Inferring beats blank-questioning when there's a strong semantic match. Confirm before locking in.

### Step 6 — Produce the confirmed summary
Once all blockers are answered, emit a concise summary table in user's language. Use the layout from `_refs/<TRACK>.md` (each track has its own summary template). End with:

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
- End with the confirmed summary table from `_refs/<TRACK>.md`
- Suggest `orchestration/memories` for project-level answers that will repeat

### MUST NOT
- Generate code or commit files at this stage
- Re-ask questions the user already answered — read the conversation
- Combine unrelated questions into one mega-question
- Accept "thôi cứ làm đại" — push back: name the minimum subset that's still required ("Cần ít nhất X và Y trước; phần khác lấy default được")
- Defer answers that change the architecture (persistence, domain, layout) — those must be locked before the spec stage
- Mix angular-portal blockers into a nextjs session, or vice versa — load the right `_refs/<TRACK>.md`

## Anti-patterns
- Skipping production domain (nextjs) → sitemap + OG URLs ship with `localhost:3000`
- Skipping contact email (nextjs) → form ships fake (`setTimeout`), defeats the point
- Skipping module ownership (angular/nestjs) → CRUD code generated in the wrong namespace, refactored later at 3x cost
- Skipping persistence + transaction style (nestjs) → service layer mixed with TypeORM, hard to swap or test
- Default-everything without confirmation → wrong palette / wrong layout / wrong workflow / wrong endpoints
- Bundling 10+ questions in one wall of text → user gives up; ask in blocks

## Hand-off
On full confirmation:
1. Render the summary table
2. Hand off to `sdcorejs-write-spec` with: track, scope summary, confirmed answers, source artifacts (PRD/screenshot/cURL if provided)
3. Optionally suggest `orchestration/memories` for durable answers

## Related skills
- `_refs/<TRACK>.md` — track-specific blocker checklist (Clarify section) + summary template
- `sdcorejs-brainstorm` — runs before this, sets direction
- `sdcorejs-write-spec` — runs after this, drafts the spec
- `orchestration/memories` — capture project-level answers (domain, hosting, conventions)
