Saved an advisory lesson in [normalization-category-null-input.md](../target/.sdcorejs/memories/node/normalization-category-null-input.md) and added a minimal AGENTS pointer.

`node --test test/category.test.mjs` passed: **3 tests, 0 failures**. The lesson records the inspected fix, its limits, and SHA-256 fingerprints for source, tests, diff, configuration, and observed proof output.

The actual Explore retrieval check selected it for a future normalization task and excluded unrelated requests. Fingerprint checks rejected simulated stale source/proof records. The older payment memory remained unchanged and unpromoted. Explore selection itself is advisory; future verification still requires checking fingerprints and rerunning the regression.

Application files, tests, and configuration were unchanged. No team-wide rules were created. Evidence: [regression output](category-regression.txt), [selection checks](retrieval-check.json), [scope check](scope-check.json), and [trace](trace.json).

