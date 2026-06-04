# Init Module — Code Templates

Code templates referenced from the init-module reference pack [`init-module.md`](../write-code/init-module.md) (loaded on demand by the `angular-portal-write-code` orchestrator). The pack owns the decision logic (Required vs Optional, MUST DO / MUST NOT, hybrid compatibility) and chooses which of these templates to materialize for the requested module.

Placeholders used throughout: `[module]` / `[Module]` / `[MODULE]` (kebab / Pascal / SCREAMING_SNAKE forms of the module name), `[entity-a]` / `[entity-b]` (entity kebab names), `<CORE_UI_PACKAGE_NAME>` (resolved from [`../core-version.md`](../core-version.md)).

## Table of contents

- [\[module\].configuration.ts](#moduleconfigurationts) — InjectionToken + interface
- [configurations/api.configuration.ts](#configurationsapiconfigurationts) — interceptor with notify on error
- [configurations/upload-file.configuration.ts](#configurationsupload-fileconfigurationts) (optional)
- [guards/\[module\].guard.ts](#guardsmoduleguardts) — starter no-op + activation patterns
- [\[module\].module.ts (canonical — exposes the lib)](#modulemodulets-canonical--exposes-the-lib) — primary public API
- [routes.ts (lib root — guards + lazy children only)](#routests-lib-root--guards--lazy-children-only)
- [main.ts (standalone bootstrap)](#maints-standalone-bootstrap)
- [Legacy NgModule consumer](#legacy-ngmodule-consumer-when-the-app-shell-is-still-ngmodule-based)
- [permission.configuration.ts (keyed)](#permissionconfigurationts-keyed)
- [components/base-select/base-select.component.ts](#componentsbase-selectbase-selectcomponentts) — the load-bearing template
- [components/base-select/base-select.component.html](#componentsbase-selectbase-selectcomponenthtml)
- [Route Data Contract (Permission)](#route-data-contract-permission)
- [index.ts (lib barrel)](#indexts-lib-barrel)

---

## [module].configuration.ts

```typescript
import { InjectionToken } from '@angular/core';

export interface I[Module]Configuration {
  host: string;  // API endpoint: http://localhost:3000/api/v1/[module]
  // Add other module-specific configs
}

export const [MODULE]_CONFIGURATION = new InjectionToken<I[Module]Configuration>('[module].configuration');
```

## configurations/api.configuration.ts

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import {
  SD_API_CONFIGURATION,
  ISdApiConfiguration,
} from '<CORE_UI_PACKAGE_NAME>/services';
import { SdNotifyService } from '<CORE_UI_PACKAGE_NAME>/services';
import { I[Module]Configuration, [MODULE]_CONFIGURATION } from '../[module].configuration';

@Injectable()
export class ApiConfiguration implements ISdApiConfiguration {
  readonly #notifyService = inject(SdNotifyService);
  readonly #configuration = inject<I[Module]Configuration>([MODULE]_CONFIGURATION);

  handlers: ISdApiConfiguration['handlers'] = [
    {
      // Only runs for this module's host
      hosts: [this.#configuration.host],

      // Intercept REQUEST before sending
      intercept: (request: HttpRequest<unknown>) => {
        return request.clone({
          setHeaders: {
            // Add custom headers here if needed
            // 'Authorization': 'Bearer ' + token,
          },
        });
      },

      // Handle RESPONSE or ERROR
      afterRemote: (res: HttpResponse<any> | HttpErrorResponse) => {
        if (res instanceof HttpErrorResponse) {
          if (res.status !== 200 && res.status !== 204) {
            const errorMessage = res.error?.meta?.message || 'Đã có lỗi xảy ra';
            this.#notifyService.error(errorMessage);
          }
        }
      },
    },
  ];
}
```

## configurations/upload-file.configuration.ts (optional)

Generate only when the module has at least one entity that uses file upload.

```typescript
import { Injectable, inject } from '@angular/core';
import { ISdUploadFileConfiguration } from '<CORE_UI_PACKAGE_NAME>/components';
import { I[Module]Configuration, [MODULE]_CONFIGURATION } from '../[module].configuration';

@Injectable()
export class UploadFileConfiguration implements ISdUploadFileConfiguration {
  key = '[module]';
  readonly #configuration = inject<I[Module]Configuration>([MODULE]_CONFIGURATION);

  uploadUri = `${this.#configuration.host}/file/upload`;
  acceptFileType = ['image/*', '.pdf', '.doc', '.docx'];
  maxFileSize = 10 * 1024 * 1024; // 10MB
}
```

## guards/[module].guard.ts

```typescript
import { CanActivateFn } from '@angular/router';

// Starter module guard ships as a no-op so the module boots without a
// permission backend. Replace the body with project-specific logic once
// permissions are wired up — common patterns:
//
//   import { inject } from '@angular/core';
//   import { SdPermissionService } from '<CORE_UI_PACKAGE_NAME>/modules';
//   export const [module]Guard: CanActivateFn = () => {
//     const permissionService = inject(SdPermissionService);
//     // Use the project's chosen convention (e.g. '[MODULE]_VIEW' or
//     // '[MODULE]_C_VIEW' or '[MODULE]_VIEW:ALL' — pick one and stay consistent).
//     return permissionService.hasPermission('[MODULE]_VIEW');
//   };
export const [module]Guard: CanActivateFn = () => true;
```

## [module].module.ts (canonical — exposes the lib)

This is the SINGLE place where module-scoped providers live. The lib is consumed at app root via `importProvidersFrom([Module]Module.useValue({...}))` (standalone bootstrap) or via `imports: [[Module]Module.useValue(...)]` (legacy NgModule consumers).

```typescript
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { SD_API_CONFIGURATION } from '<CORE_UI_PACKAGE_NAME>/services';
import { SD_UPLOAD_FILE_CONFIGURATION } from '<CORE_UI_PACKAGE_NAME>/components';
import {
  [MODULE]_CONFIGURATION,
  I[Module]Configuration,
} from './[module].configuration';
import { ApiConfiguration } from './configurations/api.configuration';
import { UploadFileConfiguration } from './configurations/upload-file.configuration';

@NgModule({
  declarations: [],
  providers: [
    // ────────────────────────────────────────────────────────────────
    // Module-scoped interceptors / configurations live HERE, NOT on the
    // route. Route-level providers create lazy-bound injectors invisible
    // to root services like SdPermissionService — leads to silent failures.
    // ────────────────────────────────────────────────────────────────

    // SD_API_CONFIGURATION (multi:true) — request/response interceptor for
    // THIS module's API host. Each module registers its own ApiConfiguration
    // matched by `hosts: [this.#configuration.host]`. SdApiService walks all
    // registrations to find one matching the outgoing URL.
    // Use multi:true so multiple modules can coexist; each adds one handler.
    { provide: SD_API_CONFIGURATION, useClass: ApiConfiguration, multi: true },

    // SD_UPLOAD_FILE_CONFIGURATION (multi:true) — upload endpoint + size +
    // mime restrictions for THIS module. Each module's UploadFileConfiguration
    // declares its own `key` (matching `sd-upload-file [key]="<module>"`).
    // Skip this provider if no entity in the module uses file upload.
    { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
  ],
})
export class [Module]Module {
  /** Inject a configuration via a class — useful when the configuration has its own deps. */
  static useClass(
    classConfiguration: Type<I[Module]Configuration>,
  ): ModuleWithProviders<[Module]Module> {
    return {
      ngModule: [Module]Module,
      providers: [{ provide: [MODULE]_CONFIGURATION, useClass: classConfiguration }],
    };
  }

  /** Inject a configuration via a plain object — typical for `{ host: environment.baseUrl }`. */
  static useValue(
    valueConfiguration: I[Module]Configuration,
  ): ModuleWithProviders<[Module]Module> {
    return {
      ngModule: [Module]Module,
      providers: [{ provide: [MODULE]_CONFIGURATION, useValue: valueConfiguration }],
    };
  }
}
```

## routes.ts (lib root — guards + lazy children only)

```typescript
import { Routes } from '@angular/router';
import { [module]Guard } from './guards/[module].guard';

// Permission code convention is FLEXIBLE per project, but MUST be consistent.
// Scaffold default uses '[MODULE]_[ENTITY]_<ACTION>'. Variants like
// '[MODULE]_C_[ENTITY]_<ACTION>' or '[MODULE]_[ENTITY]:<ACTION>' are accepted
// as long as a single convention is used across the whole project.
export const [module]Routes: Routes = [
  {
    path: '',
    canActivate: [[module]Guard],
    children: [
      {
        path: '[entity-a]',
        loadChildren: () => import('./features/[entity-a]').then(m => m.[entityA]Routes),
        data: { permission: '[MODULE]_[ENTITY_A]_LIST', permissionKey: '[module]' },
      },
      {
        path: '[entity-b]',
        loadChildren: () => import('./features/[entity-b]').then(m => m.[entityB]Routes),
        data: { permission: '[MODULE]_[ENTITY_B]_LIST', permissionKey: '[module]' },
      },
      // Add more entities as needed
    ],
  },
];
```

> ⚠️ **No `providers: []` on the route.** All module-scoped providers (interceptors, configuration token, upload, etc.) belong on `[Module]Module`. Route-level providers create lazy-bound injectors that root-scoped services cannot see — leading to "no provider for `[MODULE]_CONFIGURATION`" errors when `SdPermissionService` / shared services run.
>
> **File naming convention**:
> - **Lib/module root** (e.g. `libs/agency/`): always `routes.ts` — exports `<module>Routes: Routes`
> - **Entity level** (e.g. `libs/agency/features/booking/`): use `<entity>.routing.ts` (or `routes.ts` if you prefer consistency). This matches how real codebases like `portal-agency` organize: top-level `routes.ts`, entity-level `booking.routing.ts`.
> - Don't mix: a lib with `<module>.routing.ts` at root is legacy — prefer `routes.ts`.

## main.ts (standalone bootstrap)

The lib is consumed at root via `importProvidersFrom`. `useValue` for inline config, `useClass` when the configuration needs its own DI.

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { SD_PERMISSION_CONFIGURATION } from '<CORE_UI_PACKAGE_NAME>/modules';
import { SdApiModule } from '<CORE_UI_PACKAGE_NAME>/services';
import { [Module]Module } from '@[module]';
import { PermissionConfiguration } from './app/configurations/permission.configuration';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      SdApiModule,
      // Inline value — typical for { host: ... }
      [Module]Module.useValue({ host: environment.[module]BackendUrl }),
      // Or class form, when the configuration injects other deps:
      // [Module]Module.useClass([Module]Configuration),
    ),
    // Keep permission configuration at root injector for root-scoped SdPermissionService
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },
  ],
});
```

## Legacy NgModule consumer (when the app shell is still NgModule-based)

```typescript
@NgModule({
  imports: [
    [Module]Module.useValue({ host: environment.[module]BackendUrl }),
    RouterModule.forRoot([...]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

The same `[Module]Module` works for both flows — that's the point of `ModuleWithProviders`.

## permission.configuration.ts (keyed)

```typescript
import { Injectable } from '@angular/core';
import { ISdPermissionConfiguration } from '<CORE_UI_PACKAGE_NAME>/modules';

@Injectable()
export class PermissionConfiguration implements ISdPermissionConfiguration {
  key = '[module]';

  // Starter default: disabled = true so the portal boots without a permission backend.
  // Flip to false once `loadPermissions` returns real data.
  disabled = true;

  loadPermissions = async () => {
    // Permission code convention is FLEXIBLE per project, but MUST be consistent
    // within a project. Acceptable shapes (pick ONE per project):
    //   - <MODULE>_<ENTITY>_<ACTION>      e.g. '[MODULE]_[ENTITY]_LIST'
    //   - <MODULE>_C_<ENTITY>_<ACTION>    e.g. '[MODULE]_C_[ENTITY]_LIST'
    //   - <MODULE>_<ENTITY>:<ACTION>      e.g. '[MODULE]_[ENTITY]:LIST'
    // Order is always large → small (Module, Entity, Action). Never mix two
    // conventions in the same project.
    return [
      '[MODULE]_[ENTITY]_LIST',
      '[MODULE]_[ENTITY]_DETAIL',
      '[MODULE]_[ENTITY]_CREATE',
    ];
  };

  onForbiden = () => {
    // redirect forbidden page
  };
}
```

## components/base-select/base-select.component.ts

Generic dropdown wrapping `sd-select` + `BaseService.register(url).search/all`. Generated ONCE per module, then reused by every `<entity>-select` (e.g. `customer-select`, `project-select`) so dropdowns inside CREATE/UPDATE forms stay consistent and the `BaseService` boilerplate isn't repeated.

The inline rationale comments (`Why this exists`, `Why viewProviders`, the per-`effect` explanations, the `any` type justification) carry load-bearing context — copy them verbatim. Without them, future maintainers will repeatedly re-derive why each piece is shaped the way it is.

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
} from '@angular/core';
import { ControlContainer, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseService } from '@[module]/services';
import { SdSelect, SdSelectionData } from '<CORE_UI_PACKAGE_NAME>/forms';
import { SdFilter, SdOrder, SdSize, SdUnwrapSignal, SdUtilities } from '<CORE_UI_PACKAGE_NAME>/utilities';

/**
 * Generic base-select component.
 *
 * Why this exists:
 * - Every entity-select dropdown (customer-select, project-select, …) shares
 *   the same shape: sd-select + BaseService.register(url).search/all.
 * - Centralising the boilerplate here keeps the per-entity wrappers tiny
 *   (just url + display field + module-specific default filters).
 *
 * Why `viewProviders: ControlContainer` is needed:
 * - When this component is rendered inside a parent <form [formGroup]="form">,
 *   `ReactiveFormsModule` looks for the FormGroup via the ControlContainer
 *   injection chain. Without re-providing FormGroupDirective here, the inner
 *   sd-select cannot find the parent form and formControlName silently fails.
 */
@Component({
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  selector: 'base-select',
  templateUrl: './base-select.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SdSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseSelectComponent<T = any> {
  #cdr = inject(ChangeDetectorRef);
  #baseService = inject(BaseService);

  // ──────────────────────────────────────────────────────────────────
  // 1. PRIMITIVE INPUTS (passthrough to <sd-select>)
  // ──────────────────────────────────────────────────────────────────
  autoId = input<string | undefined>();
  label = input<string | undefined>();
  name = input<string | undefined>();
  placeholder = input<string | undefined>();
  size = input<SdSize>('md');

  /**
   * Form is typed `any` deliberately.
   *
   * Reason: TypeScript narrows FormGroup<{}> aggressively and rejects passing
   * a typed FormGroup<MySchema> to a generic component expecting FormGroup<{}>.
   * Forcing a concrete generic here would require every caller to declare
   * full schema types; `any` keeps the API ergonomic while sd-select still
   * gets strong typing internally.
   */
  form = input<any>();

  // ──────────────────────────────────────────────────────────────────
  // 2. DATA-FETCH INPUTS
  // ──────────────────────────────────────────────────────────────────

  /** API path passed to `BaseService.register(url)`. Per-entity-select supplies this — e.g. `'customer'`, `'project'`. */
  url = input.required<string>();

  /**
   * - `'search'`: sd-select calls our function on each keystroke / open. Best
   *   for big tables (10k+ rows). Server-side filtering is the source of truth.
   * - `'all'`: fetch the entire dataset once when filters change, then sd-select
   *   filters in memory. Best for small lookup tables (status, country, …).
   */
  mode = input<'search' | 'all'>('search');

  orders = input<SdOrder<T>[] | undefined>();
  params = input<any | undefined>();
  inlineError = input<string | undefined>();
  valueField = input<string>('id');
  displayField = input.required<string>();

  /** Server-side filters merged into the request. Parent components push business filters here (e.g. status=ACTIVE). */
  filters = input<SdFilter<T>[]>([]);

  // ──────────────────────────────────────────────────────────────────
  // 3. BOOLEAN PASSTHROUGHS
  //
  // `booleanAttribute` converts the HTML attribute string forms (`required`,
  // `required=""`, `required="true"`) into a real boolean. Without it, the
  // template literal `[required]="someExpr"` works but the bare-attribute
  // form `required` would be the string `""` (truthy but wrong type).
  // ──────────────────────────────────────────────────────────────────
  required = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  viewed = input(false, { transform: booleanAttribute });
  multiple = input(false, { transform: booleanAttribute });
  hideInlineError = input(false, { transform: booleanAttribute });

  // ──────────────────────────────────────────────────────────────────
  // 4. MODEL & OUTPUTS
  // ──────────────────────────────────────────────────────────────────

  /**
   * Two-way binding target. `alias: 'model'` lets parents write
   * `[(model)]="someValue"` instead of `[(valueModel)]="..."` — matches the
   * sd-select API the dev is already familiar with.
   */
  valueModel = model<any>(undefined, { alias: 'model' });

  sdChange = output<any>();
  sdSelection = output<T[]>();

  // ──────────────────────────────────────────────────────────────────
  // 5. INTERNAL STATE & COMPUTED
  // ──────────────────────────────────────────────────────────────────

  /** Result holder — function for `mode='search'`, array for `mode='all'`. sd-select accepts both. */
  items: SdUnwrapSignal<SdSelect['items']>;

  /**
   * Stable hash of the current filter set. sd-select uses this token to know
   * when its internal cache is stale (different filters ⇒ different cache).
   * Computed from `filters()` only — never from `valueModel()` etc., otherwise
   * the cache would invalidate on every keystroke.
   */
  cacheChecksum = computed(() => SdUtilities.hash({ filters: this.filters() }));

  constructor() {
    // ──────────────────────────────────────────────────────────────
    // EFFECT 1 — Coerce model value to string id(s).
    //
    // sd-select stores selection as strings internally. When a parent binds
    // `[(model)]="entity.customer"` where customer is an object, we need to
    // extract the id field and store it as a string. The `untracked()` block
    // ensures we don't create a feedback loop (writing valueModel inside an
    // effect that depends on valueModel would otherwise re-fire infinitely).
    // ──────────────────────────────────────────────────────────────
    effect(() => {
      const val = this.valueModel();
      untracked(() => {
        if (val === undefined || val === null) return;

        const _multiple = this.multiple();
        const _valueField = this.valueField();

        const newVal = _multiple && Array.isArray(val)
          ? val.map(item => (typeof item === 'object' ? item[_valueField] : item).toString())
          : (typeof val === 'object' ? val[_valueField] : val).toString();

        // Only write back if the coerced value differs — prevents infinite loops
        // when the parent already stores a string id.
        const changed = _multiple
          ? JSON.stringify(val) !== JSON.stringify(newVal)
          : val !== newVal;
        if (changed) {
          this.valueModel.set(newVal);
          this.#cdr.markForCheck();
        }
      });
    });

    // ──────────────────────────────────────────────────────────────
    // EFFECT 2 — Wire data fetching based on `mode`.
    //
    // Re-runs when url / mode / filters / valueField / displayField / params
    // change. `untracked()` shields the side-effect (HTTP call) from creating
    // additional signal dependencies inside `register`.
    // ──────────────────────────────────────────────────────────────
    effect(() => {
      const _url = this.url();
      const _mode = this.mode();
      const _filter = this.filters();
      const _valueField = this.valueField();
      const _displayField = this.displayField();
      const _params = this.params();

      untracked(() => {
        const register = this.#baseService.register(_url);

        if (_mode === 'search') {
          // Server-side search: sd-select calls this function as the user types.
          // We re-read `_filter` here (already captured) so the request always
          // uses the current filter snapshot.
          this.items = async ({ type, searchText, value }: any): Promise<T[]> => {
            const results = await register.search({
              searchReq: { type, value, searchText },
              req: { filters: _filter || [], ...(_params || {}) },
              valueField: _valueField,
              searchField: _displayField,
              orders: this.orders(),
            });
            // Required: OnPush + async assignment ⇒ must manually mark dirty.
            this.#cdr.markForCheck();
            return results;
          };
        } else {
          // Fetch-all mode: one HTTP call now, sd-select filters in memory.
          register.all({ filters: _filter || [] }, this.orders()).then(items => {
            this.items = items;
            this.#cdr.markForCheck();
          });
        }
      });
    });
  }

  onModelChange = (val: any) => {
    this.valueModel.set(val);
    this.sdChange.emit(val);
  };

  onSelectionChange = (selectionData: SdSelectionData<T>) => {
    this.sdSelection.emit(selectionData.selectedItems);
  };
}
```

## components/base-select/base-select.component.html

```html
@let _displayField = displayField();
@let _valueField = valueField();

<div class="align-items-center position-relative w-full" style="flex: 1; min-width: 0">
  <div style="flex: 1; min-width: 0; max-width: 100%">
    <sd-select
      style="width: 100%"
      [multiple]="multiple()"
      [autoId]="autoId()"
      [form]="form()"
      [name]="name() || autoId()"
      [label]="label()"
      [placeholder]="placeholder()"
      [model]="valueModel()"
      (modelChange)="onModelChange($event)"
      [items]="items"
      [valueField]="_valueField"
      [displayField]="_displayField"
      [required]="required()"
      [disabled]="disabled()"
      [viewed]="viewed()"
      (sdSelection)="onSelectionChange($event)"
      [size]="size()"
      [inlineError]="inlineError()"
      [cacheChecksum]="cacheChecksum"
      [hideInlineError]="hideInlineError()">
    </sd-select>
  </div>
</div>
```

> **Why `@let` at the top of the template:** these signals are referenced twice each in the bindings below. Reading them once into a local with `@let` saves N×2 signal invocations per change-detection cycle on every dropdown.

## Route Data Contract (Permission)

```typescript
{
  path: '[entity]',
  loadChildren: () => import('./features/[entity]').then(m => m.[entity]Routes),
  data: {
    // Pick ONE convention per project and stay consistent:
    //   '[MODULE]_[ENTITY]_LIST' | '[MODULE]_C_[ENTITY]_LIST' | '[MODULE]_[ENTITY]:LIST'
    permission: '[MODULE]_[ENTITY]_LIST',
    permissionKey: '[module]',
  },
}
```

## index.ts (lib barrel)

```typescript
export * from './[module].module';        // primary public API — consumed via `.useValue()` / `.useClass()`
export * from './[module].configuration'; // token + interface
export * from './routes';                  // for app.routes lazy-load reference
export * from './guards/[module].guard';

// Services and models from base folder
export * from './services';
```
