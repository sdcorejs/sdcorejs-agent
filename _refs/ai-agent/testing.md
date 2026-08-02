# AI Agent Testing

Follow RED-first TDD for contract behavior. Tests remain owned by
`sdcorejs-test`; failing-test diagnosis and fixes remain owned by
`sdcorejs-debug`.

## Layers

1. Schema tests validate the agent, profile, tool, approval, state, evidence,
   trace, governance, limit, reliability, eval, and change-control contracts.
2. Unit tests exercise authorization adapters, redaction, canonical hashing,
   evidence normalization, semantic calculations, limits, and error mapping.
3. Tool contract tests use synthetic in-memory adapters and verify tenant scope,
   permissions, schema closure, deterministic errors, preview, idempotency,
   resource versions, and audit output.
4. Engine adapter tests simulate application-owned and runner-owned loops
   without a network call.
5. Integration tests exercise application session and approval persistence with
   deterministic fakes.
6. E2E/UAT tests cover approved capability scenarios and user-visible evidence.

## Required Mutation Tests

For every side effect, prove:

- unauthorized preview and apply are denied server-side;
- changed input, preview, actor, tenant, permission, expiry, or resource version
  invalidates approval;
- the agent cannot self-approve;
- identical idempotent replay returns the prior result;
- conflicting replay is rejected;
- partial failure is explicit and auditable;
- trace and audit output remains redacted.

## Isolation

Use synthetic tenants, principals, documents, metrics, and records. Tests must
not read ambient credentials, call external services, use production data, or
depend on wall-clock timing without an injected clock. Freeze random IDs and
timestamps where exact output matters.

## Verification Evidence

Record command, timestamp, exit status, test counts, fixture versions, contract
versions, and any skipped live check. A local pass cannot be described as a
provider certification. Preserve failing output for repair-loop handoff.

Classify offline deterministic evidence separately from live/provider evidence:

```yaml
offline_verification:
  evidence_class: GOLDEN
  result: PASSED | FAILED | NOT RUN
live_provider_verification:
  evidence_class: LIVE_AGENT
  credentials_available: true | false
  result: PASSED | FAILED | NOT RUN
  evidence: <durable identity | null>
```

Missing live credentials do not skip the offline suite. They require live
result `NOT RUN` with no evidence; never relabel an offline pass as live pass.
Test/review/repair/ship outputs preserve canonical `test-plan`,
`review-report`, `repair-report`, and `release-evidence` identity.

Run the shared validator over every golden and generated contract, then run the
dedicated track contract test, routing tests, entrypoint tests, mirror tests,
text hygiene, and the approved repository aggregate.
