# Project workspace

One repository can serve several projects, so project context lives per
project under the registry root `artifact_roots.project_workspaces`
(`.sdcorejs/projects`). Resolve paths with `resolveProjectWorkspacePaths` from
`_refs/shared/artifact-paths.mjs`; never build them by hand.

```text
.sdcorejs/projects/<slug>/
  project.md                 # project-config: name, keys, tracker, sources, glossary, language
  task-breakdown.config.md   # project-config: roles, roster, velocity, rubric weights, rendering
  tasks/<scope>.md           # task-breakdown: one file per run scope (sprint, story, ad hoc)
```

`slug` and `scope` are lowercase kebab-case, at most 63 characters, and never a
reserved device name (`isSafeProjectSegment`). A typical scope is `sprint-18`,
`demo-6121`, or `2026-10-14-adhoc`.

## Ownership and lifecycle

- `project-config` and `task-breakdown` are shared durable kinds in
  `_refs/shared/artifact-lifecycle.md`, with `commit_policy: conditional`.
- Only `sdcorejs-product` in `task-breakdown` mode writes these files. Other
  skills read them.
- The content belongs to the repository returned by `resolveArtifactOwner`
  for project-level artifacts: a standalone repository, or the portal that owns
  `.sdcorejs/**` in a portal plus module topology. When ownership is ambiguous,
  ask; never fall back silently.
- No file stores a secret, token, cookie, or password. Store key names only.

## Frontmatter

Every file starts with frontmatter that `validateProjectFileText` and
`validateProjectConfig` (`_refs/product/task-breakdown/workspace.mjs`) check:

| Field | Value |
|---|---|
| `artifact_id` | `project-<slug>`, `task-breakdown-config-<slug>`, or `task-breakdown-<slug>-<scope>` |
| `artifact_kind` | `project-config` (both config files) or `task-breakdown` (task files) |
| `change_ref` | `project-<slug>` for config files; `task-breakdown-<slug>-<scope>` for task files |
| `source_spec`, `source_plan` | `none` |
| `commit_policy` | `conditional` |
| `owner` | `sdcorejs-product` |
| `schema_version` | `1`; refuse any other value instead of guessing |
| `updated_at` | ISO-8601 timestamp |
| `redaction_applied` | boolean |

Unknown fields are preserved when the file is written again.

### `project.md`

- `project`: `name`, `slug`, `keys` (ticket key prefixes), `aliases`.
- `tracker`: `kind`, `project_key`, story and sub-task issue type names, field
  mapping for size, labels, and parent link.
- `sources`: one entry per source kind with `kind`, `match` (domain or URL
  pattern), `read_via` (`connector`, `web`, `export`, `paste`), and notes.
- `glossary`: project-specific names and abbreviations used in tickets.
- `language`: language for task text.

### `task-breakdown.config.md`

- `roles`: `id`, `label`, `title_prefix` (for example `[FE]`).
- `roster`: `name`, `roles`, `tracker_account_id`, `aliases`.
- `velocity_per_member`, `sprint_length_days`: optional, enable absolute load and days.
- `rubric_overrides.weights`: optional factor weights.
- `rendering`: `format`, `checkbox_supported`, `media_strategy`, `marker_style`.
- `tracker_notes`: free notes about tracker behavior, for example inherited
  fields that must not be set on sub-tasks.
- `run_rules`: only rules the user asked to keep "always", each with
  `persist: always`. Any other rule fails validation with `RUN_RULE_PERSISTED`.

### `tasks/<scope>.md`

The run's approved proposal, generated from its data block (see
`_refs/product/task-format.md`): one block per task in the fixed format of
`_refs/product/task-format.md`, the mapping `task_id` to ticket key, tombstones
for retired tasks, the approved write plan in its own block, and the read-back
results. This file is the source of truth for re-runs.

## First run

When the project has no workspace yet:

1. Infer what you can before asking: source kinds from link domains, tracker
   metadata (project key, issue types, size, label, and parent fields) through
   `source.read`, and roster account ids from the names the user gives.
2. Ask the remaining decisions with `user.choose`. Free-text values (project
   key, issue type names) go in the free-text option. Never ask for tokens.
3. Show a preview of both files and ask `user.approve` as its own question.
4. Run `check project -` (with `--kind`) on the exact bytes before writing each
   file, write only after it is valid, then run `check project <file>`.
5. Until the project is resolved or created, do not inventory stories or draft
   tasks.

## Updating the config later

- **Explicit command**, for example "add a member to the roster of project X":
  show the diff from `mergeProjectConfig`, then write after approval.
- **During a run**, when something new appears (an unreadable source, a new
  member, a new role): ask once with three options, `ask` (keep asking), `update`
  (save it), or `skip` (this run only).
- **Manual edit**: the user may edit the files by hand; validate them with
  `check project <file>` before use and report every error code.
- Every write of a config file runs `check project -` on the exact bytes before writing, then on the written file.

Run rules (for example "keep this person's share small this sprint") are never
saved unless the user says to apply them always.
