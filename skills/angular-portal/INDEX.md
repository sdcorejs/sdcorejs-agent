# Angular Skills Library

## Overview
Reusable skills for generating Angular modules following sdcorejs architecture. Each skill is self-contained but works together to create complete feature modules.

---

## 📚 Available Skills

### 0. Request Intake and Module Resolution Skill
**File:** [angular-request-intake-skill.md](angular-request-intake-skill.md)

Resolves incomplete requests before any UI generation starts.

**Key Responsibilities:**
- Detect missing module context
- Decide whether to reuse an existing module or create a new one
- Ask the minimum required clarification questions
- Choose generation order: module first, entity second, form refinement third
- Choose detail UI mode: side-drawer for small common forms, page for complex workflows

**When to use:**
- User asks for CRUD screens but omits module name
- User describes a new entity in a brand-new portal repo
- User gives only business name and a few fields

**Example:** "Create Product CRUD screens with product code and product name"

**Outputs:**
- Clarified generation plan
- Target module decision
- Minimal field contract for list/detail screens

---

### 0.5. Portal Project Initialization Skill
**File:** [angular-portal-project-init-skill.md](angular-portal-project-init-skill.md)

Generates a new portal repository from internal baseline templates in `core/templates/angular-portal-starter`, trimmed to a starter that does not yet include business libs.

**Key Responsibilities:**
- Resolve project name and target environments
- Keep `@sd-angular/core` integrated and version-pinned
- Remove demo/business lib references from routes and tsconfig paths
- Generate 1-2 working example routes in `src/app/features/*`
- Preserve standalone bootstrap, core configuration, and plop generators
- Verify the new starter with `npm install` and `npm start`

**When to use:**
- Developer asks to initialize a brand-new portal repo
- Team needs a clean starter before creating modules/entities
- Request looks like: `Khoi tao du an portal-ops co dev, qc, uat, prod`

**Outputs:**
- Starter Angular portal repo
- Multi-environment configuration
- Minimal shell + example routes
- Verified local startup flow

---

### 1. Entity CRUD Module Skill
**File:** [angular-entity-crud-skill.md](angular-entity-crud-skill.md)

Generates complete entity management with service, models, list and detail pages.

**Key Components:**
- Service with mock-first CRUD (`localStorage`) by default; switch to BaseService/API mode when backend contract is explicit
- Models (SaveReq + DTO)
- List page with SdTable and pagination
- Detail page with 3-state machine (CREATE/UPDATE/DETAIL)
- Route configuration with lazy loading
- External filter layout convention: nếu số filter ít (ví dụ `<=4`) thì dùng `externalFilterPerRow: 4`; nếu chỉ còn 1 hàng filter thì `hideExternalFilterToolbar: true`

**When to use:**
- Creating new entity management modules
- Building CRUD interfaces for any resource
- Implementing list and detail pages

**Example:** "Create Product CRUD module with list and detail pages"

**Outputs:**
- `[entity].model.ts` - Data models
- `[entity].service.ts` - API service
- `pages/list/list.component.ts` - List page
- `pages/detail/detail.component.ts` - Detail page
- `[entity].routes.ts` - Route configuration

---

### 2. Feature Module Configuration Skill
**File:** [angular-module-configuration-skill.md](angular-module-configuration-skill.md)

Sets up module-level configuration, interceptors, and guards that multiple entities share.

**Key Components:**
- Module configuration interface
- API interceptors (request/response handlers)
- Upload file configuration
- Route guards
- Dependency injection setup

**When to use:**
- Creating a new feature module
- Setting up API configuration for a module
- Configuring module-level interceptors
- Setting up permissions and guards

**Example:** "Set up Sample module with API host and error handling"

**Outputs:**
- `[module].configuration.ts` - Configuration interface
- `configurations/api.configuration.ts` - API interceptor
- `configurations/upload-file.configuration.ts` - File upload config
- `guards/[module].guard.ts` - Route guard
- `routes.ts` - Module routes with providers

---

### 3. Reactive Form with Validation Skill
**File:** [angular-reactive-form-skill.md](angular-reactive-form-skill.md)

Creates reactive forms with comprehensive validation and error handling following sdcorejs patterns.

**Key Components:**
- FormBuilder setup
- Validation rules (required, length, format)
- Custom validators
- Error message mapping
- Form state management (touched, valid, pristine)

**When to use:**
- Building forms for entity creation/update
- Adding complex validation logic
- Creating dynamic form arrays
- Implementing conditional validation

**Example:** "Create form for Product with code, name, price validation"

**Outputs:**
- Form validation setup
- Error message handling
- Custom validator implementations
- FormArray for dynamic fields

---

### 4. Workflow Actions in Detail and List
**File:** [angular-workflow-actions-skill.md](angular-workflow-actions-skill.md)

Defines workflow actions for entity lifecycle and bulk operations.

**Key Components:**
- Detail header actions by state: save, submit, approve, reject, edit
- Permission-driven action visibility
- Bulk selector actions in list for multi-record transitions
- Confirm + notify flow for state changes

**When to use:**
- Approval workflow exists
- Submit/reject lifecycle is required
- Business needs bulk transitions from list screen

**Example:** "Add submit/approve/reject on detail and bulk submit on list"

**Outputs:**
- Action templates for detail and list
- Service transition method contracts
- State-based visibility rules

---

## 🔄 Skill Integration Flow

## 🔁 Improvement Sync Rule

- Khi user nhắc một convention/improve mới trong quá trình code review hoặc refine UI, agent phải chủ động hỏi: `Bạn có muốn mình cập nhật rule này vào skills luôn không?` nếu user chưa yêu cầu rõ việc update skill.

### Creating a New Feature Module (Complete Example)

**-1. Start with Portal Project Initialization Skill when repo does not exist yet**
```
Input: "Khoi tao du an portal-starter-moi co dev, qc, uat va prod"
Output:
  - new portal repo scaffolded from internal baseline templates
  - @sd-angular/core kept in place
  - only shell/config/environments/example routes remain
  - npm install + npm start verification
```

**0. Start with Request Intake Skill**
```
Input: "Create Product CRUD screens"
Output:
  - Missing context detected: module name
  - Ask whether Product belongs to an existing module
  - If no: create new module first
```

**1. Start with Feature Module Configuration Skill**
```
Input: "Set up Sample module with Employee and Department entities"
Output: 
  - libs/sample/sample.configuration.ts
  - libs/sample/configurations/api.configuration.ts
  - libs/sample/guards/sample.guard.ts
  - libs/sample/routes.ts (skeleton with providers)
```

**2. Use Entity CRUD Module Skill for Each Entity**
```
Input: "Create Employee CRUD with fields: code, name, salary"
Output:
  - libs/sample/modules/employee/services/employee.model.ts
  - libs/sample/modules/employee/services/employee.service.ts
  - libs/sample/modules/employee/pages/list/list.component.ts
  - libs/sample/modules/employee/pages/detail/detail.component.ts
  - libs/sample/modules/employee/employee.routes.ts
```

**3. Customize with Reactive Form Skill**
```
Input: "Add validation to Employee form: code (required, unique), name (required, max 255)"
Output:
  - Enhanced detail.component.ts with lightweight or strict mode (based on complexity)
  - Custom validators
  - Error message mapping
```

**4. Register in Root Routes**
```typescript
// app.routes.ts
export const routes: Routes = [
  { 
    path: 'sample', 
    loadChildren: () => import('@sample').then(m => m.sampleRoutes) 
  },
];
```

---

## 🏗️ Architecture Patterns

### Module Structure
```
libs/[module]/
├── [module].configuration.ts           # Module config interface
├── routes.ts                           # Module routes (uses Feature Config skill)
├── configurations/
│   ├── api.configuration.ts            # API interceptors
│   ├── upload-file.configuration.ts    # File upload config
│   └── index.ts
├── guards/
│   ├── [module].guard.ts               # Route guard
│   └── index.ts
├── services/
│   ├── base/
│   │   ├── base.model.ts
│   │   └── base.service.ts
│   └── index.ts
├── modules/
│   ├── [entity1]/
│   │   ├── [entity1].routes.ts         # Uses Entity CRUD skill
│   │   ├── services/
│   │   │   ├── [entity1].model.ts
│   │   │   └── [entity1].service.ts
│   │   ├── pages/
│   │   │   ├── list/list.component.ts
│   │   │   └── detail/detail.component.ts
│   │   └── index.ts
│   └── [entity2]/
│       └── (same structure)
└── index.ts
```

### Component Structure (Entity Detail Page)
```typescript
// Uses both Entity CRUD and Reactive Form skills
export class DetailComponent implements OnInit {
  // Form setup (Reactive Form skill)
  form!: FormGroup;
  
  // State management (Entity CRUD skill)
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  
  // Entity data (Entity CRUD skill)
  entity: Partial<[Entity]SaveReq> = {};

  // Initialize form with validation (Reactive Form skill)
  #initializeForm(): void {
    this.form = this.#formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(32)]],
      name: ['', [Validators.required]],
      // ... more fields
    });
  }

  // Validate before save (Reactive Form skill + Entity CRUD skill)
  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Call service (Entity CRUD skill)
    await this.#service.update(this.entity.id, this.form.value);
  }
}
```

---

## 🎯 Usage Guidelines

### Step 1: Plan Your Module
- Resolve missing module context first
- Identify entities you need
- List their properties and validations
- Define relationships

### Step 2: Set Up Module Configuration
Use **Feature Module Configuration Skill**
- Configure API host
- Set up interceptors
- Define guards

### Step 3: Generate Each Entity
Use **Entity CRUD Module Skill** for each entity
- Create model file
- Create service
- Create list and detail pages

If module does not exist yet:
- Apply Feature Module Configuration Skill first
- Then generate the entity inside that module

### Step 4: Enhance Validation
Use **Reactive Form with Validation Skill**
- Add custom validators
- Configure error messages
- Handle edge cases

### Step 5: Integrate
- Update root routes
- Test module loading
- Verify permissions

---

## 🔧 Customization Examples

### Add Custom Validator
```typescript
// In [entity].model.ts or custom-validators.ts
export class [Entity]Validators {
  static uniqueCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      // Custom validation logic
      return null;
    };
  }
}

// In detail.component.ts
#initializeForm(): void {
  this.form = this.#formBuilder.group({
    code: ['', [Validators.required, [Entity]Validators.uniqueCode()]],
  });
}
```

### Add Custom API Method
```typescript
// Extend the service with custom methods
export class [Entity]Service extends BaseService {
  readonly #api = this.register<[Entity]DTO, [Entity]SaveReq>('[entity]');

  // Base CRUD methods
  paging = this.#api.paging;
  create = this.#api.create;
  // ...

  // Custom API method
  async approve(id: string): Promise<void> {
    return this.#apiService.post(`${this.#api.baseUrl}/${id}/approve`);
  }
}
```

### Conditional Rendering in Detail Page
```typescript
@if (state === 'DETAIL') {
  <!-- Read-only view -->
  <div>{{ entity.name }}</div>
} @else {
  <!-- Edit form -->
  <sd-input [(model)]="entity.name" [form]="form"></sd-input>
}
```

---

## ✅ Quality Checklist

Before considering a skill implementation complete:

- [ ] All required files generated
- [ ] TypeScript code is type-safe
- [ ] Follows sdcorejs naming conventions
- [ ] Lazy loading configured
- [ ] Services injected at route level
- [ ] FormGroup properly initialized
- [ ] Validation rules applied
- [ ] Error handling implemented
- [ ] Permission directives used
- [ ] Tests written (if applicable)

---

## 🚀 Performance Considerations

### Lazy Loading
- All child routes use `loadComponent()` / `loadChildren()`
- Prevents bloating main bundle

### Server-Side Pagination
- List pages use `type: 'server'` in SdTableOption
- Reduces data transfer

### Form Optimization
- Use `patchValue()` for partial updates
- Use `markAsPristine()` after load
- Only validate touched fields for display

### API Optimization
- Batch requests where possible
- Use module-level interceptors
- Implement proper error handling

---

## 📖 Related Documentation

- [Copilot Instructions](./.github/copilot-instructions.md)
- [Entity CRUD Skill](./angular-entity-crud-skill.md)
- [Feature Module Configuration Skill](./angular-module-configuration-skill.md)
- [Reactive Form Skill](./angular-reactive-form-skill.md)

