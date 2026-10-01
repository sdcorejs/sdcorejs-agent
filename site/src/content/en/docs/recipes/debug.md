---
slug: recipes/debug
title: Diagnose & fix a bug
description: Turn expected/actual behavior and failing evidence into a fix with regression checks; keep root-cause work separate from guessed small fixes.
section: Recipes / Debug
kicker: Recipe · Debug
---

## Situation and inputs

For example, a Product filter sends the wrong value, or a test fails after a change. Provide reproducible steps, expected/actual behavior, redacted logs, the failing command, environment and revision/diff. The prompt below is an example, not evidence of a successful repair.

## 1. Collect evidence

```text
Use sdcorejs-debug for the Product status-filter bug.
Expected: values follow the attached API contract.
Actual: the request differs from the contract; logs and reproduction are attached.
Find the root cause before proposing a fix. Preserve public API and permissions.
```

Explore can support read-only flow tracing. Debug verifies the reproducer, locates the failure and tests hypotheses. If reproduction fails, state the result and missing data; do not claim a root cause has been found.

## 2. Establish authority for the fix

A fix within approved scope can proceed under the current boundary. If the root cause requires API, dependency, architecture or ownership changes, return to the appropriate scope/spec/plan. Review findings need Repair Loop to validate feedback and authority; do not assume every comment is an accurate repair requirement.

## 3. Rerun checks

When reproduction conditions allow, a test should fail for the original failure mode before the fix and pass afterward. Run the target repository’s focused command; recheck affected integration/behavior. A new test that simply mirrors the implementation does not establish regression control.

For flaky tests, retain evidence from multiple runs and investigate concurrency, timing and the environment. Do not change expectations or delete tests to make the suite green.

## 4. Report the result

State the evidence-backed cause, changed paths, commands/cases and actual results, plus remaining review/repair findings. Distinguish "not reproduced", "fixed in this environment" and "live behavior not run".

Sources: [Debug skill](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/shared/workflow/debug.md), [Repair Loop](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/skills/orchestration/repair-loop.md).
