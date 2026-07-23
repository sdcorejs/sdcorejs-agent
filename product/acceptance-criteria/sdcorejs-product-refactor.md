---
projection_kind: r23-closure-acceptance-criteria
contract_id: sdcorejs-product-clean-finalization-r23
feature_id: sdcorejs-product-refactor
requirement_revision: 23
authority_location: immutable-evidence-worktree
source_spec_path: .sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md
source_spec_file_sha256: bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14
updated_at: 2026-07-24T02:16:05.7731469+07:00
---

# Acceptance Criteria - SDCoreJS Product Contract Refactor Finalization

The criterion text below is projected from the immutable approved R23 spec.
Each source hash is the SHA-256 of that criterion after whitespace
normalization. Status is derived at the traceability-sync boundary and does not
pre-claim later ship or Git outcomes.

| ID | Story | Approved criterion | Source hash | Verification | Sync status |
|---|---|---|---|---|---|
| AC1 | US-R23-01 | Record and preserve the original branch, checkpoint HEAD, upstream, dirty manifest, and R16-R22 untracked identities. | `95e7befa055ab3fdb7fe7b2121073f576e2ed0678faa9da7064a26f2473d2977` | Source freeze and immutable checkpoint evidence | verified |
| AC2 | US-R23-01 | Do not rerun, edit, execute, or treat R22 as successful product verification. | `6c3bbad9e688404f47c643ba539a93be85bd5cab6ed8ceb20f1a0cd7f852f461` | Process boundary and closeout review | verified |
| AC3 | US-R23-01 | Create the final branch in an isolated sibling worktree from the verified base without rewriting the original. | `35ddf21acbe36144444c29bb85e862b5a52faf7b2547793ee041dd3d60389b2d` | Git worktree identity checks | verified |
| AC4 | US-R23-02 | Account for every checkpoint path as included work, regenerated mirror, or excluded recovery/session evidence. | `37242a0245697fc8b2845cd673d902f067e4046cf65688b9a395044f6c2c5d0f` | 44/91/40 deterministic classification | verified |
| AC5 | US-R23-01 | Keep R5-R22 recovery artifacts and external recovery residue out of the final branch diff. | `06e72c05cfdd5f53058db2dff049437dff476c40bebca7da353276f4021ca173` | Changed-path and residue scans | verified |
| AC6 | US-R23-02 | Transplant canonical sources before regenerating every mirror through the repository sync command. | `26c188a6ddb8a8e169498ce734f2e80d2f40e21a129541138530a3e94975ab82` | Sync plus Node/PowerShell parity checks | verified |
| AC7 | US-R23-03 | Pass focused product, runner, and parallel protocol tests on the clean branch. | `cb47c2f4efc8fa5c8ebccbc3837b94588e3d70b2a107e1e1dff7b6c25fe0404a` | Product 80/80, phase 1 124/124, parallel 86/86 | verified |
| AC8 | US-R23-02 | Pass Node and Windows PowerShell mirror checks and text hygiene. | `aa3efa2fd160c9fb9b2fa4ba81d8516ac713d8bf0eadc4a607c1b8cdb4303111` | Both mirror checks and 729-file hygiene scan | verified |
| AC9 | US-R23-03 | Pass full repository E2E and required dependency/security checks, or report an external limitation without readiness. | `7318a852396652d90ddbb5e3d1d595ac25c0d6bc95d24d9c6eee0fb5c769b71b` | Repository 220/220, aggregate pass, root/site audits zero, site build pass | verified |
| AC10 | US-R23-03 | Repair every repository-native finding in R23 with regression coverage and waive none of the required gates. | `0a07eaa11da4b2c781ca0740ce37a9dd837739ab7ac5468248b1bbbaeeab1af0` | Three bounded repair passes plus RED/GREEN review repair | verified |
| AC11 | US-R23-03 | Reach zero unresolved critical or high read-only review findings before final documentation and traceability. | `dd4586ddfe6910b05dff110e070ab8396049b09374d7fbf660183b21b3759133` | Complete read-only review and post-repair review | verified |
| AC12 | US-R23-04 | Make traceability sync the final content write, then run deny-write verification, zero-write product audit, and both ship gates. | `a9a47202efa4c5c31edb6029b0f219e362dd3ab6b837b5554848039d3d0640b3` | This sync plus pending Task 11 gates | partial |
| AC13 | US-R23-04 | Keep the final diff reviewable and limited to intended paths, with `git diff --check` passing. | `e1d1205ebc85c9e9511b0e1cd318c6e99518248c4c67ec648677836a5af3f44e` | Diff checks pass; final frozen path/stage proof pending | partial |
| AC14 | US-R23-05 | Commit, push, and open the PR only after branch-ready, on the final branch without rewriting the checkpoint branch. | `326ffaef85bf23564eaa4c9b7bfa930020bee67811fdb100463fb9f7c7e19133` | Pending Tasks 11-13 | pending |
| AC15 | US-R23-05 | End R23 with a verified PR or direct genuine blocker and do not create or authorize R24 automatically. | `cdd06f1574da3564e68515e7ebb3e919ecf15d2d72e52f659147253516e7077b` | No R24 exists; terminal PR/blocker outcome pending | partial |

## Retired Requirement Index

None. R23 does not retire or reuse an acceptance-criterion ID.

## Manual UAT Policy

The approved R23 contract defines engineering command, review, ship, and Git
gates; it does not define a manual business-UAT execution requirement.
Automated E2E remains verification only. The companion checklist is available
for human PR acceptance, and no UAT pass is claimed.
