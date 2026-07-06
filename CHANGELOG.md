# Changelog

All notable changes to this repository should be documented here.

This project uses GitHub tags/releases for adopted versions. The root npm
package is private and is not published to npm.

## Unreleased

- Align package metadata and lockfile on npm as the canonical package manager.
- Add CI for skill validation, E2E tests, and Windows PowerShell sync checks.
- Add scheduled/manual full golden target-app E2E coverage.
- Harden skill sync validation for frontmatter shape, duplicate names,
  unsupported metadata, exact `_refs` references, and stale mirrors.
- Remove global response-style injection from generated Claude/plugin mirrors.
- Clarify English-only source policy and localization fixture carve-out.
- Add security guidance for prompt injection, secret handling, command
  execution, generated mirrors, and sandboxing expectations.

## 0.5.0

- Current public skill-pack baseline for Angular, NestJS, Next.js, product,
  design, test, documentation, review, repair, ship, git, Docker/auth/run-guide,
  and solution-builder workflows.
