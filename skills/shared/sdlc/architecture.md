---
name: sdcorejs-architecture
description: Conditional architecture gate between approved spec and plan. Use for cross-module/repository boundaries, public/event/data contracts, state ownership, trust boundaries, major dependency or paradigm choices, or dependency direction before fan-out. Route mapping to explore, audits to review, open-ended design to brainstorming, and file/task steps to plan. Bypass invariant CRUD, simple drawers, bounded fixes, docs/test-only work, and no-architecture dependency patches. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, user.approve
---

# Architecture

## Shared protocols

Read `_refs/shared/runtime-protocols.md`, `_refs/shared/project-context.md`,
`_refs/shared/artifact-lifecycle.md`, `_refs/shared/decision-coverage.md`, and
`_refs/sdlc/architecture.md`. Resolve tracks, artifact roots/kinds, repository
roles, and ownership from `_refs/shared/system-registry.json`. Use
`_refs/shared/architecture-contract.mjs` as the only architecture gate/context,
ownership, path, lifecycle-handoff, revision, and write-scope authority. Reuse
`_refs/shared/approved-artifact.mjs` for approval identity; never create a
second hash implementation.

## Purpose and boundary

This skill converts a verified approved spec into the smallest durable set of
architecture decisions that independent implementation units must share. It is
the conditional gate between `sdcorejs-spec` and `sdcorejs-plan`.

Route adjacent intents without stealing them:

| User intent | Owner |
|---|---|
| Map or explain the current architecture | `sdcorejs-explore` |
| Review/audit the current or proposed architecture | `sdcorejs-review (architecture)` |
| Design architecture from this approved spec | `sdcorejs-architecture` |
| Explore or compare open-ended system designs | `sdcorejs-brainstorming` |
| Produce file/task implementation steps | `sdcorejs-plan` |

Architecture does not own file-by-file order, task sequencing, production
code, executed test evidence, release decisions, or convention persistence.

## Preconditions

- An immutable approved spec and its complete `spec_context` are available.
- `verifyApprovedArtifactGraph` verifies that exact spec before drafting.
- Stable requirement/decision/assumption/invariant records are available.
- Semantic repository topology is resolved independently of the current
  working directory.
- The request is no longer open-ended. Otherwise route to brainstorming.

Missing, mutated, stale, wrong-owner, or unapproved spec identity blocks. A
missing or unwritable semantic architecture owner blocks; never write module
architecture into the portal as a fallback.

## 1. Classify the gate

Call `classifyArchitectureGate` with explicit signals and rationale.
Architecture is required when at least one canonical signal covers:

- a cross-module or cross-repository boundary;
- a public API, event, queue/topic, or persisted data-model contract;
- important state/data ownership;
- a security/trust boundary;
- a major dependency or architectural paradigm;
- choices independent units could make incompatibly; or
- integration-owner dependency direction that must be frozen before fan-out.

Use a concrete not-applicable bypass for ordinary CRUD following accepted
invariants, a simple four-field drawer, static copy/style changes, a bounded bug
fix, docs-only/test-only work, dependency patches without architecture change,
current-architecture review, or read-only mapping. Ambiguity blocks; do not
convert uncertainty into a bypass.

Every required signal must have non-empty evidence in its relevant typed
section. Public contracts use the matching canonical kind (`api`, `event`,
`queue`/`topic`, or persisted `data-model`); generic unrelated rows do not count.

When not applicable, preserve the exact gate result and route directly to
`sdcorejs-plan`. The artifact graph remains approved spec -> approved plan.

## 2. Resolve the semantic owner

Call `resolveArchitectureOwner` against the repository plan/topology.

- Module-internal architecture belongs to the module repository.
- Portal ownership is limited to shell/composition/integration architecture.
- Cross-repository architecture belongs to the resolved integration owner and
  retains immutable child repository references.
- Availability and writability are mandatory.
- Portal fallback is forbidden.

## 3. Draft the lean spine

Write the draft only under:

```text
<owner-root>/.sdcorejs/docs/architecture/<timestamp>-<topic>-architecture.md
```

Use `buildArchitectureDraftPath` and `validateArchitectureWriteScope`. Include
only decisions that independent units could otherwise interpret differently:

```yaml
architecture_context:
  schema_version: 1
  source: sdcorejs-architecture
  contract_id: <shared contract>
  requirement_id: R-001
  approved_spec_reference: <immutable spec reference>
  approved_architecture_path: <filled after approval>
  approved_architecture_hash: <filled after approval>
  owner_repository_id: <semantic owner>
  owner_module_id: <module or null>
  execution_host_repository_id: <host>
  integration_owner_repository_id: <integration owner>
  trigger:
    required: true
    signals: [<canonical signal>]
    rationale: <why the gate applies>
  invariants:
    - id: INV-001
      statement: <testable invariant>
      scope: <boundary>
      owner: <owner>
      rationale: <why>
      verification_method: <test/review/config evidence>
      requirement_refs: [R-001]
      decision_refs: [D-001]
  boundaries: []
  dependency_directions: []
  data_state_owners: []
  public_contracts: []
  security_trust_boundaries: []
  cross_repository_integration: []
  adopted_decision_refs: []
  deferred_decision_refs: []
  assumption_refs: []
  validation_obligations: []
  profile_sections:
    frontend_architecture_ref: <reference + conformance INV refs, or null>
    agent_architecture_ref: <reference + conformance INV refs, or null>
  change_control:
    revision: 1
    supersedes: null
```

Required architecture has at least one testable invariant and validation
obligation. Validate every typed reference with `validateArchitectureContext`.
Do not invent file/task steps or record executed evidence here.

Reuse `_refs/shared/frontend-architecture.md` and
`plan_context.frontend_architecture` for frontend component/state/provider/file
and test decisions. Reuse `_refs/sdlc/ai-agent.md` and
`plan_context.agent_architecture` for engine/capability/runtime/tool decisions.
Profile sections reference those blocks and prove conformance to relevant
`INV-*`; they do not duplicate them.

## 4. Review and approval

Run a separated read-only architecture review. Resolve deterministic contract
blockers before presentation. Present the lean draft and ask for explicit user
approval; the validator never auto-approves.

After approval:

1. Build the approved path with `buildArchitectureApprovedPath` under
   `<owner-root>/.sdcorejs/architecture/<track>/<timestamp>-<topic>.md`.
2. Call `createApprovedArtifact` with `artifact_kind: architecture` and exactly
   one approved-spec parent reference.
3. Verify it with `verifyApprovedArtifactGraph` against the exact approved spec.
4. Build the post-approval `architecture_context` envelope using the returned
   path and approval hash. Do not put a self-referential approval hash inside
   the hashed body.
5. Validate the final context and exact handoff with
   `validateArchitecturePrePlanHandoff`, including resolved repository topology.
   It reclassifies and compares the six-field gate; never trust caller-supplied
   `required`. Plan draft self-review uses `validateArchitectureDraftPlanHandoff`;
   only the approved snapshot and execution use `validateArchitecturePlanHandoff`
   for the full graph.

The normal graph is approved spec -> approved architecture -> approved plan.
The plan preserves the exact architecture path/hash/reference. Missing, stale,
mutated, wrong-parent, or mismatched identity blocks plan and execution.

Approved snapshots are immutable. A change creates a new artifact, increments
`change_control.revision`, and sets both context and artifact `supersedes` to
the prior artifact identity. Validate continuity with
`validateArchitectureRevision`; never edit an approved snapshot in place.

## 5. Convention boundary

An approved architecture may emit an `approved-architecture` convention
candidate. This skill never writes `.sdcorejs/conventions/**`; validate its
write set with `validateArchitectureWriteScope`. Only
`sdcorejs-explore (conventions-sync-write-approved)` may persist an approved
rule. Inferred preferences remain observed and non-blocking. Public contract
compatibility, migration, and deprecation obligations remain explicit.

## Output handoff

Pass to `sdcorejs-plan`:

- the exact verified `spec_context` and decision coverage;
- `architecture_gate` with normalized signals or concrete bypass;
- `architecture_context` and approved architecture artifact reference when
  required, otherwise `architecture_context: null`;
- semantic owner and immutable child references whose integration owner matches
  the resolved top-level owner;
- exact execution/integration-owner metadata and repository topology;
- exact frontend/agent profile references plus matching conformance `INV-*` IDs;
- unresolved blockers, if any (which prevent planning).

Do not execute the plan from this skill.
