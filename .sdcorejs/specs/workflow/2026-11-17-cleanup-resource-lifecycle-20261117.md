---
approval_source: "delegated-session-scope"
approved_at: "2026-11-17T23:48:40.613Z"
approved_by: null
artifact_id: "spec-cleanup-resource-lifecycle-20261117"
artifact_kind: "spec"
change_ref: "cleanup-resource-lifecycle-20261117"
commit_policy: "with-change"
contract_id: "cleanup-resource-lifecycle-20261117"
document_review_performed: false
instruction_reference: "conversation/2026-11-17/user-implement-review-and-openai-benchmark"
owner: "sdcorejs-spec"
owner_module_id: null
owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
owner_repository_role: "standalone"
parent_references: []
parent_repository_id: null
redaction_applied: true
repository_relative_path: ".sdcorejs/specs/workflow/2026-11-17-cleanup-resource-lifecycle-20261117.md"
requirement_id: "R-001"
schema_version: 1
source_plan: "none"
source_revision: "a71251fc03890326af14afd496d5955cc30ccc20"
source_spec: "none"
stack_profile: "markdown-skill-pack"
status: "approved"
supersedes: null
track: "workflow"
approval_hash: "sha256:v1:eebf5a246baa6082d743d4d05fc39c99f6abc8c8cc5cd08c1940caea8e10b17d"
---
# Resource lifecycle cleanup requirements

The user approved the preceding two-flow design and requested implementation and review; a later instruction explicitly authorized full tests, E2E and OpenAI API experiments. These snapshots record scoped session delegation, not a separate user document review. Existing post-merge work is dirty and preserved.

## Acceptance criteria

- AC-001 (R-001): completion requires current task/source-bound verification, review, durable closure and no unresolved work; final messages are insufficient.
- AC-002 (R-001): finish/ship/Git workflow hooks proactively assess known resources; commit, push and PR creation retain pending-merge resources.
- AC-003 (R-002): adoption/resume can observe repository-registered worktrees and local branches without prior SDCoreJS records, then propose one bounded legacy analysis.
- AC-004 (R-002): optional metadata measurement and explicitly context/repository-scoped Docker observations report coverage and unknown use/ownership; no implicit daemon startup or whole-machine scan.
- AC-005 (R-003): exact existing grants are reused; file and resource proposals share pending/decline/session-disable state.
- AC-006 (R-003): legacy unknown provenance, active/dirty/locked/protected/unmerged resources remain held or review-only; no new deletion executor.
- AC-007 (R-004): preserve 25 public skills, generate mirrors, validate routing and boundaries, run actual E2E and paired live API benchmark with honest limitations and no credential capture.

## Non-goals

No new public skill, background service, remote branch deletion, volume removal, global registry, automatic legacy disposal or production rollout.
