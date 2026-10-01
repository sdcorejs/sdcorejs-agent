---
slug: capabilities
title: Capabilities & scope
description: Choose skills by the work and outputs you need. Understand the conditions before applying them to a project.
kicker: Understand the skill pack
---

## What does the skill pack help you do?

SDCoreJS Agent is a collection of Markdown skills, references and validation tools for AI coding agents. Developers use it to organize a change; team leads use artifacts and evidence to see which scope has been approved, implemented and verified.

| Task | Main skill | Outputs to assess |
| --- | --- | --- |
| Understand the repository and existing flows | `sdcorejs-explore` | Context, code map, source locations to read and remaining unknowns |
| Clarify requirements and scope | brainstorming, spec, architecture when required, plan | Approved spec/plan; paths, AC and verification approach |
| Structure product requirements | `sdcorejs-product` | PRD, user stories, AC, UAT checklist and traceability |
| Define the experience before coding | `sdcorejs-design` | Flows, handoff spec, editable wireframes and PNGs when rendered |
| Implement for the project stack | angular, nestjs, nextjs, ai-agent | Code/contracts, focused tests and evidence for the change |
| Check and resolve problems | test, review, debug, repair-loop | Test runs, findings with locations and evidence, repair results |
| Document and hand off | documentation, ship, git | Source-backed docs, readiness evidence and authorized Git artifacts |

Browse [all skills](/skills/) or start with [your situation](/docs/workflows/).

## Stacks and adoption conditions

**Angular Core UI:** for portals using `@sdcorejs/angular` or `@sd-angular/core`, and for creating a new portal within approved scope. Preserve the current package alias and verify the installed version and API. Plain Angular goes through the generic harness; do not install Core UI simply to force a match. See the [Angular guide](/angular/).

**NestJS:** implements modules, entities, APIs and business logic according to the project contracts. Init/module/entity/action packs are selected by scope; their availability does not mean the backend has been operated in production.

**Next.js:** websites using the existing router/version, including content, SEO, i18n and cache within approved scope. This is an implementation track; auditing an existing site belongs to Review.

**AI-agent:** contract authoring, integration code and deterministic evals using one engine, `openai-responses` or `openai-agents-sdk`, selected independently from the capability profile. The application owns credentials, trusted identity, permissions, tools and state. See the [AI-agent recipe](/docs/recipes/ai-agent/).

**Product, Design, Test, Documentation:** can be selected for their specialist outputs. Product does not write application code; Design does not write production frontend code; Documentation does not create project summaries; Review stays read-only.

**Other stacks:** `sdcorejs-execute-plan` uses the generic harness when scope and verification are clear. This fallback does not add framework-specific knowledge that the pack does not provide.

## Which workflow levels are available?

- **Questions:** answer directly when no file changes are requested.
- **Fast-fix:** a small change with clear behavior and AC, owned paths, low risk and focused verification.
- **Substantial changes:** clarify requirements → approve spec → architecture when required → approve plan → execute → finish gate.
- **Delegation:** depends on runtime capabilities, path ownership and dependencies between units. Sequential fresh workers or parent execution are available fallbacks.

## Boundaries to understand

Do not infer guarantees about speed, token cost or model compatibility from the skill design. Deterministic checks, Full E2E and live-agent validation are different evidence layers. A passing layer does not replace one that has not run.

CI/CD rollout, IaC, observability, incident response, SRE, compliance and release governance are outside the pack’s automatically expandable scope. These areas require separate scope approval.

## Sources

These capabilities follow [AGENTS.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md), the [Adoption Guide](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/ADOPTION.md), canonical skill sources and the [AI-agent manifest](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/ai-agent/manifest.json). Read [versions & evidence](/docs/versions/) before adopting a candidate.
