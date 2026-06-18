---
name: sdcorejs-comment-code
description: Apply code comments at finish-gate chosen level or ask level when invoked directly. Use after review/repair-loop in code-gen tail, or on add/comment code requests. Loads comment-code tail rules for skip/simple/medium/full and records chosen level in auto-docs. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Edit, Write, Bash
---

# Comment Code


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Apply comments deliberately without bloating source files. This skill owns the dispatch
and user-choice flow; the actual level rules live in
`_refs/orchestration/tail/comment-code.md`.

## Invocation modes

### Tail mode
When called from a track executor after the finish gate:
1. Use the comment level already captured by `_refs/shared/finish-gate.md`.
2. Do not ask again.
3. If the level is `skip`, make no edits and report that comments were skipped.
4. Otherwise load `_refs/orchestration/tail/comment-code.md` and apply the matching level.

### Direct mode
When the user explicitly asks to add/comment code and no finish-gate choice exists:
1. Identify the file scope from the user's request, current diff, or generated files.
2. If the scope is ambiguous, ask for the target files/modules.
3. Ask for the comment level using the prompt below.
4. Load `_refs/orchestration/tail/comment-code.md` and apply the chosen level.

Prompt, localized at runtime:

```text
Which comment level do you want?

1. skip   - add no comments
2. simple - short JSDoc on public methods; // why only where non-obvious
3. medium - JSDoc on public + complex private members; // why on tricky logic
4. full   - full JSDoc + optional WHY doc for larger modules

Suggested default: simple.
```

Wait for the user's pick. If the user says "you decide" or equivalent, use `simple`
and say that default was chosen.

## Workflow
1. Resolve `level` as `skip`, `simple`, `medium`, or `full`.
2. Resolve `track` as angular, nestjs, nextjs, or general TypeScript.
3. Resolve the file scope. Prefer files touched in the current code-gen task; for direct mode, use the user's explicit paths or the current git diff.
4. If `level=skip`, stop with a short report and hand off to `sdcorejs-ship (verify-before-done mode)` when in tail mode.
5. Read `_refs/orchestration/tail/comment-code.md`.
6. Apply only the matching level's rules. Preserve existing hand-written comments unless they are stale or contradicted by the code.
7. Run `npm run lint` when a package script exists; otherwise skip lint and report why.
8. Report files changed and counts by category: JSDoc, `// why`, companion docs.

## Rules
- Comments explain why, not what.
- Runtime-localize generated comments; keep identifiers, imports, route paths, and permission codes in English.
- Preserve UTF-8 and Vietnamese marks; mojibake in comments is a blocking defect.
- Do not comment out dead code. Delete it instead.
- Do not create TODO comments without an owner or concrete condition.
- Do not write companion WHY docs unless the `full` ruleset calls for it and the user confirms.

## Cross-references
- `_refs/shared/finish-gate.md` - captures the comment level in normal write-code flows
- `_refs/orchestration/tail/comment-code.md` - level rulesets
- `_refs/orchestration/tail/auto-docs.md` - records the chosen level and comment counts
- `sdcorejs-ship (verify-before-done mode)` - runs after this skill in the tail chain
