Created the [engineering blueprint](../target/.sdcorejs/documentation/technical-docs/engineering-blueprint/engineering-blueprint.md) and linked it from [AGENTS.md](../target/AGENTS.md), preserving the manual policy verbatim. Application code, tests, and dependencies are unchanged.

The blueprint covers conventions, architecture, HTTP/domain contracts, testing, documentation, security constraints, and maintenance. Tenant authorization remains explicitly unresolved; no model or approval was invented. E2E applicability follows observable behavior, with reasons and revisit triggers for exceptions.

Verified: 2 unit tests, 2 tests in the integration script, and 1 real HTTP E2E test pass. The integration script currently contains domain-level checks, not integration-boundary evidence. Local links, changed-file scope, manual-policy preservation, and whitespace checks pass. No build, lint, typecheck, or browser suite is configured.

Detailed commands, results, references, artifact hashes, and limitations are recorded in [trace.json](trace.json); raw verification output is retained alongside it.
