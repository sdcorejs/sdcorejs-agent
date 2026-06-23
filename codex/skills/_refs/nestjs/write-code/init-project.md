> **Reference for the `sdcorejs-nestjs` orchestrator.** Loaded on demand when the
> confirmed plan includes scaffolding a brand-new NestJS backend repo. Not a standalone
> skill — the orchestrator reads this file when its dispatch table routes a step here.

# Init Project — NestJS Modular-Monolith Scaffold (`@sdcorejs/nestjs`)

## Contents

- Purpose / when to use
- Critical write-target rule
- Persona Step 0
- Source of truth - core package
- Input resolution and profile
- Project structure and package setup
- Core module, auth, validation, and i18n wiring
- Database, schemas, migrations, and Docker readiness
- Verification and post-init summary

## Purpose / when to use

Scaffold a **fresh modular-monolith backend** that consumes `@sdcorejs/nestjs`: one NestJS app, one Postgres database, **schema-per-module**, request-context + tenancy + audit + permission + JWT wired through `SdCoreModule.forRoot`. This is the FIRST backend codegen step — run it **before** `init-module` and `init-entity`.

Use when the plan asks to:

- "Khởi tạo backend / tạo dự án NestJS mới" / "scaffold a new backend"
- "Bootstrap a modular-monolith API on `@sdcorejs/nestjs`"
- "Set up the NestJS project skeleton" (before any module/entity)

**Output:** a runnable app skeleton (no domain modules yet) — `npm install` then `npm run start:dev` boots on `:3000`. `init-module` appends the first domain module afterwards.

### Critical write-target rule

**All generated files are written to the TARGET backend project**, NEVER into this agent repo (`sdcorejs-agent`). The templates below are the source of truth; render them into the user's chosen project directory.

### Persona Step 0 (non-tech mode)

If the persona is **non-technical**, open with plain language before generating, e.g.:

> "I'll set up the foundation of your backend: one app, one database, and the plumbing for logins, permissions, and keeping each business area's data separate. After this we'll add your first feature module."

Then ask only the blocking inputs (see *Input resolution*) in plain terms. For a technical persona, skip the narration.

---

## Source of truth — core package

Templates use two placeholders wherever the core package appears:

| Placeholder | Resolved from `_refs/nestjs/core-catalog.md` |
|---|---|
| `<CORE_PACKAGE_NAME>` | package name — `@sdcorejs/nestjs` |
| `<CORE_VERSION>` | version pin — see catalog "Version pin" (`^1.0.0` today) |

Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) BEFORE generating — it is the authoritative export inventory + import sub-paths. **Every import in the templates below MUST match a sub-path that catalog documents** (`@sdcorejs/nestjs`, `/core`, `/auth`, `/services`, `/validation`, `/queue`, `/i18n`, `/features`). Do not invent imports.

---

## Input resolution

Before generating, confirm:

0. **Profile** (required) — `simple` (default) | `enterprise`. Read from `.sdcorejs/summary.md`.
1. **Project name** (required) — e.g. `acme-api`, `hr-backend`. Used as `package.json` `name`. Placeholder below: `<app-name>`.
2. **Module schemas** (required) — the list of per-module Postgres schemas to pre-create (e.g. `admin`, `masterdata`, `crm`). At minimum the first domain module's schema. Placeholder: the `MODULE_SCHEMAS` array. (`init-module` adds more later.)
3. **Multi-tenant?** (optional, default yes) — if single-tenant, the tenancy strategy still ships but `getCurrentScope()` can return `{}` (no scope filter). See catalog "Defaults when a strategy is omitted". (Enterprise only — simple profile is always single-tenant.)
4. **Keycloak issuer URL** (optional for scaffold — env-driven; can be left blank in `.env` until `sdcorejs-auth` wires it).

> **Port** is fixed at `3000` (env-overridable via `PORT`). Do not ask.

---

## Profile (read FIRST)

Read `profile` from `<target>/.sdcorejs/summary.md` (set at clarify; default `simple`).
Templates below split into **Profile: simple** (single-tenant, flat permissions, no
`base/shared`, no internal-secret, lib `WithAudit`) and **Profile: enterprise** (the
full multi-tenant + department-scoped + page-permission-matrix + `@shared` monorepo +
internal-secret shape). Emit ONLY the chosen profile's templates. `enterprise` output is
unchanged from prior versions of this pack.

---

## Generation steps

> Render exclusion: never write `.claude`, `.git`, `.github`, `node_modules`, `dist` into the target. The pack templates below are the only files to emit (plus `nest-cli.json`, `.gitignore`, `.prettierrc` if not present).

### Step 1 — `package.json`

*Grounded on the ref app `enterprise-platform/package.json`.* Scripts and deps trimmed to a generic fresh app (domain extras like keycloak-admin, exceljs, schedule removed — re-add per module need).

The `package.json` body (scripts, dependencies, devDependencies) is identical for both profiles. Only the `jest.moduleNameMapper` block differs:

**Profile: simple** — use a single src alias (no `@shared`/`@app` path aliases):

```json
"moduleNameMapper": {
  "^src/(.*)$": "<rootDir>/$1"
}
```

**Profile: enterprise** — keep the full alias set:

```json
"moduleNameMapper": {
  "^@shared$": "<rootDir>/../base/shared",
  "^@shared/(.*)$": "<rootDir>/../base/shared/$1",
  "^@app/(.*)$": "<rootDir>/$1"
}
```

The full `package.json` template (enterprise shape shown — swap `moduleNameMapper` per profile above):

```json
{
  "name": "<app-name>",
  "version": "0.0.1",
  "description": "Modular monolith backend on @sdcorejs/nestjs",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "typeorm": "typeorm-ts-node-commonjs -d src/data-source.ts",
    "migration:generate": "npm run typeorm migration:generate",
    "migration:run": "npm run typeorm migration:run"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/passport": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@sdcorejs/nestjs": "<CORE_VERSION>",
    "@sdcorejs/utils": "^1.1.4",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.3",
    "jwks-rsa": "^3.2.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.16.3",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.20",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/jest": "^29.5.2",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^4.0.1",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.6.0"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "moduleNameMapper": {
      "^@shared$": "<rootDir>/../base/shared",
      "^@shared/(.*)$": "<rootDir>/../base/shared/$1",
      "^@app/(.*)$": "<rootDir>/$1"
    },
    "testEnvironment": "node"
  }
}
```

> **Dependency note — `@sdcorejs/nestjs` source.** Use the published npm dependency `"@sdcorejs/nestjs": "<CORE_VERSION>"` (currently `^1.0.0`) for fresh scaffolds. Only use a vendored `.tgz` when the target environment explicitly requires offline/private-registry installation; if so, drop the package under `vendor/` and change the dependency line to `"file:vendor/sdcorejs-nestjs-<CORE_VERSION>.tgz"`. Keep `@sdcorejs/utils` as a direct npm dependency unless the target has the same offline constraint; do not rely on the transitive copy bundled by `@sdcorejs/nestjs`.

Also emit `nest-cli.json` (ground: ref app):

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [{ "include": "**/*.json", "outDir": "./dist" }]
  }
}
```

### Step 2 — `tsconfig.json`

*Grounded on the ref app `tsconfig.json`.* NestJS 11 settings + path aliases.

The compiler options (`module`, `target`, `decorators`, etc.) are identical for both profiles. Only the `paths` block differs:

**Profile: simple** — single src alias only (no `@shared`/`@app`):

```json
"paths": {
  "src/*": ["./src/*"]
}
```

**Profile: enterprise** — keep the full alias set (unchanged):

```json
"paths": {
  "@shared": ["./base/shared"],
  "@shared/*": ["./base/shared/*"],
  "@app/*": ["./src/*"]
}
```

The full `tsconfig.json` template (enterprise shape shown — swap `paths` per profile above):

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@shared": ["./base/shared"],
      "@shared/*": ["./base/shared/*"],
      "@app/*": ["./src/*"]
    }
  }
}
```

> **Profile: enterprise:** `@shared` → `./base/shared` (re-exportable kernel models — Step 7); `@app/*` → `./src/*` (app code). `emitDecoratorMetadata` + `experimentalDecorators` are mandatory for TypeORM + Nest decorators.

### Step 3 — `src/main.ts`

*Grounded on the ref app `src/main.ts`.* Pre-creates Postgres schemas, then bootstraps.

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { Client } from 'pg';
import { AppModule } from './app.module';

/**
 * Per-module Postgres schemas (schema-per-module): ONE database, N schemas.
 * `core` (set on the TypeORM connection, Step 5) holds the lib's shared tables;
 * each domain module owns a schema here. Add an entry per module schema you create.
 */
const MODULE_SCHEMAS = ['core', '<module>'];

/**
 * TypeORM `synchronize` creates TABLES but NEVER the SCHEMA they live in, so the first dev boot
 * against a fresh database fails with `schema "<x>" does not exist`. Create every per-module schema
 * up front (idempotent — `IF NOT EXISTS`) with a one-off `pg` connection before the DataSource initializes.
 */
async function ensureSchemas() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || '<app-name>',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  await client.connect();
  try {
    for (const schema of MODULE_SCHEMAS) {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    }
  } finally {
    await client.end();
  }
}

async function bootstrap() {
  await ensureSchemas();
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({ origin: '*', credentials: true, exposedHeaders: ['Content-Disposition'] });
  await app.listen(Number(process.env.PORT) || 3000);
}
bootstrap();
```

> Why a one-off `pg` client (not the Nest DataSource): TypeORM's `synchronize` and migrations both assume the target schema already exists — neither issues `CREATE SCHEMA`. `ensureSchemas()` runs before the app's DataSource initializes so the very first boot succeeds. Tighten `origin: '*'` to your portal origins for production.

### Step 4 — `src/app.configuration.ts`

*Grounded on the ref app `src/app.configuration.ts`* (domain blocks stripped; generic env factory).

```ts
/** Centralized env-backed configuration. Values are wired from ENV (provided per environment). */
export const CONFIGURATION = () => ({
  port: Number(process.env.PORT) || 3000,
  environment: process.env.ENVIRONMENT || 'dev',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || '<app-name>',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    // dev: true (TypeORM auto-creates tables). prod: false + run migrations (Step 8).
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  },
  keycloak: {
    url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.KEYCLOAK_REALM || 'dev',
    // Issuer the lib JWT strategy validates tokens against (JWKS at `${issuer}/protocol/openid-connect/certs`).
    issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/dev',
  },
});

export type AppConfiguration = ReturnType<typeof CONFIGURATION>;
```

### Step 5 — `src/app.module.ts`

*Grounded on the ref app `src/app.module.ts`.* The ref app wires most kernel concerns through the consolidated `SdCoreModule.forRoot`: context, cache, i18n, permission, internal secret, tenancy, uploaded files, action history, and job scheduler. It registers JWT separately only because the custom strategy imports `AdminModule`. For a fresh scaffold, prefer `SdCoreModule.forRoot` for the kernel and use a separate `JwtModule.forRoot(..., { strategy, imports: [AdminModule] })` only when that strategy needs app-module providers.

**Profile: simple**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SdCoreModule } from '@sdcorejs/nestjs';

import { CONFIGURATION, AppConfiguration } from './app.configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [CONFIGURATION], cache: true, isGlobal: true }),
    SdCoreModule.forRoot({
      context: { headers: { userId: 'x-user-id', lang: ['accept-language', 'x-language'] } },
      i18n: { fallbackLanguage: 'vi' },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const database = config.get<AppConfiguration['database']>('database')!;
        return {
          type: 'postgres', host: database.host, port: database.port,
          database: database.database, username: database.username, password: database.password,
          schema: 'core', autoLoadEntities: true, synchronize: database.synchronize,
        };
      },
      inject: [ConfigService],
    }),
    RouterModule.register([]),
  ],
})
export class AppModule {}
```

> The `permission` strategy + the JWT wiring are added by `init-admin` (it registers `AppPermissionStrategy` and a separate `JwtModule.forRoot(..., { strategy: JwtStrategy, imports: [AdminModule] })`). The simple `SdCoreModule.forRoot` here wires only `context` + `i18n`.

**Profile: enterprise**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContextService } from '@sdcorejs/nestjs/core';
import { SdCoreModule } from '@sdcorejs/nestjs';

import { CONFIGURATION, AppConfiguration } from './app.configuration';
import { AdminAuthGuard } from './common/admin-auth.guard';
import { AppAuditStrategy } from './common/app-audit.strategy';
import { AppPermissionStrategy } from './common/admin-permission.strategy';
import { AppTenancyStrategy } from './common/core/app-tenancy.strategy';
import { bindSdContext } from './common/core/sd-context';
import { InternalSecretModule } from './common/internal-secret';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [CONFIGURATION], cache: true, isGlobal: true }),

    // ---- Internal-call auth: @Global() binding for INTERNAL_SECRET_PROVIDER (env INTERNAL_SECRET_KEY)
    //      so the lib InternalGuard can guard @UseGuards(InternalGuard) routes. ----
    InternalSecretModule,

    // ---- Shared kernel from @sdcorejs/nestjs (one call wires context+tenancy+audit+permission+i18n).
    //      JWT is added by init-admin via JwtModule.forRoot(..., { strategy, imports }). ----
    SdCoreModule.forRoot({
      context: {
        headers: {
          userId: 'x-user-id',
          lang: ['accept-language', 'x-language'],
          customHeaders: {
            tenantCode: 'x-tenant-code',
            departmentCode: 'x-department-code',
            internalSecret: 'x-internal-secret',
          },
        },
      },
      tenancy: { strategy: AppTenancyStrategy },
      audit: { strategy: AppAuditStrategy },
      permission: { strategy: AppPermissionStrategy },
      i18n: { fallbackLanguage: 'vi' },
    }),

    // ---- Database: 1 Postgres, schema-per-module. Connection default schema = `core` (lib shared tables);
    //      each domain entity sets its own `{ schema: '<module>' }` on @Entity. Entities auto-load. ----
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const database = config.get<AppConfiguration['database']>('database')!;
        return {
          type: 'postgres',
          host: database.host,
          port: database.port,
          database: database.database,
          username: database.username,
          password: database.password,
          schema: 'core',
          autoLoadEntities: true,
          synchronize: database.synchronize,
        };
      },
      inject: [ConfigService],
    }),

    // ---- Route prefix per module (avoids cross-module path collisions). init-module appends entries here:
    //      e.g. RouterModule.register([{ path: '<module>', module: <Module>Module }]). ----
    RouterModule.register([]),
  ],
  providers: [
    // Domain auth guard (JWT + permission). Registered so @UseGuards(AdminAuthGuard) resolves its deps.
    AdminAuthGuard,
    // Bind the lib ContextService singleton into the static SdContext facade at bootstrap.
    {
      provide: 'SD_CONTEXT_BINDING',
      useFactory: (ctx: ContextService) => {
        bindSdContext(ctx);
        return true;
      },
      inject: [ContextService],
    },
  ],
})
export class AppModule {}
```

> `RouterModule.register([])` ships **empty** — `init-module` appends `{ path: '<module>', module: <Module>Module }` per module so every controller serves under its module prefix (e.g. `/<module>/...`). `autoLoadEntities: true` means new entities register automatically once their module imports `TypeOrmModule.forFeature([...])`.

### Step 6 — `src/common/`

The app-specific glue: base entity, strategies, context facade, auth guard, and internal-secret provider. *All grounded on the ref app `src/common/**`.*

**Profile: simple**

Emit ONLY these files. NO `sd-context.ts` facade, NO `tenancy/`, NO `app-audit.strategy.ts`, NO `admin-*` files, NO `internal-secret/`, NO `src/core/modules/auth/`.

**`src/common/base-entity.ts`**

```ts
import { BaseEntity as CoreBaseEntity, WithAudit } from '@sdcorejs/nestjs/core';
/** App base entity: lib audit/timestamps + uuid id. Domain entities extend this. */
export abstract class BaseEntity extends WithAudit(CoreBaseEntity) {}
```

**`src/common/errors.ts`** — profile-independent helper (identical to enterprise):

```ts
import { BadRequestException } from '@nestjs/common';
import { apiError } from '@sdcorejs/nestjs/core';

/**
 * Throw a code-based 400 error. `code` is an i18n key (e.g. `crm.task.name.required`); the lib
 * `I18nExceptionFilter` recognizes the `apiError(code, message, data?)` envelope, localizes the
 * `message` via the registered resolver using the request language, and returns the `{ error }`
 * envelope carrying both `code` and the resolved `message`. `data` supplies `{var}` placeholders.
 * Typed `: never` so TS narrows control flow after a guard. The default message is `code` so the
 * response stays meaningful even with no i18n layer wired.
 */
export function badRequest(code: string, data?: Record<string, unknown>): never {
  throw new BadRequestException(apiError(code, code, data));
}
```

**`src/common/dto.ts`**

```ts
/** Base DTO every entity DTO extends (simple profile). Matches the BaseService DTO contract. */
export interface Dto {
  id: string;
  editable?: boolean;
  deletable?: boolean;
  restorable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

> **Permission + JWT strategy are emitted by `init-admin`, not here.** The always-on admin module (`_refs/nestjs/write-code/init-admin.md`, run right after `init-project`) emits `AppPermissionStrategy` (app-DB role→permission codes) + the user-lookup `JwtStrategy` (resolves the app user from the token `sub`). `init-project` therefore emits NO permission/JWT strategy in the simple profile.

---

**Profile: enterprise**

The app-specific glue: base entity, the three strategies (tenancy / audit / permission), the static context facade, the auth guard, and the internal-secret provider. *All grounded on the ref app `src/common/**`.*

**`src/common/base-entity.ts`** — the ref app keeps a **LOCAL** base entity rather than extending the lib's `WithAudit(BaseEntity)`, because its live Postgres schema names audit columns differently (`modifiedAt` not `updatedAt`) and carries extra columns. For a **fresh** app with no legacy schema, prefer the lib mixin directly (catalog ORM section):

```ts
// Fresh app — reuse the lib audit mixin (createdAt/updatedAt/deletedAt + createdBy/modifiedBy + creator/modifier).
import { BaseEntity as CoreBaseEntity, WithAudit } from '@sdcorejs/nestjs/core';

/** App base entity: lib audit/timestamps + uuid id. Domain entities extend this. */
export abstract class BaseEntity extends WithAudit(CoreBaseEntity) {}
```

> If you are migrating an existing database whose audit columns differ from the lib's, follow the ref-app pattern instead: a hand-written `BaseEntity extends TypeOrmBaseEntity` declaring the exact legacy columns (`modifiedAt`, `deletor`, …). The lib's `BaseRepository`/`BaseService`/`BaseController` are column-name-agnostic, so they operate on either base unchanged. Document the choice.

**`src/common/errors.ts`** — the app-local domain-error helper. `badRequest(code, data?)` throws a code-based 400 wrapping the lib `apiError(code, message, data?)` envelope; the lib `I18nExceptionFilter` recognizes the envelope and localizes `message` from `code` (bilingual) using the request language, with `data` supplying `{var}` placeholders. The default message is set to `code` so the response stays meaningful even with no i18n layer. This is what `actions.md` depends on for domain validation. *(Ground: ref app `src/common/errors.ts`.)*

```ts
import { BadRequestException } from '@nestjs/common';
import { apiError } from '@sdcorejs/nestjs/core';

/**
 * Throw a code-based 400 error. `code` is an i18n key (e.g. `crm.task.name.required`); the lib
 * `I18nExceptionFilter` recognizes the `apiError(code, message, data?)` envelope, localizes the
 * `message` via the registered resolver using the request language, and returns the `{ error }`
 * envelope carrying both `code` and the resolved `message`. `data` supplies `{var}` placeholders.
 * Typed `: never` so TS narrows control flow after a guard. The default message is `code` so the
 * response stays meaningful even with no i18n layer wired.
 */
export function badRequest(code: string, data?: Record<string, unknown>): never {
  throw new BadRequestException(apiError(code, code, data));
}
```

**`src/common/core/app-tenancy.strategy.ts`** — `implements ITenancyStrategy` (catalog tenancy section). Keys MUST match the entity column names the lib filters on (`@Scoped`/`@TenantScoped` columns).

```ts
import { Injectable } from '@nestjs/common';
import type { ITenancyStrategy } from '@sdcorejs/nestjs/core';
import { SdContext } from '@app/common/core/sd-context';

/**
 * Visibility policy: master realm + internal-secret calls see everything (bypass). Tenant admins see
 * their whole tenant. Regular users see only their own department. For a single-tenant app return {}.
 */
@Injectable()
export class AppTenancyStrategy implements ITenancyStrategy {
  shouldBypass(): boolean {
    return SdContext.isMaster || !!SdContext.internalSecret;
  }

  getCurrentScope(): Record<string, unknown> {
    const tenantCode = SdContext.tenantCode;
    if (SdContext.isTenantAdmin) return { tenantCode };
    return { tenantCode, departmentCode: SdContext.departmentCode };
  }
}
```

**`src/common/app-audit.strategy.ts`** — `implements IAuditStrategy` (catalog audit section). Stamps actor columns on write.

```ts
import { Injectable } from '@nestjs/common';
import type { IAuditStrategy } from '@sdcorejs/nestjs/core';
import { SdContext } from '@app/common/core/sd-context';

/** Fills audit actor columns from request context on each write. */
@Injectable()
export class AppAuditStrategy implements IAuditStrategy {
  onCreate(entity: any): void {
    entity.createdBy = SdContext.userId;
  }
  onUpdate(entity: any): void {
    entity.modifiedBy = SdContext.userId;
  }
  onSoftDelete(_entity: any): void {
    /* record deletor if your base entity carries one */
  }
}
```

**`src/common/admin-permission.strategy.ts`** — `implements IPermissionStrategy` (catalog permission section). `load()` flattens a `{ [model]: { [action]: boolean } }` matrix into flat `"<model>:<action>"` codes the lib `AuthGuard` / `SdContext.hasPermission` check by membership.

```ts
import { Injectable } from '@nestjs/common';
import type { IPermissionStrategy } from '@sdcorejs/nestjs/auth';
import { SdContext } from '@app/common/core/sd-context';

/**
 * Bridges a page-permission matrix into the lib's flat permission-code model. Each granted cell
 * becomes a `"<model>:<action>"` code. Replace `loadMatrix()` with your real source (DB / admin module).
 */
@Injectable()
export class AppPermissionStrategy implements IPermissionStrategy {
  async load(): Promise<string[]> {
    const matrix = await this.loadMatrix();
    const codes: string[] = [];
    for (const [model, actions] of Object.entries(matrix ?? {})) {
      for (const [action, allowed] of Object.entries(actions ?? {})) {
        if (allowed) codes.push(`${model}:${action}`);
      }
    }
    return codes;
  }

  /** Stub: scaffold returns no codes (deny). init-module / admin wires the real matrix source. */
  private async loadMatrix(): Promise<Record<string, Record<string, boolean>>> {
    void SdContext.userId; // matrix is usually resolved per-user
    return {};
  }
}
```

**`src/common/core/sd-context.ts`** — static facade over the lib `ContextService` (AsyncLocalStorage) so domain code reads context without injecting the service everywhere. Bound once at bootstrap (Step 5 `SD_CONTEXT_BINDING`).

```ts
import type { ContextService } from '@sdcorejs/nestjs/core';

/**
 * `SdContext` — static facade over the lib `ContextService`. Framework fields (userId, lang, permissions)
 * come from the ALS store; domain fields (tenantCode, departmentCode, internalSecret) arrive via the
 * SdCoreModule context `customHeaders` → `store.custom`. The lib singleton is bound once at bootstrap via
 * {@link bindSdContext}. Permissions are flat `"<model>:<action>"` codes set by the permission strategy.
 */
let _ctx: ContextService | undefined;

export const bindSdContext = (ctx: ContextService): void => {
  _ctx = ctx;
};

const custom = <T = string>(key: string): T | undefined => _ctx?.store?.custom?.[key] as T | undefined;

export class SdContext {
  static get userId(): string | undefined {
    return _ctx?.get('userId');
  }
  static get tenantCode(): string | undefined {
    return custom('tenantCode');
  }
  static get departmentCode(): string | undefined {
    return custom('departmentCode');
  }
  // why: full display name of the current actor — user claim first (JwtStrategy.validate), then the
  //      `fullName` custom header (SdCoreModule context customHeaders → store.custom). Used e.g. by Excel export.
  static get fullName(): string | undefined {
    return (_ctx?.get('user') as any)?.fullName || custom('fullName');
  }
  static get internalSecret(): string | undefined {
    return custom('internalSecret');
  }
  static get lang(): 'en' | 'vi' {
    const raw = _ctx?.get('lang') ?? 'vi';
    return raw.toLowerCase().startsWith('en') ? 'en' : 'vi';
  }
  static get permissions(): string[] {
    return _ctx?.permissions ?? [];
  }
  // App scope flags — derive from your user claims (see JwtStrategy.validate, Step 7).
  static get isMaster(): boolean {
    return (_ctx?.get('user') as any)?.scope === 'MASTER';
  }
  static get isTenantAdmin(): boolean {
    return (_ctx?.get('user') as any)?.scope === 'TENANT_ADMIN';
  }
  static hasPermission(model: string, action: string): boolean {
    return (_ctx?.permissions ?? []).includes(`${model}:${action}`);
  }
}
```

**`src/common/core/index.ts`** — barrel so consumers import from the folder (`from 'src/common/core'`) rather than the file. `actions.md` imports `SdContext` from `src/common/core`.

```ts
// src/common/core/index.ts
export * from './sd-context';
```

**`src/common/admin-auth.guard.ts`** — wraps the passport JWT guard + lib permission primitives. Differs from the bare lib `AuthGuard` in that it loads permission codes into context on **every** authenticated request (so `SdContext.hasPermission` works inside services/`mapDTO` on undecorated routes too).

```ts
import { type ExecutionContext, ForbiddenException, Inject, Injectable, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ContextService } from '@sdcorejs/nestjs/core';
import { apiError } from '@sdcorejs/nestjs/core';
import { type IPermissionStrategy, PERMISSION_METADATA_KEY, PERMISSION_STRATEGY } from '@sdcorejs/nestjs/auth';

interface RequestWithPermissions {
  permissions?: string[];
  user?: unknown;
}

/** JWT + permission guard on lib primitives. Loads permissions on every request so SdContext.hasPermission works everywhere. */
@Injectable()
export class AdminAuthGuard extends PassportAuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    @Inject(PERMISSION_STRATEGY) private readonly strategy: IPermissionStrategy,
    @Optional() @Inject(ContextService) private readonly contextService?: ContextService,
  ) {
    super();
  }

  async canActivate(execCtx: ExecutionContext): Promise<boolean> {
    const authed = (await super.canActivate(execCtx)) as boolean;
    if (!authed) return false;

    const req = execCtx.switchToHttp().getRequest<RequestWithPermissions>();
    if (req.user !== undefined) this.contextService?.set('user', req.user);

    if (!req.permissions) {
      req.permissions = await this.strategy.load(this.contextService?.store ?? ({} as never));
    }
    this.contextService?.set('permissions', req.permissions);

    const required = this.reflector.getAllAndOverride<string[] | undefined>(PERMISSION_METADATA_KEY, [
      execCtx.getHandler(),
      execCtx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const codes = req.permissions ?? [];
    if (!required.some((r) => codes.includes(r))) {
      throw new ForbiddenException(
        apiError('core.permission.forbidden', 'You do not have permission to perform this action', { required }),
      );
    }
    return true;
  }
}
```

**`src/common/internal-secret/`** — service-to-service auth provider. `env-internal-secret.provider.ts` + `internal-secret.module.ts` + `index.ts` (*ground: ref app `src/common/internal-secret/**`*).

```ts
// env-internal-secret.provider.ts
import { Injectable } from '@nestjs/common';
import type { IInternalSecretProvider } from '@sdcorejs/nestjs/auth';

/** Supplies the secret InternalGuard compares against the inbound `x-internal-secret` header (env INTERNAL_SECRET_KEY).
 *  Unset → '' which can never match a present header, so internal routes stay closed until configured. */
@Injectable()
export class EnvInternalSecretProvider implements IInternalSecretProvider {
  getKey(): string {
    return process.env.INTERNAL_SECRET_KEY ?? '';
  }
}
```

```ts
// internal-secret.module.ts
import { Global, Module } from '@nestjs/common';
import { INTERNAL_SECRET_PROVIDER } from '@sdcorejs/nestjs/auth';
import { EnvInternalSecretProvider } from './env-internal-secret.provider';

/** @Global() so the INTERNAL_SECRET_PROVIDER binding is visible to the lib InternalGuard. */
@Global()
@Module({
  providers: [{ provide: INTERNAL_SECRET_PROVIDER, useClass: EnvInternalSecretProvider }],
  exports: [INTERNAL_SECRET_PROVIDER],
})
export class InternalSecretModule {}
```

```ts
// index.ts
export * from './env-internal-secret.provider';
export * from './internal-secret.module';
```

### Step 7 — `src/core/modules/auth/` + `base/shared/` skeleton

**Profile: simple**

Skipped — no `base/shared/` kernel. DTOs live in `src/modules/<module>/dto/` (see init-entity). The JWT strategy lives at `src/common/auth.strategy.ts` (Step 6), not `src/core/modules/auth/`.

---

**Profile: enterprise**

**`src/core/modules/auth/auth.strategy.ts`** — `extends KeycloakJwtStrategy`; `validate(payload)` maps Keycloak claims → the app user (*ground: ref app `src/core/modules/auth/auth.strategy.ts`*). The ref app fetches a full account from an in-process admin service; a fresh scaffold maps claims directly until an admin module exists.

```ts
import { Inject, Injectable } from '@nestjs/common';
import { JWT_CONFIG, type JwtConfig, type JwtPayload, KeycloakJwtStrategy } from '@sdcorejs/nestjs/auth';

/**
 * Passport `jwt` strategy — subclasses the lib KeycloakJwtStrategy (multi-realm JWKS, per-issuer key, RS256)
 * and maps Keycloak claims → the app user object placed on `req.user` (read later via SdContext).
 */
@Injectable()
export class JwtStrategy extends KeycloakJwtStrategy {
  constructor(@Inject(JWT_CONFIG) cfg: JwtConfig) {
    super(cfg);
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: (payload as any).email,
      roles: (payload as any).realm_access?.roles ?? [],
      tenantCode: (payload as any).tenant_code,
      departmentCode: (payload as any).department_code,
      scope: (payload as any).scope,
    };
  }
}
```

> Register this custom strategy with `JwtModule.forRoot({ jwks: { allowedIssuers: [...] } }, { strategy: JwtStrategy })` from `@sdcorejs/nestjs/auth`. `SdCoreModule.forRoot({ jwt })` is only the convenience path for the lib default strategy and does not accept a custom `strategy` option in v1.0.0. If the strategy injects app providers (e.g. `IUserService`), pass those modules via `imports: [AdminModule]`, exactly as the ref app's `SdJwtModule` does.

**`base/shared/` skeleton** (aliased `@shared`, Step 2) — a tiny shared kernel re-exporting the lib's response/paging types and a DTO base, so domain code imports stable `@shared` paths regardless of where the lib defines them. *Ground: ref app `base/shared/{core,entity}`.*

```ts
// base/shared/core/index.ts — re-export the lib response + paging surface under a stable alias.
export { ApiResponse, apiError } from '@sdcorejs/nestjs';
export type { PagingReq, PagingRes, Filter, Order } from '@sdcorejs/utils';
```

```ts
// base/shared/entity/dto.model.ts — base DTO shape every entity DTO extends (matches BaseService DTO contract).
export interface Dto<T extends Dto<T> = any> {
  id: string;
  tenantCode?: string;
  departmentCode?: string;
  editable?: boolean;
  deletable?: boolean;
  restorable?: boolean;
  createdAt?: Date;
  modifiedAt?: Date;
}
```

```ts
// base/shared/entity/index.ts
export * from './dto.model';
```

```ts
// base/shared/index.ts
export * from './core';
export * from './entity';
```

### Step 8 — persistence + Plan 2 reconciliation

**Policy: dev = `synchronize`, prod = migrations.** The ref app runs `DB_SYNCHRONIZE=true` in dev (TypeORM auto-creates tables; `ensureSchemas()` handles the schemas) and **off** in prod, where schema changes ship as migrations.

Emit a CLI DataSource so the TypeORM CLI can generate/run migrations:

```ts
// src/data-source.ts — TypeORM CLI DataSource (migrations only; the app itself uses TypeOrmModule, Step 5).
import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || '<app-name>',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  schema: 'core',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
```

Also create an **empty `src/migrations/` directory** (commit a `.gitkeep`).

**IMPORTANT — Plan 2 Dockerfile reconciliation.** Plan 2's [`_refs/infra/backend.Dockerfile`](../../infra/backend.Dockerfile) start command runs:

```sh
CMD ["sh","-c","npm run typeorm migration:run && npm run start:prod"]
```

So `migration:run` MUST exist and MUST be **safe when there are no migrations** — otherwise the container start command fails on a fresh app. **Chosen resolution (recommended):**

1. **Ship a `migration:run` script** in `package.json` (Step 1: `"typeorm": "typeorm-ts-node-commonjs -d src/data-source.ts"` + `"migration:run": "npm run typeorm migration:run"`).
2. **Ship an empty `src/migrations/`** (`.gitkeep`). `typeorm migration:run` against a DataSource with zero migration files is a **clean no-op that exits 0** — so the Docker CMD's `&&` proceeds to `start:prod`. The Docker chain never fails.
3. **Keep `synchronize` OFF in prod** (`DB_SYNCHRONIZE` unset/false in the prod env) so the running app does not auto-alter the schema; schema evolution goes through generated migrations.

Result: dev developers rely on `synchronize=true` for fast iteration; prod boots via the migration-then-start chain that is a no-op until you generate real migrations with `npm run migration:generate -- src/migrations/<Name>`.

> **Alternative (simplest apps):** if a project commits to `DB_SYNCHRONIZE=true` even in its deployed environment (small internal tool, no migration discipline), instead change the Dockerfile CMD to `CMD ["sh","-c","npm run start:prod"]` (drop the migration step). `sdcorejs-dockerize` adapts the CMD per project. State this trade-off when you choose it.

### Step 9 — `.env.example`

*Grounded on the ref app `.env.example`* (domain blocks stripped). Mirror context header names from Step 5.

**Profile: simple**

```bash
# ===== App =====
PORT=3000
ENVIRONMENT=dev

# ===== Database (1 Postgres, schema-per-module) =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<app-name>
DB_USER=postgres
DB_PASSWORD=postgres
# dev: true (auto-create tables; ensureSchemas() creates schemas). prod: false + run migrations.
DB_SYNCHRONIZE=true

# ===== Keycloak (JWT verification via JWKS) =====
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=dev
# Issuer the lib JWT strategy validates tokens against (JWKS at ${issuer}/protocol/openid-connect/certs).
KEYCLOAK_ISSUER=http://localhost:8080/realms/dev

# ===== Request-context header names (must match SdCoreModule context headers in app.module.ts) =====
# x-user-id — default is wired in code; override only if your gateway renames it.
```

**Profile: enterprise**

```bash
# ===== App =====
PORT=3000
ENVIRONMENT=dev

# ===== Database (1 Postgres, schema-per-module) =====
DB_HOST=localhost
DB_PORT=5432
DB_NAME=<app-name>
DB_USER=postgres
DB_PASSWORD=postgres
# dev: true (auto-create tables; ensureSchemas() creates schemas). prod: false + run migrations.
DB_SYNCHRONIZE=true

# ===== Auth: internal service-to-service =====
# Secret compared (constant-time) against the inbound x-internal-secret header on @UseGuards(InternalGuard) routes.
INTERNAL_SECRET_KEY=

# ===== Keycloak (JWT verification via JWKS) =====
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=dev
# Issuer the lib JWT strategy validates tokens against (JWKS at ${issuer}/protocol/openid-connect/certs).
KEYCLOAK_ISSUER=http://localhost:8080/realms/dev

# ===== Request-context header names (must match SdCoreModule context customHeaders in app.module.ts) =====
# x-user-id, x-tenant-code, x-department-code, x-internal-secret — defaults are wired in code; override only if your gateway renames them.
```

### Step 10 — after init

1. **Install + smoke-build:** `npm install` then `npm run build` (typecheck gate). If the npm `@sdcorejs/nestjs` is not yet published, fall back to the vendored tgz (Step 1 dependency note).
2. **Write the project brief:** run `sdcorejs-explore (summary mode)` (a.k.a. `sdcorejs-explore`) in **WRITE** mode to create `.sdcorejs/summary.md` (domain, stack, generated kernel layout, schema-per-module convention, reuse cheatsheet, current git HEAD) — same pattern as the angular `init-portal` tail. The next session and `init-module`'s pre-flight read this instead of re-scanning blind.
3. **Hand off to `init-module`** to scaffold the first domain module (it appends to `MODULE_SCHEMAS` in `main.ts` + a `RouterModule.register` entry in `app.module.ts` + a new schema), then `init-entity` for the first full CRUD.

---

## Expected scaffold structure

**Profile: simple**

```
<app-name>/
├── package.json                 # @sdcorejs/nestjs (npm <CORE_VERSION>, tgz fallback) + scripts incl. migration:run
├── tsconfig.json                # src/* alias only (no @shared/@app)
├── nest-cli.json
├── .env.example
└── src/
    ├── main.ts                  # ensureSchemas() + bootstrap()
    ├── app.module.ts            # SdCoreModule.forRoot (context + i18n only) + TypeOrmModule.forRootAsync + RouterModule.register([])
    ├── app.configuration.ts     # env config factory
    ├── data-source.ts           # TypeORM CLI DataSource (migrations)
    ├── migrations/.gitkeep      # empty → migration:run is a no-op exit 0
    └── common/
        ├── base-entity.ts
        ├── errors.ts
        └── dto.ts
                                 # permission/JWT strategies supplied by init-admin (AppPermissionStrategy + JwtStrategy)
```

**Profile: enterprise**

```
<app-name>/
├── package.json                 # @sdcorejs/nestjs (npm <CORE_VERSION>, tgz fallback) + scripts incl. migration:run
├── tsconfig.json                # @shared → base/shared, @app/* → src/*
├── nest-cli.json
├── .env.example
├── base/
│   └── shared/                  # @shared kernel re-exports (core/, entity/)
│       ├── core/index.ts
│       ├── entity/{dto.model.ts,index.ts}
│       └── index.ts
└── src/
    ├── main.ts                  # ensureSchemas() + bootstrap()
    ├── app.module.ts            # SdCoreModule.forRoot + TypeOrmModule.forRootAsync + RouterModule.register([])
    ├── app.configuration.ts     # env config factory
    ├── data-source.ts           # TypeORM CLI DataSource (migrations)
    ├── migrations/.gitkeep      # empty → migration:run is a no-op exit 0
    ├── common/
    │   ├── base-entity.ts
    │   ├── errors.ts
    │   ├── admin-auth.guard.ts
    │   ├── admin-permission.strategy.ts
    │   ├── app-audit.strategy.ts
    │   ├── tenancy/app-tenancy.strategy.ts
    │   ├── context/{sd-context.ts,index.ts}
    │   └── internal-secret/{env-internal-secret.provider.ts,internal-secret.module.ts,index.ts}
    └── core/
        └── modules/auth/auth.strategy.ts
```

---

## Verification checklist

- `npm install` succeeds (npm dep or vendored tgz).
- `npm run build` (nest build) — TypeScript typecheck passes.
- `npm run start:dev` boots: `ensureSchemas()` creates the schemas, the DataSource connects, the app listens on `:3000`. (Needs a reachable Postgres + the env from `.env`.)
- `npm run migration:run` exits 0 against the empty `src/migrations/` (proves the Plan 2 Docker CMD chain is safe).
- `src/common/errors.ts` exports `badRequest(code, data?)` (the domain-error helper `actions.md` depends on).
- **enterprise only:** `src/common/core/index.ts` barrels `./sd-context` (so `from 'src/common/core'` resolves) and `SdContext` exposes a `fullName` getter (used by `actions.md` Excel export).
- **simple:** `rg` finds no `tenantCode`/`departmentCode`/`InternalGuard`/`base/shared` in the emitted output.
- **simple:** `src/common/` contains ONLY `base-entity.ts`, `errors.ts`, `dto.ts` — NO `role-permission.strategy.ts`, NO `jwt.strategy.ts`; those are supplied by the always-on `init-admin` module run immediately after `init-project`.
- No `.claude` / `.git` / domain-specific files leaked into the target.

---

## Example input

```text
Khởi tạo backend mới `acme-api` trên @sdcorejs/nestjs. Một Postgres, schema-per-module,
schema đầu tiên là `crm`. Multi-tenant. Keycloak issuer cấu hình qua .env sau.
```
