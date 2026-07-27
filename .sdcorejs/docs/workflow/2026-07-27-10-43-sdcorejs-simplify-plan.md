---
artifact_id: plan-draft-contract-sdcorejs-simplify-20260727-r1
artifact_kind: execution-doc
change_ref: sdcorejs-simplify-20260727
source_spec: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
source_plan: .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
commit_policy: with-change
owner: sdcorejs-plan
---

# Plan - SDCoreJS Simplify Workflow Utility - 2026-07-27 10:43

## Scope

Implement the approved `sdcorejs-simplify` behavior-preserving workflow utility
against the clean 24-skill baseline. Add canonical progressive-disclosure
surfaces, deterministic contract/mutation/routing coverage, narrow routing,
four-step finish-gate integration, downstream evidence handling, synchronized
mirrors, and public documentation without changing dependencies, lockfiles,
package version, Git history, or mutable session state.

## Execution context

- Track: `workflow`
- Target root kind: `sdcorejs-agent-authoring-repo`
- Stack profile: `node-general`
- Coverage approach: `tdd`
- Execution mode: sequential; routing, finish-tail, package script, public
  counts, and generated mirrors are shared integration surfaces.

```yaml
plan_context:
  source: sdcorejs-plan
  contract_id: contract-sdcorejs-simplify-20260727
  requirement_id: req-sdcorejs-simplify-20260727
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
  approved_spec_hash: 3e2195d10292a8bdda0412a62194b7dc4f2d540bde614fc18159388f67128b6c
  approved_plan_path: .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
  approved_plan_hash: a16a00f46c4206932d46b61ada37a62b52b78954ee7772a29061110a7b273662
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  stack_profile: node-general
  task_count: 20
  phase_count: 6
  allowed_paths:
    - .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-*.md
    - .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    - .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    - skills/shared/workflow/simplify.md
    - _refs/simplify/**
    - _refs/shared/finish-gate.md
    - skills/orchestration/using-skills.md
    - skills/shared/workflow/{review,debug,ship,git}.md
    - skills/tracks/test/sdcorejs-test.md
    - skills/orchestration/repair-loop.md
    - skills/shared/sdlc/04-execute-plan.md
    - AGENTS.md
    - CLAUDE.md
    - .github/copilot-instructions.md
    - .github/chatmodes/sdcorejs.chatmode.md
    - test/e2e/simplify-skill-contract.test.mjs
    - test/e2e/support/skill-pack-runner.mjs
    - test/e2e/skill-pack-runner.test.mjs
    - test/e2e/entrypoint-smoke.test.mjs
    - test/e2e/fixtures/prompt-evals.json
    - package.json
    - README.md
    - VALIDATION.md
    - CHANGELOG.md
    - docs/ADOPTION.md
    - docs/WORKED_EXAMPLE.md
    - docs/skill-consolidation-plan.md
    - site/src/components/SkillCatalog.astro
    - site/src/components/Install.astro
    - site/src/pages/index.astro
    - site/README.md
    - _refs/sdlc/angular.md
    - _refs/sdlc/nextjs.md
    - _refs/orchestration/tail/repair-loop.md
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
  prohibited_paths:
    - package-lock.json
    - site/package-lock.json
    - site/package.json
    - .env*
    - node_modules/**
    - site/node_modules/**
    - dist/**
    - site/dist/**
    - coverage/**
    - .sdcorejs/summary.md
    - .sdcorejs/tasks/current-session.md
    - .sdcorejs/tasks/sessions/**
  generated_artifacts:
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-spec.md
    - .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    - .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-plan.md
    - .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    - README.md
    - VALIDATION.md
    - CHANGELOG.md
    - docs/ADOPTION.md
    - docs/WORKED_EXAMPLE.md
    - site/README.md
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
    package_manager_version: 10.9.2
    package_version: 0.5.1
    scripts_detected:
      - sync:skills
      - check:text-hygiene
      - check:skills
      - check:skills:ps
      - check:nestjs-pack
      - test:e2e:repository
      - test:e2e
      - build:site
      - check:audit
      - check:site:audit
    commands_planned:
      - command_or_script: node --test test/e2e/simplify-skill-contract.test.mjs
        reason: Run focused canonical, invariant, mutation, and mirror contracts.
      - command_or_script: node --test test/e2e/skill-pack-runner.test.mjs
        reason: Run deterministic routing and source-pack regressions.
      - command_or_script: node --test test/e2e/entrypoint-smoke.test.mjs
        reason: Run source-owned entrypoint smoke coverage.
      - command_or_script: npm run sync:skills
        reason: Generate all mirrors from canonical sources.
      - command_or_script: npm run check:text-hygiene
        reason: Enforce encoding, mojibake, source-language, and text safety.
      - command_or_script: npm run check:skills
        reason: Verify generated mirror parity.
      - command_or_script: npm run check:skills:ps
        reason: Verify the supported PowerShell parity surface.
      - command_or_script: npm run check:nestjs-pack
        reason: Protect the NestJS pack after shared workflow integration.
      - command_or_script: npm run test:e2e:repository
        reason: Run the full deterministic repository aggregate.
      - command_or_script: npm run test:e2e
        reason: Run the configured repository, NestJS, and golden aggregates.
      - command_or_script: npm run build:site
        reason: Compile the public 25-skill catalog.
      - command_or_script: npm run check:audit
        reason: Check root production dependency audit without mutation.
      - command_or_script: npm run check:site:audit
        reason: Check site production dependency audit without mutation.
      - command_or_script: git diff --check
        reason: Verify patch and whitespace hygiene.
    commands_skipped:
      - command_or_probe: npm run test:e2e:nestjs:containers
        reason: Container runtime is not affected unless current evidence identifies a relevant regression.
      - command_or_probe: Live Claude, Codex, Cursor, or Copilot session
        reason: External tool surfaces are not available as deterministic repository commands.
      - command_or_probe: Arbitrary transformation equivalence evaluation
        reason: The utility contract does not claim a general semantic-equivalence prover.
    focused_checks:
      - The new dedicated test observes RED before canonical sources exist.
      - In-memory or temporary-copy mutations fail for every required invariant.
      - Routing fixtures cover positive, localized, planning, negative, and ambiguous intents.
    broad_checks:
      - Canonical and all generated mirror counts equal 25.
      - Existing track and utility routes remain stable.
      - Package version, dependencies, and both lockfiles remain unchanged.
      - No mutable session/checkpoint or unrelated path is created.
  parallel_candidates:
    allowed: false
    units:
      - id: sequential-integration
        title: Simplify utility canonical, routing, tail, mirrors, docs, and verification
        allowed_paths:
          - all plan_context.allowed_paths
        dependencies: []
    shared_files:
      - path: test/e2e/support/skill-pack-runner.mjs
        coordination_strategy: sequential
      - path: _refs/shared/finish-gate.md
        coordination_strategy: sequential
      - path: package.json
        coordination_strategy: sequential
      - path: generated mirror trees
        coordination_strategy: sequential
      - path: VALIDATION.md
        coordination_strategy: sequential
    conflict_risks:
      - Routing, finish ordering, and tests must converge on one narrow contract.
      - Generated mirrors must be produced after canonical fan-in.
      - Validation evidence must be written only after final commands run.
  finish_tail:
    selected_tests: full requested verification matrix
    selected_documentation: update all enumerated public sources
    selected_simplification: skip for this authoring run unless separate eligible executable-source scope exists
    selected_review: read-only contract/diff review with repair of verified findings inside approved scope
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  artifact_context:
    schema_version: 1
    change_ref: sdcorejs-simplify-20260727
    source_spec: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    source_plan: .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    required_with_change:
      - .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-spec.md
      - .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
      - .sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-plan.md
      - .sdcorejs/plans/workflow/2026-07-27-10-43-sdcorejs-simplify.md
    shared_owned: []
    conditional:
      - VALIDATION.md after current verification evidence exists
    local_only:
      - runtime simplify_context
      - raw command logs
      - temporary mutation copies
    unrelated_observed: []
  approval:
    approved: true
    approved_at: 2026-07-27T10:43:44+07:00
    approval_source: equivalent-complete-input
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Tasks

### Phase 1 - Preflight and RED contract

1. RUN repository and Project Context v2 preflight - capture branch, HEAD,
   local/remote main, clean-tree evidence, package manager, lockfiles, counts,
   routing, finish-tail, mirror, and aggregate-script evidence.
2. CREATE `test/e2e/simplify-skill-contract.test.mjs` - add canonical,
   behavior-boundary, finish-tail, downstream, mirror, count, and in-memory
   mutation assertions before the implementation exists.
3. EDIT routing fixtures and runner tests - add compound positive, localized,
   planning, negative-owner, and ambiguous no-write cases.
4. RUN focused dedicated, routing, and entrypoint tests - record expected RED
   failures and reject false-positive coverage.

### Phase 2 - Canonical utility

5. CREATE `skills/shared/workflow/simplify.md` - add the concise five-action
   orchestrator, project/working-tree preflight, scope decision, verification
   gates, bounded apply loop, context emission, and no-Git boundary.
6. CREATE `_refs/simplify/scope-and-invariants.md` - define eligible scope,
   protected files/content, preserved surfaces, allowed/forbidden patterns,
   project-standard discovery, action handoffs, and limits.
7. CREATE `_refs/simplify/stack-guardrails.md` - protect Angular, NestJS,
   Next.js/React, and AI-agent framework/security contracts.
8. CREATE `_refs/simplify/verification.md` - define before/after evidence,
   exact pass reversion, Git restrictions, `simplify_context`, and verification
   limitations.
9. RUN the dedicated contract and mutation tests - move focused coverage from
   expected RED to GREEN without weakening assertions.

### Phase 3 - Routing, finish gate, and downstream evidence

10. EDIT `skills/orchestration/using-skills.md`, source-owned entrypoints, and
    `test/e2e/support/skill-pack-runner.mjs` - add dedicated utility priority and
    a narrow compound detector without a new implementation track.
11. EDIT `_refs/shared/finish-gate.md` and hardcoded tail references - expose
    four sequential decisions, keep simplification opt-in, establish tests
    before simplification and post-write focused tests before review, and
    invalidate stale evidence.
12. EDIT test/review/repair/debug/ship/git owners - consume or preserve
    `simplify_context`, block protected drift, and keep runtime evidence out of
    Git.
13. RUN focused routing, entrypoint, finish-tail, and dedicated contract tests.

### Phase 4 - Public documentation and catalog

14. EDIT `README.md`, `AGENTS.md`, `CLAUDE.md`, Copilot/chatmode entrypoints,
    adoption/workflow docs, site catalog/counts, and `CHANGELOG.md` - position
    simplify as a daily behavior-preserving utility and update public count to
    25 without a release/version claim.
15. EDIT `VALIDATION.md` only after current verification - record current
    deterministic evidence, limitations, count, and mirror status.

### Phase 5 - Mirrors and verification

16. RUN `npm run sync:skills` - generate all adapter/reference/Cursor outputs
    from canonical sources and inspect the three new skill mirrors.
17. RUN focused checks, text hygiene, Node and PowerShell mirror checks,
    repository aggregate, NestJS pack, full configured E2E, site build, root and
    site audits, and diff checks; record exact exit codes and skips.
18. RUN read-only contract/diff review - repair only verified findings inside
    approved paths, then rerun every affected command.

### Phase 6 - Final evidence and read-only gates

19. INSPECT final status, diffstat, protected package/lockfile hashes, generated
    mirror parity, skill counts, and absence of unrelated/session changes.
20. RUN final diff-sensitive verification and branch-readiness checks with no
    later writes; do not create Git artifacts.

## Acceptance mapping

- AC-001 through AC-004 -> tasks 2, 3, 5, 6, 10, 14, 16
- AC-005 through AC-012 -> tasks 2, 5, 6, 8, 9, 17, 18
- AC-013 through AC-015 -> tasks 2, 7, 8, 12, 13, 18
- AC-016 through AC-018 -> tasks 2, 3, 10, 11, 13, 18
- AC-019 through AC-021 -> tasks 2, 3, 4, 9, 13, 17
- AC-022 through AC-025 -> tasks 10, 14, 15, 16, 17, 19, 20

## Verification

- `node --test test/e2e/simplify-skill-contract.test.mjs`
- `node --test test/e2e/skill-pack-runner.test.mjs`
- `node --test test/e2e/entrypoint-smoke.test.mjs`
- `npm run sync:skills`
- `npm run check:text-hygiene`
- `npm run check:skills`
- `npm run check:skills:ps`
- `npm run check:nestjs-pack`
- `npm run test:e2e:repository`
- `npm run test:e2e`
- `npm run build:site`
- `npm run check:audit`
- `npm run check:site:audit`
- `git diff --check`
- Manual: inspect canonical/generated mirrors, count 25 everywhere, compound
  routing boundaries, four-step finish order, package/lockfile invariants, and
  external/live validation limitations.
