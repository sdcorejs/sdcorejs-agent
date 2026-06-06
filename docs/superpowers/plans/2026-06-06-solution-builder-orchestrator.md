# sdcorejs-solution-builder orchestrator — Implementation Plan (Plan 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add `sdcorejs-solution-builder` — a single one-door orchestrator that takes a non-technical user from a plain feature idea to a running full-stack app, by COMPOSING the skills built in Plans 1–3 (no new generation logic). This is design-doc Phase 4 (`docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md`).

**Architecture:** One dispatchable skill `skills/orchestration/solution-builder.md` (orchestration, because it composes tracks). It chains existing skills in order, keeps BOTH approval gates (plainly worded for non-tech), and ends by handing the user a run guide. It writes nothing itself — every step delegates to an existing skill.

**The chain it runs:**
```
sdcorejs-persona (set/read; non-tech is the default consumer)
  → sdcorejs-clarify-requirements   (feature + UI questions only, per persona rule 7 — never architecture)
  → sdcorejs-write-spec → sdcorejs-review-spec     ★ GATE 1 (plain wording; silence ≠ approval) → auto-specs
  → sdcorejs-write-plan → sdcorejs-review-plan     ★ GATE 2 (plain wording) → auto-plans
  → nestjs-write-code     (BE: init-project → init-module(s) → init-entity(ies) → actions)
  → angular-write-code    (FE: init-portal → init-module(s) → init-entity / screens)   [FE default = Angular]
  → sdcorejs-dockerize    (emit the one-command Docker stack)
  → sdcorejs-auth         (wire Keycloak: realm + FE provideSdKeycloak + BE token validation)
  → sdcorejs-run-guide    (emit plain-language START.md)
  → sdcorejs-verify-before-done   (acceptance gate)
  → "Here is how to run your app" (point at START.md; demo login demo/demo)
```

**Conventions:** English source (the global convention from Plan 3). Persona-aware: non-tech = plain language, hidden mechanics, feature+UI clarify, forced infra defaults; tech may also invoke it but typically uses the granular skills. Composes — never reimplements a sub-skill.

**Repo conventions:** skill source `skills/<area>/*.md`; mirrors generated (never hand-edit); after a `skills/**` change run `bash .claude/sync-skills.sh` then `--check`. Skill body instructs writing to the TARGET project, never this agent repo.

**Prerequisite check (all now exist):** `sdcorejs-persona`, `sdcorejs-clarify-requirements`, `sdcorejs-write-spec`/`-review-spec`, `sdcorejs-write-plan`/`-review-plan`, `nestjs-write-code`, `angular-write-code`, `sdcorejs-dockerize`, `sdcorejs-auth`, `sdcorejs-run-guide`, `sdcorejs-verify-before-done` — confirmed present (40 skills).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `skills/orchestration/solution-builder.md` | Create | Skill `sdcorejs-solution-builder` — the one-door chain. |
| `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` | Modify | Add the skill to the orchestration inventory + a "non-tech one-door" note in the workflow. |
| `TESTING.md` | Modify | Add Test 10 — solution-builder one-door flow. |
| `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md` | Modify | Mark Phase 4 shipped (→ design fully delivered). |
| mirrors (`.claude/**`, `plugin/**`) | Generated | `sync-skills.sh` only. |

---

## Task 1: `sdcorejs-solution-builder` skill

**Files:** Create `skills/orchestration/solution-builder.md`

- [ ] **Step 1: Author the skill** (English). Frontmatter:
  - `name: sdcorejs-solution-builder`
  - `description:` (English) — "One-door orchestrator that turns a plain feature idea into a running full-stack app for non-technical users (PO/QC). Composes the existing skills end to end: set persona → clarify (features + screens, never architecture) → spec/plan (two plain approval gates) → backend (nestjs-write-code) → frontend (angular-write-code, Angular default) → dockerize → auth (Keycloak) → run-guide, then tells the user how to run it. Does NOT reimplement any step — it delegates. Triggers - "build me an app / a system", "I want software that does X", "make a tool to manage Y", "build the whole thing", "vibe code an app", plus the non-tech entry when someone describes software in domain terms without technical detail. NOT for a single isolated change (use the specific skill). Applies to angular + nestjs (full stack). Bilingual (runtime: respond in the user's language; non-tech is the default audience)."
  - `allowed-tools: Read, Write, Edit, Bash, Glob`
  - Body sections:
    - **# Solution Builder — One Door, Whole App** + Purpose (non-tech: one conversation → a running app; the pack handles all the technical work).
    - **## When invoked / NOT** — invoked: the triggers, or whenever a non-tech user asks for a whole piece of software. NOT: a single isolated change (route to the specific skill); when the user is clearly a developer driving the granular flow themselves.
    - **## Step 0 — persona** — invoke/read `sdcorejs-persona`; default this entry to non-tech framing. Load `_refs/shared/persona.md`. Non-tech = plain language, hide skill names/mechanics, feature+UI framing.
    - **## The chain** — a numbered, plain-language walkthrough that delegates each step to the named existing skill (the chain in this plan's header). For EACH step: one sentence on what the user sees + which skill runs. Make explicit:
      - clarify uses feature + screen questions only (persona rule 7) — derive modules/entities/fields internally, confirm as plain outcomes.
      - BOTH gates kept, plainly worded ("Does this match what you wanted?" not "approve the spec"); silence ≠ approval; on approval the auto-specs/auto-plans snapshots fire (mandatory).
      - BE first (`nestjs-write-code`: init-project → modules/entities → actions), then FE (`angular-write-code`), then `dockerize` → `auth` → `run-guide`.
      - End with `sdcorejs-verify-before-done` then a plain "here is how to start your app" pointing at `START.md` + the demo login (`demo`/`demo`).
    - **## Composes, does not reimplement** — explicitly: this skill only sequences other skills; if a sub-step needs detail, read that sub-skill. Each generation step still writes to the TARGET project, never this agent repo.
    - **## Resumability** — the chain is long; if interrupted, `sdcorejs-recovery` + the `.sdcorejs/` docs let it resume mid-chain. Note the gates are natural pause points.
    - **## Tech users** — may invoke it, but the granular skills give finer control; this is optimized for the non-tech one-door experience.

- [ ] **Step 2: Frontmatter + sync gate.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/check-skill-frontmatter.sh skills/orchestration/solution-builder.md && bash .claude/sync-skills.sh >/dev/null && bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && test -f .claude/skills/sdcorejs-solution-builder/SKILL.md && test -f plugin/skills/sdcorejs-solution-builder/SKILL.md && echo SB_OK
```
Expected: frontmatter exit 0; four "in sync" (41 source files now); `SB_OK`.

- [ ] **Step 3: Commit.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && git add skills/orchestration/solution-builder.md .claude/skills plugin/skills && git commit -F - <<'MSG'
feat(orchestration): sdcorejs-solution-builder — one-door non-tech full-app orchestrator

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 2: Wire entry files + TESTING + design

**Files:** Modify `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `TESTING.md`, design doc

- [ ] **Step 1: Entry files** — add `sdcorejs-solution-builder` to each file's orchestration skill inventory (CLAUDE.md "Orchestration plumbing" table + AGENTS/copilot equivalents) with a one-line trigger. Add a "**Non-tech one-door**: `sdcorejs-solution-builder` chains persona → clarify → spec/plan(gates) → nestjs-write-code → angular-write-code → dockerize → auth → run-guide" note to each file's workflow section. English. Verify: `grep -c "sdcorejs-solution-builder" CLAUDE.md AGENTS.md .github/copilot-instructions.md` → each ≥2.

- [ ] **Step 2: TESTING.md — Test 10.** After Test 9, add `### Test 10 — Solution builder (one door)`:
  - Prompt (non-tech, VI): `tôi muốn một phần mềm quản lý kho đơn giản` → dispatches `sdcorejs-solution-builder`.
  - Pass criteria: asks ONLY feature + screen questions (never module/entity/architecture); keeps both plain approval gates; after approval runs BE (nestjs) + FE (angular) + dockerize + auth + run-guide; ends by telling the user `docker compose up` → http://localhost:4200 → login `demo`/`demo`; everything written to the TARGET project, not the agent repo.

- [ ] **Step 3: Design doc** — Sequencing, change the Phase 4 line trailing `— Plan 4.` to `— ✅ shipped (Plan 4).` Add a one-line "Design fully delivered (Phases 1–4 shipped)." note near the top status if a Status field exists.

- [ ] **Step 4: Full validation + commit.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && for f in CLAUDE.md AGENTS.md .github/copilot-instructions.md; do printf "%s: " "$f"; grep -c "sdcorejs-solution-builder" "$f"; done; grep -c "Test 10 — Solution builder" TESTING.md; grep -n "shipped (Plan 4)" docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md; npx lefthook run check 2>&1 | tail -6 ; bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && git add -A && git commit -F - <<'MSG'
docs(orchestration): wire solution-builder into entry files + TESTING; mark Phase 4 shipped (design delivered)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```
Expected: each entry file ≥2; Test 10 = 1; Phase-4-shipped line found; lefthook ✓; mirrors in sync (41 skills).

---

## Self-review notes (author)
- **Spec coverage:** implements design §Phase 4 (the `sdcorejs-solution-builder` chain). With this, design Phases 1–4 are all shipped.
- **Composes, doesn't reimplement:** the skill only sequences existing skills (all confirmed present). No new generation templates.
- **English source** (Plan 3 convention) applied. Persona-aware (non-tech default). Both approval gates kept, plainly worded.
- **Adapted "tests":** docs/skills repo — verification = frontmatter check, mirror `--check`, smoke test (Test 10). A real end-to-end run (clarify→…→running app) is an E2E in a target project, out of scope to land this plan.

## Deferred (unchanged from Plan 3)
- Retrofit the ~40 existing VI-laden skill descriptions to English (separate sweep).
- `_refs/nestjs/review-code.md` still says `be-masterdata`.
- nestjs integration-test pack.
