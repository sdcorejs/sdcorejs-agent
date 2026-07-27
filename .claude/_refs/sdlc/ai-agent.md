# AI-Agent SDLC Reference

Use this reference during brainstorming, spec, and plan for a first-class
AI-agent implementation. It defines the decisions that must be approved before
`sdcorejs-ai-agent` can execute.

## Track Selection

Select `track: ai-agent` only when the primary deliverable is an application
agent contract or implementation with bounded model orchestration, business
tools, guardrails, approvals, state, evidence, tracing, evals, and tests.

Do not select it for:

- an under-specified request to "build an agent" or "use AI";
- a ChatGPT App/MCP widget, generic backend/frontend feature, or skill authoring;
- test-only, review-only, failing-test diagnosis, documentation, or Git intent;
- a normal deterministic workflow that does not benefit from model reasoning.

Under-specified intent returns to brainstorming. Dedicated utility intent stays
with test, review, debug, documentation, ship, or Git.

## Required Spec Decisions

Confirm and specify:

1. Capability objective, actors, business outcome, non-goals, positive,
   negative, adversarial, and boundary scenarios.
2. One capability profile from `_refs/ai-agent/manifest.json`, or an explicitly
   approved new profile scope.
3. One engine profile: `openai-responses` for an application-owned loop or
   `openai-agents-sdk` for a runner-owned loop.
4. Runtime owner, consuming project, target paths, language/framework, approved
   package/dependency scope, version selection owner, and fallback policy.
5. Trusted context source for `tenantId`, principal, permissions, locale,
   correlation ID, and application session. Model authority over them is false.
6. Data classifications, tenant isolation, consent/legal basis, retention,
   deletion, region, redaction, and secrets boundary.
7. Provider storage posture. Default `store_provider_state: false` and
   `provider_conversation_enabled: false`; enabling either requires a named
   governance decision and verification.
8. Every business-shaped tool: schemas, side effect, risk, permissions,
   approval, preview, idempotency, resource version, audit, redaction, errors,
   timeout, and partial-failure behavior.
9. Guardrails at input, tool input, tool output, and final output, with
   deterministic failure semantics and server-side authorization.
10. Mutation approval actor/policy, exact-input and preview binding, expiry,
    resource version, separation of duties, apply/retry, and rollback.
11. Application session, conversation history, resumable state, and approval
    checkpoint ownership, partitioning, TTL, encryption, concurrency, resume,
    cancellation, and deletion.
12. Evidence provenance, `data_as_of`, semantic definitions, freshness,
    partiality, citations, missing-evidence behavior, and user disclosure.
13. Tracing, audit, and usage metadata, redaction, retention, access, cost
    allocation, versioned external pricing policy, and budget enforcement.
14. Positive limits for turns, tool calls, handoff depth, duration, tokens,
    result size, retries, and concurrency.
15. Reliability posture for timeout, retry, fallback, idempotency,
    reconciliation, degradation, and dependency failure.
16. Offline deterministic evals and tests, zero-tolerance security thresholds,
    golden/invalid fixtures, quality thresholds, and separately authorized live
    verification.
17. Rollout, rollback, owners, contract/profile versions, approved spec/plan
    hashes, and change-control triggers.

## Architecture Block

The approved plan must contain:

```yaml
agent_architecture:
  schema_version: 1
  engine_profile: openai-responses | openai-agents-sdk
  capability_profile: <manifest capability id>
  runtime_owner: <application component>
  target_paths: [<approved path>]
  trusted_context_sources: [<authenticated server/job source>]
  tenant_isolation: <policy>
  provider_state:
    store_provider_state: false
    provider_conversation_enabled: false
    governance_approval: null
  tool_contract_paths: [<path>]
  approval_policy: <policy reference>
  session_policy: <policy reference>
  evidence_policy: <policy reference>
  observability_policy: <policy reference>
  limits: <bounded values>
  deterministic_eval_commands: [<offline command>]
  live_verification:
    required: false
    authorization: null
  non_goals: [<explicit exclusion>]
```

Resolve engine and capability independently and exactly once. If either ID is
missing from the manifest, required fields are incomplete, a path is outside
approved scope, or a profile would weaken the common floor, planning fails
closed and returns to spec.

## Acceptance Floor

Acceptance criteria must prove trusted identity, tenant isolation, business tool
boundaries, server denial, approval binding, state separation, evidence
integrity, trace redaction, deterministic limits, security-zero evals, offline
validator behavior, focused tests, broader project verification, and honest
separation of offline from live evidence.
