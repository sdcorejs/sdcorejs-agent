---
artifact_id: delivery-mirror-refs-path-resolution-v1-r1
artifact_kind: execution-doc
change_ref: mirror-refs-path-resolution-v1
source_spec: .sdcorejs/specs/workflow/2026-10-15-22-24-mirror-refs-path-resolution.md
source_plan: .sdcorejs/plans/workflow/2026-10-16-10-35-mirror-refs-path-resolution.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 940fc0c3cf6b096cbd289771d92bc2a1556b8303
status: completed
---

# Delivery — Tìm `_refs/` đúng trong mirror plugin và .claude

## Trạng thái
- Nhánh `fix/mirror-refs-path-resolution`, tạo từ `940fc0c`.
- Plan `sha256:v1:e49359ff…` (13 task, tuần tự). Đã làm TASK-001..012. Architecture gate not-applicable (`bounded-bug-fix`).
- TASK-013 (chạy thật) đã xong; kết quả ở live-run doc.

## Việc đã làm
| Task | Nội dung |
|---|---|
| TASK-001 | `test/e2e/mirror-refs-resolution.test.mjs`: 6 case `case-mirror-refs-*` (rewritten, resolve, header, bootstrap-absolute, unchanged, mutation) |
| TASK-002 | `production-readiness-contract`: case `distribution-resolution` đổi kỳ vọng của `.claude`/plugin sang `../../<ref>`, resolve từ thư mục skill |
| TASK-003 | `scripts/sync-skills.mjs`: `rewriteClaudeRefs()` và dòng `CLAUDE_PATH_RESOLUTION` ở header; codex giữ nguyên |
| TASK-004 | `plugin/hooks/session-start.mjs`: thay `../../_refs/` bằng `<realpath plugin>/_refs/` trong bootstrap |
| TASK-005 | `npm run sync:skills` sinh lại 46 mirror; `check:skills` in sync |
| TASK-006 | `package.json`: chỉ sửa scripts, thêm test mới vào `test:e2e:repository` |
| TASK-007 | `CHANGELOG.md`: entry Unreleased |
| TASK-008 | `.sdcorejs/summary.md`: thêm ghi chú về cách tìm `_refs` của từng layout, tính lại fingerprint; `fresh` |
| TASK-009 | `evidence.test.mjs`: record task-breakdown thành history tại `940fc0c`; thêm validator cho record mới |
| TASK-010 | `VALIDATION.md`: thêm mục mới |
| TASK-011 | `authoring/evals/mirror-refs-path-resolution.json`: 106/106 pass, manifest 260 file, `content_stable: true` |

## Evidence RED -> GREEN (Node 22.22.3)
| Task | Lệnh | RED | GREEN |
|---|---|---|---|
| TASK-001 | `node --test test/e2e/mirror-refs-resolution.test.mjs` | 2/6 (hai case guard pass sẵn theo thiết kế) | 6/6 |
| TASK-002 | case `distribution-resolution` | 0/1 (`.claude/skills/sdcorejs-angular/SKILL.md names ../../_refs/...`) | 1/1 sau TASK-003 và TASK-005 |
| TASK-009 | `node --test authoring/evals/uiux/evidence.test.mjs` | 2 case mới fail `ENOENT` (record chưa có) | 12/12 sau TASK-011 |

Lúc đầu test mới báo `<skill-pack-root>/_refs/...` trong `sdcorejs-git` là đường dẫn trần. Đó là dạng có placeholder gốc đứng trước, và script sinh không viết lại nó là đúng. Bộ kiểm trong test được nới cho phép dạng `<placeholder>/_refs/`.

## Kiểm tra rộng
- `npm run check:skills`: in sync.
- `npm run check:text-hygiene`: passed (1489 file).
- `npm run check:executable-references`: valid.
- `node --test authoring/evals/uiux/evidence.test.mjs`: 12/12.
- Lần ghi record đầu (04:44Z–05:04Z): 105/106, fail `case-repair-host-state-routing` (test có sẵn trong `production-readiness-contract`), không có chi tiết lỗi vì transcript chỉ giữ dòng `ok`/`not ok`.
  - Chạy riêng test đó: pass trong 55 giây.
  - Lần ghi lại (05:06Z–05:22Z): 106/106.
  - Thay đổi này không chạm phần code của test đó. Mình coi đây là flake nhưng chưa xác định được nguyên nhân.
- `npm run test:e2e:repository` (2026-10-16T05:22:38Z -> 05:59:23Z): 926/926, exit 0.
- Communication economy không đổi: bootstrap 19.850 byte, JIT 695.618 byte, tổng 745.472 byte.

## Lần chạy thật (TASK-013)
- Kết quả ghi ở `.sdcorejs/docs/workflow/2026-10-16-10-35-mirror-refs-path-resolution-live-run.md` (`passed-with-gaps`).
- AC-007: PASS. Ref của mode được đọc ngay lần đầu qua `plugin/_refs/...`.
- Kết quả của `product-task-breakdown-mode-v1`:
  - AC-004: PASS.
  - AC-016: PASS.
  - AC-011: PASS cho phần đã kiểm được; phần đọc lại sau khi ghi là NOT RUN, vì đây là lần chạy thử và người dùng không cho ghi tracker.
  - AC-002: đạt một phần, vì chưa có hướng dẫn connector/export/dán cho từng nguồn chưa đọc được.
- 3 file project workspace mà lần chạy tạo trong repo đích đã được chuyển ra scratchpad.

## Viết lại commit nền trước lần push đầu (2026-10-16)
Repo là public. Commit nền của change product chưa push lại chứa tên người thật, key ticket nội bộ và tên dự án nội bộ trong fixture test và một ví dụ của ref. Người dùng chọn viết lại commit đó trước lần push đầu:
- Commit nền mới là `940fc0c`. Fixture dùng tên trung tính và key `DEMO-…`. Evidence của change product được ghi lại: 108/108, `content_stable: true`.
- Commit của change này được cherry-pick lên base mới, không có xung đột.
- Spec và plan được snapshot lại với base mới; người dùng duyệt lại cả hai (trả lời `1` ở từng gate). Nội dung chỉ đổi tham chiếu tới commit nền và hash của spec cha. Plan mới: `sha256:v1:e49359ff…`.
- Record evidence của change này được ghi lại sau khi snapshot plan.
- Commit cũ chỉ còn ở hai nhánh backup local; hai nhánh này không push.
- Lần chạy RED và lần chạy thật diễn ra trên base cũ. Phần viết lại không chạm script sinh mirror hay hook; với ref của mode, nó chỉ đổi một ví dụ tên scope trong `project-workspace.md`. Vì vậy kết quả của hai lần đó vẫn áp dụng.

## Còn để ngỏ
- Kiểm phần đọc lại sau khi ghi (AC-011 của `product-task-breakdown-mode-v1`): cần một lần ghi thật lên ticket thử, khi người dùng cho phép.
