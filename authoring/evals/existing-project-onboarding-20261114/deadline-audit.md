# Independent audit addendum: whole-startup deadline

Date: 2026-11-14 UTC. Auditor: `/root/onboarding_independent_audit`. Source revision: `a71251fc03890326af14afd496d5955cc30ccc20`, dirty worktree. This bounded read-only re-audit covers the new deadline guard, its runtime reference and affected regression suite. No source edits were made.

**No validated source defect remains in this bounded repair.** All 17 inputs match the refreshed `candidate-repair-manifest.json`. The prior `final-findings.md`, `final-source-binding.json`, and `final-target-hashes.json` remain byte-identical; preservation hashes are recorded in `deadline-prior-evidence-hashes.json`. New authoritative input hashes and exact command receipts are in `deadline-addendum.json`.

The changed input hashes are:

| Path | SHA256 |
|---|---|
| `_refs/shared/project-runtime.mjs` | `d2c1a4c19f4ad3b58805dfef038f6a1a13c5acd682a7f19b596919995dec6532` |
| `_refs/shared/explore-env-setup-actions.md` | `01d9510d6c4af5e2b2ed9fe65c15426ff93414d1e070076d5361590de27cc94b` |
| `test/e2e/existing-project-onboarding.test.mjs` | `d79e2a4a0c0f9570eec83dd2b821423ebfc19c97e5519cb845c495dc29483630` |

`decideProjectRuntime` now blocks an otherwise authorized start unless `startup_timeout_ms` is a positive safe integer, and returns that value unchanged for the host. Its position preserves current authorization, read-only, identity, readiness and complete-absence gates. Healthy existing instances can still be reused without a startup budget. The runtime contract requires one absolute deadline recorded before launch, readiness polls bounded by remaining time, and no deadline reset; a per-request HTTP timeout alone is explicitly insufficient.

Independent fixtures reject missing, null, zero, negative, fractional, infinite, NaN, string, boolean, object, array, bigint and unsafe-integer values. They confirm positive safe integers reach the host, valid budgets cannot bypass the other gates, and an audit-owned real HTTP server that repeatedly reports unready exhausts one fixed startup budget. This tests helper behavior and an illustrative host loop; it does not prove live-model enforcement of the workflow.

Commands ran from `/workspace/sdcorejs-agent`, with exact stdout/stderr and timestamps in the named logs and receipts:

- `node --test test/e2e/existing-project-onboarding.test.mjs` — **exit 0; 8 passed**, `deadline-onboarding-tests.log`.
- `node --test /workspace/work/existing-repo-onboarding-20261114/audit/deadline-fixtures.mjs` — **exit 0; 4 passed**, `deadline-fixtures.log`.
- `node scripts/sync-skills.mjs --check` — **exit 0**, `deadline-mirrors.log`; generated mirrors remain synchronized with 25 public skills.

The three NVIDIA SKILL.md target hashes and complete single-file target inventories are unchanged. Their exact prior reports are reused, with no evaluator/provider rerun. Raw Tier 1 results remain: Explore exit 1 / failed / publication fail (reviewed P6 false positive); Execute exit 0 / passed / publication incomplete (reviewed EA2 negation false positive); Test exit 1 / failed / publication incomplete with a SkillSpector parsing gap. Quality scores remain 86.2, 83.8 and 86.8. The detailed triage in `final-findings.md` remains applicable.

The changed shared helper/reference are outside the retained single-skill scanner targets; this addendum supplies manual review and executable evidence for them, not new scanner coverage. The helper does not own a clock or process and cannot independently enforce the host's deadline. Tier 2, Tier 3, provider-backed baseline/with-skill evaluation and publication certification remain **NOT RUN**. Do not describe the aggregate static security gate as passed.
