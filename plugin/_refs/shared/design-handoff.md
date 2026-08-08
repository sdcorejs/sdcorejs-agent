# Design Handoff Contract

Use this contract for every durable Design handoff. Its deterministic helper is
`_refs/shared/design-handoff.mjs`. Resolve track/profile, artifact kind,
repository role, ownership scope, and canonical artifact roots from
`_refs/shared/system-registry.json` through `_refs/shared/artifact-paths.mjs`;
verify approved spec/plan parents through
`_refs/shared/approved-artifact.mjs`.

## Canonical Layout

```text
<semantic-owner-repository>/.sdcorejs/design/flows/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/design/specs/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/design/decisions/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/design/wireframes/<kebab-feature>/<screen>.html
<semantic-owner-repository>/.sdcorejs/design/wireframes/<kebab-feature>/<screen>.svg
<semantic-owner-repository>/.sdcorejs/design/exports/png/<kebab-feature>/<screen>.png
<semantic-owner-repository>/.sdcorejs/design/references/<kebab-feature>/<screen>.png
<semantic-owner-repository>/.sdcorejs/docs/design/<kebab-feature>.md
```

Design artifacts live under the `.sdcorejs/design` artifact root. The Design
ledger keeps its own `.sdcorejs/docs/design` ledger root. Root-level `design/**`
is never a write target. `.sdcorejs/design/diagnostics/**` is reserved for
`local_only` renderer diagnostics and failure captures.

## Authority And Ownership

Design translates approved requirements into editable design sources, written
handoffs, responsive rules, and evidence-aware component mapping. It does not
write production code, replace a spec/plan, mutate an approved artifact, invent
behavior beyond requirements, or create module code.

Module-specific handoffs live in the module's semantic owner repository. A
missing, ambiguous, unavailable, or unwritable module owner blocks the write;
portal fallback is forbidden. The portal owns only portal shell design,
composition design, and a true cross-module experience. A cross-module handoff
has one explicit portal/integration owner and references module handoffs by
durable repository/artifact/path/revision/hash identity. It never creates a
duplicate editable module handoff.

## Executable API

| Operation | Function |
| --- | --- |
| Resolve semantic owner and the complete canonical path bundle | `resolveDesignHandoffTarget` |
| Validate approved parents, source, images, responsive/component evidence, ownership, canonical paths, and hashes | `validateDesignHandoff` |
| Create a normalized handoff with `artifact_hash` | `createDesignHandoff` |
| Resolve canonical-first reads with an explicit legacy fallback | `resolveDesignArtifactSources` |
| Plan a scoped legacy-to-canonical migration | `planDesignArtifactMigration` |
| Build `artifact_context` closure entries for the whole Design bundle | `buildDesignArtifactContext` |

`resolveDesignHandoffTarget` returns `repository_relative_path` (the canonical
handoff spec), `ledger_relative_path`, `artifact_root`, `ledger_root`,
`flow_path`, `decisions_path`, `wireframe_directory`, `png_export_directory`,
`reference_directory`, and per-screen paths when `screens` is supplied. Callers
write the Design bundle from that result instead of rebuilding path strings.

## Path Gates

`validateDesignHandoff` fails closed unless every path is canonical:

| Field | Required prefix | Legacy rejection |
| --- | --- | --- |
| `metadata.repository_relative_path` | `.sdcorejs/design/specs/` | `INVALID_DESIGN_HANDOFF_PATH` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `editable_source.path` | `.sdcorejs/design/wireframes/` | `INVALID_EDITABLE_SOURCE_PATH` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `static_exports[].path` | `.sdcorejs/design/exports/png/` | `INVALID_STATIC_DESIGN_PROVENANCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `product_screenshots[].path` | `.sdcorejs/design/references/` | `INVALID_PRODUCT_SCREENSHOT_PROVENANCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `cross_repository_references[].repository_relative_path` | `.sdcorejs/design/specs/` | `INVALID_CROSS_REPOSITORY_DESIGN_REFERENCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |

## Lifecycle Identity

Each handoff uses:

```yaml
schema_version: 1
artifact_id: design-handoff:<feature>
artifact_kind: design-handoff
contract_id: <approved contract id>
requirement_id: <requirement id>
change_ref: <change id>
track: design
stack_profile: design
experience_scope: module | portal-shell | portal-composition | cross-module
owner_repository_id: <stable repository id>
owner_repository_role: module | portal
owner_module_id: <module id | null>
ownership_scope: module | portal-composition | cross-repository-aggregate
repository_relative_path: .sdcorejs/design/specs/<feature>.md
source_revision: <40-character Git revision>
parent_references:
  - <approved spec reference>
  - <approved plan reference>
supersedes: <artifact id | null>
approval_hash: <sha256:v1 identity when applicable | null>
artifact_hash: sha256:v1:<64 lowercase hex>
```

The handoff must verify an approved spec and approved plan. It reads those
artifacts; it must not mutate approved inputs or silently expand their scope.

## Editable Source And Visual Provenance

Produce editable source before PNG. Valid editable formats are HTML, SVG,
Figma, or FigJam and carry a durable artifact hash. Editable source lives under
`.sdcorejs/design/wireframes/`. Every generated static PNG lives under
`.sdcorejs/design/exports/png/`, links that hash, and is explicitly classified as
`generated-mockup` or `illustration`.

A real application capture is separately classified as
`real-product-screenshot`, lives under `.sdcorejs/design/references/`, and carries
repository ID, source revision, app revision, evidence ID, capture timestamp, and
content hash. Generated images must never be presented as real product
screenshots.

Durable images are binary artifacts. Artifact discovery reads genuinely opaque
bytes as bytes: it never parses them as Markdown frontmatter and never prints
their content. A file whose extension looks binary but whose bytes decode as text
is still screened for secrets, so a credential cannot ride along inside an export
directory. Classification comes from the canonical path, runtime
`artifact_context`, the Design ledger relationship for the same feature, the
content hash, and the declared provenance above.

Canonical membership is a gate, not a prefix check. `wireframes`, `exports/png`,
and `references` address `<feature>/<screen>.<ext>` with the declared extension
(`.html`/`.svg` for wireframes, `.png` for exports and references). A flat file,
a wrong extension, or an extra directory level fails closed.

Failure screenshots, traces, videos, auth state, storage state, caches, and
temporary renderer output stay `local_only` and belong under
`.sdcorejs/design/diagnostics/**`. A filename such as `failure-state.png` inside
an approved export or wireframe directory is a designed state and stays durable.

If the target editable surface is unavailable, record
`editable_source.status: unavailable` with the concrete limitation. Report the
handoff as limited/blocked; do not claim editable-source pass and do not treat a
PNG as the source of truth.

## Responsive, Components, And Existing Design System

The handoff preserves desktop, tablet, and mobile behavior, including mobile
touch/keyboard/safe-area/zoom/reduced-motion considerations. Inspect the
existing design system before proposing components, tokens, copy patterns, or
new dependencies. A `confirmed` component mapping requires repository/path/
revision evidence; otherwise use `candidate`, `unknown`, or `new`.

Existing design-system reuse and deviations are explicit. Responsive coverage,
component evidence, and reuse inspection are gates, not prose-only claims.

## Cross-Repository References

True cross-module experience references use:

```yaml
repository_id:
module_id:
artifact_id:
artifact_kind: design-handoff
repository_relative_path:
revision:
artifact_hash:
editable: false
```

At least two distinct module sources are required. Every
`repository_relative_path` must be a canonical `.sdcorejs/design/specs/` path.
Duplicate identities, editable copies, malformed hashes, legacy root-level paths,
and revisions that do not match the current repository revision map fail closed.

## Legacy Layout Compatibility

Root-level `design/**` is a read-only compatibility input for target projects
created before this layout.

| Situation | Read | Write |
| --- | --- | --- |
| canonical only | canonical | canonical |
| legacy only | legacy fallback | canonical, after migrating the requested feature bundle |
| canonical plus equivalent legacy copy | canonical | canonical; retire the legacy copy in the same change |
| canonical plus conflicting legacy copy | blocked | blocked with `CANONICAL_LEGACY_CONFLICT` |
| neither | none | canonical |

`resolveDesignArtifactSources` reports `canonical`, `legacy-fallback`, `missing`,
or `blocked` per artifact. `planDesignArtifactMigration` returns `not-required`,
`migration-required`, or `blocked` with the exact moves. Only the requested
feature bundle migrates; unrelated historical artifacts are never bulk rewritten.
Portal fallback stays forbidden, and repository ownership, artifact identity,
source revisions, approval hashes, artifact hashes, image provenance, and
`supersedes` semantics are preserved across the move. A legacy path is never valid
in newly generated metadata.

## Artifact Closure

`buildDesignArtifactContext` emits specs, flows, decision logs, editable
wireframes, durable exports, approved screenshot references, and the ledger in
`artifact_context.required_with_change`. Generated diagnostics that are not part
of an approved durable handoff stay `local_only`. Emitting only the ledger is a
contract violation.

It fails loudly rather than silently dropping work: an unknown document category,
a non-canonical or wrong-extension artifact path, and a diagnostic outside
`.sdcorejs/design/{diagnostics,failures,tmp}/` all throw. A typo must not remove
an approved handoff document from the commit closure, and a diagnostic entry must
not mark a durable export never-commit.
