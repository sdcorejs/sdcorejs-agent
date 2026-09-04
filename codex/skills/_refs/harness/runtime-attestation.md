# Runtime Capability Attestation

Use this contract immediately before delegated execution. Adapter capability
manifests are portable defaults; they are not proof that a capability is exposed
in the current session.

## Observation contract

Call `attestRuntimeCapabilities` from
`_refs/harness/runtime-attestation.mjs` with:

- an adapter identity;
- tri-state adapter defaults from `capability-contract.json`;
- current-session observations keyed by semantic capability;
- an integer `max_concurrency` only when concurrent dispatch was observed.

Each observation requires `status` and evidence with a stable source category
plus a concise detail. Do not include credentials, raw prompts, or large logs.
No static `supported` default enables execution: every supported observable
capability needs current-session evidence, including either direct workspace
evidence or the evidence-backed native/manual derivation.
The supported evidence categories are runtime tool inventory, an isolated
runtime probe, verified workspace state, and an immutable result reference.
Use these category names as descriptive text; the contract does not trust a
category without its current observation.

The observable capabilities are:

- `subagents`
- `concurrent_dispatch`
- `agent_cwd_binding`
- `native_worktree`
- `manual_git_worktree`
- `cancellation`
- `result_ref`
- derived `workspace_isolation`

`workspace_isolation` is supported when native isolation is observed, or when
both manual Git worktree support and worker-CWD binding are observed. Unknown
inputs remain unknown. Concurrent dispatch requires supported delegation and an
effective maximum concurrency of at least two.

## Execution projection

Pass the validated attestation through `toParallelRuntimeCapabilities` before
classification or compilation. Unknown values project to missing booleans so
the existing parallel protocol fails closed. Never replace them with `true`
because a different session or adapter exposed the feature previously.

Record the attestation and opportunity report in the active harness context.
They are runtime evidence, not mutable `.sdcorejs/**` checkpoint files.
