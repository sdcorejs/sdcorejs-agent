# Canonical Finish Gate

Every code-writing change reaches this mandatory gate; prompts are conditional
on unresolved decisions. Reuse explicit choices and verified plan policy before
asking. A small fix with sufficient decisions does not answer four questions.
Test strategy belongs in planning/implementation. TDD RED precedes the
corresponding production write; tests added after generation are post-hoc.
Finish choices never remove required tests, acceptance criteria or evidence.

## Executable completion path

`_refs/shared/finish-gate.mjs:resolveFinish` is the one completion resolver.
Generic, NestJS and AI-agent callers use `completeExecution` in
`_refs/orchestration/execution-contract.mjs`; Angular/Next.js use
`completeAngularExecution` / `completeNextjsExecution` in their execution
contracts. Keep implementation preflight separate from completion: preflight
never requires future postflight evidence. Call completion after each owner
action and consume its actual `next_actions`; do not maintain a stack-local order.

Each next action names `phase`, `owner` and `intent`. `phase` is the only
receipt key: record exactly one receipt at `phase_receipts[<phase>]` with
`runtime.run(phase)` for a command phase, `runtime.recordHook(phase, before)`
for a hook, `runtime.recordSimplify(token, receipt)` for a runner simplify pass
and `runtime.run('simplify')` for a session simplify pass. Owners come from one
table: `baseline` and `reverify` → `sdcorejs-test`; `simplify` →
`sdcorejs-simplify`; `review`, `unit-review-a` and `unit-review-b` →
`sdcorejs-review`; `repair` → `sdcorejs-repair-loop`; `verify` and
`branch-ready` → `sdcorejs-ship`. A hook uses the owner its policy entry
declares; a phase without an owner blocks. `intent: produce` creates the first
receipt. `intent: refresh` replaces a stale one: a command phase only reruns its
check, a hook reruns inside its `paths`, and `repair` reruns its verification
without editing code again. An invalid receipt blocks and names the phase to run again.

The parent/integration owner runs final finish once per change. Workers return
current unit verification and Stage A/B review as `unit-complete`, without
finish prompts or shared docs/backlog/memory tail. Preserve stack test/security/UI hooks.

## Decisions

Use `_refs/shared/user-choice-prompt.md`: native-first requires current tool
exposure plus action/mode permission; a failed picker falls back once with the
same identity/options. Spec and plan approvals remain separate. Silence,
thanks, preselection, recommendation and visual feedback never approve.

- Simplify `skip`: never dispatch. `analyze`: report without source writes.
  `apply`: explicit invocation opt-in plus hardened v2 preflight/postflight in
  `_refs/simplify/verification.md`. User scope, approved allowed paths and
  actual eligible source/hunks intersect. Missing oracle means Analyze-only.
  Observed no eligible scope/no-op reports its reason without prompting.
  Unknown eligibility never authorizes Apply. Never simplify again after repair.
  The simplify root/owner/change/revision and paths must match this finish scope.
  The pure resolver returns Apply with `preflight_required: true` and no write
  permission. `completeExecution` issues the hardened preflight in the execution
  owner; Angular/Next.js use that same entrypoint. An authorized Apply action
  carries its actual `preflight_ref`. The owner
  consumes that grant through the existing simplify session; do not run preflight
  a second time or invent a receipt. Complete/rollback that pending pass before
  asking the resolver for the next action. The resolver itself never edits source.
  Without a host session for this root/change and without a session
  `simplify_context`, Apply routes to the canonical host runner
  (`runner: host-runner`, `source_write_allowed: false`) when the observation
  runtime has a host `simplify_verifier`; a host session is never bypassed by
  dropping its `simplify_context`, and a `simplify_context` without its host
  session blocks. Inject
  `createFinishSimplifyVerifier({ step_id })` from `_refs/simplify/host-runner.mjs`.
  `runtime.beginSimplify()` returns a one-time token, the host-snapshot anchor
  (taken before the first dispatch and shared by the chain) and the verified
  `chain`; the host runs `_refs/simplify/host-runner.mjs` with that chain as
  `prior_receipts`, then `runtime.recordSimplify(token, receipt | null)` verifies
  the dispatch and its proof goes to `phase_receipts.simplify`. A verified
  dispatch or a completed session pass (verified or rolled back) without that
  proof blocks; it never reopens Apply, and neither a `skip` resolution nor a
  repair receipt can hide it.
  Simplify state comes from the host, never the payload: the session registry
  for this root/change and the runner dispatch records. A pending, failed, open
  or crashed pass blocks even when `simplify_context` is omitted. Default skip
  applies only when no source is eligible, no choice resolved and the host holds
  no pass. Analyze needs current analysis; Apply needs current verification.
  `tail-complete` reports `simplify`, `simplify_source` (`explicit`,
  `verified-plan` or `not-eligible`) and `simplify_outcome` (`simplified`,
  `unchanged`, `reverted`, `analyzed` or `skipped`).
- Review `review-only`: read-only assessment, no repair or UI auto-fix.
  `review-and-repair`: route selected findings to existing owner/tier/scope
  authority; it does not grant unlimited finding repair.
- Review `skip` label: **Skip review and continue verification**. Required
  review/tests/acceptance/Design/UI gaps still block. No Git/deploy permission.
- `defer`: stop the remaining tail and never claim done. Prior proof remains
  history; explicit resume must resolve current scope/authority.
- Reuse authorized docs/test policy. Preferences may govern existing updates
  but never create missing guides or technical docs. Creation still uses
  `_refs/documentation/gate.md`; required delivery artifacts are independent.

## Order and evidence

Baseline/test → optional simplify → affected re-verification → selected
review/repair → authorized write-producing hooks → revalidate affected evidence
→ verify-before-done → final read-only branch-ready.

Hooks include source documentation, approved user/technical docs, required
execution/traceability records, owned backlog/memory/convention sync and mirrors
where applicable. The owning workflow and exact scope authorize each write;
this list or a preference does not. Merge every producer's `artifact_context`.
Rebuild a guide aggregate exactly once after all authorized module guide updates,
only when a guide changed, it was requested, or it is stale inside approved scope.
Review returns assessment and the original `review_context`; repair receives
that selected-finding context and returns scoped results/invalidation to the
same parent. Neither starts a new finish ceremony.

Use existing repository observation, hashing and command-receipt infrastructure.
`createRepositoryObservationRuntime` in `repository-observation.mjs` carries
host-read policy and proof; it is not a portable authorization store.
`load_plan` reads the actual immutable plan and parents. Its `finish-policy`
JSON fence binds `schema_version: 1`, `scope_fingerprint`, `test_strategy`,
`required_phases`, `decisions`, `hooks` and optional `volatile_paths`. Hook
entries name `id`, semantic `owner`, exact `paths` and optional source `inputs`.
Plan metadata still limits paths. Missing source/verifier blocks; never
fabricate receipts or PASS flags.

Observation hashes tracked and untracked non-ignored files. It records only
`lstat` metadata for ignored entries, links (with their `readlink` target, never
followed) and nested worktrees; a nested `.git` is one entry and is not entered.
Every metadata change is a write. Finish scope, hook paths/inputs, command
scopes, simplify scope and UI paths, and their parents, must not be links.

`volatile_paths` lists exact paths or `dir/**` patterns for ignored command
output such as caches. A pattern may match ignored metadata entries only and
may not intersect the finish scope, hook paths/inputs, command scopes, simplify
scope or an edit set. One host ledger per root and change records their state
for every runtime. Host command windows (`runtime.run`, simplify verification,
UI `run_command`) and a runner dispatch may change them; hooks, simplify writes
and rollback may not. Any other change blocks with "volatile path changed
outside a host command window". `stable_fingerprint` excludes volatile entries
and backs every currency check. A direct-fix `policy` binds the same list.

Host-selected command specs have a non-empty argument-array `command`, `cwd`
and exact input `scope`. `runtime.run(phase)` executes the command and records
exit/interruption, output digest, owner and before/after content identity.
A read-only command that writes cannot prove PASS. Review/repair commands must
verify actual assessment/repair artifacts and required checks; arbitrary zero
exit is not review proof. The observation runtime's `read_review` reads the real current owner-bound
assessment and its blocking findings; `run('review')` binds its digest to the
receipt. Changing the loaded assessment requires reviewing again.

Before an authorized external hook write obtain `runtime.snapshot()`. Afterwards
`recordHook(id, beforeFingerprint)` observes the actual approved-path changes;
it records writes and does not grant them. TDD requires actual failing `red`
evidence before the observed `implementation` hook, never retrospective RED.
Every command declares all source/config/test/evidence inputs it checks.
Changed inputs stale proof even at the same HEAD. Progress records preserve
completed phases, then affected checks rerun after writes. Final verify and
branch-ready cover the final scope. Any later write requires affected checks
and branch-ready again. PASS means focused verification ran, not semantic equivalence.

## Canonical payload

Fill `choices.simplify` / `choices.review` using the interaction schema, gates
`finish:simplify` / `finish:review`, `approval: false`, and stable values above.
The host binds owner/change/scope. Empty choices remain unresolved unless
observed no-op applicability removes that optional choice.

```yaml
finish_context:
  schema_version: 1
  identity:
    change_ref: example-change
    owner_repository_id: github.com/example/app
    integration_owner_repository_id: github.com/example/app
    scope_fingerprint: sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
  actor: { role: integration, repository_id: github.com/example/app }
  choices: {}
  phase_receipts: {}
  simplify_context: null
```

Statuses: `pending-choice`, `pending-action`, `blocked`, `deferred`,
`unit-complete`, `tail-complete`. Only the last carries `branch_ready: true`.
Invalid phase records block; serialized status never overrides observation.
Portable `state_delta.finish_context` must agree with the producer context.
Recipients re-read authority and current content. Legacy direct-call inputs
remain compatible but cannot become completed-tail proof. No bulk migration.
`sdcorejs-git` is outside this tail: no automatic commit/push/PR/deploy.
A user Git request still needs current verification, branch-ready and closure.

### Policy and compatibility adapter

Required phases are `baseline`, `review` when required, `verify` and
`branch-ready`; unknown phase IDs block instead of dropping checks. Place
additional required tests in the host command for the applicable phase. Each
final command covers the complete exact finish scope and its other inputs.
Hooks cannot collide with phase IDs, escape allowed paths or intersect prohibited
paths. Directory creation is a write; only authorized path ancestors are allowed.

For a direct small fix without a plan, the same runtime accepts `policy` and
`policy_decision` (canonical interaction_context) plus `read_response`.
The decision has gate `finish:policy`, current HEAD as revision, exact owner,
change/scope fingerprint and an explicitly selected option whose value is
`sha256:` plus SHA-256 of `JSON.stringify(policy)`. Bind the actual user event
when resolving those stated decisions; no synthesized approval or status flag.
`finish:policy` grants authority, so it is always asked: a single option never
auto-selects, delegation and recommendations never resolve it, and a verified
plan cannot preselect it. The prompt shows the policy, including `volatile_paths`.
This adapter reuses existing context and explicit authority, creates no plan or
state store, and grants no new docs/source scope. Missing authority blocks.

Legacy plans without the fence are not rewritten or silently upgraded. The
host can normalize already explicit scope-bound policy through the direct
adapter only within the unchanged approved allowed/prohibited paths; an actual
scope change returns to plan approval. Do not load a missing or mutated plan
as a direct fix to bypass its authority.

Example policy (the fingerprint uses sorted exact repository-relative paths):

```json
{"schema_version":1,"scope_fingerprint":"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","test_strategy":"regression-first","required_phases":["baseline","verify","branch-ready"],"decisions":{"simplify":"skip","review":"review-only"},"hooks":[]}
```
