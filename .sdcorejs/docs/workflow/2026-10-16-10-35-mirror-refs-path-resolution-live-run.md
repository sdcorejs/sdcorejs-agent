---
artifact_id: live-run-mirror-refs-path-resolution-v1-r1
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
status: passed-with-gaps
---

# Lần chạy thật thứ ba (session tương tác) — Mirror `_refs` và mode task-breakdown

## Kết luận
- **AC-007 của change này: PASS.** Ở lần đọc đầu tiên, model đọc ngay ref của mode qua `plugin/_refs/product/task-breakdown.md`. Trong cùng session, nó cũng đọc các ref khác và gọi `check.mjs` từ `plugin/_refs/product/task-breakdown/`.
- **Mode task-breakdown đi đúng chuỗi cổng G0..G8**, lần đầu tiên trong ba lần chạy thật.
- Kết quả 4 AC kiểm tay của `product-task-breakdown-mode-v1`:

| AC | Kết quả |
|---|---|
| AC-004 | PASS |
| AC-016 | PASS |
| AC-011 | PASS cho phần đã kiểm được; phần đọc lại sau khi ghi là NOT RUN |
| AC-002 | Đạt một phần |

- Không có lệnh ghi tracker nào, cả trong session chính lẫn trong 2 transcript của subagent.

## Thiết lập
- Runtime: Claude Code 2.1.224, model Opus 5, session tương tác do người dùng chạy, chế độ quyền `default` (`--permission-mode manual`).
- Skill: plugin local từ working tree (`--plugin-dir <repo>/plugin`); plugin đã cài 0.8.0 bị tắt qua `--settings`.
- Repo đích chưa có project workspace, và dùng cùng prompt tự nhiên với hai lần chạy trước.
- Đây là lần chạy thử. Các task thật của 2 story đã làm xong, nên người dùng từ chối ghi tracker ở G7.
- Thời gian: 2026-10-16T07:45Z -> 09:18Z. Phần lớn là thời gian chờ 2 subagent và chờ người dùng trả lời.

## Bằng chứng theo cổng
| Cổng | Quan sát trong transcript |
|---|---|
| G0 | Báo "chưa có workspace, cần chạy first-run wizard"; chỉ đọc metadata tracker để điền sẵn. `check project -` trên bản xem trước trả `valid:false`, sửa rồi `valid:true`. Duyệt bằng hộp chọn native, ghi 2 file, rồi `check project <file>` trả `valid:true`. Lượt trả lời đầu dừng ở G0 và ghi rõ "chưa đọc nội dung US/PRD". |
| G1 | Đọc story và PRD qua connector. Link artifact của UI chỉ được đọc sau khi host hỏi và người dùng cho phép. `check scan -` chạy trên từng nguồn trước khi dùng. |
| G2 | Bảng inventory: story, trạng thái, ticket con có sẵn (FE/BE/QC); chỉ tách vai trò FE. |
| G3 | Fan-out 2 subagent chỉ đọc, mỗi subagent một story. Parent tự kiểm output của subagent trước khi gộp; báo cáo cuối nêu rủi ro còn lại (không chặn được nếu subagent tự gọi tool tracker). |
| G4 | 6 task theo rubric, tổng 45 điểm; `check tasks - --slug --scope` trên data block. |
| G5 | Hỏi mức sẵn sàng của 4 người bằng hộp chọn native (100/75/50/25, có ô Other) trước khi gợi ý assignee. `check balance -` chạy 2 phương án; cảnh báo một người quá tải 130%. |
| G6 | Hai câu hỏi riêng: ghép 2 ticket con có sẵn vào task tương ứng, và duyệt bảng đề xuất. Sau đó mới ghi `tasks/<scope>.md` và chạy `check tasks <file>`. |
| G7 | Theo yêu cầu "lập danh sách thao tác để xem trước, chưa ghi", session đọc lại ticket và hiện đủ 6 op (4 tạo mới, 2 cập nhật bằng cách nối vào mô tả cũ), kèm danh sách field không đụng tới (status, transition, team, sprint). Nó phát hiện 2 ticket vừa đổi trạng thái trong ngày và cảnh báo giao trùng việc; nêu rủi ro giới hạn độ dài mô tả của tracker; nói rõ chỉ chạy `plan-approve` và ghi sau khi được duyệt đúng bản đó. Người dùng từ chối ghi. |
| G8 | In bảng báo cáo theo cột chuẩn (lấy từ `check report`), nguồn chưa đọc được, chế độ đọc, và các mục `NOT RUN` có nguyên nhân (G7 chưa được yêu cầu; một lệnh `git log` bị người dùng từ chối). |

## Kiểm độc lập sau lần chạy
- `check project` trên `project.md` và `task-breakdown.config.md` mà session ghi: cả hai `valid:true`.
- `check tasks` trên `tasks/<scope>.md`: `valid:true`. File có 6 task; `tickets` ghép 2 ticket có sẵn (`origin: existing`, `read_back: null`); không có block write plan.
- `check report`: bảng 7 cột, 6 dòng; 2 dòng đã có key ticket có sẵn.
- Quét transcript chính và 2 transcript subagent (155 lượt gọi tool của subagent): không có lệnh tạo/sửa ticket, và không có `Write`/`Edit` vào `src/` hay `.sdcorejs/` của repo đích. 3 file project workspace được ghi sau khi người dùng duyệt.

## Phần chưa đạt hoặc chưa kiểm
- **AC-011, đọc lại sau khi ghi:** NOT RUN. Người dùng không cho ghi tracker vì đây là lần chạy thử. `plan-approve`, `plan-verify`, `drift` và `merge` chưa được gọi trong lần chạy thật; chúng chỉ có bằng chứng ở test của CLI.
- **AC-002:** báo cáo liệt kê 3 nguồn chưa đọc được và không bịa nội dung, nhưng không đưa hướng dẫn connector, export hoặc dán cho từng nguồn như `_refs/product/source-connectors.md` yêu cầu.
- Lần gọi `check.mjs --help` đầu tiên trả `COMMAND_UNKNOWN` (exit 2). Model đọc `check.mjs` để biết cách dùng rồi đi tiếp. CLI chưa có lệnh `--help`.

## Việc tiếp theo đề xuất (ngoài change này)
- Bổ sung hướng dẫn cho từng nguồn chưa đọc được vào cổng G1/G8, rồi kiểm lại AC-002.
- Thêm lệnh `--help` cho `check.mjs`.
- Kiểm phần đọc lại sau khi ghi (AC-011) trong một lần ghi thật lên ticket thử, khi người dùng cho phép.
