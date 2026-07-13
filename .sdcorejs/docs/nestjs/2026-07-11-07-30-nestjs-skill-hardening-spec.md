# Spec - NestJS Skill Hardening - 2026-07-11 07:30

## Problem & Goals

`sdcorejs-nestjs` currently mixes orchestration prose, partially executable code
fences, stale core-package assumptions, and generated-project claims that are not
backed by real NestJS compilation. Several canonical references still contain
corrupted localization placeholders in technical positions. Authorization and
tenant isolation are not consistently machine-verifiable, while the existing
golden target app is a generic Node HTTP mock rather than an application generated
from the canonical NestJS contract.

This change hardens the existing public skill `sdcorejs-nestjs` without creating a
new skill. Success means both supported profiles are generated from one explicit
contract, compile under the selected Node.js/NestJS baseline, fail closed when
authentication or scope is unavailable, and prove their behavior through executable
generated-project tests. Validation reporting must distinguish static evidence from
compilation, behavioral, container, and real-agent evidence.

The target is the `sdcorejs-agent` authoring repository. The sibling
`C:/Users/Admin/Documents/sdcorejs/sdcorejs-nestjs` repository is a read-only API
grounding source during this work; its current package metadata reports
`@sdcorejs/nestjs@1.0.0`, NestJS 11 peer dependencies, strict TypeScript, and Node
`>=18.18`. Compatibility claims must be reconciled against actual declarations and
official NestJS support evidence before a generated-project baseline is selected.

## Non-goals

- Do not rename or replace the public `sdcorejs-nestjs` skill.
- Do not modify the sibling `sdcorejs-nestjs` core-package repository from this task.
- Do not add a new production-SDLC skill or expand into deployment governance,
  observability, incident response, SRE, compliance, or promotion workflows.
- Do not claim live Codex, Claude, Cursor, or Copilot behavior from deterministic
  tests.
- Do not make Docker-dependent Keycloak/Postgres checks appear passed when Docker or
  the required image is unavailable.
- Do not preserve controller inheritance merely for template convenience when it
  prevents complete route authorization auditing.

## Architecture

### Canonical contract and profile model

The orchestrator remains `skills/tracks/nestjs/sdcorejs-nestjs.md`. It consumes a
machine-readable pack manifest and profile contract under `_refs/nestjs/`. The
manifest is the single source for pack identity, dependency order, required inputs,
profile support, outputs, write boundaries, and verification commands. The profile
contract resolves once per run and is passed unchanged to every pack.

`simple` and `enterprise` share authentication, route-policy, request validation,
error, and runtime-safety semantics. `simple` uses an explicit role-to-permission
adapter and has no tenant fields. `enterprise` obtains `actor`, `tenantCode`, and
optional `departmentCode` only from trusted request context and requires scoped
repository operations. Packs cannot silently redefine either profile.

### Executable templates and generation

Executable project templates live under `_refs/nestjs/generator/` rather than only
inside Markdown prose. A Node.js generator using built-in filesystem APIs renders a
fixed canonical sample domain for `golden-simple` and `golden-enterprise`, while the
Markdown packs explain how to generalize the same contract to user-selected modules
and entities. Template placeholder allowlists are explicit per file.

Remaining TypeScript code fences are parsed as documentation examples and must be
syntactically valid after applying their declared fixture context. A forbidden-token
validator rejects localization artifacts, malformed identifiers, unresolved
technical placeholders, empty route/action names, and incomplete implementation
markers while allowing declared generic generation placeholders such as `<Entity>`.

### Route security and scope enforcement

Generated controllers declare every HTTP route explicitly. Protected routes carry
authentication, authorization policy metadata, parameter/body validation, and a
stable permission code. Unsupported operations are absent. A generated route audit
enumerates controller metadata and fails when a protected route lacks policy
metadata; read-only resources fail if a mutation route is present.

Authorization policies receive an authenticated actor and entity. Cross-tenant
denial precedes ownership or role checks. DTO capability flags are derived only for
presentation and reuse policy functions; mutation services re-evaluate authorization
against locked/current state.

Enterprise repositories expose scoped search, detail, mutation, workflow, export,
report, uniqueness, and background-job APIs. Raw repository access is either inside
the scoped implementation or explicitly isolated and audited. Missing tenant context
fails closed. Department scope is added only when required by the entity contract.

### Validation, runtime, and error contracts

Create/update request schemas and response DTOs are separate. Zod schemas reject
unknown or server-owned request fields and validate UUIDs, dates, enums, pagination,
bulk requests, and custom action bodies. Route parameters are validated before any
repository call. Generated projects enable strict TypeScript and consume a typed,
startup-validated environment configuration.

Production defaults require explicit CORS origins when credentials are enabled,
bounded global body sizes, route-specific large-operation limits, migration-managed
schema creation, secure secrets, and no privileged demo account. All failures use one
stable application error envelope without stack traces, SQL, secrets, or mutated
technical identifiers.

### Keycloak, concurrency, and bulk operations

Keycloak administration resolves the internal client UUID before UUID-based admin
calls. Secrets are confined to a secret-provider boundary and excluded from public
DTOs and logs. Cross-system mutations use persisted operation state, idempotency keys,
retry-safe transitions, compensation where possible, and reconciliation for ambiguous
or partial outcomes.

Workflow transitions use optimistic version checks or row locks, reload current state,
and re-run scope/policy/transition checks inside the transaction. Bulk import is
bounded, sanitized, deduplicated or idempotent when requested, and returns safe row
results. Export validates ranges and scope, enforces row bounds, and streams or uses a
background artifact for large output.

### Behavioral validation and evidence

Repository-level deterministic tests cover manifest/profile consistency, forbidden
tokens, links, code-fence parsing, generator safety, mirror routing, and template
contracts. Generated `golden-simple` and `golden-enterprise` projects run dependency
installation, TypeScript/Nest build, unit, integration, E2E, authorization, runtime
configuration, and abuse tests. Enterprise additionally runs tenant isolation and
concurrency tests.

Container tests use real Postgres and, where supported, real Keycloak. They remain an
explicit Full E2E tier when local/CI infrastructure is unavailable. Every verification
record includes command, cwd, exit code, result identity, and skipped reason. Final
readiness is bounded by the strongest evidence actually observed.

## File structure

### Canonical skill and contracts

- `skills/tracks/nestjs/sdcorejs-nestjs.md` - edit orchestration to consume one manifest
  and profile contract and require executable validation.
- `_refs/nestjs/pack-manifest.json` - create canonical pack graph, inputs, outputs,
  profiles, ownership, and verification contract.
- `_refs/nestjs/profile-contract.json` - create shared and profile-specific generation
  invariants.
- `_refs/nestjs/generator/**` - create the canonical renderer, templates, fixtures, and
  generated-project test assets for both profiles.

### Canonical reference packs

- `_refs/nestjs/core-catalog.md` - reconcile against actual core declarations and
  supported exports.
- `_refs/nestjs/architecture-principles.md` - align security, tenancy, DTO, migration,
  error, and runtime rules.
- `_refs/nestjs/write-code/init-project.md` - secure project/runtime/config templates.
- `_refs/nestjs/write-code/init-admin.md` - harden authentication, authorization,
  Keycloak, bootstrap, role scope, and permission reconciliation.
- `_refs/nestjs/write-code/init-module.md` - consume the resolved profile and module
  scope contract.
- `_refs/nestjs/write-code/init-entity.md` - explicit routes, scoped repositories,
  request/response contracts, and parameter validation.
- `_refs/nestjs/write-code/actions.md` - actor policies, concurrency, import/export,
  and workflow contracts.
- `_refs/nestjs/test-{unit,integration,e2e}.md` - replace corrupted examples and map to
  executable generated-project coverage.
- `_refs/nestjs/review-{code,security,performance}.md` - align review probes with the
  executable contract.
- `_refs/sdlc/nestjs.md` - reconcile discovery/spec/plan guidance with the two profiles.

### Validation and generated mirrors

- `test/e2e/support/nestjs-pack-*.mjs` - create manifest, template, generation, and
  verification helpers.
- `test/e2e/nestjs-pack-*.test.mjs` - create static, parsing, generation, build, and
  behavioral regression suites.
- `test/e2e/fixtures/**` - add intentional valid/invalid NestJS template and profile
  fixtures where reusable fixtures are clearer than inline data.
- `test/e2e/support/golden-target-app.mjs` and related phase-4 files - integrate real
  canonical NestJS golden profiles without weakening the existing cross-stack smoke.
- `scripts/check-nestjs-pack.mjs` - create a non-mutating focused validation entrypoint
  when the test helpers need a stable CLI.
- `package.json` and `package-lock.json` - add focused non-mutating scripts and only
  necessary parser/compiler dev dependencies.
- `.github/workflows/ci.yml` and `.github/workflows/full-e2e.yml` - run applicable fast
  and containerized tiers.
- `VALIDATION.md` - document observed evidence and remaining external/runtime gaps.
- `.claude/**`, `plugin/**`, and `codex/skills/**` - regenerate only through
  `npm run sync:skills`.

Exact generator/template leaf files are finalized in the implementation plan after
the RED tests define the smallest executable surface.

## Acceptance criteria

1. Canonical NestJS executable templates contain no corruption token.
2. Every canonical NestJS TypeScript/TSX code fence parses successfully with its
   declared fixture context.
3. A `golden-simple` application generated from canonical templates compiles.
4. A `golden-enterprise` application generated from canonical templates compiles.
5. Generated unit tests execute and pass.
6. Generated integration tests execute and pass.
7. Generated E2E tests execute and pass.
8. Every protected generated HTTP route has explicit authentication and authorization
   behavior.
9. A read-only generated resource exposes no mutation route.
10. Missing permission metadata fails closed wherever protection is expected.
11. Enterprise queries mechanically enforce every scope field required by the entity
    contract.
12. Tenant A cannot search, read, mutate, transition, export, report, or infer Tenant B
    data.
13. Authorization policies compare authenticated actor identity/scope to entity state.
14. DTO capability flags are never authoritative for mutations.
15. Generated Node.js metadata is compatible with the selected NestJS/core-package
    baseline and has no contradictory ranges.
16. Production CORS rejects wildcard origins when credentials are enabled.
17. Global request bodies are bounded and large operations have route-specific limits.
18. Production startup performs no implicit schema DDL.
19. Invalid or insecure production environment configuration is rejected at startup.
20. Generated TypeScript compiles with strict settings.
21. Create/update request types are separate from response DTOs.
22. Route parameters and every custom request body are validated before service or
    repository execution.
23. Normal startup creates no automatic privileged demo user.
24. Keycloak client operations use the internal client UUID where the admin API requires
    it.
25. Client secrets are not exposed or stored as plaintext by generated production code.
26. Keycloak/database operations implement idempotency and reconciliation for partial or
    ambiguous outcomes.
27. Role uniqueness matches global, tenant, and department scope semantics.
28. Permission discovery is typed, manifest-based, or AST-based and detects stale
    permissions.
29. Workflow transitions are concurrency-safe and only one conflicting transition can
    commit.
30. Bulk import is bounded, sanitized, safely reported, and idempotent where required.
31. Export is scope-safe, range/row bounded, and streaming or asynchronous for large
    data.
32. Canonical NestJS documentation contains no unresolved contradiction that changes
    generated behavior.
33. Every canonical and generated-mirror reference link resolves.
34. Pack manifest, orchestrator, profile contract, packs, and mirrors agree.
35. The selected profile is propagated to every dispatched pack.
36. Final verification commands are non-mutating; fix/write commands are separate.
37. Official mirrors are regenerated and synchronized from canonical sources.
38. All applicable focused and full repository tests pass.
39. `git diff --check` passes.
40. No unrelated user change is overwritten or swept into the work.
41. `VALIDATION.md` states exactly which static, parsing, compilation, behavioral,
    container, and real-agent claims are proven or unproven.

## Risks & mitigations

- **Risk:** The scope spans large, internally inconsistent reference packs. ->
  **Mitigation:** one branch with phase checkpoints, RED tests before each contract
  change, and no mirror edits by hand.
- **Risk:** Published `@sdcorejs/nestjs@1.0.0` declarations may differ from stale
  documentation or the sibling checkout. -> **Mitigation:** ground imports and method
  signatures in installed/published declarations and fail validation on drift.
- **Risk:** NestJS 11 and Node support metadata are contradictory. -> **Mitigation:**
  verify official compatibility, select one baseline, and test generated package
  metadata against it.
- **Risk:** Real Postgres/Keycloak tests are slow or infrastructure-dependent. ->
  **Mitigation:** keep deterministic fast tests in regular CI, container behavior in an
  explicit Full E2E tier, and report unavailable tiers as blocked rather than passed.
- **Risk:** A golden sample can pass while generic Markdown instructions remain unsafe.
  -> **Mitigation:** manifest consistency, forbidden-token, code-fence, route audit, and
  profile-propagation checks cover all canonical packs in addition to golden builds.
- **Risk:** Generated-project dependencies add network variability. -> **Mitigation:**
  pin compatible ranges, record lockfiles/evidence, and separate generation from install
  and build results.
- **Risk:** Security templates may imply guarantees the core package cannot provide. ->
  **Mitigation:** implement app-level explicit guards/scoped repositories where possible;
  otherwise mark the affected acceptance criterion blocked instead of inventing APIs.

## Out of scope (deferred)

- Changes to the `@sdcorejs/nestjs` core library - require a separate core-library
  spec/plan if an unavoidable API defect is proven.
- Live runtime transcripts for Codex, Claude, Cursor, or Copilot - collect as release
  evidence after deterministic and generated-project validation passes.
- Production deployment, staging promotion, observability, incident response, SRE,
  compliance, and release-governance skills - require explicit production-SDLC scope
  approval.
- Supporting profiles beyond `simple` and `enterprise` - defer until a concrete consumer
  requires another contract.
