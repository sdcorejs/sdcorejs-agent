# Orchestration Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the SDCoreJS orchestration layer with 5 improvements: a self-contained TDD skill, a ship orchestrator, source-aware repair-loop, changelog wiring, and auto-triggered specialized review hints.

**Architecture:** Each task targets one source file under `skills/`. After each edit, run `.claude/sync-skills.sh` to regenerate the `.claude/skills/<name>/SKILL.md` mirror. Tasks are independent and can be executed in parallel by separate subagents.

**Tech Stack:** Markdown skill files, bash sync script (`skills/` → `.claude/skills/`), Conventional Commits.

---

## File Map

| Task | Action | Source file | Mirror |
|---|---|---|---|
| 1 | CREATE | `skills/testing/tdd.md` | `.claude/skills/sdcorejs-tdd/SKILL.md` |
| 2 | CREATE | `skills/orchestration/ship.md` | `.claude/skills/sdcorejs-ship/SKILL.md` |
| 3 | EDIT | `skills/orchestration/repair-loop.md` | `.claude/skills/sdcorejs-repair-loop/SKILL.md` |
| 4 | EDIT | `skills/shared/conventions/changelog.md` | `.claude/skills/sdcorejs-changelog/SKILL.md` |
| 5 | EDIT | `skills/orchestration/branch-ready.md` | `.claude/skills/sdcorejs-branch-ready/SKILL.md` |

**Sync command (run after each task):**
```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
```

---

## Task 1: Create sdcorejs-tdd

**Files:**
- Create: `skills/testing/tdd.md`
- Generated: `.claude/skills/sdcorejs-tdd/SKILL.md`

- [ ] **Step 1: Confirm tdd.md does not exist yet**

```bash
ls "c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent\skills\testing"
```

Expected output includes `e2e/`, `integration/`, `unit/`, `philosophy.md` — no `tdd.md`. If `tdd.md` already exists, read it before proceeding.

- [ ] **Step 2: Write skills/testing/tdd.md**

Full content:

```markdown
---
name: sdcorejs-tdd
description: Use BEFORE writing any implementation code within a write-code task. Enforces Red-Green-Refactor per track — knows Angular TestBed, NestJS Jest, Next.js Jest so you don't re-derive boilerplate each time. Invoked by write-code orchestrators for EACH implementation chunk (service / component / function / handler). Self-contained; does not require superpowers:test-driven-development. Triggers: "dùng TDD", "viết test trước", "TDD", "red-green-refactor", auto-invoked by write-code orchestrators. Bilingual (VI/EN).
allowed-tools: Read, Edit, Write, Bash
---

# TDD — Test-Driven Development (SDCoreJS Stack)

## Purpose
Write the failing test first. Watch it fail. Write minimal code to pass. Refactor. Repeat.

**Iron law:** `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`

This skill knows the Angular / NestJS / Next.js test setup so you spend zero time on
boilerplate and all time on the test contract.

When the thought "I'll write a quick implementation first just to understand the shape"
appears — stop. That is rationalization. Delete any such code and start with the test.

## When to invoke

### Auto-invoked by write-code orchestrators
Before implementing each chunk (service / component / function / handler / pipe / guard):
1. Write failing test → verify RED
2. Implement minimal code → verify GREEN
3. Refactor if needed
4. Write next failing test

### Manual trigger
"dùng TDD", "viết test trước", "test first", "TDD", "red-green-refactor cho cái này"

### NOT invoked for
- Template-only changes (pure HTML / SCSS, zero logic)
- Configuration files, module declarations, barrel exports (`index.ts`)

## Per-track boilerplate

### Angular Portal — Unit test (service / pipe / validator)

```typescript
// src/libs/<module>/features/<entity>/services/<entity>.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { <EntityService> } from './<entity>.service';

describe('<EntityService> — <behaviour under test>', () => {
  let service: <EntityService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [<EntityService>],
    });
    service = TestBed.inject(<EntityService>);
  });

  it('<expected behaviour described in terms of inputs and outputs>', () => {
    // ARRANGE
    const input = /* minimal valid input */;
    // ACT
    const result = service.<method>(input);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --watch=false --include="src/libs/<module>/**/<entity>.service.spec.ts"
```
Expected: `FAILED — Cannot find module './<entity>.service'`

### Angular Portal — Component test (standalone)

```typescript
// src/libs/<module>/features/<entity>/components/<name>/<name>.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { <NameComponent> } from './<name>.component';

describe('<NameComponent>', () => {
  let fixture: ComponentFixture<<NameComponent>>;
  let component: <NameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [<NameComponent>], // standalone
    }).compileComponents();
    fixture = TestBed.createComponent(<NameComponent>);
    component = fixture.componentInstance;
  });

  it('renders without error', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('<behaviour>', () => {
    // ARRANGE
    component.<input> = /* value */;
    // ACT
    fixture.detectChanges();
    // ASSERT
    const el = fixture.nativeElement.querySelector('<selector>');
    expect(el.<property>).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --watch=false --include="src/libs/<module>/**/<name>.component.spec.ts"
```

### NestJS — Unit test (service)

```typescript
// src/<module>/<entity>/<entity>.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { <EntityService> } from './<entity>.service';

describe('<EntityService>', () => {
  let service: <EntityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<EntityService>],
    }).compile();
    service = module.get<<EntityService>>(<EntityService>);
  });

  it('<expected behaviour>', async () => {
    // ARRANGE
    // ACT
    const result = await service.<method>(/* args */);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --testPathPattern="<entity>.service.spec.ts" --no-coverage
```
Expected: `FAILED — Cannot find module './<entity>.service'`

### NestJS — Integration test (HTTP with supertest)

```typescript
// test/<entity>/<entity>.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('<Entity> API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /<entity> → 200', () =>
    request(app.getHttpServer()).get('/<entity>').expect(200));
});
```

Verify RED:
```bash
npm run test:e2e -- --testPathPattern="<entity>.e2e-spec.ts"
```

### Next.js — Unit test (util / hook / server action)

```typescript
// src/lib/<feature>/__tests__/<function>.test.ts
import { <function> } from '../<function>';

describe('<function>', () => {
  it('<expected behaviour>', () => {
    // ARRANGE
    // ACT
    const result = <function>(/* args */);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm test -- --testPathPattern="<function>.test.ts"
```

## RED state — verify for the right reason

A test must fail because the IMPLEMENTATION is missing, not because the test is broken.

| Fail message | Interpretation |
|---|---|
| `Cannot find module './<file>'` | ✅ File doesn't exist yet — correct RED |
| `<fn> is not a function` | ✅ Export missing — correct RED |
| `Expected: X, Received: undefined` | ✅ Logic not implemented — correct RED |
| `SyntaxError` in test file | ❌ Test has a bug — fix the test first |
| `TypeError` in `beforeEach` | ❌ Test setup broken — fix setup first |

If RED for the wrong reason: fix the test. Do NOT proceed to implementation with a
broken test — you will have no confidence the GREEN state means anything.

## GREEN — minimum implementation

Write the least code that makes the test pass. No extra logic. No future parameters
"just in case". Run the test again: must be GREEN.

If still RED after implementing: re-read the error message carefully — do not guess.

## REFACTOR — clean up without breaking GREEN

After GREEN:
- Extract repeated setup into `beforeEach` or factory helpers
- Rename identifiers for clarity
- Remove `any` types used to make compilation pass
- Run the test again: must still be GREEN

Refactor = same behaviour, cleaner code. New behaviour = new failing test first.

## Anti-patterns

- Writing all tests first, then all implementations — this is test-before masquerading as
  TDD; there is no per-cycle feedback loop
- Writing the implementation and adjusting the test to match — you skipped RED; the test
  proves nothing about correctness
- Mocking the class under test — you are testing the mock, not the code
- `it('should work')` test name — name the actual behaviour:
  `it('returns 403 when user has no permission')`
- Giant test file with 20 `it()` blocks sharing mutable state — split by behaviour,
  isolate each test's state

## Cross-references
- `sdcorejs-testing-philosophy` — test pyramid, mock vs real, AAA structure, naming rules
- `sdcorejs-testing-unit-angular-portal` — full Angular unit test patterns
- `sdcorejs-testing-unit-nestjs` — full NestJS unit test patterns
- `sdcorejs-testing-integration-angular-portal` — Angular integration tests
- `sdcorejs-testing-integration-nestjs` — NestJS integration with real DB (testcontainers)
```

- [ ] **Step 3: Run sync and verify mirror was created**

```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
```

Expected: no errors. Then verify:
```bash
cat ".claude/skills/sdcorejs-tdd/SKILL.md" | head -5
```
Expected: frontmatter with `name: sdcorejs-tdd`.

- [ ] **Step 4: Commit**

```bash
git add skills/testing/tdd.md .claude/skills/sdcorejs-tdd/SKILL.md
git commit -m "$(cat <<'EOF'
feat(testing): add sdcorejs-tdd — self-contained TDD discipline per stack

Red-Green-Refactor with Angular TestBed / NestJS Jest / Next.js Jest
boilerplate. Does not depend on superpowers:test-driven-development.
EOF
)"
```

---

## Task 2: Create sdcorejs-ship

**Files:**
- Create: `skills/orchestration/ship.md`
- Generated: `.claude/skills/sdcorejs-ship/SKILL.md`

- [ ] **Step 1: Confirm ship.md does not exist**

```bash
ls "c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent\skills\orchestration"
```

Expected: `auto-docs.md`, `auto-plans.md`, `branch-ready.md`, etc. — no `ship.md`.

- [ ] **Step 2: Write skills/orchestration/ship.md**

Full content:

```markdown
---
name: sdcorejs-ship
description: End-to-end ship orchestrator. Chains verify-before-done → branch-ready → [changelog if release mode] → commit → push → pr-create into a single entry point. Triggers: "ship", "ship branch này", "đẩy lên", "tạo PR", "release", "xong rồi ship đi", "ready to merge". Applies to angular-portal, nestjs, nextjs and the sdcorejs-agent repo. Bilingual (VI/EN).
allowed-tools: Bash, Read
---

# Ship — End-to-End Ship Orchestrator

## Purpose
`verify-before-done`, `branch-ready`, `commit`, and `pr-create` each exist as standalone
skills for independent use. For the common "I'm done, ship it" case this orchestrator
chains them so the user says one thing and the full gate sequence runs.

## When invoked
- "ship", "ship branch này", "ship đi", "đẩy lên"
- "tạo PR", "mở PR", "ready to merge", "xong rồi ship đi"
- "release", "tag and release"

Do NOT invoke if:
- Work is mid-feature (incomplete) — use sub-skills directly
- User wants commit-only without PR — invoke `sdcorejs-commit` directly
- User wants a review first — invoke `sdcorejs-review-code-<track>` first

## Workflow

### Step 0 — Pre-flight (parallel, read-only)

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
MAIN=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null \
  | sed 's|refs/remotes/origin/||' || echo main)
git log "$MAIN"..HEAD --oneline 2>/dev/null | wc -l
```

**Hard stops:**
- Branch is `main` / `master` / `release/*` →
  "Đang ở protected branch. Tạo feature branch trước rồi ship."
- Zero commits ahead of main →
  "Không có commit nào để ship."
- Uncommitted changes remain →
  "Còn thay đổi chưa commit. (a) commit vào branch trước khi ship, hay (b) stash?"

### Step 1 — Detect ship mode

Auto-detect from user phrasing; otherwise ask:
> "Ship mode: (a) Feature PR — mở PR, không tag; (b) Release — tạo CHANGELOG + tag?"

- User said "release" / "tag" / "version bump" → **Release mode**
- Otherwise → **Feature PR mode**

### Step 2 — Run `sdcorejs-verify-before-done`

Invoke `sdcorejs-verify-before-done`.

- 🟢 DONE → continue
- 🟡 criteria deferred by user → continue (deferred list noted in summary)
- 🔴 unresolved blockers → STOP until user resolves or says
  "ship với issues đã biết"

### Step 3 — Run `sdcorejs-branch-ready`

Invoke `sdcorejs-branch-ready`.

- 🟢 READY → continue
- 🟡 READY WITH WARNINGS (user acknowledged) → continue
- 🔴 BLOCKED → STOP until blockers resolved

### Step 4 — [Release mode only] Changelog

Invoke `sdcorejs-changelog`.

After generating the entry, ask:
> "CHANGELOG drafted. Semver bump: PATCH / MINOR / MAJOR — confirm trước khi ghi vào
> file không?"

Wait for confirmation before writing. If user declines → skip, note in summary.

### Step 5 — Commit (if tree is dirty)

```bash
git status --porcelain
```

If non-empty: invoke `sdcorejs-commit`.
If tree is already clean: skip silently.

### Step 6 — Push

```bash
git push -u origin HEAD
```

- If already tracking remote: `git push`
- NEVER force-push to a shared branch
- If rejected (non-fast-forward): "Remote có commits mới hơn. Rebase trước:
  `git pull --rebase` rồi chạy lại ship."

### Step 7 — PR

Invoke `sdcorejs-pr-create`.

### Step 8 — Summary

```
## Ship complete — `<branch>`

- verify-before-done : ✅ N criteria / ⚠️ N deferred
- branch-ready       : ✅ / ⚠️ N warnings acknowledged
- changelog          : ✅ vX.Y.Z / — (feature PR mode)
- commit             : ✅ <hash> / — (tree was clean)
- push               : ✅
- PR                 : <url>
```

## Rules

### MUST DO
- Run all gates in order — never skip `verify-before-done` or `branch-ready`
- Detect ship mode before step 4
- Hard-stop on protected branches and zero-commits-ahead
- Surface each gate's result to the user before proceeding
- Ask before writing to CHANGELOG.md

### MUST NOT
- Auto-bump `package.json` version — user confirms inside `sdcorejs-changelog`
- Create PR with uncommitted changes in the tree
- Skip changelog generation in release mode
- Force-push under any circumstances
- Invoke ship on `main` / `master` / `release/*`

## Anti-patterns
- "Tests were passing 10 minutes ago, skip verify" — always re-run at ship time; cheap
  to re-check, expensive to ship broken
- Running ship mid-feature because "it's mostly done" — finish the work first
- Opening the PR before branch-ready resolves all blockers

## Cross-references
- `sdcorejs-verify-before-done` — Step 2 (acceptance criteria gate)
- `sdcorejs-branch-ready` — Step 3 (hygiene gate)
- `sdcorejs-changelog` — Step 4 (release mode only)
- `sdcorejs-commit` — Step 5
- `sdcorejs-pr-create` — Step 7
```

- [ ] **Step 3: Sync and verify**

```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
cat ".claude/skills/sdcorejs-ship/SKILL.md" | head -5
```

Expected: frontmatter with `name: sdcorejs-ship`.

- [ ] **Step 4: Commit**

```bash
git add skills/orchestration/ship.md .claude/skills/sdcorejs-ship/SKILL.md
git commit -m "$(cat <<'EOF'
feat(orchestration): add sdcorejs-ship — end-to-end ship orchestrator

Chains verify-before-done → branch-ready → [changelog] → commit → push
→ pr-create. Detects feature-PR vs release mode automatically.
EOF
)"
```

---

## Task 3: Fix sdcorejs-repair-loop — source context

**Files:**
- Edit: `skills/orchestration/repair-loop.md`
- Generated: `.claude/skills/sdcorejs-repair-loop/SKILL.md`

The current skill is triggered from both `review-code` and `verify-before-done` but uses
the same re-verify step regardless of origin. This causes the loop to re-run the wrong
review tool when the source was acceptance-criteria failure vs code-quality findings.

Three targeted edits are needed:

- [ ] **Step 1: Read the current source file**

```bash
cat "c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent\skills\orchestration\repair-loop.md"
```

Confirm the file exists and the `## Inputs` section and `### 5. Re-run the original review` step are present.

- [ ] **Step 2: Update the description frontmatter**

Find the current `description:` line (line 3) and replace it with:

```
description: Use after `sdcorejs-review-code-<track>` (source: review-code) OR `sdcorejs-verify-before-done` (source: verify-before-done) produces findings. Caller MUST pass source context so the re-verify step runs the correct tool. First VERIFIES each finding is genuine, then fixes systematically, re-runs per-source verification, iterates until Critical + Important are resolved or deferred. Triggers: "fix các finding", "apply review findings", "sửa các lỗi review", "fix critical issues", or auto-invoked after 50-review-code or verify-before-done outputs findings. Applies to angular-portal, nestjs, nextjs.
```

- [ ] **Step 3: Add `source` to the Inputs section**

Find the `## Inputs` section. After the existing bullet list, append:

```markdown
- **source** (required): origin of the findings — determines which re-verify command runs
  | source value | Meaning | Re-verify command |
  |---|---|---|
  | `review-code` | Findings from `sdcorejs-review-code-<track>` | Re-invoke `sdcorejs-review-code-<track>` with same file scope |
  | `verify-before-done` | Failed acceptance criteria from `sdcorejs-verify-before-done` | Re-invoke `sdcorejs-verify-before-done` for the specific failed criteria |
  | `linter` | Findings from `npm run lint` / `tsc --noEmit` | `npm run lint && tsc --noEmit` (or `npm run build`) |
  | `manual` | Human-reported findings | No automated re-verify; report fix status to user |
```

- [ ] **Step 4: Replace step 5 with source-aware re-verify**

Find `### 5. Re-run the original review` and replace the entire step with:

```markdown
### 5. Re-run per source

After tier 1 + tier 2 fixes are applied, re-verify using the appropriate tool for the
invocation source:

| source | Re-verify action |
|---|---|
| `review-code` | Re-invoke `sdcorejs-review-code-<track>` with the same file scope as the original review |
| `verify-before-done` | Re-invoke `sdcorejs-verify-before-done` targeting only the criteria that were previously failing (not the full suite unless new code was added) |
| `linter` | `npm run lint && tsc --noEmit` (or the project's typecheck equivalent) |
| `manual` | No automated re-verify. Report: "Applied N fixes — please verify manually." and pause for the user |

Look for:
- **Resolved findings** — same file:line no longer flagged → tick off
- **New findings introduced by the fix** — flag as regressions; do NOT tick off
- **Same finding still present** — fix didn't take; investigate (cached test, wrong file,
  syntax error swallowed by the build)
```

- [ ] **Step 5: Update the commit prep step to be source-aware**

Find `### 8. Final commit prep` and replace the suggested message shape block with:

```markdown
Commit message shape by source:

```
# source = review-code
fix(<scope>): apply N review findings (Critical: A, Important: B, Minor: C)

# source = verify-before-done
fix(<scope>): resolve N failed acceptance criteria

# source = linter
fix(<scope>): resolve N lint / typecheck errors

# source = manual
fix(<scope>): apply N manually-reported fixes
```
```

- [ ] **Step 6: Sync and verify**

```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
grep -A 6 "source.*required" ".claude/skills/sdcorejs-repair-loop/SKILL.md"
```

Expected: the source table appears in the mirror.

- [ ] **Step 7: Commit**

```bash
git add skills/orchestration/repair-loop.md .claude/skills/sdcorejs-repair-loop/SKILL.md
git commit -m "$(cat <<'EOF'
fix(orchestration): repair-loop — add source context to re-verify step

Callers now pass source (review-code | verify-before-done | linter |
manual) so the loop re-runs the correct verification tool instead of
always re-invoking 50-review-code regardless of origin.
EOF
)"
```

---

## Task 4: Fix sdcorejs-changelog — wire into ship chain

**Files:**
- Edit: `skills/shared/conventions/changelog.md`
- Generated: `.claude/skills/sdcorejs-changelog/SKILL.md`

Three small additions: description mentions `sdcorejs-ship`; "When invoked" gets a new
bullet; Step 7's "suggest next step" is updated.

- [ ] **Step 1: Read the current source file**

```bash
cat "c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent\skills\shared\conventions\changelog.md"
```

Confirm the `## When invoked` section and `### 7. Report back to user` step exist.

- [ ] **Step 2: Update description frontmatter**

Find the existing `description:` line and append `, or auto-invoked by sdcorejs-ship on release path` before the period at the end of the "When invoked" trigger list. The updated description line should end:

```
...or is preparing a release, or auto-invoked by sdcorejs-ship on release path. ...
```

Full replacement for the description value:

```
description: Use when the user asks to generate a CHANGELOG entry, says "viết changelog", "tạo changelog", "update CHANGELOG", "what changed since vX.Y.Z", is preparing a release, or is auto-invoked by sdcorejs-ship on release path. Reads commit history since the last tag, groups commits by Conventional Commits type, suggests a semver bump, and writes a Keep a Changelog-formatted entry. Applies to angular-portal, nestjs, nextjs and the sdcorejs-agent repo.
```

- [ ] **Step 3: Add sdcorejs-ship to "When invoked"**

Find `## When invoked` section. After the last existing bullet (before the `Do NOT invoke` block), add:

```markdown
- Auto-invoked by `sdcorejs-ship` when release mode is detected (Step 4 of ship chain)
```

- [ ] **Step 4: Update Step 7 "suggest next step"**

Find `### 7. Report back to user`. In the "Suggest next step" bullet at the bottom of that section, replace:

```
- Suggest next step: tag + push + `sdcorejs-pr-create` if applicable
```

with:

```
- Suggest next step: if invoked standalone → tag + push + `sdcorejs-pr-create`. If invoked
  via `sdcorejs-ship` → ship orchestrator handles push + PR automatically; no separate
  action needed from the user.
```

- [ ] **Step 5: Sync and verify**

```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
grep "sdcorejs-ship" ".claude/skills/sdcorejs-changelog/SKILL.md"
```

Expected: at least 2 lines referencing `sdcorejs-ship`.

- [ ] **Step 6: Commit**

```bash
git add skills/shared/conventions/changelog.md .claude/skills/sdcorejs-changelog/SKILL.md
git commit -m "$(cat <<'EOF'
fix(shared): changelog — wire into sdcorejs-ship release path

Add auto-invoked-by trigger and update Step 7 next-step guidance so
the skill knows it is called from the ship orchestrator context.
EOF
)"
```

---

## Task 5: Add auto-trigger review hints to sdcorejs-branch-ready

**Files:**
- Edit: `skills/orchestration/branch-ready.md`
- Generated: `.claude/skills/sdcorejs-branch-ready/SKILL.md`

Add a new Check #10 (⚪ Info severity) that analyses the diff and suggests which
specialized review skill to run before merging. All suggestions are advisory only.

- [ ] **Step 1: Read the current source file**

```bash
cat "c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent\skills\orchestration\branch-ready.md"
```

Confirm the check list ends at Check #9 (`.sdcorejs/` artifacts). Locate the exact text of `### 9.` to find the insertion point.

- [ ] **Step 2: Append Check 10 after the existing Check 9 block**

After the complete `### 9. .sdcorejs/ artifacts present 🟡` section (and before the `## Output format` section), insert:

```markdown
### 10. Specialized review hints ⚪

```bash
CHANGED=$(
  { git diff --cached --name-only 2>/dev/null; git diff --name-only 2>/dev/null; } \
  | sort -u
)
CHANGED_COUNT=$(echo "$CHANGED" | grep -c . 2>/dev/null || echo 0)
MODULE_COUNT=$(echo "$CHANGED" \
  | grep -oE 'src/libs/[^/]+/' | sort -u | wc -l | tr -d ' ')
SECURITY_FILES=$(echo "$CHANGED" \
  | grep -icE '(auth|guard|permission|token|role|jwt|encrypt|secret)' || echo 0)
COMPONENT_COUNT=$(echo "$CHANGED" \
  | grep -cE '\.(component|template)\.(ts|html)$' || echo 0)
NEW_SCREENS=$(
  { git diff --cached --name-only --diff-filter=A 2>/dev/null; \
    git diff --name-only --diff-filter=A 2>/dev/null; } \
  | grep -ciE '(screen|page|list|detail|create|update)\.component' || echo 0
)
TRACK=$(
  echo "$CHANGED" | grep -q 'src/libs/' && echo angular \
  || echo "$CHANGED" | grep -q 'apps/' && echo nestjs \
  || echo other
)
```

Emit suggestions based on thresholds (all ⚪ Info — never block):

| Condition | Suggestion |
|---|---|
| `$CHANGED_COUNT -gt 8` AND `$MODULE_COUNT -gt 2` | ⚪ Nhiều modules bị ảnh hưởng — consider `sdcorejs-review-architecture` |
| `$SECURITY_FILES -gt 0` | ⚪ Auth/security files trong diff — consider `sdcorejs-review-security-shared` (+ `sdcorejs-review-security-nestjs` for NestJS) |
| `$TRACK = angular` AND `$COMPONENT_COUNT -gt 3` | ⚪ Nhiều Angular components — consider `sdcorejs-review-performance-angular-portal` |
| `$TRACK = angular` AND `$NEW_SCREENS -gt 0` | ⚪ Screens mới — consider `sdcorejs-review-accessibility-angular-portal` |

If no condition matches: omit this section from the output entirely (don't print "no
suggestions").

Example output when conditions match:
```
### ⚪ Info — Review suggestions
- [architecture] 12 files changed across 4 modules →
  consider `sdcorejs-review-architecture` before merging
- [accessibility] 2 new screen components →
  consider `sdcorejs-review-accessibility-angular-portal`
```
```

- [ ] **Step 3: Sync and verify**

```bash
cd c:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
bash .claude/sync-skills.sh
grep -A 5 "Specialized review hints" ".claude/skills/sdcorejs-branch-ready/SKILL.md"
```

Expected: the Check 10 heading and table appear in the mirror.

- [ ] **Step 4: Commit**

```bash
git add skills/orchestration/branch-ready.md .claude/skills/sdcorejs-branch-ready/SKILL.md
git commit -m "$(cat <<'EOF'
feat(orchestration): branch-ready — auto-suggest specialized reviews

Check #10 (Info only) analyses diff at ship time and suggests
architecture / security / performance / accessibility reviews based
on file-count and path heuristics. Never blocks; advisory only.
EOF
)"
```

---

## Self-review

### Spec coverage
- Task 1: sdcorejs-tdd → ✅ per-track boilerplate, RED/GREEN/REFACTOR, anti-patterns
- Task 2: sdcorejs-ship → ✅ full chain, release vs feature-PR mode, pre-flight gates
- Task 3: repair-loop → ✅ source context added to inputs + step 5 + step 8
- Task 4: changelog → ✅ description, When-invoked, Step 7 updated
- Task 5: branch-ready → ✅ Check 10 with heuristics and example output

### Placeholder scan
None — all steps contain exact file content, commands, and expected output.

### Type / name consistency
- All skill `name:` frontmatter values match the `.claude/skills/<name>/` folder names
- Cross-references in new skills match existing skill names
  (`sdcorejs-verify-before-done`, `sdcorejs-branch-ready`, `sdcorejs-commit`, `sdcorejs-pr-create`,
  `sdcorejs-changelog`, `sdcorejs-testing-philosophy`, `sdcorejs-testing-unit-*`)
- `sdcorejs-ship` cross-reference list matches the exact names in all referenced skills
