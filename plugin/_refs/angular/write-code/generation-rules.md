# Angular Cross-Cutting Generation Rules

Read this reference before an eligible Core UI Angular executor writes files.
Apply it together with the per-file reference selected by the dispatch table.

## Contents

- [Files And Naming](#files-and-naming)
- [Reuse And Strict TypeScript](#reuse-and-strict-typescript)
- [Change Detection And Templates](#change-detection-and-templates)
- [Service And View-Model Boundaries](#service-and-view-model-boundaries)
- [Forms And Child CRUD](#forms-and-child-crud)
- [Errors And Documentation](#errors-and-documentation)

## Files And Naming

Detect and follow the target project structure. Use this only as a greenfield
Core UI fallback, adding optional folders solely for approved responsibilities:

```text
src/libs/{{ module }}/features/{{ entityKebab }}/
  services/
    {{ entityKebab }}.model.ts
    {{ entityKebab }}.mock-data.ts
    {{ entityKebab }}.service.ts
    index.ts
  pages/
    list/list.component.ts
    detail/detail.component.ts
  components/
    {{ cohesive-region }}/
      {{ cohesive-region }}.component.ts
      {{ cohesive-region }}.component.spec.ts
  {{ entityKebab }}.routes.ts
```

Use kebab-case for `entity`, PascalCase for `entityPascal`, camelCase for
`entityCamel`, and CONSTANT_CASE for `entityConstant`. Apply these forms
consistently to services, injection fields, DTO/SaveReq types, selectors, and
routes.

## Reuse And Strict TypeScript

- Search related models, DTOs, summary types, options, services, stores,
  repositories, and clients before creating contracts.
- Prefer reuse or minimal compatible extension. Check consumers before changing
  a shared contract.
- Never inline a full related object when an existing type is available.
- Create a new contract only after the reuse search proves none fits.
- Avoid `any`; use typed generics and proper `@ViewChild` types.
- Use non-null assertions only when guaranteed.
- Inject services with `readonly #service = inject(...)`.

## Change Detection And Templates

- Generate components with
  `changeDetection: ChangeDetectionStrategy.OnPush`.
- Use `signal()` for mutable state and `computed()` for derived display,
  permission, title, color, disabled, count, label, and visibility state.
- Do not call methods/getters from interpolation or property/class/style/
  structural bindings to calculate displayed values.
- Allow event handlers, signal reads, and pure pipes. Use `@let` or a computed
  value when a signal is read repeatedly.

## Service And View-Model Boundaries

- Treat `SaveReq`, `CreateReq`, `UpdateReq`, `DTO`, `ListRes`, and `DetailRes`
  as Service/Component contracts rather than forced copies of raw API payloads.
- Map, normalize, derive, rename, or omit fields at the service boundary, and
  define internal raw response types when shapes differ.
- Do not add UI-only fields such as `checked`, `selected`, `expanded`,
  `displayName`, `color`, or `icon` to Service DTOs.
- Put UI-only fields in a local ViewModel, signal, or a documented Service
  mapper output.
- Label ambiguous fields as BE API, Service input/output, Component ViewModel,
  or UI state.

## Forms And Child CRUD

- Use built-in required, length, numeric, and pattern validators; use custom
  validators only for domain rules.
- Keep independent child CRUD inside the parent DETAIL screen and use a modal
  or side drawer rather than separate child routes.
- Hide independent child actions in parent CREATE/UPDATE.
- Pass, prefill, and lock the current parent id in the child form.
- Refresh only the child collection after success and preserve the parent route
  plus active tab/section.
- Gate actions with child permissions.
- Use `FormArray` only when child rows are saved in the same parent payload.

## Errors And Documentation

- Wrap service calls in appropriate error handling.
- Pair `SdLoadingService.show()` and `hide()` around async work.
- Use `SdNotifyService` for user feedback.
- Handle cancel/back and failed-save state restoration.
- Apply `sdcorejs-documentation (code-documentation mode)` automatically to
  public contracts and complex logic.
- Keep comments concise, current, and focused on non-obvious behavior.
