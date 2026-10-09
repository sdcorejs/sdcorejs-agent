---
approval_source: existing-user-maintenance-choice-and-parent-end-to-end-validation-integration
approved_at: 2026-10-02T12:40:02.265Z
approved_by: workspace-owner
artifact_id: sdcorejs-cleanup-posix-architecture-r3
artifact_kind: architecture
change_ref: sdcorejs-cleanup
commit_policy: never
contract_id: sdcorejs-cleanup:v1
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:85d3646781608f01bf845b820664b5f0f9eddc97aeff017a12793211b5dd98af
    artifact_id: sdcorejs-cleanup-posix-spec-r3
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
parent_repository_id: null
repository_relative_path: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
requirement_id: R-009
schema_version: 1
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
stack_profile: markdown-skill-pack
supersedes: sdcorejs-cleanup-posix-architecture-r2
track: workflow
approval_hash: sha256:v1:bee2dc600827f9f8989a688746010a426f5498ac4c088804a14a887552a6bac2
---

# POSIX cleanup architecture

Shared policy owns classification, frozen approvals and semantic-state revalidation; native helpers own anchored object mutation. Windows PowerShell remains unchanged. POSIX uses an existing trusted isolated CPython process: it holds a stable repository maintenance-lock inode throughout apply/restore, receives bounded structured requests and releases the advisory lock without unlinking its inode. Participating producers must use that same fence. Lossless decimal inode/device/nanosecond values remain separate from Windows double wire values.

The backend rejects unsafe root/ancestor/source/stage/destination security metadata and unsupported filesystem/runtime primitives before effects. File creation is exclusive with owner-only creation modes; existing permissions are never rewritten. Directory descriptors reject links, nested .git boundaries and cross-device capture. Linux renameat2(RENAME_NOREPLACE), Darwin renameatx_np(RENAME_EXCL), Python native stat and descriptor operations are declared ABI facilities, tested on actual target profiles. Extended ACLs and special BSD flags are unsupported initially.

Freeze one exact transaction path per action. Journal intent, verify/synchronize recovery before capture, revalidate the source immediately, capture only the approved leaf, validate identity/hash and expected rename-induced ctime, then remove only that private entry. A final-barrier mismatch is a retained contract breach, not new authority. Recovery/restore are explicit separately sealed operations, never background work. Durable evidence distinguishes process interruption from power loss and source allocation from net free space.

INV-001: No mutation without exact authority and current state.

INV-002: No deletion inferred from local_only, age, naming, AI generation, exact hash equality or missing local consumer.

INV-003: No writes after final branch-ready without rerunning the final gates.

INV-004: Approved history and unrelated repositories/data remain intact.

INV-005: Use built-in Node and existing OS facilities only; no installed dependency, new daemon, provider dependency, codegraph or vector database. Windows mutations use pinned root-relative native handles through existing PowerShell. A platform without an available atomic backend remains read-only and fails closed for mutation.

INV-006: A frozen POSIX boundary binds helper/runtime identity, maintenance generation/evidence, approved object and exact transaction paths; analysis and legacy policies cannot authorize it.

INV-007: Unexpected capture is a retained partial contract breach, not successful cleanup; recovery/restore never overwrite, auto-compensate or delete unknown objects.

INV-008: Only exact revalidated objects under admitted maintenance may commit; missing runtime, security, primitive or filesystem proof blocks without changing permissions.

Acceptance requires real successful Linux/macOS operation suites and actual adversarial native barriers, plus Windows regressions, mirror equality, deterministic authoring and repository/golden gates. Current host is Windows; Linux/macOS acceptance remains NOT_RUN until an authorized runtime exists.


# Validation metadata completion

This fresh derived snapshot preserves the approved maintenance operating model, exact-object authority, native profiles and all original requirements/invariants. Parent end-to-end implementation authorization assigns their routine typed validation mapping to the integration owner. D-008 now explicitly projects the existing cleanup authorization boundary and original requirement/criterion/invariant IDs for the canonical validation-map consumer. No new operating assumption, weaker invariant, mutation permission or platform PASS is approved. The coverage artifact is re-sealed with the actual delegated-authority timestamp; the canonical helper's fixed fixture date is not used as this execution's approval date. All predecessors remain immutable.
