# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-07-29

## Current Layout

- `skills/**/*.md` - 21 dispatchable source skills.
- `_refs/**` - reference data loaded on demand.
- `.claude/skills/<name>/SKILL.md` - generated Claude Code mirror.
- `plugin/skills/<name>/SKILL.md` - generated Claude plugin mirror.
- `codex/skills/<name>/SKILL.md` - generated Codex-native mirror.
- `codex/skills/_refs/**` - shared Codex reference mirror.
- `.cursor/rules/sdcorejs-agent.mdc` - generated Cursor rule from `AGENTS.md`.
- `_refs/harness/**` - canonical semantic actions, tri-state capabilities,
  model/role policy, runtime envelopes, and deterministic sentinel policy.
- `*/sdcorejs-harness.json` - generated adapter mappings with canonical content
  hash and 21-skill action declarations.

## Inventory

| Bucket | Count |
|---|---:|
| Source skills | 21 |
| Claude Code mirror skills | 21 |
| Plugin mirror skills | 21 |
| Codex mirror skills | 21 |

## Workflow Inventory

| Area | Skills |
|---|---|
| Discovery | `sdcorejs-brainstorming` |
| Spec gate | `sdcorejs-spec` |
| Plan gate | `sdcorejs-plan` |
| Execution gate | `sdcorejs-execute-plan` |
| AI-agent executor | `sdcorejs-ai-agent` |
| App executors | `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs` |
| Product executor | `sdcorejs-product` |
| Design executor | `sdcorejs-design` |
| Test executor | `sdcorejs-test` |
| Documentation executor | `sdcorejs-documentation` |
| Simplification utility | `sdcorejs-simplify` |
| Parallel | `sdcorejs-parallel-dispatch` |
| Finish | `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)` when durable knowledge surfaced |

## Documentation Layout v2 validation

The canonical just-in-time contract is
`_refs/shared/documentation-layout.md`; its executable behavior lives in the
dependency-free ESM helper `_refs/shared/documentation-layout.mjs`.

```bash
npm run test:e2e:documentation-layout
node --test test/e2e/test-track-contract.test.mjs
node --test test/e2e/project-context-artifact-lifecycle.test.mjs
node --test test/e2e/skill-pack-runner.test.mjs
```

These deterministic checks cover canonical and transitional discovery, safe and
idempotent migration planning/application, aggregate link rewriting, UI-capture
containment, lifecycle closure, export argument/capability reporting, JIT
loading, and mirror integration. They do not prove that Pandoc, a PDF engine,
an authenticated browser, or a live provider runtime is available; those
capabilities remain separately reported as passed, failed, blocked, or skipped.

## Product and Design `.sdcorejs` artifact layout validation

Canonical roots come from `artifact_roots` in
`_refs/shared/system-registry.json` and are resolved through
`_refs/shared/artifact-paths.mjs`. Contracts live in
`_refs/shared/product-ledger.md` and `_refs/shared/design-handoff.md`.

```bash
node --test test/e2e/artifact-path-convention.test.mjs
node --test test/e2e/product-ledger-contract.test.mjs
node --test test/e2e/design-handoff-contract.test.mjs
node --test test/e2e/project-context-artifact-lifecycle.test.mjs
npm run check:skills
```

These deterministic checks cover canonical resolver output, ledger root
stability, legacy-root rejection in new metadata, canonical-first reads with an
explicit legacy fallback, scoped legacy migration, canonical/legacy equivalence
and conflict handling, lifecycle classification of `.sdcorejs/product/**` and
`.sdcorejs/design/**`, binary-safe durable PNG closure, downstream consumer
paths, and mirror synchronization. They do not prove that a browser renderer,
image-generation tool, or live provider runtime is available; those capabilities
remain separately reported.

## Communication Economy Policy evidence - 2026-07-28 PR #55 snapshot

The Communication Economy Policy is a just-in-time reference plus deterministic
runtime policy. It separates authoritative runtime context, user projection,
and portable handoff; resolves `compact`, `standard`, or `detailed`; escalates
approval, security, destructive, ambiguous, failed, and blocked states; and
keeps exact technical evidence unchanged.

`npm run report:communication-economy` measures sanitized contract fixtures, not
live model telemetry. It reads baseline schema surfaces directly from commit
`ec6afdb4e2494416d985be610837e728a9278a2f` with `git show` and combines them
with sanitized scenario projections. The visible-output baseline is therefore
a reproducible source-bound contract projection, not a captured agent
transcript. The current report is tied to that source HEAD plus the uncommitted
working-tree diff:

| Measure | Baseline | Current working tree |
|---|---:|---:|
| Always-loaded bootstrap UTF-8 bytes | 20,173 | 18,694 |
| Always-loaded bootstrap words | 2,361 | 2,242 |
| Aggregate just-in-time scenario bytes | 514,603 | 604,568 |
| Aggregate visible output bytes | 42,558 | 2,802 |
| Aggregate visible output words | 3,961 | 337 |
| Portable fallback handoff bytes | 0 | 22,240 |
| Supported runtime context channel bytes | 0 | 1,205 |
| Repeated-block bytes | 2,319 | 0 |
| Total measured communication bytes | 577,334 | 649,509 |
| Consumer-required authoritative fields | 288 | 288 preserved |

The report includes ten scenarios, per-scenario selected paths, bytes, words,
handoff mode, profile, rendered semantic coverage, cross-profile outcome/status
parity, and required-field coverage. The just-in-time aggregate increases
because delegated and review/repair/ship scenarios now explicitly load and
validate test lifecycle/evidence and parallel ownership/fan-in contracts rather
than omitting authoritative safety state, and because the Product and Design
contracts now carry the canonical `.sdcorejs` artifact layout, legacy
compatibility matrix, and binary-safe closure rules, and because the Visual
Companion contract is now an executable session lifecycle rather than a
one-page surface note. The current total counts serialized
authoritative context for `supported` channels and the serialized portable
fallback for `unsupported` and `unknown` channels, so each typed handoff is
counted exactly once. The baseline already counts its echoed context inside
visible output. The current source-bound total is higher because the audited
parallel dispatch envelope now preserves repository/module identity and write
authority; visible output and repeated blocks remain lower. No required field
was removed to improve a metric, and this comparison does not establish broad
token or cost reduction. The report does not estimate token count because this
private workspace has no tokenizer dependency. Metrics are evidence, not a
marketing claim.

The default report still marks `live_ab_eval` as `skipped` because deterministic
validation must not invoke a credentialed provider. The separately authorized
command `npm run report:communication-economy:live` validates the sanitized
fixture
`test/e2e/fixtures/communication-economy-live-ab.json` and reports the observed
Codex and Claude A/B smoke evidence without rerunning either provider.

### Trusted live A/B smoke - 2026-07-29

The same read-only pure-Q&A scenario ran baseline first and current second
through Codex CLI `0.132.0` and Claude Code `2.1.163`. A used
`ec6afdb4e2494416d985be610837e728a9278a2f`; B used HEAD
`845b5ecd6fab11adaf4ea3ba6b54c016f98f95b8` with associated dirty-diff
fingerprint
`84da59a5042c03041060884072cdb998733a3c51c20bd32a3b2e82c6238ec4b8`.
Every run returned exit `0` and preserved the repository-purpose, public
21-skill count, and exact `npm run check:skills` outcome.

| Provider / effort | Derived total tokens A -> B | Output tokens A -> B | Visible bytes A -> B | Observed delta boundary |
|---|---:|---:|---:|---|
| Codex `gpt-5.5` / `medium` | 398,963 -> 166,708 | 3,482 -> 1,506 | 1,332 -> 702 | Total `-58.21%`; visible `-47.30%` |
| Codex `gpt-5.5` / `high` | 517,483 -> 387,418 | 4,172 -> 3,951 | 1,426 -> 911 | Total `-25.13%`; visible `-36.12%` |
| Claude `sonnet` / `medium` | 36,351 -> 36,512 | 1,770 -> 837 | 1,987 -> 1,801 | Total `+0.44%`; visible `-9.36%` |
| Claude `sonnet` / `high` | 64,260 -> 45,365 | 1,095 -> 820 | 2,043 -> 2,030 | Total `-29.40%`; visible `-0.64%` |

Codex totals are provider input plus output tokens. Claude totals are direct
input plus cache-creation input, cache-read input, and output tokens. These
accounting models are not cross-provider comparable. Provider caches were not
reset, the execution order was not counterbalanced, and B also contains the
in-progress Documentation Layout v2 diff. This one scenario is a live smoke,
not the ten-scenario deterministic matrix or full release-agent coverage.
Observed deltas are evidence for these runs, not a fixed savings claim.

## Visual Companion live runtime evidence - 2026-08-07 working tree

Evidence target: the live companion runtime became reachable from the workflow
instead of remaining working code with no caller.

What the deterministic suite proves:

- `npm run test:e2e:visual-companion` covers eight categories: protocol identity
  and redaction, the single screen model, rendering with the CSP hash matching
  the served client bytes, RFC 6455 framing, server authentication and
  filesystem containment, event identity, the command-line contract, and process
  lifecycle including the idle watchdog and the browser launcher.
- `npm run test:e2e:harness` proves visual and non-visual decisions now run on
  separate priority ladders, that an approval never reaches a visual surface,
  that a live session needs both capability and explicit consent, and that every
  adapter maps the four `visual.session.*` actions to a capability and a
  portable fallback.
- `npm run test:e2e:artifact-paths` proves `.sdcorejs/tmp/visual-companion/**`
  is `local_only` by explicit rule and cannot be staged even when a runtime
  context wrongly declares a session file required.

What it does not prove: no browser rendered a screen, no user clicked an option,
and no platform browser launcher was executed. The launcher test injects a
recording spawn function and asserts the argument vector and the absence of a
shell; it never starts a browser. Live browser behaviour remains separately
reported.

Runtime facts recorded for review: zero runtime dependencies, Node 18+
built-ins only, loopback bind by default, at least 256 bits of session entropy,
and an event `authority` field the server assigns and the read path asserts.

## Retired standalone skills removal evidence - 2026-07-27

Evidence target:

- Base: `main` at
  `0a8653fa34ea3a2099da7cda34cff7cd40477b0a`, matching `origin/main`
  before the refactor.
- State: pre-commit final diff for permanent removal of four standalone skills and their
  exclusive infrastructure references, with core workflow, mirrors, routing,
  public documentation, site catalog, version metadata, and regression tests
  updated.
- Inventory moved from 25 canonical skills to 21, with 21 skills in every
  generated distribution.
- Version moved from root `0.5.1` and drifted distribution metadata to
  synchronized `0.6.0`.
- These are local pre-commit command results. Git/PR handoff and remote CI are
  not validation evidence.

### Commands and observed results

| Command | Exit | Result and relevant observation |
|---|---:|---|
| `npm run clean:skills` | 0 | Removed 12 stale generated skill directories across Claude, plugin, and Codex mirrors; regenerated all committed distributions at 21 skills. |
| `node --test test/e2e/ai-agent-track-contract.test.mjs test/e2e/simplify-skill-contract.test.mjs test/e2e/skill-pack-runner.test.mjs test/e2e/test-track-contract.test.mjs` | 0 | Focused post-repair routing and contract run passed 86/86 tests. |
| `npm run check:skills` | 0 | Node checker reported 21 skills plus refs and Cursor in sync. |
| `npm run check:skills:ps` | 0 | PowerShell checker reported the same 21-skill/ref/Cursor parity. |
| `PYTHONUTF8=1 python <skill-creator>/scripts/quick_validate.py <skill-dir>` across Claude, plugin, and Codex skill directories | 0 | The host `skill-creator` validator passed all 63 generated skill packages. UTF-8 mode avoids the Windows default code-page limitation for valid Unicode source. |
| `npm run check:text-hygiene` | 0 | 876 text files passed hidden/control/bidi and reusable-source language checks after the review repair. |
| `npm run check:nestjs-pack` | 0 | Canonical NestJS pack validation passed, including retained shared auth/security contracts. |
| `npm run test:e2e` | 0 | Repository 135/135; NestJS 24 passed with one intentional Linux-only skip on Windows; generated simple and enterprise golden projects 2/2. |
| `npm run test:e2e:phase1` | 0 | Post-review repair run passed 32/32 skill, mirror, text, and routing invariants. |
| `npm run build:site` | 0 | Astro built both static pages successfully with the 21-skill, eight-track catalog. |
| `npm run check:audit` | 0 | Root production dependency audit found 0 vulnerabilities. |
| `npm run check:site:audit` | 0 | Site production dependency audit found 0 vulnerabilities. |
| `docker version --format '{{json .Server.Version}}'` | 1 | Docker Desktop Linux engine pipe was unavailable; `npm run test:e2e:nestjs:containers` is therefore `SKIPPED - Docker unavailable`. |

### Evidence boundaries

- The Linux-only case-sensitive path regression is intentionally skipped by
  the NestJS suite on Windows; it is reported as a skip, not a pass.
- Container E2E is not claimed because the Docker daemon is unavailable in
  this environment.
- The repository exposes no root or site `lint` or `typecheck` script.
  Existing TypeScript compilation is exercised by the generated NestJS golden
  builds; standalone lint/typecheck are `SKIPPED - no repository script`.
- Shared Keycloak/JWT/JWKS/RBAC/permission guidance, authenticated test
  contracts, container-based golden fixtures, and contributor install/test/
  generator instructions remain in their existing technical owners.
- Active skills, routing, mirrors, catalogs, and public documentation have zero
  retired-surface residue. Approved historical spec/plan snapshots retain their
  original hashes and wording as immutable audit records.
- No dependency graph, package manager, environment, migration, tag, publish,
  or release action was changed or run during validation.

## Simplify workflow utility evidence - 2026-07-27 working tree

Evidence target:

- Branch and current HEAD: `main` at
  `c8fdf152e87153d8a0dd64921a66df5b8d6ea933`, matching `origin/main`.
- State: uncommitted `sdcorejs-simplify` workflow utility, four-step finish
  gate, routing and downstream evidence integration, deterministic tests,
  generated mirrors, public docs, and change-scoped spec/plan artifacts.
- Inventory moved from the clean 24-skill baseline to 25 canonical and 25
  skills in each generated distribution.
- This is local dirty-diff evidence, not a commit, CI result, release, live
  model/tool compatibility claim, or arbitrary semantic-equivalence proof.

### Commands and observed results

| Command | Exit | Result and relevant observation |
|---|---:|---|
| `node --test test/e2e/simplify-skill-contract.test.mjs` (RED baseline) | 1 | 1/12 passed and 11/12 failed because the skill, refs, routing, finish integration, and mirrors did not exist yet. |
| `node --test test/e2e/simplify-skill-contract.test.mjs` (implemented contract) | 0 | 12/12 canonical, scope/protection, stack, verification, finish, routing, mutation, mirror, and dependency-boundary tests passed. |
| `node --test test/e2e/skill-pack-runner.test.mjs` | 0 | 31/31 repository skill, source-language, routing, and finish invariants passed after repairing two exact contract assertions. |
| `node --test test/e2e/entrypoint-smoke.test.mjs` | 0 | 6/6 Codex, Claude, Copilot, and Cursor entrypoint checks passed. |
| `npm run sync:skills` | 0 | Mirrored 25 skills, the complete `_refs` tree, and the Cursor rule. |
| `npm run check:text-hygiene` | 0 | 915 text files passed hidden/control/bidi and reusable-source language checks. |
| `npm run check:skills` and `npm run check:skills:ps` | 0 | Node and PowerShell checkers reported 25 skills plus refs and Cursor in sync. |
| `quick_validate.py codex/skills/sdcorejs-simplify` and `quick_validate.py plugin/skills/sdcorejs-simplify` | 0 | Both generated skill packages passed the host `skill-creator` validator. |
| `npm run test:e2e:repository` | 0 | 134/134 repository tests passed. |
| `npm run check:nestjs-pack` | 0 | Canonical NestJS pack validation passed. |
| `npm run test:e2e` | 0 | Repository 134/134; NestJS 24 passed with one intentional Linux-only skip on Windows; generated simple and enterprise golden projects 2/2. |
| `npm run build:site` | 0 | Astro built both static pages successfully. |
| `npm run check:audit` and `npm run check:site:audit` | 0 | Root and site production dependency audits each found 0 vulnerabilities. |
| `node _refs/shared/artifact-lifecycle.mjs --root . --change-ref sdcorejs-simplify-20260727 --owner sdcorejs-plan --mode commit` (review pre-repair) | 1 | Correctly reported `ambiguous` because the two draft execution docs lacked lifecycle frontmatter. |
| Same artifact closure command after the scoped metadata repair | 0 | All four spec/plan artifacts are `required_with_change`; closure is `complete` with no unknown, missing, invalid, or sensitive paths. |

### Evidence boundaries

- Container E2E was not run because this workflow/docs/routing change does not
  modify generated container behavior; the existing NestJS build and golden
  suites are the applicable generated-project evidence.
- No live model, paid evaluation, credentialed external tool, or provider
  compatibility check was run. Deterministic routing/contract tests are the
  applicable offline evidence.
- No package version, dependency, package manager, lockfile, environment,
  migration, Git history, tag, publish, or release action was changed or run.

## First-class AI-agent track evidence - 2026-07-26 working tree

Evidence target:

- Branch: `agent/first-class-ai-agent-track`.
- Base and current HEAD: `5b6028a47ff1f9ab4efb9ae8b7ca06a27a65a352`.
- State: uncommitted first-class `sdcorejs-ai-agent` track implementation,
  generated mirrors, deterministic fixtures, routing integration, public docs,
  approved workflow artifacts, and review-driven validator hardening.
- This is dirty-diff evidence, not a release, commit, CI, or live-provider
  compatibility claim.

### Commands and observed results

| Command | Exit | Result and relevant observation |
|---|---:|---|
| `node --test test/e2e/ai-agent-track-contract.test.mjs` (review-repair run) | 1 | 7/8 passed; one terminology assertion exposed `approval suspension/resume` instead of the normalized `approval resume` contract. |
| `node --test test/e2e/ai-agent-track-contract.test.mjs` (after repair) | 0 | 8/8 contract, registry, validator, workflow propagation, mutation-guard, and package-boundary tests passed. |
| `node --test test/e2e/ai-agent-track-contract.test.mjs test/e2e/skill-pack-runner.test.mjs test/e2e/entrypoint-smoke.test.mjs` (first repair run) | 1 | 42/44 passed; the new approved-engine-plan fixture exposed routing to `sdcorejs-plan` instead of `sdcorejs-execute-plan`. |
| Same focused routing command (second repair run) | 1 | 42/44 passed; the English continuation was fixed, but a localized plan-authoring fixture regressed. |
| Same focused routing command (final repair run) | 0 | 44/44 passed, including approved-plan implementation and localized plan-authoring/plan-execution boundaries. |
| `node --test test/e2e/ai-agent-track-contract.test.mjs` (validator review repair) | 0 | 8/8 passed after adding fail-closed identity, objective, tool-permission, evidence-policy, and bounded-retry validation; all four golden contracts and at least 27 invalid cases passed. |
| `npm run test:e2e:phase1` (post-review repair) | 0 | 31/31 deterministic skill, policy, localization, hygiene, and routing contract tests passed. |
| `npm run test:e2e:phase3` (post-review repair) | 0 | 5/5 entrypoint and AI-agent boundary tests passed. |
| `npm run sync:skills` | 0 | Mirrored all 24 skills, the full `_refs` tree, and the Cursor rule into their generated distribution targets. |
| `npm run check:text-hygiene` | 0 | 894 text files scanned successfully. |
| `npm run check:skills` | 0 | Node checker reported 24 skills plus refs and the Cursor rule in sync. |
| `npm run check:skills:ps` | 0 | PowerShell checker reported the same 24-skill/ref/Cursor parity. |
| `npm run check:nestjs-pack` | 0 | Canonical NestJS pack validation passed. |
| `npm run test:e2e` (short caller timeout) | 124 | The caller closed the output pipe before TAP completion, producing `EPIPE`; this is not a test pass or assertion failure. |
| `npm run test:e2e:nestjs:golden` (post-review first extended attempt) | 1 | The simple project passed; the enterprise case reached its 300-second test timeout without an assertion/build failure. A targeted enterprise retry passed 1/1 in about 94 seconds. |
| `npm run test:e2e` (post-review extended aggregate) | 0 | Repository 121/121; NestJS 24 passed with one intentional Linux-only skip on Windows; generated simple and enterprise golden projects 2/2. |
| `npm run build:site` | 0 | Astro built both static pages successfully. |
| `npm run check:audit` | 0 | Root production dependency audit found 0 vulnerabilities. |
| `npm run check:site:audit` | 0 | Site production dependency audit found 0 vulnerabilities. |
| `quick_validate.py codex/skills/sdcorejs-ai-agent` and `quick_validate.py plugin/skills/sdcorejs-ai-agent` | 0 | Both generated skill packages passed the host `skill-creator` validator. |

### Evidence boundaries

- The AI-agent validator and fixtures are offline, deterministic, and use Node
  standard-library modules only. They validate contracts and fail-closed
  boundaries, including typed identity/status/objective fields and non-empty
  business-tool permissions/evidence/retry policy; they do not call a provider.
- No live OpenAI Responses API or Agents SDK run was authorized or performed.
  Credential selection, model availability, provider compatibility, live
  streaming/tool behavior, billing, and provider-side retention therefore
  remain external verification items.
- Full target-app phase 4 and real NestJS container checks were not run in this
  change. The configured aggregate did run both generated NestJS golden
  projects.
- `package.json` changed only to add the AI-agent contract test to the existing
  repository E2E command. No dependency entry, package manager, root
  `package-lock.json`, or `site/package-lock.json` changed.
- No separate product ledger, user guide, durable backlog, or memory artifact
  was required: this is a skill-pack capability addition documented by the
  approved spec/plan, public adoption/validation docs, and repository summary.
- Final handoff must report the diff-sensitive verification rerun after this
  evidence section was written. That rerun does not convert missing live
  provider or opt-in environment evidence into a pass.

## Frontend architecture close-out evidence - 2026-07-13 working tree

Evidence target:

- Branch: `main`.
- Base HEAD: `1e179fa67bd12d78c15bd091ed53f03889788b77`.
- State: uncommitted frontend architecture close-out working tree, including
  canonical Angular source, generated mirrors, deterministic regressions,
  release/adoption docs, and approved workflow artifacts.
- This is dirty-diff evidence, not a release or committed-CI claim.

### Commands and observed results

| Command | Exit | Result and relevant observation |
|---|---:|---|
| `npm ci` | 1 | Dependency files were installed, but the `prepare` lifecycle failed when Lefthook tried to rename `C:\ProgramData\git-secrets\hooks\pre-commit`; the machine-level `core.hooksPath` is not writable by this session. |
| `npm ci --ignore-scripts` | 0 | Lockfile dependency graph installed successfully: 3 packages added, 4 audited, 0 vulnerabilities. This fallback deliberately skipped the failing external hook install. |
| `npm run sync:skills` | 0 | Regenerated 23 skills plus `.claude`, plugin, Codex `_refs`, and Cursor distribution mirrors from canonical sources. |
| `npm run check:skills` | 0 | Node mirror checker reported all skill/ref/Cursor targets in sync. |
| `npm run check:skills:ps` | 0 | Windows PowerShell mirror checker reported all skill/ref/Cursor targets in sync. |
| `git diff --check` | 0 | No whitespace error in the pre-evidence implementation diff. |
| `npm run check:text-hygiene` | 0 | 699 tracked text files scanned successfully. |
| `npm run test:e2e:phase1` | 0 | Repeated focused runs after the regression edit, mirror sync, and evidence write passed 29/29, including scoped fixed-component negative/mutation checks. |
| `npm run test:e2e:repository` (60-second tool limit) | 124 | The first attempt was terminated by the command timeout before TAP output; this is not recorded as a test pass or test assertion failure. |
| `npm run test:e2e:repository` (extended timeout) | 0 | Rerun passed 68/68 repository tests. The full target-app case remained explicit and opt-in. |
| `npm run test:e2e` | 1 | Repository tests passed 68/68, then two NestJS generator cases failed because Windows supplied the short temp alias `C:\Users\NGHIAT~1\...` while the safety check resolved the long path. Golden tests were not reached in this attempt. |
| `$env:TEMP=Join-Path $env:LOCALAPPDATA 'Temp'; $env:TMP=$env:TEMP; npm run test:e2e:nestjs` | 0 | Long-form temp-path diagnostic passed 24 tests with one Linux-only skip, confirming the preceding failures were Windows temp-path alias handling rather than frontend changes. No NestJS source was modified. |
| `$env:TEMP=Join-Path $env:LOCALAPPDATA 'Temp'; $env:TMP=$env:TEMP; npm run test:e2e` | 0 | Both environment-compatible aggregate runs passed: repository 68/68; NestJS 24 pass plus one Linux-only skip; generated simple and enterprise golden projects 2/2. The second run occurred after this evidence section was added. |
| `npm audit --omit=dev` | 0 | 0 production dependency vulnerabilities. |

### Evidence boundaries

- Mirrors are synchronized by both supported checkers. Generated changes map
  directly to `skills/tracks/angular/sdcorejs-angular.md` and the two changed
  canonical Angular references; no mirror-only drift was observed.
- Full E2E was **not run**: no
  `SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4` execution or current GitHub
  Actions run exists for this working tree. The configured `npm run test:e2e`
  aggregate above is not a substitute for that opt-in environment.
- Live-agent frontend scenarios were **not run** on Claude Code plugin, Codex
  attached repo, Codex native skills, Cursor, or GitHub Copilot. All 15
  tool-surface/scenario pairs remain explicitly pending in
  `docs/REAL_AGENT_VALIDATION.md`. This implementation session is not counted
  as live-agent adoption evidence.
- Historical CI, Full E2E, NestJS, or live-session evidence elsewhere in this
  document does not validate the 2026-07-13 uncommitted frontend diff.
- The final handoff must report any read-only verification reruns performed
  after this evidence section was written; those reruns do not retroactively
  turn missing Full E2E or live-agent coverage into a pass.

## Validation Tiers

The project has several validation layers. Keep claims tied to the layer that
actually produced evidence.

| Tier | What it proves | Current evidence | External evidence still required |
|---|---|---|---|
| Static validation | Source layout, frontmatter, exact refs, generated mirrors, markdown fences, text hygiene, and language policy are internally consistent. | `npm run check:text-hygiene`, `npm run check:skills`, and phase 1 E2E tests. | None beyond keeping CI green for the target commit. |
| Deterministic prompt-routing validation (local canonical routing) | The canonical local runner selects the expected `sdcorejs-*` skill for fixture prompts without calling an LLM. | `test/e2e/fixtures/prompt-evals.json` plus phase 1 tests. | Add fixtures when new user intents are introduced. |
| Behavioral harness sentinel | Executable policies distinguish Q&A, fast-fix, and governed work; select real execution choices; enforce capability/model/task boundaries; mutate summary entrypoints; and render escaped static visual output. | `npm run test:e2e:harness` over parsed contracts, simulations, and mutation fixtures. | It is deterministic local evidence, not proof that a hosted model followed the policy. |
| Communication Economy Policy | Deterministic profiles, clarity escalation, context projection, shape-aware portable handoff, test/parallel state, rendered semantic parity, progress events, related-artifact selection, exact preservation, and source-bound context-budget fixtures agree. | `npm run test:e2e:communication-economy`, `npm run report:communication-economy`, and the validated Codex/Claude smoke fixture exposed by `npm run report:communication-economy:live`. | Expand live coverage beyond one pure-Q&A scenario, counterbalance run order, and keep unavailable telemetry explicit. |
| Entrypoint-aware routing validation | Each loaded Claude Code, Codex, Cursor, or Copilot profile contributes derived routing policy; mutation tests prove one changed profile can fail independently. | `test/e2e/entrypoint-smoke.test.mjs`. | This proves deterministic profile-text participation, not live runtime behavior. |
| AI-agent contract validation | Engine/profile registries, agent/tool schemas, trusted context, approval bindings, state, evidence, observability, limits, eval thresholds, and invalid mutations agree offline. | `_refs/ai-agent/validate-agent-contract.mjs` and `test/e2e/ai-agent-track-contract.test.mjs`; four golden contracts and at least 27 invalid cases. | Run separately authorized live provider checks for each claimed engine/model/tool integration; deterministic conformance is not provider compatibility. |
| Parallel protocol simulation | Selected contract, topology/DAG, path/resource, failure/fan-in, repair/evidence, and state-machine rules are exercised through the distributed deterministic validator. | `_refs/orchestration/parallel-protocol.mjs` via `test/e2e/parallel-dispatch-protocol.test.mjs`; includes synthetic boundary inputs plus real temporary Git worktree, result-commit, conflict, and rollback behavior. | This is partial local simulation. External runtimes must still invoke the validator and enforce the skill instructions, capabilities, and repository-specific commands during real sessions. |
| CLI smoke validation | Local adapter code can detect or simulate supported CLI surfaces without requiring live Claude/Codex execution. | Phase 2 tests use fake `codex` and `claude` executables. | Run real CLI smoke tests in a prepared workstation when changing install instructions. |
| Full target-app validation | The golden target-app generator can run the heavyweight E2E path in a prepared environment. | Historical evidence only: <https://github.com/sdcorejs/sdcorejs-agent/actions/runs/28798513991>. It does not validate the 2026-07-13 working tree. | Re-run for the exact release commit and attach that successful run to the release notes. |
| NestJS pack contract | The canonical manifest, profile contract, pack graph, forbidden-token scan, template renderer, route/security/runtime contract, and generator boundaries agree. | Local command `npm run check:nestjs-pack` and `npm run test:e2e:nestjs`; final branch evidence must be refreshed after the last mirror write. | Static evidence does not prove generated application behavior. |
| Generated NestJS applications | Canonical templates generate strict `simple` and `enterprise` NestJS projects; dependency installation, compilation, unit, integration, HTTP E2E, tenant isolation, and concurrency tests execute. | Local `npm run test:e2e:nestjs:golden`: both profiles passed on 2026-07-11. | Re-run on the final branch and in CI for the exact commit. |
| NestJS containers | Real Postgres accepts connections and real Keycloak imports the golden realm and accepts admin API authentication. | Local `npm run test:e2e:nestjs:containers`: Postgres 16 and Keycloak 26.1.4 passed on 2026-07-11; test project and volumes were removed. | This does not yet prove every generated repository call against Postgres or every generated Keycloak saga branch. |
| Real-agent transcript validation | Actual Claude Code, Codex attached repo, Codex native skills, Cursor, and GitHub Copilot sessions followed the intended skill-selection and approval behavior. | Not proven by deterministic tests. | Store sanitized transcript evidence for each claimed live-tool surface when validating a release. |

Do not describe deterministic prompt-routing results as live-agent behavior. The
deterministic runner is useful for regression coverage, but it is not a
substitute for real-agent transcript validation.

### NestJS hardening evidence - 2026-07-11 working tree

| Evidence | Command / result |
|---|---|
| Canonical contract, corruption scan, profile propagation, generator safety, route/security/runtime templates | `npm run test:e2e:nestjs` from the repository root -> exit 0; 24 passed and the Linux-only case-sensitive path regression was skipped on Windows |
| Generated application behavior | `npm run test:e2e:nestjs:golden` -> exit 0; strict compile and direct unit/integration/E2E/profile test processes passed for `simple` and `enterprise` |
| Evidence integrity | Golden child processes remove inherited `NODE_TEST_CONTEXT` and execute each compiled test group directly; an observed false-green was converted into a regression assertion before final evidence was accepted |
| Real containers | `npm run test:e2e:nestjs:containers` -> exit 0; Postgres accepted connections and Keycloak imported `sdcorejs-golden` and accepted admin API authentication |
| Mirrors and language | `npm run check:text-hygiene`, `npm run check:skills`, and `npm run check:skills:ps` -> exit 0 |
| Repository regression | `npm run test:e2e` -> exit 0; 64 repository tests, 24 focused NestJS tests passed with one Linux-only skip on Windows, and both golden profiles passed |
| Dependency audit | `npm audit --omit=dev` -> exit 0, 0 vulnerabilities |
| Independent forward test | A read-only Codex subagent exercised an enterprise orders request. Initial department/action/import/Keycloak gaps were repaired; re-test reported no remaining Critical/High finding. This is one-session evidence, not cross-runtime release proof. |
| Independent final review | Two review rounds found and then verified repairs for output-boundary deletion, authentication, route metadata auditing, TypeScript parsing, tenant coverage, scoped persistent import idempotency, runtime bounds, and stale mirrors. The final re-review reported no remaining evidence-backed Critical/High merge blocker. |
| Host skill validator | `quick_validate.py` was not executed successfully because the host Python environment lacks PyYAML (`ModuleNotFoundError: yaml`). No validation pass is claimed for this tier. |

The executable generator intentionally renders a fixed `items` golden sample.
Domain-specific names and fields are generalized by the manifest-driven packs;
the current evidence does not claim that the CLI renames the sample into an
arbitrary domain automatically.

## Static Validation Checklist

| Check | Expected |
|---|---|
| Source skill count | 21 |
| Mirror counts | 21 in `.claude`, `plugin`, and `codex` |
| Text hygiene | No hidden/control/bidi Unicode in tracked text files |
| Frontmatter | Canonical skills require `name`, `description`, and semantic `required-actions`; provider tool allowlists exist only in generated adapter mirrors |
| Skill names | Unique `sdcorejs-*` kebab-case names |
| Ref links | Exact `_refs/...` paths in skills and refs resolve to committed files |
| Codex mirror | `name` + `description` only, refs rewritten to `../_refs/...` |
| Cursor rule | In sync with `AGENTS.md` |
| Harness manifests | Five generated adapter manifests match the canonical capability source hash and contain all 21 skills |
| Capability contract | Every adapter maps all 14 actions, including `context.pass`, and declares all 12 capabilities, including `runtime_context_channel`, as supported, unsupported, or unknown with fallbacks |
| Behavioral sentinel | Direct/fast/full workflow, interaction, delegation, ownership, summary mutation, static visual, communication profiles, projection, portable handoff, and related-artifact scenarios pass |
| Stale mirrors | No missing, changed, or extra generated mirror files |
| Root npm publication | `private: true`; no publication-only manifest metadata, scripts, lifecycle hooks, workflow credentials, registry commands, or npm dependency-install guidance |
| Workflow names | No removed legacy skills remain |
| Product track | `sdcorejs-product` exists and product docs/traceability route to it |
| Design track | `sdcorejs-design` exists and design docs/wireframes/PNG previews route to it |
| Product/Design artifact roots | Producers, consumers, resolvers, validators, metadata templates, and reports use `.sdcorejs/product/**` and `.sdcorejs/design/**`; ledgers stay under `.sdcorejs/docs/product/**` and `.sdcorejs/docs/design/**`; root-level `product/**` and `design/**` remain only as legacy read-only compatibility, migration logic, or negative tests |
| Test track | `sdcorejs-test` exists and `sdcorejs-execute-plan` routes test-only plans to it |
| AI-agent track | `sdcorejs-ai-agent` exists; engine and capability profiles remain independent and approved-plan continuation stays owned by `sdcorejs-execute-plan` |
| Simplification utility | `sdcorejs-simplify` exists outside the track enum; current-diff/explicit-scope, protected content, before/after verification, finish-gate opt-in, and `simplify_context` invariants remain mutation-tested |
| Generic harness | `sdcorejs-execute-plan` documents fallback execution |
| Language policy | Source skills/refs/mirrors stay English-only; explicit localization prompt fixtures may use non-English input |

These checks are enforced by `npm run check:text-hygiene`,
`npm run check:skills`, and `npm run test:e2e`.

## Revalidation Commands

```bash
npm run sync:skills
npm run check:text-hygiene
npm run check:skills
npm run check:skills:ps
npm run test:e2e:communication-economy
npm run report:communication-economy
npm run report:communication-economy:live
npm run test:e2e:harness
npm run test:e2e:visual-companion
npm run test:e2e:artifact-paths
npm run check:nestjs-pack
node --test test/e2e/npm-publication-contract.test.mjs
node --test test/e2e/ai-agent-track-contract.test.mjs
npm run test:e2e:nestjs
npm run test:e2e:nestjs:golden
npm run test:e2e:nestjs:containers
npm run test:e2e:parallel
npm run test:e2e
npm audit --omit=dev
```

For the showcase site:

```bash
cd site
npm ci
npm audit --omit=dev
npm run build
```

CI coverage:

- `CI` runs on pull requests and pushes to `main`.
- `CI` runs `npm ci`, `npm run check:text-hygiene`,
  `npm run check:skills`, `npm run check:nestjs-pack`,
  `npm run check:audit`, and `npm run test:e2e`
  on Ubuntu.
- `CI` runs a separate site job with `npm ci`, `npm run check:audit`, and
  `npm run build` under `site/`.
- `CI` runs `npm run check:text-hygiene` and `npm run check:skills:ps`
  on Windows.
- `Full E2E` runs `npm run test:e2e:phase4`,
  `npm run test:e2e:nestjs:golden`, and
  `npm run test:e2e:nestjs:containers` with `SDCOREJS_E2E_FULL=1` on a schedule
  and through manual dispatch. Release notes should link the latest successful
  run.

## Release Evidence Status

- GitHub Releases and tags are the distribution anchors for adopted versions.
  Publish a release before asking consumers to pin this pack.
- The repository currently has deterministic test and Full E2E infrastructure.
  Real-agent transcript evidence for Claude Code, Codex attached repo, Codex
  native skills, Cursor, and GitHub Copilot is still a release-time requirement
  before claiming full live-agent coverage.
- Communication Economy Policy has one trusted Codex/Claude pure-Q&A A/B smoke
  at `medium` and `high`; the full scenario and tool-surface matrix remains a
  release-time requirement.
- Repository metadata should describe the project as a portable SDLC skill pack
  for AI coding agents, not as a standalone runtime coding agent.

PowerShell inventory:

```powershell
$src = Get-ChildItem -Recurse -File -Path skills -Filter *.md | Where-Object { $_.Name -ne '_README.md' }
$claude = Get-ChildItem -Recurse -File -Path .claude\skills -Filter SKILL.md
$plugin = Get-ChildItem -Recurse -File -Path plugin\skills -Filter SKILL.md
$codex = Get-ChildItem -Recurse -File -Path codex\skills -Filter SKILL.md
[PSCustomObject]@{
  SourceSkills = $src.Count
  ClaudeMirror = $claude.Count
  PluginMirror = $plugin.Count
  CodexMirror = $codex.Count
}
```

Removed-name scan should return no matches for deleted design skills in source docs and tests.
