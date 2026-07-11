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

## Reporting

Report severity, confidence, file:line evidence, impact, and a concrete fix.
Distinguish verified defects from questions. Hand verified findings to
`sdcorejs-repair-loop`; do not edit during review.
