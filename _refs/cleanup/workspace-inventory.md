# Workspace storage inventory and delete batches

Use this workflow for explicit local collections of workspaces, age-based
storage questions and reviewed delete batches. Keep storage, Git resource
retirement and the file cleanup engine as distinct owners.

## Inventory

Ask for the collection root only when it cannot be resolved from the request.
Use the current date and the user's configured time zone unless they name a
different cutoff. Use the host that can access that path. For example, on
Windows PowerShell with an existing trusted Python and a directory for reports:

```powershell
$cutoff = Get-Date -Format yyyy-MM-dd
node _refs/cleanup/cli.mjs storage-audit --root 'C:\Users\Admin\Documents\Codex' --python '<absolute-python.exe>' --as-of $cutoff --time-zone '<IANA-time-zone>' --out 'C:\Users\Admin\Documents\codex-inventory.json' --csv 'C:\Users\Admin\Documents\codex-inventory.csv'
```

Set the cutoff value explicitly when the requested time zone differs from the
host's. The root, interpreter and report destinations can be replaced. Invoke
the CLI by its installed absolute path when running outside the pack. CSV and
JSON destinations must be new files outside the scan root with safe existing
parents. A missing Windows drive on a Linux host is unavailable coverage.

Use `age_groups`, `workspaces` and `details` in `workspace_inventory` as
the three tables. The workspace rows include project and repository markers.
CSV carries the same rows and a `table` discriminator. Filter or total one
table at a time. The workspace partition consists of each immediate physical
child directory plus one row for loose files at the root. Age totals sum this
partition. The root total, subdirectories and nested repositories overlap the
partition. Detail includes depths 2–3, large directories, and detected
repository roots. A separate audit can focus on a deeper collection. Never add
the inventory's legacy cache/dependency breakdowns to these totals.

Show the cutoff and time zone, name, absolute path, logical bytes (optionally
also GiB), file count, age date and source, last observed file write, age band,
coverage, keep signals and “What does this group contain?”. Explain which date
was used. A valid leading ISO date in a workspace name takes precedence over a
real filesystem creation date where available. Detail inherits the enclosing
workspace date. Missing/future dates and loose root files go to unknown.
Calendar days in the declared time zone give 0–10, 11–20 and over 20. Aggregate
rows have mixed or empty dates. Write observations are independent. A file
written within 10 calendar days of the cutoff or with a future write timestamp
flags recent activity even in an older workspace. For partial coverage show
“latest observed, true latest unknown” or “unobserved”. Files and sizes in
partial rows are measured lower bounds. These are live observations, not a
point-in-time filesystem snapshot.

Use `contents` and its top three measured categories in each group. Show the
largest observed direct subdirectories where `largest_subdirectories` is
available. These measured breakdowns overlap the group total.
Descriptions localize the category names and preserve “needs verification”
when derived from naming or structure alone. Report repository/worktree
markers and known manifests without displaying file contents or remote URLs.
The audit distinguishes source/manifests, Git metadata, dependencies,
build/test caches, SDK/installers, database/disk data, builds, likely delivery
outputs, evidence and recovery. Verify producer configs or handoff/recovery
receipts separately in the bounded scope. Show only relevant redacted evidence.
For example, a PostgreSQL experiment might weigh 5.22 GiB with data, installers
and test logs. Inspect retention before proposing the whole workspace.

`logical_bytes` counts pathname file lengths. Hardlinks can contribute more
than once. Inventory reclaimability is unknown. Plan estimates measure
allocation where supported and exclude held/shared files. Native receipts
account for removed files and native allocation separately. Free space before
and after describes the volume, including other writers.

## From filter to exact scope

“Delete items over 20 days” selects `over-20` for review. Present the resulting
candidates and hold reasons. The filter alone grants no deletion authority.
`workspace-plan` consumes the intact JSON audit and a trusted harness's scoped
evidence. Pass no selections for a review list. To freeze proposed deletions,
pass exact workspace or detail paths relative to the explicit root:

```text
node _refs/cleanup/cli.mjs workspace-plan --root <same-absolute-root> --input <request-json>
```

Supply `inventory` (the storage report), `python` (selected absolute trusted
interpreter), `age_group` (`0-10`, `11-20`, `over-20` or `unknown`),
`selections` (array of `{ path, evidence, reference_scope? }`), optional
`task` and the existing optional `posix_boundary`. Per-file `evidence` uses
the engine contract. Establish owner, finished producer, reproducibility,
and discharged retention with redacted evidence. Include known producer PIDs
when available and confirm output/consumer references using the existing
coverage fields. The engine hashes the exact scoped files. If it hits its
bounds, split into smaller independent scopes without changing evidence or
skip the oversized unit. Reference scopes must be independent from every
selected scope.

Describe precisely what will be affected, e.g. only the Remotion build cache
and its listed files. If the user selects an entire mixed workspace, show the
source/worktree, delivery video and any other data it contains, and identify
why it is held. Unknown contents, recent writes, incomplete reads, redirects,
dirty repositories, dependencies, databases, SDKs, source, delivery and
recovery data need the appropriate retention or owner workflow. A nested repo
is held. To consider untracked disposable files inside an exact clean
repository, audit that repository as its own root. Workspace batches retain
tracked files. The engine's own untracked cleanup journals do not make
unrelated scopes dirty. Use `post-merge-cleanup` for eligible registered
worktrees, branches and Docker resources. Exact file actions leave empty
directory entries in place. This workflow has no recursive folder deletion.

Show each eligible unit's absolute path, operation, affected content types,
exact file list, logical bytes, estimated reclaimable bytes or unknown, and
recreation/recovery evidence. Show held units with their reasons. Preview the
POSIX native requirements from [workflow.md](workflow.md) before approval.
Only ask to approve the exact frozen `batch_id` once. Honor existing matching
conversation authority. For a subset, freeze and show that subset.

## Apply and reconcile

```text
node _refs/cleanup/cli.mjs workspace-apply --root <same-absolute-root> --input <apply-json>
```

Supply `batch` (the frozen workspace plan) and `approval` from the trusted
conversation harness using `{ source: "conversation", decision: "approve",
authority: "mutation", batch_id }`. Pass current `maintenance` separately
where native POSIX apply requires it. Never infer approval from an inventory,
an input file on disk, or an age filter. Validate the frozen batch before
projecting exact action approvals into `applyCleanupPlan`. Never waive native
admission or reuse an approval against a changed plan.

Revalidate each unit independently before the engine verifies content/state,
references, Git boundaries and the native writer boundary. Check known
producer PIDs again. Windows uses pinned native handles with writer exclusion.
POSIX uses the scoped maintenance and participant evidence. Keep a unit whose
facts drifted and continue independent approved units. A shared unsafe writer
boundary or unaccounted transaction stops further effects on that root. A
late file never joins a frozen action. Keep any recovery journals under the
existing recovery contract.

Report exact removed paths and files held, changed, failed or uncertain,
with per-unit results and error reasons. Report observed removed logical bytes,
native allocation (unknown if incomplete), and measured volume-free bytes
before and after. For a mixed receipt, say partial and name the held scopes.
A volume delta can include other writes and freed space elsewhere. Keep the
runtime plan/receipt private unless the user requests a durable report.
The CLI returns receipt JSON on stdout even when a partial or blocked batch
sets a nonzero exit status.
