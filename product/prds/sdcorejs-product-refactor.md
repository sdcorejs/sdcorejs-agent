---
projection_kind: r23-closure-prd
contract_id: sdcorejs-product-clean-finalization-r23
feature_id: sdcorejs-product-refactor
requirement_revision: 23
authority_location: immutable-evidence-worktree
source_spec_path: .sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md
source_spec_file_sha256: bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14
source_plan_path: .sdcorejs/plans/workflow/2026-07-24-00-40-sdcorejs-product-clean-finalization-r23.md
source_plan_file_sha256: cb680d692c380be84756b037378c19fe4467e87f249027e1a51ff9520c72e508
updated_at: 2026-07-24T02:16:05.7731469+07:00
---

# PRD - SDCoreJS Product Contract Refactor Finalization

## Problem

The product-contract refactor is valuable, but its R5-R22 recovery history is
too noisy for a reviewable pull request. The final delivery must preserve that
history as immutable evidence while projecting only the intended implementation
onto a clean branch.

The approved R23 spec and plan remain in the evidence worktree by design. They
are not copied into this final branch, and this projection does not replace or
rewrite them.

## Goal

Deliver one focused `sdcorejs-product` pull request from a pinned clean base,
with deterministic source selection, regenerated mirrors, repository-native
verification, zero unresolved high-severity review findings, an immutable
post-traceability verification tail, and no automatic R24.

## Users

| Role | Need |
|---|---|
| Maintainer | Review the product-contract implementation without recovery-only artifacts. |
| Product operator | Trace every approved R23 criterion to implementation and current evidence. |
| Reviewer | Distinguish repository-native verification from synthetic recovery-harness history. |
| Release owner | Receive a branch and pull request only after branch-ready passes. |

## In Scope

- Preserve the original checkpoint branch and its R16-R22 evidence.
- Build `refactor/sdcorejs-product-final` from pinned `origin/main`.
- Transplant 44 canonical/source paths and regenerate 91 mirrors.
- Exclude 40 recovery/session paths.
- Include the explicitly approved two-file site dependency audit repair.
- Repair repository-native findings inside R23 with regression coverage.
- Run focused, aggregate, security, site, review, traceability, audit, ship, and
  Git handoff gates in the approved order.

## Out Of Scope

- Retrying or repairing the R18-R22 recovery controller.
- Copying R5-R22 recovery specs, plans, fixtures, checkpoints, or summaries.
- Rewriting or force-pushing `refactor/sdcorejs-product`.
- Adding new product features or production-SDLC capabilities.
- Treating automated E2E as manual UAT.
- Creating or authorizing R24 automatically.

## Success Criteria

The authoritative criteria are `AC1` through `AC15` in the approved R23 spec.
This projection indexes them by source rather than replacing their wording.

| Criterion group | IDs | Outcome |
|---|---|---|
| Evidence preservation and isolation | AC1-AC5 | Original recovery evidence remains intact and absent from the final diff. |
| Canonical generation and verification | AC6-AC9 | Sources, mirrors, tests, hygiene, and security gates pass. |
| Repair and review closure | AC10-AC11 | Genuine findings are repaired with coverage and no high-severity finding remains. |
| Immutable final tail | AC12-AC13 | Traceability is the final content write and the final diff remains exact and reviewable. |
| Git handoff and terminal boundary | AC14-AC15 | Branch-ready precedes commit/push/PR and no R24 is created. |

Source: immutable R23 approved spec at file SHA-256
`bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14`.

## Current Delivery State

R23 tasks 1-11 are evidenced through the pre-traceability closure, including
the repository-native review repair. `AC12` through `AC15` remain intentionally
open until the post-sync deny-write gates, exact staging, commit, push, and pull
request complete. This PRD does not pre-approve those outcomes.
