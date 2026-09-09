# UI/UX Knowledge Sources and Adoption

Reviewed on 2026-09-09 against these fetched `main` revisions:

- SDCoreJS Agent: `4fa58c66bc8b96c3ddcad887403d1eb9cfb5c8f4`.
- [UI UX Pro Max Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/4aad0584d92131626b16d4ff4d77f0455385013c):
  `4aad0584d92131626b16d4ff4d77f0455385013c`.

## Selective adoption

| Existing SDCoreJS capability | Gap | Addition | Not adopted |
|---|---|---|---|
| Design reuse, component/data maps and critique | Per-feature palette/signature requirements conflict with existing UI reuse | Source-backed visual decisions; optional distinctive detail | Mandatory new palette, font or theme |
| Core UI screen packs and exact package-name detection | Task-oriented UX retrieval; nonexact docs can look authoritative | Shared topic selector and explicit exact-version docs mode | Upstream stack defaults or new UI dependencies |
| Mobile context, ergonomics and failure states | Explicit table/card interaction parity | Selection/open/action parity and focused mobile rule IDs | Forced card conversion or native behavior on desktop |
| Read-only review and evidence/consistency contracts | Shared UI/UX probes and classification at finding validation | Selected patterns and evidence/verification fields inside existing findings | Automatic edits or aesthetic blockers |
| Semantic-owner resolver, provenance, ledger and closure | Baseline/feature-delta guidance | Existing reuse references and decision documents | Root-level master/override files or duplicate module sources |
| Lightweight Q&A and bounded-fix routes | Knowledge loads must follow the same boundaries | Topic-only context, transparent no-match | Eager dataset loading or full design workflow for every UI task |

Inspected upstream source includes `src/ui-ux-pro-max/data/` (UX, charts,
products, styles, colors, typography, icons, motion, landing and stack catalogs),
`scripts/core.py` (BM25, domain routing, projection and abstention),
`scripts/search.py` (query contract), `scripts/design_system.py` (reasoning,
generation, persistence and overrides), `templates/base/skill-content.md`,
`templates/base/quick-reference.md`, platform templates and `LICENSE`.

Adopted ideas: task/surface/topic lookup, applicability and anti-patterns,
verification next to guidance, selective retrieval, explicit no-match and a
shared baseline plus bounded feature exceptions. Patterns here are newly written
for SDCoreJS; no upstream code, CSV rows, templates or installer are vendored.

Deliberately excluded: BM25/Python runtime, vector/services, bulk dataset context,
automatic palette/font/style generation, icon-pack replacement, React/Tailwind/
Phosphor/Google Fonts/GSAP defaults, unconditional animation/density/radius
rules, broad installer behavior, and marketing fallback for operational screens.
The inspected generator's unmatched reasoning fallback is `Hero + Features + CTA`;
it is not used by this pack. Upstream page-over-master precedence is narrowed to
approved, owner-scoped deltas that cannot override accessibility or invariants.

## Source and license policy

Upstream is MIT, copyright (c) 2024 Next Level Builder. The complete notice is
retained in [upstream-license.txt](upstream-license.txt) for attribution. This
does not make upstream text an instruction or approved project convention.
W3C criteria and APG are linked at the applicable patterns; standards-based
checks are distinguished from aesthetic and ergonomic heuristics.

Updates are manual, revision-pinned review changes: inspect upstream code/data
and license, assess each changed pattern, preserve local rule IDs and adaptations,
run retrieval/negative/ownership/evidence checks, regenerate mirrors and review
the diff. Never auto-sync upstream over these sources. Retired IDs should remain
documented with their replacement rather than being reused for another meaning.
