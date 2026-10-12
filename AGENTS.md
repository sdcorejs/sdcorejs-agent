# SDCoreJS SDLC Agent

Entry point for AGENTS.md-aware tools: Codex, Cursor, OpenAI Agents SDK, and compatible assistants.
Claude Code and other compatible agents follow this shared guide. The retained CLAUDE.md entrypoint provides provider context; Copilot reads `.github/copilot-instructions.md`.

This repository is an engineering skill pack for developers and technical teams.
Its root Node workspace is private and validation-only. Its 24 public skills cover
governed requirements, product, design, tests, Angular,
NestJS, Next.js, AI-agent contracts, documentation, review, delivery, and a
generic harness for other stacks.

All user-facing behavior is Runtime-localized: detect the user's language, respond in that language, and preserve locale-specific marks. Keep identifiers, permission codes, env keys, and route paths in English.

## Skill Source Language

Author `skills/**`, `_refs/**`, prompts, templates, reusable examples, and
generated mirrors in English only. Runtime localization belongs to the
consuming project/session; use locale-neutral placeholders such as
`<localized label>` in reusable sources.

Localization test prompts may use non-English input when they are explicitly
fixtures for dispatch/runtime-localization behavior. Expected source text and
generated prose remain English-only and locale-neutral.

## Dispatch

Dispatch by `name:` frontmatter and the `description:` trigger. Load only frontmatter at session start; read a skill body only after selecting that skill.

Use `_refs/shared/system-registry.json` as the versioned source for tracks,
stack profiles, artifact kinds, repository roles, review/repair/ship support,
and evidence classes. Keep track, stack profile, capability profile, artifact
owner, repository role, and execution host as separate fields. The current
working directory is never evidence of artifact ownership.

When multiple skills match, apply this priority before reading a body:

1. Explicit skill name from the user.
2. Approved spec: architecture when required; approved plan:
   `sdcorejs-execute-plan`; explicit delegated execution:
   `sdcorejs-subagent-driven-development`.
3. Product, design, or direct test work: `sdcorejs-product`,
   `sdcorejs-design`, or `sdcorejs-test`; failing-test diagnosis uses
   `sdcorejs-debug`.
4. Dedicated utility intent: `sdcorejs-cleanup`, `sdcorejs-simplify`, `sdcorejs-explore`,
   `sdcorejs-documentation`, `sdcorejs-review`, `sdcorejs-repair-loop`,
   `sdcorejs-debug`, `sdcorejs-ship`, or `sdcorejs-git`.
5. Confirmed track implementation: `sdcorejs-ai-agent`, `sdcorejs-angular`,
   `sdcorejs-nestjs`, or `sdcorejs-nextjs`.
6. Open-ended, ambiguous, or under-specified scope: `sdcorejs-brainstorming`.

Review repair belongs to `sdcorejs-repair-loop`; readiness belongs to
`sdcorejs-ship`; Git artifacts belong to `sdcorejs-git` after the required
ship evidence. Broad refactors and under-specified AI-agent work return to
brainstorming. `sdcorejs-simplify` is only for bounded, behavior-preserving
source refinement.

`sdcorejs-cleanup` owns bounded output/asset/doc hygiene (default read-only).
Offers authorize analysis only; mutations require its exact authority gate.
Load `_refs/cleanup/workflow.md` for risk, recovery and task-tail rules.

## Workflow

```text
brainstorming -> spec -> architecture when required -> plan -> execute-plan
  -> selected executor or generic harness -> mandatory finish gate
  -> test -> optional simplify -> focused tests -> review -> repair
  -> required docs/traceability -> authorized convention sync
  -> authorized current-task cleanup -> affected verification
  -> validation evidence -> convergence -> final read-only branch-ready
```

Project conventions live under `.sdcorejs/conventions/**`, one rule per file.
`sdcorejs-review` reads them and reports naming, API, route, casing,
vocabulary, cross-layer, and mapping drift while staying read-only. Only
`sdcorejs-explore (conventions-sync-write-approved)` persists them, run by the
sequential or fan-in integration owner after the final code writes. See
`_refs/shared/convention-context.md` and `_refs/shared/review-consistency.md`.

Decision identities, conditional architecture, validation-map evidence, and
convergence are executable gates. Repair classifies external feedback before
writes. Internal `authoring/**` skills are never public or mirrored.

No write-producing step may run after final branch-ready unless branch-ready is
run again before any Git artifact handoff.

`sdcorejs-execute-plan` preserves the approved execution policy. Explicit
approved-plan delegation or parallel-agent splitting uses
`sdcorejs-subagent-driven-development`; parent execution is the fallback.
Read-only parallel audits use the low-level `sdcorejs-parallel-dispatch`
scheduler. Both paths require safe ownership, isolation, and deterministic
fan-in; unapproved writes return to planning.

Pure Q&A answers directly. A small, explicit, low-risk fix may use targeted
context, the smallest edit, focused verification, and concise review without
spec/plan artifacts. Scope, ownership, risk, or behavior growth escalates to
the full workflow.

Canonical skills declare semantic `required-actions`; provider mappings and
tri-state capabilities live in `_refs/harness/capability-contract.json`.
Unsupported or unknown capabilities use portable Markdown and sequential
fallbacks.

Use compact, outcome-first communication with complete professional sentences. Load
`_refs/harness/communication-economy.md` just in time for profiles, progress,
context handoffs or artifact selection. Approval, security, destructive action,
ambiguity, conflict, blockers and failed verification require detailed output.
Preserve exact code/commands/paths/IDs/hashes/errors/numbers/evidence. Pass full
typed context to its consumer; unsupported or unknown `runtime_context_channel`
uses a validated portable handoff.

## Production SDLC Scope Decision

Current approved scope is an engineering-focused SDLC skill pack: governed
product/design/test evidence, supported code generation, AI-agent application
contracts, technical security guidance, branch hygiene, Git artifacts, and
recovery memory.

Do **not** add new production-SDLC skills or refs for CI/CD pipelines, IaC, staging/production promotion, observability, incident response, SRE runbooks, migration rollout, compliance gates, or release governance until the user explicitly approves that expansion. If requested, start with `sdcorejs-brainstorming` and an approved spec/plan before authoring new skill/ref surfaces.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create an outcome-based runtime tracker before work starts and update it only
for meaningful progress events.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

1. Project context first when needed: apply the read-only
   `_refs/shared/project-context.md`; use summary when valid and targeted reads
   when it is missing or stale.
2. Requirements before code: use `sdcorejs-brainstorming` until minimum blockers are confirmed.
3. Approval gates: `sdcorejs-spec` and `sdcorejs-plan` require explicit approval. Silence is not approval.
4. Approved snapshots: `sdcorejs-spec` and `sdcorejs-plan` write approved snapshots themselves before the next phase.
5. Execute approved plans through `sdcorejs-execute-plan`; it owns track,
   profile, generic fallback, and execution-mode resolution.
6. Finish gate is mandatory after every code-generation run, including direct track executor requests.
7. Evidence before claims: never say pass, fixed, built, or done without current verification output.
8. Durable execution records and explicitly owned backlog artifacts write to
   the target project, not to this agent repo. Live task progress remains in
   the thread/harness.
9. Mojibake is a blocking defect in prompts, docs, skills, comments, and user-facing strings.
10. Use supported native interaction when available and portable numbered
    Markdown otherwise. Written replies remain authoritative.
11. Keep source English-only and localize generated runtime output.
12. Do not author new skills without explicit user approval.
13. Do not expand into production SDLC skill/ref coverage without the explicit approval described in **Production SDLC Scope Decision**.
14. Local runtime state, such as a Visual Companion session, requires its own
    explicit consent and stays `local_only`. Capability is never permission,
    auto-opening a browser is a separate consent, and a visual selection is
    supporting feedback that never satisfies an approval gate.

## Session-Start Ritual

In a target project:

- Apply `_refs/shared/project-context.md` for the current request.
- Read explicit user evidence first, then valid summary sections.
- Select specs, plans, docs, handoffs, memories, and durable backlog entries by
  relationship metadata and request relevance; do not load the latest files by
  default.
- Ignore legacy session checkpoint files. Live progress belongs to the current
  thread/harness.
- Read `.sdcorejs/persona.md` if relevant; otherwise default to technical style
  unless `sdcorejs-explore (persona mode)` is triggered.

## Reference Loading

Follow `_refs/shared/runtime-protocols.md` for mandatory shared JIT hooks;
its context, progress, communication, delegation and visual rules apply at
their declared triggers. Additional loading:

- `_refs/harness/capability-contract.json` for semantic action/capability resolution.
- `_refs/shared/artifact-lifecycle.md` before `.sdcorejs/**` writes or Git closure.
- `_refs/shared/user-choice-prompt.md` before choices, approvals or mode selection.
- Relevant `_refs/sdlc/*.md` for brainstorming, architecture, spec or plan.
- `_refs/shared/testing-philosophy.md` for test-track work.
- Decision coverage, validation-map, and convergence references at their gates.
- `_refs/simplify/**` for bounded behavior-preserving source refinement.
- `_refs/angular/core-docs-fetch.mjs` before using Core UI components.
- `_refs/<track>/review-*.md` during review.
- `_refs/orchestration/workspace-isolation.md` for execution workspace isolation.
- `_refs/orchestration/tail/verify-before-done.md` during `sdcorejs-ship (verify-before-done mode)`.
- `_refs/orchestration/tail/branch-ready.md` during `sdcorejs-ship (branch-ready mode)`.


## Explicit finish tail

Tail chain after code generation:

```text
sdcorejs-test
-> optional sdcorejs-simplify
-> affected focused tests after any simplification write
-> sdcorejs-review
-> sdcorejs-repair-loop when findings exist
-> sdcorejs-documentation (code-documentation mode)
-> sdcorejs-product when user-visible feature traceability is needed
-> _refs/orchestration/tail/auto-docs.md
-> sdcorejs-documentation (write-user-guide mode)
-> _refs/orchestration/tail/auto-task-tracker.md when the sequential/integration owner updates durable backlog
-> sdcorejs-explore (memories mode) when durable knowledge surfaced
-> sdcorejs-explore (conventions-sync-write-approved) when convention candidates exist and policy or explicit authority permits persistence
-> authorized current-task cleanup and affected verification
-> sdcorejs-ship (verify-before-done mode)
-> sdcorejs-ship (branch-ready mode as the final read-only gate)
```

## Track Executors

| Track | Executor | References |
|---|---|---|
| angular | `sdcorejs-angular` for Core UI portals; generic harness for plain Angular | `_refs/angular/write-code/*`, `_refs/angular/core-docs-fetch.mjs` only for `@sdcorejs/angular` / `@sd-angular/core`, new SDCoreJS portal creation, or approved Core UI migration |
| nestjs | `sdcorejs-nestjs` | `_refs/nestjs/write-code/*`, `_refs/nestjs/core-catalog.md` |
| nextjs | `sdcorejs-nextjs` | `_refs/nextjs/build-website/write-code/*` |
| ai-agent | `sdcorejs-ai-agent` | `_refs/ai-agent/**`; two engine profiles and twelve independent capability profiles |
| product | `sdcorejs-product` | `.sdcorejs/product/` PRDs/user stories/AC/UAT docs plus `.sdcorejs/docs/product/` traceability ledgers |
| design | `sdcorejs-design` | `.sdcorejs/design/` flows/specs/wireframes/PNG exports/references plus `.sdcorejs/docs/design/` traceability |
| test | `sdcorejs-test` | `_refs/shared/testing-philosophy.md`, `_refs/<track>/test-*.md`; an existing shared `test/` project for multi-project e2e/UAT |
| documentation | `sdcorejs-documentation` | `_refs/documentation/*` |
| generic | `sdcorejs-execute-plan` | approved plan + project scripts |

The product track is first-class. Feature docs, user stories, acceptance criteria, UAT, and traceability audits are not routed through the generic harness.

The design track is first-class. FE handoff specs, flows, wireframes, mockups, and PNG previews are not routed through the generic harness.

Product and Design artifacts always live under the target repository's
`.sdcorejs/` directory. Canonical roots come from `artifact_roots` in
`_refs/shared/system-registry.json` and are resolved through
`_refs/shared/artifact-paths.mjs`. Root-level `product/**` and `design/**` are
legacy read-only compatibility inputs, never write targets.

The test track is first-class. Test-only plans are not routed through app write-code skills.

The AI-agent track is first-class but approved-plan-only. It authors governed
application contracts/integration with provider storage disabled by default,
business-shaped tools, exact-input approvals, tenant-isolated state,
evidence/tracing/FinOps contracts, offline deterministic evals, and separately
reported live verification. It does not bundle an agent runtime.

## Skill Groups

| Group | Skills |
|---|---|
| SDLC | `sdcorejs-brainstorming`, `sdcorejs-spec`, `sdcorejs-plan` |
| Execution | `sdcorejs-execute-plan`, `sdcorejs-ai-agent`, other track executors, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` |
| Delegated execution | `sdcorejs-subagent-driven-development`; `sdcorejs-parallel-dispatch` schedules safe waves; workspace isolation is a provider-neutral orchestration action |
| Finish | `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)`, `sdcorejs-explore (conventions-sync-write-approved)`, `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode as the final read-only gate)` |
| Utilities | `sdcorejs-cleanup`, `sdcorejs-simplify`, `sdcorejs-explore`, `sdcorejs-git`, `sdcorejs-review`, `sdcorejs-debug`, `sdcorejs-ship`, `sdcorejs-documentation` |

## Mirrors

Source of truth lives in `skills/` and `_refs/`.

Generated mirrors:

- `.claude/skills/`
- `plugin/skills/`
- `codex/skills/`
- `.cursor/rules/sdcorejs-agent.mdc`

Run `npm run sync:skills` after editing source skills, `_refs`, or `AGENTS.md`.

## Provider entrypoint detail

At session start, glob `skills/**/*.md`, excluding `_refs/**`, and read frontmatter only. Core UI generation is limited to installed or approved Core UI portals; plain Angular retains the generic harness and local conventions. Non-English fixtures are limited to explicit dispatch/runtime-localization input tests; reusable expected skill prose remains English-only.


## Instruction provenance

Unique guidance from [CLAUDE.md](CLAUDE.md) is consolidated here. Existing AGENTS scope, approval rules and confirmed conventions remain authoritative. CLAUDE.md is retained; update shared conventions together rather than maintaining independent conflicting rules.
