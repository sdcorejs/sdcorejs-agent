# PortalAgency

Portal Agency is a sales platform built with Angular 20 and @sd-angular/core design system. It demonstrates best practices for building enterprise portals with reusable modules, mock CRUD operations, and component patterns.

## Quick Start

### Installation

```bash
npm install
```

### Development Server

```bash
npm run start
# or
ng serve --configuration dev --port 4200
```

Navigate to **http://localhost:4200/layout/home**

### Smoke Test

After starting the dev server, run the smoke test checklist to verify all sample modules work correctly:

📋 **[SMOKE-TEST.md](./SMOKE-TEST.md)** - Comprehensive checklist for validating all features

**Quick validation:**
- ✅ Home page loads
- ✅ All 4 sample menus present (Employees, Products, Departments, Sale Events)
- ✅ Each module displays mock data (~100 rows)
- ✅ CRUD flows work (Create/Read/Update/Detail)
- ✅ Side-drawer pattern works (Product module)
- ✅ Anchor-based full-page detail (Sale Event module)
- ✅ Mock data persists in localStorage

**Expected time:** ~5 minutes

---

## Project Structure

```
src/
├── app/
│   ├── components/main/          # Main layout & menu
│   └── app.routes.ts             # Root routing
├── environments/                  # Environment config
└── libs/
    └── sample/                   # Sample module library
        ├── modules/
        │   ├── employee/         # Employee CRUD (detailed list)
        │   ├── product/          # Product CRUD (side-drawer pattern)
        │   ├── department/       # Department CRUD
        │   └── sale-event/       # Sale Event (full-page with anchor & 3 sections)
        ├── services/
        │   └── base/
        │       └── mock-crud.store.ts  # Generic localStorage mock store
        └── routes.ts             # Sample routes
```

### Modules at a Glance

| Module | Pattern | Mock Data | Key Files |
|--------|---------|-----------|-----------|
| **Employee** | Detail + List | 100 rows | `services/employee.mock-data.ts` |
| **Product** | Side-drawer | 100 rows | `components/detail-side-drawer/` |
| **Department** | Detail + List | 100 rows | `services/department.mock-data.ts` |
| **Sale Event** | Full-page + sd-anchor-v2 + 3 sections | 100 rows | `pages/detail/` + `services/sale-event.mock-data.ts` |

### Mock CRUD Architecture

All modules use a centralized `MockCrudStore<T>` service:

```typescript
// Example: ProductService extends mock CRUD
export class ProductService {
  private store = new MockCrudStore<ProductDTO, ProductSaveReq>(
    'product',
    productMockData,
    300000 // 5 min cache
  );

  paging = (req: SdTablePagenation) => this.store.paging(req);
  create = (req: ProductSaveReq) => this.store.create(req);
  update = (id: string, req: Partial<ProductSaveReq>) => this.store.update(id, req);
  detail = (id: string) => this.store.detail(id);
  remove = (ids: string[]) => this.store.remove(ids);
}
```

All data persists in **localStorage** under `sd:sample:[entity]`.

---

## Development Workflow

### Adding a New Entity Module

1. **Plan the module structure**
   - Decide: full-page detail OR side-drawer detail?
   - List of fields + validation rules
   - Mock data seed file (~100 records)

2. **Generate entity files** (using plop CLI)
   ```bash
   npm run plop
   ```

3. **Verify against patterns**
   - ✅ Service extends `MockCrudStore`
   - ✅ Mock data in separate `.mock-data.ts` file
   - ✅ Components use standalone pattern
   - ✅ Forms are reactive with validation

4. **Test in isolation**
   - Click menu item → list page
   - Click row → detail page
   - CRUD operations work
   - Mock data persists

---

## Available Scripts

```bash
npm run start              # Start dev server (port 4200)
npm run build-dev         # Build dev configuration
npm run build             # Build production
npm run test              # Run unit tests
npm run lint              # Lint code
npm run plop              # Generate new entity module
```

---

## Component Patterns

### Pattern 1: Side-Drawer Detail (Product Module)

Recommended for: Secondary entities, simple forms, compact UI

```typescript
// List page triggers drawer
<product-detail-side-drawer
  [state]="drawerState"        // 'CREATE' | 'UPDATE' | 'DETAIL'
  [form]="drawerForm"
  [entity]="drawerEntity"
  (saveDrawer)="onSave()"
  (editDrawer)="onEdit()"
  (closeDrawer)="onClose()">
</product-detail-side-drawer>
```

### Pattern 2: Full-Page Detail with Anchor (Sale Event Module)

Recommended for: Complex entities, multi-section forms, detailed workflows

```typescript
// Use sd-anchor-v2 for section navigation
<sd-anchor-v2 type="vertical">
  <sd-anchor-item-v2 title="Thông tin chung">
    <!-- Section 1 -->
  </sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Thời hạn booking">
    <!-- Section 2 -->
  </sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Rổ hàng">
    <!-- Section 3 -->
  </sd-anchor-item-v2>
</sd-anchor-v2>
```

---

## Design System

Built with **@sd-angular/core@19.0.0-beta.73**

### Key Components Used

- `SdPageComponent` - Page wrapper
- `SdTable` - Data table with paging/filtering
- `SdSideDrawer` - Modal drawer
- `SdAnchorV2` / `SdAnchorItemV2` - Section navigation
- `SdSection` - Collapsible section
- `SdButton`, `SdInput`, `SdSelect`, `SdTextarea` - Form controls
- `SdPermissionDirective` - Permission-based rendering

### Import Pattern

All components imported directly in component `imports` array (standalone):

```typescript
@Component({
  imports: [SdPageComponent, SdButton, SdTable, /* ... */]
})
export class MyComponent {}
```

---

## Permissions

Permission directives use `sdPermissionKey: 'sample'` scope.

Example permission keys by module:
- `SAMPLE_C_PRODUCT_CREATE` - Create product
- `SAMPLE_C_PRODUCT_UPDATE` - Update product
- `SAMPLE_C_EMPLOYEE_*` - Employee operations
- `SAMPLE_C_DEPARTMENT_*` - Department operations
- `SAMPLE_C_SALE_EVENT_*` - Sale event operations

Current user: `Demo User` (seed data)

---

## Troubleshooting

### Tables show "No data"

- Check browser DevTools → Application → LocalStorage
- Search for `sd:sample:[entity]` keys
- Mock data should be present after module loads
- Clear cache: `localStorage.clear()` then reload

### Form not submitting

- Check form validation: `form.invalid` state
- All required fields marked with `*`
- Check console for permission warnings

### Side-drawer not opening

- Verify component is imported in parent
- Check `@ViewChild` reference is correct
- Ensure `drawer.open()` is called

---

## Next Steps

1. ✅ Run smoke test ([SMOKE-TEST.md](./SMOKE-TEST.md))
2. 🔄 Test entity generation with `npm run plop`
3. 📚 Generate new sample modules
4. 🎨 Customize styling & branding
5. 🔐 Integrate real backend APIs

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
