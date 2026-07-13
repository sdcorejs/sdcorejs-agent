---
name: frontend-architecture-closeout
description: Execute the approved frontend architecture wording, regression, live-agent guidance, mirror, and validation close-out.
contract_id: contract-frontend-architecture-closeout-20260713
requirement_id: req-frontend-architecture-closeout-20260713
approvedAt: 2026-07-13T15:28:37+07:00
approvedBy: nghiatt15@onemount.com
track: workflow
sourceSpecPath: .sdcorejs/specs/workflow/2026-07-13-15-21-frontend-architecture-closeout.md
taskCount: 14
phaseCount: 6
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: general
approved_spec_hash: 8e9d6b9f954600bddc6a259f82745cdf4b36f97a88855ee00b27124aa573c281
allowed_paths:
  - skills/tracks/angular/sdcorejs-angular.md
  - skills/shared/sdlc/03-plan.md
  - skills/shared/sdlc/04-execute-plan.md
  - skills/tracks/nextjs/sdcorejs-nextjs.md
  - skills/tracks/design/sdcorejs-design.md
  - skills/shared/workflow/review.md
  - _refs/shared/frontend-architecture.md
  - _refs/sdlc/angular.md
  - _refs/sdlc/nextjs.md
  - _refs/angular/**
  - _refs/nextjs/build-website/**
  - _refs/design/frontend-design.md
  - test/e2e/skill-pack-runner.test.mjs
  - docs/REAL_AGENT_VALIDATION.md
  - CHANGELOG.md
  - VALIDATION.md
  - .sdcorejs/docs/workflow/**
  - .sdcorejs/specs/workflow/**
  - .sdcorejs/plans/workflow/**
  - .claude/skills/**
  - plugin/skills/**
  - plugin/_refs/**
  - codex/skills/**
  - codex/skills/_refs/**
  - .cursor/rules/sdcorejs-agent.mdc
  - node_modules/**
prohibited_paths:
  - skills/tracks/product/**
  - _refs/product/**
  - product/**
  - package.json
  - package-lock.json
  - .env*
  - site/**
  - migrations/**
  - dist/**
  - build/**
  - any new skill or frontend architecture reference
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
approved_plan_hash: 63d1a11ce96b22765581a2e7f107a35cb2dcd503dac786e9130a336172ad14bb
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# Frontend Architecture Close-out - Approved Plan

> Snapshot of what the user approved at the `sdcorejs-plan` gate. Do not edit by hand; re-author through `sdcorejs-plan` if the contract changes.

## Approved contract

# Plan - Frontend Architecture Close-out - 2026-07-13 15:23

## Scope

Close the remaining frontend architecture consistency and evidence gaps without
redesigning the existing contract. Remove active fixed list/detail anchoring,
strengthen scoped deterministic regressions, add pending live-agent scenarios,
regenerate mirrors, and record only validation observed for the final diff.

Approved spec:
`.sdcorejs/specs/workflow/2026-07-13-15-21-frontend-architecture-closeout.md`

## Execution context

- Track: `workflow` through the generic execution harness.
- Target root kind: `sdcorejs-agent-authoring-repo`.
- Stack profile: `general` skill-pack authoring repository.
- Coverage approach: post-hoc, with the focused phase 1 test run immediately
  after the single planned frontend regression-test edit.
- Parallel candidates: yes. Canonical wording/audit, regression-test authoring,
  and adoption-document authoring have disjoint write paths; mirror generation,
  validation evidence, repairs, and final gates remain parent-owned and
  sequential.

```yaml
plan_context:
  source: sdcorejs-plan
  contract_id: contract-frontend-architecture-closeout-20260713
  requirement_id: req-frontend-architecture-closeout-20260713
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-13-15-21-frontend-architecture-closeout.md
  approved_spec_hash: 8e9d6b9f954600bddc6a259f82745cdf4b36f97a88855ee00b27124aa573c281
  approved_plan_path: .sdcorejs/plans/workflow/2026-07-13-15-28-frontend-architecture-closeout.md
  approved_plan_hash: 63d1a11ce96b22765581a2e7f107a35cb2dcd503dac786e9130a336172ad14bb
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  stack_profile: general
  task_count: 14
  phase_count: 6
  allowed_paths:
    - skills/tracks/angular/sdcorejs-angular.md
    - skills/shared/sdlc/03-plan.md
    - skills/shared/sdlc/04-execute-plan.md
    - skills/tracks/nextjs/sdcorejs-nextjs.md
    - skills/tracks/design/sdcorejs-design.md
    - skills/shared/workflow/review.md
    - _refs/shared/frontend-architecture.md
    - _refs/sdlc/angular.md
    - _refs/sdlc/nextjs.md
    - _refs/angular/write-code/input-analysis.md
    - _refs/angular/write-code/init-module.md
    - _refs/angular/write-code/init-entity.md
    - _refs/angular/write-code/screen-list.md
    - _refs/angular/write-code/screen-detail.md
    - _refs/angular/templates/entity-skeleton.md
    - _refs/angular/templates/feature-component-boundaries.md
    - _refs/angular/templates/orchestrator-step-examples.md
    - _refs/angular/review-code.md
    - _refs/nextjs/build-website/write-code/pages-and-blocks.md
    - _refs/nextjs/build-website/review-code.md
    - _refs/design/frontend-design.md
    - test/e2e/skill-pack-runner.test.mjs
    - docs/REAL_AGENT_VALIDATION.md
    - CHANGELOG.md
    - VALIDATION.md
    - .sdcorejs/docs/workflow/**
    - .sdcorejs/specs/workflow/**
    - .sdcorejs/plans/workflow/**
    - .claude/skills/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
    - node_modules/**
  prohibited_paths:
    - skills/tracks/product/**
    - _refs/product/**
    - product/**
    - package.json
    - package-lock.json
    - pnpm-lock.yaml
    - yarn.lock
    - bun.lock
    - bun.lockb
    - .env*
    - site/**
    - migrations/**
    - dist/**
    - build/**
    - any new skill or frontend architecture reference
  generated_artifacts:
    - .claude/skills/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
    - node_modules/**
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-07-13-15-18-frontend-architecture-closeout-spec.md
    - .sdcorejs/specs/workflow/2026-07-13-15-21-frontend-architecture-closeout.md
    - .sdcorejs/docs/workflow/2026-07-13-15-23-frontend-architecture-closeout-plan.md
    - .sdcorejs/plans/workflow/**
    - docs/REAL_AGENT_VALIDATION.md
    - CHANGELOG.md
    - VALIDATION.md
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: null
    approval_required: false
  verification_strategy:
    package_manager: npm
    scripts_detected:
      - name: sync:skills
      - name: check:text-hygiene
      - name: check:skills
      - name: check:skills:ps
      - name: test:e2e:phase1
      - name: test:e2e:repository
      - name: test:e2e
      - name: test:e2e:phase4
      - name: check:audit
    commands_planned:
      - command_or_script: git diff --check
        reason: Verify whitespace and patch hygiene on the final diff.
      - command_or_script: npm ci
        reason: Install the exact lockfile dependency graph before repository validation.
      - command_or_script: npm run check:text-hygiene
        reason: Enforce tracked-text Unicode, control, bidi, and source-language hygiene.
      - command_or_script: npm run sync:skills
        reason: Regenerate all distribution mirrors from canonical sources.
      - command_or_script: npm run check:skills
        reason: Prove generated mirrors match canonical sources.
      - command_or_script: npm run check:skills:ps
        reason: Exercise the repository-supported Windows PowerShell mirror checker.
      - command_or_script: npm run test:e2e:phase1
        reason: Run the focused skill-pack and frontend architecture regression file.
      - command_or_script: npm run test:e2e:repository
        reason: Run all repository-level deterministic adapters, entrypoints, protocol, and skill-pack tests.
      - command_or_script: npm run test:e2e
        reason: Run the configured broad E2E aggregate including repository and NestJS golden coverage.
      - command_or_script: npm audit --omit=dev
        reason: Check production dependency vulnerability status without changing dependencies.
    commands_skipped:
      - command_or_probe: SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4
        reason: Run only if execution preflight confirms the prepared heavyweight target-app environment; otherwise record Full E2E as not run.
      - command_or_probe: External Claude Code, Codex native-skill, Cursor, and GitHub Copilot sessions
        reason: No installed external tool surfaces are assumed; retain the scenarios as pending unless an actual session is available and executed.
    focused_checks:
      - Scoped active-section checks reject fixed two-component Angular wording.
      - Mutation cases prove each forbidden phrase would fail the negative contract.
      - Positive assertions protect route/page minimum boundaries, cohesive simple screens, single-consumer feature-local components, shared-promotion evidence, conditional base-select, project-convention precedence, and Next.js client-island behavior.
      - Existing comment stripping, active-assertion, provider-scope, and architecture mutation checks remain active.
    broad_checks:
      - Canonical and generated mirror diff review.
      - Repository E2E and configured aggregate E2E.
      - Text hygiene, PowerShell sync validation, dependency audit, and final diff hygiene.
      - Product-track and framework-eligibility boundary audit.
  parallel_candidates:
    allowed: true
    units:
      - id: canonical-frontend
        title: Canonical frontend consistency audit and fixed-anchor rewrites
        allowed_paths:
          - skills/tracks/angular/sdcorejs-angular.md
          - skills/shared/sdlc/03-plan.md
          - skills/shared/sdlc/04-execute-plan.md
          - skills/tracks/nextjs/sdcorejs-nextjs.md
          - skills/tracks/design/sdcorejs-design.md
          - skills/shared/workflow/review.md
          - _refs/shared/frontend-architecture.md
          - _refs/sdlc/angular.md
          - _refs/sdlc/nextjs.md
          - _refs/angular/**
          - _refs/nextjs/build-website/**
          - _refs/design/frontend-design.md
        dependencies: []
      - id: frontend-regressions
        title: Scoped negative, positive, and mutation regressions
        allowed_paths:
          - test/e2e/skill-pack-runner.test.mjs
        dependencies: []
      - id: adoption-guidance
        title: Live-agent scenario guidance and Unreleased changelog
        allowed_paths:
          - docs/REAL_AGENT_VALIDATION.md
          - CHANGELOG.md
        dependencies: []
    shared_files:
      - path: generated mirror trees
        coordination_strategy: parent-owned
      - path: VALIDATION.md
        coordination_strategy: parent-owned
      - path: .sdcorejs workflow artifacts
        coordination_strategy: parent-owned
    conflict_risks:
      - Regression wording must match the final canonical contract even when authored concurrently.
      - Mirror generation before fan-in would overwrite or obscure canonical unit results.
      - Validation evidence written before the final repair cycle would become stale.
  finish_tail:
    docs_before_final_branch_ready: true
    branch_ready_final_gate: true
  approval:
    approved: true
    approved_at: 2026-07-13T15:28:37+07:00
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Tasks

### Phase 1 - Working-tree and dependency preflight

1. RUN repository preflight commands - Capture branch, HEAD, `git status --short`, staged and unstaged diffstats, untracked files, allowed/prohibited paths, and unrelated dirty files before implementation; stop or use the numbered dirty-tree gate if scope changed since planning.
2. RUN `npm ci` - Install the lockfile-pinned dependency graph without modifying `package.json` or `package-lock.json`; treat `node_modules/**` as ignored tool output only.

### Phase 2 - Canonical frontend close-out

3. EDIT `skills/tracks/angular/sdcorejs-angular.md` - Replace the purpose bullet and full-CRUD dispatch row that currently make `List, Detail` exhaustive with domain/transport contracts, data-access services and justified collaborators, lazy route/page containers, architecture-derived feature-local components, justified shared/Core UI reuse, and workflow/bulk/custom actions.
4. EDIT `_refs/angular/write-code/init-entity.md` - Rewrite the remaining `model + service + list + detail` sample description so it names route/page shells and approved architecture-derived feature components without changing the example's role.
5. EDIT `_refs/angular/templates/orchestrator-step-examples.md` - Rename the fixed `List + Detail components` step, align the worked-generation steps with route/page shells and approved feature-local children, and state why the simple worked tree may legitimately contain only cohesive page containers.
6. VERIFY THEN EDIT the remaining allowed canonical frontend files - Compare Angular, Next.js, design, and review semantics with `_refs/shared/frontend-architecture.md`; edit only a demonstrated contradiction, preserve route concepts and anti-over-splitting, and leave already-consistent files unchanged.

### Phase 3 - Deterministic regression hardening

7. EDIT `test/e2e/skill-pack-runner.test.mjs` - Add active-section extraction/comment handling as needed, reject all four fixed two-component phrase families in the Angular purpose/dispatch contract, mutation-test that every forbidden phrase is caught, and strengthen positive invariants without weakening existing frontend/provider assertion checks.
8. RUN `npm run test:e2e:phase1` - Execute the focused frontend regression file immediately after its single planned edit; fix source or test defects without deleting or weakening existing protections.

### Phase 4 - Adoption and release-facing documentation

9. EDIT `docs/REAL_AGENT_VALIDATION.md` - Add the complex Angular list, simple Angular drawer, and one-off Next.js estimator prompts and expected observations; add a 15-cell pending matrix for the three scenarios across the five supported tool surfaces, requiring one existing transcript template instance per executed pair and never recording an unrun pair as pass.
10. EDIT `CHANGELOG.md` - Add concise `Unreleased` entries covering architecture preflight/enforcement, Angular decomposition/provider/public API/conditional selector behavior, Next.js one-off interactive behavior, design/review handoff, legacy wording removal, and regression coverage without claiming a release.

### Phase 5 - Mirrors and current validation evidence

11. RUN `npm run sync:skills` and mirror checks - Regenerate mirrors only after canonical fan-in, review source/generated diffs together, then run `npm run check:skills` and `npm run check:skills:ps`.
12. RUN the required validation matrix - Execute `git diff --check`, `npm run check:text-hygiene`, `npm run test:e2e:phase1`, `npm run test:e2e:repository`, `npm run test:e2e`, and `npm audit --omit=dev`; retain exact exit codes, relevant output, skips, and environment failures.
13. EDIT `VALIDATION.md` - Add a dated frontend close-out section tied to base HEAD plus the uncommitted final working tree, list every actual command/result, mirror status, Full E2E status, all live-agent statuses, and exact limitations; clarify that historical CI/Full E2E links do not validate this new diff.

### Phase 6 - Final diff and read-only gates

14. RUN final diff-sensitive verification and gates - Re-run `git diff --check`, text hygiene, mirror checks, focused/repository/configured E2E, and audit after the evidence write; review every changed canonical/generated/doc file, verify no product-track or prohibited path changed, repair any evidence-backed finding and repeat affected commands, then run verify-before-done followed by final branch-ready with no later writes.

## Acceptance mapping

- AC-001 -> tasks 3, 7, 8, 14
- AC-002 -> tasks 3, 7, 8, 14
- AC-003 -> tasks 3, 6, 7, 8
- AC-004 -> tasks 3, 5, 6, 7
- AC-005 -> tasks 5, 6, 7
- AC-006 -> tasks 3, 6, 7
- AC-007 -> tasks 6, 7, 14
- AC-008 -> tasks 3, 6, 7, 14
- AC-009 -> tasks 6, 7, 14
- AC-010 -> tasks 6, 7, 14
- AC-011 -> tasks 6, 7, 9, 14
- AC-012 -> tasks 6, 7, 14
- AC-013 -> tasks 6, 7, 14
- AC-014 -> tasks 7, 8, 12, 14
- AC-015 -> tasks 7, 8, 12, 14
- AC-016 -> tasks 7, 8, 12, 14
- AC-017 -> tasks 9, 13, 14
- AC-018 -> tasks 10, 12, 13, 14
- AC-019 -> tasks 1, 2, 6, 11, 12, 13, 14

## Verification

- `npm ci`
- `npm run test:e2e:phase1` immediately after the regression edit
- `npm run sync:skills`
- `npm run check:text-hygiene`
- `npm run check:skills`
- `npm run check:skills:ps`
- `npm run test:e2e:phase1`
- `npm run test:e2e:repository`
- `npm run test:e2e`
- `npm audit --omit=dev`
- `git diff --check`
- Manual: inspect canonical versus generated mirror diffs, confirm only active
  fixed-list/detail anchoring changed, verify all 15 live-agent matrix cells are
  pending unless real transcripts exist, and confirm product-track files and
  framework eligibility boundaries are untouched.


## Decisions captured during review

- (approved as drafted)

## Skill provenance

sdcorejs-plan (approved on attempt 1 / 3)
