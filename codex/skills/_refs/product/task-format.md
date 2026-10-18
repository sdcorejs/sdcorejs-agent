# Task format

Every task produced by the `task-breakdown` mode uses this format, in this
order, for every role and every project. Validators check the keys in
`_refs/product/task-breakdown/task-format.mjs` (`TASK_SECTION_KEYS`,
`TASK_META_KEYS`); display labels are localized from `SECTION_LABELS`.

## Title

`<role prefix> <action> <object>`, for example `[FE] Show settlement status on
the contract list`. The role prefix comes from `task-breakdown.config.md`.

## Header meta

| Key | Content |
|---|---|
| `task_id` | `<project-slug>/<SOURCE-KEY>/<role>/<NN>`, stable across re-runs |
| `role` | Role id from the project config |
| `source_refs` | Story keys, PRD section ids, acceptance criteria covered |
| `size_points` | Fibonacci point from `_refs/product/sizing-rubric.md` |
| `confidence` | `verified` (code ref and date), `stale` (code ref and commits behind), or `none` (note why code was not read) |
| `suggested_assignee` | Name and the reason for the suggestion |

## Sections

All twelve sections are always present. A section with nothing to say contains
the localized None label (`noneLabel`), so the reader knows it was checked.

| # | Key | What to write |
|---|---|---|
| 1 | `tldr` | Two or three sentences: what to build, for whom, the result |
| 2 | `context` | Only the PRD content this role needs, distilled, with a link to each source section |
| 3 | `scope` | In scope and out of scope for this task |
| 4 | `work_items` | Checklist by screen, route, file, component, endpoint, schema, or job; name existing files to change and files to create when code was read |
| 5 | `rules_data` | Table: display label, API field, type, rule, source |
| 6 | `done_criteria` | Testable acceptance criteria for this role, with their ids |
| 7 | `dependencies` | Table: item, type (API, other task, design, PRD, config or data), status (available, waiting, no owner), ticket, what can start before it is ready |
| 8 | `confirmations` | Table: question, who to ask, interim assumption, blocking or not |
| 9 | `risks` | Regression risk, shared components, missing PRD parts, residual risks |
| 10 | `estimate` | Points plus the rubric breakdown, and days only when velocity is configured |
| 11 | `sources` | What was read (PRD sections, API specification environment and date, code ref) and what could not be read |
| 12 | `traceability` | Stories, acceptance criteria, and related tickets |

Write in the project language from `project.md` (default: the user's language).
Keys, ids, field names, and code stay as they are.

## API status in `dependencies`

For each API the task needs, record the method and path (and operation id when
an API specification is available) and whether it already exists. When the
specification and the PRD disagree, follow the specification for names and
types, keep the PRD for business meaning, and add a confirmation row for the
backend owner. A missing API or field is a dependency row with status
`waiting` and the backend ticket when one exists.

## Rendering on a tracker

Rendering rules come from `task-breakdown.config.md` (`rendering`), never from a
provider-specific default:

- `format`: the tracker's native rich-text format or Markdown.
- `checkbox_supported`: when false, render checklists as plain bullets, because
  some trackers turn Markdown checkboxes into literal text.
- `media_strategy`: `append` when rewriting the description in Markdown would
  drop existing images or attachments; the skill then appends its owned
  section in the native format instead of replacing the description.
- Owned regions are wrapped in begin and end markers that carry the task id
  (`mergeOwnedRegion` in `_refs/product/task-breakdown/identity.mjs`). Use the
  `text` marker style when the tracker strips HTML comments.

The persisted `tasks/<scope>.md` file always keeps the full Markdown version,
which is the source of truth when a ticket is edited by hand.

## Data block and rendered document

`tasks/<scope>.md` is generated, not hand-written. A `json sdcorejs-task-breakdown`
fenced block holds the data: `schema_version`, `project_slug`, `scope`,
`language`, `title`, `updated_at`, `redaction_applied`, an optional
`preamble`, `tasks` (meta, title, the twelve keyed sections, the rubric
`breakdown`, `covers`, `waiting_on`), `coverage`, `tombstones`, and
`tickets` (task id to ticket key and read-back result).

- The readable task text is `renderTask` of each task in the project language.
  `check tasks` compares the rendered task sections byte for byte with the data
  block, so edit the data and render again instead of editing the text.
- `renderTask(task, {format: rich-json})` renders the same content as a
  minimal node tree (paragraph, heading, bullet list, table, code) for trackers
  that store rich documents; `check merge` uses it for those tickets.
- Each approved write plan is a `json sdcorejs-write-plan` block, one per run id.
  Adding it or updating `tickets` keeps the document valid.
- Get the whole document from `check tasks -` (`result.document`) and write it
  exactly.
