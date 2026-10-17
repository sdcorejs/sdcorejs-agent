---
artifact_id: draft-plan-task-breakdown-source-guidance-v1-r1
artifact_kind: execution-doc
change_ref: task-breakdown-source-guidance-v1
source_spec: .sdcorejs/specs/workflow/2026-10-16-16-39-task-breakdown-source-guidance.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: fc8543881c9d82428d49f9e11809c81e0b53ed62
status: draft
revision: 1
---

# Plan — Hướng dẫn nguồn chưa đọc được và lệnh help cho check CLI của task-breakdown — 2026-10-17 10:19

## Scope
Theo approved spec (`sha256:v1:6bf9549a…`):
- lệnh chỉ đọc `check sources -` sinh bảng hướng dẫn connector/export/dán cho từng nguồn chưa đọc được, nhóm theo domain;
- `--help`, `-h` và `help`; lỗi `COMMAND_UNKNOWN` nhắc `--help`;
- G1 và G8 của ref in nguyên văn `result.table`;
- có test xác định và một lần chạy thật để kiểm lại AC-002.

Architecture gate: not-applicable (`bounded-bug-fix`). Graph là approved spec → approved plan.

## Execution context
- Track: `workflow`. Target root kind: `sdcorejs-agent-authoring-repo`. Stack profile: `markdown-skill-pack`.
- Coverage approach: TDD.
- Parallel candidates: không. CLI phụ thuộc test RED, mirror phụ thuộc ref, evidence phụ thuộc mọi file nguồn.
- Nhánh: `fix/task-breakdown-source-guidance` từ `fc85438`. Không push.
- Không sửa skill body, `package.json` hay `.sdcorejs/summary.md`:
  - test mới nằm trong file đã có trong `test:e2e:repository`;
  - fingerprint của summary giữ nguyên khi thêm file vào `_refs/product/task-breakdown/` (đã kiểm).
- Decision coverage revision 2 thêm:
  - INV-001..006: CLI chỉ đọc và một verdict JSON; không bịa nội dung, không lộ secret; id loại nguồn và danh sách lệnh khớp giữa CLI và ref; lần chạy thật ghi đúng transcript; evidence gắn với nội dung hiện tại; test RED trước, không làm yếu assertion;
  - D-007: validation boundary kind `none`.

## Tasks

### Phase 1 — RED
1. **TASK-001 EDIT** `test/e2e/product-task-breakdown-cli.test.mjs`. Thêm case:
   - `case-task-breakdown-cli-sources-kinds` (AC-001): một nguồn cho mỗi id trong `SOURCE_KINDS`, ngôn ngữ vi và en; đúng hướng dẫn của từng loại; bảng cột cố định;
   - `case-task-breakdown-cli-sources-grouping` (AC-002): gộp theo (domain, kind), tách khi khác domain hoặc khác loại, thứ tự ổn định;
   - `case-task-breakdown-cli-sources-errors` (AC-003): loại sai `SOURCE_KIND_UNKNOWN` exit 1, danh sách rỗng exit 1, stdin sai exit 2; link có token, password, JWT ra `[REDACTED]` và không chứa giá trị (fixture ghép lúc runtime để không vướng hook git-secrets);
   - `case-task-breakdown-cli-help` (AC-004): `--help`, `-h`, `help` exit 0 không cần `--root`, liệt kê đủ `COMMANDS` kèm synopsis; `COMMAND_UNKNOWN` nhắc `--help`;
   - mở rộng `case-task-breakdown-cli-read-only` cho `sources.mjs`.
2. **TASK-002 EDIT** `test/e2e/product-task-breakdown-flow-contract.test.mjs`. Thêm case `case-task-breakdown-flow-source-guidance` (AC-005):
   - G1 Evidence nhắc `check sources -`; G8 in `result.table` của `check sources`;
   - danh sách lệnh trong `task-breakdown.md` khớp `COMMANDS` của CLI;
   - id loại trong `source-connectors.md` khớp `SOURCE_KINDS`;
   - skill body tối đa 500 dòng.

### Phase 2 — CLI và ref
3. **TASK-003 CREATE** `_refs/product/task-breakdown/sources.mjs`: `SOURCE_KINDS`, bảng hướng dẫn vi/en, `sourceGuidance({ sources, language })` (kiểm, redact bằng `redactValue`, nhóm theo domain và loại, render bảng).
4. **TASK-004 EDIT** `_refs/product/task-breakdown/check.mjs`:
   - lệnh `sources` (stdin JSON, cần `--root`, không đọc file);
   - `--help`, `-h`, `help` xử lý trước bước parse flag;
   - thông báo `COMMAND_UNKNOWN` nhắc `--help`.
5. **TASK-005 EDIT** `_refs/product/task-breakdown.md` và `_refs/product/source-connectors.md`: G1 và G8 dùng `check sources -`; danh sách lệnh thêm `sources` và `--help`; cột id loại nguồn.
6. **TASK-006 GENERATE** 12 mirror `_refs` trong `plugin/`, `.claude/`, `codex/skills/` bằng `npm run sync:skills`, rồi chạy `npm run check:skills`.

### Phase 3 — Artifact quản trị
7. **TASK-007 EDIT** `CHANGELOG.md`: entry Unreleased.
8. **TASK-008 EDIT** `authoring/evals/uiux/evidence.test.mjs`:
   - validator `mirror-refs-path-resolution.json` chuyển sang history, đọc tại `fc85438` qua `atRevision`;
   - thêm validator cho `authoring/evals/task-breakdown-source-guidance.json`: plan mới và hash của nó, continuation trước là record mirror-refs tại `fc85438`, lệnh tập trung có các case mới.

   RED: record mới chưa có.
9. **TASK-009 EDIT** `VALIDATION.md`: mục mới, gồm bảng RED → GREEN và ghi chú history.
10. **TASK-010 CREATE** `authoring/evals/task-breakdown-source-guidance.json`: ghi từ lần chạy thật của lệnh tập trung, **sau** TASK-009.
11. **TASK-011 CREATE** `.sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-delivery.md`: chạy lại `check:skills`, hygiene, executable-references, evidence test và `test:e2e:repository`, rồi ghi kết quả thật.

### Phase 4 — Chạy thật
12. **TASK-012 CREATE** `.sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md`. Người dùng chạy session tương tác (plugin local, `--permission-mode manual`, không ghi tracker) với ít nhất một link không đọc được. Mình đọc transcript và ghi:
    - `check sources -` có chạy không, bảng có hiện ở G1 và G8 không (AC-006);
    - kết quả AC-002 của `product-task-breakdown-mode-v1`.

## Acceptance mapping
- AC-001, AC-002, AC-003 → TASK-001, TASK-003, TASK-004.
- AC-004 → TASK-001, TASK-004.
- AC-005 → TASK-002, TASK-005, TASK-006.
- AC-006 (manual) → TASK-012.
- AC-007 → TASK-007..011.

## Verification
- `node --test test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs`: RED rồi GREEN.
- `npm run sync:skills`, `npm run check:skills`, `npm run check:text-hygiene`, `npm run check:executable-references`.
- `node --test authoring/evals/uiux/evidence.test.mjs`: RED rồi GREEN.
- `npm run test:e2e:repository`: chạy nền.
- Manual: TASK-012.

## Self-review trước approval
- `validateDecisionCoverage` ở stage plan: 0 lỗi, 0 blocker, 0 future gap.
- `validateGoalBackwardPlan`: approval-ready. Có 12 task và 3 goal; 7 path mới đều đã khai.
- `validateValidationMap`: PASS, 14 dòng (một dòng cho mỗi cặp R×AC; case id không trùng).
- `validateArchitecturePrePlanHandoff` và `validateArchitectureDraftPlanHandoff`: PASS với bypass `bounded-bug-fix`.
- Prohibited paths: `skills/**`, `scripts/**`, `plugin/hooks/**`, mirror skill, `AGENTS.md`, `package.json`, lockfile, các record continuation cũ.
- Không thêm dependency.
- Dòng kiểm tay AC-006 luôn ở trạng thái DEFERRED trong convergence. Vì vậy finish gate sẽ báo deferred cho AC đó cho tới khi có lần chạy thật; commit cần bạn yêu cầu rõ như các change trước.

## Typed plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: task-breakdown-source-guidance-v1
  requirement_id: task-breakdown-source-guidance
  approved_spec_path: .sdcorejs/specs/workflow/2026-10-16-16-39-task-breakdown-source-guidance.md
  approved_spec_hash: sha256:v1:6bf9549a8c54695bd1145954568b1145e16b4ad7368a4ff72738e189342cb8f0
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-task-breakdown-source-guidance-v1-r1
    artifact_kind: spec
    revision: fc8543881c9d82428d49f9e11809c81e0b53ed62
    approval_hash: sha256:v1:6bf9549a8c54695bd1145954568b1145e16b4ad7368a4ff72738e189342cb8f0
    repository_relative_path: .sdcorejs/specs/workflow/2026-10-16-16-39-task-breakdown-source-guidance.md
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Lần chạy thật cho thấy AC-002 đã duyệt chưa đạt và CLI thiếu cách tự mô tả; sửa trong CLI chỉ đọc và ref của mode, lệnh mới theo contract verdict hiện có và dùng lại helper redact sẵn có, không đổi owner, boundary, dependency hay đường ghi tracker.
    rationale: Lần chạy thật cho thấy AC-002 đã duyệt chưa đạt và CLI thiếu cách tự mô tả; sửa trong CLI chỉ đọc và ref của mode, lệnh mới theo contract verdict hiện có và dùng lại helper redact sẵn có, không đổi owner, boundary, dependency hay đường ghi tracker.
  architecture_context: null
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: null
  target_root: .
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: portal-sales-platform
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - github.com/sdcorejs/sdcorejs-agent
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 12
  phase_count: 4
  coverage_approach: TDD (RED trước cho lệnh sources, help và câu chữ G1/G8)
  decision_coverage: &a2
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: Khi G1 không đọc được một nguồn, mode hiện ngay hướng dẫn cho từng nguồn (connector, export hoặc dán) theo bảng loại nguồn trong `_refs/product/source-connectors.md`, nhóm theo domain; G8 in lại đúng bảng đó trong phần việc còn mở; không bịa nội dung cho nguồn đó.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-002
          - TASK-005
          - TASK-011
          - TASK-012
      - id: R-002
        type: requirement
        statement: "check.mjs có lệnh chỉ đọc `sources`: nhận qua stdin danh sách nguồn chưa đọc được (`ref`, `kind`, `reason`) và ngôn ngữ; trả `result.groups` và `result.table` với hướng dẫn chuẩn cho từng loại, nhóm theo domain; loại sai hoặc danh sách rỗng thì invalid với mã ổn định; giá trị dạng secret trong `ref`/`reason` thành `[REDACTED]`."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-011
      - id: R-003
        type: requirement
        statement: "`check.mjs --help`, `-h` và `help` in một verdict JSON (exit 0, không cần `--root`) liệt kê mọi lệnh kèm cú pháp, stdin và mô tả ngắn; lỗi `COMMAND_UNKNOWN` nhắc tới `--help`."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-011
      - id: R-004
        type: requirement
        statement: "Ref của mode: G1 và G8 trong `_refs/product/task-breakdown.md` lấy `check sources -` làm evidence và in nguyên văn `result.table`; danh sách lệnh có `sources` và `--help`; `source-connectors.md` ghi id của từng loại nguồn; skill body tối đa 500 dòng; mirror sinh lại bằng script."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-002
          - TASK-005
          - TASK-006
          - TASK-011
      - id: R-005
        type: requirement
        statement: Test xác định viết trước (TDD) cho `sources` và help; flow-contract test khoá câu chữ G1/G8.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-011
      - id: R-006
        type: requirement
        statement: "Người dùng chạy lại một session tương tác (plugin local, `--permission-mode manual`, không ghi tracker) có ít nhất một link không đọc được: hướng dẫn theo từng nguồn hiện ở G1 và G8; ghi kết quả thật vào live-run doc, kể cả khi fail."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-012
      - id: R-007
        type: requirement
        statement: "Governance: record evidence continuation mới (record mirror-refs thành history tại commit của nó), mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, 23 public skill, không thêm dependency, không bump version, không push trong change này."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
      - id: AC-001
        type: acceptance-criterion
        statement: Chạy `check sources -` với một nguồn cho mỗi loại trong SOURCE_KINDS, ngôn ngữ vi và en -> Exit 0; mỗi nhóm có đúng hướng dẫn của loại đó theo ngôn ngữ; result.table là bảng Markdown cột cố định
        behavior: Chạy `check sources -` với một nguồn cho mỗi loại trong SOURCE_KINDS, ngôn ngữ vi và en
        expected_result: Exit 0; mỗi nhóm có đúng hướng dẫn của loại đó theo ngôn ngữ; result.table là bảng Markdown cột cố định
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-011
      - id: AC-002
        type: acceptance-criterion
        statement: Chạy `check sources -` với nhiều link cùng domain và cùng loại, khác domain, khác loại -> Cùng domain và loại gộp một dòng; khác thì tách dòng; thứ tự ổn định giữa các lần chạy
        behavior: Chạy `check sources -` với nhiều link cùng domain và cùng loại, khác domain, khác loại
        expected_result: Cùng domain và loại gộp một dòng; khác thì tách dòng; thứ tự ổn định giữa các lần chạy
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-011
      - id: AC-003
        type: acceptance-criterion
        statement: Chạy `check sources -` với loại sai, danh sách rỗng, stdin không phải JSON, link có token/password/JWT -> Loại sai exit 1 SOURCE_KIND_UNKNOWN; rỗng exit 1 mã ổn định; stdin sai exit 2; kết quả chứa [REDACTED] và không chứa giá trị
        behavior: Chạy `check sources -` với loại sai, danh sách rỗng, stdin không phải JSON, link có token/password/JWT
        expected_result: Loại sai exit 1 SOURCE_KIND_UNKNOWN; rỗng exit 1 mã ổn định; stdin sai exit 2; kết quả chứa [REDACTED] và không chứa giá trị
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-011
      - id: AC-004
        type: acceptance-criterion
        statement: Chạy `check.mjs --help`, `-h`, `help` không có --root; chạy một lệnh lạ; chạy lệnh mới dưới chặn ghi file, spawn và mạng -> Exit 0 và liệt kê mọi lệnh trong COMMANDS kèm synopsis; COMMAND_UNKNOWN nhắc --help; không ghi file, không spawn, không mở mạng
        behavior: Chạy `check.mjs --help`, `-h`, `help` không có --root; chạy một lệnh lạ; chạy lệnh mới dưới chặn ghi file, spawn và mạng
        expected_result: Exit 0 và liệt kê mọi lệnh trong COMMANDS kèm synopsis; COMMAND_UNKNOWN nhắc --help; không ghi file, không spawn, không mở mạng
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
          - R-005
        task_refs:
          - TASK-001
          - TASK-004
          - TASK-011
      - id: AC-005
        type: acceptance-criterion
        statement: Đọc task-breakdown.md, source-connectors.md, skill body và COMMANDS/SOURCE_KINDS của CLI -> G1 Evidence nhắc `check sources -`; G8 yêu cầu in result.table của check sources; danh sách lệnh khớp COMMANDS; id loại khớp SOURCE_KINDS; skill tối đa 500 dòng
        behavior: Đọc task-breakdown.md, source-connectors.md, skill body và COMMANDS/SOURCE_KINDS của CLI
        expected_result: G1 Evidence nhắc `check sources -`; G8 yêu cầu in result.table của check sources; danh sách lệnh khớp COMMANDS; id loại khớp SOURCE_KINDS; skill tối đa 500 dòng
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-004
          - R-005
        task_refs:
          - TASK-002
          - TASK-005
          - TASK-006
          - TASK-011
      - id: AC-006
        type: acceptance-criterion
        statement: Người dùng chạy session tương tác (plugin local, manual, không ghi tracker) với ít nhất một link không đọc được -> Transcript cho thấy `check sources -` chạy và bảng hướng dẫn hiện ở G1 và G8; task ghi nguồn thiếu; không có lệnh ghi tracker; kết quả AC-002 của product-task-breakdown-mode-v1 được ghi vào live-run doc
        behavior: Người dùng chạy session tương tác (plugin local, manual, không ghi tracker) với ít nhất một link không đọc được
        expected_result: Transcript cho thấy `check sources -` chạy và bảng hướng dẫn hiện ở G1 và G8; task ghi nguồn thiếu; không có lệnh ghi tracker; kết quả AC-002 của product-task-breakdown-mode-v1 được ghi vào live-run doc
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-001
          - R-006
        task_refs:
          - TASK-012
      - id: AC-007
        type: acceptance-criterion
        statement: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record mirror-refs verify như history; 23 public skill; CHANGELOG có entry Unreleased
        behavior: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3
        expected_result: Tất cả xanh; continuation mới hợp lệ; record mirror-refs verify như history; 23 public skill; CHANGELOG có entry Unreleased
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
      - id: A-001
        type: assumption
        statement: Model in nguyên văn result.table của `check sources`, như đã làm với `check report` ở lần chạy thứ ba.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - live-run-r3-2026-10-16-g8-report-table
        consequence_if_wrong: Hướng dẫn vẫn thiếu; cần ràng buộc chặt hơn ở change sau.
        validation_method: Lần chạy thật AC-006.
        owner: skill pack maintainer
        rationale: Bảng G8 của lần chạy thứ ba khớp output `check report`.
        impacted_refs:
          - R-001
          - R-006
      - id: A-002
        type: assumption
        statement: "Mặc định governance: continuation riêng, mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, không bump version, không push."
        source: defaulted
        confidence: high
        status: proposed
        blocking: false
        evidence_refs:
          - repository-governance-precedent
        consequence_if_wrong: Plan phải thêm hoặc bỏ task quản trị.
        validation_method: Người dùng xác nhận khi duyệt spec.
        owner: spec approver
        rationale: test:e2e:repository khoá các artifact này cho mỗi thay đổi.
        impacted_refs:
          - R-007
      - id: D-001
        type: decision
        statement: "Cách sửa AC-002: Thêm lệnh CLI `sources` sinh bảng hướng dẫn xác định; G1 và G8 in nguyên văn result.table"
        question: Cách sửa AC-002
        selected_value: Thêm lệnh CLI `sources` sinh bảng hướng dẫn xác định; G1 và G8 in nguyên văn result.table
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Lần chạy thứ ba in đúng bảng của `check report` nhưng bỏ qua bảng hướng dẫn chỉ nằm trong ref.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - AC-001
          - AC-005
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
      - id: D-002
        type: decision
        statement: "Phân loại nguồn: Model chọn kind trong danh sách id cố định (issue-tracker, wiki, design-tool, api-spec, login-gated, file, unknown); CLI không đoán loại từ domain"
        question: Phân loại nguồn
        selected_value: Model chọn kind trong danh sách id cố định (issue-tracker, wiki, design-tool, api-spec, login-gated, file, unknown); CLI không đoán loại từ domain
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Mỗi dự án đặt tên và gọi khác nhau; cùng một domain có thể là tracker ở dự án này và wiki ở dự án khác.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-002
          - AC-001
          - AC-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-005
      - id: D-003
        type: decision
        statement: "Lệnh help: `--help`, `-h` và `help` cho cùng một verdict JSON (command help, root null, exit 0)"
        question: Lệnh help
        selected_value: "`--help`, `-h` và `help` cho cùng một verdict JSON (command help, root null, exit 0)"
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Giữ một dạng output JSON cho mọi lệnh.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-004
        task_refs:
          - TASK-001
          - TASK-004
      - id: D-004
        type: decision
        statement: "Nhánh: Nhánh mới fix/task-breakdown-source-guidance tạo từ commit mirror-refs"
        question: Nhánh
        selected_value: Nhánh mới fix/task-breakdown-source-guidance tạo từ commit mirror-refs
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tách change; record mirror-refs thành history tại commit.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-007
          - AC-007
        task_refs:
          - TASK-008
          - TASK-010
      - id: D-005
        type: decision
        statement: "Cách viết test: TDD cho logic, test RED trước"
        question: Cách viết test
        selected_value: TDD cho logic, test RED trước
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Người dùng chọn "TDD phần logic".
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-001
          - AC-004
        task_refs:
          - TASK-001
          - TASK-002
      - id: D-006
        type: decision
        statement: "Chạy thật: Task cuối; người dùng chạy session tương tác ở chế độ manual và không ghi tracker"
        question: Chạy thật
        selected_value: Task cuối; người dùng chạy session tương tác ở chế độ manual và không ghi tracker
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Headless làm méo cổng nhiều lượt; lần chạy là chạy thử nên không ghi tracker.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-006
        task_refs:
          - TASK-012
      - id: D-007
        type: decision
        statement: "Ranh giới validation của thay đổi: không có authorization boundary; mọi dòng validation_map dùng boundary kind none."
        question: Validation boundary của validation_map
        selected_value: kind none cho mọi dòng; approval_ref D-007
        source: approved-plan
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Thay đổi chỉ ở CLI chỉ đọc, ref của mode và test; không có boundary phân quyền.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a1
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
          - AC-006
          - AC-007
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
        task_refs:
          - TASK-011
        validation_boundary:
          kind: none
          source_refs: *a1
      - id: INV-001
        type: invariant
        statement: "CLI chỉ đọc: không ghi file, không spawn process, không mở mạng; mọi lệnh, kể cả help, in đúng một verdict JSON."
        protected_refs:
          - R-002
          - R-003
          - AC-003
          - AC-004
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-011
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-011
      - id: INV-002
        type: invariant
        statement: Không bịa nội dung cho nguồn chưa đọc được; giá trị dạng secret không xuất hiện trong kết quả.
        protected_refs:
          - R-001
          - AC-003
          - AC-005
        task_refs:
          - TASK-002
          - TASK-005
          - TASK-011
          - TASK-012
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-005
          - EVIDENCE-011
          - EVIDENCE-012
      - id: INV-003
        type: invariant
        statement: Id loại nguồn và danh sách lệnh khớp giữa CLI và ref của mode.
        protected_refs:
          - R-004
          - AC-005
        task_refs:
          - TASK-002
          - TASK-005
          - TASK-006
          - TASK-011
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-005
          - EVIDENCE-006
          - EVIDENCE-011
      - id: INV-004
        type: invariant
        statement: Kết quả lần chạy thật được ghi đúng như transcript, kể cả khi fail; không ghi tracker và không chạy thay người dùng.
        protected_refs:
          - R-006
          - AC-006
        task_refs:
          - TASK-012
        evidence_refs:
          - EVIDENCE-012
      - id: INV-005
        type: invariant
        statement: Evidence continuation gắn với nội dung hiện tại và một lần chạy thật; record mirror-refs chỉ được kiểm như history.
        protected_refs:
          - R-007
          - AC-007
        task_refs:
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
        evidence_refs:
          - EVIDENCE-007
          - EVIDENCE-008
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-011
      - id: INV-006
        type: invariant
        statement: Test RED chạy trước khi viết code; không xoá hay làm yếu assertion có sẵn.
        protected_refs:
          - R-005
          - AC-001
          - AC-002
          - AC-003
          - AC-004
          - AC-005
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-011
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-002
          - EVIDENCE-011
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
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: D-005
            type: decision
          - id: D-006
            type: decision
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
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: D-005
            type: decision
          - id: D-006
            type: decision
          - id: D-007
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
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a2
    goals:
      - id: G-001
        statement: Lệnh `check sources -` và help có test RED -> GREEN; G1/G8 của ref in nguyên văn bảng hướng dẫn; mirror sinh lại.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
      - id: G-002
        statement: Artifact quản trị và evidence continuation cập nhật; suite xanh.
        task_refs:
          - TASK-007
          - TASK-008
          - TASK-009
          - TASK-010
          - TASK-011
      - id: G-003
        statement: Lần chạy thật tương tác cho thấy hướng dẫn theo từng nguồn ở G1 và G8.
        task_refs:
          - TASK-012
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/product-task-breakdown-cli.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-002
              - R-003
              - R-005
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - INV-001
              - INV-006
        justification_refs:
          - R-002
          - R-003
          - R-005
          - D-002
          - D-003
          - D-005
        enforces_invariant_refs:
          - INV-001
          - INV-006
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/product-task-breakdown-flow-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-001
              - R-004
              - R-005
              - AC-005
              - INV-002
              - INV-003
              - INV-006
        justification_refs:
          - R-001
          - R-004
          - R-005
          - D-001
          - D-005
        enforces_invariant_refs:
          - INV-002
          - INV-003
          - INV-006
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/product/task-breakdown/sources.mjs
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-002
              - AC-001
              - AC-002
              - AC-003
              - INV-001
        justification_refs:
          - R-002
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-001
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
          - TASK-003
        planned_paths:
          - _refs/product/task-breakdown/check.mjs
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-002
              - R-003
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - INV-001
        justification_refs:
          - R-002
          - R-003
          - D-001
          - D-003
        enforces_invariant_refs:
          - INV-001
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
          - TASK-004
        planned_paths:
          - _refs/product/task-breakdown.md
          - _refs/product/source-connectors.md
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-001
              - R-004
              - AC-005
              - INV-002
              - INV-003
        justification_refs:
          - R-001
          - R-004
          - D-001
          - D-002
        enforces_invariant_refs:
          - INV-002
          - INV-003
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
        planned_paths:
          - plugin/_refs/product/task-breakdown.md
          - plugin/_refs/product/source-connectors.md
          - plugin/_refs/product/task-breakdown/check.mjs
          - plugin/_refs/product/task-breakdown/sources.mjs
          - .claude/_refs/product/task-breakdown.md
          - .claude/_refs/product/source-connectors.md
          - .claude/_refs/product/task-breakdown/check.mjs
          - .claude/_refs/product/task-breakdown/sources.mjs
          - codex/skills/_refs/product/task-breakdown.md
          - codex/skills/_refs/product/source-connectors.md
          - codex/skills/_refs/product/task-breakdown/check.mjs
          - codex/skills/_refs/product/task-breakdown/sources.mjs
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-004
              - AC-005
              - INV-003
        justification_refs:
          - R-004
        enforces_invariant_refs:
          - INV-003
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - CHANGELOG.md
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-007
              - AC-007
              - INV-005
        justification_refs:
          - R-007
        enforces_invariant_refs:
          - INV-005
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - authoring/evals/uiux/evidence.test.mjs
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-007
              - AC-007
              - INV-005
        justification_refs:
          - R-007
          - D-004
        enforces_invariant_refs:
          - INV-005
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-008
        planned_paths:
          - VALIDATION.md
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-007
              - AC-007
              - INV-005
        justification_refs:
          - R-007
        enforces_invariant_refs:
          - INV-005
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-009
        planned_paths:
          - authoring/evals/task-breakdown-source-guidance.json
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-007
              - AC-007
              - INV-005
        justification_refs:
          - R-007
          - D-004
        enforces_invariant_refs:
          - INV-005
      - id: TASK-011
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
          - TASK-010
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-delivery.md
        planned_evidence:
          - id: EVIDENCE-011
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-007
              - AC-001
              - AC-002
              - AC-003
              - AC-004
              - AC-005
              - AC-007
              - INV-001
              - INV-002
              - INV-003
              - INV-005
              - INV-006
        justification_refs:
          - R-007
          - D-007
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-005
          - INV-006
      - id: TASK-012
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-011
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md
        planned_evidence:
          - id: EVIDENCE-012
            record_refs:
              - R-001
              - R-006
              - AC-006
              - INV-002
              - INV-004
        justification_refs:
          - R-006
          - D-006
        enforces_invariant_refs:
          - INV-002
          - INV-004
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - .claude/_refs/product/source-connectors.md
            - .claude/_refs/product/task-breakdown.md
            - .claude/_refs/product/task-breakdown/check.mjs
            - CHANGELOG.md
            - VALIDATION.md
            - _refs/product/source-connectors.md
            - _refs/product/task-breakdown.md
            - _refs/product/task-breakdown/check.mjs
            - authoring/evals/uiux/evidence.test.mjs
            - codex/skills/_refs/product/source-connectors.md
            - codex/skills/_refs/product/task-breakdown.md
            - codex/skills/_refs/product/task-breakdown/check.mjs
            - plugin/_refs/product/source-connectors.md
            - plugin/_refs/product/task-breakdown.md
            - plugin/_refs/product/task-breakdown/check.mjs
            - test/e2e/product-task-breakdown-cli.test.mjs
            - test/e2e/product-task-breakdown-flow-contract.test.mjs
          intended_new_paths:
            - path: _refs/product/task-breakdown/sources.mjs
              owner_task_id: TASK-003
            - path: plugin/_refs/product/task-breakdown/sources.mjs
              owner_task_id: TASK-006
            - path: .claude/_refs/product/task-breakdown/sources.mjs
              owner_task_id: TASK-006
            - path: codex/skills/_refs/product/task-breakdown/sources.mjs
              owner_task_id: TASK-006
            - path: authoring/evals/task-breakdown-source-guidance.json
              owner_task_id: TASK-010
            - path: .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-delivery.md
              owner_task_id: TASK-011
            - path: .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md
              owner_task_id: TASK-012
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-002
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-001
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-kinds-r-002
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Exit 0; mỗi nhóm có đúng hướng dẫn của loại đó theo ngôn ngữ; result.table là bảng Markdown cột cố định
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-kinds-r-005
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Exit 0; mỗi nhóm có đúng hướng dẫn của loại đó theo ngôn ngữ; result.table là bảng Markdown cột cố định
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-grouping-r-002
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Cùng domain và loại gộp một dòng; khác thì tách dòng; thứ tự ổn định giữa các lần chạy
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-grouping-r-005
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Cùng domain và loại gộp một dòng; khác thì tách dòng; thứ tự ổn định giữa các lần chạy
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
        - INV-002
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-errors-r-002
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Loại sai exit 1 SOURCE_KIND_UNKNOWN; rỗng exit 1 mã ổn định; stdin sai exit 2; kết quả chứa [REDACTED] và không chứa giá trị
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
        - INV-002
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-sources-errors-r-005
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Loại sai exit 1 SOURCE_KIND_UNKNOWN; rỗng exit 1 mã ổn định; stdin sai exit 2; kết quả chứa [REDACTED] và không chứa giá trị
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-help-r-003
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Exit 0 và liệt kê mọi lệnh trong COMMANDS kèm synopsis; COMMAND_UNKNOWN nhắc --help; không ghi file, không spawn, không mở mạng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-cli-help-r-005
      planned_command: node --test test/e2e/product-task-breakdown-cli.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Exit 0 và liệt kê mọi lệnh trong COMMANDS kèm synopsis; COMMAND_UNKNOWN nhắc --help; không ghi file, không spawn, không mở mạng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-003
        - EVIDENCE-004
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-002
        - INV-003
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-flow-source-guidance-r-001
      planned_command: node --test test/e2e/product-task-breakdown-flow-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: G1 Evidence nhắc `check sources -`; G8 yêu cầu in result.table của check sources; danh sách lệnh khớp COMMANDS; id loại khớp SOURCE_KINDS; skill tối đa 500 dòng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-002
        - INV-003
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-flow-source-guidance-r-004
      planned_command: node --test test/e2e/product-task-breakdown-flow-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: G1 Evidence nhắc `check sources -`; G8 yêu cầu in result.table của check sources; danh sách lệnh khớp COMMANDS; id loại khớp SOURCE_KINDS; skill tối đa 500 dòng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-002
        - INV-003
        - INV-006
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-flow-source-guidance-r-005
      planned_command: node --test test/e2e/product-task-breakdown-flow-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: G1 Evidence nhắc `check sources -`; G8 yêu cầu in result.table của check sources; danh sách lệnh khớp COMMANDS; id loại khớp SOURCE_KINDS; skill tối đa 500 dòng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-006
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-002
        - INV-004
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-live-run-r-001
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Transcript cho thấy `check sources -` chạy và bảng hướng dẫn hiện ở G1 và G8; task ghi nguồn thiếu; không có lệnh ghi tracker; kết quả AC-002 của product-task-breakdown-mode-v1 được ghi vào live-run doc
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-005
        - EVIDENCE-011
        - EVIDENCE-012
      rationale: Chỉ session tương tác thật chứng minh được model in bảng hướng dẫn ở G1 và G8.
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-004
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-live-run-r-006
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Transcript cho thấy `check sources -` chạy và bảng hướng dẫn hiện ở G1 và G8; task ghi nguồn thiếu; không có lệnh ghi tracker; kết quả AC-002 của product-task-breakdown-mode-v1 được ghi vào live-run doc
      status: covered
      evidence_refs:
        - EVIDENCE-012
      rationale: Chỉ session tương tác thật chứng minh được model in bảng hướng dẫn ở G1 và G8.
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-007
        source_refs: *a1
      authorization_boundary: false
      levels:
        - integration
      case_ids:
        - case-task-breakdown-delivery-hygiene
      planned_command: npm run test:e2e:repository
      command_source: package.json
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Tất cả xanh; continuation mới hợp lệ; record mirror-refs verify như history; 23 public skill; CHANGELOG có entry Unreleased
      status: covered
      evidence_refs:
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-011
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - test/e2e/product-task-breakdown-cli.test.mjs
    - test/e2e/product-task-breakdown-flow-contract.test.mjs
    - _refs/product/task-breakdown/sources.mjs
    - _refs/product/task-breakdown/check.mjs
    - _refs/product/task-breakdown.md
    - _refs/product/source-connectors.md
    - plugin/_refs/product/task-breakdown.md
    - plugin/_refs/product/source-connectors.md
    - plugin/_refs/product/task-breakdown/check.mjs
    - plugin/_refs/product/task-breakdown/sources.mjs
    - .claude/_refs/product/task-breakdown.md
    - .claude/_refs/product/source-connectors.md
    - .claude/_refs/product/task-breakdown/check.mjs
    - .claude/_refs/product/task-breakdown/sources.mjs
    - codex/skills/_refs/product/task-breakdown.md
    - codex/skills/_refs/product/source-connectors.md
    - codex/skills/_refs/product/task-breakdown/check.mjs
    - codex/skills/_refs/product/task-breakdown/sources.mjs
    - CHANGELOG.md
    - authoring/evals/uiux/evidence.test.mjs
    - VALIDATION.md
    - authoring/evals/task-breakdown-source-guidance.json
    - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-delivery.md
    - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md
  prohibited_paths:
    - skills/**
    - scripts/**
    - plugin/hooks/**
    - plugin/skills/**
    - .claude/skills/**
    - AGENTS.md
    - CLAUDE.md
    - .cursor/rules/**
    - .github/copilot-instructions.md
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - node_modules/**
    - package.json
    - package-lock.json
    - site/**
    - .env*
    - authoring/skills/**
    - authoring/README.md
    - authoring/evals/product-task-breakdown-mode.json
    - authoring/evals/mirror-refs-path-resolution.json
    - authoring/evals/audit-findings-repair.json
    - authoring/evals/interaction-finish-contract.json
    - authoring/evals/skill-body-progressive-loading.json
    - authoring/evals/scenarios.json
    - authoring/evals/run-deterministic.mjs
    - authoring/evals/skill-authoring-contract.mjs
    - authoring/evals/uiux/*.json
  generated_artifacts:
    - plugin/_refs/**
    - .claude/_refs/**
    - codex/skills/_refs/**
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-delivery.md
    - .sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md
    - CHANGELOG.md
    - VALIDATION.md
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
    scope: null
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: CLI chỉ đọc, ref Markdown và test; không có frontend.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Không có agent application.
  verification_strategy:
    package_manager: npm
    package_manager_evidence:
      - package.json packageManager npm@10.9.2
      - package-lock.json
    node_runtime: 22.22.3 qua fnm (engines ^22.22.3)
    commands_planned:
      - node --test test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs (RED rồi GREEN)
      - npm run sync:skills
      - npm run check:skills
      - npm run check:text-hygiene
      - npm run check:executable-references
      - node --test authoring/evals/uiux/evidence.test.mjs (RED rồi GREEN)
      - node --test --test-concurrency=1 --test-reporter=tap test/e2e/product-task-breakdown-contract.test.mjs test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs test/e2e/mirror-refs-resolution.test.mjs (lần chạy ghi vào continuation, sau VALIDATION.md)
      - npm run test:e2e:repository
    commands_skipped:
      - npm run test:e2e (golden projects không bị chạm)
      - npm install / npm audit (không đổi dependency)
      - "refresh .sdcorejs/summary.md: không cần, fingerprint giữ nguyên khi thêm file vào _refs/product/task-breakdown/ (đã kiểm ngày 2026-10-17)"
    checks: "Focused: test CLI (sources, help, read-only), flow-contract G1/G8. Broad: test:e2e:repository, check:skills, hygiene."
  parallel_candidates:
    allowed: false
    contract: "Tuần tự: CLI phụ thuộc test RED; mirror phụ thuộc ref; evidence phụ thuộc mọi file nguồn."
    shared_files: []
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - github.com/sdcorejs/sdcorejs-agent
    contract: Một repo standalone; mọi step dùng Git root sdcorejs-agent.
  branch_policy: "D-004: nhánh fix/task-breakdown-source-guidance từ fc85438; không push khi chưa được yêu cầu."
  finish_tail:
    contract: docs_before_final_branch_ready -> verify_before_done -> branch_ready_final_gate -> no_writes_after_branch_ready
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```
