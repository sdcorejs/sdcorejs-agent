---
allowed_paths:
  - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
  - .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage.json
  - test/e2e/cleanup-posix-contract.test.mjs
  - test/e2e/cleanup-posix-native.test.mjs
  - _refs/cleanup/safe-file-operation.py
  - _refs/cleanup/posix-file-operation.mjs
  - _refs/cleanup/native-file-operation.mjs
  - _refs/cleanup/cleanup-engine.mjs
  - _refs/cleanup/cleanup-contract.mjs
  - _refs/cleanup/workflow.md
  - skills/shared/workflow/cleanup.md
  - README.md
  - scripts/check-text-hygiene.mjs
  - scripts/check-executable-references.mjs
  - .sdcorejs/docs/workflow/cleanup-posix-implementation-evidence.md
  - authoring/evals/records/cleanup-portability.json
  - authoring/evals/records/cleanup-portability-red.txt
  - authoring/evals/records/cleanup-portability-green.txt
  - .claude/_refs/**
  - plugin/_refs/**
  - codex/skills/_refs/**
  - .claude/skills/sdcorejs-cleanup/**
  - plugin/skills/sdcorejs-cleanup/**
  - codex/skills/sdcorejs-cleanup/**
approval_source: explicit-user-Sentinel_052de22014888191958bf0663470b688-and-delegated-implementation
approved_at: 2026-10-02T11:20:06.125Z
approved_by: workspace-owner
architecture_context:
  adopted_decision_refs:
    - D-008
    - D-009
  approved_architecture_hash: sha256:v1:971142d9e4811745cab3d0b8eb18b4ecf91fccba1fac4c2c738dfe9304ccaa53
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
  approved_spec_reference:
    approval_hash: sha256:v1:d9faca286b46c0e33038356c979621b5ba2ff912421a8606da06969ae0705a09
    artifact_id: sdcorejs-cleanup-posix-spec-r2
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
  assumption_refs:
    - A-001
    - A-002
  boundaries:
    - id: BOUNDARY-001
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      owner: github.com/sdcorejs/sdcorejs-agent
      statement: Canonical policy admits exact operations; native session holds scoped
        fence and descriptors.
  change_control:
    revision: 1
    supersedes: null
  contract_id: sdcorejs-cleanup:v1
  cross_repository_integration: []
  data_state_owners:
    - invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      subject: cleanup-transaction-journal-and-receipts
  deferred_decision_refs: []
  dependency_directions:
    - from: cleanup-engine
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      rationale: Single canonical policy calls platform-bound native adapters.
      to: native-file-operation
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  invariants:
    - decision_refs:
        - D-008
        - D-009
      id: INV-001
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: No mutation without exact authority and current state.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-002
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: No deletion inferred from local_only, age, naming, AI generation,
        exact hash equality or missing local consumer.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-003
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: No writes after final branch-ready without rerunning the final gates.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-004
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: Approved history and unrelated repositories/data remain intact.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-005
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: Use built-in Node and existing OS facilities only; no installed
        dependency, new daemon, provider dependency, codegraph or vector
        database. Windows mutations use pinned root-relative native handles
        through existing PowerShell. A platform without an available atomic
        backend remains read-only and fails closed for mutation.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-006
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: A frozen POSIX boundary binds helper/runtime identity, maintenance
        generation/evidence, approved object and exact transaction paths;
        analysis and legacy policies cannot authorize it.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-007
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: Unexpected capture is a retained partial contract breach, not
        successful cleanup; recovery/restore never overwrite, auto-compensate or
        delete unknown objects.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
    - decision_refs:
        - D-008
        - D-009
      id: INV-008
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Preserve exact scoped authority and accurate recovery state.
      requirement_refs:
        - R-009
      scope: cleanup-native-boundary
      statement: Only exact revalidated objects under admitted maintenance may commit;
        missing runtime, security, primitive or filesystem proof blocks without
        changing permissions.
      verification_method: Native and shared contract fixtures with actual object-state assertions.
  owner_module_id: null
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  profile_sections:
    agent_architecture_ref: null
    frontend_architecture_ref: null
  public_contracts:
    - compatibility: Windows preserved; POSIX explicit boundary and receipt fields
      id: CONTRACT-001
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      kind: persisted-data-model
      migration: Old approvals never authorize POSIX mutation
      owner: github.com/sdcorejs/sdcorejs-agent
  requirement_id: R-009
  schema_version: 1
  security_trust_boundaries:
    - id: TRUST-001
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      owner: github.com/sdcorejs/sdcorejs-agent
      statement: Exact objects under explicit cooperative maintenance; no unexpected
        replacement authority.
  source: sdcorejs-architecture
  trigger:
    rationale: POSIX maintenance admission and persisted native transaction states
      require one shared security/recovery contract.
    required: true
    signals:
      - persisted-data-model-contract
      - security-trust-boundary
  validation_obligations:
    - acceptance_criterion_refs:
        - AC-008
        - AC-009
        - AC-010
      expected_proof: Real native apply/recovery and barrier fixtures on each declared
        OS/profile, with Windows preservation.
      id: VAL-001
      invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      owner: github.com/sdcorejs/sdcorejs-agent
architecture_gate:
  blocker_messages: []
  blockers: []
  bypass: null
  rationale: POSIX maintenance admission and persisted native transaction states
    require one shared security/recovery contract.
  required: true
  signals:
    - persisted-data-model-contract
    - security-trust-boundary
  status: required
  valid: true
artifact_id: sdcorejs-cleanup-posix-plan-r2
artifact_kind: plan
change_ref: sdcorejs-cleanup
commit_policy: never
contract_id: sdcorejs-cleanup:v1
coverage_approach: TDD
decision_coverage:
  approved_artifact:
    body: |
      {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"R-009","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"D-008","type":"decision"},{"id":"D-009","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"},{"id":"INV-005","type":"invariant"},{"id":"INV-006","type":"invariant"},{"id":"INV-007","type":"invariant"},{"id":"INV-008","type":"invariant"}],"revision":1,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Add public utility sdcorejs-cleanup with analyze, plan, apply, restore and task-tail actions; default read-only. It is not an implementation track or code refactor.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Evidence, ownership, reproducibility, producer completion and recoverability govern risk. LOW automation needs approved task-scoped policy; MEDIUM needs bounded batch authority; HIGH needs exact file/atomic-group authority; blocked/unknown never downgrade.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Frozen plans bind exact files/actions, content and filesystem/Git/reference state. Revalidate before apply; never expand globs or recursive deletion. Reject symlinks/junctions, nested repositories, submodules, path traversal, active producers, sensitive paths and unknown owners.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Execute authorized fixture cleanup, quarantine and collision-safe restore with accurate partial receipts and separate active-path removal, quarantine bytes and reclaimed bytes. No cleanup on real user data in this implementation session.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Preserve approved artifacts, durable history, diagnostic/recovery evidence, public assets, generated mirrors, intentional brand/fixture copies and unknown references. Absence of grep/import/mtime is never unused proof. Near duplicates are review-only.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Explorer and other workflows emit runtime signals to one coordinator; one significant scoped offer, decline deduplication and session-wide suppression. Accepting analysis never authorizes mutation. No global queue, daemon or mutable manifest.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-007","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Task-tail cleanup only current-task artifacts after tests/review/repair and durable finalization, before affected verification, convergence and final branch-ready. Preserve failed/interrupted evidence; later mutations invalidate readiness.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-008","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Update canonical public inventory/routing/ceiling through the existing typed authoring approval gate, official mirrors, documentation and meaningful deterministic tests. No staging, commits, pushes, PRs, merges or publication.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-009","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Provide Windows/Linux/macOS cleanup operations with exact authority and native capability evidence.","status":"active","task_refs":["TASK-005","TASK-006","TASK-007","TASK-008","TASK-009"],"type":"requirement"},{"behavior":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","id":"AC-001","requirement_refs":["R-009"],"statement":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","id":"AC-002","requirement_refs":["R-009"],"statement":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","id":"AC-003","requirement_refs":["R-009"],"statement":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","id":"AC-004","requirement_refs":["R-009"],"statement":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","id":"AC-005","requirement_refs":["R-009"],"statement":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","id":"AC-006","requirement_refs":["R-009"],"statement":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","id":"AC-007","requirement_refs":["R-009"],"statement":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","id":"AC-008","requirement_refs":["R-009"],"statement":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","id":"AC-009","requirement_refs":["R-009"],"statement":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","id":"AC-010","requirement_refs":["R-009"],"statement":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":true,"confidence":"high","consequence_if_wrong":"Block mutation and report unsupported admission/capability; do not claim completed platform support.","evidence_refs":["EVIDENCE-005","EVIDENCE-009"],"id":"A-001","impacted_refs":["R-009","AC-008","AC-009"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"Confirmed operating contract, not a claim that advisory locking excludes hidden same-user writers.","source":"explicit","statement":"POSIX mutation admits only declared maintenance: known producers finish and all relevant name/content writers stay quiescent or share one stable fence, including retained writable descriptors and children.","status":"confirmed","task_refs":["TASK-005","TASK-007","TASK-009"],"type":"assumption","validation_method":"User choice Sentinel_052de22014888191958bf0663470b688; trusted harness supplies current scoped owner/participant evidence and generation; actual native admission fixtures verify rejection."},{"blocking":true,"confidence":"high","consequence_if_wrong":"Block mutation and report unsupported admission/capability; do not claim completed platform support.","evidence_refs":["EVIDENCE-005","EVIDENCE-009"],"id":"A-002","impacted_refs":["R-009","AC-008","AC-009"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"Confirmed operating contract, not a claim that advisory locking excludes hidden same-user writers.","source":"explicit","statement":"Runtime/filesystem availability is target-specific and unknown until a mandatory capability/security check; missing evidence blocks effects, without installation or fallback.","status":"confirmed","task_refs":["TASK-005","TASK-007","TASK-009"],"type":"assumption","validation_method":"Independent review runtime contract; read-only target probe and real native acceptance results, with unavailable OS recorded NOT_RUN."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-009","AC-008","AC-009","INV-006","INV-007","INV-008"],"id":"D-008","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which POSIX transaction boundary implements approved portability?","rationale":"User Sentinel_052de22014888191958bf0663470b688 approved maintenance and parent explicitly delegated review-corrected end-to-end implementation.","revisit_condition":"Missing capability or changed operating contract returns to planning.","scope":"repository","selected_value":"Capture only the exact approved object under declared maintenance; verify recovery before capture; conflicts are partial contract breaches, never authorized replacement mutation.","source":"explicit-user","statement":"Capture only the exact approved object under declared maintenance; verify recovery before capture; conflicts are partial contract breaches, never authorized replacement mutation.","status":"approved","supersedes":null,"task_refs":["TASK-005","TASK-007","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-009","AC-008","AC-009","INV-006","INV-007","INV-008"],"id":"D-009","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which existing native runtime implements approved portability?","rationale":"User Sentinel_052de22014888191958bf0663470b688 approved maintenance and parent explicitly delegated review-corrected end-to-end implementation.","revisit_condition":"Missing capability or changed operating contract returns to planning.","scope":"repository","selected_value":"Use a resolved trusted existing CPython >=3.11 via -I -S -B, canonical hash-bound stdlib/ctypes helper, exact lossless state and fail-closed local filesystem/native capability checks.","source":"explicit-user","statement":"Use a resolved trusted existing CPython >=3.11 via -I -S -B, canonical hash-bound stdlib/ctypes helper, exact lossless state and fail-closed local filesystem/native capability checks.","status":"approved","supersedes":null,"task_refs":["TASK-005","TASK-007","TASK-009"],"type":"decision"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-001","protected_refs":["R-009","AC-009"],"statement":"No mutation without exact authority and current state.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-002","protected_refs":["R-009","AC-009"],"statement":"No deletion inferred from local_only, age, naming, AI generation, exact hash equality or missing local consumer.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-003","protected_refs":["R-009","AC-009"],"statement":"No writes after final branch-ready without rerunning the final gates.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-004","protected_refs":["R-009","AC-009"],"statement":"Approved history and unrelated repositories/data remain intact.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-005","protected_refs":["R-009","AC-009"],"statement":"Use built-in Node and existing OS facilities only; no installed dependency, new daemon, provider dependency, codegraph or vector database. Windows mutations use pinned root-relative native handles through existing PowerShell. A platform without an available atomic backend remains read-only and fails closed for mutation.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-006","protected_refs":["R-009","AC-008","AC-009"],"statement":"A frozen POSIX boundary binds helper/runtime identity, maintenance generation/evidence, approved object and exact transaction paths; analysis and legacy policies cannot authorize it.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-007","protected_refs":["R-009","AC-008","AC-009"],"statement":"Unexpected capture is a retained partial contract breach, not successful cleanup; recovery/restore never overwrite, auto-compensate or delete unknown objects.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-008","protected_refs":["R-009","AC-008","AC-009"],"statement":"Only exact revalidated objects under admitted maintenance may commit; missing runtime, security, primitive or filesystem proof blocks without changing permissions.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"}],"revision":1,"schema_version":1}
    metadata:
      allowed_paths:
        - "**"
      approval_hash: sha256:v1:7400d7cd81271ce31ccffb028e3d87d0a4a839326894d5732ca0c5d76417260b
      approval_source: user-approved-decision-coverage
      approved_at: 2026-08-09T00:00:00.000Z
      approved_by: workspace-owner
      artifact_id: decision-coverage-r1
      artifact_kind: plan
      change_ref: sdcorejs-cleanup-posix
      contract_id: decision-coverage:v1
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_repository_role: standalone
      parent_references: []
      parent_repository_id: null
      prohibited_paths: []
      repository_relative_path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage.json
      requirement_id: decision-coverage
      schema_version: 1
      source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
      stack_profile: markdown-skill-pack
      supersedes: null
      track: workflow
  history:
    - active:
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
        - id: R-009
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
        - id: A-001
          type: assumption
        - id: A-002
          type: assumption
        - id: D-008
          type: decision
        - id: D-009
          type: decision
        - id: INV-001
          type: invariant
        - id: INV-002
          type: invariant
        - id: INV-003
          type: invariant
        - id: INV-004
          type: invariant
        - id: INV-005
          type: invariant
        - id: INV-006
          type: invariant
        - id: INV-007
          type: invariant
        - id: INV-008
          type: invariant
      revision: 1
      tombstones: []
  records:
    - id: R-001
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Add public utility sdcorejs-cleanup with analyze, plan, apply,
        restore and task-tail actions; default read-only. It is not an
        implementation track or code refactor.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-002
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Evidence, ownership, reproducibility, producer completion and
        recoverability govern risk. LOW automation needs approved task-scoped
        policy; MEDIUM needs bounded batch authority; HIGH needs exact
        file/atomic-group authority; blocked/unknown never downgrade.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-003
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Frozen plans bind exact files/actions, content and
        filesystem/Git/reference state. Revalidate before apply; never expand
        globs or recursive deletion. Reject symlinks/junctions, nested
        repositories, submodules, path traversal, active producers, sensitive
        paths and unknown owners.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-004
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Execute authorized fixture cleanup, quarantine and collision-safe
        restore with accurate partial receipts and separate active-path removal,
        quarantine bytes and reclaimed bytes. No cleanup on real user data in
        this implementation session.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-005
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Preserve approved artifacts, durable history, diagnostic/recovery
        evidence, public assets, generated mirrors, intentional brand/fixture
        copies and unknown references. Absence of grep/import/mtime is never
        unused proof. Near duplicates are review-only.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-006
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Explorer and other workflows emit runtime signals to one coordinator;
        one significant scoped offer, decline deduplication and session-wide
        suppression. Accepting analysis never authorizes mutation. No global
        queue, daemon or mutable manifest.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-007
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Task-tail cleanup only current-task artifacts after
        tests/review/repair and durable finalization, before affected
        verification, convergence and final branch-ready. Preserve
        failed/interrupted evidence; later mutations invalidate readiness.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-008
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: approved-artifact
      statement: Update canonical public inventory/routing/ceiling through the
        existing typed authoring approval gate, official mirrors, documentation
        and meaningful deterministic tests. No staging, commits, pushes, PRs,
        merges or publication.
      status: active
      task_refs:
        - TASK-006
        - TASK-009
      type: requirement
    - id: R-009
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      source: explicit-user
      statement: Provide Windows/Linux/macOS cleanup operations with exact authority
        and native capability evidence.
      status: active
      task_refs:
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-008
        - TASK-009
      type: requirement
    - behavior: Approved LOW task temporary files are removed while needed
        diagnostics, unrelated files and active producers remain.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Approved LOW task temporary files are removed while needed
        diagnostics, unrelated files and active producers remain.
      id: AC-001
      requirement_refs:
        - R-009
      statement: Approved LOW task temporary files are removed while needed
        diagnostics, unrelated files and active producers remain.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Frozen file/reference/directory/Git/ownership drift blocks stale apply
        without deleting unexpected files.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Frozen file/reference/directory/Git/ownership drift blocks
        stale apply without deleting unexpected files.
      id: AC-002
      requirement_refs:
        - R-009
      statement: Frozen file/reference/directory/Git/ownership drift blocks stale
        apply without deleting unexpected files.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Quarantine and restore work; occupied destinations and altered
        quarantine bytes fail without overwrite.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Quarantine and restore work; occupied destinations and altered
        quarantine bytes fail without overwrite.
      id: AC-003
      requirement_refs:
        - R-009
      statement: Quarantine and restore work; occupied destinations and altered
        quarantine bytes fail without overwrite.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Dynamic/copy/public assets, immutable and historical docs, unique
        superseded docs, mirrors and intentional duplicates are protected or
        unknown; exact redundant/abandoned nonunique candidates require scoped
        authority.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Dynamic/copy/public assets, immutable and historical docs,
        unique superseded docs, mirrors and intentional duplicates are protected
        or unknown; exact redundant/abandoned nonunique candidates require
        scoped authority.
      id: AC-004
      requirement_refs:
        - R-009
      statement: Dynamic/copy/public assets, immutable and historical docs, unique
        superseded docs, mirrors and intentional duplicates are protected or
        unknown; exact redundant/abandoned nonunique candidates require scoped
        authority.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Significant signals offer once; weak signals do not; worker duplicates
        collapse; declines and session disabling propagate; analysis approval
        cannot mutate.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Significant signals offer once; weak signals do not; worker
        duplicates collapse; declines and session disabling propagate; analysis
        approval cannot mutate.
      id: AC-005
      requirement_refs:
        - R-009
      statement: Significant signals offer once; weak signals do not; worker
        duplicates collapse; declines and session disabling propagate; analysis
        approval cannot mutate.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Traversal, external links/junctions, nested Git/submodule and parallel
        cleanup boundaries fail closed; partial apply reports exact
        completed/retained/failed state.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Traversal, external links/junctions, nested Git/submodule and
        parallel cleanup boundaries fail closed; partial apply reports exact
        completed/retained/failed state.
      id: AC-006
      requirement_refs:
        - R-009
      statement: Traversal, external links/junctions, nested Git/submodule and
        parallel cleanup boundaries fail closed; partial apply reports exact
        completed/retained/failed state.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Public skill direct dispatch, canonical mirror generation, 24-skill
        inventory, authoring gates and existing repository verification remain
        valid.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Public skill direct dispatch, canonical mirror generation,
        24-skill inventory, authoring gates and existing repository verification
        remain valid.
      id: AC-007
      requirement_refs:
        - R-009
      statement: Public skill direct dispatch, canonical mirror generation, 24-skill
        inventory, authoring gates and existing repository verification remain
        valid.
      task_refs:
        - TASK-006
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Actual apply, quarantine, archive, delete and restore succeed on each
        declared real supported runtime/filesystem.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Actual apply, quarantine, archive, delete and restore succeed
        on each declared real supported runtime/filesystem.
      id: AC-008
      requirement_refs:
        - R-009
      statement: Actual apply, quarantine, archive, delete and restore succeed on each
        declared real supported runtime/filesystem.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Cooperative maintenance, exact objects, verified copy-before-removal,
        interruption and collision receipts preserve original authority
        invariants.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Cooperative maintenance, exact objects, verified
        copy-before-removal, interruption and collision receipts preserve
        original authority invariants.
      id: AC-009
      requirement_refs:
        - R-009
      statement: Cooperative maintenance, exact objects, verified copy-before-removal,
        interruption and collision receipts preserve original authority
        invariants.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - behavior: Windows native guarantees, F01-F06, governed finish gates and official
        mirrors remain valid.
      blocking: true
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-009
      expected_result: Windows native guarantees, F01-F06, governed finish gates and
        official mirrors remain valid.
      id: AC-010
      requirement_refs:
        - R-009
      statement: Windows native guarantees, F01-F06, governed finish gates and
        official mirrors remain valid.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: acceptance-criterion
      verification_kind: automated
    - blocking: true
      confidence: high
      consequence_if_wrong: Block mutation and report unsupported
        admission/capability; do not claim completed platform support.
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-009
      id: A-001
      impacted_refs:
        - R-009
        - AC-008
        - AC-009
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Confirmed operating contract, not a claim that advisory locking
        excludes hidden same-user writers.
      source: explicit
      statement: "POSIX mutation admits only declared maintenance: known producers
        finish and all relevant name/content writers stay quiescent or share one
        stable fence, including retained writable descriptors and children."
      status: confirmed
      task_refs:
        - TASK-005
        - TASK-007
        - TASK-009
      type: assumption
      validation_method: User choice Sentinel_052de22014888191958bf0663470b688;
        trusted harness supplies current scoped owner/participant evidence and
        generation; actual native admission fixtures verify rejection.
    - blocking: true
      confidence: high
      consequence_if_wrong: Block mutation and report unsupported
        admission/capability; do not claim completed platform support.
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-009
      id: A-002
      impacted_refs:
        - R-009
        - AC-008
        - AC-009
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Confirmed operating contract, not a claim that advisory locking
        excludes hidden same-user writers.
      source: explicit
      statement: Runtime/filesystem availability is target-specific and unknown until
        a mandatory capability/security check; missing evidence blocks effects,
        without installation or fallback.
      status: confirmed
      task_refs:
        - TASK-005
        - TASK-007
        - TASK-009
      type: assumption
      validation_method: Independent review runtime contract; read-only target probe
        and real native acceptance results, with unavailable OS recorded
        NOT_RUN.
    - blocking: true
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-009
        - AC-008
        - AC-009
        - INV-006
        - INV-007
        - INV-008
      id: D-008
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      question: Which POSIX transaction boundary implements approved portability?
      rationale: User Sentinel_052de22014888191958bf0663470b688 approved maintenance
        and parent explicitly delegated review-corrected end-to-end
        implementation.
      revisit_condition: Missing capability or changed operating contract returns to planning.
      scope: repository
      selected_value: Capture only the exact approved object under declared
        maintenance; verify recovery before capture; conflicts are partial
        contract breaches, never authorized replacement mutation.
      source: explicit-user
      statement: Capture only the exact approved object under declared maintenance;
        verify recovery before capture; conflicts are partial contract breaches,
        never authorized replacement mutation.
      status: approved
      supersedes: null
      task_refs:
        - TASK-005
        - TASK-007
        - TASK-009
      type: decision
    - blocking: true
      convention_impact:
        candidate: false
        category: null
      downstream_refs:
        - R-009
        - AC-008
        - AC-009
        - INV-006
        - INV-007
        - INV-008
      id: D-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      question: Which existing native runtime implements approved portability?
      rationale: User Sentinel_052de22014888191958bf0663470b688 approved maintenance
        and parent explicitly delegated review-corrected end-to-end
        implementation.
      revisit_condition: Missing capability or changed operating contract returns to planning.
      scope: repository
      selected_value: Use a resolved trusted existing CPython >=3.11 via -I -S -B,
        canonical hash-bound stdlib/ctypes helper, exact lossless state and
        fail-closed local filesystem/native capability checks.
      source: explicit-user
      statement: Use a resolved trusted existing CPython >=3.11 via -I -S -B,
        canonical hash-bound stdlib/ctypes helper, exact lossless state and
        fail-closed local filesystem/native capability checks.
      status: approved
      supersedes: null
      task_refs:
        - TASK-005
        - TASK-007
        - TASK-009
      type: decision
    - evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-001
      protected_refs:
        - R-009
        - AC-009
      statement: No mutation without exact authority and current state.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-002
      protected_refs:
        - R-009
        - AC-009
      statement: No deletion inferred from local_only, age, naming, AI generation,
        exact hash equality or missing local consumer.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-003
      protected_refs:
        - R-009
        - AC-009
      statement: No writes after final branch-ready without rerunning the final gates.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-004
      protected_refs:
        - R-009
        - AC-009
      statement: Approved history and unrelated repositories/data remain intact.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-005
      protected_refs:
        - R-009
        - AC-009
      statement: Use built-in Node and existing OS facilities only; no installed
        dependency, new daemon, provider dependency, codegraph or vector
        database. Windows mutations use pinned root-relative native handles
        through existing PowerShell. A platform without an available atomic
        backend remains read-only and fails closed for mutation.
      task_refs:
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-006
      protected_refs:
        - R-009
        - AC-008
        - AC-009
      statement: A frozen POSIX boundary binds helper/runtime identity, maintenance
        generation/evidence, approved object and exact transaction paths;
        analysis and legacy policies cannot authorize it.
      task_refs:
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-007
      protected_refs:
        - R-009
        - AC-008
        - AC-009
      statement: Unexpected capture is a retained partial contract breach, not
        successful cleanup; recovery/restore never overwrite, auto-compensate or
        delete unknown objects.
      task_refs:
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
    - evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-009
      id: INV-008
      protected_refs:
        - R-009
        - AC-008
        - AC-009
      statement: Only exact revalidated objects under admitted maintenance may commit;
        missing runtime, security, primitive or filesystem proof blocks without
        changing permissions.
      task_refs:
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-009
      type: invariant
  revision: 1
  schema_version: 1
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
execution_policy: sequential
goal_backward_review:
  critique_history:
    - blockers:
        - A-001-threat-model
        - D-008-capture-authority
        - D-009-runtime-contract
      checker_version: sdcorejs-plan:goal-backward:v1
      resolved_blockers:
        - A-001-threat-model
        - D-008-capture-authority
        - D-009-runtime-contract
      round: 1
      unresolved_blockers: []
  decision_coverage:
    history:
      - active:
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
          - id: R-009
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
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
            type: invariant
          - id: INV-003
            type: invariant
          - id: INV-004
            type: invariant
          - id: INV-005
            type: invariant
          - id: INV-006
            type: invariant
          - id: INV-007
            type: invariant
          - id: INV-008
            type: invariant
        revision: 1
        tombstones: []
    records:
      - id: R-001
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Add public utility sdcorejs-cleanup with analyze, plan, apply,
          restore and task-tail actions; default read-only. It is not an
          implementation track or code refactor.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-002
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Evidence, ownership, reproducibility, producer completion and
          recoverability govern risk. LOW automation needs approved task-scoped
          policy; MEDIUM needs bounded batch authority; HIGH needs exact
          file/atomic-group authority; blocked/unknown never downgrade.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-003
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Frozen plans bind exact files/actions, content and
          filesystem/Git/reference state. Revalidate before apply; never expand
          globs or recursive deletion. Reject symlinks/junctions, nested
          repositories, submodules, path traversal, active producers, sensitive
          paths and unknown owners.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-004
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Execute authorized fixture cleanup, quarantine and collision-safe
          restore with accurate partial receipts and separate active-path
          removal, quarantine bytes and reclaimed bytes. No cleanup on real user
          data in this implementation session.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-005
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Preserve approved artifacts, durable history, diagnostic/recovery
          evidence, public assets, generated mirrors, intentional brand/fixture
          copies and unknown references. Absence of grep/import/mtime is never
          unused proof. Near duplicates are review-only.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-006
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Explorer and other workflows emit runtime signals to one coordinator;
          one significant scoped offer, decline deduplication and session-wide
          suppression. Accepting analysis never authorizes mutation. No global
          queue, daemon or mutable manifest.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-007
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Task-tail cleanup only current-task artifacts after
          tests/review/repair and durable finalization, before affected
          verification, convergence and final branch-ready. Preserve
          failed/interrupted evidence; later mutations invalidate readiness.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-008
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: approved-artifact
        statement: Update canonical public inventory/routing/ceiling through the
          existing typed authoring approval gate, official mirrors,
          documentation and meaningful deterministic tests. No staging, commits,
          pushes, PRs, merges or publication.
        status: active
        task_refs:
          - TASK-006
          - TASK-009
        type: requirement
      - id: R-009
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        source: explicit-user
        statement: Provide Windows/Linux/macOS cleanup operations with exact authority
          and native capability evidence.
        status: active
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
        type: requirement
      - behavior: Approved LOW task temporary files are removed while needed
          diagnostics, unrelated files and active producers remain.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Approved LOW task temporary files are removed while needed
          diagnostics, unrelated files and active producers remain.
        id: AC-001
        requirement_refs:
          - R-009
        statement: Approved LOW task temporary files are removed while needed
          diagnostics, unrelated files and active producers remain.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Frozen file/reference/directory/Git/ownership drift blocks stale apply
          without deleting unexpected files.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Frozen file/reference/directory/Git/ownership drift blocks
          stale apply without deleting unexpected files.
        id: AC-002
        requirement_refs:
          - R-009
        statement: Frozen file/reference/directory/Git/ownership drift blocks stale
          apply without deleting unexpected files.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Quarantine and restore work; occupied destinations and altered
          quarantine bytes fail without overwrite.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Quarantine and restore work; occupied destinations and altered
          quarantine bytes fail without overwrite.
        id: AC-003
        requirement_refs:
          - R-009
        statement: Quarantine and restore work; occupied destinations and altered
          quarantine bytes fail without overwrite.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Dynamic/copy/public assets, immutable and historical docs, unique
          superseded docs, mirrors and intentional duplicates are protected or
          unknown; exact redundant/abandoned nonunique candidates require scoped
          authority.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Dynamic/copy/public assets, immutable and historical docs,
          unique superseded docs, mirrors and intentional duplicates are
          protected or unknown; exact redundant/abandoned nonunique candidates
          require scoped authority.
        id: AC-004
        requirement_refs:
          - R-009
        statement: Dynamic/copy/public assets, immutable and historical docs, unique
          superseded docs, mirrors and intentional duplicates are protected or
          unknown; exact redundant/abandoned nonunique candidates require scoped
          authority.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Significant signals offer once; weak signals do not; worker duplicates
          collapse; declines and session disabling propagate; analysis approval
          cannot mutate.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Significant signals offer once; weak signals do not; worker
          duplicates collapse; declines and session disabling propagate;
          analysis approval cannot mutate.
        id: AC-005
        requirement_refs:
          - R-009
        statement: Significant signals offer once; weak signals do not; worker
          duplicates collapse; declines and session disabling propagate;
          analysis approval cannot mutate.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Traversal, external links/junctions, nested Git/submodule and parallel
          cleanup boundaries fail closed; partial apply reports exact
          completed/retained/failed state.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Traversal, external links/junctions, nested Git/submodule and
          parallel cleanup boundaries fail closed; partial apply reports exact
          completed/retained/failed state.
        id: AC-006
        requirement_refs:
          - R-009
        statement: Traversal, external links/junctions, nested Git/submodule and
          parallel cleanup boundaries fail closed; partial apply reports exact
          completed/retained/failed state.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Public skill direct dispatch, canonical mirror generation, 24-skill
          inventory, authoring gates and existing repository verification remain
          valid.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Public skill direct dispatch, canonical mirror generation,
          24-skill inventory, authoring gates and existing repository
          verification remain valid.
        id: AC-007
        requirement_refs:
          - R-009
        statement: Public skill direct dispatch, canonical mirror generation, 24-skill
          inventory, authoring gates and existing repository verification remain
          valid.
        task_refs:
          - TASK-006
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Actual apply, quarantine, archive, delete and restore succeed on each
          declared real supported runtime/filesystem.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Actual apply, quarantine, archive, delete and restore succeed
          on each declared real supported runtime/filesystem.
        id: AC-008
        requirement_refs:
          - R-009
        statement: Actual apply, quarantine, archive, delete and restore succeed on each
          declared real supported runtime/filesystem.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Cooperative maintenance, exact objects, verified copy-before-removal,
          interruption and collision receipts preserve original authority
          invariants.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Cooperative maintenance, exact objects, verified
          copy-before-removal, interruption and collision receipts preserve
          original authority invariants.
        id: AC-009
        requirement_refs:
          - R-009
        statement: Cooperative maintenance, exact objects, verified copy-before-removal,
          interruption and collision receipts preserve original authority
          invariants.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - behavior: Windows native guarantees, F01-F06, governed finish gates and official
          mirrors remain valid.
        blocking: true
        evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-009
        expected_result: Windows native guarantees, F01-F06, governed finish gates and
          official mirrors remain valid.
        id: AC-010
        requirement_refs:
          - R-009
        statement: Windows native guarantees, F01-F06, governed finish gates and
          official mirrors remain valid.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: acceptance-criterion
        verification_kind: automated
      - blocking: true
        confidence: high
        consequence_if_wrong: Block mutation and report unsupported
          admission/capability; do not claim completed platform support.
        evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-009
        id: A-001
        impacted_refs:
          - R-009
          - AC-008
          - AC-009
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed operating contract, not a claim that advisory locking
          excludes hidden same-user writers.
        source: explicit
        statement: "POSIX mutation admits only declared maintenance: known producers
          finish and all relevant name/content writers stay quiescent or share
          one stable fence, including retained writable descriptors and
          children."
        status: confirmed
        task_refs:
          - TASK-005
          - TASK-007
          - TASK-009
        type: assumption
        validation_method: User choice Sentinel_052de22014888191958bf0663470b688;
          trusted harness supplies current scoped owner/participant evidence and
          generation; actual native admission fixtures verify rejection.
      - blocking: true
        confidence: high
        consequence_if_wrong: Block mutation and report unsupported
          admission/capability; do not claim completed platform support.
        evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-009
        id: A-002
        impacted_refs:
          - R-009
          - AC-008
          - AC-009
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed operating contract, not a claim that advisory locking
          excludes hidden same-user writers.
        source: explicit
        statement: Runtime/filesystem availability is target-specific and unknown until
          a mandatory capability/security check; missing evidence blocks
          effects, without installation or fallback.
        status: confirmed
        task_refs:
          - TASK-005
          - TASK-007
          - TASK-009
        type: assumption
        validation_method: Independent review runtime contract; read-only target probe
          and real native acceptance results, with unavailable OS recorded
          NOT_RUN.
      - blocking: true
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-009
          - AC-008
          - AC-009
          - INV-006
          - INV-007
          - INV-008
        id: D-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        question: Which POSIX transaction boundary implements approved portability?
        rationale: User Sentinel_052de22014888191958bf0663470b688 approved maintenance
          and parent explicitly delegated review-corrected end-to-end
          implementation.
        revisit_condition: Missing capability or changed operating contract returns to planning.
        scope: repository
        selected_value: Capture only the exact approved object under declared
          maintenance; verify recovery before capture; conflicts are partial
          contract breaches, never authorized replacement mutation.
        source: explicit-user
        statement: Capture only the exact approved object under declared maintenance;
          verify recovery before capture; conflicts are partial contract
          breaches, never authorized replacement mutation.
        status: approved
        supersedes: null
        task_refs:
          - TASK-005
          - TASK-007
          - TASK-009
        type: decision
      - blocking: true
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-009
          - AC-008
          - AC-009
          - INV-006
          - INV-007
          - INV-008
        id: D-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        question: Which existing native runtime implements approved portability?
        rationale: User Sentinel_052de22014888191958bf0663470b688 approved maintenance
          and parent explicitly delegated review-corrected end-to-end
          implementation.
        revisit_condition: Missing capability or changed operating contract returns to planning.
        scope: repository
        selected_value: Use a resolved trusted existing CPython >=3.11 via -I -S -B,
          canonical hash-bound stdlib/ctypes helper, exact lossless state and
          fail-closed local filesystem/native capability checks.
        source: explicit-user
        statement: Use a resolved trusted existing CPython >=3.11 via -I -S -B,
          canonical hash-bound stdlib/ctypes helper, exact lossless state and
          fail-closed local filesystem/native capability checks.
        status: approved
        supersedes: null
        task_refs:
          - TASK-005
          - TASK-007
          - TASK-009
        type: decision
      - evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-001
        protected_refs:
          - R-009
          - AC-009
        statement: No mutation without exact authority and current state.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-002
        protected_refs:
          - R-009
          - AC-009
        statement: No deletion inferred from local_only, age, naming, AI generation,
          exact hash equality or missing local consumer.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-003
        protected_refs:
          - R-009
          - AC-009
        statement: No writes after final branch-ready without rerunning the final gates.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-004
        protected_refs:
          - R-009
          - AC-009
        statement: Approved history and unrelated repositories/data remain intact.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-005
        protected_refs:
          - R-009
          - AC-009
        statement: Use built-in Node and existing OS facilities only; no installed
          dependency, new daemon, provider dependency, codegraph or vector
          database. Windows mutations use pinned root-relative native handles
          through existing PowerShell. A platform without an available atomic
          backend remains read-only and fails closed for mutation.
        task_refs:
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-006
        protected_refs:
          - R-009
          - AC-008
          - AC-009
        statement: A frozen POSIX boundary binds helper/runtime identity, maintenance
          generation/evidence, approved object and exact transaction paths;
          analysis and legacy policies cannot authorize it.
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-007
        protected_refs:
          - R-009
          - AC-008
          - AC-009
        statement: Unexpected capture is a retained partial contract breach, not
          successful cleanup; recovery/restore never overwrite, auto-compensate
          or delete unknown objects.
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
      - evidence_refs:
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-009
        id: INV-008
        protected_refs:
          - R-009
          - AC-008
          - AC-009
        statement: Only exact revalidated objects under admitted maintenance may commit;
          missing runtime, security, primitive or filesystem proof blocks
          without changing permissions.
        task_refs:
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-009
        type: invariant
    revision: 1
    schema_version: 1
  goals:
    - id: G-001
      statement: Implement exact-object cleanup across the approved platforms under
        the reviewed operating contract.
      task_refs:
        - TASK-005
        - TASK-006
        - TASK-007
        - TASK-008
        - TASK-009
  mode: sdcorejs-plan:goal-backward
  repository_inventory:
    repositories:
      - existing_paths:
          - _refs/cleanup/native-file-operation.mjs
          - _refs/cleanup/cleanup-engine.mjs
          - _refs/cleanup/cleanup-contract.mjs
          - _refs/cleanup/workflow.md
          - skills/shared/workflow/cleanup.md
          - README.md
          - scripts/check-text-hygiene.mjs
          - scripts/check-executable-references.mjs
        intended_new_paths:
          - owner_task_id: TASK-005
            path: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
          - owner_task_id: TASK-005
            path: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage.json
          - owner_task_id: TASK-006
            path: test/e2e/cleanup-posix-contract.test.mjs
          - owner_task_id: TASK-006
            path: test/e2e/cleanup-posix-native.test.mjs
          - owner_task_id: TASK-007
            path: _refs/cleanup/safe-file-operation.py
          - owner_task_id: TASK-007
            path: _refs/cleanup/posix-file-operation.mjs
          - owner_task_id: TASK-008
            path: .sdcorejs/docs/workflow/cleanup-posix-implementation-evidence.md
          - owner_task_id: TASK-009
            path: authoring/evals/records/cleanup-portability.json
          - owner_task_id: TASK-009
            path: authoring/evals/records/cleanup-portability-red.txt
          - owner_task_id: TASK-009
            path: authoring/evals/records/cleanup-portability-green.txt
        repository_id: github.com/sdcorejs/sdcorejs-agent
  schema_version: 1
  tasks:
    - dependencies: []
      enforces_invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      id: TASK-005
      justification_refs:
        - R-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      planned_evidence:
        - id: EVIDENCE-005
          record_refs:
            - R-009
            - A-001
            - A-002
            - D-008
            - D-009
            - INV-006
            - INV-007
            - INV-008
      planned_paths:
        - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
        - .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage.json
    - dependencies:
        - TASK-005
      enforces_invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      id: TASK-006
      justification_refs:
        - R-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      planned_evidence:
        - id: EVIDENCE-006
          record_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - R-009
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
            - INV-001
            - INV-002
            - INV-003
            - INV-004
            - INV-005
            - INV-006
            - INV-007
            - INV-008
      planned_paths:
        - test/e2e/cleanup-posix-contract.test.mjs
        - test/e2e/cleanup-posix-native.test.mjs
    - dependencies:
        - TASK-006
      enforces_invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      id: TASK-007
      justification_refs:
        - R-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      planned_evidence:
        - id: EVIDENCE-007
          record_refs:
            - R-009
            - AC-008
            - AC-009
            - AC-010
            - A-001
            - A-002
            - D-008
            - D-009
            - INV-001
            - INV-002
            - INV-003
            - INV-004
            - INV-005
            - INV-006
            - INV-007
            - INV-008
      planned_paths:
        - _refs/cleanup/safe-file-operation.py
        - _refs/cleanup/posix-file-operation.mjs
        - _refs/cleanup/native-file-operation.mjs
        - _refs/cleanup/cleanup-engine.mjs
        - _refs/cleanup/cleanup-contract.mjs
    - dependencies:
        - TASK-007
      enforces_invariant_refs: []
      id: TASK-008
      justification_refs:
        - R-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      planned_evidence:
        - id: EVIDENCE-008
          record_refs:
            - R-009
      planned_paths:
        - _refs/cleanup/workflow.md
        - skills/shared/workflow/cleanup.md
        - README.md
        - scripts/check-text-hygiene.mjs
        - scripts/check-executable-references.mjs
        - .sdcorejs/docs/workflow/cleanup-posix-implementation-evidence.md
    - dependencies:
        - TASK-008
      enforces_invariant_refs:
        - INV-001
        - INV-002
        - INV-003
        - INV-004
        - INV-005
        - INV-006
        - INV-007
        - INV-008
      id: TASK-009
      justification_refs:
        - R-009
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      planned_evidence:
        - id: EVIDENCE-009
          record_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - R-009
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
            - A-001
            - A-002
            - D-008
            - D-009
            - INV-001
            - INV-002
            - INV-003
            - INV-004
            - INV-005
            - INV-006
            - INV-007
            - INV-008
      planned_paths:
        - authoring/evals/records/cleanup-portability.json
        - authoring/evals/records/cleanup-portability-red.txt
        - authoring/evals/records/cleanup-portability-green.txt
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:971142d9e4811745cab3d0b8eb18b4ecf91fccba1fac4c2c738dfe9304ccaa53
    artifact_id: sdcorejs-cleanup-posix-architecture-r2
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
parent_repository_id: null
prohibited_paths:
  - .env*
  - "**/*lock.json"
  - package.json
  - package-lock.json
  - .git/**
  - _refs/cleanup/safe-file-operation.ps1
  - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-native-boundary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-finalization.md
  - .sdcorejs/approvals/**
repository_relative_path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
requirement_id: R-009
schema_version: 1
source_architecture: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
source_spec: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:d212d5378f0a21cfffd8ab0e301a02b43f7feaad29f33a0de6928c17239438b2
---

# Approved POSIX implementation plan

Parent/user authority is bound in the supplemental spec; sequential owner github.com/sdcorejs/sdcorejs-agent, isolated Git root sdcorejs-cleanup. Never modify the original shared checkout. Preserve all existing approved snapshots and F01-F06; no data cleanup or Git delivery.

TASK-005: Persist supplemental spec, architecture, goal-backward coverage and approval snapshots.
Paths (CREATE): .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md, .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md, .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md, .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage.json. Dependencies: none. Owner: github.com/sdcorejs/sdcorejs-agent.

TASK-006: Add contract and real native fixtures before implementation; record actual RED and unavailable-OS limitations.
Paths (CREATE): test/e2e/cleanup-posix-contract.test.mjs, test/e2e/cleanup-posix-native.test.mjs. Dependencies: TASK-005. Owner: github.com/sdcorejs/sdcorejs-agent.

TASK-007: Implement POSIX capability/trust/maintenance session, lossless state, exact native transaction, stable writer release and truthful receipts.
Paths (CREATE/EDIT/VERIFY-THEN-EDIT as inspected): _refs/cleanup/safe-file-operation.py, _refs/cleanup/posix-file-operation.mjs, _refs/cleanup/native-file-operation.mjs, _refs/cleanup/cleanup-engine.mjs, _refs/cleanup/cleanup-contract.mjs. Dependencies: TASK-006. Owner: github.com/sdcorejs/sdcorejs-agent.

TASK-008: Update public prerequisites, recovery/security contract, Python text/reference coverage and generate official mirrors through existing sync.
Paths (CREATE/EDIT/VERIFY-THEN-EDIT as inspected): _refs/cleanup/workflow.md, skills/shared/workflow/cleanup.md, README.md, scripts/check-text-hygiene.mjs, scripts/check-executable-references.mjs, .sdcorejs/docs/workflow/cleanup-posix-implementation-evidence.md. Dependencies: TASK-007. Owner: github.com/sdcorejs/sdcorejs-agent.

TASK-009: Run focused/authoring/repository/golden/site checks, freeze final manifest and request independent read-only review; record required real OS blockers honestly.
Paths (CREATE): authoring/evals/records/cleanup-portability.json, authoring/evals/records/cleanup-portability-red.txt, authoring/evals/records/cleanup-portability-green.txt. Dependencies: TASK-008. Owner: github.com/sdcorejs/sdcorejs-agent.

Runtime fields are existing trusted absolute Python path/hash/version, canonical helper hash, actual native profile, exact maintenance generation/owner/participant evidence, and exact transaction/recovery slots. Approval fingerprints those fields; old standing policies require a separately approved POSIX boundary. Current observer must preserve the generation/admission before every effect. All known active/unknown writers block. Helper failures retain exact journal/captured/recovery state; no silent fallback, overwrite compensation or restart resume.

Preflight: current branch/HEAD, staged/unstaged/untracked diffstat and write-scope inspection. All candidate changes are owned prior cleanup work. CREATE/EDIT evidence is attached; mirrors are generated only by scripts/sync-skills.mjs. No dependency/package/env/lockfile/source Windows-helper edits; no installs, service starts, permission changes, external CI or Git artifacts.

Verification commands from inspected package.json: npm run test:e2e:cleanup; npm run test:e2e:skill-authoring; node authoring/evals/run-deterministic.mjs; npm run sync:skills; npm run check:skills; npm run check:skills:ps; npm run check:text-hygiene; npm run check:executable-references; npm run test:e2e:repository; npm test. Supplemental tests: node --test test/e2e/cleanup-posix-contract.test.mjs test/e2e/cleanup-posix-native.test.mjs; Python in-memory compilation and isolated protocol unsupported-host checks. Actual Linux/macOS native suites require authorized installed CPython/local profile; mocks/skips never satisfy AC-008. Existing site checks run when available. All docs/evidence/mirror writes precede final verification and readiness.

Validation map: AC-001..AC-007 retain existing cleanup/offer/handoff/integration suites under TASK-009; AC-008 real Linux/macOS operations plus Windows regressions under TASK-006/TASK-009; AC-009 native stale identity/parent/link/hardlink/producer/maintenance/collision/recovery/crash/precision/security barriers under TASK-006/TASK-007/TASK-009; AC-010 mirror/authoring/repository/full aggregate under TASK-009. Out-of-contract writer mismatch is containment evidence and never marked original-invariant PASS. External target absence or registry failures keep whole-branch readiness blocked.
