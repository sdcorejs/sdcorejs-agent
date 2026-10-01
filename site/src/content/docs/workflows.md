---
slug: workflows
title: Chọn workflow theo tình huống
description: Bắt đầu từ vấn đề và đầu ra cần có. Không cần thuộc tên mọi skill để giao một việc rõ ràng.
kicker: Chọn đường đi
---

## Chọn điểm bắt đầu

| Bạn cần | Bắt đầu với | Chuẩn bị | Đầu ra / bước tiếp theo |
| --- | --- | --- | --- |
| Hiểu repo hoặc truy luồng | [Explore](/skills/sdcorejs-explore/) | Repo, câu hỏi, vùng cần đọc | Bối cảnh read-only; chọn phạm vi thay đổi |
| Feature mới, yêu cầu chưa rõ | [Brainstorming](/skills/sdcorejs-brainstorming/) | Mục tiêu, actor, PRD/API/ảnh nếu có | Scope rõ → spec → plan |
| PRD, stories, AC, UAT | [Product](/skills/sdcorejs-product/) | Nghiệp vụ và non-goals | Product artifacts có traceability |
| Thiết kế hoặc cải thiện UI | [Design](/skills/sdcorejs-design/) | Yêu cầu, màn hình/token/convention hiện có | Handoff editable trước implementation |
| Thực thi plan đã duyệt | [Execute Plan](/skills/sdcorejs-execute-plan/) | Approved spec/plan và target paths | Chọn executor, chạy finish gate |
| Bug hoặc test đang fail | [Debug](/skills/sdcorejs-debug/) | Repro, expected/actual, log và failing command | Nguyên nhân → fix có regression evidence |
| Viết/rà coverage/running tests | [Test](/skills/sdcorejs-test/) | AC, test layer, environment | Evidence gắn với hành vi cần kiểm |
| Review source/UI/conventions | [Review](/skills/sdcorejs-review/) | Diff/scope, dimensions, evidence có sẵn | Findings read-only; repair riêng |
| Sửa findings đã xác minh | [Repair Loop](/skills/sdcorejs-repair-loop/) | Findings, authority, đường dẫn và revision | Sửa trong scope, rerun checks hoặc escalation |
| Technical docs / user guide | [Documentation](/skills/sdcorejs-documentation/) | Nguồn hành vi/API/UI thực tế | Docs đúng nguồn; screenshot thật khi guide cần |
| Làm rõ source, giữ hành vi | [Simplify](/skills/sdcorejs-simplify/) | Diff hoặc scope source và green baseline | Analyze read-only hoặc apply opt-in |
| Đánh giá bàn giao | [Ship](/skills/sdcorejs-ship/) | Approved artifacts, tests/review/docs hiện tại | Verification, convergence, branch-ready |

## Khi nào dùng fast-fix?

Chỉ dùng khi việc sửa nhỏ, hành vi/AC đã rõ, phạm vi và ownership giới hạn, rủi ro thấp và có focused verification. Ví dụ: sửa một nhãn sai đã chỉ rõ, rồi kiểm tra màn hình và diff.

Đừng dùng fast-fix để đoán root cause của test flaky, thay public API, đổi kiến trúc hoặc sửa nhiều workflow. Khi scope lớn lên, quay lại luồng yêu cầu → spec → plan.

## Chọn executor sau plan

Để `sdcorejs-execute-plan` xác định track từ source và approved scope. Angular Core UI, NestJS, Next.js, AI-agent, Product, Design và Test có owners chuyên biệt. Stack chưa có executor dùng generic harness.

Ví dụ: “Angular app” chưa đủ để chọn `sdcorejs-angular`; app Angular thuần không có Core UI cần generic harness. “AI assistant” chưa đủ để chọn engine/capability; phải chốt trong approved plan.

## Tuần tự hay delegation?

Delegation hữu ích khi plan có units đủ lớn, dependencies rõ, owned paths và resources không chồng lấn. `sdcorejs-subagent-driven-development` điều phối fresh workers; `sdcorejs-parallel-dispatch` kiểm tra an toàn của waves và fan-in.

Runtime cần chứng minh capability thực tế. Metadata adapter hay quảng cáo của host không chứng minh rằng isolation/cancellation/concurrency đang dùng được. Sequential fresh workers hoặc parent execution vẫn là fallback hợp lệ.

## Mẫu giao việc

```text
Mục tiêu: thêm filter status vào danh sách Product trong catalog.
Nguồn: PRD, API và màn hình hiện tại được đính kèm.
Giữ: route, permissions, API contract và component hiện có.
Đầu ra: scope/spec để duyệt, plan, implementation và verification evidence.
Kiểm chứng: tìm lệnh test có sẵn; nói rõ check nào chưa chạy.
```

Đây là prompt ví dụ, không phải transcript đã chạy. Nếu bạn chỉ cần audit, thêm “read-only, báo findings, không sửa file”.

## Đọc recipe phù hợp

- [Feature: requirement → design → implementation → review → verify](/docs/recipes/feature/)
- [Cải thiện UI hiện có](/docs/recipes/ui/)
- [Chẩn đoán & sửa lỗi](/docs/recipes/debug/)
- [Ứng dụng AI-agent](/docs/recipes/ai-agent/)

Nguồn routing và fast-fix: [AGENTS.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md), [Adoption Guide](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/ADOPTION.md). Từng skill reference dẫn tới canonical source.
