# Shared UI/UX Authoring Evidence

This is a reference upgrade with zero new public skills. It uses the existing
prompt-routing harness and artifact/review contracts. The original new-skill
ceiling lifecycle and ten-scenario live matrix remain separate and unchanged.

Source baseline: `4fa58c66bc8b96c3ddcad887403d1eb9cfb5c8f4`, fetched main on
2026-09-09; checkout was clean. Upstream comparison and selective-adoption table
are in `_refs/design/uiux/sources.md`. The user supplied the implementation
scope and six phases; routine implementation details were resolved within that
scope, without adding a new approval gate or public executor.

Implementation sequence: baseline/source comparison; shared topic selection and
patterns; integration into design/code/review routing; baseline/feature exceptions
inside existing handoffs; deterministic/mutation checks; mirror generation and
repository validation. No new target-project artifact shape was needed.

## Baseline source assessment

A fresh isolated authoring agent read immutable baseline source and returned the
following sanitized assessment. It did not execute a target app, renderer,
browser, external documentation provider or production change. Runtime model,
effort and token receipts were unavailable. This is source-guided assessment,
not a live target-project benchmark.

| Scenario | Existing safe behavior | Observed retrieval/contract gap | Candidate verification |
|---|---|---|---|
| Three-level Core UI sidebar | Existing shell, route/permission and token/icon reuse | No focused hierarchy/expansion/current-parent/collapsed interaction checklist | `sidebar` selection and design routing cases |
| Mobile table cards | Shared state ownership and mobile gesture alternatives | No explicit parity for row identity, open, selection, action and pagination scope | `mobile-table` selection and UX-TABLE-MOBILE verification matrix |
| Portal CRUD | Installed component reuse and unknown API safeguards | No shared task-focused UX lookup | `portal-crud` selection and exact-version fixtures |
| Landing page | Approved Next.js feature subset, no automatic optional integrations | No shared retrieval route from code executor | `landing` selection and design routing |
| Source-only UI review | Existing read-only/evidence rules and non-blocking preferences | No focused classification/verification fields for shared UX observations | Finding mutations, including repair flags and narrow dimensions |
| No pattern/exact docs | Unknown component fit remains candidate | Fetcher can return another major; declaration ranges may appear exact | No-match/partial-match, aliases, installed/lock/range tests |
| Missing module owner | No portal fallback; immutable cross-module provenance | Existing control is sufficient | Real owner resolver and closure negative cases |
| Q&A/backend/bounded fixes | Direct/fast paths already exist | Topic loading must preserve them; deterministic harness misroutes drawer Q&A | No-load, spacing/focus and prompt-routing controls |

Sanitized baseline responses: inspect existing UI before proposing; preserve data
and action contracts; keep unverified component APIs candidate; use only approved
website features; report source-only visual/interaction limits; report nonexact
docs; block module writes when the owner is unavailable; answer Q&A directly.
The gaps above are source observations, not claims of application failures.

## Reproducible evidence

Run `npm run test:e2e:uiux`. The focused suite actually calls the selector,
prompt harness, Core UI detector, review validator and design owner/closure
helpers. Tests pair positive results with no-match, incorrect scope, missing
evidence, automatic aesthetic repair, range guessing and owner mutations.

`records.json` binds the immutable GREEN snapshot, actual sanitized command
outputs and historical REFACTOR source hashes. `evidence.test.mjs` checks these
bindings and the resolvable baseline revision. The RED helper-absent failure is
supplemented by real failing version/repair tests, not fabricated agent telemetry.
The GREEN test contract remains unchanged through REFACTOR; the small refactor
hoists the classification map without changing behavior.

The subsequent independent review repairs are a separate phase: three additional
regression tests first fail, then all 19 focused cases pass. `post_review` binds
that contract and both transcripts; `final_sources` binds the delivered sources.
The historical GREEN/REFACTOR evidence is preserved rather than relabeled as the
later repair state.

The user's subsequent skill-creator review found hoisted Core UI discovery,
alias selection and native-navigation retrieval gaps. Its six regression cases
are separate from the original contracts: all six fail before repair and pass
afterward. `skill_creator_repair` retains the previous final-source hashes,
records findings R1-R3 and binds the new test contract plus RED/GREEN transcripts.
`final_sources` now binds the repaired delivery. Prior evidence is not relabeled.
An additional failing isolation probe within R1 prevents a plain Angular sibling
from inheriting another workspace application's hoisted Core UI identity; the
final GREEN run includes that assertion for both supported aliases.

The Visual Companion integration refreshes `final_sources` after a new actual
25-case deterministic UI/UX regression. `visual_offer_integration` preserves the
prior final hashes bound to its source revision and adds the current contract
manifest and captured output. It does not relabel historical phase transcripts
or claim fresh target-project, live-agent or visual rendering coverage.

The Design handoff integration uses `design-handoff-integration.json` as a
separate evidence record. `records.json`, snapshots and historical transcripts
remain unchanged. Its `base_record` pins that historical delivery to a real Git
revision and content hash; historical `final_sources` are checked at that
revision. They are not evidence for the current working tree.

The new record binds an actual 25-case deterministic command, cwd, repository
owner, timestamps, exit code, complete TAP output, source manifest and content
fingerprint. The manifest includes the historical source inventory, every skill
read by routing, the test contracts and their local static module/data imports.
Hashes use UTF-8 text with LF line endings. Source bytes are observed before and
after the command; a changed manifest prevents recording success. The evidence
validator checks current contents even when HEAD has not changed and rejects
omitted paths, unavailable sources and altered command/output bindings. Updating
this record requires another real run, never copying a historical PASS forward.
Its result remains deterministic contract evidence: live-agent, target-product
rendering and interaction checks remain NOT RUN.

Before commit, four RED transcripts had trailing horizontal whitespace removed
to satisfy Git diff hygiene. `transcript_normalization` retains each original
hash and the exact removed line suffixes, so the original normalized output can
be reconstructed. Failure details and test results are unchanged; the transcript
references now hash the sanitized files.

Deterministic checks verify retrieval/schema/routing/ownership contracts. They
do not prove sidebar, card, form or chart rendering/interaction in a consuming
project. Fresh target-project live-agent A/B and visual verification are **NOT
RUN**: no provider-use authorization or target UI/runtime was supplied. No
credentialed provider was invoked by these tests, and tokens remain null.

The independent review found and prompted repairs for exact-version range
guessing, aesthetic automatic-repair flags, narrow dimension expansion and
contradictory active accessibility addenda. Final repository gate results belong
in the change-scoped `.sdcorejs/docs/workflow/` delivery record.
