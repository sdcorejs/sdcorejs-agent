# Project Context Preflight v2

Use this read-oriented context assembler before non-trivial SDCoreJS skill
execution. It selects relevant evidence without making project writes.

The deterministic helper `_refs/shared/project-context.mjs` implements summary
freshness, context-strategy selection, graph-provider detection, and a
side-effect-free runtime projection. Skills may call it when the helper is
available; the contract in this reference remains authoritative.

## Contents

- [Caller Contract](#caller-contract)
- [Non-recursion](#non-recursion-rule)
- [Context Priority](#context-priority)
- [Resolve Target Root](#step-1---resolve-target-root)
- [Detect Tracks And Profiles](#step-2---detect-tracks-and-profiles)
- [Read Summary v2](#step-3---read-summary-v2)
- [Select Code Context](#step-4---select-code-context-strategy)
- [Select Related Artifacts](#step-5---select-related-artifacts)
- [Redaction And Bounded Reads](#step-6---redaction-and-bounded-reads)
- [No-write Invariant](#no-write-invariant)
- [Output Contract](#output-contract)

## Caller Contract

Classify the caller before applying the preflight:

```text
caller_context: <skill-name>
context_mode: read-only | write-approved | summary-read | summary-refresh | code-map-readonly | trace-flow-readonly | env-setup-readonly | recovery-readonly | persona-read | memories-read | conventions-read | documentation-harvest-readonly
side_effects_allowed: true | false
request_scope: <short task scope>
```

`side_effects_allowed` describes the caller, not this preflight. Project
context itself is always read-only. A write-approved caller still needs the
owning workflow and artifact lifecycle contract before it writes anything.

## Non-Recursion Rule

Project context must never recursively invoke `sdcorejs-explore` while
`sdcorejs-explore` is active. When the caller is `sdcorejs-explore`, return
summary status and selected evidence; let the active explore action continue.

Missing or stale summary is a context signal, never write permission and never
a blocker for code, test, review, debug, planning, or Git work.

## Context Priority

Resolve context in this order:

1. Current user request.
2. Repository instructions such as `AGENTS.md`.
3. Explicit files, diffs, errors, logs, or artifacts named by the user.
4. Fresh or partially usable `.sdcorejs/summary.md` sections.
5. Approved specs/plans directly related to the change.
6. Artifact relationship metadata from `_refs/shared/artifact-lifecycle.md`.
7. Current Git status, diff, or log when the task needs it.
8. Targeted source, config, and test reads.
9. A scoped code map when cross-component relationships remain unclear.
10. Relevant memory or an explicit handoff tied to the same change.

Use relevance before recency. Do not load an artifact merely because it is the
newest, and do not default to the latest three documents when they are
unrelated.

Current files, diffs, logs, failing tests, commands, and explicit user
corrections override durable context.

## Step 1 - Resolve Target Root

Prefer:

```bash
git rev-parse --show-toplevel
```

Otherwise use the user-provided root or current directory. Classify:

```text
target-project
sdcorejs-agent-authoring-repo
skill-pack-authoring-repo
unknown
```

Unknown roots remain read-only until clarified. Authoring repositories may be
the explicit target, but project-context still makes no writes.

## Step 2 - Detect Tracks And Profiles

Use concrete project evidence to detect applicable tracks and stack profiles:

- Angular: `angular.json`, Angular dependencies, routes, components, or tests;
- NestJS: `nest-cli.json`, Nest dependencies, modules, controllers, or tests;
- Next.js: `next.config.*`, Next dependency, app/pages routes, or tests;
- React/Node/general: actual manifests, configs, source, and tests;
- product/design/test/documentation/workflow: request intent plus matching
  source folders and artifacts.

Use Core UI, SDCoreJS Nest, and build-website profiles only when the repository
contains their actual package, import, config, or contract evidence. Profiles
are evidence, not unquestionable truth.

## Step 3 - Read Summary v2

Read `.sdcorejs/summary.md` when it exists.

- `schema_version: 2` summaries use section-level fingerprint checks.
- Summary v2 freshness uses four bounded fingerprints:
  `workspace_structure`, `dependency_manifests`, `source_roots`, and
  `entrypoint_contract`.
- `entrypoint_contract` covers package entrypoint fields such as `main`, `bin`,
  and `exports`, known adapter/plugin entrypoints, and whether declared
  `evidence.key_entrypoints` still exist. It does not rely only on conventional
  `main`, `index`, `server`, or `bootstrap` filenames.
- Legacy summaries remain readable but have `legacy-schema` and `unknown`
  freshness until a write-approved `summary-refresh` upgrades them.
- Missing summaries return `missing`.
- Invalid or unverifiable fingerprints return `unknown` or the appropriate
  stale status; never pretend they are fresh.

Summary status values:

```text
fresh | partially-stale | stale | missing | unknown
```

Use valid sections from a partially stale summary and replace only invalidated
sections with targeted reads. Branch name and current HEAD are not summary
freshness keys.

Deleting or renaming a declared entrypoint invalidates only `Application and
Module Map`, `Entrypoints and Main Runtime Flows`, and `Task-to-Path
Navigation`. An unrelated source-content edit does not invalidate the summary.
Summary refresh must pass the same normalized `evidence.key_entrypoints` list
into fingerprint computation before persisting both values.

## Step 4 - Select Code Context Strategy

Use the smallest sufficient strategy:

1. `summary-only` for orientation when a fresh summary answers the navigation
   question.
2. `targeted-read` for a small task, named files, a known entrypoint, or a
   relationship answerable from `rg`, manifests, route/module config, or a few
   source/test files.
3. `scoped-code-map` when the task crosses modules, packages, or layers; needs
   impact/ownership analysis; or requires a UI -> client -> API -> service ->
   persistence trace.
4. `existing-codegraph` only when the repository already provides a dependency
   graph, language index, LSP index, or build graph and a read-only scoped query
   is documented.

Do not install a graph tool, generate a repository-wide graph, persist a code
map, or treat graph output as stronger than current code/config. Query only the
required slice. Any provider cache is `local-only` under the artifact lifecycle
contract.

A scoped code map returns:

```yaml
code_context:
  strategy: scoped-code-map
  scope: <feature/module/flow>
  entrypoints: []
  nodes:
    - id: <logical id>
      kind: <module/package/route/service/file>
      path: <repo-relative path>
      responsibility: <short description>
  edges:
    - from: <id>
      to: <id>
      relation: imports | calls | routes-to | injects | reads | writes | emits | generates
      evidence: <repo-relative path>
  unresolved_relationships: []
```

Keep it bounded. Do not load or display thousands of nodes.

## Step 5 - Select Related Artifacts

Read artifact frontmatter first and follow `change_ref`, `source_spec`,
`source_plan`, and explicit user scope. Load bodies only for artifacts that are
actually related.

Relevant durable inputs may include:

- `.sdcorejs/specs/<track>/*.md`;
- `.sdcorejs/plans/<track>/*.md`;
- `.sdcorejs/docs/<track>/*.md`;
- `.sdcorejs/handoffs/<track>/*.md` when explicitly relevant;
- `.sdcorejs/memories/<track>/*.md`;
- `.sdcorejs/tasks/<track>.md` when a durable shared backlog is relevant.

Ignore legacy `.sdcorejs/tasks/current-session.md` and
`.sdcorejs/tasks/sessions/**`. Do not read them as resume or ownership signals.
Do not update, stage, delete, or recreate them.

For recovery, use the approved plan, relevant change-scoped artifacts, an
explicit handoff, Git evidence, and current user direction. Do not auto-resume.

Load project conventions from `.sdcorejs/conventions/**` for the categories the
current task actually touches, through `collectConventionProjection` in
`_refs/shared/project-context.mjs`. Read metadata before bodies and return rule
identifiers and paths only; dumping rule bodies into every context rebuilds the
single catalog the one-rule-per-file layout exists to avoid. Preserve owner
repository identity and current revision evidence, use repository-relative
paths, and mark an unparseable or schema-invalid rule as invalid rather than
guessing at it. Conventions are independent of summary freshness and are never
written during context preflight. See `_refs/shared/convention-context.md`.

## Step 6 - Redaction And Bounded Reads

- Prefer `git ls-files`, targeted `rg`, manifests, entrypoints, configs, and
  nearby tests.
- Exclude vendor, generated, build, cache, trace, storage-state, and binary
  output unless directly relevant.
- Do not read secret values from env files or logs.
- Report sensitive evidence only by path, key/category, and `[REDACTED]`.
- Cap broad result sets and record unresolved relationships instead of dumping
  the repository.

## No-Write Invariant

This preflight must not:

- create or refresh a summary;
- create a task file or handoff;
- write memory, persona, docs, metadata, or source;
- persist `project_context` or `artifact_context`;
- write a code map or graph cache;
- stage files or mutate Git state.

It decides what to read and returns runtime context only.

## Output Contract

```yaml
project_context:
  target_root: <path>
  target_root_kind: <kind>
  request_scope: <short task scope>
  tracks: []
  stack_profiles: []
  summary:
    status: fresh | partially-stale | stale | missing | unknown
    schema: v2 | legacy-schema | missing | unknown
    path: .sdcorejs/summary.md | none
    usable_sections: []
    invalidated_sections: []
  related_artifacts:
    specs: []
    plans: []
    docs: []
    handoffs: []
    tasks: []
  conventions:
    policy_status: missing | valid | invalid
    policy_path: .sdcorejs/conventions/policy.yaml | none
    loaded_paths: []
    accepted_rule_ids: []
    observed_rule_ids: []
    conflicted_rule_ids: []
    deprecated_rule_ids: []
    stale_rule_ids: []
    invalid_paths: []
    unresolved_owner_repositories: []
  code_context:
    strategy: summary-only | targeted-read | scoped-code-map | existing-codegraph
    scope: <scope>
    entrypoints: []
    evidence_paths: []
    unresolved_relationships: []
  current_evidence:
    files: []
    diffs: []
    commands: []
  writes_allowed: true | false
  local_runtime_writes_allowed_after_consent: true | false
  redaction_applied: true | false
```

This block is runtime-only. Do not persist it as a global project file.

## Local Runtime Writes

`local_runtime_writes_allowed_after_consent` is a separate boundary from
`writes_allowed`. It governs conversation-local runtime state only, such as
`.sdcorejs/tmp/visual-companion/**`, and it is `false` until the user
explicitly confirms it for the current purpose.

- It never authorizes a durable `.sdcorejs/**` artifact, source code, or Git
  state. Those stay under `writes_allowed` and the normal approval gates.
- It never survives as a standing permission. Confirm it again for a new
  purpose.
- Read-only contexts keep it `false` even when a runtime is technically able to
  write.
- Everything it authorizes is `local_only` under
  `_refs/shared/artifact-lifecycle.md`: never staged, never committed, and
  never read back as project context.
