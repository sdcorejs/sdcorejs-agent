---
projection_kind: r23-closure-uat-checklist
contract_id: sdcorejs-product-clean-finalization-r23
feature_id: sdcorejs-product-refactor
requirement_revision: 23
authority_location: immutable-evidence-worktree
source_spec_path: .sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md
source_spec_file_sha256: bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14
updated_at: 2026-07-24T02:16:05.7731469+07:00
---

# UAT Checklist - SDCoreJS Product Contract Refactor Finalization

R23 contains no approved manual business-UAT execution gate. These scenarios
are reviewer aids, not recorded UAT executions. Automated tests and builds do
not change their status, and no manual pass is claimed.

| Scenario ID | Requirement IDs | Manual steps | Expected result | Owner | Status |
|---|---|---|---|---|---|
| UAT-R23-01 | AC1-AC5 | Compare the PR path list with the closeout classification and inspect the checkpoint branch separately. | Recovery history remains preserved and absent from the PR diff. | Maintainer reviewer | not_run |
| UAT-R23-02 | AC6-AC8 | Review canonical product-contract sources beside generated mirrors and the focused test report. | Mirrors are derived, readable contracts match executable behavior, and focused suites pass. | Technical reviewer | not_run |
| UAT-R23-03 | AC9-AC11 | Inspect aggregate test, dependency audit, site build, and read-only review evidence. | No required gate is waived and no critical or high finding remains. | Security/QC reviewer | not_run |
| UAT-R23-04 | AC12-AC13 | Compare the frozen post-sync hashes before and after all deny-write gates. | Content and exact approved path projection remain byte-identical. | Release reviewer | not_run |
| UAT-R23-05 | AC14-AC15 | Inspect branch-ready output, commit identity, remote branch identity, and PR base/head. | The PR targets `main` from `refactor/sdcorejs-product-final`, the checkpoint branch is unchanged, and no R24 exists. | Release owner | not_run |

## Execution Record

No manual UAT execution result was supplied or recorded. A future human review
must create a separate execution record rather than editing these approved
scenario definitions or treating repository E2E as UAT.
