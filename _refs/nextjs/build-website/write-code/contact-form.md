> **Reference for the `sdcorejs-nextjs` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Contact Form (REAL)

## Purpose
A landing site without a working contact form is incomplete — leads vanish. A common starter-project anti-pattern is shipping a `setTimeout(1000)` stub that only simulates submit (UI shows "sent" but nothing actually goes anywhere). This skill ships a real form: zod validation, POST to API route, Resend email delivery, rate limit, bilingual UX, and accessibility.

## When invoked
- Automatic last step of "Full build" in the `sdcorejs-nextjs` orchestrator
- User says "contact form", "biểu mẫu liên hệ", "form chưa gửi email", "fix fake form"
- Adding a new form (newsletter signup uses a similar pattern)

Prerequisites:
- Contact email destination from `sdcorejs-brainstorming` (`CONTACT_TO_EMAIL`)
- Resend account + API key (default email service) OR SendGrid alternative
- i18n messages exist (form labels, errors via `i18n.md`)

## Files

| File | Purpose |
|---|---|
| `src/lib/email.ts` | Resend wrapper + email templates |
| `src/lib/rate-limit.ts` | Simple in-memory rate limiter (or Upstash for prod) |
| `src/lib/contact-schema.ts` | Zod schema (shared client + server) |
| `src/app/api/contact/route.ts` | API route — POST handler |
| `src/components/sections/contact-form.tsx` | Client-side form component |
| `src/i18n/messages/<locale>.json` | `contact.*` keys for labels + errors |

## Workflow

### Step 1 — Zod schema (shared client + server)

Before adding custom validation helpers, string helpers, regex constants, phone/email helpers, query-param helpers, or normalization utilities, read `_refs/shared/sdcorejs-utils.md`. Keep zod as the runtime request contract, but reuse `@sdcorejs/utils` constants/helpers such as `ValidationUtilities` and `VALIDATION_PATTERNS` when they fit. Custom helpers such as HTML escaping are allowed only when the package does not provide the required behavior.

```typescript
// src/lib/contact-schema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name_short').max(100, 'name_long'),
  email: z.string().trim().email('email_invalid').max(254),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-().]{8,20}$/, 'phone_invalid')
    .optional()
    .or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'message_short').max(2000, 'message_long'),
  // Honeypot — should be empty; if filled, treat as spam
  website: z.string().max(0).optional(),
});

export type ContactPayload = z.infer<typeof contactSchema>;
```

Error codes (`name_short`, `email_invalid`, …) map to i18n message keys — never embed user-facing strings in the schema.

Contract boundary:
- `ContactPayload` is the validated public input contract shared by the client form, API route, and email helper.
- Provider responses such as Resend API results are raw upstream/provider contracts and must stay inside `src/lib/email.ts` or the API route.
- Client-only fields (`status`, `errors`, `rateLimitMinutes`, `isSubmitting`, `displayName`, etc.) are component state/ViewModel fields and must not be added to `ContactPayload`.
- If the API route returns extra fields (`code`, `minutes`, `errors`), define a response type for that route and keep it separate from the submit payload.

### Step 2 — i18n messages

Add the `contact.form.*` keys (labels, status messages, per-field error strings) to `src/i18n/messages/vi.json` and mirror in `en.json`. The full bilingual message block lives in `_refs/nextjs/build-website/contact-form-refs.md` ("i18n messages") — copy it from there. Error keys map 1:1 to the zod error codes from Step 1.

### Step 3 — Email helper

```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import { company } from '@/config/company';
import type { ContactPayload } from './contact-schema';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(payload: ContactPayload, locale: string) {
  const to = process.env.CONTACT_TO_EMAIL?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  if (to.length === 0) {
    throw new Error('CONTACT_TO_EMAIL is not configured');
  }

  const isVi = locale === 'vi';
  const subject = isVi
    ? `Liên hệ mới từ ${payload.name} — ${company.name}`
    : `New contact from ${payload.name} — ${company.name}`;

  const html = renderEmailHtml(payload, locale);
  const text = renderEmailText(payload, locale);

  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? 'noreply@example.com',
    to,
    replyTo: payload.email,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

function renderEmailHtml(p: ContactPayload, locale: string): string {
  const isVi = locale === 'vi';
  const labels = isVi
    ? { name: 'Họ tên', email: 'Email', phone: 'Điện thoại', company: 'Công ty', message: 'Nội dung' }
    : { name: 'Name', email: 'Email', phone: 'Phone', company: 'Company', message: 'Message' };
  return `
    <h2>${isVi ? 'Yêu cầu liên hệ mới' : 'New contact request'}</h2>
    <table cellpadding="6" style="border-collapse:collapse;border:1px solid #e5e7eb;">
      <tr><td><b>${labels.name}</b></td><td>${escapeHtml(p.name)}</td></tr>
      <tr><td><b>${labels.email}</b></td><td>${escapeHtml(p.email)}</td></tr>
      ${p.phone ? `<tr><td><b>${labels.phone}</b></td><td>${escapeHtml(p.phone)}</td></tr>` : ''}
      ${p.company ? `<tr><td><b>${labels.company}</b></td><td>${escapeHtml(p.company)}</td></tr>` : ''}
      <tr><td><b>${labels.message}</b></td><td style="white-space:pre-wrap;">${escapeHtml(p.message)}</td></tr>
    </table>
  `;
}

function renderEmailText(p: ContactPayload, locale: string): string {
  const isVi = locale === 'vi';
  return [
    isVi ? `Yêu cầu liên hệ mới — ${company.name}` : `New contact — ${company.name}`,
    '',
    `${isVi ? 'Họ tên' : 'Name'}: ${p.name}`,
    `Email: ${p.email}`,
    p.phone && `${isVi ? 'Điện thoại' : 'Phone'}: ${p.phone}`,
    p.company && `${isVi ? 'Công ty' : 'Company'}: ${p.company}`,
    '',
    `${isVi ? 'Nội dung' : 'Message'}:`,
    p.message,
  ].filter(Boolean).join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

### Step 4 — Rate limiter

Create `src/lib/rate-limit.ts` — a simple in-memory IP bucket. The full implementation lives in `_refs/nextjs/build-website/contact-form-refs.md` ("Rate limiter") — copy it from there. For production with multiple instances, swap for Upstash Redis (`@upstash/ratelimit`).

### Step 5 — API route

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/contact-schema';
import { sendContactEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';  // Resend SDK needs Node runtime (not edge)

export async function POST(req: NextRequest) {
  // Identify caller — prefer X-Forwarded-For (set by Vercel / most proxies)
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  // Rate limit: 5 submissions per 15 minutes per IP
  const limit = rateLimit(`contact:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.remainingMs / 60_000);
    return NextResponse.json(
      { ok: false, code: 'rate_limited', minutes },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.remainingMs / 1000)) } },
    );
  }

  // Parse + validate
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: 'invalid_body' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, code: 'validation', errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Honeypot tripped — silently succeed (don't tell the spammer)
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const locale = req.headers.get('x-locale') ?? 'vi';

  try {
    await sendContactEmail(parsed.data, locale);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] sendContactEmail failed:', err);
    return NextResponse.json({ ok: false, code: 'send_failed' }, { status: 500 });
  }
}
```

### Step 6 — Client component (form UI)

Uses native React state + form for simplicity (no `react-hook-form` dep). For complex forms (multi-step, dynamic fields), consider `react-hook-form`.

```tsx
// src/components/sections/contact-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { contactSchema, type ContactPayload } from '@/lib/contact-schema';
import { company } from '@/config/company';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

export function ContactForm() {
  const t = useTranslations('contact.form');
  const locale = useLocale();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [rateLimitMinutes, setRateLimitMinutes] = useState(0);
  const [, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = Object.fromEntries(
      Array.from(formData.entries()).map(([k, v]) => [k, String(v)]),
    );

    // Client-side validate (instant feedback; server validates again)
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Locale': locale },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRateLimitMinutes(data.minutes ?? 15);
        setStatus('rate_limited');
        return;
      }
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus('error');
        return;
      }

      setStatus('success');
      startTransition(() => {
        (event.target as HTMLFormElement).reset?.();
      });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rounded-lg bg-success/10 border border-success p-6 text-success">
        {t('success')}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <Field name="name" label={t('name')} required errors={errors.name} t={t} />
      <Field name="email" type="email" label={t('email')} required errors={errors.email} t={t} />
      <Field name="phone" type="tel" label={t('phone')} errors={errors.phone} t={t} />
      <Field name="company" label={t('company')} errors={errors.company} t={t} />
      <Field name="message" label={t('message')} required textarea errors={errors.message} t={t} />

      {/* Honeypot — hidden from real users, bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {status === 'rate_limited' && (
        <p role="alert" className="text-warning">
          {t('rateLimited', { minutes: rateLimitMinutes })}
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="text-danger">
          {t('error', { phone: company.phone })}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="min-h-11 bg-brand text-white px-6 rounded-md font-semibold disabled:opacity-60"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  errors?: string[];
  t: ReturnType<typeof useTranslations>;
}

function Field({ name, label, type = 'text', required, textarea, errors, t }: FieldProps) {
  const errorKey = errors?.[0];
  const errorMsg = errorKey ? t(`errors.${errorKey}` as never) : undefined;

  return (
    <div className="grid gap-1">
      <label htmlFor={name} className="font-medium">
        {label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name} name={name} required={required} rows={5}
          aria-invalid={!!errorMsg}
          aria-describedby={errorMsg ? `${name}-error` : undefined}
          className="rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand min-h-11"
        />
      ) : (
        <input
          id={name} name={name} type={type} required={required}
          aria-invalid={!!errorMsg}
          aria-describedby={errorMsg ? `${name}-error` : undefined}
          className="rounded-md border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand min-h-11"
        />
      )}
      {errorMsg && <p id={`${name}-error`} className="text-sm text-danger">{errorMsg}</p>}
    </div>
  );
}
```

### Step 7 — Verify end-to-end

```bash
# 1. Fill .env.local with real RESEND_API_KEY + CONTACT_TO_EMAIL
npm run dev

# 2. Open /vi/lien-he (or /lien-he depending on routing) — fill the form, submit
#    Expected: success message; email arrives at CONTACT_TO_EMAIL within ~30s

# 3. Submit 6 times in quick succession
#    Expected: 5 succeed, 6th returns 429 + rate-limited message

# 4. Submit with invalid email (e.g. "abc")
#    Expected: client-side validation blocks submit; server returns 400 if bypassed

# 5. Submit with hidden honeypot field filled (via DevTools)
#    Expected: 200 OK BUT no email sent (silent block)
```

For email delivery testing without spamming real inboxes: use [Resend's onboarding sandbox](https://resend.com/docs/dashboard/emails/send-test-emails) which delivers to a controlled inbox.

## Optional — Slack / Discord webhook in parallel with email

For high-velocity sales teams that want instant notifications:

```typescript
// In sendContactEmail, after Resend success:
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
if (slackWebhook) {
  await fetch(slackWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `📩 New contact: *${payload.name}* (${payload.email})\n${payload.message}`,
    }),
  }).catch(err => console.warn('[contact] Slack notify failed:', err));
}
```

## Rules

### MUST DO
- Share zod schema between client + server
- Reuse `@sdcorejs/utils` for covered string/format/normalization/query/browser helpers before adding local helper code
- Validate on BOTH client (UX) and server (security)
- Keep submit payload, API route response, email provider response, and client UI state as separate typed contracts
- Rate-limit by IP (5 / 15 min default, tune if abuse seen)
- Use Resend (or SendGrid) — never SMTP from edge runtime
- Reply-to set to user's email (so team can reply directly)
- Bilingual error messages via i18n
- Honeypot field (`website`) — silent block on spam
- HTML + plain text email versions
- `aria-invalid` + `aria-describedby` for accessibility

### MUST NOT
- Ship `setTimeout` fake submit — the form pretends to work but leads silently disappear
- Trust client-side validation alone — server MUST re-validate
- Log full message bodies to console (PII)
- Cache the API route (`force-dynamic` required)
- Use edge runtime with Resend SDK (Node runtime only)
- Send email synchronously without try/catch — Resend failures shouldn't 500 silently
- Expose API key in client component
- Skip rate limit "we'll add it later" — bots find every form
- Recreate helper behavior already covered by `@sdcorejs/utils` or import browser-only utilities from the API route
- Add client UI state fields (`status`, `errors`, `checked`, `selected`, `displayName`, etc.) to `ContactPayload`

## Anti-patterns
- **Validating only on submit** — let users fix one field at a time; consider on-blur validation for better UX
- **Generic "something went wrong"** — distinguish rate limit / validation / send failure
- **Loading spinner with no aria-live region** — screen reader users get no feedback
- **`window.alert('Sent!')`** — disruptive; render success inline
- **Storing submissions in localStorage** — privacy risk, no value
- **Re-using the same Resend API key across staging + prod** — confusing logs, revoke is broad
- **Adding reCAPTCHA from day 1** — friction; honeypot + rate limit catches 95% of bots. Add CAPTCHA only if abuse is observed.

## Production checklist
- [ ] `RESEND_API_KEY` in production env vars
- [ ] `CONTACT_TO_EMAIL` set to real address
- [ ] `CONTACT_FROM_EMAIL` is a verified domain in Resend (not `gmail.com`)
- [ ] DNS records (SPF + DKIM + DMARC) configured in Resend
- [ ] Test from production URL (not localhost) — Resend free tier allows limited domains
- [ ] Monitor logs for "send_failed" responses
- [ ] If using Slack webhook, restrict to private channel (contact details are PII)

## Cross-references
- i18n messages: `i18n.md`
- Theme tokens (button color, success/danger): `theme.md`
- Section composition: `pages-and-blocks.md` (`<ContactForm />` rendered inside contact page or as section)
- Caching: API route is `force-dynamic` (not cached)
- Verification: `sdcorejs-ship (verify-before-done mode)` includes "send-test-email succeeds end-to-end" as acceptance criterion
