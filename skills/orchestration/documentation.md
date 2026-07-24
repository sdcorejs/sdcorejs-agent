---
name: sdcorejs-documentation
description: Documentation executor/gate for documentation artifacts. Use for code comments/docstrings/JSDoc/TSDoc, user guides/manuals, user-guide screenshot scripts, TASKID or requirement records, technical/API docs, doc rewrite/improve/structure/summarize/convert. Do not use for project summary/code maps/env setup/recovery, product PRDs/stories/AC/UAT/traceability, design handoff, code implementation, tests, review, or approved-plan execution. Runtime-localized.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Documentation

## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` as a read-only,
   relevance-first context assembler.
4. Read `_refs/shared/artifact-lifecycle.md`; every `.sdcorejs/**`
   documentation write must emit `artifact_context`.
5. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
6. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## Purpose

Expose one documentation skill while keeping detailed documentation behaviors in
refs. This skill chooses the mode, loads the matching `_refs/documentation/*`
reference, then executes it.

Long-term documentation verbs owned here:

- write
- rewrite
- improve
- structure
- summarize existing docs/artifacts
- convert
- standardize

## Core Documentation Modes

Keep documentation modes distinct. Do not mix them unless the user explicitly
asks for multiple outputs.

| Mode | Purpose | Primary reader | Output |
|---|---|---|---|
| `code-documentation` | Document source code with public contracts and/or implementation comments. | Developer using or maintaining the code. | Python docstrings, JSDoc/TSDoc, conventional doc comments, inline/block implementation comments. |
| `write-user-guide` | Explain how an end user, admin, or operator performs a task. | Non-developer user, admin, support, operator. | Task-oriented Markdown guide. |
| `write-technical-doc` | Explain system design, API behavior, integration, setup, or maintenance. | Developer, tech lead, maintainer, or API consumer. | Developer-facing Markdown documentation. |

`api-doc` is a subtype of `write-technical-doc`, not a separate skill mode.

## Global Documentation Rules

- Choose the documentation mode from user intent and source evidence.
- Do not mix documentation modes unless the user explicitly asks.
- Do not invent behavior, architecture, workflows, API fields, commands, roles,
  screens, infrastructure, or business rules that are not visible from code,
  tests, configuration, decorators, filenames, existing docs, type annotations,
  or surrounding context.
- Prefer concise, accurate, maintainable documentation over verbose
  documentation.
- Match the project's existing tone, terminology, formatting, and documentation
  style.
- Preserve executable code unless the user explicitly asks for code changes.
- Do not rename symbols, reorder decorators, or change imports unless a
  documentation tool explicitly requires it and the user asked for that tool.
- Update stale or wrong existing documentation instead of adding duplicate or
  contradictory content.
- Keep code identifiers, commands, environment variables, config keys, API
  paths, UI labels, class names, method names, and file names exact.
- Runtime-localize generated prose; keep reusable skill source English-only.
- Never include real secrets, tokens, passwords, private keys, production
  credentials, or sensitive internal values. Use placeholders such as
  `<API_KEY>`, `<PROJECT_ID>`, `<USER_ID>`, or `example.com`.
- Mark destructive or irreversible actions clearly.

## Mode Selection

| Mode | Trigger examples | Reference |
|---|---|---|
| `documentation-gate` | user-guide/technical-doc approval, saved documentation preferences, `.sdcorejs/documentation/preferences.md` | `_refs/documentation/gate.md` |
| `code-documentation` | code documentation, document code, add comments, comment code, implementation comments, docstring, doc comment, JSDoc, TSDoc, document functions/classes/API, localized equivalents | `_refs/documentation/code-documentation.md` |
| `write-user-guide` | user guide, user manual, module guide, aggregate guide, DOCX/PDF export, Playwright screenshot capture script for user guides, legacy reverse-engineer guide | `_refs/documentation/write-user-guide.md` |
| `write-technical-doc` | technical docs, API docs, architecture notes, module reference, integration guide, setup/implementation guide | `_refs/documentation/write-technical-doc.md` |
| `write-requirement` | `TASKID`, task id, ticket id, "record requirement", "save requirement" | `_refs/documentation/write-requirement.md` |
| `document-operation` | rewrite, improve, structure, summarize, convert, or standardize existing docs/artifacts | `_refs/documentation/write-technical-doc.md` |

## Routing Rules

- Use `sdcorejs-product` for PRDs, user stories, acceptance criteria, UAT, product decisions, and requirement traceability.
- Use `sdcorejs-design` for UI/UX design, screen flows, wireframes, PNG previews, and FE handoff specs.
- Use `sdcorejs-test` for test plans, test evidence, UAT execution evidence, and test implementation.
- Use `sdcorejs-explore` for project summary, code-map, trace-flow, env-setup, recovery, persona, and memories. If the user asks to summarize the project/codebase/repo/system, route to `summary-read` by default or `summary-refresh` only when they explicitly ask to refresh/persist the summary. If they explicitly name an existing doc, summarize it here instead.
- Use this skill for general documentation, code documentation, user-facing guides, technical docs, and lightweight task requirement records under `.sdcorejs/documentation/requirements/`.
- Route code comments, implementation comments, docstrings, doc comments, JSDoc, TSDoc, documented functions/classes/APIs, and localized equivalents to `code-documentation` mode.
- Route standalone REST/API reference docs to `write-technical-doc` unless the
  user specifically asks for in-code API doc comments.
- Use `sdcorejs-product` instead when the user asks for full PRD/user story/acceptance criteria/UAT/traceability work rather than a task-level requirement record.

## Workflow

1. Resolve the target project root and active track from the request and current repo signals.
2. Select one mode from the table above. If two modes match, prefer the explicit user wording; in finish tails, prefer the tail mode passed by the orchestrator. If the user explicitly asks for multiple documentation outputs, run each selected mode separately and label the outputs.
3. Read the matching reference completely before writing.
4. Execute only the selected reference. Do not load every documentation reference up front.
5. Keep generated prose runtime-localized; keep identifiers, env keys, permission codes, route paths, filenames, and symbols in English.
6. Preserve UTF-8 and locale marks. Mojibake in documentation, prompts, comments, or user-facing strings is a blocking defect.
7. Verify with the smallest relevant command or check available in the target project, and report skipped verification explicitly.

## Tail Modes

### Documentation Gate Tail

When called by `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs`, or
direct `sdcorejs-test` after the test decision:

1. Load `_refs/documentation/gate.md`.
2. Identify whether corresponding `user-guide` and `technical-doc` files
   already exist for the touched feature/module.
3. Ask the approval gate before creating any missing user-guide or technical-doc
   for a new feature. Saved preferences may default updates, but must not
   silently authorize new doc file creation.
4. Pass the captured choices to the documentation tail modes below.

### Code Documentation Tail

When called by Angular/NestJS/Next.js track skills after source code was created
or modified:

1. Load `_refs/documentation/code-documentation.md`.
2. Apply maintainability-focused source-code documentation automatically.
3. Do not ask for approval and do not let user/technical-doc skips disable this
   step.
4. Add or update only useful source-code documentation: public/exported
   contracts, framework-standard docs, and concise comments for non-obvious
   logic. Do not comment obvious code.

### Code Documentation Direct Mode

When called directly for code comments, docstrings, or documentation comments:

1. Load `_refs/documentation/code-documentation.md`.
2. Detect whether the user wants public contract docs, implementation comments, or both.
3. Detect the language/framework from syntax, imports, decorators, filenames, and local style.
4. Preserve executable code and update stale existing code documentation instead of adding duplicates.

### Technical Doc Tail

When called after the documentation gate:

1. Load `_refs/documentation/write-technical-doc.md`.
2. If `technical_doc=skip`, make no edits and report that technical docs were skipped.
3. If `technical_doc=create`, create the approved technical doc from source evidence.
4. If `technical_doc=update`, update the existing corresponding technical doc from source evidence.

### Requirement Record Tail

When called after the documentation gate or direct requirement request:

1. Load `_refs/documentation/write-requirement.md`.
2. If the user provided a `TASKID`, write or update `<target>/.sdcorejs/documentation/requirements/<TASKID>.md`.
3. If no `TASKID` exists but the user wants a requirement record, ask for `TASKID` before writing.
4. If the user declines requirement recording, skip and report it.

### User Guide Tail

When called after `auto-docs` in a write-code flow:

1. Load `_refs/documentation/write-user-guide.md`.
2. Run Mode 1 for every touched module when `user_guide=create` or
   `user_guide=update`.
3. Create or update the sibling Playwright screenshot script at
   `<target>/.sdcorejs/documentation/user-guides/capture-screenshots.playwright.mjs`
   when the guide contains UI screens or image checklist entries.
4. Never write user-guide artifacts into the `sdcorejs-agent` authoring repo unless that repo is explicitly the target for documentation testing.

## Direct Documentation Requests

For direct write/rewrite/improve/structure/summarize/convert/standardize requests on docs or source artifacts:

1. Identify the source docs or code artifacts from the user's request, current diff, or project context.
2. If the request is really project discovery ("summarize this project", "map the repo", "trace this flow", "setup dev"), route to `sdcorejs-explore`.
3. If the request includes `TASKID` or asks to record a requirement, load `_refs/documentation/write-requirement.md` and write/update the requirement record. Stop there unless the user also explicitly asked for technical docs.
4. If the request asks for code comments, implementation comments, docstrings, doc comments, JSDoc, TSDoc, documentation comments, or public API documentation comments, load `_refs/documentation/code-documentation.md`, preserve executable behavior, and stop unless the user also explicitly asked for standalone technical docs.
5. If the target artifact is ambiguous and no existing convention is discoverable, ask for the destination path.
6. Load `_refs/documentation/write-technical-doc.md`.
7. Preserve source meaning; do not invent requirements, APIs, constraints, or acceptance criteria.

## Artifact Output

For each new or updated `.sdcorejs/documentation/**` artifact, add lifecycle
metadata when the format permits. Feature/change documentation is normally
`required_with_change`; saved preferences are `shared_owned` only when this
workflow explicitly owns the update; screenshots, traces, browser state, and
temporary export intermediates are `local_only`. Emit the standard
`artifact_context` and pass it to the caller.

## Cross-References

- `_refs/documentation/gate.md` - user-guide/technical-doc approval, saved preferences, and new-doc creation guard
- `_refs/documentation/code-documentation.md` - source-code documentation, including public contracts and implementation comments
- `_refs/documentation/write-user-guide.md` - end-user guide generation and aggregate/export flow
- `_refs/documentation/write-technical-doc.md` - technical docs and document operations
- `_refs/documentation/write-requirement.md` - task-level requirement record under `.sdcorejs/documentation/requirements/<TASKID>.md`
- `_refs/shared/finish-gate.md` - surfaces the documentation gate inside code-generation flows
- `_refs/orchestration/tail/auto-docs.md` - change-scoped execution records, distinct from evergreen documentation
- `sdcorejs-explore` - project discovery, summaries, code maps, flow traces, env setup, and documentation harvests
