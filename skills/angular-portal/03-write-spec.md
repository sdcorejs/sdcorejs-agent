---
name: angular-portal-write-spec
description: Use after brainstorming/clarification has settled scope, BEFORE `05-plan` writes step-by-step tasks. Authors a spec document at `<target-project>/.sdcorejs/docs/angular-portal/<timestamp>-<topic>-spec.md` capturing goals, non-goals, architecture, components/files to create or modify, acceptance criteria, and risks. Triggers - "viết spec", "write spec", "draft spec", "tài liệu thiết kế", "design doc", "soạn spec cho ...". Bilingual (VI/EN).
allowed-tools: Read, Write, Glob, Grep
---

# 03 — Write Spec

## Purpose
Turn a confirmed scope (from `01-brainstorm` and/or `02-clarify-requirements`) into a written spec that survives sessions. The spec is the durable design artifact: `05-plan` translates it into tasks, `07-write-code` implements those tasks, and any later session can re-read the spec to understand WHY the system looks the way it does.

A spec is design-level (what + why). A plan is task-level (which file, in what order). Do not mix them.

## When to use

- After `01-brainstorm` (if used) AND `02-clarify-requirements` have confirmed: goal, module, entity, key fields, layout direction, workflow yes/no
- BEFORE invoking `05-plan` — the plan reads the approved spec as input
- When the user says "viết spec", "draft spec", "tài liệu thiết kế trước khi code", "design doc"

If the scope is not yet confirmed, route back to `02-clarify-requirements`.

## Output path

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
mkdir -p "$TARGET_ROOT/.sdcorejs/docs/angular-portal"

# Filename pattern: <YYYY-MM-DD-HH-mm>-<kebab-topic>-spec.md
FILE="$TARGET_ROOT/.sdcorejs/docs/angular-portal/2026-05-16-14-30-add-promotion-entity-spec.md"
```

The `-spec` suffix distinguishes spec files from auto-docs session summaries in the same folder.

## Spec template

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
<How this fits the existing portal: which module(s) it touches, which services/components it introduces, which Core UI patterns it uses. 3-8 sentences for simple features; can grow to a paragraph + diagram for complex ones.>

Reference any prior decisions captured in `.sdcorejs/memories/angular-portal/`.

## File structure
List every file to create or modify (path + 1-line intent). This is the bridge from spec to plan — `05-plan` will turn this into numbered, ordered tasks.

- CREATE  src/libs/sales/features/promotion/services/promotion.model.ts — DTO + SaveReq
- CREATE  src/libs/sales/features/promotion/services/promotion.mock-data.ts — 25 seed rows
- CREATE  src/libs/sales/features/promotion/services/promotion.service.ts — MockCrudStore wiring
- CREATE  src/libs/sales/features/promotion/pages/list/list.component.ts — list page
- CREATE  src/libs/sales/features/promotion/pages/detail/detail.component.ts — UnifiedCompact 3-state
- EDIT    src/libs/sales/routes.ts — register child route

## Acceptance criteria
Concrete, testable. Each item must be checkable by a human or an E2E test.

- [ ] User can navigate to `/sales/promotion` and see ≥20 seed rows
- [ ] Create form validates: code required, discountValue 0-100 if type=PERCENT
- [ ] Update preserves audit fields; createdAt unchanged after edit
- [ ] List filter by status returns only matching rows
- [ ] All Vietnamese labels render with full diacritics

## Risks & mitigations
- **Risk:** Backend API contract not yet finalized → **Mitigation:** mock-first via MockCrudStore; switch to BaseService when contract lands
- **Risk:** Discount overlap rules might be needed later → **Mitigation:** non-goal for v1; revisit in next spec

## Out of scope (deferred)
What we explicitly defer for now and the trigger that would bring it back in. Different from non-goals: out-of-scope items are "later, not never".

- Bulk import via Excel — defer until ops team confirms file format
- Multi-currency discount — defer until product roadmap calls it out
```

### Section depth
Scale each section to the complexity:
- Simple feature (single entity, ≤6 fields, no workflow): 2-3 sentences per section is fine
- Medium feature: paragraph per section
- Large feature (multi-module, workflow, integration): 1-3 paragraphs + bullet lists; consider splitting into multiple specs

## Process

1. Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel`
2. Read relevant prior context:
   - Latest 3 auto-docs entries in `.sdcorejs/docs/angular-portal/`
   - Memory frontmatter in `.sdcorejs/memories/angular-portal/`, load bodies that match the topic
3. Draft the spec using the template above
4. Write to the output path
5. Hand off to `04-review-spec` for user approval (do NOT proceed to `05-plan` until 04 confirms)

## Rules

### MUST DO
- Write to `<target-project>/.sdcorejs/docs/angular-portal/`, NEVER to the agent repo
- Include all template sections — even if empty/short, the section header forces the question
- Include at least one non-goal (prevents scope creep)
- Include at least one acceptance criterion per user-visible behavior
- Match the user's language (VI request → VI spec; EN → EN)
- Reference prior memories or auto-docs entries when they shape a decision
- Hand off to `04-review-spec` after writing — do not auto-approve

### MUST NOT
- Include implementation steps (which file in which order) — those belong in `05-plan`
- Skip the non-goals section
- Write spec without user-confirmed scope (route back to `02-clarify-requirements`)
- Write the spec inside this `sdcorejs-agent` repo
- Inline full code samples — keep the spec scannable (file paths + 1-line intent)

## Anti-patterns
- Spec that doubles as a plan (numbered steps with file edits) — collapses two stages into one and loses the design rationale
- Spec without non-goals — invites scope creep two sessions later
- Spec without acceptance criteria — there's no way to know when "done" is reached
- Writing the spec without reading prior memories/auto-docs — repeats decisions the project already made
- Spec stored under `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — canonical path is `.sdcorejs/docs/`

## Related skills
- `01-brainstorm` — produces the direction this spec captures
- `02-clarify-requirements` — confirms the inputs this spec relies on
- `04-review-spec` — runs immediately after, gates on user approval
- `05-plan` — reads the approved spec and produces the file-by-file plan
