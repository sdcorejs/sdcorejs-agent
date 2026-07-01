> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand and ALWAYS run after
> `init-portal`. Not a standalone skill. Generates the admin-module SCREENS (the FE for the BE
> `init-admin` pack) so end users administer accounts/roles/permissions in-app — never the Keycloak console.

# Admin Screens — Account / Role / Permission (Angular)

## Contents

- Purpose / when to use
- Source of truth - Core UI + sibling packs
- Profile (read FIRST)
- BE contract (API + DTOs)
- Angular output structure
- Account, role, and permission screens
- Enterprise extension
- Verification and handoff

## Purpose / when to use

Generate `src/libs/admin/` feature screens that pair with the BE admin module (`_refs/nestjs/write-code/init-admin.md`):
account management, role management, and a read-only permission list. Routed under `/admin`.

## Source of truth — Core UI + sibling packs

Reuse the list + detail patterns from `screen-list.md` (SdTable, server-side paging) and `screen-detail.md`
(create/edit drawer + reactive form). Core UI: `SdTable`, `SdButton`, `SdFormsModule`, `SdConfirmService`,
`SdNotifyService`, and `SdPermissionDirective` (`*sdPermission="'<code>'"`) to hide actions the user can't perform.
All generated admin components must use `changeDetection: ChangeDetectionStrategy.OnPush`, signal/computed state, and precomputed view models for template display/visibility/disabled bindings. Do not call component methods/getters from admin templates except event handlers.

Admin screens that build permission trees, department trees, role matrices, or selectable rows must keep UI-only fields (`checked`, `selected`, `expanded`, `children`, `disabled`, display labels) in component-local ViewModels/computed signals. Do not add those fields to Service DTOs unless the Service mapper explicitly derives and guarantees them.

## Profile (read FIRST)

Read `profile` from the caller (default `simple`). **simple** = Account + Role + Permission (read-only).
**enterprise** = + Tenant + Department (see the "Enterprise extension" section — added later). Emit only the chosen profile's screens.

---

## BE contract (API + DTOs)

| DTO | Fields |
|---|---|
| `UserDTO` | `id`, `username`, `email`, `fullName`, `roleCodes: string[]`, `isActive` |
| `RoleDTO` | `id`, `code`, `name`, `permissions: string[]`, `isActive` |
| `PermissionDTO` | `id`, `code`, `label`, `model`, `action` |

Base endpoints follow `BaseController` paging/detail + writes:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/user` | Paged user list |
| `GET` | `/api/admin/user/:id` | User detail |
| `POST` | `/api/admin/user` | Create user |
| `PUT` | `/api/admin/user/:id` | Update user |
| `DELETE` | `/api/admin/user/:id` | Delete user |
| `POST` | `/api/admin/user/:id/reset-password` | Reset password — body `{ password: string }` (custom) |
| `PUT` | `/api/admin/user/:id/enabled` | Toggle enabled (custom) |
| `POST` | `/api/admin/user/:id/roles` | Assign roles (custom) |
| `GET/POST/PUT/DELETE` | `/api/admin/role` | Role CRUD |
| `GET` | `/api/admin/permission` | Permission registry (read-only) |

Permission codes:

| Resource | Codes |
|---|---|
| User | `admin_user:view`, `admin_user:create`, `admin_user:update`, `admin_user:delete`, `admin_user:reset_password`, `admin_user:assign_roles` |
| Role | `admin_role:view`, `admin_role:create`, `admin_role:update`, `admin_role:delete` |
| Permission | `admin_permission:view` |

---

## Screen 1 — Account Management (`features/account/`)

### Files

```
src/libs/admin/features/account/
  account.list.component.ts
  account.list.component.html
  pages/detail/
    detail.component.ts        # create + edit drawer
    detail.component.html
  account-api.service.ts
```

### List: `SdTable<UserDTO>`

Use the `screen-list.md` server-side paging pattern. Columns:

| Column key | Label | Notes |
|---|---|---|
| `username` | Username | `type: 'text'` |
| `email` | Email | `type: 'text'` |
| `fullName` | Full name | `type: 'text'` |
| `roleCodes` | Roles | Custom cell — join `roleCodes` with `,` |
| `isActive` | Status | Boolean badge (Active / Locked) |

Row actions (each gated by `SdPermissionDirective`):

| Action | Permission code | Behavior |
|---|---|---|
| Reset password | `admin_user:reset_password` | Password-prompt dialog → `POST /api/admin/user/:id/reset-password` body `{ password: string }` |
| Enable / Disable | `admin_user:update` | Toggle without confirm → `PUT /api/admin/user/:id/enabled` → reload row |
| Delete | `admin_user:delete` | Confirm dialog → `DELETE /api/admin/user/:id` → reload table |

Toolbar: **Create account** button gated `admin_user:create` opens the create drawer.
Edit icon per row gated `admin_user:update` opens the edit drawer.

### Skeleton — `account.list.component.ts`

```typescript
@SdTabComponent({ name: '<localized text>' })
@Component({ selector: 'app-account-list', ... })
export class AccountListComponent implements OnInit {
  private readonly api = inject(AccountApiService);
  private readonly confirm = inject(SdConfirmService);
  private readonly notify = inject(SdNotifyService);
  private readonly loading = inject(SdLoadingService);

  tableOption!: SdTableOption<UserDTO>;

  ngOnInit() {
    this.tableOption = {
      columns: [
        { key: 'username', title: '<localized text>', type: 'text' },
        { key: 'email',    title: 'Email',          type: 'text' },
        { key: 'fullName', title: '<localized text>',          type: 'text' },
        { key: 'roleCodes', title: '<localized text>',        type: 'custom' }, // template: join roleCodes
        { key: 'isActive', title: '<localized text>',      type: 'custom' }, // template: badge
      ],
      items: async (filter) => this.api.paging(convertTableFilter(filter)),
      // row actions wired via selector.actions + row action column
    };
  }

  async onResetPassword(user: UserDTO) {
    // Prompt for the new password before calling the API.
    // `SdConfirmService.prompt` opens a small dialog with a required input field.
    const password = await this.confirm.prompt({
      title: '<localized text>',
      content: `<localized text>`,
      field: { label: '<localized text>', type: 'password', required: true, minLength: 8 },
    });
    if (!password) return;  // user cancelled or left empty
    await this.loading.run(() => this.api.resetPassword(user.id, password));
    this.notify.success('<localized text>');
  }

  async onToggleEnabled(user: UserDTO) {
    await this.loading.run(() => this.api.setEnabled(user.id, !user.isActive));
    this.notify.success(user.isActive ? '<localized text>' : '<localized text>');
    this.tableOption.reload?.();
  }

  async onDelete(user: UserDTO) {
    const ok = await this.confirm.show({ title: '<localized text>', content: user.username });
    if (!ok) return;
    await this.loading.run(() => this.api.delete(user.id));
    this.notify.success('<localized text>');
    this.tableOption.reload?.();
  }
}
```

Reference `screen-list.md` for the full `tableOption` boilerplate, bulk-delete `selector.actions`, and audit-column placement.

### Create/Edit drawer — `detail.component.ts`

Use the `screen-detail.md` CREATE / UPDATE state pattern (no DETAIL-view state needed — the list shows all fields). Reactive form controls:

| Control | Label | Notes |
|---|---|---|
| `username` | Username | Required; disabled in UPDATE (immutable) |
| `email` | Email | Required; `SdValidators.email` |
| `fullName` | Full name | Required |
| `roleCodes` | Roles | Multi-select; options loaded from `GET /api/admin/role` on init |

- CREATE: `POST /api/admin/user` then reload table.
- UPDATE: `PUT /api/admin/user/:id` then reload table. The `roleCodes` update calls `POST /api/admin/user/:id/roles` **instead of** the generic update when only roles changed — or combine into one unified save depending on BE contract.
- No file uploads for this form.

Reference `screen-detail.md` `#create-state` + `#update-state` for form initialization, `markAllAsTouched()` validation gate, and `onBack()` navigation.

### `account-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/user';

  paging(req: PagingRequest): Observable<PagingResponse<UserDTO>> {
    return this.http.get<PagingResponse<UserDTO>>(this.base, { params: req as any });
  }

  detail(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.base}/${id}`);
  }

  create(payload: UserSaveReq): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.base, payload);
  }

  update(id: string, payload: Partial<UserSaveReq>): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Custom routes
  resetPassword(id: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reset-password`, { password });
  }

  setEnabled(id: string, enabled: boolean): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.base}/${id}/enabled`, { enabled });
  }

  assignRoles(id: string, roleCodes: string[]): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.base}/${id}/roles`, { roleCodes });
  }
}
```

---

## Screen 2 — Role Management (`features/role/`)

### Files

```
src/libs/admin/features/role/
  role.list.component.ts
  role.list.component.html
  pages/detail/
    detail.component.ts        # create + edit with permission-assign grid
    detail.component.html
  role-api.service.ts
```

### List: `SdTable<RoleDTO>`

Use the `screen-list.md` server-side paging pattern. Columns:

| Column key | Label | Notes |
|---|---|---|
| `code` | Role code | `type: 'text'` |
| `name` | Role name | `type: 'text'` |
| `permissions` | Permission count | Custom cell — `permissions.length` |
| `isActive` | Status | Boolean badge |

Row actions: Edit (gated `admin_role:update`), Delete (gated `admin_role:delete`, confirm + `DELETE /api/admin/role/:id`).
Toolbar: **Create role** gated `admin_role:create`.

### Create/Edit drawer — `detail.component.ts` + permission-assign grid

The drawer form contains:

| Control | Label | Notes |
|---|---|---|
| `code` | Role code | Required; disabled in UPDATE |
| `name` | Role name | Required |
| `isActive` | Active | Boolean switch |
| `permissions` | Permissions | Managed by the permission-assign grid below (not a plain `sd-input`) |

**Permission-assign grid** — a checkbox matrix loaded from `GET /api/admin/permission`:

- Rows grouped by `model` (the `<module>_<entity>` prefix of each `PermissionDTO.code`, e.g. `product_item`).
- Columns = the distinct `action` values across all permissions (e.g. `view`, `create`, `update`, `delete`).
- Each cell checkbox corresponds to one `PermissionDTO`. Checking it adds the flat `PermissionDTO.code` to the form's `permissions: string[]`; unchecking removes it.

Grid-building logic sketch:

```typescript
// In detail.component.ts
readonly allPermissions = signal<PermissionDTO[]>([]);
readonly models = computed(() => [...new Set(this.allPermissions().map(p => p.model))].sort());
readonly actions = computed(() => [...new Set(this.allPermissions().map(p => p.action))].sort());

// Set<string> of currently selected permission codes (two-way bound to form control)
readonly selectedCodes = signal<Set<string>>(new Set());
readonly permissionGrid = computed(() => {
  const selected = this.selectedCodes();
  const byKey = new Map(this.allPermissions().map(p => [`${p.model}:${p.action}`, p]));
  return this.models().map(model => ({
    model,
    cells: this.actions().map(action => {
      const permission = byKey.get(`${model}:${action}`);
      return {
        action,
        permission,
        checked: permission ? selected.has(permission.code) : false,
      };
    }),
  }));
});

togglePermission(code: string, checked: boolean): void {
  const next = new Set(this.selectedCodes());
  checked ? next.add(code) : next.delete(code);
  this.selectedCodes.set(next);
  this.form.patchValue({ permissions: [...next] });
}

async ngOnInit() {
  // Load permission registry in parallel with role (when UPDATE)
  const [perms] = await Promise.all([
    firstValueFrom(this.roleApi.listPermissions()),
    this.state() !== 'CREATE' ? this.loadRoleData(this.id!) : Promise.resolve(),
  ]);
  this.allPermissions.set(perms);
  // Seed selectedCodes from loaded role
  if (this.entity.permissions) {
    this.selectedCodes.set(new Set(this.entity.permissions));
  }
}
```

HTML template sketch for the grid (inline inside the drawer form):

```html
<table class="permission-grid">
  @let _permissionGrid = permissionGrid();
  <thead>
    <tr>
      <th>Module / Entity</th>
      @for (action of actions(); track action) { <th>{{ action }}</th> }
    </tr>
  </thead>
  <tbody>
    @for (row of _permissionGrid; track row.model) {
      <tr>
        <td>{{ row.model }}</td>
        @for (cell of row.cells; track cell.action) {
          <td>
            @if (cell.permission; as perm) {
              <input type="checkbox"
                     [checked]="cell.checked"
                     (change)="togglePermission(perm.code, $any($event.target).checked)"
                     *sdPermission="'admin_role:update'" />
            }
          </td>
        }
      </tr>
    }
  </tbody>
</table>
```

Save: `POST /api/admin/role` (CREATE) or `PUT /api/admin/role/:id` (UPDATE) with `{ code, name, isActive, permissions: [...selectedCodes()] }`.

Permission gating: list view gated `admin_role:view`; create form gated `admin_role:create`; edit form gated `admin_role:update`; delete gated `admin_role:delete`.

---

## Screen 3 — Permission List (read-only) (`features/permission/`)

### Files

```
src/libs/admin/features/permission/
  permission.list.component.ts
  permission.list.component.html
  permission-api.service.ts
```

### Read-only `SdTable<PermissionDTO>`

Columns grouped by `model` (use `groupBy` option if `SdTable` supports it; otherwise add a leading `model` column):

| Column key | Label | Notes |
|---|---|---|
| `model` | Module / Entity | `type: 'text'` |
| `code` | Permission code | `type: 'text'` |
| `label` | Label | `type: 'text'` |
| `action` | Action | `type: 'text'` |

**No create / edit / delete buttons, no row actions.** The toolbar has only a search/filter input (optional).

Gate the entire screen with `*sdPermission="'admin_permission:view'"` at the route level (via `data.permission`) and optionally wrap the table in the directive as a belt-and-suspenders guard.

> **Note:** Permissions are init data — seeded BE-side from the `@HasPermission` decorator codes registered at startup. This screen only displays the registry; do NOT generate a create/edit form for permissions.

---

## Routes and sidebar menu

### Route registration

Register under the `admin` lazy route (add to the portal's app routes, referencing how `init-portal.md` wires feature routes):

```typescript
// src/libs/admin/admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'account',
        data: { permission: 'admin_user:view', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/account/account.list.component').then(m => m.AccountListComponent),
      },
      {
        path: 'account/create',
        data: { permission: 'admin_user:create', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/account/pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'account/update/:id',
        data: { permission: 'admin_user:update', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/account/pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'role',
        data: { permission: 'admin_role:view', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/role/role.list.component').then(m => m.RoleListComponent),
      },
      {
        path: 'role/create',
        data: { permission: 'admin_role:create', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/role/pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'role/update/:id',
        data: { permission: 'admin_role:update', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/role/pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'permission',
        data: { permission: 'admin_permission:view', permissionKey: 'admin' },
        loadComponent: () =>
          import('./features/permission/permission.list.component').then(m => m.PermissionListComponent),
      },
    ],
  },
];
```

Register in the app shell (follow `init-portal.md` convention):

```typescript
// app.routes.ts — add alongside other module routes
{
  path: 'admin',
  loadChildren: () => import('./libs/admin/admin.routes').then(m => m.ADMIN_ROUTES),
}
```

### Sidebar menu group "<localized text>"

Add a menu group to the portal's sidebar config (see `init-portal.md` for the menu registration pattern). Each item gated by the matching `:view` permission via `SdPermissionDirective` (or the layout's permission-aware menu config):

```typescript
{
  group: '<localized text>',
  icon: 'shield',         // use project icon set
  items: [
    {
      label: '<localized text>',
      route: '/admin/account',
      permission: 'admin_user:view',    // layout hides item when user lacks this code
    },
    {
      label: '<localized text>',
      route: '/admin/role',
      permission: 'admin_role:view',
    },
    {
      label: '<localized text>',
      route: '/admin/permission',
      permission: 'admin_permission:view',
    },
  ],
}
```

If the portal layout does not support a `permission` field on menu items, wrap each `<sd-menu-item>` with `*sdPermission="'admin_user:view'"` (and so on per item) in the sidebar template.

---

## Expected file tree

```
src/libs/admin/
  admin.routes.ts
  features/
    account/
      account.list.component.ts
      account.list.component.html
      account-api.service.ts
      pages/
        detail/
          detail.component.ts
          detail.component.html
    role/
      role.list.component.ts
      role.list.component.html
      role-api.service.ts
      pages/
        detail/
          detail.component.ts
          detail.component.html
    permission/
      permission.list.component.ts
      permission.list.component.html
      permission-api.service.ts
```

---

## Verification checklist

- [ ] **Build typechecks** — `ng build` (or `tsc --noEmit`) passes with no errors for the `admin` library.
- [ ] **Permission gating** — log in as a user WITHOUT `admin_user:reset_password`; confirm the "<localized text>" row action is hidden. Repeat for each `admin_*` code.
- [ ] **Reset-password calls the custom route** — network tab shows `POST /api/admin/user/:id/reset-password`, NOT the generic update endpoint.
- [ ] **Permission-assign grid** — opening a role's edit drawer shows a checkbox matrix; checking/unchecking cells updates the `permissions` array sent on save.
- [ ] **Permission screen is read-only** — no create/edit/delete controls render, regardless of user role.
- [ ] **Routes protected** — navigating to `/admin/account` without `admin_user:view` redirects (route guard blocks access).
- [ ] **Sidebar items hidden** — menu items under "<localized text>" do not appear for users lacking the corresponding `:view` permission.

---

## Anti-patterns

- Calling `/api/admin/permission` for writes — the permission registry is read-only from the FE.
- Using `formControlName` with Core UI form components — they self-register via `[form]+name`; use `[(model)]` binding instead (see `screen-detail.md` MUST NOT).
- Performing the `reset-password` / `enabled` toggle / `assign-roles` calls via the generic `PUT /api/admin/user/:id` update — use the dedicated custom routes from `AccountApiService`.
- Showing all row actions unconditionally — each action MUST be gated by its matching `*sdPermission` directive.
- Building the permission-assign grid from hard-coded strings — always derive `models` + `actions` from the live `GET /api/admin/permission` response so new permissions added BE-side appear automatically.
- Skipping `data.permission` on any route — the route guard relies on it to block unauthorized navigation.

---

## Enterprise extension (profile: enterprise)

> **[enterprise]** — Everything in this section applies ONLY when `profile = enterprise`. The simple
> profile screens are untouched. Enterprise adds Tenant + Department management screens, and extends
> the Account + Role create/edit drawers with tenant + department selectors.

---

### BE contract — enterprise additions

| DTO | Fields |
|---|---|
| `TenantDTO` | `id`, `code`, `name`, `realm`, `clientId` (`clientSecret` write-only — never returned) |
| `DepartmentDTO` | `id`, `tenantCode`, `code`, `name`, `parentCode` (nullable) |

| Method | Path | Purpose |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/api/admin/tenant` | Tenant CRUD |
| `GET/POST/PUT/DELETE` | `/api/admin/department` | Department CRUD |

Permission codes (enterprise):

| Resource | Codes |
|---|---|
| Tenant | `admin_tenant:view`, `admin_tenant:create`, `admin_tenant:update`, `admin_tenant:delete` |
| Department | `admin_department:view`, `admin_department:create`, `admin_department:update`, `admin_department:delete` |

---

### Screen 4 — Tenant Management (`features/tenant/`) [enterprise]

#### Files

```
src/libs/admin/features/tenant/
  tenant.list.component.ts
  tenant.list.component.html
  pages/detail/
    detail.component.ts        # create + edit drawer
    detail.component.html
  tenant-api.service.ts
```

#### List: `SdTable<TenantDTO>`

Use the `screen-list.md` server-side paging pattern. Columns:

| Column key | Label | Notes |
|---|---|---|
| `code` | Tenant code | `type: 'text'` |
| `name` | Tenant name | `type: 'text'` |
| `realm` | Keycloak realm | `type: 'text'` |
| `clientId` | Client ID | `type: 'text'` |
| `isActive` | Status | Boolean badge (Active / Locked) |

> `clientSecret` is **never displayed** in any column or detail view — it is write-only.

Row actions (each gated by `SdPermissionDirective`):

| Action | Permission code | Behavior |
|---|---|---|
| Edit | `admin_tenant:update` | Opens edit drawer |
| Delete | `admin_tenant:delete` | Confirm dialog → `DELETE /api/admin/tenant/:id` → reload |

Toolbar: **Create tenant** gated `admin_tenant:create`.
Gate the entire list with `*sdPermission="'admin_tenant:view'"`.

#### Create/Edit drawer — `detail.component.ts`

Use the `screen-detail.md` CREATE / UPDATE state pattern. Reactive form controls:

| Control | Label | Notes |
|---|---|---|
| `code` | Tenant code | Required; disabled in UPDATE (immutable) |
| `name` | Tenant name | Required |
| `realm` | Keycloak realm | Required; disabled in UPDATE (realm cannot be renamed) |
| `clientId` | Client ID | Required; disabled in UPDATE |
| `clientSecret` | Client Secret | Required in CREATE; write-only password field in UPDATE (placeholder `<localized text>`); if left blank on UPDATE the BE skips re-encrypting |
| `isActive` | Active | Boolean switch |

> Never pre-fill `clientSecret` on the edit form — the BE never returns this field. Render it as
> `type="password"` and add helper text: "<localized text>" (UPDATE state).

- CREATE: `POST /api/admin/tenant`
- UPDATE: `PUT /api/admin/tenant/:id` (omit `clientSecret` from payload when blank)

#### `tenant-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class TenantApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/tenant';

  paging(req: PagingRequest): Observable<PagingResponse<TenantDTO>> {
    return this.http.get<PagingResponse<TenantDTO>>(this.base, { params: req as any });
  }
  detail(id: string): Observable<TenantDTO> {
    return this.http.get<TenantDTO>(`${this.base}/${id}`);
  }
  create(payload: TenantSaveReq): Observable<TenantDTO> {
    return this.http.post<TenantDTO>(this.base, payload);
  }
  update(id: string, payload: Partial<TenantSaveReq>): Observable<TenantDTO> {
    return this.http.put<TenantDTO>(`${this.base}/${id}`, payload);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

---

### Screen 5 — Department Management (`features/department/`) [enterprise]

#### Files

```
src/libs/admin/features/department/
  department.tree.component.ts
  department.tree.component.html
  pages/detail/
    detail.component.ts        # create + edit drawer
    detail.component.html
  department-api.service.ts
```

#### Tree view: parent/child on `parentCode`

Use a tree layout (Angular CDK `<cdk-tree>` or the Core UI `SdTree` component if available).
Each node displays `code` + `name`. Root nodes have `parentCode === null`.

> If `SdTree` is not in the Core UI catalog, fall back to a flat `SdTable` with an indented
> `name` column that prefixes child rows with `<localized text>`. Mark the fallback with
> `alert('TODO: replace flat table with SdTree when available')`.

Tree-building logic sketch:

```typescript
readonly allDepts = signal<DepartmentDTO[]>([]);
readonly roots = computed(() => this.allDepts().filter(d => !d.parentCode));
readonly childrenByParent = computed(() => {
  const groups = new Map<string, DepartmentDTO[]>();
  for (const dept of this.allDepts()) {
    if (!dept.parentCode) continue;
    groups.set(dept.parentCode, [...(groups.get(dept.parentCode) ?? []), dept]);
  }
  return groups;
});
```

Load via `<localized text>` — add a **tenant selector** at the top
of the page (dropdown loaded from `GET /api/admin/tenant`) to filter by tenant.

Row / node actions:

| Action | Permission code | Behavior |
|---|---|---|
| Add child | `admin_department:create` | Opens create drawer pre-filled `parentCode` |
| Edit | `admin_department:update` | Opens edit drawer |
| Delete | `admin_department:delete` | Confirm + `DELETE /api/admin/department/:id` |

Toolbar: **Create root department** gated `admin_department:create`.
Gate the entire screen with `*sdPermission="'admin_department:view'"`.

#### Create/Edit drawer — `detail.component.ts`

| Control | Label | Notes |
|---|---|---|
| `tenantCode` | Tenant | Required; select loaded from `GET /api/admin/tenant`; disabled in UPDATE |
| `code` | Department code | Required; disabled in UPDATE |
| `name` | Department name | Required |
| `parentCode` | Parent department | Optional; select filtered to same `tenantCode`; null = root |

- CREATE: `POST /api/admin/department`
- UPDATE: `PUT /api/admin/department/:id`

#### `department-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class DepartmentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/department';

  paging(req: PagingRequest): Observable<PagingResponse<DepartmentDTO>> {
    return this.http.get<PagingResponse<DepartmentDTO>>(this.base, { params: req as any });
  }
  detail(id: string): Observable<DepartmentDTO> {
    return this.http.get<DepartmentDTO>(`${this.base}/${id}`);
  }
  create(payload: DepartmentSaveReq): Observable<DepartmentDTO> {
    return this.http.post<DepartmentDTO>(this.base, payload);
  }
  update(id: string, payload: Partial<DepartmentSaveReq>): Observable<DepartmentDTO> {
    return this.http.put<DepartmentDTO>(`${this.base}/${id}`, payload);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

---

### Enterprise extensions to Account + Role drawers [enterprise]

**[enterprise]** adds **tenant** and **department** selectors to both the Account
(`features/account/pages/detail/`) and Role (`features/role/pages/detail/`) create/edit drawers.
These controls are bound to the `@Scoped` fields added to `user` and `role` in the BE.

#### Account create/edit drawer — additional controls

```typescript
// detail.component.ts — [enterprise] additions to the reactive form
// Load tenant list once on init; department list is filtered reactively on tenantCode change.
readonly tenants = signal<TenantDTO[]>([]);
readonly departments = signal<DepartmentDTO[]>([]);

async ngOnInit() {
  // existing init logic ...
  const [tenantList] = await Promise.all([
    firstValueFrom(this.tenantApi.paging({ page: 1, size: 200 })),
    // existing calls ...
  ]);
  this.tenants.set(tenantList.data);
}

/** Re-load departments when tenant selector changes. */
async onTenantChange(tenantCode: string | null) {
  if (!tenantCode) { this.departments.set([]); return; }
  const res = await firstValueFrom(this.deptApi.paging({ tenantCode, page: 1, size: 500 }));
  this.departments.set(res.data);
  this.form.patchValue({ departmentCode: null });   // reset stale selection
}
```

| Control | Label | Notes |
|---|---|---|
| `tenantCode` | Tenant | Optional select (null = global); options from `GET /api/admin/tenant` |
| `departmentCode` | Department | Optional select; options filtered by selected `tenantCode` |

#### Role create/edit drawer — additional controls

Same pattern: add `tenantCode` + `departmentCode` selectors. These scope the role to a specific
tenant/department pair. `tenantCode = null` = global role (same as simple profile behaviour).

| Control | Label | Notes |
|---|---|---|
| `tenantCode` | Tenant | Optional select; null = global role |
| `departmentCode` | Department | Optional select; filtered by `tenantCode` |

---

### Routes — enterprise additions

Append to `admin.routes.ts`:

```typescript
// [enterprise] tenant routes
{
  path: 'tenant',
  data: { permission: 'admin_tenant:view', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/tenant/tenant.list.component').then(m => m.TenantListComponent),
},
{
  path: 'tenant/create',
  data: { permission: 'admin_tenant:create', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/tenant/pages/detail/detail.component').then(m => m.DetailComponent),
},
{
  path: 'tenant/update/:id',
  data: { permission: 'admin_tenant:update', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/tenant/pages/detail/detail.component').then(m => m.DetailComponent),
},
// [enterprise] department routes
{
  path: 'department',
  data: { permission: 'admin_department:view', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/department/department.tree.component').then(m => m.DepartmentTreeComponent),
},
{
  path: 'department/create',
  data: { permission: 'admin_department:create', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/department/pages/detail/detail.component').then(m => m.DetailComponent),
},
{
  path: 'department/update/:id',
  data: { permission: 'admin_department:update', permissionKey: 'admin' },
  loadComponent: () =>
    import('./features/department/pages/detail/detail.component').then(m => m.DetailComponent),
},
```

---

### Sidebar "<localized text>" — enterprise additions

Append two items to the existing "<localized text>" group (after "<localized text>"):

```typescript
// [enterprise] additions to the sidebar menu group
{
  label: 'Tenant',
  route: '/admin/tenant',
  permission: 'admin_tenant:view',
},
{
  label: '<localized text>',
  route: '/admin/department',
  permission: 'admin_department:view',
},
```

Gate each item with `*sdPermission="'admin_tenant:view'"` / `*sdPermission="'admin_department:view'"`.

---

### Expected additional file tree (enterprise)

```
src/libs/admin/
  features/
    tenant/
      tenant.list.component.ts
      tenant.list.component.html
      tenant-api.service.ts
      pages/
        detail/
          detail.component.ts
          detail.component.html
    department/
      department.tree.component.ts
      department.tree.component.html
      department-api.service.ts
      pages/
        detail/
          detail.component.ts
          detail.component.html
```

---

### Verification checklist (enterprise)

- [ ] `clientSecret` never appears in GET responses or pre-filled form fields — network tab confirms.
- [ ] Tenant selector in Account/Role drawers updates the Department options reactively when changed.
- [ ] Department tree correctly shows root nodes + child nodes; a department with `parentCode` renders indented.
- [ ] Tenant + Department sidebar items are hidden for users lacking `admin_tenant:view` / `admin_department:view`.
- [ ] Navigating to `/admin/tenant` without `admin_tenant:view` redirects (route guard blocks).
- [ ] Creating a role with `tenantCode` set scopes it correctly; global roles (`tenantCode = null`) remain accessible cross-tenant.

---

### Anti-patterns (enterprise)

- Displaying or pre-filling `clientSecret` in any GET or DETAIL view — it is write-only.
- Building the department dropdown without filtering by `tenantCode` — departments from other tenants must never appear in the selector.
- Hard-coding tenant codes in permission checks — always resolve from the live `GET /api/admin/tenant` response.
- Allowing `departmentCode` to be set without first setting `tenantCode` — the combination must always be consistent.
