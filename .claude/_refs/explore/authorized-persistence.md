# Explore Authorized Persistence

Read this reference only for `summary-refresh` and `*-write-approved`
explore actions, after the approval source, authoring-repo guard, target path
and `_refs/shared/artifact-lifecycle.md` checks pass. Record every write in
`explore_context.writes` and emit `artifact_context`.

## Summary refresh

Follow the ownership conditions and Summary v2 contract in
`_refs/shared/explore-context.md`.

## Durable scoped code map

Do not generate, embed, auto-refresh, or commit a repository-wide codegraph.
`code-map-write-approved` may persist only the explicitly approved task-scoped
map under its semantic owner repository. Missing owner repositories block; a
portal is not a fallback for a module-owned map.

## Env file creation

`env-setup-write-approved` may create a safe env file from an example only after
explicit approval. Use placeholders only, preserve existing files, and record
the write in `explore_context`.

## Persona

`persona-write-approved` requires explicit user request or approval. Do not
write persona into the `sdcorejs-agent` authoring repo or another skill-pack
authoring repo unless explicitly targeted. Do not include secrets or PII.

Persona file template:

```markdown
---
artifact_id: project-persona
artifact_kind: persona
change_ref: shared-project-persona
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore
persona: non-tech   # tech | non-tech
set: <YYYY-MM-DD>   # use current date
---

Persona for this project. Managed by `sdcorejs-explore (persona mode)`.
See `_refs/shared/persona.md` for what each persona changes.
```

## Memories

`memories-write-approved` requires explicit durable knowledge and user approval.
Do not save secrets, credentials, PII, transient task state, speculation, or
uncertain facts as memory. Do not default every memory to angular.

Memory entries should include:

```yaml
---
artifact_id: memory-<scope>-<timestamp>
artifact_kind: memory
change_ref: shared-project-memory
source_spec: <path | none>
source_plan: <path | none>
commit_policy: conditional
owner: sdcorejs-explore
track: general
stack_profile: general
source_skill: sdcorejs-explore
applies_to: <scope>
created_at: <ISO timestamp>
evidence: <source>
confidence: high | medium | low
---
```

Supported track labels include: general, angular, nestjs, nextjs, react, product, design, test, documentation, workflow, and repo-specific labels.
