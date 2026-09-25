# Angular Finishing Output

Read this reference after the code is written and before the finish gate. It
owns the Core UI usage summary format and the validation checklist. The finish
gate itself stays in `sdcorejs-angular` and resolves through
`completeAngularExecution`.

## Core UI usage summary

Right after the code is written and BEFORE the finish gate, emit a short table of every `@sdcorejs/angular` Core UI piece the feature actually uses — component, service, or directive — each with a one-line purpose **tied to this feature**, in the user's language. This gives the team a concise overview of the building blocks. Build the rows from what you ACTUALLY imported/used — never list a component you didn't use, never describe it generically.

```text
Core UI used in <feature name>:

| Core UI | Role in this feature |
|---|---|
| `SdTable` | Shows the <entity> list with pagination, filtering, and sorting |
| `SdNotifyService` | Shows success/error feedback when saving or deleting |
| `SdSection` | Groups fields on the detail screen |
| `sd-button` | Renders save, cancel, and action buttons |
```

Keep each purpose one line, concrete to the feature (not "a table component"). Use plain wording when the communication persona requests it. The same table is persisted into the module's user guide at the write-user-guide step.

- After generating UI, show the **Core UI usage summary** table (every `@sdcorejs/angular` component/service/directive actually used + a one-line, feature-specific purpose, in the user's language) so the user sees the building blocks at a glance. List only what was used. Persist the same table into the module user guide at write-user-guide.

## Validation Checklist

Before returning generated code:

✅ Mock API/OpenAPI/Postman/cURL input has a mock API contract mapping before implementation
✅ Any technical prototype has explicit opt-in, approved assumptions, a Technical Prototype Plan, clear not-production status, mock/live service decision, and approved owner/scope
✅ Any technical prototype used its approved template baseline; no parallel custom shell was created

✅ Each production file (model / service / list / detail) has a corresponding `.spec.ts` written RED before the file was created
✅ UI-affecting image/PRD/feature input has SDCoreJS Core reuse analysis and the matching decomposition/mapping before implementation
✅ Every generated component imports and declares `changeDetection: ChangeDetectionStrategy.OnPush`
✅ Templates bind only precomputed state (`signal`, `computed`, pure pipe, view model); no method/getter calls for displayed/derived values
✅ Service public models match the Service/mapper contract, with raw API-only fields isolated behind mapper/internal types
✅ UI-only fields live in component ViewModels/signals unless the Service explicitly derives and guarantees them
✅ All imports are correct (no circular dependencies)
✅ All fields from EntitySchema are included
✅ Field-role analysis was applied before rendering detail/side-drawer UI; business identifiers are locked on UPDATE after any whole-form enable and mapped safely in update payloads
✅ Simple DETAIL/side-drawer views use Core UI-first compact read-only facts, promote useful business identifiers, show status with existing status UI, and avoid duplicate promoted fields in the body
✅ Existing related models/services were scanned and reused or minimally extended before any new contract was created
✅ `@sdcorejs/utils` was checked before writing helper/formatter/validator/mapper/pipe utility code
✅ No duplicate model/service/type exists for the same domain entity
✅ Relationship fields use imported existing types or `<entity>Id` instead of unnecessary inline object shapes
✅ Parent detail-scoped child CRUD, when present, uses child-entity permissions, modal/drawer create/edit/view flows, parent-id prefill/lock, child collection refresh after success, and preserves the parent DETAIL route plus active tab/section
✅ Form validation matches field requirements
✅ Mock data exists only when `seed-data` is explicitly approved for a technical prototype
✅ Approved seed rows use realistic domain values and contain no secrets or personal data
✅ Mock-store wiring exists only inside the approved demo-only boundary
✅ Component decorators (@SdTabComponent) are present
✅ State management (CREATE/UPDATE/DETAIL) works correctly
✅ DETAIL route handles stale entity IDs by recovering to list instead of rendering blank fields
✅ Routes are lazy-loaded
✅ Column visibility matches schema
✅ Error handling is comprehensive
✅ TypeScript strict mode compliance
✅ No hardcoded values (use constants from schema)
✅ Naming conventions consistent throughout
✅ Comments explain complex logic
✅ UI-affecting changes have a UI check summary, with browser/preview verification claimed only when it actually ran
