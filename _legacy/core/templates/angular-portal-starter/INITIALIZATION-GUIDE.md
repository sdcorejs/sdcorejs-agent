# Portal Agency - Initialization Guide

Complete guide to set up and validate a fresh Portal Agency instance.

## Prerequisites

- Node.js 20.x+
- npm 10.x+
- Windows PowerShell or bash terminal
- ~5-10 minutes

---

## Step 1: Clone/Initialize Portal Agency

### Option A: From Git

```bash
git clone [portal-agency-repo] portal-agency
cd portal-agency
```

### Option B: Using Angular CLI (Fresh Setup)

```bash
npx @angular/cli@20.3.18 new portal-agency \
  --directory . \
  --routing \
  --style scss \
  --standalone \
  --skip-git \
  --package-manager npm
```

---

## Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added [number] packages in [time]
```

**Verify versions:**
```bash
npm list @sd-angular/core
npm list @angular/core
```

Should show:
- `@sd-angular/core@19.0.0-beta.73` ✅
- `@angular/core@20.3.x` ✅

---

## Step 3: Build Verification

```bash
npm run build-dev
```

**Expected output:**
```
✓ Build successful
✓ Bundle generated (4.83 MB initial)
✓ Lazy chunks generated
✓ No TypeScript errors
```

**⚠️ Warnings that are OK:**
- Sass deprecation warnings (from @sd-angular/core)
- Permission binding warnings (UI still works)

**❌ Errors that FAIL:**
- `NG0303: Can't bind to` (missing imports)
- `Cannot find module` (missing files)
- TypeScript compilation errors

---

## Step 4: Start Development Server

```bash
npm run start
```

**Expected output:**
```
✓ Application bundle generation complete
✓ Compiled successfully
✓ Listening on http://localhost:4200
```

**Note:** If port 4200 in use, Angular will ask:
```
Port 4200 is already in use.
Would you like to use a different port? (Y/n)
```

Answer `Y` to use next available port (4201, 4202, etc.)

---

## Step 5: Run Smoke Test

📋 **Complete smoke test checklist:** [SMOKE-TEST.md](./SMOKE-TEST.md)

### Quick Validation (2 minutes)

Open browser → **http://localhost:4200/layout/home**

#### 5a. Verify Home Page
- [ ] Title shows "PortalAgency"
- [ ] Welcome message: "Xin chào, Demo User"
- [ ] Current date/time displayed
- [ ] Left sidebar menu visible

#### 5b. Verify 4 Sample Menus
Click each menu item and verify:

1. **Employees** (`/sample/employee`)
   - [ ] List page loads
   - [ ] Table with ~100 mock employees
   - [ ] Click employee → detail page
   - [ ] Click "Cập nhật" → edit mode

2. **Products** (`/sample/product`)
   - [ ] List page loads
   - [ ] Table with ~100 mock products
   - [ ] Click product → side-drawer opens (DETAIL mode)
   - [ ] Click "Chỉnh sửa" → drawer switches to UPDATE mode
   - [ ] Close drawer works

3. **Departments** (`/sample/department`)
   - [ ] List page loads
   - [ ] Table with ~100 mock departments
   - [ ] Click department → detail page

4. **Sale Events** (`/sample/sale-event`)
   - [ ] List page loads
   - [ ] Table with ~100 mock sale events
   - [ ] Click event → detail page opens
   - [ ] Detail page has 3 collapsible sections:
     - [ ] "Thông tin chung"
     - [ ] "Thông tin vận hành"
     - [ ] "Hồ sơ và rổ hàng"
   - [ ] Click "Chỉnh sửa" → full-page edit
   - [ ] Edit page has **sd-anchor-v2** navigation on right
   - [ ] All 3 anchor items clickable and scroll to sections

#### 5c. Verify Mock Data

All tables should show:
- [ ] ~10-20 rows on first page (paging enabled)
- [ ] Pagination info: "Đang hiển thị: 1-20/100"
- [ ] Data persists after refresh (stored in localStorage)

**To verify localStorage:**
- F12 → Application → LocalStorage
- Search for `sd:sample:employee`, `sd:sample:product`, etc.
- Should contain JSON arrays with ~100 records each

---

## Step 6: Console Checks

Open DevTools → Console tab and verify:

✅ **Expected (non-blocking):**
- Sass deprecation warnings
- Permission binding warnings
- `Framework loaded successfully` message

❌ **FAIL indicators:**
- `Cannot find module` errors
- Uncaught exceptions
- `undefined` reference errors
- `Cannot read property` of null/undefined

---

## Initialization Complete ✅

If all smoke tests pass:

1. ✅ Portal Agency is correctly initialized
2. ✅ All sample modules functional
3. ✅ Mock CRUD architecture working
4. ✅ Design system components integrated

---

## Next: Test Entity Generation

Portal Agency includes a generator for creating new entity modules.

```bash
npm run plop
```

This launches an interactive CLI to generate:
- Service with mock CRUD store
- Mock data seed file
- List component
- Detail component
- Routing configuration

**See:** [plop-templates/](./plop-templates/) for templates

---

## Troubleshooting

### Issue: Build fails with "Cannot find module"
```
Error: Cannot find module '@sd-angular/core'
```
**Solution:**
```bash
npm install
npm run build-dev
```

### Issue: Tables show "No data"
```
Table displays empty state even after clicking menu
```
**Solution:**
1. Check console for errors (F12)
2. Verify localStorage: `localStorage.getItem('sd:sample:employee')`
3. If empty, refresh page or wait 2-3 seconds
4. If still empty, run: `localStorage.clear()` and reload

### Issue: Side-drawer not opening
```
Click product → nothing happens
```
**Solution:**
1. Check browser console for errors
2. Verify `DetailSideDrawerComponent` is imported
3. Verify `@ViewChild` is referencing correct template ref name
4. Try refreshing page

### Issue: Port already in use
```
Port 4200 is already in use.
```
**Solution:**
- Answer `Y` to use different port, OR
- Kill existing process: `npx kill-port 4200`
- Restart: `npm run start`

### Issue: Permission warnings in console
```
NG0303: Can't bind to 'sdPermissionSdPermissionKey'
```
**Solution:**
- This is a known warning (UI still works)
- Does not block functionality
- Can be ignored for smoke test

---

## Performance Notes

First load times:
- Initial bundle: ~4.8 MB (dev config)
- Mock data generation: <500ms per entity
- Page transitions: <100ms (instant)
- Side-drawer open: <50ms

Cache lifetime: 5 minutes per entity (configurable)

---

## What's Included

✅ **4 Sample Modules:**
- Employee (simple list pattern)
- Product (side-drawer pattern)
- Department (simple list pattern)
- Sale Event (anchor-based full page)

✅ **Mock Infrastructure:**
- `MockCrudStore<T>` base service
- localStorage persistence
- ~100 seed records per entity
- Timestamp metadata (createdAt, updatedAt)

✅ **UI Components:**
- Table with filtering, sorting, pagination
- Forms with validation
- Side-drawer for secondary views
- Anchor navigation for multi-section pages
- Permission-based rendering

✅ **Development Tools:**
- Plop CLI for entity generation
- ESLint configuration
- TypeScript strict mode
- Standalone components (Angular 20 best practice)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run start` | Start dev server |
| `npm run build-dev` | Build dev configuration |
| `npm run build` | Build production |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint code |
| `npm run plop` | Generate new entity |

| Menu | Path | Type | Details |
|------|------|------|---------|
| Employees | `/sample/employee` | List → Detail | Simple pattern |
| Products | `/sample/product` | List (side-drawer) | Side-drawer pattern |
| Departments | `/sample/department` | List → Detail | Simple pattern |
| Sale Events | `/sample/sale-event` | List → Detail (anchor) | Anchor pattern |

---

## Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Build passes (`npm run build-dev`)
- [ ] Dev server running (`npm run start`)
- [ ] Home page loads
- [ ] All 4 menus visible
- [ ] Employee CRUD works
- [ ] Product side-drawer works
- [ ] Department CRUD works
- [ ] Sale Event anchor + 3 sections work
- [ ] Mock data displays (~100 rows)
- [ ] No critical console errors
- [ ] localStorage contains seed data

---

## Support

For issues or questions:
1. Check [SMOKE-TEST.md](./SMOKE-TEST.md) for detailed validation steps
2. Review [README.md](./README.md) for project structure
3. Check browser console (F12) for error details
4. Verify all dependencies installed: `npm list`

Estimated initialization time: **5-10 minutes**
