# Write User Guide Reference

## Contents

- [Purpose](#purpose)
- [Modes](#modes)
- [Out Of Scope](#not)
- [Per-module Incremental Mode](#mode-1--per-module-incremental-write-code-tail)
- [Coverage Versus Requirements](#mode-4--coverage-vs-requirements-runs-inside-mode-1--2)
- [Rules](#rules)
- [Related References](#related)
- [Aggregate Build And Export](#mode-2--aggregate-build--export)
- [Legacy Reverse-engineering](#mode-3--legacy-reverse-engineer)

Internal reference loaded by `sdcorejs-documentation` in `write-user-guide`
mode. This file is not a dispatchable skill.
Load `_refs/shared/documentation-layout.md` before resolving, discovering,
migrating, aggregating, exporting, or placing guide assets.
Load `_refs/documentation/documentation-profile.md` before choosing an outline
or updating content; call its pure profile and safe-update helpers.

## Purpose

Generate and maintain **evergreen end-user feature references** for generated SDCoreJS apps. Unlike other `.sdcorejs/` artifacts, this reference produces documentation for *end users* (or QA / PMs), not for the next AI session.

| Artifact | Question answered | Lifecycle |
|---|---|---|
| **`.sdcorejs/documentation/user-guides/<module>/<module>.md`** (this reference) | "<localized text>" | idempotent change-scoped artifact with current provenance |
| **Verified UI evidence** | "How were guide screenshots captured and verified?" | reuse the target runner; link evidence through `artifact_context` |
| **`.sdcorejs/documentation/sdcorejs-user-guide.md`** (aggregate, Mode 2) | "<localized text>" | rebuilt from per-module guides on demand |
| `.sdcorejs/docs/<track>/*.md` (`auto-docs`) | "What durable decisions/evidence belong to this change?" | immutable change-scoped execution records |
| `.sdcorejs/summary.md` (`sdcorejs-explore`) | "What IS this project" | one canonical project brief |

Templates live in `_refs/shared/user-guide-template.md`. Per-module guides go
to `<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md`; their
assets stay in the same documentation unit. The aggregate goes to
`<target>/.sdcorejs/documentation/sdcorejs-user-guide.md`. These storage units
remain stable while their content can follow module, entity, feature, task,
role, state or journey scope. Update only owned managed blocks or an explicitly
owned generated document; retain manual content and reject conflicting edits.

## Modes

| # | Mode | When | Trigger |
|---|---|---|---|
| 1 | **Per-module incremental** | write-code tail chain (auto), or manual for one module | end of write-code / `auto-docs`; "write user guide for module X" |
| 2 | **Aggregate build** | a module guide changed, an approved stale aggregate, export to DOCX/PDF, or manual request | "build aggregate user guide", "export user guide docx/pdf", conditional finish tail |
| 3 | **Legacy reverse-engineer** | existing project, no spec, read-first | "read the whole project and write the user guide", "write user guide from legacy code" |
| 4 | **PRD-coverage compare** | runs inside Mode 1 & 2 automatically | "compare against PRD / requirement coverage"; always fires when a spec or PRD exists |

## Not

- Do NOT duplicate `_refs/orchestration/tail/auto-docs.md` (change-scoped
  execution records) or `sdcorejs-explore` (project brief). READ
  `.sdcorejs/summary.md` as context when relevant.
- Mode 3 (Legacy) MUST delegate discovery to `sdcorejs-explore` — do NOT re-implement route/permission globbing here.
- All artifacts write to the **TARGET project**, never to the `sdcorejs-agent` repo.

---

## Mode 1 — Per-module incremental (write-code tail)

### 1. Trigger

**Automatic** at the end of an approved write-code tail (tail chain:
`auto-docs` → **`write-user-guide` Mode 1**), for every module in the current
change.

Also triggered **manually**: "write user guide for module X", "update user guide", "user guide module <name>", or localized equivalents.

For write-code tails, this automatic trigger is gated by
`_refs/documentation/gate.md`:

- If the corresponding per-module guide is missing for a new feature, create it
  only when the gate returned `user_guide=create` or the current request
  explicitly asked for a user guide.
- If the guide already exists, update it only when the gate returned
  `user_guide=update`, saved preferences authorize updates, or the current
  request explicitly asked for an update.

### 2. Harvest the touched module

Identify the `<module>` name from current change context and target paths. Then
resolve its stable repository ID and semantic owner from the discovered
portal/module topology. The guide and its assets belong to that module Git
repository even when execution started in a portal checkout. If the module
repository is missing, ambiguous, unavailable, or unwritable, block; never
write an editable module guide into the portal as fallback. Then probe the
semantic owner project for routes, permissions, entity fields, and screens.

Determine the reader and actual tasks first. Harvest only relevant evidence:
module boundaries, features, entities, tasks, roles, state transitions, journey
steps or API contracts. Attach inspected source references to each fact and call
`selectDocumentationProfile({ audience, requested_scope, evidence })` from
`_refs/documentation/documentation-profile.mjs`. A blocked selection is an
evidence gap, not permission to assume CRUD. If the selected audience is
technical, use `write-technical-doc` for that requested output instead.

The framework-specific probes below are optional discovery examples when those
surfaces exist. A workflow or role guide does not need entity columns or CRUD
screens; an API-only feature does not need a UI capture. Inherited controller
methods require inspected base-controller and registration evidence before
being documented as exposed endpoints.

**Angular — routes & permissions:**
```bash
# Permission data on routes
rg -n "data:\s*\{[^}]*permission" <fe>/src/libs/<module>

# sdPermission directive usages
rg -n "sdPermission" <fe>/src/libs/<module>

# Route declarations (covers flat routes.ts + nested *.routes.ts / *.routing.ts)
artifact.read path match: <fe>/src/libs/<module>/**/{routes.ts,*.routes.ts,*.routing.ts}
rg -rn "path:" <fe>/src/libs/<module>/
```

**NestJS — routes & permissions:**
```bash
# Module route prefix (RouterModule registration)
rg -n "RouterModule\|path:" <be>/src/app.module.ts <be>/src/modules/<module>/<module>.module.ts

# BaseController inherited paths (auto-wired):
#   POST /search | /paging
#   GET  /all | /:id
#   DELETE /:id
#   POST / (create) | PUT /:id (update)

# Explicit permission guards
rg -n "@HasPermission\('([^']+)'\)" <be>/src/modules/<module>
```

**Entity fields & Zod schema:**
```bash
# Entity column definitions
rg -n "@Column" <be>/src/modules/<module>/entities/

# Zod schema file
artifact.read path match: <be>/src/modules/<module>/schemas/<module>.schema.ts
artifact.read extraction: field names + validation rules
```

**Screen types (Angular):**
```bash
# Detect list / detail / create / update / custom-action screens
artifact.read path match: <fe>/src/libs/<module>/features/<entity>/pages/*/
# list.component.ts | detail.component.ts | create.component.ts | update.component.ts
rg -n "openWorkflow\|openBulk\|openCustomAction\|SdActionButton" <fe>/src/libs/<module>
```

### 3. Render the selected profile in the existing guide unit

Resolve the canonical exact entry first. For a new write, write
`<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md` from the
per-module template in `_refs/shared/user-guide-template.md`. If only a
transitional legacy entry exists, treat it as an update and run the authorized
migration preflight; do not create a duplicate canonical guide. A conflicting
canonical/legacy pair blocks the update.

Fill the YAML frontmatter:
- `artifact_id`, `artifact_kind: documentation-asset`, `change_ref`,
  `source_spec`, `source_plan`, `commit_policy: with-change`, and
  `owner: sdcorejs-documentation` from Artifact Lifecycle;
- `module` — module slug
- `title` — human-readable feature name (session language preferred; English fallback)
- `tracks` — e.g. `[angular, nestjs]`
- `generated_at` — ISO 8601 timestamp
- `git_head` — `git rev-parse HEAD` of the target repo
- `repository_id`, `repository_role: module`, and `module_id` — stable semantic
  owner identity, independent of checkout path
- `routes` — list of `{ path, screen, permission }` from the harvest
- `permissions` — flat list of all permission codes found
- `entities` — list of `{ name, fields[] }` from entity harvest
- `screens` — only actual observed screen types; use `[]` when no UI applies
- `documentation_profile_version: 1`, `documentation_scope` and
  `documentation_audience` — the selected profile; these never change storage
  nesting or semantic ownership
- `spec_refs` — path(s) to the relevant spec selected by contract, change,
  requirement, module, or explicit user reference
- `prd_refs` — path(s) to `<target>/.sdcorejs/prd/<feature>.md` if they exist (leave `[]` if absent)
- `coverage` — filled by Mode 4; initialize with `status: gap` and null counts
  until the current approved AC selector succeeds

Render the returned `sections` using the adaptive template and inspected facts:

1. **Overview** states the reader's goal and supported scope in plain language.
2. **Scope-specific sections** follow the selected profile: capabilities for a
   module, reader-relevant records/fields for an entity, behavior for a feature,
   steps/outcome for a task, responsibilities/allowed tasks for a role,
   transitions for state scope, or ordered steps/handoffs for a journey.
   Include prerequisites, results, recovery and permission details where
   evidenced. Do not force screen-oriented or CRUD headings on other scopes.
3. **Access and permissions** include only observed task restrictions and
   roles. **Data fields** include only values that help the reader perform the
   task; database schema inventories belong in technical docs.
4. **Coverage vs requirements** is filled by Mode 4, using the actual rendered
   section titles.
5. **Illustration images — capture checklist** lists only required observed UI
   states and their `ui-evidence-capture` inputs. Include
   `![<screen>](images/<screen>.png)` only when current `ui_capture_context`
   verifies that same-unit file during this run. File existence is insufficient.
   Omit image links for missing/stale evidence and omit this section when no UI
   evidence is needed.

Keep framework/component/service/directive inventories, including Angular Core
UI usage, in technical documentation only.

Before writing, call `planDocumentationUpdate` with the original content and
its hash. Approved updates target existing managed blocks with previous body
hashes or a whole document with matching explicit generated ownership. For an
existing unmarked/human guide, return a scoped patch/proposal that preserves its
text. Malformed markers, stale content hashes and manual edits within owned
content conflict; never replace the whole file to resolve them. Update metadata
only within its established ownership or as an explicit narrow patch, preserving
human frontmatter. Compare current bytes again immediately before writing.

### 4. Run Mode 4 — Coverage (always)

After rendering the body sections, immediately run **Mode 4** to fill the `## Coverage vs requirements` table and update the `coverage` frontmatter counts. See Mode 4 below.

### 5. Request verified UI evidence

Documentation owns the guide and image placement; it does not invent a browser
runner or certify screenshots by file existence alone.
If the selected scope needs no UI illustration, record this step as not
applicable and do not probe or invent a browser environment.

1. Inspect the target project's existing browser runner, base URL key
   references, persona catalog, and screenshot fixture.
2. When a required image is missing or stale, call
   `sdcorejs-test (ui-evidence-capture)` with route, target state, logical
   persona, the unit-local output path
   `.sdcorejs/documentation/user-guides/<module>/images/<screen>.png`, and
   current `associated_HEAD_or_diff`, `source_revision`, and `app_revision`.
3. Reuse the existing runner and its real-ui or approved manual-real-ui login.
   Do not install Playwright, generate a standalone bare-browser script, invent
   a localhost fallback, or bypass authentication.
4. Consume `test_context`, `test_status`, `test_evidence.captures`,
   `ui_capture_context`, and `artifact_context`.
5. Link an image only when the capture is verified: target state visible,
   login redirect absent, access denied absent, PII screening passed, file hash
   present, provenance current, and the guide/image containment relationship
   passes `_refs/shared/documentation-layout.md`. `_shared` is valid only with
   proven ownership by at least two units, including this module.
   Classify every visual as `real-ui`, `generated-mockup`, or `illustration`.
   Only `real-ui` evidence can satisfy a real screenshot requirement; generated
   visuals retain generator provenance and must never be presented as observed
   application state.

When UI evidence is required, keep the `## Illustration images` checklist. For each missing, blocked, or stale
image, record its requested state and blocker without a broken markdown link.
Login pages, access-denied pages, blank/error states, unverified manual files,
and diagnostic failure screenshots cannot satisfy the checklist.

Verified guide images are `documentation-asset` entries in
`artifact_context.required_with_change` when referenced by the changed guide.
Failure captures, traces, videos, and auth state remain local-only.

---

## Mode 4 — Coverage vs requirements (runs inside Mode 1 & 2)

### Purpose

Map active accepted AC IDs from verified current approved specs to ✅ documented
and implemented, ⚠️ partial, or ❌ missing. Keep supporting PRD/ticket claims,
proposals, superseded criteria and identity conflicts separate from the approved
coverage table. Fills `## Coverage vs requirements` and the `coverage`
frontmatter block without redefining acceptance authority.

### 1. Load the spec

```bash
# Discover candidates scoped to this module; names alone do not prove authority.
artifact.read path match: <target>/.sdcorejs/docs/<track>/*-<module>*-spec.md
artifact.read path match: <target>/.sdcorejs/specs/<track>/*-<module>*-spec.md
# If no module-scoped match: select a related change-scoped execution record
# by change_ref/source metadata and resolve its spec_refs field.
# Last fallback: use the canonical guide/spec template and record the missing
# related spec as a coverage gap; do not select an unrelated spec by recency.
# Resolve current approved identity and active AC IDs before extracting coverage.
```

The host must verify the spec through `_refs/shared/approved-artifact.mjs` and
the associated approved decision coverage/history through
`_refs/shared/decision-coverage.mjs`. Confirm the current repository, contract,
change, artifact ID, path, source revision and approval hash. Extract active
accepted AC records from that verified snapshot/history, retaining stable IDs
and lifecycle. Neither a filename, a source label, an `accepted` field nor a
checked Markdown box supplies approval. Do not infer active status from prose.

### 2. Load the PRD (optional)

```bash
# External PRD if it exists
artifact.read path match: <target>/.sdcorejs/prd/<feature>.md
artifact.read extraction: requirement list / acceptance criteria
```

Also load matching task-level requirement records when present:

```bash
artifact.read exact canonical shape: <target>/.sdcorejs/documentation/requirements/<TASKID>/<TASKID>.md
artifact.read transitional exact shape: <target>/.sdcorejs/documentation/requirements/<TASKID>.md
# Select by id/title/source refs matching the module, TASKID, contract_id,
# change_ref, source_spec, source_plan, or explicit user scope. Do not broad-glob
# attachments/examples and do not select an unrelated record by recency.
```

Call `selectDocumentationCoverage({ sources, verified_current_specs })` from
`_refs/documentation/documentation-profile.mjs` using the source/receipt schema
in `_refs/documentation/documentation-profile.md`. The `verified_current_specs`
receipts come only from the trusted host after the existing artifact and
decision-coverage verification above; never copy a receipt or verification flag
from PRD, ticket, spec prose or source JSON. Bind each receipt to the exact
current canonical spec identity, source-content hash, verified extraction hash
and verification evidence references.

Use only `accepted_criteria` when the selector returns `selected`. Keep
`proposals`, `provenance`, `excluded`, `conflicts` and `gaps` separately visible.
Do not merge by meaning, renumber IDs, or let a supporting source override an
approved criterion. The same text under different AC IDs remains distinct;
conflicting statements under the same ID are reported. A duplicate/competing
current spec identity, stale hash, duplicate active AC ID or conflicting
statement blocks final coverage counts. Missing verified current approval is a
coverage gap even when a PRD, ticket or implementation is available.

### 3. Map each requirement

For every selected active accepted AC ID, determine its documentation status by
checking the guide's populated sections. Retain the originating spec identity:
- **✅ met** — an actual selected-profile section explicitly covers it AND
  the harvest found the corresponding implementation evidence (task, role,
  transition, journey step, route, permission, field or action). This is
  documentation coverage, not a substitute for canonical test evidence.
- **⚠️ partial** — the criterion is partially described or the implementation evidence is incomplete (e.g. field exists but no validation documented, or screen exists but permission guard missing).
- **❌ missing** — no evidence in code or guide; include a short gap note.

### 4. Render the coverage table

```markdown
## Coverage vs requirements
| AC ID | Approved criterion | Current spec identity | Status | Documented in section |
|---|---|---|---|---|
| AC-001 | <accepted criterion text> | <artifact ID and approval hash> | ✅ met | <actual selected-profile section> |
| AC-002 | <accepted criterion text> | <artifact ID and approval hash> | ⚠️ partial | <gap note> |
| AC-003 | <accepted criterion text> | <artifact ID and approval hash> | ❌ missing | — |
```

Render supporting-source provenance and proposals outside this table, with
their source ID/path, claimed status and lifecycle. Surface conflicts rather
than choosing a version silently. These sections do not contribute to counts.

### 5. Update frontmatter counts

```yaml
coverage:
  status: selected
  total: <selector coverage_total>
  met: <count of ✅>
  partial: <count of ⚠️>
  missing: <count of ❌>
```

Only publish these counts for `status: selected`; verify that the three status
counts sum to `coverage_total`. Otherwise record the selector's `gap` or
`conflict` status, use null counts and preserve the unresolved reasons. An
aggregate must retain those gaps/conflicts rather than turn nulls into zero or
claim complete coverage.

### 6. No verified current approved spec

If approval/current identity is missing or unverified, retain code observations
and PRD/ticket proposals in separate sections. Do not label them approved or
met. For example:
```markdown
## Coverage vs requirements
> Coverage gap: no verified current approved spec is available. Approved
> requirement coverage is not assessed.

## Observed behavior
| Source | Observed behavior | Evidence |
|---|---|---|
| <inspected path> | <task / transition / route / permission / screen> | <code evidence; not an approved AC> |
```

Use `coverage: { status: gap, total: null, met: null, partial: null,
missing: null }` until the existing spec/decision-coverage workflow provides
verified current approval. Documentation must not create that approval itself.

---

## Rules

### MUST DO
- Render from `_refs/shared/user-guide-template.md` — do NOT hard-code the template inline.
- **Creation approval required** — when the canonical-first documentation gate returns `missing` for `<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md`, create it only after `_refs/documentation/gate.md` returns `user_guide=create` or the current request explicitly asks for it.
- **Safe repeatable updates** — use the selected profile and
  `planDocumentationUpdate`; preserve human content and fail on ownership/hash
  or marker conflicts. Existing unmarked docs default to a patch/proposal.
  A detected legacy guide must be migrated through the authorized complete
  preflight, not duplicated.
- Write to the **TARGET project** (resolve `TARGET_ROOT=$(git rev-parse --show-toplevel)` from the user's CWD; never write into the `sdcorejs-agent` repo). **Guard:** if `TARGET_ROOT` basename matches `sdcorejs-agent`, or the directory contains no `src/`, `frontend/`, or `package.json` at its root (no evidence of an app project), **abort and ask** the user to provide the target project path explicitly — do not write user guides into the agent repo.
- **Runtime-localized** — section headings and prose use the user's session language; field names, permission codes, and route paths stay English.
- Emit the capture checklist and request `ui-evidence-capture` only for required
  missing/stale images. Reuse the target project's existing runner.
- Never emit markdown image links for missing or unverified files. Keep their
  checklist entries blocked until evidence is current.
- Create a unit asset directory only when its first asset is written. Never
  create empty directories, `.gitkeep`, or a compatibility symlink.
- Record lifecycle/source metadata, `git_head`, and `generated_at` in every
  frontmatter block. HEAD is provenance, not the sole freshness/lifecycle key.

### MUST NOT
- Duplicate `_refs/orchestration/tail/auto-docs.md` (change-scoped execution
  records) — the user guide is a timeless end-user reference.
- Duplicate `sdcorejs-explore` (project brief) — READ `summary.md` as context, never replace it.
- Claim screenshots were captured or verified without current
  `ui_capture_context` and passing assertions.
- Start or modify the target app runtime unless the user explicitly asked for
  that exact action.
- Write any artifact into the `sdcorejs-agent` repo (the agent repo holds skills, not project content).
- Invent routes, permissions, or field names not found in the harvest — prefer "<localized text>" over fabrication.
- Force CRUD/screens onto a role, task, state, journey or API-only scope, or
  include framework inventories in an end-user guide.

## Related

- `_refs/shared/user-guide-template.md` — per-module + aggregate templates + pandoc export command
- `_refs/shared/documentation-layout.md` — Layout v2 path, migration,
  aggregate-link, export, and containment contract
- `_refs/documentation/documentation-profile.md` — audience/scope selection,
  generated ownership and preservation of manual edits
- `sdcorejs-explore` — discovery engine used by Mode 3 (legacy reverse-engineer)
- `_refs/orchestration/tail/auto-docs.md` — change-scoped execution-record tail
  (distinct from evergreen guides)
- `sdcorejs-explore` — canonical project brief (read as context before writing guides)
- `sdcorejs-ship` — invokes Mode 2 exactly once only when module guides changed,
  an aggregate rebuild was explicitly requested, or an approved-scope aggregate
  is known stale

## Mode 2 — Aggregate build + export

### 1. Trigger

**Automatic** after all Mode 1 updates when at least one module guide changed,
and before final verification. It may also run once when the aggregate is known
stale inside approved scope. An unrelated ship operation does not rebuild it.

Also triggered **manually**: "build aggregate user guide", "export user guide docx/pdf", "build user guide", or any explicit request to produce the aggregate or export to DOCX/PDF.

### 2. Select current guides before assembling

Each per-module guide records lifecycle/source metadata plus `git_head`.
Before assembling, compare its `change_ref`, source spec/plan, target paths,
current relevant diff, and capture evidence. `git_head` is an additional
provenance signal:

```bash
CURRENT_HEAD=$(git -C <target> rev-parse HEAD)
```

Refresh only an in-scope guide when related source/requirements/captures changed or its
relationship metadata is stale. A different `git_head` caused only by unrelated
changes does not force a refresh; a matching `git_head` does not prove the
guide/capture is current.

Do not recapture unrelated stale modules. Report them if relevant to the
requested aggregate.

### 3. Assemble the aggregate

Discover exact per-module entries (after step 2 has refreshed in-scope stale
ones):

```bash
artifact.read canonical exact shape: <target>/.sdcorejs/documentation/user-guides/<module>/<module>.md
artifact.read transitional exact shape: <target>/.sdcorejs/documentation/user-guides/<module>.md
# Exclude examples, attachments, diagrams, images, assets, and _shared.
# Read metadata first. Resolve equivalent canonical/legacy copies to canonical;
# block conflicting copies.
```

For separate module repositories, do not scan or create portal-side editable
copies. Use `buildMultiRepositoryDocumentationAggregate` with one contribution
per module. A contribution is either a repository link pinned to the exact
module revision or a validated versioned export containing repository ID,
module ID, canonical source path, source revision, export version, guide hash,
assets, and current image evidence. Missing, duplicate, stale, hash-mismatched,
or colliding contributions block the build. The portal output is a generated,
non-editable projection and preserves per-module provenance.

Build `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md` from the **aggregate template** in `_refs/shared/user-guide-template.md`:

1. **YAML frontmatter** — set Artifact Lifecycle metadata, `title` (project
   name from relevant context / ask if absent), `generated_at`, `git_head` as
   provenance, `modules` (sorted), and summed `coverage`.
2. **`## Table of contents`** — numbered list linking to each `## <Module>` section anchor.
3. **`## System Overview`** — 1-2 sentences: what the system does, who it is for (read from `.sdcorejs/summary.md` if it exists; otherwise write best-effort from module titles).
4. **One `## <Module>` section per file** — insert each selected module body
   after stripping frontmatter, shift headings below the module heading, and
   structurally rewrite unit-local Markdown/HTML links for the aggregate.
   `images/list.png` becomes `user-guides/<module>/images/list.png`, while
   `../../_shared/diagrams/system-flow.png` becomes
   `_shared/diagrams/system-flow.png`. Do not rewrite external URLs, anchors,
   absolute paths, fenced code, or inline code.
5. **`## Coverage vs requirements summary`** — sum each module's counts only
   when every source records selected approved coverage. Propagate any gap or
   conflict with null totals and its reasons; never treat missing approval as
   zero requirements satisfied:

```markdown
## Coverage vs requirements summary
| Module | met ✅ | partial ⚠️ | missing ❌ |
|---|---|---|---|
| <module1> | <met> | <partial> | <missing> |
| **Total** | <sum_met> | <sum_partial> | <sum_missing> |
```

Update the aggregate frontmatter `coverage` block with the summed totals.

Pass the rendered aggregate through `planDocumentationUpdate`. A complete
replacement of an existing aggregate requires a matching explicit generated
ownership receipt. A manual edit invalidates that receipt; preserve the
existing aggregate and report the conflict/proposal. Creation and repeat builds
must retain producer hashes. Never append or overwrite unconditionally.

### 4. Export to DOCX / PDF

Before writing the aggregate, validate every emitted local link stays below the
documentation root and exists. A conflict, traversal, broken link, or stale
verified-image relationship blocks aggregate output and export. Build the
aggregate helper's `verifiedImageEvidence` inventory only from current structured
`ui_capture_context` and `artifact_context` lifecycle evidence. Each accepted
record preserves schema version 1, `capture_id`, `change_ref`, `guide_path`,
the current `associated_HEAD_or_diff`, exact `source_revision` and
`app_revision`, explicit `evidence_origin`, runner and real-UI persona provenance,
target-state/PII assertions, redaction state, and `image.file`, `image.kind`,
`image.sha256`, dimensions, existence, non-empty, and decodable status. A bare
path list, self-asserted `decodable`, or file existence alone is not
verification. Confirm the current image bytes match the hash and dimensions and
pass format decoding.

For an approved export, build a process argument array from
`_refs/shared/documentation-layout.mjs`. The resource root is
`<target>/.sdcorejs/documentation`. Do not shell-concatenate target paths; keep
spaces and Unicode in one argument. `_refs/shared/user-guide-template.md`
contains correct POSIX and PowerShell display forms.

**The skill does NOT run pandoc or start the target app unless explicitly
asked.** Before export, it reports missing/stale images and requests
`sdcorejs-test (ui-evidence-capture)` for those assets using the target
project's existing runner. Export only verified images; blocked images remain
unlinked checklist items.

Report DOCX and PDF capabilities/results separately. Verify exit status,
non-empty parseable output, and actual embedded images. Bind verification to the
exact aggregate SHA-256 and compare the reported embedded path manifest with
image syntax in that aggregate; ordinary download links to image files are not
embedded-image evidence. A missing Pandoc or PDF engine is skipped/blocked,
never pass.

When invoked from `sdcorejs-ship`, rebuild only under the Mode 2 trigger above.
Ask before running an export command (a ship may not need DOCX/PDF):
> "<localized text>"

When explicitly triggered manually for export, that request supplies export
approval. Aggregate rebuild and export remain separate results.

---

## Mode 3 — Legacy reverse-engineer

### 1. Trigger

**Manual only.** Fire this mode when the user says:
- "read the whole project and write the user guide"
- "write user guide for a legacy project"
- "reverse-engineer user guide"
- or any equivalent request to produce guides for an existing/legacy project
  where no spec, plan, or current change context exists.

### 2. Harvest the whole project via `sdcorejs-explore`

Delegate ALL discovery to `sdcorejs-explore` (read-only architecture-discovery skill). Do NOT re-implement route/permission/entity/screen globbing here.

```
Invoke: sdcorejs-explore
Mode:    code-map with the Documentation harvest add-on
Purpose: full project inventory — modules/libs, routes + controllers, permission codes,
         screens, shared components, base classes, path conventions
Output:  module list + per-module facts used as the harvest basis for step 3
```

If the `sdcorejs-explore` output lacks a `Documentation harvest` section, rerun
`sdcorejs-explore (code-map mode)` and explicitly request the documentation
harvest add-on. If facts needed by a selected scope are still unresolved after
that harvest, keep the unit and mark those values as `unknown - fill manually`;
do not probe from this reference or treat absent optional UI/entity data as a
mandatory gap.

### 3. Render per-module guides

For **each module** discovered by `sdcorejs-explore`, render
`<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md` from the
per-module template in `_refs/shared/user-guide-template.md`, best-effort from
the harvested facts.

Select audience and scope from the harvested evidence, then fill frontmatter
and applicable profile sections as in Mode 1, Step 3. Use the same safe-update
contract for existing guides. Do not invent routes, permissions, fields, roles
or transitions. Keep framework inventories in technical docs. A value needed
for the selected scope but unresolved from evidence remains an explicit gap.

**FLAG unresolved evidence explicitly.** When facts required by the selected
scope could not be resolved from the harvest, add a prominent notice. The lack
of routes/screens is not a gap when the selected behavior has no UI:

```markdown
> ⚠️ **Harvest incomplete** — some facts needed for the selected documentation scope
> could not be resolved. The sections below are best-effort;
> a developer should verify and fill in the missing details manually.
```

Do not silently omit such modules — include them with the flag so the gap is visible.

### 4. Run Mode 2 — Aggregate build

After all per-module guides are written, immediately run **Mode 2** to assemble `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md` from the full set of per-module guides. Follow all Mode 2 steps (assemble, frontmatter, coverage summary, pandoc export offer).

### 5. Coverage section — legacy authority gap

Legacy discovery often lacks a verified current approved spec. Apply Mode 4's
selector; when approval is unavailable, use its explicit gap outcome and keep
code observations outside approved requirement coverage:

```markdown
> Reverse-engineered observations are available. Approved requirement coverage
> is not assessed without a verified current approved spec.
```

A PRD or ticket alone does not remove this gap. Load it as supporting provenance
or proposals. Only a verified current approved spec and active accepted AC IDs
permit the approved coverage table and counts.
