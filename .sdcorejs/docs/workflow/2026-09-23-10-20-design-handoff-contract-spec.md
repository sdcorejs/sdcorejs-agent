---
artifact_id: draft-spec-design-handoff-contract-20260923-r1
artifact_kind: execution-doc
change_ref: design-handoff-contract-20260923
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
repository_relative_path: .sdcorejs/docs/workflow/2026-09-23-10-20-design-handoff-contract-spec.md
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
description: Draft requirements and approval boundary for Design handoff contract hardening.
status: draft
---

# Spec - Design handoff contract hardening - 2026-09-23 10:20

## Problem & Goals

Existing Design prose promises stronger authority than its executable validator enforces. Extend the current contract so semantic ownership, approved inputs, review state and applicable evidence are independently represented and verified by implementation consumers. This draft proposes requirements; it does not authorize implementation.

## Verified baseline

- Base revision: ac820d70bd247a04f977aab9bbb864f6a054acb7; checkout includes the uncommitted simplify result on codex/simplify-design-handoff.
- PASS: node --test test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs (50 passed, 0 failed).
- Read-only probes reproduce rejected standalone/library ownership, zero parent reads, absent verified entrypoint, accepted foreign parent identity, responsive booleans without render evidence, rejected mobile-only applicability, accepted wrong extension/depth, same-module cross-module references and diagnostic traversal.
- Working controls: unavailable module blocks, a generated mockup classified as a product capture is rejected, and a valid bundle closure contains flow/spec/decisions/wireframe/export/ledger. Structural acceptance of a draft is not itself a defect; the missing verified consumer boundary is.
- FAIL: npm run test:e2e:skill-authoring (3 passed, 3 failed), with the already reproduced HTTPS remote .git identity mismatch. This is a pre-existing, separately scoped blocker, not a Design regression.
- Permanent new regression tests, Design implementation and post-change verification: NOT RUN until approved plan. Filesystem symlink and actual parent mutation cases remain to be tested; no result is assumed.

## Requirements

- R-001 - Decouple experience kind from semantic repository ownership using registry roles and scopes; support enterprise modules, portal shells/composition, cross-module experiences, standalone websites/apps and component/design-system libraries.
- R-002 - Separate structural validation, actual approved-parent verification, Design approval/review state and applicable rendered/interaction evidence. Verified consumers must fail closed without source or verification infrastructure.
- R-003 - Derive required responsive surfaces and evidence from verified approved requirements and the target; distinguish designed behavior from rendered and interacted observations, with reasoned not-applicable outcomes.
- R-004 - Allow authorized exploratory drafts without approved parents while preventing their use as approved implementation contracts; route new or material scope changes to the existing decision/approval owner.
- R-005 - Preserve existing design first, editable source primacy, generated-versus-product image provenance, source-backed confirmed component/path mappings, and Visual Companion feedback without approval authority.
- R-006 - Enforce canonical paths, extensions, containment and complete artifact closure; verify distinct module sources and current provenance for cross-module references without duplicate editable ownership.
- R-007 - Use one documented evolving schema, explicit read-only legacy compatibility and document-derived payloads exercised through real Angular, Next.js and generic consumers.
- R-008 - Keep the change limited to the Design handoff contract; preserve simplify results and immutable artifacts, sync mirrors through existing scripts, report actual checks, and stop after this step.

## Decisions

- D-001 through D-003 record explicit requirements from the user, not approval of this draft. Complete typed decision fields appear in spec_context.
- Proposed compatibility design for this spec: schema version 2 for new verified handoffs; retain a named, read-only version 1 adapter/structural validator. Legacy conversion cannot manufacture approval, freshness, source reads or evidence. Revalidation and any required approval apply only to the touched handoff.

## Assumptions

- A-001: simplify content is the dependency baseline. Its delivery record is .sdcorejs/docs/workflow/2026-09-22-13-00-simplify-contract-hardening-delivery.md. The separate requested simplify commit remains pending current Git/readiness gates; approving this spec does not waive them.

## Architecture gate classification

- Required: cross-module/repository ownership, shared consumer API and approval/evidence trust boundaries. Architecture follows spec approval; this draft does not substitute for that artifact.

## Non-goals

- No new public skill, whole-workflow rewrite, production UI, dependency installation, bulk historical migration, immutable snapshot edit, unrelated authoring fix or automatic commit/push of Design changes. Stop after the requested Design contract step.

## Architecture

- Keep repository roles and ownership scopes in the existing registry. Resolve an explicit semantic owner separately from experience kind. Cross-module composition references distinct module sources; it never moves module authority to an available portal or duplicates editable artifacts.
- Keep pure structural validation as an explicitly limited API. Add one fully verified handoff path that loads actual spec/plan sources through the existing artifact loader/verifier infrastructure, verifies identity/kind/revision/hash/parent graph/change relationship, verifies Design approval authority and checks applicable evidence. A caller-supplied digest or previously returned portable PASS is insufficient.
- Derive applicability from verified requirements plus target. Record responsive behavior design separately from rendered and interaction observations. Missing required evidence is a gap; a reasoned not-applicable result is allowed only where the governing requirements permit it.
- Permit explicitly authorized exploratory drafts with no approved parents and a clear non-implementation state. New or material scope changes return to the existing decision/approval owner; small spacing changes within already approved authority do not acquire a blanket extra gate.
- Keep editable source as primary; retain existing design reuse and candidate/confirmed distinctions. Verify source and screenshot/export provenance against content and owner evidence. Use existing snapshot/hash/receipt facilities where applicable; do not mint fake observations or equate generated mockups with real-product captures.
- Reuse canonical path classification for every document/asset/ledger, then enforce owner-root and real-path containment at filesystem boundaries. Validate the whole bundle and cross-repository closure, including decisions, wireframes, exports and the ledger; diagnostic paths cannot conceal durable content.
- Integrate the verified path into the existing Angular, Next.js and generic execution entrypoints when the implementation contract requires a Design handoff. Missing handoff or missing verification infrastructure blocks that requirement; non-UI work and existing explicitly limited prototype authority retain their proper scope. Portable records carry limitations and are reverified by the receiving consumer.

## Stack profile and technology assumptions

- Track: workflow. Profile: node-general, supported by package.json and existing executable .mjs contracts. Authoring uses the existing npm scripts and installed yaml dependency; no toolchain/dependency changes are proposed.
- Local verification uses Node 24.19.0 and npm 10.9.2, satisfying the repository engines. Deterministic tests use local fixtures; live provider, real target UI and visual/interaction runs are NOT RUN unless separately required and authorized.

## File structure

- Existing canonical owners: skills/tracks/design/sdcorejs-design.md; _refs/shared/design-handoff.md and .mjs; _refs/shared/artifact-paths.md and .mjs; _refs/shared/repository-contract.mjs. Extend only the boundary needed for this contract.
- Existing consumers: _refs/angular/execution-contract.mjs, _refs/nextjs/execution-contract.mjs, _refs/orchestration/execution-contract.mjs and corresponding Angular/Next.js/execute-plan skill instructions.
- Existing tests: test/e2e/design-handoff-contract.test.mjs, artifact-path-convention.test.mjs, project-context-artifact-lifecycle.test.mjs, angular-production-contract.test.mjs, nextjs-production-contract.test.mjs and the generic execution contract tests selected by actual call graph. Add a document-derived shared fixture only if needed.
- Reuse approved-artifact, registry, artifact lifecycle and snapshot/evidence helpers. Any necessary bounded supporting-file change must be declared in the approved plan; this spec is not an open-ended file allowlist.
- Generate affected .claude, codex and plugin mirrors only through npm run sync:skills. Include only derived communication-economy metric cells in VALIDATION.md if the existing report requires updates. Exact files and evidence mappings belong to the plan.
- Draft, approved spec/architecture/plan and a scoped delivery record belong to .sdcorejs workflow/architecture paths through their existing owners. Existing approved artifacts stay immutable.

## Acceptance criteria

- AC-001 (R-001) - Registry-based ownership matrix: Valid module, portal shell/composition, standalone and library cases resolve to their real owner; missing/unwritable module owners block without portal fallback.
- AC-002 (R-002) - Parent authenticity and freshness: Missing, mutated, stale, wrong-kind, foreign-identity or unrelated-change spec/plan parents fail verified handoff; actual reads and canonical graph verification succeed for the positive control.
- AC-003 (R-002) - Independent verification layers: A structurally valid payload, self-declared hash or review label never supplies approval or rendered evidence; unavailable loaders/verifiers produce explicit blockers/limitations.
- AC-004 (R-003) - Responsive applicability: Required surfaces missing evidence fail the evidence gate; justified non-required surfaces can be not-applicable; designed behavior alone cannot satisfy rendered/interaction requirements.
- AC-005 (R-004) - Draft and change lifecycle: An authorized parentless draft remains editable but is rejected as an approved implementation contract; material changes route to the approval owner, while bounded spacing within existing authority adds no universal ceremony.
- AC-006 (R-005) - Source and image provenance: Generated mockups cannot satisfy real-product screenshot requirements; stale or absent source evidence prevents confirmed components/paths; editable source remains primary.
- AC-007 (R-006) - Canonical paths and physical containment: Wrong extension/depth, traversal, absolute paths, wrong repository roots and applicable symlink escape are rejected before reading or writing outside the owner.
- AC-008 (R-006) - Cross-module identity and freshness: Cross-module contracts requiring multiple modules need verified distinct module sources; duplicate modules, missing revision/provenance and stale source content cannot pass.
- AC-009 (R-006) - Full artifact closure: Flow, spec, decisions, editable wireframes, exports, screenshot references when present and the ledger are retained in the same-owner closure; diagnostic traversal cannot hide a durable artifact as local-only.
- AC-010 (R-007) - Actual consumer enforcement: Documented positive and negative payloads go through the helper and existing Angular, Next.js and generic execution entrypoints; these callers cannot accept draft, legacy-unverified or stale handoffs when verified handoff is required.
- AC-011 (R-007) - Schema compatibility: New payloads share the documented canonical schema; explicit legacy reads remain unverified, unknown versions fail closed, and no immutable approved snapshot is migrated in place.
- AC-012 (R-008) - Verification and scope discipline: Focused contracts, relevant schema/path/lifecycle/consumer checks, hygiene, executable refs, public inventory and mirror checks run with actual PASS/FAIL/NOT RUN results; no new public skill, dependency, Design commit/push or unrelated refactor occurs.

## Verification expectations

- First add failing regression cases on the unchanged baseline, then test the same documented payloads through helpers and actual consumers. Retain paired positive controls and report findings no longer reproducible.
- Run focused Design/owner/path/approved-artifact/lifecycle/Angular/Next.js/generic contracts and affected simplify integration checks. The plan will bind exact commands and task/evidence mappings; failures remain visible.
- Run npm run test:e2e:artifact-paths, npm run test:e2e:angular, npm run test:e2e:nextjs, npm run test:e2e:skill-authoring, npm run test:e2e:uiux, node authoring/evals/run-deterministic.mjs, npm run check:text-hygiene, npm run check:executable-references, npm run sync:skills and npm run check:skills as relevant final gates. Verify registry/schema compatibility and the 23-skill/internal-nondistribution invariant.
- Report deterministic and focused results separately from full repository E2E, golden target apps and live provider/rendered evidence. Anything not executed is NOT RUN; a baseline failure is not relabeled PASS.

## Risks & mitigations

- Shared owner/path helpers could alter Product or other consumers: preserve existing semantics and run positive/negative regression controls for those callers.
- A permissive legacy adapter could launder draft authority: its result remains explicitly unverified, and consumers require the fully verified entrypoint.
- Revision-only freshness misses working-tree changes: bind verification to actual loaded content and source provenance, and reject missing or stale evidence.
- New test cost and the existing authoring blocker can prevent clean delivery: record actual outcomes without editing immutable artifacts or silently expanding repair scope.

## Out of scope (deferred)

- Full Design quality/visual redesign, historical handoff migration and unrelated simplify/authoring repairs require separately scoped work. The already authorized simplify commit is a separate Git operation pending its readiness gates.

## Typed spec context

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: design-handoff-contract-20260923
  requirement_id: design-handoff-hardening-user-request
  approved_spec_path: null
  approved_spec_hash: null
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  track: workflow
  stack_profile: node-general
  profile_confidence: high
  source_requirement_context: Explicit Design handoff task in this conversation; branch destination explicitly approved.
  acceptance_criteria_count: 12
  manual_criteria_count: 0
  non_goals:
    - New public skills or a replacement SDLC workflow
    - Production UI or a complete skill-pack refactor
    - Dependency installation, historical bulk migration or approved snapshot mutation
    - Automatic Design commit/push and credentialed live-provider runs
    - Unrelated authoring URL-identity bug repair
  risks:
    - Shared owner/path and executor changes can affect non-Design consumers.
    - Legacy payloads intentionally lose any implied verified/approved interpretation.
    - Existing simplify Git-readiness failures remain separate blockers.
  assumptions:
    - A-001
  redaction_applied: false
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
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
    rationale: The handoff crosses repository and module ownership and establishes approval/evidence trust
      boundaries used by multiple execution consumers.
    blockers: []
    blocker_messages: []
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Decouple experience kind from semantic repository ownership using registry roles and scopes;
          support enterprise modules, portal shells/composition, cross-module experiences, standalone
          websites/apps and component/design-system libraries.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: Separate structural validation, actual approved-parent verification, Design approval/review state
          and applicable rendered/interaction evidence. Verified consumers must fail closed without source or
          verification infrastructure.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: Derive required responsive surfaces and evidence from verified approved requirements and the
          target; distinguish designed behavior from rendered and interacted observations, with reasoned
          not-applicable outcomes.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: Allow authorized exploratory drafts without approved parents while preventing their use as approved
          implementation contracts; route new or material scope changes to the existing decision/approval
          owner.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Preserve existing design first, editable source primacy, generated-versus-product image provenance,
          source-backed confirmed component/path mappings, and Visual Companion feedback without approval
          authority.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: Enforce canonical paths, extensions, containment and complete artifact closure; verify distinct
          module sources and current provenance for cross-module references without duplicate editable
          ownership.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: Use one documented evolving schema, explicit read-only legacy compatibility and document-derived
          payloads exercised through real Angular, Next.js and generic consumers.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-008
        type: requirement
        statement: Keep the change limited to the Design handoff contract; preserve simplify results and immutable
          artifacts, sync mirrors through existing scripts, report actual checks, and stop after this step.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Registry-based ownership matrix
        behavior: Registry-based ownership matrix
        expected_result: Valid module, portal shell/composition, standalone and library cases resolve to their real
          owner; missing/unwritable module owners block without portal fallback.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Parent authenticity and freshness
        behavior: Parent authenticity and freshness
        expected_result: Missing, mutated, stale, wrong-kind, foreign-identity or unrelated-change spec/plan parents
          fail verified handoff; actual reads and canonical graph verification succeed for the positive
          control.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Independent verification layers
        behavior: Independent verification layers
        expected_result: A structurally valid payload, self-declared hash or review label never supplies approval or
          rendered evidence; unavailable loaders/verifiers produce explicit blockers/limitations.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Responsive applicability
        behavior: Responsive applicability
        expected_result: Required surfaces missing evidence fail the evidence gate; justified non-required surfaces
          can be not-applicable; designed behavior alone cannot satisfy rendered/interaction requirements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: Draft and change lifecycle
        behavior: Draft and change lifecycle
        expected_result: An authorized parentless draft remains editable but is rejected as an approved implementation
          contract; material changes route to the approval owner, while bounded spacing within existing
          authority adds no universal ceremony.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: Source and image provenance
        behavior: Source and image provenance
        expected_result: Generated mockups cannot satisfy real-product screenshot requirements; stale or absent source
          evidence prevents confirmed components/paths; editable source remains primary.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Canonical paths and physical containment
        behavior: Canonical paths and physical containment
        expected_result: Wrong extension/depth, traversal, absolute paths, wrong repository roots and applicable
          symlink escape are rejected before reading or writing outside the owner.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Cross-module identity and freshness
        behavior: Cross-module identity and freshness
        expected_result: Cross-module contracts requiring multiple modules need verified distinct module sources;
          duplicate modules, missing revision/provenance and stale source content cannot pass.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-009
        type: acceptance-criterion
        statement: Full artifact closure
        behavior: Full artifact closure
        expected_result: Flow, spec, decisions, editable wireframes, exports, screenshot references when present and
          the ledger are retained in the same-owner closure; diagnostic traversal cannot hide a durable
          artifact as local-only.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-010
        type: acceptance-criterion
        statement: Actual consumer enforcement
        behavior: Actual consumer enforcement
        expected_result: Documented positive and negative payloads go through the helper and existing Angular, Next.js
          and generic execution entrypoints; these callers cannot accept draft, legacy-unverified or stale
          handoffs when verified handoff is required.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-011
        type: acceptance-criterion
        statement: Schema compatibility
        behavior: Schema compatibility
        expected_result: New payloads share the documented canonical schema; explicit legacy reads remain unverified,
          unknown versions fail closed, and no immutable approved snapshot is migrated in place.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-012
        type: acceptance-criterion
        statement: Verification and scope discipline
        behavior: Verification and scope discipline
        expected_result: Focused contracts, relevant schema/path/lifecycle/consumer checks, hygiene, executable refs,
          public inventory and mirror checks run with actual PASS/FAIL/NOT RUN results; no new public skill,
          dependency, Design commit/push or unrelated refactor occurs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs: []
      - id: A-001
        type: assumption
        statement: The checked-out simplify work is the dependency baseline for this Design change, although it has
          not yet passed Git handoff readiness.
        source: explicit
        confidence: high
        status: confirmed
        blocking: false
        evidence_refs:
          - EVIDENCE-BASELINE-SIMPLIFY-DELIVERY
        consequence_if_wrong: Design could overwrite or fail to preserve the approved simplify work.
        validation_method: Preserve the scoped working-tree manifest and recheck simplify integration tests after
          shared consumer changes.
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
        downstream_refs: &a1
          - R-001
          - AC-001
        task_refs: []
        validation_boundary:
          kind: authorization
          source_refs: *a1
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
        downstream_refs: &a2
          - R-002
          - R-003
          - R-004
          - AC-002
          - AC-003
          - AC-004
          - AC-005
        task_refs: []
        validation_boundary:
          kind: authorization
          source_refs: *a2
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
        rationale: The user explicitly forbids a new public skill, wholesale workflow replacement, dependency
          installation and immutable snapshot edits.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a3
          - R-007
          - R-008
          - AC-010
          - AC-011
          - AC-012
        task_refs: []
        validation_boundary:
          kind: authorization
          source_refs: *a3
      - id: INV-001
        type: invariant
        statement: Preserve user-owned simplify content, immutable approved snapshots, module ownership, editable
          source primacy, the 23-skill public inventory and existing approval authority.
        protected_refs:
          - R-001
          - R-004
          - R-005
          - R-008
          - AC-012
        task_refs: []
        evidence_refs: []
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
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    stage: spec
    future_gaps:
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-001.task_refs
        record_id: AC-001
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-002.task_refs
        record_id: AC-002
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-003.task_refs
        record_id: AC-003
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-004.task_refs
        record_id: AC-004
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-005.task_refs
        record_id: AC-005
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-006.task_refs
        record_id: AC-006
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-007.task_refs
        record_id: AC-007
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-008.task_refs
        record_id: AC-008
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-009.task_refs
        record_id: AC-009
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-010.task_refs
        record_id: AC-010
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-011.task_refs
        record_id: AC-011
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-012.task_refs
        record_id: AC-012
        message: an acceptance criterion must map to at least one planned task
      - code: INVARIANT_EVIDENCE_TRACE_MISSING
        path: records.INV-001.evidence_refs
        record_id: INV-001
        message: an invariant must trace to at least one evidence reference
      - code: INVARIANT_TASK_TRACE_MISSING
        path: records.INV-001.task_refs
        record_id: INV-001
        message: an invariant must trace to at least one enforcing task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-001.task_refs
        record_id: R-001
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-002.task_refs
        record_id: R-002
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-003.task_refs
        record_id: R-003
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-004.task_refs
        record_id: R-004
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-005.task_refs
        record_id: R-005
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-006.task_refs
        record_id: R-006
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-007.task_refs
        record_id: R-007
        message: a requirement must map to at least one planned task
      - code: REQUIREMENT_PLAN_COVERAGE_MISSING
        path: records.R-008.task_refs
        record_id: R-008
        message: a requirement must map to at least one planned task
```

## Artifact lifecycle

```yaml
artifact_context:
  change_ref: design-handoff-contract-20260923
  source_spec: none
  source_plan: none
  required_with_change:
    - path: .sdcorejs/docs/workflow/2026-09-23-10-20-design-handoff-contract-spec.md
      kind: execution-doc
      reason: Reviewable Design handoff spec draft for this change.
  shared_owned: []
  conditional: []
  local_only: []
  unrelated_observed: []
```
