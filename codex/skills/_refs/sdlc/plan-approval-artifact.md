# Approved Plan Artifact

Read this reference after the user explicitly approves an `sdcorejs-plan`
draft.

## Contents

- [Path And Hash](#path-and-hash)
- [Repository Ownership](#repository-ownership)
- [Frontmatter](#frontmatter)
- [Body](#body)
- [Handoff](#handoff)

## Path And Hash

Write an immutable snapshot:

```text
<semantic-owner-root>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>.md
```

Create and verify the immutable identity with
`_refs/shared/approved-artifact.mjs`. Its versioned `sha256:v1`
canonicalization includes body and protected metadata, normalizes UTF-8 line
endings/field order, excludes only `approval_hash`, and excludes absolute
checkout paths. `approved_plan_hash` is the compatibility projection of
canonical `approval_hash`.

## Repository Ownership

Write a repository-local plan in its semantic owner repository. A module-owned
plan is never written to the portal. Multi-repository work uses exact
parent/child references and one Git root per mutable step; the parent contains
integration order and references, not editable copies of child plans.

## Frontmatter

```yaml
---
artifact_id: plan-<contract-id>-r<revision>
artifact_kind: plan
schema_version: 1
change_ref: <contract id>
source_spec: .sdcorejs/specs/<track>/<timestamp>-<topic>.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
name: <kebab-topic>
description: <one-line future-loading hook>
contract_id: <contract id>
requirement_id: <requirement id>
approved_at: <ISO-8601 UTC timestamp>
approved_by: <safe session identity or null>
approval_source: explicit-user-choice | imported-approved-plan
track: <canonical track from _refs/shared/system-registry.json>
sourceSpecPath: .sdcorejs/specs/<track>/<timestamp>-<topic>.md
approved_spec_reference:
  repository_id: <stable spec owner repository id>
  repository_relative_path: .sdcorejs/specs/<track>/<timestamp>-<topic>.md
  artifact_id: <approved spec artifact id>
  revision: <exact 40-character owner-repository revision>
  approval_hash: <exact spec sha256:v1 hash>
parent_repository_id: <integration/parent repository id or null>
parent_references:
  - repository_id: <stable parent repository id>
    artifact_id: <exact parent artifact id>
    artifact_kind: spec | plan
    revision: <exact 40-character repository revision>
    approval_hash: <exact sha256:v1 hash>
owner_repository_id: <stable plan owner repository id>
owner_repository_role: standalone | portal | module | library | service | documentation
owner_module_id: <module id or null>
execution_host_repository_id: <stable execution host repository id>
integration_owner_repository_id: <stable integration owner repository id>
repository_relative_path: .sdcorejs/plans/<track>/<timestamp>-<topic>.md
source_revision: <40-character owner-repository revision>
dependency_order:
  - <repository-local unit id>
gitlink_updates_in_scope: true | false
task_count: <N>
phase_count: <M>
target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
stack_profile: <stack profile>
approved_spec_hash: <same exact hash as approved_spec_reference.approval_hash>
allowed_paths:
  - <path or glob>
prohibited_paths:
  - <path or glob>
dependency_changes:
  required: true | false
  approval_required: true | false
env_changes:
  required: true | false
  approval_required: true | false
migration_changes:
  required: true | false
  approval_required: true | false
verification_strategy:
  package_manager: <detected manager or unknown>
  commands_planned:
    - <actual command/script>
approval_hash: <sha256:v1 hash created by approved-artifact helper>
approved_plan_hash: <same value as approval_hash for compatibility>
supersedes: <prior approved plan path or null>
change_control:
  revision: <integer>
  supersedes: <prior approved plan path or null>
  change_reason: <reason or null>
---
```

## Body

```markdown
# <Title> - Approved Plan

> Snapshot of what the user approved at the `sdcorejs-plan` gate. Do not edit by hand; re-author through `sdcorejs-plan` if the contract changes.

## Approved contract
<verbatim approved plan content>

## Decisions captured during review
- <what changed during review, or `(approved as drafted)`>

## Skill provenance
sdcorejs-plan (approved on attempt <N> / 3)
```

## Handoff

Emit the approved spec, draft plan, and approved plan under
`artifact_context.required_with_change`, set `source_plan` to the approved
snapshot, and return final `plan_context` with hashes, write scope,
verification/package-manager evidence, parallel candidates, dependency/env/
migration boundaries, and change control. Handoff to `sdcorejs-execute-plan`
only after the snapshot write succeeds.
