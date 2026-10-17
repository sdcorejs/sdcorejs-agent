---
artifact_id: delivery-task-breakdown-source-guidance-v1-r1
artifact_kind: execution-doc
change_ref: task-breakdown-source-guidance-v1
source_spec: .sdcorejs/specs/workflow/2026-10-16-16-39-task-breakdown-source-guidance.md
source_plan: .sdcorejs/plans/workflow/2026-10-17-10-44-task-breakdown-source-guidance-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: fc8543881c9d82428d49f9e11809c81e0b53ed62
status: completed
---

# Delivery — Hướng dẫn nguồn chưa đọc được và lệnh help cho check CLI của task-breakdown

## Trạng thái
- Nhánh `fix/task-breakdown-source-guidance`, tạo từ `fc85438`. Chưa commit.
- Spec `sha256:v1:6bf9549a…`. Plan r2 `sha256:v1:315a2365…` (13 task, tuần tự) thay plan r1 `sha256:v1:151c518b…`. Architecture gate not-applicable (`bounded-bug-fix`).
- Đã làm đủ 13 task. TASK-012 (chạy thật) chạy headless theo uỷ quyền của người dùng; kết quả ở live-run doc.

## Việc đã làm
| Task | Nội dung |
|---|---|
| TASK-001 | `product-task-breakdown-cli.test.mjs`: thêm case `cli-sources-kinds`, `cli-sources-grouping`, `cli-sources-errors`, `cli-help`; mở rộng `cli-read-only` cho `sources.mjs` |
| TASK-002 | `product-task-breakdown-flow-contract.test.mjs`: case `flow-source-guidance` (G1/G8, danh sách lệnh khớp CLI, id loại nguồn khớp `SOURCE_KINDS`, skill tối đa 500 dòng) và mutation |
| TASK-003 | `_refs/product/task-breakdown/sources.mjs`: `SOURCE_KINDS`, hướng dẫn vi/en, `sourceGuidance()` (kiểm, redact, nhóm theo domain và loại, render bảng) |
| TASK-004 | `check.mjs`: lệnh `sources`; `--help`, `-h`, `help` không cần `--root`; `COMMAND_UNKNOWN` nhắc `--help` |
| TASK-005 | `task-breakdown.md`: danh sách lệnh, G1/G8 dùng `check sources -`. `source-connectors.md`: cột id và hàng `unknown`, cách gọi `check sources -` |
| TASK-006 | `npm run sync:skills` sinh lại 12 mirror `_refs`; `check:skills` in sync |
| TASK-007 | `CHANGELOG.md`: entry Unreleased |
| TASK-008 | `evidence.test.mjs`: record mirror-refs thành history tại `fc85438`; validator cho record mới |
| TASK-009 | `VALIDATION.md`: mục mới |
| TASK-010 | `authoring/evals/task-breakdown-source-guidance.json`: 44/44, manifest 261 file, `content_stable: true` |
| TASK-013 | `mirror-refs-resolution.test.mjs`: `case-mirror-refs-unchanged` chuyển từ so byte với `940fc0c` sang kiểm thuộc tính bền vững, có mutation |

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-001, TASK-002 | `node --test test/e2e/product-task-breakdown-cli.test.mjs test/e2e/product-task-breakdown-flow-contract.test.mjs` | 7 fail (5 case mới, `cli-read-only` mở rộng, 2 case flow), 10 case cũ pass | 17/17 sau TASK-003..005 |
| TASK-008 | `node --test authoring/evals/uiux/evidence.test.mjs` | 2 case mới fail `ENOENT` (record chưa có) | 14/14 sau TASK-010 |
| TASK-013 | `node --test test/e2e/mirror-refs-resolution.test.mjs` | `case-mirror-refs-unchanged` fail khi ghi record theo plan r1 | 6/6 |

## Điều chỉnh trong lúc làm
- **Plan r2.** Lần ghi record đầu theo plan r1 (2026-10-17T03:37Z) ra 43/44: `case-mirror-refs-unchanged` của change mirror so mọi file `.md` trong `skills/**` và `codex/skills/**` với commit nền cố định `940fc0c`. Change này sửa hai ref, nên bản copy trong mirror codex đổi theo. File test không nằm trong allowed paths của r1, nên mình dừng lại. Một lần chạy full suite thử (934 test) cho thấy chỉ có case này là blocker thật; hai case evidence còn lại fail vì record chưa ghi xong. Người dùng duyệt plan r2, chỉ thêm TASK-013.
- **Fixture redact.** Scanner sẵn có bắt được `token=` nhưng không bắt được `access_token=`, vì dấu `_` là ký tự chữ nên không có ranh giới từ trước `token`. Test redact dùng `token=`. Mở rộng scanner nằm ngoài change này.
- **Summary.** Fingerprint không đổi khi thêm file vào `_refs/product/task-breakdown/`, nên không refresh `.sdcorejs/summary.md`.

## Kiểm tra rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed.
- `npm run check:executable-references`: valid.
- `node --test authoring/evals/uiux/evidence.test.mjs`: 14/14.
- Lệnh tập trung của record (2026-10-17T08:08Z): 44/44.
- `npm run test:e2e:repository` (2026-10-17T08:14:58Z -> 08:51:01Z): 934/934, exit 0.

## Lần chạy thật (TASK-012)
- Kết quả ghi ở `.sdcorejs/docs/workflow/2026-10-17-10-19-task-breakdown-source-guidance-live-run.md` (`passed-with-limitations`).
- AC-006: PASS. G1 chạy `check sources -` và in nguyên văn bảng; G8 in lại bảng đó; task ghi rõ nguồn thiếu; không có lệnh ghi tracker.
- AC-002 của `product-task-breakdown-mode-v1`: PASS.
- Giới hạn: session chạy headless theo uỷ quyền, câu trả lời ở các cổng lấy lại từ lần chạy thứ ba.

## Còn để ngỏ
- Kiểm phần đọc lại sau khi ghi (AC-011 của `product-task-breakdown-mode-v1`): cần một lần ghi thật lên ticket thử, khi người dùng cho phép.
- Scanner chưa bắt `access_token=`; mở rộng ở change sau nếu cần.
