# Next.js Build-Website End-to-End Testing

Use only for the detected or approved `nextjs-build-website` profile. For
`plain-nextjs`, use `_refs/shared/test-generic.md`. Always apply
`_refs/shared/test-environment-guard.md`.

## Requirement-driven scope

Cover a page, locale, form, metadata surface, responsive state, or accessibility
behavior only when the acceptance criteria or current change requires it.
Do not assume a locale list, default locale, route prefix, contact form, rate
limit, sitemap, analytics provider, or deployment target.

Examples remain conditional:

- verify server-rendered essential content when SSR/SEO is a requirement;
- exercise each configured locale when locale parity is a requirement;
- test form validation, success, failure, spam control, and rate limiting only
  when those behaviors are accepted product contracts;
- verify metadata, canonical links, structured data, sitemap, or robots rules
  only when in scope;
- cover responsive navigation and keyboard access when relevant to the page.

When a configured two-locale site uses `vi` and `en`, localized fixture prose
may use:

```ts
const trustText = locale === 'vi' ? '<localized text>' : 'Trusted partner';
const alternateLocale = locale === 'vi' ? 'en' : 'vi';
```

This is an example for a detected configuration, not a universal locale policy.

## Runner, auth, and data

Reuse the existing Playwright, Cypress, or other browser runner, web-server
configuration, base URL reference, fixtures, and command. Authenticated
applications follow real-UI persona rules; public sites record auth as
not-applicable. Forms use isolated run-owned inputs and must not send real
email, SMS, payments, or analytics events.

Wait for the target observable state or response rather than a universal timing
delay. Use accessible locators. Preserve the project's coverage/browser policy;
do not introduce fixed thresholds.

## Evidence

Return v2 context/status/evidence with requirement mapping, locale/config source,
environment, data cleanup, and redacted results. Diagnostic artifacts remain
local-only; guide screenshots require verified UI evidence and artifact closure.
