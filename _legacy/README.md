# `_legacy/` — Pre-pivot content

This folder holds content from earlier iterations of `sdcorejs-agent` that was superseded by the current SDLC-agent design. Kept for reference; **not loaded by any agent or tool**. Safe to delete in a future cleanup pass.

## Contents

| Path | What it was | Why it's here |
| --- | --- | --- |
| `agents/` | Handoff notes + early "module orchestrator" placeholders | Replaced by `skills/<track>/` structure |
| `bin/` | Old `sd-agent` CLI (Node.js) | The agent is now skill-driven; no CLI |
| `core/templates/angular-portal-starter/` | Starter Angular portal template | Will be re-incorporated into `skills/angular-portal/07-write-code.md` or its sub-skills when needed |
| `knowledge/repo-memory/` | Early per-repo memory documents | Replaced by the `.sdcorejs/memories/` convention written to target projects |
| `PATTERNS-FINDINGS.md` | Notes from auditing patterns in OneMount portals | Folded into `skills/angular-portal/_refs/sdcorejs-angular/` reference docs |
| `QUICK-REFERENCE.md` | Old quick-reference card | Replaced by `skills/angular-portal/00-onboarding.md` |
| `RELEASE-CHECKLIST.md` | Release checklist for the abandoned npm CLI | No longer applicable |

## When to delete

Safe to remove once:
- The starter template in `core/templates/angular-portal-starter/` has been re-extracted into the relevant `*-init-*` skill bodies.
- Anything referenced from a current skill file is migrated.
