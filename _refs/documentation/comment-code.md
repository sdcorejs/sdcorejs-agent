# Comment Code Reference - Comment Level Rulesets

Internal reference loaded by `sdcorejs-documentation` in `comment-code` mode.
This file is not a dispatchable skill.

## Purpose
"<localized text>" is a decision, not a default. Auto-adding full JSDoc to everything bloats files and trains the team to skim past noise. Skipping comments entirely loses non-obvious context the next reader will need. The finish gate or `sdcorejs-documentation (comment-code mode)` makes the decision conscious, then this reference supplies the ruleset for the selected level.

## How this reference is used
- Loaded by `sdcorejs-documentation (comment-code mode)` at the comment phase of every code-writing workflow:
  - After `sdcorejs-review` and `sdcorejs-repair-loop` (if findings existed)
  - BEFORE `sdcorejs-ship (verify-before-done mode)`
- User explicitly: "add comments", "comment the code", "comment level", or localized equivalents

> **Comment level now comes from the documentation gate** ([`_refs/documentation/gate.md`](gate.md)), which is surfaced by the consolidated FINISH GATE ([`_refs/shared/finish-gate.md`](../shared/finish-gate.md)). When a track write-code orchestrator (angular / nestjs / nextjs) or direct `sdcorejs-test` run captures `comment_code`, this mode applies that level and does **NOT** ask again. Only run the standalone ASK when the documentation skill is invoked directly without a gate choice (for example, the user says "add comments" outside a code-gen flow).

Do NOT invoke for:
- Tasks with no code generation (planning, brainstorming, review-only)
- Tasks that already explicitly declined comments earlier in the same session — honor the prior choice unless user re-opens the question
- Bug fix that's a 1-line patch in already-commented code (use existing style)

## The ASK (only when no FINISH GATE choice exists — e.g. invoked directly)

If the FINISH GATE already captured a comment level this code-gen, skip straight to applying it. Otherwise present 4 options to the user. Match the session language.

**Localized source prompt:**
```
Which comment level do you want for the generated code?

  (1) skip    — add no comments
  (2) simple  — One-line JSDoc for public methods; // why only for genuinely hard-to-read code
  (3) medium  — JSDoc for public and complex private members; // why on non-obvious logic, magic numbers, and workarounds
  (4) full    — Full JSDoc + class header + WHY-X.md for large modules

Suggested default: simple (keeps files compact and comments only where useful).

Reply with `1`, `2`, `3`, or `4`.
```

**Compact English fallback:**
```
Comment level for the code just generated?

  (1) skip    — No comments added
  (2) simple  — 1-line JSDoc on public methods; // why only where truly non-obvious
  (3) medium  — JSDoc on public + complex private; // why for non-obvious logic, magic numbers, workarounds
  (4) full    — Full JSDoc + class headers + WHY-X.md companion for major modules

Default suggestion: simple (keep files lean, comment only where it pays off).

Reply with `1`, `2`, `3`, or `4`.
```

Wait for the user's pick. Do not proceed without a choice. If user says "anything" / "you decide", default to **simple** and tell them which default was used.

## Level rulesets

The ruleset applies to TypeScript (Angular / NestJS / NextJS — all 3 tracks share the same JSDoc-based comment conventions). Stack-specific extras at the end of each level.

### Level: `skip`
No action. The agent reports "Skipping comments per your choice." and hands off to `sdcorejs-ship (verify-before-done mode)`.

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

#### JSDoc shape (all tracks)

Every exported function / method / class gets a JSDoc block with required tags when applicable. Skip `@param` if there are no params.

```typescript
/**
 * <one-line summary, ends with period.>
 *
 * <optional 1-3 line elaboration covering invariants, side effects, or non-obvious behavior.>
 *
 * @param id - the entity id (must be a UUID; throws otherwise)
 * @returns the persisted DTO including server-assigned audit fields
 * @throws {EntityNotFoundError} when no record matches `id`
 */
async update(id: string, req: ProductSaveReq): Promise<ProductDTO> { ... }
```

#### Inline `// why` placement

Apply on lines where the WHAT is obvious but the WHY is not. Format: `// why: <one-line reason>` (lower-case after `why:`, no trailing period for short notes; multi-line allowed when explaining a constraint).

Common categories where `// why` earns its keep:
- Workflow state transitions
- Race-condition guards
- Floating-point comparisons / rounding
- Order-dependent operations (uploads before save, detach observers before destroy)
- Unusual flag combinations (`replaceUrl: true` after stale-id recovery)
- Backend quirks (`if (res.status === 204) return null` — backend returns 204 instead of empty array)

#### `WHY-X.md` companion doc

When a flow spans **3+ files** and the WHY can't fit in inline comments, write a brief at `<target>/.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-why-<topic>.md`. 30-80 lines, sections: **Context** → **Decision** → **Consequences** → **Files involved**. For trivial 3-line CRUD, skip — only worth writing for non-obvious cross-file design decisions.

#### Tests

Each `it()` / `test()` gets a `// asserts: <invariant>` header line describing what the test guards against. The header is BELOW the `it('name', () => {` line, not above it.

```typescript
it('rejects update when id is missing', () => {
  // asserts: update without id is a programmer error, must throw — never silently create
  expect(() => service.update(undefined, req)).toThrow();
});
```

#### What NOT to comment (at any level — restated here because `full` tempts toward over-commenting)

- ❌ Restating the code: `// loop through items` above `for (const item of items)`
- ❌ Commented-out code blocks (delete them; git remembers)
- ❌ TODO without ticket reference (`// TODO: fix later` is noise; `// TODO(JIRA-1234): replace with API call when backend ready` is actionable)
- ❌ Author name + date headers (git blame gives you that)
- ❌ Section dividers like `// ---- HELPERS ----` (use real headers in docs files instead)
- ❌ JSDoc that just restates the signature (`@param id - the id` — worse than nothing)
- ❌ Auto-translate the user's hand-written comments

#### Track-specific addenda for `full`

The cross-track rules above are authoritative. Each track adds a small framework-specific layer — apply both at level=full.

**angular:**
- JSDoc on `signal()` / `computed()` / `inject()` patterns — note non-obvious dependency choices and signal write/read scopes
- Comment Core UI lifecycle hook ordering when it differs from default (e.g. why `ngAfterViewInit` instead of `ngOnInit`); note `OnPush` triggers when relying on signal/input identity
- Signal template-invocation rule: when a signal is read **2+ times** in a template, leave a `// why: ...` comment on the `computed()` or `@let` that caches it, explaining the perf rationale

**nestjs** *(deferred — cross-track baseline applies; document the gap in the output report)*:
- JSDoc on decorators + guard order (e.g. `@AuthGuard` before `@HasPermission`)
- TypeORM relation `eager` / `lazy` annotation rationale
- `QueryRunner` transaction boundary notes (commit / rollback / connection release)

**nextjs** *(deferred — cross-track baseline applies; document the gap in the output report)*:
- `"use client"` / `"use server"` boundary annotations when non-obvious
- `revalidate` window rationale (why 30 min vs ISR-on-demand)
- OG image generation notes when route uses `@vercel/og` dynamic generation

#### Process at `full` level

1. Read the file(s) the user asked about (or every file generated in the current session)
2. Identify public APIs (exported functions, classes, methods) → add full JSDoc with `@param` / `@returns` / `@throws`
3. Identify non-obvious logic → add `// why:` lines
4. Identify cross-file design decisions spanning 3+ files -> propose `WHY-X.md`
   brief and ask the user to confirm before writing it with
   `1. Write WHY-X.md (yes)` / `2. Skip WHY-X.md (no)`.
5. Apply the track-specific addendum from the matching sub-section above
6. Diff what changed — show the user the comment additions only, not the full file

#### Output report at `full` level

```markdown
## Comments applied (level=full, track=<track>)

### <file path>
- JSDoc on `<method>` — documents <key behavior>
- `// why:` on line <N> — explains <constraint>

### Companion doc (if written)
- Wrote `.sdcorejs/docs/<track>/<timestamp>-why-<topic>.md` covering <files involved>

### Track-specific layer applied
- <track addendum bullet points that were applied>

### Gaps
- <track>-specific FULL addendum is deferred — only cross-track baseline applied. [Only when track addendum is marked deferred above.]
```

## Common rules (all levels except `skip`)

### MUST DO
- Comments explain **WHY**, never WHAT — good names and types already say what
- Comments stay synced with code; if a refactor invalidates a comment, delete or update it (never leave a stale comment)
- Runtime-localized: comments follow the session language with locale-specific marks preserved. Keep imports/symbols English regardless.
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
> "Skipping comments per your choice. Hand off `sdcorejs-ship (verify-before-done mode)`."

## Cross-references
- `_refs/orchestration/tail/auto-docs.md` — runs after `sdcorejs-documentation (comment-code mode)`; the chosen level + count goes into the session summary
- `sdcorejs-ship (verify-before-done mode)` — runs after this mode; comment count is NOT an acceptance criterion (commenting is a styling concern, not feature correctness)
- `sdcorejs-repair-loop` — if review surfaces missing-comment findings AND the user picked `skip`, those findings are auto-deferred (the user's choice overrides)

## Anti-patterns
- **Asking once and never again** — every code-writing session asks; preference doesn't persist by default
- **Defaulting to `full` because it "looks thorough"** — overcommented files train readers to skim
- **Skipping the ASK** because the agent thinks it knows what the user wants — the whole point of this mode is to surface the choice
- **Applying different levels to different files in the same session** — pick once per session for consistency
- **Translating comments mid-file** when stack/language switches — keep file's existing language unless user asks
