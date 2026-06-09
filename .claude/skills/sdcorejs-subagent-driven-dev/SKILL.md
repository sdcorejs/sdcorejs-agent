---
name: sdcorejs-subagent-driven-dev
description: Use when `write-code` (or its NestJS/NextJS equivalents) is about to execute a feature with 3+ independent sub-tasks — multiple entities under one module, batch screen generation, multi-stack work, large reference-doc batches. Different from `sdcorejs-parallel-dispatch` which decides WHETHER to parallelize; this skill governs HOW to execute the delegation — decompose, brief, dispatch, per-unit two-stage review (spec-compliance then code-quality), merge results, surface partial failures. Applies to angular, nestjs, nextjs. Bilingual (VI/EN). Two modes: A = independent same-kind units (existing); B = role-split feature loop (backend‖frontend‖QC on one feature, contract-freeze barrier + acceptance loop). parallel-dispatch routes between them.
allowed-tools: Read, Agent, Bash
---

# Subagent-Driven Development — Delegate Execution, Not Just Decision

## Purpose
`sdcorejs-parallel-dispatch` answers "should I split?". This skill answers "I'm splitting — now what?". It's the execution discipline that prevents parallel work from devolving into N divergent half-implementations, duplicate scaffolds, or merge nightmares.

## When invoked
- After `06-review-plan` approved a plan with 3+ independent units (multiple entities, multiple modules, multiple stacks)
- During `write-code` when the orchestrator detects the dispatch list is parallelizable
- Reference doc batches (e.g. "write docs for these 12 components")
- User says "delegate", "subagent", "fan out", "split up", "làm song song"

Do NOT invoke for:
- Single unit of work (no delegation)
- Sequential pipeline (write-spec → review → plan) — those have approval gates
- Refactor that touches shared files (race condition)

If `sdcorejs-parallel-dispatch`'s decision tree says SEQUENTIAL, stop. Don't invoke this.

## Mode selector (read FIRST)

| You have… | Mode |
|---|---|
| N independent units of the SAME kind (entities, screens, doc batches), no shared state | **Mode A — Independent units** (the existing workflow below) |
| ONE feature that spans backend + frontend (and needs QC) | **Mode B — Role-split feature loop** (its own section) |

`parallel-dispatch` routes here: `PARALLEL-CANDIDATE` → Mode A; `ROLE-SPLIT` → Mode B. The two
modes use OPPOSITE coupling models — do not mix them. Mode A units are independent by
construction; Mode B roles are deliberately coupled through a frozen contract.

## Mode A — Independent units (workflow)

### 1. Decompose into units (must come from the approved plan)
Each unit MUST satisfy:
- **Independent file targets** — no two units write the same file
- **Self-contained context** — unit X doesn't need unit Y's output to start
- **Verifiable in isolation** — unit X has its own test/check command
- **Bounded scope** — fits in one subagent's response budget (rough rule: ≤8 file creates per unit)

If a candidate "unit" needs another unit's output → it's sequential, not parallel. Demote it.

### 2. Write per-unit briefings (self-contained, no shared context)

Each subagent starts with ZERO conversation history. Brief explicitly:

```
TASK: <verb + concrete target + scope, one sentence>
       e.g. "Generate CRUD for entity `Product` under module `catalog`"

CONTEXT (everything the subagent needs):
- Stack / track / lib path (e.g. `src/libs/catalog/features/product/`)
- Relevant skill body to follow (e.g. "Follow the `angular-write-code` init-entity pack at `_refs/angular/write-code/init-entity.md` exactly")
- Field schema (paste it; don't reference "the spec")
- Conventions already decided (mock-first vs api, layout pattern, permissions)
- Surrounding files that already exist (so they don't duplicate)
- What was already done by other subagents this session (so they don't redo)

DELIVERABLE (return shape):
- Files to create (paths) + 1-line intent each
- Verification command to run before claiming success (e.g.
  `npm run test -- --include=src/libs/catalog/features/product/**/*.spec.ts`)
- What NOT to do (out of scope)
- Bilingual: VI labels with full diacritics; permission codes English

REPORT BACK (single message):
- Files changed (CREATE/EDIT, with paths) + `git diff --stat` (or commit SHA) so the parent can verify independently
- Decisions taken inside the unit
- Verification result — paste the ACTUAL command + its output (test counts, exit code), NOT a "should pass" summary
- Blockers, if any (so parent can intervene)
- Any new info worth surfacing to the user
```

Anti-briefing-patterns:
- "Follow our conventions" — point to the file
- "Use parallel subagents to do X" — no recursion
- "Build the rest of the feature" — vague scope, will overproduce
- Reusing the same brief for N units with placeholders → each subagent wastes time finding its slice

### 3. Dispatch — single message, multiple Agent calls

Use the parent agent's tool to fan out in ONE message (so they run truly concurrently). Cap at 5 concurrent unless explicitly batched.

```
[Single message with N Agent calls in parallel:]
- Agent(prompt=brief_1, description="Gen product CRUD")
- Agent(prompt=brief_2, description="Gen category CRUD")
- Agent(prompt=brief_3, description="Gen list filter shared")
```

If >5 units: split into waves. Wave 2 starts only after wave 1 returns and is sanity-checked.

### 4. Watch for partial failures
Each subagent returns one of:
- ✅ Done — verification passed
- ⚠️ Done with warnings — files written but test failed or skipped
- ❌ Blocked — explained reason, no destructive partial output
- 🟡 Partial — wrote some files, hit an obstacle mid-way

Parent agent MUST surface ⚠️/❌/🟡 honestly. Do NOT silently re-run a failed subagent or swallow its error.

### 5. Per-unit two-stage review (gate each returned unit BEFORE merge)

A unit reporting "✅ done" is a claim, not proof. Before accepting any unit, run TWO review stages against its ACTUAL output — read the files / `git diff`, never trust the success word. Borrowed from `superpowers:subagent-driven-development`: spec-compliance first, code-quality second.

Run this per unit, as each returns — do NOT barrier-wait for all units. Unit A can be in Stage B while unit B is still implementing.

**Stage A — Spec compliance** (does it match the brief — no more, no less?)
- Re-read the unit's briefing (TASK + DELIVERABLE + out-of-scope).
- Read the reported files (`git diff --stat`, then open the key ones). Confirm the verification output the subagent pasted is real (right command, exit 0, expected counts).
- Check: every briefed deliverable present? Nothing extra invented (unrequested flags / files / endpoints)? Scope boundaries respected?
- If gaps → re-dispatch the SAME unit's implementer with the specific gap list. Do NOT hand-fix (context pollution). Re-review after.

**Stage B — Code quality** (only AFTER Stage A is ✅)
- Invoke `sdcorejs-review` scoped to the unit's files (auto-detects track + checks conventions).
- Feed findings through `orchestration/repair-loop` (source: `review-code`) until Critical + Important are resolved or user-deferred.
- Never start Stage B before Stage A passes — polishing style on code that solves the wrong problem is wasted work.

A unit is marked ✅ and eligible for merge only after BOTH stages pass. A unit whose fix loop is still open stays ⚠️ — it does not merge.

### 6. Merge / synthesize

Before reporting to user:
- **Conflict scan** — did any two units edit the same file by accident? (Should be impossible by step 1, but verify.)
- **Convention drift** — did one subagent invent a new pattern? Cite the skill file they should have followed.
- **Redundant code** — two units writing the same helper? Promote to `libs/shared/`.
- **Cross-unit imports** — did unit A end up importing from unit B? That breaks the "independent" claim; flag.

Produce ONE consolidated summary, not N reports concatenated.

### 7. Run global verification
After all units return AND each has passed its per-unit review, run the cross-cutting verifications that no single subagent could:
- `npm run build` — does the whole project still compile?
- `npm run lint` — picks up convention drift across files
- `npm run test -- --watch=false` — full suite, not just per-unit
- Smoke run dev server (Angular: load home; NestJS: hit /health; NextJS: load /)

If global verification fails after per-unit verification passed, the failure is at the *seams* between units — investigate which units touched files that now collide.

### 8. Hand off control
Parent agent reports to user:

```markdown
## Đã thực hiện N units song song

| Unit | Status | Files | Verification |
|---|---|---|---|
| product CRUD | ✅ | 8 created | tests 24/24 |
| category CRUD | ⚠️ | 8 created | 22/24 (2 skipped, mock data) |
| shared filter | ❌ | 0 | blocked: cần API contract |

### Global checks
- build: ✅
- lint: ✅
- test full: 46/48 (2 skipped per category unit)

### Cần bạn quyết
- category unit's 2 skipped tests — bổ sung mock hay chờ contract?
- shared filter blocked — đợi API hay làm mock variant trước?
```

Wait for direction. Don't auto-retry blocked units.

## Examples

### ✅ Good — entity batch
Plan: "Generate Product, Category, Supplier entities under module `catalog`, all use same UnifiedCompact layout."

Decomposition:
- Unit A: Product (model + service + 4 screens + tests)
- Unit B: Category (same shape)
- Unit C: Supplier (same shape)
- Shared first (sequential): catalog module + shared base service

Dispatch order: Shared (1 subagent, sequential) → A+B+C (3 subagents, parallel).

### ✅ Good — reference doc batch
"Write reference docs for these 12 Core UI components."

Decomposition: 12 independent file writes, same template. Group into 3 waves of 4 to stay under 5-concurrent.

### ❌ Bad — refactor across shared file
"Migrate all 9 modules to the new routes.ts pattern."

Each module touches `app.routes.ts` to register itself. Parallel dispatch → 9 concurrent edits to the same file → merge conflict. Either: (a) one subagent updates `app.routes.ts` after, or (b) the whole task is sequential.

### ❌ Bad — implicit ordering
"Generate Product, then base Category fields on Product's pattern."

Category needs Product to exist first. Sequential. Don't parallelize.

## Rules

### MUST DO
- Decompose from the APPROVED plan, not invented mid-flight
- Verify each unit has independent file targets BEFORE dispatching
- Self-contained briefing per subagent (no shared context dependency)
- Single message with N Agent calls in parallel
- Cap concurrent at 5; split into waves otherwise
- Gate each returned unit through spec-compliance review THEN code-quality review BEFORE merging it
- Verify a unit from its actual file diff / verification output — never trust the subagent's "done" word
- Re-dispatch the implementer to fix review findings; don't hand-fix (avoids context pollution)
- Synthesize before reporting to user
- Surface ⚠️ / ❌ / 🟡 honestly
- Run global build/lint/test after all units return

### MUST NOT
- Tell a subagent to spawn its own subagents (recursion)
- Reuse the same brief for N units with no per-unit context
- Silently retry a failed subagent
- Hide partial failures under successful ones
- Accept a unit as done on its success report without reading the diff
- Start a unit's code-quality review (Stage B) before its spec-compliance (Stage A) passes
- Merge a unit whose review fix-loop is still open
- Edit the same file from two units (race condition)
- Dispatch >5 concurrent without a checkpoint
- Skip global verification because per-unit verifications passed

## Anti-patterns
- **Lost context**: dispatching with "follow the conventions we discussed"
- **Convention drift**: 3 subagents independently invent 3 different validator patterns
- **The 12-way fan-out**: user gets 12 raw reports nobody can review
- **Race-to-conflict**: two subagents both editing `package.json` or `app.routes.ts`
- **Heroic merge**: parent agent tries to reconcile N divergent implementations after the fact (cheaper to re-dispatch with tighter scope)
- **Speculative parallelism**: dispatching 2 subagents to try competing approaches; usually one careful brainstorm is cheaper
- **Trusting the success word**: subagent reports "✅ 8/8 tests pass" → parent merges without reading the diff. The subagent may have stubbed, skipped, or weakened the tests. Read the diff + verification output before accepting the unit.

## Mode B — Role-split feature loop

### B.0 When to use
One feature crossing backend + frontend, after `06-review-plan` approved the plan.
Not for single-track work (use the track's write-code directly) and not for N same-kind
units (Mode A).

**Inputs (from the caller).** The invoking orchestrator passes `profile` (`simple`|`enterprise`) and `topology` (single deploy-root | mono-repo | two-repo) EXPLICITLY. Read `.sdcorejs/summary.md` only as a fallback when present; on a first build it does not exist yet (auto-summary writes it at the end of init-project), so the caller-passed values are authoritative. `solution-builder` (non-tech) always passes `profile=simple` + `topology=single deploy-root`.

### B.1 Phase 0 — Contract freeze (sequential barrier)
Derive + write the shared contract from the approved plan + spec, SHAPED BY THE PROFILE
(`simple|enterprise`, from the caller — see B.0):
- DTO / types, endpoint list (verb + path + req/res), permission codes `<module>_<entity>:<action>`.
- Location by topology (from the caller — see B.0): **single deploy-root** (non-tech default) → BE authors the DTOs in `backend/src/modules/<module>/dto/*.dto.ts`; the FE **mirrors** them as matching TS interfaces under `frontend/src/libs/<module>/models/` (the frozen contract doc lists the shapes both sides implement). **two-repo** → a shared types package the FE consumes. **mono-repo** → `base/shared/<module>/*.model.ts` (enterprise) or `src/modules/<module>/dto` mirrored to the FE (simple).
Freeze it: role agents must NOT mutate the contract mid-iteration. Embed it VERBATIM in all
three briefs.

### B.2 Phase 1 — Parallel role fan-out (ONE message, 3 Agent calls)
Three self-contained briefs (use the parallel-dispatch briefing template), file-disjoint. Paths below are **topology-relative** (see B.1): for the single-deploy-root default they nest under `backend/` and `frontend/` respectively (e.g. `backend/src/modules/<module>/**`, `frontend/src/libs/<module>/**`).
- BE  → `nestjs-write-code` packs at the chosen profile; writes `src/modules/<module>/**`; owns BE unit tests.
- FE  → `angular-write-code` packs; writes `src/libs/<module>/**`; consumes the contract; owns FE component tests.
- QC  → from the frozen contract + spec acceptance criteria: writes the acceptance checklist +
        RED contract/E2E tests + the verification harness; touches ONLY `*.e2e-spec.ts` / `*.spec.ts` / harness.
Isolation: two-repo → separate trees, no worktree. mono-repo → worktrees per role OR strict disjoint
paths; `base/shared` touched in Phase 0 only.

### B.3 Phase 2 — Fan-in + per-role review
As each role returns, verify from the ACTUAL diff (never the "done" word). Reuse Mode A's
Stage A (spec-compliance) → Stage B (sdcorejs-review → repair-loop) PER ROLE. Conflict scan:
no role touched another's files; nobody mutated the frozen contract.

### B.4 Phase 3 — Integration verify = the loop gate
Invoke `verify-before-done` against the spec Acceptance Criteria, running QC's harness +
build/lint/test + smoke (BE /health + endpoint, FE route, e2e across both). Verdict:
- all ✅ (or user-deferred) → DONE → exit to the tail chain.
- Critical/Important remain → route each to its OWNING role (contract mismatch → BE/contract;
  screen bug → FE; missing assertion → QC) → re-dispatch ONLY that role with the finding list
  (no hand-fix → avoids context pollution) → next iteration.
- Contract drift (BE had to change a shape) → reconcile the frozen contract HERE, then re-brief
  FE + QC with the updated slice.

### B.5 Loop control (reuse repair-loop discipline)
Hard cap 3 iterations. No-progress (zero new criteria resolved) for 2 consecutive rounds →
ESCALATE to the user with the convergence-failure framing. Each iteration re-runs only the
failed slices, never all three.

### B.6 Tail chain
On DONE: comment-code (ASK) → branch-ready → auto-docs → write-user-guide (Mode 1: per-module guide) → auto-task-tracker → memories.
(`verify-before-done` already ran as the gate.)

### B.7 Dry-run walkthrough (contract-drift example)
Feature "approve invoice" (simple profile, two-repo):
1. Phase 0 freezes: `InvoiceDto`, `PUT /billing/invoice/:id/approve`, code `billing_invoice:approve`.
2. Phase 1: BE writes the endpoint+service; FE writes the approve button+call; QC writes a RED
   supertest hitting the endpoint + an e2e clicking the button.
3. Phase 3 iter 1: verify-before-done fails — BE returned `{ approvedAt }` but the contract said
   `{ approvedDate }`. Routed to "contract": reconcile contract → `approvedDate`; re-brief FE+QC
   with the corrected field. BE already matched, FE adjusts its model, QC's assertion updates.
4. Phase 3 iter 2: all criteria ✅ → DONE.

## Cross-references
- `orchestration/using-worktrees.md` — give each dispatched unit an isolated workspace so parallel agents don't trample each other — invoke BEFORE fan-out
- `orchestration/parallel-dispatch.md` — decision gate (should I split?) — invoke this BEFORE this skill
- `sdcorejs-review` — Stage B per-unit code-quality review (Step 5)
- `orchestration/repair-loop.md` — closes the fix loop on per-unit review findings (source: `review-code`)
- `orchestration/verify-before-done.md` — final verification gate after merging units
- `write-code.md` (angular) — orchestrator that triggers this skill when the dispatch table has 3+ rows

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
