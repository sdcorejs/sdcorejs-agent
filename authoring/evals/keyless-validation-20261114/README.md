# Keyless validation follow-up — 2026-11-14

Additional checks completed without provider credentials or paid model calls.
The overall result is **PARTIAL**: framework and portable checks passed, while
Angular browser execution is blocked by the host Chromium sandbox configuration.
Canonical sources, generated skill mirrors and existing evidence were not changed.

| Check | Observed result | Elapsed time |
| --- | --- | --- |
| Portable cleanup, handoffs, POSIX contracts and read-only storage | 48/48 assertions passed; no skips | 4.3 s |
| Angular, NestJS and Next.js framework contracts | 32/32 assertions passed; no skips | 3.1 s |
| Generated NestJS projects | Simple and enterprise profiles built and passed their unit, integration and API behavioral suites; 2/2 outer assertions passed | 95.7 s |
| Generated Next.js projects | Basic, i18n and contact profiles typechecked, tested and built; boundary checks also passed; 2/2 outer assertions passed | 156.4 s |
| Postgres and Keycloak containers | Postgres accepted connections; Keycloak admin authentication and imported realm lookup passed; 1/1 assertion passed | 185.4 s |
| Generated Angular project | Dependency installation, typecheck, template validation, build and separately executed policy lint passed; browser tests did not execute | 109.2 s initial suite; 67.3 s diagnostic reproduction |
| NVIDIA input preparation | 20/20 strict validations; 80 offline generated contexts verified across 10 skills and 40 unchanged pilot cases | Recorded per command in preparation receipts |

Counts describe repository assertions, not the number of assertions inside
generated projects. Some contract checks overlap earlier core verification;
these counts must not be added to the prior 869-test result as new coverage.
Times include dependency downloads and concurrent work. They are execution
receipts, not repeatable performance benchmarks or model-quality scores.

## Angular diagnosis

The original golden suite exited 1 at its five-versus-six command-count
assertion. A diagnostic invocation of the same runner preserved step output and
confirmed that `npm test` could build its test bundle but could not launch
ChromeHeadless. Chromium reported a misconfigured SUID sandbox helper and a
crashpad database-path error. The helper was observed as
`4755 nobody /usr/lib/chromium/chrome-sandbox`.

The browser failure occurred before test assertions ran. This remains an
environment blocker; no passing Angular browser result is claimed. The remaining
`npm run lint` command was executed separately against the same generated fixture
and passed. The isolated fixture was removed after its file hashes and diagnostic
output were retained. No browser security settings were changed.

## NVIDIA preparation

SkillEvaluator 0.9.0 validated both original and portable datasets. All 26
preparation subprocesses exited 0. Each paired baseline/with-skill context used
identical fixtures; baseline contexts contained no skill/ref payload, and
with-skill contexts contained the required reference closure. The previous
27,900-file input tree remained byte-for-byte unchanged.

This preparation binds the current working tree, including the recent onboarding
changes. Four cases per skill remain a pilot; dedicated onboarding cases were
not added. Portable reference routing is an adapted audit artifact. Neither
schema validation nor offline context staging proves skill activation, live
behavior, model scores or publication readiness. Existing Tier 1 findings and
coverage limits are not superseded by these results.

[Full preparation receipt](/workspace/work/sdcorejs-keyless-validation-20261114/nvidia-inputs/PREPARATION-RECEIPT.md)
contains exact commands and links to all input, staging and preservation records.

## Remaining checks

- Tier 2/3 judge, embedding and live model trials remain **NOT RUN**, pending the
  user's deferred OpenAI API configuration. No credential was requested or read.
- Angular browser tests require a supported Chromium sandbox environment.
- Native cleanup mutation/integration tests remain **NOT RUN** here: both
  `/workspace` and `/tmp` are overlayfs; the tests require a trusted ext4/APFS
  fixture parent. The 48 passing checks above cover only the portable/read-only
  subset.
- The separate opt-in Docker/Playwright target-app smoke was not run. Next.js
  builds and NestJS API tests do not establish browser E2E coverage. Container
  readiness does not establish a generated application's full database/identity
  integration.

## Evidence binding

- [Commands and results](commands.json): exact argument arrays, exits, timestamps,
  parsed reporter counts and raw-log hashes. The early runner used a TAP-only
  parser; this consolidated receipt correctly parses the actual Node spec output
  without rewriting raw receipts or rerunning passing checks.
- [Source manifest](source-manifest.json): 551 source, test, script and package
  files verified unchanged before and after the runs.
- [Environment and diagnosis](environment-and-diagnosis.json): Angular step
  outcomes, generated fixture hashes and cleanup evidence. Owned Compose
  containers, networks and volumes were verified absent after the test.
- [NVIDIA preparation](nvidia-preparation.json): source binding, limitations and
  hashes of the full work-directory receipts; 414 source files were reverified.
- [Earlier onboarding evidence](../existing-project-onboarding-20261114/README.md):
  prior core, deterministic, independent audit and actual runtime fixture results.

Raw logs and temporary authoring tools remain under
`/workspace/work/sdcorejs-keyless-validation-20261114/`. This follow-up adds evidence
only and does not replace earlier reports or certify the whole pack as passed.
