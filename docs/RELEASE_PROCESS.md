# Release Process

Use this checklist when cutting an adopted `sdcorejs-agent` release. The root
package is private; Git tags and GitHub releases are the distribution anchors.

## 1. Preflight

```bash
git status --short
npm ci
npm run check:text-hygiene
npm run sync:skills
npm run check:skills
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

## 4. Changelog And Version

- Move relevant `CHANGELOG.md` items from `Unreleased` into the release heading.
- Bump `package.json` only when the source package version is part of the
  adopted release decision.
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
- Upgrade notes for plugin/native skill users.
- Known limitations.

Create the release from the pushed tag:

```bash
gh release create v<version> --title "v<version>" --notes-file <release-notes-file>
```

## 8. Post-Release Smoke

After publishing:

- Install from the tagged release using each supported distribution path that is
  claimed in the notes.
- Confirm mirrors are present: `.claude/skills`, `plugin/skills`,
  `codex/skills`, and `.cursor/rules`.
- Confirm `docs/ADOPTION.md` and `docs/TROUBLESHOOTING.md` still match the
  release instructions.
