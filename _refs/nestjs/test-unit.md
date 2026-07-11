# NestJS Unit Test Reference

## Applicability

For `sdcorejs-nestjs`, test generated policy, schema, mapper, service, and
transaction decisions in isolation. For `plain-nestjs`, load
`_refs/shared/test-generic.md` and preserve the project's existing runner and
conventions.

Do not install dependencies from this reference. Use the detected package manager
and scripts from the target project.

## Required cases

- strict create/update schemas reject unknown and server-owned fields;
- route parameter schemas reject malformed UUID/date/enum input;
- missing actor or permission metadata denies;
- cross-tenant denial occurs before ownership/role evaluation;
- forged capability flags cannot authorize mutation;
- transition policy rejects stale versions and invalid next states;
- import sanitization handles spreadsheet formula prefixes;
- stable errors exclude stack, SQL, token, and secret material.

Mock infrastructure boundaries, not the policy under test. Name tests by observable
behavior and keep fixtures locale-neutral.

## TDD

Run the smallest discovered unit command to observe RED, implement the minimum
behavior, and rerun to GREEN. Record command, cwd, exit code, and result identity.
