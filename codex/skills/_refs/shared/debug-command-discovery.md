# Debug Command Discovery

> Loaded by `sdcorejs-debug` before any repro, test, build, lint, typecheck, or
> verification command is run or recommended.

## Discovery Order

1. Use the original failing command from the user, test output, or CI logs when
   available and safe.
2. Detect package manager from `packageManager`, lockfiles, and workspace config:
   - `pnpm-lock.yaml`, `pnpm-workspace.yaml`
   - `yarn.lock`, `.yarnrc.yml`
   - `package-lock.json`, `npm-shrinkwrap.json`
   - `bun.lock`, `bun.lockb`
3. Read root and target-package `package.json` scripts.
4. Inspect runner configs, framework configs, existing tests, local docs, and CI
   workflow commands.
5. Pick the smallest command that reproduces or verifies the bug.

## Command Selection

Prefer in this order:

1. Original failing command, if current and safe.
2. Focused repro command for the failing file, test, route, component, script,
   endpoint, or payload.
3. Focused regression test command using an existing runner/script.
4. Broader existing lint, typecheck, build, test, or smoke scripts when
   appropriate and available.

## Rules

- Do not mix npm, pnpm, yarn, or bun.
- Do not hardcode a package manager.
- Do not invent missing scripts.
- Do not assume `npm run test`, `npm run build`, `npm run lint`, `npm run start`,
  or `tsc --noEmit` exists.
- Do not use `npx --yes`, package-manager dlx/x/exec downloads, dependency
  installs, browser installs, or runner bootstrap commands without explicit
  user approval for the exact command and reason.
- If package-manager signals conflict, stop and ask before running commands.
- If a script/tool is missing, too expensive, unsafe, or environment-blocked,
  record it under `commands_skipped` with evidence.
- Monorepos should run the smallest relevant workspace/package command.

## Reporting

Record every command in `debug_context`:

```text
commands_run:
  - command:
    cwd:
    exit:
    result:
    notes:
commands_skipped:
  - command_or_probe:
    reason:
    evidence:
package_manager:
```

Only commands that actually ran go in `commands_run`.

