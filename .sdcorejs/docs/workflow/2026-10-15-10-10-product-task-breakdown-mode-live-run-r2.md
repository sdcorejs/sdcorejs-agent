---
artifact_id: live-run-product-task-breakdown-mode-v1-r2
artifact_kind: execution-doc
change_ref: product-task-breakdown-mode-v1
source_spec: .sdcorejs/specs/workflow/2026-10-14-10-40-product-task-breakdown-mode.md
source_plan: .sdcorejs/plans/workflow/2026-10-15-10-10-product-task-breakdown-mode-r3.md
supersedes: .sdcorejs/docs/workflow/2026-10-14-12-00-product-task-breakdown-mode-live-run.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 4703643432f7eda43a1c9ccb19db6669e56575f3
status: failed
---

# Lần chạy thật thứ hai (VAL-004, plan r3) — Mode task-breakdown

## Kết luận
Lần chạy thật thứ hai **không đạt**, ở cả session headless lẫn session tương tác.

Có hai nguyên nhân riêng biệt:
1. **Không tìm thấy ref của mode (session tương tác).** Model đọc `_refs/product/task-breakdown.md` theo đường dẫn tương đối với thư mục skill (`plugin/skills/sdcorejs-product/_refs/...`), nhận về "file không tồn tại", và glob từ thư mục làm việc cũng không thấy. Sau đó model tự làm theo cách thường, không có cổng nào. Quy tắc "gốc skill pack là thư mục tổ tiên gần nhất có `_refs/`" có sẵn trong body skill nhưng model không áp dụng. Đây là lỗi tìm đường dẫn ở mức skill pack: mọi skill dùng `_refs/...` trong layout plugin đều có thể gặp.
2. **Có đọc ref nhưng vẫn bỏ cổng (session headless).** Model đọc `plugin/_refs/product/task-breakdown.md` bản có G0..G8 nhưng vẫn:
   - bỏ G0 (không chạy wizard dù chưa có project), G3 (không fan-out với 2 story), G5 (không hỏi mức sẵn sàng, tự suy tải từ sprint);
   - đề nghị gộp duyệt bảng đề xuất với ghi tracker ("nói ok tạo đi là tôi chạy");
   - ghi `NOT RUN` cho CLI kiểm tra với lý do "không chạy node được", trong khi transcript cho thấy model chưa từng gọi `node` hay `check.mjs` dù đã được cấp quyền.

Không có lệnh ghi tracker nào được gọi ở cả hai session. Không có file nào được tạo trong repo đích.

## Thiết lập
- Runtime: Claude Code 2.1.224, model `claude-opus-5`; plugin local từ working tree (`--plugin-dir <repo>/plugin`), plugin đã cài 0.8.0 bị tắt qua `--settings`.
- Đầu vào: cùng 2 story và cùng prompt tự nhiên như lần chạy thứ nhất. Trước khi chạy, thư mục project workspace mà lần chạy thứ nhất để lại trong repo đích được chuyển ra ngoài (bản sao lưu), để G0 phải chạy wizard.
- **Session headless** (2026-10-15T07:40Z): `claude -p`, `--permission-mode dontAsk`; cấp sẵn tool đọc, git chỉ đọc, connector chỉ đọc, `node`, và ghi dưới `.sdcorejs/projects/**`; không cấp tool ghi tracker. 35 bước, 322 giây, 3,21 USD.
- **Session tương tác** (2026-10-15T08:19Z): người dùng tự chạy trong terminal, chế độ quyền `default` (mỗi lệnh chưa được cấp đều hỏi người dùng), cùng prompt. Chạy khoảng 5 phút, một lượt trả lời.

## Kết quả theo tiêu chí
| Tiêu chí | Headless | Tương tác |
|---|---|---|
| Định tuyến vào `sdcorejs-product` từ plugin local | PASS | PASS |
| Nạp `_refs/product/task-breakdown.md` | PASS (sau một lần sai đường dẫn) | FAIL (không tìm thấy) |
| AC-002 nguồn không đọc được | Đạt một phần: báo Swagger không đọc được, nêu ảnh hưởng, không bịa | Không áp dụng: Swagger đọc được qua lệnh shell |
| AC-004 wizard lần đầu | FAIL | FAIL |
| AC-011 cổng ghi tracker | FAIL: đề nghị gộp duyệt bảng với ghi tracker; không có lệnh ghi vì chưa có trả lời | Không đến bước ghi |
| AC-016 fan-out | FAIL | FAIL |
| INV-008 cổng và bằng chứng CLI | FAIL: không chạy CLI, `NOT RUN` không có lệnh đã thử | FAIL: không biết có cổng |

## Phần đạt
- Ticket con có sẵn được nhận ra, đề xuất thu hẹp chứ không tạo trùng.
- Nội dung tách task chi tiết, đối chiếu API spec mới nhất, chỉ ra điểm lệch với mô tả ticket cũ.

## Hướng sửa đề xuất
1. **Tìm `_refs/` chắc chắn trong mọi layout.** Ghi đường dẫn cụ thể thay cho mô tả: từ thư mục base của skill, `_refs/` ở `../../_refs/` (layout plugin và thư mục skill của dự án) hoặc `../_refs/` (layout skill dùng chung). Tốt nhất là để script sinh mirror ghi dòng này vào header của mọi skill. Việc này chạm mọi skill trong pack nên là thay đổi riêng.
2. **Đưa điểm dừng của G0 vào body skill**, không chỉ để trong ref: lượt trả lời đầu tiên của mode chỉ làm G0, rồi dừng chờ người dùng. Như vậy model không thể làm trọn mọi việc trong một lượt.
3. Sau khi sửa 1 và 2, chạy thật lại trong session tương tác.
