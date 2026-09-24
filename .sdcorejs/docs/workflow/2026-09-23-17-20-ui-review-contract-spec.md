---
artifact_id: ui-review-contract-20260923-spec-draft-r1
artifact_kind: execution-doc
change_ref: ui-review-contract-20260923
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
name: ui-review-contract-spec
description: Draft requirements for Design artifact review and implemented UI
  conformance in the existing review workflow.
track: workflow
status: draft
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
repository_relative_path: .sdcorejs/docs/workflow/2026-09-23-17-20-ui-review-contract-spec.md
source_revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
---

# Spec — Design and implemented UI review contract

Status: draft awaiting explicit approval. This document authorizes no implementation.

## Outcome and boundaries

Add two purposes to sdcorejs-review: design-artifact review before implementation, and implemented-ui-conformance after implementation. Design still owns artifacts/self-critique; Review owns independent assessment; Test owns capture/execution; the authorized executor or repair-loop owns writes. A separate reviewer context is used when available; a different model/provider is not required. An unavailable reviewer context is an explicit limitation, not fabricated independence.

Keep current review dimensions and narrow file/topic scope. No new public skill, screenshot skill, automatic independent review, or universal approval gate. Existing Design, simplify, generated mirror and owner contracts remain authoritative. Test fixtures are offline; no product repository, browser installation, paid/live service, commit or push is in scope.

## Verified checkout baseline

- Clean starting checkout: 1054c8180f15b140c7224e48d0f21514c5787ab8 on codex/simplify-design-handoff, containing the previous two steps.
- Temporary deterministic probes reproduce acceptance of rendered/interaction findings without a capture/run receipt; a source-only finding can contain an unsupported rendered PASS statement; same-HEAD evidence with different content fingerprints is not marked stale by ordinary review; generic persistence is not considered by read_only_proven when write_actions is empty. These are helper acceptance/coverage gaps, not observations of a real UI bug or actual unauthorized filesystem write.
- Existing aesthetic blocking, unrequested dimensions and declared source-write guards reject their negative probes. A stale revision already produces a High finding even though the outer status remains reviewed; completion and clean verdict must remain distinct.
- npm run test:e2e:uiux: FAIL, 26 passed / 1 failed. The current integration record has stale _refs/shared/evidence-artifact.mjs bytes after the prior EOF hygiene change. Preserve that record and add new current evidence for this step; do not rewrite history.
- Angular input-analysis and the executor tail still say “Fix obvious UI issues” without carrying review-only authority into that sentence. The change must make the executor/repair boundary explicit, not remove authorized implementation self-checks.
- An independent reviewer context using the same available model evaluated the three requested scenario shapes against unchanged instructions. It confirmed that source-only limits, self-critique separation, narrow review and mockup limitations already exist in prose. It did not establish rendered/interaction behavior or automated reviewer independence. This step must enforce and integrate those rules rather than replace the workflow.

## Contract and compatibility

Use purpose values design-artifact and implemented-ui-conformance in the existing review structure. Keep source inspection, rendered capture and interaction execution as distinct evidence kinds. For each applicable obligation, retain screen/state/viewport, verified baseline or missing-baseline reason, source/build/content identity, actual command/run/artifact provenance, and freshness. Consume approved parents through the current Design verifier; an explicit visual contract must resolve through its existing decision/approval owner. A hash-shaped string, caller PASS, mockup or review-completed status cannot establish conformance.

Independent review is requested or workflow-authorized. Its requiredness and required rendered/interaction checks come from approved requirements/plan validation applicability. Missing design permits an ordinary scoped review; report unavailable or justified not-applicable conformance. Required evidence gaps remain visible to ship, and only the current authority/risk policy can defer them. No fallback invents a baseline or requires new Design work merely to review existing code.

Findings retain the existing locator, evidence, impact, severity/gate, repair tier and suggested action. Pure preferences remain advisory and cannot auto-repair. A demonstrated approved requirement/invariant violation remains a conformance issue. Missing evidence is a verification gap. Read-only execution and persistence need observed bounds, not just a caller's empty action list. Any authorized repair invalidates affected evidence and returns to focused verification; it does not trigger simplify again.

Legacy ordinary review payloads remain readable. They are not silently upgraded to verified UI evidence. The implementation plan will pin the versioned UI extension and adapter behavior, and will include actual consumer calls rather than an unused helper. Historical approvals, Design handoffs and authoring evidence remain unchanged; any new current evidence must bind actual final source content.

## Acceptance criteria

- **AC-001 — Separate author self-critique from independent assessment.** Self-critique cannot satisfy a required independent review. A separate reviewer context is used when supported; otherwise the report preserves the limitation and cannot claim that the required separation ran. A different model/provider is not required.
- **AC-002 — Select an explicit existing-review purpose.** Design-artifact review traces requirements/AC to flows/screens/states/copy/responsive/accessibility/component mappings. Implemented-UI conformance compares actual implementation with a verified approved design or an explicit authorized visual contract. Ordinary review remains supported.
- **AC-003 — Prevent source inspection from proving rendering or interactions.** Source-only evidence cannot yield rendered or interaction PASS for clipping, actual contrast, responsive rendering, focus behavior, or keyboard flow; missing evidence is a verification gap, not an observed defect.
- **AC-004 — Reject a mockup as proof of implemented UI.** Generated/static mockups and wireframe renders remain distinct from real product captures; substitution fails closed.
- **AC-005 — Bind UI evidence to its actual target and content.** Missing or mismatched owner, screen, state, viewport, command/run, source/build/content identity or observed artifact provenance cannot satisfy a required check. No caller-supplied PASS or hash alone establishes verified evidence.
- **AC-006 — Invalidate affected capture and review evidence after implementation changes.** An actual source edit at the same HEAD makes relevant capture/review evidence stale. A fresh focused run and reassessment restore only the proof they actually establish.
- **AC-007 — Review without inventing a design baseline.** Missing design still permits scoped source/UI assessment. Design conformance is unavailable when a relevant baseline is missing, or not-applicable with a valid reason when no comparison applies. Neither state fabricates an approved baseline or forces new Design work.
- **AC-008 — Keep pure aesthetic preferences advisory.** Aesthetic preference cannot be blocking, auto-repairable, or write-authorizing. Existing aesthetic and narrow-dimension controls continue to pass.
- **AC-009 — Preserve approved requirements and invariants as conformance obligations.** A demonstrated approved behavior/invariant violation cannot be reclassified as aesthetic to avoid its gate. Missing observation remains a verification gap with locator, evidence, impact, severity/gate, repair tier and suggested action.
- **AC-010 — Keep review read-only through actual execution and persistence.** Direct review changes no source and persists no report/artifact without applicable authority. Declarations alone do not prove no writes; trusted before/after observation must catch writes omitted from declarations.
- **AC-011 — Preserve narrow scope and existing dimensions.** A security/accessibility or otherwise narrow review retains its requested dimensions, files and topics and never expands to ALL or unrelated UI work.
- **AC-012 — Consume review obligations across the real workflow.** Angular, Next.js and generic frontend consumers share purpose/evidence semantics; stack checks are additive only. Plan/validation applicability controls required checks. Required UI/design gaps reach ship, and deferral requires the existing authority/risk policy. Review completed or schema valid never means blocker-free.
- **AC-013 — Route authorized repairs to their owner and invalidate evidence.** Review-only UI checks cannot silently fix source. Any permitted repair uses the existing owner/scope contract, invalidates affected UI evidence and does not restart simplify after repair.
- **AC-014 — Exercise three bounded smoke fixtures and their negative mutations.** Action popover, mobile table selection, and standalone responsive page scenarios exercise documented payload -> helper -> consumer, including positive evidence, missing/stale evidence and scope/authority mutations. Fixtures do not modify product repositories or claim live rendering.
- **AC-015 — Preserve schema compatibility and historical approval/evidence.** Legacy ordinary reviews stay readable but do not acquire verified UI proof. Unknown or contradictory UI payloads fail closed. Approved artifacts and prior evidence records remain unchanged; new current authoring evidence is separately recorded and independently checked.
- **AC-016 — Complete focused verification and mirror synchronization.** Relevant regression, authoring/UIUX, consumer, schema, mirror, hygiene and executable-reference commands have actual PASS/FAIL/NOT RUN results. Public skill count remains 23; no dependency/browser installation, live/paid service, commit or push occurs.

## Candidate implementation surfaces and verification

Canonical Review, Design, Test, plan/validation, Angular input-analysis/executor, Next.js executor, generic execution, repair and ship contracts; a private shared UI review reference/helper; their existing regression suites and fixture support; authoring UI/UX current-evidence selection; generated mirrors and the scoped delivery record. Exact allowed paths and task order belong to the next approved plan.

Extend existing test files where practical so package.json does not need a new public surface. Three smoke fixtures cover action popover, mobile table selection and a standalone responsive page, including mutations for missing design, mockup substitution, same-HEAD content changes, context independence, read-only writes/persistence, narrow review and finding classification.

Expected checks: focused Node contract/consumer suites, npm run test:e2e:uiux, npm run test:e2e:skill-authoring, node authoring/evals/run-deterministic.mjs, npm run sync:skills, npm run check:skills, npm run check:text-hygiene, npm run check:executable-references, and diff hygiene. Fixture PASS is deterministic contract evidence only; actual browser/rendered/interaction and live/provider validation are NOT RUN in this repository task.

Architecture gate is required for shared payload, evidence trust and ownership boundaries. After spec approval, persist the approved spec and route through that bounded gate before implementation planning. No approved artifact is created by this draft.

## Machine-readable requirements and gate projection

The proposed decisions below remain proposed until approved. Missing task/evidence mappings are explicit future planning gaps, not execution readiness.

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: ui-review-contract-20260923
  requirement_id: ui-review-contract-20260923
  target_root: .
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  track: workflow
  stack_profile: markdown-skill-pack
  profile_confidence: high
  source_revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
  source_requirement_context: "Explicit user request: review Design before implementation and
    implemented UI after implementation, retaining public skills and existing authority boundaries."
  approved_spec_path: null
  approved_spec_hash: null
  supersedes: null
  acceptance_criteria_count: 16
  manual_criteria_count: 0
  non_goals:
    - New public skill or dimension
    - Whole-workflow refactor or automatic approval gates for every UI edit
    - Product repository edits
    - Browser/dependency installation or live/paid/provider execution
    - Commit, push, or immutable approved snapshot/history migration
  risks:
    - A schema-valid legacy review can be mistaken for verified UI conformance.
    - New fields can be dropped by downstream consumers unless tests traverse the complete payload
      path.
    - Current UI/UX authoring evidence already fails freshness at the checkout baseline.
  assumptions: []
  redaction_applied: true
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: New user-requested bounded step after simplify and Design handoff contracts.
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: This change crosses review/test/executor/repair/ship payloads and changes which observed
      evidence and actor authority can establish UI conformance. It retains existing workflow owners
      and uses a bounded architecture contract after spec approval.
    blockers: []
    blocker_messages: []
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Keep Design authoring/self-critique, independent Review assessment, Test
          execution/capture, and executor/repair writes separate, with no new public skills or
          review dimensions.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: Represent design artifact review and implemented UI conformance as explicit purposes of
          the existing review contract, preserving the requested scope and dimensions.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: Derive source, rendered, and interaction evidence claims from trusted, content-bound
          observations for the exact screen, state, viewport, owner, and applicable source/build
          identity.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: Reuse durable findings and repair authority; preserve approved behavior obligations,
          advisory aesthetic preferences, and honest verification gaps.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Integrate applicability and evidence requirements into approved planning/validation and
          existing frontend, repair, and ship consumers without automatic review or a new approval
          ceremony for every edit.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: Preserve compatibility, immutable approvals and historical evidence,
          exact-version/project reuse rules, and the completed simplify and Design handoff
          boundaries.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: Prove the contract with offline behavioral fixtures for action popover, mobile table
          selection, and a standalone responsive page, plus focused schema/mirror/hygiene checks.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Separate author self-critique from independent assessment.
        behavior: Separate author self-critique from independent assessment.
        expected_result: Self-critique cannot satisfy a required independent review. A separate reviewer
          context is used when supported; otherwise the report preserves the limitation and cannot
          claim that the required separation ran. A different model/provider is not required.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Select an explicit existing-review purpose.
        behavior: Select an explicit existing-review purpose.
        expected_result: Design-artifact review traces requirements/AC to
          flows/screens/states/copy/responsive/accessibility/component mappings. Implemented-UI
          conformance compares actual implementation with a verified approved design or an explicit
          authorized visual contract. Ordinary review remains supported.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Prevent source inspection from proving rendering or interactions.
        behavior: Prevent source inspection from proving rendering or interactions.
        expected_result: Source-only evidence cannot yield rendered or interaction PASS for clipping, actual
          contrast, responsive rendering, focus behavior, or keyboard flow; missing evidence is a
          verification gap, not an observed defect.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Reject a mockup as proof of implemented UI.
        behavior: Reject a mockup as proof of implemented UI.
        expected_result: Generated/static mockups and wireframe renders remain distinct from real product
          captures; substitution fails closed.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: Bind UI evidence to its actual target and content.
        behavior: Bind UI evidence to its actual target and content.
        expected_result: Missing or mismatched owner, screen, state, viewport, command/run,
          source/build/content identity or observed artifact provenance cannot satisfy a required
          check. No caller-supplied PASS or hash alone establishes verified evidence.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: Invalidate affected capture and review evidence after implementation changes.
        behavior: Invalidate affected capture and review evidence after implementation changes.
        expected_result: An actual source edit at the same HEAD makes relevant capture/review evidence
          stale. A fresh focused run and reassessment restore only the proof they actually
          establish.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Review without inventing a design baseline.
        behavior: Review without inventing a design baseline.
        expected_result: Missing design still permits scoped source/UI assessment. Design conformance is
          unavailable when a relevant baseline is missing, or not-applicable with a valid reason
          when no comparison applies. Neither state fabricates an approved baseline or forces new
          Design work.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Keep pure aesthetic preferences advisory.
        behavior: Keep pure aesthetic preferences advisory.
        expected_result: Aesthetic preference cannot be blocking, auto-repairable, or write-authorizing.
          Existing aesthetic and narrow-dimension controls continue to pass.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-009
        type: acceptance-criterion
        statement: Preserve approved requirements and invariants as conformance obligations.
        behavior: Preserve approved requirements and invariants as conformance obligations.
        expected_result: A demonstrated approved behavior/invariant violation cannot be reclassified as
          aesthetic to avoid its gate. Missing observation remains a verification gap with locator,
          evidence, impact, severity/gate, repair tier and suggested action.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-010
        type: acceptance-criterion
        statement: Keep review read-only through actual execution and persistence.
        behavior: Keep review read-only through actual execution and persistence.
        expected_result: Direct review changes no source and persists no report/artifact without applicable
          authority. Declarations alone do not prove no writes; trusted before/after observation
          must catch writes omitted from declarations.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-011
        type: acceptance-criterion
        statement: Preserve narrow scope and existing dimensions.
        behavior: Preserve narrow scope and existing dimensions.
        expected_result: A security/accessibility or otherwise narrow review retains its requested
          dimensions, files and topics and never expands to ALL or unrelated UI work.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-012
        type: acceptance-criterion
        statement: Consume review obligations across the real workflow.
        behavior: Consume review obligations across the real workflow.
        expected_result: Angular, Next.js and generic frontend consumers share purpose/evidence semantics;
          stack checks are additive only. Plan/validation applicability controls required checks.
          Required UI/design gaps reach ship, and deferral requires the existing authority/risk
          policy. Review completed or schema valid never means blocker-free.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-013
        type: acceptance-criterion
        statement: Route authorized repairs to their owner and invalidate evidence.
        behavior: Route authorized repairs to their owner and invalidate evidence.
        expected_result: Review-only UI checks cannot silently fix source. Any permitted repair uses the
          existing owner/scope contract, invalidates affected UI evidence and does not restart
          simplify after repair.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-014
        type: acceptance-criterion
        statement: Exercise three bounded smoke fixtures and their negative mutations.
        behavior: Exercise three bounded smoke fixtures and their negative mutations.
        expected_result: Action popover, mobile table selection, and standalone responsive page scenarios
          exercise documented payload -> helper -> consumer, including positive evidence,
          missing/stale evidence and scope/authority mutations. Fixtures do not modify product
          repositories or claim live rendering.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: AC-015
        type: acceptance-criterion
        statement: Preserve schema compatibility and historical approval/evidence.
        behavior: Preserve schema compatibility and historical approval/evidence.
        expected_result: Legacy ordinary reviews stay readable but do not acquire verified UI proof. Unknown
          or contradictory UI payloads fail closed. Approved artifacts and prior evidence records
          remain unchanged; new current authoring evidence is separately recorded and independently
          checked.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-016
        type: acceptance-criterion
        statement: Complete focused verification and mirror synchronization.
        behavior: Complete focused verification and mirror synchronization.
        expected_result: Relevant regression, authoring/UIUX, consumer, schema, mirror, hygiene and
          executable-reference commands have actual PASS/FAIL/NOT RUN results. Public skill count
          remains 23; no dependency/browser installation, live/paid service, commit or push occurs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: D-001
        type: decision
        statement: "purpose: design-artifact | implemented-ui-conformance; absent purpose preserves ordinary
          review"
        question: Review purpose vocabulary
        selected_value: "purpose: design-artifact | implemented-ui-conformance; absent purpose preserves
          ordinary review"
        source: explicit-user
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Use the existing kebab-case enum convention and keep purpose separate from mode,
          dimension, track and evidence class.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - AC-002
        task_refs: []
      - id: D-002
        type: decision
        statement: Extend the existing review contract with a private shared UI review verifier and reuse
          current snapshot/hash/receipt and Design verification infrastructure
        question: Evidence and verification boundary
        selected_value: Extend the existing review contract with a private shared UI review verifier and
          reuse current snapshot/hash/receipt and Design verification infrastructure
        source: explicit-user
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Structural acceptance, independent review completion, conformance verdict and
          verification coverage must be separately observable.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - R-005
          - AC-003
          - AC-005
          - AC-012
        task_refs: []
      - id: D-003
        type: decision
        statement: Preserve legacy/historical inputs without promoting them; append a new current UI/UX
          integration record bound to actual final sources
        question: Compatibility and evidence lifecycle
        selected_value: Preserve legacy/historical inputs without promoting them; append a new current UI/UX
          integration record bound to actual final sources
        source: explicit-user
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The checked-out historical UI/UX integration record is stale and must not be rewritten to
          make migration green.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-015
          - AC-016
        task_refs: []
      - id: INV-001
        type: invariant
        statement: Preserve approved artifacts, user-owned content, existing review dimensions and 23 public
          skills; never fabricate evidence, expand repair authority, or perform prohibited
          live/Git/dependency actions.
        protected_refs:
          - R-001
          - R-003
          - R-004
          - R-006
          - R-007
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
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-013.task_refs
        record_id: AC-013
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-014.task_refs
        record_id: AC-014
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-015.task_refs
        record_id: AC-015
        message: an acceptance criterion must map to at least one planned task
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-016.task_refs
        record_id: AC-016
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
```
