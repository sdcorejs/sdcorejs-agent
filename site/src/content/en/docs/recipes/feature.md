---
slug: recipes/feature
title: Feature from requirements to verification
description: A Product management example with Angular Core UI and NestJS; inspect each step’s outputs rather than only the final code.
section: Recipes / Feature
kicker: Recipe · Feature
---

## Situation and inputs

The team needs Product list/create/edit/detail in the catalog module. Product has code, name and status. This is a **documentation example**: the fields, rules and AC below must be confirmed in the target project.

Prepare a PRD or brief, current screens, API shape, validation rules, permission matrix, owner repository/module and test scripts. Check whether the app already uses Core UI; plain Angular uses the generic harness.

## 1. Clarify requirements

```text
I want Product management in catalog: list/create/edit/detail.
The PRD, API and permission sources are attached.
Use the SDCoreJS flow. Preserve existing conventions and components.
First inspect the context and clarify blockers; do not write code yet.
```

Explore collects context; Brainstorming confirms the behavior sources. Product helps write stories/AC when needed. Confirmed AC could look like this:

- `AC-001`: the status filter follows the API contract and resets paging according to approved behavior.
- `AC-002`: valid Product data saves under approved rules; validation errors preserve user input.
- `AC-003`: users without permission cannot perform mutations; the backend checks authorization.

## 2. Approve the spec and design

The spec records behavior, non-goals, ownership, contracts and AC. Approve an explicit scope. Address Architecture when the change has architectural significance.

Design records list/detail, empty/loading/error/permission states, responsive rules, copy and the component/data map. The handoff needs editable source and a spec; PNGs only help inspect layout.

```text
Use sdcorejs-design with the confirmed stories and AC.
Preserve the existing shell, tokens, Core UI components and routes.
Design list/detail, validation/error states and mobile behavior.
Provide an editable handoff and identify decisions that remain candidates.
```

**Outputs to review:** Product AC → screen/state → component/action. An attractive image is not evidence of correct behavior.

## 3. Approve the plan and implement

The plan should list owned paths, backend/frontend units, dependencies and the validation map. Inspect which case will prove each AC. After approval, Execute Plan selects NestJS and Angular Core UI using source evidence.

Delegate only when ownership/resources and runtime capabilities allow it. The backend contract and frontend consumer have a dependency; fan-in must check mapping after integration.

## 4. Test, review and repair

| Example AC | Required evidence |
| --- | --- |
| AC-001 filter | Integration/API parameter check and a UI flow that resets paging |
| AC-002 save/error | Valid/invalid submission, server errors and preserved input |
| AC-003 permission | Server authorization test and UI permission state |

Test runs commands discovered in the target repository. Review assesses the diff, architecture/conventions and accessibility using available evidence. Findings need exact locations, impact and verification steps. Repair fixes only verified findings within its authority.

## 5. Verify and hand off

Complete required docs/traceability, rerun focused checks after repairs and connect evidence to AC. Ship checks validation/convergence, then branch-ready is the final read-only gate. Git artifacts need separate authorization within the established scope.

A useful handoff includes changed paths, artifacts, commands/cases actually run, outcomes, blockers, NOT RUN checks and evidence levels. This recipe does not promise CI or production deployment.

## If blocked

- PRD and API disagree: confirm the source of truth before the spec.
- Backend permission checks are missing: stop security claims; UI hiding is not authorization.
- Production UI has no design handoff: route to Design before implementation.
- Tests cannot run in the environment: record NOT RUN and the blocker; retain existing evidence.

Workflow sources: [Worked Example](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/docs/WORKED_EXAMPLE.md), [Angular canonical skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/angular/sdcorejs-angular.md), [Design canonical skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/design/sdcorejs-design.md).
