# SDCoreJS Artifact Lifecycle

This reference defines ownership, metadata, runtime propagation, Git closure,
and redaction rules for `.sdcorejs/**` artifacts. Read it before any workflow
writes, verifies, stages, commits, or pushes those artifacts.

`_refs/shared/artifact-lifecycle.mjs` provides a deterministic, read-only
discovery and classification helper. It never stages or commits files.

## Contents

- [Lifecycle Classes](#lifecycle-classes)
- [Canonical Artifact Roots](#canonical-artifact-roots)
- [Durable Metadata](#durable-artifact-metadata)
- [Runtime Context](#runtime-artifact_context)
- [Producer Rules](#producer-rules)
- [Summary Ownership](#summary-ownership)
- [Explicit Handoffs](#explicit-handoffs)
- [Artifact Closure](#sdcorejs-artifact-closure)
- [Push Rule](#push-rule)
- [Concurrency And Ownership](#concurrency-and-ownership)
- [Binary-Safe Discovery](#binary-safe-discovery)
- [Redaction](#redaction)

## Lifecycle Classes

| Lifecycle | Examples | Commit policy |
|---|---|---|
| Change-scoped durable | approved spec, approved architecture, approved plan, execution doc, product ledger, Product document, design handoff, Design spec/flow/decision/wireframe/export/reference, verified guide screenshot or documentation asset | `with-change` |
| Shared durable | project summary, persona, memory, living track backlog, convention rule and capture policy | `conditional`, with an explicit owner |
| Explicit handoff | requested change-scoped handoff | `conditional` or `with-change` |
| Diagnostic/local | trace, video, raw report, coverage HTML, auth/storage state, failure screenshot or diagnostic screenshot, temp, cache, codegraph cache, legacy session checkpoint | `never` |
| Unknown | unclassified path or insufficient relationship metadata | never auto-stage; report ambiguity |

No mutable global artifact manifest is allowed. In particular, do not create a
"current change", active task, session index, per-thread session file, or other
shared current-state file.

## Canonical Artifact Roots

Canonical roots live once in `_refs/shared/system-registry.json` under
`artifact_roots` and are resolved through `_refs/shared/artifact-paths.mjs`. No
helper hardcodes them.

| Root | Artifact kind | Contents |
|---|---|---|
| `.sdcorejs/specs/**` | `spec` | approved specs |
| `.sdcorejs/architecture/**` | `architecture` | immutable approved architecture snapshots |
| `.sdcorejs/plans/**` | `plan` | approved plans |
| `.sdcorejs/product/**` | `product-doc` | PRDs, user stories, acceptance criteria, UAT checklists, Product decisions |
| `.sdcorejs/docs/product/**` | `product-ledger` | Product traceability ledgers |
| `.sdcorejs/design/**` | `design-asset` | Design flows, specs, decisions, wireframes, PNG exports, screenshot references |
| `.sdcorejs/docs/design/**` | `design-handoff` | Design traceability ledgers |
| `.sdcorejs/docs/**` | `execution-doc` | remaining change execution records |
| `.sdcorejs/documentation/**` | `documentation-asset` | documentation layout entries and assets |
| `.sdcorejs/conventions/**` | `convention` | capture policy and one-rule-per-file project conventions |

`.sdcorejs/conventions/**` is classified by `_refs/shared/convention-paths.mjs`.
The path carries identity - scope directory, module segment, category, and rule
filename - so a path that fails validation is `unknown` and blocks closure, and a
`convention` kind claimed outside the root is a metadata/path contradiction that
fails closed. Module rules are owned by the module repository, repository rules
by that repository, and portal-composition rules by the portal or integration
repository. There is no portal fallback for a module-owned rule: an unavailable
or unwritable owner blocks persistence. See
`_refs/shared/convention-context.md`.

`.sdcorejs/product/**` and `.sdcorejs/design/**` are deterministically classified
from the path. They never fall through to `unknown` merely because they are not
ledgers. Category membership requires the declared file extension and the
declared path depth: `flows`, `specs`, and `decisions` address
`<feature>.md`, while `wireframes`, `exports/png`, and `references` address
`<feature>/<screen>.<ext>`. Anything else fails closed to `unknown`.

Documentation-layout promotion checks apply only inside
`.sdcorejs/documentation/**`. That scoping is not an escape hatch: a
`documentation-asset` kind claimed for a path outside the documentation root is a
metadata/path contradiction and fails closed.

Root-level `product/**` and `design/**` are legacy read-only compatibility
inputs. They are never write targets, never valid in new metadata, and are not
part of `.sdcorejs` artifact discovery. See `_refs/shared/product-ledger.md` and
`_refs/shared/design-handoff.md`.

`.sdcorejs/design/diagnostics/**`, `.sdcorejs/design/failures/**`, and
`.sdcorejs/design/tmp/**` are always `local_only`.

`.sdcorejs/tmp/**` is conversation-local runtime state and is always
`local_only` with `commit_policy: never`. This is an explicit rule, not an
incidental consequence of the ignore file. It covers
`.sdcorejs/tmp/visual-companion/**`, which holds Visual Companion session
directories: published screens, server records, event logs, session keys, ports,
and process ids. None of it may be staged, committed, read back as project
context, promoted to a Product or Design artifact, or quoted into a spec, plan,
handoff, or summary. Writing it requires
`local_runtime_writes_allowed_after_consent` from
`_refs/shared/project-context.md`; capability alone is never permission. To keep
a selected mockup, hand the confirmed result to the owning Design workflow.

## Durable Artifact Metadata

New or updated durable artifacts use top-level frontmatter when the format
supports it:

```yaml
artifact_id: <stable id>
artifact_kind: spec | architecture | plan | execution-doc | product-ledger | product-doc | design-handoff | design-asset | handoff | summary | task | memory | persona | documentation-asset | convention
change_ref: <logical change id or durable artifact path>
source_spec: <repo-relative path | none>
source_plan: <repo-relative path | none>
commit_policy: with-change | conditional | never
owner: <workflow or integration role>
```

A binary durable artifact cannot carry frontmatter. It inherits its change
relationship from runtime `artifact_context` or from the Product/Design ledger
that owns the same feature identity.

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

- Approved specs, approved architectures, plans, execution docs, Product documents, product ledgers,
  Design artifacts, design handoffs, and approved documentation assets are
  normally `required_with_change`.
- A Product run emits every created or updated PRD, user-story, acceptance-
  criteria, UAT, and decision document plus its ledger. A Design run emits every
  created or updated spec, flow, decision log, editable wireframe, durable
  export, and approved screenshot reference plus its ledger. Emitting only the
  ledger is a contract violation.
- Summary, persona, memory, living track backlog, and convention writes are
  `shared_owned` only when the current workflow is the explicit owner;
  otherwise they remain `conditional`.
- Convention rules and the capture policy are written only by
  `sdcorejs-explore (conventions-sync-write-approved)` run by the sequential or
  fan-in integration owner. `sdcorejs-review` never writes them, a parallel
  worker never writes them, and `sdcorejs-git` never generates or updates them.
  An authorized same-change sync emits every created or updated convention file,
  not only the policy; a required convention artifact missing from that
  `artifact_context` blocks closure.
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
  UI capture is PII-safe, hashed, and passes the documentation-layout
  relationship. Failure/diagnostic screenshots remain `local_only`.
- A durable Design PNG is `required_with_change` only when it sits under
  `.sdcorejs/design/exports/png/**` or `.sdcorejs/design/references/**`, carries
  valid provenance from `_refs/shared/design-handoff.md`, and is bound to the
  current change through runtime `artifact_context` or the Design ledger for the
  same feature.
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
   buckets and documentation relationships against explicit ownership.
3. Otherwise reconstruct relationships from frontmatter, `source_spec`,
   `source_plan`, `change_ref`, current diff, and explicit user scope.
4. Automatically include `required_with_change`.
5. Include `shared_owned` only when current ownership is proven.
6. Include `conditional` only when its condition and owner are proven.
7. Exclude `local_only` and `unrelated`.
8. Block if a required artifact is missing.
9. Return `ambiguous` for unknown paths or conflicting documentation copies.
10. Screen included paths for secrets and PII without printing values.
11. Stage only an explicit validated path list.
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
  unreadable_required_paths: []
  invalid_context_paths: []
  feature_ledger_conflicts: []
  documentation_layout_conflicts: []
  uncommitted_included_paths: []
  closure_result: complete | incomplete | ambiguous
```

When closure is complete, do not ask whether each required spec, architecture,
plan, or execution doc should be included. The user's request to commit the
change already includes valid required artifacts.

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

## Binary-Safe Discovery

`.sdcorejs/**` now contains binary durable artifacts, notably Design PNG exports
and screenshot references. Discovery treats them as opaque bytes.

Read every discovered artifact as bytes once, then derive three separate
decisions from it. Conflating them is how a credential escapes screening.

1. **Structural handling** is binary when the extension is a known binary type
   or the first 8000 bytes contain a NUL. Binary bytes are never parsed as
   Markdown frontmatter, so binary metadata is `{}`.
2. **Secret screening** is withheld only when the extension *and* the byte probe
   agree the file is genuinely opaque. A text extension carrying a stray NUL is
   still screened, and a binary extension holding decodable text is still
   screened. Neither shape may smuggle a private key past closure. Only truly
   opaque bytes fall back to path-only screening (`.env`-style names,
   credential/private-key/service-account file names).
3. **Integrity** is the `sha256:` content hash, reported for either shape.

Additional rules:

4. Never print, echo, diff, or inline binary content. Report only the path, the
   `sha256:` content hash, and the byte size.
5. Classify a durable binary artifact from its canonical path, runtime
   `artifact_context`, the Product/Design ledger relationship for the same
   feature, its content hash, and its declared provenance. Canonical-path
   membership requires the declared extension and the declared
   `<feature>/<screen>` depth, so a stray archive in an export directory fails
   closed to `unknown` instead of inheriting the feature's change relationship.
6. Keep real-screenshot classification and provenance validation in
   `_refs/shared/design-handoff.mjs`. Lifecycle discovery does not relax it.
7. Keep failure screenshots, traces, videos, auth state, storage state, caches,
   and temporary output `local_only`. Local-only classification is driven only
   by declared directories and diagnostic extensions, never by a filename
   heuristic: it is evaluated before the runtime `artifact_context` bucket, so a
   heuristic would silently override an explicit `required_with_change` entry,
   and `failure-state.png` or `checkout-failed.svg` are legitimate designed
   states. Renderer failure captures belong in `.sdcorejs/design/diagnostics/**`.
8. A required artifact that cannot be read has no integrity evidence and blocks
   closure through `unreadable_required_paths`, unless its Git status is a
   deletion.
9. A Product or Design ledger's feature identity is its path, not its
   frontmatter. A ledger declaring another feature's name, or two ledgers
   claiming one feature with different `change_ref` values, is reported in
   `feature_ledger_conflicts` and blocks closure instead of overwriting the real
   mapping.
10. PII and secret safety requirements are unchanged; an unresolved finding still
    blocks closure.

`_refs/shared/artifact-lifecycle.mjs` exports `isBinaryArtifactPath`,
`isLocalOnlyArtifactPath`, and `scanSensitiveArtifactPath` for callers that need
the same decision.

## Redaction

Never store or print secret values, credentials, tokens, private keys,
Authorization headers, cookies, database URLs, production payloads, customer
PII, or raw sensitive logs. Report only the path, key/category, risk reason,
and `[REDACTED]`. A suspected secret in an included artifact blocks closure.
