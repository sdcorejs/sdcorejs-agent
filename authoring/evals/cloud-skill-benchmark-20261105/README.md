# Cloud skill installation and paired benchmark — 2026-11-05

The user requested the recommended installations and a benchmark. This is a new,
scoped continuation; it does not replace historical evidence or the fixed
ten-scenario `live-agent-matrix.json`.

## Results

| Measurement | Baseline | Candidate |
| --- | --- | --- |
| Deterministic routing/dirty contracts | 20/30 | 30/30 |
| Native agent behavioral assertions | 60/60 | 60/60 |
| Native agent jobs | 12 | 12 |

Baseline: `97cc700ef7201a3074c57aedff89cbe131f9ee6f`.
Candidate: `be1c4963fa2e0f5b32d9523d9601b3dc634db289`.
The later evidence commit is not the revision used by the workers.

Six scenarios, two fresh repetitions per scenario/configuration, five frozen
semantic assertions each: delegated planning, review-only planning, dirty
preflight, personal travel caption, technical product TikTok script, and
confounded feedback with separate voices. The two independent graders each
handled 12 outputs in one domain; this is not double grading of every output.
Labels and source paths were masked and shuffled before grading. Workers could
see configuration names in their output paths and were not blinded.

All 30 assertion types passed in both configurations, so this sample provides
no observed agent pass-rate improvement. Do not interpret zero spread as
certainty. Both baseline dirty-preflight workers identified the helper/prose
conflict and chose safe final actions. The executable defect still matters:
the baseline helper authorizes a bare dirty directory under its matching glob.
Both helpers authorize disjoint work, but the baseline execute-plan prose
contradicts that result by requiring another permission question. The candidate
aligns the helper's overlap result and the prose's disjoint-work continuation.
Seven baseline routing cases and three overlap cases fail deterministic checks.
The routing harness is not a measurement of model-selected skill activation.

Content sources are unchanged between the revisions and serve as regression
controls. Its short caption avoids invented travel experience; the product
scripts reject unsupported numbers/testimonials; feedback responses distinguish
2% from 1.25% clicks/reach without claiming causation. The benchmark does not
establish that Content is better than a no-skill baseline or that persistent
voice separation works across sessions.

## Installed tools

Installed in the current cloud's user skill directory, outside this repository:

- OpenAI `skill-installer` and `playwright`, pinned to
  `49f948faa9258a0c61caceaf225e179651397431`.
- Anthropic `anthropic-skill-creator`, pinned to
  `ca45fc496a3436251f191354091d557da31c15b5`, with a namespaced, evaluation-only
  entrypoint and the local Codex adapter described in `codex-adaptation.md`.
- The existing OpenAI `skill-creator` is retained. Public sdcorejs inventory,
  package dependencies, mirrors and cloud global permissions are unchanged.

The installed scripts match the pinned upstream bytes; local additions and the
entrypoint adaptation are listed in `install-receipt.json`. All three installed
skills passed OpenAI's structural validator. Discovery is expected on a new
turn; these skills were loaded explicitly for this run. Persistence in a fresh
cloud environment is not established.

Upstream aggregation substitutes missing telemetry with zero or output
characters and assumes three repetitions. `tools/aggregate_codex.py` instead
validates the exact frozen assertions, balanced two-run capture and declared
totals, then uses upstream `calculate_stats` for pass rates only. Native model
revision, effort, tokens, durations and turns are unexposed and remain null.
No speed, cost or context-token improvement is claimed. Its four negative/control
tests pass, including rejection of missing runs, changed assertions and
contradictory totals. Upstream scripts are unchanged.

## Review and evidence

Download `review.html` and open it locally for the 24 outputs, exact prompts,
grades and comparison. It was generated with upstream `generate_review.py`.
The adapter removes optional remote fonts and the unused XLSX library, adds an
empty favicon, and adjusts runtime labels. The viewer is not a hosted service.
Human feedback has not been supplied; automated grades are not user approval.

- `evals.json`, `grading-criteria.json`: exact scenarios and criteria frozen
  before output inspection; the criteria hash is retained.
- `snapshot-identities.json`, `snapshot-verification.json`: source commits,
  archive hashes and post-run byte comparisons for both snapshots.
- `iteration-1/`: output artifacts, exact semantic grader decisions, unknown
  telemetry, and sanitized worker action records. An action record is a worker
  self-report, not an authenticated native tool stream.
- `grading-map.json`: masked sample-to-run mapping and original grading hashes.
- `deterministic-results.json`: exact helper/dispatcher outcomes, zero provider
  calls. Most cases are known regressions/controls; two are newly worded cases.
- `authoring-matrix.json`: new run of the repository's required 10/10
  deterministic authoring matrix, separate from the native benchmark.
- `verification.json`: scoped checks and browser observations.
- `evidence-manifest.json`: SHA-256/byte index of the reviewed evidence bundle.

Snapshots share existing dependencies on the same host; isolation is enforced
by worker instructions and checked source immutability, not a security sandbox.
Entry skills are supplied to workers, so native automatic routing is not tested.
The capture forbids target writes and external effects; corresponding assertions
are partly guaranteed by the harness. Selected helper results are executable;
spec/plan outputs are outlines, not validator-approved persisted documents.
Video duration is estimated, not measured. Raw runtime/browser logs stay local;
the published action records are sanitized evaluation evidence.

## Reproduce

Use the pinned upstream skill installation, not an unreviewed latest revision.
With its `scripts` directory in `PYTHONPATH`, run:

```text
python tools/test_aggregate_adapter.py
python tools/aggregate_codex.py iteration-1 --repetitions 2
python tools/render_review.py <installed-anthropic-skill-creator>
```

These commands validate and render existing capture; they do not replay native
agent jobs. Replaying jobs requires a fresh Codex agent per `worker-instructions.md`
and per exact prompt with the recorded revision/entrypoints. No external API
credentials are required by the deterministic replay:

1. Create a separate workspace with `snapshots/pack-amber` and
   `snapshots/pack-cobalt` from `git archive` at the two revisions.
2. Supply the repository's matching installed dependencies to each snapshot.
3. Run `node tools/deterministic.mjs <absolute-benchmark-workspace>`.

NOT RUN: Claude CLI trigger optimization; the historical credentialed-provider
ten-scenario live matrix; a no-skill baseline; comprehensive testing of all 25
skills; fresh target-project implementation; social publishing; cross-session
voice persistence; full composite/native-cleanup and golden builds. The earlier
760/760 core result remains historical evidence at the candidate revision, not
a new run in this benchmark continuation.
