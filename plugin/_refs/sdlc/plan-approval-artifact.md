# Approved Plan Artifact

Read this reference after the user explicitly approves an `sdcorejs-plan`
draft.

## Contents

- [Path And Hash](#path-and-hash)
- [Frontmatter](#frontmatter)
- [Body](#body)
- [Handoff](#handoff)

## Path And Hash

Write an immutable snapshot:

```text
<target-project>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>.md
```

Compute `approved_plan_hash` over the canonical approved plan body, excluding
frontmatter and the `approved_plan_hash` field.

## Frontmatter

```yaml
---
artifact_id: plan-<contract-id>-r<revision>
artifact_kind: plan
change_ref: <contract id>
source_spec: .sdcorejs/specs/<track>/<timestamp>-<topic>.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
name: <kebab-topic>
description: <one-line future-loading hook>
approvedAt: <ISO-8601 timestamp with timezone>
approvedBy: <git user.email or session user when known>
track: <angular|nestjs|nextjs|test|product|generic>
sourceSpecPath: .sdcorejs/specs/<track>/<timestamp>-<topic>.md
taskCount: <N>
phaseCount: <M>
target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
stack_profile: <stack profile>
approved_spec_hash: <sha256 from spec_context>
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
approved_plan_hash: <sha256 of approved plan body excluding frontmatter and this hash field>
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
