---
updated_at: 2026-07-06T21:31:00+07:00
status: complete
track: generic
active_skill: sdcorejs-git
branch: chore/release-validation-hardening
---

# Current Session Checkpoint

## User Request
Fix all improvement items from the external ChatGPT review.

## Tasks
- [x] Add hidden/control/bidi Unicode hygiene checks in script, CI, and pre-commit.
- [x] Add regression coverage for Codex mirror path and validation tiers.
- [x] Update adoption docs: validation tiers, compatibility, worked example, troubleshooting, fast-fix, and when not to use.
- [x] Strengthen security and release guidance.
- [x] Regenerate mirrors if source skills or refs change.
- [x] Run verification and report any external follow-up.

## Current State
- Last completed: Ran text hygiene, mirror checks, PowerShell mirror checks, whitespace diff check, and local E2E suite.
- In progress: none.
- Blocked/skipped: Full local E2E with `SDCOREJS_E2E_FULL=1` reached Docker Compose but failed because Docker Desktop Linux daemon is not running. GitHub release publication and GitHub Actions dispatch still require maintainer credentials.

## Artifacts Touched
- EDIT .sdcorejs/tasks/current-session.md - current hardening checkpoint.
- ADD scripts/check-text-hygiene.mjs - hidden/control/bidi Unicode scanner.
- EDIT package.json - text hygiene npm script.
- EDIT .github/workflows/ci.yml - CI text hygiene check.
- EDIT .github/workflows/full-e2e.yml - Full E2E text hygiene check.
- EDIT lefthook.yml - pre-commit/check text hygiene and broader mirror staging.
- EDIT test/e2e/skill-pack-runner.test.mjs - regression tests.
- EDIT test/e2e/golden-target-app.test.mjs - Windows command shim regression.
- EDIT test/e2e/support/golden-target-app.mjs - Full E2E Windows `.cmd`/`.bat` executor fix.
- ADD docs/ADOPTION.md - adoption and compatibility guidance.
- ADD docs/WORKED_EXAMPLE.md - full workflow example.
- ADD docs/TROUBLESHOOTING.md - troubleshooting guide.
- ADD docs/REAL_AGENT_VALIDATION.md - real-agent evidence template.
- ADD docs/RELEASE_PROCESS.md - release checklist.
- EDIT README.md - links and fast-fix/release guidance.
- EDIT TESTING.md - validation boundary and text hygiene notes.
- EDIT VALIDATION.md - validation tiers and CI coverage.
- EDIT SECURITY.md - trust boundary and safe mode.
- EDIT CHANGELOG.md - unreleased hardening entries.

## Verification
- node --test --test-name-pattern "text hygiene scanner" test/e2e/skill-pack-runner.test.mjs - pass.
- npm run check:text-hygiene - pass, 578 files scanned.
- node --test --test-name-pattern "generated mirrors|public validation docs" test/e2e/skill-pack-runner.test.mjs - pass.
- npm run check:skills - pass.
- npm run check:skills:ps - pass.
- git diff --check - pass.
- npm test - pass, 26/26.
- SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4 - blocked by Docker daemon not running after the Windows command shim fix allowed the run to reach `docker compose up`.

## Resume From Here
Use `git diff` to review the hardening changes. Start Docker Desktop and rerun Full E2E, then publish a GitHub release from maintainer credentials.
