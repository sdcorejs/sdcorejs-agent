---
artifact_id: execution-simplify-contract-hardening-20260922
artifact_kind: execution-doc
change_ref: simplify-contract-hardening-20260922
source_spec: .sdcorejs/specs/workflow/2026-09-22-12-43-simplify-contract-hardening.md
source_plan: .sdcorejs/plans/workflow/2026-09-22-22-14-simplify-contract-hardening-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
---

# Simplify contract hardening delivery

The approved simplify implementation and the separately approved metric amendment
are present in the working tree. No scope approval remains pending. The latest
complete focused recheck is **PASS, 191/191**, using `--test-concurrency=1`
with the same seven test files, unchanged source, no skips and unchanged safety
checks. The earlier exact planned command with default scheduling remains
**FAIL, 190/191 PASS**, with one Git snapshot-observation failure; its isolated
rerun passed 1/1. The sequential pass does not rewrite that earlier result.
The raw authoring suite still has **3 PASS / 3 FAIL** from the existing HTTPS
`.git` identity defect, previously reproduced on pristine main. Repository
readiness remains **BLOCKED**; no passing convergence receipt or Git handoff is
claimed. The cause of the intermittent Git observation failure is unconfirmed.

No commit, push, dependency installation, destructive Git rollback, Design work,
or immutable approved-artifact migration was performed. Main and last-fetched
origin/main remain at `ac820d70bd247a04f977aab9bbb864f6a054acb7`.

## Approved metric amendment

The user approved the pending two-cell amendment in this task. New immutable
plan `.sdcorejs/plans/workflow/2026-09-22-22-14-simplify-contract-hardening-r2.md`
supersedes revision 1, adding only `VALIDATION.md` to TASK-005 and the allowlist.
Its approval hash is
`sha256:v1:fea2266ebd079fefcaa6fb04c012f0aedd56b9f27c167a477beb380d3457850d`.
The original spec, architecture and plan bytes/hashes are preserved.

`npm run report:communication-economy` recomputed 662,531 just-in-time bytes
and 712,490 total bytes. Exactly those current-value cells were updated;
baseline cells remain 514,603 and 577,334. The previously failing metric
assertion now passes in the full focused run. Graph, decision coverage,
goal-backward, validation map, execution preparation and write authorization
were verified before the amendment. All other scope and safety constraints
remain in force.

## Reproduction and controls

The original existing simplify suites passed 18/18. New permanent regression
tests run against the unchanged helper then produced the expected RED result:
24 tests, 18 failed, 6 passed. This distinguished enforcement gaps from checks
that were already working; an audit assertion was not treated as proof.

| Scenario | Original checkout | Hardened contract evidence |
|---|---|---|
| Empty scope with a write; changed path outside declared scope or approved step | Reproduced acceptance of invalid input | Rejected by trusted authority intersection and actual delta inspection |
| Generated/protected writes omitted from the payload | Reproduced missing enforcement | Whole-root observation detects omitted, ignored and untracked output |
| Traversal, absolute paths, different real Git root and symlink/junction containment | Reproduced missing path/root enforcement; real filesystem cases added | Strict path/root checks and actual Windows junction regression pass |
| Both verification commands missing, empty or blank | Reproduced false positive | No host-selected runnable oracle means no Apply authority |
| Same HEAD, different working-tree bytes | Reproduced stale evidence acceptance | Snapshot/content-bound command receipts and consumers reject drift |
| Analyze declares no edits while actual source changed | Reproduced false read-only claim | Actual snapshot comparison rejects the write |
| Documented lowercase failed pass, pass number beyond cap, reset repair-depth claim | Reproduced missing enforcement | Host-owned sequential history, exact rollback and repair terminal state |
| Before-only preflight and the documented v1 payload | Reproduced phase/schema mismatch | Documented v2 payload is parsed by fixtures; before-only preflight is supported |
| Uppercase failed pass without rollback; more than two declared entries | Already blocked | Retained and strengthened with observed rollback and host history |
| Declared Analyze write, declared generated/protected surface, owner mismatch, recursion depth two | Already blocked | Retained with real evidence and consumer integration |

During final review, a new regression reproduced replay of a completed pass
clearing a later failed pass: the pre-fix result was `verified` instead of
`blocked`. Completed authority is now single-use for postflight. The regression
passes and asserts that neither history nor the pending repair boundary can be
rewritten by replay.

A later bounded audit reproduced a failed-pass accounting defect: 22 actual
hunks were rejected by the cap, but the failed ledger entry recorded zero.
Observation now precedes scope/cap rejection, so rollback retains the observed
attempt and cannot refund that cap. Incomplete snapshot or hunk observation
blocks further Apply even after exact rollback. Three permanent regressions
cover retained over-cap hunks, binary hunk mapping and an unobservable symlink
snapshot. The initial repro failed with `0 !== 22`; all three new regressions
pass after the fix.

Additional passing cases cover command-induced source writes with exit code
zero, staged/add/delete/rename writes, dirty user ownership, adjacent user hunks,
line-coordinate drift after an earlier pass, counterfeit sessions, foreign
snapshot references, old before-receipt reuse after rollback, actual hunk caps,
five files per pass, eight total files and stale downstream identities.

## Contract and compatibility changes

- `simplify_context` v2 in `_refs/simplify/verification.md` is canonical. Tests
  parse its actual YAML template, bind real fixture identities/receipts, call
  the helper and exercise test/review/repair/ship/portable consumers.
- Preflight checks authority, owner/root, eligible source/hunks, protected
  boundaries and real baseline evidence. It requires no after-edit receipt.
  Postflight checks actual repository changes, preservation and rerun evidence;
  it grants no further write authority.
- Actual writes must fit user scope, the verified approved plan step when
  present, eligible source/hunks and the selected current-diff boundary. The
  trusted plan loader parses the verified approved body. Scope expansions
  return to their authority owner; a declared expansion is not permission.
- The host owns snapshots, private receipt provenance, pass reservations and
  history. Caps remain 2 passes, 5 files/pass, 8 total files and 20 actual hunks.
  Failed passes consume their number. Rollback must restore the exact checkpoint
  and run fresh verification; the failed attempt remains in history.
- Canonical artifact hashing and the existing repair evidence resolver are
  reused through a small shared extraction. Command receipts bind nonempty
  argv, real cwd/root, owner, exit/result, scope, HEAD, content fingerprint,
  timing, event order and output digest. Git index identity uses staged entries,
  excluding refreshable stat-cache bytes from semantic freshness.
- Both historical v1 shapes have explicit diagnostic/read-only adaptation.
  Their original payload is retained; neither old evidence nor legacy `limited`
  status authorizes edits or becomes verified. V2 removes limited-write override.
  Missing behavior/preservation oracle defaults to Analyze-only.
- After a write, affected evidence is stale until rerun. Review and ship require
  current simplify and owner-source identity; test may consume stale input only
  for revalidation. Repair retains the context and terminates simplify. Portable
  transport validates the full schema without serializing authority.

PASS means focused checks executed successfully on the inspected bytes. It is
not a proof of general semantic equivalence. A production host must provide
truthful source classification, preservation applicability, command discovery,
approval resolution and exclusive edit ownership. This helper is not an OS
filesystem sandbox. Serialized contexts cannot restore a trusted session.

Observation includes ignored content and fails closed on unsupported/symlink
entries, binary hunk mappings, inventories over 100,000 entries or 128 MiB,
unproven ownership, and file creation/deletion/rename/mode boundaries. Large
repositories and a restarted host require an appropriate trusted integration;
the helper does not silently exclude inputs or reconstruct lost history.

## Changed files

24 canonical/test files were changed or added; the approved amendment also changes exactly two current-value cells in `VALIDATION.md`:

| Group | Paths |
|---|---|
| Simplify contract | `_refs/simplify/simplify-contract.mjs`, `_refs/simplify/repository-evidence.mjs` (new), `_refs/simplify/scope-and-invariants.md`, `_refs/simplify/verification.md`, `skills/shared/workflow/simplify.md` |
| Shared primitive and consumers | `_refs/shared/evidence-artifact.mjs` (new), `_refs/shared/review-contract.mjs`, `_refs/shared/ship-readiness-contract.mjs`, `_refs/orchestration/repair-contract.mjs`, `_refs/harness/communication-economy.mjs` |
| Workflow documentation | `skills/tracks/test/sdcorejs-test.md`, `skills/shared/workflow/review.md`, `skills/orchestration/repair-loop.md`, `skills/shared/workflow/ship.md`, `_refs/orchestration/tail/repair-loop.md`, `_refs/shared/finish-gate.md` |
| Tests | `test/e2e/simplify-protected-contract.test.mjs`, `test/e2e/simplify-skill-contract.test.mjs`, `test/e2e/communication-economy.test.mjs`, `test/e2e/review-contract.test.mjs`, `test/e2e/repair-contract.test.mjs`, `test/e2e/ship-readiness-contract.test.mjs`, `test/e2e/test-track-contract.test.mjs`, `test/e2e/support/simplify-contract-fixture.mjs` (new) |

`npm run sync:skills` generated the 48 corresponding mirror changes under
`.claude`, `plugin` and `codex`; mirrors were not hand-edited. The approved
plan contains the exact mirror allowlist. The draft and approved workflow
artifacts plus this delivery record are change-scoped artifacts. Temporary raw
diagnostics remain outside the repository and are local-only.

## Actual commands and results

Runtime: Node 24.19.0 and npm 10.9.2, selected through process-local PATH;
configured Git remote remains `https://github.com/sdcorejs/sdcorejs-agent.git`.

The exact planned focused command (default scheduling) is:

```text
node --test test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/communication-economy.test.mjs test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
```

| Command/check | Observed result |
|---|---|
| Complete focused recheck with `--test-concurrency=1`, same seven files | **PASS**: 191/191, zero failed or skipped; 471,321.6313 ms; scheduler option only, no timeout or safety changes |
| Exact planned focused command after metric amendment, default scheduling | **FAIL**: 191 tests, 190 PASS, 1 FAIL, zero skipped; 1477105.2775 ms. Sole failure: shifted user-owned line-coordinate case could not capture `git rev-parse`; the first Apply observation failed before its main assertions |
| `node --test --test-name-pattern 'a later pass cannot reuse shifted user-owned line coordinates' test/e2e/simplify-protected-contract.test.mjs` | **PASS**: 1/1, 21027.5847 ms, unchanged source; does not erase the failed full run |
| `npm run report:communication-economy` | **PASS**: 662,531 and 712,490 recomputed before the exact two-cell edit |
| `npm run sync:skills` | **PASS** in the implementation phase; no canonical/mirror source changed in this amendment |
| `npm run check:skills` | **PASS** after revision 2: all mirrors and manifests agree |
| `npm run check:executable-references` | **PASS** after revision 2: 10 classified files |
| `node authoring/evals/run-deterministic.mjs` | **PASS** after revision 2: deterministic contract/mutation checks, zero provider calls |
| `npm run test:e2e:skill-authoring` | **FAIL** again: 3/6, 13,665.1579 ms. Existing HTTPS `.git` repository-identity normalization defect |
| Same authoring command with a process-only equivalent origin URL without `.git` | Historical diagnostic **PASS** 6/6; not a claim that the raw command passes; persistent remote unchanged |
| Approved graph, `prepareExecution`, decision coverage, goal-backward, `assertValidationMap`, exact path authorization | **PASS** on revision 2 before editing |
| Final hygiene, exact-scope/artifact-closure and `git diff --check` | **PASS**: 1,306 hygiene files; complete eight-artifact closure; no outside-scope changes, staged files, manifest changes, scan findings or test-input drift. Read-only checks are repeated after recording this result |
| Final repository readiness / convergence handoff | **BLOCKED**: the exact planned default-scheduling command and raw authoring command retain observed failures; protected main and intentional dirty worktree are not a Git handoff |
| Full aggregate `npm test`, product/golden/container/live-agent/provider checks | **NOT RUN**: outside this focused step; no live E2E or semantic-equivalence claim |
| Root lint/typecheck/build | **NOT RUN**: no such root scripts; unrelated site build not selected |

## Verification identity and retained history

The exact planned default-scheduling command started at `2026-09-22T15:16:44.085Z` and
finished at `2026-09-22T15:41:22.003Z`, exit code 1. Its local harness hashed
1591 tracked/untracked repository files before and after; no file changed
during the run. The delivery report is updated afterwards and receives separate
read-only hygiene checks. Final test-input comparison excludes only workflow
artifacts and does not treat a report edit as a new test execution.

- Input fingerprint: `sha256:449f613afea054bba73726410f4376f0e698a373ecb2e3eb4a194c482c2fffce`.
- Output digest: `sha256:950e3f59db3b569146d6885eb636ee95e1ca291d7a453cd11dec0822174f6646`.
- Current raw evidence: `simplify-r2-focused.txt`, `simplify-r2-before.json`,
  `simplify-r2-observation.json`, `simplify-r2-shifted-hunks.txt`,
  `simplify-r2-communication-report.json`, `simplify-r2-mirrors.txt`,
  `simplify-r2-references.txt`, `simplify-r2-deterministic.txt`,
  `simplify-r2-authoring.txt` and `simplify-r2-final-gates.json`.

Historical raw failures remain retained locally: original regression RED was
24 tests with 18 FAIL / 6 PASS; original existing simplify tests were 18/18 PASS.
A later 187-case run had only stale metrics failing. The subsequent 188-case run
had metrics plus a file-cap positive-control failure; its isolated cap/replay
rerun passed 2/2. Another 188-case run had metrics plus two Git fixture-observation
failures before path assertions; the later 191-case run passed all runtime and
consumer cases with only metrics failing. New failed-hunk accounting reproduced
`0 !== 22` before the fix; its three targeted regressions then passed 3/3.
None of these historical failures is rewritten as a pass. Raw logs include
`simplify-permanent-red.txt`, `simplify-replay-red.txt`,
`simplify-acceptance-final.txt`, `simplify-continuation-focused.txt`,
`simplify-failed-cap-red.txt`, `simplify-failed-cap-green.txt`,
`simplify-ledger-focused.txt`, `simplify-authoring-tests.txt` and
`simplify-authoring-normalized-origin.txt`.

## Complete sequential verification

The additional read-only recheck ran exactly:

```text
node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/communication-economy.test.mjs test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs
```

It started at `2026-09-22T15:51:41.957Z` and finished at
`2026-09-22T15:59:34.124Z`, exit code 0. All 191 tests passed, with no
skips. The before/after inventory contains 1591 files and no changed files.
No implementation, tests, timeout, safety guard, approval artifact or dependency
was changed to obtain this result. The observation does not establish that
concurrency caused the earlier Git failure, and does not establish universally
stable Git execution or semantic equivalence.

- Input fingerprint: `sha256:abdf89d75ba8453bed6224a6266a92729bdd863ecceca5a206f3bd90548e40f3`.
- Output digest: `sha256:01b40a2403090ed1dae26175224c49f09576fd47764fc50c2665abe659448096`.
- Local evidence: `simplify-serial-before.json`,
  `simplify-serial-observation.json` and `simplify-serial-focused.txt`.

The immutable validation map still names the exact default-scheduling command.
No receipt relabels the sequential command as that command, and repository
convergence/Git readiness is not promoted. The bounded hardening requirements
and result-reporting work are complete; the pre-existing authoring failure is
outside the approved repair scope.

## Acceptance mapping and remaining limits

| Approved AC | Evidence and limitation |
|---|---|
| AC-001: reproduce current behavior | Original RED and already-working controls retained |
| AC-002: canonical schema and compatibility | Document-driven fixture, v1 read-only adapter and transport tests pass |
| AC-003: preflight/postflight separation | Before-only authority and actual after-edit evidence tests pass |
| AC-004: path/root containment | Unsafe path, real root, nested root and junction tests pass |
| AC-005: actual writes and user-owned hunks | All actual scope, hidden-write and shifted-coordinate cases pass in the complete sequential run; default-run observation failure retained |
| AC-006: commands and content freshness | Blank/mutating command, same-HEAD drift and private provenance tests pass |
| AC-007: Analyze read-only | Undeclared actual source write is rejected |
| AC-008: rollback, caps and recursion | History, failed-hunk accounting, unknown observation, cap and terminal-repair tests pass |
| AC-009: no behavior oracle | Analyze-only and legacy limited evidence cannot authorize writes/readiness |
| AC-010: downstream invalidation | Documented payload through helper/consumers, stale identity and no simplify after repair pass |
| AC-011: immutable approvals and mirrors | Original approvals unchanged; 48 mirrors generated by script and checked |
| AC-012: run checks and report actual outcomes | Commands executed and PASS/FAIL/NOT RUN disclosed; complete sequential 191/191 PASS, default-command FAIL and existing authoring FAIL remain distinct; repository readiness is not claimed |

The unrelated authoring bug is in
`authoring/evals/skill-authoring-contract.mjs` (`currentRepositoryId`): SSH
normalization strips `.git`, while HTTPS normalization retains it, conflicting
with canonical fixture ownership. That helper and immutable approval fixtures
were not changed to force a pass. The Git observation failure remains an explicit
verification limitation; timeout/containment/ownership checks were not loosened.
The work stops at simplify hardening and the approved metric amendment.
