# Contact Form — Reference Blocks

Extracted from the `contact-form` write-code pack (`_refs/nextjs/build-website/write-code/contact-form.md`) to keep that pack under the 500-line ideal. Load this file when generating the contact form. Paths are repo-root-relative.

## i18n messages (Step 2)

Add to `src/i18n/messages/vi.json` (mirror in `en.json`):

```json
{
  "contact": {
    "form": {
      "name": "<localized text>",
      "email": "Email",
      "phone": "<localized text>",
      "company": "<localized text>",
      "message": "<localized text>",
      "submit": "<localized text>",
      "submitting": "<localized text>",
      "success": "<localized text>",
      "error": "<localized text>",
      "rateLimited": "<localized text>",
      "errors": {
        "name_short": "<localized text>",
        "name_long": "<localized text>",
        "email_invalid": "<localized text>",
        "phone_invalid": "<localized text>",
        "message_short": "<localized text>",
        "message_long": "<localized text>"
      }
    }
  }
}
```

The error keys (`name_short`, `email_invalid`, …) match the zod error codes — never embed user-facing strings in the schema.

## Rate limiter (Step 4)

Simple in-memory implementation. For production with multiple instances, swap for Upstash Redis (`@upstash/ratelimit`).

```typescript
// src/lib/rate-limit.ts

interface Bucket { count: number; resetAt: number; }
const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  windowMs: number;   // e.g. 15 * 60 * 1000 (15 min)
  max: number;        // e.g. 5 submissions per window
}

export function rateLimit(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remainingMs: config.windowMs };
  }

  if (bucket.count >= config.max) {
    return { allowed: false, remainingMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remainingMs: bucket.resetAt - now };
}

// Periodic cleanup so the Map doesn't grow indefinitely.
// In a single-process server this is fine; for serverless cold starts it resets naturally.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }, 60_000).unref?.();
}
```
