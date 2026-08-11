# Decision Coverage Contract

Use this contract whenever requirements, acceptance criteria, assumptions,
decisions, and invariants must remain traceable across artifact revisions. The
executable source of truth is `_refs/shared/decision-coverage.mjs`; it is pure,
deterministic, and performs no repository writes.

## Stable typed identities

Every record has one permanent, globally unique identity and one matching
type. IDs are case-sensitive and use exactly three digits:

| Example | Type | Purpose |
|---|---|---|
| `R-001` | `requirement` | Required behavior or constraint |
| `AC-001` | `acceptance-criterion` | Observable proof of a requirement |
| `A-001` | `assumption` | Explicit fact awaiting confirmation or revisit |
| `D-001` | `decision` | Chosen direction with downstream effect |
| `INV-001` | `invariant` | Condition that protected work must preserve |

Forms such as `R-1`, `r-001`, `AC1`, and `AC-1` are not canonical. Consumers
must reject them rather than repair them. There is no silent renumbering,
normalization, or reuse. A normalization attempt that would collide with an
existing identity is an explicit error.

## Canonical schema

```yaml
decision_coverage:
  schema_version: 1
  revision: 1
  records:
    - id: R-001
      type: requirement
      statement: <required behavior>
      source: explicit-user
      status: active
      owner_repository_id: <stable repository id>
      owner_module_id: <module id or null>
      task_refs: [TASK-001]
    - id: AC-001
      type: acceptance-criterion
      statement: <observable result>
      behavior: <observable behavior>
      expected_result: <testable result>
      verification_kind: automated
      blocking: true
      requirement_refs: [R-001]
      task_refs: [TASK-002]
    - id: A-001
      type: assumption
      statement: <explicit assumption>
      source: explicit
      confidence: high
      status: confirmed
      blocking: false
      evidence_refs: [EVIDENCE-002]
      consequence_if_wrong: <impact>
      validation_method: <how to validate>
      owner: <validation owner>
      rationale: <why this assumption is retained>
      impacted_refs: [R-001]
    - id: D-001
      type: decision
      statement: <chosen direction>
      question: <decision being made>
      selected_value: <chosen value>
      source: approved-spec
      status: approved
      blocking: true
      scope: repository
      owner_repository_id: <stable repository id>
      rationale: <why this value was selected>
      supersedes: null
      revisit_condition: null
      convention_impact:
        candidate: false
        category: null
      downstream_refs: [R-001, AC-001, INV-001]
      task_refs: [TASK-001]
      validation_boundary:
        kind: authorization
        source_refs: [R-001, AC-001, INV-001]
    - id: INV-001
      type: invariant
      statement: <condition that must remain true>
      protected_refs: [R-001, AC-001]
      task_refs: [TASK-001, TASK-002]
      evidence_refs: [EVIDENCE-001]
  history:
    - revision: 1
      active:
        - { id: R-001, type: requirement }
        - { id: AC-001, type: acceptance-criterion }
        - { id: A-001, type: assumption }
        - { id: D-001, type: decision }
        - { id: INV-001, type: invariant }
      tombstones: []
  approved_artifact:
    metadata:
      artifact_kind: plan
      contract_id: decision-coverage:v1
      approval_source: user-approved-decision-coverage
      approved_by: <safe approving identity>
      source_revision: <40-character revision>
      approval_hash: sha256:v1:<64 lowercase hex>
    body: <canonical schema/revision/records/history projection>
```

Records and each history `active` snapshot use this deterministic order:
requirements, acceptance criteria, assumptions, decisions, then invariants;
each type is ordered by its numeric suffix. Validators report a noncanonical
order and never reorder the caller's input.

Validation-map authority additionally calls `verifyDecisionCoverageApproval`.
The approved-artifact hash and canonical body bind the complete records and
history projection to an approving identity and source revision. Mutating a
decision boundary and a validation row together without a newly approved
artifact is stale authority and blocks with
`DECISION_COVERAGE_APPROVAL_INVALID`.

## Coverage and references

- Requirements use source `explicit-user | approved-artifact |
  authoritative-contract`, status `active | superseded | deferred`, and an
  explicit repository/module owner.
- Acceptance criteria retain distinct observable `behavior`, testable
  `expected_result`, `verification_kind: automated | manual | deferred`, and
  `blocking: true`; a prose statement alone is not acceptance coverage.
- References are exact IDs. Duplicate, dangling, malformed, and wrong-type
  references fail closed.
- Every acceptance criterion has at least one `requirement_refs` entry and at
  least one planned `task_refs` entry.
- Every requirement maps to at least one planned task.
- Every decision lists at least one other active record in `downstream_refs`.
- Every invariant lists protected records, enforcing tasks, and planned
  evidence. Omitting any of the three blocks coverage.
- External task and evidence references are non-empty stable strings. The
  decision-coverage contract does not renumber identities owned by another
  artifact.

## Assumptions, decisions, and execution

Assumption source is `inferred | defaulted | explicit`, confidence is `high |
medium | low | unknown`, status is `proposed | confirmed | validated |
invalidated | deferred`, and `blocking` is always explicit. Every assumption
retains evidence, consequence, validation method, and owner. A deferred
non-blocking assumption additionally retains rationale, a testable
`revisit_condition`, and non-empty `impacted_refs`.

Decisions retain the question, selected value, canonical source, status,
blocking flag, scope, repository owner, rationale, supersession identity, and
convention impact. Decision status is `proposed | approved | superseded |
deferred`; a blocking decision is resolved only when `approved`. A deferred
non-blocking decision requires a testable `revisit_condition`.

A proposed, invalidated, or deferred blocking assumption and any non-approved
blocking decision are deterministic blockers at spec, plan, and execution
gates. Deferral never erases a blocking consequence.

## Revision and tombstone continuity

`revision` starts at 1. `history` contains a complete snapshot for every
revision with no gaps. When an active ID is removed, the next snapshot retains
a tombstone with the same ID and type, the original `retired_revision`, and a
non-empty reason. Every later snapshot retains that tombstone unchanged.
The first snapshot containing a tombstone must follow a snapshot where that ID
was active, and `retired_revision` must equal the first tombstone snapshot's
revision. A tombstone cannot appear without that immediately preceding active
identity.

A tombstoned ID never becomes active again and never changes type. A replacement
receives a new ID while the retired identity remains in history. These rules
make deletion, renumbering, and reuse observable across revisions.

## Stage-aware validation

Validate with one explicit `stage`: `discovery`, `spec`, `plan`, or
`execution`. Identity, type, ordering, reference, assumption, revision, and
tombstone failures are structural at every stage. At `discovery` and `spec`,
only task/evidence mappings that cannot exist until planning are reported in
the sorted `future_gaps` projection; they do not invalidate an otherwise sound
graph. Those same gaps fail closed at `plan` and `execution`. A blocking
assumption always keeps `execution_ready` false.

Legacy `{ mode: planning | execution }` is accepted only as an input adapter.
New producers use `stage`, and canonical results include `validation_stage`,
`future_gaps`, and `future_gap_messages` so upstream work is never mistaken for
an execution-ready plan.

## Goal-backward plan review

`sdcorejs-plan:goal-backward` is a checker mode owned by `sdcorejs-plan`; it is
not a separate public skill. The checker consumes the exact plan-stage
`decision_coverage` object and works backward from goals and covered records to
tasks, paths, and evidence:

```yaml
goal_backward_review:
  schema_version: 1
  mode: sdcorejs-plan:goal-backward
  decision_coverage: <exact plan_context.decision_coverage object>
  goals:
    - id: G-001
      statement: <approved outcome>
      task_refs: [TASK-001]
  tasks:
    - id: TASK-001
      owner_repository_id: <stable repository id>
      dependencies: []
      planned_paths: [src/example.ts]
      planned_evidence:
        - id: EVIDENCE-001
          record_refs: [R-001, AC-001, INV-001]
      justification_refs: [R-001, D-001]
      enforces_invariant_refs: [INV-001]
  repository_inventory:
    repositories:
      - repository_id: <stable repository id>
        existing_paths: []
        intended_new_paths:
          - path: src/example.ts
            owner_task_id: TASK-001
  critique_history:
    - round: 1
      checker_version: sdcorejs-plan:goal-backward:v1
      blockers: []
      resolved_blockers: []
      unresolved_blockers: []
```

Goal IDs, task IDs, and evidence IDs use exact `G-###`, `TASK-###`, and
`EVIDENCE-###` forms. Every goal and each requirement, acceptance criterion,
decision, and invariant must map to an existing justified task. Every task has
one repository owner, explicit dependencies, paths, evidence, and at least one
valid requirement or decision justification. Dependencies must exist and be
acyclic. Evidence references must exist, be globally unique, and map the
records claimed by the plan. Every acceptance criterion appears in at least one
planned evidence record owned by a task in that criterion's `task_refs`. Every
invariant maps to both an enforcing task and its declared evidence. The decision
records, goals, tasks, and repository inventory must each be non-empty; a
vacuous graph cannot be approved or execution-ready.

Path classification is derived, never trusted from prose. A path is
`existing` only when it appears in the matching repository inventory. It is
`intended-new` only when exactly one declaration names the current task as
owner. All task and inventory paths must already be safe normalized
repository-relative paths using forward slashes; absolute, drive-qualified,
backslash, empty-segment, dot-segment, and traversal forms are rejected.
Otherwise a path is `missing`. Conflicting classification, duplicate,
ambiguous, dangling, or mismatched ownership blocks approval.

Self-critique history is auditable and capped at three rounds. Rounds are
contiguous and use checker version `sdcorejs-plan:goal-backward:v1`. Each
identified blocker appears in exactly one of `resolved_blockers` or
`unresolved_blockers`; unresolved blockers carry into the next round. A fourth
round is forbidden, and unresolved blockers at round three block approval and
execution. Results expose deterministic blocker ordering plus structured
record, goal, task, path, evidence, invariant, and critique projections.

## Executable API

- `canonicalDecisionRecordId(type, sequence)` creates a new exact identity; it
  does not transform caller input.
- `validateDecisionCoverage(value, { stage })` returns stable sorted errors,
  blockers, future gaps, and execution readiness without mutation.
- `assertDecisionCoverage(value, { stage: 'execution' })` throws one
  deterministic aggregate when any structural error or blocker remains.
- `validateGoalBackwardPlan(value)` returns approval/execution readiness,
  deterministic blockers, and structured coverage projections.
- `assertGoalBackwardPlan(value)` throws one deterministic aggregate until the
  plan review is approval-ready.
