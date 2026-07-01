# Test-Unit Knowledge — Angular Portal

> Unit-test patterns loaded on demand by `sdcorejs-test` when the project is an
> Angular portal and the detected level is unit. Not a dispatchable skill — no
> frontmatter. The orchestrator owns dispatch + the run/report flow.

## Purpose
Unit tests cover the smallest meaningful piece of logic — a validator, a pipe, a single service method — with everything else mocked. Fast (< 5 ms each), many (hundreds per module), and the foundation of the test pyramid.

Read `_refs/shared/testing-philosophy.md` first. This ref is the Angular-specific HOW.

## Patterns

### Pattern 1 — Validator function

```typescript
import { FormControl } from '@angular/forms';
import { vietnamesePhoneValidator } from './phone.validator';

describe('vietnamesePhoneValidator', () => {
  it.each([
    ['0901234567', null],
    ['+84901234567', null],
    ['84901234567', null],
    ['090123', { invalidPhone: true }],
    ['', null],                  // empty is for required validator
    ['abc1234567', { invalidPhone: true }],
  ])('input "%s" yields %s', (input, expected) => {
    const result = vietnamesePhoneValidator(new FormControl(input));
    expect(result).toEqual(expected);
  });
});
```

`it.each` keeps the matrix readable; one failing case names exactly which input broke.

### Pattern 2 — Pipe

```typescript
import { TestBed } from '@angular/core/testing';
import { DatePipe, registerLocaleData } from '@angular/common';
import { VnCurrencyPipe } from './vn-currency.pipe';
import localeVi from '@angular/common/locales/vi';

registerLocaleData(localeVi);

describe('VnCurrencyPipe', () => {
  let pipe: VnCurrencyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [VnCurrencyPipe] });
    pipe = TestBed.inject(VnCurrencyPipe);
  });

  it('formats integer as VND', () => {
    expect(pipe.transform(1500000)).toBe('<localized text>');
  });

  it('returns empty string for null', () => {
    expect(pipe.transform(null as any)).toBe('');
  });

  it('rounds to 0 decimals', () => {
    expect(pipe.transform(1500.75)).toBe('<localized text>');
  });
});
```

### Pattern 3 — Service method with mocked HTTP

For testing service logic IN ISOLATION (not the integration), spy the HTTP client:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let http: jest.Mocked<HttpClient>;

  beforeEach(() => {
    const httpSpy = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  describe('search', () => {
    it('posts query and maps response', async () => {
      http.post.mockReturnValue(of({ data: [{ id: '1' }], total: 1 }));

      const result = await service.search({ keyword: 'X' });

      expect(http.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/product/search'),
        expect.objectContaining({ keyword: 'X' }),
      );
      expect(result.data).toEqual([{ id: '1' }]);
    });

    it('maps server error to user-friendly message', async () => {
      http.post.mockReturnValue(throwError(() => ({ status: 500 })));

      await expect(service.search({})).rejects.toMatchObject({
        message: expect.stringContaining('<localized text>'),
      });
    });
  });
});
```

For most service test cases, `HttpClientTestingModule` (integration test) is clearer than spying on `HttpClient`. Use spy when you're testing the service's error-mapping or pre/post-processing in isolation.

### Pattern 4 — Mapper / pure function

```typescript
import { mapProductToTableRow } from './product.mapper';

describe('mapProductToTableRow', () => {
  it('maps required fields', () => {
    const input = {
      id: '123',
      code: 'P001',
      name: '<localized text>',
      unitPrice: 100000,
      createdAt: '2026-05-17T10:00:00Z',
    };

    expect(mapProductToTableRow(input)).toEqual({
      id: '123',
      displayName: '<localized text>',
      formattedPrice: '<localized text>',
      createdAtFormatted: '17/05/2026',
    });
  });

  it('handles null unitPrice', () => {
    expect(mapProductToTableRow({ id: '1', code: 'X', name: 'Y', unitPrice: null }).formattedPrice).toBe('-');
  });
});
```

### Pattern 5 — Async validator

```typescript
import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { codeUniqueValidator } from './code-unique.validator';

describe('codeUniqueValidator', () => {
  let service: { exists: jest.Mock };
  beforeEach(() => {
    service = { exists: jest.fn() };
  });

  it('returns null when code is unique', fakeAsync(() => {
    service.exists.mockReturnValue(of(false));
    const v = codeUniqueValidator(service as any);
    const control = new FormControl('NEW_CODE');

    let result: any;
    v(control).subscribe((r) => (result = r));
    tick(); // flush async pipe

    expect(result).toBeNull();
    expect(service.exists).toHaveBeenCalledWith('NEW_CODE');
  }));

  it('returns { duplicateCode: true } when code exists', fakeAsync(() => {
    service.exists.mockReturnValue(of(true));
    const v = codeUniqueValidator(service as any);

    let result: any;
    v(new FormControl('DUP_CODE')).subscribe((r) => (result = r));
    tick();

    expect(result).toEqual({ duplicateCode: true });
  }));
});
```

### Pattern 6 — Guard / interceptor

Use `TestBed.runInInjectionContext` for the guard function-based API (Angular 14+):

```typescript
import { TestBed } from '@angular/core/testing';
import { canActivateFn } from './permission.guard';
import { CurrentUserService } from '@/libs/shared/services/current-user.service';

describe('permissionGuard', () => {
  it('allows when user has permission', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CurrentUserService, useValue: { hasPermission: () => true } },
      ],
    });

    const route = { data: { permission: 'CATALOG_PRODUCT_LIST' } } as any;

    const result = TestBed.runInInjectionContext(() => canActivateFn(route, {} as any));
    expect(result).toBe(true);
  });

  it('blocks when user lacks permission', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CurrentUserService, useValue: { hasPermission: () => false } },
      ],
    });
    const route = { data: { permission: 'CATALOG_PRODUCT_LIST' } } as any;

    const result = TestBed.runInInjectionContext(() => canActivateFn(route, {} as any));
    expect(result).toBe(false);
  });
});
```

## Run

```bash
# Single module
npm run test -- --watch=false --include='src/libs/catalog/**/*.spec.ts'

# Single file
npm run test -- --watch=false --include='**/product.service.spec.ts'

# Coverage
npm run test -- --watch=false --coverage --collectCoverageFrom='src/libs/catalog/**/*.ts'
```

Coverage target: ≥ 80% line on `services/` + `validators/` + `mappers/` + `pipes/`.

## Rules

### MUST DO
- Inherit principles from `_refs/shared/testing-philosophy.md`
- Use `it.each([...])` for table-driven cases — readable + comprehensive
- Test ONE behaviour per `it()`; if you say "and" in the name, split
- Use `fakeAsync` + `tick()` for RxJS time-based tests, NOT real timers
- Mock HTTP via `HttpClient` spy OR `HttpClientTestingModule` — never hit the network
- Use builders / factories for input objects, not 30-line inline literals

### MUST NOT
- Test private methods directly — test the public method that calls them
- Use real timers (`setTimeout(..., 1000)`) — flaky + slow
- Spy on every method of a service — usually means you're testing a stub of yourself
- Skip the unhappy path — error cases are where bugs live
- Use `xit` / `it.skip` to "fix later" — fix now or delete

## Anti-patterns

- **Snapshot-testing template output for unit tests** — too coarse + brittle; assert on specific facts
- **`<localized text>`** — neither name describes what's verified
- **Mocking the function under test** — meaningless
- **Big setup + tiny assertion** — invert; if setup dominates, you're testing wrong layer (use integration)
- **`expect(...).toEqual(realObject)` with 20 fields** — too brittle; assert key fields with `toMatchObject`
- **Catching errors with `.catch()` and asserting on the caught value** — use `expect(...).rejects.toMatch...`

## Cross-references
- Principles: `_refs/shared/testing-philosophy.md`
- Integration tests: `_refs/angular/test-integration.md`
- E2E tests: `_refs/angular/test-e2e.md`
- Build skill producing testable code: the `sdcorejs-angular` orchestrator — `_refs/angular/write-code/screen-detail.md` for validators / form refinement, `_refs/angular/write-code/init-entity.md` for services
- Verification: `sdcorejs-ship (verify-before-done mode)`
