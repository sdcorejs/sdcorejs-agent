# Angular Portal Skills

Skills for building Angular applications using **@sd-angular/core** (future rename: **@sdcorejs/angular**).

Follows sdcorejs architectural patterns for enterprise Angular applications with strict, opinionated conventions.

This category assumes a **new portal repository** where the agent may need to resolve missing structure before generating UI.

---

## 📚 Available Skills

### 0. [Request Intake and Module Resolution Skill](angular-request-intake-skill.md)

Resolves incomplete user requests before generation starts.

**Handles:**
- Missing module name
- Missing display label
- Missing field definitions
- Decision whether to reuse or create a module
- Generation order for a new portal repo
- UI mode decision: side-drawer vs full page detail
- Page layout variant resolution: `UnifiedCompact` / `UnifiedSplit` / `AdaptiveSplitDetail`
- Ask-for-confirm flow when PRD/screenshot implies different detail layout

**Use when:** The user says things like `create CRUD screens for product` without enough architectural context.

---

### 0.5. [Portal Project Initialization Skill](angular-portal-project-init-skill.md)

Generates a brand-new portal repository from internal baseline templates in `core/templates/angular-portal-starter`, while keeping only the minimal starter pieces needed to boot locally.

**Generates/Keeps:**
- standalone Angular application shell
- `@sd-angular/core` integration
- requested environment files (`dev`, `qc`, `uat`, `prod`, ...)
- minimal auth/layout/permission configuration
- 1-2 example routes under `src/app/features/*`
- working `npm start` flow

**Use when:** The developer asks to initialize a new portal repo before any feature module exists.

**Example output:**
```text
portal-ops/
├── angular.json
├── package.json
├── src/main.ts
├── src/app/app.routes.ts
├── src/app/features/home/home.page.ts
├── src/app/features/about/about.page.ts
└── src/environments/
  ├── environment.dev.ts
  ├── environment.qc.ts
  ├── environment.uat.ts
  └── environment.prod.ts
```

---

### 1. [Entity CRUD Module Skill](angular-entity-crud-skill.md)

Generates complete entity management modules with full CRUD operations.

**Generates:**
- Service with mock-first CRUD (`localStorage`) by default; switch to BaseService/API mode when backend contract is explicit
- Data models (SaveReq interface + DTO type)
- List page component with SdTable and server-side pagination
- Detail page component with 3-state machine (CREATE/UPDATE/DETAIL)
- Route configuration with lazy loading
- Full-page detail anchor navigation using `sd-anchor-v2` when fields/sections are large
- Read-only DETAIL blocks with `sd-section` + `sd-section-item` for split detail dashboards

**Use when:** Creating entity management features (Product, Employee, Customer, etc.)

**Example output:**
```
libs/sample/modules/employee/
├── employee.routes.ts
├── services/
│   ├── employee.model.ts
│   └── employee.service.ts
└── pages/
    ├── list/list.component.ts
    └── detail/detail.component.ts
```

---

### 2. [Feature Module Configuration Skill](angular-module-configuration-skill.md)

Sets up the complete module infrastructure with configuration, interceptors, and guards.

**Generates:**
- Module configuration interface with InjectionToken
- API request/response interceptor configuration
- File upload configuration
- Route guards with permission checking
- Module routes with lazy-loaded children

**Use when:** Creating a new feature module container that will hold multiple entities

**Example output:**
```
libs/sample/
├── sample.configuration.ts
├── routes.ts
├── configurations/
│   ├── api.configuration.ts
│   └── upload-file.configuration.ts
└── guards/
    └── sample.guard.ts
```

---

### 3. [Reactive Form with Validation Skill](angular-reactive-form-skill.md)

Creates reactive forms with comprehensive validation, custom validators, and error handling.

**Generates:**
- Lightweight model-binding FormGroup and save-boundary validation
- Built-in validators (required, minLength, maxLength, min, max, pattern)
- Custom validator implementations
- Error message mapping for user feedback
- Support for dynamic FormArray fields

**Use when:** Building complex forms with validation rules, custom validators, or dynamic fields

**Example output:**
- Form initialization in ngOnInit
- Custom validator classes
- Error message display logic
- FormArray handling for dynamic fields

---

### 4. [Workflow Actions in Detail and List](angular-workflow-actions-skill.md)

Adds state-based business actions in detail and bulk actions in list.

**Generates:**
- Detail action set by state (save, submit, approve, reject, edit)
- Conditional visibility by permission and business flags (`editable`, `approvable`)
- Bulk selector actions in list when multi-record operations are needed
- Confirm dialog and notify patterns for transitions

**Use when:** Entity requires approval/submission lifecycle or mass actions on list.

---

## 🔄 Integration Example

Creating a complete "Product" module:

### Step 0: Resolve Request Context
Use **Request Intake and Module Resolution Skill**
```bash
Input: "Tạo CRUD cho product"
Agent behavior:
  - Ask: product thuộc module nào?
  - If user says chưa có module: propose/create module `catalog` or `product`
  - If form is common with 5-6 fields: choose side-drawer by default
  - Then continue with module configuration + entity CRUD
```

### Step 1: Module Configuration
Use **Feature Module Configuration Skill**
```bash
Input: "Set up Product module with API host http://localhost:3000/api/v1/product"
Output: 
  - product.configuration.ts
  - routes.ts (with providers)
  - configurations/api.configuration.ts
  - guards/product.guard.ts
```

### Step 2: Entity CRUD
Use **Entity CRUD Module Skill**
```bash
Input: "Create Product entity with fields: code, name, price, category, stock"
Output:
  - modules/product/services/product.model.ts
  - modules/product/services/product.service.ts
  - modules/product/pages/list/list.component.ts
  - modules/product/pages/detail/detail.component.ts
  - modules/product/product.routes.ts
```

### Step 3: Enhanced Validation
Use **Reactive Form Skill** to customize
```
- Add custom validator for SKU format
- Configure category dropdown with async options
- Add quantity validation (positive number)

### Step 4: Workflow Actions (Optional)
Use **Workflow Actions Skill**
```
- Add detail actions: Save & Submit, Approve, Reject, Edit
- Add list bulk actions: Submit selected / Approve selected / Reject selected
```
```

### Result: Complete Product Module
```

---

## ✅ Mandatory Generation Pipeline

When handling large generation requests, always follow this order:

1. Initialize portal starter
2. Initialize target module (lib)
3. Generate entity CRUD pages/services/routes
4. Ensure generated CRUD can run immediately with mock data (default: localStorage)
5. Run post-generation validation checklist

If any step is skipped, the generation is considered incomplete.

## 🧱 Internal Baseline Rule

For starter generation, always use internal templates bundled in this repository:

1. `core/templates/angular-portal-starter/package.template.json`
2. `core/templates/angular-portal-starter/tsconfig.template.json`
3. `core/templates/angular-portal-starter/structure.txt`

Do not depend on sibling workspace folders as source templates.

---

## 🧭 Global Guardrails

These rules apply to all skills in this category:

1. Do not modify global CSS/SCSS files during feature generation.
  - Forbidden by default: `src/styles.scss`, global theme bundles, shared reset files.
2. Prefer Core UI components first.
  - If Core UI does not provide a required component, the agent must explicitly warn developer that this part is custom-written.
3. Always run a double-check pass after generation.
  - Verify routes, providers, permission keys, upload keys, and compile status.
4. Reply language must follow developer language.
  - Vietnamese input -> Vietnamese response.
  - English input -> English response.

---

## 🤝 Cross-Model Compatibility Contract (Claude/Gemini/Codex)

To keep behavior consistent across model families, all portal skills must follow this shared contract:

1. Same skill order and blocking clarifications
  - Request intake -> portal init (if needed) -> module init -> entity CRUD -> form/workflow refine.
  - If module is missing, always ask first. Do not guess.
2. Same output envelope
  - Every generation response should include: `Resolved Context`, `Planned Skill Chain`, `Files To Create/Update`, `Post-Gen Double Check`.
3. Same fallback defaults
  - Vague fields -> generate minimal CRUD skeleton first.
  - No API contract -> use localStorage mock CRUD first.
  - 5-6 common fields -> side-drawer preference.
  - many sections/long form -> page detail; consider `sd-anchor-v2`.
4. Same safety boundaries
  - Never modify global CSS/SCSS unless developer explicitly asks.
  - Prefer Core UI components first; if custom UI is needed, warn explicitly.
5. Same language behavior
  - Detect developer language and answer in the same language.

If one model behaves differently, the agent should restate and enforce this contract before generating code.
libs/product/
├── product.configuration.ts
├── routes.ts
├── configurations/
│   ├── api.configuration.ts
│   └── upload-file.configuration.ts
├── guards/
│   └── product.guard.ts
├── services/
│   ├── base/
│   │   ├── base.model.ts
│   │   └── base.service.ts
│   └── index.ts
└── modules/
    └── product/
        ├── product.routes.ts
        ├── services/
        │   ├── product.model.ts
        │   └── product.service.ts
        ├── pages/
        │   ├── list/list.component.ts
        │   └── detail/detail.component.ts
        └── index.ts
```

---

## 🏗️ Architecture Overview

## 🔐 SdPermission Quick Guide (Agent + Dev)

Use this as the default rule when generating or reviewing permission-related code.

1. Register `SD_PERMISSION_CONFIGURATION` at app root (`main.ts`).
2. If system has multiple permission domains, each configuration MUST have a unique `key`.
3. Route-level permission checks MUST include:
  - `data.permission`: permission code (`<MODULE>_C_<ENTITY>_<ACTION>`)
  - `data.permissionKey`: matching configuration key (optional for default key `undefined`)
4. In templates, use directive with key when needed:
  - `*sdPermission="'SAMPLE_C_EMPLOYEE_CREATE'; sdPermissionKey: 'sample'"`
5. Do not expect module/route local `SD_PERMISSION_CONFIGURATION` providers to be auto-visible to root-scoped `SdPermissionService`.

### Dev Checklist (Permission)
- Confirm permission configuration is provided in `main.ts`.
- Confirm every configuration key is unique (`undefined` is also treated as a key).
- Confirm route `permissionKey` matches the intended configuration key.
- Confirm UI actions use `sdPermission` and `sdPermissionKey` consistently.
- Confirm no manual duplicated permission logic is added in components when route guard/directive already handles it.

## 📎 SdUploadFile Quick Guide (Agent + Dev)

Use this as the default rule when generating upload-file configuration code.

1. Register `SD_UPLOAD_FILE_CONFIGURATION` at app root (`main.ts`) with `multi: true`.
2. Use `key = undefined` for portal default upload configuration.
3. Use explicit key per module upload configuration (for example `key = 'sample'`, `key = 'crm'`).
4. For module-specific screens/components, pass `[key]` to `sd-upload-file` so it resolves the right upload/details/download handlers.
5. Do not rely on module route-level upload providers when upload resolution is expected from root-scoped consumers.

### Dev Checklist (Upload)
- Confirm upload-file configurations are provided in `main.ts`.
- Confirm each upload configuration key is unique (`undefined` is allowed only as portal default).
- Confirm module upload config uses a non-empty module key.
- Confirm `sd-upload-file` usages in module screens pass matching `[key]` where needed.

### Module Structure
```
libs/[module]/
├── [module].configuration.ts              # Configuration interface
├── routes.ts                              # Module routes + providers
├── configurations/
│   ├── api.configuration.ts               # API interceptors
│   ├── upload-file.configuration.ts       # File upload config
│   └── index.ts
├── guards/
│   └── [module].guard.ts                  # Route guard
├── services/
│   ├── base/                              # Base service for CRUD
│   │   ├── base.model.ts
│   │   └── base.service.ts
│   └── index.ts
├── modules/
│   ├── [entity1]/                         # Entity module 1
│   │   ├── [entity1].routes.ts
│   │   ├── services/
│   │   │   ├── [entity1].model.ts
│   │   │   └── [entity1].service.ts
│   │   ├── pages/
│   │   │   ├── list/list.component.ts
│   │   │   └── detail/detail.component.ts
│   │   └── index.ts
│   └── [entity2]/                         # Entity module 2
│       └── (same structure)
└── index.ts
```

### Key Patterns

#### Service Pattern
```typescript
// Extends BaseService for generic CRUD
export class ProductService extends BaseService {
  readonly #api = this.register<ProductDTO, ProductSaveReq>('product');
  paging = this.#api.paging;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
```

#### List Component Pattern
```typescript
// Standalone with @SdTabComponent decorator
@Component({...})
@SdTabComponent({component: ListComponent, name: 'Products'})
export class ListComponent implements OnInit {
  tableOption!: SdTableOption<ProductDTO>;
  
  ngOnInit(): void {
    this.tableOption = {
      type: 'server',
      items: async (_, req) => this.#service.paging(req),
      columns: [...]
    };
  }
}
```

#### Detail Component Pattern
```typescript
// 3-state machine: CREATE/UPDATE/DETAIL
export class DetailComponent implements OnInit {
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  form!: FormGroup;
  entity: Partial<ProductSaveReq> = {};
  
  ngOnInit(): void {
    this.#initializeForm();
    // Determine state and load data if needed
  }
}
```

---

## ✅ Architecture Rules

### MUST DO ✅
- Resolve module ownership before generating entity screens
- Ask for module name if the entity request does not specify one
- Create the feature module first if it does not exist
- Extend `BaseService` for entity services
- Provide services at **route level** (NOT `providedIn: 'root'`)
- Use `FormBuilder` for all forms with `Validators`
- Implement 3-state pattern in detail pages
- Use `@SdTabComponent` decorator on list pages
- Lazy-load all routes with `loadComponent()` / `loadChildren()`
- Use `[(model)]="entity.field"` binding with `[form]="form"`
- Validate form before submission (`form.invalid` check)
- Use `SdTable` with server-side pagination (`type: 'server'`)
- Upload files BEFORE saving entity
- Define configuration interfaces with `InjectionToken`

### MUST NOT ❌
- Generate entity files before resolving which module owns them
- Mix standalone and NgModule approaches
- Use `providedIn: 'root'` for entity services
- Hard-code API URLs (inject via configuration)
- Add business logic to components
- Skip form validation
- Create circular module dependencies
- Directly import non-scoped components

---

## 📖 Complete Skill Reference

For detailed examples and templates, see:

1. **[Request Intake Skill](angular-request-intake-skill.md)** - clarification and generation order
1. **[Entity CRUD Module Skill](angular-entity-crud-skill.md)** - 1000+ lines with complete examples
2. **[Feature Module Configuration Skill](angular-module-configuration-skill.md)** - 600+ lines with setup guide
3. **[Reactive Form Skill](angular-reactive-form-skill.md)** - 800+ lines with validation patterns

Each skill includes:
- Clear description of what it generates
- Explicit MUST DO / MUST NOT rules
- Complete code templates
- Real-world example (Product module)
- Implementation checklist

---

## 🚀 Quick Links

- [Copilot Instructions](../../.github/copilot-instructions.md) - Agent guidelines
- [Main Skills Index](../ANGULAR-SKILLS-INDEX.md) - Skills overview
- [Architecture Overview](../../README.md) - Project structure
- [Core Utilities](../../core/README.md) - Shared helpers

---

## 🔮 Future: @sdcorejs/angular

These skills are designed for `@sd-angular/core` and will transition to `@sdcorejs/angular` package in future versions. The architecture patterns will remain the same.

