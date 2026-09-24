---
approval_response: "1"
approval_source: explicit-user-choice
approved_at: 2026-09-23T10:34:32.714Z
approved_by: current-user
artifact_id: architecture-ui-review-contract-20260923-r1
artifact_kind: architecture
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: ui-review-contract-20260923
commit_policy: with-change
contract_id: ui-review-contract-20260923
description: Approved ownership and evidence architecture for Design and
  implemented UI reviews.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
name: ui-review-contract
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497
    artifact_id: spec-ui-review-contract-20260923-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-09-23-17-25-ui-review-contract-architecture.md
source_plan: none
source_revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
source_spec: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:e34f970eb82fada628bce8c7fdd655d3ac9511bb7b949d3727a76c65ba8fcb52
---

# Architecture — Design and implemented UI review

Status: approved by the current user with response 1. Parent spec is verified. Implementation requires the separate approved plan.

## Shared decisions

1. Use purpose values `design-artifact` and `implemented-ui-conformance` in the existing review contract; add a versioned `ui_review` extension. Keep the current dimensions, schema-1 ordinary-review compatibility and public skill inventory.
2. One private verifier is called by Review and its consumers. It reuses canonical approved-artifact and evidence verification, the verified Design path, and repository observation primitives. A minimal read-only observation extraction is permitted if reuse requires it; simplify limits, state ledger, grants, rollback and recursion behavior remain unchanged.
3. The trusted host observes purpose/scope authorization, author-versus-reviewer context provenance, target identities and before/after repository state. A separate reviewer context is used when available; missing isolation is disclosed, not replaced by a different-provider requirement or invented evidence. A required isolation constraint cannot pass without actual isolation.
4. Retain separate structural validation, assessment completion, conformance, independence and source/rendered/interaction results. Source inspection cannot prove runtime rendering/interaction. A wireframe or generated mockup cannot substitute for a real product capture.
5. Bind every applicable obligation to screen/state/viewport, content/source/build identity, baseline/requirement references and actual observed command/receipt. Same HEAD never makes changed content current. Missing design allows scoped assessment with unavailable or justified not-applicable conformance. No fabricated baseline.
6. Review findings retain the current schema. Aesthetic preferences remain advisory; a supported approved behavior/invariant violation remains conformance; missing evidence is a verification gap. Schema-valid/reviewed status alone never means there is no blocker.
7. Approved plan/validation applicability defines required evidence and authorized review, with no universal new gate. Angular, Next.js and generic frontend call the same verifier; stack-specific checks do not fork semantics. Required gaps reach ship; deferral uses existing authority/risk policy. An explicit requirement for evidence does not silently authorize running missing tests or independent review.
8. Review is read-only. The executor/repair owner may write only with current authority; its writes invalidate affected receipts and assessment. Reverification does not restart simplify. Runtime reports stay in memory unless a separate persistence action is authorized.
9. Preserve all prior approvals and historical UI/UX evidence. Append a new current record for this step and validate both history and current provenance; old records do not remain current merely because they once passed.

Design-artifact review may assess a candidate or exploratory draft against its actual authorized requirements without requiring that candidate to be already approved or independently reviewed. The assessment grants no implementation authority. Implemented-UI conformance, in contrast, verifies the approved Design baseline or explicit authorized visual contract through its actual owner and artifact sources. Keep that distinction in the entrypoint so review cannot require its own completed approval as a precondition or manufacture a receipt to satisfy the cycle.

Review authorization and evidence applicability are separate. Approved requirements can make evidence mandatory without authorizing a test run or an independent review invocation. Existing ordinary review payloads remain structurally readable; a legacy declaration of read-only mode is not an observed no-write proof. Verified UI consumers require host-observed provenance and current assessment, not compatibility fields or caller flags.

## Ownership and trust

The authoring repository is the single standalone owner. Runtime target owners continue to resolve through the registry/repository contracts; the execution host is never an owner fallback. Cross-repository integration rows are empty because this task changes one repository. The architecture owner selector's existing integration-owner API is used only as a checked compatibility projection of the repository-level owner. It does not assert cross-repository work or change that helper's enum.

The approved architecture path is recorded below. Its canonical approval hash is returned in the runtime envelope outside the hashed body to avoid a self-reference. The final context and pre-plan handoff are verified against the actual approved parent.

## Proof and limits

The four obligations below cover all 16 approved ACs. They use offline fixtures for action popover, mobile table selection and a standalone responsive page. Browser/rendered/interaction execution and live/provider services remain NOT RUN for this repository task. Exact files, schema fields, commands, case IDs, task order and allowed writes belong to the implementation plan after architecture approval.

```yaml
architecture_context:
  schema_version: 1
  source: sdcorejs-architecture
  contract_id: ui-review-contract-20260923
  requirement_id: R-001
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-ui-review-contract-20260923-r1
    artifact_kind: spec
    revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
    approval_hash: sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md
  approved_architecture_hash: null
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  trigger:
    required: true
    signals:
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    rationale: This change crosses review/test/executor/repair/ship payloads and changes which observed
      evidence and actor authority can establish UI conformance. It retains existing workflow owners
      and uses a bounded architecture contract after spec approval.
  invariants:
    - id: INV-001
      statement: Preserve approved artifacts, user-owned content, existing review dimensions and 23 public
        skills; never fabricate evidence, expand repair authority, or perform prohibited
        live/Git/dependency actions.
      scope: Design/Test/Review/executor/repair/ship UI contracts
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Evidence, assessment, approval and source-write authority remain distinct across every
        consumer.
      verification_method: Offline positive/negative payload-to-helper-to-consumer fixtures; snapshot
        diffs; immutable artifact/hash verification; existing compatibility and mirror checks.
      requirement_refs:
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
      decision_refs:
        - D-001
        - D-002
        - D-003
  boundaries:
    - id: review-assessment
      statement: Review assesses only the authorized purpose, dimensions and file/topic scope. It reads
        evidence and never runs capture/tests, repairs source or persists artifacts without the
        relevant separately scoped authority.
      invariant_refs: &a1
        - INV-001
    - id: evidence-production
      statement: Test/host runners own actual source observations, capture and interaction receipts.
        Design owns editable artifacts/self-critique. Executors and the existing repair-loop own
        authorized implementation changes.
      invariant_refs: *a1
  dependency_directions:
    - from: review/validation/frontend/repair/ship consumers
      to: one private UI review verifier
      rationale: Shared semantics prevent stack-specific acceptance or stale evidence bypasses.
      invariant_refs: *a1
    - from: private UI review verifier
      to: approved-artifact/evidence/Design verification and repository observation primitives
      rationale: Reuse trusted content and authority checks; do not duplicate the approval algorithm or
        route UI review through simplify.
      invariant_refs: *a1
  data_state_owners:
    - subject: Design source and author self-critique
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      runtime_owner: sdcorejs-design in the semantic target owner
      invariant_refs: *a1
    - subject: capture/interaction receipts and current repository observations
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      runtime_owner: sdcorejs-test and trusted host adapters
      invariant_refs: *a1
    - subject: independent assessment, classified findings and verification gaps
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      runtime_owner: sdcorejs-review; runtime-only unless persistence is authorized
      invariant_refs: *a1
    - subject: implementation repair and evidence invalidation
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      runtime_owner: approved executor or sdcorejs-repair-loop
      invariant_refs: *a1
  public_contracts:
    - id: review-purpose-contract
      kind: api
      owner: sdcorejs-review shared contract
      statement: An optional versioned ui_review extension and explicit purpose enrich the current review
        schema. Assessment completion, structural validity, independent-context limitation,
        conformance verdict and source/rendered/interaction coverage remain separate.
      compatibility: Keep ordinary schema-1 reviews readable and preserve dimensions/status fields. Legacy
        UI notes are unverified; unknown or contradictory UI extensions fail closed. No public skill
        or dimension is added.
      migration: Opt in through new approved applicability and caller integration. Do not bulk-migrate
        approved history, rewrite old evidence or infer verified UI proof from legacy reviewed
        status.
      invariant_refs: *a1
  security_trust_boundaries:
    - id: host-evidence-authority
      statement: A trusted runtime reads actual pinned approved parents/visual contracts and current
        source/build content. It resolves observed receipts with the canonical verifier. Caller
        strings, hashes, empty write lists, PASS labels and declared author/reviewer identities
        alone cannot prove approval, independence, read-only behavior or evidence freshness.
      invariant_refs: *a1
    - id: read-only-and-persistence
      statement: Before/after host observations detect source and unauthorized artifact writes, including
        undeclared paths. Missing observation is a limitation, not read_only_proven. Read-only
        review runs no write/capture/repair callback; explicitly authorized report persistence is a
        separate bounded owner action.
      invariant_refs: *a1
  cross_repository_integration: []
  adopted_decision_refs:
    - D-001
    - D-002
    - D-003
  deferred_decision_refs: []
  assumption_refs: []
  validation_obligations:
    - id: VAL-001
      expected_proof: Purpose, self-critique/independent-review distinction, read-only actual
        writes/persistence, missing baseline and narrow dimensions survive the documented
        payload-to-consumer path.
      owner: workflow contract fixtures
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-001
        - AC-002
        - AC-007
        - AC-010
        - AC-011
    - id: VAL-002
      expected_proof: Source-only and mockup evidence cannot satisfy rendered/interaction requirements.
        Target mismatches, missing receipts and content edits at the same HEAD become verification
        gaps/stale evidence.
      owner: test/Review evidence fixtures
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-003
        - AC-004
        - AC-005
        - AC-006
    - id: VAL-003
      expected_proof: Aesthetic stays advisory; approved requirement/invariant violations retain
        conformance gates; authorized owner repairs invalidate evidence; required gaps and
        policy-bound deferrals reach ship.
      owner: finding/repair/ship consumer fixtures
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-008
        - AC-009
        - AC-012
        - AC-013
    - id: VAL-004
      expected_proof: Three offline smoke fixtures, legacy compatibility, append-only current authoring
        evidence, immutable history, 23 public skills and relevant checks remain verified without
        live services or dependency changes.
      owner: authoring and integration verification
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-014
        - AC-015
        - AC-016
  profile_sections:
    frontend_architecture_ref: null
    agent_architecture_ref: null
  change_control:
    revision: 1
    supersedes: null
```

## Approval and review provenance

Approved as drafted with response 1 to the architecture approval choice. Separate read-only architecture review found no actionable findings and covered all 16 ACs; that review did not execute product UI checks. Only approval lifecycle projections changed. Plan approval remains required.
