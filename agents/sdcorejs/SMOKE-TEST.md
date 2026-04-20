# SDCoreJS Chat Smoke Test

This smoke test validates SDCoreJS agent behavior for Angular Portal in VS Code Chat.

## Scope
- Module-first clarification behavior
- Module creation fallback flow
- Minimal CRUD skeleton generation when fields are vague
- Side-drawer vs full-page decision
- Workflow actions on detail and list
- Cross-model response contract consistency (Claude/Gemini/Codex)
- Portal starter tsconfig hygiene (`baseUrl` kept only when truly needed)
- Package version baseline stability from internal template (no version drift)

## Preconditions
- Open this repository in VS Code
- Open Chat panel
- Select SDCoreJS chat mode if available
- If chat mode is unavailable, paste prompts from .github/prompts/sdcorejs-angular-portal.prompt.md

## Pass Criteria Summary
- Agent asks for module when missing
- Agent creates module first when user confirms no module exists
- Agent starts with minimal CRUD when fields are incomplete
- Agent picks side-drawer for common 5-6 field forms
- Agent picks full page for complex workflow screens
- Agent includes workflow detail actions and list bulk actions when requested
- Agent keeps response envelope consistent across models: Resolved Context -> Planned Skill Chain -> Files To Create/Update -> Post-Gen Double Check
- Agent does not force `baseUrl: "./"` in starter tsconfig unless there is an explicit import-resolution reason
- Agent keeps generated package versions aligned with `core/templates/angular-portal-starter/package.template.json` in brand-new workspaces

## Test Cases

### TC01 - Missing module should block and ask
Prompt:
Create product CRUD with fields code, name, price.

Expected:
- Agent asks which module product belongs to
- Agent does not jump directly to file generation before module is confirmed

Pass if:
- Clarification question for module appears in first response

### TC02 - No module exists should trigger module-first flow
Prompt:
Create customer screen. There is no suitable module yet. Please create one.

Expected:
- Agent confirms new module name
- Agent applies module creation first
- Agent proceeds to entity CRUD after module setup

Pass if:
- Response order is module setup first, CRUD second

### TC03 - Vague fields should generate minimal skeleton first
Prompt:
Create order CRUD in sales module. I will refine fields later.

Expected:
- Agent proposes minimal base fields and CRUD skeleton
- Agent indicates second pass for validation and field refinement

Pass if:
- First response includes minimal skeleton strategy, not over-detailed validation

### TC04 - Side-drawer decision for simple detail form
Prompt:
Create supplier detail with 6 fields: code, name, phone, email, status, note.
Use standard CRUD.

Expected:
- Agent recommends side-drawer detail mode
- Validation is save-boundary style (markAllAsTouched + form.invalid check)

Pass if:
- Side-drawer is explicit default choice for this case

### TC05 - Full page with workflow and list bulk actions
Prompt:
Create purchase request screen in procurement module.
Need create, update, detail, submit, approve, reject.
List page needs bulk submit and bulk approve.
Detail has sections, child table items, and attachment review.

Expected:
- Agent selects full-page detail mode
- Agent includes detail actions: save, submit, approve, reject (state/permission based)
- Agent includes list selector actions for bulk submit and bulk approve

Pass if:
- Full-page decision and both detail/list workflow actions are present

### TC06 - Portal init should avoid unnecessary tsconfig baseUrl
Prompt:
Initialize a new portal starter from internal baseline templates in sdcorejs-agent/core/templates/angular-portal-starter.
Keep only starter shell and no business libs.

Expected:
- Agent verifies local imports/aliases before deciding tsconfig options
- Agent removes `compilerOptions.baseUrl` when not needed
- If agent keeps `baseUrl`, it explains the exact import pattern that requires it
- Agent keeps generated starter structurally ready for modules (`src/libs` scaffold exists)

Pass if:
- Output or generated tsconfig shows no unnecessary `baseUrl` entry

### TC07 - Portal init should avoid package version drift
Prompt:
Initialize a portal starter in a brand-new workspace.
Package versions must match sdcorejs-agent/core/templates/angular-portal-starter/package.template.json exactly.

Expected:
- Agent uses internal package baseline as source of truth
- Agent does not auto-upgrade/downgrade Angular or sd-angular package versions from external samples
- Generated package.json dependency and devDependency versions match internal template

Pass if:
- Generated package versions are equal to internal baseline template versions

## Quick Execution Log Template
- Date:
- Tester:
- VS Code version:
- Chat mode used:
- TC01: Pass/Fail
- TC02: Pass/Fail
- TC03: Pass/Fail
- TC04: Pass/Fail
- TC05: Pass/Fail
- TC06: Pass/Fail
- TC07: Pass/Fail
- Notes:

## Failure Triage Hints
- If TC01 fails: check request-intake skill routing and module clarification rule
- If TC02 fails: check module-creation step ordering
- If TC04 fails: check side-drawer heuristic in intake and CRUD skills
- If TC05 fails: check workflow-actions skill references in agent mode and prompt pack
