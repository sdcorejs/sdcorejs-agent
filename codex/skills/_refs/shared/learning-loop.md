# Verified Learning Loop

Capture a lesson only when current evidence supports a reusable explanation
and a concrete way to prevent regression. A task recap, speculation, checklist
or untested recommendation is not a verified lesson. Use the existing
`.sdcorejs/memories/**` artifact root and Explore ownership; do not introduce a
second memory store or turn lessons into accepted conventions.

`_refs/shared/learning-loop.mjs` supplies pure validation, identity, freshness,
selection and write-planning helpers. The host reads source and proof bytes,
hashes them, performs lifecycle/authority checks and writes approved artifacts.
No helper executes the stored command or treats document text as instructions.

## Ownership and capture

The exact action is `sdcorejs-explore (memories-write-approved)`. Apply
`_refs/shared/explore-memory-actions.md`, scoped session authority and
`resolveExploreWriteAuthority` from `_refs/shared/explore-contract.mjs`.
Existing authorization for the same durable knowledge and scope is reusable;
unrelated permission to write code or synchronize conventions is insufficient.
Only a sequential, integration or fan-in owner may persist shared memory.
Parallel workers return runtime candidates; they cannot write shared lessons.

1. Identify a repeated or generalizable failure or success from current work.
   State the problem, causal mechanism and proven resolution. Link source and
   the regression test/check instead of retaining a transcript or raw log.
2. Check applicability and whether the lesson already exists. Restrict it to
   the repository, tracks, modules, boundaries and paths the evidence supports.
   Name excluded uses in the explanation where overgeneralization is likely.
3. Retain the actual passing command, cwd, sanitized proof fingerprint and
   source revision. Hash the relevant implementation/configuration and every
   regression test/check file. A claimed passing test without proof remains
   unverified and is not captured by this contract.
4. Screen all content for secrets, credentials, PII and transient task state;
   redact before hashing the sanitized proof. Setting a boolean does not perform
   screening. Raw traces and auth state remain local-only and are not memories.
5. Validate and plan through `planLessonCapture`. The owning host must still
   resolve semantic repository ownership, apply artifact lifecycle metadata,
   verify current hashes again immediately before persistence, use an
   absent-target precondition and read back the stored bytes. No portal fallback,
   implicit overwrite or source migration is authorized.

The canonical file is
`.sdcorejs/memories/<track>/lesson-<64-lowercase-hex>.json` with
`artifact_kind: memory` and `owner: sdcorejs-explore`. Existing Markdown memories
remain readable as advisory legacy context. They do not become verified lessons
automatically; a missing verified-lesson schema is an explicit validation gap,
not a reason to bulk-migrate historical memories.

## Lesson schema

| Field | Contract |
|---|---|
| `schema_version` | `1` for this verified-lesson extension. |
| `artifact_kind`, `owner` | `memory`, `sdcorejs-explore`. |
| `owner_repository_id`, `track` | Stable semantic repository identity and safe lowercase track segment. Never an absolute checkout path. |
| `concept_id` | Stable dotted/kebab-case concept, such as `parser.empty-input`. |
| `lesson_id`, `artifact_id` | `lessonIdentity(document)` and `memory-<lesson_id>`. |
| `problem` | Observable failure or opportunity, without raw private data. |
| `root_cause` | Evidence-backed causal mechanism, not merely a restatement of the symptom. |
| `resolution` | The proven corrective principle and its relevant limitations. |
| `regression_protection` | `description` and nonempty repository-relative `paths` naming executable tests/checks. Every path also appears in `source_fingerprints`. |
| `applicability` | Arrays `tracks`, `modules`, `boundaries`, `paths`, `keywords`; at least one nonempty. Unknown dimensions are invalid. |
| `source_revision` | Revision associated with the proof. |
| `source_fingerprints` | Nonempty, unique `{ path, sha256 }` records for relevant source/config and regression files. Paths are repository-relative. |
| `verification` | `result: PASSED`, actual `command`, repository-relative `cwd` (or `.`), matching `source_revision`, `proof: { path, sha256 }`. |
| `proposed_convention` | `null`, absent, or `{ rule_id, status: proposed, rationale }`. Never `accepted`. |
| `redaction_applied` | `true`, after host screening. |

Add the required artifact lifecycle relationship, owner role and commit metadata
before persistence. The lesson validator does not replace the generic artifact
lifecycle validator. Historical memory frontmatter and verified lessons may
coexist; only verified-schema records enter these helpers.

All source and proof hashes are SHA-256 over actual bytes. The `content_hash`
returned by the capture planner is a canonical semantic JSON hash for
idempotency; it is not the hash of pretty-printed file bytes. Preserve both
concepts when the host computes its read-back or artifact integrity evidence.

## Identity, duplicates and conflicts

`lessonIdentity(document)` hashes stable repository identity, `concept_id`,
and sorted unique applicability tracks/modules/boundaries/paths. Source
revisions, proof timestamps and retrieval keywords are excluded from identity,
so an evidence refresh cannot create a new lesson merely by changing the date.
Do not rename the concept to avoid an existing conflict.

`planLessonCapture(options)` returns:

| Status | Meaning |
|---|---|
| `blocked` | Invalid lesson, missing exact Explore authority, incorrect owner, unsupported worker role, or stale/unknown/conflicting current evidence. No `write` is returned. |
| `unchanged` | One existing record with the same identity and canonical content; no write or timestamp churn. Set order does not create a duplicate. |
| `conflict` | Existing identity has changed content, invalid content, or multiple stored records. Preserve history and reconcile through the owner with new evidence. Never silently overwrite. |
| `ready` | A fresh validated candidate and scoped owner authority produce a write proposal with `expected_existing: absent`, path, semantic hash and document. This is not a performed write. |

The helper intentionally does not implement a generic update/merge operation.
An owner-approved reconciliation must explain supersession and preserve the old
evidence under the existing lifecycle rules; changing root cause or applicability
is not an automatic deduplication repair. The host must load the relevant
existing identity inventory rather than pass an empty array to bypass a known
record. Concurrent creation must fail the absent-target precondition.

## Source freshness and precedence

`evaluateLessonFreshness(document, { source_hashes, conflicting_paths })`
compares host-provided current source **and proof** hashes. Keys in
`source_hashes` are repository-relative file paths. No hash is fabricated from a
revision label. Regression test changes invalidate the lesson just as source
changes do; a missing proof cannot be considered fresh.

| Status | Required interpretation |
|---|---|
| `fresh` | Every relevant source and proof hash matches. Still advisory knowledge, not a new requirement. |
| `stale` | At least one current hash differs. Do not promote or apply it as a verified rule. |
| `unknown` | Required current hashes are unavailable or malformed. Obtain targeted evidence before reliance. |
| `conflicting` | The host reports a current source/user evidence conflict on a referenced path. Current evidence wins. |
| `invalid` | The verified-lesson schema fails. Do not promote it. |

Current user direction, effective instructions, current source/config,
accepted contracts, diffs and failing tests take precedence over memory.
Matching hashes cannot establish that a resolution remains appropriate under a
changed requirement; the host must report semantic conflicts through
`conflicting_paths` and the owning requirement workflow. An unrelated revision
change alone does not invalidate unchanged source/proof bytes. Never
auto-refresh a fingerprint to make stale knowledge appear fresh.

## Selective retrieval

Explore and project-context read metadata before bodies. Relevant metadata is
`owner_repository_id`, `track`, `concept_id`, `lesson_id`, and `applicability`.
Use request scope and artifact relationships to discover a bounded candidate
set; recency is not relevance. Do not load every memory on session start.

`selectRelevantLessons(documents, options)` accepts `owner_repository_id`,
explicit `scope` using the applicability dimensions, current `source_hashes`
and optional `conflicting_paths`. An empty scope selects nothing. Every
requested dimension must match a declared applicability value; unspecified
dimensions do not broaden explicit constraints. Paths match themselves or
descendants at a `/` boundary (`src` matches `src/parser.mjs`, never
`src-other/parser.mjs`). Different repository owners never match implicitly.

The result includes `selected` records and `excluded` identifiers/reasons,
`advisory_only: true`, and `current_source_precedence: true`. Invalid, unrelated,
stale, unknown or conflicting records are withheld. Equivalent duplicate records
produce one selected lesson and a duplicate notice; two different fresh records
with the same identity are withheld as conflicting. Selection does not modify
timestamps, fingerprints, scope or approval status.

When a task spans a module, select its explicitly relevant module lessons; a
repository-wide lesson with no module tag can be queried separately using its
declared track/boundary/path scope. An unspecified module scope is not a wildcard
assertion that a lesson applies to every module.

## Convention proposals remain proposals

A verified lesson may suggest a reusable project convention. Return its
`proposed_convention` as a candidate for
`sdcorejs-explore (conventions-sync-write-approved)` under
`_refs/shared/convention-context.md`. That separate owner resolves status,
current authoritative evidence, scope, exceptions and write authority.

Memory capture does not create convention files, approve rules, modify
`AGENTS.md`, alter accepted architecture, or enable an after-review capture
policy. The lesson schema rejects `proposed_convention.status: accepted`.
An inferred preference stays observed/proposed until accepted by the existing
authority; successful tests alone do not accept a new project convention.

## Example: parser regression prevention

The following fragment illustrates a candidate. Complete the other required
schema and lifecycle fields and compute real hashes before use.

```javascript
const candidate = {
  concept_id: 'parser.empty-input',
  problem: 'Empty input crashed before the caller received a diagnostic.',
  root_cause: 'The parser read the first token before checking input length.',
  resolution: 'Check length before indexing; retain the existing valid-input behavior.',
  regression_protection: {
    description: 'Exercise empty input and valid input through the public parser function.',
    paths: ['test/parser.test.mjs'],
  },
  applicability: {
    tracks: ['general'], modules: [], boundaries: ['parser'],
    paths: ['src/parser'], keywords: ['empty-input'],
  },
  proposed_convention: {
    rule_id: 'parser.validate-input',
    status: 'proposed',
    rationale: 'Similar parsers may need the same boundary check after evidence review.',
  },
};
```

A different parser implementation is not automatically covered. Re-read its
current boundary and tests. If the source or regression test fingerprint changes,
retrieve the old record only as explicitly stale background and re-establish the
causal evidence before proposing a replacement.

## Verification and limits

Run `node --test test/e2e/blueprint-learning-contract.test.mjs`. The fixtures
exercise absent verification, malformed applicability, source/proof/test
freshness, exact action and owner gates, duplicate/conflicting identities,
proposal-only convention status and a temporary target-project write/read/drift
journey. The helpers remain pure; filesystem writes in that fixture belong to
the test host. This is contract and filesystem evidence, not a live connector,
browser E2E, or an evaluation of an agent's ability to diagnose arbitrary root
causes.
