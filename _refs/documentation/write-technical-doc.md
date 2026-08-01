# Write Technical Doc Reference

Internal reference loaded by `sdcorejs-documentation` in `write-technical-doc`
or `document-operation` mode. This file is not a dispatchable skill.
Load `_refs/shared/documentation-layout.md` before resolving, discovering, or
migrating a technical document.

## Purpose

Create and maintain technical documentation that helps developers, maintainers,
and technical reviewers understand how a system works. This reference also owns
general document operations: write, rewrite, improve, structure, summarize,
convert, and standardize.

Do not use this reference for product PRDs, user stories, acceptance criteria,
UAT checklists, design handoff artifacts, or test evidence. Those belong to
their first-class tracks.

When this reference is called from `_refs/documentation/gate.md`, write only
when the gate returned `technical_doc=create` or `technical_doc=update`. If the
corresponding technical doc is missing for a new feature, do not create it until
the documentation approval gate or the current user request has approved
`technical-doc` creation. If the change is too small for a persistent technical
doc, report the skip reason instead of creating a template-only file.

## Supported Operations

| Operation | Output intent |
|---|---|
| `write` | Create a new doc from source evidence. |
| `rewrite` | Replace prose while preserving meaning and decisions. |
| `improve` | Clarify, tighten, fix gaps, and remove duplication. |
| `structure` | Reorganize headings, order, tables, and checklist shape. |
| `summarize` | Produce a concise brief with decisions, risks, and next steps. |
| `convert` | Transform content between Markdown shapes, tables, checklists, PR text, or handoff formats. |
| `standardize` | Align terminology, heading style, naming, and required sections across docs. |

## Output Location

All technical documentation produced by this reference goes under:

```text
<target>/.sdcorejs/documentation/technical-docs/<doc-key>/<doc-key>.md
```

Resolve `<target>` as the semantic owner repository. Module implementation/API
documentation belongs in that module repository. Only portal integration,
composition, index, and reference documentation belongs in the portal. Record
stable `repository_id`, `repository_role`, optional `module_id`, source/app
revision, and approved source identity. If a module owner is missing,
ambiguous, unavailable, or unwritable, block; never create an editable portal
copy as fallback.

If a target project already has a conflicting documented convention, ask before
writing outside this folder using `_refs/shared/user-choice-prompt.md`. Do not
write technical docs to `docs/technical/` by default.
An explicit approved existing path remains authoritative. Layout v2 is the
SDCoreJS default, not permission to overwrite a project convention.

## Common Technical Doc Types

| Type | Default location when no convention exists | Required sections |
|---|---|---|
| Module technical reference | `.sdcorejs/documentation/technical-docs/<module>/<module>.md` | Purpose, entrypoints, data flow, contracts, dependencies, verification |
| API reference | `.sdcorejs/documentation/technical-docs/api-<topic>/api-<topic>.md` | Endpoints, auth, request/response, errors, pagination/filtering, examples |
| Architecture note | `.sdcorejs/documentation/technical-docs/architecture-<topic>/architecture-<topic>.md` | Context, decision, components, tradeoffs, consequences, open questions |
| Integration guide | `.sdcorejs/documentation/technical-docs/integration-<system>/integration-<system>.md` | Scope, credentials/env keys, flow, payloads, retries/errors, local verification |
| Implementation guide | `.sdcorejs/documentation/technical-docs/implementation-<topic>/implementation-<topic>.md` | Goal, files, sequence, contracts, edge cases, tests |
| Persistent setup/maintenance doc | `.sdcorejs/documentation/technical-docs/setup-<topic>/setup-<topic>.md` | Prerequisites, commands, config, validation, common failures |

If several destinations inside `.sdcorejs/documentation/technical-docs/` are
plausible, ask before writing with numbered candidate paths plus a "do not
write" option.

The `<doc-key>` must be lowercase kebab-case and path-safe. Preserve a semantic
prefix such as `api-`, `architecture-`, `integration-`, or `setup-` when it
communicates the document type. Unit-local assets belong in `images/`,
`diagrams/`, `schemas/`, `examples/`, or `attachments/` below the doc key; do
not create an asset directory until a file is written.

`API reference` here means standalone developer-facing API documentation. If the
user asks for in-code JSDoc/TSDoc, doc comments, or Python docstrings for route
handlers or exported API units, route to `_refs/documentation/code-documentation.md`
instead.

Discovery boundary: first-run setup diagnosis, missing env files, port conflicts,
and "<localized text>" belong to `sdcorejs-explore (env-setup mode)`.
Use this reference only when the user explicitly asks to write a persistent
setup/maintenance doc, or when env-setup/source evidence already exists and
should be converted into documentation.

## Evidence Preflight

Before writing or changing a technical doc:

1. If the request is setup diagnosis rather than doc writing, stop and route to `sdcorejs-explore (env-setup mode)`.
2. Probe the canonical exact entry
   `technical-docs/<doc-key>/<doc-key>.md` before the legacy flat entry
   `technical-docs/<doc-key>.md`. Read the selected existing destination.
   A legacy match is existing, not missing; an authorized update requires the
   complete migration preflight, and a conflicting canonical/legacy pair
   blocks the operation.
3. Read source artifacts named by the user: code, specs, plans, API samples, logs, diffs, schemas, diagrams, or README sections.
4. For code-backed docs, cite real paths and public entrypoints; do not describe files that were not inspected.
5. For API-backed docs, identify auth, route prefix, request/response shape, errors, pagination/filtering, and permission codes from source evidence.
6. For architecture docs, separate confirmed facts from inference. Mark inference explicitly when the code does not prove it.

## Writing Rules

- Keep docs task-oriented and scannable. Prefer short sections, tables, and checklists when they reduce ambiguity.
- Use the user's language for prose. Keep identifiers, env keys, route paths, permission codes, file paths, class names, and symbols in English.
- Avoid marketing language. Technical docs should explain how the system works and how to verify it.
- Preserve existing terminology unless the operation is `standardize`; then define the canonical term once and update consistently.
- Do not invent acceptance criteria, product commitments, API fields, or operational guarantees.
- Do not create production-SDLC surfaces such as CI/CD release governance, SRE incident runbooks, observability playbooks, or compliance gates unless the user explicitly approved that scope through the SDLC flow.
- Never include real secrets, tokens, passwords, private keys, production
  credentials, or sensitive internal values. Use placeholders such as
  `<API_KEY>`, `<DATABASE_URL>`, `<PROJECT_ID>`, or `example.com`.
- Mark destructive or irreversible actions clearly.
- Treat mojibake as blocking. Fix corrupted text before returning.

## Operation Rules

### write

1. Pick the doc type and destination.
2. Confirm the destination is approved by `_refs/documentation/gate.md` when
   creating a missing doc for a new feature.
3. Validate the key, exact entry shape, case-insensitive collisions, and
   containment before writing.
4. Build a minimal outline from the doc type table.
5. Fill each section from inspected evidence.
6. Add an `Open questions` section when evidence is incomplete.

### rewrite

1. Preserve all confirmed facts, decisions, warnings, and commands.
2. Improve wording and order without changing semantics.
3. Keep links and code references valid.

### improve

1. Identify gaps: missing purpose, stale commands, unclear actors, missing verification, duplicated sections.
2. Patch only the doc area needed to resolve those gaps.
3. Add source-backed examples when they clarify behavior.

### structure

1. Normalize heading levels.
2. Move related content together.
3. Convert dense prose to tables/checklists only where it helps scanning.
4. Keep a short table of contents for long docs.

### summarize

1. State the subject and source docs inspected.
2. Extract decisions, current behavior, risks, blockers, and next actions.
3. Keep summaries shorter than the source; link back to the source instead of copying it.

### convert

1. Identify source format and target format.
2. Preserve all commands, code blocks, tables, warnings, and links unless the user asks to omit them.
3. Report any source content that cannot be represented cleanly in the target format.

### standardize

1. Detect the existing style from nearby docs.
2. Normalize titles, heading levels, terminology, file naming, and required sections.
3. Do not standardize historical decision text in a way that changes its meaning.

## Verification

Use the smallest relevant check:

- `git diff --check` after Markdown edits.
- `rg -n "<old skill or stale path>" <touched files>` when renaming doc concepts.
- Existing repo doc/test commands when available.
- Manual link/path check for every local path introduced.

Report verification commands and skipped checks. Do not claim the docs are
complete if source evidence was missing; call out open questions instead.
