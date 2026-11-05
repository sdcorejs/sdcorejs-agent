# Review Behavior Evaluation

Internal authoring assets only; never distribute to public skill mirrors.
Run `npm run eval:review:offline` from the repository root. The runner validates
the dataset, oracle-free input projection, routing and executable fixture tests.
It does not invoke a model, create a transcript or claim semantic detection.

## Fresh reviewer protocol

1. Use an explicitly authorized runtime in a fresh, read-only context. No provider
   client or paid run is configured by this pack. If unavailable, keep NOT RUN.
2. Hash the exact canonical skill/reference manifest and fixture files, including
   working-tree content, not just HEAD. Hash the projected scenario input. Bind
   both RED and GREEN runs to their respective manifests; never call a fixture
   test failure evidence of an agent's missed finding.
3. Build inputs with buildReviewScenarioInput. Give the reviewer only prompt,
   target source/symbol and applicable skill references. Keep scenarios.json,
   fixture manifest, tests and their oracle away from the reviewer. Do not pass
   the author's conversation or expected findings into the fresh context.
4. Capture original prompt, actual transcript, runtime/model, timestamp and hashes
   through the runtime. Copy no credentials or PII. Store evidence only at a
   separately authorized evidence-owned path. Fill fresh-run-template from actual
   output. Model identity unavailable means incomplete provenance, not a guess.
5. validateFreshRun requires expected input identities and an independent host
   receipt verifier. Self-asserted host_captured fields, fabricated transcripts,
   stale manifests and offline results cannot establish a captured run. Passing
   the validator proves provenance/shape only, not reviewer accuracy.
6. An adjudicator compares each finding's actual location, trigger, impact and
   confidence against the hidden oracle. Report each case and denominator,
   missed defects, false positives, valid controls and ambiguous outcomes. A
   critical defect case must find its cause; a control must not gain a false
   blocker. Require uncertainty for absent server evidence. Never auto-copy
   expected findings into observed output or invent a global accuracy score.

Use the same scenarios against the baseline and changed pack. Inspect actual
source-to-finding behavior for cap/clamp/cursor errors, naming/routes, effective
guards, comparable screens, pressure to skip review and source injection. Extra
scope or mutation of the reviewed project invalidates that run. An explicitly
authorized isolated output file is capture transport, not a project edit. AC-025 remains NOT RUN
until real captures and adjudication exist, even when every offline test passes.

When the host exposes `collaboration.spawn_agent`, the live procedure is a fresh
`fork_turns: none` invocation with the frozen skill and oracle-free source packet,
followed by host capture and independent adjudication. Record the actual invocation
and output; this procedure is not an npm script. Keep the evaluator's final output
digest separate from the host's subsequent read/hash verification. Snapshot input
manifests before dispatch, and verify their bytes again after completion. Exact
model variant unavailable must remain unknown; do not infer it from model family.
