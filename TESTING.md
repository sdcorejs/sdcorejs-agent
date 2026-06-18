# Testing the SDCoreJS SDLC Agent

Repository-level tests for the current 27-skill SDCoreJS Agent layout.

The pack is documentation-driven. Tests focus on dispatch metadata, generated mirrors, reference availability, and entrypoint compatibility.

## Automated E2E Harness

Run all phases:

```bash
npm run test:e2e
```

Run one phase:

```bash
npm run test:e2e:phase1
npm run test:e2e:phase2
npm run test:e2e:phase3
npm run test:e2e:phase4
```

## Expected Inventory

- Source skills: 27
- `.claude/skills`: 27
- `plugin/skills`: 27
- `codex/skills`: 27 skill folders plus shared `_refs`
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

## Mirror Sync

```bash
npm run sync:skills
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

- Product/PO docs use `sdcorejs-product`.
- The ledger is written under `.sdcorejs/docs/product/`.
- The report maps requirement, implementation, and test evidence and lists real gaps.

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
