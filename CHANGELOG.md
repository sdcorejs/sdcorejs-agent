# Changelog

All notable changes to this repository should be documented here.

This project uses GitHub tags/releases for adopted versions. The root npm
package is private and is not published to npm.

## Unreleased

- Refactor `sdcorejs-product` from generic Seed/Update/Audit document generation
  into seven explicit contract actions with mechanically distinct normative,
  derived-sync, UAT, supersession, and zero-write audit boundaries.
- Preserve approved requirement authority, stable contract/revision/AC identity,
  collision-safe active/history ledgers, non-destructive legacy discovery, and
  existing target-product layouts while retaining legacy status projections.
- Add deterministic product context, evidence freshness, independent
  implementation/verification/UAT status, artifact/gap roles, redaction, and
  false-ready prevention through a Node built-in protocol and mutation suite.
- Require file-backed approved-spec/current-state authority, canonical
  body/integrity/path hashes, approved-plan identity through test and product
  evidence, closed traceability rows, row-bound not-applicable decisions,
  file-hashed UAT scenarios, and parent-observed execution/build identity.
- Integrate parent-observed not-applicable decision authority into multi-row
  feature derivation and final authorization, consuming one opaque capability
  across the complete bound decision set and rejecting missing or replayed
  observers.
- Fail closed on malformed product boundaries and contradictory row verdicts;
  redact before pre-write authorization, write only the authorized redacted
  payload, then re-read, re-redact, and reauthorize final evidence/readiness.
  Final product authorization also re-reads the exact approved plan and its
  spec chain after observer waits instead of trusting caller-carried hashes,
  and binds context/persisted paths to the file-observed plan allow/prohibit
  scope with conservative glob containment.
- Bind approved plans and frozen parallel ownership to independently verified
  paths, hashes, feature/executor identity, side effects, artifacts, commands,
  safe scope, and immutable contract revisions;
  add one-shot state-bound read-only and user-decision proof, stable repository
  identity, Git metadata/object-store and empty-directory snapshots, pairwise
  realpath isolation, case-aware ownership, verified repair transfer, strict
  rename/path validation, post-apply authority/path revalidation, independently
  checked rollback, and post-verify TOCTOU closure.
- Order solution-builder and parallel delivery as seed/freeze -> implementation
  and test fan-in -> write tails -> traceability sync -> post-sync verification
  -> read-only audit -> ship, and document pending cross-tool live-agent cases.
- Reject execute-plan authority with missing requirement IDs or a mismatched
  approved-spec path/hash chain; preserve the legacy snapshots while recording
  the explicitly approved revision-2 correction spec and its exact approved
  plan R3 authority chain instead of rewriting history.
- Close product review bypasses with opaque request-bound audit proof,
  file-backed active-ledger discovery, approved-spec-derived requirement
  projections, bound readiness evidence IDs, strict evidence/UAT validation,
  and recursive closed-schema redaction checks.
- Complete the governed frontend architecture contract from planning through
  execution and review, including project-convention discovery, explicit
  component/state/service/provider/public-API decisions, and design handoff.
- Treat Angular list/detail pages as routed minimum boundaries rather than a
  fixed two-component model; support responsibility-derived feature-local
  components, conditional collaborators and `base-select`, private feature
  exports, and justified shared/Core UI reuse while preserving cohesive simple
  screens.
- Preserve feature-local one-off interactive Next.js components and minimal
  Client Component islands, remove the remaining fixed list/detail wording,
  strengthen scoped negative/positive mutation regressions, and add honest
  cross-tool live-agent validation scenarios.
- Update the documentation showcase to Astro 7.1.3 and SVGO 4.0.2 so its
  production dependency audit is clean.

## 0.5.1

- Add generated mirror ownership policy and pull request validation checklist.
- Add a 5-minute adoption path and release evidence status to clarify first-run
  expectations.
- Add release metadata guidance for positioning the project as a portable SDLC
  skill pack rather than a standalone runtime coding agent.
- Keep live `.sdcorejs/tasks/current-session.md` checkpoints out of committed
  source history.
- Require release validation evidence for Claude Code, Codex, Cursor, and
  GitHub Copilot before claiming full live-agent coverage.
- Add hidden/control/bidi Unicode scanner and wire it into npm scripts, CI,
  Full E2E, lefthook, and regression tests.
- Fix Full E2E Windows command execution by running `.cmd`/`.bat` shims through
  a shell while preserving direct execution for real binaries.
- Document validation tiers, including the boundary between deterministic tests,
  Full E2E, and real-agent transcript evidence.
- Add adoption guidance, compatibility evidence expectations, fast-fix rules,
  a worked example, troubleshooting, real-agent validation template, and release
  process checklist.
- Expand security guidance with trust boundaries and safe mode policy.
- Align package metadata and lockfile on npm as the canonical package manager.
- Add CI for skill validation, E2E tests, and Windows PowerShell sync checks.
- Add scheduled/manual full golden target-app E2E coverage.
- Harden skill sync validation for frontmatter shape, duplicate names,
  unsupported metadata, exact `_refs` references, and stale mirrors.
- Remove global response-style injection from generated Claude/plugin mirrors.
- Clarify English-only source policy and localization fixture carve-out.
- Add security guidance for prompt injection, secret handling, command
  execution, generated mirrors, and sandboxing expectations.

## 0.5.0

- Current public skill-pack baseline for Angular, NestJS, Next.js, product,
  design, test, documentation, review, repair, ship, git, Docker/auth/run-guide,
  and solution-builder workflows.
