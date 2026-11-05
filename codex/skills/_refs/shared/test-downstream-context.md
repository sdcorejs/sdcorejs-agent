# Test Downstream Context

Load only at the entrypoint trigger below. Preserve the shared session authority policy.

## AI-agent context

When the subject carries `ai_agent_context`, verify its approved hashes,
resolved engine/capability profiles, contract paths, target paths, and
offline/live evidence boundary before authoring cases. Preserve the context in
`test_context`; do not reinterpret profile policy from implementation prose.

Test server-side denial independently from model behavior: untrusted/model
tenant selection, missing permissions, raw tools, stale/unbound approval,
self-approval, cross-tenant session reuse, provider storage without governance,
invented evidence, unsafe trace payloads, and exhausted limits must fail
deterministically. Run offline contract fixtures and deterministic gates
separately from any authorized live behavioral check. Never promote an offline
pass to live engine/model compatibility evidence, and never read ambient
credentials merely to discover whether a live check is possible.

## Simplification context

When `simplify_context` is present, consume its selected files/hunks, diff
scope hash, preserved surfaces, baseline commands, and pass ledger. Keep
pre-simplification and post-simplification command evidence as distinct
append-only runs. Rerun the affected focused commands after every successful
write pass and associate the result with the current diff.

Do not edit expectations, fixtures, snapshots, prompts, strings, or contracts
to legitimize a behavior change. Authored tests without a passing run are not a
green baseline. A simplification write makes prior affected test evidence
stale; only a current post-simplification run can restore it.

## Parallel and downstream handoff

Use one writer for shared runner config, persona catalogs, environment files,
global setup, snapshots, and aggregate reports. Module workers own only their
assigned test paths and must not edit shared config.

Return localized summary plus:

- `test_context`, `test_status`, and `test_evidence`;
- current `convergence_evidence_refs` (never authored, stale, skipped, or invented IDs);
- authored/changed files and coverage matrix gaps;
- exact commands run/skipped, exit codes, cleanup outcome, and blockers;
- `ui_capture_context` when applicable;
- complete `artifact_context` lifecycle identity plus `required_with_change`,
  `shared_owned`, `conditional`, `local_only`, and `unrelated_observed`.

Never claim tests passed from authored files, old reports, or legacy v1
evidence. Do not invoke Git; callers decide review, repair, documentation, ship,
and Git transitions.
