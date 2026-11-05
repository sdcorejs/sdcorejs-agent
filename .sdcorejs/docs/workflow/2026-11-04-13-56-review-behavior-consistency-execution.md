---
artifact_id: execution-review-behavior-consistency-20261104
artifact_kind: execution-doc
change_ref: review-behavior-consistency-20261104
contract_id: review-behavior-consistency-20261104
source_spec: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
source_plan: .sdcorejs/plans/workflow/2026-11-04-17-06-review-behavior-consistency.md
source_architecture: .sdcorejs/architecture/workflow/2026-11-04-16-58-review-behavior-consistency.md
source_revision: ee172c5bdd5e1a545e9f44d86be3067e50000000
track: workflow
stack_profile: markdown-skill-pack
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_module_id: null
commit_policy: with-change
redaction_applied: true
---

# Review behavior consistency: implementation and evidence

Implementation is available on `feat/review-behavior-consistency`. Delivery readiness is **BLOCKED**. The feature has deterministic evidence, while independent reviewer effectiveness remains unaccepted. No commit, push, publication, global skill installation or consumer-project update was performed.

## Approved scope and lineage

The approved spec, architecture and plan hashes were reverified without changing their bodies:

- Spec: `sha256:v1:e1ab2431fb79a6240072b06358fcbd8172973e802000857035cdec64d448dc82`.
- Architecture: `sha256:v1:297cdfdf30c497bc616243acface33d030fa5ede20dfb98f00451d81ead7d455`.
- Plan: `sha256:v1:678033ca29f9243b7c6445dd4673b0682e47187afbb6a438dd258fd0932290bb`.

The 66 planned operations include verification of the unchanged sync generator. Generated mirrors come only from that generator; the public skill inventory stays 24. The user explicitly added three paths after regression exposed their dependencies:

- `.sdcorejs/summary.md` and `authoring/evals/uiux/evidence.test.mjs`: “Cho phép bổ sung hai file”.
- Only the measured metrics table in `VALIDATION.md`: “Cho phép cập nhật bảng metrics”.

These are session-authorized amendments, not edits to the immutable plan. Historical UI/UX records and transcripts, dependencies, engines, lockfiles and cleanup sources are unchanged. The scope audit found no other changed source paths. Initial Git preparation backed up refs, removed 37 local branches, retained the stash/remotes and left one primary worktree before starting this feature.

## Delivered behavior

- Review instructions cover semantic collection/date naming, route boundaries and public aliases, effective inherited/global protection, list/detail/form behavior, hardcoded assumptions and data completeness.
- Risk assessment binds repository, revision, diff, dimensions, source locators, rule provenance, confidence and evidence gaps. A structurally valid finding is not evidence of semantic detection. Combined dimensions retain their union of mandatory categories; duplicate causes are linked to one primary finding.
- Executable fixtures cover 0/1/999/1000/1001 records, literal and configured caps, server clamps, stale or absent totals, cursor/page continuation, later failures, cancellation, repeated cursors and ordering. Controls include real domain bounds, visible paging, aggregation and explicitly partial previews.
- Real loopback HTTP checks exercise authentication, permission, owner and tenant denial. Mutations remove continuation or enforcement and are killed by output/HTTP assertions, not import failures or request-shape checks.
- Small changes retain a scoped baseline. One-line authorization, tenant, public-contract and completeness changes escalate; localized Q&A and read-only requests remain read-only.
- Explore owns opt-in managed AGENTS updates. Detailed conventions remain separate. The writer verifies authority, owner, path, content hash and cooperative writer ownership; it preserves outside bytes/BOM/newlines and refuses unsupported markers, nested repositories or unsafe paths. Unknown external-writer control returns a proposal. Post-rename verification failure is reported as a performed write and never rolls back over another editor.
- A 16-scenario offline dataset separates reviewer input from its adjudication oracle. Capture validation rejects self-asserted or stale evidence; semantic acceptance requires a separate real reviewer run and adjudication.

## Observed validation

Final checks use an already-installed Node **24.19.0**, compatible with the existing engine constraint. The default Node 22.14.0 is below that constraint; no installation or global configuration was changed. Commands were invoked through the existing npm CLI with the supported Node runtime and its directory prepended only to the child process PATH.

| Exact mapped command | Observed result | Output digest |
|---|---|---|
| `npm run test:e2e:conventions` | PASS 40/40 | `sha256:v1:0667bdd4bcc3564f5759a0f9bf742bd1433ab23dd5eb90a9bd13bdd9c83bb48b` |
| `npm run test:e2e:review-behavior` | PASS 15/15 | `sha256:v1:3ac48a4569f853203900c5d06ad1344533027786c30f3c8868fc3f5b669b908f` |
| `npm run test:e2e:harness` | PASS 112/112 | `sha256:v1:cc4411a08778b5f3c525e4d7507fb7fef7675d13f7010c61ba5d990b30972767` |
| `npm run test:e2e:project-bootstrap` | PASS 9/9 | `sha256:v1:bf9ff7d9ccfa8744eda31412fe28977f08ffac24963e01f037bd528b459600df` |
| `npm run check:skills` | PASS | `sha256:v1:3cb424e2a5887d3c8234a43d58175326391bda8cdbf0e68592c2e006b10cfcc1` |

Additional observations:

- Closing focused run: **52/52** across the six new suites, entrypoint/mirror tests and behavioral sentinels. Closing repaired-regression selection: **5/5** for communication contract, budget, metrics, summary and progressive disclosure.
- Historical port delivery regression: **2/2**, anchored to its original delivered revision. Mutations now read that same immutable baseline, so unrelated current changes cannot make a negative control pass for the wrong reason. Git blob caching retains exact immutable bytes.
- Offline review evaluation: **16 scenarios**, fixture exit 0, fresh reviewer **NOT RUN**. Existing deterministic authoring evaluation: **10/10**, no provider calls.
- Initial broad repository run under supported Node with concurrency 4: **711 tests, 704 passed, 7 failed**. Six failures were repaired and their focused checks passed. The remaining executable-reference failure requires Bash. The full 711-test command was not represented as a later all-green run.
- An additional broad harness attempt was interrupted after an entrypoint wording regression and a machine suspend; the repaired checks and final exact mapped run above supersede that attempt.
- The cleanup tail was interrupted after multiple failures. A focused reproduction at `test/e2e/cleanup-engine.test.mjs:205` independently failed: receipt status `partial`, expected `verified`. A separate temporary-fixture probe reported action `removed` with `WRITER_LOCK_BOUNDARY_CHANGED` and `MISSING_PATH`; this narrows the failure to the native writer-lock lifecycle. Cleanup source/tests are unchanged. Its root cause remains unresolved; this is not attributed to the new review feature or asserted to be an environment-only defect.
- Executable references cannot complete `bash -n` for six unchanged Next.js Bash examples because Bash is unavailable. No threshold, test skip or old evidence was weakened to obtain a pass.
- Final bootstrap budget: **19,719 semantic bytes <= 19,723**; UTF-8 bytes **19,968**. Review, Explore and execute-plan source skills remain within 500 lines. Metrics were recomputed from source, and summary v2 was validated fresh.

Meaningful RED/GREEN observations included missing risk coverage/policy enforcement before implementation, mutation failures on 1001-record completeness and HTTP denial, and the final combined-dimension regression (4 pass/1 fail before repair, 5/5 after repair). Later evidence-shape and secondary-link/order repairs retained the green focused suites.

## Acceptance boundaries

PASS below is limited to the named deterministic layer. It does not establish real-agent recall, false-positive rate, runtime instruction compliance or target-project correctness. Naming, route, inherited-guard and screen judgment have authored guidance and paired source scenarios; their semantic effectiveness is still unproven.

| AC | Approved case | Evidence boundary |
|---|---|---|
| AC-001 | case-convention-scope-authority | PASS: mapped deterministic fixture/contract layer |
| AC-002 | case-typed-naming-controls | PARTIAL: source guidance and scenario input only |
| AC-003 | case-route-boundary-compatibility | PARTIAL: source guidance and scenario input only |
| AC-004 | case-effective-guard-inheritance | PARTIAL: source guidance and scenario input only |
| AC-005 | case-server-permission-owner-tenant-denial | PASS: mapped deterministic fixture/contract layer |
| AC-006 | case-screen-archetype-controls | PARTIAL: source guidance and scenario input only |
| AC-007 | case-hardcode-config-assumption | PASS: mapped deterministic fixture/contract layer |
| AC-008 | case-paging-all-data-1001 | PASS: mapped deterministic fixture/contract layer |
| AC-009 | case-paging-boundary-server-clamp | PASS: mapped deterministic fixture/contract layer |
| AC-010 | case-paging-partial-error-cursor | PASS: mapped deterministic fixture/contract layer |
| AC-011 | case-paging-valid-controls | PASS: mapped deterministic fixture/contract layer |
| AC-012 | case-risk-test-current-assertions | PASS: mapped deterministic fixture/contract layer |
| AC-013 | case-behavioral-mutation-kills | PASS: mapped deterministic fixture/contract layer |
| AC-014 | case-implicit-fast-fix-baseline | PASS: mapped deterministic fixture/contract layer |
| AC-015 | case-one-line-risk-escalation | PASS: mapped deterministic fixture/contract layer |
| AC-016 | case-localized-routing-readonly-controls | PASS: mapped deterministic fixture/contract layer |
| AC-017 | case-bootstrap-standing-authority | PASS: mapped deterministic fixture/contract layer |
| AC-018 | case-bootstrap-no-authority-no-write | PASS: mapped deterministic fixture/contract layer |
| AC-019 | case-bootstrap-byte-preservation-race | PASS: mapped deterministic fixture/contract layer |
| AC-020 | case-bootstrap-nested-owner-version | PASS: mapped deterministic fixture/contract layer |
| AC-021 | case-finding-evidence-deduplication | PASS: mapped deterministic fixture/contract layer |
| AC-022 | case-assessment-gaps-not-pass | PASS: mapped deterministic fixture/contract layer |
| AC-023 | case-legacy-contract-compatibility | PASS: mapped deterministic fixture/contract layer |
| AC-024 | case-evidence-layer-integrity | PASS: mapped deterministic fixture/contract layer |
| AC-025 | case-fresh-reviewer-source-detection | NOT RUN: independent reviewer |
| AC-026 | case-distribution-inventory-integrity | PASS: mapped deterministic fixture/contract layer |

## Final gates and remaining work

The approved validation map and convergence evaluator were called with actual run receipts and explicit missing semantic evidence. Convergence receives reciprocal links derived through the approved AC rows and a one-to-one runtime mapping of the four risk labels to RISK-001 through RISK-004. The unchanged generator's VERIFY operation is excluded from the mutation trace. The approved artifacts remain unchanged. No passing convergence receipt was fabricated or sealed:

```json
{
  "validation": {
    "ready": false,
    "result": "FAIL",
    "blocker_codes": [
      "COMMANDS_SKIPPED",
      "EXECUTION_NOT_PASSED",
      "MANUAL_ACKNOWLEDGEMENT_REQUIRED",
      "TEST_EVIDENCE_BLOCKED",
      "TEST_STATUS_NOT_READY"
    ]
  },
  "convergence": {
    "status": "BLOCKED",
    "input_valid": true,
    "blocker_codes": [
      "AC_WITHOUT_PROVING_TEST",
      "MANUAL_OR_DEFERRED_EVIDENCE",
      "REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE",
      "UNRELATED_PASSING_TEST",
      "UNTRACED_TASK"
    ],
    "drift_codes": []
  }
}
```

Readiness remains blocked by independent reviewer evidence (AC-025 and the semantic cases), the missing Bash check and the existing cleanup failure. The convergence projection also exposes a planning gap: AC-006 has an empty invariant mapping in the approved validation map, while this evaluator requires a nonempty invariant link for a proving row. The approved snapshot was not silently changed; reconcile this mapping in an approved plan revision before claiming convergence. Resolve these and rerun affected verification before a merge/ship claim. A real reviewer evaluation must receive source and the original prompt without expected findings, then record misses, false findings, locators and runtime/model/input provenance.

The scoped source manifest is `sha256:v1:1de52e5e2fdf20b7129cbe3a27507f33a593b7ed677bdf1ea814d9aba5a84e98`, based on changed file bytes plus `ee172c5bdd5e1a545e9f44d86be3067e50000000`; this execution document is excluded to avoid a self-referential hash. Temporary local raw logs and evaluator input/output are under the OS temp directory `sdcorejs-review-20261104-verification`. Output digests above preserve the observed command identity even if temporary logs are later removed.

Final artifact closure, text hygiene and branch inspection run read-only after this document is written. Any later repository write invalidates that branch inspection and requires another final check. No Git artifact handoff is authorized by this record.
