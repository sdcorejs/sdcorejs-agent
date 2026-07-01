# Testing Knowledge — Principles (Cross-Track)

> Cross-track testing principles loaded on demand by the `sdcorejs-test` skill
> (and referenced by `sdcorejs-test (tdd mode)`). Not a dispatchable skill — no frontmatter.
> Covers **why / what** (pyramid, mock-vs-real, when-to-write, AAA, naming,
> behaviour-vs-implementation, what-not-to-test); the stack+level refs under
> `_refs/<track>/test-<level>.md` cover the **how** (frameworks, fixtures, runners).

## The test pyramid

```
       ▲
       │  E2E       ← few (5-15 per feature)
       │  ───────       slow, brittle, high-value (smoke real user flow)
       │
       │  Integration ← some (15-40 per module)
       │  ───────────   real DB / real HTTP server / real router, mocked external services
       │
       │  Unit       ← many (50-200 per module)
       │  ────────     pure functions, validators, mappers, single-class behaviour
       └──────────────────────────────────────────────────────►
```

Concrete targets per feature:
- **Unit**: 70% of tests. Run in < 5 ms each. No I/O. Cover branching logic, edge cases, validation rules.
- **Integration**: 25% of tests. Run in < 200 ms each. Hit a real (test) database, real router/HTTP server, real DI container — but mock external 3rd-party services (Resend, Stripe, S3).
- **E2E**: 5% of tests. Run in < 30 s each. Cover the **happy path** of each user-visible feature + 1-2 critical error paths. Use real browser / real backend.

If your pyramid is inverted (heavy E2E, no unit): domain logic is buried in framework code (move it out → testable); tests are documentation not safety net (slow feedback = drift); one flaky E2E blocks the whole CI run.

## What to mock vs hit for real

| Concern | Unit | Integration | E2E |
|---|---|---|---|
| Domain logic / pure function | always real | always real | always real |
| Database | mocked (in-memory or stub) | **REAL** (testcontainers / sqlite in-memory) | **REAL** |
| HTTP server / router | mocked | **REAL** (supertest / NestJS test module) | **REAL** (Cypress / Playwright) |
| External API (Stripe, Resend, S3) | mocked | mocked OR contract-test against sandbox | mocked OR sandbox account |
| Auth / session | stubbed user | real auth flow with test creds | real auth flow with test creds |
| Filesystem / time / random | controlled (fake timers, fs-mock) | controlled | tolerated drift |

**Rule**: Mock things you don'<localized text>'s SQL error won't surface until production.

## When to write tests
1. **Before (TDD)** — failing test first; best for bug fixes (reproduce first), pure logic with clear contracts, refactors proving behaviour unchanged. See `sdcorejs-test (tdd mode)`.
2. **During (test-as-you-build)** — same session as impl, right after each chunk; best for new features where the contract emerges, UI components.
3. **After (test the diff)** — scoped to the diff; acceptable for spike→prod promotion and generated code (the test is the contract for future edits). Anti-pattern: writing tests only after a bug ships — the bug should drive Test #1.

## Arrange-Act-Assert (AAA)
Every test has three separated sections. ONE assert focus per test (multiple `expect()` ok if they check facets of the same outcome). Arrange via factories/builders, not inline literals. Act is ideally one line — if Act is 5 lines you're testing a workflow (use an integration test).

```typescript
it('returns 403 when user lacks PERMISSION_X', async () => {
  // ARRANGE
  const user = userFactory({ permissions: [] });
  const repo = mockRepo();
  // ACT
  const result = await service.doThing(user, request);
  // ASSERT
  expect(result.status).toBe(403);
  expect(repo.save).not.toHaveBeenCalled();
});
```

## Test naming
Name the BEHAVIOUR verified, not the method called.

| ❌ Bad | ✅ Good |
|---|---|
| `it('should work')` | `it('returns 403 when user lacks permission')` |
| `it('calls service.update')` | `it('updates the record and preserves createdAt')` |
| `describe('UserService.update')` | `<localized text>` |

A reader of test output should know what failed without opening the test body.

## Testing behaviour vs implementation
Test BEHAVIOUR (inputs → outputs, observable side effects). Refactoring internals must not break tests. If renaming a private method breaks 12 tests, they're coupled to implementation.

```typescript
// ❌ Implementation-coupled
expect(service._validateInternal).toHaveBeenCalledWith(input);
// ✅ Behaviour
const result = await service.process(input);
expect(result).toMatchObject({ status: 'ok', errors: [] });
```
Exception: gnarly reused private logic → extract to a pure function in its own file and unit-test THAT directly. Don't reflect into privates.

## What does NOT need a test
Type definitions · pure pass-throughs (covered by the layer above) · code copied from a vetted library's docs · auto-generated code (test the generator) · one-off scripts · framework config.

## Coverage targets (informational, not enforced)
Domain (services/validators/mappers) ≥ 80% line / 70% branch · adapters (repos/HTTP clients) ≥ 60% line · UI components ≥ 50% (e2e compensates) · config: don't measure. Coverage is a smell detector, not a goal — 100% with bad assertions is worse than 60% with sharp ones.

## When tests block velocity, fix the SUT
| Symptom | Likely cause | Fix |
|---|---|---|
| Setup is 20 lines | Too many constructor deps | Split the class; inject narrower interfaces |
| Test name says "and" | Function does two things | Split the function |
| Hard to assert outcome | Side effect via internal state | Return the outcome |
| Flaky timer/async | Real timer / unmocked promise | Fake timers; await all promises |
| Brittle to refactor | Coupled to implementation | Test the outer contract |

Tests that hurt expose design problems — fix the SUT, don't suppress the pain.

## Anti-patterns
- "100% coverage" as the goal · snapshot-everything (detects change, not correctness) · tests sharing mutable state · `beforeEach` resetting globals across files · try/catch wrapping `expect()` to ignore failure · sleeping in tests (`setTimeout`) · mocking the code under test · `xit`/`.skip` instead of fixing · one E2E testing 8 features at once.

## Cross-references
- Stack+level HOW: `_refs/<track>/test-<level>.md`
- RED-first discipline: `sdcorejs-test (tdd mode)` plus `_refs/shared/tdd.md`
- Verification: `sdcorejs-ship (verify-before-done mode)` ensures the right tests ran before "done"
