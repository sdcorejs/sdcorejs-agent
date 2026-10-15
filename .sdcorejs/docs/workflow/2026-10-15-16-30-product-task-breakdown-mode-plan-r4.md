---
artifact_id: draft-plan-product-task-breakdown-mode-v1-r4
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: draft
revision: 1
---

# Plan r4 — Mode task-breakdown của sdcorejs-product — 2026-10-15 16:30

## Change reason
Revision 4 thay plan r3 (`.sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md`, `sha256:v1:3efd386e…`). Parent vẫn là architecture r2 (`sha256:v1:8de13e08…`); spec không đổi.

Lần chạy thật thứ hai thất bại (`.sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md`):
- Session tương tác không tìm thấy `_refs/` trong layout plugin. Lỗi này ở mức skill pack và được sửa ở một change riêng.
- Session headless đọc được ref có G0..G8 nhưng vẫn làm trọn mọi việc trong một lượt.

Quyết định mới:
- **D-021:** lượt trả lời đầu tiên của mode chỉ làm G0 rồi dừng chờ người dùng. Quy tắc nằm cả trong body skill lẫn trong ref. Đây là phần làm rõ thêm cho điểm dừng G0 của AD-8, nên không cần sửa architecture.
- **D-022:** thứ tự giao hàng như sau:
  1. Làm plan r4.
  2. Chạy ship rồi commit change này; chỉ commit, không push.
  3. Sửa lỗi tìm `_refs/` của mirror trong một change riêng, trên nhánh mới.
  4. Chạy thật lại sau change đó.

## Trạng thái r3
TASK-001..031 đã làm. TASK-031 (lần chạy thật thứ hai) ghi kết quả `failed`.

## Phase 12 — Điểm dừng G0 và artifact quản trị (tuần tự)
1. **TASK-028 EDIT (mở lại)** `test/e2e/product-task-breakdown-flow-contract.test.mjs`. RED: thêm câu bắt buộc "The first reply in this mode covers G0 only and then stops for the user." cho cả ref lẫn skill. Mutation guard tự áp cho câu mới.
2. **TASK-015 EDIT (mở lại)** `_refs/product/task-breakdown.md`. Thêm câu đó vào phần điểm dừng của G0, và nói rõ G0 là cổng duy nhất của lượt đầu.
3. **TASK-016 EDIT (mở lại)** `skills/tracks/product/sdcorejs-product.md`. Thêm câu đó vào mục Task-breakdown mode, giữ tối đa 500 dòng.
4. **TASK-019 EDIT (mở lại)** mirror: `npm run sync:skills`, `npm run check:skills`.
5. **TASK-022 EDIT (mở lại)** `.sdcorejs/summary.md`. Kiểm `assembleProjectContext`; chỉ tính lại fingerprint khi bị stale.
6. **TASK-023 EDIT (mở lại)** `authoring/evals/uiux/evidence.test.mjs`. Validator chuyển sang plan r4 và hash. RED: record cũ gắn plan r3.
7. **TASK-025 EDIT (mở lại)** `VALIDATION.md`. Thêm vào mục task-breakdown:
   - plan r4;
   - kết quả lần chạy thật thứ hai;
   - lỗi tìm `_refs/` và việc nó được chuyển sang change riêng;
   - lý do lần chạy thật đang để ngỏ.
8. **TASK-024 EDIT (mở lại)** `authoring/evals/product-task-breakdown-mode.json`. Ghi lại từ lần chạy thật của lệnh tập trung, sau TASK-025.
9. **TASK-032 CREATE** `.sdcorejs/docs/workflow/2026-10-15-16-30-product-task-breakdown-mode-delivery-r4.md`. Chạy lại `check:skills`, `check:text-hygiene`, `check:executable-references`, evidence test và `npm run test:e2e:repository`, rồi ghi kết quả thật.

Sau TASK-032: chạy `sdcorejs-ship` (verify-before-done, branch-ready), rồi dùng `sdcorejs-git` để commit theo D-022.

## Acceptance mapping (phần thay đổi)
- AC-004 và INV-008 → TASK-015, TASK-016, TASK-028.
- AC-018 → TASK-019, TASK-022..025, TASK-032.
- AC-002, AC-004, AC-011, AC-016 (manual): chưa đạt. Lần chạy thật lại nằm ở change sửa đường dẫn mirror (D-022).

## Verification
- `node --test test/e2e/product-task-breakdown-flow-contract.test.mjs`: RED rồi GREEN.
- `npm run sync:skills`, `npm run check:skills`, `npm run check:text-hygiene`, `npm run check:executable-references`.
- `node --test authoring/evals/uiux/evidence.test.mjs`: RED rồi GREEN.
- `npm run test:e2e:repository`: chạy nền.

## Self-review trước approval
- `validateDecisionCoverage` ở stage plan: 0 lỗi, 0 blocker, 0 future gap. Revision 7 thêm D-021 và D-022.
- `validateGoalBackwardPlan`: approval-ready. Có 32 task, 7 goal.
- `validateValidationMap`: PASS, 19 dòng.
- `validateArchitectureDraftPlanHandoff`: PASS.
- Không thêm dependency, không sửa lockfile. Commit chỉ thực hiện sau ship gate, theo D-022.

## Typed plan context

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: product-task-breakdown-mode-v1
  requirement_id: product-task-breakdown-mode
  approved_spec_path: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
  approved_spec_hash: sha256:v1:9868c93ef4fb768ef54299d8885681457f94c21c72e7dda1a2fba8444052f5dc
  approved_spec_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-product-task-breakdown-mode-v1-r1
    artifact_kind: spec
    revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
    approval_hash: sha256:v1:9868c93ef4fb768ef54299d8885681457f94c21c72e7dda1a2fba8444052f5dc
    repository_relative_path: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
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
    rationale: Thêm action source.read/tracker.write vào capability contract dùng chung cho mọi adapter; thêm artifact root và schema config persist trong repo đích; mở đường ghi ra hệ thống ngoài và đọc nội dung không tin cậy; định nghĩa owner của project workspace.
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    repository_relative_path: .sdcorejs/architecture/workflow/2026-10-14-17-30-product-task-breakdown-mode-r2.md
    artifact_id: architecture-product-task-breakdown-mode-v1-r2
    revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
    approval_hash: sha256:v1:8de13e08efdc954bfa053deb2f40f8cd773801b749d78f39e7606a1324a5a94f
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-10-14-17-30-product-task-breakdown-mode-r2.md
  approved_architecture_hash: sha256:v1:8de13e08efdc954bfa053deb2f40f8cd773801b749d78f39e7606a1324a5a94f
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: .sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md
  target_root: C:\Users\nghiatt15_onemount\Documents\sdcorejs\sdcorejs-agent
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
  task_count: 32
  phase_count: 12
  coverage_approach: TDD (RED trước cho helper và contract)
  decision_coverage: &a2
    schema_version: 1
    revision: 7
    records:
      - id: R-001
        type: requirement
        statement: sdcorejs-product có mode task-breakdown; prompt tách task/tạo ticket từ PRD/US định tuyến vào mode này, không vào documentation TASKID.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-004
          - TASK-016
          - TASK-017
          - TASK-020
      - id: R-002
        type: requirement
        statement: "Nhận nguồn US/PRD tổng quát: board, sprint, filter, danh sách key, link PRD, nội dung dán, file export; nguồn không đọc được thì hướng dẫn connector, không bịa nội dung."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-031
      - id: R-003
        type: requirement
        statement: Context theo dự án ở .sdcorejs/projects/<slug>/ (project.md, task-breakdown.config.md, tasks/<scope>.md), đăng ký trong registry; tự nhận dự án từ đầu vào hoặc cho chọn/tạo mới.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-010
          - TASK-020
          - TASK-027
          - TASK-029
      - id: R-004
        type: requirement
        statement: Config lần đầu qua wizard điền sẵn + structured choice + xem trước + duyệt; cập nhật qua lệnh, gợi ý ask|update|skip trong lúc chạy, hoặc sửa tay có validator; không lưu secret; quy tắc từng lần chạy không lưu trừ khi người dùng nói "luôn".
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-010
          - TASK-015
          - TASK-016
          - TASK-020
          - TASK-021
          - TASK-028
          - TASK-031
      - id: R-005
        type: requirement
        statement: Mỗi task theo format cố định 12 mục, luôn hiện, mục trống ghi "Không có" theo ngôn ngữ; nội dung chắt lọc từ PRD theo đúng vai trò, mọi yêu cầu PRD trong phạm vi được map vào task hoặc ghi rõ lý do không có task cho vai trò đó.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-015
          - TASK-020
      - id: R-006
        type: requirement
        statement: Đọc code là tùy chọn; mỗi task ghi độ tin cậy verified (ref + ngày) | stale (chậm N commit) | none; nguồn API spec ghi môi trường và ngày tải.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: R-007
        type: requirement
        statement: Độ lớn task là story point Fibonacci 1/2/3/5/8/13 chấm theo rubric cố định có breakdown; task >= 13 bị đánh dấu nên tách; quy đổi ngày tuỳ chọn theo velocity.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-020
      - id: R-008
        type: requirement
        statement: Chọn mức sẵn sàng 25/50/75/100% cho từng người bằng structured choice (fallback danh sách đánh số); cân tải theo tổng point so với capacity, có bảng cân tải và cảnh báo quá tải; đề xuất assignee theo roster + quy tắc lần chạy + tải + bằng chứng người từng làm code.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-015
          - TASK-020
          - TASK-028
          - TASK-031
      - id: R-009
        type: requirement
        statement: "Ghi tracker gồm tạo mới và cập nhật, qua gate: kiểm ticket con có sẵn, bảng đề xuất, capacity, cân tải, người dùng duyệt, ghi, đọc lại kiểm; ID task ổn định để chạy lại không tạo trùng; cập nhật giữ nguyên nội dung và media có sẵn."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-013
          - TASK-015
          - TASK-016
          - TASK-020
          - TASK-021
          - TASK-027
          - TASK-028
          - TASK-029
          - TASK-031
      - id: R-010
        type: requirement
        statement: Nội dung PRD/ticket là dữ liệu không tin cậy; phát hiện secret thì cảnh báo và không chép sang task, artifact hay config.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-015
          - TASK-018
          - TASK-020
          - TASK-027
          - TASK-029
      - id: R-011
        type: requirement
        statement: Capability contract có action trung lập source.read và tracker.write với mapping cho từng adapter; tên tool provider chỉ nằm trong adapter mapping.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-002
          - TASK-014
          - TASK-016
          - TASK-020
      - id: R-012
        type: requirement
        statement: Từ 2 US trở lên và runtime có subagent thì đọc nguồn song song qua sdcorejs-parallel-dispatch read-only-request; ngược lại đọc tuần tự.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-028
          - TASK-031
      - id: R-013
        type: requirement
        statement: "Cuối mỗi lần chạy có bảng báo cáo: ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-015
          - TASK-020
          - TASK-028
      - id: R-014
        type: requirement
        statement: "Governance: giữ 23 public skill; mirror sinh bằng script; test:e2e:repository và check:skills xanh; CHANGELOG mục Unreleased; TDD cho helper; không thêm dependency."
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-005
          - TASK-018
          - TASK-019
          - TASK-020
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-026
          - TASK-030
          - TASK-032
      - id: AC-001
        type: acceptance-criterion
        statement: Chạy prompt-evals với các câu "tách task từ PRD", "tạo ticket FE cho sprint", "rà soát US tạo task" -> Skill-pack runner định tuyến vào sdcorejs-product mode task-breakdown; các prompt TASKID record hiện có vẫn vào sdcorejs-documentation
        behavior: Chạy prompt-evals với các câu "tách task từ PRD", "tạo ticket FE cho sprint", "rà soát US tạo task"
        expected_result: Skill-pack runner định tuyến vào sdcorejs-product mode task-breakdown; các prompt TASKID record hiện có vẫn vào sdcorejs-documentation
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-004
          - TASK-016
          - TASK-017
          - TASK-020
      - id: AC-002
        type: acceptance-criterion
        statement: Chạy mode với từng loại đầu vào, trong đó có link không đọc được -> Nguồn đọc được thì được dùng; link không đọc được hiện hướng dẫn cấu hình connector/export/dán và task ghi rõ nguồn thiếu; không có nội dung bịa
        behavior: Chạy mode với từng loại đầu vào, trong đó có link không đọc được
        expected_result: Nguồn đọc được thì được dùng; link không đọc được hiện hướng dẫn cấu hình connector/export/dán và task ghi rõ nguồn thiếu; không có nội dung bịa
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-031
      - id: AC-003
        type: acceptance-criterion
        statement: Gọi helper resolve đường dẫn project workspace với slug hợp lệ và không hợp lệ -> Trả đúng .sdcorejs/projects/<slug>/{project.md,task-breakdown.config.md,tasks/<scope>.md} theo registry root; slug sai dạng bị từ chối
        behavior: Gọi helper resolve đường dẫn project workspace với slug hợp lệ và không hợp lệ
        expected_result: Trả đúng .sdcorejs/projects/<slug>/{project.md,task-breakdown.config.md,tasks/<scope>.md} theo registry root; slug sai dạng bị từ chối
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-010
          - TASK-020
      - id: AC-004
        type: acceptance-criterion
        statement: Chạy lần đầu cho dự án chưa có config -> Wizard điền sẵn giá trị suy ra, hỏi bằng structured choice, hiện bản xem trước; chỉ ghi file sau khi người dùng duyệt
        behavior: Chạy lần đầu cho dự án chưa có config
        expected_result: Wizard điền sẵn giá trị suy ra, hỏi bằng structured choice, hiện bản xem trước; chỉ ghi file sau khi người dùng duyệt
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-031
      - id: AC-005
        type: acceptance-criterion
        statement: Validate config có secret, thiếu field bắt buộc, roster sai dạng, và config có quy tắc từng lần chạy -> Validator báo lỗi có mã ổn định cho từng trường hợp; giá trị dạng secret bị từ chối; quy tắc lần chạy không được persist
        behavior: Validate config có secret, thiếu field bắt buộc, roster sai dạng, và config có quy tắc từng lần chạy
        expected_result: Validator báo lỗi có mã ổn định cho từng trường hợp; giá trị dạng secret bị từ chối; quy tắc lần chạy không được persist
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-010
          - TASK-020
          - TASK-027
          - TASK-029
      - id: AC-006
        type: acceptance-criterion
        statement: Validate task thiếu mục, sai thứ tự, mục trống bị bỏ đi -> Validator từ chối; task đủ 12 mục đúng thứ tự, mục trống có nhãn "Không có" theo ngôn ngữ thì hợp lệ
        behavior: Validate task thiếu mục, sai thứ tự, mục trống bị bỏ đi
        expected_result: Validator từ chối; task đủ 12 mục đúng thứ tự, mục trống có nhãn "Không có" theo ngôn ngữ thì hợp lệ
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: AC-007
        type: acceptance-criterion
        statement: Validate task thiếu confidence hoặc confidence verified mà không có ref + ngày -> Validator từ chối; verified cần ref và ngày, stale cần số commit chậm, none cần ghi chú
        behavior: Validate task thiếu confidence hoặc confidence verified mà không có ref + ngày
        expected_result: Validator từ chối; verified cần ref và ngày, stale cần số commit chậm, none cần ghi chú
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: AC-008
        type: acceptance-criterion
        statement: Chấm điểm các bộ input rubric mẫu -> Ra đúng point Fibonacci và breakdown theo từng yếu tố; tổng >= 13 có cờ nên tách; có velocity thì quy đổi ngày, không có thì bỏ qua
        behavior: Chấm điểm các bộ input rubric mẫu
        expected_result: Ra đúng point Fibonacci và breakdown theo từng yếu tố; tổng >= 13 có cờ nên tách; có velocity thì quy đổi ngày, không có thì bỏ qua
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-020
      - id: AC-009
        type: acceptance-criterion
        statement: Cân tải với roster, mức sẵn sàng 25/50/75/100 và danh sách task có point -> Bảng cân tải đúng capacity, tổng point, % tải; người quá 100% bị cảnh báo; cân theo tổng point chứ không theo số task
        behavior: Cân tải với roster, mức sẵn sàng 25/50/75/100 và danh sách task có point
        expected_result: Bảng cân tải đúng capacity, tổng point, % tải; người quá 100% bị cảnh báo; cân theo tổng point chứ không theo số task
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-020
      - id: AC-010
        type: acceptance-criterion
        statement: Đề xuất assignee khi có quy tắc lần chạy và bằng chứng người từng làm code -> Đề xuất tôn trọng quy tắc và capacity, ghi lý do; quy tắc lần chạy không có trong config sau khi chạy
        behavior: Đề xuất assignee khi có quy tắc lần chạy và bằng chứng người từng làm code
        expected_result: Đề xuất tôn trọng quy tắc và capacity, ghi lý do; quy tắc lần chạy không có trong config sau khi chạy
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-008
        task_refs:
          - TASK-001
          - TASK-012
          - TASK-020
      - id: AC-011
        type: acceptance-criterion
        statement: Chạy luồng tạo + cập nhật ticket trên tracker có ticket con sẵn -> Không có lệnh ghi nào trước khi người dùng duyệt bảng đề xuất; sau khi ghi có báo cáo đọc lại; ticket con sẵn có được đánh dấu thay vì tạo trùng
        behavior: Chạy luồng tạo + cập nhật ticket trên tracker có ticket con sẵn
        expected_result: Không có lệnh ghi nào trước khi người dùng duyệt bảng đề xuất; sau khi ghi có báo cáo đọc lại; ticket con sẵn có được đánh dấu thay vì tạo trùng
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-009
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-031
      - id: AC-012
        type: acceptance-criterion
        statement: Chạy lại cùng phạm vi sau khi đã ghi tracker -> ID task ổn định khớp marker trong ticket; kế hoạch ghi là cập nhật, không tạo mới; phần nội dung/media ngoài vùng của skill được giữ nguyên
        behavior: Chạy lại cùng phạm vi sau khi đã ghi tracker
        expected_result: ID task ổn định khớp marker trong ticket; kế hoạch ghi là cập nhật, không tạo mới; phần nội dung/media ngoài vùng của skill được giữ nguyên
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-009
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-013
          - TASK-020
      - id: AC-013
        type: acceptance-criterion
        statement: Quét nguồn có JWT, API key, password URL -> Có cảnh báo kèm vị trí; giá trị bị thay bằng [REDACTED]; không xuất hiện trong task, artifact, config
        behavior: Quét nguồn có JWT, API key, password URL
        expected_result: Có cảnh báo kèm vị trí; giá trị bị thay bằng [REDACTED]; không xuất hiện trong task, artifact, config
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-010
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-020
          - TASK-027
          - TASK-029
      - id: AC-014
        type: acceptance-criterion
        statement: Chạy contract test capability và runtime-policy -> source.read và tracker.write có trong required_actions và mapping cả 4 adapter; skill/ref source không chứa tên tool provider
        behavior: Chạy contract test capability và runtime-policy
        expected_result: source.read và tracker.write có trong required_actions và mapping cả 4 adapter; skill/ref source không chứa tên tool provider
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-011
        task_refs:
          - TASK-002
          - TASK-014
          - TASK-016
          - TASK-019
          - TASK-020
      - id: AC-015
        type: acceptance-criterion
        statement: Chạy mode khi không có quyền đọc code -> Lần chạy hoàn tất; mọi task có confidence none và ghi chú rõ; không có đường dẫn file bịa
        behavior: Chạy mode khi không có quyền đọc code
        expected_result: Lần chạy hoàn tất; mọi task có confidence none và ghi chú rõ; không có đường dẫn file bịa
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: AC-016
        type: acceptance-criterion
        statement: "Chạy với >= 2 US khi runtime hỗ trợ và không hỗ trợ subagent -> Có subagent: fan-out read-only qua parallel-dispatch; không có: đọc tuần tự; kết quả cùng format"
        behavior: Chạy với >= 2 US khi runtime hỗ trợ và không hỗ trợ subagent
        expected_result: "Có subagent: fan-out read-only qua parallel-dispatch; không có: đọc tuần tự; kết quả cùng format"
        verification_kind: manual
        blocking: true
        requirement_refs:
          - R-012
        task_refs:
          - TASK-015
          - TASK-021
          - TASK-031
      - id: AC-017
        type: acceptance-criterion
        statement: Render báo cáo cuối từ danh sách task -> Bảng có đúng các cột ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì
        behavior: Render báo cáo cuối từ danh sách task
        expected_result: Bảng có đúng các cột ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-013
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: AC-018
        type: acceptance-criterion
        statement: Chạy npm run check:skills và npm run test:e2e:repository trên Node 22.22.3 -> Cả hai xanh; số public skill vẫn 23; CHANGELOG có entry Unreleased
        behavior: Chạy npm run check:skills và npm run test:e2e:repository trên Node 22.22.3
        expected_result: Cả hai xanh; số public skill vẫn 23; CHANGELOG có entry Unreleased
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-014
        task_refs:
          - TASK-018
          - TASK-019
          - TASK-020
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-026
          - TASK-030
          - TASK-032
      - id: AC-019
        type: acceptance-criterion
        statement: Validate ma trận phủ PRD -> task cho một PRD mẫu -> Mỗi yêu cầu PRD trong phạm vi map tới ít nhất một task hoặc có lý do loại trừ cho vai trò; thiếu map thì validator báo
        behavior: Validate ma trận phủ PRD -> task cho một PRD mẫu
        expected_result: Mỗi yêu cầu PRD trong phạm vi map tới ít nhất một task hoặc có lý do loại trừ cho vai trò; thiếu map thì validator báo
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-020
      - id: A-001
        type: assumption
        statement: Slug dự án là kebab-case của key hoặc tên dự án chọn trong wizard.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - brainstorming-2026-10-14
        consequence_if_wrong: Đổi quy tắc slug sau khi đã có thư mục dự án cần migrate tên thư mục.
        validation_method: Người dùng xác nhận khi duyệt spec.
        owner: spec approver
        rationale: Ổn định, dễ đọc, khớp key tracker thường gặp.
        impacted_refs:
          - R-003
      - id: A-002
        type: assumption
        statement: Runtime có connector tracker (MCP hoặc tương đương) đọc được metadata/ticket con và tạo/sửa ticket; nếu không có thì mode xuất bản nháp để copy-paste.
        source: inferred
        confidence: high
        status: confirmed
        blocking: false
        evidence_refs:
          - nsp-sprint-18-manual-run
        consequence_if_wrong: tracker.write không dùng được và chỉ còn đường copy-paste.
        validation_method: Kiểm capability của adapter lúc chạy; fallback được test bằng contract.
        owner: adapter maintainer
        rationale: Đã chạy thật trên Jira qua MCP trong phiên NSP.
        impacted_refs:
          - R-009
          - R-011
      - id: A-003
        type: assumption
        statement: Verification dùng Node 22.22.3 theo engines của repo.
        source: defaulted
        confidence: high
        status: confirmed
        blocking: false
        evidence_refs:
          - package.json-engines
        consequence_if_wrong: Kết quả test không đại diện.
        validation_method: node -v trước khi chạy suite.
        owner: executor
        rationale: Node mặc định trên máy là 22.14.0, thấp hơn engines.
        impacted_refs:
          - R-014
      - id: A-004
        type: assumption
        statement: allowed-tools sinh trong mirror Claude chỉ duyệt sẵn tool, không giới hạn tool khác; tool connector không có trong allowed-tools vẫn gọi được qua bước xin quyền của runtime.
        source: inferred
        confidence: high
        status: validated
        blocking: false
        evidence_refs:
          - session-2026-10-14-agent-tool-used-under-brainstorming-allowed-tools
          - live-run-2026-10-14-val-004
        consequence_if_wrong: "Nếu allowed-tools thực sự giới hạn tool: trên Claude Code cả tool đọc lẫn tool ghi connector bị chặn khi mode chạy, source.read rơi về web.fetch/export/dán và tracker.write chỉ còn đường copy-paste cho tới khi có quyết định riêng về khai tên tool trong adapter claude-code."
        validation_method: Lần chạy thật AC-011 trên Claude Code; ghi evidence trong VAL-004.
        owner: adapter maintainer
        rationale: "Lần chạy thật VAL-004 (2026-10-14): tool connector không có trong allowed-tools vẫn gọi được khi runtime cấp quyền. Phát hiện kèm: ở chế độ dontAsk, allowed-tools của skill không tự cấp quyền (WebFetch bị từ chối dù có trong allowed-tools); không đổi kết luận về việc không giới hạn tool."
        impacted_refs:
          - R-009
          - R-011
      - id: A-005
        type: assumption
        statement: Host có tracker connector thường chạy được node trong repo đích, nên CLI kiểm tra _refs/product/task-breakdown/check.mjs chạy được trước khi lưu file hoặc ghi tracker.
        source: inferred
        confidence: medium
        status: proposed
        blocking: false
        evidence_refs:
          - live-run-2026-10-14-val-004
        consequence_if_wrong: Không chạy được CLI thì file task vẫn lưu được nhưng báo cáo ghi validation NOT RUN, và tracker.write luôn rơi về bản nháp copy-paste.
        validation_method: "Lần chạy thật lại VAL-004 trên Claude Code: CLI chạy và output được dẫn trong báo cáo."
        owner: adapter maintainer
        rationale: Skill pack đã yêu cầu Node cho mọi helper .mjs; lần chạy thật cấp được quyền node khi runtime cho phép.
        impacted_refs:
          - R-009
          - R-005
      - id: D-001
        type: decision
        statement: "Đặt quy trình ở đâu: Mode task-breakdown của sdcorejs-product; không thêm public skill"
        question: Đặt quy trình ở đâu
        selected_value: Mode task-breakdown của sdcorejs-product; không thêm public skill
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Giữ trần 23 skill; product đã sở hữu US/AC.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-014
          - AC-001
        task_refs:
          - TASK-004
          - TASK-016
          - TASK-017
      - id: D-002
        type: decision
        statement: "Phạm vi ghi tracker bản đầu: Tạo mới và cập nhật ticket có sẵn, qua gate duyệt"
        question: Phạm vi ghi tracker bản đầu
        selected_value: Tạo mới và cập nhật ticket có sẵn, qua gate duyệt
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Cần cho trường hợp như NSP-5458 và chạy lại.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-009
          - AC-011
          - AC-012
        task_refs:
          - TASK-009
          - TASK-021
          - TASK-031
      - id: D-003
        type: decision
        statement: "Lưu bản phân tích: Luôn lưu tasks/<scope>.md trong project workspace"
        question: Lưu bản phân tích
        selected_value: Luôn lưu tasks/<scope>.md trong project workspace
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Review, chạy lại, truy vết, bản gốc khi tracker bị sửa tay.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-003
        task_refs:
          - TASK-008
      - id: D-004
        type: decision
        statement: "Đơn vị độ lớn: Story point Fibonacci + rubric cố định"
        question: Đơn vị độ lớn
        selected_value: Story point Fibonacci + rubric cố định
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Đo được, so sánh được giữa task và người.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-007
          - AC-008
        task_refs:
          - TASK-012
      - id: D-005
        type: decision
        statement: "UI chọn capacity và cân tải: Structured choice native 25/50/75/100 + bảng text; fallback danh sách đánh số"
        question: UI chọn capacity và cân tải
        selected_value: Structured choice native 25/50/75/100 + bảng text; fallback danh sách đánh số
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Chạy trên mọi adapter.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-008
          - AC-009
        task_refs:
          - TASK-012
          - TASK-015
      - id: D-006
        type: decision
        statement: 'Format task: 12 mục cố định, luôn hiện, mục trống ghi "Không có"'
        question: Format task
        selected_value: 12 mục cố định, luôn hiện, mục trống ghi "Không có"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Mọi ticket đọc giống nhau, phân biệt được đã kiểm và bị quên.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-006
        task_refs:
          - TASK-011
      - id: D-007
        type: decision
        statement: "Vị trí context dự án: .sdcorejs/projects/<slug>/ là artifact root mới"
        question: Vị trí context dự án
        selected_value: .sdcorejs/projects/<slug>/ là artifact root mới
        source: explicit-user
        status: approved
        blocking: true
        scope: public-contract
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Một repo có thể thuộc nhiều dự án; tránh lệch số ít/số nhiều với .sdcorejs/product.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-003
        task_refs:
          - TASK-003
          - TASK-006
          - TASK-007
      - id: D-008
        type: decision
        statement: "Cách nhập và cập nhật config: Wizard điền sẵn + xem trước/duyệt; cập nhật bằng lệnh, ask|update|skip trong lúc chạy, sửa tay có validator"
        question: Cách nhập và cập nhật config
        selected_value: Wizard điền sẵn + xem trước/duyệt; cập nhật bằng lệnh, ask|update|skip trong lúc chạy, sửa tay có validator
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Ít gõ tay, không ghi khi chưa duyệt.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-004
          - AC-005
        task_refs:
          - TASK-009
          - TASK-010
          - TASK-015
          - TASK-021
          - TASK-031
      - id: D-009
        type: decision
        statement: "Cách đảm bảo chất lượng: TDD cho helper .mjs và contract test; prose kiểm bằng suite hiện có"
        question: Cách đảm bảo chất lượng
        selected_value: TDD cho helper .mjs và contract test; prose kiểm bằng suite hiện có
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Logic xác định được thì test trước.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-014
          - AC-018
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-019
          - TASK-020
          - TASK-024
          - TASK-026
          - TASK-030
      - id: D-010
        type: decision
        statement: "Bề mặt capability cho nguồn và tracker: Action trung lập source.read và tracker.write; chi tiết mapping adapter chốt ở architecture gate"
        question: Bề mặt capability cho nguồn và tracker
        selected_value: Action trung lập source.read và tracker.write; chi tiết mapping adapter chốt ở architecture gate
        source: explicit-user
        status: approved
        blocking: true
        scope: public-contract
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: runtime-policy cấm tên tool provider trong source; allowed-tools sinh tĩnh.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-011
          - AC-014
        task_refs:
          - TASK-002
          - TASK-014
          - TASK-015
          - TASK-016
      - id: D-011
        type: decision
        statement: "Artifact kind mới: Đăng ký project-config (project.md, task-breakdown.config.md) và task-breakdown (tasks/<scope>.md); không dùng lại kind task chưa đăng ký"
        question: Artifact kind mới
        selected_value: Đăng ký project-config (project.md, task-breakdown.config.md) và task-breakdown (tasks/<scope>.md); không dùng lại kind task chưa đăng ký
        source: approved-spec
        status: approved
        blocking: true
        scope: public-contract
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Tránh đụng nghĩa task của auto-task-tracker.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - AC-003
        task_refs:
          - TASK-003
          - TASK-006
          - TASK-008
          - TASK-010
      - id: D-012
        type: decision
        statement: "Dạng ID task ổn định: <project-slug>/<source-key>/<role>/<NN>, ghi trong artifact và marker cuối mô tả ticket"
        question: Dạng ID task ổn định
        selected_value: <project-slug>/<source-key>/<role>/<NN>, ghi trong artifact và marker cuối mô tả ticket
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Suy ra được khi chạy lại, không đụng TASK-### của plan.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-009
          - AC-012
        task_refs:
          - TASK-013
      - id: D-013
        type: decision
        statement: "ID trong mode mới: Dùng AC-001 canonical theo decision-coverage; không migrate template AC1 của các mode cũ"
        question: ID trong mode mới
        selected_value: Dùng AC-001 canonical theo decision-coverage; không migrate template AC1 của các mode cũ
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Không mở rộng phạm vi sang mode cũ.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-019
        task_refs:
          - TASK-011
      - id: D-014
        type: decision
        statement: "Ngôn ngữ nội dung task: Theo ngôn ngữ cấu hình của dự án, mặc định ngôn ngữ người dùng; key mục cố định bằng tiếng Anh, nhãn hiển thị được dịch"
        question: Ngôn ngữ nội dung task
        selected_value: Theo ngôn ngữ cấu hình của dự án, mặc định ngôn ngữ người dùng; key mục cố định bằng tiếng Anh, nhãn hiển thị được dịch
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Validator kiểm theo key, người đọc thấy nhãn đúng ngôn ngữ.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-005
          - AC-006
        task_refs:
          - TASK-011
          - TASK-015
      - id: D-015
        type: decision
        statement: "Nhánh nền để làm: Nhánh mới tạo từ codex/simplify-design-handoff@4703643 (đang chứa refactor private refs chưa merge) thay cho origin/main"
        question: Nhánh nền để làm
        selected_value: Nhánh mới tạo từ codex/simplify-design-handoff@4703643 (đang chứa refactor private refs chưa merge) thay cho origin/main
        source: approved-spec
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: origin/main thiếu 5 commit, trong đó có cấu trúc per-action private references mà mode mới dùng.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-014
          - AC-018
        task_refs:
          - TASK-018
          - TASK-020
      - id: D-016
        type: decision
        statement: "Ranh giới validation của thay đổi: không có authorization boundary trong sản phẩm; mọi dòng validation_map dùng boundary kind none, gate ghi tracker được kiểm bằng invariant INV-001 thay vì boundary authorization."
        question: Validation boundary của validation_map
        selected_value: kind none cho mọi dòng; approval_ref D-016
        source: approved-plan
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Skill pack không có boundary phân quyền người dùng cuối; INV-001 và VAL-004 phủ gate ghi tracker.
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
          - R-008
          - R-009
          - R-010
          - R-011
          - R-012
          - R-013
          - R-014
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
          - AC-011
          - AC-012
          - AC-013
          - AC-014
          - AC-015
          - AC-016
          - AC-017
          - AC-018
          - AC-019
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
          - INV-008
          - INV-009
        task_refs:
          - TASK-020
          - TASK-026
          - TASK-030
          - TASK-032
        validation_boundary:
          kind: none
          source_refs: *a1
      - id: D-017
        type: decision
        statement: "Artifact quản trị của một thay đổi trong repo này: Refresh .sdcorejs/summary.md, thêm mục VALIDATION.md cho thay đổi, thêm evidence continuation mới; continuation audit-findings-repair trở thành history tại 4703643"
        question: Artifact quản trị của một thay đổi trong repo này
        selected_value: Refresh .sdcorejs/summary.md, thêm mục VALIDATION.md cho thay đổi, thêm evidence continuation mới; continuation audit-findings-repair trở thành history tại 4703643
        source: approved-plan
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: test:e2e:repository khoá summary freshness, số liệu communication-economy trong VALIDATION.md và continuation của thay đổi gần nhất.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-014
          - AC-018
          - INV-007
        task_refs:
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-026
          - TASK-030
          - TASK-032
      - id: D-018
        type: decision
        statement: "Phân xử định tuyến và chuỗi fallback: Không sửa bootstrap using-skills.md (ngân sách byte); phân xử nằm trong description product, dòng write-requirement của documentation và _refs/product/task-breakdown.md; product khai thêm web.fetch"
        question: Phân xử định tuyến và chuỗi fallback
        selected_value: Không sửa bootstrap using-skills.md (ngân sách byte); phân xử nằm trong description product, dòng write-requirement của documentation và _refs/product/task-breakdown.md; product khai thêm web.fetch
        source: approved-plan
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: communication-economy chặn bootstrap vượt baseline; AD-1 dùng chuỗi source.read -> web.fetch -> artifact.read -> dán.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-011
          - AC-001
          - AC-014
        task_refs:
          - TASK-016
          - TASK-017
      - id: D-019
        type: decision
        statement: "Cách ép flow task-breakdown sau lần chạy thật thất bại: Flow thành các cổng bắt buộc có điểm dừng; thêm CLI kiểm tra check.mjs mà skill phải chạy và dẫn output trước khi lưu file hoặc ghi tracker; không chạy được node thì tracker.write chỉ còn copy-paste; không thêm hook PreToolUse trong thay đổi này"
        question: Cách ép flow task-breakdown sau lần chạy thật thất bại
        selected_value: Flow thành các cổng bắt buộc có điểm dừng; thêm CLI kiểm tra check.mjs mà skill phải chạy và dẫn output trước khi lưu file hoặc ghi tracker; không chạy được node thì tracker.write chỉ còn copy-paste; không thêm hook PreToolUse trong thay đổi này
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: "Lần chạy thật VAL-004: model bỏ qua cổng, không chạy helper và gọi ghi đè toàn bộ mô tả ticket; câu chữ trong ref không đủ ép. Người dùng chọn 1-1 ngày 2026-10-14."
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - R-005
          - R-008
          - R-009
          - R-013
          - AC-004
          - AC-011
          - AC-012
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-011
          - TASK-013
          - TASK-014
          - TASK-015
          - TASK-016
          - TASK-018
          - TASK-027
          - TASK-028
          - TASK-029
          - TASK-031
      - id: D-020
        type: decision
        statement: "Điều kiện đọc song song (AC-016): Giữ nguyên spec: từ 2 story trở lên và runtime hỗ trợ subagent thì bắt buộc fan-out read-only qua parallel-dispatch; chỉ đọc tuần tự khi không có subagent hoặc parallel-dispatch trả SEQUENTIAL, và báo cáo ghi rõ lý do"
        question: Điều kiện đọc song song (AC-016)
        selected_value: "Giữ nguyên spec: từ 2 story trở lên và runtime hỗ trợ subagent thì bắt buộc fan-out read-only qua parallel-dispatch; chỉ đọc tuần tự khi không có subagent hoặc parallel-dispatch trả SEQUENTIAL, và báo cáo ghi rõ lý do"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Người dùng chọn 2-1 ngày 2026-10-14; không mở lại spec.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-012
          - AC-016
        task_refs:
          - TASK-015
          - TASK-016
          - TASK-028
          - TASK-031
      - id: D-021
        type: decision
        statement: "Điểm dừng của lượt trả lời đầu tiên trong mode task-breakdown: Lượt trả lời đầu tiên của mode chỉ làm G0 rồi dừng chờ người dùng; quy tắc nằm cả trong body skill lẫn ref"
        question: Điểm dừng của lượt trả lời đầu tiên trong mode task-breakdown
        selected_value: Lượt trả lời đầu tiên của mode chỉ làm G0 rồi dừng chờ người dùng; quy tắc nằm cả trong body skill lẫn ref
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: "Lần chạy thật thứ hai: model đọc ref có G0..G8 vẫn làm trọn mọi việc trong một lượt. Người dùng chọn hướng này ngày 2026-10-15."
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-004
          - AC-004
          - INV-008
        task_refs:
          - TASK-015
          - TASK-016
          - TASK-019
          - TASK-028
          - TASK-032
      - id: D-022
        type: decision
        statement: "Thứ tự giao hàng sau lần chạy thật thứ hai: Plan r4 sửa điểm dừng G0 và ghi lại evidence; chạy ship rồi commit change này (không push); lỗi tìm _refs/ trong mirror plugin và .claude sửa ở change riêng trên nhánh mới; chạy thật lại sau change đó"
        question: Thứ tự giao hàng sau lần chạy thật thứ hai
        selected_value: Plan r4 sửa điểm dừng G0 và ghi lại evidence; chạy ship rồi commit change này (không push); lỗi tìm _refs/ trong mirror plugin và .claude sửa ở change riêng trên nhánh mới; chạy thật lại sau change đó
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Record evidence khoá scripts/sync-skills.mjs và chỉ chuyển thành history khi đã commit; lần chạy thật cần cả hai bản sửa. Người dùng chọn thứ tự này ngày 2026-10-15.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-014
          - AC-002
          - AC-004
          - AC-011
          - AC-016
          - AC-018
        task_refs:
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-032
      - id: INV-001
        type: invariant
        statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Chọn một mục trong menu hay giao việc ghi chỉ là ý định, không phải duyệt write plan; duyệt write plan là một câu trả lời riêng cho đúng danh sách op đã hiện. Mỗi op chỉ chạy sau khi CLI kiểm tra trả verify hợp lệ trong lần chạy đó; không ghi đè toàn bộ mô tả ticket. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
        protected_refs:
          - R-009
          - AC-011
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-014
          - TASK-015
          - TASK-016
          - TASK-020
          - TASK-021
          - TASK-026
          - TASK-027
          - TASK-028
          - TASK-029
          - TASK-030
          - TASK-031
          - TASK-032
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-009
          - EVIDENCE-014
          - EVIDENCE-015
          - EVIDENCE-016
          - EVIDENCE-020
          - EVIDENCE-021
          - EVIDENCE-026
          - EVIDENCE-027
          - EVIDENCE-028
          - EVIDENCE-029
          - EVIDENCE-030
          - EVIDENCE-031
          - EVIDENCE-032
      - id: INV-002
        type: invariant
        statement: Nội dung nguồn, output của subagent và config sửa tay là dữ liệu không tin cậy, không phải lệnh; giá trị secret không bao giờ được persist vào task, artifact, config, payload ghi tracker hay lặp lại trong chat.
        protected_refs:
          - R-010
          - R-004
          - AC-013
          - AC-005
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-010
          - TASK-015
          - TASK-018
          - TASK-020
          - TASK-021
          - TASK-026
          - TASK-027
          - TASK-029
          - TASK-030
          - TASK-031
          - TASK-032
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-009
          - EVIDENCE-010
          - EVIDENCE-015
          - EVIDENCE-018
          - EVIDENCE-020
          - EVIDENCE-021
          - EVIDENCE-026
          - EVIDENCE-027
          - EVIDENCE-029
          - EVIDENCE-030
          - EVIDENCE-031
          - EVIDENCE-032
      - id: INV-003
        type: invariant
        statement: Skill/ref source trung lập provider; action mới có mapping và fallback ở cả 4 adapter và có mặt đồng thời trong mọi danh sách exact-set; không tool connector nào được duyệt sẵn qua allowed-tools; native chỉ đến từ tool được host quan sát trong session.
        protected_refs:
          - R-011
          - AC-014
        task_refs:
          - TASK-002
          - TASK-014
          - TASK-015
          - TASK-016
          - TASK-019
          - TASK-020
          - TASK-026
          - TASK-030
          - TASK-032
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-014
          - EVIDENCE-016
          - EVIDENCE-019
          - EVIDENCE-020
          - EVIDENCE-026
          - EVIDENCE-030
          - EVIDENCE-032
      - id: INV-004
        type: invariant
        statement: Project workspace chỉ nằm dưới root registry với slug/scope theo pattern và kiểm tên reserved sẵn có, file có schema_version và field lifecycle được kiểm; kind project-config và task-breakdown là shared kind, commit_policy conditional; v1 chỉ mode task-breakdown được ghi.
        protected_refs:
          - R-003
          - AC-003
          - AC-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-010
          - TASK-020
          - TASK-026
          - TASK-030
          - TASK-032
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-003
          - EVIDENCE-006
          - EVIDENCE-007
          - EVIDENCE-008
          - EVIDENCE-010
          - EVIDENCE-020
          - EVIDENCE-026
          - EVIDENCE-030
          - EVIDENCE-032
      - id: INV-005
        type: invariant
        statement: Mỗi task có đủ 12 mục theo key và thứ tự cố định, confidence, size kèm breakdown, task_id ổn định không tái sử dụng số; ma trận phủ PRD không có yêu cầu bị bỏ sót.
        protected_refs:
          - R-005
          - R-006
          - R-007
          - AC-006
          - AC-007
          - AC-008
          - AC-019
        task_refs:
          - TASK-001
          - TASK-011
          - TASK-012
          - TASK-013
          - TASK-020
          - TASK-026
          - TASK-030
          - TASK-032
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-011
          - EVIDENCE-012
          - EVIDENCE-013
          - EVIDENCE-020
          - EVIDENCE-026
          - EVIDENCE-030
          - EVIDENCE-032
      - id: INV-006
        type: invariant
        statement: Cập nhật ticket chỉ thay vùng giữa marker của skill khi fingerprint vùng còn khớp, hoặc chèn section mới; đọc lại ngay trước khi ghi và huỷ nếu ticket đổi so với lúc duyệt; fingerprint phần ngoài vùng giữ nguyên sau khi ghi; không xoá ticket, không chuyển trạng thái.
        protected_refs:
          - R-009
          - AC-012
        task_refs:
          - TASK-001
          - TASK-013
          - TASK-015
          - TASK-020
          - TASK-021
          - TASK-026
          - TASK-030
          - TASK-031
          - TASK-032
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-013
          - EVIDENCE-015
          - EVIDENCE-020
          - EVIDENCE-021
          - EVIDENCE-026
          - EVIDENCE-030
          - EVIDENCE-031
          - EVIDENCE-032
      - id: INV-007
        type: invariant
        statement: "Hành vi hiện có giữ nguyên: 23 public skill, mode Seed/Update/Audit của product không đổi, định tuyến TASKID record vẫn vào documentation."
        protected_refs:
          - R-001
          - R-014
          - AC-001
          - AC-018
        task_refs:
          - TASK-004
          - TASK-005
          - TASK-016
          - TASK-017
          - TASK-018
          - TASK-019
          - TASK-020
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-026
          - TASK-030
          - TASK-032
        evidence_refs:
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-016
          - EVIDENCE-017
          - EVIDENCE-018
          - EVIDENCE-019
          - EVIDENCE-020
          - EVIDENCE-022
          - EVIDENCE-023
          - EVIDENCE-024
          - EVIDENCE-025
          - EVIDENCE-026
          - EVIDENCE-030
          - EVIDENCE-032
      - id: INV-008
        type: invariant
        statement: "Các cổng G0..G8 của flow đi đúng thứ tự và không gộp: chưa resolve hoặc tạo xong project (wizard có bản xem trước được duyệt) thì không inventory story và không tách task; inventory story, ticket con có sẵn và vai trò trước khi tách task; có từ 2 story và runtime hỗ trợ subagent thì fan-out read-only; hỏi mức sẵn sàng trước khi gợi ý assignee; bảng đề xuất được duyệt trước khi lưu tasks/<scope>.md; nội dung được kiểm bằng CLI trên đúng bytes trước khi ghi và kiểm lại file sau khi ghi; mỗi cổng dẫn bằng chứng đã định cho cổng đó, NOT RUN chỉ hợp lệ khi kèm lệnh đã thử và lỗi hoặc lời từ chối quyền."
        protected_refs:
          - R-003
          - R-004
          - R-008
          - R-009
          - R-012
          - R-013
          - AC-004
          - AC-011
          - AC-016
        task_refs:
          - TASK-015
          - TASK-016
          - TASK-028
          - TASK-030
          - TASK-031
          - TASK-032
        evidence_refs:
          - EVIDENCE-015
          - EVIDENCE-016
          - EVIDENCE-028
          - EVIDENCE-030
          - EVIDENCE-031
          - EVIDENCE-032
      - id: INV-009
        type: invariant
        statement: "CLI kiểm tra chỉ đọc: --root là bắt buộc, được realpath và in lại trong kết luận; chỉ đọc file nằm dưới <root>/.sdcorejs/projects/<slug>/ (kiểm từng đoạn bằng lstat, từ chối symlink ra ngoài và traversal) hoặc stdin; không ghi file, không gọi mạng, tracker hay tiến trình con; slug sai hay path ngoài workspace thì exit 2; in đúng một kết luận JSON và exit code 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O; không bao giờ sửa nội dung ngoài vùng của skill, kể cả để che secret."
        protected_refs:
          - R-003
          - R-010
          - AC-005
          - AC-013
        task_refs:
          - TASK-027
          - TASK-029
          - TASK-030
          - TASK-032
        evidence_refs:
          - EVIDENCE-027
          - EVIDENCE-029
          - EVIDENCE-030
          - EVIDENCE-032
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
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
          - id: R-007
            type: requirement
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
            type: decision
          - id: D-016
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
        tombstones: []
      - revision: 4
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
            type: decision
          - id: D-016
            type: decision
          - id: D-017
            type: decision
          - id: D-018
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
        tombstones: []
      - revision: 5
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
            type: assumption
          - id: A-005
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
            type: decision
          - id: D-016
            type: decision
          - id: D-017
            type: decision
          - id: D-018
            type: decision
          - id: D-019
            type: decision
          - id: D-020
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
          - id: INV-009
            type: invariant
        tombstones: []
      - revision: 6
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
            type: assumption
          - id: A-005
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
            type: decision
          - id: D-016
            type: decision
          - id: D-017
            type: decision
          - id: D-018
            type: decision
          - id: D-019
            type: decision
          - id: D-020
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
          - id: INV-009
            type: invariant
        tombstones: []
      - revision: 7
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
          - id: R-008
            type: requirement
          - id: R-009
            type: requirement
          - id: R-010
            type: requirement
          - id: R-011
            type: requirement
          - id: R-012
            type: requirement
          - id: R-013
            type: requirement
          - id: R-014
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
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: AC-017
            type: acceptance-criterion
          - id: AC-018
            type: acceptance-criterion
          - id: AC-019
            type: acceptance-criterion
          - id: A-001
            type: assumption
          - id: A-002
            type: assumption
          - id: A-003
            type: assumption
          - id: A-004
            type: assumption
          - id: A-005
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
          - id: D-008
            type: decision
          - id: D-009
            type: decision
          - id: D-010
            type: decision
          - id: D-011
            type: decision
          - id: D-012
            type: decision
          - id: D-013
            type: decision
          - id: D-014
            type: decision
          - id: D-015
            type: decision
          - id: D-016
            type: decision
          - id: D-017
            type: decision
          - id: D-018
            type: decision
          - id: D-019
            type: decision
          - id: D-020
            type: decision
          - id: D-021
            type: decision
          - id: D-022
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
          - id: INV-009
            type: invariant
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a2
    goals:
      - id: G-001
        statement: Mode task-breakdown có trong sdcorejs-product và được định tuyến đúng, không làm lệch định tuyến documentation.
        task_refs:
          - TASK-004
          - TASK-016
          - TASK-017
      - id: G-002
        statement: Helper thuần xác định được cho workspace, format, rubric, cân tải, identity/marker, write plan và quét secret, có test RED->GREEN.
        task_refs:
          - TASK-001
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-013
      - id: G-003
        statement: Contract dùng chung (registry, lifecycle, capability) được mở rộng additive với gate fail-closed.
        task_refs:
          - TASK-002
          - TASK-003
          - TASK-006
          - TASK-007
          - TASK-008
          - TASK-014
      - id: G-004
        statement: Prose, tài liệu, mirror và evidence giao hàng hoàn chỉnh, suite xanh, có evidence chạy thật.
        task_refs:
          - TASK-005
          - TASK-015
          - TASK-018
          - TASK-019
          - TASK-020
          - TASK-021
      - id: G-005
        statement: Artifact quản trị của repo (summary, VALIDATION.md, evidence continuation) được cập nhật cho thay đổi và suite repository xanh.
        task_refs:
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-026
      - id: G-006
        statement: Flow task-breakdown được ép bằng cổng G0..G8 và CLI kiểm tra chỉ đọc; ghi tracker chỉ qua write plan được duyệt riêng và merge theo marker; lần chạy thật lại đạt AC-002, AC-004, AC-011, AC-016.
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-009
          - TASK-011
          - TASK-013
          - TASK-014
          - TASK-015
          - TASK-016
          - TASK-018
          - TASK-019
          - TASK-022
          - TASK-023
          - TASK-024
          - TASK-025
          - TASK-027
          - TASK-028
          - TASK-029
          - TASK-030
          - TASK-031
      - id: G-007
        statement: Lượt trả lời đầu tiên của mode chỉ làm G0 rồi dừng; evidence và artifact quản trị cập nhật cho r4; change sẵn sàng ship với kết quả chạy thật ghi đúng sự thật.
        task_refs:
          - TASK-028
          - TASK-015
          - TASK-016
          - TASK-019
          - TASK-022
          - TASK-023
          - TASK-025
          - TASK-024
          - TASK-032
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/product-task-breakdown-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - R-009
              - R-010
              - R-013
              - AC-003
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-012
              - AC-013
              - AC-015
              - AC-017
              - AC-019
              - INV-001
              - INV-002
              - INV-004
              - INV-005
              - INV-006
        justification_refs:
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
          - R-008
          - R-009
          - R-010
          - R-013
          - D-009
          - D-019
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-004
          - INV-005
          - INV-006
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/harness-behavioral-sentinel.test.mjs
        planned_evidence:
          - id: EVIDENCE-002
            record_refs:
              - R-011
              - AC-014
              - INV-003
        justification_refs:
          - R-011
          - D-010
        enforces_invariant_refs:
          - INV-003
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/artifact-path-convention.test.mjs
        planned_evidence:
          - id: EVIDENCE-003
            record_refs:
              - R-003
              - AC-003
              - INV-004
        justification_refs:
          - R-003
          - D-007
          - D-011
        enforces_invariant_refs:
          - INV-004
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/fixtures/prompt-evals.json
          - test/e2e/skill-pack-runner.test.mjs
        planned_evidence:
          - id: EVIDENCE-004
            record_refs:
              - R-001
              - AC-001
              - INV-007
        justification_refs:
          - R-001
          - D-001
        enforces_invariant_refs:
          - INV-007
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
          - TASK-027
          - TASK-028
        planned_paths:
          - package.json
        planned_evidence:
          - id: EVIDENCE-005
            record_refs:
              - R-014
              - INV-007
        justification_refs:
          - R-014
          - D-009
        enforces_invariant_refs:
          - INV-007
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-003
        planned_paths:
          - _refs/shared/system-registry.json
          - _refs/shared/system-registry.mjs
        planned_evidence:
          - id: EVIDENCE-006
            record_refs:
              - R-003
              - AC-003
              - INV-004
        justification_refs:
          - R-003
          - D-007
          - D-011
        enforces_invariant_refs:
          - INV-004
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - _refs/shared/artifact-paths.mjs
        planned_evidence:
          - id: EVIDENCE-007
            record_refs:
              - R-003
              - AC-003
              - INV-004
        justification_refs:
          - R-003
          - D-007
        enforces_invariant_refs:
          - INV-004
      - id: TASK-008
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-006
        planned_paths:
          - _refs/shared/artifact-lifecycle.mjs
          - _refs/shared/artifact-lifecycle.md
        planned_evidence:
          - id: EVIDENCE-008
            record_refs:
              - R-003
              - AC-003
              - INV-004
        justification_refs:
          - R-003
          - D-003
          - D-011
        enforces_invariant_refs:
          - INV-004
      - id: TASK-009
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/product/task-breakdown/safety.mjs
        planned_evidence:
          - id: EVIDENCE-009
            record_refs:
              - R-009
              - R-010
              - AC-012
              - AC-013
              - INV-001
              - INV-002
        justification_refs:
          - R-009
          - R-010
          - D-002
          - D-008
          - D-019
        enforces_invariant_refs:
          - INV-001
          - INV-002
      - id: TASK-010
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-007
          - TASK-008
          - TASK-009
        planned_paths:
          - _refs/product/task-breakdown/workspace.mjs
        planned_evidence:
          - id: EVIDENCE-010
            record_refs:
              - R-003
              - R-004
              - AC-003
              - AC-005
              - INV-002
              - INV-004
        justification_refs:
          - R-003
          - R-004
          - D-008
          - D-011
        enforces_invariant_refs:
          - INV-002
          - INV-004
      - id: TASK-011
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/product/task-breakdown/task-format.mjs
        planned_evidence:
          - id: EVIDENCE-011
            record_refs:
              - R-005
              - R-006
              - R-013
              - AC-006
              - AC-007
              - AC-015
              - AC-017
              - AC-019
              - INV-005
        justification_refs:
          - R-005
          - R-006
          - R-013
          - D-006
          - D-013
          - D-014
          - D-019
        enforces_invariant_refs:
          - INV-005
      - id: TASK-012
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
        planned_paths:
          - _refs/product/task-breakdown/sizing.mjs
        planned_evidence:
          - id: EVIDENCE-012
            record_refs:
              - R-007
              - R-008
              - AC-008
              - AC-009
              - AC-010
              - INV-005
        justification_refs:
          - R-007
          - R-008
          - D-004
          - D-005
        enforces_invariant_refs:
          - INV-005
      - id: TASK-013
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-001
          - TASK-009
        planned_paths:
          - _refs/product/task-breakdown/identity.mjs
        planned_evidence:
          - id: EVIDENCE-013
            record_refs:
              - R-009
              - AC-012
              - INV-005
              - INV-006
        justification_refs:
          - R-009
          - D-012
          - D-019
        enforces_invariant_refs:
          - INV-005
          - INV-006
      - id: TASK-014
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-002
        planned_paths:
          - _refs/harness/capability-contract.json
          - _refs/harness/runtime-policy.mjs
          - _refs/harness/runtime-attestation.mjs
          - _refs/harness/README.md
        planned_evidence:
          - id: EVIDENCE-014
            record_refs:
              - R-011
              - AC-014
              - INV-003
              - INV-001
        justification_refs:
          - R-011
          - D-010
          - D-019
        enforces_invariant_refs:
          - INV-003
          - INV-001
      - id: TASK-015
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-009
          - TASK-010
          - TASK-011
          - TASK-012
          - TASK-013
          - TASK-014
          - TASK-028
          - TASK-029
        planned_paths:
          - _refs/product/task-breakdown.md
          - _refs/product/task-format.md
          - _refs/product/sizing-rubric.md
          - _refs/product/project-workspace.md
          - _refs/product/source-connectors.md
        planned_evidence:
          - id: EVIDENCE-015
            record_refs:
              - R-002
              - R-004
              - R-009
              - R-012
              - AC-002
              - AC-004
              - AC-011
              - AC-016
              - INV-001
              - INV-002
              - INV-006
              - R-008
              - R-013
              - INV-008
        justification_refs:
          - R-002
          - R-004
          - R-005
          - R-008
          - R-009
          - R-010
          - R-012
          - D-005
          - D-008
          - D-010
          - D-014
          - R-013
          - D-019
          - D-020
          - D-021
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-006
          - INV-008
      - id: TASK-016
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
          - TASK-014
          - TASK-015
        planned_paths:
          - skills/tracks/product/sdcorejs-product.md
        planned_evidence:
          - id: EVIDENCE-016
            record_refs:
              - R-001
              - R-011
              - AC-001
              - AC-014
              - INV-003
              - INV-007
              - R-009
              - INV-008
              - INV-001
              - R-004
        justification_refs:
          - R-001
          - R-011
          - D-001
          - D-010
          - D-018
          - R-009
          - D-019
          - D-020
          - D-021
        enforces_invariant_refs:
          - INV-003
          - INV-007
          - INV-008
          - INV-001
      - id: TASK-017
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-004
          - TASK-016
        planned_paths:
          - skills/orchestration/documentation.md
          - test/e2e/support/skill-pack-runner.mjs
        planned_evidence:
          - id: EVIDENCE-017
            record_refs:
              - R-001
              - AC-001
              - INV-007
        justification_refs:
          - R-001
          - D-001
          - D-018
        enforces_invariant_refs:
          - INV-007
      - id: TASK-018
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-015
          - TASK-016
        planned_paths:
          - SECURITY.md
          - CHANGELOG.md
        planned_evidence:
          - id: EVIDENCE-018
            record_refs:
              - R-010
              - R-014
              - AC-018
              - INV-002
              - INV-007
        justification_refs:
          - R-010
          - R-014
          - D-015
          - D-019
        enforces_invariant_refs:
          - INV-002
          - INV-007
      - id: TASK-019
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-014
          - TASK-015
          - TASK-016
          - TASK-017
          - TASK-018
          - TASK-029
        planned_paths:
          - .claude/skills/sdcorejs-product/SKILL.md
          - plugin/skills/sdcorejs-product/SKILL.md
          - codex/skills/sdcorejs-product/SKILL.md
        planned_evidence:
          - id: EVIDENCE-019
            record_refs:
              - R-014
              - AC-014
              - AC-018
              - INV-003
              - INV-007
        justification_refs:
          - R-014
          - D-009
          - D-021
        enforces_invariant_refs:
          - INV-003
          - INV-007
      - id: TASK-020
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-005
          - TASK-019
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-delivery.md
        planned_evidence:
          - id: EVIDENCE-020
            record_refs:
              - R-001
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - R-008
              - R-009
              - R-010
              - R-011
              - R-013
              - R-014
              - AC-001
              - AC-003
              - AC-005
              - AC-006
              - AC-007
              - AC-008
              - AC-009
              - AC-010
              - AC-012
              - AC-013
              - AC-014
              - AC-015
              - AC-017
              - AC-018
              - AC-019
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - INV-005
              - INV-006
              - INV-007
        justification_refs:
          - R-014
          - D-009
          - D-015
          - D-016
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
      - id: TASK-021
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-026
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md
        planned_evidence:
          - id: EVIDENCE-021
            record_refs:
              - R-002
              - R-004
              - R-009
              - R-012
              - AC-002
              - AC-004
              - AC-011
              - AC-016
              - INV-001
              - INV-002
              - INV-006
        justification_refs:
          - R-002
          - R-004
          - R-009
          - R-012
          - D-002
          - D-008
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-006
      - id: TASK-022
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-019
          - TASK-005
        planned_paths:
          - .sdcorejs/summary.md
        planned_evidence:
          - id: EVIDENCE-022
            record_refs:
              - R-014
              - AC-018
              - INV-007
        justification_refs:
          - R-014
          - D-017
          - D-022
        enforces_invariant_refs:
          - INV-007
      - id: TASK-023
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-019
        planned_paths:
          - authoring/evals/uiux/evidence.test.mjs
        planned_evidence:
          - id: EVIDENCE-023
            record_refs:
              - R-014
              - AC-018
              - INV-007
        justification_refs:
          - R-014
          - D-017
          - D-022
        enforces_invariant_refs:
          - INV-007
      - id: TASK-024
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-022
          - TASK-023
          - TASK-025
        planned_paths:
          - authoring/evals/product-task-breakdown-mode.json
        planned_evidence:
          - id: EVIDENCE-024
            record_refs:
              - R-014
              - AC-018
              - INV-007
        justification_refs:
          - R-014
          - D-017
          - D-009
          - D-022
        enforces_invariant_refs:
          - INV-007
      - id: TASK-025
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-022
          - TASK-023
        planned_paths:
          - VALIDATION.md
        planned_evidence:
          - id: EVIDENCE-025
            record_refs:
              - R-014
              - AC-018
              - INV-007
        justification_refs:
          - R-014
          - D-017
          - D-022
        enforces_invariant_refs:
          - INV-007
      - id: TASK-026
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-025
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-14-14-40-product-task-breakdown-mode-delivery-r2.md
        planned_evidence:
          - id: EVIDENCE-026
            record_refs:
              - R-014
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - INV-005
              - INV-006
              - INV-007
        justification_refs:
          - R-014
          - D-016
          - D-017
          - D-009
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
      - id: TASK-027
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/product-task-breakdown-cli.test.mjs
        planned_evidence:
          - id: EVIDENCE-027
            record_refs:
              - R-003
              - R-010
              - AC-005
              - AC-013
              - INV-009
              - INV-001
              - INV-002
        justification_refs:
          - R-003
          - R-009
          - R-010
          - D-019
        enforces_invariant_refs:
          - INV-009
          - INV-001
          - INV-002
      - id: TASK-028
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: []
        planned_paths:
          - test/e2e/product-task-breakdown-flow-contract.test.mjs
        planned_evidence:
          - id: EVIDENCE-028
            record_refs:
              - R-004
              - R-008
              - R-012
              - R-013
              - INV-008
              - INV-001
        justification_refs:
          - R-004
          - R-008
          - R-009
          - R-012
          - R-013
          - D-019
          - D-020
          - D-021
        enforces_invariant_refs:
          - INV-008
          - INV-001
      - id: TASK-029
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-027
          - TASK-009
          - TASK-011
          - TASK-013
        planned_paths:
          - _refs/product/task-breakdown/check.mjs
        planned_evidence:
          - id: EVIDENCE-029
            record_refs:
              - R-003
              - R-010
              - AC-005
              - AC-013
              - INV-009
              - INV-001
              - INV-002
        justification_refs:
          - R-003
          - R-009
          - R-010
          - D-019
        enforces_invariant_refs:
          - INV-009
          - INV-001
          - INV-002
      - id: TASK-030
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-024
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-delivery-r3.md
        planned_evidence:
          - id: EVIDENCE-030
            record_refs:
              - R-014
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - INV-005
              - INV-006
              - INV-007
              - INV-008
              - INV-009
        justification_refs:
          - R-014
          - D-016
          - D-017
          - D-009
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
          - INV-008
          - INV-009
      - id: TASK-031
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-030
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md
        planned_evidence:
          - id: EVIDENCE-031
            record_refs:
              - R-002
              - R-004
              - R-008
              - R-009
              - R-012
              - AC-002
              - AC-004
              - AC-011
              - AC-016
              - INV-001
              - INV-002
              - INV-006
              - INV-008
        justification_refs:
          - R-002
          - R-004
          - R-008
          - R-009
          - R-012
          - D-002
          - D-008
          - D-019
          - D-020
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-006
          - INV-008
      - id: TASK-032
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies:
          - TASK-024
        planned_paths:
          - .sdcorejs/docs/workflow/2026-10-15-16-30-product-task-breakdown-mode-delivery-r4.md
        planned_evidence:
          - id: EVIDENCE-032
            record_refs:
              - R-014
              - AC-018
              - INV-001
              - INV-002
              - INV-003
              - INV-004
              - INV-005
              - INV-006
              - INV-007
              - INV-008
              - INV-009
        justification_refs:
          - R-014
          - D-016
          - D-017
          - D-021
          - D-022
        enforces_invariant_refs:
          - INV-001
          - INV-002
          - INV-003
          - INV-004
          - INV-005
          - INV-006
          - INV-007
          - INV-008
          - INV-009
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - .claude/skills/sdcorejs-product/SKILL.md
            - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-delivery.md
            - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md
            - .sdcorejs/docs/workflow/2026-10-14-14-40-product-task-breakdown-mode-delivery-r2.md
            - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-delivery-r3.md
            - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md
            - .sdcorejs/summary.md
            - CHANGELOG.md
            - SECURITY.md
            - VALIDATION.md
            - _refs/harness/README.md
            - _refs/harness/capability-contract.json
            - _refs/harness/runtime-attestation.mjs
            - _refs/harness/runtime-policy.mjs
            - _refs/product/project-workspace.md
            - _refs/product/sizing-rubric.md
            - _refs/product/source-connectors.md
            - _refs/product/task-breakdown.md
            - _refs/product/task-breakdown/check.mjs
            - _refs/product/task-breakdown/identity.mjs
            - _refs/product/task-breakdown/safety.mjs
            - _refs/product/task-breakdown/sizing.mjs
            - _refs/product/task-breakdown/task-format.mjs
            - _refs/product/task-breakdown/workspace.mjs
            - _refs/product/task-format.md
            - _refs/shared/artifact-lifecycle.md
            - _refs/shared/artifact-lifecycle.mjs
            - _refs/shared/artifact-paths.mjs
            - _refs/shared/system-registry.json
            - _refs/shared/system-registry.mjs
            - authoring/evals/product-task-breakdown-mode.json
            - authoring/evals/uiux/evidence.test.mjs
            - codex/skills/sdcorejs-product/SKILL.md
            - package.json
            - plugin/skills/sdcorejs-product/SKILL.md
            - skills/orchestration/documentation.md
            - skills/tracks/product/sdcorejs-product.md
            - test/e2e/artifact-path-convention.test.mjs
            - test/e2e/fixtures/prompt-evals.json
            - test/e2e/harness-behavioral-sentinel.test.mjs
            - test/e2e/product-task-breakdown-cli.test.mjs
            - test/e2e/product-task-breakdown-contract.test.mjs
            - test/e2e/product-task-breakdown-flow-contract.test.mjs
            - test/e2e/skill-pack-runner.test.mjs
            - test/e2e/support/skill-pack-runner.mjs
          intended_new_paths:
            - path: .sdcorejs/docs/workflow/2026-10-15-16-30-product-task-breakdown-mode-delivery-r4.md
              owner_task_id: TASK-032
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
        - INV-007
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-routing
      planned_command: node --test test/e2e/skill-pack-runner.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Skill-pack runner định tuyến vào sdcorejs-product mode task-breakdown; các prompt TASKID record hiện có vẫn vào sdcorejs-documentation
      status: covered
      evidence_refs:
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-016
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-019
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
        - EVIDENCE-024
        - EVIDENCE-025
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-002
      invariant_refs: []
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-unreadable-source
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Nguồn đọc được thì được dùng; link không đọc được hiện hướng dẫn cấu hình connector/export/dán và task ghi rõ nguồn thiếu; không có nội dung bịa
      status: covered
      evidence_refs:
        - EVIDENCE-015
        - EVIDENCE-021
        - EVIDENCE-031
      rationale: Hành vi phụ thuộc runtime thật (connector, structured choice, subagent) nên kiểm bằng lần chạy có người dùng (VAL-004).
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-004
        - INV-008
        - INV-009
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-workspace-path
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs test/e2e/artifact-path-convention.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Trả đúng .sdcorejs/projects/<slug>/{project.md,task-breakdown.config.md,tasks/<scope>.md} theo registry root; slug sai dạng bị từ chối
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-010
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-028
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-002
        - INV-008
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-first-run-wizard
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Wizard điền sẵn giá trị suy ra, hỏi bằng structured choice, hiện bản xem trước; chỉ ghi file sau khi người dùng duyệt
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-028
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: Hành vi phụ thuộc runtime thật (connector, structured choice, subagent) nên kiểm bằng lần chạy có người dùng (VAL-004).
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-002
        - INV-004
        - INV-008
        - INV-009
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-config-validator
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Validator báo lỗi có mã ổn định cho từng trường hợp; giá trị dạng secret bị từ chối; quy tắc lần chạy không được persist
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-003
        - EVIDENCE-006
        - EVIDENCE-007
        - EVIDENCE-008
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-028
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-task-format
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Validator từ chối; task đủ 12 mục đúng thứ tự, mục trống có nhãn "Không có" theo ngôn ngữ thì hợp lệ
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-confidence
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Validator từ chối; verified cần ref và ngày, stale cần số commit chậm, none cần ghi chú
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-rubric
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Ra đúng point Fibonacci và breakdown theo từng yếu tố; tổng >= 13 có cờ nên tách; có velocity thì quy đổi ngày, không có thì bỏ qua
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-008
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-capacity
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Bảng cân tải đúng capacity, tổng point, % tải; người quá 100% bị cảnh báo; cân theo tổng point chứ không theo số task
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-028
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-008
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-008
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-assignee
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Đề xuất tôn trọng quy tắc và capacity, ghi lý do; quy tắc lần chạy không có trong config sau khi chạy
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-012
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-028
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-001
        - INV-006
        - INV-008
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-tracker-gate
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: Không có lệnh ghi nào trước khi người dùng duyệt bảng đề xuất; sau khi ghi có báo cáo đọc lại; ticket con sẵn có được đánh dấu thay vì tạo trùng
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-009
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-028
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: Hành vi phụ thuộc runtime thật (connector, structured choice, subagent) nên kiểm bằng lần chạy có người dùng (VAL-004).
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-009
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-001
        - INV-006
        - INV-008
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-rerun-idempotent
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: ID task ổn định khớp marker trong ticket; kế hoạch ghi là cập nhật, không tạo mới; phần nội dung/media ngoài vùng của skill được giữ nguyên
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-009
        - EVIDENCE-013
        - EVIDENCE-014
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-028
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-010
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-002
        - INV-009
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-secret-redaction
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Có cảnh báo kèm vị trí; giá trị bị thay bằng [REDACTED]; không xuất hiện trong task, artifact, config
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-009
        - EVIDENCE-010
        - EVIDENCE-015
        - EVIDENCE-018
        - EVIDENCE-020
        - EVIDENCE-021
        - EVIDENCE-026
        - EVIDENCE-027
        - EVIDENCE-029
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-011
      acceptance_criterion_id: AC-014
      invariant_refs:
        - INV-003
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-capability-contract
      planned_command: node --test test/e2e/harness-behavioral-sentinel.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: source.read và tracker.write có trong required_actions và mapping cả 4 adapter; skill/ref source không chứa tên tool provider
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-014
        - EVIDENCE-016
        - EVIDENCE-019
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-no-code
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Lần chạy hoàn tất; mọi task có confidence none và ghi chú rõ; không có đường dẫn file bịa
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-012
      acceptance_criterion_id: AC-016
      invariant_refs:
        - INV-008
      risk: live-runtime-behavior-not-covered-by-unit-tests
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - uat
      case_ids:
        - case-task-breakdown-fan-out
      planned_command: null
      command_source: manual
      cwd: .
      evidence_class: LIVE_AGENT
      automation: manual
      expected_proof: "Có subagent: fan-out read-only qua parallel-dispatch; không có: đọc tuần tự; kết quả cùng format"
      status: covered
      evidence_refs:
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-021
        - EVIDENCE-028
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: Hành vi phụ thuộc runtime thật (connector, structured choice, subagent) nên kiểm bằng lần chạy có người dùng (VAL-004).
      owner: user + executor
      acknowledgement_required: true
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-013
      acceptance_criterion_id: AC-017
      invariant_refs:
        - INV-008
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-report
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Bảng có đúng các cột ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-015
        - EVIDENCE-016
        - EVIDENCE-020
        - EVIDENCE-028
        - EVIDENCE-030
        - EVIDENCE-031
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-014
      acceptance_criterion_id: AC-018
      invariant_refs:
        - INV-007
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
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
      expected_proof: Cả hai xanh; số public skill vẫn 23; CHANGELOG có entry Unreleased
      status: covered
      evidence_refs:
        - EVIDENCE-004
        - EVIDENCE-005
        - EVIDENCE-016
        - EVIDENCE-017
        - EVIDENCE-018
        - EVIDENCE-019
        - EVIDENCE-020
        - EVIDENCE-022
        - EVIDENCE-023
        - EVIDENCE-024
        - EVIDENCE-025
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-019
      invariant_refs:
        - INV-005
      risk: contract-regression
      boundary:
        kind: none
        approval_ref: D-016
        source_refs: *a1
      authorization_boundary: false
      levels:
        - unit
      case_ids:
        - case-task-breakdown-prd-coverage
      planned_command: node --test test/e2e/product-task-breakdown-contract.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Mỗi yêu cầu PRD trong phạm vi map tới ít nhất một task hoặc có lý do loại trừ cho vai trò; thiếu map thì validator báo
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-011
        - EVIDENCE-012
        - EVIDENCE-013
        - EVIDENCE-020
        - EVIDENCE-026
        - EVIDENCE-030
        - EVIDENCE-032
      rationale: null
      owner: executor
      module_e2e: false
      module_id: null
      owner_repository_id: null
  allowed_paths:
    - test/e2e/product-task-breakdown-contract.test.mjs
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/artifact-path-convention.test.mjs
    - test/e2e/fixtures/prompt-evals.json
    - test/e2e/skill-pack-runner.test.mjs
    - package.json
    - _refs/shared/system-registry.json
    - _refs/shared/system-registry.mjs
    - _refs/shared/artifact-paths.mjs
    - _refs/shared/artifact-lifecycle.mjs
    - _refs/shared/artifact-lifecycle.md
    - _refs/product/task-breakdown/safety.mjs
    - _refs/product/task-breakdown/workspace.mjs
    - _refs/product/task-breakdown/task-format.mjs
    - _refs/product/task-breakdown/sizing.mjs
    - _refs/product/task-breakdown/identity.mjs
    - _refs/harness/capability-contract.json
    - _refs/harness/runtime-policy.mjs
    - _refs/harness/runtime-attestation.mjs
    - _refs/harness/README.md
    - _refs/product/task-breakdown.md
    - _refs/product/task-format.md
    - _refs/product/sizing-rubric.md
    - _refs/product/project-workspace.md
    - _refs/product/source-connectors.md
    - skills/tracks/product/sdcorejs-product.md
    - skills/orchestration/documentation.md
    - test/e2e/support/skill-pack-runner.mjs
    - SECURITY.md
    - CHANGELOG.md
    - .claude/skills/sdcorejs-product/SKILL.md
    - plugin/skills/sdcorejs-product/SKILL.md
    - codex/skills/sdcorejs-product/SKILL.md
    - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-delivery.md
    - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md
    - .sdcorejs/summary.md
    - authoring/evals/uiux/evidence.test.mjs
    - authoring/evals/product-task-breakdown-mode.json
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-10-14-14-40-product-task-breakdown-mode-delivery-r2.md
    - test/e2e/product-task-breakdown-cli.test.mjs
    - test/e2e/product-task-breakdown-flow-contract.test.mjs
    - _refs/product/task-breakdown/check.mjs
    - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-delivery-r3.md
    - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md
    - .sdcorejs/docs/workflow/2026-10-15-16-30-product-task-breakdown-mode-delivery-r4.md
  prohibited_paths:
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - node_modules/**
    - package-lock.json
    - site/**
    - .env*
    - authoring/skills/**
    - authoring/README.md
    - authoring/evals/audit-findings-repair.json
    - authoring/evals/interaction-finish-contract.json
    - authoring/evals/skill-body-progressive-loading.json
    - authoring/evals/scenarios.json
    - authoring/evals/live-agent-matrix.json
    - authoring/evals/run-deterministic.mjs
    - authoring/evals/skill-authoring-contract.mjs
    - authoring/evals/records/**
    - authoring/evals/snapshots/**
    - authoring/evals/transcripts/**
    - authoring/evals/visual-offer/**
    - authoring/evals/uiux/*.json
    - authoring/evals/uiux/*.txt
    - authoring/evals/uiux/README.md
  generated_artifacts:
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .claude/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-delivery.md
    - .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md
    - SECURITY.md
    - CHANGELOG.md
    - .sdcorejs/summary.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-delivery-r3.md
    - .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md
    - .sdcorejs/docs/workflow/2026-10-15-16-30-product-task-breakdown-mode-delivery-r4.md
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
    scope: scripts only
    approval_required: true
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Skill-pack contract, helper ESM, test và Markdown; không có frontend product.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Không có engine/capability của agent application; chỉ là workflow skill pack.
  verification_strategy:
    package_manager: npm
    package_manager_evidence:
      - package.json packageManager npm@10.9.2
      - package-lock.json
    node_runtime: 22.22.3 qua fnm (engines ^22.22.3); Node hệ thống 22.14.0 không dùng để verify
    commands_planned:
      - node --test test/e2e/product-task-breakdown-contract.test.mjs test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs (RED rồi GREEN cho helper, CLI và cổng flow)
      - node --test test/e2e/harness-behavioral-sentinel.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/skill-pack-runner.test.mjs (RED rồi GREEN cho contract/routing)
      - npm run sync:skills (sinh mirror)
      - npm run check:skills
      - npm run check:text-hygiene
      - npm run check:executable-references
      - npm run test:e2e:repository
      - node --test authoring/evals/uiux/evidence.test.mjs (RED rồi GREEN cho continuation mới)
      - node scripts/measure-communication-economy.mjs (số liệu cho VALIDATION.md)
      - node --test --test-concurrency=1 --test-reporter=tap test/e2e/product-task-breakdown-contract.test.mjs test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs test/e2e/harness-behavioral-sentinel.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/skill-pack-runner.test.mjs (lần chạy ghi vào continuation, sau khi VALIDATION.md đã chốt)
    commands_skipped:
      - npm run test:e2e (golden Angular/NestJS/Next.js không bị chạm; chạy nếu suite repository fail ở phần dùng chung)
      - npm install / npm audit (không đổi dependency)
    checks: "Focused: file test mới và 3 test contract/routing bị sửa. Broad: test:e2e:repository, check:skills, text hygiene, executable references."
  parallel_candidates:
    allowed: false
    contract: "Tuần tự: các task chia sẻ registry, lifecycle, capability contract và mirror; workstream B và C phụ thuộc helper của A."
    shared_files:
      - path: package.json
        owner: TASK-005
        strategy: chỉ sửa scripts
      - path: _refs/harness/capability-contract.json
        owner: TASK-014
        strategy: một task duy nhất sửa
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - github.com/sdcorejs/sdcorejs-agent
    contract: Một repo standalone; mọi step mutable dùng Git root sdcorejs-agent.
  branch_policy: "D-015: tạo nhánh mới từ codex/simplify-design-handoff@4703643432f7eda43a1c9ccb19db6669e56575f3 trước khi sửa; không commit/push khi chưa được yêu cầu."
  finish_tail:
    contract: docs_before_final_branch_ready -> verify_before_done -> branch_ready_final_gate -> no_writes_after_branch_ready
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 4
    supersedes: .sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md
    change_reason: "Lần chạy thật thứ hai thất bại: session tương tác không tìm thấy _refs/ trong layout plugin; session headless đọc được ref nhưng vẫn làm trọn mọi việc trong một lượt. r4 thêm điểm dừng lượt đầu chỉ làm G0 (D-021) và chốt thứ tự giao hàng (D-022); lỗi tìm _refs/ của mirror sửa ở change riêng."
  architecture_context:
    schema_version: 1
    source: sdcorejs-architecture
    contract_id: product-task-breakdown-mode-v1
    requirement_id: R-001
    approved_spec_reference:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      artifact_id: spec-product-task-breakdown-mode-v1-r1
      artifact_kind: spec
      revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
      approval_hash: sha256:v1:9868c93ef4fb768ef54299d8885681457f94c21c72e7dda1a2fba8444052f5dc
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-10-14-17-30-product-task-breakdown-mode-r2.md
    approved_architecture_hash: sha256:v1:8de13e08efdc954bfa053deb2f40f8cd773801b749d78f39e7606a1324a5a94f
    owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    owner_module_id: null
    execution_host_repository_id: portal-sales-platform
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    trigger:
      required: true
      signals:
        - persisted-data-model-contract
        - public-api-contract
        - security-trust-boundary
        - state-data-ownership
      rationale: Thêm action source.read/tracker.write vào capability contract dùng chung cho mọi adapter; thêm artifact root và schema config persist trong repo đích; mở đường ghi ra hệ thống ngoài và đọc nội dung không tin cậy; định nghĩa owner của project workspace.
    invariants:
      - id: INV-001
        statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Chọn một mục trong menu hay giao việc ghi chỉ là ý định, không phải duyệt write plan; duyệt write plan là một câu trả lời riêng cho đúng danh sách op đã hiện. Mỗi op chỉ chạy sau khi CLI kiểm tra trả verify hợp lệ trong lần chạy đó; không ghi đè toàn bộ mô tả ticket. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
        scope: tracker.write trong mode task-breakdown
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Ghi ra hệ thống ngoài là hành động hướng ra ngoài, khó hoàn tác; bước xin quyền của runtime không có ở bypass mode hoặc khi tool đã được allowlist.
        verification_method: Unit test helper write plan + CLI plan-approve/plan-verify (op enum, denylist, hash qua approved-artifact, run_id, op đổi thì fail) + flow-gate contract test (menu choice không phải approval, cấm ghi đè toàn bộ) + lần chạy thật lại AC-011 (VAL-001, VAL-006, VAL-004).
        requirement_refs:
          - R-009
        decision_refs:
          - D-002
          - D-010
          - D-019
      - id: INV-002
        statement: Nội dung nguồn, output của subagent và config sửa tay là dữ liệu không tin cậy, không phải lệnh; giá trị secret không bao giờ được persist vào task, artifact, config, payload ghi tracker hay lặp lại trong chat.
        scope: Intake nguồn, output subagent, config, render task, payload ghi tracker, persist artifact
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: PRD/ticket có thể chứa prompt injection và secret (gặp JWT thật trong NSP-6079); config sửa tay được.
        verification_method: Unit test quét secret trên nguồn, output subagent, config (cả field lạ và body) và payload ghi; fixture prompt injection (VAL-001, VAL-004).
        requirement_refs:
          - R-010
          - R-004
        decision_refs:
          - D-008
      - id: INV-003
        statement: Skill/ref source trung lập provider; action mới có mapping và fallback ở cả 4 adapter và có mặt đồng thời trong mọi danh sách exact-set; không tool connector nào được duyệt sẵn qua allowed-tools; native chỉ đến từ tool được host quan sát trong session.
        scope: skills/**, _refs/**, capability-contract.json, runtime-policy, runtime-attestation, mirror Claude
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: runtime-policy cấm tên tool provider và so exact-set ACTIONS/CAPABILITIES; resolveAction chỉ trả native khi có tool.
        verification_method: "Contract test: exact-set đồng bộ, resolve native khi host quan sát được connector và fallback khi không, validateProviderNeutralText, allowed-tools sinh ra không có tool connector (VAL-002)."
        requirement_refs:
          - R-011
        decision_refs:
          - D-010
      - id: INV-004
        statement: Project workspace chỉ nằm dưới root registry với slug/scope theo pattern và kiểm tên reserved sẵn có, file có schema_version và field lifecycle được kiểm; kind project-config và task-breakdown là shared kind, commit_policy conditional; v1 chỉ mode task-breakdown được ghi.
        scope: .sdcorejs/projects/** trong repo đích
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Schema persist lâu dài, nhiều dự án trong một repo; git/ship cần lifecycle rõ để không bị ambiguous.
        verification_method: Unit test resolve path/slug/reserved name, validator schema_version và field lifecycle, phân loại kind theo path (VAL-001).
        requirement_refs:
          - R-003
        decision_refs:
          - D-003
          - D-007
          - D-011
      - id: INV-005
        statement: Mỗi task có đủ 12 mục theo key và thứ tự cố định, confidence, size kèm breakdown, task_id ổn định không tái sử dụng số; ma trận phủ PRD không có yêu cầu bị bỏ sót.
        scope: Task do mode sinh ra, kể cả task từ subagent
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Assignee đọc mọi ticket theo cùng một khung; chạy lại không được tạo trùng.
        verification_method: Unit test validator format/confidence/rubric/phủ PRD và cấp số NN; CLI tasks kiểm block dữ liệu và heading đã render của tasks/<scope>.md (VAL-001).
        requirement_refs:
          - R-005
          - R-006
          - R-007
        decision_refs:
          - D-004
          - D-006
          - D-012
          - D-014
          - D-019
      - id: INV-006
        statement: Cập nhật ticket chỉ thay vùng giữa marker của skill khi fingerprint vùng còn khớp, hoặc chèn section mới; đọc lại ngay trước khi ghi và huỷ nếu ticket đổi so với lúc duyệt; fingerprint phần ngoài vùng giữ nguyên sau khi ghi; không xoá ticket, không chuyển trạng thái.
        scope: Cập nhật ticket có sẵn trên tracker
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Ticket có nội dung/ảnh của PO; markdown rewrite từng làm mất media; PO có thể sửa ticket giữa lúc duyệt và lúc ghi.
        verification_method: Unit test marker parse/merge, fingerprint vùng và phần ngoài vùng, phát hiện thay đổi trước khi ghi + lần chạy thật cập nhật ticket có ảnh (VAL-001, VAL-004).
        requirement_refs:
          - R-009
        decision_refs:
          - D-002
          - D-012
      - id: INV-007
        statement: "Hành vi hiện có giữ nguyên: 23 public skill, mode Seed/Update/Audit của product không đổi, định tuyến TASKID record vẫn vào documentation."
        scope: Toàn bộ skill pack
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Thay đổi phải additive.
        verification_method: test:e2e:repository, prompt-evals, check:skills (VAL-003, VAL-005).
        requirement_refs:
          - R-001
          - R-014
        decision_refs:
          - D-001
      - id: INV-008
        statement: "Các cổng G0..G8 của flow đi đúng thứ tự và không gộp: chưa resolve hoặc tạo xong project (wizard có bản xem trước được duyệt) thì không inventory story và không tách task; inventory story, ticket con có sẵn và vai trò trước khi tách task; có từ 2 story và runtime hỗ trợ subagent thì fan-out read-only; hỏi mức sẵn sàng trước khi gợi ý assignee; bảng đề xuất được duyệt trước khi lưu tasks/<scope>.md; nội dung được kiểm bằng CLI trên đúng bytes trước khi ghi và kiểm lại file sau khi ghi; mỗi cổng dẫn bằng chứng đã định cho cổng đó, NOT RUN chỉ hợp lệ khi kèm lệnh đã thử và lỗi hoặc lời từ chối quyền."
        scope: Flow mode task-breakdown trong skill và _refs/product/task-breakdown.md
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Lần chạy thật cho thấy model đi tắt qua wizard, câu hỏi capacity, bảng đề xuất và fan-out khi các bước chỉ là danh sách; cổng có điểm dừng và bằng chứng phải dẫn làm việc đi tắt lộ ra.
        verification_method: Flow-gate contract test trên skill và ref (thứ tự cổng, điểm dừng, câu hỏi tách riêng, dẫn output CLI hoặc NOT RUN) có mutation guard; lần chạy thật lại (VAL-006, VAL-004).
        requirement_refs:
          - R-003
          - R-004
          - R-008
          - R-009
          - R-012
          - R-013
        decision_refs:
          - D-019
          - D-020
      - id: INV-009
        statement: "CLI kiểm tra chỉ đọc: --root là bắt buộc, được realpath và in lại trong kết luận; chỉ đọc file nằm dưới <root>/.sdcorejs/projects/<slug>/ (kiểm từng đoạn bằng lstat, từ chối symlink ra ngoài và traversal) hoặc stdin; không ghi file, không gọi mạng, tracker hay tiến trình con; slug sai hay path ngoài workspace thì exit 2; in đúng một kết luận JSON và exit code 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O; không bao giờ sửa nội dung ngoài vùng của skill, kể cả để che secret."
        scope: _refs/product/task-breakdown/check.mjs
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: CLI chạy trong repo đích với nội dung không tin cậy; phải là adapter đọc hẹp quanh helper thuần, không thành kênh ghi hay đọc rộng.
        verification_method: "Contract test CLI: path ngoài workspace, traversal, symlink ra ngoài, slug sai bị từ chối exit 2; chạy trong thư mục tạm không đổi file nào; module không import fs ghi, child_process hay net; output là một JSON (VAL-006)."
        requirement_refs:
          - R-003
          - R-010
        decision_refs:
          - D-019
    boundaries:
      - id: BND-001
        statement: "Mode task-breakdown thuộc sdcorejs-product. Ghi chép TASKID một ticket vẫn thuộc sdcorejs-documentation. Phân xử: tạo/tách task hoặc ticket từ PRD/US/sprint/board -> product; ghi requirement record cho một TASKID có sẵn -> documentation. Mô tả product và dòng trigger ticket id của documentation được sửa cho khớp phân xử này; mô tả các mode cũ giữ nguyên."
        invariant_refs:
          - INV-007
      - id: BND-002
        statement: "Parent điều phối mọi side effect (artifact.write, tracker.write, câu hỏi người dùng) và tự đọc tracker (metadata, ticket con). Subagent chạy parallel-dispatch read-only-request, brief chỉ cho phép source.read trên PRD/API spec/code được giao, cấm tracker.write, artifact.write và hỏi người dùng; chỉ trả task draft theo format. Parent validate và quét secret lại output trước khi dùng. Rủi ro còn lại: read-only-request chỉ kiểm path trong repo, không phát hiện subagent gọi tool ghi tracker. Có từ 2 story và capability subagents supported thì fan-out là bắt buộc; chỉ đọc tuần tự khi không có subagent hoặc parallel-dispatch trả SEQUENTIAL, và báo cáo ghi chế độ đọc cùng lý do."
        invariant_refs:
          - INV-001
          - INV-002
          - INV-005
          - INV-008
      - id: BND-003
        statement: "Helper trong _refs/product/task-breakdown/*.mjs (trừ check.mjs) là hàm thuần, xác định được, không I/O tới repo đích, mạng hay tracker (chỉ import module trong skill pack); thêm helper thuần renderTask (render một task từ block dữ liệu ra markdown theo nhãn của dự án) và merge/fingerprint cho rich-json. check.mjs là adapter CLI duy nhất có I/O: chỉ đọc file dưới <root>/.sdcorejs/projects/<slug>/ của repo đích (--root bắt buộc) hoặc stdin, gọi helper thuần và in kết luận; không ghi gì. Mọi ghi file và ghi tracker vẫn do skill thực hiện qua action của capability contract. Skill tìm check.mjs từ gốc skill pack: thư mục tổ tiên gần nhất của SKILL.md có chứa _refs/; không tìm thấy thì dừng và báo lỗi của skill pack, không được ghi NOT RUN."
        invariant_refs:
          - INV-004
          - INV-005
          - INV-009
      - id: BND-004
        statement: "Flow là chuỗi cổng G0..G8, mỗi cổng có điểm dừng và bằng chứng riêng; không cổng nào được gộp với cổng sau trong cùng một câu hỏi. G0 project: resolve, hoặc wizard (bản điền sẵn, hỏi bằng user.choose, bản xem trước, CLI project - trên đúng bytes, user.approve riêng, ghi, CLI project trên file); tạo run_id của lần chạy. G1 intake: đọc nguồn theo chuỗi fallback, CLI scan. G2 inventory: story, trạng thái, ticket con có sẵn và marker, hỏi vai trò cần tách. G3 chế độ đọc: dẫn verdict của parallel-dispatch hoặc trạng thái capability subagents. G4 draft: CLI tasks - (format, confidence, phủ PRD, điểm tính lại từ breakdown). G5 capacity: hỏi mức sẵn sàng của từng người; roster rỗng thì đề nghị bổ sung roster qua bản xem trước hoặc để trống assignee; CLI balance -. G6 đề xuất: bảng theo cột chuẩn kèm bảng cân tải, user.approve riêng, CLI tasks - trên đúng bytes, ghi tasks/<scope>.md, CLI tasks trên file. G7 tracker (chỉ khi người dùng yêu cầu ghi): write plan hiện đủ op, user.approve riêng, CLI plan-approve, rồi cho từng op: đọc lại ticket, CLI drift, CLI plan-verify, CLI merge, ghi, đọc lại; op create lưu key vào block tickets ngay sau khi tạo. G8 báo cáo: in nguyên văn result.table của CLI report. Thứ tự capacity trước bảng đề xuất là cách đọc R-009: bảng đề xuất được duyệt sau khi có capacity và cân tải."
        invariant_refs:
          - INV-001
          - INV-008
    dependency_directions:
      - from: skills/tracks/product/sdcorejs-product.md (mode task-breakdown)
        to: _refs/product/*.md và _refs/product/task-breakdown/*.mjs
        rationale: Chi tiết nạp theo action (private refs); skill không nhân bản logic.
        invariant_refs:
          - INV-005
      - from: _refs/product/task-breakdown/*.mjs
        to: _refs/shared/system-registry.json, artifact-paths.mjs, artifact-lifecycle.mjs, approved-artifact.mjs, repository-contract.mjs
        rationale: Path, kind, lifecycle, hash approval và owner lấy từ helper dùng chung; không hard-code, không viết thuật toán hash approval thứ hai.
        invariant_refs:
          - INV-004
          - INV-001
      - from: mode task-breakdown
        to: sdcorejs-parallel-dispatch (read-only-request)
        rationale: Tái dùng fan-out có sẵn; không tạo cơ chế dispatch thứ hai.
        invariant_refs:
          - INV-002
      - from: resolveAction trong runtime-policy.mjs
        to: observeConnectorTools trong runtime-attestation.mjs
        rationale: Native của source.read/tracker.write chỉ đến từ tool host quan sát trong session, cùng cơ chế observeChoiceTools; adapter mapping tĩnh giữ native rỗng; tool chỉ được xếp vào source.read khi host khai rõ read-only, không rõ thì xếp vào tracker.write và đi qua gate.
        invariant_refs:
          - INV-003
    data_state_owners:
      - subject: Schema, lifecycle và quy tắc ghi của .sdcorejs/projects/** (project.md, task-breakdown.config.md, tasks/<scope>.md)
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        statement: Contract do skill pack sở hữu; v1 chỉ sdcorejs-product mode task-breakdown được ghi; skill khác chỉ đọc cho tới khi registry cấp thêm owner.
        invariant_refs:
          - INV-004
      - subject: Nội dung project workspace trong từng repo đích
        owner_repository_id: resolved-by-resolveArtifactOwner
        statement: "Owner là repo trả về từ resolveArtifactOwner (repository-contract.mjs) cho artifact cấp dự án: repo standalone, hoặc repo portal đang sở hữu .sdcorejs/** trong topology portal + module; không suy từ cwd; mơ hồ thì hỏi; không ghi vào module thay cho portal hay ngược lại khi chưa resolve. Chỉ ghi sau khi người dùng duyệt bản xem trước hoặc write plan."
        invariant_refs:
          - INV-004
          - INV-002
      - subject: Mapping task_id -> ticket key
        owner_repository_id: resolved-by-resolveArtifactOwner
        statement: Nguồn sự thật là tasks/*.md của dự án. Marker trên ticket là dữ liệu không tin cậy, chỉ dùng tạo ứng viên khôi phục trong project/parent đã cấu hình và người dùng xác nhận từng ticket.
        invariant_refs:
          - INV-006
          - INV-002
    public_contracts:
      - id: PC-001
        kind: api
        statement: "Capability action source.read (capability external_source_read) và tracker.write (capability issue_tracker_write), thêm đồng thời vào required_actions/required_capabilities, ACTIONS/CAPABILITIES exact-set của runtime-policy, harness README và test khoá danh sách. Adapter mapping tĩnh cả 4 adapter: status unknown, native []. resolveAction trả native khi observeConnectorTools thấy tool được host khai trong session cho đúng action và mode; không thì fallback. Phân loại fail-closed: tool chỉ thuộc source.read khi host khai read-only (không dựa vào mô tả tool của connector); không rõ thì thuộc tracker.write. Capability external_source_read/issue_tracker_write ở trạng thái unsupported thì luôn ép fallback dù có tool quan sát được. Chuỗi fallback source.read: connector quan sát được -> web.fetch (link public) -> artifact.read (file export trong repo) -> dán nội dung; không bịa. Fallback tracker.write: render bản nháp để copy-paste và báo rõ chưa ghi gì."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: "Additive: chỉ sdcorejs-product đổi required-actions; skill khác và allowed-tools của chúng không đổi; allowed-tools của product không thêm tool connector."
        migration: Không cần migration.
        invariant_refs:
          - INV-003
          - INV-001
      - id: PC-002
        kind: persisted-data-model
        statement: "artifact_roots.project_workspaces = .sdcorejs/projects (thêm vào REQUIRED_ARTIFACT_ROOTS); artifact kinds project-config và task-breakdown, cả hai là shared kind trong artifact-lifecycle với commit_policy conditional và mapping path -> kind. Layout: <root>/<slug>/project.md, <root>/<slug>/task-breakdown.config.md, <root>/<slug>/tasks/<scope>.md. slug và scope dùng lại pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$ của artifact-paths, tối đa 63 ký tự, cộng kiểm tên reserved sẵn có. Frontmatter bắt buộc: artifact_id, artifact_kind, change_ref (project-<slug> cho project-config; task-breakdown-<slug>-<scope> cho task-breakdown), source_spec none, source_plan none, commit_policy conditional, owner sdcorejs-product, schema_version 1, updated_at, redaction_applied. Field lạ được giữ nguyên khi ghi lại; schema_version không hỗ trợ thì từ chối."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Root và kind mới, additive; test khoá danh sách root/kind được cập nhật cùng thay đổi.
        migration: Không có ở v1; version sau migrate bằng lệnh tường minh có xem trước.
        invariant_refs:
          - INV-004
          - INV-002
      - id: PC-003
        kind: persisted-data-model
        statement: "Task identity: task_id = <project-slug>/<source-key>/<role>/<NN>; source-key chuẩn hoá thành chữ in hoa, số và dấu gạch; role theo pattern slug; NN hai chữ số, cấp số kế tiếp theo mapping trong mọi tasks/*.md của dự án; task bị bỏ giữ tombstone, không dùng lại số; khi chạy lại, ghép draft mới với task_id cũ được hiện trong bảng đề xuất để người dùng xác nhận. Marker begin/end mang task_id bao vùng của skill, render theo quy tắc tracker trong config; ticket có sẵn được chèn section mới có marker sau nội dung cũ."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Mới; không đụng TASK-### của plan hay TASKID của documentation.
        migration: Không cần migration.
        invariant_refs:
          - INV-005
          - INV-006
      - id: PC-004
        kind: persisted-data-model
        statement: "Format task 12 mục theo key cố định: tldr, context, scope, work_items, rules_data, done_criteria, dependencies, confirmations, risks, estimate, sources, traceability; header meta task_id, role, source_refs, size_points, confidence, suggested_assignee. Nhãn hiển thị dịch theo ngôn ngữ dự án; validator kiểm theo key. tasks/<scope>.md chứa một block dữ liệu `json sdcorejs-task-breakdown` (schema_version, project_slug, scope, tasks với meta, sections theo key và breakdown rubric, coverage, tombstones, tickets: map task_id -> key ticket và kết quả đọc lại) là nguồn để kiểm. Phần task đã render (từ heading task đầu tiên tới hết task cuối, không gồm các block dữ liệu và write plan) phải bằng đúng renderTask(block, {format: text}) theo nhãn của dự án; CLI tasks so từng byte phần đó sau khi chuẩn hoá dòng, nên cập nhật block tickets hay thêm block write plan không làm file mất hợp lệ. renderTask(block, {format: rich-json}) render cùng nội dung ra tập node tối thiểu (paragraph, heading, bullet list, table, code) cho tracker rich-json, không thêm dependency. CLI tính lại điểm từ breakdown và đọc các tasks/*.md khác cùng slug để kiểm không dùng lại số NN; với stdin thì --slug và --scope là bắt buộc."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Mới.
        migration: Không cần migration.
        invariant_refs:
          - INV-005
      - id: PC-005
        kind: persisted-data-model
        statement: "Write plan: danh sách op {create, update} với ticket đích hoặc parent, tiêu đề, assignee, field; không có op xoá và không có field trạng thái/transition/resolution. Approval identity của write plan tạo và verify bằng createApprovedArtifact/verifyApprovedArtifact. Body được hash là JSON ổn định (key sắp xếp) của danh sách op, lưu trong block write plan riêng của tasks/<scope>.md, tách khỏi các section cập nhật sau (key ticket, kết quả đọc lại). Metadata cố định: artifact_kind task-breakdown, artifact_id write-plan-<slug>-<scope>-<run_id>, contract_id task-breakdown:<slug>:<scope>, requirement_id <scope>, change_ref task-breakdown-<slug>-<scope>, track product, stack_profile product, owner_repository_id theo resolveArtifactOwner, source_revision là HEAD 40 hex của repo đích lúc duyệt, repository_relative_path là path của tasks/<scope>.md, parent_references [], run_id của lần chạy. Verify phải khớp run_id hiện tại; plan của lần chạy trước phải duyệt lại. Repo đích không có Git revision thì không tạo được approval: tracker.write rơi về fallback copy-paste. Mỗi ticket update lưu fingerprint sha256 của vùng skill và của phần ngoài vùng tại thời điểm duyệt. Tên block duy nhất là `json sdcorejs-write-plan`; mỗi run_id một block, hai block cùng run_id là không hợp lệ. Mỗi op update mang luôn format của ticket (text hoặc rich-json) và fingerprint của vùng skill cùng phần ngoài vùng lấy tại lúc duyệt, nên fingerprint nằm trong body được hash. CLI plan-approve nhận nội dung hiện tại của các ticket cần update trên stdin, tính fingerprint, và tạo approval với --run-id, --source-revision (skill lấy bằng git rev-parse HEAD chỉ đọc trong repo owner), --owner-repository-id, --owner-repository-role, --owner-module-id, --approved-by, --approved-at (ISO UTC); repository_relative_path suy từ path file so với --root. run_id do skill tạo ở G0; rủi ro còn lại: run_id do model cung cấp ở cả hai đầu."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Mới.
        migration: Không cần migration.
        invariant_refs:
          - INV-001
          - INV-006
      - id: PC-006
        kind: api
        statement: "CLI kiểm tra: node <pack-root>/_refs/product/task-breakdown/check.mjs <command> --root <target-root> [args]; <pack-root> là thư mục tổ tiên gần nhất của SKILL.md có chứa _refs/. Command: project <file|->; tasks <file> | tasks - --slug <slug> --scope <scope>; scan - (nội dung nguồn); balance - (roster, mức sẵn sàng, task và điểm); plan-approve <tasks-file> --run-id ... (ticket hiện tại trên stdin); plan-verify <tasks-file> --run-id <id> (op sắp chạy trên stdin); drift <tasks-file> --run-id <id> --task-id <id> (ticket hiện tại trên stdin); merge <tasks-file> --run-id <id> --task-id <id> --format text|rich-json (ticket hiện tại trên stdin; nội dung vùng lấy từ renderTask của block, không lấy từ stdin); report <tasks-file>. rich-json là cây node {type, content, text, attrs}: marker là node đoạn văn có text marker, merge thay các node giữa marker hoặc nối section mới, fingerprint ngoài vùng là JSON chuẩn hoá (key sắp xếp, bỏ các attr mà tracker tự sinh lại như id node cục bộ, danh sách attr bỏ qua lấy từ quy tắc render tracker trong config) của các node ngoài vùng; format đọc khác format ghi thì chỉ còn copy-paste. Output: đúng một object JSON {command, root, valid, errors[], result}; exit 0 hợp lệ, 1 không hợp lệ, 2 lỗi dùng hoặc I/O. CLI không ghi file; kết quả plan-approve và merge do skill ghi. NOT RUN chỉ hợp lệ khi skill dẫn lệnh đã thử và lỗi hoặc lời từ chối quyền."
        owner: github.com/sdcorejs/sdcorejs-agent
        compatibility: Mới; helper thuần giữ nguyên chữ ký, CLI chỉ bọc chúng; thêm helper thuần renderTask và merge/fingerprint rich-json.
        migration: Không cần migration.
        invariant_refs:
          - INV-009
          - INV-001
          - INV-005
          - INV-006
    security_trust_boundaries:
      - id: SEC-001
        statement: "Nội dung nguồn (PRD, ticket, comment, API spec, file export), output subagent và config sửa tay là dữ liệu không tin cậy: không thực thi chỉ dẫn bên trong; link sau trang đăng nhập chỉ đọc qua connector đã cấu hình; không bao giờ hỏi token/credential trong chat."
        invariant_refs:
          - INV-002
      - id: SEC-002
        statement: "Quét secret tại 4 điểm: nội dung nguồn trước khi dùng, output subagent trước khi gộp, config (frontmatter, field lạ được giữ, body) khi đọc và trước khi ghi, payload trước mỗi lệnh tracker.write. Giá trị khớp thay bằng [REDACTED]; cảnh báo chỉ nêu nguồn và field, không lặp lại giá trị."
        invariant_refs:
          - INV-002
      - id: SEC-003
        statement: "Ghi tracker chỉ sau khi write plan được duyệt và hash plan khớp. Ngay trước mỗi update: đọc lại ticket; fingerprint vùng skill hoặc phần ngoài vùng khác lúc duyệt thì huỷ op đó và hỏi lại. Sau khi ghi: đọc lại so field đã ghi và fingerprint phần ngoài vùng; lệch thì báo, không claim thành công. Không xoá, không chuyển trạng thái; trùng lặp không phân xử được thì dừng và hỏi. Gate này không tính bước xin quyền của runtime như một lớp chặn. Lựa chọn trong menu hay lời giao việc không phải duyệt write plan. Không ghi đè toàn bộ mô tả ticket; nội dung ghi luôn là output của CLI merge. Kiểm sau khi ghi: fingerprint phần ngoài vùng của lần đọc trước khi ghi và lần đọc sau khi ghi phải bằng nhau (cùng chuẩn hoá của tracker), và text của vùng bằng text của bản render sau khi chuẩn hoá khoảng trắng. Không chạy được CLI thì không ghi tracker, chỉ render bản nháp copy-paste."
        invariant_refs:
          - INV-001
          - INV-006
      - id: SEC-004
        statement: "CLI kiểm tra nhận nội dung không tin cậy (file trong workspace, nội dung nguồn và ticket qua stdin): không thực thi, không eval, không theo đường dẫn ghi trong nội dung; chỉ đọc file dưới workspace đã resolve, từ chối traversal và symlink ra ngoài. Secret trong vùng của skill thì thay bằng [REDACTED] trước khi merge; secret ngoài vùng thì báo theo vị trí và exit 1, không bao giờ sửa nội dung đó, và op đó chuyển sang bản nháp copy-paste kèm cảnh báo cho người dùng."
        invariant_refs:
          - INV-009
          - INV-002
          - INV-006
    cross_repository_integration: []
    adopted_decision_refs:
      - D-001
      - D-002
      - D-003
      - D-004
      - D-005
      - D-006
      - D-007
      - D-008
      - D-009
      - D-010
      - D-011
      - D-012
      - D-013
      - D-014
      - D-015
      - D-018
      - D-019
      - D-020
    deferred_decision_refs: []
    assumption_refs:
      - A-001
      - A-002
      - A-003
      - A-004
      - A-005
    validation_obligations:
      - id: VAL-001
        expected_proof: "Unit test RED trước/PASS sau cho helper: resolve path/slug/reserved name; phân loại kind và field lifecycle; validator config (secret ở frontmatter, field lạ và body; field thiếu; roster sai dạng; quy tắc lần chạy không persist); format 12 mục; confidence; rubric và ngưỡng Fibonacci; cân tải có và không có velocity, mức sẵn sàng 0, tổng point 0; phủ PRD; task_id, cấp NN, tombstone; marker parse/merge và fingerprint vùng/ngoài vùng; write plan (op enum, denylist, approval qua approved-artifact với body là JSON ổn định của op, metadata cố định, từ chối run_id khác, đổi op thì verify fail, repo không có Git revision thì fallback); quét secret trên nguồn, output subagent, config và payload; fixture prompt injection; render báo cáo. Thêm: renderTask cho text và rich-json (tập node tối thiểu); merge và fingerprint rich-json (giữ node media ngoài vùng, nối section khi chưa có marker, bỏ attr tracker tự sinh); file task vẫn hợp lệ sau khi cập nhật block tickets và thêm block write plan; tasks - thiếu --slug/--scope bị từ chối; CLI project/tasks/scan/balance/plan-approve/plan-verify/drift/merge/report trả kết luận đúng cho file hợp lệ, file thiếu field (như project.md của lần chạy thật), markdown lệch renderTask(block), điểm lệch breakdown, NN dùng lại ở file khác cùng slug, hai block write plan cùng run_id, fingerprint trong op đã hash, op đổi sau duyệt, run_id khác, secret ngoài vùng."
        owner: executor
        invariant_refs:
          - INV-001
          - INV-002
          - INV-004
          - INV-005
          - INV-006
        acceptance_criterion_refs:
          - AC-003
          - AC-005
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-010
          - AC-012
          - AC-013
          - AC-015
          - AC-017
          - AC-019
      - id: VAL-002
        expected_proof: "Contract test: source.read/tracker.write và external_source_read/issue_tracker_write có mặt đồng thời trong capability-contract, ACTIONS/CAPABILITIES của runtime-policy, harness README và test khoá danh sách; 4 adapter có status/native/fallback/capability; resolveAction trả native khi host quan sát được connector cho đúng action/mode và trả fallback khi không; tool không khai read-only không được dùng cho source.read; capability unsupported luôn ép fallback; validateProviderNeutralText sạch trên skill/ref mới; allowed-tools sinh ra của sdcorejs-product không chứa tool connector."
        owner: executor
        invariant_refs:
          - INV-003
        acceptance_criterion_refs:
          - AC-014
      - id: VAL-003
        expected_proof: Prompt eval mới cho task-breakdown vào product, prompt TASKID cũ vẫn vào documentation; toàn bộ prompt-evals pass.
        owner: executor
        invariant_refs:
          - INV-007
        acceptance_criterion_refs:
          - AC-001
      - id: VAL-004
        expected_proof: "Evidence lần chạy thật: nguồn không đọc được và chuỗi fallback, wizard lần đầu, gate write plan + read-back, cập nhật ticket có ảnh và ticket bị sửa giữa lúc duyệt và lúc ghi, nguồn có prompt injection và secret, fan-out read-only; kèm kết quả kiểm A-004 trên Claude Code. Lần chạy thật lại sau r2: wizard chạy và chờ duyệt, câu hỏi mức sẵn sàng, bảng đề xuất được duyệt trước khi lưu, fan-out với 2 story, write plan hiện đủ op và chờ câu duyệt riêng, output CLI được dẫn ở mỗi cổng, ghi một update theo marker rồi đọc lại."
        owner: user + executor
        invariant_refs:
          - INV-001
          - INV-002
          - INV-006
          - INV-008
        acceptance_criterion_refs:
          - AC-002
          - AC-004
          - AC-011
          - AC-016
      - id: VAL-005
        expected_proof: npm run check:skills và npm run test:e2e:repository xanh trên Node 22.22.3; số public skill = 23; CHANGELOG Unreleased.
        owner: executor
        invariant_refs:
          - INV-007
        acceptance_criterion_refs:
          - AC-018
      - id: VAL-006
        expected_proof: "Contract test RED trước/PASS sau: (1) flow-gate trên skill và _refs/product/task-breakdown.md: có G0..G8 theo thứ tự, mỗi cổng có điểm dừng và bằng chứng đã định, câu duyệt write plan tách khỏi lựa chọn menu, cấm ghi đè toàn bộ, NOT RUN phải kèm lệnh đã thử và lỗi, fan-out bắt buộc khi đủ điều kiện, quy tắc tìm gốc skill pack; mutation guard xoá từng câu thì test fail. Test text chỉ chứng minh hướng dẫn có mặt; hành vi được chứng minh ở VAL-004. (2) CLI: --root bắt buộc, giới hạn workspace, từ chối traversal/symlink/slug sai với exit 2; import trực tiếp của check.mjs không có API ghi file, tiến trình con hay mạng; chạy mọi command trong thư mục tạm rồi so snapshot file trước và sau là bằng nhau; output một JSON."
        owner: executor
        invariant_refs:
          - INV-001
          - INV-008
          - INV-009
        acceptance_criterion_refs:
          - AC-005
          - AC-012
          - AC-013
    profile_sections:
      frontend_architecture_ref: null
      agent_architecture_ref: null
    change_control:
      revision: 2
      supersedes: architecture-product-task-breakdown-mode-v1-r1
```
