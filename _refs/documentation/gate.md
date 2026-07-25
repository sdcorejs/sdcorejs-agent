# User/Technical Documentation Approval Gate

Internal reference loaded by track executors after the test decision and before
user-guide or technical-doc generation. This file is not a dispatchable skill.

## Purpose

Make creation of end-user and technical documentation explicit and consistent.
This gate controls:

- `user-guide`: task-oriented docs for end users, admins, support staff, or
  operators.
- `technical-doc`: developer/operator-facing docs such as architecture docs,
  API docs, integration docs, deployment docs, runbooks, troubleshooting docs,
  configuration docs, and security docs.

This gate does **not** control `code-documentation`. Angular, NestJS, and
Next.js track skills automatically apply `code-documentation` when they create
or modify source code. Source-code documentation must not require a separate
approval gate.

Applies to direct or approved executor runs that write code or tests:

- `sdcorejs-angular`
- `sdcorejs-nestjs`
- `sdcorejs-nextjs`
- `sdcorejs-test` direct invocation or test-only approved plans

Do not use this gate for read-only review, brainstorming, spec, plan, explore,
or documentation-only requests.

## Preference File

Project-local preferences live in:

```text
<target>/.sdcorejs/documentation/preferences.md
```

Suggested file shape:

```markdown
---
version: 2
updated_at: <ISO-8601 timestamp>
source: sdcorejs-documentation-gate
ask_each_time: false
user_guide: ask       # ask | update | skip
technical_doc: ask    # ask | update | skip
requirement_record: ask
---

# Documentation Preferences

Saved by the SDCoreJS documentation gate. Preferences can default updates of
existing docs, but they never silently authorize creating a missing user-guide
or technical-doc for a new feature.
```

If an older preference file contains `comment_code` or `code_documentation`,
treat those keys as legacy source-code documentation preferences. Ignore them
for this gate and drop them the next time preferences are saved.

## Decision Flow

1. Resolve `TARGET_ROOT` from the target project, not from `sdcorejs-agent`.
2. Identify the feature/module/scope touched by the current code-writing run.
3. Probe for corresponding docs:
   - user guide: `<TARGET_ROOT>/.sdcorejs/documentation/user-guides/<module>.md`
     or another existing guide whose frontmatter/title/source refs match the
     touched module or feature.
   - technical doc: files under
     `<TARGET_ROOT>/.sdcorejs/documentation/technical-docs/` whose name,
     frontmatter, title, or source refs match the touched module, API, feature,
     integration, configuration, or architecture surface.
   - verified screenshot/UI evidence: current `ui_capture_context`,
     `test_evidence.captures`, and `artifact_context` for images referenced by
     the corresponding guide.
4. If this is a new feature and either corresponding doc is missing, ask the
   approval gate below before creating any missing file.
5. If corresponding docs already exist, saved preferences may default whether
   to update them. Current-turn explicit instructions still override saved
   preferences.
6. If the current request explicitly asks to create or update `user-guide` or
   `technical-doc`, treat that as approval for the requested doc type and report
   it before writing.
7. If a `TASKID`, task id, ticket id, or issue id is present, write/update the
   requirement record through `_refs/documentation/write-requirement.md`
   without blocking the user-guide/technical-doc gate.

Current-turn explicit instructions override saved preferences. Examples:
"skip docs this time", "create both docs", "technical doc only", "do not save".

## Approval Gate Prompt

Localize the prompt. Ask immediately after the final test approval/decision
step and before any user-guide or technical-doc file is generated.

When a new feature has no corresponding docs:

```text
Documentation approval gate:
This appears to be a new feature and I did not find an existing corresponding `user-guide` or `technical-doc`.

Should I create documentation for this feature?

Options:
1. Create/update `user-guide` - task-oriented documentation for end users, admins, support staff, or operators.
2. Create/update `technical-doc` - developer/operator-facing documentation for architecture, API, integration, deployment, troubleshooting, configuration, or security.
3. Create both - create/update both `user-guide` and `technical-doc`. [Recommended for user-visible features with developer-facing behavior]
4. Skip new user/technical docs for this change - no new user-guide or technical-doc file will be created.

Reply with `1`, `2`, `3`, or `4`.
```

When one or both corresponding docs already exist, use the same options but
replace the second sentence with:

```text
I found existing corresponding documentation:
- `user-guide`: <path or "missing">
- `technical-doc`: <path or "missing">
```

For existing docs, selected options mean update. For missing docs, selected
options mean create. Option `4` means do not create missing docs and do not
update existing user/technical docs unless the current request explicitly asked
for that update.

## Default Choices

If the user says "you decide" or accepts the recommended path, resolve the
choice to the caller contract immediately:

```yaml
user_guide: create | update
technical_doc: create | update | skip
requirement_record: ask
save_preference: no_for_new_doc_creation
```

Set `user_guide=create` when the corresponding guide is missing and the user
approved the recommended path; set `user_guide=update` when it already exists.

Set `technical_doc=create` when the corresponding technical doc is missing and
the source evidence changed something future developers/operators need outside
the code diff. Set `technical_doc=update` when the corresponding doc exists and
the same criteria are met. Set `technical_doc=skip` when none of the criteria
apply. Examples of qualifying evidence include:

- public API routes, request/response contracts, permission codes, or errors
- architecture decisions, module boundaries, integration flows, queues, jobs
- setup, deployment, configuration, security, or troubleshooting behavior
- reusable utilities, helpers, fixtures, page objects, or test harness
  conventions
- non-obvious cross-file behavior that code comments/user guide cannot capture
  well

If none applies, skip technical-doc and report the reason. Do not write a
template-only technical doc.

## Outputs For Callers

The gate returns these effective choices to the calling orchestrator:

```yaml
documentation:
  user_guide: create | update | skip
  technical_doc: create | update | skip
  requirement_record: ask | write | skip
  task_id: <TASKID> | null
  user_guide_path: <path> | null
  technical_doc_path: <path> | null
  preference_saved: true | false
  preference_path: .sdcorejs/documentation/preferences.md | null
```

The caller then runs documentation tail steps in order:

1. `sdcorejs-documentation (write-technical-doc mode)` when
   `technical_doc=create` or `technical_doc=update`.
2. `sdcorejs-documentation (write-requirement mode)` when a `TASKID` exists or
   the user agrees to record the requirement and provides `TASKID`.
3. `sdcorejs-documentation (write-user-guide mode)` when
   `user_guide=create` or `user_guide=update`.

When the selected guide requires a new or refreshed screenshot, the
documentation workflow calls `sdcorejs-test (ui-evidence-capture)` and reuses
the target runner. A screenshot is verified only when its target-state,
auth-provenance, PII-screening, hash, and current-diff evidence pass. Otherwise
the guide keeps a blocked checklist entry and no image link.

Use `_refs/documentation/write-technical-doc.md`,
`_refs/documentation/write-user-guide.md`, and
`_refs/documentation/write-requirement.md` for the actual documentation work.

## Rules

- Never ask about `code-documentation` here. Track skills apply it
  automatically for touched source code.
- Never create a missing corresponding `user-guide` or `technical-doc` for a
  new feature without current-turn approval from this gate or an explicit user
  request.
- Existing corresponding docs may be updated when saved preferences or current
  request authorize updates.
- Skipping user/technical docs does not skip source-code documentation,
  acceptance verification, branch hygiene, auto-docs, task tracker updates, or
  memories.
- Never write preferences into the `sdcorejs-agent` authoring repo unless that
  repo is explicitly the target project.
- Do not store secrets, tokens, local absolute paths, or private environment
  values in `.sdcorejs/documentation/preferences.md`.
- Treat mojibake in prompts or saved preferences as blocking; fix it before
  continuing.
