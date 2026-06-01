# @sdcorejs/angular — Reference Catalog (v20.0.0)

Concise index of every component, form, service, module, directive, pipe, handler, interceptor, utility, and configuration in the SDCoreJS Angular library. Agents load this file to know WHAT exists; load specific docs on demand.

## Categories

| Category | Count | Folder |
| --- | --- | --- |
| Components | 29 | `components/` |
| Forms | 15 | `forms/` |
| Services | 9 | `services/` |
| Modules | 6 | `modules/` |
| Directives | 6 | `directives/` |
| Pipes | 4 | `pipes/` |
| Handlers | 1 | `handlers/` |
| Interceptors | 2 | `interceptors/` |
| i18n | 1 | `i18n/` |
| Utilities — Extensions (overview) | 1 (covers 7 files) | `utilities/extensions.md` |
| Utilities — Models (overview) | 1 (covers 12 files) | `utilities/models.md` |
| Configurations | 1 | `configurations/` |
| **Total** | **77 files** | (incl. this overview) |

## Components (29)

Grouped by visual / functional role to support screenshot → component matching. Each line is one MD file in `components/`.

### Visual primitives
- [`sd-button`](components/sd-button.md) — Standard action button (fill / light / outline / link variants, sizing, icons, loading, permission gating).
- [`sd-badge`](components/sd-badge.md) — Status / label indicator: colored dot, icon-with-text, or pill tag.
- [`sd-avatar`](components/sd-avatar.md) — Circular user avatar; auto-falls back to colorful initials when no image.
- [`sd-section`](components/sd-section.md) — Titled content section / card frame for grouping related fields or widgets.
- [`sd-view`](components/sd-view.md) — Read-only "label on top, value below" pair for detail/view pages (read-only counterpart to form inputs).
- [`sd-inform`](components/sd-inform.md) — Page-level banner / alert: 6 colors + auto status-icon, title/description, closable, action link, line-clamp with Xem thêm/Thu gọn.

### Lists, tables & data
- [`sd-table`](components/sd-table.md) — Standard list/table: paging, sorting, inline + toolbar filters, multi-select, row commands, expansion, async data.
- [`sd-history`](components/sd-history.md) — Vertical audit/history timeline (event title, status badge, timestamp, actor, source, description).
- [`sd-chart`](components/sd-chart.md) — Signal-based wrappers around Chart.js for bar / line / pie / doughnut visualizations.

### Navigation & layout
- [`sd-anchor`](components/sd-anchor.md) — Signal-based scroll-spy side TOC (OnPush; composite with `<sd-anchor-item>`) — pairs link list with page sections, auto-highlights as user scrolls.
- [`sd-tab`](components/sd-tab.md) — In-page tab strip: switch between content panels without routing.
- [`sd-tab-router`](components/sd-tab-router.md) — Browser-style multi-tab shell: each navigated route becomes a persistent tab (no reload on switch, drag-reorder).
- [`sd-side-drawer`](components/sd-side-drawer.md) — Right-edge slide-in panel rendered into `body` via CDK Portal — for create/edit/detail forms larger than a modal.
- [`sd-modal`](components/sd-modal.md) — Centered dialog (mobile bottom-sheet) with title/header/footer slots; opened imperatively via `open()` / `close()`.
- [`sd-quick-action`](components/sd-quick-action.md) — Row pairing left-side message with a right-side CTA / action button group (NOT a popover menu).
- [`sd-splitter`](components/sd-splitter.md) — Resizable split layout: draggable dividers between `<sd-splitter-panel>` children; collapsible, size-constrained, layout persists to storage.
- [`sd-stepper`](components/sd-stepper.md) — Step / wizard navigation indicator for multi-step flows.

### Editors & content authoring
- [`sd-editor`](components/sd-editor.md) — Form-bound rich-text editor (CKEditor 5) with bold/italic/lists/font color/inline image upload + validators.
- [`sd-mini-editor`](components/sd-mini-editor.md) — Compact rich-text input for comments / notes / chat-style messages — supports `@mentions`.
- [`sd-document-builder`](components/sd-document-builder.md) — WYSIWYG composer for printable templates (headings, tables, images, draggable variable placeholders, inline comments).
- [`sd-code-editor`](components/sd-code-editor.md) — Lightweight code viewer/editor with PrismJS highlighting + copy-to-clipboard (`html`, `ts`, `json`, `css`, `scss`).

### File & data I/O
- [`sd-upload-file`](components/sd-upload-file.md) — File picker / drag-drop / preview with image cropping, reorder, and validation.
- [`sd-preview`](components/sd-preview.md) — Modal image gallery viewer — main image + side-strip thumbnails over an `<sd-modal>`.
- [`sd-import-excel`](components/sd-import-excel.md) — End-to-end Excel import flow: download template → upload → per-row + cross-row validation → preview → annotated error export → submit valid rows.

### Query, filtering & schema forms
- [`sd-query-bar`](components/sd-query-bar.md) — GitLab-style filter bar: add/swap field chips, operator + value steps, inline or popover modes, saved views, one Search commit.
- [`sd-query-builder`](components/sd-query-builder.md) — Visual nested AND/OR rule builder (field operator value) — for advanced search / saved filters.
- [`sd-operator`](components/sd-operator.md) — Reusable operator picker (collapsed SVG icon + tooltip → matMenu of operators); two-way `[(model)]` of `Operator`. Used inside query-bar / column-filter.
- [`sd-form-generic`](components/sd-form-generic.md) — Schema-driven dynamic forms (formerly `workflow` module): `<sd-form-builder>` designer produces JSON; `<sd-form-render>` binds it to a runtime `FormGroup` (+ `<sd-feel-expression>`).

### Dev tooling
- [`sd-autoid-inspector`](components/sd-autoid-inspector.md) — Dev/debug overlay that surfaces `data-autoId` selectors for E2E authoring (not a product UI component).

## Forms (15)

Form controls. All implement `ControlValueAccessor`, register into the SDCoreJS form-group system (`[form]+[name]`), and support a `[viewed]` read-only "detail mode".

### Text & numeric
- [`sd-input`](forms/sd-input.md) — Workhorse text input: `text` / `email` / `password` / `number`; validators (required, min/max-length, pattern presets).
- [`sd-input-number`](forms/sd-input-number.md) — Locale-aware numeric input (VN `1.234.567,89` / ISO `1,234,567.89`), decimal precision, min/max.
- [`sd-input-color`](forms/sd-input-color.md) — Color picker form control (swatch + hex/value input).
- [`sd-textarea`](forms/sd-textarea.md) — Multi-line text; optional auto-grow + built-in `count/max` counter when `maxlength` is set.
- [`sd-label`](forms/sd-label.md) — Tiny presentational primitive: `<text> [info icon w/ tooltip] [*required]` — used internally by every other form input.

### Toggles
- [`sd-checkbox`](forms/sd-checkbox.md) — Single labeled boolean checkbox (Material `mat-checkbox`).
- [`sd-switch`](forms/sd-switch.md) — iOS-style on/off toggle — for feature flags, "active/inactive" rows.
- [`sd-radio`](forms/sd-radio.md) — Radio-button group (single pick from small fixed list, `row` or `column` layout).

### Selection from a list
- [`sd-select`](forms/sd-select.md) — Dropdown (single OR multi); built-in search; static array OR async API; checkbox mode when `[multiple]`; `[bare]` + `[viewed]` picker modes.
- [`sd-autocomplete`](forms/sd-autocomplete.md) — Typeahead single-select (Material `mat-autocomplete`); static or async source.
- [`sd-chip`](forms/sd-chip.md) — Multi-value tag input: type + Enter/comma to add chips, click × to remove.

### Date & time
- [`sd-date`](forms/sd-date.md) — Single-date picker (Material + Moment, VN `DD/MM/YYYY`); supports `[bare]` + `[viewed]` + public `open()`.
- [`sd-date-range`](forms/sd-date-range.md) — Two-date range picker (start + end) with min/max boundary support; supports `[bare]` + `[viewed]`.
- [`sd-datetime`](forms/sd-datetime.md) — Single date + `HH:mm` time picker (`@ng-matero/extensions/datetimepicker`); supports `[bare]` + `[viewed]`.
- [`sd-chip-calendar`](forms/sd-chip-calendar.md) — Multi-date chip picker: open calendar popup, toggle individual dates, each becomes a removable chip.

## Services (9)

Injectable singletons. All `providedIn: 'root'` unless noted on the per-file doc.

### HTTP & data
- [`SdApiService`](services/sd-api.md) — `HttpClient` wrapper: per-host handlers, configurable timeout, in-flight request dedup, optional persistent cache via `SdCacheService`.
- [`SdCacheService`](services/sd-cache.md) — Key-based cache factory: per-key handles (`get`/`set`/`has`/`remove`/`observer`) over in-memory `Map` + optional `localStorage`/`sessionStorage`.
- [`SdStorageService`](services/sd-storage.md) — Reactive `localStorage` / `sessionStorage` wrapper: typed handle + `BehaviorSubject` mirror + in-memory layer.

### UI feedback
- [`SdNotifyService`](services/sd-notify.md) — Toast service (success / info immediate; warning / error debounced+buffered) backed by Angular `signal`s.
- [`SdConfirmService`](services/sd-confirm.md) — `Promise`-returning confirm / input / radio / date dialogs (Material dialog).
- [`SdLoadingService`](services/sd-loading.md) — Imperative full-cover spinner attach/detach on any element by selector (uses `Renderer2` + `WeakMap`).

### File generation & parsing
- [`SdExcelService`](services/sd-excel.md) — Browser-side Excel/CSV: generate styled import template, export `.xlsx` / `.csv`, parse uploaded `.xlsx` → plain JS.
- [`SdDocxService`](services/sd-docx.md) — Convert `.doc` / `.docx` → standalone HTML via lazy-loaded Pandoc WASM; file picker + programmatic API.

### Platform
- [`SdLicenseService`](services/sd-license.md) — Domain-bound license check: hash `window.location.hostname` (salted) against `licenseKey` from `SD_CORE_CONFIGURATION`; bypasses `localhost` / `127.0.0.1`.

## Modules (6)

Feature bundles (services + directives + components + guards) — opt-in via `importProvidersFrom` or static `forRoot()` style providers.

- [`SdAuthModule`](modules/sd-auth.md) — Provider-agnostic auth abstraction: app supplies sign-out / change-password / guard callbacks; module exposes a service + two route guards.
- [`SdAuthomModule`](modules/sd-authom.md) — OAuth 2.0 + PKCE client for AuthOM (Auth0-based): login redirect, callback exchange, silent iframe refresh, `Authorization` interceptor.
- [`SdKeycloakModule`](modules/sd-keycloak.md) — Wrapper around `keycloak-js`: `check-sso` bootstrap, auto token refresh, HTTP interceptor.
- [`SdPermissionModule`](modules/sd-permission.md) — RBAC: `*sdPermission` directive, `SdPermissionGuard` for route gating, `SdPermissionService` for code checks.
- [`SdLayoutModule`](modules/sd-layout.md) — Back-office app shell: `<sd-layout>` + `<sd-page>`, responsive desktop/mobile sidebars, menu rendering.
- [`SdGenericModule`](modules/sd-generic.md) — Schema-driven CRUD/list scaffolding: register `(module, typeCode) → SdRegister<T>` adapters exposing `schema/paging/all/search/create/detail/update/remove`.

## Directives (6)

- [`*sdDesktop`](directives/sd-desktop.md) — Structural: render only on desktop (non-mobile) viewports.
- [`*sdMobile`](directives/sd-mobile.md) — Structural: render only on mobile viewports.
- [`[sdHref]`](directives/sd-href.md) — Smart anchor: Angular Router for internal links, `window.open(_, '_blank')` for `http(s)://` links.
- [`[sdTooltip]`](directives/sd-tooltip.md) — CDK-Overlay tooltip with template support, configurable position/color/delay, single-global-active.
- [`[sdHoverCopy]`](directives/sd-hover-copy.md) — On hover, overlays a copy-to-clipboard button; click → copy + "Copied" tooltip.
- [`[sdScroll]`](directives/sd-scroll.md) — Hover-aware horizontal scroll container (`overflow-x` flips `hidden` → `auto` on hover).

## Pipes (4)

- [`empty`](pipes/empty.md) — Replaces `null` / `undefined` / `''` with the project-wide `SD_EMPTY_STR` placeholder (`'-'` or `'--'`).
- [`formatNumber`](pipes/format-number.md) — Locale-aware number format: VN (`1.234.567,89`) or ISO (`1,234,567.89`) based on `SD_CORE_CONFIGURATION.format.number`.
- [`safeHtml`](pipes/safe-html.md) — `DomSanitizer.bypassSecurityTrustHtml` for trusted strings rendered via `[innerHTML]`.
- [`timeDifferent`](pipes/time-different.md) — Streaming relative-time string ("2 phút trước") that auto-updates every second; falls back to absolute format past a threshold.

## Handlers + Interceptors (1 + 2)

- [`SdGlobalErrorHandler`](handlers/global-error.handler.md) — Root `ErrorHandler`: detects chunk-load / dynamic-import failures (post-deploy stale SPA) and prompts user to reload; other errors fall through to `console.error`.
- [`SdNoInternetInterceptor`](interceptors/no-internet.interceptor.md) — HTTP interceptor: detects `status === 0` real offline (with CORS/SSL disambiguation via third-party ping), shows sticky polling snackbar; also surfaces friendly `503` server-maintenance message.
- [`SdUnauthorizedInterceptor`](interceptors/unauthorized.interceptor.md) — HTTP interceptor: catches `401` responses and delegates to `SdAuthService` (sign-out / re-auth flow).

## i18n (1)

- [`I18nService` + `| translate`](i18n/i18n.md) — Bilingual+ runtime (default `vi/en/ja/ko/zh`) for every user-facing string inside `@sdcorejs/angular`: signal-based `I18nService`, `pure: true` `| translate` pipe, type-safe key catalog from `EN_MESSAGES`, custom-language hook. NOT re-exported from the main barrel — import from `@sdcorejs/angular/i18n`.

## Utilities + Configurations

- [Utilities — Extensions](utilities/extensions.md) — Pure-function namespaces: `ArrayUtilities`, `StringUtilities`, `NumberUtilities`, `DateUtilities`, `SdUtilities`, plus color converters and `detectIncognito`. Overview covers 7 source files.
- [Utilities — Models](utilities/models.md) — Type-only contracts: `SdColor`, `SdSize`, `SdFilter`, `SdOrder`, `SdPagingReq/Res`, `SdNestedKeyOf`, `SdOperators`, `SdPatternCommons`, `SdMaybeAsync`, etc. Overview covers 12 source files.
- [`SD_CORE_CONFIGURATION`](configurations/sd-core.configuration.md) — Root DI token + `ISdCoreConfiguration` interface: per-domain `licenseKey` and global `format.number` style.

## How to use this catalog

When an agent needs to pick a component / service / etc. for a request:

1. Read `_overview.md` (this file) for the inventory.
2. Match the user's intent against the one-liners — favour the categories that look semantically closest (e.g. "show a list with paging" → table category, not forms).
3. Read the specific MD ONLY when picked — don't preload.
4. Cross-reference the per-file `When NOT to use` and `Related` sections to avoid wrong choices.
5. If nothing matches, fall back to a generic Material / Angular CDK primitive and mark with `alert('TODO: ...')` so the developer reviews.

This catalog is generated from `@sdcorejs/angular@20.0.0` (new default package name; legacy projects use the equivalent `@sd-angular/core` — identical API, swap the import prefix). Canonical MD lives next to each source file in the upstream library repo `vn-angular` (under `projects/sd-angular/<path>/`, still published there as `@sd-angular/core`); this folder is a near-identical mirror with the package name mapped to `@sdcorejs/angular` and a `**Library version**` banner added. When re-syncing, map `@sd-angular/core` → `@sdcorejs/angular` (see `core-version.md` → Upgrade Procedure).
