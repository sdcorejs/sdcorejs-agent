---
approval_source: explicit-user-choice
approved_at: 2026-09-23T03:37:25.163Z
approved_by: current-user
artifact_id: architecture-design-handoff-contract-20260923-r1
artifact_kind: architecture
change_control:
  revision: 1
  supersedes: null
change_ref: design-handoff-contract-20260923
commit_policy: with-change
contract_id: design-handoff-contract-20260923
description: Approved Design ownership, approval/evidence and verified consumer boundaries.
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
name: design-handoff-contract-architecture
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:34f012a1e161434df6a81fdb251831579b14cf1648b17d838d41d2779d3b6844
    artifact_id: spec-design-handoff-contract-20260923-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
parent_repository_id: null
repository_relative_path: .sdcorejs/architecture/workflow/2026-09-23-10-37-design-handoff-contract.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-09-23-10-34-design-handoff-contract-architecture.md
source_plan: none
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
source_spec: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
stack_profile: node-general
supersedes: null
track: workflow
approval_hash: sha256:v1:a7520c77786a0099078e6caa8a1a4c22d5a3639d4cd54e06dc5cb51da89007cd
---

# Architecture - Design handoff contract

Status: explicitly approved by the user. Source: verified approved spec .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md. This artifact freezes shared decisions; exact files/tasks and execution authority belong to the subsequent plan.

## Ownership and experience

Use registry repository roles and ownership scopes unchanged. New schema 2 separates experience_kind from owner_repository_role and ownership_scope. A module, standalone app or component library can describe an experience without impersonating a portal. A portal owns its shell/composition; a cross-module experience has an explicit integration owner and references distinct actual module sources. Missing/unwritable owners block; no duplicate editable copies or portal fallback.

| Case | Semantic owner | Required boundary |
| --- | --- | --- |
| Enterprise module experience | Module repository and module ID | Module source/approval remain in that repository |
| Portal shell/composition | Portal repository | Composition must not absorb module-owned editable sources |
| Cross-module experience | Explicit integration owner | Verify distinct required module identities and source references |
| Standalone website/app | Actual standalone repository | Repository ownership, without module/portal coercion |
| Component/design-system library | Actual library repository | Library source and component evidence remain library-owned |

## Four independent verification layers

1. Structural validation checks schema, roles, canonical paths and explicit states. It is pure and never grants approval or implementation authority.
2. Parent verification reads actual spec/plan sources, recursively verifies required graph parents with the canonical verifier, and binds repository, artifact kind/identity, revision, hash and governing change. The executor's expected contract is independent of handoff claims. Missing trusted sources, loader or verifier blocks.
3. Design review/approval is separate from parent approval and artifact hashing. A claim of reviewed or approved must be backed by the existing authoritative approval mechanism and the exact Design content/revision it covers. A valid spec/plan does not automatically approve every new design. Visual Companion feedback is never approval.
4. Applicable rendered/interaction evidence is checked only where the approved requirements/target demand it. The result names each layer and limitation; a structural ok or caller-supplied PASS cannot masquerade as fully verified.

The trusted host resolves repository roots and source reads; handoff JSON cannot supply its own verifier, root authority, expected-parent identity or observation receipt. Reuse approved-artifact verification and the existing loaded evidence/snapshot facilities. A bounded Design source adapter may bridge these facilities; do not import a simplify write session merely to verify Design, invent a second approval hash, or broadly refactor the evidence system. The new verified entrypoint must observe actual files, including Markdown approved artifacts, rather than only fixture objects.

Canonical metadata must distinguish the design-handoff ledger under .sdcorejs/docs/design from design-asset documents and editable sources under .sdcorejs/design. Asset identity, approved Design identity and the closure ledger are related explicitly rather than conflated. Preserve the current canonical bundle roots and extension/depth rules.

## Applicability and evidence freshness

Resolve required surfaces from actual approved requirement content and the target through the trusted parent adapter. If an existing source format cannot express or resolve applicability, report the exact limitation; never infer all desktop/tablet/mobile as checked. A surface records its requirement identity, applicability/rationale, designed behavior and separate rendered/interaction evidence. Not-applicable cannot waive an approved requirement.

The required observation kind and stage remain explicit: rendering an editable wireframe is not a real-product capture, and neither implies interaction testing. Do not create a circular requirement to observe post-implementation product behavior before authorized drafting. Required pre-implementation design evidence must describe the design surface actually available. Missing later-stage evidence stays a gap at its own consumer gate.

Verify source/content fingerprints, revision, owner and evidence provenance at consumption. Same-HEAD mutations invalidate relevant evidence. Generated mockups retain generated provenance; actual product captures require current product-source evidence. Candidate component names/paths remain candidates until the claimed source is read and verified.

## Lifecycle and compatibility

Exploratory drafts require explicit bounded authoring authority but may have no approved parents. They remain non-implementation artifacts. Reviewed is not approved. Approved implementation consumption requires verified governing parents, valid Design authority and all evidence required for that consumption. New or material changes return to the appropriate decision/approval owner. A spacing change within existing approved scope and invariants needs no blanket extra ceremony, while affected content evidence still becomes stale.

Schema 2 is canonical. Keep a named read-only schema 1 adapter and structural validator; adapter output remains legacy-unverified and cannot synthesize approval, reads or observations. Reject unknown versions. Migration is limited to the touched feature under its actual owner and authority; no bulk historical or immutable snapshot migration.

## Actual consumer boundary

The existing Angular resolveAngularExecution, Next.js resolveNextjsExecution and generic prepareExecution paths call verifyDesignHandoff when the governing implementation contract requires Design. Required applicability comes from the verified authority context; omitting Design fields cannot silently turn the gate off. Non-UI work and explicitly approved limited prototype paths preserve their current boundaries. A prototype never becomes an approved handoff or production-eligible through a structural result.

All three callers consume the same canonical result and blockers. A portable copy of a successful result must be reverified by the receiving host; it cannot carry executable verification authority. Contract tests start with the payload documented in the skill/ref, pass through the helper and then through these real callers.

## Filesystem and closure

Validate canonical path, kind, feature, extension and depth before IO. Bind roots to the expected repository identity and actual Git root. Enforce realpath containment and reject nested-owner mismatches or unproven symlink escapes. Do not normalize a traversal into an accepted diagnostic path.

The closure includes flow, spec, decisions, editable wireframes, generated exports, actual screenshot references when present and the Design ledger. Cross-module sources must be distinct when required, with actual source revision/content provenance; missing maps or hashes are not current evidence. The authoring integration dependencies in the typed context below are real committed sources in this repository; they do not assert that an external module repository has been inspected.

## Review and validation boundary

The approved spec was loaded from disk and verified with verifyApprovedArtifactGraph. The gate, repository owner, draft write scope, typed references and all 12 AC mappings are checked using existing helpers. validateArchitectureContext currently validates a post-approval envelope: this draft deliberately has null approved_architecture_path/hash and returns exactly ARCHITECTURE_PATH_INVALID and ARCHITECTURE_HASH_INVALID. No fake approval identity is inserted to suppress them. That limitation described the pre-approval draft. This approved snapshot is verified before handoff, with the runtime envelope projecting its actual canonical frontmatter path/hash.

The implementation proof obligations below are planned proof, not executed regression evidence. Existing simplify work and its separately pending Git readiness remain unchanged. No production source, public skill, dependency, mirror, convention or prior approved snapshot is modified by this architecture step.

## Typed architecture context

```yaml
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
  approved_architecture_path: null
  approved_architecture_hash: null
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
    rationale: The handoff crosses repository and module ownership and establishes approval/evidence trust
      boundaries used by multiple execution consumers.
  invariants:
    - id: INV-001
      statement: Preserve user-owned simplify content, immutable approved snapshots, module ownership, editable
        source primacy, the 23-skill public inventory and existing approval authority.
      scope: Design handoff ownership, approval, evidence and implementation consumption
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: The Design contract may harden consumer behavior without expanding source ownership or weakening
        prior simplify/approval controls.
      verification_method: Positive/negative owner and approval controls, document-derived consumer tests, actual
        source mutations, scope/mirror checks and immutable artifact hash verification.
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
      statement: Repository role and ownership scope come from the registry; experience_kind is a separate UX
        classification. Module ownership never falls back to portal or host. Cross-module references keep one
        editable owner per module source.
      invariant_refs: &a1
        - INV-001
    - id: B-STRUCTURE
      statement: Structural validation accepts well-formed draft data but grants no implementation, approval,
        source-read or evidence authority. Version 1 compatibility remains explicitly unverified.
      invariant_refs: *a1
    - id: B-VERIFIED
      statement: A trusted host runtime loads actual approved parents and Design approval records from mapped
        repository sources, verifies canonical graph and current content, and computes distinct verification
        layers. Serialized success flags cannot replace this path.
      invariant_refs: *a1
    - id: B-CONSUMERS
      statement: Existing Angular, Next.js and generic execution entrypoints invoke the verified path when their
        governing contract requires Design. Verified parent context determines that requirement; omitting a
        payload field cannot disable it.
      invariant_refs: *a1
    - id: B-PATHS
      statement: Canonical metadata distinguishes Design ledger and asset roots/kinds. Every source, reference and
        closure path must satisfy canonical classification and physical owner-root containment before IO.
      invariant_refs: *a1
    - id: B-LIFECYCLE
      statement: Authorized exploration can author a draft without approved parents. Approved implementation
        consumption requires the governing approvals and applicable evidence. Material changes return to the
        existing approval owner; bounded spacing under unchanged authority gains no universal extra ceremony.
      invariant_refs: *a1
  dependency_directions:
    - from: Design structural and owner/path helpers
      to: system-registry, artifact-paths and repository-contract
      rationale: Keep registry and canonical path authority centralized; no parallel role enum or owner fallback.
      invariant_refs: *a1
    - from: Design verified entrypoint and trusted source adapter
      to: approved-artifact graph verifier and existing evidence/snapshot infrastructure
      rationale: Reuse hashing/receipt identity; source IO and expected authority are provided by the trusted host,
        not handoff fields.
      invariant_refs: *a1
    - from: Angular, Next.js and generic execution consumers
      to: Design verified entrypoint
      rationale: A helper with no actual caller does not enforce the implementation boundary.
      invariant_refs: *a1
  data_state_owners:
    - subject: Editable Design bundle, its decisions and ledger
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rule: This repository owns the reusable contract; each runtime bundle is owned by the repository resolved from
        its approved topology.
      invariant_refs: *a1
    - subject: Immutable spec/plan/Design approval records
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rule: Approval source owners retain authority; consumers read exact current references and never rewrite
        approved records for migration.
      invariant_refs: *a1
    - subject: Observed source fingerprints, read provenance and verification results
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      rule: Trusted host observation is runtime state; portable payloads carry data and limitations without
        transferring observation authority.
      invariant_refs: *a1
  public_contracts:
    - id: API-DESIGN-HANDOFF-V2
      kind: api
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Schema 2 is canonical for new payloads. Keep the existing structural entrypoint and a named
        version 1 read-only compatibility adapter; unknown versions and legacy verified promotion fail closed.
      migration: Only a touched, explicitly owned feature bundle may be adapted and reverified. Missing
        authority/evidence remains a blocker; no bulk historical or immutable snapshot migration.
      statement: Provide a distinct verifyDesignHandoff entrypoint with trusted runtime input and explicit
        structural, parents, approval, and applicable evidence results. Existing execution entrypoints must
        invoke it rather than trust a caller-built result.
      invariant_refs: *a1
  security_trust_boundaries:
    - id: TRUST-AUTHORITY
      statement: Expected repository/change/parent identities and applicability come from the executor host and
        verified parent content, never solely from the handoff being checked. Hash shape or body digest alone
        is not approval.
      invariant_refs: *a1
    - id: TRUST-IO
      statement: Repository root identity, actual Git root and each path realpath remain contained. Reject unsafe
        absolute/traversal paths, nested Git ownership mismatch and unproven symlink containment before
        read/write.
      invariant_refs: *a1
    - id: TRUST-EVIDENCE
      statement: Observed content and evidence provenance must match at use. Same HEAD with different source bytes
        is stale; generated mockups never satisfy real-product screenshot requirements. No fabricated rendered
        or interaction receipt.
      invariant_refs: *a1
    - id: TRUST-COMPONENTS
      statement: Confirmed component/path claims require actual matching source evidence. Missing source evidence
        retains candidate/unknown status and cannot become confirmed via schema validity.
      invariant_refs: *a1
  cross_repository_integration:
    - owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      statement: The authoring repository owns the cross-repository runtime contract. The real committed contract
        dependencies below are not claims that external module repositories have been loaded; runtime
        cross-module sources require independent verified identities and provenance.
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
      expected_proof: Positive/negative real-owner fixtures for module, portal, standalone and library;
        missing/unwritable module owner fails with no fallback.
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-001
    - id: VAL-002
      expected_proof: Actual spec/plan/Design approval reads with graph/identity/change binding; missing, mutated,
        stale, unrelated and caller-forged authority fail while authorized drafts remain draft.
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-002
        - AC-003
        - AC-005
    - id: VAL-003
      expected_proof: Required versus not-applicable surfaces, designed versus rendered/interaction evidence, mockup
        versus real screenshot and candidate versus source-confirmed mappings have paired controls and
        same-HEAD mutation cases.
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-004
        - AC-006
    - id: VAL-004
      expected_proof: Canonical depth/extensions/root/containment and cross-module provenance are enforced, and
        closure retains every feature asset/decision/export/ledger without diagnostic traversal.
      owner: github.com/sdcorejs/sdcorejs-agent
      invariant_refs: *a1
      acceptance_criterion_refs:
        - AC-007
        - AC-008
        - AC-009
    - id: VAL-005
      expected_proof: Document-derived payloads pass through helper and real Angular/Next.js/generic callers;
        legacy/draft/forged results cannot bypass verified mode; mirrors, immutable snapshots, scope and
        existing simplify controls are preserved with actual command results.
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
```

## Resolved authoring topology

```yaml
repository_topology:
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  repositories:
    - repository_id: github.com/sdcorejs/sdcorejs-agent
      role: standalone
      module_id: null
      available: true
      writable: true
```

## Artifact lifecycle

```yaml
artifact_context:
  change_ref: design-handoff-contract-20260923
  source_spec: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
  source_plan: none
  required_with_change:
    - path: .sdcorejs/docs/workflow/2026-09-23-10-20-design-handoff-contract-spec.md
      kind: execution-doc
      reason: Source spec draft.
    - path: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
      kind: spec
      reason: Verified approved requirements.
    - path: .sdcorejs/docs/architecture/2026-09-23-10-34-design-handoff-contract-architecture.md
      kind: execution-doc
      reason: Lean Design handoff architecture awaiting explicit approval.
    - path: .sdcorejs/architecture/workflow/2026-09-23-10-37-design-handoff-contract.md
      kind: architecture
      reason: Explicitly approved Design ownership and verification architecture.
  shared_owned: []
  conditional: []
  local_only: []
  unrelated_observed: []
```

The hashed architecture_context records the reviewed decisions. Its self-referential approved path/hash are projected from verified artifact metadata into the post-approval runtime envelope.
