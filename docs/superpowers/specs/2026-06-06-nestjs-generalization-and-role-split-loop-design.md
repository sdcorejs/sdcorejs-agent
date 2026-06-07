# Design — NestJS generalization (profile tier) + role-split feature loop

**Date:** 2026-06-06
**Status:** Delivered — Phases 1–3 shipped on `feat/non-tech-solution-builder` (doc-drift + profile tier + role-split loop), plus post-delivery hardening G1–G3 (below). Live `docker compose up` validation of generated `simple`/`enterprise` output remains a deferred target-project E2E.

### Post-delivery hardening (from a `solution-builder` dry-run, "quản lý học sinh")

A dogfood dry-run of `sdcorejs-solution-builder` exercised the new simple-profile + Mode B path end-to-end (contract-freeze → BE‖FE‖QC → acceptance loop converged in 2 iters) and surfaced 3 integration seams the per-task reviews missed (seams between skills, not within a file). All fixed:

- **G1 (🔴) — topology undefined on the non-tech door.** Mode B B.1 keyed the contract location off a topology "asked at clarify", but `solution-builder`'s clarify never asks architecture (persona rule 7). Fix: `solution-builder` now forces a **single deploy-root** topology and passes `topology` + `profile=simple` EXPLICITLY into Mode B; B.0 documents caller-passed inputs; B.1 covers the single-deploy-root case (FE mirrors BE DTOs). (commit `1c4b15a`)
- **G2 (🟡) — profile implicit on first build.** `nestjs-write-code` reads `profile` from `.sdcorejs/summary.md`, which doesn't exist until the END of init-project. Fix: the orchestrator passes `profile` explicitly into the Mode B contract-freeze/BE brief; summary.md is a fallback only. (commit `1c4b15a`)
- **G3 (🟡) — simple-profile permission codes ≠ Keycloak realm roles.** The seeded demo realm has only `user`/`admin`, but simple `@HasPermission('<module>_<entity>:<action>')` checks membership against the user's realm roles → every write 403s. Fix: `sdcorejs-auth` Step 1.5 + `auth-keycloak.md` §7 — for the simple profile, seed the app's permission codes AS realm roles (assigned to `demo`) before first boot; enterprise keeps the page-permission matrix. (commit `09c4f86`)
**Author:** brainstorming session (Opus 4.8).

## TL;DR

Two coupled improvements to the SDCoreJS agent, approved as one effort ("fold in everything"):

1. **Backend generalization** — the `nestjs-write-code` packs over-fit the `@enterprise-platform` reference app: they bake its multi-tenant + department-scoped + page-permission-matrix + `base/shared` monorepo + internal-secret assumptions into *every* generated app. Fix by introducing a **profile tier (`simple` | `enterprise`)** chosen at clarify; the packs branch on it. Plus repair two doc-drift artifacts (`review-code.md`, `architecture-principles.md`).
2. **Role-split feature loop** — a new **Mode B** in `sdcorejs-subagent-driven-dev`: when one feature spans backend + frontend, freeze the shared contract, then run **backend ‖ frontend ‖ QC** agents in parallel and loop against acceptance criteria until done.

They compose: the loop's contract-freeze step emits the contract *shaped by the profile* (a `simple` feature has no tenancy columns / flat permissions).

---

## Problem & motivation

### P1 — backend over-fit

The four packs under `_refs/nestjs/write-code/` are grounded `*Ground: ref app …*` on `@enterprise-platform` throughout. Grounding on a real repo is good; the problem is that enterprise-platform-**specific** choices became the **default** generated output instead of being gated behind "only if your app needs this". The neutral core is `@sdcorejs/nestjs` (see `_refs/nestjs/core-catalog.md`); anything baked into every scaffold but absent from the core catalog is over-fit.

Findings (severity from the review):

| # | Sev | Leak | Where |
|---|---|---|---|
| 1 | 🔴 | 2-level `tenantCode`+`departmentCode` `@Scoped` columns + `@Index`/`@Unique(['departmentCode','code'])` on **every** entity | `init-entity` Step 1 |
| 2 | 🔴 | `MASTER` / `TENANT_ADMIN` scope model in the static facade | `init-project` Step 6 (`SdContext.isMaster`/`isTenantAdmin`) |
| 3 | 🔴 | Page-permission matrix `Record<string,Record<string,boolean>>` (verbatim copy of enterprise-platform `IPagePermissionService`) | `init-project` `AppPermissionStrategy.load()` |
| 4 | 🟡 | `base/shared` + `@shared` monorepo layout forced on every backend | `init-project` Steps 2/7, every DTO import |
| 5 | 🟡 | `modifiedAt` vs `updatedAt` contradiction (local base vs lib `WithAudit` vs `Dto` base) | `init-entity` Step 1 vs `init-project` Steps 6/7 |
| 6 | 🟡 | Custom `AdminAuthGuard` re-implements core `AuthGuard` + "admin" naming everywhere | `init-project` Step 6 |
| 7 | 🟡 | Internal-secret service-to-service module shipped in every scaffold | `init-project` Step 6 |
| 8 | 🟡 | JWT claims `tenant_code`/`department_code`/`scope` + `x-tenant-code`/`x-department-code` headers | `init-project` Steps 5/7 |
| 9 | 🔵 | `review-code.md` still on the dead `be-masterdata` baseline (`base/core-be/`, `bilingualMsg`); probes grep patterns the packs don't generate → false findings | `_refs/nestjs/review-code.md` |
| 10 | 🔵 | `architecture-principles.md` drift: §2 `updatedBy` (lib=`modifiedBy`), §4 Zod in `libs/shared/` (packs use `src/modules/<m>/schemas/`), §13 `{data,error}` envelope (core=`ApiResponse.ok`) | `_refs/nestjs/architecture-principles.md` |

Root cause: **no complexity tier.** One shape exists — enterprise-platform's. The escape hatches are prose ("for a single-tenant app return `{}`"); the templates emit the enterprise shape regardless. A non-tech "tool to manage my warehouse" gets 2-level tenancy, `MASTER`/`TENANT_ADMIN`, internal-secret, and a `base/shared` monorepo it never needs.

### P2 — no fast full-stack build path

`solution-builder` runs backend (step 4) then frontend (step 5) **sequentially**, with no QC role and no iterate-to-done loop. `subagent-driven-dev` parallelizes only **independent same-kind units** (entity A ‖ B ‖ C) and explicitly forces BE↔FE and shared-file work to be sequential. There is no orchestration for "build one feature across BE+FE+QC concurrently and loop until it meets the spec."

---

## Decisions locked (brainstorm)

| # | Decision | Choice |
|---|---|---|
| D1 | BE↔FE contract coupling | **Contract-first barrier** — freeze the shared contract, then fan out against it; re-sync only between loop iterations |
| D2 | What QC does during the build | **Hybrid** — author acceptance checklist + RED contract/E2E tests during build; run the harness + verdict after fan-in |
| D3 | Loop "done" gate + termination | **Acceptance-criteria gate + capped iterations** — `verify-before-done` is the gate; cap 3 / no-progress ×2 → escalate |
| D4 | Repo topology | **Decided per project at clarify** — skill stays topology-agnostic, adapts contract location + isolation |
| D5 | Placement | **Extend `sdcorejs-subagent-driven-dev`** with a role-split mode (no new skill); `parallel-dispatch` routes to it |
| D6 | Scope | **Fold in everything** — profile tier (items 1–8) + doc-drift (9–10) + role-split loop |

---

## Workstream A — Backend profile tier

### A.1 The profile

Introduce a project-level **`profile`** with two values, chosen once at clarify and recorded in the target's **`.sdcorejs/summary.md`** (the canonical project brief owned by `sdcorejs-auto-summary`, which the `nestjs-write-code` pre-flight already reads — so the packs pick it up with no new storage mechanism):

| Aspect | `simple` (new default for non-tech) | `enterprise` (current behavior) |
|---|---|---|
| Base entity | lib `WithAudit(BaseEntity)` directly (`createdAt`/`updatedAt`/`deletedAt` + `createdBy`/`modifiedBy`) | local `src/common/base-entity.ts` (legacy-schema columns) |
| Tenancy | none — no `@Scoped` columns, tenancy strategy returns `{}` | `tenantCode` + `departmentCode` `@Scoped`, `@Index`/`@Unique(['departmentCode','code'])` |
| Permission model | flat codes from Keycloak realm roles (or a simple role→codes map); `IPermissionStrategy.load()` returns `string[]` directly | page-permission matrix `Record<string,Record<string,boolean>>` flattened to codes |
| Scope flags | none (`isMaster`/`isTenantAdmin` omitted) | `MASTER`/`TENANT_ADMIN` retained |
| DTO location | `src/modules/<module>/dto/` (or co-located); no forced `base/shared` | `base/shared/<module>` (`@shared`) monorepo kernel |
| Auth guard | core `AuthGuard` directly | custom `AdminAuthGuard` (per-request permission load) |
| Internal-secret module | omitted | shipped |
| JWT claims | `sub` + realm roles only; no `tenant_code`/`department_code` | full enterprise claim mapping |

`enterprise` must remain **byte-equivalent** to today's output (no regression for projects that need it). `simple` is the new path that resolves items 1–8.

### A.2 Pack changes

Each of `init-project`, `init-module`, `init-entity`, `actions` gains a **profile branch** at the top ("if `simple` … / if `enterprise` …") with the templates split accordingly. The single-source-of-truth rule stays: `core-catalog.md` documents only the neutral core; the packs document which profile emits which template. Fix item 5's contradiction by deriving the audit-column names from the profile (no more "extend LOCAL base, NOT lib base" blanket instruction).

### A.3 Clarify wiring

`sdcorejs-clarify-requirements` (nestjs) + `_refs/sdlc/nestjs.md` add a blocking question: **profile** (with `simple` as the non-tech default, `enterprise` offered to technical users / when multi-tenancy is stated). `solution-builder`'s non-tech clarify defaults to `simple` silently (no architecture question to the user — consistent with persona rule 7) but still derives + confirms the data model in plain terms.

### A.4 Doc-drift fixes (items 9–10, independent quick wins)

- `_refs/nestjs/review-code.md` — reconcile to `@sdcorejs/nestjs`: drop `be-masterdata`/`base/core-be/`/`bilingualMsg`; probes check what the packs actually generate (`badRequest(code)`, i18n catalog, `ApiResponse.ok`, `base/shared` *only under `enterprise`*).
- `_refs/nestjs/architecture-principles.md` — fix §2 (`modifiedBy`), §4 (schemas under `src/modules/<m>/schemas/`, with the `enterprise` `@shared` note), §13 (`ApiResponse` envelope, not `{data,error}`).

---

## Workstream B — Role-split feature loop (`subagent-driven-dev` Mode B)

### B.0 Placement & mode selector

`skills/orchestration/subagent-driven-dev.md` gets an explicit selector at the top, with the two flows in walled-off sections:

- **Mode A — independent same-kind units** (existing, unchanged).
- **Mode B — role-split feature loop** (new).

`skills/orchestration/parallel-dispatch.md` decision gate gains a branch: *N same-kind independent units* → `PARALLEL-CANDIDATE` → Mode A; *one feature spanning BE+FE* → new verdict `ROLE-SPLIT` → Mode B. `solution-builder` invokes Mode B in place of its sequential steps 4→5 when a feature spans both tracks; the per-track `write-code` orchestrators can also route here.

### B.1 Phase 0 — contract freeze (sequential barrier)

Parent (or one "contract" subagent) derives + writes the frozen contract from the approved plan + spec: **DTO/types, endpoint list (verb + path + req/res shape), permission codes** `<module>_<entity>:<action>` — **shaped by the profile** (Workstream A). Location adapts to topology (D4):

- two-repo → a shared types package / generated client the FE consumes.
- mono-repo → `base/shared/<module>/*.model.ts`.

Output is embedded **verbatim** in all three role briefs. Frozen = role agents must not mutate it mid-iteration; drift reconciles only at the loop boundary (B.4).

### B.2 Phase 1 — parallel role fan-out (one message, 3 `Agent` calls)

Three self-contained briefs (parallel-dispatch template), each embedding the frozen contract + **disjoint** file targets:

- **BE** → `nestjs-write-code` packs (at the chosen profile); writes `src/modules/<module>/**`; owns BE unit tests (TDD).
- **FE** → `angular-write-code` packs; writes `src/libs/<module>/**`; consumes contract types; owns FE component tests.
- **QC** → from frozen contract + spec acceptance criteria: writes the acceptance checklist + **RED** contract/E2E tests + the verification harness; touches only `*.e2e-spec.ts` / `*.spec.ts` / harness scripts.

Isolation: two-repo → naturally separate trees (no worktree). mono-repo → worktrees per role *or* strict disjoint paths (`backend/src/modules`, `frontend/src/libs`, `e2e/`); `base/shared` touched in Phase 0 only.

### B.3 Phase 2 — fan-in + per-role review (reuse existing Stage A/B)

As each role returns, parent verifies from the **actual diff** (never the "done" word): existing Stage A spec-compliance → Stage B code-quality (`sdcorejs-review` → `repair-loop`) per role. Conflict scan: no role touched another's files; nobody mutated the frozen contract.

### B.4 Phase 3 — integration verify = the loop gate

Parent invokes `verify-before-done` against the spec Acceptance Criteria, running QC's harness + build/lint/test + smoke (BE `/health` + endpoint, FE route load, e2e across both). Verdict:

- all ✅ (or user-deferred) → **DONE** → exit → tail chain.
- Critical/Important remain → route each to its **owning role** (contract mismatch → BE/contract; screen bug → FE; missing assertion → QC) → re-dispatch **only that role** with the finding list (no hand-fix → avoids context pollution) → next iteration.
- **Contract drift** (BE had to change a shape) → reconcile the frozen contract here, re-brief FE+QC with the updated slice.

### B.5 Loop control (reuse repair-loop discipline)

Hard cap **3 iterations**; no-progress (zero new criteria resolved) ×2 rounds → **escalate** with the convergence-failure framing. Each iteration re-runs only failed slices, never all three.

### B.6 Tail chain (unchanged)

On DONE: `comment-code` (ASK) → `branch-ready` → `auto-docs` → `auto-task-tracker` → `memories`. (`verify-before-done` already consumed as the gate.)

---

## Files touched (anticipated)

**Workstream A:**
- `_refs/nestjs/write-code/{init-project,init-module,init-entity,actions}.md` — profile branches.
- `_refs/nestjs/core-catalog.md` — note neutral-core vs profile-template boundary (no API change).
- `_refs/nestjs/review-code.md`, `_refs/nestjs/architecture-principles.md` — doc-drift fixes.
- `_refs/sdlc/nestjs.md`, `skills/shared/sdlc/02-clarify-requirements.md` (or its nestjs ref) — profile question.
- `skills/orchestration/solution-builder.md` — non-tech default `simple`.
- `skills/tracks/nestjs/write-code.md` — pass profile to packs.

**Workstream B:**
- `skills/orchestration/subagent-driven-dev.md` — Mode A/B selector + Mode B body.
- `skills/orchestration/parallel-dispatch.md` — `ROLE-SPLIT` verdict branch.
- `skills/orchestration/solution-builder.md` — invoke Mode B for cross-track features.
- Descriptions/triggers updated where Mode B should auto-fire.

**Mirror:** every `skills/**` or `_refs/**` edit must be followed by `bash .claude/sync-skills.sh` and staging the regenerated `.claude/skills` + `plugin/skills` + `.claude/_refs` + `plugin/_refs` (lefthook enforces on commit). **Never hand-edit the mirrors.**

---

## Acceptance criteria

**Workstream A:**
- [ ] A `simple`-profile `init-project` emits NO `tenantCode`/`departmentCode` columns, NO `MASTER`/`TENANT_ADMIN` flags, NO internal-secret module, NO `base/shared`; entities extend lib `WithAudit(BaseEntity)`; `IPermissionStrategy.load()` returns `string[]`.
- [ ] An `enterprise`-profile run is byte-equivalent to the current pack output (no regression).
- [ ] The profile is a blocking clarify question (nestjs); `solution-builder` non-tech defaults to `simple` without asking architecture.
- [ ] `review-code.md` contains no `be-masterdata`/`base/core-be/`/`bilingualMsg` references; its probes match generated code at each profile.
- [ ] `architecture-principles.md` §2/§4/§13 match actual pack output (`modifiedBy`, `src/modules/<m>/schemas/`, `ApiResponse`).
- [ ] `bash .claude/sync-skills.sh --check` passes; `npx lefthook run check` green.

**Workstream B:**
- [ ] `subagent-driven-dev.md` has a mode selector; Mode A unchanged; Mode B documents the 4 phases + loop control.
- [ ] `parallel-dispatch.md` routes a BE+FE feature to `ROLE-SPLIT`/Mode B and N same-kind units to Mode A.
- [ ] Mode B's Phase 0 freezes a profile-shaped contract; the 3 role briefs are file-disjoint; the loop gate is `verify-before-done` with cap 3 + no-progress-×2 escalation.
- [ ] `solution-builder` uses Mode B for a feature spanning BE+FE (sequential path remains the documented fallback).
- [ ] A dry-run walkthrough in the doc shows a contract-drift iteration reconciling FE+QC.

---

## Risks & mitigations

- **Two coupling models in one skill (D5 risk).** Mitigation: explicit mode selector + walled-off sections + parallel-dispatch routing, so "independent units" and "deliberately-coupled roles" never bleed.
- **Profile branching bloats the packs past the ~500-line guideline.** Mitigation: if a pack grows too large, extract the `enterprise`-only templates into `_refs/nestjs/templates/` (same split already done for the angular entity templates).
- **`enterprise` regression.** Mitigation: the byte-equivalence acceptance criterion + a diff check against current output before/after.
- **Live E2E not validated in this repo** (docs/skills repo). Mitigation: real `docker compose up` of generated `simple` + `enterprise` output is a target-project E2E, tracked as deferred follow-up (carried from the prior handoff #4).

---

## Out of scope

- nextjs track changes (profile is nestjs-only; angular consumes the contract but isn't re-tiered here).
- A real shared-types-package generator / OpenAPI client tool (the contract-freeze writes types by hand per the chosen topology; a generator is a future enhancement).
- Migrating existing generated projects to the `simple` profile (forward-only; existing apps keep `enterprise`).

## Suggested phasing (for the plan)

1. **Phase 1 — doc-drift (items 9–10).** Independent, cheap, no behavior change. Ship first.
2. **Phase 2 — profile tier (items 1–8).** Pack branches + clarify wiring + solution-builder default.
3. **Phase 3 — role-split loop (Workstream B).** Depends on the profile (contract-freeze shape) from Phase 2.

Each phase is independently shippable and mirror-synced.
