---
artifact_id: delivery-product-task-breakdown-mode-v1-r3
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md
supersedes: .sdcorejs/docs/workflow/2026-10-14-14-40-product-task-breakdown-mode-delivery-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: in-progress
---

# Delivery r3 — Mode task-breakdown của sdcorejs-product

## Trạng thái
- Nhánh `feat/product-task-breakdown-mode`, tạo từ `4703643`. Chưa commit.
- Plan r3 (`sha256:v1:3efd386e…`) thay plan r2; parent là architecture r2 (`sha256:v1:8de13e08…`). Spec không đổi.
- Đã làm: các task mở lại (TASK-001, 005, 009, 011, 013, 014, 015, 016, 018, 019, 022, 023, 024, 025) và các task mới TASK-027..029.
- Lý do của r3: lần chạy thật đầu (TASK-021) thất bại ở AC-004, AC-011, AC-016.
- Còn lại: TASK-031, chạy thật lại cùng người dùng.

## Đã làm
| Task | Nội dung |
|---|---|
| TASK-001 | Thêm case RED cho `renderTask`, tài liệu task, merge rich-json, op update có format và fingerprint |
| TASK-027 | Test CLI: `--root`, giới hạn workspace và link, 9 command, snapshot thư mục trước/sau, guard import |
| TASK-028 | Test cổng G0..G8 trên skill và ref, có mutation guard |
| TASK-011 | `task-format.mjs`: `renderTask` (text, rich-json), `renderTasksDocument`, `parseTasksDocument`, `validateTasksDocument`, `reportRows` |
| TASK-013 | `identity.mjs`: marker, merge, fingerprint rich-json bỏ attr tracker tự sinh, `ownedRegionPlainText`, `detectTicketDrift` cho cả hai format |
| TASK-009 | `safety.mjs`: `WRITE_FORMATS`; op update bắt buộc có format và fingerprint, nên fingerprint nằm trong body được hash |
| TASK-029 | `check.mjs`: CLI chỉ đọc với 9 command; `drift --after-write` để kiểm đọc lại |
| TASK-014 | README harness: `allowed-tools` không tự cấp quyền ở chế độ từ chối mọi tool chưa được cấp |
| TASK-015 | `task-breakdown.md` viết lại thành cổng G0..G8; cập nhật `task-format.md`, `sizing-rubric.md`, `project-workspace.md`, `source-connectors.md` |
| TASK-016 | `sdcorejs-product.md`: tóm cổng, cách tìm và chạy CLI, Must Do / Must Not (499 dòng) |
| TASK-005 | `package.json`: chỉ sửa scripts, thêm 2 file test mới |
| TASK-018 | `CHANGELOG.md`, `SECURITY.md` |
| TASK-019 | `npm run sync:skills`; mirror có `check.mjs` ở cả ba adapter |
| TASK-022 | Summary: dòng lệnh `test:e2e:task-breakdown`, fingerprint tính lại; `assembleProjectContext` trả `fresh` |
| TASK-023 | Validator evidence chuyển sang plan r3, lệnh tập trung có 6 file test, 27 case id |
| TASK-025 | VALIDATION.md: mục task-breakdown cập nhật cho r3 |
| TASK-024 | Record ghi lại sau TASK-025: 108/108 pass, manifest 259 file, `content_stable: true` |

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-001 | `node --test test/e2e/product-task-breakdown-contract.test.mjs` | `SyntaxError`: thiếu export `RICH_NODE_TYPES`, 0/1 | 21/21 |
| TASK-027 | `node --test test/e2e/product-task-breakdown-cli.test.mjs` | `SyntaxError`: thiếu export `renderTasksDocument`, 0/1 | 9/9 |
| TASK-028 | `node --test test/e2e/product-task-breakdown-flow-contract.test.mjs` | 0/2 | 2/2 |
| TASK-023 | `node --test authoring/evals/uiux/evidence.test.mjs` | 2 test continuation fail (record còn gắn plan r2) | 10/10 sau TASK-024 |

Nhánh junction trong test giới hạn path có chạy thật: máy tạo được junction và `lstat` báo là symbolic link.

## Kiểm tra rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed (1478 file).
- `npm run check:executable-references`: valid (10 file).
- `node --test authoring/evals/uiux/evidence.test.mjs`: 10/10.
- `npm run test:e2e:repository` (2026-10-15T04:16:55Z -> 05:28:42Z): 917/918, 1 fail.
  - #431 `case-interaction-finish-simplify-grant` fail với `repository observation failed: git ls-files`. Lệnh `git ls-files` trên repo fixture tạm vượt timeout 30 giây; test chạy mất 1.862 giây. Cả lượt chạy chậm bất thường: 72 phút, lượt r2 là 42 phút.
  - Chạy lại riêng test này: pass trong 22 giây (2026-10-15T05:29:45Z).
  - Thay đổi này không sửa `_refs/shared/repository-observation.mjs` hay `production-readiness-contract.test.mjs`. Kết luận: timeout do máy bị tải nặng, không phải lỗi hồi quy.

## Lệch so với plan r3
- Lần thêm đầu đưa `sdcorejs-product.md` lên 501 dòng (test #79, giới hạn 500); đã nén lại còn 499 dòng trước khi ghi record.
- Communication economy không đổi so với r2: các cổng, CLI và ref product không thuộc kịch bản đo nào.

## Việc còn lại
- TASK-031: chạy thật lại cùng người dùng. Kết quả ghi ở `.sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-live-run-r2.md`.
- Finish gate: `sdcorejs-ship` (verify-before-done, branch-ready). Không commit khi chưa có yêu cầu.
