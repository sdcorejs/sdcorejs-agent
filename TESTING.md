# Testing the SDCoreJS SDLC Agent

Manual and repository-level tests for the current 42-skill SDCoreJS Agent layout.

The agent is documentation-driven: there is no runtime server or compiler. Testing focuses on dispatch metadata, mirror sync, reference availability, and fresh-session behavior in Claude Code, Copilot, Codex, and Cursor.

## Prerequisites

Use a fresh session in one of:

- Claude Code: reads `CLAUDE.md` and native `.claude/skills/<name>/SKILL.md`.
- GitHub Copilot: reads `.github/copilot-instructions.md` and `.github/chatmodes/sdcorejs.chatmode.md`.
- Codex / Cursor / OpenAI Agents SDK: reads `AGENTS.md`.

For target-project tests, install both `skills/` and `_refs/`. Skills open `_refs/**` at runtime.

Recommended submodule install:

```bash
cd <target-project>
git submodule add <this-repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills
ln -s .sdcorejs-agent/_refs _refs
```

Direct copy:

```bash
cp -r <this-repo>/{CLAUDE.md,AGENTS.md,skills,_refs} ./
```

Claude plugin install uses `plugin/skills/**` and `plugin/_refs/**`.

## Repository Checks

Run these in `sdcorejs-agent`.

### Inventory

Expected:

- Source skills: 42
- `.claude/skills`: 42
- `plugin/skills`: 42
- `_refs/**/*.md`: 147

PowerShell:

```powershell
$src = Get-ChildItem -Recurse -File -Path skills -Filter *.md |
  Where-Object { $_.Name -ne '_README.md' }
$claude = Get-ChildItem -Recurse -File -Path .claude\skills -Filter SKILL.md
$plugin = Get-ChildItem -Recurse -File -Path plugin\skills -Filter SKILL.md
$refs = Get-ChildItem -Recurse -File -Path _refs -Filter *.md
[PSCustomObject]@{
  SourceSkills = $src.Count
  ClaudeMirror = $claude.Count
  PluginMirror = $plugin.Count
  RefDocs = $refs.Count
}
```

### Frontmatter

Expected:

- Every source skill has `name:` and `description:`.
- Every `name:` is kebab-case.
- No duplicate `name:` values.

PowerShell:

```powershell
$items = Get-ChildItem -Recurse -File -Path skills -Filter *.md |
  Where-Object { $_.Name -ne '_README.md' } |
  ForEach-Object {
    $lines = Get-Content $_.FullName -TotalCount 20
    $name = ($lines | Where-Object { $_ -match '^name:' } | Select-Object -First 1) -replace '^name:\s*',''
    $desc = ($lines | Where-Object { $_ -match '^description:' } | Select-Object -First 1) -replace '^description:\s*',''
    [PSCustomObject]@{ Path=$_.FullName; Name=$name; HasDescription=($desc.Length -gt 0); Kebab=($name -match '^[a-z0-9-]+$') }
  }
$items | Group-Object Name | Where-Object Count -gt 1
$items | Where-Object { -not $_.Kebab -or -not $_.HasDescription }
```

### Entrypoint Drift

Expected:

- No entrypoint uses `skills/*/*.md`.
- Entrypoints mention `skills/**/*.md`.
- README install docs use real `skills` and `_refs` names, not aliases.
- Copilot docs reference top-level `_refs/**`, not old `skills/.../_refs/**`.
- Workflows include `write-user-guide` after `auto-docs`.
- Angular summaries mention 7 packs including `admin-screens`.
- NestJS summaries mention 5 packs including `init-admin`.
- Orchestration count is 19.

```powershell
rg -n "skills/\*/\*.md|skills-sdcorejs|_refs-sdcorejs|skills/shared/sdlc/_refs|skills/tracks/angular/_refs|angular-onboarding|00-onboarding|18 files" CLAUDE.md AGENTS.md README.md .github
rg -n "skills/\*\*/\*.md|admin-screens|init-admin|write-user-guide|19 files" CLAUDE.md AGENTS.md README.md .github skills/tracks
```

### Mirror Sync

Linux, macOS, Git Bash, or WSL:

```bash
npm run check:skills
```

Windows PowerShell:

```powershell
npm run check:skills:ps
```

Known current issue: `check:skills:ps` fails in check mode with `Unknown flag: -` until `.claude/sync-skills.ps1` flag forwarding is fixed. Sync mode works:

```powershell
powershell -ExecutionPolicy Bypass -File .claude\sync-skills.ps1
```

## Smoke Tests in Fresh AI Sessions

Run these from this repo first, then repeat in a real Angular/NestJS/Next.js target project.

### 1. Skill Listing

Prompt:

```text
what skills do you have?
```

Expected:

- Agent invokes or follows `sdcorejs-using-skills`.
- Mentions cross-track workflow: brainstorm -> clarify -> spec -> plan -> write-code -> test/review -> ship.
- Mentions Angular, NestJS, Next.js track write-code skills.
- Mentions `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, and `.sdcorejs/memories/`.

### 2. Vietnamese Onboarding

Prompt:

```text
agent nay lam duoc gi?
```

Expected:

- Reply language follows the user.
- Explains the SDLC flow.
- Offers a concrete next step.
- Does not claim there are old `angular-onboarding` or numbered track onboarding skills.

### 3. Brainstorm Dispatch

Prompt:

```text
toi dang phan van giua side-drawer va full-page detail cho entity user, nen dung cai nao?
```

Expected:

- Dispatches `sdcorejs-brainstorm`.
- Presents 2-3 approaches with tradeoffs and a recommendation.
- Does not write code.

### 4. Clarify-Before-Code

Prompt:

```text
them entity product
```

Expected:

- Dispatches `sdcorejs-clarify-requirements`.
- Asks blocking questions for track/module/entity/fields/scope.
- Does not generate files.

### 5. Angular Write-Code Dispatch

Prompt:

```text
khoi tao portal-shop voi env dev/qc/uat/prod
```

Expected:

- Dispatches `angular-write-code`.
- Recognizes `init-portal` and the always-on `admin-screens` pack.
- Uses `_refs/angular/write-code/init-portal.md` and `_refs/angular/write-code/admin-screens.md` on demand.
- Writes only to the target project, not `sdcorejs-agent`.

### 6. NestJS Write-Code Dispatch

Prompt:

```text
scaffold a nestjs backend
```

Expected:

- Dispatches `nestjs-write-code`.
- Uses `init-project` and always-on `init-admin`.
- Mentions one NestJS app plus one Postgres as the modular-monolith default.
- Uses `@sdcorejs/nestjs` imports documented in `_refs/nestjs/core-catalog.md`.

Prompt:

```text
add a products module with a product entity
```

Expected:

- Dispatches `nestjs-write-code`.
- Uses `init-module` and `init-entity`.
- Requires auth/permission wiring via the admin module.
- Uses Zod validation, not `class-validator`.

### 7. Next.js Write-Code Dispatch

Prompt:

```text
build a bilingual landing site with SEO, contact form, and OG preview
```

Expected:

- Dispatches `nextjs-write-code`.
- Loads only needed packs from `_refs/nextjs/build-website/write-code/`.
- Covers i18n, SEO, contact-form, and og-preview.

### 8. Approval Gates

Setup: get to a drafted spec or plan.

Prompt:

```text
go ahead
```

Expected:

- If spec is not approved, routes through `sdcorejs-review-spec`.
- If plan is not approved, routes through `sdcorejs-review-plan`.
- Approval must be explicit before write-code starts.
- On approval, `auto-specs` or `auto-plans` snapshots to the target project's `.sdcorejs/` tree.

### 9. Persona Ask-Once

Setup: target project has no `.sdcorejs/persona.md`.

Prompt:

```text
help me build a simple inventory management app
```

Expected:

- Dispatches `sdcorejs-persona` before substantive work.
- Writes `.sdcorejs/persona.md`.
- Later sessions read it silently and adapt tone/defaults.

### 10. Tail Chain

Setup: complete a small write-code task in a target project.

Expected tail sequence:

1. `sdcorejs-test`
2. `sdcorejs-review`
3. `sdcorejs-repair-loop` if findings exist
4. `sdcorejs-comment-code` ask gate
5. `sdcorejs-verify-before-done`
6. `sdcorejs-branch-ready`
7. `sdcorejs-auto-docs`
8. `sdcorejs-write-user-guide`
9. `sdcorejs-auto-task-tracker`
10. `sdcorejs-memories` only when durable knowledge surfaced

Pass criteria:

- No "done" claim before verification.
- Auto-docs writes to `<target>/.sdcorejs/docs/<track>/`.
- User guide updates `<target>/.sdcorejs/user-guide/<module>.md`.
- Task tracker updates `<target>/.sdcorejs/tasks/<track>.md`.
- Nothing is written into `sdcorejs-agent/.sdcorejs/`.

## Target Project E2E Tests

Run these in a real target project that has installed `skills/` and `_refs/`.

### E2E-1: Auto-Docs Path

Prompt: ask the agent to add a small feature and let it complete.

Pass criteria:

- New file appears under `<target>/.sdcorejs/docs/<track>/`.
- File name uses `YYYY-MM-DD-HH-mm-<topic>.md`.
- Contents include request, changed files, decisions, verification, and next steps.
- No doc is written under this `sdcorejs-agent` repo.

### E2E-2: Approved Spec and Plan Snapshots

Prompt: walk through clarify -> spec -> review-spec approval -> plan -> review-plan approval.

Pass criteria:

- Approved spec snapshot appears under `<target>/.sdcorejs/specs/<track>/`.
- Approved plan snapshot appears under `<target>/.sdcorejs/plans/<track>/`.
- The files are written only after explicit approval.

### E2E-3: Memories

Prompt:

```text
remember that this project always uses kebab-case route paths
```

Pass criteria:

- Memory appears under `<target>/.sdcorejs/memories/<track>/` or a shared memory bucket.
- Memory frontmatter is present.
- Later session can apply the rule without being reminded.

### E2E-4: Session Recovery

Close the AI tool. Reopen in the same target project.

Prompt:

```text
what was I working on?
```

Pass criteria:

- Agent references latest `.sdcorejs/docs/<track>/` entries.
- Agent incorporates relevant memories.
- Agent does not invent work not present in docs/memories.

## Triage

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Agent answers generically | Entrypoint missing or not read | Ensure `CLAUDE.md`, `AGENTS.md`, or Copilot instructions are at target root |
| Skill list misses track write-code skills | Shallow glob still used | Replace `skills/*/*.md` with `skills/**/*.md` |
| Skill opens a missing reference | `_refs/` not installed or wrong name | Install/symlink top-level `_refs` |
| Claude mirror is stale | Sync was not run after editing `skills/` | Run `npm run sync:skills` from Git Bash/WSL or fix/run the PowerShell wrapper |
| `npm run check:skills` fails on Windows | No `bash` on PATH | Use Git Bash/WSL, or use/fix `check:skills:ps` |
| Approval gate skipped | Review-spec/review-plan not invoked | Recheck `sdcorejs-review-spec` and `sdcorejs-review-plan` descriptions and body instructions |
| Auto-docs writes to agent repo | Target root detection failed | Re-run with explicit target project root and verify `.sdcorejs/docs/<track>/` |

## When to Update This File

Update `TESTING.md` whenever:

- A skill is added, removed, or renamed.
- A skill `description:` changes enough to affect dispatch.
- Reference pack paths change.
- Install instructions change.
- The mandatory tail chain changes.
- A new tool surface is supported.
- Mirror sync scripts or platform-specific validation commands change.
