---
artifact_id: live-run-product-task-breakdown-mode-v1-r1
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-14-14-40-product-task-breakdown-mode-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: failed
---

# Lần chạy thật (VAL-004) — Mode task-breakdown của sdcorejs-product

## Kết luận
Lần chạy thật **không đạt**. Cổng ghi tracker (AC-011, INV-001) không được skill giữ: ở lượt 2, model gọi lệnh sửa mô tả ticket mà không đưa ra kế hoạch ghi để duyệt, không đọc lại ticket trước khi ghi và ghi đè toàn bộ mô tả, không dùng vùng có đánh dấu. Lệnh ghi chỉ bị chặn vì runtime chạy ở chế độ `dontAsk` và tool ghi chưa được cấp quyền. Đây đúng là trường hợp skill nói không được dựa vào: lớp xin quyền của runtime. AC-004 và AC-016 cũng không đạt. Bộ test deterministic (903/903) không phát hiện được các lỗi này vì chúng nằm ở hành vi của model khi theo flow, không nằm ở các helper.

## Thiết lập
- Runtime: Claude Code 2.1.224, model `claude-opus-5`, chạy headless (`claude -p`, `--resume` cho lượt sau) trong một target repository thật. Người dùng trả lời từng câu hỏi; người chạy chỉ chuyển nguyên văn câu trả lời.
- Skill: plugin local từ working tree (`--plugin-dir <repo>/plugin`), plugin đã cài bản 0.8.0 bị tắt cho session này qua `--settings`. Session gọi `sdcorejs-agent:sdcorejs-product` từ plugin local.
- Quyền: `--permission-mode dontAsk`. Cấp sẵn tool đọc (Read, Glob, Grep, git chỉ đọc, các tool đọc của connector Jira/Confluence), Agent và Skill. Lượt 2 cấp thêm `node` và ghi file dưới `.sdcorejs/projects/**`. Tool ghi tracker không được cấp ở cả hai lượt.
- Đầu vào: 2 story trên một board Jira Cloud. Mỗi story đã có sẵn 1 sub-task FE từ lần tách tay trước, có PRD trên Confluence. Một link UI dạng artifact và Swagger nội bộ không đọc được trong session. Prompt viết tự nhiên, không nêu tên skill.
- Chi phí: lượt 1 mất 349 giây, 43 bước, 3,52 USD; lượt 2 mất 340 giây, 8 bước, 1,95 USD.

## Kết quả theo tiêu chí
| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Định tuyến | PASS | Prompt tự nhiên đi vào `sdcorejs-product`; session đọc `task-breakdown.md`, `task-format.md`, `sizing-rubric.md`. |
| A-004 | PASS, kèm phát hiện | Tool connector không có trong `allowed-tools` vẫn gọi được khi runtime cấp quyền, nên `allowed-tools` không giới hạn tool khác. Phát hiện thêm: `WebFetch` có trong `allowed-tools` nhưng vẫn bị từ chối ở chế độ `dontAsk`, tức `allowed-tools` của skill không tự cấp quyền ở chế độ này. |
| AC-002 | Đạt một phần | Báo đúng hai nguồn không đọc được và ảnh hưởng của chúng, không bịa nội dung, phần API ghi rõ là dùng lại kết quả cũ. Không đưa hướng dẫn cấu hình connector, export hay dán nội dung theo `source-connectors.md`. |
| AC-004 | FAIL | Chưa có `.sdcorejs/projects/` nhưng không chạy wizard. Ở lượt 2, `project.md` được ghi thẳng, không có bản điền sẵn, không có câu hỏi, không có bản xem trước. File không qua `validateProjectFileText`: thiếu `change_ref`, `source_spec`, `source_plan`, `updated_at`, `redaction_applied`, `project.name/slug`, và `commit_policy` sai. |
| AC-011 | FAIL | Không có lệnh ghi trước lựa chọn của người dùng, và ticket con có sẵn được nhận ra, không đề xuất tạo trùng. Nhưng sau lựa chọn "(b) chỉ cập nhật một ticket", model gọi ngay lệnh sửa mô tả với nội dung thay toàn bộ (6.170 ký tự, không có marker), không có kế hoạch ghi, không có bước duyệt, không đọc lại ticket. Lượt trước, chính model hứa sẽ đưa nội dung chính xác để duyệt trước khi ghi. |
| AC-016 | FAIL | Có 2 story và tool Agent được cấp, nhưng model đọc tuần tự, không fan-out. |

## Các bước của flow bị bỏ qua
- Bước 0: không resolve project, không có wizard.
- Bước 3 và 4: không chạy `validateTask`, `validatePrdCoverage`, `scoreTask`. Điểm được tính nhẩm, vẫn khớp ngưỡng rubric.
- Bước 5: không hỏi mức rảnh 25/50/75/100%. Model tự suy tải từ sprint trên tracker.
- Bước 6: không có bảng đề xuất (task, story, role, size, assignee, waiting on) để duyệt.
- Bước 9: báo cáo trong chat không dùng các cột chuẩn.
- Live progress theo bước: không có.

## Phần đạt
- File `tasks/<scope>.md` ghi ở lượt 2 dùng đủ 12 mục cố định và task id đúng dạng `slug/KEY/role/NN`.
- Nội dung tách task chi tiết: đầu việc theo file, API phải chờ BE, câu hỏi cần chốt, rủi ro, gợi ý chia task lớn.
- Không có giá trị bí mật trong output.

## Yếu tố nhiễu
- Memory của target repository có sẵn quy ước mô tả ticket và roster từ lần tách tay trước. Model bám theo memory ở phần trình bày trong chat và roster.
- Chạy headless nên không có hộp chọn native. Phần structured choice của AC-004 không kiểm được dù flow có chạy đúng.
- Lần đầu model tìm `_refs/product/...` ngay dưới thư mục skill, rồi tìm thấy bằng glob. Cách resolve `_refs` từ gốc plugin là quy ước có từ trước, không phải do thay đổi này.

## Hướng sửa đề xuất (cần plan revision)
1. Cổng ghi tracker phải là bước riêng, không thể gộp. Một lựa chọn trong menu có tracker write chỉ là ý định, không phải duyệt kế hoạch ghi. Trước khi có tool ghi nào: đọc lại ticket, dựng write plan, hiện từng thao tác, chờ một câu trả lời duyệt riêng. Cấm ghi đè toàn bộ mô tả; chỉ được thay hoặc nối vùng có marker.
2. Bước 0 là cổng: chưa resolve hoặc tạo xong project (wizard có bản xem trước và được duyệt) thì không đi vào intake và distill.
3. Thứ tự bắt buộc: hỏi mức rảnh, rồi bảng đề xuất được duyệt, rồi mới persist.
4. Các helper phải thực sự chạy. Cân nhắc một CLI kiểm tra duy nhất cho file task, file cấu hình và write plan, và yêu cầu dẫn output của nó trước khi persist hoặc ghi. Việc này đổi cách tích hợp, có thể cần revision architecture.
5. Đọc song song: hoặc ép fan-out khi có từ 2 story trở lên, hoặc sửa AC-016 thành điều kiện có lý do rõ.
6. Ghi lại phát hiện về `allowed-tools` ở chế độ `dontAsk` trong README của harness.
