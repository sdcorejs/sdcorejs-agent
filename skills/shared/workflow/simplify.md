---
name: sdcorejs-simplify
description: >-
  Behavior-preserving code simplification utility for recently changed or
  explicitly scoped executable source code. Use to improve clarity,
  consistency, and maintainability after a green baseline without changing
  observable behavior, public contracts, strings, prompts, configuration, or
  protected framework boundaries. Broad refactors return to planning; bugs,
  findings, tests, documentation, and performance work retain their dedicated
  owners. Runtime-localized.
required-actions: artifact.read, artifact.write, verification.run, progress.create, progress.update, user.choose
---

# Simplify

## Shared protocols

1. Read `_refs/shared/tasklist.md` and keep progress runtime-only.
2. Apply Project Context Preflight v2 from
   `_refs/shared/project-context.md`.
3. Read repository instructions, current diffs, relevant approved artifacts,
   and existing project commands before deciding scope.
4. Apply `_refs/shared/artifact-lifecycle.md` only when an explicitly requested
   durable report is necessary. Never create a mutable session/checkpoint.
5. Read `_refs/shared/user-choice-prompt.md` before any user-facing choice or
   write-mode override.
6. Localize runtime prose. Keep identifiers, commands, paths, and reusable
   source English.

## Purpose and ownership

Use this workflow utility for bounded refinement of current changed executable
source or an explicit source scope (file, function, or path). Preserve
observable behavior and prefer clarity over line count.

Do not use it as an implementation track, formatter wrapper, linter autofix,
performance optimizer, bug fixer, repair loop, architecture migration,
dependency cleanup, documentation or prompt rewriter, test generator, or
repository-wide dead-code remover.

Keep dedicated ownership:

- read-only code or architecture assessment -> `sdcorejs-review`;
- structured findings -> `sdcorejs-repair-loop`;
- a concrete bug or failure -> `sdcorejs-debug`;
- tests or test-oracle changes -> `sdcorejs-test`;
- documentation, prompts, guides, or prose -> `sdcorejs-documentation`;
- broad/public/architectural refactors -> brainstorming, spec, and plan;
- approved refactor plans -> `sdcorejs-execute-plan`;
- dependency delivery -> `sdcorejs-ship`;
- Git artifacts -> `sdcorejs-git`.

## Load the contract

Always read:

- [`_refs/simplify/scope-and-invariants.md`](../../../_refs/simplify/scope-and-invariants.md)
- [`_refs/simplify/verification.md`](../../../_refs/simplify/verification.md)

Read
[`_refs/simplify/stack-guardrails.md`](../../../_refs/simplify/stack-guardrails.md)
only for the detected target stack or when AI-agent evidence exists. Do not load
unrelated stack reference packs.

## Step 1 - Select exactly one action

Emit one `simplify_action`:

| Action | Boundary |
|---|---|
| `analyze-current-diff` | Read-only opportunities in eligible current changed source hunks. |
| `apply-current-diff` | Refine only eligible current changed source hunks after baseline verification. |
| `analyze-explicit-scope` | Read-only opportunities in named source paths/functions. |
| `apply-explicit-scope` | Refine a concrete named source scope after preflight and baseline verification. |
| `planning-handoff` | Return broad, semantic, architectural, public-contract, or unverifiable work to spec/plan. |

For an explicit request to simplify recently changed code, default to
`apply-current-diff`. For requests to identify opportunities, use the matching
analyze action. The word "simplify", "refactor", "clean", "clarity", or
"maintainability" alone never authorizes writes.

## Step 2 - Run preflight and resolve scope

Record:

- target root and target-root kind;
- branch, `HEAD`, staged/unstaged/untracked state, and current diff baseline;
- package manager and discovered verification scripts;
- user-owned versus same-change edits;
- explicit paths and current execution, test, AI-agent, review, or debug
  context;
- applicable project conventions and framework contracts.

Resolve the default current changed executable source scope in this order:

1. explicit file/function/path scope;
2. `execution_context.files_changed`;
3. `ai_agent_context.changed_files`;
4. current same-change diff;
5. staged and unstaged executable source;
6. ask for scope when none can be proven.

Never default to the whole repository. For a current-diff action, select only
eligible changed hunks. Touch adjacent unchanged code only when compilation or
a local invariant requires it, and record the expansion.

If dirty files overlap the intended write paths, stop and use the repository's
numbered dirty-tree choice. Do not overwrite or revert user-owned changes.

## Step 3 - Freeze the preservation contract

Before any edit:

1. Classify eligible files and excluded/protected files/content.
2. Record applicable `preserved_surfaces`, marking important non-applicable
   fields explicitly.
3. Discover a focused verification oracle from current project evidence.
4. Move to `planning-handoff` when the request changes architecture, public
   behavior, schemas, dependencies, performance, caching, retry, concurrency,
   transactions, agent/tool contracts, or lacks a suitable oracle.

Analyze actions stop after reporting ranked local opportunities, exclusions,
risks, and runtime `simplify_context`. They do not edit or claim the code was
simplified.

## Step 4 - Establish baseline verification

Apply actions require current baseline verification:

1. Use the committed package manager and existing scripts; invent nothing.
2. Run the narrowest focused tests/typecheck/lint/build that covers the scope.
3. Record exact command, cwd/scope, exit code, and result.
4. Reuse `test_context` evidence only when it covers the same current diff and
   selected hunks and is not stale.

If no runnable behavior oracle exists, downgrade to analyze-only. Write mode
requires a separate explicit override after warning and must report
`behavior_verification: limited`; never call it verified behavior preservation.

## Step 5 - Apply bounded passes

Run at most two coherent local passes. Follow the limits and allowed/forbidden
patterns in the scope reference.

For each pass:

1. Capture the exact pre-pass diff/snippets for the selected hunks.
2. Apply the smallest clarity improvement inside scope.
3. Preserve protected literals, contracts, ordering, metadata, and dependency
   boundaries.
4. Run the matching focused post-change verification.
5. Inspect the diff for scope or protected-surface drift.
6. If the pass regresses, undo only that pass with exact scoped edits from the
   pre-pass snapshot; never use destructive Git restore.
7. Stop when no clear improvement remains.

## Step 6 - Finalize evidence

Run the final focused commands and `git diff --check`. Confirm:

- selected scope did not expand silently;
- protected file/content and string/prompt content did not change;
- public behavior, framework metadata, dependency, config, manifest, and
  lockfiles did not change;
- every failed pass was reverted or the run is blocked;
- test/review/ship evidence affected by a write is marked stale until rerun.

Emit the complete runtime-only `simplify_context` from the verification
reference. Do not persist it in a global manifest and do not create a durable
simplification report unless the user explicitly requests a real handoff.

## Finish-gate invocation

When invoked from the finish gate:

1. consume the selected test baseline and changed source scope;
2. honor Skip, Analyze-only, or Apply;
3. after Apply, rerun affected focused tests and append evidence;
4. pass `simplify_context` to review and the remaining tail;
5. never auto-run a second simplification after repair-loop.

## Hard boundaries

- Never change observable behavior to make code shorter.
- Never change tests, fixtures, snapshots, prompts, docs, config, contracts, or
  protected literals to make a transformation pass.
- Never add/remove dependencies or change manifests/lockfiles.
- Never stage, commit, push, open a PR, tag, publish, release, or otherwise
  invoke Git writes. Read-only Git inspection is allowed by the verification
  reference.
- Never claim arbitrary semantic equivalence. Say only what current focused
  verification covers and report every limitation.
