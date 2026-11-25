# Before writing code

The implementation owner applies this part of sdcorejs-simplify automatically
before the first authorized production source edit, including small fixes and
delegated work. Revisit it when the responsibility changes. Answer ordinary
read-only questions directly. For a requested runtime check in a read-only
review, exercise the public caller and report its actual result. Continue
within the original task's scope. Planning and docs/test-only changes stay
with their owners.

1. Trace the requested behavior from a real entry point. Read the relevant
   implementations, callers, exports and tests, including connected code outside
   the diff. Search by responsibility and input/output, regardless of names such
   as helper, common, service, component or base. For a small edit, follow only
   the affected path.
2. Choose the smallest complete change. First check whether existing behavior
   already solves it. Prefer a compatible project symbol or convention, then
   the standard library or platform, then a compatible installed dependency.
   Compare error behavior, side effects, ordering and boundary inputs before
   reusing anything. Keep simple logic inline when extraction buys nothing.
3. Put new logic with its narrowest actual owner. Share a rule when its callers
   must change together. Introduce a base only for an established shared
   invariant or lifecycle. Respect dependency direction, public imports and
   framework boundaries. Keep lookalikes separate when their contracts differ.
   For applicable stacks, follow [frontend placement](../shared/frontend-architecture.md#4-reuse-decision-hierarchy)
   and [SDCoreJS utilities](../shared/sdcorejs-utils.md). Propose any move beyond the authorized scope.
4. Choose readable code. Preserve validation, error handling, accessibility
   and existing regression assertions and cases. Inspect the test diff for
   dropped cases or weakened expectations. Update an expectation only when
   the requested behavior changes it. Before refactoring weakly covered
   behavior, capture it on the old code with the test owner.
5. Exercise the public caller with inputs that would expose a plausible
   mistake. Run the affected old and new cases together on the edited code.
   Read the runner's passing case IDs, counts and exit status, or compare a
   direct probe's actual result with its expectation before reporting success.

When the choice matters, include the candidate symbol/path and the concrete
reason for reusing, keeping local or creating it in the existing implementation
handoff. An unchanged implementation with a verified caller is a valid outcome.
