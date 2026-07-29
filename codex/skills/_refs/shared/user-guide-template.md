# User-Guide Templates (for `sdcorejs-documentation (write-user-guide mode)`)

Templates the documentation skill renders in `write-user-guide` mode. Load
`_refs/shared/documentation-layout.md` with this template. Per-module guides
live at
`<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md`; the aggregate lives at
`<target>/.sdcorejs/documentation/sdcorejs-user-guide.md`.
Markdown is canonical; approved DOCX/PDF export uses the argument-array contract
at the bottom. Screenshots are
captured and verified by `sdcorejs-test (ui-evidence-capture)` through the
target project's existing browser runner.

Write generated prose in the user's runtime language. Keep this reusable template English-only.

## Per-Module Template (.sdcorejs/documentation/user-guides/<module>/<module>.md)

````markdown
---
artifact_id: guide-<module>
artifact_kind: documentation-asset
change_ref: <change-id>
source_spec: <repo-relative-path-or-none>
source_plan: <repo-relative-path-or-none>
commit_policy: with-change
owner: sdcorejs-documentation
module: <module>
title: <Feature title>
tracks: [angular, nestjs]
generated_at: <ISO8601>
git_head: <sha>
routes:
  - { path: /<module>/<entity>, screen: list, permission: <module>_<entity>:view }
permissions: [<module>_<entity>:view, <module>_<entity>:create]
entities:
  - { name: <Entity>, fields: [code, name] }
screens: [list, detail, create, update]
spec_refs: [.sdcorejs/docs/<track>/<ts>-<topic>-spec.md]
prd_refs: []
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Feature title> - User Guide

## Overview
<Describe what this module lets the user do, in plain language.>

## Screens And Tasks
### <Screen title> - `/<module>/<entity>`
- **What the user does:** <task description>
- **Who can use it:** permission `<module>_<entity>:<action>`
- **Main fields/buttons:** <list>
<Render `![<Screen title>](images/<screen>.png)` only when current
`ui_capture_context` verifies the target state, auth provenance, PII screening,
image hash, change identity, and same-unit containment. Otherwise omit the image
link.>

## Permission Table
| Permission code | Task | Who / Role |
|---|---|---|
| `<module>_<entity>:view` | View list/detail | <role> |
| `<module>_<entity>:create` | Create record | <role> |

## Data Reference
| Field | Type | Required | Constraint |
|---|---|---|---|
| code | string | yes | unique |
| name | string | yes | <=255 |

## Special Actions
<Workflow / state transition / bulk action / export action. Remove this section when none applies.>

## Core UI Components Used
<Angular only: list the `@sdcorejs/angular` components/services/directives this module actually uses, with one concrete role per row. Remove this section for non-Angular tracks. This is the same table shown to the user after code generation.>
| Core UI | Role in this feature |
|---|---|
| `SdTable` | Shows the <entity> list with pagination, filtering, and sorting |
| `SdNotifyService` | Shows success and error feedback |
| `SdSection` | Groups fields on the detail screen |

## Coverage vs Requirements
| # | Requirement (spec/PRD) | Status | Documented in section |
|---|---|---|---|
| 1 | <acceptance criterion> | met | Screens And Tasks |
| 2 | <criterion> | partial | <gap> |
| 3 | <criterion> | missing | - |

## Illustration Image Checklist
- [ ] `images/list.png` - list screen
- [ ] `images/detail.png` - detail screen

Capture evidence request: `sdcorejs-test (ui-evidence-capture)` using the
target project's existing runner, environment key reference, logical persona,
route/target state, and approved output path.
````

## Aggregate Template (.sdcorejs/documentation/sdcorejs-user-guide.md)

````markdown
---
artifact_id: guide-aggregate
artifact_kind: documentation-asset
change_ref: <change-id>
source_spec: <repo-relative-path-or-none>
source_plan: <repo-relative-path-or-none>
commit_policy: with-change
owner: sdcorejs-documentation
title: <Project name> - User Guide
generated_at: <ISO8601>
git_head: <sha>
modules: [<module1>, <module2>]
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Project name> - User Guide

## Table Of Contents
1. [<Module 1>](#module-1)

## System Overview
<One or two paragraphs: what the system does and who it serves.>

## <Module 1>
<Insert .sdcorejs/documentation/user-guides/<module1>/<module1>.md content
without frontmatter after structurally rewriting unit-local links for the
aggregate.>

## Coverage vs Requirements Summary
| Module | Met | Partial | Missing |
|---|---:|---:|---:|
| <module1> | 5 | 1 | 0 |
````

## DOCX/PDF Export (Pandoc)

Construct the command with an executable plus argument array. The documentation
root is the `--resource-path`; do not concatenate untrusted paths into a shell
string. These displays show correct quoting for target paths with spaces or
Unicode.

POSIX DOCX:

```sh
pandoc '<documentation root>/sdcorejs-user-guide.md' -o '<documentation root>/sdcorejs-user-guide.docx' --resource-path '<documentation root>'
```

PowerShell DOCX:

```powershell
& 'pandoc' '<documentation root>\sdcorejs-user-guide.md' '-o' '<documentation root>\sdcorejs-user-guide.docx' '--resource-path' '<documentation root>'
```

POSIX PDF:

```sh
pandoc '<documentation root>/sdcorejs-user-guide.md' -o '<documentation root>/sdcorejs-user-guide.pdf' --resource-path '<documentation root>'
```

PowerShell PDF:

```powershell
& 'pandoc' '<documentation root>\sdcorejs-user-guide.md' '-o' '<documentation root>\sdcorejs-user-guide.pdf' '--resource-path' '<documentation root>'
```

- Do not run export without workflow approval.
- Block export when the aggregate has a canonical/legacy conflict, path
  traversal, broken local link, or stale verified-image relationship.
- Before export, verify every linked image through current
  `ui_capture_context` and artifact closure.
- Do not include missing or unverified image links; keep checklist entries until
  verified screenshots exist.
- Report DOCX and PDF separately. A missing Pandoc or PDF engine is skipped or
  blocked, not pass. A pass requires exit code zero, a non-empty parseable
  output, verification bound to the exact aggregate SHA-256, and an exact
  expected/embedded path manifest plus counts proving that every image emitted
  by Markdown image syntax, a used image reference, or HTML `img src` is
  embedded. Ordinary download links to image files are not embedded images.
  Missing or fabricated manifest/count evidence cannot pass.
