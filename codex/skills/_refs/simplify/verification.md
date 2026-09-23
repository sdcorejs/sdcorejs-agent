# Simplify Verification and Runtime Evidence

## Contents

- [Preflight and baseline](#preflight-and-the-green-baseline)
- [Scope and observed content](#scope-and-observed-content)
- [Apply and postflight](#apply-discipline-and-post-change-verification)
- [Git boundary](#git-boundary)
- [Canonical runtime schema](#runtime-simplify_context)
- [Downstream and compatibility](#downstream-integration-and-compatibility)

## Preflight and the green baseline

The canonical payload is `simplify_context` schema **2** below. Validate it with
`validateSimplifyContext`, then call `evaluateSimplifyPreflight(context, { session })`
**before editing**. Preflight checks authority, semantic owner, real Git root,
source/hunk eligibility, protected boundaries and current baseline verification.
It does not require after-edit receipts or claim a verified result.

The trusted host creates `createSimplifyEvidenceSession` from
`repository-evidence.mjs`. Host options are authority inputs, never deserialized
from agent-generated context:

- `root`, `repository_id`, `owner_module_id` (null when standalone),
  `execution_host_repository_id`, `change_ref`;
- `user_scope`: approved `{path, start_line, end_line}` ranges;
- optional `approved_plan`: canonical `artifact`, loaded `parents`, independently
  resolved `approval_hash`, `step_id` and trusted `resolve_step({artifact,
  step_id})`. This host adapter must parse the verified artifact body and return
  that exact step's `step_id`, owner, `allowed_paths` and `prohibited_paths`.
  Reuse the host's canonical plan loader for its JSON/YAML/Markdown format;
  never return an agent-supplied step projection. Unsupported format means
  Analyze-only, without rewriting the approved artifact. The canonical helper
  verifies the graph, owner, revision and scope; hashing alone is not approval;
- `classify_source({path, content, fingerprint})`: a trusted project adapter
  returning `kind: executable`, eligible `hunks`, and `protected_surfaces`.
  Unknown applicability or any protected responsibility blocks Apply;
- `user_owned_hunks` and `workflow_hunks`: trusted ownership resolution. Dirty
  source is protected unless the host proves the selected workflow-owned hunks;
- `verification_commands`: nonempty `{command: [executable, ...arguments], cwd,
  scope: [hunks]}` specifications discovered from the repository;
- `verify_preservation({before, after, changed_paths, before_fingerprint,
  after_fingerprint})`: a trusted content inspector returning every preservation
  surface as `{status: verified | not-applicable | blocked, reason}`. Strings,
  prompts, dependencies and configuration always require verification.

These adapters must inspect the actual supplied bytes and applicable project
contracts. A callback that returns unconditional success is not a preservation
oracle. The generic helper cannot establish language/domain behavior by itself.
Missing runnable behavior or preservation oracle means **Analyze-only**. There
is no limited-write override in v2. Do not invent receipts, install dependencies,
read ambient credentials or call paid/live providers to make the gate pass.

Capture `baseline.snapshot` with `session.captureSnapshot()`. Run each host
command with `session.runVerification(spec)` and place the returned references
in `verification.before`. Each real receipt binds nonempty argument-array
command, cwd, owner/root, exit code, scope, HEAD, whole observed content
fingerprint, start/finish time, host event sequence and output digest. After
receipts must follow the actual preflight or failed-pass event; old baseline
receipts cannot pretend to be a rerun after rollback. Source mutation during a
command makes its receipt fail. Matching HEAD alone is never current evidence.

## Scope and observed content

Every write must belong to the intersection of user-authorized scope, approved
plan allowed paths (when present), eligible executable source/hunks and the
current-diff boundary when selected. Paths use strict repository-relative POSIX
spelling. Traversal, drive/UNC/absolute paths, aliases and alternate streams,
symlink containment, nested Git roots and sibling-prefix matches fail closed.
Plan patterns support exact files or directory `/**` boundaries only.

The host inventories the whole root, including tracked, staged, unstaged,
untracked and ignored output, before filtering scope. Snapshots bind bytes,
file modes, index and HEAD. Root Git administrative files are excluded; Git
index/HEAD changes are separately forbidden. Unknown, racing, binary or
oversized inventories/hunk mappings fail closed. Limits are 100,000 entries and
128 MiB per observation; choose Analyze or a purpose-built trusted adapter for
larger roots, never silently omit evidence inputs. Raw baseline bytes stay in
host memory; temporary diff inputs stay outside the repository and are removed.
No dependency or credential directory is silently excluded from freshness.

Hunks use one-based inclusive lines in the **pre-pass snapshot**. Actual diff
hunks retain old/new coordinates; insertion anchors and deletions are checked
against those ranges. Later passes must select coordinates from their current
checkpoint. Line shifts in partial or user-owned ranges fail closed pending
fresh authority; never reuse old line numbers to reach adjacent content.
File additions/deletions/renames and mode changes require
planning. A changed path omitted from the payload is still checked. Whole-file
edits must preserve adjacent user-owned bytes. Scope expansion records a reason
and returns to the authority owner for a new scoped approval; recording it is
not permission, and cannot override protected boundaries or the pass caps.

## Apply discipline and post-change verification

`evaluateSimplifyPreflight` returns an opaque `preflight_ref`. Only an authorized
Apply result allows `session.applyEdits(ref, [{path, content}])`. The edit boundary
rechecks the snapshot and proposed actual hunks immediately before a synchronous
batch. The host must retain exclusive edit ownership; this helper is not an OS
filesystem sandbox. Direct/editor writes are still inspected by postflight and
cannot acquire retrospective authority.

Use at most two passes, five files per pass, eight files in total and twenty
actual hunks. The host owns the sequential ledger. Copy `session.ledger()`;
do not construct, omit or reset entries. The same root/change cannot create a
second session to reset history. A restarted process cannot resume write or
verification claims from serialized context; obtain fresh host authority and
revalidate the change's retained history before continuing.

After each write, affected test, review, simplify and ship evidence is **stale**.
Set `phase: postflight`, copy the real preflight reference and current ledger,
rerun the same commands into `verification.after`, and call
`evaluateSimplifyPostflight(context, {session})`. It compares all actual changes,
checks content-bound preservation, runs `git diff --check` (also staged), and
issues the completion receipt. Use its returned `context` unchanged for handoff.
Completed pass authority cannot be replayed to clear a later pending/failed pass.
Postflight never grants write permission. A PASS describes focused checks that
ran on these bytes; it does not prove semantic equivalence for arbitrary code.

If a pass fails, stop. Restore only its owned changes using **exact scoped edits**
from the pre-pass snapshot, preserving user changes. A `reverted: true` claim is
insufficient: rerun verification and postflight against the actual restored
snapshot. The failed pass consumes its number. An unreverted failure blocks the
next pass and repair. `session.recordRepair()` marks the terminal repair event;
repair writes invalidate completion and cannot trigger another simplify pass.

## Git boundary

**Git writes are forbidden.** Read-only status, diff, show and inspection are
allowed. Never use `git add`, `git commit`, `git push`, `git checkout`,
`git switch`, `git reset`, `git restore`, `git clean`, `git stash`, `git merge`,
`git rebase` or `git tag` in simplify. Git artifacts belong to `sdcorejs-git`.

## Runtime `simplify_context`

This is the executable preflight template. Bind placeholders to the trusted
host's identity and issued references; empty after evidence is intentional.
Actions are `analyze-current-diff`, `apply-current-diff`,
`analyze-explicit-scope`, `apply-explicit-scope` or `planning-handoff`.
Invocation is `direct`, `finish-gate` or `approved-plan`. The target kind is
`target-project`, `sdcorejs-agent-authoring-repo`, `skill-pack-authoring-repo` or
`unknown`. Unknown ownership/eligibility cannot authorize Apply.

```yaml
simplify_context:
  schema_version: 2
  source: sdcorejs-simplify
  phase: preflight
  session_id: <host session id>
  action: apply-explicit-scope
  invocation: direct
  artifact_identity:
    owner_repository_id: <stable owner repository id>
    owner_module_id: null
    execution_host_repository_id: <stable host repository id>
  source_revision: <actual owner HEAD>
  approved_plan_step: null
  target_root: <absolute real Git root>
  target_root_kind: target-project
  baseline:
    snapshot: null
  preflight_ref: null
  scope:
    requested: []
    eligible_files: []
    eligible_hunks: []
    excluded: []
    expansions: []
  preserved_surfaces:
    return_values: pending
    output_shape: pending
    public_exports: pending
    public_types: pending
    public_API_and_signatures: pending
    routes_status_errors_validation_order: pending
    side_effects_and_order: pending
    async_concurrency_transaction: pending
    retry_timeout_cache: pending
    auth_permissions_tenant_approval: pending
    persistence_and_query: pending
    rendering_DOM_accessibility: pending
    telemetry_and_audit: pending
    strings_and_prompts: pending
    framework_metadata: pending
    dependencies_and_config: pending
  limits:
    max_passes: 2
    max_files_per_pass: 5
    max_total_files_without_reconfirmation: 8
    max_hunks_without_reconfirmation: 20
  passes: []
  result:
    status: pending
    files_changed: []
    receipt: null
  verification:
    before: []
    after: []
    preservation: null
    behavior_verification: not-verified
    git_diff_check: not-run
    blockers: []
    risks: []
  artifact_context:
    schema_version: 1
    change_ref: <change identity>
    source_spec: none
    source_plan: none
    required_with_change: []
    shared_owned: []
    conditional: []
    local_only: []
    unrelated_observed: []
```

All snapshot/command/preservation/completion references have exactly
`{artifact_ref, approval_hash}`. An approved-plan step reference additionally
has `step_id`. Evidence uses existing canonical approved-artifact hashing and
the shared evidence resolver; only artifacts issued by the live trusted session
can satisfy this boundary. A self-hashed JSON object cannot manufacture evidence.

Each host-issued pass has `pass`, `preflight_ref`, `before_snapshot`,
`after_snapshot` (null before observation), `changed_paths`, actual `hunks`,
`verification_result: passed | failed | not-run`, `reverted`,
`rollback_snapshot` (null before rollback) and `rollback_receipts` (initially []).
Successful rollback preserves the failed result and original attempted paths;
it appends separate rollback evidence and does not refund the pass/file/hunk cap.
Rejected actual diffs retain their observed hunks, including cap violations.
If snapshot or hunk observation is incomplete, further Apply requires an
authority handoff even after exact rollback; unknown history is never zero cost.
Each actual hunk has `path`, `old_start`, `old_count`, `new_start`, `new_count`.
Result status is `pending | analyzed | simplified | unchanged | blocked | reverted`.
Preservation status is `pending | verified | blocked | not-applicable`.
Verification uses `covered-by-current-tests | not-verified`; `limited` exists
only on legacy read-only adaptation. Helper verdict `authorized` means preflight
permission; `verified` means current focused postflight evidence, never semantic
proof or permission to continue editing.

## Downstream integration and compatibility

`evaluateSimplifyContract` is the version/phase dispatcher. Both historical v1
payload shapes are recognized by `adaptLegacySimplifyContext`, retained unchanged
as `original_context`, and marked read-only/unverified. Do not migrate immutable
approved artifacts or silently reinterpret uppercase and lowercase v1 enums.
Capture a new v2 run to authorize writes or claim current evidence.

`evaluateSimplifyConsumer(context, {session, consumer})` is the common consumer
check. Portable handoff uses the same full documented payload and validates
schema at transport; the receiving host must separately resolve the original
session and recheck content. A portable hash or matching HEAD is not authority.

- Test accepts stale context for revalidation, keeps before/after runs distinct,
  and cannot relabel old verification as current or change test expectations.
- Review and ship block stale post-simplification evidence, protected drift,
  unreverted failed passes, and `behavior_verification: not-verified` for Apply.
- Repair keeps the original context, consumes it diagnostically after rollback,
  records its terminal event and appends fresh repair evidence. Neither workflow
  recursively invokes the other. There is no automatic simplify after repair.
- Git consumes verified final evidence; raw snapshots, prompts, temporary data
  and runtime context remain `local_only` and must not be staged.

No durable simplification report is created by default. Explicit handoffs follow
artifact lifecycle rules and redact sensitive data. Report exact command/results,
changed paths, rollback, blockers and skipped checks without echoing raw logs.
