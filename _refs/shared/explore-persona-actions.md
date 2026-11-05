# Explore: Persona Actions

## Persona Actions

`persona-read` reads the current persona only.

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
