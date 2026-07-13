---
name: frontend-architecture-closeout
description: Close remaining frontend architecture wording, regression, live-agent guidance, mirror, and release-evidence gaps.
contract_id: contract-frontend-architecture-closeout-20260713
requirement_id: req-frontend-architecture-closeout-20260713
approvedAt: 2026-07-13T15:21:00+07:00
approvedBy: nghiatt15@onemount.com
approval_source: explicit-user-choice
track: workflow
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: general
profile_confidence: high
sourceDraftPath: .sdcorejs/docs/workflow/2026-07-13-15-18-frontend-architecture-closeout-spec.md
approved_spec_hash: 8e9d6b9f954600bddc6a259f82745cdf4b36f97a88855ee00b27124aa573c281
acceptance_criteria_count: 19
manual_criteria_count: 1
redaction_applied: false
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# Frontend Architecture Close-out - Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract

# Spec - Frontend Architecture Close-out - 2026-07-13 15:18

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: contract-frontend-architecture-closeout-20260713
  requirement_id: req-frontend-architecture-closeout-20260713
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-13-15-21-frontend-architecture-closeout.md
  approved_spec_hash: 8e9d6b9f954600bddc6a259f82745cdf4b36f97a88855ee00b27124aa573c281
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  stack_profile: general
  profile_confidence: high
  source_requirement_context: req-frontend-architecture-closeout-20260713
  acceptance_criteria_count: 19
  manual_criteria_count: 1
  non_goals:
    - Refactor sdcorejs-product or broaden the approved production SDLC scope
    - Add a new frontend architecture reference or executor skill
    - Change plain Angular, Core UI Angular, plain Next.js, or build-website eligibility boundaries
  risks:
    - Broad wording changes could weaken existing anti-over-splitting guidance
    - Repository-wide negative scans could reject legitimate historical or test text
    - Release evidence could overstate Full E2E or live-agent coverage
  assumptions:
    - The current main branch and working tree are the source of truth; the stale NestJS summary is ignored
    - Regression coverage uses the existing Node test harness and mutation-oriented assertion style
    - Coverage approach is post-hoc with targeted tests after each relevant test edit
  redaction_applied: false
  approval:
    approved: true
    approved_at: 2026-07-13T15:21:00+07:00
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Problem & Goals

The frontend architecture work already present in the skill pack is materially
complete, but the Angular executor still contains high-level wording that can
anchor an agent to an exact list/detail component pair. This close-out must
remove that remaining contradiction without redesigning or duplicating the
shared frontend architecture contract.

The goal is to make canonical Angular, Next.js, design, and review guidance
semantically consistent with `_refs/shared/frontend-architecture.md`, protect
the contract with deterministic negative and positive regressions, add honest
live-agent validation scenarios, synchronize generated mirrors, and record
release evidence produced by the final diff.

## Non-goals

- Refactor `sdcorejs-product` or mix product-track work into this change.
- Create a second frontend architecture reference or a new frontend executor.
- Expand the Next.js build-website profile into an application/dashboard
  framework.
- Apply Core UI conventions to plain Angular or build-website conventions to
  plain Next.js.
- Add unrelated application-generation, CI/CD, IaC, observability, release
  governance, or other production-SDLC capabilities.
- Perform broad formatting-only rewrites or manually edit generated mirrors.
- Claim a release, Full E2E result, or live-agent pass that was not observed on
  the relevant commit or final dirty diff.

## Architecture

`_refs/shared/frontend-architecture.md` remains the single shared contract.
Track skills and references delegate to it and carry only the local operational
rules needed by their executor or review flow.

Angular CRUD output is described as routed page containers plus only the
feature-local components, shared reuse, services, and optional collaborators
justified by approved responsibilities and lifecycles. List and detail remain
valid route concepts and minimum page-shell boundaries, not an upper bound of
two components. Simple cohesive screens remain valid as one component;
feature-local extraction does not require multiple consumers; shared/public
promotion requires stronger ownership or consumer evidence.

Next.js preserves route pages as composition/data boundaries where practical,
allows cohesive one-off interactive blocks to be feature-local Client
Components, and keeps client islands as small as the interaction permits.
Design handoff preserves evidence levels and state/interaction ownership.
Review applies architecture comparison only to dimensions that request it and
continues to check both monolith and over-splitting risks without line-count
thresholds.

Regression coverage remains in `test/e2e/skill-pack-runner.test.mjs`. Negative
checks target active semantic sections rather than comments, migration history,
or intentionally quoted forbidden examples. Positive checks protect the shared
contract, conditional `base-select`, project-convention precedence, profile
eligibility, provider/public API rules, and Next.js one-off behavior. Existing
mutation-style checks remain intact or are strengthened.

Generated mirrors are outputs of `npm run sync:skills`; only canonical sources
and generators may be edited directly.

## Stack profile and technology assumptions

- Track: `workflow`.
- Stack profile: `general` skill-pack authoring repository.
- Profile evidence: `skills/**`, `_refs/**`, generated distribution mirrors,
  Node ESM test harness, `scripts/sync-skills.mjs`, and npm scripts in
  `package.json`.
- Package manager: npm, pinned by `packageManager: npm@10.9.2` and the lockfile.
- No dependency, framework eligibility, public API, or schema migration is
  expected.
- Canonical reusable skill/ref/test fixture prose remains English-only;
  runtime-localized behavior remains unchanged.

## File structure

- `skills/tracks/angular/sdcorejs-angular.md` - replace fixed list/detail output
  wording with the approved architecture-derived output contract.
- `skills/shared/sdlc/03-plan.md`, `skills/shared/sdlc/04-execute-plan.md`,
  `skills/tracks/nextjs/sdcorejs-nextjs.md`,
  `skills/tracks/design/sdcorejs-design.md`, and
  `skills/shared/workflow/review.md` - audit and edit only if current wording
  contradicts the shared contract.
- `_refs/shared/frontend-architecture.md`, `_refs/sdlc/{angular,nextjs}.md`,
  `_refs/angular/**`, `_refs/nextjs/**`, and `_refs/design/**` frontend surfaces
  named in the requirement - audit and edit only evidence-backed stale or
  contradictory wording; do not duplicate the shared contract.
- `test/e2e/skill-pack-runner.test.mjs` - strengthen scoped negative, positive,
  assertion-backed, and mutation-oriented regressions.
- `test/e2e/fixtures/**` or entrypoint tests - edit only if routing or
  entrypoint policy is actually affected.
- `docs/REAL_AGENT_VALIDATION.md` - add three targeted frontend scenarios using
  the existing transcript template and mark unexecuted runs as pending.
- `CHANGELOG.md` - add a concise `Unreleased` close-out entry.
- `VALIDATION.md` - replace or append only current final-diff evidence, exact
  commands, outcomes, mirror state, and explicit limitations.
- `.claude/skills/**`, `plugin/skills/**`, `plugin/_refs/**`,
  `codex/skills/**`, `codex/skills/_refs/**`, and
  `.cursor/rules/sdcorejs-agent.mdc` - regenerate, never edit manually.

## Functional and evidence requirements

- Preserve list/detail routes while removing language that defines them as the
  complete component model.
- Preserve route-shell orchestration, parent form ownership, conditional
  facade/store creation, responsibility-driven provider scope, conditional
  `base-select`, private feature symbols, and project-convention precedence.
- Preserve plain Angular/generic-harness and plain Next.js/build-website
  boundaries.
- Add complex Angular list, simple Angular drawer, and one-off Next.js estimator
  scenarios to real-agent validation guidance for every supported tool surface
  through the existing reusable template/matrix conventions.
- Record live-agent runs only when actually executed; otherwise record pending
  status and the exact limitation.
- Run the repository-supported targeted and broad validation commands required
  by the request, and retain exact failures when the environment blocks a tier.

## Acceptance criteria

- AC-001 - Active Angular executor wording no longer contains `Components (List, Detail)` or equivalent wording that limits output to exactly two components.
- AC-002 - Full-CRUD dispatch no longer defines output as only model, service, routes, list, and detail.
- AC-003 - Replacement Angular wording explicitly covers route/page containers, architecture-derived feature-local components, justified shared reuse, data-access services, and optional collaborators based on responsibility/lifecycle decisions.
- AC-004 - List/detail route shells remain valid minimum screen boundaries, while complex filters, tables, form sections, child collections, bulk actions, workflow panels, and dialogs may use meaningful approved child boundaries.
- AC-005 - Simple cohesive screens may remain one component, one-element/pass-through splits remain discouraged, and no hard line-count rule is added.
- AC-006 - Feature-local components do not require multiple consumers; shared/public promotion requires stable ownership or consumer evidence.
- AC-007 - Parent form/entity state remains the single source of truth when child form sections are used; child components do not duplicate the model.
- AC-008 - Facade/store creation, provider scope, public exports, and `base-select` generation remain conditional and responsibility/evidence-driven.
- AC-009 - Existing project conventions continue to override fallback structures, and feature-private route/child symbols remain private unless external consumers are verified.
- AC-010 - Plain Angular continues through the generic harness without Core UI assumptions; plain Next.js remains separate from the build-website profile.
- AC-011 - Next.js continues to allow a cohesive or interactive one-off block to be feature-local, without forcing inline placement or global shared promotion, while keeping the smallest meaningful Client Component island.
- AC-012 - Design guidance distinguishes route container, feature-local, existing shared/design-system, candidate, and unknown evidence, without inventing code paths, provider scopes, or exports.
- AC-013 - Review architecture comparison remains dimension-gated and detects both monolith and over-splitting risk without blocking unrelated security/performance/accessibility-only reviews.
- AC-014 - Deterministic scoped negative tests fail when any forbidden fixed two-component wording is reintroduced into active Angular executor instructions.
- AC-015 - Deterministic positive tests protect route/page minimum boundaries, cohesive simple screens, feature-local single-consumer validity, shared-promotion evidence, conditional `base-select`, Next.js one-off behavior, and project-convention precedence.
- AC-016 - Existing assertion/mutation regressions remain active; executable examples strip comments where appropriate, require active assertions, reject comment-only assertions, and keep provider examples coherent.
- AC-017 - Real-agent guidance includes all three requested frontend scenarios and the full transcript evidence fields; actual execution is manual, and every unrun surface is explicitly pending rather than passed.
- AC-018 - `CHANGELOG.md` records the user-visible frontend close-out under `Unreleased`; `VALIDATION.md` contains only commands and observations produced for the final diff, including mirror, Full E2E, and live-agent limitations.
- AC-019 - Canonical sources and generated mirrors synchronize; text hygiene, skill checks, targeted phase 1/repository E2E, full configured E2E, PowerShell mirror validation, dependency audit, and `git diff --check` pass or retain exact documented failures, with no unrelated product refactor.

## Risks & mitigations

- **Risk:** Replacing every `list + detail` phrase would erase valid route concepts. -> **Mitigation:** Change only active wording that makes the pair exhaustive; retain explicit route-shell usage and legitimate historical/negative examples.
- **Risk:** Negative regexes become repository-wide keyword checks. -> **Mitigation:** Extract and test the relevant active semantic section, strip comments where executable examples are involved, and mutation-test the exact regressions.
- **Risk:** Close-out edits duplicate the shared architecture reference. -> **Mitigation:** Keep shared rules in `_refs/shared/frontend-architecture.md` and add only local delegation or operational wording.
- **Risk:** Mirror churn obscures canonical intent. -> **Mitigation:** Edit canonical sources first, run the generator once canonical/test/docs changes are stable, and review canonical and generated diffs together.
- **Risk:** Validation documentation overstates evidence. -> **Mitigation:** Capture command, exit code, dirty-diff/HEAD identity, observed output, Full E2E status, and live-agent status only after execution.
- **Risk:** Stale `.sdcorejs/summary.md` influences scope. -> **Mitigation:** Treat current `main`, HEAD, user brief, and repository files as authoritative; do not refresh the unrelated NestJS summary in this change.

## Out of scope (deferred)

- Product-track refactoring - defer to the separate explicitly approved PR described by the requirement.
- New production SDLC skills or references - defer until explicit scope expansion and a separate approved spec/plan.
- Actual cross-runtime live-agent execution for Claude Code, Codex native skills, Cursor, and Copilot - defer when those installed surfaces are unavailable; retain pending scenarios and limitations.
- Release tagging, version bumping, pushing, or publishing - defer until an explicit release request and ship/git gates.


## Decisions captured during review

- (approved as drafted)

## Skill provenance

sdcorejs-spec (approved on attempt 1 / 3)
