---
artifact_id: cloud-skill-benchmark-20261105
artifact_kind: execution-doc
change_ref: skill-audit-content-20261105
source_spec: .sdcorejs/specs/workflow/2026-11-05-skill-audit-content.md
source_plan: .sdcorejs/plans/workflow/2026-11-05-skill-audit-content.md
source_revision: be1c4963fa2e0f5b32d9523d9601b3dc634db289
commit_policy: with-change
owner: integration-owner
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
redaction_applied: true
---

# Recommended cloud skills and benchmark continuation

The user's latest instruction explicitly authorizes installing the recommended
tools and running the benchmark. The original task authorizes evidence delivery
through commits, push and PR review, without merging. This is scoped session
delegation, not a new document-review event. Historical spec/plan and evidence
remain unchanged. This continuation adds environment tooling and reviewed
evaluation evidence only; it does not change public skill sources or inventory.

Execution completed in dependency order: pin/install and validate tools; freeze
source snapshots, prompts and assertions; execute paired independent jobs;
grade masked outputs; aggregate with unknown telemetry preserved; verify the
static viewer; package evidence and run applicable documentation hygiene.

Installed OpenAI skill-installer and Playwright plus a separately named Anthropic
skill-creator. The existing OpenAI creator is retained. All installed upstream
scripts are byte-verified; the Codex-specific adapter and entrypoint differences
are explicit. The installation applies to this cloud environment only.

Evidence index: `authoring/evals/cloud-skill-benchmark-20261105/README.md`.

| Layer | New result | Meaning |
| --- | --- | --- |
| Deterministic routing/dirty contracts | Baseline 20/30; candidate 30/30 | Executable regressions corrected; not model routing |
| Native paired agent capture | 24 jobs; baseline 60/60 and candidate 60/60 assertions | No observed pass-rate uplift in this six-scenario sample |
| Independent masked grading | Two graders, 12 outputs each | Semantic output review; no human approval claimed |
| Aggregator controls | 4/4 | Reject invalid evidence and keep missing telemetry unknown |
| Required authoring matrix | 10/10 | Current deterministic matrix; zero provider calls |
| Focused authoring suite | 6/6 | Internal inventory/evidence contracts |
| Browser smoke | 24 outputs, prompts and benchmark tab render | Chromium viewer only, not target-project UI acceptance |

The baseline agents compensated for helper inconsistencies. Content did not
change between revisions and is a regression control. All assertions pass in
both versions, so the suite does not discriminate overall agent quality here.
No provider token/duration data is exposed; no cost or speed claim is possible.
Action traces are sanitized worker self-reports. Capture constraints, assigned
entrypoints and a small sample limit conclusions about autonomous routing,
real writes, publication boundaries and broader skill coverage.

The static viewer has one expected `/api/feedback` 404 when served by a plain
file server; its client catches this and uses local feedback/download behavior.
Unused online font/XLSX dependencies were removed from the generated artifact.
No feedback was submitted on the user's behalf.

NOT RUN remains explicit for Claude-only trigger optimization, the separate
historical live-provider matrix, fresh target implementation, all-skill coverage,
cross-session voice persistence, full composite/native-cleanup and golden builds.
The earlier core 760/760 result is not relabeled as a new run. No new benchmark
result establishes full production readiness or authorizes merging PR #84.
