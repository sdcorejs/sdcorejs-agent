---
name: sdcorejs-using-skills
description: Bootstrap that teaches how to find and dispatch sdcorejs skills AND serves as the onboarding entry point (it replaces the former per-track `*-onboarding` skills) — INJECTED AT SESSION START so dispatch discipline holds even when the repo's CLAUDE.md is absent (e.g. installed as a plugin in a foreign project). Establishes the clarify → spec → plan → write-code → review → ship flow, the user-approval gates, the per-track first step, and the rule that a relevant skill MUST be invoked before responding. Triggers - session start, "what can you do", "what can this agent do", "how do I start", "list skills", "help", "which skills are available", "create landing page", or any request that matches an sdcorejs skill. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Glob
---

# Using sdcorejs Skills

You have the **sdcorejs SDLC skill pack** — an orchestrated software-development lifecycle for three stacks: **Angular Portal** (`@sdcorejs/angular`), **NestJS + Postgres**, and **Next.js** public sites. This bootstrap establishes how to use it. It is injected at session start so it works in any project, with or without the repo's `CLAUDE.md`.

## The rule

**When a request matches a skill, invoke that skill BEFORE responding — including before clarifying questions.** Even a 1% chance a skill applies means invoke it to check; if it turns out wrong, you don't have to follow it. Skills tell you HOW to explore, plan, and build — checking first prevents undisciplined work.

## How to dispatch

1. Match the request against each skill's `description` (the "Use when…" trigger).
2. Pick the highest-confidence match. If several tie, pick the earliest in the workflow (clarify before plan, plan before write-code).
3. Invoke it via the `Skill` tool, announce it to the user ("Using `<skill>` to `<purpose>`"), then follow its body exactly.
4. If nothing matches (or the user asks "what can you do / how do I start / what can this agent do"), answer from **What this pack does** below, then route to the first step — `sdcorejs-brainstorm` (open-ended) or `sdcorejs-clarify-requirements` (scope clear); for an existing Next.js site to improve, `sdcorejs-review`.

## What this pack does (per track + first step)

Use this to answer "what can you do / how do I start / what can this agent do", then route to the first step. Keep the reply short; match the user's language.

- **Angular** (`angular.json` + `@sdcorejs/angular`) — backoffice portals on Core UI: full CRUD modules/entities, list + detail (CREATE/UPDATE/DETAIL) screens, workflow/bulk/custom actions, via the `sdcorejs-angular` orchestrator (loads packs in `_refs/angular/write-code/`). WHY-rules: `_refs/angular/architecture-principles.md`. First step: `sdcorejs-clarify-requirements` (or `sdcorejs-brainstorm` if open-ended).
- **NestJS** (`nest-cli.json` + `@nestjs/*`) — modular Postgres APIs: full CRUD stack via the `sdcorejs-nestjs` orchestrator (loads packs in `_refs/nestjs/write-code/`): init-project, init-admin, init-module, init-entity, actions. WHY-rules: `_refs/nestjs/architecture-principles.md`. First step: `sdcorejs-clarify-requirements` (or `sdcorejs-brainstorm` if open-ended).
- **Next.js** (`next.config.*` + `next`) — production landing sites (SSR/ISR, localization-ready content, SEO, OG, real contact form) via `sdcorejs-nextjs` (packs in `_refs/nextjs/build-website/write-code/`). WHY-rules: `_refs/nextjs/build-website/architecture-principles.md`. First step: **greenfield** → `sdcorejs-brainstorm`; **existing site to improve** → `sdcorejs-review`.

Always end with ONE concrete next step ("Tell me X to proceed"). Don't generate code from here — defer to the track's write-code orchestrator after clarify/plan.

## The workflow (every track shares this shape)

Design phase is cross-track; the code-writing phase is track-specific.

```
Session start / first substantive request
 → sdcorejs-auto-summary          (ensure <project>/.sdcorejs/summary.md exists; GENERATE if missing — never code blind)
Request
 → sdcorejs-brainstorm            (open-ended idea; skip if scope is clear)
 → sdcorejs-clarify-requirements  (blocking — confirm minimum-required inputs)
 → sdcorejs-write-spec
 → sdcorejs-review-spec           (★ user-approval gate)
 → sdcorejs-write-plan
 → sdcorejs-review-plan           (★ user-approval gate)
 → <track>-write-code             (angular | nestjs | nextjs-build-website)
 → FINISH GATE (_refs/shared/finish-gate.md)  ★ MANDATORY + UNCONDITIONAL — one ASK surfacing tests/comments/user-guide/review (fires for standalone triggers too)
 → sdcorejs-test → sdcorejs-review → sdcorejs-repair-loop   (honoring gate answers)
 → sdcorejs-comment-code (applies the gate's comment level — no second ASK)
 → sdcorejs-verify-before-done → sdcorejs-branch-ready
 → auto-docs → write-user-guide (Mode 1: per-module guide) → auto-task-tracker → memories
```

For isolation before generation or parallel work, run `sdcorejs-using-worktrees` first.

## Non-negotiables

- **Project brief first.** Before any code-writing or other substantive work in a target project, ensure `<project>/.sdcorejs/summary.md` exists; if missing, run `sdcorejs-auto-summary` (GENERATE) — it scans via `sdcorejs-code-map` and distills a 1-page brief so generation never hallucinates paths or duplicates shared code. This applies whichever skill you're about to run, not only `<track>-write-code`. Detect the track even in a monorepo — the config (`angular.json` / `nest-cli.json` / `next.config.*`) may live under `apps/*` or `packages/*`, not the repo root. A pure informational question may be answered first.
- **Clarify before code.** Do NOT generate code until the track's minimum-required answers are confirmed (Angular: module + entity + fields + layout; NestJS: module + entity + persistence + transactions; Next.js: domain + contact + hosting + caching). Invoke `sdcorejs-clarify-requirements` first.
- **Approval gates.** `sdcorejs-review-spec` and `sdcorejs-review-plan` require explicit user approval before the next skill runs. **Silence is not approval.**
- **Finish gate (mandatory + unconditional).** After EVERY track code-gen — standalone single-skill trigger ("add entity", "add a page") OR the full SDLC flow — present the consolidated FINISH GATE (`_refs/shared/finish-gate.md`) before any tail step. It surfaces tests (default ON, opt-out), comments (skip/simple/medium/full), user-guide (default ON), review (default ON), and lists the always-on plumbing. NEVER end silently after generating code; the user must always SEE these finishing steps. A one-line request is not an excuse to skip it.
- **Runtime-localized.** Detect the user's language, respond in that language, and preserve locale-specific marks in generated labels/messages. Permission codes and route paths stay English.
- **Core UI first (Angular).** Prefer `@sdcorejs/angular` components when one fits; otherwise scaffold a skeleton + `alert('TODO: …')` stub and flag it.
- **Don't author new skills without explicit user approval.**

## Skill priority

When multiple skills could apply:
1. **Process skills first** (brainstorm, clarify, debug) — they decide HOW to approach the task.
2. **Implementation skills second** (write-code and its sub-skills) — they execute.

"Build X" → brainstorm/clarify first. "Fix bug Y" → `sdcorejs-debug` first.

## Red flags — these thoughts mean STOP, you're rationalizing

| Thought | Reality |
|---|---|
| "This is just a simple question" | Questions are tasks. Check for a skill. |
| "I'll explore the code first" | Skills tell you HOW to explore. Check first. |
| "Scope is obvious, skip clarify" | The user must confirm. Clarify before code. |
| "They probably approve the spec" | Silence isn't approval. Wait for it. |
| "I remember this skill" | Skills evolve. Read the current body. |
| "The skill is overkill here" | If a skill exists for it, use it. |

## Cross-references
- `sdcorejs-using-worktrees` — isolate the workspace before write-code / parallel work
- `sdcorejs-parallel-dispatch` / `sdcorejs-subagent-driven-dev` — fan-out decision + execution
- The full per-track skill inventory and reference docs live in the repo's `CLAUDE.md` when present; this bootstrap is the portable subset.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
