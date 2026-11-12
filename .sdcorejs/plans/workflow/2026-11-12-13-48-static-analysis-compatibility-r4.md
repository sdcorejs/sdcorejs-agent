---
allowed_paths:
  - "test/e2e/static-analysis-compatibility-contract.test.mjs"
  - "package.json"
  - "_refs/shared/static-analysis-compatibility.md"
  - "_refs/angular/write-code/admin-screens.md"
  - "_refs/angular/templates/init-module-templates.md"
  - "_refs/angular/architecture-principles.md"
  - "_refs/angular/write-code/init-entity.md"
  - "_refs/angular/generator/generate-golden-project.mjs"
  - "_refs/angular/orchestrator-generation.md"
  - "_refs/angular/review-code.md"
  - "_refs/angular/review-accessibility.md"
  - "_refs/angular/review-security.md"
  - ".claude/_refs/shared/static-analysis-compatibility.md"
  - "plugin/_refs/shared/static-analysis-compatibility.md"
  - "codex/skills/_refs/shared/static-analysis-compatibility.md"
  - ".claude/_refs/angular/write-code/admin-screens.md"
  - "plugin/_refs/angular/write-code/admin-screens.md"
  - "codex/skills/_refs/angular/write-code/admin-screens.md"
  - ".claude/_refs/angular/templates/init-module-templates.md"
  - "plugin/_refs/angular/templates/init-module-templates.md"
  - "codex/skills/_refs/angular/templates/init-module-templates.md"
  - ".claude/_refs/angular/architecture-principles.md"
  - "plugin/_refs/angular/architecture-principles.md"
  - "codex/skills/_refs/angular/architecture-principles.md"
  - ".claude/_refs/angular/write-code/init-entity.md"
  - "plugin/_refs/angular/write-code/init-entity.md"
  - "codex/skills/_refs/angular/write-code/init-entity.md"
  - ".claude/_refs/angular/generator/generate-golden-project.mjs"
  - "plugin/_refs/angular/generator/generate-golden-project.mjs"
  - "codex/skills/_refs/angular/generator/generate-golden-project.mjs"
  - ".claude/_refs/angular/orchestrator-generation.md"
  - "plugin/_refs/angular/orchestrator-generation.md"
  - "codex/skills/_refs/angular/orchestrator-generation.md"
  - ".claude/_refs/angular/review-code.md"
  - "plugin/_refs/angular/review-code.md"
  - "codex/skills/_refs/angular/review-code.md"
  - ".claude/_refs/angular/review-accessibility.md"
  - "plugin/_refs/angular/review-accessibility.md"
  - "codex/skills/_refs/angular/review-accessibility.md"
  - ".claude/_refs/angular/review-security.md"
  - "plugin/_refs/angular/review-security.md"
  - "codex/skills/_refs/angular/review-security.md"
  - ".sdcorejs/summary.md"
  - ".sdcorejs/docs/workflow/*static-analysis-compatibility*"
  - ".sdcorejs/specs/workflow/*static-analysis-compatibility*.md"
  - ".sdcorejs/plans/workflow/*static-analysis-compatibility*.md"
approval_source: "explicit-user-choice"
approved_architecture_hash: null
approved_architecture_reference: null
approved_at: "2026-11-12T06:48:56.940Z"
approved_by: "user"
approved_spec_hash: "sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b"
approved_spec_reference:
  approval_hash: "sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b"
  artifact_id: "spec-static-analysis-compatibility-20261112-r3"
  repository_id: "github.com/sdcorejs/sdcorejs-agent"
  repository_relative_path: ".sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md"
  revision: "1d985025536ccde105b4dd3cf88e20f71e18f3c1"
artifact_id: "plan-static-analysis-compatibility-20261112-r4"
artifact_kind: "plan"
change_control:
  change_reason: "Traceability for delivery convergence on spec r3: per-task requirement/AC/invariant/risk links, AC-010 validation row, and TASK-001 splits the advisory contract case into executor (AC-007) and review (AC-010) cases."
  revision: 4
  supersedes: "plan-static-analysis-compatibility-20261112-r3"
change_ref: "static-analysis-compatibility-20261112"
commit_policy: "with-change"
contract_id: "static-analysis-compatibility-20261112"
dependency_changes:
  approval_required: false
  required: false
dependency_order:
  - "sdcorejs-agent"
description: "Approved TDD plan for analyzer-neutral Angular generation and advisory static-analysis review guidance."
document_review_performed: false
env_changes:
  approval_required: false
  required: false
execution_host_repository_id: "github.com/sdcorejs/sdcorejs-agent"
gitlink_updates_in_scope: false
instruction_reference: "conversation/2026-11-12/plan-r4-approval-gate/user-reply-1"
integration_owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
migration_changes:
  approval_required: false
  required: false
name: "static-analysis-compatibility"
owner: "sdcorejs-plan"
owner_module_id: null
owner_repository_id: "github.com/sdcorejs/sdcorejs-agent"
owner_repository_role: "standalone"
parent_references:
  -
    approval_hash: "sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b"
    artifact_id: "spec-static-analysis-compatibility-20261112-r3"
    artifact_kind: "spec"
    repository_id: "github.com/sdcorejs/sdcorejs-agent"
    revision: "1d985025536ccde105b4dd3cf88e20f71e18f3c1"
parent_repository_id: null
phase_count: 3
prohibited_paths:
  - "skills/**"
  - "AGENTS.md"
  - "CLAUDE.md"
  - ".github/**"
  - "site/**"
  - "scripts/**"
  - "package-lock.json"
  - "_refs/shared/system-registry.json"
  - "_refs/harness/**"
  - ".cursor/**"
  - "**/sdcorejs-harness.json"
repository_relative_path: ".sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md"
requirement_id: "R-001"
schema_version: 1
sourceSpecPath: ".sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md"
source_architecture: "none"
source_plan: "none"
source_revision: "1d985025536ccde105b4dd3cf88e20f71e18f3c1"
source_spec: ".sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md"
stack_profile: "markdown-skill-pack"
supersedes: "plan-static-analysis-compatibility-20261112-r3"
target_root_kind: "sdcorejs-agent-authoring-repo"
task_count: 10
track: "workflow"
verification_strategy:
  commands_planned:
    - "npm run test:e2e:static-analysis - RED for the two new case names, then GREEN 9/9 (AC-001..AC-008, AC-010)"
    - "npm run check:skills - mirrors match canonical sources (AC-009)"
    - "npm run check:text-hygiene - text hygiene (AC-009)"
    - "npm run test:e2e:angular, npm run test:e2e:phase1, npm run test:e2e:skill-audit - existing tests that read changed files"
    - "repository list of npm run test:e2e:repository (AC-009); its cleanup tail is reported separately on Windows"
    - "git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)"
  package_manager: "npm"
approval_hash: "sha256:v1:f9faeaabd8814be37611692d00c36ba5d3ad9206e69d9ff43978634d450d466d"
approved_plan_hash: "sha256:v1:f9faeaabd8814be37611692d00c36ba5d3ad9206e69d9ff43978634d450d466d"
---
# Tương thích phân tích tĩnh cho code Angular do skill sinh - Approved Plan r4

> Hợp đồng thực thi bất biến, được người dùng duyệt bằng phản hồi "Duyệt r4" ngày 12/11/2026; supersede `.sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md`. Nếu hợp đồng thay đổi, tạo revision mới qua `sdcorejs-plan`; không sửa snapshot này.

## Approved contract

Phần dưới giữ nguyên bản nháp đã trình duyệt. Khối `plan_context` trong bản nháp là trạng thái lúc trình duyệt; mục "Final plan context" phía sau là ngữ cảnh thực thi có ràng buộc phê duyệt.

# Plan r4 - Tương thích phân tích tĩnh cho code Angular do skill sinh - 2026-11-12

Nguồn: spec đã duyệt `.sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md` (`sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b`). Supersede `.sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md` (`plan-static-analysis-compatibility-20261112-r3`).

## Thay đổi so với r3

Bổ sung traceability để evaluator delivery convergence chạy được trên spec r3: mỗi task liên kết hai chiều với requirement, AC, invariant và risk của các dòng validation; thêm dòng validation cho AC-010; invariant mới INV-003/INV-004 có task và evidence. Thay đổi code duy nhất: TASK-001 tách case kiểm advisory thành hai case. TASK-002..TASK-010 đã thực thi và verify theo r2 (commit `1d98502`), không đổi.

## Execution context

- Track: `workflow`; target root kind: `sdcorejs-agent-authoring-repo`; stack profile: `markdown-skill-pack`.
- Coverage approach: TDD (D-004) - chạy RED với hai tên case mới trước khi tách xong, rồi GREEN.
- Architecture: `not-applicable` (`docs-only`), `architecture_context: null`.
- Parallel: không.

## Tasks

### Phase 1 - RED/GREEN cho phần còn lại
1. TASK-001 EDIT `github.com/sdcorejs/sdcorejs-agent:test/e2e/static-analysis-compatibility-contract.test.mjs` - tách `case-sac-advisory-evidence-gated` thành `case-sac-executor-advisory-evidence-gated` (ref dùng chung + `orchestrator-generation.md` + kiểm INV-001 registry/dependency) và `case-sac-review-advisory` (`review-code.md` advisory + AG-3 giữ nguyên). Không đổi các case khác.
2. TASK-002 `package.json` - đã làm ở r2 (script `test:e2e:static-analysis`, file test trong `test:e2e:repository`).

### Phase 2 - Ref và ví dụ Angular (đã làm ở r2)
3. TASK-003 ref dùng chung. 4. TASK-004 `admin-screens.md`. 5. TASK-005 `init-module-templates.md`. 6. TASK-006 `architecture-principles.md`, `init-entity.md`. 7. TASK-007 golden generator. 8. TASK-008 `orchestrator-generation.md`. 9. TASK-009 ba file review.

### Phase 3 - Mirror và verify
10. TASK-010 mirror (đã sinh ở r2; file test không có mirror). Verify lại toàn bộ trên HEAD cuối, rồi delivery convergence và branch-ready trước khi push.

## Acceptance mapping
- AC-001 -> TASK-001, TASK-004
- AC-002 -> TASK-001, TASK-005
- AC-003 -> TASK-001, TASK-004, TASK-006, TASK-008
- AC-004 -> TASK-001, TASK-007
- AC-005 -> TASK-001, TASK-003, TASK-008, TASK-009
- AC-006 -> TASK-001, TASK-003
- AC-007 -> TASK-001, TASK-008
- AC-008 -> TASK-001, TASK-003, TASK-009
- AC-009 -> TASK-002, TASK-010
- AC-010 -> TASK-001, TASK-009

## Invariant and risk mapping
- INV-001 -> TASK-001, TASK-002, TASK-008, TASK-009, TASK-010; INV-002 -> TASK-001, TASK-002, TASK-003, TASK-009, TASK-010; INV-003 -> TASK-001, TASK-004, TASK-005, TASK-006, TASK-007, TASK-008; INV-004 -> TASK-001, TASK-003, TASK-008, TASK-009
- RISK-001: AC-005, AC-006, AC-007, AC-010; RISK-002: AC-001..AC-004; RISK-003: AC-008; RISK-004: AC-009.

## Verification
- `npm run test:e2e:static-analysis` (9 case), `npm run check:skills`, `npm run check:text-hygiene`
- `npm run test:e2e:angular`, `npm run test:e2e:phase1`, `npm run test:e2e:skill-audit`, danh sách repository của `test:e2e:repository`
- Bỏ qua cục bộ: `test:e2e:angular:golden`, `cleanup-engine.test.mjs` (CI Linux)

## Self-review
- decision_coverage stage plan: 0 lỗi, 0 blocker, 0 gap (revision 3 trên spec r3).
- goal-backward: 1 vòng sạch; validation map 12 dòng approval-ready; architecture pre-plan handoff hợp lệ.
- Chạy thử delivery convergence trong bộ nhớ với mô hình này: CONVERGED (bằng chứng thật sẽ chạy sau khi thực thi).

## Structured plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: docs-only
      rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
    rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
    blockers: []
    blocker_messages: []
  architecture_context: null
  decision_coverage:
    schema_version: 1
    revision: 3
    records:
      - id: R-001
        type: requirement
        statement: Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.
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
          - TASK-008
      - id: R-002
        type: requirement
        statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
      - id: R-003
        type: requirement
        statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-008
      - id: R-004
        type: requirement
        statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-009
      - id: R-005
        type: requirement
        statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-009
      - id: R-006
        type: requirement
        statement: Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-010
      - id: AC-001
        type: acceptance-criterion
        statement: No Angular reference or template example declares an async Angular lifecycle hook.
        behavior: Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.
        expected_result: Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-004
      - id: AC-002
        type: acceptance-criterion
        statement: Every inject() field declaration in Angular templates is readonly.
        behavior: Scan _refs/angular templates and write-code references for class fields initialised with inject().
        expected_result: Every such field is declared readonly; zero non-readonly matches.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-005
      - id: AC-003
        type: acceptance-criterion
        statement: The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.
        behavior: Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.
        expected_result: Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-006
          - TASK-008
      - id: AC-004
        type: acceptance-criterion
        statement: The generated golden Angular test asserts collection size with a size-specific matcher.
        behavior: Generate the golden Angular project and inspect its spec text.
        expected_result: The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-007
      - id: AC-005
        type: acceptance-criterion
        statement: The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.
        behavior: Read the new _refs/shared reference and the Angular write-code and review references.
        expected_result: The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
      - id: AC-006
        type: acceptance-criterion
        statement: The shared reference stays tool- and project-neutral.
        behavior: Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.
        expected_result: The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-007
        type: acceptance-criterion
        statement: Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
        behavior: Read the shared reference and the Angular executor guidance for static-analysis handling.
        expected_result: Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-008
      - id: AC-008
        type: acceptance-criterion
        statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
        behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
        expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-009
      - id: AC-009
        type: acceptance-criterion
        statement: Mirrors and repository checks pass after the change.
        behavior: Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.
        expected_result: All commands exit 0 and generated mirrors match canonical sources.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-002
          - TASK-010
      - id: AC-010
        type: acceptance-criterion
        statement: Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.
        behavior: Read the Angular code and security review references for static-analysis handling.
        expected_result: Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-009
      - id: A-001
        type: assumption
        statement: Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.
        source: inferred
        confidence: medium
        status: validated
        blocking: false
        evidence_refs:
          - sonar-uat-2026-11-12-S3735-count-12
        consequence_if_wrong: Generated navigation code adds maintainability findings and the example needs a follow-up revision.
        validation_method: Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code.
        owner: sdcorejs-plan
        rationale: Changing the example without evidence would add churn against a common floating-promise convention.
        impacted_refs:
          - R-001
      - id: A-002
        type: assumption
        statement: Core UI button hosts render a native button, so keyboard activation already produces a click on the host.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs:
          - sdcorejs-angular-v19.2.15-button-component-native-button
        consequence_if_wrong: Proposing analyzer-configuration handling could hide a real keyboard-access defect.
        validation_method: "Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."
        owner: sdcorejs-plan
        rationale: The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.
        impacted_refs:
          - R-005
          - AC-008
      - id: A-003
        type: assumption
        statement: The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs:
          - generate-golden-project-jasmine-core-5.9.0
        consequence_if_wrong: The generated spec fails to compile or run.
        validation_method: The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9.
        owner: sdcorejs-plan
        rationale: Size-specific matcher is the analyzer-recommended form for Jasmine.
        impacted_refs:
          - AC-004
      - id: D-001
        type: decision
        statement: Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.
        question: How should generated code handle keyboard-equivalent findings on Core UI button hosts?
        selected_value: Keep the click binding; propose analyzer configuration in the target project.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user chose analyzer configuration and rejected unnecessary API changes.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-008
          - INV-002
        task_refs:
          - TASK-003
          - TASK-009
      - id: D-002
        type: decision
        statement: The skill pack stays tool- and project-neutral and gives advisory proposals.
        question: Should the skill pack enforce one organisation's analyzer configuration?
        selected_value: No; neutral guidance with advisory proposals gated by project evidence.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user requires general guidance not biased by one project or company configuration.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - R-003
          - R-004
          - AC-006
          - AC-007
        task_refs:
          - TASK-003
          - TASK-008
          - TASK-009
      - id: D-003
        type: decision
        statement: Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.
        question: Where should static-analysis guidance live?
        selected_value: New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - AC-005
          - INV-001
        task_refs:
          - TASK-003
      - id: D-004
        type: decision
        statement: Use TDD with test/e2e contract tests.
        question: What coverage approach applies?
        selected_value: TDD; write failing contract tests first, then change references.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed in the requirement contract and matches repository practice.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
        task_refs:
          - TASK-001
        validation_boundary:
          kind: none
          source_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
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
      - id: INV-001
        type: invariant
        statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
        protected_refs:
          - R-003
          - R-004
          - AC-007
          - AC-010
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-008
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
      - id: INV-002
        type: invariant
        statement: Core UI button host click bindings in Angular templates remain unchanged.
        protected_refs:
          - R-005
          - AC-008
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-009
          - EVIDENCE-010
      - id: INV-003
        type: invariant
        statement: "Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs."
        protected_refs:
          - R-001
          - AC-001
          - AC-002
          - AC-003
          - AC-004
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-008
      - id: INV-004
        type: invariant
        statement: The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.
        protected_refs:
          - R-002
          - AC-005
          - AC-006
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-008
          - EVIDENCE-009
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
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
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
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
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
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
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
      revision: 3
      records:
        - id: R-001
          type: requirement
          statement: Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.
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
            - TASK-008
        - id: R-002
          type: requirement
          statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
        - id: R-003
          type: requirement
          statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-008
        - id: R-004
          type: requirement
          statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-009
        - id: R-005
          type: requirement
          statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-009
        - id: R-006
          type: requirement
          statement: Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-010
        - id: AC-001
          type: acceptance-criterion
          statement: No Angular reference or template example declares an async Angular lifecycle hook.
          behavior: Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.
          expected_result: Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-004
        - id: AC-002
          type: acceptance-criterion
          statement: Every inject() field declaration in Angular templates is readonly.
          behavior: Scan _refs/angular templates and write-code references for class fields initialised with inject().
          expected_result: Every such field is declared readonly; zero non-readonly matches.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-005
        - id: AC-003
          type: acceptance-criterion
          statement: The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.
          behavior: Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.
          expected_result: Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-006
            - TASK-008
        - id: AC-004
          type: acceptance-criterion
          statement: The generated golden Angular test asserts collection size with a size-specific matcher.
          behavior: Generate the golden Angular project and inspect its spec text.
          expected_result: The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-007
        - id: AC-005
          type: acceptance-criterion
          statement: The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.
          behavior: Read the new _refs/shared reference and the Angular write-code and review references.
          expected_result: The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
        - id: AC-006
          type: acceptance-criterion
          statement: The shared reference stays tool- and project-neutral.
          behavior: Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.
          expected_result: The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-003
        - id: AC-007
          type: acceptance-criterion
          statement: Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
          behavior: Read the shared reference and the Angular executor guidance for static-analysis handling.
          expected_result: Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
          task_refs:
            - TASK-001
            - TASK-008
        - id: AC-008
          type: acceptance-criterion
          statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
          behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
          expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-009
        - id: AC-009
          type: acceptance-criterion
          statement: Mirrors and repository checks pass after the change.
          behavior: Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.
          expected_result: All commands exit 0 and generated mirrors match canonical sources.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-006
          task_refs:
            - TASK-002
            - TASK-010
        - id: AC-010
          type: acceptance-criterion
          statement: Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.
          behavior: Read the Angular code and security review references for static-analysis handling.
          expected_result: Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-004
          task_refs:
            - TASK-001
            - TASK-009
        - id: A-001
          type: assumption
          statement: Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.
          source: inferred
          confidence: medium
          status: validated
          blocking: false
          evidence_refs:
            - sonar-uat-2026-11-12-S3735-count-12
          consequence_if_wrong: Generated navigation code adds maintainability findings and the example needs a follow-up revision.
          validation_method: Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code.
          owner: sdcorejs-plan
          rationale: Changing the example without evidence would add churn against a common floating-promise convention.
          impacted_refs:
            - R-001
        - id: A-002
          type: assumption
          statement: Core UI button hosts render a native button, so keyboard activation already produces a click on the host.
          source: inferred
          confidence: high
          status: validated
          blocking: false
          evidence_refs:
            - sdcorejs-angular-v19.2.15-button-component-native-button
          consequence_if_wrong: Proposing analyzer-configuration handling could hide a real keyboard-access defect.
          validation_method: "Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."
          owner: sdcorejs-plan
          rationale: The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.
          impacted_refs:
            - R-005
            - AC-008
        - id: A-003
          type: assumption
          statement: The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.
          source: inferred
          confidence: high
          status: validated
          blocking: false
          evidence_refs:
            - generate-golden-project-jasmine-core-5.9.0
          consequence_if_wrong: The generated spec fails to compile or run.
          validation_method: The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9.
          owner: sdcorejs-plan
          rationale: Size-specific matcher is the analyzer-recommended form for Jasmine.
          impacted_refs:
            - AC-004
        - id: D-001
          type: decision
          statement: Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.
          question: How should generated code handle keyboard-equivalent findings on Core UI button hosts?
          selected_value: Keep the click binding; propose analyzer configuration in the target project.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: The user chose analyzer configuration and rejected unnecessary API changes.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-005
            - AC-008
            - INV-002
          task_refs:
            - TASK-003
            - TASK-009
        - id: D-002
          type: decision
          statement: The skill pack stays tool- and project-neutral and gives advisory proposals.
          question: Should the skill pack enforce one organisation's analyzer configuration?
          selected_value: No; neutral guidance with advisory proposals gated by project evidence.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: The user requires general guidance not biased by one project or company configuration.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-002
            - R-003
            - R-004
            - AC-006
            - AC-007
          task_refs:
            - TASK-003
            - TASK-008
            - TASK-009
        - id: D-003
          type: decision
          statement: Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.
          question: Where should static-analysis guidance live?
          selected_value: New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-002
            - AC-005
            - INV-001
          task_refs:
            - TASK-003
        - id: D-004
          type: decision
          statement: Use TDD with test/e2e contract tests.
          question: What coverage approach applies?
          selected_value: TDD; write failing contract tests first, then change references.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Confirmed in the requirement contract and matches repository practice.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
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
          task_refs:
            - TASK-001
          validation_boundary:
            kind: none
            source_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
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
        - id: INV-001
          type: invariant
          statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
          protected_refs:
            - R-003
            - R-004
            - AC-007
            - AC-010
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-008
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-008
            - EVIDENCE-009
            - EVIDENCE-010
        - id: INV-002
          type: invariant
          statement: Core UI button host click bindings in Angular templates remain unchanged.
          protected_refs:
            - R-005
            - AC-008
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-003
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-003
            - EVIDENCE-009
            - EVIDENCE-010
        - id: INV-003
          type: invariant
          statement: "Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs."
          protected_refs:
            - R-001
            - AC-001
            - AC-002
            - AC-003
            - AC-004
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
            - TASK-008
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-006
            - EVIDENCE-007
            - EVIDENCE-008
        - id: INV-004
          type: invariant
          statement: The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.
          protected_refs:
            - R-002
            - AC-005
            - AC-006
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-008
            - EVIDENCE-009
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
            - id: A-001
              type: assumption
            - id: A-002
              type: assumption
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
              type: decision
            - id: INV-001
              type: invariant
            - id: INV-002
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
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
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
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
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
        statement: Generated Angular examples stop teaching self-reported analyzer patterns.
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: G-002
        statement: Neutral, advisory static-analysis guidance is reachable from Angular executor and review.
        task_refs:
          - TASK-003
          - TASK-008
          - TASK-009
      - id: G-003
        statement: Regression tests and mirrors keep the change enforced.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-010
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/static-analysis-compatibility-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-010
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - D-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - D-004
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
          - package.json
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-006
              - AC-009
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/shared/static-analysis-compatibility.md
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-002
              - R-005
              - AC-005
              - AC-006
              - AC-008
              - INV-002
              - INV-004
              - D-001
              - D-002
              - D-003
        justification_refs:
          - R-002
          - R-005
          - D-001
          - D-002
          - D-003
        enforces_invariant_refs:
          - INV-002
          - INV-004
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/write-code/admin-screens.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-001
              - AC-001
              - AC-003
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/templates/init-module-templates.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - AC-002
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/architecture-principles.md
          - _refs/angular/write-code/init-entity.md
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-001
              - AC-003
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/generator/generate-golden-project.mjs
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-001
              - AC-004
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/orchestrator-generation.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-001
              - R-002
              - R-003
              - AC-003
              - AC-005
              - AC-007
              - INV-001
              - INV-003
              - INV-004
              - D-002
        justification_refs:
          - R-001
          - R-002
          - R-003
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-003
          - INV-004
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/review-code.md
          - _refs/angular/review-accessibility.md
          - _refs/angular/review-security.md
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-002
              - R-004
              - R-005
              - AC-005
              - AC-008
              - AC-010
              - INV-001
              - INV-002
              - INV-004
              - D-001
              - D-002
        justification_refs:
          - R-002
          - R-004
          - R-005
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
        planned_paths:
          - .claude/_refs/shared/static-analysis-compatibility.md
          - plugin/_refs/shared/static-analysis-compatibility.md
          - codex/skills/_refs/shared/static-analysis-compatibility.md
          - .claude/_refs/angular/write-code/admin-screens.md
          - plugin/_refs/angular/write-code/admin-screens.md
          - codex/skills/_refs/angular/write-code/admin-screens.md
          - .claude/_refs/angular/templates/init-module-templates.md
          - plugin/_refs/angular/templates/init-module-templates.md
          - codex/skills/_refs/angular/templates/init-module-templates.md
          - .claude/_refs/angular/architecture-principles.md
          - plugin/_refs/angular/architecture-principles.md
          - codex/skills/_refs/angular/architecture-principles.md
          - .claude/_refs/angular/write-code/init-entity.md
          - plugin/_refs/angular/write-code/init-entity.md
          - codex/skills/_refs/angular/write-code/init-entity.md
          - .claude/_refs/angular/generator/generate-golden-project.mjs
          - plugin/_refs/angular/generator/generate-golden-project.mjs
          - codex/skills/_refs/angular/generator/generate-golden-project.mjs
          - .claude/_refs/angular/orchestrator-generation.md
          - plugin/_refs/angular/orchestrator-generation.md
          - codex/skills/_refs/angular/orchestrator-generation.md
          - .claude/_refs/angular/review-code.md
          - plugin/_refs/angular/review-code.md
          - codex/skills/_refs/angular/review-code.md
          - .claude/_refs/angular/review-accessibility.md
          - plugin/_refs/angular/review-accessibility.md
          - codex/skills/_refs/angular/review-accessibility.md
          - .claude/_refs/angular/review-security.md
          - plugin/_refs/angular/review-security.md
          - codex/skills/_refs/angular/review-security.md
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-006
              - AC-009
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/static-analysis-compatibility-contract.test.mjs
            - package.json
            - _refs/shared/static-analysis-compatibility.md
            - _refs/angular/write-code/admin-screens.md
            - _refs/angular/templates/init-module-templates.md
            - _refs/angular/architecture-principles.md
            - _refs/angular/write-code/init-entity.md
            - _refs/angular/generator/generate-golden-project.mjs
            - _refs/angular/orchestrator-generation.md
            - _refs/angular/review-code.md
            - _refs/angular/review-accessibility.md
            - _refs/angular/review-security.md
            - .claude/_refs/shared/static-analysis-compatibility.md
            - plugin/_refs/shared/static-analysis-compatibility.md
            - codex/skills/_refs/shared/static-analysis-compatibility.md
            - .claude/_refs/angular/write-code/admin-screens.md
            - plugin/_refs/angular/write-code/admin-screens.md
            - codex/skills/_refs/angular/write-code/admin-screens.md
            - .claude/_refs/angular/templates/init-module-templates.md
            - plugin/_refs/angular/templates/init-module-templates.md
            - codex/skills/_refs/angular/templates/init-module-templates.md
            - .claude/_refs/angular/architecture-principles.md
            - plugin/_refs/angular/architecture-principles.md
            - codex/skills/_refs/angular/architecture-principles.md
            - .claude/_refs/angular/write-code/init-entity.md
            - plugin/_refs/angular/write-code/init-entity.md
            - codex/skills/_refs/angular/write-code/init-entity.md
            - .claude/_refs/angular/generator/generate-golden-project.mjs
            - plugin/_refs/angular/generator/generate-golden-project.mjs
            - codex/skills/_refs/angular/generator/generate-golden-project.mjs
            - .claude/_refs/angular/orchestrator-generation.md
            - plugin/_refs/angular/orchestrator-generation.md
            - codex/skills/_refs/angular/orchestrator-generation.md
            - .claude/_refs/angular/review-code.md
            - plugin/_refs/angular/review-code.md
            - codex/skills/_refs/angular/review-code.md
            - .claude/_refs/angular/review-accessibility.md
            - plugin/_refs/angular/review-accessibility.md
            - codex/skills/_refs/angular/review-accessibility.md
            - .claude/_refs/angular/review-security.md
            - plugin/_refs/angular/review-security.md
            - codex/skills/_refs/angular/review-security.md
          intended_new_paths: []
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
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-no-async-lifecycle-hook
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: No async or Promise-typed Angular lifecycle hook remains in Angular references or skills.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-inject-fields-readonly
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Every inject() field declaration in Angular templates and write-code references is readonly.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-no-alert-todo-placeholder
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: No alert TODO placeholder guidance remains; the placeholder is a disabled action plus a generation-summary entry.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-golden-spec-specific-size-matcher
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The generated golden spec uses toHaveSize(2) and no length-to-be assertion.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-shared-ref-sections-and-links
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The shared reference has the required sections and Angular executor/review references link to it.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-shared-ref-neutrality
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The shared reference is English-only, names no organisation/host/project/repository, and keeps analyzer keys in example cells for at least two analyzers.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-executor-advisory-evidence-gated
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Shared reference and executor guidance state the evidence trigger, Low/RECOMMENDED advisory severity, no analyzer-only blocking and no config or dependency edits without approval; review dimensions and dependencies are unchanged.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-002
      risk: RISK-003
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-click-host-guidance
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Button host click bindings are unchanged; guidance forbids host keydown.enter, provides a neutral analyzer-config proposal and requires real fixes on non-interactive elements.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-check-skills
      planned_command: npm run check:skills
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Generated mirrors match canonical sources.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-text-hygiene
      planned_command: npm run check:text-hygiene
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Text hygiene passes for all tracked files.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-repository-suite
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The repository e2e suite passes including the new contract test.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-review-advisory
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Angular review guidance links the shared reference, handles analyzer findings as advisory and keeps AG-3 unchanged.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  risk_register:
    - id: RISK-001
      statement: Advisory guidance drifts into project-specific or blocking rules.
      mitigation: AC-005/AC-006 neutrality checks, AC-007/AC-010 advisory checks, INV-001 and INV-004.
    - id: RISK-002
      statement: Rewritten examples change intended behavior or text checks do not reflect generated code.
      mitigation: AC-001..AC-004 contract cases including generated golden spec content, INV-003.
    - id: RISK-003
      statement: Custom-element click-host guidance causes double-fire or hides real accessibility defects.
      mitigation: AC-008 baseline and guidance checks, INV-002.
    - id: RISK-004
      statement: Mirrors, summary or repository checks regress after reference edits.
      mitigation: AC-009 check:skills, text hygiene and repository suite.
  contract_id: static-analysis-compatibility-20261112
  requirement_id: R-001
  approved_spec_path: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
  approved_spec_hash: sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
      artifact_id: spec-static-analysis-compatibility-20261112-r3
      revision: 1d985025536ccde105b4dd3cf88e20f71e18f3c1
      approval_hash: sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b
  approved_plan_path: ""
  approved_plan_hash: ""
  supersedes: plan-static-analysis-compatibility-20261112-r3
  target_root: sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - sdcorejs-agent
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 10
  phase_count: 3
  allowed_paths:
    - test/e2e/static-analysis-compatibility-contract.test.mjs
    - package.json
    - _refs/shared/static-analysis-compatibility.md
    - _refs/angular/write-code/admin-screens.md
    - _refs/angular/templates/init-module-templates.md
    - _refs/angular/architecture-principles.md
    - _refs/angular/write-code/init-entity.md
    - _refs/angular/generator/generate-golden-project.mjs
    - _refs/angular/orchestrator-generation.md
    - _refs/angular/review-code.md
    - _refs/angular/review-accessibility.md
    - _refs/angular/review-security.md
    - .claude/_refs/shared/static-analysis-compatibility.md
    - plugin/_refs/shared/static-analysis-compatibility.md
    - codex/skills/_refs/shared/static-analysis-compatibility.md
    - .claude/_refs/angular/write-code/admin-screens.md
    - plugin/_refs/angular/write-code/admin-screens.md
    - codex/skills/_refs/angular/write-code/admin-screens.md
    - .claude/_refs/angular/templates/init-module-templates.md
    - plugin/_refs/angular/templates/init-module-templates.md
    - codex/skills/_refs/angular/templates/init-module-templates.md
    - .claude/_refs/angular/architecture-principles.md
    - plugin/_refs/angular/architecture-principles.md
    - codex/skills/_refs/angular/architecture-principles.md
    - .claude/_refs/angular/write-code/init-entity.md
    - plugin/_refs/angular/write-code/init-entity.md
    - codex/skills/_refs/angular/write-code/init-entity.md
    - .claude/_refs/angular/generator/generate-golden-project.mjs
    - plugin/_refs/angular/generator/generate-golden-project.mjs
    - codex/skills/_refs/angular/generator/generate-golden-project.mjs
    - .claude/_refs/angular/orchestrator-generation.md
    - plugin/_refs/angular/orchestrator-generation.md
    - codex/skills/_refs/angular/orchestrator-generation.md
    - .claude/_refs/angular/review-code.md
    - plugin/_refs/angular/review-code.md
    - codex/skills/_refs/angular/review-code.md
    - .claude/_refs/angular/review-accessibility.md
    - plugin/_refs/angular/review-accessibility.md
    - codex/skills/_refs/angular/review-accessibility.md
    - .claude/_refs/angular/review-security.md
    - plugin/_refs/angular/review-security.md
    - codex/skills/_refs/angular/review-security.md
    - .sdcorejs/summary.md
    - .sdcorejs/docs/workflow/*static-analysis-compatibility*
    - .sdcorejs/specs/workflow/*static-analysis-compatibility*.md
    - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
  prohibited_paths:
    - skills/**
    - AGENTS.md
    - CLAUDE.md
    - .github/**
    - site/**
    - scripts/**
    - package-lock.json
    - _refs/shared/system-registry.json
    - _refs/harness/**
    - .cursor/**
    - "**/sdcorejs-harness.json"
  generated_artifacts:
    - .claude/_refs/shared/static-analysis-compatibility.md
    - plugin/_refs/shared/static-analysis-compatibility.md
    - codex/skills/_refs/shared/static-analysis-compatibility.md
    - .claude/_refs/angular/write-code/admin-screens.md
    - plugin/_refs/angular/write-code/admin-screens.md
    - codex/skills/_refs/angular/write-code/admin-screens.md
    - .claude/_refs/angular/templates/init-module-templates.md
    - plugin/_refs/angular/templates/init-module-templates.md
    - codex/skills/_refs/angular/templates/init-module-templates.md
    - .claude/_refs/angular/architecture-principles.md
    - plugin/_refs/angular/architecture-principles.md
    - codex/skills/_refs/angular/architecture-principles.md
    - .claude/_refs/angular/write-code/init-entity.md
    - plugin/_refs/angular/write-code/init-entity.md
    - codex/skills/_refs/angular/write-code/init-entity.md
    - .claude/_refs/angular/generator/generate-golden-project.mjs
    - plugin/_refs/angular/generator/generate-golden-project.mjs
    - codex/skills/_refs/angular/generator/generate-golden-project.mjs
    - .claude/_refs/angular/orchestrator-generation.md
    - plugin/_refs/angular/orchestrator-generation.md
    - codex/skills/_refs/angular/orchestrator-generation.md
    - .claude/_refs/angular/review-code.md
    - plugin/_refs/angular/review-code.md
    - codex/skills/_refs/angular/review-code.md
    - .claude/_refs/angular/review-accessibility.md
    - plugin/_refs/angular/review-accessibility.md
    - codex/skills/_refs/angular/review-accessibility.md
    - .claude/_refs/angular/review-security.md
    - plugin/_refs/angular/review-security.md
    - codex/skills/_refs/angular/review-security.md
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-11-12-10-53-static-analysis-compatibility-spec-r3.md
    - .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
    - .sdcorejs/docs/workflow/2026-11-12-11-09-static-analysis-compatibility-plan-r4.md
    - .sdcorejs/plans/workflow/<approval-stamp>-static-analysis-compatibility-r4.md
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
  package_manifest_changes:
    required: false
    files: []
    scope: package.json scripts were already changed under r2; r4 adds no manifest change
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack reference, generator literal and contract-test change; no frontend application code is produced in this repository.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No AI-agent application contract is in scope.
  verification_strategy:
    package_manager: npm
    package_manager_evidence:
      - package.json packageManager npm@10.9.2
      - package-lock.json present
      - node_modules installed with npm ci --ignore-scripts
    commands_planned:
      - npm run test:e2e:static-analysis - RED for the two new case names, then GREEN 9/9 (AC-001..AC-008, AC-010)
      - npm run check:skills - mirrors match canonical sources (AC-009)
      - npm run check:text-hygiene - text hygiene (AC-009)
      - npm run test:e2e:angular, npm run test:e2e:phase1, npm run test:e2e:skill-audit - existing tests that read changed files
      - repository list of npm run test:e2e:repository (AC-009); its cleanup tail is reported separately on Windows
      - git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)
    commands_skipped:
      - npm run test:e2e:angular:golden - installs and builds a generated Angular project; CI covers it on Linux
      - cleanup-engine.test.mjs on this Windows host - hangs before and after this change; CI covers it on Linux
    checks: Re-run focused and broad checks at the final HEAD after the test split, then evaluate delivery convergence and branch-ready before push.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files: []
    reason: One remaining edit (TASK-001 test split); all other tasks were executed under r2.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - sdcorejs-agent
    contract:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          role: standalone
          git_root: .
      mutable_steps_single_root: true
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
      commit_push_requires_explicit_user_request: true
  execution_progress_at_revision:
    completed_under_r2:
      - TASK-002..TASK-010 executed and verified under plan r2, committed in 1d98502
      - TASK-001 created the contract test (8 cases) under r2
    remaining_under_r4:
      - TASK-001 splits case-sac-advisory-evidence-gated into case-sac-executor-advisory-evidence-gated (AC-007) and case-sac-review-advisory (AC-010)
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 4
    supersedes: plan-static-analysis-compatibility-20261112-r3
    change_reason: "Traceability for delivery convergence on spec r3: per-task requirement/AC/invariant/risk links, AC-010 validation row, and TASK-001 splits the advisory contract case into executor (AC-007) and review (AC-010) cases."
```

## Final plan context

Giống bản nháp, cộng thêm: `decision_coverage.approved_artifact` gắn với lần duyệt plan, đường dẫn snapshot, trạng thái phê duyệt và `artifact_context`. `approved_plan_hash` canonical nằm ở frontmatter (không đưa vào body để tránh tự tham chiếu).

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: docs-only
      rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
    rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
    blockers: []
    blocker_messages: []
  architecture_context: null
  decision_coverage:
    schema_version: 1
    revision: 3
    records:
      - id: R-001
        type: requirement
        statement: Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.
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
          - TASK-008
      - id: R-002
        type: requirement
        statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
      - id: R-003
        type: requirement
        statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-008
      - id: R-004
        type: requirement
        statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-009
      - id: R-005
        type: requirement
        statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-009
      - id: R-006
        type: requirement
        statement: Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-010
      - id: AC-001
        type: acceptance-criterion
        statement: No Angular reference or template example declares an async Angular lifecycle hook.
        behavior: Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.
        expected_result: Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-004
      - id: AC-002
        type: acceptance-criterion
        statement: Every inject() field declaration in Angular templates is readonly.
        behavior: Scan _refs/angular templates and write-code references for class fields initialised with inject().
        expected_result: Every such field is declared readonly; zero non-readonly matches.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-005
      - id: AC-003
        type: acceptance-criterion
        statement: The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.
        behavior: Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.
        expected_result: Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-006
          - TASK-008
      - id: AC-004
        type: acceptance-criterion
        statement: The generated golden Angular test asserts collection size with a size-specific matcher.
        behavior: Generate the golden Angular project and inspect its spec text.
        expected_result: The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-007
      - id: AC-005
        type: acceptance-criterion
        statement: The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.
        behavior: Read the new _refs/shared reference and the Angular write-code and review references.
        expected_result: The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
      - id: AC-006
        type: acceptance-criterion
        statement: The shared reference stays tool- and project-neutral.
        behavior: Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.
        expected_result: The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-007
        type: acceptance-criterion
        statement: Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
        behavior: Read the shared reference and the Angular executor guidance for static-analysis handling.
        expected_result: Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-008
      - id: AC-008
        type: acceptance-criterion
        statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
        behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
        expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-009
      - id: AC-009
        type: acceptance-criterion
        statement: Mirrors and repository checks pass after the change.
        behavior: Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.
        expected_result: All commands exit 0 and generated mirrors match canonical sources.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-002
          - TASK-010
      - id: AC-010
        type: acceptance-criterion
        statement: Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.
        behavior: Read the Angular code and security review references for static-analysis handling.
        expected_result: Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-009
      - id: A-001
        type: assumption
        statement: Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.
        source: inferred
        confidence: medium
        status: validated
        blocking: false
        evidence_refs:
          - sonar-uat-2026-11-12-S3735-count-12
        consequence_if_wrong: Generated navigation code adds maintainability findings and the example needs a follow-up revision.
        validation_method: Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code.
        owner: sdcorejs-plan
        rationale: Changing the example without evidence would add churn against a common floating-promise convention.
        impacted_refs:
          - R-001
      - id: A-002
        type: assumption
        statement: Core UI button hosts render a native button, so keyboard activation already produces a click on the host.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs:
          - sdcorejs-angular-v19.2.15-button-component-native-button
        consequence_if_wrong: Proposing analyzer-configuration handling could hide a real keyboard-access defect.
        validation_method: "Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."
        owner: sdcorejs-plan
        rationale: The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.
        impacted_refs:
          - R-005
          - AC-008
      - id: A-003
        type: assumption
        statement: The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs:
          - generate-golden-project-jasmine-core-5.9.0
        consequence_if_wrong: The generated spec fails to compile or run.
        validation_method: The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9.
        owner: sdcorejs-plan
        rationale: Size-specific matcher is the analyzer-recommended form for Jasmine.
        impacted_refs:
          - AC-004
      - id: D-001
        type: decision
        statement: Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.
        question: How should generated code handle keyboard-equivalent findings on Core UI button hosts?
        selected_value: Keep the click binding; propose analyzer configuration in the target project.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user chose analyzer configuration and rejected unnecessary API changes.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-008
          - INV-002
        task_refs:
          - TASK-003
          - TASK-009
      - id: D-002
        type: decision
        statement: The skill pack stays tool- and project-neutral and gives advisory proposals.
        question: Should the skill pack enforce one organisation's analyzer configuration?
        selected_value: No; neutral guidance with advisory proposals gated by project evidence.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The user requires general guidance not biased by one project or company configuration.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - R-003
          - R-004
          - AC-006
          - AC-007
        task_refs:
          - TASK-003
          - TASK-008
          - TASK-009
      - id: D-003
        type: decision
        statement: Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.
        question: Where should static-analysis guidance live?
        selected_value: New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - AC-005
          - INV-001
        task_refs:
          - TASK-003
      - id: D-004
        type: decision
        statement: Use TDD with test/e2e contract tests.
        question: What coverage approach applies?
        selected_value: TDD; write failing contract tests first, then change references.
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Confirmed in the requirement contract and matches repository practice.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
        task_refs:
          - TASK-001
        validation_boundary:
          kind: none
          source_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
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
      - id: INV-001
        type: invariant
        statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
        protected_refs:
          - R-003
          - R-004
          - AC-007
          - AC-010
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-008
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
      - id: INV-002
        type: invariant
        statement: Core UI button host click bindings in Angular templates remain unchanged.
        protected_refs:
          - R-005
          - AC-008
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-003
          - EVIDENCE-009
          - EVIDENCE-010
      - id: INV-003
        type: invariant
        statement: "Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs."
        protected_refs:
          - R-001
          - AC-001
          - AC-002
          - AC-003
          - AC-004
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-008
      - id: INV-004
        type: invariant
        statement: The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.
        protected_refs:
          - R-002
          - AC-005
          - AC-006
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-008
          - TASK-009
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-008
          - EVIDENCE-009
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
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: INV-001
            type: invariant
          - id: INV-002
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
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
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
          - id: A-003
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
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
    approved_artifact:
      metadata:
        allowed_paths:
          - test/e2e/static-analysis-compatibility-contract.test.mjs
          - package.json
          - _refs/shared/static-analysis-compatibility.md
          - _refs/angular/write-code/admin-screens.md
          - _refs/angular/templates/init-module-templates.md
          - _refs/angular/architecture-principles.md
          - _refs/angular/write-code/init-entity.md
          - _refs/angular/generator/generate-golden-project.mjs
          - _refs/angular/orchestrator-generation.md
          - _refs/angular/review-code.md
          - _refs/angular/review-accessibility.md
          - _refs/angular/review-security.md
          - .claude/_refs/shared/static-analysis-compatibility.md
          - plugin/_refs/shared/static-analysis-compatibility.md
          - codex/skills/_refs/shared/static-analysis-compatibility.md
          - .claude/_refs/angular/write-code/admin-screens.md
          - plugin/_refs/angular/write-code/admin-screens.md
          - codex/skills/_refs/angular/write-code/admin-screens.md
          - .claude/_refs/angular/templates/init-module-templates.md
          - plugin/_refs/angular/templates/init-module-templates.md
          - codex/skills/_refs/angular/templates/init-module-templates.md
          - .claude/_refs/angular/architecture-principles.md
          - plugin/_refs/angular/architecture-principles.md
          - codex/skills/_refs/angular/architecture-principles.md
          - .claude/_refs/angular/write-code/init-entity.md
          - plugin/_refs/angular/write-code/init-entity.md
          - codex/skills/_refs/angular/write-code/init-entity.md
          - .claude/_refs/angular/generator/generate-golden-project.mjs
          - plugin/_refs/angular/generator/generate-golden-project.mjs
          - codex/skills/_refs/angular/generator/generate-golden-project.mjs
          - .claude/_refs/angular/orchestrator-generation.md
          - plugin/_refs/angular/orchestrator-generation.md
          - codex/skills/_refs/angular/orchestrator-generation.md
          - .claude/_refs/angular/review-code.md
          - plugin/_refs/angular/review-code.md
          - codex/skills/_refs/angular/review-code.md
          - .claude/_refs/angular/review-accessibility.md
          - plugin/_refs/angular/review-accessibility.md
          - codex/skills/_refs/angular/review-accessibility.md
          - .claude/_refs/angular/review-security.md
          - plugin/_refs/angular/review-security.md
          - codex/skills/_refs/angular/review-security.md
          - .sdcorejs/summary.md
          - .sdcorejs/docs/workflow/*static-analysis-compatibility*
          - .sdcorejs/specs/workflow/*static-analysis-compatibility*.md
          - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
        approval_source: user-approved-decision-coverage
        approved_at: 2026-11-12T06:48:56.940Z
        approved_by: user
        artifact_id: decision-coverage-r3
        artifact_kind: plan
        change_ref: static-analysis-compatibility-20261112
        contract_id: decision-coverage:v1
        owner_module_id: null
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_repository_role: standalone
        parent_references: []
        parent_repository_id: null
        prohibited_paths:
          - skills/**
          - AGENTS.md
          - CLAUDE.md
          - .github/**
          - site/**
          - scripts/**
          - package-lock.json
          - _refs/shared/system-registry.json
          - _refs/harness/**
          - .cursor/**
          - "**/sdcorejs-harness.json"
        repository_relative_path: .sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md
        requirement_id: decision-coverage
        schema_version: 1
        source_revision: 1d985025536ccde105b4dd3cf88e20f71e18f3c1
        stack_profile: markdown-skill-pack
        supersedes: decision-coverage-r3
        track: workflow
        approval_hash: sha256:v1:701c0d64a6029b97845713878bacca1d725bef6257a4e8aba57747789750d7f5
      body: |
        {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"}],"revision":2,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"}],"revision":3,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.","status":"active","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006","TASK-007","TASK-008"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.","status":"active","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.","status":"active","task_refs":["TASK-001","TASK-008"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.","status":"active","task_refs":["TASK-001","TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.","status":"active","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.","status":"active","task_refs":["TASK-001","TASK-002","TASK-010"],"type":"requirement"},{"behavior":"Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.","blocking":true,"expected_result":"Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.","id":"AC-001","requirement_refs":["R-001"],"statement":"No Angular reference or template example declares an async Angular lifecycle hook.","task_refs":["TASK-001","TASK-004"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular templates and write-code references for class fields initialised with inject().","blocking":true,"expected_result":"Every such field is declared readonly; zero non-readonly matches.","id":"AC-002","requirement_refs":["R-001"],"statement":"Every inject() field declaration in Angular templates is readonly.","task_refs":["TASK-001","TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.","blocking":true,"expected_result":"Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.","id":"AC-003","requirement_refs":["R-001"],"statement":"The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.","task_refs":["TASK-001","TASK-004","TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Generate the golden Angular project and inspect its spec text.","blocking":true,"expected_result":"The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.","id":"AC-004","requirement_refs":["R-001"],"statement":"The generated golden Angular test asserts collection size with a size-specific matcher.","task_refs":["TASK-001","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the new _refs/shared reference and the Angular write-code and review references.","blocking":true,"expected_result":"The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.","id":"AC-005","requirement_refs":["R-002"],"statement":"The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.","blocking":true,"expected_result":"The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.","id":"AC-006","requirement_refs":["R-002"],"statement":"The shared reference stays tool- and project-neutral.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the shared reference and the Angular executor guidance for static-analysis handling.","blocking":true,"expected_result":"Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.","id":"AC-007","requirement_refs":["R-003"],"statement":"Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.","task_refs":["TASK-001","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.","blocking":true,"expected_result":"Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.","id":"AC-008","requirement_refs":["R-005"],"statement":"Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.","blocking":true,"expected_result":"All commands exit 0 and generated mirrors match canonical sources.","id":"AC-009","requirement_refs":["R-006"],"statement":"Mirrors and repository checks pass after the change.","task_refs":["TASK-002","TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the Angular code and security review references for static-analysis handling.","blocking":true,"expected_result":"Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.","id":"AC-010","requirement_refs":["R-004"],"statement":"Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.","task_refs":["TASK-001","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Generated navigation code adds maintainability findings and the example needs a follow-up revision.","evidence_refs":["sonar-uat-2026-11-12-S3735-count-12"],"id":"A-001","impacted_refs":["R-001"],"owner":"sdcorejs-plan","rationale":"Changing the example without evidence would add churn against a common floating-promise convention.","source":"inferred","statement":"Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.","status":"validated","type":"assumption","validation_method":"Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code."},{"blocking":false,"confidence":"high","consequence_if_wrong":"Proposing analyzer-configuration handling could hide a real keyboard-access defect.","evidence_refs":["sdcorejs-angular-v19.2.15-button-component-native-button"],"id":"A-002","impacted_refs":["R-005","AC-008"],"owner":"sdcorejs-plan","rationale":"The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.","source":"inferred","statement":"Core UI button hosts render a native button, so keyboard activation already produces a click on the host.","status":"validated","type":"assumption","validation_method":"Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."},{"blocking":false,"confidence":"high","consequence_if_wrong":"The generated spec fails to compile or run.","evidence_refs":["generate-golden-project-jasmine-core-5.9.0"],"id":"A-003","impacted_refs":["AC-004"],"owner":"sdcorejs-plan","rationale":"Size-specific matcher is the analyzer-recommended form for Jasmine.","source":"inferred","statement":"The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.","status":"validated","type":"assumption","validation_method":"The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-005","AC-008","INV-002"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should generated code handle keyboard-equivalent findings on Core UI button hosts?","rationale":"The user chose analyzer configuration and rejected unnecessary API changes.","revisit_condition":null,"scope":"repository","selected_value":"Keep the click binding; propose analyzer configuration in the target project.","source":"explicit-user","statement":"Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","AC-006","AC-007"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Should the skill pack enforce one organisation's analyzer configuration?","rationale":"The user requires general guidance not biased by one project or company configuration.","revisit_condition":null,"scope":"repository","selected_value":"No; neutral guidance with advisory proposals gated by project evidence.","source":"explicit-user","statement":"The skill pack stays tool- and project-neutral and gives advisory proposals.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-008","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","AC-005","INV-001"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where should static-analysis guidance live?","rationale":"Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.","revisit_condition":null,"scope":"repository","selected_value":"New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.","source":"explicit-user","statement":"Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.","status":"approved","supersedes":null,"task_refs":["TASK-003"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"What coverage approach applies?","rationale":"Confirmed in the requirement contract and matches repository practice.","revisit_condition":null,"scope":"repository","selected_value":"TDD; write failing contract tests first, then change references.","source":"explicit-user","statement":"Use TDD with test/e2e contract tests.","status":"approved","supersedes":null,"task_refs":["TASK-001"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004"]}},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-008","EVIDENCE-009","EVIDENCE-010"],"id":"INV-001","protected_refs":["R-003","R-004","AC-007","AC-010"],"statement":"No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.","task_refs":["TASK-001","TASK-002","TASK-008","TASK-009","TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-009","EVIDENCE-010"],"id":"INV-002","protected_refs":["R-005","AC-008"],"statement":"Core UI button host click bindings in Angular templates remain unchanged.","task_refs":["TASK-001","TASK-002","TASK-003","TASK-009","TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-004","EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-008"],"id":"INV-003","protected_refs":["R-001","AC-001","AC-002","AC-003","AC-004"],"statement":"Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs.","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006","TASK-007","TASK-008"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-008","EVIDENCE-009"],"id":"INV-004","protected_refs":["R-002","AC-005","AC-006"],"statement":"The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"invariant"}],"revision":3,"schema_version":1}
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage:
      schema_version: 1
      revision: 3
      records:
        - id: R-001
          type: requirement
          statement: Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.
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
            - TASK-008
        - id: R-002
          type: requirement
          statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
        - id: R-003
          type: requirement
          statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-008
        - id: R-004
          type: requirement
          statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-009
        - id: R-005
          type: requirement
          statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-009
        - id: R-006
          type: requirement
          statement: Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-010
        - id: AC-001
          type: acceptance-criterion
          statement: No Angular reference or template example declares an async Angular lifecycle hook.
          behavior: Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.
          expected_result: Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-004
        - id: AC-002
          type: acceptance-criterion
          statement: Every inject() field declaration in Angular templates is readonly.
          behavior: Scan _refs/angular templates and write-code references for class fields initialised with inject().
          expected_result: Every such field is declared readonly; zero non-readonly matches.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-005
        - id: AC-003
          type: acceptance-criterion
          statement: The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.
          behavior: Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.
          expected_result: Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-006
            - TASK-008
        - id: AC-004
          type: acceptance-criterion
          statement: The generated golden Angular test asserts collection size with a size-specific matcher.
          behavior: Generate the golden Angular project and inspect its spec text.
          expected_result: The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-001
          task_refs:
            - TASK-001
            - TASK-007
        - id: AC-005
          type: acceptance-criterion
          statement: The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.
          behavior: Read the new _refs/shared reference and the Angular write-code and review references.
          expected_result: The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
        - id: AC-006
          type: acceptance-criterion
          statement: The shared reference stays tool- and project-neutral.
          behavior: Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.
          expected_result: The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-002
          task_refs:
            - TASK-001
            - TASK-003
        - id: AC-007
          type: acceptance-criterion
          statement: Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
          behavior: Read the shared reference and the Angular executor guidance for static-analysis handling.
          expected_result: Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
          task_refs:
            - TASK-001
            - TASK-008
        - id: AC-008
          type: acceptance-criterion
          statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
          behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
          expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-009
        - id: AC-009
          type: acceptance-criterion
          statement: Mirrors and repository checks pass after the change.
          behavior: Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.
          expected_result: All commands exit 0 and generated mirrors match canonical sources.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-006
          task_refs:
            - TASK-002
            - TASK-010
        - id: AC-010
          type: acceptance-criterion
          statement: Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.
          behavior: Read the Angular code and security review references for static-analysis handling.
          expected_result: Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-004
          task_refs:
            - TASK-001
            - TASK-009
        - id: A-001
          type: assumption
          statement: Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.
          source: inferred
          confidence: medium
          status: validated
          blocking: false
          evidence_refs:
            - sonar-uat-2026-11-12-S3735-count-12
          consequence_if_wrong: Generated navigation code adds maintainability findings and the example needs a follow-up revision.
          validation_method: Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code.
          owner: sdcorejs-plan
          rationale: Changing the example without evidence would add churn against a common floating-promise convention.
          impacted_refs:
            - R-001
        - id: A-002
          type: assumption
          statement: Core UI button hosts render a native button, so keyboard activation already produces a click on the host.
          source: inferred
          confidence: high
          status: validated
          blocking: false
          evidence_refs:
            - sdcorejs-angular-v19.2.15-button-component-native-button
          consequence_if_wrong: Proposing analyzer-configuration handling could hide a real keyboard-access defect.
          validation_method: "Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."
          owner: sdcorejs-plan
          rationale: The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.
          impacted_refs:
            - R-005
            - AC-008
        - id: A-003
          type: assumption
          statement: The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.
          source: inferred
          confidence: high
          status: validated
          blocking: false
          evidence_refs:
            - generate-golden-project-jasmine-core-5.9.0
          consequence_if_wrong: The generated spec fails to compile or run.
          validation_method: The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9.
          owner: sdcorejs-plan
          rationale: Size-specific matcher is the analyzer-recommended form for Jasmine.
          impacted_refs:
            - AC-004
        - id: D-001
          type: decision
          statement: Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.
          question: How should generated code handle keyboard-equivalent findings on Core UI button hosts?
          selected_value: Keep the click binding; propose analyzer configuration in the target project.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: The user chose analyzer configuration and rejected unnecessary API changes.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-005
            - AC-008
            - INV-002
          task_refs:
            - TASK-003
            - TASK-009
        - id: D-002
          type: decision
          statement: The skill pack stays tool- and project-neutral and gives advisory proposals.
          question: Should the skill pack enforce one organisation's analyzer configuration?
          selected_value: No; neutral guidance with advisory proposals gated by project evidence.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: The user requires general guidance not biased by one project or company configuration.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-002
            - R-003
            - R-004
            - AC-006
            - AC-007
          task_refs:
            - TASK-003
            - TASK-008
            - TASK-009
        - id: D-003
          type: decision
          statement: Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.
          question: Where should static-analysis guidance live?
          selected_value: New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-002
            - AC-005
            - INV-001
          task_refs:
            - TASK-003
        - id: D-004
          type: decision
          statement: Use TDD with test/e2e contract tests.
          question: What coverage approach applies?
          selected_value: TDD; write failing contract tests first, then change references.
          source: explicit-user
          status: approved
          blocking: true
          scope: repository
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          rationale: Confirmed in the requirement contract and matches repository practice.
          supersedes: null
          revisit_condition: null
          convention_impact:
            candidate: false
            category: null
          downstream_refs:
            - R-001
            - R-002
            - R-003
            - R-004
            - R-005
            - R-006
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
          task_refs:
            - TASK-001
          validation_boundary:
            kind: none
            source_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
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
        - id: INV-001
          type: invariant
          statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
          protected_refs:
            - R-003
            - R-004
            - AC-007
            - AC-010
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-008
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-008
            - EVIDENCE-009
            - EVIDENCE-010
        - id: INV-002
          type: invariant
          statement: Core UI button host click bindings in Angular templates remain unchanged.
          protected_refs:
            - R-005
            - AC-008
          task_refs:
            - TASK-001
            - TASK-002
            - TASK-003
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-002
            - EVIDENCE-003
            - EVIDENCE-009
            - EVIDENCE-010
        - id: INV-003
          type: invariant
          statement: "Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs."
          protected_refs:
            - R-001
            - AC-001
            - AC-002
            - AC-003
            - AC-004
          task_refs:
            - TASK-001
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
            - TASK-008
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-004
            - EVIDENCE-005
            - EVIDENCE-006
            - EVIDENCE-007
            - EVIDENCE-008
        - id: INV-004
          type: invariant
          statement: The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.
          protected_refs:
            - R-002
            - AC-005
            - AC-006
          task_refs:
            - TASK-001
            - TASK-003
            - TASK-008
            - TASK-009
          evidence_refs:
            - EVIDENCE-001
            - EVIDENCE-003
            - EVIDENCE-008
            - EVIDENCE-009
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
            - id: A-001
              type: assumption
            - id: A-002
              type: assumption
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
              type: decision
            - id: INV-001
              type: invariant
            - id: INV-002
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
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
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
            - id: A-003
              type: assumption
            - id: D-001
              type: decision
            - id: D-002
              type: decision
            - id: D-003
              type: decision
            - id: D-004
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
      approved_artifact:
        metadata:
          allowed_paths:
            - test/e2e/static-analysis-compatibility-contract.test.mjs
            - package.json
            - _refs/shared/static-analysis-compatibility.md
            - _refs/angular/write-code/admin-screens.md
            - _refs/angular/templates/init-module-templates.md
            - _refs/angular/architecture-principles.md
            - _refs/angular/write-code/init-entity.md
            - _refs/angular/generator/generate-golden-project.mjs
            - _refs/angular/orchestrator-generation.md
            - _refs/angular/review-code.md
            - _refs/angular/review-accessibility.md
            - _refs/angular/review-security.md
            - .claude/_refs/shared/static-analysis-compatibility.md
            - plugin/_refs/shared/static-analysis-compatibility.md
            - codex/skills/_refs/shared/static-analysis-compatibility.md
            - .claude/_refs/angular/write-code/admin-screens.md
            - plugin/_refs/angular/write-code/admin-screens.md
            - codex/skills/_refs/angular/write-code/admin-screens.md
            - .claude/_refs/angular/templates/init-module-templates.md
            - plugin/_refs/angular/templates/init-module-templates.md
            - codex/skills/_refs/angular/templates/init-module-templates.md
            - .claude/_refs/angular/architecture-principles.md
            - plugin/_refs/angular/architecture-principles.md
            - codex/skills/_refs/angular/architecture-principles.md
            - .claude/_refs/angular/write-code/init-entity.md
            - plugin/_refs/angular/write-code/init-entity.md
            - codex/skills/_refs/angular/write-code/init-entity.md
            - .claude/_refs/angular/generator/generate-golden-project.mjs
            - plugin/_refs/angular/generator/generate-golden-project.mjs
            - codex/skills/_refs/angular/generator/generate-golden-project.mjs
            - .claude/_refs/angular/orchestrator-generation.md
            - plugin/_refs/angular/orchestrator-generation.md
            - codex/skills/_refs/angular/orchestrator-generation.md
            - .claude/_refs/angular/review-code.md
            - plugin/_refs/angular/review-code.md
            - codex/skills/_refs/angular/review-code.md
            - .claude/_refs/angular/review-accessibility.md
            - plugin/_refs/angular/review-accessibility.md
            - codex/skills/_refs/angular/review-accessibility.md
            - .claude/_refs/angular/review-security.md
            - plugin/_refs/angular/review-security.md
            - codex/skills/_refs/angular/review-security.md
            - .sdcorejs/summary.md
            - .sdcorejs/docs/workflow/*static-analysis-compatibility*
            - .sdcorejs/specs/workflow/*static-analysis-compatibility*.md
            - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
          approval_source: user-approved-decision-coverage
          approved_at: 2026-11-12T06:48:56.940Z
          approved_by: user
          artifact_id: decision-coverage-r3
          artifact_kind: plan
          change_ref: static-analysis-compatibility-20261112
          contract_id: decision-coverage:v1
          owner_module_id: null
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_repository_role: standalone
          parent_references: []
          parent_repository_id: null
          prohibited_paths:
            - skills/**
            - AGENTS.md
            - CLAUDE.md
            - .github/**
            - site/**
            - scripts/**
            - package-lock.json
            - _refs/shared/system-registry.json
            - _refs/harness/**
            - .cursor/**
            - "**/sdcorejs-harness.json"
          repository_relative_path: .sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md
          requirement_id: decision-coverage
          schema_version: 1
          source_revision: 1d985025536ccde105b4dd3cf88e20f71e18f3c1
          stack_profile: markdown-skill-pack
          supersedes: decision-coverage-r3
          track: workflow
          approval_hash: sha256:v1:701c0d64a6029b97845713878bacca1d725bef6257a4e8aba57747789750d7f5
        body: |
          {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"}],"revision":2,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"AC-010","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"},{"id":"INV-003","type":"invariant"},{"id":"INV-004","type":"invariant"}],"revision":3,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.","status":"active","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006","TASK-007","TASK-008"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.","status":"active","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.","status":"active","task_refs":["TASK-001","TASK-008"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.","status":"active","task_refs":["TASK-001","TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.","status":"active","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.","status":"active","task_refs":["TASK-001","TASK-002","TASK-010"],"type":"requirement"},{"behavior":"Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.","blocking":true,"expected_result":"Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.","id":"AC-001","requirement_refs":["R-001"],"statement":"No Angular reference or template example declares an async Angular lifecycle hook.","task_refs":["TASK-001","TASK-004"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular templates and write-code references for class fields initialised with inject().","blocking":true,"expected_result":"Every such field is declared readonly; zero non-readonly matches.","id":"AC-002","requirement_refs":["R-001"],"statement":"Every inject() field declaration in Angular templates is readonly.","task_refs":["TASK-001","TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.","blocking":true,"expected_result":"Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.","id":"AC-003","requirement_refs":["R-001"],"statement":"The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.","task_refs":["TASK-001","TASK-004","TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Generate the golden Angular project and inspect its spec text.","blocking":true,"expected_result":"The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.","id":"AC-004","requirement_refs":["R-001"],"statement":"The generated golden Angular test asserts collection size with a size-specific matcher.","task_refs":["TASK-001","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the new _refs/shared reference and the Angular write-code and review references.","blocking":true,"expected_result":"The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.","id":"AC-005","requirement_refs":["R-002"],"statement":"The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.","blocking":true,"expected_result":"The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.","id":"AC-006","requirement_refs":["R-002"],"statement":"The shared reference stays tool- and project-neutral.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the shared reference and the Angular executor guidance for static-analysis handling.","blocking":true,"expected_result":"Guidance states the trigger evidence (analyzer project configuration, analyzer or accessibility lint configuration, or a CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config, lint/CI or dependency edits without explicit user approval; the registry review dimensions and package dependencies stay unchanged.","id":"AC-007","requirement_refs":["R-003"],"statement":"Angular executor guidance is advisory, evidence-gated and non-mutating for analyzer configuration.","task_refs":["TASK-001","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.","blocking":true,"expected_result":"Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.","id":"AC-008","requirement_refs":["R-005"],"statement":"Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.","blocking":true,"expected_result":"All commands exit 0 and generated mirrors match canonical sources.","id":"AC-009","requirement_refs":["R-006"],"statement":"Mirrors and repository checks pass after the change.","task_refs":["TASK-002","TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the Angular code and security review references for static-analysis handling.","blocking":true,"expected_result":"Review guidance links the shared reference, describes advisory handling, and the sanitization-bypass rule AG-3 keeps its heading and severity.","id":"AC-010","requirement_refs":["R-004"],"statement":"Angular review guidance treats analyzer findings as advisory inside existing dimensions and keeps stronger existing rules.","task_refs":["TASK-001","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Generated navigation code adds maintainability findings and the example needs a follow-up revision.","evidence_refs":["sonar-uat-2026-11-12-S3735-count-12"],"id":"A-001","impacted_refs":["R-001"],"owner":"sdcorejs-plan","rationale":"Changing the example without evidence would add churn against a common floating-promise convention.","source":"inferred","statement":"Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.","status":"validated","type":"assumption","validation_method":"Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code."},{"blocking":false,"confidence":"high","consequence_if_wrong":"Proposing analyzer-configuration handling could hide a real keyboard-access defect.","evidence_refs":["sdcorejs-angular-v19.2.15-button-component-native-button"],"id":"A-002","impacted_refs":["R-005","AC-008"],"owner":"sdcorejs-plan","rationale":"The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.","source":"inferred","statement":"Core UI button hosts render a native button, so keyboard activation already produces a click on the host.","status":"validated","type":"assumption","validation_method":"Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."},{"blocking":false,"confidence":"high","consequence_if_wrong":"The generated spec fails to compile or run.","evidence_refs":["generate-golden-project-jasmine-core-5.9.0"],"id":"A-003","impacted_refs":["AC-004"],"owner":"sdcorejs-plan","rationale":"Size-specific matcher is the analyzer-recommended form for Jasmine.","source":"inferred","statement":"The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.","status":"validated","type":"assumption","validation_method":"The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-005","AC-008","INV-002"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should generated code handle keyboard-equivalent findings on Core UI button hosts?","rationale":"The user chose analyzer configuration and rejected unnecessary API changes.","revisit_condition":null,"scope":"repository","selected_value":"Keep the click binding; propose analyzer configuration in the target project.","source":"explicit-user","statement":"Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","AC-006","AC-007"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Should the skill pack enforce one organisation's analyzer configuration?","rationale":"The user requires general guidance not biased by one project or company configuration.","revisit_condition":null,"scope":"repository","selected_value":"No; neutral guidance with advisory proposals gated by project evidence.","source":"explicit-user","statement":"The skill pack stays tool- and project-neutral and gives advisory proposals.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-008","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","AC-005","INV-001"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where should static-analysis guidance live?","rationale":"Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.","revisit_condition":null,"scope":"repository","selected_value":"New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.","source":"explicit-user","statement":"Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.","status":"approved","supersedes":null,"task_refs":["TASK-003"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"What coverage approach applies?","rationale":"Confirmed in the requirement contract and matches repository practice.","revisit_condition":null,"scope":"repository","selected_value":"TDD; write failing contract tests first, then change references.","source":"explicit-user","statement":"Use TDD with test/e2e contract tests.","status":"approved","supersedes":null,"task_refs":["TASK-001"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","AC-010","INV-001","INV-002","INV-003","INV-004"]}},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-008","EVIDENCE-009","EVIDENCE-010"],"id":"INV-001","protected_refs":["R-003","R-004","AC-007","AC-010"],"statement":"No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.","task_refs":["TASK-001","TASK-002","TASK-008","TASK-009","TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-002","EVIDENCE-003","EVIDENCE-009","EVIDENCE-010"],"id":"INV-002","protected_refs":["R-005","AC-008"],"statement":"Core UI button host click bindings in Angular templates remain unchanged.","task_refs":["TASK-001","TASK-002","TASK-003","TASK-009","TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-004","EVIDENCE-005","EVIDENCE-006","EVIDENCE-007","EVIDENCE-008"],"id":"INV-003","protected_refs":["R-001","AC-001","AC-002","AC-003","AC-004"],"statement":"Rewritten Angular examples keep their documented intent: data still loads on init with handled failures, dependencies stay injected, custom-UI gaps stay visible to the owner, and the golden spec still asserts two inputs.","task_refs":["TASK-001","TASK-004","TASK-005","TASK-006","TASK-007","TASK-008"],"type":"invariant"},{"evidence_refs":["EVIDENCE-001","EVIDENCE-003","EVIDENCE-008","EVIDENCE-009"],"id":"INV-004","protected_refs":["R-002","AC-005","AC-006"],"statement":"The shared static-analysis reference stays tool- and project-neutral, English-only and advisory.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"invariant"}],"revision":3,"schema_version":1}
    goals:
      - id: G-001
        statement: Generated Angular examples stop teaching self-reported analyzer patterns.
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: G-002
        statement: Neutral, advisory static-analysis guidance is reachable from Angular executor and review.
        task_refs:
          - TASK-003
          - TASK-008
          - TASK-009
      - id: G-003
        statement: Regression tests and mirrors keep the change enforced.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-010
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/static-analysis-compatibility-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-010
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - D-004
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - D-004
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
          - package.json
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-006
              - AC-009
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/shared/static-analysis-compatibility.md
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-002
              - R-005
              - AC-005
              - AC-006
              - AC-008
              - INV-002
              - INV-004
              - D-001
              - D-002
              - D-003
        justification_refs:
          - R-002
          - R-005
          - D-001
          - D-002
          - D-003
        enforces_invariant_refs:
          - INV-002
          - INV-004
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/write-code/admin-screens.md
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-001
              - AC-001
              - AC-003
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/templates/init-module-templates.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - AC-002
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/architecture-principles.md
          - _refs/angular/write-code/init-entity.md
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-001
              - AC-003
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/angular/generator/generate-golden-project.mjs
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-001
              - AC-004
              - INV-003
        justification_refs:
          - R-001
        enforces_invariant_refs:
          - INV-003
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/orchestrator-generation.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-001
              - R-002
              - R-003
              - AC-003
              - AC-005
              - AC-007
              - INV-001
              - INV-003
              - INV-004
              - D-002
        justification_refs:
          - R-001
          - R-002
          - R-003
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-003
          - INV-004
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/review-code.md
          - _refs/angular/review-accessibility.md
          - _refs/angular/review-security.md
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-002
              - R-004
              - R-005
              - AC-005
              - AC-008
              - AC-010
              - INV-001
              - INV-002
              - INV-004
              - D-001
              - D-002
        justification_refs:
          - R-002
          - R-004
          - R-005
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-009
        planned_paths:
          - .claude/_refs/shared/static-analysis-compatibility.md
          - plugin/_refs/shared/static-analysis-compatibility.md
          - codex/skills/_refs/shared/static-analysis-compatibility.md
          - .claude/_refs/angular/write-code/admin-screens.md
          - plugin/_refs/angular/write-code/admin-screens.md
          - codex/skills/_refs/angular/write-code/admin-screens.md
          - .claude/_refs/angular/templates/init-module-templates.md
          - plugin/_refs/angular/templates/init-module-templates.md
          - codex/skills/_refs/angular/templates/init-module-templates.md
          - .claude/_refs/angular/architecture-principles.md
          - plugin/_refs/angular/architecture-principles.md
          - codex/skills/_refs/angular/architecture-principles.md
          - .claude/_refs/angular/write-code/init-entity.md
          - plugin/_refs/angular/write-code/init-entity.md
          - codex/skills/_refs/angular/write-code/init-entity.md
          - .claude/_refs/angular/generator/generate-golden-project.mjs
          - plugin/_refs/angular/generator/generate-golden-project.mjs
          - codex/skills/_refs/angular/generator/generate-golden-project.mjs
          - .claude/_refs/angular/orchestrator-generation.md
          - plugin/_refs/angular/orchestrator-generation.md
          - codex/skills/_refs/angular/orchestrator-generation.md
          - .claude/_refs/angular/review-code.md
          - plugin/_refs/angular/review-code.md
          - codex/skills/_refs/angular/review-code.md
          - .claude/_refs/angular/review-accessibility.md
          - plugin/_refs/angular/review-accessibility.md
          - codex/skills/_refs/angular/review-accessibility.md
          - .claude/_refs/angular/review-security.md
          - plugin/_refs/angular/review-security.md
          - codex/skills/_refs/angular/review-security.md
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-006
              - AC-009
              - INV-001
              - INV-002
        justification_refs:
          - R-006
        enforces_invariant_refs:
          - INV-001
          - INV-002
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/static-analysis-compatibility-contract.test.mjs
            - package.json
            - _refs/shared/static-analysis-compatibility.md
            - _refs/angular/write-code/admin-screens.md
            - _refs/angular/templates/init-module-templates.md
            - _refs/angular/architecture-principles.md
            - _refs/angular/write-code/init-entity.md
            - _refs/angular/generator/generate-golden-project.mjs
            - _refs/angular/orchestrator-generation.md
            - _refs/angular/review-code.md
            - _refs/angular/review-accessibility.md
            - _refs/angular/review-security.md
            - .claude/_refs/shared/static-analysis-compatibility.md
            - plugin/_refs/shared/static-analysis-compatibility.md
            - codex/skills/_refs/shared/static-analysis-compatibility.md
            - .claude/_refs/angular/write-code/admin-screens.md
            - plugin/_refs/angular/write-code/admin-screens.md
            - codex/skills/_refs/angular/write-code/admin-screens.md
            - .claude/_refs/angular/templates/init-module-templates.md
            - plugin/_refs/angular/templates/init-module-templates.md
            - codex/skills/_refs/angular/templates/init-module-templates.md
            - .claude/_refs/angular/architecture-principles.md
            - plugin/_refs/angular/architecture-principles.md
            - codex/skills/_refs/angular/architecture-principles.md
            - .claude/_refs/angular/write-code/init-entity.md
            - plugin/_refs/angular/write-code/init-entity.md
            - codex/skills/_refs/angular/write-code/init-entity.md
            - .claude/_refs/angular/generator/generate-golden-project.mjs
            - plugin/_refs/angular/generator/generate-golden-project.mjs
            - codex/skills/_refs/angular/generator/generate-golden-project.mjs
            - .claude/_refs/angular/orchestrator-generation.md
            - plugin/_refs/angular/orchestrator-generation.md
            - codex/skills/_refs/angular/orchestrator-generation.md
            - .claude/_refs/angular/review-code.md
            - plugin/_refs/angular/review-code.md
            - codex/skills/_refs/angular/review-code.md
            - .claude/_refs/angular/review-accessibility.md
            - plugin/_refs/angular/review-accessibility.md
            - codex/skills/_refs/angular/review-accessibility.md
            - .claude/_refs/angular/review-security.md
            - plugin/_refs/angular/review-security.md
            - codex/skills/_refs/angular/review-security.md
          intended_new_paths: []
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
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-no-async-lifecycle-hook
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: No async or Promise-typed Angular lifecycle hook remains in Angular references or skills.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-inject-fields-readonly
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Every inject() field declaration in Angular templates and write-code references is readonly.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-no-alert-todo-placeholder
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: No alert TODO placeholder guidance remains; the placeholder is a disabled action plus a generation-summary entry.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-003
      risk: RISK-002
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-golden-spec-specific-size-matcher
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The generated golden spec uses toHaveSize(2) and no length-to-be assertion.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-shared-ref-sections-and-links
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The shared reference has the required sections and Angular executor/review references link to it.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-004
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-shared-ref-neutrality
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The shared reference is English-only, names no organisation/host/project/repository, and keeps analyzer keys in example cells for at least two analyzers.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-executor-advisory-evidence-gated
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Shared reference and executor guidance state the evidence trigger, Low/RECOMMENDED advisory severity, no analyzer-only blocking and no config or dependency edits without approval; review dimensions and dependencies are unchanged.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-002
      risk: RISK-003
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-click-host-guidance
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Button host click bindings are unchanged; guidance forbids host keydown.enter, provides a neutral analyzer-config proposal and requires real fixes on non-interactive elements.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-check-skills
      planned_command: npm run check:skills
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Generated mirrors match canonical sources.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-text-hygiene
      planned_command: npm run check:text-hygiene
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Text hygiene passes for all tracked files.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
        - INV-002
      risk: RISK-004
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-repository-suite
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: The repository e2e suite passes including the new contract test.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
      risk: RISK-001
      boundary:
        kind: none
        approval_ref: D-004
        source_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
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
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-review-advisory
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Angular review guidance links the shared reference, handles analyzer findings as advisory and keeps AG-3 unchanged.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  risk_register:
    - id: RISK-001
      statement: Advisory guidance drifts into project-specific or blocking rules.
      mitigation: AC-005/AC-006 neutrality checks, AC-007/AC-010 advisory checks, INV-001 and INV-004.
    - id: RISK-002
      statement: Rewritten examples change intended behavior or text checks do not reflect generated code.
      mitigation: AC-001..AC-004 contract cases including generated golden spec content, INV-003.
    - id: RISK-003
      statement: Custom-element click-host guidance causes double-fire or hides real accessibility defects.
      mitigation: AC-008 baseline and guidance checks, INV-002.
    - id: RISK-004
      statement: Mirrors, summary or repository checks regress after reference edits.
      mitigation: AC-009 check:skills, text hygiene and repository suite.
  contract_id: static-analysis-compatibility-20261112
  requirement_id: R-001
  approved_spec_path: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
  approved_spec_hash: sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
      artifact_id: spec-static-analysis-compatibility-20261112-r3
      revision: 1d985025536ccde105b4dd3cf88e20f71e18f3c1
      approval_hash: sha256:v1:47ce9d11ccbec526111c015936405d067c06241c36dfde948e4770712d17714b
  approved_plan_path: .sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md
  approved_plan_hash: null
  supersedes: plan-static-analysis-compatibility-20261112-r3
  target_root: sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - sdcorejs-agent
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 10
  phase_count: 3
  allowed_paths:
    - test/e2e/static-analysis-compatibility-contract.test.mjs
    - package.json
    - _refs/shared/static-analysis-compatibility.md
    - _refs/angular/write-code/admin-screens.md
    - _refs/angular/templates/init-module-templates.md
    - _refs/angular/architecture-principles.md
    - _refs/angular/write-code/init-entity.md
    - _refs/angular/generator/generate-golden-project.mjs
    - _refs/angular/orchestrator-generation.md
    - _refs/angular/review-code.md
    - _refs/angular/review-accessibility.md
    - _refs/angular/review-security.md
    - .claude/_refs/shared/static-analysis-compatibility.md
    - plugin/_refs/shared/static-analysis-compatibility.md
    - codex/skills/_refs/shared/static-analysis-compatibility.md
    - .claude/_refs/angular/write-code/admin-screens.md
    - plugin/_refs/angular/write-code/admin-screens.md
    - codex/skills/_refs/angular/write-code/admin-screens.md
    - .claude/_refs/angular/templates/init-module-templates.md
    - plugin/_refs/angular/templates/init-module-templates.md
    - codex/skills/_refs/angular/templates/init-module-templates.md
    - .claude/_refs/angular/architecture-principles.md
    - plugin/_refs/angular/architecture-principles.md
    - codex/skills/_refs/angular/architecture-principles.md
    - .claude/_refs/angular/write-code/init-entity.md
    - plugin/_refs/angular/write-code/init-entity.md
    - codex/skills/_refs/angular/write-code/init-entity.md
    - .claude/_refs/angular/generator/generate-golden-project.mjs
    - plugin/_refs/angular/generator/generate-golden-project.mjs
    - codex/skills/_refs/angular/generator/generate-golden-project.mjs
    - .claude/_refs/angular/orchestrator-generation.md
    - plugin/_refs/angular/orchestrator-generation.md
    - codex/skills/_refs/angular/orchestrator-generation.md
    - .claude/_refs/angular/review-code.md
    - plugin/_refs/angular/review-code.md
    - codex/skills/_refs/angular/review-code.md
    - .claude/_refs/angular/review-accessibility.md
    - plugin/_refs/angular/review-accessibility.md
    - codex/skills/_refs/angular/review-accessibility.md
    - .claude/_refs/angular/review-security.md
    - plugin/_refs/angular/review-security.md
    - codex/skills/_refs/angular/review-security.md
    - .sdcorejs/summary.md
    - .sdcorejs/docs/workflow/*static-analysis-compatibility*
    - .sdcorejs/specs/workflow/*static-analysis-compatibility*.md
    - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
  prohibited_paths:
    - skills/**
    - AGENTS.md
    - CLAUDE.md
    - .github/**
    - site/**
    - scripts/**
    - package-lock.json
    - _refs/shared/system-registry.json
    - _refs/harness/**
    - .cursor/**
    - "**/sdcorejs-harness.json"
  generated_artifacts:
    - .claude/_refs/shared/static-analysis-compatibility.md
    - plugin/_refs/shared/static-analysis-compatibility.md
    - codex/skills/_refs/shared/static-analysis-compatibility.md
    - .claude/_refs/angular/write-code/admin-screens.md
    - plugin/_refs/angular/write-code/admin-screens.md
    - codex/skills/_refs/angular/write-code/admin-screens.md
    - .claude/_refs/angular/templates/init-module-templates.md
    - plugin/_refs/angular/templates/init-module-templates.md
    - codex/skills/_refs/angular/templates/init-module-templates.md
    - .claude/_refs/angular/architecture-principles.md
    - plugin/_refs/angular/architecture-principles.md
    - codex/skills/_refs/angular/architecture-principles.md
    - .claude/_refs/angular/write-code/init-entity.md
    - plugin/_refs/angular/write-code/init-entity.md
    - codex/skills/_refs/angular/write-code/init-entity.md
    - .claude/_refs/angular/generator/generate-golden-project.mjs
    - plugin/_refs/angular/generator/generate-golden-project.mjs
    - codex/skills/_refs/angular/generator/generate-golden-project.mjs
    - .claude/_refs/angular/orchestrator-generation.md
    - plugin/_refs/angular/orchestrator-generation.md
    - codex/skills/_refs/angular/orchestrator-generation.md
    - .claude/_refs/angular/review-code.md
    - plugin/_refs/angular/review-code.md
    - codex/skills/_refs/angular/review-code.md
    - .claude/_refs/angular/review-accessibility.md
    - plugin/_refs/angular/review-accessibility.md
    - codex/skills/_refs/angular/review-accessibility.md
    - .claude/_refs/angular/review-security.md
    - plugin/_refs/angular/review-security.md
    - codex/skills/_refs/angular/review-security.md
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-11-12-10-53-static-analysis-compatibility-spec-r3.md
    - .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
    - .sdcorejs/docs/workflow/2026-11-12-11-09-static-analysis-compatibility-plan-r4.md
    - .sdcorejs/plans/workflow/<approval-stamp>-static-analysis-compatibility-r4.md
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
  package_manifest_changes:
    required: false
    files: []
    scope: package.json scripts were already changed under r2; r4 adds no manifest change
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack reference, generator literal and contract-test change; no frontend application code is produced in this repository.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No AI-agent application contract is in scope.
  verification_strategy:
    package_manager: npm
    package_manager_evidence:
      - package.json packageManager npm@10.9.2
      - package-lock.json present
      - node_modules installed with npm ci --ignore-scripts
    commands_planned:
      - npm run test:e2e:static-analysis - RED for the two new case names, then GREEN 9/9 (AC-001..AC-008, AC-010)
      - npm run check:skills - mirrors match canonical sources (AC-009)
      - npm run check:text-hygiene - text hygiene (AC-009)
      - npm run test:e2e:angular, npm run test:e2e:phase1, npm run test:e2e:skill-audit - existing tests that read changed files
      - repository list of npm run test:e2e:repository (AC-009); its cleanup tail is reported separately on Windows
      - git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)
    commands_skipped:
      - npm run test:e2e:angular:golden - installs and builds a generated Angular project; CI covers it on Linux
      - cleanup-engine.test.mjs on this Windows host - hangs before and after this change; CI covers it on Linux
    checks: Re-run focused and broad checks at the final HEAD after the test split, then evaluate delivery convergence and branch-ready before push.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files: []
    reason: One remaining edit (TASK-001 test split); all other tasks were executed under r2.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - sdcorejs-agent
    contract:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          role: standalone
          git_root: .
      mutable_steps_single_root: true
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
      commit_push_requires_explicit_user_request: true
  execution_progress_at_revision:
    completed_under_r2:
      - TASK-002..TASK-010 executed and verified under plan r2, committed in 1d98502
      - TASK-001 created the contract test (8 cases) under r2
    remaining_under_r4:
      - TASK-001 splits case-sac-advisory-evidence-gated into case-sac-executor-advisory-evidence-gated (AC-007) and case-sac-review-advisory (AC-010)
  approval:
    approved: true
    approved_at: 2026-11-12T06:48:56.940Z
    approval_source: explicit-user-choice
    instruction_reference: conversation/2026-11-12/plan-r4-approval-gate/user-reply-1
    document_review_performed: false
  change_control:
    revision: 4
    supersedes: plan-static-analysis-compatibility-20261112-r3
    change_reason: "Traceability for delivery convergence on spec r3: per-task requirement/AC/invariant/risk links, AC-010 validation row, and TASK-001 splits the advisory contract case into executor (AC-007) and review (AC-010) cases."
  artifact_context:
    schema_version: 1
    change_ref: static-analysis-compatibility-20261112
    source_spec: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
    source_plan: .sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md
    required_with_change:
      - path: .sdcorejs/docs/workflow/2026-11-12-10-53-static-analysis-compatibility-spec-r3.md
        kind: execution-doc
        reason: spec r3 draft
      - path: .sdcorejs/specs/workflow/2026-11-12-11-08-static-analysis-compatibility-r3.md
        kind: spec
        reason: approved scope r3
      - path: .sdcorejs/docs/workflow/2026-11-12-11-09-static-analysis-compatibility-plan-r4.md
        kind: execution-doc
        reason: plan r4 draft
      - path: .sdcorejs/plans/workflow/2026-11-12-13-48-static-analysis-compatibility-r4.md
        kind: plan
        reason: approved execution contract r4
    shared_owned: []
    conditional:
      - path: .sdcorejs/docs/workflow/2026-11-12-01-10-static-analysis-compatibility-spec.md
        kind: execution-doc
        reason: superseded spec r1 draft; contains an internal project name; kept local
      - path: .sdcorejs/specs/workflow/2026-11-12-01-15-static-analysis-compatibility.md
        kind: spec
        reason: superseded spec r1; contains an internal project name; kept local
      - path: .sdcorejs/docs/workflow/2026-11-12-01-23-static-analysis-compatibility-plan.md
        kind: execution-doc
        reason: superseded plan r1 draft; kept local
      - path: .sdcorejs/plans/workflow/2026-11-12-01-28-static-analysis-compatibility.md
        kind: plan
        reason: superseded plan r1; kept local
      - path: .sdcorejs/docs/workflow/2026-11-12-01-35-static-analysis-compatibility-plan-r2.md
        kind: execution-doc
        reason: superseded plan r2 draft; kept local
      - path: .sdcorejs/plans/workflow/2026-11-12-01-38-static-analysis-compatibility-r2.md
        kind: plan
        reason: superseded plan r2; kept local
    local_only: []
    unrelated_observed: []
```

## Authority and review provenance

- Phê duyệt: lựa chọn tường minh của người dùng "Duyệt r4" (2026-11-12) cho approval gate r4 có tóm tắt thay đổi so với r3 (traceability cho delivery convergence và tách test case cho AC-010), kết quả self-review và ba lựa chọn 1/2/3; trước đó người dùng chọn "Bổ sung rồi push" và duyệt spec r3.
- Phạm vi: duyệt plan thực thi r4 (TASK-001 tách test case; các task khác đã thực thi theo r2); người dùng đã yêu cầu commit và push nhánh sau gate trong cùng luồng "Bổ sung rồi push".
- Review tài liệu: người dùng duyệt dựa trên tóm tắt đã trình; không quan sát được việc đọc toàn văn (`document_review_performed: false`).
- Tự review: decision coverage stage plan sạch (revision 3); goal-backward 1 vòng sạch; validation map 11 dòng approval-ready với ràng buộc phê duyệt thật; architecture handoff hợp lệ.

## Skill provenance

sdcorejs-plan (revision 4; self-review attempt 1 / 3; authority: explicit-user-choice)
