---
name: sdcorejs-ai-agent
description: >-
  Approved-plan executor for first-class AI-agent contracts using one declared
  engine profile and one independent capability profile. Use for confirmed
  implementation of Responses API or Agents SDK agent architecture, tools,
  guardrails, approvals, state, evidence, tracing, offline evals, and tests.
  Under-specified agent ideas return to brainstorming; test, review, and debug
  remain owned by their dedicated skills.
required-actions: artifact.read, artifact.write, verification.run, progress.create, progress.update, user.choose, user.approve, web.fetch
---

# SDCoreJS AI Agent

Execute an approved AI-agent plan as an authoring track. This skill produces
application contracts, integration code, deterministic tests, and verification
evidence. It does not install a provider runtime into this skill pack and it
does not perform live provider calls.

## Entry Gate

Require all of the following before writing:

- an immutable approved plan with `track: ai-agent`;
- its immutable approved spec and `approved_spec_hash`;
- a valid `approved_plan_hash`;
- an `agent_architecture` block that names one `engine_profile`, one
  `capability_profile`, target paths, trust boundaries, tool boundaries,
  persistence policy, approval policy, eval policy, and verification commands;
- explicit user selection of sequential or parallel execution through
  `sdcorejs-execute-plan`.

If any item is absent, ambiguous, stale, or hash-invalid, stop and return to the
owning workflow gate. Do not infer a profile from prose after plan approval.

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and `_refs/ai-agent/manifest.json`.
Apply `_refs/shared/artifact-lifecycle.md` when `.sdcorejs/**` is written.

Use the live `Tasks` section for progress. Preserve unrelated working-tree
changes and fail closed on overlapping paths.

## Execution Contract

1. Record branch, HEAD, status, diff summary, approved artifact paths, and
   verification baseline.
2. Verify `approved_spec_hash` and `approved_plan_hash` before source edits.
3. Resolve `engine_profile` and `capability_profile` exactly once from the
   manifest. Record the resolved IDs and file paths in the live task record.
4. Load the common security floor, the selected engine, the selected capability,
   `profile-contract.json`, and only the shared references required by the
   approved plan.
5. Validate profile completeness. A capability profile may narrow behavior but
   must not weaken the common security floor.
6. Confirm trusted `tenantId`, `userId` or service principal, permissions,
   correlation ID, locale, and application session come from authenticated
   server or job context. Model output cannot define or override them.
7. Implement only approved target paths. Keep tools business-shaped, enforce
   authorization server-side, and make mutation approval, idempotency, resource
   version, audit, and redaction behavior explicit.
8. Run the offline contract validator, deterministic evals, focused tests, then
   the approved broader verification. Live compatibility claims require
   separate current evidence and are never inferred from offline fixtures.
9. Emit `ai_agent_context` for downstream owners.
10. Enter the mandatory finish chain: test, review, repair when findings exist,
    code documentation, product traceability when user-visible, user-guide
    decision, relevant memory, verify-before-done, then branch-ready.

The executor must not invoke Git. Git artifacts remain owned by
`sdcorejs-git` after the final read-only gates.

## Engine Boundary

The engine profile owns lifecycle mechanics only:

- `openai-responses`: the application owns the loop, tool dispatch, state, and
  continuation policy.
- `openai-agents-sdk`: the runner owns the loop while application code still
  owns tools, permissions, approval policy, persistence, and evidence.

Do not mix lifecycle assumptions between engine profiles. Do not create a third
provider or engine without a separately approved scope change.

## Capability Boundary

The capability profile owns business policy: objective, evidence rules, tool
categories, approvals, state delta, token delta, scenarios, invariants, and
quality thresholds. It never owns credentials, trusted identity, tenant
selection, raw infrastructure tools, or a relaxation of the common floor.

## Required Output

Pass this immutable evidence block to every downstream stage:

```yaml
ai_agent_context:
  schema_version: 1
  approved_spec_path: <path>
  approved_spec_hash: <sha256>
  approved_plan_path: <path>
  approved_plan_hash: <sha256>
  engine_profile: <resolved engine id>
  engine_profile_path: <resolved path>
  capability_profile: <resolved capability id>
  capability_profile_path: <resolved path>
  runtime_owner: <application component>
  common_security_floor: _refs/ai-agent/profiles/common.md
  manifest: _refs/ai-agent/manifest.json
  profile_contract: _refs/ai-agent/profile-contract.json
  validator: _refs/ai-agent/validate-agent-contract.mjs
  agent_contract_paths: [<path>]
  target_paths: [<path>]
  trusted_context_sources: [<server or job source>]
  authorization_and_tenant_policy: <contract reference>
  tool_contract_paths: [<path>]
  approval_bindings: <exact input/version policy>
  session_controls: <owner/isolation/concurrency policy>
  evidence_policy: <provenance/freshness/partiality policy>
  observability_and_audit_policy: <redacted policy>
  usage_and_finops_policy: <budget/pricing attribution policy>
  limits: <bounded turns/tools/handoffs/duration/tokens>
  provider_storage_policy: <disabled or approved governance reference>
  deterministic_eval_commands: [<command>]
  focused_test_commands: [<command>]
  verification:
    commands: [<command>]
    result: <pass|fail|skipped>
  live_provider_verification:
    performed: false
    evidence: null
  findings: []
```

Reject downstream work when this block conflicts with the approved hashes,
resolved profiles, changed target paths, or current working-tree evidence.

## Failure Conditions

Stop without partial claims when:

- trust identity can be model-supplied or client-authoritative;
- a generic raw data, HTTP, record mutation, or code execution tool is exposed;
- a side effect lacks exact-input approval, idempotency, resource versioning,
  authorization, audit, redaction, or deterministic failure behavior;
- provider storage is enabled without explicit governance approval;
- session reuse can cross tenants or users;
- evidence may be invented or material freshness/partiality is hidden;
- limits, deterministic gates, or zero-tolerance security thresholds are absent;
- validation, tests, review, or final verification fails.

Report exact failed checks, retained changes, and the next owning skill.
