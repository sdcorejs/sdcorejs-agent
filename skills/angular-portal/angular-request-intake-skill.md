# Angular Skill: Request Intake and Module Resolution

## 1. Skill Name
**Request Intake and Module Resolution**

## 2. Description
Resolves incomplete UI generation requests for a new Angular portal using Core UI. This skill decides whether the agent has enough information to generate screens immediately, whether it must ask for clarification, or whether it must create a feature module before generating an entity such as `product`.

This skill exists because in sdcorejs architecture every CRUD screen belongs to a feature module. An entity request without module ownership is incomplete.

## 3. Rules

### MUST DO ✅
- Treat module ownership as required context for every entity request
- Ask for the module name if the user requests an entity UI without specifying its module
- Offer to create a new module if there is no suitable module yet
- Apply module configuration skill first when creating a brand-new module
- Reduce the first clarification round to the minimum required questions
- Generate a minimal CRUD skeleton if the module is known but the fields are only partially defined
- Prefer `side-drawer` for common entity forms with around 5-6 fields
- For common flows, ensure side-drawer content fits without vertical scroll in typical desktop viewport
- Preserve sdcorejs generation order: request resolution -> module setup -> entity CRUD -> form refinement
- When user provides implementation improvements/conventions, ask whether to update the skill library if they did not explicitly request skill updates

### MUST NOT ❌
- Start generating entity files when module ownership is still ambiguous
- Assume an entity belongs to a module without user confirmation when more than one module is plausible
- Ask for every optional detail up front if a minimal skeleton can be produced safely
- Skip module creation when the user confirms no suitable module exists
- Default to full page detail for short, common forms when side-drawer is sufficient

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
  Generate minimal screens with standard fields
  - code
  - name
  - isActivated
  Then refine the detail form after clarification

If detail style is missing:
  Use heuristics:
  - 5-6 common fields -> side-drawer
  - many groups/sections or large table + attachments -> full page detail

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
- workflow actions needed in detail (submit, approve, reject, etc.)
- workflow actions needed in list (bulk submit, bulk approve, bulk reject)

Default detail style if user does not choose:
- `side-drawer` for 5-6 common fields and quick CRUD
- `page` for complex workflows (approval, multi-section, child table)

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
   - product list page
   - product detail page
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
2. Entity CRUD Module Skill -> tạo libs/catalog/modules/product
3. Reactive Form Skill -> refine form field cho product
```

## Implementation Checklist

- [ ] Detect entity name from request
- [ ] Detect whether module name exists in request
- [ ] Ask for module if missing
- [ ] Offer new module creation if needed
- [ ] Route generation through module skill first when module is absent
- [ ] Allow minimal first-pass CRUD when only core fields are known
- [ ] Hand off to entity and form skills in the correct order