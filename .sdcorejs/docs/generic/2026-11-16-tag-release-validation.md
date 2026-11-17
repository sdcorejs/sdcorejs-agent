---
artifact_id: validation-tag-release-20261116
artifact_kind: execution-doc
change_ref: tag-release-20261116
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

# Tag release validation

Implementation on `codex/publish-npm-chatgpt`, based on the merged main commit
above. This is local implementation evidence, not an npm publication, OpenAI
approval or certification of version 1.0.0. No release tag was created in the
real repository, and no historical evaluation file was changed.

## Acceptance and verification

| Acceptance | Evidence | Outcome |
|---|---|---|
| AC-1: tag/version mapping | Strict stable/prerelease and malformed-tag controls; actual npm and both ZIP manifest versions | Passed |
| AC-2: publication boundary | Tag-to-HEAD, clean-tree, main-ancestry negatives; reusable CI, tag-only event, repository restriction, OIDC job and artifact-retention assertions; independent workflow review | Passed locally; hosted Actions/OIDC NOT RUN |
| AC-3: public distribution | 25 skills per artifact; private root retained; isolated fresh staging; symlink rejection; licenses; input hashes/modes; no npm installation hooks/dependencies | Passed |
| AC-4: actual artifact behavior | Two independent reproducible builds; extracted Node helper; 551 concrete native references; portable manifest schema; direct Claude hook after real unzip | Passed on Linux |
| AC-5: setup and limitations | Release guide covers npm name ownership/bootstrap, trusted publisher, source snapshot metadata, recovery and separate OpenAI review | Reviewed; external setup NOT PERFORMED |

Commands and results:

- `npm run test:e2e:release`: exit 0, 15 passed, no skips.
- The repository test command from `test:e2e:repository`, before its separate
  `&& npm run test:e2e:cleanup` suffix: exit 0, 902 passed, no skips. The native
  cleanup suffix was not run on this workspace's unsupported filesystem.
- `npm run check:skills`: exit 0, all mirrors and adapters synchronized.
- `npm run check:text-hygiene`: exit 0.
- Production-mode smoke in an isolated temporary Git repository: clean annotated
  tag `1.0.0` on its synthetic main, build without `--preview`, checksums,
  unchanged checkout, and direct extracted hook invocation: exit 0. This fixture
  is not a real project release.

Full project `npm test`, native cleanup, Windows/macOS host execution, actual
registry authentication/publication, hosted CI and live agent activation were
not run for this change. The release workflow requires complete CI, including
native cleanup and Windows mirror verification, before publication. Local
packaging evidence cannot substitute for those future checks.

## Independent review and repairs

Fresh read-only auditors separately reviewed publication workflow boundaries
and actual distribution archives. Their final reviews found no remaining
material defect in the reviewed scope. Repairs were verified against the
amended inputs:

1. Global GitHub concurrency could cancel another tag's pending release.
   Concurrency now includes the tag ref; the guide states one release tag at a
   time and no cross-tag channel-order guarantee. A regression first failed,
   then passed after the fix.
2. The Claude ZIP lost executable bits on its two startup hook files. Staging
   now derives executable intent from Git, preserves it in ZIP metadata and
   normalizes only the staged polyglot wrapper to LF. The extracted hook test
   first exposed permission failure, then CRLF failure, and now executes.
3. The upload-order assertion originally accepted a missing upload step because
   its index was -1. The corrected assertion rejects removal and reordering.

Initial repository verification also exposed a stale project-summary dependency
fingerprint after adding release scripts. Its content and fingerprint were
refreshed; the final repository run passed. A standalone Python smoke harness
initially invoked the polyglot hook without its host shell; the corrected smoke
uses the same shell command as the plugin hook configuration. Failed attempts
remain in local evidence alongside the successful reruns.

## NVIDIA evidence boundary

Installed authoring prerequisites passed with explicit restored skill roots;
NVIDIA SkillEvaluator is 0.9.0. An extracted, unchanged `sdcorejs-explore` skill
received keyless quality score 86.2/B (exit 0), with publication status
`incomplete`. Tier 1 health-check exited 1 because SkillSpector's version probe
failed; full scanner coverage is INCOMPLETE. No fresh Tier 2/3 or provider-backed
evaluation was required or run for unchanged skill content. Historical model
evaluation results are not upgraded by this packaging change.

Evaluation provider API calls: 0. Independent reviewers used the host's Codex
agents; exact model build, token usage and cost telemetry were not exposed.

## Source binding and local evidence

Final reviewed input manifest SHA-256:
`66fcbbbf9e8ea17649d044967335934ea1479e49dac93f4e5235e14f1549dbcb`.
It covers the thirteen implementation, documentation and test inputs before
this additive evidence record. Key bindings:

| Input | SHA-256 |
|---|---|
| `scripts/release.mjs` | `678f89d09089fa92560241205ffa94cada453444bcc747b5c7e9e545d1dbdbbb` |
| `.github/workflows/release.yml` | `fc42461ab8fe0ec5288cd70cfac5144d0ca8699ac43cf6dae454a3de38806000` |
| `test/e2e/tag-release.test.mjs` | `7e7f73a2e25da89043e6379fbee8cb47b344fcce9846ffa14bb0414a02cfbfc4` |

Raw logs, command/exit receipts and input manifests are local-only under
`/workspace/work/sdcorejs-tag-release-20261116/`. Independent archive evidence
is under `/workspace/work/sdcorejs-package-audit-AglsWNxW/`. These paths describe
this execution environment and are not durable public download links. Each
generated release manifest records its actual Node, npm and Python versions;
the hosted publication job pins Node 24.15.0 and npm 11.15.0. The exact hosted
toolchain and OIDC operation still require the first authorized release run.
