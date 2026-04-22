# Prompt Pack Smoke Test SDCoreJS Angular Portal (Tiếng Việt)

Dùng các prompt sau trong VS Code Chat với mode SDCoreJS.

## Prompt 1
Tạo CRUD product với các field code, name, price.

## Prompt 2
Tạo màn hình customer. Hiện chưa có module phù hợp, hãy tạo mới giúp mình.

## Prompt 3
Tạo CRUD order trong module sales. Field để mình bổ sung sau.

## Prompt 4
Tạo màn hình detail supplier với 6 field: code, name, phone, email, status, note.
Dùng chuẩn CRUD thông thường.

## Prompt 5
Tạo màn hình purchase request trong module procurement.
Cần create, update, detail, submit, approve, reject.
List page cần bulk submit và bulk approve.
Detail có nhiều section, child table item, và review attachment.

## Prompt 6
Khởi tạo portal starter mới từ baseline nội bộ trong sdcorejs-agent/core/templates/angular-portal-starter.
Giữ shell starter và scaffold bắt buộc src/libs/sample.
Không giữ các cấu hình tsconfig không cần thiết.

## Prompt 7
Khởi tạo portal starter ở một workspace hoàn toàn mới.
Version package phải khớp chính xác với sdcorejs-agent/core/templates/angular-portal-starter/package.template.json.
Không suy luận hoặc tự nâng version theo bất kỳ repo mẫu bên ngoài nào.
Không dùng dependency kiểu file:*.tgz cho @sd-angular/core.
Cho phép starter có src/app/pages/home và hỗ trợ điều hướng home qua LayoutConfiguration.homeUrl.
Phải tạo src/libs/sample/modules/employee và src/libs/sample/modules/product.

## Điểm cần xác nhận
- Thiếu module thì hỏi lại trước
- Chưa có module thì tạo module trước
- Thiếu field thì sinh skeleton tối thiểu trước
- Form đơn giản thì ưu tiên side-drawer
- Workflow phức tạp thì ưu tiên full-page và có đủ action detail/list
- Với portal init, tsconfig không nên giữ `compilerOptions.baseUrl` nếu không có lý do resolve import rõ ràng
- Với portal init, starter phải có src/libs/sample và seed sẵn 2 entity employee/product
- Với portal init ở workspace mới, version package sinh ra phải khớp baseline nội bộ (không bị version drift)
- Với portal init, starter home có thể custom tại src/app/pages/home và nối với LayoutConfiguration.homeUrl
