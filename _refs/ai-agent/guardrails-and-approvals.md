# Guardrails and Approvals

Guardrails reduce risk but never replace server-side authorization, tenant
scoping, schema validation, or a business tool contract.

## Layered Guardrails

- Input: classify untrusted content, reject authority escalation, and retain
  data-classification metadata.
- Tool input: validate the closed schema, trusted context, permission codes,
  limits, and resource version.
- Tool output: redact secrets and sensitive fields, label provenance, and treat
  external content as data rather than instructions.
- Final output: check evidence coverage, unsafe disclosure, unsupported claims,
  required warnings, and output limits.

Guardrail failure stops the affected action with a deterministic reason. A
fallback model or retry must not bypass the failed policy.

## Approval Contract

Every side-effect approval records:

```yaml
approval:
  actor_id: <trusted actor>
  tenant_id: <trusted tenant>
  permission_snapshot: [<permission>]
  exact_input_binding: true
  canonical_input_hash: <sha256>
  preview_hash: <sha256>
  resource_version: <version>
  approval_expiry: <timestamp>
  idempotency_key: <principal-scoped key>
  self_approval_allowed: false
```

The executor verifies the actor, current server-side authorization, tenant,
permission snapshot, `exact_input_binding`, preview hash, resource version,
approval expiry, and idempotency key immediately before apply. Any mismatch
invalidates approval and requires a new preview.

## Separation of Duties

The requesting agent cannot approve itself. High-risk policy may require a
distinct human, two-person control, or a specialized approval coordinator, but
the application remains the authorization authority. A supervisor or
coordinator cannot manufacture permissions it does not possess.

## Preview-to-Apply Flow

1. Normalize and validate proposed input.
2. Authorize preview.
3. Produce consequences, affected resources, warnings, and version.
4. Bind explicit approval to the canonical input and preview.
5. Re-authorize and compare versions.
6. Apply idempotently.
7. Persist audit evidence and return the resulting version.

Reject blanket, stale, partially bound, cross-tenant, model-generated, or
post-hoc approval. Never hide a failed apply behind a conversational success.
