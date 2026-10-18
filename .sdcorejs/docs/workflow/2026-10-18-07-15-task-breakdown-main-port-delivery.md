---
artifact_id: delivery-task-breakdown-main-port-v1-r2
artifact_kind: execution-doc
change_ref: task-breakdown-main-port-v1
source_spec: .sdcorejs/specs/workflow/2026-10-17-21-39-task-breakdown-main-port-r3.md
source_plan: .sdcorejs/plans/workflow/2026-10-18-07-15-task-breakdown-main-port-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 1fca9c3fa90cd259056234b27cf978a606fd927b
supersedes: .sdcorejs/docs/workflow/2026-10-17-22-02-task-breakdown-main-port-delivery.md
status: completed
---

# Delivery r2 — Merge main vào nhánh port task-breakdown

## Trạng thái
- Nhánh `feat/task-breakdown-mode-main` (PR #82). Nội dung port nằm trong commit `4cbf77b`. Plan r2 thêm một merge commit từ `origin/main` `1fca9c3`.
- Graph: spec r3 (`sha256:v1:da68770d…`) → architecture r3 (`sha256:v1:2bd9ef5b…`) → plan r2 (`sha256:v1:6948139c…`). Plan r2 thay plan r1 (`sha256:v1:d677d8a5…`).
- Delivery r1 (`2026-10-17-22-02-task-breakdown-main-port-delivery.md`) giữ nguyên làm lịch sử của lần port đầu.

## Vì sao có r2
- Sau khi PR #82 được tạo, `main` nhận thêm #81 (cleanup storage audit, `1fca9c3`), nên PR #82 xung đột.
- #81 sửa `test/e2e/support/skill-pack-runner.mjs`, `authoring/evals/uiux/evidence.test.mjs`, summary và skill cleanup.
- #81 cũng thêm mắt xích evidence `authoring/evals/records/cleanup-storage-audit.json`.
- Người dùng duyệt plan r2 bằng `1`.

## Việc đã làm
| Task | Nội dung |
|---|---|
| Merge | `git merge --no-ff --no-commit origin/main`: đúng 4 file xung đột như lần chạy thử (2 mirror skill cleanup, summary, evidence test) |
| TASK-006 | 2 mirror skill cleanup lấy bản `main`; `npm run sync:skills` không đổi thêm file nào; `check:skills` in sync |
| TASK-007 | Summary: tính lại `dependency_manifests` và `generated_at`; 4 fingerprint khớp cây hiện tại |
| TASK-008 | `evidence.test.mjs` dựng lại từ bản `main` `1fca9c3`: mắt xích storage kiểm theo lịch sử tại `1fca9c3`; mắt xích port nối sau mắt xích storage và trỏ plan r2 |
| TASK-009 | VALIDATION.md: mục port trỏ plan r2 và chuỗi evidence mới; số đo economy không đổi |
| TASK-010 | `task-breakdown-port-continuation.{json,txt}` ghi lại: 115/115; `previous_sources` là hash tại `1fca9c3`; chỉ đổi một path bị bind là `test/e2e/support/skill-pack-runner.mjs` |
| TASK-011 | Kiểm parity, quét thông tin nội bộ, full suite; doc này |

So với lần chạy thử trong worktree tạm, kết quả giải xung đột chỉ khác ở `generated_at` của summary và đường dẫn, hash plan trong evidence test.

## Kiểm parity và không mang thừa (AC-001, AC-002)
Chạy lại `pt-parity.mjs` trên cây đã merge:
- 25 file giống từng byte với `f19c72c`;
- 11 file ghép đúng;
- 1 file điều chỉnh khớp khai báo (`mirror-refs-resolution.test.mjs`);
- 1 file giữ bản `main` (`production-readiness-contract.test.mjs`);
- khối parser trong `approved-artifact.mjs` ok;
- không mang thừa: 0 chỗ; `problems: []`.

## Kiểm rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed.
- `npm run check:executable-references`: exit 0.
- Fingerprint của summary khớp cây sau merge.
- `node --test authoring/evals/uiux/evidence.test.mjs`: 6/6 (thêm 1 test của mắt xích storage từ `main`).
- Lệnh tập trung của record: 115/115.
- `npm run test:e2e:repository` (2026-10-18T00:31:19Z → 00:36:34Z): 677/680.
  - 3 fail là đúng 3 case baseline của `main` trên máy này (`skill-authoring-contract`: new-skill decision gate, behavioral evidence, live-agent matrix).
  - Nguyên nhân: `currentRepositoryId` giữ hậu tố `.git` của remote https.
- Quét thông tin nội bộ trên diff so với `origin/main` (179 file) và file mới: không có tên người, key ticket hay domain nội bộ.

## Còn để ngỏ
- Đóng #78, #79, #80: chỉ làm khi người dùng xác nhận riêng (D-006).
- Lỗi `currentRepositoryId` của `main` với remote có `.git`: ngoài phạm vi; nên mở change riêng.
- Kiểm đọc lại sau khi ghi tracker thật (AC-011 của change product): khi người dùng cho phép ghi lên ticket thử.
