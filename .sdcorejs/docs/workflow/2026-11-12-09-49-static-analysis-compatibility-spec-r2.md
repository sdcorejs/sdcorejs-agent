---
artifact_id: static-analysis-compatibility-spec-draft-r2
artifact_kind: execution-doc
document_type: spec-draft
change_ref: static-analysis-compatibility-20261112
contract_id: static-analysis-compatibility-20261112
requirement_id: R-001
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
stack_profile: markdown-skill-pack
source_revision: bdc22462070f9e52bb7900619970d8f8f17c5c50
status: draft
approval: { approved: false, approved_at: null }
acceptance_criteria_count: 9
manual_criteria_count: 0
redaction_applied: true
change_control: { revision: 2, supersedes: spec-static-analysis-compatibility-20261112-r1, change_reason: neutral-wording-before-publish }
---

# Spec r2 - Tương thích phân tích tĩnh cho code Angular do skill sinh - 2026-11-12 09:49

Ngày soạn: 12/11/2026, múi giờ Asia/Bangkok. Revision 2 của spec `.sdcorejs/specs/workflow/2026-11-12-01-15-static-analysis-compatibility.md` (`spec-static-analysis-compatibility-20261112-r1`): chỉ đổi cách gọi tên dự án nội bộ thành trung lập trước khi công bố; yêu cầu, quyết định, giả định, tiêu chí chấp nhận và architecture gate giữ nguyên. Chưa có phê duyệt cho revision này.

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: static-analysis-compatibility-20261112
  requirement_id: R-001
  approved_spec_path: ""
  approved_spec_hash: ""
  supersedes: .sdcorejs/specs/workflow/2026-11-12-01-15-static-analysis-compatibility.md
  target_root: sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  track: workflow
  stack_profile: markdown-skill-pack
  profile_confidence: high
  source_requirement_context: User confirmed the brainstorming requirement contract on 2026-11-12 (direction 3, sdcorejs-agent first, reply "Xác nhận").
  acceptance_criteria_count: 9
  manual_criteria_count: 0
  non_goals:
    - Do not change the Core UI button host template pattern or any Core UI API.
    - Do not change the consuming project or its library repositories.
    - Do not add a hard analyzer gate, review dimension, skill, registry enum or dependency.
    - Do not refactor sdcorejs-agent internal scripts for analyzer findings.
  risks:
    - Advisory guidance grows into project-specific rules.
    - Contract tests only prove text, not that generated code avoids findings.
    - Custom-element false-positive guidance hides a real accessibility defect.
  assumptions:
    - A-001 void before a Promise is not reported by type-aware analysis.
    - A-002 Core UI button hosts render a native button.
    - A-003 Generated golden Angular tests use Jasmine with toHaveSize.
  redaction_applied: true
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice
    instruction_reference: null
    document_review_performed: false
  change_control:
    revision: 2
    supersedes: spec-static-analysis-compatibility-20261112-r1
    change_reason: "Wording-only revision - replace an internal project name with neutral wording before publishing; requirements, decisions and acceptance criteria are unchanged."
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: docs-only
      rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
    rationale: Change is limited to skill instruction/reference Markdown, template example literals inside an existing generator, and contract tests; no registry enum, schema, public API, persisted data, trust boundary, state owner, dependency or review severity contract changes.
  goal_backward_review:
    schema_version: 1
    mode: "sdcorejs-plan:goal-backward"
    stage: spec
    future_gaps:
      - AC_PLAN_COVERAGE_MISSING AC-001..AC-009 task_refs (owned by sdcorejs-plan)
      - REQUIREMENT_PLAN_COVERAGE_MISSING R-001..R-006 task_refs (owned by sdcorejs-plan)
      - INVARIANT_TASK_TRACE_MISSING INV-001, INV-002 task_refs (owned by sdcorejs-plan)
      - INVARIANT_EVIDENCE_TRACE_MISSING INV-001, INV-002 evidence_refs (owned by sdcorejs-plan)
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Angular references, templates and the golden generator stop teaching four patterns that static analyzers report on their own (async lifecycle hook, injected field without readonly, alert TODO placeholder, generic length assertion) while keeping each example's intent.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: A tool- and project-neutral, English-only shared reference describes static-analysis compatibility pattern families, why they are reported, neutral remediation, evidence detection and proposal format, with analyzer rule keys only as labelled examples and Angular examples in an Angular section.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: The Angular executor applies the general good-practice families by default and, only when the target project shows static-analysis evidence, reports advisory proposals without editing analyzer configuration or adding dependencies unless the user approves.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: Angular review guidance adds advisory checks inside the existing code, security and accessibility dimensions at Low/RECOMMENDED unless an existing rule already defines a stronger severity, and never blocks solely because an analyzer rule would fire.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Guidance for custom elements that wrap a native interactive control keeps the click binding, explains the possible analyzer false positive, proposes analyzer-configuration handling, forbids keyboard handlers that double-fire, and still requires real fixes for click handlers on non-interactive native elements.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: Contract tests prevent the four patterns from returning, verify the shared reference contents, links and neutrality, and the generated mirrors stay in sync.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: No Angular reference or template example declares an async Angular lifecycle hook.
        behavior: Scan _refs/angular and skills for lifecycle hooks declared async or typed to return a Promise.
        expected_result: Zero matches; the admin-screens examples load data from a synchronous ngOnInit that calls a method handling its own promise rejection.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-001, R-006]
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Every inject() field declaration in Angular templates is readonly.
        behavior: Scan _refs/angular templates and write-code references for class fields initialised with inject().
        expected_result: Every such field is declared readonly; zero non-readonly matches.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-001, R-006]
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: The custom-UI placeholder guidance no longer wires actions to alert with a TODO tag.
        behavior: Scan _refs/angular and skills for alert('TODO and TODO-tag placeholders in generated-code instructions.
        expected_result: Zero matches; the placeholder is a visibly disabled action plus an entry in the generation summary.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-001, R-006]
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: The generated golden Angular test asserts collection size with a size-specific matcher.
        behavior: Generate the golden Angular project and inspect its spec text.
        expected_result: The spec uses toHaveSize(2) instead of comparing .length with toBe, and the golden-project test still passes where it runs.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-001, R-006]
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: The shared static-analysis compatibility reference exists with the required sections and is linked from the Angular executor and review references.
        behavior: Read the new _refs/shared reference and the Angular write-code and review references.
        expected_result: The reference has sections for principles, pattern families (family, reason, neutral remediation, example analyzer keys), evidence detection, proposal format and non-goals; Angular write-code and review references link to it.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-002, R-006]
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: The shared reference stays tool- and project-neutral.
        behavior: Scan the shared reference for organisation, host, project or repository names and for analyzer rule keys outside the examples column.
        expected_result: The reference is English-only and locale-neutral; no organisation, host, project or repository name appears; analyzer keys appear only in cells explicitly labelled as examples, covering at least two analyzers.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-002, R-006]
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Executor and review guidance is advisory, evidence-gated and non-mutating for analyzer configuration.
        behavior: Read the Angular executor and review guidance for static-analysis handling.
        expected_result: Guidance states the trigger evidence (analyzer project file, analyzer lint plugin or CI analyzer step), Low/RECOMMENDED advisory severity, no blocking on analyzer rules alone, and no analyzer-config edits or dependency additions without explicit user approval; existing stronger rules such as sanitization-bypass justification keep their severity.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-003, R-004, R-006]
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Custom-element click-host guidance preserves the template pattern and blocks double-fire fixes.
        behavior: Compare Core UI button host occurrences in Angular templates before and after, and read the click-host guidance.
        expected_result: Button host click bindings are unchanged; guidance forbids adding keydown.enter or similar to hosts that wrap a native control, gives a neutral analyzer-configuration proposal, and requires a native button or role, tabindex and key handling for click on non-interactive native elements.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-005, R-006]
        task_refs: []
      - id: AC-009
        type: acceptance-criterion
        statement: Mirrors and repository checks pass after the change.
        behavior: Run npm run check:skills, npm run check:text-hygiene, the affected node --test files and npm run test:e2e:repository.
        expected_result: All commands exit 0 and generated mirrors match canonical sources.
        verification_kind: automated
        blocking: true
        requirement_refs: [R-006]
        task_refs: []
      - id: A-001
        type: assumption
        statement: Type-aware analysis does not report void placed before a Promise, so the router navigation example with void stays unchanged.
        source: inferred
        confidence: medium
        status: validated
        blocking: false
        evidence_refs: [sonar-uat-2026-11-12-S3735-count-12]
        consequence_if_wrong: Generated navigation code adds maintainability findings and the example needs a follow-up revision.
        validation_method: Server-side analysis reported 12 S3735 issues versus 270 from a type-less local lint over the same code.
        owner: sdcorejs-plan
        rationale: Changing the example without evidence would add churn against a common floating-promise convention.
        impacted_refs: [R-001]
      - id: A-002
        type: assumption
        statement: Core UI button hosts render a native button, so keyboard activation already produces a click on the host.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs: [sonar-uat-2026-11-12-native-button-not-reported]
        consequence_if_wrong: Proposing analyzer-configuration handling could hide a real keyboard-access defect.
        validation_method: Verify the installed Core UI button template or documentation during planning; guidance is phrased conditionally on wrapping a native control.
        owner: sdcorejs-plan
        rationale: The analyzer reports host elements but not native buttons, which matches a wrapper rendering a native control.
        impacted_refs: [R-005, AC-008]
      - id: A-003
        type: assumption
        statement: The generated golden Angular project tests run on Jasmine 5.x, where toHaveSize is available.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs: [generate-golden-project-jasmine-core-5.9.0]
        consequence_if_wrong: The generated spec fails to compile or run.
        validation_method: The generator pins jasmine-core 5.9.0 and @types/jasmine 5.1.9.
        owner: sdcorejs-plan
        rationale: Size-specific matcher is the analyzer-recommended form for Jasmine.
        impacted_refs: [AC-004]
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
        downstream_refs: [R-005, AC-008, INV-002]
        task_refs: []
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
        downstream_refs: [R-002, R-003, R-004, AC-006, AC-007]
        task_refs: []
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
        downstream_refs: [R-002, AC-005, INV-001]
        task_refs: []
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
        downstream_refs: [R-006, AC-009]
        task_refs: []
      - id: INV-001
        type: invariant
        statement: No new review dimension, skill, registry enum, schema field or dependency is introduced, and the existing severity scale is unchanged.
        protected_refs: [R-003, R-004, AC-007]
        task_refs: []
        evidence_refs: []
      - id: INV-002
        type: invariant
        statement: Core UI button host click bindings in Angular templates remain unchanged.
        protected_refs: [R-005, AC-008]
        task_refs: []
        evidence_refs: []
    history:
      - revision: 1
        active:
          - { id: R-001, type: requirement }
          - { id: R-002, type: requirement }
          - { id: R-003, type: requirement }
          - { id: R-004, type: requirement }
          - { id: R-005, type: requirement }
          - { id: R-006, type: requirement }
          - { id: AC-001, type: acceptance-criterion }
          - { id: AC-002, type: acceptance-criterion }
          - { id: AC-003, type: acceptance-criterion }
          - { id: AC-004, type: acceptance-criterion }
          - { id: AC-005, type: acceptance-criterion }
          - { id: AC-006, type: acceptance-criterion }
          - { id: AC-007, type: acceptance-criterion }
          - { id: AC-008, type: acceptance-criterion }
          - { id: AC-009, type: acceptance-criterion }
          - { id: A-001, type: assumption }
          - { id: A-002, type: assumption }
          - { id: A-003, type: assumption }
          - { id: D-001, type: decision }
          - { id: D-002, type: decision }
          - { id: D-003, type: decision }
          - { id: D-004, type: decision }
          - { id: INV-001, type: invariant }
          - { id: INV-002, type: invariant }
        tombstones: []
```

## Problem & Goals

Một dự án Angular dùng Core UI, có code do skill sinh ra, đang trượt quality gate của analyzer. Lần quét nhánh `uat` ngày 12/11/2026 cho thấy reliability rating E (743 issue) và security rating E (19 issue). Truy ngược cho thấy một phần đến từ chính pattern mà sdcorejs-agent dạy cho agent:

- 565 issue bàn phím trên host nút Core UI có `(click)`.
- 51 issue `async ngOnInit`.
- 135 issue TODO; placeholder `alert('TODO: ...')` được dạy tại `_refs/angular/architecture-principles.md`.
- Assert kiểu `.length).toBe(...)` trong golden generator.

Mục tiêu: code Angular do skill sinh không tự gây finding cho analyzer, và review chỉ ra được các finding đó dưới dạng **đề xuất**. Skill pack phải trung lập về công cụ và dự án; nó không áp cấu hình của một tổ chức cụ thể và không đổi API Core UI khi không cần.

Người dùng: developer và reviewer dùng sdcorejs-agent cho dự án Angular. Dự án có analyzer thì nhận đề xuất kèm snippet cấu hình; dự án không có analyzer vẫn nhận code theo good practice, không bị thêm yêu cầu.

## Requirements

- R-001 - Bỏ 4 pattern tự gây finding khỏi ref/template Angular và golden generator, giữ nguyên ý nghĩa ví dụ. Nguồn: người dùng xác nhận; trạng thái active; owner `github.com/sdcorejs/sdcorejs-agent`.
- R-002 - Có ref dùng chung, trung lập, viết bằng tiếng Anh theo quy tắc nguồn của repo: nhóm pattern, lý do, cách xử lý trung lập, cách nhận biết dự án có analyzer, định dạng đề xuất; rule key của analyzer chỉ là ví dụ; ví dụ Angular nằm ở mục Angular.
- R-003 - Executor Angular áp dụng các nhóm good practice mặc định. Khi dự án có bằng chứng analyzer, executor đưa đề xuất advisory; không sửa cấu hình analyzer hay thêm dependency nếu người dùng chưa duyệt.
- R-004 - Review Angular thêm kiểm tra advisory trong dimension `code`, `security`, `accessibility` hiện có, mức Low/RECOMMENDED (trừ khi đã có rule mạnh hơn), không chặn chỉ vì analyzer sẽ báo.
- R-005 - Hướng dẫn cho custom element bọc control gốc: giữ `(click)`, giải thích false positive có thể có, đề xuất xử lý bằng cấu hình analyzer, cấm thêm handler bàn phím gây gọi 2 lần; `(click)` trên phần tử gốc không tương tác vẫn phải sửa thật.
- R-006 - Contract test chặn 4 pattern quay lại, kiểm nội dung, link, tính trung lập của ref; mirror được đồng bộ.

## Decisions

- D-001 - Host nút Core UI: giữ `(click)`, xử lý finding bàn phím bằng đề xuất cấu hình analyzer ở dự án. Nguồn: người dùng; approved; phạm vi repository; owner sdcorejs-agent; không supersede.
- D-002 - Skill pack trung lập, chỉ đề xuất, kích hoạt theo bằng chứng dự án. Nguồn: người dùng; approved.
- D-003 - Một ref dùng chung dưới `_refs/shared`, có mục Angular; dùng lại dimension review hiện có; không thêm dimension, skill, enum registry, dependency. Nguồn: requirement contract đã xác nhận; approved.
- D-004 - Coverage TDD bằng contract test trong `test/e2e`. Nguồn: requirement contract; approved.

## Assumptions

- A-001 - Analyzer có type info không báo `void` đặt trước Promise; ví dụ `void this.#router.navigate(...)` giữ nguyên. Nguồn inferred, confidence medium, validated (server báo 12 issue S3735, lint local không type info báo 270), không chặn. Nếu sai: thêm finding maintainability, cần revision sau. Owner: sdcorejs-plan.
- A-002 - Host nút Core UI render `<button>` gốc nên bàn phím đã kích hoạt click. Nguồn inferred, confidence medium, proposed, không chặn. Bằng chứng: analyzer báo host nhưng không báo `<button>` gốc. Nếu sai: đề xuất cấu hình có thể che lỗi a11y thật. Cách kiểm: xác minh template/tài liệu Core UI khi lập plan; hướng dẫn được viết có điều kiện "khi host bọc control gốc".
- A-003 - Golden Angular project chạy Jasmine 5.x nên có `toHaveSize`. Nguồn inferred, confidence high, validated (generator pin `jasmine-core` 5.9.0), không chặn.

## Architecture gate classification

- Status: not-applicable
- Signals: none
- Rationale/bypass: `docs-only`. Thay đổi chỉ gồm Markdown hướng dẫn/ref của skill, literal ví dụ trong generator có sẵn và contract test; không đổi enum registry, schema, public API, dữ liệu lưu trữ, trust boundary, owner state, dependency hay thang severity của review.

## Non-goals

- Không đổi `<sd-button ... (click)>` trong template hay API Core UI.
- Không sửa dự án dùng skill hoặc các repo lib của nó (spec riêng sau).
- Không thêm gate cứng theo analyzer, review dimension, skill, enum registry hay dependency.
- Không sửa chất lượng script nội bộ của sdcorejs-agent.

## Architecture

Ref mới nằm cạnh các ref dùng chung khác và được tham chiếu từ hai lối vào Angular hiện có: hướng dẫn sinh code (write-code/templates) và hướng dẫn review (code, security, accessibility). Không thêm cơ chế runtime: nhận biết analyzer dựa trên bằng chứng file trong dự án đích (file cấu hình analyzer, plugin lint của analyzer trong cấu hình lint, bước analyzer trong CI).

Nhóm pattern ban đầu (Angular là ví dụ đầu tiên; track khác có thể bổ sung sau):

| Nhóm | Mặc định khi sinh code | Khi dự án có analyzer |
|---|---|---|
| Lifecycle hook async | Không sinh | Đề xuất sửa |
| Field `inject()` thiếu `readonly` | Luôn `readonly` | Đề xuất sửa |
| Placeholder TODO/alert | Không sinh | Đề xuất sửa |
| Assert chung chung trong test | Dùng matcher cụ thể | Đề xuất sửa |
| `(click)` trên phần tử gốc không tương tác | Dùng `<button>` hoặc role + tabindex + phím | Đề xuất sửa |
| Host custom bọc control gốc có `(click)` | Giữ nguyên | Đề xuất snippet cấu hình analyzer; cấm thêm handler phím |
| Bypass sanitization, origin `postMessage`, PRNG trong ngữ cảnh bảo mật, `iframe` thiếu `title` | Theo rule hiện có (vd. AG-3) | Giữ severity của rule hiện có, kèm ánh xạ analyzer làm ví dụ |

## Stack profile and technology assumptions

- Track: `workflow`
- Stack profile: `markdown-skill-pack`
- Profile evidence: repo chứa `skills/**`, `_refs/**`, `scripts/sync-skills.mjs`, mirror sinh ra; package `type: module`, Node `node:test`.
- Technology assumptions: contract test dùng `node:test` như các file `test/e2e/*.test.mjs` hiện có (explicit); golden Angular dùng Jasmine 5.9 (validated, A-003).

## File structure

- `_refs/shared/static-analysis-compatibility.md` - create: ref dùng chung, trung lập.
- `_refs/angular/write-code/admin-screens.md` - edit: bỏ `async ngOnInit` ở 2 ví dụ.
- `_refs/angular/templates/init-module-templates.md` - edit: thêm `readonly` cho field `inject()`.
- `_refs/angular/architecture-principles.md` - edit: thay placeholder `alert('TODO: ...')`.
- `_refs/angular/generator/generate-golden-project.mjs` - edit: assert `toHaveSize(2)`.
- `_refs/angular/review-code.md`, `_refs/angular/review-accessibility.md`, `_refs/angular/review-security.md`, `_refs/angular/orchestrator-generation.md` - edit: link tới ref mới và ghi rõ hành vi advisory.
- `test/e2e/static-analysis-compatibility-contract.test.mjs` - create: contract test cho AC-001..AC-008.
- `package.json` - edit: thêm file test mới vào `test:e2e:repository`.
- Mirror `.claude/`, `plugin/`, `codex/`, `.cursor/` - regenerate bằng `npm run sync:skills`.

## Acceptance criteria

- AC-001 - Không còn ví dụ lifecycle hook async trong ref/template Angular; ví dụ admin-screens dùng `ngOnInit` đồng bộ gọi method tự xử lý promise. (automated)
- AC-002 - Mọi field khởi tạo bằng `inject()` trong template/ref Angular đều `readonly`. (automated)
- AC-003 - Không còn hướng dẫn `alert('TODO...')`; placeholder là action bị disable rõ ràng và ghi trong generation summary. (automated)
- AC-004 - Spec golden Angular dùng `toHaveSize(2)` thay `.length).toBe(2)`; test golden vẫn pass nơi chạy được. (automated)
- AC-005 - Ref dùng chung tồn tại với đủ mục (nguyên tắc, nhóm pattern, nhận biết bằng chứng, định dạng đề xuất, non-goals) và được link từ ref executor và review Angular. (automated)
- AC-006 - Ref chỉ dùng tiếng Anh, trung lập ngôn ngữ; không chứa tên tổ chức, host, dự án hay repo; rule key analyzer chỉ ở cột ví dụ, ví dụ cho ít nhất hai analyzer. (automated)
- AC-007 - Hướng dẫn nêu bằng chứng kích hoạt, mức Low/RECOMMENDED, không chặn chỉ vì analyzer, không sửa cấu hình analyzer/thêm dependency khi chưa được duyệt; rule mạnh hơn hiện có giữ severity. (automated)
- AC-008 - Binding `(click)` trên host nút Core UI trong template không đổi; hướng dẫn cấm thêm `keydown.enter` cho host bọc control gốc, có snippet cấu hình trung lập, và yêu cầu sửa thật với phần tử gốc không tương tác. (automated)
- AC-009 - `npm run check:skills`, `npm run check:text-hygiene`, các file `node --test` liên quan và `npm run test:e2e:repository` đều exit 0; mirror khớp nguồn. (automated)

## Risks & mitigations

- **Risk:** Hướng dẫn advisory dần thành rule riêng của một dự án/tổ chức. -> **Mitigation:** AC-006 kiểm tự động tên tổ chức/host/dự án; rule key chỉ là ví dụ.
- **Risk:** Contract test chỉ chứng minh câu chữ, không chứng minh code sinh ra sạch finding. -> **Mitigation:** AC-004 kiểm nội dung code sinh của golden generator; đánh giá trên dự án thật để ở phần hoãn.
- **Risk:** Đề xuất cấu hình cho host custom che lỗi a11y thật. -> **Mitigation:** hướng dẫn có điều kiện "bọc control gốc", A-002 phải được xác minh khi lập plan, phần tử gốc không tương tác vẫn phải sửa thật (AC-008).

## Out of scope (deferred)

- Spec cho dự án dùng skill và các repo lib của nó (cấu hình analyzer cho host nút, blame submodule/new code, sửa BLOCKER) - defer until spec này được duyệt và người dùng chọn làm tiếp.
- Mở rộng nhóm pattern cho NestJS/Next.js - defer until có bằng chứng analyzer từ dự án dùng các track đó.
- Đo lại finding trên dự án thật sau khi đổi skill - defer until có lần sinh code mới trên dự án có analyzer.
