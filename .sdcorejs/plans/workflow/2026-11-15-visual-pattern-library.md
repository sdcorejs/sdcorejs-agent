---
allowed_paths:
  - _refs/design/**
  - _refs/sdlc/visual-companion/**
  - _refs/sdlc/visual-screen.schema.json
  - _refs/sdlc/static-visual-composer.mjs
  - _refs/sdlc/static-visual-composer.md
  - _refs/sdlc/visual-companion.md
  - _refs/sdlc/visual-offer-policy.md
  - _refs/shared/design-handoff.mjs
  - _refs/shared/design-handoff.md
  - _refs/angular/write-code/input-analysis.md
  - _refs/nextjs/build-website/write-code/pages-and-blocks.md
  - skills/shared/sdlc/01-brainstorming.md
  - skills/tracks/design/sdcorejs-design.md
  - test/e2e/**
  - authoring/tools/prepare-design-sources.mjs
  - authoring/evals/design-visual-library/**
  - scripts/eval-visual-offer.mjs
  - package.json
  - README.md
  - CHANGELOG.md
  - VALIDATION.md
  - .claude/**
  - plugin/**
  - codex/**
approval_source: delegated-session-scope
approved_architecture_hash: sha256:v1:0c3b059a8ca79440f8ac8864f1ff9d4be65531fe81913e7d382781a41c6b4771
approved_at: 2026-11-15T10:04:20.837Z
approved_by: null
approved_spec_hash: sha256:v1:cd983c02bcf651bf36a77998c184e4a6280fd8361de6afd84ea7d6e2a9fdf82b
architecture_gate:
  blocker_messages: []
  blockers: []
  bypass: null
  rationale: A typed pattern preview extends the shared screen contract and
    carries selection identity across static/live and design handoffs.
  required: true
  signals:
    - public-api-contract
    - security-trust-boundary
    - state-data-ownership
  status: required
  valid: true
artifact_id: plan-visual-pattern-library-r1
artifact_kind: plan
change_ref: visual-pattern-library-20261115
commit_policy: with-change
contract_id: visual-pattern-library-20261115
dependency_changes:
  required: false
document_review_performed: false
env_changes:
  required: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
execution_policy: sequential-parent
instruction_reference: "User requested business-first visual templates, HTML
  choices, sources from sdcorejs-angular and portal-template; after reviewing
  the concrete planning summary, instructed: begin implementation and then
  independent review (2026-11-15)."
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
migration_changes:
  required: false
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:0c3b059a8ca79440f8ac8864f1ff9d4be65531fe81913e7d382781a41c6b4771
    artifact_id: architecture-visual-pattern-library-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: a71251fc03890326af14afd496d5955cc30ccc20
parent_repository_id: null
phase_count: 7
prohibited_paths:
  - package-lock.json
  - site/**
  - .env
  - .env.*
repository_relative_path: .sdcorejs/plans/workflow/2026-11-15-visual-pattern-library.md
requirement_id: R-001
schema_version: 1
source_architecture: .sdcorejs/architecture/workflow/2026-11-15-visual-pattern-library.md
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: .sdcorejs/specs/workflow/2026-11-15-visual-pattern-library.md
stack_profile: markdown-skill-pack
supersedes: null
task_count: 7
track: workflow
approval_hash: sha256:v1:a09547deef79b55d205fc6ec10e8f27f93d3a948ba0d8326cf74f06d7fb6b110
---
# Visual pattern library — approved implementation plan

User requested business-first visual templates, HTML choices, sources from sdcorejs-angular and portal-template; after reviewing the concrete planning summary, instructed: begin implementation and then independent review (2026-11-15).

The following scoped proposal is adopted for implementation. Its historical planning-only language describes the earlier planning turn; current authority is recorded above. No user review of these generated snapshot bytes is claimed.

# Visual pattern library and HTML design choices — implementation proposal

Status: planning proposal, not an approved execution snapshot.
Date: 2026-11-15. Target: `/workspace/sdcorejs-agent`.
Baseline HEAD: `a71251fc03890326af14afd496d5955cc30ccc20`, with existing uncommitted work preserved.
User-confirmed priority: business applications first, with website examples.
Additional user-requested source: `sdcorejs/portal-template`.

## Intended result

Given a feature brief, the existing SDCoreJS skills discover the current UI and
constraints, retrieve applicable visual patterns, and show two or three useful
HTML alternatives when a visual choice is unresolved. The user can inspect
desktop/mobile and relevant UI states, select a direction, and carry that exact
choice into Design and frontend implementation. A direct preview request produces
a preview on a supported surface without another invitation.

Extend `sdcorejs-design`, Brainstorming and the existing Visual Companion. Keep
the public skill inventory at 25. This proposal authorizes no implementation,
package installation, external repository writes, publication or paid model run.
Formal spec, architecture and approved-plan identities are created in the later
execution workflow; this document does not fabricate those parent approvals.

## Findings from inspected sources

- SDCoreJS already has topic selection, design handoffs, static HTML comparison,
  a live companion and scoped invitation/decline state. The current preview
  schema supports wireframe, SVG, image, flow and table, but no reusable rich
  application-pattern view. Static image previews degrade to descriptions.
- The offer policy already says to invite at the first useful open decision.
  Its executable helper consumes model-authored booleans and alternatives; it
  does not discover those decisions from language. Improving the helper alone
  cannot establish stronger activation.
- Each existing comparison option is a button containing its preview. Adding
  interactive forms/tabs inside that button would create nested controls. The
  selection control and preview content need separate semantics.
- The previous upstream adoption explicitly excluded datasets and automatic
  palette/font/style generation. This proposal deliberately expands that
  limited reference layer while preserving established project design systems.
- Core UI patterns are shipped in `modules/pattern`, not `published-docs`.
  The current API-doc fetch path is therefore insufficient for this source.
- Portal has an existing machine-readable catalog with 15 page patterns,
  source links, applicable/avoid conditions, data shapes and states, plus a
  separate component-composition catalog. It is a useful import source, not a
  reason to recreate all its catalogs by hand.
- Portal pins Core `22.3.4`; the inspected Core repository is a separate source
  snapshot. There is an actual convention conflict: Core pattern decision E6
  forbids quick search together with external filters, while Portal catalog
  examples describe both. Record and resolve this by target version and project
  conventions; never merge the two into one supposedly universal rule.

## Source strategy and provenance

| Source / pinned revision | Reusable input | Treatment |
| --- | --- | --- |
| `sdcorejs/sdcorejs-angular@ed1aa5d7dd47991d2ed8ba911b9d69d009928b09` | `versions/v19/projects/sdcorejs-angular/modules/pattern/README.md`, `docs/`, `features/`; related `showcase/e2e/pattern/` | MIT. Canonical Core pattern structure, interaction/state constraints and component mapping. Read README -> pattern doc -> actual feature. |
| `sdcorejs/portal-template@4f9b6af51c1b0e139603c4dee7b6b5b62cdb457c` | `src/modules/page/catalog/pattern-registry.ts`, `public/catalog/page-patterns.v1.json`, `src/modules/pattern/catalog/pattern-catalog.ts`, actual feature HTML/TS, shell config and `src/styles/reference.scss` | MIT. Page compositions, examples, shell/navigation and token use. Cross-check generated catalog against source. Core version is 22.3.4. |
| `nextlevelbuilder/ui-ux-pro-max-skill@d643997c82e94742dd3bee43210b0198e8bbba3d` | Selected rows from `src/ui-ux-pro-max/data/{landing,styles,colors,typography,products,ui-reasoning}.csv` and provenance | MIT. Curated pattern/style recommendations, not a ready-made HTML component library. Keep row IDs and adaptation notes. |
| `anthropics/skills@1780c5e5a552fd4d1c9d6a7b0cab26b0c2bef064` | `skills/theme-factory/themes/` and `skills/frontend-design/SKILL.md` | Per-skill Apache-2.0 licenses inspected. Adapt six theme seeds and design/critique methods; generate original UI examples. |

Retain applicable copyright, complete license text, NOTICE when present, upstream
path/revision, source-byte SHA-256 and modification notices. Review third-party
asset rights separately; a repository license does not establish font/image/icon
rights. The first release uses system-font fallbacks and local authored shapes,
without redistributing font binaries or downloading arbitrary remote assets.
Label each entry `adapted`, `derived` or `original`; never claim generated HTML
was copied from an upstream HTML template when only a layout/theme was reused.

Use installed exact-version Core pattern files for consumer API compatibility;
use pinned source as reference when unavailable and mark the mapping unverified.
Do not install Angular to render the generic HTML preview. Do not change either
source repository or copy their installers, mock backends, credentials, fixture
storage, permission schemes or workflow instructions into consumers.

## First-release inventory

Twelve pattern families; variants belong to a family and do not inflate the count.

| ID | Family | Primary source evidence |
| --- | --- | --- |
| OP-01 | Flat/filterable list, optional summary region | Core list/product/order; Portal list-standard/list-score-filter |
| OP-02 | Hierarchical list | Core category; Portal list-grouped-tree |
| OP-03 | Master-detail / work queue | Core split/approval; Portal list-master-detail |
| OP-04 | Record detail, tabbed/related information | Core detail/customer; Portal detail-overview/tabbed/related-records |
| OP-05 | Forms: compact, grouped and line-item composition | Core form/settings; Portal form-simple/sections/line-items |
| OP-06 | Dependent-step wizard | Core flow/import/partner; Portal stepper variants |
| OP-07 | List with compact/sectioned drawer | Core drawer/customer/category; Portal drawer-compact/sections |
| OP-08 | Hierarchical selection / permission presentation | Portal roles-tree/roles-matrix; only when that task is requested |
| WEB-01 | Product landing | Selected UI UX Pro Max landing patterns, original HTML |
| WEB-02 | Service landing | Selected content/action patterns, original HTML |
| WEB-03 | Pricing/comparison page | Selected comparison guidance, original HTML; no invented prices |
| WEB-04 | Editorial/portfolio page | Selected content/type guidance, original HTML |

Shared blocks: page/header actions; entity selection/relations; tabs/stepper;
loading/empty/no-results/error/permission states. Portal shell is a compositional
wrapper using verified source structure, with desktop and narrow-screen behavior,
not a thirteenth business feature. Reuse the consumer shell when it already exists.

Six initial optional theme seeds: Modern Minimalist, Ocean Depths, Arctic Frost,
Forest Canopy, Golden Hour and Midnight Galaxy, adapted to semantic UI roles.
Existing project tokens are the default and do not count as a new theme. Theme
Factory examples were designed partly for presentations; UI contrast, status,
focus and control roles must be completed and verified before recommending them.

At least six paired visual examples: detail page vs drawer; drawer vs split;
grouped form vs wizard where both satisfy the brief; tabbed vs sectioned detail;
tree vs matrix for an explicitly requested hierarchy; two content-led website
compositions. Compare the same data, content and viewport. Alternatives must
change a meaningful layout/interaction trade-off, not just accent color.

## Data and rendering architecture

1. **Source records:** provenance, upstream identity, license and adaptation.
2. **Pattern records:** stable ID, user job, surface, applicability/exclusions,
   data shape, required content, regions, variants, states, responsive rules,
   accessibility probes, source refs and component-map candidates.
3. **Visual recipes:** semantic tokens, typography roles, density and approved
   assets; distinguish project-token references from new-project candidates.
4. **Selection:** read compact index first; hard-filter by surface/constraints,
   then rank applicable entries with explicit reasons. Load only the selected
   two or three records. Return partial/no-match honestly. Keep existing topic
   selection for small UX fixes; do not replace it with a full-library load.
5. **HTML renderer:** trusted, reviewed primitives compose actual screen examples
   from typed data. Return standalone editable HTML and equivalent comparison
   metadata. No arbitrary upstream HTML/JS execution or a second preview server.
6. **Choice handoff:** stable decision, option, pattern and source identities,
   selection rationale, content/token bindings and rendered-artifact hashes.

Recommended implementation remains dependency-free Node for catalog/selection
and HTML composition. Start with deterministic structured ranking; defer a BM25
or embedding service until retrieval failures demonstrate a need. The model
interprets the brief, while executable code validates IDs, bounds and compatibility.

Extend the existing screen contract through an explicit versioned compatibility
path for pattern previews; keep v1 fixtures and fallback behavior valid. A new
preview identifies an allowlisted pattern/variant plus bounded typed content and
token bindings. The renderer supplies fixed interaction code. Separate option
selection from preview tabs, example buttons and viewport/state controls.
Preserve live revision validation in `visual-companion/protocol.mjs`; update its
CSP integration and `visual-companion/live-document.mjs` only where the new
rendering contract requires it. Bind static copied selections to the rendered
revision/option digest too, so an older HTML choice cannot select a newer design.
Provide a single-preview path for an already selected layout without manufacturing
extra alternatives to satisfy the comparison schema's two-option minimum.

The HTML experience shows real composition with realistic fictional/sample data,
desktop/mobile controls, relevant state switches, option labels, trade-offs and
selection feedback. Example actions are local simulations with no network or
backend effect. Labels are localized at runtime; reusable sources remain English.
Keep CSS scoped, stable content across options, visible keyboard focus, accessible
names, text reflow and reduced-motion behavior. Preserve the current content
escaping and CSP boundaries. Imported content is data, never executable behavior.

Prefer the already available native/static surface for a simple preview. Reuse
the live companion when its session is supported and consented. Browser opening
and live-runtime consent retain their existing scope. HTML selection is design
feedback; it does not approve implementation or other mutations. Missing display
capability yields a truthful text fallback, not a claim that HTML was displayed.

## Stronger preview activation

Move the assessment into the normal UI discovery sequence before settling a
layout, instead of relying on an optional subsection being remembered. Reference
one shared policy from Brainstorming, direct Design and relevant executor
discovery handoffs. The hook assesses facts; it is not a keyword-only trigger.

| Situation | Required behavior |
| --- | --- |
| Explicit request for HTML, mockups, visual options or a preview | Produce the requested preview on a supported surface; do not ask again whether to show it. |
| New screen/flow with at least two plausible layouts and an unresolved material visual choice | Offer comparison once, naming the actual alternatives before choosing a direction. |
| Existing UI improvement where density, navigation or composition changes materially | Compare against existing UI and offer relevant alternatives; preserve brand/tokens. |
| Accepted preview preference in the same scope | Present the next eligible comparison without re-inviting. |
| Declined or pending invitation across a phase/skill transition | Preserve that state; no repeated offer. |
| Factual business rule changes which alternatives are valid | Clarify that fact first, then reassess. |
| Fixed layout, typo, spacing fix, backend-only, one valid option or delegated choice | Continue directly; explicit preview requests still get an illustration of the chosen layout. |

Acceptance tests must observe actual user-facing offers and generated artifacts.
Calling `evaluateVisualOffer` with hand-authored `true` flags is not activation
evidence. Record why an eligible decision was offered, presented or suppressed
in runtime evidence; do not add a mutable repository session checkpoint.

## Implementation sequence and file ownership

Paths below are either existing inspected files or explicitly intended additions.
Changes are sequential unless later execution assigns independent ownership.

| Task | Dependencies | Owned change and expected result |
| --- | --- | --- |
| T01 Source intake and baseline | None | Add `authoring/tools/prepare-design-sources.mjs` for pinned, reviewable intake into a work directory. Inspect each selected source, license and generated/source correspondence. Capture current dirty-source manifest and real baseline scenarios before edits. |
| T02 Catalog and semantic model | T01 | Add `_refs/design/visual-library/{README.md,catalog.json,pattern.schema.json,sources.json,licenses/,patterns/,themes/,examples/}`. Define IDs and cross-source conflicts; author failing schema/retrieval cases first in intended `test/e2e/design-visual-library.test.mjs`. |
| T03 Minimal complete preview | T02 | Add `_refs/design/visual-library/{select-patterns.mjs,render-pattern.mjs}` and supporting reviewed primitives. Start with OP-01/03/07 using existing tokens. Extend `_refs/sdlc/visual-screen.schema.json`, `visual-companion/{screen.mjs,renderer.mjs,client-script.mjs}`, `static-visual-composer.mjs` and their tests. Demonstrate one real choice from retrieval through HTML to handoff before adding the rest of the catalog. |
| T04 Activation and context | T03 | Update `skills/shared/sdlc/01-brainstorming.md`, `skills/tracks/design/sdcorejs-design.md`, `_refs/sdlc/visual-offer-policy.md`, `_refs/sdlc/visual-companion.md`, and `_refs/harness/runtime-policy.mjs` only where executable behavior needs change. Extend visual-offer fixtures and runner with verified model/effort metadata. Preserve response scopes and capability fallback. |
| T05 Complete curated examples | T03, T04 | Complete the 12 families, four shared block groups, six optional themes, shell composition and six paired decisions in the library. Verify actual feature source behind each imported record. Keep demonstration business rules distinct from approved consumer requirements. |
| T06 Design and executor handoff | T04, T05 | Update `_refs/design/{frontend-design.md,uiux/index.md,uiux/sources.md}`, `_refs/shared/design-handoff.{md,mjs}`, relevant `_refs/angular/write-code/input-analysis.md` and `_refs/nextjs/build-website/write-code/pages-and-blocks.md`. Keep existing handoffs compatible and preserve exact selected visual identity. Add tests in `test/e2e/design-handoff-contract.test.mjs`. |
| T07 Verification and independent audit | T06 | Add intended `test/e2e/design-preview-render.test.mjs` and change-scoped authoring evidence. Run deterministic, browser and fresh-agent checks separately; repair findings and re-audit affected hashes. Update README/CHANGELOG/VALIDATION, synchronize mirrors using existing tooling and verify installed-pack-relative data/asset resolution. |

T03/T04 are the first delivery milestone. Review a working comparison before
spending effort on the remaining catalog. Do not complete dozens of attractive
examples while leaving trigger/selection/handoff unproven.

Update `package.json` only to register approved new verification commands if
needed; no new runtime dependency is assumed. Generated mirrors under `.claude`,
`plugin` and `codex` are produced only by `npm run sync:skills`. Verify support
for new data/assets in mirrors and published/install payloads; inspect the existing
sync/package contracts before changing them. Keep raw upstream snapshots, browser
diagnostics and large benchmark captures outside public mirrors.

## Acceptance criteria and evidence

| AC | Outcome | Tasks | Required evidence |
| --- | --- | --- | --- |
| AC-01 | Every shipped entry has verifiable provenance/license/adaptation; unresolved incompatible-source entries are not recommendations | T01, T02, T05 | Pinned file/row hashes, notices, catalog validation and conflict cases |
| AC-02 | Applicable patterns are retrieved without overriding project design, adding business scope or loading the full library | T02, T05 | Positive/negative/no-match tests; Core-version and existing-token controls; context-size measurement |
| AC-03 | HTML shows usable screen alternatives with local state and viewport previews, not only text cards | T03, T05 | Real browser captures for all 12 families at 375/768/1440 widths; relevant state tests and six meaningful paired examples |
| AC-04 | Requested previews are produced; eligible open decisions are offered before direction is settled | T04 | Fresh natural-language dialogue, actual artifacts, missed/false/redundant-offer metrics |
| AC-05 | Selection survives handoffs, declines stay declined, and clicks never grant implementation authority | T04, T06 | Multi-turn and phase-transition tests; stale option/revision rejection; exact selected artifact hash |
| AC-06 | Native/static/live/text paths preserve content and work with supported capabilities | T03, T04 | Real static and available live surface tests, clipboard failure, keyboard, no-network and fallback checks |
| AC-07 | Approved direction reaches the correct project's editable Design artifact and framework executor | T06 | Resolver/ownership tests; existing-project Core reuse and plain-stack controls; no duplicated editable source |
| AC-08 | Distribution remains 25 public skills with valid mirrors and fresh independent evidence | T07 | Existing inventory/mirror checks, source manifest, independent audit with commands/exits and explicit limitations |

Browser checks include text overflow/zoom, visible focus, keyboard navigation,
labels, state transitions, scoped styles and measured contrast for the actual
chosen color pairs. A clickable mock preview is not a real backend integration.
Originality/task fit and meaningful variation need visual review; pixel snapshots
or a static quality score alone cannot establish those qualities.

Use TDD for new selectors, typed preview behavior, handoff fields and activation
state transitions. Do not add tests that only assert documentation wording.

Existing, verified repository commands for the implementation stage:

```sh
npm run test:e2e:uiux
npm run test:e2e:visual-offer
npm run test:e2e:visual-companion
node --test test/e2e/design-handoff-contract.test.mjs
node authoring/evals/run-deterministic.mjs
npm run test:e2e:skill-authoring
npm run check:text-hygiene
npm run check:executable-references
npm run sync:skills
npm run check:skills
npm run report:communication-economy
git diff --check
```

Run new tests explicitly and add them to the relevant existing suite. Broader
checks follow affected contracts. If the known native-filesystem cleanup gate
blocks the full chained suite, report it accurately and run relevant unaffected
Angular/Next.js verification separately; never report unexecuted chain stages as
passed. Browser tooling is discovered/reused; its absence is a named gap rather
than an automatic install or a fabricated screenshot.

Proposed behavioral study: 24 scenarios (8 positive, 6 negative, 6 multi-turn,
4 surface/failure), baseline and candidate with the same model/effort/runtime.
Start with four representative scenarios in both arms: eight logical trials.
If execution and evidence capture work, complete the remaining 40 for 48 total
logical trials; reuse smoke results only if source and fixture hashes are identical.
A multi-turn trial may use more than one API request. Record all actual attempts,
usage, cost if exposed, exact commands/exits, model/effort and rendered evidence.
Set the spend ceiling in the later authorized run manifest, not by reusing the
previous unrelated 80-trial authorization. No paid calls are made for this plan.

Pilot acceptance: all explicit requests produce the supported preview; all
eligible positive scenarios offer/present appropriately; zero false offers in
negative controls; zero repeated-decline or approval violations. Report sample
size and failures rather than claiming universal reliability. Existing offline
dialogue fixtures simulate capabilities and cannot prove real browser execution.

An independent fresh-context read-only auditor reviews changed source hashes,
sources/licenses, authority boundaries, rendering and actual behavior. Run
available NVIDIA checks on the changed Design/Brainstorming and relevant shared
refs, with static quality, security, retrieval and LLM/live findings separated.
An unavailable scanner or unrun tier stays NOT RUN/INCOMPLETE.

## Planning validation and remaining work

Completed for this proposal: source/structure/license inspection, current authoring
preflight (`ready: true`, SkillEvaluator 0.9.0) and 56 existing targeted tests,
all passing, exit 0. See `baseline-tests.command.json` and `baseline-tests.log`.
These tests establish only the existing baseline. No new template, browser capture,
skill trigger fix or LLM evaluation has been implemented or certified.

Before execution: turn this proposal into the repository's scoped spec and
architecture/plan contracts, resolve source conflict records and confirm the
chosen renderer contract. Preserve all prior changes and evaluation artifacts.
The implementation target is SDCoreJS Agent; both source repositories remain
read-only references.


## Execution ownership
Parent implements sequentially; baseline and final auditor are fresh read-only agents with output confined to external work directories. Preserve the original baseline and failed checks.
