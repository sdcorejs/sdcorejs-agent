---
title: Angular Core UI
description: Implement portals and features using approved scope, a design handoff and package/API evidence from the actual application.
---

## Check eligibility first

`sdcorejs-angular` targets apps using `@sdcorejs/angular` or legacy `@sd-angular/core`, creation of new SDCoreJS portals, or explicitly approved migrations. Plain Angular with Material/PrimeNG/local UI uses the generic harness and installed UI. Do not add Core UI simply because a request mentions "Angular".

## Inputs before implementation

Verify the approved spec/plan, frontend architecture and design handoff. For production UI, a missing matching handoff calls for Design before coding. Missing API/backend/design does not automatically select prototype mode.

Design describes layout, states, copy, responsive rules and the component/data map. The executor verifies exact package/version and relevant exports before using Core UI APIs. Preserve the existing shell/menu/routes/permissions and conventions.

## Choose the work area

| Scope | Main outputs |
| --- | --- |
| init-portal | Portal shell and setup from approved templates/conventions |
| admin-screens | Account/role/permission surfaces when authorized by scope |
| init-module | Module boundary and route registration |
| init-entity | CRUD contracts, data access, list/detail and focused tests |
| screen-list | Requested filters, table, paging, selection and bulk actions |
| screen-detail | Create/update/detail, validation and state coverage |
| actions | Workflow/export/custom side effects within the approved contract |

Do not require admin/auth/export in every scope by default. Routes with several responsibilities need appropriate feature-local boundaries; extraction need not create a shared/public component.

## Starting prompt

```text
I want Product CRUD in catalog within the existing Core UI portal.
The PRD, API, permission matrix and design handoff are attached.
Use the SDCoreJS flow; preserve the current package alias/version, routes and shell.
Before coding, verify the approved spec/plan and frontend architecture.
```

This is an example prompt, not a passing transcript. Follow the [feature recipe](/docs/recipes/feature/) to understand each output and how AC connect to tests.

## Prototypes require explicit scope

The `technical-prototype` profile applies only when explicitly selected in the appropriate approved scope/current authorization. Demo-only assumptions are not production evidence. New portals remain template-first; existing portals extend their current shell.

Do not infer this profile from PO/BA roles, a "quick screen" request or missing backend. Do not fake authentication, seed data or successful states to conceal missing integration.

## Verify and hand off

Focused tests, UI behavior/accessibility checks, review/repair, documentation and traceability follow the scope. Record checks not run. Verification/convergence precede the final read-only branch-ready gate; Git actions need authorization.

Sources: [Angular skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/tracks/angular/sdcorejs-angular.md), [Core UI docs fetcher](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/angular/core-docs-fetch.mjs), [UI/UX reference index](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/design/uiux/index.md).
