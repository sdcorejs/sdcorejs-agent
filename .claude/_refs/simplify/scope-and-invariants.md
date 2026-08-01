# Simplify Scope and Invariants

## Contents

- [Actions and planning boundary](#actions-and-planning-boundary)
- [Scope resolution](#scope-resolution)
- [Execution limits](#execution-limits)
- [Eligible executable source](#eligible-executable-source)
- [Protected files](#protected-files)
- [Protected content](#protected-content-inside-eligible-source)
- [Preserved surfaces](#preserved-surfaces)
- [Allowed local refinements](#allowed-local-refinements)
- [Forbidden over-simplification](#forbidden-over-simplification)
- [Project-standard discovery](#project-standard-discovery)

## Actions and planning boundary

Select exactly one action:

```yaml
simplify_action: <exactly one allowed value>
allowed_simplify_actions:
  - analyze-current-diff
  - apply-current-diff
  - analyze-explicit-scope
  - apply-explicit-scope
  - planning-handoff
```

Analyze actions are read-only. Apply actions require a proven scope, preserved
surfaces, a green baseline, and post-change verification.

Use `planning-handoff` for:

- whole-repository simplification;
- module/framework boundary changes;
- public API or type changes;
- data model, schema, or migration changes;
- dependency removal/replacement;
- performance behavior changes;
- caching, retry, timeout, concurrency, transaction, or persistence-policy
  changes;
- agent/tool/prompt/approval/session/evidence/eval contract changes;
- user-visible behavior changes;
- scope without a suitable verification oracle.

## Scope resolution

The default is recently changed executable source code. Resolve scope in order:

1. explicit source scope from the user, such as a file, function, or path;
2. `execution_context.files_changed`;
3. `ai_agent_context.changed_files`;
4. current same-change diff;
5. staged and unstaged executable source files;
6. ask when no bounded scope can be proven.

The **current-diff boundary** applies to current-diff actions: select eligible
changed hunks, not whole files merely because they contain one changed hunk.
Do not assume `origin/main` is the diff baseline. Prefer same-change execution
evidence and distinguish user-owned changes from current-workflow edits.

Adjacent untouched code may change only when compilation or a local invariant
requires it. Record the path, hunk, reason, and verification impact. Never use
adjacency as permission for opportunistic cleanup.

## Execution limits

```yaml
limits:
  max_passes: 2
  max_files_per_pass: 5
  max_total_files_without_reconfirmation: 8
  max_hunks_without_reconfirmation: 20
```

These are safety boundaries, not quality metrics. When the proven scope exceeds
a limit, ask for a subset or return to planning.

## Eligible executable source

Executable source may include TypeScript/JavaScript, TSX/JSX, Python,
Java/Kotlin, C#, Go, Rust, or another source language proven by repository
evidence.

Do not use a rigid extension allowlist as the only truth. Combine:

- file purpose;
- repository and generated-file conventions;
- target build graph;
- user scope;
- current diff;
- nearby tests and project instructions.

HTML templates, CSS/SCSS, and presentation assets are excluded by default.
Allow an explicit presentation scope only with preserved DOM/selectors,
accessibility, user-visible copy, and current screenshot or equivalent
behavioral evidence.

## Protected files

Direct simplification must exclude:

- documentation, prompts, and configuration: `*.md`, `*.mdx`, `*.txt`,
  `*.rst`, `*.adoc`, `*.json`, `*.yaml`, `*.yml`, `*.toml`, `*.ini`,
  `*.properties`, workspace/CI/config files, and AI prompt/instruction/skill
  sources;
- env, package, dependency, and compiler surfaces: `.env*`, manifests,
  lockfiles, `tsconfig*.json`, `angular.json`, and workspace configuration;
- database/schema migrations and OpenAPI, AsyncAPI, GraphQL, protobuf, policy,
  permission, data, and serialized contract files;
- generated/vendor/build/coverage output;
- golden files, seed/customer data, and contract/eval datasets;
- tests, fixtures, and snapshots, which are protected verification oracles.

The executable contract uses these protected-surface IDs:

- `security-validation`
- `authentication-authorization`
- `approval-checks`
- `artifact-hashing`
- `repository-ownership`
- `evidence-collection`
- `required-error-handling`
- `generated-source-boundary`
- `tenant-isolation`
- `secret-pii-redaction`
- `concurrency-protection`
- `tests-fixtures-snapshots`
- `public-contracts`
- `dependency-environment-migration-boundaries`

Any selected hunk carrying one of these responsibilities is excluded even when
the file extension would otherwise be eligible. Generated skill/reference
mirrors are never direct simplify targets; edit canonical sources through their
own workflow and regenerate mirrors with the repository sync command.

Requests to simplify tests route to `sdcorejs-test`. Documentation, prompt, or
prose changes route to `sdcorejs-documentation`. Protected files require a
separate approved semantic-change plan; direct simplification cannot edit them.

Dependency and configuration changes are forbidden. Do not edit a manifest or
lockfile, add/remove a package, or alter embedded configuration to make source
look simpler.

## Protected content inside eligible source

Do not change string literals or template-literal content, including:

- prompts and system/developer/user instructions;
- user-facing labels, validation/error/audit/log messages, and telemetry event
  names;
- route paths, permission codes, feature flags, environment keys, serialized
  property names, and translation keys;
- CSS classes, test IDs, `autoId`, ARIA labels, selectors, and URLs;
- regex behavior, SQL strings, GraphQL documents, and shell commands;
- date/time/currency/unit format strings;
- configuration or data contracts embedded in code.

Quote-style churn does not authorize string changes. Stop and route to the
owning workflow when a proposed refinement needs a protected literal change.
Never alter the literal and then update its test oracle to hide behavior drift.

## Preserved surfaces

Record applicable fields before edits. Use `not-applicable`, never silent
omission, for important surfaces that do not apply.

```yaml
preserved_surfaces:
  return_values: verified | blocked | not-applicable
  output_shape: verified | blocked | not-applicable
  public_exports: verified | blocked | not-applicable
  public_types: verified | blocked | not-applicable
  public_API_and_signatures: verified | blocked | not-applicable
  routes_status_errors_validation_order: verified | blocked | not-applicable
  side_effects_and_order: verified | blocked | not-applicable
  async_concurrency_transaction: verified | blocked | not-applicable
  retry_timeout_cache: verified | blocked | not-applicable
  auth_permissions_tenant_approval: verified | blocked | not-applicable
  persistence_and_query: verified | blocked | not-applicable
  rendering_DOM_accessibility: verified | blocked | not-applicable
  telemetry_and_audit: verified | blocked | not-applicable
  strings_and_prompts: verified | blocked
  framework_metadata: verified | blocked | not-applicable
  dependencies_and_config: verified | blocked
```

Behavior preservation includes success and failure paths, exception types,
validation order, observable timing/order, side effects, authorization, tenant
scope, persistence, audit, user-visible output, machine-readable output, and
framework metadata. Tests are evidence, not permission to change untested
behavior or a public API.

## Allowed local refinements

Prefer low-risk, local improvements:

- reduce nesting with guard clauses only when validation/error order is stable;
- replace nested ternaries with clear `if`/`else` or `switch`;
- remove truly redundant local variables or branches;
- remove unreachable code only with compiler/static evidence;
- consolidate duplicate local expressions with identical semantics;
- rename local/private identifiers after verifying every reference;
- extract a cohesive private helper from an overlong function;
- group related local logic without mixing concerns;
- remove a wrapper only when it has no lifecycle, metadata, contract, or
  abstraction value;
- use an established project idiom instead of custom complexity;
- remove comments that merely narrate code, but preserve rationale/contracts.

Prioritize **clarity over brevity** and clarity over line count. Fewer lines,
functions, files, abstractions, or branches are never the primary metric.

## Forbidden over-simplification

Never:

- create dense one-liners or nested ternaries;
- introduce clever metaprogramming or project-foreign magic conventions;
- merge unrelated concerns into one function/component;
- flatten framework/domain/lifecycle boundaries;
- remove an abstraction that protects a domain or lifecycle invariant;
- create a shared abstraction only because two snippets look similar;
- change mutation/side-effect order or short-circuit behavior;
- change eager/lazy, sync/async, Observable/subscription, or hook behavior;
- change transaction, cache, retry, timeout, or exception propagation policy;
- weaken auth, permission, tenant, or approval checks;
- shorten a data query by changing its semantics;
- replace a domain-specific tool/API with a generic tool;
- change a public export, DTO, schema, or framework metadata;
- remove security rationale, TODO/FIXME, license, compiler/lint directives, or
  code-generation markers;
- edit tests, fixtures, or snapshots to make a refinement pass.

## Project-standard discovery

Before applying style:

1. read target project instructions;
2. inspect package/language, formatter, and linter configuration;
3. inspect nearby source and current architecture contracts;
4. inspect existing focused tests and current implementation evidence;
5. follow the project's proven idioms.

Do not import external simplifier preferences. Do not force function versus
arrow style, explicit return types, import style, class/functional style, or
React conventions without target-project evidence.
