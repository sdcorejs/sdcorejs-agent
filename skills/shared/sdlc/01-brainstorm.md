---
name: sdcorejs-brainstorm
description: Use when the user has an OPEN-ENDED idea or wants to explore solutions BEFORE scope is fixed — across angular, nestjs, or nextjs. Detects the target track from the project, loads track-specific patterns from `_refs/sdlc/<track>.md`, and proposes 2-3 viable approaches with tradeoffs + a recommendation. Different from `sdcorejs-clarify-requirements` which hard-confirms AFTER direction is chosen. Triggers - "brainstorm", "I am thinking about", "explore ideas", "explore options", "what should I build for", "ideas for ...", "should I use X or Y", "not sure how to proceed", "compare approaches", "create a website for ...", "landing page for an industry ...", "backend module ideas". Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

# 01 — Brainstorm (Cross-Track)

## Purpose
Turn a vague idea into a concrete design through dialogue. The user has a goal but no fixed approach. This skill explores 2-3 viable approaches, surfaces tradeoffs, and recommends one — so by the time `sdcorejs-clarify-requirements` runs, the user already knows the rough shape of what they want.

Brainstorm is opt-in. If the user already knows what to build, skip straight to `sdcorejs-clarify-requirements`.

## When to use

Use this skill when ANY of these is true:
- The user describes a goal, not a feature ("I want to track promotions" vs "create promotion entity in sales")
- The user explicitly compares: "should I use X or Y", "side-drawer vs full page", "should this use workflow?", "REST vs gRPC", "SSG vs ISR vs SSR", or localized equivalents
- The user asks "what should I build for ..." or "ideas for ..."
- The user signals uncertainty: "not sure how to proceed", "still deciding", "explore options", or localized equivalents

## When to skip
- The user already named the concrete artifacts (module + entity + fields for portal/nestjs; industry + page set for nextjs) → go to `sdcorejs-clarify-requirements`
- The user said "create CRUD for X" with concrete X — that's clarify-then-build, not exploration
- The work is a known recipe in the catalog (init project, init module, add screen)

## Process

### Step 0 — Detect the target track
The brainstorm rubric differs by track. Detect from the **target project root** (not this `sdcorejs-agent` repo):

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
cd "$TARGET_ROOT"

if   [ -f angular.json ];                                                      then TRACK=angular
elif [ -f nest-cli.json ];                                                     then TRACK=nestjs
elif [ -f next.config.js ] || [ -f next.config.ts ] || [ -f next.config.mjs ]; then TRACK=nextjs
elif grep -q '"@nestjs/core"'  package.json 2>/dev/null;                       then TRACK=nestjs
elif grep -q '"next"'          package.json 2>/dev/null;                       then TRACK=nextjs
elif grep -q '"@angular/core"' package.json 2>/dev/null;                       then TRACK=angular
else TRACK=ASK_USER
fi
```

If detection fails, ask: "Which track is this project — angular / nestjs / nextjs?" Translate at runtime. Do not proceed without a track — the brainstorm patterns are different.

### Step 1 — Load track-specific patterns
Read `_refs/sdlc/<TRACK>.md` (the brainstorm section). Each track has its own approach palette:
- **angular**: side-drawer vs page detail; UnifiedCompact / UnifiedSplit / AdaptiveSplitDetail; workflow vs no-workflow
- **nestjs**: persistence (TypeORM / pg-mem / external); transaction style; workflow / saga / event
- **nextjs**: industry profile (construction / F&B / healthcare / etc.); tier (Lean / Standard / Full); page set; OG strategy

### Step 2 — Read project context (cheap)
Before proposing, glob what's already in the target project:
- `.sdcorejs/docs/<TRACK>/*.md` (auto-docs history, latest 3) — what was done recently
- `.sdcorejs/memories/<TRACK>/*.md` (durable knowledge — frontmatter only, load bodies that look relevant)
- Track-specific scan (e.g. `src/libs/*/` for angular, `src/modules/*/` for nestjs, `app/` + `content/` for nextjs)
- `package.json` for pinned versions / framework hints

Skip step 2 only if the project is brand new (no prior docs, no source folders).

### Step 3 — Ask 1-3 targeted clarifying questions, ONE per turn
Before proposing, disambiguate the goal. Do NOT batch — one question per turn so the user can think.

Examples per track:
- **angular**: "Is the goal faster data entry with a drawer, or complex workflow handling with a full detail page?"
- **nestjs**: "Do you need audit log + strict transactions, or write-first eventual consistency?"
- **nextjs**: "What industry is this for — F&B, healthcare, construction, or something else?"

Stop asking once the answer would constrain the approach choice.

### Step 4 — Propose 2-3 approaches with tradeoffs
Use the format from `_refs/sdlc/<TRACK>.md` (industry-tier table for nextjs, approach matrix for angular/nestjs). Each approach has:
- Name (3-5 words)
- One-line summary
- Pros (2-3 bullets)
- Cons (2-3 bullets)
- Best when (1 line)

Cap at 3 approaches per round (4 absolute max). Decision fatigue kills brainstorms.

### Step 5 — Recommend one
ONE recommendation, 1-2 sentences, tied to the user's stated goal:

> "Recommendation: AdaptiveSplitDetail. Because you need approval workflow plus many sections, and operators are already trained, split detail helps them distinguish modes quickly."

Translate this message at runtime.

### Step 6 — Confirm direction, hand off
Ask: "Go with this approach?" Translate at runtime.
- On "OK" → hand off to `sdcorejs-clarify-requirements` (passes the chosen direction as input context)
- On "change" → revise the approach table
- On "explore more" → propose 3rd/4th (cap at 4 total)

## Output
This skill outputs DIALOGUE, not files. It does not write a spec — that's `sdcorejs-write-spec`'s job.

If the brainstorm surfaces a durable preference (e.g. "user always picks AdaptiveSplitDetail for finance modules"), invoke `orchestration/memories` to capture it.

## Anti-patterns
- ❌ Don't generate code or write spec files here — scope hasn't been confirmed
- ❌ Don't accept the first idea without comparing at least one alternative — "OK, but Approach B trades X for Y — still want A?"
- ❌ Don't propose >4 approaches in one turn — fatigue kills the decision
- ❌ Don't batch clarifying questions — one per turn
- ❌ Don't recommend without a reason — "I recommend X" with no rationale teaches nothing
- ❌ Don't skip reading prior auto-docs / memories — those are why the agent beats a blank slate
- ❌ Don't show angular patterns to a nextjs project — load the right `_refs/sdlc/<TRACK>.md`

## Related skills
- `_refs/sdlc/<TRACK>.md` — track-specific patterns this skill loads in Step 1
- `sdcorejs-clarify-requirements` — runs next, hard-confirms scope
- `sdcorejs-write-spec` — captures the agreed design after clarify
- `orchestration/memories` — save recurring preferences for future sessions
