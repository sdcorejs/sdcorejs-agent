---
slug: recipes/debug
title: Chẩn đoán & sửa lỗi
description: Biến expected/actual behavior và failing evidence thành một fix có regression check; giữ root-cause work tách khỏi sửa nhỏ theo phỏng đoán.
section: Recipes / Debug
kicker: Recipe · Debug
---

## Tình huống và inputs

Ví dụ: filter Product đang gửi sai giá trị hoặc một test fail sau thay đổi. Cung cấp reproducible steps, expected/actual, log đã redact, failing command, environment và revision/diff. Prompt dưới là ví dụ, không phải evidence sửa thành công.

## 1. Thu thập bằng chứng

```text
Dùng sdcorejs-debug cho lỗi filter status của Product.
Expected: giá trị theo API contract đã đính kèm.
Actual: request khác contract; log và repro được đính kèm.
Tìm root cause trước khi đề xuất fix. Giữ public API và permissions.
```

Explore có thể hỗ trợ trace-flow read-only. Debug xác minh reproducer, xác định vùng lỗi và kiểm tra giả thuyết. Nếu không tái hiện được, ghi rõ kết quả và dữ liệu còn thiếu; không tuyên bố đã tìm root cause.

## 2. Chọn authority cho fix

Fix ở approved scope có thể tiến trong boundary hiện có. Root cause yêu cầu thay API, dependency, kiến trúc hoặc ownership thì quay lại scope/spec/plan tương ứng. Review findings cần Repair Loop xác minh feedback và authority; không tự coi nhận xét là yêu cầu sửa chính xác.

## 3. Rerun checks

Test cần fail đúng failure mode trước fix khi điều kiện tái hiện cho phép, rồi pass sau fix. Chạy focused command của target repo; recheck integration/behavior bị ảnh hưởng. Một test mới chỉ lặp implementation chưa đủ chứng minh regression đã được kiểm soát.

Với test flaky, lưu evidence nhiều lần chạy và kiểm tra concurrency/timing/environment. Không thay expectation hay xóa test để biến suite xanh.

## 4. Báo kết quả

Nêu cause có evidence, changed paths, command/cases và kết quả thực, review/repair findings còn lại. Phân biệt “không tái hiện”, “fixed trong môi trường này” và “live behavior chưa chạy”.

Nguồn: [Debug skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/shared/workflow/debug.md), [Repair Loop](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/orchestration/repair-loop.md).
