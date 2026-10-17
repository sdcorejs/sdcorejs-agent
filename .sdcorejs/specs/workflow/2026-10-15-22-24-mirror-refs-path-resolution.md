---
acceptance_criteria_count: 8
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-10-16T10:40:40.785Z
approved_by: user
approved_draft_fingerprint: sha256:20d979a0c8ce98075d3ea0a04acaae0afd84ee53947b7ce0d6f959fc6fd9e8e9
artifact_id: spec-mirror-refs-path-resolution-v1-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: mirror-refs-path-resolution-v1
commit_policy: with-change
contract_id: mirror-refs-path-resolution-v1
description: Make generated plugin and .claude skill mirrors resolve _refs/ paths (../../_refs/ plus a header rule) and inject absolute ref paths in the session-start bootstrap.
manual_criteria_count: 1
name: mirror-refs-path-resolution
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-10-15-22-24-mirror-refs-path-resolution.md
requirement_id: mirror-refs-path-resolution
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-10-15-22-24-mirror-refs-path-resolution-spec.md
source_plan: none
source_revision: 940fc0c3cf6b096cbd289771d92bc2a1556b8303
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:09775becf439220719f7bb8ddbe4dd2111dfe0865269e68a4fcfa9412f2aebfc
---
# Tìm `_refs/` đúng trong mirror plugin và .claude — Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract

# Spec - Tìm `_refs/` đúng trong mirror plugin và .claude - 2026-10-15 22:24

```yaml
spec_context:
  source: sdcorejs-spec
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Mirror plugin/ và .claude/ của mọi skill viết mỗi tham chiếu `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` tính từ SKILL.md và có một dòng path-resolution ở header; chỉ viết lại khi `_refs/` đi ngay trước một đoạn đường dẫn.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: Hook session-start chèn bootstrap với đường dẫn tuyệt đối `<pluginRoot>/_refs/...` ở mọi nhánh adapter, vì nội dung chèn vào không kèm thư mục gốc.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: "Không đổi: skill nguồn trong skills/** và cách viết `_refs/` của chúng, mirror codex, AGENTS.md và các file sinh từ nó, ngân sách byte của bootstrap."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: "Có test xác định: mọi tham chiếu cụ thể trong mirror plugin/.claude trỏ tới file có thật; tham chiếu dạng mẫu giữ đúng tiền tố; check:skills phát hiện mirror lệch."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: "Chạy thật trong session tương tác của Claude Code với plugin local: ref của mode task-breakdown nạp được ngay lần đầu, và kiểm lại AC-002, AC-004, AC-011, AC-016 của product-task-breakdown-mode-v1; ghi kết quả thật."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: "Governance: record evidence continuation riêng (record task-breakdown thành history tại 940fc0c), mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, 23 public skill, không thêm dependency, không bump version, không push."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Chạy npm run sync:skills rồi đọc plugin/skills/*/SKILL.md và .claude/skills/*/SKILL.md -> Mọi `_refs/` đi trước một đoạn đường dẫn đều có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn
        behavior: Chạy npm run sync:skills rồi đọc plugin/skills/*/SKILL.md và .claude/skills/*/SKILL.md
        expected_result: Mọi `_refs/` đi trước một đoạn đường dẫn đều có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: Resolve từng tham chiếu cụ thể (không chứa `<`, `*`, `{`) trong mirror plugin/.claude từ thư mục của SKILL.md đó -> Mọi tham chiếu trỏ tới file có thật
        behavior: Resolve từng tham chiếu cụ thể (không chứa `<`, `*`, `{`) trong mirror plugin/.claude từ thư mục của SKILL.md đó
        expected_result: Mọi tham chiếu trỏ tới file có thật
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-004
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Đọc header và các câu nhắc `_refs/` không kèm đường dẫn trong mirror plugin/.claude -> Mỗi mirror có đúng một dòng path-resolution; câu như "chứa `_refs/`" giữ nguyên nghĩa
        behavior: Đọc header và các câu nhắc `_refs/` không kèm đường dẫn trong mirror plugin/.claude
        expected_result: Mỗi mirror có đúng một dòng path-resolution; câu như "chứa `_refs/`" giữ nguyên nghĩa
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Chạy hook session-start với từng nhánh biến môi trường adapter -> Nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại; không còn `../../_refs/`
        behavior: Chạy hook session-start với từng nhánh biến môi trường adapter
        expected_result: Nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại; không còn `../../_refs/`
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: So mirror codex, file sinh từ AGENTS.md và skill nguồn với 940fc0c; đo communication economy -> Không đổi byte nào; số đo bootstrap không đổi
        behavior: So mirror codex, file sinh từ AGENTS.md và skill nguồn với 940fc0c; đo communication economy
        expected_result: Không đổi byte nào; số đo bootstrap không đổi
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: "Mutation: mirror còn `_refs/` trần trước đường dẫn hoặc thiếu dòng header -> check:skills hoặc test báo lệch và fail"
        behavior: "Mutation: mirror còn `_refs/` trần trước đường dẫn hoặc thiếu dòng header"
        expected_result: check:skills hoặc test báo lệch và fail
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-007
        type: acceptance-criterion
        statement: Chạy session tương tác (plugin local, --permission-mode manual) với prompt của lần chạy trước -> Transcript cho thấy `../../_refs/product/task-breakdown.md` được đọc ở lần đầu; kết quả AC-002/004/011/016 của product-task-breakdown-mode-v1 được ghi vào live-run-r3
        behavior: Chạy session tương tác (plugin local, --permission-mode manual) với prompt của lần chạy trước
        expected_result: Transcript cho thấy `../../_refs/product/task-breakdown.md` được đọc ở lần đầu; kết quả AC-002/004/011/016 của product-task-breakdown-mode-v1 được ghi vào live-run-r3
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-005
        task_refs: []
      - id: AC-008
        type: acceptance-criterion
        statement: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record task-breakdown verify như history tại 940fc0c; 23 public skill; CHANGELOG có entry Unreleased
        behavior: Chạy npm run check:skills, npm run test:e2e:repository và evidence test trên Node 22.22.3
        expected_result: Tất cả xanh; continuation mới hợp lệ; record task-breakdown verify như history tại 940fc0c; 23 public skill; CHANGELOG có entry Unreleased
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: A-001
        type: assumption
        statement: Claude Code cho model thấy thư mục base của skill, và model resolve `../../_refs/...` từ thư mục đó.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - live-run-r2-2026-10-15-base-directory-line
        consequence_if_wrong: Mirror vẫn không nạp được ref; cần dòng path-resolution chỉ rõ hơn hoặc cách khác ở change sau.
        validation_method: Lần chạy thật AC-007.
        owner: adapter maintainer
        rationale: Transcript lần chạy trước có dòng "Base directory for this skill" và model đã thử đường dẫn tương đối từ đó.
        impacted_refs:
          - R-001
          - R-005
      - id: A-002
        type: assumption
        statement: "Mặc định governance: continuation riêng, mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, không bump version, không push."
        source: defaulted
        confidence: high
        status: proposed
        blocking: false
        evidence_refs:
          - brainstorming-2026-10-15-defaults
        consequence_if_wrong: Plan phải thêm hoặc bỏ task quản trị.
        validation_method: Người dùng xác nhận khi duyệt spec.
        owner: spec approver
        rationale: test:e2e:repository khoá các artifact này cho mỗi thay đổi.
        impacted_refs:
          - R-006
      - id: A-003
        type: assumption
        statement: Một số test đọc mirror plugin có thể đang so chuỗi `_refs/` trần và cần sửa theo.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - repo-test-layout
        consequence_if_wrong: Không cần sửa test nào ngoài test mới.
        validation_method: Chạy test:e2e:repository sau khi đổi mirror.
        owner: executor
        rationale: Nhiều contract test đọc nội dung mirror.
        impacted_refs:
          - R-004
          - R-006
      - id: D-001
        type: decision
        statement: "Cách sửa: Viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` trong mirror plugin/.claude kèm một dòng path-resolution ở header; hook session-start thay bằng đường dẫn tuyệt đối từ plugin root"
        question: Cách sửa
        selected_value: Viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` trong mirror plugin/.claude kèm một dòng path-resolution ở header; hook session-start thay bằng đường dẫn tuyệt đối từ plugin root
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Model bỏ qua quy tắc trừu tượng; codex đã chạy được với đường dẫn cụ thể.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - AC-001
          - AC-004
        task_refs: []
      - id: D-002
        type: decision
        statement: "Nhánh: Nhánh mới fix/mirror-refs-path-resolution từ 940fc0c"
        question: Nhánh
        selected_value: Nhánh mới fix/mirror-refs-path-resolution từ 940fc0c
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tách change; record task-breakdown thành history tại commit.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-008
        task_refs: []
      - id: D-003
        type: decision
        statement: "Phạm vi: Mirror plugin/ và .claude/ cùng hook session-start; mirror codex và file sinh từ AGENTS.md giữ nguyên"
        question: Phạm vi
        selected_value: Mirror plugin/ và .claude/ cùng hook session-start; mirror codex và file sinh từ AGENTS.md giữ nguyên
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Cursor và Copilot CLI cũng nạp từ plugin/.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - R-003
          - AC-005
        task_refs: []
      - id: D-004
        type: decision
        statement: "Chạy thật: Task cuối của change này, session tương tác do người dùng chạy ở chế độ manual"
        question: Chạy thật
        selected_value: Task cuối của change này, session tương tác do người dùng chạy ở chế độ manual
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Headless làm méo cổng nhiều lượt.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-007
        task_refs: []
      - id: D-005
        type: decision
        statement: "Cách viết test: TDD: test RED trước cho phần viết lại đường dẫn và phần thay đường dẫn của hook"
        question: Cách viết test
        selected_value: "TDD: test RED trước cho phần viết lại đường dẫn và phần thay đường dẫn của hook"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Logic xác định được.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-002
          - AC-006
        task_refs: []
      - id: D-006
        type: decision
        statement: "Quy tắc viết lại: Chỉ viết lại `_refs/` khi theo sau là ký tự đường dẫn (chữ, số, `<`, `{`, `*`); dạng mẫu giữ tiền tố và không bắt buộc resolve"
        question: Quy tắc viết lại
        selected_value: Chỉ viết lại `_refs/` khi theo sau là ký tự đường dẫn (chữ, số, `<`, `{`, `*`); dạng mẫu giữ tiền tố và không bắt buộc resolve
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tránh đổi nghĩa câu như "chứa `_refs/`" trong skill product.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-004
          - AC-003
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
      - code: AC_PLAN_COVERAGE_MISSING
        path: records.AC-008.task_refs
        record_id: AC-008
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
  architecture_gate:
    valid: true
    required: false
    status: not-applicable
    signals: []
    bypass:
      kind: bounded-bug-fix
      rationale: Script sinh mirror và hook session-start tạo đường dẫn `_refs/` không resolve được trong layout plugin; sửa trong hai điểm đó, không thêm hay đổi contract, owner, boundary hay dependency nào.
    rationale: Script sinh mirror và hook session-start tạo đường dẫn `_refs/` không resolve được trong layout plugin; sửa trong hai điểm đó, không thêm hay đổi contract, owner, boundary hay dependency nào.
  contract_id: mirror-refs-path-resolution-v1
  requirement_id: mirror-refs-path-resolution
  approved_spec_path: ""
  approved_spec_hash: ""
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: portal-sales-platform
  track: workflow
  stack_profile: markdown-skill-pack
  profile_confidence: high
  source_requirement_context: sdcorejs-brainstorming 2026-10-15 (hướng 1; 1-1, 2-1, 3-1, 4-1)
  acceptance_criteria_count: 8
  manual_criteria_count: 1
  non_goals:
    - Đổi cách viết `_refs/` trong skill nguồn
    - Sửa mirror codex
    - Sửa AGENTS.md, .cursor/rules, .github/copilot-instructions.md
    - Bump version plugin
    - Push hoặc tạo PR
  risks:
    - Viết lại nhầm câu nhắc `_refs/` không kèm đường dẫn
    - Tham chiếu dạng mẫu không resolve được
    - Test đọc mirror đang so chuỗi `_refs/` trần
    - Model vẫn không dùng đường dẫn tương đối dù đã cụ thể
  assumptions:
    - A-001
    - A-002
    - A-003
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
Skill trong mirror `plugin/` và `.claude/` tham chiếu tài liệu bằng đường dẫn trần `_refs/...`: 479 chỗ trong 23 file `SKILL.md` của plugin. Thư mục `_refs/` thật lại nằm ở `../../_refs/` tính từ thư mục của skill, và mirror không có quy tắc nào nói cách resolve.

Lần chạy thật ngày 2026-10-15 (`.sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md`) cho thấy hậu quả: model tìm `_refs/` ngay dưới thư mục skill, nhận "file không tồn tại", rồi chạy mà không có ref của mode. Hook `session-start` còn chèn nguyên bootstrap `sdcorejs-using-skills` vào đầu session mà không kèm thư mục gốc nào. Mirror codex không gặp lỗi này, vì `rewriteRefs()` viết lại thành `../_refs/` và thêm một dòng "Codex path resolution".

Mục tiêu:
- Mọi skill nạp được ref của nó trong layout plugin và `.claude`.
- Skill nguồn giữ trung lập provider.
- Mirror vẫn do script sinh ra.
- Có test xác định.
- Chạy thật lại mode task-breakdown để kiểm 4 AC kiểm tay còn để ngỏ của change trước.

Người dùng: maintainer skill pack và mọi người dùng plugin trên Claude Code, Cursor và Copilot CLI, vì cả ba đều nạp skill từ `plugin/`.

## Requirements
- R-001 - Mirror `plugin/` và `.claude/` của mọi skill viết mỗi tham chiếu `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` tính từ `SKILL.md`, và có một dòng path-resolution ở header. Chỉ viết lại khi `_refs/` đi ngay trước một đoạn đường dẫn. Nguồn: người dùng; trạng thái active; owner `github.com/sdcorejs/sdcorejs-agent`.
- R-002 - Hook `session-start` chèn bootstrap với đường dẫn tuyệt đối `<pluginRoot>/_refs/...` ở mọi nhánh adapter, vì nội dung chèn vào không kèm thư mục gốc. Nguồn: người dùng; active.
- R-003 - Giữ nguyên: skill nguồn trong `skills/**` và cách viết `_refs/` của chúng, mirror codex, `AGENTS.md` cùng các file sinh từ nó, và ngân sách byte của bootstrap. Nguồn: người dùng; active.
- R-004 - Có test xác định cho ba điểm: mọi tham chiếu cụ thể trong mirror plugin/`.claude` trỏ tới file có thật; tham chiếu dạng mẫu giữ đúng tiền tố; `check:skills` phát hiện mirror lệch. Nguồn: người dùng; active.
- R-005 - Chạy thật trong session tương tác của Claude Code với plugin local: ref của mode task-breakdown phải nạp được ngay lần đầu; kiểm lại AC-002, AC-004, AC-011, AC-016 của `product-task-breakdown-mode-v1`; ghi kết quả thật. Nguồn: người dùng; active.
- R-006 - Governance:
  - record evidence continuation riêng, trong đó record task-breakdown thành history tại `940fc0c`;
  - mục VALIDATION.md; summary refresh nếu stale; CHANGELOG Unreleased;
  - giữ 23 public skill, không thêm dependency, không bump version, không push.

  Nguồn: người dùng; active.

## Decisions
- D-001 - Cách sửa: viết lại `_refs/<đường dẫn>` thành `../../_refs/<đường dẫn>` trong mirror plugin/`.claude`, kèm một dòng path-resolution ở header; hook `session-start` thay bằng đường dẫn tuyệt đối từ plugin root. Nguồn: người dùng chọn hướng 1; approved; phạm vi repository. Lý do: model bỏ qua quy tắc trừu tượng, còn codex đã chạy được với đường dẫn cụ thể.
- D-002 - Nhánh: nhánh mới `fix/mirror-refs-path-resolution`, tạo từ `940fc0c` (đã tạo). Nguồn: người dùng `1-1`; approved.
- D-003 - Phạm vi: mirror `plugin/` và `.claude/` cùng hook `session-start`; mirror codex và các file sinh từ `AGENTS.md` giữ nguyên. Nguồn: người dùng `2-1`; approved.
- D-004 - Chạy thật: là task cuối của change này; người dùng chạy session tương tác ở chế độ `manual`. Nguồn: người dùng `3-1`; approved.
- D-005 - Cách viết test: TDD, viết test RED trước cho phần viết lại đường dẫn và phần thay đường dẫn của hook. Nguồn: người dùng `4-1`; approved.
- D-006 - Quy tắc viết lại:
  - chỉ viết lại `_refs/` khi theo sau là ký tự đường dẫn (chữ, số, `<`, `{`, `*`);
  - dạng mẫu giữ tiền tố và không bắt buộc resolve.

  Nguồn: chốt trong spec này, có hiệu lực khi spec được duyệt. Lý do: tránh đổi nghĩa những câu như "chứa `_refs/`" trong skill product.

## Assumptions
- A-001 - Claude Code cho model thấy thư mục base của skill, và model resolve `../../_refs/...` từ thư mục đó.
  - Suy ra, độ tin cậy trung bình, proposed, không chặn.
  - Bằng chứng: transcript lần chạy trước có dòng "Base directory for this skill".
  - Nếu sai: mirror vẫn không nạp được ref.
  - Kiểm bằng AC-007; owner là maintainer adapter.
- A-002 - Mặc định governance: continuation riêng, mục VALIDATION.md, summary refresh nếu stale, CHANGELOG Unreleased, không bump version, không push.
  - Mặc định, độ tin cậy cao, proposed, không chặn.
  - Xác nhận khi duyệt spec.
- A-003 - Một số test đọc mirror plugin có thể đang so chuỗi `_refs/` trần và cần sửa theo.
  - Suy ra, độ tin cậy trung bình, proposed, không chặn.
  - Các file có thể bị ảnh hưởng: `harness-behavioral-sentinel`, `npm-publication-contract`, `production-readiness-contract`, `simplify-skill-contract`, `skill-authoring-contract`.
  - Kiểm bằng `test:e2e:repository`.

## Architecture gate classification
- Status: not-applicable.
- Signals: không có.
- Bypass: `bounded-bug-fix`. Script sinh mirror và hook `session-start` tạo ra đường dẫn `_refs/` không resolve được trong layout plugin. Bản sửa nằm gọn trong hai điểm đó, không thêm hay đổi contract, owner, boundary hay dependency nào.

## Non-goals
- Đổi cách viết `_refs/` trong skill nguồn.
- Sửa mirror codex.
- Sửa `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc`, `.github/copilot-instructions.md`.
- Bump version plugin.
- Push hoặc tạo PR.

## Architecture
- **`scripts/sync-skills.mjs`:** `toClaudeSkill()` thêm bước viết lại cho adapter Claude (plugin và `.claude`).
  - `_refs/` đi trước ký tự đường dẫn thành `../../_refs/`.
  - Chuỗi đã có tiền tố `../` được chuẩn hoá về đúng `../../`.
  - Header comment có thêm dòng "Path resolution: resolve `../../_refs/...` relative to this `SKILL.md`".
  - `rewriteRefs()` và `toCodexSkill()` của codex giữ nguyên.
- **`check:skills`:** dùng cùng hàm sinh, nên mirror lệch sẽ bị phát hiện như hiện nay.
- **`plugin/hooks/session-start.mjs`:** khi đọc bootstrap, thay `../../_refs/` bằng `<pluginRoot>/_refs/` (đường dẫn tuyệt đối, dùng dấu `/`) trước khi chèn.
  - Áp dụng cho cả bốn nhánh output (Cursor, Claude, Copilot, mặc định).
  - Nếu đọc lỗi, giữ thông báo lỗi như cũ.
- **Test mới** kiểm:
  - mọi tham chiếu cụ thể trong 23×2 mirror resolve được;
  - dạng mẫu giữ tiền tố;
  - header có đúng một dòng;
  - câu nhắc `_refs/` không kèm đường dẫn giữ nguyên;
  - hook chèn đường dẫn tuyệt đối tồn tại cho từng nhánh;
  - mirror codex và skill nguồn không đổi.

## Stack profile and technology assumptions
- Track: `workflow`.
- Stack profile: `markdown-skill-pack`, với script Node ESM.
- Profile evidence: `package.json` (`type: module`, `packageManager npm@10.9.2`), `scripts/sync-skills.mjs`, các suite `node --test` trong `test/e2e`.
- Technology assumptions: Node 22.22.3 theo `engines` (đã kiểm); không thêm dependency.

## File structure
- `scripts/sync-skills.mjs` - sửa: viết lại `_refs/` cho adapter Claude, thêm dòng path-resolution ở header.
- `plugin/hooks/session-start.mjs` - sửa: thay bằng đường dẫn tuyệt đối khi chèn bootstrap.
- `test/e2e/mirror-refs-resolution.test.mjs` - tạo: test RED trước cho R-001, R-002, R-003, R-004.
- `plugin/skills/*/SKILL.md`, `.claude/skills/*/SKILL.md` - sinh lại bằng `npm run sync:skills`.
- Các test đọc mirror có so chuỗi `_refs/` trần - sửa theo nếu có (A-003).
- `package.json` - chỉ sửa scripts: thêm test mới vào `test:e2e:repository`.
- `CHANGELOG.md`, `VALIDATION.md`, `.sdcorejs/summary.md` - artifact quản trị.
- `authoring/evals/uiux/evidence.test.mjs`, `authoring/evals/mirror-refs-path-resolution.json` - evidence continuation; record task-breakdown thành history tại `940fc0c`.
- `.sdcorejs/docs/workflow/*-mirror-refs-path-resolution-*.md` - delivery và live-run.

## Acceptance criteria
- AC-001 - Sau `npm run sync:skills`, mọi `_refs/` đi trước một đoạn đường dẫn trong `plugin/skills/*/SKILL.md` và `.claude/skills/*/SKILL.md` có dạng `../../_refs/`; không còn `_refs/` trần đi trước đường dẫn. (tự động)
- AC-002 - Mọi tham chiếu cụ thể (không chứa `<`, `*`, `{`) trong mirror plugin/`.claude` resolve được tới file có thật, tính từ thư mục của `SKILL.md` đó. (tự động)
- AC-003 - Mỗi mirror plugin/`.claude` có đúng một dòng path-resolution ở header; những câu nhắc `_refs/` không kèm đường dẫn (như "chứa `_refs/`") giữ nguyên nghĩa. (tự động)
- AC-004 - Chạy hook `session-start` với từng nhánh biến môi trường adapter: nội dung chèn vào chứa `<pluginRoot>/_refs/...` tuyệt đối và tồn tại, không còn `../../_refs/`. (tự động)
- AC-005 - So với `940fc0c`, mirror codex, các file sinh từ `AGENTS.md` và skill nguồn không đổi byte nào; số đo bootstrap của communication economy không đổi. (tự động)
- AC-006 - Mutation: nếu mirror còn `_refs/` trần trước đường dẫn, hoặc thiếu dòng header, thì `check:skills` hoặc test phải báo lệch và fail. (tự động)
- AC-007 - Người dùng chạy session tương tác (plugin local, `--permission-mode manual`) với prompt của lần chạy trước. Transcript phải cho thấy `../../_refs/product/task-breakdown.md` được đọc ngay lần đầu. Kết quả AC-002, AC-004, AC-011, AC-016 của `product-task-breakdown-mode-v1` được ghi vào live-run-r3, kể cả khi fail. (kiểm tay)
- AC-008 - `npm run check:skills`, `npm run test:e2e:repository` và evidence test xanh trên Node 22.22.3. Continuation mới hợp lệ; record task-breakdown verify như history tại `940fc0c`; vẫn 23 public skill; CHANGELOG có entry Unreleased. (tự động)

## Risks & mitigations
- **Risk:** viết lại nhầm câu nhắc `_refs/` không kèm đường dẫn. → **Mitigation:** D-006 chỉ viết lại khi theo sau là ký tự đường dẫn; AC-003 kiểm câu trong skill product.
- **Risk:** tham chiếu dạng mẫu (`_refs/sdlc/<track>.md`, glob) không resolve được. → **Mitigation:** test chỉ bắt buộc resolve với tham chiếu cụ thể; dạng mẫu chỉ kiểm tiền tố.
- **Risk:** test đọc mirror đang so chuỗi trần. → **Mitigation:** A-003; chạy full suite, sửa test theo trong phạm vi plan.
- **Risk:** model vẫn không dùng đường dẫn tương đối dù đã cụ thể. → **Mitigation:** AC-007 ghi kết quả thật; nếu fail thì mở change sau với dòng path-resolution rõ hơn.
- **Risk:** đường dẫn tuyệt đối trong hook lộ cấu trúc thư mục máy người dùng. → **Mitigation:** chỉ là đường dẫn plugin trong context của session, không ghi ra file.

## Out of scope (deferred)
- Đổi cách viết `_refs/` trong mirror codex. Để lại tới khi có bằng chứng codex gặp lỗi.
- Dùng biến đường dẫn do host thay thế. Để lại tới khi host có hỗ trợ được tài liệu hoá cho nội dung skill.

## Decisions captured during review
- (approved as drafted) Người dùng trả lời `1` tại gate duyệt spec ngày 2026-10-16.
- Duyệt spec cũng xác nhận D-006 (quy tắc viết lại) và các mặc định governance của A-002.
- Duyệt lại ngày 2026-10-16 (người dùng trả lời `1`): commit nền chưa publish được viết lại để bỏ tên người thật và key ticket nội bộ khỏi fixture public; base mới là `940fc0c`. Nội dung spec chỉ đổi các tham chiếu tới commit nền.

## Skill provenance
sdcorejs-spec (approved on attempt 1 / 3)
