---
artifact_id: skill-creator-followup-20261105
artifact_kind: execution-doc
change_ref: skill-audit-content-20261105
source_spec: .sdcorejs/specs/workflow/2026-11-05-skill-audit-content.md
source_plan: .sdcorejs/plans/workflow/2026-11-05-skill-audit-content.md
source_revision: 97cc700ef7201a3074c57aedff89cbe131f9ee6f
commit_policy: with-change
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
redaction_applied: true
---

# Skill-creator review follow-up — 2026-11-05

The user explicitly requested fixes for the review findings and an assessment of
additional cloud skills. The original instruction authorizes scoped implementation,
verification, grouped commits, push and PR delivery. No new document approval is
claimed; the existing immutable spec/plan remain unchanged. This continuation
covers AC-006, AC-010, AC-011 and AC-012 and targets the existing PR #84.

## Repair plan and results

1. Reproduce the two executable defects before edits, fix their shared boundaries,
   and preserve paired negative controls.
2. Resolve transition-local instruction/template conflicts using the existing
   scoped-delegation policy, retaining the approval gate without delegation.
3. Independently review behavior, generate/check mirrors, run affected and core
   regressions, then deliver the existing branch without merging.

| Finding | Change and evidence |
| --- | --- |
| SC-R001: bare dirty directory versus glob incorrectly authorized | Sequential and parallel preflight share one conservative overlap predicate, including equal roots. The sequential helper accepts the same explicit case-sensitivity option. Directory/glob, reversed scopes, trailing slash, child, exact path, disjoint sibling and case controls run against both consumers. |
| SC-R002: tech social prompts excluded from Content | The existing deterministic dispatcher evaluates the requested output before technical topic/source clauses. Tech captions/scripts remain Content; API docs, tests, PRDs, and UI components retain their owners. Explicit skill selection still wins. |
| SC-S001: unconditional approval/dirty menus contradict delegation | Spec/Plan resolve current authority before prompting; Execute-plan asks only for unknown ownership or unrelated overlap. Literal spec/plan templates carry the real instruction reference and truthful user-review flag. Hash verification rejects later changes to those provenance fields. |

The independent reviewer caught additional software/editor false positives in the
first routing fix. All six reported variants now route to Angular, with eight
editorial controls retained. Those failures and rechecks remain in the review
record; the regression was fixed before delivery. Routing tests establish harness
behavior, not universal natural-language routing by every model/host.

The independent action-selection exercise also covers delegated continuation,
plan-only review, expanded external/publication scope, unrelated dirty overlap and
disjoint notes. It is one fresh source-guided reviewer plus deterministic helper
probes, not a live A/B study or fresh target-project execution.

## New verification

Evidence index: `authoring/evals/skill-creator-followup/README.md`.

- Baseline: 13 tests, 11 pass and two expected RED failures before source edits.
- Final repository main Node component: **760/760 PASS** after the last routing
  correction. The composite native-cleanup stage was not invoked.
- Intermediate focused suites: 42/42 and 145/145 PASS; final core supersedes
  these for the final router. Failed iterations are separately retained.
- Required deterministic authoring matrix: 10/10 PASS, zero provider calls.
- Official OpenAI skill-creator validator: 25/25 generated Codex skill packages
  valid. Structural validation is not semantic correctness.
- Independent targeted recheck: four focused tests pass; no unresolved actionable
  finding in its bounded scope.
- Generated mirrors, text hygiene, executable references and diff hygiene checked.
  Python snippets compile in memory with an existing interpreter; no native
  cleanup behavior is implied.

The first core run found a stale current Communication Economy table. It was
recomputed with the repository report; the equality check was retained. Current
aggregate communication is 723,980 bytes against its historical 577,334-byte
baseline, with all 361 required fields preserved. These are source-bound scenario
projections, not model tokens or a demonstrated total-context saving. Historical
reports and source manifests remain untouched.

## Limits and deferred opportunities

Full `npm test`, golden generated-app builds, native cleanup/ext4/APFS,
macOS/Windows filesystem execution, live provider A/B, browser acceptance and
publication actions were NOT RUN in this follow-up. Earlier golden results and the
native-cleanup environment failure remain historical observations, not new passes.
Case-insensitive behavior was exercised as a helper option, not on a Windows disk.

Optional UI metadata and further source-size reduction were improvement
opportunities, not established defects, and are deferred. No production-SDLC,
CI/CD, SRE, new public skill, validator relaxation or automatic merge was added.

## Cloud authoring skills assessment

Keep the repository's internal authoring skill as the policy owner. The official
OpenAI skill-creator already installed at revision `49f948faa9258a0c61caceaf225e179651397431`
provides authoring structure and basic validation. GitHub, OpenAI Developers,
Codex Security, Browser and Cloud Environment capabilities are already available;
installing equivalents adds little for the present task.

| Candidate | Recommendation and verified constraints |
| --- | --- |
| [Anthropic skill-creator](https://github.com/anthropics/skills/tree/ca45fc496a3436251f191354091d557da31c15b5/skills/skill-creator) | Best additional evaluation toolkit: baseline/with-skill runs, grading, benchmark aggregation, blind comparison and a static review viewer. Keep it separate from OpenAI's identically named skill; do not overwrite or auto-load two conflicting creators. Its trigger optimizer invokes `claude -p`; this cloud has no Claude CLI, and no credentialed provider run was authorized. Codex evaluation needs an explicit adapter to the available agent runtime; static aggregation/viewer utilities alone do not provide live evaluation. |
| [OpenAI Playwright](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright) | Add when repeated browser inspection of the site or generated Angular/Next.js apps is needed. It is CLI automation with snapshots/traces, not automatically a Playwright test-spec authoring suite. `npx` exists here; browser binaries and actual UI execution were not tested. Use the existing Browser capability for one-off inspection before adding another tool surface. |
| [OpenAI skill-installer](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-installer) | Optional maintenance convenience for pinned installs. Its official script already installed skill-creator from scratch; it is not itself installed as a discoverable skill. It does not add behavioral-evaluation coverage. |
| Superpowers | Available but not installed. Its advertised planning/TDD/debugging/collaboration workflow substantially overlaps sdcorejs. Do not add the whole framework by default; evaluate individual missing capabilities in isolation. |
| Plugin Creator | Available but not installed. Consider only for a later ChatGPT-plugin packaging/distribution task. Its directory description is not evidence of a drop-in sdcorejs regression/evaluation adapter. |

This task assessed additional tools; none of these candidates was installed or
connected. Installing into the current cloud workspace does not establish
persistence in a fresh cloud environment. Reproducible bootstrap configuration
and any provider execution/credentials need their own concrete setup decision;
no environment configuration or global permissions were changed.
