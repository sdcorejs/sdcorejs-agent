# Storage audit and recovery triage

Use for disk-space, large dependency/caches or explicit whole-machine requests.
Keep repository artifact hygiene, offers and task-tail on their existing engine.
This mode observes metadata; it cannot produce apply/restore authority.

## Fast, accountable inspection

Discover fixed local volumes and available free space with native read-only
tools. Whole-machine intent includes accessible fixed local volumes; network
and removable drives need explicit inclusion. On Windows,
`Get-CimInstance Win32_LogicalDisk` supplies volume type/size/free metadata.
Partition roots into system/applications, user data, AppData, developer stores,
hidden worktrees and virtual disks. Do not read credential or personal document
contents to measure space. Preserve inaccessible paths without permission repair.

Use the existing Node CLI and a selected existing absolute CPython executable:

```text
node _refs/cleanup/cli.mjs storage-audit --root <absolute-local-root> --python <absolute-python> --out <new-report-outside-root>
```

`--exclude <absolute-descendant>` is repeatable; use canonical non-redirected
paths, since short aliases are rejected rather than silently ignored.
`--max-seconds <number>` is an
optional traversal budget; zero scans to completion. Output parents must exist;
the CLI refuses an output inside the analyzed root, redirected parents or an
existing report. It never accepts `--input` approvals for storage inspection.
Use an existing trusted CPython 3.11-3.14; no runtime installation is implied.
If unavailable, use supported native metadata tools and state missing coverage.
Call scripts by paths resolved relative to this skill distribution, not CWD.

The metadata helper `_refs/cleanup/storage_inventory.py` skips link/reparse
boundaries. It hashes no file contents and has no 5,000-file cap. Progress goes
to stderr. Error/exclusion/budget/link coverage propagates to individual records;
zero bytes in a partial subtree do not establish emptiness. Interrupted or
failed scans are not completed evidence. Keep one report per partition and
resume uncovered partitions instead of repeating completed scans. Reuse old
measurements only with their dates and confirmed receipt adjustments labeled
as estimates; a report does not prove current writer/ownership state.

The Node CLI has a 128 MiB JSON transport limit. An exceeded limit is a failed
scan, never a completed total. Split the partition, or use the read-only Python
helper with `--out <new-report-outside-root>` to write the full report and emit
only a compact summary. Both Python helpers enforce exclusive new reports,
existing non-redirected parents and output outside their analysis/workspace root.

Rank the largest directory/file records and classify each significant group:
build cache, package archive, dependency tree, application/profile/runtime,
source/personal/evidence, system-managed, container/VM or unknown. Names such
as Temp, cache, build and dist do not establish disposability. `dependency_roots`
lists outermost node_modules independently, including inside npm-cache/Temp.
Those breakdowns overlap parent totals: never sum them again. Logical totals
may count hardlink paths repeatedly. The single-link allocation column omits
multiply linked files and is an estimate ceiling. Snapshots, shared extents,
compression and allocation availability can affect reclaimed space. Keep this
estimate separate from approved reclaim, measured native source allocation,
and volume-free observations.

Give each significant group an exact path/provider, size/basis/date, coverage,
recommendation, recovery prerequisites, blocker and next supported action.
Prioritize likely material space returns instead of many tiny deletions.

## Project, age and contents tables

For an example on the Windows machine that owns the Codex directory, run:

```powershell
node _refs/cleanup/cli.mjs storage-audit --root "C:\Users\Admin\Documents\Codex" --python "<absolute-python.exe>" --timezone "+07:00" --out "<new-report-outside-root>.json" --csv "<new-report-outside-root>.csv"
```

Substitute any user-specified absolute local root. Choose the user's time zone
(an IANA identifier when available, or a fixed offset). The default is UTC.
An optional `--as-of` ISO timestamp with an explicit offset makes the calendar
cutoff repeatable. Date ranges are inclusive calendar days in that time zone:
0–10, 11–20, over 20, and unknown. A valid YYYY-MM-DD workspace name label takes
precedence over filesystem creation time. Without either, or with a future
age date, report unknown. A Linux metadata-change time is not a creation date.
Show newest observed regular-file write separately and mark activity in the
latest 10 calendar days, including possible clock skew. Partial scans report
observed timestamps only. Unobserved files can be newer.

Use `age_groups` for disjoint bucket totals, `projects` for the first-level
workspace rows (plus any files directly under the root), and `records` for
directory details and discovered repo/manifest roots. A root with project
metadata or a date label is one workspace. Root, repo and detail rows may
overlap. Never add detail rows, cache breakdowns, or parents to the totals.
The CSV includes a table column for filtering explicitly before summing.

Display `contents` as the localized “What is in this group?” column. Include
project identity and metadata evidence, data categories and the top one to
three immediate entries by measured logical size. Git directories and Git
indirections are observed markers, with worktree/submodule role requiring
verification. Manifest presence is evidence of project type. Folder names,
extensions and cache/SDK/build hints require verification against producer
configuration and handoff records. Distinguish source, dependencies, build and
test caches, SDKs/installers, databases, build outputs, deliverables, evidence
and recovery. Never dump config, manifests, remote URLs, secrets or file
contents. Example wording: “PostgreSQL experiment workspace, 5.22 GiB.
Observed data, installer and run logs. Verify database and recovery ownership
before considering the entire workspace.”

## Review and apply an age-filtered batch

1. Run the audit and filter `projects` by `age_bucket`. “Delete over 20 days”
   selects `over-20` candidates for review. Use `records` to narrow a mixed
   workspace to a specific disposable subtree, such as a Remotion build cache.
   Recent writes, live processes, dirty Git, unique handoff outputs, recovery
   data and scan gaps must be visible in the review.
2. Inspect proposed absolute paths, producer state, ownership, consumers and
   recovery. Provide fresh per-file evidence to the existing cleanup engine.
   A finished process ID and a verified regeneration recipe or retained copy
   are evidence. A name, age, or a lockfile alone is insufficient.
3. Use `storage-plan --input <local-json>` or
   `freezeStorageBatch({report, age_bucket, selections})` from
   `_refs/cleanup/storage-batch.mjs`. Inputs use the JSON report object,
   bucket key, and explicit selections. With empty selections, the result is a
   review list only. A selection contains `path` (absolute audited directory),
   `root` (absolute engine root, defaults to the audited root), `action`
   (`delete` or `quarantine`), `recovery_basis`, and optional
   `reference_scope`, `evidence`, `task` and `posix_boundary`. Reuse the
   engine's root-relative evidence map, bounded reference scopes and the
   existing POSIX admission. Example selection path
   `C:\Users\Admin\Documents\Codex\2026-10-29-demo\.remotion\cache`
   means **only the exact files in that cache**, not the workspace or its videos.
   The workspace directory itself is never removed by a file-only plan.
4. Show the batch ID, selected and held paths, operation, affected data,
   exact file list, estimated reclaim and its basis, and recovery evidence for
   each item. Hold mixed scopes with protected or unsupported entries for
   narrower review. Dirty repositories, nested repositories, worktrees,
   junctions, hardlinks and recovery data keep their engine boundaries.
   Use an individual repo as the engine root only for a separately checked
   child scope. Do not use a parent scan to remove a repo or worktree.
   Existing exact-scan budgets still apply. If a scope is too large, split it
   into disjoint audited subdirectories and retain any file the engine cannot
   fingerprint. The metadata report itself has no cleanup hashing limit.
5. Bind the user's single approval of the displayed items and actions using
   `approveStorageBatch(batch, {source: 'conversation', decision: 'approve',
   item_ids: [...]})` in the trusted harness. If the same frozen batch and
   items were already approved, reuse that approval. Keep reports, batch,
   approval and receipts runtime-local, outside analyzed scopes. Apply with
   `storage-apply --input <local-json>` containing `batch`, `approval` and
   current POSIX `maintenance` keyed by item ID when required. A harness can use
   `applyStorageBatch` with an `observe(item)` callback for current task and
   producer evidence. Recheck known writers before apply. The engine also checks
   recorded producer PIDs and the native file boundary at the point of removal.
6. Report each confirmed removed file, retained scope or error, and any
   interrupted native transaction. Sum confirmed logical file bytes removed
   by delete separately from native allocation and the measured available
   space before and after on the audited volume. Partial execution is explicit.
   A new file, changed reference or changed producer holds stale work while
   independent approved items continue. Replan and reapprove changed items.
   Quarantine can remove active paths while holding bytes on the same volume.

## Dependency recovery evidence

Run the read-only `_refs/cleanup/inspect_npm.py --workspace <absolute-root>`
with the selected Python. It compares manifest/source/installed lock metadata,
records hashes, and derives Node/package-manager requirements from the project.
Optional binaries explicitly excluded by host OS/CPU are recorded separately;
missing required/compatible packages and version/integrity drift remain holds.
It reads no dependency contents and grants no deletion authority. `.npmrc` is
hashed without reporting its contents; review only necessary non-secret settings.
Version files expose only a parsed numeric version, never raw comments/content.
Invalid/empty values and unresolved aliases remain holds rather than established
runtime requirements. Invalid engine/package-manager syntax is not echoed.
Range syntax recognition does not evaluate compatibility with the current
runtime. A declared non-npm manager or competing lockfile holds npm ownership;
the helper omits an npm recovery recipe until that ownership is established.

The npm registry hostname also serves private scoped packages. URL/integrity
alone cannot prove public access or reacquisition. The helper always reports
network recovery unverified and lists scoped packages needing visibility review.
Do not print credential-bearing URLs, tokens, auth/config or raw cache indexes.
Before a recovery-dependent action, verify artifacts can be reacquired without
hidden credentials or preserve a verified backup. Do not purge the sole offline
cache and installed dependency copy together.

Workspace topology, Yarn/pnpm/shrinkwrap, local/git/private dependencies,
overrides, patch-package/local edits and install lifecycle scripts need their
own review. Preserve active consumers, copied fixtures, frozen evidence and
unknown owners. Matching lock metadata is not proof of unmodified installed
files, inactivity or recovery readiness. Derive reinstall commands and flags
from project policy; never hardcode Node or infer `--legacy-peer-deps` from an
Angular major. Reinstall is regeneration, not backup restoration. Do not run
install merely to refill the reclaimed space. Dependencies remain protected by
the current mutation engine; any unsupported action stays a concrete handoff.

## Windows and provider consumers

| Consumer | Inspection and next action |
|---|---|
| Angular/Next caches | Identify actual configured cache path and content. Keep sibling source/fixtures, Next fetch persistence, required server output and active producers. Prepare exact supported actions only after evidence/authority. |
| npm/npx, Yarn, pnpm, pip, uv caches | Inspect provider ownership and recovery. Even npm cache verify can garbage-collect; it is not a read-only probe. Shared/hardlinked stores need provider accounting. |
| Temp/crash dumps | Select exact finished reproducible subtrees. Temp can contain VM disks, installers, test fixtures and needed diagnostics. |
| Codex state, chat SQLite/sessions, profiles, images/plugins, browser/SDK runtimes | Application/user functionality; retain. Use supported retention/uninstall controls only when requested. |
| Windows/WinSxS/Installer, package caches, Windows.old | System-managed; no manual deletion. Supported cleanup may remove rollback/repair ability and needs the corresponding decision. |
| pagefile, swapfile, hiberfil | Retain; changing memory/hibernation is a functionality change. |
| Personal files, Recycle Bin, messages, databases | Retain; unique data/recovery is not generic cache. |

For Docker/WSL, first record VHDX logical length and host allocation separately.
Use ordinary read-only `docker version`, `docker system df`, available build-cache
inspection and selected non-secret container/image/volume fields; use
`wsl --list --verbose` for state. A stopped/unavailable/denied daemon leaves
internal reclaimability unknown. Do not start services, change endpoints or
permissions to bypass it. Do not expose raw inspect env/auth payloads.

Internal provider GC and host compaction are distinct later stages with their
own exact workload/recovery/state authority. Docker's reclaimable count is not
disposal permission. Never manually delete VHDX, reset/unregister WSL, or sweep
volumes/databases using broad prune commands. Consult current official provider
documentation before choosing version-dependent GC/compaction operations.
Internal bytes reclaimed, host allocation reduction and observed free-space
delta are different metrics; background writers can change the latter.

## Close with evidence

Preserve the existing native mutation engine, fresh inventory/identity/lock,
producer, Git/config and exact authority gates. Analysis scope never widens
mutation scope. Record completed/held/failed actions incrementally; unsupported
provider/dependency effects stay held. Same-volume quarantine frees no space.
Compare exact absent-after receipts to current existence to identify cache
regrowth. Propose producer-side cache limits only with verified version/config
support; no silent cache disabling, worktree deletion or scheduled jobs.
