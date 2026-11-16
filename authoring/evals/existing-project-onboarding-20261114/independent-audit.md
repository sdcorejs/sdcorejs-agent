# Independent onboarding re-audit: repaired candidate

Date: 2026-11-14 UTC. Auditor: `/root/onboarding_independent_audit`. Revision: `a71251fc03890326af14afd496d5955cc30ccc20`, dirty worktree. The exact final 17 input SHA256 values match `candidate-repair-manifest.json`; see `final-source-binding.json` and `final-target-hashes.json`. Initial evidence is retained separately in `initial-findings.md`, `initial-target-hashes.json`, `initial-evaluator-summary.json`, and the initial reports.

**No remaining validated source defect was found in the reviewed onboarding scope. All three initial medium findings are repaired. Automated security clearance remains incomplete/failed as detailed below; this audit does not certify publication or live agent behavior.**

The auditor changed no repository source. The author owns all repairs. This review used actual source/tests and independent fixtures, without reading the author's baseline verdict or conclusions.

## Repair verification

| Initial finding or follow-up | Independent result |
|---|---|
| Nested host rules omitted | Fixed. `apps/web/.claude/CLAUDE.md`, nested Claude rules and Cursor rules are discovered for `apps/web/src/new.ts`; sibling API rules remain excluded. `base_scope` is `apps/web`, and host/selector review remains required. |
| Symlinked rule directory omitted silently | Fixed. The path is reported as `INSTRUCTION_SYMLINK_SKIPPED`, its contents are not traversed, and the result is incomplete. |
| Test required a redundant exact startup approval | Fixed. Test and its mandatory command-discovery ref consistently carry existing scoped implementation/test authority for necessary local preparation/startup. Read-only actions still acquire no startup/install authority, and uncovered effects remain blockers. |
| Missing/non-directory root | Explicit `INSTRUCTION_ROOT_UNAVAILABLE` and incomplete discovery, including through project-context. No scaffolding or false success. |
| Entry/candidate bounds and incomplete status | The independent 1,100-entry fixture reaches the 1,024-entry budget and reports truncation. Candidate cap, invalid target and oversized file cases remain explicitly incomplete even with a valid root AGENTS file. |
| Runtime absence inferred from partial probes | Startup requires fresh `not-running` plus `coverage: complete`. Missing/partial/unknown coverage returns inspect/unknown. Healthy reuse requires matching identity and passed readiness. |
| Caller context enum and install guard | Both runtime actions appear in the context mode contract. The final install wording preserves scoped authority and actual-effect checks; the existing Test contract suite passes. |

Manual source review confirms the workflow retains: applicable instruction-content review, explicit rule/conflict resolution, human text preservation, no inference promotion into accepted policy, managed-block-only AGENTS projection, no startup during read-only orientation, no blind default command/port, no duplicate runner-managed server, no killing an unowned service, finite startup/readiness evidence, and no durable runtime status as project truth. The helpers remain observation/decision projections; the host must perform the verified commands and supply honest evidence.

## Executable checks

- Final onboarding plus independent fixtures: **15 passed, 0 failed**, exit 0 (`final-onboarding-tests.log`): 8 repository cases and 7 independent cases.
- Compatibility selection: **82 passed, 0 failed**, exit 0 (`final-compatibility.log`), covering project context/lifecycle, topology, Test, reference resolution and entrypoints.
- After the final command-discovery wording change, affected onboarding/Test checks: **48 passed, 0 failed**, exit 0 (`final-affected-tests.log`); independent fixtures/hash binding: **7 passed**, exit 0 (`final-rebind.log`). These are overlapping runs, not additive unique coverage.
- Final `node scripts/sync-skills.mjs --check`: exit 0 (`final-mirror-recheck.log`). All generated mirrors/manifests are synchronized. `.claude/skills`, `plugin/skills`, and `codex/skills` each retain exactly **25 public skills**.

The fixture test includes a real local HTTP readiness/reuse flow. The independent decision cases reject read-only startup, partial absence evidence and unrelated application identity. No live model A/B claim is made from these tests.

All exact commands, arguments, cwd, exits, timestamps and raw output paths are recorded in `all-commands.md`, `all-command-receipts.json`, and individual receipts. No test result was inferred from a source assertion or an author verdict.

## NVIDIA evaluator results and triage

Read and applied `/home/agent/.codex/skills/skillevaluator/SKILL.md`. Evaluator CLI **0.9.0**. The default health check initially failed because its managed cache was read-only. Reusing the already-installed scanner environment in `scanner-environment.json` gave `skillevaluator health-check --tier 1` **exit 0** with **SkillSpector 2.13.4**, **Bandit 1.9.4**, **Semgrep 1.185.0**, and **Gitleaks 8.30.0**. No provider calls or credential retrieval occurred.

Every final Tier 1 command explicitly uses `--no-llm`, requests JSON and Markdown reports, and has no skipped check flag. Exact output directories are under this audit directory.

| Target | Keyless Tier 1 exit / overall_status | publication_status | Quality-only exit / score / grade |
|---|---|---|---|
| `.claude/skills/sdcorejs-explore` | 1 / `failed` | `fail` | 0 / 86.2 / B |
| `.claude/skills/sdcorejs-execute-plan` | 0 / `passed` | `incomplete` | 0 / 83.8 / B |
| `.claude/skills/sdcorejs-test` | 1 / `failed`, `incomplete_scans: ["skillspector"]` | `incomplete` | 0 / 86.8 / B |

Raw reports: `final-tier1-{explore,execute,test}/skillevaluator-tier1.{json,md}` and `final-quality-{explore,execute,test}/skillevaluator-quality.{json,md}` (actual Markdown extension is listed in the directories). `final-evaluator-summary.json` retains exact per-validator fields and findings. Quality-only reports all say `publication_status: incomplete`.

Scanner finding review:

1. **Raw HIGH, reviewed false positive — Explore P6 “System Prompt Leakage: output instructions.”** Report file `SKILL.md:77`, finding `SEF-7e837c8159b040113c90`. The actual line is the `env-setup-readonly` table row: “Read README/config/examples and output instructions. No env/config writes.” It instructs the agent to explain local setup, not reveal hidden/system instructions. No prompt-extraction instruction was found in the surrounding contract. The raw failure is retained; no suppression or source rewording was used to manufacture a pass.
2. **Raw MEDIUM, reviewed false positive — Execute EA2 “Excessive Agency: without approval.”** Report `SKILL.md:468`, finding `SEF-55bbc1f1b2ab31ddd68e`. The actual sentence prohibits mixing package managers, inventing scripts, unapproved installs, and `npx --yes` without approval. Its negation was misclassified as permission. The surrounding plan/write gates remain in place. This is advisory in the raw exit-0 report.
3. **Raw HIGH and incomplete analysis — Test AE1 `static_parse_limit (static_patterns_tool_misuse)`.** Report `SKILL.md:9`, finding `SEF-2ef897139a6706c66ecf`, plus a reference-resolution note at line 129. The cited line is the generated adapter's relative-reference guidance. The report states that a security-relevant expression could not be fully resolved by its bounded parser; it does not identify malicious execution. This remains an **unresolved scanner coverage limitation**, not a validated source vulnerability and not a passed security check. The actual shared module-E2E reference exists; the mirror-reference suite resolves it in the pack layout.

All 13 Tier 1 validators were invoked for each selected target. Gitleaks reports no secrets. PII scanned each single SKILL.md. Code Risk, Dependency Audit and Script Lint report passed/not applicable because the selected skill directories contain no code/dependency manifests/scripts directory; the source helpers under shared `_refs` are outside these scanner targets. SkillSpector's reported missing external references are retained: standalone skill scans do not inspect the complete pack reference graph. Manual review and Node tests cover the changed helpers, but do not convert their absent scanner coverage into a security pass.

Quality advisories about metadata, headings, descriptions and length remain advisory under the repository's established templates. No source change was requested solely to improve quality scores. Harness advisories about other hosts reading different installation roots do not establish adapter failure; actual repository mirror checks and reference-resolution tests pass.

## Limits and disposition

Source repair verification is complete for the final hashes. The remaining automatic gate issue is scanner false-positive/parser handling and standalone scan coverage, not a newly confirmed source defect. Do not describe all Tier 1 checks as passed. Any future scanner correction/waiver must preserve the raw evidence and be reviewed separately.

Tier 2, LLM rubric/security review, Tier 3, provider-backed live baseline-versus-skill trials, and publication certification are **NOT RUN**. The user deferred provider key entry. Static quality, current source review, and helper/fixture behavior are distinct evidence classes; none proves live model adoption of the workflow. This audit is not a full-repository security audit and does not certify unrelated pre-existing dirty changes. Any future edit to a bound input requires affected checks and independent reassessment.
