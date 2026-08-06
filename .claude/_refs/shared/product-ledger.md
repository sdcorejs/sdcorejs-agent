# Product Ledger Contract

Use this contract for every Product traceability ledger. The deterministic
implementation is `_refs/shared/product-ledger.mjs`; track, profile, artifact
kind, repository role, ownership scope, canonical artifact roots, and evidence
values come from `_refs/shared/system-registry.json`, resolved through
`_refs/shared/artifact-paths.mjs`.

## Canonical Layout

```text
<semantic-owner-repository>/.sdcorejs/product/prds/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/product/user-stories/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/product/acceptance-criteria/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/product/uat-checklists/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/product/decisions/<kebab-feature>.md
<semantic-owner-repository>/.sdcorejs/docs/product/<kebab-feature>.md
```

The human-readable documents live under the `.sdcorejs/product` artifact root.
The traceability ledger keeps its own `.sdcorejs/docs/product` ledger root.
Root-level `product/**` is never a write target.

## Purpose And Ownership Boundary

A Product ledger connects existing requirement, acceptance criterion, design,
plan, implementation, test, evidence, and delivery facts. It does not write
application code and is not a competing spec or plan schema. Specs own approved
behavior, plans own implementation steps, Design owns handoffs, Test owns test
artifacts/evidence, and Git/Ship own delivery gates.

A module-specific ledger and its PO documents belong in the module's semantic
owner repository. If that repository is missing, ambiguous, unavailable, or
unwritable, block; portal fallback is forbidden. A portal integration owner may
hold a generated cross-module view, but it can only reference module artifacts.
It must not duplicate editable requirements.

## Executable API

| Operation | Function |
| --- | --- |
| Validate identity, traceability, freshness, document paths, and duplicates | `validateProductLedger` |
| Create a canonical ledger and artifact hash | `createProductLedger` |
| Resolve module or integration owner plus the complete canonical path bundle | `resolveProductLedgerTarget` |
| Resolve canonical-first reads with an explicit legacy fallback | `resolveProductDocumentSources` |
| Plan a scoped legacy-to-canonical migration | `planProductArtifactMigration` |
| Build `artifact_context` closure entries for the whole Product bundle | `buildProductArtifactContext` |
| Build an immutable-reference cross-module view | `buildCrossRepositoryProductView` |

`resolveProductLedgerTarget` returns `repository_relative_path`,
`ledger_relative_path`, `document_root`, `ledger_root`, `documents`,
`document_paths`, `metadata_paths`, and `legacy_read_only_paths`. Callers write
the Product bundle from that result instead of rebuilding path strings.

## Lifecycle Metadata

Every new or updated ledger uses schema version 1 and these top-level metadata
fields:

```yaml
schema_version: 1
artifact_id: product-ledger:<feature>
artifact_kind: product-ledger
contract_id: <approved contract identity>
requirement_id: <primary requirement identity>
change_ref: <logical change identity>
track: <canonical registry track>
stack_profile: <canonical registry profile>
owner_repository_id: <stable remote-derived repository identity>
owner_repository_role: module | portal | standalone | service | library | documentation
owner_module_id: <module id | null>
ownership_scope: module | repository | cross-repository-aggregate
repository_relative_path: .sdcorejs/docs/product/<feature>.md
source_revision: <lowercase 40-character Git revision>
parent_references:
  - repository_id: <stable repository identity>
    artifact_id: <spec/plan/design/test identity>
    artifact_kind: <canonical registry artifact kind>
    revision: <lowercase 40-character Git revision>
    approval_hash: sha256:v1:<64 lowercase hex>
supersedes: <prior artifact id | null>
approval_hash: <sha256:v1 identity when explicitly approved | null>
artifact_hash: sha256:v1:<64 lowercase hex>
prd_path: .sdcorejs/product/prds/<feature>.md
user_stories_path: .sdcorejs/product/user-stories/<feature>.md
acceptance_criteria_path: .sdcorejs/product/acceptance-criteria/<feature>.md
uat_checklist_path: .sdcorejs/product/uat-checklists/<feature>.md
decisions_path: .sdcorejs/product/decisions/<feature>.md
```

Repository paths are always repository-relative. Checkout locations and the
current working directory are not durable identity. `artifact_hash` binds the
normalized metadata, traceability rows, and source references. An
`approval_hash` is required only when an approval contract applies; parent
references to approved artifacts preserve their approval hashes.

Product document path fields are optional, but a supplied value must name a
canonical `.sdcorejs/product/<category>/<feature>.md` location that matches its
field. `validateProductLedger` fails closed with:

| Code | Cause |
| --- | --- |
| `LEGACY_PRODUCT_DOCUMENT_PATH` | the value names root-level `product/**` |
| `INVALID_PRODUCT_DOCUMENT_PATH` | the value is outside the canonical Product root |
| `PRODUCT_DOCUMENT_CATEGORY_MISMATCH` | the value names another Product category |
| `INVALID_PRODUCT_LEDGER_PATH` | `repository_relative_path` is outside `.sdcorejs/docs/product/` |

## Durable Product Documents

Each human-readable Product document is a `product-doc` durable artifact with
lifecycle frontmatter from `_refs/shared/artifact-lifecycle.md`:

```yaml
artifact_id: product-doc:<kind>:<kebab-feature>
artifact_kind: product-doc
change_ref: <change id>
source_spec: <repo-relative path | none>
source_plan: <repo-relative path | none>
commit_policy: with-change
owner: sdcorejs-product
```

`buildProductArtifactContext` emits every created or updated document plus the
ledger in `artifact_context.required_with_change`. Emitting only the ledger is a
contract violation.

## Legacy Layout Compatibility

Root-level `product/**` is a read-only compatibility input for target projects
created before this layout.

| Situation | Read | Write |
| --- | --- | --- |
| canonical only | canonical | canonical |
| legacy only | legacy fallback | canonical, after migrating the requested feature bundle |
| canonical plus equivalent legacy copy | canonical | canonical; retire the legacy copy in the same change |
| canonical plus conflicting legacy copy | blocked | blocked with `CANONICAL_LEGACY_CONFLICT` |
| neither | none | canonical |

`resolveProductDocumentSources` reports `canonical`, `legacy-fallback`,
`missing`, or `blocked` per document. `planProductArtifactMigration` returns
`not-required`, `migration-required`, or `blocked` with the exact moves. Only the
requested feature bundle migrates; unrelated historical artifacts are never bulk
rewritten. Portal fallback stays forbidden, and repository ownership, artifact
identity, source revisions, approval hashes, artifact hashes, and `supersedes`
semantics are preserved across the move. A legacy path is never valid in newly
generated metadata.

## Traceability Rows

Each acceptance criterion has exactly one row containing:

- `requirement_id` and `acceptance_criterion_id`;
- one immutable `requirement_ref`;
- `design_refs`;
- `plan_refs`;
- `implementation_refs`;
- `test_refs`;
- `evidence_refs`;
- `delivery_status`.

References carry stable repository identity and exact source revision. Evidence
also carries its registry evidence class and result. Missing tests or evidence
are gaps, not pass. A `verified` row requires at least one current test
reference and current `PASSED` evidence. If the referenced repository revision
does not match the current revision map, the evidence result and delivery
status become `STALE`/`stale`.

Duplicate acceptance-criterion sources, parent references, or module ledger
sources fail closed. Product audit reports the gap; it never invents criteria,
implementation, tests, evidence, or delivery success.

## Cross-Repository View

`buildCrossRepositoryProductView` requires an integration/portal-owned
`cross-repository-aggregate`. Every module contribution contains:

```yaml
repository_id:
module_id:
artifact_id:
artifact_kind: product-ledger
repository_relative_path:
revision:
artifact_hash:
editable: false
```

The generated view declares `view_kind: cross-module-view` and
`editable_requirements: false`. It preserves provenance and references module
ledgers; it does not copy their editable requirement bodies. Duplicate
repository/artifact identities and editable sources block generation.
