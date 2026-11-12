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
  - ".sdcorejs/docs/workflow/*static-analysis-compatibility*"
  - ".sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md"
  - ".sdcorejs/plans/workflow/*static-analysis-compatibility*.md"
approval_source: "explicit-user-choice"
approved_architecture_hash: null
approved_architecture_reference: null
approved_at: "2026-11-12T02:54:54.144Z"
approved_by: "user"
approved_spec_hash: "sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9"
approved_spec_reference:
  approval_hash: "sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9"
  artifact_id: "spec-static-analysis-compatibility-20261112-r2"
  repository_id: "github.com/sdcorejs/sdcorejs-agent"
  repository_relative_path: ".sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md"
  revision: "bdc22462070f9e52bb7900619970d8f8f17c5c50"
artifact_id: "plan-static-analysis-compatibility-20261112-r3"
artifact_kind: "plan"
change_control:
  change_reason: "Re-parent onto approved spec r2 (wording-only spec revision); tasks, paths, evidence and validation map are unchanged and were executed under r2."
  revision: 3
  supersedes: "plan-static-analysis-compatibility-20261112-r2"
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
instruction_reference: "conversation/2026-11-12/plan-r3-approval-gate/user-reply-1"
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
    approval_hash: "sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9"
    artifact_id: "spec-static-analysis-compatibility-20261112-r2"
    artifact_kind: "spec"
    repository_id: "github.com/sdcorejs/sdcorejs-agent"
    revision: "bdc22462070f9e52bb7900619970d8f8f17c5c50"
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
  - "other _refs/** files not listed in allowed_paths"
repository_relative_path: ".sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md"
requirement_id: "R-001"
schema_version: 1
sourceSpecPath: ".sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md"
source_architecture: "none"
source_plan: "none"
source_revision: "bdc22462070f9e52bb7900619970d8f8f17c5c50"
source_spec: ".sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md"
stack_profile: "markdown-skill-pack"
supersedes: "plan-static-analysis-compatibility-20261112-r2"
target_root_kind: "sdcorejs-agent-authoring-repo"
task_count: 10
track: "workflow"
verification_strategy:
  commands_planned:
    - "npm run test:e2e:static-analysis - RED after TASK-002, GREEN after TASK-009 (AC-001..AC-008, INV-002)"
    - "npm run sync:skills - regenerate mirrors (TASK-010)"
    - "npm run check:skills - mirrors match canonical sources (AC-009)"
    - "npm run check:text-hygiene - text hygiene (AC-009)"
    - "npm run test:e2e:angular - existing Angular contract reading admin-screens.md"
    - "npm run test:e2e:phase1 - existing skill-pack runner reading Angular review/template refs"
    - "npm run test:e2e:skill-audit - existing template-producer audit reading the golden generator"
    - "npm run test:e2e:repository - broad repository suite (AC-009)"
    - "git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)"
    - "git diff -- package.json - only the two scripts lines change (INV-001)"
  package_manager: "npm"
approval_hash: "sha256:v1:11f08015902001ea430ab4e24cec750955cd99f8892767f40c5f02a61315087f"
approved_plan_hash: "sha256:v1:11f08015902001ea430ab4e24cec750955cd99f8892767f40c5f02a61315087f"
---
# Tương thích phân tích tĩnh cho code Angular do skill sinh - Approved Plan r3

> Hợp đồng thực thi bất biến, được người dùng duyệt bằng phản hồi "Duyệt r3" ngày 12/11/2026; supersede `.sdcorejs/plans/workflow/2026-11-12-01-38-static-analysis-compatibility-r2.md`. Nếu hợp đồng thay đổi, tạo revision mới qua `sdcorejs-plan`; không sửa snapshot này.

## Approved contract

Phần dưới giữ nguyên bản nháp đã trình duyệt. Khối `plan_context` trong bản nháp là trạng thái lúc trình duyệt; mục "Final plan context" phía sau là ngữ cảnh thực thi có ràng buộc phê duyệt.

# Plan r3 - Tương thích phân tích tĩnh cho code Angular do skill sinh - 2026-11-12

Nguồn: spec đã duyệt `.sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md` (`sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9`). Spec giữ phần "cái gì, vì sao"; plan này chỉ nêu "làm thế nào, theo thứ tự nào".

## Thay đổi so với r2

Supersede `.sdcorejs/plans/workflow/2026-11-12-01-38-static-analysis-compatibility-r2.md` (`plan-static-analysis-compatibility-20261112-r2`). Chỉ đổi parent sang spec r2 `.sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md` (`sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9`); spec r2 là revision chỉ đổi cách gọi tên dự án nội bộ. Task, path, evidence, validation map và decision coverage giữ nguyên; toàn bộ task đã được thực thi và verify theo r2.

## Thay đổi của r2 so với r1 (lịch sử)

Supersede `.sdcorejs/plans/workflow/2026-11-12-01-28-static-analysis-compatibility.md` (`plan-static-analysis-compatibility-20261112-r1`). Lần chạy RED của AC-003 tìm thấy hướng dẫn placeholder `alert('TODO…')` ở 4 chỗ thay vì 1: `architecture-principles.md:275`, `write-code/admin-screens.md:683`, `orchestrator-generation.md:164` và `write-code/init-entity.md:227` (file cuối nằm ngoài `allowed_paths` của r1). r2 thêm `_refs/angular/write-code/init-entity.md` và 3 mirror của nó vào TASK-006/TASK-010, và giao AC-003 cho TASK-004, TASK-006, TASK-008. Spec, TASK-001, TASK-002 và kết quả RED giữ nguyên.

## Scope

Bỏ 4 pattern tự gây finding khỏi ref/template Angular và golden generator; thêm ref dùng chung `_refs/shared/static-analysis-compatibility.md` (tiếng Anh, trung lập công cụ/dự án); nối ref vào executor và review Angular ở dạng đề xuất có điều kiện; khóa bằng contract test và đồng bộ mirror. Không đổi binding `(click)` trên `sd-button` (baseline: 40 phần tử trong 6 file).

## Execution context

- Track: `workflow`
- Target root kind: `sdcorejs-agent-authoring-repo`
- Stack profile: `markdown-skill-pack`
- Coverage approach: TDD (D-004) - viết contract test và chạy RED trước khi sửa ref.
- Parallel candidates: không; thay đổi nhỏ, tuần tự, mirror chỉ sinh lại một lần.
- Architecture: `not-applicable` (`docs-only`), `architecture_context: null`.

## Preflight (trước mọi lần sửa)

1. `git status --short`, staged/unstaged diffstat, untracked, branch, HEAD; so với `allowed_paths`/`prohibited_paths`. Thay đổi hiện có đều thuộc change này: artifact `.sdcorejs`, file test mới và `package.json` (scripts) từ TASK-001/TASK-002.
2. Xác nhận repo authoring là đích ghi (đã xác nhận ở brainstorming/spec).
3. `node_modules` đã cài bằng `npm ci --ignore-scripts` (lockfile; không cài git hook).

## Tasks

### Phase 1 - RED
1. TASK-001 CREATE `github.com/sdcorejs/sdcorejs-agent:test/e2e/static-analysis-compatibility-contract.test.mjs` - contract test `node:test` với 8 case: `case-sac-no-async-lifecycle-hook`, `case-sac-inject-fields-readonly`, `case-sac-no-alert-todo-placeholder`, `case-sac-golden-spec-specific-size-matcher` (sinh golden project vào thư mục tạm của OS rồi đọc `src/app/app.spec.ts`, dọn thư mục tạm), `case-sac-shared-ref-sections-and-links`, `case-sac-shared-ref-neutrality` (chỉ tiếng Anh; không tên tổ chức/host/dự án/repo; rule key analyzer chỉ ở cột ví dụ, ít nhất 2 analyzer), `case-sac-advisory-evidence-gated`, `case-sac-click-host-guidance` (đếm lại 40 phần tử `sd-button` có `(click)` theo từng file; ref cấm `keydown.enter` trên host bọc control gốc).
2. TASK-002 EDIT `github.com/sdcorejs/sdcorejs-agent:package.json` - chỉ thêm script `test:e2e:static-analysis` và nối file test mới vào `test:e2e:repository`; không đổi dependency/lockfile. Chạy `npm run test:e2e:static-analysis` và lưu bằng chứng RED (các case fail đúng lý do).

### Phase 2 - GREEN
3. TASK-003 CREATE `github.com/sdcorejs/sdcorejs-agent:_refs/shared/static-analysis-compatibility.md` - các mục: Purpose and principles, Evidence detection, Pattern families (bảng: family, why analyzers report it, neutral remediation, example analyzer keys), Custom element click hosts, Proposal format, Non-goals, Angular examples.
4. TASK-004 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/write-code/admin-screens.md` - 2 ví dụ `async ngOnInit()` thành `ngOnInit(): void` gọi method private tải dữ liệu và tự xử lý lỗi promise; dòng 683 bỏ `alert('TODO…')`, đánh dấu fallback bằng ghi chú trong generation summary.
5. TASK-005 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/templates/init-module-templates.md` - `#cdr`, `#baseService` thành `readonly`.
6. TASK-006 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/architecture-principles.md`, `github.com/sdcorejs/sdcorejs-agent:_refs/angular/write-code/init-entity.md` - thay hướng dẫn `alert('TODO…')` bằng action disable có `<localized label>` và một dòng trong generation summary.
7. TASK-007 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/generator/generate-golden-project.mjs` - assert `toHaveSize(2)` thay `.length).toBe(2)`.
8. TASK-008 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/orchestrator-generation.md` - dòng 164 thay "scaffold a skeleton + `alert('TODO: ...')`" bằng skeleton có action disable; thêm mục ngắn trước finish gate: áp dụng các nhóm good practice mặc định; khi dự án có bằng chứng analyzer thì thêm đề xuất advisory vào generation summary; không sửa cấu hình analyzer/thêm dependency khi chưa duyệt; link ref.
9. TASK-009 EDIT `github.com/sdcorejs/sdcorejs-agent:_refs/angular/review-code.md`, `review-accessibility.md`, `review-security.md` - mục kiểm advisory (Low/RECOMMENDED, có điều kiện bằng chứng, không chặn chỉ vì analyzer); a11y: `(click)` trên phần tử không tương tác là finding thật theo severity hiện có, host bọc control gốc chỉ là ghi chú analyzer, cấm đề xuất `keydown.enter`; security: AG-3 giữ nguyên severity, thêm ánh xạ analyzer làm ví dụ và nhắc `postMessage` targetOrigin/PRNG; link ref. Không đụng template chứa `sd-button`.

### Phase 3 - Sync và verify
10. TASK-010 RUN `npm run sync:skills` (sinh lại 30 file mirror, 3 file mới) rồi verify: `npm run test:e2e:static-analysis` (GREEN), `npm run check:skills`, `npm run check:text-hygiene`, `npm run test:e2e:angular`, `npm run test:e2e:phase1`, `npm run test:e2e:skill-audit`, `npm run test:e2e:repository`; kiểm INV-001 bằng `git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json` (rỗng) và `git diff -- package.json` (chỉ 2 dòng scripts).

## Acceptance mapping
- AC-001 -> TASK-001, TASK-004
- AC-002 -> TASK-001, TASK-005
- AC-003 -> TASK-001, TASK-004, TASK-006, TASK-008
- AC-004 -> TASK-001, TASK-007
- AC-005 -> TASK-001, TASK-003, TASK-008, TASK-009
- AC-006 -> TASK-001, TASK-003
- AC-007 -> TASK-001, TASK-008, TASK-009 (INV-001)
- AC-008 -> TASK-001, TASK-003, TASK-009 (INV-002)
- AC-009 -> TASK-010 (INV-001, INV-002)

## Verification
- `npm run test:e2e:static-analysis` (RED rồi GREEN)
- `npm run check:skills`, `npm run check:text-hygiene`
- `npm run test:e2e:angular`, `npm run test:e2e:phase1`, `npm run test:e2e:skill-audit`
- `npm run test:e2e:repository` (giới hạn thời gian; nếu file cleanup bị treo trên Windows thì ghi là giới hạn môi trường, không coi là pass)
- Bỏ qua cục bộ: `npm run test:e2e:angular:golden` (CI chạy trên Linux)

## Self-review
- decision_coverage stage plan: 0 lỗi, 0 blocker, 0 gap. Revision 3 (r2) giữ mọi ID; thay đổi duy nhất so với revision 2 là task/evidence mapping của AC-003. Ranh giới validation `none` cho D-004 và A-002 validated giữ nguyên.
- goal-backward r2: 1 vòng sạch (r1 đã sửa trùng path TASK-011 ở vòng 1).
- validation_map: 11 dòng, 9/9 AC, approval-ready khi kiểm với ràng buộc phê duyệt tạm trong bộ nhớ (ràng buộc thật được tạo khi người dùng duyệt).
- architecture draft handoff: hợp lệ.
- Ghi file manifest: chỉ `package.json` phần scripts, cần được duyệt cùng plan. Không đổi dependency, env, migration.

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
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: R-002
        type: requirement
        statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-003
      - id: R-003
        type: requirement
        statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-008
      - id: R-004
        type: requirement
        statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-009
      - id: R-005
        type: requirement
        statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-007
        type: acceptance-criterion
        statement: Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
        behavior: Read the Angular executor and review guidance for static-analysis handling.
        expected_result: Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-004
          - R-006
        task_refs:
          - TASK-001
          - TASK-008
          - TASK-009
      - id: AC-008
        type: acceptance-criterion
        statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
        behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
        expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
          - R-006
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
          - TASK-010
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
          - INV-001
          - INV-002
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
            - INV-001
            - INV-002
      - id: INV-001
        type: invariant
        statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
        protected_refs:
          - R-003
          - R-004
          - AC-007
        task_refs:
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: INV-002
        type: invariant
        statement: Core UI button host click bindings in Angular templates remain unchanged.
        protected_refs:
          - R-005
          - AC-008
        task_refs:
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-009
          - EVIDENCE-010
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
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
        - id: R-002
          type: requirement
          statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-003
        - id: R-003
          type: requirement
          statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-008
        - id: R-004
          type: requirement
          statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-009
        - id: R-005
          type: requirement
          statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
          task_refs:
            - TASK-001
            - TASK-003
        - id: AC-007
          type: acceptance-criterion
          statement: Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
          behavior: Read the Angular executor and review guidance for static-analysis handling.
          expected_result: Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
            - R-004
            - R-006
          task_refs:
            - TASK-001
            - TASK-008
            - TASK-009
        - id: AC-008
          type: acceptance-criterion
          statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
          behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
          expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
            - R-006
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
            - TASK-010
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
            - INV-001
            - INV-002
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
              - INV-001
              - INV-002
        - id: INV-001
          type: invariant
          statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
          protected_refs:
            - R-003
            - R-004
            - AC-007
          task_refs:
            - TASK-010
          evidence_refs:
            - EVIDENCE-010
        - id: INV-002
          type: invariant
          statement: Core UI button host click bindings in Angular templates remain unchanged.
          protected_refs:
            - R-005
            - AC-008
          task_refs:
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-009
            - EVIDENCE-010
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
              - R-006
              - D-004
        justification_refs:
          - R-006
          - D-004
        enforces_invariant_refs: []
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
        justification_refs:
          - R-006
        enforces_invariant_refs: []
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
              - D-001
              - D-002
              - D-003
        justification_refs:
          - R-002
          - R-005
          - D-001
          - D-002
          - D-003
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/orchestrator-generation.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-003
              - AC-003
              - AC-005
              - AC-007
              - D-002
        justification_refs:
          - R-003
          - D-002
        enforces_invariant_refs: []
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
              - R-004
              - R-005
              - AC-005
              - AC-007
              - AC-008
              - D-001
              - D-002
              - INV-002
        justification_refs:
          - R-004
          - R-005
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-002
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
            - _refs/angular/write-code/admin-screens.md
            - _refs/angular/templates/init-module-templates.md
            - _refs/angular/architecture-principles.md
            - _refs/angular/write-code/init-entity.md
            - _refs/angular/generator/generate-golden-project.mjs
            - _refs/angular/orchestrator-generation.md
            - _refs/angular/review-code.md
            - _refs/angular/review-accessibility.md
            - _refs/angular/review-security.md
            - package.json
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
          intended_new_paths:
            - path: test/e2e/static-analysis-compatibility-contract.test.mjs
              owner_task_id: TASK-001
            - path: _refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-003
            - path: .claude/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
            - path: plugin/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
            - path: codex/skills/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs: []
      risk: generated lifecycle examples teach a self-reported analyzer pattern
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs: []
      risk: templates teach mutable injected fields
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs: []
      risk: placeholder guidance generates TODO tags and alert calls
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-004
      invariant_refs: []
      risk: golden generator emits a generic length assertion
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs: []
      risk: guidance is missing or unreachable from Angular executor and review
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs: []
      risk: guidance drifts into one organisation or project configuration
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
          - INV-001
          - INV-002
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
      evidence_refs: []
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
      risk: advisory guidance becomes a blocking or mutating gate
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-advisory-evidence-gated
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Executor and review guidance state the evidence trigger, Low/RECOMMENDED advisory severity, no analyzer-only blocking, and no analyzer-config or dependency edits without approval.
      status: covered
      evidence_refs:
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
      risk: click-host guidance causes double-fire or hides real defects
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
          - INV-001
          - INV-002
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
      risk: mirrors drift from canonical sources
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
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
      risk: text hygiene regresses
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
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
      risk: repository contract suite regresses
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  contract_id: static-analysis-compatibility-20261112
  requirement_id: R-001
  approved_spec_path: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
  approved_spec_hash: sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
      artifact_id: spec-static-analysis-compatibility-20261112-r2
      revision: bdc22462070f9e52bb7900619970d8f8f17c5c50
      approval_hash: sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9
  approved_plan_path: ""
  approved_plan_hash: ""
  supersedes: plan-static-analysis-compatibility-20261112-r2
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
    - .sdcorejs/docs/workflow/*static-analysis-compatibility*
    - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
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
    - other _refs/** files not listed in allowed_paths
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
    - .sdcorejs/docs/workflow/2026-11-12-09-49-static-analysis-compatibility-spec-r2.md
    - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
    - .sdcorejs/docs/workflow/2026-11-12-09-53-static-analysis-compatibility-plan-r3.md
    - .sdcorejs/plans/workflow/<approval-stamp>-static-analysis-compatibility-r3.md
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
    required: true
    files:
      - package.json
    scope: "scripts only: add test:e2e:static-analysis and append the new test file to test:e2e:repository; no dependency, devDependency, engines or lockfile change"
    approval_required: true
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
      - package.json scripts inspected
    environment_prerequisites:
      - "node_modules is absent in the working tree: run npm ci (lockfile-pinned devDependencies; no manifest or lockfile write) before any node --test run that imports yaml or typescript"
    commands_planned:
      - npm run test:e2e:static-analysis - RED after TASK-002, GREEN after TASK-009 (AC-001..AC-008, INV-002)
      - npm run sync:skills - regenerate mirrors (TASK-010)
      - npm run check:skills - mirrors match canonical sources (AC-009)
      - npm run check:text-hygiene - text hygiene (AC-009)
      - npm run test:e2e:angular - existing Angular contract reading admin-screens.md
      - npm run test:e2e:phase1 - existing skill-pack runner reading Angular review/template refs
      - npm run test:e2e:skill-audit - existing template-producer audit reading the golden generator
      - npm run test:e2e:repository - broad repository suite (AC-009)
      - git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)
      - git diff -- package.json - only the two scripts lines change (INV-001)
    commands_skipped:
      - npm run test:e2e:angular:golden - installs and builds a generated Angular project (network and long runtime); CI npm run test:e2e covers it on Linux; run locally only on explicit request
    checks: "Focused: new contract test plus existing tests that read changed files. Broad: test:e2e:repository. Windows note: cleanup tests in the repository suite previously hung for hours on this host in an unrelated clone; run with a bounded timeout and report a hang as an environment limitation instead of a pass, deferring that file to CI."
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: package.json
        single_owner: TASK-002
        coordination: sequential
      - path: generated mirrors
        single_owner: TASK-010
        coordination: regenerate once after all canonical edits
    reason: Small sequential change; TDD order and a single mirror regeneration make parallel waves unnecessary.
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
  baselines:
    core_ui_button_host_click_elements:
      total: 40
      per_file:
        _refs/angular/templates/entity-skeleton.md: 11
        _refs/angular/templates/example-product.md: 4
        _refs/angular/templates/reactive-form-templates.md: 9
        _refs/angular/templates/screen-detail-component.md: 9
        _refs/angular/templates/screen-list-component.md: 1
        _refs/angular/write-code/actions.md: 6
      method: count <sd-button ...>...</sd-button> elements containing (click)= across _refs/angular/**/*.md at bdc22462
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 3
    supersedes: plan-static-analysis-compatibility-20261112-r2
    change_reason: "Re-parent onto approved spec r2 (wording-only spec revision); tasks, paths, evidence and validation map are unchanged and were executed under r2."
  execution_progress_at_revision:
    completed_under_r2:
      - TASK-001..TASK-010 completed and verified under r2
      - .sdcorejs/summary.md refreshed with explicit user approval
    note: Completed work stays valid under r3 because no task, path, evidence or validation row changed.
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
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: R-002
        type: requirement
        statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-003
      - id: R-003
        type: requirement
        statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-008
      - id: R-004
        type: requirement
        statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-009
      - id: R-005
        type: requirement
        statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
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
          - R-006
        task_refs:
          - TASK-001
          - TASK-003
      - id: AC-007
        type: acceptance-criterion
        statement: Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
        behavior: Read the Angular executor and review guidance for static-analysis handling.
        expected_result: Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-004
          - R-006
        task_refs:
          - TASK-001
          - TASK-008
          - TASK-009
      - id: AC-008
        type: acceptance-criterion
        statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
        behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
        expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
          - R-006
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
          - TASK-010
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
          - INV-001
          - INV-002
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
            - INV-001
            - INV-002
      - id: INV-001
        type: invariant
        statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
        protected_refs:
          - R-003
          - R-004
          - AC-007
        task_refs:
          - TASK-010
        evidence_refs:
          - EVIDENCE-010
      - id: INV-002
        type: invariant
        statement: Core UI button host click bindings in Angular templates remain unchanged.
        protected_refs:
          - R-005
          - AC-008
        task_refs:
          - TASK-009
          - TASK-010
        evidence_refs:
          - EVIDENCE-009
          - EVIDENCE-010
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
          - .sdcorejs/docs/workflow/*static-analysis-compatibility*
          - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
          - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
        approval_source: user-approved-decision-coverage
        approved_at: 2026-11-12T02:54:54.144Z
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
          - other _refs/** files not listed in allowed_paths
        repository_relative_path: .sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md
        requirement_id: decision-coverage
        schema_version: 1
        source_revision: bdc22462070f9e52bb7900619970d8f8f17c5c50
        stack_profile: markdown-skill-pack
        supersedes: decision-coverage-r3
        track: workflow
        approval_hash: sha256:v1:ea8349a64bf5bc0dfd63f4dea1dff4663aa32cd0f144a4a9c88662a4feab286e
      body: |
        {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":2,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":3,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.","status":"active","task_refs":["TASK-004","TASK-005","TASK-006","TASK-007"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.","status":"active","task_refs":["TASK-003"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.","status":"active","task_refs":["TASK-008"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.","status":"active","task_refs":["TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.","status":"active","task_refs":["TASK-003","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.","status":"active","task_refs":["TASK-001","TASK-002","TASK-010"],"type":"requirement"},{"behavior":"Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.","blocking":true,"expected_result":"Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.","id":"AC-001","requirement_refs":["R-001","R-006"],"statement":"No Angular reference or template example declares an async Angular lifecycle hook.","task_refs":["TASK-001","TASK-004"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular templates and write-code references for class fields initialised with inject().","blocking":true,"expected_result":"Every such field is declared readonly; zero non-readonly matches.","id":"AC-002","requirement_refs":["R-001","R-006"],"statement":"Every inject() field declaration in Angular templates is readonly.","task_refs":["TASK-001","TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.","blocking":true,"expected_result":"Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.","id":"AC-003","requirement_refs":["R-001","R-006"],"statement":"The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.","task_refs":["TASK-001","TASK-004","TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Generate the golden Angular project and inspect its spec text.","blocking":true,"expected_result":"The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.","id":"AC-004","requirement_refs":["R-001","R-006"],"statement":"The generated golden Angular test asserts collection size with a size-specific matcher.","task_refs":["TASK-001","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the new _refs/shared reference and the Angular write-code and review references.","blocking":true,"expected_result":"The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.","id":"AC-005","requirement_refs":["R-002","R-006"],"statement":"The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.","blocking":true,"expected_result":"The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.","id":"AC-006","requirement_refs":["R-002","R-006"],"statement":"The shared reference stays tool- and project-neutral.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the Angular executor and review guidance for static-analysis handling.","blocking":true,"expected_result":"Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.","id":"AC-007","requirement_refs":["R-003","R-004","R-006"],"statement":"Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.","task_refs":["TASK-001","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.","blocking":true,"expected_result":"Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.","id":"AC-008","requirement_refs":["R-005","R-006"],"statement":"Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.","blocking":true,"expected_result":"All commands exit 0 and generated mirrors match canonical sources.","id":"AC-009","requirement_refs":["R-006"],"statement":"Mirrors and repository checks pass after the change.","task_refs":["TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Generated navigation code adds maintainability findings and the example needs a follow-up revision.","evidence_refs":["sonar-uat-2026-11-12-S3735-count-12"],"id":"A-001","impacted_refs":["R-001"],"owner":"sdcorejs-plan","rationale":"Changing the example without evidence would add churn against a common floating-promise convention.","source":"inferred","statement":"Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.","status":"validated","type":"assumption","validation_method":"Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code."},{"blocking":false,"confidence":"high","consequence_if_wrong":"Proposing analyzer-configuration handling could hide a real keyboard-access defect.","evidence_refs":["sdcorejs-angular-v19.2.15-button-component-native-button"],"id":"A-002","impacted_refs":["R-005","AC-008"],"owner":"sdcorejs-plan","rationale":"The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.","source":"inferred","statement":"Core UI button hosts render a native button, so keyboard activation already produces a click on the host.","status":"validated","type":"assumption","validation_method":"Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."},{"blocking":false,"confidence":"high","consequence_if_wrong":"The generated spec fails to compile or run.","evidence_refs":["generate-golden-project-jasmine-core-5.9.0"],"id":"A-003","impacted_refs":["AC-004"],"owner":"sdcorejs-plan","rationale":"Size-specific matcher is the analyzer-recommended form for Jasmine.","source":"inferred","statement":"The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.","status":"validated","type":"assumption","validation_method":"The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-005","AC-008","INV-002"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should generated code handle keyboard-equivalent findings on Core UI button hosts?","rationale":"The user chose analyzer configuration and rejected unnecessary API changes.","revisit_condition":null,"scope":"repository","selected_value":"Keep the click binding; propose analyzer configuration in the target project.","source":"explicit-user","statement":"Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","AC-006","AC-007"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Should the skill pack enforce one organisation's analyzer configuration?","rationale":"The user requires general guidance not biased by one project or company configuration.","revisit_condition":null,"scope":"repository","selected_value":"No; neutral guidance with advisory proposals gated by project evidence.","source":"explicit-user","statement":"The skill pack stays tool- and project-neutral and gives advisory proposals.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-008","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","AC-005","INV-001"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where should static-analysis guidance live?","rationale":"Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.","revisit_condition":null,"scope":"repository","selected_value":"New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.","source":"explicit-user","statement":"Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.","status":"approved","supersedes":null,"task_refs":["TASK-003"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","INV-001","INV-002"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"What coverage approach applies?","rationale":"Confirmed in the requirement contract and matches repository practice.","revisit_condition":null,"scope":"repository","selected_value":"TDD; write failing contract tests first, then change references.","source":"explicit-user","statement":"Use TDD with test/e2e contract tests.","status":"approved","supersedes":null,"task_refs":["TASK-001"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","INV-001","INV-002"]}},{"evidence_refs":["EVIDENCE-010"],"id":"INV-001","protected_refs":["R-003","R-004","AC-007"],"statement":"No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.","task_refs":["TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-009","EVIDENCE-010"],"id":"INV-002","protected_refs":["R-005","AC-008"],"statement":"Core UI button host click bindings in Angular templates remain unchanged.","task_refs":["TASK-009","TASK-010"],"type":"invariant"}],"revision":3,"schema_version":1}
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
            - TASK-004
            - TASK-005
            - TASK-006
            - TASK-007
        - id: R-002
          type: requirement
          statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-003
        - id: R-003
          type: requirement
          statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-008
        - id: R-004
          type: requirement
          statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
            - TASK-009
        - id: R-005
          type: requirement
          statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
          source: explicit-user
          status: active
          owner_repository_id: github.com/sdcorejs/sdcorejs-agent
          owner_module_id: null
          task_refs:
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
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
            - R-006
          task_refs:
            - TASK-001
            - TASK-003
        - id: AC-007
          type: acceptance-criterion
          statement: Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
          behavior: Read the Angular executor and review guidance for static-analysis handling.
          expected_result: Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-003
            - R-004
            - R-006
          task_refs:
            - TASK-001
            - TASK-008
            - TASK-009
        - id: AC-008
          type: acceptance-criterion
          statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
          behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
          expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
          verification_kind: automated
          blocking: true
          requirement_refs:
            - R-005
            - R-006
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
            - TASK-010
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
            - INV-001
            - INV-002
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
              - INV-001
              - INV-002
        - id: INV-001
          type: invariant
          statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
          protected_refs:
            - R-003
            - R-004
            - AC-007
          task_refs:
            - TASK-010
          evidence_refs:
            - EVIDENCE-010
        - id: INV-002
          type: invariant
          statement: Core UI button host click bindings in Angular templates remain unchanged.
          protected_refs:
            - R-005
            - AC-008
          task_refs:
            - TASK-009
            - TASK-010
          evidence_refs:
            - EVIDENCE-009
            - EVIDENCE-010
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
            - .sdcorejs/docs/workflow/*static-analysis-compatibility*
            - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
            - .sdcorejs/plans/workflow/*static-analysis-compatibility*.md
          approval_source: user-approved-decision-coverage
          approved_at: 2026-11-12T02:54:54.144Z
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
            - other _refs/** files not listed in allowed_paths
          repository_relative_path: .sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md
          requirement_id: decision-coverage
          schema_version: 1
          source_revision: bdc22462070f9e52bb7900619970d8f8f17c5c50
          stack_profile: markdown-skill-pack
          supersedes: decision-coverage-r3
          track: workflow
          approval_hash: sha256:v1:ea8349a64bf5bc0dfd63f4dea1dff4663aa32cd0f144a4a9c88662a4feab286e
        body: |
          {"history":[{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":1,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":2,"tombstones":[]},{"active":[{"id":"R-001","type":"requirement"},{"id":"R-002","type":"requirement"},{"id":"R-003","type":"requirement"},{"id":"R-004","type":"requirement"},{"id":"R-005","type":"requirement"},{"id":"R-006","type":"requirement"},{"id":"AC-001","type":"acceptance-criterion"},{"id":"AC-002","type":"acceptance-criterion"},{"id":"AC-003","type":"acceptance-criterion"},{"id":"AC-004","type":"acceptance-criterion"},{"id":"AC-005","type":"acceptance-criterion"},{"id":"AC-006","type":"acceptance-criterion"},{"id":"AC-007","type":"acceptance-criterion"},{"id":"AC-008","type":"acceptance-criterion"},{"id":"AC-009","type":"acceptance-criterion"},{"id":"A-001","type":"assumption"},{"id":"A-002","type":"assumption"},{"id":"A-003","type":"assumption"},{"id":"D-001","type":"decision"},{"id":"D-002","type":"decision"},{"id":"D-003","type":"decision"},{"id":"D-004","type":"decision"},{"id":"INV-001","type":"invariant"},{"id":"INV-002","type":"invariant"}],"revision":3,"tombstones":[]}],"records":[{"id":"R-001","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.","status":"active","task_refs":["TASK-004","TASK-005","TASK-006","TASK-007"],"type":"requirement"},{"id":"R-002","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.","status":"active","task_refs":["TASK-003"],"type":"requirement"},{"id":"R-003","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.","status":"active","task_refs":["TASK-008"],"type":"requirement"},{"id":"R-004","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.","status":"active","task_refs":["TASK-009"],"type":"requirement"},{"id":"R-005","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.","status":"active","task_refs":["TASK-003","TASK-009"],"type":"requirement"},{"id":"R-006","owner_module_id":null,"owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","source":"explicit-user","statement":"Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.","status":"active","task_refs":["TASK-001","TASK-002","TASK-010"],"type":"requirement"},{"behavior":"Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.","blocking":true,"expected_result":"Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.","id":"AC-001","requirement_refs":["R-001","R-006"],"statement":"No Angular reference or template example declares an async Angular lifecycle hook.","task_refs":["TASK-001","TASK-004"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular templates and write-code references for class fields initialised with inject().","blocking":true,"expected_result":"Every such field is declared readonly; zero non-readonly matches.","id":"AC-002","requirement_refs":["R-001","R-006"],"statement":"Every inject() field declaration in Angular templates is readonly.","task_refs":["TASK-001","TASK-005"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.","blocking":true,"expected_result":"Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.","id":"AC-003","requirement_refs":["R-001","R-006"],"statement":"The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.","task_refs":["TASK-001","TASK-004","TASK-006","TASK-008"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Generate the golden Angular project and inspect its spec text.","blocking":true,"expected_result":"The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.","id":"AC-004","requirement_refs":["R-001","R-006"],"statement":"The generated golden Angular test asserts collection size with a size-specific matcher.","task_refs":["TASK-001","TASK-007"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the new _refs/shared reference and the Angular write-code and review references.","blocking":true,"expected_result":"The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.","id":"AC-005","requirement_refs":["R-002","R-006"],"statement":"The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.","task_refs":["TASK-001","TASK-003","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.","blocking":true,"expected_result":"The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.","id":"AC-006","requirement_refs":["R-002","R-006"],"statement":"The shared reference stays tool- and project-neutral.","task_refs":["TASK-001","TASK-003"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Read the Angular executor and review guidance for static-analysis handling.","blocking":true,"expected_result":"Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.","id":"AC-007","requirement_refs":["R-003","R-004","R-006"],"statement":"Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.","task_refs":["TASK-001","TASK-008","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.","blocking":true,"expected_result":"Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.","id":"AC-008","requirement_refs":["R-005","R-006"],"statement":"Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.","task_refs":["TASK-001","TASK-003","TASK-009"],"type":"acceptance-criterion","verification_kind":"automated"},{"behavior":"Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.","blocking":true,"expected_result":"All commands exit 0 and generated mirrors match canonical sources.","id":"AC-009","requirement_refs":["R-006"],"statement":"Mirrors and repository checks pass after the change.","task_refs":["TASK-010"],"type":"acceptance-criterion","verification_kind":"automated"},{"blocking":false,"confidence":"medium","consequence_if_wrong":"Generated navigation code adds maintainability findings and the example needs a follow-up revision.","evidence_refs":["sonar-uat-2026-11-12-S3735-count-12"],"id":"A-001","impacted_refs":["R-001"],"owner":"sdcorejs-plan","rationale":"Changing the example without evidence would add churn against a common floating-promise convention.","source":"inferred","statement":"Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.","status":"validated","type":"assumption","validation_method":"Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code."},{"blocking":false,"confidence":"high","consequence_if_wrong":"Proposing analyzer-configuration handling could hide a real keyboard-access defect.","evidence_refs":["sdcorejs-angular-v19.2.15-button-component-native-button"],"id":"A-002","impacted_refs":["R-005","AC-008"],"owner":"sdcorejs-plan","rationale":"The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.","source":"inferred","statement":"Core UI button hosts render a native button, so keyboard activation already produces a click on the host.","status":"validated","type":"assumption","validation_method":"Inspected Core UI @sdcorejs/angular 19.2.15 button.component.html/ts: the host renders a native mat button with keyboard handling and re-emits a click output; adding host keydown.enter would double-fire."},{"blocking":false,"confidence":"high","consequence_if_wrong":"The generated spec fails to compile or run.","evidence_refs":["generate-golden-project-jasmine-core-5.9.0"],"id":"A-003","impacted_refs":["AC-004"],"owner":"sdcorejs-plan","rationale":"Size-specific matcher is the analyzer-recommended form for Jasmine.","source":"inferred","statement":"The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.","status":"validated","type":"assumption","validation_method":"The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9."},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-005","AC-008","INV-002"],"id":"D-001","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"How should generated code handle keyboard-equivalent findings on Core UI button hosts?","rationale":"The user chose analyzer configuration and rejected unnecessary API changes.","revisit_condition":null,"scope":"repository","selected_value":"Keep the click binding; propose analyzer configuration in the target project.","source":"explicit-user","statement":"Handle custom-element click-host analyzer findings through analyzer configuration proposals, not template or API changes.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","R-003","R-004","AC-006","AC-007"],"id":"D-002","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Should the skill pack enforce one organisation's analyzer configuration?","rationale":"The user requires general guidance not biased by one project or company configuration.","revisit_condition":null,"scope":"repository","selected_value":"No; neutral guidance with advisory proposals gated by project evidence.","source":"explicit-user","statement":"The skill pack stays tool- and project-neutral and gives advisory proposals.","status":"approved","supersedes":null,"task_refs":["TASK-003","TASK-008","TASK-009"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-002","AC-005","INV-001"],"id":"D-003","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"Where should static-analysis guidance live?","rationale":"Confirmed in the requirement contract; keeps the change small and reusable by other tracks later.","revisit_condition":null,"scope":"repository","selected_value":"New shared reference under _refs/shared with an Angular section, linked from Angular executor and review references.","source":"explicit-user","statement":"Place the guidance in one shared reference and reuse existing review dimensions without new dimension, skill, registry enum or dependency.","status":"approved","supersedes":null,"task_refs":["TASK-003"],"type":"decision"},{"blocking":true,"convention_impact":{"candidate":false,"category":null},"downstream_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","INV-001","INV-002"],"id":"D-004","owner_repository_id":"github.com/sdcorejs/sdcorejs-agent","question":"What coverage approach applies?","rationale":"Confirmed in the requirement contract and matches repository practice.","revisit_condition":null,"scope":"repository","selected_value":"TDD; write failing contract tests first, then change references.","source":"explicit-user","statement":"Use TDD with test/e2e contract tests.","status":"approved","supersedes":null,"task_refs":["TASK-001"],"type":"decision","validation_boundary":{"kind":"none","source_refs":["R-001","R-002","R-003","R-004","R-005","R-006","AC-001","AC-002","AC-003","AC-004","AC-005","AC-006","AC-007","AC-008","AC-009","INV-001","INV-002"]}},{"evidence_refs":["EVIDENCE-010"],"id":"INV-001","protected_refs":["R-003","R-004","AC-007"],"statement":"No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.","task_refs":["TASK-010"],"type":"invariant"},{"evidence_refs":["EVIDENCE-009","EVIDENCE-010"],"id":"INV-002","protected_refs":["R-005","AC-008"],"statement":"Core UI button host click bindings in Angular templates remain unchanged.","task_refs":["TASK-009","TASK-010"],"type":"invariant"}],"revision":3,"schema_version":1}
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
              - R-006
              - D-004
        justification_refs:
          - R-006
          - D-004
        enforces_invariant_refs: []
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
        justification_refs:
          - R-006
        enforces_invariant_refs: []
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
              - D-001
              - D-002
              - D-003
        justification_refs:
          - R-002
          - R-005
          - D-001
          - D-002
          - D-003
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
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
        justification_refs:
          - R-001
        enforces_invariant_refs: []
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/angular/orchestrator-generation.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-003
              - AC-003
              - AC-005
              - AC-007
              - D-002
        justification_refs:
          - R-003
          - D-002
        enforces_invariant_refs: []
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
              - R-004
              - R-005
              - AC-005
              - AC-007
              - AC-008
              - D-001
              - D-002
              - INV-002
        justification_refs:
          - R-004
          - R-005
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-002
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
            - _refs/angular/write-code/admin-screens.md
            - _refs/angular/templates/init-module-templates.md
            - _refs/angular/architecture-principles.md
            - _refs/angular/write-code/init-entity.md
            - _refs/angular/generator/generate-golden-project.mjs
            - _refs/angular/orchestrator-generation.md
            - _refs/angular/review-code.md
            - _refs/angular/review-accessibility.md
            - _refs/angular/review-security.md
            - package.json
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
          intended_new_paths:
            - path: test/e2e/static-analysis-compatibility-contract.test.mjs
              owner_task_id: TASK-001
            - path: _refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-003
            - path: .claude/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
            - path: plugin/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
            - path: codex/skills/_refs/shared/static-analysis-compatibility.md
              owner_task_id: TASK-010
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs: []
      risk: generated lifecycle examples teach a self-reported analyzer pattern
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-002
      invariant_refs: []
      risk: templates teach mutable injected fields
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-003
      invariant_refs: []
      risk: placeholder guidance generates TODO tags and alert calls
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-004
      invariant_refs: []
      risk: golden generator emits a generic length assertion
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-005
      invariant_refs: []
      risk: guidance is missing or unreachable from Angular executor and review
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
          - INV-001
          - INV-002
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
      evidence_refs: []
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-006
      invariant_refs: []
      risk: guidance drifts into one organisation or project configuration
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
          - INV-001
          - INV-002
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
      evidence_refs: []
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
      risk: advisory guidance becomes a blocking or mutating gate
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
          - INV-001
          - INV-002
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-sac-advisory-evidence-gated
      planned_command: npm run test:e2e:static-analysis
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Executor and review guidance state the evidence trigger, Low/RECOMMENDED advisory severity, no analyzer-only blocking, and no analyzer-config or dependency edits without approval.
      status: covered
      evidence_refs:
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
      risk: click-host guidance causes double-fire or hides real defects
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
          - INV-001
          - INV-002
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
      risk: mirrors drift from canonical sources
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
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
      risk: text hygiene regresses
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
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
      risk: repository contract suite regresses
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
          - INV-001
          - INV-002
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
        - EVIDENCE-010
        - EVIDENCE-009
      rationale: null
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  contract_id: static-analysis-compatibility-20261112
  requirement_id: R-001
  approved_spec_path: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
  approved_spec_hash: sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
      artifact_id: spec-static-analysis-compatibility-20261112-r2
      revision: bdc22462070f9e52bb7900619970d8f8f17c5c50
      approval_hash: sha256:v1:4687dbdac47cbba1e52b58f7c4319fc1f0fe2e3171531bb9a09016f9f93f8ff9
  approved_plan_path: .sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md
  approved_plan_hash: null
  supersedes: plan-static-analysis-compatibility-20261112-r2
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
    - .sdcorejs/docs/workflow/*static-analysis-compatibility*
    - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
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
    - other _refs/** files not listed in allowed_paths
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
    - .sdcorejs/docs/workflow/2026-11-12-09-49-static-analysis-compatibility-spec-r2.md
    - .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
    - .sdcorejs/docs/workflow/2026-11-12-09-53-static-analysis-compatibility-plan-r3.md
    - .sdcorejs/plans/workflow/<approval-stamp>-static-analysis-compatibility-r3.md
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
    required: true
    files:
      - package.json
    scope: "scripts only: add test:e2e:static-analysis and append the new test file to test:e2e:repository; no dependency, devDependency, engines or lockfile change"
    approval_required: true
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
      - package.json scripts inspected
    environment_prerequisites:
      - "node_modules is absent in the working tree: run npm ci (lockfile-pinned devDependencies; no manifest or lockfile write) before any node --test run that imports yaml or typescript"
    commands_planned:
      - npm run test:e2e:static-analysis - RED after TASK-002, GREEN after TASK-009 (AC-001..AC-008, INV-002)
      - npm run sync:skills - regenerate mirrors (TASK-010)
      - npm run check:skills - mirrors match canonical sources (AC-009)
      - npm run check:text-hygiene - text hygiene (AC-009)
      - npm run test:e2e:angular - existing Angular contract reading admin-screens.md
      - npm run test:e2e:phase1 - existing skill-pack runner reading Angular review/template refs
      - npm run test:e2e:skill-audit - existing template-producer audit reading the golden generator
      - npm run test:e2e:repository - broad repository suite (AC-009)
      - git diff --stat -- skills _refs/shared/system-registry.json _refs/harness package-lock.json - must be empty (INV-001)
      - git diff -- package.json - only the two scripts lines change (INV-001)
    commands_skipped:
      - npm run test:e2e:angular:golden - installs and builds a generated Angular project (network and long runtime); CI npm run test:e2e covers it on Linux; run locally only on explicit request
    checks: "Focused: new contract test plus existing tests that read changed files. Broad: test:e2e:repository. Windows note: cleanup tests in the repository suite previously hung for hours on this host in an unrelated clone; run with a bounded timeout and report a hang as an environment limitation instead of a pass, deferring that file to CI."
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: package.json
        single_owner: TASK-002
        coordination: sequential
      - path: generated mirrors
        single_owner: TASK-010
        coordination: regenerate once after all canonical edits
    reason: Small sequential change; TDD order and a single mirror regeneration make parallel waves unnecessary.
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
  baselines:
    core_ui_button_host_click_elements:
      total: 40
      per_file:
        _refs/angular/templates/entity-skeleton.md: 11
        _refs/angular/templates/example-product.md: 4
        _refs/angular/templates/reactive-form-templates.md: 9
        _refs/angular/templates/screen-detail-component.md: 9
        _refs/angular/templates/screen-list-component.md: 1
        _refs/angular/write-code/actions.md: 6
      method: count <sd-button ...>...</sd-button> elements containing (click)= across _refs/angular/**/*.md at bdc22462
  approval:
    approved: true
    approved_at: 2026-11-12T02:54:54.144Z
    approval_source: explicit-user-choice
    instruction_reference: conversation/2026-11-12/plan-r3-approval-gate/user-reply-1
    document_review_performed: false
  change_control:
    revision: 3
    supersedes: plan-static-analysis-compatibility-20261112-r2
    change_reason: Re-parent onto approved spec r2 (wording-only spec revision); tasks, paths, evidence and validation map are unchanged and were executed under r2.
  execution_progress_at_revision:
    completed_under_r2:
      - TASK-001..TASK-010 completed and verified under r2
      - .sdcorejs/summary.md refreshed with explicit user approval
    note: Completed work stays valid under r3 because no task, path, evidence or validation row changed.
  artifact_context:
    schema_version: 1
    change_ref: static-analysis-compatibility-20261112
    source_spec: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
    source_plan: .sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md
    required_with_change:
      - path: .sdcorejs/docs/workflow/2026-11-12-09-49-static-analysis-compatibility-spec-r2.md
        kind: execution-doc
        reason: spec r2 draft
      - path: .sdcorejs/specs/workflow/2026-11-12-09-52-static-analysis-compatibility-r2.md
        kind: spec
        reason: approved scope r2
      - path: .sdcorejs/docs/workflow/2026-11-12-09-53-static-analysis-compatibility-plan-r3.md
        kind: execution-doc
        reason: plan r3 draft for the approved plan
      - path: .sdcorejs/plans/workflow/2026-11-12-09-54-static-analysis-compatibility-r3.md
        kind: plan
        reason: approved execution contract r3
    shared_owned:
      - path: .sdcorejs/summary.md
        kind: summary
        reason: summary fingerprint and Commands/Invariants refreshed with explicit user approval
    conditional:
      - path: .sdcorejs/docs/workflow/2026-11-12-01-10-static-analysis-compatibility-spec.md
        kind: execution-doc
        reason: superseded spec r1 draft; contains an internal project name; publication needs a user decision
      - path: .sdcorejs/specs/workflow/2026-11-12-01-15-static-analysis-compatibility.md
        kind: spec
        reason: superseded spec r1; contains an internal project name; publication needs a user decision
      - path: .sdcorejs/docs/workflow/2026-11-12-01-23-static-analysis-compatibility-plan.md
        kind: execution-doc
        reason: superseded plan r1 draft (parent spec r1)
      - path: .sdcorejs/plans/workflow/2026-11-12-01-28-static-analysis-compatibility.md
        kind: plan
        reason: superseded plan r1 (parent spec r1)
      - path: .sdcorejs/docs/workflow/2026-11-12-01-35-static-analysis-compatibility-plan-r2.md
        kind: execution-doc
        reason: superseded plan r2 draft (parent spec r1)
      - path: .sdcorejs/plans/workflow/2026-11-12-01-38-static-analysis-compatibility-r2.md
        kind: plan
        reason: superseded plan r2 (parent spec r1)
    local_only: []
    unrelated_observed: []
```

## Authority and review provenance

- Phê duyệt: lựa chọn tường minh của người dùng "Duyệt r3" (2026-11-12) cho approval gate r3 có tóm tắt thay đổi so với r2 (chỉ đổi parent sang spec r2), kết quả self-review và ba lựa chọn 1/2/3.
- Phạm vi: duyệt plan thực thi r3, đồng nhất với r2 về task, path và evidence; công việc đã thực thi theo r2 vẫn áp dụng; không gồm commit, push hay release.
- Review tài liệu: người dùng duyệt dựa trên tóm tắt đã trình; không quan sát được việc đọc toàn văn (`document_review_performed: false`).
- Tự review: decision coverage stage plan sạch (revision 3); goal-backward 1 vòng sạch; validation map 11 dòng approval-ready với ràng buộc phê duyệt thật; architecture handoff hợp lệ.

## Skill provenance

sdcorejs-plan (revision 3; self-review attempt 1 / 3; authority: explicit-user-choice)
