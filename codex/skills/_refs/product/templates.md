# Product Artifact Templates

These templates are locale-neutral source patterns. At runtime, localize
human-facing product prose to the user's language while preserving IDs, schema
keys, paths, permission codes, routes, and environment keys in English. Replace
every brace token with an observed or approved value; never persist a token as
finished prose.

## Contents

- [Template Rules](#template-rules)
- [PRD Projection](#prd-projection)
- [User Story Projection](#user-story-projection)
- [Acceptance Criteria Projection](#acceptance-criteria-projection)
- [UAT Scenario Projection](#uat-scenario-projection)
- [Decision Projection](#decision-projection)
- [Current Ledger](#current-ledger)
- [Immutable History Record](#immutable-history-record)
- [Compact Product Packet Fallback](#compact-product-packet-fallback)

## Template Rules

- Existing target layout wins when uniquely attributable and safe. Keep its
  folder names and document split; add required identity/source fields without
  moving unrelated files.
- The approved spec is normative. PRD, story, acceptance-criteria, UAT-scenario,
  and decision documents are approved projections tied to its path, anchor,
  revision, and hash.
- Derived ledgers reference stable IDs and source path/anchor/hash. They do not
  repeat full normative requirement prose.
- Use `AC-001`, `US-001`, `UAT-001`, and `DEC-001` in new examples. Preserve
  literal legacy IDs in existing contracts; never renumber them while applying
  a template.
- Unknown values are written as `unknown` or `null` according to the schema.
  Do not invent architecture, paths, evidence, approval, or acceptance results.
- Any revision updates the identity header and source hashes. Previous
  projections are retained through immutable history; approved spec snapshots
  are never edited.

The split fallback returned by `resolveProductLayout` uses product document
paths for PRD, stories, acceptance criteria, UAT scenarios, and decisions plus
a collision-safe `.sdcorejs/docs/product/{contract-key}` ledger. A target's
established equivalent paths take precedence.

## PRD Projection

```markdown
---
projection_kind: prd
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
approved_spec_anchor: "{feature anchor or null}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# PRD - {localized feature title}

## Problem

{Localized approved problem projection.}

Source: `{approved spec path}#{problem anchor}`

Source hash: `{source section sha256}`

## Goal

{Localized approved outcome projection.}

Source: `{approved spec path}#{goal anchor}`

Source hash: `{source section sha256}`

## Users

| Role ID | Localized role | Approved need | Source | Source hash |
|---|---|---|---|---|
| ROLE-001 | {role} | {need} | `{path}#{anchor}` | `{sha256}` |

## In Scope

| Scope ID | Approved capability | Source | Source hash |
|---|---|---|---|
| SCOPE-001 | {capability} | `{path}#{anchor}` | `{sha256}` |

## Out Of Scope

| Scope ID | Approved non-goal | Source | Source hash |
|---|---|---|---|
| OOS-001 | {non-goal} | `{path}#{anchor}` | `{sha256}` |

## Success Criteria Index

| Requirement ID | Approved source | Source hash |
|---|---|---|
| AC-001 | `{path}#{anchor}` | `{sha256}` |
```

## User Story Projection

```markdown
---
projection_kind: user-stories
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# User Stories - {localized feature title}

| Story ID | As a | I want to | So that | Priority | Acceptance criteria | Approved source | Source hash |
|---|---|---|---|---|---|---|---|
| US-001 | {localized role} | {localized approved action} | {localized approved benefit} | {required or optional} | AC-001 | `{path}#{anchor}` | `{sha256}` |
```

Story prose is a projection for PO/QC readability. The approved source reference
and hash retain authority; the ledger stores only the story ID and source link.

## Acceptance Criteria Projection

```markdown
---
projection_kind: acceptance-criteria
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# Acceptance Criteria - {localized feature title}

| Requirement ID | Story IDs | Approved observable criterion | Priority | UAT required | Approved source | Source hash |
|---|---|---|---|---:|---|---|
| AC-001 | US-001 | {localized approved observable behavior} | required | true | `{path}#{anchor}` | `{sha256}` |

## Retired Requirement Index

| Requirement ID | Retired in revision | Superseding decision | Historical source | Source hash |
|---|---:|---|---|---|
| {retired stable ID or none} | {revision or null} | {decision ID or null} | `{path or null}` | `{sha256 or null}` |
```

Do not remove or reuse a retired ID. Do not add implementation or test status to
this normative projection.

## UAT Scenario Projection

```markdown
---
projection_kind: uat-scenarios
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# UAT Scenarios - {localized feature title}

## UAT-001 - {localized scenario title}

- Requirement IDs: `AC-001`
- Approved source: `{path}#{anchor}`
- Source hash: `{sha256}`
- Preconditions: {localized approved preconditions}
- Actor role: {localized business role}
- Test data policy: {sanitized fixture or generated data rule}
- Environment constraints: {approved constraints}

### Steps

1. {Localized approved business step.}
2. {Localized approved business step.}

### Expected Result

{Localized approved observable result.}

Expected result ref: `{path}#uat-001-expected-result`

Execution index: `{resolved UAT execution index path}`
```

The scenario file defines intent and remains normative. Actual results,
executor, time, environment, and evidence use immutable `uat_record` entries
from `_refs/product/evidence-and-uat.md`; do not write them into the scenario
definition as if they were requirements.

## Decision Projection

```markdown
---
projection_kind: product-decisions
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# Product Decisions - {localized feature title}

| Decision ID | Date | Decision | Reason | Impacted IDs | Approval source | Approved source | Source hash |
|---|---|---|---|---|---|---|---|
| DEC-001 | {ISO date} | {localized approved decision} | {localized approved reason} | AC-001 | {approval reference} | `{path}#{anchor}` | `{sha256}` |
```

Only approval-backed decisions belong here. Derived gap explanations stay in
the ledger and do not become decisions automatically.

## Current Ledger

The current ledger is derived and contains references, not duplicated
normative prose.

```markdown
---
ledger_kind: product-current
schema_version: 1
contract_id: "{contract ID}"
feature_id: "{feature ID}"
feature_slug: "{feature slug}"
contract_key: "{collision-safe contract key}"
requirement_revision: {integer}
feature_lifecycle: "{draft, active, superseded, retired, or unknown}"
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
approved_spec_integrity_hash: "{sha256}"
approved_plan_path: "{repository-relative approved plan path}"
approved_plan_hash: "{sha256}"
approved_plan_integrity_hash: "{sha256}"
source_requirement_hash: "{sha256 or null}"
requirement_ids:
  - AC-001
retired_requirement_ids: []
requirement_field_hashes:
  AC-001: "{sha256 of the complete approved requirement projection}"
requirement_source_hashes:
  AC-001: "{sha256 derived from approved-spec requirement bytes}"
product_action_lifecycle:
  sequence_id: "{approved product action sequence ID}"
  step_id: "{approved product action step ID}"
  step_ordinal: {positive integer}
  predecessor_context_digest: "{prior product_context sha256 or null}"
  required_checkpoint: "{approved checkpoint name}"
product_context_digest: "{sha256}"
verdict: "{derived verdict}"
updated_at: "{ISO-8601 timestamp}"
---

# Product Contract Ledger - {localized feature title}

## Authority

| Authority | Path and anchor | Hash | Revision | Status |
|---|---|---|---:|---|
| Approved spec | `{path}#{anchor}` | `{sha256}` | {integer} | approved |
| PRD projection | `{path}` | `{sha256}` | {integer} | {current or stale} |
| Story projection | `{path}` | `{sha256}` | {integer} | {current or stale} |
| Acceptance projection | `{path}` | `{sha256}` | {integer} | {current or stale} |
| UAT scenario projection | `{path}` | `{sha256}` | {integer} | {current or stale} |
| Decision projection | `{path}` | `{sha256}` | {integer} | {current or stale} |

## Requirement Traceability

| Requirement ID | Source | Source hash | Requirement | Implementation | Verification | UAT | Freshness | Evidence IDs | Gap IDs | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| AC-001 | `{path}#{anchor}` | `{sha256}` | {requirement status} | {implementation status} | {verification status} | {UAT status} | {evidence freshness} | {evidence IDs or none} | {gap IDs or none} | {derived verdict} |

## Artifact Index

| Artifact ID | Role | Path and anchor | Content hash | Requirement or control IDs |
|---|---|---|---|---|
| ART-001 | requirement_implementation | `{path}#{anchor}` | `{sha256}` | AC-001 |

## Evidence Index

| Evidence ID | Kind | Observed at | HEAD or diff | Relevant-path hash | Output digest | Freshness | Artifact refs |
|---|---|---|---|---|---|---|---|
| EVID-001 | {kind} | {ISO-8601 timestamp} | `{identity}` | `{sha256}` | `{sha256}` | {evidence freshness} | {artifact IDs or none} |

## UAT Execution Index

| UAT record ID | Scenario ID | Expected result ref | Status | Executed by | Executed at | Evidence refs |
|---|---|---|---|---|---|---|
| UAT-001-EXEC-001 | UAT-001 | `{path}#uat-001-expected-result` | {UAT status} | {recorded identity} | {ISO-8601 timestamp} | {evidence IDs or none} |

## Gaps

| Gap ID | Type | Affected IDs | Blocking | Required action | Evidence refs |
|---|---|---|---:|---|---|
| {gap ID or none} | {gap type or none} | {IDs or none} | {true or false} | {action or none} | {IDs or none} |

## Status Summary

- Feature lifecycle: `{lifecycle}`
- Requirement status counts: `{counts}`
- Implementation status counts: `{counts}`
- Verification status counts: `{counts}`
- UAT status counts: `{counts}`
- Evidence freshness counts: `{counts}`
- Derived verdict: `{verdict}`
- Blockers: `{gap IDs or none}`
- Warnings: `{gap IDs or none}`

## History And Related Records

- Prior immutable ledger: `{history path or none}`
- Legacy history links: `{paths or none}`
- Product context digest: `{sha256}`
```

## Immutable History Record

Create a new file only when a prior current ledger exists; never edit an
existing history record. An initial `seed-from-approved-spec` creates current
state and an active index without fabricating prior history.

```markdown
---
ledger_kind: product-history
schema_version: 1
immutable: true
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
history_event: "{requirements-update, traceability-sync, audit-and-sync, record-uat, or supersede-feature}"
source_current_path: "{active ledger path}"
source_current_hash: "{sha256 of prior current ledger}"
successor_context_digest: "{sha256}"
created_at: "{ISO-8601 timestamp}"
---

# Product Ledger History - {localized feature title}

## Identity

- Contract ID: `{contract ID}`
- Requirement revision: `{integer}`
- Approved spec: `{path}#{anchor}`
- Approved spec hash: `{sha256}`
- Prior current ledger hash: `{sha256}`

## Transition

- Event: `{history event}`
- Product action: `{exact product action}`
- Prior context digest: `{sha256 or null}`
- Successor context digest: `{sha256}`
- Actual changed paths: `{repository-relative paths}`
- UAT record IDs: `{IDs or none}`
- Gap IDs: `{IDs or none}`
- Derived verdict before: `{verdict or unknown}`
- Derived verdict after: `{verdict}`

## Referenced Snapshot

Use the prior current ledger path/hash and source artifact hashes as the
snapshot. Do not paste approved requirement prose into history.
```

## Compact Product Packet Fallback

Use this combined projection only when the target already has a safe
single-file product convention or the user explicitly approved a compact
packet. It does not replace the collision-safe current/history ledger and must
not be used to merge different contracts by slug.

```markdown
---
projection_kind: compact-product-packet
contract_id: "{contract ID}"
feature_id: "{feature ID}"
requirement_revision: {integer}
approved_spec_path: "{repository-relative approved spec path}"
approved_spec_hash: "{sha256}"
projection_hash: "{sha256}"
updated_at: "{ISO-8601 timestamp}"
---

# Product Packet - {localized feature title}

## Product Summary

- Problem source: `{path}#{anchor}` (`{sha256}`)
- Goal source: `{path}#{anchor}` (`{sha256}`)
- Scope source: `{path}#{anchor}` (`{sha256}`)

## Story Index

| Story ID | Acceptance criteria | Approved source | Source hash |
|---|---|---|---|
| US-001 | AC-001 | `{path}#{anchor}` | `{sha256}` |

## Acceptance Criteria Index

| Requirement ID | Priority | UAT required | Approved source | Source hash |
|---|---|---:|---|---|
| AC-001 | required | true | `{path}#{anchor}` | `{sha256}` |

## UAT Scenario Index

| Scenario ID | Requirement IDs | Approved source | Source hash | Execution index |
|---|---|---|---|---|
| UAT-001 | AC-001 | `{path}#{anchor}` | `{sha256}` | `{ledger UAT index path}` |

## Decision Index

| Decision ID | Impacted IDs | Approved source | Source hash |
|---|---|---|---|
| DEC-001 | AC-001 | `{path}#{anchor}` | `{sha256}` |

## Derived Ledger

- Current ledger: `{path}`
- Current context digest: `{sha256}`
- Verdict: `{derived verdict}`
```

The compact packet remains an index. Human-facing normative prose stays in the
approved source or an explicitly approved localized projection; derived status
and evidence stay in the ledger.
