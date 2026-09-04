# Portable Harness Contract

This directory defines the provider-neutral behavior shared by Codex, Claude
Code, Cursor, and GitHub Copilot.

## Action Vocabulary

Canonical skills request semantic actions:

- `progress.create`, `progress.update`
- `context.pass`
- `user.choose`, `user.approve`
- `agent.dispatch`, `agent.resume`, `agent.interrupt`
- `visual.present`
- `workspace.isolate`
- `web.fetch`
- `artifact.read`, `artifact.write`
- `verification.run`

`capability-contract.json` maps these actions to each adapter. Provider tool
names belong only in that mapping, generated adapter metadata, compatibility
documentation, and adapter-specific tests. A missing mapping is a validation
error.

Every runtime capability is `supported`, `unsupported`, or `unknown`.
`supported` permits the mapped native path when it is actually exposed.
`unsupported` and `unknown` take the declared portable fallback. Unknown never
means “probably available.”

Before delegated execution, `_refs/harness/runtime-attestation.mjs` overlays
evidence-backed current-session observations on these static defaults. It keeps
delegation, concurrent dispatch, worker-CWD binding, native/manual worktrees,
cancellation, result refs, and maximum concurrency separate. Static adapter
support is not current-session evidence.

## Runtime Decisions

`runtime-policy.mjs` is a deterministic sentinel implementation, not a session
checkpoint or a complete orchestrator. It makes the following contracts
machine-testable:

- direct answers for pure Q&A;
- fast-fix only for explicit, bounded, low-risk changes;
- full workflow for ambiguity, architecture, security, cross-cutting work, and
  public-contract changes;
- parallel fresh workers for attested safe waves, sequential fresh workers when
  only concurrency/isolation is unsafe, and parent fallback only when
  delegation is unavailable;
- native structured interaction only for a supported capability, with numbered
  Markdown fallback;
- semantic worker tiers, parent-model inheritance when override is unknown or
  unsupported, and bounded task/review envelopes;
- disjoint parallel path and resource ownership.
- response-profile resolution, event-driven progress, related-artifact
  selection, user projection, and fail-closed portable context handoff.

The `fast` worker tier is narrower than fast-fix: it may author only bounded
documentation or already-specified tests. A fast-fix to production code remains
with the parent or an appropriate balanced worker.

The approved spec, approved plan, artifact lifecycle, verification-before-done,
finish gate, and deterministic fan-in remain authoritative.

## Just-in-Time Loading

Load this overview only when dispatch or adapter behavior is relevant. Load
`capability-contract.json` when resolving an action,
`runtime-attestation.md` immediately before delegated execution,
`delegation-policy.json` when delegation is viable, and `task-brief.md` when
creating or reviewing a worker boundary. Load `communication-economy.md` only when resolving a response
profile, progress event, context handoff, or related artifact. Do not paste
these files, a full spec, a full plan, or the repository summary into every
worker prompt.
