---
name: sdcorejs-testing-integration-angular-portal
description: Use to write integration tests for Angular-portal components — TestBed + HttpClientTestingModule + RouterTestingHarness + Core UI component test patterns. Different from `testing/unit/angular-portal.md` (single class) — integration tests wire 2-3 collaborators (component + service + router) with real DI container but mocked HTTP. Inherits cross-track principles from `testing/philosophy.md`. Triggers - "integration test angular", "test list + service + router", "test form submit flow", "TestBed setup", or automatic invocation after a screen / workflow skill completes. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Bash
---

# Testing — Integration (Angular Portal)

## Purpose
Integration tests wire 2-3 real Angular collaborators (component + service + router + form, etc.) using TestBed's real DI, but mock the network boundary (`HttpClientTestingModule`). Catches bugs that unit tests miss (lifecycle order, change detection timing, DI wiring) and that e2e is too slow to catch.

Read `testing/philosophy.md` first for principles.

## When invoked
- After the `angular-portal-write-code` orchestrator (screen-detail pack, any state, or actions pack) completes
- User says "test luồng tạo mới", "test form submit", "integration test"
- Before a feature merges (verify wiring with real-ish dependencies)

## What ships

| File | Purpose |
|---|---|
| `jest.config.js` / `karma.conf.js` | Already exists from project init |
| `src/libs/<module>/features/<entity>/pages/<state>/<state>.component.spec.ts` | Integration spec per page |
| `src/test-helpers/router-harness.ts` | Reusable `RouterTestingHarness` factory |
| `src/test-helpers/http-fixture.ts` | Reusable HTTP fixture builders |

## Workflow

### Step 1 — TestBed setup pattern

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { MockComponent, MockProvider } from 'ng-mocks';

import { ProductListComponent } from './list.component';
import { ProductService } from '../../services/product.service';
import { SD_API_CONFIGURATION } from '@sdcorejs/angular';

describe('ProductListComponent — integration', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        HttpClientTestingModule,
      ],
      providers: [
        provideRouter([
          { path: 'catalog/product', component: ProductListComponent },
          { path: 'catalog/product/detail/:id', component: ProductListComponent }, // stub
        ]),
        ProductService,  // real service
        { provide: SD_API_CONFIGURATION, useValue: { baseUrl: 'http://test' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // ensures no outstanding HTTP requests
  });

  it('loads list on init and renders rows', async () => {
    // Arrange
    fixture.detectChanges(); // triggers ngOnInit → service.search → HTTP

    // Assert: HTTP request happened
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/product/search'));
    expect(req.request.method).toBe('POST');

    // Act: respond
    req.flush({
      data: [
        { id: '1', code: 'P001', name: 'Sản phẩm A' },
        { id: '2', code: 'P002', name: 'Sản phẩm B' },
      ],
      total: 2,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert: rendered
    const rows = fixture.nativeElement.querySelectorAll('tr.row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('P001');
  });
});
```

### Step 2 — Router + form submit flow

```typescript
describe('ProductCreateComponent — submit flow', () => {
  let harness: RouterTestingHarness;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCreateComponent, HttpClientTestingModule],
      providers: [
        provideRouter([
          { path: 'catalog/product/create', component: ProductCreateComponent },
          { path: 'catalog/product', component: ProductListComponent },  // stub
        ]),
        ProductService,
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('submits valid form and navigates back to list', async () => {
    // Arrange
    const component = await harness.navigateByUrl('/catalog/product/create', ProductCreateComponent);
    component.form.patchValue({
      code: 'P003',
      name: 'Sản phẩm mới',
      unitPrice: 100000,
    });

    // Act
    component.onSubmit();

    // Assert HTTP
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/product') && r.method === 'POST');
    expect(req.request.body).toMatchObject({ code: 'P003' });
    req.flush({ id: '99', ...req.request.body });

    // Assert navigation
    await harness.fixture.whenStable();
    expect(harness.fixture.nativeElement.ownerDocument.location.pathname)
      .toBe('/catalog/product');
  });

  it('blocks submit when form invalid', () => {
    const component = TestBed.createComponent(ProductCreateComponent).componentInstance;
    component.form.patchValue({ code: '', name: '' });  // missing required

    component.onSubmit();

    httpMock.expectNone((r) => r.url.endsWith('/api/product'));
  });
});
```

### Step 3 — Mocking Core UI components

Don't import the real `@sdcorejs/angular` components in unit/integration tests — they pull dozens of dependencies. Use `ng-mocks` to stub them:

```typescript
import { MockComponent } from 'ng-mocks';
import { SdTableComponent, SdSearchBoxComponent } from '@sdcorejs/angular';

await TestBed.configureTestingModule({
  imports: [
    ProductListComponent,
    HttpClientTestingModule,
  ],
  declarations: [
    MockComponent(SdTableComponent),
    MockComponent(SdSearchBoxComponent),
  ],
  // ...
});

// Then assert against the mock:
const tableEl = fixture.debugElement.query(By.directive(SdTableComponent));
expect(tableEl.componentInstance.rows.length).toBe(5);
```

### Step 4 — Test interceptor + auth context

For workflows that depend on the auth interceptor / permission guards:

```typescript
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from '@/libs/shared/interceptors/auth.interceptor';
import { CurrentUserService } from '@/libs/shared/services/current-user.service';

await TestBed.configureTestingModule({
  imports: [ProductListComponent],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: CurrentUserService,
      useValue: {
        getUser: () => ({ id: '1', permissions: ['CATALOG_PRODUCT_LIST'] }),
        hasPermission: (p: string) => p === 'CATALOG_PRODUCT_LIST',
      },
    },
  ],
});
```

This lets you assert the interceptor adds the right headers AND the guard logic uses the test user.

### Step 5 — Test workflow actions (approve / reject)

```typescript
describe('PromotionDetailComponent — workflow actions', () => {
  it('approve action calls API and refreshes detail', async () => {
    // Arrange — load detail
    fixture.detectChanges();
    httpMock.expectOne('/api/promotion/123').flush({ id: '123', status: 'PENDING' });
    await fixture.whenStable();
    fixture.detectChanges();

    // Act — click approve button (only visible when status=PENDING + user has approve permission)
    const approveBtn = fixture.nativeElement.querySelector('button[data-action="approve"]');
    expect(approveBtn).toBeTruthy();
    approveBtn.click();

    // Assert
    const req = httpMock.expectOne('/api/promotion/123/approve');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });

    // Detail re-fetched
    httpMock.expectOne('/api/promotion/123').flush({ id: '123', status: 'APPROVED' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Đã duyệt');
    // Approve button gone
    expect(fixture.nativeElement.querySelector('button[data-action="approve"]')).toBeNull();
  });
});
```

### Step 6 — Run + coverage

```bash
npm run test -- --watch=false --include=src/libs/catalog/**/*.spec.ts --coverage
```

Target per module: ≥ 70% line coverage on `pages/` + `services/`.

## Rules

### MUST DO
- Inherit principles from `testing/philosophy.md` (AAA, naming, what-to-mock)
- ALWAYS call `httpMock.verify()` in `afterEach` — catches stray requests
- Use `ng-mocks` for Core UI components to avoid heavy imports
- Use real `Router` via `RouterTestingHarness` for navigation assertions, not a mock Router
- Test BOTH success and validation-failure paths for every form
- Test BOTH permission-allowed and permission-denied paths for workflow actions

### MUST NOT
- Import full `SdAngularCoreModule` — slow + brittle
- Use `setTimeout` to wait for change detection — use `whenStable()` / `fixture.detectChanges()`
- Skip `httpMock.verify()` — silently masks bugs
- Test private methods of components — test through the DOM / public API
- Hit the real backend in integration tests — that's e2e

## Anti-patterns

- **One spec with 20 `it()` blocks** — refactor into nested `describe` groups; one logical scenario per `describe`
- **`fixture.detectChanges()` ten times in a single test** — usually a sign the test is testing too much; split
- **`spyOn(service, 'method')` everywhere instead of `HttpClientTestingModule`** — spy testing implementation; HTTP fixture tests behaviour
- **Testing template binding directly** (`expect(component.someBinding).toBe(...)`) — test through the DOM (`expect(el.textContent).toContain(...)`)
- **Hardcoded delays** (`fakeAsync(() => tick(1000))`) — bad smell; use `whenStable()` or restructure
- **Test that's longer than the component** — restructure component to be more testable, or split into unit + smaller integration

## Cross-references
- Principles: `testing/philosophy.md`
- Unit tests: `testing/unit/angular-portal.md`
- E2E tests: `testing/e2e/angular-portal.md`
- Build skill that produces testable code: the `angular-portal-write-code` orchestrator (reference packs `_refs/angular-portal/write-code/init-portal.md` → `actions.md`)
- Verification gate: `orchestration/verify-before-done`
