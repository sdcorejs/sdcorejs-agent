---
name: angular-portal-write-comments
description: Use to add JSDoc / inline comments and a `WHY-X.md` brief explanation file when the developer asks for code documentation. Comments explain WHY (constraints, invariants, decisions) — never WHAT (good names handle that). Triggers - "thêm comment", "diễn giải code", "explain this code", "add docs", "viết tài liệu cho", "comment lại file". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep
---

# 51 — Write Comments

## Purpose
Add documentation to existing code so future maintainers understand WHY decisions were made — not WHAT the code does (good names already convey that). Outputs JSDoc on public APIs, one-line `// why:` comments on non-trivial logic, and optionally a `docs/<topic>.md` brief in the target project for complex flows.

## When to use
- User asks "thêm comment cho file ...", "diễn giải code", "explain this", "add docs", "comment lại module"
- After a complex piece of business logic was generated and the rationale is non-obvious
- Before handing a module to another developer for maintenance

## Rules — what to comment

### WHY, not WHAT
- ❌ `// increment counter` (the line `count++` already says this)
- ✅ `// why: re-emit even when value is unchanged so subscribers can detect external resets`

### Public API methods → JSDoc
Every exported function/method gets:
```typescript
/**
 * <one-line summary, ends with period.>
 *
 * <optional 1-3 line elaboration covering invariants, side effects, or non-obvious behavior.>
 *
 * @param id - the entity id (must be a UUID; throws otherwise)
 * @returns the persisted DTO including server-assigned audit fields
 * @throws {EntityNotFoundError} when no record matches `id`
 */
async update(id: string, req: ProductSaveReq): Promise<ProductDTO> { ... }
```

Required tags when applicable: `@param`, `@returns`, `@throws`. Skip `@param` if there are no params.

### Non-trivial logic → `// why: ...`
- Workflow state transitions
- Race-condition guards
- Floating-point comparisons / rounding
- Order-dependent operations (uploads before save, detach observers before destroy)
- Unusual flag combinations (`replaceUrl: true` after stale-id recovery)
- Backend quirks (`if (res.status === 204) return null` — backend returns 204 instead of empty array)

Format: one line, lower-case after `why:`, no trailing period required for short notes.

### Complex flows → `docs/<topic>.md`
When a flow spans 3+ files and the WHY can't fit in inline comments, write a brief in the target project:
- Path: `<target-project>/docs/<topic-kebab>.md` (e.g. `docs/why-upload-before-save.md`)
- Length: 30-80 lines
- Sections: **Context**, **Decision**, **Consequences**, **Files involved**

## Rules — what NOT to comment

### ❌ Never do these
- Restating the code: `// loop through items` above `for (const item of items)`
- Commented-out code blocks (delete them; git remembers)
- TODO without a ticket reference (`// TODO: fix later` is noise; `// TODO(JIRA-1234): replace with API call when backend ready` is actionable)
- Author name + date headers (git blame gives you that)
- Section dividers like `// ---- HELPERS ----` (use real headers in docs files instead)
- Auto-generated comments that just paraphrase param names

## Process

1. Read the file(s) the user asked about
2. Identify public APIs (exported functions, classes, methods) → add JSDoc
3. Identify non-obvious logic (workflow transitions, ordering constraints, error recovery) → add `// why:` lines
4. If the flow spans 3+ files, propose a `docs/<topic>.md` brief and ask the user to confirm before writing it
5. Diff what changed — show the user the comment additions only, not the full file

## Output format

For inline edits, summarize:
```markdown
## Comments added

### src/libs/sales/modules/product/services/product.service.ts
- JSDoc on `update(id, req)` — documents `EntityNotFoundError` throw + audit-field assignment
- `// why:` on line 47 — explains why `markAsPristine()` is called after `patchValue`
- `// why:` on line 62 — uploads must complete before `update(...)` to avoid orphan blobs

### src/libs/sales/modules/product/pages/detail/detail.component.ts
- JSDoc on `loadEntityData(id)` — documents stale-id recovery contract
- `// why:` on line 89 — explains `replaceUrl: true` for back-button safety
```

For a `docs/<topic>.md` brief, show the file path + first 10 lines as preview and ask confirm.

## Anti-patterns
- Adding `// TODO` without a ticket
- Commenting every line (noise; defeats good naming)
- Leaving commented-out code "just in case"
- JSDoc that just restates the signature (`@param id - the id` — worse than nothing)
- Long block comments at top of file with author/date metadata
- Writing `docs/...md` for trivial features (3-line CRUD doesn't need a brief)
- Mixing comment additions with code refactoring in the same step (review burden explodes)
- Forgetting to match the user's language for prose (VI portal → VI comments where natural; keep code identifiers English)
