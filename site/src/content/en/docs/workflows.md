---
slug: workflows
title: Choose a workflow for your situation
description: Start with the problem and the output you need. You do not have to memorize every skill name to assign a clear task.
kicker: Choose your path
---

## Choose a starting point

| You need | Start with | Prepare | Output / next step |
| --- | --- | --- | --- |
| Understand a repository or trace a flow | [Explore](/skills/sdcorejs-explore/) | Repository, question and area to read | Read-only context; define the change scope |
| A new feature with unclear requirements | [Brainstorming](/skills/sdcorejs-brainstorming/) | Goal, actor and PRD/API/screenshots when available | Clear scope → spec → plan |
| PRD, stories, AC or UAT | [Product](/skills/sdcorejs-product/) | Business rules and non-goals | Traceable product artifacts |
| Design or improve a UI | [Design](/skills/sdcorejs-design/) | Requirements and existing screens/tokens/conventions | Editable handoff before implementation |
| Execute an approved plan | [Execute Plan](/skills/sdcorejs-execute-plan/) | Approved spec/plan and target paths | Select the executor and run the finish gate |
| A bug or failing test | [Debug](/skills/sdcorejs-debug/) | Reproduction, expected/actual behavior, logs and failing command | Root cause → fix with regression evidence |
| Write/review coverage or run tests | [Test](/skills/sdcorejs-test/) | AC, test layer and environment | Evidence tied to the behavior being checked |
| Review source/UI/conventions | [Review](/skills/sdcorejs-review/) | Diff/scope, dimensions and available evidence | Read-only findings; separate repair |
| Fix verified findings | [Repair Loop](/skills/sdcorejs-repair-loop/) | Findings, authority, paths and revision | Scoped repair, rechecks or escalation |
| Technical docs or user guides | [Documentation](/skills/sdcorejs-documentation/) | Actual behavior/API/UI sources | Source-backed docs; real screenshots when the guide needs them |
| Clarify source while preserving behavior | [Simplify](/skills/sdcorejs-simplify/) | Source diff/scope and a green baseline | Read-only analysis or opt-in apply |
| Assess handoff readiness | [Ship](/skills/sdcorejs-ship/) | Current approved artifacts, tests/review/docs | Verification, convergence and branch-ready |

## When should you use fast-fix?

Use it only for a small change with clear behavior/AC, bounded scope and ownership, low risk and focused verification. For example: correct a specifically identified label, then check the screen and diff.

Do not use fast-fix to guess the cause of a flaky test, change a public API or architecture, or modify several workflows. When scope grows, return to requirements → spec → plan.

## Choose an executor after the plan

Let `sdcorejs-execute-plan` resolve the track from source and approved scope. Angular Core UI, NestJS, Next.js, AI-agent, Product, Design and Test have specialist owners. Stacks without an executor use the generic harness.

For example, "Angular app" alone does not justify `sdcorejs-angular`; plain Angular without Core UI needs the generic harness. "AI assistant" alone does not select an engine/capability; those choices belong in the approved plan.

## Sequential execution or delegation?

Delegation helps when a plan has substantial units, clear dependencies and non-overlapping owned paths/resources. `sdcorejs-subagent-driven-development` coordinates fresh workers; `sdcorejs-parallel-dispatch` checks wave and fan-in safety.

The runtime must provide evidence of actual capabilities. Adapter metadata or host marketing does not prove that isolation, cancellation or concurrency works in the session. Sequential fresh workers or parent execution remain valid fallbacks.

## Example task brief

```text
Goal: add a status filter to the Product list in catalog.
Sources: the attached PRD, API and current screen.
Preserve: routes, permissions, API contract and existing components.
Outputs: scope/spec for approval, plan, implementation and verification evidence.
Verification: discover existing test commands; state checks not run.
```

This is an example prompt, not an executed transcript. For an audit only, add "read-only, report findings, do not edit files".

## Read the relevant recipe

- [Feature: requirements → design → implementation → review → verify](/docs/recipes/feature/)
- [Improve an existing UI](/docs/recipes/ui/)
- [Diagnose and fix a bug](/docs/recipes/debug/)
- [AI-agent application](/docs/recipes/ai-agent/)

Routing and fast-fix sources: [AGENTS.md](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/AGENTS.md), [Adoption Guide](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/ADOPTION.md). Each skill reference links to its canonical source.
