---
approval_source: "delegated-session-scope"
approved_at: "2026-11-17T23:48:40.623Z"
approved_by: null
artifact_id: "architecture-cleanup-resource-lifecycle-20261117"
artifact_kind: "architecture"
change_ref: "cleanup-resource-lifecycle-20261117"
commit_policy: "with-change"
contract_id: "cleanup-resource-lifecycle-20261117"
document_review_performed: false
instruction_reference: "conversation/2026-11-17/user-implement-review-and-openai-benchmark"
owner: "sdcorejs-architecture"
owner_module_id: null
owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
owner_repository_role: "standalone"
parent_references:
  -
    approval_hash: "sha256:v1:eebf5a246baa6082d743d4d05fc39c99f6abc8c8cc5cd08c1940caea8e10b17d"
    artifact_id: "spec-cleanup-resource-lifecycle-20261117"
    artifact_kind: "spec"
    repository_id: "github.com/sdcorejs/sdcorejs-agent"
    revision: "a71251fc03890326af14afd496d5955cc30ccc20"
parent_repository_id: null
redaction_applied: true
repository_relative_path: ".sdcorejs/architecture/workflow/2026-11-17-cleanup-resource-lifecycle-20261117.md"
requirement_id: "R-001"
schema_version: 1
source_plan: "none"
source_revision: "a71251fc03890326af14afd496d5955cc30ccc20"
source_spec: ".sdcorejs/specs/workflow/2026-11-17-cleanup-resource-lifecycle-20261117.md"
stack_profile: "markdown-skill-pack"
status: "approved"
supersedes: null
track: "workflow"
approval_hash: "sha256:v1:0b7ce5d1e0d81be3627dd384bd8096b56fb072f0d7f26d84a55a1306c00b1ea9"
---
# Resource lifecycle architecture

## Boundaries and decisions

- D-001: the sequential/integration owner receives task-finished, merge-observed, adoption and resume events from skill orchestration. Skill instructions are host-invoked hooks; there is no event listener while an agent is absent.
- D-002: resource-audit collects bounded read-only Git/storage/Docker metadata. The audit report is not a mutation plan or trusted ownership attestation.
- D-003: resource-lifecycle derives completion, invokes the existing pure post-merge planner and coordinates resource offers through the existing offer-policy runtime state.
- D-004: original post-merge provenance, exact native operations, real session authority and fresh per-action revalidation retain their owners. Unknown legacy resources cannot enter automatic disposal.
- D-005: benchmark tooling is internal authoring-only, opt-in, official OpenAI endpoint with an existing environment key; no SDK/runtime dependency enters distribution.

## Invariants and risks

- INV-001: analysis and observation never grant mutation authority.
- INV-002: task result, verification, review, durable closure and merge identities agree; unknown/deferred evidence retains resources.
- INV-003: registration, age, names, labels and logical sizes prove association or priority only.
- INV-004: a single runtime owner/state suppresses duplicate offers; no persistent queue.
- RISK-001: configured Git filters execute during an apparently read-only status query. Use stat/index metadata commands and a no-execution regression.
- RISK-002: partial scans appear complete. Emit bounded coverage, lower-bound sizes and held reasons.
- RISK-003: legacy association becomes fictional creation provenance. Keep legacy output non-plannable.
- RISK-004: a benchmark is mistaken for actual destructive E2E. Separate live tool-fixture behavior, real Git/Docker E2E and native-filesystem admission.
