# Existing-repository onboarding baseline

Assessment kind: fresh independent source/contract scenario review. This is not live target execution, a provider-backed experiment, or an NVIDIA evaluator result. No project service was started, stopped, probed, or modified. No target-project fixture was executed. Only assessment files below this baseline directory were written.

Baseline requested sources were captured at 2026-11-14T10:14:24Z from `/workspace/sdcorejs-agent`, revision `a71251fc03890326af14afd496d5955cc30ccc20`. The exact working-tree bytes, rather than revision alone, define this baseline. SHA-256 values and supplementary reference capture times are in `source-manifest.json`; copies are under `sources/`. Source citations below resolve within that snapshot.

## Overall finding

The current pack already protects read-only exploration, human instruction text, and the distinction between inferred and accepted conventions. It has partial instruction-scope guidance and session authorization reuse. It does not yet provide a complete existing-repository instruction discovery contract or an operational local-runtime onboarding flow. Explicitly requesting a service removes a prohibition, but the inspected Explore contract does not direct the agent to detect project-owned running state, notify the user of that state, start an absent runtime, and verify application readiness.

## Six scenarios

| Scenario | Baseline assessment | What the current skill directs an agent to do |
|---|---|---|
| 1. Legacy monorepo with root/nested AGENTS, CLAUDE, Copilot, Cursor instructions and conflicts | PARTIAL | Prioritize repository instructions, apply effective nested scope before a change, and inspect root/nested conflicts before an authorized AGENTS projection. Load relevant convention categories and resolve module/repository scope. It does not specify a normal onboarding inventory of all four instruction families, their path/glob applicability, bodies, or same-scope conflict handling. |
| 2. No rule files: infer missing rules without silently making them accepted or overwriting human docs | PARTIAL, with strong existing safety boundaries | Continue targeted current-source/config reads rather than block on missing context. Existing-code observations remain advisory `observed`; competing values become `conflicted`; authoritative config or explicit approved decisions may be accepted. Read-only preflight writes nothing. Missing bootstrap is disabled, and authorized AGENTS projection changes only the managed block. The normal missing-instruction path does not explicitly assemble an evidence-backed inferred rule set; inference behavior is principally specified for convention capture. |
| 3. Read-only request: “understand this repository” | SUPPORTED for the requested read-only boundary | Select `summary-read`, use valid summary sections or targeted reads, and map only when needed. Do not create summary, rules, env, source, artifacts, or runtime state. Do not start services absent an explicit request. Missing/stale summary is neither write authority nor a blocker. Runtime inspection/notification is not mandatory, but the exploratory task remains read-only. |
| 4. Explicit request: “run the project”; no app runtime exists | GAP | Inspect README/manifests/lockfiles/scripts, detect the actual package manager, and output setup instructions. An explicit request satisfies the service-start prohibition's exception. However, neither the action table nor env action reference provides a start-and-verify action, required startup execution, absent-runtime notification, readiness evidence, or final running-state output. A command-only explanation is not ruled out by the current operational contract. |
| 5. An unrelated process occupies the configured app port | GAP | The inspected contract gives no procedure for attributing a listener to the target project, proving an existing process serves the expected app, avoiding duplicate starts, handling a port conflict, or prohibiting killing an unrelated listener. It does not instruct killing anything; the gap is missing operational ownership guidance. An open port alone cannot be treated as verified target readiness from these sources. |
| 6. Implementation needs E2E and startup was already authorized in the session | PARTIAL for authorization; GAP for operational execution | Carry existing action/scope decisions across skill changes without re-asking. Session authority also says execute necessary scoped verification and reuse authorized tests. Explore routes direct test work to `sdcorejs-test`. The local-runtime section is focused on consented conversation-local/Visual Companion state and says read-only contexts remain read-only. No application-runtime status/start contract ties existing startup authority to E2E prerequisite detection, reuse of an existing owned server, actual startup, or readiness verification. The sources do not require a fresh permission request for the same already-authorized action. |

## Evidence

### Instruction discovery and preservation

- `_refs/shared/project-context.md:59-79` orders current user request, repository instructions “such as AGENTS.md,” explicit evidence, then summaries and targeted reads. It names no complete instruction-file discovery sequence.
- `_refs/shared/project-context.md:317-323` says apply effective nested instruction scope before changes; this is a compact bootstrap-visibility note.
- `_refs/shared/project-bootstrap.md:32-35` requires reading effective root/nested instructions, reporting conflicts, and passing inspected `instruction_conflicts` to the bootstrap planner.
- `_refs/shared/project-bootstrap.md:3-11` disables absent bootstrap, separates engineering decisions from AGENTS projection, preserves human instructions, and rejects missing instructions as permission for boilerplate generation.
- `_refs/shared/project-bootstrap.md:37-56` constrains persistence to the exact managed block, with original bytes, expected hash, newline/BOM preservation, and refusal on unsafe paths or writers.
- `_refs/shared/project-context.mjs:69-70,333-340` recognizes root AGENTS/CLAUDE, Copilot, and Cursor paths as adapter entrypoint fingerprints. This records path/existence evidence; it is not instruction-body loading or scoped rule resolution.
- `_refs/shared/project-context.mjs:72-150` assembles summary, fingerprints, graph strategy, related artifacts, Git evidence, and convention projection. Its returned context has no discovered instruction inventory or applied/conflicted instruction projection.

### Missing rules and inferred conventions

- `_refs/shared/convention-context.md:201-232` makes observed rules advisory, conflicted/stale rules unenforceable, and code-observed/imported legacy conventions ineligible for automatic acceptance. Inference uses independent-evidence and dominance thresholds.
- `_refs/shared/convention-context.md:299-327` defines convention precedence, module-local refinement, and same-level accepted conflict exclusion; generic engineering recommendations are weakest.
- `_refs/shared/convention-context.md:430-478` keeps convention reading read-only; persistence is separately authorized, preserves historical exceptions, records inference as observed, and revalidates final current source.
- `_refs/shared/project-context.mjs:165-173` returns missing policy state when the convention root is absent. It does not infer rules at this point.
- `skills/shared/workflow/explore.md:334-347` prohibits invented scripts/conventions and treating missing summary as write authority.

### Read-only and runtime behavior

- `skills/shared/workflow/explore.md:57-87` classifies actions. `summary-read` is the orientation action. Env actions are read-only setup explanation or approved placeholder-file creation; there is no runtime start action.
- `_refs/shared/explore-contract.mjs:11-31,73-91` allowlists read-only and authorized-write actions; unknown actions default to read-only. No runtime-start action or resolver exists in this file.
- `skills/shared/workflow/explore.md:235-248` requires real package-manager/script evidence, forbids assumed commands, and permits service startup only when explicitly requested. It requires command-run versus skipped reporting, not readiness verification.
- `_refs/shared/explore-env-setup-actions.md:5-16` says default setup outputs instructions/key names, forbids starting services unless explicitly requested, and limits approved env writes to missing placeholder files.
- `_refs/shared/project-context.md:236-247,298-315` makes context assembly read-only; local runtime state has a separate purpose-bound consent boundary and same-scope handoff reuse.
- `skills/shared/workflow/explore.md:361-368` explicitly says carry existing session decisions without re-asking while not widening them to other actions.
- `_refs/shared/session-authority.md:8-16,33-42` carries actual action/scope decisions across phases, reuses authorized tests/review choices, and requires necessary scoped verification. This supports authorization continuity; it does not supply application-start mechanics.
- `AGENTS.md:7-9` routes workflow transitions through the shared session-authority contract. Runtime authorization must therefore be assessed with that shared rule, rather than claiming the pack invariably demands repeat approval.

## Method and limits

The reviewer read the requested skill/references, the repository AGENTS and authoring prerequisites, the helper implementations, and supporting session-authority/router guidance. Read-only shell operations listed and read the specific files; `git rev-parse HEAD` recorded the revision; SHA-256 hashes bound source bytes. Commands completed successfully. No source files were edited, no provider API or network calls were made, no secrets or `.env` values were read, and no installation or runtime command was attempted.

The six outcomes above are contract adequacy judgments grounded in the frozen sources. They are not measured probabilities of agent behavior and do not prove how a particular live agent would respond. No standalone helper test suite, NVIDIA audit, or end-to-end project runtime was run. Authoring prerequisites permit read-only diagnosis while implementation prerequisites are unresolved; this baseline did not implement changes or claim that prerequisite gate passed.
