# Explore Context And Summary v2

Use this reference after `sdcorejs-explore` selects an action that emits
`explore_context`, reads a project summary, or owns an approved summary refresh.

## Contents

- [Explore Context](#explore-context)
- [Summary Read](#summary-read)
- [Summary Refresh Authorization](#summary-refresh-authorization)
- [Summary v2 Frontmatter](#summary-v2-frontmatter)
- [Summary v2 Body](#summary-v2-body)
- [Freshness Rules](#freshness-rules)

## Explore Context

Every `sdcorejs-explore` action builds this runtime context for its exact
consumer. Do not render the full block in every user response. Project only
the requested map/trace/summary outcome, evidence limits, blockers, and next
action; use a validated portable handoff when the runtime context channel is
unsupported or unknown.

```yaml
explore_context:
  source: sdcorejs-explore
  action: summary-read | summary-refresh | code-map-readonly | code-map-write-approved | trace-flow-readonly | env-setup-readonly | env-setup-write-approved | recovery-readonly | persona-read | persona-write-approved | memories-read | memories-write-approved | documentation-harvest-readonly
  target_root: <path>
  target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
  tracks:
    - angular | nestjs | nextjs | react | node | product | design | test | documentation | workflow | general
  stack_profiles:
    - core-ui-angular | legacy-core-ui-angular | plain-angular | sdcorejs-nestjs | plain-nestjs | nextjs-build-website | plain-nextjs | react-vite | react-cra | react-next-generic | node-general | general
  profile_confidence: high | medium | low
  profile_evidence:
    - profile: <stack_profile>
      evidence:
        - <path or dependency or config signal>
  repository_topology:
    execution_host_repository_id: <stable remote-derived id | unknown>
    integration_owner_repository_id: <stable remote-derived id | unknown>
    repositories:
      - repository_id: <stable id | unknown>
        repository_role: portal | module | standalone | integration
        module_id: <id | null>
        repository_relative_path: <path>
        source_revision: <revision | null>
        portal_pinned_revision: <revision | null>
        status: initialized | uninitialized
        freshness: fresh | stale | unknown
    relationships:
      - kind: portal-module-gitlink
        portal_repository_id: <id>
        module_repository_id: <id>
        module_id: <id>
        repository_relative_path: <path>
    artifact_locations:
      - artifact_id: <id | unknown>
        artifact_kind: <kind>
        repository_id: <id>
        repository_relative_path: <path>
    ownership_hypotheses:
      - artifact_id: <id>
        owner_repository_id: <id>
        owner_module_id: <id | null>
        confidence: high | medium | low
        evidence: <relationship metadata/path>
    findings:
      - code: <stable finding code>
        evidence: <repository-relative evidence>
  source_roots:
    - <path>
  files_read:
    - <path>
  commands_run:
    - command: <exact command>
      result: <short result>
      exit: <exit code>
      notes: <redacted notes>
  commands_skipped:
    - command_or_probe: <probe>
      reason: <reason>
  writes:
    - path: <path>
      reason: <reason>
      approved: true | false
  freshness:
    summary_status: fresh | partially-stale | stale | missing | unknown
    usable_sections: []
    invalidated_sections: []
    summary_scope: <scope>
  redaction:
    applied: true | false
    notes: <short note>
  next_skill_hint:
    skill: <sdcorejs-* | none>
    reason: <why>
```

Rules:

- Never include secrets or PII.
- Keep `writes` empty for read-only actions.
- Summarize large `files_read` sets.
- Include only commands that actually ran.
- Cite evidence rather than guesses in `profile_evidence`.
- Resolve tracks/profiles through `_refs/shared/system-registry.json`; every
  first-class track, including `ai-agent`, is accepted.
- Keep topology discovery read-only. Do not initialize modules, update
  gitlinks, move artifacts, refresh summaries, or migrate discovered state.
- Use stable remote-derived repository IDs and repository-relative artifact
  paths. Absolute checkout paths are not durable identity.
- Use `next_skill_hint` only as a routing hint.
- For approved writes, also emit the standard `artifact_context` from
  `_refs/shared/artifact-lifecycle.md`.

## Summary Read

Read `.sdcorejs/summary.md` when present and classify it as `fresh`,
`partially-stale`, `stale`, `missing`, or `unknown`.

- Use valid sections from a partially stale summary.
- Treat legacy summaries as `legacy-schema` with `unknown` freshness.
- For missing, stale, or unknown summaries, continue with targeted reads and
  escalate to a scoped code map only when relationships remain unresolved.
- Produce ephemeral orientation when useful; do not write files.

Use `summary-read` for review, test-plan questions, failing-output triage,
recovery, debug triage, code-map requests, and every caller without explicit
summary write authorization.

## Summary Refresh Authorization

Write `.sdcorejs/summary.md` only when:

- the user explicitly requests it;
- approved project initialization owns the first summary;
- an architecture-level change assigns the refresh to the sequential workflow
  or integration owner; or
- a fan-in contract assigns shared context to the integration owner.

Generic write approval and a missing/stale summary are insufficient. Workers
and `sdcorejs-git` never update the summary.

Before writing:

1. Run the authoring-repo guard.
2. Apply redaction.
3. Select the normalized repository-relative `evidence.key_entrypoints`.
4. Compute bounded workspace, dependency, source-root, and entrypoint-contract
   fingerprints with that same declared entrypoint list.
5. Record owner, approval, and writes in `explore_context` and
   `artifact_context`.

Treat the chosen key-entrypoint list and its fingerprint as one refresh
transaction. Do not compute the fingerprint first and add new declared
entrypoints afterward; the next summary read must round-trip as `fresh`.

## Summary v2 Frontmatter

```yaml
---
schema_version: 2
kind: project-summary
generated_at: <ISO timestamp>
generator: sdcorejs-explore
target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
tracks: []
stack_profiles: []
summary_scope: <scope>
source_roots: []
repository:
  repository_id: <stable remote-derived id | unknown>
  repository_role: portal | module | standalone | integration
  module_id: <id | null>
  parent_repository_id: <stable id | null>
evidence:
  workspace_configs: []
  package_manifests: []
  key_entrypoints: []
fingerprints:
  workspace_structure: <sha256 | unknown>
  dependency_manifests: <sha256 | unknown>
  source_roots: <sha256 | unknown>
  entrypoint_contract: <sha256 | unknown>
redaction_applied: true | false
artifact_id: project-summary
artifact_kind: summary
change_ref: shared-project-index
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore | integration-owner
---
```

Use repository-relative paths. Never persist absolute machine paths, current
task/progress, current spec/plan, resume instructions, working-tree or session
status, recently changed files, or current-change verification. Branch and HEAD
must not be the sole freshness keys.

Each repository owns its own summary. A portal summary may record composition
relationships and pinned module revisions, but it must not contain an editable
copy of a module summary or module-owned code map. Summary and durable
task-scoped code-map authoring belongs only to `sdcorejs-explore`.

## Summary v2 Body

Use these sections:

```markdown
# Project Summary

## Purpose
## Read First
## Stack and Workspace
## Application and Module Map
## Entrypoints and Main Runtime Flows
## Source-of-Truth and Generated Boundaries
## Commands
## Conventions and Invariants
## Task-to-Path Navigation
## Known Unknowns
## Refresh Triggers
```

Use a compact `Area | Path | Responsibility | Entry point | Depends on` module
map. Aim for 100–250 lines. Do not dump a large tree, full code, every symbol,
or repeated README/package content.

## Freshness Rules

- `fresh`: all relevant known fingerprints match.
- `partially-stale`: one category changed; keep unaffected sections.
- `stale`: workspace/source-root/module boundaries changed materially across
  categories.
- `missing`: no summary exists.
- `unknown`: legacy schema, missing evidence, or unsafe calculation.

Unrelated source-content edits do not invalidate Summary v2. Dependency changes
invalidate stack/command/convention sections; workspace and source-root changes
invalidate only their mapped architecture/navigation sections.

The `entrypoint_contract` fingerprint includes package entrypoint fields
(`main`, `bin`, `exports`, `module`, `browser`, and `types`), known
adapter/plugin entrypoints, and the existence of declared
`evidence.key_entrypoints`. Deleting or renaming one invalidates only
`Application and Module Map`, `Entrypoints and Main Runtime Flows`, and
`Task-to-Path Navigation`. Unknown fingerprints never pretend to be fresh.
