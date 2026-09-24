---
artifact_id: execution-ui-review-contract-20260923
artifact_kind: execution-doc
change_ref: ui-review-contract-20260923
source_spec: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
source_plan: .sdcorejs/plans/workflow/2026-09-23-17-45-ui-review-contract.md
commit_policy: with-change
owner: sdcorejs-execute-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
---

# Design and implemented UI review contract delivery

The approved seven-task implementation is complete in the working tree on
codex/simplify-design-handoff. The public inventory remains 23 skills and no
review dimension was added. This is a scoped contract delivery, not a whole-branch
Git readiness claim. No staging, commit, push, dependency/browser installation,
product-repository edit or live/paid service was performed.

## Reproduced findings and existing controls

The current checkout was tested before implementation. The first regression
run reported 6 PASS / 4 FAIL. A separately labeled replay against unchanged
HEAD sources reproduces all four regression failures (0 PASS / 4 FAIL), with
probe content, nine source hashes and actual sanitized TAP output retained in
authoring/evals/uiux/ui-review-integration.json. The replay is not relabeled as
the original chronological run.

- Reproduced: a caller could claim rendered/interaction evidence without an
  observed capture/run; source text could claim rendered clipping proof;
  same-HEAD content drift was not bound; empty write declarations incorrectly
  proved read-only despite unobserved artifact persistence.
- Already guarded: aesthetic preferences could not become blockers; narrow
  dimensions could not expand; declared source writes were rejected; a changed
  revision produced stale-evidence findings. These controls remain in place.
- The old UI/UX current-record check initially failed because its historic
  source inventory was stale on this checkout. Both older evidence records were
  preserved byte-for-byte; a new content-bound integration record now owns
  current proof instead of rewriting history.

## Contract and integration

- Existing Review accepts design-artifact and implemented-ui-conformance through
  the documented schema-1 ui_review extension. Design creates/self-critiques;
  Review assesses independently when authorized; Test captures/executes; the
  executor or repair owner writes with existing authority. A different provider
  is unnecessary; unavailable reviewer separation remains an explicit limitation.
- Structure, assessment completion, independence, observed read-only behavior,
  conformance and source/rendered/interaction coverage are separate results.
  Completed or schema-valid does not mean blocker-free. Missing evidence creates
  a verification-gap finding rather than an invented product defect.
- The shared verifier reads real pinned spec/plan/baseline sources and verifies
  their owner, kind, revision, hash and change relationship. Missing Design
  permits scoped source review with UNAVAILABLE or authorized NOT APPLICABLE
  conformance. Candidate Design review does not require its own completed approval.
- Test receipts bind an authorized nonempty command, cwd/owner, exit code,
  screen/state/viewport, source/build manifest and output bytes. Mockups cannot
  satisfy real-product evidence. Relevant content edits stale proof at the same
  HEAD. Review itself never runs a command or persists an artifact.
- Angular, Next.js, generic execution, Test, validation, repair and Ship call the
  shared path. Preflight enforces applicable Design review without demanding
  future implementation capture. Postflight retains required gaps. Both purposes
  can be composed only through their original host observations, reverified on use.
- A current failing conformance assessment can enter the existing repair
  authority gate; it remains blocking for Ship. Aesthetic findings cannot
  auto-repair. Repair invalidates affected evidence and never restarts simplify.
- Direct consumers enforce the same ordinary review schema, read-only mode and
  durable UI finding validator as Review. The bypass regression was first FAIL
  and passed after repair. A separate positive/mutation case consumes the actual
  approved Design artifact rather than only the visual-contract fixture.
- The shared repository observer was mechanically extracted from simplify;
  its inventory, containment, fingerprint and safety limits remain unchanged.
  No simplify behavior refactor was performed.

## Compatibility and limits

Ordinary schema-1 reviews remain readable. Their read_only_declared field keeps
its old declaration meaning; read_only_proven now requires observations. New UI
extensions are closed/versioned and reject malformed, unknown or contradictory
payloads. Tests load the private documented payload before invoking helper and
real consumers. Conditional portable fields do not change the ordinary producer
schema. Legacy notes, captures and serialized PASS never gain verified authority.

Host UI receipts and observations are process-local. A portable handoff without
them must reacquire evidence; the implementation does not fabricate durable
receipts or promise cross-process restoration. The documentation image decoder
is reused for bytes only; old capture metadata alone cannot become a UI receipt.
Approved UI requirements use the canonical JSON requirements block; YAML-only
applicability without that projection blocks verification.

Existing evidence deferral/risk authority remains the owning workflow's concern.
This verifier never converts deferred or missing UI evidence into automated PASS.
Final implementation assessment used the execution context, not a new independent
reviewer. The separate architecture review occurred before approval; it is not
claimed as independent review of the final implementation.

## Actual verification

| Command | Result |
|---|---|
| node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs | PASS: 199 passed, 0 failed |
| node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/git-closure-contract.test.mjs | PASS: 134 passed, 0 failed |
| node --test --test-reporter=tap test/e2e/uiux-knowledge.test.mjs test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-skill-creator-regression.test.mjs test/e2e/review-contract.test.mjs | PASS: 71 passed, 0 failed; current source manifest verified before/after |
| npm run test:e2e:uiux | PASS: 27 passed, 0 failed |
| npm run test:e2e:skill-authoring | PASS: 7 passed, 0 failed |
| node authoring/evals/run-deterministic.mjs | PASS: 10 scenarios; zero provider calls |
| npm run report:communication-economy | PASS: current JIT 668,467 bytes; total 718,426 bytes; no invented tokens |
| npm run sync:skills | PASS: generated canonical mirrors through the existing script |
| npm run check:skills | PASS: 23 skills, refs and harness mirrors aligned |
| npm run check:text-hygiene | PASS |
| npm run check:executable-references | PASS |
| git diff --check | PASS |
| Approved validation map / delivery convergence / artifact closure | PASS: 16 AC; CONVERGED; complete artifact closure |

The first broad focused run was 191 PASS / 2 FAIL: conditional portable-field
parity and stale VALIDATION.md values. Both were corrected, then their targeted
checks passed 5/5. The final focused run above supersedes that failure. Intermediate
runs interrupted by long host timing gaps or wrapper timeouts are not passing
evidence. Their incomplete output was retained locally and not promoted.

NOT RUN: real browser/target UI rendering and interaction, live-agent/provider
A/B, paid services, full unrelated repository/golden/container suites, and whole-
branch branch-ready/Git operations. The popover, mobile table selection and
standalone responsive page use local synthetic fixtures and prove contract
behavior only; they are not real-product visual verification.

The final focused run completed with exit 0 and 35 directly changed code/test/config
inputs unchanged before and after execution. Current authoring evidence binds 96
inputs. Scoped convergence retains the approved validation map for validation and
uses an explicit RISK-001 alias for its named risk in the convergence projection.
The standalone source revision fills the evaluator's required portal_revision
compatibility slot; repository ownership remains standalone. No approved artifact
was migrated. The convergence fingerprint is sha256:v1:05c397ccd0f744c7e1fe89b7c7ba56eacb7278df816d3cae265f0a14c6c8e048.

## Changed files and closure

The implementation is bounded to 36 canonical/test/evidence paths, 87 generated
mirrors, two current-value cells in VALIDATION.md, and this delivery document.
The six planning/approval artifacts remain part of this change's artifact closure.
No file outside the approved scope changed; approved snapshots, older UI/UX
records and package/lockfile bytes are unchanged.

Canonical/test/evidence paths:

- _refs/shared/ui-review.md
- test/e2e/review-contract.test.mjs
- test/e2e/support/ui-review-fixture.mjs
- test/e2e/communication-economy.test.mjs
- _refs/shared/ui-review-contract.mjs
- _refs/shared/repository-observation.mjs
- _refs/simplify/repository-evidence.mjs
- _refs/shared/design-verification.mjs
- _refs/shared/review-contract.mjs
- _refs/shared/validation-map.mjs
- _refs/angular/execution-contract.mjs
- _refs/nextjs/execution-contract.mjs
- _refs/orchestration/execution-contract.mjs
- _refs/orchestration/repair-contract.mjs
- _refs/shared/ship-readiness-contract.mjs
- _refs/harness/communication-economy.mjs
- test/e2e/support/test-track-forward-harness.mjs
- skills/shared/workflow/review.md
- skills/tracks/design/sdcorejs-design.md
- skills/tracks/test/sdcorejs-test.md
- skills/tracks/angular/sdcorejs-angular.md
- skills/tracks/nextjs/sdcorejs-nextjs.md
- skills/shared/sdlc/03-plan.md
- skills/shared/sdlc/04-execute-plan.md
- skills/orchestration/repair-loop.md
- skills/shared/workflow/ship.md
- _refs/design/uiux/index.md
- _refs/shared/validation-map.md
- _refs/shared/test-ui-evidence.md
- _refs/shared/design-handoff.md
- _refs/shared/frontend-architecture.md
- _refs/angular/write-code/input-analysis.md
- _refs/orchestration/tail/repair-loop.md
- authoring/evals/uiux/evidence.test.mjs
- authoring/evals/uiux/README.md
- authoring/evals/uiux/ui-review-integration.json
- VALIDATION.md

Generated mirrors belong to .claude, plugin and codex/skills only and were
produced by sync:skills. Historical approvals and records were not bulk-migrated.
This delivery stops at the approved review integration step.
