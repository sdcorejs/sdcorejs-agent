---
projection_kind: r23-closure-user-stories
contract_id: sdcorejs-product-clean-finalization-r23
feature_id: sdcorejs-product-refactor
requirement_revision: 23
authority_location: immutable-evidence-worktree
source_spec_path: .sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md
source_spec_file_sha256: bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14
updated_at: 2026-07-24T02:16:05.7731469+07:00
---

# User Stories - SDCoreJS Product Contract Refactor Finalization

These stories are a readable grouping of the approved R23 criteria. The
immutable R23 spec remains normative.

| Story ID | As a | I want to | So that | Priority | Acceptance criteria |
|---|---|---|---|---|---|
| US-R23-01 | Maintainer | preserve the checkpoint branch and isolate final delivery work | recovery evidence remains available without entering the review diff | required | AC1, AC2, AC3, AC5 |
| US-R23-02 | Maintainer | classify every checkpoint path and regenerate mirrors from canonical sources | the final branch has a deterministic, explainable projection | required | AC4, AC6, AC8 |
| US-R23-03 | Reviewer | use repository-native tests, audits, and review evidence | synthetic harness history cannot hide a current defect | required | AC7, AC9, AC10, AC11 |
| US-R23-04 | Product operator | make traceability the final content write and verify the frozen state afterward | product evidence describes exactly what is handed to Git | required | AC12, AC13 |
| US-R23-05 | Release owner | allow Git handoff only after branch-ready and end R23 without an automatic successor | delivery has one controlled terminal outcome | required | AC14, AC15 |

## Authority

- Approved spec:
  `.sdcorejs/specs/workflow/2026-07-24-00-09-sdcorejs-product-clean-finalization-r23.md`
  in the immutable evidence worktree.
- File SHA-256:
  `bf5ea9a8b57e3a48f4bcb8ddf1fc622af1941b63a7f7dc04f9b500d609d95c14`.
- Approval: explicit user approval recorded by the approved R23 snapshot.

No story in this file adds observable product behavior beyond `AC1`-`AC15`.
