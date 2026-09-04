# Testing the SDCoreJS SDLC Agent

Repository-level tests for the current 23-skill SDCoreJS Agent layout.

The pack is documentation-driven, with deterministic executable contracts for
capabilities, entry gating, delegation boundaries, summary freshness, and the
static visual composer. Tests retain prose checks and add behavioral
simulations/mutation fixtures.

For the claim boundaries between static checks, deterministic routing, CLI
smoke, Full E2E, and live-agent transcript evidence, see `VALIDATION.md`.

## Automated E2E Harness

Run all phases:

```bash
npm run test:e2e
```

Run text hygiene before reviewing release candidates:

```bash
npm run check:text-hygiene
```

Run one phase:

```bash
npm run test:e2e:harness
npm run test:e2e:visual-companion
npm run test:e2e:phase1
npm run test:e2e:phase2
npm run test:e2e:phase3
npm run test:e2e:phase4
```

The default E2E run keeps phase 4 in opt-in mode so pull-request feedback stays
fast. CI runs the default suite on pull requests and pushes to `main`; the
scheduled/manual `Full E2E` workflow runs phase 4 with `SDCOREJS_E2E_FULL=1`.

## Expected Inventory

- Source skills: 23
- `.claude/skills`: 23
- `plugin/skills`: 23
- `codex/skills`: 23 skill folders plus shared `_refs`
- Adapter harness manifests: 5 generated files with one canonical source hash
- `_refs/**/*.md`: at least 60 committed markdown refs; Core UI component docs are fetched on demand
- Internal `authoring/skills/sdcorejs-skill-authoring`: 1, excluded from every
  public count, mirror, adapter manifest, and site catalog

PowerShell count:

```powershell
$src = Get-ChildItem -Recurse -File -Path skills -Filter *.md | Where-Object { $_.Name -ne '_README.md' }
$claude = Get-ChildItem -Recurse -File -Path .claude\skills -Filter SKILL.md
$plugin = Get-ChildItem -Recurse -File -Path plugin\skills -Filter SKILL.md
$codex = Get-ChildItem -Recurse -File -Path codex\skills -Filter SKILL.md
$refs = Get-ChildItem -Recurse -File -Path _refs -Filter *.md
[PSCustomObject]@{
  SourceSkills = $src.Count
  ClaudeMirror = $claude.Count
  PluginMirror = $plugin.Count
  CodexMirror = $codex.Count
  RefDocs = $refs.Count
}
```

## Phase Coverage

### Decision, architecture, validation, convergence, and authoring contracts

```bash
npm run test:e2e:decision-coverage
npm run test:e2e:architecture
npm run test:e2e:validation-map
npm run test:e2e:convergence
npm run test:e2e:skill-authoring
```

These deterministic/mutation suites keep decision and assumption identities,
goal-backward task/path/evidence coverage, conditional architecture lineage,
the shared validation map, delivery convergence, external feedback safety, and
the internal-only authoring boundary load-bearing. The authoring harness never
reads ambient credentials or invokes a provider. Its live matrix remains
structured `NOT RUN` evidence unless a separate authorized run supplies real
runtime, transcript, and provider telemetry.

Mutation cases also co-mutate validation rows with decision boundaries, forge
zero-count convergence, change Git current/result identities together, escape
repair scopes, remove test assertions, fabricate approvals/telemetry, and hide
the internal skill in nested public surfaces. Approved hashes, convergence
receipts, repository-derived identities, and recursive scans must catch them.

### Behavioral Harness Sentinels

```bash
npm run test:e2e:harness
```

Simulates direct Q&A, bounded fast-fix, ambiguous full-workflow entry,
single/multi-unit execution mode, runtime capability attestation, delegation
versus concurrency fallback, separate visual and non-visual surface ladders,
worker-tier selection, bounded task/review envelopes, entrypoint
deletion/rename invalidation, disjoint ownership, and safe static visual
rendering. It does not call a live model.

### Visual Companion Runtime

```bash
npm run test:e2e:visual-companion
```

Eight categories over the live companion runtime and the static surface they
share: protocol identity and redaction, the one screen model, rendering with the
CSP hash pinned to the served client bytes, RFC 6455 framing, server
authentication and filesystem containment, event identity including stale,
cross-session, and replayed clicks, the command-line contract with its JSON
result and error codes, and process lifecycle including the idle watchdog, the
runtime-root fallback, and the shell-free browser launcher.

It binds only ephemeral loopback ports and writes only under a temporary
directory, so it needs no browser and no network access.

### Communication Economy Policy

```bash
npm run test:e2e:communication-economy
npm run report:communication-economy
npm run report:communication-economy:live
```

The behavioral test covers `compact`, `standard`, and `detailed` resolution;
approval/security/destructive escalation; exact-content preservation;
authoritative runtime context, user projection, and portable handoff separation;
consumer-required field and shape validation, including independent
`test_status`, `test_evidence`, and `parallel_context`; rejection of nested
artifact bodies; numbered approval options; provider-neutral `context.pass`;
event-driven progress; related-artifact selection; empty-section elision;
rendered semantic parity; and absence of mutable runtime state under
`.sdcorejs/**`.

The deterministic report compares ten sanitized scenario fixtures. Baseline
context schemas are read with `git show` from the declared baseline commit,
then combined with the sanitized scenario projection; current user output is
rendered by the current policy. These visible-output figures are source-bound
contract-surface projections, not captured agent transcripts. The report
records bootstrap and just-in-time bytes, visible output bytes and words,
serialized portable fallback bytes, serialized authoritative-context bytes sent
through a supported runtime context channel, repeated-block bytes, total
communication bytes, authoritative-field coverage, and rendered
approval/security/verification parity. The current total counts exactly one
handoff representation for each typed context: native structured context when
supported, otherwise the portable fallback. The baseline includes the context
it echoed in visible output. The report does not fabricate an estimated token
count when no tokenizer is installed, and it labels optional live A/B evidence
as skipped when trusted usage telemetry is not supplied. The `:live` command
does not invoke a provider or require credentials; it validates and projects
the sanitized Codex/Claude fixture. Invalid parity, token fields,
source hashes, or sanitization declarations fail closed. Metrics are evidence,
not a marketing claim; tests should not fail on whitespace or prose that does
not alter behavior.

### Documentation Layout v2

```bash
npm run test:e2e:documentation-layout
```

This deterministic suite exercises cross-platform key/path safety,
canonical-first exact discovery, the documentation gate, migration planning and
idempotent snapshot application, asset ownership/collisions, aggregate
frontmatter and link rewriting, broken-link blocking, guide/image containment,
Pandoc argument arrays and separate DOCX/PDF capability reports, and the
single-invocation finish-tail rule. Repository E2E includes this file directly.
It does not install Pandoc, open a browser, access a network, or mutate a
consumer repository.

### npm Publication Contract

```bash
node --test test/e2e/npm-publication-contract.test.mjs
```

Verifies that the private root tooling workspace has no npm publication
metadata, scripts, lifecycle hooks, workflow credentials, registry commands, or
dependency-install documentation while preserving npm development commands,
release-version synchronization, and the 23-skill source/mirror inventories.

### Phase 1: Skill Pack Runner

```bash
npm run test:e2e:phase1
```

Verifies:

- Source and mirror skill counts.
- Codex-compatible frontmatter.
- No missing or extra mirror skills.
- Reference docs copied into Codex `_refs`.
- Prompt eval dispatch, including `sdcorejs-brainstorming`.

### Phase 2: CLI Adapters

```bash
npm run test:e2e:phase2
```

Uses fake `codex` and `claude` executables to validate adapter behavior without real CLI calls.

### Phase 3: Entrypoint Smoke

```bash
npm run test:e2e:phase3
```

Loads Codex, Cursor, Claude Code, and Copilot entrypoints. Checks Runtime-localized behavior and shared dispatch evals.

### Phase 4: Target-App Golden

```bash
npm run test:e2e:phase4
```

Skipped by default unless `SDCOREJS_E2E_FULL=1` is set in a prepared environment.

GitHub Actions coverage:

- `CI` runs `npm ci`, `npm run check:text-hygiene`, `npm run check:skills`,
  `npm run test:e2e`, and a Windows `npm run check:text-hygiene` plus
  `npm run check:skills:ps` job.
- `Full E2E` runs `npm run test:e2e:phase4` with `SDCOREJS_E2E_FULL=1` on a
  schedule and through `workflow_dispatch`. Release notes should link a
  successful run for the release commit.

## Language Fixtures

Core skill content, generated mirrors, reusable examples, and expected generated
skill prose stay English-only. Localization fixtures may include non-English
input prompts when the test is explicitly checking runtime-localized dispatch or
intent handling; expected source text must still remain English-only.

## Mirror Sync

```bash
npm run sync:skills
npm run check:text-hygiene
npm run check:skills
npm run check:skills:ps
```

`sync:skills` regenerates:

- `.claude/skills`
- `plugin/skills`
- `codex/skills`
- `.cursor/rules/sdcorejs-agent.mdc`
- `.claude/sdcorejs-harness.json`, `plugin/sdcorejs-harness.json`,
  `codex/sdcorejs-harness.json`, `.cursor/sdcorejs-harness.json`, and
  `.github/sdcorejs-harness.json`

## Fresh-Session Smoke Prompts

### Skill Listing

```text
what skills do you have?
```

Expected:

- Uses `sdcorejs-using-skills`.
- Mentions workflow: brainstorming -> spec -> plan -> execute-plan -> executor -> finish.
- Mentions Angular, NestJS, Next.js, product track, test track, and generic harness fallback.

### Open-Ended Requirement

```text
toi dang phan van giua side-drawer va full-page detail cho entity user, nen dung cai nao?
```

Expected:

- Dispatches `sdcorejs-brainstorming`.
- Presents 2-3 approaches and a recommendation.
- Does not write code.

### Concrete But Incomplete Feature

```text
them entity product
```

Expected:

- Dispatches `sdcorejs-brainstorming` in confirm mode.
- Asks blockers for target track/module/entity/fields/scope.
- Does not generate files.

### Spec And Plan Gates

Prompt sequence: walk through brainstorming -> spec approval -> plan approval.

Expected:

- `sdcorejs-spec` waits for explicit approval.
- `sdcorejs-spec` writes the approved spec snapshot only after approval.
- `sdcorejs-plan` waits for explicit approval.
- `sdcorejs-plan` writes the approved plan snapshot only after approval.
- `sdcorejs-execute-plan` compiles the approved policy and observed runtime
  capabilities before selecting parent, sequential-worker, or parallel-worker
  execution.

### Test Track

```text
write e2e tests from this inspector export
```

Expected:

- Direct test work uses `sdcorejs-test`.
- If cases/assertions are unclear, the gated test workflow starts with `sdcorejs-brainstorming`.
- Approved test plans execute through `sdcorejs-execute-plan` and then `sdcorejs-test`.

### Product Track

```text
viet product doc va kiem tra requirement implement test co day du khong
```

Expected:

- Product/PO docs use `sdcorejs-product`.
- The PRD, user stories, acceptance criteria, UAT checklist, and decisions are written under `.sdcorejs/product/`.
- The ledger is written under `.sdcorejs/docs/product/`.
- No root-level `product/` directory is created.
- The report maps requirement, implementation, and test evidence and lists real gaps.

### Design Track

```text
thiet ke man hinh quan ly lop hoc va gen png theo user stories
```

Expected:

- FE handoff work uses `sdcorejs-design`.
- The design source is written under `.sdcorejs/design/` (`flows/`, `specs/`, `decisions/`, `wireframes/`, `exports/png/`, `references/`) and the ledger under `.sdcorejs/docs/design/`.
- No root-level `design/` directory is created.
- PNG previews are treated as exports from editable specs/wireframes, not the only source of truth.

### Generic Harness

```text
execute this approved docs/config migration plan
```

Expected:

- `sdcorejs-execute-plan` detects no app track if appropriate.
- Compiles dependency waves and records why parallel execution is or is not
  currently feasible.
- Routes delegated execution through `sdcorejs-subagent-driven-development`.
- Uses generic harness fallback.
- Runs declared verification commands.

## Triage

| Symptom | Likely cause | Fix |
|---|---|---|
| Mirror is stale | Sync was not run | `npm run sync:skills` |
| Check fails | Generated mirrors differ from source | Run sync, then check |
| Codex skill cannot load refs | `_refs` not copied | Copy `codex/skills/_refs` with native skills |
| Old skill name appears | Docs/source stale | Search for removed names and update to new workflow |
| Approval gate skipped | Spec/plan skill not followed | Re-read `sdcorejs-spec` and `sdcorejs-plan` |

## Update This File When

- A skill is added, removed, or renamed.
- Sync output paths change.
- The workflow or approval gates change.
- A new tool surface is supported.
- The Communication Economy Policy, context field matrix, projection, or
  measurement scenarios change.
