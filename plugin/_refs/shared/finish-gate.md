# Finish Gate (cross-track) — consolidated finishing-steps ASK

Loaded by every track write-code orchestrator (`sdcorejs-angular` · `sdcorejs-nestjs` · `sdcorejs-nextjs`). The gate is **MANDATORY and UNCONDITIONAL**: present it after EVERY code-generation, whether the skill was reached through the full SDLC flow OR triggered standalone (e.g. "add entity", "create module X", "add a page"). It exists so the user ALWAYS KNOWS these finishing steps exist and can choose — the steps are never silently skipped, and never silently auto-run without the user seeing them.

> **Why this gate exists:** standalone skill triggers used to stop right after code-gen, so tests, comments, and the user guide silently never happened — the user couldn't even tell those steps existed. The gate makes the whole finishing chain visible at one decision point, every time.

## When to present
Immediately after the last code-generating reference pack finishes, and BEFORE running any tail step. Present exactly once per code-gen invocation. This applies even to a one-line standalone request — "small change" is NOT a reason to skip the gate.

## The prompt (present it, then wait for the answer)
Adapt to the user's language (full diacritics for VI). Defaults are pre-selected; the user can accept all by saying "proceed" / "OK" / "tiếp" or change any item.

> **Code generated for `<scope>`. Finishing steps — defaults in brackets. Say "proceed" to accept all, or tell me what to change:**
> 1. **Tests** — [✅ write now, RED-first, `standard` coverage]. Options: `skip` · `minimal` · `standard` · `full`.
> 2. **Comments** — [pick one]: `skip` · `simple` · `medium` · `full`. *(This is the `orchestration/comment-code` choice — there is no separate prompt later.)*
> 3. **User guide** — [✅ update the module guide (`.sdcorejs/user-guide/<module>.md`)]. Option: `skip`.
> 4. **Review** — [✅ run convention review + repair loop]. Option: `skip`.
>
> *Always-on (run regardless, no opt-out — listed so you know): verify acceptance criteria, branch-hygiene sweep, session docs, task tracker, durable memories.*

## Rules
- **UNCONDITIONAL.** The gate fires for standalone single-skill triggers too, not only the SDLC flow. A one-line "add entity" still gets the gate.
- **Tests default ON** (RED-first, `standard`). The user may opt out (`skip`) or change the level. If the user says nothing about tests, write them — silence means accept the default, never means skip. (Aligns with the always-write-tests intent — now visible and adjustable. See `[[feedback-angular-tests-always-red-first]]`.)
- **Comments are a required pick** (the existing comment-code ASK, folded in). `skip` is a valid pick, but the user must see the choice. Do NOT also run a second comment-code ASK afterwards.
- **User guide + Review default ON**; the user may `skip` either.
- After the user answers (or says "proceed"), execute the tail steps honoring the choices, in the orchestrator's defined order. A skipped step is omitted; everything not skipped runs.
- **Plumbing always runs** (verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories). These are not opt-out, but the gate lists them so the user is aware they happen.
- Localize the prompt; keep identifiers, permission codes, and route paths in English in both languages.
- If the user already gave explicit instructions this turn (e.g. "add entity X with full tests and medium comments"), pre-fill the gate from those answers and present it for a quick confirm rather than re-asking blindly.

## Order of execution after the gate
1. (if tests not skipped) `sdcorejs-test` — run the RED-first specs written during the TDD gate + add happy-path; report pass/fail
2. (if review not skipped) `sdcorejs-review` → `orchestration/repair-loop`
3. `orchestration/comment-code` — apply the level the gate captured (no second ASK)
4. `orchestration/verify-before-done` *(always)*
5. `orchestration/branch-ready` *(always)*
6. `orchestration/auto-docs` *(always)*
7. (if user guide not skipped) `sdcorejs-write-user-guide` (Mode 1)
8. `orchestration/auto-task-tracker` *(always)*
9. `orchestration/memories` *(when durable knowledge surfaced)*
