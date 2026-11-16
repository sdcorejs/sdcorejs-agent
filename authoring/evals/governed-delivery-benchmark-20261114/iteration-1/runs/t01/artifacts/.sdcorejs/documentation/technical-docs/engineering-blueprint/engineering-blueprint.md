---
artifact_id: order-desk-engineering-blueprint
artifact_kind: documentation-asset
change_ref: initialize-order-desk-engineering-blueprint
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-documentation
repository_id: github.com/benchmark-sdcorejs/order-desk
repository_role: standalone
source_revision: 91f78ce774bd079c2489ccc714064b0422b3de8f
app_revision: 91f78ce774bd079c2489ccc714064b0422b3de8f
approval_source: explicit-user-request-for-blueprint-and-AGENTS-link
document_review_performed: false
---

# Order Desk engineering blueprint

This is durable engineering guidance for the existing Order Desk repository. The user authorized this document and its link from `AGENTS.md`, without application or dependency changes. It records the implementation inspected on 2026-11-14; it does not approve a tenant model or future feature work.

## Authority and maintenance

Keep four kinds of statement distinct:

- **Established policy:** the manual policy in [AGENTS.md](../../../../AGENTS.md), explicit current user decisions, and runtime constraints declared in [package.json](../../../../package.json).
- **Observed implementation:** facts from the source and tests listed below. These describe current behavior, including limitations; observation alone does not make every implementation choice a permanent rule.
- **Recommended practice:** guidance for future authorized changes. These recommendations do not authorize a refactor, new dependency, API redesign, or infrastructure installation.
- **Open decision:** a question whose outcome has not been selected. Record the actual decision and its authority when resolved; never replace an open question with an assumed approval.

Preserve the manual policy verbatim: **preserve operator terminology and never log customer secrets**. In conflicts, use the current explicit user instruction and effective repository instructions; report compatibility consequences before changing an external contract. No automatic convention capture or managed instruction synchronization is enabled by this document.

Maintain this blueprint in the same change as affected contracts, boundaries, commands, or decisions. Recheck source and command evidence instead of trusting the verification date indefinitely. Keep the root guidance short and link here rather than copying the blueprint into several files.

## Repository and runtime baseline

| Evidence | Established or observed fact |
| --- | --- |
| [package.json](../../../../package.json) | Private package `order-desk-fixture`; ESM via `type: module`; Node engine `>=24`; three test scripts; no declared dependencies or development dependencies. |
| [README.md](../../../../README.md) | Documents Node 24, npm test commands, no browser UI, and no deployment configuration. |
| [src/order.mjs](../../../../src/order.mjs) | Pure exported order validation and cancellation eligibility functions. |
| [src/server.mjs](../../../../src/server.mjs) | `makeServer()` returns a Node HTTP server; the caller owns listening and shutdown. |
| [test/unit.test.mjs](../../../../test/unit.test.mjs) | Two quantity checks using `node:test` and `node:assert/strict`. |
| [test/integration.test.mjs](../../../../test/integration.test.mjs) | Two direct `canCancel` calls. Despite the script name, these are domain-level tests rather than proof of service wiring. |
| [test/e2e.test.mjs](../../../../test/e2e.test.mjs) | A real HTTP POST against an ephemeral loopback server, followed by shutdown. |

There is no package-manager pin or lockfile in the inspected repository. Use the documented npm scripts; do not infer a package installation step for this dependency-free project. No build, lint, format, typecheck, start, or dev script is declared. `node src/server.mjs` alone does not start a listening service because the module only exports a factory.

## Architecture, ownership, and boundaries

The current flow is:

```text
HTTP client
  -> makeServer() request handler (src/server.mjs)
  -> JSON parsing and extraction of body.quantity
  -> quantity(value) (src/order.mjs)
  -> HTTP status and JSON response
```

The transport module imports the domain module. The domain module imports no transport, database, or framework. There is no persistence, order identifier generation, event bus, frontend, authentication provider, or tenant context. A successful response validates and echoes a quantity; it does not prove that an order was stored.

`canCancel(role, state)` is exported domain logic. It is exercised directly by tests and is not called by `makeServer()`. There is no cancellation endpoint or persisted order state. Treat eligibility and authorization as different responsibilities: accepting a role string in this function does not authenticate an actor or establish tenant membership.

Recommended boundary discipline for future work:

- Keep order invariants deterministic and independent of HTTP request/response objects. Translate transport input and errors at the server boundary.
- Preserve dependency direction from transport to domain. Introduce a separate persistence or external-service boundary only when an authorized feature needs it; do not imply that one exists now.
- Keep server lifetime with the caller, allowing isolated tests and reliable shutdown. Avoid listening or other side effects during module import.
- Make public contract changes explicit: route and method, JSON shape, validation, status codes, error body, authentication, and tenant scope all affect clients. A small diff can still change a trust boundary.
- Do not turn this documentation task into framework migration, API hardening implementation, or deployment setup.

## Current public and domain contracts

These facts are source-backed; only the coverage stated later has been executed.

| Surface | Current behavior |
| --- | --- |
| `quantity(value)` | Accepts integers from 1 through 100 inclusive and returns the same number. Rejects everything else with `RangeError('quantity must be 1..100')`; it does not coerce strings. |
| `canCancel(role, state)` | Returns `true` only for role `operator` and state `draft`; otherwise returns `false`. |
| `POST /orders` with valid JSON quantity | Returns status 201, `content-type: application/json`, and `{ "quantity": <validated number> }`. Additional request fields are not reflected in the response. |
| Parsing or quantity validation failure | The handler's broad catch returns status 400 with no error body. It also catches other exceptions inside that block; do not describe this as a structured error taxonomy. |
| Any other method or raw request URL | Returns status 404 with no body. Matching uses `req.url === '/orders'`, so query strings and a trailing slash do not match the current route. |

The handler buffers request data into a string, parses it at request end, and has no explicit body-size limit or content-type enforcement. There is no authentication or tenant authorization on the route. These are observed gaps, not evidence of production readiness or accepted security design. No CORS, retry, pagination, persistence, or idempotency guarantees are established.

## Coding conventions

The source consistently uses `.mjs`, ESM imports and named exports, explicit relative import extensions, `node:` imports for built-ins, camelCase function names, single-quoted strings, and semicolons. These are **observed local patterns**, not evidence of a separately reviewed formatting standard. Keep adjacent style consistent during focused edits. The current one-line formatting is not a requirement to compress future code; prefer readable control flow when editing substantive logic.

Recommended practice:

- Use precise domain vocabulary: `operator`, `draft`, `submitted`, `quantity`, and `orders`. Do not silently substitute terms such as administrator or customer for operator.
- Reuse `quantity` as the single validation rule rather than duplicating the 1..100 check across transport paths. Preserve exact public behavior until an authorized contract change replaces it.
- Keep names descriptive, exported surfaces small, and functions focused. Add comments for non-obvious constraints or decisions rather than narrating syntax.
- Keep pure logic free of global state and uncontrolled time/randomness. Await asynchronous work and make resource teardown explicit.
- Treat request content as untrusted data. Never log customer secrets, credentials, authorization headers, cookies, or raw secret-bearing payloads. Synthetic examples belong in tests and docs; real customer data does not.
- Prefer existing Node facilities. A new dependency, formatter, framework, or package-manager change needs a concrete reason and its own authorized scope; none was introduced here.

## Testing policy: observable behavior and real boundaries

Choose tests from the requirement or failure risk, then choose the smallest layer that proves it. Test inputs, outputs, HTTP responses, and other externally observable effects. Do not use private state, incidental call order, or a coverage percentage as a substitute for behavioral evidence. The test pyramid is a cost guide, not a quota.

### Unit tests

Use `node:test` and `node:assert/strict` for pure rules. Keep them deterministic and independent of sockets or external services. Name the behavior being proved and use explicit assertions.

Existing coverage proves `quantity(2) === 2` and rejection of zero. Future authorized changes to validation should consider both bounds, out-of-range values, fractions, strings, null/missing values, and non-finite numbers. Existing cancellation checks prove operator/draft allowed and operator/submitted denied; other roles and states are not currently tested. Add meaningful cases for a changed contract, not tests that repeat formatting or implementation structure.

### Integration tests

Integration evidence should exercise collaboration across an owned boundary, such as real request parsing plus validation plus response mapping. Use real collaborators when their interaction is the behavior under test; mock only external dependencies the project does not own.

The current `test:integration` script has two pure predicate checks. Keep the command name accurate when reporting results, but do not claim those checks establish a real service, repository, database, or tenant boundary. If an integration layer is introduced, add tests for its actual wiring and error translation. No database fixture or third-party service is presently required or configured.

### E2E tests and applicability

**E2E follows observable behavior; exceptions require reasons.** For Order Desk today, the observable application boundary is HTTP. A browser is not required to establish API E2E behavior. Use the real server, real validator, and HTTP client; do not replace the endpoint being tested with a mock.

| Surface | E2E disposition and rationale |
| --- | --- |
| `POST /orders` | Applicable: externally visible API behavior. Existing E2E proves one valid quantity produces a 201 response and matching JSON. |
| HTTP invalid-input and route behavior | Applicable but not currently covered by E2E. Malformed JSON, rejected quantities, and unmatched routes/methods are source observations only. Add cases when implementing or changing these contracts; record any deferral and its residual risk. |
| `quantity` as an internal function | Direct unit evidence is primary; the HTTP success test also exercises it through the real boundary. No separate function-only “E2E” suite is needed. |
| `canCancel` | No externally reachable cancellation journey exists. Direct domain tests are appropriate now; re-evaluate E2E when an API or UI exposes cancellation. This is not an exemption for a future cancellation endpoint. |
| Browser UI | Not applicable because the repository has no browser UI. Re-evaluate if one is added. |
| Documentation-only change | No new runtime scenario required when behavior is unchanged; check accuracy, links, scope, and existing commands when needed. Existing suites were run for this initialization at the user's request. |

Record every E2E exception or deferral with the exact behavior, reason, alternative evidence, remaining risk, responsible maintainer or an explicit unassigned status, and revisit trigger. Record approval only if it actually occurred. Distinguish **passed**, **failed**, **not run**, and **not applicable**; a blocked runner or missing scenario is never a pass. “No browser” is not a reason to skip HTTP E2E.

Follow the existing HTTP test's isolation pattern: listen on port 0 at `127.0.0.1`, await the listening event, use synthetic requests, and close the server with teardown. Do not use sleeps, shared fixed ports, live customer endpoints, or credentials. Avoid broad retries and silent skips that conceal flaky behavior. New network services, browsers, or packages are outside the current test setup.

## Tenant authorization: unresolved decision

**D-TENANT-001 — open; no model selected or approved.** The user identified future API tenant authorization as necessary and explicitly left the model undecided. The current API has no tenant field, actor context, membership lookup, authentication, or authorization enforcement. The cancellation role check does not supply any of these.

Before tenant-sensitive implementation, the decision must establish:

- How an authenticated actor is obtained and which source is trusted for tenant membership.
- The relationship between operators, tenants, orders, and roles; whether cross-tenant access exists and who can exercise it.
- Where tenant context enters, how it is validated, and how every affected action and data access is scoped.
- The response contract for missing authentication, denied membership, and inaccessible resources, including information-disclosure behavior.
- Any persistence/isolation strategy, if persistence is introduced, and migration/compatibility implications for clients.
- Positive and negative evidence, including cross-tenant attempts, forged or missing context, and all exposed actions.

No header name, JWT claim, default tenant, ownership column, database strategy, authorization provider, or privileged bypass is chosen here. Decision ownership is not yet assigned; resolution requires the project's authorized decision maker. Record the chosen model, rationale, tradeoffs, authority reference, affected contracts, and required tests when it is actually decided. This open item does not block the current documentation work and does not authorize implementation.

## Documentation and change discipline

Keep `README.md` as the concise project entry point and preserve the manual policy in `AGENTS.md`. This blueprint owns the engineering explanation; source and tests remain authoritative for current behavior. Use repository-relative links and exact command, symbol, role, state, route, and field names.

For an authorized behavior change, update the relevant API/domain contract, record unresolved choices, and connect test evidence to the behavior changed. Separate observed facts from proposed improvements and selected decisions. Prefer short rationales and meaningful examples over duplicate comments or speculative guarantees. Keep diagnostic logs and transient evidence outside durable guidance; never store secrets or machine-specific paths in the blueprint.

Review changes for domain/transport separation, naming and vocabulary, validation and error behavior, resource cleanup, and affected tests. Authorization, tenant scope, and public contract changes warrant explicit review even if small. Explain skipped checks and known gaps. Preserve unrelated work; do not automatically stage, commit, install, deploy, or mutate dependencies as a documentation side effect.

No CI, deployment, production observability, operational runbook, performance budget, or compliance process is established by this repository. Any such addition needs its own requirements and authorized scope. Request-size handling and error classification are useful future design questions; this blueprint records their absence without selecting a policy or changing code.

## Available commands and verified baseline

Run commands from the repository root. The existing scripts require no package installation and select individual files, so `npm test` alone does not run the other two suites.

| Command | Actual script / purpose | Observed on 2026-11-14 |
| --- | --- | --- |
| `node --version` | Runtime identity | `v24.22.1`, satisfying Node `>=24`. |
| `npm --version` | Command runner identity | `11.9.0`. |
| `npm test` | `node --test test/unit.test.mjs` | Exit 0; 2 passed, 0 failed, 0 skipped. |
| `npm run test:integration` | `node --test test/integration.test.mjs` | Exit 0; 2 passed, 0 failed, 0 skipped; domain-level assertions as described above. |
| `npm run test:e2e` | `node --test test/e2e.test.mjs` | Exit 0; 1 passed, 0 failed, 0 skipped; real loopback HTTP. |

For documentation changes, also inspect the diff, run `git diff --check`, validate local links, and confirm that protected source/tests/manifests were not changed. There is no configured documentation validator, linter, typechecker, build command, coverage threshold, browser suite, or deployment check to claim as passed. These five passing tests are a baseline, not proof of complete boundary, security, or tenant coverage.
