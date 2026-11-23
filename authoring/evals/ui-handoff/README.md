# UI handoff verification benchmark

These checks exercise the authoring repository, using synthetic data and
comparisons. The baseline is main at
`8e4f4c8d8dffdc8b858deec4f7183feac8b46ffe`.

- `node authoring/evals/ui-handoff/benchmark.mjs` evaluates 18 comparisons,
  each with green click evidence in the click-only control. The control
  would report readiness in 15 scenarios with missing, stale, ambiguous or
  mismatched visual evidence. The current gate matches all 18 expected
  results. Timing runs 500 batches after warmup, with no elapsed-time gate.
- With existing `SDCOREJS_PLAYWRIGHT_MODULE` and `SDCOREJS_CHROMIUM_PATH`,
  run `node authoring/evals/ui-handoff/browser.mjs <new-output-directory>`.
  Chromium 155.0.8059.79 clicked through four routed fixture variants. All
  clicks succeeded. At the same 960 CSS px usable content width, three
  correct comparisons passed and three layout deviations were blocked.
  This includes expansion icon alignment and chat row hover and selected
  backgrounds. The runner intercepts fixture requests and writes screenshots
  and comparison records to the selected directory.
- Under the same browser configuration,
  `node test/e2e/design-visual-browser.mjs <new-output-directory>` passed
  1,001 assertions on the existing visual library.

For token counts, install `js-tiktoken@1.0.21` in an isolated directory
outside the repository. Run from the repository root:

```sh
node authoring/evals/ui-handoff/token-budget.mjs <baseline-sha> <preserved-pre-split-directory> <isolated-tokenizer-prefix>
```

The script identifies each payload file by SHA-256 and sums its exact
`o200k_base` text tokens. The modeled Codex loads include the entry skill
and the directly selected references. The pre-split snapshot contains the
same UI feature with implementation and verification guidance inside the
larger design handoff reference.

| Modeled load | Main before feature | Feature before split | Feature after split | Saved versus unsplit |
| --- | ---: | ---: | ---: | ---: |
| Bootstrap input set | 4,318 | 4,318 | 4,318 | 0 |
| Angular implementation | 5,617 | 9,195 | 6,339 | 2,856 |
| Test verification | 4,324 | 8,463 | 5,626 | 2,837 |
| Ship verification | 10,093 | 14,285 | 11,448 | 2,837 |
| Durable Design authorship | 8,364 | 9,021 | 9,059 | -38 |

Implementation and verification load the compact UI fidelity reference.
Durable Design authorship can need both references. These counts cover source
texts in the declared input sets. They exclude message framing, tool results,
user project data, outputs, caching and billable provider usage. The fixture
results do not measure agent compliance, live tracker use or a consumer app.
