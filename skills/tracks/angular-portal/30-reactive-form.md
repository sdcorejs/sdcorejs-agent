---
name: angular-portal-reactive-form
description: Use when refining a reactive form - adding validation rules, custom validators, conditional fields, async validators, cross-field rules. Assumes module + entity + base detail component already exist. Triggers - "form validation", "thêm validator", "form không hoạt động", "validate form", "custom validator", "async validator". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Angular Skill: Reactive Form with Validation

## 1. Skill Name
**Reactive Form Builder with Validation**

## 2. Description
Generates reactive forms with practical validation patterns for sdcorejs screens. Supports both lightweight model-binding forms and stricter typed validation when needed.

This skill is a refinement step after module and entity ownership have already been resolved.

## 3. Rules

### MUST DO ✅
- Apply this skill only after module and entity context are known
- Allow lightweight `new FormGroup({})` for common forms and incremental validation
- Define required validation at component level (`required`, `maxlength`, `min`, `max`, etc.) and enforce at save time
- Use strong typing with interfaces
- Apply validators based on field criticality; do not over-constrain on first pass
- Show validation feedback when needed (warning/mark touched at save)
- Mark all fields as touched before save attempt (`form.markAllAsTouched()`)
- Use `[form]="form"` with `[(model)]="entity.field"` as default binding pattern
- Implement custom validators for business rules only when rule is confirmed
- Provide visual feedback via notify + field state
- Use `[form]="form"` parameter on SDCore input components
- Support workflow submit/save paths with shared validation gate (`onSave`, `onSubmit`)
- Use grid layout `row row-sm` for form sections to keep vertical spacing compact and consistent
- Use Vietnamese labels/messages for Vietnamese portals (title, button, field label, notify)
- Use **signal-first** style for form screen UI state:
  - `entity`, `mode/state`, `loading`, `submitting`, tab flags -> `signal()`
  - derived flags/messages (`isDetail`, `canSubmit`, `pageTitle`) -> `computed()`
  - keep `FormGroup` for validation, but do not model mutable UI state as plain class fields
  - example:
    ```typescript
    readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
    readonly entity = signal<Partial<ProductSaveReq>>({});
    readonly pageTitle = computed(() => this.state() === 'CREATE' ? 'Tạo mới' : 'Chi tiết');
    ```
- Monitor signal invocation efficiency in templates:
  - If a signal is used **2 or more times** in the template, consider:
    - Extract to a `readonly #memoized = computed(() => ...)` to cache the value
    - OR use `@let` template syntax (where supported)
  - If a signal is used **only once**: invoke it directly, no optimization needed
  - Goal: reduce unnecessary getter invocations during change detection
- Generate runnable `*.spec.ts` for each form/detail component (not placeholder-only):
  - Mock required `inject()` dependencies (`Router`, `ActivatedRoute`, notify/loading/services)
  - Use `TestBed.overrideComponent` to isolate heavy template dependencies when needed
  - Ensure `fixture.detectChanges()` can run without DI/template errors
- Run tests right after generation and report status:
  - Preferred: `npm run test -- --watch=false --include=src/libs/[module]/features/[entity]/**/*.spec.ts`
  - Fallback: `npm run test -- --watch=false` when include filter is unavailable

### MUST NOT ❌
- Skip form validation before submission
- Hard-code error messages (use i18n for translations)
- Add form logic to components (delegate to FormService if complex)
- Over-design validation rules at `CREATE` stage when business rules are still incomplete
- Allow form submission while invalid
- Duplicate validation logic across save/submit/approve handlers
- Store mutable form-screen UI state in plain mutable fields/getters instead of signals
- Overuse signal invocations in template without considering the 2+ times rule

## 4. Templates

All literal code templates referenced by this skill live in [`_refs/templates/reactive-form-templates.md`](./_refs/templates/reactive-form-templates.md):

| Need | Section in templates ref |
|---|---|
| Shared `SdValidators` class (notBlank / phone / email / url / async uniqueValue) | [`#form-validatorts--shared-sdvalidators-class`](./_refs/templates/reactive-form-templates.md#form-validatorts--shared-sdvalidators-class) |
| Default lightweight detail component (`[form]` + `[(model)]`, validate at save) | [`#detailcomponentts--lightweight-model-binding-first`](./_refs/templates/reactive-form-templates.md#detailcomponentts--lightweight-model-binding-first) |
| Advanced detail component with `FormArray` for dynamic sub-records | [`#detail-advancedcomponentts--with-formarray-dynamic-fields`](./_refs/templates/reactive-form-templates.md#detail-advancedcomponentts--with-formarray-dynamic-fields) |
| Worked Product example (typed validators + per-field error messages) | [`#worked-example-product-entity`](./_refs/templates/reactive-form-templates.md#worked-example-product-entity) |

Start with the lightweight model-binding template by default. Reach for typed `FormBuilder` + `Validators` only when business rules need surfaced error messages or cross-field validation — see the worked Product example for the typed shape.

<!-- Code templates moved to _refs/templates/reactive-form-templates.md — see table above. -->
## 5. Example Input

```
Create a reactive form for "Product" entity with:
- Code (required, max 32 chars)
- Name (required, max 255 chars)
- Price (required, min 0, decimal)
- Category (required, dropdown)
- Description (optional, max 1000 chars)
- IsActivated (boolean)
- Validation errors shown only when field is touched
```

### Precondition Reminder

```text
Before using this skill, the agent must already know:
- module name
- entity name
- the fields that belong to the detail screen
```

### Validation Strategy Reminder

```text
Default strategy for common screens:
- start with lightweight model-binding + FormGroup({})
- validate at save boundary with form.invalid + markAllAsTouched
- add stricter typed validators in a second refinement pass when business rules are stable

For workflow-enabled screens:
- route `Lưu`, `Lưu & Gửi duyệt`, or similar actions through one validation gate
- keep approve/reject actions independent from field validation when they operate on existing data
```

---

## Implementation Checklist

- [ ] Define FormGroup structure in ngOnInit
- [ ] Apply appropriate validators to each field
- [ ] Handle form errors with proper validation state checks
- [ ] Show error messages only when field is touched
- [ ] Mark all fields as touched before submission
- [ ] Test form validation flows
- [ ] Implement custom validators if needed
- [ ] Test FormArray with dynamic controls (if applicable)
- [ ] Use patchValue for partial updates
- [ ] Use FormBuilder (not manual FormGroup creation)
