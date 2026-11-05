# Session authority and proportional execution

Use at classification, every skill transition, finish gate and Git handoff.
Current explicit user instructions outrank defaults. Read `classifyTask` and
`assessChangeBaseline` in `_refs/harness/runtime-policy.mjs`; small line counts
never override authorization, tenant, public-contract or data-completeness risk.

## Carry authority, not assumed approvals

Carry the actual request/decision reference, actor when exposed, action, owner,
allowed scope, exclusions and remaining decisions in runtime context. An explicit
request to fix, verify, review, commit and update a PR authorizes that sequence
within the agreed change; changing skill, turn or phase does not reset it.
Approval for analysis never authorizes mutation. A draft never authorizes
publication, scheduling, messaging or deployment. Scope expansion, destructive
operations and unapproved external effects still need their own decision.

When the user explicitly delegates spec/plan completion and execution within a
bounded scope, author concrete documents and self-review them, then execute.
Record `approval_source: delegated-session-scope`, the real instruction reference,
and `document_review_performed: false`; never invent an Approve response or say
the user reviewed the generated document. Silence is never delegation.
Without such authority, preserve the ordinary explicit spec/plan approval gate.

## Fast-fix and finish

Classify before requiring artifacts. A confirmed, owned, low-risk bounded fix
uses targeted reads, minimal edits, focused verification and concise review;
it needs no artificial spec/architecture/plan. Keep existing tests when they
prove the risk; add meaningful regression where needed, not tests mirroring
formatting or type declarations. Non-trivial/high-risk work uses the governed
workflow even when only one line changes. Plain stack profiles remain plain.

The finish gate is a mandatory assessment, not a mandatory questionnaire.
Reuse authorized tests/review/repair/docs/Git choices across the session. Execute
necessary scoped verification and review; report outcomes and unavailable checks.
Ask only for material unresolved choices or additional effects. Optional
simplification is opt-in; do not ask a four-step menu for every caption or fix.
Explicitly requested simplification still requires a green behavior oracle.
Complete authorized writes before final read-only branch-ready; a later write
invalidates readiness. Reuse evidence only while its source/environment and
scope identities remain valid. Never call a skip a pass.

## Dirty state

Capture HEAD, index/worktree diff and task-owned hunks before edits. Same-change
hunks already assigned to this task can proceed within authority after baseline
and recovery capture. Unrelated disjoint edits remain untouched and unstaged;
they do not alone require consent. Unknown ownership or overlapping unrelated
hunks block the affected writes; continue independent read-only diagnosis.
Never auto-stash/reset/restore user work. Rollback restores only this operation's
changes to its captured pre-operation state, including authorized dirty edits.

Use `evaluateWorkingTree` from `_refs/orchestration/execution-contract.mjs` for
path overlap. Hunk provenance and baseline identity must come from inspection,
not a caller declaring every dirty file to be same-change.
