---
projection_kind: r23-closure-decisions
contract_id: sdcorejs-product-clean-finalization-r23
feature_id: sdcorejs-product-refactor
requirement_revision: 23
authority_location: immutable-evidence-worktree
source_spec_path: .sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md
source_spec_file_sha256: bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14
updated_at: 2026-07-24T02:16:05.7731469+07:00
---

# Product Decisions - SDCoreJS Product Contract Refactor Finalization

| Decision ID | Date | Decision | Reason | Impacted IDs | Approval source |
|---|---|---|---|---|---|
| DEC-R23-01 | 2026-07-24 | Finalize through one clean R23 branch and do not create R24 automatically. | The recovery chain had become review noise; a direct blocker is preferable to another synthetic recovery revision. | AC1-AC15 | Approved R23 spec and explicit user approval |
| DEC-R23-02 | 2026-07-24 | Preserve `refactor/sdcorejs-product` as immutable evidence and build `refactor/sdcorejs-product-final` from pinned `origin/main`. | This keeps recovery evidence intact and yields a reviewable branch without history rewriting. | AC1, AC3, AC14 | Approved R23 spec and plan |
| DEC-R23-03 | 2026-07-24 | Treat R22 as a synthetic-harness exception, not product verification, and never retry it in R23. | Repository-native tests, audits, and review provide the relevant final evidence. | AC2, AC7-AC11 | Approved R23 spec and plan |
| DEC-R23-04 | 2026-07-24 | Use the 44 source / 91 mirror / 40 exclusion projection. | Deterministic classification prevents recovery artifacts from entering the PR. | AC4-AC6, AC13 | Approved R23 plan |
| DEC-R23-05 | 2026-07-24 | Add exactly `site/package.json` and `site/package-lock.json` as a bounded same-R23 repair exception. | The mandatory site audit exposed current advisories; Astro 7.1.3 and SVGO 4.0.2 restore a clean production audit. | AC9, AC10, AC13 | Explicit user choice 1 |
| DEC-R23-06 | 2026-07-24 | Do not use the product protocol under refactor to self-authorize its own pull request. | The R23 generic authority snapshots intentionally remain outside the clean branch and do not carry the new product-context authority schema. Tests verify the protocol; the approved R23 plan governs this closure packet. | AC10-AC13 | R23 authority boundary and evidence-preservation rule |
| DEC-R23-07 | 2026-07-24 | Make this six-file traceability packet the final content write. | Every later content edit would stale the post-sync evidence and restart Tasks 10-13. | AC12-AC15 | Approved R23 spec and plan |
| DEC-R23-08 | 2026-07-24 | Keep manual UAT explicitly `not_run`. | No manual business-UAT result was supplied, and automated E2E must not be promoted to UAT. | AC7, AC9, AC12 | Product evidence policy |

## Authority Note

The approved R23 spec and plan reside in the immutable evidence worktree and
are intentionally absent from the final branch. Their full file SHA-256 values
are respectively
`bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14`
and
`cb680d692c380be84756b037378c19fe4467e87f249027e1a51ff9520c72e508`.
This file projects decisions; it does not modify those authority records.
