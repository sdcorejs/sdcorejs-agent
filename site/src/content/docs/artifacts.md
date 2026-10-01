---
slug: artifacts
title: Artifacts, approval & bằng chứng
description: Hiểu người dùng duyệt gì, artifact thuộc repo nào và kiểm chứng thế nào trước khi nhận bàn giao.
kicker: Làm việc cùng team
---

## Bạn duyệt những gì?

Spec và plan có approval riêng, sau đó được lưu thành approved snapshots với identity/hash. Scope thay đổi không được âm thầm ghi vào artifact đã duyệt. Architecture là gate có điều kiện khi thay đổi liên quan ownership, public contracts, security boundary hoặc quyết định kiến trúc đáng kể.

Bạn nên nhìn thấy **hành vi và non-goals** ở spec; **owned paths, units, dependencies, verification** ở plan. Approval phải rõ scope. Im lặng, click xem mockup hay câu lệnh “build” không tự thay thế các điểm duyệt này.

## Artifact nào giúp đọc tiến độ thực chất?

| Artifact | Nội dung để kiểm tra | Owner |
| --- | --- | --- |
| Spec / approved spec | Requirements, AC, invariants, phạm vi | Spec |
| Plan / approved plan | Task-path mapping, dependencies, validation map | Plan |
| Product bundle | PRD, stories, AC, UAT và ledger | Product |
| Design bundle | Flows, handoff, editable wireframes, decision notes | Design |
| Test evidence | Command/case đã chạy, revision, kết quả và AC liên quan | Test |
| Review / repair report | Finding có vị trí; authority và evidence sửa | Review / Repair |
| Technical docs / guide | Hành vi đúng nguồn; ảnh thật nếu đã capture | Documentation |
| Convergence / readiness | Nối approved intent với source và evidence hiện tại | Ship |

Checklist đang chạy nằm trong thread/runtime. Không dùng file “current session” làm nguồn tiến độ toàn cục.

## Các đường dẫn cần nhận biết

Ví dụ dưới mô tả canonical layout của **target repo sở hữu artifact**, không phải yêu cầu copy mọi thư mục vào mỗi project:

```text
.sdcorejs/specs/
.sdcorejs/plans/
.sdcorejs/product/prds/<feature>.md
.sdcorejs/product/acceptance-criteria/<feature>.md
.sdcorejs/design/specs/<feature>.md
.sdcorejs/design/wireframes/<feature>/
.sdcorejs/docs/product/<feature>.md
.sdcorejs/docs/design/<feature>.md
.sdcorejs/documentation/technical-docs/<doc-key>/<doc-key>.md
.sdcorejs/documentation/user-guides/<doc-key>/<doc-key>.md
```

Module sở hữu tài liệu và assets của module. Portal chỉ sở hữu shell, composition, integration và aggregate tham chiếu nguồn module. Checkout hiện tại không tự xác định owner. Khi owner thiếu hoặc không writable, báo blocker thay vì ghi sang portal.

Root `product/` và `design/` là compatibility read-only cho repo cũ. Cập nhật legacy cần migration cùng bundle và kiểm tra conflicts; không tạo hai editable copies.

## Đọc kết quả kiểm chứng

Một kết quả hữu ích gồm command hoặc test case, môi trường, revision/scope hiện tại, kết quả thực tế và AC nó chứng minh. “Tests xanh” chưa đủ nếu tests không kiểm tra hành vi vừa thay đổi.

- **Deterministic/offline:** contracts, fixtures và validators chạy local.
- **Full E2E:** flow trong môi trường đã chuẩn bị; dependencies, containers hoặc UI thực cần sẵn sàng.
- **Live-agent/provider:** phiên thực tế, tool/runtime/model và evidence riêng.
- **NOT RUN:** chưa chạy; cần nói lý do và giới hạn của claim.

Ảnh render từ wireframe là mockup. Screenshot ứng dụng thật cần capture từ UI thật cùng provenance. PNG đơn lẻ không thay thế editable design source.

## Finish gate và bàn giao

Sau implementation, hoàn tất tests, review/repair khi có findings, docs/traceability và artifacts cần thiết; simplification là opt-in, có baseline và focused rechecks. Verification nối các bằng chứng hiện tại qua validation map và convergence.

`branch-ready` là gate read-only cuối. Nếu còn ghi code/docs sau đó, phải chạy lại trước Git handoff. `sdcorejs-git` chỉ tạo commit/PR hoặc thao tác Git theo authority đã có; readiness không phải quyền tự publish/deploy.

## Checklist khi nhận kết quả

- Scope thực thi có khớp spec/plan và approved revision không?
- Đường dẫn thay đổi có thuộc đúng owner không?
- AC quan trọng có test hoặc bằng chứng tương ứng không?
- Review là độc lập hay self-critique? Phần nào chỉ đọc source?
- Checks fail, chưa chạy, giới hạn live-provider và blockers có được ghi rõ không?
- Docs/artifacts đã xong trước gate read-only cuối chưa?

Nguồn: [artifact roots](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/system-registry.json), [finish gate](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/finish-gate.md), [documentation layout](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/documentation-layout.md).
