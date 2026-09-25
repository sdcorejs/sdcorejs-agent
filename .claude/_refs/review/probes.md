# Review Probe Discipline

Read this reference before running any review or verification probe. Secret
redaction remains mandatory in `sdcorejs-review` itself.

Discover review and verification commands from package manager, lockfile, workspace configuration, `package.json` scripts, installed tools, and original
failing commands. Do not hardcode `npm` or `tsc`. Do not invent missing scripts. Do not download probe tools with `npx --yes` or similar without explicit approval.

Rules:

- Detect package manager from lockfiles and `package.json`.
- Do not mix `npm`, `yarn`, `pnpm`, and `bun`.
- Use existing `package.json` scripts only.
- Prefer the project's own build, lint, typecheck, test, audit, Lighthouse,
  pa11y, axe, load-test, and bundle-analysis scripts when present.
- Respect workspace scripts in monorepos when detectable.
- Do not assume `src/libs`, `src/app/[locale]`, `src/modules`, or any source
  root unless the project evidence shows it.
- If a probe cannot run, add it to `probes_skipped` with evidence, for example
  `no lint script found in package.json`, `tool not installed`, `network not
  allowed`, `not applicable to backend-only profile`, or `user approval required`.
