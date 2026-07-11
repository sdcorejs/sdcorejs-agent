# NestJS SDLC Track

Use this reference during brainstorming, spec, and plan work for an SDCoreJS
NestJS backend.

## Discovery inputs

Confirm:

- existing versus new backend;
- `simple` or `enterprise` profile;
- modules, entities, actions, and read-only resources;
- authenticated actors, permission codes, tenant and optional department scope;
- database, Keycloak, import/export, and concurrency requirements;
- required unit, integration, E2E, and container evidence.

## Planning contract

Plans must reference `_refs/nestjs/pack-manifest.json` and
`_refs/nestjs/profile-contract.json`. The selected profile is one immutable
input to all packs. Use TDD for generated behavior and explicit commands for each
evidence tier.

A new backend follows: init-project -> init-admin -> init-module -> init-entity
-> actions -> generated tests -> review/repair -> ship gates.

## Security minimum

Protected routes authenticate and authorize explicitly. Enterprise data access is
tenant-scoped mechanically and fails closed without trusted scope. Request types
exclude server-owned fields. Production configuration is validated, migrations
own schema changes, and secret material stays outside DTOs and logs.
