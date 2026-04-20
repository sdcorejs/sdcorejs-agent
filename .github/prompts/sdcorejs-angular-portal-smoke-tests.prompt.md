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
Initialize a new portal starter from portal-template.
Keep only starter shell and no business libs.
Do not keep unnecessary tsconfig settings.

## What to validate
- Missing module asks clarification first
- Missing module fallback creates module first
- Vague fields start with minimal skeleton
- Simple forms default to side-drawer
- Complex workflow defaults to full page + detail/list workflow actions
- For portal init, tsconfig should not keep `compilerOptions.baseUrl` unless there is a clear import-resolution reason
