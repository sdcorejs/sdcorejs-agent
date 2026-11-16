# Repository instruction research — 2026-11-14

Primary sources read from their upstream repositories. Patterns were adapted;
project-specific commands and permission instructions were not imported.

| Repository | Verified pattern | Application in SDCoreJS |
| --- | --- | --- |
| [Next.js](https://github.com/vercel/next.js/blob/canary/AGENTS.md) | Ancestor README discovery; explicit watch-build requirement for framework source changes; exceptions for read-only/docs/test work; stop only task-owned watcher. | Task-scoped instruction loading and conditional runtime startup, with recorded exceptions. |
| [VS Code](https://github.com/microsoft/vscode/blob/main/.github/copilot-instructions.md) | Layered architecture map; inspect existing watch-task diagnostics; avoid duplicate processes; pinned package manager and focused validation. | Discover commands from the target package, reuse current runtime, avoid ritual installs/builds. |
| [Sentry root](https://github.com/getsentry/sentry/blob/master/AGENTS.md) and [backend](https://github.com/getsentry/sentry/blob/master/src/AGENTS.md) | Canonical AGENTS guidance with backend/frontend/test scopes; exact tool commands and feature-specific guidance links. | Respect each repository's canonical source; scoped rules and concise navigation instead of duplicated editor catalogs. |

These repositories differ in when a dev server is needed. The adopted contract
therefore follows the target repository and task purpose, rather than prescribing
one framework command for every project. Runtime status needs fresh identity and
readiness evidence. A successful health check is not an E2E result.
