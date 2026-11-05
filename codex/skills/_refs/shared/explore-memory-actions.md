# Explore: Memory Actions

## Memory Actions

`memories-read` loads only relevant memory index/metadata first, not every
memory body.

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
