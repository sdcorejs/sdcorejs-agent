> **Reference for the `angular-write-code` orchestrator.** Loaded on demand and ALWAYS run after
> `init-portal`. Not a standalone skill. Generates the admin-module SCREENS (the FE for the BE
> `init-admin` pack) so end users administer accounts/roles/permissions in-app — never the Keycloak console.

# Admin Screens — Account / Role / Permission (Angular)

## Purpose / when to use

Generate `src/libs/admin/` feature screens that pair with the BE admin module (`_refs/nestjs/write-code/init-admin.md`):
account management, role management, and a read-only permission list. Routed under `/admin`.

## Source of truth — Core UI + sibling packs

Reuse the list + detail patterns from `screen-list.md` (SdTable, server-side paging) and `screen-detail.md`
(create/edit drawer + reactive form). Core UI: `SdTable`, `SdButton`, `SdFormsModule`, `SdConfirmService`,
`SdNotifyService`, and `SdPermissionDirective` (`*sdPermission="'<code>'"`) to hide actions the user can't perform.

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
| `POST` | `/api/admin/user/:id/reset-password` | Reset password (custom) |
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
| `username` | Tên đăng nhập | `type: 'text'` |
| `email` | Email | `type: 'text'` |
| `fullName` | Họ tên | `type: 'text'` |
| `roleCodes` | Vai trò | Custom cell — join `roleCodes` with `,` |
| `isActive` | Trạng thái | Boolean badge (Đang hoạt động / Đã khoá) |

Row actions (each gated by `SdPermissionDirective`):

| Action | Permission code | Behavior |
|---|---|---|
| Đặt lại mật khẩu | `admin_user:reset_password` | Confirm dialog → `POST /api/admin/user/:id/reset-password` |
| Bật / Tắt | `admin_user:update` | Toggle without confirm → `PUT /api/admin/user/:id/enabled` → reload row |
| Xoá | `admin_user:delete` | Confirm dialog → `DELETE /api/admin/user/:id` → reload table |

Toolbar: **Tạo tài khoản** button gated `admin_user:create` opens the create drawer.
Edit icon per row gated `admin_user:update` opens the edit drawer.

### Skeleton — `account.list.component.ts`

```typescript
@SdTabComponent({ name: 'Tài khoản' })
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
        { key: 'username', title: 'Tên đăng nhập', type: 'text' },
        { key: 'email',    title: 'Email',          type: 'text' },
        { key: 'fullName', title: 'Họ tên',          type: 'text' },
        { key: 'roleCodes', title: 'Vai trò',        type: 'custom' }, // template: join roleCodes
        { key: 'isActive', title: 'Trạng thái',      type: 'custom' }, // template: badge
      ],
      items: async (filter) => this.api.paging(convertTableFilter(filter)),
      // row actions wired via selector.actions + row action column
    };
  }

  async onResetPassword(user: UserDTO) {
    const ok = await this.confirm.show({ title: 'Đặt lại mật khẩu?', content: `Tài khoản: ${user.username}` });
    if (!ok) return;
    await this.loading.run(() => this.api.resetPassword(user.id));
    this.notify.success('Đã đặt lại mật khẩu');
  }

  async onToggleEnabled(user: UserDTO) {
    await this.loading.run(() => this.api.setEnabled(user.id, !user.isActive));
    this.notify.success(user.isActive ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản');
    this.tableOption.reload?.();
  }

  async onDelete(user: UserDTO) {
    const ok = await this.confirm.show({ title: 'Xoá tài khoản?', content: user.username });
    if (!ok) return;
    await this.loading.run(() => this.api.delete(user.id));
    this.notify.success('Đã xoá tài khoản');
    this.tableOption.reload?.();
  }
}
```

Reference `screen-list.md` for the full `tableOption` boilerplate, bulk-delete `selector.actions`, and audit-column placement.

### Create/Edit drawer — `detail.component.ts`

Use the `screen-detail.md` CREATE / UPDATE state pattern (no DETAIL-view state needed — the list shows all fields). Reactive form controls:

| Control | Label | Notes |
|---|---|---|
| `username` | Tên đăng nhập | Required; disabled in UPDATE (immutable) |
| `email` | Email | Required; `SdValidators.email` |
| `fullName` | Họ tên | Required |
| `roleCodes` | Vai trò | Multi-select; options loaded from `GET /api/admin/role` on init |

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
  resetPassword(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reset-password`, {});
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
| `code` | Mã vai trò | `type: 'text'` |
| `name` | Tên vai trò | `type: 'text'` |
| `permissions` | Số quyền | Custom cell — `permissions.length` |
| `isActive` | Trạng thái | Boolean badge |

Row actions: Edit (gated `admin_role:update`), Delete (gated `admin_role:delete`, confirm + `DELETE /api/admin/role/:id`).
Toolbar: **Tạo vai trò** gated `admin_role:create`.

### Create/Edit drawer — `detail.component.ts` + permission-assign grid

The drawer form contains:

| Control | Label | Notes |
|---|---|---|
| `code` | Mã vai trò | Required; disabled in UPDATE |
| `name` | Tên vai trò | Required |
| `isActive` | Kích hoạt | Boolean switch |
| `permissions` | Phân quyền | Managed by the permission-assign grid below (not a plain `sd-input`) |

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

permissionFor(model: string, action: string): PermissionDTO | undefined {
  return this.allPermissions().find(p => p.model === model && p.action === action);
}

isChecked(code: string): boolean {
  return this.selectedCodes().has(code);
}

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
  if (this.entity().permissions) {
    this.selectedCodes.set(new Set(this.entity().permissions));
  }
}
```

HTML template sketch for the grid (inline inside the drawer form):

```html
<table class="permission-grid">
  <thead>
    <tr>
      <th>Module / Thực thể</th>
      @for (action of actions(); track action) { <th>{{ action }}</th> }
    </tr>
  </thead>
  <tbody>
    @for (model of models(); track model) {
      <tr>
        <td>{{ model }}</td>
        @for (action of actions(); track action) {
          <td>
            @let perm = permissionFor(model, action);
            @if (perm) {
              <input type="checkbox"
                     [checked]="isChecked(perm.code)"
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
| `model` | Module / Thực thể | `type: 'text'` |
| `code` | Mã quyền | `type: 'text'` |
| `label` | Nhãn | `type: 'text'` |
| `action` | Hành động | `type: 'text'` |

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

### Sidebar menu group "Quản trị"

Add a menu group to the portal's sidebar config (see `init-portal.md` for the menu registration pattern). Each item gated by the matching `:view` permission via `SdPermissionDirective` (or the layout's permission-aware menu config):

```typescript
{
  group: 'Quản trị',
  icon: 'shield',         // use project icon set
  items: [
    {
      label: 'Tài khoản',
      route: '/admin/account',
      permission: 'admin_user:view',    // layout hides item when user lacks this code
    },
    {
      label: 'Vai trò',
      route: '/admin/role',
      permission: 'admin_role:view',
    },
    {
      label: 'Quyền',
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
- [ ] **Permission gating** — log in as a user WITHOUT `admin_user:reset_password`; confirm the "Đặt lại mật khẩu" row action is hidden. Repeat for each `admin_*` code.
- [ ] **Reset-password calls the custom route** — network tab shows `POST /api/admin/user/:id/reset-password`, NOT the generic update endpoint.
- [ ] **Permission-assign grid** — opening a role's edit drawer shows a checkbox matrix; checking/unchecking cells updates the `permissions` array sent on save.
- [ ] **Permission screen is read-only** — no create/edit/delete controls render, regardless of user role.
- [ ] **Routes protected** — navigating to `/admin/account` without `admin_user:view` redirects (route guard blocks access).
- [ ] **Sidebar items hidden** — menu items under "Quản trị" do not appear for users lacking the corresponding `:view` permission.

---

## Anti-patterns

- Calling `/api/admin/permission` for writes — the permission registry is read-only from the FE.
- Using `formControlName` with Core UI form components — they self-register via `[form]+name`; use `[(model)]` binding instead (see `screen-detail.md` MUST NOT).
- Performing the `reset-password` / `enabled` toggle / `assign-roles` calls via the generic `PUT /api/admin/user/:id` update — use the dedicated custom routes from `AccountApiService`.
- Showing all row actions unconditionally — each action MUST be gated by its matching `*sdPermission` directive.
- Building the permission-assign grid from hard-coded strings — always derive `models` + `actions` from the live `GET /api/admin/permission` response so new permissions added BE-side appear automatically.
- Skipping `data.permission` on any route — the route guard relies on it to block unauthorized navigation.
