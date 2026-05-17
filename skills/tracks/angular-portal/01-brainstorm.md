---
name: angular-portal-brainstorm
description: Use when the user has an OPEN-ENDED idea or wants to explore solutions before scope is fixed. Different from `02-clarify-requirements` - brainstorm explores 2-3 approaches with tradeoffs and recommends one; clarify hard-confirms after direction is chosen. Triggers - "brainstorm", "tôi đang nghĩ về", "khám phá ý tưởng", "explore options", "what should I build for", "ý tưởng cho ...", "should I use X or Y", "không chắc làm thế nào", "compare approaches". Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# 01 — Brainstorm

## Purpose
Turn a vague idea into a concrete design through dialogue. The user has a goal but no fixed approach. This skill explores 2-3 viable approaches, surfaces tradeoffs, and recommends one — so by the time `02-clarify-requirements` runs, the user already knows the rough shape of what they want.

Brainstorm is opt-in. If the user already knows what to build, skip straight to `02-clarify-requirements`.

## When to use

Use this skill when ANY of these is true:
- The user describes a goal, not a feature ("I want to track promotions" vs "create promotion entity in sales")
- The user explicitly compares: "should I use X or Y", "side-drawer vs full page for this?", "có nên dùng workflow ở đây?"
- The user asks "what should I build for ..." or "ý tưởng cho ..."
- The user signals uncertainty: "không chắc làm thế nào", "đang phân vân", "explore options"

## When to skip

Skip this skill when ANY of these is true:
- The user already named the entity, module, and fields (go to `02-clarify-requirements`)
- The user said "tạo CRUD cho X" with concrete X — that's a clarify-then-build flow, not exploration
- The work is a known recipe in the catalog (init portal, init module, add screen to existing entity)

## Process

### 1. Read project context (cheap)
Before proposing approaches, read what's already in the target project:
- Glob `.sdcorejs/docs/angular-portal/*.md` (auto-docs history, latest 3)
- Glob `.sdcorejs/memories/angular-portal/*.md` (durable knowledge, frontmatter only — load bodies that look relevant)
- Glob `src/libs/*/` to see which modules exist
- Read `package.json` to check the pinned `@sd-angular/core` version

Project context shapes which approaches are realistic. Skip this step only if the project is brand new (no prior auto-docs, no `src/libs/`).

### 2. Ask clarifying questions one at a time
Before proposing, ask 1-3 targeted questions to disambiguate the goal. ONE question per turn — do not batch.

Examples:
- "Mục tiêu chính ở đây là gì — tốc độ nhập liệu hay độ chính xác?"
- "Workflow này có cần phê duyệt nhiều cấp, hay chỉ submit-approve một bước?"
- "Người dùng chính là backoffice operator hay end customer?"

Stop when the answer would constrain the approach choice.

### 3. Propose 2-3 approaches with tradeoffs

Present approaches as a short table or list. Each must have:
- Name (3-5 words)
- One-line summary
- Pros (2-3 bullets)
- Cons (2-3 bullets)
- Best when (1 line)

Example:

| Approach | Summary | Pros | Cons | Best when |
|---|---|---|---|---|
| **Side-drawer CRUD** | Quick edit panel on list page | Fast nav, less code | Cramped >6 fields | One section, ≤6 fields, no workflow |
| **Full-page UnifiedCompact** | Same layout all 3 states | Simple, predictable | No visual hint of mode | Medium form, mixed user skill |
| **AdaptiveSplitDetail** | Edit split / detail read-only split | Rich UX | More code + state | Heavy workflow, many sections |

### 4. Recommend one
End with ONE recommendation in 1-2 sentences and a clear reason tied to the user's stated goal. Example:

> "Đề xuất: AdaptiveSplitDetail. Vì bạn cần workflow approve + nhiều section, và người dùng chính là operator có training — split detail giúp họ nhanh phân biệt mode."

### 5. Confirm direction, hand off
Ask: "Theo hướng này tiếp tục chứ? / Go with this approach?"
- On "OK" → invoke `02-clarify-requirements` to hard-confirm fields/module/scope, then `03-write-spec`
- On "đổi" → revise the approach table
- On "explore more" → propose a 3rd/4th approach (but cap at 4 total — see anti-patterns)

## Output
This skill outputs DIALOGUE, not files. It does not write a spec — that's `03-write-spec`'s job. After the user confirms a direction, hand off to `02-clarify-requirements`.

## Anti-patterns

- ❌ Don't generate code from this skill. The user hasn't confirmed a direction yet.
- ❌ Don't write a spec file here — that belongs in `03-write-spec`.
- ❌ Don't accept the first idea without comparing alternatives. If the user proposes Approach A, you still owe them at least one alternative ("OK, but Approach B trades X for Y — still want A?").
- ❌ Don't propose more than 3-4 approaches in one turn. Decision fatigue kills brainstorms.
- ❌ Don't batch clarifying questions. One per turn.
- ❌ Don't recommend without giving a reason — "I recommend X" with no rationale teaches nothing.
- ❌ Don't skip reading prior auto-docs/memories — those are why the agent is more useful than a blank slate.

## Related skills
- `02-clarify-requirements` — runs next, hard-confirms module/entity/fields/scope
- `03-write-spec` — captures the agreed design as a written spec
- `orchestration/memories` — if the brainstorm surfaces a recurring preference, save it as a memory
