---
name: sdcorejs-cleanup
description: Use for disk pressure, workspace size/age inventories, scoped delete batches, cache/node_modules or machine/Docker/WSL storage audits, legacy worktree audits, post-merge worktree/branch/Docker cleanup, or output/asset/doc hygiene. Portable analyze/plan are read-only; exact mutation authority required. Windows local-drive apply/restore; Linux ext4/macOS APFS need trusted CPython and approved maintenance. Source refinement, test teardown and quality review keep their owners. Runtime-localized.
allowed-tools: AskUserQuestion, Bash, Edit, Glob, Grep, Read, TodoWrite, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->

**Path resolution:** Resolve `../../_refs/...` relative to this `SKILL.md`. Resolve another SDCoreJS skill by opening the sibling folder `../<skill-name>/SKILL.md`.


# Cleanup

## Shared protocols and ownership

Read `../../_refs/shared/runtime-protocols.md`, then apply Project Context Preflight
v2 from `../../_refs/shared/project-context.md`. Read repository instructions and
current changes; resolve the target repository and explicitly bounded scope.
Use `../../_refs/shared/tasklist.md` for non-trivial work and
`../../_refs/shared/user-choice-prompt.md` before a decision. Keep reusable source
English; localize runtime prose and preserve exact paths, hashes and commands.

This utility owns filesystem hygiene, not an implementation track. Source
refinement belongs to `sdcorejs-simplify`; tests and data teardown belong to
`sdcorejs-test`; quality assessment belongs to `sdcorejs-review`; rewriting or
consolidating docs belongs to `sdcorejs-documentation`. A candidate requiring
imports, public API or code changes is a finding/handoff to its existing owner.

For disk-space or dependency-size requests, select `storage-audit` and load
[`../../_refs/cleanup/storage-audit.md`](../../_refs/cleanup/storage-audit.md).
It inventories explicit local roots by metadata without reading VM contents
or hashing millions of files. Whole-machine inspection includes accessible
fixed local volumes, not network/removable drives unless requested. Analysis
does not authorize cache cleaning, dependency pruning or Docker changes.

For workspace inventory by project and age or "delete items over 20 days",
load [workspace-inventory.md](../../_refs/cleanup/workspace-inventory.md).
Run the dated storage audit, describe contents and coverage, and present a
review list. Freeze exact supported scopes with `workspace-plan` and use
`workspace-apply` only after matching batch authority. Existing file, Git,
producer and recovery boundaries apply to every unit.

For completed-and-merged task resources, select `post-merge-cleanup` and load
[`../../_refs/cleanup/post-merge.md`](../../_refs/cleanup/post-merge.md). This is a
separate post-merge workflow using exact native Git/Docker operations; the
read-only planner never runs commands. It can reclaim dependency trees inside
an approved disposable worktree. A completion message or PR closure alone is
not merge evidence. Reuse exact task-resource authority already granted in the
conversation; the pre-merge LOW file policy does not cover these operations.

For legacy resources or automatic lifecycle proposals, load
[`../../_refs/cleanup/resource-lifecycle.md`](../../_refs/cleanup/resource-lifecycle.md).
`resource-audit` observes registered worktrees/local branches without requiring
old task records; Docker needs an explicit context and repository-label scope.
Unknown original ownership stays review-only, including after audit acceptance.
Select `lifecycle-assess` at these boundaries: run the coordinator on current
trusted context and copy its result unchanged into `resource_cleanup_context`.
Keep `.status` and `.completion.status` verbatim in enclosing handoff fields;
localize explanatory prose, not the typed assessment. Use its
completion/offer/authority result instead of deriving safety from task-status
labels. An `offered` result needs one consumer analysis proposal; an existing
covered grant needs fresh revalidation rather than another approval question.
Carry the full returned result in runtime context. Presenting its analysis
choice and handing authorized IDs to the native owner are separate steps;
describing an offer as "ready" does not present that choice to the consumer.

Load [`../../_refs/cleanup/workflow.md`](../../_refs/cleanup/workflow.md) for the
runtime scope, offer and task-tail contract. Use the single engine
[`../../_refs/cleanup/cleanup-engine.mjs`](../../_refs/cleanup/cleanup-engine.mjs)
and its pure policy
[`../../_refs/cleanup/cleanup-contract.mjs`](../../_refs/cleanup/cleanup-contract.mjs).
The storage helpers are read-only observation tools, not a second mutation
engine. Do not implement another cleanup executor or run `git clean -fdx`.

## Select one action

| Action | Boundary |
|---|---|
| `storage-audit` | `runStorageAudit`: read-only metadata inventory of explicit local roots, including caches/dependencies and opaque virtual disks; no mutation plan or authority. |
| `workspace-plan` | Review an inventory age filter and freeze evidenced independent file plans. |
| `workspace-apply` | Apply the exact approved batch via the existing engine and reconcile every unit. |
| `resource-audit` | `auditResources`: bounded read-only repository/worktree/branch metadata, optional dependency/cache sizes and explicitly scoped Docker metadata; legacy ownership/use remain unknown. |
| `lifecycle-assess` | `coordinateResourceCleanup`: read-only event assessment over trusted current task/audit context and shared offer state; no native execution or new authority. |
| `analyze` | `scanCleanup`: read-only scan, evidence and classification of explicit scope. |
| `plan` | `freezeCleanupPlan`: exact actions and current fingerprints, with no filesystem mutation. |
| `apply` | `applyCleanupPlan`: separately authorized actions, immediate revalidation and affected verification. |
| `restore` | `restoreCleanup`: recover exact receipt paths; fail if the destination is occupied or recovery bytes changed. |
| `task-tail-cleanup` | Current-task artifacts only, after durable finalization and before convergence/final branch-ready. |
| `post-merge-cleanup` | After verified merge and producer shutdown: plan exact task worktrees/local branches and exclusive stopped Docker containers/images; execute only separately authorized, freshly revalidated native operations. |

Default to `analyze`. "Check this repo", "review this folder", "see what is
unused", and accepting a proactive offer authorize analysis only. Analysis
authority and mutation authority are separate. Quarantine and archive remove
active paths and therefore also require mutation authority.

For a disk-space request, default to `storage-audit`. Resolve authority from
the full conversation: reuse existing matching authorization rather than
asking again. Broader inspection does not broaden earlier mutation scope;
existing exact-action/state gates still apply before a supported mutation.

## Evidence before action

Separate evidence certainty from impact/recoverability. Preserve the existing
artifact lifecycle for durable/shared durable and diagnostic outputs; reuse
`required_with_change`, `shared_owned`, `conditional`, `local_only` and
`unknown` buckets. `local_only` does not mean disposable. Keep debug, review,
reproduction and recovery evidence, including failed/interrupted task outputs.
Read `../../_refs/shared/artifact-lifecycle.md` before any affected durable artifact.

Never infer disposal from age, naming, AI generation, `.gitignore`, equal
hashes, or absence of an import/grep match. Assets require bounded reference
coverage across dynamic/template paths, configured copies/globs, exports,
runtime lookup, documentation, generated registries and external/public
consumers. Incomplete coverage remains `unknown`.

Classify docs as current, outdated-but-needed, superseded, historical,
abandoned-draft, or unknown. Approved specs/plans/architecture/ADRs/decisions
and unique historical evidence remain immutable; mark relationships or hand
off an update rather than deleting history. Exact duplicates use size/hash
evidence plus path semantics and ownership; brand variants, isolated fixtures,
versioned docs and canonical distribution mirrors can be intentional. Near
duplicates recommend review, never automatic deletion.

| Risk | Mutation authority |
|---|---|
| `LOW` | Approved exact task policy only: task-owned, reproducible, finished producer and no longer needed as evidence. Otherwise obtain exact approval. |
| `MEDIUM` | Bounded batch approval unless an explicit policy covers the exact action. |
| `HIGH` | Explicit file or atomic-group approval for tracked/public assets, docs, baselines or unique content. |
| `BLOCKED` | No mutation: changed/active files, unknown ownership/evidence, unsafe boundaries, sensitive paths or unreliable recovery. |

Unknown never falls back to MEDIUM. HIGH-risk approval includes detailed
file/group evidence; compact routine output cannot obscure a destructive
decision's scope, count, action, reason, risk, recovery and verification.

## Freeze, revalidate, apply and recover

Resolve analysis/reference scope separately from mutation scope. Discovery
globs do not authorize actions. Freeze exact file paths/actions with reason,
evidence/unknowns, content and state fingerprints, recovery strategy and
verification. Available actions are keep/review/quarantine/archive/delete;
update or consolidation beyond cleanup authority remains a handoff.

Bind approval to plan identity, exact actions and relevant state. Immediately
before each apply, recheck content, references, ownership, Git state,
directory inventory, symlink boundaries, producer completion and writer
exclusion. Drift stops the stale action and requires replan/reapproval as
appropriate. Never recursively remove a newly appeared file outside the plan.

Fail closed on traversal, ambiguous roots, links/junctions, nested repositories
or submodules without separate authority. Never follow a link target or expand
into sibling repositories, global caches, containers, databases or cloud data.
Use bounded engine operations and exact paths, never destructive shell globs.

After apply, verify affected behavior and inspect the exact result. A receipt
records completed, retained and failed actions and enough recovery evidence;
partial apply is not total success. Report removed active paths, held
quarantine bytes and actually reclaimed bytes separately. Same-filesystem
quarantine does not reclaim space; archive is durable history, not quarantine.
Restore never silently overwrites an occupied destination.

Analysis is portable. Windows mutation uses the existing PowerShell helper
with pinned native file handles. Linux/macOS mutation requires an explicitly
selected existing trusted CPython 3.11-3.14 executable, a frozen native
capability profile and separately approved cooperative maintenance. Initial
POSIX profiles are local ext4 on Linux and local APFS on macOS, on x64/arm64;
unsupported runtime, filesystem, ownership, ACL or flag checks block effects.
No runtime is installed and no existing permission is changed.

Before POSIX mutation approval, explain that all known content/name writers,
watchers, children and retained writable descriptors must finish or stay
quiescent under the same stable repository fence. Require current scoped
owner/participant evidence and generation. Hidden uncooperative writers violate
this operating prerequisite; advisory locking does not exclude them. An
unexpected capture is a retained partial contract breach, never new authority
to move/delete a replacement or automatically overwrite a rollback target.

Recovery/archive copies are verified before capture/removal. Preserve exact
journals, recovery paths and interrupted captures for separate inspection and
recovery authority; never resume or purge them automatically. Report reclaimed
bytes on the native source-allocation basis; net volume free-space change is
unmeasured. Missing capability retains read-only analyze/plan. Release claims
require actual native tests on each declared platform; skipped Linux/macOS
fixtures are `NOT_RUN`, even when Windows and shared contract tests pass.

## Offers, task tail and handoff

Explore/test/review/design/documentation workers emit evidence signals only.
The integration owner deduplicates them and uses
[`../../_refs/cleanup/offer-policy.mjs`](../../_refs/cleanup/offer-policy.mjs)
at a safe boundary after the primary result. Offer at most one unresolved,
significant bounded analysis; use native structured choices when supported,
otherwise numbered Markdown. Honor decline for the same finding and session
disable across workflows. Acceptance is not mutation approval. Do not
interrupt root-cause debugging or create a persistent global queue/session
index. A persistent preference needs explicit persistence authority and the
existing preference owner.

Task-tail cleanup scans only proven current-task artifacts. Preapproved LOW
policy excludes unrelated tasks, durable docs/assets, public assets, baselines,
unclear owners and needed diagnostics. Finalize durable artifacts first,
apply authorized cleanup, rerun affected verification, then pass cleanup
evidence to ship/convergence and final read-only branch-ready. Any later
mutation invalidates readiness and requires the affected gates again.

Keep plan, policy, offer/suppression and receipt state runtime-local unless an
explicit durable artifact need follows the existing artifact owner and
lifecycle. Never commit runtime outputs, quarantine or temporary files.

The ordinary filesystem actions and pre-merge task tail never delete branches,
worktrees or Docker resources. Only `post-merge-cleanup` admits its explicitly
bounded native operations. No Git history or remote-branch deletion, standalone
dependency pruning, refactor, broad Docker prune, volume/database/cloud cleanup,
automatic system-wide scan, background daemon, cron or new dependency. Explicit
storage-audit may observe machine-wide metadata; it does not expand mutation,
proactive offers or task-tail boundaries.
