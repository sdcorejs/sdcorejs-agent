---
name: sdcorejs-nestjs
description: NestJS code executor for approved/direct backend work with confirmed requirements. Use after execute-plan or for project/admin/module/entity CRUD, explicit endpoints, workflows, bulk operations, exports, or reuse of @sdcorejs/utils. Loads the canonical NestJS manifest and only the packs required for the resolved profile. Not for spec, plan, review, or unresolved requests. Runs the mandatory finish tail. Runtime-localized.
allowed-tools: AskUserQuestion, Bash, Edit, Glob, Grep, Read, TodoWrite, WebFetch, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->


# SDCoreJS NestJS Executor

## Shared protocols

Before execution:

1. Read `_refs/shared/runtime-protocols.md`, then apply
   `_refs/shared/tasklist.md`.
2. Read and apply `_refs/shared/project-context.md` as a read-only,
   relevance-first context assembler.
3. Read `_refs/shared/artifact-lifecycle.md` and merge producer
   `artifact_context` through the finishing tail.
4. Read and apply `_refs/shared/user-choice-prompt.md` before any user-facing
   choice, approval, or finish gate.
5. Use valid summary sections when available. Missing or stale summary never
   blocks generation; continue with targeted reads or a scoped code map.
6. Read `_refs/nestjs/pack-manifest.json`,
   `_refs/nestjs/profile-contract.json`, and
   `_refs/nestjs/core-catalog.md`.
7. Before authoring a helper, read `_refs/shared/sdcorejs-utils.md`.

## Resolve the generation contract once

Resolve `profile` exactly once from the approved plan or fresh project summary.
Use `simple` only when no profile is declared. Validate the resolved profile
against `profile-contract.json`, store it in the run context, and pass the same
resolved profile unchanged to every dispatched pack. A pack must not infer,
override, or downgrade the profile.

Fail before writing when:

- the manifest/profile schema is invalid;
- required pack inputs are missing;
- an output would escape the target root or overwrite undeclared files;
- an enterprise operation lacks trusted tenant context;
- authentication or permission metadata cannot be generated.

## Dispatch graph

Read packs on demand in manifest dependency order:

1. `_refs/nestjs/write-code/init-project.md` for a new backend.
2. `_refs/nestjs/write-code/init-admin.md` for the required authn/authz authority.
3. `_refs/nestjs/write-code/init-module.md` for each bounded context.
4. `_refs/nestjs/write-code/init-entity.md` for explicit entity routes and stacks.
5. `_refs/nestjs/write-code/actions.md` for workflow, import, export, or custom actions.

The deterministic golden generator is
`_refs/nestjs/generator/generate-project.mjs`. It proves the canonical sample
contract; packs explain how to generalize that contract to the approved domain.

## Mandatory TDD and safety gates

Before each behavior-producing change, invoke `sdcorejs-test (tdd mode)`:

1. Add a focused test and observe the intended RED failure.
2. Add the minimum implementation and observe GREEN.
3. Refactor and rerun the focused test.

Generated controllers explicitly enumerate every route. Protected routes carry
authentication, stable permission metadata, request/parameter validation, and
fail closed when metadata is missing. Do not inherit `BaseController` when doing
so would make the route surface implicit.

## Completion

Create a progress checklist that includes the finishing steps (tests,
optional behavior-preserving simplification, review, code-documentation, technical-doc, user-guide).
Present the consolidated finish
gate from `_refs/shared/finish-gate.md`, then run
`sdcorejs-documentation (documentation-gate mode)` with
`_refs/documentation/gate.md`. Load saved user-guide and technical-doc preferences
from `.sdcorejs/documentation/preferences.md`; code-documentation remains automatic
for touched source.

After the selected test/review/documentation work, apply
`_refs/orchestration/tail/auto-docs.md` and
`_refs/orchestration/tail/auto-task-tracker.md` only when the sequential
workflow or integration owner is authorized to update the durable backlog.
Hand durable project knowledge to
`sdcorejs-explore (memories mode)` when relevant. Always finish with
`sdcorejs-ship (verify-before-done mode)` followed by
`sdcorejs-ship (branch-ready mode)`. Do not invoke `sdcorejs-git` until both
gates pass or a verification deferral is explicitly recorded.
