# Testing the SDCoreJS SDLC Agent

Repository-level tests for the current 23-skill SDCoreJS Agent layout.

The pack is documentation-driven. Tests focus on dispatch metadata, generated mirrors, reference availability, and entrypoint compatibility.

For the claim boundaries between static checks, deterministic routing, CLI
smoke, Full E2E, and live-agent transcript evidence, see `VALIDATION.md`.

## Automated E2E Harness

Run all phases:

```bash
npm run test:e2e
```

Run text hygiene before publishing or reviewing release candidates:

```bash
npm run check:text-hygiene
```

Run one phase:

```bash
npm run test:e2e:phase1
npm run test:e2e:phase2
npm run test:e2e:phase3
npm run test:e2e:phase4
```

Run the deterministic product-contract protocol directly:

```bash
npm run test:e2e:product
```

The default E2E run keeps phase 4 in opt-in mode so pull-request feedback stays
fast. CI runs the default suite on pull requests and pushes to `main`; the
scheduled/manual `Full E2E` workflow runs phase 4 with `SDCOREJS_E2E_FULL=1`.

## Expected Inventory

- Source skills: 23
- `.claude/skills`: 23
- `.claude/_refs`: recursive canonical reference mirror, including executable `.mjs` protocols
- `plugin/skills`: 23
- `codex/skills`: 23 skill folders plus shared `_refs`
- `_refs/**/*.md`: at least 60 committed markdown refs; Core UI component docs are fetched on demand

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
- The executable product protocol and its mutation cases.

### Product contract protocol

`npm run test:e2e:product` executes active behavior rather than keyword-only
checks. Its 79 behavioral scenarios cover zero-write audit, normative
immutability, stable identity/removal/reuse, stale and row-bound evidence,
optional verification failure, E2E/UAT separation, post-write-tail ordering,
artifact roles and gap taxonomy, unapproved behavior, owned-path authorization,
closed product context, existing and collision-safe layouts, redaction,
same-slug contract isolation, implementation drift, dirty overlap,
non-destructive legacy migration, template safety, canonical test evidence,
false-ready/forbidden-write mutations, file-backed approved-spec authority,
canonical body and approval-integrity hashing, linked-ancestor rejection,
trusted current-state observation, one-shot final reauthorization for readiness
and non-ready writes, deep malformed validator/authority input handling,
file-backed UAT scenario hashes, parent-observed build identity, complete UAT
decision identity, exact evidence path manifests, closed flat row schemas,
row-bound not-applicable decisions, one-shot multi-row decision consumption,
in-gate parent observation, missing-observer rejection, approved-plan identity
through test and product evidence, final file verification of the exact
approved plan/spec chain after observer waits, plan allow/prohibit scope
binding for context and persisted paths, conservative glob containment,
fail-closed public derivation/layout boundaries, execution attestations, and
pre-write plus post-write redaction ordering. The R3 repair coverage also
brackets the exact audit execution between status observations, requires
evidence IDs for optional passed verification, binds complete normative field
hashes, redacts environment secrets plus account/government identifiers, and
executes one bounded write inside pre-write authorization. An 80th subtest
byte-compares the canonical executable reference with
`.claude/_refs`, `plugin/_refs`, and `codex/skills/_refs` after mirrors are
generated.

Prompt-routing fixtures assert all seven exact product action IDs. Generic PRD,
story, or acceptance-criteria authoring without approved authority routes to
brainstorming/spec; approved requirement changes route to change control. These
fixtures do not prove an action was executed correctly. The deterministic
validator proves policy for the data it receives; it does not prove an agent
collected complete evidence or that a host runtime enforced an operating-system
write sandbox. Local SHA-256 values prove byte consistency only while the
orchestrator and filesystem are trusted. Parent-observer callbacks are an
external trust boundary; they do not authenticate a human approver or replace a
signature or operating-system sandbox.

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
- `sdcorejs-execute-plan` asks sequential vs parallel before execution.

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

- The mixed documentation/alignment request selects `sdcorejs-product`.
- The executor classifies exactly one product action and asks one decision when
  write versus read-only intent remains ambiguous.
- A ledger write requires an approved authority source and an explicitly
  write-capable action; a generic new PRD request returns to brainstorming/spec.
- Alignment reports keep requirement, implementation, verification, and UAT
  state separate and list evidence-backed gaps.

### Design Track

```text
thiet ke man hinh quan ly lop hoc va gen png theo user stories
```

Expected:

- FE handoff work uses `sdcorejs-design`.
- The design source is written under `design/` and the ledger under `.sdcorejs/docs/design/`.
- PNG previews are treated as exports from editable specs/wireframes, not the only source of truth.

### Generic Harness

```text
execute this approved docs/config migration plan
```

Expected:

- `sdcorejs-execute-plan` detects no app track if appropriate.
- Asks sequential vs parallel.
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
