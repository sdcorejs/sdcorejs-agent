# Release Process

The Git tag is the release version: pushing `1.0.0` releases artifact version
`1.0.0`. No manual version bumps or release commits are needed. Bare SemVer tags
are supported; legacy `v` tags and build metadata are not release triggers.
Prereleases such as `1.1.0-rc.1` publish under npm's `next` channel and produce a
GitHub prerelease. Stable versions use `latest`.

The private root workspace remains development tooling. Its `0.8.0` metadata,
the site and checked-in Claude manifests are source snapshots, not the version
of a generated release. Only staged artifact manifests receive the tag version.
A source checkout's Claude marketplace therefore retains its snapshot version;
use the versioned Claude ZIP when exact release metadata is required.

The release workflow validates that the tag resolves to the checked-out commit,
the tree is clean and the commit is already on `origin/main`. It reuses all CI
jobs, builds isolated artifacts, checks their SHA-256 sums, publishes the exact
npm tarball through OIDC, then creates the GitHub Release. Ordinary pushes and
PRs run verification only. Failed or skipped required jobs do not publish.

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
inventory contains 25 skills, the ceiling remains 25, and internal
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

## 4. One-time publisher setup

1. Confirm maintainer access to the public npm package `sdcorejs-agent`.
   GitHub repository access alone does not grant npm publish access.
2. If the package does not exist, use npm's authenticated first-package/staged
   publishing process to establish ownership before configuring OIDC. Staging
   a new package creates a public placeholder; it is a separate external action,
   not performed by the local build. Do not approve an unreviewed preview as a
   release. See [npm staged publishing](https://docs.npmjs.com/staged-publishing/).
3. In `sdcorejs-agent` npm package settings, add a GitHub Actions trusted publisher: owner
   `sdcorejs`, repository `sdcorejs-agent`, workflow **`release.yml`**, environment
   **`npm`**, with direct publish allowed. New configurations must make their
   first successful publication within npm's current expiry window (currently
   two days). See [trusted publishing](https://docs.npmjs.com/trusted-publishers/).
4. Create the GitHub `npm` environment, allow the release tags, and configure
   any desired maintainer review rules. The workflow requests `id-token: write`
   only in the publishing job; no stored registry token is needed. It pins
   Node 24.15.0 and npm 11.15.0 to support OIDC.
5. Protect `main` and release tags with repository rules. Review workflow changes
   before merging. The workflow must be present in the commit being tagged.

### Bootstrap a new package from a feature branch

For the first package only, use a reviewed feature-branch checkout and a separate
prerelease version such as `0.0.0-bootstrap.1`. Staged and published versions
share the same unique version index: staging `1.0.0` would prevent the tag
workflow from directly publishing `1.0.0` while that stage exists. See the
[npm stage command](https://docs.npmjs.com/cli/v11/commands/npm-stage/).

Use Linux, macOS or WSL with Git, supported Node, npm 11.15.0+ and Python 3.
Start from a clean clone of the reviewed commit, preserve other checkouts and
create a fresh output directory outside the repository. For example, with an
existing `/tmp` parent:

```bash
npm ci
npm run test:e2e:release
node scripts/release.mjs build --tag 0.0.0-bootstrap.1 --preview --out /tmp/sdcorejs-bootstrap-preview
npm stage publish /tmp/sdcorejs-bootstrap-preview/sdcorejs-agent-0.0.0-bootstrap.1.tgz --access public --tag next --ignore-scripts --dry-run
```

Verify `SHA256SUMS`, inspect the tarball and confirm its name is
`sdcorejs-agent`, version is `0.0.0-bootstrap.1`, public access is configured,
all 25 skills and shared refs are included, and no lifecycle scripts are present.
This preview is intentionally not a main/tag-certified release. Do not stage
from the private repository root without specifying the tarball.

When the maintainer has authorized the first-package bootstrap and authenticated
with `npm login`, use the same checked tarball:

```bash
npm whoami
npm stage publish /tmp/sdcorejs-bootstrap-preview/sdcorejs-agent-0.0.0-bootstrap.1.tgz --access public --tag next --ignore-scripts
npm stage list sdcorejs-agent
npm stage view <stage-id>
```

Only the staging command above uploads the candidate. For a new package npm
also creates a publicly visible `0.0.0-stage` placeholder. Keep the bootstrap
candidate staged; do not approve it, directly publish it, or create/push a Git
release tag. Record the stage ID, checksum, source commit and command results,
then configure the package's trusted publisher as described above. If the
bootstrap version already exists, inspect its status rather than overwriting
or rejecting it automatically. npm login/2FA stays with the maintainer; never
copy registry credentials into a prompt, report or Git.

## 5. Inspect archives before tagging

Use a fresh output directory whose parent exists, outside the repository:

```bash
npm run test:e2e:release
node scripts/release.mjs build --tag 1.0.0 --preview --out /tmp/sdcorejs-1.0.0-preview
cd /tmp/sdcorejs-1.0.0-preview
sha256sum --check SHA256SUMS
```

Preview mode allows uncommitted changes and does not require a real tag. It
records `preview: true` and input hashes, creates no tag, contacts no registry
for publication, and never certifies the candidate as a release. A production
build requires a clean tagged checkout and never uses `--preview`.
The builder needs Git, Node/npm and Python 3. Output directories are never
reused or overwritten. Public inputs come from tracked skill mirrors;
new canonical skills/refs must be committed and mirrors checked before release.

Artifacts:

| File | Purpose |
|---|---|
| `sdcorejs-agent-<version>.tgz` | npm package `sdcorejs-agent`: CLI, 25 native skills, shared refs, licenses and portable manifest; no installation hooks. |
| `sdcorejs-agent-openai-<version>.zip` | Skills-only OpenAI plugin with root `plugin.json`, icons and refs; no Claude lifecycle hooks. |
| `sdcorejs-agent-claude-<version>.zip` | Standalone Claude plugin, including its existing session hook, with tag-derived manifest version. |
| `release-manifest.json` | Commit, exact input file hashes, artifact SHA-256 hashes, npm integrity and version/channel. |
| `SHA256SUMS` | Verification of the archives and manifest. |

Extract and inspect the archives. Use a temporary project for a dry run and a
real install from the reviewed preview tarball:

```bash
npm exec --ignore-scripts --package=/tmp/sdcorejs-1.0.0-preview/sdcorejs-agent-1.0.0.tgz -- sdcorejs-agent install --agent codex --scope project --dry-run
```

Use `npm.cmd` and a Windows path in PowerShell or Command Prompt. See the
[installation guide](INSTALLATION.md) and [plugin testing guide](PLUGIN_SUBMISSION.md).

## 6. Release from main

After merging and reviewing all release evidence, update the changelog as needed.
Run `npm view sdcorejs-agent versions --json` and
`git ls-remote origin refs/tags/1.0.0` before tagging. Confirm the stable npm
version and Git tag are unused. Git tag `1.0.0` selects the exact artifact
version. The npm dist-tag `latest` is a registry alias. The workflow checks the
registry again and fails if the version already exists.

As the maintainer, use the exact reviewed main commit:

```bash
git switch main
git pull --ff-only
git tag -a 1.0.0 -m "Release 1.0.0"
git push origin 1.0.0
```

The tag is the publication action once publisher setup is complete. Do not push
it for a dry run. Watch `.github/workflows/release.yml`; success requires the
reused Skills/E2E, Site, Windows mirror, Node 18 standalone and three-platform preview CI jobs, artifact
checks, npm publication and GitHub Release creation. Automatic release notes
identify the CI run and distinguish deterministic checks from unrun Full E2E
and live-host evidence. Add the evidence from sections 2â€“3 to the final notes.

Push one release tag at a time and wait for completion, using increasing versions.
Never move a released tag or overwrite a registry version. Concurrency is scoped
to each tag so unrelated releases are not cancelled. Concurrent tags have no
channel ordering guarantee; an older unused stable version can change npm's
`latest` if published later.

## 7. Failure and recovery

- A tag validation or CI failure stops publication. Fix on a new main commit
  and select a new version; do not retarget an already published tag.
- Artifacts are uploaded to the Actions run before npm publication, so a missing
  publisher configuration leaves inspectable outputs and a failed run. After
  correcting configuration, rerun only if that version is still unpublished.
- npm name/version pairs are immutable. Re-running after a successful npm
  publish fails closed instead of silently treating an existing version as a
  pass. If GitHub Release creation alone failed, inspect registry integrity
  against `npmIntegrity` in the saved manifest, then create the release from
  the **same saved archives** and tag. Do not rebuild with different tools or
  republish a different payload under that version.
- OpenAI submission failure is independent of npm/GitHub publication; report
  it explicitly. A successful tag workflow does not mean directory approval.

## 8. OpenAI submission and post-release smoke

Upload the OpenAI ZIP through the official plugin submission portal under the
actual verified publisher identity. Required scans and OpenAI review remain
mandatory. The portable manifest provides truthful project metadata; complete
any remaining listing fields in the portal. No automatic portal upload or
approval is implemented. A skills-only plugin currently cannot add MCP after
publication; revisit the package shape before submitting if MCP is required.

See the [plugin testing and submission checklist](PLUGIN_SUBMISSION.md).

Official references:
- [Plugin package layout](https://developers.openai.com/plugins/build/plugins)
- [Submission requirements](https://developers.openai.com/plugins/deploy/submission)

After each actual publication, install the released artifact in an isolated
host, confirm all 25 skills and shared refs are available, and run the read-only
activation prompt from README. Record host/version, source/version and outcome.
Host tools, shell access and model capabilities are supplied by the host; they
are not added by the skill package. Keep skipped or unavailable hosts separate
from successful checks. Preserve old evaluation evidence without claiming it
certifies new artifact versions.
