# Skill description trigger-eval sets

Trigger-eval sets for the `anthropic-skills:skill-creator` **description optimizer**
(`scripts/run_loop.py`). Each file holds ~20 realistic queries split into
should-trigger (real requests the skill must catch) and near-miss
should-NOT-trigger (queries that share keywords but belong to a sibling skill).

| File | Skill | Coverage |
| --- | --- | --- |
| `angular-portal-write-code-trigger-eval.json` | `angular-portal-write-code` | CRUD / module / entity / screen / actions vs. design-phase, review, nestjs, nextjs |
| `nextjs-build-website-write-code-trigger-eval.json` | `nextjs-build-website-write-code` | init / seo / og / i18n / caching / responsive / contact-form vs. audit-existing-site, review, angular |
| `sdcorejs-auto-summary-trigger-eval.json` | `sdcorejs-auto-summary` | project overview vs. auto-docs (session deltas), recovery, code-map |

## Running the optimizer

```bash
SC=<path-to>/skills/skill-creator
cd "$SC"
PYTHONUTF8=1 python -m scripts.run_loop \
  --eval-set <repo>/docs/skill-eval-sets/<skill>-trigger-eval.json \
  --skill-path <repo>/.claude/skills/<skill> \
  --model claude-opus-4-8 \
  --max-iterations 5 --runs-per-query 3 --holdout 0.4 \
  --results-dir ./runs --verbose
```

`PYTHONUTF8=1` is required — the eval queries contain Vietnamese diacritics and the
script reads them with the platform default encoding otherwise.

The loop evaluates the current description, then proposes improvements, keeping the
best by **held-out test** score. Take `best_description` from the JSON output and
paste it into the skill's **source** file (`skills/tracks/.../07-write-code.md` etc.,
NOT `.claude/skills/` — that mirror is generated), then `bash .claude/sync-skills.sh`.

## ⚠️ Platform note

`scripts/run_eval.py` is **POSIX-only**: it launches `claude` via `subprocess.Popen`
(fails on Windows where `claude` is a `.cmd`/`.ps1` shim → `WinError 2`) and reads the
stream with `select.select()` on a pipe (sockets-only on Windows). Run the optimizer
on macOS/Linux/WSL. On Windows these sets are still valid inputs — only the automated
scorer can't execute locally.
