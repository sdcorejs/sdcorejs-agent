---
allowed_paths:
  - test/e2e/harness-behavioral-sentinel.test.mjs
  - test/e2e/support/harness-behavior-runner.mjs
  - test/e2e/fixtures/harness-behavior-scenarios.json
  - test/e2e/communication-economy.test.mjs
  - test/e2e/skill-pack-runner.test.mjs
  - test/e2e/parallel-dispatch-protocol.test.mjs
  - test/e2e/production-readiness-contract.test.mjs
  - test/e2e/angular-production-contract.test.mjs
  - test/e2e/nextjs-production-contract.test.mjs
  - test/e2e/review-contract.test.mjs
  - test/e2e/repair-contract.test.mjs
  - test/e2e/ship-readiness-contract.test.mjs
  - test/e2e/test-track-contract.test.mjs
  - test/e2e/simplify-skill-contract.test.mjs
  - test/e2e/visual-offer-policy.test.mjs
  - test/e2e/fixtures/visual-offer-scenarios.json
  - test/e2e/support/interaction-finish-fixture.mjs
  - authoring/evals/interaction-finish-contract.json
  - _refs/harness/runtime-policy.mjs
  - _refs/harness/runtime-attestation.mjs
  - _refs/harness/runtime-attestation.md
  - _refs/harness/capability-contract.json
  - _refs/shared/user-choice-prompt.md
  - _refs/shared/finish-gate.mjs
  - _refs/shared/finish-gate.md
  - _refs/shared/repository-observation.mjs
  - _refs/orchestration/execution-contract.mjs
  - _refs/angular/execution-contract.mjs
  - _refs/nextjs/execution-contract.mjs
  - _refs/orchestration/parallel-protocol.mjs
  - _refs/shared/review-contract.mjs
  - _refs/orchestration/repair-contract.mjs
  - _refs/shared/ship-readiness-contract.mjs
  - _refs/harness/communication-economy.mjs
  - _refs/harness/communication-economy.md
  - skills/shared/sdlc/02-spec.md
  - skills/shared/sdlc/architecture.md
  - skills/shared/sdlc/03-plan.md
  - skills/shared/sdlc/04-execute-plan.md
  - skills/tracks/angular/sdcorejs-angular.md
  - skills/tracks/nestjs/sdcorejs-nestjs.md
  - skills/tracks/nextjs/sdcorejs-nextjs.md
  - skills/tracks/ai-agent/sdcorejs-ai-agent.md
  - skills/orchestration/subagent-driven-development.md
  - skills/shared/workflow/review.md
  - skills/orchestration/repair-loop.md
  - skills/orchestration/documentation.md
  - skills/shared/workflow/ship.md
  - skills/tracks/test/sdcorejs-test.md
  - _refs/orchestration/tail/repair-loop.md
  - _refs/documentation/gate.md
  - _refs/orchestration/tail/ship-context.md
  - _refs/orchestration/tail/verify-before-done.md
  - _refs/orchestration/tail/branch-ready.md
  - AGENTS.md
  - CLAUDE.md
  - .clinerules
  - .github/copilot-instructions.md
  - .github/chatmodes/sdcorejs.chatmode.md
  - .claude/_refs/angular/execution-contract.mjs
  - .claude/_refs/documentation/gate.md
  - .claude/_refs/harness/capability-contract.json
  - .claude/_refs/harness/communication-economy.md
  - .claude/_refs/harness/communication-economy.mjs
  - .claude/_refs/harness/runtime-attestation.md
  - .claude/_refs/harness/runtime-attestation.mjs
  - .claude/_refs/harness/runtime-policy.mjs
  - .claude/_refs/nextjs/execution-contract.mjs
  - .claude/_refs/orchestration/execution-contract.mjs
  - .claude/_refs/orchestration/parallel-protocol.mjs
  - .claude/_refs/orchestration/repair-contract.mjs
  - .claude/_refs/orchestration/tail/branch-ready.md
  - .claude/_refs/orchestration/tail/repair-loop.md
  - .claude/_refs/orchestration/tail/ship-context.md
  - .claude/_refs/orchestration/tail/verify-before-done.md
  - .claude/_refs/shared/finish-gate.md
  - .claude/_refs/shared/finish-gate.mjs
  - .claude/_refs/shared/repository-observation.mjs
  - .claude/_refs/shared/review-contract.mjs
  - .claude/_refs/shared/ship-readiness-contract.mjs
  - .claude/_refs/shared/user-choice-prompt.md
  - .claude/sdcorejs-harness.json
  - .claude/skills/sdcorejs-ai-agent/SKILL.md
  - .claude/skills/sdcorejs-angular/SKILL.md
  - .claude/skills/sdcorejs-architecture/SKILL.md
  - .claude/skills/sdcorejs-documentation/SKILL.md
  - .claude/skills/sdcorejs-execute-plan/SKILL.md
  - .claude/skills/sdcorejs-nestjs/SKILL.md
  - .claude/skills/sdcorejs-nextjs/SKILL.md
  - .claude/skills/sdcorejs-plan/SKILL.md
  - .claude/skills/sdcorejs-repair-loop/SKILL.md
  - .claude/skills/sdcorejs-review/SKILL.md
  - .claude/skills/sdcorejs-ship/SKILL.md
  - .claude/skills/sdcorejs-spec/SKILL.md
  - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
  - .claude/skills/sdcorejs-test/SKILL.md
  - .cursor/rules/sdcorejs-agent.mdc
  - .cursor/sdcorejs-harness.json
  - .github/sdcorejs-harness.json
  - codex/sdcorejs-harness.json
  - codex/skills/_refs/angular/execution-contract.mjs
  - codex/skills/_refs/documentation/gate.md
  - codex/skills/_refs/harness/capability-contract.json
  - codex/skills/_refs/harness/communication-economy.md
  - codex/skills/_refs/harness/communication-economy.mjs
  - codex/skills/_refs/harness/runtime-attestation.md
  - codex/skills/_refs/harness/runtime-attestation.mjs
  - codex/skills/_refs/harness/runtime-policy.mjs
  - codex/skills/_refs/nextjs/execution-contract.mjs
  - codex/skills/_refs/orchestration/execution-contract.mjs
  - codex/skills/_refs/orchestration/parallel-protocol.mjs
  - codex/skills/_refs/orchestration/repair-contract.mjs
  - codex/skills/_refs/orchestration/tail/branch-ready.md
  - codex/skills/_refs/orchestration/tail/repair-loop.md
  - codex/skills/_refs/orchestration/tail/ship-context.md
  - codex/skills/_refs/orchestration/tail/verify-before-done.md
  - codex/skills/_refs/shared/finish-gate.md
  - codex/skills/_refs/shared/finish-gate.mjs
  - codex/skills/_refs/shared/repository-observation.mjs
  - codex/skills/_refs/shared/review-contract.mjs
  - codex/skills/_refs/shared/ship-readiness-contract.mjs
  - codex/skills/_refs/shared/user-choice-prompt.md
  - codex/skills/sdcorejs-ai-agent/SKILL.md
  - codex/skills/sdcorejs-angular/SKILL.md
  - codex/skills/sdcorejs-architecture/SKILL.md
  - codex/skills/sdcorejs-documentation/SKILL.md
  - codex/skills/sdcorejs-execute-plan/SKILL.md
  - codex/skills/sdcorejs-nestjs/SKILL.md
  - codex/skills/sdcorejs-nextjs/SKILL.md
  - codex/skills/sdcorejs-plan/SKILL.md
  - codex/skills/sdcorejs-repair-loop/SKILL.md
  - codex/skills/sdcorejs-review/SKILL.md
  - codex/skills/sdcorejs-ship/SKILL.md
  - codex/skills/sdcorejs-spec/SKILL.md
  - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
  - codex/skills/sdcorejs-test/SKILL.md
  - plugin/_refs/angular/execution-contract.mjs
  - plugin/_refs/documentation/gate.md
  - plugin/_refs/harness/capability-contract.json
  - plugin/_refs/harness/communication-economy.md
  - plugin/_refs/harness/communication-economy.mjs
  - plugin/_refs/harness/runtime-attestation.md
  - plugin/_refs/harness/runtime-attestation.mjs
  - plugin/_refs/harness/runtime-policy.mjs
  - plugin/_refs/nextjs/execution-contract.mjs
  - plugin/_refs/orchestration/execution-contract.mjs
  - plugin/_refs/orchestration/parallel-protocol.mjs
  - plugin/_refs/orchestration/repair-contract.mjs
  - plugin/_refs/orchestration/tail/branch-ready.md
  - plugin/_refs/orchestration/tail/repair-loop.md
  - plugin/_refs/orchestration/tail/ship-context.md
  - plugin/_refs/orchestration/tail/verify-before-done.md
  - plugin/_refs/shared/finish-gate.md
  - plugin/_refs/shared/finish-gate.mjs
  - plugin/_refs/shared/repository-observation.mjs
  - plugin/_refs/shared/review-contract.mjs
  - plugin/_refs/shared/ship-readiness-contract.mjs
  - plugin/_refs/shared/user-choice-prompt.md
  - plugin/sdcorejs-harness.json
  - plugin/skills/sdcorejs-ai-agent/SKILL.md
  - plugin/skills/sdcorejs-angular/SKILL.md
  - plugin/skills/sdcorejs-architecture/SKILL.md
  - plugin/skills/sdcorejs-documentation/SKILL.md
  - plugin/skills/sdcorejs-execute-plan/SKILL.md
  - plugin/skills/sdcorejs-nestjs/SKILL.md
  - plugin/skills/sdcorejs-nextjs/SKILL.md
  - plugin/skills/sdcorejs-plan/SKILL.md
  - plugin/skills/sdcorejs-repair-loop/SKILL.md
  - plugin/skills/sdcorejs-review/SKILL.md
  - plugin/skills/sdcorejs-ship/SKILL.md
  - plugin/skills/sdcorejs-spec/SKILL.md
  - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
  - plugin/skills/sdcorejs-test/SKILL.md
  - VALIDATION.md
  - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
  - authoring/evals/uiux/evidence.test.mjs
approval_gate: sdcorejs-plan:approval
approval_reply: duyệt
approval_source: explicit-user-choice
approved_architecture_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
approved_architecture_reference:
  approval_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
  artifact_id: architecture-interaction-finish-contract-20260924-r1
  artifact_kind: architecture
  repository_id: github.com/sdcorejs/sdcorejs-agent
  repository_relative_path: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
  revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
approved_at: 2026-09-24T07:51:56.101Z
approved_by: user
approved_draft_fingerprint: sha256:c3363aa08d2e8e0d7cdf609dde96da7a781841e00b60e36cf330623c87e7b9f9
approved_spec_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
approved_spec_reference:
  approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
  artifact_id: spec-interaction-finish-contract-20260924-r1
  artifact_kind: spec
  repository_id: github.com/sdcorejs/sdcorejs-agent
  repository_relative_path: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
  revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
artifact_id: plan-interaction-finish-contract-20260924-r2
artifact_kind: plan
change_control:
  change_reason: "Explicitly approved one-file evidence continuation: verify
    immutable history at its base revision and current interaction/finish
    content separately."
  revision: 2
  supersedes: .sdcorejs/plans/workflow/2026-09-24-11-29-interaction-finish-contract.md
change_ref: interaction-finish-contract-20260924
commit_policy: with-change
contract_id: interaction-finish-contract-20260924
dependency_changes:
  approval_required: false
  packages: []
  required: false
dependency_order:
  - TASK-001
  - TASK-002
  - TASK-003
  - TASK-004
  - TASK-005
  - TASK-006
  - TASK-007
description: Native-first scoped interaction and one verified finish tail across
  execution consumers.
env_changes:
  approval_required: false
  files: []
  required: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
execution_policy: sequential
gitlink_updates_in_scope: false
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
migration_changes:
  approval_required: false
  description: null
  required: false
name: interaction-finish-contract
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
    artifact_id: architecture-interaction-finish-contract-20260924-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
parent_repository_id: null
phase_count: 4
prohibited_paths:
  - package.json
  - package-lock.json
  - node_modules/**
  - site/**
  - .git/**
  - .env
  - .env.*
  - _refs/shared/system-registry.json
  - _refs/shared/approved-artifact.mjs
  - _refs/shared/architecture-contract.mjs
  - _refs/shared/decision-coverage.mjs
  - _refs/shared/validation-map.mjs
  - _refs/shared/repository-contract.mjs
  - _refs/shared/design-handoff.mjs
  - _refs/shared/ui-review-contract.mjs
  - _refs/simplify/**
  - skills/shared/workflow/simplify.md
  - .sdcorejs/specs/**
  - .sdcorejs/architecture/**
  - .sdcorejs/plans/**
  - .sdcorejs/conventions/**
  - .sdcorejs/memories/**
  - authoring/evals/records/**
  - authoring/evals/visual-offer/**
  - authoring/evals/uiux/README.md
  - authoring/evals/uiux/design-handoff-integration.json
  - authoring/evals/uiux/green-sources.json
  - authoring/evals/uiux/green.txt
  - authoring/evals/uiux/post-review-green.txt
  - authoring/evals/uiux/post-review-red.txt
  - authoring/evals/uiux/records.json
  - authoring/evals/uiux/red.txt
  - authoring/evals/uiux/refactor.txt
  - authoring/evals/uiux/review-red.txt
  - authoring/evals/uiux/skill-creator-green.txt
  - authoring/evals/uiux/skill-creator-isolation-red.txt
  - authoring/evals/uiux/skill-creator-red.txt
  - authoring/evals/uiux/ui-review-integration.json
  - authoring/evals/uiux/version-red.txt
repository_relative_path: .sdcorejs/plans/workflow/2026-09-24-12-57-interaction-finish-contract-r2.md
requirement_id: interaction-finish-contract-20260924
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-24-12-57-interaction-finish-contract-plan-r2.md
source_architecture: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
source_plan: none
source_revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
source_spec: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
stack_profile: markdown-skill-pack
supersedes: .sdcorejs/plans/workflow/2026-09-24-11-29-interaction-finish-contract.md
target_root_kind: sdcorejs-agent-authoring-repo
task_count: 7
track: workflow
verification_strategy:
  checks:
    broad:
      - test:e2e:repository
    focused:
      - test/e2e/harness-behavioral-sentinel.test.mjs
      - test/e2e/communication-economy.test.mjs
      - test/e2e/skill-pack-runner.test.mjs
      - test/e2e/parallel-dispatch-protocol.test.mjs
      - test/e2e/production-readiness-contract.test.mjs
      - test/e2e/angular-production-contract.test.mjs
      - test/e2e/nextjs-production-contract.test.mjs
      - test/e2e/review-contract.test.mjs
      - test/e2e/repair-contract.test.mjs
      - test/e2e/ship-readiness-contract.test.mjs
      - test/e2e/test-track-contract.test.mjs
      - test/e2e/simplify-skill-contract.test.mjs
      - test/e2e/visual-offer-policy.test.mjs
    generated:
      - check:skills
      - check:skills:ps
    hygiene:
      - check:text-hygiene
      - check:executable-references
  commands_planned:
    - command: node --test --test-concurrency=1
        test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs
        test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs
        test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs
        test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs
        test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs
        test/e2e/visual-offer-policy.test.mjs
      reason: 18 AC payload-to-helper-to-consumer regressions
    - command: node authoring/evals/run-deterministic.mjs
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run test:e2e:skill-authoring
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run sync:skills
      reason: Generate derived mirrors before final checks
    - command: npm run check:skills
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run check:skills:ps
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run check:text-hygiene
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run check:executable-references
      reason: Affected contract/inventory/schema/hygiene verification
    - command: npm run test:e2e:repository
      reason: Affected contract/inventory/schema/hygiene verification
    - command: git diff --check
      reason: Affected contract/inventory/schema/hygiene verification
  commands_skipped:
    - command: npm run test:e2e
      reason: Golden product generators and broad target-product suites unchanged;
        repository suite is the scoped broad gate.
    - command: npm run test:e2e:nestjs:containers
      reason: No container/service execution in scope.
    - command: live/native/provider/browser matrix
      reason: No live or paid services/browser installs authorized; deterministic tool
        exposure/failure fixtures do not claim live-native execution.
    - command: npm run check:audit / npm run check:site:audit / npm run build:site
      reason: No dependency/site changes; outside scoped local contract validation.
  package_manager: npm
  package_manager_evidence: package.json packageManager npm@10.9.2;
    package-lock.json exists; installed Node 24.19.0 satisfies engines.
approval_hash: sha256:v1:115d2a72425a4fbd512b2e072c2abe412217df2442d678adbfd191492ce241f3
---
# Interaction and finish contract — approved plan r2

# Interaction and finish contract — plan r2

# Interaction/finish contract: bounded evidence-continuation delta

This proposal extends the approved r1 plan by one canonical test file:
`authoring/evals/uiux/evidence.test.mjs`.

Observed problem: the current test hardcodes `ui-review-contract-20260923` as
the latest integration and compares its source manifest with the new working
tree. It correctly rejects the changed source, but cannot read the new
`authoring/evals/interaction-finish-contract.json` record already in r1 scope.

Proposed behavior:

1. Validate the existing UI-review record and its complete dependency closure
   at the continuation's verified base Git revision. Keep the record unchanged.
2. Validate the new continuation record against the actual current source
   closure, exact command, exit code, transcript hash, source fingerprint,
   owner/change and a hash-bound link to the historical integration.
3. Preserve all existing negative checks. Add paired negative cases for an
   omitted/stale source, mutated prior record, wrong revision, wrong command,
   failed/missing run and fabricated PASS. Historical validity never implies
   current verification.
4. Keep the original spec, architecture and plan snapshot immutable. Record
   this explicit scope approval in a new r2 plan draft and approved snapshot,
   superseding r1 with the same behavior requirements and only this path delta.
5. Run the focused evidence test, existing interaction/finish regressions and
   repository checks. No dependency, public-skill, source-product, commit/push,
   browser or live-service expansion.

Additional governance paths if approved:
- `.sdcorejs/docs/workflow/2026-09-24-12-57-interaction-finish-contract-plan-r2.md`
- `.sdcorejs/plans/workflow/2026-09-24-12-57-interaction-finish-contract-r2.md`

The existing r1 source/test/doc/mirror scope remains authorized and continues
independently. The additional canonical test is not edited before approval.


## Explicit approval

The user replied `duyệt` to the sole pending r2 scope delta. This authorizes the exact added test and the two named r2 governance artifacts. All r1 behavior requirements, seven sequential tasks, protected history, no dependencies and no Git writes remain unchanged.

## Complete execution projection

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: interaction-finish-contract-20260924
  requirement_id: interaction-finish-contract-20260924
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
  approved_spec_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-interaction-finish-contract-20260924-r1
    artifact_kind: spec
    revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
    approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
    repository_relative_path: .sdcorejs/specs/workflow/2026-09-24-10-14-interaction-finish-contract.md
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - integration-owner-dependency-direction
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: Thay đổi ranh giới approval/capability, identity reuse và quyền parent/worker điều phối tail dùng
      chung giữa các executor.
    blockers: []
    blocker_messages: []
  architecture_context:
    schema_version: 1
    source: sdcorejs-architecture
    contract_id: interaction-finish-contract-20260924
    requirement_id: R-001
    approved_spec_reference:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      artifact_id: spec-interaction-finish-contract-20260924-r1
      artifact_kind: spec
      revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
      approval_hash: sha256:v1:cb0913ebbca7dd3886e2f788813bceaa1680d201334475e9b9a14f82dd5a08f6
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
    approved_architecture_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
    owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    owner_module_id: null
    execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    trigger:
      required: true
      signals:
        - integration-owner-dependency-direction
        - security-trust-boundary
        - state-data-ownership
      rationale: Thay đổi ranh giới approval/capability, identity reuse và quyền parent/worker điều phối tail dùng
        chung giữa các executor.
    invariants:
      - id: INV-001
        statement: Approval luôn explicit và riêng theo gate/revision; capability không phải authority.
        scope: runtime observation and scoped choice authority
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserve the approved user constraint while reducing repeated interaction.
        verification_method: Native capability/mode/failure, localization, ambiguous/stale decision and separate
          approval regression/mutation cases.
        requirement_refs:
          - R-001
          - R-002
        decision_refs:
          - D-001
          - D-002
      - id: INV-002
        statement: Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.
        scope: finish owner and write-producing dispatch
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserve the approved user constraint while reducing repeated interaction.
        verification_method: Observed dispatch/owner tests for worker, skip/analyze/apply, review-only, scoped repair,
          defer and new-document authority.
        requirement_refs:
          - R-003
          - R-004
          - R-005
          - R-007
        decision_refs:
          - D-003
          - D-004
      - id: INV-003
        statement: Required verification và stale evidence không bị preference hoặc finish choice xóa.
        scope: test/evidence ordering and final handoff
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserve the approved user constraint while reducing repeated interaction.
        verification_method: Required tests/AC, RED-before-production, same-HEAD stale proof, affected revalidation
          and post-branch-ready write mutations.
        requirement_refs:
          - R-005
          - R-006
        decision_refs:
          - D-003
          - D-004
      - id: INV-004
        statement: Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.
        scope: public compatibility and artifact lifecycle
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Preserve the approved user constraint while reducing repeated interaction.
        verification_method: Portable round trips, immutable-hash checks, public inventory and generated
          mirror/hygiene checks; no Git/dependency actions.
        requirement_refs:
          - R-008
        decision_refs:
          - D-005
    boundaries:
      - id: ChoiceSurface
        statement: Runtime tool exposure and per-action/mode restrictions choose native or stable numbered fallback.
        invariant_refs:
          - INV-001
      - id: DecisionAuthority
        statement: Explicit scoped replies or verified plan policy resolve choices; context values alone never grant
          approval/write authority.
        invariant_refs:
          - INV-001
          - INV-002
      - id: FinishOwner
        statement: One parent/integration caller owns final finish; workers remain unit-only.
        invariant_refs:
          - INV-002
          - INV-003
      - id: EvidenceGate
        statement: Command/snapshot validators prove phase freshness; planner intent or completion flags do not.
        invariant_refs:
          - INV-003
    dependency_directions:
      - from: current runtime exposure and constraints
        to: interaction policy and surface dispatch
        rationale: Provider mappings are candidates; current host evidence and action restrictions govern actual use.
        invariant_refs:
          - INV-001
      - from: explicit user decision or verified approved plan policy
        to: scoped decision resolution
        rationale: Scope-specific authority is consumed, not synthesized from recommendation or previous unrelated
          replies.
        invariant_refs:
          - INV-001
          - INV-002
      - from: executor/worker output and verified owner identity
        to: parent/integration canonical finish resolver
        rationale: Workers return evidence; one final owner resolves and runs only authorized next steps.
        invariant_refs:
          - INV-002
          - INV-003
      - from: canonical finish resolver
        to: existing Test/Simplify/Review/Repair/Documentation/Ship owners
        rationale: The tail orders requests; each existing owner retains its preflight, limits and verification
          authority.
        invariant_refs:
          - INV-002
          - INV-003
    data_state_owners:
      - subject: Scoped decisions and phase progress inside existing producer contexts / portable state_delta
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-001
          - INV-002
      - subject: Observed source snapshots, command receipts and content-bound verification references
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-003
      - subject: Immutable approved spec/architecture/plan artifacts; reusable canonical sources and generated mirrors
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        invariant_refs:
          - INV-004
    public_contracts: []
    security_trust_boundaries:
      - id: CurrentRuntimeBoundary
        statement: Only current host observations of exposed tools, allowed actions and runtime/mode restrictions may
          enable native use; serialized capability claims are hints.
        invariant_refs:
          - INV-001
      - id: ScopedAuthorizationBoundary
        statement: Gate/artifact/revision-or-authorization-scope/options identity is required for reuse; raw 1 with
          multiple candidate gates, stale records and visual/default feedback do not approve.
        invariant_refs:
          - INV-001
          - INV-002
      - id: WriteAndEvidenceBoundary
        statement: Tail choice is not an authority escalation. Existing scope/protected/repair/docs gates remain
          authoritative; any affected write invalidates proof.
        invariant_refs:
          - INV-002
          - INV-003
    cross_repository_integration: []
    adopted_decision_refs:
      - D-001
      - D-002
      - D-003
      - D-004
      - D-005
    deferred_decision_refs: []
    assumption_refs: []
    validation_obligations:
      - id: VAL-001
        expected_proof: AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007 must be proved by documented payload
          through existing helpers and real completion consumers, including paired negative mutations.
        owner: sdcorejs-test
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
      - id: VAL-002
        expected_proof: AC-008, AC-009, AC-010, AC-011, AC-012, AC-013, AC-014, AC-015 must be proved by documented
          payload through existing helpers and real completion consumers, including paired negative mutations.
        owner: sdcorejs-test
        invariant_refs:
          - INV-002
        acceptance_criterion_refs:
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
      - id: VAL-003
        expected_proof: AC-016, AC-017 must be proved by documented payload through existing helpers and real
          completion consumers, including paired negative mutations.
        owner: sdcorejs-test
        invariant_refs:
          - INV-003
        acceptance_criterion_refs:
          - AC-016
          - AC-017
      - id: VAL-004
        expected_proof: AC-018 must be proved by documented payload through existing helpers and real completion
          consumers, including paired negative mutations.
        owner: sdcorejs-test
        invariant_refs:
          - INV-004
        acceptance_criterion_refs:
          - AC-018
    profile_sections:
      frontend_architecture_ref: null
      agent_architecture_ref: null
    change_control:
      revision: 1
      supersedes: null
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: architecture-interaction-finish-contract-20260924-r1
    artifact_kind: architecture
    revision: 7e7f4288717a983a5f51ab43af24af4ce423a1d4
    approval_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
    repository_relative_path: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-24-11-16-interaction-finish-contract.md
  approved_architecture_hash: sha256:v1:b9c84f6402fe49cec4fd8175b65fb305bf05d68d118494c30c1fab5b785efa39
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: .sdcorejs/plans/workflow/2026-09-24-11-29-interaction-finish-contract.md
  target_root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - TASK-001
    - TASK-002
    - TASK-003
    - TASK-004
    - TASK-005
    - TASK-006
    - TASK-007
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 7
  phase_count: 4
  coverage_approach: TDD
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Native-first dựa trên tool exposure, runtime/mode constraints và evidence hiện tại; fallback giữ
          nguyên identity/options.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
      - id: R-002
        type: requirement
        statement: Giải quyết reply rõ nghĩa và reuse explicit decision đúng gate, artifact/change, revision/scope và
          option mapping; chỉ hỏi delta.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
      - id: R-003
        type: requirement
        statement: Một finish-tail canonical dùng thực sự ở mọi caller; parent/integration owner hoàn tất một lần cho
          change.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
      - id: R-004
        type: requirement
        statement: Skip, Analyze và Apply simplify giữ nguyên opt-in, eligibility, preflight, protected boundaries và
          pass cap.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
      - id: R-005
        type: requirement
        statement: Review-only, review-and-repair, defer và skip review không mở rộng authority hoặc bỏ required
          verification.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
      - id: R-006
        type: requirement
        statement: Test strategy được chốt trước implementation; RED-first đúng thứ tự; mọi write làm stale evidence
          liên quan.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
      - id: R-007
        type: requirement
        statement: Docs/test policy đã authorize được reuse đúng scope; preference không cấp quyền tạo docs mới.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
      - id: R-008
        type: requirement
        statement: Compatibility, public skills, approved snapshots và safety assertions được giữ; chỉ canonical
          sources, mirrors bằng script.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: AC-001
        type: acceptance-criterion
        statement: Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden
          dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.
        behavior: native-runtime
        expected_result: Native exposed và permitted trong current mode dùng structured choice;
          missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi
          mode/flag để lấy tool.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-005
      - id: AC-002
        type: acceptance-criterion
        statement: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
        behavior: native-failure
        expected_result: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-005
      - id: AC-003
        type: acceptance-criterion
        statement: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa
          số ngoài lựa chọn không thành approval.
        behavior: reply-normalization
        expected_result: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản
          chứa số ngoài lựa chọn không thành approval.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-005
      - id: AC-004
        type: acceptance-criterion
        statement: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự
          hoặc gate gần nhất.
        behavior: ambiguous-gates
        expected_result: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ
          tự hoặc gate gần nhất.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-005
      - id: AC-005
        type: acceptance-criterion
        statement: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua
          context/handoff mà không hỏi lại.
        behavior: reuse-choice
        expected_result: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được
          reuse qua context/handoff mà không hỏi lại.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-006
        type: acceptance-criterion
        statement: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ
          không áp dụng; chỉ unresolved delta được hỏi.
        behavior: stale-choice
        expected_result: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice
          cũ không áp dụng; chỉ unresolved delta được hỏi.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-007
        type: acceptance-criterion
        statement: Spec approval không approve plan; single option, default, silence, thanks, delegated preference
          hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa / 3
          Hủy.
        behavior: separate-approval
        expected_result: Spec approval không approve plan; single option, default, silence, thanks, delegated
          preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu
          chỉnh sửa / 3 Hủy.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-008
        type: acceptance-criterion
        statement: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử
          dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
        behavior: canonical-callers
        expected_result: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship
          sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-009
        type: acceptance-criterion
        statement: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail.
          Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
        behavior: integration-owner
        expected_result: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs
          tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-010
        type: acceptance-criterion
        statement: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
          missing-doc creation vẫn cần authority cho đúng file/scope.
        behavior: resolved-small-fix
        expected_result: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
          missing-doc creation vẫn cần authority cho đúng file/scope.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-011
        type: acceptance-criterion
        statement: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source
          write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.
        behavior: simplify-semantics
        expected_result: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không
          source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định
          Analyze-only.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-012
        type: acceptance-criterion
        statement: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
        behavior: review-only
        expected_result: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-013
        type: acceptance-criterion
        statement: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi
          finding, không tự simplify sau repair.
        behavior: bounded-repair
        expected_result: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize
          mọi finding, không tự simplify sau repair.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
      - id: AC-014
        type: acceptance-criterion
        statement: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
        behavior: defer
        expected_result: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-015
        type: acceptance-criterion
        statement: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm
          ý Git/deploy. Required review/evidence không bị skip tùy ý.
        behavior: skip-review
        expected_result: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng,
          không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-016
        type: acceptance-criterion
        statement: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi
          RED-first; finish choice không xóa required tests/AC.
        behavior: tdd-order
        expected_result: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được
          gọi RED-first; finish choice không xóa required tests/AC.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-017
        type: acceptance-criterion
        statement: Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized
          writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại
          gate trước handoff.
        behavior: evidence-order
        expected_result: Baseline/test → optional simplify → affected re-verification → selected review/repair →
          authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc
          chạy lại gate trước handoff.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: AC-018
        type: acceptance-criterion
        statement: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
          schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
          history không migrate, mirrors và hygiene checks đạt.
        behavior: compatibility
        expected_result: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
          schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
          history không migrate, mirrors và hygiene checks đạt.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
      - id: D-001
        type: decision
        statement: Observed native-first, stable numbered fallback
        question: Dùng surface nào?
        selected_value: Observed native-first, stable numbered fallback
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - AC-001
          - AC-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-005
      - id: D-002
        type: decision
        statement: Extend existing context/handoff; exact scoped authority, no new state store
        question: Reuse quyết định ở đâu?
        selected_value: Extend existing context/handoff; exact scoped authority, no new state store
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - AC-005
          - AC-006
          - AC-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
      - id: D-003
        type: decision
        statement: One canonical owner contract, parent/integration final tail, stack hooks only
        question: Ai điều phối finish-tail?
        selected_value: One canonical owner contract, parent/integration final tail, stack hooks only
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-008
          - AC-009
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
      - id: D-004
        type: decision
        statement: Keep simplify/repair/docs authority and required verification; no automatic Git
        question: Lựa chọn có mở rộng quyền không?
        selected_value: Keep simplify/repair/docs authority and required verification; no automatic Git
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - R-005
          - R-006
          - R-007
          - R-001
          - R-002
          - R-003
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        validation_boundary:
          kind: authorization
          source_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - AC-001
            - AC-002
            - AC-003
            - AC-004
            - AC-005
            - AC-006
            - AC-007
            - AC-008
            - AC-009
            - AC-010
            - AC-011
            - AC-012
            - AC-013
            - AC-014
            - AC-015
            - AC-016
            - AC-017
            - INV-001
            - INV-002
            - INV-003
      - id: D-005
        type: decision
        statement: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
        question: Giới hạn compatibility và delivery?
        selected_value: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
          spec này.
        supersedes: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-018
          - INV-004
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        validation_boundary:
          kind: none
          source_refs:
            - R-008
            - AC-018
            - INV-004
      - id: INV-001
        type: invariant
        statement: Approval luôn explicit và riêng theo gate/revision; capability không phải authority.
        protected_refs:
          - R-001
          - R-002
          - AC-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-005
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-004
          - EVIDENCE-005
      - id: INV-002
        type: invariant
        statement: Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.
        protected_refs:
          - R-004
          - R-005
          - R-007
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: INV-003
        type: invariant
        statement: Required verification và stale evidence không bị preference hoặc finish choice xóa.
        protected_refs:
          - R-006
          - AC-015
          - AC-016
          - AC-017
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-007
      - id: INV-004
        type: invariant
        statement: Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.
        protected_refs:
          - R-008
          - AC-018
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
    history:
      - revision: 1
        active:
          - id: R-001
            type: requirement
          - id: R-002
            type: requirement
          - id: R-003
            type: requirement
          - id: R-004
            type: requirement
          - id: R-005
            type: requirement
          - id: R-006
            type: requirement
          - id: R-007
            type: requirement
          - id: R-008
            type: requirement
          - id: AC-001
            type: acceptance-criterion
          - id: AC-002
            type: acceptance-criterion
          - id: AC-003
            type: acceptance-criterion
          - id: AC-004
            type: acceptance-criterion
          - id: AC-005
            type: acceptance-criterion
          - id: AC-006
            type: acceptance-criterion
          - id: AC-007
            type: acceptance-criterion
          - id: AC-008
            type: acceptance-criterion
          - id: AC-009
            type: acceptance-criterion
          - id: AC-010
            type: acceptance-criterion
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: D-005
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
            type: invariant
          - id: INV-003
            type: invariant
          - id: INV-004
            type: invariant
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage:
      schema_version: 1
      revision: 1
      records:
        - id: R-001
          type: requirement
          statement: Native-first dựa trên tool exposure, runtime/mode constraints và evidence hiện tại; fallback giữ
            nguyên identity/options.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
        - id: R-002
          type: requirement
          statement: Giải quyết reply rõ nghĩa và reuse explicit decision đúng gate, artifact/change, revision/scope và
            option mapping; chỉ hỏi delta.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
        - id: R-003
          type: requirement
          statement: Một finish-tail canonical dùng thực sự ở mọi caller; parent/integration owner hoàn tất một lần cho
            change.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
        - id: R-004
          type: requirement
          statement: Skip, Analyze và Apply simplify giữ nguyên opt-in, eligibility, preflight, protected boundaries và
            pass cap.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
        - id: R-005
          type: requirement
          statement: Review-only, review-and-repair, defer và skip review không mở rộng authority hoặc bỏ required
            verification.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
        - id: R-006
          type: requirement
          statement: Test strategy được chốt trước implementation; RED-first đúng thứ tự; mọi write làm stale evidence
            liên quan.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
        - id: R-007
          type: requirement
          statement: Docs/test policy đã authorize được reuse đúng scope; preference không cấp quyền tạo docs mới.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
        - id: R-008
          type: requirement
          statement: Compatibility, public skills, approved snapshots và safety assertions được giữ; chỉ canonical
            sources, mirrors bằng script.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
        - id: AC-001
          type: acceptance-criterion
          statement: Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden
            dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.
          behavior: native-runtime
          expected_result: Native exposed và permitted trong current mode dùng structured choice;
            missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi
            mode/flag để lấy tool.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-005
        - id: AC-002
          type: acceptance-criterion
          statement: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã
            lỗi.
          behavior: native-failure
          expected_result: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker
            đã lỗi.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-005
        - id: AC-003
          type: acceptance-criterion
          statement: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa
            số ngoài lựa chọn không thành approval.
          behavior: reply-normalization
          expected_result: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản
            chứa số ngoài lựa chọn không thành approval.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-005
        - id: AC-004
          type: acceptance-criterion
          statement: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự
            hoặc gate gần nhất.
          behavior: ambiguous-gates
          expected_result: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ
            tự hoặc gate gần nhất.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-005
        - id: AC-005
          type: acceptance-criterion
          statement: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua
            context/handoff mà không hỏi lại.
          behavior: reuse-choice
          expected_result: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được
            reuse qua context/handoff mà không hỏi lại.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-006
          type: acceptance-criterion
          statement: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ
            không áp dụng; chỉ unresolved delta được hỏi.
          behavior: stale-choice
          expected_result: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice
            cũ không áp dụng; chỉ unresolved delta được hỏi.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-007
          type: acceptance-criterion
          statement: Spec approval không approve plan; single option, default, silence, thanks, delegated preference
            hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa /
            3 Hủy.
          behavior: separate-approval
          expected_result: Spec approval không approve plan; single option, default, silence, thanks, delegated
            preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu
            chỉnh sửa / 3 Hủy.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-008
          type: acceptance-criterion
          statement: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử
            dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
          behavior: canonical-callers
          expected_result: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship
            sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: AC-009
          type: acceptance-criterion
          statement: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail.
            Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
          behavior: integration-owner
          expected_result: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs
            tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua
            invalidation.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-010
          type: acceptance-criterion
          statement: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
            missing-doc creation vẫn cần authority cho đúng file/scope.
          behavior: resolved-small-fix
          expected_result: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
            missing-doc creation vẫn cần authority cho đúng file/scope.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-007
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-011
          type: acceptance-criterion
          statement: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source
            write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.
          behavior: simplify-semantics
          expected_result: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không
            source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định
            Analyze-only.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-004
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-012
          type: acceptance-criterion
          statement: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
          behavior: review-only
          expected_result: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-013
          type: acceptance-criterion
          statement: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi
            finding, không tự simplify sau repair.
          behavior: bounded-repair
          expected_result: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize
            mọi finding, không tự simplify sau repair.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
        - id: AC-014
          type: acceptance-criterion
          statement: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
          behavior: defer
          expected_result: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: AC-015
          type: acceptance-criterion
          statement: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm
            ý Git/deploy. Required review/evidence không bị skip tùy ý.
          behavior: skip-review
          expected_result: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng,
            không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: AC-016
          type: acceptance-criterion
          statement: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi
            RED-first; finish choice không xóa required tests/AC.
          behavior: tdd-order
          expected_result: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được
            gọi RED-first; finish choice không xóa required tests/AC.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-006
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-005
            - EVIDENCE-007
        - id: AC-017
          type: acceptance-criterion
          statement: Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized
            writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại
            gate trước handoff.
          behavior: evidence-order
          expected_result: Baseline/test → optional simplify → affected re-verification → selected review/repair →
            authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc
            chạy lại gate trước handoff.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-006
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: AC-018
          type: acceptance-criterion
          statement: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
            schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
            history không migrate, mirrors và hygiene checks đạt.
          behavior: compatibility
          expected_result: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
            schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
            history không migrate, mirrors và hygiene checks đạt.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-008
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-006
            - EVIDENCE-007
        - id: D-001
          type: decision
          statement: Observed native-first, stable numbered fallback
          question: Dùng surface nào?
          selected_value: Observed native-first, stable numbered fallback
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
            spec này.
          supersedes: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-001
            - AC-001
            - AC-002
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-005
        - id: D-002
          type: decision
          statement: Extend existing context/handoff; exact scoped authority, no new state store
          question: Reuse quyết định ở đâu?
          selected_value: Extend existing context/handoff; exact scoped authority, no new state store
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
            spec này.
          supersedes: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-002
            - AC-005
            - AC-006
            - AC-007
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
        - id: D-003
          type: decision
          statement: One canonical owner contract, parent/integration final tail, stack hooks only
          question: Ai điều phối finish-tail?
          selected_value: One canonical owner contract, parent/integration final tail, stack hooks only
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
            spec này.
          supersedes: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-003
            - AC-008
            - AC-009
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
        - id: D-004
          type: decision
          statement: Keep simplify/repair/docs authority and required verification; no automatic Git
          question: Lựa chọn có mở rộng quyền không?
          selected_value: Keep simplify/repair/docs authority and required verification; no automatic Git
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
            spec này.
          supersedes: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-004
            - R-005
            - R-006
            - R-007
            - R-001
            - R-002
            - R-003
            - R-008
            - AC-001
            - AC-002
            - AC-003
            - AC-004
            - AC-005
            - AC-006
            - AC-007
            - AC-008
            - AC-009
            - AC-010
            - AC-011
            - AC-012
            - AC-013
            - AC-014
            - AC-015
            - AC-016
            - AC-017
            - INV-001
            - INV-002
            - INV-003
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          validation_boundary:
            kind: authorization
            source_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-016
              - AC-017
              - INV-001
              - INV-002
              - INV-003
        - id: D-005
          type: decision
          statement: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
          question: Giới hạn compatibility và delivery?
          selected_value: Keep 23 public skills, no dependencies, no historical approval migration, no commit/push
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của
            spec này.
          supersedes: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-008
            - AC-018
            - INV-004
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
          validation_boundary:
            kind: none
            source_refs:
              - R-008
              - AC-018
              - INV-004
        - id: INV-001
          type: invariant
          statement: Approval luôn explicit và riêng theo gate/revision; capability không phải authority.
          protected_refs:
            - R-001
            - R-002
            - AC-007
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-004
            - TASK-005
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-004
            - EVIDENCE-005
        - id: INV-002
          type: invariant
          statement: Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.
          protected_refs:
            - R-004
            - R-005
            - R-007
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: INV-003
          type: invariant
          statement: Required verification và stale evidence không bị preference hoặc finish choice xóa.
          protected_refs:
            - R-006
            - AC-015
            - AC-016
            - AC-017
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-004
            - TASK-005
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-007
        - id: INV-004
          type: invariant
          statement: Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.
          protected_refs:
            - R-008
            - AC-018
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-006
            - EVIDENCE-007
      history:
        - revision: 1
          active:
            - id: R-001
              type: requirement
            - id: R-002
              type: requirement
            - id: R-003
              type: requirement
            - id: R-004
              type: requirement
            - id: R-005
              type: requirement
            - id: R-006
              type: requirement
            - id: R-007
              type: requirement
            - id: R-008
              type: requirement
            - id: AC-001
              type: acceptance-criterion
            - id: AC-002
              type: acceptance-criterion
            - id: AC-003
              type: acceptance-criterion
            - id: AC-004
              type: acceptance-criterion
            - id: AC-005
              type: acceptance-criterion
            - id: AC-006
              type: acceptance-criterion
            - id: AC-007
              type: acceptance-criterion
            - id: AC-008
              type: acceptance-criterion
            - id: AC-009
              type: acceptance-criterion
            - id: AC-010
              type: acceptance-criterion
            - id: AC-011
              type: acceptance-criterion
            - id: AC-012
              type: acceptance-criterion
            - id: AC-013
              type: acceptance-criterion
            - id: AC-014
              type: acceptance-criterion
            - id: AC-015
              type: acceptance-criterion
            - id: AC-016
              type: acceptance-criterion
            - id: AC-017
              type: acceptance-criterion
            - id: AC-018
              type: acceptance-criterion
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
              type: decision
            - id: D-005
              type: decision
            - id: INV-001
              type: invariant
            - id: INV-002
              type: invariant
            - id: INV-003
              type: invariant
            - id: INV-004
              type: invariant
          tombstones: []
    goals:
      - id: G-001
        statement: Native-first explicit scoped decisions and one evidence-preserving finish tail across real consumers.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/harness-behavioral-sentinel.test.mjs
          - test/e2e/support/harness-behavior-runner.mjs
          - test/e2e/fixtures/harness-behavior-scenarios.json
          - test/e2e/communication-economy.test.mjs
          - test/e2e/skill-pack-runner.test.mjs
          - test/e2e/parallel-dispatch-protocol.test.mjs
          - test/e2e/production-readiness-contract.test.mjs
          - test/e2e/angular-production-contract.test.mjs
          - test/e2e/nextjs-production-contract.test.mjs
          - test/e2e/review-contract.test.mjs
          - test/e2e/repair-contract.test.mjs
          - test/e2e/ship-readiness-contract.test.mjs
          - test/e2e/test-track-contract.test.mjs
          - test/e2e/simplify-skill-contract.test.mjs
          - test/e2e/visual-offer-policy.test.mjs
          - test/e2e/fixtures/visual-offer-scenarios.json
          - test/e2e/support/interaction-finish-fixture.mjs
          - authoring/evals/interaction-finish-contract.json
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-016
              - AC-017
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/harness/runtime-policy.mjs
          - _refs/harness/runtime-attestation.mjs
          - _refs/harness/runtime-attestation.md
          - _refs/harness/capability-contract.json
          - _refs/shared/user-choice-prompt.md
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-001
              - R-002
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - INV-001
        justification_refs:
          - R-001
          - R-002
        enforces_invariant_refs:
          - INV-001
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/shared/finish-gate.mjs
          - _refs/shared/finish-gate.md
          - _refs/shared/repository-observation.mjs
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-016
              - AC-017
              - INV-002
              - INV-003
        justification_refs:
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/orchestration/execution-contract.mjs
          - _refs/angular/execution-contract.mjs
          - _refs/nextjs/execution-contract.mjs
          - _refs/orchestration/parallel-protocol.mjs
          - _refs/shared/review-contract.mjs
          - _refs/orchestration/repair-contract.mjs
          - _refs/shared/ship-readiness-contract.mjs
          - _refs/harness/communication-economy.mjs
          - _refs/harness/communication-economy.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-017
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
        planned_paths:
          - skills/shared/sdlc/02-spec.md
          - skills/shared/sdlc/architecture.md
          - skills/shared/sdlc/03-plan.md
          - skills/shared/sdlc/04-execute-plan.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nestjs/sdcorejs-nestjs.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/tracks/ai-agent/sdcorejs-ai-agent.md
          - skills/orchestration/subagent-driven-development.md
          - skills/shared/workflow/review.md
          - skills/orchestration/repair-loop.md
          - skills/orchestration/documentation.md
          - skills/shared/workflow/ship.md
          - skills/tracks/test/sdcorejs-test.md
          - _refs/orchestration/tail/repair-loop.md
          - _refs/documentation/gate.md
          - _refs/orchestration/tail/ship-context.md
          - _refs/orchestration/tail/verify-before-done.md
          - _refs/orchestration/tail/branch-ready.md
          - AGENTS.md
          - CLAUDE.md
          - .clinerules
          - .github/copilot-instructions.md
          - .github/chatmodes/sdcorejs.chatmode.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-011
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-016
              - AC-017
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - .claude/_refs/angular/execution-contract.mjs
          - .claude/_refs/documentation/gate.md
          - .claude/_refs/harness/capability-contract.json
          - .claude/_refs/harness/communication-economy.md
          - .claude/_refs/harness/communication-economy.mjs
          - .claude/_refs/harness/runtime-attestation.md
          - .claude/_refs/harness/runtime-attestation.mjs
          - .claude/_refs/harness/runtime-policy.mjs
          - .claude/_refs/nextjs/execution-contract.mjs
          - .claude/_refs/orchestration/execution-contract.mjs
          - .claude/_refs/orchestration/parallel-protocol.mjs
          - .claude/_refs/orchestration/repair-contract.mjs
          - .claude/_refs/orchestration/tail/branch-ready.md
          - .claude/_refs/orchestration/tail/repair-loop.md
          - .claude/_refs/orchestration/tail/ship-context.md
          - .claude/_refs/orchestration/tail/verify-before-done.md
          - .claude/_refs/shared/finish-gate.md
          - .claude/_refs/shared/finish-gate.mjs
          - .claude/_refs/shared/repository-observation.mjs
          - .claude/_refs/shared/review-contract.mjs
          - .claude/_refs/shared/ship-readiness-contract.mjs
          - .claude/_refs/shared/user-choice-prompt.md
          - .claude/sdcorejs-harness.json
          - .claude/skills/sdcorejs-ai-agent/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-architecture/SKILL.md
          - .claude/skills/sdcorejs-documentation/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - .claude/skills/sdcorejs-nestjs/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-plan/SKILL.md
          - .claude/skills/sdcorejs-repair-loop/SKILL.md
          - .claude/skills/sdcorejs-review/SKILL.md
          - .claude/skills/sdcorejs-ship/SKILL.md
          - .claude/skills/sdcorejs-spec/SKILL.md
          - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
          - .claude/skills/sdcorejs-test/SKILL.md
          - .cursor/rules/sdcorejs-agent.mdc
          - .cursor/sdcorejs-harness.json
          - .github/sdcorejs-harness.json
          - codex/sdcorejs-harness.json
          - codex/skills/_refs/angular/execution-contract.mjs
          - codex/skills/_refs/documentation/gate.md
          - codex/skills/_refs/harness/capability-contract.json
          - codex/skills/_refs/harness/communication-economy.md
          - codex/skills/_refs/harness/communication-economy.mjs
          - codex/skills/_refs/harness/runtime-attestation.md
          - codex/skills/_refs/harness/runtime-attestation.mjs
          - codex/skills/_refs/harness/runtime-policy.mjs
          - codex/skills/_refs/nextjs/execution-contract.mjs
          - codex/skills/_refs/orchestration/execution-contract.mjs
          - codex/skills/_refs/orchestration/parallel-protocol.mjs
          - codex/skills/_refs/orchestration/repair-contract.mjs
          - codex/skills/_refs/orchestration/tail/branch-ready.md
          - codex/skills/_refs/orchestration/tail/repair-loop.md
          - codex/skills/_refs/orchestration/tail/ship-context.md
          - codex/skills/_refs/orchestration/tail/verify-before-done.md
          - codex/skills/_refs/shared/finish-gate.md
          - codex/skills/_refs/shared/finish-gate.mjs
          - codex/skills/_refs/shared/repository-observation.mjs
          - codex/skills/_refs/shared/review-contract.mjs
          - codex/skills/_refs/shared/ship-readiness-contract.mjs
          - codex/skills/_refs/shared/user-choice-prompt.md
          - codex/skills/sdcorejs-ai-agent/SKILL.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-architecture/SKILL.md
          - codex/skills/sdcorejs-documentation/SKILL.md
          - codex/skills/sdcorejs-execute-plan/SKILL.md
          - codex/skills/sdcorejs-nestjs/SKILL.md
          - codex/skills/sdcorejs-nextjs/SKILL.md
          - codex/skills/sdcorejs-plan/SKILL.md
          - codex/skills/sdcorejs-repair-loop/SKILL.md
          - codex/skills/sdcorejs-review/SKILL.md
          - codex/skills/sdcorejs-ship/SKILL.md
          - codex/skills/sdcorejs-spec/SKILL.md
          - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
          - codex/skills/sdcorejs-test/SKILL.md
          - plugin/_refs/angular/execution-contract.mjs
          - plugin/_refs/documentation/gate.md
          - plugin/_refs/harness/capability-contract.json
          - plugin/_refs/harness/communication-economy.md
          - plugin/_refs/harness/communication-economy.mjs
          - plugin/_refs/harness/runtime-attestation.md
          - plugin/_refs/harness/runtime-attestation.mjs
          - plugin/_refs/harness/runtime-policy.mjs
          - plugin/_refs/nextjs/execution-contract.mjs
          - plugin/_refs/orchestration/execution-contract.mjs
          - plugin/_refs/orchestration/parallel-protocol.mjs
          - plugin/_refs/orchestration/repair-contract.mjs
          - plugin/_refs/orchestration/tail/branch-ready.md
          - plugin/_refs/orchestration/tail/repair-loop.md
          - plugin/_refs/orchestration/tail/ship-context.md
          - plugin/_refs/orchestration/tail/verify-before-done.md
          - plugin/_refs/shared/finish-gate.md
          - plugin/_refs/shared/finish-gate.mjs
          - plugin/_refs/shared/repository-observation.mjs
          - plugin/_refs/shared/review-contract.mjs
          - plugin/_refs/shared/ship-readiness-contract.mjs
          - plugin/_refs/shared/user-choice-prompt.md
          - plugin/sdcorejs-harness.json
          - plugin/skills/sdcorejs-ai-agent/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-architecture/SKILL.md
          - plugin/skills/sdcorejs-documentation/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-nestjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-plan/SKILL.md
          - plugin/skills/sdcorejs-repair-loop/SKILL.md
          - plugin/skills/sdcorejs-review/SKILL.md
          - plugin/skills/sdcorejs-ship/SKILL.md
          - plugin/skills/sdcorejs-spec/SKILL.md
          - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
          - plugin/skills/sdcorejs-test/SKILL.md
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-008
              - AC-018
              - INV-004
        justification_refs:
          - R-008
        enforces_invariant_refs:
          - INV-004
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - VALIDATION.md
          - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-003
              - R-005
              - R-006
              - R-008
              - AC-008
              - AC-014
              - AC-015
              - AC-016
              - AC-017
              - AC-018
              - INV-002
              - INV-003
              - INV-004
        justification_refs:
          - R-003
          - R-005
          - R-006
          - R-008
        enforces_invariant_refs:
          - INV-002
          - INV-003
          - INV-004
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/support/harness-behavior-runner.mjs
            - test/e2e/fixtures/harness-behavior-scenarios.json
            - test/e2e/communication-economy.test.mjs
            - test/e2e/skill-pack-runner.test.mjs
            - test/e2e/parallel-dispatch-protocol.test.mjs
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
            - test/e2e/review-contract.test.mjs
            - test/e2e/repair-contract.test.mjs
            - test/e2e/ship-readiness-contract.test.mjs
            - test/e2e/test-track-contract.test.mjs
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/visual-offer-policy.test.mjs
            - test/e2e/fixtures/visual-offer-scenarios.json
            - _refs/harness/runtime-policy.mjs
            - _refs/harness/runtime-attestation.mjs
            - _refs/harness/runtime-attestation.md
            - _refs/harness/capability-contract.json
            - _refs/shared/user-choice-prompt.md
            - _refs/shared/finish-gate.md
            - _refs/shared/repository-observation.mjs
            - _refs/orchestration/execution-contract.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
            - _refs/orchestration/parallel-protocol.mjs
            - _refs/shared/review-contract.mjs
            - _refs/orchestration/repair-contract.mjs
            - _refs/shared/ship-readiness-contract.mjs
            - _refs/harness/communication-economy.mjs
            - _refs/harness/communication-economy.md
            - skills/shared/sdlc/02-spec.md
            - skills/shared/sdlc/architecture.md
            - skills/shared/sdlc/03-plan.md
            - skills/shared/sdlc/04-execute-plan.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/nestjs/sdcorejs-nestjs.md
            - skills/tracks/nextjs/sdcorejs-nextjs.md
            - skills/tracks/ai-agent/sdcorejs-ai-agent.md
            - skills/orchestration/subagent-driven-development.md
            - skills/shared/workflow/review.md
            - skills/orchestration/repair-loop.md
            - skills/orchestration/documentation.md
            - skills/shared/workflow/ship.md
            - skills/tracks/test/sdcorejs-test.md
            - _refs/orchestration/tail/repair-loop.md
            - _refs/documentation/gate.md
            - _refs/orchestration/tail/ship-context.md
            - _refs/orchestration/tail/verify-before-done.md
            - _refs/orchestration/tail/branch-ready.md
            - AGENTS.md
            - CLAUDE.md
            - .clinerules
            - .github/copilot-instructions.md
            - .github/chatmodes/sdcorejs.chatmode.md
            - .claude/_refs/angular/execution-contract.mjs
            - .claude/_refs/documentation/gate.md
            - .claude/_refs/harness/capability-contract.json
            - .claude/_refs/harness/communication-economy.md
            - .claude/_refs/harness/communication-economy.mjs
            - .claude/_refs/harness/runtime-attestation.md
            - .claude/_refs/harness/runtime-attestation.mjs
            - .claude/_refs/harness/runtime-policy.mjs
            - .claude/_refs/nextjs/execution-contract.mjs
            - .claude/_refs/orchestration/execution-contract.mjs
            - .claude/_refs/orchestration/parallel-protocol.mjs
            - .claude/_refs/orchestration/repair-contract.mjs
            - .claude/_refs/orchestration/tail/branch-ready.md
            - .claude/_refs/orchestration/tail/repair-loop.md
            - .claude/_refs/orchestration/tail/ship-context.md
            - .claude/_refs/orchestration/tail/verify-before-done.md
            - .claude/_refs/shared/finish-gate.md
            - .claude/_refs/shared/repository-observation.mjs
            - .claude/_refs/shared/review-contract.mjs
            - .claude/_refs/shared/ship-readiness-contract.mjs
            - .claude/_refs/shared/user-choice-prompt.md
            - .claude/sdcorejs-harness.json
            - .claude/skills/sdcorejs-ai-agent/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-architecture/SKILL.md
            - .claude/skills/sdcorejs-documentation/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - .claude/skills/sdcorejs-nestjs/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-plan/SKILL.md
            - .claude/skills/sdcorejs-repair-loop/SKILL.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - .claude/skills/sdcorejs-ship/SKILL.md
            - .claude/skills/sdcorejs-spec/SKILL.md
            - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
            - .claude/skills/sdcorejs-test/SKILL.md
            - .cursor/rules/sdcorejs-agent.mdc
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - codex/skills/_refs/angular/execution-contract.mjs
            - codex/skills/_refs/documentation/gate.md
            - codex/skills/_refs/harness/capability-contract.json
            - codex/skills/_refs/harness/communication-economy.md
            - codex/skills/_refs/harness/communication-economy.mjs
            - codex/skills/_refs/harness/runtime-attestation.md
            - codex/skills/_refs/harness/runtime-attestation.mjs
            - codex/skills/_refs/harness/runtime-policy.mjs
            - codex/skills/_refs/nextjs/execution-contract.mjs
            - codex/skills/_refs/orchestration/execution-contract.mjs
            - codex/skills/_refs/orchestration/parallel-protocol.mjs
            - codex/skills/_refs/orchestration/repair-contract.mjs
            - codex/skills/_refs/orchestration/tail/branch-ready.md
            - codex/skills/_refs/orchestration/tail/repair-loop.md
            - codex/skills/_refs/orchestration/tail/ship-context.md
            - codex/skills/_refs/orchestration/tail/verify-before-done.md
            - codex/skills/_refs/shared/finish-gate.md
            - codex/skills/_refs/shared/repository-observation.mjs
            - codex/skills/_refs/shared/review-contract.mjs
            - codex/skills/_refs/shared/ship-readiness-contract.mjs
            - codex/skills/_refs/shared/user-choice-prompt.md
            - codex/skills/sdcorejs-ai-agent/SKILL.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-architecture/SKILL.md
            - codex/skills/sdcorejs-documentation/SKILL.md
            - codex/skills/sdcorejs-execute-plan/SKILL.md
            - codex/skills/sdcorejs-nestjs/SKILL.md
            - codex/skills/sdcorejs-nextjs/SKILL.md
            - codex/skills/sdcorejs-plan/SKILL.md
            - codex/skills/sdcorejs-repair-loop/SKILL.md
            - codex/skills/sdcorejs-review/SKILL.md
            - codex/skills/sdcorejs-ship/SKILL.md
            - codex/skills/sdcorejs-spec/SKILL.md
            - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
            - codex/skills/sdcorejs-test/SKILL.md
            - plugin/_refs/angular/execution-contract.mjs
            - plugin/_refs/documentation/gate.md
            - plugin/_refs/harness/capability-contract.json
            - plugin/_refs/harness/communication-economy.md
            - plugin/_refs/harness/communication-economy.mjs
            - plugin/_refs/harness/runtime-attestation.md
            - plugin/_refs/harness/runtime-attestation.mjs
            - plugin/_refs/harness/runtime-policy.mjs
            - plugin/_refs/nextjs/execution-contract.mjs
            - plugin/_refs/orchestration/execution-contract.mjs
            - plugin/_refs/orchestration/parallel-protocol.mjs
            - plugin/_refs/orchestration/repair-contract.mjs
            - plugin/_refs/orchestration/tail/branch-ready.md
            - plugin/_refs/orchestration/tail/repair-loop.md
            - plugin/_refs/orchestration/tail/ship-context.md
            - plugin/_refs/orchestration/tail/verify-before-done.md
            - plugin/_refs/shared/finish-gate.md
            - plugin/_refs/shared/repository-observation.mjs
            - plugin/_refs/shared/review-contract.mjs
            - plugin/_refs/shared/ship-readiness-contract.mjs
            - plugin/_refs/shared/user-choice-prompt.md
            - plugin/sdcorejs-harness.json
            - plugin/skills/sdcorejs-ai-agent/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-architecture/SKILL.md
            - plugin/skills/sdcorejs-documentation/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-nestjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-plan/SKILL.md
            - plugin/skills/sdcorejs-repair-loop/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - plugin/skills/sdcorejs-ship/SKILL.md
            - plugin/skills/sdcorejs-spec/SKILL.md
            - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
            - plugin/skills/sdcorejs-test/SKILL.md
            - VALIDATION.md
          intended_new_paths:
            - path: test/e2e/support/interaction-finish-fixture.mjs
              owner_task_id: TASK-001
            - path: authoring/evals/interaction-finish-contract.json
              owner_task_id: TASK-001
            - path: _refs/shared/finish-gate.mjs
              owner_task_id: TASK-003
            - path: .claude/_refs/shared/finish-gate.mjs
              owner_task_id: TASK-006
            - path: codex/skills/_refs/shared/finish-gate.mjs
              owner_task_id: TASK-006
            - path: plugin/_refs/shared/finish-gate.mjs
              owner_task_id: TASK-006
            - path: .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
              owner_task_id: TASK-007
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-native-runtime
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Native exposed và permitted trong current mode dùng structured choice;
        missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi
        mode/flag để lấy tool.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-004
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-native-failure
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-004
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-reply-normalization
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản
        chứa số ngoài lựa chọn không thành approval.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-004
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-ambiguous-gates
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ
        tự hoặc gate gần nhất.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-004
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-reuse-choice
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse
        qua context/handoff mà không hỏi lại.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-005
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-stale-choice
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice
        cũ không áp dụng; chỉ unresolved delta được hỏi.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-005
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-separate-approval
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Spec approval không approve plan; single option, default, silence, thanks, delegated
        preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu
        chỉnh sửa / 3 Hủy.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-004
        - EVIDENCE-005
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-canonical-callers
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship
        sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-integration-owner
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs
        tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-resolved-small-fix
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại;
        missing-doc creation vẫn cần authority cho đúng file/scope.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-simplify-semantics
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không
        source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-review-only
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-bounded-repair
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize
        mọi finding, không tự simplify sau repair.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-014
      invariant_refs:
        - INV-002
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-defer
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-002
        - INV-003
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-skip-review
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng,
        không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-016
      invariant_refs:
        - INV-003
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-tdd-order
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được
        gọi RED-first; finish choice không xóa required tests/AC.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-005
        - EVIDENCE-007
        - EVIDENCE-004
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-017
      invariant_refs:
        - INV-003
      risk: workflow-authority-and-evidence
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - INV-001
          - INV-002
          - INV-003
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-interaction-finish-evidence-order
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Baseline/test → optional simplify → affected re-verification → selected review/repair →
        authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc
        chạy lại gate trước handoff.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-018
      invariant_refs:
        - INV-004
      risk: contract-compatibility
      boundary:
        kind: none
        approval_ref: D-005
        source_refs:
          - R-008
          - AC-018
          - INV-004
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-interaction-finish-compatibility
      planned_command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
        test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
        test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
        test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
        test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
        test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Documented payload → helper → real caller regression và mutation cases giữ safety assertions;
        schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable
        history không migrate, mirrors và hygiene checks đạt.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
      rationale: Planned local Node contract API/consumer proof. api-e2e denotes the exported governance API denial
        boundary, not HTTP, browser, live-provider or target-product verification. This row is not executed
        evidence.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/support/harness-behavior-runner.mjs
    - test/e2e/fixtures/harness-behavior-scenarios.json
    - test/e2e/communication-economy.test.mjs
    - test/e2e/skill-pack-runner.test.mjs
    - test/e2e/parallel-dispatch-protocol.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - test/e2e/angular-production-contract.test.mjs
    - test/e2e/nextjs-production-contract.test.mjs
    - test/e2e/review-contract.test.mjs
    - test/e2e/repair-contract.test.mjs
    - test/e2e/ship-readiness-contract.test.mjs
    - test/e2e/test-track-contract.test.mjs
    - test/e2e/simplify-skill-contract.test.mjs
    - test/e2e/visual-offer-policy.test.mjs
    - test/e2e/fixtures/visual-offer-scenarios.json
    - test/e2e/support/interaction-finish-fixture.mjs
    - authoring/evals/interaction-finish-contract.json
    - _refs/harness/runtime-policy.mjs
    - _refs/harness/runtime-attestation.mjs
    - _refs/harness/runtime-attestation.md
    - _refs/harness/capability-contract.json
    - _refs/shared/user-choice-prompt.md
    - _refs/shared/finish-gate.mjs
    - _refs/shared/finish-gate.md
    - _refs/shared/repository-observation.mjs
    - _refs/orchestration/execution-contract.mjs
    - _refs/angular/execution-contract.mjs
    - _refs/nextjs/execution-contract.mjs
    - _refs/orchestration/parallel-protocol.mjs
    - _refs/shared/review-contract.mjs
    - _refs/orchestration/repair-contract.mjs
    - _refs/shared/ship-readiness-contract.mjs
    - _refs/harness/communication-economy.mjs
    - _refs/harness/communication-economy.md
    - skills/shared/sdlc/02-spec.md
    - skills/shared/sdlc/architecture.md
    - skills/shared/sdlc/03-plan.md
    - skills/shared/sdlc/04-execute-plan.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/nestjs/sdcorejs-nestjs.md
    - skills/tracks/nextjs/sdcorejs-nextjs.md
    - skills/tracks/ai-agent/sdcorejs-ai-agent.md
    - skills/orchestration/subagent-driven-development.md
    - skills/shared/workflow/review.md
    - skills/orchestration/repair-loop.md
    - skills/orchestration/documentation.md
    - skills/shared/workflow/ship.md
    - skills/tracks/test/sdcorejs-test.md
    - _refs/orchestration/tail/repair-loop.md
    - _refs/documentation/gate.md
    - _refs/orchestration/tail/ship-context.md
    - _refs/orchestration/tail/verify-before-done.md
    - _refs/orchestration/tail/branch-ready.md
    - AGENTS.md
    - CLAUDE.md
    - .clinerules
    - .github/copilot-instructions.md
    - .github/chatmodes/sdcorejs.chatmode.md
    - .claude/_refs/angular/execution-contract.mjs
    - .claude/_refs/documentation/gate.md
    - .claude/_refs/harness/capability-contract.json
    - .claude/_refs/harness/communication-economy.md
    - .claude/_refs/harness/communication-economy.mjs
    - .claude/_refs/harness/runtime-attestation.md
    - .claude/_refs/harness/runtime-attestation.mjs
    - .claude/_refs/harness/runtime-policy.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/orchestration/parallel-protocol.mjs
    - .claude/_refs/orchestration/repair-contract.mjs
    - .claude/_refs/orchestration/tail/branch-ready.md
    - .claude/_refs/orchestration/tail/repair-loop.md
    - .claude/_refs/orchestration/tail/ship-context.md
    - .claude/_refs/orchestration/tail/verify-before-done.md
    - .claude/_refs/shared/finish-gate.md
    - .claude/_refs/shared/finish-gate.mjs
    - .claude/_refs/shared/repository-observation.mjs
    - .claude/_refs/shared/review-contract.mjs
    - .claude/_refs/shared/ship-readiness-contract.mjs
    - .claude/_refs/shared/user-choice-prompt.md
    - .claude/sdcorejs-harness.json
    - .claude/skills/sdcorejs-ai-agent/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-architecture/SKILL.md
    - .claude/skills/sdcorejs-documentation/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - .claude/skills/sdcorejs-nestjs/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-plan/SKILL.md
    - .claude/skills/sdcorejs-repair-loop/SKILL.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - .claude/skills/sdcorejs-ship/SKILL.md
    - .claude/skills/sdcorejs-spec/SKILL.md
    - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
    - .claude/skills/sdcorejs-test/SKILL.md
    - .cursor/rules/sdcorejs-agent.mdc
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - codex/skills/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/documentation/gate.md
    - codex/skills/_refs/harness/capability-contract.json
    - codex/skills/_refs/harness/communication-economy.md
    - codex/skills/_refs/harness/communication-economy.mjs
    - codex/skills/_refs/harness/runtime-attestation.md
    - codex/skills/_refs/harness/runtime-attestation.mjs
    - codex/skills/_refs/harness/runtime-policy.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/parallel-protocol.mjs
    - codex/skills/_refs/orchestration/repair-contract.mjs
    - codex/skills/_refs/orchestration/tail/branch-ready.md
    - codex/skills/_refs/orchestration/tail/repair-loop.md
    - codex/skills/_refs/orchestration/tail/ship-context.md
    - codex/skills/_refs/orchestration/tail/verify-before-done.md
    - codex/skills/_refs/shared/finish-gate.md
    - codex/skills/_refs/shared/finish-gate.mjs
    - codex/skills/_refs/shared/repository-observation.mjs
    - codex/skills/_refs/shared/review-contract.mjs
    - codex/skills/_refs/shared/ship-readiness-contract.mjs
    - codex/skills/_refs/shared/user-choice-prompt.md
    - codex/skills/sdcorejs-ai-agent/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-architecture/SKILL.md
    - codex/skills/sdcorejs-documentation/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-nestjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-plan/SKILL.md
    - codex/skills/sdcorejs-repair-loop/SKILL.md
    - codex/skills/sdcorejs-review/SKILL.md
    - codex/skills/sdcorejs-ship/SKILL.md
    - codex/skills/sdcorejs-spec/SKILL.md
    - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
    - codex/skills/sdcorejs-test/SKILL.md
    - plugin/_refs/angular/execution-contract.mjs
    - plugin/_refs/documentation/gate.md
    - plugin/_refs/harness/capability-contract.json
    - plugin/_refs/harness/communication-economy.md
    - plugin/_refs/harness/communication-economy.mjs
    - plugin/_refs/harness/runtime-attestation.md
    - plugin/_refs/harness/runtime-attestation.mjs
    - plugin/_refs/harness/runtime-policy.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/parallel-protocol.mjs
    - plugin/_refs/orchestration/repair-contract.mjs
    - plugin/_refs/orchestration/tail/branch-ready.md
    - plugin/_refs/orchestration/tail/repair-loop.md
    - plugin/_refs/orchestration/tail/ship-context.md
    - plugin/_refs/orchestration/tail/verify-before-done.md
    - plugin/_refs/shared/finish-gate.md
    - plugin/_refs/shared/finish-gate.mjs
    - plugin/_refs/shared/repository-observation.mjs
    - plugin/_refs/shared/review-contract.mjs
    - plugin/_refs/shared/ship-readiness-contract.mjs
    - plugin/_refs/shared/user-choice-prompt.md
    - plugin/sdcorejs-harness.json
    - plugin/skills/sdcorejs-ai-agent/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-architecture/SKILL.md
    - plugin/skills/sdcorejs-documentation/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-nestjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-plan/SKILL.md
    - plugin/skills/sdcorejs-repair-loop/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - plugin/skills/sdcorejs-ship/SKILL.md
    - plugin/skills/sdcorejs-spec/SKILL.md
    - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
    - plugin/skills/sdcorejs-test/SKILL.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
    - authoring/evals/uiux/evidence.test.mjs
  prohibited_paths:
    - package.json
    - package-lock.json
    - node_modules/**
    - site/**
    - .git/**
    - .env
    - .env.*
    - _refs/shared/system-registry.json
    - _refs/shared/approved-artifact.mjs
    - _refs/shared/architecture-contract.mjs
    - _refs/shared/decision-coverage.mjs
    - _refs/shared/validation-map.mjs
    - _refs/shared/repository-contract.mjs
    - _refs/shared/design-handoff.mjs
    - _refs/shared/ui-review-contract.mjs
    - _refs/simplify/**
    - skills/shared/workflow/simplify.md
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - .sdcorejs/plans/**
    - .sdcorejs/conventions/**
    - .sdcorejs/memories/**
    - authoring/evals/records/**
    - authoring/evals/visual-offer/**
    - authoring/evals/uiux/README.md
    - authoring/evals/uiux/design-handoff-integration.json
    - authoring/evals/uiux/green-sources.json
    - authoring/evals/uiux/green.txt
    - authoring/evals/uiux/post-review-green.txt
    - authoring/evals/uiux/post-review-red.txt
    - authoring/evals/uiux/records.json
    - authoring/evals/uiux/red.txt
    - authoring/evals/uiux/refactor.txt
    - authoring/evals/uiux/review-red.txt
    - authoring/evals/uiux/skill-creator-green.txt
    - authoring/evals/uiux/skill-creator-isolation-red.txt
    - authoring/evals/uiux/skill-creator-red.txt
    - authoring/evals/uiux/ui-review-integration.json
    - authoring/evals/uiux/version-red.txt
  generated_artifacts:
    - .claude/_refs/angular/execution-contract.mjs
    - .claude/_refs/documentation/gate.md
    - .claude/_refs/harness/capability-contract.json
    - .claude/_refs/harness/communication-economy.md
    - .claude/_refs/harness/communication-economy.mjs
    - .claude/_refs/harness/runtime-attestation.md
    - .claude/_refs/harness/runtime-attestation.mjs
    - .claude/_refs/harness/runtime-policy.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/orchestration/parallel-protocol.mjs
    - .claude/_refs/orchestration/repair-contract.mjs
    - .claude/_refs/orchestration/tail/branch-ready.md
    - .claude/_refs/orchestration/tail/repair-loop.md
    - .claude/_refs/orchestration/tail/ship-context.md
    - .claude/_refs/orchestration/tail/verify-before-done.md
    - .claude/_refs/shared/finish-gate.md
    - .claude/_refs/shared/finish-gate.mjs
    - .claude/_refs/shared/repository-observation.mjs
    - .claude/_refs/shared/review-contract.mjs
    - .claude/_refs/shared/ship-readiness-contract.mjs
    - .claude/_refs/shared/user-choice-prompt.md
    - .claude/sdcorejs-harness.json
    - .claude/skills/sdcorejs-ai-agent/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-architecture/SKILL.md
    - .claude/skills/sdcorejs-documentation/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - .claude/skills/sdcorejs-nestjs/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-plan/SKILL.md
    - .claude/skills/sdcorejs-repair-loop/SKILL.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - .claude/skills/sdcorejs-ship/SKILL.md
    - .claude/skills/sdcorejs-spec/SKILL.md
    - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
    - .claude/skills/sdcorejs-test/SKILL.md
    - .cursor/rules/sdcorejs-agent.mdc
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - codex/skills/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/documentation/gate.md
    - codex/skills/_refs/harness/capability-contract.json
    - codex/skills/_refs/harness/communication-economy.md
    - codex/skills/_refs/harness/communication-economy.mjs
    - codex/skills/_refs/harness/runtime-attestation.md
    - codex/skills/_refs/harness/runtime-attestation.mjs
    - codex/skills/_refs/harness/runtime-policy.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/parallel-protocol.mjs
    - codex/skills/_refs/orchestration/repair-contract.mjs
    - codex/skills/_refs/orchestration/tail/branch-ready.md
    - codex/skills/_refs/orchestration/tail/repair-loop.md
    - codex/skills/_refs/orchestration/tail/ship-context.md
    - codex/skills/_refs/orchestration/tail/verify-before-done.md
    - codex/skills/_refs/shared/finish-gate.md
    - codex/skills/_refs/shared/finish-gate.mjs
    - codex/skills/_refs/shared/repository-observation.mjs
    - codex/skills/_refs/shared/review-contract.mjs
    - codex/skills/_refs/shared/ship-readiness-contract.mjs
    - codex/skills/_refs/shared/user-choice-prompt.md
    - codex/skills/sdcorejs-ai-agent/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-architecture/SKILL.md
    - codex/skills/sdcorejs-documentation/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-nestjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-plan/SKILL.md
    - codex/skills/sdcorejs-repair-loop/SKILL.md
    - codex/skills/sdcorejs-review/SKILL.md
    - codex/skills/sdcorejs-ship/SKILL.md
    - codex/skills/sdcorejs-spec/SKILL.md
    - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
    - codex/skills/sdcorejs-test/SKILL.md
    - plugin/_refs/angular/execution-contract.mjs
    - plugin/_refs/documentation/gate.md
    - plugin/_refs/harness/capability-contract.json
    - plugin/_refs/harness/communication-economy.md
    - plugin/_refs/harness/communication-economy.mjs
    - plugin/_refs/harness/runtime-attestation.md
    - plugin/_refs/harness/runtime-attestation.mjs
    - plugin/_refs/harness/runtime-policy.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/parallel-protocol.mjs
    - plugin/_refs/orchestration/repair-contract.mjs
    - plugin/_refs/orchestration/tail/branch-ready.md
    - plugin/_refs/orchestration/tail/repair-loop.md
    - plugin/_refs/orchestration/tail/ship-context.md
    - plugin/_refs/orchestration/tail/verify-before-done.md
    - plugin/_refs/shared/finish-gate.md
    - plugin/_refs/shared/finish-gate.mjs
    - plugin/_refs/shared/repository-observation.mjs
    - plugin/_refs/shared/review-contract.mjs
    - plugin/_refs/shared/ship-readiness-contract.mjs
    - plugin/_refs/shared/user-choice-prompt.md
    - plugin/sdcorejs-harness.json
    - plugin/skills/sdcorejs-ai-agent/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-architecture/SKILL.md
    - plugin/skills/sdcorejs-documentation/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-nestjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-plan/SKILL.md
    - plugin/skills/sdcorejs-repair-loop/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - plugin/skills/sdcorejs-ship/SKILL.md
    - plugin/skills/sdcorejs-spec/SKILL.md
    - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
    - plugin/skills/sdcorejs-test/SKILL.md
  docs_artifacts:
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: null
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Workflow skill-pack contracts only; no frontend product implementation.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Shared orchestration changes; no agent application engine/capability implementation.
  verification_strategy:
    package_manager: npm
    package_manager_evidence: package.json packageManager npm@10.9.2; package-lock.json exists; installed Node
      24.19.0 satisfies engines.
    commands_planned:
      - command: node --test --test-concurrency=1 test/e2e/harness-behavioral-sentinel.test.mjs
          test/e2e/communication-economy.test.mjs test/e2e/skill-pack-runner.test.mjs
          test/e2e/parallel-dispatch-protocol.test.mjs test/e2e/production-readiness-contract.test.mjs
          test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs
          test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs
          test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
          test/e2e/simplify-skill-contract.test.mjs test/e2e/visual-offer-policy.test.mjs
        reason: 18 AC payload-to-helper-to-consumer regressions
      - command: node authoring/evals/run-deterministic.mjs
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run test:e2e:skill-authoring
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run sync:skills
        reason: Generate derived mirrors before final checks
      - command: npm run check:skills
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run check:skills:ps
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run check:text-hygiene
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run check:executable-references
        reason: Affected contract/inventory/schema/hygiene verification
      - command: npm run test:e2e:repository
        reason: Affected contract/inventory/schema/hygiene verification
      - command: git diff --check
        reason: Affected contract/inventory/schema/hygiene verification
    commands_skipped:
      - command: npm run test:e2e
        reason: Golden product generators and broad target-product suites unchanged; repository suite is the scoped
          broad gate.
      - command: npm run test:e2e:nestjs:containers
        reason: No container/service execution in scope.
      - command: live/native/provider/browser matrix
        reason: No live or paid services/browser installs authorized; deterministic tool exposure/failure fixtures do
          not claim live-native execution.
      - command: npm run check:audit / npm run check:site:audit / npm run build:site
        reason: No dependency/site changes; outside scoped local contract validation.
    checks:
      focused:
        - test/e2e/harness-behavioral-sentinel.test.mjs
        - test/e2e/communication-economy.test.mjs
        - test/e2e/skill-pack-runner.test.mjs
        - test/e2e/parallel-dispatch-protocol.test.mjs
        - test/e2e/production-readiness-contract.test.mjs
        - test/e2e/angular-production-contract.test.mjs
        - test/e2e/nextjs-production-contract.test.mjs
        - test/e2e/review-contract.test.mjs
        - test/e2e/repair-contract.test.mjs
        - test/e2e/ship-readiness-contract.test.mjs
        - test/e2e/test-track-contract.test.mjs
        - test/e2e/simplify-skill-contract.test.mjs
        - test/e2e/visual-offer-policy.test.mjs
      broad:
        - test:e2e:repository
      generated:
        - check:skills
        - check:skills:ps
      hygiene:
        - check:text-hygiene
        - check:executable-references
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: _refs/harness/runtime-policy.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/harness/runtime-attestation.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/harness/runtime-attestation.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/harness/capability-contract.json
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/user-choice-prompt.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/finish-gate.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/finish-gate.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/repository-observation.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/execution-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/angular/execution-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/nextjs/execution-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/parallel-protocol.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/review-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/repair-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/shared/ship-readiness-contract.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/harness/communication-economy.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/harness/communication-economy.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/tail/repair-loop.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/documentation/gate.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/tail/ship-context.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/tail/verify-before-done.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: _refs/orchestration/tail/branch-ready.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: AGENTS.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
      - path: CLAUDE.md
        owner: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single parent writer; shared schema and consumers are dependent.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - TASK-001
      - TASK-002
      - TASK-003
      - TASK-004
      - TASK-005
      - TASK-006
      - TASK-007
    contract:
      schema_version: 1
      integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      dependency_order:
        - TASK-001
        - TASK-002
        - TASK-003
        - TASK-004
        - TASK-005
        - TASK-006
        - TASK-007
      gitlink_updates_in_scope: false
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          role: standalone
          module_id: null
          root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
          available: true
          writable: true
      steps:
        - id: TASK-001-CREATE
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - test/e2e/support/interaction-finish-fixture.mjs
            - authoring/evals/interaction-finish-contract.json
          allowed_paths:
            - test/e2e/support/interaction-finish-fixture.mjs
            - authoring/evals/interaction-finish-contract.json
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on: []
        - id: TASK-001-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/support/harness-behavior-runner.mjs
            - test/e2e/fixtures/harness-behavior-scenarios.json
            - test/e2e/communication-economy.test.mjs
            - test/e2e/skill-pack-runner.test.mjs
            - test/e2e/parallel-dispatch-protocol.test.mjs
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
            - test/e2e/review-contract.test.mjs
            - test/e2e/repair-contract.test.mjs
            - test/e2e/ship-readiness-contract.test.mjs
            - test/e2e/test-track-contract.test.mjs
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/visual-offer-policy.test.mjs
            - test/e2e/fixtures/visual-offer-scenarios.json
            - authoring/evals/uiux/evidence.test.mjs
          allowed_paths:
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/support/harness-behavior-runner.mjs
            - test/e2e/fixtures/harness-behavior-scenarios.json
            - test/e2e/communication-economy.test.mjs
            - test/e2e/skill-pack-runner.test.mjs
            - test/e2e/parallel-dispatch-protocol.test.mjs
            - test/e2e/production-readiness-contract.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
            - test/e2e/review-contract.test.mjs
            - test/e2e/repair-contract.test.mjs
            - test/e2e/ship-readiness-contract.test.mjs
            - test/e2e/test-track-contract.test.mjs
            - test/e2e/simplify-skill-contract.test.mjs
            - test/e2e/visual-offer-policy.test.mjs
            - test/e2e/fixtures/visual-offer-scenarios.json
            - authoring/evals/uiux/evidence.test.mjs
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on: []
        - id: TASK-002-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - _refs/harness/runtime-policy.mjs
            - _refs/harness/runtime-attestation.mjs
            - _refs/harness/runtime-attestation.md
            - _refs/harness/capability-contract.json
            - _refs/shared/user-choice-prompt.md
          allowed_paths:
            - _refs/harness/runtime-policy.mjs
            - _refs/harness/runtime-attestation.mjs
            - _refs/harness/runtime-attestation.md
            - _refs/harness/capability-contract.json
            - _refs/shared/user-choice-prompt.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-001-CREATE
            - TASK-001-EDIT
        - id: TASK-003-CREATE
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - _refs/shared/finish-gate.mjs
          allowed_paths:
            - _refs/shared/finish-gate.mjs
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-002-EDIT
        - id: TASK-003-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - _refs/shared/finish-gate.md
            - _refs/shared/repository-observation.mjs
          allowed_paths:
            - _refs/shared/finish-gate.md
            - _refs/shared/repository-observation.mjs
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-002-EDIT
        - id: TASK-004-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - _refs/orchestration/execution-contract.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
            - _refs/orchestration/parallel-protocol.mjs
            - _refs/shared/review-contract.mjs
            - _refs/orchestration/repair-contract.mjs
            - _refs/shared/ship-readiness-contract.mjs
            - _refs/harness/communication-economy.mjs
            - _refs/harness/communication-economy.md
          allowed_paths:
            - _refs/orchestration/execution-contract.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
            - _refs/orchestration/parallel-protocol.mjs
            - _refs/shared/review-contract.mjs
            - _refs/orchestration/repair-contract.mjs
            - _refs/shared/ship-readiness-contract.mjs
            - _refs/harness/communication-economy.mjs
            - _refs/harness/communication-economy.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-003-CREATE
            - TASK-003-EDIT
        - id: TASK-005-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - skills/shared/sdlc/02-spec.md
            - skills/shared/sdlc/architecture.md
            - skills/shared/sdlc/03-plan.md
            - skills/shared/sdlc/04-execute-plan.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/nestjs/sdcorejs-nestjs.md
            - skills/tracks/nextjs/sdcorejs-nextjs.md
            - skills/tracks/ai-agent/sdcorejs-ai-agent.md
            - skills/orchestration/subagent-driven-development.md
            - skills/shared/workflow/review.md
            - skills/orchestration/repair-loop.md
            - skills/orchestration/documentation.md
            - skills/shared/workflow/ship.md
            - skills/tracks/test/sdcorejs-test.md
            - _refs/orchestration/tail/repair-loop.md
            - _refs/documentation/gate.md
            - _refs/orchestration/tail/ship-context.md
            - _refs/orchestration/tail/verify-before-done.md
            - _refs/orchestration/tail/branch-ready.md
            - AGENTS.md
            - CLAUDE.md
            - .clinerules
            - .github/copilot-instructions.md
            - .github/chatmodes/sdcorejs.chatmode.md
          allowed_paths:
            - skills/shared/sdlc/02-spec.md
            - skills/shared/sdlc/architecture.md
            - skills/shared/sdlc/03-plan.md
            - skills/shared/sdlc/04-execute-plan.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/nestjs/sdcorejs-nestjs.md
            - skills/tracks/nextjs/sdcorejs-nextjs.md
            - skills/tracks/ai-agent/sdcorejs-ai-agent.md
            - skills/orchestration/subagent-driven-development.md
            - skills/shared/workflow/review.md
            - skills/orchestration/repair-loop.md
            - skills/orchestration/documentation.md
            - skills/shared/workflow/ship.md
            - skills/tracks/test/sdcorejs-test.md
            - _refs/orchestration/tail/repair-loop.md
            - _refs/documentation/gate.md
            - _refs/orchestration/tail/ship-context.md
            - _refs/orchestration/tail/verify-before-done.md
            - _refs/orchestration/tail/branch-ready.md
            - AGENTS.md
            - CLAUDE.md
            - .clinerules
            - .github/copilot-instructions.md
            - .github/chatmodes/sdcorejs.chatmode.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-004-EDIT
        - id: TASK-006-CREATE
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - .claude/_refs/shared/finish-gate.mjs
            - codex/skills/_refs/shared/finish-gate.mjs
            - plugin/_refs/shared/finish-gate.mjs
          allowed_paths:
            - .claude/_refs/shared/finish-gate.mjs
            - codex/skills/_refs/shared/finish-gate.mjs
            - plugin/_refs/shared/finish-gate.mjs
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-005-EDIT
        - id: TASK-006-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - .claude/_refs/angular/execution-contract.mjs
            - .claude/_refs/documentation/gate.md
            - .claude/_refs/harness/capability-contract.json
            - .claude/_refs/harness/communication-economy.md
            - .claude/_refs/harness/communication-economy.mjs
            - .claude/_refs/harness/runtime-attestation.md
            - .claude/_refs/harness/runtime-attestation.mjs
            - .claude/_refs/harness/runtime-policy.mjs
            - .claude/_refs/nextjs/execution-contract.mjs
            - .claude/_refs/orchestration/execution-contract.mjs
            - .claude/_refs/orchestration/parallel-protocol.mjs
            - .claude/_refs/orchestration/repair-contract.mjs
            - .claude/_refs/orchestration/tail/branch-ready.md
            - .claude/_refs/orchestration/tail/repair-loop.md
            - .claude/_refs/orchestration/tail/ship-context.md
            - .claude/_refs/orchestration/tail/verify-before-done.md
            - .claude/_refs/shared/finish-gate.md
            - .claude/_refs/shared/repository-observation.mjs
            - .claude/_refs/shared/review-contract.mjs
            - .claude/_refs/shared/ship-readiness-contract.mjs
            - .claude/_refs/shared/user-choice-prompt.md
            - .claude/sdcorejs-harness.json
            - .claude/skills/sdcorejs-ai-agent/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-architecture/SKILL.md
            - .claude/skills/sdcorejs-documentation/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - .claude/skills/sdcorejs-nestjs/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-plan/SKILL.md
            - .claude/skills/sdcorejs-repair-loop/SKILL.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - .claude/skills/sdcorejs-ship/SKILL.md
            - .claude/skills/sdcorejs-spec/SKILL.md
            - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
            - .claude/skills/sdcorejs-test/SKILL.md
            - .cursor/rules/sdcorejs-agent.mdc
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - codex/skills/_refs/angular/execution-contract.mjs
            - codex/skills/_refs/documentation/gate.md
            - codex/skills/_refs/harness/capability-contract.json
            - codex/skills/_refs/harness/communication-economy.md
            - codex/skills/_refs/harness/communication-economy.mjs
            - codex/skills/_refs/harness/runtime-attestation.md
            - codex/skills/_refs/harness/runtime-attestation.mjs
            - codex/skills/_refs/harness/runtime-policy.mjs
            - codex/skills/_refs/nextjs/execution-contract.mjs
            - codex/skills/_refs/orchestration/execution-contract.mjs
            - codex/skills/_refs/orchestration/parallel-protocol.mjs
            - codex/skills/_refs/orchestration/repair-contract.mjs
            - codex/skills/_refs/orchestration/tail/branch-ready.md
            - codex/skills/_refs/orchestration/tail/repair-loop.md
            - codex/skills/_refs/orchestration/tail/ship-context.md
            - codex/skills/_refs/orchestration/tail/verify-before-done.md
            - codex/skills/_refs/shared/finish-gate.md
            - codex/skills/_refs/shared/repository-observation.mjs
            - codex/skills/_refs/shared/review-contract.mjs
            - codex/skills/_refs/shared/ship-readiness-contract.mjs
            - codex/skills/_refs/shared/user-choice-prompt.md
            - codex/skills/sdcorejs-ai-agent/SKILL.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-architecture/SKILL.md
            - codex/skills/sdcorejs-documentation/SKILL.md
            - codex/skills/sdcorejs-execute-plan/SKILL.md
            - codex/skills/sdcorejs-nestjs/SKILL.md
            - codex/skills/sdcorejs-nextjs/SKILL.md
            - codex/skills/sdcorejs-plan/SKILL.md
            - codex/skills/sdcorejs-repair-loop/SKILL.md
            - codex/skills/sdcorejs-review/SKILL.md
            - codex/skills/sdcorejs-ship/SKILL.md
            - codex/skills/sdcorejs-spec/SKILL.md
            - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
            - codex/skills/sdcorejs-test/SKILL.md
            - plugin/_refs/angular/execution-contract.mjs
            - plugin/_refs/documentation/gate.md
            - plugin/_refs/harness/capability-contract.json
            - plugin/_refs/harness/communication-economy.md
            - plugin/_refs/harness/communication-economy.mjs
            - plugin/_refs/harness/runtime-attestation.md
            - plugin/_refs/harness/runtime-attestation.mjs
            - plugin/_refs/harness/runtime-policy.mjs
            - plugin/_refs/nextjs/execution-contract.mjs
            - plugin/_refs/orchestration/execution-contract.mjs
            - plugin/_refs/orchestration/parallel-protocol.mjs
            - plugin/_refs/orchestration/repair-contract.mjs
            - plugin/_refs/orchestration/tail/branch-ready.md
            - plugin/_refs/orchestration/tail/repair-loop.md
            - plugin/_refs/orchestration/tail/ship-context.md
            - plugin/_refs/orchestration/tail/verify-before-done.md
            - plugin/_refs/shared/finish-gate.md
            - plugin/_refs/shared/repository-observation.mjs
            - plugin/_refs/shared/review-contract.mjs
            - plugin/_refs/shared/ship-readiness-contract.mjs
            - plugin/_refs/shared/user-choice-prompt.md
            - plugin/sdcorejs-harness.json
            - plugin/skills/sdcorejs-ai-agent/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-architecture/SKILL.md
            - plugin/skills/sdcorejs-documentation/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-nestjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-plan/SKILL.md
            - plugin/skills/sdcorejs-repair-loop/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - plugin/skills/sdcorejs-ship/SKILL.md
            - plugin/skills/sdcorejs-spec/SKILL.md
            - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
            - plugin/skills/sdcorejs-test/SKILL.md
          allowed_paths:
            - .claude/_refs/angular/execution-contract.mjs
            - .claude/_refs/documentation/gate.md
            - .claude/_refs/harness/capability-contract.json
            - .claude/_refs/harness/communication-economy.md
            - .claude/_refs/harness/communication-economy.mjs
            - .claude/_refs/harness/runtime-attestation.md
            - .claude/_refs/harness/runtime-attestation.mjs
            - .claude/_refs/harness/runtime-policy.mjs
            - .claude/_refs/nextjs/execution-contract.mjs
            - .claude/_refs/orchestration/execution-contract.mjs
            - .claude/_refs/orchestration/parallel-protocol.mjs
            - .claude/_refs/orchestration/repair-contract.mjs
            - .claude/_refs/orchestration/tail/branch-ready.md
            - .claude/_refs/orchestration/tail/repair-loop.md
            - .claude/_refs/orchestration/tail/ship-context.md
            - .claude/_refs/orchestration/tail/verify-before-done.md
            - .claude/_refs/shared/finish-gate.md
            - .claude/_refs/shared/repository-observation.mjs
            - .claude/_refs/shared/review-contract.mjs
            - .claude/_refs/shared/ship-readiness-contract.mjs
            - .claude/_refs/shared/user-choice-prompt.md
            - .claude/sdcorejs-harness.json
            - .claude/skills/sdcorejs-ai-agent/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-architecture/SKILL.md
            - .claude/skills/sdcorejs-documentation/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - .claude/skills/sdcorejs-nestjs/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-plan/SKILL.md
            - .claude/skills/sdcorejs-repair-loop/SKILL.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - .claude/skills/sdcorejs-ship/SKILL.md
            - .claude/skills/sdcorejs-spec/SKILL.md
            - .claude/skills/sdcorejs-subagent-driven-development/SKILL.md
            - .claude/skills/sdcorejs-test/SKILL.md
            - .cursor/rules/sdcorejs-agent.mdc
            - .cursor/sdcorejs-harness.json
            - .github/sdcorejs-harness.json
            - codex/sdcorejs-harness.json
            - codex/skills/_refs/angular/execution-contract.mjs
            - codex/skills/_refs/documentation/gate.md
            - codex/skills/_refs/harness/capability-contract.json
            - codex/skills/_refs/harness/communication-economy.md
            - codex/skills/_refs/harness/communication-economy.mjs
            - codex/skills/_refs/harness/runtime-attestation.md
            - codex/skills/_refs/harness/runtime-attestation.mjs
            - codex/skills/_refs/harness/runtime-policy.mjs
            - codex/skills/_refs/nextjs/execution-contract.mjs
            - codex/skills/_refs/orchestration/execution-contract.mjs
            - codex/skills/_refs/orchestration/parallel-protocol.mjs
            - codex/skills/_refs/orchestration/repair-contract.mjs
            - codex/skills/_refs/orchestration/tail/branch-ready.md
            - codex/skills/_refs/orchestration/tail/repair-loop.md
            - codex/skills/_refs/orchestration/tail/ship-context.md
            - codex/skills/_refs/orchestration/tail/verify-before-done.md
            - codex/skills/_refs/shared/finish-gate.md
            - codex/skills/_refs/shared/repository-observation.mjs
            - codex/skills/_refs/shared/review-contract.mjs
            - codex/skills/_refs/shared/ship-readiness-contract.mjs
            - codex/skills/_refs/shared/user-choice-prompt.md
            - codex/skills/sdcorejs-ai-agent/SKILL.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-architecture/SKILL.md
            - codex/skills/sdcorejs-documentation/SKILL.md
            - codex/skills/sdcorejs-execute-plan/SKILL.md
            - codex/skills/sdcorejs-nestjs/SKILL.md
            - codex/skills/sdcorejs-nextjs/SKILL.md
            - codex/skills/sdcorejs-plan/SKILL.md
            - codex/skills/sdcorejs-repair-loop/SKILL.md
            - codex/skills/sdcorejs-review/SKILL.md
            - codex/skills/sdcorejs-ship/SKILL.md
            - codex/skills/sdcorejs-spec/SKILL.md
            - codex/skills/sdcorejs-subagent-driven-development/SKILL.md
            - codex/skills/sdcorejs-test/SKILL.md
            - plugin/_refs/angular/execution-contract.mjs
            - plugin/_refs/documentation/gate.md
            - plugin/_refs/harness/capability-contract.json
            - plugin/_refs/harness/communication-economy.md
            - plugin/_refs/harness/communication-economy.mjs
            - plugin/_refs/harness/runtime-attestation.md
            - plugin/_refs/harness/runtime-attestation.mjs
            - plugin/_refs/harness/runtime-policy.mjs
            - plugin/_refs/nextjs/execution-contract.mjs
            - plugin/_refs/orchestration/execution-contract.mjs
            - plugin/_refs/orchestration/parallel-protocol.mjs
            - plugin/_refs/orchestration/repair-contract.mjs
            - plugin/_refs/orchestration/tail/branch-ready.md
            - plugin/_refs/orchestration/tail/repair-loop.md
            - plugin/_refs/orchestration/tail/ship-context.md
            - plugin/_refs/orchestration/tail/verify-before-done.md
            - plugin/_refs/shared/finish-gate.md
            - plugin/_refs/shared/repository-observation.mjs
            - plugin/_refs/shared/review-contract.mjs
            - plugin/_refs/shared/ship-readiness-contract.mjs
            - plugin/_refs/shared/user-choice-prompt.md
            - plugin/sdcorejs-harness.json
            - plugin/skills/sdcorejs-ai-agent/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-architecture/SKILL.md
            - plugin/skills/sdcorejs-documentation/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-nestjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-plan/SKILL.md
            - plugin/skills/sdcorejs-repair-loop/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - plugin/skills/sdcorejs-ship/SKILL.md
            - plugin/skills/sdcorejs-spec/SKILL.md
            - plugin/skills/sdcorejs-subagent-driven-development/SKILL.md
            - plugin/skills/sdcorejs-test/SKILL.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-005-EDIT
        - id: TASK-007-CREATE
          action: CREATE
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
          allowed_paths:
            - .sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-006-CREATE
            - TASK-006-EDIT
        - id: TASK-007-EDIT
          action: EDIT
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          git_roots:
            - github.com/sdcorejs/sdcorejs-agent
          semantic_scope: repository
          paths:
            - VALIDATION.md
          allowed_paths:
            - VALIDATION.md
          prohibited_paths:
            - package.json
            - package-lock.json
            - node_modules/**
            - site/**
            - .git/**
            - .env
            - .env.*
            - _refs/shared/system-registry.json
            - _refs/shared/approved-artifact.mjs
            - _refs/shared/architecture-contract.mjs
            - _refs/shared/decision-coverage.mjs
            - _refs/shared/validation-map.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/ui-review-contract.mjs
            - _refs/simplify/**
            - skills/shared/workflow/simplify.md
            - .sdcorejs/specs/**
            - .sdcorejs/architecture/**
            - .sdcorejs/plans/**
            - .sdcorejs/conventions/**
            - .sdcorejs/memories/**
            - authoring/evals/records/**
            - authoring/evals/visual-offer/**
            - authoring/evals/uiux/README.md
            - authoring/evals/uiux/design-handoff-integration.json
            - authoring/evals/uiux/green-sources.json
            - authoring/evals/uiux/green.txt
            - authoring/evals/uiux/post-review-green.txt
            - authoring/evals/uiux/post-review-red.txt
            - authoring/evals/uiux/records.json
            - authoring/evals/uiux/red.txt
            - authoring/evals/uiux/refactor.txt
            - authoring/evals/uiux/review-red.txt
            - authoring/evals/uiux/skill-creator-green.txt
            - authoring/evals/uiux/skill-creator-isolation-red.txt
            - authoring/evals/uiux/skill-creator-red.txt
            - authoring/evals/uiux/ui-review-integration.json
            - authoring/evals/uiux/version-red.txt
          depends_on:
            - TASK-006-CREATE
            - TASK-006-EDIT
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    proposed_policy:
      test_strategy: Approved regression-first TDD, required AC checks cannot be skipped.
      documentation: Only scoped canonical contract docs, generated mirrors, VALIDATION current-change evidence
        section and this change delivery. No new user guide, technical guide, preferences or shared memory.
      simplify: "skip: changed source is protected skill/contract/test/governance content; no eligible simplify scope."
      review: read-only code/contract review of this approved diff; no ALL expansion or automatic repair.
      repair: No blanket authority from the review choice. Findings that require additional scope return to existing
        repair/plan gate.
      git: No commit, push, PR, deployment or dependency installation.
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 2
    supersedes: .sdcorejs/plans/workflow/2026-09-24-11-29-interaction-finish-contract.md
    change_reason: "Explicitly approved one-file evidence continuation: verify immutable history at its base
      revision and current interaction/finish content separately."
```

## Approved coverage envelope

```json
{
  "metadata": {
    "allowed_paths": [
      "test/e2e/harness-behavioral-sentinel.test.mjs",
      "test/e2e/support/harness-behavior-runner.mjs",
      "test/e2e/fixtures/harness-behavior-scenarios.json",
      "test/e2e/communication-economy.test.mjs",
      "test/e2e/skill-pack-runner.test.mjs",
      "test/e2e/parallel-dispatch-protocol.test.mjs",
      "test/e2e/production-readiness-contract.test.mjs",
      "test/e2e/angular-production-contract.test.mjs",
      "test/e2e/nextjs-production-contract.test.mjs",
      "test/e2e/review-contract.test.mjs",
      "test/e2e/repair-contract.test.mjs",
      "test/e2e/ship-readiness-contract.test.mjs",
      "test/e2e/test-track-contract.test.mjs",
      "test/e2e/simplify-skill-contract.test.mjs",
      "test/e2e/visual-offer-policy.test.mjs",
      "test/e2e/fixtures/visual-offer-scenarios.json",
      "test/e2e/support/interaction-finish-fixture.mjs",
      "authoring/evals/interaction-finish-contract.json",
      "_refs/harness/runtime-policy.mjs",
      "_refs/harness/runtime-attestation.mjs",
      "_refs/harness/runtime-attestation.md",
      "_refs/harness/capability-contract.json",
      "_refs/shared/user-choice-prompt.md",
      "_refs/shared/finish-gate.mjs",
      "_refs/shared/finish-gate.md",
      "_refs/shared/repository-observation.mjs",
      "_refs/orchestration/execution-contract.mjs",
      "_refs/angular/execution-contract.mjs",
      "_refs/nextjs/execution-contract.mjs",
      "_refs/orchestration/parallel-protocol.mjs",
      "_refs/shared/review-contract.mjs",
      "_refs/orchestration/repair-contract.mjs",
      "_refs/shared/ship-readiness-contract.mjs",
      "_refs/harness/communication-economy.mjs",
      "_refs/harness/communication-economy.md",
      "skills/shared/sdlc/02-spec.md",
      "skills/shared/sdlc/architecture.md",
      "skills/shared/sdlc/03-plan.md",
      "skills/shared/sdlc/04-execute-plan.md",
      "skills/tracks/angular/sdcorejs-angular.md",
      "skills/tracks/nestjs/sdcorejs-nestjs.md",
      "skills/tracks/nextjs/sdcorejs-nextjs.md",
      "skills/tracks/ai-agent/sdcorejs-ai-agent.md",
      "skills/orchestration/subagent-driven-development.md",
      "skills/shared/workflow/review.md",
      "skills/orchestration/repair-loop.md",
      "skills/orchestration/documentation.md",
      "skills/shared/workflow/ship.md",
      "skills/tracks/test/sdcorejs-test.md",
      "_refs/orchestration/tail/repair-loop.md",
      "_refs/documentation/gate.md",
      "_refs/orchestration/tail/ship-context.md",
      "_refs/orchestration/tail/verify-before-done.md",
      "_refs/orchestration/tail/branch-ready.md",
      "AGENTS.md",
      "CLAUDE.md",
      ".clinerules",
      ".github/copilot-instructions.md",
      ".github/chatmodes/sdcorejs.chatmode.md",
      ".claude/_refs/angular/execution-contract.mjs",
      ".claude/_refs/documentation/gate.md",
      ".claude/_refs/harness/capability-contract.json",
      ".claude/_refs/harness/communication-economy.md",
      ".claude/_refs/harness/communication-economy.mjs",
      ".claude/_refs/harness/runtime-attestation.md",
      ".claude/_refs/harness/runtime-attestation.mjs",
      ".claude/_refs/harness/runtime-policy.mjs",
      ".claude/_refs/nextjs/execution-contract.mjs",
      ".claude/_refs/orchestration/execution-contract.mjs",
      ".claude/_refs/orchestration/parallel-protocol.mjs",
      ".claude/_refs/orchestration/repair-contract.mjs",
      ".claude/_refs/orchestration/tail/branch-ready.md",
      ".claude/_refs/orchestration/tail/repair-loop.md",
      ".claude/_refs/orchestration/tail/ship-context.md",
      ".claude/_refs/orchestration/tail/verify-before-done.md",
      ".claude/_refs/shared/finish-gate.md",
      ".claude/_refs/shared/finish-gate.mjs",
      ".claude/_refs/shared/repository-observation.mjs",
      ".claude/_refs/shared/review-contract.mjs",
      ".claude/_refs/shared/ship-readiness-contract.mjs",
      ".claude/_refs/shared/user-choice-prompt.md",
      ".claude/sdcorejs-harness.json",
      ".claude/skills/sdcorejs-ai-agent/SKILL.md",
      ".claude/skills/sdcorejs-angular/SKILL.md",
      ".claude/skills/sdcorejs-architecture/SKILL.md",
      ".claude/skills/sdcorejs-documentation/SKILL.md",
      ".claude/skills/sdcorejs-execute-plan/SKILL.md",
      ".claude/skills/sdcorejs-nestjs/SKILL.md",
      ".claude/skills/sdcorejs-nextjs/SKILL.md",
      ".claude/skills/sdcorejs-plan/SKILL.md",
      ".claude/skills/sdcorejs-repair-loop/SKILL.md",
      ".claude/skills/sdcorejs-review/SKILL.md",
      ".claude/skills/sdcorejs-ship/SKILL.md",
      ".claude/skills/sdcorejs-spec/SKILL.md",
      ".claude/skills/sdcorejs-subagent-driven-development/SKILL.md",
      ".claude/skills/sdcorejs-test/SKILL.md",
      ".cursor/rules/sdcorejs-agent.mdc",
      ".cursor/sdcorejs-harness.json",
      ".github/sdcorejs-harness.json",
      "codex/sdcorejs-harness.json",
      "codex/skills/_refs/angular/execution-contract.mjs",
      "codex/skills/_refs/documentation/gate.md",
      "codex/skills/_refs/harness/capability-contract.json",
      "codex/skills/_refs/harness/communication-economy.md",
      "codex/skills/_refs/harness/communication-economy.mjs",
      "codex/skills/_refs/harness/runtime-attestation.md",
      "codex/skills/_refs/harness/runtime-attestation.mjs",
      "codex/skills/_refs/harness/runtime-policy.mjs",
      "codex/skills/_refs/nextjs/execution-contract.mjs",
      "codex/skills/_refs/orchestration/execution-contract.mjs",
      "codex/skills/_refs/orchestration/parallel-protocol.mjs",
      "codex/skills/_refs/orchestration/repair-contract.mjs",
      "codex/skills/_refs/orchestration/tail/branch-ready.md",
      "codex/skills/_refs/orchestration/tail/repair-loop.md",
      "codex/skills/_refs/orchestration/tail/ship-context.md",
      "codex/skills/_refs/orchestration/tail/verify-before-done.md",
      "codex/skills/_refs/shared/finish-gate.md",
      "codex/skills/_refs/shared/finish-gate.mjs",
      "codex/skills/_refs/shared/repository-observation.mjs",
      "codex/skills/_refs/shared/review-contract.mjs",
      "codex/skills/_refs/shared/ship-readiness-contract.mjs",
      "codex/skills/_refs/shared/user-choice-prompt.md",
      "codex/skills/sdcorejs-ai-agent/SKILL.md",
      "codex/skills/sdcorejs-angular/SKILL.md",
      "codex/skills/sdcorejs-architecture/SKILL.md",
      "codex/skills/sdcorejs-documentation/SKILL.md",
      "codex/skills/sdcorejs-execute-plan/SKILL.md",
      "codex/skills/sdcorejs-nestjs/SKILL.md",
      "codex/skills/sdcorejs-nextjs/SKILL.md",
      "codex/skills/sdcorejs-plan/SKILL.md",
      "codex/skills/sdcorejs-repair-loop/SKILL.md",
      "codex/skills/sdcorejs-review/SKILL.md",
      "codex/skills/sdcorejs-ship/SKILL.md",
      "codex/skills/sdcorejs-spec/SKILL.md",
      "codex/skills/sdcorejs-subagent-driven-development/SKILL.md",
      "codex/skills/sdcorejs-test/SKILL.md",
      "plugin/_refs/angular/execution-contract.mjs",
      "plugin/_refs/documentation/gate.md",
      "plugin/_refs/harness/capability-contract.json",
      "plugin/_refs/harness/communication-economy.md",
      "plugin/_refs/harness/communication-economy.mjs",
      "plugin/_refs/harness/runtime-attestation.md",
      "plugin/_refs/harness/runtime-attestation.mjs",
      "plugin/_refs/harness/runtime-policy.mjs",
      "plugin/_refs/nextjs/execution-contract.mjs",
      "plugin/_refs/orchestration/execution-contract.mjs",
      "plugin/_refs/orchestration/parallel-protocol.mjs",
      "plugin/_refs/orchestration/repair-contract.mjs",
      "plugin/_refs/orchestration/tail/branch-ready.md",
      "plugin/_refs/orchestration/tail/repair-loop.md",
      "plugin/_refs/orchestration/tail/ship-context.md",
      "plugin/_refs/orchestration/tail/verify-before-done.md",
      "plugin/_refs/shared/finish-gate.md",
      "plugin/_refs/shared/finish-gate.mjs",
      "plugin/_refs/shared/repository-observation.mjs",
      "plugin/_refs/shared/review-contract.mjs",
      "plugin/_refs/shared/ship-readiness-contract.mjs",
      "plugin/_refs/shared/user-choice-prompt.md",
      "plugin/sdcorejs-harness.json",
      "plugin/skills/sdcorejs-ai-agent/SKILL.md",
      "plugin/skills/sdcorejs-angular/SKILL.md",
      "plugin/skills/sdcorejs-architecture/SKILL.md",
      "plugin/skills/sdcorejs-documentation/SKILL.md",
      "plugin/skills/sdcorejs-execute-plan/SKILL.md",
      "plugin/skills/sdcorejs-nestjs/SKILL.md",
      "plugin/skills/sdcorejs-nextjs/SKILL.md",
      "plugin/skills/sdcorejs-plan/SKILL.md",
      "plugin/skills/sdcorejs-repair-loop/SKILL.md",
      "plugin/skills/sdcorejs-review/SKILL.md",
      "plugin/skills/sdcorejs-ship/SKILL.md",
      "plugin/skills/sdcorejs-spec/SKILL.md",
      "plugin/skills/sdcorejs-subagent-driven-development/SKILL.md",
      "plugin/skills/sdcorejs-test/SKILL.md",
      "VALIDATION.md",
      ".sdcorejs/docs/workflow/2026-09-24-11-35-interaction-finish-contract-delivery.md",
      "authoring/evals/uiux/evidence.test.mjs"
    ],
    "approval_source": "user-approved-decision-coverage",
    "approved_at": "2026-09-24T07:51:56.101Z",
    "approved_by": "user",
    "artifact_id": "decision-coverage-r1",
    "artifact_kind": "plan",
    "change_ref": "interaction-finish-contract-20260924",
    "contract_id": "decision-coverage:v1",
    "owner_module_id": null,
    "owner_repository_id": "github.com/sdcorejs/sdcorejs-agent",
    "owner_repository_role": "standalone",
    "parent_references": [],
    "parent_repository_id": null,
    "prohibited_paths": [
      "package.json",
      "package-lock.json",
      "node_modules/**",
      "site/**",
      ".git/**",
      ".env",
      ".env.*",
      "_refs/shared/system-registry.json",
      "_refs/shared/approved-artifact.mjs",
      "_refs/shared/architecture-contract.mjs",
      "_refs/shared/decision-coverage.mjs",
      "_refs/shared/validation-map.mjs",
      "_refs/shared/repository-contract.mjs",
      "_refs/shared/design-handoff.mjs",
      "_refs/shared/ui-review-contract.mjs",
      "_refs/simplify/**",
      "skills/shared/workflow/simplify.md",
      ".sdcorejs/specs/**",
      ".sdcorejs/architecture/**",
      ".sdcorejs/plans/**",
      ".sdcorejs/conventions/**",
      ".sdcorejs/memories/**",
      "authoring/evals/records/**",
      "authoring/evals/visual-offer/**",
      "authoring/evals/uiux/README.md",
      "authoring/evals/uiux/design-handoff-integration.json",
      "authoring/evals/uiux/green-sources.json",
      "authoring/evals/uiux/green.txt",
      "authoring/evals/uiux/post-review-green.txt",
      "authoring/evals/uiux/post-review-red.txt",
      "authoring/evals/uiux/records.json",
      "authoring/evals/uiux/red.txt",
      "authoring/evals/uiux/refactor.txt",
      "authoring/evals/uiux/review-red.txt",
      "authoring/evals/uiux/skill-creator-green.txt",
      "authoring/evals/uiux/skill-creator-isolation-red.txt",
      "authoring/evals/uiux/skill-creator-red.txt",
      "authoring/evals/uiux/ui-review-integration.json",
      "authoring/evals/uiux/version-red.txt"
    ],
    "repository_relative_path": ".sdcorejs/plans/workflow/2026-09-24-12-57-interaction-finish-contract-r2.md",
    "requirement_id": "decision-coverage",
    "schema_version": 1,
    "source_revision": "7e7f4288717a983a5f51ab43af24af4ce423a1d4",
    "stack_profile": "markdown-skill-pack",
    "supersedes": null,
    "track": "workflow",
    "approval_hash": "sha256:v1:f4be011b3ec01d4ef483dd28638a38edb48409e2c643d5d56c6b50ce554e22be"
  },
  "body": "{\"history\":[{\"active\":[{\"id\":\"R-001\",\"type\":\"requirement\"},{\"id\":\"R-002\",\"type\":\"requirement\"},{\"id\":\"R-003\",\"type\":\"requirement\"},{\"id\":\"R-004\",\"type\":\"requirement\"},{\"id\":\"R-005\",\"type\":\"requirement\"},{\"id\":\"R-006\",\"type\":\"requirement\"},{\"id\":\"R-007\",\"type\":\"requirement\"},{\"id\":\"R-008\",\"type\":\"requirement\"},{\"id\":\"AC-001\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-002\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-003\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-004\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-005\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-006\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-007\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-008\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-009\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-010\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-011\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-012\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-013\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-014\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-015\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-016\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-017\",\"type\":\"acceptance-criterion\"},{\"id\":\"AC-018\",\"type\":\"acceptance-criterion\"},{\"id\":\"D-001\",\"type\":\"decision\"},{\"id\":\"D-002\",\"type\":\"decision\"},{\"id\":\"D-003\",\"type\":\"decision\"},{\"id\":\"D-004\",\"type\":\"decision\"},{\"id\":\"D-005\",\"type\":\"decision\"},{\"id\":\"INV-001\",\"type\":\"invariant\"},{\"id\":\"INV-002\",\"type\":\"invariant\"},{\"id\":\"INV-003\",\"type\":\"invariant\"},{\"id\":\"INV-004\",\"type\":\"invariant\"}],\"revision\":1,\"tombstones\":[]}],\"records\":[{\"id\":\"R-001\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Native-first dựa trên tool exposure, runtime/mode constraints và evidence hiện tại; fallback giữ nguyên identity/options.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"requirement\"},{\"id\":\"R-002\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Giải quyết reply rõ nghĩa và reuse explicit decision đúng gate, artifact/change, revision/scope và option mapping; chỉ hỏi delta.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"requirement\"},{\"id\":\"R-003\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Một finish-tail canonical dùng thực sự ở mọi caller; parent/integration owner hoàn tất một lần cho change.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"requirement\"},{\"id\":\"R-004\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Skip, Analyze và Apply simplify giữ nguyên opt-in, eligibility, preflight, protected boundaries và pass cap.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"requirement\"},{\"id\":\"R-005\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Review-only, review-and-repair, defer và skip review không mở rộng authority hoặc bỏ required verification.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"requirement\"},{\"id\":\"R-006\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Test strategy được chốt trước implementation; RED-first đúng thứ tự; mọi write làm stale evidence liên quan.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"requirement\"},{\"id\":\"R-007\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Docs/test policy đã authorize được reuse đúng scope; preference không cấp quyền tạo docs mới.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"requirement\"},{\"id\":\"R-008\",\"owner_module_id\":null,\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"source\":\"explicit-user\",\"statement\":\"Compatibility, public skills, approved snapshots và safety assertions được giữ; chỉ canonical sources, mirrors bằng script.\",\"status\":\"active\",\"task_refs\":[\"TASK-001\",\"TASK-004\",\"TASK-005\",\"TASK-006\",\"TASK-007\"],\"type\":\"requirement\"},{\"behavior\":\"native-runtime\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-005\"],\"expected_result\":\"Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.\",\"id\":\"AC-001\",\"requirement_refs\":[\"R-001\"],\"statement\":\"Native exposed và permitted trong current mode dùng structured choice; missing/unknown/forbidden dùng numbered fallback. Static adapter supported không đủ; không đổi mode/flag để lấy tool.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"native-failure\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-005\"],\"expected_result\":\"Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.\",\"id\":\"AC-002\",\"requirement_refs\":[\"R-001\"],\"statement\":\"Native failure chỉ fallback một lần với cùng decision identity và mapping; không retry picker đã lỗi.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"reply-normalization\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-005\"],\"expected_result\":\"Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa số ngoài lựa chọn không thành approval.\",\"id\":\"AC-003\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Số đơn, exact label và localized equivalent rõ nghĩa được nhận; phủ định, câu hỏi và văn bản chứa số ngoài lựa chọn không thành approval.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"ambiguous-gates\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-005\"],\"expected_result\":\"Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự hoặc gate gần nhất.\",\"id\":\"AC-004\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Một số 1 không gắn được duy nhất với một pending gate phải unresolved; không suy đoán từ thứ tự hoặc gate gần nhất.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"reuse-choice\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua context/handoff mà không hỏi lại.\",\"id\":\"AC-005\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Explicit user choice hoặc verified approved-plan policy đúng identity/scope/mapping được reuse qua context/handoff mà không hỏi lại.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"stale-choice\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ không áp dụng; chỉ unresolved delta được hỏi.\",\"id\":\"AC-006\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Đổi gate, owner, artifact/change, revision, scope fingerprint hoặc option mapping làm choice cũ không áp dụng; chỉ unresolved delta được hỏi.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"separate-approval\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Spec approval không approve plan; single option, default, silence, thanks, delegated preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa / 3 Hủy.\",\"id\":\"AC-007\",\"requirement_refs\":[\"R-002\"],\"statement\":\"Spec approval không approve plan; single option, default, silence, thanks, delegated preference hoặc visual feedback không auto-approve. Fallback approval hiện đủ 1 Duyệt / 2 Yêu cầu chỉnh sửa / 3 Hủy.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"canonical-callers\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"expected_result\":\"Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.\",\"id\":\"AC-008\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Angular, NestJS, Next.js, AI-agent, generic, delegated, review, repair, documentation và ship sử dụng cùng finish contract; stack chỉ thêm hooks; helper không bị bỏ không.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"integration-owner\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.\",\"id\":\"AC-009\",\"requirement_refs\":[\"R-003\"],\"statement\":\"Workers vẫn unit verification/review và trả evidence; không hỏi finish hoặc chạy shared docs tail. Parent/integration owner chạy final tail một lần theo change/scope, không bỏ qua invalidation.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"resolved-small-fix\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại; missing-doc creation vẫn cần authority cho đúng file/scope.\",\"id\":\"AC-010\",\"requirement_refs\":[\"R-007\"],\"statement\":\"Small fix có đủ explicit test/docs/simplify/review policy không phải trả lời bốn câu lại; missing-doc creation vẫn cần authority cho đúng file/scope.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"simplify-semantics\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.\",\"id\":\"AC-011\",\"requirement_refs\":[\"R-004\"],\"statement\":\"Skip không dispatch; scope chắc chắn không eligible/no-op báo lý do không hỏi; Analyze không source write; Apply cần explicit opt-in và hardened preflight, không có oracle mặc định Analyze-only.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"review-only\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.\",\"id\":\"AC-012\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Review-only không dispatch repair, không UI auto-fix và không persistence ngoài authority.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"bounded-repair\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"expected_result\":\"Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi finding, không tự simplify sau repair.\",\"id\":\"AC-013\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Review-and-repair giữ finding validity, repair tier, owner/scope và pass cap; không authorize mọi finding, không tự simplify sau repair.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"defer\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"expected_result\":\"Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.\",\"id\":\"AC-014\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Defer dừng tail tương ứng và không claim done/ready; resumption cần scope/evidence còn current.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"skip-review\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"expected_result\":\"Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.\",\"id\":\"AC-015\",\"requirement_refs\":[\"R-005\"],\"statement\":\"Skip review vẫn giữ required tests/AC/acceptance; nhãn thể hiện bỏ review rồi kiểm chứng, không hàm ý Git/deploy. Required review/evidence không bị skip tùy ý.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"tdd-order\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"expected_result\":\"TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi RED-first; finish choice không xóa required tests/AC.\",\"id\":\"AC-016\",\"requirement_refs\":[\"R-006\"],\"statement\":\"TDD RED xảy ra trước production implementation tương ứng; post-code test authoring không được gọi RED-first; finish choice không xóa required tests/AC.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-005\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"evidence-order\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"expected_result\":\"Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại gate trước handoff.\",\"id\":\"AC-017\",\"requirement_refs\":[\"R-006\"],\"statement\":\"Baseline/test → optional simplify → affected re-verification → selected review/repair → authorized writes → affected revalidation → final verify/branch-ready. Write sau branch-ready buộc chạy lại gate trước handoff.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"behavior\":\"compatibility\",\"blocking\":true,\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-006\",\"EVIDENCE-007\"],\"expected_result\":\"Documented payload → helper → real caller regression và mutation cases giữ safety assertions; schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable history không migrate, mirrors và hygiene checks đạt.\",\"id\":\"AC-018\",\"requirement_refs\":[\"R-008\"],\"statement\":\"Documented payload → helper → real caller regression và mutation cases giữ safety assertions; schema/portable compatibility fail closed khi thiếu authority; public inventory vẫn 23, immutable history không migrate, mirrors và hygiene checks đạt.\",\"task_refs\":[\"TASK-001\",\"TASK-004\",\"TASK-005\",\"TASK-006\",\"TASK-007\"],\"type\":\"acceptance-criterion\",\"verification_kind\":\"automated\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-001\",\"AC-001\",\"AC-002\"],\"id\":\"D-001\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Dùng surface nào?\",\"rationale\":\"Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của spec này.\",\"scope\":\"repository\",\"selected_value\":\"Observed native-first, stable numbered fallback\",\"source\":\"explicit-user\",\"statement\":\"Observed native-first, stable numbered fallback\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-005\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-002\",\"AC-005\",\"AC-006\",\"AC-007\"],\"id\":\"D-002\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Reuse quyết định ở đâu?\",\"rationale\":\"Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của spec này.\",\"scope\":\"repository\",\"selected_value\":\"Extend existing context/handoff; exact scoped authority, no new state store\",\"source\":\"explicit-user\",\"statement\":\"Extend existing context/handoff; exact scoped authority, no new state store\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-003\",\"AC-008\",\"AC-009\"],\"id\":\"D-003\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Ai điều phối finish-tail?\",\"rationale\":\"Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của spec này.\",\"scope\":\"repository\",\"selected_value\":\"One canonical owner contract, parent/integration final tail, stack hooks only\",\"source\":\"explicit-user\",\"statement\":\"One canonical owner contract, parent/integration final tail, stack hooks only\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"decision\"},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-004\",\"R-005\",\"R-006\",\"R-007\",\"R-001\",\"R-002\",\"R-003\",\"R-008\",\"AC-001\",\"AC-002\",\"AC-003\",\"AC-004\",\"AC-005\",\"AC-006\",\"AC-007\",\"AC-008\",\"AC-009\",\"AC-010\",\"AC-011\",\"AC-012\",\"AC-013\",\"AC-014\",\"AC-015\",\"AC-016\",\"AC-017\",\"INV-001\",\"INV-002\",\"INV-003\"],\"id\":\"D-004\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Lựa chọn có mở rộng quyền không?\",\"rationale\":\"Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của spec này.\",\"scope\":\"repository\",\"selected_value\":\"Keep simplify/repair/docs authority and required verification; no automatic Git\",\"source\":\"explicit-user\",\"statement\":\"Keep simplify/repair/docs authority and required verification; no automatic Git\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"decision\",\"validation_boundary\":{\"kind\":\"authorization\",\"source_refs\":[\"R-001\",\"R-002\",\"R-003\",\"R-004\",\"R-005\",\"R-006\",\"R-007\",\"R-008\",\"AC-001\",\"AC-002\",\"AC-003\",\"AC-004\",\"AC-005\",\"AC-006\",\"AC-007\",\"AC-008\",\"AC-009\",\"AC-010\",\"AC-011\",\"AC-012\",\"AC-013\",\"AC-014\",\"AC-015\",\"AC-016\",\"AC-017\",\"INV-001\",\"INV-002\",\"INV-003\"]}},{\"blocking\":true,\"convention_impact\":{\"candidate\":false,\"category\":null},\"downstream_refs\":[\"R-008\",\"AC-018\",\"INV-004\"],\"id\":\"D-005\",\"owner_repository_id\":\"github.com/sdcorejs/sdcorejs-agent\",\"question\":\"Giới hạn compatibility và delivery?\",\"rationale\":\"Ràng buộc được user nêu rõ trong yêu cầu bước interaction/finish-tail; không thay thế approval của spec này.\",\"scope\":\"repository\",\"selected_value\":\"Keep 23 public skills, no dependencies, no historical approval migration, no commit/push\",\"source\":\"explicit-user\",\"statement\":\"Keep 23 public skills, no dependencies, no historical approval migration, no commit/push\",\"status\":\"approved\",\"supersedes\":null,\"task_refs\":[\"TASK-001\",\"TASK-004\",\"TASK-005\",\"TASK-006\",\"TASK-007\"],\"type\":\"decision\",\"validation_boundary\":{\"kind\":\"none\",\"source_refs\":[\"R-008\",\"AC-018\",\"INV-004\"]}},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-002\",\"EVIDENCE-004\",\"EVIDENCE-005\"],\"id\":\"INV-001\",\"protected_refs\":[\"R-001\",\"R-002\",\"AC-007\"],\"statement\":\"Approval luôn explicit và riêng theo gate/revision; capability không phải authority.\",\"task_refs\":[\"TASK-001\",\"TASK-002\",\"TASK-004\",\"TASK-005\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"id\":\"INV-002\",\"protected_refs\":[\"R-004\",\"R-005\",\"R-007\"],\"statement\":\"Write giữ owner/scope/protected boundaries, review-only không sửa và defer không done.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-003\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-007\"],\"id\":\"INV-003\",\"protected_refs\":[\"R-006\",\"AC-015\",\"AC-016\",\"AC-017\"],\"statement\":\"Required verification và stale evidence không bị preference hoặc finish choice xóa.\",\"task_refs\":[\"TASK-001\",\"TASK-003\",\"TASK-004\",\"TASK-005\",\"TASK-007\"],\"type\":\"invariant\"},{\"evidence_refs\":[\"EVIDENCE-001\",\"EVIDENCE-004\",\"EVIDENCE-005\",\"EVIDENCE-006\",\"EVIDENCE-007\"],\"id\":\"INV-004\",\"protected_refs\":[\"R-008\",\"AC-018\"],\"statement\":\"Không public skill mới, dependency mới, commit/push hoặc sửa immutable approved history.\",\"task_refs\":[\"TASK-001\",\"TASK-004\",\"TASK-005\",\"TASK-006\",\"TASK-007\"],\"type\":\"invariant\"}],\"revision\":1,\"schema_version\":1}\n"
}
```
