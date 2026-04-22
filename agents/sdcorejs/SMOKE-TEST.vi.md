# Smoke Test SDCoreJS Chat (Tiếng Việt)

Tài liệu này dùng để kiểm tra nhanh hành vi của SDCoreJS agent cho Angular Portal trong VS Code Chat.

## Phạm vi
- Luồng hỏi rõ module trước khi sinh code
- Luồng fallback tạo module khi chưa có module phù hợp
- Sinh CRUD tối thiểu khi yêu cầu còn mơ hồ
- Quyết định side-drawer hay full-page cho màn hình chi tiết
- Hành vi workflow actions ở detail và bulk actions ở list
- Tính nhất quán contract phản hồi giữa các mô hình (Claude/Gemini/Codex)
- Vệ sinh cấu hình tsconfig của portal starter (`baseUrl` chỉ giữ khi thực sự cần)
- Ổn định version package theo baseline nội bộ (không bị version drift)

## Điều kiện trước khi test
- Mở repo này trong VS Code
- Mở Chat panel
- Chọn chat mode SDCoreJS nếu có
- Nếu chưa thấy chat mode, dùng prompt trong .github/prompts/sdcorejs-angular-portal.prompt.md

## Tiêu chí đạt tổng quát
- Thiếu module thì agent phải hỏi lại
- Khi xác nhận chưa có module, agent phải tạo module trước
- Thiếu thông tin field, agent phải sinh skeleton CRUD tối thiểu trước
- Form phổ biến khoảng 5-6 field, agent ưu tiên side-drawer
- Workflow phức tạp, agent chọn full-page
- Khi có yêu cầu workflow, agent đưa cả action ở detail và bulk action ở list
- Envelope phản hồi nên nhất quán giữa model: Resolved Context -> Planned Skill Chain -> Files To Create/Update -> Post-Gen Double Check
- Không ép giữ `baseUrl: "./"` trong tsconfig nếu không có nhu cầu import tuyệt đối tương ứng
- Version package sinh ra phải khớp `core/templates/angular-portal-starter/package.template.json` khi generate ở workspace mới

## Bộ test

### TC01 - Thiếu module thì phải hỏi lại
Prompt:
Tạo CRUD product với các field code, name, price.

Kỳ vọng:
- Agent hỏi product thuộc module nào
- Agent không nhảy ngay vào sinh file khi module chưa rõ

Pass khi:
- Câu hỏi làm rõ module xuất hiện ngay phản hồi đầu

### TC02 - Chưa có module thì phải tạo module trước
Prompt:
Tạo màn hình customer. Hiện chưa có module phù hợp, hãy tạo mới giúp mình.

Kỳ vọng:
- Agent xác nhận tên module mới
- Agent thực hiện bước tạo module trước
- Sau đó mới chuyển sang CRUD entity

Pass khi:
- Thứ tự phản hồi là tạo module trước, CRUD sau

### TC03 - Field mơ hồ thì sinh skeleton tối thiểu trước
Prompt:
Tạo CRUD order trong module sales. Field để mình bổ sung sau.

Kỳ vọng:
- Agent đề xuất bộ field base tối thiểu và skeleton CRUD
- Agent nói rõ sẽ refine validation ở pass tiếp theo

Pass khi:
- Phản hồi đầu theo hướng tối thiểu, không over-design validation

### TC04 - Form đơn giản thì ưu tiên side-drawer
Prompt:
Tạo màn hình detail supplier với 6 field: code, name, phone, email, status, note.
Dùng chuẩn CRUD thông thường.

Kỳ vọng:
- Agent chọn side-drawer cho màn hình detail
- Validation theo save-boundary (form.invalid + form.markAllAsTouched)

Pass khi:
- Agent nêu rõ side-drawer là lựa chọn mặc định cho case này

### TC05 - Workflow phức tạp thì full-page + bulk actions
Prompt:
Tạo màn hình purchase request trong module procurement.
Cần create, update, detail, submit, approve, reject.
List page cần bulk submit và bulk approve.
Detail có nhiều section, child table item, và review attachment.

Kỳ vọng:
- Agent chọn full-page cho màn hình detail
- Agent có action detail: save, submit, approve, reject theo state/permission
- Agent có selector bulk action ở list cho submit và approve

Pass khi:
- Có đầy đủ quyết định full-page và cả action detail/list

### TC06 - Khởi tạo portal không giữ baseUrl thừa
Prompt:
Khởi tạo portal starter mới từ baseline nội bộ trong sdcorejs-agent/core/templates/angular-portal-starter.
Chỉ giữ shell starter và không có business libs.

Kỳ vọng:
- Agent kiểm tra kiểu import/alias trước khi quyết định cấu hình tsconfig
- Agent bỏ `compilerOptions.baseUrl` nếu không cần
- Nếu vẫn giữ `baseUrl`, agent giải thích rõ import pattern nào cần dùng
- Agent vẫn giữ cấu trúc sẵn sàng cho module (`src/libs` tồn tại)

Pass khi:
- Kết quả hoặc tsconfig sinh ra không còn `baseUrl` thừa

### TC07 - Khởi tạo portal không bị lệch version package
Prompt:
Khởi tạo portal starter ở một workspace hoàn toàn mới.
Version package phải khớp chính xác với sdcorejs-agent/core/templates/angular-portal-starter/package.template.json.

Kỳ vọng:
- Agent dùng baseline package nội bộ làm nguồn sự thật
- Agent không tự nâng/hạ version Angular hoặc sd-angular theo repo mẫu bên ngoài
- package.json sinh ra có dependency/devDependency khớp template nội bộ

Pass khi:
- Version package sinh ra trùng với version trong baseline nội bộ

## Mẫu log test nhanh
- Ngày test:
- Người test:
- Phiên bản VS Code:
- Chat mode sử dụng:
- TC01: Pass/Fail
- TC02: Pass/Fail
- TC03: Pass/Fail
- TC04: Pass/Fail
- TC05: Pass/Fail
- TC06: Pass/Fail
- TC07: Pass/Fail
- Ghi chú:

## Gợi ý khi fail
- Nếu TC01 fail: kiểm tra rule hỏi module trong request-intake
- Nếu TC02 fail: kiểm tra thứ tự module-creation trước entity CRUD
- Nếu TC04 fail: kiểm tra heuristic side-drawer trong intake và CRUD skill
- Nếu TC05 fail: kiểm tra mapping workflow-actions trong chat mode và prompt pack
