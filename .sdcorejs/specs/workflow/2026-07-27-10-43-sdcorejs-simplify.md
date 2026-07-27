---
artifact_id: spec-contract-sdcorejs-simplify-20260727-r1
artifact_kind: spec
change_ref: sdcorejs-simplify-20260727
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
name: sdcorejs-simplify
description: Approved behavior-preserving workflow utility contract for bounded executable-source simplification.
contract_id: contract-sdcorejs-simplify-20260727
requirement_id: req-sdcorejs-simplify-20260727
approvedAt: 2026-07-27T10:43:44+07:00
approvedBy: nghiatt15@onemount.com
approval_source: equivalent-complete-input
track: workflow
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: node-general
profile_confidence: high
sourceDraftPath: .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-spec.md
approved_spec_hash: 3e2195d10292a8bdda0412a62194b7dc4f2d540bde614fc18159388f67128b6c
acceptance_criteria_count: 25
manual_criteria_count: 2
redaction_applied: false
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# SDCoreJS Simplify Workflow Utility - Approved Spec

> Snapshot of the contract approved through equivalent complete user input at
> the `sdcorejs-spec` gate. Do not edit this snapshot; re-author through
> `sdcorejs-spec` if the contract changes.

## Approved contract

The complete approved contract is frozen in the source draft at
`.sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-spec.md`, identified
by SHA-256
`3e2195d10292a8bdda0412a62194b7dc4f2d540bde614fc18159388f67128b6c`.
It requires exactly one new dispatchable workflow utility,
`sdcorejs-simplify`, with current-diff and explicit-scope analyze/apply actions,
behavior-preserving boundaries, baseline and post-change verification,
runtime-only `simplify_context`, narrow routing, opt-in finish-gate placement,
downstream evidence integration, deterministic mutation coverage, regenerated
mirrors, public documentation, and no dependency, lockfile, package-version,
Git-history, release, or mutable-session changes.

The canonical acceptance contract is AC-001 through AC-025 in the source draft.
Those criteria are incorporated into this immutable snapshot by hash and
`sourceDraftPath`; the source draft is a required-with-change artifact under
the same `change_ref`.

## Decisions captured during review

- The detailed attached request is accepted as equivalent complete input and
  explicit approval for the spec.
- The observed baseline was revalidated as clean `main` at
  `c8fdf152e87153d8a0dd64921a66df5b8d6ea933`, with local and remote main equal
  and 24 canonical skills.
- `sdcorejs-simplify` is a workflow utility, not an implementation track.
- Verification is deterministic and offline; it is evidence, not a general
  semantic-equivalence proof.
- No product decision was reopened because the approved request resolved every
  material blocker.

## Skill provenance

sdcorejs-spec (approved on attempt 1 / 3 through equivalent complete input)
