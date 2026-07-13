---
name: nestjs-skill-hardening
description: Execute the approved hardening of sdcorejs-nestjs generation, security, tenancy, runtime defaults, and validation.
approvedAt: 2026-07-11T08:00:02+07:00
approvedBy: ghost.of.dark.peter@gmail.com
track: nestjs
sourceSpecPath: .sdcorejs/specs/nestjs/2026-07-11-07-37-nestjs-skill-hardening.md
taskCount: 34
phaseCount: 7
---

# NestJS Skill Hardening - Approved Plan

> Snapshot of what the user approved at the `sdcorejs-plan` gate. Do not edit by hand; re-author through `sdcorejs-plan` if the contract changes.

## Approved contract

# NestJS Skill Hardening Implementation Plan

> **Required sub-skills:** Use `test-driven-development` for every behavioral
> change, `writing-skills` for skill/ref authoring, `skill-creator` for forward
> testing, and the SDCoreJS finish chain before Git handoff.

## Scope

Harden the existing `sdcorejs-nestjs` skill so that its `simple` and
`enterprise` profiles share one machine-readable contract, generate real NestJS
applications from canonical executable templates, fail closed for authentication
and tenant scope, and expose verification evidence that distinguishes static,
compilation, behavioral, container, and real-agent claims.

This plan implements the approved snapshot:
`.sdcorejs/specs/nestjs/2026-07-11-07-37-nestjs-skill-hardening.md`.
It does not create a new skill, modify the sibling `sdcorejs-nestjs` repository,
or expand production-SDLC scope.

## Execution context

- **Repository:** `C:/Users/Admin/Documents/sdcorejs/sdcorejs-agent`
- **Feature branch:** `feat/nestjs-skill-hardening`
- **Read-only API grounding:**
  `C:/Users/Admin/Documents/sdcorejs/sdcorejs-nestjs`
- **Delivery:** one feature branch, phase checkpoint commits, one final pull
  request after the final ship gates.
- **Implementation discipline:** every phase begins with an observed failing test
  for the behavior it introduces. Do not edit generated mirrors manually.
- **Write boundary:** only files listed in this plan plus the generated mirrors
  produced by `npm run sync:skills` and lockfile changes produced by npm.
- **Evidence boundary:** Docker-dependent checks may be recorded as unavailable,
  never converted into a pass. Real-agent claims require a separate forward-test
  transcript.
- **Execution mode:** after plan approval, invoke `sdcorejs-execute-plan` and ask
  sequential versus parallel. Canonical contract/template edits remain
  sequential; independent profile verification and read-only audits are safe
  parallel candidates only after the generator contract is stable.

## Phase 0 — Establish the RED safety baseline

### Task 1: Create the reusable validation harness contract

**Files**

- Create: `test/e2e/support/nestjs-pack-validator.mjs`
- Create: `test/e2e/fixtures/nestjs-pack/valid-code-fence.md`
- Create: `test/e2e/fixtures/nestjs-pack/invalid-code-fence.md`
- Create: `test/e2e/fixtures/nestjs-pack/invalid-template-token.txt`

**Steps**

1. Write exported test helpers for canonical file discovery, forbidden-token
   scanning, Markdown link resolution, TypeScript code-fence extraction, manifest
   loading, profile resolution, template placeholder validation, and normalized
   command evidence.
2. Define fixture metadata explicitly; do not make the helper silently repair or
   rewrite source files.
3. Keep all validation entrypoints non-mutating and deterministic.

### Task 2: Write failing contract and parsing tests

**Files**

- Create: `test/e2e/nestjs-pack-contract.test.mjs`

**Steps**

1. Assert that `pack-manifest.json` and `profile-contract.json` exist and agree
   with the orchestrator and all canonical packs.
2. Assert that canonical NestJS refs contain no corruption markers, malformed
   identifiers, unresolved technical placeholders, or incomplete implementation
   markers.
3. Assert that all local links resolve and every TypeScript/TSX code fence parses
   under its declared fixture context.
4. Assert that every long reference pack exposes a contents map and stable
   progressive-disclosure anchors.
5. Run and record the expected RED result:
   `node --test test/e2e/nestjs-pack-contract.test.mjs`.

### Task 3: Write failing generation and profile tests

**Files**

- Create: `test/e2e/nestjs-pack-generation.test.mjs`

**Steps**

1. Require a non-interactive generator with explicit `simple` and `enterprise`
   profile inputs, safe output-path handling, deterministic overwrite policy, and
   declared placeholder allowlists.
2. Assert that both generated projects contain strict TypeScript, compatible
   Node/NestJS/core-package metadata, explicit controllers, separate request and
   response contracts, and runnable test scripts.
3. Assert that the resolved profile is propagated unchanged to every dispatched
   pack and template renderer.
4. Run and record the expected RED result:
   `node --test test/e2e/nestjs-pack-generation.test.mjs`.

### Task 4: Write failing security and tenancy tests

**Files**

- Create: `test/e2e/nestjs-pack-security.test.mjs`

**Steps**

1. Assert explicit authentication and authorization metadata on every protected
   route and fail closed when permission metadata is absent.
2. Assert that read-only resources expose no mutation routes and that route params
   and custom bodies are validated before service/repository calls.
3. Assert that enterprise repository APIs require all declared scope fields and
   that actor policy checks use authenticated actor context, not client-provided
   capability flags.
4. Assert cross-tenant denial for search, detail, mutation, transitions, export,
   reporting, uniqueness probes, and background operations.
5. Run and record the expected RED result:
   `node --test test/e2e/nestjs-pack-security.test.mjs`.

### Task 5: Write failing runtime and data-integrity tests

**Files**

- Create: `test/e2e/nestjs-pack-runtime.test.mjs`

**Steps**

1. Assert strict startup configuration, safe credentialed CORS, bounded global
   request bodies, route-specific bulk limits, migration-owned schema creation,
   and one stable error envelope.
2. Assert no automatic privileged demo user, typed permission discovery, scoped
   role uniqueness, Keycloak internal-client-UUID usage, and secret-provider
   isolation.
3. Assert persisted idempotency/reconciliation for cross-system operations,
   concurrency-safe workflow transitions, bounded sanitized imports, and bounded
   streaming/asynchronous exports.
4. Run and record the expected RED result:
   `node --test test/e2e/nestjs-pack-runtime.test.mjs`.

### Task 6: Record the RED checkpoint

**Steps**

1. Confirm each new suite fails for the intended missing/unsafe contract, not due
   to a test syntax or fixture error.
2. Update `.sdcorejs/tasks/current-session.md` with commands, exit codes, and the
   specific expected failures.
3. Do not create a checkpoint commit until a later GREEN phase; RED-only tests are
   allowed to remain uncommitted while their implementation follows immediately.

## Phase 1 — Make the canonical contract coherent

### Task 7: Add the pack manifest and profile contract

**Files**

- Create: `_refs/nestjs/pack-manifest.json`
- Create: `_refs/nestjs/profile-contract.json`

**Steps**

1. Define pack identity, dependency order, required inputs, outputs, profiles,
   write boundaries, and verification commands in the manifest.
2. Define shared invariants plus `simple` and `enterprise` scope differences in
   the profile contract.
3. Make the schema reject unknown pack/profile keys and contradictory ownership.

### Task 8: Implement the focused non-mutating validator

**Files**

- Edit: `test/e2e/support/nestjs-pack-validator.mjs`
- Create: `scripts/check-nestjs-pack.mjs`

**Steps**

1. Implement the helpers introduced in Task 1 without any source rewrite path.
2. Emit normalized evidence with command identity, cwd, exit code, and skipped
   reason where applicable.
3. Ensure the CLI exits non-zero on contract, link, token, fence, profile, or
   placeholder errors.

### Task 9: Reconcile the canonical skill and API catalog

**Files**

- Edit: `skills/tracks/nestjs/sdcorejs-nestjs.md`
- Edit: `_refs/nestjs/core-catalog.md`
- Edit: `_refs/nestjs/architecture-principles.md`
- Edit: `_refs/sdlc/nestjs.md`

**Steps**

1. Ground imports, constructor signatures, repository/service methods, NestJS peer
   range, strict TypeScript, and Node baseline in the actual sibling declarations
   and selected official compatibility evidence.
2. Remove controller-inheritance guidance where it prevents complete route audits;
   require explicit generated routes.
3. Make the orchestrator resolve the manifest/profile once and pass the result
   unchanged to every pack.
4. Remove corrupted technical identifiers and contradictory security/runtime
   guidance. Add contents maps to long packs.

### Task 10: Normalize all canonical NestJS packs

**Files**

- Edit: `_refs/nestjs/write-code/init-project.md`
- Edit: `_refs/nestjs/write-code/init-admin.md`
- Edit: `_refs/nestjs/write-code/init-module.md`
- Edit: `_refs/nestjs/write-code/init-entity.md`
- Edit: `_refs/nestjs/write-code/actions.md`
- Edit: `_refs/nestjs/test-unit.md`
- Edit: `_refs/nestjs/test-integration.md`
- Edit: `_refs/nestjs/test-e2e.md`
- Edit: `_refs/nestjs/review-code.md`
- Edit: `_refs/nestjs/review-security.md`
- Edit: `_refs/nestjs/review-performance.md`

**Steps**

1. Remove corruption tokens, malformed names, contradictory defaults, and unsafe
   examples while preserving English-only reusable source.
2. Mark generic placeholders explicitly and provide parser fixture contexts for
   every retained TypeScript/TSX fence.
3. Point pack instructions to the canonical manifest, profile contract, generator,
   and behavioral verification instead of duplicating divergent rules.

### Task 11: Reach the first GREEN checkpoint

**Verification**

- `node --test test/e2e/nestjs-pack-contract.test.mjs`
- `node --test test/e2e/nestjs-pack-generation.test.mjs`
- `node scripts/check-nestjs-pack.mjs`
- `npm run check:text-hygiene`
- `git diff --check`

**Checkpoint**

1. Run `sdcorejs-review`, repair findings, then run `sdcorejs-ship` in
   verify-before-done and branch-ready modes.
2. Commit only the verified Phase 0/1 boundary with a focused conventional commit.
3. Treat its evidence as stale as soon as Phase 2 writes begin.

## Phase 2 — Build executable generation, runtime, and security

### Task 12: Implement the deterministic generator core

**Files**

- Create: `_refs/nestjs/generator/generate-project.mjs`
- Create: `_refs/nestjs/generator/lib/contract.mjs`
- Create: `_refs/nestjs/generator/lib/render.mjs`
- Create: `_refs/nestjs/generator/lib/fs-safety.mjs`

**Steps**

1. Parse and validate profile, output directory, sample domain, overwrite mode,
   and verification mode before writing.
2. Reject traversal, writes outside the declared root, unknown placeholders,
   partial output, and implicit overwrite.
3. Render from fixed canonical templates with stable ordering and reproducible
   results.

### Task 13: Add common secure project templates

**Files**

- Create: `_refs/nestjs/generator/templates/common/package.json.tpl`
- Create: `_refs/nestjs/generator/templates/common/tsconfig.json.tpl`
- Create: `_refs/nestjs/generator/templates/common/nest-cli.json.tpl`
- Create: `_refs/nestjs/generator/templates/common/.env.example.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/main.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/app.module.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/config/env.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/errors/app-error.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/auth/policy.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/auth/request-actor.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/database/migrations/initial.ts.tpl`

**Steps**

1. Pin compatible Node/NestJS/core-package metadata and strict compiler settings.
2. Validate environment input at startup; enforce safe credentialed CORS, global
   body bounds, migration-only production DDL, secret redaction, and stable errors.
3. Provide explicit authentication/policy metadata primitives that fail closed.

### Task 14: Add simple-profile templates

**Files**

- Create: `_refs/nestjs/generator/templates/simple/src/items/item.module.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item.controller.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item.service.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item.repository.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item.entity.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item-create.schema.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item-update.schema.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item-response.dto.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/items/item-route-audit.ts.tpl`
- Create: `_refs/nestjs/generator/templates/simple/src/auth/role-permission-adapter.ts.tpl`

**Steps**

1. Generate explicit controller routes, request schemas, response DTOs, service,
   repository, entity/schema, and route audit for a canonical `Item` domain.
2. Exclude tenant fields and use an explicit role-to-permission adapter.
3. Support a read-only variant whose route audit proves mutations are absent.

### Task 15: Add enterprise-profile templates

**Files**

- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item.module.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item.controller.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item.service.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item.repository.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item.entity.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-create.schema.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-update.schema.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-response.dto.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-route-audit.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/scope/scope-contract.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/scope/scoped-repository.ts.tpl`

**Steps**

1. Derive actor, tenant, and optional department only from trusted request context.
2. Expose scoped search/detail/mutation/workflow/export/report/uniqueness/background
   APIs and keep raw repository access isolated inside the implementation.
3. Re-check cross-tenant denial before ownership, role, capability, or transition
   evaluation.

### Task 16: Connect authoring packs to executable templates

**Files**

- Edit: `_refs/nestjs/write-code/init-project.md`
- Edit: `_refs/nestjs/write-code/init-module.md`
- Edit: `_refs/nestjs/write-code/init-entity.md`

**Steps**

1. Replace divergent prose snippets with instructions grounded in the generator
   contract and generalization rules.
2. Require explicit route enumeration, request/response separation, UUID/date/enum/
   pagination validation, and profile-aware repository selection.

### Task 17: Reach the generator/security GREEN checkpoint

**Verification**

- `node --test test/e2e/nestjs-pack-generation.test.mjs`
- `node --test test/e2e/nestjs-pack-security.test.mjs`
- `node --test test/e2e/nestjs-pack-runtime.test.mjs`
- `node scripts/check-nestjs-pack.mjs`
- `git diff --check`

**Checkpoint**

Run focused review/repair and both ship gates, then create the Phase 2 checkpoint
commit. Reverify after any repair write.

## Phase 3 — Harden admin and Keycloak workflows

### Task 18: Write generated admin/Keycloak behavioral tests first

**Files**

- Create: `_refs/nestjs/generator/templates/common/test/admin-security.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/keycloak-saga.spec.ts.tpl`
- Edit: `test/e2e/nestjs-pack-runtime.test.mjs`

**Steps**

1. Add RED tests for no demo superuser, scoped role uniqueness, stale permission
   detection, internal client UUID lookup, secret isolation, idempotency, partial
   outcome persistence, compensation, and reconciliation.
2. Observe the intended failures before changing admin templates.

### Task 19: Implement secure admin and Keycloak templates

**Files**

- Edit: `_refs/nestjs/write-code/init-admin.md`
- Create: `_refs/nestjs/generator/templates/common/src/admin/permission-manifest.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/admin/role-scope.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/keycloak/admin-client.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/keycloak/secret-provider.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/keycloak/operation-state.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/src/keycloak/reconciler.ts.tpl`

**Steps**

1. Remove privileged bootstrap defaults and require an explicit audited provisioning
   flow.
2. Implement typed permission manifests and global/tenant/department uniqueness.
3. Resolve internal Keycloak client UUIDs before UUID-only admin calls.
4. Keep secrets behind a provider boundary and use persisted retry-safe operation
   state with reconciliation for ambiguous results.

### Task 20: Verify and checkpoint admin hardening

**Verification**

- `node --test test/e2e/nestjs-pack-runtime.test.mjs`
- `node --test test/e2e/nestjs-pack-security.test.mjs`
- `node scripts/check-nestjs-pack.mjs`
- `git diff --check`

Run review/repair and both ship gates, then create the Phase 3 checkpoint commit.

## Phase 4 — Make actions, concurrency, import, and export safe

### Task 21: Write action/data-integrity tests first

**Files**

- Create: `_refs/nestjs/generator/templates/enterprise/test/workflow-concurrency.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/test/bulk-import.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/test/export-scope.spec.ts.tpl`
- Edit: `test/e2e/nestjs-pack-runtime.test.mjs`
- Edit: `test/e2e/nestjs-pack-security.test.mjs`

**Steps**

1. Add RED tests proving actor-based policy checks, locked/current-state
   re-authorization, single-winner conflicting transitions, bounded import, safe row
   errors, idempotency, scope-safe range validation, row bounds, and streaming or
   asynchronous export.
2. Include cross-tenant and capability-forgery abuse cases.

### Task 22: Implement safe action templates and guidance

**Files**

- Edit: `_refs/nestjs/write-code/actions.md`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-policy.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-workflow.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-import.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/src/items/item-export.ts.tpl`

**Steps**

1. Replace created-by/assignee comparison shortcuts with authenticated-actor policy
   functions and cross-tenant-first denial.
2. Use optimistic versioning or a row lock, reload state, and repeat scope/policy/
   transition checks inside the transaction.
3. Bound and sanitize imports; support deduplication/idempotency and safe row results.
4. Bound export ranges/rows and stream small-to-medium results or enqueue large
   artifacts without unbounded `writeBuffer()` use.

### Task 23: Verify and checkpoint data-integrity hardening

**Verification**

- `node --test test/e2e/nestjs-pack-security.test.mjs`
- `node --test test/e2e/nestjs-pack-runtime.test.mjs`
- `node scripts/check-nestjs-pack.mjs`
- `git diff --check`

Run review/repair and both ship gates, then create the Phase 4 checkpoint commit.

## Phase 5 — Prove generated applications behaviorally

### Task 24: Create generated-project test assets

**Files**

- Create: `_refs/nestjs/generator/templates/common/test/unit/item-policy.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/unit/item-service.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/integration/item-repository.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/integration/item-route-audit.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/e2e/item-auth.e2e-spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/e2e/item-validation.e2e-spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/e2e/item-read-only.e2e-spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/enterprise/test/tenant-isolation.spec.ts.tpl`
- Create: `_refs/nestjs/generator/templates/common/test/config-abuse.spec.ts.tpl`

**Steps**

1. Cover unit, integration, E2E, authorization, param/body validation, runtime config,
   error redaction, and abuse behavior in both profiles.
2. Add tenant isolation and concurrency coverage to enterprise.
3. Test DTO capability flags only as presentation output and prove mutations ignore
   forged flags.

### Task 25: Build the real golden-project harness

**Files**

- Create: `test/e2e/support/nestjs-golden-project.mjs`
- Create: `test/e2e/nestjs-golden-project.test.mjs`
- Edit: `test/e2e/support/golden-target-app.mjs`
- Edit: `test/e2e/golden/generate-target-app.mjs`

**Steps**

1. Generate `golden-simple` and `golden-enterprise` into isolated temporary roots
   using the canonical generator.
2. Install from generated metadata/lockfiles, compile with Nest/TypeScript, and run
   generated unit, integration, E2E, security, runtime, tenant, and concurrency
   suites.
3. Preserve the existing cross-stack smoke; do not relabel the generic Node HTTP
   mock as NestJS evidence.
4. Capture command, cwd, exit code, profile, artifact identity, and skipped reason.

### Task 26: Add explicit container test assets

**Files**

- Create: `_refs/nestjs/generator/containers/docker-compose.yml`
- Create: `_refs/nestjs/generator/containers/keycloak/realm-export.json`
- Create: `test/e2e/nestjs-golden-containers.test.mjs`

**Steps**

1. Exercise enterprise integration against real Postgres and supported Keycloak
   admin behavior when Docker is available.
2. Detect unavailable Docker/images explicitly and return a recorded skip/block,
   never a false pass.
3. Keep container lifecycle scoped to the test project and clean it up safely.

### Task 27: Align testing and review references

**Files**

- Edit: `_refs/nestjs/test-unit.md`
- Edit: `_refs/nestjs/test-integration.md`
- Edit: `_refs/nestjs/test-e2e.md`
- Edit: `_refs/nestjs/review-code.md`
- Edit: `_refs/nestjs/review-security.md`
- Edit: `_refs/nestjs/review-performance.md`

**Steps**

1. Map prose checks to executable test names and evidence tiers.
2. Remove any claim not supported by the golden or container harness.

### Task 28: Verify and checkpoint behavioral evidence

**Verification**

- `node --test test/e2e/nestjs-golden-project.test.mjs`
- `node --test test/e2e/nestjs-golden-containers.test.mjs`
- `node --test test/e2e/nestjs-pack-*.test.mjs`
- `node scripts/check-nestjs-pack.mjs`
- `git diff --check`

Run review/repair and both ship gates. Record Docker unavailability precisely if
applicable, then create the Phase 5 checkpoint commit only for evidence actually
observed.

## Phase 6 — Integrate scripts, CI, mirrors, and final evidence

### Task 29: Add stable repository entrypoints

**Files**

- Edit: `package.json`
- Edit: `package-lock.json`

**Steps**

1. Add non-mutating scripts: `check:nestjs-pack`, `test:e2e:nestjs`,
   `test:e2e:nestjs:golden`, and `test:e2e:nestjs:containers`.
2. Add only parser/compiler dependencies proven necessary by the RED suites and pin
   them compatibly with the repository Node baseline.
3. Keep write/fix/generate commands separate from validation commands.

### Task 30: Wire fast and Full E2E CI tiers

**Files**

- Edit: `.github/workflows/ci.yml`
- Edit: `.github/workflows/full-e2e.yml`

**Steps**

1. Run deterministic contract, parsing, generation, and non-container golden checks
   in the appropriate regular CI job.
2. Run Postgres/Keycloak container checks in Full E2E with explicit service health,
   timeout, cleanup, and evidence retention.

### Task 31: Document bounded validation claims

**Files**

- Edit: `VALIDATION.md`

**Steps**

1. Separate static, parsing, compilation, unit, integration, E2E, security, tenant,
   concurrency, container, and real-agent evidence.
2. For every tier, record exact command, cwd, result identity, exit code, and skipped
   reason.
3. State unproven claims explicitly; do not infer live-agent behavior from
   deterministic tests.

### Task 32: Regenerate and validate official mirrors

**Files**

- Generate only through sync: `.claude/**`, `plugin/**`, `codex/skills/**`

**Steps**

1. Run `npm run sync:skills` once canonical sources are stable.
2. Run `npm run check:skills` and `npm run check:skills:ps`.
3. Re-run contract, link, token, profile, entrypoint, and mirror agreement checks.
4. Never patch a generated mirror directly.

### Task 33: Forward-test the authored skill

**Steps**

1. Use `skill-creator` forward-testing with an independent subagent only at this
   stage, using a realistic raw NestJS generation request rather than coaching it
   through the intended path.
2. Inspect whether the agent selects the manifest/profile, generates explicit secure
   routes, applies tenant scope, and reports evidence honestly.
3. Convert reproducible failures into a new RED test, repair canonical source, sync
   mirrors again, and rerun affected verification.
4. Record the transcript/evidence as real-agent evidence; if no independent run is
   available, mark this tier unproven.

### Task 34: Run the final finish chain and Git handoff

**Focused verification**

- `npm run check:nestjs-pack`
- `npm run test:e2e:nestjs`
- `npm run test:e2e:nestjs:golden`
- `npm run test:e2e:nestjs:containers`

**Repository verification**

- `npm run check:text-hygiene`
- `npm run check:skills`
- `npm run check:skills:ps`
- `npm run test:e2e`
- `npm audit --omit=dev`
- `git diff --check`

**Optional host validator**

- `python C:/Users/Admin/.codex/skills/.system/skill-creator/scripts/quick_validate.py codex/skills/sdcorejs-nestjs`
- If its host dependency (for example PyYAML) is unavailable, record that exact
  blocker; do not report a pass.

**Finish and handoff**

1. Run `sdcorejs-test`, `sdcorejs-review`, and `sdcorejs-repair-loop` until all
   verified findings are fixed or explicitly deferred.
2. Run `sdcorejs-documentation` in code-documentation mode where applicable.
3. Run `sdcorejs-ship` verify-before-done, then branch-ready as the final read-only
   gate after the last write.
4. Confirm `git status --short`, inspect the complete branch diff, and exclude any
   unrelated user change.
5. Create the final checkpoint commit, push `feat/nestjs-skill-hardening`, and use
   `sdcorejs-git` to create one pull request with evidence and any explicit gaps.

## Acceptance mapping

| Acceptance criteria | Planned proof |
|---|---|
| AC1–AC2 | Tasks 1–2, 8–10, 32: token scan, link/fence parser, mirror checks |
| AC3–AC7 | Tasks 3, 12–17, 24–28: generated simple/enterprise builds and test suites |
| AC8–AC10 | Tasks 4, 13–17, 24–25: route audit and fail-closed authorization tests |
| AC11–AC14 | Tasks 4, 15, 21–25: scoped APIs, tenant abuse, actor policy, DTO forgery tests |
| AC15 | Tasks 3, 9, 13, 25, 29: package metadata contract and real generated builds |
| AC16–AC20 | Tasks 5, 13, 16–17, 24–25: runtime abuse tests and strict compilation |
| AC21–AC22 | Tasks 4, 14–16, 24–25: request/response split and pre-call validation |
| AC23–AC28 | Tasks 5, 18–20, 24–26: admin/Keycloak tests and container evidence |
| AC29–AC31 | Tasks 5, 21–26: concurrency, import, export behavioral tests |
| AC32–AC35 | Tasks 1–10, 27, 32: canonical/manifest/profile/orchestrator/mirror agreement |
| AC36 | Tasks 8, 29–34: non-mutating validation entrypoints and separated writes |
| AC37 | Task 32: sync-generated mirrors and consistency checks |
| AC38 | Tasks 28 and 34: focused, golden, container, and repository suites |
| AC39 | Tasks 11, 17, 20, 23, 28, 34: repeated and final `git diff --check` |
| AC40 | Every task plus Task 34 branch-diff/status audit |
| AC41 | Tasks 31, 33–34: evidence-tier documentation and honest gaps |

## Self-review checklist

- [x] Every approved acceptance criterion maps to at least one implementation task
  and one verification path.
- [x] RED tests precede each contract/security/runtime behavior change.
- [x] Canonical files and generated mirrors have separate ownership paths.
- [x] Both profiles compile and run behavioral tests before final readiness.
- [x] Docker and real-agent evidence cannot be silently promoted to pass.
- [x] Each checkpoint requires fresh review, repair, verification, and branch-ready
  evidence after its last write.
- [x] The plan preserves the existing public skill identity and approved scope.
- [x] No placeholder task, unresolved decision, or implicit user authorization remains.

## Plan provenance

`sdcorejs-plan` + `writing-plans`, authored from the approved spec on
2026-07-11. Implementation must not begin until this plan is explicitly approved.


## Decisions captured during review

- Approved as drafted.
- Delivery remains one feature branch with phase checkpoint commits and one final pull request.

## Skill provenance

sdcorejs-plan (approved on attempt 1 / 3)
