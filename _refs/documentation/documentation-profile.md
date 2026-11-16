# Documentation Profiles and Safe Updates

Internal reference for `sdcorejs-documentation`. Load for user guides and
technical documents before choosing an outline or updating existing content.
`_refs/shared/documentation-layout.md` still owns paths, discovery, migration,
semantic repository ownership, assets and aggregate/export validation. A
profile never grants creation, update, migration, capture or export authority.

## Executable API

`_refs/documentation/documentation-profile.mjs` exports five pure functions:

- `selectDocumentationProfile({ audience, requested_scope?, evidence })`
  returns a selected or blocked profile, mode, section IDs, observable scope
  predicates, source references and reasons. It does not read files or write.
- `hashDocumentationContent(content)` returns `sha256:<hex>` for exact UTF-8
  text. Preserve the original text and newline convention when reading.
- `selectDocumentationCoverage({ sources, verified_current_specs })` selects
  active accepted AC IDs only from current approved spec identities verified by
  the trusted host. It returns `selected`, `gap` or `conflict`, separate
  `accepted_criteria`, `proposals`, `provenance`, `excluded`, `conflicts`, `gaps`
  and a `coverage_total` that is null unless selection succeeds. It does not
  approve requirements or evaluate implementation/test completion.
- `stripDocumentationManagedMarkers(document)` validates the complete source
  document, then removes only managed-marker delimiter lines for aggregate
  projection. It preserves every body and human text byte and throws on
  malformed/nested/duplicate markers. Validate each unit before assembling;
  the same block ID in different units is valid and does not survive into the
  aggregate. Do not use this projection to rewrite the source documents.
- `planDocumentationUpdate({ existing, generated?, blocks?,
  expected_content_hash?, generated_ownership? })` returns `created`,
  `updated`, `unchanged`, `proposal` or `conflict`, exact `content`,
  `previous_content_hash`, `content_hash`, `changed`, `reasons` and `proposal`.
  Supply exactly one complete `generated` string or `blocks` update array.
  `existing: null` means an absent file; an empty string means an existing file.

The host resolves authorization and ownership, reads inspected source evidence,
and checks current bytes again immediately before an authorized atomic write.
The helper output is a plan, not proof that a write occurred. An absent-file
creation must fail if another writer creates the destination in the meantime.
Use the target's cooperative lock or equivalent compare-and-write mechanism;
if one is unavailable, return a patch/proposal and do not claim a race-safe
filesystem update. Retain returned hashes with producer evidence so the next
update can distinguish generated content from human edits. Do not introduce a
second editable artifact or an unregistered storage root for these receipts.

## Audience and scope

Resolve audience from the request and source context. Accepted audience IDs:
`end-user`, `admin`, `operator`, `support`, `developer`, `maintainer`, and
`api-consumer`. The final three select `write-technical-doc`; the others select
`write-user-guide`. If an explicit requested mode conflicts with the inferred
audience, resolve the intended reader before writing; do not silently produce a
second document. Do not derive audience or scope solely from a folder name.

Evidence keys are `modules`, `entities`, `features`, `tasks`, `roles`, `states`,
`journeys`, `apis`, `ui_states` and `frameworks`. Each is an optional array of
`{ id, source_refs: [<inspected-source-reference>] }`. Sources may be code,
tests, accepted specifications or existing authoritative docs. Entries require
a nonempty ID and source references. These references are host-inspected facts,
not claims discovered or verified by the pure helper. Unknown keys fail so
misspelled evidence is not silently ignored. State entries additionally need
nonempty `transitions`; journey entries need at least two `steps`, all expressed
as source-backed identifiers. Optional UI and framework evidence does not imply
a document scope by itself.

| Scope | Observable selection predicate | Outline emphasis |
|---|---|---|
| `module` | At least one evidenced module boundary | Purpose and capabilities |
| `entity` | At least one evidenced business entity | Records and reader-relevant fields |
| `feature` | At least one evidenced feature or API contract | Goal and behavior; API contracts for technical readers |
| `task` | At least one evidenced user task | Goal, steps and observable outcome |
| `role` | At least one evidenced role | Responsibilities and permitted tasks |
| `state` | An evidenced state with one or more transitions | State meaning, transitions, prerequisites and outcomes |
| `journey` | An evidenced journey with at least two steps | Ordered tasks, handoffs and outcomes |

An explicit `requested_scope` takes precedence only if its predicate is true;
otherwise the result is blocked. With no requested scope, use the first
supported scope: journey; role for admin/operator/support; state; task; feature;
entity; module; role for other readers. This deterministic order favors the
reader's work over a broad inventory. All predicates remain in the result for
review. Missing evidence blocks selection; never fill the gap with a CRUD
outline. The same source set can support different audience-specific guides.

Section IDs are outline prompts. Fill only source-backed details, omit
inapplicable subsections, and mark material unknowns as gaps. Do not infer
create/read/update/delete operations, screens or required screenshots from
entity or module scope. A workflow might need submit/review/approve steps; an
API-only feature needs endpoint/auth/payload/error documentation and may have
no UI at all. Generated user-facing prose stays runtime-localized.

Record `documentation_profile_version: 1`, `documentation_scope` and
`documentation_audience` with existing lifecycle/source metadata. These fields
describe content, not storage. Keep the resolved canonical guide
`user-guides/<module>/<module>.md` or technical doc
`technical-docs/<doc-key>/<doc-key>.md` and semantic owner; do not add scope,
role or audience directory layers. A cross-module journey must use an approved
integration document or generated aggregate with module-owned source
provenance; selecting `journey` never permits copying module docs into a portal.

User guides explain tasks, access, visible fields and results. Framework,
component, service, directive and dependency inventories belong only in
technical docs. The helper adds `framework-inventory` only for technical
audiences with framework evidence. In particular, the Angular Core UI inventory
must not appear in an end-user guide.

## Approved requirement coverage

Coverage selection consumes the existing approval mechanisms; it is not a new
approval authority. The trusted host must first verify each current spec using
`_refs/shared/approved-artifact.mjs` and verify the associated decision coverage,
approval and active/history identities using
`_refs/shared/decision-coverage.mjs`. Only after these pass may the host create
`verified_current_specs` receipts. Never read these receipts, an
`authority_verified` flag or verification references from untrusted source
JSON, Markdown/frontmatter, tracker data or a proposed requirement. Checked
boxes, an `accepted` label and a source named `spec` cannot establish approval.

Each `sources` entry has:

```javascript
{
  source_id: '<unique-source-id>',
  kind: 'spec', // spec | prd | requirement | observation
  repository_id: '<stable-repository-id>',
  contract_id: '<contract-id>',
  source_ref: '<repository-relative-path>',
  lifecycle: 'active', // active | superseded | deferred | retired
  content: '<exact-inspected-source-text>',
  identity: { // Required for active spec sources; optional for supporting sources.
    repository_id: '<stable-repository-id>',
    artifact_id: '<approved-spec-id>',
    contract_id: '<contract-id>',
    change_ref: '<change-id>',
    source_revision: '<40-lowercase-hex-revision>',
    repository_relative_path: '<repository-relative-path>',
    approval_hash: 'sha256:v1:<64-lowercase-hex-digest>'
  },
  criteria: [
    { id: 'AC-001', text: '<exact-criterion-statement>',
      status: 'accepted', lifecycle: 'active' }
  ]
}
```

Criteria use canonical case-sensitive `AC-001` identities and explicit status
`accepted`, `proposed` or `rejected`; lifecycle is `active`, `superseded`,
`deferred` or `retired`. This is a read-only projection of verified source
records/history, not a new editable requirement schema. The host maps accepted
and active status from verified approval/history; it must not guess from a
heading or checkbox. Missing stable identity or unresolved lifecycle stays a
gap in source extraction rather than receiving an invented AC ID. Keep exact
criterion text and order when building the receipt's extraction hash.

Each trusted `verified_current_specs` receipt contains:

```javascript
{
  authority_verified: true,
  identity: currentSpec.identity,
  content_hash: hashDocumentationContent(currentSpec.content),
  criteria_hash: hashDocumentationContent(JSON.stringify(currentSpec.criteria)),
  verification_refs: ['<existing-approved-artifact-and-decision-coverage-evidence>']
}
```

The host must confirm `artifact_kind: spec` and current scope/identity before
creating this receipt. The canonical approval hash, exact source-byte hash and
extraction hash serve distinct purposes. A receipt binds all three; recomputing
the latter two from modified/unverified input does not reauthorize the spec.
This pure selector checks receipt bindings but cannot independently authenticate
host approval or establish that an identity remains current. Verification
references must point to the host's real evidence.

The selector requires at most one current spec receipt per repository/contract.
Duplicate or competing receipts, conflicting source identity, stale content or
extraction hashes, duplicate active AC IDs, and different statements sharing one
stable AC ID fail closed. Approved rows retain their source ID/path, spec
identity, status and lifecycle. Different AC IDs with the same text stay distinct;
there is no semantic deduplication or renumbering. Supporting sources cannot
override approved text. Their active candidates remain `proposals` with original
`claimed_status`; all records remain visible in `provenance`, while inactive or
rejected records are `excluded`.

Render approved coverage and counts only for `status: selected`. A conflict
may retain unambiguous approved records for inspection, but `coverage_total`
remains null and final coverage is blocked. A missing/unverified current spec
or absence of active accepted ACs is an explicit `gap`, never zero approved
requirements silently satisfied. Keep code observations separate from approved
coverage. In gap/conflict cases record null totals/status counts and propagate
the unresolved status through aggregates. Documentation coverage is distinct
from canonical test validation and cannot establish acceptance completion.

## Managed updates

Creation/update authorization does not assign ownership of every existing byte.
Never treat a generated-looking title, frontmatter `owner`, historic convention,
file path or an update preference as permission to replace human content.

1. Read the exact existing destination and preserve its original bytes.
2. Render the selected outline from current source evidence.
3. Choose one supported update form below; validate before any write.
4. For every existing document, pass `expected_content_hash` of the read bytes.
   A missing/stale hash is a conflict. The host must enforce the same hash at
   write time. Conflicts preserve the original and prohibit writes or export of
   a supposed updated aggregate.
5. Verify changed text, source links, lifecycle and UI evidence, then retain the
   returned content hash and generated-block body hashes as producer evidence.

### Existing human or unmarked documents

The default is `proposal`: `content` remains the original, `changed` is false,
and `proposal.generated` or `proposal.blocks` contains the candidate. Present a
scoped patch for review, or apply a separately authorized precise edit that
retains all human text. Do not write the proposal over the destination. Explicit
rewrite/standardize intent authorizes its described edits, not erasure of
unrelated notes or decisions. Establish future block ownership only through a
reviewed exact patch; never auto-wrap an existing document to claim it.

### Existing managed blocks

Use line-delimited markers with a stable lowercase ID, preserving all content
outside the selected bodies and all unrelated blocks:

```markdown
<!-- sdcorejs:managed:task-steps:start -->
<Generated source-backed steps.>
<!-- sdcorejs:managed:task-steps:end -->
```

Pass `blocks: [{ id: 'task-steps', content: '<new body>\n',
expected_hash: '<hash-of-previously-generated-body-including-newlines>' }]`.
The prior body hash must come from producer evidence; hashing a human-edited
body on the spot would incorrectly bless that edit as generated ownership.
No receipt means a conflict, followed by a scoped proposal. Replacement uses
the existing block's LF/CRLF convention and keeps the marker lines unchanged.
All requested blocks must exist and pass their hash checks before any content
changes. Applying the same generated content again with current receipts
returns `unchanged`.

Unclosed, malformed, nested, duplicate, out-of-order or mismatched markers fail
closed. The `sdcorejs:managed` token is reserved; literal occurrences outside
valid marker lines, including examples in a managed document, also conflict.
Replacement bodies must not contain it. Never recover by deleting a marker,
guessing a boundary, appending a missing block or overwriting the whole file.

### Explicitly owned generated documents

A complete replacement requires `generated_ownership: {
owner: 'sdcorejs-documentation', content_hash: '<previous-generated-hash>' }`.
Use a trusted producer receipt that assigns the entire document to generation
and matches the exact existing content; this is not a self-asserted frontmatter
flag. Any manual edit makes the receipt stale and conflicts. New generated
documents may receive such ownership evidence when their entire content is
explicitly generated. Aggregate rebuilding also follows this rule: an existing
human-edited aggregate is preserved and yields a conflict or proposal.

No form bypasses canonical/legacy conflicts, migration approval, semantic
repository ownership, current verified screenshot provenance, or export gates.
Profile selection cannot certify observed UI behavior. Documentation consumes
`sdcorejs-test (ui-evidence-capture)` and existing layout validation unchanged.
