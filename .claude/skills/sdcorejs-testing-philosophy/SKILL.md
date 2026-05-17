---
name: sdcorejs-testing-philosophy
description: Cross-track testing principles for SDCoreJS projects. Defines the test pyramid (unit / integration / e2e ratios), what to mock vs hit for real, the Arrange-Act-Assert structure, when to write tests (before / during / after), how to name them, and the difference between testing behaviour and testing implementation. Stack-specific skills (`testing/e2e/<stack>.md`, `testing/integration/<stack>.md`, `testing/unit/<stack>.md`) reference this skill for the WHY; they cover the HOW (frameworks, fixtures, runners). Triggers - "what should I test", "test strategy", "tôi nên test cái gì", "test pyramid", "viết test trước hay sau", "mock vs real database", "test naming convention", or invocation by any stack-specific test skill that needs the principles. Bilingual (VI/EN).
allowed-tools: Read
---

# Testing — Principles (Cross-Track)

## Purpose
Stack-specific testing skills (Cypress / Playwright / Jest / supertest / testcontainers) cover **how** to write tests. This skill covers **why and what** — the principles that apply equally to angular-portal, nestjs, nextjs. Read this once; the stack-specific skills will reference it.

## When invoked
- A stack-specific test skill is about to dispatch and the agent wants principle context first
- User asks "what should I test", "test pyramid", "viết test cho cái gì", "tôi có nên test private method"
- During `50-review-code` when the question is "are these the right tests" not "are these tests well-written"

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

If your pyramid is inverted (heavy E2E, no unit), it means:
- Your domain logic is buried in framework code (move it out → testable)
- Your tests are documentation, not safety net (slow feedback = drift)
- One flaky E2E blocks the whole CI run

## What to mock vs hit for real

| Concern | Unit | Integration | E2E |
|---|---|---|---|
| Domain logic / pure function | always real | always real | always real |
| Database | mocked (in-memory or stub) | **REAL** (testcontainers / sqlite in-memory) | **REAL** |
| HTTP server / router | mocked | **REAL** (supertest / NestJS test module) | **REAL** (Cypress / Playwright) |
| External API (Stripe, Resend, S3) | mocked | mocked OR contract-test against sandbox | mocked OR sandbox account |
| Auth / session | stubbed user | real auth flow with test creds | real auth flow with test creds |
| Filesystem / time / random | controlled (jest.useFakeTimers, fs-mock) | controlled | tolerated drift |

**Rule**: Mock things you don't own; integrate things you do. If integration tests mock your own DB, they prove nothing — the SQL syntax error from a migration won't surface until production.

## When to write tests

Three valid moments, in order of preference:

### 1. Before code (TDD)
Write a failing test that describes desired behaviour, watch it fail, write minimum code to pass, refactor. Best for:
- Bug fixes — write the test that reproduces the bug first; it must fail
- Pure logic with clear contracts (validators, mappers, calculators)
- Refactors where you need to prove behaviour didn't change

Cost: requires you to know the contract upfront. Skip if you're exploring.

### 2. During code (test-as-you-build)
Write the test in the same session as the implementation, right after each chunk. Best for:
- New features where the contract emerges from building
- UI components — write the spec after the structure is clear, before you ship

Cost: easy to skip tests "for later"; later never comes.

### 3. After code (test the diff)
Write tests after the implementation lands, scoped to the diff. Acceptable for:
- Spike code being promoted to production
- Generated code (this agent writes; user reviews; test is the contract for future edits)

Anti-pattern: writing tests after a bug ships. The bug should drive Test #1, not retrospective coverage.

## Arrange-Act-Assert (AAA)

Every test has three clearly-separated sections. If they blend, the test is unreadable.

```typescript
it('returns 403 when user lacks PERMISSION_X', async () => {
  // ARRANGE — set up world
  const user = userFactory({ permissions: [] });
  const repo = mockRepo();

  // ACT — exercise the behaviour
  const result = await service.doThing(user, request);

  // ASSERT — check outcome
  expect(result.status).toBe(403);
  expect(repo.save).not.toHaveBeenCalled();
});
```

Rules:
- ONE assert focus per test. Multiple `expect()` is fine if they all check facets of the same outcome; multiple unrelated asserts = split into multiple tests.
- Arrange via factories / builders, not inline literals — readable + reusable.
- Act is ONE line ideally. If Act is 5 lines, you're testing a workflow; consider integration test.

## Test naming

The name describes the BEHAVIOUR being verified, not the method being called.

| ❌ Bad | ✅ Good |
|---|---|
| `it('should work', …)` | `it('returns 403 when user lacks permission', …)` |
| `it('calls service.update', …)` | `it('updates the record and preserves createdAt', …)` |
| `it('test 1', …)` | `it('rejects negative discount values', …)` |
| `describe('UserService.update', …)` | `describe('UserService — when caller is not owner', …)` |

A reader of test output should know what failed without opening the test body.

## Testing behaviour vs implementation

**Behaviour**: what the code DOES from a caller's perspective. Inputs → outputs, side effects on observable state.

**Implementation**: how the code does it internally — private methods, internal state shape, ordering of internal calls.

Test BEHAVIOUR. Refactoring internals should not break tests. If you have to update 12 tests after renaming a private method, your tests are coupled to implementation.

```typescript
// ❌ Implementation-coupled
expect(service._validateInternal).toHaveBeenCalledWith(input);
expect(service._cache.has('key')).toBe(true);

// ✅ Behaviour
const result = await service.process(input);
expect(result).toMatchObject({ status: 'ok', errors: [] });
expect(await service.process(input)).toEqual(result); // cache effect, observed via behaviour
```

Exception: if a private method has gnarly logic that's reused, extract it to a pure function in its own file and unit-test THAT directly. Don't test private methods through reflection.

## What does NOT need a test

- Type definitions (the type system tests them)
- Pure pass-throughs (`getUser() { return this.repo.findById(id) }`) — covered by the layer above
- Code copied verbatim from docs of a vetted library (you're not testing the library)
- Auto-generated code (test the generator, not the output)
- One-off scripts (`scripts/migrate-prices.ts`) — manual smoke is fine; running it on prod IS the test
- Framework configuration (`tsconfig.json`, `tailwind.config.ts`)

## Coverage targets (informational, not enforced)

- Domain layer (services, validators, mappers): aim for ≥ 80% line + 70% branch coverage
- Adapters (repositories, HTTP clients): aim for ≥ 60% line — most error paths tested at integration
- UI components: aim for ≥ 50% line — heavy E2E presence compensates
- Configuration: don't measure

Coverage is a smell detector, not a goal. 100% coverage with bad assertions is worse than 60% with sharp ones.

## When tests block velocity, fix the SUT (System Under Test)

If you're writing painful tests, the test is honest feedback. Reactions:

| Symptom | Likely cause | Fix |
|---|---|---|
| Test setup is 20 lines | Too many dependencies in constructor | Split the class; inject narrower interfaces |
| Test name says "and" | Function does two things | Split the function |
| Hard to assert outcome | Side effect via internal state | Return the outcome from the function |
| Flaky timer / async | Real timer / unmocked promise | `jest.useFakeTimers()`; await all promises explicitly |
| Brittle to refactor | Coupled to implementation | Test the outer contract, not internals |

Tests that hurt expose design problems. Don't suppress the pain — fix the SUT.

## Anti-patterns

- **"100% coverage" as the goal** — incentivises bad tests
- **Snapshot tests on everything** — they detect change, not correctness; snapshot is a regression net, not a spec
- **Tests that share mutable state** — pass independently, fail together (or vice versa)
- **`beforeEach` that resets globals across files** — symptom of leaky globals; fix the leak
- **Try/catch wrapping `expect()` to "ignore" failure** — silences real bugs
- **Sleeping in tests** (`await new Promise(r => setTimeout(r, 1000))`) — use fake timers or proper await
- **Mocking your own code** — if you mock the function under test, the test is meaningless
- **Skipping the failing test with `xit` / `it.skip` instead of fixing it** — turns into permanent noise
- **Single E2E that tests 8 features at once** — when it fails, you don't know which feature broke

## Cross-references
- E2E patterns per stack: `testing/e2e/<stack>.md`
- Integration patterns per stack: `testing/integration/<stack>.md`
- Unit patterns per stack: `testing/unit/<stack>.md`
- TDD discipline: `superpowers:test-driven-development`
- Verification: `orchestration/verify-before-done` ensures the right tests ran before "done"
