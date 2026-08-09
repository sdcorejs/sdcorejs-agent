---
name: sdcorejs-review
description: Read-only review/audit skill for every central-registry track, including Angular, NestJS, Next.js, AI-agent, product, design, documentation, workflow, test, React, Node, fullstack, and general. Reviews code/artifacts, ownership, security, evidence, traceability, and generated/reference validity; emits durable findings without writing or auto-repair. Runtime-localized.
allowed-tools: AskUserQuestion, Bash, Edit, Glob, Grep, Read, TodoWrite, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->


# Review (profile + dimension aware)

## Purpose
One read-only review skill for code, architecture, security, performance, and
accessibility. It classifies both `track` and `track_profile` before loading
track-specific references so plain Angular, NestJS, Next.js, and general
projects are not reviewed against SDCoreJS framework conventions they do not
use.

`sdcorejs-review` must not edit source code. Direct user-requested review is
strict read-only by default and must not silently write `.sdcorejs` artifacts or
auto-run `sdcorejs-repair-loop`. Repair belongs to `sdcorejs-repair-loop` after
an explicit user or finish-gate choice.

Resolve `track` and its durable `review_profile` from
`_refs/shared/system-registry.json`, then validate context/findings with
`_refs/shared/review-contract.mjs`. Do not maintain a separate first-class
track enum in this skill.

## Shared Protocols

Read `_refs/shared/runtime-protocols.md`. Apply
`_refs/shared/artifact-lifecycle.md` only when the user explicitly chooses to
persist the report.

## When to use
- After a track executor finishes a batch and the finish gate selected review.
- Before merging a feature branch.
- User says "review code", "security review", "performance review",
  "review a11y", "architecture review", "comprehensive audit", "full review",
  "scored review", or localized equivalents.

## Step 0 - Context and Scope Preflight

Before detecting profile/dimension or reading files under review, run
`sdcorejs-explore (summary-read)` through `_refs/shared/project-context.md`.

- For an existing target project, read `<target>/.sdcorejs/summary.md` when it
  exists so review scope, module boundaries, route conventions, stack profile,
  and prior decisions are available before findings are classified.
- Keep direct review strict read-only. If the summary is missing, stale, dirty,
  or unknown, do not refresh it from review; continue with targeted reads or
  `sdcorejs-explore (code-map-readonly)` and report the context limitation.
- Review never refreshes summary. A separate user-requested summary refresh or
  an architecture-level change owned by the sequential/integration workflow
  may do so before or after review.
- Current diffs, failing tests, explicit review scope, and user corrections
  override stored summary context.

Then run `sdcorejs-explore (conventions-read)` through
`_refs/shared/convention-context.md` for the categories this review touches. It
never creates the capture policy and never refreshes evidence; a missing registry
is a context signal, not a blocker and not write permission.

Determine review scope in this order:

1. explicit user-provided files or directories;
2. current task, plan, or spec scope;
3. git diff against the current branch/base if available;
4. changed files in the working tree;
5. inferred module from the request;
6. ask the user for one numbered scope choice if the repo is too large and no
   clear scope exists.

When current `test_context`, `test_status`, or `test_evidence` is available,
consume it as read-only review input. Build a compact test matrix mapping
requirements/risks to authored cases, executed runs, results, blockers,
environment/persona coverage, data cleanup, and UI captures. Test evidence must
match the current `associated_HEAD_or_diff`; written-but-unexecuted cases and
legacy/stale runs remain gaps. Do not run missing tests merely to complete a
review unless the user expands the request. Preserve `ui_capture_context` and
`artifact_context` classifications; diagnostic/local-only artifacts are not
review deliverables.

Exclude generated/vendor/build output by default: `node_modules`, `dist`,
`build`, `coverage`, `.next`, `.turbo`, `.angular`, generated clients,
lockfiles unless relevant, and generated Codex/Claude/plugin mirrors unless the
review is about skills/mirrors. "Read every file under review" means every file
inside the selected `file_scope`, not the entire repository by default.

## Step 1 - Classify Track, Track Profile, Dimension, and Mode

### Track and track_profile

Classify `track_profile` before loading any track-specific ref:

First resolve the first-class artifact track and `review_profile` from the
central registry. The stack-specific table below refines executable-code
reviews only; AI-agent, design, documentation, workflow, product, test, React,
Node, fullstack, and general remain durable review profiles rather than orphan
sections.

| track | track_profile | Required evidence |
|---|---|---|
| angular | `core-ui-angular` | Angular signals plus `@sdcorejs/angular` in `package.json` or strong existing imports/usages. |
| angular | `legacy-core-ui-angular` | Angular signals plus `@sd-angular/core` in `package.json` or strong existing imports/usages. |
| angular | `plain-angular` | Angular signals but neither Core UI package/convention is installed or used. |
| nestjs | `sdcorejs-nestjs` | NestJS signals plus `@sdcorejs/nestjs` or strong SDCoreJS NestJS conventions/libraries. |
| nestjs | `plain-nestjs` | NestJS signals without `@sdcorejs/nestjs` or SDCoreJS NestJS conventions. |
| nextjs | `nextjs-build-website` | Next.js signals plus build-website/public-site evidence such as `src/app/[locale]`, typed i18n navigation, content/public-site structure, build-website summary/plan/spec/task context, or explicit public-site scope. |
| nextjs | `plain-nextjs` | Next.js signals without build-website/public-site evidence. |
| general | `general` | No known track can be confidently classified, or mixed/unknown stack where only shared rules are safe. |

Rules:

- Do not treat Angular as Core UI Angular merely because `angular.json` or
  `@angular/core` exists.
- Do not treat NestJS as SDCoreJS NestJS merely because `@nestjs/*` exists.
- Do not treat Next.js as build-website merely because `next.config.*` or
  `next` exists.
- Do not enforce Zod, TypeORM, PostgreSQL, `@sdcorejs/nestjs`, Core UI,
  `[locale]`, typed i18n navigation, or build-website caching/layout patterns
  unless the classified profile or actual installed/used stack supports them.
- If the user explicitly asks to review a migration/install to an SDCoreJS
  framework profile, classify the migration scope separately and review only the
  approved migration evidence.

### Dimensions

Dimension comes from user intent. Ids come from `review_dimensions` in
`_refs/shared/system-registry.json`; keep no second enum here.

| Dimension | Use when |
|---|---|
| `code` | "review code", "review", "audit module", per-file conventions. |
| `architecture` | "architecture review", "module boundaries", "circular dependency", "layering". |
| `consistency` | "consistency review", "review naming consistency", "review API conventions", singular/plural or casing drift, "same thing named differently", convention audit. |
| `security` | "security review", "SQL injection", "secrets", "CSP", "route guards". |
| `performance` | "performance review", "Lighthouse", "N+1", "bundle size", "slow query". |
| `accessibility` | "accessibility", "a11y", "WCAG", "aria", "keyboard nav", "contrast". |
| `ALL` | "comprehensive audit", "full review", "enterprise readiness"; run every applicable dimension and mark non-applicable dimensions as N/A. |
| `site-audit` | Next.js existing whole-site audit; only use build-website site audit when `track_profile=nextjs-build-website`, otherwise run table review and report site-audit N/A. |

Preserve dimensions. A security review remains `security`; do not relabel it as
generic `code`. Accessibility is N/A for backend-only profiles unless the user
asks for API usability/error-shape accessibility or a generated docs/UI review.
Consistency coverage resolves through `resolveConsistencyScope` in
`_refs/shared/review-contract.mjs`: never relabel a consistency issue as code
style, never let a narrow dimension expand into a full audit.

Frontend architecture comparison is active only when the scope is frontend and
the selected dimensions include `code`, `architecture`, or `ALL`. When active,
locate the selected approved plan/spec from the current execution context or the
matching `.sdcorejs/plans/<track>/` contract. Read its `frontend_architecture`
block when present; do not blindly select the newest plan. Record the selected
path/hash or state that no approved architecture plan is available for
comparison. For a security-, performance-, or accessibility-only frontend
review, do not load this contract and record
`approved_frontend_architecture.status: not-applicable`.

### Review mode and scored support

- Default mode is `quick-table` or `table`.
- Angular/NestJS code quick reviews may use table mode.
- Scored review is currently supported only for `core-ui-angular` and
  `legacy-core-ui-angular` using `_refs/angular/review-code.md`.
- For `plain-angular`, `sdcorejs-nestjs`, `plain-nestjs`,
  `nextjs-build-website`, `plain-nextjs`, and `general`, state that scored mode
  is unavailable unless a repo-defined rubric exists, then run table mode
  unless the user asks to stop.

## Step 2 - Load Applicable References

Load track-specific refs only when `track_profile` matches the ref scope. Load
shared refs for shared dimensions when applicable. If a ref is absent or not
applicable, record it under `refs_skipped` with a reason; do not fabricate a
missing ref and do not silently fail.

| track_profile | code | security | performance | accessibility | architecture |
|---|---|---|---|---|---|
| `core-ui-angular` | `_refs/angular/review-code.md` | `_refs/shared/review-security.md` + `_refs/angular/review-security.md` | `_refs/shared/review-performance.md` + `_refs/angular/review-performance.md` | `_refs/shared/review-accessibility.md` + `_refs/angular/review-accessibility.md` | `_refs/shared/review-architecture.md` |
| `legacy-core-ui-angular` | `_refs/angular/review-code.md` | same as Core UI Angular | same as Core UI Angular | same as Core UI Angular | `_refs/shared/review-architecture.md` |
| `plain-angular` | `_refs/shared/review-code.md` plus generic/local Angular checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |
| `sdcorejs-nestjs` | `_refs/nestjs/review-code.md` | `_refs/shared/review-security.md` + `_refs/nestjs/review-security.md` | `_refs/shared/review-performance.md` + `_refs/nestjs/review-performance.md` | N/A unless API usability/docs/UI scope requested | `_refs/shared/review-architecture.md` |
| `plain-nestjs` | `_refs/shared/review-code.md` plus generic/local NestJS checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | N/A unless API usability/docs/UI scope requested | `_refs/shared/review-architecture.md` |
| `nextjs-build-website` | `_refs/nextjs/build-website/review-code.md` | `_refs/shared/review-security.md` + `_refs/nextjs/build-website/review-security.md` | `_refs/shared/review-performance.md` + `_refs/nextjs/build-website/review-performance.md` | `_refs/shared/review-accessibility.md` + `_refs/nextjs/build-website/review-accessibility.md` | `_refs/shared/review-architecture.md` |
| `plain-nextjs` | `_refs/shared/review-code.md` plus generic/local Next.js checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |
| `general` | `_refs/shared/review-code.md` | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |

Load `_refs/shared/review-consistency.md` whenever the resolved consistency
scope is not `none`. It is profile-neutral; track refs add boundary examples but
never fork its semantic rules.

When frontend architecture comparison is active, load
`_refs/shared/frontend-architecture.md` and compare the implementation with the
approved component tree, reuse decisions, responsibilities, state/service
ownership, provider lifecycle, registration, public exports, and architecture
tests. Framework-specific refs add detail; they do not replace the shared
comparison.

Plain-profile guardrails:

- `plain-angular`: must not flag missing `Sd*` components/services, Core UI
  imports, `autoId`, Core UI style utilities, `src/libs/**/features/**`,
  `MockCrudStore`, `SdTable`, `SdNotifyService`, forced admin screens, or Core
  UI usage summaries unless the project already uses SDCoreJS Core UI.
- `plain-nestjs`: must not enforce `@sdcorejs/nestjs`, Zod, TypeORM,
  PostgreSQL, base repositories/services, or a specific module layout unless
  detected in the target project. If the project uses Prisma, class-validator,
  Mongoose, Fastify, or another stack, review against that actual stack.
- `plain-nextjs`: must not enforce `[locale]`, `setRequestLocale`, typed i18n
  navigation, content/public-site folders, landing-site metadata conventions, or
  build-website caching rules unless detected.

## Step 3 - Probe Discipline and Secret Redaction

Discover review and verification commands from package manager, lockfile,
workspace configuration, `package.json` scripts, installed tools, and original
failing commands. Do not hardcode `npm` or `tsc`. Do not invent missing
scripts. Do not download probe tools with `npx --yes` or similar without
explicit approval.

Rules:

- Detect package manager from lockfiles and `package.json`.
- Do not mix `npm`, `yarn`, `pnpm`, and `bun`.
- Use existing `package.json` scripts only.
- Prefer the project's own build, lint, typecheck, test, audit, Lighthouse,
  pa11y, axe, load-test, and bundle-analysis scripts when present.
- Respect workspace scripts in monorepos when detectable.
- Do not assume `src/libs`, `src/app/[locale]`, `src/modules`, or any source
  root unless the project evidence shows it.
- If a probe cannot run, add it to `probes_skipped` with evidence, for example
  `no lint script found in package.json`, `tool not installed`, `network not
  allowed`, `not applicable to backend-only profile`, or `user approval required`.

Security redaction is mandatory:

- Never echo secret values from `.env`, local config, CI files, shell output, or
  source files.
- Never print full lines that contain likely secret values.
- For secret findings, report only file path, line number when available,
  key/category name, reason, and redacted evidence such as
  `API_KEY=[REDACTED]`.
- Do not run a command that would print secrets. Use safer file/path scanning or
  ask for redacted manual inspection.
- Review artifacts and `review_context` must not persist secrets.

## Step 4 - Review

1. Read every file inside the selected `file_scope`.
2. Run applicable probes using the command discipline above.
3. When frontend architecture comparison is active, compare the actual file
   decisions, route/page and child tree, state owners, service/data flow,
   provider scope, declarations/registration, private/public exports, and tests
   with the selected approved `frontend_architecture` contract. Record justified
   deviations; flag drift when no approved change or compatibility reason exists.
4. Map each finding to the selected dimension and the loaded ref criteria.
   Also verify approved artifact freshness/hash, scope, semantic repository
   ownership, test/generated-reference validity, traceability, cross-repository
   provenance, and portal-pinned module revisions when applicable.
5. When consistency is in scope, compare current evidence against accepted
   rules, authoritative config/contracts, approved specs/plans, observed
   patterns, exceptions, deprecations, and stale/conflicted rules. Classify
   concept, role, layer, boundary, ownership, tense, and compatibility first.
6. Assign stable IDs (`R1`, `R2`, `R3`) and repair tier metadata.
7. Build the complete `review_context` for the exact downstream consumer and
   pass it through `context.pass`. Show the user a localized projection with
   every finding, strength, N/A dimension/ref, and verification gap.

If evidence is incomplete, mark the finding `UNCLEAR` or `Needs verification`
instead of presenting it as a definite blocker. Do not inflate style
preferences into blockers.

## Post-review Behavior

When `sdcorejs-review` is called from a code-generation finish gate, return the
report to the caller. The caller owns repair-loop, acceptance verification,
branch-ready, documentation/task tracker artifacts, and memories. The caller may
invoke `sdcorejs-repair-loop` only when the finish-gate review choice was "Run
review and repair loop"; a skipped finish-gate review or direct read-only review
must not auto-edit.

The caller must complete any write-producing documentation, task tracker,
memory, convention-sync, changelog, or release-note steps before the final
branch-ready gate. No writes after branch-ready unless it is run again.

If a finding is a concrete single bug rather than a findings set, keep it in
`review_context` as evidence. Repair-loop may delegate that one item to
`sdcorejs-debug`, which returns `debug_context` before the caller continues the
tail chain.

Convention persistence is the caller's separate
`sdcorejs-explore (conventions-sync-write-approved)` step. Direct review returns
candidates plus whether an approved `after-review` policy authorizes a later
sync; finish-gate review passes `convention_context` through the tail so the
sync sees the final code writes.

When `sdcorejs-review` is invoked directly by the user:

1. Stay strict read-only by default.
2. Do not edit source code.
3. Do not write `.sdcorejs` docs, tasks, memories, or summaries by default.
4. Do not auto-run `sdcorejs-repair-loop`.
5. Offer explicit next steps when useful:

```text
Next step:
1. Run sdcorejs-repair-loop on blocking findings.
2. Persist this review summary as a .sdcorejs artifact.
3. Stop after review.

Reply with `1`, `2`, or `3`.
```

Only option `2` may write a review artifact, and only after the user explicitly
chooses it. Persist it as a change-scoped durable artifact with
`commit_policy: with-change` when it belongs to the change, then emit
`artifact_context.required_with_change`. If relationship metadata is
insufficient, classify it as `conditional` and do not imply Git inclusion.

## Output Format

Match the user's language at runtime. Keep identifiers, paths, env keys, route
paths, and permission codes exact. Build the complete `review_context` for
repair-loop/ship compatibility, but do not render or echo the full
`review_context` in user-facing output by default. Findings in the user
projection must still include severity, evidence, `file:line` or exact scope,
risk, repair tier, and suggested action. Use the validated portable handoff
when `runtime_context_channel` is unsupported or unknown. Show the full
structured context only when the user requests it or validation requires it.

````markdown
# Authoritative runtime context (not user-visible by default)

The following schema is passed to the consumer or reduced by the declared
consumer-required-field matrix for a portable handoff.

# Review - <module/feature> - <track> - <track_profile> - <dimension(s)> - <date>

```yaml
review_context:
  source: sdcorejs-review
  track: <central-registry track id>
  review_profile: <track.review_profile from central registry>
  track_profile: <detected stack profile or not-applicable>
  artifact_identity:
    owner_repository_id: <stable repository id>
    owner_module_id: <module id or null>
    execution_host_repository_id: <stable repository id>
  approved_artifact:
    path:
    approval_hash:
    current_hash:
    freshness: current | stale | mutated | unavailable
  source_revision_map: {}
  portal_pinned_module_revision_map: {}
  dimensions:
    - code | architecture | consistency | security | performance | accessibility | ALL
  consistency_scope: complete | applicable | structural | dimension-affecting-only | none
  review_mode: quick-table | table | scored | blocking | site-audit
  approved_frontend_architecture:
    plan_path: <selected approved plan or null>
    plan_hash: <approved plan hash or null>
    status: compared | unavailable | not-applicable
  file_scope:
    - path/or/glob
  refs_loaded:
    - _refs/...
  refs_skipped:
    - ref: _refs/...
      reason: not applicable to this track_profile
  package_manager: npm | pnpm | yarn | bun | unknown
  probes_run:
    - command: command if actually run
      exit: exit code if available
      notes: redacted or summarized
  probes_skipped:
    - probe: lint/build/test/lighthouse/pa11y/axe/etc.
      reason: no script found, tool not installed, network not allowed, not applicable, or user approval required
  test_evidence_summary:
    test_matrix_status: complete | partial | absent | stale
    associated_HEAD_or_diff: <sha-or-diff-fingerprint>
    gaps: []
  finding_ids:
    - R1
    - R2
  findings:
    - id: R1
      severity_or_gate: High/REQUIRED
      dimension: security
      file_line_or_scope: src/auth.guard.ts:42
      issue: Missing permission check
      evidence: <redacted or summarized evidence>
      risk: Unauthorized access
      suggested_action: Add resource permission guard
      repair_tier: confirm
      gate: REQUIRED
  repair_gate_mapping:
    blocking: Critical/Important or BLOCKER/REQUIRED
    confirm: semantic/non-mechanical fixes
    user_decision: product/contract/security-policy decisions
  convention_context: <read-only block from _refs/shared/convention-context.md>
```

## Findings
| ID | Severity/Gate | Dimension | File/Line or Artifact Locator | Repository/Module | Issue | Evidence | Impact | Required fix | Repair tier | Gate |
|---|---|---|---|---|---|---|---|---|---|
| R1 | High/REQUIRED | security | src/auth.guard.ts:42 | repo-id / module-id | Missing permission check | redacted/summarized evidence | Unauthorized access | Add resource permission guard | confirm | REQUIRED |

## Strengths
| File/Line or Scope | What's good | Reuse where |
|---|---|---|

## N/A And Skipped
| Item | Reason |
|---|---|

## Next Action
- Blocking findings -> `sdcorejs-repair-loop` only after explicit user/finish-gate choice.
- User-decision findings -> ask for the decision before editing.
- Probe gaps -> run skipped probes only after prerequisites/approval exist.
````

Findings rules:

- Cite `file:line` for every file-level finding. If no file/line exists, mark
  the finding as scope-level or architecture-level.
- Do not omit Suggested fix for blocking findings unless the finding is
  `user-decision` or an architecture decision; in those cases, say what decision
  is needed.
- Use `auto` only for mechanical low-risk fixes. Use `confirm` for semantic or
  non-mechanical fixes. Use `user-decision` for product, contract,
  architecture, migration, security-policy, or UX decisions.
- In table mode, accepted gate values are `BLOCKER`, `REQUIRED`, `ADVISORY`,
  and `N/A`.
- In quick-table mode, a severity table with no rows must contain `_none_`; do
  not omit the heading.

## AI-agent review

When `ai_agent_context` is present, preserve its approved hashes, selected
profiles, contract/target paths, and offline/live evidence status. Load only the
applicable `_refs/ai-agent/**` contracts. Review trust and tenant derivation,
server-side authorization, business-shaped tool boundaries, mutation approval,
idempotency/resource versions, session isolation, provider storage governance,
evidence provenance/freshness, trace/audit redaction, budgets/limits,
deterministic security gates, dependency/runtime ownership, and honest live
claims. Treat any silent weakening of the common floor as a blocking
security-policy finding and `user-decision`, not an automatic style repair.

## Simplification review

When `simplify_context` is present, preserve it and review the selected
files/hunks against the recorded baseline and preserved surfaces. Check for
scope expansion, protected file or protected content changes, public-contract
drift, string/prompt changes, framework metadata changes, auth/tenant/permission
drift, side-effect or ordering drift, over-simplification, stale test evidence,
and dependency/config churn.

Treat missing post-change verification, changed protected literals, an
unreverted failed pass, or `behavior_verification: not-verified` as blocking.
Review remains read-only and does not widen the simplification scope.

## Rules

### MUST DO
- Classify `track_profile` before loading refs.
- Load only applicable refs and record `refs_loaded`/`refs_skipped`.
- Preserve the full `review_context` for its consumer without echoing redundant
  metadata in every user report.
- Preserve requested dimensions and mode.
- Keep direct review strict read-only by default.
- Redact secrets and avoid commands that expose secret values.
- Use package-manager/script/tool discovery for probes.
- Mark backend-only accessibility as N/A unless explicitly scoped.
- Distinguish real bugs from style preferences.
- When frontend architecture comparison is active, load
  `_refs/shared/frontend-architecture.md` and compare implementation against the
  selected approved architecture plan when one exists.

### MUST NOT
- Edit files.
- Silently write `.sdcorejs` artifacts from direct review.
- Write under `.sdcorejs/conventions/**`, treat a finding as write authorization,
  promote an observed pattern to an accepted rule, or widen a narrow dimension.
- Auto-run repair-loop from direct review.
- Apply SDCoreJS/Core UI/NestJS/build-website conventions to plain profiles.
- Invent missing dependencies, package managers, scripts, tools, source roots,
  or monorepo layouts.
- Download probe tools without explicit approval.
- Print or persist secrets.
- Duplicate findings across dimensions.

## Cross-references
- General fallback: `_refs/shared/review-code.md`
- Shared baselines: `_refs/shared/review-{architecture,security,performance,accessibility,consistency}.md`, `_refs/shared/convention-context.md`
- Angular Core UI refs: `_refs/angular/review-{code,security,performance,accessibility}.md`
- NestJS SDCoreJS refs: `_refs/nestjs/review-{code,security,performance}.md`
- Next.js build-website refs: `_refs/nextjs/build-website/review-{code,security,performance,accessibility}.md`
- Repair loop: `sdcorejs-repair-loop`
- Single-bug root cause: `sdcorejs-debug`
- Verification: `sdcorejs-ship (verify-before-done mode)`
