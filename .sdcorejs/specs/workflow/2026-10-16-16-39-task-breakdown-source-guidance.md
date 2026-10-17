---
acceptance_criteria_count: 7
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-10-17T03:18:24.886Z
approved_by: user
approved_draft_fingerprint: sha256:a4b925a65878de644fc14bec5b8b0472718126d368e568de9f153b20351e8987
artifact_id: spec-task-breakdown-source-guidance-v1-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: task-breakdown-source-guidance-v1
commit_policy: with-change
contract_id: task-breakdown-source-guidance-v1
description: Show per-source connector, export or paste guidance for unreadable task-breakdown sources through a deterministic check CLI table, and add help output to the check CLI.
manual_criteria_count: 1
name: task-breakdown-source-guidance
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-10-16-16-39-task-breakdown-source-guidance.md
requirement_id: task-breakdown-source-guidance
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-10-16-16-39-task-breakdown-source-guidance-spec.md
source_plan: none
source_revision: fc8543881c9d82428d49f9e11809c81e0b53ed62
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:6bf9549a8c54695bd1145954568b1145e16b4ad7368a4ff72738e189342cb8f0
---
# Hướng dẫn nguồn chưa đọc được và lệnh help cho check CLI của task-breakdown — Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract

# Spec - Hướng dẫn nguồn chưa đọc được và lệnh help cho check CLI của task-breakdown - 2026-10-16 16:39

```yaml
spec_context:
  source: sdcorejs-spec
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Khi G1 không đọc được một nguồn, mode hiện ngay hướng dẫn cho từng nguồn (connector, export hoặc dán) theo bảng loại nguồn trong `_refs/product/source-connectors.md`, nhóm theo domain; G8 in lại đúng bảng đó trong phần việc còn mở; không bịa nội dung cho nguồn đó.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: "check.mjs có lệnh chỉ đọc `sources`: nhận qua stdin danh sách nguồn chưa đọc được (`ref`, `kind`, `reason`) và ngôn ngữ; trả `result.groups` và `result.table` với hướng dẫn chuẩn cho từng loại, nhóm theo domain; loại sai hoặc danh sách rỗng thì invalid với mã ổn định; giá trị dạng secret trong `ref`/`reason` thành `[REDACTED]`."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: "`check.mjs --help`, `-h` và `help` in một verdict JSON (exit 0, không cần `--root`) liệt kê mọi lệnh kèm cú pháp, stdin và mô tả ngắn; lỗi `COMMAND_UNKNOWN` nhắc tới `--help`."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: "Ref của mode: G1 và G8 trong `_refs/product/task-breakdown.md` lấy `check sources -` làm evidence và in nguyên văn `result.table`; danh sách lệnh có `sources` và `--help`; `source-connectors.md` ghi id của từng loại nguồn; skill body tối đa 500 dòng; mirror sinh lại bằng script."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Test xác định viết trước (TDD) cho `sources` và help; flow-contract test khoá câu chữ G1/G8.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: "Người dùng chạy lại một session tương tác (plugin local, `--permission-mode manual`, không ghi tracker) có ít nhất một link không đọc được: hướng dẫn theo từng nguồn hiện ở G1 và G8; ghi kết quả thật vào live-run doc, kể cả khi fail."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: "Governance: record evidence continuation mới (record mirror-refs thành history tại commit của nó), mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, 23 public skill, không thêm dependency, không bump version, không push trong change này."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record mirror-refs verify như history; 23 public skill; CHANGELOG có entry Unreleased
        behavior: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3
        expected_result: Tất cả xanh; continuation mới hợp lệ; record mirror-refs verify như history; 23 public skill; CHANGELOG có entry Unreleased
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
        task_refs: []
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
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Lần chạy thật cho thấy AC-002 đã duyệt chưa đạt và CLI thiếu cách tự mô tả; sửa trong CLI chỉ đọc và ref của mode, lệnh mới theo contract verdict hiện có và dùng lại helper redact sẵn có, không đổi owner, boundary, dependency hay đường ghi tracker.
    rationale: Lần chạy thật cho thấy AC-002 đã duyệt chưa đạt và CLI thiếu cách tự mô tả; sửa trong CLI chỉ đọc và ref của mode, lệnh mới theo contract verdict hiện có và dùng lại helper redact sẵn có, không đổi owner, boundary, dependency hay đường ghi tracker.
  contract_id: task-breakdown-source-guidance-v1
  requirement_id: task-breakdown-source-guidance
  approved_spec_path: ""
  approved_spec_hash: ""
  supersedes: null
  target_root: .
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: portal-sales-platform
  track: workflow
  stack_profile: markdown-skill-pack
  profile_confidence: high
  source_requirement_context: "sdcorejs-repair-loop 2026-10-16 (verify-before-done của product-task-breakdown-mode-v1: AC-002 đạt một phần; check.mjs --help trả COMMAND_UNKNOWN; người dùng chọn việc tiếp theo số 1 và 2)"
  acceptance_criteria_count: 7
  manual_criteria_count: 1
  non_goals:
    - Tự đoán loại nguồn từ domain
    - Đổi cách đọc nguồn hay chuỗi fallback
    - Đổi format task, write plan hay đường ghi tracker
    - Kiểm phần đọc lại sau khi ghi (AC-011)
    - Bump version plugin
    - Push hoặc tạo PR
  risks:
    - Model chọn sai kind
    - Hướng dẫn trong helper lệch với bảng trong source-connectors.md
    - Link có token lọt vào bảng
    - Model vẫn không in bảng
  assumptions:
    - A-001
    - A-002
  redaction_applied: true
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Problem & Goals
Lần chạy thật thứ ba của mode `task-breakdown` (`.sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md`) đi đúng chuỗi cổng G0..G8, nhưng còn hai lỗ hổng:

- **AC-002 của `product-task-breakdown-mode-v1` chỉ đạt một phần.** Báo cáo cuối liệt kê 3 nguồn chưa đọc được và không bịa nội dung. Tuy vậy, nó không đưa hướng dẫn connector, export hoặc dán cho từng nguồn, dù `_refs/product/source-connectors.md` yêu cầu. Bảng hướng dẫn chỉ nằm trong ref, còn G1 và G8 không có evidence nào buộc phải in bảng đó.
- **`check.mjs --help` trả `COMMAND_UNKNOWN` (exit 2).** Model phải đọc mã nguồn của CLI để biết cách dùng.

Cùng lần chạy đó, model in đúng nguyên văn `result.table` của `check report`. Vì vậy cách sửa là cho CLI sinh bảng hướng dẫn một cách xác định, rồi để G1 và G8 in nguyên văn bảng đó.

Mục tiêu:
- Nguồn nào chưa đọc được cũng có hướng dẫn cụ thể theo loại nguồn, hiện ngay ở G1 và lặp lại ở G8.
- CLI tự mô tả được cách dùng.
- Có test xác định cho phần logic.
- Chạy thật lại để kiểm AC-002.

Người dùng: người chạy mode `task-breakdown` (PO, BA, tech lead) và maintainer skill pack.

## Requirements
- R-001 - Khi G1 không đọc được một nguồn, mode hiện ngay hướng dẫn cho từng nguồn (connector, export hoặc dán), theo bảng loại nguồn trong `_refs/product/source-connectors.md` và nhóm theo domain. G8 in lại đúng bảng đó trong phần việc còn mở. Mode không bịa nội dung cho nguồn đó. Nguồn: người dùng (AC-002 đã duyệt và việc tiếp theo số 1); active; owner `github.com/sdcorejs/sdcorejs-agent`.
- R-002 - `check.mjs` có lệnh chỉ đọc `sources`:
  - nhận qua stdin danh sách nguồn chưa đọc được (`ref`, `kind`, `reason`) và ngôn ngữ;
  - trả `result.groups` và `result.table` với hướng dẫn chuẩn cho từng loại, nhóm theo domain;
  - loại không hợp lệ hoặc danh sách rỗng thì trả invalid với mã lỗi ổn định;
  - giá trị dạng secret trong `ref` hoặc `reason` được thay bằng `[REDACTED]` trước khi vào kết quả.

  Nguồn: người dùng; active.
- R-003 - `check.mjs --help`, `-h` và `help` in một verdict JSON (exit 0, không cần `--root`) liệt kê mọi lệnh, kèm cú pháp, stdin và mô tả ngắn. Lỗi `COMMAND_UNKNOWN` nhắc tới `--help`. Nguồn: người dùng (việc tiếp theo số 2); active.
- R-004 - Ref của mode được cập nhật:
  - G1 và G8 trong `_refs/product/task-breakdown.md` lấy `check sources -` làm evidence và in nguyên văn `result.table`;
  - danh sách lệnh có `sources` và `--help`;
  - `source-connectors.md` ghi id của từng loại nguồn;
  - skill body giữ tối đa 500 dòng, mirror sinh lại bằng script.

  Nguồn: người dùng; active.
- R-005 - Test xác định được viết trước (TDD) cho `sources` và help. Flow-contract test khoá câu chữ của G1 và G8. Nguồn: người dùng ("TDD phần logic"); active.
- R-006 - Người dùng chạy lại một session tương tác (plugin local, `--permission-mode manual`, không ghi tracker) với ít nhất một link không đọc được. Hướng dẫn theo từng nguồn phải hiện ở G1 và G8. Kết quả thật được ghi vào live-run doc, kể cả khi fail. Nguồn: người dùng; active.
- R-007 - Governance:
  - record evidence continuation mới, trong đó record mirror-refs thành history tại commit của nó;
  - mục VALIDATION.md; summary refresh nếu stale; CHANGELOG Unreleased;
  - giữ 23 public skill, không thêm dependency, không bump version, không push trong change này.

  Nguồn: người dùng; active.

## Decisions
- D-001 - Cách sửa AC-002: thêm lệnh CLI `sources` sinh bảng hướng dẫn xác định; G1 và G8 in nguyên văn `result.table`. Không chỉ sửa câu chữ của ref. Nguồn: chốt trong spec này, có hiệu lực khi spec được duyệt. Lý do: lần chạy thứ ba in đúng bảng của `check report` nhưng bỏ qua bảng hướng dẫn chỉ nằm trong ref.
- D-002 - Phân loại nguồn: model chọn `kind` trong danh sách id cố định (`issue-tracker`, `wiki`, `design-tool`, `api-spec`, `login-gated`, `file`, `unknown`). CLI không tự đoán loại từ domain. Nguồn: người dùng (quy trình chung, mỗi dự án đặt tên và gọi khác nhau). Lý do: cùng một domain có thể là tracker ở dự án này và wiki ở dự án khác.
- D-003 - Lệnh help: `--help`, `-h` và `help` cho cùng một output theo contract verdict hiện có (`command: help`, `root: null`, exit 0). Nguồn: chốt trong spec này. Lý do: giữ một dạng output JSON cho mọi lệnh.
- D-004 - Nhánh: nhánh mới `fix/task-breakdown-source-guidance`, tạo từ commit mirror-refs (`fc85438`). Nguồn: chốt trong spec này. Lý do: tách change; record mirror-refs thành history tại commit.
- D-005 - Cách viết test: TDD cho logic, test RED trước. Nguồn: người dùng ("TDD phần logic"); approved.
- D-006 - Chạy thật: là task cuối; người dùng chạy session tương tác ở chế độ `manual` và không ghi tracker. Nguồn: người dùng ("chỉ chạy test thôi"); approved.

## Assumptions
- A-001 - Model in nguyên văn `result.table` của `check sources`, như đã làm với `check report` ở lần chạy thứ ba.
  - Suy ra, độ tin cậy trung bình, proposed, không chặn.
  - Bằng chứng: bảng G8 của lần chạy thứ ba khớp output `check report`.
  - Nếu sai: hướng dẫn vẫn thiếu; cần ràng buộc chặt hơn ở change sau.
  - Kiểm bằng AC-006; owner là maintainer skill pack.
- A-002 - Mặc định governance: continuation riêng, mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, không bump version, không push.
  - Mặc định, độ tin cậy cao, proposed, không chặn.
  - Xác nhận khi duyệt spec.

## Architecture gate classification
- Status: not-applicable.
- Signals: không có.
- Bypass: `bounded-bug-fix`. Lần chạy thật cho thấy AC-002 đã duyệt chưa đạt và CLI thiếu cách tự mô tả. Bản sửa nằm trong CLI chỉ đọc và ref của mode. Lệnh mới theo đúng contract verdict hiện có, dùng lại helper redact sẵn có, không đổi owner, boundary, dependency hay đường ghi tracker.

## Non-goals
- Tự đoán loại nguồn từ domain.
- Đổi cách đọc nguồn (`source.read`) hay chuỗi fallback.
- Đổi format task, write plan hay đường ghi tracker.
- Kiểm phần đọc lại sau khi ghi (AC-011); việc này cần một lần ghi thật được người dùng cho phép.
- Bump version plugin.
- Push hoặc tạo PR.

## Architecture
- **`_refs/product/task-breakdown/sources.mjs` (mới, thuần):**
  - `SOURCE_KINDS` là danh sách id cố định.
  - `sourceGuidance({ sources, language })` kiểm từng nguồn, redact `ref` và `reason` bằng `redactValue` của `safety.mjs`, rồi nhóm theo cặp (domain, kind) theo thứ tự ổn định.
  - Kết quả gồm `groups` và một bảng Markdown cột cố định (vi/en). Hướng dẫn cho từng loại lấy từ một bảng hằng, khớp nội dung với `source-connectors.md`.
  - Domain là host viết thường khi `ref` là URL; nếu không phải URL thì là nhãn "không có link".
- **`check.mjs`:**
  - Thêm lệnh `sources` (stdin JSON `{ language, sources }`, cần `--root` như các lệnh khác, không đọc file nào).
  - Thêm `--help`, `-h`, `help`: chạy trước bước parse flag, không cần `--root`. Output là `result.usage` và `result.commands`, mỗi lệnh có `name`, `synopsis`, `stdin`, `summary`.
  - Thông báo `COMMAND_UNKNOWN` nhắc `--help`.
  - CLI vẫn không ghi file, không spawn process, không mở kết nối mạng.
- **`_refs/product/task-breakdown.md`:** G1 Evidence thêm `check sources -` trên các nguồn chưa đọc được, in nguyên văn `result.table`. G8 in lại bảng đó trong phần việc còn mở. Danh sách lệnh có `sources` và `--help`.
- **`_refs/product/source-connectors.md`:** cột id loại nguồn trong bảng, và câu chỉ tới `check sources -`.
- **Test:**
  - CLI test cho `sources` (đủ loại, nhóm, ngôn ngữ, lỗi, redact) và help;
  - case read-only hiện có được mở rộng cho lệnh mới;
  - flow-contract test kiểm câu chữ G1/G8, khớp danh sách lệnh với `COMMANDS` của CLI, khớp id loại giữa ref và helper.

## Stack profile and technology assumptions
- Track: `workflow`.
- Stack profile: `markdown-skill-pack`, với script Node ESM.
- Profile evidence: `package.json` (`type: module`, `packageManager npm@10.9.2`), `_refs/product/task-breakdown/*.mjs`, các suite `node --test` trong `test/e2e`.
- Technology assumptions: Node 22.22.3 theo `engines`; không thêm dependency.

## File structure
- `_refs/product/task-breakdown/sources.mjs` - tạo: helper thuần cho bảng hướng dẫn.
- `_refs/product/task-breakdown/check.mjs` - sửa: lệnh `sources`, help, thông báo `COMMAND_UNKNOWN`.
- `_refs/product/task-breakdown.md`, `_refs/product/source-connectors.md` - sửa: G1/G8, danh sách lệnh, id loại nguồn.
- `test/e2e/product-task-breakdown-cli.test.mjs`, `test/e2e/product-task-breakdown-flow-contract.test.mjs` - sửa: test RED trước.
- Mirror `_refs` trong `plugin/`, `.claude/`, `codex/skills/` - sinh lại bằng `npm run sync:skills`.
- `CHANGELOG.md`, `VALIDATION.md`, `.sdcorejs/summary.md` - artifact quản trị.
- `authoring/evals/uiux/evidence.test.mjs`, `authoring/evals/task-breakdown-source-guidance.json` - evidence continuation; record mirror-refs thành history tại commit của nó.
- `.sdcorejs/docs/workflow/*-task-breakdown-source-guidance-*.md` - delivery và live-run.

## Acceptance criteria
- AC-001 - `check sources -` với một nguồn cho mỗi loại trong `SOURCE_KINDS`: exit 0; mỗi nhóm có đúng hướng dẫn của loại đó theo ngôn ngữ (vi/en); `result.table` là bảng Markdown với cột cố định. (tự động)
- AC-002 - Nhiều link cùng domain và cùng loại được gộp vào một dòng; khác domain hoặc khác loại thì tách dòng; thứ tự dòng ổn định giữa các lần chạy. (tự động)
- AC-003 - Lỗi và secret:
  - loại sai: exit 1 với `SOURCE_KIND_UNKNOWN`;
  - danh sách rỗng: exit 1 với mã ổn định; stdin không phải JSON: exit 2;
  - link có token, password hoặc JWT: kết quả chứa `[REDACTED]` và không chứa giá trị.

  (tự động)
- AC-004 - `--help`, `-h` và `help`: exit 0 mà không cần `--root`; liệt kê đủ mọi lệnh trong `COMMANDS`, mỗi lệnh có synopsis. Thông báo `COMMAND_UNKNOWN` nhắc `--help`. CLI vẫn không ghi file, không spawn process, không mở mạng với lệnh mới. (tự động)
- AC-005 - Flow-contract test:
  - G1 Evidence nhắc `check sources -`, G8 yêu cầu in `result.table` của `check sources`;
  - danh sách lệnh trong `task-breakdown.md` khớp `COMMANDS` của CLI;
  - id loại nguồn trong `source-connectors.md` khớp `SOURCE_KINDS`;
  - skill body tối đa 500 dòng.

  (tự động)
- AC-006 - Người dùng chạy session tương tác (plugin local, `--permission-mode manual`, không ghi tracker) với ít nhất một link không đọc được. Transcript cho thấy `check sources -` được chạy và bảng hướng dẫn hiện ở G1 và G8; task ghi rõ nguồn thiếu; không có lệnh ghi tracker. Kết quả AC-002 của `product-task-breakdown-mode-v1` được ghi vào live-run doc, kể cả khi fail. (kiểm tay)
- AC-007 - `npm run check:skills`, `npm run test:e2e:repository` và evidence test xanh trên Node 22.22.3. Continuation mới hợp lệ; record mirror-refs verify như history; vẫn 23 public skill; CHANGELOG có entry Unreleased. (tự động)

## Risks & mitigations
- **Risk:** model chọn sai `kind`. → **Mitigation:** có id `unknown` với hướng dẫn chung; bảng vẫn liệt kê link để người dùng tự chọn cách xử lý.
- **Risk:** hướng dẫn trong helper lệch với bảng trong `source-connectors.md`. → **Mitigation:** AC-005 khoá id loại giữa hai nơi; nội dung hướng dẫn chỉ sửa ở helper và ref cùng một change.
- **Risk:** link có token lọt vào bảng. → **Mitigation:** redact bằng helper có sẵn trước khi nhóm; AC-003 kiểm.
- **Risk:** model vẫn không in bảng. → **Mitigation:** A-001; AC-006 ghi kết quả thật; nếu fail thì mở change sau.

## Out of scope (deferred)
- Kiểm phần đọc lại sau khi ghi (AC-011 của `product-task-breakdown-mode-v1`). Để lại tới khi người dùng cho phép ghi lên một ticket thử.
- Tự đoán loại nguồn từ domain đã cấu hình trong `project.md`. Để lại tới khi có nhu cầu thật.

## Decisions captured during review
- (approved as drafted) Người dùng trả lời `1` tại gate duyệt spec ngày 2026-10-17.
- Duyệt spec cũng xác nhận D-001, D-003, D-004 (chốt trong spec) và các mặc định governance của A-002.

## Skill provenance
sdcorejs-spec (approved on attempt 1 / 3)
