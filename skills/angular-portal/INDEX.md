# Angular Portal Skills Index

## Purpose
Single entry point for skill selection.
Load only the needed skill file to reduce token usage.

## Skill Order
1. Request intake and resolution
2. Portal init (when repo does not exist)
3. Lib/module init
4. Entity CRUD generation
5. Reactive form refinement
6. Workflow actions
7. Dev FAQ knowledge support

## Skill Map
- 0: angular-request-intake-skill.md
- 0.5: angular-portal-project-init-skill.md
- 1: angular-module-configuration-skill.md
- 2: angular-entity-crud-skill.md
- 2.5: entity-crud-generation-skill.md
- 3: angular-reactive-form-skill.md
- 4: angular-workflow-actions-skill.md
- 5: angular-dev-faq-skill.md

## Core Version Source
- Single source of truth: core-version.md
- Do not hardcode @sd-angular/core version in other docs; read from core-version.md
- Component catalog: sd-angular-core-catalog.md

## Mandatory Generation Contract
- Always resolve module ownership before entity generation.
- Always generate or verify module first, then entity pages.
- Run tests after each module/entity generation:
  - preferred: npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts
  - fallback: npm run test -- --watch=false
- Report test summary and failing spec names.

## Entity UI Contract
Full-page pattern uses only 2 page components:
- pages/list/list.component.ts
- pages/detail/detail.component.ts

Detail component covers CREATE/UPDATE/DETAIL by URL state:
- /create -> detail.component.ts (state CREATE)
- /update/:id -> detail.component.ts (state UPDATE)
- /detail/:id -> detail.component.ts (state DETAIL)

Side-drawer pattern:
- pages has only list.component.ts
- detail UI is in components/detail-side-drawer/detail-side-drawer.component.ts

## Custom UI Fallback Rule
If Core UI lacks a required component:
- generate placeholder skeleton
- keep event handlers as alert-based stubs
- mark clearly for developer implementation

Example stub:
- alert('TODO: onCustomAction - implement here')

## Bilingual Rule
- Vietnamese request -> output labels/messages in Vietnamese with full diacritics.
- English request -> output in English.
- Permission code and route naming remain English.

## Token Saving Rules
- Do not load all skill docs at once.
- Load index + one active skill file first.
- Load catalog/template docs only when needed.
- Reuse templates with variable substitution; avoid re-explaining unchanged rules.

## Clarification Minimum Checklist
Before generating a new entity screen:
- module name
- entity name
- display label
- key list fields
- key detail fields
- confirm create/update/detail scope

If module is missing, this is the first blocking clarification.

## Improvement Sync Rule
When developer introduces a new convention:
- ask: Ban co muon minh cap nhat rule nay vao skills luon khong?
