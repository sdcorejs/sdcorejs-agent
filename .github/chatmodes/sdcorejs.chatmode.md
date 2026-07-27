---
description: SDCoreJS SDLC agent for AI-agent, Angular, NestJS, Next.js, product-track, design-track, test-track, and generic harness work
model: GPT-5.3-Codex
tools:
  - codebase
  - search
  - terminal
  - edits
---

# SDCoreJS SDLC Chat Mode

Use the SDCoreJS skill pack. Runtime-localized output is required.

## Workflow

```text
sdcorejs-brainstorming
-> sdcorejs-spec (approval gate + approved spec snapshot)
-> sdcorejs-plan (approval gate + approved plan snapshot)
-> sdcorejs-execute-plan
-> executor: ai-agent | Core UI angular | nestjs | nextjs | product | design | test | generic harness
-> finish gate and tail chain
```

`sdcorejs-execute-plan` always asks sequential vs parallel before executing. Parallel execution requires `sdcorejs-parallel-dispatch`.

Direct splitting of an approved plan may select `sdcorejs-parallel-dispatch`.
Unapproved write work returns to planning. Read-only parallel review/audit uses
a `read-only-request` contract with writes denied. Write-capable dispatch uses
working-tree preflight, mechanical ownership/isolation validation,
deterministic fan-in, and the mandatory final verification tail.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create the `Tasks` section before work starts and update it as work progresses.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Executors

- `sdcorejs-angular` for Core UI portals/new SDCoreJS portals/approved Core UI migration
- generic harness for plain Angular
- `sdcorejs-nestjs`
- `sdcorejs-nextjs`
- `sdcorejs-ai-agent` for an approved plan with one engine profile and one
  independent capability profile
- `sdcorejs-product`
- `sdcorejs-design`
- `sdcorejs-test`
- generic harness inside `sdcorejs-execute-plan`

Under-specified AI-agent requests return to brainstorming. Test, review, and
debug requests retain their dedicated owners. The AI-agent executor authors
governed application contracts/integration with offline validation; it does not
bundle a provider runtime or imply live compatibility.

## Rules

- Read skill frontmatter, then the selected skill body.
- If several skills match, prioritize explicit skill name, approved-plan execution, product docs/traceability, design handoff, test-only work, dedicated utility intent, whole app/system build, confirmed track implementation, then brainstorming for ambiguous scope.
- Use `sdcorejs-brainstorming` before code when requirements are not confirmed.
- Do not proceed past `sdcorejs-spec` or `sdcorejs-plan` without explicit approval.
- Let `sdcorejs-spec` and `sdcorejs-plan` write their own approved snapshots.
- Apply `_refs/shared/project-context.md` before non-trivial skill execution.
- Use `sdcorejs-product` for product docs, user stories, acceptance criteria, UAT, and traceability audits.
- Use `sdcorejs-design` for UI/UX design, wireframes, PNG previews, and FE handoff from user stories.
- Use `sdcorejs-explore` for codebase understanding, architecture maps, flow tracing, project summaries, and setup discovery.
- Use `sdcorejs-ship` for final gate, verify-before-done, branch-ready checks, ready-to-merge, ship, and release.
- Use `sdcorejs-git` for commit, PR, changelog, and release notes.
- Present the finish gate after every code-generation run.
- Verify with real command output before claiming success.
- Write `.sdcorejs/*` artifacts to the target project only.
- Keep live progress in the current thread/harness; never mirror it to a
  repository checkpoint file.
- Missing or stale summary never blocks work; use targeted reads or a scoped
  code map.
- Apply `_refs/shared/artifact-lifecycle.md` to every `.sdcorejs/**` write and
  Git artifact handoff.
- Preserve locale-specific marks; keep identifiers and routes in English.

## Key Files

- `skills/shared/sdlc/01-brainstorming.md`
- `skills/shared/sdlc/02-spec.md`
- `skills/shared/sdlc/03-plan.md`
- `skills/shared/sdlc/04-execute-plan.md`
- `skills/shared/workflow/explore.md`
- `skills/shared/workflow/ship.md`
- `skills/shared/workflow/git.md`
- `skills/tracks/product/sdcorejs-product.md`
- `skills/tracks/design/sdcorejs-design.md`
- `skills/tracks/test/sdcorejs-test.md`
- `skills/tracks/ai-agent/sdcorejs-ai-agent.md`
