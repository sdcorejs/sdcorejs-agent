---
allowed_paths:
  - _refs/shared/design-handoff.md
  - test/e2e/design-handoff-contract.test.mjs
  - test/e2e/artifact-path-convention.test.mjs
  - test/e2e/project-context-artifact-lifecycle.test.mjs
  - test/e2e/angular-production-contract.test.mjs
  - test/e2e/nextjs-production-contract.test.mjs
  - test/e2e/production-readiness-contract.test.mjs
  - test/e2e/support/design-handoff-fixture.mjs
  - _refs/shared/design-handoff.mjs
  - _refs/shared/artifact-paths.mjs
  - _refs/shared/repository-contract.mjs
  - _refs/shared/design-verification.mjs
  - _refs/angular/execution-contract.mjs
  - _refs/nextjs/execution-contract.mjs
  - _refs/orchestration/execution-contract.mjs
  - skills/tracks/design/sdcorejs-design.md
  - skills/tracks/angular/sdcorejs-angular.md
  - skills/tracks/nextjs/sdcorejs-nextjs.md
  - skills/shared/sdlc/04-execute-plan.md
  - _refs/shared/frontend-architecture.md
  - .claude/_refs/shared/design-handoff.md
  - plugin/_refs/shared/design-handoff.md
  - codex/skills/_refs/shared/design-handoff.md
  - .claude/_refs/shared/design-handoff.mjs
  - plugin/_refs/shared/design-handoff.mjs
  - codex/skills/_refs/shared/design-handoff.mjs
  - .claude/_refs/shared/artifact-paths.mjs
  - plugin/_refs/shared/artifact-paths.mjs
  - codex/skills/_refs/shared/artifact-paths.mjs
  - .claude/_refs/shared/repository-contract.mjs
  - plugin/_refs/shared/repository-contract.mjs
  - codex/skills/_refs/shared/repository-contract.mjs
  - .claude/_refs/shared/design-verification.mjs
  - plugin/_refs/shared/design-verification.mjs
  - codex/skills/_refs/shared/design-verification.mjs
  - .claude/_refs/angular/execution-contract.mjs
  - plugin/_refs/angular/execution-contract.mjs
  - codex/skills/_refs/angular/execution-contract.mjs
  - .claude/_refs/nextjs/execution-contract.mjs
  - plugin/_refs/nextjs/execution-contract.mjs
  - codex/skills/_refs/nextjs/execution-contract.mjs
  - .claude/_refs/orchestration/execution-contract.mjs
  - plugin/_refs/orchestration/execution-contract.mjs
  - codex/skills/_refs/orchestration/execution-contract.mjs
  - .claude/_refs/shared/frontend-architecture.md
  - plugin/_refs/shared/frontend-architecture.md
  - codex/skills/_refs/shared/frontend-architecture.md
  - .claude/skills/sdcorejs-design/SKILL.md
  - plugin/skills/sdcorejs-design/SKILL.md
  - codex/skills/sdcorejs-design/SKILL.md
  - .claude/skills/sdcorejs-angular/SKILL.md
  - plugin/skills/sdcorejs-angular/SKILL.md
  - codex/skills/sdcorejs-angular/SKILL.md
  - .claude/skills/sdcorejs-nextjs/SKILL.md
  - plugin/skills/sdcorejs-nextjs/SKILL.md
  - codex/skills/sdcorejs-nextjs/SKILL.md
  - .claude/skills/sdcorejs-execute-plan/SKILL.md
  - plugin/skills/sdcorejs-execute-plan/SKILL.md
  - codex/skills/sdcorejs-execute-plan/SKILL.md
  - VALIDATION.md
  - .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
  - authoring/evals/skill-authoring-contract.mjs
  - test/e2e/skill-authoring-contract.test.mjs
  - authoring/evals/uiux/evidence.test.mjs
  - authoring/evals/uiux/design-handoff-integration.json
  - authoring/evals/uiux/README.md
approval_source: explicit-user-choice
approved_architecture_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
approved_at: 2026-09-23T05:30:09.004Z
approved_by: current-user
approved_spec_hash: sha256:v1:34f012a1e161434df6a81fdb251831579b14cf1648b17d838d41d2779d3b6844
artifact_id: plan-design-handoff-contract-20260923-r2
artifact_kind: plan
change_control:
  change_reason: Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.
  revision: 2
  supersedes: plan-design-handoff-contract-20260923-r1
change_ref: design-handoff-contract-20260923
commit_policy: with-change
contract_id: design-handoff-contract-20260923
description: User-approved bounded repairs for Design authoring and UI/UX verification blockers.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
execution_policy: sequential
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
name: design-handoff-contract
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
    artifact_id: architecture-design-handoff-contract-20260923-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
parent_repository_id: null
phase_count: 4
prohibited_paths:
  - AGENTS.md
  - CLAUDE.md
  - package.json
  - package-lock.json
  - site/**
  - node_modules/**
  - .git/**
  - .env
  - .env.*
  - _refs/shared/system-registry.json
  - _refs/shared/approved-artifact.mjs
  - _refs/shared/decision-coverage.mjs
  - _refs/shared/architecture-contract.mjs
  - _refs/shared/validation-map.mjs
  - _refs/simplify/**
  - skills/shared/workflow/simplify.md
  - .sdcorejs/specs/**
  - .sdcorejs/architecture/**
  - .sdcorejs/plans/**
  - .sdcorejs/conventions/**
  - .sdcorejs/summary.md
repository_relative_path: .sdcorejs/plans/workflow/2026-09-23-12-30-design-handoff-contract-r2.md
requirement_id: design-handoff-hardening-user-request
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-plan.md
source_architecture: .sdcorejs/architecture/workflow/2026-09-23-10-37-design-handoff-contract.md
source_plan: .sdcorejs/plans/workflow/2026-09-23-12-30-design-handoff-contract-r2.md
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
source_spec: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
stack_profile: node-general
supersedes: plan-design-handoff-contract-20260923-r1
target_root_kind: sdcorejs-agent-authoring-repo
task_count: 6
track: workflow
approval_hash: sha256:v1:d34fae6b35278ac11ba6d0d7a6bd7e205a8c91288cfade382dcd0abb838314e8
---
# Approved Plan Amendment - Design verification repairs

Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.

This revision retains the original six sequential tasks. TASK-005 additionally repairs canonical repository identity and adds current UI/UX integration evidence. The original plan remains unchanged. Only the five additional paths below are authorized; other authoring paths remain outside the allowlist. The earlier historical UI/UX records and transcripts must remain byte-for-byte unchanged.

- `authoring/evals/skill-authoring-contract.mjs`
- `test/e2e/skill-authoring-contract.test.mjs`
- `authoring/evals/uiux/evidence.test.mjs`
- `authoring/evals/uiux/design-handoff-integration.json`
- `authoring/evals/uiux/README.md`

R1: Add HTTPS/SSH equivalence and foreign-owner negative controls before reusing stableRepositoryId. R2: Reverify the current 25-case UI/UX behavior suite, pin the historical record to its real Git revision, and add a distinct content-bound integration receipt. Missing/stale sources, missing receipt, omitted manifest entries, invalid command/result and altered transcripts must fail. Run both package scripts, deterministic authoring, the Design regression command and mirror/hygiene/reference checks. No test assertion weakening or fabricated live/rendered evidence. Repair pass cap: 3; no automatic simplify after repair.

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: design-handoff-contract-20260923
  requirement_id: design-handoff-hardening-user-request
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - cross-module-boundary
      - cross-repository-boundary
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: The handoff crosses repository and module ownership and establishes approval/evidence trust boundaries used by multiple execution consumers.
    blockers: []
    blocker_messages: []
  architecture_context:
    schema_version: 1
    source: sdcorejs-architecture
    contract_id: design-handoff-contract-20260923
    requirement_id: R-001
    approved_spec_reference:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      artifact_id: spec-design-handoff-contract-20260923-r1
      artifact_kind: spec
      revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
      approval_hash: sha256:v1:34f012a1e161434df6a81fdb251831579b14cf1648b17d838d41d2779d3b6844
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-23-10-37-design-handoff-contract.md
    approved_architecture_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
    owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    owner_module_id: null
    execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    trigger:
      required: true
      signals:
        - cross-module-boundary
        - cross-repository-boundary
        - public-api-contract
        - security-trust-boundary
        - state-data-ownership
      rationale: The handoff crosses repository and module ownership and establishes approval/evidence trust boundaries used by multiple execution consumers.
    invariants:
      - id: INV-001
        statement: Preserve user-owned simplify content, immutable approved snapshots, module ownership, editable source primacy, the 23-skill public inventory and existing approval authority.
        scope: Design handoff ownership, approval, evidence and implementation consumption
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: The Design contract may harden consumer behavior without expanding source ownership or weakening prior simplify/approval controls.
        verification_method: Positive/negative owner and approval controls, document-derived consumer tests, actual source mutations, scope/mirror checks and immutable artifact hash verification.
        requirement_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
        decision_refs:
          - D-001
          - D-002
          - D-003
    boundaries:
      - id: B-OWNER
        statement: Repository role and ownership scope come from the registry; experience_kind is a separate UX classification. Module ownership never falls back to portal or host. Cross-module references keep one editable owner per module source.
        invariant_refs: &a1
          - INV-001
      - id: B-STRUCTURE
        statement: Structural validation accepts well-formed draft data but grants no implementation, approval, source-read or evidence authority. Version 1 compatibility remains explicitly unverified.
        invariant_refs: *a1
      - id: B-VERIFIED
        statement: A trusted host runtime loads actual approved parents and Design approval records from mapped repository sources, verifies canonical graph and current content, and computes distinct verification layers. Serialized success flags cannot replace this path.
        invariant_refs: *a1
      - id: B-CONSUMERS
        statement: Existing Angular, Next.js and generic execution entrypoints invoke the verified path when their governing contract requires Design. Verified parent context determines that requirement; omitting a payload field cannot disable it.
        invariant_refs: *a1
      - id: B-PATHS
        statement: Canonical metadata distinguishes Design ledger and asset roots/kinds. Every source, reference and closure path must satisfy canonical classification and physical owner-root containment before IO.
        invariant_refs: *a1
      - id: B-LIFECYCLE
        statement: Authorized exploration can author a draft without approved parents. Approved implementation consumption requires the governing approvals and applicable evidence. Material changes return to the existing approval owner; bounded spacing under unchanged authority gains no universal extra ceremony.
        invariant_refs: *a1
    dependency_directions:
      - from: Design structural and owner/path helpers
        to: system-registry, artifact-paths and repository-contract
        rationale: Keep registry and canonical path authority centralized; no parallel role enum or owner fallback.
        invariant_refs: *a1
      - from: Design verified entrypoint and trusted source adapter
        to: approved-artifact graph verifier and existing evidence/snapshot infrastructure
        rationale: Reuse hashing/receipt identity; source IO and expected authority are provided by the trusted host, not handoff fields.
        invariant_refs: *a1
      - from: Angular, Next.js and generic execution consumers
        to: Design verified entrypoint
        rationale: A helper with no actual caller does not enforce the implementation boundary.
        invariant_refs: *a1
    data_state_owners:
      - subject: Editable Design bundle, its decisions and ledger
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rule: This repository owns the reusable contract; each runtime bundle is owned by the repository resolved from its approved topology.
        invariant_refs: *a1
      - subject: Immutable spec/plan/Design approval records
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rule: Approval source owners retain authority; consumers read exact current references and never rewrite approved records for migration.
        invariant_refs: *a1
      - subject: Observed source fingerprints, read provenance and verification results
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rule: Trusted host observation is runtime state; portable payloads carry data and limitations without transferring observation authority.
        invariant_refs: *a1
    public_contracts:
      - id: API-DESIGN-HANDOFF-V2
        kind: api
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Schema 2 is canonical for new payloads. Keep the existing structural entrypoint and a named version 1 read-only compatibility adapter; unknown versions and legacy verified promotion fail closed.
        migration: Only a touched, explicitly owned feature bundle may be adapted and reverified. Missing authority/evidence remains a blocker; no bulk historical or immutable snapshot migration.
        statement: Provide a distinct verifyDesignHandoff entrypoint with trusted runtime input and explicit structural, parents, approval, and applicable evidence results. Existing execution entrypoints must invoke it rather than trust a caller-built result.
        invariant_refs: *a1
    security_trust_boundaries:
      - id: TRUST-AUTHORITY
        statement: Expected repository/change/parent identities and applicability come from the executor host and verified parent content, never solely from the handoff being checked. Hash shape or body digest alone is not approval.
        invariant_refs: *a1
      - id: TRUST-IO
        statement: Repository root identity, actual Git root and each path realpath remain contained. Reject unsafe absolute/traversal paths, nested Git ownership mismatch and unproven symlink containment before read/write.
        invariant_refs: *a1
      - id: TRUST-EVIDENCE
        statement: Observed content and evidence provenance must match at use. Same HEAD with different source bytes is stale; generated mockups never satisfy real-product screenshot requirements. No fabricated rendered or interaction receipt.
        invariant_refs: *a1
      - id: TRUST-COMPONENTS
        statement: Confirmed component/path claims require actual matching source evidence. Missing source evidence retains candidate/unknown status and cannot become confirmed via schema validity.
        invariant_refs: *a1
    cross_repository_integration:
      - owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        statement: The authoring repository owns the cross-repository runtime contract. The real committed contract dependencies below are not claims that external module repositories have been loaded; runtime cross-module sources require independent verified identities and provenance.
        child_references:
          - repository_id: github.com/sdcorejs/sdcorejs-agent
            repository_relative_path: _refs/shared/repository-contract.mjs
            revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
          - repository_id: github.com/sdcorejs/sdcorejs-agent
            repository_relative_path: _refs/shared/approved-artifact.mjs
            revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
        invariant_refs: *a1
    adopted_decision_refs:
      - D-001
      - D-002
      - D-003
    deferred_decision_refs: []
    assumption_refs:
      - A-001
    validation_obligations:
      - id: VAL-001
        expected_proof: Positive/negative real-owner fixtures for module, portal, standalone and library; missing/unwritable module owner fails with no fallback.
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs: *a1
        acceptance_criterion_refs:
          - AC-001
      - id: VAL-002
        expected_proof: Actual spec/plan/Design approval reads with graph/identity/change binding; missing, mutated, stale, unrelated and caller-forged authority fail while authorized drafts remain draft.
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs: *a1
        acceptance_criterion_refs:
          - AC-002
          - AC-003
          - AC-005
      - id: VAL-003
        expected_proof: Required versus not-applicable surfaces, designed versus rendered/interaction evidence, mockup versus real screenshot and candidate versus source-confirmed mappings have paired controls and same-HEAD mutation cases.
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs: *a1
        acceptance_criterion_refs:
          - AC-004
          - AC-006
      - id: VAL-004
        expected_proof: Canonical depth/extensions/root/containment and cross-module provenance are enforced, and closure retains every feature asset/decision/export/ledger without diagnostic traversal.
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs: *a1
        acceptance_criterion_refs:
          - AC-007
          - AC-008
          - AC-009
      - id: VAL-005
        expected_proof: Document-derived payloads pass through helper and real Angular/Next.js/generic callers; legacy/draft/forged results cannot bypass verified mode; mirrors, immutable snapshots, scope and existing simplify controls are preserved with actual command results.
        owner: github.com/sdcorejs/sdcorejs-agent
        invariant_refs: *a1
        acceptance_criterion_refs:
          - AC-010
          - AC-011
          - AC-012
    profile_sections:
      frontend_architecture_ref: null
      agent_architecture_ref: null
    change_control:
      revision: 1
      supersedes: null
  decision_coverage: &a7
    schema_version: 1
    revision: 3
    records:
      - id: R-001
        type: requirement
        statement: Decouple experience kind from semantic repository ownership using registry roles and scopes; support enterprise modules, portal shells/composition, cross-module experiences, standalone websites/apps and component/design-system libraries.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-001
      - id: R-002
        type: requirement
        statement: Separate structural validation, actual approved-parent verification, Design approval/review state and applicable rendered/interaction evidence. Verified consumers must fail closed without source or verification infrastructure.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-006
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-003
      - id: R-003
        type: requirement
        statement: Derive required responsive surfaces and evidence from verified approved requirements and the target; distinguish designed behavior from rendered and interacted observations, with reasoned not-applicable outcomes.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-004
      - id: R-004
        type: requirement
        statement: Allow authorized exploratory drafts without approved parents while preventing their use as approved implementation contracts; route new or material scope changes to the existing decision/approval owner.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-005
      - id: R-005
        type: requirement
        statement: Preserve existing design first, editable source primacy, generated-versus-product image provenance, source-backed confirmed component/path mappings, and Visual Companion feedback without approval authority.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-006
      - id: R-006
        type: requirement
        statement: Enforce canonical paths, extensions, containment and complete artifact closure; verify distinct module sources and current provenance for cross-module references without duplicate editable ownership.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-007
          - EVIDENCE-008
          - EVIDENCE-009
      - id: R-007
        type: requirement
        statement: Use one documented evolving schema, explicit read-only legacy compatibility and document-derived payloads exercised through real Angular, Next.js and generic consumers.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-010
          - EVIDENCE-011
      - id: R-008
        type: requirement
        statement: Keep the change limited to the Design handoff contract; preserve simplify results and immutable artifacts, sync mirrors through existing scripts, report actual checks, and stop after this step.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-012
      - id: AC-001
        type: acceptance-criterion
        statement: Registry-based ownership matrix
        behavior: Registry-based ownership matrix
        expected_result: Valid module, portal shell/composition, standalone and library cases resolve to their real owner; missing/unwritable module owners block without portal fallback.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-001
      - id: AC-002
        type: acceptance-criterion
        statement: Parent authenticity and freshness
        behavior: Parent authenticity and freshness
        expected_result: Missing, mutated, stale, wrong-kind, foreign-identity or unrelated-change spec/plan parents fail verified handoff; actual reads and canonical graph verification succeed for the positive control.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-006
        evidence_refs:
          - EVIDENCE-002
      - id: AC-003
        type: acceptance-criterion
        statement: Independent verification layers
        behavior: Independent verification layers
        expected_result: A structurally valid payload, self-declared hash or review label never supplies approval or rendered evidence; unavailable loaders/verifiers produce explicit blockers/limitations.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-006
        evidence_refs:
          - EVIDENCE-003
      - id: AC-004
        type: acceptance-criterion
        statement: Responsive applicability
        behavior: Responsive applicability
        expected_result: Required surfaces missing evidence fail the evidence gate; justified non-required surfaces can be not-applicable; designed behavior alone cannot satisfy rendered/interaction requirements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-004
      - id: AC-005
        type: acceptance-criterion
        statement: Draft and change lifecycle
        behavior: Draft and change lifecycle
        expected_result: An authorized parentless draft remains editable but is rejected as an approved implementation contract; material changes route to the approval owner, while bounded spacing within existing authority adds no universal ceremony.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-005
      - id: AC-006
        type: acceptance-criterion
        statement: Source and image provenance
        behavior: Source and image provenance
        expected_result: Generated mockups cannot satisfy real-product screenshot requirements; stale or absent source evidence prevents confirmed components/paths; editable source remains primary.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-006
        evidence_refs:
          - EVIDENCE-006
      - id: AC-007
        type: acceptance-criterion
        statement: Canonical paths and physical containment
        behavior: Canonical paths and physical containment
        expected_result: Wrong extension/depth, traversal, absolute paths, wrong repository roots and applicable symlink escape are rejected before reading or writing outside the owner.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-007
      - id: AC-008
        type: acceptance-criterion
        statement: Cross-module identity and freshness
        behavior: Cross-module identity and freshness
        expected_result: Cross-module contracts requiring multiple modules need verified distinct module sources; duplicate modules, missing revision/provenance and stale source content cannot pass.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-008
      - id: AC-009
        type: acceptance-criterion
        statement: Full artifact closure
        behavior: Full artifact closure
        expected_result: Flow, spec, decisions, editable wireframes, exports, screenshot references when present and the ledger are retained in the same-owner closure; diagnostic traversal cannot hide a durable artifact as local-only.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        evidence_refs:
          - EVIDENCE-009
      - id: AC-010
        type: acceptance-criterion
        statement: Actual consumer enforcement
        behavior: Actual consumer enforcement
        expected_result: Documented positive and negative payloads go through the helper and existing Angular, Next.js and generic execution entrypoints; these callers cannot accept draft, legacy-unverified or stale handoffs when verified handoff is required.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-010
      - id: AC-011
        type: acceptance-criterion
        statement: Schema compatibility
        behavior: Schema compatibility
        expected_result: New payloads share the documented canonical schema; explicit legacy reads remain unverified, unknown versions fail closed, and no immutable approved snapshot is migrated in place.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-011
      - id: AC-012
        type: acceptance-criterion
        statement: Verification and scope discipline
        behavior: Verification and scope discipline
        expected_result: Focused contracts, relevant schema/path/lifecycle/consumer checks, hygiene, executable refs, public inventory and mirror checks run with actual PASS/FAIL/NOT RUN results; no new public skill, dependency, Design commit/push or unrelated refactor occurs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-012
      - id: A-001
        type: assumption
        statement: The checked-out simplify work is the dependency baseline for this Design change, although it has not yet passed Git handoff readiness.
        source: explicit
        confidence: high
        status: confirmed
        blocking: false
        evidence_refs:
          - EVIDENCE-BASELINE-SIMPLIFY-DELIVERY
        consequence_if_wrong: Design could overwrite or fail to preserve the approved simplify work.
        validation_method: Preserve the scoped working-tree manifest and recheck simplify integration tests after shared consumer changes.
        owner: sdcorejs-execute-plan
        rationale: The user explicitly requested work on the checkout containing the simplify result.
        impacted_refs:
          - R-008
      - id: D-001
        type: decision
        statement: Use registry roles independently from experience kind.
        question: How is Design ownership represented?
        selected_value: Use registry roles independently from experience kind.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user explicitly requires standalone/library support without false portal/module identities.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a2
          - R-001
          - AC-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-006
        validation_boundary:
          kind: authorization
          source_refs: *a2
      - id: D-002
        type: decision
        statement: Require actual approved-parent verification and distinct Design approval/evidence layers.
        question: What authority may a consumer trust?
        selected_value: Require actual approved-parent verification and distinct Design approval/evidence layers.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user explicitly rejects caller-supplied hashes and structural success as approval evidence.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a3
          - R-002
          - R-003
          - R-004
          - AC-002
          - AC-003
          - AC-004
          - AC-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-006
        validation_boundary:
          kind: authorization
          source_refs: *a3
      - id: D-003
        type: decision
        statement: Extend existing canonical Design surfaces and consumers only.
        question: Where may this change be implemented?
        selected_value: Extend existing canonical Design surfaces and consumers only.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user explicitly forbids a new public skill, wholesale workflow replacement, dependency installation and immutable snapshot edits.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a4
          - R-007
          - R-008
          - AC-010
          - AC-011
          - AC-012
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        validation_boundary:
          kind: authorization
          source_refs: *a4
      - id: D-004
        type: decision
        statement: Verify ownership and approved-consumption denial at the executable contract API boundary.
        question: Which proof layer covers these approved acceptance criteria?
        selected_value: Direct public helper/consumer API denial scenarios plus positive controls.
        source: approved-architecture
        status: approved
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Refines the approved architecture proof obligations for this plan; it does not change D-001 through D-003 or authorize execution before plan approval.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a5
          - R-001
          - R-002
          - R-004
          - R-006
          - R-007
          - AC-001
          - AC-002
          - AC-003
          - AC-005
          - AC-007
          - AC-008
          - AC-010
          - AC-011
          - INV-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        validation_boundary:
          kind: authorization
          source_refs: *a5
      - id: D-005
        type: decision
        statement: Verify responsive/source/closure/scope quality as deterministic contract evidence without claiming live product testing.
        question: Which proof layer covers these approved acceptance criteria?
        selected_value: Unit/integration contract cases plus declared final verification gates.
        source: approved-architecture
        status: approved
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Refines the approved architecture proof obligations for this plan; it does not change D-001 through D-003 or authorize execution before plan approval.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a6
          - R-003
          - R-005
          - R-006
          - R-008
          - AC-004
          - AC-006
          - AC-009
          - AC-012
          - INV-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        validation_boundary:
          kind: none
          source_refs: *a6
      - id: D-006
        type: decision
        statement: Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.
        question: May TASK-005 repair the two confirmed authoring/UIUX verification blockers?
        selected_value: Repair only R1/R2 in the five explicitly listed paths, retaining historical evidence and all immutable approvals.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-012
        task_refs:
          - TASK-005
          - TASK-006
        validation_boundary:
          kind: authorization
          source_refs:
            - R-008
            - AC-012
      - id: INV-001
        type: invariant
        statement: Preserve user-owned simplify content, immutable approved snapshots, module ownership, editable source primacy, the 23-skill public inventory and existing approval authority.
        protected_refs:
          - R-001
          - R-004
          - R-005
          - R-008
          - AC-012
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
        evidence_refs:
          - EVIDENCE-012
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
          - id: A-001
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: INV-001
            type: invariant
        tombstones: []
      - revision: 2
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
          - id: A-001
            type: assumption
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
        tombstones: []
      - revision: 3
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
          - id: A-001
            type: assumption
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
          - id: D-006
            type: decision
          - id: INV-001
            type: invariant
        tombstones: []
    approved_artifact:
      metadata:
        allowed_paths:
          - _refs/shared/design-handoff.md
          - test/e2e/design-handoff-contract.test.mjs
          - test/e2e/artifact-path-convention.test.mjs
          - test/e2e/project-context-artifact-lifecycle.test.mjs
          - test/e2e/angular-production-contract.test.mjs
          - test/e2e/nextjs-production-contract.test.mjs
          - test/e2e/production-readiness-contract.test.mjs
          - test/e2e/support/design-handoff-fixture.mjs
          - _refs/shared/design-handoff.mjs
          - _refs/shared/artifact-paths.mjs
          - _refs/shared/repository-contract.mjs
          - _refs/shared/design-verification.mjs
          - _refs/angular/execution-contract.mjs
          - _refs/nextjs/execution-contract.mjs
          - _refs/orchestration/execution-contract.mjs
          - skills/tracks/design/sdcorejs-design.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/shared/sdlc/04-execute-plan.md
          - _refs/shared/frontend-architecture.md
          - .claude/_refs/shared/design-handoff.md
          - plugin/_refs/shared/design-handoff.md
          - codex/skills/_refs/shared/design-handoff.md
          - .claude/_refs/shared/design-handoff.mjs
          - plugin/_refs/shared/design-handoff.mjs
          - codex/skills/_refs/shared/design-handoff.mjs
          - .claude/_refs/shared/artifact-paths.mjs
          - plugin/_refs/shared/artifact-paths.mjs
          - codex/skills/_refs/shared/artifact-paths.mjs
          - .claude/_refs/shared/repository-contract.mjs
          - plugin/_refs/shared/repository-contract.mjs
          - codex/skills/_refs/shared/repository-contract.mjs
          - .claude/_refs/shared/design-verification.mjs
          - plugin/_refs/shared/design-verification.mjs
          - codex/skills/_refs/shared/design-verification.mjs
          - .claude/_refs/angular/execution-contract.mjs
          - plugin/_refs/angular/execution-contract.mjs
          - codex/skills/_refs/angular/execution-contract.mjs
          - .claude/_refs/nextjs/execution-contract.mjs
          - plugin/_refs/nextjs/execution-contract.mjs
          - codex/skills/_refs/nextjs/execution-contract.mjs
          - .claude/_refs/orchestration/execution-contract.mjs
          - plugin/_refs/orchestration/execution-contract.mjs
          - codex/skills/_refs/orchestration/execution-contract.mjs
          - .claude/_refs/shared/frontend-architecture.md
          - plugin/_refs/shared/frontend-architecture.md
          - codex/skills/_refs/shared/frontend-architecture.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - codex/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - codex/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - codex/skills/sdcorejs-execute-plan/SKILL.md
          - VALIDATION.md
          - .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
          - authoring/evals/skill-authoring-contract.mjs
          - test/e2e/skill-authoring-contract.test.mjs
          - authoring/evals/uiux/evidence.test.mjs
          - authoring/evals/uiux/design-handoff-integration.json
          - authoring/evals/uiux/README.md
        approval_source: user-approved-decision-coverage
        approved_at: 2026-09-23T05:30:09.004Z
        approved_by: current-user
        artifact_id: decision-coverage-r3
        artifact_kind: plan
        change_ref: design-handoff-contract-20260923
        contract_id: decision-coverage:v1
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_repository_role: standalone
        parent_references: []
        parent_repository_id: null
        prohibited_paths:
          - AGENTS.md
          - CLAUDE.md
          - package.json
          - package-lock.json
          - site/**
          - node_modules/**
          - .git/**
          - .env
          - .env.*
          - _refs/shared/system-registry.json
          - _refs/shared/approved-artifact.mjs
          - _refs/shared/decision-coverage.mjs
          - _refs/shared/architecture-contract.mjs
          - _refs/shared/validation-map.mjs
          - _refs/simplify/**
          - skills/shared/workflow/simplify.md
          - .sdcorejs/specs/**
          - .sdcorejs/architecture/**
          - .sdcorejs/plans/**
          - .sdcorejs/conventions/**
          - .sdcorejs/summary.md
        repository_relative_path: .sdcorejs/plans/workflow/2026-09-23-12-30-design-handoff-contract-r2.md
        requirement_id: decision-coverage
        schema_version: 1
        source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
        stack_profile: markdown-skill-pack
        supersedes: null
        track: workflow
        approval_hash: sha256:v1:7f4bd0b12c5de06e4c33ab7361088503f62f379908ac3bc47b05aa8590e08e75
      body: |
        {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"INV-001","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"D-005","type":"decision"},{"id":"INV-001","type":"invariant"}],"revision":2,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"AC-011","type":"acceptance-criterion"},{"id":"AC-012","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"D-005","type":"decision"},{"id":"D-006","type":"decision"},{"id":"INV-001","type":"invariant"}],"revision":3,"tombstones":[]}],"records":[{"evidence_refs":["EVIDENCE-001"],"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Decouple experience kind from semantic repository ownership using registry roles and scopes; support enterprise modules, portal shells/composition, cross-module experiences, standalone websites/apps and component/design-system libraries.","status":"active","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-002","EVIDENCE-003"],"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Separate structural validation, actual approved-parent verification, Design approval/review state and applicable rendered/interaction evidence. Verified consumers must fail closed without source or verification infrastructure.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-004"],"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Derive required responsive surfaces and evidence from verified approved requirements and the target; distinguish designed behavior from rendered and interacted observations, with reasoned not-applicable outcomes.","status":"active","task_refs":["TASK-001","TASK-002","TASK-004","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-005"],"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Allow authorized exploratory drafts without approved parents while preventing their use as approved implementation contracts; route new or material scope changes to the existing decision/approval owner.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-006"],"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Preserve existing design first, editable source primacy, generated-versus-product image provenance, source-backed confirmed component/path mappings, and Visual Companion feedback without approval authority.","status":"active","task_refs":["TASK-001","TASK-002","TASK-004","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-007","EVIDENCE-008","EVIDENCE-009"],"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Enforce canonical paths, extensions, containment and complete artifact closure; verify distinct module sources and current provenance for cross-module references without duplicate editable ownership.","status":"active","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-010","EVIDENCE-011"],"id":"R-007","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Use one documented evolving schema, explicit read-only legacy compatibility and document-derived payloads exercised through real Angular, Next.js and generic consumers.","status":"active","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"requirement"},{"evidence_refs":["EVIDENCE-012"],"id":"R-008","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Keep the change limited to the Design handoff contract; preserve simplify results and immutable artifacts, sync mirrors through existing scripts, report actual checks, and stop after this step.","status":"active","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006"],"type":"requirement"},{"behavior":"Registry-based ownership matrix","blocking":true,"evidence_refs":["EVIDENCE-001"],"expected_result":"Valid module, portal shell/composition, standalone and library cases resolve to their real owner; missing/unwritable module owners block without portal fallback.","id":"AC-001","requirement_refs":["R-001"],"statement":"Registry-based ownership matrix","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Parent authenticity and freshness","blocking":true,"evidence_refs":["EVIDENCE-002"],"expected_result":"Missing, mutated, stale, wrong-kind, foreign-identity or unrelated-change spec/plan parents fail verified handoff; actual reads and canonical graph verification succeed for the positive control.","id":"AC-002","requirement_refs":["R-002"],"statement":"Parent authenticity and freshness","task_refs":["TASK-001","TASK-002","TASK-003","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Independent verification layers","blocking":true,"evidence_refs":["EVIDENCE-003"],"expected_result":"A structurally valid payload, self-declared hash or review label never supplies approval or rendered evidence; unavailable loaders/verifiers produce explicit blockers/limitations.","id":"AC-003","requirement_refs":["R-002"],"statement":"Independent verification layers","task_refs":["TASK-001","TASK-002","TASK-003","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Responsive applicability","blocking":true,"evidence_refs":["EVIDENCE-004"],"expected_result":"Required surfaces missing evidence fail the evidence gate; justified non-required surfaces can be not-applicable; designed behavior alone cannot satisfy rendered/interaction requirements.","id":"AC-004","requirement_refs":["R-003"],"statement":"Responsive applicability","task_refs":["TASK-001","TASK-002","TASK-004","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Draft and change lifecycle","blocking":true,"evidence_refs":["EVIDENCE-005"],"expected_result":"An authorized parentless draft remains editable but is rejected as an approved implementation contract; material changes route to the approval owner, while bounded spacing within existing authority adds no universal ceremony.","id":"AC-005","requirement_refs":["R-004"],"statement":"Draft and change lifecycle","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Source and image provenance","blocking":true,"evidence_refs":["EVIDENCE-006"],"expected_result":"Generated mockups cannot satisfy real-product screenshot requirements; stale or absent source evidence prevents confirmed components/paths; editable source remains primary.","id":"AC-006","requirement_refs":["R-005"],"statement":"Source and image provenance","task_refs":["TASK-001","TASK-002","TASK-004","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Canonical paths and physical containment","blocking":true,"evidence_refs":["EVIDENCE-007"],"expected_result":"Wrong extension/depth, traversal, absolute paths, wrong repository roots and applicable symlink escape are rejected before reading or writing outside the owner.","id":"AC-007","requirement_refs":["R-006"],"statement":"Canonical paths and physical containment","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Cross-module identity and freshness","blocking":true,"evidence_refs":["EVIDENCE-008"],"expected_result":"Cross-module contracts requiring multiple modules need verified distinct module sources; duplicate modules, missing revision/provenance and stale source content cannot pass.","id":"AC-008","requirement_refs":["R-006"],"statement":"Cross-module identity and freshness","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Full artifact closure","blocking":true,"evidence_refs":["EVIDENCE-009"],"expected_result":"Flow, spec, decisions, editable wireframes, exports, screenshot references when present and the ledger are retained in the same-owner closure; diagnostic traversal cannot hide a durable artifact as local-only.","id":"AC-009","requirement_refs":["R-006"],"statement":"Full artifact closure","task_refs":["TASK-001","TASK-002","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Actual consumer enforcement","blocking":true,"evidence_refs":["EVIDENCE-010"],"expected_result":"Documented positive and negative payloads go through the helper and existing Angular, Next.js and generic execution entrypoints; these callers cannot accept draft, legacy-unverified or stale handoffs when verified handoff is required.","id":"AC-010","requirement_refs":["R-007"],"statement":"Actual consumer enforcement","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Schema compatibility","blocking":true,"evidence_refs":["EVIDENCE-011"],"expected_result":"New payloads share the documented canonical schema; explicit legacy reads remain unverified, unknown versions fail closed, and no immutable approved snapshot is migrated in place.","id":"AC-011","requirement_refs":["R-007"],"statement":"Schema compatibility","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Verification and scope discipline","blocking":true,"evidence_refs":["EVIDENCE-012"],"expected_result":"Focused contracts, relevant schema/path/lifecycle/consumer checks, hygiene, executable refs, public inventory and mirror checks run with actual PASS/FAIL/NOT RUN results; no new public skill, dependency, Design commit/push or unrelated refactor occurs.","id":"AC-012","requirement_refs":["R-008"],"statement":"Verification and scope discipline","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"high","consequence_if_wrong":"Design could overwrite or fail to preserve the approved simplify work.","evidence_refs":["EVIDENCE-BASELINE-SIMPLIFY-DELIVERY"],"id":"A-001","impacted_refs":["R-008"],"owner":"sdcorejs-execute-plan","rationale":"The user explicitly requested work on the checkout containing the simplify result.","source":"explicit","statement":"The checked-out simplify work is the dependency baseline for this Design change, although it has not yet passed Git handoff readiness.","status":"confirmed","type":"assumption","validation_method":"Preserve the scoped working-tree manifest and recheck simplify integration tests after shared consumer changes."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","AC-001"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How is Design ownership represented?","rationale":"The user explicitly requires standalone/library support without false portal/module identities.","revisit_condition":null,"scope":"repository","selected_value":"Use registry roles independently from experience kind.","source":"explicit-user","statement":"Use registry roles independently from experience kind.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-006"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-001","AC-001"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","AC-002","AC-003","AC-004","AC-005"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"What authority may a consumer trust?","rationale":"The user explicitly rejects caller-supplied hashes and structural success as approval evidence.","revisit_condition":null,"scope":"repository","selected_value":"Require actual approved-parent verification and distinct Design approval/evidence layers.","source":"explicit-user","statement":"Require actual approved-parent verification and distinct Design approval/evidence layers.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-006"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-002","R-003","R-004","AC-002","AC-003","AC-004","AC-005"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-007","R-008","AC-010","AC-011","AC-012"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where may this change be implemented?","rationale":"The user explicitly forbids a new public skill, wholesale workflow replacement, dependency installation and immutable snapshot edits.","revisit_condition":null,"scope":"repository","selected_value":"Extend existing canonical Design surfaces and consumers only.","source":"explicit-user","statement":"Extend existing canonical Design surfaces and consumers only.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-007","R-008","AC-010","AC-011","AC-012"]}},{"blocking":false,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-004","R-006","R-007","AC-001","AC-002","AC-003","AC-005","AC-007","AC-008","AC-010","AC-011","INV-001"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which proof layer covers these approved acceptance criteria?","rationale":"Refines the approved architecture proof obligations for this plan; it does not change D-001 through D-003 or authorize execution before plan approval.","revisit_condition":null,"scope":"repository","selected_value":"Direct public helper/consumer API denial scenarios plus positive controls.","source":"approved-architecture","statement":"Verify ownership and approved-consumption denial at the executable contract API boundary.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-001","R-002","R-004","R-006","R-007","AC-001","AC-002","AC-003","AC-005","AC-007","AC-008","AC-010","AC-011","INV-001"]}},{"blocking":false,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-003","R-005","R-006","R-008","AC-004","AC-006","AC-009","AC-012","INV-001"],"id":"D-005","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which proof layer covers these approved acceptance criteria?","rationale":"Refines the approved architecture proof obligations for this plan; it does not change D-001 through D-003 or authorize execution before plan approval.","revisit_condition":null,"scope":"repository","selected_value":"Unit/integration contract cases plus declared final verification gates.","source":"approved-architecture","statement":"Verify responsive/source/closure/scope quality as deterministic contract evidence without claiming live product testing.","status":"approved","supersedes":null,"task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-003","R-005","R-006","R-008","AC-004","AC-006","AC-009","AC-012","INV-001"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-008","AC-012"],"id":"D-006","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"May TASK-005 repair the two confirmed authoring/UIUX verification blockers?","rationale":"Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.","revisit_condition":null,"scope":"repository","selected_value":"Repair only R1/R2 in the five explicitly listed paths, retaining historical evidence and all immutable approvals.","source":"explicit-user","statement":"Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.","status":"approved","supersedes":null,"task_refs":["TASK-005","TASK-006"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["R-008","AC-012"]}},{"evidence_refs":["EVIDENCE-012"],"id":"INV-001","protected_refs":["R-001","R-004","R-005","R-008","AC-012"],"statement":"Preserve user-owned simplify content, immutable approved snapshots, module ownership, editable source primacy, the 23-skill public inventory and existing approval authority.","task_refs":["TASK-001","TASK-002","TASK-003","TASK-004","TASK-005","TASK-006"],"type":"invariant"}],"revision":3,"schema_version":1}
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a7
    goals:
      - id: G-001
        statement: A Design handoff cannot exceed its real owner, approval or evidence authority and is enforced by real implementation consumers.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a9 []
        planned_paths: &a8
          - _refs/shared/design-handoff.md
          - test/e2e/design-handoff-contract.test.mjs
          - test/e2e/artifact-path-convention.test.mjs
          - test/e2e/project-context-artifact-lifecycle.test.mjs
          - test/e2e/angular-production-contract.test.mjs
          - test/e2e/nextjs-production-contract.test.mjs
          - test/e2e/production-readiness-contract.test.mjs
          - test/e2e/support/design-handoff-fixture.mjs
        planned_evidence:
          - id: EVIDENCE-013
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - INV-001
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
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a12
          - TASK-001
        planned_paths: &a10
          - _refs/shared/design-handoff.mjs
          - _refs/shared/artifact-paths.mjs
          - _refs/shared/repository-contract.mjs
          - _refs/shared/design-verification.mjs
        planned_evidence:
          - id: EVIDENCE-014
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - INV-001
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a14
          - TASK-002
        planned_paths: &a13
          - _refs/angular/execution-contract.mjs
          - _refs/nextjs/execution-contract.mjs
          - _refs/orchestration/execution-contract.mjs
        planned_evidence:
          - id: EVIDENCE-015
            record_refs:
              - R-002
              - R-004
              - R-007
              - INV-001
        justification_refs:
          - R-002
          - R-004
          - R-007
        enforces_invariant_refs:
          - INV-001
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a16
          - TASK-003
        planned_paths: &a15
          - skills/tracks/design/sdcorejs-design.md
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/shared/sdlc/04-execute-plan.md
          - _refs/shared/frontend-architecture.md
        planned_evidence:
          - id: EVIDENCE-016
            record_refs:
              - R-003
              - R-004
              - R-005
              - R-007
              - R-008
              - INV-001
        justification_refs:
          - R-003
          - R-004
          - R-005
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a17
          - TASK-004
        planned_paths:
          - .claude/_refs/shared/design-handoff.md
          - plugin/_refs/shared/design-handoff.md
          - codex/skills/_refs/shared/design-handoff.md
          - .claude/_refs/shared/design-handoff.mjs
          - plugin/_refs/shared/design-handoff.mjs
          - codex/skills/_refs/shared/design-handoff.mjs
          - .claude/_refs/shared/artifact-paths.mjs
          - plugin/_refs/shared/artifact-paths.mjs
          - codex/skills/_refs/shared/artifact-paths.mjs
          - .claude/_refs/shared/repository-contract.mjs
          - plugin/_refs/shared/repository-contract.mjs
          - codex/skills/_refs/shared/repository-contract.mjs
          - .claude/_refs/shared/design-verification.mjs
          - plugin/_refs/shared/design-verification.mjs
          - codex/skills/_refs/shared/design-verification.mjs
          - .claude/_refs/angular/execution-contract.mjs
          - plugin/_refs/angular/execution-contract.mjs
          - codex/skills/_refs/angular/execution-contract.mjs
          - .claude/_refs/nextjs/execution-contract.mjs
          - plugin/_refs/nextjs/execution-contract.mjs
          - codex/skills/_refs/nextjs/execution-contract.mjs
          - .claude/_refs/orchestration/execution-contract.mjs
          - plugin/_refs/orchestration/execution-contract.mjs
          - codex/skills/_refs/orchestration/execution-contract.mjs
          - .claude/_refs/shared/frontend-architecture.md
          - plugin/_refs/shared/frontend-architecture.md
          - codex/skills/_refs/shared/frontend-architecture.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - codex/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - codex/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - codex/skills/sdcorejs-execute-plan/SKILL.md
          - VALIDATION.md
          - authoring/evals/skill-authoring-contract.mjs
          - test/e2e/skill-authoring-contract.test.mjs
          - authoring/evals/uiux/evidence.test.mjs
          - authoring/evals/uiux/design-handoff-integration.json
          - authoring/evals/uiux/README.md
        planned_evidence:
          - id: EVIDENCE-017
            record_refs:
              - R-007
              - R-008
              - INV-001
        justification_refs:
          - R-007
          - R-008
        enforces_invariant_refs:
          - INV-001
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a19
          - TASK-005
        planned_paths: &a18
          - .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - AC-001
              - INV-001
          - id: EVIDENCE-002
            record_refs:
              - R-002
              - AC-002
              - INV-001
          - id: EVIDENCE-003
            record_refs:
              - R-002
              - AC-003
              - INV-001
          - id: EVIDENCE-004
            record_refs:
              - R-003
              - AC-004
              - INV-001
          - id: EVIDENCE-005
            record_refs:
              - R-004
              - AC-005
              - INV-001
          - id: EVIDENCE-006
            record_refs:
              - R-005
              - AC-006
              - INV-001
          - id: EVIDENCE-007
            record_refs:
              - R-006
              - AC-007
              - INV-001
          - id: EVIDENCE-008
            record_refs:
              - R-006
              - AC-008
              - INV-001
          - id: EVIDENCE-009
            record_refs:
              - R-006
              - AC-009
              - INV-001
          - id: EVIDENCE-010
            record_refs:
              - R-007
              - AC-010
              - INV-001
          - id: EVIDENCE-011
            record_refs:
              - R-007
              - AC-011
              - INV-001
          - id: EVIDENCE-012
            record_refs:
              - R-008
              - AC-012
              - INV-001
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
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - _refs/shared/design-handoff.md
            - test/e2e/design-handoff-contract.test.mjs
            - test/e2e/artifact-path-convention.test.mjs
            - test/e2e/project-context-artifact-lifecycle.test.mjs
            - test/e2e/angular-production-contract.test.mjs
            - test/e2e/nextjs-production-contract.test.mjs
            - test/e2e/production-readiness-contract.test.mjs
            - _refs/shared/design-handoff.mjs
            - _refs/shared/artifact-paths.mjs
            - _refs/shared/repository-contract.mjs
            - _refs/angular/execution-contract.mjs
            - _refs/nextjs/execution-contract.mjs
            - _refs/orchestration/execution-contract.mjs
            - skills/tracks/design/sdcorejs-design.md
            - skills/tracks/angular/sdcorejs-angular.md
            - skills/tracks/nextjs/sdcorejs-nextjs.md
            - skills/shared/sdlc/04-execute-plan.md
            - _refs/shared/frontend-architecture.md
            - .claude/_refs/shared/design-handoff.md
            - plugin/_refs/shared/design-handoff.md
            - codex/skills/_refs/shared/design-handoff.md
            - .claude/_refs/shared/design-handoff.mjs
            - plugin/_refs/shared/design-handoff.mjs
            - codex/skills/_refs/shared/design-handoff.mjs
            - .claude/_refs/shared/artifact-paths.mjs
            - plugin/_refs/shared/artifact-paths.mjs
            - codex/skills/_refs/shared/artifact-paths.mjs
            - .claude/_refs/shared/repository-contract.mjs
            - plugin/_refs/shared/repository-contract.mjs
            - codex/skills/_refs/shared/repository-contract.mjs
            - .claude/_refs/angular/execution-contract.mjs
            - plugin/_refs/angular/execution-contract.mjs
            - codex/skills/_refs/angular/execution-contract.mjs
            - .claude/_refs/nextjs/execution-contract.mjs
            - plugin/_refs/nextjs/execution-contract.mjs
            - codex/skills/_refs/nextjs/execution-contract.mjs
            - .claude/_refs/orchestration/execution-contract.mjs
            - plugin/_refs/orchestration/execution-contract.mjs
            - codex/skills/_refs/orchestration/execution-contract.mjs
            - .claude/_refs/shared/frontend-architecture.md
            - plugin/_refs/shared/frontend-architecture.md
            - codex/skills/_refs/shared/frontend-architecture.md
            - .claude/skills/sdcorejs-design/SKILL.md
            - plugin/skills/sdcorejs-design/SKILL.md
            - codex/skills/sdcorejs-design/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - codex/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - codex/skills/sdcorejs-execute-plan/SKILL.md
            - VALIDATION.md
            - authoring/evals/skill-authoring-contract.mjs
            - test/e2e/skill-authoring-contract.test.mjs
            - authoring/evals/uiux/evidence.test.mjs
            - authoring/evals/uiux/README.md
          intended_new_paths:
            - path: test/e2e/support/design-handoff-fixture.mjs
              owner_task_id: TASK-001
            - path: _refs/shared/design-verification.mjs
              owner_task_id: TASK-002
            - path: .claude/_refs/shared/design-verification.mjs
              owner_task_id: TASK-005
            - path: plugin/_refs/shared/design-verification.mjs
              owner_task_id: TASK-005
            - path: codex/skills/_refs/shared/design-verification.mjs
              owner_task_id: TASK-005
            - path: .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
              owner_task_id: TASK-006
            - path: authoring/evals/uiux/design-handoff-integration.json
              owner_task_id: TASK-005
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
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-owner-matrix
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Valid module, portal shell/composition, standalone and library cases resolve to their real owner; missing/unwritable module owners block without portal fallback.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-parent-authenticity
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Missing, mutated, stale, wrong-kind, foreign-identity or unrelated-change spec/plan parents fail verified handoff; actual reads and canonical graph verification succeed for the positive control.
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-verification-layers
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: A structurally valid payload, self-declared hash or review label never supplies approval or rendered evidence; unavailable loaders/verifiers produce explicit blockers/limitations.
      status: covered
      evidence_refs:
        - EVIDENCE-003
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
      risk: contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a6
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-design-responsive-applicability
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Required surfaces missing evidence fail the evidence gate; justified non-required surfaces can be not-applicable; designed behavior alone cannot satisfy rendered/interaction requirements.
      status: covered
      evidence_refs:
        - EVIDENCE-004
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-draft-and-material-change
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: An authorized parentless draft remains editable but is rejected as an approved implementation contract; material changes route to the approval owner, while bounded spacing within existing authority adds no universal ceremony.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-001
      risk: contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a6
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-design-source-and-image-provenance
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Generated mockups cannot satisfy real-product screenshot requirements; stale or absent source evidence prevents confirmed components/paths; editable source remains primary.
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-path-and-root-containment
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Wrong extension/depth, traversal, absolute paths, wrong repository roots and applicable symlink escape are rejected before reading or writing outside the owner.
      status: covered
      evidence_refs:
        - EVIDENCE-007
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-cross-module-provenance
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Cross-module contracts requiring multiple modules need verified distinct module sources; duplicate modules, missing revision/provenance and stale source content cannot pass.
      status: covered
      evidence_refs:
        - EVIDENCE-008
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
      risk: contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a6
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-design-artifact-closure
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Flow, spec, decisions, editable wireframes, exports, screenshot references when present and the ledger are retained in the same-owner closure; diagnostic traversal cannot hide a durable artifact as local-only.
      status: covered
      evidence_refs:
        - EVIDENCE-009
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-real-consumer-enforcement
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Documented positive and negative payloads go through the helper and existing Angular, Next.js and generic execution entrypoints; these callers cannot accept draft, legacy-unverified or stale handoffs when verified handoff is required.
      status: covered
      evidence_refs:
        - EVIDENCE-010
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-001
      risk: implementation-authority-and-provenance
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a5
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-design-schema-compatibility
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: New payloads share the documented canonical schema; explicit legacy reads remain unverified, unknown versions fail closed, and no immutable approved snapshot is migrated in place.
      status: covered
      evidence_refs:
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-001
      risk: contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a6
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-design-scope-inventory-contract
      planned_command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Focused contracts, relevant schema/path/lifecycle/consumer checks, hygiene, executable refs, public inventory and mirror checks run with actual PASS/FAIL/NOT RUN results; no new public skill, dependency, Design commit/push or unrelated refactor occurs.
      status: covered
      evidence_refs:
        - EVIDENCE-012
      rationale: Planned direct Node contract/API evidence. api-e2e denotes end-to-end denial through the executable repository API, not a network HTTP product or live-agent run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
  approved_spec_hash: sha256:v1:34f012a1e161434df6a81fdb251831579b14cf1648b17d838d41d2779d3b6844
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
      artifact_id: spec-design-handoff-contract-20260923-r1
      revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
      approval_hash: sha256:v1:34f012a1e161434df6a81fdb251831579b14cf1648b17d838d41d2779d3b6844
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-23-10-37-design-handoff-contract.md
  approved_architecture_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: architecture-design-handoff-contract-20260923-r1
    artifact_kind: architecture
    revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
    approval_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: plan-design-handoff-contract-20260923-r1
  target_root: .
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
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: node-general
  task_count: 6
  phase_count: 4
  allowed_paths:
    - _refs/shared/design-handoff.md
    - test/e2e/design-handoff-contract.test.mjs
    - test/e2e/artifact-path-convention.test.mjs
    - test/e2e/project-context-artifact-lifecycle.test.mjs
    - test/e2e/angular-production-contract.test.mjs
    - test/e2e/nextjs-production-contract.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - test/e2e/support/design-handoff-fixture.mjs
    - _refs/shared/design-handoff.mjs
    - _refs/shared/artifact-paths.mjs
    - _refs/shared/repository-contract.mjs
    - _refs/shared/design-verification.mjs
    - _refs/angular/execution-contract.mjs
    - _refs/nextjs/execution-contract.mjs
    - _refs/orchestration/execution-contract.mjs
    - skills/tracks/design/sdcorejs-design.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/nextjs/sdcorejs-nextjs.md
    - skills/shared/sdlc/04-execute-plan.md
    - _refs/shared/frontend-architecture.md
    - .claude/_refs/shared/design-handoff.md
    - plugin/_refs/shared/design-handoff.md
    - codex/skills/_refs/shared/design-handoff.md
    - .claude/_refs/shared/design-handoff.mjs
    - plugin/_refs/shared/design-handoff.mjs
    - codex/skills/_refs/shared/design-handoff.mjs
    - .claude/_refs/shared/artifact-paths.mjs
    - plugin/_refs/shared/artifact-paths.mjs
    - codex/skills/_refs/shared/artifact-paths.mjs
    - .claude/_refs/shared/repository-contract.mjs
    - plugin/_refs/shared/repository-contract.mjs
    - codex/skills/_refs/shared/repository-contract.mjs
    - .claude/_refs/shared/design-verification.mjs
    - plugin/_refs/shared/design-verification.mjs
    - codex/skills/_refs/shared/design-verification.mjs
    - .claude/_refs/angular/execution-contract.mjs
    - plugin/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/angular/execution-contract.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/shared/frontend-architecture.md
    - plugin/_refs/shared/frontend-architecture.md
    - codex/skills/_refs/shared/frontend-architecture.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - codex/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
    - authoring/evals/skill-authoring-contract.mjs
    - test/e2e/skill-authoring-contract.test.mjs
    - authoring/evals/uiux/evidence.test.mjs
    - authoring/evals/uiux/design-handoff-integration.json
    - authoring/evals/uiux/README.md
  prohibited_paths:
    - AGENTS.md
    - CLAUDE.md
    - package.json
    - package-lock.json
    - site/**
    - node_modules/**
    - .git/**
    - .env
    - .env.*
    - _refs/shared/system-registry.json
    - _refs/shared/approved-artifact.mjs
    - _refs/shared/decision-coverage.mjs
    - _refs/shared/architecture-contract.mjs
    - _refs/shared/validation-map.mjs
    - _refs/simplify/**
    - skills/shared/workflow/simplify.md
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - .sdcorejs/plans/**
    - .sdcorejs/conventions/**
    - .sdcorejs/summary.md
  generated_artifacts:
    - .claude/_refs/shared/design-handoff.md
    - plugin/_refs/shared/design-handoff.md
    - codex/skills/_refs/shared/design-handoff.md
    - .claude/_refs/shared/design-handoff.mjs
    - plugin/_refs/shared/design-handoff.mjs
    - codex/skills/_refs/shared/design-handoff.mjs
    - .claude/_refs/shared/artifact-paths.mjs
    - plugin/_refs/shared/artifact-paths.mjs
    - codex/skills/_refs/shared/artifact-paths.mjs
    - .claude/_refs/shared/repository-contract.mjs
    - plugin/_refs/shared/repository-contract.mjs
    - codex/skills/_refs/shared/repository-contract.mjs
    - .claude/_refs/shared/design-verification.mjs
    - plugin/_refs/shared/design-verification.mjs
    - codex/skills/_refs/shared/design-verification.mjs
    - .claude/_refs/angular/execution-contract.mjs
    - plugin/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/angular/execution-contract.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/shared/frontend-architecture.md
    - plugin/_refs/shared/frontend-architecture.md
    - codex/skills/_refs/shared/frontend-architecture.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - codex/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
  docs_artifacts:
    - skills/tracks/design/sdcorejs-design.md
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/tracks/nextjs/sdcorejs-nextjs.md
    - skills/shared/sdlc/04-execute-plan.md
    - _refs/shared/frontend-architecture.md
    - _refs/shared/design-handoff.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
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
    description: Only explicit legacy compatibility behavior and local test fixtures; no historical artifact migration.
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Workflow/contract authoring; no production frontend component/state/provider implementation.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No AI-agent engine/capability/runtime application implementation.
    contract: null
  verification_strategy:
    package_manager: npm
    package_manager_evidence: package.json packageManager npm@10.9.2 and package-lock.json
    coverage_approach: TDD
    commands_planned:
      - command: node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs
        source: project-doc
        cwd: .
        reason: Mapped Design regression and actual consumer cases, plus Product/closure safe controls.
      - command: npm run test:e2e:artifact-paths
        source: package.json
        cwd: .
        reason: Canonical paths, Design/Product ownership and artifact lifecycle.
      - command: npm run test:e2e:angular
        source: package.json
        cwd: .
        reason: Real Angular consumer positive/negative controls.
      - command: npm run test:e2e:nextjs
        source: package.json
        cwd: .
        reason: Real Next.js consumer positive/negative controls.
      - command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/communication-economy.test.mjs test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
        source: project-doc
        cwd: .
        reason: Preserve existing simplify integration; this is Design regression evidence, not an amendment of the prior simplify approved command.
      - command: npm run test:e2e:skill-authoring
        source: package.json
        cwd: .
        reason: Public inventory/internal non-distribution and authoring contracts; retain the known pre-existing failure if still reproducible.
      - command: npm run test:e2e:uiux
        source: package.json
        cwd: .
        reason: Affected shared frontend/design guidance and routing.
      - command: node authoring/evals/run-deterministic.mjs
        source: project-doc
        cwd: .
        reason: Existing authoring deterministic scenario matrix; zero provider calls.
      - command: npm run report:communication-economy
        source: package.json
        cwd: .
        reason: Recompute only the two permitted current-value cells in VALIDATION.md when changed.
      - command: npm run sync:skills
        source: package.json
        cwd: .
        reason: Generate mirrors from final canonical sources only.
      - command: npm run check:skills
        source: package.json
        cwd: .
        reason: Validate mirror parity and registry/schema/public count.
      - command: npm run check:text-hygiene
        source: package.json
        cwd: .
        reason: Source language, encoding and text hygiene.
      - command: npm run check:executable-references
        source: package.json
        cwd: .
        reason: Existing executable reference checks.
      - command: git diff --check
        source: project-doc
        cwd: .
        reason: Whitespace/diff hygiene.
    commands_skipped:
      - command: npm test
        reason: Full unrelated repository/golden target matrix is outside the bounded Design proof; run affected suites listed here.
      - command: Credentialed live-agent / Figma / real-product rendering runs
        reason: No target UI, provider authorization or new runtime/dependency setup is part of this contract change; report NOT RUN.
    checks: Bind actual case results and command/config/environment/source fingerprints; no receipt before execution or approval.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: _refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/shared/design-handoff.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/shared/artifact-paths.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/shared/repository-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: skills/tracks/design/sdcorejs-design.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: skills/tracks/angular/sdcorejs-angular.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: skills/tracks/nextjs/sdcorejs-nextjs.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: skills/shared/sdlc/04-execute-plan.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: _refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/design-handoff.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/design-handoff.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/design-handoff.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/artifact-paths.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/artifact-paths.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/artifact-paths.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/repository-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/repository-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/repository-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .claude/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: plugin/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: codex/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: VALIDATION.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
      - path: .sdcorejs/docs/workflow/2026-09-23-10-45-design-handoff-contract-delivery.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: One sequential task owner; generated files changed only by the sync script.
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
    gitlink_updates_in_scope: false
    repositories:
      - repository_id: github.com/sdcorejs/sdcorejs-agent
        role: standalone
        module_id: null
        available: true
        writable: true
    steps:
      - id: TASK-001
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a8
        prohibited_paths: &a11
          - AGENTS.md
          - CLAUDE.md
          - package.json
          - package-lock.json
          - site/**
          - authoring/**
          - node_modules/**
          - .git/**
          - .env
          - .env.*
          - _refs/shared/system-registry.json
          - _refs/shared/approved-artifact.mjs
          - _refs/shared/decision-coverage.mjs
          - _refs/shared/architecture-contract.mjs
          - _refs/shared/validation-map.mjs
          - _refs/simplify/**
          - skills/shared/workflow/simplify.md
          - .sdcorejs/specs/**
          - .sdcorejs/architecture/**
          - .sdcorejs/plans/**
          - .sdcorejs/conventions/**
          - .sdcorejs/summary.md
        depends_on: *a9
      - id: TASK-002
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a10
        prohibited_paths: *a11
        depends_on: *a12
      - id: TASK-003
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a13
        prohibited_paths: *a11
        depends_on: *a14
      - id: TASK-004
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a15
        prohibited_paths: *a11
        depends_on: *a16
      - id: TASK-005
        action: VERIFY-THEN-EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths:
          - .claude/_refs/shared/design-handoff.md
          - plugin/_refs/shared/design-handoff.md
          - codex/skills/_refs/shared/design-handoff.md
          - .claude/_refs/shared/design-handoff.mjs
          - plugin/_refs/shared/design-handoff.mjs
          - codex/skills/_refs/shared/design-handoff.mjs
          - .claude/_refs/shared/artifact-paths.mjs
          - plugin/_refs/shared/artifact-paths.mjs
          - codex/skills/_refs/shared/artifact-paths.mjs
          - .claude/_refs/shared/repository-contract.mjs
          - plugin/_refs/shared/repository-contract.mjs
          - codex/skills/_refs/shared/repository-contract.mjs
          - .claude/_refs/shared/design-verification.mjs
          - plugin/_refs/shared/design-verification.mjs
          - codex/skills/_refs/shared/design-verification.mjs
          - .claude/_refs/angular/execution-contract.mjs
          - plugin/_refs/angular/execution-contract.mjs
          - codex/skills/_refs/angular/execution-contract.mjs
          - .claude/_refs/nextjs/execution-contract.mjs
          - plugin/_refs/nextjs/execution-contract.mjs
          - codex/skills/_refs/nextjs/execution-contract.mjs
          - .claude/_refs/orchestration/execution-contract.mjs
          - plugin/_refs/orchestration/execution-contract.mjs
          - codex/skills/_refs/orchestration/execution-contract.mjs
          - .claude/_refs/shared/frontend-architecture.md
          - plugin/_refs/shared/frontend-architecture.md
          - codex/skills/_refs/shared/frontend-architecture.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - codex/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - codex/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - codex/skills/sdcorejs-execute-plan/SKILL.md
          - VALIDATION.md
          - authoring/evals/skill-authoring-contract.mjs
          - test/e2e/skill-authoring-contract.test.mjs
          - authoring/evals/uiux/evidence.test.mjs
          - authoring/evals/uiux/design-handoff-integration.json
          - authoring/evals/uiux/README.md
        prohibited_paths:
          - AGENTS.md
          - CLAUDE.md
          - package.json
          - package-lock.json
          - site/**
          - node_modules/**
          - .git/**
          - .env
          - .env.*
          - _refs/shared/system-registry.json
          - _refs/shared/approved-artifact.mjs
          - _refs/shared/decision-coverage.mjs
          - _refs/shared/architecture-contract.mjs
          - _refs/shared/validation-map.mjs
          - _refs/simplify/**
          - skills/shared/workflow/simplify.md
          - .sdcorejs/specs/**
          - .sdcorejs/architecture/**
          - .sdcorejs/plans/**
          - .sdcorejs/conventions/**
          - .sdcorejs/summary.md
        depends_on: *a17
      - id: TASK-006
        action: CREATE
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        allowed_paths: *a18
        prohibited_paths: *a11
        depends_on: *a19
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    known_blockers: Existing simplify convergence and HTTPS .git authoring identity failures remain visible; no unrelated fix or fake readiness.
  approval:
    approved: true
    approved_at: 2026-09-23T05:30:09.004Z
  change_control:
    revision: 2
    supersedes: plan-design-handoff-contract-20260923-r1
    change_reason: Explicit current-user approval (duyệt) to resolve the two reported authoring/UIUX blockers R1/R2. Preserve historical evidence and all existing approved snapshots; no commit, push, dependencies or next-step work.
```
