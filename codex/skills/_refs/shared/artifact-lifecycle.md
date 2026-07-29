# SDCoreJS Artifact Lifecycle

This reference defines ownership, metadata, runtime propagation, Git closure,
and redaction rules for `.sdcorejs/**` artifacts. Read it before any workflow
writes, verifies, stages, commits, or pushes those artifacts.

`_refs/shared/artifact-lifecycle.mjs` provides a deterministic, read-only
discovery and classification helper. It never stages or commits files.

## Contents

- [Lifecycle Classes](#lifecycle-classes)
- [Durable Metadata](#durable-artifact-metadata)
- [Runtime Context](#runtime-artifact_context)
- [Producer Rules](#producer-rules)
- [Summary Ownership](#summary-ownership)
- [Explicit Handoffs](#explicit-handoffs)
- [Artifact Closure](#sdcorejs-artifact-closure)
- [Push Rule](#push-rule)
- [Concurrency And Ownership](#concurrency-and-ownership)
- [Redaction](#redaction)

## Lifecycle Classes

| Lifecycle | Examples | Commit policy |
|---|---|---|
| Change-scoped durable | approved spec, approved plan, execution doc, feature ledger, verified guide screenshot or documentation asset | `with-change` |
| Shared durable | project summary, persona, memory, living track backlog | `conditional`, with an explicit owner |
| Explicit handoff | requested change-scoped handoff | `conditional` or `with-change` |
| Diagnostic/local | trace, video, raw report, coverage HTML, auth/storage state, failure screenshot or diagnostic screenshot, temp, cache, codegraph cache, legacy session checkpoint | `never` |
| Unknown | unclassified path or insufficient relationship metadata | never auto-stage; report ambiguity |

No mutable global artifact manifest is allowed. In particular, do not create a
"current change", active task, session index, per-thread session file, or other
shared current-state file.

## Durable Artifact Metadata

New or updated durable artifacts use top-level frontmatter when the format
supports it:

```yaml
artifact_id: <stable id>
artifact_kind: spec | plan | execution-doc | feature-ledger | handoff | summary | task | memory | persona | documentation-asset
change_ref: <logical change id or durable artifact path>
source_spec: <repo-relative path | none>
source_plan: <repo-relative path | none>
commit_policy: with-change | conditional | never
owner: <workflow or integration role>
```

Use repository-relative paths. Do not bulk-rewrite historical artifacts only to
add metadata. For legacy artifacts, infer relationships conservatively from
frontmatter, source paths, the current diff, and explicit user scope. Ambiguity
remains ambiguity.

## Runtime `artifact_context`

Every workflow that creates or updates `.sdcorejs/**` builds and passes this
context to its exact consumer. User-facing output normally projects only
artifact paths/classification, closure blockers, and required action; it does
not echo the full structure.

```yaml
artifact_context:
  schema_version: 1
  change_ref: <id or durable artifact path>
  source_spec: <path | none>
  source_plan: <path | none>
  required_with_change:
    - path: .sdcorejs/specs/<track>/<file>.md
      kind: spec
      reason: approved scope
  shared_owned:
    - path: .sdcorejs/tasks/<track>.md
      kind: task
      reason: integration owner updated the durable backlog
  conditional:
    - path: .sdcorejs/summary.md
      kind: summary
      reason: architecture-level change invalidated the project index
  local_only:
    - path: <path>
      kind: diagnostic
      reason: runtime evidence or cache
  unrelated_observed: []
```

The producer passes this runtime block through the finish/tail chain to
`sdcorejs-ship`, which exposes it as `ship_context.artifact_context`.
`sdcorejs-git` consumes it. Do not persist the block in a global manifest.

When several producers run, merge contexts by `change_ref` and path:

- a stricter `never` policy wins;
- `required_with_change` wins over `conditional` only when relationship
  metadata proves the same change;
- shared ownership must name one workflow or integration role;
- runtime `required_with_change` or `shared_owned` never overrides a shared
  artifact's ownership requirement; normalize it to `shared_owned` only when
  ownership is proven, otherwise keep it `conditional`;
- unrelated and local-only observations never become required by merging.

## Producer Rules

- Approved specs, plans, execution docs, feature ledgers, and approved
  documentation assets are normally `required_with_change`.
- Summary, persona, memory, and living track backlog writes are
  `shared_owned` only when the current workflow is the explicit owner;
  otherwise they remain `conditional`.
- A worker in a parallel write workflow creates only change-scoped artifacts
  inside its ownership boundary. It must not update shared artifacts.
- The integration/fan-in owner updates shared artifacts once after results are
  integrated.
- A handoff is created only on explicit request, blocked/deferred transfer, or
  a genuine recovery need. It is immutable/change-scoped and is not live
  progress.
- Local diagnostics, raw reports, coverage HTML, caches, browser/auth/storage
  state, traces, videos, temp files, and graph caches are always `local_only`.
- A verified guide screenshot is `required_with_change` only when its current
  UI capture evidence is PII-safe, hashed, and referenced by the changed guide.
  Failure/diagnostic screenshots remain `local_only`.
- Legacy `.sdcorejs/tasks/current-session.md` and
  `.sdcorejs/tasks/sessions/**` are `local_only`, ignored, never read as
  context, never updated, never staged, and never recreated.

## Summary Ownership

`.sdcorejs/summary.md` is shared durable state. It may be written only when:

- the user explicitly asks for a summary refresh;
- an approved project initialization creates the first project index;
- an architecture-level change invalidates the summary and the sequential
  workflow or integration owner owns the refresh; or
- a fan-in contract assigns the integration owner to update shared context.

Workers and `sdcorejs-git` never generate or edit the summary. Git may include
an already valid owned summary only when `artifact_context` or metadata proves
that ownership and the refresh condition.

## Explicit Handoffs

Use:

```text
.sdcorejs/handoffs/<track>/<timestamp>-<change-id>-handoff.md
```

The artifact must include the durable metadata above, a concise state/evidence
summary, exact next step, and known blockers. Do not include secrets,
credentials, PII, large diffs, raw logs, or full command output. Commit only
when the declared policy and user/workflow intent require the handoff to
survive.

## SDCoreJS Artifact Closure

Before staging, commit, or push, discover:

```bash
git status --short -- .sdcorejs
git diff --name-status -- .sdcorejs
git diff --cached --name-status -- .sdcorejs
```

Do not print secret-bearing content. Classify every changed path as:

```text
required_with_change
shared_owned
conditional
local_only
unrelated
unknown
```

Closure rules:

1. Require all Git discovery commands to succeed. Any failed command makes
   discovery incomplete and blocks closure.
2. Consume runtime `artifact_context` when present, but validate shared
   artifact buckets against explicit ownership.
3. Otherwise reconstruct relationships from frontmatter, `source_spec`,
   `source_plan`, `change_ref`, current diff, and explicit user scope.
4. Automatically include `required_with_change`.
5. Include `shared_owned` only when current ownership is proven.
6. Include `conditional` only when its condition and owner are proven.
7. Exclude `local_only` and `unrelated`.
8. Block if a required artifact is missing.
9. Return `ambiguous` when an unknown path may belong to the change.
10. Screen included paths for secrets and PII without printing values.
11. Stage only an explicit path list.
12. Never use `git add .`, `git add -A`, or `git add .sdcorejs`.
13. After commit, confirm no task-owned required artifact remains outside it.

Use this ledger:

```yaml
sdcorejs_artifacts:
  change_ref:
  discovery_complete: true | false
  discovery_errors: []
  discovered_paths: []
  required_paths: []
  shared_owned_paths: []
  conditional_paths: []
  included_paths: []
  excluded_unrelated_paths: []
  local_only_paths: []
  unknown_paths: []
  missing_required_paths: []
  invalid_context_paths: []
  uncommitted_included_paths: []
  closure_result: complete | incomplete | ambiguous
```

When closure is complete, do not ask whether each required spec, plan, or
execution doc should be included. The user's request to commit the change
already includes valid required artifacts.

## Push Rule

Push only commits. Therefore:

- "commit and push" completes closure before commit;
- push is blocked with `artifact closure incomplete` when a required artifact
  remains uncommitted;
- clearly unrelated, unstaged changes from another thread do not block pushing
  the current commit when repository policy otherwise allows it;
- never force-push;
- never auto-commit local-only artifacts.

## Concurrency And Ownership

- Read-only threads may share a checkout.
- Write-capable threads should use separate branches/worktrees unless
  mechanical ownership and resource checks prove a safe exception.
- Workers edit assigned paths and create change-scoped artifacts only.
- Workers do not modify summary, persona, memory, or living track backlogs.
- The integration/fan-in owner updates shared artifacts once.
- `sdcorejs-git` runs only after fan-in for parallel write workflows.
- Session checkpoint files are never used for coordination.
- Removing a checkpoint file does not make concurrent writes to one checkout
  safe; workspace and ownership isolation still apply.

## Redaction

Never store or print secret values, credentials, tokens, private keys,
Authorization headers, cookies, database URLs, production payloads, customer
PII, or raw sensitive logs. Report only the path, key/category, risk reason,
and `[REDACTED]`. A suspected secret in an included artifact blocks closure.
