---
name: sdcorejs-memories
description: MANDATORY skill for durable cross-session knowledge across SDCoreJS tracks. Different from `auto-docs` — auto-docs captures one-session summaries, memories captures facts that should persist (project conventions, stakeholder constraints, recurring anti-patterns, external references). READ mode runs at session start (load relevant memories as authoritative context). WRITE mode runs when the user says "ghi nhớ", "remember this", "lưu vào memory", OR when the agent detects a user correction, a recurring constraint, or a non-obvious project decision. Triggers - "ghi nhớ", "remember this", "lưu memory", "save this for later", "lần sau nhớ", "from now on", "đừng quên". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob
---

# Memories — Durable Cross-Session Knowledge

## Purpose
Auto-docs is per-session; memories are durable. When something the user tells the agent will still matter three sessions from now — a convention, a stakeholder constraint, a domain fact, a recurring anti-pattern — write it as a memory so future sessions read it as authoritative context.

Shared across SDCoreJS tracks (`angular`, `nestjs`, `nextjs`). Substitute `<track>` with the active track name.

## When invoked

### READ mode (session start)
At session start in a target project, the agent MUST:
1. Resolve `TARGET_ROOT = git rev-parse --show-toplevel` from user CWD
2. Glob `<TARGET_ROOT>/.sdcorejs/memories/<track>/*.md` for the active track
3. Read each file's frontmatter only (cheap)
4. Load bodies on demand when the trigger description matches the current task
5. Treat loaded memories as authoritative context — defer to them over generic skill defaults

Also read the track-agnostic index `<TARGET_ROOT>/.sdcorejs/memories/MEMORY.md` if present — it gives one-line hooks for cross-track lookup.

### WRITE mode (explicit or detected)
Write a memory when ANY of these is true:
- User explicitly says: "ghi nhớ", "remember this", "lưu vào memory", "save this", "từ giờ", "from now on", "đừng quên"
- The agent detects (a) the user CORRECTING the agent with a reason that will recur, (b) the user mentioning a constraint that applies beyond this session, (c) a non-obvious project-specific decision worth recalling

Before writing, the agent MUST check whether an existing memory covers the same topic — if so, update it instead of creating a duplicate.

## Memory types

Mirror the agent-author's auto-memory categories. Pick exactly one type per memory:

- `user` — the user's role, preferences, knowledge level, working style. Example: "User is a senior Angular dev, prefers code over explanations." Long-lived.
- `feedback` — corrections + confirmations of approaches. Example: "User rejected side-drawer for product detail; preferred full-page with anchor v2 because of >8 fields." Survives until contradicted.
- `project` — ongoing work, goals, stakeholders, deadlines. Decays fast — review/prune each major milestone. Example: "Portal `portal-shop` targets QC env by 2026-06-30; product owner Linh."
- `reference` — external system pointers. Example: "Tickets in Jira project SHOP; design lives in Figma file abc123."

## Output path

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
TRACK=angular   # or nestjs | nextjs

mkdir -p "$TARGET_ROOT/.sdcorejs/memories/$TRACK"
FILE="$TARGET_ROOT/.sdcorejs/memories/$TRACK/<short-kebab-slug>.md"
```

Slug rule: 2-5 kebab words capturing the durable topic. Examples:
- `prefer-anchor-v2-for-long-forms.md`
- `vietnamese-portal-label-style.md`
- `jira-project-shop.md`
- `stakeholder-linh-product-owner.md`

## Output content template

```markdown
---
name: <kebab-slug>
description: One-line hook used by future sessions to decide whether to load this body. Use "When deciding ...", "When the user asks about ...".
type: feedback              # user | feedback | project | reference
track: angular       # optional; omit if memory is track-agnostic
---

# <Title>

<2-6 sentence statement of the durable fact.>

**Why:** <One-line rationale — without this, future-you cannot judge when the rule still applies.>

**How to apply:** <One concrete instruction the next session can follow, e.g. "When the user requests a detail page with >6 fields and any textarea, default to UnifiedSplit + sd-anchor instead of side-drawer.">
```

The `**Why:**` and `**How to apply:**` lines are MANDATORY for types `feedback` and `project`. Optional but encouraged for `user` and `reference`.

## Track-agnostic index

After writing a memory, append one line to `<TARGET_ROOT>/.sdcorejs/memories/MEMORY.md` (create the file if missing):

```markdown
- [Prefer anchor v2 for long forms](angular/prefer-anchor-v2-for-long-forms.md) — when detail page has >6 fields, use anchor v2 not side-drawer
```

Format: `- [Title](<track>/file.md) — short hook`. One line per memory, grouped by track if helpful.

## What NOT to save
- Code patterns or conventions already documented in skill files (derivable from `skills/<track>/*.md`)
- File paths derivable by globbing the target project
- Ephemeral session state (the user's current question, today's TODO) — that belongs in `auto-docs`
- Anything the user explicitly says is one-off

## Rules

### MUST DO
- Check for existing memory on the same topic BEFORE writing a new one — update beats duplicate
- Include `**Why:**` and `**How to apply:**` for `feedback` and `project` types
- Use the lightest type that fits — prefer `reference` over `project` if it's just a pointer
- Match the user's language for the body (VI request → VI body); keep frontmatter keys English
- Append to `.sdcorejs/memories/MEMORY.md` index after every WRITE
- Resolve `TARGET_ROOT` via git — never write to `sdcorejs-agent`

### MUST NOT
- Write memories in the `sdcorejs-agent` repo
- Load all memory bodies upfront — frontmatter only at session start, bodies on demand
- Create duplicates — search the existing index first
- Save anything that's just a restatement of an existing skill rule
- Save secrets, tokens, or PII

## Anti-patterns
- Writing memories without `**Why:**` — future-you cannot judge edge cases and will misapply the rule
- One memory file per user message (memory becomes noise, not signal)
- Saving the same fact under two different slugs (confuses lookup)
- Eager-loading every memory body at session start (defeats the on-demand-load design)
- Writing memory bodies in the agent repo instead of the target project
- Mixing per-session info (belongs in auto-docs) with durable info (belongs here)

## Pairing with auto-docs

| Concern | auto-docs | memories |
|---|---|---|
| Lifetime | One session | Many sessions |
| Path | `.sdcorejs/docs/<track>/` | `.sdcorejs/memories/<track>/` |
| Filename | `YYYY-MM-DD-HH-mm-<topic>.md` | `<topic-slug>.md` (no timestamp) |
| Write trigger | End of code-writing skill | User says "ghi nhớ" / agent detects durable fact |
| Read at session start | Last 3 by timestamp | All frontmatter, bodies on demand |
| Updates over time | Never (append-only history) | Yes — update beats duplicate |

## Claude Code memory mirror

When the agent is running specifically inside **Claude Code** (not Codex, Cursor, Copilot, or other CLI/IDE hosts), the skill ALSO writes a byte-identical copy of every memory file to Claude Code's per-project memory directory. This piggybacks on Claude Code's built-in auto-memory feature so memories surface automatically in future Claude Code sessions without depending on the session-start glob.

### Mirror location

Claude Code stores per-project state under:

```
~/.claude/projects/<encoded-cwd>/memory/
```

The `<encoded-cwd>` is the lowercased absolute current working directory with path separators replaced by dashes. Examples:
- macOS / Linux cwd `/Users/foo/work/portal-shop` → `-Users-foo-work-portal-shop`
- Windows cwd `C:\Users\foo\work\portal-shop` → `c--Users-foo-work-portal-shop` (drive letter colon also becomes a dash)

### How to locate the directory

The encoding rule above is the spec, but Claude Code may have already created the folder. Prefer discovery over recomputation:

```bash
# 1) Compute a short-name hint from the current project (e.g. last path segment)
SHORT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')

# 2) Glob the most-recently-modified candidate dir
CANDIDATE=$(ls -dt ~/.claude/projects/*${SHORT_NAME}*/memory/ 2>/dev/null | head -n 1)

# 3) On Windows, prefix may be `c--`; the glob above still matches via the short name
```

If no candidate matches, fall through to the computed `<encoded-cwd>` and create the dir.

### Write rules

- **Best-effort, never blocking.** If `~/.claude/projects/` does not exist (Codex / Copilot / Cursor / generic shell), the agent SKIPS this mirror silently. Do NOT error or warn the user.
- **Byte-identical copy.** The mirror file content must match the canonical `.sdcorejs/memories/<track>/<slug>.md` exactly — same frontmatter, same body. Use file copy, not regeneration.
- **Filename.** Same kebab slug as the canonical file: `<kebab-slug>.md`. Do NOT add a track prefix to the filename (track info already lives in frontmatter).
- **Index mirror.** If `~/.claude/projects/<encoded-cwd>/memory/MEMORY.md` exists, append the same one-line entry that was appended to the canonical `.sdcorejs/memories/MEMORY.md`. If it doesn't exist, create it with the same format.

### Detection heuristic

Detect Claude Code by the presence of `~/.claude/projects/` (with at least one subdirectory). This is the cheapest reliable signal; environment variables like `CLAUDE_CODE` are not guaranteed.

### Anti-patterns specific to the mirror

- Writing the mirror but NOT the canonical `.sdcorejs/memories/<track>/<slug>.md` — the canonical file is the source of truth; the mirror is an opportunistic copy
- Letting a mirror write failure block the canonical write — canonical first, mirror after, swallow mirror errors
- Regenerating the body in the mirror (drift risk) — always copy from the canonical file
- Mirroring to a stale `<encoded-cwd>` directory belonging to a different project — verify the directory's most-recent mtime matches an active Claude Code session

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
