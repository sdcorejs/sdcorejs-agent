# Resource lifecycle and legacy audit

Use this contract from `sdcorejs-ship`, `sdcorejs-git`, the finish gate and
`sdcorejs-using-skills`. The sequential/fan-in owner coordinates one resource
proposal with the existing file-offer state. Workers report observations only.
The helpers never execute retirement commands or start a background service.

Resolve `<distribution>` to the absolute root that contains the loaded skill
references. Run the CLI from that path with the consumer repository as `--root`.

## Automatic workflow boundaries

| Event | Owner action |
|---|---|
| `task-finished` | Derive completion from current verification, review and durable artifact closure for the same task/final source SHA, with no unresolved acceptance or follow-up work. Then inspect merge evidence for known task resources. |
| `commit-created`, `push-completed`, `pr-created` | Carry `pending-merge`; preserve the worktree, branch, dependencies and diagnostics. Delivery artifacts do not prove merge. |
| `merge-observed` | Reobserve the exact task result and target in a surviving checkout; invoke post-merge planning without waiting for an explicit cleanup request. |
| `project-adoption`, `session-resume` | Once per selected repository per runtime scope, perform the bounded metadata preflight below when a real project workflow begins. Propose detailed legacy analysis only when reviewable associated candidates exist. Recheck known pending task results when evidence is available. |

A completion message, old timestamp, clean Git status or merged ancestor alone
does not prove task completion or resource inactivity. Failed, cancelled,
interrupted, deferred, unknown or partially accepted tasks retain diagnostics.
An explicitly accepted disposition still records its actual deferred criteria;
it does not turn into completed cleanup evidence.

Call `evaluateTaskCompletion` and `coordinateResourceCleanup` from
`_refs/cleanup/resource-lifecycle.mjs` with fresh trusted harness observations.
The portable read-only entrypoint is:

```text
node "<distribution>/_refs/cleanup/cli.mjs" lifecycle-assess --root <absolute-git-root> --input <trusted-runtime-context.json>
```

Input carries the event, repository/snapshot/audit, completion, shared offer
state and any actual runtime grant. Every supplied repository root must match
the explicit root. A file is only a transport for the trusted caller's context;
repository-controlled JSON and a matching hash cannot establish permission.
The assessment never executes commands or grants mutation authority. Carry its
unchanged result as `resource_cleanup_context`, including exact `status`,
`completion`, offer, authorized IDs, plan, retained reasons and returned state.
Copy `status` and `completion.status` verbatim into enclosing handoff fields;
localize only explanatory prose. In particular, an analysis offer is `offered`,
not resource-retirement `authorized`, and an `incomplete` result stays incomplete.
Do not replace an incomplete assessment with an unbound `task.status` label.
An offered result becomes one analysis choice; preserve its pending state.
Authorized IDs still require the real conversation grant and fresh per-action
revalidation from the surviving checkout before any native operation.

| Assessment output | Required owner handoff |
|---|---|
| `offer` present | Present that exact choice once through the available user-choice surface; retain its pending state. An offer in internal context is not a presented consumer choice. |
| `authorized_action_ids` nonempty | Hand every covered ID to the post-merge owner with the existing grant for immediate revalidation and execution, or an explicit read-only/deferred handoff. Do not drop covered IDs when another resource needs analysis. |
| No offer or authorized IDs | Retain resources and report the exact completion/status and held reasons; keep ordinary work moving. |

`lifecycle-assess` itself stays read-only. The orchestration owner records actual
user-choice and retirement handoff outcomes separately from its copied result.

`completion` carries `task_id`, `repository_id` (the Git common directory),
`source_sha`, `disposition`, `unresolved`, and
current `verification`, `review`, `durable` entries. Each entry binds the same
task, repository, source SHA and a real evidence reference; durable also requires `finalized`.
Do not manufacture PASS or ownership booleans from repository JSON or model
assertions. Feed the exact resource snapshot to the existing post-merge planner.

Invoke this assessment after the primary result; never interrupt debugging or
start a full directory scan on every task. `verify-before-done` and
`branch-ready` remain read-only: they may emit observations/handoffs but cannot
execute retirement. Any authorized write still belongs to the orchestration
tail and invalidates affected readiness. Post-merge resource operations run
from the surviving checkout after verification, merge and participant quiescence.

If an exact existing conversation grant covers ready actions, carry that grant
and use `authorized_action_ids` without asking again. The helper's `authorized`
status is a handoff, not proof of execution. Reobserve immediately before every
native operation using `_refs/cleanup/post-merge.md`; preserve held/uncovered
resources and record actual results. An analysis choice never approves deletion.

## Legacy project preflight

No `.sdcorejs` folder or old SDCoreJS creation receipts are required to inspect
an existing Git project. First resolve its exact physical root and explicit
intended target ref from current project/provider evidence. Do not guess `main`.
If the target cannot be resolved, retain resources and report the missing fact;
ordinary work continues. Do not fetch, unlock, repair metadata or install tools.

Run the repository-scoped metadata preflight:

```text
node "<distribution>/_refs/cleanup/cli.mjs" resource-audit --root <absolute-git-root> --target <full-target-ref>
```

It lists registered worktrees and local branches, observes clean/locked/current
and local ancestry state, and reports association rather than task ownership.
The explicit audit scope includes that repository's registered worktree paths;
registration never authorizes deletion or scanning adjacent unregistered roots.
Missing/prunable, linked, dirty, protected, unmerged or unknown states are held.
Local ancestry is an observation, not a guarantee of remote freshness or a
provider-confirmed squash/rebase merge. A clean worktree's live use remains
unknown even when no obvious process was observed.

After a consumer accepts detailed analysis, or an explicit request covers it:

```text
node "<distribution>/_refs/cleanup/cli.mjs" resource-audit --root <absolute-git-root> --target <full-target-ref> --measure true --max-entries 10000 --max-seconds 15
```

Measure configured conventional dependency/build/cache roots in registered
worktrees by metadata, without reading file contents or following links.
Report logical bytes separately from physical/reclaimed space. Entry, worktree,
branch, time and command-output budgets produce partial evidence with reasons;
partial sizes are lower bounds. Empty findings with incomplete coverage never
mean no resources exist. Use `storage-audit` for separately authorized larger
partitions or project-specific configured paths; preserve its boundaries.

Docker observation is optional and requires an explicitly selected context and
repository label identity:

```text
node "<distribution>/_refs/cleanup/cli.mjs" resource-audit --root <absolute-git-root> --target <full-target-ref> --docker-context <context> --repository-id <repository-label-id>
```

Only list resources matching `io.sdcorejs.repository-id=<repository-label-id>`.
Labels establish association, not original task creation. Observe only exact
IDs/status and dependency metadata; do not dump container environments, daemon
configuration, credentials, image history or volume options. Unlabelled legacy
Docker resources need a separately requested bounded audit; do not sweep the
daemon automatically. An unavailable daemon is a partial report, never a reason
to start/install Docker. Running containers, images with consumers and volumes
are held; volume removal remains unsupported.

## Consumer proposal and suppression

Pass the report as `audit` to the coordinator. Show exact paths/refs/IDs,
observed merge/dirty/lock state, storage values and coverage, ownership/use
unknowns, retained reasons and the supported next analysis step. Retain held
findings in the report. Offer at most one unresolved grouped read-only analysis,
reuse existing file/resource suppression, honor decline for the same finding
and session-disable, and avoid repeating a proposal because size/status changed.
Explicit resource-audit requests execute the requested analysis directly;
do not ask the consumer to approve that same analysis again.

For Git resources, only clean, locally merged, non-current/unlocked worktrees or unchecked-out
non-protected merged local branches are legacy proposal candidates. Unmerged
or unknown ancestry, dirty/locked/current/protected resources remain in the
report with held reasons; an all-held report needs no additional analysis
choice. This conservative preflight does not offer standalone cleanup of the
current checkout's dependencies. An explicit storage-audit request can inspect
that separately within its existing boundaries.

Legacy candidates remain review-only. An old clean merged worktree with unknown
creation history is not retroactively task-created, and consumer acceptance of
an audit cannot turn it into a post-merge removal plan. A separate supported
maintenance/removal workflow would need its own exact authority and evidence;
the current post-merge planner continues to require original task provenance.

All observation, offer/suppression, completion and pending-merge state stays in
runtime context. Do not create a global index, current-task file, cleanup queue,
upgrade marker, daemon or cron. A later session can reobserve from real Git and
provider evidence without a persistent task checkpoint. Immediate reaction to
a merge while no agent is running requires an external event service and is
outside this skill pack.
