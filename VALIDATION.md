# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-07-24

## Current Layout

- `skills/**/*.md` - 23 dispatchable source skills.
- `_refs/**` - reference data loaded on demand.
- `.claude/skills/<name>/SKILL.md` - generated Claude Code mirror.
- `plugin/skills/<name>/SKILL.md` - generated Claude plugin mirror.
- `codex/skills/<name>/SKILL.md` - generated Codex-native mirror.
- `codex/skills/_refs/**` - shared Codex reference mirror.
- `.cursor/rules/sdcorejs-agent.mdc` - generated Cursor rule from `AGENTS.md`.

## Inventory

| Bucket | Count |
|---|---:|
| Source skills | 23 |
| Claude Code mirror skills | 23 |
| Plugin mirror skills | 23 |
| Codex mirror skills | 23 |

## Workflow Inventory

| Area | Skills |
|---|---|
| Discovery | `sdcorejs-brainstorming` |
| Spec gate | `sdcorejs-spec` |
| Plan gate | `sdcorejs-plan` |
| Execution gate | `sdcorejs-execute-plan` |
| App executors | `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs` |
| Product executor | `sdcorejs-product` |
| Design executor | `sdcorejs-design` |
| Test executor | `sdcorejs-test` |
| Documentation executor | `sdcorejs-documentation` |
| Parallel | `sdcorejs-parallel-dispatch` |
| Finish | `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)` when durable knowledge surfaced |

## R23 pre-traceability closure evidence - 2026-07-24

This section supersedes the earlier product-contract working-tree counts below.
It records the isolated R23 finalization candidate before the final
traceability write, deny-write audit, branch-ready gate, and Git handoff. It
must not be read as a release or merge-readiness claim on its own.

Evidence target:

- Final branch: `refactor/sdcorejs-product-final`.
- Clean base: `cfa7a985e364e99b39a7ed236593649335f00fdf`.
- Immutable source checkpoint:
  `ea9ae0b3fe77c7c51fed4abcc7316ff23afbd9da`.
- Deterministic projection before final documentation: 137 changed paths,
  comprising 44 canonical source paths, 91 generated mirrors, and the two
  explicitly approved site audit repairs.
- Recovery-only R16-R22 artifacts and the 40 classified exclusions are absent
  from the final branch.
- The user explicitly approved `site/package.json` and
  `site/package-lock.json` as a bounded same-R23 scope exception. No R24 was
  created and no other scope expansion was authorized.

### Current closure matrix

| Command | Exit | Observed result |
|---|---:|---|
| `npm run check:text-hygiene` | 0 | 729 text files passed reusable-source language and hidden-character checks. |
| `npm run check:nestjs-pack` | 0 | Canonical NestJS pack validation passed. |
| `npm run test:e2e:product` | 0 | 80/80 product protocol and generated-mirror parity tests passed. |
| `npm run test:e2e:phase1` | 0 | 124/124 product and skill-pack contract tests passed. |
| `npm run test:e2e:parallel` | 0 | 86/86 parallel, isolation, fan-in, rollback, and entrypoint tests passed. |
| `npm run check:skills` | 0 | JavaScript mirror validation passed. |
| `npm run check:skills:ps` | 0 | PowerShell mirror validation passed. |
| `npm run test:e2e:repository` | 0 | 220/220 repository contract tests passed. |
| `npm run test:e2e` | 0 | Repository 220/220; NestJS 24 passed with one intentional Linux-only skip; generated golden projects 2/2 passed. |
| `npm run check:audit` | 0 | Root production dependency audit reported zero vulnerabilities. |
| `npm --prefix site ci` | 0 | Installed the locked site graph and audited 205 packages with zero vulnerabilities. |
| `npm run check:site:audit` | 0 | Site production dependency audit reported zero vulnerabilities. |
| `npm run build:site` | 0 | Astro generated both documentation pages successfully. |
| `git diff --check` and `git diff --cached --check` | 0 | No whitespace errors were reported. |

The complete read-only review inspected all 137 pre-documentation paths and
found one Important integration defect: decision authority was not yet consumed
by multi-row feature derivation or final authorization. The same R23 repair
added RED/GREEN coverage, observes the complete decision set inside the final
gate, consumes exactly one opaque capability, rejects a missing observer, and
regenerated every mirror. A full closure rerun produced the results above.
There are no unresolved Critical or Important review findings.

The final eight allowed documentation paths comprise this pre-traceability
closeout, the durable summary, five human product documents, and one canonical
product ledger. The ledger is deliberately the final content write. Any content
change after that point invalidates the final evidence and requires the
traceability sync, deny-write verification, read-only product audit, and ship
gates to run again.

## Superseded product contract final review deferral - 2026-07-15 working tree

This section supersedes every earlier product-contract close-out count in this
file. It records a blocked, uncommitted working tree. It is not release,
merge-readiness, final product-audit, or Git-handoff evidence.

Evidence target:

- Branch: `main`.
- Base HEAD: `cfa7a985e364e99b39a7ed236593649335f00fdf`.
- Approved authority: spec revision 2 at
  `.sdcorejs/specs/workflow/2026-07-14-23-18-product-contract-authority-correction-r2.md`
  and plan R3 at
  `.sdcorejs/plans/workflow/2026-07-15-00-16-product-contract-refactor-plan-r3.md`.
- Expanded dirty-tree inventory before this risk-note write: 145 paths, made up
  of 106 modified and 39 untracked files. Independent scope review classified
  135 paths as R3-allowed and 10 as protected immutable history, with zero
  staged or unrelated paths. The porcelain status digest was
  `f34de7b0a10562cc5ffd7464bf5432260a1742e497223ff5c7e510314e10b795`.
- All 10 protected workflow/spec/plan files retained their pinned SHA-256
  values. `skills/shared/workflow/git.md` remained byte-identical to `HEAD`.

### Observed commands before the deferral note

| Command | Exit | Observed result |
|---|---:|---|
| Approved spec/plan integrity probe | 0 | Spec R2 and plan R3 body plus integrity hashes revalidated with zero errors before each significant write. |
| `npm run sync:skills` | 0 | Regenerated all 23 skill mirrors, product references, and the Cursor rule from canonical sources. |
| `npm run check:skills` | 0 | Node mirror checker reported every skill, reference tree, and Cursor rule in sync. |
| `npm run check:skills:ps` | 0 | PowerShell mirror checker reported the same generated targets in sync. |
| `npm run check:text-hygiene` | 0 | 738 text files passed reusable-source language and hidden-character checks. |
| `npm run check:nestjs-pack` | 0 | Canonical NestJS pack validation passed. |
| `npm run test:e2e:product` | 0 | 75/75 product protocol and generated-mirror parity tests passed. |
| `npm run test:e2e:phase1` | 0 | 117/117 product plus skill-pack contract tests passed. |
| `npm run test:e2e:parallel` | 0 | 86/86 parallel, worktree, fan-in, rollback, and entrypoint tests passed. |
| `npm run test:e2e:repository` | 0 | 213/213 repository contract tests passed. |
| `npm run test:e2e` | 0 | Repository 213/213; focused NestJS 24 passed with one Linux-only skip; generated simple and enterprise NestJS golden projects 2/2 passed. |
| `npm audit --omit=dev` | 0 | Zero production dependency vulnerabilities were reported. |
| `git diff --check` | 0 | No whitespace error; Git reported only CRLF/LF conversion warnings for mirrored infrastructure files. |
| Skill Creator `quick_validate.py codex/skills/sdcorejs-product` | 1 | The host validator did not start because Python lacks `PyYAML` (`ModuleNotFoundError: yaml`). No pass is claimed for this tier. |

These passing commands do not override the independent review findings below.
The review exercised paths that the deterministic suite did not cover.

### Deferred blocking findings

| ID | Severity | Evidence | Unresolved risk |
|---|---|---|---|
| DFR-001 | Critical | `_refs/product/product-protocol.mjs:3268`, `:1175` | Caller-authored implementation, verification, or UAT not-applicable decisions are shape-checked but lack a parent-observed, request-bound, one-shot approval attestation. Forged approval provenance can support `READY`. |
| DFR-002 | Critical | `_refs/product/product-protocol.mjs:903` | A failing, malformed, or out-of-scope bounded writer can leave filesystem mutations behind because execution has no mandatory isolation or verified rollback. Planned destinations also need an immediate linked-ancestor containment check. |
| DFR-003 | Important, hard tail blocker | Plan R3 `plan_context.product_action` at line 238 versus tasks 13-14 at lines 512-513 | R3 records `not-applicable`, while final authorization requires exact equality with `traceability-sync` or `audit-readonly`. The protected R3 artifact cannot authorize its own final product write or audit. `not-applicable` must not become an unrestricted wildcard. |
| DFR-004 | Important | `_refs/product/product-protocol.mjs:1852` | `deriveTraceability` requires trusted approved-spec authority only when an artifact supplies `observed`; a forged requirement and not-applicable decision can otherwise derive `READY`. |
| DFR-005 | Important | `_refs/product/product-protocol.mjs:2051` | `resolveProductLayout` does not return the exact closed `product_context.layout` schema required by the validator, blocking safe fallback-ledger composition. |
| DFR-006 | Important | `_refs/product/templates.md:233` | Persisted product templates omit the approved-spec integrity hash and complete active/retired requirement identity required by the approved authority contract. |
| DFR-007 | Important | `_refs/product/traceability.md:128` | Traceability prose requests rows for historical requirements, while the executable validator accepts exactly active requirement IDs. |
| DFR-008 | Minor | `_refs/product/evidence-and-uat.md:33` | Non-command evidence timestamp nullability differs between the readable template and executable validator. |

### User decision and stopped tail

After the repair loop reached its three-pass cap, the user selected option 1:
defer the findings and stop with an explicit risk note. This decision records
the risks; it does not resolve or waive merge, product, or branch-readiness
gates.

The resulting state is `BLOCKED`:

- Task 11 did not converge because Critical and Important findings remain.
- Task 12 records this risk note and the blocked session checkpoint only.
- Task 13 `traceability-sync` was not run, and no canonical product ledger was
  created.
- Task 14 post-sync deny-write verification and `audit-readonly` were not run.
- Task 15 `verify-before-done` and `branch-ready` were not run.
- No branch, commit, push, PR, tag, release, or dependency change was created.

Prepared-environment surfaces remain explicitly unexecuted: Full target-app
E2E, NestJS container validation, site build, and the 25-cell live-agent matrix.
They remain pending rather than passed.

### Post-note read-only checks

After writing this deferral note and the blocked session checkpoint, the
following narrow documentation checks passed. They validate the note and
repository invariants only; they do not resolve the deferred findings or run
the stopped tail.

| Command | Exit | Observed result |
|---|---:|---|
| `npm run check:text-hygiene` | 0 | 738 text files passed. |
| `npm run test:e2e:phase1` | 0 | 117/117 contract tests passed, including public validation-document invariants. |
| `npm run check:skills` | 0 | All generated skill and reference mirrors remained in sync. |
| `git diff --check` | 0 | No whitespace errors were reported. |

## Superseded product contract repair evidence - 2026-07-14 working tree

The section below is retained as historical evidence only. Its counts and
authority status do not describe the current diff.

This section supersedes the preliminary 2026-07-13 close-out counts for this
uncommitted refactor. Those earlier 18/18, 48/48, and 88/88 observations predate
the review repairs and must not be used as evidence for the current diff.

Evidence target:

- Branch: `main`.
- Base HEAD: `cfa7a985e364e99b39a7ed236593649335f00fdf`.
- State: uncommitted `sdcorejs-product` contract refactor, including canonical
  skills and references, deterministic validators, lifecycle integrations,
  regression fixtures, generated mirrors, release documentation, preserved
  legacy approved snapshots, and an unapproved revision-2 correction draft.
- This is dirty-diff evidence, not a release, merge-readiness, committed-CI, or
  live-agent adoption claim.
- The legacy approved plan's spec-hash chain is inconsistent. Execute-plan now
  rejects that chain; the replacement spec remains `approval.approved: false`
  pending explicit user approval, and no replacement plan exists yet.

### Commands and observed results

All commands ran from the repository root unless stated otherwise.

| Command | Exit | Result and relevant observation |
|---|---:|---|
| `npm ci` | 0 | Lefthook installed successfully; 3 packages added, 4 audited, and 0 vulnerabilities reported. |
| Initial `node --test test/e2e/product-protocol.test.mjs` | 1 | Required RED baseline: the canonical `_refs/product/product-protocol.mjs` did not exist yet (`ERR_MODULE_NOT_FOUND`). No pass was claimed. |
| Mutation-first focused product runs | 1 | Deliberately corrupted action, identity, evidence, readiness, redaction, layout, and orchestration cases failed before their corresponding repairs. These are TDD failure observations, not accepted validation passes. |
| `npm run sync:skills` | 0 | Regenerated 23 skill mirrors, all `_refs` mirrors including the new product protocol, and the Cursor rule from canonical sources. It was rerun after every late canonical compatibility repair. |
| Final `git diff --check` plus `node --check` on the three changed executable modules | 0 | No whitespace or JavaScript syntax error was observed after the final canonical repair and mirror regeneration. Git emitted only existing CRLF/LF conversion warnings for mirrored infra files. |
| `npm run check:text-hygiene` | 0 | 735 text files scanned successfully; reusable sources and generated mirrors passed the English-only and hidden-character checks. |
| `npm run check:skills` | 0 | Node mirror checker reported all 23 skill targets, all ref targets, and the Cursor rule in sync. |
| `npm run check:skills:ps` | 0 | Windows PowerShell mirror checker reported the same targets in sync. |
| Intermediate product, parallel, and phase-1 runs | 1 | Required RED runs reproduced false-ready rows, weak N/A decisions, malformed boundaries, evidence/approval TOCTOU, incomplete repository snapshots, case-sensitive ownership, and post-apply scope changes. A post-sync phase-1 run also exposed a wrapped literal invariant; the canonical wording was fixed without weakening the assertion. These failures are TDD evidence, not accepted passes. |
| `npm run test:e2e:product` | 0 | 62/62 passed, including 61 product-contract behavior scenarios and canonical-to-generated executable mirror parity. |
| `npm run test:e2e:phase1` | 0 | 103/103 passed after product, approval-integrity, executor/side-effect/artifact/command cross-binding, trusted evidence/UAT, file-verified final plan authority and plan-scope binding, malformed-boundary, routing, workflow-ordering, and mirror regressions were added. |
| `npm run test:e2e:parallel` | 0 | 86/86 passed, including file-backed ownership/fan-in authority, internal Git state and object-store observation, empty-directory detection, one-shot decision/result binding, pairwise realpath isolation, case-aware ownership, post-apply/probe authority and path checks, verified rollback, strict rename/path handling, TOCTOU checks, and real temporary Git behavior. |
| `npm run test:e2e:repository` | 0 | 199/199 passed, including product, plan integrity, parallel, routing, entrypoint, adapter, and golden-harness contracts. The heavyweight full target-app execution remains opt-in. |
| `npm run test:e2e` | 0 | Aggregate validation passed: repository 199/199; focused NestJS contracts 24 passed with one Linux-only skip; generated simple and enterprise NestJS golden projects 2/2. |
| `npm audit --omit=dev` | 0 | 0 production dependency vulnerabilities. |
| Skill Creator `quick_validate.py codex/skills/sdcorejs-product` | 1 | Host-only validator could not start because the Python environment lacks `PyYAML` (`ModuleNotFoundError: yaml`). No pass is claimed; repository-native skill and mirror validators are recorded separately above. |

Multiple independent read-only review rounds identified protocol, integration,
routing, evidence, authority-chain, repository-state, and documentation findings
that drove this repair. Their reports are review input, not proof that the final
diff is defect-free. A final focused independent re-review verified the repaired
file-backed plan authority and allow/prohibit scope and reported no remaining
Important-or-higher finding; that review remains separate from deterministic
test evidence.

### Evidence boundaries

- The product action model, validators, and documentation are locally verified;
  this session did not execute them against a separate consumer project's real
  product ledger.
- Mirrors are synchronized by both supported checkers. Generated changes map to
  canonical `skills/**`, `_refs/**`, and `AGENTS.md`; no mirror-only edit is
  accepted as source.
- Unkeyed local hashes and opaque in-process capabilities establish deterministic
  integrity only under a trusted orchestrator and filesystem. Parent observers
  are an external trust boundary; this evidence does not authenticate a human
  approver or claim resistance to an arbitrary malicious host.
- Full target-app E2E was **not run**: no prepared
  `SDCOREJS_E2E_FULL=1 npm run test:e2e:phase4` execution or current GitHub
  Actions run exists for this working tree. The default aggregate does not
  replace that opt-in environment.
- Container validation was not rerun because this refactor does not change the
  NestJS container pack and no prepared container target was requested.
- The 5-by-5 live-agent matrix in `docs/REAL_AGENT_VALIDATION.md` remains
  **Pending**. Deterministic prompt fixtures and this Codex implementation
  session are not counted as real adoption evidence.
- Historical validation below does not validate this uncommitted product diff.
- Final post-documentation checks and the zero-write branch-ready audit must be
  reported separately; they do not turn missing Full E2E or live-agent coverage
  into a pass.

## Validation Tiers

The project has several validation layers. Keep claims tied to the layer that
actually produced evidence.

| Tier | What it proves | Current evidence | External evidence still required |
|---|---|---|---|
| Static validation | Source layout, frontmatter, exact refs, generated mirrors, markdown fences, text hygiene, and language policy are internally consistent. | `npm run check:text-hygiene`, `npm run check:skills`, and phase 1 E2E tests. | None beyond keeping CI green for the target commit. |
| Deterministic prompt-routing validation (local canonical routing) | The canonical local runner selects the expected `sdcorejs-*` skill for fixture prompts without calling an LLM. | `test/e2e/fixtures/prompt-evals.json` plus phase 1 tests. | Add fixtures when new user intents are introduced. |
| Entrypoint-aware routing validation | Each loaded Claude Code, Codex, Cursor, or Copilot profile contributes derived routing policy; mutation tests prove one changed profile can fail independently. | `test/e2e/entrypoint-smoke.test.mjs`. | This proves deterministic profile-text participation, not live runtime behavior. |
| Parallel protocol simulation | Selected contract, topology/DAG, path/resource, failure/fan-in, repair/evidence, repository-state, and state-machine rules are exercised through the distributed deterministic validator. | `_refs/orchestration/parallel-protocol.mjs` via `test/e2e/parallel-dispatch-protocol.test.mjs`; includes synthetic boundaries plus real temporary Git worktree, object-store, empty-directory, result-commit, conflict, scope-change, and rollback behavior. | This is partial local simulation under the documented host trust boundary. External runtimes must still invoke the validator and enforce the skill instructions, capabilities, and repository-specific commands during real sessions. |
| CLI smoke validation | Local adapter code can detect or simulate supported CLI surfaces without requiring live Claude/Codex execution. | Phase 2 tests use fake `codex` and `claude` executables. | Run real CLI smoke tests in a prepared workstation when changing install instructions. |
| Full target-app validation | The golden target-app generator can run the heavyweight E2E path in a prepared environment. | Historical evidence only: <https://github.com/sdcorejs/sdcorejs-agent/actions/runs/28798513991>. It does not validate the 2026-07-14 working tree. | Re-run for the exact release commit and attach that successful run to the release notes. |
| NestJS pack contract | The canonical manifest, profile contract, pack graph, forbidden-token scan, template renderer, route/security/runtime contract, and generator boundaries agree. | Local command `npm run check:nestjs-pack` and `npm run test:e2e:nestjs`; final branch evidence must be refreshed after the last mirror write. | Static evidence does not prove generated application behavior. |
| Generated NestJS applications | Canonical templates generate strict `simple` and `enterprise` NestJS projects; dependency installation, compilation, unit, integration, HTTP E2E, tenant isolation, and concurrency tests execute. | Local `npm run test:e2e:nestjs:golden`: both profiles passed for this working tree on 2026-07-14. | Re-run in CI for the exact commit. |
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
| Source skill count | 23 |
| Mirror counts | 23 in `.claude`, `plugin`, and `codex` |
| Text hygiene | No hidden/control/bidi Unicode in tracked text files |
| Frontmatter | Required `name` and `description`; optional `allowed-tools`; no duplicate keys; no unsupported frontmatter shape |
| Skill names | Unique `sdcorejs-*` kebab-case names |
| Ref links | Exact `_refs/...` paths in skills and refs resolve to committed files |
| Codex mirror | `name` + `description` only, refs rewritten to `../_refs/...` |
| Cursor rule | In sync with `AGENTS.md` |
| Stale mirrors | No missing, changed, or extra generated mirror files |
| Workflow names | No removed legacy skills remain |
| Product track | `sdcorejs-product` exists and product docs/traceability route to it |
| Design track | `sdcorejs-design` exists and design docs/wireframes/PNG previews route to it |
| Test track | `sdcorejs-test` exists and `sdcorejs-execute-plan` routes test-only plans to it |
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
npm run check:nestjs-pack
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
