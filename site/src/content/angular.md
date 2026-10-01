---
title: Angular Core UI
description: Triển khai portal và feature theo approved scope, design handoff và package/API evidence của app thực tế.
---

## Kiểm tra eligibility trước

`sdcorejs-angular` dành cho app dùng `@sdcorejs/angular` hoặc legacy `@sd-angular/core`, tạo portal SDCoreJS mới hoặc migration đã duyệt rõ. Angular thuần với Material/PrimeNG/local UI dùng generic harness và UI đã cài. Không thêm Core UI chỉ vì request nhắc “Angular”.

## Inputs trước implementation

Verified approved spec/plan, frontend architecture và design handoff là các đầu vào cần kiểm tra. Với production UI, thiếu matching handoff cần chuyển Design trước code. Missing API/backend/design không tự chọn prototype.

Design mô tả layout, states, copy, responsive rules và component/data map. Executor xác minh exact package/version và relevant exports trước dùng Core UI API. Cần giữ shell/menu/routes/permissions và conventions hiện có.

## Chọn vùng công việc

| Scope | Đầu ra chính |
| --- | --- |
| init-portal | Portal shell và setup theo template/conventions đã duyệt |
| admin-screens | Account/role/permission surfaces khi scope có phép |
| init-module | Module boundary và route registration |
| init-entity | CRUD contracts, data access, list/detail và focused tests |
| screen-list | Filters, table, paging, selection và bulk actions đã yêu cầu |
| screen-detail | Create/update/detail, validation và state coverage |
| actions | Workflow/export/custom side effects trong approved contract |

Không mặc định ép mọi scope phải có admin/auth/export. Một route có nhiều trách nhiệm cần feature-local boundaries hợp lý; extraction không nhất thiết thành shared/public component.

## Prompt để bắt đầu

```text
Tôi muốn Product CRUD trong catalog của portal Core UI hiện có.
PRD, API, permission matrix và design handoff được đính kèm.
Dùng SDCoreJS flow, giữ package alias/version, routes và shell đang có.
Trước code, xác minh approved spec/plan và frontend architecture.
```

Đây là prompt mẫu, không phải transcript đã pass. Đi qua [recipe feature](/docs/recipes/feature/) để hiểu từng đầu ra và cách nối AC với tests.

## Prototype cần scope rõ

Profile `technical-prototype` chỉ dùng khi được chọn rõ trong approved scope/current authorization tương ứng. Demo-only assumptions không phải production evidence. New portal vẫn template-first; existing portal mở rộng shell đang có.

Không suy profile từ vai trò PO/BA, “quick screen” hoặc vì thiếu backend. Không fake auth, seed data hay trạng thái thành công để che missing integration.

## Kiểm chứng và bàn giao

Focused tests, UI behavior/accessibility checks, review/repair, documentation và traceability chạy theo scope. Ghi checks chưa chạy. Verify/convergence rồi branch-ready là gate cuối read-only; Git actions cần authorization.

Nguồn: [Angular skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/angular/sdcorejs-angular.md), [Core UI docs fetcher](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/angular/core-docs-fetch.mjs), [UI/UX reference index](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/design/uiux/index.md).
