---
slug: recipes/ai-agent
title: Xây dựng ứng dụng AI-agent
description: Chốt lifecycle engine, capability profile và security boundaries trước khi tạo application contracts và integration code.
section: Recipes / AI-agent
kicker: Recipe · AI-agent
---

## Tình huống và inputs

Ví dụ: reporting assistant trả lời từ nguồn được phép và phải dẫn evidence. Đây là ví dụ tài liệu; chưa có provider/model nào được kiểm chứng qua recipe này.

Chuẩn bị module owner repo, authenticated server/job context, tenant/authorization model, business-shaped tools, nguồn dữ liệu, approval policy, persistence policy, budgets/limits và deterministic eval scenarios.

## 1. Chọn hai trục độc lập

| Trục | Lựa chọn có trong manifest | Quyết định |
| --- | --- | --- |
| Engine | `openai-responses`, `openai-agents-sdk` | Ai sở hữu loop/lifecycle |
| Capability | 12 profiles, gồm reporting, analytics, knowledge, audit… | Objective, evidence, tool categories và policy nghiệp vụ |

Responses profile để ứng dụng sở hữu loop/dispatch/state. Agents SDK profile để runner sở hữu loop; application vẫn sở hữu tools, permissions, approvals, persistence và evidence. Không trộn lifecycle assumptions giữa hai profile.

Capability IDs chính xác: `reporting-assistant`, `analytics-assistant`, `knowledge-assistant`, `audit-assistant`, `crm-assistant`, `workflow-assistant`, `support-assistant`, `document-assistant`, `data-provisioning-assistant`, `tenant-operations-assistant`, `approval-coordinator`, `multi-agent-supervisor`.

## 2. Làm rõ và duyệt contracts

```text
Tôi muốn reporting assistant cho module này.
Dùng SDCoreJS flow để chốt engine/capability và agent architecture.
Nguồn identity/tenant là authenticated server context.
Tools chỉ phục vụ nghiệp vụ được duyệt; mọi evidence phải có provenance.
Trước tiên lập spec/plan và các blockers, chưa gọi provider.
```

Approved plan phải có engine, capability, target paths, trust/tool boundaries, persistence, approvals, evals và verification commands. Executor kiểm tra immutable approved spec/plan graph và hashes trước ghi source.

## 3. Giữ security floor

- Identity, tenant, roles và session phải đến từ authenticated application/job context; model input không tạo trust.
- Tools có mục đích nghiệp vụ; không lộ generic raw SQL/HTTP/mutation/code execution.
- Mutations cần exact-input approval, idempotency, resource version, server authorization, audit và redaction.
- Session/state cần isolation theo tenant/user và policy concurrency.
- Provider storage mặc định tắt khi chưa có governance approval.
- Evidence cần provenance, freshness/partiality; limits và budget policy phải rõ.

Thiếu trusted context là blocker. Không hardcode identity hoặc tạo seed data rồi dùng làm evidence runtime.

## 4. Thực thi và kiểm chứng

`sdcorejs-ai-agent` tạo application contracts/integration/tests trong owner repo; skill pack không chứa một hosted agent runtime. Application tự quản lý dependencies và credentials.

Chạy offline contract validator, deterministic evals và focused tests theo approved commands. Kiểm tra cả rejection cases: cross-tenant access, unauthorized mutation, stale approval/version, thiếu evidence và budget/limit exhaustion.

Live provider compatibility/behavior cần authorization và evidence riêng. Nếu credentials không có, ghi **NOT RUN** cho live verification; offline pass không chứng minh model/provider support.

## Đầu ra để review

Contracts, tool boundaries, trusted context sources, approval bindings, session controls, eval/test commands, actual results và downstream `ai_agent_context`. Giữ source revision và approved identities để Review/Repair/Ship nối evidence đúng change.

Nguồn: [AI-agent skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/ai-agent/sdcorejs-ai-agent.md), [manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json), [common security floor](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/profiles/common.md).
