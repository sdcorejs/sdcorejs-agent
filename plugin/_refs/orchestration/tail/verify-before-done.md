# Acceptance Gate

Reference body for `sdcorejs-ship (verify-before-done mode)`. Load this file only when that mode runs.

## Purpose
"Tests pass" ≠ "feature done". A test suite covers the cases someone thought to write; acceptance criteria are what the user signed off on. This skill closes the gap — it makes the agent prove, criterion by criterion, that what was built matches what was specified.

> **Scope.** This gate is the feature-end *enforcement point* of the always-on evidence-before-claims rule (CLAUDE.md rule 10). That rule governs EVERY interim success claim during the task too — "tests pass", "build is green", "fixed" each need fresh command output in the same turn they're claimed. This skill is where the rule is checked exhaustively, criterion-by-criterion, before "done".

## When invoked
- **MANDATORY** automatic invocation BEFORE `sdcorejs-ship (branch-ready mode)` → `_refs/orchestration/tail/auto-docs.md` at the end of every code-writing skill (`write-code` — the `sdcorejs-angular` orchestrator and the reference packs it loads, including `actions` — and `sdcorejs-test`)
- Before `sdcorejs-git (commit mode)` for a feature commit (not for chore/docs commits)
- Before `sdcorejs-git (PR mode)`
- User says "verify", "verify acceptance", "check acceptance criteria", "is this done?"

Do NOT invoke for:
- Chore / docs-only / dep-bump tasks (no acceptance criteria to verify)
- Bug-fix tasks (use the original repro as the verifier — see `sdcorejs-debug`)
- Tasks where no spec was written (the workflow's brainstorming path can bypass spec for tiny scope — in that case this skill skips with a warning)

## Workflow

### 1. Find the relevant spec
```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
TRACK=angular   # detected from stack

# Most recent spec doc (by filename timestamp)
ls -1t "$TARGET_ROOT/.sdcorejs/docs/$TRACK"/*-spec.md 2>/dev/null | head -1
```
If multiple specs are recent, ask the user which one is in scope.

If no spec exists → skip with a warning:
> "No spec found in .sdcorejs/docs/<track>/. Skipping acceptance verification; verifying only tests + lint. Ask the user to manually confirm done."

Also look for a related product ledger:

```bash
ls -1t "$TARGET_ROOT/.sdcorejs/docs/product"/*.md 2>/dev/null | head -5
```

If a ledger clearly matches the feature, read it before extracting criteria. Any product gap marked `missing`, `partial`, or `blocker` must be resolved or explicitly deferred by the user before this gate can report "done".

### 2. Extract the Acceptance Criteria section
Look for `## Acceptance criteria` or its localized equivalent. Each criterion is typically a `- [ ]` bullet.

For each criterion, derive a **verification mode**:

| Criterion shape | Verification mode |
|---|---|
| "User can navigate to `/X` and see ≥N rows" | E2E test OR `curl` to the route + grep for marker |
| "Validation: field X required if Y == Z" | Unit test on form spec |
| "Update preserves audit fields" | Unit test asserting `createdAt` unchanged across update |
| "API returns 403 for unauthorized" | Integration test or `curl -H` with bad token |
| "Localized labels render with the expected Unicode marks" | Use a locale-specific Unicode/diacritic check in rendered output or template files |
| "List filter by status returns only matching rows" | E2E with filter applied + count check |
| **(NextJS)** "Localized message keys symmetric; content files mirrored" | `npm run check:i18n` (from the `sdcorejs-nextjs` orchestrator, content-quality pack) — exit 0 |
| **(NextJS)** "Every page meets min word count for its type" | `npm run check:content` — exit 0 |
| **(NextJS)** "Lighthouse SEO score ≥ 95 on home + 1 detail" | `npx lighthouse <url> --only-categories=seo --output=json` — parse `categories.seo.score` |
| **(NextJS)** "Article pages emit Article JSON-LD with author + dates" | `curl <article-url> \| grep -o '"@type":"Article"'` + manual paste to Google Rich Results Test |
| **(NextJS)** "Title 50-60 chars; description 150-160 chars per page" | Build the page in dev → check console for `[SEO] Title too long/short` warnings from `buildMetadata` |
| **(NextJS)** "Heading hierarchy: 1 h1, no skipped levels" | `npx pa11y <url>` or `axe-core` heading-order rule |
| Visual / UX criteria ("looks correct", "smooth animation") | MANUAL — present checklist, cannot auto-verify |
| **(NextJS)** "EN copy is native-quality, not machine-translated" | MANUAL — must be reviewed by a fluent EN speaker before claiming ✅ |

Document the mode you chose in the verification report — the user can adjust.

### 3. Run automatable verifications

Group by type, run in parallel where possible:

#### Build + lint + typecheck (always)
```bash
npm run build                        # or relevant variant
npm run lint
npm run test -- --watch=false        # full unit + integration suite
```
Any failure here → block immediately. The lower-level checks must pass before acceptance verification runs.

#### Stack-specific automated checks (run if scripts exist)

Detect by reading `package.json` `scripts` — only run scripts that are actually defined. Missing scripts are not failures; they signal the project hasn't installed that quality gate yet (and the agent should flag it for the user if the track expects it).

**NextJS landing sites** (the `sdcorejs-nextjs` orchestrator's content-quality pack installs these):

```bash
# Language parity — fails if vi.json/en.json keys diverge OR content/vi/*.ts ↔ content/en/*.ts file sets diverge
npm run check:i18n 2>/dev/null && echo "✅ i18n parity" || echo "❌ i18n parity (or script missing)"

# Minimum content length per page type — fails if any registered content file is below threshold
npm run check:content 2>/dev/null && echo "✅ content length" || echo "❌ content length (or script missing)"
```

If `check:i18n` or `check:content` is missing AND the spec mentions multi-language support OR long-form content, surface this as a Critical finding:

> "Spec mentions language parity / long-form articles but `package.json` has no `check:i18n` / `check:content` script. Invoke the `sdcorejs-nextjs` orchestrator (content-quality pack) to install before claiming done."

**Lighthouse SEO (NextJS, when a URL is reachable)**:

```bash
# Run against the dev server (or staging URL if available)
SITE_URL=http://localhost:3000
npx --yes lighthouse "$SITE_URL" --only-categories=seo --quiet --chrome-flags="--headless" --output=json --output-path=.lighthouse-seo.json
node -e "const s=require('./.lighthouse-seo.json').categories.seo.score; console.log(s>=0.95?'✅':'❌', 'Lighthouse SEO:', Math.round(s*100))"
```

Skip if no URL is reachable (e.g. pure offline build); flag as MANUAL deferred.

**NestJS / Angular**: no equivalent content scripts yet. Track this for future skill packs.

#### Per-criterion (in parallel)
```bash
# E2E criterion
npm run e2e -- --spec=path/to/test

# Manual probe
curl -s http://localhost:4200/catalog/product | grep -c '<tr class="row"' # >= 20
```

#### Smoke run (Angular / NestJS / NextJS — picks based on stack)
- Angular: start dev server, hit home route + the feature route, verify no console errors
- NestJS: hit `/health` + 1 real endpoint with valid auth
- NextJS: load home + 1 server-rendered page, no hydration errors

If smoke run fails, code may compile and unit-test pass but feature is broken in practice. Block.

### 4. Produce the verification report

Single table, sorted by status:

```markdown
## Acceptance Verification — <feature> — <date>

### Spec: `.sdcorejs/docs/<track>/<spec-file>.md`

| # | Criterion | Mode | Result |
|---|---|---|---|
| 1 | User can navigate to `/catalog/product` and see ≥20 rows | E2E + curl probe | ✅ 25 rows |
| 2 | Create validates: code required, discountValue 0-100 if type=PERCENT | Unit (form spec) | ✅ 4/4 tests |
| 3 | Update preserves audit fields; createdAt unchanged | Unit | ❌ FAIL — createdAt is being overwritten on update |
| 4 | List filter by status returns only matching rows | E2E | ⏭ skipped (no E2E framework configured) |
| 5 | All localized labels render with full diacritics | grep in templates | ⚠️ 2 labels missing diacritics: `Cap nhat` (line 42), `Xoa` (line 78) |
| 6 | Smooth transition between list and detail | MANUAL | ⏸ awaiting human check |

### Product traceability
- ledger: `.sdcorejs/docs/product/<ledger-file>.md`
- requirement / implementation / test alignment: partial
- blockers: AC3 has implementation but no passing test evidence

### Build / lint / typecheck
- build: ✅
- lint: ✅
- test full: 47/48 (1 fail in audit-fields test — see #3)
- smoke run: ✅ (home + /catalog/product loaded, no console errors)

### Verdict
🟡 **NOT DONE** — 1 failed criterion (#3), 1 issue flagged (#5), 1 manual pending (#6)

### Next actions
- #3: `update()` in `product.service.ts` line 47 — investigate and fix (loop via `sdcorejs-repair-loop`)
- #5: add diacritics to 2 labels in `detail.component.html`
- #4: skipped because no E2E framework — confirm with user that manual check is enough
- #6: manual — user verify
```

### 5. Block "done" if criteria failed

The agent MUST NOT claim "done", run `_refs/orchestration/tail/auto-docs.md` with a complete status, or trigger `sdcorejs-git (commit mode)` for a feature commit until:
- ALL ✅ for automatable criteria, OR
- User explicitly says "defer #N" / "ship with manual check pending" / "won't fix #N"

The user's defer/won't-fix acknowledgment goes into the auto-docs entry under "Open questions / follow-ups" so the next session knows what's outstanding.

### 6. Hand off
After the report + user direction (the branch-hygiene gate `sdcorejs-ship (branch-ready mode)` runs between this skill and auto-docs — never skip it):
- If ALL ✅ + no manual deferred → invoke `sdcorejs-ship (branch-ready mode)` (hygiene sweep + merge/PR options), then run `_refs/orchestration/tail/auto-docs.md` with "Status: done"
- If partial → invoke `sdcorejs-repair-loop` with the failed criteria as the findings list
- If user defers → invoke `sdcorejs-ship (branch-ready mode)`, then run `_refs/orchestration/tail/auto-docs.md` with "Status: partial — see Open questions", do NOT auto-commit

## Examples

### Clean pass
```
6 criteria → 6 ✅
build/lint/test: ✅
Verdict: 🟢 DONE
→ branch-ready (hygiene sweep)
→ auto-docs (status: done)
→ commit prep
```

### Partial pass
```
6 criteria → 4 ✅ + 1 ❌ (#3) + 1 ⏸ manual (#6)
build/lint/test: 47/48 (1 fail from #3)
Verdict: 🟡 NOT DONE
→ surface to user
→ user: "fix #3, defer #6 until staging"
→ invoke fix-loop with #3
→ re-run this skill
```

### Spec-less task
```
No spec found (small bug fix, no .sdcorejs/docs/<track>/*-spec.md)
→ skip acceptance verification with warning
→ run build/lint/test only
→ user confirms "done" by hand
```

## Rules

### MUST DO
- Run BEFORE `_refs/orchestration/tail/auto-docs.md` at end of any feature-writing skill
- Load the spec from `.sdcorejs/docs/<track>/` — never invent criteria
- Load the related `.sdcorejs/docs/product/` ledger when it exists and treat product gaps as acceptance blockers unless the user defers them
- Pick a concrete verification mode for each criterion; document the choice
- Run build + lint + full test before per-criterion checks
- Run a smoke command for the stack — don't trust unit tests alone
- Run stack-specific quality scripts if `package.json` defines them (`check:i18n`, `check:content`, `lighthouse`) — count failures as Critical, count missing-when-relevant as Important
- For NextJS sites with bilingual or long-form scope: REQUIRE `check:i18n` + `check:content` to be installed (via the `sdcorejs-nextjs` orchestrator's content-quality pack) and passing before claiming done
- Surface partial failures explicitly; never round up to ✅
- Block "done" until user confirms defer or all green

### MUST NOT
- Claim a manual criterion ✅ on behalf of the user
- Auto-defer a criterion because verification is hard
- Skip the smoke run because "build is green"
- Mark `⏭ skipped` without telling the user
- Invent acceptance criteria that aren't in the spec
- Allow `_refs/orchestration/tail/auto-docs.md` to write "status: done" while criteria fail
- Use a passing CI run as a substitute for actually executing the verification commands
- Claim ✅ on "EN copy is native-quality" without a fluent-EN-speaker review — machine-translated EN must always go to manual
- Skip `check:i18n` / `check:content` when they exist — these are cheap and catch real regressions

## Anti-patterns
- **Test theater**: "all 200 tests pass" → none of them touch the acceptance criterion that actually broke
- **Optimistic green**: marking manual criteria ✅ because "it should work"
- **Skipping the smoke run**: tests pass on a server that won't start
- **Spec drift**: silently revising the spec to match what was built instead of fixing the code
- **Hidden manual**: pushing all hard criteria to "manual checkbox the user clicks" without surfacing them
- **CI substitution**: trusting a green PR check as proof — CI runs an older commit OR didn't run the right subset

## Cross-references
- `sdcorejs-ship (branch-ready mode)` — runs immediately AFTER this skill (branch-hygiene sweep) and BEFORE auto-docs; mandatory, never skipped
- `_refs/orchestration/tail/auto-docs.md` — runs after branch-ready; this skill blocks auto-docs from claiming "done" prematurely
- `sdcorejs-repair-loop` — invoked when this skill finds failed criteria
- `_refs/orchestration/tail/auto-task-tracker.md` — open criteria flow into the living TODO until resolved
- `sdcorejs-spec` (cross-track, `shared/sdlc/02-spec.md`) — defines the Acceptance Criteria section format this skill reads
- `sdcorejs-test` — many acceptance criteria are best verified via E2E; cross-reference for the right framework
- `sdcorejs-product` — maintains the requirement / implementation / test ledger that this gate checks when present
- `sdcorejs-nextjs` (content-quality pack, `_refs/nextjs/build-website/write-code/content-quality.md`) — installs `check:i18n` + `check:content` scripts that this skill invokes; defines the Language parity + minimum content length contracts
