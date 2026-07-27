# Responses Engine Profile

This profile maps an approved agent contract onto an application-owned
Responses API loop. It describes architecture, not a live compatibility claim.

## Ownership

The application owns request construction, response inspection, tool
authorization and dispatch, tool-result submission, loop termination,
continuation state, approval suspension/resume, retries, tracing, and audit.
Provider-generated tool requests are proposals; application policy decides
whether and how they execute.

## Loop Contract

1. Build instructions from immutable application policy and pass untrusted
   content as labeled data.
2. Attach trusted context only inside application/tool adapters; do not expose
   mutable identity fields for the model to fill.
3. Submit bounded model/tool definitions and provider storage policy.
   Select automatic, required, or explicitly named tool choice only from
   approved application policy. Use a closed structured-output schema when the
   terminal result is machine-consumed.
4. Inspect streamed or non-streamed output items. Streaming is presentation and
   transport, not permission to release unvalidated partial output. Validate
   every proposed tool call against the closed
   business schema, current permissions, tenant, limits, and approval state.
5. Execute authorized reads or suspend for exact-input mutation approval.
6. Return structured tool results and continue until a terminal answer, refusal,
   approval checkpoint, deterministic error, cancellation, or limit.
7. Validate the final evidence envelope and output guardrail before release.

Continuation strategy is explicit: either submit complete stateless application
history, continue from an approved retained response reference, or use an
approved provider conversation. Do not mix strategies implicitly. Approval resume
reloads and verifies the application checkpoint, trusted context,
contract version, exact input, expiry, resource version, and remaining limits.

## State

Default to `store_provider_state: false` and
`provider_conversation_enabled: false`. The application retains the minimal
redacted conversation/run state required by its policy. Any provider-managed
conversation or retained response identifier is a separate governance decision
with deletion, retention, regional, access, and audit controls.

## Failure and Retry

Retry only failures classified as transient and safe. Pure reads may retry
within limits. Mutations require idempotency lookup and resource-version
validation. An ambiguous write stops for reconciliation. A model fallback uses
the same contracts, tools, permissions, guardrails, approvals, and limits.

## Verification

Test the loop with deterministic fake response items: final output, one or
multiple tool calls, malformed arguments, forbidden tools, approval suspension,
stale approval, retryable read failure, ambiguous write, limit, cancellation,
and evidence failure. A live smoke check is optional, separately authorized,
and reported independently from offline contract conformance.
