# Smoke Test - Portal Agency

This smoke test validates that all sample modules and core features are functioning correctly after initialization.

## Quick Start

```bash
npm run start
# Server starts on http://localhost:4200
```

Then navigate to **http://localhost:4200/layout/home** and follow the checklist below.

---

## Smoke Test Checklist

### 1. Home Page
- [ ] Page loads with title "PortalAgency"
- [ ] Welcome message displays: "Xin chào, Demo User"
- [ ] Current date/time displays
- [ ] Left sidebar visible with "Sample Module" menu

### 2. Employees Module (`/sample/employee`)
- [ ] Menu item visible in sidebar
- [ ] Click "Employees" → navigates to list page
- [ ] List page title: "nhân viên"
- [ ] Table displays with mock data (~10-20 rows visible, ~100 total)
- [ ] Columns: Mã, Tên, Ngày sinh, Vai trò, Trạng thái, Ghi chú, Ngày tạo, Người tạo, Ngày cập nhật, Người cập nhật
- [ ] Click "Tạo mới" button visible (with permission)
- [ ] Click on employee code (e.g., "EMP0001") → detail page opens
- [ ] Detail page shows all fields read-only
- [ ] Click "Cập nhật" button → switches to edit mode with form
- [ ] Click "Quay lại" → returns to list page
- [ ] Data persists in localStorage

### 3. Products Module - Side-Drawer Pattern (`/sample/product`)
- [ ] Menu item visible in sidebar
- [ ] Click "Products" → navigates to list page
- [ ] List page title: "Sản phẩm"
- [ ] Table displays with mock data (~10-20 rows visible, ~100 total)
- [ ] Columns: Mã, Tên, Giá, Trạng thái, Ghi chú, Ngày tạo, Người tạo, Ngày cập nhật, Người cập nhật
- [ ] Click "Tạo mới" button opens side-drawer (CREATE mode)
  - [ ] Drawer title: "Tạo mới sản phẩm"
  - [ ] Section: "Thông tin chung"
  - [ ] Fields: Mã, Tên, Giá, Trạng thái, Ghi chú
  - [ ] Footer buttons: "Bỏ qua", "Lưu"
- [ ] Click on product code (e.g., "PRD0001") → side-drawer opens (DETAIL mode)
  - [ ] Drawer title: "Chi tiết sản phẩm"
  - [ ] All fields read-only (viewed state)
  - [ ] Footer buttons: "Bỏ qua", "Chỉnh sửa"
- [ ] Click "Chỉnh sửa" → drawer switches to UPDATE mode
  - [ ] Fields become editable
  - [ ] Footer buttons: "Bỏ qua", "Lưu"
- [ ] Click "Bỏ qua" closes drawer
- [ ] Data persists in localStorage

### 4. Departments Module (`/sample/department`)
- [ ] Menu item visible in sidebar
- [ ] Click "Departments" → navigates to list page
- [ ] List page title: "Phòng ban"
- [ ] Table displays with mock data (~10-20 rows visible, ~100 total)
- [ ] Columns: Mã, Tên, Mô tả, Ngày tạo, Người tạo, Ngày cập nhật, Người cập nhật
- [ ] Functionality similar to Employees (list → detail → update)

### 5. Sale Events Module - Full Page with Anchor & 3 Sections (`/sample/sale-event`)
**This is the 4th sample page with sd-anchor-v2 pattern**

- [ ] Menu item visible in sidebar as "Sale Events"
- [ ] Click "Sale Events" → navigates to list page
- [ ] List page title: "Đợt mở bán"
- [ ] Table displays with mock data (~10-20 rows visible, ~100 total)
- [ ] Columns: Mã, Tên đợt mở bán, Dự án, Hình thức bán, Trạng thái duyệt, Trạng thái vận hành, Bắt đầu, Kết thúc, Ngày tạo, Người tạo, Ngày cập nhật, Người cập nhật
- [ ] Click "Tạo mới" button visible (with permission)
- [ ] Click on sale event code (e.g., "SE0001") → detail page opens

#### 5a. Sale Event Detail Page (DETAIL mode)
- [ ] Title: "Chi tiết đợt mở bán [Name] #[Code]"
- [ ] Header buttons: "Bỏ qua", "Chỉnh sửa"
- [ ] **3 Collapsible Sections:**
  1. **Thông tin chung** (General Info)
     - [ ] Fields: Mã đợt mở bán, Tên đợt mở bán, Dự án, Hình thức bán, Mô tả
  2. **Thông tin vận hành** (Operation Info)
     - [ ] Fields: Trạng thái duyệt, Trạng thái vận hành, Bắt đầu, Kết thúc, Ghi chú
  3. **Hồ sơ và rổ hàng** (Files & Inventory)
     - [ ] Fields: Số lượng rổ hàng, Người tạo, Ngày tạo, Người cập nhật, Ngày cập nhật
     - [ ] Table: "Rổ hàng" with mock data (POOL-001, POOL-002, etc.)

#### 5b. Sale Event Edit Page (UPDATE mode)
- [ ] Click "Chỉnh sửa" → navigates to update page
- [ ] Title: "Chỉnh sửa đợt mở bán [Name] #[Code]"
- [ ] Header buttons: "Bỏ qua", "Lưu"
- [ ] **sd-anchor-v2** navigation visible on right side with 3 items:
  1. "Thông tin chung"
  2. "Thời hạn booking"
  3. "Rổ hàng"
- [ ] **3 Editable Sections:**
  1. **Thông tin chung** (General Info)
     - [ ] Fields: Mã, Tên, Dự án, Hình thức bán, Trạng thái phê duyệt, Mô tả (all required fields marked with *)
  2. **Thời hạn booking** (Booking Period)
     - [ ] Fields: Ngày bắt đầu dự kiến, Ngày kết thúc dự kiến, Trạng thái vận hành, Số lượng rổ hàng
  3. **Rổ hàng** (Inventory)
     - [ ] Textarea: Ghi chú
     - [ ] Table: "Rổ hàng" with generated data based on inventory pool count
- [ ] Clicking anchor items → scrolls to correct section
- [ ] All form fields populated with mock data
- [ ] Form validation works (required fields marked)
- [ ] Click "Bỏ qua" → returns to detail page

---

## Mock Data Verification

All modules should display mock data from centralized seed files:

| Module | Service | Mock Data File | Expected Records |
|--------|---------|----------------|------------------|
| Employee | EmployeeService | `employee.mock-data.ts` | ~100 |
| Product | ProductService | `product.mock-data.ts` | ~100 |
| Department | DepartmentService | `department.mock-data.ts` | ~100 |
| Sale Event | SaleEventService | `sale-event.mock-data.ts` | ~100 |

Each service uses `MockCrudStore` with localStorage persistence.

---

## Console Warnings

Expected (non-blocking) warnings:
- Sass deprecation warnings from `@sd-angular/core`
- Permission binding warnings (UI still renders correctly)

❌ **FAIL indicators** (should NOT appear):
- TypeScript compile errors
- Runtime exceptions in console
- "Cannot read property" errors
- Blank pages or empty tables without "No data" message

---

## Success Criteria

✅ **All 4 sample modules functional:**
- Employee: List → Detail → Update flow
- Product: Side-drawer pattern (CREATE/DETAIL/UPDATE modes)
- Department: List → Detail → Update flow
- Sale Event: Full page with **sd-anchor-v2** + 3 collapsible sections + table

✅ **Mock data persists** in localStorage across page refreshes

✅ **Navigation works** between all modules and pages

✅ **Forms validate** and handle state transitions correctly

✅ **UI renders** without critical errors

---

## Next Steps

Once smoke test passes:
1. Test entity generation with `plop` CLI
2. Validate newly generated modules follow the same patterns
3. Verify generated code integrates with existing mock CRUD infrastructure
