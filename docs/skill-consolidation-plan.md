# Skill Consolidation Plan (PR2 — "tinh gọn")

> Goal: shrink the dispatch surface (~58 skills) without losing capability, by
> applying the proven `sdcorejs-review-code` pattern — **one track-aware skill +
> knowledge in `_refs/<track>/`** — to the review, testing, and onboarding families.
>
> Status: DESIGN — needs approval before execution. Each step ships as its own PR.

## Principle (why this works)

| Thing | Nature | Can it shrink? |
|---|---|---|
| **Skill** | active dispatch unit; fires on `description` match; runnable standalone | merge siblings into one track-aware skill; can't delete if it has a real user trigger |
| **Reference (`_refs`)** | passive knowledge; only read when a skill points to it | this is where *what-to-check / templates / conventions* belong |

So the lever is: **collapse per-track skill *variants* into one track-aware skill, push their checklists/probes into `_refs/<track>/`.** A single track-aware skill detects the stack (the `review-code` Step-0 table already does this) and loads the matching knowledge file.

Not recommended: one mega `sdcorejs-angular` skill. A catch-all description over-triggers on near-misses or misses specific intents, the body balloons past the ~500-line budget and loads in full every time, and standalone gates (review/test) lose independent invocation. Cross-track design-phase skills (`brainstorm`/`clarify`/`write-spec`/`write-plan`) are already shared and cannot fold into a per-track skill.

## Current inventory (review + test + onboarding = 24 skills)

```
review/   code(1, track-aware ✓)  architecture(1, cross-track ✓)
          security: shared + angular + nestjs + nextjs          = 4
          performance: budget + angular + nestjs + nextjs       = 4
          accessibility: baseline + angular + nextjs            = 3
testing/  philosophy(1)  tdd(1)
          e2e: angular + nestjs + nextjs                        = 3
          integration: angular + nestjs                         = 2
          unit: angular + nestjs                                = 2
onboarding angular + nestjs + nextjs-build-website              = 3
```

## Step 1 — `sdcorejs-review-security` (the template; 4 → 1)

The worked example every other dimension copies.

**Before:** `review/security/{shared,angular,nestjs,nextjs}.md` → 4 skills.
**After:** one skill `review/security.md` (name `sdcorejs-review-security`) + knowledge in `_refs/<track>/review-security.md` (+ `_refs/shared/review-security.md` for the cross-track baseline).

**Skill body (≤120 lines):**
1. **Step 0 — detect track** (reuse the `review-code` signal table: `angular.json` / `nest-cli.json` / `next.config.*`).
2. **Step 1 — load knowledge:** `_refs/shared/review-security.md` (always) + `_refs/<track>/review-security.md` (if track detected).
3. **Step 2 — review** against the loaded checklists + run the probes the ref provides.
4. **Step 3 — emit** the unified severity report (🔴 Critical / 🟡 Important / 🔵 Minor + 🟢 Strengths, Fix + Tradeoff) — same format owned here, identical to `review-code`.

**`_refs` layout:**
```
_refs/shared/review-security.md          # cross-track baseline (was review/security/shared.md)
_refs/angular/review-security.md         # OWASP + Core-UI/XSS/token specifics (was review/security/angular.md)
_refs/nestjs/review-security.md          # guard order, injection, secrets (was review/security/nestjs.md)
_refs/nextjs/review-security.md          # dangerouslySetInnerHTML, server-only leaks (was review/security/nextjs.md)
```

**Description (focused, <1024):** "Use to security-review … detects the stack, loads `_refs/<track>/review-security.md` … Triggers - 'review bảo mật', 'security audit', 'rà soát bảo mật', …". One discriminating trigger set — no precision loss vs the 4 separate descriptions.

**Migration:** `git mv` the 4 bodies' knowledge into `_refs/...`, write the new orchestrator skill, `sync-skills.sh --clean` to drop the 4 stale mirror dirs, bump version, changelog the breaking name change. Verify: `--check` clean, frontmatter pass, a dispatch smoke test per track.

## Step 2 — apply the template to the rest

- `sdcorejs-review-performance` (budget + 3 tracks → 1; budget → `_refs/shared/review-performance.md`).
- `sdcorejs-review-accessibility` (baseline + angular + nextjs → 1; baseline → `_refs/shared/`).
- `sdcorejs-test` (e2e + integration + unit, per track → **one track-aware testing skill**; `philosophy.md` → `_refs/shared/testing-philosophy.md`; RED-first discipline lives as `sdcorejs-test (tdd mode)` backed by `_refs/shared/tdd.md`).

**Net:** review 13 → 5 (code, architecture, security, performance, accessibility) ; testing 8 → 1 (`sdcorejs-test` with `tdd mode`). Combined **21 → 6**. Whole pack keeps shrinking as infrastructure-only skills fold into workflow skills.

Stretch (optional, looser triggering): merge security+performance+accessibility into one `sdcorejs-review-quality` → review 13 → 3. Offered as a lever, not the default.

## Onboarding — is it necessary? (recommendation: **fold/cut, –2 or –3**)

The 3 per-track onboarding skills (`angular-onboarding`, `nestjs-onboarding`, `nextjs-build-website-onboarding`) **largely duplicate `sdcorejs-using-skills`** — the bootstrap that is **injected into context every session** (SessionStart hook). The bootstrap already: explains the pack, shows the workflow, lists how to dispatch, carries the non-negotiables, and routes to `clarify`/`brainstorm`. That is exactly what onboarding answers for "what can you do / how do I start / agent này làm được gì".

What per-track onboarding adds beyond the bootstrap is thin: a track-specific flow recap + a link to `_refs/<track>/architecture-principles.md`. That can live in the bootstrap (one line per track) or be loaded on demand.

Token note: cutting onboarding adds **no** new always-on cost — the bootstrap is already loaded; onboarding skills only cost when triggered. So removing them is a clean win.

**Options:**
- **A (recommended): cut all 3.** Enrich `using-skills` with a 1-line "what can you do" answer + per-track `architecture-principles` pointers. The bootstrap handles "help/what can you do/how to start". **–3 skills.**
- **B (conservative): fold 3 → 1 cross-track `sdcorejs-onboarding`** (track-aware) for a dispatchable "help" entry distinct from session-start context. **–2 skills.**

Pick A if you trust the always-on bootstrap to field "help" (it already fires every session); B if you want an explicit on-demand help skill.

## Rollout (low → high risk, "dần")

1. `sdcorejs-review-security` (template) — prove the pattern end-to-end.
2. `sdcorejs-review-performance` + `sdcorejs-review-accessibility`.
3. `sdcorejs-test`.
4. Onboarding decision (A or B).

Each = own PR + this doc's section as the spec + approval gate before edits (per the repo rule: no skill restructure without explicit approval). Every step: `sync-skills.sh --clean`, version bump, changelog, dispatch smoke test, lefthook green.

## Breaking-change ledger (cumulative)

Renamed/removed skill names across PR2 (consumers must update): `sdcorejs-review-{security,performance,accessibility}-<track>` → per-dimension single skills; `sdcorejs-testing-{e2e,integration,unit}-<track>` → `sdcorejs-test`; onboarding per option A/B. Batch under one minor bump (e.g. 0.3.0) at PR2 completion, or bump per step.
