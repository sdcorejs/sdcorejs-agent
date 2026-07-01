# SDCoreJS SDLC Agent - GitHub Copilot Instructions

Use this repo as a Runtime-localized SDLC skill pack for Angular, NestJS, Next.js, product-track, design-track, test-track, and generic harness work.

## Dispatch

1. Glob `skills/**/*.md` and read frontmatter only.
2. Match the user request against each skill `description`.
3. Read the selected skill body before acting.
4. If no skill matches, invoke `sdcorejs-using-skills`.

## Workflow

```text
Request
  -> sdcorejs-brainstorming
  -> sdcorejs-spec (approval gate + approved spec snapshot)
  -> sdcorejs-plan (approval gate + approved plan snapshot)
  -> sdcorejs-execute-plan
       always ask sequential vs parallel
       dispatch angular | nestjs | nextjs | product | design | test | generic harness
  -> finish gate and tail chain
```

Track executors:

- Angular: `sdcorejs-angular`
- NestJS: `sdcorejs-nestjs`
- Next.js: `sdcorejs-nextjs`
- Product: `sdcorejs-product`
- Design: `sdcorejs-design`
- Test: `sdcorejs-test`
- Generic: `sdcorejs-execute-plan` harness fallback

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create the `Tasks` section before work starts and update it as work progresses.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

- Requirements before code: use `sdcorejs-brainstorming`.
- `sdcorejs-spec` and `sdcorejs-plan` require explicit approval.
- `sdcorejs-spec` and `sdcorejs-plan` write their own approved snapshots.
- Approved plans execute through `sdcorejs-execute-plan`.
- Non-trivial skills apply `_refs/shared/project-context.md` before executing.
- `sdcorejs-execute-plan` always asks sequential vs parallel before execution.
- Product docs, user stories, acceptance criteria, UAT, and traceability use `sdcorejs-product`.
- UI/UX design, screen flows, wireframes, PNG previews, and FE handoff use `sdcorejs-design`.
- Explore codebase context with `sdcorejs-explore`; write comments, user guides, and technical docs through `sdcorejs-documentation`; verify and ship through `sdcorejs-ship`; commit, PR, changelog, and release notes through `sdcorejs-git`.
- Parallel execution requires `sdcorejs-parallel-dispatch`.
- Every code-generation run presents the finish gate before tail steps.
- Never claim pass, built, fixed, or done without current verification output.
- Write `.sdcorejs/*` artifacts to the target project only.
- For long or interruptible work, mirror visible `Tasks` progress to `.sdcorejs/tasks/current-session.md`.
- Preserve the user's language and locale marks; keep identifiers and routes in English.
- Before asking the user to choose, approve, answer yes/no, or select a mode, apply `_refs/shared/user-choice-prompt.md`; ask one decision at a time and number every option as `1/2/3/...`.
- Treat mojibake as a blocking defect.

## References

- Design: `_refs/sdlc/{angular,nestjs,nextjs}.md`
- Angular code: `_refs/angular/write-code/*`
- NestJS code: `_refs/nestjs/write-code/*`, `_refs/nestjs/core-catalog.md`
- Next.js code: `_refs/nextjs/build-website/write-code/*`
- Testing: `_refs/shared/testing-philosophy.md`
- Project context: `_refs/shared/project-context.md`
- Tasks protocol: `_refs/shared/tasklist.md`
- Choice prompts: `_refs/shared/user-choice-prompt.md`
- Finish gate: `_refs/shared/finish-gate.md`
- Documentation: `_refs/documentation/*`

## Source Of Truth

Edit `skills/`, `_refs/`, and entrypoint files. Regenerate mirrors with:

```bash
npm run sync:skills
```
