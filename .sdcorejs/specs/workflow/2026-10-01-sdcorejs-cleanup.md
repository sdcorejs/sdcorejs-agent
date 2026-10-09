---
approval_source: explicit-user-25-section-implementation-delegation
approved_at: 2026-10-01T17:15:00.000Z
approved_by: workspace-owner
artifact_id: sdcorejs-cleanup-spec
artifact_kind: spec
change_ref: sdcorejs-cleanup
commit_policy: with-change
contract_id: sdcorejs-cleanup:v1
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
repository_relative_path: .sdcorejs/specs/workflow/2026-10-01-sdcorejs-cleanup.md
requirement_id: sdcorejs-cleanup
schema_version: 1
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:aae6caef66e444de820ee81c9937b314acd3a1642722b9ad91ad616c9da34031
---

# Cleanup requirement contract

Authority: the user supplied the complete 25-section cleanup request in the main conversation and explicitly directed end-to-end implementation, verification, repair and branch readiness. Delegated source thread: 01a0f150-bea1-72db-a886-5d41358b400a. This records that existing instruction; it is not an inferred approval from silence.

R-001: Add public utility sdcorejs-cleanup with analyze, plan, apply, restore and task-tail actions; default read-only. It is not an implementation track or code refactor.
R-002: Evidence, ownership, reproducibility, producer completion and recoverability govern risk. LOW automation needs approved task-scoped policy; MEDIUM needs bounded batch authority; HIGH needs exact file/atomic-group authority; blocked/unknown never downgrade.
R-003: Frozen plans bind exact files/actions, content and filesystem/Git/reference state. Revalidate before apply; never expand globs or recursive deletion. Reject symlinks/junctions, nested repositories, submodules, path traversal, active producers, sensitive paths and unknown owners.
R-004: Execute authorized fixture cleanup, quarantine and collision-safe restore with accurate partial receipts and separate active-path removal, quarantine bytes and reclaimed bytes. No cleanup on real user data in this implementation session.
R-005: Preserve approved artifacts, durable history, diagnostic/recovery evidence, public assets, generated mirrors, intentional brand/fixture copies and unknown references. Absence of grep/import/mtime is never unused proof. Near duplicates are review-only.
R-006: Explorer and other workflows emit runtime signals to one coordinator; one significant scoped offer, decline deduplication and session-wide suppression. Accepting analysis never authorizes mutation. No global queue, daemon or mutable manifest.
R-007: Task-tail cleanup only current-task artifacts after tests/review/repair and durable finalization, before affected verification, convergence and final branch-ready. Preserve failed/interrupted evidence; later mutations invalidate readiness.
R-008: Update canonical public inventory/routing/ceiling through the existing typed authoring approval gate, official mirrors, documentation and meaningful deterministic tests. No staging, commits, pushes, PRs, merges or publication.

AC-001: Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.
AC-002: Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.
AC-003: Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.
AC-004: Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.
AC-005: Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.
AC-006: Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.
AC-007: Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.

INV-001: No mutation without exact authority and current state.
INV-002: No deletion inferred from local_only, age, naming, AI generation, exact hash equality or missing local consumer.
INV-003: No writes after final branch-ready without rerunning the final gates.
INV-004: Approved history and unrelated repositories/data remain intact.
INV-005: Built-in Node facilities only; no new daemon, provider dependency, codegraph or vector database.
