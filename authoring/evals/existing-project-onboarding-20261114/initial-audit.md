# Independent onboarding audit: initial candidate

Auditor: `/root/onboarding_independent_audit`, fresh context, read-only source review. Date: 2026-11-14 UTC. Source revision: `a71251fc03890326af14afd496d5955cc30ccc20`, dirty worktree. Exact initial SHA256 values and successful comparison to the supplied manifest are recorded in `target-hashes.json`. The auditor did not read author conclusions or baseline verdicts and made no source changes. Fixtures and reports exist only under this audit directory or temporary directories.

Disposition: **author repair required** for the findings below. This is not a publication or live behavior certification.

## Findings

1. **Medium — Nested host instructions are omitted from instruction discovery.** `_refs/shared/project-instructions.mjs:6` and `:77` constrain `.claude/CLAUDE.md`, `.claude/rules`, and `.cursor/rules` to the repository root. For target `apps/web/src/new.ts`, the independent fixture includes `apps/web/.claude/CLAUDE.md`, `apps/web/.claude/rules/ui.md`, and `apps/web/.cursor/rules/ui.mdc`; none appear in `sources`, and discovery returns `status: discovered` with `findings: []`. The onboarding contract tells the active skill to resolve applicable ancestor and host rules, so this can hide package-specific human instructions without an unknown/incomplete signal. Discover supported host locations at relevant ancestor directories, preserving package/selector scope and excluding siblings. Add a regression for these locations. Evidence: `edge-cases.mjs`, `edge-cases.log`, case `nested-host-rules-and-linked-directory`.

2. **Medium — Symlinked rule subdirectories vanish without a finding.** `_refs/shared/project-instructions.mjs:71` uses `Dirent.isDirectory()` and the `.md/.mdc` filename test to choose entries. A directory symlink such as `.claude/rules/linked-directory` satisfies neither, so `inspect()` never reports `INSTRUCTION_SYMLINK_SKIPPED`. The independent fixture returns no finding despite linked rules. This contradicts `_refs/shared/existing-project-onboarding.md:25` onward, which relies on reported symlinks for explicit host follow-up. Detect symbolic-link entries before the directory/extension branches and report their path without traversing them. Evidence: same independent case above; the linked target contained only synthetic instructions.

3. **Medium — Test's existing startup restriction conflicts with the new scoped startup handoff.** `skills/tracks/test/sdcorejs-test.md:14`–`:16` says the current request must explicitly authorize the exact runtime action. Its new `:59` startup hook loads `_refs/shared/explore-env-setup-actions.md`, which allows necessary reversible startup under already-authorized implementation/test scope and forbids a new permission question merely for that transition. A request to run application E2E tests without spelling out the server command can therefore be blocked by Test's stronger local wording even though the new contract authorizes startup. Reconcile the purpose boundary with the shared session-authority contract while retaining read-only, external-effect, destructive-operation, and unrelated-runtime exclusions. This is a source contract contradiction, not an observed provider-backed agent failure.

## Additional observations

- A missing root rejects `assembleProjectContext()` with `ENOENT`; it never scaffolds an empty project. This is fail-closed, but no structured missing-root context is returned. No false success was observed.
- Candidate-cap and invalid-target cases return `status: discovered` whenever any agent file was found, even when findings require follow-up. The separate `resolution: requires-content-review` and findings prevent a direct policy-resolution claim, but prefer explicit incomplete status for downstream callers that summarize only status.
- Directory breadth is not independently bounded: the 256 limit applies to candidate filenames, and the depth limit is 12; a rule tree of arbitrarily many empty directories/non-Markdown files can still be enumerated. A visited-entry/directory budget would make the bounded-discovery claim reliable.

## Verification

- `node --test test/e2e/existing-project-onboarding.test.mjs`: exit 0, 6 tests passed, 0 failed.
- `node --test test/e2e/project-context-artifact-lifecycle.test.mjs test/e2e/explore-topology.test.mjs test/e2e/test-track-contract.test.mjs test/e2e/mirror-refs-resolution.test.mjs test/e2e/entrypoint-smoke.test.mjs`: exit 0, 82 tests passed, 0 failed.
- `node scripts/sync-skills.mjs --check`: exit 0, all mirrors and manifests synchronized.
- Independent fixture script: exit 0; read-only source preservation verified, initial manifest hashes match, and `.claude/skills`, `plugin/skills`, and `codex/skills` each contain 25 public skills.
- The real HTTP test exercises one local fixture start and reuse based on identity plus readiness. Decision tests cover missing authority, read-only requests, wrong application identity, unknown identity/readiness, and failed readiness. These are executable helper/fixture checks; they do not prove that a live model follows the Markdown startup workflow.

Exact commands, exit codes, timestamps and raw logs: `initial-commands.md`, `initial-command-receipts.json`, and the individual `*.receipt.json`/`*.log` files.

## NVIDIA SkillEvaluator

Installed skill instructions: `/home/agent/.codex/skills/skillevaluator/SKILL.md`; CLI **0.9.0**, Bandit **1.9.4** available. Initial default `health-check --tier 1` exits 1: SkillSpector/Gitleaks auto-provisioning cannot write `/home/agent/.local/share/skillevaluator`; Semgrep is absent from the default environment. A permitted cached-scanner environment retry is recorded separately and will be used for the repaired-candidate audit.

| Target | Quality-only exit / score / grade | Full keyless Tier 1 exit / status | Publication |
|---|---|---|---|
| `.claude/skills/sdcorejs-explore` | 0 / 86.2 / B | 1 / incomplete | incomplete |
| `.claude/skills/sdcorejs-execute-plan` | 0 / 83.8 / B | 1 / incomplete | incomplete |
| `.claude/skills/sdcorejs-test` | 0 / 86.8 / B | 1 / incomplete | incomplete |

For each target the exact commands are `skillevaluator tier1 TARGET --no-llm -r json,markdown -o AUDIT/tier1-NAME` and `skillevaluator quality-check TARGET -r json,markdown -o AUDIT/quality-NAME`; expanded paths are in the receipts. Actual JSON and Markdown reports are in each output directory. `initial-evaluator-summary.json` retains per-validator statuses, scanner counts, errors, warnings and advisory findings.

Coverage: all 13 validators were invoked. Security Scan and Secrets Detection report incomplete with zero files scanned. PII scanned the single SKILL.md. Code Risk, Dependency Audit and Script Lint report passed/not applicable because each selected skill directory contains no code, dependency files, or scripts/tools directories. Shared `_refs` executable helpers therefore were not security-scanned by these skill-directory commands; they were reviewed manually and exercised by Node tests. No HIGH/CRITICAL finding was reported by the checks that ran; that does not clear missing scanner coverage.

Quality advisories concern recommended metadata/headings, skill length, examples and description wording. Harness advisories include description budgets and non-Claude discovery roots; these are not treated as proof that the pack's explicit adapter mirrors are broken. The repository's established source/template contracts remain authoritative; no wording changes were requested solely to raise scores.

## Limits

No Tier 2, LLM rubric/security review, Tier 3, provider calls, credential retrieval, or live baseline-versus-skill evaluation ran. The user deferred key entry. Default static scanner coverage is incomplete, and static quality alone proves neither model behavior nor publication readiness. After repairs, affected tests, mirror checks, target hashes and independent review must be repeated against the new manifest.
