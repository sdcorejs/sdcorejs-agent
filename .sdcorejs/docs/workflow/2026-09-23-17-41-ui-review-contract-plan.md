---
artifact_id: draft-plan-ui-review-contract-20260923-r1
artifact_kind: execution-doc
change_ref: ui-review-contract-20260923
source_spec: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
status: draft
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
repository_relative_path: .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-plan.md
source_revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
---

# Plan — Design and implemented UI review contract

Status: draft awaiting explicit plan approval. No implementation is authorized yet.

## Scope and execution

Implement the two existing-review purposes, truthful content-bound evidence and owner-scoped consumer enforcement from the approved spec and architecture. Preserve the 23 public skills, dimensions, prior simplify/Design behavior, immutable approvals and historical evidence. This is a workflow skill-pack change, not a product UI implementation.

- Approved spec: `.sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md`; `sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497`.
- Approved architecture: `.sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md`; `sha256:v1:e34f970eb82fada628bce8c7fdd655d3ac9511bb7b949d3727a76c65ba8fcb52`.
- Track/profile: workflow / markdown-skill-pack; target: sdcorejs-agent-authoring-repo.
- Execution: seven sequential tasks across four phases; TDD regression-first. No implementation delegation, commit/push, package/lockfile writes, dependency/browser installation or live/paid service.
- One owner and Git root: github.com/sdcorejs/sdcorejs-agent at C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent.

## Contract decisions to implement

### Canonical payload and compatibility

Keep ordinary review schema_version 1. Add optional root purpose with exact values design-artifact and implemented-ui-conformance, requiring a closed ui_review.schema_version 1 extension when present; reject extension without purpose, unknown versions or contradictory fields. Existing review mode stays read-only. The canonical extension contains assessment_id, baseline, targets, evidence_refs and assessment_context. It references existing owner/change/dimension/file-scope fields rather than inventing parallel authorities.

- baseline: kind (design-artifact, visual-contract, unavailable, not-applicable), artifact_ref or null, and reason when absent. A candidate Design review may consume authorized requirements and editable candidate sources before Design approval; no circular completed-review prerequisite. Implemented conformance resolves the actual approved Design through verifyDesignHandoff or a host-pinned approved visual-contract artifact through the existing loader/hash graph. Missing source/verifier is a limitation/blocker.
- targets: stable id, screen, state, viewport (width/height or explicit justified non-rendered applicability), source_paths and build_paths. Keep actual applicable target identities separate from broad file scope.
- evidence_refs: canonical observed release-evidence references, with kind source/rendered/interaction, target_id and approved requirement/invariant references. The reference resolves to observed command, cwd/owner, exit code, source/build/content fingerprints and output artifacts. Source observations do not need a fabricated test command. A command-backed rendered/interaction claim needs a real nonempty executed command.
- assessment_context: declared author/reviewer references for traceability only; trusted host provenance decides self-critique, independent or limited/unverified. A different model/provider is not required. If separate context is supported it must be used; missing required isolation is a gap.
- Output keeps structural validation, assessment completion, independence, read-only proof, design conformance, per-target source/rendered/interaction coverage, findings, blockers and limitations separate. Layer values are PASS, GAP, STALE, NOT RUN or NOT APPLICABLE; conformance additionally distinguishes FAIL and UNAVAILABLE. PASS describes only the evidence actually verified.
- Ordinary legacy schema-1 inputs remain readable and status reviewed continues to mean assessment completion. read_only_proven becomes true only with complete host before/after observation; absence yields false plus explicit unverified limitation, with read_only_declared retaining the old declaration meaning. This is a deliberate truthfulness correction, not a silent compatibility upgrade. No legacy source note acquires runtime PASS.

### Shared implementation and trusted entrypoints

Create the private ui-review-contract helper with validateUiReviewContext (structural only), createUiReviewRuntime (opaque host-owned authority), evaluateUiReview and evaluateUiReviewConsumer (current-source verified paths), plus a Test-owned evidence-recording entrypoint. Review evaluation never calls a runner, repair callback or persistence callback. Record-producing Test execution is a distinct authorized entrypoint; no implicit execution from applicability.

Extract only safe path/containment and complete read-only repository capture primitives into repository-observation.mjs. Preserve existing simplify snapshot bytes/fingerprint format, caps, ignored-file policy and public exports through delegation; do not change simplify state/grants, limits, rollback, evidence issuance or recursion. An incomplete/unsupported observation is a limitation and never no-write proof. Observe actual added/modified/deleted files, modes and index, including omitted/ignored files, with Git-root and symlink containment. Preserve pre-existing user changes; never reset or restore.

Expose a bounded source-verification entrypoint in design-verification.mjs for the existing actual-source artifact loader/observer. Keep verifyDesignHandoff/evaluateDesignExecution approval requirements intact. The new UI helper reuses that loader, canonical createApprovedArtifact/verifyApprovedArtifactGraph/resolveEvidenceArtifact, PNG validation and current content observations. Runtime tokens and host-observed receipts are not serialized authorities. Receipt ingestion requires host-pinned provenance; caller hashes, PASS flags, context IDs or handoff arrays cannot attest execution.

Receipt verification binds owner, change, target screen/state/viewport, requirement/baseline identity, command/cwd/exit result for executed checks, source/build input manifest and artifact bytes. Real-product captures must have product provenance; wireframe/mockup renders cannot substitute. Require the whole applicable source/build closure, not just caller-selected changed paths. Any relevant edit at the same HEAD invalidates capture and assessment; fresh focused verification restores only its own layer. Out-of-target changes do not justify fabricated global invalidation, but actual review-only write detection covers the whole observable owner root.

### Applicability, consumers and findings

Extend the closed validation-map row with optional ui_review containing schema_version 1, purpose, target_id, evidence_kinds, independent_review_required and baseline_required. Bind exact applicability to approved requirement/decision references and keep the projection unchanged through Test/Review/Ship; omitted runtime fields cannot drop a required approved obligation. The plan/spec may carry a fenced ui-review-requirements JSON block using those same fields; a single reader accepts actual approved artifact bodies. Required evidence is not invocation authority. Legacy rows without UI scope remain valid and no mandatory UI gate is introduced.

- Review: evaluateReviewContract calls the shared verifier; retains existing dimensions and typed finding contract. Add requirement_refs/evidence_refs to UI finding metadata. Aesthetic remains Minor/Low/Info and ADVISORY, never auto-repair. Supported approved requirement/invariant violation is conformance; reject a contradictory aesthetic downgrade. Missing evidence is a located verification gap rather than an observed rendering bug.
- Test: extend the existing test-track forward harness to call the shared evidence producer/verifier for UI purpose requests, preserving current documentation capture v1 behavior. The ui_capture_context adapter requires real content/run proof before use as review evidence; guide-only fields do not become universal UI requirements.
- Angular/Next.js/generic: existing execution entrypoints consume the same applicability and verifier. Required independent Design review is evaluated before implementation only when approved/requested. Post-implementation requirements remain pending and flow to Test/Review/Ship; they must not block pre-edit execution by demanding future capture evidence. No optional or missing Design payload silently invents a baseline.
- Validation/Ship: evaluateValidationEvidence and evaluateShipReadiness re-evaluate current UI evidence/assessment for required rows. A caller completed/reviewed/PASS flag is insufficient. Missing required gaps block readiness; existing approved manual/deferred policy remains visible and never becomes automated PASS.
- Repair: evaluateRepairContract retains existing owner/selection/approval/scope/attempt gates, rejects aesthetic auto-repair and propagates affected evidence invalidation. A successful repair cannot reuse old capture/review proof or restart simplify.
- Portable handoff: extend communication-economy conditional field/shape validation so purpose/ui_review references and required gaps survive review-to-executor/repair/ship projection. Preserve runtime trust-token nonportability: destination reconstructs trusted runtime and re-verifies actual sources. Unknown host capability is a limitation.

## Tasks

### Phase 1 — Regression and canonical payload

1. TASK-001 CREATE the private UI review reference and reusable temporary-repository fixture; EDIT existing review-contract and portable-handoff tests. Tests load the complete documented YAML/JSON payload, then call the real helper and consumers. First replay the already observed helper gaps against unchanged source and add expected-denial assertions. Capture genuine RED results and preserve positive existing aesthetic/narrow/declared-write controls. Do not count a missing-module import as the only reproduced defect.

### Phase 2 — Shared enforcement and consumers

2. TASK-002 CREATE the shared verifier and bounded observation primitive; EDIT only the listed simplify observation delegation, Design source-reader entrypoint and review helper. Implement structural versus verified separation, actual content/authority/read-only evidence and finding gates. Preserve prior-step semantics and run the relevant regressions immediately.
3. TASK-003 EDIT the listed validation, Test, frontend, portable, repair and ship callers. Requiredness comes from actual approved applicability, not payload presence. Pair every positive consumer with omission/forgery/stale-content denial. Keep preflight versus postflight timing distinct.
4. TASK-004 EDIT canonical instructions to point to the single private contract. Retain Design self-critique, existing-design-first/editable-source rules, narrow review dimensions and owner controls. Replace unconditional Fix obvious UI issues wording with executor/repair authority, without disabling authorized executor self-checks. Keep stack-specific checks additive.

### Phase 3 — Current evidence and mirrors

5. TASK-005 EDIT current-evidence selection/validation and append-only README notes; CREATE ui-review-integration.json with actual baseline/RED/GREEN/final results and current source/contract manifests. Preserve records.json, design-handoff-integration.json and all historical transcripts/snapshots byte-for-byte. The old record remains historical and its known stale-at-current-head status is explicit; no relabeling as current PASS. Exact command, case coverage, output hash, source closure and provenance mutations must be checked. This new record includes no fake provider/model/token or visual-run claims.
6. TASK-006 RUN npm run sync:skills after canonical sources stabilize; allow content changes only in listed mirrors. VERIFY-THEN-EDIT VALIDATION.md only for the current-value cells of Aggregate just-in-time scenario bytes and Total measured communication bytes using the existing report command. Preserve all baseline/other cells.

### Phase 4 — Final proof and delivery

7. TASK-007 RUN the exact focused/preservation/authoring/schema/mirror/hygiene commands; CREATE the scoped delivery record before final read-only verification/convergence/branch-ready evaluation. Recheck every approved parent/hash, scope, immutable-history bytes and public count. Report reproduced versus already-correct findings, contract/compatibility/files, actual PASS/FAIL/NOT RUN and blockers. No commit/push and no next task.

The sequential task owner may complete or correct its own listed files during integration, but must invalidate and rerun affected evidence; this is not scope expansion. Keep all write-producing docs/evidence/sync work before final read-only checks. If any write follows final verification, re-run affected gates before a readiness claim.

## Exact file ownership

### TASK-001 — Pin the documented payload and reproduce regressions

- CREATE _refs/shared/ui-review.md
- EDIT test/e2e/review-contract.test.mjs
- CREATE test/e2e/support/ui-review-fixture.mjs
- EDIT test/e2e/communication-economy.test.mjs

### TASK-002 — Implement shared observation, evidence and review verification

- CREATE _refs/shared/ui-review-contract.mjs
- CREATE _refs/shared/repository-observation.mjs
- EDIT _refs/simplify/repository-evidence.mjs
- EDIT _refs/shared/design-verification.mjs
- EDIT _refs/shared/review-contract.mjs

### TASK-003 — Enforce the contract in existing consumers

- EDIT _refs/shared/validation-map.mjs
- EDIT _refs/angular/execution-contract.mjs
- EDIT _refs/nextjs/execution-contract.mjs
- EDIT _refs/orchestration/execution-contract.mjs
- EDIT _refs/orchestration/repair-contract.mjs
- EDIT _refs/shared/ship-readiness-contract.mjs
- EDIT _refs/harness/communication-economy.mjs
- EDIT test/e2e/support/test-track-forward-harness.mjs

### TASK-004 — Align producer and workflow instructions

- EDIT skills/shared/workflow/review.md
- EDIT skills/tracks/design/sdcorejs-design.md
- EDIT skills/tracks/test/sdcorejs-test.md
- EDIT skills/tracks/angular/sdcorejs-angular.md
- EDIT skills/tracks/nextjs/sdcorejs-nextjs.md
- EDIT skills/shared/sdlc/03-plan.md
- EDIT skills/shared/sdlc/04-execute-plan.md
- EDIT skills/orchestration/repair-loop.md
- EDIT skills/shared/workflow/ship.md
- EDIT _refs/design/uiux/index.md
- EDIT _refs/shared/validation-map.md
- EDIT _refs/shared/test-ui-evidence.md
- EDIT _refs/shared/design-handoff.md
- EDIT _refs/shared/frontend-architecture.md
- EDIT _refs/angular/write-code/input-analysis.md
- EDIT _refs/orchestration/tail/repair-loop.md

### TASK-005 — Append current behavioral evidence without rewriting history

- EDIT authoring/evals/uiux/evidence.test.mjs
- EDIT authoring/evals/uiux/README.md
- CREATE authoring/evals/uiux/ui-review-integration.json

### TASK-006 — Sync mirrors and measured report cells

- CREATE .claude/_refs/shared/ui-review.md
- CREATE plugin/_refs/shared/ui-review.md
- CREATE codex/skills/_refs/shared/ui-review.md
- CREATE .claude/_refs/shared/ui-review-contract.mjs
- CREATE plugin/_refs/shared/ui-review-contract.mjs
- CREATE codex/skills/_refs/shared/ui-review-contract.mjs
- CREATE .claude/_refs/shared/repository-observation.mjs
- CREATE plugin/_refs/shared/repository-observation.mjs
- CREATE codex/skills/_refs/shared/repository-observation.mjs
- EDIT .claude/_refs/simplify/repository-evidence.mjs
- EDIT plugin/_refs/simplify/repository-evidence.mjs
- EDIT codex/skills/_refs/simplify/repository-evidence.mjs
- EDIT .claude/_refs/shared/design-verification.mjs
- EDIT plugin/_refs/shared/design-verification.mjs
- EDIT codex/skills/_refs/shared/design-verification.mjs
- EDIT .claude/_refs/shared/review-contract.mjs
- EDIT plugin/_refs/shared/review-contract.mjs
- EDIT codex/skills/_refs/shared/review-contract.mjs
- EDIT .claude/_refs/shared/validation-map.mjs
- EDIT plugin/_refs/shared/validation-map.mjs
- EDIT codex/skills/_refs/shared/validation-map.mjs
- EDIT .claude/_refs/angular/execution-contract.mjs
- EDIT plugin/_refs/angular/execution-contract.mjs
- EDIT codex/skills/_refs/angular/execution-contract.mjs
- EDIT .claude/_refs/nextjs/execution-contract.mjs
- EDIT plugin/_refs/nextjs/execution-contract.mjs
- EDIT codex/skills/_refs/nextjs/execution-contract.mjs
- EDIT .claude/_refs/orchestration/execution-contract.mjs
- EDIT plugin/_refs/orchestration/execution-contract.mjs
- EDIT codex/skills/_refs/orchestration/execution-contract.mjs
- EDIT .claude/_refs/orchestration/repair-contract.mjs
- EDIT plugin/_refs/orchestration/repair-contract.mjs
- EDIT codex/skills/_refs/orchestration/repair-contract.mjs
- EDIT .claude/_refs/shared/ship-readiness-contract.mjs
- EDIT plugin/_refs/shared/ship-readiness-contract.mjs
- EDIT codex/skills/_refs/shared/ship-readiness-contract.mjs
- EDIT .claude/_refs/harness/communication-economy.mjs
- EDIT plugin/_refs/harness/communication-economy.mjs
- EDIT codex/skills/_refs/harness/communication-economy.mjs
- EDIT .claude/_refs/design/uiux/index.md
- EDIT plugin/_refs/design/uiux/index.md
- EDIT codex/skills/_refs/design/uiux/index.md
- EDIT .claude/_refs/shared/validation-map.md
- EDIT plugin/_refs/shared/validation-map.md
- EDIT codex/skills/_refs/shared/validation-map.md
- EDIT .claude/_refs/shared/test-ui-evidence.md
- EDIT plugin/_refs/shared/test-ui-evidence.md
- EDIT codex/skills/_refs/shared/test-ui-evidence.md
- EDIT .claude/_refs/shared/design-handoff.md
- EDIT plugin/_refs/shared/design-handoff.md
- EDIT codex/skills/_refs/shared/design-handoff.md
- EDIT .claude/_refs/shared/frontend-architecture.md
- EDIT plugin/_refs/shared/frontend-architecture.md
- EDIT codex/skills/_refs/shared/frontend-architecture.md
- EDIT .claude/_refs/angular/write-code/input-analysis.md
- EDIT plugin/_refs/angular/write-code/input-analysis.md
- EDIT codex/skills/_refs/angular/write-code/input-analysis.md
- EDIT .claude/_refs/orchestration/tail/repair-loop.md
- EDIT plugin/_refs/orchestration/tail/repair-loop.md
- EDIT codex/skills/_refs/orchestration/tail/repair-loop.md
- EDIT .claude/skills/sdcorejs-review/SKILL.md
- EDIT plugin/skills/sdcorejs-review/SKILL.md
- EDIT codex/skills/sdcorejs-review/SKILL.md
- EDIT .claude/skills/sdcorejs-design/SKILL.md
- EDIT plugin/skills/sdcorejs-design/SKILL.md
- EDIT codex/skills/sdcorejs-design/SKILL.md
- EDIT .claude/skills/sdcorejs-test/SKILL.md
- EDIT plugin/skills/sdcorejs-test/SKILL.md
- EDIT codex/skills/sdcorejs-test/SKILL.md
- EDIT .claude/skills/sdcorejs-angular/SKILL.md
- EDIT plugin/skills/sdcorejs-angular/SKILL.md
- EDIT codex/skills/sdcorejs-angular/SKILL.md
- EDIT .claude/skills/sdcorejs-nextjs/SKILL.md
- EDIT plugin/skills/sdcorejs-nextjs/SKILL.md
- EDIT codex/skills/sdcorejs-nextjs/SKILL.md
- EDIT .claude/skills/sdcorejs-plan/SKILL.md
- EDIT plugin/skills/sdcorejs-plan/SKILL.md
- EDIT codex/skills/sdcorejs-plan/SKILL.md
- EDIT .claude/skills/sdcorejs-execute-plan/SKILL.md
- EDIT plugin/skills/sdcorejs-execute-plan/SKILL.md
- EDIT codex/skills/sdcorejs-execute-plan/SKILL.md
- EDIT .claude/skills/sdcorejs-repair-loop/SKILL.md
- EDIT plugin/skills/sdcorejs-repair-loop/SKILL.md
- EDIT codex/skills/sdcorejs-repair-loop/SKILL.md
- EDIT .claude/skills/sdcorejs-ship/SKILL.md
- EDIT plugin/skills/sdcorejs-ship/SKILL.md
- EDIT codex/skills/sdcorejs-ship/SKILL.md
- VERIFY-THEN-EDIT VALIDATION.md

### TASK-007 — Run final checks and record the bounded delivery

- CREATE .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md

## Regression and acceptance matrix

All listed case IDs are executable tests in review-contract.test.mjs, not labels pasted onto unrelated green tests. Each may contain paired subcases. case-ui-review-scope-and-checks proves deterministic inventory/compatibility/closure assertions; package command results are additional independent gates.

- AC-001 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-independence -> EVIDENCE-001: Self-critique cannot satisfy a required independent review. A separate reviewer context is used when supported; otherwise the report preserves the limitation and cannot claim that the required separation ran. A different model/provider is not required.
- AC-002 -> TASK-001, TASK-002, TASK-004, TASK-007 -> case-ui-review-purposes -> EVIDENCE-002: Design-artifact review traces requirements/AC to flows/screens/states/copy/responsive/accessibility/component mappings. Implemented-UI conformance compares actual implementation with a verified approved design or an explicit authorized visual contract. Ordinary review remains supported.
- AC-003 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-source-limits -> EVIDENCE-003: Source-only evidence cannot yield rendered or interaction PASS for clipping, actual contrast, responsive rendering, focus behavior, or keyboard flow; missing evidence is a verification gap, not an observed defect.
- AC-004 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-mockup-denial -> EVIDENCE-004: Generated/static mockups and wireframe renders remain distinct from real product captures; substitution fails closed.
- AC-005 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-target-provenance -> EVIDENCE-005: Missing or mismatched owner, screen, state, viewport, command/run, source/build/content identity or observed artifact provenance cannot satisfy a required check. No caller-supplied PASS or hash alone establishes verified evidence.
- AC-006 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-content-staleness -> EVIDENCE-006: An actual source edit at the same HEAD makes relevant capture/review evidence stale. A fresh focused run and reassessment restore only the proof they actually establish.
- AC-007 -> TASK-001, TASK-002, TASK-004, TASK-007 -> case-ui-review-missing-baseline -> EVIDENCE-007: Missing design still permits scoped source/UI assessment. Design conformance is unavailable when a relevant baseline is missing, or not-applicable with a valid reason when no comparison applies. Neither state fabricates an approved baseline or forces new Design work.
- AC-008 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-aesthetic-advisory -> EVIDENCE-008: Aesthetic preference cannot be blocking, auto-repairable, or write-authorizing. Existing aesthetic and narrow-dimension controls continue to pass.
- AC-009 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-conformance-classification -> EVIDENCE-009: A demonstrated approved behavior/invariant violation cannot be reclassified as aesthetic to avoid its gate. Missing observation remains a verification gap with locator, evidence, impact, severity/gate, repair tier and suggested action.
- AC-010 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-007 -> case-ui-review-observed-read-only -> EVIDENCE-010: Direct review changes no source and persists no report/artifact without applicable authority. Declarations alone do not prove no writes; trusted before/after observation must catch writes omitted from declarations.
- AC-011 -> TASK-001, TASK-002, TASK-004, TASK-007 -> case-ui-review-narrow-scope -> EVIDENCE-011: A security/accessibility or otherwise narrow review retains its requested dimensions, files and topics and never expands to ALL or unrelated UI work.
- AC-012 -> TASK-001, TASK-003, TASK-004, TASK-007 -> case-ui-review-real-consumers -> EVIDENCE-012: Angular, Next.js and generic frontend consumers share purpose/evidence semantics; stack checks are additive only. Plan/validation applicability controls required checks. Required UI/design gaps reach ship, and deferral requires the existing authority/risk policy. Review completed or schema valid never means blocker-free.
- AC-013 -> TASK-001, TASK-003, TASK-004, TASK-007 -> case-ui-review-owner-repair -> EVIDENCE-013: Review-only UI checks cannot silently fix source. Any permitted repair uses the existing owner/scope contract, invalidates affected UI evidence and does not restart simplify after repair.
- AC-014 -> TASK-001, TASK-005, TASK-006, TASK-007 -> case-ui-review-smoke-fixtures -> EVIDENCE-014: Action popover, mobile table selection, and standalone responsive page scenarios exercise documented payload -> helper -> consumer, including positive evidence, missing/stale evidence and scope/authority mutations. Fixtures do not modify product repositories or claim live rendering.
- AC-015 -> TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006, TASK-007 -> case-ui-review-legacy-history -> EVIDENCE-015: Legacy ordinary reviews stay readable but do not acquire verified UI proof. Unknown or contradictory UI payloads fail closed. Approved artifacts and prior evidence records remain unchanged; new current authoring evidence is separately recorded and independently checked.
- AC-016 -> TASK-001, TASK-005, TASK-006, TASK-007 -> case-ui-review-scope-and-checks -> EVIDENCE-016: Relevant regression, authoring/UIUX, consumer, schema, mirror, hygiene and executable-reference commands have actual PASS/FAIL/NOT RUN results. Public skill count remains 23; no dependency/browser installation, live/paid service, commit or push occurs.

Smoke fixtures: action popover (open/closed, viewport clipping limitation, keyboard execution); mobile table selection (selection/action parity, small viewport, keyboard/touch alternatives); standalone responsive page (approved applicable surfaces, no forced module/portal identity). Each uses a temporary local fixture and synthetic output with explicit contract-fixture provenance. Positive receipt mechanics do not establish a real browser/product visual PASS. Include missing/stale captures, mockup substitution, same-HEAD edit, source/build/viewport mismatch, parent mutation, self-critique, undeclared source/report writes, aesthetic downgrade and narrow-scope mutations.

## Verification commands

Existing Node 24.19.0 / npm 10.9.2; cwd repository root. The focus commands are documented invocations of the existing Node test runner, not invented package scripts. No package.json or lockfile change is needed.

- `node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs` — Mapped UI review cases plus existing real consumer and portable compatibility controls.
- `node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/git-closure-contract.test.mjs` — Preserve the prior simplify and Design guarantees after bounded observation reuse.
- `node --test --test-reporter=tap test/e2e/uiux-knowledge.test.mjs test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-skill-creator-regression.test.mjs test/e2e/review-contract.test.mjs` — Actual transcript and current-source manifest for the new append-only UI review evidence record.
- `npm run test:e2e:uiux` — Historical integrity plus the separate current integration record.
- `npm run test:e2e:skill-authoring` — Public inventory, authoring contracts and internal non-distribution.
- `node authoring/evals/run-deterministic.mjs` — Existing offline routing/authority mutation matrix; zero provider calls.
- `npm run report:communication-economy` — Measure the two existing current-value cells only.
- `npm run sync:skills` — Generate mirrors from stabilized canonical sources.
- `npm run check:skills` — Mirror, schema and 23-public-skill inventory verification.
- `npm run check:text-hygiene` — Source language/encoding and hygiene.
- `npm run check:executable-references` — Executable references/import closure.
- `git diff --check` — Whitespace and diff hygiene.

Run RED before implementation and GREEN after the relevant change. Capture the current authoring transcript after source/test/doc inputs stabilize; append its record, sync mirrors and final delivery before read-only final checks. Full unrelated repository/golden-product matrix and real browser/interaction/live-agent execution remain NOT RUN with the stated scope/authorization limitation. A platform limitation (for example symlink creation unavailable) is reported explicitly, never converted to PASS.

## Preflight, scope and approval boundaries

Before source writes capture git status --short, staged/unstaged diffstats, untracked files, branch and HEAD. Verify approved graph, authoring target, allowed/prohibited paths, baseline hashes and exact Git root. Preserve all pre-existing/user-owned changes and immutable artifacts. New unrelated dirty paths require the existing scoped choice, not destructive cleanup. Local test fixtures may initialize/commit only disposable temporary repositories as existing tests do; this grants no Git mutation in the authoring or product repositories.

The approved scope is exactly the listed files. Package/lockfiles, registry inventory, canonical approval/architecture/decision algorithms, prior approved artifacts and historical evidence are prohibited. The sole simplify edit is mechanical observation reuse with unchanged semantics and regression proof. A new dependency, different public surface, broader refactor or required extra path returns to plan revision.

Plan coverage revision 2 preserves all approved R/AC/D/INV identities and decisions, adds task/evidence mappings and proposed proof-layer decisions D-004/D-005. These become approved only with the complete plan approval; no prior snapshot is edited.

The current validation-map helper requires a decision-coverage approved artifact even at plan self-review. Before plan approval it returns exactly DECISION_COVERAGE_APPROVAL_INVALID; row/readiness checks must have zero other errors. Do not fabricate a receipt to remove that cycle. Upon actual approval, create the real scoped coverage approval with current user/time/revision via canonical approval infrastructure, then require assertValidationMap, full approved graph and execution preflight to pass before source writes. Do not use the helper fixture timestamp or wildcard allowed_paths as user authority.

## Draft self-review

Verified on actual files: approved spec/architecture graph and exact architecture draft-plan handoff; strict plan decision coverage; goal-backward mapping; repository ownership; every CREATE absent/EDIT present; all 16 ACs mapped to cases/tasks/evidence; no duplicate path owner. One deterministic critique round is recorded below. The only expected approval-dependent limitation is the not-yet-approved coverage envelope. No new regression/implementation PASS is claimed by this plan.

Known baseline: npm run test:e2e:uiux is FAIL (26 PASS, 1 FAIL), stale prior integration evidence for _refs/shared/evidence-artifact.mjs. This plan fixes current-evidence handling by appending a new record, not changing historical bytes. Other old step failures are not assumed current; report only actual fresh output.

## Typed execution contract

```yaml
plan_context:
  schema_version: 2
  source: sdcorejs-plan
  contract_id: ui-review-contract-20260923
  requirement_id: ui-review-contract-20260923
  architecture_gate:
    valid: true
    required: true
    status: required
    signals:
      - public-api-contract
      - security-trust-boundary
      - state-data-ownership
    bypass: null
    rationale: This change crosses review/test/executor/repair/ship payloads and changes which observed evidence and actor authority can establish UI conformance. It retains existing workflow owners and uses a bounded architecture contract after spec approval.
    blockers: []
    blocker_messages: []
  architecture_context:
    schema_version: 1
    source: sdcorejs-architecture
    contract_id: ui-review-contract-20260923
    requirement_id: R-001
    approved_spec_reference:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      artifact_id: spec-ui-review-contract-20260923-r1
      artifact_kind: spec
      revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
      approval_hash: sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497
    approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md
    approved_architecture_hash: sha256:v1:e34f970eb82fada628bce8c7fdd655d3ac9511bb7b949d3727a76c65ba8fcb52
    owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    owner_module_id: null
    execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    trigger:
      required: true
      signals:
        - public-api-contract
        - security-trust-boundary
        - state-data-ownership
      rationale: This change crosses review/test/executor/repair/ship payloads and changes which observed evidence and actor authority can establish UI conformance. It retains existing workflow owners and uses a bounded architecture contract after spec approval.
    invariants:
      - id: INV-001
        statement: Preserve approved artifacts, user-owned content, existing review dimensions and 23 public skills; never fabricate evidence, expand repair authority, or perform prohibited live/Git/dependency actions.
        scope: Design/Test/Review/executor/repair/ship UI contracts
        owner: github.com/sdcorejs/sdcorejs-agent
        rationale: Evidence, assessment, approval and source-write authority remain distinct across every consumer.
        verification_method: Offline positive/negative payload-to-helper-to-consumer fixtures; snapshot diffs; immutable artifact/hash verification; existing compatibility and mirror checks.
        requirement_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        decision_refs:
          - D-001
          - D-002
          - D-003
    boundaries:
      - id: review-assessment
        statement: Review assesses only the authorized purpose, dimensions and file/topic scope. It reads evidence and never runs capture/tests, repairs source or persists artifacts without the relevant separately scoped authority.
        invariant_refs:
          - INV-001
      - id: evidence-production
        statement: Test/host runners own actual source observations, capture and interaction receipts. Design owns editable artifacts/self-critique. Executors and the existing repair-loop own authorized implementation changes.
        invariant_refs:
          - INV-001
    dependency_directions:
      - from: review/validation/frontend/repair/ship consumers
        to: one private UI review verifier
        rationale: Shared semantics prevent stack-specific acceptance or stale evidence bypasses.
        invariant_refs:
          - INV-001
      - from: private UI review verifier
        to: approved-artifact/evidence/Design verification and repository observation primitives
        rationale: Reuse trusted content and authority checks; do not duplicate the approval algorithm or route UI review through simplify.
        invariant_refs:
          - INV-001
    data_state_owners:
      - subject: Design source and author self-critique
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: sdcorejs-design in the semantic target owner
        invariant_refs:
          - INV-001
      - subject: capture/interaction receipts and current repository observations
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: sdcorejs-test and trusted host adapters
        invariant_refs:
          - INV-001
      - subject: independent assessment, classified findings and verification gaps
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: sdcorejs-review; runtime-only unless persistence is authorized
        invariant_refs:
          - INV-001
      - subject: implementation repair and evidence invalidation
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        runtime_owner: approved executor or sdcorejs-repair-loop
        invariant_refs:
          - INV-001
    public_contracts:
      - id: review-purpose-contract
        kind: api
        owner: sdcorejs-review shared contract
        statement: An optional versioned ui_review extension and explicit purpose enrich the current review schema. Assessment completion, structural validity, independent-context limitation, conformance verdict and source/rendered/interaction coverage remain separate.
        compatibility: Keep ordinary schema-1 reviews readable and preserve dimensions/status fields. Legacy UI notes are unverified; unknown or contradictory UI extensions fail closed. No public skill or dimension is added.
        migration: Opt in through new approved applicability and caller integration. Do not bulk-migrate approved history, rewrite old evidence or infer verified UI proof from legacy reviewed status.
        invariant_refs:
          - INV-001
    security_trust_boundaries:
      - id: host-evidence-authority
        statement: A trusted runtime reads actual pinned approved parents/visual contracts and current source/build content. It resolves observed receipts with the canonical verifier. Caller strings, hashes, empty write lists, PASS labels and declared author/reviewer identities alone cannot prove approval, independence, read-only behavior or evidence freshness.
        invariant_refs:
          - INV-001
      - id: read-only-and-persistence
        statement: Before/after host observations detect source and unauthorized artifact writes, including undeclared paths. Missing observation is a limitation, not read_only_proven. Read-only review runs no write/capture/repair callback; explicitly authorized report persistence is a separate bounded owner action.
        invariant_refs:
          - INV-001
    cross_repository_integration: []
    adopted_decision_refs:
      - D-001
      - D-002
      - D-003
    deferred_decision_refs: []
    assumption_refs: []
    validation_obligations:
      - id: VAL-001
        expected_proof: Purpose, self-critique/independent-review distinction, read-only actual writes/persistence, missing baseline and narrow dimensions survive the documented payload-to-consumer path.
        owner: workflow contract fixtures
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-001
          - AC-002
          - AC-007
          - AC-010
          - AC-011
      - id: VAL-002
        expected_proof: Source-only and mockup evidence cannot satisfy rendered/interaction requirements. Target mismatches, missing receipts and content edits at the same HEAD become verification gaps/stale evidence.
        owner: test/Review evidence fixtures
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-003
          - AC-004
          - AC-005
          - AC-006
      - id: VAL-003
        expected_proof: Aesthetic stays advisory; approved requirement/invariant violations retain conformance gates; authorized owner repairs invalidate evidence; required gaps and policy-bound deferrals reach ship.
        owner: finding/repair/ship consumer fixtures
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-008
          - AC-009
          - AC-012
          - AC-013
      - id: VAL-004
        expected_proof: Three offline smoke fixtures, legacy compatibility, append-only current authoring evidence, immutable history, 23 public skills and relevant checks remain verified without live services or dependency changes.
        owner: authoring and integration verification
        invariant_refs:
          - INV-001
        acceptance_criterion_refs:
          - AC-014
          - AC-015
          - AC-016
    profile_sections:
      frontend_architecture_ref: null
      agent_architecture_ref: null
    change_control:
      revision: 1
      supersedes: null
  decision_coverage: &a3
    schema_version: 1
    revision: 2
    records:
      - id: R-001
        type: requirement
        statement: Keep Design authoring/self-critique, independent Review assessment, Test execution/capture, and executor/repair writes separate, with no new public skills or review dimensions.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
          - EVIDENCE-010
      - id: R-002
        type: requirement
        statement: Represent design artifact review and implemented UI conformance as explicit purposes of the existing review contract, preserving the requested scope and dimensions.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-002
          - EVIDENCE-007
          - EVIDENCE-011
      - id: R-003
        type: requirement
        statement: Derive source, rendered, and interaction evidence claims from trusted, content-bound observations for the exact screen, state, viewport, owner, and applicable source/build identity.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-003
          - EVIDENCE-004
          - EVIDENCE-005
          - EVIDENCE-006
      - id: R-004
        type: requirement
        statement: Reuse durable findings and repair authority; preserve approved behavior obligations, advisory aesthetic preferences, and honest verification gaps.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-008
          - EVIDENCE-009
      - id: R-005
        type: requirement
        statement: Integrate applicability and evidence requirements into approved planning/validation and existing frontend, repair, and ship consumers without automatic review or a new approval ceremony for every edit.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-012
          - EVIDENCE-013
      - id: R-006
        type: requirement
        statement: Preserve compatibility, immutable approvals and historical evidence, exact-version/project reuse rules, and the completed simplify and Design handoff boundaries.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-015
      - id: R-007
        type: requirement
        statement: Prove the contract with offline behavioral fixtures for action popover, mobile table selection, and a standalone responsive page, plus focused schema/mirror/hygiene checks.
        source: explicit-user
        status: active
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        owner_module_id: null
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-014
          - EVIDENCE-016
      - id: AC-001
        type: acceptance-criterion
        statement: Separate author self-critique from independent assessment.
        behavior: Separate author self-critique from independent assessment.
        expected_result: Self-critique cannot satisfy a required independent review. A separate reviewer context is used when supported; otherwise the report preserves the limitation and cannot claim that the required separation ran. A different model/provider is not required.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-001
      - id: AC-002
        type: acceptance-criterion
        statement: Select an explicit existing-review purpose.
        behavior: Select an explicit existing-review purpose.
        expected_result: Design-artifact review traces requirements/AC to flows/screens/states/copy/responsive/accessibility/component mappings. Implemented-UI conformance compares actual implementation with a verified approved design or an explicit authorized visual contract. Ordinary review remains supported.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-002
      - id: AC-003
        type: acceptance-criterion
        statement: Prevent source inspection from proving rendering or interactions.
        behavior: Prevent source inspection from proving rendering or interactions.
        expected_result: Source-only evidence cannot yield rendered or interaction PASS for clipping, actual contrast, responsive rendering, focus behavior, or keyboard flow; missing evidence is a verification gap, not an observed defect.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-003
      - id: AC-004
        type: acceptance-criterion
        statement: Reject a mockup as proof of implemented UI.
        behavior: Reject a mockup as proof of implemented UI.
        expected_result: Generated/static mockups and wireframe renders remain distinct from real product captures; substitution fails closed.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-004
      - id: AC-005
        type: acceptance-criterion
        statement: Bind UI evidence to its actual target and content.
        behavior: Bind UI evidence to its actual target and content.
        expected_result: Missing or mismatched owner, screen, state, viewport, command/run, source/build/content identity or observed artifact provenance cannot satisfy a required check. No caller-supplied PASS or hash alone establishes verified evidence.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-005
      - id: AC-006
        type: acceptance-criterion
        statement: Invalidate affected capture and review evidence after implementation changes.
        behavior: Invalidate affected capture and review evidence after implementation changes.
        expected_result: An actual source edit at the same HEAD makes relevant capture/review evidence stale. A fresh focused run and reassessment restore only the proof they actually establish.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-003
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-006
      - id: AC-007
        type: acceptance-criterion
        statement: Review without inventing a design baseline.
        behavior: Review without inventing a design baseline.
        expected_result: Missing design still permits scoped source/UI assessment. Design conformance is unavailable when a relevant baseline is missing, or not-applicable with a valid reason when no comparison applies. Neither state fabricates an approved baseline or forces new Design work.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-007
      - id: AC-008
        type: acceptance-criterion
        statement: Keep pure aesthetic preferences advisory.
        behavior: Keep pure aesthetic preferences advisory.
        expected_result: Aesthetic preference cannot be blocking, auto-repairable, or write-authorizing. Existing aesthetic and narrow-dimension controls continue to pass.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-008
      - id: AC-009
        type: acceptance-criterion
        statement: Preserve approved requirements and invariants as conformance obligations.
        behavior: Preserve approved requirements and invariants as conformance obligations.
        expected_result: A demonstrated approved behavior/invariant violation cannot be reclassified as aesthetic to avoid its gate. Missing observation remains a verification gap with locator, evidence, impact, severity/gate, repair tier and suggested action.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-004
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-009
      - id: AC-010
        type: acceptance-criterion
        statement: Keep review read-only through actual execution and persistence.
        behavior: Keep review read-only through actual execution and persistence.
        expected_result: Direct review changes no source and persists no report/artifact without applicable authority. Declarations alone do not prove no writes; trusted before/after observation must catch writes omitted from declarations.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-010
      - id: AC-011
        type: acceptance-criterion
        statement: Preserve narrow scope and existing dimensions.
        behavior: Preserve narrow scope and existing dimensions.
        expected_result: A security/accessibility or otherwise narrow review retains its requested dimensions, files and topics and never expands to ALL or unrelated UI work.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-011
      - id: AC-012
        type: acceptance-criterion
        statement: Consume review obligations across the real workflow.
        behavior: Consume review obligations across the real workflow.
        expected_result: Angular, Next.js and generic frontend consumers share purpose/evidence semantics; stack checks are additive only. Plan/validation applicability controls required checks. Required UI/design gaps reach ship, and deferral requires the existing authority/risk policy. Review completed or schema valid never means blocker-free.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-012
      - id: AC-013
        type: acceptance-criterion
        statement: Route authorized repairs to their owner and invalidate evidence.
        behavior: Route authorized repairs to their owner and invalidate evidence.
        expected_result: Review-only UI checks cannot silently fix source. Any permitted repair uses the existing owner/scope contract, invalidates affected UI evidence and does not restart simplify after repair.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-005
        task_refs:
          - TASK-001
          - TASK-003
          - TASK-004
          - TASK-007
        evidence_refs:
          - EVIDENCE-013
      - id: AC-014
        type: acceptance-criterion
        statement: Exercise three bounded smoke fixtures and their negative mutations.
        behavior: Exercise three bounded smoke fixtures and their negative mutations.
        expected_result: Action popover, mobile table selection, and standalone responsive page scenarios exercise documented payload -> helper -> consumer, including positive evidence, missing/stale evidence and scope/authority mutations. Fixtures do not modify product repositories or claim live rendering.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-014
      - id: AC-015
        type: acceptance-criterion
        statement: Preserve schema compatibility and historical approval/evidence.
        behavior: Preserve schema compatibility and historical approval/evidence.
        expected_result: Legacy ordinary reviews stay readable but do not acquire verified UI proof. Unknown or contradictory UI payloads fail closed. Approved artifacts and prior evidence records remain unchanged; new current authoring evidence is separately recorded and independently checked.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-006
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-015
      - id: AC-016
        type: acceptance-criterion
        statement: Complete focused verification and mirror synchronization.
        behavior: Complete focused verification and mirror synchronization.
        expected_result: Relevant regression, authoring/UIUX, consumer, schema, mirror, hygiene and executable-reference commands have actual PASS/FAIL/NOT RUN results. Public skill count remains 23; no dependency/browser installation, live/paid service, commit or push occurs.
        verification_kind: automated
        blocking: true
        requirement_refs:
          - R-007
        task_refs:
          - TASK-001
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-016
      - id: D-001
        type: decision
        statement: "purpose: design-artifact | implemented-ui-conformance; absent purpose preserves ordinary review"
        question: Review purpose vocabulary
        selected_value: "purpose: design-artifact | implemented-ui-conformance; absent purpose preserves ordinary review"
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Use the existing kebab-case enum convention and keep purpose separate from mode, dimension, track and evidence class.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-001
          - R-002
          - AC-002
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: D-002
        type: decision
        statement: Extend the existing review contract with a private shared UI review verifier and reuse current snapshot/hash/receipt and Design verification infrastructure
        question: Evidence and verification boundary
        selected_value: Extend the existing review contract with a private shared UI review verifier and reuse current snapshot/hash/receipt and Design verification infrastructure
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Structural acceptance, independent review completion, conformance verdict and verification coverage must be separately observable.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-003
          - R-005
          - AC-003
          - AC-005
          - AC-012
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: D-003
        type: decision
        statement: Preserve legacy/historical inputs without promoting them; append a new current UI/UX integration record bound to actual final sources
        question: Compatibility and evidence lifecycle
        selected_value: Preserve legacy/historical inputs without promoting them; append a new current UI/UX integration record bound to actual final sources
        source: explicit-user
        status: approved
        blocking: true
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: The checked-out historical UI/UX integration record is stale and must not be rewritten to make migration green.
        supersedes: null
        revisit_condition: Revisit during spec approval or if compatibility evidence contradicts the proposal.
        convention_impact:
          candidate: false
          category: null
        downstream_refs:
          - R-006
          - AC-015
          - AC-016
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
      - id: D-004
        type: decision
        statement: Prove review/evidence/repair authority denial through real exported contract consumers.
        question: Which proving boundary covers the approved UI review acceptance criteria?
        selected_value: Offline exported-API end-to-end denial plus paired authorized controls.
        source: approved-architecture
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Refines VAL-001 through VAL-004 without changing the approved requirements, decisions or authorities; adopted only upon this plan approval.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a1
          - R-001
          - R-003
          - R-005
          - AC-001
          - AC-005
          - AC-010
          - AC-012
          - AC-013
          - INV-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        validation_boundary:
          kind: authorization
          source_refs: *a1
      - id: D-005
        type: decision
        statement: Prove evidence semantics, scope, compatibility and regression fixtures at the smallest deterministic layer.
        question: Which proving boundary covers the approved UI review acceptance criteria?
        selected_value: Offline unit/integration fixtures and exact final verification commands.
        source: approved-architecture
        status: proposed
        blocking: false
        scope: repository
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        rationale: Refines VAL-001 through VAL-004 without changing the approved requirements, decisions or authorities; adopted only upon this plan approval.
        supersedes: null
        revisit_condition: null
        convention_impact:
          candidate: false
          category: null
        downstream_refs: &a2
          - R-002
          - R-003
          - R-004
          - R-007
          - R-006
          - AC-002
          - AC-003
          - AC-004
          - AC-006
          - AC-007
          - AC-008
          - AC-009
          - AC-011
          - AC-014
          - AC-015
          - AC-016
          - INV-001
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        validation_boundary:
          kind: none
          source_refs: *a2
      - id: INV-001
        type: invariant
        statement: Preserve approved artifacts, user-owned content, existing review dimensions and 23 public skills; never fabricate evidence, expand repair authority, or perform prohibited live/Git/dependency actions.
        protected_refs:
          - R-001
          - R-003
          - R-004
          - R-006
          - R-007
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
        evidence_refs:
          - EVIDENCE-016
    history:
      - revision: 1
        active:
          - id: R-001
            type: requirement
          - id: R-002
            type: requirement
          - id: R-003
            type: requirement
          - id: R-004
            type: requirement
          - id: R-005
            type: requirement
          - id: R-006
            type: requirement
          - id: R-007
            type: requirement
          - id: AC-001
            type: acceptance-criterion
          - id: AC-002
            type: acceptance-criterion
          - id: AC-003
            type: acceptance-criterion
          - id: AC-004
            type: acceptance-criterion
          - id: AC-005
            type: acceptance-criterion
          - id: AC-006
            type: acceptance-criterion
          - id: AC-007
            type: acceptance-criterion
          - id: AC-008
            type: acceptance-criterion
          - id: AC-009
            type: acceptance-criterion
          - id: AC-010
            type: acceptance-criterion
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: INV-001
            type: invariant
        tombstones: []
      - revision: 2
        active:
          - id: R-001
            type: requirement
          - id: R-002
            type: requirement
          - id: R-003
            type: requirement
          - id: R-004
            type: requirement
          - id: R-005
            type: requirement
          - id: R-006
            type: requirement
          - id: R-007
            type: requirement
          - id: AC-001
            type: acceptance-criterion
          - id: AC-002
            type: acceptance-criterion
          - id: AC-003
            type: acceptance-criterion
          - id: AC-004
            type: acceptance-criterion
          - id: AC-005
            type: acceptance-criterion
          - id: AC-006
            type: acceptance-criterion
          - id: AC-007
            type: acceptance-criterion
          - id: AC-008
            type: acceptance-criterion
          - id: AC-009
            type: acceptance-criterion
          - id: AC-010
            type: acceptance-criterion
          - id: AC-011
            type: acceptance-criterion
          - id: AC-012
            type: acceptance-criterion
          - id: AC-013
            type: acceptance-criterion
          - id: AC-014
            type: acceptance-criterion
          - id: AC-015
            type: acceptance-criterion
          - id: AC-016
            type: acceptance-criterion
          - id: D-001
            type: decision
          - id: D-002
            type: decision
          - id: D-003
            type: decision
          - id: D-004
            type: decision
          - id: D-005
            type: decision
          - id: INV-001
            type: invariant
        tombstones: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: *a3
    goals:
      - id: G-001
        statement: Independent Design and implemented UI review consume truthful current evidence without taking capture or write authority.
        task_refs:
          - TASK-001
          - TASK-002
          - TASK-003
          - TASK-004
          - TASK-005
          - TASK-006
          - TASK-007
    tasks:
      - id: TASK-001
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a6 []
        planned_paths: &a4
          - _refs/shared/ui-review.md
          - test/e2e/review-contract.test.mjs
          - test/e2e/support/ui-review-fixture.mjs
          - test/e2e/communication-economy.test.mjs
        planned_evidence:
          - id: EVIDENCE-017
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - R-007
              - INV-001
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
      - id: TASK-002
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a8
          - TASK-001
        planned_paths: &a7
          - _refs/shared/ui-review-contract.mjs
          - _refs/shared/repository-observation.mjs
          - _refs/simplify/repository-evidence.mjs
          - _refs/shared/design-verification.mjs
          - _refs/shared/review-contract.mjs
        planned_evidence:
          - id: EVIDENCE-018
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-006
              - INV-001
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-006
        enforces_invariant_refs:
          - INV-001
      - id: TASK-003
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a10
          - TASK-002
        planned_paths: &a9
          - _refs/shared/validation-map.mjs
          - _refs/angular/execution-contract.mjs
          - _refs/nextjs/execution-contract.mjs
          - _refs/orchestration/execution-contract.mjs
          - _refs/orchestration/repair-contract.mjs
          - _refs/shared/ship-readiness-contract.mjs
          - _refs/harness/communication-economy.mjs
          - test/e2e/support/test-track-forward-harness.mjs
        planned_evidence:
          - id: EVIDENCE-019
            record_refs:
              - R-001
              - R-003
              - R-004
              - R-005
              - R-006
              - INV-001
        justification_refs:
          - R-001
          - R-003
          - R-004
          - R-005
          - R-006
        enforces_invariant_refs:
          - INV-001
      - id: TASK-004
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a12
          - TASK-003
        planned_paths: &a11
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
        planned_evidence:
          - id: EVIDENCE-020
            record_refs:
              - R-001
              - R-002
              - R-003
              - R-004
              - R-005
              - R-006
              - INV-001
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
        enforces_invariant_refs:
          - INV-001
      - id: TASK-005
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a14
          - TASK-004
        planned_paths: &a13
          - authoring/evals/uiux/evidence.test.mjs
          - authoring/evals/uiux/README.md
          - authoring/evals/uiux/ui-review-integration.json
        planned_evidence:
          - id: EVIDENCE-021
            record_refs:
              - R-006
              - R-007
              - INV-001
        justification_refs:
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
      - id: TASK-006
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a16
          - TASK-005
        planned_paths: &a15
          - .claude/_refs/shared/ui-review.md
          - plugin/_refs/shared/ui-review.md
          - codex/skills/_refs/shared/ui-review.md
          - .claude/_refs/shared/ui-review-contract.mjs
          - plugin/_refs/shared/ui-review-contract.mjs
          - codex/skills/_refs/shared/ui-review-contract.mjs
          - .claude/_refs/shared/repository-observation.mjs
          - plugin/_refs/shared/repository-observation.mjs
          - codex/skills/_refs/shared/repository-observation.mjs
          - .claude/_refs/simplify/repository-evidence.mjs
          - plugin/_refs/simplify/repository-evidence.mjs
          - codex/skills/_refs/simplify/repository-evidence.mjs
          - .claude/_refs/shared/design-verification.mjs
          - plugin/_refs/shared/design-verification.mjs
          - codex/skills/_refs/shared/design-verification.mjs
          - .claude/_refs/shared/review-contract.mjs
          - plugin/_refs/shared/review-contract.mjs
          - codex/skills/_refs/shared/review-contract.mjs
          - .claude/_refs/shared/validation-map.mjs
          - plugin/_refs/shared/validation-map.mjs
          - codex/skills/_refs/shared/validation-map.mjs
          - .claude/_refs/angular/execution-contract.mjs
          - plugin/_refs/angular/execution-contract.mjs
          - codex/skills/_refs/angular/execution-contract.mjs
          - .claude/_refs/nextjs/execution-contract.mjs
          - plugin/_refs/nextjs/execution-contract.mjs
          - codex/skills/_refs/nextjs/execution-contract.mjs
          - .claude/_refs/orchestration/execution-contract.mjs
          - plugin/_refs/orchestration/execution-contract.mjs
          - codex/skills/_refs/orchestration/execution-contract.mjs
          - .claude/_refs/orchestration/repair-contract.mjs
          - plugin/_refs/orchestration/repair-contract.mjs
          - codex/skills/_refs/orchestration/repair-contract.mjs
          - .claude/_refs/shared/ship-readiness-contract.mjs
          - plugin/_refs/shared/ship-readiness-contract.mjs
          - codex/skills/_refs/shared/ship-readiness-contract.mjs
          - .claude/_refs/harness/communication-economy.mjs
          - plugin/_refs/harness/communication-economy.mjs
          - codex/skills/_refs/harness/communication-economy.mjs
          - .claude/_refs/design/uiux/index.md
          - plugin/_refs/design/uiux/index.md
          - codex/skills/_refs/design/uiux/index.md
          - .claude/_refs/shared/validation-map.md
          - plugin/_refs/shared/validation-map.md
          - codex/skills/_refs/shared/validation-map.md
          - .claude/_refs/shared/test-ui-evidence.md
          - plugin/_refs/shared/test-ui-evidence.md
          - codex/skills/_refs/shared/test-ui-evidence.md
          - .claude/_refs/shared/design-handoff.md
          - plugin/_refs/shared/design-handoff.md
          - codex/skills/_refs/shared/design-handoff.md
          - .claude/_refs/shared/frontend-architecture.md
          - plugin/_refs/shared/frontend-architecture.md
          - codex/skills/_refs/shared/frontend-architecture.md
          - .claude/_refs/angular/write-code/input-analysis.md
          - plugin/_refs/angular/write-code/input-analysis.md
          - codex/skills/_refs/angular/write-code/input-analysis.md
          - .claude/_refs/orchestration/tail/repair-loop.md
          - plugin/_refs/orchestration/tail/repair-loop.md
          - codex/skills/_refs/orchestration/tail/repair-loop.md
          - .claude/skills/sdcorejs-review/SKILL.md
          - plugin/skills/sdcorejs-review/SKILL.md
          - codex/skills/sdcorejs-review/SKILL.md
          - .claude/skills/sdcorejs-design/SKILL.md
          - plugin/skills/sdcorejs-design/SKILL.md
          - codex/skills/sdcorejs-design/SKILL.md
          - .claude/skills/sdcorejs-test/SKILL.md
          - plugin/skills/sdcorejs-test/SKILL.md
          - codex/skills/sdcorejs-test/SKILL.md
          - .claude/skills/sdcorejs-angular/SKILL.md
          - plugin/skills/sdcorejs-angular/SKILL.md
          - codex/skills/sdcorejs-angular/SKILL.md
          - .claude/skills/sdcorejs-nextjs/SKILL.md
          - plugin/skills/sdcorejs-nextjs/SKILL.md
          - codex/skills/sdcorejs-nextjs/SKILL.md
          - .claude/skills/sdcorejs-plan/SKILL.md
          - plugin/skills/sdcorejs-plan/SKILL.md
          - codex/skills/sdcorejs-plan/SKILL.md
          - .claude/skills/sdcorejs-execute-plan/SKILL.md
          - plugin/skills/sdcorejs-execute-plan/SKILL.md
          - codex/skills/sdcorejs-execute-plan/SKILL.md
          - .claude/skills/sdcorejs-repair-loop/SKILL.md
          - plugin/skills/sdcorejs-repair-loop/SKILL.md
          - codex/skills/sdcorejs-repair-loop/SKILL.md
          - .claude/skills/sdcorejs-ship/SKILL.md
          - plugin/skills/sdcorejs-ship/SKILL.md
          - codex/skills/sdcorejs-ship/SKILL.md
          - VALIDATION.md
        planned_evidence:
          - id: EVIDENCE-022
            record_refs:
              - R-006
              - R-007
              - INV-001
        justification_refs:
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
      - id: TASK-007
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        dependencies: &a18
          - TASK-006
        planned_paths: &a17
          - .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md
        planned_evidence:
          - id: EVIDENCE-001
            record_refs:
              - R-001
              - AC-001
              - INV-001
          - id: EVIDENCE-002
            record_refs:
              - R-002
              - AC-002
              - INV-001
          - id: EVIDENCE-003
            record_refs:
              - R-003
              - AC-003
              - INV-001
          - id: EVIDENCE-004
            record_refs:
              - R-003
              - AC-004
              - INV-001
          - id: EVIDENCE-005
            record_refs:
              - R-003
              - AC-005
              - INV-001
          - id: EVIDENCE-006
            record_refs:
              - R-003
              - AC-006
              - INV-001
          - id: EVIDENCE-007
            record_refs:
              - R-002
              - AC-007
              - INV-001
          - id: EVIDENCE-008
            record_refs:
              - R-004
              - AC-008
              - INV-001
          - id: EVIDENCE-009
            record_refs:
              - R-004
              - AC-009
              - INV-001
          - id: EVIDENCE-010
            record_refs:
              - R-001
              - AC-010
              - INV-001
          - id: EVIDENCE-011
            record_refs:
              - R-002
              - AC-011
              - INV-001
          - id: EVIDENCE-012
            record_refs:
              - R-005
              - AC-012
              - INV-001
          - id: EVIDENCE-013
            record_refs:
              - R-005
              - AC-013
              - INV-001
          - id: EVIDENCE-014
            record_refs:
              - R-007
              - AC-014
              - INV-001
          - id: EVIDENCE-015
            record_refs:
              - R-006
              - AC-015
              - INV-001
          - id: EVIDENCE-016
            record_refs:
              - R-007
              - AC-016
              - INV-001
        justification_refs:
          - R-001
          - R-002
          - R-003
          - R-004
          - R-005
          - R-006
          - R-007
        enforces_invariant_refs:
          - INV-001
    repository_inventory:
      repositories:
        - repository_id: github.com/sdcorejs/sdcorejs-agent
          existing_paths:
            - test/e2e/review-contract.test.mjs
            - test/e2e/communication-economy.test.mjs
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
            - .claude/_refs/simplify/repository-evidence.mjs
            - plugin/_refs/simplify/repository-evidence.mjs
            - codex/skills/_refs/simplify/repository-evidence.mjs
            - .claude/_refs/shared/design-verification.mjs
            - plugin/_refs/shared/design-verification.mjs
            - codex/skills/_refs/shared/design-verification.mjs
            - .claude/_refs/shared/review-contract.mjs
            - plugin/_refs/shared/review-contract.mjs
            - codex/skills/_refs/shared/review-contract.mjs
            - .claude/_refs/shared/validation-map.mjs
            - plugin/_refs/shared/validation-map.mjs
            - codex/skills/_refs/shared/validation-map.mjs
            - .claude/_refs/angular/execution-contract.mjs
            - plugin/_refs/angular/execution-contract.mjs
            - codex/skills/_refs/angular/execution-contract.mjs
            - .claude/_refs/nextjs/execution-contract.mjs
            - plugin/_refs/nextjs/execution-contract.mjs
            - codex/skills/_refs/nextjs/execution-contract.mjs
            - .claude/_refs/orchestration/execution-contract.mjs
            - plugin/_refs/orchestration/execution-contract.mjs
            - codex/skills/_refs/orchestration/execution-contract.mjs
            - .claude/_refs/orchestration/repair-contract.mjs
            - plugin/_refs/orchestration/repair-contract.mjs
            - codex/skills/_refs/orchestration/repair-contract.mjs
            - .claude/_refs/shared/ship-readiness-contract.mjs
            - plugin/_refs/shared/ship-readiness-contract.mjs
            - codex/skills/_refs/shared/ship-readiness-contract.mjs
            - .claude/_refs/harness/communication-economy.mjs
            - plugin/_refs/harness/communication-economy.mjs
            - codex/skills/_refs/harness/communication-economy.mjs
            - .claude/_refs/design/uiux/index.md
            - plugin/_refs/design/uiux/index.md
            - codex/skills/_refs/design/uiux/index.md
            - .claude/_refs/shared/validation-map.md
            - plugin/_refs/shared/validation-map.md
            - codex/skills/_refs/shared/validation-map.md
            - .claude/_refs/shared/test-ui-evidence.md
            - plugin/_refs/shared/test-ui-evidence.md
            - codex/skills/_refs/shared/test-ui-evidence.md
            - .claude/_refs/shared/design-handoff.md
            - plugin/_refs/shared/design-handoff.md
            - codex/skills/_refs/shared/design-handoff.md
            - .claude/_refs/shared/frontend-architecture.md
            - plugin/_refs/shared/frontend-architecture.md
            - codex/skills/_refs/shared/frontend-architecture.md
            - .claude/_refs/angular/write-code/input-analysis.md
            - plugin/_refs/angular/write-code/input-analysis.md
            - codex/skills/_refs/angular/write-code/input-analysis.md
            - .claude/_refs/orchestration/tail/repair-loop.md
            - plugin/_refs/orchestration/tail/repair-loop.md
            - codex/skills/_refs/orchestration/tail/repair-loop.md
            - .claude/skills/sdcorejs-review/SKILL.md
            - plugin/skills/sdcorejs-review/SKILL.md
            - codex/skills/sdcorejs-review/SKILL.md
            - .claude/skills/sdcorejs-design/SKILL.md
            - plugin/skills/sdcorejs-design/SKILL.md
            - codex/skills/sdcorejs-design/SKILL.md
            - .claude/skills/sdcorejs-test/SKILL.md
            - plugin/skills/sdcorejs-test/SKILL.md
            - codex/skills/sdcorejs-test/SKILL.md
            - .claude/skills/sdcorejs-angular/SKILL.md
            - plugin/skills/sdcorejs-angular/SKILL.md
            - codex/skills/sdcorejs-angular/SKILL.md
            - .claude/skills/sdcorejs-nextjs/SKILL.md
            - plugin/skills/sdcorejs-nextjs/SKILL.md
            - codex/skills/sdcorejs-nextjs/SKILL.md
            - .claude/skills/sdcorejs-plan/SKILL.md
            - plugin/skills/sdcorejs-plan/SKILL.md
            - codex/skills/sdcorejs-plan/SKILL.md
            - .claude/skills/sdcorejs-execute-plan/SKILL.md
            - plugin/skills/sdcorejs-execute-plan/SKILL.md
            - codex/skills/sdcorejs-execute-plan/SKILL.md
            - .claude/skills/sdcorejs-repair-loop/SKILL.md
            - plugin/skills/sdcorejs-repair-loop/SKILL.md
            - codex/skills/sdcorejs-repair-loop/SKILL.md
            - .claude/skills/sdcorejs-ship/SKILL.md
            - plugin/skills/sdcorejs-ship/SKILL.md
            - codex/skills/sdcorejs-ship/SKILL.md
            - VALIDATION.md
          intended_new_paths:
            - path: _refs/shared/ui-review.md
              owner_task_id: TASK-001
            - path: test/e2e/support/ui-review-fixture.mjs
              owner_task_id: TASK-001
            - path: _refs/shared/ui-review-contract.mjs
              owner_task_id: TASK-002
            - path: _refs/shared/repository-observation.mjs
              owner_task_id: TASK-002
            - path: authoring/evals/uiux/ui-review-integration.json
              owner_task_id: TASK-005
            - path: .claude/_refs/shared/ui-review.md
              owner_task_id: TASK-006
            - path: plugin/_refs/shared/ui-review.md
              owner_task_id: TASK-006
            - path: codex/skills/_refs/shared/ui-review.md
              owner_task_id: TASK-006
            - path: .claude/_refs/shared/ui-review-contract.mjs
              owner_task_id: TASK-006
            - path: plugin/_refs/shared/ui-review-contract.mjs
              owner_task_id: TASK-006
            - path: codex/skills/_refs/shared/ui-review-contract.mjs
              owner_task_id: TASK-006
            - path: .claude/_refs/shared/repository-observation.mjs
              owner_task_id: TASK-006
            - path: plugin/_refs/shared/repository-observation.mjs
              owner_task_id: TASK-006
            - path: codex/skills/_refs/shared/repository-observation.mjs
              owner_task_id: TASK-006
            - path: .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md
              owner_task_id: TASK-007
    critique_history:
      - round: 1
        checker_version: sdcorejs-plan:goal-backward:v1
        blockers: []
        resolved_blockers: []
        unresolved_blockers: []
  validation_map:
    - requirement_id: R-001
      acceptance_criterion_id: AC-001
      invariant_refs:
        - INV-001
      risk: review-evidence-and-write-authority
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a1
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-ui-review-independence
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Self-critique cannot satisfy a required independent review. A separate reviewer context is used when supported; otherwise the report preserves the limitation and cannot claim that the required separation ran. A different model/provider is not required.
      status: covered
      evidence_refs:
        - EVIDENCE-001
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-002
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-purposes
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Design-artifact review traces requirements/AC to flows/screens/states/copy/responsive/accessibility/component mappings. Implemented-UI conformance compares actual implementation with a verified approved design or an explicit authorized visual contract. Ordinary review remains supported.
      status: covered
      evidence_refs:
        - EVIDENCE-002
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-003
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-source-limits
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Source-only evidence cannot yield rendered or interaction PASS for clipping, actual contrast, responsive rendering, focus behavior, or keyboard flow; missing evidence is a verification gap, not an observed defect.
      status: covered
      evidence_refs:
        - EVIDENCE-003
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-004
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-mockup-denial
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Generated/static mockups and wireframe renders remain distinct from real product captures; substitution fails closed.
      status: covered
      evidence_refs:
        - EVIDENCE-004
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-005
      invariant_refs:
        - INV-001
      risk: review-evidence-and-write-authority
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a1
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-ui-review-target-provenance
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Missing or mismatched owner, screen, state, viewport, command/run, source/build/content identity or observed artifact provenance cannot satisfy a required check. No caller-supplied PASS or hash alone establishes verified evidence.
      status: covered
      evidence_refs:
        - EVIDENCE-005
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-003
      acceptance_criterion_id: AC-006
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-content-staleness
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: An actual source edit at the same HEAD makes relevant capture/review evidence stale. A fresh focused run and reassessment restore only the proof they actually establish.
      status: covered
      evidence_refs:
        - EVIDENCE-006
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-007
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-missing-baseline
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Missing design still permits scoped source/UI assessment. Design conformance is unavailable when a relevant baseline is missing, or not-applicable with a valid reason when no comparison applies. Neither state fabricates an approved baseline or forces new Design work.
      status: covered
      evidence_refs:
        - EVIDENCE-007
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-008
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-aesthetic-advisory
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Aesthetic preference cannot be blocking, auto-repairable, or write-authorizing. Existing aesthetic and narrow-dimension controls continue to pass.
      status: covered
      evidence_refs:
        - EVIDENCE-008
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-004
      acceptance_criterion_id: AC-009
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-conformance-classification
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: A demonstrated approved behavior/invariant violation cannot be reclassified as aesthetic to avoid its gate. Missing observation remains a verification gap with locator, evidence, impact, severity/gate, repair tier and suggested action.
      status: covered
      evidence_refs:
        - EVIDENCE-009
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-001
      acceptance_criterion_id: AC-010
      invariant_refs:
        - INV-001
      risk: review-evidence-and-write-authority
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a1
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-ui-review-observed-read-only
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Direct review changes no source and persists no report/artifact without applicable authority. Declarations alone do not prove no writes; trusted before/after observation must catch writes omitted from declarations.
      status: covered
      evidence_refs:
        - EVIDENCE-010
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-002
      acceptance_criterion_id: AC-011
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-narrow-scope
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: A security/accessibility or otherwise narrow review retains its requested dimensions, files and topics and never expands to ALL or unrelated UI work.
      status: covered
      evidence_refs:
        - EVIDENCE-011
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-012
      invariant_refs:
        - INV-001
      risk: review-evidence-and-write-authority
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a1
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-ui-review-real-consumers
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Angular, Next.js and generic frontend consumers share purpose/evidence semantics; stack checks are additive only. Plan/validation applicability controls required checks. Required UI/design gaps reach ship, and deferral requires the existing authority/risk policy. Review completed or schema valid never means blocker-free.
      status: covered
      evidence_refs:
        - EVIDENCE-012
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-005
      acceptance_criterion_id: AC-013
      invariant_refs:
        - INV-001
      risk: review-evidence-and-write-authority
      boundary:
        kind: authorization
        approval_ref: D-004
        source_refs: *a1
      authorization_boundary: true
      levels:
        - integration
        - api-e2e
      case_ids:
        - case-ui-review-owner-repair
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Review-only UI checks cannot silently fix source. Any permitted repair uses the existing owner/scope contract, invalidates affected UI evidence and does not restart simplify after repair.
      status: covered
      evidence_refs:
        - EVIDENCE-013
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-014
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-smoke-fixtures
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Action popover, mobile table selection, and standalone responsive page scenarios exercise documented payload -> helper -> consumer, including positive evidence, missing/stale evidence and scope/authority mutations. Fixtures do not modify product repositories or claim live rendering.
      status: covered
      evidence_refs:
        - EVIDENCE-014
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-006
      acceptance_criterion_id: AC-015
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-legacy-history
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Legacy ordinary reviews stay readable but do not acquire verified UI proof. Unknown or contradictory UI payloads fail closed. Approved artifacts and prior evidence records remain unchanged; new current authoring evidence is separately recorded and independently checked.
      status: covered
      evidence_refs:
        - EVIDENCE-015
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
    - requirement_id: R-007
      acceptance_criterion_id: AC-016
      invariant_refs:
        - INV-001
      risk: ui-contract-preservation
      boundary:
        kind: none
        approval_ref: D-005
        source_refs: *a2
      authorization_boundary: false
      levels:
        - unit
        - integration
      case_ids:
        - case-ui-review-scope-and-checks
      planned_command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
      command_source: project-doc
      cwd: .
      evidence_class: UNIT
      automation: automated
      expected_proof: Relevant regression, authoring/UIUX, consumer, schema, mirror, hygiene and executable-reference commands have actual PASS/FAIL/NOT RUN results. Public skill count remains 23; no dependency/browser installation, live/paid service, commit or push occurs.
      status: covered
      evidence_refs:
        - EVIDENCE-016
      rationale: Direct local Node helper-to-consumer boundary proof. api-e2e means the exported repository contract API, not an HTTP server, browser or target-product run.
      owner: null
      acknowledgement_required: false
      module_e2e: false
      module_id: null
      owner_repository_id: null
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
  approved_spec_hash: sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497
  approved_spec_reference:
    immutable_identity:
      repository_id: github.com/sdcorejs/sdcorejs-agent
      repository_relative_path: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
      artifact_id: spec-ui-review-contract-20260923-r1
      revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
      approval_hash: sha256:v1:a42812e1840b2d5b4534f8f69d284477e716868b7f2f6cb9f4d778b30125a497
  approved_architecture_path: .sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md
  approved_architecture_hash: sha256:v1:e34f970eb82fada628bce8c7fdd655d3ac9511bb7b949d3727a76c65ba8fcb52
  approved_architecture_reference:
    repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: architecture-ui-review-contract-20260923-r1
    artifact_kind: architecture
    revision: 1054c8180f15b140c7224e48d0f21514c5787ab8
    approval_hash: sha256:v1:e34f970eb82fada628bce8c7fdd655d3ac9511bb7b949d3727a76c65ba8fcb52
  approved_plan_path: null
  approved_plan_hash: null
  supersedes: null
  target_root: .
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  dependency_order:
    - TASK-001
    - TASK-002
    - TASK-003
    - TASK-004
    - TASK-005
    - TASK-006
    - TASK-007
  gitlink_updates_in_scope: false
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 7
  phase_count: 4
  allowed_paths:
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
    - .claude/_refs/shared/ui-review.md
    - plugin/_refs/shared/ui-review.md
    - codex/skills/_refs/shared/ui-review.md
    - .claude/_refs/shared/ui-review-contract.mjs
    - plugin/_refs/shared/ui-review-contract.mjs
    - codex/skills/_refs/shared/ui-review-contract.mjs
    - .claude/_refs/shared/repository-observation.mjs
    - plugin/_refs/shared/repository-observation.mjs
    - codex/skills/_refs/shared/repository-observation.mjs
    - .claude/_refs/simplify/repository-evidence.mjs
    - plugin/_refs/simplify/repository-evidence.mjs
    - codex/skills/_refs/simplify/repository-evidence.mjs
    - .claude/_refs/shared/design-verification.mjs
    - plugin/_refs/shared/design-verification.mjs
    - codex/skills/_refs/shared/design-verification.mjs
    - .claude/_refs/shared/review-contract.mjs
    - plugin/_refs/shared/review-contract.mjs
    - codex/skills/_refs/shared/review-contract.mjs
    - .claude/_refs/shared/validation-map.mjs
    - plugin/_refs/shared/validation-map.mjs
    - codex/skills/_refs/shared/validation-map.mjs
    - .claude/_refs/angular/execution-contract.mjs
    - plugin/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/angular/execution-contract.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/orchestration/repair-contract.mjs
    - plugin/_refs/orchestration/repair-contract.mjs
    - codex/skills/_refs/orchestration/repair-contract.mjs
    - .claude/_refs/shared/ship-readiness-contract.mjs
    - plugin/_refs/shared/ship-readiness-contract.mjs
    - codex/skills/_refs/shared/ship-readiness-contract.mjs
    - .claude/_refs/harness/communication-economy.mjs
    - plugin/_refs/harness/communication-economy.mjs
    - codex/skills/_refs/harness/communication-economy.mjs
    - .claude/_refs/design/uiux/index.md
    - plugin/_refs/design/uiux/index.md
    - codex/skills/_refs/design/uiux/index.md
    - .claude/_refs/shared/validation-map.md
    - plugin/_refs/shared/validation-map.md
    - codex/skills/_refs/shared/validation-map.md
    - .claude/_refs/shared/test-ui-evidence.md
    - plugin/_refs/shared/test-ui-evidence.md
    - codex/skills/_refs/shared/test-ui-evidence.md
    - .claude/_refs/shared/design-handoff.md
    - plugin/_refs/shared/design-handoff.md
    - codex/skills/_refs/shared/design-handoff.md
    - .claude/_refs/shared/frontend-architecture.md
    - plugin/_refs/shared/frontend-architecture.md
    - codex/skills/_refs/shared/frontend-architecture.md
    - .claude/_refs/angular/write-code/input-analysis.md
    - plugin/_refs/angular/write-code/input-analysis.md
    - codex/skills/_refs/angular/write-code/input-analysis.md
    - .claude/_refs/orchestration/tail/repair-loop.md
    - plugin/_refs/orchestration/tail/repair-loop.md
    - codex/skills/_refs/orchestration/tail/repair-loop.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - codex/skills/sdcorejs-review/SKILL.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - codex/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-test/SKILL.md
    - plugin/skills/sdcorejs-test/SKILL.md
    - codex/skills/sdcorejs-test/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-plan/SKILL.md
    - plugin/skills/sdcorejs-plan/SKILL.md
    - codex/skills/sdcorejs-plan/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
    - .claude/skills/sdcorejs-repair-loop/SKILL.md
    - plugin/skills/sdcorejs-repair-loop/SKILL.md
    - codex/skills/sdcorejs-repair-loop/SKILL.md
    - .claude/skills/sdcorejs-ship/SKILL.md
    - plugin/skills/sdcorejs-ship/SKILL.md
    - codex/skills/sdcorejs-ship/SKILL.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md
  prohibited_paths: &a5
    - AGENTS.md
    - CLAUDE.md
    - package.json
    - package-lock.json
    - site/**
    - node_modules/**
    - .git/**
    - .env
    - .env.*
    - _refs/shared/system-registry.json
    - _refs/shared/approved-artifact.mjs
    - _refs/shared/artifact-paths.mjs
    - _refs/shared/decision-coverage.mjs
    - _refs/shared/architecture-contract.mjs
    - _refs/shared/repository-contract.mjs
    - _refs/shared/design-handoff.mjs
    - _refs/simplify/simplify-contract.mjs
    - skills/shared/workflow/simplify.md
    - authoring/evals/uiux/records.json
    - authoring/evals/uiux/design-handoff-integration.json
    - authoring/evals/records/**
    - authoring/evals/snapshots/**
    - authoring/evals/transcripts/**
    - test/e2e/uiux-knowledge.test.mjs
    - test/e2e/uiux-review-regression.test.mjs
    - test/e2e/uiux-skill-creator-regression.test.mjs
    - .sdcorejs/specs/**
    - .sdcorejs/architecture/**
    - .sdcorejs/plans/**
    - .sdcorejs/conventions/**
    - .sdcorejs/summary.md
  generated_artifacts:
    - .claude/_refs/shared/ui-review.md
    - plugin/_refs/shared/ui-review.md
    - codex/skills/_refs/shared/ui-review.md
    - .claude/_refs/shared/ui-review-contract.mjs
    - plugin/_refs/shared/ui-review-contract.mjs
    - codex/skills/_refs/shared/ui-review-contract.mjs
    - .claude/_refs/shared/repository-observation.mjs
    - plugin/_refs/shared/repository-observation.mjs
    - codex/skills/_refs/shared/repository-observation.mjs
    - .claude/_refs/simplify/repository-evidence.mjs
    - plugin/_refs/simplify/repository-evidence.mjs
    - codex/skills/_refs/simplify/repository-evidence.mjs
    - .claude/_refs/shared/design-verification.mjs
    - plugin/_refs/shared/design-verification.mjs
    - codex/skills/_refs/shared/design-verification.mjs
    - .claude/_refs/shared/review-contract.mjs
    - plugin/_refs/shared/review-contract.mjs
    - codex/skills/_refs/shared/review-contract.mjs
    - .claude/_refs/shared/validation-map.mjs
    - plugin/_refs/shared/validation-map.mjs
    - codex/skills/_refs/shared/validation-map.mjs
    - .claude/_refs/angular/execution-contract.mjs
    - plugin/_refs/angular/execution-contract.mjs
    - codex/skills/_refs/angular/execution-contract.mjs
    - .claude/_refs/nextjs/execution-contract.mjs
    - plugin/_refs/nextjs/execution-contract.mjs
    - codex/skills/_refs/nextjs/execution-contract.mjs
    - .claude/_refs/orchestration/execution-contract.mjs
    - plugin/_refs/orchestration/execution-contract.mjs
    - codex/skills/_refs/orchestration/execution-contract.mjs
    - .claude/_refs/orchestration/repair-contract.mjs
    - plugin/_refs/orchestration/repair-contract.mjs
    - codex/skills/_refs/orchestration/repair-contract.mjs
    - .claude/_refs/shared/ship-readiness-contract.mjs
    - plugin/_refs/shared/ship-readiness-contract.mjs
    - codex/skills/_refs/shared/ship-readiness-contract.mjs
    - .claude/_refs/harness/communication-economy.mjs
    - plugin/_refs/harness/communication-economy.mjs
    - codex/skills/_refs/harness/communication-economy.mjs
    - .claude/_refs/design/uiux/index.md
    - plugin/_refs/design/uiux/index.md
    - codex/skills/_refs/design/uiux/index.md
    - .claude/_refs/shared/validation-map.md
    - plugin/_refs/shared/validation-map.md
    - codex/skills/_refs/shared/validation-map.md
    - .claude/_refs/shared/test-ui-evidence.md
    - plugin/_refs/shared/test-ui-evidence.md
    - codex/skills/_refs/shared/test-ui-evidence.md
    - .claude/_refs/shared/design-handoff.md
    - plugin/_refs/shared/design-handoff.md
    - codex/skills/_refs/shared/design-handoff.md
    - .claude/_refs/shared/frontend-architecture.md
    - plugin/_refs/shared/frontend-architecture.md
    - codex/skills/_refs/shared/frontend-architecture.md
    - .claude/_refs/angular/write-code/input-analysis.md
    - plugin/_refs/angular/write-code/input-analysis.md
    - codex/skills/_refs/angular/write-code/input-analysis.md
    - .claude/_refs/orchestration/tail/repair-loop.md
    - plugin/_refs/orchestration/tail/repair-loop.md
    - codex/skills/_refs/orchestration/tail/repair-loop.md
    - .claude/skills/sdcorejs-review/SKILL.md
    - plugin/skills/sdcorejs-review/SKILL.md
    - codex/skills/sdcorejs-review/SKILL.md
    - .claude/skills/sdcorejs-design/SKILL.md
    - plugin/skills/sdcorejs-design/SKILL.md
    - codex/skills/sdcorejs-design/SKILL.md
    - .claude/skills/sdcorejs-test/SKILL.md
    - plugin/skills/sdcorejs-test/SKILL.md
    - codex/skills/sdcorejs-test/SKILL.md
    - .claude/skills/sdcorejs-angular/SKILL.md
    - plugin/skills/sdcorejs-angular/SKILL.md
    - codex/skills/sdcorejs-angular/SKILL.md
    - .claude/skills/sdcorejs-nextjs/SKILL.md
    - plugin/skills/sdcorejs-nextjs/SKILL.md
    - codex/skills/sdcorejs-nextjs/SKILL.md
    - .claude/skills/sdcorejs-plan/SKILL.md
    - plugin/skills/sdcorejs-plan/SKILL.md
    - codex/skills/sdcorejs-plan/SKILL.md
    - .claude/skills/sdcorejs-execute-plan/SKILL.md
    - plugin/skills/sdcorejs-execute-plan/SKILL.md
    - codex/skills/sdcorejs-execute-plan/SKILL.md
    - .claude/skills/sdcorejs-repair-loop/SKILL.md
    - plugin/skills/sdcorejs-repair-loop/SKILL.md
    - codex/skills/sdcorejs-repair-loop/SKILL.md
    - .claude/skills/sdcorejs-ship/SKILL.md
    - plugin/skills/sdcorejs-ship/SKILL.md
    - codex/skills/sdcorejs-ship/SKILL.md
  docs_artifacts:
    - _refs/shared/ui-review.md
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
    - authoring/evals/uiux/README.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: Explicit compatibility only; no approved or historical artifact migration.
    approval_required: false
  frontend_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: Workflow/contract authoring with offline fixtures; no product frontend component implementation.
  agent_architecture:
    required: false
    conformance_invariant_refs: []
    not_applicable_reason: No AI-agent runtime application implementation.
    contract: null
  verification_strategy:
    package_manager: npm
    package_manager_evidence: package.json packageManager npm@10.9.2 and existing package-lock.json; Node v24.19.0 is installed and satisfies engines.
    coverage_approach: TDD
    commands_planned:
      - command: node --test --test-concurrency=1 test/e2e/review-contract.test.mjs test/e2e/validation-map-contract.test.mjs test/e2e/repair-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/angular-production-contract.test.mjs test/e2e/nextjs-production-contract.test.mjs test/e2e/production-readiness-contract.test.mjs test/e2e/communication-economy.test.mjs
        source: project-doc
        cwd: .
        reason: Mapped UI review cases plus existing real consumer and portable compatibility controls.
      - command: node --test --test-concurrency=1 test/e2e/simplify-protected-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/design-handoff-contract.test.mjs test/e2e/artifact-path-convention.test.mjs test/e2e/git-closure-contract.test.mjs
        source: project-doc
        cwd: .
        reason: Preserve the prior simplify and Design guarantees after bounded observation reuse.
      - command: node --test --test-reporter=tap test/e2e/uiux-knowledge.test.mjs test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-skill-creator-regression.test.mjs test/e2e/review-contract.test.mjs
        source: project-doc
        cwd: .
        reason: Actual transcript and current-source manifest for the new append-only UI review evidence record.
      - command: npm run test:e2e:uiux
        source: package.json
        cwd: .
        reason: Historical integrity plus the separate current integration record.
      - command: npm run test:e2e:skill-authoring
        source: package.json
        cwd: .
        reason: Public inventory, authoring contracts and internal non-distribution.
      - command: node authoring/evals/run-deterministic.mjs
        source: project-doc
        cwd: .
        reason: Existing offline routing/authority mutation matrix; zero provider calls.
      - command: npm run report:communication-economy
        source: package.json
        cwd: .
        reason: Measure the two existing current-value cells only.
      - command: npm run sync:skills
        source: package.json
        cwd: .
        reason: Generate mirrors from stabilized canonical sources.
      - command: npm run check:skills
        source: package.json
        cwd: .
        reason: Mirror, schema and 23-public-skill inventory verification.
      - command: npm run check:text-hygiene
        source: package.json
        cwd: .
        reason: Source language/encoding and hygiene.
      - command: npm run check:executable-references
        source: package.json
        cwd: .
        reason: Executable references/import closure.
      - command: git diff --check
        source: project-doc
        cwd: .
        reason: Whitespace and diff hygiene.
    commands_skipped:
      - command: npm test / npm run test:e2e:repository
        reason: Unrelated full repository and generated-product golden matrix is outside this bounded step; affected suites are explicit above.
      - command: Browser/real-product rendered or interaction execution; live/paid provider runs
        reason: Fixture-only contract change; user prohibits browser/dependency installation and live/paid services. Report NOT RUN.
    checks: RED before source changes, then paired positive/negative consumer cases; current content receipts and strict preservation/mirror checks.
  execution_policy: sequential
  parallel_candidates:
    allowed: false
    units: []
    shared_files:
      - path: _refs/shared/ui-review.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/ui-review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/repository-observation.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/simplify/repository-evidence.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/validation-map.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/orchestration/repair-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/ship-readiness-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/harness/communication-economy.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/shared/workflow/review.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/tracks/design/sdcorejs-design.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/tracks/test/sdcorejs-test.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/tracks/angular/sdcorejs-angular.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/tracks/nextjs/sdcorejs-nextjs.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/shared/sdlc/03-plan.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/shared/sdlc/04-execute-plan.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/orchestration/repair-loop.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: skills/shared/workflow/ship.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/design/uiux/index.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/validation-map.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/test-ui-evidence.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/angular/write-code/input-analysis.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: _refs/orchestration/tail/repair-loop.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: authoring/evals/uiux/evidence.test.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: authoring/evals/uiux/README.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: authoring/evals/uiux/ui-review-integration.json
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/ui-review.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/ui-review.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/ui-review.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/ui-review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/ui-review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/ui-review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/repository-observation.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/repository-observation.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/repository-observation.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/simplify/repository-evidence.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/simplify/repository-evidence.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/simplify/repository-evidence.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/design-verification.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/review-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/validation-map.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/validation-map.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/validation-map.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/angular/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/nextjs/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/orchestration/execution-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/orchestration/repair-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/orchestration/repair-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/orchestration/repair-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/ship-readiness-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/ship-readiness-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/ship-readiness-contract.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/harness/communication-economy.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/harness/communication-economy.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/harness/communication-economy.mjs
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/design/uiux/index.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/design/uiux/index.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/design/uiux/index.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/validation-map.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/validation-map.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/validation-map.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/test-ui-evidence.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/test-ui-evidence.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/test-ui-evidence.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/design-handoff.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/shared/frontend-architecture.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/angular/write-code/input-analysis.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/angular/write-code/input-analysis.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/angular/write-code/input-analysis.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/_refs/orchestration/tail/repair-loop.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/_refs/orchestration/tail/repair-loop.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/_refs/orchestration/tail/repair-loop.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-review/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-review/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-review/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-design/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-test/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-test/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-test/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-angular/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-nextjs/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-execute-plan/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-repair-loop/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-repair-loop/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-repair-loop/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .claude/skills/sdcorejs-ship/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: plugin/skills/sdcorejs-ship/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: codex/skills/sdcorejs-ship/SKILL.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: VALIDATION.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
      - path: .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-delivery.md
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        coordination_strategy: Single sequential task owner; mirrors script-only; historical evidence immutable.
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
    dependency_order:
      - TASK-001
      - TASK-002
      - TASK-003
      - TASK-004
      - TASK-005
      - TASK-006
      - TASK-007
    gitlink_updates_in_scope: false
    repositories:
      - repository_id: github.com/sdcorejs/sdcorejs-agent
        role: standalone
        module_id: null
        available: true
        writable: true
    steps:
      - id: TASK-001
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a4
        prohibited_paths: *a5
        depends_on: *a6
      - id: TASK-002
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a7
        prohibited_paths: *a5
        depends_on: *a8
      - id: TASK-003
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a9
        prohibited_paths: *a5
        depends_on: *a10
      - id: TASK-004
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a11
        prohibited_paths: *a5
        depends_on: *a12
      - id: TASK-005
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a13
        prohibited_paths: *a5
        depends_on: *a14
      - id: TASK-006
        action: EDIT
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a15
        prohibited_paths: *a5
        depends_on: *a16
      - id: TASK-007
        action: CREATE
        owner_repository_id: github.com/sdcorejs/sdcorejs-agent
        semantic_scope: repository
        git_roots:
          - github.com/sdcorejs/sdcorejs-agent
        git_root_path: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
        allowed_paths: *a17
        prohibited_paths: *a5
        depends_on: *a18
  finish_tail:
    contract:
      docs_before_final_branch_ready: true
      verify_before_done: true
      branch_ready_final_gate: true
      no_writes_after_branch_ready: true
    known_blockers: Existing UIUX integration evidence is stale (26 PASS / 1 FAIL baseline); append truthful current evidence, preserve history. Do not claim unrelated checks or Git readiness.
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Artifact lifecycle

```yaml
artifact_context:
  schema_version: 1
  change_ref: ui-review-contract-20260923
  source_spec: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
  source_plan: none
  required_with_change:
    - path: .sdcorejs/docs/workflow/2026-09-23-17-20-ui-review-contract-spec.md
      kind: execution-doc
      reason: Current approved requirements and pending architecture gate
    - path: .sdcorejs/specs/workflow/2026-09-23-17-25-ui-review-contract.md
      kind: spec
      reason: Current approved requirements and pending architecture gate
    - path: .sdcorejs/docs/architecture/2026-09-23-17-25-ui-review-contract-architecture.md
      kind: execution-doc
      reason: Current approved requirements and pending architecture gate
    - path: .sdcorejs/architecture/workflow/2026-09-23-17-34-ui-review-contract.md
      kind: architecture
      reason: Approved architecture parent for the implementation plan.
    - path: .sdcorejs/docs/workflow/2026-09-23-17-41-ui-review-contract-plan.md
      kind: execution-doc
      reason: Exact UI review implementation plan awaiting explicit approval.
  shared_owned: []
  conditional: []
  local_only: []
  unrelated_observed: []
```
