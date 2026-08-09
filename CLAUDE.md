# SDCoreJS SDLC Agent - Claude Code Instructions

Claude Code entry point for the SDCoreJS skill pack. The same skill model is mirrored to Codex, Cursor, and Copilot through their entry files.

This repo provides Runtime-localized engineering skills for developers and
technical teams working across the software delivery lifecycle:

- Angular portals with `@sdcorejs/angular`
- NestJS + Postgres backends
- Next.js public sites
- Governed AI-agent application contracts and implementations
- A product track for PO-facing docs plus feature ledgers and traceability
- A design track for FE handoff artifacts from product user stories
- A first-class test track
- A generic execution harness for unsupported stacks or non-track plans

## Skill Source Language

Author this skill pack in English only. `skills/**`, `_refs/**`, prompts,
templates, examples, generated mirrors, and validation fixtures must not embed
Vietnamese prose or Vietnamese-only sample UI text. Runtime localization belongs
to the consuming project/session: instructions may say to translate or localize
output at runtime, but the reusable skill source itself stays English and
locale-neutral. Use placeholders such as `<localized label>` instead of concrete
Vietnamese labels.

Localization test prompts may use non-English input when they are explicitly
fixtures for dispatch/runtime-localization behavior. Expected source text,
generated mirrors, reusable examples, and expected generated skill prose must
remain English-only and locale-neutral.

## Dispatch

At session start, glob `skills/**/*.md`, excluding `_refs/**`, and read frontmatter only. Match user requests against each skill `description`. Read the selected skill body before acting.

Resolve tracks, stack profiles, repository roles, artifact ownership, review/
repair/ship support, and evidence classes from the versioned
`_refs/shared/system-registry.json`. A capability profile refines an approved
track; it is not a track. Keep the semantic artifact owner separate from the
execution host, and never use the current working directory to infer ownership.

If several skills match, apply this priority before reading a body:

1. Explicit skill name from the user.
2. Approved spec/plan continuation: `sdcorejs-execute-plan`.
3. Product docs and traceability: `sdcorejs-product`.
4. Design handoff artifacts: `sdcorejs-design`.
5. Test-only work: `sdcorejs-test`, except failing-test root cause/fix goes to `sdcorejs-debug`.
6. Dedicated utility intent: `sdcorejs-simplify`, `sdcorejs-explore`,
   `sdcorejs-documentation`, `sdcorejs-review`, `sdcorejs-repair-loop`,
   `sdcorejs-debug`, `sdcorejs-ship`, or `sdcorejs-git`.
7. Confirmed track implementation: `sdcorejs-ai-agent`, `sdcorejs-angular`,
   `sdcorejs-nestjs`, or `sdcorejs-nextjs`.
8. Open-ended, ambiguous, or under-specified scope: `sdcorejs-brainstorming`.

Routing clarifications:

- Failing-test root-cause/fix intent routes to `sdcorejs-debug`.
- Writing, running, or planning tests without root-cause/fix intent routes to `sdcorejs-test`.
- Review findings repair routes to `sdcorejs-repair-loop`.
- Recently changed or explicitly scoped executable-source cleanup that must
  preserve behavior routes to `sdcorejs-simplify`. It is a utility, not a
  track. Broad refactors and public-contract changes return to planning; bugs,
  tests, docs/prompts, review findings, performance, and dependencies retain
  their dedicated owners.
- Ship/readiness gates route to `sdcorejs-ship`.
- Commit, PR, changelog, and release-note artifacts route to `sdcorejs-git` only after the required ship gates pass or an explicit verification deferral is recorded.
- Confirmed AI-agent implementation requires an approved plan with one engine
  profile and one independent capability profile. Under-specified AI-agent
  requests return to brainstorming; test, review, and debug intents retain
  their dedicated owners.

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore open direction, then confirm all blockers.
  -> sdcorejs-spec
       Write spec + approval gate + approved spec snapshot.
  -> sdcorejs-plan
       Write plan + approval gate + approved plan snapshot.
  -> sdcorejs-execute-plan
       Detect track; ask execution mode only when both modes are feasible.
  -> executor
       core-ui-angular / legacy-core-ui-angular / new SDCoreJS portal: sdcorejs-angular
       plain-angular: generic harness
       nestjs:  sdcorejs-nestjs
       nextjs:  sdcorejs-nextjs
       ai-agent: sdcorejs-ai-agent
       product: sdcorejs-product
       design:  sdcorejs-design
       test:    sdcorejs-test
       generic: execute-plan harness fallback
  -> finish gate and tail chain
```

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
-> sdcorejs-ship (verify-before-done mode)
-> sdcorejs-ship (branch-ready mode as the final read-only gate)
```

No write-producing step may run after final branch-ready unless branch-ready is
run again before any Git artifact handoff.

`sdcorejs-execute-plan` auto-selects sequential for one executable unit or when
parallel execution is unavailable/unsafe. It asks only when sequential and
parallel are both feasible for at least two independent units. Parallel
execution requires `sdcorejs-parallel-dispatch`.

Direct splitting of an approved plan may select `sdcorejs-parallel-dispatch`.
Unapproved write work returns to planning. Read-only parallel review/audit work
may use a `read-only-request` contract with writes denied; write work requires
the approved-plan protocol, working-tree preflight, mechanical ownership checks,
per-unit isolation, and deterministic fan-in.

Pure Q&A answers directly. A small, explicit, low-risk fix uses targeted
context, the smallest edit, focused verification, and concise review. Scope,
ownership, risk, or behavior growth escalates to the full workflow.

Canonical skills declare semantic `required-actions`. Provider mappings and
tri-state capabilities live in `_refs/harness/capability-contract.json`;
unsupported or unknown capabilities use portable Markdown/sequential
fallbacks.

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

Project conventions live under `.sdcorejs/conventions/**`, one rule per file,
resolved through `_refs/shared/convention-paths.mjs`. `sdcorejs-review` reads
them and reports drift read-only; only
`sdcorejs-explore (conventions-sync-write-approved)` persists them, run by the
sequential or fan-in integration owner. See
`_refs/shared/convention-context.md` and `_refs/shared/review-consistency.md`.

The test track is first-class. Test-only plans are not routed through app write-code skills.

The AI-agent track is first-class but approved-plan-only. It authors governed
application contracts/integration with provider storage disabled by default,
business-shaped tools, exact-input approvals, tenant-isolated state,
evidence/tracing/FinOps contracts, offline deterministic evals, and separately
reported live verification. It does not bundle an agent runtime.

## Mandatory Execution Discipline

For any non-trivial execution task, the agent MUST use `_refs/shared/tasklist.md`.

Create outcome-based progress before work starts and update it only for a
meaningful outcome, scope change, blocker, verification phase, decision, or
status request.

This applies across explore, git, review, debug, ship, dependency updates, code modification, PR/changelog generation, and verification-before-done.

Do not say "done", "ready", or "safe to ship" unless verification is complete or skipped verification is explicitly disclosed.

## Mandatory Rules

1. **Requirements before code.** Use `sdcorejs-brainstorming` until the minimum blockers for the detected track are confirmed.
2. **Approval gates.** `sdcorejs-spec` and `sdcorejs-plan` require explicit user approval. Silence is not approval.
3. **Approved snapshots.** `sdcorejs-spec` and `sdcorejs-plan` write their own approved snapshots before the next phase.
4. **Execute-plan.** Approved plans go through `sdcorejs-execute-plan`; it owns
   track detection, Angular Core UI/plain Angular classification,
   AI-agent/product/design/test routing, generic fallback, and execution-mode
   resolution.
5. **Finish gate.** Every code-generation run presents the finish gate before tail steps, even direct one-line requests.
6. **Evidence before claims.** Never claim pass, built, fixed, or done without running and reading the relevant verification command in the current turn.
7. **Runtime-localized.** Respond in the user's language; preserve locale-specific marks; keep identifiers and route paths in English.
8. **Mojibake guard.** Treat encoding corruption as blocking in docs, skills, prompts, comments, and user-facing strings.
9. **Target project writes.** Auto-docs, snapshots, memories, user guides, and task trackers write to the target project, never this agent repo unless this repo is the explicit target.
10. **Core UI only when installed or approved.** Angular generation prefers documented `@sdcorejs/angular` / `@sd-angular/core` components only for Core UI portals, new SDCoreJS portal creation, or approved migration. Plain Angular uses the generic harness and local project conventions.
11. **Choice prompts.** Before asking the user to choose, approve, answer yes/no, or select a mode, apply `_refs/shared/user-choice-prompt.md`; ask one decision at a time and number every option as `1/2/3/...`.
12. **Skill source language.** Keep reusable skill/ref source in English only; translate generated output at runtime based on the consumer's language.
13. **Do not author new skills without explicit user approval.**
14. **Communication economy.** Apply
    `_refs/harness/communication-economy.md` just in time. Default routine
    output to compact professional sentences; use detailed output for
    approval, security, destructive action, ambiguity, conflict, blockers, or
    failed verification. Pass full typed context only to its consumer; use a
    portable handoff when `runtime_context_channel` is unsupported or unknown.
15. **Local runtime consent.** A Visual Companion session writes local runtime
    state and may open a browser. Each is a separate explicit consent, and
    capability is never permission. Session state under
    `.sdcorejs/tmp/visual-companion/**` is `local_only`: never staged, never
    committed, never read back as context. A visual selection is supporting
    feedback and never satisfies an approval gate.

## Session Context

Load `_refs/shared/runtime-protocols.md` as the shared router. Load harness
capability, delegation, task-brief, or visual references only when that
capability is relevant; do not copy full spec/plan/repository context into
worker prompts.

At the start of a target-project session:

- Apply the read-only `_refs/shared/project-context.md`.
- Use explicit user evidence first, then valid summary sections.
- Select specs, plans, change records, handoffs, memories, and durable backlog
  entries by relationship metadata and request relevance.
- Ignore legacy session checkpoint files; live progress stays in the
  thread/harness.
- Read `.sdcorejs/persona.md` when relevant.
- Read `_refs/shared/user-choice-prompt.md` before choices, approval gates,
  yes/no prompts, or mode selections.
- Read `_refs/shared/artifact-lifecycle.md` before any `.sdcorejs/**` write or
  Git artifact handoff.
- Read `_refs/sdlc/visual-companion.md` before offering a visual surface or
  starting a companion session.

## Skill Groups

| Group | Skills |
|---|---|
| SDLC | `sdcorejs-brainstorming`, `sdcorejs-spec`, `sdcorejs-plan` |
| Execution | `sdcorejs-execute-plan`, `sdcorejs-ai-agent`, other track executors, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` |
| Parallel | `sdcorejs-parallel-dispatch`; workspace isolation lives in `sdcorejs-git (workspace mode)` |
| Finish | `_refs/orchestration/tail/auto-docs.md`, `sdcorejs-documentation (write-user-guide mode)`, `_refs/orchestration/tail/auto-task-tracker.md`, `sdcorejs-explore (memories mode)`, `sdcorejs-explore (conventions-sync-write-approved)`, `sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode as the final read-only gate)` |
| Utilities | `sdcorejs-simplify`, `sdcorejs-explore`, `sdcorejs-git`, `sdcorejs-review`, `sdcorejs-debug`, `sdcorejs-ship`, `sdcorejs-documentation` |

## Mirrors

Source of truth lives in `skills/` and `_refs/`.

Generated mirrors:

- `.claude/skills/`
- `plugin/skills/`
- `codex/skills/`
- `.cursor/rules/sdcorejs-agent.mdc`

Run `npm run sync:skills` after editing source skills, `_refs`, or `AGENTS.md`.
