---
acceptance_criteria_count: 6
approval_gate: sdcorejs-spec:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-10-17T10:37:03.515Z
approved_by: user
approved_draft_fingerprint: sha256:567ed8e5f52fcbb17102b4d7b77fa6a99aec5de785b5b7e253218e1277beaf9e
artifact_id: spec-task-breakdown-main-port-v1-r1
artifact_kind: spec
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: task-breakdown-main-port-v1
commit_policy: with-change
contract_id: task-breakdown-main-port-v1
description: Port the approved task-breakdown mode, mirror _refs resolution and source guidance changes onto main without the unmerged base branch.
manual_criteria_count: 0
name: task-breakdown-main-port
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-10-17-17-34-task-breakdown-main-port.md
requirement_id: task-breakdown-main-port
schema_version: 1
sourceDraftPath: .sdcorejs/docs/workflow/2026-10-17-17-34-task-breakdown-main-port-spec.md
source_plan: none
source_revision: fb64f8c2905cd79c6027e02ea847560cc09c8b42
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:12df2742aa9df5d73c12f797a52c72f842eef0f90c95ff5577719493d88e1486
---
# Port mode task-breakdown, sửa mirror _refs và hướng dẫn nguồn lên main — Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract

# Spec - Port mode task-breakdown, sửa mirror _refs và hướng dẫn nguồn lên main - 2026-10-17 17:34

```yaml
spec_context:
  source: sdcorejs-spec
  decision_coverage:
    schema_version: 1
    revision: 1
    records:
      - id: R-001
        type: requirement
        statement: Port hành vi đã duyệt của product-task-breakdown-mode-v1 (cổng G0..G8, check CLI chỉ đọc, helper _refs/product/task-breakdown/, action source.read/tracker.write, root project_workspaces, artifact kind project-config và task-breakdown, route và lifecycle), không thêm hay bớt hành vi.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-002
        type: requirement
        statement: "Port mirror-refs-path-resolution-v1: script sinh mirror viết ../../_refs/ và dòng path-resolution cho plugin và .claude, hook session-start chèn đường dẫn tuyệt đối, test đi kèm, áp dụng cho mọi skill hiện có trên main."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-003
        type: requirement
        statement: "Port task-breakdown-source-guidance-v1: check sources -, help của CLI, câu chữ G1/G8 và bảng loại nguồn, case-mirror-refs-unchanged dạng kiểm thuộc tính."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-004
        type: requirement
        statement: Từ nhánh nền chỉ mang sang parseApprovedFrontmatter; không mang observeChoiceTools, nhánh user.choose/user.approve của resolveAction, test case-repair-policy-ask-native, hay record, spec, contract, skill nào khác của nhánh nền.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-005
        type: requirement
        statement: Mỗi file thuộc 3 change (không tính mirror sinh ra và .sdcorejs/**) giống từng byte với f19c72c, trừ danh sách điều chỉnh plan khai báo kèm lý do; có lệnh kiểm tự động và kết quả ghi vào delivery doc.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-006
        type: requirement
        statement: "Governance trên main: evidence continuation mới nối vào chuỗi của main, mục VALIDATION.md, refresh summary nếu stale, 3 entry CHANGELOG Unreleased, 23 public skill, không dependency, không bump version; không mang artifact .sdcorejs cũ của 3 change."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: R-007
        type: requirement
        statement: "Giao hàng: một nhánh mới từ main, một PR vào main không xung đột; quét diff không còn tên người, key ticket hay domain nội bộ."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs: []
      - id: AC-001
        type: acceptance-criterion
        statement: Chạy lệnh kiểm parity so 42 file của 3 change với f19c72c -> Mọi file giống từng byte, trừ đúng danh sách điều chỉnh của plan, mỗi điều chỉnh có lý do
        behavior: Chạy lệnh kiểm parity so 42 file của 3 change với f19c72c
        expected_result: Mọi file giống từng byte, trừ đúng danh sách điều chỉnh của plan, mỗi điều chỉnh có lý do
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-002
          - R-003
          - R-005
        task_refs: []
      - id: AC-002
        type: acceptance-criterion
        statement: git grep trên nhánh port các symbol, test và record của nhánh nền; so parseApprovedFrontmatter với 4703643 -> Không có observeChoiceTools, nhánh user.choose của resolveAction, case-repair-policy-ask-native hay record của nhánh nền; parseApprovedFrontmatter có mặt và giống bản ở 4703643
        behavior: git grep trên nhánh port các symbol, test và record của nhánh nền; so parseApprovedFrontmatter với 4703643
        expected_result: Không có observeChoiceTools, nhánh user.choose của resolveAction, case-repair-policy-ask-native hay record của nhánh nền; parseApprovedFrontmatter có mặt và giống bản ở 4703643
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs: []
      - id: AC-003
        type: acceptance-criterion
        statement: Chạy các suite của 3 change trên base mới -> 3 suite task-breakdown, mirror-refs-resolution, harness-behavioral-sentinel, artifact-path-convention, skill-pack-runner, production-readiness-contract đều pass
        behavior: Chạy các suite của 3 change trên base mới
        expected_result: 3 suite task-breakdown, mirror-refs-resolution, harness-behavioral-sentinel, artifact-path-convention, skill-pack-runner, production-readiness-contract đều pass
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
          - R-002
          - R-003
        task_refs: []
      - id: AC-004
        type: acceptance-criterion
        statement: Đọc mirror plugin và .claude của mọi skill trên main sau npm run sync:skills -> Mọi tham chiếu _refs/ có dạng ../../_refs/ và có dòng path-resolution; check:skills in sync
        behavior: Đọc mirror plugin và .claude của mọi skill trên main sau npm run sync:skills
        expected_result: Mọi tham chiếu _refs/ có dạng ../../_refs/ và có dòng path-resolution; check:skills in sync
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs: []
      - id: AC-005
        type: acceptance-criterion
        statement: Chạy check:skills, check:text-hygiene, check:executable-references, test:e2e:repository và evidence test trên Node 22.22.3 -> Tất cả xanh; continuation mới hợp lệ; record của main verify không đổi; 23 public skill; CHANGELOG có 3 entry
        behavior: Chạy check:skills, check:text-hygiene, check:executable-references, test:e2e:repository và evidence test trên Node 22.22.3
        expected_result: Tất cả xanh; continuation mới hợp lệ; record của main verify không đổi; 23 public skill; CHANGELOG có 3 entry
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs: []
      - id: AC-006
        type: acceptance-criterion
        statement: Tạo PR vào main và quét diff của nhánh port -> PR mergeable; quét diff không còn tên người, key ticket hay domain nội bộ
        behavior: Tạo PR vào main và quét diff của nhánh port
        expected_result: PR mergeable; quét diff không còn tên người, key ticket hay domain nội bộ
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs: []
      - id: A-001
        type: assumption
        statement: Mode chạy đúng trên main vì mọi khái niệm skill và ref dùng tới đều đã có trên main (user.choose/user.approve, read-only-request, write_policy, resolveArtifactOwner, parallel-dispatch).
        source: inferred
        confidence: high
        status: proposed
        blocking: false
        evidence_refs:
          - port-trial-2026-10-17-cherry-pick-and-git-grep
        consequence_if_wrong: Test của change fail trên base mới.
        validation_method: AC-003 và AC-005.
        owner: executor
        rationale: Lần thử cherry-pick chỉ ra một phụ thuộc là parseApprovedFrontmatter; git grep thấy các khái niệm còn lại trên main.
        impacted_refs:
          - R-001
          - R-003
      - id: A-002
        type: assumption
        statement: Test do main thêm sau base cũ có thể kiểm thêm điều kiện lên file mới.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - main-20-commits-since-ac820d7
        consequence_if_wrong: Không cần điều chỉnh thêm.
        validation_method: Full suite.
        owner: executor
        rationale: main đã có cleanup workflow và gộp hướng dẫn agent kèm test mới.
        impacted_refs:
          - R-005
          - R-006
      - id: A-003
        type: assumption
        statement: Mặc định governance như R-006.
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
          - R-006
      - id: D-001
        type: decision
        statement: "Hướng xử lý: Tách 3 change khỏi nhánh codex/simplify-design-handoff và port lên main"
        question: Hướng xử lý
        selected_value: Tách 3 change khỏi nhánh codex/simplify-design-handoff và port lên main
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Nhánh nền từ tháng 9 chưa từng có PR; người dùng chọn tách.
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
        task_refs: []
      - id: D-002
        type: decision
        statement: "Nhánh và commit: Nhánh feat/task-breakdown-mode-main từ origin/main (fb64f8c), một commit feat(product)"
        question: Nhánh và commit
        selected_value: Nhánh feat/task-breakdown-mode-main từ origin/main (fb64f8c), một commit feat(product)
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Một đơn vị review và một evidence continuation gắn với đúng nội dung được merge.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-007
          - AC-006
        task_refs: []
      - id: D-003
        type: decision
        statement: "Chạy thật: Không chạy lại khi file skill, ref và CLI giống từng byte với f19c72c"
        question: Chạy thật
        selected_value: Không chạy lại khi file skill, ref và CLI giống từng byte với f19c72c
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Kết quả lần chạy thứ ba và thứ tư vẫn áp dụng cho nội dung giống hệt.
        supersedes: null
        revisit_condition: Một điều chỉnh chạm vào file skill, ref hoặc CLI của mode.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-001
        task_refs: []
      - id: D-004
        type: decision
        statement: "Artifact cũ: Không mang .sdcorejs/** của 3 change; nguồn gốc ghi bằng PR #78, #79, #80 và commit f19c72c"
        question: Artifact cũ
        selected_value: "Không mang .sdcorejs/** của 3 change; nguồn gốc ghi bằng PR #78, #79, #80 và commit f19c72c"
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Các artifact đó gắn với revision không có trong lịch sử main.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
        task_refs: []
      - id: D-005
        type: decision
        statement: "Architecture: Gate bắt buộc, kế thừa 4 signal; architecture của port nhắc lại quyết định và invariant đã duyệt trên base main và thêm invariant về phụ thuộc tối thiểu"
        question: Architecture
        selected_value: Gate bắt buộc, kế thừa 4 signal; architecture của port nhắc lại quyết định và invariant đã duyệt trên base main và thêm invariant về phụ thuộc tối thiểu
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Port đưa lên main đúng các contract dùng chung đã cần architecture.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-004
        task_refs: []
      - id: D-006
        type: decision
        statement: "PR cũ: Chỉ đóng #78, #79, #80 sau khi PR mới tạo và người dùng xác nhận riêng; comment dẫn sang PR mới; giữ các nhánh trên remote"
        question: PR cũ
        selected_value: "Chỉ đóng #78, #79, #80 sau khi PR mới tạo và người dùng xác nhận riêng; comment dẫn sang PR mới; giữ các nhánh trên remote"
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Đóng PR là thao tác ra ngoài, cần xác nhận riêng.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-007
        task_refs: []
      - id: D-007
        type: decision
        statement: "Cách kiểm: Dùng lại test của 3 change; parity và không mang thừa là lệnh kiểm một lần ghi vào delivery doc, không thêm vào suite"
        question: Cách kiểm
        selected_value: Dùng lại test của 3 change; parity và không mang thừa là lệnh kiểm một lần ghi vào delivery doc, không thêm vào suite
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Không tạo lại test so với base cố định.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - R-005
          - AC-001
          - AC-002
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
          - id: D-007
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
    required: true
    status: required
    signals:
      - persisted-data-model-contract
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: "Port đưa lên main đúng các contract của change product: action source.read/tracker.write dùng chung cho mọi adapter, artifact root và schema config persist trong repo đích, đường ghi ra tracker; architecture đã duyệt trước đây gắn với revision ngoài lịch sử main."
  contract_id: task-breakdown-main-port-v1
  requirement_id: task-breakdown-main-port
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
  source_requirement_context: "Người dùng chọn tách 3 change (#78, #79, #80) khỏi nhánh codex/simplify-design-handoff và port lên main, 2026-10-17; dựa trên lần thử cherry-pick lên main."
  acceptance_criteria_count: 6
  manual_criteria_count: 0
  non_goals:
    - Đưa nhánh codex/simplify-design-handoff vào main
    - Thêm, bớt hoặc sửa hành vi của 3 change
    - Chạy thật lại, trừ điều kiện của D-003
    - Ghi tracker
    - Bump version, thêm dependency
    - Tự đóng PR cũ khi chưa có xác nhận
  risks:
    - Test của main kiểm thêm điều kiện lên file mới
    - Điều chỉnh âm thầm làm đổi hành vi
    - Nhánh nền vào main sau này sẽ xung đột nhỏ
    - Lộ thông tin nội bộ trong repo public
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
Ba change đã duyệt và đã có PR được dựng nối tiếp nhau:
- `product-task-breakdown-mode-v1` (#78): mode task-breakdown của `sdcorejs-product`;
- `mirror-refs-path-resolution-v1` (#79): sửa đường dẫn `_refs/` trong mirror plugin và `.claude`;
- `task-breakdown-source-guidance-v1` (#80): hướng dẫn cho nguồn chưa đọc được, cùng help của check CLI.

Cả ba nằm trên nhánh `codex/simplify-design-handoff`. Nhánh này có 5 commit từ tháng 9 và chưa từng có PR. `main` đã có thêm 20 commit, nên #78 xung đột với `main` ở 25 file, trong đó 23 file đến từ nhánh nền.

Lần thử cherry-pick lên `main` cho thấy code của 3 change phụ thuộc rất ít vào nhánh nền:
- chỉ cần hàm `parseApprovedFrontmatter` trong `_refs/shared/approved-artifact.mjs`;
- phần còn lại của nhánh nền chỉ nằm cạnh code của change, không được change gọi tới.

Người dùng chọn tách 3 change khỏi nhánh nền và port lên `main`.

Mục tiêu:
- Hành vi đã duyệt của 3 change có mặt trên `main` qua một PR không xung đột.
- Không kéo theo phần nào khác của nhánh nền.
- Có kiểm chứng rằng nội dung giữ nguyên.
- Chuỗi evidence nối vào chuỗi của `main`.

Người dùng: maintainer skill pack và người dùng mode task-breakdown.

## Requirements
- R-001 - Port hành vi đã duyệt của `product-task-breakdown-mode-v1`, không thêm hay bớt hành vi:
  - cổng G0..G8 và check CLI chỉ đọc;
  - helper trong `_refs/product/task-breakdown/`;
  - action `source.read` và `tracker.write` trong capability contract;
  - root `project_workspaces` và artifact kind `project-config`, `task-breakdown`;
  - route và lifecycle liên quan.

  Nguồn: người dùng; active; owner `github.com/sdcorejs/sdcorejs-agent`.
- R-002 - Port `mirror-refs-path-resolution-v1`:
  - script sinh mirror viết `../../_refs/` và thêm dòng path-resolution vào mirror plugin và `.claude`;
  - hook session-start chèn đường dẫn tuyệt đối;
  - test đi kèm;
  - áp dụng cho mọi skill hiện có trên `main`.

  Nguồn: người dùng; active.
- R-003 - Port `task-breakdown-source-guidance-v1`: `check sources -`; help của CLI; câu chữ G1/G8 và bảng loại nguồn; `case-mirror-refs-unchanged` dạng kiểm thuộc tính. Nguồn: người dùng; active.
- R-004 - Từ nhánh nền chỉ mang sang phụ thuộc tối thiểu là `parseApprovedFrontmatter`. Không mang sang:
  - `observeChoiceTools`, nhánh `user.choose`/`user.approve` của `resolveAction`, test `case-repair-policy-ask-native`;
  - mọi record, spec, contract hay skill khác của nhánh nền.

  Nguồn: người dùng; active.
- R-005 - Mỗi file thuộc 3 change (không tính mirror sinh ra và `.sdcorejs/**`) phải giống từng byte với commit `f19c72c`, trừ danh sách điều chỉnh mà plan khai báo, mỗi mục có lý do. Có lệnh kiểm tự động, kết quả ghi vào delivery doc. Nguồn: người dùng; active.
- R-006 - Governance trên `main`:
  - một evidence continuation mới nối vào chuỗi của `main`; mục VALIDATION.md; refresh summary nếu stale; 3 entry CHANGELOG Unreleased;
  - giữ 23 public skill; không thêm dependency, không bump version;
  - không mang artifact `.sdcorejs` cũ của 3 change sang, vì chúng gắn với revision nằm ngoài lịch sử của `main`; nguồn gốc được ghi bằng PR và commit.

  Nguồn: người dùng; active.
- R-007 - Giao hàng: một nhánh mới tạo từ `main`, một PR vào `main` không xung đột, và quét diff không còn tên người, key ticket hay domain nội bộ. Nguồn: người dùng; active.

## Decisions
- D-001 - Hướng xử lý: tách 3 change khỏi nhánh nền và port lên `main`. Nguồn: người dùng trả lời `1`; approved.
- D-002 - Nhánh và commit: nhánh `feat/task-breakdown-mode-main` tạo từ `origin/main` (`fb64f8c`), dồn vào một commit `feat(product)`. Nguồn: chốt trong spec này. Lý do: một đơn vị review, và một evidence continuation gắn với đúng nội dung được merge.
- D-003 - Chạy thật: không chạy lại. Khi file skill, ref và CLI giống từng byte với `f19c72c` (R-005), kết quả lần chạy thứ ba và thứ tư vẫn áp dụng. Nguồn: chốt trong spec này. Điều kiện xem lại: nếu một điều chỉnh chạm vào file skill, ref hoặc CLI của mode thì phải chạy thật lại.
- D-004 - Artifact cũ: không mang `.sdcorejs/**` của 3 change sang. Spec, architecture và plan của change port ghi nguồn gốc bằng PR #78, #79, #80 và commit `f19c72c`. Nguồn: chốt trong spec này. Lý do: các artifact đó gắn với revision không có trong lịch sử của `main`.
- D-005 - Architecture: gate bắt buộc, kế thừa 4 signal của change product. Architecture của change port nhắc lại các quyết định và invariant đã duyệt trên base `main`, và thêm invariant về phụ thuộc tối thiểu. Nguồn: chốt trong spec này.
- D-006 - PR cũ: chỉ đóng #78, #79, #80 sau khi PR mới đã tạo và người dùng xác nhận riêng; mỗi PR cũ có comment dẫn sang PR mới. Nhánh nền và các nhánh PR cũ giữ nguyên trên remote. Nguồn: chốt trong spec này.
- D-007 - Cách kiểm: dùng lại test của 3 change. Việc kiểm "giống từng byte" và "không mang sang phần thừa" là lệnh kiểm một lần, ghi vào delivery doc, không thêm vào suite, để không tạo lại một test so với base cố định. Nguồn: chốt trong spec này.

## Assumptions
- A-001 - Mode chạy đúng trên `main`, vì mọi khái niệm skill và ref dùng tới đều đã có trên `main`: `user.choose`/`user.approve`, `read-only-request`, `write_policy`, `resolveArtifactOwner`, parallel-dispatch.
  - Suy ra từ lần thử cherry-pick và các lệnh `git grep`; độ tin cậy cao; proposed; không chặn.
  - Nếu sai: test của change fail trên base mới.
  - Kiểm bằng AC-003 và AC-005.
- A-002 - Test do `main` thêm sau base cũ (cleanup, gộp hướng dẫn agent) có thể kiểm thêm điều kiện lên file mới.
  - Suy ra; độ tin cậy trung bình; proposed; không chặn.
  - Nếu xảy ra: điều chỉnh nằm trong danh sách khai báo của plan, hoặc lập plan revision.
  - Kiểm bằng full suite.
- A-003 - Mặc định governance như R-006.
  - Mặc định; độ tin cậy cao; proposed; không chặn.
  - Xác nhận khi duyệt spec.

## Architecture gate classification
- Status: required.
- Signals: `persisted-data-model-contract`, `public-api-contract`, `security-trust-boundary`, `state-data-ownership`, kế thừa từ change product.
- Lý do: port đưa lên `main` đúng các contract đó, gồm action dùng chung cho mọi adapter, artifact root và schema config persist trong repo đích, và đường ghi ra tracker. Architecture đã duyệt trước đây gắn với revision nằm ngoài lịch sử của `main`.

## Non-goals
- Đưa nhánh `codex/simplify-design-handoff` vào `main`.
- Thêm, bớt hoặc sửa hành vi của 3 change.
- Chạy thật lại mode, trừ khi điều kiện của D-003 xảy ra.
- Ghi tracker.
- Bump version, thêm dependency.
- Tự đóng PR cũ khi người dùng chưa xác nhận.

## Architecture
- **Nguồn:** commit `f19c72c` trên nhánh `fix/task-breakdown-source-guidance` (đỉnh của #80). Danh sách file lấy từ `git diff 4703643 f19c72c`, không tính mirror sinh ra và `.sdcorejs/**`: 42 file.
- **Cách port:**
  - chép nguyên nội dung các file đó từ `f19c72c`;
  - với file mà nhánh nền cũng sửa (`runtime-attestation.mjs`, `runtime-policy.mjs`, `harness-behavioral-sentinel.test.mjs`, `approved-artifact.mjs`), giữ bản của `main` và chỉ thêm phần của 3 change cùng `parseApprovedFrontmatter`;
  - file quản trị (`evidence.test.mjs`, VALIDATION.md, CHANGELOG, `package.json`, `.sdcorejs/summary.md`) được viết lại theo cấu trúc của `main`;
  - sinh lại mọi mirror bằng `npm run sync:skills`.
- **Kiểm:**
  - lệnh kiểm "giống từng byte" so 42 file với `f19c72c`, chỉ cho phép đúng danh sách điều chỉnh của plan;
  - lệnh `git grep` khẳng định các symbol của nhánh nền không có mặt, còn `parseApprovedFrontmatter` giống bản của nhánh nền;
  - full suite.
- **Evidence:** một continuation mới, continuation trước là record mới nhất của `main`.

## Stack profile and technology assumptions
- Track: `workflow`.
- Stack profile: `markdown-skill-pack`, với script Node ESM.
- Profile evidence: `package.json` (`type: module`, `packageManager npm@10.9.2`), các suite `node --test` trong `test/e2e`.
- Technology assumptions: Node 22.22.3 theo `engines`; không thêm dependency.

## File structure
- 42 file của 3 change: skill product, ref và helper `_refs/product/**`, `scripts/sync-skills.mjs`, `plugin/hooks/session-start.mjs`, registry, capability contract, harness, test.
- `_refs/shared/approved-artifact.mjs`: thêm `parseApprovedFrontmatter`.
- `authoring/evals/uiux/evidence.test.mjs`, record continuation mới trong `authoring/evals/`.
- `VALIDATION.md`, `CHANGELOG.md`, `package.json` (chỉ phần scripts), `.sdcorejs/summary.md`.
- Mirror trong `plugin/`, `.claude/`, `codex/`, `.cursor/`, `.github/`: sinh lại bằng script.
- `.sdcorejs/docs/workflow/*-task-breakdown-main-port-*.md`: delivery doc.

## Acceptance criteria
- AC-001 - Lệnh kiểm parity: mỗi file trong 42 file của 3 change giống từng byte với `f19c72c`, trừ đúng danh sách điều chỉnh của plan; mỗi điều chỉnh có lý do. (tự động)
- AC-002 - Trên nhánh port không có `observeChoiceTools`, nhánh `user.choose` trong `resolveAction`, `case-repair-policy-ask-native` hay record nào của nhánh nền. `parseApprovedFrontmatter` có mặt và giống bản ở `4703643`. (tự động)
- AC-003 - Các suite của 3 change pass trên base mới: 3 suite task-breakdown, `mirror-refs-resolution`, `harness-behavioral-sentinel`, `artifact-path-convention`, `skill-pack-runner`, `production-readiness-contract`. (tự động)
- AC-004 - Mirror của mọi skill trên `main` viết `../../_refs/` và có dòng path-resolution; `check:skills` in sync. (tự động)
- AC-005 - `check:skills`, `check:text-hygiene`, `check:executable-references` và `test:e2e:repository` xanh trên Node 22.22.3. Continuation mới hợp lệ; record của `main` verify không đổi; vẫn 23 public skill; CHANGELOG có 3 entry. (tự động)
- AC-006 - PR vào `main` ở trạng thái mergeable. Quét diff không còn tên người, key ticket hay domain nội bộ. (tự động)

## Risks & mitigations
- **Risk:** test của `main` kiểm thêm điều kiện lên file mới. → **Mitigation:** A-002; điều chỉnh nằm trong danh sách khai báo, hoặc lập plan revision.
- **Risk:** điều chỉnh âm thầm làm đổi hành vi. → **Mitigation:** AC-001 chỉ cho phép đúng danh sách khai báo; chạm vào skill, ref hoặc CLI của mode thì phải chạy thật lại (D-003).
- **Risk:** sau này nhánh nền vào `main` sẽ xung đột ở `runtime-attestation.mjs`/`runtime-policy.mjs`. → **Mitigation:** ghi chú trong delivery doc; phần xung đột nhỏ và tách bạch.
- **Risk:** lộ thông tin nội bộ trong repo public. → **Mitigation:** AC-006.

## Out of scope (deferred)
- Đưa nhánh nền vào `main`, tuỳ người dùng quyết sau.
- Kiểm phần đọc lại sau khi ghi tracker thật (AC-011 của change product), khi người dùng cho phép.
- Mở rộng scanner cho `access_token=`.

## Decisions captured during review
- (approved as drafted) Người dùng trả lời `1` tại gate duyệt spec ngày 2026-10-17.
- Duyệt spec cũng xác nhận D-002..D-007 (chốt trong spec) và các mặc định governance của A-003.

## Skill provenance
sdcorejs-spec (approved on attempt 1 / 3)
