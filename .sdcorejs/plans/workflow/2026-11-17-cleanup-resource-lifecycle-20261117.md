---
allowed_paths:
  - "_refs/cleanup/**"
  - "_refs/shared/runtime-protocols.md"
  - "_refs/shared/finish-gate.md"
  - "_refs/orchestration/workspace-isolation.md"
  - "skills/shared/workflow/cleanup.md"
  - "skills/shared/workflow/ship.md"
  - "skills/shared/workflow/git.md"
  - "skills/orchestration/using-skills.md"
  - "test/e2e/cleanup-resources.test.mjs"
  - "test/e2e/support/skill-pack-runner.mjs"
  - "authoring/evals/cleanup-lifecycle/**"
  - "package.json"
  - "VALIDATION.md"
  - ".sdcorejs/summary.md"
  - ".claude/**"
  - "plugin/**"
  - "codex/**"
  - ".cursor/rules/sdcorejs-agent.mdc"
approval_source: "delegated-session-scope"
approved_at: "2026-11-17T23:48:40.624Z"
approved_by: null
artifact_id: "plan-cleanup-resource-lifecycle-20261117"
artifact_kind: "plan"
change_ref: "cleanup-resource-lifecycle-20261117"
commit_policy: "with-change"
contract_id: "cleanup-resource-lifecycle-20261117"
document_review_performed: false
instruction_reference: "conversation/2026-11-17/user-implement-review-and-openai-benchmark"
owner: "sdcorejs-plan"
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
  -
    approval_hash: "sha256:v1:0b7ce5d1e0d81be3627dd384bd8096b56fb072f0d7f26d84a55a1306c00b1ea9"
    artifact_id: "architecture-cleanup-resource-lifecycle-20261117"
    artifact_kind: "architecture"
    repository_id: "github.com/sdcorejs/sdcorejs-agent"
    revision: "a71251fc03890326af14afd496d5955cc30ccc20"
parent_repository_id: null
prohibited_paths:
  - "authoring/skills/**"
  - "_refs/shared/approved-artifact.mjs"
  - "_refs/shared/architecture-contract.mjs"
redaction_applied: true
repository_relative_path: ".sdcorejs/plans/workflow/2026-11-17-cleanup-resource-lifecycle-20261117.md"
requirement_id: "R-001"
schema_version: 1
source_plan: "none"
source_revision: "a71251fc03890326af14afd496d5955cc30ccc20"
source_spec: ".sdcorejs/specs/workflow/2026-11-17-cleanup-resource-lifecycle-20261117.md"
stack_profile: "markdown-skill-pack"
status: "approved"
supersedes: null
track: "workflow"
approval_hash: "sha256:v1:fd957fd20e3bebaf4934cc4c3ff5e9d89fb69570b37a1ed036876d9c7ff6f06f"
---
# Resource lifecycle implementation plan

1. Capture dirty baseline and immutable source snapshots; independently assess the missing lifecycle/adoption hooks (AC-001..003).
2. Add regression cases for completion/merge identities, authority/suppression, legacy state, Git configuration execution, links and partial budgets; preserve RED evidence (AC-001..006).
3. Implement read-only resource-audit and pure resource-lifecycle helpers; extend existing CLI and offer coordinator, with no mutation engine (AC-001..006).
4. Connect canonical cleanup/ship/Git/bootstrap/finish references, extend the existing routing harness, document exact invocation, then regenerate all public mirrors (AC-002..007).
5. Review collector and lifecycle independently, validate returned findings, repair and rerun affected tests (AC-001..007).
6. Run focused authoring/routing/cleanup checks and full E2E on the actual environment; report unsupported native filesystem admission without weakening tests. Run labelled real Docker resource fixtures and golden target suites (AC-004,006,007).
7. Run paired baseline/candidate OpenAI tool-agent evaluation on immutable references and common fixtures with repeated samples; record actual model/runtime/usage/latency, assertions and all failed or unavailable runs. Render an offline review artifact (AC-007).

The user authorized the bounded implementation and review in conversation; delegated-session-scope is not a claim that the user separately reviewed these documents. Artifact formalization follows the captured baseline and initial scoped regression work; it does not rewrite that chronology. No commit/push is authorized.
