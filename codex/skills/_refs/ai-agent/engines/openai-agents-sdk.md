# Agents SDK Engine Profile

This profile maps an approved agent contract onto an SDK runner-owned loop. It
describes required integration boundaries and does not promise live
compatibility with an unverified package version.

## Ownership

The runner owns model/tool turn iteration and terminal result assembly.
Application code still owns agent instructions, tool schemas and handlers,
trusted context, authorization, tenant scope, approval policy, sessions,
guardrails, evidence validation, tracing export, limits, and audit.

Construct an explicit `Agent` definition and invoke it through the approved
runner. Runner convenience never transfers application policy ownership.

## Runner Contract

1. Construct the agent and tools from versioned application policy.
2. Pass trusted context through application-owned runtime context, never through
   model-selected tool arguments.
3. Run with explicit turn and execution limits.
4. Treat tool calls as proposals. Handlers revalidate schemas, permissions,
   tenant, resource versions, approvals, idempotency, and redaction.
5. Represent approval-required work as an application checkpoint that can be
   inspected, approved against exact input, persisted, and safely resumed.
6. Validate terminal output and evidence before returning it to the user.

## Sessions and Continuation

Use an application session implementation whose partition key includes trusted
tenant and principal scope. Persist conversation, resumable run state, and
approval checkpoints according to their separate policies. Cross-tenant reuse
is forbidden. Provider-managed persistence remains disabled unless its own
governance decision is approved.

Serialized SDK/run state is secret-free, versioned, tenant/principal bound, and
validated before resume. Approval interruption/resume uses the same exact-input
application checkpoint and remaining limits as the original run.

## Guardrails and Handoffs

Input/output and tool guardrails complement authorization; they do not replace
it. Any handoff or agent-as-tool relationship uses a declared contract,
permission intersection, bounded context transfer, depth/turn limits, and
central audit. A child cannot receive authority its caller lacks.

Tracing exports metadata-only spans through application redaction and retention
policy. The application owns the final result schema and validates evidence
before exposing the runner result.

## Verification

Use a deterministic fake model/runner or SDK test seam to cover tool routing,
guardrail tripwires, approval interrupt/resume, session isolation, structured
results, limit termination, cancellation, and trace redaction. Keep package
integration tests pinned to the consuming project's approved version. Report a
live smoke check only when it was separately authorized and actually run.
