# Contact Form — Reference Blocks

Extracted from `skills/tracks/nextjs/build-website/18-contact-form.md` to keep that skill under the 500-line ideal. Load this file when generating the contact form. Paths are repo-root-relative.

## i18n messages (Step 2)

Add to `src/i18n/messages/vi.json` (mirror in `en.json`):

```json
{
  "contact": {
    "form": {
      "name": "Họ và tên",
      "email": "Email",
      "phone": "Số điện thoại (không bắt buộc)",
      "company": "Công ty (không bắt buộc)",
      "message": "Nội dung cần tư vấn",
      "submit": "Gửi yêu cầu",
      "submitting": "Đang gửi...",
      "success": "Cảm ơn bạn! Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
      "error": "Có lỗi xảy ra. Vui lòng thử lại hoặc gọi {phone}.",
      "rateLimited": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau {minutes} phút.",
      "errors": {
        "name_short": "Họ tên phải có ít nhất 2 ký tự",
        "name_long": "Họ tên không quá 100 ký tự",
        "email_invalid": "Email không hợp lệ",
        "phone_invalid": "Số điện thoại không hợp lệ",
        "message_short": "Nội dung phải có ít nhất 10 ký tự",
        "message_long": "Nội dung không quá 2000 ký tự"
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
