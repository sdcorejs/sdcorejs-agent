# Spec - Documentation Docstring Capability - 2026-07-02 09:38

## Problem & Goals

`sdcorejs-documentation` currently owns documentation gates, implementation comments, user guides, technical docs, requirement records, and document operations. It does not have a separate first-class mode for documenting public code contracts with docstrings or documentation comments.

This change adds a `docstring` capability that documents public APIs and framework contracts without blurring into `comment-code`.

Success means:

- Users can ask for docstrings, doc comments, JSDoc, TSDoc, function/class/API documentation, or localized equivalents and be routed to `sdcorejs-documentation (docstring mode)`.
- `docstring` mode documents public contracts: modules, classes, functions, methods, components, DTOs, route handlers, props, inputs, outputs, services, and exported APIs.
- `comment-code` remains focused on implementation rationale and non-obvious internal logic.
- The new rules cover Angular/TypeScript, Next.js/TypeScript/TSX, NestJS/TypeScript, Python, TypeScript general cases, and a generic fallback for other languages.
- Existing documentation capabilities and behavior remain intact.

## Non-goals

- Do not rename `sdcorejs-documentation` to `sdcorejs-document`.
- Do not rewrite existing `comment-code`, `write-user-guide`, `write-technical-doc`, `write-requirement`, or `document-operation` behavior beyond routing integration needed for `docstring`.
- Do not modify application source code, business logic, or unrelated documentation.
- Do not add new production-SDLC scope such as CI/CD, release governance, observability, or compliance gates.
- Do not hard-code Vietnamese prose into reusable skill source files; AGENTS.md requires skill source language to remain English. Localized trigger intent should be described in English unless the user explicitly approves an exception.

## Architecture

The target repo is the `sdcorejs-agent` skill-pack authoring repo. The active track is `generic` because this is a skill-pack documentation behavior change, not an Angular/NestJS/Next.js app feature.

The existing pattern is:

- Source skill entrypoint: `skills/orchestration/documentation.md`
- Source refs: `_refs/documentation/*.md`
- Generated mirrors: `codex/skills/**`, `codex/skills/_refs/**`, `plugin/skills/**`, `plugin/_refs/**`, and `.claude/**`
- Sync/check command: `npm run sync:skills` and `npm run check:skills`
- Regression command: `npm test`

The implementation should add a dedicated `_refs/documentation/docstring.md` reference and route to it from `skills/orchestration/documentation.md`. Generated mirrors should be produced by `npm run sync:skills`, not hand-edited.

`docstring` mode should load only the docstring reference and apply the most specific ruleset based on filenames, syntax, decorators, imports, and framework conventions:

1. Angular rules for Angular components, inputs, outputs, services, directives, pipes, and lifecycle hooks.
2. NestJS rules for controllers, route handlers, DTOs, providers, guards, pipes, interceptors, and filters.
3. Next.js rules for Server Components, Client Components, Server Actions, Route Handlers, data fetching helpers, and metadata functions.
4. Python docstring rules.
5. TypeScript/JSDoc/TSDoc general rules for non-framework TS/JS.
6. Generic fallback rules for other languages.

Source-language constraint:

- The reusable skill source must stay English-only per AGENTS.md.
- English trigger examples such as `docstring`, `doc comment`, `jsdoc`, `tsdoc`, `document functions`, `document classes`, `document API`, and `add documentation comments` can be added directly.
- Vietnamese trigger phrases from the prompt should be represented as localized-equivalent intent, not literal source text, unless the user explicitly approves overriding the source-language rule.

Coverage approach: post-hoc, because this is instruction/ref authoring plus mirror sync rather than runtime code behavior.

## File structure

- `skills/orchestration/documentation.md` - edit mode selection, routing, workflow/tail/direct request sections, and cross-references to include `docstring`.
- `_refs/documentation/docstring.md` - create the dedicated docstring/doc-comment ruleset and examples.
- `codex/skills/sdcorejs-documentation/SKILL.md` - generated mirror after `npm run sync:skills`.
- `codex/skills/_refs/documentation/docstring.md` - generated mirror after `npm run sync:skills`.
- `plugin/skills/sdcorejs-documentation/SKILL.md` - generated mirror after `npm run sync:skills`.
- `plugin/_refs/documentation/docstring.md` - generated mirror after `npm run sync:skills`.
- `.claude/skills/sdcorejs-documentation/SKILL.md` - generated mirror after `npm run sync:skills`.
- `.claude/_refs/documentation/docstring.md` - generated mirror after `npm run sync:skills`.
- `.cursor/rules/sdcorejs-agent.mdc` - regenerated mirror only if sync changes it.
- `test/e2e/support/skill-pack-runner.mjs` - edit only if keyword/routing diagnostics need explicit `docstring`, `doc comment`, `tsdoc`, or similar terms.
- `test/e2e/*.test.mjs` - edit only if existing tests require an expected route/keyword update.

## Acceptance criteria

1. `sdcorejs-documentation` has a clearly documented `docstring` mode/capability in its mode-selection table.
2. The new mode routes requests for docstrings/doc comments/JSDoc/TSDoc/API documentation comments to `_refs/documentation/docstring.md`.
3. `comment-code` remains explicitly scoped to implementation rationale, workarounds, and non-obvious internal logic.
4. `docstring` remains explicitly scoped to public contracts and exported/framework-facing APIs.
5. The docstring reference includes rules for Angular/TypeScript, Next.js/TypeScript/TSX, NestJS/TypeScript, Python, TypeScript general cases, and other-language fallback.
6. The docstring reference instructs agents not to invent behavior, not to restate obvious TypeScript/Python types, and to preserve executable code exactly unless explicitly asked otherwise.
7. The docstring reference instructs agents to update stale/wrong existing docstrings rather than adding duplicates.
8. The docstring reference includes concise examples when useful and keeps examples in English source text.
9. Existing documentation modes remain present and keep their current references.
10. Generated mirrors are synchronized through `npm run sync:skills`.
11. `npm run check:skills` passes after implementation.
12. `npm test` passes after implementation, or skipped verification is explicitly reported with a reason.
13. No Vietnamese prose is added to `skills/**`, `_refs/**`, generated mirrors, prompts, templates, examples, or validation fixtures unless the user explicitly approves an exception to AGENTS.md.

## Risks & mitigations

- **Risk:** `docstring` and `comment-code` overlap and make future agents over-comment. -> **Mitigation:** Document the distinction in both the skill entrypoint and the docstring ref, and keep `comment-code` routing for implementation comments.
- **Risk:** Literal Vietnamese triggers from the prompt conflict with AGENTS.md source-language rules. -> **Mitigation:** Use English trigger descriptions and localized-equivalent wording; ask for explicit exception if exact Vietnamese trigger literals are required.
- **Risk:** Generated mirrors drift from source. -> **Mitigation:** Run `npm run sync:skills` during implementation and verify with `npm run check:skills`.
- **Risk:** Existing e2e keyword diagnostics do not recognize the new trigger vocabulary. -> **Mitigation:** Update only the routing/keyword fixture if tests reveal a gap.
- **Risk:** The new reference becomes too broad or verbose. -> **Mitigation:** Keep behavior rules concise, contract-focused, and organized by framework/language.

## Out of scope (deferred)

- Dedicated docstring generator executable tooling - defer until a user asks for automated AST-based rewriting.
- Style adapters for additional docstring conventions beyond the specified fallback list - defer until requested for a concrete language or project.
- Persisted user preferences for docstring mode - defer until users need repeated project-specific docstring defaults.
- New production SDLC skills or refs - defer until explicitly approved under the repo's Production SDLC Scope Decision.
