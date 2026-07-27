---
artifact_id: spec-draft-contract-sdcorejs-simplify-20260727-r1
artifact_kind: execution-doc
change_ref: sdcorejs-simplify-20260727
source_spec: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
---

# Spec - SDCoreJS Simplify Workflow Utility - 2026-07-27 10:43

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: contract-sdcorejs-simplify-20260727
  requirement_id: req-sdcorejs-simplify-20260727
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
  approved_spec_hash: 3e2195d10292a8bdda0412a62194b7dc4f2d540bde614fc18159388f67128b6c
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  stack_profile: node-general
  profile_confidence: high
  profile_evidence:
    - The repository has 24 canonical dispatchable skills under skills/**.
    - skills/** and _refs/** are canonical sources.
    - scripts/sync-skills.mjs owns Claude, plugin, Codex, reference, and Cursor mirrors.
    - test/e2e/** uses the Node.js test runner for deterministic repository contracts.
    - package.json declares npm@10.9.2 and package version 0.5.1.
  source_requirement_context: req-sdcorejs-simplify-20260727
  acceptance_criteria_count: 25
  manual_criteria_count: 2
  coverage_approach: tdd
  non_goals:
    - Add simplify to the execute-plan track enum.
    - Change observable behavior, public contracts, protected strings, prompts, configuration, tests, dependencies, or architecture.
    - Build a formatter, linter autofix wrapper, performance optimizer, bug fixer, documentation rewriter, or repository-wide dead-code remover.
    - Stage, commit, push, open a pull request, tag, publish, or release.
    - Create mutable session or checkpoint state.
  risks:
    - A broad keyword detector could steal bug, review, test, documentation, performance, dependency, or architectural refactor requests.
    - Simplification guidance could authorize protected content or framework-contract drift.
    - Finish-tail ordering could reuse stale test, review, or ship evidence after a write.
    - Generated mirrors or public skill counts could drift from canonical sources.
    - Deterministic tests could be overstated as proof of arbitrary semantic equivalence.
  assumptions:
    - The attached implementation brief is equivalent complete input and explicit approval for this skill.
    - The clean main baseline is c8fdf152e87153d8a0dd64921a66df5b8d6ea933 with 24 canonical skills.
    - Local main, origin/main, and FETCH_HEAD resolve to the same baseline.
    - No dependency, package version, package manager, or lockfile change is required.
    - Reusable source stays English-only and locale-neutral except explicit localized routing input fixtures.
  redaction_applied: false
  approval:
    approved: true
    approved_at: 2026-07-27T10:43:44+07:00
    approval_source: equivalent-complete-input
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
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
```

## Problem & Goals

The skill pack lacks a dedicated workflow utility for bounded,
behavior-preserving refinement of recently changed executable source. Existing
owners cover read-only review, structured repair, debugging, tests,
documentation, approved refactors, dependency delivery, and Git artifacts, but
none owns direct simplification with a green baseline and strict protected
surfaces.

Add exactly one dispatchable skill, `sdcorejs-simplify`, as a daily workflow
utility. Make current changed executable source the default scope, support
explicit source paths, separate analyze-only from apply actions, require
before/after verification for writes, and emit runtime-only
`simplify_context`. Preserve clarity over line-count reduction and fail closed
on behavior, contract, protected-content, or verification uncertainty.

## Non-goals

- Do not add a new implementation track or `simplify` track enum value.
- Do not authorize broad repository refactors, architecture changes, public API
  changes, schema changes, dependency removal, performance changes, or
  user-visible behavior changes.
- Do not modify prompts, instructions, documentation, configuration, data
  contracts, string content, tests, fixtures, snapshots, generated files, or
  framework metadata through direct simplification.
- Do not perform Git mutations or create a durable report by default.
- Do not claim semantic equivalence beyond current focused verification.

## Architecture

Create the concise canonical executor at
`skills/shared/workflow/simplify.md`. Put scope and protected-surface rules,
stack guardrails, and verification/evidence details in three shallow references
under `_refs/simplify/`. Integrate the utility into dedicated-workflow routing,
the opt-in finish gate, and downstream test/review/repair/debug/ship/git
contracts without adding it to the implementation-track catalog.

Use a narrow routing detector that combines refinement intent, recent-diff or
explicit executable-source scope, behavior-preservation intent, and the absence
of competing owner signals. Add deterministic positive, localized, planning,
and negative fixtures. Protect the contract with a dedicated test that includes
in-memory or temporary-copy mutations and is part of
`test:e2e:repository`.

Only edit canonical/source-owned entrypoints. Regenerate Claude, plugin, Codex,
reference, and Cursor mirrors through `npm run sync:skills`; never hand-edit
generated trees.

## Stack profile and technology assumptions

- Track: `workflow`
- Stack profile: `node-general`
- Package manager: `npm@10.9.2`
- Test runner: Node.js built-in test runner
- Public site: Astro under `site/`
- Dependency, env, migration, manifest-version, and lockfile changes: none

## File structure

- `skills/shared/workflow/simplify.md` - canonical utility executor.
- `_refs/simplify/scope-and-invariants.md` - actions, scope, exclusions,
  protected content, behavior contract, limits, and refinement patterns.
- `_refs/simplify/stack-guardrails.md` - Angular, NestJS, Next.js/React, and
  AI-agent invariants.
- `_refs/simplify/verification.md` - baseline, pass discipline, post-change
  verification, Git boundary, `simplify_context`, and downstream evidence.
- `_refs/shared/finish-gate.md` - visible four-step opt-in integration.
- `skills/**`, entrypoints, and downstream workflow owners - routing and
  evidence integration.
- `test/e2e/simplify-skill-contract.test.mjs` and existing routing tests -
  deterministic contract, mutation, fixture, count, and mirror coverage.
- `package.json` - append only the dedicated test to the repository aggregate.
- `README.md`, `VALIDATION.md`, `CHANGELOG.md`, `site/**`, and adoption/workflow
  docs - public utility positioning and current evidence.
- Generated mirror trees - generated only by the sync script.

## Acceptance criteria

- AC-001 - Exactly one canonical `sdcorejs-simplify` skill exists and canonical
  plus all generated mirror counts increase from 24 to 25.
- AC-002 - The skill is a workflow utility and `simplify` is absent from the
  execute-plan track enum and implementation-track catalog.
- AC-003 - The skill exposes exactly the five specified `simplify_action`
  values and defaults bounded write requests to the current changed source.
- AC-004 - Scope resolution prefers explicit source scope, execution evidence,
  AI-agent changed files, same-change diff, and staged/unstaged executable
  source in that order.
- AC-005 - Analyze actions are read-only; apply actions require a green current
  baseline and matching focused post-change verification.
- AC-006 - Broad, architectural, public-contract, schema, dependency,
  performance, concurrency, transaction, agent-contract, or user-visible
  changes return `planning-handoff`.
- AC-007 - Protected documentation, prompt, instruction, configuration,
  contract, data, test-oracle, generated, vendor, output, migration, manifest,
  and lockfile categories fail closed.
- AC-008 - Protected literals, routes, permissions, telemetry, SQL, GraphQL,
  shell commands, URLs, selectors, IDs, regex behavior, and embedded
  configuration cannot be rewritten.
- AC-009 - Observable success/failure paths, ordering, side effects, auth,
  tenant, persistence, rendering, accessibility, metadata, and dependency
  surfaces are recorded before edits.
- AC-010 - Clarity is prioritized over brevity and forbidden
  over-simplification patterns are explicit.
- AC-011 - Execution is bounded to two passes, five files per pass, eight total
  files without reconfirmation, and twenty hunks without reconfirmation.
- AC-012 - Failed passes are reverted with exact scoped edits, never destructive
  Git commands or user-change restoration.
- AC-013 - Angular, NestJS, Next.js/React, and AI-agent framework/security
  contracts are protected without duplicating their full reference packs.
- AC-014 - Every run emits the complete runtime-only `simplify_context` schema
  and no mutable session/checkpoint or default durable report.
- AC-015 - Test, review, repair-loop, debug, ship, and git owners consume or
  preserve `simplify_context` with freshness and protected-contract checks.
- AC-016 - The finish gate has four visible sequential decisions: tests,
  user/technical documentation, behavior-preserving simplification, and review.
- AC-017 - Simplification never auto-runs; tests establish the baseline before
  simplification and post-simplification focused tests precede review.
- AC-018 - Routing uses a narrow combined detector and preserves the dedicated
  owners for bugs, findings, review, tests, docs/prompts, performance,
  dependencies, architecture, and approved plans.
- AC-019 - Positive, localized, planning, negative, and generic no-write routing
  fixtures are deterministic and expected reusable output remains English.
- AC-020 - Dedicated mutation tests fail when any required scope, protected
  surface, verification, limit, Git, finish-gate, narrow-routing, AI-agent, or
  ship-freshness invariant is removed.
- AC-021 - The dedicated contract test is included in
  `test:e2e:repository`, uses no API key/live model/paid evaluation, and does
  not mutate canonical sources in place.
- AC-022 - Canonical routing entrypoints, public catalog, user documentation,
  changelog, validation inventory, and site count describe 25 skills and place
  simplify among daily utilities rather than tracks.
- AC-023 - Sync generates the Claude, plugin, Codex, reference, and Cursor
  mirrors with valid relative paths and supported Codex frontmatter.
- AC-024 - Focused, repository, aggregate, hygiene, mirror, NestJS, site, audit,
  and diff checks are run when supported; every skip or limitation is reported.
- AC-025 - Package version, dependencies, root/site lockfiles, unrelated user
  changes, and Git history remain unchanged.

## Risks & mitigations

- **Risk:** Broad routing steals another workflow. -> **Mitigation:** Require a
  compound detector and deterministic negative/mutation fixtures.
- **Risk:** A local rewrite changes untested behavior. -> **Mitigation:** Record
  preserved surfaces, require a green baseline, use bounded passes, rerun the
  same focused commands, and report verification limits honestly.
- **Risk:** Protected strings or framework metadata drift. -> **Mitigation:**
  Fail closed, inspect final diffs, and make review/ship block on drift.
- **Risk:** Generated surfaces drift. -> **Mitigation:** Edit only canonical
  sources, regenerate, and run both Node and PowerShell parity checks.
- **Risk:** Evidence overclaims compatibility. -> **Mitigation:** Separate
  deterministic repository coverage from unrun external/live tool validation.

## Out of scope (deferred)

- Arbitrary semantic-equivalence proving - defer indefinitely; current tests
  provide evidence, not proof.
- Live Claude, Codex, Cursor, Copilot, browser, container, or provider
  validation - run only in an available isolated environment with explicit
  evidence.
- Git artifact creation, release, publication, or package-version changes -
  require a separate user request and current ship evidence.
