---
name: angular-portal-clarify-requirements
description: Use when the user requests an Angular portal screen / module / entity but has not specified module ownership, entity name, key fields, or scope (create/update/detail). Asks blocking clarifying questions before any code is generated. Triggers - "tạo CRUD cho ...", "thêm entity", "create screen", "build module", or any request missing module/entity/fields context. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# Angular Skill: Request Intake and Module Resolution

## 1. Skill Name
**Request Intake and Module Resolution**

## 2. Description
Resolves incomplete UI generation requests for a new Angular portal using Core UI. This skill decides whether the agent has enough information to generate screens immediately, whether it must ask for clarification, or whether it must create a feature module before generating an entity such as `product`.

This skill exists because in sdcorejs architecture every CRUD screen belongs to a feature module. An entity request without module ownership is incomplete.

This skill also normalizes inputs from PRD text, UI screenshots, and sample cURL contracts before handing off to module/entity generation skills.

## 3. Rules

### MUST DO ✅
- Treat module ownership as required context for every entity request
- Detect developer language from request and respond in the same language
- Ask for the module name if the user requests an entity UI without specifying its module
- Offer to create a new module if there is no suitable module yet
- Apply module configuration skill first when creating a brand-new module
- Reduce the first clarification round to the minimum required questions
- If the module is known but the user does not provide fields, infer a first-pass semantic schema from the entity meaning before generating code
- Generate concrete first-pass fields for `SaveReq`, `DTO`, list columns, and detail form based on the entity domain instead of falling back to only `code`, `name`, `isActivated`
- For Vietnamese portals, generate field labels, column titles, and default action text in Vietnamese with proper diacritics
- Infer field groups from entity semantics such as identity, classification, status, amount, date/time, owner, note, attachment, and audit information
- Keep the inferred schema specific enough to render runnable list/detail screens, then refine after user feedback if needed
- Use only knowledge and templates stored in `sdcorejs-agent` during generation; do not require runtime reads from external sample repositories
- Resolve input sources in this order when available: PRD text -> UI screenshot/attribute image -> sample cURL request/response
- Build a normalized field contract from those inputs: list fields, detail fields, required flags, enum candidates, and API payload hints
- If no PRD/screenshot/cURL exists, build the normalized field contract from entity semantics plus known portal conventions from the current repository
- Prefer `side-drawer` for common entity forms with around 5-6 fields
- For common flows, ensure side-drawer content fits without vertical scroll in typical desktop viewport
- Choose detail style from inferred complexity, not only raw field count:
  - `side-drawer` for quick CRUD with one business section, few editable fields, and no child tables/attachments/workflow blocks
  - `page` for entities with multiple business sections, long textarea content, file uploads, child tables, approval/workflow actions, or many derived read-only fields
- For page-based detail flows, classify layout into one of 3 variants and confirm when ambiguous:
  - `UnifiedCompact`: same layout for CREATE/UPDATE/DETAIL, no split title/form columns
  - `UnifiedSplit`: same split layout for CREATE/UPDATE/DETAIL (left title, right form/content)
  - `AdaptiveSplitDetail`: CREATE/UPDATE use editable split layout, DETAIL uses different read-only split layout
- If PRD indicates many fields/sections, propose using `sd-anchor-v2` together with section grouping for faster scroll navigation
- Preserve sdcorejs generation order: request resolution -> module setup -> entity CRUD -> form refinement
- For large requests, enforce full generation order: portal init -> module init -> CRUD generation -> mock data readiness -> double-check
- If test coverage level is not explicitly provided, default to `standard` spec coverage for generated module/entity
- Enforce blocking clarification checklist before generating entity screens in new portal repos:
  - module name (first blocking item)
  - entity name
  - display label
  - key list fields
  - key detail fields
  - confirm create/update/detail scope
- Default full-page entity contract uses 2 page components (`pages/list`, `pages/detail`), with URL-driven states on detail (`/create`, `/update/:id`, `/detail/:id`); side-drawer is explicit compact exception
- Detect whether target project is standalone-first or hybrid NgModule+standalone and select compatible generation path
- When generation includes permission configuration, ensure `SD_PERMISSION_CONFIGURATION` is provided at app root (`main.ts`) for root-scoped permission service
- When generation includes upload-file configuration, ensure `SD_UPLOAD_FILE_CONFIGURATION` is provided at app root (`main.ts`) and keyed by module (`key='moduleName'`, portal default `key=undefined`)
- When user provides implementation improvements/conventions, ask whether to update the skill library if they did not explicitly request skill updates
- Apply token budget mode by model class:
  - low-cost model: strict checklist + template-first output, minimal narrative
  - high-capability model: same checklist, but compress repeated rationale and avoid duplicated examples
- Support developer Q&A mode when user asks architecture questions instead of generation; answer from existing skill/template rules first

### MUST NOT ❌
- Start generating entity files when module ownership is still ambiguous
- Assume an entity belongs to a module without user confirmation when more than one module is plausible
- Ask for every optional detail up front if a strong semantic first pass can be produced safely
- Skip module creation when the user confirms no suitable module exists
- Default to full page detail for short, common forms when side-drawer is sufficient
- Reply in a language different from the developer language without explicit request
- Lock into one page layout variant without clarifying when PRD/screenshot suggests another variant
- Ignore provided screenshot or cURL contract when they contain useful field/layout/API clues
- Generate placeholder Vietnamese labels without diacritics when the portal language is Vietnamese
- Fall back to a generic three-field CRUD if the entity semantics clearly suggest richer domain fields

## 4. Template

### Decision Template
```text
Input received
-> Detect entity name
-> Check whether module name is present

If module name is missing:
  Ask:
  - Entity này thuộc module nào?
  - Nếu chưa có module, tôi sẽ tạo module mới. Bạn muốn tên module là gì?

If user does not know module name:
  Propose:
  - create a new module named after the domain
  - examples: catalog, sales, inventory, product

If module exists:
  Continue to entity CRUD skill

If module does not exist:
  Apply feature module configuration skill first
  Then continue to entity CRUD skill

If fields are incomplete:
  Infer a semantic field matrix from the entity name and portal conventions
  - identity fields: code, name/title
  - domain fields: category/type/amount/date/status/owner/note/attachment as relevant
  - list columns: compact overview fields with Vietnamese labels if portal language is Vietnamese
  - detail fields: editable fields grouped by business section
  - SaveReq: writable fields only
  - DTO: SaveReq + read-only display/audit/meta fields if relevant
  Then refine the detail form after user feedback if needed

If PRD text + screenshot/cURL are provided:
  Normalize to one field matrix before generation:
  - list columns
  - detail create/update editable fields
  - detail read-only fields
  - inferred validators
  - payload/response mapping

If detail style is missing:
  Use heuristics:
  - one section, short fields, no child table/upload/workflow -> side-drawer
  - many groups/sections, textarea-heavy form, child table, attachments, or workflow -> full page detail
  - if semantic schema suggests mostly quick-edit metadata, prefer side-drawer even when field count is slightly above 6

If page detail is chosen but layout variant is unclear:
  Ask:
  - "Bạn muốn layout dạng UnifiedCompact, UnifiedSplit hay AdaptiveSplitDetail?"

If PRD has many sections/long form:
  Suggest:
  - "Mình sẽ dùng sd-anchor-v2 + sd-anchor-item-v2 để tạo thanh neo scroll nhanh theo từng section, bạn giữ phương án này chứ?"

If user gives improve feedback (for example naming, layout, filter, permission convention):
  Ask one follow-up before ending task:
  - "Bạn có muốn mình cập nhật rule này vào skills luôn không?"
```

### Clarification Contract
```text
Minimum required:
- module name
- entity name
- display label

Useful but optional for first pass:
- list page columns
- detail page fields
- validation rules
- import/export requirements
- side drawer vs page detail style
- page layout variant if using full page (`UnifiedCompact` / `UnifiedSplit` / `AdaptiveSplitDetail`)
- input source artifacts (PRD section, screenshot, attribute image, cURL sample)
- workflow actions needed in detail (submit, approve, reject, etc.)
- workflow actions needed in list (bulk submit, bulk approve, bulk reject)
- architecture mode (`standalone-first` or `hybrid-ngmodule-standalone`)

Default detail style if user does not choose:
- `side-drawer` for quick CRUD with one compact section and no heavy supporting blocks
- `page` for complex workflows (approval, multi-section, child table, attachment-heavy form, or large read-only summary)

Semantic first-pass contract when user omits fields:
- infer 5-10 domain-relevant fields from the entity name
- keep labels human-readable and in the portal language; Vietnamese must use proper diacritics
- include at least 3 useful list columns beyond action/status when the entity semantics allow it
- define clear writable fields for `SaveReq`
- define read-only/detail-only fields for `DTO` when semantics suggest status/audit/approval information
- choose side-drawer or page after evaluating section count, control types, and workflow complexity

If workflow actions are mentioned:
- mark `workflow-enabled` for the entity
- apply workflow actions skill after CRUD scaffold
```

### Agent Response Template
```text
User: "Tạo CRUD cho product"

Agent:
1. Product thuộc module nào?
2. Nếu chưa có module, tôi sẽ tạo module mới trước.
3. Sau đó tôi sẽ sinh:
   - module configuration
  - product SaveReq/DTO suy luận theo ngữ nghĩa sản phẩm
  - product list page với các cột cụ thể như Mã sản phẩm, Tên sản phẩm, Loại sản phẩm, Giá bán
  - product detail page theo side-drawer hoặc page tùy độ phức tạp của schema suy luận
  - product service/model/routes
```

## 5. Example Input

```text
Tạo các màn hình CRUD cho sản phẩm với các thuộc tính như mã sản phẩm, tên sản phẩm.
```

## 6. Example Output

```text
Phát hiện thiếu context: module của Product chưa được xác định.

Câu hỏi tiếp theo:
"Sản phẩm thuộc module nào? Ví dụ: catalog, sales, inventory.
Nếu chưa có module, tôi sẽ tạo module mới trước rồi sinh CRUD cho product."

Nếu user trả lời:
"Chưa có module, tạo mới catalog"

Thì thứ tự skill sẽ là:
1. Feature Module Configuration Skill -> tạo libs/catalog
2. Entity CRUD Module Skill -> suy luận schema sản phẩm rồi tạo libs/catalog/modules/product
3. Reactive Form Skill -> refine form field cho product
```

## Implementation Checklist

- [ ] Detect entity name from request
- [ ] Detect whether module name exists in request
- [ ] Ask for module if missing
- [ ] Offer new module creation if needed
- [ ] Route generation through module skill first when module is absent
- [ ] Infer semantic first-pass CRUD when fields are omitted or only partially known
- [ ] Ensure Vietnamese labels use proper diacritics when the portal language is Vietnamese
- [ ] Choose detail style from inferred complexity rather than a hard-coded fallback
- [ ] Hand off to entity and form skills in the correct order