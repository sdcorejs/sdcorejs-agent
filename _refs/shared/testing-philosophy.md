# Testing Knowledge - Principles (Cross-Track)

> Cross-track testing principles loaded on demand by the `sdcorejs-test` skill
> and by TDD mode. Not a dispatchable skill; no frontmatter.

## Layer Selection

The test pyramid is a useful cost heuristic, not a universal quota. Prefer the
smallest layer that proves each requirement or risk, with enough integration
and e2e evidence for real boundaries and critical journeys.

| Layer | Purpose | Typical scope |
|---|---|---|
| Unit | Branching logic, validators, mappers, single-class behavior | No network, no real DB, no browser |
| Integration | DI, router, real HTTP server, repository or DB boundaries | Real framework wiring, external services mocked |
| E2E | Critical user-visible journeys | Real browser or API flow against a guarded environment |

Do not invert the pyramid. If most safety comes from slow e2e tests, domain logic is probably buried too deeply in framework code.

## What To Mock

Mock the things the project does not own: third-party APIs, payment providers, email/SMS, object storage, analytics, and unstable clocks/randomness. Keep the behavior under test real.

Use real collaborators when they are the contract being verified:

- Real validators/mappers/domain logic in all layers.
- Real router/DI/container for integration tests.
- Real database only for integration/e2e when the target project already supports a test database strategy.
- Real browser for critical UI flows only.

Never mock the function, component, service, handler, or endpoint being tested.

## When To Write Tests

1. Before implementation for TDD, bug reproduction, refactors that must preserve behavior, and critical business logic.
2. During implementation for UI/components and workflows where the contract emerges in small chunks.
3. After implementation for generated code or spike promotion, scoped to the diff and tied to observable behavior.

Backfilled tests are acceptable only when they become the contract for future edits.

## Arrange Act Assert

Every test should have a clear setup, one meaningful action, and behavior-focused assertions. Multiple assertions are fine when they describe facets of the same result.

```typescript
it('returns 403 when user lacks permission', async () => {
  const user = userFactory({ permissions: [] });
  const repo = mockRepo();

  const result = await service.doThing(user, request);

  expect(result.status).toBe(403);
  expect(repo.save).not.toHaveBeenCalled();
});
```

Use factories/builders for bulky inputs. If the action section needs many unrelated steps, use an integration or e2e test and split scenarios.

## Test Naming

Name the behavior, not the method. A failing test name should tell the reader what user or business contract broke.

| Weak | Strong |
|---|---|
| `it('should work')` | `it('returns 403 when user lacks permission')` |
| `it('calls update')` | `it('updates the record and preserves createdAt')` |
| `describe('UserService.update')` | `describe('updating a user profile')` |

## Behavior Over Implementation

Test inputs, outputs, user-visible UI, API responses, persisted state, emitted events, or stable public callbacks. Avoid private methods, internal state, class names, and incidental call order unless they are the only stable contract.

If reused private logic deserves direct tests, extract it to a pure function and test that function.

## Coverage

Coverage is a signal, not a goal. Current coverage evidence must be generated in the current turn or clearly tied to the current `HEAD`/diff.

Coverage reports should answer:

- Which changed files or requirements are covered.
- Which branches or user paths are still untested.
- Whether missing coverage is acceptable, deferred, or blocking.

Do not inflate coverage by adding weak assertions, deleting branches from measurement, or testing implementation details.
Coverage percentage is supporting evidence, not an independent Definition of
Done. Use mutation testing only when the project already configures it or the
user explicitly requests and approves it. Apply accessibility to user-visible
UI; assign a performance pass/fail only when a requirement or project budget
defines the threshold. Do not add security/performance/accessibility scenarios
merely to fill a matrix.

## Snapshots

Use snapshots only for small, stable, intentional output where a human can review the diff meaningfully. Avoid snapshots for broad rendered HTML, large API payloads, localized UI pages, timestamps, generated IDs, and data whose order may change.

Prefer explicit semantic assertions.

## Async And Flakiness

Do not sleep. Use fake timers, runner-native waits, awaited promises, `findBy...`, `waitFor`, `waitForElementToBeRemoved`, `fixture.whenStable`, `waitForResponse`, or equivalent project helpers.

Treat flaky tests as defects. Document environment-related flakiness as evidence, but do not hide real uncertainty with broad retries, longer timeouts, or skipped tests.

## Test Integrity

Never weaken the safety net to get green output:

- Do not add `.skip`, `xit`, `test.skip`, or broad focus/only markers.
- Do not loosen assertions without explaining the changed contract.
- Do not delete failing coverage unless the requirement was removed.
- Do not rewrite a failing test to match a bug.
- Do not commit runner artifacts by default.

If a test fails because production behavior is wrong, hand off to `sdcorejs-debug`.

## What Usually Does Not Need Direct Tests

Type definitions, pure pass-throughs covered by a higher layer, code copied from vetted library docs, generated code where the generator is tested, one-off scripts, and framework configuration normally do not need direct tests.

## Cross-references

- Stack and level HOW refs: `_refs/<track>/test-<level>.md`
- Command discovery: `_refs/shared/test-command-discovery.md`
- Environment guard: `_refs/shared/test-environment-guard.md`
- Evidence schema: `_refs/shared/test-context.md`
- Generic fallback: `_refs/shared/test-generic.md`
- RED-first discipline: `_refs/shared/tdd.md`
- Verification: `sdcorejs-ship (verify-before-done mode)`
