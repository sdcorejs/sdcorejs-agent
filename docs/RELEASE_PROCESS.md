# Release Process

Use this checklist when cutting an adopted `sdcorejs-agent` release. The root
Node workspace is private and is not distributed through npm. Git tags and
GitHub releases are the distribution anchors.

## 1. Preflight

```bash
git status --short
npm ci
npm run check:text-hygiene
npm run sync:skills
npm run check:skills
npm run test:e2e:decision-coverage
npm run test:e2e:architecture
npm run test:e2e:validation-map
npm run test:e2e:convergence
npm run test:e2e:skill-authoring
npm run test:e2e:communication-economy
npm run test:e2e:documentation-layout
npm run report:communication-economy
npm run test:e2e:harness
npm run test:e2e
npm audit --omit=dev
```

On Windows, also run:

```powershell
npm run check:skills:ps
```

For the showcase site, run:

```bash
cd site
npm ci
npm audit --omit=dev
npm run build
```

## 2. Full E2E Evidence

Run the heavyweight workflow in one of two ways:

- Preferred: dispatch `.github/workflows/full-e2e.yml` from GitHub Actions.
- Local fallback: run `SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4` in a
  prepared environment.

Record the successful Actions URL or local command output in release notes.

## 3. Real-Agent Evidence

Capture sanitized live-tool evidence using `docs/REAL_AGENT_VALIDATION.md`.
For full live-agent coverage, capture Claude Code, Codex attached repo, Codex
native skills, Cursor, and GitHub Copilot evidence. State any unvalidated tool
surfaces explicitly.

Keep deterministic contract evidence, prepared-environment Full E2E, and
authorized live-agent evidence in separate release-note rows. A deterministic
pass cannot upgrade `NOT RUN` Full E2E or live evidence. Confirm the public
inventory contains 22 skills, the ceiling remains 23, and internal
`authoring/skills/sdcorejs-skill-authoring` appears in no mirror, adapter
manifest, marketplace inventory, or site catalog.
Confirm decision-boundary authority matches its approved artifact, convergence
has a verified receipt bound to approved change/mode, and internal distribution
and provider-dependency scans recurse through package lockfiles and mirrors.

For Communication Economy Policy claims, distinguish deterministic contract
measurements from an optional live A/B eval. A valid live record includes the
source commit, harness version, tool/model, reasoning effort, input token,
cached input token when available, output token, total token, outcome,
approval/evidence completeness, and sanitized transcript reference. Record
missing credentials, isolation, or comparable usage telemetry as `skipped`;
never substitute an estimate or a marketing reduction claim.

## 4. Changelog And Version

- Move relevant `CHANGELOG.md` items from `Unreleased` into the release heading.
- Keep the root, site, marketplace, and plugin versions as synchronized
  repository/plugin release metadata. Bump them together only when the adopted
  release decision requires a new version.
- Re-run mirror sync after any source skill, ref, or entrypoint change.

## 5. Tag

```bash
git tag -a v<version> -m "v<version>"
git push origin v<version>
```

Use a patch release for hygiene-only fixes, for example `v0.5.1`.

## 6. Repository Metadata

Confirm GitHub metadata uses the project positioning:

```bash
gh repo edit sdcorejs/sdcorejs-agent --description "Portable SDLC skill pack for AI coding agents, with generated mirrors for Claude Code, Codex, Cursor, and Copilot."
```

This requires a maintainer token. If the command is not available, update the
repository description through GitHub Settings before publishing the release.

## 7. GitHub Release Notes

Include:

- Summary of user-visible workflow, validation, security, or packaging changes.
- Validation commands and their result.
- Link to the latest successful CI run.
- Link to the latest successful Full E2E run, or a clear limitation if missing.
- Real-agent transcript evidence summary.
- Harness/model/source-commit/scenario/outcome metadata for every optional live
  eval, or an explicit not-run reason.
- Communication Economy Policy profile, handoff mode, required-field parity,
  and deterministic-versus-live measurement label.
- Upgrade notes for plugin/native skill users.
- Known limitations.

Create the release from the pushed tag:

```bash
gh release create v<version> --title "v<version>" --notes-file <release-notes-file>
```

## 8. Post-Release Smoke

After publishing the GitHub Release:

- Install from the tagged release using each supported distribution path that is
  claimed in the notes.
- Confirm mirrors are present: `.claude/skills`, `plugin/skills`,
  `codex/skills`, and `.cursor/rules`.
- Confirm each adapter `sdcorejs-harness.json` has the current canonical source
  hash and 22-skill mapping.
- Confirm `docs/ADOPTION.md` and `docs/TROUBLESHOOTING.md` still match the
  release instructions.
