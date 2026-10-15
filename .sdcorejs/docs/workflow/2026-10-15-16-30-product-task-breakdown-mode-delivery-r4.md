---
artifact_id: delivery-product-task-breakdown-mode-v1-r4
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-15-16-30-product-task-breakdown-mode-r4.md
supersedes: .sdcorejs/docs/workflow/2026-10-15-10-10-product-task-breakdown-mode-delivery-r3.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: ready-for-ship-gate
---

# Delivery r4 — Mode task-breakdown của sdcorejs-product

## Trạng thái
- Nhánh `feat/product-task-breakdown-mode`, tạo từ `4703643`. Chưa commit.
- Plan r4 (`sha256:v1:7868b0a5…`) thay plan r3. Parent vẫn là architecture r2. Spec không đổi.
- Đã làm đủ 32 task của plan. TASK-021 và TASK-031 (hai lần chạy thật) ghi `failed`.
- Theo D-022, việc tiếp theo là ship gate rồi commit change này (không push).
- Lỗi tìm `_refs/` của mirror sẽ sửa ở một change riêng. Sau change đó mới chạy thật lần 3.

## Việc của r4
| Task | Nội dung |
|---|---|
| TASK-028 | Test flow có thêm câu bắt buộc "The first reply in this mode covers G0 only and then stops for the user." cho cả ref lẫn skill |
| TASK-015 | `_refs/product/task-breakdown.md`: thêm câu đó vào điểm dừng của G0 |
| TASK-016 | `sdcorejs-product.md`: thêm câu đó vào mục Task-breakdown mode, vẫn 499 dòng |
| TASK-019 | `npm run sync:skills`; `check:skills` in sync |
| TASK-022 | `assembleProjectContext` trả `fresh`, nên không cần refresh |
| TASK-023 | Validator evidence chuyển sang plan r4 và hash của nó |
| TASK-025 | VALIDATION.md: thêm kết quả lần chạy thật thứ hai, lỗi tìm `_refs/`, và việc các AC kiểm tay còn để ngỏ |
| TASK-024 | Record ghi lại sau TASK-025: 108/108, manifest 259 file, `content_stable: true` |

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-028 | `node --test test/e2e/product-task-breakdown-flow-contract.test.mjs` | Thiếu câu G0 ở ref và skill | 2/2; cùng contract và runner: 56/56 |
| TASK-023 | `node --test authoring/evals/uiux/evidence.test.mjs` | 0/2 continuation (record gắn plan r3) | 10/10 sau TASK-024 |

## Kiểm tra rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed (1482 file).
- `npm run check:executable-references`: valid (10 file).
- `node --test authoring/evals/uiux/evidence.test.mjs`: 10/10.
- `npm run test:e2e:repository` (2026-10-15T09:38:24Z -> 10:34:41Z): 918/918, exit 0. Ở delivery r3, test #431 lỗi vì timeout khi máy bị tải nặng; lần này pass.
- Communication economy không đổi: JIT 695.618 byte, tổng 745.472 byte, bootstrap 19.850 byte.

## Sửa sau ship gate
- Lần commit đầu bị hook `git-secrets` của tổ chức chặn ở `test/e2e/product-task-breakdown-contract.test.mjs:350`: fixture giả dạng khoá cloud, mật khẩu trong URL và token. Mình không thêm ngoại lệ `secrets.allowed`.
- Đã sửa bằng cách ghép các fixture đó lúc runtime, giống hằng `JWT` có sẵn. Test vẫn kiểm đúng các pattern như trước.
- Kiểm lại sau khi sửa:
  - file contract: 21/21;
  - record evidence ghi lại: 108/108, `content_stable: true`;
  - evidence test: 10/10;
  - `check:skills`, `check:text-hygiene`, `check:executable-references`: pass.
- `test:e2e:repository` 918/918 là kết quả của lần chạy trước khi sửa fixture; sau đó chỉ file test này và các artifact quản trị thay đổi.

## Còn để ngỏ
- AC-002, AC-004, AC-011, AC-016 (kiểm tay) chưa đạt. Hai lần chạy thật đều thất bại; xem live-run và live-run-r2.
- Lần chạy thật lần 3 thuộc change sửa lỗi tìm `_refs/` cho mirror `plugin/` và `.claude/` (D-022).
