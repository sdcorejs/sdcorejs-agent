---
artifact_id: execution-design-handoff-contract-20260923
artifact_kind: execution-doc
change_ref: design-handoff-contract-20260923
source_spec: .sdcorejs/specs/workflow/2026-09-23-10-30-design-handoff-contract.md
source_plan: .sdcorejs/plans/workflow/2026-09-23-12-30-design-handoff-contract-r2.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
source_revision: ac820d70bd247a04f977aab9bbb864f6a054acb7
---

# Design handoff contract delivery

The approved Design handoff implementation and the two subsequently approved
verification repairs are complete on branch `codex/simplify-design-handoff`.
The final focused Design command reports **121 PASS / 0 FAIL**; authoring reports
**7 PASS / 0 FAIL**, and UI/UX reports **27 PASS / 0 FAIL**. The current Design
validation map passes and its scoped convergence result is `CONVERGED`.
This is not a whole-branch Git readiness claim. No staging, commit, push or
next-step work was performed; final branch-ready remains NOT RUN.

The original six tasks were executed sequentially. The user's subsequent
approval authorized bounded R1/R2 repairs in five additional paths, recorded in
`.sdcorejs/plans/workflow/2026-09-23-12-30-design-handoff-contract-r2.md`
(`sha256:v1:d34fae6b35278ac11ba6d0d7a6bd7e205a8c91288cfade382dcd0abb838314e8`). The original plan and all other approved snapshots
remain unchanged. TASK-005 now has passing required checks; TASK-006 records
the current evidence and retains historical failures as historical observations.
No dependency or public skill was added; the public inventory remains 23 skills.
No simplify utility ran after repair, and no simplify/repair recursion occurred.

## Verified findings and controls

The original Design/path/lifecycle baseline passed 50 tests. The initial
read-only survey distinguished missing enforcement from already-working checks.
The permanent pre-fix regression command then produced **0 PASS / 3 FAIL** for
diagnostic traversal, a noncanonical wireframe extension, and the missing
explicit structural-only verification marker. Historical RED output is retained
as RED; it is not current passing evidence.

| Finding or control | Original observation | Current contract and regression |
|---|---|---|
| Standalone and component-library ownership | Rejected as unknown experience scope or forced toward portal ownership | Registry roles, repository ownership, positive/negative owner matrix |
| Spec/plan authenticity and change relationship | Structural validation accepted caller identities with zero parent reads; no verified entrypoint existed | Real files, canonical hash/graph verification, exact repository/kind/revision/change identity; missing/mutated/stale/foreign parents block |
| Schema versus Design approval | Missing review state and caller hashes were structurally accepted | Four separate verification layers; reviewed label and serialized PASS grant no authority |
| Responsive applicability | All three booleans could pass without rendered evidence; mobile-only applicability was rejected | Required surfaces come from approved requirements; valid NA reasons are allowed; required current render/interaction receipts cannot be omitted |
| Draft and material change | No implementation approval gate distinguished a draft | Draft is structurally valid but cannot authorize a frontend implementation; material changes return to the decision owner |
| Wireframe extension, spec depth, diagnostic traversal | Invalid canonical members accepted; diagnostic traversal returned as local-only | Strict raw paths, depth/extensions, actual root/containment and closure checks |
| Cross-module provenance | Two artifacts from the same module counted as cross-module; revision provenance absent | At least two distinct observed module sources and host-pinned verified child runtimes; no editable copies |
| Missing/unwritable module owner | Already blocked in the original ownership resolver | Preserved; no portal fallback |
| Generated mockup mislabeled as product screenshot | Already structurally rejected | Preserved and strengthened by actual receipt kind, capture provenance and application-source fingerprints |
| Complete declared feature closure | Existing positive closure already included documents, wireframe, export and ledger | Preserved; actual disk inventory additionally detects undeclared/missing assets |

Three further review regressions were reproduced and fixed within the same plan:

- A screenshot receipt hashing only the PNG incorrectly passed. The initial
  targeted run failed 1/1; after the fix it passed 1/1. Real-product receipts now
  cover approved application source paths as well as the PNG. Changing that
  source at the same HEAD makes evidence stale.
- An approved non-Design reason for owner A incorrectly authorized owner B in
  Next.js. The initial targeted run failed 1/1; the fixed run passed 1/1.
  Applicability waivers now verify the available/writable semantic owner and
  match the requested execution owner before returning NOT APPLICABLE.

A completion audit also reproduced rejection of the PNG for an additional
wireframe: the validator incorrectly bound every PNG to the primary source hash.
The initial focused regression failed 1/1. The fix accepts only an actual primary
or additional editable hash in the same handoff. Unknown hashes and stale
secondary bytes still fail; closure retains both sources, both exports, all
documents and the ledger. This regression and the expanded owner matrix, including
actual portal composition, passed 2/2 in their targeted run.

All three regressions are included in the final focused run. The Windows file
symlink branch reports **NOT RUN** because creation was denied by this host.
An actual directory-junction containment probe separately **PASS**ed by rejecting
an editable path redirected to another repository. It is not presented as a
successful file-symlink test.

## Contract and compatibility

- Schema 2 in `_refs/shared/design-handoff.md` is canonical. The fixture reads
  its JSON payload directly and fills real environment identities/hashes before
  passing it through the helper and Angular, Next.js and generic consumers.
- Ownership and experience use separate fields. Registry roles are reused;
  standalone and library no longer impersonate module/portal. Semantic owner,
  execution host and cross-repository integration ownership remain distinct.
- `validateDesignHandoff` remains pure structural validation and always returns
  `verified: false`. `createDesignHandoff` normalizes/hashes and does not approve.
  The explicit schema-1 adapter is read-only/unverified. Unknown schemas fail.
  Legacy data never becomes approved through normalization or transport.
- `createDesignVerificationRuntime` receives trusted host topology, actual
  artifact sources, independently selected expected approvals and pinned runner
  receipts. Serialized runtime/results are not authority. The verifier reuses
  existing approved-artifact graph/hash verification and evidence resolution.
- `verifyDesignHandoff` separates structural, approved-parent, Design approval,
  and required evidence checks. It reads actual repository files, enforces exact
  identity and containment, and rechecks observed fingerprints before success.
  A regex-compatible hash or unchanged HEAD is insufficient.
- `evaluateDesignExecution` is called by all three actual consumers. Missing or
  stale required Design evidence blocks production eligibility/write targets.
  Legacy profile-only resolution may remain `resolved`, but it is nonproduction
  with no write target; it is not an implementation approval.
- The Design producer's approved plan authorizes authoring. It does not require
  its future handoff before editing; the output is verified before frontend
  consumption. A non-Design waiver needs an actual approved reason bound to the
  same semantic owner. Missing applicability/verifier/source remains a blocker.
- Applicable responsive behavior and executed render/interaction checks are
  separate. Evidence binds nonempty command, cwd, owner, zero exit, scope and
  current content hashes. Real screenshots also require real-capture provenance
  and approved application-source scope. Test receipts are synthetic contract
  fixtures, not evidence that a real browser or application was rendered here.
- Existing-design-first, editable source before PNG, candidate-versus-confirmed
  component evidence, mockup classification, and Visual Companion feedback
  without approval authority remain explicit. A trusted bounded cosmetic review
  may attest exact current bytes within approved scope; it cannot change the
  material projection or rewrite immutable approval history.
- Full observed closure covers spec, flow, decisions, every editable source,
  exports, approved screenshot references and ledger. Cross-module references
  verify their actual module sources; a copied editable or missing provenance
  cannot silently become current. Schema 2 currently verifies contained local
  HTML/SVG editable sources; legacy remote editable formats are not promoted.
- No bulk history migration or immutable approval edit occurred. New material
  revisions require the owning workflow's new approval/change-scoped bundle.

PASS describes the focused checks on the observed bytes. It is not semantic
equivalence, a general UI-quality guarantee, an OS sandbox, or a live product
verification. Host topology, approval selection, receipt pinning, the parser and
bounded cosmetic reviewer must be trusted workflow services. A restarted host
must recreate that authority from its real sources.

## Changed files

These 20 canonical/source/test files are the approved Design change:

- `_refs/shared/design-handoff.md`
- `test/e2e/design-handoff-contract.test.mjs`
- `test/e2e/artifact-path-convention.test.mjs`
- `test/e2e/project-context-artifact-lifecycle.test.mjs`
- `test/e2e/angular-production-contract.test.mjs`
- `test/e2e/nextjs-production-contract.test.mjs`
- `test/e2e/production-readiness-contract.test.mjs`
- `test/e2e/support/design-handoff-fixture.mjs`
- `_refs/shared/design-handoff.mjs`
- `_refs/shared/artifact-paths.mjs`
- `_refs/shared/repository-contract.mjs`
- `_refs/shared/design-verification.mjs`
- `_refs/angular/execution-contract.mjs`
- `_refs/nextjs/execution-contract.mjs`
- `_refs/orchestration/execution-contract.mjs`
- `skills/tracks/design/sdcorejs-design.md`
- `skills/tracks/angular/sdcorejs-angular.md`
- `skills/tracks/nextjs/sdcorejs-nextjs.md`
- `skills/shared/sdlc/04-execute-plan.md`
- `_refs/shared/frontend-architecture.md`

The existing `npm run sync:skills` script generated exactly 39 corresponding
mirror changes: nine references in each of `.claude/_refs`, `plugin/_refs` and
`codex/skills/_refs`; four skills in each provider skill directory.
`VALIDATION.md` changes only the two approved current-value cells:
663,573 just-in-time bytes and 713,532 total bytes. Original baseline cells stay
514,603 and 577,334; all 361 required fields remain preserved.
The repair amendment additionally changes these five approved paths:

- `authoring/evals/skill-authoring-contract.mjs`
- `test/e2e/skill-authoring-contract.test.mjs`
- `authoring/evals/uiux/evidence.test.mjs`
- `authoring/evals/uiux/design-handoff-integration.json`
- `authoring/evals/uiux/README.md`

The only new approved workflow artifact is plan revision 2. This delivery record
was updated under the existing task authority.

The scope audit compares against the 1,545-file pre-Design baseline, including
the existing dirty simplify work. All **65** changed source/mirror/validation
paths are approved, with zero outside-scope changes. A separate pre-repair
snapshot proves only the five newly authorized paths changed during repair,
plus the new plan and this delivery record. Historical authoring/UIUX records,
snapshots and transcripts remain byte-for-byte unchanged. The source fingerprint
excludes workflow records, which receive separate lifecycle checks.
All seven prior immutable approvals retain their hashes and verified graphs;
the eighth approved artifact is the new plan revision. HEAD remains
`ac820d70bd247a04f977aab9bbb864f6a054acb7`, and the index remains unstaged.
The earlier simplify commit request was not executed; this bounded Design step
does not waive its earlier Git verification requirements.

## Commands and actual results

All commands ran from the repository root with Node v24.19.0, npm
10.9.2 and git version 2.47.1.windows.1. No installation was performed.

| Command label | Actual result | Local raw log |
|---|---|---|
| focused | PASS; exit 0; 121 PASS / 0 FAIL / 0 skipped (121 tests) | design-repaired-focused.txt |
| artifact-paths | PASS; exit 0; 79 PASS / 0 FAIL / 0 skipped (79 tests) | design-acceptance-artifact-paths.txt |
| angular | PASS; exit 0; 4 PASS / 0 FAIL / 0 skipped (4 tests) | design-acceptance-angular.txt |
| nextjs | PASS; exit 0; 6 PASS / 0 FAIL / 0 skipped (6 tests) | design-acceptance-nextjs.txt |
| simplify | PASS; exit 0; 191 PASS / 0 FAIL / 0 skipped (191 tests) | design-acceptance-simplify.txt |
| authoring | PASS; exit 0; 7 PASS / 0 FAIL / 0 skipped (7 tests) | design-repair-authoring-final.txt |
| uiux | PASS; exit 0; 27 PASS / 0 FAIL / 0 skipped (27 tests) | design-repair-uiux-green.txt |
| deterministic | PASS; exit 0; PASS | design-repaired-deterministic.txt |
| mirrors | PASS; exit 0; PASS | design-repaired-check-skills.txt |
| hygiene | PASS; exit 0; PASS | design-repaired-check-text-hygiene.txt |
| references | PASS; exit 0; PASS | design-repaired-check-executable-references.txt |
| diff | PASS; exit 0; PASS | design-repaired-diff.txt |

Exact commands:

- focused: `node --test --test-concurrency=1 test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/product-ledger-contract.test.mjs test/e2e/git-closure-contract.test.mjs`
- artifact-paths: `npm run test:e2e:artifact-paths`
- angular: `npm run test:e2e:angular`
- nextjs: `npm run test:e2e:nextjs`
- simplify: `node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/communication-economy.test.mjs test/e2e/review-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs`
- authoring: `npm run test:e2e:skill-authoring`
- uiux: `npm run test:e2e:uiux`
- deterministic: `node authoring/evals/run-deterministic.mjs`
- mirrors: `npm run check:skills`
- hygiene: `npm run check:text-hygiene`
- references: `npm run check:executable-references`
- diff: `git diff --check`

Additional checks:

- `npm run sync:skills`: PASS; 23 public skills, generated mirrors only.
- `npm run report:communication-economy`: PASS; current metrics above.
- Approved-plan execution preparation/write authorization: PASS for all 66 allowed execution paths, including the five added repair paths.
- Eight immutable approval hashes/graphs and exact source/scope observation: PASS; the seven original approvals were preserved.
- Actual lifecycle closure for all eight Design workflow artifacts: PASS;
  no missing required paths, unknown paths, or sensitive-content blockers.
- Actual directory-junction containment probe: PASS; file symlink: NOT RUN.
- Final branch-ready handoff: NOT RUN; no Git artifact is being handed off in this step. Scoped Design convergence does not certify the combined simplify/Design branch for commit or PR.
- Full aggregate `npm test`, golden target apps, containers, live agent/provider,
  browser/Figma rendering and product screenshots: NOT RUN; outside this bounded
  contract step. Root lint/typecheck/build scripts do not exist; site build was
  not selected.
- No simplify utility, dependency update, task-repository staging, commit or push
  was run. Git commits inside disposable test repositories are fixture setup.

The raw artifact-paths/Angular/Next.js npm subsets above ran before the final
screenshot-scope, waiver-owner and additional-editable fixes. The final exact focused command reran
all their underlying tests on the final source. Their earlier stdout is retained
with its real timestamp; it is not relabeled as a newer invocation. The unchanged
simplify sources passed the separate 191-test preservation suite. Final mirror,
hygiene, reference and diff checks ran after source synchronization.

## Closed verification findings and compatibility

**R1 — repository identity:** The original authoring run had 3 PASS / 3 FAIL.
The new HTTPS regression reproduced the mismatch before the fix. Authoring now
uses the canonical `stableRepositoryId` helper. HTTPS with/without `.git`,
SCP-style SSH and URL-style SSH share one identity; foreign repositories remain
denied. The tests use child-only Git config overrides and do not change the real
remote. The final package script reports 7 PASS / 0 FAIL.

Repairing the helper made the historical REFACTOR contract hash stale, as it
should. An explicit `historical_revision` option validates that retained
contract against real Git bytes and returns `evidence_scope: historical` with
`current: false`. Existing calls keep the strict current-content behavior and
reject this old record as current evidence. The historical-positive and all
existing negative lifecycle/telemetry controls still execute. No old record,
approval or transcript was updated. The deterministic matrix separately binds
its fresh result to the current contract hash.

**R2 — UI/UX freshness:** The earlier run had 25 PASS / 1 FAIL because its old
final-source hashes were compared to the changed working tree. The historical
record is now pinned to its actual Git revision. A separate
`authoring/evals/uiux/design-handoff-integration.json` stores a new real
25-case TAP run, command, cwd, owner, exit code, timestamps, output digest and
63-file source manifest. The manifest was unchanged before/after the command.
The current evidence validator checks current content even at the same HEAD and
rejects missing evidence/sources, omitted paths, changed contents, altered output,
failed commands and false live/visual claims. The package script passes all 27
cases including the evidence controls. Historical records and output remain
unchanged. This is deterministic evidence only; live rendering/interaction,
providers and fresh target-project agent coverage remain NOT RUN.

The two original REQUIRED findings are closed by these actual results. Current
read-only review reports no outstanding finding in the approved scope. Validation
is PASS and Design convergence is `CONVERGED`, with no blockers. The runtime
projection derives reciprocal links from the approved validation map and maps
its two human-readable risk labels to the convergence schema's RISK-001/RISK-002.
The TASK-005 gate bundle EVIDENCE-017 remains supporting command evidence for
the approved AC-012 / EVIDENCE-012 identity; it is not relabeled as an unrelated
standalone passing test. Its actual command/output hashes remain attached.
It does not rewrite immutable decisions or promote historical evidence. The
earlier blocked review/convergence records remain in local diagnostic history.

## Current evidence identity and acceptance mapping

The final exact focused run started at `2026-09-23T07:20:57.990Z`, ended at
`2026-09-23T07:24:56.294Z`, and exited 0: 121 PASS, 0 FAIL, 0 skipped. The
file-symlink limitation is reported inside a passing test and remains NOT RUN
despite the runner's zero skip count. The real directory-junction probe passed.

- Source fingerprint (65 paths): `sha256:v1:6379e1073ffa537b918bec03453e1e4c1751dbe0796b195b44cefca4856b3ea4`.
- Focused stdout SHA-256: `0cd259a0b05cdff7888c071bbd092c3093599f2742c4333e112ec4b95f4165cb`.
- Config fingerprint: `sha256:v1:37845ed1a0fdf19d976fe961524ad2c70ac040d1639ab48baddc7c92c70e2675`.
- Environment fingerprint: `sha256:v1:5259aa2a36de41402be33051da25abf62d41d384b2645264840f826f7fa0fee7`.
- New UI/UX evidence: `authoring/evals/uiux/design-handoff-integration.json`.
- Local diagnostic records: `design-repaired-acceptance-results.json`,
  `design-repaired-source-observation.json`, `design-repaired-runtime-gates.json`,
  `design-repaired-test-evidence.json`, `design-repaired-scope-audit.json`,
  `design-repair-scope.json`, and `design-repaired-artifact-closure.json`.
- Historical failures remain in `design-repair-identity-red.txt`,
  `design-repair-uiux-red.txt`, `design-repair-skill-authoring-green.txt`
  (this intermediate attempt failed freshness), and earlier Design RED logs.
  They are not relabeled as passing current evidence.
- The first final Design rerun returned 120 PASS / 1 FAIL because `git commit`
  timed out while creating an isolated owner-matrix fixture, before its contract
  assertions. Its unchanged source fingerprint and actual failure remain in
  `design-repaired-focused-git-timeout-results.json` and
  `design-repaired-focused-git-timeout.txt`. The identical command was rerun
  without source or assertion changes; only that successful rerun is current.

| Approved criterion | Executed focused case |
|---|---|
| AC-001 ownership matrix | case-design-owner-matrix |
| AC-002 authentic approved parents | case-design-parent-authenticity |
| AC-003 verification layers | case-design-verification-layers |
| AC-004 responsive applicability | case-design-responsive-applicability |
| AC-005 draft/material lifecycle | case-design-draft-and-material-change |
| AC-006 source/image provenance | case-design-source-and-image-provenance |
| AC-007 paths/root containment | case-design-path-and-root-containment; file-symlink limit above |
| AC-008 distinct cross-module sources | case-design-cross-module-provenance |
| AC-009 complete artifact closure | case-design-artifact-closure |
| AC-010 actual consumer enforcement | case-design-real-consumer-enforcement in Angular, Next.js and generic |
| AC-011 schema compatibility | case-design-schema-compatibility |
| AC-012 scope/inventory and results | case-design-scope-inventory-contract; all required checks passing; NOT RUN limits disclosed above |

The planned api-e2e checks exercise exported repository APIs through documented
payloads and real fixture repositories. Their evidence class is UNIT, not an
HTTP service, rendered app or live-agent claim. Durable closure is checked
separately for the eight change-related Design workflow artifacts, including
this report; prior simplify artifacts are retained as unrelated to this change.
