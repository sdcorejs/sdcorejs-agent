---
name: sdcorejs-repair-loop
description: Bounded owner-scoped repair workflow for selected findings from sdcorejs-review, external human/PR/agent feedback, sdcorejs-ship, supported implementation tracks, simplify output, and product/design/test/documentation/workflow artifacts. Verifies claims, authority, and evidence, repairs within registry-supported scope, re-runs source-specific validation, and escalates at the attempt cap. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, agent.resume
---

# Repair Loop


## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and load only the references needed by
the scoped finding.

Thin dispatch skill for applying findings and re-verifying them. The detailed loop lives in `_refs/orchestration/tail/repair-loop.md`.

Resolve supported tracks from `_refs/shared/system-registry.json`; do not keep a
framework-only enum. Validate every repair with
`_refs/orchestration/repair-contract.mjs`, which binds the original evidence,
artifact/implementation owner, execution host, approved write scope, bounded
attempts, and repaired evidence linkage.

## Workflow
1. Determine and preserve the source of findings: `review-code`, `external-review-feedback`, `verify-before-done`, `linter`, `typecheck`, `test`, or `manual`.
2. Read `_refs/orchestration/tail/repair-loop.md` completely.
3. If the source is `sdcorejs-review`, preserve the original `review_context` exactly, including `track`, `track_profile`, dimensions, mode, `file_scope`, refs loaded/skipped, probes run/skipped, and package manager.
   Preserve any `test_context`, `test_status`, `test_evidence`,
   `ui_capture_context`, `ai_agent_context`, `simplify_context`,
   `convention_context`, and `artifact_context` exactly as source evidence;
   append new run/case evidence after repair instead of overwriting or upgrading
   stale/blocked results.
4. Record the working-tree baseline and a visible Repair ledger before edits.
5. Verify each finding is genuine before changing code and classify it as `VALID`, `STALE`, `MIS-SCOPED`, `REDUNDANT`, `UNCLEAR`, or `CONFLICTING`.
   For external feedback, preserve review ID/reviewer/base revision/file scope and
   sanitized original feedback, re-read current evidence, then use
   `evaluateExternalReviewFeedback`; evidence must bind repository, current
   revision, safe path, locator, and content hash through the trusted snapshot.
   Classification fields, normalized conflicts, proposed-change kind, and any
   migration-decision identity must match a canonical
   `repair-review-assessment:v1` artifact from the independent verifier. Caller
   relabeling or decision substitution invalidates write eligibility. An
   incorrect claim receives cited technical pushback and no write.
6. Categorize valid findings into `auto`, `confirm`, or `user-decision` tiers.
   A review finding must also be explicitly selected for repair and carry
   matching artifact-backed write authority; `confirm` and `user-decision`
   tiers require their own actor-, finding-, revision-, kind-, and scope-bound
   approval. Resolve `{artifact_ref, approval_hash}` only from the trusted
   `approval_artifacts` loader and verify its canonical artifact hash; a
   nonexistent reference, inline body, review output, or boolean is not
   authorization.
7. For a single `VALID` finding that becomes a concrete bug investigation, call
   `sdcorejs-debug` with the preserved `repair_source`, `review_context`,
   finding ID/source, original commands, and package-manager evidence; consume
   its redacted `debug_context` before continuing.
8. Apply only inside the intersection of feedback, finding, and owner-approved
   scopes. Resolve current and repaired paths, locators, revisions, and hashes
   from a canonical trusted repository-snapshot artifact. Record a nonempty
   pre/post hash manifest and independently compared test-contract hashes/
   assertion IDs, then derive validation status from a canonical trusted
   command receipt for the exact source-specific command.
   Use the smallest relevant discovered command first and associate new
   evidence with the repaired diff.
9. Iterate until blocking findings are fixed, explicitly deferred, or the reference's 3-pass convergence cap is reached. Blocking means `Critical`/`Important` in the default review format, or `BLOCKER`/`REQUIRED` in Angular/NestJS code-review table mode.

## Handoff
- After convergence, return to the caller's tail chain.
- If invoked from a finish-gate review, complete write-producing documentation, auto-docs, user guide, task tracker, and memory steps first, then run `sdcorejs-ship (verify-before-done mode)` and `sdcorejs-ship (branch-ready mode)` as the final read-only gate over the final diff. No writes after branch-ready unless branch-ready is run again.
- If invoked directly by the user, run discovered verification commands and offer explicit numbered next steps: run `sdcorejs-ship (verify-before-done mode)`, stop after the repair summary, or prepare a commit only after ship and branch-ready pass for the current `HEAD` or diff.
- If `sdcorejs-debug` was used inside the loop, carry its `debug_context` into
  the repair summary and subsequent ship gates.
- If findings do not converge after the capped loop, stop and ask the user to choose the next direction.
- Do not hand off directly to `sdcorejs-git (commit mode)` by default. A commit is allowed only after ship verification and branch-ready passed for the current `HEAD` or diff, or after the caller explicitly requested a commit after those gates with any verification deferral recorded.

## Rules
- Silence is not approval.
- Do not silently apply user-decision findings.
- Do not edit tests merely to make production code pass.
- Do not hide stale, mis-scoped, redundant, or unclear findings; report them separately.
- External feedback existence is not write authority. Do not patch stale,
  not-applicable, incorrect, unclear, or conflicting feedback, and select a
  write tier only after current technical evidence classifies it as correct.
- Reject unsafe or traversal paths, empty change sets, missing repaired
  evidence, and any removed test assertion. A `tests_weakened: false` claim is
  not integrity evidence.
- Do not claim convergence without re-running the source-specific verification.
- Do not write outside the semantic owner repository, mutate approved
  specs/plans, widen allowed paths, or unlink repaired evidence from the
  original failing evidence.
- Do not downgrade or reclassify the original `review_context`; repair-loop must not change a `plain-*` review into an SDCoreJS-specific review during re-verification.
- When `ai_agent_context` is present, do not change resolved profiles, trust
  sources, provider storage, tool authority, approvals, state isolation,
  evidence rules, limits, or security thresholds to make a finding disappear.
  A required contract/policy change returns through `sdcorejs-spec` and
  `sdcorejs-plan`; only plan-scoped implementation defects may be repaired.
- When `convention_context` is present, preserve the original rule source,
  status, evidence, ownership, and public-contract/compatibility classification.
  Classify each convention finding as valid, stale, mis-scoped, redundant,
  unclear, a conflict needing a user decision, a public-contract migration, or
  spec/plan work before editing. Automatic repair is limited to bounded,
  behavior-preserving findings with clear current authority. A public API route,
  external event field, database column, persisted enum, permission code,
  environment variable, queue or topic name, or public package export rename is
  never a blind repair: report the migration, deprecation, compatibility layer,
  or specification decision instead. Never edit an accepted convention rule to
  make a finding disappear, and pass the final `convention_context` to the
  separate convention sync step.
- When `simplify_context` is present, preserve the original
  `simplify_context` exactly. Do not turn behavior-preserving refinement into a
  semantic refactor, widen its scope, or change protected contracts. Every
  repair write makes affected simplification/test/review evidence stale and
  requires the source-specific verification to run again. Architecture or
  public-behavior changes return to spec/plan.
