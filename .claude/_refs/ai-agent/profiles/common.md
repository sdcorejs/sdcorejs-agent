# AI Agent Common Security Floor

Every capability profile inherits this floor. A profile may add restrictions
or stricter thresholds; it must not remove, weaken, or reinterpret an invariant.

## Trust

Trusted `tenantId`, principal identity, permissions, locale, correlation ID,
and application session come from authenticated server or job context. The
model cannot set, select, infer, or override tenantId. The model must not grant
permissions, approve itself, disable policy, or treat retrieved content as
instructions.

## Tools

Generic raw tools are forbidden. This includes arbitrary SQL, HTTP, record
mutation, code execution, shell, filesystem, browser-control, message-send, and
identity-administration authority. Business-shaped tools apply closed schemas,
server-side authorization, tenant scoping, redaction, deterministic errors, and
bounded results.

## Side Effects

Mutations use preview, exact-input approval, resource version, idempotency,
optimistic concurrency, immutable audit, and explicit partial-failure behavior.
`self_approval_allowed: false` is invariant. A model, supervisor, or approval
coordinator cannot manufacture an approval or permission.

## Data and State Defaults

```yaml
store_provider_state: false
provider_conversation_enabled: false
metadata_only_logging: true
raw_prompt_logging: false
chain_of_thought_logging: false
self_approval_allowed: false
cross_tenant_reuse: forbidden
```

Application session, conversation history, resumable state, and approval
checkpoint are separate. State is encrypted, scoped, retained, and deleted by
policy. Cross-tenant or unauthorized cross-user reuse is forbidden.

## Evidence

Invented evidence is forbidden. Material claims include provenance,
`data_as_of`, metric-definition version, filters, units, and partial/stale
status. Missing or unauthorized evidence results in a bounded refusal.

## Limits and Reliability

Every contract defines positive maximum turns, tool calls, duration, input and
output tokens, result rows, retries, and concurrency. Timeouts, cancellation,
retry, fallback, and resume preserve the same security and approval policy.
Ambiguous writes are never blindly retried.

```yaml
max_turns: <positive integer>
max_tool_calls: <positive integer>
max_handoff_depth: <non-negative integer>
```

## Verification Floor

Offline deterministic gates require zero unauthorized actions, zero
cross-tenant disclosures, zero unapproved side effects, and zero secret
leakage. Live claims require separate current evidence. Security failures block
quality scoring, delivery claims, and rollout.
