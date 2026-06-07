---
name: sdcorejs-solution-builder
description: One-door orchestrator that turns a plain feature idea into a running full-stack app for non-technical users (PO/QC). Composes the existing skills end to end - set persona, clarify (features + screens, never architecture), spec/plan (two plain approval gates), backend (nestjs-write-code), frontend (angular-write-code, Angular default), dockerize, auth (Keycloak), run-guide - then tells the user how to run it. Does NOT reimplement any step; it delegates. Triggers - "build me an app / a system", "I want software that does X", "make a tool to manage Y", "build the whole thing", "vibe code an app", and the non-tech entry when someone describes software in domain terms without technical detail. NOT for a single isolated change (use the specific skill). Applies to angular + nestjs (full stack). Bilingual (runtime: respond in the user's language; non-tech is the default audience).
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Solution Builder — One Door, Whole App

## Purpose

One conversation, one running app. The user describes — in plain words — the software they want; this skill drives the whole pipeline that turns that idea into a packaged, runnable full-stack application (backend + screens + login + one-command start). The user never touches architecture, never names a module, never installs a tool.

For a non-tech owner the promise is: *describe what you want → the pack builds it, packages it, and tells you the one command to run it.* Everything technical happens behind the scenes; the user only reacts to plain-language checkpoints and, at the end, runs the app.

This skill is a conductor. It **composes** the existing skills in order — it does not reimplement any of them. Each step delegates to the skill that owns that work.

## When invoked / NOT

**Invoked when:**
- Any trigger above: "build me an app / a system", "I want software that does X", "make a tool to manage Y", "build the whole thing", "vibe code an app".
- A non-technical request for a **whole piece of software** — someone describes an application in their own domain terms (e.g. "I need something to manage my warehouse — stock in, stock out, low-stock alerts") without any technical detail. This is the default front door for that audience.

**NOT for:**
- A single isolated change. Route straight to the specific skill instead of spinning up the whole chain — e.g. "add one endpoint" → `nestjs-write-code`; "add a column to the list screen" → `angular-write-code`; "dockerize what I already have" → `sdcorejs-dockerize`. Tell the user the smaller skill is the better fit.
- A developer who is clearly driving the granular flow themselves (already invoking `sdcorejs-write-spec`, `sdcorejs-write-plan`, the per-track write-code skills). Step aside and let them — see **## Tech users**.

## Step 0 — persona

Before anything else, set the audience.

1. Run / read `sdcorejs-persona`. This front door **defaults to NON-TECH framing** — the entry triggers (someone describing software in domain terms) signal a PO/QC owner, so when persona is unset, present the non-tech path as the default.
2. Load `_refs/shared/persona.md` and apply the matching contract for the rest of the conversation.

Non-tech means, for every later step:
- **Plain language** — no unexplained jargon; explain what a step does and how to react, in the user's own words.
- **Hide the mechanics** — never narrate skill names or pipeline internals to the user ("now running repair-loop" is forbidden). Report progress as outcomes ("the screens are built and checked"). Skill names in this document stay in parentheticals **for maintainers only**.
- **Feature + UI framing** — talk about what the software does and what the user will see; never about modules, entities, tables, or APIs.
- **Forced infra defaults** — the generated software is always: **Angular** frontend, **NestJS** modular-monolith backend, **Keycloak** auth, **Postgres**, packaged as **docker-compose** (one `docker compose up`); the generated backend uses the **`simple`** NestJS profile (single-tenant, role-based login) — the user is never asked about multi-tenancy, permission matrices, or architecture; and a **single deploy-root** topology (one folder with sibling `frontend/` + `backend/` apps — NOT a monorepo `base/shared` kernel, NOT separate published packages). The non-tech door never asks about repository layout. The user is not asked to choose any of these.

## The chain

Drive these steps in order. For the non-tech user, narrate only the plain-language sentence — the skill named in each parenthetical is for maintainers.

1. **Understand what you want** *(`sdcorejs-clarify-requirements`)* — Ask the user ONLY about (a) what the software should do and (b) what they will see on screen — per persona rule 7, never about architecture, modules, entities, fields, or storage. From those answers, **derive the modules / entities / fields / data model internally**, then confirm them back as plain outcomes — e.g. "I'll store products with name, code, quantity, and price — correct?" The user reacts to a concrete proposal; they never design it. *(Maintainer note: the NestJS **profile** is forced to `simple` for this non-tech door — never surfaced. A developer who needs `enterprise` drives the granular `sdcorejs-clarify-requirements` flow instead.)*

2. **Write it down + check with you** *(`sdcorejs-write-spec` → `sdcorejs-review-spec` = **GATE 1**)* — Capture the agreed features and screens as a spec, then read it back plainly: "Does this match what you wanted?" **Silence is NOT approval** — wait for an explicit yes; iterate on any "no". On approval, the approved spec is snapshotted automatically (`orchestration/auto-specs`).

3. **Plan the build + check again** *(`sdcorejs-write-plan` → `sdcorejs-review-plan` = **GATE 2**)* — Lay out the build steps and confirm again, in plain words ("Here's how I'll build it — good to go?"). Same rule: explicit approval only, silence is not consent. On approval, the approved plan is snapshotted automatically (`orchestration/auto-plans`).

4. **Build the engine room + the screens together** *(`subagent-driven-dev` Mode B — role-split feature loop)* — Instead of building the backend and the screens one after another, build them at the same time: first lock down exactly how the data and screens talk to each other (the contract), then a backend builder, a screen builder, and a quality-checker all work in parallel, and the result is checked against what you approved and refined until it matches. To the user this is just "building the part that stores your data and the screens you'll use, together, and checking them against what you asked for." *(Maintainer note: this runs the contract-freeze barrier → backend (`nestjs-write-code`, simple profile) ‖ frontend (`angular-write-code`) ‖ QC, looped via `sdcorejs-verify-before-done` against the spec's Acceptance Criteria, cap 3 iterations. The older sequential path — `nestjs-write-code` then `angular-write-code` — remains a valid fallback for a single-track feature or if Mode B escalates. The orchestrator passes Mode B its inputs EXPLICITLY — `profile=simple` and `topology=single deploy-root` (FE mirrors the BE DTOs; no `base/shared`) — it does NOT rely on `.sdcorejs/summary.md` (which is written only at the end of init-project, so it is absent on a first build).)*

5. **Package it to run with one command** *(`sdcorejs-dockerize`)* — Wrap frontend + backend + database into a single runnable stack so the whole app starts with one command. To the user: "packaging it so you can run it on your machine without installing anything."

6. **Add login** *(`sdcorejs-auth`)* — Wire authentication (Keycloak) into the frontend and backend so the app has a real login screen and demo credentials.

7. **Write the start guide** *(`sdcorejs-run-guide`)* — Emit `START.md` — a plain, numbered guide that takes the user from a fresh machine to a running app.

8. **Final check** *(`sdcorejs-verify-before-done`)* — Verify the result against what was agreed at the gates. To the user: "checking everything works the way you asked."

9. **Tell the user how to run it** — Close in plain language: "Open a terminal in this folder, type `docker compose up`, wait a moment, then open http://localhost:4200 in your browser and log in with **demo / demo**." Point them at `START.md` for the full guide and for how to stop or reset it.

## Composes, does not reimplement

This skill ONLY sequences other skills. It contains no spec-writing, code-generation, dockerizing, or auth logic of its own — for the detail of any step, read that step's sub-skill (named in the parenthetical). If a step's behavior needs to change, change it in the owning skill, not here.

Every generation step (clarify/spec/plan/backend/frontend/dockerize/auth/run-guide) writes to the **TARGET project**, never to this agent repo. This document is instructions for the orchestrating agent; the artifacts land in the user's project.

## Resumability

The chain is long, so it is built to survive interruption.

- If a session is interrupted mid-chain, resume with `sdcorejs-recovery` plus the target project's `.sdcorejs/` docs (the persisted persona, specs, plans, and session summaries) — together they reconstruct where the build stopped and what's left.
- The **two approval gates** (GATE 1 spec, GATE 2 plan) are natural pause points — a build commonly stops there waiting on the user and resumes cleanly once they answer.

## Tech users

A developer may invoke this skill, and it will work. But the granular skills give finer control — picking the stack, shaping the spec, reviewing each plan task, choosing comment levels. A developer who wants that control should drive the per-track skills directly (`sdcorejs-write-spec` → `sdcorejs-write-plan` → `nestjs-write-code` / `angular-write-code` → `sdcorejs-dockerize` → …). This one-door experience is optimized for the **non-technical owner** who wants a running app without touching any of those levers.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
