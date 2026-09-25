---
artifact_id: draft-plan-skill-body-progressive-loading-20260925-r2
artifact_kind: execution-doc
change_ref: skill-body-progressive-loading-20260925
source_spec: .sdcorejs/specs/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
source_architecture: none
source_plan: .sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
commit_policy: with-change
owner: sdcorejs-plan
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
source_revision: b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87
status: draft
revision: 2
supersedes: .sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md
---
# Skill body progressive loading — plan r2

# Bounded evidence-record exemption delta

This revision extends the approved r1 plan (.sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md,
sha256:v1:5e1637d40af0a2c9eb2a607ed826981e0e630d14a82fbc55cd3155c8bba13646) by one canonical test path:
`test/e2e/npm-publication-contract.test.mjs`.

Observed problem: `npm publication: workflows and repository configuration cannot
publish to npm` scans every repository JSON file with `\bprovenance\s*:`. The new
evidence record `authoring/evals/skill-body-progressive-loading.json` must contain
the required case id `case-ui-review-target-provenance:` in its transcript
excerpt, so it is misclassified as an active publication surface. The
interaction/finish record is exempt through `EVALUATION_EVIDENCE_RECORDS` in the
same test.

Change: add exactly `'authoring/evals/skill-body-progressive-loading.json'` to
`EVALUATION_EVIDENCE_RECORDS`. No pattern, assertion or other file changes. The
existing guard that every exempt record is not an active publication surface
stays in force. The evidence record does not bind this test file, so it stays
current; its scope authority remains r1 for the manifest it binds.

Verification: `node --test test/e2e/npm-publication-contract.test.mjs`, then
`npm run test:e2e:repository`, then verify-before-done and read-only
branch-ready. No dependency, public-skill, Git or product-repository writes. The
spec and r1 plan snapshots remain immutable; all r1 tasks, paths and finish
policy remain unchanged apart from this single added path.

Additional governance paths:
- `.sdcorejs/docs/workflow/2026-09-25-15-40-skill-body-progressive-loading-plan-r2.md`
- `.sdcorejs/plans/workflow/2026-09-25-15-40-skill-body-progressive-loading-r2.md`
