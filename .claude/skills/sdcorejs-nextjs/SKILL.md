---
name: sdcorejs-nextjs
description: Next.js website code executor for approved/direct site builds with confirmed requirements. Use for bootstrap, theme, pages/sections, SEO/OG, i18n, caching/ISR, responsive fixes, contact form, content quality, or reuse of @sdcorejs/utils utilities. Loads _refs/nextjs/build-website/write-code/ packs; use sdcorejs-review for existing-site audits. Runs mandatory finish tail. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Bash, TodoWrite
---

# Build Website — Write Code Orchestrator


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Single entry point for generating Next.js landing-site code. This skill is the dispatch layer between the approved plan (or a direct request) and the focused REFERENCE PACKS that hold the per-concern generation rules. It does NOT inline those rules — it reads the right pack on demand. The ten packs under `_refs/nextjs/build-website/write-code/` were standalone sub-skills before they were consolidated here so the track exposes one orchestrator instead of eleven.

## When invoked
- After `sdcorejs-execute-plan` dispatches an approved Next.js plan
- User says "generate code", "go ahead", "OK proceed", or localized equivalents
- A direct build-website request matching any capability in the dispatch table below
- After `sdcorejs-explore (recovery mode)` and user explicitly resumes work

Do NOT invoke if:
- No plan exists or plan is unapproved -> go back to `sdcorejs-brainstorming` / `sdcorejs-spec` / `sdcorejs-plan`
- Scope changed since plan was approved -> re-plan with `sdcorejs-plan`
- The user wants to AUDIT an existing site (not generate) → `sdcorejs-review`

## Step 0 — Pre-flight: ensure project summary

Before reading the plan or dispatching, run `sdcorejs-explore (summary mode)`. For an EXISTING site (taking over / extending), if `<target>/.sdcorejs/summary.md` is missing it MUST be generated first (`sdcorejs-explore` scans the code map and distills the brief) so generation slots into the real app-router / component / content structure instead of guessing. For a brand-new site (`init-site` in scope), there is nothing to summarize yet — run summary mode AFTER init scaffolds the project.

Before writing any helper, formatter, validator, mapper, paging/filter helper, random-id helper, query-param helper, upload/download helper, clipboard/browser helper, API-route utility, hook utility, or `src/lib/utils.ts` addition, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` when it covers the behavior. Keep `next-intl` for locale-bound UI formatting; use `@sdcorejs/utils` for shared pure helper behavior. The package must be a direct target-project dependency before generated code imports it.

## Dispatch table

Read the approved plan (or the direct request). Match the work items to the reference pack; READ that pack on demand and follow it. Dispatch in the order listed in the "Full build" row (order matters — theme + i18n + content architecture must exist BEFORE pages are composed).

| User intent / plan item | Reference pack to read | Phase |
|---|---|---|
| "Start a new site from scratch" | the full sequence below | Full build |
| "Init project only" | [`_refs/nextjs/build-website/write-code/init-site.md`](_refs/nextjs/build-website/write-code/init-site.md) | Bootstrap |
| "Pick / change theme" | [`_refs/nextjs/build-website/write-code/theme.md`](_refs/nextjs/build-website/write-code/theme.md) | Tokens |
| "Add a page" / "add page X" / "add hero / testimonials block" / localized equivalents | [`_refs/nextjs/build-website/write-code/pages-and-blocks.md`](_refs/nextjs/build-website/write-code/pages-and-blocks.md) | Composition |
| "Set up SEO" / "fix meta tags" | [`_refs/nextjs/build-website/write-code/seo.md`](_refs/nextjs/build-website/write-code/seo.md) | SEO |
| "OG preview broken" / "social preview image missing" | [`_refs/nextjs/build-website/write-code/og-preview.md`](_refs/nextjs/build-website/write-code/og-preview.md) | OG |
| "Add English" / "add EN" | [`_refs/nextjs/build-website/write-code/i18n.md`](_refs/nextjs/build-website/write-code/i18n.md) | i18n |
| "Cache duration is too long/short", "ISR settings" | [`_refs/nextjs/build-website/write-code/caching.md`](_refs/nextjs/build-website/write-code/caching.md) | Cache |
| "Responsive layout broken on mobile" | [`_refs/nextjs/build-website/write-code/responsive.md`](_refs/nextjs/build-website/write-code/responsive.md) | Responsive |
| "Contact form does not send email" / "real form" | [`_refs/nextjs/build-website/write-code/contact-form.md`](_refs/nextjs/build-website/write-code/contact-form.md) | Form |
| "Thin content" / "review content" / "language parity" / "Article schema" / localized equivalents | [`_refs/nextjs/build-website/write-code/content-quality.md`](_refs/nextjs/build-website/write-code/content-quality.md) | Content |

Read ON DEMAND only — load the one pack for the step you are executing. Each pack further links to track-level reference data under `_refs/nextjs/build-website/`.

## Full-build execution sequence

For a new site, read and apply the packs in this order:

```
1. init-site.md          ← Bootstrap; creates folder structure, deps, env template
                            Output: runnable `npm run dev` with empty pages
2. theme.md              ← Apply industry palette / typography / design tokens
                            Output: tokens in tailwind.config + globals.css
3. i18n.md               ← next-intl setup, /vi /en routing, messages skeleton
                            Output: locale switcher, all UI strings go through next-intl
4. pages-and-blocks.md   ← Page set + section library; externalize content to content/<locale>/
                            Output: each page composed of imported section blocks
5. seo.md                ← generateMetadata factory + JSON-LD + sitemap + robots
                            Output: every page gets proper metadata
6. og-preview.md         ← Static fallback + dynamic per-page (if Standard/Full tier)
                            Output: opengraph-image.tsx per route segment
7. caching.md            ← Apply ISR 30-min default per route; on-demand revalidation for forms
                            Output: cache directives on each page
8. responsive.md         ← Audit breakpoints, image sizes, font loading
                            Output: mobile-pass on all pages
9. contact-form.md       ← Real API route + email service + validation + rate limit
                            Output: working form, test email sent
10. content-quality.md   ← language parity check + min word counts + prose typography + Article schema + on-page SEO
                            Output: `npm run check:i18n` + `npm run check:content` pass; Tailwind Typography wired; long-form copy meets thresholds
```

When `sdcorejs-parallel-dispatch` green-lights parallelism (3+ independent units, no shared file edits), the orchestrator MAY let it fan out — typically:
- Section components (hero, features, testimonials, …) can be generated in parallel
- SEO + OG + sitemap can run in parallel after pages exist
- i18n message extraction can fan out across content/<page>.json files

Steps 1–4 are sequential (each depends on the previous). Steps 5–8 can be parallel after step 4 lands.

## After all dispatched packs complete

### MANDATORY FINISH GATE (always — standalone trigger OR full SDLC flow)

**STOP and present the consolidated finish gate from [`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md) before running ANY tail step.** UNCONDITIONAL: it fires even when this skill was triggered directly for a one-line request (e.g. "add a page", "add a section") — NOT only inside the spec→plan flow. The gate surfaces tests / comments / user-guide / review with defaults so the user always knows these steps exist and can opt out. "Small change" is not a reason to skip the gate.

Then run the tail-call chain, honoring the gate's answers (skip = omit that step; everything not skipped runs):

```
FINISH GATE (always, unconditional) ← surfaces the choices below
   ↓
sdcorejs-test  (if Tests not skipped)  ← happy-path tests for each generated page
   ↓
sdcorejs-review (if Review not skipped) ← convention check; Critical / Important / Minor findings
   ↓
sdcorejs-repair-loop (if Review not skipped) ← apply findings, iterate to clean
   ↓
sdcorejs-comment-code ← apply the level the FINISH GATE captured (no second ASK; rules in _refs/orchestration/tail/comment-code.md)
   ↓
sdcorejs-product (when user-visible feature traceability is needed) ← update .sdcorejs/docs/product/ ledger
   ↓
sdcorejs-ship verify-before-done mode (always) ← BLOCK "done" until acceptance criteria from spec are ✅
   ↓
sdcorejs-ship (branch-ready mode) (always) ← branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test)
   ↓
_refs/orchestration/tail/auto-docs.md (always)   ← session summary to .sdcorejs/docs/nextjs/
   ↓
sdcorejs-write-user-guide (Mode 1, if User guide not skipped) ← update touched module's .sdcorejs/user-guide/<module>.md (features / routes / permissions / data + Coverage-vs-requirements); per-module incremental, aggregate rebuilds at ship
   ↓
_refs/orchestration/tail/auto-task-tracker.md (always) ← tick done, append new
sdcorejs-explore (memories mode)     ← durable knowledge (when applicable)
```

The FINISH GATE is mandatory and unconditional (per the cross-track rules in CLAUDE.md / AGENTS.md / copilot-instructions.md). The always-on plumbing steps run regardless of gate answers. Do NOT skip `sdcorejs-ship (verify-before-done mode)` — that's how acceptance criteria slip.

## Data Contract & View Model Rules

- Treat server action/API route/fetcher/service input/output types as the public contract consumed by pages and components, not as a required 1:1 copy of the raw upstream API or third-party service response.
- A server-side mapper may normalize, derive, add, rename, or omit fields. Every public model field exposed to React components must be accepted, processed, returned, or guaranteed by that route/action/fetcher/mapper.
- Keep raw upstream payload types internal to the server boundary (for example `CrmLeadApiRes`, `CmsPostRaw`, `ContactProviderRes`) and map them into public page/component data types.
- Client components must not mutate server DTOs with UI-only fields such as `checked`, `selected`, `expanded`, `children`, `disabled`, `label`, `displayName`, `color`, or `icon`.
- If UI needs extra fields, either derive them in the server mapper as part of the public contract, or define a local component ViewModel/state type and map DTO -> VM.
- During generation and review, label ambiguous fields by layer: `Upstream API field`, `Route/action/fetcher output field`, `Component ViewModel field`, or `UI state field`.

## Rules

### MUST DO
- Show a live progress checklist with **TodoWrite** from the START of generation — one checkbox item per planned unit (each page / block / pack step) PLUS the finishing steps (tests, review, comments, user-guide). Keep exactly one item `in_progress`; flip it to `completed` the moment that unit is done and start the next. Update after EACH task, never batch at the end — this is how the user tracks progress. Create it before writing the first file.
- Present the **MANDATORY FINISH GATE** ([`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md)) after EVERY code-gen — standalone trigger or full SDLC flow. It surfaces tests / comments / user-guide / review so the user always knows these exist. NEVER silently end after generating code, and NEVER skip the gate because the request was a one-liner.
- Read the approved plan BEFORE dispatching — never invent scope
- Dispatch in the order listed (theme/i18n/content BEFORE pages BEFORE seo)
- Pass the `sdcorejs-brainstorming` requirement contract to each pack as context
- Use parallel dispatch only when `parallel-dispatch` decision tree allows
- Run the tail-call chain in full — no shortcuts
- Report progress after each pack is applied (1 line per pack)
- Invoke `sdcorejs-test (tdd mode)` for any pack that writes testable logic (custom hooks, server actions, API route handlers, form validation in `contact-form.md`, utility functions) — write failing tests first, then implement
- Run the `@sdcorejs/utils` reuse preflight before adding helper logic in `src/lib`, API routes, hooks, forms, content mappers, or client components; report reused utilities and justify any custom helper.
- Keep raw API/provider payloads behind typed server mappers; expose truthful page/component data contracts only.

### MUST NOT
- Generate code from memory when a pack covers the concern — read the pack
- Skip `i18n.md` even for single-language sites (structure must be ready for another locale later)
- Skip `contact-form.md` and ship a fake `setTimeout` form — leads will silently disappear
- Skip `sdcorejs-ship (verify-before-done mode)` because tests passed — acceptance criteria are independent
- Apply packs out of order (e.g. pages before theme)
- Mark "done" before `sdcorejs-ship (verify-before-done mode)` returns green
- Skip `sdcorejs-test (tdd mode)` for packs that write logic — config files and content may bypass; custom code must not
- Recreate helper behavior already covered by `@sdcorejs/utils`, deep-import from `@sdcorejs/utils/dist/*`, or import `BrowserUtilities` from server components, route handlers, metadata, sitemap, or other server-only code
- Add UI-only fields to server DTOs or upstream payload types unless the mapper explicitly derives and guarantees them.

## Anti-patterns
- Generating ALL pages first, THEN applying theme/i18n — leads to massive refactor when content gets externalized
- Skipping `seo.md` because "we'll do it later" — every page launched without metadata costs a re-ship
- Treating `contact-form.md` as optional — a landing site without a working form is incomplete
- Re-implementing OG image per page manually instead of using `@vercel/og` factory from `og-preview.md`
- Bypassing the tail-call chain because "it's a small change" — small changes compound into untracked drift
- Treating third-party/CMS/API response types as mutable client ViewModels.

## Cross-references
- Inputs: approved plan from `sdcorejs-plan` / `sdcorejs-execute-plan` + `sdcorejs-brainstorming` outputs
- Reference packs: `_refs/nextjs/build-website/write-code/{init-site,theme,pages-and-blocks,seo,og-preview,i18n,caching,responsive,contact-form,content-quality}.md`
- Audit an existing site (separate entry, read-only): `sdcorejs-review`
- Tail-call chain: see CLAUDE.md workflow chart
- Parallel execution: `sdcorejs-parallel-dispatch`

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
