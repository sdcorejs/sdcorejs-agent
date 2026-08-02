# Product Ledger Contract

Use this contract for every Product traceability ledger. The deterministic
implementation is `_refs/shared/product-ledger.mjs`; track, profile, artifact
kind, repository role, ownership scope, and evidence values come from
`_refs/shared/system-registry.json`.

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
| Validate identity, traceability, freshness, and duplicates | `validateProductLedger` |
| Create a canonical ledger and artifact hash | `createProductLedger` |
| Resolve module or integration owner and durable path | `resolveProductLedgerTarget` |
| Build an immutable-reference cross-module view | `buildCrossRepositoryProductView` |

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
```

Repository paths are always repository-relative. Checkout locations and the
current working directory are not durable identity. `artifact_hash` binds the
normalized metadata, traceability rows, and source references. An
`approval_hash` is required only when an approval contract applies; parent
references to approved artifacts preserve their approval hashes.

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
