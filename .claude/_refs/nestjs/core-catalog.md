# @sdcorejs/nestjs Core Catalog

This catalog is grounded in the declarations of `@sdcorejs/nestjs@1.0.0`.
Verify installed declarations before generation; current evidence selects Node
`>=18.18`, NestJS 11 peer dependencies, and strict TypeScript.

## Supported imports

Use only exports proven by the installed package:

- `@sdcorejs/nestjs`
- `@sdcorejs/nestjs/core`
- `@sdcorejs/nestjs/auth`
- `@sdcorejs/nestjs/services`
- `@sdcorejs/nestjs/validation`
- `@sdcorejs/nestjs/queue`
- `@sdcorejs/nestjs/i18n`
- `@sdcorejs/nestjs/features`

Do not invent a subpath. Application helpers remain application-local unless the
installed package exports them.

## BaseRepository

`BaseRepository<T>` is constructed with the entity target, DataSource, and
repository options. Its verified API is:

- reads: `paging`, `pagingDeleted`, `all`, `search`, `detail`;
- writes: `create`, `update`, `delete`, `softDelete`, `restore`, `import`;
- accessors: `queryRunner`, `repository`, `target`, `getRepository`.

Write methods accept the optional `QueryRunner` declared by the installed
version. `BaseService.import` does not expose a runner in v1.0.0; use the
repository method when an import must join an explicit transaction.

## BaseService and controllers

`BaseService` provides reusable CRUD mechanics but does not replace domain
authorization, trusted scope derivation, or transaction-time rechecks.

`BaseController` currently exposes inherited search, paging, detail, and delete
routes. New generated controllers must enumerate routes explicitly so route
authentication, permission metadata, parameter validation, read-only behavior,
and route audits are complete. Reuse internal service/repository mechanics, not
an unauditable inherited HTTP surface.

## Auth, validation, and errors

- Authentication establishes a trusted actor before authorization.
- Generated production authentication uses `jose` `jwtVerify` with a remote
  JWKS, exact issuer/audience checks, an asymmetric algorithm allowlist,
  required lifetime claims, bounded clock tolerance, and bounded token age.
- `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_JWKS_URI`, and
  `OIDC_ALLOWED_ALGORITHMS` are validated configuration. Production issuer and
  JWKS URLs require HTTPS.
- Permission, tenant, and department claim names are configuration, but their
  values are accepted only after cryptographic verification. Request bodies,
  headers other than the bearer token, and capability flags never establish
  actor scope.
- Test doubles may exist only in test code. Production modules bind
  `TOKEN_VERIFIER` to `OidcTokenVerifier`; tests exercise that same verifier
  against locally served JWKS and signed tokens rather than overriding it.
- `@HasPermission` or the generated policy decorator records stable permission
  metadata.
- Zod validation rejects unknown and server-owned request fields.
- Application errors use one stable `{ code, message, data? }` envelope and
  never expose stack traces, SQL, or secrets.

## Compatibility rule

Generated package metadata must agree with the installed core package's engines
and peer dependencies. When declarations differ from this catalog, stop and
update the catalog through an approved skill-pack change rather than guessing.
