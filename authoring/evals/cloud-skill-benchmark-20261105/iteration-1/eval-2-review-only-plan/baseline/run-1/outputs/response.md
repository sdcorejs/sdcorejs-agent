Draft implementation plan for review. Plan approval, an approved-plan snapshot, and execution remain unapproved.

The scope is to bring `normalizeCategory` into conformance with the approved behavior you described: trim strings, lowercase them, and return `''` for `null` or `undefined`.

All proposed edits belong to the known standalone target project and are limited to `src/category.mjs` and `test/category.test.mjs`. This is a Node ESM utility change, with sequential, test-first implementation proposed. No dependency, environment, migration, package-manifest, lockfile, generated-file, or documentation changes are needed. Separate architecture work is not indicated by this bounded scope.

The following steps are proposals only; none has been executed against the target project.

**Phase 1 — Confirm the baseline and express the behavior**

1. **TASK-001 · VERIFY · both target files.** Confirm that the paths exist in the known owner repository; inspect the current export, implementation, test style, and existing coverage. Before any later edits, capture branch/HEAD and working-tree evidence with `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, `git diff --cached --stat`, `git diff --stat`, and `git ls-files --others --exclude-standard`. Preserve unrelated changes; resolve overlapping ownership before affected edits. Run `node --test test/category.test.mjs` to establish the baseline. No new files or path substitutions are proposed.

2. **TASK-002 · VERIFY-THEN-EDIT · `test/category.test.mjs`.** After TASK-001, reuse existing behavior tests and add only missing cases from the table below, following the existing runner and import style. Run the supplied command before production changes. A failing test must expose missing normalization behavior; an import or runner failure is a blocker, not a valid test-first failure. If the behavior already passes, record that result rather than manufacture a failure.

**Phase 2 — Implement and verify**

3. **TASK-003 · VERIFY-THEN-EDIT · `src/category.mjs`.** After TASK-002, make the smallest necessary change: handle `null` and `undefined` as empty strings, then trim and lowercase string inputs. Preserve the existing function name, export, and surrounding behavior. Do not introduce broad coercion or new behavior for numbers, objects, or other inputs outside the stated contract. If all required behavior already exists, no production edit is needed.

4. **TASK-004 · VERIFY · both target files.** After TASK-003, run `node --test test/category.test.mjs` again and review the scoped diff against the acceptance cases and two-file boundary. Confirm existing tests remain intact and that no skip/focus markers or unrelated refactors were introduced. Report actual results and any unresolved failures. Any subsequent relevant edit requires another focused run before a completion claim.

All four tasks have the same owner: the known standalone target project. Dependencies are `TASK-001 → TASK-002 → TASK-003 → TASK-004`; these tightly coupled steps do not warrant parallel execution.

| Acceptance behavior | Representative inputs → expected output | Planned coverage |
|---|---|---|
| Trim surrounding whitespace | `'  Books  '` → `'books'`; `'\tBooks\n'` → `'books'` | TASK-002 tests, TASK-003 implementation, TASK-004 run |
| Lowercase strings | `'BoOkS'` → `'books'`; `'  HOME Goods  '` → `'home goods'` | TASK-002, TASK-003, TASK-004 |
| Handle empty and whitespace-only strings | `''` → `''`; `' \t\n '` → `''` | TASK-002, TASK-003, TASK-004 |
| Handle nullish inputs | `null` → `''`; `undefined` → `''` | TASK-002, TASK-003, TASK-004 |
| Keep already-normalized text stable | `'books'` → `'books'` | TASK-002, TASK-003, TASK-004 |

The verification command comes directly from your request and runs from the target project root. Unit tests are sufficient for this pure transformation; no installs, browser checks, or external services are proposed. No target inspection or test execution occurred in this capture.

This draft maps each stated behavior to implementation and verification, but is not a validated execution handoff. The capture includes your approved-spec summary, not the immutable spec artifact or its identity metadata. The skill's formal pre-plan and draft-handoff checks therefore reported `SPEC_INVALID` for the absent artifact; I have not invented its path, hash, revision, or requirement IDs. Target file existence and contents also remain unverified here.

Next, I need your review feedback on this draft. No further behavior clarification is needed to review the stated scope. Moving beyond review would require explicit authority for plan approval, snapshot creation, and execution, plus verification of the existing approved-spec handoff in the target project. I will not infer any of those authorizations from this draft request.
