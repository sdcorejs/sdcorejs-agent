---
name: sdcorejs-product
description: Use when an existing approved product contract needs projection, approved revision, traceability synchronization, read-only or persistent audit, a supplied manual UAT result, supersession, or implementation/test alignment review. Not for drafting a new PRD, story, or acceptance criteria from an open idea. Applies across tracks. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Product Contract Track

Treat approved requirements as normative and code, tests, reviews, runtime
observations, and UAT as evidence. This skill writes product artifacts only; it
never generates application code.

## Classify And Emit The Boundary First

Before any target-project read, write, or command, classify exactly one
`product_action` from the request. Do not combine actions in one execution.

A generic request to write or draft a new PRD, user story, acceptance criteria,
or requirement set without an immutable approved source does not select a
product action. Return it to `sdcorejs-brainstorming`, then `sdcorejs-spec`;
do not invent seed authority from authoring intent.

| Request intent | `product_action` |
|---|---|
| Project an immutable approved spec into product documents | `seed-from-approved-spec` |
| Apply an approved material requirement revision | `requirements-update` |
| Synchronize implementation, verification, and evidence mappings without changing requirements | `traceability-sync` |
| Inspect and report product alignment with no persistence | `audit-readonly` |
| Inspect product alignment and persist only derived audit state | `audit-and-sync` |
| Record an explicitly supplied UAT execution result | `record-uat` |
| Apply an approved feature retirement or replacement relationship | `supersede-feature` |

If more than one action remains possible, stop before project access and ask
one numbered decision using `_refs/shared/user-choice-prompt.md`. A former
generic label is not an action; apply the compatibility rules in
`_refs/product/product-protocol.md` and reject an ambiguous request.

Immediately emit this maximum side-effect boundary:

```yaml
product_boundary:
  source: sdcorejs-product
  product_action: "{one exact product action}"
  persistence_requested: "{true only for an explicit audit-and-sync request; otherwise false}"
  side_effects_allowed: "{true or false from the action policy}"
  write_authorized: false
  requirements_changed: "{true only for an approved normative projection or revision}"
  allowed_path_classes: ["{only artifact classes owned by the selected action}"]
  prohibited_path_classes: [approved-spec-snapshots, application-source, unrelated-contracts, legacy-ledger-bytes]
  summary_refresh: false
  checkpoint_write: "{false for audit-readonly; otherwise policy-derived}"
```

This boundary is a ceiling. `write_authorized` remains false until validation
and preflight pass. Read-only discovery resolves the declared owned classes to
concrete repository-relative paths and may narrow them, but must never add a
class or broaden the boundary silently. For `audit-readonly`, emit
`side_effects_allowed: false`, `write_authorized: false`,
`requirements_changed: false`, empty allowed paths, and a deny-all write
policy. It forbids checkpoints, summary refresh, auto-docs, ledgers, caches,
temporary project files, and every other write.

An intent to change requirements or approve currently unapproved observable
behavior without approved change control is classified as a blocked
`requirements-update`. Emit the boundary with no authorized paths, run the
action validator, then route through `sdcorejs-brainstorming` and
`sdcorejs-spec`. Do not edit product requirements while waiting for approval.

## Shared Protocols After The Boundary

After the boundary exists:

1. Read `_refs/shared/tasklist.md`. For `audit-readonly`, keep Tasks only in the
   response and do not persist its checkpoint.
2. Read `_refs/shared/persona.md` only when a project persona exists.
3. Run `sdcorejs-explore (summary-read)` through
   `_refs/shared/project-context.md` with the action's declared side-effect
   policy. Missing or stale context never grants a refresh.
4. Treat the current request, approved immutable artifacts, current files,
   diffs, command output, and supplied evidence as stronger than stored
   descriptive summaries.

## Load Only The Required Product References

Every action loads `_refs/product/product-protocol.md` and
`_refs/product/product-context.md`. Load additional references only as shown:

| Action | Additional references |
|---|---|
| `seed-from-approved-spec` | `_refs/product/templates.md` |
| `requirements-update` | `_refs/product/templates.md` |
| `traceability-sync` | `_refs/product/traceability.md`, `_refs/product/evidence-and-uat.md`, `_refs/product/templates.md` |
| `audit-readonly` | `_refs/product/traceability.md`, `_refs/product/evidence-and-uat.md` |
| `audit-and-sync` | `_refs/product/traceability.md`, `_refs/product/evidence-and-uat.md`, `_refs/product/templates.md` |
| `record-uat` | `_refs/product/evidence-and-uat.md`, `_refs/product/templates.md` |
| `supersede-feature` | `_refs/product/templates.md` |

Use `_refs/product/product-protocol.mjs` for the mechanically enforceable
subset. Its exported validators are required checks; the Markdown contracts
still govern rules that cannot be inferred mechanically.

## Deterministic Process

1. **Validate the action.** Call `validateProductAction` with the emitted
   action, side-effect flag, approval, revision, spec, UAT, and supersession
   prerequisites. Any error blocks execution; it is never converted to another
   action automatically.
2. **Resolve authority and identity.** Locate the immutable approved spec and
   exact `contract_id`, `requirement_revision`, source path, and source hash.
   Never infer approved intent from code or tests. Use
   `validateIdentityTransition` for revision or supersession actions.
3. **Resolve the existing layout first.** Discover product documents, active
   ledger, history, and legacy records for the exact contract. Existing target
   layout wins when attribution is unique and safe. Call
   `observeProductLayoutState` to enumerate every file-backed
   `.sdcorejs/docs/product/**/current.md` candidate for the exact contract and
   feature; caller-supplied candidate lists are comparison claims only.
   Otherwise call `resolveProductLayout` for the collision-safe contract-key
   fallback. More than one observed active candidate blocks the action.
4. **Perform write preflight.** Record branch, HEAD, status, dirty paths,
   planned paths, normative before/after projections, and explicit allowlists.
   Call `validateActionSideEffects` before a write. A dirty intended path,
   contract collision, ambiguous active ledger, legacy overwrite, path escape,
   or out-of-scope path stops before mutation and requires a user decision when
   applicable.
5. **Derive and redact the intended state without mutation.** For mapping actions, call `deriveTraceability`,
   `evaluateEvidenceFreshness`, `deriveRequirementReadiness`, and
   `deriveFeatureVerdict` from the current read-only snapshot. Call
   `redactProductEvidence` on every proposed payload and evidence value before
   constructing the complete proposed `product_context` with planned writes
   and empty actual writes. Raw secrets, credentials, tokens, customer
   identifiers, and PII must not enter an authorization input, artifact,
   context block, command excerpt, or report. Automated E2E remains verification evidence and
   never changes UAT status. Every active requirement has exactly one row even
   for blocked, stale, or partial results; missing rows cannot become
   `NOT_APPLICABLE`. Bind passed row evidence to contract, feature, spec body and
   integrity hashes, approved plan path/body/integrity hashes, and require its
   relevant-path manifest to cover the row's spec, implementation,
   test/artifact, and expected-result refs. Behavior comparison must pass the
   `trusted_authority` returned by `verifyApprovedSpecAuthority`; its
   file-backed requirements, per-requirement field hashes, and source hashes
   replace caller-authored normative text before drift is derived. Both
   normative snapshots must match that complete projection and both hash maps
   exactly. When implementation or verification is `not_applicable`, construct
   the complete proposed context, call `observeProductDecisionAuthority` with a
   parent-owned `observeDecisionSet` callback, and pass the returned opaque
   one-shot capability plus its bound context/current state through the third
   `deriveFeatureVerdict` argument. One capability covers the complete
   decision set and is consumed once, not once per row. A missing trusted
   projection or an attempted normative redefinition is blocking. A passed verification or required passed UAT state without
   non-empty bound record IDs cannot support readiness.
6. **Authorize and execute one bounded write.** For a write-capable action,
   synchronously run `validateProductAction` and `validateActionSideEffects` on
   the proposed context. Set `write_authorized: true` only after those
   deterministic prerequisites pass, then call `authorizeProductContext` with
   the planned-write context plus parent-owned `executeWrite`,
   `observeWriteResult`, and, when implementation or verification has an
   approved `not_applicable` decision, `observeDecisionSet` callbacks. That async gate calls
   `validateProductContext` with its fresh one-shot
   observations; a caller must
   not treat the raw `write_authorized` field as permission. The gate must
   re-read approved authority and relevant file state after
   every interactive or external-observer wait. A denial, stale observation,
   malformed context, or intervening state change blocks the write. The
   file-observed plan scope is the maximum boundary: the context allowlist must
   be equal or narrower, and every planned path must match a plan allow pattern
   and no plan prohibition under the shared canonical path/glob/case/target-root
   rules. `product/**` and `.sdcorejs/docs/product/**` are separate plan scopes
   and are available only when each was explicitly approved. The
   gate consumes its private capability and invokes `executeWrite` inside the
   gate with a closed request containing `repository_root`, `context_digest`,
   `current_state_digest`, `planned_writes`, and `request_digest`. The callback
   returns a closed receipt with `completed: true`, the exact request/context
   digests, observed `actual_writes` and `deleted_paths`, and an SHA-256
   `after_status_digest`. The gate then calls `observeWriteResult` with the exact
   request and receipt digest. Its independently observed path sets and status
   digest must match the receipt, contain a real change, and remain within the
   planned set. Only then may the gate return `authorized: true` and
   `write_executed: true`; those fields are completed-execution evidence, never
   reusable permission. Do not perform a second write outside the gate, broaden
   its paths, or insert another wait before execution.
   `audit-readonly` skips only the write authorization. It still calls
   `authorizeProductContext` with parent-owned `observeAuditStatus` and
   `executeAudit` callbacks. The gate runs the exact order
   `observeStatus(before) -> executeAudit -> observeStatus(after)` and requires
   the closed audit result `{ completed: true, request_digest }` with the exact
   request digest before consuming the one-shot zero-write proof.
7. **Observe only the completed bounded write.** The in-gate callback writes
   only the redacted payload supplied for the bounded request. Requirement-changing actions project the
   approved revision. Derived actions preserve every normative field.
   `record-uat` changes only UAT execution state and derived mappings. After the
   callback completes, do not mutate again. Recompute actual changed paths
   immediately; any path outside the planned set blocks the result.
8. **Re-read and redact the observed state.** After the mutation, re-read the
   affected files and call `redactProductEvidence` again before constructing
   final context or evidence. Never carry a raw post-write value into the final
   authorization input, persisted evidence, or output.
9. **Issue post-write final authorization.** Rerun
   `validateActionSideEffects`, reconstruct the complete `product_context` from
   the observed post-write state, and rerun the deterministic action and side
   effect validators. Then call a fresh asynchronous `authorizeProductContext`,
   including a fresh `observeDecisionSet` callback when the final context
   contains implementation or verification `not_applicable` decisions,
   which invokes `validateProductContext` with newly observed authority, after
   all execution observers and writes, and before persisting final context or
   evidence, reporting, or a `READY` / `READY_WITH_WARNINGS` claim.
   After all execution and build observer waits, the gate re-reads the relevant
   paths, exact approved spec, and exact approved plan. It validates the plan's
   body and integrity hashes, approved-spec chain, contract, feature, revision,
   complete requirement ID set, product action, and target root through the
   shared approved-plan integrity contract. It also checks the final context
   allowlist and every planned, actual, or deleted persisted path against the
   file-observed plan allow/prohibit scope. Final plan identity and scope come
   from that file observation; caller-provided plan path, hashes, or widened
   path lists are comparison claims only. Do not perform another external
   observer wait before the one-shot decision.
   This post-write authorization is distinct from and cannot reuse the
   pre-write authorization. It also applies to a non-ready context with
   `write_authorized: true` or planned, actual, or deleted persisted writes. If
   UAT records are present, pass the parent-owned async
   build-identity observer; the gate independently hashes every canonical UAT
   scenario source file and binds both observations into its one-shot result.
   For a ready verdict, also pass parent-owned automated-evidence and manual-UAT
   execution observers for every bound ID. Raw evidence, UAT, and hash/build
   fields are never authority. The callbacks are a host trust boundary rather
   than cryptographic proof and must query the actual runner/report/UAT system,
   not echo the context under validation. Only the freshly re-read,
   file-backed, execution-attested post-write result may be persisted as final
   context/evidence or reported as ready. Final authorization also performs its
   own file-backed active-ledger discovery and compares the trusted candidate
   set with `layout.active_candidates`; omission of a second current ledger is
   therefore blocking. For `audit-readonly`, supply both `observeAuditStatus`
   and `executeAudit` even for a non-ready result; an audit outside that exact
   bracket or caller-authored matching digest strings are not a zero-write proof.
   Before a lifecycle is
   dispatched, callers validate its topology with
   `validateProductOrchestration(flow, { validationPhase: 'preflight' })`.
   After execution they call `validateProductOrchestration(flow)` for strict
   completed-result, post-sync identity, global verification, and audit proof.
   Validator errors produce a blocked result, never a passing claim.
10. **Report deterministically.** State the selected action, identity, authority
   sources, resolved paths, planned and actual writes, independent statuses,
   gaps, evidence freshness, derived verdict, redaction state, and next
   approved action. Do not silently chain a second product action.

## Required Output

Emit the complete machine-readable block defined by
`_refs/product/product-context.md`, followed by a short localized summary. At a
minimum the block contains:

```yaml
product_context:
  schema_version: 1
  source: sdcorejs-product
  product_action: "{selected action}"
  persistence_requested: "{boolean}"
  contract_id: "{stable upstream contract ID}"
  feature_id: "{stable feature ID bound to the approved spec}"
  approved_spec_integrity_hash: "{authority/integrity sha256}"
  approved_plan_path: "{repository-relative immutable approved plan path}"
  approved_plan_hash: "{approved plan body sha256}"
  approved_plan_integrity_hash: "{approved plan authority/integrity sha256}"
  requirement_revision: "{positive integer}"
  layout: {}
  side_effects_allowed: "{boolean}"
  allowed_paths: []
  planned_writes: []
  actual_writes: []
  changes: {}
  status: {}
  rows: []
  evidence: []
  gaps: []
  verdict: "{derived verdict}"
  redaction: {}
```

Unknown, stale, missing, deferred, and not-applicable values remain explicit;
absence never means passed. Link requirements by stable ID, source path,
anchor, revision, and hash instead of copying normative prose into the ledger.

## Completion Rules

- After a write-producing product action, any later product, documentation,
  task, memory, code, test, or generated-file write stales the derived context.
  Run a new `traceability-sync` before the final `audit-readonly` when the full
  lifecycle requires current product state.
- In a declared product lifecycle, consume the explicit `write-tail-complete`
  checkpoint, make `traceability-sync` the final write, require deny-write
  global verification on the post-sync HEAD/diff, then run `audit-readonly`.
  Reject any independent or downstream allow-write stage after sync.
- `audit-readonly` is complete only when before/after snapshots prove zero
  changed paths. It never refreshes a summary or checkpoint.
- Product readiness is not branch readiness. `sdcorejs-ship` remains the final
  delivery authority and consumes the final read-only product context only
  when the target has a relevant product contract.
- Preserve runtime localization in generated project prose. Keep contract IDs,
  requirement IDs, paths, permission codes, environment keys, and schema field
  names in English.

## Cross-References

- `sdcorejs-brainstorming` and `sdcorejs-spec` own unapproved requirement change
  control.
- `sdcorejs-plan` and `sdcorejs-execute-plan` preserve the selected product
  action and frozen contract identity.
- `sdcorejs-test` supplies verification evidence without promoting UAT.
- `sdcorejs-ship` consumes, but does not redefine, the product verdict.
