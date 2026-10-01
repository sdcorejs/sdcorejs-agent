---
slug: recipes/ai-agent
title: Build an AI-agent application
description: Define the lifecycle engine, capability profile and security boundaries before authoring application contracts and integration code.
section: Recipes / AI-agent
kicker: Recipe · AI-agent
---

## Situation and inputs

For example, a reporting assistant answers from authorized sources and must cite evidence. This is a documentation example; the recipe does not verify any provider or model.

Prepare the module owner repository, authenticated server/job context, tenant/authorization model, business-shaped tools, data sources, approval policy, persistence policy, budgets/limits and deterministic evaluation scenarios.

## 1. Choose two independent axes

| Axis | Choices in the manifest | Decision |
| --- | --- | --- |
| Engine | `openai-responses`, `openai-agents-sdk` | Who owns the loop/lifecycle |
| Capability | 12 profiles, including reporting, analytics, knowledge and audit | Objective, evidence, tool categories and business policy |

The Responses profile gives the application ownership of the loop, dispatch and state. The Agents SDK profile gives the runner ownership of the loop; the application still owns tools, permissions, approvals, persistence and evidence. Do not mix lifecycle assumptions between the profiles.

Exact capability IDs: `reporting-assistant`, `analytics-assistant`, `knowledge-assistant`, `audit-assistant`, `crm-assistant`, `workflow-assistant`, `support-assistant`, `document-assistant`, `data-provisioning-assistant`, `tenant-operations-assistant`, `approval-coordinator`, `multi-agent-supervisor`.

## 2. Clarify and approve contracts

```text
I want a reporting assistant for this module.
Use the SDCoreJS flow to define engine/capability and agent architecture.
Identity/tenant comes from authenticated server context.
Tools serve approved business purposes only; every evidence item needs provenance.
First prepare the spec/plan and blockers; do not call a provider yet.
```

The approved plan must include engine, capability, target paths, trust/tool boundaries, persistence, approvals, evals and verification commands. The executor checks the immutable approved spec/plan graph and hashes before writing source.

## 3. Preserve the security floor

- Identity, tenant, roles and session come from authenticated application/job context; model input does not establish trust.
- Tools have business purposes; do not expose generic raw SQL/HTTP/mutation/code execution.
- Mutations require exact-input approval, idempotency, resource version, server authorization, audit and redaction.
- Sessions/state need tenant/user isolation and a concurrency policy.
- Provider storage stays off by default without governance approval.
- Evidence needs provenance and freshness/partiality; limits and budget policy must be explicit.

Missing trusted context is a blocker. Do not hardcode identity or create seed data and present it as runtime evidence.

## 4. Implement and verify

`sdcorejs-ai-agent` creates application contracts/integration/tests in the owner repository; the skill pack does not contain a hosted agent runtime. The application manages its dependencies and credentials.

Run the offline contract validator, deterministic evals and focused tests using approved commands. Check rejection cases too: cross-tenant access, unauthorized mutations, stale approval/version, missing evidence and exhausted budgets/limits.

Live provider compatibility/behavior requires separate authorization and evidence. If credentials are unavailable, record **NOT RUN** for live verification; an offline pass does not prove model/provider support.

## Outputs to review

Contracts, tool boundaries, trusted context sources, approval bindings, session controls, eval/test commands, actual outcomes and downstream `ai_agent_context`. Retain the source revision and approved identities so Review/Repair/Ship can bind evidence to the correct change.

Sources: [AI-agent skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/ai-agent/sdcorejs-ai-agent.md), [manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json), [common security floor](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/profiles/common.md).
