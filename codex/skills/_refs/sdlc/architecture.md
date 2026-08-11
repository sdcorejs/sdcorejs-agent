# Conditional Architecture Gate

Use this reference after an approved spec and before `sdcorejs-plan`. The gate
is conditional: classify the change with the executable authority in
`_refs/shared/architecture-contract.mjs`, then either approve a lean
architecture snapshot or record a concrete not-applicable reason.

## Trigger boundary

Architecture is required when at least one declared signal changes a
cross-module or cross-repository boundary, public API/event/queue/topic or
persisted data-model contract, important state/data owner, security/trust
boundary, major dependency or architectural paradigm, dependency direction,
or a decision that independent implementation units could otherwise make in
conflicting ways.

Architecture is not applicable for ordinary CRUD that follows accepted
invariants, a simple four-field drawer, static copy/style work, a bounded bug
fix, docs-only or test-only work, a dependency patch that preserves
architecture, a read-only architecture map, or review of the current
architecture. Record the concrete bypass kind and rationale. Unknown or
ambiguous classification blocks; it never silently bypasses the gate.

Routing remains distinct:

- Map current architecture: `sdcorejs-explore`.
- Review architecture: `sdcorejs-review (architecture)`.
- Design architecture from an approved spec: `sdcorejs-architecture`.
- Open-ended system design: `sdcorejs-brainstorming`.
- File/task implementation planning: `sdcorejs-plan`.

## Lean spine

The approved `architecture_context` is a post-approval handoff envelope. It
records schema/source identity, the immutable approved-spec reference, the
approved architecture path/hash, semantic owner/module/execution host and
integration owner, trigger evidence, testable `INV-*` records, boundaries,
dependency directions, data/state owners, public contracts, security/trust
boundaries, cross-repository child references, adopted/deferred decisions,
assumptions, validation obligations, profile references, and revision lineage.

Each invariant records a testable statement, scope, owner, rationale,
verification method, `R-*` references, and `D-*` references. Required
architecture is not an encyclopedia, but it cannot be vacuous: it has at least
one invariant and a validation obligation. The executable validator rejects
malformed or dangling record references and requires every profile-specific
architecture reference to prove conformance to relevant invariant IDs.
Each required signal also names its relevant typed evidence: boundary signals
require boundary records, contract signals require a matching canonical
`api`/`event`/`queue`/`topic`/persisted-data-model public-contract kind,
ownership/trust/dependency signals require their matching sections, and
paradigm/conflict signals require adopted decision references.

The generic spine reuses rather than replaces:

- `_refs/shared/frontend-architecture.md` and
  `plan_context.frontend_architecture` for component/state/provider/file/test
  boundaries.
- `_refs/sdlc/ai-agent.md` and `plan_context.agent_architecture` for
  engine/capability/runtime/tool contracts.

Architecture does not own file-by-file implementation order, task sequencing,
production code, executed test evidence, or release decisions. Those remain
with plan, executor, test, and ship.

## Approval lifecycle

Write a draft under:

```text
<owner-root>/.sdcorejs/docs/architecture/<timestamp>-<topic>-architecture.md
```

After explicit approval, create the immutable snapshot under:

```text
<owner-root>/.sdcorejs/architecture/<track>/<timestamp>-<topic>.md
```

Use only `createApprovedArtifact`, `verifyApprovedArtifact`, and
`verifyApprovedArtifactGraph` from `_refs/shared/approved-artifact.mjs`. The
architecture handoff envelope records the resulting hash after creation; never
embed a self-referential hash in the hashed body and never implement a second
hash algorithm.

The required graph is approved spec -> approved architecture -> approved plan.
When the gate is concretely not applicable, the graph remains approved spec ->
approved plan. A required missing, stale, mutated, wrong-parent, wrong-path, or
wrong-hash architecture blocks planning and execution. A revision creates a
new immutable artifact whose `supersedes` identity points to the prior artifact;
it never edits the approved snapshot in place.

## Ownership

Module-internal architecture belongs to the module repository. The portal owns
only portal shell/composition/integration architecture. Cross-repository
architecture belongs to the resolved integration owner and retains immutable
child references. A missing or unwritable semantic owner blocks. Module work
has no portal fallback. The approved artifact metadata, architecture context,
and resolved repository topology must agree on execution and integration-owner
identity; duplicate, absent, or unwritable integration-owner records block.

Before plan handoff, reclassify the gate from its signals/bypass/rationale and
compare all six normalized fields (`valid`, `required`, `status`, `signals`,
`bypass`, and `rationale`). Frontend and AI-agent tracks require exact references
to their applicable `plan_context` profile blocks, whose conformance invariant
IDs must exactly match the approved architecture reference.
Use `validateArchitecturePrePlanHandoff` for this transition because no approved
plan exists yet. Plan draft self-review uses
`validateArchitectureDraftPlanHandoff`; after snapshot approval and during
execution, `validateArchitecturePlanHandoff` verifies the full immutable graph.

## Conventions

An approved architecture can be an authoritative
`approved-architecture` convention source, but this skill never writes
`.sdcorejs/conventions/**`. It may emit a candidate only. The separate
`sdcorejs-explore (conventions-sync-write-approved)` action is the sole writer.
Observed or inferred preferences never become accepted automatically, and
public compatibility, migration, and deprecation obligations remain intact.
