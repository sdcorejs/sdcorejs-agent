# SDCoreJS SDLC Agent - GitHub Copilot Instructions

Use this repo as a Runtime-localized SDLC skill pack for AI-agent, Angular, NestJS, Next.js, product-track, design-track, test-track, and generic harness work.

## Dispatch

1. Glob `skills/**/*.md` and read frontmatter only.
2. Match the user request against each skill `description`.
3. Read the selected skill body before acting.
4. If no skill matches, invoke `sdcorejs-using-skills`.

If several skills match, apply this priority: explicit skill name, approved-plan execution, product docs/traceability, design handoff, test-only work, dedicated utility intent, confirmed track implementation, then brainstorming for ambiguous scope.

## Workflow

```text
Request
  -> sdcorejs-brainstorming
  -> sdcorejs-spec (approval gate + approved spec snapshot)
  -> sdcorejs-plan (approval gate + approved plan snapshot)
  -> sdcorejs-execute-plan
       ask execution mode only when both modes are feasible
       dispatch ai-agent | Core UI angular | nestjs | nextjs | product | design | test | generic harness
  -> finish gate and tail chain
       tests -> optional sdcorejs-simplify -> affected focused tests
       -> review/repair -> documentation/task/memory -> ship gates
```

Track executors:

- Angular: `sdcorejs-angular` only for Core UI portals/new SDCoreJS portals/approved Core UI migration; plain Angular uses the generic harness
- NestJS: `sdcorejs-nestjs`
- Next.js: `sdcorejs-nextjs`
- AI-agent: `sdcorejs-ai-agent` only for an approved plan with one engine and
  one independent capability profile
- Product: `sdcorejs-product`
- Design: `sdcorejs-design`
- Test: `sdcorejs-test`
- Generic: `sdcorejs-execute-plan` harness fallback

Under-specified AI-agent requests return to brainstorming. Test, review, and
debug intent keep their dedicated owners. The AI-agent track authors governed
application contracts/integration and offline evidence; it does not bundle a
provider runtime or imply live verification.

`sdcorejs-simplify` is a dedicated workflow utility, not a track. Route only
bounded current-diff or explicit executable-source refinement that preserves
behavior. Broad refactors return to planning; bugs, review findings, tests,
documentation/prompts, performance, dependencies, and public-contract changes
retain their owners.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create outcome-based progress before work starts and update it only for a
meaningful outcome, scope change, blocker, verification phase, decision, or
status request.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

- Requirements before code: use `sdcorejs-brainstorming`.
- `sdcorejs-spec` and `sdcorejs-plan` require explicit approval.
- `sdcorejs-spec` and `sdcorejs-plan` write their own approved snapshots.
- Approved plans execute through `sdcorejs-execute-plan`; it classifies Angular as Core UI vs plain Angular and validates `agent_architecture` before AI-agent dispatch.
- Non-trivial skills apply `_refs/shared/project-context.md` before executing.
- `sdcorejs-execute-plan` auto-selects sequential for one unit or unsafe/
  unavailable parallel execution, and asks only when both modes are feasible.
- Product docs, user stories, acceptance criteria, UAT, and traceability use `sdcorejs-product`.
- UI/UX design, screen flows, wireframes, PNG previews, and FE handoff use `sdcorejs-design`.
- Simplify eligible changed source without behavior changes through
  `sdcorejs-simplify`; explore codebase context with `sdcorejs-explore`; write
  comments, user guides, and technical docs through
  `sdcorejs-documentation`; verify and ship through `sdcorejs-ship`; commit,
  PR, changelog, and release notes through `sdcorejs-git`.
- Parallel execution requires `sdcorejs-parallel-dispatch`. Direct approved-plan
  splitting may select it; unapproved write work returns to planning. Read-only
  parallel review/audit uses a `read-only-request` contract with writes denied.
  Write-capable dispatch requires working-tree preflight, mechanical ownership,
  per-unit isolation, deterministic fan-in, and final verification.
- Pure Q&A answers directly. A bounded low-risk fix may use targeted context,
  the smallest edit, focused verification, and concise review; scope growth
  escalates to the full workflow.
- Canonical skills request semantic actions. Unsupported or unknown native
  capabilities use numbered Markdown and sequential parent fallbacks.
- Apply `_refs/harness/communication-economy.md` just in time. Default routine
  output to compact professional sentences; use detailed output for approval,
  security, destructive action, ambiguity, conflict, blockers, or failed
  verification. Pass full typed context only to its consumer; use a portable
  handoff when `runtime_context_channel` is unsupported or unknown.
- Every code-generation run presents the finish gate before tail steps.
- Never claim pass, built, fixed, or done without current verification output.
- Write `.sdcorejs/*` artifacts to the target project only.
- Keep live progress in the current thread/harness; never mirror it to a
  repository checkpoint file. Use explicit, change-scoped handoffs only for a
  real transfer or recovery need.
- Missing or stale summary never blocks work; use targeted reads or a scoped
  code map.
- Apply `_refs/shared/artifact-lifecycle.md` to every `.sdcorejs/**` write and
  Git artifact handoff.
- Preserve the user's language and locale marks; keep identifiers and routes in English.
- Before asking the user to choose, approve, answer yes/no, or select a mode, apply `_refs/shared/user-choice-prompt.md`; ask one decision at a time and number every option as `1/2/3/...`.
- Treat mojibake as a blocking defect.

## References

- Design: `_refs/sdlc/{ai-agent,angular,nestjs,nextjs}.md`
- AI-agent contracts: `_refs/ai-agent/**`
- Angular code: `_refs/angular/write-code/*`
- NestJS code: `_refs/nestjs/write-code/*`, `_refs/nestjs/core-catalog.md`
- Next.js code: `_refs/nextjs/build-website/write-code/*`
- Testing: `_refs/shared/testing-philosophy.md`
- Simplification: `_refs/simplify/**`
- Project context: `_refs/shared/project-context.md`
- Artifact lifecycle: `_refs/shared/artifact-lifecycle.md`
- Tasks protocol: `_refs/shared/tasklist.md`
- Choice prompts: `_refs/shared/user-choice-prompt.md`
- Communication profiles and handoffs: `_refs/harness/communication-economy.md`
- Finish gate: `_refs/shared/finish-gate.md`
- Documentation: `_refs/documentation/*`

## Source Of Truth

Edit `skills/`, `_refs/`, and entrypoint files. Regenerate mirrors with:

```bash
npm run sync:skills
```
