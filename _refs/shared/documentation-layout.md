# Documentation Layout Contract

Use this reference only when a workflow creates, discovers, reads, updates, migrates,
aggregates, exports, validates, or closes documentation below
`.sdcorejs/documentation/`. It is not bootstrap context for unrelated work.

```yaml
layout_version: 2
documentation_root: .sdcorejs/documentation
```

## Contents

- [Documentation units](#documentation-units)
- [Semantic repository ownership](#semantic-repository-ownership)
- [Keys and containment](#keys-and-containment)
- [Asset ownership](#asset-ownership)
- [Canonical-first discovery and the documentation gate](#canonical-first-discovery-and-the-documentation-gate)
- [Transitional migration](#transitional-migration)
- [Aggregate user guide](#aggregate-user-guide)
- [Export](#export)
- [UI evidence and artifact lifecycle](#ui-evidence-and-artifact-lifecycle)
- [Tail behavior](#tail-behavior)

## Executable API

`_refs/shared/documentation-layout.mjs` is the deterministic implementation.
Load only the function needed by the current documentation operation:

| Operation | Functions |
| --- | --- |
| Normalize and validate | `normalizeRepositoryPath`, `validateDocumentKey`, `resolveDocumentationRoot` |
| Build paths | `buildCanonicalEntryPath`, `buildLegacyEntryPath`, `buildUnitAssetPath`, `buildSharedAssetPath` |
| Resolve semantic owner | `resolveDocumentationWriteTarget` |
| Prove shared ownership | `validateSharedOwnership` |
| Discover and gate | `discoverDocumentationEntries`, `resolveDocumentationEntryState` |
| Plan and apply migration | `buildDocumentationMigrationPlan`, `applyMigrationPlanToSnapshot` |
| Aggregate and rewrite links | `buildAggregateUserGuide`, `buildMultiRepositoryDocumentationAggregate`, `rewriteAggregateLinks` |
| Export | `buildPandocExportPlan`, `summarizeExportCapabilities` |
| Validate UI evidence | `validateGuideImageRelationship`, `validateDocumentationVisualEvidence` |
| Finish and lifecycle | `resolveDocumentationTailPlan`, `classifyDocumentationPath` |

## Documentation units

A documentation unit owns one independently managed document and its local assets:

```text
<documentation-root>/<category>/<document-key>/<document-key>.<extension>
```

The entry filename must equal the document key. Repository-relative paths in
Markdown, frontmatter, typed context, and portable handoff use `/`.

The active category registry is:

| Category | Key | Canonical entry | Local asset directories |
| --- | --- | --- | --- |
| `user-guides` | lowercase kebab-case module | `user-guides/<module>/<module>.md` | `images`, `diagrams`, `examples`, `schemas`, `attachments`, `assets` |
| `requirements` | existing TASKID | `requirements/<TASKID>/<TASKID>.md` | `images`, `attachments` |
| `technical-docs` | lowercase kebab-case document key | `technical-docs/<doc-key>/<doc-key>.md` | `images`, `diagrams`, `schemas`, `examples`, `attachments`, `assets` |

`presentations/<key>/<key>.html` is recognized only for legacy compatibility when
an existing project or an explicit approved path already uses that category.
SDCoreJS has no active presentation producer, so this contract must not create one.

These root-level files are deliberate singleton exceptions:

- `.sdcorejs/documentation/preferences.md`
- `.sdcorejs/documentation/sdcorejs-user-guide.md`
- `.sdcorejs/documentation/sdcorejs-user-guide.docx`
- `.sdcorejs/documentation/sdcorejs-user-guide.pdf`

This contract does not change `.sdcorejs/docs/**`, `.sdcorejs/specs/**`,
`.sdcorejs/plans/**`, `.sdcorejs/handoffs/**`, `.sdcorejs/memories/**`,
`.sdcorejs/tasks/**`, `.sdcorejs/prd/**`, `product/**`, `design/**`, source-code
comments, JSDoc, TSDoc, or docstrings.

## Semantic repository ownership

Resolve stable repository identity and portal/module relationships before any
documentation write. A module owns its user guide, requirement record,
technical docs, and assets inside that module's Git repository. The portal owns
only portal/integration documentation, indexes, references, and generated
cross-repository aggregates. The execution host, checkout path, current working
directory, and parent repository do not transfer semantic ownership.

Use `resolveDocumentationWriteTarget` with
`_refs/shared/repository-contract.mjs`. An unavailable, missing, ambiguous, or
unwritable module repository blocks the module write; never fall back to an
editable copy in the portal. All paths in metadata and handoffs remain
repository-relative and carry `repository_id`, `repository_role`, optional
`module_id`, source/app revision, approved source identity, and content hash.
Track names come from `_refs/shared/system-registry.json`.

## Keys and containment

User-guide, technical-document, and compatibility presentation keys must match
`[a-z0-9]+(?:-[a-z0-9]+)*`. Requirement keys preserve the supplied TASKID case and
must match `[A-Za-z0-9_-]+`; never invent or rewrite a TASKID.

For every key and path:

- reject an empty key, `.`, `..`, `...`, a path separator, an absolute path, a
  Windows drive prefix, a trailing dot, or leading/trailing space;
- reject the case-insensitive Windows names `CON`, `PRN`, `AUX`, `NUL`,
  `COM1` through `COM9`, and `LPT1` through `LPT9`, including names with one
  or more suffixes such as `CON.tar.gz`;
- reject repeated separators, empty path segments, and a trailing separator;
- normalize accepted `\` separators to `/` in repository paths;
- detect collisions as case-insensitive even on a case-sensitive host;
- resolve the target root once, then prove every filesystem destination remains
  below the documentation root and every unit asset remains below its unit;
- never rely on the current working directory after resolving the target root;
- never use a symlink as a compatibility layer.

New writes use Layout v2. Create an asset directory only when writing its first
asset. Do not create empty directories or `.gitkeep`.

## Asset ownership

Unit-owned assets stay inside their unit. For example:

```text
.sdcorejs/documentation/user-guides/orders/orders.md
.sdcorejs/documentation/user-guides/orders/images/list.png
```

The guide links the image as `![List screen](images/list.png)`. The filename does
not repeat `orders-` because the unit directory already identifies its owner.

Use `.sdcorejs/documentation/_shared/<asset-kind>/<filename>` only after at least
two exact documentation-unit identities, such as `user-guides:orders` and
`user-guides:users`, are proven owners through references, typed context,
explicit approved scope, or unit metadata. In structured context, the asset and
entry must share one relationship record; co-occurrence elsewhere is not proof.
Never use `_shared` for unknown ownership. Keep and report orphan assets; do not
delete or duplicate them.

## Canonical-first discovery and the documentation gate

Discovery is relationship-first and canonical-first:

1. Resolve an explicit approved path when the user supplied one.
2. Probe the canonical exact entry
   `<category>/<key>/<key>.<extension>`.
3. If it is absent, probe the transitional legacy flat entry
   `<category>/<key>.<extension>`.
4. Return one of `canonical-existing`, `legacy-existing`, `both-equivalent`,
   `both-conflicting`, `case-insensitive-conflict`, `path-inventory-conflict`,
   or `missing`.

Exact-shape discovery must not treat unit assets, examples, attachments, diagrams,
schemas, or shared files as entries. Existing nested and legacy documents are
updates, not missing documents. Do not create a canonical duplicate when a legacy
entry exists. Filesystem aliases caused by slash normalization, repeated
separators, trailing dots/spaces, or case folding are conflicts, not missing
entries.

When canonical and legacy entries are semantically equivalent, canonical is the
source of truth; cleanup still requires an authorized migration. When their
content differs, block the affected migration, aggregate, build, and export.
Never choose by mtime or recency and never silently merge or overwrite.

Related artifact loading retains this order: same `contract_id`, same `change_ref`,
explicit `supersedes`, same requirement or exact module, explicit user selection,
then the canonical template/frontmatter/headings. Recency may only break a tie
inside one relationship. Read metadata before body and read a body only when it is
an actual dependency.

## Transitional migration

Read-only operations may read legacy entries but must not move them. Before any
write migration, build a complete deterministic preflight plan containing:

- source and destination paths;
- path containment and case-insensitive collision checks;
- canonical/legacy equivalence or conflict;
- owned, proven-shared, and orphan asset classification;
- every Markdown, HTML, frontmatter, traceability, `guide_path`, `image.file`, and
  `artifact_context` reference to rewrite;
- source and destination hashes, including binary asset hashes;
- source and projected-destination snapshot digests that bind apply to the
  preflight inventory.

Apply the plan only when the current operation is authorized for that document.
Planning takes an exact documentation-unit scope, and authorization is recorded
per scoped unit. A global boolean must not authorize migration of unrelated
legacy documents discovered elsewhere in the repository.
Apply transactionally: an invalid inventory, failed preflight, or snapshot
digest change causes no mutation; reapplying the projected snapshot causes no
diff. Preserve YAML comments, quoted/escaped path values, and single-value block
scalars with chomping/indentation indicators. Preserve binary bytes and fields
such as
`artifact_id`, `artifact_kind`, `change_ref`, `source_spec`, `source_plan`,
`commit_policy`, `owner`, and relationship metadata.

Move a legacy asset only when ownership is proven by a Markdown reference,
unambiguous filename prefix, one exact `ui_capture_context` or
`artifact_context` relationship record, explicit user scope, or exact unit
metadata. A concise-name collision blocks migration.
Move a truly shared asset to `_shared` only with proven shared ownership. Do not
delete a legacy source until moves, reference rewrites, local-link validation,
binary-hash verification, and artifact-relationship validation all pass.

Legacy v1 reads are transitional compatibility and may be removed in a future
major release. No new write may use v1.

## Aggregate user guide

The aggregate remains the singleton
`.sdcorejs/documentation/sdcorejs-user-guide.md`.

In a single repository, `buildAggregateUserGuide` consumes canonical module
units directly. In a portal with separate module repositories, use
`buildMultiRepositoryDocumentationAggregate`. Each module contribution must
either be a repository link pinned to its exact revision or a versioned export
whose canonical guide hash, repository ID, module ID, source revision, and
export version validate. The portal output declares
`generated_projection: true`, `editable_source: false`, and preserves per-module
provenance. It may project verified assets required by a versioned export, but
must never become a second editable source for the module guide. Missing,
duplicate, stale, hash-mismatched, or colliding sources block the aggregate.

Canonical discovery accepts only
`user-guides/<module>/<module>.md`. Transitional discovery may also accept
`user-guides/<module>.md`. Deduplicate by normalized module key, sort
deterministically, tolerate BOM and CRLF, and report deterministic warnings or
errors for malformed or missing frontmatter. Do not crash or silently drop a
module. Canonical precedence applies only to equivalent copies; conflicting copies
block the aggregate. Empty input produces an explicit result.

When embedding a canonical module guide, rewrite unit-local targets:

```text
images/list.png
user-guides/orders/images/list.png

../../_shared/diagrams/system-flow.png
_shared/diagrams/system-flow.png
```

Apply the same rule to `images`, `diagrams`, `examples`, `schemas`, `attachments`,
and `assets`, including quoted or unquoted local HTML `src` and `href`. Preserve `http:`, `https:`,
`mailto:`, `data:`, anchors, absolute paths, and repository links outside the
unit. Do not rewrite fenced code, inline code, unrelated prose, or non-path
frontmatter values. Fence and inline-code scanning respects the full backtick or
tilde delimiter length. Markdown destination parsing preserves balanced or
escaped parentheses instead of truncating at the first `)`. Migration rewrites
only recognized path-bearing
frontmatter/context fields and Markdown/HTML/reference-link targets; it never
globally replaces a path inside arbitrary prose or a longer filename.

Shift module headings outside fenced code without breaking hierarchy, recompute
coverage totals from the selected entries, and validate every emitted local link. A local target must
remain below the documentation root, contain no traversal, exist, and retain any
required current screenshot evidence. `verifiedImageEvidence` requires schema
v1; stable `capture_id`; matching change and source revision; explicit source
and app Git revisions; `evidence_origin` classified as `real-ui`,
`generated-mockup`, or `illustration`; verified, unblocked documentation
classification; known runner; approved real-UI provenance;
target-state, PII, and redaction evidence; and image path/kind/existence,
non-empty, decodable, SHA-256, width, and height fields. Current bytes must match
the hash/dimensions and decode. The dependency-free helper validates PNG CRC,
zlib, and scanlines; it rejects GIF/JPEG header claims. Bare paths,
self-asserted decodability, and existence alone are insufficient.
Only `real-ui` evidence can satisfy a real screenshot requirement. Generated
mockups and illustrations require generator provenance and remain visibly
classified; they cannot be relabeled as observed application state.
Read-only legacy compatibility may accept a clearly prefixed flat image owned by
its flat guide; new captures still use unit-local paths. Aggregate generation is
deterministic and idempotent.

## Export

The documentation root, not a shared flat image directory, is the Pandoc resource
root. Construct process arguments as an array; do not shell-concatenate target
paths. Paths containing spaces and Unicode must remain one argument.

Equivalent POSIX display:

```sh
pandoc '<documentation root>/sdcorejs-user-guide.md' -o '<documentation root>/sdcorejs-user-guide.docx' --resource-path '<documentation root>'
```

Equivalent PowerShell display:

```powershell
& 'pandoc' '<documentation root>\sdcorejs-user-guide.md' '-o' '<documentation root>\sdcorejs-user-guide.docx' '--resource-path' '<documentation root>'
```

Do not export while the aggregate has conflicts or broken links. Export only when
the workflow approval contract permits it. Report DOCX and PDF independently:

```yaml
docx:
  capability:
  result:
  verification:
pdf:
  capability:
  result:
  verification:
```

An unavailable Pandoc or PDF engine is `skipped` or `blocked`, never `pass`.
Success requires exit zero, non-empty parseable output, and evidence bound to
the aggregate SHA-256. Derive expected images from Markdown images, used image
references, and HTML `img src`, not download links. Require exact embedded paths
and integer counts; missing binding, fabricated zero/zero, or incomplete
evidence fails.

## UI evidence and artifact lifecycle

A current verified guide capture uses unit paths:

```yaml
ui_capture_context:
  guide_path: .sdcorejs/documentation/user-guides/orders/orders.md
  source_revision: <40-char Git revision>
  app_revision: <40-char Git revision>
  evidence_origin: real-ui
  image:
    file: .sdcorejs/documentation/user-guides/orders/images/list.png
```

`guide_path` must be an exact unit entry or an explicitly approved existing path.
The image is valid only inside the same unit, or inside `_shared` with proven
multi-unit ownership that includes the guide unit. Reject traversal, absolute
paths, cross-unit relationships, missing provenance, and an unverified non-empty
`guidePath`. Real authenticated UI, redaction, freshness, runner, persona, secret,
PII, and diagnostic-capture rules remain unchanged.

Everything below `.sdcorejs/documentation/**` remains a documentation asset, but
being nested does not authorize promotion. A changed guide and its current
verified referenced image may be `required_with_change`; an unrelated attachment,
orphan/shared asset without ownership proof, trace, video, auth state, diagnostic
capture, login redirect, or access-denied capture remains `local_only` or blocked
as the lifecycle contract requires. Git closure stages only explicit validated
paths and never bulk-stages `.sdcorejs`.

## Tail behavior

Mode 1 creates or updates approved module guides. If at least one module guide
changed, rebuild the aggregate exactly once after all Mode 1 updates and before
final verification. Do not rebuild it for an unrelated ship operation unless the
user explicitly requests the aggregate or a stale aggregate is inside approved
scope. Explicit aggregate mode always runs Mode 2.

DOCX and PDF exports are separate capability and approval decisions; rebuilding
the aggregate does not imply export. Do not recapture unrelated modules. Missing
or blocked images are reported and omitted rather than emitted as broken links.
All documentation writes finish before branch-ready evidence. A later
documentation or generated-mirror write makes branch-ready evidence stale.

Runtime communication follows the Communication Economy Policy. Normal success
uses a compact projection; migration approval, public-contract choice, conflict,
or failed verification resolves to detailed. Preserve `context.pass` and pass only
the exact consumer-required IDs, paths, hashes, state delta, evidence references,
blockers, and next consumer. Do not embed full documents, specs, plans, diffs, or
logs in a portable handoff.
