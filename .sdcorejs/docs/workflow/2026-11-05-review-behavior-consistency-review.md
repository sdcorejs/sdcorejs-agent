---
artifact_id: review-behavior-consistency-review-20261105
artifact_kind: execution-doc
change_ref: review-behavior-consistency-20261104
source_spec: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
source_plan: .sdcorejs/plans/workflow/2026-11-05-review-behavior-consistency-r2.md
source_architecture: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
commit_policy: with-change
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
redaction_applied: true
---

# Skill-creator review and repairs

The user requested independent review, repair of findings and a PR targeting main.
All identified source findings are repaired and the independent re-review found
no remaining actionable findings. The user explicitly approved the concrete
validation-map amendment. Relevant regression checks and validation/convergence
now pass with the separate reruns and evidence limits recorded below. The Git
handoff uses a final read-only branch check after this record is complete.

The original approved spec, architecture, plan and historical execution report
remain unchanged. The superseding-plan proposal is
`2026-11-05-review-behavior-consistency-repair-plan.md` in this directory.

## Findings and evidence

| Finding | Repair | Observed verification |
|---|---|---|
| F01: lexical authorization/pageSize text forced harmless edits into full workflow | Confirmed text-only and visible-page changes can remain bounded; explicit risky surfaces still escalate | Paired routing cases pass |
| F02: a finding could borrow another repository's assessment | Finding repository must match assessment owner | Cross-owner mutation rejected |
| F03: not-applicable category could supply a finding's evidence | Require a checked category and fresh valid source locator | N/A and stale/missing locator mutations rejected |
| F04: 1001 was treated as a universal boundary | Derive effective N and prove N-1/N/N+1, including configured and server-enforced limits | Actual output IDs tested at 73 and 2000, including clamp |
| F05: BOM immediately before managed AGENTS block prevented resync | Recognize only a leading BOM boundary and preserve bytes | Actual filesystem resync is unchanged and byte-identical |
| F06: Windows write-handle close changed ctime after cleanup receipt creation | Close newly created writer/recovery write handle, reopen through pinned parent, verify identity/other state/hash, retain read handle through source removal | Closed-state equality, release, tamper denial and recovery restoration pass |
| Coverage gap: inherited/global protection control missing | Add executable inherited-detail and public-exemption pair plus fresh RB-017/018 reviews | Inherited route accepted; exemption bypass found |
| Native test watchdog expires during Windows helper startup | Set the final restore test's Windows watchdog to 120 seconds; retain 20 seconds elsewhere | Original 20-second cancellation reproduced; targeted rerun PASS 1/1 in 68 seconds |
| Windows Python clock cannot observe a sub-millisecond traversal budget | Use `time.perf_counter` consistently for elapsed-time readings | Existing storage suite PASS 6/6, including 21 Python checks; independent review found no actionable issue |

Three focused regression tests failed before their corresponding source repair,
then the combined 36-test selection passed. The Windows issue was independently
reproduced by a native probe: ctime changed at final write-handle close while all
other recorded fields remained identical. The first new regression-test attempt
also exposed an incorrect fingerprint in the test setup; that setup failure is
not counted as behavioral RED evidence. After correcting it, the native regression
passed with real file operations and retained the tamper-denial assertion.

Independent review used fresh source-only contexts. A separate audit confirmed
the repaired code, failure paths, frozen inputs, capture digests and adjudication.

## Fresh reviewer evidence

Actual outputs and host capture are under
`authoring/evals/review-behavior/{transcripts,records}/`. The two final reviewers
received frozen skill/reference copies, original prompts and source, without
tests, oracles, history or author conclusions. They wrote only the explicitly
authorized isolated result file. The host compared each tool-reported output
digest with an independent file read, rechecked every frozen input and compared
the candidate manifests to source at capture time.

After capture, final regression required a cleanup-only clock repair. Both frozen
pack manifests now differ only at `skills/_refs/cleanup/storage_inventory.py`.
The independent reviewer verified that neither evaluator loaded cleanup refs and
that all scenario sources and loaded review instructions are unchanged. The 18
outcomes therefore remain applicable to those review surfaces; they are not a
new run against the current full-pack hash. Historical captures are unchanged,
and the helper delta has its own passing tests and independent source review.

All 18 cases were adjudicated separately: nine defect-bearing cases found their
required cause; eight no-defect controls received no defect finding; the
source-injection case preserved authority while providing advisory naming feedback.
No required cause was missed or forbidden claim observed in this scoped dataset.
One duplicate-submit question is explicitly **Needs verification**, not a proven
defect or accepted product-repair instruction.

These are synthetic source reviews, not production or rendered-UI evidence.
Exact serving model variants were unavailable and remain unknown; only the GPT-6
family was exposed. No baseline-versus-candidate performance improvement or
general accuracy rate is claimed. Structural capture validation and deterministic
fixture tests are reported separately from actual reviewer judgments.

## Current checks

Repository verification used existing supported Node 24.19.0, Git Bash and
Python 3.12 in child processes. The isolated source reviewers reported Node
22.14.0 for their read-only report/contract imports; no repository test execution
is attributed to that runtime. No tool installation, dependency/lockfile/engine change, global skill
installation or consumer-project mutation was performed.

| Check | Observed result |
|---|---|
| `npm run test:e2e:conventions` | PASS 40/40 |
| `npm run test:e2e:review-behavior` | PASS 18/18 |
| `npm run test:e2e:harness` | PASS 113/113 on final rerun |
| `npm run test:e2e:project-bootstrap` | PASS 10/10 |
| `npm run eval:review:offline` | PASS 18 scenarios; 12 tests, explicitly no model execution |
| `npm run check:skills` | PASS; 24 public skills and generated mirrors |
| `npm run check:executable-references` | PASS; Bash syntax and in-memory Python compilation included |
| `node authoring/evals/run-deterministic.mjs` | PASS 10/10, no provider calls |
| skill-creator `quick_validate.py` | PASS for all five changed Codex skill packages |
| Text hygiene | PASS, 1559 files |
| Summary v2 | Fresh; no refresh needed after these repairs |
| Dirty diff inspection | No conflict markers or unexpected binaries; two secret-pattern hits are unchanged synthetic security-test fixtures |
| Broad repository selection, concurrency 4 | 717 tests: 716 passed, one stale-metrics failure |
| Stale-metrics repair | Real metrics table updated; focused test and the full 113-test harness rerun pass |
| Initial cleanup suite, concurrency 2 | Interrupted after 76 observed passing cases; no exit code or full-suite pass claimed |
| Cleanup continuation using exact completed-name exclusions | 83 runner entries: 59 pass, 3 storage failures, 21 platform skips; zero cancellations |
| Final storage regression | PASS 6/6, including all 21 bundled Python checks, with canonical child TEMP/TMP and the clock repair |

The continuation executes every cleanup package file while excluding only exact
case names already observed passing. Its pass count includes one file-level
container for the fully completed contract file. The 21 skips are POSIX-native
cases unsupported on this Windows host. The three storage failures are closed by
the current full storage rerun; none is hidden or reclassified as passing in the
earlier raw log. No source assertion is skipped. Native helper bytes are unchanged
between the original run and continuation; the engine test differs only by the
documented watchdog and explanatory comment. The later clock repair affects only
storage inventory and its mirrors.

Canonical TEMP/TMP are selected only for the storage child process because the
host environment uses a Windows 8.3 alias. Python 3.12's observed monotonic clock
resolution is 15.625 ms; the high-resolution performance counter fixes actual
budget measurement without changing the tests. The new helper path and generated
mirrors are a bounded repair under the user's explicit findings-fix request,
recorded in the repair note separately from the immutable r2 inventory.

The broad repository command is not represented as an all-green rerun. Its only
failure was the metrics row read before the update; the current full harness
rerun covers that repaired check. Safety assertions, acceptance thresholds and
historical evidence were not weakened. A Windows-only test-runner watchdog was
increased from 20 to 120 seconds after a reproduced cancellation during native
helper startup; it does not relax any restore-state assertion. Bootstrap remains 19719 semantic bytes against the unchanged
19723 limit; current aggregate JIT/communication metrics are 686534/736506 bytes.

Local raw command receipts and logs are in the OS temporary directory
`sdcorejs-review-20261105-final`. The earlier blocked delivery report is retained
as historical evidence. Current readiness must use this repair report and final
gate outputs, not reinterpret the earlier failures as passing.

## Handoff status

The approved plan r2 corrects the missing AC-006 invariant link and replaces the
AC-025 manual placeholder with the authorized host-run independent reviewer and
separate adjudication procedure. Its snapshot passes goal-backward and validation-map
checks. The user approved it with “Duyệt hiệu chỉnh và tiếp tục tạo PR”; the
superseding r2 snapshot has hash
`sha256:v1:b2ec6288ec1051d8b4dc7551a7919948750e2c7214b327c10e6afb9166fa634a`.
Validation evidence is ready, convergence is CONVERGED, artifact closure is
complete, and the verified convergence handoff is ACCEPTED with no blockers.
The final read-only branch receipt binds every included file, including this
report; commit-tree equivalence is checked again before push and PR creation.

Root lint, typecheck and build scripts do not exist; skill/mirror and executable
reference checks provide the applicable static checks. Framework golden suites
and the site build are outside this change's affected paths and were not rerun.
