---
name: sdcorejs-auto-task-tracker
description: MANDATORY skill. Maintains a living TODO file per track. READ mode at session start to know current priorities. WRITE/EDIT mode at the end of every code-writing task (runs immediately after `sdcorejs-auto-docs`) to tick off `[x]` completed tasks and append new tasks parsed from auto-docs' "Next suggested action" or "Open questions" sections. Pairs with `sdcorejs-auto-docs` (one-session summary) and `sdcorejs-memories` (durable knowledge). Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Auto Task Tracker — Living TODO per Track

## Purpose
`auto-docs` captures what just happened. `memories` captures durable facts. Neither answers "what should I do next?". This skill maintains a single, ordered, always-current TODO list per track so the next session knows where to pick up — without re-reading every doc.

## When invoked

### Read mode — at session start (after auto-docs read ritual)
1. Resolve target root: `git rev-parse --show-toplevel`
2. Detect track
3. Read `<target-root>/.sdcorejs/tasks/<track>.md` if it exists
4. Surface to user: "X tasks open. Top 3: …"
5. If file does not exist → silent skip (don't create empty file)

### Write mode — at end of every code-writing task (after auto-docs runs)
The agent MUST run this skill (write mode) immediately after `sdcorejs-auto-docs` finishes writing the session summary. This runs for every code-writing skill invocation:
- `07-write-code` and all its sub-skills (`10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `31-actions`)
- `40-e2e-test`, `50-review-code`, `orchestration/comment-code` (level ≠ skip)

Read the auto-docs file the previous step just wrote. From it:
- Match "What was changed" items against existing open `[ ]` tasks → tick them `[x]` with timestamp
- Parse "Next suggested action" and "Open questions" → append as new open tasks
- Move stale tasks (older than 14 days, untouched) into a "Stale" section for triage

If `auto-docs` was skipped (no code-writing happened) → skip this skill too.

## Output path

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
TRACK=angular-portal            # or nestjs / nextjs
mkdir -p "$TARGET_ROOT/.sdcorejs/tasks"
FILE="$TARGET_ROOT/.sdcorejs/tasks/$TRACK.md"
```

One file per track per project. Never write to `sdcorejs-agent` repo.

## File format

```markdown
# Living TODO — <track> — <project name>

> Maintained by `sdcorejs-auto-task-tracker`. Edit by hand when needed.
> Format: `[ ]` open / `[x] (YYYY-MM-DD)` completed / `[!]` blocked.

## Now (in-flight or top priority)
- [ ] Hoàn thiện màn detail cho entity Product (validation + lookup combobox)
- [ ] Bổ sung permission code CATALOG_C_PRODUCT_BULK_DELETE

## Next (queued, ordered)
- [ ] Tạo entity Category (parent của Product)
- [ ] Wire workflow approval cho Product (gửi duyệt → phê duyệt)
- [ ] Move shared validators ra `libs/shared/validators`

## Later (someday / maybe)
- [ ] Migrate mock-data sang real API khi backend ready
- [ ] E2E coverage cho bulk action

## Blocked
- [!] Khởi tạo NestJS module — đang chờ sample code từ team

## Done (last 7 days)
- [x] (2026-05-16) Refactor `21-screen-detail` form binding sang `[form]+name=`
- [x] (2026-05-15) Add 5 _shared skills (commit, pr-create, debug, recovery, env-setup)
- [x] (2026-05-14) Mirror sync via lefthook pre-commit

## Stale (no activity >14d — triage)
- [ ] (added 2026-04-28) Review accessibility cho sd-table
```

Rules for the file:
- **One section per state.** No checkbox outside the right section.
- **Now ≤ 3 items.** If more than 3 are in-flight, focus is broken.
- **Next ordered by priority** (top = sooner).
- **Done capped at last 7 days.** Older completions get pruned (the doc history captures them).
- **Stale = open >14 days untouched** — visible reminder to defer / drop / promote.
- Match user's session language.

## Workflow — write mode

### 1. Locate the auto-docs file just written
```bash
LATEST_DOC=$(ls -t .sdcorejs/docs/$TRACK/*.md | head -1)
```

### 2. Parse the doc
Extract:
- **"What was changed"** bullets → these correspond to tasks that should be ticked off
- **"Next suggested action"** bullets → candidate new tasks
- **"Open questions / follow-ups"** bullets → candidate new tasks (often blocked)

### 3. Reconcile with existing tasks

For each "What was changed" item:
- Search the existing `[ ]` tasks (all sections except Done) for a fuzzy match
- If matched → move to Done with today's timestamp: `[x] (YYYY-MM-DD) <task text>`
- If no match → don't auto-add; the change was unplanned (still captured in the doc itself)

For each "Next suggested action":
- Check if a similar task already exists → don't duplicate
- Else append to "Next" section

For each "Open question / follow-up":
- If phrased as a blocker → "Blocked" section with `[!]`
- If phrased as a question → "Next" section as `[ ] <Câu hỏi: ...>`
- Else "Next"

### 4. Promote / demote
- If a "Next" task was referenced in the doc as "starting next" → promote to "Now"
- If "Now" has >3 items → demote the oldest back to "Next" and surface the conflict to the user (one focus per session)

### 5. Mark stale
For each `[ ]` task with no activity in 14+ days (look at the surrounding section's timestamps or git log of the file):
- Move to "Stale" section
- Prefix with `(added YYYY-MM-DD)`

### 6. Prune Done
Remove `[x]` entries older than 7 days. The git history of the file preserves them; the live file stays scannable.

### 7. Write back
Use Edit (preferred) over Write to preserve hand-edits the user made between sessions.

### 8. Report to user
One line:
> "TODO cập nhật: ✅ 2 done, ➕ 1 mới (Next), ⚠️ 0 stale."

Don't dump the full file.

## Read mode (session start)

After `auto-docs` session-start ritual:
1. Glob `.sdcorejs/tasks/<track>.md`
2. If exists, read it
3. Count items per section
4. Surface: "📋 TODO: 2 Now / 5 Next / 1 Blocked / 3 Stale. Top 3 Now: …"

Don't quote the whole file unless the user asks.

## Rules

### MUST DO
- Run write mode IMMEDIATELY after `sdcorejs-auto-docs`, not as a separate user trigger
- Match user's session language (the file's language is set by the FIRST entry)
- Cap "Now" at 3 to enforce focus
- Mark stale tasks visibly; don't silently drop them
- Use Edit, not Write, to preserve hand-edits

### MUST NOT
- Write the file to the `sdcorejs-agent` repo
- Auto-add tasks the doc didn't mention
- Re-add tasks the user manually deleted (respect their edits — if a task was removed by hand, don't resurrect it from older docs)
- Overwrite the user's section ordering
- Translate hand-written task text — leave verbatim
- Run write mode when `auto-docs` was skipped (nothing happened → nothing to track)

## Cross-track usage
For multi-track repos, one file per track:
- `.sdcorejs/tasks/angular-portal.md`
- `.sdcorejs/tasks/nestjs.md`
- `.sdcorejs/tasks/nextjs.md`

At session start, read all of them in parallel; surface a combined banner if more than one has open Now items.

## Anti-patterns
- Auto-resurrecting tasks the user deleted by hand
- Letting "Now" balloon to 10+ items (no focus, no signal)
- Writing the file to the agent repo instead of the target project
- Translating user-authored text (their language, their text)
- Pruning Done items the SAME day they were ticked (gives no sense of velocity)
- Surfacing the whole file at session start (just the counts + top 3)
- Adding tasks from non-doc sources (chat history, memory) — keep auto-docs as the single source for auto-additions; manual additions are fine
