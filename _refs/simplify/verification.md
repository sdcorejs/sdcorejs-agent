# Simplify Verification and Runtime Evidence

## Contents

- [Preflight and baseline](#preflight-and-the-green-baseline)
- [Scope and observed content](#scope-and-observed-content)
- [Apply and postflight](#apply-discipline-and-post-change-verification)
- [Host runner](#host-runner)
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

The host inventories the whole root before filtering scope, through the shared
`captureRepository` observer. The content layer hashes tracked and untracked
non-ignored files and binds bytes, file modes, index and HEAD. The metadata
layer records only `lstat` data for ignored entries, links (with their
`readlink` target, never followed) and nested worktrees; a nested `.git` is one
`nested-repository` entry and is not entered. Every metadata change is a write.
Root Git administrative files are excluded; Git index/HEAD changes are
separately forbidden. Scope and verification-command paths, and their parents,
must not be links. Unknown, racing, binary or oversized inventories/hunk
mappings fail closed. Content limits are 100,000 entries and 128 MiB per
observation; the metadata layer allows 1,000,000 entries. Choose Analyze or a
purpose-built trusted adapter for larger roots, never silently omit evidence
inputs. Raw baseline bytes stay in host memory; temporary diff inputs stay
outside the repository and are removed. No dependency or credential directory
is silently excluded from freshness.

`volatile_paths` (the session option, or the plan's `finish-policy` list for the
host runner) names ignored command output that verification may rewrite.
Patterns are exact paths or `dir/**`, match ignored metadata only and never
intersect the simplify scope, command scopes or an edit set. Only
`session.runVerification` windows may change them; `applyEdits` and rollback
may not, and a change outside a host command window blocks. The
`stable_fingerprint`, which excludes volatile entries, backs every currency check.

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
batch. Every host write target (`applyEdits`, rollback) must have a link count
of 1 before any byte is written. The host must retain exclusive edit ownership;
this helper is not an OS filesystem sandbox. Direct/editor writes are still
inspected by postflight and cannot acquire retrospective authority.

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
checks content-bound preservation, and issues the completion receipt. Its
whitespace check covers only the lines the pass added to its pass paths (the
eligible files plus the edit set), compared with the checkpoint bytes and the
repository rules (`core.whitespace`, `.gitattributes` whitespace/eol). CRLF files
are not misreported, and whitespace outside the pass does not count. Use the
returned `context` unchanged for handoff. Completed pass authority cannot be
replayed to clear a later pending/failed pass. Postflight never grants write
permission. A PASS describes focused checks that ran on these bytes; it does not
prove semantic equivalence for arbitrary code.

Analyze stays honest: postflight replaces caller-declared statuses with the
not-run values (`git_diff_check: not-run`, preserved surfaces `pending`,
`behavior_verification: not-verified`), every evidence reference must resolve
in the session, and the result carries only `analysis_current`.

If a pass fails, stop. Restore only its owned changes using **exact scoped edits**
from the pre-pass snapshot, preserving user changes. Rollback is valid when every
pass path is back to its exact checkpoint bytes. Concurrent changes outside the
pass paths are listed in `result.concurrent_changes`, preserved, and become the
next pass baseline. A concurrent change to a pass path, a protected path, a
verification input or an oracle import closure blocks. A `reverted: true` claim
is insufficient: rerun verification and postflight against the actual restored
snapshot. The failed pass consumes its number. An unreverted failure blocks the
next pass and repair. `session.recordRepair()` marks the terminal repair event;
repair writes invalidate completion and cannot trigger another simplify pass.

## Host runner

`_refs/simplify/host-runner.mjs --authority <file> --request <file>` runs one
whole pass in one process with Node built-ins only: session, baseline,
verification before, preflight, Apply, verification after, postflight and
scoped rollback.

- `--authority` comes from the orchestrating host: `root`, `repository_id`,
  `change_ref`, the approved `plan` (`path`, `approval_hash`), `parents`,
  `step_id`, the resolved `scope` (`files`, `hunks`), `workflow_hunks`,
  `user_owned_hunks`, `anchor` (`head` or `host-snapshot`), `prior_receipts`
  and `repaired`.
- `--request` carries only `schema_version: 1`, `action`, `edits`
  (`[{path, content}]`) and an optional narrowing `scope`. A request field that
  carries authority is rejected.
- The runner reads the plan and parents from disk through the approved-artifact
  loader; the hash must equal the host-issued `approval_hash`. The plan's
  `simplify-host-policy` JSON fence lists `steps` with `step_id`,
  `owner_repository_id`, `allowed_paths`, `prohibited_paths`,
  `verification_commands` and `oracles` (`classify_source` and
  `verify_preservation` as `file#export`). Volatile paths come from the same
  plan's `finish-policy`. An authority without `plan` is a direct fix: it has no
  step, commands or oracles, so the runner only Analyzes it.
- Oracle modules and their static relative imports must be tracked ES module
  files (`.mjs`), unchanged from HEAD; tracking and HEAD equality are checked
  with literal Git pathspecs, so a bracketed name is never a glob. A CommonJS
  file is refused because it reaches its module wrapper's `require` through
  `arguments`. The raw source is scanned: every `import` and
  `export … from` must name a tracked relative module or a pure `node:`
  built-in from the allowlist (`node:assert`, `node:assert/strict`,
  `node:buffer`, `node:crypto`, `node:events`, `node:path`, `node:path/posix`,
  `node:path/win32`, `node:querystring`, `node:string_decoder`, `node:url`,
  `node:util`); every other built-in import is refused. A relative specifier
  may not contain `%`, `?`, `#` or `\`, and the file Node resolves must be the
  checked file. The tokens `require`, `createRequire`, `getBuiltinModule`,
  `eval`, `Function`, `Reflect`, `constructor`, `globalThis`, `global`,
  `process`, `WebAssembly`, `fetch`, `WebSocket`, `EventSource`,
  `XMLHttpRequest`, `setEngine` (the `node:crypto` engine loader), `import()`,
  `import.meta`, any `\u` or `\x` escape, or an
  unaccounted `import`/`from`, even inside a comment or string, make the oracle
  untrusted, which means Analyze-only. The scan is a conservative heuristic,
  not a sandbox: it cannot prove that no computed access reaches the process,
  so trust rests on the oracle being tracked, unchanged from HEAD and named by
  the approved plan. The closure paths are passed to the session as
  `oracle_paths`.
- Current scope content must match the anchor or the last receipt's `after`.
  A `head` anchor compares the filtered HEAD content (`git cat-file --filters`,
  as checkout writes it), so autocrlf work trees match their commit. The
  receipt chain must be continuous, the 2-pass, 8-file and 20-hunk caps count
  the whole chain, and `repaired: true` closes it. With a `head` anchor, a
  chained pass owns the changes that earlier passes made since HEAD.
- The whole-chain hunk budget is checked before any write. When any step fails
  after Apply, the runner restores the pass paths from its checkpoint inside a
  rollback window (declared volatile paths may not change there) and the
  blocked receipt reports the rollback. Rollback restores only bytes the pass
  wrote: a path still at its checkpoint is skipped, and a path that holds
  neither the checkpoint nor the pass output changed concurrently, so the
  runner writes nothing and blocks with `concurrent change on a pass path
  blocks rollback`, naming every conflicting path, and keeps the postflight
  blockers that triggered the rollback. A blocked receipt of a pass that wrote,
  or tried to write, keeps its `pass_paths` with `before` and current `after`
  hashes. A `reverted` receipt must record the same `before`
  and `after` hash for every pass path.
- The runner prints `{receipt, simplify_context}` on stdout and exits 0 only for
  `verified` or `analyzed`. The `simplify-host-receipt:v1` receipt records
  identity, plan reference, anchor, base revision, status, pass paths,
  before/after sha256, commands with exit code and output digest, and blockers.
  It is an index, never authority. The runner writes no Git objects.

A finish host brackets each dispatch with `beginSimplify` and `recordSimplify`
(`_refs/shared/finish-gate.md`). The anchor is taken before the first dispatch
and shared by the whole chain, and `beginSimplify` returns the verified `chain`
for the runner's `prior_receipts`. Inject
`createFinishSimplifyVerifier({ step_id })` from this runner module as the
observation runtime's `simplify_verifier`: it loads the step and oracles from the
runtime's verified plan, takes the finish scope, derives hunk ownership from the
observed implementation windows and the initial snapshot, and re-derives the
composite diff with `revalidateSimplifyHostReceipt` against the shared anchor and
chain. The `reverify` phase runs fresh verification. The verdict must name its
outcome; the host never assumes one. The outcome follows the composite diff:
`simplified` when the tree differs from the anchor, otherwise `reverted` when
the last pass was reverted, otherwise `unchanged`. A session consumer reports
`simplified` whenever a pass path still differs from the session start,
whatever the last pass did; otherwise it keeps the last pass's status.

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

Session contexts may add `host_kind: session`. A runner context sets
`host_kind: runner`, `session_id: null`, `baseline.snapshot: null`,
`preflight_ref: null`, empty `passes` and verification references, `anchor`
(`head` or `host-snapshot`) and `host_receipt_digest` (sha256 of the receipt
JSON). After scoped rollback, `result.concurrent_changes` lists preserved paths.

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

`evaluateSimplifyConsumer(context, runtime)` is the common consumer check. The
runtime is `{session, consumer}` for a session pass, `{observation, proof}` for a
same-flow runner pass read through `readRepositorySimplify`, or
`{host_receipt, expected_plan}` in another process. There the consumer loads its
own expected plan (`root`, `path`, `approval_hash`, `parents`, `step_id`),
recomputes the composite diff from HEAD with scope, eligibility and
preservation, and reruns the verification commands inside command windows of
the shared host ledger (volatile paths from the plan). A `host-snapshot` anchor
or an Analyze receipt returns `revalidation-required`. Results separate
`analysis_current` (Analyze) from `verification_current` (Apply) and carry the
owner-bound source fingerprint that host sessions report. Test and repair read
stale host evidence without blockers; other consumers block it. Portable
handoff uses the same full documented payload and validates schema at
transport; the receiving host must separately resolve the original session or
receipt and recheck content. A portable hash or matching HEAD is not authority.

- Test accepts stale context for revalidation, keeps before/after runs distinct,
  and cannot relabel old verification as current or change test expectations.
- Review and ship block stale post-simplification evidence, protected drift,
  unreverted failed passes, and `behavior_verification: not-verified` for Apply.
- Repair keeps the original context, consumes it diagnostically after rollback,
  records its terminal event (`session.recordRepair()` for a session; the host's
  `repaired` flag closes a runner chain) and appends fresh repair evidence. Neither workflow
  recursively invokes the other. There is no automatic simplify after repair.
- Git consumes verified final evidence; raw snapshots, prompts, temporary data
  and runtime context remain `local_only` and must not be staged.

No durable simplification report is created by default. Explicit handoffs follow
artifact lifecycle rules and redact sensitive data. Report exact command/results,
changed paths, rollback, blockers and skipped checks without echoing raw logs.
