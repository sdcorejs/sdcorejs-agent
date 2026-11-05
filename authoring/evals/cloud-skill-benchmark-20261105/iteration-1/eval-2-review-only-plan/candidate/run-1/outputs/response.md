Draft implementation plan for review — unapproved. No approved-plan snapshot or implementation is authorized.

The goal is to make `normalizeCategory` satisfy the approved behavior you supplied: trim strings, lowercase them, and return `''` for `null` or `undefined`. The standalone target project owns both files. The proposed scope is limited to `src/category.mjs` and `test/category.test.mjs`, with no dependencies, environment changes, migrations, package or lockfile edits, generated files, or unrelated refactoring.

Use a sequential, test-first approach. The supplied `.mjs` paths and Node test command support a `node` / `node-esm` planning profile. No frontend, AI-agent, or cross-module architecture work is indicated by this bounded utility change.

All steps below are proposals for a later authorized execution; none has been run.

1. **TASK-001 — READ / PREFLIGHT: both target files.** Confirm their existence in the known standalone project, inspect `normalizeCategory`, its export, and existing assertions. Preserve the current module interface and test conventions. Before any future edits, inspect `git status --short`, `git diff --cached --stat`, `git diff --stat`, `git ls-files --others --exclude-standard`, `git branch --show-current`, and `git rev-parse HEAD`. Confirm the target root and two-file write scope; leave disjoint changes untouched and resolve overlapping unrelated edits before writing. Run `node --test test/category.test.mjs` from that project root to capture the baseline. Evidence: file inspection, scope check, and actual baseline result.

2. **TASK-002 — VERIFY THEN EDIT: `test/category.test.mjs`.** Depends on TASK-001. Retain useful existing tests and add only missing behavior cases from the table below, using the real exported function. Run the same command before production changes. If a new assertion fails, confirm it fails because the specified behavior is absent, rather than because of test setup. If all cases already pass, record that result and avoid an unnecessary production edit. Evidence: mapped assertions and observed test output.

3. **TASK-003 — VERIFY THEN EDIT: `src/category.mjs`.** Depends on TASK-002. Make the smallest required change to handle `null`/`undefined` as `''`, and trim and lowercase string inputs. Preserve the existing export and surrounding behavior. Other non-string inputs are outside the supplied specification; do not introduce coercion or a new validation policy. Evidence: focused source diff against the mapped behavior.

4. **TASK-004 — VERIFY / REVIEW: both target files.** Depends on TASK-003, or TASK-002 if no implementation change is needed. Run `node --test test/category.test.mjs` after the final edit. Review that every case is covered, no tests were weakened or skipped, and the change stayed within the two paths. Report the actual exit status and failures, if any. Broader checks are not planned: the supplied unit command directly exercises this pure utility, and no other project command is evidenced. Evidence: final test output and scope review.

The target paths are supplied as existing by you, but have not been inspected in this capture; `VERIFY THEN EDIT` records that limitation without proposing replacement files. Every task belongs to the same standalone target project, and tasks run in order with no delegation.

| Behavior to prove | Representative input → expected output | Planned proof |
|---|---|---|
| Trim and lowercase together | `'  Books  '` → `'books'` | TASK-002 assertions; TASK-003 implementation; TASK-004 run |
| Trim tabs/newlines | `'\tBoOkS\n'` → `'books'` | TASK-002 through TASK-004 |
| Empty and whitespace-only strings | `''` → `''`; `' \t\n'` → `''` | TASK-002 through TASK-004 |
| Both nullish inputs | `null` → `''`; `undefined` → `''` | TASK-002 through TASK-004 |
| Preserve internal spaces and normalized text | `' Home Office '` → `'home office'`; `'books'` → `'books'` | TASK-002 through TASK-004 |

Verification status: **NOT RUN**. This is a review draft based on your supplied spec summary, paths, owner, and command. The actual approved spec identity and repository inventory were not supplied in this capture, so immutable-artifact, architecture-handoff, and decision-coverage checks have not been run or claimed to pass. Any later formal handoff must retain the existing spec's real references and identifiers.

Next, I need your review feedback: approve the draft's content, request changes, or cancel. Content approval will not be treated as permission to create an approved-plan snapshot or execute. Those actions require explicit authorization beyond this review-only request.
