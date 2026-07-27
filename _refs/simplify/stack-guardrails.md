# Simplify Stack Guardrails

## Contents

- [Load policy](#load-policy)
- [Angular](#angular)
- [NestJS](#nestjs)
- [Next.js / React](#nextjs--react)
- [AI-agent implementation](#ai-agent-implementation)
- [Handoff rule](#handoff-rule)

## Load policy

Load only the section matching the detected target. Use current project
evidence and existing architecture context; do not duplicate or load the full
Angular, NestJS, Next.js, or AI-agent reference packs for a local
simplification.

When framework evidence is ambiguous, fail closed or analyze only. A local
rewrite must not cross a framework boundary just because tests still pass.

## Angular

Preserve:

- component, directive, service, and provider lifecycle;
- dependency-injection scopes and tokens;
- signals, `computed`, and `effect` evaluation semantics;
- Observable subscription timing, teardown, and error propagation;
- change-detection behavior;
- route configuration, guards, and resolvers;
- reactive/template form validation order;
- template bindings, DOM structure, selectors, CSS classes, and `autoId`;
- ARIA/accessibility attributes and user-visible copy;
- public component inputs/outputs and framework metadata;
- boundaries recorded in `frontend_architecture`.

Do not collapse component/facade/service boundaries when they carry a clear
responsibility. Do not rewrite decorators, route paths, permissions, template
contracts, or Core UI metadata under a direct simplification action.

## NestJS

Preserve:

- decorators and reflection metadata;
- module/provider scope and injection behavior;
- controller routes, parameters, response shapes, and status codes;
- DTO validation and transform order;
- guards, interceptors, pipes, filters, and exception mapping;
- tenant and permission enforcement;
- transaction boundaries and side-effect order;
- idempotency and optimistic-concurrency semantics;
- database query and persistence semantics;
- audit and telemetry behavior.

Do not replace domain-specific APIs with generic repository/data-access calls.
Do not move checks across guards/services/repositories or collapse layers when
their ordering or metadata is observable.

## Next.js / React

Preserve:

- server/client boundary and `'use client'`;
- hook call order and effect/subscription lifecycle;
- render, hydration, and event behavior;
- route structure and loader/action/route-handler semantics;
- cache and revalidation policy;
- metadata and SEO behavior;
- streaming and Suspense boundaries;
- DOM, selector, accessibility, and user-visible copy contracts.

Do not move logic across the server/client boundary to reduce code. Do not
change caching, data-fetch timing, serialization, or component ownership under
a direct simplification action.

## AI-agent implementation

When `ai_agent_context` exists, preserve:

- engine profile and capability profile;
- model policy and bounded execution limits;
- tool names, descriptions, and tool schemas;
- prompts and instructions;
- trusted context and tenant/permission boundaries;
- guardrails and approval policy;
- exact-input binding and self-approval prohibition;
- application session ownership and provider-storage policy;
- evidence, tracing, audit, FinOps, and evaluation contracts;
- handoff/tool-as-agent boundaries and retry/timeout policy.

Only simplify implementation code around those contracts when their public and
semantic meaning is unchanged and current focused evidence covers the selected
hunks. Never simplify AI-agent prompt, schema, policy, fixture, eval, or
instruction files directly.

Any proposal to change prompts and instructions, tool schemas, model policy,
guardrails, approval, storage, session, evidence, tracing, cost, or eval policy
returns to `sdcorejs-spec` or `sdcorejs-plan`.

## Handoff rule

Return to planning when a proposed rewrite changes a framework boundary,
metadata, public API, rendering contract, authorization/tenant control,
persistence policy, agent contract, or verification oracle. Route concrete
bugs to `sdcorejs-debug`, structured findings to `sdcorejs-repair-loop`, and
test-oracle work to `sdcorejs-test`.
