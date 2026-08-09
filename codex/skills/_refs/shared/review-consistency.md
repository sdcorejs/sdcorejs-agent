# Shared Semantic Consistency Review

Profile-neutral reference for the `consistency` review dimension. Loaded by
`sdcorejs-review` for every track whose scope contains named artifacts: Angular,
NestJS, Next.js, React, Node, fullstack, general, AI-agent, workflow, test,
product, design, and documentation.

The parent skill owns the report format and `review_context`. This file defines
what consistency means, how to tell drift from a legitimate distinction, and how
to classify what is found. Track references add boundary examples; they do not
fork these rules.

## Contents

- [What This Is Not](#what-this-is-not)
- [Inputs](#inputs)
- [Classification Before Comparison](#classification-before-comparison)
- [Taxonomy](#taxonomy)
- [False-positive Guardrails](#false-positive-guardrails)
- [Scope Discipline](#scope-discipline)
- [Finding Kinds](#finding-kinds)
- [Severity](#severity)
- [Reporting](#reporting)
- [Anti-patterns](#anti-patterns)

## What This Is Not

This is not a casing linter. A linter compares spellings; consistency review
compares meanings. The two disagree constantly:

- `is_active` in a raw API payload and `isActive` in a domain type are different
  spellings of one concept and are correct when a mapper connects them.
- `isActive` and `isActivated` are the same spelling shape and are a defect when
  both mean "currently active".
- `status` in an order module and `status` in a webhook delivery record are the
  same word for two unrelated state machines and must not be merged.

A regex cannot make any of those three calls. Do not add repository-wide pattern
enforcement to substitute for reading the code. Deterministic helpers validate
schemas, paths, ownership, precedence, and lifecycle; semantic classification is
review work backed by cited evidence.

## Inputs

Before comparing anything, load:

1. project conventions through `sdcorejs-explore (conventions-read)`, which
   returns accepted, observed, conflicted, deprecated, and stale rules plus the
   capture policy state. See `_refs/shared/convention-context.md`.
2. current authoritative configuration and public contracts: OpenAPI or schema
   files, router configuration, ORM naming strategy, permission declarations,
   i18n key files, environment templates, and published package exports.
3. approved specs and plans related to the change.
4. the review scope diff and its semantic neighbors.

Current code and current authoritative config outrank a stored rule. A stored
rule whose evidence no longer matches the repository is `STALE_CONVENTION`, not
a violation by the code that disagrees with it.

## Classification Before Comparison

For every candidate inconsistency, record these before deciding anything:

```yaml
concept_id: <the domain thing being named>
semantic_role: <what this name does for that concept>
layer: <persistence | domain | service | transport | client | ui | config | test | docs>
boundary: <public-api | internal-api | database | message | config | frontend-route | permission | ui>
repository_id: <stable repository id>
module_id: <module id or null>
contract_visibility: public | internal
temporal_sense: current-state | transition | historical | scheduled
source_authority: authoritative | observed
compatibility_status: free | external-consumers | versioned | legacy-retained
```

Two names are drift only when `concept_id`, `semantic_role`, `boundary`, and
`temporal_sense` all match. Two identical strings are a collision only when the
concepts differ. Token similarity alone proves nothing.

## Taxonomy

### 1. Domain vocabulary and semantic aliases

One concept carrying several competing terms (`customer` / `client` / `buyer`,
`product` / `item` / `goods`, `warehouse` / `stockLocation` / `storage`,
`employee` / `staff` / `member`, `enabled` / `active` / `activated`).

Separate a real domain distinction (a `client` of an agency is not a `customer`
of a shop) from a role-specific term, a compatibility alias, a translated UI
label, and an actual competing name. Detect both directions: one concept with
several names, and one name covering several incompatible concepts.

### 2. Boolean, state, capability, transition, and history naming

Classify each identifier by role before comparing:

| Identifier shape | Typical role |
|---|---|
| `isActive`, `active`, `enabled` | current predicate |
| `canActivate`, `isEditable` | capability |
| `mayActivate`, permission flags | authorization |
| `activate()`, `ActivateUserCommand` | transition command |
| `UserActivatedEvent` | transition result |
| `hasActivated`, `wasActivated` | historical fact |
| `activatedAt`, `deactivatedAt` | transition timestamp |
| `activationStatus`, `state` | enum or state machine |
| `showActiveBadge` | derived UI state |

- `isActive` and `isActivated` are drift only when both are the current
  predicate for the same concept.
- `canActivate` is a capability and never merges with `isActive`.
- `activatedAt` is transition history, not a second name for current activity.
- `ActivateUserCommand` and `UserActivatedEvent` use different tense on purpose.
- `hasActivated` may be historical completion. Investigate before proposing any
  rename; a mechanical rename here silently changes meaning.

### 3. Action and operation vocabulary

Compare `get`, `find`, `load`, `fetch`, `read`, `list`, `search`, `query`,
`create`, `add`, `insert`, `save`, `update`, `edit`, `patch`, `remove`,
`delete`, `archive`, `disable`, `deactivate`, `activate`, `enable`.

Infer intended semantics from behavior, not from the word: collection versus
single item, local state versus remote I/O, cache versus network, exact lookup
versus optional lookup, hard versus soft delete, create versus upsert, command
versus query, synchronous versus queued. Report a verb as inconsistent only when
two call sites with the same behavior use different verbs, or one verb covers
two different behaviors. Do not impose a universal vocabulary without project
evidence.

### 4. Type, model, DTO, request, response, entity, and ViewModel naming

Check that suffixes consistently identify a layer: persistence entity, domain
entity, raw external request/response, public service contract, frontend
ViewModel, form model, list summary, select option, event payload, command
payload, database record.

`UserEntity`, `UserDto`, and `UserViewModel` coexisting is normal layering, not
duplication, when each has a mapping responsibility. Report instead:

- several competing types for the same layer and purpose;
- a suffix that misdescribes what the type holds;
- raw external API types used directly as presentation state;
- UI-only fields added to a service or API contract;
- duplicate summary or select-option contracts;
- inconsistent identifier fields across the same concept;
- a missing mapping boundary between two layers.

### 5. Identifier conventions

`id`, `<entity>Id`, `<entity>ID`, `<entity>_id`, `externalId`, `referenceId`,
`code`, `key`, `uuid`, `slug`, natural keys, foreign keys, tenant, account,
actor, and owner identifiers.

A bare `id` inside its own entity boundary is usually correct; a foreign key
usually needs qualification. Do not enforce qualification without project
evidence, and check semantics rather than casing alone: an `externalId` that
sometimes holds a partner code and sometimes a URL is a defect no naming rule
catches.

### 6. File, directory, package, module, and export naming

File and directory casing, singular/plural directory names, filename suffixes,
barrel naming, public export conventions, package naming, feature and module
naming, route file naming, framework suffixes (service, model, entity,
component, directive, pipe, guard, resolver, interceptor), test filenames, and
fixture names.

Use the detected framework and the local project layout. Do not impose Angular,
NestJS, or Next.js structure on an unrelated profile.

### 7. API, URL, resource, and route structure

Base prefixes, version segments, resource cardinality, casing and separators,
trailing slashes, nested resources, collection and item routes, action routes,
bulk routes, import/export routes, workflow actions, internal versus public
endpoints, admin versus user endpoints, aliases, and deprecated routes.

Compare shapes within one boundary and role:

```text
/product              /products
/product/:id          /products/:id
/product/detail/:id   /products/:id/detail
/cancel-order/:id     /orders/:id/cancel     /orders/cancel/:id
/order/:orderId/action/cancel
```

Neither singular nor plural is universally correct. A project may legitimately
use plural public REST resources, singular frontend module routes, noun-based
RPC routes, and externally fixed legacy routes at the same time. Review
consistency inside each boundary, then check that the boundaries map onto each
other coherently.

### 8. Path parameter naming

`:id`, `:productId`, `:product_id`, `:code`, `:slug`, `:key`, nested parent and
child identifiers, controller parameter names, frontend route parameters, API
client arguments, tests, and documentation.

Report when one route concept is named differently across its connected layers
without a documented mapper or adapter.

### 9. Query, filter, search, pagination, and sort contracts

`page`, `pageIndex`, `pageNumber`, `size`, `pageSize`, `limit`, `offset`,
`cursor`, `after`, `before`, `keyword`, `query`, `search`, `q`, `sort`,
`sortBy`, `order`, `orderBy`, `direction`, `ascending`, `descending`, date
ranges, status arrays, identifier arrays, include/exclude field lists, boolean
query values, null and empty semantics, and array serialization.

Review behavior alongside naming: zero-based versus one-based pages, cursor
versus offset pagination, sort direction casing, repeated keys versus
comma-separated values, inclusive versus exclusive ranges, and timezone
assumptions. A `page` that is one-based on one endpoint and zero-based on
another is a defect even when both spell the parameter identically.

### 10. HTTP semantics and API envelopes

Methods, status codes, create/update/delete response shapes, empty-response
behavior, error envelopes, success envelopes, pagination envelopes, validation
error shape, correlation identifier placement, idempotency keys, retry
semantics, and conflict behavior.

Typical drift: one create returns `200` and another `201`; one delete returns
`200` and another `204`; errors alternate between `{ message }`, `{ error }`,
`{ errors }`, and `{ code, message }`; pagination alternates between `items`,
`data`, `results`, and `records`. Do not report a difference that an external
contract or a documented version boundary requires.

### 11. Serialization and casing boundaries

Raw external fields, public API fields, language-level properties, database
columns, message and event fields, configuration keys, JSON serialization,
mappers, serializers, and ORM naming strategies.

Raw `is_active`, domain `isActive`, and column `is_active` are correct together
when an explicit typed mapper or naming strategy connects them. Report casing
that leaks across a boundary, a missing or inconsistent mapper, one field mapped
differently in two mappers, silent fallback properties, duplicate serialized
aliases, and incompatible event or API field names. When both physical
conventions are valid but the connection is missing or unclear, use
`BOUNDARY_MAPPING_GAP` rather than picking a winner.

### 12. Frontend routing and navigation

Application routes, lazy route definitions, menu entries, module registrations,
breadcrumbs, navigation helpers, links, tabs, feature identifiers, permission
mappings, analytics screen names, end-to-end selectors, and documentation URLs.

When a route uses `mdm/product`, a menu uses `mdm/products`, a breadcrumb uses
`product-management`, and a permission mapping references `product-list`, decide
which are user-visible presentation labels and which are competing technical
identifiers. Only the technical identifiers are drift.

### 13. Persistence and data naming

Tables, columns, relations, join tables, entities, repository methods, audit
fields, soft-delete fields, tenant fields, version fields, status fields, enum
storage, and migration names.

Compare `createdAt` / `createdDate` / `creationTime`, `updatedAt` /
`modifiedAt` / `lastUpdatedAt`, `deletedAt` / `isDeleted` / `status = DELETED`,
`status` / `state` / `phase`, and `tenantId` / `organizationId` / `workspaceId`.
Do not force database and application code to share physical casing.

### 14. Date, time, timezone, money, quantity, and unit naming

`At` / `Date` / `Time` / `Timestamp` suffixes, local versus UTC values, timezone
fields, duration units, timeout units, retry delays, byte and size units,
percentages, currency fields, minor versus major monetary units, and measurement
units.

`timeout` beside `timeoutMs` and `timeoutSeconds`, or `amount` beside
`amountMinor` and `amountInCents`, is a correctness hazard, not a style
question. When the unit or meaning cannot be inferred safely from the code,
report the ambiguity rather than guessing.

### 15. Commands, events, jobs, queues, topics, cache keys, and webhooks

Imperative command names, past-tense event names, job and task names, queue and
topic names, routing keys, cache key prefixes, webhook event names, scheduler
identifiers, and retry or dead-letter naming.

`ActivateUserCommand`, `UserActivatedEvent`, `ActivateUserJob`, a
`user.activated` webhook, and a `user-activation` queue are intentionally
different grammatical forms of one concept. Review whether each category has a
stable internal convention, not whether the categories match each other.

### 16. Permissions, roles, policies, and capabilities

Permission ordering, module/entity/action ordering, separators, casing, action
vocabulary, frontend and backend equivalence, route guard mappings, policy
identifiers, role names, and capability flags.

`MDM_C_PRODUCT_LIST`, `mdm.product.list`, and `mdm.product:list` may all be
valid when each boundary has a documented convention and an explicit mapping.
Report a missing mapping, and report inconsistent semantic actions such as
`view` / `read` / `list` / `detail` / `get` / `access` used interchangeably for
one authorization decision. A permission mismatch between the layer that grants
and the layer that checks is a security finding, not a naming nit.

### 17. Configuration, environment variables, feature flags, and limits

Prefixes, casing, positive versus negative boolean semantics, feature flag
naming, timeout and duration suffixes, retry configuration, maximum and minimum
naming, URL and endpoint keys, secret key names, and environment suffixes.

`ENABLE_FEATURE_X`, `FEATURE_X_ENABLED`, and `DISABLE_FEATURE_X` in one project
invert meaning depending on which one a reader reaches for; that is a defect.
Never read or persist secret values. Evidence here is limited to key names,
paths, and redacted metadata.

### 18. Error, logging, metrics, tracing, and observability naming

Error code format, error class naming, log field names, request identifier,
correlation identifier, trace identifier, span attributes, metric names, label
names, audit action names, and structured event names.

`requestId`, `correlationId`, `traceId`, `trace_id`, and `x-request-id` may be
correct at different protocol boundaries; `USER_NOT_FOUND`, `UserNotFound`, and
`user.not_found` may be correct in different catalogs. What must be clear is the
mapping between them, and that one identifier is not silently dropped when a
request crosses a boundary.

### 19. UI contracts, forms, test identifiers, analytics, and i18n keys

Component input and output names, event naming, callback naming, form control
names, form-to-DTO mapping, local UI state naming, test selector naming,
`autoId`, analytics screen and action identifiers, i18n key hierarchy, and
accessibility labels used as technical identifiers.

Compare `disabled` / `isDisabled`, `saved` / `save` / `onSave` / `saveChange`,
`selected` / `isSelected` / `checked`, and `product-save-button` /
`save-product` / `product-form-submit`. Preserve framework conventions, and keep
user-visible labels separate from technical identifiers.

### 20. Tests, fixtures, factories, mocks, and documentation

Fixture names, test factory names, mock/fake/stub terminology, scenario names,
end-to-end test paths, screenshots, user guides, technical documentation,
specifications, plans, examples, and API documentation.

Tests and documentation that use different words than production code make both
harder to trust. Do not treat `mock`, `fake`, and `stub` as interchangeable when
the project distinguishes their behavior.

### 21. Cross-repository ownership and composition

Check that module concepts are defined in the module repository, portal
composition identifiers match module registration, portal-pinned revisions match
the reviewed module evidence, module conventions are not duplicated in the
portal, aggregate documentation distinguishes owner from consumer, and API,
end-to-end, specification, plan, and convention artifacts sit in their semantic
owner repositories.

## False-positive Guardrails

1. **Same string, different meaning.** Do not merge or normalize two identifiers
   because their spelling matches.
2. **Different strings, same meaning.** Report alias drift only with evidence
   that both denote the same concept and role.
3. **Boundary transformations.** Casing and naming differences across a boundary
   are correct when a mapper, serializer, adapter, naming strategy, or
   documented convention connects them.
4. **Public contracts.** An existing public or external contract may be retained
   as a documented exception even when it differs from the current rule.
5. **Version boundaries.** API v1 and v2 may differ on purpose. Report the
   relationship and migration status, not a defect per difference.
6. **Current versus historical.** `isActive`, `activatedAt`, and `wasActivated`
   are not interchangeable.
7. **Command versus event.** Imperative and past-tense forms are expected.
8. **User-visible labels.** A translated or product-facing label may differ from
   the technical identifier.
9. **Local scope.** A short local variable name may be fine where a public
   method or contract name needs qualification.
10. **Legacy exceptions.** A retained legacy endpoint is not evidence for what
    new endpoints should look like unless it was explicitly accepted.
11. **Dominance is not authority.** A pattern in 80 percent of files is an
    observation. It becomes a rule only through an explicit decision.
12. **Missing evidence.** Mark uncertain cases `UNCLEAR`, a conflict, or a
    candidate. Do not present them as blocking defects.
13. **Style preference.** Personal taste and generic framework preference are
    not project conventions.
14. **Generated code.** Exclude generated clients and schemas, generated
    mirrors, build output, vendor code, and external code unless the review
    explicitly targets generation consistency.
15. **One primary finding.** Do not report the same issue separately under code,
    architecture, and consistency. Raise it once and note cross-dimension
    relevance.

## Scope Discipline

Start from the current diff or the explicit review scope, then read semantic
neighbors only: router configuration, controller, request and response schemas,
API client, service, mapper, entity or schema, repository, frontend route and
menu, permission declarations, tests, related specs, plans, docs, and the
relevant convention files.

Do not scan the whole repository by default. Use an existing code graph,
language index, workspace graph, OpenAPI schema, or dependency graph only when
it is already present and documented. Do not install a graph tool for a review.

Dimension coverage is resolved by `_refs/shared/review-contract.mjs`:

| Requested dimension | Consistency coverage |
|---|---|
| `consistency`, `ALL` | complete taxonomy |
| `code` | applicable per-file and contract checks |
| `architecture` | structural and cross-layer checks |
| `security`, `performance`, `accessibility`, `site-audit` | only where a consistency issue changes that dimension's answer |

A security-only review may report a permission code that two layers spell
differently, because that changes the authorization answer. It may not turn into
a naming inventory.

## Finding Kinds

| Kind | Use when |
|---|---|
| `CONVENTION_VIOLATION` | code contradicts an accepted, non-stale rule in its effective scope |
| `SEMANTIC_ALIAS_DRIFT` | one concept and role carries competing names |
| `TERM_COLLISION` | one name covers several incompatible concepts |
| `CROSS_LAYER_DRIFT` | connected layers name the same concept differently |
| `BOUNDARY_MAPPING_GAP` | differing conventions are valid but the connecting mapper is missing or unclear |
| `PUBLIC_CONTRACT_DRIFT` | the change or the rule conflicts with a published external contract |
| `UNRESOLVED_CONVENTION` | accepted rules conflict at the same precedence, or evidence cannot decide |
| `STALE_CONVENTION` | a stored rule no longer matches current authoritative evidence |
| `CONVENTION_CANDIDATE` | an observed pattern worth capturing, never a blocker |

Every consistency finding carries: stable id, severity, confidence, finding
kind, category, rule id when one applies, concept id, semantic role, source
boundary, target boundary for cross-layer findings, repository id, module id
when applicable, exact evidence, exact locator, impact, concrete recommended
fix, repair tier, compatibility requirement, migration requirement, whether a
user decision is required, whether spec or plan work is required, and whether
the finding is eligible for automatic repair.

`_refs/shared/convention-contract.mjs` validates this shape. It refuses to mark
a finding auto-repairable when it declares a compatibility or migration
requirement, and it refuses to let a candidate become a blocker.

## Severity

Use the repository's existing severity vocabulary. Do not introduce a second
enum.

- **Critical / High** - public API break, authorization or permission mismatch,
  incompatible serialization, event or message contract break, data integrity
  risk, dangerous configuration ambiguity, external compatibility break.
- **Important / Medium** - systematic cross-layer drift, duplicated business
  concepts, inconsistent service contracts, maintainability or testability risk
  with concrete evidence.
- **Minor / Low** - local naming inconsistency against an accepted rule,
  non-breaking cleanup with clear value.
- **Info** - observed candidate, unresolved pattern with insufficient evidence,
  informational exception.

An observed candidate is never a release blocker.

## Reporting

- Cite `file:line` for every file-level finding; mark architecture-level
  findings as scope-level with the inspected paths.
- Name the accepted rule id when one exists. Without a rule, say what evidence
  supports the expectation and mark confidence honestly.
- For anything touching a public route, persisted column, permission code, event
  name, queue name, environment variable, or published export, state the
  required migration, deprecation, compatibility layer, or specification
  decision instead of proposing a direct rename.
- Record strengths when an accepted convention is applied consistently and is
  worth reusing.
- Emit `convention_context` alongside the normal findings, with `write_actions`
  empty. Review reports candidates; it never persists them.

## Anti-patterns

- Treating spelling similarity as semantic equivalence.
- Renaming a public contract because an internal rule disagrees with it.
- Promoting a majority pattern to a mandatory rule inside a review.
- Expanding a security, performance, or accessibility review into a full audit.
- Reporting a boundary transformation as a defect when a mapper exists.
- Reporting the same issue once per dimension.
- Persisting a convention from inside review.
- Storing secret values, tokens, headers, customer data, or PII in evidence.
