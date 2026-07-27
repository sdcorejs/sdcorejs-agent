---
artifact_id: plan-first-class-ai-agent-track-20260725
artifact_kind: plan
change_ref: first-class-ai-agent-track-20260725
source_spec: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
status: approved
---

# Plan - First-class AI Agent Track - 2026-07-25 15:21

## Scope

Create the first-class `ai-agent` authoring track and the
`sdcorejs-ai-agent` executor contract without adding an AI runtime to this
repository. Add two independent OpenAI engine profiles, twelve capability
profiles, fail-closed trust/tool/approval/state/evidence/governance contracts,
offline fixtures and validation, SDLC integration, narrow routing, generated
mirrors, public documentation, and current verification evidence.

Approved spec:
`.sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md`

## Execution context

- Track: `workflow` through the generic execution harness; this authoring
  change creates the future first-class `ai-agent` track.
- Target root kind: `sdcorejs-agent-authoring-repo`.
- Stack profile: `node-general`.
- Coverage approach: TDD. Create the dedicated contract/routing assertions and
  observe focused RED evidence before implementing the new canonical track.
- Parallel candidates: no. Dispatch-core, common contracts, manifest/profile
  registries, routing tests, mirrors, evidence docs, and Summary v2 form one
  tightly coupled integration chain. The approved brief recommends sequential
  execution; execute-plan still owns the mandatory mode question.

```yaml
plan_context:
  source: sdcorejs-plan
  contract_id: contract-first-class-ai-agent-track-20260725
  requirement_id: req-first-class-ai-agent-track-20260725
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
  approved_spec_hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
  approved_plan_path: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
  approved_plan_hash: e5d5917aed9ce5256a4e859bc215408ece204e5bd29d3bab80ceb690a1318ee7
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  creates_track: ai-agent
  stack_profile: node-general
  coverage_approach: tdd
  task_count: 28
  phase_count: 6
  allowed_paths:
    - .sdcorejs/docs/workflow/2026-07-25-14-56-first-class-ai-agent-track-spec.md
    - .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
    - .sdcorejs/docs/workflow/2026-07-25-15-21-first-class-ai-agent-track-plan.md
    - .sdcorejs/plans/workflow/*-first-class-ai-agent-track.md
    - .sdcorejs/summary.md
    - skills/tracks/ai-agent/**
    - _refs/sdlc/ai-agent.md
    - _refs/ai-agent/**
    - skills/orchestration/using-skills.md
    - skills/shared/sdlc/01-brainstorming.md
    - skills/shared/sdlc/02-spec.md
    - skills/shared/sdlc/03-plan.md
    - skills/shared/sdlc/04-execute-plan.md
    - skills/orchestration/solution-builder.md
    - skills/tracks/test/sdcorejs-test.md
    - skills/shared/workflow/review.md
    - skills/orchestration/repair-loop.md
    - skills/shared/workflow/debug.md
    - skills/shared/workflow/ship.md
    - skills/shared/workflow/git.md
    - test/e2e/ai-agent-track-contract.test.mjs
    - test/e2e/support/skill-pack-runner.mjs
    - test/e2e/fixtures/prompt-evals.json
    - test/e2e/skill-pack-runner.test.mjs
    - test/e2e/entrypoint-smoke.test.mjs
    - package.json
    - README.md
    - AGENTS.md
    - CLAUDE.md
    - .github/copilot-instructions.md
    - .github/chatmodes/sdcorejs.chatmode.md
    - site/src/components/SkillCatalog.astro
    - VALIDATION.md
    - CHANGELOG.md
    - docs/ADOPTION.md
    - docs/REAL_AGENT_VALIDATION.md
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
  prohibited_paths:
    - package-lock.json
    - pnpm-lock.yaml
    - yarn.lock
    - bun.lock
    - bun.lockb
    - node_modules/**
    - .git/**
    - .env*
    - .sdcorejs/tasks/**
    - .sdcorejs/sessions/**
    - .sdcorejs/checkpoints/**
    - .sdcorejs/manifests/**
    - skills/tracks/angular/**
    - skills/tracks/nestjs/**
    - skills/tracks/nextjs/**
    - skills/tracks/product/**
    - skills/tracks/design/**
    - _refs/angular/**
    - _refs/nestjs/**
    - _refs/nextjs/**
    - _refs/product/**
    - _refs/design/**
    - migrations/**
    - dist/**
    - build/**
    - raw provider responses, traces, run state, approval tokens, credentials, or customer data
    - any target runtime repository outside the approved root
  generated_artifacts:
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
  docs_artifacts:
    - .sdcorejs/docs/workflow/2026-07-25-14-56-first-class-ai-agent-track-spec.md
    - .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
    - .sdcorejs/docs/workflow/2026-07-25-15-21-first-class-ai-agent-track-plan.md
    - .sdcorejs/plans/workflow/*-first-class-ai-agent-track.md
    - .sdcorejs/summary.md
    - README.md
    - AGENTS.md
    - CLAUDE.md
    - .github/copilot-instructions.md
    - .github/chatmodes/sdcorejs.chatmode.md
    - site/src/components/SkillCatalog.astro
    - docs/ADOPTION.md
    - docs/REAL_AGENT_VALIDATION.md
    - VALIDATION.md
    - CHANGELOG.md
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  package_manifest_changes:
    required: true
    files:
      - package.json
    approved_scope:
      - Append test/e2e/ai-agent-track-contract.test.mjs to the existing test:e2e:repository command.
    version_change: false
    dependency_change: false
    approval_required: true
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: null
    approval_required: false
  frontend_architecture:
    required: false
    not_applicable_reason: This is skill-pack and contract authoring; the only Astro edit is catalog copy and does not change application component architecture.
  agent_architecture:
    required: false
    not_applicable_reason: This approved change authors the reusable ai-agent track and does not implement or modify a target-project AI runtime.
  ai_agent_track_architecture:
    provider: openai
    engines:
      - openai-responses
      - openai-agents-sdk
    independent_profile_axes: true
    capability_profiles:
      - reporting-assistant
      - analytics-assistant
      - knowledge-assistant
      - audit-assistant
      - crm-assistant
      - workflow-assistant
      - support-assistant
      - document-assistant
      - data-provisioning-assistant
      - tenant-operations-assistant
      - approval-coordinator
      - multi-agent-supervisor
    common_security_floor: _refs/ai-agent/profiles/common.md
    manifest: _refs/ai-agent/manifest.json
    profile_contract: _refs/ai-agent/profile-contract.json
    validator: _refs/ai-agent/validate-agent-contract.mjs
    runtime_owner_policy: approved target-project package or service
    repository_runtime_boundary: this repository authors contracts and never embeds or assumes the target runtime
    default_provider_storage: false
    generic_raw_tools: forbidden
    trusted_context_source: authenticated server request, job, or internal service only
    deterministic_repository_tests: offline and API-key-free
  verification_strategy:
    package_manager: npm
    package_manager_version: 10.9.2
    package_version: 0.5.1
    lockfiles:
      - package-lock.json
    scripts_detected:
      - name: sync:skills
      - name: check:text-hygiene
      - name: check:skills
      - name: check:skills:ps
      - name: check:nestjs-pack
      - name: test:e2e:phase1
      - name: test:e2e:phase3
      - name: test:e2e:repository
      - name: test:e2e
      - name: check:audit
      - name: check:site:audit
      - name: build:site
    commands_planned:
      - command_or_script: node --test test/e2e/ai-agent-track-contract.test.mjs
        reason: Run the focused offline contract, manifest, validator, fixture, and mutation suite.
      - command_or_script: npm run test:e2e:phase1
        reason: Run deterministic skill-pack routing and source-contract regressions.
      - command_or_script: npm run test:e2e:phase3
        reason: Run source-owned entrypoint and dispatch smoke tests.
      - command_or_script: npm run sync:skills
        reason: Generate all mirrors from canonical sources after source fan-in.
      - command_or_script: npm run check:text-hygiene
        reason: Enforce control, bidi, encoding, mojibake, and source-language hygiene.
      - command_or_script: npm run check:skills
        reason: Prove generated skill and reference mirrors match canonical sources.
      - command_or_script: npm run check:skills:ps
        reason: Exercise the repository-supported PowerShell mirror checker.
      - command_or_script: npm run check:nestjs-pack
        reason: Protect the existing NestJS pack while shared routing/workflow contracts change.
      - command_or_script: npm run test:e2e:repository
        reason: Run the complete deterministic repository harness including the new dedicated test.
      - command_or_script: npm run test:e2e
        reason: Run the complete configured E2E aggregate.
      - command_or_script: npm run build:site
        reason: Verify the public skill catalog compiles after the 24-skill update.
      - command_or_script: npm run check:audit
        reason: Check production dependency vulnerabilities without changing dependencies.
      - command_or_script: npm run check:site:audit
        reason: Check production site dependency vulnerabilities without changing dependencies.
      - command_or_script: git diff --check
        reason: Verify patch and whitespace hygiene after every final write.
      - command_or_script: git status --short
        reason: Confirm only approved paths changed and no session/checkpoint file exists.
      - command_or_script: git diff --stat
        reason: Report the final approved change footprint.
    commands_skipped:
      - command_or_probe: npm run test:e2e:nestjs:containers
        reason: Container runtime behavior is outside this skill-pack contract change unless execution evidence reveals an affected container surface.
      - command_or_probe: Live OpenAI Responses API, Agents SDK, or hosted evaluation run
        reason: The approved spec requires deterministic offline repository tests and forbids API-key or paid live calls.
      - command_or_probe: External Claude Code, Codex native-skill, Cursor, or GitHub Copilot session
        reason: Run only when the corresponding isolated external surface is actually available; otherwise preserve explicit pending evidence.
      - command_or_probe: Generated target-project AI runtime smoke test
        reason: This authoring change does not create a target runtime application.
    focused_checks:
      - Dedicated test observes RED before canonical AI-agent sources are created.
      - Validator accepts all four golden fixtures and rejects every invalid case with a structured result.
      - Mutation tests fail for removed routing, trust, generic-tool, approval, storage, limit, tenant, redaction, eval, and execute-plan invariants.
      - Routing fixtures cover explicit, approved-plan, under-specified, localized, and negative ownership boundaries.
    broad_checks:
      - Canonical and generated counts are 24 and all manifest paths resolve.
      - Existing Angular, NestJS, Next.js, product, design, test, documentation, utility, and solution-builder routing remains stable.
      - Source and mirrors stay English-only except explicit localized input fixtures.
      - Root package version, dependencies, and lockfile remain unchanged.
      - Public catalog, entrypoints, adoption guidance, real-agent guidance, changelog, validation evidence, and Summary v2 agree.
  parallel_candidates:
    allowed: false
    frozen_contract:
      path: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
      hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
      revision: 1
      derived_from_approved_plan_hash: e5d5917aed9ce5256a4e859bc215408ece204e5bd29d3bab80ceb690a1318ee7
      supersedes: null
    units:
      - id: sequential-integration
        title: AI-agent track canonical, routing, mirror, documentation, and verification integration
        role: integration-owner
        depends_on: []
        produces:
          - canonical ai-agent track and references
          - deterministic fixtures and tests
          - workflow and routing integration
          - generated mirrors and public evidence
        consumes:
          - approved spec
          - current main repository contracts
          - official OpenAI documentation basis captured by the spec
        allowed_paths:
          - all plan_context.allowed_paths
        prohibited_paths:
          - all plan_context.prohibited_paths
        exclusive_resources:
          - dispatch priority and detector
          - ai-agent manifest and profile contract
          - package.json test:e2e:repository command
          - generated mirrors
          - VALIDATION.md
          - .sdcorejs/summary.md
        shared_readonly_resources:
          - package-lock.json
          - existing canonical track references outside the approved write scope
        result_type: working-tree-diff
        verification_command: npm run test:e2e:repository
    shared_files:
      - path: skills/shared/sdlc/**
        owner: sequential-integration
        coordination_strategy: sequential
      - path: test/e2e/support/skill-pack-runner.mjs
        owner: sequential-integration
        coordination_strategy: sequential
      - path: package.json
        owner: sequential-integration
        coordination_strategy: sequential
      - path: generated mirror trees
        owner: sequential-integration
        coordination_strategy: sequential
      - path: VALIDATION.md
        owner: sequential-integration
        coordination_strategy: sequential
      - path: .sdcorejs/summary.md
        owner: sequential-integration
        coordination_strategy: sequential
    conflict_risks:
      - Tests and routing must agree on a narrow detector before mirrors are generated.
      - Profile files must inherit one shared security floor and match manifest paths.
      - Validation and summary writes are stale until canonical, test, and mirror fan-in completes.
      - Parallel edits to shared SDLC skills could silently weaken approval or track priority.
  finish_tail:
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  artifact_context:
    schema_version: 1
    change_ref: first-class-ai-agent-track-20260725
    source_spec: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
    source_plan: .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
    required_with_change:
      - .sdcorejs/docs/workflow/2026-07-25-14-56-first-class-ai-agent-track-spec.md
      - .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
      - .sdcorejs/docs/workflow/2026-07-25-15-21-first-class-ai-agent-track-plan.md
      - .sdcorejs/plans/workflow/2026-07-25-15-27-first-class-ai-agent-track.md
    shared_owned:
      - .sdcorejs/summary.md
    conditional:
      - VALIDATION.md after current verification evidence exists
      - docs/REAL_AGENT_VALIDATION.md with external scenarios retained as pending unless actually run
    local_only:
      - raw traces
      - provider logs and response payloads
      - serialized run or session state
      - credentials and approval tokens
      - sensitive model and tool payloads
    unrelated_observed: []
  approval:
    approved: true
    approved_at: 2026-07-25T15:27:39+07:00
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Tasks

### Phase 1 - Preflight and RED contracts

1. RUN repository working-tree preflight - Capture `git status --short`, staged and unstaged diffstats, untracked files, branch, HEAD, allowed/prohibited paths, and target-root kind; treat only the approved spec/plan artifacts as expected dirty files and stop at the numbered dirty-tree gate for anything unrelated.
2. CREATE `test/e2e/ai-agent-track-contract.test.mjs` - Author the dedicated canonical-skill, count, manifest, profile-delta, validator, golden/invalid fixture, security, state, downstream-context, and temporary/in-memory mutation assertions before the corresponding AI-agent sources exist.
3. EDIT `package.json` - Append the dedicated contract test to the existing explicit `test:e2e:repository` command without changing package version, dependencies, package manager, or any other script.
4. EDIT `test/e2e/fixtures/prompt-evals.json` - Add explicit/approved-plan positive, under-specified brainstorming, localized-input, and negative owner fixtures with English expected outputs.
5. EDIT `test/e2e/skill-pack-runner.test.mjs` - Update the observed skill/mirror/catalog count from 23 to 24 and add assertion-backed routing, workflow integration, profile registry, source-language, and mutation coverage without weakening existing regressions.
6. EDIT `test/e2e/entrypoint-smoke.test.mjs` - Require source-owned entrypoints to expose the new track, priority, executor boundary, and future execute-plan dispatch without stealing dedicated intents.
7. RUN focused AI-agent and routing tests - Execute the new dedicated file plus phase 1 and phase 3 tests, record the expected RED causes, and reject false-positive passes caused by missing assertions or commented fixtures.

### Phase 2 - Canonical AI-agent contract pack

8. CREATE `skills/tracks/ai-agent/sdcorejs-ai-agent.md` - Add a concise approved-plan-only executor that performs project/working-tree preflight, verifies hashes, resolves both profiles once, loads progressive references, fails closed, edits approved target paths, emits `ai_agent_context`, passes finish evidence, and never invokes Git.
9. CREATE `_refs/sdlc/ai-agent.md` - Define spec-time requirements and implementation selection criteria for capability, engine, posture, trust, tenancy, data, tools, approvals, state, evidence, limits, observability, FinOps, evals, runtime ownership, and non-goals.
10. CREATE `_refs/ai-agent/{manifest.json,profile-contract.json,agent-contract.md,tool-contract.md,guardrails-and-approvals.md,sessions-and-state.md,evidence-and-reporting.md,tracing-audit-finops.md,evals.md,testing.md,validate-agent-contract.mjs}` - Build the shallow manifest, shared semantic schemas, fail-closed security/governance references, and read-only Node-standard-library validator with `## Contents` in references longer than 100 lines.
11. CREATE `_refs/ai-agent/engines/{openai-responses.md,openai-agents-sdk.md}` - Encode the separate application-owned and SDK-owned lifecycle mechanics from current official documentation without promising live compatibility or speculative providers.
12. CREATE `_refs/ai-agent/profiles/{common.md,reporting-assistant.md,analytics-assistant.md,knowledge-assistant.md,audit-assistant.md,crm-assistant.md,workflow-assistant.md,support-assistant.md,document-assistant.md,data-provisioning-assistant.md,tenant-operations-assistant.md,approval-coordinator.md,multi-agent-supervisor.md}` - Put the invariant security floor in common and meaningful business-policy, evidence, side-effect, approval, session, budget, scenario, and threshold deltas in each profile.
13. CREATE `_refs/ai-agent/fixtures/{golden,invalid}/**` within the five approved fixture files - Add four synthetic golden engine/capability contracts and one deterministic invalid-case catalog covering every specified trust/tool/approval/storage/limit/tenant/trace/evidence defect.
14. RUN the dedicated contract test and validator fixtures - Move the focused suite from expected RED to GREEN without deleting assertions, broadening permissions, enabling provider storage, or introducing provider calls/dependencies.

### Phase 3 - SDLC, downstream, and routing integration

15. EDIT `skills/orchestration/using-skills.md` and `skills/shared/sdlc/{01-brainstorming,02-spec,03-plan,04-execute-plan}.md` - Add first-class track discovery, confirmed/under-specified routing, complete spec fields, conditional `agent_architecture`, fail-closed plan review, and future approved `track: ai-agent` dispatch while preserving approval and mode gates.
16. EDIT `skills/orchestration/solution-builder.md` - Allow an approved AI-agent role inside an existing owner or explicit project without adding a universal top-level runtime directory or assuming `@sdcorejs/ai`.
17. EDIT `skills/tracks/test/sdcorejs-test.md`, `skills/shared/workflow/{review,debug,ship,git}.md`, and `skills/orchestration/repair-loop.md` - Conditionally consume or preserve `ai_agent_context`, test server denial and deterministic/live evidence separately, prevent silent policy weakening, sanitize diagnostics, require current ship evidence/deferrals, and keep sensitive runtime artifacts out of Git.
18. EDIT `test/e2e/support/skill-pack-runner.mjs` - Implement the narrow AI-agent implementation detector and priority rules using explicit skill, approved-plan, or confirmed engine/capability architecture evidence rather than broad agent/AI/OpenAI keywords.
19. RUN focused routing, entrypoint, and AI-agent contract tests - Prove positive, brainstorming, localized, and negative ownership; verify existing product/design/test/review/debug/documentation/NestJS/application routes remain unchanged.

### Phase 4 - Entrypoints, public documentation, and architecture index

20. EDIT `README.md`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`, and `site/src/components/SkillCatalog.astro` - Publish the track, runtime boundary, priority, two axes, two engines, twelve capabilities, key governance guarantees, 24-skill count, and most-used implementation entry without duplicating detailed references.
21. EDIT `docs/ADOPTION.md` and `docs/REAL_AGENT_VALIDATION.md` - Add supported-track guidance and a sanitized AI-agent routing/approval-gate scenario across tool surfaces; leave every unexecuted external run explicitly pending.
22. EDIT `CHANGELOG.md` - Add an `Unreleased` entry for the first-class track, contracts, routing, deterministic validation, and documentation without a version bump or release claim.
23. EDIT `.sdcorejs/summary.md` - Refresh only the Summary v2 architecture/navigation index after the new canonical track is stable, record the new track/ref/test surfaces and current source evidence, and do not use it as a mutable session or skill-count checkpoint.

### Phase 5 - Mirrors, verification, and current evidence

24. RUN `npm run sync:skills` and mirror inspection - Generate Claude, plugin, Codex, reference, and Cursor outputs only from canonical sources; inspect new `sdcorejs-ai-agent` mirrors, relative reference paths, supported Codex frontmatter, generated count 24, and absence of hand edits.
25. RUN the focused and broad verification matrix - Execute the dedicated AI test, phase 1, phase 3, text hygiene, skill checks, PowerShell mirror check, NestJS pack check, repository E2E, configured aggregate E2E, site build, root/site audits, and diff/status checks; record every exit code, relevant result, and exact skip reason in thread evidence.
26. RUN `sdcorejs-test`, `sdcorejs-review`, and `sdcorejs-repair-loop` as required - Produce independent test evidence, perform a read-only AI/security/routing/architecture/documentation audit, verify each finding, repair only approved paths before documentation close-out, and rerun every affected focused/broad command.
27. EDIT `VALIDATION.md` through `sdcorejs-documentation` - Record only final-diff command evidence, counts, mirror status, deterministic versus behavioral/live boundaries, pending external surfaces, lock/dependency status, and limitations; confirm no separate product ledger, user guide, durable backlog, or memory artifact is required for this authoring change.

### Phase 6 - Final read-only gates

28. RUN final diff-sensitive verification and `sdcorejs-ship` gates - Re-run changed-source checks after the final evidence write, verify artifact closure and no prohibited/unrelated paths, run verify-before-done, then run branch-ready as the final read-only gate with no later writes.

## Acceptance mapping

- AC-001 -> tasks 2, 3, 5, 8, 14, 24, 25
- AC-002 -> tasks 6, 8, 15, 20, 21, 23, 24
- AC-003 -> tasks 8, 9, 10, 16, 20
- AC-004 -> tasks 2, 10, 11, 14
- AC-005 -> tasks 2, 8, 10, 15, 17, 26
- AC-006 -> tasks 2, 11, 14, 25
- AC-007 -> tasks 2, 11, 14, 25
- AC-008 -> tasks 2, 10, 11, 13, 14, 26
- AC-009 -> tasks 2, 10, 12, 14
- AC-010 -> tasks 2, 10, 12, 14, 26
- AC-011 -> tasks 10, 12, 13, 14
- AC-012 -> tasks 2, 11, 13, 14
- AC-013 -> tasks 2, 12, 13, 14
- AC-014 -> tasks 2, 12, 13, 14
- AC-015 -> tasks 2, 10, 14, 15
- AC-016 -> tasks 2, 10, 11, 14
- AC-017 -> tasks 2, 8, 10, 12, 13, 14, 17
- AC-018 -> tasks 2, 8, 10, 12, 13, 14, 17, 26
- AC-019 -> tasks 2, 10, 12, 13, 14
- AC-020 -> tasks 2, 10, 12, 13, 14, 26
- AC-021 -> tasks 2, 10, 12, 13, 14, 17, 26
- AC-022 -> tasks 2, 8, 10, 11, 12, 14, 17, 26
- AC-023 -> tasks 2, 10, 11, 12, 13, 14
- AC-024 -> tasks 2, 10, 12, 13, 14, 17, 26
- AC-025 -> tasks 2, 8, 10, 11, 12, 13, 14, 17, 25, 26
- AC-026 -> tasks 2, 10, 12, 13, 14
- AC-027 -> tasks 10, 12, 13, 14, 17, 26
- AC-028 -> tasks 2, 10, 12, 13, 14, 17, 26
- AC-029 -> tasks 2, 8, 10, 11, 12, 13, 14, 17
- AC-030 -> tasks 2, 10, 13, 14, 25
- AC-031 -> tasks 2, 13, 14, 25
- AC-032 -> tasks 9, 15, 19, 26
- AC-033 -> tasks 10, 15, 19, 26
- AC-034 -> tasks 2, 15, 19, 26
- AC-035 -> tasks 2, 5, 6, 15, 18, 19
- AC-036 -> tasks 2, 8, 14, 17, 26
- AC-037 -> tasks 2, 16, 19, 26
- AC-038 -> tasks 2, 10, 13, 17, 25, 26
- AC-039 -> tasks 2, 17, 25, 26, 28
- AC-040 -> tasks 4, 5, 6, 15, 18, 19, 25
- AC-041 -> tasks 4, 5, 18, 19, 25
- AC-042 -> tasks 2, 3, 5, 6, 13, 14, 25
- AC-043 -> tasks 2, 5, 6, 14, 19, 25
- AC-044 -> tasks 3, 5, 6, 20, 24, 25
- AC-045 -> tasks 6, 20, 21, 22, 23, 27
- AC-046 -> tasks 2, 4, 8, 9, 10, 11, 12, 13, 20, 21, 24, 25
- AC-047 -> tasks 1, 3, 25, 28
- AC-048 -> tasks 7, 14, 19, 24, 25, 26, 27, 28
- AC-049 -> tasks 1, 17, 21, 25, 27, 28

## Verification

- `node --test test/e2e/ai-agent-track-contract.test.mjs`
- `npm run test:e2e:phase1`
- `npm run test:e2e:phase3`
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
- `git status --short`
- `git diff --stat`
- Manual: inspect canonical versus generated mirrors, confirm manifest/profile
  paths and semantic deltas, verify only the approved `package.json` script
  changed, verify 24-skill inventories agree, confirm no root lock/dependency/
  version or session/checkpoint change, and retain external/live scenarios as
  pending unless matching current transcripts exist.
