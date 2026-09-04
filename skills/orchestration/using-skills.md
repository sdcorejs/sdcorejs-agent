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
context. `_refs/shared/system-registry.json` is the versioned source of truth
for track, stack-profile, artifact-kind, repository-role, review, repair, ship,
and evidence semantics. Read only the registry fields needed for the selected
route; do not load every referenced track body during bootstrap.

Priority when several skills match:

1. Explicit skill named by the user.
2. Approved plan: `sdcorejs-subagent-driven-development` for explicit
   delegation; otherwise `sdcorejs-execute-plan`.
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

Imperative verbs such as `implement`, `build`, or `create` express write intent
only; they are not spec approval or plan approval. Apply the selected path's
entry criteria and approval artifacts independently of the wording of the
requested outcome. A fixture, lab, benchmark, or disposable repository does not
waive a required approval gate, and an explicit scoped prompt is not a substitute
for a required artifact.

A non-trivial implementation request without a valid approved plan must
route to `sdcorejs-brainstorming`; it is not confirmed implementation. Do not load a track
executor as an escape from the governed workflow.

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
  -> execute-plan (track detection + execution policy)
  -> delegated or parent executor/generic harness
  -> finish gate and mandatory tail
```

Silence is never spec or plan approval. Do not generate code from ambiguous or
unconfirmed scope. The product, design, test, and AI-agent tracks remain
first-class; unsupported stacks use the generic execute-plan harness.

Explicit approved-plan delegation uses `sdcorejs-subagent-driven-development`;
safe waves may run in parallel, otherwise fresh workers run sequentially.
Parent execution is the fallback. `sdcorejs-parallel-dispatch` remains the
low-level scheduler for safe waves and read-only parallel audits.

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
- Keep semantic identity separate: `track` selects the workflow/executor;
  `stack_profile` refines stack behavior; an optional `capability_profile`
  refines an approved domain capability; `repository_role` describes topology;
  `artifact_owner_repository_id` is the durable write owner; and
  `execution_host_repository_id` is only the repository coordinating the run.
  In plain language, keep the artifact owner separate from the execution host.
  Never infer artifact ownership from the current working directory.
- Resolve aliases and unsupported stacks through
  `_refs/shared/system-registry.mjs`. Unknown stacks use the declared generic
  harness fallback; unknown runtime capabilities use the portable fallback
  from the capability contract.

## Track Map

This display is checked deterministically against
`_refs/shared/system-registry.json`; consumers resolve the registry rather than
copying this table into durable artifacts.

| Canonical track | Executor |
|---|---|
| `ai-agent` | `sdcorejs-ai-agent` |
| `angular` | `sdcorejs-angular` |
| `design` | `sdcorejs-design` |
| `documentation` | `sdcorejs-documentation` |
| `fullstack` | `sdcorejs-execute-plan` generic harness |
| `general` | `sdcorejs-execute-plan` generic harness |
| `nestjs` | `sdcorejs-nestjs` |
| `nextjs` | `sdcorejs-nextjs` |
| `node` | `sdcorejs-execute-plan` generic harness |
| `product` | `sdcorejs-product` |
| `react` | `sdcorejs-execute-plan` generic harness |
| `test` | `sdcorejs-test` |
| `workflow` | `sdcorejs-execute-plan` generic harness |

Broad simplification/refactor, under-specified AI-agent work, or unapproved
production SDLC expansion returns to brainstorming. Project summary/code-map
work belongs to `sdcorejs-explore`; documentation does not own project context.

Consistency and convention intent - "consistency review", "review naming
consistency", "review API conventions", singular/plural or casing drift - routes
to `sdcorejs-review` with the `consistency` dimension. Review stays read-only.
Reading or persisting `.sdcorejs/conventions/**` belongs to `sdcorejs-explore`
(`conventions-read` and `conventions-sync-write-approved`); `sdcorejs-git` never
generates or updates conventions.
