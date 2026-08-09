# Project Convention Registry And `convention_context`

Contract for reading, reporting, and persisting durable project conventions.
Read this before running a consistency review, before
`sdcorejs-explore (conventions-read)`, and before
`sdcorejs-explore (conventions-sync-write-approved)`.

`_refs/shared/convention-contract.mjs` and `_refs/shared/convention-paths.mjs`
implement the deterministic parts: schemas, paths, precedence, ownership,
redaction, and idempotent sync planning. This reference is authoritative for the
behavior they enforce.

## Contents

- [Why Review Stays Read-only](#why-review-stays-read-only)
- [Canonical Root And Layout](#canonical-root-and-layout)
- [Rule Schema](#rule-schema)
- [Rule Status And Enforcement](#rule-status-and-enforcement)
- [Source Kinds And Auto-accept](#source-kinds-and-auto-accept)
- [Capture Policy](#capture-policy)
- [Precedence](#precedence)
- [Ownership](#ownership)
- [`convention_context`](#convention_context)
- [`conventions-read`](#conventions-read)
- [`conventions-sync-write-approved`](#conventions-sync-write-approved)
- [Project Context Projection](#project-context-projection)
- [Artifact Lifecycle And Git Closure](#artifact-lifecycle-and-git-closure)
- [Parallel Execution](#parallel-execution)
- [Worked Examples](#worked-examples)
- [Operating Tasks](#operating-tasks)

## Why Review Stays Read-only

A review that could write its own conclusions would be able to manufacture the
authority it is judged against: find a pattern, write it down as a rule, then
report everything else as violating it. Splitting detection from persistence
keeps the rule set answerable to a decision rather than to whatever the last
review happened to see.

So `sdcorejs-review` reports and emits `convention_context`, with
`write_actions` empty. Persistence happens in a separate
`sdcorejs-explore (conventions-sync-write-approved)` action that needs its own
authority, revalidates the final code state, and can be blocked independently.

Review findings are not write authorization. The separation holds even when a
committed policy allows the sync to run automatically afterwards: policy
authorizes the *sync step*, never a write inside review.

## Canonical Root And Layout

The canonical root comes from `artifact_roots.conventions` in
`_refs/shared/system-registry.json` and resolves through
`_refs/shared/convention-paths.mjs`. No helper hardcodes it.

```text
.sdcorejs/
  conventions/
    policy.yaml

    repository/
      <category>/
        <rule-file>.yaml

    modules/
      <module-id>/
        <category>/
          <rule-file>.yaml

    portal-composition/
      <category>/
        <rule-file>.yaml
```

Examples:

```text
.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml
.sdcorejs/conventions/repository/naming/naming-typescript-property-case.yaml
.sdcorejs/conventions/modules/crm/vocabulary/vocabulary-customer-term.yaml
.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml
.sdcorejs/conventions/portal-composition/frontend-routing/routing-module-route-format.yaml
```

One rule per file. A single catalog file would serialize every module's
convention work through one merge point and turn independent edits into
conflicts; per-rule files let two modules record two rules without touching the
same bytes.

The path carries identity. Scope directory, module segment, category, and file
stem all participate, and the rule body must agree with them. Fail-closed
codes reported by `classifyConventionPath`:

| Code | Meaning |
|---|---|
| `INVALID_RELATIVE_PATH` | absolute path, drive letter, or `..` segment |
| `OUTSIDE_CONVENTION_ROOT` | not under the canonical root |
| `UNKNOWN_CONVENTION_SCOPE` | first segment is not a known scope directory |
| `INVALID_CONVENTION_PATH_DEPTH` | wrong depth for that scope |
| `INVALID_CONVENTION_MODULE_ID` | module segment is not kebab-case |
| `INVALID_CONVENTION_CATEGORY` | category is not kebab-case |
| `UNSUPPORTED_CONVENTION_EXTENSION` | not `.yaml` |
| `INVALID_CONVENTION_RULE_FILE` | file stem is not kebab-case |

Never create empty category files, a global rule index, a mutable session
manifest, a "current convention" pointer, or a duplicate of a module rule inside
a portal.

## Rule Schema

```yaml
schema_version: 1

artifact_id: convention-api-resource-cardinality
artifact_kind: convention
document_type: rule

change_ref: shared-project-conventions
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore

repository:
  repository_id: github.com/example/product-service

scope:
  kind: repository          # repository | module | portal-composition
  module_id: null
  boundary: public-api

rule:
  id: api.resource-segment.cardinality
  category: api-routing
  concept_id: resource-collection-path
  semantic_role: collection-resource-path

  canonical:
    value: plural
    examples:
      - /products
      - /products/:id

  status: accepted
  enforcement: required

source:
  kind: authoritative-repository-config
  reference: openapi.yaml

confidence: high

rationale: >
  Public REST resources use plural collection segments. Item routes append an
  identifier to the same collection path.

evidence:
  - path: openapi.yaml
    locator: paths./products
    observed: /products
  - path: src/product/product.controller.ts
    locator: ProductController
    observed: products

exceptions:
  - scope: /legacy/product
    reason: External compatibility contract
    migration_status: retained

freshness:
  repository_revision: <revision-or-unknown>
  status: current
```

Validation notes:

- `rule.id` is dotted lowercase kebab-case; it maps to the file stem by
  replacing dots with hyphens, so identity is checkable from the path alone.
- `repository.repository_id` must be a stable remote-derived id. An absolute
  checkout path is rejected: it is a fact about one machine, not about the
  project.
- `evidence` is required, repository-relative, deduplicated, and stably ordered.
- A conflicted rule records at least two `alternatives`; a deprecated rule names
  `replaced_by`.
- `enforcement` must match the value implied by `status`.

Conflict alternatives:

```yaml
alternatives:
  - value: singular
    occurrences: 8
    evidence: []
  - value: plural
    occurrences: 7
    evidence: []
```

Eight against seven does not elect a convention. That is a conflict to resolve,
not a majority to enforce.

## Rule Status And Enforcement

| Status | Enforcement | Behavior |
|---|---|---|
| `accepted` | `required` | enforced in relevant reviews |
| `observed` | `advisory` | never blocks, never justifies an automatic repair |
| `conflicted` | `none` | reports alternatives and asks for resolution |
| `deprecated` | `compatibility-aware` | points at its replacement, keeps exceptions and migration state |
| `stale` | `none` | not enforceable until evidence is refreshed |

An observed rule can never override an accepted one. A stale accepted rule is
not enforceable; code disagreeing with it produces `STALE_CONVENTION` against
the rule, not `CONVENTION_VIOLATION` against the code.

## Source Kinds And Auto-accept

| Source kind | May become `accepted` |
|---|---|
| `explicit-user-decision` | yes |
| `approved-specification` | yes |
| `approved-plan` | yes |
| `authoritative-repository-config` | yes |
| `public-external-contract` | yes |
| `existing-code-observation` | no - stays `observed` |
| `imported-legacy-convention` | no - stays `observed` |

An inferred pattern stays `observed` until someone explicitly accepts it.
`resolveCandidateStatus` also applies the policy thresholds: below
`minimum_independent_evidence` the candidate is not recorded at all, and below
`dominance_ratio` or with several competing values it becomes `conflicted`
rather than a rule.

## Capture Policy

```yaml
schema_version: 1

artifact_id: convention-policy
artifact_kind: convention
document_type: policy

change_ref: shared-project-conventions
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore

capture:
  mode: after-review          # disabled | manual | after-review

  persist:
    accepted_rules: true
    observed_candidates: true
    conflicts: true
    stale_updates: true
    deprecated_updates: true

  auto_accept:
    explicit_user_decisions: true
    approved_specs_and_plans: true
    authoritative_repository_config: true
    public_external_contracts: true
    inferred_patterns: false

  inference:
    minimum_independent_evidence: 3
    dominance_ratio: 0.8

  enforcement:
    accepted: required
    observed: advisory
    conflicted: none
    deprecated: compatibility-aware
    stale: none

  ownership:
    shared_writes: integration-owner-only
```

Capture modes:

1. `disabled` - rules are read; no automatic sync.
2. `manual` - sync runs only on an explicit request.
3. `after-review` - after read-only review and any repair, the caller runs
   `sdcorejs-explore (conventions-sync-write-approved)` without re-asking per
   review. Owner, redaction, lifecycle, and final-diff checks still apply.

`capture.auto_accept.inferred_patterns: true` is rejected by validation.
`capture.ownership.shared_writes` must stay `integration-owner-only`.

The policy is never created silently by a read-only review. It may be created
during explicit convention setup, an explicit sync, approved project
initialization, or another write-approved workflow that owns convention setup.
Once committed, it is standing project-level authorization for the declared
after-review behavior, still subject to semantic ownership and current workflow
authority.

## Precedence

```text
1. explicit current user correction or decision
2. current public/external contract and current authoritative repository config
3. current approved change specification
4. current approved change plan
5. accepted module convention
6. accepted repository convention
7. accepted portal-composition convention
8. observed project pattern
9. framework or general engineering recommendation
```

Qualifications:

- A current user decision may supersede a stored convention. It does not remove
  a compatibility obligation: when the request conflicts with a public or
  external contract, report `PUBLIC_CONTRACT_DRIFT` and require a migration,
  versioning, deprecation, or compatibility decision.
- A module accepted rule refines a repository rule only inside that module.
- Portal-composition conventions never override module-internal semantics.
- Stale and conflicted rules are not enforceable at any precedence.
- Two accepted rules that disagree at the same precedence fail closed to
  `UNRESOLVED_CONVENTION`. `resolveEffectiveRules` drops both from the enforced
  set rather than picking one by file order or count.
- A generic framework recommendation is the weakest input and is never persisted
  as an accepted project rule without explicit evidence.

## Ownership

- Every repository owns its repository-wide conventions.
- Every module repository owns its module-internal conventions.
- A portal owns only portal implementation, portal composition, module
  registration, and integration-facing conventions it explicitly owns.
- A portal may reference a module repository id, module id, portal-pinned module
  revision, convention identity, and consumed rule version or hash. It must not
  hold a competing editable copy of a module-owned rule.
- An unavailable or unwritable module repository **blocks** persistence for that
  module. There is no portal fallback. A fallback copy would become a second
  editable source of one rule, and the two would diverge the first time either
  side was edited - which is exactly the drift the registry exists to catch.
- Absolute checkout paths never become durable repository identity.
- Current source revision and portal-pinned revision stay distinguishable.
  Review integrated portal behavior against the pinned revision when that is the
  real integration target, and report a stale pin.

## `convention_context`

Emitted by review, consumed by repair-loop and by the sync action. Validated by
`evaluateConventionContext`.

```yaml
convention_context:
  schema_version: 1
  mode: read-only
  write_actions: []

  scope:
    repositories: []
    modules: []
    boundaries: []
    files: []
    change_ref: null

  policy:
    status: missing | valid | invalid
    path: .sdcorejs/conventions/policy.yaml | none
    capture_mode: disabled | manual | after-review
    write_authority: none | explicit | project-policy | workflow-owner

  loaded_rules:
    accepted: []
    observed: []
    conflicted: []
    deprecated: []
    stale: []
    invalid: []

  findings:
    direct_violations: []       # CONVENTION_VIOLATION
    semantic_alias_drift: []    # SEMANTIC_ALIAS_DRIFT
    term_collisions: []         # TERM_COLLISION
    cross_layer_drift: []       # CROSS_LAYER_DRIFT
    mapping_gaps: []            # BOUNDARY_MAPPING_GAP
    public_contract_drift: []   # PUBLIC_CONTRACT_DRIFT

  candidates: []
  conflicts: []
  stale_rules: []
  exceptions: []

  ownership:
    execution_host_repository_id: null
    integration_owner_repository_id: null
    target_owner_repository_ids: []
    unresolved_owners: []

  persistence:
    requested: false
    authorized: false
    performed: false
    sync_required: false
    target_paths: []
    blocked_reasons: []

  redaction:
    applied: true
    notes: null
```

Enforced behavior:

- `mode` must be `read-only` and `write_actions` must be empty.
- `persistence.performed: true` inside review is a blocker.
- `scope.repositories`, `scope.modules`, `scope.boundaries`, and `scope.files`
  must be arrays, and `scope.change_ref` text or null. The sync step reads them,
  so a malformed scope fails closed here instead of mis-targeting later.
- Invalid files are reported in `loaded_rules.invalid` and excluded from
  enforcement.
- Conflicted and stale rules must not be enforceable.
- Every `persistence.target_paths` entry must be a valid convention path.
- `redaction.applied` must be `true`.
- Each `ownership.unresolved_owners` entry must carry a reason.
- Every finding in a `findings` bucket must use that bucket's finding kind and
  pass `validateConsistencyFinding`.

The context does not restate the track or profile registry; review already
carries those.

## `conventions-read`

Read-only. Usable by review, planning, implementation, documentation, testing,
and project-context consumers.

1. Resolve target repository and topology.
2. Read policy metadata first.
3. Read rule metadata before bodies.
4. Load only the categories relevant to the current task and review scope.
5. Resolve repository, module, and portal-composition scope.
6. Validate every loaded file.
7. Report invalid, duplicate, conflicted, deprecated, stale, and unavailable
   rules.
8. Apply precedence.

It must not mutate rules, refresh evidence, create the policy file, write a
convention index, or write a code map.

## `conventions-sync-write-approved`

Separate from review. Requires one of: explicit current user authorization,
approved convention setup, an approved project convention policy, or approved
workflow / integration-owner authority.

Behavior:

- consume the original `convention_context` and preserve its findings and
  evidence;
- re-read current final code and authoritative config after any repair, and drop
  a finding that repair already resolved;
- merge by stable rule id;
- create accepted rules only from accepted authoritative sources;
- record inferred patterns as `observed`, competing patterns as `conflicted`;
- update stale evidence and deprecation metadata;
- preserve historical exceptions and never delete conflicting or deprecated
  history;
- write only to the semantic owner repository, blocking when it is unavailable
  or unwritable, never falling back to the portal;
- never write from a parallel worker;
- emit a complete `artifact_context` listing every created or updated convention
  file, not only the policy;
- redact all evidence and use repository-relative paths;
- report all writes and every skipped candidate with a reason.

Idempotency is enforced by content hash. `planConventionSync` compares the
canonical hash of the merged document with the existing one and emits no write
when they match, so a second sync over unchanged evidence produces no duplicate
rules, no reordering, no timestamp churn, no demoted accepted rules, no erased
exceptions, no duplicated evidence, and no merge-noise diff.

## Project Context Projection

`project_context.conventions` carries identifiers and paths only:

```yaml
conventions:
  policy_status: missing | valid | invalid
  policy_path: .sdcorejs/conventions/policy.yaml | none
  loaded_paths: []
  accepted_rule_ids: []
  observed_rule_ids: []
  conflicted_rule_ids: []
  deprecated_rule_ids: []
  stale_rule_ids: []
  invalid_paths: []
  unresolved_owner_repositories: []
```

Load only relevant categories, read metadata first, keep owner repository
identity and current revision evidence, use repository-relative paths, mark
invalid rules instead of guessing, and never write conventions during context
preflight.

`Conventions and Invariants` in Summary v2 may hold only a small set of
high-impact accepted invariants, convention root references, policy state,
scope and ownership notes, and pointers to relevant categories. Do not duplicate
the catalog into `.sdcorejs/summary.md`, and do not make every convention edit
invalidate the whole summary: convention validity is checked independently of
the summary fingerprints.

Conventions are not generic memories. They have their own artifact kind and
root; do not store them under `.sdcorejs/memories/**`.

## Artifact Lifecycle And Git Closure

Convention rules and the policy are **shared durable** artifacts with
`commit_policy: conditional` and an explicit owner. They are classified through
`_refs/shared/artifact-lifecycle.md` like other shared state:

- module convention files are owned by the module repository;
- repository convention files are owned by that repository;
- portal-composition files are owned by the portal or integration repository;
- shared convention writes require the sequential or integration owner;
- a path under the convention root that fails path validation is `unknown` and
  blocks closure;
- a `convention` kind claimed outside the root is a metadata/path contradiction
  and fails closed;
- local-only files are never promoted to conventions;
- secret and PII screening applies without printing values;
- Git stages only an explicit validated path list; never `git add .`,
  `git add -A`, or `git add .sdcorejs`;
- a required convention artifact missing from an authorized same-change sync
  blocks closure;
- an unrelated convention edit from another thread is not staged automatically.

Do not bulk-rewrite historical artifacts only to add convention metadata.

## Parallel Execution

Parallel workers emit convention findings and candidates through runtime context
only. They never write shared convention state - `resolveExploreWriteAuthority`
and `resolveConventionWriteAuthority` both refuse a `parallel-worker` role even
when the policy would otherwise authorize the sync.

The sequential owner or fan-in integration owner merges shared convention
artifacts once, after implementation and repair are complete.

## Worked Examples

### 1. Plural API resources

`rule.id: api.resource-segment.cardinality`, scope `repository`, boundary
`public-api`, canonical `plural`, source `authoritative-repository-config`
citing `openapi.yaml`. A new `POST /product` in the same boundary is a
`CONVENTION_VIOLATION`.

### 2. Singular frontend routes

`rule.id: frontend.module-route.cardinality`, scope `portal-composition`,
boundary `frontend-route`, canonical `singular`. `mdm/product` in the frontend
and `/products` in the public API coexist without a finding: different
boundaries, both with accepted rules.

### 3. Raw snake_case to camelCase domain

`rule.id: mapping.external-payload.case`, boundary `public-api`, canonical
`snake_case-external-camelCase-domain`, evidence naming the mapper file. Raw
`is_active` plus a typed mapper passes. The same casing difference with no
mapper is `BOUNDARY_MAPPING_GAP`.

### 4. `isActive` versus `isActivated`

Both are the current predicate for `user-activation` at the domain layer:
`SEMANTIC_ALIAS_DRIFT`. Against `activatedAt` (transition timestamp) or
`canActivate` (capability): no finding, different semantic roles.

### 5. Command and event tense

`rule.id: messaging.command-event.tense`, canonical
`imperative-command-past-tense-event`. `ActivateUserCommand` beside
`UserActivatedEvent` is conformance, not drift, and belongs in the strengths
section.

### 6. Module-owned permission convention

`.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml`
lives in the MDM module repository. The portal may reference the module
repository id, module id, pinned revision, and consumed rule hash. A copy in the
portal is a duplicate editable source and is rejected.

### 7. Retained legacy endpoint

```yaml
exceptions:
  - scope: /legacy/product
    reason: External compatibility contract
    migration_status: retained
```

The endpoint stays. It is not evidence for the convention new endpoints follow,
and it is not a violation to repair.

### 8. Conflicting observed patterns

Eight singular and seven plural internal routes, dominance 0.53 against a
required 0.8: `status: conflicted`, `enforcement: none`, both values recorded in
`alternatives`, reported as `UNRESOLVED_CONVENTION` when relevant.

### 9. Accepted rule from an approved spec

`source.kind: approved-specification` with `source.reference` naming the
approved spec path. Auto-acceptable under the default policy, so the sync writes
it as `accepted` / `required`.

### 10. After-review capture

With `capture.mode: after-review` committed, review stays read-only and sets
`policy.write_authority: project-policy`. The caller then runs the sync step
without asking again, and the sync still revalidates ownership, redaction,
lifecycle, and the final diff.

## Operating Tasks

| Task | How |
|---|---|
| Define an exception | Add an `exceptions` entry with scope, reason, and `migration_status`. Exceptions are preserved across syncs. |
| Deprecate a rule | Set `status: deprecated`, `enforcement: compatibility-aware`, and `replaced_by`. History and exceptions are retained. |
| Resolve a conflict | Record the decision as `explicit-user-decision`; the accepted rule replaces the conflicted one and keeps its alternatives as history. |
| Disable automatic capture | Set `capture.mode: disabled` or `manual`. Rules stay readable; no automatic sync runs. |
| Run a manual sync | Invoke `sdcorejs-explore (conventions-sync-write-approved)` explicitly; explicit authority satisfies `manual` mode. |
| Handle a public-contract migration | Report `PUBLIC_CONTRACT_DRIFT` with compatibility and migration requirements and return to spec or plan. Never auto-rename. |
| Include conventions in a commit | Shared-owned closure through `_refs/shared/artifact-lifecycle.md`, staged as explicit validated paths after the normal gates. |
