# Initialize a Bounded-Context Module

Read the resolved profile and manifest node. Create one module root without
re-resolving the profile.

## Required inputs

- module slug and route prefix;
- owned schema and entity list;
- imported service ports;
- exported service ports;
- profile-specific scope requirements.

## Shape

```text
src/modules/<module>/
  <module>.module.ts
  controllers/
  entities/
  repositories/
  schemas/
  services/
```

Bind ports with explicit Symbol tokens. Export service ports only; do not export
raw repositories or concrete implementation classes. Consumers import the
producing module and inject its service port. Reject a dependency cycle rather
than hiding it with global modules.

Register entities once in `TypeOrmModule.forFeature`, routes once, and providers
once. Keep migration ownership with the module schema. Enterprise modules declare
which entities require tenant and optional department scope.

## Profile propagation

Every entity/action task receives the unchanged resolved profile. A module cannot
silently add tenant fields to `simple` or omit required enterprise scope.

## Verification

Compile the module through real Nest dependency injection. Assert provider tokens,
exports, route prefix, migration registration, and absence of raw cross-module
repository access.
