# Validation Report

Current validation snapshot for the SDCoreJS SDLC Agent repository.

Date: 2026-07-13

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
| Entrypoint-aware routing validation | Each loaded Claude Code, Codex, Cursor, or Copilot profile contributes derived routing policy; mutation tests prove one changed profile can fail independently. | `test/e2e/entrypoint-smoke.test.mjs`. | This proves deterministic profile-text participation, not live runtime behavior. |
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
