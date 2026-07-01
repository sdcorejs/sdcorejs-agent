# User-Guide Templates (for `sdcorejs-documentation (write-user-guide mode)`)

Templates the documentation skill renders in `write-user-guide` mode. Per-module guides live at
`<target>/.sdcorejs/documentation/user-guides/<module>.md`; the aggregate lives at
`<target>/.sdcorejs/documentation/sdcorejs-user-guide.md`.
Markdown is canonical; DOCX/PDF is produced by the pandoc command at the bottom. Images are
placeholders the target project fills. The agent does not run the app or capture screenshots.

Write generated prose in the user's runtime language. Keep this reusable template English-only.

## Per-Module Template (.sdcorejs/documentation/user-guides/<module>.md)

```markdown
---
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
![<Screen title>](images/<module>-<screen>.png)

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
- [ ] `images/<module>-list.png` - list screen
- [ ] `images/<module>-detail.png` - detail screen
```

## Aggregate Template (.sdcorejs/documentation/sdcorejs-user-guide.md)

```markdown
---
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
<Insert .sdcorejs/documentation/user-guides/<module1>.md content without frontmatter>

## Coverage vs Requirements Summary
| Module | Met | Partial | Missing |
|---|---:|---:|---:|
| <module1> | 5 | 1 | 0 |
```

## DOCX/PDF Export (pandoc)

DOCX:

```bash
pandoc <target>/.sdcorejs/documentation/sdcorejs-user-guide.md -o <target>/.sdcorejs/documentation/sdcorejs-user-guide.docx --resource-path=<target>/.sdcorejs/documentation/user-guides
```

PDF:

```bash
pandoc <target>/.sdcorejs/documentation/sdcorejs-user-guide.md -o <target>/.sdcorejs/documentation/sdcorejs-user-guide.pdf --resource-path=<target>/.sdcorejs/documentation/user-guides
```

- Images are placeholder paths such as `images/<module>-<screen>.png`; place real images under `<target>/.sdcorejs/documentation/user-guides/images/` before running pandoc.
- The agent does not run the app or capture screenshots. Each module guide's checklist states which screens should be captured.
