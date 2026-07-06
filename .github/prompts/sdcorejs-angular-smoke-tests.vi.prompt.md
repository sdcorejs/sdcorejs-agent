# SDCoreJS Angular Portal Localized-Intent Smoke Test Pack

This source file stays English-only. When using these cases at runtime, translate
the prompt text into the target language instead of hardcoding localized prose in
this repository.

Use these cases in VS Code Chat with SDCoreJS mode to validate localized intent
handling for Angular portal work.

## Prompt 1
Create product CRUD with fields code, name, price.

## Prompt 2
Create a customer screen. No suitable module exists yet, so create one first.

## Prompt 3
Create order CRUD in the sales module. Fields will be refined later.

## Prompt 4
Create supplier detail with 6 fields: code, name, phone, email, status, note.
Use standard CRUD.

## Prompt 5
Create a purchase request screen in the procurement module.
Need create, update, detail, submit, approve, and reject.
The list page needs bulk submit and bulk approve.
The detail page has sections, item child table, and attachment review.

## Prompt 6
Initialize a new portal starter from the Angular init refs and templates in
sdcorejs-agent/_refs/angular.
Keep the starter shell plus mandatory src/libs/sample scaffold.
Do not keep unnecessary tsconfig settings.

## Prompt 7
Initialize a portal starter in a brand-new workspace.
Package versions must match the package guidance in
sdcorejs-agent/_refs/angular/core-version.md and the Angular init refs.
Do not infer or upgrade versions from any external sample repository.
Do not use file:*.tgz dependencies for @sdcorejs/angular.
Support starter home page under src/app/pages/home and wire
LayoutConfiguration.homeUrl.
Generate src/libs/sample with employee and product seeded.

## What To Validate
- Missing module asks clarification first.
- Missing module fallback creates the module first.
- Vague fields start with a minimal skeleton.
- Simple forms default to side-drawer.
- Complex workflows default to full page plus detail/list workflow actions.
- Portal init tsconfig should not keep compilerOptions.baseUrl unless there is a clear import-resolution reason.
- Portal init includes src/libs/sample with seeded employee and product entities.
- Portal init in a new workspace keeps package versions aligned to the local baseline guidance.
- Portal init keeps @sdcorejs/angular as a normal npm version string, not file:*.tgz.
- Portal init supports a customizable home page through src/app/pages/home and LayoutConfiguration.homeUrl.
- Portal init creates src/libs/sample/modules/employee and src/libs/sample/modules/product.
