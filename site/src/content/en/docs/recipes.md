---
slug: recipes
title: Recipes for practical work
description: Each recipe connects a goal to inputs, skills, artifacts and verification steps you can assess.
kicker: From requirements to application
---

## Choose a recipe

| Goal | Recipe | Conditions |
| --- | --- | --- |
| Add a feature with UI and backend | [Product management](/docs/recipes/feature/) | Repository, PRD, API/permissions and test environment |
| Improve an existing screen | [UI improvement](/docs/recipes/ui/) | Source/screenshots, tokens, components and current behavior |
| Fix a reproducible bug | [Debug & regression](/docs/recipes/debug/) | Reproduction, expected/actual behavior and failing evidence |
| Build an AI-agent application | [AI-agent contracts](/docs/recipes/ai-agent/) | Owner repository, engine/capability and trust/tool/approval policy |

## How to use the recipes

The prompts and AC in these recipes are **illustrative examples**, not logs of successful agent execution. Replace the domain and constraints with your project data. Discover commands from the actual package scripts/test runner; do not copy a verification command into a repository that does not provide it.

At each step, inspect the artifact or evidence before continuing. Resolve conflicting sources by confirming the authoritative behavior source. If a backend, permissions or owner are missing, report the blocker rather than fabricating data to conceal the gap.

## Prepare a useful brief

```text
Goal and actor:
Required behavior / non-goals:
Repository and ownership area:
Sources: PRD, screenshots/UI, API, logs or diff:
Constraints to preserve:
Available verification:
Outputs to review:
```

A brief need not be long. It should help the agent find evidence, boundaries and the right verification steps. Read [choose a workflow](/docs/workflows/) when you only need an answer, an audit or a small fix.
