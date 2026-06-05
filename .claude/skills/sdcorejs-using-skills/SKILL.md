---
name: sdcorejs-using-skills
description: Bootstrap that teaches how to find and dispatch sdcorejs skills — INJECTED AT SESSION START so dispatch discipline holds even when the repo's CLAUDE.md is absent (e.g. installed as a plugin in a foreign project). Establishes the clarify → spec → plan → write-code → review → ship flow, the user-approval gates, and the rule that a relevant skill MUST be invoked before responding. Triggers - session start, "what can you do", "skills nào dùng được", or any request that matches an sdcorejs skill. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Glob
---

# Using sdcorejs Skills

You have the **sdcorejs SDLC skill pack** — an orchestrated software-development lifecycle for three stacks: **Angular Portal** (`@sdcorejs/angular`), **NestJS + Postgres**, and **Next.js** public sites. This bootstrap establishes how to use it. It is injected at session start so it works in any project, with or without the repo's `CLAUDE.md`.

## The rule

**When a request matches a skill, invoke that skill BEFORE responding — including before clarifying questions.** Even a 1% chance a skill applies means invoke it to check; if it turns out wrong, you don't have to follow it. Skills tell you HOW to explore, plan, and build — checking first prevents undisciplined work.

## How to dispatch

1. Match the request against each skill's `description` (the "Use when…" trigger).
2. Pick the highest-confidence match. If several tie, pick the earliest in the workflow (clarify before plan, plan before write-code).
3. Invoke it via the `Skill` tool and follow its body exactly.
4. If nothing matches, ask a clarifying question or invoke the track's onboarding skill (`angular-portal-onboarding`, `nestjs-onboarding`, `nextjs-build-website-onboarding`).

## The workflow (every track shares this shape)

Design phase is cross-track; the code-writing phase is track-specific.

```
Request
 → sdcorejs-brainstorm            (open-ended idea; skip if scope is clear)
 → sdcorejs-clarify-requirements  (blocking — confirm minimum-required inputs)
 → sdcorejs-write-spec
 → sdcorejs-review-spec           (★ user-approval gate)
 → sdcorejs-write-plan
 → sdcorejs-review-plan           (★ user-approval gate)
 → <track>-write-code             (angular-portal | nestjs | nextjs-build-website)
 → testing/e2e → review/code → sdcorejs-repair-loop
 → sdcorejs-comment-code (ASK gate)
 → sdcorejs-verify-before-done → sdcorejs-branch-ready
 → auto-docs → auto-task-tracker → memories
```

For isolation before generation or parallel work, run `sdcorejs-using-worktrees` first.

## Non-negotiables

- **Clarify before code.** Do NOT generate code until the track's minimum-required answers are confirmed (Angular: module + entity + fields + layout; NestJS: module + entity + persistence + transactions; Next.js: domain + contact + hosting + caching). Invoke `sdcorejs-clarify-requirements` first.
- **Approval gates.** `sdcorejs-review-spec` and `sdcorejs-review-plan` require explicit user approval before the next skill runs. **Silence is not approval.**
- **Bilingual.** Vietnamese request → Vietnamese output (full diacritics for labels/messages). English → English. Permission codes and route paths stay English in both.
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
