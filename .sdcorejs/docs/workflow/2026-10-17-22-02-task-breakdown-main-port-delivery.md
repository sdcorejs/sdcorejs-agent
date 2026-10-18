---
artifact_id: delivery-task-breakdown-main-port-v1-r1
artifact_kind: execution-doc
change_ref: task-breakdown-main-port-v1
source_spec: .sdcorejs/specs/workflow/2026-10-17-21-39-task-breakdown-main-port-r3.md
source_plan: .sdcorejs/plans/workflow/2026-10-17-22-02-task-breakdown-main-port.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: fb64f8c2905cd79c6027e02ea847560cc09c8b42
status: completed
---

# Delivery — Port mode task-breakdown, sửa mirror _refs và hướng dẫn nguồn lên main

## Trạng thái
- Nhánh `feat/task-breakdown-mode-main`, tạo từ `origin/main` `fb64f8c`. Chưa commit.
- Graph: spec r3 (`sha256:v1:da68770d…`) → architecture r3 (`sha256:v1:2bd9ef5b…`) → plan (`sha256:v1:d677d8a5…`, 11 task, tuần tự). Đã làm đủ 11 task.
- Nguồn nội dung: commit `f19c72c` (đỉnh của PR #80, chồng trên #79 và #78).

## Lịch sử revision
- Spec r1 → r2: tập file là 40, không phải 42; `main` có 24 public skill, không phải 23.
- Spec r2 → r3 và architecture r2 → r3: chạy thử port tìm thêm phụ thuộc vào nhánh nền là khối parser của `parseApprovedFrontmatter` và option `runtime` của `resolveAction`.
- Người dùng duyệt từng revision bằng `1`.

## Việc đã làm
| Task | Nội dung |
|---|---|
| TASK-001, TASK-002 | Chép nguyên 25 file từ `f19c72c` |
| TASK-003 | 7 file ghép ba chiều sạch (bản `main`, base `4703643`, nguồn `f19c72c`) |
| TASK-004 | `package.json`; `runtime-attestation.mjs` chỉ thêm `observeConnectorTools`; `runtime-policy.mjs` thêm import, exact-set, option `runtime` và nhánh connector; test sentinel chỉ có `case-task-breakdown-capability-contract`; `approved-artifact.mjs` thêm khối parser |
| TASK-005 | Test mirror đếm theo số skill thay cho số 46 ghi cứng |
| TASK-006 | `npm run sync:skills` sinh lại 121 file mirror và harness json; `check:skills` in sync |
| TASK-007 | Summary: ghép ghi chú của 3 change, tính lại `dependency_manifests` và `generated_at`; 4 fingerprint khớp cây hiện tại |
| TASK-008 | `evidence.test.mjs`: mắt xích `cleanup-review-repair` chuyển sang kiểm theo lịch sử tại `fb64f8c`; thêm validator cho mắt xích port |
| TASK-009 | VALIDATION.md: số đo economy mới (JIT +6,274 byte do mode mới), mục mới cho port |
| TASK-010 | `authoring/evals/uiux/task-breakdown-port-continuation.{json,txt}`: 115/115; chỉ đổi một path bị bind là `test/e2e/support/skill-pack-runner.mjs` |
| TASK-011 | Kiểm parity, kiểm không mang thừa, quét thông tin nội bộ, full suite; doc này |

## Kiểm parity và không mang thừa (AC-001, AC-002)
Lệnh kiểm một lần (`pt-parity.mjs`), kết quả trên cây hiện tại:

| Nhóm | Kết quả |
|---|---|
| Giống từng byte với `f19c72c` | 25/25 |
| Ghép đúng: mọi dòng của 3 change có mặt, không có dòng chỉ thuộc nhánh nền | 11/11 (7 ghép sạch, `package.json`, `runtime-attestation.mjs`, `runtime-policy.mjs`, test sentinel) |
| Điều chỉnh khớp khai báo | `test/e2e/mirror-refs-resolution.test.mjs` |
| Giữ bản `main` | `test/e2e/production-readiness-contract.test.mjs` |
| Viết lại theo cấu trúc `main` | `VALIDATION.md`, `authoring/evals/uiux/evidence.test.mjs` |
| Khối parser trong `approved-artifact.mjs` | Giống từng byte bản ở `4703643`: `FRONTMATTER_KEY`, `DOUBLE_QUOTED_ESCAPES`, `resolvePlainScalar`, `parseApprovedFrontmatter` |
| Không mang thừa | `observeChoiceTools`, `case-repair-policy-ask-native`, `APPROVED_SEPARATOR_CUTOFF` và nhánh native choice: 0 chỗ; `resolveAction` có `runtime` nhưng không có `failed_surfaces`; không có record nào của nhánh nền hay của 3 change cũ |

- **Lỗi bắt được trong lần kiểm đầu:** hàm trích `observeConnectorTools` lùi tới dòng trống gần nhất nên kéo theo cả `observeChoiceTools` vào `runtime-attestation.mjs`. Test không bắt được vì hàm thừa không được gọi.
- **Cách sửa:** chỉ lấy các dòng comment ngay trên hàm. Sau đó sinh lại mirror, ghi lại record và chạy lại toàn bộ kiểm.
- **Thay thế có chủ đích được khai báo trong bộ kiểm:** danh sách test của `package.json`; dòng import của `runtime-policy.mjs`.

## Kiểm rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed.
- `npm run check:executable-references`: exit 0.
- `node --test authoring/evals/uiux/evidence.test.mjs`: 5/5.
- Lệnh tập trung của record: 115/115.
- `npm run test:e2e:repository` (2026-10-17T23:19:57Z → 23:24:58Z): 676/679.
  - 3 fail là đúng 3 case baseline của `main` trên máy này (`skill-authoring-contract`: new-skill decision gate, behavioral evidence, live-agent matrix).
  - Nguyên nhân: `currentRepositoryId` giữ hậu tố `.git` của remote https.
  - Baseline `main` gốc: 627/630 với cùng 3 case.
- Quét thông tin nội bộ trên 178 file thay đổi: không có tên người, key ticket hay domain nội bộ. Trường `execution_host_repository_id` vẫn ghi tên repo điều phối, giống tiền lệ trên `main`.

## Lần chạy thật
Không chạy lại (D-003). File skill, ref và CLI của mode giống từng byte với bản đã chạy thật ở lần thứ ba và thứ tư (PR #79, #80), nên kết quả của hai lần đó vẫn áp dụng.

## Còn để ngỏ
- Commit, push và PR vào `main`: chờ người dùng quyết.
- Đóng #78, #79, #80 sau khi PR mới được tạo: chỉ làm khi người dùng xác nhận riêng (D-006).
- Lỗi `currentRepositoryId` của `main` với remote có `.git`: ngoài phạm vi; nên mở change riêng.
- Kiểm đọc lại sau khi ghi tracker thật (AC-011 của change product): khi người dùng cho phép ghi lên ticket thử.
