---
name: sdcorejs-nextjs
description: Next.js website code executor for approved site builds with confirmed requirements. Use for bootstrap, theme, pages/sections, SEO/OG, i18n, caching/ISR, responsive fixes, contact form, content quality, or reuse of @sdcorejs/utils utilities. Loads _refs/nextjs/build-website/write-code/ packs; use sdcorejs-review for existing-site audits. Runs mandatory finish tail. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, user.approve, web.fetch, visual.present
---

# Build Website — Write Code Orchestrator


## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and
`_refs/shared/artifact-lifecycle.md`; merge producer `artifact_context` through
the finishing tail.

## Purpose
Single entry point for generating Next.js landing-site code. This skill is the
dispatch layer between an approved plan from `sdcorejs-execute-plan` and the
focused REFERENCE PACKS that hold the per-concern generation rules. It does NOT
inline those rules — it reads the right pack on demand. The ten packs under
`_refs/nextjs/build-website/write-code/` were standalone sub-skills before they
were consolidated here so the track exposes one orchestrator instead of eleven.

## When invoked
- After `sdcorejs-execute-plan` dispatches an approved Next.js plan
- After `sdcorejs-explore (recovery mode)` and the user explicitly resumes the
  same approved plan

Do NOT invoke if:
- No plan exists or plan is unapproved -> go back to `sdcorejs-brainstorming` / `sdcorejs-spec` / `sdcorejs-plan`
- Scope changed since plan was approved -> re-plan with `sdcorejs-plan`
- The user wants to AUDIT an existing site (not generate) → `sdcorejs-review`

## Step 0 — Read-oriented project context

Before reading the plan or dispatching, assemble read-only `project_context`.
Use valid summary sections when available. For an existing site with a missing,
legacy, unknown, or stale summary, continue with targeted reads and use a scoped
code map only for unresolved cross-component relationships. Do not refresh
merely because summary is absent. A brand-new approved `init-site` may create
summary v2 after scaffolding; an architecture-level refresh belongs only to the
sequential workflow or integration owner.

Before generating any non-trivial page, section, interactive block, form, or
frontend data boundary, read `_refs/shared/frontend-architecture.md`. Require the
approved plan dispatched by `sdcorejs-execute-plan` to contain a completed
`frontend_architecture` contract. This executor must not create or self-approve a
missing contract. Stop and return to `sdcorejs-plan` through
`sdcorejs-execute-plan` when the gate is missing, incomplete, or contradicted by
current code evidence.

Before writing any helper, formatter, validator, mapper, paging/filter helper, random-id helper, query-param helper, upload/download helper, clipboard/browser helper, API-route utility, hook utility, or `src/lib/utils.ts` addition, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` when it covers the behavior. Keep `next-intl` for locale-bound UI formatting; use `@sdcorejs/utils` for shared pure helper behavior. The package must be a direct target-project dependency before generated code imports it.

## Dispatch table

Read the approved plan. Match its work items to the reference pack; READ that
pack on demand and follow it. Dispatch in the order listed in the "Full build"
row (order matters — theme + i18n + content architecture must exist BEFORE pages
are composed).

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
4. pages-and-blocks.md   ← Approved page/feature-local/shared component tree; externalize content
                            Output: route pages stay composition/data boundaries;
                            meaningful one-off blocks remain feature-local
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

When `sdcorejs-parallel-dispatch` validates protocol-v2 dependency, path,
resource, runtime, isolation, and fan-in contracts, the orchestrator may fan out
two or more worthwhile independent units or plan-derived DAG waves, typically:
- Section components (hero, features, testimonials, …) can be generated in parallel
- SEO + OG + sitemap can run in parallel after pages exist
- i18n message extraction can fan out across content/<page>.json files

Steps 1–4 are sequential (each depends on the previous). Steps 5–8 can be parallel after step 4 lands.

## After all dispatched packs complete

### MANDATORY FINISH GATE (always — standalone trigger OR full SDLC flow)

**STOP and present the consolidated finish gate from [`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md) before running ANY tail step.** UNCONDITIONAL: it fires even when this skill was triggered directly for a one-line request (e.g. "add a page", "add a section") — NOT only inside the spec→plan flow. The gate surfaces tests / user-guide / technical-doc / behavior-preserving simplification / review choices with defaults so the user always knows these steps exist and can opt out of new user/technical docs. "Small change" is not a reason to skip the gate.

Then run the tail-call chain, honoring the gate's answers (skip = omit that step; everything not skipped runs):

Documentation supplement: immediately after the Finish Gate test decision, run
`sdcorejs-documentation (documentation-gate mode)` and read
`_refs/documentation/gate.md`. This gate asks or loads saved project
preferences from `<target>/.sdcorejs/documentation/preferences.md` for
`user-guide` and `technical-doc` only. It must ask before
creating a missing corresponding user-guide or technical-doc for a new feature.
`code-documentation` is automatic for touched source files and is not controlled
by this approval gate.

```
FINISH GATE (always, unconditional) ← surfaces the choices below
   ↓
sdcorejs-test  (if Tests not skipped)  ← happy-path tests for each generated page
   ↓
sdcorejs-review (if Review not skipped) ← convention check; Critical / Important / Minor findings
   |
sdcorejs-repair-loop (if Review not skipped) - apply findings, iterate to clean
   |
sdcorejs-documentation (code-documentation mode) - automatic source-code documentation for touched source files; no approval ASK; rules in _refs/documentation/code-documentation.md
   |
sdcorejs-product (when user-visible feature traceability is needed) - update .sdcorejs/docs/product/ ledger
   |
sdcorejs-documentation (write-technical-doc mode, if Technical doc approved) - create/update the approved technical doc from source evidence
   |
_refs/orchestration/tail/auto-docs.md (always) - change-scoped execution record to .sdcorejs/docs/nextjs/
   |
sdcorejs-documentation (write-user-guide mode, if User guide approved) - create/update touched module's .sdcorejs/documentation/user-guides/<module>/<module>.md only when approved by the documentation gate or explicitly requested
   |
_refs/orchestration/tail/auto-task-tracker.md (integration/sequential owner only) - reconcile durable backlog, never live progress
   |
sdcorejs-explore (memories mode) - durable knowledge (when applicable)
   |
sdcorejs-ship verify-before-done mode (always) - BLOCK "done" until acceptance criteria from selected scope are verified or deferred
   |
sdcorejs-ship (branch-ready mode) (always) - final read-only gate over the final diff before any Git artifact handoff. No writes after branch-ready unless branch-ready is run again.
```

The FINISH GATE is mandatory and unconditional (per the cross-track rules in CLAUDE.md / AGENTS.md / copilot-instructions.md). The always-on plumbing steps run regardless of gate answers. Do NOT skip `sdcorejs-ship (verify-before-done mode)`; that is how acceptance criteria slip.

## Data Contract & View Model Rules

- Treat server action/API route/fetcher/service input/output types as the public contract consumed by pages and components, not as a required 1:1 copy of the raw upstream API or third-party service response.
- A server-side mapper may normalize, derive, add, rename, or omit fields. Every public model field exposed to React components must be accepted, processed, returned, or guaranteed by that route/action/fetcher/mapper.
- Keep raw upstream payload types internal to the server boundary (for example `CrmLeadApiRes`, `CmsPostRaw`, `ContactProviderRes`) and map them into public page/component data types.
- Client components must not mutate server DTOs with UI-only fields such as `checked`, `selected`, `expanded`, `children`, `disabled`, `label`, `displayName`, `color`, or `icon`.
- If UI needs extra fields, either derive them in the server mapper as part of the public contract, or define a local component ViewModel/state type and map DTO -> VM.
- During generation and review, label ambiguous fields by layer: `Upstream API field`, `Route/action/fetcher output field`, `Component ViewModel field`, or `UI state field`.

## Rules

### MUST DO
- Create visible runtime progress from the START of generation through
  `progress.create`, with one item per planned unit and the finishing steps (tests, optional behavior-preserving simplification, review, code-documentation, technical-doc, user-guide).
  Keep one item `in_progress`, call `progress.update` after each unit, and never
  mirror live progress to a repository file.
- Present the **MANDATORY FINISH GATE** ([`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md)) after EVERY code-gen — standalone trigger or full SDLC flow. It surfaces tests / user-guide / technical-doc / behavior-preserving simplification / review so the user always knows these exist. NEVER silently end after generating code, and NEVER skip the gate because the request was a one-liner.
- Read the approved plan BEFORE dispatching — never invent scope
- Apply `_refs/shared/frontend-architecture.md` before non-trivial frontend
  generation and derive page, feature-local, shared, client-island, data-boundary,
  registration/export, and test files from the approved architecture contract
- Dispatch in the order listed (theme/i18n/content BEFORE pages BEFORE seo)
- Pass the `sdcorejs-brainstorming` requirement contract to each pack as context
- Use parallel dispatch only when `parallel-dispatch` decision tree allows
- Run the tail-call chain in full — no shortcuts
- Report progress after each pack is applied (1 line per pack)
- Invoke `sdcorejs-test (tdd mode)` for any pack that writes testable logic (custom hooks, server actions, API route handlers, form validation in `contact-form.md`, utility functions) — write failing tests first, then implement
- Run the `@sdcorejs/utils` reuse preflight before adding helper logic in `src/lib`, API routes, hooks, forms, content mappers, or client components; report reused utilities and justify any custom helper.
- Keep raw API/provider payloads behind typed server mappers; expose truthful page/component data contracts only.
- Keep route pages as Server Component composition/data boundaries where
  practical. Extract a cohesive or interactive one-off block as a feature-local
  component when justified; single use neither forces inline markup nor promotes
  the block into the cross-page section library.
- Keep Client Components at the smallest meaningful interactive boundary. Do not
  split one cohesive interaction into arbitrary client wrappers.
- Follow existing site placement/alias/export conventions. Keep feature-local
  blocks private and expose shared sections/UI only through their owning public
  boundary when real external consumers exist.

### Documentation Gate Rule

- Inside the mandatory finish gate, run `_refs/documentation/gate.md` immediately after the test decision. It owns user-guide / technical-doc creation or update approval. `code-documentation` is automatic and is not controlled by this gate.

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
- Force a meaningful one-off interactive block inline into a monolithic
  `page.tsx`, promote it globally merely because it was extracted, or split
  trivial static markup only to reduce line count.

## Anti-patterns
- Generating ALL pages first, THEN applying theme/i18n — leads to massive refactor when content gets externalized
- Skipping `seo.md` because "we'll do it later" — every page launched without metadata costs a re-ship
- Treating `contact-form.md` as optional — a landing site without a working form is incomplete
- Re-implementing OG image per page manually instead of using `@vercel/og` factory from `og-preview.md`
- Bypassing the tail-call chain because "it's a small change" — small changes compound into untracked drift
- Treating third-party/CMS/API response types as mutable client ViewModels.
- Treating "used once" as a complete placement decision; cohesion, interaction,
  accessibility, testability, data ownership, and Server/Client boundaries are
  the decision criteria.

## Cross-references
- Inputs: approved plan from `sdcorejs-plan` / `sdcorejs-execute-plan` + `sdcorejs-brainstorming` outputs
- Reference packs: `_refs/nextjs/build-website/write-code/{init-site,theme,pages-and-blocks,seo,og-preview,i18n,caching,responsive,contact-form,content-quality}.md`
- Audit an existing site (separate entry, read-only): `sdcorejs-review`
- Tail-call chain: see CLAUDE.md workflow chart
- Parallel execution: `sdcorejs-parallel-dispatch`
- Shared frontend architecture gate: `_refs/shared/frontend-architecture.md`
