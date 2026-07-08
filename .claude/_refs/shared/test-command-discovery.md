# Test Command Discovery

> Loaded by `sdcorejs-test` before any test command is run or recommended.
> Not a dispatchable skill; no frontmatter.

## Purpose

Discover the project's existing package manager, runner, scripts, workspaces, and test conventions before executing or proposing commands.

## Discovery Order

1. Read lockfiles and workspace files:
   - `pnpm-lock.yaml`, `pnpm-workspace.yaml`
   - `yarn.lock`, `.yarnrc.yml`
   - `package-lock.json`, `npm-shrinkwrap.json`
   - `bun.lock`, `bun.lockb`
2. Read `package.json` scripts in the target package and workspace root.
3. Inspect runner configs:
   - Jest, Vitest, Karma, Angular, Cypress, Playwright, Robot Framework, pytest, or project-specific configs.
4. Inspect existing tests for folder layout, naming, helpers, fixtures, page objects, and commands mentioned in local docs.
5. Choose the narrowest current command that covers the changed file, target path, or acceptance criterion.

## Package Manager Policy

Use the detected package manager and existing scripts. Do not hardcode a package manager when the repository signals another one.

Use neutral placeholders in plans and docs when discovery is incomplete:

```text
<pm> run <script> -- <runner-filter>
```

Examples of valid evidence statements:

```text
package_manager: pnpm (pnpm-lock.yaml found)
runner: vitest (vitest.config.ts found)
command_planned: pnpm test -- src/foo.spec.ts
```

## Installation Guard

Do not run dependency-changing or browser-installing commands without explicit user approval for the exact command and reason.

Blocked by default:

- dependency add/install commands
- browser binary install commands
- package-manager dlx/x/exec probes that download packages
- runner bootstrap commands that change config or lockfiles
- `npx --yes` or equivalent auto-download behavior

When a tool is missing, report:

```text
blocked_command:
reason:
existing_evidence:
user_approval_needed:
```

## Command Selection

Prefer in this order:

1. Focused test file command already supported by the runner.
2. Existing package script with a runner filter.
3. Existing package script for the target package/workspace.
4. Full test suite only when focused execution is not available or acceptance criteria require it.

Do not invent a script. If no script exists, state the discovered runner/config and ask for approval before adding scripts or dependencies.

## Reporting

Every run report must include:

```text
command:
cwd:
package_manager:
runner:
exit_code:
current_head_or_diff:
```
