# User-Guide Templates (for `sdcorejs-documentation (write-user-guide mode)`)

Templates the documentation skill renders in `write-user-guide` mode. Load
`_refs/shared/documentation-layout.md` and
`_refs/documentation/documentation-profile.md` with this template. Per-module guides
live at
`<target>/.sdcorejs/documentation/user-guides/<module>/<module>.md`; the aggregate lives at
`<target>/.sdcorejs/documentation/sdcorejs-user-guide.md`.
Markdown is canonical; approved DOCX/PDF export uses the argument-array contract
at the bottom. Screenshots are
captured and verified by `sdcorejs-test (ui-evidence-capture)` through the
target project's existing browser runner.

Write generated prose in the user's runtime language. Keep this reusable template English-only.

## Adaptive Guide Template (.sdcorejs/documentation/user-guides/<module>/<module>.md)

Call `selectDocumentationProfile` before rendering. The module storage unit is
unchanged; `documentation_scope` selects module, entity, feature, task, role,
state or journey content and `documentation_audience` records its intended
reader. Use only returned section IDs supported by inspected source evidence.
Replace the placeholders below with those sections; do not emit every possible
section. Technical/API consumers use the technical-doc reference instead.

| Selected scope | Body sections to render from evidence |
|---|---|
| `module` | Purpose, capabilities and tasks |
| `entity` | Records and reader-relevant fields/actions |
| `feature` | Goal, behavior and outcomes |
| `task` | Goal, prerequisites, steps and outcome |
| `role` | Responsibilities, allowed tasks and access restrictions |
| `state` | State meanings, allowed transitions and outcomes |
| `journey` | Goal, ordered steps, handoffs and completion |

Screens, field tables and permission tables are optional evidence-based aids.
Do not manufacture list/detail/create/update screens or require a screenshot
for a task without a UI. Framework inventories belong in technical docs only.
The managed body below is suitable for a newly created guide. For an existing
document, use its established markers/ownership or return a precise proposal;
never insert these markers around existing human text to claim ownership.
Keep previous generated-body hashes and exact document hashes as producer
evidence. Preserve human frontmatter unless a narrow metadata patch is approved.

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
documentation_profile_version: 1
documentation_scope: <selected-scope>
documentation_audience: <selected-audience>
title: <Feature title>
tracks: [<observed-track>]
generated_at: <ISO8601>
git_head: <sha>
routes: []
permissions: []
entities: []
screens: []
spec_refs: [<related-approved-spec-path>]
prd_refs: []
coverage: { status: gap, total: null, met: null, partial: null, missing: null }
---

<!-- sdcorejs:managed:guide-body:start -->
# <Scope title> - User Guide

## Overview
<Describe the selected audience's goal and supported behavior in plain language.>

## <Selected profile section title>
<Explain the evidenced steps, responsibilities, states, handoffs or behavior.
Render as many supported profile sections as needed, using actual titles.
Include prerequisites, access restrictions, visible inputs, results and recovery
only when the source supports them. Omit inapplicable fields or screens.>

<If a verified UI state helps this task, render
`![<Observed UI state>](images/<screen>.png)` only when current
`ui_capture_context` verifies the target state, auth provenance, PII screening,
image hash, change identity, and same-unit containment. Otherwise omit the image
link.>

## Coverage vs Requirements
<Call selectDocumentationCoverage with trusted host current-spec verification
receipts. Render this table only for selected active accepted ACs. For gap or
conflict, explain the blocker and retain null counts. Keep PRD/ticket proposals,
provenance and observed code behavior outside approved coverage.>
| AC ID | Approved criterion | Current spec identity | Status | Documented in section |
|---|---|---|---|---|
| AC-001 | <accepted criterion> | <artifact ID and approval hash> | <evidenced status> | <actual section title or gap> |

## Illustration Image Checklist
<Omit this entire section when no UI evidence is required.>
- [ ] `images/<observed-state>.png` - <required state and evidence blocker>

Capture evidence request: `sdcorejs-test (ui-evidence-capture)` using the
target project's existing runner, environment key reference, logical persona,
route/target state, and approved output path.
<!-- sdcorejs:managed:guide-body:end -->
````

Pass the rendered content through `planDocumentationUpdate`. On existing guides,
replace only owned managed bodies with matching prior hashes; keep manual text
before/after them unchanged. Whole-document replacement needs explicit generated
ownership bound to the current bytes. An unmarked guide defaults to a proposal,
and malformed markers or edited generated content conflict without writing.

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
documentation_profile_version: 1
documentation_scope: <scope-supported-by-aggregate-sources>
documentation_audience: <intended-reader>
title: <Project name> - User Guide
generated_at: <ISO8601>
git_head: <sha>
modules: [<module1>, <module2>]
coverage: { status: gap, total: null, met: null, partial: null, missing: null }
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
<Sum counts only when each source has selected approved coverage. Propagate
any gap/conflict with null totals; do not convert missing approval to zero.>
| Module | Met | Partial | Missing |
|---|---:|---:|---:|
| <module1> | 5 | 1 | 0 |
````

An aggregate is a generated projection with source provenance. Rebuilding an
existing aggregate requires a matching whole-document generated-ownership
receipt or existing managed blocks. If human edits invalidate that receipt,
retain the aggregate and report a conflict/proposal; never overwrite it
unconditionally. Remove source managed-marker delimiter lines when composing
the projection so repeated block IDs from separate guides cannot become nested
or duplicate ownership claims. Do not remove or rewrite their body content.

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
