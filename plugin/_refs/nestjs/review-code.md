# NestJS Code Review

## Scope gate

Use this pack for `sdcorejs-nestjs` projects. For `plain-nestjs`, use
`_refs/shared/review-code.md` and do not impose SDCoreJS-specific imports or
profile rules.

Review is strict read-only. Cite file and line evidence.

## Contract review

- installed `@sdcorejs/nestjs` declarations agree with imports and metadata;
- the manifest, profile contract, orchestrator, packs, and generated project agree;
- profile is resolved once and propagated unchanged;
- controllers enumerate routes explicitly and read-only operations remain absent;
- request schemas and response DTOs are separate;
- strict TypeScript compiles without unsafe suppressions.

## Behavioral review

- authentication precedes permission/policy evaluation;
- missing permission metadata fails closed;
- route params, query, and bodies validate before service/repository execution;
- current state and authenticated actor authorize mutations;
- enterprise repositories scope every data path;
- concurrency, idempotency, import, and export limits are executable behaviors.

## Consistency (boundary detail for `_refs/shared/review-consistency.md`)

Apply the shared semantic rules; this section only names the NestJS boundaries.

- controller route prefixes, resource cardinality, and action-route shape within
  one boundary and semantic role;
- route parameter names against controller arguments, service arguments, tests,
  and documentation;
- request schema and response DTO field names against the domain model and the
  persistence column names, plus the mapper or naming strategy between them;
- DTO, entity, and domain type suffixes describing the layer they actually hold;
- repository method verbs against their real behavior: collection versus single
  item, exact versus optional lookup, hard versus soft delete, create versus
  upsert;
- permission decorators and policy identifiers against the frontend permission
  codes and the route guard mapping;
- error envelope, status code, and pagination envelope shape across endpoints;
- command, event, job, queue, and topic naming within each category;
- migration, table, column, audit, soft-delete, and tenant field naming.

Database and application code do not need the same physical casing. Report the
missing or inconsistent mapper, not the casing difference itself.

## Reporting

Report severity, confidence, file:line evidence, impact, and a concrete fix.
Distinguish verified defects from questions. Hand verified findings to
`sdcorejs-repair-loop`; do not edit during review.
