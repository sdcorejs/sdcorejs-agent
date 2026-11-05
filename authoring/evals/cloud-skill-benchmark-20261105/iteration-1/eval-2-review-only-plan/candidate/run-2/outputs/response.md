**Draft implementation plan — awaiting your review.** Plan approval, an approved-plan snapshot, and execution remain unauthorized.

The goal is to bring the existing `normalizeCategory` utility into line with the approved behavior you described: trim and lowercase strings, and return `''` for `null` or `undefined`.

All tasks belong to the existing standalone target project. The proposed implementation scope is limited to `src/category.mjs` and `test/category.test.mjs`. This is Node.js utility work (`node` / `node-general`), with sequential execution and tests before implementation. The stated scope needs no architectural redesign, dependencies, environment changes, migrations, or generated artifacts.

**Phase 1 — establish the baseline**

1. **TASK-001 · READ / VERIFY** — inspect `src/category.mjs` and `test/category.test.mjs` in the known target repository. Confirm both paths exist, the current export signature, test conventions, and applicable repository instructions. Before any later edits, inspect `git status --short`, `git diff --cached --stat`, `git diff --stat`, `git ls-files --others --exclude-standard`, `git branch --show-current`, and `git rev-parse HEAD`. Preserve unrelated changes; resolve overlapping changes with unknown ownership before editing. Confirm the execution root is the target project. Run the existing focused test command to establish a baseline.

**Phase 2 — cover and implement the behavior**

2. **TASK-002 · VERIFY THEN EDIT `test/category.test.mjs`** — after TASK-001, reuse existing coverage and add only missing behavior cases from the table below. Use the real utility and the existing test setup. Run `node --test test/category.test.mjs` and record the result before implementation. If the behavior already passes, do not manufacture a failing test or require an unnecessary production edit.
3. **TASK-003 · VERIFY THEN EDIT `src/category.mjs`** — after TASK-002, make the smallest necessary change: handle `null` and `undefined` as `''`; trim and lowercase string input. Preserve the existing export and unrelated behavior. The supplied scope does not define new coercion or validation rules for other input types.

**Phase 3 — verify and review**

4. **TASK-004 · RUN / REVIEW** — after TASK-003, run `node --test test/category.test.mjs` from the target project root. Check the final diff against the cases below, confirm existing tests still pass, and confirm changes are confined to the two allowed paths. Report the actual command result and any unresolved failures. No commit or publishing step is included.

| Required behavior | Planned cases in `test/category.test.mjs` | Implementation / proof |
| --- | --- | --- |
| Trim surrounding whitespace | `'  Books\t\n'` → `'books'` | TASK-002, TASK-003; focused run in TASK-004 |
| Lowercase strings | `'MiXeD'` → `'mixed'` | TASK-002, TASK-003; focused run in TASK-004 |
| Combine both operations, preserving internal spacing | `'  Home  Goods  '` → `'home  goods'` | TASK-002, TASK-003; focused run in TASK-004 |
| Handle nullish values | `null` → `''`; `undefined` → `''` | TASK-002, TASK-003; focused run in TASK-004 |
| Handle empty and already normalized strings | `''` → `''`; `' \t\n'` → `''`; `'books'` → `'books'` | TASK-002, TASK-003; focused run in TASK-004 |

All other paths, including package manifests, lockfiles, environment files, and `.sdcorejs/**`, are outside this capture's write scope. Unit tests are sufficient for this pure transformation; no browser, integration environment, or additional test tooling is planned. The verification command comes directly from your request.

I reviewed the draft for behavior coverage, task order, and scope. I have not inspected the target files, run tests, or validated an immutable spec/plan handoff; the approved spec's artifact identity was not supplied in this capture. The table is a draft behavior mapping, not a claim of passing evidence or assigned canonical spec IDs.

**What I need next:** your review feedback or requested revisions. Nothing else is needed to review this draft. Moving beyond review requires your explicit authorization for the intended next actions—plan approval, snapshot creation, and execution are distinct from this draft request. No repository artifact or approved snapshot has been created.
