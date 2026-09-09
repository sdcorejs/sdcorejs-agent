---
artifact_id: execution-uiux-knowledge-20260909
artifact_kind: execution-doc
change_ref: uiux-knowledge
source_spec: none
source_plan: none
commit_policy: with-change
owner: integration-owner
---

# Shared UI/UX Knowledge Delivery

Implemented the user's supplied six-phase scope in one isolated change on
`feat/uiux-knowledge`. This is an authoring-repository upgrade, with local changes
available for review; it does not install over the user's global skills or
publish a release. The original main checkout remains clean.

## Source and scope

- Target main/base: `4fa58c66bc8b96c3ddcad887403d1eb9cfb5c8f4`.
- Upstream main inspected: `4aad0584d92131626b16d4ff4d77f0455385013c`.
- Worktree: `C:/Users/Admin/.config/superpowers/worktrees/sdcorejs-agent/uiux-knowledge`.
- Public inventory remains the same 23 source skill identities derived from the
  checked-out baseline. No `sdcorejs-uiux` public skill was added.
- The user's direct implementation scope supplied the requirements and sequence;
  this execution record does not impersonate an approved spec or plan snapshot.

The new `_refs/design/uiux/` index, topic catalog and optional offline Node
selector serve design, Angular, Next.js and independent review. They cover
navigation, tables, forms, states, visual hierarchy, charts and public web,
and reuse the mobile and shared accessibility references. Every selected rule
has a stable ID, applicability, exclusions, guidance, anti-pattern and probe.

Design now supports bounded existing-UI improvements without requiring a fresh
palette or signature for every feature. Existing tokens, components, icons,
routes, permissions and business contracts remain the evidence to preserve.
Code stays with the implementation executors; independent review stays read-only.
Q&A/backend work loads no UI knowledge, and small fixes select affected topics.

Core UI documentation lookup supports both installed package names and adds
`--exact-version`. It rejects guessed declaration ranges, conflicting explicit
versions and nonexact fallback as compatibility proof. Automatic exact detection
uses installed package metadata or resolved npm lock entries. Uninstalled
pnpm/yarn projects need an independently verified explicit version or local API
evidence. Legacy nearest-version lookup is retained with an explicit diagnostic.

UI/UX findings extend the existing finding contract with classification,
rule/evidence scope, verification and source-only limitations. Aesthetic
preferences cannot block or become automatic repairs. Convention observations
retain the existing applicable and dimension-affecting consistency behavior.
Angular/Next.js accessibility addenda now share the same standards baseline;
44px targets and 16px body text are not misrepresented as universal AA rules.

Baseline references and feature exceptions use existing reuse evidence,
decisions, handoffs, ledgers, semantic-owner resolution and closure. No new
artifact shape, root directory, registry kind or convention writer was added.

## Selective upstream adoption

Adopted topic-oriented retrieval, applicability/anti-pattern/probe structure,
explicit abstention and bounded feature exceptions. The local patterns are
newly written. The upstream MIT notice and pinned provenance are retained.

Excluded the installer, bulk CSV/code/template copying, Python/BM25 runtime,
automatic themes/fonts/icons, framework or dependency defaults, and unmatched
portal-to-marketing fallback. See
[`sources.md`](../../../_refs/design/uiux/sources.md) for the comparison table
and inspected source paths.

## Verification

Commands ran on Windows with supported Node `v24.19.0`. No validation limit,
public-skill ceiling or mandatory assertion was weakened.

| Check | Result and evidence |
|---|---|
| `npm run test:e2e` | PASSED: 627 passed, 0 failed, 1 existing Linux-only test skipped; final affected repository rerun also passed as described below |
| Repository portion | PASSED: 598/598 after the final repair, including routing, ownership, closure, review, authoring, toolchain and UI/UX evidence |
| Angular generated project | PASSED: install, typecheck, template validation, build, tests, lint and module-owner routing |
| NestJS pack | PASSED: 24 passed; case-sensitive sibling-path regression skipped on Windows |
| NestJS generated projects | PASSED: simple and enterprise profiles build and pass behavioral checks |
| Next.js generated projects | PASSED: output safety plus basic, i18n and contact profiles typecheck, test, build and resolve module owner |
| `npm run test:e2e:uiux` | PASSED: 26 checks after the final repair; included in the repository count, not additional live evidence |
| Skill-creator validation | PASSED: `quick_validate.py` for all seven affected Codex skills using Python 3.14 and PyYAML 6.0.3 |
| `node authoring/evals/run-deterministic.mjs` | PASSED: original ten scenarios; zero provider calls and null token telemetry |
| `npm run check:text-hygiene` | PASSED |
| `npm run check:executable-references` | PASSED: all 10 classified executable references |
| `npm run check:skills` and `npm run check:skills:ps` | PASSED after official generation; all mirrors/manifests agree |
| `npm run check:nestjs-pack` | PASSED |
| Root and site audit commands | PASSED: zero reported vulnerabilities |
| `npm run build:site` | PASSED: two static pages built |
| Communication-economy gate | PASSED: bootstrap 19,928 UTF-8 / 19,683 semantic bytes, within the existing baseline budget; no invented token savings |
| Independent source review | Initial phase passed its bounded re-review; the later skill-creator review and its repairs are recorded below |
| Offline selector CLI probes | PASSED: sidebar selects navigation; mobile table selects tables/mobile; native navigation selects mobile; landing selects public-web/visual/accessibility; unknown topic returns no-match; Q&A returns no references |

The authoring evidence under [`authoring/evals/uiux`](../../../authoring/evals/uiux/README.md)
maps all eight requested scenarios, retains actual RED/GREEN/REFACTOR transcripts
and the immutable GREEN source snapshot, and separately records later review
regressions and final source hashes. These tests exercise real selector, version,
review, owner and routing helpers; they do not establish live skill performance.

Initial failures exposed version-range guessing, blocking/automatic aesthetic
findings, narrow-review expansion, convention-scope regression and contradictory
accessibility addenda. The fixes have negative and positive controls. Broad
validation also required moving details out of skills to keep the existing
500-line limit, refreshing summary fingerprints and measuring documentation
rows again. The final full run passed after those changes.

The site audit initially reported vulnerabilities in its existing dependency
graph. A bounded lockfile update within `astro: ^7.1.6` resolved them:
Astro `7.1.6 -> 7.3.2`, js-yaml `4.3.1 -> 4.3.2`, sharp `0.35.3 -> 0.35.4`,
svgo `4.0.2 -> 4.1.0`. A fresh site install, audit and build passed. Root
dependencies and manifest version ranges are unchanged.

## Skill-creator review repairs

The user selected all three findings from the subsequent skill-creator review
for repair. Six additional regression cases reproduced all three findings before
the source changes and now pass.

| Finding | Repair and verification |
|---|---|
| R1: hoisted Core UI detection | Resolve the declared alias through the application's ancestor `node_modules`, including calls from a nested source directory. Both aliases work, a nearer installation takes precedence, and hidden `package.json` exports do not block detection. A separate failing isolation probe led to restricting undeclared ancestor lookup; plain Angular siblings remain non-Core UI in both exact and legacy modes. |
| R2: incorrect alias selection | Select the nearest application manifest's declared alias before installed metadata or npm lockfile fallback. An incidental second alias cannot provide exact compatibility evidence; missing or ambiguous identity fails explicitly. |
| R3: native-navigation no-match | Add `navigation` to the existing mobile catalog entry. Native review resolves `UX-MOBILE-NAV`; portal navigation and unknown-topic behavior remain covered by negative controls. |

The final bounded self-review covered these repairs and their isolation controls;
no new independent-agent review is claimed after this repair. Canonical references
were propagated with the official mirror generator. The existing skill inventory,
executor boundaries, Core UI exact-version policy and artifact lifecycle remain
unchanged.

[`records.json`](../../../authoring/evals/uiux/records.json) preserves the previous
final-source hashes and binds the six-case RED transcript, the additional
isolation failure, the final GREEN transcript and the delivered source hashes.
The original RED/GREEN/REFACTOR and independent-review evidence remains intact.

The full E2E command started after the three finding fixes. While its generated
project suites were running, the R1 sibling-isolation assertion exposed one
additional failure, which was repaired. After that final source edit and mirror
generation, all 598 repository tests and all 26 focused UI/UX tests ran again
and passed. The full command also completed successfully; the Angular, NestJS
and Next.js generators were unchanged by the isolation repair. Hygiene,
executable references, both mirror validators and the original ten-scenario
authoring matrix passed again after the final source edit.

## Limits and use

- Target-project live-agent A/B: NOT RUN. No credentialed provider CLI or fresh
  target-project benchmark was exercised; source review and deterministic
  harness evidence are reported separately.
- Target UI/visual/assistive-technology verification: NOT RUN. No consuming UI
  was supplied or rendered. Generated-project builds do not prove these patterns'
  visual or interaction quality.
- Linux CI, the separate Node 18 Visual Companion compatibility lane and optional
  container suites: NOT RUN locally. No CI run or merge readiness is claimed.
- The selector uses exact documented topic vocabulary, not natural-language
  search. Markdown lookup remains available without installing a runtime.

Examples after loading this worktree's skill pack:

1. `sdcorejs-design: Improve this three-level Core UI sidebar. Preserve routes,
   permissions, tokens and icons; compare expansion, active and keyboard states.`
2. `sdcorejs-design: Design mobile cards for this data table. Preserve item
   identity, selection scope, row actions and item-opening behavior.`
3. `sdcorejs-design: Design a landing page from these approved requirements using
   our existing brand; explain hierarchy, responsive behavior and states.`
4. `sdcorejs-review: Review this UI from source only. Separate defects,
   accepted-convention drift and aesthetic suggestions; provide evidence,
   severity and verification without editing code.`

Start review with `_refs/design/uiux/`, the canonical design/Angular/Next.js/review
skills, the Core docs helper, review contract and focused tests. Generated
mirrors are official sync output; the site lockfile is the bounded audit repair.
