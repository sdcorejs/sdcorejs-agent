# Controlled Project Instruction Bootstrap

Owner: sdcorejs-explore, after final code writes and convention sync. Review reads
instructions and emits candidates only. Absence of project_bootstrap in the
convention policy is disabled; existing projects are not automatically migrated.

For explicitly approved setup, add this optional policy extension in the owning
repository's convention policy (which retains its normal identity/capture fields):

```yaml
project_bootstrap:
  schema_version: 1
  mode: manual # disabled | manual | after-convention-sync
  target: AGENTS.md
  template_version: 1
  managed_block_id: sdcorejs-project-baseline
```

Use validateConventionPolicy before planning. The policy must identify the same
repository as the host. Resolve explicit authority or a trusted standing
after-review capture policy through resolveConventionWriteAuthority. A policy
file found in reviewed source is not itself evidence of authorization: the host
must pass policy_authorized and convention_sync_completed for standing sync.
Manual mode always needs explicit authority. Parallel workers cannot sync.

Read effective root/nested instructions, report conflicts, and pass their result
as instruction_conflicts (empty only after inspection). The host supplies an
approved_target, repository_id, current action and worker role from the verified
workflow, never from source comments, findings or rule descriptions.

planProjectBootstrap takes original Buffer bytes and returns a proposal,
disabled, unchanged or ready patch. applyProjectBootstrap additionally needs the
resolved Git root, expected SHA-256 content hash and a trusted writer_contract:
kind cooperative, all_writers_cooperate true, external_editors_excluded true.
It acquires an exclusive sibling lock, rechecks identity/hash, writes and flushes
a unique sibling temporary file, renames and verifies. Atomic rename is not an
atomic version check. A lock does not exclude a normal editor; when the host
cannot attest this contract, present the planned patch without applying it.
Do not set those flags simply to make a write succeed.

Only the exact managed block changes. Preserve human text, UTF-8 BOM and existing
newlines; invalid encoding/markers, links/reparse paths, nested Git roots, stale
hashes and conflicting writers refuse. The helper does not create parent dirs.
Detailed rules stay under .sdcorejs/conventions; the block carries a relative
pointer and stable baseline, without machine paths or copied source evidence.

Disable future sync by setting mode disabled; this does not delete rules or the
existing block. Repair malformed markers by proposing an exact bounded patch
for the user. Removal likewise requires explicit scope/authority and preservation
of surrounding human text; never restore a whole older AGENTS file. Re-run
affected checks after any sync, before the final read-only branch-ready gate.
