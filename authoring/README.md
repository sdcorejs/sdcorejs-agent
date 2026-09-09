# Internal Skill Authoring

`authoring/` is the internal-only authoring surface for the `sdcorejs-agent`
skill pack. It is outside `skills/**` and must not be installed in target
projects, copied to public mirrors, listed in public harness manifests, or
shown in the site skill catalog.

Contents:

- `skills/sdcorejs-skill-authoring/` - the internal workflow initialized with
  the canonical skill-creator tool;
- `evals/skill-authoring-contract.mjs` - repository-derived inventory/routing,
  typed approval, lifecycle, telemetry, and live-matrix validators;
- `evals/scenarios.json` - the ten required deterministic behavioral cases;
- `evals/run-deterministic.mjs` - prompt routing plus cross-contract mutation
  scenarios;
- `evals/records/` - linked, sanitized RED/GREEN/REFACTOR evidence with a
  resolvable base revision and repository-bound source, contract, behavior,
  and transcript manifests;
- `evals/snapshots/` and `evals/transcripts/` - immutable inputs bound by those
  lifecycle records;
- `evals/live-agent-matrix.json` - machine-validatable live coverage status.

Run deterministic authoring evidence with:

```text
node authoring/evals/run-deterministic.mjs
npm run test:e2e:skill-authoring
```

These commands do not call a credentialed provider or read ambient
credentials. Live A/B evaluation is separate and may run only after explicit
authorization. An unavailable or unauthorized live layer remains `NOT RUN`
with an exact reason; it is never reported as passing.

For shared UI/UX authoring changes, also run `npm run test:e2e:uiux`.
This extends the existing prompt-routing harness with topic/surface retrieval,
exact-version Core UI resolution, finding evidence mutations and semantic-owner
closure checks. It is included in `test:e2e:repository`. Scenario coverage and
sanitized baseline/RED/GREEN/REFACTOR evidence live under `authoring/evals/uiux/`.
These records describe source/contract evaluation, not fresh target-project or
visual execution. The original new-skill ceiling lifecycle and ten-scenario live
matrix stay unchanged; their schema cannot truthfully represent this zero-new-skill
reference change. Do not fabricate a new-skill proposal to fit those records.

The new-skill gate reads canonical `skills/**` and routing evidence itself.
Caller-supplied counts, arbitrary routing strings, empty proposals, or boolean
approvals fail closed; approvals resolve through the canonical approved-artifact
contract at the current repository revision. Distribution checks recurse through every public
surface, compare content to the internal skill even after renaming, and inspect
package/lockfile dependency names for provider SDKs. Authorized live evidence
resolves approval and transcript hashes and derives its aggregate status and
token total from target/revision-bound provider run receipts for the complete
scenario set.

## Visual offer regression and dialogue evaluation

The bounded Visual Companion change uses existing shared-reference and
executable-helper surfaces, not a new public skill. Run
`npm run test:e2e:visual-offer` for semantic policy, state, consent, fallback
and runner-integrity regression; run `npm run eval:visual-offer` for offline
natural-language scenario validation. These make zero provider calls.

[Visual offer evals](evals/visual-offer/README.md) documents explicitly authorized
CLI A/B capture against immutable source snapshots, actual multi-turn transcripts,
manual semantic review, denominators and NOT RUN handling. Simulated capability
fixtures and deterministic tests never prove natural-language recognition or a
real visual surface. Keep these records separate from the existing ten-scenario
skill-authoring live matrix.
