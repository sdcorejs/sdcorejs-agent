---
name: sdcorejs-ship
description: Final delivery and dependency-update gate skill. Use when the user asks to verify before done, run final gate, check acceptance criteria, check ready-to-merge, check branch readiness, ship, push, release, tag, prepare a release, update dependencies, update package, bump package version, run npm outdated, audit dependency changes, fix npm/pnpm/yarn audit findings, or confirm requirement/implementation/test consistency before handoff. Owns verify-before-done, branch-ready, ship, and dependency-update modes, then delegates commit/PR/changelog/release-note artifacts to `sdcorejs-git`. Applies to angular, nestjs, nextjs, product/design/test work, and the sdcorejs-agent repo itself. Runtime-localized.
allowed-tools: Bash, Read, Grep, Glob, Write, Edit
---

# Ship

## Purpose
Own the final delivery boundary: prove the work satisfies the agreed criteria,
ensure the branch is clean enough to hand off, then delegate Git artifacts to
`sdcorejs-git`.

This is intentionally separate from `sdcorejs-git`:

- `sdcorejs-ship` decides whether the work is ready.
- `sdcorejs-git` creates commit, PR, changelog, and release-note artifacts.

## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Mode Selection

| Mode | Trigger examples | Output |
|---|---|---|
| `verify-before-done` | "verify", "verify acceptance", "is this done", "final gate" | acceptance verification report |
| `branch-ready` | "ready to merge", "branch ready", "check before PR", "ready to ship" | hygiene report: Ready / Warnings / Blocked |
| `ship` | "ship", "push it", "ready to merge", "release", "tag" | final verify -> branch-ready -> git artifact chain |
| `dependency-update` | "update dependencies", "update package", "bump <pkg>", "npm outdated", "audit fix" | dependency delivery workflow -> regression proof -> PR prep |

If the user asks only for commit, PR, changelog, or release notes, use
`sdcorejs-git`.

## Mode: verify-before-done

Read `_refs/orchestration/tail/verify-before-done.md` completely, then run the
acceptance gate:

- locate the active spec plus product/design/test ledgers when present
- extract acceptance criteria without inventing new ones
- run build/lint/test/smoke plus per-criterion checks
- present automated evidence and manual/deferred criteria separately
- block "done", commit, PR, or release until every automated criterion passes
  and every manual/deferred criterion is explicitly acknowledged

If the gate fails, invoke `sdcorejs-repair-loop` with source
`verify-before-done`. If it passes, continue to `branch-ready` mode when this is
part of a tail/ship chain.

## Mode: branch-ready

Read `_refs/orchestration/tail/branch-ready.md` completely, then run its
read-only hygiene checks:

- git status and branch state
- focused tests (`.only`, accidental `.skip`)
- conflict markers
- debug logs / console noise
- possible secrets
- large or unexpected binary files
- track-specific lint, test, and build commands when available

Verdicts:

- `READY`: hand off to `sdcorejs-git (commit mode)` or `sdcorejs-git (PR mode)`.
- `READY WITH WARNINGS`: continue only after explicit user acknowledgement.
- `BLOCKED`: stop and surface blockers; do not modify files from this mode.

## Mode: ship

Use for "done, ship it", "push it", "ready to merge", or release requests.

1. Pre-flight:
   - stop on protected branches
   - stop when there is nothing to ship
   - surface uncommitted changes and ask whether to commit them
2. Detect delivery type:
   - release/tag/version wording -> release mode
   - otherwise feature PR mode
3. Run `verify-before-done`.
4. Run `branch-ready`.
5. Rebuild aggregate user guide with `sdcorejs-write-user-guide` Mode 2 when module guides exist.
6. Release mode only: invoke `sdcorejs-git (changelog mode)` for changelog/release notes; ask before writing a versioned entry.
7. If the tree is dirty after docs/changelog, invoke `sdcorejs-git (commit mode)`.
8. Push through `sdcorejs-git` only after verification and hygiene are clear.
9. Invoke `sdcorejs-git (PR mode)` for feature PR delivery.
10. Summarize verification, hygiene, guide, changelog, commit, push, and PR/release URL.

Never tag, push, or release without explicit user approval.

## Mode: dependency-update

Use dependency updates as a mini delivery workflow, not a blind package edit.
The delivery shape is:

```text
audit current state -> classify risk -> update package/group -> audit breaking changes/changelog
-> run test/build/lint -> smoke/regression check -> branch-ready -> commit/PR
```

### 1. Determine state

Identify the package manager from the lockfile and never mix managers.

```bash
git rev-parse --abbrev-ref HEAD
git status --porcelain
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
<pm> outdated
<pm> audit --omit=dev
```

Read `package.json` for `engines`, scripts, direct dependencies, and pinned
ranges. For Angular projects, read `_refs/angular/core-version.md` before
touching `@sdcorejs/angular`.

### 2. Safety gates

Stop and ask before changing anything when:

- current branch is `main`, `master`, or a protected release branch
- there are unrelated uncommitted changes
- package manager cannot be determined
- the repo has no verification scripts and the user has not accepted a manual plan
- the requested update is a major framework migration; route through `sdcorejs-spec`
  and `sdcorejs-plan` first

### 3. Classify update risk

| Tier | Trigger | Delivery rule |
|---|---|---|
| Patch | semver patch only | batch compatible patches in one branch/PR |
| Minor | semver minor | group by ecosystem; read changelog/release notes |
| Major | breaking semver | one package per branch/PR; require migration guide |
| Pinned SDCoreJS/Core UI | pinned by `_refs/*/core-version.md` | ask before bump; update the reference together |
| Critical security | High/Critical audit finding | prioritize; still avoid `audit fix --force` |

### 4. Update one logical group

Examples:

```bash
<pm> update
<pm> install <pkg>@<target-version> --save-exact
<pm> audit fix
```

Rules:

- Patch groups may batch.
- Minor groups must cite changelog/release-note evidence.
- Major groups must cite migration-guide evidence and keep scope isolated.
- Do not use `--force`, `--legacy-peer-deps`, `--ignore-scripts`, or `audit fix --force`
  to hide a real dependency conflict.

### 5. Audit lockfile and breaking changes

```bash
git diff -- package.json package-lock.json yarn.lock pnpm-lock.yaml
git diff --stat -- package.json package-lock.json yarn.lock pnpm-lock.yaml
```

Check:

- unexpected direct dependency additions/removals
- peer dependency warnings
- large transitive churn from a supposedly tiny patch
- dropped engines/version constraints
- new packages with licensing/security concern

For minor/major updates, read upstream changelog/release notes before claiming
compatibility.

### 6. Regression verification

Run the current project commands, not guessed commands:

```bash
<pm> install
<pm> run lint
<pm> run build
<pm> run test
```

Skip a missing script only after confirming it is absent in `package.json`.
Then smoke run the stack:

- Angular: start app, load home/key route, check browser console when possible
- NestJS: start app, hit health or a real endpoint, verify DB connection/migrations when configured
- Next.js: build/start or dev smoke, load home plus one server-rendered route

If a regression appears, route to `sdcorejs-debug` with the failing command and
root symptom. Do not weaken tests to make the update pass.

### 7. Prepare delivery

1. Run `branch-ready`.
2. Use `sdcorejs-git (commit mode)` with a dependency-specific message:

```text
chore(deps): bump patch dependencies
chore(deps): bump @nestjs/core to 10.3.0
chore(deps)!: migrate typeorm to 0.4.0
```

3. Use `sdcorejs-git (PR mode)` to prepare the PR.

PR body must include:

- packages changed and old -> new versions
- risk tier: patch/minor/major/security
- changelog or migration-guide links for minor/major
- verification commands and smoke result
- known regressions/deferred checks, if any

## Rules

### MUST DO
- Run current commands and read their output before claiming ready/done.
- Keep branch-ready checks read-only.
- Distinguish verification blockers from hygiene warnings.
- Match the user's language at runtime.
- Delegate commit, PR, changelog, and release-note artifacts to `sdcorejs-git`.
- Treat dependency updates as delivery work: classify risk, audit changelogs, verify regression, then prepare PR.

### MUST NOT
- Claim "done" before `verify-before-done` passes or is explicitly deferred.
- Hide failed acceptance criteria.
- Force-push, tag, or release without approval.
- Edit files from branch-ready mode.
- Run dependency updates on a protected branch.
- Use force/legacy dependency flags to mask conflicts.

## Cross-References
- `_refs/shared/finish-gate.md` - consolidated post-code options
- `_refs/orchestration/tail/verify-before-done.md` - acceptance criteria gate
- `_refs/orchestration/tail/branch-ready.md` - branch hygiene checklist
- `sdcorejs-git` - commit, PR, changelog, release notes
- `_refs/angular/core-version.md` - pinned Core UI version guard for Angular dependency updates
- `sdcorejs-repair-loop` - fixes failed review or verification findings

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
