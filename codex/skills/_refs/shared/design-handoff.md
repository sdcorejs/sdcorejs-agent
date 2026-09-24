# Design Handoff Contract

## Schema 2 and verification authority

New handoffs use schema 2. `validateDesignHandoff` is a **pure structural**
validator; `createDesignHandoff` normalizes data and does not approve it.
`adaptLegacyDesignHandoff` exposes schema 1 as read-only, unverified data. Never
bulk-migrate history or rewrite an immutable approved snapshot to change schema.
The legacy field reference below describes schema 1 only.

`verifyDesignHandoff` in `design-verification.mjs` is the implementation gate.
Its host-created `createDesignVerificationRuntime` receives repository roots and
roles from the registry/topology, independently selected expected spec/plan and
Design approval references, and a parser for actual approved artifact files.
It reads those files, verifies their canonical approval hashes and complete parent
graph, and binds repository, revision, contract, requirement, and change identity.
A caller-provided hash, `status`, serialized runtime, or verification result is
never read/approval evidence. Missing host/verifier/source blocks verification.
Results separate `structural`, `parents`, `approval`, and `evidence`; PASS means
the required focused checks passed, not semantic equivalence or blanket UI quality.

The approved spec body supplies `design_requirements` (a JSON object, or a
`design-requirements` fenced JSON block). It declares `required`, `feature`,
`experience_kind`, the complete `owner` identity, `surfaces` with `id`,
`required`, `rendered_required`, `interaction_required`, and `reason` for an
inapplicable surface. The approved plan cannot waive these requirements. The
host pins actual artifact references outside the handoff. Missing requirements
are a limitation; an explicit approved `required: false` with a reason permits
a non-Design path for that approved semantic owner only. Surface behavior descriptions are design intent; rendered
and interaction checks require separate current receipts.

The following is the executable schema-2 example. Fixtures substitute only
environment identities, actual hashes/references, and observed evidence. The
same payload goes to the structural helper and Angular/Next.js/generic consumers.

<!-- design-handoff-v2-example -->
```json
{
  "metadata": {
    "schema_version": 2,
    "artifact_id": "design-handoff:orders",
    "artifact_kind": "design-handoff",
    "contract_id": "contract:orders",
    "requirement_id": "requirement:orders",
    "change_ref": "orders-change",
    "track": "design",
    "stack_profile": "design",
    "feature": "orders",
    "experience_kind": "standalone",
    "owner_repository_id": "github.com/example/orders",
    "owner_repository_role": "standalone",
    "owner_module_id": null,
    "ownership_scope": "repository",
    "repository_relative_path": ".sdcorejs/docs/design/orders.md",
    "source_revision": "0000000000000000000000000000000000000000",
    "parent_references": []
  },
  "lifecycle": { "state": "draft" },
  "documents": [
    { "path": ".sdcorejs/design/specs/orders.md", "sha256": "<observed sha256>" },
    { "path": ".sdcorejs/design/flows/orders.md", "sha256": "<observed sha256>" },
    { "path": ".sdcorejs/design/decisions/orders.md", "sha256": "<observed sha256>" }
  ],
  "editable_source": {
    "status": "available",
    "path": ".sdcorejs/design/wireframes/orders/list.html",
    "format": "html",
    "sha256": "<observed sha256>"
  },
  "editable_sources": [],
  "static_exports": [],
  "product_screenshots": [],
  "responsive": { "surfaces": [
    { "id": "mobile", "applicability": "required", "behavior": "Single-column layout with keyboard and touch access.", "rendered_evidence": null, "interaction_evidence": null }
  ] },
  "component_mapping": [],
  "design_system_reuse": { "inspected": true, "evidence_refs": [], "deviations": [] },
  "cross_repository_references": [],
  "production_code_paths": []
}
```

Schema-2 `experience_kind` separates module, portal-shell, portal-composition,
cross-module, standalone, and component-library experiences from registry
repository roles. Standalone/library use repository ownership; cross-module
uses its explicit integration owner and actual distinct module references.
Missing/unwritable owners block; module ownership never falls back to portal.
The metadata path is the Design ledger; spec/flow/decisions are design assets.
All assets use canonical depth/extensions, one editable owner, and contained
real paths in the expected Git root. Full closure includes every feature asset
observed on disk as well as the ledger; omitting an export is a blocker.
`editable_source` is the primary editable file; `editable_sources` lists any
additional screen/state files with the same path/format/status/sha256 fields.
Each static export's `source_editable_sha256` binds its actual primary or
additional editable source in this handoff; an unknown source hash is invalid.
Surface receipts cover the approved surface's `source_paths`, or all editable
files when that requirement does not narrow the checked source set.
Real product captures additionally require that surface's approved
`app_source_paths`. A receipt must cover those application files and the image;
hashing only the PNG cannot prove a current application capture. Missing app
scope blocks, and changed app bytes invalidate evidence even at the same HEAD.

Drafts may exist under explicit exploration authority without approved parents.
They never authorize implementation. A reviewed handoff requires a real loaded
Design approval at the independently pinned ledger reference. Material changes
return to the decision/approval owner. A trusted host review may accept content
hash changes within the already approved scope; it must inspect current bytes,
confirm unchanged behavior/requirements, and return current fingerprints.
Payload labels such as `minor` cannot grant that authority. This permits a
bounded spacing correction without another human approval ceremony.
For a new material approval, use the existing change-scoped revision lifecycle
and a new approved bundle identity/feature slug; retain the previous immutable
approval and its source bundle. Never update a historical approval just to make
the current payload or schema validate.

Evidence references use `{artifact_ref, approval_hash}` pointing to actual
`release-evidence` artifacts with contract `design-command-receipt:v2`, pinned
by the host command/capture runner. Receipt bodies contain nonempty `command`,
`cwd`, `owner_repository_id`, `exit_code`, `surface_id`, `kind`, `scope`, and
`fingerprints` of all checked files. `kind` distinguishes `rendered-wireframe`,
`interaction`, and `real-product-screenshot`; real captures additionally bind
the app revision and capture provenance. Use the existing approval/evidence
verifier infrastructure. Never manufacture a receipt to fill an evidence gap.
Same HEAD with changed content is stale. Generated mockups cannot satisfy real
product screenshot requirements. Confirmed components and reuse observations
require actual readable source path/revision/hash references.

Angular/Next.js profile-only resolution remains available but is not production
eligibility. Their execution resolvers accept a separate trusted runtime argument
and invoke verification themselves. Generic `prepareExecution` requires the
same gate for UI tracks or approved artifacts declaring `design_requirements`.
Portable payloads must be reverified at the consuming host. Visual Companion
feedback remains supporting feedback and never approval.
The Design producer's approved plan authorizes artifact creation. Its completed
handoff is postflight output, not a prerequisite for creating that output.

## Shared artifact layout and legacy compatibility

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
portal fallback is forbidden. Portal shell/composition belongs to the portal. Standalone websites/apps and
component libraries belong to their own registry owners. A cross-module handoff
has one explicit integration owner and references module handoffs by
durable repository/artifact/path/revision/hash identity. It never creates a
duplicate editable module handoff.

## Executable API

| Operation | Function |
| --- | --- |
| Resolve semantic owner and the complete canonical path bundle | `resolveDesignHandoffTarget` |
| Pure structural validation, never approval or source-read evidence | `validateDesignHandoff` |
| Actual parents, Design approval, content and applicable evidence | `verifyDesignHandoff` in `design-verification.mjs` |
| Create a normalized handoff with `artifact_hash` | `createDesignHandoff` |
| Resolve canonical-first reads with an explicit legacy fallback | `resolveDesignArtifactSources` |
| Plan a scoped legacy-to-canonical migration | `planDesignArtifactMigration` |
| Build `artifact_context` closure entries for the whole Design bundle | `buildDesignArtifactContext` |

`resolveDesignHandoffTarget` returns `repository_relative_path` (the canonical
handoff spec), `ledger_relative_path`, `artifact_root`, `ledger_root`,
`flow_path`, `decisions_path`, `wireframe_directory`, `png_export_directory`,
`reference_directory`, and per-screen paths when `screens` is supplied. Callers
write the Design bundle from that result instead of rebuilding path strings.

## Legacy structural path gates

`validateDesignHandoff` fails closed unless every path is canonical:

| Field | Required prefix | Legacy rejection |
| --- | --- | --- |
| `metadata.repository_relative_path` | `.sdcorejs/design/specs/` | `INVALID_DESIGN_HANDOFF_PATH` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `editable_source.path` | `.sdcorejs/design/wireframes/` | `INVALID_EDITABLE_SOURCE_PATH` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `static_exports[].path` | `.sdcorejs/design/exports/png/` | `INVALID_STATIC_DESIGN_PROVENANCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `product_screenshots[].path` | `.sdcorejs/design/references/` | `INVALID_PRODUCT_SCREENSHOT_PROVENANCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |
| `cross_repository_references[].repository_relative_path` | `.sdcorejs/design/specs/` | `INVALID_CROSS_REPOSITORY_DESIGN_REFERENCE` plus `LEGACY_DESIGN_ARTIFACT_PATH` |

## Legacy schema-1 identity (read-only)

The compatibility adapter reads this older shape; new handoffs use the schema-2 example above:

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

Only the schema-2 verified entrypoint grants implementation eligibility. It reads
approved artifacts; it must not mutate approved inputs or silently expand scope.

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

The handoff describes approved applicable surfaces, including mobile
touch/keyboard/safe-area/zoom/reduced-motion considerations. Inspect the
existing design system before proposing components, tokens, copy patterns, or
new dependencies. A `confirmed` component mapping requires repository/path/
revision evidence; otherwise use `candidate`, `unknown`, or `new`.

Existing design-system reuse and deviations are explicit. Responsive coverage,
component evidence, and reuse inspection are gates, not prose-only claims.

## Shared Baseline And Feature Exceptions

Use the existing handoff fields and decision/spec documents; no new artifact
kind, root, global editable master or token-value registry is introduced.
`design_system_reuse.evidence_refs` identifies actual token/style/component
sources with repository/path/revision. Relevant accepted/observed conventions
are read through `convention_context`. Reference existing values rather than
copying them into a parallel palette or `design-system/MASTER.md`.

Record feature differences only in the resolver's `decisions_path`, summarize
them in the handoff spec and `design_system_reuse.deviations`, and include these
documents in `buildDesignArtifactContext` closure and the existing Design ledger.
Use a compact decision table within those documents:

| Decision ID | Baseline source/revision | Screen/region scope | Difference | Rationale | Status and decision reference | Verification |
|---|---|---|---|---|---|---|
| <existing decision identity> | <repo:path@revision> | <feature/screen> | <delta only> | <task benefit> | <candidate or approved decision reference> | <check/result or NOT RUN> |

Keep vocabulary in its owning schema: source observations are `observed`
conventions (advisory), proposed design/component choices are `candidate`, and
an `approved` design decision needs the actual approved artifact identity/hash.
The convention schema calls an enforceable rule `accepted`, not `approved`;
never add a new convention status or promote a candidate automatically.
Component mapping still uses `confirmed | candidate | unknown | new`, with
`confirmed` requiring source evidence rather than aesthetic approval.

An exception cannot relax mandatory accessibility or an approved invariant.
When code, stored design and approved decisions disagree, name the conflicting
sources and unresolved decision; do not silently overwrite or treat current
code as permission to violate an approved contract. Follow the existing stale
convention classification where source evidence has changed. Persistence of
project conventions remains owned by authorized `sdcorejs-explore`, never design
or review. Upstream suggestions remain reference data.

Module baselines/exceptions stay with the module semantic owner. Portal shell
and integration may reference them through existing immutable provenance;
cross-module composition never duplicates editable module design. Missing module
ownership blocks the write even for a small exception. Every durable output
uses the existing resolver/lifecycle; root-level design/product/design-system
directories are not output targets.

## Cross-Repository References

Schema-2 cross-module references use the actual approved module ledger identity
below. The host supplies a separate verified runtime for each module; neither
a caller revision map nor a serialized PASS substitutes for source reads:

```yaml
repository_id:
module_id:
artifact_id:
artifact_kind: design-handoff
repository_relative_path:
revision:
approval_hash:
editable: false
```

At least two distinct module sources are required. Every
`repository_relative_path` must be a canonical `.sdcorejs/docs/design/<feature>.md` ledger.
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

## Design and UI review integration

Independent design-artifact assessment belongs to sdcorejs-review under _refs/shared/ui-review.md when requested or workflow-authorized. Design self-critique and Visual Companion feedback are not independent approval. A candidate can be assessed before its own approval; implemented-ui-conformance requires actual approved Design or an explicit authorized visual contract. Preserve this handoff schema, existing editable-source primacy, owner/parent/closure verification and candidate component evidence requirements.
