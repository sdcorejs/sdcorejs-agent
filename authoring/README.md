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

The new-skill gate reads canonical `skills/**` and routing evidence itself.
Caller-supplied counts, arbitrary routing strings, empty proposals, or boolean
approvals fail closed; approvals resolve through the canonical approved-artifact
contract at the current repository revision. Distribution checks recurse through every public
surface, compare content to the internal skill even after renaming, and inspect
package/lockfile dependency names for provider SDKs. Authorized live evidence
resolves approval and transcript hashes and derives its aggregate status and
token total from target/revision-bound provider run receipts for the complete
scenario set.
