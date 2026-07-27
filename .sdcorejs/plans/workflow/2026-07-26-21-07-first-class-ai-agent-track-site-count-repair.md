---
artifact_id: plan-contract-first-class-ai-agent-track-20260725-r2
artifact_kind: plan
change_ref: contract-first-class-ai-agent-track-20260725
source_spec: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
source_plan: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
commit_policy: with-change
owner: sdcorejs-plan
name: first-class-ai-agent-track-site-count-repair
description: Approved corrective plan for the two public site skill-count labels omitted from the original allowlist.
approvedAt: 2026-07-26T21:40:36+07:00
approvedBy: nghiatt15@onemount.com
approval_source: explicit-user-choice
track: workflow
sourceSpecPath: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
taskCount: 3
phaseCount: 2
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: node-general
approved_spec_hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
allowed_paths:
  - .sdcorejs/docs/workflow/2026-07-26-21-07-first-class-ai-agent-track-site-count-repair-plan.md
  - .sdcorejs/plans/workflow/2026-07-26-21-07-first-class-ai-agent-track-site-count-repair.md
  - site/src/pages/index.astro
  - site/src/components/Install.astro
prohibited_paths:
  - package-lock.json
  - site/package-lock.json
  - node_modules/**
  - site/node_modules/**
  - site/dist/**
  - .env*
  - "**/*secret*"
  - "**/*credential*"
  - session/**
  - checkpoint/**
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
approved_plan_hash: aedee2e4aaade2e4872db39b7213961afd1afaa225f87e80bce68e6bf433984a
supersedes: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
change_control:
  revision: 2
  supersedes: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
  change_reason: Final review found two current public site counts outside the r1 allowed paths.
---

# First-class AI Agent Track Site Count Repair - Approved Plan

> Snapshot of what the user approved at the `sdcorejs-plan` gate. Do not edit by hand; re-author through `sdcorejs-plan` if the contract changes.

## Approved contract

# Plan Revision - First-class AI Agent Track Site Count Repair

## Scope

Repair two public site strings that still advertise 23 skills after the
approved first-class `sdcorejs-ai-agent` track raised the canonical inventory
to 24. Preserve every contract, implementation, and verification decision from
the approved r1 plan; this revision changes only the omitted public count
labels and final verification.

```yaml
plan_context:
  source: sdcorejs-plan
  contract_id: contract-first-class-ai-agent-track-20260725
  requirement_id: req-first-class-ai-agent-track-20260725
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
  approved_spec_hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
  approved_plan_path: .sdcorejs/plans/workflow/2026-07-26-21-07-first-class-ai-agent-track-site-count-repair.md
  approved_plan_hash: aedee2e4aaade2e4872db39b7213961afd1afaa225f87e80bce68e6bf433984a
  supersedes: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  stack_profile: node-general
  task_count: 3
  phase_count: 2
  allowed_paths:
    - .sdcorejs/docs/workflow/2026-07-26-21-07-first-class-ai-agent-track-site-count-repair-plan.md
    - .sdcorejs/plans/workflow/2026-07-26-21-07-first-class-ai-agent-track-site-count-repair.md
    - site/src/pages/index.astro
    - site/src/components/Install.astro
  prohibited_paths:
    - package-lock.json
    - site/package-lock.json
    - node_modules/**
    - site/node_modules/**
    - site/dist/**
    - .env*
    - "**/*secret*"
    - "**/*credential*"
    - session/**
    - checkpoint/**
  dependency_changes:
    required: false
    approval_required: false
  env_changes:
    required: false
    approval_required: false
  migration_changes:
    required: false
    approval_required: false
  package_manager:
    name: npm
    version: 10.9.2
    evidence:
      - packageManager in package.json
      - package-lock.json
  verification:
    commands_planned:
      - rg -n "23 skills|All 23 skills" site/src
      - npm run build:site
      - npm run check:text-hygiene
      - npm run test:e2e:repository
      - git diff --check
      - git status --short
      - git diff --stat
    commands_skipped:
      - command: live OpenAI provider verification
        reason: The repair changes static site copy only and no credentialed provider run is approved.
  parallel_candidates:
    allowed: false
    reason: Two coupled count strings and final verification are safer and cheaper sequentially.
  final_tail:
    test: required
    review: required
    repair_loop: conditional
    documentation: not_applicable
    product_traceability: not_applicable
    user_guide: not_applicable
    durable_backlog: not_applicable
    memories: not_applicable
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  approval:
    approved: true
    approved_at: 2026-07-26T21:40:36+07:00
  change_control:
    revision: 2
    supersedes: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
    change_reason: Final review found two current public site counts outside the r1 allowed paths.
```

## Tasks

### Phase 1 - Repair public inventory copy

1. EDIT `site/src/pages/index.astro` - change the current skill-count badge from
   23 to 24 without changing layout or behavior.
2. EDIT `site/src/components/Install.astro` - change the install note from 23
   to 24 without changing installation guidance.

### Phase 2 - Revalidate the final diff

3. RUN the planned site build, text hygiene, repository E2E, whitespace, status,
   and diff checks; then repeat read-only review, verify-before-done, and
   branch-ready. Keep live provider verification explicitly unrun.

## Self-review

- The approved spec remains unchanged.
- The revision opens only the two omitted current public-count files plus its
  own draft/snapshot lifecycle paths.
- No dependency, lockfile, version, environment, migration, runtime contract,
  generated mirror, or provider behavior changes.
- The two edits are deterministic and independently verifiable by source scan
  plus the existing site build.
- Sequential execution preserves the user's selected mode.

## Decisions captured during review

- The r1 implementation and evidence remain valid by reference.
- This revision exists only because final review found stale current inventory
  labels in paths omitted from the r1 allowlist.

## Skill provenance

sdcorejs-plan (approved on attempt 1 / 3)
