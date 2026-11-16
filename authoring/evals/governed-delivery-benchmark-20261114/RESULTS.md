# Verification and benchmark results

Baseline: `a71251fc03890326af14afd496d5955cc30ccc20`. Candidate: the frozen, uncommitted working tree. Twelve fresh-agent trials were independently graded against a rubric frozen before dispatch. No improvement or regression was observed on these fixed assertions.

| Metric | Baseline | Candidate |
|---|---:|---:|
| Passed assertions | 36/36 | 36/36 |
| Fully passing cases | 6/6 | 6/6 |
| Unassessable assertions | 0 | 0 |

| Case | Baseline assertions | Candidate assertions |
|---|---:|---:|
| blueprint | 6/6 | 6/6 |
| ticket-refresh | 6/6 | 6/6 |
| adaptive-docs | 6/6 | 6/6 |
| learning | 6/6 | 6/6 |
| readonly-ticket | 6/6 | 6/6 |
| delivery-gaps | 6/6 | 6/6 |

The one-attempt, six-case sample tests execution under explicit requests. It does not measure default behavior under short/ambiguous requests, cross-session reliability, provider cost, latency, or live tracker round trips. Neither the numeric score nor the use of a structured helper establishes general superiority.

## Repository verification

- Repository `node --test` phase: **861/861 passed**, none skipped.
- Focused governed-delivery suite: **85/85 passed** (a subset, not 85 additional tests).
- Deterministic authoring matrix: **10/10 passed**.
- Prerequisite preflight, mirrors, text hygiene, executable references and diff checks passed.
- All 2,351 pre-existing source-file hashes remained unchanged during this task; new work is confined to benchmark evidence/harness files.

Native cleanup was not run because this environment provides overlayfs rather than its admitted trusted native fixture. Full framework golden suites were not run. The complete repository script including its cleanup suffix is not reported as passed.

## Independent NVIDIA audit

SkillEvaluator 0.9.0 keyless Tier 1: **8 passing targets, 1 raw failure (Explore), 1 incomplete scan (Spec)**. Quality scores range from 83.8 to 88.8/100. Every report retains `publication_status: incomplete`.

Explore matches a pre-existing setup-instruction sentence as HIGH P6; the independent contextual assessment is a lexical false positive, without suppressing the raw failure. Spec hits a parser expansion boundary in an unchanged template; its incomplete scan is not counted as passing. Other security matches and metadata-contract mismatches are documented in the independent report.

These scans cover the ten changed generated SKILL.md targets. Shared executable references are not covered by those security scans. NVIDIA Tier 2/3 were not run: optional runtime/provider dependencies, datasets and a verified provider configuration were not ready. This host-agent A/B is separate from NVIDIA Tier 3.

## Evidence and limitations

- [Method, reproduction and exact scope](README.md)
- [Independent repository and NVIDIA report](verification/summary.md)
- [Machine-readable aggregate](iteration-1/benchmark.json)
- [Independent grading A](iteration-1/grades-a.md) and [grading B](iteration-1/grades-b.md)
- [Frozen experiment and source identities](iteration-1/experiment.json); exact public sources are archived under `iteration-1/inputs/`.
- Trial responses, execution captures, changed artifacts, diffs and before/after hashes are under `iteration-1/runs/`.
- A reviewer who saw another review result through a status tool was replaced before primary grading; the disclosure is retained and excluded from verdicts.
- The supplied synthetic PNG has an invalid IDAT CRC. This run proves byte capture and local references within its rubric, not image decoding or usable real UI screenshots.
- Provider model/effort identifiers and token/tool/turn telemetry are unavailable; no savings or speedup is claimed. Captured local logs are not a complete provider event stream.

No commit, push or live Jira/GitHub change was performed.
