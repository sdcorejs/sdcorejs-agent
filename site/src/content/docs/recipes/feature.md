---
slug: recipes/feature
title: Feature từ yêu cầu đến kiểm chứng
description: Ví dụ Product management trong Angular Core UI và NestJS; theo dõi đầu ra từng bước thay vì chỉ nhận code cuối cùng.
section: Recipes / Feature
kicker: Recipe · Feature
---

## Tình huống và inputs

Team cần list/create/edit/detail Product trong module catalog. Product có code, name và status. Đây là **ví dụ tài liệu**: fields, rules và AC dưới đây phải được xác nhận trong target project.

Chuẩn bị PRD hoặc brief, màn hình hiện có, API shape, validation rules, permission matrix, owner repo/module và các test scripts. Kiểm tra app đã có Core UI hay chưa; Angular thuần dùng generic harness.

## 1. Làm rõ requirement

```text
Tôi muốn thêm Product management trong catalog: list/create/edit/detail.
Nguồn PRD, API và permission được đính kèm.
Dùng SDCoreJS flow. Giữ conventions và component đang có.
Trước tiên kiểm tra bối cảnh và làm rõ blockers; chưa viết code.
```

Explore thu thập context; Brainstorming chốt nguồn hành vi. Product giúp viết stories/AC nếu cần. Ví dụ AC đã xác nhận có thể là:

- `AC-001`: filter status dùng đúng contract API và reset paging theo behavior đã duyệt.
- `AC-002`: save Product hợp lệ theo rules đã duyệt; validation error giữ dữ liệu nhập.
- `AC-003`: user thiếu permission không thực hiện được mutation; backend kiểm tra quyền.

## 2. Duyệt spec và design

Spec ghi hành vi, non-goals, ownership, contracts và AC. Duyệt spec rõ scope. Architecture được xử lý nếu change có ý nghĩa về kiến trúc.

Design ghi list/detail, trạng thái empty/loading/error/permission, responsive rules, copy và component/data map. Handoff cần editable source cùng spec; PNG chỉ hỗ trợ xem layout.

```text
Dùng sdcorejs-design từ stories và AC đã xác nhận.
Giữ shell, tokens, Core UI components và routes đang có.
Thiết kế list/detail, validation/error và mobile behavior.
Cho tôi handoff editable và các quyết định còn candidate.
```

**Đầu ra để review:** Product AC → screen/state → component/action. Không coi ảnh đẹp là bằng chứng behavior đúng.

## 3. Duyệt plan và thực thi

Plan cần liệt kê owned paths, units backend/frontend, dependencies và validation map. Đọc plan để biết AC nào được chứng minh bằng case nào. Sau approval, Execute Plan chọn NestJS và Angular Core UI theo source evidence.

Chỉ delegate khi ownership/resources và capability runtime cho phép. Backend contract và frontend consumer có dependency; fan-in phải kiểm tra mapping sau integration.

## 4. Test, review và repair

| AC ví dụ | Bằng chứng cần có |
| --- | --- |
| AC-001 filter | Integration/API parameter check và UI flow reset paging |
| AC-002 save/error | Valid/invalid submit, server error và dữ liệu được giữ |
| AC-003 permission | Server authorization test và UI permission state |

Test chạy commands được tìm thấy trong target repo. Review đánh giá diff, architecture/conventions và accessibility theo evidence có sẵn. Findings cần exact location, impact và cách verify. Repair chỉ sửa findings đã xác minh trong authority.

## 5. Verify và bàn giao

Hoàn tất docs/traceability cần thiết, rerun focused checks sau sửa và nối evidence về AC. Ship kiểm tra validation/convergence, rồi branch-ready là read-only cuối. Git artifacts cần authorization riêng theo phạm vi đã có.

Kết quả đáng nhận gồm: đường dẫn đã thay đổi, artifacts, command/cases thực sự đã chạy, kết quả, blockers, phần NOT RUN và mức evidence. Recipe này không cam kết CI/production deployment.

## Nếu bị chặn

- PRD và API khác nhau: chốt source of truth trước spec.
- Thiếu backend permission: dừng claim security, không dùng UI hiding làm authorization.
- Không có design handoff cho production UI: chuyển Design trước implementation.
- Tests không chạy vì environment: ghi NOT RUN và blocker, giữ evidence đã có.

Nguồn quy trình: [Worked Example](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/WORKED_EXAMPLE.md), [Angular canonical skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/angular/sdcorejs-angular.md), [Design canonical skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/design/sdcorejs-design.md).
