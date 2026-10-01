---
slug: capabilities
title: Năng lực & phạm vi
description: Chọn bộ skill theo công việc và đầu ra bạn cần; hiểu điều kiện áp dụng trước khi dùng vào dự án.
kicker: Hiểu bộ skill
---

## Bộ skill giải quyết việc gì?

SDCoreJS Agent là bộ Markdown skills, references và công cụ kiểm tra cho AI coding agent. Developer dùng nó để tổ chức một thay đổi; team lead dùng artifacts và bằng chứng để xem phạm vi nào đã được duyệt, thực thi và kiểm chứng.

| Công việc | Skill chính | Đầu ra để đánh giá |
| --- | --- | --- |
| Hiểu repo và luồng đang có | `sdcorejs-explore` | Bối cảnh, code map, vị trí cần đọc, phần còn chưa rõ |
| Làm rõ yêu cầu và phạm vi | brainstorming, spec, architecture khi cần, plan | Spec/plan đã duyệt; đường dẫn, AC và cách kiểm chứng |
| Chuẩn hóa yêu cầu sản phẩm | `sdcorejs-product` | PRD, user stories, AC, UAT checklist, traceability |
| Chốt trải nghiệm trước khi code | `sdcorejs-design` | Flows, handoff spec, editable wireframes, PNG nếu đã render |
| Thực thi theo stack | angular, nestjs, nextjs, ai-agent | Code/contracts, focused tests và evidence của thay đổi |
| Kiểm tra và xử lý vấn đề | test, review, debug, repair-loop | Test runs, findings có vị trí và bằng chứng, kết quả sửa |
| Viết tài liệu và bàn giao | documentation, ship, git | Docs đúng nguồn, readiness evidence, Git artifacts khi được cho phép |

Tra cứu [toàn bộ skills](/skills/) hoặc bắt đầu từ [tình huống của bạn](/docs/workflows/).

## Stack và điều kiện áp dụng

**Angular Core UI:** dành cho portal có `@sdcorejs/angular` hoặc `@sd-angular/core`, và tạo portal mới trong phạm vi được duyệt. Giữ alias/package đang dùng, kiểm tra version và API thực tế. Angular thuần đi qua generic harness; không tự cài Core UI để ép phù hợp. Xem [hướng dẫn Angular](/angular/).

**NestJS:** triển khai module, entity, API và business logic theo hợp đồng của dự án. Các pack init/module/entity/action được chọn theo phạm vi, không đồng nghĩa backend đã được vận hành trên production.

**Next.js:** website theo router/version hiện có, bao gồm nội dung, SEO, i18n và cache trong phạm vi đã duyệt. Đây là track implementation; audit một site hiện có thuộc review.

**AI-agent:** authoring contracts, integration code và deterministic evals với một engine `openai-responses` hoặc `openai-agents-sdk`, độc lập với capability profile. Ứng dụng sở hữu credentials, trusted identity, permissions, tools và state. Xem [recipe AI-agent](/docs/recipes/ai-agent/).

**Product, Design, Test, Documentation:** có thể dùng theo đầu ra chuyên biệt. Product không viết app code; Design không viết production frontend; Documentation không làm project summary; Review giữ read-only.

**Stack khác:** `sdcorejs-execute-plan` dùng generic harness khi phạm vi và verification đã rõ. Fallback này không bổ sung kiến thức framework chuyên biệt chưa có.

## Workflow có thể chọn mức nào?

- **Hỏi đáp:** trả lời trực tiếp khi không có yêu cầu sửa file.
- **Fast-fix:** sửa nhỏ, hành vi và AC đã rõ, đường dẫn thuộc phạm vi, rủi ro thấp và có focused verification.
- **Thay đổi đáng kể:** làm rõ yêu cầu → duyệt spec → kiến trúc khi cần → duyệt plan → thực thi → finish gate.
- **Delegation:** phụ thuộc capability của runtime, quyền sở hữu đường dẫn và dependency giữa các units. Có fallback sang fresh workers tuần tự hoặc parent execution.

## Giới hạn cần hiểu

Không suy ra bảo đảm về tốc độ, chi phí token hay model compatibility từ thiết kế của skill. Bằng chứng deterministic, Full E2E và live-agent là các lớp khác nhau. Một lớp thành công không thay thế lớp còn chưa chạy.

CI/CD rollout, IaC, observability, incident response, SRE, compliance và release governance chưa thuộc phạm vi tự động mở rộng của bộ skill. Nếu cần các phần này, phải duyệt scope riêng.

## Nguồn

Năng lực trên bám [AGENTS.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md), [Adoption Guide](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/ADOPTION.md), canonical skill sources và [AI-agent manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json). Xem [phiên bản & bằng chứng](/docs/versions/) trước khi áp dụng candidate.
