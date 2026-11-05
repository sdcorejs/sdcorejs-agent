---
name: sdcorejs-explore
description: "Project exploration and durable context skill. Use to understand/map a codebase, trace feature flows, find reusable components/services, refresh .sdcorejs/summary.md, recover context, set/read persona, save/read memories, harvest documentation facts, or inspect local env shape. Modes: summary-read, summary-refresh, code-map, trace-flow, env-setup, recovery, persona, memories, conventions, documentation-harvest. Runtime-localized."
required-actions: artifact.read, artifact.write, context.pass, verification.run, user.choose, web.fetch
---

# Explore

## Purpose

`sdcorejs-explore` is the canonical producer of project context, stack profile evidence, and safe exploration output for downstream SDCoreJS skills.

It is read-only by default. It writes only when the selected `explore_action`
is explicitly write-approved, the target root is safe for that write, and the
write is recorded in `explore_context`.

Use it to:

- read or refresh the canonical `.sdcorejs/summary.md`;
- map architecture and reusable code paths;
- trace one behavior end to end;
- inspect local setup shape without changing env files;
- recover context after a break;
- read or write the target project's persona after approval;
- read or write durable memories after approval and redaction;
- read project conventions, or persist them once authorized;
- harvest documentation facts for `sdcorejs-documentation`.

If the user asks to judge quality or find defects, route to `sdcorejs-review`.
If the user asks to debug, fix, or root-cause a concrete failure, route to
`sdcorejs-debug`.
If the user asks to write or run tests, route to `sdcorejs-test`.
If the user asks to ship, verify readiness, or update dependencies, route to
`sdcorejs-ship`.
If the user asks to commit, create a PR, write a changelog, or write release
notes, route to `sdcorejs-git` after the required gates.
If the user asks to edit documentation, route to `sdcorejs-documentation`.

## Shared Protocols

Read `_refs/shared/runtime-protocols.md`. Before deep refs, broad scans,
commands, or writes, classify `explore_action` and load project context with:

   - `caller_context: sdcorejs-explore`;
   - `context_mode: <explore_action>`;
   - `side_effects_allowed: false` for read-only actions.

Apply `_refs/shared/artifact-lifecycle.md` before any write-approved action.
Use `_refs/shared/system-registry.json` for every track/profile classification
and `_refs/shared/explore-contract.mjs` for write authority and read-only
repository-topology discovery. Never reproduce their enums in prompts.

Project-context must never recursively invoke `sdcorejs-explore` while
`sdcorejs-explore` is already running.

## Step 0 - Classify `explore_action`

Pick exactly one action before reading deep refs, running scans, or writing
anything:

| explore_action | Use when | Side-effect boundary |
|---|---|---|
| `summary-read` | Read the project index, understand the project, or a read-only caller needs context | Read existing `.sdcorejs/summary.md`; legacy/missing/stale summaries are signals, not blockers. Continue with targeted reads. No writes. |
| `summary-refresh` | User explicitly requests it, approved project initialization owns it, or an architecture-level change assigns it to the sequential/integration owner | May write summary v2 after authoring-repo guard, fingerprinting, ownership, redaction, and artifact classification. |
| `code-map-readonly` | Map architecture, reusable paths, modules, routes, services, or code ownership after targeted reads are insufficient | Return a task-scoped map. Query an existing graph/index provider read-only when available. No map or cache writes. |
| `code-map-write-approved` | User explicitly requests a durable, task-scoped code map and approves its exact owner/path | Explore may write only that bounded map after topology, authoring-repo, redaction, and artifact gates. Never write a repository-wide codegraph. |
| `trace-flow-readonly` | Trace one behavior, feature, route, job, command, or test flow | Read-only trace output. No diagram/file writes unless the user separately asks. |
| `env-setup-readonly` | Explain local setup, prerequisites, scripts, env keys, or first-run steps | Read README/config/examples and output instructions. No env/config writes. |
| `env-setup-write-approved` | User explicitly approves safe env file creation from an example | May create a missing env file with placeholders only. Never overwrite existing env files. |
| `recovery-readonly` | Resume, recover context, or read where work stopped | Read related summaries, tasks, docs, request-scoped commits, and current status. No auto-resume and no writes. |
| `persona-read` | Read current project persona or explanation mode | Read-only. |
| `persona-write-approved` | User explicitly asks to set/change persona or approves persona storage | May write `.sdcorejs/persona.md` after authoring-repo guard and redaction. |
| `memories-read` | Load durable project memory context | Read relevant memory index/frontmatter first. Bodies only on match. No writes. |
| `memories-write-approved` | User explicitly asks to remember durable knowledge | May write redacted durable memory after approval and duplicate search. |
| `documentation-harvest-readonly` | Harvest user-guide or technical-doc facts/gaps for documentation | Read-only facts for documentation renderer. No docs written by explore. |
| `conventions-read` | A caller needs project convention rules or capture-policy state | Read-only. Load relevant categories, validate every file, apply precedence, report invalid/conflicted/stale/unavailable rules. No writes, no evidence refresh, no policy creation. |
| `conventions-sync-write-approved` | Explicit authorization, approved convention setup, an approved capture policy, or integration-owner authority allows persisting conventions | May write `.sdcorejs/conventions/**` after revalidating final code/config. Never from a parallel worker; never a portal fallback for a module-owned rule. |

Read-only explore actions must not write `.sdcorejs/*`, env files, docs, tasks,
source files, memory files, persona files, generated mirrors, or project
artifacts. Missing or stale summary is not itself permission to write.

Write-approved actions must record the approval source, target path, reason, and
write outcome in `explore_context.writes` and emit `artifact_context`.

## Target Root And Authoring-Repo Guard

Resolve target root with `git rev-parse --show-toplevel`; if there is no git
root, use the user-provided root or current directory and mark confidence.

Classify:

```text
target_root_kind:
  target-project
  sdcorejs-agent-authoring-repo
  skill-pack-authoring-repo
  unknown
```

Detection signals:

- `sdcorejs-agent-authoring-repo`: root contains `AGENTS.md`,
  `MIRROR_POLICY.md`, `skills/shared/workflow/explore.md`,
  `scripts/sync-skills.mjs`, and package name `sdcorejs-agent`.
- `skill-pack-authoring-repo`: root contains source `skills/**`, `_refs/**`,
  generated mirrors, or mirror policy for an agent skill pack.
- `target-project`: root is the user's app/site/system target and not an
  authoring repo.
- `unknown`: root is ambiguous or lacks enough evidence.

When `target_root_kind` is `sdcorejs-agent-authoring-repo` or
`skill-pack-authoring-repo`, read-only exploration is allowed, but writes to
`.sdcorejs/*`, persona, memories, env files, docs, tasks, source files, project
artifacts, or generated mirrors require explicit confirmation that this
repository is the intended target. If `target_root_kind` is `unknown`, default
to read-only and ask for clarification before any write.

## Canonical Stack Profile Producer

Every action that inspects project shape must classify `tracks`,
`stack_profiles`, `profile_confidence`, and `profile_evidence`.

Accept every first-class track and stack profile from
`_refs/shared/system-registry.json`, including `ai-agent`, `fullstack`, and
future registry additions. Apply registry aliases before emitting
`explore_context`; unknown values remain findings rather than locally invented
enums.

Profile rules:

- Angular: detect from `angular.json`, `@angular/core`, Angular
  components/modules/routes, or Angular tests. Use `core-ui-angular` only when
  `@sdcorejs/angular` is installed/imported/used. Use
  `legacy-core-ui-angular` only when `@sd-angular/core` is installed/imported or
  used. Use `plain-angular` when Angular is present without either Core UI
  package. Do not classify Angular as Core UI from `angular.json` alone.
- NestJS: detect from `nest-cli.json`, `@nestjs/*` dependencies, controllers,
  modules, providers, or Nest tests. Use `sdcorejs-nestjs` only when
  `@sdcorejs/nestjs` or strong SDCoreJS Nest conventions are detected. Use
  `plain-nestjs` otherwise. Do not assume TypeORM, PostgreSQL, Zod,
  `SdContext`, `@HasPermission`, or `@sdcorejs/nestjs` for plain NestJS.
- Next.js: detect from `next.config.*`, `next` dependency, `app/`, `pages/`,
  `page.tsx`, `layout.tsx`, `route.ts`, or Next tests. Use
  `nextjs-build-website` only with strong public-site/build-website evidence
  such as `[locale]` routes, typed i18n navigation, content/public-site
  structure, or prior `sdcorejs-nextjs` build-website context. Use
  `plain-nextjs` otherwise. Do not assume `[locale]`, `setRequestLocale`,
  sitemap metadata, typed i18n navigation, or content folders for plain Next.js.
- React: use `react-vite` for Vite config plus React dependency. Use
  `react-cra` for `react-scripts`. Use `react-next-generic` when Next.js is
  present without build-website evidence and React-specific guidance is needed.
- Node/general: use `node-general` for Node projects without a stronger
  framework profile. Use `general` when no known profile is detected.

`profile_evidence` must cite concrete files, dependencies, imports, configs, or
tests. Do not record guesses as evidence.

## Repository Topology And Ownership Discovery

When `.gitmodules`, nested Git roots, portal/module metadata, module-owned
artifacts, or multi-repository scope is present, run the read-only topology
discovery from `_refs/shared/explore-contract.mjs`.

Record stable remote-derived repository IDs/roles, portal-module gitlink
relationships, portal-pinned and module source revisions, artifact locations,
and owner hypotheses with confidence/evidence. Absolute checkout paths are
runtime probes only and never durable repository or artifact identity.

Report, without repairing:

- missing or uninitialized modules;
- stale portal-pinned module revisions;
- module artifacts misplaced in a portal;
- duplicate editable artifact identities;
- remote/repository identity mismatches.

Discovery never initializes modules, changes gitlinks, moves artifacts,
rewrites ownership metadata, refreshes summaries, or starts a migration.

## Scanning Discipline

Use safe, bounded scans:

- Prefer `git ls-files` inside git repositories.
- Fall back to targeted globs when not git-backed.
- Exclude generated/vendor/build directories by default:
  `node_modules`, `dist`, `build`, `coverage`, `.next`, `.turbo`, `.angular`,
  `.cache`, `.git`, `playwright-report`, `cypress/videos`,
  `cypress/screenshots`, `test-results`, generated clients, binary/media assets
  unless relevant, and generated/vendor/build output.
- Exclude generated mirrors such as `codex/skills`, `.claude/skills`,
  `plugin/skills`, `plugin/_refs`, and `codex/skills/_refs` unless the target
  request is specifically about skill-pack or mirror behavior.
- Do not scan `.env` files for values. For env setup, read example/template key
  names only.
- Do not dump large files. Cap large result sets and summarize counts.
- Record `commands_skipped` when a repo is too large, a command would be noisy,
  or a probe could expose secrets.
- Use path-specific probes based on detected `source_roots` instead of
  root-level grep across the whole repo when possible.

## Package Manager And Command Discipline

Before suggesting or running commands:

- Detect package manager from `packageManager`, lockfiles, and workspace config.
- Do not mix npm, pnpm, yarn, or bun.
- Read `package.json` scripts before suggesting commands.
- Do not invent missing scripts.
- Do not assume `npm run dev`, `npm run build`, `npm run test`,
  `npm run lint`, or install commands exist.
- Do not install packages, download tools, install browsers, or start services
  unless explicitly requested.
- Record only commands actually run in `commands_run`.
- Record omitted probes in `commands_skipped`.

## Global Secret And PII Redaction

This protocol applies to summary, recovery, env-setup, memories, trace-flow,
documentation harvest, and `explore_context`.

Never echo or persist secret values from `.env`, local config, CI files, shell
output, source files, stack traces, request payloads, cookies, Authorization
headers, JWTs, refresh tokens, database URLs, API keys, passwords, private keys,
customer PII, production data, screenshots, traces, videos, HARs, or test
reports.

Never print full lines that contain likely secret values. For env/setup
findings, report key names only, not values. For suspected secrets, report file
path, key/category, reason, and redacted evidence such as
`API_KEY=[REDACTED]`. If a probe would print secret values, do not run it raw.
If the user provides sensitive data, summarize with placeholders and advise
rotation only when appropriate.

## Output And Summary Contracts

Read `_refs/shared/explore-context.md` completely before emitting
`explore_context`, running `summary-read`, or performing an approved
`summary-refresh`. It owns the runtime schema, Summary v2 frontmatter/body, and
freshness rules. Preserve the read-only `project_context` returned by
`_refs/shared/project-context.md`.

Keep these invariants in the active skill:

- read-only actions emit no writes;
- project summaries and durable scoped code maps are owned by
  `sdcorejs-explore`, never by `sdcorejs-documentation`;
- summary refresh requires one of the explicit ownership conditions;
- workers and `sdcorejs-git` never update the summary;
- the fingerprint keys are `workspace_structure`, `dependency_manifests`,
  `source_roots`, and `entrypoint_contract`;
- entrypoint freshness covers package entrypoint fields, adapter/plugin
  entrypoints, and declared key-entrypoint existence rather than only
  conventional filename regexes;
- write-approved actions emit `artifact_context`;
- missing or stale summary is never itself permission to write.

## Action references

Load only the selected action reference after classifying authority:

- code-map-readonly: `_refs/shared/explore-code-map-readonly.md`.
- documentation-harvest-readonly: `_refs/shared/explore-documentation-harvest-readonly.md`.
- trace-flow-readonly: `_refs/shared/explore-trace-flow-readonly.md`.
- Env Setup Actions: `_refs/shared/explore-env-setup-actions.md`.
- recovery-readonly: `_refs/shared/explore-recovery-readonly.md`.
- Persona Actions: `_refs/shared/explore-persona-actions.md`.
- Convention Actions: `_refs/shared/explore-convention-actions.md`.
- Memory Actions: `_refs/shared/explore-memory-actions.md`.

## Downstream Interaction

Downstream skills should treat `explore_context.stack_profiles` and freshness
as evidence, not unquestionable truth.

- Direct read-only workflows use `summary-read`, existing summary reads,
  `code-map-readonly`, or ephemeral context.
- Write-approved workflows may request `summary-refresh` only when one of the
  explicit summary ownership/write conditions applies.
- If summary is stale/missing in read-only context, continue with targeted reads
  and report stale/missing context in `explore_context.commands_skipped` or
  `freshness`.
- Explore may provide `next_skill_hint`; it must not execute unrelated workflows automatically. For `cleanup_signals`, follow `_refs/shared/explore-context.md`.

## Rules

### MUST DO

- Classify `explore_action` first.
- Keep read-only actions truly read-only.
- Use authoring-repo guard before any write.
- Produce `explore_context`.
- Produce stack profile evidence with concrete paths/dependencies/config.
- Produce repository topology, artifact locations, and owner hypotheses when
  multi-repository signals exist.
- Redact secrets and PII globally.
- Cite real paths and line numbers where useful.
- Distill; do not dump huge file contents.
- Match the user's language at runtime.

### MUST NOT

- Invent paths, scripts, stack profiles, or conventions.
- Treat stale/missing summary as write permission.
- Recursively invoke `sdcorejs-explore` from project-context.
- Read an entire large repo without scoping.
- Force SDCoreJS/Core UI/TypeORM/build-website assumptions onto plain projects.
- Write env files without explicit approval.
- Overwrite existing env files.
- Save transient state, secrets, or conventions as memory.
- Write shared convention state from a parallel worker or a portal fallback.
- Use a repository file as live task/session state.
- Generate or commit a full codegraph.
- Turn topology discovery into initialization, rewrite, migration, or artifact relocation.

## Cross-References

- `sdcorejs-review` - quality/audit judgment after exploration
- `sdcorejs-debug` - concrete failing behavior and root cause
- `sdcorejs-test` - test authoring, execution, and TDD
- `sdcorejs-ship` - final verification and release readiness
- `sdcorejs-git` - commit, PR, changelog, release notes
- `sdcorejs-documentation` - documentation writing from harvested facts
- `sdcorejs-cleanup` - bounded evidence-based housekeeping after separate authority

For authorized project AGENTS projection, follow `_refs/shared/project-bootstrap.md`; read-only modes never persist instructions.

## Action-specific authority

`resolveExploreWriteAuthority` requires explicit authority for the exact env,
persona or memory action. Integration ownership alone is not that permission.
Approved initialization or an assigned refresh may authorize summary-refresh;
the committed after-review policy may authorize convention sync. Unknown roles
and parallel workers never write shared state. Carry existing session decisions
without re-asking, but do not widen them to other actions.
