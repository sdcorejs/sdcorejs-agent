---
name: angular-portal-plan
description: Use after 01-clarify-requirements has confirmed scope (module, entity, fields, screens, layout) and BEFORE 03-write-code generates anything. Writes a numbered file-by-file plan for the user to review and confirm. No code is written here. Triggers - "lên kế hoạch", "plan", "show me steps before coding", "kế hoạch trước khi code", "draft a plan". Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# 02 — Plan

## Purpose
Translate the confirmed scope from `01-clarify-requirements` into a concrete, ordered, file-by-file plan that the user reviews and approves before any code is generated. The plan is the contract between the agent and the user — `03-write-code` executes exactly what was approved.

## When to use
- After `01-clarify-requirements` has captured: module name, entity name, display label, field schema, detail layout (UnifiedCompact / UnifiedSplit / AdaptiveSplitDetail / side-drawer), workflow (yes/no), test coverage level
- BEFORE invoking `03-write-code` or any of its sub-skills (10/11/12/20/21/22/23/30/31)
- When the user explicitly says "plan first", "lên kế hoạch", "draft a plan", "kế hoạch trước khi code"

If the scope is still missing items, route back to `01-clarify-requirements` instead.

## What a good plan looks like

A good plan has:
1. **A scope recap** (2-4 lines) — confirms what was decided in 01
2. **A numbered file list** — each step shows path + create-vs-edit + one-line intent
3. **Verification steps** — `npm install`, `npm run build`, `npm run test -- --watch=false --include=...`, manual route to open in browser
4. **A confirm-or-amend prompt** — explicit ask: "Plan này OK không? / Confirm plan?"

### Plan template

```markdown
## Scope (recap from clarify)
- Portal: <portal-name>
- Module: <module-name> (existing | new)
- Entity: <entity-name> — label "<entity-label>"
- Layout: <UnifiedCompact | UnifiedSplit | AdaptiveSplitDetail | side-drawer>
- Workflow: <none | submit-approve-reject>
- Test coverage: <minimal | standard | full>

## Files to create / edit

### Module bootstrap (if new module)
1. CREATE  src/libs/<module>/<module>.configuration.ts          — InjectionToken + interface
2. CREATE  src/libs/<module>/configurations/api.configuration.ts — request/response interceptors
3. CREATE  src/libs/<module>/guards/<module>.guard.ts             — permission gate
4. CREATE  src/libs/<module>/routes.ts                            — lazy-load entity children
5. EDIT    src/app/app.routes.ts                                  — register <module> route + provider
6. EDIT    src/main.ts                                            — provide <MODULE>_CONFIGURATION at root

### Entity (model + service + mock)
7.  CREATE  src/libs/<module>/modules/<entity>/services/<entity>.model.ts
8.  CREATE  src/libs/<module>/modules/<entity>/services/<entity>.mock-data.ts  — 20-40 realistic seed rows
9.  CREATE  src/libs/<module>/modules/<entity>/services/<entity>.service.ts    — MockCrudStore wiring
10. CREATE  src/libs/<module>/modules/<entity>/services/index.ts

### Entity (routes + components)
11. CREATE  src/libs/<module>/modules/<entity>/<entity>.routes.ts
12. CREATE  src/libs/<module>/modules/<entity>/pages/list/list.component.ts
13. CREATE  src/libs/<module>/modules/<entity>/pages/detail/detail.component.ts

### Tests (matching coverage level)
14. CREATE  ...routes.spec.ts
15. CREATE  ...list.component.spec.ts
16. CREATE  ...detail.component.spec.ts

## Verification
- `npm install` (only if new portal)
- `npm run build-dev` — expect exit 0
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`
- Open http://localhost:4200/<module>/<entity> — verify list renders 20+ seed rows
- Click "Tạo mới" → fill form → save → expect record appears in list

## Confirm
Plan này có phù hợp không?
- "OK, generate" → invoke `03-write-code`
- "Đổi <X>" → revise this plan
- "Quay lại clarify" → invoke `01-clarify-requirements`
```

## Rules

### MUST DO
- Recap scope in 2-4 lines before listing files; the user must see we agree on what was decided
- Number every file step; show absolute path under the target project, not the agent repo
- Mark each step as CREATE or EDIT explicitly
- Group steps by phase (module bootstrap → entity model/service → entity routes/components → tests)
- Include verification steps with exact commands
- End with an explicit confirm/amend/revert prompt
- Match the user's language (VI/EN)
- If the user picked side-drawer layout, omit `pages/detail/` and add `components/detail-side-drawer/` instead
- If the user opted out of tests (or chose `minimal`), reflect that exactly in the plan
- If a step depends on user-provided data not yet collected (parent module name, API host), surface that as a final blocker — do NOT make up a value

### MUST NOT
- Write any code in this skill — only the plan
- Invoke `03-write-code` or its sub-skills before the user confirms
- Invent file paths that don't match the conventions in `12-init-entity` / `11-init-module`
- Skip verification steps to keep the plan short
- Hide trade-offs (if user picked AdaptiveSplitDetail but only has 4 fields, call it out: "AdaptiveSplitDetail is heavy for 4 fields, consider side-drawer?")

## Hand-off to 03-write-code
After the user confirms with "OK", "go ahead", "generate", "tiến hành":
1. Pass the approved plan as input to `03-write-code`
2. `03-write-code` orchestrates by invoking the right sub-skills for each numbered step
3. After generation, `_shared/auto-doc` writes a session summary including a copy of this approved plan

## Anti-patterns
- Bullet lists without numbers (user can't reference "step 7")
- Plans without a verification section (user has no way to confirm correctness)
- Skipping the explicit confirm prompt (agent assumes consent)
- Mixing planning with code generation in one response
- Re-asking clarify questions here — those belong in `01-clarify-requirements`
