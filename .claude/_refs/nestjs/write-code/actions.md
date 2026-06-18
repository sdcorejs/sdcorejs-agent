> **Reference for the `sdcorejs-nestjs` orchestrator.** Loaded on demand when the
> confirmed plan adds custom (non-CRUD) endpoints or domain behavior on top of an
> entity stack that `init-entity` already scaffolded. Not a standalone skill — the
> orchestrator reads this file when its dispatch table routes a step here. This is the
> "everything beyond plain CRUD" pack: custom service methods, cross-module access,
> custom controller routes, bulk operations, Excel export, workflow/state transitions,
> explicit transactions, domain errors, and permission-gated DTO fields.

# Actions — Custom Endpoints & Domain Behavior (`@sdcorejs/nestjs`)

## Contents

- Purpose / when to use
- Critical write-target rule
- Persona Step 0
- Source of truth - core package
- Action patterns and endpoint shapes
- Permission-gated DTO fields
- Bulk, import, export, workflow, and transaction rules
- Tests, verification, and handoff

## Purpose / when to use

`init-entity` gives one entity its full CRUD surface (`paging` / `detail` / `create` / `update` / `delete` inherited or written). **Most real features need more** — a "my tasks" listing, a status transition, a bulk import, an Excel report, a multi-write operation that must be atomic. This pack adds those **on top of an existing entity stack**, extending the same four building blocks (`I<Entity>Service` interface + impl, `<Entity>Controller`, `<Entity>Repository`, the module wiring) without re-scaffolding them.

Run order: **`init-project` → `init-module` → `init-entity` → `actions`** (this pack). Run it whenever the plan asks to:

- "Thêm action / nút approve / chuyển trạng thái" — a workflow/state transition (`@Put(':id/transition')`).
- "Màn của tôi / việc của team" — caller-scoped listings (`mine` / `team`).
- "Xuất Excel / export báo cáo" — an `exceljs` workbook download.
- "Import / bulk create / xóa nhiều" — bulk write via `repo.import(...)` / `softDelete(ids)`.
- "Tạo + cập nhật nhiều bảng trong 1 lần" — an atomic multi-write threaded through a `QueryRunner`.
- "Chỉ leader mới sửa được" — permission-/ownership-gated capability flags in `mapDTO`.

**Output:** new methods on the entity's service + new routes on its controller, wired with `@HasPermission` + (where a body exists) `ZodValidationGuard`, returning `ApiResponse.ok(...)`. After this step `npm run build` typechecks the new surface and the routes resolve under `/<module>/<entity>/...`.

### Critical write-target rule

**All generated code is written to the TARGET backend project** (the one `init-project` / `init-module` / `init-entity` built), NEVER into this agent repo (`sdcorejs-agent`). The templates below are the source of truth; render them into the target project's `src/modules/<module>/...` and `base/shared/<module>/...`.

### Persona Step 0 (non-tech mode)

If the persona is **non-technical**, open with plain language before generating, e.g.:

> "I'll add the actions you described to `<entity>` — for example a button to change its status, a 'my items' list, and an Excel export. These build on the create/edit/list screens we already set up; I'll also make sure only the right people can use each action."

Then confirm only the blocking inputs (which action, who may use it, what it does to the data). For a technical persona, skip the narration.

---

## Source of truth — core package

Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) BEFORE generating. Every import below MUST match a sub-path the catalog documents. The pieces this pack relies on (catalog "ORM building blocks"):

- `BaseService<T, TDto>` (`/core`) — write methods `create(entity, qr?)`, `update(id, entity, qr?)`, `delete(id)`, `softDelete(id)`, `restore(id)`; read methods `paging(req, args?)`, `detail(id)`, `all(filters?, args?)`. `BaseService.import(entities)` has no `QueryRunner` argument in v1.0.0; use the underlying `BaseRepository.import(entities, qr?)` when a bulk insert must participate in an explicit transaction. The protected `repository` accessor reaches the underlying `BaseRepository` and its raw TypeORM `repository` / `queryRunner`.
- `BaseRepository<T>` (`/core`) — `queryRunner` accessor (a fresh, un-connected `QueryRunner` from the data source), `repository` accessor (the raw TypeORM `Repository<T>` for ad-hoc `find` / `findOne` / `findOneByOrFail`), and the same `qr?`-accepting write methods.
- `@HasPermission(code)` / `@HasAnyPermission(...codes)` (`/auth`) — per-route gates.
- `ZodValidationGuard(schema, source?)` (`/validation`) — boundary validation for routes with a body.
- `ApiResponse.ok(data)` (`/core`, re-exported at root) — success envelope.

App-local helpers (emitted by `init-project`, not the lib):

- `SdContext` (`src/common/core`) — static facade: `userId`, `departmentCode`, `tenantCode`, `fullName`, `lang`, `hasPermission('<model>', '<action>')`. *(Ground: ref app `src/common/core/sd-context.ts`.)* (`enterprise` profile; in `simple` use the lib `ContextService` directly — `@Inject(ContextService)`)
- `badRequest(code, data?)` (`src/common/errors`) — throws a code-based 400 the i18n exception filter localizes. *(Ground: ref app `src/common/errors.ts`.)*
- `AdminAuthGuard` (`src/common/admin-auth.guard`) — class-level guard that authenticates + loads permission codes into context. (`enterprise`; `simple` uses the core `AuthGuard`)

This pack is grounded throughout in the ref app's rich `crm` task feature:

- `src/modules/crm/services/task.service.ts` — `mine` / `team` / `createDTO` / `updateDTO` / `transition` / `exportReportSummary`, cross-module `@Inject(IUserService)` / `@Inject(ITeamService)` / `@Inject(IEmployeeService)`, `SdContext`, `badRequest`, permission-gated `mapDTO`.
- `src/modules/crm/controllers/task.controller.ts` — custom routes `@Post('mine')` / `@Post('team')` / `@Get('export-report-summary')` / `@Put(':id/transition')`.
- `src/modules/crm/services/reference-data.service.ts` + `src/modules/masterdata/services/employee.service.ts` — the `QueryRunner` connect/startTransaction/commit/rollback/release pattern and bulk import.

---

## Profile (read FIRST)

Read `profile` from `<target>/.sdcorejs/summary.md` (default `simple`). The action PATTERNS
below (caller-scoped listing, transition, bulk, Excel export, transactions, domain errors,
permission-gated flags) are profile-INDEPENDENT. Two things differ:
- **Context access:** `enterprise` uses the `SdContext` static facade; `simple` injects the lib
  `ContextService` (`@Inject(ContextService)` from `@sdcorejs/nestjs/core`) — `ctx.userId`,
  `ctx.get('user')`, `ctx.hasPermission('<module>_<entity>:<action>')`. There is no `SdContext` in simple.
- **Guard:** `enterprise` uses `AdminAuthGuard`; `simple` uses the core `AuthGuard` (`@sdcorejs/nestjs/auth`).
- **Department-scoped variants** (e.g. a `team` listing scoped by `departmentCode`) are `[enterprise]`-only.

---

## Input resolution

Before generating, confirm:

1. **Target entity** (required) — the `<Entity>` whose stack you extend (already scaffolded by `init-entity`). All naming follows that entity's derivation: `<module>` / `<Entity>` / `<entity>` / `I<Entity>Service` / `<Entity>Controller` / permission model `<module>_<entity>`.
2. **Which action(s)** (required) — one or more of: caller-scoped listing (`mine` / `team`), state transition, bulk op, Excel export, atomic multi-write.
3. **Permission action(s)** (required) — the custom action suffix each route enforces (`view_mine`, `view_team`, `transition`, `export_report_summary`, `import`, …). These EXTEND the flat `<module>_<entity>:<action>` namespace alongside the CRUD `create` / `update` / `delete`.
4. **Cross-module deps** (optional) — other modules' service I-tokens this behavior needs (e.g. `IUserService`, `ITeamService`, `IEmployeeService`). Each requires the providing module in `<module>.module.ts` `imports`.
5. **Request shapes** (optional) — for routes with a body, the request type (e.g. `<Entity>TransitionReq`) + its Zod schema appended to `schemas/<module>.schema.ts`.

> Naming derivation (carried from `init-entity`): `<Entity>` = `Task`, `<entity>` = `task`, service token/class = `ITaskService` / `TaskService`, controller = `TaskController`, permission model = `crm_task`, custom request = `TaskTransitionReq`, transition schema = `TaskTransitionSchema`. Keep all consistent.

---

## 1. Custom service methods (extend `I<Entity>Service` + the impl)

A domain method is declared on the **interface** AND implemented on the **class** — the interface is the DI port other modules + the controller depend on. Add the new signatures to `I<Entity>Service` (which `extends IBaseService<<Entity>, <Entity>DTO>`), then implement them on `<Entity>Service`. Read request context (the caller's identity / scope / permissions) through the `SdContext` facade — never inject `ContextService` directly. *(Ground: ref app `task.service.ts` lines 16-23 (interface) + `mine` lines 68-89 + `team` lines 91-129 — caller-scoped paging using `SdContext.userId`, raw `andWheres` SQL, the cross-module `employeeService`. Note: the `team` method, line 91-129, scopes results by `departmentCode` — `[enterprise]` only.)*

> Simple profile: replace `SdContext.userId` with the injected lib `ContextService` — `this.ctx.userId`. Inject `@Inject(ContextService)` (from `@sdcorejs/nestjs/core`) in the service constructor. No `SdContext` facade exists in simple.

```ts
import { Inject, Injectable } from '@nestjs/common';
import { BaseService, IBaseService } from '@sdcorejs/nestjs/core';
import { SdContext } from 'src/common/core';
import { badRequest } from 'src/common/errors';
import { <Entity>DTO } from '@shared/<module>';
import { PagingReq, PagingRes } from '@shared/core';
import { <Entity> } from 'src/modules/<module>/entities';
import { I<Entity>Repository } from 'src/modules/<module>/repositories';

export interface I<Entity>Service extends IBaseService<<Entity>, <Entity>DTO> {
  // Caller-scoped listing: only rows owned by / assigned to the current user.
  mine: (req: PagingReq<<Entity>>) => Promise<PagingRes<<Entity>DTO>>;
  // [enterprise] — department-scoped listing (scoped by SdContext.departmentCode); omit in the simple profile (single-tenant, no departmentCode).
  // team: (req: PagingReq<<Entity>>) => Promise<PagingRes<<Entity>DTO>>;
  // A status transition (see §6 — Workflow). Returns the updated entity.
  transition: (id: string, req: <Entity>TransitionReq) => Promise<<Entity>>;
}

export const I<Entity>Service = Symbol('I<Entity>Service');

@Injectable()
export class <Entity>Service extends BaseService<<Entity>, <Entity>DTO> implements I<Entity>Service {
  constructor(@Inject(I<Entity>Repository) repository: I<Entity>Repository) {
    super(repository);
  }

  /**
   * "My <entity>s" — paging scoped to the current caller. SdContext.userId comes from the
   * authenticated request (ALS store). The base `paging` accepts a second arg of extra
   * raw `andWheres` (parameterized) that AND with the standard filters. `e` aliases the row.
   */
  mine = async (req: PagingReq<<Entity>>): Promise<PagingRes<<Entity>DTO>> => {
    const { userId } = SdContext;
    const { items, total } = await this.paging(req, {
      andWheres: [
        {
          where: `(e."assigneeId" = :userId OR e."createdBy" = :userId)`,
          parameters: { userId },
        },
      ],
    });
    return { items, total };
  };

  // mapDTO (permission-gated) lives below — see §8.
}
```

> **Always go through `BaseService` write/read methods** (`this.create` / `this.update` / `this.paging` / `this.detail`) so tenancy scope, audit hooks, soft-delete filtering, and `mapDTO` all apply uniformly. Reach the raw TypeORM repository (`this.repository.repository.find(...)`) only for read-side aggregation where the base methods don't fit (the ref app does this in `exportReportSummary`). Validate inputs with `badRequest('<i18n-code>', params)` (§7), not raw `throw new Error(...)`.

**Append barrel line** — none needed; the service file already exists (edited in place). Just keep its `export * from './<entity>.service';` in `services/index.ts` (unchanged).

---

## 2. Cross-module access (inject another module's service I-token)

Cross-module data NEVER crosses via SQL join (no cross-schema FK) or HTTP — it crosses via the **exported service `Symbol` token** of the producing module. The consumer (a) injects the token with `@Inject(IOtherService)`, and (b) adds the producing module to its own `<module>.module.ts` `imports` so DI can resolve it. *(Ground: ref app `task.service.ts` lines 29-38 — constructor injects `@Inject(IUserService)` (from `AdminModule`), `@Inject(ITeamService)` + `@Inject(IEmployeeService)` (from `MasterdataModule`); `crm.module.ts` lines 75-77 — `imports: [AdminModule, MasterdataModule]`.)*

**2a — inject the tokens in the service constructor:**

```ts
import { IUserService } from 'src/modules/admin/services';
import { IEmployeeService, ITeamService } from 'src/modules/masterdata/services';

@Injectable()
export class <Entity>Service extends BaseService<<Entity>, <Entity>DTO> implements I<Entity>Service {
  constructor(
    // Cross-module dependency ports (other modules' EXPORTED service tokens):
    @Inject(IUserService) private userService: IUserService,
    @Inject(ITeamService) private teamService: ITeamService,
    @Inject(IEmployeeService) private employeeService: IEmployeeService,
    // This entity's own repository (last, as init-entity emitted it):
    @Inject(I<Entity>Repository) repository: I<Entity>Repository,
  ) {
    super(repository);
  }

  // ...then call them in domain methods, e.g.:
  // const assigneeSnapshot = await this.userService.userSnapshot(assigneeId);
  // const employee = await this.employeeService.internalDetail(SdContext.userId);
  // const team = await this.teamService.internalDetail(teamId);
}
```

**2b — add the providing modules to `<module>.module.ts` `imports`** (idempotent — skip if present):

```ts
import { AdminModule } from 'src/modules/admin/admin.module';
import { MasterdataModule } from 'src/modules/masterdata/masterdata.module';

@Module({
  imports: [
    AdminModule,        // exposes IUserService
    MasterdataModule,   // exposes IEmployeeService, ITeamService
    TypeOrmModule.forFeature([ /* …existing… */ ]),
  ],
  // controllers / providers / exports unchanged
})
export class <Module>Module {}
```

> The consumed services are **internal-facing reads** — the ref app calls `employeeService.internalDetail(...)` / `teamService.internalDetail(...)` / `userService.userSnapshot(...)`, methods the producing service exposes on its interface specifically for in-process callers (no permission re-check, returns the full shape). When you add a cross-module call, confirm the target interface actually declares the method you need; if not, that method belongs in the producing entity's own `actions` pass first. **A cross-module cycle (A imports B, B imports A) will fail DI** — break it by having only the higher-level module import the lower-level one, or use `forwardRef` (last resort).

---

## 3. Custom controller routes

Add the new routes to the existing `<Entity>Controller` (it already `extends BaseController` + carries class-level `@UseGuards(AdminAuthGuard)`). Each custom route: a per-route `@HasPermission('<module>_<entity>:<action>')`, plus `@UseGuards(ZodValidationGuard(<Schema>))` when it has a body, returning `ApiResponse.ok(...)`. *(Ground: ref app `task.controller.ts` — `@Post('mine')` line 20-24, `@Put(':id/transition')` line 53-56, `@Get('export-report-summary')` line 39-45.)*

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/core';
import { HasPermission } from '@sdcorejs/nestjs/auth';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { AdminAuthGuard } from 'src/common/admin-auth.guard';
import { Body, Controller, Get, Inject, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse as SharedApiResponse, PagingReq } from '@shared/core';
import { <Entity>DTO, <Entity>TransitionReq } from '@shared/<module>';
import { <Entity> } from 'src/modules/<module>/entities';
import { <Entity>TransitionSchema } from 'src/modules/<module>/schemas/<module>.schema';
import { I<Entity>Service } from 'src/modules/<module>/services';

@Controller('<entity>')
@UseGuards(AdminAuthGuard)
export class <Entity>Controller extends BaseController<<Entity>, <Entity>DTO> {
  constructor(@Inject(I<Entity>Service) private readonly service: I<Entity>Service) {
    super(service);
  }

  // ----- caller-scoped listing (body = paging request) -----
  @Post('mine')
  @HasPermission('<module>_<entity>:view_mine')
  async mine(@Body() req: PagingReq<<Entity>>) {
    return ApiResponse.ok(await this.service.mine(req));
  }

  // ----- state transition (body validated by a Zod schema) -----
  @Put(':id/transition')
  @HasPermission('<module>_<entity>:transition')
  @UseGuards(ZodValidationGuard(<Entity>TransitionSchema))
  async transition(@Param('id') id: string, @Body() req: <Entity>TransitionReq) {
    return ApiResponse.ok(await this.service.transition(id, req));
  }

  // create() / update() from init-entity stay as-is.
}
```

> **Custom permission actions extend the flat `<module>_<entity>:<action>` namespace.** `init-entity` emitted `create` / `update` / `delete`; this pack adds `view_mine`, `view_team`, `transition`, `export_report_summary`, `import`, etc. Register every new code in the permission matrix (the admin module's `AppPermissionStrategy.load()` source) — until granted, the route denies with 403. `@HasPermission('<module>_<entity>:view_mine')` (colon form on the route) and `SdContext.hasPermission('<module>_<entity>', 'view_mine')` (split form in the service) refer to the SAME code.

> **Route ordering caveat.** A literal segment route (`@Post('mine')`, `@Get('export-report-summary')`) MUST be declared so it does not get shadowed by a param route (`@Get(':id')` from `BaseController`). NestJS matches in declaration order within a controller, but inherited base routes register first — give literal custom routes a distinct prefix segment (`mine`, `team`, `export-report-summary`, `:id/transition`) so they never collide with the base `:id`. The ref app's custom routes all use distinct segments for exactly this reason.

---

## 4. Bulk operations

Bulk write goes through `repo.import(entities, qr?)` (multi-row insert/upsert) for **create**, and `softDelete(ids)` / `delete(ids)` / `restore(ids)` for **bulk lifecycle**. For bulk that also touches OTHER tables atomically, thread a `QueryRunner` (§5). *(Ground: ref app `employee.service.ts` bulk-import loop lines 130-191 — `this.repository.queryRunner` + per-item `createDTO(item, queryRunner)` + `teamEmployeeRepository.create(..., queryRunner)`, collecting per-row `validations`.)*

**Service method** — a bulk endpoint that imports many rows, collecting per-row failures rather than aborting the whole batch:

```ts
export interface I<Entity>Service extends IBaseService<<Entity>, <Entity>DTO> {
  bulkImport: (rows: <Entity>SaveReq[]) => Promise<{ successItems: <Entity>[]; validations: { idx: number; item: <Entity>SaveReq; errorMessage: string }[] }>;
  bulkSoftDelete: (ids: string[]) => Promise<void>;
}

// impl on <Entity>Service:
bulkImport = async (rows: <Entity>SaveReq[]) => {
  const successItems: <Entity>[] = [];
  const validations: { idx: number; item: <Entity>SaveReq; errorMessage: string }[] = [];
  for (const [idx, item] of rows.entries()) {
    // why: mỗi dòng 1 transaction riêng — 1 dòng lỗi không làm rollback cả lô (mirror employee import)
    const qr = this.repository.queryRunner;
    await qr.connect();
    await qr.startTransaction();
    try {
      if (!item.name?.trim()) {
        badRequest('<module>.<entity>.name.required');
      }
      const saved = await this.create({ name: item.name, /* …map fields… */ }, qr);
      await qr.commitTransaction();
      successItems.push(saved);
    } catch (err) {
      await qr.rollbackTransaction();
      validations.push({ idx, item, errorMessage: err?.message ?? 'error' });
    } finally {
      await qr.release();
    }
  }
  return { successItems, validations };
};

bulkSoftDelete = async (ids: string[]) => {
  if (!ids?.length) {
    badRequest('<module>.<entity>.ids.required');
  }
  await this.repository.softDelete(ids);
};
```

> **`import` vs the per-row loop.** `repo.import(entities, qr?)` is the fast path for a homogeneous, pre-validated batch (single multi-row statement). The per-row loop (above) is for imports where each row needs cross-module validation / cross-table writes and you want **partial success** with a per-row error report — that's the ref app's employee-import shape. Pick `import` for "insert N clean rows"; pick the loop when each row is its own small transaction.

**Controller route:**

```ts
@Post('bulk-import')
@HasPermission('<module>_<entity>:import')
async bulkImport(@Body() rows: <Entity>SaveReq[]) {
  return ApiResponse.ok(await this.service.bulkImport(rows));
}
```

---

## 5. Excel export

Build an `exceljs` `Workbook`, write it to a buffer, and have the controller stream the buffer with a `Content-Disposition` header. The **service** returns `{ buffer, fileName }` (it owns the report logic + data access); the **controller** sets the header and `response.send(buffer)`. *(Ground: ref app `task.service.ts` `exportReportSummary` lines 340-491 — three worksheets, `workbook.xlsx.writeBuffer()`, returns `{ buffer, fileName }`; `task.controller.ts` lines 39-45 — `@Get('export-report-summary')` sets `Content-Disposition` + `response.send(buffer)`.)*

> **`exceljs` is an APP dependency, not part of `@sdcorejs/nestjs`.** Add it when first used: `npm i exceljs` (the ref app pins `"exceljs": "^4.4.0"`). Do not assume it is present.

**Service method:**

> Simple profile: replace `SdContext.fullName` with `this.ctx.get('user')?.fullName` (or the equivalent user field from the injected `ContextService`). Also remove the `departmentCode` scope from the `where` clause — no `departmentCode` in single-tenant; filter by other available fields if needed. Inject `@Inject(ContextService)` (from `@sdcorejs/nestjs/core`) in the service constructor. No `SdContext` facade exists in simple.

```ts
import { Workbook, Worksheet, Buffer as ExcelBuffer } from 'exceljs';
import { Between } from 'typeorm';

export interface I<Entity>Service extends IBaseService<<Entity>, <Entity>DTO> {
  exportReport: (fromDate: string, toDate: string) => Promise<{ buffer: ExcelBuffer; fileName: string }>;
}

// impl:
exportReport = async (fromDate: string, toDate: string) => {
  const { departmentCode, fullName } = SdContext;
  if (!fromDate || !toDate) {
    badRequest('<module>.common.date-range.required');
  }
  // why: dùng raw repository.find cho read-side aggregation (base paging không hợp report)
  const rows = await this.repository.repository.find({
    where: { departmentCode, createdAt: Between(new Date(fromDate), new Date(toDate)) },  // [enterprise] — departmentCode scope; omit in simple (single-tenant)
    order: { createdAt: 'DESC' },
  });

  const workbook = new Workbook();
  workbook.creator = fullName;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Report');
  sheet.columns = [
    { header: 'STT', key: 'no', width: 8 },
    { header: 'Code', key: 'code', width: 16 },
    { header: 'Name', key: 'name', width: 40 },
    { header: 'Created', key: 'createdAt', width: 20 },
  ];
  rows.forEach((row, index) => {
    sheet.addRow({
      no: index + 1,
      code: row.code,
      name: row.name,
      createdAt: row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '',
    });
  });
  this.styleHeader(sheet);

  return {
    buffer: await workbook.xlsx.writeBuffer(),
    fileName: `<entity>-report-${fromDate}-${toDate}.xlsx`,
  };
};

// shared header styling helper (private, on the service)
private styleHeader(worksheet: Worksheet) {
  const row = worksheet.getRow(1);
  row.font = { bold: true, color: { argb: 'FFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0070C0' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.commit();
}
```

**Controller route** — `@Res()` opts out of the `ApiResponse` envelope so the raw buffer streams; set the filename header before `send`:

```ts
@Get('export-report')
@HasPermission('<module>_<entity>:export_report_summary')
async exportReport(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string, @Res() response: Response) {
  const { buffer, fileName } = await this.service.exportReport(fromDate, toDate);
  response.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  return response.send(buffer);
}
```

> **Why the controller streams (not the service).** Keeping `response` in the controller preserves the layering — the service stays HTTP-agnostic and unit-testable (returns a buffer + name), the controller owns the transport. `@Res()` means you bypass the framework's auto-`ApiResponse` wrapping, so you MUST `response.send(...)` yourself.

---

## 6. Workflow / state transition

When an entity carries a status (`statusId` + a `statusCategory` enum — e.g. `TODO` / `IN_PROGRESS` / `COMPLETED` / `CANCELLED`), the `transition` method moves it between states with the legal moves guarded. The pattern: load the current DTO, gate on a permission/ownership flag (`transitionable`, see §8), validate the requested target is an **allowed** next status, then `update` the status fields (and any side effects like a finished-timestamp). Illegal moves throw `badRequest('<i18n-code>')`. *(Ground: ref app `task.service.ts` `transition` lines 294-338 — loads `detail`, checks `dto.transitionable` (403 if not), requires `req.toStatusId`, finds the move in `dto.availableTransitions` (`badRequest('crm.task.transition.invalid')` if absent), derives `isFinished` from the target `TaskStatusCategory`, stamps `finishedDate`, persists via `this.update`.)*

```ts
import { ForbiddenException } from '@nestjs/common';
import { <Entity>StatusCategory, <Entity>TransitionReq } from '@shared/<module>';

transition = async (id: string, req: <Entity>TransitionReq) => {
  const dto = await this.detail(id);
  // why: cờ transitionable đã được tính trong mapDTO theo quyền + ownership (§8)
  if (!dto?.transitionable) {
    throw new ForbiddenException();
  }
  if (!req?.toStatusId) {
    badRequest('<module>.<entity>.transition.required');
  }
  // why: chỉ cho phép chuyển sang trạng thái nằm trong danh sách hợp lệ của trạng thái hiện tại
  const allowed = dto.availableTransitions?.some((t) => t.toStatusId === req.toStatusId);
  if (!allowed) {
    badRequest('<module>.<entity>.transition.invalid');
  }
  // Resolve the target status to derive its category + any terminal side-effects.
  const target = await this.statusRepository.repository.findOneByOrFail({ id: req.toStatusId });
  const isFinished = target.category === <Entity>StatusCategory.COMPLETED || target.category === <Entity>StatusCategory.CANCELLED;
  let finishedDate: string | null | undefined = undefined;
  if (!dto.isFinished && isFinished) {
    finishedDate = new Date().toISOString();         // entering a terminal state → stamp finish time
  } else if (dto.isFinished && !isFinished) {
    finishedDate = null;                              // re-opening → clear it
  }
  return await this.update(id, {
    statusId: req.toStatusId,
    statusCategory: target.category,
    isFinished,
    finishedDate,
  });
};
```

The request shape + its Zod schema (append to `base/shared/<module>/<entity>.model.ts` and `schemas/<module>.schema.ts`):

```ts
// base/shared/<module>/<entity>.model.ts
export interface <Entity>TransitionReq {
  toStatusId: string;
}

// src/modules/<module>/schemas/<module>.schema.ts  (append below the existing schemas)
export const <Entity>TransitionSchema = z.object({
  toStatusId: reqStr('<module>.<entity>.transition.required'),
});
```

> The "allowed next states" list (`dto.availableTransitions`) is whatever your domain models it as — the ref app derives it from a workflow definition attached to the task type and filters by `fromStatusId === statusId` in `mapDTO`. For a simpler entity, hard-code the legal transition map (e.g. `TODO → IN_PROGRESS → COMPLETED`, `* → CANCELLED`) and check membership. The invariant is the same: **never persist a status the current state does not permit** — guard it with `badRequest` so the failure is a localized 400, not a silent bad write.

---

## 7. Domain errors

Reject invalid domain state with `badRequest('<i18n-code>', params?)` from `src/common/errors` — it throws a `BadRequestException` wrapping the lib `apiError(code, message, data?)` envelope. The i18n exception filter recognizes the envelope and localizes `message` from the `code` (bilingual VI/EN) using the request language; `data` supplies `{var}` placeholders in the message. *(Ground: ref app `src/common/errors.ts` + every `badRequest('crm.…')` call in `task.service.ts`, e.g. `badRequest('crm.common.assignee.not-found', { assigneeId })`.)*

```ts
import { badRequest } from 'src/common/errors';

if (!team) {
  badRequest('<module>.common.team.not-found', { teamId });        // → 400 { code, message (localized), data: { teamId } }
}
if (!team.isActive) {
  badRequest('<module>.common.team.invalid-status', { team: team.name });
}
```

> **Conventions:** code namespace is `<module>.<entity>.<field>.<rule>` (validation) or `<module>.<entity>.<concern>` (business rule) — same shape `init-entity`'s Zod messages use, so FE + i18n catalog stay consistent. `badRequest` is typed `: never` (it always throws) so TS narrows control flow after a guard. Register every code in the module's i18n catalog; an unregistered code returns the raw code string as the message (still meaningful, but not localized). For a hard authorization failure (caller may not perform the action at all) throw `new ForbiddenException()` (403) instead — the transition/update guards in the ref app do this for ownership failures.

---

## 8. Permission-gated DTO fields

Extend the entity's `mapDTO` to compute capability flags — `editable` / `deletable` / `restorable` / `transitionable` — from `SdContext.hasPermission('<module>_<entity>', '<action>')` (optionally OR'd with ownership / role checks). The portal reads these flags to show/hide row actions, so a user only sees buttons they can actually use, and the matching write route re-checks server-side. *(Ground: ref app `task.service.ts` `mapDTO` lines 506-577 — `transitionable: hasPermission('crm_task', 'update') || isTeamLeader || assigneeId === userId`, `editable: ... || assigneeId === createdBy`, `deletable: !isFinished && (hasPermission('crm_task', 'delete') || ...)`. Note: the `isTeamLeader` check in the ground ref is an `[enterprise]`-only role — depends on `departmentCode` scoping; omit in the simple profile.)*

> Simple profile: replace `SdContext.hasPermission(...)` with `this.ctx.hasPermission('<module>_<entity>:<action>')` from the injected lib `ContextService`. Inject `@Inject(ContextService)` (from `@sdcorejs/nestjs/core`) in the service constructor. No `SdContext` facade exists in simple.

```ts
mapDTO = (entity: <Entity> | undefined | null): <Entity>DTO | undefined | null => {
  if (!entity) {
    return undefined;
  }
  const { hasPermission, userId } = SdContext;
  const { id, tenantCode, departmentCode, code, name, statusId, statusCategory, isFinished, assigneeId, createdBy, createdAt } = entity;
  return {
    id,
    tenantCode,
    departmentCode,
    code,
    name,
    statusId,
    statusCategory,
    isFinished,
    createdAt,
    // why: cờ năng lực — quyền HOẶC ownership; FE ẩn/hiện nút, route ghi vẫn check lại
    editable: hasPermission('<module>_<entity>', 'update') || assigneeId === userId || assigneeId === createdBy,
    transitionable: hasPermission('<module>_<entity>', 'transition') || assigneeId === userId,
    // chỉ cho xóa khi chưa kết thúc
    deletable: !isFinished && (hasPermission('<module>_<entity>', 'delete') || assigneeId === createdBy),
    restorable: hasPermission('<module>_<entity>', 'delete'),
  };
};
```

> **The flag is advisory for the UI, authoritative on the server only when re-checked.** `mapDTO` flags tell the portal what to render; they do NOT secure the action. The actual write route must independently gate — either the route's `@HasPermission(...)` (for a flat permission) or a guard inside the service (the ref app's `transition` / `updateDTO` re-load the DTO and `throw new ForbiddenException()` when `!dto.transitionable` / `!dto.editable`). Compute the flag once in `mapDTO`, enforce it again at the write boundary.

---

## 9. Explicit transactions

When one operation writes to **multiple rows/tables and they must all succeed or all roll back**, thread a single `QueryRunner` through each write so they share one DB transaction. Every `BaseService` / `BaseRepository` write method takes a trailing optional `qr?: QueryRunner`. Get a fresh runner from the repository accessor (`this.repository.queryRunner`), then `connect` → `startTransaction` → writes → `commitTransaction`, with `rollbackTransaction` in `catch` and `release` in `finally`. *(Ground: ref app `reference-data.service.ts` lines 97-115 (the canonical connect/start/commit/rollback/release shape, passing `queryRunner` to each `this.repository.update(..., queryRunner)`) + `employee.service.ts` lines 130-189 (the same threaded through `createDTO(item, queryRunner)` + `teamEmployeeRepository.create(..., queryRunner)` + `this.update(..., queryRunner)`).)*

```ts
import { QueryRunner } from 'typeorm';

/**
 * Atomic multi-write: persist this <entity> AND its related rows in ONE transaction.
 * If any write throws, the whole unit rolls back. The qr is threaded into every write.
 */
reorderAll = async (ids: string[]) => {
  // why: 1 QueryRunner cho cả lô — tất cả update chung 1 transaction, lỗi 1 cái rollback hết
  const queryRunner = this.repository.queryRunner;   // fresh, un-connected runner from the data source
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    for (const [idx, id] of ids.entries()) {
      await this.repository.update({ id, sortOrder: idx }, queryRunner);   // qr threaded → same tx
    }
    await queryRunner.commitTransaction();
    return await this.repository.all();
  } catch (err) {
    await queryRunner.rollbackTransaction();           // any failure → roll the whole unit back
    throw err;                                         // re-throw so the caller / filter sees it
  } finally {
    await queryRunner.release();                        // ALWAYS release (success or failure)
  }
};
```

When the cross-table writes go through **another module's service**, that service's write method must also accept `qr?` and you pass the same runner (the ref app's employee import passes one `queryRunner` into `createDTO`, `teamEmployeeRepository.create`, AND `userService.internalCreate`-derived updates so the user/employee/team-membership rows commit together):

```ts
const qr = this.repository.queryRunner;
await qr.connect();
await qr.startTransaction();
try {
  const saved = await this.create(req, qr);                       // this entity
  await this.otherService.internalAttach(saved.id, req.refId, qr); // a related row in ANOTHER module — same tx
  await qr.commitTransaction();
  return saved;
} catch (err) {
  await qr.rollbackTransaction();
  throw err;
} finally {
  await qr.release();
}
```

> **Rules:** ONE runner per logical transaction; `connect()` before `startTransaction()`; `release()` in `finally` ALWAYS (a leaked runner exhausts the pool); re-throw in `catch` (or convert to `badRequest`) — never swallow. For a single-write method you do NOT need a runner — `BaseRepository` already wraps each lone write; explicit transactions are only for **multi-write atomicity**. The two-pattern split mirrors the ref app: `reference-data` keeps one transaction around the whole reorder loop (all-or-nothing); `employee` import opens one transaction PER row (partial success with a per-row error report — §4). Choose all-or-nothing vs per-row based on whether a single bad row should abort the batch.

---

## Expected changes (after an `actions` pass)

```
src/modules/<module>/
├── services/<entity>.service.ts        # + interface signatures + impl methods (mine/transition/export/bulk/atomic) + cross-module @Inject
├── controllers/<entity>.controller.ts  # + custom routes (@Post('mine'), @Put(':id/transition'), @Get('export-...'), @Post('bulk-...'))
├── schemas/<module>.schema.ts          # + <Entity>TransitionSchema (and any other body schemas)
└── <module>.module.ts                  # + cross-module imports (AdminModule / MasterdataModule) if newly needed

base/shared/<module>/
└── <entity>.model.ts                   # + <Entity>TransitionReq (and any custom request shapes) + new capability flags on <Entity>DTO

package.json                            # + "exceljs": "^4.4.0"  (only if an Excel export was added)
```

No new files are usually created — this pack **edits the existing entity stack in place**. Barrels are unchanged (the service/controller/schema files already export their symbols).

---

## Verification checklist

- New service methods are declared on `I<Entity>Service` AND implemented on `<Entity>Service` (interface = the DI port; signatures match).
- Cross-module deps: each `@Inject(IOtherService)` has its providing module in `<module>.module.ts` `imports`; no DI cycle.
- Custom routes carry `@HasPermission('<module>_<entity>:<action>')`; body routes also carry `@UseGuards(ZodValidationGuard(<Schema>))`; non-stream routes return `ApiResponse.ok(...)`.
- Literal route segments (`mine`, `team`, `export-...`, `:id/transition`) don't collide with the inherited base `:id`.
- Excel: service returns `{ buffer, fileName }`; controller uses `@Res()`, sets `Content-Disposition`, `response.send(buffer)`; `exceljs` is in `package.json`.
- Workflow: `transition` loads the DTO, gates on the capability flag (403 via `ForbiddenException`), validates the target is allowed (`badRequest` otherwise), persists status + side-effects via `this.update`.
- Transactions: every multi-write uses ONE `QueryRunner` with `connect → startTransaction → … → commit`, `rollback` in `catch`, `release` in `finally`; `qr` threaded into every write call; single writes use no runner.
- Domain errors use `badRequest('<module>.<entity>.<...>', params?)`; codes registered in the i18n catalog.
- `mapDTO` capability flags (`editable` / `deletable` / `transitionable` / `restorable`) are computed from `SdContext.hasPermission(...)` (± ownership) AND re-enforced at the write boundary.
- New permission codes (`view_mine`, `transition`, `import`, `export_report_summary`, …) registered in the permission matrix.
- `npm run build` (nest build) typechecks the extended stack.

---

## Example input

```text
Thêm action cho entity `task` (module `crm`):
- "Việc của tôi" → POST /crm/task/mine (perm crm_task:view_mine), paging scope theo người tạo/assignee.
- Chuyển trạng thái → PUT /crm/task/:id/transition (perm crm_task:transition), chỉ leader/assignee, chặn chuyển trạng thái không hợp lệ.
- Xuất Excel báo cáo → GET /crm/task/export-report-summary (perm crm_task:export_report_summary).
- mapDTO: editable/transitionable/deletable theo quyền + ownership.
Cross-module: IUserService (AdminModule), IEmployeeService/ITeamService (MasterdataModule).
```
