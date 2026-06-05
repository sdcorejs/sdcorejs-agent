---
name: sdcorejs-review-accessibility
description: Single entry point for an accessibility / a11y review across every SDCoreJS UI track. Auto-detects the stack from the project's directory architecture (Angular portal · Next.js), runs the cross-track WCAG 2.1 AA baseline from `_refs/shared/review-accessibility.md` (the 12 checks that catch 80% of issues + axe/pa11y/Lighthouse probes), then deepens with the stack-specific probes in `_refs/<track>/review-accessibility.md` (focus management, ARIA roles/state, keyboard nav, form-error announcement, contrast, lang attribute). Outputs a color-coded 🔴 Critical / 🟡 Important / 🔵 Minor report with location + WCAG SC + POUR + Fix, plus a manual checklist for what automation cannot detect. Read-only — never edits code. Triggers - "review accessibility", "a11y", "kiểm tra tiếp cận", "accessibility audit", "WCAG", "aria", "keyboard nav", "keyboard không vào được", "screen reader", "contrast", "kiểm tra accessibility", or pre-launch gate. Applies to angular, nextjs (nestjs n/a — no UI). Bilingual (VI/EN).
allowed-tools: Read, Grep, Glob, Bash
---

# Review — Accessibility (unified, track-aware)

## Purpose
One skill, every UI stack. Catch WCAG 2.1 Level AA failures BEFORE they ship —
the engineer-level sanity check formalized. **Read-only** — surfaces issues a
human should fix; never edits (auto-fix is `orchestration/repair-loop`'s job).
A11y issues are ~80% structural (semantic HTML, focus order, labels) and ~20%
visual (contrast, motion); automation catches ~30%, so the manual checklist is
non-negotiable.

This skill replaces the previous `sdcorejs-review-accessibility-{baseline,angular,nextjs}`
skills. The cross-track baseline + each stack's probes now live as reference docs
loaded on demand; the dispatch surface and output format are unified here.

WCAG 2.1 AA is the legal floor in most jurisdictions (Vietnam's MIC Circular
18/2014, EU EN 301 549, US Section 508). Not a substitute for a full assistive-tech
audit by a disabled user.

## When to use
- Pre-launch / pre-release a11y audit
- After a major UI overhaul or new screens / workflows
- User says "review accessibility", "a11y", "kiểm tra tiếp cận/accessibility"
- When a real user reports a barrier (e.g. "keyboard không vào được menu")

## Step 0 — Detect the track from the directory architecture

| Track | Signals | A11y review |
|---|---|---|
| **angular** | `angular.json`; `@sdcorejs/angular`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` | ✅ run angular probes |
| **nextjs** | `next.config.*`; `next` dep; `src/app/[locale]/`; `page.tsx`, `middleware.ts` | ✅ run nextjs probes |
| **nestjs** | `nest-cli.json`; `@nestjs/*`; `*.controller.ts` / `*.service.ts` | ⏭️ **not applicable (no UI) — skip** |
| **monorepo** | run every applicable UI block; scope each finding to its stack |

State the detected track(s) in the report header. If the only stack present is
nestjs, report "not applicable — backend has no UI" and stop.

## Step 1 — Load the matching knowledge
- **Always** read `_refs/shared/review-accessibility.md` (POUR + the 12 checks + automated/manual layers).
- **angular** → also read `_refs/angular/review-accessibility.md` (AP-1…AP-12)
- **nextjs** → also read `_refs/nextjs/build-website/review-accessibility.md` (NJ-1…NJ-12)
- **nestjs** → not applicable (no UI); skip.

Each ref supplies *what to check* (probes + severity + WCAG SC + POUR principle).
The **output format** below is owned by this skill and used for all tracks.

## Step 2 — Audit
1. **Read-only inventory:** identify routes/pages to test (home + 1 list/landing + 1 form/detail). Prefer a PRODUCTION build (`ng build --configuration=production` / `npm run start`) — dev mode injects extra HMR DOM that skews results.
2. Run all three automated probe layers (Lighthouse a11y, pa11y axe+htmlcs, `@axe-core/cli`) per the shared ref — they overlap but each catches different rules.
3. Run the track probes (AP-* / NJ-*). Use Grep to find evidence — no finding without a location (`file:line` or rendered selector).
4. Map each finding to severity + its WCAG SC + POUR principle (use the ref's mapping).
5. Run the manual checklist (keyboard-only, screen reader, modal escape, form-error announcement, contrast at all states) — record pass/fail.
6. Emit the report.

## Output format (ALL tracks)

Match the user's language (VI/EN). Cite location + WCAG SC + POUR for every finding.

```markdown
# Accessibility Review — <repo / page> — <detected track(s)> — <date>

## Scope
- Track(s): <angular | nextjs | monorepo>
- Routes audited: <home, /list, /form, …> · Build: <prod | dev>

## Automated probes
- Lighthouse a11y: <score>/100 (per route / locale)
- pa11y findings: <N>
- axe-core findings: <N> (Critical: <X>, Serious: <Y>, Moderate: <Z>, Minor: <W>)

## 🔴 Critical (blocks compliance / blocks users)
| # | Finding | Location | WCAG SC | POUR | Fix |
|---|---|---|---|---|---|

## 🟡 Important (degrades UX significantly)
| # | Finding | Location | WCAG SC | POUR | Fix |
|---|---|---|---|---|---|

## 🔵 Minor (polish; cleanup sprint)
| # | Finding | Location | WCAG SC | POUR | Fix |
|---|---|---|---|---|---|

## ✅ Passed checklist items
<checks where nothing was found — signals you actually looked>

## Manual checklist (cannot automate — track ref lists these)
- [ ] Keyboard-only navigation logical: <pass/fail + notes>
- [ ] Screen reader announces correctly (NVDA/VoiceOver): <pass/fail>
- [ ] Modal focus traps + Esc returns focus: <pass/fail>
- [ ] Form errors announced + recoverable: <pass/fail>
- [ ] Color contrast at all states (hover/focus/disabled): <pass/fail>
- [ ] Reduced motion respected; 200% zoom intact: <pass/fail>

## Recommendation
- 🔴 Critical → `orchestration/repair-loop` with the list
- 🟡 Important → user decides scope per finding
- 🔵 Minor → batch in a cleanup sprint
```

- A severity table with no rows: write `_none_` rather than omitting the heading.
- The Passed list is required — a report with only findings reads as untrustworthy.

## Rules

### MUST DO
- Detect the track first; state it in the header. If only nestjs is present, report "not applicable (no UI)" and stop.
- Run all 3 automated probes — they overlap but each catches different rules.
- Always include the manual section — automation misses ~70%.
- Cite the WCAG SC number for every finding (e.g. WCAG 2.1 SC 1.1.1 Non-text Content) and map it to a POUR principle.
- Categorize 🔴 Critical / 🟡 Important / 🔵 Minor with a rationale; never a flat list.
- Run on the actual built (production) page, not Storybook / dev HMR DOM in isolation.
- For Core UI components: cite the catalog (`_refs/angular/sdcorejs-angular-catalog.md`) if a built-in a11y feature is missing.
- List Passed items so the report is trustworthy.

### MUST NOT
- Claim ✅ when only Lighthouse passed — that catches ~30% of issues (~30 of WCAG's ~78 SC).
- Skip the manual section because "automation looks good".
- Reformat code while auditing — separate from `sdcorejs-review-code`.
- Disable pa11y / axe rules without a comment citing the WCAG SC + the reason.
- Treat every `<div role="button">` / `aria-label` as automatically Critical — check whether it's keyboard-operable + announced before scoring.
- Claim a finding without a location reference.

## Anti-patterns
- A 50-item report where everything is 🟡 Important — nothing is, then.
- Treating Lighthouse 100/100 as done — it runs ~30 of WCAG's ~78 success criteria.
- "Looks ok visually" as the test — a sighted developer is not the audience.
- `tabindex` everywhere — usually means the semantic HTML is wrong; fix the semantics first.
- `aria-label` duplicating visible button text — read twice by the screen reader; remove it.
- Decorative icons announced — add `aria-hidden="true"` on decorative `<svg>`.
- Removing `outline` for "clean design" with no `:focus-visible` replacement.
- Re-running and producing last week's findings verbatim (means nothing was fixed; flag it).

## When to escalate
- Critical finding blocks a legally-required flow (gov / public service) → loop in the compliance owner before the fix lands.
- A Core UI component itself ships an a11y defect (no fix at app level) → report upstream against `@sdcorejs/angular`; isolate the workaround.
- Pattern needs an actual assistive-tech user to validate → this is usability testing, not code review.

## Cross-references
- Cross-track baseline: `_refs/shared/review-accessibility.md`
- Track probes: `_refs/<track>/review-accessibility.md` (nextjs: `_refs/nextjs/build-website/review-accessibility.md`)
- Code review (semantics overlap): `sdcorejs-review-code` · Core UI catalog: `_refs/angular/sdcorejs-angular-catalog.md`
- Touch targets / responsive: `_refs/nextjs/build-website/write-code/responsive.md`
- Architecture-level a11y (global skip-link, lang attribute): `sdcorejs-review-architecture`
- Verification: `orchestration/verify-before-done` runs the automated probes as criteria · Repair loop: `orchestration/repair-loop`
- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/ · WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
```

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
