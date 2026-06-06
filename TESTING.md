# Testing the SDCoreJS SDLC Agent

> Manual tests to run in fresh AI coding tool sessions. Validates that skills dispatch correctly per stated triggers.

## Prerequisites

A fresh session in one of:

- **Claude Code** (primary target — reads `CLAUDE.md` + native `.claude/skills/`)
- **GitHub Copilot** in VS Code (reads `.github/copilot-instructions.md` + chatmode)
- **Codex / Cursor / OpenAI Agents SDK** (reads `AGENTS.md`)

Run tests in **this repo** (`sdcorejs-agent`) first for smoke testing, then in a real target portal project for E2E.

## Smoke tests (in this repo)

### Test 1 — Skill listing

Prompt: `what skills do you have`

Expected: Agent lists ~21 skills grouped by workflow (00→52), or invokes `angular-onboarding` skill which renders the workflow diagram + skill list.

Pass criteria:
- Mentions at least 5 skills by name
- Mentions the workflow stages (clarify → spec → plan → code)
- Mentions both `.sdcorejs/docs/` and `.sdcorejs/memories/` paths
- Output language matches request (EN here)

### Test 2 — Vietnamese onboarding

Prompt: `agent này làm được gì`

Expected: Agent invokes `angular-onboarding` and replies in Vietnamese.

Pass criteria:
- Reply is in Vietnamese with full diacritics
- Lists workflow stages in VN ("làm rõ yêu cầu", "lên kế hoạch", "viết code")
- Suggests a concrete next step ("Hãy mô tả X để bắt đầu")

### Test 3 — Direct skill dispatch (open-ended)

Prompt: `tôi đang phân vân giữa side-drawer và full-page detail cho entity user, nên dùng cái nào?`

Expected: Agent invokes `sdcorejs-brainstorm` (cross-track; detects angular and loads `_refs/angular.md`), presents 2-3 approaches with tradeoffs, recommends one. Does NOT directly write code.

Pass criteria:
- Mentions multiple approaches (side-drawer vs full-page)
- Lists pros/cons of each
- Recommends one with reasoning
- Asks for confirmation before proceeding

### Test 4 — Clarify-before-code blocking

Prompt: `thêm entity product`

Expected: Agent invokes `sdcorejs-clarify-requirements` (cross-track; loads `_refs/angular.md`) because module / fields / scope are unspecified. Asks blocking questions.

Pass criteria:
- Does NOT generate code
- Asks about: module ownership, key fields, screen scope (list / detail / create / update)
- Bilingual: VN trigger → VN questions

### Test 5 — Portal init dispatch

Prompt: `khởi tạo portal-shop với env dev/qc/uat/prod`

Expected: Agent invokes the `angular-write-code` orchestrator (which loads the `init-portal` reference pack from `_refs/angular/write-code/`). May still clarify some details but should NOT ask "what is portal-shop" or "which framework".

Pass criteria:
- Recognizes "portal-shop" as portal name
- Recognizes the 4 envs
- References Core UI / `@sdcorejs/angular` baseline template
- Proposes a plan or directly invokes init steps

### Test 6 — Approval gate

Setup: walk through test 5 until plan is ready, then ask `proceed with implementation`.

Expected: Agent invokes `sdcorejs-review-plan` (cross-track) before `angular-write-code`. Agent should NOT generate code without your explicit "OK".

Pass criteria:
- Plan shown and approval requested
- Code is NOT generated until explicit "OK"/"approved"/"proceed"

### Test 7 — Persona ask-once

Setup: a target project with NO `.sdcorejs/persona.md`. Prompt: `giúp mình làm phần mềm quản lý kho`

Expected: Agent invokes `sdcorejs-persona` and asks the technical-vs-plain question BEFORE doing other work, then writes `.sdcorejs/persona.md`.

Pass criteria:
- Asks the 2-option persona question once, in the request's language
- After the choice, a `.sdcorejs/persona.md` file exists with `persona: tech|non-tech` frontmatter
- Re-prompting in the same project does NOT re-ask (reads the stored flag silently)
- With `persona: non-tech`, later output avoids unexplained jargon, asks about features + screens (never modules/entities/architecture)

### Test 8 — Infra packaging

Prompt: `đóng gói app này để chạy bằng docker`

Expected: Agent dispatches `sdcorejs-dockerize`.

Pass criteria:
- Proposes/writes a deploy root containing `docker-compose.yml` with 4 services (postgres / keycloak / backend / frontend)
- Output lands in the TARGET project's deploy root, NOT in this `sdcorejs-agent` repo

Prompt: `thêm đăng nhập keycloak cho app`

Expected: Agent dispatches `sdcorejs-auth`.

Pass criteria:
- Wires `provideSdKeycloak` on the FE + Keycloak env on the BE
- Reports the demo login `demo` / `demo`

Prompt: `viết hướng dẫn chạy cho người không rành kỹ thuật`

Expected: Agent dispatches `sdcorejs-run-guide`.

Pass criteria:
- Emits a jargon-free `START.md`: install Docker → `docker compose up` → http://localhost:4200 → demo / demo

## E2E tests (in a real target portal project)

### Setup

Clone a target Angular portal project (one that uses `@sdcorejs/angular`). Then:

```bash
cd <target-portal-project>

# Option A: git submodule (recommended)
git submodule add <this-repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
cp -r .sdcorejs-agent/.claude .

# Option B: direct copy
cp -r <this-repo>/{CLAUDE.md,AGENTS.md,.claude} ./
cp -r <this-repo>/skills ./skills-sdcorejs
```

### Test E2E-1 — Auto-docs writes to correct path

Prompt: ask the agent to add an entity (any). Let it complete.

Expected: A new file appears at `<target-project>/.sdcorejs/docs/angular/<timestamp>-<topic>.md`. Open and inspect it.

Pass criteria:
- File is in target project, NOT in this `sdcorejs-agent` repo
- Path uses `.sdcorejs/docs/angular/` (note leading dot)
- Filename uses `YYYY-MM-DD-HH-mm-<topic>.md`
- Contents include: what was requested, what changed (file list), decisions, next steps

### Test E2E-2 — Memories on durable knowledge

Prompt: `ghi nhớ rằng team mình luôn dùng kebab-case cho route, không bao giờ dùng camelCase`

Expected: Agent invokes `sdcorejs-memories` and writes a memory file.

Pass criteria:
- File appears at `<target-project>/.sdcorejs/memories/angular/<slug>.md` (or shared root if track-agnostic)
- Frontmatter has `name`, `description`, `type: feedback` (corrections + preferences), body has `**Why:**` and `**How to apply:**` lines
- If running in Claude Code: also appears at `~/.claude/projects/<encoded-cwd>/memory/<slug>.md`

### Test E2E-3 — Session-start ritual

Close the AI tool. Reopen it in the same target project.

Expected: Agent should read latest `.sdcorejs/docs/angular/*.md` entries silently before answering anything. Test by asking `what was I working on?` — agent should reference the topics from the latest doc.

Pass criteria:
- Agent references prior work without you mentioning it
- Citations should match actual content of latest docs

## Triage — common issues

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Agent doesn't dispatch any skill, just answers generically | Entry-point file (CLAUDE.md / etc.) not found in cwd | Verify `CLAUDE.md` is at target project root |
| Agent dispatches wrong skill | Description triggers don't match user's phrasing | Edit the skill's `description` frontmatter to add the missing trigger keywords |
| Auto-docs writes to `sdcorejs-agent` instead of target | Agent confused about cwd | Add explicit reminder in `_shared/auto-docs.md` to use `git rev-parse --show-toplevel` to find target root |
| `formControlName` keeps getting generated | Agent reading stale memory or example | Verify `_refs/angular/write-code/screen-detail.md` + `_refs/templates/screen-detail-component.md` + `_refs/templates/reactive-form-templates.md` all use `[form]+name=` pattern, not `formControlName=` |
| Skills not visible to Claude Code | `.claude/skills/` not mirrored | Run `bash .claude/sync-skills.sh` (or manually `cp skills/angular/<N>-<name>.md .claude/skills/angular-<name>/SKILL.md`) |
| Approval gate skipped | Skill body of `04-review-spec` / `06-review-plan` not blocking | Verify their `description` mentions "approval required" and body says "Wait for explicit user approval" |

## When to update tests

Update `TESTING.md` whenever:
- A new skill is added (add a smoke test prompt for its triggers)
- A skill's `description` changes (add the new trigger keywords as a smoke test)
- Auto-docs / memories path conventions change (update E2E tests)
- A new tool is supported (Cursor, Aider, etc. — add to prerequisites)
