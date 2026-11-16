# Visual polish follow-up — 2026-11-15

The user found the initial sample HTML unattractive. This bounded follow-up
improves the shared renderer and teaching examples: a calmer portal workbench,
clearer list/detail alignment, separate website typography and composition,
product-oriented sample copy, and secondary comparison controls. It preserves
project tokens, schemas, selection authority, offline behavior and the 25-skill
inventory. Reusable source remains English; consumers supply localized content.

The baseline is the preserved dirty tree at unchanged HEAD `a71251f`, not clean
main. Earlier evaluation reports and approved artifacts remain historical.
`source-manifest.json` binds candidate 4: 60 reviewed inputs and 14 changed files.
Generated mirrors were produced only through `npm run sync:skills`.

## Rendered examples

Actual HTML and browser screenshots are retained in the local work directory:

- [Portal workbench](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/showcase-4/workspace.html)
- [Product landing page](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/showcase-4/product.html)
- [Centered website alternative](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/showcase-4/product-story.html)
- [Operational comparison](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/browser-5/queue-context.html)
- [Website comparison](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/browser-5/product-direction.html)

The matching PNGs show actual Chromium output. Baseline screenshots remain in
`showcase/`; current screenshots are in `showcase-4/`. Selected desktop and
mobile images were inspected directly. Test counts and NVIDIA scores are not
evidence of aesthetic quality or user acceptance.

## Verification and repair

An independent reviewer found two introduced accessibility regressions in
candidate 1: table cards clipped keyboard focus rings, and fixed pixel text
stopped following enlarged user font preferences. It also identified an inherited
empty response box visible before Copy. Candidate 4 uses an inset table focus
ring, relative text sizes with responsive layout, and a scoped hidden response
rule. A further reflow repair makes sidebar widths follow text size and separates
definition labels from values during enlargement. Layout breakpoints also follow
font preference, allowing cramped tablet columns to stack while text keeps its
enlarged size. The intermediate browser-4 run caught a responsive typography
interaction and failed; its corrected browser-5 run passes. Failed evidence is
retained, not relabeled. The browser probe now checks actual text growth and reachable content at
200% font size across all twelve families at mobile, tablet and desktop widths, plus response visibility before/after
Copy. These checks address observed regressions; no new behavioral TDD claim is
made for the original cosmetic edits.

Candidate 4 passes 889 main Node tests and 551 browser assertions in Chromium
155.0.8059.79, with no remote requests or page script errors. Raw command receipts
record exact argv, working directory, times and exit codes in
`/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/`.

The full `npm test` command exits 1 at native cleanup: 44 pass, 110 fail and five
skip because this overlayfs workspace lacks the trusted ext4/APFS fixture.
Later Angular/NestJS/Next.js stages in that chained command are NOT RUN for this
polish; their earlier implementation results are historical, not relabeled as
current. No unrelated cleanup repair or publication claim is made.

NVIDIA SkillEvaluator 0.9.0 keyless Tier 1 exits 1 for both unchanged skill bodies:
Design static quality 87.5/B and Brainstorming 83.8/B, with missing default
`metadata.author` and SkillSpector exit 2. Full scanner coverage is INCOMPLETE.
These SKILL.md checks do not certify renderer code or visual quality. No new
OpenAI API evaluation calls were made; model/token/cost telemetry is unavailable.
LLM rubric, Tier 2/3 and new live A/B trials are NOT RUN for this cosmetic scope.

Final independent repair verification and its exact evidence hashes are recorded
in `receipt.json`. Candidate 4 has no remaining actionable findings in this scope;
the independent reviewer passed 48 focused tests and 551 browser assertions,
verified all 60 source hashes, and directly inspected the repaired enlarged-text
and keyboard-focus screenshots. See the [final independent review](/workspace/work/sdcorejs-visual-polish-20261115-o0_ux36u/independent-review/round-4/REVIEW.md).
Root font preference checks are not full assistive-technology
certification. Project-specific content, tokens and business behavior still need
consumer validation.
