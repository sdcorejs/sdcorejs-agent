# Sessions and State

Treat application session, conversation history, resumable run state, and
approval checkpoint as separate objects with separate retention and access
policies.

## Defaults

```yaml
store_provider_state: false
provider_conversation_enabled: false
application_state_owner: application
cross_tenant_reuse: forbidden
```

Provider persistence is an explicit governance choice, not an engine default
in the application contract. Enabling it requires documented purpose,
classification, retention, deletion, region, access, incident, and audit
controls.

## State Objects

- Application session: trusted tenant/user scope, locale, permissions snapshot,
  and correlation metadata.
- Conversation history: redacted user-visible turns needed for continuity.
- Resumable run state: engine cursor, pending tool work, limits, and terminal
  status; it is not an authorization grant.
- Approval checkpoint: exact proposed input, preview, actor, expiry, resource
  version, and idempotency binding.

Cross-tenant session reuse is forbidden. Cross-user reuse is forbidden unless
an approved service-principal workflow defines the participants and permission
intersection. Never accept tenant scope from a resumed model message.

## Persistence and Concurrency

Encrypt state at rest and in transit. Partition storage by trusted tenant and
principal. Apply least-privilege access, explicit TTLs, deletion, legal-hold,
backup, and redaction rules. Do not persist secrets, raw credentials, or hidden
reasoning.

Use optimistic concurrency for run state and every mutable business resource.
A stale resume or stale approval returns a conflict and requires safe
reconciliation; it must not silently replay a side effect.

## Resume Rules

On resume, reload trusted identity and permissions from the current server
context, verify contract and profile versions, enforce remaining limits, and
revalidate pending approvals. If state is missing, corrupt, expired, belongs to
another scope, or references changed policy, stop with a deterministic error.

Cancellation becomes a durable terminal state. Retries may resume reads and
pure computation, but ambiguous writes require idempotency lookup or human
resolution before another apply.
