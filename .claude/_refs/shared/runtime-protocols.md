# Runtime Protocol Router

Load only the references required by the selected task:

- Non-trivial execution progress: `_refs/shared/tasklist.md`. Keep live state in
  the runtime; never create a mutable session checkpoint.
- Response profiles, user projections, runtime-context handoffs, or related
  artifact selection: `_refs/harness/communication-economy.md`. Keep full typed
  context for its consumer, default user output to compact professional prose,
  and expand automatically for approval, security, destructive action,
  ambiguity, conflict, blockers, or failed verification.
- Project evidence: `_refs/shared/project-context.md`. Prefer explicit/current
  evidence, valid summary sections, then targeted reads.
- Project persona: `_refs/shared/persona.md` only when one exists and is
  relevant.
- Real user decisions and approvals:
  `_refs/shared/user-choice-prompt.md`.
- Any `.sdcorejs/**` write, verification, staging, commit, or push:
  `_refs/shared/artifact-lifecycle.md`; propagate `artifact_context`.
- Delegation after runtime capability checks:
  `_refs/harness/delegation-policy.json` and `_refs/harness/task-brief.md`.
- Visual/spatial decision after the user accepts:
  `_refs/sdlc/visual-companion.md`.

Current user instructions, files, diffs, logs, failing tests, and current
command output override stored context. Match the user's language at runtime;
keep reusable sources, identifiers, paths, and contract keys in English.
