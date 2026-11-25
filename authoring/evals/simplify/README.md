# Simplify consumer trials

Copy `consumer/` and `decisions/` to separate disposable project roots. Install the release preview at project scope as described in the [implementation handoff](../../../.sdcorejs/handoffs/workflow/2026-11-24-simplify-implementation-handoff.md). Keep both acceptance scripts outside the trial. Use a fresh session for the read-only and writing prompts. Collect the installed skill paths, reads before the first production edit when observable, changed files, and the consumer's own test results.

| Case | Prompt for the consumer |
| --- | --- |
| A | Add an optional order code to the invoice CSV importer. Follow existing billing behavior for a present field and preserve the original result for an absent field. Update the importer and its tests. |
| B, E | Review the two rounding functions and the two handlers. Determine whether either pair should share an implementation. Cite concrete caller behavior and a distinguishing input. This is a read-only review. |
| C | Let reconciliation accept trimmed, case-insensitive filters for lowercase stored statuses. Preserve existing exact matches and keep the public status matcher compatible. |
| D | Provide a JSON adapter at `adapters/json.mjs`, exporting `JsonReader` with the existing reader API. Verify its resource lifecycle on valid and invalid JSON. |
| F | Assess whether refund computation would be clearer after a local refactor. First characterize its existing boundaries through the public function. Capture a run against the original source. Keep the source if it is already clear. |
| Q&A | Explain what a refund request below the amount paid returns. |

Run these from the pack root with the two completed project paths:

```sh
node authoring/evals/simplify/consumer-acceptance.mjs "$invoice_project"
node authoring/evals/simplify/decision-acceptance.mjs "$decisions_project"
```

Review the consumer diff as well. For A, trace the importer to billing's domain parser. For C and D, inspect the owner of filter normalization and the inherited reader lifecycle. For B and E, compare the original project files to the read-only trial. For F, retain the consumer's characterization tests and verify that they passed on the untouched refund source before considering edits.

Challenge the consumer's own tests in separate disposable copies. For A, return the unnormalized order code after parsing, then separately swallow an invalid-code error. For F, remove the paid-amount cap. For D, drop the close on error. For each mutation rerun the consumer suite and verify that the corresponding test fails while the original happy cases pass. Record violated assertions. Discard the copies after verification.

Evaluate delivery and decisions separately. Start with an ordinary prompt that
does not name the skill. In a bare install, inspect the actual coding request
for the rule in the catalog. For a plugin or managed project, check the rule
in the injected or project instructions. A host inventory alone only proves
discovery. A skill tool call is optional when the rule is already in context.

For application, inspect the reads before the first production edit, the
candidate implementation, its callers and tests, and the resulting diff. Run
the external acceptance checks in both the skill and baseline projects. If
both choose the same implementation, report that outcome. Use a fresh read-only
question to check that the guidance does not start a write or refactor.

## Three-arm native E2E

Run on Linux with working unprivileged Bubblewrap namespaces and support for
`--tmp-overlay`, Git, Node, a
Chromium installation at `/usr/bin/chromium` and an actual local
OpenAI-compatible inference server. Build the preview from a clean commit that
includes all generated resources. Run the comparator from that same immutable
checkout so its fixtures, guest, and hidden checks stay bound throughout the run.
Set the following paths before launching.

| Setting | Input |
|---|---|
| `SIMPLIFY_OPENCODE_BIN` | Native OpenCode binary at the exact manifest version |
| `SIMPLIFY_PONYTAIL_ROOT` | Clean upstream Ponytail Git checkout at the manifest revision |
| `SIMPLIFY_PREVIEW` | Fresh preview directory created by `node scripts/release.mjs build --preview --tag 1.0.0-preview.1 --out ...`, including the tarball and release manifest |
| `SIMPLIFY_HOST_DEPENDENCIES` | OpenCode host dependency directory with the pinned plugin, lockfile and .gitignore for native offline runs |
| `SIMPLIFY_PLAYWRIGHT` | Installed `playwright-core` package directory for case I |
| `SIMPLIFY_MODEL_URL` | Local HTTP inference origin, default `http://127.0.0.1:19481` |
| `SIMPLIFY_MODEL_SHA256` | SHA-256 of the loaded model weights for provenance |

```sh
node authoring/evals/simplify/compare-agents.mjs \
  --manifest authoring/evals/simplify/comparison-cases.json \
  --arms baseline,simplify,ponytail --repetitions 3 --output "$RUN_DIR"
```

Use `--cases A --repetitions 1` and a separate directory for the pilot.
The runner unpacks and installs the verified npm artifact. Releases with a
native OpenCode installer use its project layout and generated instructions.
Older releases use the installed Codex project layout that OpenCode discovers.
Each trial gets a
fresh project, profile and network namespace. The runtime holds the checkout
and hidden checks outside the agent's writable project. A loopback relay
forwards real inference to the pinned endpoint. Delivery markers record what
reached the first tools-enabled coding request. The relay assigns the same
deterministic seed to the three configurations of a case and repetition.
Agent tests and Git diff collection run on disposable overlays. Synthetic hidden
checks see the submitted project through a separate read-only mount. The stderr, agent events, diff, answer, test logs and
receipt remain in each trial directory. For synthetic A, C, D and F,
`requested-tests` records a changed test file plus a nonempty project suite.
The reviewer assesses the specific new assertions. Runtime output belongs outside Git.

Give only shuffled `blind-review.jsonl` cards to the independent reviewer.
Judge each answer and observable code decision against the case and its tests.
Record `[{ "blindId": "...", "pass": true, "reason": "..." }]` for completed
trials and regenerate results with `node authoring/evals/simplify/comparison-report.mjs
"$RUN_DIR" reviews.json`. Unreviewed judgments stay pending. Coverage, host
errors and timeouts remain visible in the denominators. OpenCode step totals
cover coding steps and omit its separate session-title requests. They report
uncached input, output and cache usage separately. The local server may reuse
identical prompt prefixes across fresh sessions. A matched pass or fail on
both arms is a tie. Skill delivery has its own measure. For the documentation
case, validate the README examples against the real formatter. For the refund
case, use the recorded writes, shell exit status and timing to check that the
new tests ran on the original source. Use a new output directory when the candidate, provider
or comparison protocol changes.

## Connected GitHub projects

`github/cases.json` pins the public repository commits, model and case prompts.
The comparison covers a public numeric-string API, an asynchronous cache
presence check, and a read-only question about legacy formatting. Each arm
starts from a fresh Git archive. Each Simplify arm exposes its installed target
skill and the packaged sibling `_refs`, including the dedicated contract. The
runner uses the actual native OpenCode configuration when the installer supplies
one. It retains existing project instructions and settings. A package predating
that installer runs in Codex-layout compatibility mode. The run and receipts
identify the installation used. The other arms use the bare host and the pinned
upstream Ponytail plugin.

Prepare clean clones under `$REPOS/utils` and `$REPOS/link-insight`. Use the
commits in the manifest, install with `npm ci`, build the utilities distribution
for the read-only exercise, and prepare WXT types for Link Insight. Provide an
OpenCode host dependency directory with the pinned `@opencode-ai/plugin`,
its npm lockfile, and a .gitignore. Create empty `node_modules/.vite` and
`node_modules/.vite-temp` mount points in each dependency installation. Set
`SIMPLIFY_NPM_LIB` to the npm directory containing `bin/npm-cli.js`. Keep all
credentials outside the guest.

```sh
export SIMPLIFY_NPM_LIB=/absolute/path/to/npm
export SIMPLIFY_HOST_DEPENDENCIES=/absolute/path/to/opencode-host-deps
node authoring/evals/simplify/github/compare.mjs \
  --repos "$REPOS" --before "$OLD_PREVIEW" --after "$NEW_PREVIEW" \
  --output "$NEW_RUN_DIR" --repetitions 2
```

Use the same OpenCode and Ponytail paths as the synthetic comparison.
`SIMPLIFY_MODEL_URL` must point to a loopback HTTP port. Its operator supplies
the pinned model through a local server or an explicitly authorized provider.
The guest sees only that inference service. Each installed release supplies its
own expected catalog description. Receipts separately record the first coding
request's catalog match, automatic catalog rule, and exact full instruction
text. The native treatment requires its configured full instruction text on that
request. Compatibility mode requires its own catalog entry. A legacy Simplify catalog can therefore earn behavioral credit. Existing
runs retain their original installations, scoring protocol and denominators.

Before any agent runs, the verifier executes the pinned Vitest suite once per
repository and saves its JSON report and the original passing assertion
identities. Each identity includes the project-relative file, full suite
hierarchy and test title. The pinned utils time-zone suite formats one
`new Date()` input into its title. Only that case's generated timestamp is
normalized. Its original spelling remains in the raw reporter output.

Run the repository's test command and the trusted Vitest CLI on the candidate.
Require every original passing identity, including duplicates. When an original
test file changed, also run the frozen original test files against the submitted
implementation. A requested test earns credit when a new identity in a changed
test file passes on the candidate and that assertion fails when its test file
runs against the pinned original implementation. A collection failure supplies
no red assertion. The blind reviewer checks the assertion's relevance.

Every verifier gets a new Bubblewrap overlay. Held-out files and runner config
enter as read-only mounts after the agent exits. The verifier requires every
manifest-listed hidden assertion to pass in its designated file. It runs the
project typecheck and compiles the held-out cases with the pinned compiler and
configuration. Candidate
symlinks and special files fail integrity before verifier injection. The finite
case also builds and packs the submitted utility, exercises the public ESM and
CommonJS exports and declarations from a fresh consumer, and looks for newly
authored public documentation. The blinded reviewer assesses its accuracy.
Use the randomized card IDs alongside the receipts and individual check logs.
