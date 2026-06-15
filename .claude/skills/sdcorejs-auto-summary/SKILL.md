---
name: sdcorejs-auto-summary
description: MANDATORY project-brief skill. Owns the single canonical `.sdcorejs/summary.md` — an evergreen "what this project IS" snapshot (domain, stack, architecture map, conventions, reuse cheatsheet). Use BEFORE any substantive work in a target project: if missing it MUST be generated first (delegate the scan to `sdcorejs-code-map`, then distill); if present it is read at session start to load project context cheaply. Also runs in WRITE mode right after a new project/module is initialized, and refreshes when the recorded git HEAD has drifted. Distinct from `sdcorejs-auto-docs` (per-session deltas) — this is the one stable project overview. Triggers - session start in a target project, about to run `write-code`, user asks "project summary", "project summary", "what is this project", "overview", "what is this project". Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Auto-Summary — Canonical Project Brief

## Purpose
One stable, evergreen file per project — `.sdcorejs/summary.md` — that answers **"what IS this project"**: its domain, stack, architecture map, conventions, and what to reuse. Without it, every session and every code-writing skill starts blind, re-scans from scratch, and risks hallucinating structure.

This is the project's *identity card*. It is deliberately different from the rest of the `.sdcorejs/` family:

| File | Question it answers | Lifecycle |
|---|---|---|
| **`.sdcorejs/summary.md`** (this skill) | "What IS this project" | one canonical file, refreshed on drift |
| `.sdcorejs/docs/<track>/*.md` (`auto-docs`) | "What was DONE this session" | many timestamped deltas |
| `.sdcorejs/plans/`, `/specs/` | approved plans/specs | corpus over time |
| memories | durable cross-session facts | scattered notes |

This skill is shared across SDCoreJS tracks (`angular`, `nestjs`, `nextjs`). Substitute the active `<track>` when resolving paths.

## Relationship to `sdcorejs-code-map` (important — do NOT duplicate)

`code-map` is the **discovery engine**: read-only, ephemeral, produces a detailed chat report, never writes a file. `auto-summary` is the **artifact owner**: it *consumes* code-map's scan and **distills** it into the persisted `summary.md`, then gates work on its existence.

So in WRITE mode this skill does NOT re-implement globbing. It invokes `sdcorejs-code-map`, takes the resulting map, and compresses it into the template below. If `code-map` is unavailable for some reason, fall back to its `## Workflow` steps directly — but prefer delegating.

## When invoked

Triggering is description-based, but this skill is wired to run at three hard points (see "Enforcement"). Treat a missing `summary.md` as a blocker for substantive work, not a nicety.

### 1. Session-start (READ mode)
At the start of any session inside a target project:
1. Resolve target root: `git rev-parse --show-toplevel` from the user's CWD (NOT the sdcorejs-agent repo).
2. If `<root>/.sdcorejs/summary.md` exists → read it, run the freshness check (below), summarize to yourself before answering. Acknowledge briefly: "Read .sdcorejs/summary.md (based on commit <short-sha>). ..." (or EN).
3. If it does NOT exist → tell the user it's missing and that you'll generate it before substantive work (GENERATE mode). For a pure question that needs no project context, you may answer first, but generate before any code-writing.

### 2. Before generation / on missing file (GENERATE mode = the gate)
When about to run `write-code` (the `sdcorejs-angular` orchestrator, including its init-portal / init-module reference packs — or the equivalent init step in another track) AND `summary.md` is absent → generate it first. This is the "mandatory" gate.

### 3. Post-init (WRITE mode)
Right after the `sdcorejs-angular` orchestrator (init-portal / init-module packs) finishes scaffolding a brand-new project/module, generate (or update) `summary.md` — a fresh repo has none yet.

### 4. On drift (REFRESH mode)
If `summary.md` exists but the freshness check says it's stale → regenerate (or patch the changed sections).

### On explicit request
- "project summary", "overview", "what is this project", or localized equivalents

## Freshness check

`summary.md` carries `git_head` + `generated_at` in frontmatter. To decide staleness:
```bash
ROOT=$(git rev-parse --show-toplevel)
RECORDED=$(grep -m1 '^git_head:' "$ROOT/.sdcorejs/summary.md" | awk '{print $2}')
CURRENT=$(git -C "$ROOT" rev-parse HEAD)
# how far has HEAD moved since the summary was written?
DRIFT=$(git -C "$ROOT" rev-list --count "${RECORDED}..HEAD" 2>/dev/null || echo 999)
```
- `DRIFT == 0` → fresh, just read it.
- `1 ≤ DRIFT ≤ 30` → usable; skim `git diff --stat ${RECORDED}..HEAD` — if it touched module roots / routes / package.json, patch the affected sections, else leave it.
- `DRIFT > 30` or `git_head` unreadable / commit gone → regenerate from scratch.

Never silently trust a stale summary — say which commit it's based on so the user can judge.

## Workflow (GENERATE / REFRESH)

1. Resolve `ROOT=$(git rev-parse --show-toplevel)` and the active `<track>` (angular.json → angular, nest-cli.json → nestjs, next.config.* → nextjs; monorepo → one section per stack in the same file).
2. **Invoke `sdcorejs-code-map`** to scan ROOT. Take its module/shared/base/routes/permission inventory + detected conventions.
3. Pull "open context": `git -C "$ROOT" log --oneline -15`, current branch, and the latest 1–2 `.sdcorejs/docs/<track>/*.md` if present (recent work).
4. **Distill** into the template — compress, don't copy code-map verbatim. The summary is a 1-page brief, not the full map.
5. Write `<root>/.sdcorejs/summary.md` (create `.sdcorejs/` if needed). READ-ONLY toward the target's source — only `.sdcorejs/summary.md` is written.
6. Acknowledge: path + the commit it's based on.

```bash
ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$ROOT/.sdcorejs"
# write "$ROOT/.sdcorejs/summary.md"
```

## Output template (`.sdcorejs/summary.md`)

```markdown
---
generated_at: <ISO timestamp>
git_head: <full sha at generation time>
branch: <branch>
tracks: [angular]            # one or more for monorepo
generator: sdcorejs-auto-summary
---

# Project Summary — <repo name>

## What this project is
<1–3 sentences: domain, who uses it, what it does. No filler.>

## Stack & track
- Track: <angular | nestjs | nextjs> (+ framework versions)
- Baseline / key deps: <@sdcorejs/angular x.y, @core/@shared aliases, etc.>
- Build / test commands: <the real ones>

## Architecture map (distilled)
| Module / area | Path | Purpose |
|---|---|---|
| … | … | … |

## Reusable building blocks (don't reinvent)
- Base classes / services: <name → path>
- Shared UI / utilities: <list>
- Auth / permission scheme: <how it works + where>

## Conventions detected
- Source layout (where modules/entities/routes live)
- Naming, file colocation, registration points

## Reuse cheatsheet
- ✅ reuse <X> for <task>
- ❌ don't reinvent <Y> / don't import <Z> directly

## Open context (as of <short-sha>)
- In-progress: <from git log / latest auto-docs>
- Known gaps / follow-ups: <list, or "none recorded">

## Freshness
Based on commit <short-sha> (<date>). Regenerate with `sdcorejs-auto-summary` if HEAD has drifted significantly.
```

## Enforcement (4 tiers — this is what makes it "mandatory")

Description-matching alone is unreliable (a skill is only consulted when the agent thinks to). So this skill is backed by:
1. **Hook (session-start directive):** the plugin `SessionStart` hook detects a track config — at the repo ROOT *or* nested under `apps/*` / `packages/*` / `projects/*` (monorepo) — and, if `<project>/.sdcorejs/summary.md` is absent, injects a directive to run this skill before substantive work. Note this is an *advisory* directive (no platform-level hard block exists); it fires once at session start (`startup`/`clear`/`compact`).
2. **Bootstrap (always in context):** `sdcorejs-using-skills` (injected every session) carries the "Project brief first" non-negotiable and puts the summary gate at the head of the workflow — so the rule holds for ANY skill, not only `write-code`, and even when the hook's detection misses.
3. **Orchestrator wiring (medium):** `write-code` (the `sdcorejs-angular` orchestrator, including its init-portal / init-module reference packs) calls this skill as "Step 0 — ensure summary" (generate if missing) and as a post-init write.
4. **Description (soft):** the pushy description above.

If you are reading this because the hook injected a "summary missing" directive: generate it now (GENERATE mode) before the user's code-writing request.

## Rules

### MUST DO
- Keep `summary.md` to ~1 page — distill, don't dump the full code-map.
- Record `git_head` + `generated_at` every write so freshness is checkable.
- Delegate scanning to `sdcorejs-code-map`; do not duplicate its globs here.
- Only ever write `.sdcorejs/summary.md` — never touch the target's source.
- State which commit the summary is based on whenever you read or write it.

### MUST NOT
- Edit project source files (this skill writes exactly one artifact).
- Let a stale summary stand silently — run the freshness check.
- Duplicate `auto-docs` (per-session deltas) — this file is the evergreen overview.
- Block a pure informational question that needs no project context; but DO block code-writing when the summary is missing.

## Anti-patterns
- Copying the entire code-map report into summary.md (defeats "1-page brief").
- Regenerating on every session regardless of drift (wastes time — use the freshness check).
- Writing per-session content here instead of in `.sdcorejs/docs/` (wrong file, wrong lifecycle).
- Claiming reuse of a base class/component without the path code-map actually found.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
