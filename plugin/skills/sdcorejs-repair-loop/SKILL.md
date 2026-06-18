---
name: sdcorejs-repair-loop
description: Use after sdcorejs-review (source: review-code) OR sdcorejs-ship verify-before-done mode (source: verify-before-done) produces findings. Caller MUST pass source context so the re-verify step runs the correct tool. First VERIFIES each finding is genuine, then fixes systematically, re-runs per-source verification, iterates until Critical + Important are resolved or deferred. Triggers - "fix findings", "apply review findings", "fix review issues", "fix critical issues", or localized equivalents, or auto-invoked after sdcorejs-review or acceptance verification outputs findings. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Edit, Write, Bash, Grep
---

# Repair Loop


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

Thin dispatch skill for applying findings and re-verifying them. The detailed loop lives in `_refs/orchestration/tail/repair-loop.md`.

## Workflow
1. Determine the source of findings: `review-code`, `verify-before-done`, `linter`, or `manual`.
2. Read `_refs/orchestration/tail/repair-loop.md` completely.
3. Verify each finding is genuine before changing code.
4. Categorize findings into auto-apply, confirm-then-apply, or user-decision tiers.
5. Apply only the allowed tier for the current pass, then re-run the verification command required by the source.
6. Iterate until Critical and Important findings are fixed, explicitly deferred, or the reference's convergence cap is reached.

## Handoff
- After convergence, hand off to `sdcorejs-ship (verify-before-done mode)` for acceptance verification.
- If findings do not converge after the capped loop, stop and ask the user to choose the next direction.
- Do not hand off to `sdcorejs-git (commit mode)` until the final verification pass is green.

## Rules
- Do not silently apply user-decision findings.
- Do not disable tests to make the loop pass.
- Do not hide stale, mis-scoped, redundant, or unclear findings; report them separately.
- Do not claim convergence without re-running the source-specific verification.

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
