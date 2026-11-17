# Visual library expansion

Change scope: extend the existing `sdcorejs-design` reference library from 12
families / 23 variants / six paired comparisons to 22 families / 42 variants /
12 paired comparisons. The six themes and 25 public skills are unchanged.
The baseline is `9af8f5842d0a142b301eec4e05ca99efbf56201c`.

## Source intake

- [Meta Astryx](https://github.com/meta/astryx/tree/ad1fb5089f6b287f0199e7cb4796a9ec86a6166b), MIT:
  nine template descriptions inform original HTML compositions. Messaging and
  review workspace descriptions carry `isReady: false`; these are structural
  references, not supported production implementations.
- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/e59ff376a41f7ca47b7541ad5c116495cbade3ee), MIT:
  the FAQ/documentation, marketplace/directory and lead-form recommendations
  inform the expanded website records. Older source pins remain unchanged.
- Source bytes are bound in `_refs/design/visual-library/sources.json`; full
  MIT notices ship under `licenses/`. Sixteen research files were checked
  against Git blob identities from the exact upstream trees. The normal
  intake verifier also checks every retained source against its SHA-256.

At the pinned UI UX Pro Max revision, CSV record counts excluding headers are:
34 landing patterns, 89 styles, 192 color palettes, 74 typography pairings,
25 chart recommendations, 120 UX guidelines and 32 app-interface guidelines.
These are recommendation records, not that many complete HTML templates.
`upstream-counts.json` binds the counted files; only selected recommendations
are adapted into the shipped library.

## Verification scope

Baseline library checks passed. Before implementation, the four expansion
checks failed for absent task mappings, board input, examples and provenance.
The same checks run against the candidate alongside existing negative controls.
Browser verification covers all variants and states, narrow widths, 200% text,
settings edits retained across section changes, file search, keyboard FAQ, and
absence of remote HTTP requests and page-script errors. Screenshots remain
local review evidence, not consumer acceptance or production screenshots.

The new source manifest and receipt describe this change only. Historical
design, visual-polish and NVIDIA evaluation reports remain untouched. Static
NVIDIA quality, independent review and deterministic/browser checks are separate
evidence classes. No new provider-backed A/B trial, production integration,
full assistive-technology certification, npm publication or merge is claimed.
