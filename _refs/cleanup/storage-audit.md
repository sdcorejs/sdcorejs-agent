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
may count hardlinks repeatedly. Allocation is measured only for the top large
files, not for all directory totals. Record volume-free observations separately.

Give each significant group an exact path/provider, size/basis/date, coverage,
recommendation, recovery prerequisites, blocker and next supported action.
Prioritize likely material space returns instead of many tiny deletions.

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
