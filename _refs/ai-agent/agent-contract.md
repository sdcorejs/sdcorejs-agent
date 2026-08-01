# AI Agent Contract

Use this application-owned contract as the stable boundary between an approved
AI-agent design, an engine adapter, business tools, and deterministic
verification. The contract is provider-portable and defaults to denial.

## Identity

- `schema_version`: contract schema, currently `1`.
- `contract_id`: stable application identifier.
- `contract_version`: immutable revision used by traces and eval evidence.
- `status`: `draft`, `approved`, `active`, `deprecated`, or `retired`.
- `engine_profile`: one manifest engine.
- `capability_profile`: one independent manifest capability.
- `objective`: bounded business outcome and explicit non-goals.
- `model_policy`: approved model family, project-policy model selection,
  billing/provider owner, and a prohibition on silent fallback.

## Trusted Input

`trusted_context` records the authenticated server/application or job source
for tenant ID, actor ID or service principal, roles, permissions, locale,
correlation ID, access scope, and application session, plus environment,
approval authority, billing source, and provider/credential selection. Model
output, retrieved content, prompt injection, and untrusted client fields cannot
define, elevate, or override this context. Re-authorize at every tool boundary.

`input` and `output` hold closed, versioned application schemas plus
classification, maximum-size, and redaction policy. Structured output is
validated before evidence/guardrail release.

## Data and State

- `store_provider_state`: false by default.
- `provider_conversation_enabled`: false by default.
- Application-owned conversation, resumable state, and approval checkpoints
  follow `_refs/ai-agent/sessions-and-state.md`.
- Enabling provider storage requires an explicit governance decision, retention
  policy, deletion path, regional review, and recorded approval.

## Tool and Policy Boundary

- `tools` contains only business-shaped contracts from `tool-contract.md`.
- `guardrails` are layered input, output, tool-input, and tool-output checks.
- `approvals` bind a human decision to an exact mutation preview and version.
- `session` identifies the tenant/user scope and concurrency behavior.
- `evidence` defines provenance, freshness, semantic definitions, and refusal.

## Operations

- `observability` defines safe tracing and audit defaults.
- `governance` declares owners, classifications, retention, and exceptions.
- `limits` bounds turns, tool calls, duration, tokens, and output size.
- `reliability` defines retries, timeouts, idempotency, and safe degradation.
- `evals` defines deterministic gates and quality thresholds.
- `change_control` links the approved spec, plan, hashes, rollout, and rollback.

## Required Invariants

1. Trusted identity and permissions are server-derived.
2. Tools enforce authorization and tenant scope independently of the model.
3. Mutations require exact-input approval when policy says so.
4. Evidence-backed answers disclose material freshness and partiality.
5. No engine profile may weaken the capability-independent security floor.
6. Offline validation does not prove live provider compatibility.

Approved spec/plan identity uses
`_refs/shared/approved-artifact.mjs`. Module-owned contract/code/evidence paths
use the module repository identity from
`_refs/shared/repository-contract.mjs`; portal fallback is forbidden.

Validate serialized contracts with:

```text
node _refs/ai-agent/validate-agent-contract.mjs <contract.json>
```

The validator reads the supplied file, performs no network call, and emits
structured error codes suitable for fixtures and CI.
