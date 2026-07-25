# Angular Unit Testing

Use only for `core-ui-angular` or `legacy-core-ui-angular`. For `plain-angular`,
use `_refs/shared/test-generic.md`.

## Scope

Select unit cases from requirements and changed risk. Typical candidates are
pure validators, mappers, pipes, guards, state reducers, service branches, and
component logic that does not require rendering. Test observable outcomes,
errors, and boundary inputs; do not assert private implementation details.

## Existing runner first

Discover the configured Angular test builder and nearby tests. Preserve the
existing Karma, Jest, Vitest, Web Test Runner, or other runner, including its
command, setup files, TestBed helpers, fake timers, and coverage policy. Do not
install or migrate a runner.

## Angular and Core UI boundaries

- Use TestBed only when dependency injection or Angular lifecycle is material.
- Prefer direct construction for truly pure code when the project does so.
- Reuse existing provider/test helpers; do not rebuild application bootstrap.
- Core UI providers, components, and auto IDs are allowed only when present in
  the target path.
- Authorization UI behavior does not replace server/API denial coverage.

## Evidence

Map each case to a requirement or risk. Run the narrowest discovered command
from the correct workspace, then record v2 context/status/evidence. Preserve an
existing project threshold; do not introduce a numeric target.
