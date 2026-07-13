# Frontend Architecture Preflight

Use this reference before planning or generating any non-trivial frontend
feature. It is framework-neutral. Angular, Next.js, React, Vue, Svelte, and
other frontend executors adapt the registration details to the detected stack
without replacing the shared boundary decisions.

The route/page shell is the minimum screen boundary, not the maximum component
count. The goal is a cohesive component and service graph: neither a monolithic
screen nor a directory of arbitrary wrappers.

## Contents

- [When This Gate Is Required](#when-this-gate-is-required)
- [1. Discover Project Conventions First](#1-discover-project-conventions-first)
- [2. Component Levels](#2-component-levels)
- [3. Extraction Decision](#3-extraction-decision)
- [4. Reuse Decision Hierarchy](#4-reuse-decision-hierarchy)
- [5. Responsibility, State, and Data Flow](#5-responsibility-state-and-data-flow)
- [6. Service and Collaborator Taxonomy](#6-service-and-collaborator-taxonomy)
- [7. Provider and Lifecycle Scope](#7-provider-and-lifecycle-scope)
- [8. Declaration, Registration, and Public API](#8-declaration-registration-and-public-api)
- [9. Mandatory Output Contract](#9-mandatory-output-contract)
- [10. Plan and Review Enforcement](#10-plan-and-review-enforcement)

## When This Gate Is Required

Complete this preflight when a task adds or materially changes any routed page,
screen, form, table, child collection, workflow panel, modal/drawer, interactive
island, frontend service, query, facade, store, or public component contract.

The gate may be marked not applicable for a static copy-only change, a token-only
style change, or backend-only work. Record the reason instead of emitting an
empty architecture block.

A non-trivial frontend task must not proceed to code generation until the
`Frontend architecture plan` output below is complete. File tasks must be
derived from its component tree, service boundaries, registration decisions,
and test map.

## 1. Discover Project Conventions First

Inspect the target project before proposing paths or symbols. Current code and
an approved project plan override fallback examples in this reference.

Record evidence for:

- component style: standalone/module, function/class, Server/Client, composition
  and input/output conventions;
- folder convention: route colocation, feature folders, shared UI, domain or
  layer boundaries;
- state convention: local state, signals, RxJS, context, store, query cache,
  server state, forms;
- service/data-access convention: API clients, repositories, query modules,
  server actions, facades, mappers, error handling, caching;
- registration convention: routes, declarations/imports, providers, plugin or
  app registration;
- public API convention: barrels, `public-api.ts`, package exports, aliases, and
  cross-feature import rules;
- test convention: colocated tests, test utilities, component harnesses, and
  integration/e2e boundaries.

Inspect nearby comparable features, routes, imports, providers, public barrels,
tests, package manifests, and workspace configuration. Do not infer a fixed
`pages/components/services` layout when the project has another coherent shape.
Fallback structures are allowed only for greenfield work or when no convention
can be found, and the plan must label them as fallback decisions.

## 2. Component Levels

### Route/page container

Every routed screen normally has a route/page container. It owns route and query
parameters, navigation, load/save orchestration, page-level state, service or
facade coordination, and composition of child regions. It should not also absorb
every table cell, filter control, form section, child collection, dialog, and
workflow responsibility.

### Feature-local component

A feature-local component owns one cohesive UI or domain responsibility inside
a feature. It does not need multiple consumers to be valid. Examples include a
filter panel, result table, summary, form section, line-item editor, bulk-action
toolbar, workflow panel, comparison, or complex one-off interactive block.

Keep it inside the feature boundary unless stronger ownership evidence exists.

### Shared or design-system component

Promote a component to a shared/design-system boundary only when it is
domain-agnostic, has multiple stable consumers, or is explicitly owned by the
project's shared UI layer. Shared placement is not a reward for extracting a
component, and speculative reuse is not a public API requirement.

## 3. Extraction Decision

Extract a region when one or more of these signals creates a meaningful
responsibility boundary:

- independent state or asynchronous lifecycle;
- a distinct UI or domain responsibility;
- a clear inputs/outputs, props/events, slots, or content contract;
- independent testing or accessibility behavior;
- a form section, filter region, data table, or child collection;
- a modal, drawer, workflow panel, or interactive island;
- a different change cadence from the page shell;
- a Server Component / Client Component boundary;
- likely reuse within the same feature or domain;
- keeping it inline would mix unrelated responsibilities.

Keep markup inline when extraction would only wrap one element, forward every
input unchanged, duplicate state, introduce disproportionate prop drilling, or
exist only to reduce line count. A small cohesive drawer with a few simple fields,
no child collection, and no independent asynchronous workflow may remain one
component. Do not create a facade/store for simple CRUD without coordination or
shared-state pressure.

Line count is a review signal, never the sole extraction rule.

## 4. Reuse Decision Hierarchy

For every non-trivial UI or data need, choose exactly one action:

1. `reuse` an existing compatible symbol;
2. `extend` the existing owner with a backward-compatible capability;
3. `wrap` when an adapter is needed and the wrapped contract remains the true
   owner;
4. `create_feature_local` for a cohesive domain-specific responsibility;
5. `create_shared` only with stable cross-boundary ownership evidence;
6. `keep_inline` when there is no meaningful boundary.

Record the exact symbol and path when a candidate exists, the compatibility
reason, and whether it is private or public. Do not duplicate a compatible
component/service. Do not create a generic wrapper merely to avoid a valid
feature-local component.

## 5. Responsibility, State, and Data Flow

Assign every state value one owner. Children receive the smallest stable
contract and emit meaningful UI/domain events. Do not duplicate the same entity,
form, selection, loading, or filter state across a page, child, and facade.

Use this default data direction when it matches project conventions:

```text
Route/page container
  -> feature facade/query/coordinator when justified
  -> API/data-access service or server boundary
  -> mapper
  -> domain model or view model
  -> presentational and feature-local components
  -> events back to the owning container/coordinator
```

Avoid raw API/CMS/provider payloads in presentational components when a stable
mapped model is appropriate. Avoid router or raw API calls from child components
unless the existing architecture explicitly assigns that responsibility there.

## 6. Service and Collaborator Taxonomy

### API or data-access service

Own HTTP/API interaction, transport request/response types, raw payload mapping,
transport-level error normalization, and data-layer caching when appropriate.
It must not own dialog state, screen-specific selection, presentation formatting,
or unrelated workflow flags.

### Feature facade, store, query, or coordinator

Create only when multiple services are coordinated, a workflow is non-trivial,
state is shared across children, filter/selection/query state persists, optimistic
updates are required, or orchestration would otherwise be duplicated. Do not
generate one by default for simple CRUD.

### Pure collaborators

Prefer functions or the project's collaborator convention for API/domain/view
mapping, form builders, validators, permission policies, table-column factories,
query-parameter mapping, and non-component-specific formatting. Do not make a
stateless mapper injectable merely because services are injectable.

### Component responsibility

Components own UI events, local transient state, form interaction, composition,
and calls into the chosen page-level facade/service boundary. They do not become
alternate API clients or mutable copies of service contracts.

## 7. Provider and Lifecycle Scope

Choose scope from responsibility and project convention; never default every
service to an application/root singleton.

| Responsibility | Typical scope | Decision signal |
|---|---|---|
| Stateless API service used by several features | app/root or existing shared scope | Stable cross-feature consumer set |
| Feature facade/store with mutable feature state | route, feature, or page | State must reset with the feature lifecycle |
| Dialog/drawer coordinator | component | State belongs to one overlay instance |
| Configuration token | closest app/module/route owner | Consumers and injector visibility |
| Mapper/validator/formatter | pure function or project collaborator convention | No lifecycle state |

The plan must name the selected scope and reason. Check injector visibility and
teardown/reset behavior. A narrower mutable-state provider must not accidentally
become a cross-session singleton.

## 8. Declaration, Registration, and Public API

Plan every created or reused symbol's integration point:

- parent imports, module declarations/imports/exports, or framework component
  registration;
- app, module, route, page, or component providers;
- lazy route/page registration and navigation ownership;
- aliases and import paths;
- intentional public exports and feature-private symbols.

For Angular standalone projects, list parent `imports`, provider scope, lazy
`loadComponent`/`loadChildren` registration, and public exports. For NgModule or
hybrid projects, follow detected declarations/imports/exports/providers and do
not declare a standalone component in an NgModule.

For Next.js/React-style projects, record the route page, server/client boundary,
feature-local imports, server action/query/data-access ownership, and package or
feature export surface. Adapt equivalent concepts for other frameworks.

Feature-private route pages and child components stay private. Export only
symbols with real consumers outside the boundary. Do not create broad
`export *` barrels, cross-feature deep imports, or barrels that introduce
circular dependencies. Follow existing aliases and public API conventions.

## 9. Mandatory Output Contract

Produce this section before implementation. Replace examples with project
evidence; do not leave empty headings.

````markdown
## Frontend architecture plan

### Project conventions detected
- Component style:
- Folder convention:
- State convention:
- Service/data-access convention:
- Registration/provider convention:
- Public API/barrel convention:
- Test convention:
- Evidence inspected:

### Reuse decisions
| Need | Existing symbol/path | Decision | Reason and compatibility | Ownership |
|---|---|---|---|---|
| <need> | <exact path or none> | reuse / extend / wrap / create_feature_local / create_shared / keep_inline | <reason> | feature-private / public |

### Component tree
```text
<RouteOrPageContainer>
  <FeatureLocalRegion />
  <ExistingSharedComponent />
```

### Responsibility and state ownership
| Unit | Responsibility | Inputs | Outputs/events | State owner |
|---|---|---|---|---|

### Service and data flow
```text
<route/page -> optional facade/query -> data access -> mapper -> model/view model -> components>
```

| Symbol | Taxonomy/responsibility | Lifecycle/provider scope | Reason |
|---|---|---|---|

### Declarations and registration
| Symbol | Private/public scope | Import/declaration/provider/route/export mechanism |
|---|---|---|

### Files
- Reuse:
- Extend:
- Wrap:
- Create:
- Keep inline:
- Intentionally not created:

### Tests
- Page orchestration:
- Child component contracts:
- Service/data mapping:
- Provider-scope behavior where applicable:

### Decomposition rationale
- Why the selected boundaries are meaningful:
- Why smaller regions remain inline:
- Why no additional shared abstraction is introduced:
````

## 10. Plan and Review Enforcement

The approved implementation plan must preserve this output as a structured
`frontend_architecture` contract. Its file decisions and tasks must match the
approved tree, data flow, service boundaries, provider decisions,
registrations, exports, and tests.

Review the implementation against that contract. Flag responsibility drift,
duplicated abstractions, state with multiple owners, raw transport types leaking
into presentation, incorrect provider lifecycle, missing registration, private
symbols exported globally, cross-feature deep imports, unjustified monoliths,
and arbitrary wrappers. If implementation intentionally differs, require an
updated approved plan or documented compatibility reason; do not use a hard
component line-count failure.
