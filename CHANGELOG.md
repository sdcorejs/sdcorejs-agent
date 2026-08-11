# Changelog

All notable changes to this repository should be documented here.

This project uses GitHub tags/releases for adopted versions. The private root
Node workspace is not distributed through npm.

## Unreleased

- Make the Visual Companion live runtime reachable from the workflow. Add
  `_refs/sdlc/visual-companion/cli.mjs` with a machine-readable JSON contract,
  stable result/error codes, non-zero failure exits, and deterministic session
  path resolution, plus a shell-free cross-platform browser launcher.
- Give visual and non-visual decisions separate priority ladders so a spatial
  question is no longer shadowed by a native structured choice, and keep every
  approval on a non-visual surface.
- Add the `visual.session.start`, `visual.session.publish`,
  `visual.session.read`, and `visual.session.stop` semantic actions and the
  `live_visual_companion`, `visual_event_bridge`, `persistent_local_process`,
  and `browser_auto_open` capabilities across the capability contract, the four
  adapters, and the five generated harness manifests.
- Gate a live session on explicit consent through
  `local_runtime_writes_allowed_after_consent`, with browser auto-open as a
  second, separate consent. Capability alone is never permission.
- Classify `.sdcorejs/tmp/**`, including every Visual Companion session
  directory, as `local_only` by explicit rule rather than by an incidental
  ignore pattern.
- Migrate the static visual composer onto the single screen model in
  `_refs/sdlc/visual-companion/screen.mjs`, removing the duplicated schema and
  message bundle and raising option cardinality from 2-3 to 2-4 with optional
  renderable previews.
- Rewrite the brainstorming visual section and `_refs/sdlc/visual-companion.md`
  as an executable session contract and remove the two now-false prohibitions
  against a local server and event bridge.
- Add `npm run test:e2e:visual-companion` covering protocol, screen model,
  rendering, RFC 6455 framing, server security, event lifecycle, the command
  line, and process lifecycle.
- Resolve `bash -n` from an explicit override, `SHELL`, the well-known paths,
  and finally `PATH`, so `check:executable-references` also runs against a
  user-scoped Git installation.

## 0.8.0

- Add `sdcorejs-architecture` as the twenty-second public skill and a
  conditional approval gate for cross-repository, public-contract, security,
  data-ownership, and other architecture-significant changes. Small cohesive
  work keeps a concrete not-applicable bypass instead of paying a universal gate.
- Add executable architecture applicability, ownership, immutable
  spec-to-architecture-to-plan lineage, module-owner, and conformance contracts.
- Add canonical `A-*`, `D-*`, `R-*`, `AC-*`, and `INV-*` decision coverage plus
  a fail-closed goal-backward plan checker for task/path/evidence omissions.
- Add the shared validation map: planning owns the map, test emits its exact
  projection and current evidence IDs, and ship rejects unrelated, stale,
  deferred, or incomplete proof. Decision boundaries are bound to a verified
  approved-artifact body/hash so row-and-authority co-mutation fails closed.
- Add delivery convergence across approved intent, artifacts, executed
  task/path/symbol trace, validation, review conformance, ledgers, toolchain,
  source/module revisions, and artifact closure. Branch-ready and Git reject a
  missing, blocked, deferred, stale, vacuous, unreceipted, or source/plan-
  mismatched compact result; Git derives identity from repository topology and
  approved plans.
- Extend `sdcorejs-repair-loop` with external-review feedback verification,
  classification, evidence-backed pushback, migration protection, explicit
  tier-specific approval artifacts, intersected scopes, hash-bound change and
  evidence manifests, test-integrity comparison, and exact reverification.
- Add internal-only `sdcorejs-skill-authoring` under `authoring/**`, with a
  deterministic pressure harness, public-surface ceiling checks, honest
  telemetry, linked RED/GREEN/REFACTOR records, recursive distribution/provider
  scans, and a structured live matrix that remains `NOT RUN` without explicit
  authorization. It is not distributed or listed as a public skill.
- Keep conventions as an `sdcorejs-explore` action lifecycle rather than a new
  public skill; observed conventions remain advisory until separately accepted.
- Synchronize active repository, plugin, site, and inventory metadata at
  `0.8.0` and 22 public skills. Historical release evidence retains its
  historical counts.
- No tag, GitHub Release, npm publication, push, or pull request has occurred
  for `0.8.0`; the root workspace remains private and validation-only.

## 0.7.0

- **Breaking:** make track/profile, artifact identity, approval hash,
  repository ownership, and evidence identity executable shared contracts
  across all 21 skills.
- Add deterministic approved-artifact creation/verification with canonical
  SHA-256 hashing, protected metadata, mutation rejection, and cross-repository
  parent references.
- Make portal/module ownership semantic and repository-local across planning,
  execution, documentation, design handoff, testing, review, repair, simplify,
  Git closure, and ship readiness.
- Replace generated NestJS deny-all production authentication with tested
  OIDC/JWKS signature verification and adversarial token coverage.
- Validate executable/copy-ready Angular and Next.js references by language,
  and add generated Angular, NestJS, and Next.js production golden projects.
- Make Angular technical prototypes and admin/auth/account/role/permission
  surfaces explicit opt-ins; make Next.js i18n/contact/advanced SEO profile
  features approval-dependent.
- Add repository-local Git closure for concurrent worktrees, nested
  repositories, submodules, approved gitlinks, stale evidence, secrets, and
  durable `.sdcorejs/**` artifacts without singleton session state.
- Add a release-readiness evaluator that separates ship, commit, push, PR,
  release, and actual publication states and rejects stale/incomplete evidence.
- Synchronize repository/plugin/site metadata at `0.7.0`; no tag, publication,
  push, pull request, or GitHub Release is created by this change.
- Keep the root Node workspace private and validation-only; npm publication,
  `npx`, and the removed standalone entrypoint remain retired.
- Add provider-neutral semantic actions, tri-state adapter capabilities, hashed
  generated harness manifests, and native-interaction fallbacks for Codex,
  Claude Code, Cursor, and GitHub Copilot.
- Make direct Q&A and bounded fast-fix operational while retaining the full
  approval/verification/finish workflow for ambiguous or high-risk work.
- Auto-select sequential execution when there is no real parallel choice.
- Add role/model-tier delegation policy, bounded runtime task briefs/review
  packages, original-owner repair rounds, and deterministic fan-in rules.
- Add behavioral sentinel simulations and summary entrypoint
  deletion/rename mutation coverage.
- Add a closed-schema, escaped, accessible static visual composer with
  keyboard/copy interaction, restrictive CSP, and full Markdown fallback; a
  local server/event bridge remains out of scope, and the orphaned raw-HTML
  visual fragments are retired.
- Reduce repeated orchestration context through a just-in-time runtime protocol
  router while preserving artifact lifecycle and verification contracts.
- Add the Communication Economy Policy with `compact`, `standard`, and
  automatically escalated `detailed` projections while retaining complete
  professional prose and exact commands, paths, identifiers, hashes, errors,
  numbers, and verification evidence.
- Separate authoritative runtime context, user projection, and portable
  handoff; add provider-neutral `context.pass` and tri-state
  `runtime_context_channel` contracts with fail-closed consumer field coverage.
- Make progress event-driven, remove duplicated final progress summaries, and
  replace recency-based spec-style loading with deterministic relationship-based
  artifact selection.
- Add deterministic Communication Economy Policy scenarios and context-budget
  reporting bound to baseline schema surfaces; audit rendered semantic coverage,
  typed test/parallel handoffs, nested-body rejection, and numbered approval
  choices. The default report keeps unavailable telemetry explicit, while an
  opt-in report validates sanitized Codex/Claude live A/B evidence without
  invoking a provider. Token metrics remain evidence rather than a marketing
  claim.
- Reject artifact, diff, durable-context, and log bodies disguised inside
  portable string fields or user projections, and count both supported native
  context transfers and portable fallbacks in deterministic communication
  totals.
- Add Documentation Layout v2 with one directory per document, unit-local
  assets, canonical-first transitional discovery, conflict-aware idempotent
  migration, exact aggregate discovery/link rewriting, safe Pandoc argument
  plans, UI-evidence containment, lifecycle closure, and conditional
  single-pass aggregate rebuilds.

## 0.6.0

- **Breaking:** permanently remove the standalone skills
  `sdcorejs-auth`, `sdcorejs-dockerize`, `sdcorejs-run-guide`, and
  `sdcorejs-solution-builder` from canonical sources and every generated
  distribution.
- Recenter dispatch, documentation, and examples on developers and technical
  teams using the core engineering lifecycle and direct technical-track
  executors.
- Keep shared Angular/NestJS authentication, authorization, security, and
  container-test contracts while removing the obsolete standalone packaging
  templates.
- Update routing fixtures, catalogs, mirrors, validation expectations, and
  version metadata for the 21-skill public surface.

- Add `sdcorejs-simplify` as a first-class workflow utility for bounded
  current-diff or explicit executable-source analysis/refinement with preserved
  behavior, protected strings/prompts/config/contracts, green baseline and
  post-change verification, runtime-only `simplify_context`, and no Git or
  dependency mutation.
- Add visible opt-in simplification to the four-step finish gate between the
  test baseline and review, rerun affected focused tests after writes, and pass
  freshness evidence through test, review, repair, debug, ship, and Git owners.
- Add narrow deterministic routing, localized input fixtures, mutation guards,
  synchronized mirrors, and public catalog/adoption guidance.
- Add the first-class `sdcorejs-ai-agent` track with two independent lifecycle
  engines, twelve business capability profiles, application-owned trust/tool/
  approval/state/evidence/tracing/usage contracts, offline validation, golden
  and adversarial fixtures, and no bundled provider runtime or dependency.
- Route confirmed AI-agent architecture through the approved spec/plan flow
  while returning under-specified agent ideas to brainstorming and preserving
  test, review, debug, documentation, ship, and Git ownership.
- Publish the AI-agent boundary across entrypoints, adoption guidance, the
  public skill catalog, deterministic repository checks, and generated mirrors;
  report live provider verification separately from offline evidence.
- Complete the governed frontend architecture contract from planning through
  execution and review, including project-convention discovery, explicit
  component/state/service/provider/public-API decisions, and design handoff.
- Treat Angular list/detail pages as routed minimum boundaries rather than a
  fixed two-component model; support responsibility-derived feature-local
  components, conditional collaborators and `base-select`, private feature
  exports, and justified shared/Core UI reuse while preserving cohesive simple
  screens.
- Preserve feature-local one-off interactive Next.js components and minimal
  Client Component islands, remove the remaining fixed list/detail wording,
  strengthen scoped negative/positive mutation regressions, and add honest
  cross-tool live-agent validation scenarios.

## 0.5.1

- Add generated mirror ownership policy and pull request validation checklist.
- Add a 5-minute adoption path and release evidence status to clarify first-run
  expectations.
- Add release metadata guidance for positioning the project as a portable SDLC
  skill pack rather than a standalone runtime coding agent.
- Keep live `.sdcorejs/tasks/current-session.md` checkpoints out of committed
  source history.
- Require release validation evidence for Claude Code, Codex, Cursor, and
  GitHub Copilot before claiming full live-agent coverage.
- Add hidden/control/bidi Unicode scanner and wire it into npm scripts, CI,
  Full E2E, lefthook, and regression tests.
- Fix Full E2E Windows command execution by running `.cmd`/`.bat` shims through
  a shell while preserving direct execution for real binaries.
- Document validation tiers, including the boundary between deterministic tests,
  Full E2E, and real-agent transcript evidence.
- Add adoption guidance, compatibility evidence expectations, fast-fix rules,
  a worked example, troubleshooting, real-agent validation template, and release
  process checklist.
- Expand security guidance with trust boundaries and safe mode policy.
- Align package metadata and lockfile on npm as the canonical package manager.
- Add CI for skill validation, E2E tests, and Windows PowerShell sync checks.
- Add scheduled/manual full golden target-app E2E coverage.
- Harden skill sync validation for frontmatter shape, duplicate names,
  unsupported metadata, exact `_refs` references, and stale mirrors.
- Remove global response-style injection from generated Claude/plugin mirrors.
- Clarify English-only source policy and localization fixture carve-out.
- Add security guidance for prompt injection, secret handling, command
  execution, generated mirrors, and sandboxing expectations.

## 0.5.0

- Current public skill-pack baseline for Angular, NestJS, Next.js, product,
  design, test, documentation, review, repair, ship, git, Docker/auth/run-guide,
  and solution-builder workflows.
