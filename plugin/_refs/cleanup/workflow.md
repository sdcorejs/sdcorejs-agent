# Cleanup Workflow And Runtime Integration

Load this reference for cleanup authority, proactive offers, task-tail scope,
or readiness consumption. The filesystem engine is
`_refs/cleanup/cleanup-engine.mjs`; exact plan, policy, and recovery authority
live in `_refs/cleanup/cleanup-contract.mjs`. The runtime coordinator and
readiness policy live in `_refs/cleanup/offer-policy.mjs`.

## Modes And Authority

| Mode | Entry | Authority and outcome |
|---|---|---|
| `analyze` | Explicit bounded inspection or accepted offer | Read-only scan and classification; report evidence, protected paths and unknowns. |
| `plan` | Analysis with a proposed exact action list | Freeze exact paths/actions/state; no filesystem mutation. |
| `apply` | Frozen plan and explicit matching mutation approval or approved LOW task policy | Revalidate, apply bounded actions, verify, and emit an exact receipt. |
| `restore` | Explicit approval bound to a recovery receipt | Restore exact quarantine/archive entries; occupied destinations block without overwrite. |
| `task-tail-cleanup` | Completed current task after durable finalization | Select already-known artifacts; approved policy covers only qualifying LOW task outputs. |

"Check the repo", "review this folder", an offer acceptance, a finding,
automatic analysis, and an ignored filename do not authorize deletion,
quarantine, archival, or movement. Quarantine removes an active path and
requires mutation authority. `local_only` is a commit classification, not
disposability. Git ignore patterns are never cleanup allowlists.

Read scope and mutation scope are separate. Pass explicit discovery `scope`
and separately bounded `reference_scope` to `scanCleanup`. Reference coverage
that does not resolve dynamic paths, templates, copy/glob configuration,
exports and external/public consumers stays unknown. Do not expand into
nested/submodule/sibling repositories, global caches, cloud, containers or
databases. New scope requires new authority.

## Exact Action Boundary

Use `scanCleanup` -> `freezeCleanupPlan` -> `approveCleanupPlan` or the already
approved `approveCleanupPolicy` -> `applyCleanupPlan`. Globs may identify
candidates; frozen actions contain exact files. Never use recursive deletion,
destructive shell wildcards, or `git clean -fdx` as the engine.

Analysis and planning are portable. Windows mutation uses the supported
local-drive native handle boundary. Linux/macOS use the explicit POSIX
maintenance boundary below. Unsupported platforms, volumes or physical
identity checks fail closed. Revalidation and the admitted native boundary
preserve approved parent/file identities through removal and recovery.

Approval binds plan identity, exact actions, content/state fingerprints and
root. HIGH actions need individual or explicitly atomic-group approval;
MEDIUM actions need bounded batch approval unless an explicit policy covers
them; LOW is automatic only within an approved qualifying task policy.
Unknown ownership/evidence, active producers, modified files, unsafe links,
repository boundaries, sensitive content and unreliable recovery block.

Revalidate immediately before each action. Changed files/references/producer
state, new directory entries, changed repository state or links, or another
cleanup writer stop stale work; replan and reapprove. A newly appeared file
never enters a previously approved recursive operation.

Keep immutable approved specs, plans, architecture, ADRs, decisions and
historical evidence. Mark supersession relationships rather than deleting
unique history. Exact hashes establish identity, never deletion authority:
brand variants, fixtures, independently evolving copies and official generated
mirrors can be intentional. Near matches remain review suggestions. Reference
rewrites, consolidation, source refactors and public-contract changes hand off
to their owning workflow.

## POSIX Native Admission And Recovery

Use `inspectCleanupPosixCapabilities({root, python})` from
`_refs/cleanup/posix-file-operation.mjs` with an already installed absolute
CPython executable. The read-only probe returns its resolved path, hash,
version, helper hash, root identity and actual native filesystem profile.
It does not demonstrate rename or durability behavior. No PATH/alias search,
runtime installation, permission repair or shell fallback is performed.
The canonical `_refs/cleanup/safe-file-operation.py` runs with `-I -S -B`.
Initial profiles require CPython 3.11-3.14, x64/arm64, Linux local read-write
ext4 with `renameat2(RENAME_NOREPLACE)`, or macOS local read-write APFS with
`renameatx_np(RENAME_EXCL)`. Network/FUSE/overlay/removable profiles, unknown
ABI, ignored ownership, unsafe owner/write access, extended ACLs and BSD
flags are unsupported initially. Exact selected interpreter/helper ancestors
and all mutation parents are inspected; existing metadata is never changed.

Display the maintenance prerequisite before asking for mutation authority.
The trusted harness supplies `maintenance`: exact root/task, current generation,
conversation source, owner attestation, nonempty known participants, positive
quiescence evidence, closed writable descriptors and quiescent children.
Every known editor/watcher/build producer and ancestor-name writer must finish
or remain paused; cooperating apply/restore/producer workers use the same
`.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock` inode. Keep that inode
after release. Never unlink/recreate, expire or steal it. A cleanup-only lock
and a finished-producer boolean do not establish maintenance. Hidden
uncooperative same-user or privileged mutation violates this prerequisite;
advisory locking supplies no exclusion guarantee against it.

Pass `posix_boundary` to `freezeCleanupPlan`: `version: posix-maintenance-v1`,
`root_id`, the probe's `python`, `helper_sha256`, `profile`, and approved
`maintenance`. CLI `plan` accepts the same field in its explicit JSON input.
Plan approval fingerprints that boundary and exact transaction/recovery paths.
Pass current `maintenance` separately to `applyCleanupPlan`/CLI apply; changed
admission or generation blocks. An old LOW policy has no POSIX authority:
approve a separately bounded policy with this exact `posix_boundary`.
Restore needs a separate receipt-bound approval containing its current
POSIX boundary and separately supplied current maintenance. No example or
probe supplies conversation mutation approval.

Inode/device and nanosecond times are lossless decimal strings; milliseconds
are diagnostic fields. Hold one isolated native session and its descriptors
through the batch. Freeze exact same-filesystem private capture/journal paths;
copy recovery/archive bytes exclusively from the approved source descriptor,
verify and synchronize them while the source remains active, then revalidate
source, parents, fence and recovery before exclusive capture. Validate the
captured identity/content and expected rename ctime transition before removing
only that private validated entry. No recursive or checked-path source unlink
is used.

Journal `PREPARED`, `RECOVERY_VERIFIED` when required, `CAPTURED`, `VALIDATED`,
`COMMITTED`, and `VERIFIED`. Interrupted/failed transactions are retained and
never automatically resumed, compensated, overwritten or purged. Unknown
helper state is partial/unknown. An unexpected captured object is retained with
actual displacement and `contract_breach: true`; that event is containment
evidence, not successful satisfaction of the exact-object invariant. Preserve
its capture, journal, original parked object when known and recovery bytes for
separately authorized inspection. This utility currently restores verified
completed quarantine/archive receipts; it has no automatic interrupted-capture
recovery operation. Occupied restore targets preserve both objects. Delete
without separately approved retention is irreversible after commit.

File/directory `fsync` and process-interruption fixtures do not establish
hardware power-loss recovery. POSIX source allocation uses `st_blocks * 512`;
logical removal, held recovery and unmeasured net volume reclaim stay separate.
Actual native apply/delete/quarantine/archive/restore and adversarial fixtures
must pass on each declared OS/filesystem before release claims. The fixtures
require an explicitly selected trusted `SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT`
and existing absolute `SDCOREJS_CLEANUP_PYTHON`; they fail for unavailable native
capability on those OSes. Windows skips are explicitly `NOT_RUN` for POSIX.
The reference checker compiles Python in memory when that executable is
supplied; absence prints `NOT_RUN`, and syntax proof is not native OS evidence.

## Significant Runtime Signals

Explore, test, review, design and documentation may emit observations already
encountered in their primary bounded work. No extra full-repository sweep,
global queue, session manifest, background job, or persistent mutable index is
created. Explore uses `buildExploreCleanupSignals`; other producers use the
same `normalizeCleanupSignal` schema:

```yaml
cleanup_signals:
  - source: sdcorejs-explore
    significant: true
    scope:
      repository_id: <stable repository identity>
      paths: [<bounded repository-relative file or directory>]
    category: <diagnostics | preview | duplicates | documentation | assets>
    evidence:
      - kind: <producer-finished | reproducible-output | content-match | superseded-by | artifact-relationship | reference-coverage | disk-pressure>
        confirmed: true
        paths: [<observed path inside signal scope>]
        detail: <positive evidence without secrets>
    observed_state:
      fingerprint: <observed state identity>
    unknowns: [<unresolved ownership, consumer or recovery question>]
    reason_to_offer: <why bounded analysis is worthwhile>
```

`significant: true` needs positive evidence and material impact; age, mtime,
a `tmp` name, ignored state or zero grep matches are insufficient. Signals
carry no `safe_to_delete` assertion. Intentional duplicates and required
diagnostics are not housekeeping defects. Unknowns remain visible and cannot
become MEDIUM-risk deletion candidates by omission.

## One Coordinator, One Offer

Pass `cleanup_offer_state` through the existing runtime `context.pass`
handoff, including across workflow changes. Initialize it once with
`createCleanupOfferState({scope_id})`; never save it in project context or
`.sdcorejs/**`. `coordinateCleanupOffer` groups same-repository observations,
deduplicates worker findings and keeps at most one unresolved offer. Workers
emit findings only; the sequential/fan-in owner presents the offer.

Present after the primary explore result, or after core work and durable
classification before final readiness for related task artifacts. Do not
interrupt root-cause diagnosis. A concrete disk-pressure blocker may warrant
bounded analysis; it still grants no deletion authority.

The choices are bounded read-only analysis, skip this offer, or disable
cleanup offers for the session. Use the existing `selectInteraction` text
ladder: native structured choice when supported, numbered Markdown otherwise.
Localize labels and preserve stable selectors/offer identity. For clear
localized replies, normalize the conversation response to its selector before
`resolveCleanupOffer`; ambiguous or stale responses retain the pending offer.

Accepted analysis returns an `analysis_authority` with `read_only: true` and
`mutation_allowed: false`; pass its exact scope to analysis. Any later
mutation needs its separate frozen-plan gate. A decline suppresses that same
finding across producers for this session, even when its observation changes.
Disable applies to every producer until the user explicitly re-enables offers.
Persist "never offer this folder/repo" only through an existing owned
preference mechanism with explicit persistence approval.

The existing communication contract preserves conditional top-level
`cleanup_offer_state`, `cleanup_signals` and `cleanup` fields exactly in
portable handoffs when native context is unavailable or unknown. Missing
optional fields remain absent. Cleanup consumes the existing `artifact_context`
route; no additional implementation track or repository-backed session state
is created. Preserve these fields across all consumer workflows, and keep
them out of routine user projections.

## Task Tail

The sequential/fan-in owner runs this order:

```text
implementation -> tests/review/fixes -> durable artifacts finalized
  -> current-task cleanup -> affected verification
  -> ship/convergence -> final read-only branch-ready -> requested Git work
```

`selectTaskTailCleanup` intersects the current change's `artifact_context`
`local_only` entries with exact approved policy paths and positive task/owner/
producer/reproducibility evidence. It performs no scan. It excludes durable
bucket conflicts, unrelated tasks, active/needed diagnostics and unknowns.
Run analysis of only that selected scope, freeze actions and let the engine
revalidate its LOW authority. An empty eligible set simply preserves files.

Failed, cancelled, interrupted and unfinished tasks retain diagnostics and
recovery evidence. Current task policy never covers docs, public assets,
reference screenshots, baselines, durable assets or unrelated task outputs.
Do not turn every finish gate into a full-repository cleanup scan.

## Receipts, Recovery And Readiness

Engine receipts distinguish removed active bytes, held quarantine bytes,
archived bytes and actually reclaimed bytes. Removed active bytes are logical
file sizes; reclaimed bytes come from the filesystem's measured allocation,
not logical size. Unavailable allocation evidence stays explicitly unknown and
contributes zero proven reclaimed bytes. Quarantine on the same filesystem
does not reclaim space. Keep receipt, quarantine and runtime state local-only
and uncommitted. Persist a redacted receipt only when the artifact model has an
approved durable need; otherwise hand it off as runtime evidence.
Deletion's metric basis is the native source allocation removed, which may
exceed or fall below logical size. A net volume free-space delta is unmeasured
and must not be reported as observed reclamation. Quarantine and archive
contribute zero reclaimed bytes; restore reports returned logical bytes.

Built-in filesystem/reference checks can pass while `affected_checks` remains
`NOT RUN`: that receipt is `applied`, never ship verification. Run the affected
commands using `applyCleanupPlan`'s verifier callback and preserve actual
command/evidence. Receipt status becomes `verified` only after current checks.
`restoreCleanup` follows the same affected-check boundary. A successful copy
with no verifier returns `restored` with `affected_checks: NOT RUN`, which
cannot satisfy readiness.

`evaluateCleanupLifecycle` validates engine receipt hashes, action/byte
accounting, snapshot chains, absence of errors, affected-check evidence and
current mapped command/path coverage. Capture the current cleanup snapshot
independently with `captureCleanupState`, using the same declared scopes and
producer/ownership evidence. Never infer that fingerprint from HEAD alone.

Convergence and ship accept this optional runtime projection:

```yaml
cleanup:
  receipts: [<exact engine apply/restore receipts in mutation order>]
  current_snapshot: {fingerprint: <independently captured cleanup fingerprint>}
  evidence_refs: [<current canonical EVIDENCE ids>]
```

Mapped rows retain actual affected-check commands, current result/freshness,
source revision/fingerprint, task/validation relationships where applicable,
and every mutated active path. Their `cleanup_receipt_ids` explicitly include
the latest mutation receipt, contain only unique IDs from the supplied receipt
chain, and commands must match that event's actual
verifier commands. An earlier absence check cannot prove a restored path, even
when the Git fingerprint and path list are unchanged. This evidence joins the existing validation
graph; it does not invent a new artifact lifecycle class. Canonical convergence
preserves ordered engine receipt arrays and binds `cleanup_receipt_ids` to its
compact result. Any later cleanup invalidates prior convergence even if the
Git fingerprint excludes local-only outputs.

Restore emits a new sealed receipt with `operation: restore` and
`restore_of_receipt_id` linking its original quarantine/archive receipt. Every
restore parent must resolve to an earlier receipt in the supplied chain;
restore-only handoffs cannot omit an unresolved apply or its failed checks. Its
exact `restored` actions join active-path verification coverage, and
`restored_bytes` records returned data; removed/reclaimed/quarantine/archive
byte metrics remain zero for that restore event. Keep the apply and restore
receipts in mutation order when both are present. Their source snapshots and
recovery action identities must agree. Mapped command evidence verifies the
restored active path rather than reusing the earlier absence check.

Current convergence and final branch-ready include the new restore receipt
ID. An apply-only result remains stale after restore, including when the Git
fingerprint is unchanged. A restore receipt never silently turns an earlier
unresolved apply or affected-verification failure into success.

Final branch-ready records the same receipt IDs; ship uses
`delivery.branch_ready_cleanup_receipt_ids`. Missing/stale receipts, partial
apply, unverified affected checks or cleanup after final branch-ready block
readiness. Restore is also a mutation: rerun affected verification,
convergence and branch-ready after restoring. Filesystem success alone never
proves cleanup success or Git readiness.

This utility does not prune Git history/branches/worktrees, dependencies,
Docker, databases, cloud storage or system caches, or perform code refactors.
Findings outside its authority hand off to the appropriate owner.
