# `<sd-form-builder>` and `<sd-form-render>` (form-generic module)

**Type**: Components (two complementary)
**Selectors**: `sd-form-builder`, `sd-form-render`, `sd-feel-expression`
**Import path**: `@sd-angular/core/components/form-generic` (own entry point — currently commented out of the `components` barrel, so import from the full path)
**Classes**: `SdFormBuilder`, `SdFormRender`, `SdFeelExpression` (all `extends SdBaseSecureComponent`)
**Standalone**: yes
**Change detection**: `OnPush` (form-render); default (form-builder)
**Library version**: `@sd-angular/core@19.0.0-beta.105`

> **NOTE**: Despite the folder name `workflow`, this module does NOT render workflow-status timelines or transition badges. It is a **dynamic form schema system** — a designer (`<sd-form-builder>`) that produces an `SdFormGeneric` JSON, and a runtime renderer (`<sd-form-render>`) that materializes that JSON into a working Angular reactive form. For workflow status / actions UI, look elsewhere (skill `31-actions.md`) — that flow is implemented at the page level, not via this component.

## One-line purpose
Schema-driven dynamic forms — author once with `<sd-form-builder>` (drag-and-drop designer producing JSON), render anywhere with `<sd-form-render>` (binds the JSON to a runtime `FormGroup` with conditional visibility, validation, and FEEL expressions).

## When to use
- "Custom fields" / "Form designer" admin pages where end-users (or admins) configure new fields without code changes
- Workflow task forms whose layout differs per task definition (BPMN-style user task forms)
- Multi-tenant configurable forms (different tenants → different shapes)
- Anywhere the form layout is stored as JSON in the database and must render dynamically

## When NOT to use
- For static, hand-coded forms — use the regular `<sd-input>`/`<sd-select>`/etc. composition instead. Schema forms are heavier and slower to render.
- For workflow status visualization (badges, transitions, history) — this component does NOT do that
- For one-off forms with no need for runtime configurability
- When you need pixel-perfect custom layout — schema layout is grid-based (12 columns, optional mobile override) and not infinitely flexible

## Component 1: `<sd-form-builder>` (designer)

Drag-and-drop form designer. Outputs an `SdFormGeneric` schema (components, variables, validations).

### Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `formGeneric` | `SdFormGeneric` | `{}` | The schema to load. Internally **deep-cloned** via `JSON.parse(JSON.stringify(...))` so editing does not mutate the input reference. |

> Both `components` and `variables` were exposed as separate `@Input` historically — they have been folded into `formGeneric` (commented-out in source).

### What it produces
The component holds three internal arrays mirroring `SdFormGeneric`:
- `components` — the component tree (rows of `SdFormGenericComponent | SdFormGenericGroup`)
- `variables` — `SdFormGenericVariable[]` for FEEL expressions
- `validations` — `SdFormGenericValidation[]` for cross-field validation

Read these via `@ViewChild(SdFormBuilder)` and persist via your own save action (no `(formGenericChange)` output is exported in this version).

### Internal popups (template refs)
- `popupViewJSON` — `<sd-modal>` to view the raw JSON
- `popupConfigureVariables` — `<sd-modal>` to manage variables
- `formRender` — embedded `<sd-form-render>` used as live preview

### Supported component types (the building blocks)
`textfield`, `textarea`, `chip-string`, `chip-calendar`, `number`, `select`, `datetime`, `radio`, `checkbox`, `html`, `upload`, `table`. Each type has a paired `*-control` (runtime renderer) and `*-attribute` (designer property panel).

## Component 2: `<sd-form-render>` (runtime)

Renders an `SdFormRenderConfiguration` against a `FormGroup` and an `entity`.

### Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `form` | `FormGroup` | `new FormGroup({})` | The `FormGroup` to populate. Each component registers a `FormControl` under its `key`. |
| `configuration` | `SdFormRenderConfiguration` (REQUIRED) | — | `{ components, validations?, variables?, beforeSubmit?, onLoaded? }`. Components are auto-formatted (id/key/layout defaults filled in) on assignment. |
| `entity` | `Record<string, any>` | `{}` | Initial values keyed by component `key`. Also exposed as `sdRaw` control on the form. |
| `defaultEntity` | `Record<string, any>` | `{}` | Defaults applied when `entity[key]` is `undefined`. |
| `properties` | `string[]` | `[]` | Component keys whose `properties` panel is enabled (advanced). |
| `viewed` | `boolean \| ''` | `false` | When `true`, all child controls switch to read-only mode. Bare attribute = `true`. |

### What it does on load
1. Auto-fills each component with `id` (random), `key` (random), `validate: {}`, and `layout: { columns: '12' }` if missing.
2. Subscribes to `entity` + `configuration` changes; debounces and re-renders.
3. Calls `configuration.onLoaded?.()` after first successful render.
4. Adds an `sdRaw` `FormControl` to the form holding a clone of `entity` (for FEEL expressions to reference original values).

### Public reference
```ts
@ViewChild(SdFormRender) formRender!: SdFormRender;
formRender.formRenderItems  // QueryList<LibItemComponent> — each rendered field
```

## Component 3: `<sd-feel-expression>` (helper)

A modal-based expression editor (FEEL — Friendly Enough Expression Language) used inside `<sd-form-builder>` to compose `when` / `validation` expressions referencing other components and variables. Rarely used standalone.

### Inputs
| Name | Type | Notes |
| --- | --- | --- |
| `components` | `(SdFormGenericComponent \| SdFormGenericGroup)[]` (REQUIRED) | The component tree to draw attribute names from. |
| `expression` | `SdFormGenericExpression \| undefined` (REQUIRED) | Two-way bound via `(expressionChange)`. |
| `model` | `string \| undefined` (REQUIRED) | Two-way bound textual representation via `(modelChange)`. |

### Outputs
| Name | Type |
| --- | --- |
| `expressionChange` | `SdFormGenericExpression` |
| `modelChange` | `string` |
| `sdChange` | `{ model?, expression? }` |

## Schema overview (`SdFormGeneric`)
```ts
interface SdFormGeneric {
  components?: (SdFormGenericComponent | SdFormGenericGroup)[]; // ordered, supports nested groups
  variables?:  SdFormGenericVariable[];                         // for FEEL expressions
  validations?: SdFormGenericValidation[];                      // cross-field rules
}

interface SdFormGenericComponent {
  id: string;
  key: string;                  // becomes the FormControl name
  type: 'textfield' | 'textarea' | 'chip-string' | 'chip-calendar'
      | 'number' | 'select' | 'datetime' | 'radio' | 'checkbox'
      | 'html' | 'upload' | 'table';
  label: string;
  layout: { row?: string; columns: 1..12; mobileColumns?: 1..12 };
  validate?: { required?, min?, max?, pattern?, … };
  properties?: Record<string, any>;
  when?: SdFormGenericExpression; // visibility expression (FEEL)
  // type-specific definition fields…
}
```

## Visual cues (helps agent map screenshots → component)
- **`<sd-form-builder>`**: 3-pane layout — left palette of component types (icons + label, drag source), center drop canvas (12-col grid, dashed drop indicators), right properties panel (label, key, validate, layout, conditional visibility). Toolbar with "View JSON", "Configure variables", "Preview" toggle.
- **`<sd-form-render>`**: indistinguishable from a hand-coded form — rows of standard SDCoreJS form fields (input/select/datetime/upload/table) laid out in a 12-column grid. In `[viewed]="true"` mode, all fields render their read-only style (label + value text) like `<sd-view>`.
- **`<sd-feel-expression>`**: opens a modal with a condition tree (combinator `&&` / `||` rows) and "add condition" button. Each row = LHS variable picker + operator dropdown + RHS value input.

## Configuration provider
```ts
provide: SD_FORM_GENERIC_CONFIGURATION,
useValue: { /* ISdFormGenericConfiguration — see form-generic.configuration.ts */ }
```
Required for `<sd-form-render>` (injected via `@Inject(SD_FORM_GENERIC_CONFIGURATION)`).

## Permission gating
All three classes extend `SdBaseSecureComponent`. Inherits its permission scaffolding but no per-component permission inputs. Wrap with `*sdPermission` at the host if needed.

## Examples

### 1. Render a saved form schema with prefilled entity
```html
<sd-form-render
  [form]="form"
  [configuration]="formConfig"
  [entity]="initialEntity"
  [defaultEntity]="defaults">
</sd-form-render>

<sd-button title="Lưu" (click)="onSave()" type="fill" color="primary"></sd-button>
```
```ts
formConfig: SdFormRenderConfiguration = {
  components: this.savedSchema.components,
  validations: this.savedSchema.validations,
  variables: this.savedSchema.variables,
  onLoaded: () => console.log('form ready'),
};
form = new FormGroup({});
initialEntity = { fullName: 'Nguyễn Văn A', dob: '1990-01-01' };
```

### 2. Read-only mode for a detail/view page
```html
<sd-form-render
  [form]="form"
  [configuration]="formConfig"
  [entity]="record"
  viewed>
</sd-form-render>
```

### 3. Form designer page (admin)
```html
<sd-form-builder #builder [formGeneric]="schema"></sd-form-builder>

<sd-button title="Lưu cấu hình" type="fill" color="primary" (click)="onSaveSchema()"></sd-button>
```
```ts
@ViewChild(SdFormBuilder) builder!: SdFormBuilder;

onSaveSchema = () => {
  const payload: SdFormGeneric = {
    components:  this.builder.components,
    variables:   this.builder.variables,
    validations: this.builder.validations,
  };
  this.api.saveFormSchema(payload);
};
```

### 4. Use the embedded preview button on the builder
The builder already includes a live `<sd-form-render>` toggle (`isPreview`). Use the toolbar inside the builder UI rather than mounting a second renderer.

## Anti-patterns
- ❌ Treating this as a "workflow timeline" component — it is a form schema system. Workflow status/actions belong to a different page-level pattern.
- ❌ Mutating `[formGeneric]` directly after passing it in — the builder deep-clones on assignment, so changes to your reference will NOT reflect.
- ❌ Reusing the same `[form]` instance across two `<sd-form-render>` mounted simultaneously — the second will register controls on top of the first.
- ❌ Forgetting to provide `SD_FORM_GENERIC_CONFIGURATION` — `<sd-form-render>` constructor will throw at runtime.
- ❌ Hand-editing component `id`/`key` after first render — they are auto-generated random ids; changing them mid-life detaches the FormControl.
- ❌ Storing the schema as a class property AND passing the same reference back to the builder after each save — you lose the deep-clone safety net. Persist a copy to the server.

## Related
- `SdFormGeneric`, `SdFormGenericComponent`, `SdFormGenericGroup`, `SdFormGenericVariable`, `SdFormGenericValidation`, `SdFormGenericExpression` — schema models
- `SdFormRenderConfiguration` — runtime renderer input shape
- `SD_FORM_GENERIC_CONFIGURATION` — required injection token for the renderer
- `<sd-modal>` — used by the builder popups (view JSON, configure variables) and by `<sd-feel-expression>`
- `<sd-table>`, `<sd-upload-file>`, `<sd-input>`, `<sd-select>`, `<sd-textarea>`, etc. — primitive controls that the runtime renderer composes
- Skill ref `31-actions.md` — for the orthogonal "workflow actions / status" UX pattern at the page level
