# Code Documentation Reference

Internal reference loaded by `sdcorejs-documentation` in `code-documentation`
mode. This file is not a dispatchable skill.

## Purpose

Document source code in one place. This capability covers both:

- public contract documentation: Python docstrings, JSDoc/TSDoc, and the
  language's conventional documentation comment style
- implementation comments: concise comments that explain non-obvious why,
  ordering, edge cases, workarounds, or runtime constraints

Use one mode, but keep the output type clear. Public contract docs explain what
callers can rely on. Implementation comments explain why the implementation is
written that way.

Standalone user guides and technical Markdown docs still belong to
`write-user-guide` and `write-technical-doc`.

## How this reference is used

Load this reference when the user asks for any source-code documentation:

- code documentation
- document code
- add comments
- comment code
- inline comments
- implementation comments
- docstring
- doc comment
- documentation comments
- JSDoc
- TSDoc
- document functions/classes/components/services/DTOs/route handlers/APIs
- localized equivalents

Default behavior:

1. Detect whether the request is asking for public contract docs,
   implementation comments, or both.
2. Detect language/framework from filenames, syntax, decorators, imports, tests,
   and surrounding conventions.
3. Update stale or incomplete existing code documentation instead of adding
   duplicates.
4. Add missing code documentation only where it improves maintainability or
   public API clarity.
5. Preserve executable behavior exactly.

Track-skill automatic behavior:

- Angular, NestJS, and Next.js track skills call this reference automatically
  whenever they create or modify source code.
- Do not ask for approval before adding or updating source-code documentation.
- Apply the maintainability-focused default: useful public/exported contract
  docs plus concise implementation comments for genuinely non-obvious behavior.
- Do not add comments merely to satisfy a quota.

## Intent routing inside this mode

| User intent | Apply |
|---|---|
| docstring, doc comment, JSDoc, TSDoc, public API docs, documented functions/classes/components/services/DTOs/route handlers | Public contract docs |
| add comments, comment code, explain logic with comments, inline comments, implementation comments | Implementation comments |
| document code, code documentation, full comments, broad request after code generation | Balanced code documentation: public contracts where useful plus implementation comments for non-obvious logic |

If the user explicitly asks for multiple outputs, keep them in separate
sections in the report.

## Common rules

### MUST DO

- Use evidence from code, tests, configuration, decorators, filenames, existing
  docs, type annotations, and surrounding context.
- Prefer concise, accurate, maintainable documentation over verbose
  documentation.
- Match existing project tone, terminology, formatting, and code documentation
  style.
- Preserve executable code unless the user explicitly asks for code changes.
- Update stale or wrong existing documentation instead of adding duplicates.
- Keep code identifiers, commands, environment variables, config keys, API
  paths, UI labels, class names, method names, and file names exact.
- Use placeholders such as `<API_KEY>`, `<PROJECT_ID>`, `<USER_ID>`, or
  `example.com` for examples.
- Mark destructive or irreversible actions clearly when the documented contract
  exposes them.

### MUST NOT

- Invent behavior, architecture, workflows, API fields, commands, roles,
  screens, infrastructure, or business rules.
- Rename symbols.
- Reorder decorators.
- Change imports unless explicitly required by a documentation tool and the
  user asked for that tool.
- Add comments that merely repeat obvious code.
- Include real secrets, tokens, passwords, private keys, production
  credentials, or sensitive internal values.
- Add TODOs unless uncertainty must be surfaced and local style allows TODOs.

## Documentation levels

These levels are available for direct or explicit user requests. Track skills
use the automatic maintainability-focused default unless the current request
explicitly asks for a stronger level.

### Level: `skip`

Only valid for a direct `code-documentation` request. Track skills must not use
this level to bypass automatic source-code documentation after modifying source
code.

### Level: `simple`

Recommended default. Add only lightweight documentation where it pays off:

- one-line public contract docs for important exported/public APIs when the
  contract is not obvious from the signature
- `// why:` or equivalent implementation comments for genuinely non-obvious
  implementation reasons
- no blanket documentation of every private helper

### Level: `medium`

Apply `simple`, plus:

- public contract docs for exported/public classes, functions, methods,
  components, services, DTOs, route handlers, and public APIs
- implementation comments for non-obvious branching, side effects, ordering,
  mutation, caching, retries, transactions, or workarounds
- useful `@param`, `@returns`, `@throws`, or `Args`/`Returns` sections when
  they add information beyond the signature

### Level: `full`

Apply `medium`, plus:

- broader public contract docs for a module's public surface
- implementation comments for risky or cross-file behavior
- a proposed `WHY-X.md` note when the rationale spans 3 or more files and would
  become noisy inline

Ask before writing the companion note:

```text
Write a short WHY note for this cross-file decision?

1. Write WHY-X.md - capture the rationale in .sdcorejs/docs. [Recommended when the rationale spans files]
2. Skip WHY-X.md - keep only inline comments.

Reply with `1` or `2`.
```

## Public contract documentation rules

Document what callers, templates, framework runtime, tests, or downstream
modules may rely on.

Use for:

- modules
- classes
- functions and methods
- components
- props
- inputs and outputs
- DTOs
- route handlers
- services
- exported APIs

Rules:

- Document the public contract, not every implementation step.
- Do not restate obvious TypeScript or Python types.
- Mention constraints, units, defaults, null/undefined behavior, side effects,
  caching, authorization requirements, thrown errors, emitted events, mutation,
  I/O, network calls, and database calls when relevant and visible.
- Use one-line docs for simple APIs.
- Use multi-line docs only when parameters, return values, exceptions, side
  effects, examples, lifecycle behavior, or framework contracts need
  explanation.
- For ambiguous code, write conservative documentation instead of guessing.

## Implementation comment rules

Explain why the implementation is written a certain way.

Use for:

- non-obvious ordering constraints
- branches that exist for edge cases
- lifecycle timing
- cache, fetch, transaction, mutation, retry, idempotency, or cleanup ordering
- framework, browser, backend, or integration workarounds
- risky cross-file behavior

Rules:

- Explain why, not what.
- Keep comments close to the code they explain.
- Prefer `// why:` for TypeScript/JavaScript when local style allows it.
- In Python, use concise `#` comments above the relevant line/block.
- Avoid implementation comments that duplicate public contract docs.

Examples:

```ts
// why: the API treats a missing filter differently from an empty string
const normalizedFilter = filter?.trim() || undefined;
```

```python
# Keep the timezone conversion before grouping so daily totals use local dates.
local_time = event_time.astimezone(report_timezone)
```

## TypeScript and JavaScript public contract style

Use JSDoc/TSDoc-style block comments:

```ts
/** Summary sentence. */
```

Use tags only when they add information beyond the signature:

- `@param`
- `@returns`
- `@throws`
- `@typeParam`
- `@deprecated`

Rules:

- Do not use Python triple-quoted strings in TypeScript or JavaScript.
- Avoid redundant type declarations.
- For boolean values, prefer wording like "Whether ...".
- Use `@typeParam` only when a generic has non-obvious meaning.
- For async functions, document what the Promise resolves to and important
  rejection/exception cases; do not add `@async`.
- Do not duplicate Swagger, OpenAPI, Compodoc, TypeDoc, or decorator metadata
  verbatim.

Example:

```ts
/**
 * Creates a user account.
 *
 * @param dto - Validated account creation payload.
 * @returns The created user summary.
 * @throws ConflictException When the email address is already registered.
 */
async createUser(dto: CreateUserDto): Promise<UserSummaryDto> {
  return this.users.create(dto);
}
```

## Python public contract style

Use Python docstrings with triple double quotes.

Placement:

- Module docstrings go at the top of the file.
- Class/function/method docstrings go immediately after the definition line.
- Default to Google-style docstrings unless the surrounding project uses NumPy
  or Sphinx/reStructuredText style.

Document:

- summary
- `Args` when parameters need explanation
- `Returns` when the function returns a meaningful value
- `Yields` for generators
- `Raises` for explicit or important exceptions
- side effects such as file I/O, network calls, database writes, mutation,
  logging, or global state changes

Rules:

- Do not add a `Returns` section for functions returning only `None` unless it
  clarifies behavior or local style requires it.
- For typed Python code, do not redundantly restate obvious types.
- For tuple returns, document element order.
- For optional returns, document when `None` is returned.
- For async functions, document awaited I/O and exception behavior where
  relevant.
- For generators, use `Yields`, not `Returns`.
- For context managers, document the yielded resource and cleanup behavior.

Example:

```python
def find_user(email: str) -> User | None:
    """Find a user by email address.

    Args:
        email: Email address to search for.

    Returns:
        The matching user, or None if no user exists for the email.
    """
```

## Angular rules

Apply when code contains Angular decorators, signals, templates, lifecycle
hooks, services, or filenames such as `.component.ts`, `.directive.ts`,
`.pipe.ts`, or `.service.ts`.

Public contract docs:

- Components: document UI responsibility and parent/child contract.
- Inputs: document semantic meaning, required/default status, aliases,
  transforms/coercion, valid ranges, units, and null/undefined behavior.
- Outputs: document when the event emits and payload meaning.
- Services: document business operation, Observable/Promise behavior, HTTP
  calls, caching, mutation, and errors.
- Directives: document host behavior and selector-level effect.
- Pipes: document transformation, locale, timezone, units, invalid input
  behavior, and purity assumptions.

Implementation comments:

- lifecycle timing that cannot move to a simpler hook
- signal, computed, or effect ordering
- RxJS subscription cleanup
- direct DOM access
- accessibility or third-party UI workarounds
- reactive form edge cases

Examples:

```ts
/** Summary values to render. Must already include tax and discounts. */
summary = input.required<CheckoutSummary>();

/** Emits when the user confirms the selected billing address. */
addressConfirmed = output<BillingAddress>();
```

## NestJS rules

Apply when code contains NestJS decorators, DTOs, controllers, providers,
guards, pipes, interceptors, filters, modules, or matching filenames.

Public contract docs:

- Controllers: document route group responsibility without repeating class name.
- Route handlers: document HTTP intent, body, params, query, headers,
  auth/roles, response shape, status, streams, direct response handling, and
  important visible exceptions.
- DTOs: document field meaning, validation semantics, accepted values, units,
  defaults, and API-facing constraints.
- Providers/services: document business responsibility and visible side
  effects.
- Guards/pipes/interceptors/filters: document decision, transformation,
  wrapping, caught exceptions, or public response shape.

Implementation comments:

- guard authorization decisions
- custom pipe transformation
- interceptor wrapping/caching/serialization
- exception filter mapping
- transaction boundaries
- idempotency, retries, queue/job side effects
- direct response handling with `@Res()` / `@Response()`

## Next.js rules

Apply when code contains App Router or Pages Router patterns such as `page.tsx`,
`layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`,
`generateMetadata`, `generateStaticParams`, data fetching helpers,
`'use client'`, `'use server'`, Server Components, Client Components, Server
Actions, Route Handlers, or Next.js fetch caching options.

Public contract docs:

- Server Components: document data source, auth, cookies/headers, secrets,
  cache/revalidation, and serializable props passed to Client Components.
- Client Components: document why client-side execution is required when not
  obvious, local state, event handlers, browser APIs, effects, hooks, and
  serialization expectations.
- Server Actions: document mutation, expected `FormData` or typed input,
  validation, auth, cache invalidation, return shape, and caller-visible errors.
- Route Handlers: document method behavior, body/query/header/cookie/auth
  expectations, response JSON/status, GET cache behavior, and mutation side
  effects.
- `generateMetadata`: document params/data sources and visible fallbacks.

Implementation comments:

- server/client boundary decisions
- cache/revalidation/no-store behavior
- cookies or headers usage
- serialization constraints
- dynamic/static rendering decisions

## Generic fallback rules

When the language is not Angular, Next.js, NestJS, TypeScript, JavaScript, or
Python, use the language's conventional documentation style:

- Java / Kotlin / JavaScript / TypeScript: `/** ... */`
- C# XML docs: `/// <summary>...</summary>`
- Go: exported symbol comments should start with the symbol name.
- Rust: `///` for item docs and `//!` for module/crate docs.
- PHP: PHPDoc `/** ... */`
- Swift: `///`
- C/C++: Doxygen-compatible `/** ... */` or `///`
- Ruby: conventional preceding comments.
- Shell scripts: concise comments above functions when useful.

Fallback behavior:

- Document public/exported APIs first.
- Document what the API does, what inputs mean, what it returns, what errors
  occur, and what side effects happen.
- Match existing local style.
- Avoid over-documenting obvious implementation.
- Do not invent behavior.
- Keep comments concise.

## Output contract

After applying code documentation, report:

- level or intent applied
- files touched
- public contract docs added/updated
- implementation comments added/updated
- stale comments corrected
- skipped/deferred items
- verification command and result

## Cross-references

- `_refs/documentation/gate.md` - controls user-guide and technical-doc creation
  approval, not source-code documentation.
- `_refs/documentation/write-technical-doc.md` - standalone technical docs and
  API reference docs.
- `sdcorejs-ship (verify-before-done mode)` - verifies acceptance after code
  documentation work.
