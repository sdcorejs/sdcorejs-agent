---
artifact_id: review-behavior-consistency-repair-plan-20261105
artifact_kind: execution-doc
change_ref: review-behavior-consistency-20261104
source_spec: .sdcorejs/specs/workflow/2026-11-04-16-36-review-behavior-consistency.md
source_plan: .sdcorejs/plans/workflow/2026-11-04-17-06-review-behavior-consistency.md
commit_policy: with-change
owner: integration-owner
---

# Review repair and validation amendment

The user requested skill-creator review, repair of findings, and a PR targeting
main on 2026-11-05. This document records the bounded repair scope. The original
approved spec, architecture and plan remain immutable.

## Implemented repairs

1. Distinguish lexical risk candidates from inspected text-only and visible-page
   changes; retain escalation for explicit authorization, public-contract and
   complete-data changes. Add paired routing regressions.
2. Bind risk findings to their own repository and a checked category with fresh
   source locators; reject borrowed or not-applicable evidence.
3. Derive paging tests from the effective bound N, including configured/server
   limits, instead of treating the 1000/1001 example as universal.
4. Preserve and recognize a UTF-8 BOM immediately before the managed AGENTS block.
5. Finalize Windows-created cleanup writer/recovery file state after closing its
   write handle, then recheck identity, content and other state through the pinned
   parent. Keep source removal behind verified recovery and retain tamper denial.

Repairs 1-4 stay in the original plan's canonical paths. Repair 5 adds only
`_refs/cleanup/safe-file-operation.ps1`, `test/e2e/cleanup-engine.test.mjs` and the
generator-owned mirrors. No dependency, engine, historical evidence or acceptance
assertion is changed. Previously authorized summary and measured metrics updates
remain in scope.

The AC-004 coverage audit also adds
`test/e2e/fixtures/review-behavior/protection-inheritance.mjs` and paired RB-017/018
scenarios. They distinguish effective inherited global/controller protection from
an overriding public exemption; they do not introduce a new product requirement.
Evidence writes are limited to the two actual outputs under
`authoring/evals/review-behavior/transcripts/`, the host capture and adjudication
under `authoring/evals/review-behavior/records/`, this amendment, a superseding
plan snapshot, and a final change execution report. Local raw logs stay temporary.

## Proposed validation-map correction

- Link AC-006 (screen-archetype controls) to INV-007 (compatibility, accepted
  exceptions and requested dimensions). The omitted link prevented convergence
  despite the original plan already requiring those controls.
- Replace AC-025's manual, not-yet-authorized reviewer placeholder with the actual
  host-run independent evaluation procedure: `collaboration.spawn_agent` with a
  fresh context, frozen candidate skill and source-only request packet, followed
  by host capture and separate adjudication. Use `command_source: project-doc`,
  `automation: automated`, `evidence_class: LIVE_AGENT`. The integration agent
  adjudicates; it must not manufacture a user acknowledgement. Record the real
  prompt, tool call, model identity limits, input hashes, output and observed
  misses/false findings. Transcript validity alone never proves semantic success.
- Preserve deterministic test evidence as a separate layer. A failing live case
  or unresolved gap remains a failure; no threshold is reduced.

Approval of this concrete correction authorizes a superseding plan r2 and its
matching validation map. It does not approve direct merging or waive a failed
test, stale evidence, unresolved finding, or branch-ready check.

## Reviewable result

The actual 18-case capture and adjudication are available at
`authoring/evals/review-behavior/records/final-capture.json` and
`authoring/evals/review-behavior/records/final-adjudication.md`.
All required causes were found; the eight no-defect controls produced no defect
finding, and the source-injection case preserved instruction authority. One
duplicate-submit question remains explicitly unverified, not a confirmed defect.

The final native regression also reproduced a test-runner cancellation at the
existing 20-second watchdog, before the Windows helper sequence completed. A
bounded 120-second Windows-only watchdog now accommodates that setup/restore
sequence; other platforms retain 20 seconds. The source safety assertions and
product acceptance thresholds are unchanged. This is a same-file regression
repair within the approved cleanup-engine test scope, not a test skip.

## Bounded final regression repair

The user's explicit request to review and fix findings also covers the final
regression's elapsed-time defect in `_refs/cleanup/storage_inventory.py` and its
three generated mirrors. Six clock reads now use `time.perf_counter` because
Python 3.12 on Windows exposes 15.625 ms resolution for `time.monotonic`, which
cannot observe the existing sub-millisecond traversal-budget test. Requirements,
acceptance criteria, assertions and approved snapshots remain unchanged. This
additional repair is recorded separately from the immutable r2 path inventory.

The child test process uses canonical TEMP/TMP paths to avoid pre-existing 8.3
aliases; no machine setting is changed. All six storage tests, including the 21
bundled Python checks, pass after the repair. Independent source review found no
actionable issue. The earlier 18 review outcomes remain applicable to unchanged
review surfaces; their frozen full-pack digest predates this unrelated cleanup
helper repair and is not relabelled as the new candidate digest.
