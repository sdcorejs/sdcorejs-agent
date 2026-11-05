# Skill-creator review repair evidence — 2026-11-05

New continuation from `97cc700ef7201a3074c57aedff89cbe131f9ee6f`. The user explicitly
requested fixes; original spec/plan and all prior audit/evaluation records remain
unchanged. See `.sdcorejs/docs/workflow/2026-11-05-skill-creator-followup.md` for
scope, disposition, authority, limitations and cloud-skill recommendations.

- `source-manifest.json`: exact changed source/test/mirror/table bytes after final
  execution. The packaging report and new evidence are checked separately.
- `runs-manifest.json`: SHA-256/byte index for retained evidence. Raw command logs
  are losslessly gzipped to preserve output without whitespace normalization.
- `runs/red.log.gz`: first two regression tests against unchanged source; 11 pass,
  2 expected RED. Later-added cases are not claimed as part of this baseline.
- `runs/focused.log.gz`: 42/42 intermediate focused tests.
- `runs/affected.log.gz`: 143 pass, two failures: source line budget and a stale
  provenance-option sentinel. Source was shortened and the exact sentinel was
  updated to include delegated authority, with real template/hash tests retained.
- `runs/affected-final.log.gz`: 145/145 intermediate affected-suite pass.
- `runs/repository-core.log.gz`: 759 pass, one stale current metrics-table failure.
  The table was recomputed; no threshold/validator was relaxed.
- `runs/repository-core-final.log.gz`: 760/760 before the last routing extension.
- `runs/repository-core-final-router.log.gz`: **final 760/760 PASS**, main Node
  component from `package.json`'s `test:e2e:repository` script, excluding its
  subsequent native-cleanup command. This is not a full `npm test` pass.
- `independent-review.md`: source-first independent action selections, helper
  probes, newly found routing regression and final repair rechecks. Includes exact
  prompts/results and source hashes; one reviewer, no A/B or live target claim.
- `authoring-matrix-final.json`: actual required ten-scenario deterministic run.
- `official-validation.json`: 25 actual Codex packages passed the unmodified
  OpenAI skill-creator validator at the recorded upstream revision.
- `communication-economy.json`: current source-bound projection, not token usage.
- Other `runs/` logs: scoped routing, generator/check, text and executable-reference
  checks. First executable-reference run explicitly reports Python NOT_RUN;
  subsequent existing-interpreter run compiles snippets in memory only.

Commands: `node --test` on audit workflow/contract/template and Content suites;
then the parallel, production-readiness, skill-pack-runner, mirror and authoring
suites; finally the exact main Node command from `test:e2e:repository`.
Also ran `node authoring/evals/run-deterministic.mjs`, `npm run sync:skills`,
`npm run check:skills`, `npm run check:text-hygiene`, and
`npm run check:executable-references` (then with an existing
`SDCOREJS_CLEANUP_PYTHON` for in-memory syntax checks).

NOT RUN here: full composite/native cleanup, golden builds, actual Windows/macOS,
live providers/trigger optimization, browser acceptance and publication. These
new results do not replace the prior task's narrower passing or failing evidence.

The precommit convergence attempt in `runs/convergence-precommit.log.gz` used an
invalid requirement-ID prefix in the runtime fixture and was rejected as
`INPUT_INVALID`. This is fixture setup evidence, not a product failure. The
corrected runtime gate is re-evaluated after final packaging/commits; no historic
receipt is presented as fresh acceptance for a later source identity.
