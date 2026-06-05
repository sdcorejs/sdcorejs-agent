---
name: sdcorejs-write-spec
description: Use AFTER `sdcorejs-clarify-requirements` has captured every blocking input for the detected track, BEFORE `sdcorejs-write-plan`. Authors a spec document at `<target-project>/.sdcorejs/docs/<track>/<timestamp>-<topic>-spec.md` covering Problem & Goals, Non-goals, Architecture, File structure, Acceptance criteria, Risks, Out-of-scope. Track-specific section emphasis loaded from `_refs/sdlc/<track>.md` (e.g. angular file-paths, nestjs persistence + transactions, nextjs SEO + caching). Triggers - "viết spec", "write spec", "draft spec", "tài liệu thiết kế", "design doc", "soạn spec cho ...". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Glob, Grep, Bash
---

# 03 — Write Spec (Cross-Track)

## Purpose
Turn a confirmed scope into a written spec that survives sessions. The spec is the durable design artifact: `sdcorejs-write-plan` translates it into tasks, `<track>-write-code` implements those tasks, and any later session can re-read the spec to understand WHY the system looks the way it does.

A spec is **design-level** (what + why). A plan is **task-level** (which file, in what order). Do not mix them.

## When to use
- After `sdcorejs-clarify-requirements` has confirmed every minimum-required answer for the track
- BEFORE invoking `sdcorejs-write-plan` — the plan reads the approved spec as input
- When the user says "viết spec", "draft spec", "tài liệu thiết kế trước khi code", "design doc"

If scope is not yet confirmed, route back to `sdcorejs-clarify-requirements`.

## Process

### Step 0 — Detect target track
```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
cd "$TARGET_ROOT"
# (same detection block as 01-brainstorm / 02-clarify)
```

If detection fails, ask the user which track.

### Step 1 — Load track-specific section guidance
Read `_refs/sdlc/<TRACK>.md` (the **Spec** section). Each track defines:
- Which sections deserve extra depth (angular file paths, nestjs persistence, nextjs SEO + caching)
- File-path conventions for the "File structure" section
- What counts as a track-relevant acceptance criterion

### Step 2 — Resolve output path
```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$TARGET_ROOT/.sdcorejs/docs/<TRACK>"

# Filename pattern: <YYYY-MM-DD-HH-mm>-<kebab-topic>-spec.md
FILE="$TARGET_ROOT/.sdcorejs/docs/<TRACK>/2026-05-19-14-30-add-promotion-entity-spec.md"
```

The `-spec` suffix distinguishes spec files from auto-docs session summaries in the same folder.

### Step 3 — Read prior context
- Latest 3 auto-docs entries in `.sdcorejs/docs/<TRACK>/` — what was done recently
- Memory frontmatter in `.sdcorejs/memories/<TRACK>/` — load bodies that match the topic
- Latest 1-3 approved specs in `.sdcorejs/specs/<TRACK>/` (if any) — mirror the user's preferred structure and depth

### Step 4 — Draft the spec from the template below

```markdown
# Spec — <Title> — <YYYY-MM-DD HH:mm>

## Problem & Goals
<2-4 sentences: what business problem this solves, who the user is, what success looks like.>

## Non-goals
- <Explicit out-of-scope item 1>
- <Explicit out-of-scope item 2>
- ...

Non-goals prevent scope creep. Aim for 2-5 items.

## Architecture
<How this fits the existing project: which module(s) it touches, which services/components/endpoints it introduces, which framework conventions it uses. 3-8 sentences for simple features; can grow to a paragraph + diagram for complex ones.>

Reference any prior decisions captured in `.sdcorejs/memories/<TRACK>/`.

## File structure
List every file to create or modify (path + 1-line intent). Use the track-specific path conventions from `_refs/sdlc/<TRACK>.md`. This is the bridge from spec to plan.

<Track-specific examples; see _refs/sdlc/<TRACK>.md>

## Acceptance criteria
Concrete, testable. Each item must be checkable by a human or an automated test.

<Track-specific examples; see _refs/sdlc/<TRACK>.md>

## Risks & mitigations
- **Risk:** <description> → **Mitigation:** <approach>
- ...

## Out of scope (deferred)
What we explicitly defer for now and the trigger that would bring it back in.
- <item> — defer until <trigger>
```

### Section depth
Scale each section to the complexity:
- **Simple feature** (single entity / single endpoint / single page): 2-3 sentences per section
- **Medium feature** (module + 2-3 sub-pieces): paragraph per section
- **Large feature** (multi-module / workflow / integration): 1-3 paragraphs + bullet lists; consider splitting into multiple specs

### Step 5 — Write the spec
Write to `$FILE` via `Write` tool. Use the template, fill every section (even if short), reflect the language the user is working in.

### Step 6 — Hand off to `sdcorejs-review-spec`
Do NOT proceed to `sdcorejs-write-plan` until `sdcorejs-review-spec` confirms user approval.

## Rules

### MUST DO
- Write to `<target-project>/.sdcorejs/docs/<TRACK>/`, NEVER to the `sdcorejs-agent` repo
- Include all template sections — even if short, the header forces the question
- Include at least one non-goal (prevents scope creep)
- Include at least one acceptance criterion per user-visible behavior
- Match the user's language (VI request → VI spec with proper diacritics; EN → EN)
- Reference prior memories or auto-docs entries when they shape a decision
- Mirror the structure and depth of the latest 3 approved specs in `.sdcorejs/specs/<TRACK>/`
- Hand off to `sdcorejs-review-spec` after writing — do not auto-approve

### MUST NOT
- Include implementation steps (which file in which order) — those belong in `sdcorejs-write-plan`
- Skip the non-goals section
- Write spec without user-confirmed scope (route back to `sdcorejs-clarify-requirements`)
- Write the spec inside this `sdcorejs-agent` repo
- Inline full code samples — keep the spec scannable (file paths + 1-line intent)

## Anti-patterns
- Spec that doubles as a plan (numbered steps with file edits) — collapses two stages and loses design rationale
- Spec without non-goals — invites scope creep two sessions later
- Spec without acceptance criteria — no way to know when "done" is reached
- Writing the spec without reading prior memories / auto-docs — repeats decisions the project already made
- Spec stored under `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — canonical path is `.sdcorejs/docs/`

## Related skills
- `_refs/sdlc/<TRACK>.md` — track-specific section emphasis + path conventions
- `sdcorejs-brainstorm` — produces the direction this spec captures
- `sdcorejs-clarify-requirements` — confirms the inputs this spec relies on
- `sdcorejs-review-spec` — runs immediately after, gates on user approval
- `sdcorejs-write-plan` — reads the approved spec and produces the file-by-file plan
