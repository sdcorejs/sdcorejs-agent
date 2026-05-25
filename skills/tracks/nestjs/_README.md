# NestJS Track — Scaffold Status

This directory holds the NestJS-specific code-writing skills. As of the cross-track design refactor (2026-05-20), only the entry-point and the manual orchestrator are implemented:

| File | Purpose | Status |
|---|---|---|
| `00-onboarding.md` | Entry point for NestJS projects | ✅ Ready |
| `07-write-code.md` | Plan-walking orchestrator (manual, until sub-skills land) | ✅ Ready (scaffold) |
| `10-init-project.md` | Bootstrap repo from be-masterdata baseline | 🚧 Planned |
| `11-init-module.md` | Scaffold `src/modules/<module>/` | 🚧 Planned |
| `12-init-entity.md` | Full vertical slice (entity + repo + service + controller + DTO + Zod + migration) | 🚧 Planned |
| `20-controller.md` | Refine controller endpoints (guards, permissions, OpenAPI) | 🚧 Planned |
| `21-service.md` | Service-layer business logic + transactions | 🚧 Planned |
| `22-repository.md` | Custom repository queries | 🚧 Planned |
| `31-actions.md` | Approval / publish state machines + custom side-effects (export, re-sync, etc.) — mirrors the broadened scope used by angular-portal | 🚧 Planned |

The cross-track design phase (`skills/shared/sdlc/01-brainstorm.md` → `06-review-plan.md`) covers everything from intent → approved plan. The review/test skills (`skills/review/code/nestjs.md`, `skills/testing/*/nestjs.md`) cover post-generation quality. The gap is the per-task code-writing automation.

See `_refs/sdlc/nestjs.md` for the be-masterdata conventions any future sub-skill must enforce, plus the "Open questions" section that lists design calls still pending (shared-package layout, pagination shape, permission code naming).
