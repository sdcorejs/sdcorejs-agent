> **Reference for the `angular-portal-write-code` orchestrator.** Loaded on demand when the
> confirmed plan includes initializing a brand-new portal repo. Not a standalone skill — the
> orchestrator reads this file when its dispatch table routes a step here.

# Init Portal — Angular Portal Project Initialization

## Overview

Generates production-ready Angular portal starter by rendering every file from the code templates in [`_refs/angular-portal/templates/init-portal-templates.md`](_refs/angular-portal/templates/init-portal-templates.md) plus the structure tree in §4. No external baseline directory is required.

**Output:** Complete portal with sample lib (1 module, 2 entities), dev tools, ready for `npm start`.

---

## Source of truth — Core UI package

This reference uses two placeholders wherever the Core UI package appears:

| Placeholder | Resolved from `_refs/angular-portal/core-version.md` field |
|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `packageName` |
| `<CORE_VERSION>` | `currentVersion` |

> The actual values live ONLY in [`_refs/angular-portal/core-version.md`](_refs/angular-portal/core-version.md). Do not duplicate them here — the drift-check hook will block any literal version or any import statement that hardcodes the Core UI package name in this file.

**BEFORE generating any file**, the agent MUST:

1. Read [`_refs/angular-portal/core-version.md`](_refs/angular-portal/core-version.md) and extract `packageName` + `currentVersion`
2. Substitute every `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` token in this reference's output with those values
3. Apply the same substitution to import statements, resolving `<CORE_UI_PACKAGE_NAME>` from `core-version.md` (default `@sdcorejs/angular`).
4. NEVER hardcode a literal version string in generated `package.json` / commit message / verification text

Single-file bump: change `_refs/angular-portal/core-version.md` and every future portal picks it up. Do NOT find-replace placeholders inside this reference file itself — they are intentional.

If `_refs/angular-portal/core-version.md` is missing or malformed, STOP and ask the user — never guess the version or package name.

---

## When to Use

- "Tạo portal mới cho dự án HR"
- "Gen new sales portal starter"
- "Create angular-portal with CRUD module"

---

## Input Resolution

Before generating, clarify with user:

1. **Project Name** (required) — e.g. `hr-portal`, `sales-portal`
2. **Environments** (optional, defaults: `dev`, `qc`, `uat`, `prod`)
3. **Application Title** (optional, default: `Portal`)
4. **Sample Entity Names** (optional, defaults: `order`, `customer` — Order uses `<customer-select>` so the sample also demos the base-select / entity-select pattern)
5. **Additional Modules** (optional) — answer: "Use plop or the init-module reference (`./init-module.md`) after generation"

> **Port** is fixed at `4200` (Angular default). Do not ask.

---

## Generation Steps

### Step 1: Render Starter From Templates

**Source:** [`_refs/angular-portal/templates/init-portal-templates.md`](_refs/angular-portal/templates/init-portal-templates.md) + the structure tree in §4 ("Expected Starter Structure"). Every file listed in the tree maps to a section in the templates ref; render each one with `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` already substituted (see §"Source of truth — Core UI package" at the top).

**Brand asset (logo):**
- Copy [`_refs/angular-portal/assets/logo.png`](_refs/angular-portal/assets/logo.png) into the generated portal at `public/logo.png`.
- Wire it in [`src/app/configurations/layout.configuration.ts`](_refs/angular-portal/templates/init-portal-templates.md#layoutconfigurationts) as `sidebar.logoUrl: '/logo.png'` (template handles this).
- If the user supplies a project-specific logo later, they only need to replace `public/logo.png` — no code change.

**Render Exclusion Rule (MANDATORY):**
- Never render local AI/tooling folders into the target starter repo
- Exclude at minimum: `.claude`, `.github`, `.git`, `.vscode-test`
- Exclude `.gitkeep` placeholders in generated output, especially under `src/libs/**`
- If these folders appear in output, remove them before returning generation result

**Result:** Fresh portal project with:

```
portal-new/
├── package.json                   # <CORE_UI_PACKAGE_NAME>: <CORE_VERSION> (npm)
├── tsconfig.json                  # baseUrl + @sample paths
├── angular.json                   # build/serve configs
├── src/
│   ├── main.ts                    # Bootstrap with config providers
│   ├── app/
│   │   ├── app.component.ts       # RouterOutlet
│   │   ├── app.routes.ts          # Lazy-load layout + sample
│   │   └── configurations/        # Auth, Layout, Permission
│   └── libs/
│       └── sample/                # ONE sample lib only
│           ├── sample.configuration.ts
│           ├── sample.module.ts
│           ├── routes.ts
│           ├── configurations/    # API interceptor, upload config
│           ├── services/base/     # BaseService with CRUD
│           ├── components/        # MODULE-level reusables
│           │   ├── base-select/   # generic dropdown
│           │   └── customer-select/ # per-entity dropdown (reused by Order)
│           └── features/
│               ├── order/         # AdaptiveSplitDetail — Order form uses <customer-select>
│               └── customer/      # UnifiedCompact full-page detail
├── .prettierrc.json
├── .vscode/
└── plopfile.js                    # Optional generators
```

### Step 2: Dependency Management

Run `npm install`. See `package.json` template below — pins `<CORE_UI_PACKAGE_NAME>@<CORE_VERSION>`.

### Step 3: Build Verification

```
npm run build-dev
# Expect: exit code 0, dist/ folder produced
```

### Step 4: Dev Server

```
npm start
# Expect: server at http://localhost:4200/
```

### Step 5: Test Verification (Mandatory)

```bash
# Unit/integration
npm run test -- --watch=false

# E2E (only when project has e2e script/config)
npm run e2e
```

Report pass/fail summary and failing spec names. If E2E missing, report blocker.

---

## 3. Rules

### MUST DO ✅
- Read `_refs/angular-portal/core-version.md` and substitute placeholders BEFORE writing any file
- Render every file from [`_refs/angular-portal/templates/init-portal-templates.md`](_refs/angular-portal/templates/init-portal-templates.md) (no external baseline directory exists or is required)
- Copy [`_refs/angular-portal/assets/logo.png`](_refs/angular-portal/assets/logo.png) to `<project>/public/logo.png` and ensure `LayoutConfiguration.sidebar.logoUrl === '/logo.png'`
- Generate exactly ONE sample lib with TWO entities: `order` + `customer` (Order's create/update form uses `<customer-select>` — demonstrates the reusable dropdown pattern from the init-module reference, `./init-module.md`)
- Use `features/` (NOT `modules/`) at the lib level — `src/libs/<lib>/features/<entity>/`
- When applying this reference to a legacy project that already uses `modules/`, still generate new code under `features/` and recommend renaming the existing `modules/` directory
- Place sample lib's reusable dropdowns at MODULE level: `src/libs/sample/components/base-select/` + `src/libs/sample/components/customer-select/`
- Keep the layout route lazy-loaded from Core UI: `loadChildren: () => import('<CORE_UI_PACKAGE_NAME>/modules/layout').then(m => m.SdLayoutModule)`
- Permission code convention is **flexible per project, consistent within a project**:
  - Scaffold default: `<MODULE>_<ENTITY>_<ACTION>` (e.g. `SAMPLE_ORDER_LIST`)
  - Acceptable variants: `<MODULE>_C_<ENTITY>_<ACTION>` (e.g. `SAMPLE_C_ORDER_LIST`), `<MODULE>_<ENTITY>:<ACTION>`, etc.
  - REQUIREMENT: Module → Entity → Action order, large-to-small, AND a single convention across the whole portal. Never mix two conventions in one project.
  - When applying to an existing project, detect the established convention and follow it
- Permission Configuration in starter MUST default to `disabled = true` so the portal boots without a permission backend
- Add a final double-check report covering: routes, provider wiring, environment scripts, unresolved imports

### MUST NOT ❌
- Do not hard-code fixed home/about restrictions; starter may include a customizable `src/app/pages/home` and wire `LayoutConfiguration.homeUrl`
- Do not skip `src/libs/sample` in starter generation
- Do not skip seeding 2 sample entities (`order`, `customer`)
- Do not use local tarball dependency style (`file:sd-angular-core-*.tgz`)
- Do not leave broken path aliases to removed libs in `tsconfig.json`
- Do not generate a starter that requires backend auth, permissions, or APIs to boot locally
- Do not replace `<CORE_UI_PACKAGE_NAME>` with ad-hoc local components
- Do not hard-code environment names different from the developer request
- Do not place `SD_PERMISSION_CONFIGURATION` / `SD_UPLOAD_FILE_CONFIGURATION` in module or route providers with `multi: true` and expect root services to consume them
- Do not enable permission checks by default (`disabled = true`) when permission backend/data source is not ready
- Do not mix two permission-code conventions in the same project

---

## 4. Template

### Preconditions
```text
Required before applying this reference:
- `_refs/angular-portal/templates/init-portal-templates.md` is present (file-content templates)
- `_refs/angular-portal/core-version.md` is present (packageName + currentVersion)
- `_refs/angular-portal/assets/logo.png` is present (default brand logo)
- developer confirmed project name
- developer confirmed environment names
- developer confirmed starter should include sample scaffold under `src/libs/sample`
```

### Clarification Questions
```text
Ask the developer:
1. Tên project portal mới là gì? (vd: portal-ops)
2. Cần các môi trường nào? Mặc định: dev, qc, uat, prod
3. Tiêu đề portal/sidebar mặc định là gì?
4. Giữ 2 entity mẫu mặc định (`order`, `customer`) hay đổi tên?
```

### Expected Starter Structure
```text
[project-name]/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── eslint.config.js
├── plopfile.js
├── public/
│   ├── silent-renew.html
│   └── logo.png                    # copied from _refs/angular-portal/assets/logo.png; replace per project
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── components/
│   │   │   └── main/
│   │   │       ├── main.component.ts
│   │   │       └── main.component.html
│   │   └── configurations/
│   │       ├── auth.configuration.ts
│   │       ├── layout.configuration.ts
│   │       ├── permission.configuration.ts
│   │       └── index.ts
│   └── environments/
│       ├── environment.model.ts
│       ├── environment.ts
│       ├── environment.dev.ts
│       ├── environment.qc.ts
│       ├── environment.uat.ts
│       └── environment.prod.ts
└── src/libs/
    └── sample/
        ├── sample.configuration.ts
        ├── sample.module.ts
        ├── routes.ts
        ├── index.ts
        ├── configurations/
        │   ├── api.configuration.ts
        │   └── upload-file.configuration.ts
        ├── services/
        │   └── base/
        │       └── base.service.ts
        ├── components/
        │   ├── base-select/
        │   │   ├── base-select.component.ts
        │   │   └── base-select.component.html
        │   └── customer-select/
        │       └── customer-select.component.ts
        └── features/
            ├── order/
            │   ├── routes.ts
            │   ├── services/
            │   │   ├── order.model.ts
            │   │   └── order.service.ts
            │   └── pages/
            │       ├── list/list.component.ts
            │       └── detail/detail.component.ts
            └── customer/
                ├── routes.ts
                ├── services/
                │   ├── customer.model.ts
                │   └── customer.service.ts
                └── pages/
                    ├── list/list.component.ts
                    └── detail/detail.component.ts
```

### Code templates

All file-content templates referenced by the Generation Steps above live in [`_refs/angular-portal/templates/init-portal-templates.md`](_refs/angular-portal/templates/init-portal-templates.md). Read it when writing the corresponding files:

| File to generate | Section in templates ref |
|---|---|
| `package.json` | [`#packagejson`](_refs/angular-portal/templates/init-portal-templates.md#packagejson) |
| `src/app/app.routes.ts` | [`#approutests`](_refs/angular-portal/templates/init-portal-templates.md#approutests) |
| `src/main.ts` | [`#maints`](_refs/angular-portal/templates/init-portal-templates.md#maints) — most rationale-heavy; preserve the inline `// Why ...` comments verbatim |
| `src/app/configurations/permission.configuration.ts` | [`#permissionconfigurationts-starter-default--disabled`](_refs/angular-portal/templates/init-portal-templates.md#permissionconfigurationts-starter-default--disabled) |
| `src/app/configurations/layout.configuration.ts` | [`#layoutconfigurationts`](_refs/angular-portal/templates/init-portal-templates.md#layoutconfigurationts) — wires `sidebar.logoUrl: '/logo.png'` |
| `public/logo.png` | copy raw bytes from [`_refs/angular-portal/assets/logo.png`](_refs/angular-portal/assets/logo.png) (no substitution) |
| `src/libs/sample/routes.ts` | [`#sampleroutests`](_refs/angular-portal/templates/init-portal-templates.md#sampleroutests) |

Resolve `<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` from `_refs/angular-portal/core-version.md` **before** materializing any of these files (see §"Source of truth — Core UI package" at the top of this reference).

### Verification Steps
```text
After generation:
1. Confirm package name, Angular project name, and output path match developer request
2. Confirm every file in §"Expected Starter Structure" was rendered from `_refs/angular-portal/templates/init-portal-templates.md` and that no workspace-external dependency is referenced
3. Confirm `public/logo.png` exists in the target project (copied from `_refs/angular-portal/assets/logo.png`) and `LayoutConfiguration.sidebar.logoUrl === '/logo.png'`
4. Confirm `tsconfig.json` has no unnecessary `compilerOptions.baseUrl` (or document why it is needed)
5. Run npm install
6. Run npm start
7. Open /sample/order and /sample/customer routes — verify the sidebar renders the logo from `/logo.png`
8. Open Order detail and verify the <customer-select> dropdown lists customers
9. If build config exists, run npm run build-dev
10. Run starter unit tests (at minimum route/bootstrap smoke specs)
```

---

## Validation Checklist (apply at end of generation)

- [ ] `_refs/angular-portal/core-version.md` read; placeholders substituted (no literal version/package string left in generated files)
- [ ] `_refs/angular-portal/templates/init-portal-templates.md` read and every listed section rendered into the target project (no external baseline copy used)
- [ ] `public/logo.png` copied from `_refs/angular-portal/assets/logo.png`; `LayoutConfiguration.sidebar.logoUrl === '/logo.png'`
- [ ] `package.json` pins `<CORE_UI_PACKAGE_NAME>@<CORE_VERSION>` (npm, not tgz)
- [ ] `tsconfig.json` has `"baseUrl": "./"` + `"@sample": ["./src/libs/sample"]` + `"@sample/*": ["./src/libs/sample/*"]`
- [ ] `app.routes.ts` lazy-loads sample lib + Core UI layout
- [ ] `SampleModule.useValue({ host: environment.sampleBackendUrl })` wired at root in `main.ts` (no route-level providers)
- [ ] Sample lib has 2 entities under `src/libs/sample/features/`:
  - [ ] `order/` — Order list + detail; detail form contains `<customer-select>` referencing the `customer` entity
  - [ ] `customer/` — Customer list + detail
- [ ] Module-level reusables generated:
  - [ ] `src/libs/sample/components/base-select/`
  - [ ] `src/libs/sample/components/customer-select/`
- [ ] Permission code convention is consistent across the generated portal (single style)
- [ ] `PermissionConfiguration.disabled = true` in starter
- [ ] `npm install` succeeds
- [ ] `npm run build-dev` exits 0
- [ ] `npm start` serves at `http://localhost:4200/`
- [ ] Order list renders; create flow opens with `<customer-select>` populated
- [ ] Prettier formats code on save
- [ ] `.vscode` extensions recommended

---

## Post-init — write the project summary

A freshly scaffolded portal has no `.sdcorejs/summary.md` yet. After the validation checklist passes, run `orchestration/auto-summary` in WRITE mode to create it (domain, stack, the generated module/lib layout, reuse cheatsheet, conventions, current git HEAD). This is what the next session and the write-code orchestrator's Step 0 pre-flight will read instead of re-scanning blind. Skipping it means the very next code-writing run pays a full re-discovery.

---

## 5. Example Input

```text
Khoi tao du an portal-starter-moi co cac moi truong dev, qc, uat va prod.
Can include sample scaffold de demo module + entity-select pattern.
Tich hop san <CORE_UI_PACKAGE_NAME>.
Tao src/libs/sample va seed 2 entity order, customer (Order su dung customer-select).
```

## 6. Example Output

### Agent Decision
```text
Render every file from _refs/angular-portal/templates/init-portal-templates.md as source.
Copy _refs/angular-portal/assets/logo.png to public/logo.png and wire sidebar.logoUrl.
Create project portal-starter-moi.
Keep app shell, core configuration, environments, and plop generator files.
Generate src/libs/sample scaffold with:
  - components/base-select (generic dropdown)
  - components/customer-select (per-entity dropdown)
  - features/order (uses <customer-select> in detail form)
  - features/customer
Pin <CORE_UI_PACKAGE_NAME> to npm version <CORE_VERSION> via _refs/angular-portal/core-version.md (no local tgz).
Ship PermissionConfiguration with disabled=true so the portal boots without a permission backend.
Then run npm install and npm start to verify the starter boots.
```

### Files Generated/Updated
```text
[project-name]/package.json
[project-name]/angular.json
[project-name]/tsconfig.json
[project-name]/src/main.ts
[project-name]/src/app/app.routes.ts
[project-name]/src/app/components/main/main.component.ts
[project-name]/src/app/components/main/main.component.html
[project-name]/src/app/configurations/auth.configuration.ts
[project-name]/src/app/configurations/layout.configuration.ts
[project-name]/src/app/configurations/permission.configuration.ts
[project-name]/public/logo.png
[project-name]/src/libs/sample/sample.configuration.ts
[project-name]/src/libs/sample/sample.module.ts
[project-name]/src/libs/sample/routes.ts
[project-name]/src/libs/sample/components/base-select/base-select.component.ts
[project-name]/src/libs/sample/components/base-select/base-select.component.html
[project-name]/src/libs/sample/components/customer-select/customer-select.component.ts
[project-name]/src/libs/sample/features/order/routes.ts
[project-name]/src/libs/sample/features/order/services/order.service.ts
[project-name]/src/libs/sample/features/order/services/order.model.ts
[project-name]/src/libs/sample/features/customer/routes.ts
[project-name]/src/libs/sample/features/customer/services/customer.service.ts
[project-name]/src/libs/sample/features/customer/services/customer.model.ts
[project-name]/src/environments/environment.dev.ts
[project-name]/src/environments/environment.qc.ts
[project-name]/src/environments/environment.uat.ts
[project-name]/src/environments/environment.prod.ts
```
