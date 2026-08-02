# Design Handoff Contract

Use this contract for every durable Design handoff. Its deterministic helper is
`_refs/shared/design-handoff.mjs`. Resolve track/profile, artifact kind,
repository role, and ownership scope from `_refs/shared/system-registry.json`;
verify approved spec/plan parents through
`_refs/shared/approved-artifact.mjs`.

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
| Resolve semantic owner and durable spec/ledger paths | `resolveDesignHandoffTarget` |
| Validate approved parents, source, images, responsive/component evidence, ownership, and hashes | `validateDesignHandoff` |
| Create a normalized handoff with `artifact_hash` | `createDesignHandoff` |

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
repository_relative_path: design/specs/<feature>.md
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
Figma, or FigJam and carry a durable artifact hash. Every generated static PNG
links that hash and is explicitly classified as `generated-mockup` or
`illustration`.

A real application capture is separately classified as
`real-product-screenshot` and carries repository ID, source revision, app
revision, evidence ID, capture timestamp, and content hash. Generated images
must never be presented as real product screenshots.

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

At least two distinct module sources are required. Duplicate identities,
editable copies, malformed hashes, and revisions that do not match the current
repository revision map fail closed.
