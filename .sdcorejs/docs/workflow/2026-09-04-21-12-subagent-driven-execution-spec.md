---
artifact_id: spec-draft-contract-subagent-driven-execution-20260904-r1
artifact_kind: execution-doc
change_ref: subagent-driven-execution-20260904
source_spec: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
---

# Spec - Subagent-Driven Execution and Portable Isolation

## Goal

Make delegated execution a reliable first-class workflow instead of an
occasionally reached parallel-only branch. Preserve `sdcorejs-parallel-dispatch`
as the low-level safety scheduler, add one high-level
`sdcorejs-subagent-driven-development` entrypoint, and keep workspace isolation
as a provider-neutral orchestration primitive rather than a Git-artifact mode.

## Approved design

1. A runtime attestation records observed delegation, concurrency, worker-CWD,
   worktree, cancellation, and result-reference capabilities. Static adapter
   values remain tri-state defaults and `unknown` never becomes optimistic
   support.
2. A compact approved-plan unit list compiles into a parallel opportunity
   report and protocol context. The compiler explains eligible waves, expected
   benefit, blockers, and safe repairs.
3. One dependency-wave algorithm owns both execute-plan selection and the
   parallel protocol. Dependencies may create ordered waves; they do not
   automatically force the whole plan to parent-sequential execution.
4. Delegation and concurrency are separate decisions. The fallback order is
   parallel fresh workers, sequential fresh workers, then parent execution only
   when delegation is unavailable.
5. The deterministic runner proves bounded overlap when concurrency is
   explicitly attested, while preserving sequential behavior by default and
   honest fail-fast semantics for already in-flight work.
6. Workspace isolation stays governed by the existing dedicated reference and
   semantic action. `sdcorejs-git` owns commit/PR/changelog artifacts, not
   executor workspace creation; compatibility routing may forward an old
   workspace-mode request without performing Git artifact work.
7. Canonical Git guidance is shell-neutral. It may show shell-specific probes
   only as labeled alternatives and uses message/body files rather than POSIX
   heredocs.

## Acceptance criteria

- AC-001: Exactly one new public skill exists, named
  `sdcorejs-subagent-driven-development`; the public inventory is 23 and remains
  within the existing ceiling.
- AC-002: Direct approved-plan delegation routes to the new skill, generic
  approved-plan execution remains owned by `sdcorejs-execute-plan`, read-only
  parallel audits remain owned by `sdcorejs-parallel-dispatch`, and unapproved
  writes still route to discovery/planning.
- AC-003: Runtime attestation validates evidence-backed tri-state observations,
  exposes effective maximum concurrency, and converts to the existing parallel
  runtime capability shape without hard-coding a provider.
- AC-004: A missing or unknown delegation/concurrency observation fails closed;
  observed support can enable native execution for that session only.
- AC-005: The execution selector and protocol classifier agree on a DAG with an
  independent first wave and ordered integration tail.
- AC-006: A compact plan context compiles to deterministic waves plus an
  opportunity report containing eligibility, benefit, blockers, and repair
  suggestions.
- AC-007: `execution_policy` supports `auto`, `sequential`, and
  `parallel-preferred` without repeatedly prompting after plan approval.
- AC-008: Explicit bounded concurrency produces measured overlap; absent
  attestation stays sequential. Fail-fast does not claim cancellation of work
  that already started.
- AC-009: The high-level skill requires a fresh worker context per ready unit,
  Stage A contract review before Stage B quality review, owner-scoped repair,
  deterministic fan-in, global verification, and no worker Git artifacts.
- AC-010: Workspace isolation has a single orchestration owner and retains
  consent, no-nesting, package-manager discovery, baseline, cleanup, and
  integration-workspace safety rules.
- AC-011: Git instructions contain no unlabeled POSIX-only `command -v`, shell
  assignment, or heredoc requirement in canonical workflow steps.
- AC-012: Canonical sources, generated mirrors, harness manifests, entrypoints,
  public docs, site catalog, and count assertions agree on 23 public skills.
- AC-013: Focused deterministic tests cover positive, negative, ambiguous,
  dependency-wave, concurrency, capability, routing, and portability cases.
- AC-014: Live-agent validation remains an explicit hook and is reported as
  `NOT RUN` when no separately authorized live provider matrix is executed.
- AC-015: No dependency, package-manager, lockfile, environment, migration,
  package-version, release, commit, push, or unrelated source change is made.

## Non-goals

- Renaming or deleting `sdcorejs-parallel-dispatch`.
- Assuming every provider supports subagents, concurrent calls, cancellation,
  result refs, or per-agent working directories.
- Letting workers approve plans, edit shared durable context, commit, push, or
  recursively delegate.
- Implementing a production job queue or provider SDK integration.

## Evidence and constraints

- Baseline `npm run test:e2e:parallel`: 35/35 passed.
- Baseline deterministic authoring matrix: passed with zero provider calls.
- Baseline `npm run test:e2e:skill-authoring`: 5/6 passed; the existing sanitized
  transcript hash mismatch is recorded as baseline evidence and must not be
  attributed to this change.
- Current Node is 22.22.2 while the repository declares
  `^22.22.3 || ^24.15.0 || >=26.0.0`; results must retain that limitation.
- User approval authorizes the single new public trigger through
  `.sdcorejs/approvals/subagent-driven-development-new-trigger.json`.

## Approval

The preceding comparative review supplied the design and trade-offs. The
user's requests to execute and subsequent confirmation are equivalent complete
input and explicit approval for this specification.
