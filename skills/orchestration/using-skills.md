---
name: sdcorejs-using-skills
description: Session bootstrap and dispatch guide for sdcorejs skills. Use at session start, onboarding/help/list-skill requests, or any request matching an sdcorejs skill. Routes direct answers, bounded fast-fixes, and governed brainstorming-to-spec-to-plan execution while preserving approval, verification, and finish gates. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, user.choose
---

# Using sdcorejs Skills

## Bootstrap

Match skill descriptions before reading bodies. Load
`_refs/shared/runtime-protocols.md`, then only the references required by the
selected task. Current user instructions and current evidence override stored
context.

Priority when several skills match:

1. Explicit skill named by the user.
2. Approved plan continuation: `sdcorejs-execute-plan`.
3. Product, design, and direct test work: `sdcorejs-product`,
   `sdcorejs-design`, `sdcorejs-test`; failing-test diagnosis uses
   `sdcorejs-debug`.
4. Dedicated intent: `sdcorejs-simplify`, `sdcorejs-explore`,
   `sdcorejs-documentation`, `sdcorejs-review`, `sdcorejs-repair-loop`,
   `sdcorejs-debug`, `sdcorejs-ship`, or `sdcorejs-git`.
5. Confirmed implementation: `sdcorejs-ai-agent`, `sdcorejs-angular`,
   `sdcorejs-nestjs`, or `sdcorejs-nextjs`.
6. Open-ended, ambiguous, or under-specified change:
   `sdcorejs-brainstorming`.

## Entry Gate

Choose one path before loading a full workflow:

- Pure Q&A with no authorized write: answer directly.
- Small, explicit, low-risk fix: targeted context, smallest scoped edit,
  focused verification, and concise review. Behavior, acceptance criteria,
  ownership, and verification must already be bounded.
- Ambiguous, architectural, cross-cutting, security-sensitive, destructive,
  concurrency-sensitive, or public-contract change: full workflow.

Fast-fix is not available for flaky/root-cause work or when a worker must infer
behavior. If scope, ownership, risk, or public behavior grows during a
fast-fix, stop and escalate to brainstorming. Fast-fix never bypasses working
tree safety, artifact lifecycle, evidence-before-claims, or a required finish
gate.

## Governed Workflow

```text
brainstorming
  -> spec (explicit approval + immutable approved snapshot)
  -> plan (explicit approval + immutable approved snapshot)
  -> execute-plan (track detection + real execution-mode decision)
  -> executor/generic harness
  -> finish gate and mandatory tail
```

Silence is never spec or plan approval. Do not generate code from ambiguous or
unconfirmed scope. The product, design, test, and AI-agent tracks remain
first-class; unsupported stacks use the generic execute-plan harness.

Execute-plan auto-selects sequential when there is one executable unit or safe
parallel execution is unavailable. It asks sequential versus parallel only
when at least two independent units make both modes feasible. Parallel work
must pass `sdcorejs-parallel-dispatch`.

## Invariants

- Run current verification before claiming pass, fixed, built, or done.
- Apply `_refs/harness/communication-economy.md` just in time for response
  profiles, progress, runtime-context handoff, or related-artifact selection.
  Default routine output to compact professional sentences; expand for
  approval, security, destructive action, ambiguity, failure, or blockers.
- Keep authoritative typed context available to its exact consumer without
  echoing it to the user. When `runtime_context_channel` is unsupported or
  unknown, use the validated portable handoff for `context.pass`.
- Keep live progress in the runtime, never in `.sdcorejs/**` session files.
- Every durable `.sdcorejs/**` producer propagates `artifact_context`.
- Finish gates, verification-before-done, and no-writes-after-branch-ready stay
  mandatory where the selected workflow requires them.
- Use `_refs/shared/user-choice-prompt.md` only for real decisions. Supported
  native interaction may be used, but numbered Markdown is always available.
- Match the user's language at runtime; keep reusable skill/reference prose and
  identifiers in English.
- Do not add scope, dependencies, migrations, environment changes, commits,
  pushes, tags, releases, or new skills without the authority required by the
  selected contract.

## Track Map

| Intent | Owner |
|---|---|
| Angular Core UI portal | `sdcorejs-angular` |
| SDCoreJS NestJS backend | `sdcorejs-nestjs` |
| Next.js public site | `sdcorejs-nextjs` |
| Approved AI-agent contract | `sdcorejs-ai-agent` |
| Product traceability | `sdcorejs-product` |
| Design handoff | `sdcorejs-design` |
| Direct tests | `sdcorejs-test` |
| Unknown/plain stack | `sdcorejs-execute-plan` generic harness |

Broad simplification/refactor, under-specified AI-agent work, or unapproved
production SDLC expansion returns to brainstorming. Project summary/code-map
work belongs to `sdcorejs-explore`; documentation does not own project context.
