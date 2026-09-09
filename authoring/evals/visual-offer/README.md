# Visual offer evaluation

This is an extension of the repository's CLI and behavioral harness, not a new
public skill or a replacement for the existing authoring matrix.

Run offline validation without provider calls:

```text
node scripts/eval-visual-offer.mjs
node --test test/e2e/visual-offer-policy.test.mjs test/e2e/visual-offer-behavior.test.mjs
```

For authorized live evaluation, snapshot canonical `skills/` and `_refs/` at
the baseline revision into a temporary directory before editing. Capture the
baseline with the same fixture and CLI defaults as the candidate. Use
`node scripts/eval-visual-offer.mjs --help` for the exact invocation flags.
`--live` requires a source root, exact Git revision and a new output file.
The output includes all canonical source hashes, fixture hash, actual user and
assistant turns, provider usage when supplied, runtime metadata and failure
receipts. Do not change source during capture. Do not overwrite a prior run.

The CLI receives natural-language user turns. Expected outcomes and semantic
flags remain evaluator-only. It carries only actual prior assistant responses
into subsequent invocations; no canned assistant turn is permitted. Failed
invocations remain NOT RUN. No-repeat scoring requires a semantically confirmed
prior offer; otherwise leave that opportunity unreviewed. The driver still sends
the user's valid decline and never truncates a dialogue from keyword detection.
`runScenario` can continue a captured completed prefix via `prior_turns`; preserve
the original attempt and prefix verbatim when completing an interrupted study.
The default invocation is ephemeral and read-only; it never
opens browsers or starts a companion server. Capabilities are explicitly
simulated for this controlled dialogue test, so this does not prove actual
visual surfaces or target-project execution.

Review each captured response and relevant tool event against its scenario.
Populate `adjudication` only for a completed actual turn, with `reviewer`,
`rationale` and boolean metric fields applicable to that turn:
`correct_offer`, `missed_offer`, `false_offer`, `duplicate_offer`,
`redundant_preview_question`, `preview_missing`, `fallback_failure`, `approval_violation`.
For an expected offer, judge both correct and missed; they are complementary.
For negative/clarification controls, judge false offer. For requested previews,
also score whether a preview was actually produced; absence is a failure
even if no redundant question appeared. Heuristic observations only locate
review candidates and never count as a pass.

Use `--review` to validate and summarize a record; add `--compare` for the
other record. Compare only the same scenario fixture, CLI/runtime defaults,
timeout and capability conditions. Report the number of eligible opportunities,
the number reviewed, failures and rates among reviewed opportunities. Null
rates mean no reviewed evidence, not zero failures. Unrun turns stay visible in
denominators. Neither missing model/effort metadata nor a small sample supports
a broad reliability claim. Do not label unreviewed output GREEN.

Keep raw logs and temporary sources local. Durable records must be sanitized;
never include credentials, authenticated URLs or local runtime tokens. A run
that cannot execute has an exact NOT RUN reason, no invented assistant text
and null provider usage. Deterministic adapter fixtures in tests are explicitly
synthetic and are never live evidence.

The CLI capture follows the [official non-interactive guidance](https://developers.openai.com/codex/noninteractive)
and the installed CLI's `exec --help`. No model/effort override is selected by
the runner. Record exposed provider metadata before making claims about model
equivalence beyond inherited defaults.

Capture root `AGENTS.md` and `package.json` hashes with the source snapshot;
the runner's recursive manifest covers canonical skills and references only.
Replay uses a fresh ephemeral invocation with the full actual conversation
history, not a resumed provider session. Ambient CLI configuration is inherited;
record this limitation and avoid attributing a result to unreported model settings.
