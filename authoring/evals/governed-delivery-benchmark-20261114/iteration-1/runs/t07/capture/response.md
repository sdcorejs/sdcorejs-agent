Saved a verified, advisory lesson for `normalizeCategory`:

- [Lesson](../target/.sdcorejs/memories/node/lesson-cdde84b34db031f0134fc96d2babf9ccb4f40290bc883b17bad0f164117827da.json)
- [Durable verification proof](../target/.sdcorejs/docs/general/2026-11-14-normalize-category-verification.md)

`node --test test/category.test.mjs` passed **3 tests**, exit **0**: null, undefined, and normal string trimming/lowercasing. The default `npm test` does not include this regression file.

The lesson explains why calling `trim()` before checking nullish input caused the failure and limits the resolution to this category boundary. It records the actual revision, source/test/diff/config SHA-256 values, and sanitized proof hash.

[Explore discovery](explore-discovery.json) found and selected the lesson for a new normalization change using repository `github.com/benchmark-sdcorejs/order-desk`, track `node`, boundary `category-normalization`, and path `src/category.mjs`.

[Selection checks](lesson-selection.json) confirmed:

| Evidence or scope | Result |
|---|---|
| Matching current source and proof | Selected, advisory only |
| Changed source, regression test, or proof bytes | Excluded as stale |
| Missing proof | Excluded as unknown |
| Current semantic conflict | Excluded as conflicting |
| Payment scope, another repository, or empty scope | Excluded as unrelated |
| Existing legacy payment memory | Excluded as unverified; unchanged |

Drift checks used isolated capture copies, including the supplied pre-fix source. Application files, tests, package scripts, AGENTS.md, and the older memory remain unchanged. No conventions were approved. Broader unrelated test suites were not run.

[Trace](trace.json) records exact commands, observed results, loaded references, changes, and limitations.

