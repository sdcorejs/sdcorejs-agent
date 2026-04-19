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

**Use when:** The user says things like `create CRUD screens for product` without enough architectural context.

---

### 1. [Entity CRUD Module Skill](angular-entity-crud-skill.md)

Generates complete entity management modules with full CRUD operations.

**Generates:**
- Service extending BaseService with CRUD methods
- Data models (SaveReq interface + DTO type)
- List page component with SdTable and server-side pagination
- Detail page component with 3-state machine (CREATE/UPDATE/DETAIL)
- Route configuration with lazy loading

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

