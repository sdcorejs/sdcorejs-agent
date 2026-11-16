# Visual pattern library

Use this library after a visual comparison is useful and requested or accepted.
It supplies original, editable HTML compositions adapted from pinned references,
not production Angular components or copied application behavior. Load
`catalog.json` first, then only selected records, not every upstream source.

## From brief to preview

1. Read the actual task, surrounding UI, installed Core version, tokens and
   constraints. Clarify a business blocker that could change the options first.
   Preserve fixed designs, approved directions and scoped visual declines.
2. Map the task: queue → `process-queue`; list → `browse-records`; inspection →
   `inspect-record`; editing → `edit-record`; dependent steps → `complete-steps`;
   hierarchy browsing → `browse-hierarchy`; explicitly requested hierarchy
   selection → `select-hierarchy`. Website jobs are `promote-product`,
   `promote-service`, `compare-plans`, and `present-work`.
3. Run `selectPatterns` with surface, job and known data shape. An unknown job
   returns `no-match`; do not force it into a template. Read applicability and
   avoid conditions. A wizard needs confirmed sequencing; a permission matrix
   never creates a permission requirement. Keep 2–3 viable alternatives using
   the same brief, content, theme and viewport. Compare spatial/interaction
   trade-offs, not accent colors.
4. A direct HTML/mockup request already establishes visual intent. Otherwise
   follow the visual-offer policy before generation. Choose a supported surface;
   static output needs no server. Reuse only consent scoped to the relevant
   artifact/runtime/browser action; preserve declines across skill handoffs.
5. Use `createPatternPreview`, a schema-v2 screen and the shared static/live
   renderer. One fixed layout uses `renderPatternDocument`; do not invent a
   second option. Localize the complete screen, all content and `PREVIEW_LABELS`,
   and supply the companion `messages` bundle for non-English output.
6. Deliver usable HTML, choices and concrete trade-offs. If HTML is unavailable,
   provide numbered Markdown and say no visual preview was delivered. A filename
   or metadata alone is not a preview.
7. Confirm feedback in conversation. Normalize copied responses with
   `formatCopiedResponse`, then call `createVisualSelection` against the current
   screen. Changed content or library revision invalidates old feedback. Live
   events retain session/revision checks; the integration owner constructs the
   response from that current published screen before binding it. A choice is
   `design-feedback-only`, never spec/plan approval.

## Executable recipes

Run relative to the installed pack root. Commands print results; the owner
chooses an authorized output location in the consuming project.

```sh
node _refs/design/visual-library/select-patterns.mjs enterprise-portal process-queue sequential
node _refs/design/visual-library/compose-preview.mjs --example queue-context
node _refs/design/visual-library/compose-preview.mjs --input preview-input.json
```

`--input` accepts a complete v2 screen or `createPatternPreview` input; the latter
renders one editable preview. The example CLI emits English teaching fixtures.
For localized comparisons use `renderStaticVisualScreen(screen, {locale, messages})`.
Six paired recipes live in `examples/`; their labels are examples, not runtime copy.

```js
import { createPatternPreview } from './library.mjs';
import { renderPatternDocument } from './render-pattern.mjs';
const preview = createPatternPreview({
  pattern_id: 'op-split',
  theme_id: 'project',
  token_refs: ['src/styles/tokens.css'],
  tokens: { accent: '#2457a7' },
  content: { title: 'Service requests', primary_action: 'New request' },
});
const html = renderPatternDocument(preview);
```

Replace sample content and tokens with actual project evidence. `project` uses
a neutral illustrative fallback until supplied tokens replace it; it does not
prove the existing design system was inspected. Themes are optional and use
system-font fallbacks, without added assets or dependencies. Keep the generated
HTML in the authorized editable wireframe location and its SHA-256 in the handoff.

The shared renderer supplies a restrained portal workbench and separate website
compositions. Website defaults use product-oriented illustrative copy. Paired
examples expose user-facing criteria; their internal constraints are not prompt
copy. Pattern comparisons keep the accessible Markdown fallback in an expandable
section. Inspect the rendered desktop and mobile HTML for hierarchy, spacing,
readability and meaningful differences before delivery. Contract tests and
evaluator scores do not establish visual quality.

Hierarchy previews require `content.hierarchy`: bounded nodes with unique `id`,
`label` and `parent_id` (null for roots), columns with unique `id`/`label`, and
`selected` leaf/column identity pairs. Tree and matrix render the same leaves and
columns. Cycles, missing parents, duplicate identities and depth beyond six fail
validation. Supply explicit domain relationships; the renderer never derives a
tree by repeating flat rows under every group.

## Coverage and boundaries

Eight operational families: list, tree, split, detail, form, wizard, drawer and
explicit hierarchy selection. Four website families: product, service, pricing
and editorial. Shared blocks cover headers/actions, related records, tabs/steps
and states. The Portal shell is a wrapper, not another family. Previews expose
desktop/tablet/mobile widths and data/loading/empty/no-results/error/unavailable
states. Local interactions do not implement business records, navigation,
authorization or a backend.

`pattern.schema.json` describes records; `preview.schema.json` describes closed
render inputs. Executable validation also resolves IDs, source references, row
widths and the current library digest. Text is escaped; arbitrary HTML, scripts,
CSS URLs and token values are rejected. One fixed CSP-hashed script supplies
interaction. No remote fonts, images, iframe or fetch is used. Verify keyboard,
contrast, localization, 200% text zoom, reduced motion and narrow layouts again
against the final consuming interface.

## Provenance and handoff

`sources.json` pins repository, commit, path, SHA-256, license and adaptation
notice; `licenses/` retains full upstream notices. Core and Portal are primary
business-pattern sources. UI UX Pro Max supplies recommendation data rather
than complete HTML templates; Theme Factory supplies adapted palettes. Rendered
compositions are newly authored. No font/image binaries ship. Recheck cached
source bytes with authoring-only `authoring/tools/prepare-design-sources.mjs
--cache-dir <cache>`; files are `<source-id>.txt`. Metadata-only exits 2, never
source-verified. Do not execute upstream source during intake.

Core and Portal disagree about quick search with external filters. Follow the
consumer's installed version and conventions; neither example is universal.
Portal's Core 22.3.4 evidence does not verify another version. Mappings remain
candidates until actual exports/source are checked. Core pattern source ships
under `modules/pattern`; missing `published-docs` is not missing implementation.

Angular receives intent, states and verified mappings. Next.js receives structure,
content and tokens, not invented Angular APIs. Preserve artifact ownership and
repository boundaries. Handoff `visual_selection` carries `{screen, response,
result}`; validation recomputes the result and rejects stale/tampered feedback.
Existing approval gates remain authoritative.

Each selected option includes `editable_preview_sha256` for the exact bytes from
`renderPatternDocument(option.preview)`. A final Design handoff must select one
option and use `editable_source.format: html` with
`artifact_hash: sha256:v1:<editable_preview_sha256>`. A different layout or later
HTML edit requires regeneration/rebinding; metadata for the wrong source is
rejected. The owner still verifies the actual file bytes at the declared path.
