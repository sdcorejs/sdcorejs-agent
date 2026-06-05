---
name: sdcorejs-review-security
description: Single entry point for a security audit across every SDCoreJS track. Auto-detects the stack from the project's directory architecture (Angular portal · NestJS · Next.js), runs the cross-track checklist from `_refs/shared/review-security.md`, then deepens with the stack-specific probes in `_refs/<track>/review-security.md` (auth, authorization/RBAC, injection/XSS, secrets, transport/CORS/CSP, dependencies, error/info-leak). Outputs a color-coded 🔴 Critical / 🟡 Important / 🔵 Minor report with file:line + OWASP refs + Fix, a Passed-checklist list, and a manual-audit checklist. Read-only — never edits code. Triggers - "review bảo mật", "security review/audit", "kiểm tra bảo mật", "rà soát bảo mật", "check route guards", "SQL injection", "NEXT_PUBLIC leak", "CSP header", "secrets check", or pre-release / major-refactor gate. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Grep, Glob, Bash
---

# Review — Security (unified, track-aware)

## Purpose
One skill, every stack. Catch common security mistakes BEFORE they ship — the
engineer-level sanity check formalized. **Read-only** — surfaces issues a human
should fix; never edits (auto-fix is `orchestration/repair-loop`'s job). Not a
substitute for pentest / SAST / threat modeling.

This skill replaces the previous `sdcorejs-review-security-{shared,angular,nestjs,nextjs}`
skills. The cross-track baseline + each stack's probes now live as reference docs
loaded on demand; the dispatch surface and output format are unified here.

## When to use
- Before tagging a release that touches auth / permission / input handling
- After integrating a dependency or external service that touches user data
- User says "review bảo mật", "security audit", "kiểm tra/rà soát bảo mật"
- When a suspected vuln is reported

## Step 0 — Detect the track from the directory architecture

| Track | Signals |
|---|---|
| **angular** | `angular.json`; `@sdcorejs/angular`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` |
| **nestjs** | `nest-cli.json`; `@nestjs/*`; `*.controller.ts` / `*.service.ts` / `*.entity.ts` |
| **nextjs** | `next.config.*`; `next` dep; `src/app/[locale]/`; `page.tsx`, `middleware.ts` |
| **monorepo** | run every applicable block; scope each finding to its stack |

State the detected track(s) in the report header.

## Step 1 — Load the matching knowledge
- **Always** read `_refs/shared/review-security.md` (the cross-track checklist A–I).
- **angular** → also read `_refs/angular/review-security.md` (AG-1…AG-11)
- **nestjs** → also read `_refs/nestjs/review-security.md` (NS-1…NS-15)
- **nextjs** → also read `_refs/nextjs/build-website/review-security.md` (NX-1…NX-12)

Each ref supplies *what to check* (probes + severity + OWASP mapping). The
**output format** below is owned by this skill and used for all tracks.

## Step 2 — Audit
1. **Read-only inventory (parallel):** `git log -20 --oneline`; `git diff <base>...HEAD` if a base ref is given (else scope to surface); `package.json` (auth/crypto/parsing libs); `.env.example` / config for var names — **never read real `.env` / credential files**.
2. Run the shared checklist (A–I), then the track probes. Use Grep to find evidence — no finding without a `file:line`.
3. Run `npm audit --omit=dev` for the dependency block; never `npm audit fix --force`.
4. Map each finding to severity (use the ref's mapping) + its OWASP category.
5. Emit the report.

## Output format (ALL tracks)

Match the user's language (VI/EN). Cite `file:line` + OWASP category for every finding.

```markdown
# Security Review — <repo> — <detected track(s)> — <date>

## Scope
- Track(s): <angular | nestjs | nextjs | monorepo>
- Commit range: <base>...<head> (N commits) · Files touched: M

## 🔴 Critical (must fix before merge / release)
| # | Finding | File:line | OWASP | Fix |
|---|---|---|---|---|

## 🟡 Important (fix this iteration)
| # | Finding | File:line | OWASP | Fix |
|---|---|---|---|---|

## 🔵 Minor / nits
| # | Finding | File:line | OWASP | Fix |
|---|---|---|---|---|

## ✅ Passed checklist items
<categories where nothing was found — signals you actually looked>

## Manual audit (cannot automate — track ref lists these)
- [ ] <e.g. protected URL while logged out redirects; built bundle has no secrets; …>

## Out of scope (not checked here)
- Pentest / DAST / threat modeling · infrastructure (network, K8s, IAM) · third-party SaaS config
```

- A severity table with no rows: write `_none_` rather than omitting the heading.
- The Passed list is required — a report with only findings reads as untrustworthy.

## Rules

### MUST DO
- Detect the track first; state it in the header.
- Use Grep for evidence — cite `file:line` + OWASP category for every finding.
- Categorize Critical / Important / Minor with a rationale; never a flat list.
- Match SDCoreJS conventions (custom validators in NestJS, `@HasPermission`, the portal-guards-are-UX rule) — don't flag deviations from generic frameworks as bugs.
- List Passed items so the report is trustworthy.
- Run against PRODUCTION-like config (prod `angular.json` / `next.config` headers / CORS) — dev relaxes things on purpose.

### MUST NOT
- Read or echo `.env` / `*.pem` / credential files.
- Run `npm audit fix --force` automatically (can introduce breaking upgrades).
- Claim a vuln without a `file:line` reference.
- Treat every `bypassSecurityTrust*` / `dangerouslySetInnerHTML` as automatically Critical — check whether the data is author-controlled or user/remote.
- Duplicate `sdcorejs-review-code` findings (guard/permission conventions) — one entry, not two.

## Anti-patterns
- A 50-item report where everything is "Important" — nothing is, then.
- Listing OWASP Top 10 generically with no evidence in this repo.
- Running on a 1000-file repo with no commit range — noise hides signal.
- Re-running and producing last week's findings verbatim (means nothing was fixed; flag it).

## When to escalate
- Critical finding touches PII at rest / in transit → loop in the data/compliance owner before the fix lands.
- Vuln in a dep with no patch → isolate / disable the feature; report upstream.
- Suspected active exploit → stop; this is incident response, not code review.

## Cross-references
- Cross-track checklist: `_refs/shared/review-security.md`
- Track probes: `_refs/<track>/review-security.md` (nextjs: `_refs/nextjs/build-website/review-security.md`)
- Code review (guard/permission overlap): `sdcorejs-review-code`
- Architecture: `sdcorejs-review-architecture` · Performance: `review/performance/<track>`
- Verification: `orchestration/verify-before-done`
