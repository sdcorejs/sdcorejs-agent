# Tracing, Audit, and Usage

Observability supports diagnosis and governance without turning traces into a
secondary store of prompts, secrets, personal data, or hidden reasoning.

## Tracing

```yaml
metadata_only_logging: true
raw_prompt_logging: false
raw_tool_payload_logging: false
chain_of_thought_logging: false
secret_payload_logging: false
```

Trace contract version, engine and capability profiles, model policy version,
tenant-safe correlation IDs, run/step/tool IDs, latency, status, error codes,
token counts, cache indicators, approval state transitions, and redaction
version. Hash or tokenize identifiers according to classification policy.

Do not log credentials, authorization headers, raw documents, unrestricted tool
arguments/results, hidden reasoning, or cross-tenant identifiers. Sampling and
export destinations are governance-controlled and fail closed for sensitive
workflows.

## Audit

Audit records are application-owned and separate from diagnostic traces.
Record trusted actor, tenant, permission decision, contract/profile versions,
business operation, target resource, canonical input hash, preview hash,
approval reference, resource versions, idempotency result, outcome, timestamp,
and policy versions. Make audit writes append-only and tamper-evident where
required.

An audit record must allow an authorized reviewer to reconstruct who approved
what, under which policy and data version, without exposing secret payloads.

## Usage and FinOps

Record input/output/cached tokens, tool calls, retries, duration, engine/model
labels, capability, tenant-safe cost center, and terminal reason. Calculate
currency cost outside the agent by applying a versioned external pricing policy
with effective dates; do not hardcode volatile prices in this skill pack.

Enforce budgets before a run, at each turn/tool boundary, and before expensive
fallbacks. A budget breach returns a deterministic limit result and must not
silently downgrade evidence or security controls.

## Retention

Define trace, audit, and usage retention independently. Apply deletion,
regional, legal-hold, export, and access policies. Verification must include
redaction tests and prove that a trace cannot be used to recover a secret or
another tenant's content.
