---
name: sdcorejs-recovery
description: Use when the user says "tiếp tục", "tiếp tục công việc", "resume", "continue where we left off", "what was I doing", "where did we stop", or opens a session after a break and needs to rebuild context. Reads the latest auto-docs + memories + git state + task tracker and produces a one-screen handoff summary. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob
---

# Recovery — Resume After a Break

## Purpose
The hardest part of returning to work after hours or days away is rebuilding context. This skill produces a compact handoff: what was done last, what's still open, what's likely next. The agent reads — the user decides.

## When invoked
- "tiếp tục", "tiếp tục công việc", "resume", "where were we", "what was I doing"
- Opening a session in a target project after a gap (>1 day since last commit OR >latest doc is >1 day old)
- After a context reset / compaction
- Explicit: "recovery skill"

Do NOT invoke if:
- The user is starting brand-new work (no prior docs exist for the track)
- The user just finished a task in the same session (context is fresh)
- The session has been continuous (no break)

## Workflow

### 1. Resolve target root + track (parallel)
```bash
git rev-parse --show-toplevel                    # target project root
git rev-parse --abbrev-ref HEAD                  # current branch
```
Detect track:
- If `angular.json` exists at root → angular-portal
- If `nest-cli.json` exists → nestjs
- If `next.config.js` / `next.config.ts` exists → nextjs
- If `skills/<track>/` is the repo (sdcorejs-agent itself) → skip target-project reads, use repo state only

### 2. Pull state (parallel)
```bash
# Recent docs (last 3, newest first)
ls -1t .sdcorejs/docs/<track>/*.md 2>/dev/null | head -3

# All memory frontmatter
ls -1 .sdcorejs/memories/<track>/*.md 2>/dev/null

# Living TODO (if sdcorejs-auto-task-tracker has written one)
cat .sdcorejs/tasks/<track>.md 2>/dev/null

# Git activity
git log -10 --oneline
git status --short
git diff --stat HEAD~1 2>/dev/null
```

### 3. Read content (sequential, only what was found in step 2)
- Each of the 3 latest docs → extract: "What was changed", "Open questions", "Next suggested action"
- Each memory file → frontmatter only (`name`, `description`, `type`)
- Living TODO → unchecked items `[ ]` only
- Recent commits → subject lines

### 4. Produce the handoff (one screen, in user's language)

Use this layout:

```markdown
## Đã đọc context (3 doc + N memories)

### Lần làm việc gần nhất — <timestamp from latest doc>
**Đã làm:** <1-2 sentence synthesis from "What was changed">
**Còn mở:** <bullets from "Open questions" if any>
**Suggest tiếp:** <verbatim "Next suggested action" or synthesized>

### Bối cảnh thêm
- Branch: `<branch>` (<N commits ahead of main, M files changed locally>)
- Memory hiện có: <comma-separated memory names>
- Living TODO (<file>): N unchecked / M total — top 3:
  - [ ] ...
  - [ ] ...
  - [ ] ...

### Bạn muốn gì tiếp theo?
- Tiếp tục từ "<suggest tiếp>" ?
- Mở task mới?
- Xem chi tiết một doc cụ thể? (gõ filename)
```

(EN equivalent if user's session language is English.)

### 5. Wait for direction
DO NOT proactively start the next step. The user reads the summary, decides, and gives the go-ahead. Recovery is a *briefing*, not an instruction.

## Edge cases

### No docs found
```
Không có .sdcorejs/docs/<track>/ trong project này. Đây là lần đầu? Bạn muốn:
- Onboard từ đầu (mình invoke `<track>-onboarding`)
- Skip, bắt đầu task mới luôn
```

### Docs exist but >30 days old
Surface the gap explicitly: "Doc gần nhất là 2026-04-01, cách 45 ngày — có thể đã outdate. Cần verify gì trước khi tiếp?"

### Git state inconsistent with docs
Doc says "completed entity Product" but `git log` doesn't show the commit. Flag it:
"Doc nói entity Product đã xong nhưng git log không có commit liên quan. Code đã commit lên branch khác? Hoặc revert?"

### Branch is `main`/`master`
Warn: "Đang đứng trên `main` — chưa branch ra. Tạo feature branch trước khi tiếp?"

### Memory + doc conflict
Memory says X, latest doc implies not-X. Surface both, ask user which is current.

## Rules

### MUST DO
- Read in parallel where possible (step 2 commands are independent)
- Only summarize what was found — do not invent state
- Surface git/doc/memory conflicts explicitly
- Match user's session language
- End with a question — recovery is a handoff, not an action
- Keep the handoff to ONE screen (truncate if needed; user can ask for detail)

### MUST NOT
- Start working on the next task automatically — wait for user direction
- Read >3 docs (older ones are usually less relevant; user can ask for more)
- Read full memory bodies — frontmatter is enough at this stage
- Modify any files
- Run `git pull` / `git fetch` / `npm install` without asking
- Hallucinate context from skill names without reading the actual doc

## Anti-patterns
- Producing a 3-page handoff that nobody reads
- Reading the same doc twice (don't re-glob inside the skill)
- Auto-resuming work without confirmation — user may have changed priorities
- Skipping git state because docs were found — git is the ground truth for code
- Treating memory frontmatter as authoritative without checking the body when it matters
- Recovery for fresh sessions where there's nothing to recover (use `<track>-onboarding` instead)

## Cross-track usage
The skill applies identically to angular-portal, nestjs, nextjs. The only differences are detection in step 1 and the `<track>` segment in step 2 paths.

For multi-track repos, prompt:
"Repo có cả <track-a> và <track-b>. Bạn muốn recovery cho track nào, hay cả hai?"
