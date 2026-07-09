# Project Context Preflight

Use this before any non-trivial SDCoreJS skill execution so direct-triggered
skills and full workflow skills see the same project memory without dirtying
the working tree unexpectedly.

## Caller Contract

Before applying this preflight, the caller must classify:

```text
caller_context: <skill-name>
context_mode: read-only | write-approved | summary-read | summary-refresh | code-map-readonly | trace-flow-readonly | env-setup-readonly | recovery-readonly | persona-read | memories-read | documentation-harvest-readonly
side_effects_allowed: true | false
```

If the caller has a richer action field such as `explore_action`,
`review_action`, `test_action`, `debug_mode`, or `ship_mode`, keep that value in
the caller context and derive `context_mode` from it.

Read-only context means this preflight may read project artifacts, but must not
write `.sdcorejs/*`, env files, docs, tasks, persona files, memories, source
files, or generated mirrors.

## Non-Recursion Rule

Project-context must never recursively invoke `sdcorejs-explore` while
`sdcorejs-explore` is already running.

When `caller_context: sdcorejs-explore`, project-context may read existing
summary/persona/memory/task artifacts, but it must not call or suggest another
`sdcorejs-explore` run. If summary is missing or stale, return a
missing/stale-summary signal and let the active explore action continue with
ephemeral context.

Missing or stale summary is not itself permission to write.

## When Required

Run this preflight for:

- code generation;
- spec or plan work;
- product, design, or test execution;
- review, debug, ship, dependency update, git artifact work;
- any multi-step task that could depend on prior project decisions.

Skip it for simple Q&A, naming advice, short explanations, translations, or
single-step answers that do not depend on project state.

## Step 1 - Resolve Target Root

Resolve the target project root from the user's current working directory:

```bash
git rev-parse --show-toplevel
```

If there is no git root, use the user's provided path or current directory.

Classify target root:

```text
target_root_kind:
  target-project
  sdcorejs-agent-authoring-repo
  skill-pack-authoring-repo
  unknown
```

Never write `.sdcorejs/*` artifacts to the `sdcorejs-agent` authoring repo or
another skill-pack authoring repo unless that repo itself is the explicit target
and the caller is write-approved.

If `target_root_kind` is unknown, keep the preflight read-only and ask for
clarification before any write.

## Step 2 - Detect Track And Profile Evidence

Detect one or more active tracks from request intent and project signals:

- angular: `angular.json`, Angular components, `@angular/core`,
  `@sdcorejs/angular`, `@sd-angular/core`;
- nestjs: `nest-cli.json`, `@nestjs/core`, controllers, modules, providers;
- nextjs: `next.config.*`, `next`, app/pages routes;
- react: React dependency, Vite config, CRA scripts, React components/hooks;
- node: package manifest, scripts, Node entrypoints;
- product: `product/`, PRDs, user stories, acceptance criteria, UAT;
- design: `design/`, wireframes, design specs, exports;
- test: test-only request, e2e/UAT/unit/integration focus;
- documentation: documentation request or docs source tree;
- workflow: skill-pack, process, or orchestration work;
- general: unsupported stack or non-track work.

When `sdcorejs-explore` has produced `explore_context`, downstream skills should
reuse its `tracks`, `stack_profiles`, `profile_confidence`, and
`profile_evidence`. Treat them as evidence, not as unquestionable truth; current
files and explicit user scope still override stale context.

## Step 3 - Summary Handling

For `context_mode: summary-read` or read-only callers:

1. Read `.sdcorejs/summary.md` if present.
2. Check freshness metadata if present.
3. If the summary is missing, stale, dirty, or unknown, return that signal.
4. Do not refresh or write `.sdcorejs/summary.md`.
5. Let the caller continue with targeted reads or ephemeral context.

For `context_mode: summary-refresh` or write-approved callers:

1. A summary refresh is allowed only when the user explicitly requested
   refresh/update/persist summary or the caller has a write-approved workflow.
2. The caller must run the authoring-repo guard before writing.
3. The caller must record any summary write in its context block.

Project-context itself does not write the summary. It decides whether summary is
available, stale, missing, or refresh-eligible.

## Step 4 - Read Resume And Memory Context

Read these files when present, keeping context lean:

1. `.sdcorejs/tasks/current-session.md`
   - If `status: in_progress` or `blocked`, treat it as the highest-priority
     resume signal.
2. `.sdcorejs/persona.md`
   - Load `_refs/shared/persona.md` and adapt output.
3. `.sdcorejs/summary.md`
   - Use summary-read behavior unless the caller is explicitly write-approved.
4. Latest 3 `.sdcorejs/docs/<track>/*.md`
   - Session history and recent decisions.
5. `.sdcorejs/memories/<track>/*.md`
   - Read frontmatter first. Load body only when the memory matches the current
     request, module, stakeholder, convention, or recurring constraint.
6. Latest `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md`
   - Read frontmatter first; load relevant bodies when executing or revising an
     approved artifact.
7. `.sdcorejs/tasks/<track>.md`
   - Living TODO for open Now/Next/Blocked items.

For product/design/test work, also read matching human-facing folders when
present:

- `product/prds/`;
- `product/user-stories/`;
- `product/acceptance-criteria/`;
- `product/uat-checklists/`;
- `design/specs/`;
- `design/wireframes/`;
- `test/reports/`.

## Step 5 - Current Evidence Overrides Stored Context

The current user request, selected files, diffs, logs, failing tests, command
output, and explicit user corrections override stored context.

If stored context conflicts with current evidence:

1. Prefer current evidence.
2. Mention the conflict briefly when it affects the result.
3. Update durable context only through the appropriate tail step or
   `sdcorejs-explore (memories-write-approved)` when the new fact should
   persist and the user approved it.

## Step 6 - Keep Context Lean And Redacted

Do not load every historical doc. Prefer:

- latest 3 docs per track;
- frontmatter before full bodies;
- relevant memories only;
- exact files named by the request, plan, failure, or diff.

Do not echo secrets or PII from summaries, tasks, logs, env files, reports,
memories, or docs. If sensitive values appear in current evidence, replace the
value with `[REDACTED]` and report only the path/key/category needed for the
task.

## Output Contract

After preflight, the executing skill should know:

- target root and `target_root_kind`;
- active track(s) and stack profile evidence when available;
- persona;
- current checkpoint status;
- summary status: fresh, stale, missing, dirty, or unknown;
- whether summary refresh is allowed;
- recent docs/specs/plans that matter;
- relevant memories;
- open tasks;
- current evidence that overrides stored context.
