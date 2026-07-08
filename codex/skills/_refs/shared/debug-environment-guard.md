# Debug Environment Guard

> Loaded by `sdcorejs-debug` before repro steps that touch browsers, APIs,
> databases, external integrations, persistent state, or non-local systems.

## Environment Classes

| Class | Signals | Policy |
|---|---|---|
| `local` | localhost, local process, local container, in-memory DB | Safe for normal focused repro when commands are discovered. |
| `mock` | mocked backend, fixture server, fake service, test double | Safe when mock contract and data are understood. |
| `dev` | shared dev URL, shared dev DB, team sandbox | Avoid destructive repro unless isolated data and cleanup are approved. |
| `staging` | UAT/staging URL or DB | Read-only by default; writes need approved accounts/data and cleanup. |
| `prod` | production host, production DB, live payment/email/SMS | Block destructive repro. Use sanitized evidence or approved safe instrumentation. |
| `unknown` | base URL/env cannot be classified | Block external writes and record the missing environment evidence. |

## External Side-Effect Guard

Never trigger these unless a safe sandbox is confirmed and the user explicitly
approves the exact action:

- real payments, refunds, credits, invoices, or wallet changes;
- real email, SMS, push notifications, or webhook sends;
- uploads, deletes, account changes, permission changes, password/token changes;
- migrations, backfills, truncates, seeds, cleanup scripts, or destructive SQL;
- production data export or raw production payload inspection.

## Safe Data Rules

- Prefer sanitized logs, stack traces, screenshots, request IDs, and minimal
  payloads.
- Do not request or print raw production data.
- Record seed/setup/cleanup strategy for persistent repro data.
- If base URL, auth, role, data, or cleanup strategy is missing, mark the repro
  blocked or record the command as skipped. Do not treat missing environment as
  code failure.

## Secret And PII Redaction

Redact before reporting:

- credentials, tokens, cookies, authorization headers, API keys, passwords,
  private keys, JWTs, refresh tokens, database URLs;
- emails, phone numbers, national IDs, addresses, customer names, account IDs,
  order IDs, and production payload data when not necessary;
- request bodies, SQL parameters, stack traces, network logs, shell output, and
  diffs that contain sensitive values.

Use redacted evidence such as `TOKEN=[REDACTED]`. Report only path, line number
when available, key/category name, and risk reason for suspected secrets.

