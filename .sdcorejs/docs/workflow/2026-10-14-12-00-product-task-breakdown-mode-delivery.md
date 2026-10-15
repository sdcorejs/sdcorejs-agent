---
artifact_id: delivery-product-task-breakdown-mode-v1-r1
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-14-12-00-product-task-breakdown-mode.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: in-progress
---

# Delivery — Mode task-breakdown của sdcorejs-product

## Trạng thái
- Nhánh `feat/product-task-breakdown-mode`, tạo từ `codex/simplify-design-handoff@4703643` (D-015). Chưa commit.
- TASK-001..019 đã làm. TASK-020 (verification) đã chạy, còn 4 lỗi thuộc artifact quản trị mà plan chưa có task (xem dưới).
- TASK-021 (lần chạy thật, VAL-004) chưa chạy: cần người dùng.

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-001 | `node --test test/e2e/product-task-breakdown-contract.test.mjs` | ERR_MODULE_NOT_FOUND, 0/1 pass | 17/17 pass |
| TASK-002 | `node --test test/e2e/harness-behavioral-sentinel.test.mjs` | 18/20 pass, 2 fail | 20/20 pass |
| TASK-003 | `node --test test/e2e/artifact-path-convention.test.mjs` | 21/23 pass, 2 fail | 23/23 pass |
| TASK-004 | `node --test test/e2e/skill-pack-runner.test.mjs` | 32/33 pass (prompt localized vào `sdcorejs-git`) | 33/33 pass |

## Kiểm tra rộng
- `npm run check:skills`: in sync (mọi mirror và 5 harness manifest).
- `npm run check:text-hygiene`: passed (1462 file).
- `npm run check:executable-references`: valid.
- `npm run test:e2e:repository` (lần 1, trước khi bỏ đoạn bootstrap): 895/901 pass, 6 fail.
  - #383 parallel-dispatch worktree: flaky, chạy lại file 34/34 pass.
  - #99 communication-economy bootstrap bytes: do đoạn định tuyến thêm vào `skills/orchestration/using-skills.md` (bootstrap luôn nạp) vượt ngân sách byte; đã bỏ đoạn đó, file chạy lại 29/30 pass (#99 pass).
  - #103 communication-economy: `VALIDATION.md is stale for report row: | Aggregate just-in-time scenario bytes | 514,603 | 695,618 |`. Cần cập nhật `VALIDATION.md` theo report.
  - #450 production-readiness: `.sdcorejs/summary.md` thành `partially-stale` (section Stack and Workspace, Commands, Conventions and Invariants) vì `package.json` và registry đổi. Cần summary refresh.
  - #7, #8 `authoring/evals/uiux/evidence.test.mjs`: continuation evidence của thay đổi trước (`authoring/evals/audit-findings-repair.json`) khoá nội dung hiện tại; thay đổi mới cần record continuation riêng. `authoring/**` đang thuộc prohibited_paths của plan.

## Lệch so với plan
- `skills/orchestration/using-skills.md`: không giữ thay đổi (ngân sách byte của bootstrap). Phân xử định tuyến nằm ở description của product, dòng `write-requirement` của documentation và `_refs/product/task-breakdown.md`.
- `sdcorejs-product` thêm `web.fetch` vào required-actions để đi đúng chuỗi fallback của AD-1 (`source.read` -> `web.fetch` -> `artifact.read` -> dán). Allowed-tools của mirror Claude vẫn không có tool connector.
- Description của product rút gọn còn 512 ký tự (giới hạn 520) và skill còn 499 dòng (giới hạn 500).

## Việc còn lại
- Plan revision cho 3 artifact quản trị: refresh `.sdcorejs/summary.md`, cập nhật `VALIDATION.md`, thêm continuation evidence trong `authoring/evals/` (mở `authoring/**`).
- TASK-021: lần chạy thật cùng người dùng.
- Chạy lại `npm run test:e2e:repository` sau các bước trên.
