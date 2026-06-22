# Review-Code Knowledge — Angular Portal

> Track-specific knowledge loaded on demand by the `sdcorejs-review` skill
> when the project architecture is detected as an Angular portal (`angular.json`
> + `@sdcorejs/angular`). Not a dispatchable skill — has no frontmatter.
> The **output format** is owned by the parent skill; this
> file only supplies *what to check*. The scored deep-review mode (below) is an
> Angular-specific alternate output.

## What this covers
Audit generated or modified Angular portal code against SDCoreJS Core UI
conventions. Read-only — surfaces violations the human reviewer should fix.

## Review checklist

For every file under review, check the following.

### Mandatory Angular code-review checklist
Run these checks in addition to the SDCoreJS portal checks below. Report results through the parent skill's Angular/NestJS code-review table mode with `STT`, `Severity`, `Nhóm`, `File/Dòng`, `Vấn đề`, `Rủi ro`, `Đề xuất fix`, and `Gate`.

#### Naming & file structure
- Check file names follow Angular/project convention: `a-b-c.<type>.<ext>`.
- Prefer kebab-case name parts, for example `user-profile.component.ts`, `user-profile.component.html`, `user-profile.component.scss`, `user-profile.component.spec.ts`, `user-profile.service.ts`, `user-profile.model.ts`.
- Accept project-specific types such as `component`, `service`, `model`, `directive`, `pipe`, `guard`, `resolver`, `interceptor`, `store`, `effect`, `facade`, or another documented project convention.
- Accept project-valid extensions such as `ts`, `html`, `scss`, `spec.ts`, or another legitimate project extension.
- Flag naming as `Low`, or `Medium` when it breaks routing/import/test discovery conventions.

#### Angular standalone imports
- For standalone components/directives/pipes, check the `imports` array against the template and class usage.
- Flag unused module/component/directive/pipe imports unless a nearby comment explains why the import must stay.
- Treat unused standalone imports as `Medium` when they create CI/build/lint warnings or unnecessary template scope growth; otherwise `Low`.
- Prefer removing the unused import while preserving required template dependencies.

#### Type safety: `any`
- Check every `any`, including explicit annotations, generic parameters, casts, callbacks, and DTO/service boundaries.
- Flag `any` without a clear comment explaining why the exact type cannot be used, the risk boundary, and when/how it can be narrowed.
- Prefer replacing `any` with an interface, type alias, generic, discriminated union, `unknown` plus narrowing, or a project DTO/view model.
- If `any` is unavoidable, require a short reasoned comment such as:
  - `// TODO(type): API payload is inconsistent across versions; narrow this after BE contract is finalized.`
  - `// intentional any: third-party library type is incorrect for this callback payload.`
- Classify unreasoned `any` as `Medium`, or `High` when it sits in business logic, persistence, security, payment, permission, or data-contract code.

#### Type assertions / casting
- Check `as any`, `as unknown as ...`, circular casts that bypass type safety, angle-bracket casts, and non-null assertions (`!`).
- Flag assertions without a nearby comment explaining why the cast/non-null assumption is safe.
- Recommend type guards, schema validation, explicit interfaces, optional chaining, null checks, control-flow narrowing, or refactoring the source type instead of casting.
- Classify risky casts as `Medium`, or `High` when they can cause likely runtime/data-integrity failure.

#### Core UI `autoId`
- When Core UI components/elements are used, verify every interactive/testable element that requires `autoId` receives one.
- Check `autoId` is meaningful, stable, traceable, kebab-case, and reflects domain/screen/action/element, for example `user-profile-save-button`, `order-filter-status-select`, `payment-method-card-input`.
- Flag missing, empty, vague, duplicated, or unstable IDs such as `button1`, `test`, `abc`, or IDs generated from an index when a list can reorder.
- Suggest concrete replacement `autoId` values whenever the domain/screen/action can be inferred.
- Classify missing/weak `autoId` as `Medium` for important controls used by E2E/analytics/accessibility tracking; otherwise `Low`.

#### Component member declaration & encapsulation
- Check component/service/directive/pipe members for correct visibility and scope.
- Members used only inside the class should be `private` or `protected` as appropriate; members used from templates must not be `private`.
- Remove unused members, or require a comment when a deliberately unused member is kept for a known future hook or integration.
- Flag state or constants with too-wide scope: local-only variables should live inside the method, module-level mutable state needs a clear reason, and component mutable state should be derived with `computed`, `signal`, or observable composition when possible.
- Classify as `Low`, or `Medium` when wide mutable state or unused members make behavior harder to reason about.

#### Component size & responsibility
- Check whether a component owns too many responsibilities: fetching data, complex transforms, business validation, multiple forms/state/modal/table/filter concerns, permission handling, side effects, many large UI sections, or unrelated view logic.
- Components should focus on view orchestration. Move complex/business logic to services, facades, stores, pure utilities, child components, directives/pipes, form builders/helpers, or mappers/view models.
- Do not use line count as a hard rule, but treat components above roughly 300-400 TypeScript lines or very long/complex templates as candidates for closer split analysis.
- Flag scattered state flags such as `isLoadingX`, `isOpenY`, `selectedZ`, `tempA`, `formB`, or `listC` when they make state ownership unclear.
- When recommending a split, prefer cohesive UI sections, presentational/container separation, clear input/output contracts, and avoid over-splitting that increases accidental complexity.
- For large component splits or state refactors, do not auto-fix directly. Require a spec/plan covering current responsibilities, proposed pieces, input/output contracts, behavior risk, tests to update/run, and rollback strategy.
- Classify oversized-but-cohesive components as `Info`/`Low`; use `Medium` when maintainability/testability is materially affected, and `High` when state/side-effect bugs are already evident or release flow is blocked.

#### Variable naming convention
- Check variables, functions, properties, signals, and observables use clear camelCase names.
- Allow backend/API contract fields such as `user_id` or `created_at` when mapping DTOs directly.
- Recommend mapping non-camel DTO fields to camelCase view models at the boundary when it improves UI maintainability.
- Flag inconsistent, vague, or misleading names as `Low`, or `Medium` when they obscure business rules or data flow.

#### Service contract vs raw API vs ViewModel boundary
- Treat Service input/output models as the public contract between Service and Component. Do not require `SaveReq`, `CreateReq`, `UpdateReq`, `DTO`, `ListRes`, or `DetailRes` to match the raw backend API 1:1 when a Service/mapper intentionally transforms the payload.
- Check every public Service model field has a real owner: accepted/processed by a Service method, returned by the Service, guaranteed by a mapper, or explicitly documented as derived.
- If the raw backend response/request differs from the Service contract, expect internal raw API types near the Service/mapper and a typed mapper into the public DTO/Req shape.
- Flag public Service model fields that are never accepted, returned, mapped, derived, or tested. These create false contracts for Components and stale UI assumptions.
- Components must not mutate or extend Service DTOs with UI-only fields such as `label`, `displayName`, `checked`, `selected`, `disabled`, `expanded`, `children`, `color`, or `icon`.
- If UI needs additional fields, require either a Service-owned derived DTO field with mapper/tests, or a component-local ViewModel (`RowVM`, `TreeNodeVM`, `DetailVM`) created from the DTO.
- In findings, name the layer for ambiguous fields: `BE API field`, `Service input/output field`, `Component ViewModel field`, or `UI state field`.
- Severity: default `Medium` + `REQUIRED`; use `High` + `BLOCKER` when a false Service contract can break save/load, hide required backend data, corrupt payloads, or produce stale/incorrect UI state.

#### Modern Angular APIs
- Prefer modern Angular APIs when the project has adopted that convention: `input()` over `@Input()`, `output()` over `@Output()`, `model()` for appropriate two-way bindings, `viewChild()` / `viewChildren()` over decorators, `inject()` over constructor DI, and `signal` / `computed` / `effect` for suitable local reactive state.
- Do not flag old APIs when the project has not migrated, or when the file intentionally follows an older local convention.
- Classify modern-API migration as `Low` by default; use `Medium` only when the project convention requires it or the older pattern creates maintainability/testability risk.
- Suggest small, safe migrations that preserve behavior.

#### Memory leak & lifecycle cleanup
- Check observable subscriptions, nested subscriptions, `interval`, `timer`, `setInterval`, `setTimeout`, manual event listeners, global/window/document listeners, WebSocket handles, Subject/BehaviorSubject/ReplaySubject lifetimes, module-level state, and `effect()` side effects.
- Flag component subscriptions without `takeUntilDestroyed`, `AsyncPipe`, `toSignal`, or an equivalent teardown mechanism.
- Flag timers/listeners/resources that are not cleared during destroy/cleanup.
- Prefer `takeUntilDestroyed(inject(DestroyRef))`, `AsyncPipe`, `toSignal()`, `fromEvent(...).pipe(takeUntilDestroyed(...))`, explicit timer cleanup, and resource closing/completion where needed.
- Classify clear leaks as `High` for long-lived services or important screens, `Critical` only when they can crash/freeze/corrupt the system, and `Medium` for lower-risk component leaks.

#### Review judgement guardrails
- Do not review mechanically. Do not flag an issue only because a file does not use a newer Angular API/convention when the project has not adopted that convention.
- Distinguish real defects from convention gaps, intentional technical debt, unfinished migration, and personal preference.
- Require concrete evidence for every issue: file, line, code fragment, repeated pattern, failing probe, or clear project convention.
- If evidence is incomplete, use `INFO` or `RECOMMENDED`; do not inflate severity.
- Keep recommendations small and behavior-preserving unless the risk clearly requires larger refactoring.

#### Template performance
- Check component method/getter calls in template interpolation, property bindings, class/style bindings, and structural conditions, especially calls that format labels, compute permissions/visibility, allocate, filter/sort/map arrays, read services, or depend on mutable state.
- Treat template-called component methods/getters for displayed or derived values as a review finding even when they look cheap; Angular can re-run them every change-detection cycle and they hide dependencies from OnPush/signal reasoning.
- Allowed calls: event handlers (`(click)="onSave()"`), Angular signal reads (`state()`, `saving()`, `entity()`), and pure pipes. Repeated signal reads should use `@let` or `computed()`.
- Check complex template expressions; move business logic to `computed`, pure pipes, selectors, precomputed maps, or a view model.
- For list rendering, verify `@for` has a stable `track`, or `*ngFor` has `trackBy` when the list can grow, reorder, or update frequently.
- Flag large business rules in templates as maintainability/performance risk; prefer precomputed view state.
- Severity: default `Medium` + `REQUIRED`; use `High` + `BLOCKER` when the call runs inside a large/repeated list, performs allocation/filter/sort/service access, or can cause visible lag/stale data.

#### Style scope & global styles
- Check additions to global/shared stylesheets such as `styles.scss`, `theme.scss`, `global.scss`, or other shared/global styles.
- Do not put one-screen or one-component styles in global styles. Component-specific styles belong in that component stylesheet, for example `user-profile.component.scss` or `order-filter.component.scss`.
- Accept global styles only for clear app-wide reasons such as design tokens, CSS variables/theme, reset/normalize, base typography, app-wide layout foundations, reusable utilities, or third-party/Core UI overrides that cannot be component-scoped.
- If a global style is added, require a nearby comment or clear context explaining why component scope is not sufficient.
- Flag global selectors that are too specific to one screen/component, for example `.user-profile-card`, `.order-detail-table`, or `.payment-method-form`.
- State the risk explicitly: style leakage across screens, maintainability cost, tighter coupling, hard deletion/refactor, and unintended overrides.

#### Utility-first styling
- If the project has utility classes, design-system helpers, Core UI utilities, or Tailwind in the consumer app, check whether spacing, flex/grid, alignment, typography, color, radius, display, gap, and basic width/height can use existing utilities before new SCSS is written.
- Do not write custom SCSS for simple rules already covered by utilities, such as margin/padding/gap, flex alignment, text alignment, tokenized font size/weight, or simple dimensions.
- Do not overuse utility classes when the template becomes hard to read. If the class list is too long or styling logic is complex, consider a child component or scoped SCSS.
- Custom SCSS should be component-scoped, avoid duplicating utilities, use design tokens/variables instead of hardcoded values when available, and avoid selectors deeply coupled to DOM structure.
- Flag custom SCSS that only replicates existing utility classes.

#### Component-scoped styling and overrides
- Component-specific UI styles should live in the component style file.
- Do not target internal component DOM from global selectors.
- Avoid `::ng-deep`, `ViewEncapsulation.None`, or global selectors to bypass encapsulation unless there is a clear reason.
- For third-party/Core UI overrides, prefer official APIs, inputs, classes, or theme tokens. If a CSS override is unavoidable, scope the selector as tightly as possible and require a comment explaining the reason and risk.
- Flag components that depend on unclear global styles or untraceable external overrides.

#### Change detection
- Require `ChangeDetectionStrategy.OnPush` on every generated or modified Angular component unless the file is explicitly following a documented legacy project exception.
- Missing `OnPush` is `Medium` + `REQUIRED` by default; use `High` + `BLOCKER` for list/detail components, large forms/tables, high-frequency dashboards, or components already showing change-detection/performance bugs.
- Verify `ChangeDetectionStrategy` is imported from `@angular/core` and the component decorator declares `changeDetection: ChangeDetectionStrategy.OnPush`.
- If signals are used, check whether manual subscriptions or mutable state can be reduced safely.
- Do not waive `OnPush` for new sdcorejs-angular output merely because older project files lack it; review generated/modified code against the current standard.

#### Forms
- Check validation rules, error messages, disabled/loading/submitting states, and prevention of double submit.
- Check typed forms when the project uses Angular typed forms.
- Check `reset` / `patchValue` / `setValue` preserve expected dirty/touched/disabled state and do not accidentally erase business state.
- Check custom validators and async validators clean up resources, avoid side effects, and do not create unstable timing behavior.

#### Error handling & UX state
- API-driven UI should handle loading, empty, error, and success states when those states affect the user flow.
- Flag `catchError(() => EMPTY)` and `catchError(() => of(null))` when they swallow errors without a comment explaining the UX fallback.
- Error messages, toasts, and logs must be useful without exposing secrets, tokens, PII, or sensitive backend details.
- Check fallback UI when data is missing, partial, or API calls fail.

#### Security
- Review `[innerHTML]`, `DomSanitizer`, `bypassSecurityTrust*`, dynamic URLs, and dynamic styles for XSS or unsafe rendering risk.
- Flag hardcoded tokens, secrets, API keys, credentials, and sensitive console logging.
- Do not render untrusted data directly when it can become HTML, URLs, styles, or script-adjacent content.
- External links using `target="_blank"` should include `rel="noopener noreferrer"`.

#### Accessibility
- Icon-only buttons need `aria-label` or an equivalent accessible name.
- `input`, `select`, and `textarea` controls need labels or accessible names.
- Interactive elements should use semantic `button` / `a` elements instead of `div` / `span` unless a strong reason and keyboard handling exist.
- Modal/dialog/dropdown interactions should handle focus, keyboard navigation, escape/close behavior, and return focus when applicable.
- Loading, error, and empty states should include clear text or semantics for assistive technology.

#### i18n & content consistency
- If the project uses translate/i18n, flag hardcoded user-facing text in templates/components unless the local convention allows it.
- Error messages, labels, placeholders, and button text should follow the project's language and terminology conventions.
- Do not flag backend permission codes, identifiers, route paths, or DTO fields for being English.
- Flag arbitrary language mixing when the project has a clear locale/content standard.

#### Tests
- Important logic should have unit tests, component tests, or integration/e2e coverage appropriate to the risk.
- Tests should cover happy path, error path, and meaningful edge cases.
- Async tests should avoid flaky timing; prefer deterministic schedulers, fake timers, controlled observables, or explicit awaits.
- Service/API mocks should match the real contract closely enough to catch integration mistakes.
- If behavior changes without corresponding test updates, report it as an issue.

#### Import/dependency hygiene
- Flag unused imports.
- Flag imports from deep/private paths when the project forbids them or the path is not public API.
- Check circular dependency signs such as mutual feature imports, service/component reach-around, or barrel files hiding cycles.
- Avoid heavy dependencies for tiny functionality when a local utility or platform API fits.
- Side-effect imports need a clear reason.

#### RxJS usage
- Avoid nested `subscribe` when an operator chain is clearer and easier to clean up.
- Check operator choice: `switchMap` for cancelable latest-only work, `concatMap` for ordered queues, `exhaustMap` for submit/ignore-while-busy flows, and `mergeMap` for safe concurrent work.
- Search/filter/input streams should usually consider `debounceTime` and `distinctUntilChanged`.
- Check race conditions when loading data from keyword, filter, route param, or user action changes.
- Do not overuse `Subject` when signals, form streams, `computed`, or existing observables express the state more safely.

#### State management
- Check duplicate state across signals, forms, stores, observables, and local variables.
- Derived state should use `computed` or selectors instead of manual `set`/sync code when practical.
- Loading/error/data state should be consistent and not split across unrelated booleans without a clear invariant.
- State should reset or reload when route param, input, tab, filter, or business context changes.

#### Route & lifecycle
- Route params and query params should be parsed and validated before use.
- When route params change while a component is reused, data and local state should reload/reset correctly.
- Guards and resolvers should handle errors, redirects, and permission states explicitly.
- Component reuse must not leak stale state from a previous entity/context.

#### Auto-fix policy
- Auto-fix directly only when the change is small, safe, behavior-preserving, and can be verified with lint/test/build or a targeted probe.
- For medium/large changes, write a spec/plan first with scope, affected files, risks, tests to run, and rollback strategy.
- Do not approve a gate for large fixes without test/lint/build evidence or a side-effect review.
- Prefer incremental fixes that are easy to review.

### Architecture
- Lazy loading: every entity route uses `loadComponent` / `loadChildren`, not eager imports
- Module wiring: `<MODULE>_CONFIGURATION` provided at the right scope (root for root-scoped services, route-level for module-scoped interceptors)
- Permission keys consistent: `data.permission` matches `<MODULE>_C_<ENTITY>_<ACTION>` and `data.permissionKey` matches the configuration `key`
- Standalone-first unless the project is hybrid; no mixing without reason
- Interceptor wiring: HTTP interceptors registered via `HTTP_INTERCEPTORS` multi-provider (or `withInterceptors`) in the right ORDER — `SdUnauthorizedInterceptor` (401 → signout) and `SdNoInternetInterceptor` (offline / 503) imported from `@sdcorejs/angular/interceptors`, not hand-rolled. Auth/refresh interceptor before the error-surfacing ones.

### API/service model boundary
- Service `Req`/`Res`/`DTO`/`Model` types describe the Service contract consumed by components, not necessarily the raw backend API contract.
- Raw API-only fields should be isolated in internal types/mappers. Component code should consume Service DTOs or local ViewModels, not raw API payloads.
- UI state fields (`checked`, `selected`, `expanded`, `children`, `disabled`, etc.) should not be added to Service DTOs unless the Service derives and guarantees them.

### Core UI usage
- Uses `@sdcorejs/angular/components`, `@sdcorejs/angular/forms`, `@sdcorejs/angular/modules` instead of hand-rolled equivalents
- If a custom skeleton exists, it is marked with `// CUSTOM_UI: <reason>` and the generation summary mentioned it
- Imports come from path-specific subpaths (e.g. `@sdcorejs/angular/components/section`), not the barrel `from 'sd-angular'`
- **Don't re-implement what Core UI already ships.** When a hand-rolled widget duplicates a Core UI component (filter bar, operator picker, splitter, stepper, banner, dynamic form, color input, …), flag it and point the dev to the built-in. The authoritative component inventory is fetched on-demand (not committed) via `node _refs/angular/core-docs-fetch.mjs --list`; each component's per-component conventions and required configuration tokens via `node _refs/angular/core-docs-fetch.mjs --print sd-<name>` — consult it rather than hard-coding a component list here (drift-proof: the fetcher is version-matched to the pinned `@sdcorejs/angular` and stays current).

### Naming
- Files: `<entity-kebab>.model.ts`, `<entity-kebab>.service.ts`, `<entity-kebab>.routes.ts`, `<entity-kebab>.mock-data.ts`
- Classes: `<EntityPascal>Service`, `<EntityPascal>DTO`, `<EntityPascal>SaveReq`
- Selectors: `<entity-kebab>-list`, `<entity-kebab>-detail`
- Permission codes: `<MODULE>_C_<ENTITY>_<ACTION>` strict format

### Components
- `changeDetection: ChangeDetectionStrategy.OnPush` on every generated or modified component
- All injections via `inject()` function, not constructor params
- Private fields use `#` prefix (`readonly #service = inject(...)`)
- Mutable UI state uses `signal()`, derived state uses `computed()`, side effects use `effect()`
- Signals referenced 2+ times in template are extracted via `@let` or `computed()`
- Template display/visibility/disabled/class/title bindings read signals/computed/pure pipes/view models, not component methods/getters
- Form uses `FormGroup` with explicit validators; submit gates on `form.invalid → markAllAsTouched`

### autoId (E2E selectors + inspector) — WARN when missing
Core UI components accept an `autoId` input, emitted as `data-autoId` / `data-autoid` so E2E specs and the `sd-autoid-inspector` overlay can grab the element. Missing `autoId` = the element is invisible to the inspector and E2E by stable selector. Warn (Important, not Critical) so the dev backfills it.
- Every interactive Core UI element has an `autoId`: form controls (`sd-input`, `sd-select`, `sd-date`, `sd-checkbox`, `sd-switch`, `sd-radio`, …), `sd-button`, `sd-table` (+ row command buttons), `sd-query-bar`, `sd-modal` / `sd-side-drawer`, tabs, action toolbars.
- `autoId` values are stable + meaningful (e.g. `product-name`, `product-save`, `product-list`), kebab-case, unique within the page — not random or duplicated.
- Composite components that need per-item ids (e.g. `sd-anchor-item` `key`, table row actions) have the id wired so the emitted `data-autoId` resolves per item.
- Report missing/empty `autoId` grouped per component type with the file:line list, phrased as a dev action: "Add `autoId` to N controls so the inspector + E2E can target them."

### List page
- Uses `SdTable` with `type: 'server'` and pagination
- Columns include 4 audit columns (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`) — unless skip condition applies (embedded table, lookup entity, dialog)
- External filters in `tableOption.filter.externalFilters`, not custom controls above the table
- Permission directive on Create / Delete buttons

### Detail page
- Implements 3-state pattern (`CREATE | UPDATE | DETAIL`) with explicit branches
- Stale-id recovery: catches `detail(id)` errors, navigates back to list with notify
- Form fields render with `[viewed]="state() === 'DETAIL'"` for read-only state
- File uploads happen BEFORE save call

### Tests
- `*.spec.ts` exists alongside every component/service/routes file — a missing spec is a 🔴 defect, not a style nit
- Tests are runnable, not placeholders (no `// TODO`)
- `inject()` deps are mocked
- Spec coverage is `standard` by default (or the level the user explicitly chose); specs written RED-first
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` exit code 0

### Styling (utility-first)
- Layout / spacing / color / typography use Core UI utility classes (or the consumer's Tailwind), not bespoke CSS — see `_refs/angular/styling.md`
- 🟡 flag a component `.scss` that hand-rolls `display:flex` / `gap` / `padding` / color a utility class already provides (`d-flex`, `gap-16`, `p-16`, `text-primary`) — the "too many unnecessary CSS classes" smell
- Spacing/sizing utilities are px-based 0–200, multiples of 4 (`mb-16` not `mb-3`); flag off-scale or out-of-range values
- No Bootstrap class names (`btn`, `card`, `form-control`, `modal`) and no Tailwind syntax when the consumer has no Tailwind
- Any custom `.scss` is component-scoped, token-based (`var(--sd-*)`), and carries a `// why:` when it cannot be expressed with existing utilities.
- Do not put one-component/screen styles in global stylesheets such as `styles.scss`, `theme.scss`, or `global.scss`; global styles need an app-wide purpose or a scoped third-party/Core UI override reason.
- Avoid `::ng-deep`, `ViewEncapsulation.None`, and global selectors for component internals unless the override is tightly scoped and documented.

### Bilingual
- Vietnamese portal: labels, button titles, notify messages use VI with full diacritics
- English portal: same in EN
- Permission codes and route paths stay English in both cases

### Accessibility
- Buttons have `title` or `aria-label`
- Action toolbars have `role="toolbar"`
- Semantic HTML where possible (`<nav>`, `<main>`, `<section>`)

### Anti-patterns to flag
- Constructor injection
- Mutable plain class fields where `signal()` would be correct
- `effect()` used as `computed()`
- Hardcoded API URLs
- Logic in components instead of services
- Service DTOs used as UI scratch objects, or false DTO fields that the Service never accepts/returns/maps
- Duplicate permission checks (route guard + in-component `canViewList`)
- Method/getter calls in template bindings for displayed/derived values (re-runs every CD cycle); event handlers and signal reads are allowed
- Missing `autoId` on interactive Core UI elements (breaks E2E + `sd-autoid-inspector`) — WARN, dev backfills
- Hand-rolled UI where a Core UI component fits — check the candidate against the on-demand inventory (`node _refs/angular/core-docs-fetch.mjs --list`)
- A Core UI component used without its required configuration token provided (runtime throw) — `node _refs/angular/core-docs-fetch.mjs --print sd-<name>` lists each component's setup requirements

## Verification commands (run, include exit codes in the report)
- `npm run build-dev` → exit 0 / failed
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` → N passed, 0 failed

## Severity and gate mapping for this track
- **🔴 Critical** + `BLOCKER` — security, broken behavior, data loss, serious data leak, runtime throw (e.g. a Core UI component missing its required config token — see catalog), Zod/permission gaps, hardcoded API URLs, or leak/crash risk that can freeze/corrupt the system.
- **🟠 High** + `BLOCKER`/`REQUIRED` — core business flow breakage, likely runtime error, serious performance problem, data-integrity risk, uncleaned subscription/resource leak in an important screen/service, unsafe `any`/cast in critical data-contract logic, global style leakage that causes severe multi-screen UI breakage, or an oversized component with proven state/side-effect bugs that block release.
- **🟡 Medium** + `REQUIRED`/`RECOMMENDED` — actionable issue that can affect maintainability, UX, build/lint warnings, type safety, testability, E2E reliability, or future change risk; examples include unreasoned `any`, `as any`, missing standalone cleanup, missing important `autoId`, missing `ChangeDetectionStrategy.OnPush`, method/getter calls in template bindings for displayed/derived values, Service DTO fields that are not accepted/returned/mapped, UI-only fields added to Service DTOs, constructor DI when the project requires `inject()`, hand-rolled UI where Core UI fits, one-component styles added globally, undocumented `::ng-deep` / `ViewEncapsulation.None`, or components that are too broad to test/maintain safely.
- **🟢 Low** + `RECOMMENDED`/`OPTIONAL` — naming, format, style, readability, comment, clean-code, minor `autoId`, custom SCSS that duplicates a utility in a small/local way, or convention inconsistencies that do not change behavior.
- **🔵 Info / Kudos** + `INFO` — useful positive note or praise.
- **🟢 Pass / Compliant** / **✅ Checked** + `PASS` — reviewed criterion passed.
- **✨/🌟 Excellent** + `INFO` — smart, creative, or especially clean implementation worth mirroring.

## Positive rows to include when applicable
- Naming/file structure follows kebab-case Angular convention.
- Standalone imports are minimal and used.
- No unexplained `any`, unsafe casting, or non-null assertions found in reviewed scope.
- Core UI `autoId` values are stable, meaningful, and complete.
- Component members have correct visibility and no unused state/methods.
- Component responsibilities are cohesive, or split with clear contracts where complexity justifies it.
- Service models expose a truthful Service-Component contract, with raw API mapping isolated and UI-only state kept in ViewModels/signals.
- Modern Angular APIs are used consistently with project convention.
- Components declare `ChangeDetectionStrategy.OnPush`.
- Templates avoid method/getter calls for displayed/derived bindings and use `computed()`, signals, pure pipes, or view models instead.
- Observable/timer/listener/resource cleanup is handled with `takeUntilDestroyed`, `AsyncPipe`, `toSignal`, or explicit cleanup.
- Styles are component-scoped where appropriate, global styles have clear app-wide purpose, and custom CSS does not duplicate available utilities.

## Post-review assistance
- For small fixes, include a concrete patch idea or snippet in the `Đề xuất fix` cell.
- For medium/large fixes, recommend a spec/plan before editing and include scope, affected files, risks, tests to run, and rollback strategy when relevant.
- Prefer small, behavior-preserving changes.
- If evidence is insufficient, use `INFO` or `RECOMMENDED` and say what must be inspected next.

## Scored deep-review mode (enterprise audit) — Angular-specific alternate output

Use this mode for a full module/branch audit, or when the user asks for a "scored review", "đánh giá", "chấm điểm", or an enterprise-readiness assessment. The color-table format from the parent skill stays the default for small diffs.

**Priority lens (weight findings in this order):** Performance → Maintainability → Scalability → Enterprise readiness. A finding that hurts a higher-priority axis outranks one that only affects a lower axis. **Do NOT score formatting/style** unless it measurably hurts maintainability (then say how).

**Scoring bands (1–10):** 9–10 exemplary · 7–8 solid, minor gaps · 5–6 works but real debt · 3–4 significant issues, rework needed · 1–2 broken / risky. Score against what an enterprise Angular-20 portal should look like, not against "it compiles".

Score each of these 13 categories. For every category output **Score (1–10)**, **Findings** (concrete, `file:line`), **Risks** (what breaks at scale / over time), **Recommended improvements** (actionable, prioritized).

1. **Architecture & folder structure** — module/entity layout, feature isolation + boundaries, lazy routes, barrel hygiene, no cross-module reach-around, config-token scoping.
2. **Component design** — single responsibility, smart/dumb split, `input()/model()/output()` surface, content projection vs prop drilling, component size, standalone.
3. **Dependency injection** — `inject()` fn, `providedIn` scope correctness, no service-locator abuse, injection tokens for config, no circular deps, no logic-heavy constructors.
4. **RxJS usage** — teardown (`takeUntilDestroyed` / `async` pipe, no manual leak-prone `subscribe`), no nested `subscribe`, correct operators (switch/merge/concat/exhaust), error handling, no over-RxJS where a signal fits.
5. **Signal adoption** — `signal/computed/effect` used correctly, `effect` not used as `computed`, no redundant `BehaviorSubject` where a signal fits, `toSignal`/`toObservable` at boundaries, no signal writes inside `computed`.
6. **Change detection strategy** — `OnPush` everywhere, no method calls in bindings, `@for` `track`, zoneless-readiness (no `setTimeout`/manual `markForCheck` hacks), minimal CD surface.
7. **Template quality & styling** — native control flow (`@if/@for/@let`, no `*ngIf/*ngFor`), `track` keys, `async` pipe over manual subscribe, no heavy expressions/logic in template, signals referenced 2+ times extracted. Styling is utility-first (Core UI STYLE-GUIDE classes or consumer Tailwind); component `.scss` near-empty; bespoke CSS that duplicates a shipped utility (flex/spacing/color/typography) is a finding; spacing px-based 0–200.
8. **Forms implementation** — typed reactive forms (`FormGroup<...>`), explicit validators + async validators where needed, cross-field rules, submit gating (`invalid → markAllAsTouched`), no template-driven for complex forms, error surfacing.
9. **API layer design** — typed Service contracts (`SaveReq`/`DTO`/`ListRes`/`DetailRes`), clear raw API mapping when backend shape differs, no false DTO fields, UI-only state kept in ViewModels/signals, `SdApiService` (no raw `HttpClient` ad-hoc), URLs from environment (no hardcode), error/retry/caching strategy, logic in services not components, mock-first parity.
10. **Testing strategy** — spec exists alongside each file (missing = 🔴), coverage `standard` by default (or explicit override), written RED-first, runnable (no `// TODO`), deps mocked, meaningful assertions (not just "created"), integration where behavior matters.
11. **Accessibility** — semantic HTML (`<nav>/<main>/<section>`), `aria-label`/`title` on icon buttons, `role="toolbar"`, keyboard + focus management, AND `autoId` on interactive elements (E2E + `sd-autoid-inspector` selectors).
12. **Security** — XSS (`bypassSecurityTrust*` / `[innerHTML]` audited), token storage (httpOnly cookie vs localStorage), permission gating (route guard + directive, not duplicated logic), no secrets / prod source maps / leaked dev API URLs, interceptor order.
13. **Angular 20 readiness** — standalone + signals-first, native control flow, `inject()` (no constructor DI), no `NgModule`/deprecated APIs, zoneless-compatible, `@defer` for heavy/below-fold blocks, modern lifecycle (`afterNextRender`), `@sdcorejs/angular@20.0.1` aligned.

### Scored output format
```markdown
# Scored Review — <module>/<entity>   (Angular 20 / @sdcorejs/angular)

**Overall: X.X / 10** — <one-line verdict>. Priority lens: Performance · Maintainability · Scalability · Enterprise.

| # | Category | Score |
|---|----------|-------|
| 1 | Architecture & folder structure | 7 |
| … | … | … |
| 13 | Angular 20 readiness | 6 |

## 1. Architecture & folder structure — 7/10
- **Findings:** <file:line> …
- **Risks:** …
- **Recommended:** 1) … 2) …

## 2. Component design — N/10
…(repeat for all 13)…

## Top risks (cross-cutting, ranked)
1. <highest-priority-axis risk> — <impact>

## Quick wins (high value, low effort)
- …

## Verification commands run
- `npm run build-dev` → exit 0 / failed
- `npm run test -- --watch=false --include=...` → N passed, 0 failed
```

Overall score = weighted by the priority lens (Performance/Maintainability heaviest), not a flat average — state the weighting if it changes the headline number.
