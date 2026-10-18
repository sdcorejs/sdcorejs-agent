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
- `source.read`, `tracker.write`
- `artifact.read`, `artifact.write`
- `verification.run`

`source.read` and `tracker.write` are connector actions (capabilities
`external_source_read` and `issue_tracker_write`). Every adapter maps them with
`status: unknown` and empty `native`, so generated `allowed-tools` never
pre-approves a connector tool. `resolveAction` uses
`observeConnectorTools(runtime, action)` from `runtime-attestation.mjs`: only
tools the host exposes in the current session and mode qualify, a tool counts as
a reader only when the host marks it `read_only`, and a tool that claims
`source.read` without that mark is treated as a writer. An `unsupported`
capability or action always takes the portable fallback. The approval gate for
tracker writes belongs to the calling skill, not to runtime permission prompts.

Generated `allowed-tools` pre-approves tools; it does not restrict other tools.
A live run confirmed that a connector tool missing from `allowed-tools` can still
run once the host grants it at runtime. It also showed that a host mode which
denies every tool not granted at runtime (a non-interactive "do not ask" mode)
ignores the skill's `allowed-tools` as well: a listed tool was still denied. Do
not rely on `allowed-tools` for availability; resolve each action through the
capability contract and keep the portable fallback reachable.

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
