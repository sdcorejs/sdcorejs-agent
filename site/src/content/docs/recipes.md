---
slug: recipes
title: Recipes cho công việc thực tế
description: Mỗi recipe nối một mục tiêu với inputs, skills, artifacts và bước kiểm chứng có thể đánh giá.
kicker: Từ yêu cầu đến áp dụng
---

## Chọn một recipe

| Mục tiêu | Recipe | Điều kiện |
| --- | --- | --- |
| Thêm feature có UI và backend | [Product management](/docs/recipes/feature/) | Repo, PRD, API/permissions, test environment |
| Cải thiện màn hình hiện có | [UI improvement](/docs/recipes/ui/) | Source/screenshot, tokens, component và behavior hiện hành |
| Sửa lỗi tái hiện được | [Debug & regression](/docs/recipes/debug/) | Repro, expected/actual và failing evidence |
| Xây ứng dụng có AI-agent | [AI-agent contracts](/docs/recipes/ai-agent/) | Owner repo, engine/capability, trust/tool/approval policy |

## Cách dùng recipes

Các prompt và AC trong recipes là **ví dụ minh họa**, không phải log một agent đã thực thi thành công. Thay domain và constraints bằng dữ liệu của dự án. Xác minh command từ package scripts/test runner thật; không copy một lệnh verification vào repo chưa có lệnh đó.

Ở mỗi bước, kiểm tra artifact hoặc evidence trước khi tiến tiếp. Khi nguồn mâu thuẫn, chốt nguồn hành vi có thẩm quyền. Khi thiếu backend, permissions hoặc owner, nói rõ blocker thay vì tạo dữ liệu để che khoảng trống.

## Chuẩn bị một brief hữu ích

```text
Mục tiêu và actor:
Hành vi cần có / non-goals:
Repo và vùng sở hữu:
Nguồn: PRD, ảnh/UI, API, log hoặc diff:
Constraints phải giữ:
Verification có sẵn:
Đầu ra muốn review:
```

Brief không cần dài. Nó cần giúp agent tìm được evidence, boundaries và bước kiểm chứng đúng. Xem [chọn workflow](/docs/workflows/) nếu bạn chỉ cần hỏi đáp, audit hoặc sửa nhỏ.
