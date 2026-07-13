# Angular Feature Component Boundary Templates

Literal boundary templates used by `screen-list.md`, `screen-detail.md`, and
`init-entity.md` after `_refs/shared/frontend-architecture.md` is complete.
These are composable examples, not a fixed file tree. Materialize only the units
present in the approved component tree and adapt names, paths, Core UI imports,
forms, state APIs, and tests to the detected project convention.

## Contents

- [Selection Gate](#selection-gate)
- [List Route/Page and Child Contracts](#list-routepage-and-child-contracts)
- [Detail Route/Page and Form Section Contracts](#detail-routepage-and-form-section-contracts)
- [Optional Facade, Form Builder, and Mapper](#optional-facade-form-builder-and-mapper)
- [Declarations, Providers, and Public API](#declarations-providers-and-public-api)
- [Architecture Contract Tests](#architecture-contract-tests)

## Selection Gate

Before copying a template, record its row in the Frontend architecture plan:

| Candidate | Create when | Do not create when |
|---|---|---|
| Route/page container | The screen is routed | The unit is a non-routed embedded region |
| Feature-local child | Cohesive responsibility, state/lifecycle, contract, accessibility behavior, or test boundary | One-element/pass-through wrapper or line-count-only split |
| Shared component | Stable domain-agnostic or cross-feature consumers exist | Only one feature owns the domain contract |
| Feature facade/store | Multiple services/workflows or child-shared persistent state require coordination | Simple CRUD can call one API service from the page |
| Form builder | Complex typed form creation/validation is reused or independently tested | A small one-section form is clearer inline |
| Mapper | Raw API/domain/view shapes differ materially | The service already returns the exact stable view contract |

The route/page owns route/query parameters, navigation, orchestration, and
screen composition. Child components do not call raw APIs or the router unless
the detected architecture explicitly assigns that responsibility. State has one
owner.

## List Route/Page and Child Contracts

Use this composition shape only when the approved plan includes the matching
regions. A simple one-table page may keep all rendering in the route component.

```text
<[Entity]ListPage>
  <[Entity]Summary />       # optional feature-local
  <[Entity]Filters />       # optional feature-local
  <[Entity]Table />         # optional feature-local
  <[Entity]BulkActions />   # optional feature-local
</[Entity]ListPage>
```

### Route/page orchestration shell

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { [Entity]DTO } from '../../services/[entity].model';
import { [Entity]Service } from '../../services/[entity].service';
import { [Entity]FiltersComponent, type [Entity]FilterVM } from '../../components/[entity]-filters/[entity]-filters.component';
import { [Entity]TableComponent, type [Entity]RowAction } from '../../components/[entity]-table/[entity]-table.component';

@Component({
  selector: '[entity]-list-page',
  standalone: true,
  imports: [[Entity]FiltersComponent, [Entity]TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <[entity]-filters
      [value]="filters()"
      (valueChange)="filters.set($event)"
    />
    <[entity]-table
      [rows]="rows()"
      [loading]="loading()"
      (rowAction)="onRowAction($event)"
    />
  `,
})
export class [Entity]ListPageComponent {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #service = inject([Entity]Service);

  readonly filters = signal<[Entity]FilterVM>({});
  readonly rows = signal<readonly [Entity]DTO[]>([]);
  readonly loading = signal(false);
  readonly hasResults = computed(() => this.rows().length > 0);

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.#service.search(this.filters()));
    }
    finally {
      this.loading.set(false);
    }
  }

  onRowAction(action: [Entity]RowAction): void {
    // The route/page owns navigation; the table emits a domain/UI event.
    void this.#router.navigate([action.kind, action.id], { relativeTo: this.#route });
  }
}
```

If an approved feature facade owns filters, selection, optimistic updates, or
multiple service calls, inject the facade instead and keep it route/page scoped.
Do not generate both page-owned and facade-owned copies of the same state.

### Feature-local filter contract

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface [Entity]FilterVM {
  readonly keyword?: string;
  readonly status?: string;
}

@Component({
  selector: '[entity]-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section aria-label="<localized filter label>">...</section>`,
})
export class [Entity]FiltersComponent {
  readonly value = input.required<[Entity]FilterVM>();
  readonly valueChange = output<[Entity]FilterVM>();

  onValueChange(value: [Entity]FilterVM): void {
    this.valueChange.emit(value);
  }
}
```

### Feature-local table contract

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { [Entity]DTO } from '../../services/[entity].model';

export type [Entity]RowAction =
  | { readonly kind: 'detail'; readonly id: string }
  | { readonly kind: 'update'; readonly id: string };

@Component({
  selector: '[entity]-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<sd-table ...></sd-table>`,
})
export class [Entity]TableComponent {
  readonly rows = input.required<readonly [Entity]DTO[]>();
  readonly loading = input(false);
  readonly rowAction = output<[Entity]RowAction>();
}
```

Summary and bulk-action components follow the same rule: accept a stable view
contract, own only local transient interaction state, and emit meaningful events.
Reuse existing Core UI/project components directly when their contracts fit.

## Detail Route/Page and Form Section Contracts

The page owns the overall form/entity state and save workflow. Child form
sections receive typed subgroups; they do not create another source of truth.

```text
<[Entity]DetailPage>
  <[Entity]Header />             # optional
  <[Entity]GeneralForm />        # optional feature-local section
  <[Entity]ShippingForm />       # optional feature-local section
  <[Entity]LineItems />          # optional child collection/editor
  <[Entity]WorkflowPanel />      # optional workflow boundary
</[Entity]DetailPage>
```

### Route/page form owner

```typescript
@Component({
  selector: '[entity]-detail-page',
  standalone: true,
  imports: [[Entity]GeneralFormComponent, [Entity]LineItemsComponent],
  providers: [
    // Add [Entity]Facade only when the approved provider decision is page scope.
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <[entity]-general-form [form]="form.controls.general" />
    <[entity]-line-items
      [items]="form.controls.items"
      [viewed]="isDetail()"
      (itemAction)="onItemAction($event)"
    />
  `,
})
export class [Entity]DetailPageComponent {
  // Route state, load/save orchestration, and the single overall form live here.
  readonly form = create[Entity]Form();
  readonly isDetail = computed(() => this.state() === 'DETAIL');
}
```

### Typed form-section child

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: '[entity]-general-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<sd-section title="<localized section label>">...</sd-section>`,
})
export class [Entity]GeneralFormComponent {
  readonly form = input.required<FormGroup<[Entity]GeneralControls>>();
}
```

The supplied parent-owned subgroup remains the single source of truth; the child
does not create a duplicate form or entity model.

The child collection may own transient row focus/expansion state, but the parent
form owns submitted rows. An independently persisted collection uses its existing
service and the parent-detail modal/drawer pattern instead of a duplicated
`FormArray`.

## Optional Facade, Form Builder, and Mapper

Materialize only the collaborators approved by the architecture plan.

```typescript
// Route/feature/page scoped when it owns mutable feature state.
@Injectable()
export class [Entity]Facade {
  readonly #api = inject([Entity]Service);
  readonly filters = signal<[Entity]FilterVM>({});
  readonly selection = signal<ReadonlySet<string>>(new Set());
  readonly rows = signal<readonly [Entity]DTO[]>([]);
}

// Pure by default; make injectable only when the project convention or real
// dependencies require it.
export interface [Entity]RowVM {
  readonly id: string;
  readonly displayName: string;
}

export function map[Entity]ToRowVM(dto: [Entity]DTO): [Entity]RowVM {
  return { id: dto.id, displayName: dto.name };
}

export function create[Entity]Form(): FormGroup<[Entity]Controls> {
  return new FormGroup<[Entity]Controls>({ /* approved controls */ });
}
```

Keep raw API mapping in the API/data-access boundary. A facade coordinates
services/state; it does not become a second transport client. A form builder does
not own navigation or save orchestration.

## Declarations, Providers, and Public API

| Symbol | Standalone fallback | NgModule/hybrid adaptation | Public API |
|---|---|---|---|
| Route/page | Lazy route `loadComponent`; imports feature-local children | Follow detected declarations/imports without redeclaring standalone components | Private |
| Feature-local child | Parent `imports` | Detected feature module declaration/import | Private |
| Stateless cross-feature API service | Existing app/root provider convention when justified | Existing module/root provider convention | Export only with external consumers |
| Mutable facade/store | Route/page/feature provider | Closest detected feature provider | Private by default |
| Pure mapper/form builder | Direct local import | Direct local import | Private by default |
| Shared/design-system component | Existing shared import/public API | Existing shared module/public API | Public only through owning boundary |

Never export route pages or feature-local children through a global barrel. Do
not declare a standalone component in an NgModule. Avoid cross-feature deep
imports and `export *` barrels that can introduce cycles.

## Architecture Contract Tests

Generate focused tests for each materialized responsibility, following the
project's existing test style. Tests must contain executable assertions and fail
RED before implementation; comment-only `it()` bodies are not test evidence.

```typescript
import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { [Entity]DTO } from '../../services/[entity].model';
import { [Entity]Service } from '../../services/[entity].service';
import { [Entity]Facade } from '../../services/[entity].facade';
import { [Entity]FiltersComponent, [Entity]FilterVM } from '../../components/[entity]-filters/[entity]-filters.component';
import { [Entity]GeneralControls, [Entity]GeneralFormComponent } from '../../components/[entity]-general-form/[entity]-general-form.component';
import { [Entity]ListPageComponent } from './list-page.component';

describe('[Entity]ListPageComponent orchestration', () => {
  const route = {} as ActivatedRoute;
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const service = jasmine.createSpyObj<[Entity]Service>('[Entity]Service', ['search']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[Entity]ListPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: [Entity]Service, useValue: service },
      ],
    }).compileComponents();
    router.navigate.calls.reset();
    service.search.calls.reset();
  });

  it('maps filter changes into one page-owned reload flow', async () => {
    const rows = [{ id: 'id-1' }] as [Entity]DTO[];
    const filters: [Entity]FilterVM = { keyword: 'active' };
    service.search.and.resolveTo(rows);
    const component = TestBed.createComponent([Entity]ListPageComponent).componentInstance;

    component.filters.set(filters);
    await component.reload();

    expect(service.search).toHaveBeenCalledOnceWith(filters);
    expect(component.rows()).toEqual(rows);
    expect(component.loading()).toBeFalse();
  });

  it('owns navigation for table row actions', () => {
    const component = TestBed.createComponent([Entity]ListPageComponent).componentInstance;

    component.onRowAction({ kind: 'detail', id: 'id-1' });

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['detail', 'id-1'],
      { relativeTo: route },
    );
  });
});

describe('[Entity]FiltersComponent contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[Entity]FiltersComponent],
    }).compileComponents();
  });

  it('emits a typed filter value without calling data access', () => {
    const fixture = TestBed.createComponent([Entity]FiltersComponent);
    const emitted: [Entity]FilterVM[] = [];
    const nextValue: [Entity]FilterVM = { keyword: 'approved' };
    fixture.componentRef.setInput('value', {});
    fixture.componentInstance.valueChange.subscribe(value => emitted.push(value));

    fixture.componentInstance.onValueChange(nextValue);

    expect(emitted).toEqual([nextValue]);
  });
});

describe('[Entity]GeneralFormComponent contract', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[Entity]GeneralFormComponent],
    }).compileComponents();
  });

  it('edits the supplied subgroup without creating duplicate entity state', () => {
    const fixture = TestBed.createComponent([Entity]GeneralFormComponent);
    const parentOwnedGroup = new FormGroup({
      name: new FormControl('', { nonNullable: true }),
    }) as unknown as FormGroup<[Entity]GeneralControls>;
    fixture.componentRef.setInput('form', parentOwnedGroup);
    fixture.detectChanges();

    expect(fixture.componentInstance.form()).toBe(parentOwnedGroup);
  });
});

describe('[Entity]Facade provider lifecycle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('creates isolated facade and service instances for separate feature injectors', () => {
    const parent = TestBed.inject(EnvironmentInjector);
    const createService = () =>
      jasmine.createSpyObj<[Entity]Service>('[Entity]Service', ['search']);
    const featureProviders = [
      [Entity]Facade,
      { provide: [Entity]Service, useFactory: createService },
    ];
    const firstInjector = createEnvironmentInjector(
      featureProviders,
      parent,
    );
    const secondInjector = createEnvironmentInjector(
      featureProviders,
      parent,
    );

    try {
      const firstFacade = firstInjector.get([Entity]Facade);
      const secondFacade = secondInjector.get([Entity]Facade);
      const firstService = firstInjector.get([Entity]Service);
      const secondService = secondInjector.get([Entity]Service);

      expect(firstFacade).not.toBe(secondFacade);
      expect(firstService).not.toBe(secondService);
    } finally {
      firstInjector.destroy();
      secondInjector.destroy();
    }
  });
});
```

Do not create placeholder specs for components or collaborators that the
architecture plan intentionally did not create. Tests should prove ownership and
boundary behavior, not file count.
