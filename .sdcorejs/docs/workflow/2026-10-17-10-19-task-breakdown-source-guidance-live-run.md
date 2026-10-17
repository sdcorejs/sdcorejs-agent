---
artifact_id: live-run-task-breakdown-source-guidance-v1-r1
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
status: passed-with-limitations
---

# Lần chạy thật thứ tư — Hướng dẫn nguồn chưa đọc được (AC-006)

## Kết luận
- **AC-006 của change này: PASS, với giới hạn ở phần Thiết lập.**
  - G1 chạy `check sources -` và in nguyên văn `result.table`: 3 nguồn chưa đọc được, mỗi nguồn có domain, loại, lý do và hướng dẫn theo loại.
  - G8 in lại đúng bảng đó trong mục "Nguồn chưa đọc được", sau bảng `check report`.
  - Task ghi rõ nguồn thiếu ("Chưa đọc được: …"); không có nội dung bịa cho các nguồn đó.
- **AC-002 của `product-task-breakdown-mode-v1`: PASS.** Phần còn thiếu ở lần chạy thứ ba (hướng dẫn connector, export hoặc dán cho từng nguồn) nay đã có ở G1 và G8.
- Không có lệnh ghi tracker nào, cả trong session chính lẫn trong 2 transcript của subagent.

## Thiết lập
- Runtime: Claude Code 2.1.301, plugin local từ working tree (`--plugin-dir <repo>/plugin`, nhánh `fix/task-breakdown-source-guidance` chưa commit); plugin đã cài bị tắt qua `--settings`.
- **Chạy headless theo uỷ quyền.** Người dùng đang bận và nhờ chạy thay. Session chạy bằng `claude -p` qua 5 lượt nối tiếp (`--resume` cùng một session).
  - Câu trả lời ở các cổng lấy lại từ lần chạy thứ ba: xác nhận project; chỉ tách vai trò FE; mức sẵn sàng 100/75/75/25; duyệt bảng đề xuất; không ghi tracker vì đây là lần chạy thử.
  - Ở G2 session hỏi thêm về phạm vi, vì ticket FE có sẵn đã xong. Câu trả lời "tách theo tài liệu, không đọc code, không cấp thêm quyền" giữ nguyên quyền của lần chạy.
- Quyền: chỉ cho tool đọc của tracker và wiki, `Read`/`Glob`/`Grep`, `node` và ghi trong `.sdcorejs/projects/**`. Các tool ghi tracker nằm trong `--disallowedTools`. Lệnh git cho repo con, connector GitLab và WebFetch không được cấp nên bị từ chối khi gọi.
- Workspace của project (`project.md`, `task-breakdown.config.md`) được chép lại từ lần chạy thứ ba trước khi chạy, nên G0 nhận ra project có sẵn. Wizard của G0 đã được kiểm ở lần chạy thứ ba (AC-004).
- Thời gian: 2026-10-17T08:59Z -> 09:32Z.

## Bằng chứng theo cổng
| Cổng | Quan sát |
|---|---|
| G0 | `check project` trên 2 file trả `valid: true`. Lượt đầu dừng ở G0, ghi rõ "chưa đọc nội dung US". |
| G1 | Đọc story, PRD và 2 trang API doc qua connector. `check scan -` trên 7 nguồn: không phát hiện secret. `check sources -` trên 3 nguồn chưa đọc được (mockup UI dạng artifact, mã nguồn trên Git server nội bộ, đặc tả API trên môi trường QC), rồi in nguyên văn bảng 5 cột. Session cũng nêu rõ việc mapping API chỉ theo API doc vì không vào được đặc tả máy đọc được. |
| G2 | Bảng story, trạng thái, ticket con có sẵn. Session phát hiện ticket FE có sẵn đã xong và dừng hỏi phạm vi trước khi nháp. |
| G3 | 2 subagent chỉ đọc, mỗi subagent một story; `git status` trước và sau giống nhau. |
| G4 | 6 task, 45 điểm; một task 13 điểm được tách theo rubric. `check tasks` trả `valid: true`. |
| G5 | Hỏi mức sẵn sàng của từng người trước khi gợi ý; `check balance` chạy cho kết quả tự động và cho phương án đã chỉnh theo thứ tự phụ thuộc. |
| G6 | Bảng đề xuất và bảng tải, dừng chờ duyệt. Sau khi duyệt mới ghi `tasks/<scope>.md`, rồi `check tasks <file>` trả `valid: true`. |
| G7 | NOT RUN: không có yêu cầu ghi tracker (lần chạy thử). |
| G8 | Bảng `check report` (7 cột, 6 dòng), việc còn mở, bảng `check sources -`, cách đọc, rủi ro còn lại của fan-out, và từng mục NOT RUN kèm nguyên nhân. |

## Kiểm độc lập sau lần chạy
- `check project` trên 2 file project và `check tasks`, `check report` trên `tasks/<scope>.md`: đều `valid: true`. Có 6 task, 45 điểm, không có ticket và không có block write plan.
- Quét transcript:
  - session chính chỉ gọi tool đọc của tracker và wiki;
  - 2 subagent chỉ dùng `Read`;
  - 7 lượt gọi bị từ chối (connector GitLab, WebFetch), đúng với quyền đã cấp.
- `check sources -` chạy một lần ở G1 qua script `node` dựng stdin. G8 in lại `result.table` của lần chạy đó, không gọi lại CLI.
- Session ghi file task qua một script `node`, không qua tool `Write`. Kết quả vẫn trùng với `result.document` mà CLI kiểm.

## Tác dụng phụ đã dọn
- 3 file workspace mà lần chạy để lại trong repo đích được chuyển ra scratchpad; repo đích trở lại đúng trạng thái trước khi chạy.
- Session headless tự ghi một ghi chú vào memory của người dùng. Ghi chú đó suy ra quy tắc chung từ allowlist hẹp của lần chạy thử, ví dụ "các lệnh git và connector bị chặn". Ghi chú đã được gỡ khỏi memory và giữ lại trong scratchpad.

## Giới hạn
- Chạy headless theo uỷ quyền chứ không phải session tương tác do người dùng tự lái; câu trả lời ở các cổng là của lần chạy trước.
- Mô hình chọn loại nguồn hợp lý cho 2 nguồn, còn mã nguồn trên Git server được xếp `unknown` vì không có hàng nào khớp. Chọn loại đúng hay sai không được kiểm tự động (A-001, D-002).
- Phần đọc lại sau khi ghi (AC-011 của `product-task-breakdown-mode-v1`) vẫn NOT RUN. Cần một lần ghi thật lên ticket thử khi người dùng cho phép.
