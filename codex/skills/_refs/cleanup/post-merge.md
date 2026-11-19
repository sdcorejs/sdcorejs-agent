# Post-Merge Task Resource Cleanup

Use `sdcorejs-cleanup (post-merge-cleanup)` when a finished task has left local
resources behind. This existing-skill mode owns resource retirement after merge;
`task-tail-cleanup` still owns bounded file hygiene before branch readiness.
Never remove the workspace needed to finish tests, review, push or merge.

## Entry, authority and lifecycle

1. Resolve the surviving integration checkout and exact task identity. Obtain
   the original workspace/resource creation records from the trusted harness or
   a relationship-matched task handoff. Names, age, ignore patterns, low disk
   space, AI generation and labels alone prove neither ownership nor disposal.
2. Require completed task status, durable artifact finalization, captured
   verification, and the exact final source commit merged into the intended
   target. Failed, interrupted, cancelled, abandoned, closed-but-unmerged and
   unknown tasks retain resources and diagnostics. Do not mark them completed
   merely to make space.
3. Inventory only the known task resources. No sibling sweep, all-worktree scan
   for deletion, global resource index, background daemon, cron or automatic
   machine-wide cleanup. Listing the repository's worktrees and Docker consumers
   is read-only dependency evidence, not an expansion of mutation scope.
4. Produce a read-only plan using `_refs/cleanup/post-merge.mjs`. Present exact
   paths/refs/IDs, ownership, source/target commits, blockers, commands, recovery
   limits and size basis before obtaining any missing authority. `storage-audit`
   and offer acceptance authorize inspection only.
5. Reuse matching session authority. An explicitly approved task-resource
   policy may authorize retirement after merge without another prompt, but it
   must identify repository, task, original creation run, exact resource
   identities, permitted operations, target, recovery and inactivity conditions.
   A pattern such as "delete all old branches" is insufficient. The ordinary
   pre-merge `task-tail-low` policy never covers these resources. Do not persist
   policy or creation records without the existing owner's persistence authority.
6. All known writers, consumers, editors, watchers and child processes must have
   finished or be paused for the operation. Include Git ref/worktree writers and
   Docker consumers, not only build producers. Preserve this cooperative
   maintenance window through revalidation, native execution and verification.
   Do not kill processes, stop containers or start a daemon implicitly.
7. Use the surviving checkout as cwd. Remove disposable worktrees first, then
   reobserve and plan local refs no longer checked out anywhere. Remove stopped
   containers before planning now-unused images. Execute one approved operation
   at a time; use exact argv, never a joined shell command or destructive glob.
8. Verify every result and record a native resource receipt. Preserve failed
   and uncertain results; never escalate to force or broaden a plan on failure.
   Resume only after fresh observation, a new plan and matching authority.

The helper is a pure planner and revalidation policy, not a second filesystem
mutation engine, a process exclusion mechanism or an independent attestation
of ownership. Its input must be fresh observations from a trusted caller.
Repository JSON, a model's assertions and an earlier snapshot cannot establish
current safety or grant permission. A plan hash binds data; it is not approval.
Native commands and cooperative maintenance have their own operating limits;
do not claim atomic exclusion of uncooperative writers.

## Establish merge and Git state

Resolve Git identities with read-only native commands, passed as argv:

- `git -C <integration-root> rev-parse --show-toplevel` and
  `rev-parse --path-format=absolute --git-common-dir` establish the repository.
- `rev-parse --verify <full-source-ref>^{commit}` and the corresponding explicit
  target establish full source/target SHAs. Resolve the task's final recorded
  SHA independently; a moved branch must not replace it. Never guess `main`.
- `merge-base --is-ancestor <source-sha> <target-sha>` with exit 0 proves an
  ancestry merge. Exit 1 is unmerged; other failures are unknown.
- Squash and rebase merges need current provider PR evidence tied to the same
  repository, task, original final source SHA, target and merged result SHA,
  plus `merge-base --is-ancestor <merge-result-sha> <target-sha>`. A PR marked
  closed, a branch name match or similar patch content is insufficient. If the
  provider is unavailable, hold rather than guess. Fetch only when authorized;
  an old remote-tracking ref is not a fresh provider observation.
- `worktree list --porcelain -z` inventories every registered checkout, lock,
  detached HEAD and branch. Inspect the selected worktree's physical path,
  common Git directory, full HEAD, source ref and lock state. Preserve primary,
  current, protected, missing, relocated, nested, submodule and unknown trees.
- `git -C <task-worktree> status --porcelain=v1 -z --untracked-files=all` must
  be clean. Review ignored content separately: status does not include it.
  Inspect nested repositories, submodules, links and mount boundaries without
  following targets; incomplete coverage holds the worktree.

`repository.protected_refs` must include observed default, integration and
release/protected local refs. The planner also protects the explicit target and
its local counterpart when the target is a remote-tracking ref. Only full
`refs/heads/...` task refs can be deleted. Remote branches and Git history are
outside this mode. A branch checked out anywhere is held until its worktree is
removed and current observations prove no remaining checkout uses it.

Observe `git -C <integration-root> symbolic-ref -q <full-local-ref>` before
planning and again before removal. Exit 1 with no target establishes a direct
ref (`state.symbolic_target: null`); exit 0 identifies a symbolic ref, which is
held even when its resolved SHA matches the approved task result. Other errors
or missing observations remain unknown and held. Bind the ref type/target in
the frozen state; a symbolic task alias must never grant authority over the
protected or unrelated ref it points to.

For local refs the approved operation is
`git -C <integration-root> update-ref --no-deref -d <full-local-ref> <approved-source-sha>`.
The old-value argument prevents deletion if the tip moved, including after a
squash/rebase merge. A separately established merge proof is mandatory; this
command itself does not check merge or checked-out state. `--no-deref` confines
the native deletion to the named ref if the cooperative window is violated;
it does not replace immediate ref-state revalidation. Keep branch config
and unrelated refs untouched. Do not use `branch -D`, `worktree remove --force`,
`worktree prune`, `git clean`, `reset` or `stash` as a shortcut.

## Dependencies and worktree contents

`git worktree remove -- <exact-task-worktree>` reclaims the whole disposable
tree, including ignored `node_modules`, task-local build output and caches.
No separate recursive `rm` or per-file million-entry cleanup plan is needed.
This is irreversible removal of ignored bytes: require complete inventory
coverage and a disposition review, not just clean Git status or a lockfile.
Retain local patches, copied fixtures, private/offline-only dependencies,
diagnostics, recovery journals and unique data. Finalize/move needed evidence
through its existing owner first and replan after any write.

The snapshot's `state.inventory` contains `coverage: complete`,
`disposal_reviewed: true` and a current `cleanupFingerprint` of the reviewed
inventory, including ignored entries and their relevant identities/state.
The trusted caller chooses bounded metadata/content evidence appropriate to
the data; a constant digest or directory name is not an inventory. Known
producers must stay quiescent throughout. Reproducible dependencies require
project package-manager/lock/runtime and reacquisition evidence as described in
`storage-audit.md`; a verified external backup is the alternative. Regeneration
from a lockfile is not byte-for-byte recovery of installed local edits.

Standalone `node_modules` in a retained/main/shared workspace and global npm,
pnpm, Yarn, pip or SDK caches remain held. Report their concrete storage/recovery
handoff; this mode does not add a generic directory-deletion escape hatch or
pretend the ordinary filesystem engine supports protected dependency roots.
Do not delete a shared package store when removing a linked worktree tree.

## Docker resources

Use existing connected provider tools when sufficient; otherwise use supported
native Docker commands. Record current context, daemon ID and a non-secret
fingerprint of the resolved endpoint/configuration and relevant environment.
Do not print raw inspect output, environment, credentials or endpoint URLs.
Read selected fields only. Reobserve this identity before every operation; a
context name alone does not pin a daemon. Do not change context, permissions or
services to bypass an unavailable daemon. Git cleanup may proceed independently
while Docker resources remain held.

Task resources should have the creation-time label `io.sdcorejs.task-id` plus
original creation evidence for the exact full ID. Do not label existing
resources retroactively to manufacture ownership. Shared Compose projects,
inherited labels and a task-like name do not establish exclusive creation.

| Resource | Required evidence | Exact permitted operation |
|---|---|---|
| Container | Full 64-hex ID, task label and creation record, exited/created state, no active/shared consumers, mounts reviewed and writable layer disposable or backed up | `docker --context <context> container rm <full-id>` without force or volume removal |
| Image | Full `sha256:` ID, task label and creation record, all tags/references reviewed, no running or stopped container consumers, no shared owner, verified recovery | `docker --context <context> image rm <full-id>` without force |
| Volumes, bind-mount contents, databases | Unique/persistent data | Held; no volume removal, `compose down -v` or host-path deletion |
| BuildKit/buildx cache, shared layers, global images/networks | Exact ownership and safe per-record deletion unsupported here | Held; concrete provider-specific handoff, no broad prune |

Container removal can lose writable-layer logs/data even without `-v`; inspect
and preserve needed evidence first. Removing a container does not remove its
volumes or bind-mount contents. Image deletion may free zero physical bytes
when layers are shared; report that rather than implying full image-size savings.
Never use `docker system prune`, `image prune -a`, `builder prune`, `volume
prune`, daemon reset or WSL/VHDX deletion. Consult current official provider
documentation before any separately scoped cache GC or host disk compaction.

## Planner interface and revalidation

`planPostMergeCleanup(snapshot)` takes:

- `repository`: canonical absolute `root` and `common_dir`, full `target_ref`,
  observed `target_sha`, and nonempty `protected_refs`;
- `task`: `id`, `status: completed`, `durable_finalized: true`, final `source_sha`;
- `merge`: exact source/target identities, nonempty `evidence`, and either
  `kind: ancestry` with `source_is_ancestor: true`, or `kind: provider` with
  `state: merged`, `merge_sha`, `merge_is_ancestor: true` and `receipt` containing
  `source: provider`, common-directory `repository`, `task_id`, `source_sha`,
  `target_ref`, `merge_sha` and provider `reference`;
- `resources`: exact `kind`/`identity` pairs with `ownership` (`task_id`,
  `created_by_task: true`, original `evidence`), `producer` (`state: quiescent`,
  current `evidence`), `recovery` (`strategy: recreate | verified-backup`,
  verified `evidence`), `unknowns: []` and observed `state`;
- optional `docker`: selected `context`, observed `daemon_id`, and
  `endpoint_fingerprint` from `cleanupFingerprint`.

Worktree state requires `physical_path`, `head_sha`, `branch_ref`,
`boundary_verified: true`, the reviewed `inventory`, and explicit false values
for `is_primary`, `is_current`, `locked`, `dirty`, `untracked`, `submodules`,
`nested_repositories`, `contains_needed_evidence`. Branch state requires `sha`,
`checked_out_paths: []`, `is_protected: false`, and an explicitly observed
`symbolic_target: null`. Container state requires `status`,
`mounts_reviewed: true`, `writable_layer_disposable: true`, `consumers: []` and
task `labels`. Image state requires `containers: []`, `shared: false`,
`references_reviewed: true` and task `labels`. Unknown or missing evidence holds
an action with no executable command. A null, absent or malformed resource
`state` is held independently; it does not discard other ready actions. The
planner never calls Git or Docker.

The existing CLI exposes this same read-only plan:

```text
node <distribution>/_refs/cleanup/cli.mjs post-merge-cleanup --root <integration-root> --input <trusted-current-snapshot.json>
```

The snapshot is runtime-local, outside version control. The CLI reads it but
does not collect observations, approve actions or apply the plan. `--scope` and
`--reference-scope` cannot widen this mode. A blocked/partial report exits
nonzero while retaining ready/held details.

Use `approvePostMergePlan(plan, {source: 'conversation', decision: 'approve',
authority: 'post-merge-resources', action_ids: [...]})` only when actual matching
conversation authority exists. Before each native call, collect current
observations and call `revalidatePostMergeAction({plan, action_id, approval,
current})`. It returns exact argv or throws on changed identity/evidence,
unknowns, blockers or missing authority. Do not invoke it with the same stored
snapshot and call that fresh observation. Commands must execute via argument
arrays; paths/ref names may contain shell syntax.

Later operations often need new plans: a checked-out branch becomes eligible
after worktree removal, and an image after its container is removed. Carry the
same real scoped task-resource grant when it covers these exact operations;
bind the fresh plan without asking for the same grant again. Newly discovered
resources, different owners/actions/SHAs or recovery changes need new scope.

## Verification, receipts and space reporting

Verify worktree registration and path absence, local ref absence with unchanged
protected refs, and Docker ID absence on the same observed daemon. Distinguish
an exact not-found result from permission, transport and daemon errors; an
unavailable daemon is unknown, never proof that deletion succeeded. Check the
surviving integration checkout is unchanged and usable. Preserve approved
source/target SHAs and recovery evidence outside any removed tree.

Return a runtime-local `post_merge_cleanup` receipt containing repository/task,
merge proof, plan/action IDs, approved authority reference, exact native argv,
before/after identities, command result and independent verification for each
completed/held/failed/unknown resource. Overall success requires verification
of every requested action; a partial result is not total success. Preserve the
receipt across interrupted sessions only through an explicitly authorized
task-scoped handoff. Do not add a global cleanup queue or auto-resume writes.

Report logical bytes removed, recovery/quarantine bytes retained, provider
reported reclaimed bytes, and observed host free-space delta separately. Use
unknown when unmeasured. Never double count node_modules inside a removed
worktree, shared image layers or Docker storage still allocated in a VM disk.
No automatic backup/quarantine of dependency trees that merely moves disk use.
This mode has no automatic restore API: verified backups and regeneration
recipes are recovery prerequisites, not a promise of reversible deletion.

Native resource receipts are distinct from filesystem apply/restore receipts;
do not fabricate `cleanup_receipt_ids` or feed these records into the existing
engine's readiness validator. This post-merge action cannot retroactively prove
readiness of the removed branch. If it changes a surviving checkout's source
or config, stop and rerun the affected test/convergence/branch-ready gates before
any further Git artifact handoff.
