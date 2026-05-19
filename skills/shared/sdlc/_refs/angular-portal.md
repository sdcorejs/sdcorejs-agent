# Angular Portal — SDLC Reference

This file is loaded by `skills/shared/sdlc/0[1-6]-*.md` when the detected track is `angular-portal`. It collects only the track-specific bits the cross-track skills need; do NOT duplicate the cross-track workflow here.

---

## Brainstorm

### Approach palette
When the user wants 2-3 options for a CRUD/workflow feature, present from this matrix:

| Approach | Summary | Pros | Cons | Best when |
|---|---|---|---|---|
| **Side-drawer CRUD** | Quick edit panel on the list page | Fast nav, less code, less route work | Cramped >6 fields, no deep workflow | One section, ≤6 fields, no approval flow |
| **UnifiedCompact (full-page)** | Same compact layout for CREATE / UPDATE / DETAIL | Simple, predictable, low cognitive load | No visual hint of mode | Medium form, mixed user skill |
| **UnifiedSplit (full-page)** | Same split layout (left title, right form) for all 3 states | Title context always visible | Slightly more layout code | Forms where the "what is this record" context matters |
| **AdaptiveSplitDetail** | CREATE/UPDATE use editable split; DETAIL uses read-only split | Rich UX, clear mode distinction | More layout code + state | Heavy workflow, many sections, trained operators |

### Workflow brainstorm
- No workflow → keep CRUD straight
- Single-step submit-approve → add `31-workflow-actions` to plan
- Multi-step (draft → review → approve → publish) → spec must list each transition + permission

### Clarifying questions to seed
- "Mục tiêu là tốc độ nhập liệu (drawer) hay xử lý workflow phức tạp (page detail)?"
- "Có workflow approval không? Single-step hay multi-step?"
- "Số field UI ước lượng (cho thấy phù hợp drawer hay page)?"
- "User là backoffice operator được train, hay user mới lần đầu dùng?"

---

## Clarify

### Minimum-required (blocking)
1. **Module name** — which existing module, or "create new module" with name
2. **Entity name** (camelCase identifier, e.g. `product`, `purchaseOrder`)
3. **Display label** (VI: full diacritics, e.g. "Đơn mua hàng")
4. **Detail layout** — one of: `side-drawer`, `UnifiedCompact`, `UnifiedSplit`, `AdaptiveSplitDetail` (or "let me infer from field count + workflow")
5. **Workflow** — yes / no; if yes, list transitions
6. **Test coverage** — `minimal` | `standard` (default) | `full`

### Useful-optional (defaults safe)
- Key list columns (auto-infer ≥3 from entity semantics if user skips)
- Key detail fields grouped by section (auto-infer if user skips)
- Validation rules (auto-infer required-vs-optional, range bounds for numerics)
- Import/export needs (default: none)
- Permission codes (default: derive from entity name)
- Architecture mode (default: `standalone-first`; ask only if portal mixes NgModule + standalone)
- Side-drawer width override (default: `md`)

### Question grouping (3-4 per turn)
**Block A — Identity**
1. Module name (existing or new?)
2. Entity name + display label
3. Test coverage level

**Block B — Layout & workflow**
4. Detail layout (default UnifiedCompact)
5. Workflow yes/no; if yes, transitions
6. Side-drawer vs full-page (auto-infer if user skipped)

**Block C — Fields**
7. Key fields (or "infer from entity semantics")
8. Validation peculiarities (or "use defaults")

### Field inference rules
When user skips fields, infer from entity name + portal conventions:
- Identity: `code`, `name` / `title`
- Classification: `category` / `type` / `status` (with enum candidates from entity domain)
- Quantitative: `amount` / `price` / `quantity` / `total` (currency = VND default for VI portals)
- Temporal: `effectiveDate` / `dueDate` / `createdAt` / `updatedAt`
- Owner: `ownerId` / `assigneeId` / `departmentId`
- Notes: `description` / `note` (textarea, optional)
- Attachments: `attachments[]` if entity domain implies file upload
- Audit: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` (always in DTO; never in SaveReq)

For VI portals, all labels use full diacritics.

### Summary template
```
## Đã chốt — sẵn sàng spec

| | |
|---|---|
| **Module** | <module> (existing | new) |
| **Entity** | <entityCamel> — "<Display Label VI>" |
| **Layout** | <UnifiedCompact | UnifiedSplit | AdaptiveSplitDetail | side-drawer> |
| **Workflow** | <none | submit-approve-reject | …> |
| **Fields** | <N> SaveReq + <M> read-only DTO fields |
| **Tests** | <minimal | standard | full> |

→ Tiếp theo: `sdcorejs-write-spec` để mình draft spec.
```

---

## Spec

### Path conventions
- Module folder: `src/libs/<module>/`
- Module bootstrap files: `src/libs/<module>/<module>.configuration.ts`, `<module>.module.ts`, `routes.ts`, `guards/`, `configurations/`
- Entity folder: `src/libs/<module>/features/<entity>/`
- Entity bootstrap: `<entity>.routes.ts`, `services/<entity>.{model,service,mock-data}.ts`, `pages/{list,detail}/{list,detail}.component.ts`
- Tests: alongside source, `.spec.ts` suffix

### Architecture section emphasis
Capture:
- Standalone-first vs hybrid NgModule mode
- Which Core UI components are central (sd-table, sd-section, sd-anchor-v2, etc.)
- Mock-first vs real-API readiness
- Permission codes introduced
- Upload-file configuration if relevant (must be at app root in `main.ts`)

### Acceptance criteria examples
- [ ] User can navigate to `/<module>/<entity>` and see ≥20 seed rows
- [ ] Create form validates: `<field>` required, `<other>` range 0-100 if `<condition>`
- [ ] Update preserves audit fields; `createdAt` unchanged after edit
- [ ] List filter by `<field>` returns only matching rows
- [ ] All Vietnamese labels render with full diacritics
- [ ] Permission `<MODULE>:<ENTITY>:CREATE` blocks non-authorized users
- [ ] (If workflow) Submit moves status DRAFT → PENDING; Approve moves PENDING → APPROVED

---

## Plan

### Phase grouping
1. **Module bootstrap** (only if new module): configuration, api configuration, guard, module, routes, register in app.routes + main.ts
2. **Entity model + service + mock**: model.ts, mock-data.ts, service.ts (MockCrudStore), index.ts
3. **Entity routes + components**: `<entity>.routes.ts`, `pages/list/list.component.ts`, `pages/detail/detail.component.ts`
4. **Workflow (if enabled)**: workflow actions wiring via `31-workflow-actions`
5. **Form refinement (if non-trivial)**: custom validators, conditional fields via `30-reactive-form`
6. **Tests** (matching coverage level): `.routes.spec.ts`, `.list.component.spec.ts`, `.detail.component.spec.ts`

### Verification commands
```bash
npm install                                                                                                   # only if new portal
npm run build-dev                                                                                             # expect exit 0
npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts
# Manual smoke
# Open http://localhost:4200/<module>/<entity> — verify list renders 20+ seed rows
# Click "Tạo mới" → fill form → save → expect record appears in list
```

### Side-drawer variant
If layout is `side-drawer`, omit `pages/detail/` and add `components/detail-side-drawer/detail-side-drawer.component.ts` instead. Keep `pages/list/list.component.ts`.

### Standard-coverage spec layer
- `*.routes.spec.ts` — routing guards + permission gating
- `*.list.component.spec.ts` — list rendering + filter + bulk action
- `*.detail.component.spec.ts` — form validation + CREATE/UPDATE/DETAIL state switching

### Final-step expectations
The last numbered step should reference the mandatory tail-call chain (40-e2e-test → 50-review-code → orchestration/repair-loop → orchestration/comment-code → orchestration/verify-before-done → orchestration/context-summarizer → orchestration/auto-task-tracker → orchestration/memories). The reviewer of the plan checks that this chain is implicit, not omitted.
