# Angular Portal — Architecture Principles

Source of truth for **WHY** SDCoreJS Angular portals look the way they do. Loaded on demand by `sdcorejs-brainstorm`, `sdcorejs-write-spec`, `sdcorejs-clarify-requirements`, `11-init-module`, `12-init-entity`, and `sdcorejs-review`.

If a generated file contradicts a principle here, that file is wrong. If a principle here contradicts a real-world need, **the principle is wrong** — surface it as feedback, don't silently break it.

---

## 1. Feature-first folder structure

```
src/
├── app/                          ← thin shell only
│   ├── app.routes.ts             ← top-level routes (lazy-load modules)
│   ├── app.component.{ts,html}
│   └── main.ts                   ← bootstrap + root configurations
└── libs/
    └── <module>/                 ← feature module (catalog, sales, hr, …)
        ├── <module>.configuration.ts
        ├── <module>.module.ts    ← static providers
        ├── routes.ts             ← lazy-load children
        ├── guards/<module>.guard.ts
        ├── configurations/
        └── features/
            └── <entity>/         ← one entity vertical slice
                ├── <entity>.routes.ts
                ├── pages/list/   ← list.component.ts + .html + .spec.ts
                ├── pages/detail/ ← detail.component.ts (or side-drawer)
                ├── components/   ← entity-internal components (e.g. <entity>-select)
                └── services/
                    ├── <entity>.model.ts
                    ├── <entity>.mock-data.ts
                    ├── <entity>.service.ts
                    └── index.ts
```

**Why feature-first**: when you delete a feature, you delete one folder. When you find a bug in `product`, you grep one folder. Modules-by-type (`controllers/`, `services/`, `views/`) scatter related code across the tree.

---

## 2. Module = bounded context

Each `libs/<module>/` is an **encapsulated bounded context**:

- Own configuration token, providers, guards, interceptors
- Own permission code prefix (`<MODULE>_*`)
- Own routes lazy-loaded at the app level
- Own upload-file configuration if relevant

A new module is justified when ≥1 of: distinct user persona, distinct permission boundary, distinct data lifecycle, distinct deployment surface. **Not** when there are "many entities" — those go into ONE module if they share a context.

**Rule of thumb**: if two entities never appear together on the same screen and never share a service method, they probably belong to different modules.

---

## 3. No cross-module imports (the killer rule)

Module A **MUST NOT** import from Module B directly. Both modules import from:

- `@sdcorejs/angular` — Core UI components, base classes, shared utilities
- `src/shared/` (if it exists) — cross-cutting types, interceptors, app-wide guards

If `module-a` needs data from `module-b`, the contract goes through `@sdcorejs/angular` (a base `<Entity>Service` extension) OR through a shared service registered at app root.

**Why**: cross-module imports = the death spiral. Module A imports Module B's component → B starts shipping in A's lazy chunk → A's bundle bloats → A can't be code-split → CI build time doubles → no one notices until production. Plus: refactoring B breaks A silently.

**Enforce by**: `eslint-plugin-boundaries` rules (config in target project), and `sdcorejs-review` flags violations as **Critical**.

---

## 4. UI components are dumb; services own logic

Component responsibilities:
- Wire user input → service method calls
- Display state via signals/computed
- Navigate via `inject(Router)`

Service responsibilities:
- Fetch / mutate data (mock or API)
- Business rules (validation, transitions, derived data)
- Caching / state coordination

**Anti-pattern**: `<button (click)="if (item.status==='DRAFT' && hasPermission('APPROVE')) updateStatus(item, 'APPROVED')">`. Move the condition + transition to `service.approve(item)`.

If a method on a service is >50 lines, split it. If a component method is >15 lines, push to service.

---

## 5. Signal-first state, RxJS only at boundaries

Default state primitive:
- `signal<T>(initial)` for mutable UI state (loading flags, current entity, table options, dialog open/close, selection)
- `computed(() => derive(...))` for derived state (button visibility, header title, isDirty, hasError)
- `effect(() => ...)` only for true side-effects (reload data on route param change, sync URL with filter state)

Use RxJS at **boundaries** only:
- HTTP via `HttpClient` (returns Observable; convert to signal in service)
- Form valueChanges (sometimes signal-incompatible; OK to subscribe + manage)
- 3rd-party libs that ship Observable APIs

**Why**: signals are change-detection-friendly (OnPush works automatically), readable in templates (`{{ entity().name }}`), and free of subscription leaks. RxJS is powerful but easy to abuse.

**Migration rule**: when refactoring legacy code, convert `BehaviorSubject` → `signal`, `combineLatest` → `computed`, `subscribe` → `effect` (or stream-end via `takeUntilDestroyed`).

---

## 6. `inject()`, not constructor DI

```ts
// ✅ correct
export class ProductListComponent {
  readonly #router = inject(Router);
  readonly #svc = inject(ProductService);
}

// ❌ legacy — do not generate
constructor(private router: Router, private svc: ProductService) {}
```

**Why**: `inject()` works in functional contexts (guards, interceptors, route resolvers), removes constructor noise, and pairs with `#private` fields for true encapsulation. `sdcorejs-review` flags `constructor(private … )` as Critical.

---

## 7. `ChangeDetectionStrategy.OnPush` by default

Every generated component declares `changeDetection: ChangeDetectionStrategy.OnPush`. State changes flow through signals → OnPush is "free" (no `markForCheck` needed for signal reads).

When you have async state update **before** assigning to a non-signal field, either:
- Migrate the field to `signal()` (preferred), OR
- Inject `ChangeDetectorRef` and call `#cdr.markForCheck()` after assignment.

**Why OnPush is the default**: a portal with 50+ components on a page can have 1000+ change-detection cycles per click in default mode. OnPush brings it down to "only what touched a signal".

---

## 8. Mock-first services until backend contract is explicit

```ts
@Injectable({ providedIn: 'root' })
export class ProductService extends MockCrudStore<ProductDTO, ProductSaveReq> {
  constructor() { super('product', PRODUCT_SEED); }
}
```

- Default: `MockCrudStore` via `localStorage`, seeded with 20-40 domain-realistic rows
- Switch to `BaseService.register('<entity>')` only when backend API contract is provided

**Why**: frontend can ship + iterate without a backend. Mock rows must be **domain-realistic** (`"Bột mì Đại Phong 5kg"` not `"Name 1"`) — bad seed data hides UX issues (column too narrow for real names, sort key collisions).

---

## 9. Four canonical detail layouts (no inventing new ones)

| Layout | When | Component shell |
|---|---|---|
| **side-drawer** | ≤6 fields, 1 section, no workflow, quick CRUD | `components/<entity>-side-drawer/` |
| **UnifiedCompact** | medium form, mixed user skill, same layout for CREATE/UPDATE/DETAIL | `pages/detail/` |
| **UnifiedSplit** | title context always visible (left), form right | `pages/detail/` |
| **AdaptiveSplitDetail** | workflow heavy, multi-section, DETAIL uses read-only blocks via `sd-section-item` | `pages/detail/` |

**Why constrain to 4**: layout consistency across modules is more important than perfect per-screen UX. A user opening a new screen recognizes the pattern in 2 seconds. Custom layouts = retraining cost per screen.

If a screen genuinely doesn't fit, mark it `// CUSTOM_LAYOUT: <reason>` in the component header and flag for design review — don't silently invent a 5th variant.

---

## 10. Permission codes are route-data, not component-logic

```ts
{
  path: 'product',
  loadChildren: () => import('./product.routes').then(m => m.routes),
  data: { permission: 'CRM_PRODUCT_LIST' }
}
```

The **module-level guard** reads `data.permission` and blocks navigation. Components **never** call `permission.check('CRM_PRODUCT_LIST')` themselves for route-level access (that's duplication; the guard already did it).

**Component-level permission** only for in-screen buttons:
```html
<sd-button *sdHasPermission="'CRM_PRODUCT_APPROVE'">Phê duyệt</sd-button>
```

Code naming: `<MODULE>_<ENTITY>_<ACTION>` UPPERCASE. Module → Entity → Action order, never the reverse. Project may use `<MODULE>_C_<ENTITY>_<ACTION>` if `_C_` is the established convention — **detect from existing code, don't impose**.

---

## 11. Audit columns on every primary list

Every list of top-level entities ends with 4 columns:
- `createdAt` (datetime, 180px)
- `createdBy` (string, min 180px)
- `updatedAt` (datetime, 180px)
- `updatedBy` (string, min 180px)

**Skip only** for: sub-tables on detail pages, lookup/enum tables (code+name only), dialog/drawer compact tables, or user-explicit "no audit needed".

**Why**: backoffice users debug data quality by audit fields. Without them, every "this data is wrong" investigation requires a backend log dig.

Field names vary per backend framework (`createdAt` vs `CreatedDate` vs `created_at`). **Always check the actual DTO** — never assume.

---

## 12. Bilingual: VI is first-class, English is structural

Vietnamese portal (default for SDCoreJS):
- Labels, headers, button text, validation messages → **VI with full diacritics** (`"Phê duyệt"` not `"Phe duyet"`)
- Permission codes, route paths, file names, code identifiers → **English** always

Future bilingual support (VI + EN): keep labels in i18n JSON, default to VI, structure-ready for `next-intl`-style switching. Do NOT machine-translate.

**Why**: VI-only users can't trust English. EN-only stakeholders need structure-ready code. Permission codes in English avoid encoding pitfalls when codes flow through middleware / Kafka / logs.

---

## 13. Standalone-first; hybrid mode supported

New code → **standalone components** with `imports: [...]` on each.

Hybrid NgModule + standalone (legacy portal migration): supported but flagged. `sdcorejs-clarify-requirements` asks "architecture mode: standalone-first or hybrid?" when generation could go either way.

**Why**: Angular's direction is standalone. NgModules add a layer of indirection (declarations / exports / imports) that's purely ceremonial when you have standalone.

---

## 14. Core UI first; custom UI is a flagged exception

Order of preference when picking a UI primitive:
1. `@sdcorejs/angular` component fits → use it
2. Composition of Core UI components fits → use them
3. No Core UI fit → generate custom with explicit marker:
   ```ts
   // CUSTOM_UI: <reason — what Core UI lacks>
   ```
   Render placeholder block, wire actions to `alert('TODO: <EventName>')`, and surface in generation summary.

**Why**: Core UI ships consistent a11y, theming, RTL support, and behavior. Custom UI re-litigates these per-component, badly. The flagged exception forces the conversation: "should Core UI grow this primitive?"

Run `node _refs/angular/core-docs-fetch.mjs --list` for the full inventory (on-demand; docs not committed).

---

## 15. Tests live with the code they test

`product.service.ts` ↔ `product.service.spec.ts` (same folder).
`list.component.ts` ↔ `list.component.spec.ts` (same folder).

No central `__tests__/` directory; no parallel `tests/` tree.

**Why**: when you delete a feature folder, the tests die with it (correct). When you rename a service, your IDE renames the spec next to it (correct). When a reviewer reads a service, the spec is one tab over (correct).

Test coverage levels (`minimal` / `standard` / `full`) confirmed in `sdcorejs-clarify-requirements`. Coverage approach (`post-hoc` vs `TDD`) also confirmed there — TDD shifts test bones BEFORE business logic implementation.

---

## 16. The portal is not the agent

This skill set generates Angular portals. The principles above govern the **generated code**, not this `sdcorejs-agent` repo. When a developer asks "why does the generated module have X", the answer comes from this file — not from the skill body that emitted X.

When a principle here changes, propagate to:
- The skill that generates it (e.g. `11-init-module.md`, `12-init-entity.md`)
- The reviewer that enforces it (`sdcorejs-review.md`)
- The auto-docs template if it touches the dimension being changed

---

## Anti-principles (NOT to do)

- ❌ "Move fast, refactor later" — refactoring cross-module imports later costs 10× more than getting them right now
- ❌ "Add a new layout because this screen is special" — there are only 4 layouts; if your screen doesn't fit, you're solving the wrong problem
- ❌ "Skip OnPush for this one component" — once one component opts out, the change-detection cost cascades unpredictably
- ❌ "Use a BehaviorSubject because the team knows RxJS" — signal is the new default; RxJS knowledge transfers, signal-knowledge doesn't yet, fix the gap, not the architecture
- ❌ "Hardcode permission check in component" — route guard owns access; component owns action-button visibility (different concerns)
- ❌ "Mock data: `Name 1`, `Name 2`, …" — bad mock data hides real UX bugs; spend the 10 minutes to write domain-realistic rows
- ❌ "Skip audit columns on this list because we're in a hurry" — they cost 4 lines of code and save hours of debugging

---

## Related references

- `_refs/angular/core-version.md` — pinned `@sdcorejs/angular` version
- Core UI components inventory — `node _refs/angular/core-docs-fetch.mjs --list` (on-demand; docs not committed)
- `_refs/angular/entity-field-types.md` — field-type → form-control mapping
- `_refs/angular/templates/entity-skeleton.md` — canonical code templates these principles produce
- `_refs/angular/templates/example-product.md` — worked example end-to-end
- `skills/orchestration/comment-code.md` — when/how to document WHY these principles applied in a specific decision
