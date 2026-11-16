# NVIDIA Tier 2 and Tier 3 readiness audit

**INCOMPLETE.** Tier 2 is blocked by missing exported provider configuration. One real Tier 2 command was attempted; the remaining nine targets are **NOT RUN**. Tier 3 readiness was checked, but no live Tier 3 trial was attempted.

This file is an independent audit receipt, not an official NVIDIA evaluation report. No target score, duplicate finding, live Skill Lift, or publication verdict is available.

Evaluator: NVIDIA SkillEvaluator **0.9.0**, pinned source commit `f5bf6c1f3666699fd145612a2e9162e9721db3f9`. Target repository HEAD: `a71251fc03890326af14afd496d5955cc30ccc20`. The exact target content hashes and all 775 conservatively bound dependencies were unchanged before/after this audit. Evaluator source files match the pinned checkout; its scoped diff is empty.

## Readiness

| Official command | Exit | Observed result |
| --- | ---: | --- |
| `doctor --tier 2` | 1 | Embedding provider and LLM provider: `No provider is configured.` |
| `doctor --tier 3 --env-mode docker -a codex` | 1 | Public LLM provider missing; Harbor agents `codex` pass; Docker prerequisite `ready` passes. |
| `doctor --tier 3 --env-mode local -a codex` | 1 | Public LLM provider missing; Bubblewrap smoke test fails: `bwrap: setting up uid map: Read-only file system`. |

The local sandbox requirement was not disabled. Docker readiness is useful setup evidence, but does not establish agent-model readiness or a successful live run.

## Tier 2 target coverage

| Target | State | Attempted | Exit | SKILL.md SHA-256 |
| --- | --- | --- | ---: | --- |
| `sdcorejs-architecture` | BLOCKED | yes | 1 | `b8a46deaa9df56634a59939812396c9642e0d0ce33dfff39f1d67c62dbdd536d` |
| `sdcorejs-brainstorming` | NOT RUN | no | — | `2c3fcf83ec87f90b810cafd07774700c816bc640e551d9942b91ecd9385127d1` |
| `sdcorejs-documentation` | NOT RUN | no | — | `ad2824823b67148d7e4402b3d61b737d5958ca768e6e46b6fef996ea8614f715` |
| `sdcorejs-execute-plan` | NOT RUN | no | — | `bbc23c37a311e9454f4d1f856f1a29d82d9b3fd6a2fad6fbda38b6204a8c4497` |
| `sdcorejs-explore` | NOT RUN | no | — | `0c1cb4bae337f2d567e4ef4d93754c977fe1ecff704bd69ff48a9d748746af09` |
| `sdcorejs-plan` | NOT RUN | no | — | `cd838ae9e289efbebe2d2784a1360487445d3a3b7e82ab6e41f6539ac33e00d4` |
| `sdcorejs-product` | NOT RUN | no | — | `44ce4dc5a652c344ae3f33c686d1bf0767bd8ca9b1ec527138ea26c867672d2e` |
| `sdcorejs-ship` | NOT RUN | no | — | `32fea584b9e51e96c3a47334db25a9acea091b8d6038f1a7ad48203b11a926e4` |
| `sdcorejs-spec` | NOT RUN | no | — | `aefc28a7c6968d76e45637266687af9fbafe581105550bb0b74948ae2a53ea75` |
| `sdcorejs-test` | NOT RUN | no | — | `f41979ac7c84a4374b4519b289f2561b7ca70da7d8f920c86b11ee21e4361fd6` |

The attempted command requested JSON and Markdown reports and exited 1 with `Error: No provider is configured.` No official report files were created. NVIDIA resolves embedding and LLM providers in `src/skillevaluator/tier_workflows.py:140` before content deduplication, and the same environment-wide blocker applies to the remaining targets. They were not represented as failed attempts or passes.

## Commands and evidence

Every command below ran from the audit-owned `cwd/` directory. Exact argv, cwd, safe environment overrides, timestamps, exit codes and stdout/stderr hashes are preserved in [commands.jsonl](commands.jsonl). Raw outputs are in [raw/](raw/).

- Exit **0**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator tier2 --help`
- Exit **0**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator --version`
- Exit **1**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator doctor --tier 2`
- Exit **1**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator doctor --tier 3 --env-mode local -a codex`
- Exit **1**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator doctor --tier 3 --env-mode docker -a codex`
- Exit **0**: `python3 /workspace/work/sdcorejs-nvidia-remaining-20261114/audit/snapshot_inputs.py before`
- Exit **1**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/skillevaluator tier2 /workspace/sdcorejs-agent/.claude/skills/sdcorejs-architecture -r json,markdown -o /workspace/work/sdcorejs-nvidia-remaining-20261114/audit/reports/tier2-sdcorejs-architecture`
- Exit **0**: `python3 /workspace/work/sdcorejs-nvidia-remaining-20261114/audit/snapshot_inputs.py after`
- Exit **0**: `/workspace/work/sdcorejs-nvidia-remaining-20261114/runtime/venv/bin/python /workspace/work/sdcorejs-nvidia-remaining-20261114/audit/runtime_diagnostics.py`

Input manifests: [before](input-hashes-before.json) and [after](input-hashes-after.json). Machine-readable receipt: [summary.json](summary.json). Runtime provenance: [runtime-diagnostics.stdout.txt](raw/runtime-diagnostics.stdout.txt). No generated official reports exist under `reports/`.

## Blockers and limits

Configure a legitimate provider in the exported host environment to continue. Tier 2 needs both embeddings and chat/LLM access. Tier 3 additionally needs a compatible agent/model configuration and reviewed datasets. This audit did not retrieve ambient credentials, inspect authfiles or `.env` files, fabricate provider responses, weaken the local sandbox, or modify evaluator or repository sources.

Tier 1, inter-skill catalog comparison, dataset generation/validation, live baseline/with-skill trials, model verification and publication readiness were not evaluated by this assignment. Missing scores remain null/NO SCORE.
