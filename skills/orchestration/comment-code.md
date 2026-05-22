---
name: sdcorejs-comment-code
description: Mandatory ASK gate at the comment phase of every code-writing workflow. Always asks the user which comment level to apply — `skip` / `simple` / `medium` / `full` — before any comments are written. Outcome is optional: `skip` produces no comments; the other 3 levels apply progressively richer JSDoc + inline rules. Runs after `50-review-code` / `orchestration/repair-loop` and BEFORE `orchestration/verify-before-done`. Triggers - automatic at the comment phase of any code-writing skill; or user says "add comments", "viết comment", "thêm comment", "comment lại code". Applies to angular-portal, nestjs, nextjs.
allowed-tools: Read, Edit, Write
---

# Comment Code — Always Ask, Apply at the Chosen Level

## Purpose
"Should I add comments?" is a decision, not a default. Auto-adding full JSDoc to everything bloats files and trains the team to skim past noise. Skipping comments entirely loses non-obvious context the next reader will need. This skill forces the decision to be conscious — every code-writing session, the user picks the level, and the chosen ruleset is applied uniformly.

## When invoked
- **Auto-invoked** at the comment phase of every code-writing workflow:
  - After `50-review-code` and `orchestration/repair-loop` (if findings existed)
  - BEFORE `51-write-comments` (Angular) / NestJS/NextJS equivalents
  - BEFORE `orchestration/verify-before-done`
- User explicitly: "add comments", "viết comment", "thêm comment", "comment lại code", "comment level"

Do NOT invoke for:
- Tasks with no code generation (planning, brainstorming, review-only)
- Tasks that already explicitly declined comments earlier in the same session — honor the prior choice unless user re-opens the question
- Bug fix that's a 1-line patch in already-commented code (use existing style)

## The ASK (always — never skip this step)

Present 4 options to the user. Match the session language.

**Vietnamese variant:**
```
Bạn muốn comment cho code vừa generate ở mức nào?

  (1) skip    — Không thêm comment nào
  (2) simple  — JSDoc 1 dòng cho public methods; // why chỉ ở chỗ thật sự khó hiểu
  (3) medium  — JSDoc cho public + private phức tạp; // why ở logic non-obvious + magic numbers + workarounds
  (4) full    — JSDoc đầy đủ + class header + WHY-X.md doc cho module lớn (xem `51-write-comments`)

Mặc định gợi ý: simple (giữ file gọn, chỉ comment chỗ cần thật sự).
```

**English variant:**
```
Comment level for the code just generated?

  (1) skip    — No comments added
  (2) simple  — 1-line JSDoc on public methods; // why only where truly non-obvious
  (3) medium  — JSDoc on public + complex private; // why for non-obvious logic, magic numbers, workarounds
  (4) full    — Full JSDoc + class headers + WHY-X.md companion for major modules (see `51-write-comments`)

Default suggestion: simple (keep files lean, comment only where it pays off).
```

Wait for the user's pick. Do not proceed without a choice. If user says "anything" / "you decide", default to **simple** and tell them which default was used.

## Level rulesets

The ruleset applies to TypeScript (Angular / NestJS / NextJS — all 3 tracks share the same JSDoc-based comment conventions). Stack-specific extras at the end of each level.

### Level: `skip`
No action. The agent reports "Bỏ qua comment theo lựa chọn của bạn." and hands off to `verify-before-done`.

If existing code has comments (e.g. from prior generation), leave them alone — don't strip.

### Level: `simple`
**JSDoc:**
- Public methods only — 1 line summary
- No `@param` / `@returns` when types are self-explanatory
- No class-level JSDoc unless the class encodes a non-obvious contract

**Inline `// why` comments:**
- Only on lines where the WHAT is clear from naming but the WHY is not
- Cap: ≤3 per file (forces the agent to pick the truly load-bearing ones)
- Format: `// why: <one-line reason>`

**Skip entirely:**
- Getters / setters / trivial accessors
- Constructor unless DI choice is non-default
- Internal helpers that are obvious from name + types
- Tests (test name carries the intent)

Output report:
```
Simple-level comments applied.
- N JSDoc lines added across M files
- K // why comments at: <file:line>, <file:line>, ...
```

### Level: `medium`
**JSDoc:**
- Public methods + complex private methods (>15 lines OR uses async / shared state / mutation)
- `@param` / `@returns` when type alone doesn't convey intent (e.g. boolean flags, opaque IDs)
- Class-level JSDoc when class is part of the public API surface

**Inline `// why` comments:**
- Non-obvious branching, magic numbers, workarounds for known bugs, dependency-order constraints
- Cap: ≤8 per file
- Format: `// why: <reason>` for short; multi-line allowed when explaining a constraint

**Skip:**
- Trivial accessors
- Test setup boilerplate
- Self-documenting one-liners

**Stack-specific:**
- Angular: comment on lifecycle hook ordering when it differs from default (e.g. why `ngAfterViewInit` instead of `ngOnInit`); note `OnPush` triggers when relying on signal/input identity
- NestJS: document decorator order when it matters (e.g. `@AuthGuard` before `@HasPermission`); note any TypeORM relation eager/lazy choices
- NextJS: mark Server Component vs Client Component boundary if non-obvious; note `revalidate` / `cache` choices

Output report: same shape as simple, plus a count by category (JSDoc / inline / class-header).

### Level: `full`

`full` does everything `medium` does, plus:
- Every public method + every class gets JSDoc with `@param` / `@returns` / `@throws`
- Inline `// why` for any line where intent isn't immediately obvious from name (no per-file cap; the cap is "no redundant comment")
- `WHY-X.md` companion doc at `<target>/.sdcorejs/docs/<track>/<timestamp>-why-<topic>.md` summarizing the non-obvious design decisions of the module
- Tests get `// asserts: <invariant>` headers on each `it()` describing what the test guards against

**Dispatch pattern (cross-track design):**
- The **cross-track rules above** (JSDoc shape, WHY-X.md format, test header convention) are authoritative — DO NOT duplicate them per-track
- The **per-track FULL skill** adds only the track-specific layer on top:

| Track | FULL skill | What the per-track skill adds |
|---|---|---|
| angular-portal | `tracks/angular-portal/51-write-comments.md` | JSDoc on `signal()` / `computed()` / `inject()` patterns; comment Core UI lifecycle hook ordering; signal-template invocation rules |
| nestjs | `tracks/nestjs/51-write-comments.md` *(planned)* | JSDoc on decorators + guard order; TypeORM relation eager/lazy notes; QueryRunner transaction boundaries |
| nextjs | `tracks/nextjs/51-write-comments.md` *(planned)* | `"use client"` / `"use server"` boundary annotations; `revalidate` window rationale; OG image generation notes |

**Orchestration:**
1. `comment-code` confirms level=full
2. Detect target track (same logic as `sdcorejs-brainstorm` Step 0)
3. Dispatch to the per-track FULL skill IF it exists; the skill consumes the cross-track rules from THIS file as its baseline + applies its track-specific delta
4. IF the per-track skill is not yet implemented (e.g. NestJS today): apply the cross-track rules from THIS file alone, and flag the gap: "NestJS-specific FULL comments deferred — only cross-track rules applied."

**Note for skill authors:** When adding a NestJS / NextJS per-track FULL skill, KEEP IT SHORT (~80 lines). The base rules live here. The per-track skill only documents the framework-specific JSDoc tags + workflow extras. This prevents the duplication that motivated the cross-track refactor.

Output report: file path of the companion doc + summary stats + which per-track skill was used (or "cross-track baseline only" if not yet shipped).

## Common rules (all levels except `skip`)

### MUST DO
- Comments explain **WHY**, never WHAT — good names and types already say what
- Comments stay synced with code; if a refactor invalidates a comment, delete or update it (never leave a stale comment)
- Bilingual: VI session → VI comments (full diacritics); EN session → EN. Keep imports/symbols English regardless.
- Comments respect file's existing convention; don't mix styles within the same file
- After applying, run `npm run lint` — comment-format rules may catch issues

### MUST NOT
- Write WHAT comments (`// loop over items` above a `for` loop)
- Comment out dead code (delete it; git history is the archive)
- Add `// TODO` without an owner + condition (`// TODO(name): until <date|condition>`)
- Use comments to mask a hack — fix the hack instead
- Auto-translate the user's hand-written comments
- Add JSDoc placeholders with no content (`/** TODO: write doc */`)

## Examples

### Simple level — applied to a service method
```typescript
/**
 * Save a product and notify listeners; throws on validation failure.
 */
async save(req: ProductSaveReq): Promise<ProductDTO> {
  // why: must clear cache before persist so subscribers re-fetch fresh data
  this.#cache.clear();
  return this.#api.update(req.id, req);
}
```
(1 JSDoc line on public method, 1 `// why` on the non-obvious order.)

### Medium level — same method, more context
```typescript
/**
 * Save a product and notify listeners.
 *
 * @param req Save payload. `id` undefined → create; defined → update.
 * @throws EntityNotFoundError when `req.id` is set but row no longer exists.
 */
async save(req: ProductSaveReq): Promise<ProductDTO> {
  // why: must clear cache before persist so subscribers re-fetch fresh data
  this.#cache.clear();

  // why: backend assigns audit fields server-side; do NOT set updatedAt here
  return this.#api.update(req.id, req);
}
```

### Skip level
The method ships as-is, no comments added. The agent reports:
> "Bỏ qua comment theo lựa chọn của bạn. Hand off `orchestration/verify-before-done`."

## Cross-references
- `51-write-comments.md` (angular-portal) — FULL level implementation; this skill dispatches to it
- `orchestration/auto-docs` — runs after this skill; the chosen level + count goes into the session summary
- `orchestration/verify-before-done` — runs after this skill; comment count is NOT an acceptance criterion (commenting is a styling concern, not feature correctness)
- `orchestration/repair-loop` — if review surfaces missing-comment findings AND the user picked `skip`, those findings are auto-deferred (the user's choice overrides)

## Anti-patterns
- **Asking once and never again** — every code-writing session asks; preference doesn't persist by default
- **Defaulting to `full` because it "looks thorough"** — overcommented files train readers to skim
- **Skipping the ASK** because the agent thinks it knows what the user wants — the whole point of this skill is to surface the choice
- **Applying different levels to different files in the same session** — pick once per session for consistency
- **Translating comments mid-file** when stack/language switches — keep file's existing language unless user asks
