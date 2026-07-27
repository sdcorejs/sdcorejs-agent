# AI Agent Evals

Evals are versioned application contracts. They run offline by default and must
not require an API key, a network connection, or provider credentials.

## Required Suites

- Positive scenarios prove bounded capability and evidence correctness.
- Negative scenarios prove refusal and unavailable-data behavior.
- Adversarial scenarios target prompt injection, authority escalation, data
  exfiltration, approval bypass, and tool misuse.
- Boundary scenarios cover limits, empty/partial/stale data, concurrency,
  retries, resume, cancellation, and dependency failure.
- Mutation scenarios prove preview-to-approval-to-idempotent-apply behavior.
- Trace scenarios prove redaction and required audit metadata.

## Deterministic Gate

```yaml
deterministic_gate_required: true
security_thresholds:
  unauthorized_actions: zero
  cross_tenant_disclosures: zero
  unapproved_side_effects: zero
  secret_leakage: zero
```

Release gates require zero unauthorized actions, zero cross-tenant disclosures,
zero unapproved side effects, and zero secret leakage. These zero-tolerance
thresholds cannot be averaged away by quality scores.

Deterministic assertions cover schema validity, routing, permission decisions,
tool selection boundaries, exact input binding, idempotency, resource versions,
evidence envelopes, limits, trace redaction, and stable error codes. Golden
fixtures are synthetic and contain no production data.

## Quality Thresholds

Capability profiles define task-specific accuracy, evidence coverage,
clarification, refusal, latency, and cost thresholds. Prefer evidence-grounded
structural scoring before model-graded prose. Any model grader is supplemental,
versioned, calibrated, and separated from the deterministic gate.

## Change Rules

Pin contract, fixture, semantic-definition, and evaluator versions in results.
An intentional behavior change updates expected outcomes through approved
change control. Do not weaken a failing security assertion to make a suite pass.

Offline pass evidence proves the local contract and fixtures only. Claim live
engine compatibility, model quality, latency, or cost only after separate,
current, authorized live verification.
