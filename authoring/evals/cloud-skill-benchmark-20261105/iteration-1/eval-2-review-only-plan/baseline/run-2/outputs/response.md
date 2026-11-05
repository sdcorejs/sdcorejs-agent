**Draft implementation plan — for review only.** Approval, an approved-plan snapshot, and execution remain pending.

Scope: bring `normalizeCategory` into conformance with the approved behavior you supplied. Both proposed edits belong to the known standalone target project. Use its existing Node ESM setup, with sequential execution and tests before implementation. No dependency, environment, manifest, lockfile, migration, or generated-output changes are proposed.

1. **TASK-001 — INSPECT the target project and establish a baseline.** Confirm `src/category.mjs` and `test/category.test.mjs` exist, read their implementation and test conventions, and preserve the current export/signature. Before future edits, inspect the branch, HEAD, staged/unstaged diffs, and untracked files. Preserve unrelated changes; resolve any overlapping changes with unclear ownership. Run `node --test test/category.test.mjs` from the target project root and record the actual baseline.
2. **TASK-002 — EDIT `test/category.test.mjs`.** After TASK-001, reuse existing cases and add only missing behavior coverage from the table below. Run the same command before implementation to identify any failing requirements. If the behavior already passes, record that result without manufacturing a failure.
3. **TASK-003 — EDIT `src/category.mjs` as needed.** After TASK-002, handle `null` and `undefined` explicitly by returning `''`; for strings, trim and lowercase using the existing utility’s conventions. Keep the change local. Do not introduce coercion or new behavior for other input types absent a spec requirement. If all required behavior already exists, leave production code unchanged.
4. **TASK-004 — VERIFY and REVIEW.** After TASK-003, rerun `node --test test/category.test.mjs`. Review the diff for scope and compatibility, ensure all mapped cases ran without failures or skips, and report the changed files and actual results. If an in-scope repair is needed, rerun verification after the last edit.

Tasks 1–2 form preparation and regression coverage; tasks 3–4 form implementation and verification. All mutation steps have the same owner: the known standalone target project. Only `src/category.mjs` and `test/category.test.mjs` are proposed editable paths.

| Required behavior | Planned examples | Tasks providing proof |
| --- | --- | --- |
| Trim and lowercase strings | `'  BoOkS  '` → `'books'`; `'\tMiXeD\n'` → `'mixed'` | 2, 3, 4 |
| Return an empty string for nullish inputs | `null` → `''`; `undefined` → `''` | 2, 3, 4 |
| Preserve valid empty/normalized results | `''` → `''`; `'   '` → `''`; `'books'` → `'books'` | 2, 3, 4 |
| Preserve internal spacing while trimming ends | `'  Home Goods  '` → `'home goods'` | 2, 3, 4 |

These are planned unit checks using your supplied command. No broader test tooling is needed for this pure transformation. No architecture change is proposed for this bounded utility correction.

The draft has been checked against the supplied behavior and write boundaries. Target files, approved-spec artifact identities, and formal handoff validators have not been inspected or validated in this capture; no tests have been run and no repository artifacts have been written.

**What I need next:** your review feedback or an explicit decision approving the draft. Approval of the text alone will not be treated as permission to create a snapshot or execute. Those actions need explicit authorization when you want to proceed; there is no scope clarification needed for this draft.
