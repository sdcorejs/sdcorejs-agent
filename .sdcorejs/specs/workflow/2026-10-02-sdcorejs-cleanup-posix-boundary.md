---
approval_source: explicit-user-Sentinel_052de22014888191958bf0663470b688-and-delegated-implementation
approved_at: 2026-10-02T11:20:06.125Z
approved_by: workspace-owner
artifact_id: sdcorejs-cleanup-posix-spec-r2
artifact_kind: spec
change_ref: sdcorejs-cleanup
commit_policy: never
contract_id: sdcorejs-cleanup:v1
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
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
repository_relative_path: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-posix-boundary.md
requirement_id: R-009
schema_version: 1
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
stack_profile: markdown-skill-pack
supersedes: sdcorejs-cleanup-spec-native-boundary
track: workflow
approval_hash: sha256:v1:d9faca286b46c0e33038356c979621b5ba2ff912421a8606da06969ae0705a09
---

# POSIX cleanup supplemental requirement

Authority: user Sentinel_052de22014888191958bf0663470b688 chose coordinated maintenance at 2026-10-02 11:07 UTC; parent source thread 01a0f150-bea1-72db-a886-5d41358b400a explicitly directed reviewed implementation/verification. Three-platform coverage was already approved. No real user-data cleanup, runtime install, Docker/CI start, ACL/security change or Git artifact delivery is authorized.

This supplements native spec sha256:v1:e634b4e4e29fa034b23a2d0b1dad87e5b235217f07a2fbc0fd3cfab99b626cda and finalization plan sha256:v1:26422565014629a7252782cb910fcc71e90dc10474b6a11f761a3f492a533906; all older snapshots remain immutable. F06 baseline: 1673 paths, 5369b088488f511151dcb95282c88a5b9776090fcc3ecea25e99de28268ef660. Original INV-001 through INV-005 and AC-001 through AC-007 are preserved. There is no authority to move an unexpected replacement.

R-009: Provide Windows/Linux/macOS cleanup operations with exact authority and native capability evidence.

AC-008: Actual apply, quarantine, archive, delete and restore succeed on each declared real supported runtime/filesystem.

AC-009: Cooperative maintenance, exact objects, verified copy-before-removal, interruption and collision receipts preserve original authority invariants.

AC-010: Windows native guarantees, F01-F06, governed finish gates and official mirrors remain valid.

A-001: POSIX mutation admits only declared maintenance: known producers finish and all relevant name/content writers stay quiescent or share one stable fence, including retained writable descriptors and children.

A-002: Runtime/filesystem availability is target-specific and unknown until a mandatory capability/security check; missing evidence blocks effects, without installation or fallback.

D-008: Capture only the exact approved object under declared maintenance; verify recovery before capture; conflicts are partial contract breaches, never authorized replacement mutation.

D-009: Use a resolved trusted existing CPython >=3.11 via -I -S -B, canonical hash-bound stdlib/ctypes helper, exact lossless state and fail-closed local filesystem/native capability checks.

INV-006: A frozen POSIX boundary binds helper/runtime identity, maintenance generation/evidence, approved object and exact transaction paths; analysis and legacy policies cannot authorize it.

INV-007: Unexpected capture is a retained partial contract breach, not successful cleanup; recovery/restore never overwrite, auto-compensate or delete unknown objects.

INV-008: Only exact revalidated objects under admitted maintenance may commit; missing runtime, security, primitive or filesystem proof blocks without changing permissions.

Maintenance admission requires a root/task-scoped owner attestation, generation and evidence for each known producer, watcher/editor, ancestor-name mutator, apply/restore worker and retained writable descriptor/child. Known active or uncertain actors block; the cleanup-only mutex or a boolean is insufficient. The owner pauses ordinary outside writers; hidden uncooperative same-user or privileged mutation violates the operating prerequisite and is not excluded by advisory locks. Display this before mutation approval.

An existing resolved CPython executable and helper are hash-bound. Read-only capability/security inspection records exact OS/architecture/version/filesystem and lossless inode/device/nanosecond state. Native no-replace and durability behavior must pass isolated real-OS fixtures before release claims. Initial profiles are Linux local ext4 and Darwin local APFS; unvalidated network/FUSE/overlay/removable profiles, unsafe owner/write access, extended ACLs or BSD flags, disabled ownership checking and unknown ABI fail closed. No chmod/chown/ACL correction or install is performed. Missing actual OS test environments remain release blockers, not approved test passes.

Recovery/archive bytes are copied exclusively from the approved source descriptor and verified before active-path capture. The same-filesystem exact capture slot, immutable intent/phase journal and restore slots are frozen in approval. Pin parents, immediately revalidate source/parents and maintenance, capture exclusively, revalidate captured identity/content, then remove only that private validated entry. Bind exact pre-state and account explicitly for rename ctime transition; never accept arbitrary post-state. Capture does not itself establish recovery.

Persist PREPARED, RECOVERY_VERIFIED (when required), CAPTURED, VALIDATED, COMMITTED and VERIFIED. An unexpected captured object stops the batch and is retained with actual displacement, unknown/partial state and contract_breach=true. No overwrite rollback, automatic compensation, stale-batch resume or cleanup success is allowed. Restart inspects exact journals under separate current recovery authority. Committed delete is irreversible unless separately approved retention supplied it. Restore publishes an exclusive verified copy and retains recovery until publication is verified/durable. Report logical active bytes, held recovery bytes, source allocation and unmeasured net volume reclaim separately.
