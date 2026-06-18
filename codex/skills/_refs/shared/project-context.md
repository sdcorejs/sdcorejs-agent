# Project Context Preflight

Use this before any non-trivial sdcorejs skill execution so direct-triggered
skills and full workflow skills see the same project memory.

## When Required

Run this preflight for:

- code generation
- spec or plan work
- product, design, or test execution
- review, debug, ship, dependency update, git artifact work
- any multi-step task that could depend on prior project decisions

Skip it for simple Q&A, naming advice, short explanations, translations, or
single-step answers that do not depend on project state.

## Step 1 - Resolve Target Root

Resolve the target project root from the user's current working directory:

```bash
git rev-parse --show-toplevel
```

If there is no git root, use the user's provided path or current directory.

Never write `.sdcorejs/*` artifacts to the `sdcorejs-agent` authoring repo unless
that repo itself is the explicit target.

## Step 2 - Detect Track

Detect one or more active tracks from request intent and project signals:

- angular: `angular.json`, Angular components, `@sdcorejs/angular`, `@sd-angular/core`
- nestjs: `nest-cli.json`, `@nestjs/core`, controllers, modules, entities
- nextjs: `next.config.*`, app/pages routes
- product: `product/`, PRDs, user stories, acceptance criteria, UAT
- design: `design/`, wireframes, design specs, exports
- test: test-only request, e2e/UAT/unit/integration focus
- generic: unsupported stack or non-track work

For mixed work, read context for every relevant track.

## Step 3 - Read Resume And Memory Context

Read these files when present:

1. `.sdcorejs/tasks/current-session.md`
   - If `status: in_progress` or `blocked`, treat it as the highest-priority
     resume signal.
2. `.sdcorejs/persona.md`
   - Load `_refs/shared/persona.md` and adapt output.
3. `.sdcorejs/summary.md`
   - If missing or stale and the task needs architecture awareness, invoke or
     follow `sdcorejs-explore (summary mode)` before implementation.
4. Latest 3 `.sdcorejs/docs/<track>/*.md`
   - Session history and recent decisions.
5. `.sdcorejs/memories/<track>/*.md`
   - Read frontmatter first. Load body only when the memory matches the current
     request, module, stakeholder, convention, or recurring constraint.
6. Latest `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md`
   - Read frontmatter first; load relevant bodies when executing or revising
     an approved artifact.
7. `.sdcorejs/tasks/<track>.md`
   - Living TODO for open Now/Next/Blocked items.

For product/design/test work, also read matching human-facing folders when
present:

- `product/prds/`
- `product/user-stories/`
- `product/acceptance-criteria/`
- `product/uat-checklists/`
- `design/specs/`
- `design/wireframes/`
- `test/reports/`

## Step 4 - Current Evidence Overrides Stored Context

The current user request, selected files, diffs, logs, failing tests, command
output, and explicit user corrections override stored context.

If stored context conflicts with current evidence:

1. Prefer current evidence.
2. Mention the conflict briefly when it affects the result.
3. Update durable context only through the appropriate tail step or
   `sdcorejs-explore (memories mode)` when the new fact should persist.

## Step 5 - Keep Context Lean

Do not load every historical doc. Prefer:

- latest 3 docs per track
- frontmatter before full bodies
- relevant memories only
- exact files named by the request, plan, failure, or diff

Summarize the preflight internally. Surface only the useful part to the user,
for example: "Loaded current checkpoint and 2 relevant memories." Do not dump
the full context unless the user asks.

## Output Contract

After preflight, the executing skill should know:

- target root
- active track(s)
- persona
- current checkpoint status
- recent docs/specs/plans that matter
- relevant memories
- open tasks
- current evidence that overrides stored context
