# Entity Test Templates — init-entity (angular-write-code)

Spec.ts templates for the init-entity reference pack ([`init-entity.md`](../write-code/init-entity.md), loaded on demand by the `angular-write-code` orchestrator), organized by test coverage level. The pack picks which set to emit based on the user's confirmed coverage (`minimal` / `standard` / `full`).

## Contents
- Request for Test Coverage (clarify prompt)
- `list.component.spec.ts` — standard coverage
- `detail.component.spec.ts` — standard coverage
- `[module]-[entity].routes.spec.ts` — Permission Validation
- Also see `entity-skeleton.md` for inline `list/detail.component.spec.ts` generated alongside their components.

---

## 5. Spec Templates (Functional Testing)

### Request for Test Coverage
**Before generating spec files, ask developer:**

> "Bạn muốn cấp độ test coverage nào cho module này?"
> 
> - **minimal**: chỉ `should create` (nhanh nhất, phù hợp prototype/v1)
> - **standard**: + permission route tests + basic data/sort tests (được khuyến nghị)
> - **full**: + tất cả unit + integration tests cho save flow, state transitions, edge cases

---

### list.component.spec.ts (Standard Coverage)
```typescript
// Arrange-Act-Assert pattern — functional tests for data visibility, filtering, sorting
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { [Entity]Service } from '../../services/[entity].service';
import { ListComponent } from './list.component';

describe('ListComponent ([module]/[entity])', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: ActivatedRoute;
  let [entity]ServiceMock: Pick<[Entity]Service, 'paging'>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/[module]/[entity]/list' });
    [entity]ServiceMock = {
      paging: jasmine.createSpy('paging').and.resolveTo({ items: [], total: 0 }),
    };
    activatedRouteMock = { snapshot: { params: {} } } as ActivatedRoute;

    TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: [Entity]Service, useValue: [entity]ServiceMock },
      ],
    });

    TestBed.overrideComponent(ListComponent, {
      set: { template: '<div>list-test-host</div>' },
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tableOption with server-side pagination and external filters', () => {
    const option = component.tableOption();
    expect(option).toBeTruthy();
    expect(option?.type).toBe('server');
    expect(option?.filter?.externalFilters?.length).toBeGreaterThan(0);
  });

  it('should return empty items when required external filter is missing', async () => {
    const option = component.tableOption();
    const result = await option?.items?.({ rawExternalFilter: {} } as any, {} as any);
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('should call paging service when external filter is provided', async () => {
    const option = component.tableOption();
    await option?.items?.({ rawExternalFilter: { filter1: 'value' } } as any, {} as any);
    expect([entity]ServiceMock.paging).toHaveBeenCalled();
  });

  it('should navigate to create page', () => {
    component.onCreate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['create'], { relativeTo: activatedRouteMock });
  });

  it('should navigate to detail page when row is clicked', () => {
    const option = component.tableOption();
    const codeCol = option?.columns.find(col => col.field === 'code');
    codeCol?.click?.('CODE-001', { id: 'id-1' } as any);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['detail', 'id-1'], { relativeTo: activatedRouteMock });
  });
});
```

### detail.component.spec.ts (Standard Coverage)
```typescript
// Arrange-Act-Assert pattern — functional tests for state transitions, save flow, validation
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { SdLoadingService, SdNotifyService } from '<CORE_UI_PACKAGE_NAME>/services';

import { [Entity]Service } from '../../services/[entity].service';
import { DetailComponent } from './detail.component';

describe('DetailComponent ([module]/[entity])', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: ActivatedRoute;
  let notifySpy: jasmine.SpyObj<SdNotifyService>;
  let loadingSpy: jasmine.SpyObj<SdLoadingService>;
  let [entity]ServiceMock: Pick<[Entity]Service, 'detail' | 'create' | 'update'>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/[module]/[entity]/create' });
    notifySpy = jasmine.createSpyObj<SdNotifyService>('SdNotifyService', ['success']);
    loadingSpy = jasmine.createSpyObj<SdLoadingService>('SdLoadingService', ['start', 'stop']);
    [entity]ServiceMock = {
      detail: jasmine.createSpy('detail').and.resolveTo({}),
      create: jasmine.createSpy('create').and.resolveTo({ id: 'new-id' }),
      update: jasmine.createSpy('update').and.resolveTo({}),
    };
    activatedRouteMock = { snapshot: { params: {} } } as ActivatedRoute;

    TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: SdNotifyService, useValue: notifySpy },
        { provide: SdLoadingService, useValue: loadingSpy },
        { provide: [Entity]Service, useValue: [entity]ServiceMock },
      ],
    });

    TestBed.overrideComponent(DetailComponent, {
      set: { template: '<div>detail-test-host</div>' },
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize CREATE state when no id in route', () => {
    component.ngOnInit();
    expect(component.state()).toBe('CREATE');
  });

  it('should initialize DETAIL state and load entity when url contains detail/:id', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/[module]/[entity]/detail/abc', configurable: true });
    Object.defineProperty(activatedRouteMock, 'snapshot', { value: { params: { id: 'abc' } }, configurable: true });
    component.ngOnInit();
    expect(component.state()).toBe('DETAIL');
    expect([entity]ServiceMock.detail).toHaveBeenCalledWith('abc');
  });

  it('should mark form touched and block save when form is invalid', async () => {
    spyOn(component.form, 'markAllAsTouched');
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(true);
    await component.onSave();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect([entity]ServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call create when entity has no id', async () => {
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);
    component.entity.set({ name: 'New Entity' });
    await component.onSave();
    expect([entity]ServiceMock.create).toHaveBeenCalled();
    expect(notifySpy.success).toHaveBeenCalled();
  });

  it('should call update when entity has id', async () => {
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);
    component.entity.set({ id: 'id-1', name: 'Updated' });
    await component.onSave();
    expect([entity]ServiceMock.update).toHaveBeenCalledWith('id-1', jasmine.any(Object));
  });
});
```

### [module]-[entity].routes.spec.ts (Permission Validation)
```typescript
import { [Entity]Routes } from './[entity].routes';

describe('[Entity]Routes (permission guards)', () => {
  it('should define permission code for all routes', () => {
    const missingPermission = [Entity]Routes.filter(route => !route.data || !route.data['permission']);
    expect(missingPermission).toEqual([]);
  });

  it('should use a consistent Module → Entity → Action naming format across all routes', () => {
    // Accepts any of: <MODULE>_<ENTITY>_<ACTION> | <MODULE>_C_<ENTITY>_<ACTION> | <MODULE>_<ENTITY>:<ACTION>
    // Adjust the project's chosen pattern below; the suite verifies all routes use the SAME shape.
    const permissionPattern = /^[A-Z]+(?:_C)?_[A-Z]+[_:][A-Z]+$/;
    const permissions = [Entity]Routes
      .map(route => route.data?.['permission'])
      .filter((x): x is string => typeof x === 'string');
    permissions.forEach(code => {
      expect(code).toMatch(permissionPattern);
    });
  });
});
```

