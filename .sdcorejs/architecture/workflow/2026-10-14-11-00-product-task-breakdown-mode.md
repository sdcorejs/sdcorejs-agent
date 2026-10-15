---
acceptance_criteria_count: 19
approval_gate: sdcorejs-architecture:approval
approval_reply: "1"
approval_source: explicit-user-choice
approved_at: 2026-10-14T04:58:08.488Z
approved_by: user
approved_draft_fingerprint: sha256:7b705ab876e71b706e184e80bcf7cbc7ed7db46e2d4c11988b224d592a4d418b
artifact_id: architecture-product-task-breakdown-mode-v1-r1
artifact_kind: architecture
change_control:
  change_reason: null
  revision: 1
  supersedes: null
change_ref: product-task-breakdown-mode-v1
commit_policy: with-change
contract_id: product-task-breakdown-mode-v1
description: "Lean shared decisions for the sdcorejs-product task-breakdown mode: capability surface, project workspace, tracker write gate, ownership."
execution_host_repository_id: portal-sales-platform
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
manual_criteria_count: 4
name: product-task-breakdown-mode
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:9868c93ef4fb768ef54299d8885681457f94c21c72e7dda1a2fba8444052f5dc
    artifact_id: spec-product-task-breakdown-mode-v1-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
parent_repository_id: null
profile_confidence: high
redaction_applied: true
repository_relative_path: .sdcorejs/architecture/workflow/2026-10-14-11-00-product-task-breakdown-mode.md
requirement_id: R-001
schema_version: 1
sourceDraftPath: .sdcorejs/docs/architecture/2026-10-14-11-00-product-task-breakdown-mode-architecture.md
source_plan: none
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
stack_profile: markdown-skill-pack
supersedes: null
target_root_kind: sdcorejs-agent-authoring-repo
track: workflow
approval_hash: sha256:v1:cd093ad662b42bbe489d6a67b470af4bd705009c78939feb75e0f218f2a2e0ec
---
# Mode task-breakdown của sdcorejs-product — Approved Architecture

> Immutable snapshot approved by explicit reply `1` to the architecture r1 gate (draft revision 3). Embedded draft fields preserve the reviewed pre-approval state; verified artifact metadata governs approval. This approval authorizes planning, not implementation or Git operations.

## Approved contract

# Architecture — Mode task-breakdown của sdcorejs-product — r1

## Parent và authority
- **Approved spec:** `.sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md`. Approval hash `sha256:v1:9868c93ef4fb768ef54299d8885681457f94c21c72e7dda1a2fba8444052f5dc`. Người dùng duyệt bằng reply `1`; lần duyệt đó chốt luôn D-011..D-015. `verifyApprovedArtifactGraph` trả PASS.
- **Repo:** standalone. Owner được xác định bằng `resolveArchitectureOwner` theo nhánh integration-owner với topology chỉ có một repo. Đây chỉ là cách dùng API, không phải thay đổi cross-repository.
- **Decision coverage revision 2:** giữ nguyên mọi record của spec, thêm `A-004` và `INV-001..INV-007`.
- **Trigger:** giữ nguyên văn signal và rationale của spec.
- **Giới hạn:** bản nháp này chưa duyệt plan, chưa cấp quyền implementation hay Git.
- **Revision của nháp:** frontmatter `revision` đếm số lần sửa nháp. Chữ "r1" trên tiêu đề và `change_control.revision: 1` là revision approved đầu tiên của artifact.

## Quyết định kiến trúc
Chỉ ghi những điểm mà các unit làm độc lập có thể hiểu khác nhau. Thứ tự file và task thuộc plan.

### AD-1. Capability surface cho nguồn và tracker (D-010, PC-001)
- **Action và capability mới.** Thêm `source.read` (capability `external_source_read`) và `tracker.write` (capability `issue_tracker_write`). Phải thêm **đồng thời** vào các danh sách sau, nếu thiếu một chỗ thì `resolveAction` chặn mọi action:
  - `required_actions` / `required_capabilities` của `capability-contract.json`;
  - exact-set `ACTIONS` / `CAPABILITIES` của `runtime-policy.mjs`;
  - harness README;
  - các test đang khoá cứng danh sách.
- **Mapping tĩnh.** Cả 4 adapter đều `status: unknown`, `native: []`.
- **Cách chọn native lúc chạy.** Theo cùng cơ chế với `observeChoiceTools`: `resolveAction` gọi `observeConnectorTools(runtime, action)`. Host phải khai trong session tool nào làm được `source.read` / `tracker.write` ở mode hiện tại, chưa bị tắt và không bị cấm. Có tool đó thì trả `native`, không có thì trả fallback.
- **Phân loại đọc/ghi fail-closed.** Tool chỉ được dùng cho `source.read` khi **host** khai rõ là read-only. Mô tả tool của connector là dữ liệu không tin cậy nên không dùng để phân loại. Không rõ thì coi là `tracker.write` và đi qua gate; subagent không được dùng tool đó.
- **Capability `unsupported`.** Nếu `external_source_read` hoặc `issue_tracker_write` ở trạng thái `unsupported` thì luôn dùng fallback, kể cả khi quan sát được tool.
- **Không duyệt sẵn tool connector.** Lý do: `allowed-tools` của mirror Claude sinh từ `native` tĩnh, nên không thêm tool connector nào.
- **Chuỗi fallback của `source.read`:** connector quan sát được → `web.fetch` (link public) → `artifact.read` (file export trong repo) → dán nội dung. Không bao giờ bịa nội dung.
- **Fallback của `tracker.write`:** render bản nháp để copy-paste, kèm thông báo rõ là chưa ghi gì lên tracker.
- **Tracker cũng là một nguồn.** Đọc ticket, metadata và ticket con đi qua `source.read`. Chỉ tạo/sửa ticket mới dùng `tracker.write`.
- **Gate do skill giữ.** Gate ghi chỉ dựa vào write plan đã duyệt (INV-001). Bước xin quyền của runtime không được tính là một lớp chặn, vì bypass mode hoặc allowlist có thể bỏ qua bước này.
- **A-004.** Giả định `allowed-tools` chỉ duyệt sẵn chứ không giới hạn tool. Nếu sai, trên Claude Code tool connector (cả đọc lẫn ghi) bị chặn: `source.read` rơi về `web.fetch`/export/dán, còn `tracker.write` chỉ còn đường copy-paste, cho tới khi có quyết định riêng về khai tên tool. Kiểm bằng lần chạy thật trong VAL-004.

### AD-2. Project workspace và lifecycle (D-003, D-007, D-011, PC-002)
- **Registry.**
  - `artifact_roots.project_workspaces = .sdcorejs/projects`, thêm vào `REQUIRED_ARTIFACT_ROOTS`.
  - Thêm 2 kind: `project-config` cho `project.md` và `task-breakdown.config.md`; `task-breakdown` cho `tasks/<scope>.md`.
- **Lifecycle.**
  - Cả 2 kind đều là **shared kind** trong `artifact-lifecycle`, theo tiền lệ của `auto-task-tracker`: state bền của dự án, không gắn với một change.
  - `commit_policy: conditional`.
  - Thêm mapping path → kind cho `.sdcorejs/projects/**`, để closure của git/ship không bị `ambiguous`.
- **Layout.**
  - `<root>/<slug>/project.md`
  - `<root>/<slug>/task-breakdown.config.md`
  - `<root>/<slug>/tasks/<scope>.md`
- **Đặt tên `slug` và `scope`.** Dùng lại pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` của `artifact-paths`, tối đa 63 ký tự, cộng kiểm tên reserved sẵn có (`con`, `nul`…).
- **Frontmatter bắt buộc:** `artifact_id`, `artifact_kind`, `change_ref` (`project-<slug>` cho `project-config`, `task-breakdown-<slug>-<scope>` cho `task-breakdown`), `source_spec: none`, `source_plan: none`, `commit_policy: conditional`, `owner: sdcorejs-product`, `schema_version: 1`, `updated_at`, `redaction_applied`.
  - Field lạ được giữ nguyên khi ghi lại.
  - `schema_version` không hỗ trợ thì từ chối.
- **Nội dung `project.md`:** tên, slug, key/alias; tracker (loại, project key, issue type, mapping field); nguồn (loại, pattern, `read_via`); glossary; ngôn ngữ.
- **Nội dung `task-breakdown.config.md`:** vai trò; roster; velocity; rubric override; quy tắc render của tracker (định dạng, checkbox, cách giữ media); lưu ý của tracker.
- **Thời điểm ghi `tasks/<scope>.md`.** Ghi khi bảng đề xuất được duyệt. Sau đó cập nhật thêm: write plan đã duyệt, key ticket, kết quả đọc lại.

### AD-3. Ownership (state-data-ownership)
- **Schema và quy tắc ghi** của `.sdcorejs/projects/**` thuộc skill pack. Ở v1 chỉ `sdcorejs-product` mode `task-breakdown` được ghi; skill khác chỉ đọc. Muốn thêm owner phải đổi registry.
- **Nội dung** thuộc repo do `resolveArtifactOwner` (`repository-contract.mjs`) trả về cho artifact cấp dự án. Đó là repo standalone, hoặc repo portal đang sở hữu `.sdcorejs/**` trong topology portal + module. Không suy từ cwd; mơ hồ thì hỏi.
- **Mapping `task_id` → ticket key:** nguồn sự thật là `tasks/*.md` của dự án.

### AD-4. Trust boundary và giao thức ghi tracker (SEC-001..003, PC-003, PC-005)
- **Dữ liệu không tin cậy.** Gồm nội dung nguồn, output của subagent và config sửa tay. Chỉ dẫn bên trong chúng không được thực thi. Link nằm sau trang đăng nhập chỉ đọc qua connector. Không hỏi token trong chat.
- **Quét secret tại 4 điểm:**
  1. nội dung nguồn trước khi dùng;
  2. output của subagent trước khi gộp;
  3. config (frontmatter, field lạ, body) khi đọc và trước khi ghi;
  4. payload trước mỗi lệnh `tracker.write`.

  Giá trị khớp thay bằng `[REDACTED]`. Cảnh báo chỉ nêu nguồn và field.
- **Write plan.**
  - Chỉ có op `create` và `update`. Không có op xoá, không có field trạng thái / transition / resolution.
  - Approval identity của plan tạo và verify bằng `createApprovedArtifact` / `verifyApprovedArtifact`, không viết thuật toán hash thứ hai.
  - **Body được hash** là JSON ổn định (key sắp xếp) của danh sách op. Body nằm trong block `approved-write-plan` riêng của `tasks/<scope>.md`, tách khỏi các phần cập nhật sau (key ticket, kết quả đọc lại), nên các lần cập nhật đó không làm hỏng việc verify.
  - **Metadata cố định:**
    - `artifact_kind: task-breakdown`
    - `artifact_id: write-plan-<slug>-<scope>-<run_id>`
    - `contract_id: task-breakdown:<slug>:<scope>`
    - `requirement_id: <scope>`
    - `change_ref: task-breakdown-<slug>-<scope>`
    - `track: product`, `stack_profile: product`
    - `owner_repository_id` lấy theo `resolveArtifactOwner`
    - `source_revision`: HEAD của repo đích lúc duyệt
    - `repository_relative_path`: path của `tasks/<scope>.md`
    - `parent_references: []`
    - `run_id` của lần chạy
  - **Verify:** `run_id` phải khớp lần chạy hiện tại; plan của lần chạy trước phải được duyệt lại. Trước khi ghi phải verify với danh sách op sắp chạy; plan đổi thì duyệt lại.
  - **Repo đích không có Git revision:** không tạo được approval, nên `tracker.write` rơi về fallback copy-paste.
- **Vùng của skill.**
  - Marker begin/end mang `task_id`, render theo config.
  - Ticket do skill tạo: chỉ thay phần giữa marker.
  - Ticket có sẵn: chèn section mới có marker sau nội dung cũ.
  - Tracker có định dạng làm hỏng media khi rewrite: ghi bằng định dạng native, nối thêm thay vì thay thế.
- **Kiểm ticket trước và sau khi ghi.**
  - Lúc duyệt: lưu fingerprint sha256 của vùng skill và của phần ngoài vùng.
  - Ngay trước khi update: đọc lại ticket. Fingerprint khác thì huỷ op đó và hỏi lại. Điều này bắt cả trường hợp PO sửa hay chèn ảnh giữa hai marker, và trường hợp ghi đồng thời.
  - Sau khi ghi: đọc lại để so field đã ghi và fingerprint phần ngoài vùng. Lệch thì báo, không claim thành công.
- **Khôi phục từ marker.** Marker là dữ liệu không tin cậy. Chỉ tạo ứng viên trong project/parent đã cấu hình, và người dùng phải xác nhận từng ticket.
- **`task_id`** có dạng `<project-slug>/<source-key>/<role>/<NN>`.
  - `source-key` chuẩn hoá thành chữ in hoa, số và dấu gạch.
  - `role` theo pattern slug.
  - `NN` lấy số kế tiếp theo mapping trong mọi `tasks/*.md` của dự án.
  - Task bị bỏ giữ tombstone, không dùng lại số.
  - Chạy lại: việc ghép draft mới với `task_id` cũ hiện trong bảng đề xuất để người dùng xác nhận.

### AD-5. Đọc song song (BND-002)
- **Parent** tự đọc tracker (metadata, ticket con) và giữ mọi side effect.
- **Subagent** chạy `read-only-request` với `write_policy: deny`.
  - Brief chỉ cho `source.read` trên PRD / API spec / code được giao.
  - Cấm `tracker.write`, `artifact.write` và hỏi người dùng.
  - Chỉ trả task draft theo format.
- **Parent** validate và quét secret lại output trước khi dùng.
- **Rủi ro còn lại:** `read-only-request` chỉ kiểm path trong repo, nên không phát hiện được subagent gọi tool ghi tracker. Giảm thiểu bằng brief và bằng việc parent đối chiếu write plan; rủi ro này được ghi rõ trong ref.
- **Không có subagent:** đọc tuần tự, kết quả cùng format.

### AD-6. Helper thuần (BND-003, PC-004)
- **Phạm vi.** `_refs/product/*.mjs` là hàm thuần, xác định được, không I/O tới repo đích, mạng hay tracker. Chỉ import module trong skill pack: registry, artifact-paths, artifact-lifecycle, approved-artifact, repository-contract.
- **12 key của task:** `tldr`, `context`, `scope`, `work_items`, `rules_data`, `done_criteria`, `dependencies`, `confirmations`, `risks`, `estimate`, `sources`, `traceability`.
- **Header meta:** `task_id`, `role`, `source_refs`, `size_points`, `confidence`, `suggested_assignee`.
- **Rubric.** Các yếu tố là `ui_surface`, `logic_complexity`, `integration`, `unknowns`, `test_effort`, `regression_risk`. Ngưỡng Fibonacci đặt trong ref và được test khoá lại. Từ 13 điểm có cờ nên tách.
- **Cân tải, có velocity.** `velocity_per_member` là số point một người làm được trong một sprint khi sẵn sàng 100%. Capacity của mỗi người = `velocity_per_member` × mức sẵn sàng. load% = point được giao ÷ capacity × 100.
- **Cân tải, không có velocity.** Tính tương đối. load% = (point của người ÷ tổng point) ÷ (mức sẵn sàng của người ÷ tổng mức sẵn sàng) × 100.
- **Trường hợp biên.**
  - Mức sẵn sàng 0%: người đó không nhận task mới; nếu vẫn được giao thì cảnh báo.
  - Tổng point bằng 0: load 0%, không cảnh báo.
- **Cảnh báo quá tải:** vượt 100% thì cảnh báo. Bảng ghi rõ đang dùng chế độ tuyệt đối hay tương đối.

### AD-7. Định tuyến (BND-001)
- **Product nhận:** tạo/tách task hoặc ticket từ PRD/US/sprint/board; rà soát US để tạo task.
- **Documentation giữ:** ghi requirement record cho một TASKID có sẵn.
- **Sửa mô tả:** sửa description của product và dòng trigger "ticket id" của documentation cho khớp phân xử trên. Mô tả và hành vi của các mode Seed/Update/Audit giữ nguyên.
- **Prompt eval:** thêm cho cả hai phía.

## Invariant và proof obligations
- **INV-001 — Gate ghi tracker do skill giữ.** Write plan phải được duyệt và hash khớp; chỉ op `create`/`update`, không có field trạng thái; đọc lại trước khi claim. Proof: VAL-001 (helper write plan), VAL-004.
- **INV-002 — Dữ liệu không tin cậy và secret.** Áp cho nguồn, output subagent, config và payload. Proof: VAL-001 (quét 4 điểm, fixture prompt injection), VAL-004.
- **INV-003 — Trung lập provider, exact-set đồng bộ, native chỉ từ tool được quan sát.** Proof: VAL-002.
- **INV-004 — Contract và lifecycle của project workspace.** Proof: VAL-001.
- **INV-005 — Format task, truy vết, `task_id` không dùng lại số.** Proof: VAL-001.
- **INV-006 — Cập nhật giữ nội dung ngoài vùng; phát hiện ticket bị sửa giữa lúc duyệt và lúc ghi.** Proof: VAL-001, VAL-004.
- **INV-007 — Hành vi cũ giữ nguyên.** Proof: VAL-003, VAL-005.

19 AC của spec được gom vào VAL-001..VAL-005. Architecture không đổi phạm vi spec và không đặt thứ tự implementation.

## Review và validation status
- **Parent:** graph của approved spec verify PASS. Owner và write scope kiểm bằng `resolveArchitectureOwner` và `validateArchitectureWriteScope`, cho cả path nháp lẫn path approved dự kiến: PASS.
- **Typed context:** `validateArchitectureContext` chỉ còn 2 blocker chờ approval, `ARCHITECTURE_PATH_INVALID` và `ARCHITECTURE_HASH_INVALID`. Không dùng hash giả. Decision coverage rev 2 hợp lệ ở stage spec, có 47 future gap cho plan.
- **Review read-only riêng, lượt 1 (nháp r1): chưa sẵn sàng.**
  - **3 BLOCKER:**
    - `native: []` + `unknown` làm `tracker.write` luôn rơi về fallback;
    - rationale của trigger lệch với spec (`TRIGGER_IDENTITY_MISMATCH`);
    - `.sdcorejs/projects/**` chưa có lifecycle.
  - **7 CONCERN:**
    - INV-001/INV-006 chưa có VAL tự động;
    - fingerprint vùng, ghi đồng thời, marker không tin cậy;
    - phạm vi quét secret;
    - "hai lớp chặn" nói quá, subagent ghi tracker;
    - cấp số `NN`;
    - regex slug;
    - repo đích lúc chạy.
  - **6 NOTE.**
  - **Nháp r2 xử lý:**
    - AD-1 thêm `observeConnectorTools`, chuỗi fallback, yêu cầu đồng bộ exact-set, bỏ claim hai lớp chặn;
    - trigger chép nguyên văn từ spec;
    - AD-2 thêm shared kind, `commit_policy: conditional`, mapping path → kind, frontmatter lifecycle;
    - AD-4 thêm write plan với op enum/denylist và hash qua `approved-artifact`, fingerprint vùng và phần ngoài vùng, đọc lại trước và sau khi ghi, khôi phục marker có xác nhận, quét secret 4 điểm, quy tắc cấp `NN`/tombstone;
    - AD-3 dùng `resolveArtifactOwner`;
    - AD-5 nêu rõ rủi ro còn lại của subagent;
    - AD-6 có công thức cân tải 2 chế độ;
    - các note: PC-004 đổi sang `persisted-data-model`, INV-004 thêm D-003, INV-005 thêm D-014, mô tả product/documentation sửa theo AD-7, BND-003 định nghĩa lại "không I/O".
- **Lượt xác nhận (nháp r2): sẵn sàng trình duyệt, không còn blocker.**
  - Validator chạy lại: chỉ còn 2 blocker chờ approval; `validateArchitecturePrePlanHandoff` không còn `TRIGGER_IDENTITY_MISMATCH`.
  - Mọi mục của lượt 1 đã xử lý.
  - Có 2 CONCERN mới: approval của write plan chưa định nghĩa body/metadata/lần chạy; phân loại tool đọc/ghi chưa fail-closed.
  - Có 3 NOTE: velocity theo người hay theo team và các trường hợp biên; capability `unsupported`; giá trị `change_ref` cho shared kind.
- **Nháp r3 xử lý cả 5 mục:**
  - AD-4/PC-005: body là JSON ổn định của op, metadata cố định, `run_id`, fallback khi không có Git revision;
  - AD-1/PC-001: phân loại fail-closed theo khai báo read-only của host, capability `unsupported` thì luôn fallback;
  - AD-6: velocity theo người và các trường hợp biên;
  - AD-2/PC-002: giá trị `change_ref`;
  - VAL-001/VAL-002: thêm case tương ứng.

## Typed draft context
```yaml
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
  approved_architecture_path: null
  approved_architecture_hash: null
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
      statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
      scope: tracker.write trong mode task-breakdown
      owner: github.com/sdcorejs/sdcorejs-agent
      rationale: Ghi ra hệ thống ngoài là hành động hướng ra ngoài, khó hoàn tác; bước xin quyền của runtime không có ở bypass mode hoặc khi tool đã được allowlist.
      verification_method: Unit test helper write plan (op enum, denylist field trạng thái, hash qua approved-artifact, đối chiếu hash trước khi ghi) + lần chạy thật AC-011 (VAL-001, VAL-004).
      requirement_refs:
        - R-009
      decision_refs:
        - D-002
        - D-010
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
      verification_method: Unit test validator format/confidence/rubric/phủ PRD và cấp số NN (VAL-001).
      requirement_refs:
        - R-005
        - R-006
        - R-007
      decision_refs:
        - D-004
        - D-006
        - D-012
        - D-014
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
  boundaries:
    - id: BND-001
      statement: "Mode task-breakdown thuộc sdcorejs-product. Ghi chép TASKID một ticket vẫn thuộc sdcorejs-documentation. Phân xử: tạo/tách task hoặc ticket từ PRD/US/sprint/board -> product; ghi requirement record cho một TASKID có sẵn -> documentation. Mô tả product và dòng trigger ticket id của documentation được sửa cho khớp phân xử này; mô tả các mode cũ giữ nguyên."
      invariant_refs:
        - INV-007
    - id: BND-002
      statement: "Parent điều phối mọi side effect (artifact.write, tracker.write, câu hỏi người dùng) và tự đọc tracker (metadata, ticket con). Subagent chạy parallel-dispatch read-only-request, brief chỉ cho phép source.read trên PRD/API spec/code được giao, cấm tracker.write, artifact.write và hỏi người dùng; chỉ trả task draft theo format. Parent validate và quét secret lại output trước khi dùng. Rủi ro còn lại: read-only-request chỉ kiểm path trong repo, không phát hiện subagent gọi tool ghi tracker."
      invariant_refs:
        - INV-001
        - INV-002
        - INV-005
    - id: BND-003
      statement: Helper trong _refs/product/*.mjs là hàm thuần, xác định được, không I/O tới repo đích, mạng hay tracker (chỉ import module trong skill pack, ví dụ registry); mọi đọc/ghi do skill thực hiện qua action của capability contract.
      invariant_refs:
        - INV-004
        - INV-005
  dependency_directions:
    - from: skills/tracks/product/sdcorejs-product.md (mode task-breakdown)
      to: _refs/product/*.md và _refs/product/*.mjs
      rationale: Chi tiết nạp theo action (private refs); skill không nhân bản logic.
      invariant_refs:
        - INV-005
    - from: _refs/product/*.mjs
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
      statement: "Format task 12 mục theo key cố định: tldr, context, scope, work_items, rules_data, done_criteria, dependencies, confirmations, risks, estimate, sources, traceability; header meta task_id, role, source_refs, size_points, confidence, suggested_assignee. Nhãn hiển thị dịch theo ngôn ngữ dự án; validator kiểm theo key."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới.
      migration: Không cần migration.
      invariant_refs:
        - INV-005
    - id: PC-005
      kind: persisted-data-model
      statement: "Write plan: danh sách op {create, update} với ticket đích hoặc parent, tiêu đề, assignee, field; không có op xoá và không có field trạng thái/transition/resolution. Approval identity của write plan tạo và verify bằng createApprovedArtifact/verifyApprovedArtifact. Body được hash là JSON ổn định (key sắp xếp) của danh sách op, lưu trong block approved-write-plan riêng của tasks/<scope>.md, tách khỏi các section cập nhật sau (key ticket, kết quả đọc lại). Metadata cố định: artifact_kind task-breakdown, artifact_id write-plan-<slug>-<scope>-<run_id>, contract_id task-breakdown:<slug>:<scope>, requirement_id <scope>, change_ref task-breakdown-<slug>-<scope>, track product, stack_profile product, owner_repository_id theo resolveArtifactOwner, source_revision là HEAD 40 hex của repo đích lúc duyệt, repository_relative_path là path của tasks/<scope>.md, parent_references [], run_id của lần chạy. Verify phải khớp run_id hiện tại; plan của lần chạy trước phải duyệt lại. Repo đích không có Git revision thì không tạo được approval: tracker.write rơi về fallback copy-paste. Mỗi ticket update lưu fingerprint sha256 của vùng skill và của phần ngoài vùng tại thời điểm duyệt."
      owner: github.com/sdcorejs/sdcorejs-agent
      compatibility: Mới.
      migration: Không cần migration.
      invariant_refs:
        - INV-001
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
      statement: "Ghi tracker chỉ sau khi write plan được duyệt và hash plan khớp. Ngay trước mỗi update: đọc lại ticket; fingerprint vùng skill hoặc phần ngoài vùng khác lúc duyệt thì huỷ op đó và hỏi lại. Sau khi ghi: đọc lại so field đã ghi và fingerprint phần ngoài vùng; lệch thì báo, không claim thành công. Không xoá, không chuyển trạng thái; trùng lặp không phân xử được thì dừng và hỏi. Gate này không tính bước xin quyền của runtime như một lớp chặn."
      invariant_refs:
        - INV-001
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
  deferred_decision_refs: []
  assumption_refs:
    - A-001
    - A-002
    - A-003
    - A-004
  validation_obligations:
    - id: VAL-001
      expected_proof: "Unit test RED trước/PASS sau cho helper: resolve path/slug/reserved name; phân loại kind và field lifecycle; validator config (secret ở frontmatter, field lạ và body; field thiếu; roster sai dạng; quy tắc lần chạy không persist); format 12 mục; confidence; rubric và ngưỡng Fibonacci; cân tải có và không có velocity, mức sẵn sàng 0, tổng point 0; phủ PRD; task_id, cấp NN, tombstone; marker parse/merge và fingerprint vùng/ngoài vùng; write plan (op enum, denylist, approval qua approved-artifact với body là JSON ổn định của op, metadata cố định, từ chối run_id khác, đổi op thì verify fail, repo không có Git revision thì fallback); quét secret trên nguồn, output subagent, config và payload; fixture prompt injection; render báo cáo."
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
      expected_proof: "Evidence lần chạy thật: nguồn không đọc được và chuỗi fallback, wizard lần đầu, gate write plan + read-back, cập nhật ticket có ảnh và ticket bị sửa giữa lúc duyệt và lúc ghi, nguồn có prompt injection và secret, fan-out read-only; kèm kết quả kiểm A-004 trên Claude Code."
      owner: user + executor
      invariant_refs:
        - INV-001
        - INV-002
        - INV-006
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
  profile_sections:
    frontend_architecture_ref: null
    agent_architecture_ref: null
  change_control:
    revision: 1
    supersedes: null
decision_coverage:
  schema_version: 1
  revision: 2
  records:
    - id: R-001
      type: requirement
      statement: sdcorejs-product có mode task-breakdown; prompt tách task/tạo ticket từ PRD/US định tuyến vào mode này, không vào documentation TASKID.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-002
      type: requirement
      statement: "Nhận nguồn US/PRD tổng quát: board, sprint, filter, danh sách key, link PRD, nội dung dán, file export; nguồn không đọc được thì hướng dẫn connector, không bịa nội dung."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-003
      type: requirement
      statement: Context theo dự án ở .sdcorejs/projects/<slug>/ (project.md, task-breakdown.config.md, tasks/<scope>.md), đăng ký trong registry; tự nhận dự án từ đầu vào hoặc cho chọn/tạo mới.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-004
      type: requirement
      statement: Config lần đầu qua wizard điền sẵn + structured choice + xem trước + duyệt; cập nhật qua lệnh, gợi ý ask|update|skip trong lúc chạy, hoặc sửa tay có validator; không lưu secret; quy tắc từng lần chạy không lưu trừ khi người dùng nói "luôn".
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-005
      type: requirement
      statement: Mỗi task theo format cố định 12 mục, luôn hiện, mục trống ghi "Không có" theo ngôn ngữ; nội dung chắt lọc từ PRD theo đúng vai trò, mọi yêu cầu PRD trong phạm vi được map vào task hoặc ghi rõ lý do không có task cho vai trò đó.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-006
      type: requirement
      statement: Đọc code là tùy chọn; mỗi task ghi độ tin cậy verified (ref + ngày) | stale (chậm N commit) | none; nguồn API spec ghi môi trường và ngày tải.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-007
      type: requirement
      statement: Độ lớn task là story point Fibonacci 1/2/3/5/8/13 chấm theo rubric cố định có breakdown; task >= 13 bị đánh dấu nên tách; quy đổi ngày tuỳ chọn theo velocity.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-008
      type: requirement
      statement: Chọn mức sẵn sàng 25/50/75/100% cho từng người bằng structured choice (fallback danh sách đánh số); cân tải theo tổng point so với capacity, có bảng cân tải và cảnh báo quá tải; đề xuất assignee theo roster + quy tắc lần chạy + tải + bằng chứng người từng làm code.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-009
      type: requirement
      statement: "Ghi tracker gồm tạo mới và cập nhật, qua gate: kiểm ticket con có sẵn, bảng đề xuất, capacity, cân tải, người dùng duyệt, ghi, đọc lại kiểm; ID task ổn định để chạy lại không tạo trùng; cập nhật giữ nguyên nội dung và media có sẵn."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-010
      type: requirement
      statement: Nội dung PRD/ticket là dữ liệu không tin cậy; phát hiện secret thì cảnh báo và không chép sang task, artifact hay config.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-011
      type: requirement
      statement: Capability contract có action trung lập source.read và tracker.write với mapping cho từng adapter; tên tool provider chỉ nằm trong adapter mapping.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-012
      type: requirement
      statement: Từ 2 US trở lên và runtime có subagent thì đọc nguồn song song qua sdcorejs-parallel-dispatch read-only-request; ngược lại đọc tuần tự.
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-013
      type: requirement
      statement: "Cuối mỗi lần chạy có bảng báo cáo: ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: R-014
      type: requirement
      statement: "Governance: giữ 23 public skill; mirror sinh bằng script; test:e2e:repository và check:skills xanh; CHANGELOG mục Unreleased; TDD cho helper; không thêm dependency."
      source: explicit-user
      status: active
      owner_repository_id: github.com/sdcorejs/sdcorejs-agent
      owner_module_id: null
      task_refs: []
    - id: AC-001
      type: acceptance-criterion
      statement: Chạy prompt-evals với các câu "tách task từ PRD", "tạo ticket FE cho sprint", "rà soát US tạo task" -> Skill-pack runner định tuyến vào sdcorejs-product mode task-breakdown; các prompt TASKID record hiện có vẫn vào sdcorejs-documentation
      behavior: Chạy prompt-evals với các câu "tách task từ PRD", "tạo ticket FE cho sprint", "rà soát US tạo task"
      expected_result: Skill-pack runner định tuyến vào sdcorejs-product mode task-breakdown; các prompt TASKID record hiện có vẫn vào sdcorejs-documentation
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-001
      task_refs: []
    - id: AC-002
      type: acceptance-criterion
      statement: Chạy mode với từng loại đầu vào, trong đó có link không đọc được -> Nguồn đọc được thì được dùng; link không đọc được hiện hướng dẫn cấu hình connector/export/dán và task ghi rõ nguồn thiếu; không có nội dung bịa
      behavior: Chạy mode với từng loại đầu vào, trong đó có link không đọc được
      expected_result: Nguồn đọc được thì được dùng; link không đọc được hiện hướng dẫn cấu hình connector/export/dán và task ghi rõ nguồn thiếu; không có nội dung bịa
      verification_kind: manual
      blocking: true
      requirement_refs:
        - R-002
      task_refs: []
    - id: AC-003
      type: acceptance-criterion
      statement: Gọi helper resolve đường dẫn project workspace với slug hợp lệ và không hợp lệ -> Trả đúng .sdcorejs/projects/<slug>/{project.md,task-breakdown.config.md,tasks/<scope>.md} theo registry root; slug sai dạng bị từ chối
      behavior: Gọi helper resolve đường dẫn project workspace với slug hợp lệ và không hợp lệ
      expected_result: Trả đúng .sdcorejs/projects/<slug>/{project.md,task-breakdown.config.md,tasks/<scope>.md} theo registry root; slug sai dạng bị từ chối
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-003
      task_refs: []
    - id: AC-004
      type: acceptance-criterion
      statement: Chạy lần đầu cho dự án chưa có config -> Wizard điền sẵn giá trị suy ra, hỏi bằng structured choice, hiện bản xem trước; chỉ ghi file sau khi người dùng duyệt
      behavior: Chạy lần đầu cho dự án chưa có config
      expected_result: Wizard điền sẵn giá trị suy ra, hỏi bằng structured choice, hiện bản xem trước; chỉ ghi file sau khi người dùng duyệt
      verification_kind: manual
      blocking: true
      requirement_refs:
        - R-004
      task_refs: []
    - id: AC-005
      type: acceptance-criterion
      statement: Validate config có secret, thiếu field bắt buộc, roster sai dạng, và config có quy tắc từng lần chạy -> Validator báo lỗi có mã ổn định cho từng trường hợp; giá trị dạng secret bị từ chối; quy tắc lần chạy không được persist
      behavior: Validate config có secret, thiếu field bắt buộc, roster sai dạng, và config có quy tắc từng lần chạy
      expected_result: Validator báo lỗi có mã ổn định cho từng trường hợp; giá trị dạng secret bị từ chối; quy tắc lần chạy không được persist
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-004
      task_refs: []
    - id: AC-006
      type: acceptance-criterion
      statement: Validate task thiếu mục, sai thứ tự, mục trống bị bỏ đi -> Validator từ chối; task đủ 12 mục đúng thứ tự, mục trống có nhãn "Không có" theo ngôn ngữ thì hợp lệ
      behavior: Validate task thiếu mục, sai thứ tự, mục trống bị bỏ đi
      expected_result: Validator từ chối; task đủ 12 mục đúng thứ tự, mục trống có nhãn "Không có" theo ngôn ngữ thì hợp lệ
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-005
      task_refs: []
    - id: AC-007
      type: acceptance-criterion
      statement: Validate task thiếu confidence hoặc confidence verified mà không có ref + ngày -> Validator từ chối; verified cần ref và ngày, stale cần số commit chậm, none cần ghi chú
      behavior: Validate task thiếu confidence hoặc confidence verified mà không có ref + ngày
      expected_result: Validator từ chối; verified cần ref và ngày, stale cần số commit chậm, none cần ghi chú
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-006
      task_refs: []
    - id: AC-008
      type: acceptance-criterion
      statement: Chấm điểm các bộ input rubric mẫu -> Ra đúng point Fibonacci và breakdown theo từng yếu tố; tổng >= 13 có cờ nên tách; có velocity thì quy đổi ngày, không có thì bỏ qua
      behavior: Chấm điểm các bộ input rubric mẫu
      expected_result: Ra đúng point Fibonacci và breakdown theo từng yếu tố; tổng >= 13 có cờ nên tách; có velocity thì quy đổi ngày, không có thì bỏ qua
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-007
      task_refs: []
    - id: AC-009
      type: acceptance-criterion
      statement: Cân tải với roster, mức sẵn sàng 25/50/75/100 và danh sách task có point -> Bảng cân tải đúng capacity, tổng point, % tải; người quá 100% bị cảnh báo; cân theo tổng point chứ không theo số task
      behavior: Cân tải với roster, mức sẵn sàng 25/50/75/100 và danh sách task có point
      expected_result: Bảng cân tải đúng capacity, tổng point, % tải; người quá 100% bị cảnh báo; cân theo tổng point chứ không theo số task
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-008
      task_refs: []
    - id: AC-010
      type: acceptance-criterion
      statement: Đề xuất assignee khi có quy tắc lần chạy và bằng chứng người từng làm code -> Đề xuất tôn trọng quy tắc và capacity, ghi lý do; quy tắc lần chạy không có trong config sau khi chạy
      behavior: Đề xuất assignee khi có quy tắc lần chạy và bằng chứng người từng làm code
      expected_result: Đề xuất tôn trọng quy tắc và capacity, ghi lý do; quy tắc lần chạy không có trong config sau khi chạy
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-008
      task_refs: []
    - id: AC-011
      type: acceptance-criterion
      statement: Chạy luồng tạo + cập nhật ticket trên tracker có ticket con sẵn -> Không có lệnh ghi nào trước khi người dùng duyệt bảng đề xuất; sau khi ghi có báo cáo đọc lại; ticket con sẵn có được đánh dấu thay vì tạo trùng
      behavior: Chạy luồng tạo + cập nhật ticket trên tracker có ticket con sẵn
      expected_result: Không có lệnh ghi nào trước khi người dùng duyệt bảng đề xuất; sau khi ghi có báo cáo đọc lại; ticket con sẵn có được đánh dấu thay vì tạo trùng
      verification_kind: manual
      blocking: true
      requirement_refs:
        - R-009
      task_refs: []
    - id: AC-012
      type: acceptance-criterion
      statement: Chạy lại cùng phạm vi sau khi đã ghi tracker -> ID task ổn định khớp marker trong ticket; kế hoạch ghi là cập nhật, không tạo mới; phần nội dung/media ngoài vùng của skill được giữ nguyên
      behavior: Chạy lại cùng phạm vi sau khi đã ghi tracker
      expected_result: ID task ổn định khớp marker trong ticket; kế hoạch ghi là cập nhật, không tạo mới; phần nội dung/media ngoài vùng của skill được giữ nguyên
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-009
      task_refs: []
    - id: AC-013
      type: acceptance-criterion
      statement: Quét nguồn có JWT, API key, password URL -> Có cảnh báo kèm vị trí; giá trị bị thay bằng [REDACTED]; không xuất hiện trong task, artifact, config
      behavior: Quét nguồn có JWT, API key, password URL
      expected_result: Có cảnh báo kèm vị trí; giá trị bị thay bằng [REDACTED]; không xuất hiện trong task, artifact, config
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-010
      task_refs: []
    - id: AC-014
      type: acceptance-criterion
      statement: Chạy contract test capability và runtime-policy -> source.read và tracker.write có trong required_actions và mapping cả 4 adapter; skill/ref source không chứa tên tool provider
      behavior: Chạy contract test capability và runtime-policy
      expected_result: source.read và tracker.write có trong required_actions và mapping cả 4 adapter; skill/ref source không chứa tên tool provider
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-011
      task_refs: []
    - id: AC-015
      type: acceptance-criterion
      statement: Chạy mode khi không có quyền đọc code -> Lần chạy hoàn tất; mọi task có confidence none và ghi chú rõ; không có đường dẫn file bịa
      behavior: Chạy mode khi không có quyền đọc code
      expected_result: Lần chạy hoàn tất; mọi task có confidence none và ghi chú rõ; không có đường dẫn file bịa
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-006
      task_refs: []
    - id: AC-016
      type: acceptance-criterion
      statement: "Chạy với >= 2 US khi runtime hỗ trợ và không hỗ trợ subagent -> Có subagent: fan-out read-only qua parallel-dispatch; không có: đọc tuần tự; kết quả cùng format"
      behavior: Chạy với >= 2 US khi runtime hỗ trợ và không hỗ trợ subagent
      expected_result: "Có subagent: fan-out read-only qua parallel-dispatch; không có: đọc tuần tự; kết quả cùng format"
      verification_kind: manual
      blocking: true
      requirement_refs:
        - R-012
      task_refs: []
    - id: AC-017
      type: acceptance-criterion
      statement: Render báo cáo cuối từ danh sách task -> Bảng có đúng các cột ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì
      behavior: Render báo cáo cuối từ danh sách task
      expected_result: Bảng có đúng các cột ticket | US | vai trò | mô tả ngắn | size | assignee | đang chờ gì
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-013
      task_refs: []
    - id: AC-018
      type: acceptance-criterion
      statement: Chạy npm run check:skills và npm run test:e2e:repository trên Node 22.22.3 -> Cả hai xanh; số public skill vẫn 23; CHANGELOG có entry Unreleased
      behavior: Chạy npm run check:skills và npm run test:e2e:repository trên Node 22.22.3
      expected_result: Cả hai xanh; số public skill vẫn 23; CHANGELOG có entry Unreleased
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-014
      task_refs: []
    - id: AC-019
      type: acceptance-criterion
      statement: Validate ma trận phủ PRD -> task cho một PRD mẫu -> Mỗi yêu cầu PRD trong phạm vi map tới ít nhất một task hoặc có lý do loại trừ cho vai trò; thiếu map thì validator báo
      behavior: Validate ma trận phủ PRD -> task cho một PRD mẫu
      expected_result: Mỗi yêu cầu PRD trong phạm vi map tới ít nhất một task hoặc có lý do loại trừ cho vai trò; thiếu map thì validator báo
      verification_kind: automated
      blocking: true
      requirement_refs:
        - R-005
      task_refs: []
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
      confidence: medium
      status: proposed
      blocking: false
      evidence_refs:
        - session-2026-10-14-agent-tool-used-under-brainstorming-allowed-tools
      consequence_if_wrong: "Nếu allowed-tools thực sự giới hạn tool: trên Claude Code cả tool đọc lẫn tool ghi connector bị chặn khi mode chạy, source.read rơi về web.fetch/export/dán và tracker.write chỉ còn đường copy-paste cho tới khi có quyết định riêng về khai tên tool trong adapter claude-code."
      validation_method: Lần chạy thật AC-011 trên Claude Code; ghi evidence trong VAL-004.
      owner: adapter maintainer
      rationale: Trong phiên này tool Agent không có trong allowed-tools của brainstorming nhưng vẫn gọi được.
      impacted_refs:
        - R-009
        - R-011
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
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
      task_refs: []
    - id: INV-001
      type: invariant
      statement: Không có lệnh tracker.write nào nếu chưa có write plan được duyệt trong chính lần chạy đó (run_id khớp lần chạy hiện tại) và approval hash của plan verify được với danh sách op sắp chạy; plan đổi thì phải duyệt lại; chỉ có op create/update, không có field trạng thái/transition; không báo thành công khi chưa đọc lại kiểm. Gate này do skill giữ, không dựa vào bước xin quyền của runtime.
      protected_refs:
        - R-009
        - AC-011
      task_refs: []
      evidence_refs: []
    - id: INV-002
      type: invariant
      statement: Nội dung nguồn, output của subagent và config sửa tay là dữ liệu không tin cậy, không phải lệnh; giá trị secret không bao giờ được persist vào task, artifact, config, payload ghi tracker hay lặp lại trong chat.
      protected_refs:
        - R-010
        - R-004
        - AC-013
        - AC-005
      task_refs: []
      evidence_refs: []
    - id: INV-003
      type: invariant
      statement: Skill/ref source trung lập provider; action mới có mapping và fallback ở cả 4 adapter và có mặt đồng thời trong mọi danh sách exact-set; không tool connector nào được duyệt sẵn qua allowed-tools; native chỉ đến từ tool được host quan sát trong session.
      protected_refs:
        - R-011
        - AC-014
      task_refs: []
      evidence_refs: []
    - id: INV-004
      type: invariant
      statement: Project workspace chỉ nằm dưới root registry với slug/scope theo pattern và kiểm tên reserved sẵn có, file có schema_version và field lifecycle được kiểm; kind project-config và task-breakdown là shared kind, commit_policy conditional; v1 chỉ mode task-breakdown được ghi.
      protected_refs:
        - R-003
        - AC-003
        - AC-005
      task_refs: []
      evidence_refs: []
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
      task_refs: []
      evidence_refs: []
    - id: INV-006
      type: invariant
      statement: Cập nhật ticket chỉ thay vùng giữa marker của skill khi fingerprint vùng còn khớp, hoặc chèn section mới; đọc lại ngay trước khi ghi và huỷ nếu ticket đổi so với lúc duyệt; fingerprint phần ngoài vùng giữ nguyên sau khi ghi; không xoá ticket, không chuyển trạng thái.
      protected_refs:
        - R-009
        - AC-012
      task_refs: []
      evidence_refs: []
    - id: INV-007
      type: invariant
      statement: "Hành vi hiện có giữ nguyên: 23 public skill, mode Seed/Update/Audit của product không đổi, định tuyến TASKID record vẫn vào documentation."
      protected_refs:
        - R-001
        - R-014
        - AC-001
        - AC-018
      task_refs: []
      evidence_refs: []
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
```

## Decisions captured during review
- Người dùng trả lời `1` tại gate duyệt architecture ngày 2026-10-14, duyệt nháp revision 3.
- Review read-only riêng: lượt 1 có 3 BLOCKER, sửa ở r2; lượt 2 kết luận sẵn sàng trình duyệt kèm 2 CONCERN và 3 NOTE, sửa ở r3; r3 không có lượt review riêng.

## Skill provenance
sdcorejs-architecture (approved on attempt 1 / 3)
