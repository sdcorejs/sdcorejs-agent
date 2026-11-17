---
artifact_id: validation-tag-release-scoped-package-20261116
artifact_kind: execution-doc
change_ref: tag-release-scoped-package-20261116
source_spec: .sdcorejs/specs/generic/2026-11-16-tag-release.md
source_plan: .sdcorejs/plans/generic/2026-11-16-tag-release.md
commit_policy: with-change
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
track: generic
stack_profile: node-general
source_revision: e4e07cd60d7c033e9a96a1247712230db9e6432e
---

# Scoped npm package continuation

The user selected `@sdcorejs/agent` as the public npm package name. The staged
manifest now uses that name and public access. README installation paths,
publisher setup, package documentation and release checks reflect this choice.
npm still names the archive `sdcorejs-agent-<version>.tgz`. GitHub and plugin
identities remain `sdcorejs-agent`; the private authoring workspace is not the
published package. Existing dirty work and earlier validation reports remain.

Current verification:

- Authoring prerequisites with restored roots: exit 0, ready; evaluator 0.9.0.
- Added identity/access controls failed before implementation (exit 1), then
  `npm run test:e2e:release` passed all 15 tests (exit 0, no skips).
- `npm run check:text-hygiene`: exit 0.
- Preview build and `npm publish <tarball> --dry-run --ignore-scripts --json`:
  exit 0; package identity `@sdcorejs/agent@1.0.0`, public access, 458 files.
- Fresh read-only independent review found no findings. An offline local-tarball
  install exited 0 and verified `node_modules/@sdcorejs/agent`, shared refs and
  preserved plugin identity. All eight reviewed input hashes matched afterward.

Review manifest SHA-256:
`1f1b49e0c2835b2d36af9f3369387b3484514156c34abedf140d3f3d085bbb0c`.
Incremental diff SHA-256:
`978554d506163a2035155ec78702c642b0aef620a21977cd0287f1401617234d`.
Local-only command receipts, baseline copies and hashes are under
`/workspace/work/sdcorejs-scoped-package-ctf8hkm1/`.

This supersedes the earlier npm identity and changed-file bindings only; it
does not rerun or upgrade the earlier full-repository evidence. Scope ownership,
live npm publication and hosted OIDC execution remain unverified. No registry
publication, release tag or provider evaluation was performed. Skill bodies
were unchanged, so new NVIDIA model/scanner evaluation was not applicable.
