# TDD - Test-Driven Development (SDCoreJS Stack)

> Non-dispatchable reference. Loaded by `sdcorejs-test (tdd mode)` before
> write-code chunks that use RED-first development.

## Purpose
Write the failing test first. Watch it fail. Write minimal code to pass. Refactor. Repeat.

**Iron law:** `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`

This skill knows the Angular / NestJS / Next.js test setup so you spend zero time on
boilerplate and all time on the test contract.

When the thought "I'll write a quick implementation first just to understand the shape"
appears: stop. That is rationalization. Delete any such code and start with the test.

## When to invoke

### When TDD is the chosen approach for a chunk (per `sdcorejs-brainstorming` and `sdcorejs-plan`)
Before implementing each such chunk (service / component / function / handler / pipe / guard), invoke this skill. Once invoked, the RED-first Iron Law is not optional:

1. Write failing test -> verify RED
2. Implement minimal code -> verify GREEN
3. Refactor if needed
4. Write next failing test

### Manual trigger
"use TDD", "write tests first", "test first", "TDD", "red-green-refactor for this change"

### NOT invoked for
- Template-only changes (pure HTML / SCSS, zero logic)
- Configuration files, module declarations, barrel exports (`index.ts`)

## Per-track boilerplate

### Angular Portal - Unit test (service / pipe / validator)

```typescript
// src/libs/<module>/features/<entity>/services/<entity>.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { <EntityService> } from './<entity>.service';

describe('<EntityService> - <behaviour under test>', () => {
  let service: <EntityService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [<EntityService>],
    });
    service = TestBed.inject(<EntityService>);
  });

  it('<expected behaviour described in terms of inputs and outputs>', () => {
    // ARRANGE
    const input = /* minimal valid input */;
    // ACT
    const result = service.<method>(input);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --watch=false --include="src/libs/<module>/**/<entity>.service.spec.ts"
```
Expected: `FAILED - Cannot find module './<entity>.service'`

### Angular Portal - Component test (standalone)

```typescript
// src/libs/<module>/features/<entity>/components/<name>/<name>.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { <NameComponent> } from './<name>.component';

describe('<NameComponent>', () => {
  let fixture: ComponentFixture<<NameComponent>>;
  let component: <NameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [<NameComponent>], // standalone
    }).compileComponents();
    fixture = TestBed.createComponent(<NameComponent>);
    component = fixture.componentInstance;
  });

  it('renders without error', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('<behaviour>', () => {
    // ARRANGE
    component.<input> = /* value */;
    // ACT
    fixture.detectChanges();
    // ASSERT
    const el = fixture.nativeElement.querySelector('<selector>');
    expect(el.<property>).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --watch=false --include="src/libs/<module>/**/<name>.component.spec.ts"
```

### NestJS - Unit test (service)

```typescript
// src/<module>/<entity>/<entity>.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { <EntityService> } from './<entity>.service';

describe('<EntityService>', () => {
  let service: <EntityService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [<EntityService>],
    }).compile();
    service = module.get<<EntityService>>(<EntityService>);
  });

  it('<expected behaviour>', async () => {
    // ARRANGE
    // ACT
    const result = await service.<method>(/* args */);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm run test -- --testPathPattern="<entity>.service.spec.ts" --no-coverage
```
Expected: `FAILED - Cannot find module './<entity>.service'`

### NestJS - Integration test (HTTP with supertest)

```typescript
// test/<entity>/<entity>.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('<Entity> API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /<entity> -> 200', () =>
    request(app.getHttpServer()).get('/<entity>').expect(200));
});
```

Verify RED:
```bash
npm run test:e2e -- --testPathPattern="<entity>.e2e-spec.ts"
```

### Next.js - Unit test (util / hook / server action)

```typescript
// src/lib/<feature>/__tests__/<function>.test.ts
import { <function> } from '../<function>';

describe('<function>', () => {
  it('<expected behaviour>', () => {
    // ARRANGE
    // ACT
    const result = <function>(/* args */);
    // ASSERT
    expect(result).<matcher>;
  });
});
```

Verify RED:
```bash
npm test -- --testPathPattern="<function>.test.ts"
```

### Next.js - Integration test (route handler / server action)

Drive the handler directly with a `Request`; assert on the `Response`. No running server needed. Exercise the real route logic with external I/O (DB, email) mocked at the module boundary.

```typescript
// src/app/api/<route>/__tests__/route.test.ts
import { POST } from '../route';

jest.mock('@/lib/<feature>/service', () => ({
  submit: jest.fn().mockResolvedValue({ id: 'abc' }),
}));

describe('POST /api/<route>', () => {
  it('returns 400 when the payload fails validation', async () => {
    // ARRANGE
    const req = new Request('http://test/api/<route>', {
      method: 'POST',
      body: JSON.stringify({ /* invalid */ }),
    });
    // ACT
    const res = await POST(req);
    // ASSERT
    expect(res.status).toBe(400);
  });
});
```

Verify RED:
```bash
npm test -- --testPathPattern="api/<route>/__tests__/route.test.ts"
```

## RED state - verify for the right reason

A test must fail because the implementation is missing, not because the test is broken.

| Fail message | Interpretation |
|---|---|
| `Cannot find module './<file>'` | Correct RED: file does not exist yet |
| `<fn> is not a function` | Correct RED: export missing |
| `Expected: X, Received: undefined` | Correct RED: logic not implemented |
| `SyntaxError` in test file | Test has a bug: fix the test first |
| `TypeError` in `beforeEach` | Test setup broken: fix setup first |

If RED for the wrong reason: fix the test. Do not proceed to implementation with a broken test; you will have no confidence the GREEN state means anything.

## GREEN - minimum implementation

Write the least code that makes the test pass. No extra logic. No future parameters "just in case". Run the test again: must be GREEN.

If still RED after implementing: re-read the error message carefully; do not guess.

## REFACTOR - clean up without breaking GREEN

After GREEN:
- Extract repeated setup to `beforeEach` or factory helpers
- Rename identifiers for clarity
- Remove `any` types used to make compilation pass
- Run the test again: must still be GREEN

Refactor = same behaviour, cleaner code. New behaviour = new failing test first.

## Anti-patterns

- Writing all tests first, then all implementations. This is test-before masquerading as TDD; there is no per-cycle feedback loop.
- Writing the implementation and adjusting the test to match. You skipped RED; the test proves nothing about correctness.
- Mocking the class under test. You are testing the mock, not the code.
- `it('should work')` test name. Name the actual behaviour: `it('returns 403 when user has no permission')`.
- Giant test file with 20 `it()` blocks sharing mutable state. Split by behaviour, isolate each test's state.

## Cross-references
- `_refs/shared/testing-philosophy.md` - test pyramid, mock vs real, AAA structure, naming rules
- `sdcorejs-test (tdd mode)` - RED-first execution gate
- `sdcorejs-test` - full Angular, NestJS, Next.js test generation and runner reporting
