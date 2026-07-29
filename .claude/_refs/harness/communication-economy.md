# Communication Economy Policy

Use minimal sufficient communication across SDCoreJS runtime messages and
handoffs. Optimize total selected context and user-visible duplication without
weakening approval, safety, verification, artifact lifecycle, evidence, or
downstream contracts.

Load this reference just in time for response-profile resolution, progress
events, typed-context projection, portable handoff, or related-artifact
selection. Do not add it to every always-loaded bootstrap.

## Contents

- [Invariants](#invariants)
- [Response Profiles](#response-profiles)
- [Artifact Boundary](#artifact-boundary)
- [Runtime Envelope](#runtime-envelope)
- [Progress Events](#progress-events)
- [Related Artifact Selection](#related-artifact-selection)
- [Final Projection](#final-projection)
- [Deterministic Contract](#deterministic-contract)

## Invariants

- Select the smallest sufficient evidence set before shortening prose.
- Compact prose remains complete, professional, grammatical, and localized.
- Keep authoritative typed context for the exact consumer, but do not echo it
  to the user by default.
- Preserve approval scope, security/destructive consequences and recovery,
  blockers, failures, skipped checks, and verification evidence.
- Preserve code, commands, paths, identifiers, URLs, hashes, errors, numbers
  and units, exit codes, permission codes, environment variable names,
  acceptance criterion IDs, and finding IDs exactly.
- Never infer a structured channel from conversation memory or create mutable
  runtime/session state under `.sdcorejs/**`.

## Response Profiles

Every message resolves to `compact`, `standard`, or `detailed`; `auto` is only
a resolver input.

### Compact

Default to compact for routine progress, successful bounded fast-fixes,
successful verification, normal handoffs, direct technical answers, and final
results without blockers or complex decisions. Lead with the outcome and use
complete professional sentences. Omit greetings, filler, self-narration, empty
sections, file-read/tool-call histories, repeated plans, full diffs, and full
typed contexts. Show only evidence needed to support the result.

### Standard

Use standard for ordinary design/explanation, review findings, skipped
verification that is not blocking, normal trade-offs, or a request for more
explanation. Keep the same outcome and evidence as compact, with sufficient
rationale.

### Detailed

Use detailed automatically for spec/plan approval, security warnings or policy
decisions, destructive/irreversible actions, ambiguous high-impact decisions,
order-sensitive instructions, migrations, public-contract decisions,
verification failure, conflicting evidence, unresolved blockers, or an
explicit request for detail/full context. State exact scope, consequences,
recovery or rollback, risks, evidence conflict, options, and required decision.

Detailed does not automatically expose a full context block. Show one only
when the user requests it, validation/debugging requires it, no smaller safe
handoff exists, or the workflow requires inspection of that exact structure.

Resolve in this order:

1. explicit user request;
2. mandatory safety, approval, and clarity escalation;
3. workflow or artifact contract;
4. message kind;
5. default compact.

A request for brevity never suppresses safety consequences, recovery, approval
scope, failure, or blockers.

## Artifact Boundary

Profiles govern runtime communication and user projection. They do not force
compact prose onto approved specs/plans, architecture or security docs, user
guides, PR descriptions, changelogs/release notes, durable handoffs, test plans,
or traceability artifacts. Those retain complete templates and prose. A plan
references its approved spec by ID, path, and hash and carries implementation
deltas instead of copying the spec body.

## Runtime Envelope

Keep three separate layers:

1. **Authoritative runtime context.** Preserve complete typed fields required
   for identity, approval, security, freshness, verification, closure, and
   unresolved state. Keep existing context names for compatibility.
2. **User projection.** Show a localized outcome plus material changed paths,
   verification, blockers, risks, skipped checks, next action, or next
   decision. Elide empty fields. Review findings retain severity, evidence,
   file/line or exact scope, risk, and suggested action. Approval projections
   retain scope, acceptance criteria, risks, consequences, and stable numbered
   options. Spec and plan approvals keep `1. Approve`, `2. Change`, and
   `3. Cancel`.
3. **Portable handoff.** When `runtime_context_channel` is `unsupported` or
   `unknown`, pass only the exact consumer-required fields plus context type,
   next consumer/action, relevant `HEAD` or diff fingerprint, artifact
   ID/path/hash references, bounded evidence references, state delta,
   blockers/unresolved items, and redaction status.

Reference specs, plans, diffs, logs, and repository summaries; never paste
their full bodies into a handoff, including bodies nested inside an otherwise
required context object or disguised inside a string-valued reference, delta,
action, fingerprint, or user-projection field. Reference/action/fingerprint
shape and content signatures are validated without rewriting exact technical
values. Validation fails closed when a required field is absent, empty where
identity/state is required, has the wrong shape, represents an unapproved
spec/plan, or claims passing test evidence without a current run. The matrix
covers typed workflow contexts plus independent `test_status`, append-oriented
`test_evidence`, and `parallel_context` ownership/fan-in state. Full context is
user-visible only under the detailed exceptions above.

`context.pass` is the provider-neutral action.
`runtime_context_channel` is tri-state:

- `supported`: use the mapped structured channel only with host evidence;
- `unsupported`: use the portable handoff;
- `unknown`: use the portable handoff.

## Progress Events

Create or update visible progress when non-trivial work starts, a meaningful
outcome completes, scope changes, a blocker appears, verification completes or
fails, a decision is required, or the user asks for status.

Do not narrate another file read, ordinary action, command transition inside
the same outcome, impending final response, or internal reasoning. If a native
tracker must close and state changed, close it without a duplicate visible
summary. When any meaningful event occurs immediately before a final response,
update required internal tracker state but let the final response be the one
visible projection. Keep a host-required long-task heartbeat short and free of
repeated evidence.

## Related Artifact Selection

Read metadata before bodies and select in this order:

1. same `contract_id`;
2. same `change_ref`;
3. explicit `supersedes` relationship;
4. same requirement or exact module;
5. explicit user selection;
6. canonical template/frontmatter/headings.

Recency only breaks a tie within the same relationship. For style, use the
canonical template or one related artifact's frontmatter/headings. Read a body
only when its content is a dependency. Do not load recent artifacts merely to
copy style.

A user-selected full review scope is different: read every file inside that
scope. Do not reinterpret a full audit as permission to sample.

## Final Projection

Lead with the outcome and include only material changed paths, verification,
risks/skipped checks, blockers, or a required decision. Put blockers before
secondary explanation. Do not repeat the plan, context, diff, or action log.
Do not claim done, ready, fixed, safe, or passing without current evidence;
skipped remains skipped. Do not invent a next step when none is required.

## Deterministic Contract

`communication-economy.mjs` provides pure helpers for profile resolution,
progress events, projection, portable validation, related-artifact selection,
exact-preserving rendering, rendered semantic coverage, and measurements. Its
consumer-required-field and field-shape matrices are the portable compatibility
contract. The deterministic report reads baseline schema surfaces from the
declared source commit and combines them with sanitized scenario inputs; it is
not a captured live-agent transcript or token-usage result. The helpers perform
no repository writes and create no server, database, or mutable checkpoint.
