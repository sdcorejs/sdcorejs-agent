# Entity Generation Guide

Guide to creating new entity modules using the Plop CLI generator.

## Prerequisites

✅ Portal Agency initialized and smoke test passed (see [INITIALIZATION-GUIDE.md](./INITIALIZATION-GUIDE.md))

✅ Dev server running: `npm run start`

✅ All 4 sample modules validated

---

## Generate New Entity

### Step 1: Launch Generator

```bash
npm run plop
```

**Expected output:**
```
PlOp v3.x.x
? [Choose a generator]
```

### Step 2: Select Generator Type

```
? Choose a generator
  (Use arrow keys)
❯ Create sample module
```

Select **"Create sample module"** (or the only available option)

### Step 3: Answer Prompts

The generator will ask for:

#### 3a. Module Name
```
? Module name (e.g., 'order', 'customer', 'invoice'):
```

**Enter:** `order` (or your entity name)
- Use lowercase, no spaces
- Will be used for path, service name, etc.
- Examples: `order`, `customer`, `invoice`, `vendor`, `contract`

#### 3b. Entity Label (Display Name)
```
? Entity label (e.g., 'Đơn hàng', 'Khách hàng'):
```

**Enter:** `Đơn hàng` (or Vietnamese display name)
- Used in page titles, menu labels
- Can use Vietnamese, spaces, special chars
- Examples: `Đơn hàng`, `Khách hàng`, `Hợp đồng`

#### 3c. Entity Code (for mock data)
```
? Entity code prefix (e.g., 'ORD', 'CUST', 'INV'):
```

**Enter:** `ORD`
- Prefix for mock record IDs
- 2-4 characters, uppercase
- Examples: `ORD` (order), `CUST` (customer), `INV` (invoice)

#### 3d. Display Fields (for list page)
```
? Display fields for list (comma-separated):
```

**Enter:** `code,name,status,total,createdAt`
- Field names to show in list table
- Comma-separated, no spaces
- Example: `code,name,amount,status,date`

#### 3e. Detail Page Type
```
? Detail page type:
  (Use arrow keys)
❯ Full page with anchor (multi-section)
  Side-drawer (simple form)
```

**Choose one:**
- **Full page with anchor** - For complex entities with multiple sections (like Sale Event)
- **Side-drawer** - For simple entities (like Product)

#### 3f. Form Fields (if Side-Drawer)
```
? Form fields (name:type,name:type,...):
```

**Enter:** `code:text,name:text,amount:number,status:select,description:textarea`

Field types: `text`, `number`, `date`, `datetime`, `select`, `textarea`, `checkbox`

Example: `code:text,name:text,email:text,phone:text,status:select`

#### 3g. Sections (if Full Page with Anchor)
```
? Number of sections (2-5):
```

**Enter:** `3` (recommended)

Then for each section:
```
? Section 1 title:
```

**Enter:** `Thông tin chung`, `Chi tiết`, `Ghi chú`, etc.

```
? Section 1 fields:
```

**Enter:** `code:text,name:text,description:textarea`

---

## Step 4: Generation Output

Generator creates:

```
src/libs/sample/modules/[moduleName]/
├── services/
│   ├── [moduleName].model.ts          # DTO definitions
│   ├── [moduleName].mock-data.ts      # Seed data (100 records)
│   └── [moduleName].service.ts        # Service with MockCrudStore
├── pages/
│   ├── list/
│   │   └── list.component.ts          # List page with table
│   └── detail/
│       └── detail.component.ts        # Detail page (drawer or full-page)
├── components/
│   └── detail-side-drawer/            # (If side-drawer pattern)
│       └── detail-side-drawer.component.ts
├── [moduleName].routes.ts             # Routing configuration
└── index.ts                           # Public exports
```

**Total files generated:** 6-10 depending on pattern

---

## Step 5: Integration Steps

After generation completes:

### 5a. Verify Files Created

```bash
ls src/libs/sample/modules/[moduleName]/
```

Should see all files listed above ✅

### 5b. Add Route to Main Routes

Edit `src/libs/sample/routes.ts`:

```typescript
const routes: Routes = [
  // ... existing routes ...
  {
    path: '[moduleName]',
    loadComponent: () => import('./modules/[moduleName]/pages/list/list.component').then(m => m.ListComponent),
  },
];
```

### 5c. Add Menu Item

Edit `src/app/components/main/main.component.ts`:

```typescript
this.menus = [
  // ... existing menus ...
  { path: '/sample/[moduleName]', label: '[Entity Label]' },
];
```

### 5d. Test Generated Module

```bash
npm run start
```

Navigate to: **http://localhost:4200/sample/[moduleName]**

Expected:
- [ ] List page loads
- [ ] Table with ~100 mock records
- [ ] Create/Update/Detail flows work
- [ ] No TypeScript errors
- [ ] No console errors

---

## Generation Example

### Scenario: Create Order Module (Full Page with Anchor)

```
? Module name: order
? Entity label: Đơn hàng
? Entity code prefix: ORD
? Display fields: code,name,status,total
? Detail page type: Full page with anchor
? Number of sections: 3
? Section 1 title: Thông tin chung
? Section 1 fields: code:text,customerName:text,total:number
? Section 2 title: Chi tiết đơn hàng
? Section 2 fields: items:textarea,discount:number
? Section 3 title: Ghi chú
? Section 3 fields: notes:textarea,status:select
```

**Output:**
```
✓ Created src/libs/sample/modules/order/
✓ Generated 8 files
✓ Mock data seeded with 100 records (ORD0001-ORD0100)
✓ Ready to integrate
```

### Scenario: Create Product Variant Module (Side-Drawer)

```
? Module name: productVariant
? Entity label: Biến thể sản phẩm
? Entity code prefix: PVAR
? Display fields: code,name,sku,price
? Detail page type: Side-drawer
? Form fields: code:text,name:text,sku:text,price:number,color:select,size:select
```

**Output:**
```
✓ Created src/libs/sample/modules/productVariant/
✓ Generated 6 files
✓ Mock data seeded with 100 records (PVAR0001-PVAR0100)
✓ Side-drawer component ready
```

---

## Validation Checklist

After generation and integration:

- [ ] Build passes: `npm run build-dev`
- [ ] No TypeScript errors
- [ ] Dev server runs: `npm run start`
- [ ] Menu item visible and clickable
- [ ] List page loads with mock data (~100 rows)
- [ ] Create button works
- [ ] Click row → detail/drawer opens
- [ ] Detail page has all sections (if full-page)
- [ ] Edit mode works
- [ ] Update/Save works
- [ ] Mock data persists in localStorage
- [ ] No permission warnings (expected)

---

## Generated Code Patterns

### Pattern 1: Full-Page with Anchor (Multi-Section)

Generated `detail.component.ts` includes:

```typescript
// Three state modes
state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';

// sd-anchor-v2 navigation
<sd-anchor-v2 type="vertical">
  <sd-anchor-item-v2 title="Section 1">...</sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Section 2">...</sd-anchor-item-v2>
  <sd-anchor-item-v2 title="Section 3">...</sd-anchor-item-v2>
</sd-anchor-v2>

// Section switching logic
onChangeSection(sectionIndex: number) {
  this.currentSection = sectionIndex;
}
```

### Pattern 2: Side-Drawer (Simple Form)

Generated `detail-side-drawer.component.ts` includes:

```typescript
// Drawer state management
@Input() state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
@Input() form!: FormGroup;
@Input() entity: Partial<[EntityDTO]> = {};

// Modal lifecycle
open() { this.drawer().open(); }
close() { this.drawer().close(); }

// Button logic by state
<!-- DETAIL mode: Show only "Close" & "Edit" -->
<!-- UPDATE mode: Show "Close" & "Save" -->
<!-- CREATE mode: Show "Close" & "Save" -->
```

### Pattern 3: Service with MockCrudStore

Generated `[module].service.ts` includes:

```typescript
export class [ModuleService] {
  private store = new MockCrudStore<[EntityDTO], [EntitySaveReq]>(
    '[module]',
    [moduleMockData],
    300000 // 5 min cache
  );

  paging = (req: SdTablePagenation) => this.store.paging(req);
  create = (req: [EntitySaveReq]) => this.store.create(req);
  update = (id: string, req: Partial<[EntitySaveReq]>) => this.store.update(id, req);
  detail = (id: string) => this.store.detail(id);
  remove = (ids: string[]) => this.store.remove(ids);
}
```

---

## Troubleshooting

### Issue: Generator doesn't appear

```
npm run plop
# (no output, generator not found)
```

**Solution:**
```bash
npm install
npm run plop
```

### Issue: Generated files have import errors

```
Error: Cannot find module '@sample/modules/...'
```

**Solution:**
1. Verify files created: `ls src/libs/sample/modules/[moduleName]/`
2. Check paths match in routes
3. Rebuild: `npm run build-dev`

### Issue: Mock data not loading

```
Table shows "No data" even though seed file created
```

**Solution:**
1. Check service instantiates `MockCrudStore` correctly
2. Verify mock data file exports array
3. Check localStorage: `localStorage.getItem('sd:sample:[module]')`
4. Refresh page and wait 2-3 seconds

### Issue: Side-drawer not opening

```
Click row → nothing happens
```

**Solution:**
1. Verify component imported in list
2. Check `@ViewChild` ref name matches template
3. Test in isolation: click "Tạo mới" button (CREATE mode)
4. If still fails, check console errors (F12)

---

## Next Steps

Once entity generation working:

1. ✅ Generate multiple modules to test pattern repeatability
2. ✅ Test mixing patterns (some side-drawer, some full-page)
3. ✅ Verify integration with existing modules
4. 📚 Document any custom field types needed
5. 🔧 Customize generated code as needed
6. 🚀 Ready for real backend integration

---

## Reference

- **Plop templates:** [plop-templates/](./plop-templates/)
- **Sample modules:** [src/libs/sample/modules/](./src/libs/sample/modules/)
- **Mock infrastructure:** [src/libs/sample/services/base/mock-crud.store.ts](./src/libs/sample/services/base/mock-crud.store.ts)

Generated modules should follow same patterns as:
- Employee (simple list)
- Product (side-drawer)
- Sale Event (anchor-based)
