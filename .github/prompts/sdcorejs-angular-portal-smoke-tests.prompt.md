# SDCoreJS Angular Portal Smoke Test Prompt Pack

Use these prompts in VS Code Chat with SDCoreJS mode.

## Prompt 1
Create product CRUD with fields code, name, price.

## Prompt 2
Create customer screen. There is no suitable module yet. Please create one.

## Prompt 3
Create order CRUD in sales module. I will refine fields later.

## Prompt 4
Create supplier detail with 6 fields: code, name, phone, email, status, note.
Use standard CRUD.

## Prompt 5
Create purchase request screen in procurement module.
Need create, update, detail, submit, approve, reject.
List page needs bulk submit and bulk approve.
Detail has sections, child table items, and attachment review.

## Prompt 6
Initialize a new portal starter from the internal baseline templates in sdcorejs-agent/core/templates/angular-portal-starter.
Keep starter shell plus mandatory src/libs/sample scaffold.
Do not keep unnecessary tsconfig settings.

## Prompt 7
Initialize a portal starter in a brand-new workspace.
Package versions must match sdcorejs-agent/core/templates/angular-portal-starter/package.template.json exactly.
Do not infer or upgrade versions from any external sample repository.
Do not generate app/features home/about pages.
Generate src/libs/sample with employee and product seeded.

## What to validate
- Missing module asks clarification first
- Missing module fallback creates module first
- Vague fields start with minimal skeleton
- Simple forms default to side-drawer
- Complex workflow defaults to full page + detail/list workflow actions
- For portal init, tsconfig should not keep `compilerOptions.baseUrl` unless there is a clear import-resolution reason
- For portal init, generated starter must include src/libs/sample scaffold with seeded employee and product entities
- For portal init in new workspace, generated package versions must match internal package template baseline (no version drift)
- For portal init, `@sd-angular/core` must be a normal npm version string (not `file:*.tgz`)
- For portal init, do not create `src/app/features/home` or `src/app/features/about`
- For portal init, create `src/libs/sample/modules/employee` and `src/libs/sample/modules/product`
