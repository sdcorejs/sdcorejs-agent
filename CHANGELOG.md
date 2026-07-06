# Changelog

All notable changes to this repository should be documented here.

This project uses GitHub tags/releases for adopted versions. The root npm
package is private and is not published to npm.

## Unreleased

- Add hidden/control/bidi Unicode scanner and wire it into npm scripts, CI,
  Full E2E, lefthook, and regression tests.
- Fix Full E2E Windows command execution by running `.cmd`/`.bat` shims through
  a shell while preserving direct execution for real binaries.
- Document validation tiers, including the boundary between deterministic tests,
  Full E2E, and real-agent transcript evidence.
- Add adoption guidance, compatibility evidence expectations, fast-fix rules,
  a worked example, troubleshooting, real-agent validation template, and release
  process checklist.
- Expand security guidance with trust boundaries and safe mode policy.
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
