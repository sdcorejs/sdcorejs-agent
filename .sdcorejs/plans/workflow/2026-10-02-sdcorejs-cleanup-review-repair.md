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
  - test/e2e/cleanup-engine.test.mjs
  - _refs/cleanup/cli.mjs
  - package.json
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-integration.md
  - scripts/sync-skills.mjs
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-reference-coverage.md
  - .sdcorejs/summary.md
  - site/src/data/catalog-en.ts
  - site/src/data/catalog.ts
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-discovery-context.md
  - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
  - .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage-v2.json
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-final-handoff.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-review-repair.md
  - test/e2e/cleanup-integration.test.mjs
  - test/e2e/fixtures/cleanup-macos-acl-contract.py
approval_source: parent-selected-F07-F08-F09-repair-under-existing-end-to-end-implementation-authority
approved_at: 2026-10-02T14:42:31.144Z
approved_by: workspace-owner
architecture_context:
  adopted_decision_refs:
    - D-008
    - D-009
  approved_architecture_hash: sha256:v1:bee2dc600827f9f8989a688746010a426f5498ac4c088804a14a887552a6bac2
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
  approved_spec_reference:
    approval_hash: sha256:v1:85d3646781608f01bf845b820664b5f0f9eddc97aeff017a12793211b5dd98af
    artifact_id: sdcorejs-cleanup-posix-spec-r3
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
artifact_id: sdcorejs-cleanup-posix-plan-r8
artifact_kind: plan
change_ref: sdcorejs-cleanup
commit_policy: never
contract_id: sdcorejs-cleanup:v1
coverage_approach: TDD
decision_coverage:
  approved_artifact:
    body: |
      {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"R-009","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"D-008","type":"decision"},{"id":"D-009","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"},{"id":"INV-005","type":"invariant"},{"id":"INV-006","type":"invariant"},{"id":"INV-007","type":"invariant"},{"id":"INV-008","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"R-007","type":"requirement"},{"id":"R-008","type":"requirement"},{"id":"R-009","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"D-008","type":"decision"},{"id":"D-009","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"},{"id":"INV-005","type":"invariant"},{"id":"INV-006","type":"invariant"},{"id":"INV-007","type":"invariant"},{"id":"INV-008","type":"invariant"}],"revision":2,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Add public utility sdcorejs-cleanup with analyze, plan, apply, restore and task-tail actions; default read-only. It is not an implementation track or code refactor.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Evidence, ownership, reproducibility, producer completion and recoverability govern risk. LOW automation needs approved task-scoped policy; MEDIUM needs bounded batch authority; HIGH needs exact file/atomic-group authority; blocked/unknown never downgrade.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Frozen plans bind exact files/actions, content and filesystem/Git/reference state. Revalidate before apply; never expand globs or recursive deletion. Reject symlinks/junctions, nested repositories, submodules, path traversal, active producers, sensitive paths and unknown owners.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Execute authorized fixture cleanup, quarantine and collision-safe restore with accurate partial receipts and separate active-path removal, quarantine bytes and reclaimed bytes. No cleanup on real user data in this implementation session.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Preserve approved artifacts, durable history, diagnostic/recovery evidence, public assets, generated mirrors, intentional brand/fixture copies and unknown references. Absence of grep/import/mtime is never unused proof. Near duplicates are review-only.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Explorer and other workflows emit runtime signals to one coordinator; one significant scoped offer, decline deduplication and session-wide suppression. Accepting analysis never authorizes mutation. No global queue, daemon or mutable manifest.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-007","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Task-tail cleanup only current-task artifacts after tests/review/repair and durable finalization, before affected verification, convergence and final branch-ready. Preserve failed/interrupted evidence; later mutations invalidate readiness.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-008","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"approved-artifact","statement":"Update canonical public inventory/routing/ceiling through the existing typed authoring approval gate, official mirrors, documentation and meaningful deterministic tests. No staging, commits, pushes, PRs, merges or publication.","status":"active","task_refs":["TASK-006","TASK-009"],"type":"requirement"},{"id":"R-009","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Provide Windows/Linux/macOS cleanup operations with exact authority and native capability evidence.","status":"active","task_refs":["TASK-005","TASK-006","TASK-007","TASK-008","TASK-009"],"type":"requirement"},{"behavior":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","id":"AC-001","requirement_refs":["R-009"],"statement":"Approved LOW task temporary files are removed while needed diagnostics, unrelated files and active producers remain.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","id":"AC-002","requirement_refs":["R-009"],"statement":"Frozen file/reference/directory/Git/ownership drift blocks stale apply without deleting unexpected files.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","id":"AC-003","requirement_refs":["R-009"],"statement":"Quarantine and restore work; occupied destinations and altered quarantine bytes fail without overwrite.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","id":"AC-004","requirement_refs":["R-009"],"statement":"Dynamic/copy/public assets, immutable and historical docs, unique superseded docs, mirrors and intentional duplicates are protected or unknown; exact redundant/abandoned nonunique candidates require scoped authority.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","id":"AC-005","requirement_refs":["R-009"],"statement":"Significant signals offer once; weak signals do not; worker duplicates collapse; declines and session disabling propagate; analysis approval cannot mutate.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","id":"AC-006","requirement_refs":["R-009"],"statement":"Traversal, external links/junctions, nested Git/submodule and parallel cleanup boundaries fail closed; partial apply reports exact completed/retained/failed state.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","id":"AC-007","requirement_refs":["R-009"],"statement":"Public skill direct dispatch, canonical mirror generation, 24-skill inventory, authoring gates and existing repository verification remain valid.","task_refs":["TASK-006","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","id":"AC-008","requirement_refs":["R-009"],"statement":"Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","id":"AC-009","requirement_refs":["R-009"],"statement":"Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","blocking":true,"evidence_refs":["EVIDENCE-006","EVIDENCE-009"],"expected_result":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","id":"AC-010","requirement_refs":["R-009"],"statement":"Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":true,"confidence":"high","consequence_if_wrong":"Block mutation and report unsupported admission/capability; do not claim completed platform support.","evidence_refs":["EVIDENCE-005","EVIDENCE-009"],"id":"A-001","impacted_refs":["R-009","AC-008","AC-009"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"Confirmed operating contract, not a claim that advisory locking excludes hidden same-user writers.","source":"explicit","statement":"POSIX mutation admits only declared maintenance: known producers finish and all relevant name/content writers stay quiescent or share one stable fence, including retained writable descriptors and children.","status":"confirmed","task_refs":["TASK-005","TASK-007","TASK-009"],"type":"assumption","validation_method":"User choice Sentinel_052de22014888191958bf0663470b688; trusted harness supplies current scoped owner/participant evidence and generation; actual native admission fixtures verify rejection."},{"blocking":true,"confidence":"high","consequence_if_wrong":"Block mutation and report unsupported admission/capability; do not claim completed platform support.","evidence_refs":["EVIDENCE-005","EVIDENCE-009"],"id":"A-002","impacted_refs":["R-009","AC-008","AC-009"],"owner":"github.com/sdcorejs/sdcorejs-agent","rationale":"Confirmed operating contract, not a claim that advisory locking excludes hidden same-user writers.","source":"explicit","statement":"Runtime/filesystem availability is target-specific and unknown until a mandatory capability/security check; missing evidence blocks effects, without installation or fallback.","status":"confirmed","task_refs":["TASK-005","TASK-007","TASK-009"],"type":"assumption","validation_method":"Independent review runtime contract; read-only target probe and real native acceptance results, with unavailable OS recorded NOT_RUN."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004","INV-005","INV-006","INV-007","INV-008","R-001","R-002","R-003","R-004","R-005","R-006","R-007","R-008","R-009"],"id":"D-008","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which POSIX transaction boundary implements approved portability?","rationale":"User Sentinel_052de22014888191958bf0663470b688 approved maintenance and parent explicitly delegated review-corrected end-to-end implementation.","revisit_condition":"Missing capability or changed operating contract returns to planning.","scope":"repository","selected_value":"Capture only the exact approved object under declared maintenance; verify recovery before capture; conflicts are partial contract breaches, never authorized replacement mutation.","source":"explicit-user","statement":"Capture only the exact approved object under declared maintenance; verify recovery before capture; conflicts are partial contract breaches, never authorized replacement mutation.","status":"approved","supersedes":null,"task_refs":["TASK-005","TASK-007","TASK-009"],"type":"decision","validation_boundary":{"kind":"authorization","source_refs":["AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004","INV-005","INV-006","INV-007","INV-008","R-001","R-002","R-003","R-004","R-005","R-006","R-007","R-008","R-009"]}},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-009","AC-008","AC-009","INV-006","INV-007","INV-008"],"id":"D-009","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Which existing native runtime implements approved portability?","rationale":"User Sentinel_052de22014888191958bf0663470b688 approved maintenance and parent explicitly delegated review-corrected end-to-end implementation.","revisit_condition":"Missing capability or changed operating contract returns to planning.","scope":"repository","selected_value":"Use a resolved trusted existing CPython >=3.11 via -I -S -B, canonical hash-bound stdlib/ctypes helper, exact lossless state and fail-closed local filesystem/native capability checks.","source":"explicit-user","statement":"Use a resolved trusted existing CPython >=3.11 via -I -S -B, canonical hash-bound stdlib/ctypes helper, exact lossless state and fail-closed local filesystem/native capability checks.","status":"approved","supersedes":null,"task_refs":["TASK-005","TASK-007","TASK-009"],"type":"decision"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-001","protected_refs":["R-009","AC-009"],"statement":"No mutation without exact authority and current state.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-002","protected_refs":["R-009","AC-009"],"statement":"No deletion inferred from local_only, age, naming, AI generation, exact hash equality or missing local consumer.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-003","protected_refs":["R-009","AC-009"],"statement":"No writes after final branch-ready without rerunning the final gates.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-004","protected_refs":["R-009","AC-009"],"statement":"Approved history and unrelated repositories/data remain intact.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-005","protected_refs":["R-009","AC-009"],"statement":"Use built-in Node and existing OS facilities only; no installed dependency, new daemon, provider dependency, codegraph or vector database. Windows mutations use pinned root-relative native handles through existing PowerShell. A platform without an available atomic backend remains read-only and fails closed for mutation.","task_refs":["TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-006","protected_refs":["R-009","AC-008","AC-009"],"statement":"A frozen POSIX boundary binds helper/runtime identity, maintenance generation/evidence, approved object and exact transaction paths; analysis and legacy policies cannot authorize it.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-007","protected_refs":["R-009","AC-008","AC-009"],"statement":"Unexpected capture is a retained partial contract breach, not successful cleanup; recovery/restore never overwrite, auto-compensate or delete unknown objects.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"},{"evidence_refs":["EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-009"],"id":"INV-008","protected_refs":["R-009","AC-008","AC-009"],"statement":"Only exact revalidated objects under admitted maintenance may commit; missing runtime, security, primitive or filesystem proof blocks without changing permissions.","task_refs":["TASK-005","TASK-006","TASK-007","TASK-009"],"type":"invariant"}],"revision":2,"schema_version":1}
    metadata:
      allowed_paths:
        - "**"
      approval_hash: sha256:v1:577ca66737c739120c5a03552fc019f201e3a9d6c4c13464db219b6e07c9ba84
      approval_source: user-approved-decision-coverage
      approved_at: 2026-10-02T12:40:02.265Z
      approved_by: workspace-owner
      artifact_id: decision-coverage-r2
      artifact_kind: plan
      change_ref: sdcorejs-cleanup-posix
      contract_id: decision-coverage:v1
      delegated_authority_source: delegated-implementation-of-approved-cleanup-maintenance-and-validation-contract
      owner_module_id: null
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_repository_role: standalone
      parent_references: []
      parent_repository_id: null
      prohibited_paths: []
      repository_relative_path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage-v2.json
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
      revision: 2
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
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
      validation_boundary:
        kind: authorization
        source_refs:
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
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - R-009
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
  revision: 2
  schema_version: 1
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
execution_policy: sequential
goal_backward_review:
  critique_history:
    - blockers:
        - SELECTED-REPAIR-FIXTURE-SCOPE
      checker_version: sdcorejs-plan:goal-backward:v1
      resolved_blockers:
        - SELECTED-REPAIR-FIXTURE-SCOPE
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
        revision: 2
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
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - R-009
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
        validation_boundary:
          kind: authorization
          source_refs:
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
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
            - R-007
            - R-008
            - R-009
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
    revision: 2
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
          - test/e2e/cleanup-engine.test.mjs
          - _refs/cleanup/cli.mjs
          - package.json
          - scripts/sync-skills.mjs
          - .sdcorejs/summary.md
          - site/src/data/catalog-en.ts
          - site/src/data/catalog.ts
          - test/e2e/cleanup-integration.test.mjs
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
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-integration.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-reference-coverage.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-discovery-context.md
          - owner_task_id: TASK-005
            path: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
          - owner_task_id: TASK-005
            path: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage-v2.json
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-final-handoff.md
          - owner_task_id: TASK-005
            path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-review-repair.md
          - owner_task_id: TASK-006
            path: test/e2e/fixtures/cleanup-macos-acl-contract.py
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
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-integration.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-reference-coverage.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-discovery-context.md
        - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
        - .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-coverage-v2.json
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-posix-final-handoff.md
        - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-review-repair.md
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
        - test/e2e/cleanup-engine.test.mjs
        - test/e2e/cleanup-integration.test.mjs
        - test/e2e/fixtures/cleanup-macos-acl-contract.py
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
        - _refs/cleanup/cli.mjs
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
        - package.json
        - scripts/sync-skills.mjs
        - .sdcorejs/summary.md
        - site/src/data/catalog-en.ts
        - site/src/data/catalog.ts
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
  - approval_hash: sha256:v1:bee2dc600827f9f8989a688746010a426f5498ac4c088804a14a887552a6bac2
    artifact_id: sdcorejs-cleanup-posix-architecture-r3
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
parent_repository_id: null
prohibited_paths:
  - .env*
  - "**/*lock.json"
  - package-lock.json
  - .git/**
  - _refs/cleanup/safe-file-operation.ps1
  - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-native-boundary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-finalization.md
  - .sdcorejs/approvals/**
repository_relative_path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-review-repair.md
requirement_id: R-009
schema_version: 1
source_architecture: .sdcorejs/architecture/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
source_spec: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-validation.md
stack_profile: markdown-skill-pack
supersedes: sdcorejs-cleanup-posix-plan-r7
track: workflow
validation_map:
  - acceptance_criterion_id: AC-001
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac001
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Approved LOW task temporary files are removed while needed
      diagnostics, unrelated files and active producers remain.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-002
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac002
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Frozen file/reference/directory/Git/ownership drift blocks stale
      apply without deleting unexpected files.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-003
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac003
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Quarantine and restore work; occupied destinations and altered
      quarantine bytes fail without overwrite.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-004
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac004
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Dynamic/copy/public assets, immutable and historical docs,
      unique superseded docs, mirrors and intentional duplicates are protected
      or unknown; exact redundant/abandoned nonunique candidates require scoped
      authority.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-005
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac005
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Significant signals offer once; weak signals do not; worker
      duplicates collapse; declines and session disabling propagate; analysis
      approval cannot mutate.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-006
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac006
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Traversal, external links/junctions, nested Git/submodule and
      parallel cleanup boundaries fail closed; partial apply reports exact
      completed/retained/failed state.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-007
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac007
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Public skill direct dispatch, canonical mirror generation,
      24-skill inventory, authoring gates and existing repository verification
      remain valid.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
  - acceptance_criterion_id: AC-008
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac008
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Actual apply, quarantine, archive, delete and restore succeed on
      each declared real supported runtime/filesystem.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: Required actual Linux ext4/macOS APFS native runs remain NOT_RUN;
      Windows skips provide no native acceptance proof.
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: partial
  - acceptance_criterion_id: AC-009
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac009
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Cooperative maintenance, exact objects, verified
      copy-before-removal, interruption and collision receipts preserve original
      authority invariants.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: Required actual Linux ext4/macOS APFS native runs remain NOT_RUN;
      Windows skips provide no native acceptance proof.
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: partial
  - acceptance_criterion_id: AC-010
    acknowledgement_required: false
    authorization_boundary: true
    automation: automated
    boundary:
      approval_ref: D-008
      kind: authorization
      source_refs:
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
        - R-001
        - R-002
        - R-003
        - R-004
        - R-005
        - R-006
        - R-007
        - R-008
        - R-009
    case_ids:
      - case-cleanup-ac010
    command_source: package.json
    cwd: .
    evidence_class: FULL_E2E
    evidence_refs:
      - EVIDENCE-005
      - EVIDENCE-006
      - EVIDENCE-007
      - EVIDENCE-009
    expected_proof: Windows native guarantees, F01-F06, governed finish gates and
      official mirrors remain valid.
    invariant_refs:
      - INV-001
      - INV-002
      - INV-003
      - INV-004
      - INV-005
      - INV-006
      - INV-007
      - INV-008
    levels:
      - integration
      - api-e2e
    module_e2e: false
    module_id: null
    owner: null
    owner_repository_id: null
    planned_command: npm run test:e2e:cleanup
    rationale: null
    requirement_id: R-009
    risk: exact cleanup authorization and recovery
    status: covered
approval_hash: sha256:v1:498098cddf29618319f0c37b5fac989848fd77034610a77db4a78fe919a15e1f
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


# Implementation integration amendment

This new snapshot supersedes the implementation path list of plan r2 without editing its approved bytes. The existing user maintenance decision and parent's explicit end-to-end implementation authorization cover these routine integration changes; no new operating assumption or mutation authority is introduced.

TASK-006 additionally EDIT test/e2e/cleanup-engine.test.mjs: preserve the shared classification, authority, consumer-coverage and recovery assertions on Windows. On Linux/macOS use an explicitly supplied trusted fixture parent and existing Python capability, frozen boundary, current maintenance and the real stable writer fence. Do not silently skip a native failure or treat Windows results as POSIX proof. Windows-specific allocation/handle fixtures remain explicitly Windows-only.

TASK-007 additionally EDIT _refs/cleanup/cli.mjs: preserve the supplied POSIX boundary in plan mode; apply and restore retain the separately supplied current maintenance. No ambient authority or automatic runtime discovery is added.

TASK-008 additionally EDIT package.json SCRIPTS ONLY: append the two new fixture files to the existing test:e2e:cleanup command so the repository and aggregate suites execute them. Every dependency, engine, package-manager and lockfile field remains byte-equivalent in value. The earlier plan's prohibition of package.json is narrowed only for this scripts edit; dependency or lockfile changes remain prohibited.

TASK-005 CREATE this new plan snapshot after canonical goal-backward and architecture gates. All prior approved artifacts remain immutable. All other r2 paths, owners, task dependencies, admission prerequisites and validation obligations remain in force. Actual Linux/macOS fixtures remain NOT_RUN if an authorized installed target is unavailable; implementation does not satisfy their release gates by itself.


# Python reference coverage amendment

TASK-008 additionally EDIT scripts/sync-skills.mjs: include .py canonical source in the existing text/reference validation filter and exact ref-path recognizer. This routine integration necessity follows the parent's existing end-to-end authorization and preserves the canonical generation path. No inventory, dependency, permission or runtime assumptions change. All previous snapshots remain immutable.


# Discovery and context integration amendment

TASK-008 additionally EDIT .sdcorejs/summary.md, site/src/data/catalog-en.ts and site/src/data/catalog.ts. The parent's end-to-end implementation assignment makes the sequential integration owner responsible for refreshing derived repository context after this architecture change. Use the actual sdcorejs-explore summary-refresh authority, authoring-repo, redaction and fingerprint gates. Site discovery must disclose Windows local-drive apply/restore and the admitted POSIX maintenance/runtime/profile prerequisites before selection. Preserve English canonical skill sources and existing site locale marks. No obsolete test expectation is weakened. All prior approved snapshots and immutable execution history remain intact.


# Validation metadata completion

This fresh derived snapshot preserves the approved maintenance operating model, exact-object authority, native profiles and all original requirements/invariants. Parent end-to-end implementation authorization assigns their routine typed validation mapping to the integration owner. D-008 now explicitly projects the existing cleanup authorization boundary and original requirement/criterion/invariant IDs for the canonical validation-map consumer. No new operating assumption, weaker invariant, mutation permission or platform PASS is approved. The coverage artifact is re-sealed with the actual delegated-authority timestamp; the canonical helper's fixed fixture date is not used as this execution's approval date. All predecessors remain immutable.

TASK-005 CREATE these four validation snapshots after canonical approval/architecture checks. TASK-009 consumes the typed validation map and records required missing platform evidence as a blocking partial status. Node API denial and actual native filesystem operations are the cleanup API boundary; no HTTP application is invented. Each case ID is a criterion group mapped to the actual cleanup fixture files, not an assertion that native OS tests have run. Convergence and branch-ready cannot pass before this validation gate and independent review succeed.


# Final command discovery binding

TASK-005 CREATE this final plan revision. Every validation row now uses the exact discovered npm run test:e2e:cleanup script from package.json, which includes the real POSIX fixture files. The same command must execute on each declared native target with its explicit fixture/runtime inputs; the Windows run does not satisfy missing Linux/macOS rows. No subset command is mislabeled as an exact package script. All other current spec/architecture/operating boundaries and prior immutable snapshots remain intact.


# Selected independent review repair scope

The parent explicitly selected F07, F08 and F09 from SDCoreJS-Cleanup-POSIX-Independent-Review.md (SHA-256 8d30ca0772532688029dede124bccdc7b03fab5aa34d0cf568b1a62179ccb3fd) and assigned repairs plus deterministic regressions under the existing end-to-end implementation authority. This technical plan revision records that selected scope; it does not invent a new user operating decision or a passed independent review.

TASK-005 CREATE .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-review-repair.md. TASK-006 additionally EDIT test/e2e/cleanup-integration.test.mjs to exercise current maintenance, plan and restore boundary contracts, and CREATE test/e2e/fixtures/cleanup-macos-acl-contract.py for deterministic admitted/refused Darwin ACL API-result cases. TASK-007 repairs the checked BigInt stat size normalization and absent-ACL ENOENT outcome in the existing runtime scope; TASK-008 refreshes only the official runtime mirrors. Existing regression assertions remain intact.

The ACL API-result fixture is deterministic contract evidence, not execution on macOS. Linux ext4 and macOS local APFS native execution and targeted independent re-verification remain required. AC-008 and AC-009 retain partial validation and block acceptance, convergence and branch readiness. The existing cooperative quiescent maintenance decision, read-only fail-closed profiles and no authority over replacements remain unchanged. Prior plan/spec/architecture/authoring records and both earlier source snapshots are immutable. Hosted CI transport has its separate bounded publication authority and is not implementation plan scope.
