# Target fast-fix independent execution evaluation

## Outcome

Actual target execution completed. Local commit `025675d36f0e70ae40011b53ab2c11479d26994f` (`fix(label): return an empty string for null`) contains exactly `src/label.mjs` and `test/label.test.mjs`. The user-approved pre-existing comment is preserved and included as the same change. `notes.md` remains untracked and byte-identical. Three Node unit tests passed; the original null repro changed from exit 1 to exit 0. No remote, push, PR, network or service call occurred.

This is one fresh synthetic Node fixture execution. It is not Angular production coverage, a real framework integration, or evidence that all skill routing works. The reviewer in this execution is the same agent that implemented the fix; there was no independent second reviewer. Contract helper checks validate supplied evidence shapes/identity; they do not independently prove semantic review effectiveness.

## Isolation and raw request

- Fixture root: `/workspace/work/skill-audit/target-fast-fix`.
- Initial commit: `c6988ddd1db63bf34bdcc1eda9d1759806f3a217`; branch: `fixture`.
- Initial index was empty; worktree held the same-change source comment plus unrelated untracked `notes.md`.
- Canonical instruction root was read-only. No authoring-repository audit report or test was read and no authoring file was edited.
- Only canonical selected skills/references were read. Diagnostic evaluation JSON lives under the fixture `.git/`; none entered the commit.
- Actual model identifier and token use: unknown; no runtime metering exposed them. File byte counts below are not token estimates.

> Fix label(null) so it returns an empty string, preserve existing non-null behavior and the current same-change comment. Verify it, review the change and create a local commit containing only this fix. Do not touch notes.md. Scope and behavior are confirmed.

## Executed actions and decisions

1. Read root `AGENTS.md` first, then selected dispatch frontmatter/shared references and `sdcorejs-debug`.
2. Created the requested initial Node fixture and initial local commit. Added the approved same-change comment and unrelated notes draft after that commit.
3. Captured branch, HEAD, staged/unstaged diff, untracked paths, fixture content and Node version. Existing name test passed; an explicit null assertion reproduced `TypeError: Cannot read properties of null (reading name)` at `src/label.mjs:2`.
4. Used actual path ownership to evaluate dirty state: `dirty-disjoint`, no overlaps. The request expressly identifies the source comment as same-change and excludes notes, so no ownership question was needed.
5. Called `classifyTask` and `evaluateDebugArtifact`. The first classification invocation omitted `acceptance_criteria_confirmed` and `test_layer_confirmed` fields and returned `governed-change`; it made no source edits. After inspecting the helper, the agent supplied these facts from the already-confirmed request and discovered node:test fixture. The corrected result was `small-explicit-low-risk-fix`. This is a caller-input correction, not a newly obtained user approval.
6. The debug attempt contract returned `ready`, with current baseline revision/fingerprint and allowed paths `src/label.mjs`, `test/label.test.mjs`. Kept its attempt context unchanged for completion.
7. Applied one strict-null conditional to the source and added two meaningful behavior tests, preserving the existing test and comment. No other target file was changed.
8. Ran the focused test file, original repro, whitespace check and later the discovered full `node --test` command. Read every reviewed file. Inspected null-only behavior, non-null property access, naming/imports, test assertions, comment preservation, ownership, and absence of route/auth/UI/collection boundaries.
9. Actual helper calls returned: debug completion verified; review `reviewed` with complete risk coverage and no findings; bugfix convergence `CONVERGED`, fresh; local Git disposition allowed. These results use evidence collected from the actual fixture commands and inspection.
10. Ran final read-only branch/hygiene checks and empty `.sdcorejs` artifact discovery. Rechecked the exact diff hash before explicit staging. Used `git add -- src/label.mjs test/label.test.mjs`, checked staged paths, and committed via an owned UTF-8 message file with `git commit -F`. Removed only that exact message file.
11. Checked post-commit status, commit path set, committed diff, repeated artifact closure and notes hash. Only `?? notes.md` remains.

Prose choices (not separate tool executions): bounded risk classification, H1 root-cause interpretation, no need for spec/plan, optional simplify omitted, no useful extra source documentation for this obvious scalar guard, no durable execution record because diff/tests capture the useful facts, no convention sync/cleanup candidates. No Angular/NestJS/Next.js rules were applied. No user questions or material blockers occurred. Build/lint/typecheck were skipped because no such scripts exist; remote/base comparison was skipped because the isolated task forbids remote actions and has no configured remote.

The finish and Git references differ in how broadly receipt language is phrased. This run applied `git-disposition.md` explicitly: bounded fast-fix work does not fabricate a plan or convergence receipt merely to commit. It still executed bugfix convergence and current hygiene; no governed-plan approval or receipt was invented.

## Verification: actual commands/results

| # | Command | Exit | Result |
|---:|---|---:|---|
| 14 | `node --version` | 0 | null repro passed |
| 15 | `node --test test/label.test.mjs` | 0 | 1 passed (pre-fix baseline) |
| 16 | `node --input-type=module -e 'import { label } from '"'"'./src/label.mjs'"'"'; import assert from '"'"'node:assert/strict'"'"'; assert.equal(label(null), '"'"''"'"');'` | 1 | null repro failed with TypeError |
| 17 | `node --test test/label.test.mjs` | 0 | 3 passed, 0 failed |
| 18 | `node --input-type=module -e 'import { label } from '"'"'./src/label.mjs'"'"'; import assert from '"'"'node:assert/strict'"'"'; assert.equal(label(null), '"'"''"'"');'` | 0 | null repro passed |
| 24 | `node --test` | 0 | 3 passed, 0 failed |

All target test commands ran from `/workspace/work/skill-audit/target-fast-fix` using Node `v24.22.1`. No package manager was inferred or installed; the test command was discovered from `package.json` (`test: node --test`).

Precommit HEAD/diff identity: `c6988ddd1db63bf34bdcc1eda9d1759806f3a217:sha256:2461ce780b4f8edd2c43dac5b89e7ad19b5f1d13e26cfede5a4378e5eb67764e`.
Current source/test fingerprint at verification: `e4b0933bd8761fd5cf075c2b52f5d8d8568fd015f9c13357bcd0db90b07ba682`.

Exact final test output:

```text
node --test
✔ label returns the name (0.887068ms)
✔ label returns an empty string for null (0.207066ms)
✔ label preserves non-null property values and missing names (0.508773ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 80.308574
```

Exact pre-fix reproduction error:

```text
file:///workspace/work/skill-audit/target-fast-fix/src/label.mjs:2
export function label(value) { return value.name; }
                                            ^

TypeError: Cannot read properties of null (reading 'name')
    at label (file:///workspace/work/skill-audit/target-fast-fix/src/label.mjs:2:45)
    at file:///workspace/work/skill-audit/target-fast-fix/[eval1]:1:96
    at ModuleJob.run (node:internal/modules/esm/module_job:561:25)
    at async node:internal/modules/esm/loader:223:26
    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:220:20)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.22.1
```

## Review and gate evidence

| Gate | Actual observed result |
|---|---|
| Debug attempt | ready; write_authorized=true |
| Debug completion | ready; completion_verified=true |
| Review | reviewed; risk_coverage=complete; 0 findings/blockers |
| Convergence | CONVERGED; fresh=true; 1 task, 2 changed paths, 1 evidence record |
| Local Git disposition | allowed=true; verified acceptance; complete closure; current read-only hygiene |

Risk coverage was checked for naming, hardcoded/null assumptions and test adequacy. Routing, protection, screens and data completeness were marked not applicable with concrete fixture-scope reasons. No broad security scan or rendered UI review was claimed.

## Committed diff

```diff
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..26c7efc 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
-export function label(value) { return value.name; }
+// User-approved same-change comment
+export function label(value) { return value === null ? '' : value.name; }
diff --git a/test/label.test.mjs b/test/label.test.mjs
index 4190cdc..6aef712 100644
--- a/test/label.test.mjs
+++ b/test/label.test.mjs
@@ -5,3 +5,18 @@ import { label } from '../src/label.mjs';
 test('label returns the name', () => {
   assert.equal(label({ name: 'A' }), 'A');
 });
+
+test('label returns an empty string for null', () => {
+  assert.equal(label(null), '');
+});
+
+test('label preserves non-null property values and missing names', () => {
+  for (const name of ['', 0, false, null, undefined]) {
+    assert.equal(label({ name }), name);
+  }
+  assert.equal(label({}), undefined);
+  assert.equal(label(0), undefined);
+  assert.equal(label(false), undefined);
+  assert.equal(label(''), undefined);
+  assert.throws(() => label(undefined), TypeError);
+});
```

## Commit path set and final state

```text
src/label.mjs
test/label.test.mjs
```

Post-commit `git status --short`:

```text
?? notes.md
```

`notes.md`: 21 bytes, exact content `Unrelated user draft\n`; SHA-256 `5a64b50682cf515569c70b55f68ab01c90cfc9ca136bfc965fd5111548b22382` both before and after; `git ls-files -- notes.md` returned empty. It was created only during evaluator setup and not modified by the raw-task execution.

## Instruction files loaded and byte counts

Counts below measure unique selected source bytes read by shell commands, not total tool transcript bytes, not model tokens, and not a claim that every emitted byte reached the model. Several early overly broad combined reads exceeded output limits and were truncated; relevant sections were reread where needed. Those command-side full reads are identified honestly. Repeated reads, path listings, headings and implicit transitive JavaScript imports are not added to this unique-source total. The large full reads were an execution inefficiency of this evaluator, so these totals are not a minimum necessary context cost.

Unique canonical instruction/helper files selected: 47. Unique command-side selected bytes: 508,959.

| File relative to skill root | File bytes | Selected bytes | Read scope |
|---|---:|---:|---|
| `AGENTS.md` | 10216 | 10216 | full-file command read; some combined outputs were truncated |
| `AGENTS.reference.md` | 6204 | 6204 | full-file command read; some combined outputs were truncated |
| `_refs/shared/runtime-protocols.md` | 2171 | 2171 | full-file command read; some combined outputs were truncated |
| `_refs/shared/project-context.md` | 12659 | 12659 | full-file command read; some combined outputs were truncated |
| `_refs/shared/finish-gate.md` | 10919 | 10919 | full-file command read; some combined outputs were truncated |
| `_refs/shared/session-authority.md` | 3377 | 3377 | full-file command read; some combined outputs were truncated |
| `_refs/harness/communication-economy.md` | 8973 | 8973 | full-file command read; some combined outputs were truncated |
| `_refs/harness/runtime-policy.mjs` | 40480 | 40480 | full-file command read; some combined outputs were truncated |
| `_refs/orchestration/execution-contract.mjs` | 14802 | 14802 | full-file command read; some combined outputs were truncated |
| `_refs/shared/artifact-lifecycle.md` | 19191 | 19191 | full-file command read; some combined outputs were truncated |
| `_refs/shared/system-registry.json` | 9225 | 9225 | full-file command read; some combined outputs were truncated |
| `_refs/harness/capability-contract.json` | 26924 | 26924 | full-file command read; some combined outputs were truncated |
| `skills/shared/workflow/debug.md` | 24690 | 24690 | full-file command read; some combined outputs were truncated |
| `_refs/shared/debugging-discipline.md` | 2346 | 2346 | full-file command read; some combined outputs were truncated |
| `_refs/shared/debug-command-discovery.md` | 2094 | 2094 | full-file command read; some combined outputs were truncated |
| `_refs/shared/debug-environment-guard.md` | 2491 | 2491 | full-file command read; some combined outputs were truncated |
| `_refs/shared/debug-context.md` | 4588 | 4588 | full-file command read; some combined outputs were truncated |
| `_refs/shared/debug-contract.mjs` | 9319 | 9319 | full-file command read; some combined outputs were truncated |
| `skills/shared/workflow/review.md` | 24013 | 24013 | full-file command read; some combined outputs were truncated |
| `skills/shared/workflow/ship.md` | 23773 | 23773 | full-file command read; some combined outputs were truncated |
| `skills/shared/workflow/git.md` | 22917 | 22917 | full-file command read; some combined outputs were truncated |
| `_refs/orchestration/tail/verify-before-done.md` | 15053 | 15053 | full-file command read; some combined outputs were truncated |
| `_refs/orchestration/tail/branch-ready.md` | 15099 | 15099 | full-file command read; some combined outputs were truncated |
| `_refs/shared/git-commit-scope.md` | 2901 | 2901 | full-file command read; some combined outputs were truncated |
| `_refs/shared/git-disposition.md` | 2011 | 2011 | full-file command read; some combined outputs were truncated |
| `_refs/shared/convergence-contract.md` | 12022 | 12022 | full-file command read; some combined outputs were truncated |
| `_refs/shared/decision-coverage.md` | 11826 | 11826 | full-file command read; some combined outputs were truncated |
| `_refs/shared/validation-map.md` | 6038 | 6038 | full-file command read; some combined outputs were truncated |
| `_refs/shared/convention-context.md` | 24178 | 24178 | full-file command read; some combined outputs were truncated |
| `_refs/shared/review-code.md` | 9061 | 9061 | full-file command read; some combined outputs were truncated |
| `_refs/shared/review-risk-contract.mjs` | 6646 | 6646 | full-file command read; some combined outputs were truncated |
| `_refs/orchestration/tail/auto-docs.md` | 4321 | 4321 | full-file command read; some combined outputs were truncated |
| `_refs/shared/testing-philosophy.md` | 6109 | 6109 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-command-discovery.md` | 2161 | 2161 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-environment-guard.md` | 2072 | 2072 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-context.md` | 9817 | 9817 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-scope-and-coverage.md` | 4808 | 4808 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-auth-personas.md` | 2980 | 2980 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-data-lifecycle.md` | 2342 | 2342 | full-file command read; some combined outputs were truncated |
| `_refs/shared/test-generic.md` | 1982 | 1982 | full-file command read; some combined outputs were truncated |
| `_refs/shared/review-data-completeness.md` | 2936 | 2936 | full-file command read; some combined outputs were truncated |
| `_refs/shared/review-screen-patterns.md` | 1843 | 1843 | full-file command read; some combined outputs were truncated |
| `skills/tracks/test/sdcorejs-test.md` | 11445 | 8149 | selected lines 1-150 |
| `_refs/shared/review-contract.mjs` | 13199 | 12948 | selected lines 1-320 |
| `_refs/shared/ship-readiness-contract.mjs` | 18296 | 2443 | selected lines 442-535 |
| `_refs/shared/convergence-contract.mjs` | 76248 | 50027 | selected lines 1-80, 169-258, 446-900, 999-1165, 1250-1678 |
| `_refs/shared/review-consistency.md` | 25449 | 7814 | selected lines 1-170 |

Target source reads (baseline/current):

| Path | Baseline bytes | Final bytes |
|---|---:|---:|
| `package.json` | 51 | 51 |
| `src/label.mjs` | 89 | 111 |
| `test/label.test.mjs` | 200 | 680 |
| `notes.md` | 21 | 21 |

## Sanitized target command ledger

This ledger contains actual subprocess invocations captured during fixture setup, diagnosis, verification and commit. Reference-read commands and the JavaScript helper invocations are described above; they are not misrepresented as target tests. Each empty output remains empty. Setup identity is a synthetic example.invalid identity, not a user account.

### 1. `git init --initial-branch=fixture`

Exit: 0.

```text
Initialized empty Git repository in /workspace/work/skill-audit/target-fast-fix/.git/
```

### 2. `git config user.name 'Fixture Evaluator'`

Exit: 0.

### 3. `git config user.email fixture@example.invalid`

Exit: 0.

### 4. `git add -- package.json src/label.mjs test/label.test.mjs`

Exit: 0.

### 5. `git commit -m 'chore: initialize isolated label fixture'`

Exit: 0.

```text
[fixture (root-commit) c6988dd] chore: initialize isolated label fixture
 3 files changed, 9 insertions(+)
 create mode 100644 package.json
 create mode 100644 src/label.mjs
 create mode 100644 test/label.test.mjs
```

### 6. `git branch --show-current`

Exit: 0.

```text
fixture
```

### 7. `git rev-parse HEAD`

Exit: 0.

```text
c6988ddd1db63bf34bdcc1eda9d1759806f3a217
```

### 8. `git status --short`

Exit: 0.

```text
 M src/label.mjs
?? notes.md
```

### 9. `git diff --staged --stat`

Exit: 0.

### 10. `git diff --staged --name-status`

Exit: 0.

### 11. `git diff --stat`

Exit: 0.

```text
 src/label.mjs | 1 +
 1 file changed, 1 insertion(+)
```

### 12. `git diff`

Exit: 0.

```text
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..a148483 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
+// User-approved same-change comment
 export function label(value) { return value.name; }
```

### 13. `git ls-files --others --exclude-standard`

Exit: 0.

```text
notes.md
```

### 14. `node --version`

Exit: 0.

```text
v24.22.1
```

### 15. `node --test test/label.test.mjs`

Exit: 0.

```text
✔ label returns the name (0.825122ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 69.112117
```

### 16. `node --input-type=module -e 'import { label } from '"'"'./src/label.mjs'"'"'; import assert from '"'"'node:assert/strict'"'"'; assert.equal(label(null), '"'"''"'"');'`

Exit: 1.

```text
file:///workspace/work/skill-audit/target-fast-fix/src/label.mjs:2
export function label(value) { return value.name; }
                                            ^

TypeError: Cannot read properties of null (reading 'name')
    at label (file:///workspace/work/skill-audit/target-fast-fix/src/label.mjs:2:45)
    at file:///workspace/work/skill-audit/target-fast-fix/[eval1]:1:96
    at ModuleJob.run (node:internal/modules/esm/module_job:561:25)
    at async node:internal/modules/esm/loader:223:26
    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:220:20)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.22.1
```

### 17. `node --test test/label.test.mjs`

Exit: 0.

```text
✔ label returns the name (0.804197ms)
✔ label returns an empty string for null (0.143479ms)
✔ label preserves non-null property values and missing names (0.524552ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 78.371541
```

### 18. `node --input-type=module -e 'import { label } from '"'"'./src/label.mjs'"'"'; import assert from '"'"'node:assert/strict'"'"'; assert.equal(label(null), '"'"''"'"');'`

Exit: 0.

### 19. `git diff --check`

Exit: 0.

### 20. `git diff`

Exit: 0.

```text
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..26c7efc 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
-export function label(value) { return value.name; }
+// User-approved same-change comment
+export function label(value) { return value === null ? '' : value.name; }
diff --git a/test/label.test.mjs b/test/label.test.mjs
index 4190cdc..6aef712 100644
--- a/test/label.test.mjs
+++ b/test/label.test.mjs
@@ -5,3 +5,18 @@ import { label } from '../src/label.mjs';
 test('label returns the name', () => {
   assert.equal(label({ name: 'A' }), 'A');
 });
+
+test('label returns an empty string for null', () => {
+  assert.equal(label(null), '');
+});
+
+test('label preserves non-null property values and missing names', () => {
+  for (const name of ['', 0, false, null, undefined]) {
+    assert.equal(label({ name }), name);
+  }
+  assert.equal(label({}), undefined);
+  assert.equal(label(0), undefined);
+  assert.equal(label(false), undefined);
+  assert.equal(label(''), undefined);
+  assert.throws(() => label(undefined), TypeError);
+});
```

### 21. `git rev-parse HEAD`

Exit: 0.
Time: 2026-11-05T09:51:23.285Z to 2026-11-05T09:51:23.290Z.

```text
c6988ddd1db63bf34bdcc1eda9d1759806f3a217
```

### 22. `git diff --name-only HEAD --`

Exit: 0.
Time: 2026-11-05T09:51:23.291Z to 2026-11-05T09:51:23.296Z.

```text
src/label.mjs
test/label.test.mjs
```

### 23. `git diff HEAD --`

Exit: 0.
Time: 2026-11-05T09:51:23.297Z to 2026-11-05T09:51:23.301Z.

```text
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..26c7efc 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
-export function label(value) { return value.name; }
+// User-approved same-change comment
+export function label(value) { return value === null ? '' : value.name; }
diff --git a/test/label.test.mjs b/test/label.test.mjs
index 4190cdc..6aef712 100644
--- a/test/label.test.mjs
+++ b/test/label.test.mjs
@@ -5,3 +5,18 @@ import { label } from '../src/label.mjs';
 test('label returns the name', () => {
   assert.equal(label({ name: 'A' }), 'A');
 });
+
+test('label returns an empty string for null', () => {
+  assert.equal(label(null), '');
+});
+
+test('label preserves non-null property values and missing names', () => {
+  for (const name of ['', 0, false, null, undefined]) {
+    assert.equal(label({ name }), name);
+  }
+  assert.equal(label({}), undefined);
+  assert.equal(label(0), undefined);
+  assert.equal(label(false), undefined);
+  assert.equal(label(''), undefined);
+  assert.throws(() => label(undefined), TypeError);
+});
```

### 24. `node --test`

Exit: 0.
Time: 2026-11-05T09:51:23.302Z to 2026-11-05T09:51:23.432Z.

```text
✔ label returns the name (0.887068ms)
✔ label returns an empty string for null (0.207066ms)
✔ label preserves non-null property values and missing names (0.508773ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 80.308574
```

### 25. `git diff --check`

Exit: 0.
Time: 2026-11-05T09:51:23.434Z to 2026-11-05T09:51:23.438Z.

### 26. `git branch --show-current`

Exit: 0.
Time: 2026-11-05T09:51:23.438Z to 2026-11-05T09:51:23.442Z.

```text
fixture
```

### 27. `git status --short`

Exit: 0.
Time: 2026-11-05T09:51:23.442Z to 2026-11-05T09:51:23.448Z.

```text
 M src/label.mjs
 M test/label.test.mjs
?? notes.md
```

### 28. `git diff --staged --name-status`

Exit: 0.
Time: 2026-11-05T09:51:23.448Z to 2026-11-05T09:51:23.451Z.

### 29. `git diff --staged --stat`

Exit: 0.
Time: 2026-11-05T09:51:23.451Z to 2026-11-05T09:51:23.455Z.

### 30. `git log -5 --oneline`

Exit: 0.
Time: 2026-11-05T09:51:23.455Z to 2026-11-05T09:51:23.459Z.

```text
c6988dd chore: initialize isolated label fixture
```

### 31. `git status --short -- .sdcorejs`

Exit: 0.
Time: 2026-11-05T09:51:23.459Z to 2026-11-05T09:51:23.464Z.

### 32. `git diff --name-status -- .sdcorejs`

Exit: 0.
Time: 2026-11-05T09:51:23.464Z to 2026-11-05T09:51:23.467Z.

### 33. `git diff --cached --name-status -- .sdcorejs`

Exit: 0.
Time: 2026-11-05T09:51:23.467Z to 2026-11-05T09:51:23.471Z.

### 34. `git diff HEAD --`

Exit: 0.

```text
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..26c7efc 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
-export function label(value) { return value.name; }
+// User-approved same-change comment
+export function label(value) { return value === null ? '' : value.name; }
diff --git a/test/label.test.mjs b/test/label.test.mjs
index 4190cdc..6aef712 100644
--- a/test/label.test.mjs
+++ b/test/label.test.mjs
@@ -5,3 +5,18 @@ import { label } from '../src/label.mjs';
 test('label returns the name', () => {
   assert.equal(label({ name: 'A' }), 'A');
 });
+
+test('label returns an empty string for null', () => {
+  assert.equal(label(null), '');
+});
+
+test('label preserves non-null property values and missing names', () => {
+  for (const name of ['', 0, false, null, undefined]) {
+    assert.equal(label({ name }), name);
+  }
+  assert.equal(label({}), undefined);
+  assert.equal(label(0), undefined);
+  assert.equal(label(false), undefined);
+  assert.equal(label(''), undefined);
+  assert.throws(() => label(undefined), TypeError);
+});
```

### 35. `git add -- src/label.mjs test/label.test.mjs`

Exit: 0.

### 36. `git diff --cached --name-only`

Exit: 0.

```text
src/label.mjs
test/label.test.mjs
```

### 37. `git diff --cached --check`

Exit: 0.

### 38. `git commit -F /workspace/work/skill-audit/target-fast-fix/.git/evaluation-commit-message.txt`

Exit: 0.

```text
[fixture 025675d] fix(label): return an empty string for null
 2 files changed, 17 insertions(+), 1 deletion(-)
```

### 39. `git status --short`

Exit: 0.

```text
?? notes.md
```

### 40. `git log -1 --stat`

Exit: 0.

```text
commit 025675d36f0e70ae40011b53ab2c11479d26994f
Author: Fixture Evaluator <fixture@example.invalid>
Date:   Thu Nov 5 09:51:43 2026 +0000

    fix(label): return an empty string for null

    Preserve non-null property access and the user-approved same-change comment.

    Verification: node --test (3 passed); original null reproduction passed; git diff --check.

 src/label.mjs       |  3 ++-
 test/label.test.mjs | 15 +++++++++++++++
 2 files changed, 17 insertions(+), 1 deletion(-)
```

### 41. `git show --format= --name-only HEAD`

Exit: 0.

```text
src/label.mjs
test/label.test.mjs
```

### 42. `git show --format= HEAD`

Exit: 0.

```text
diff --git a/src/label.mjs b/src/label.mjs
index dbf0ffc..26c7efc 100644
--- a/src/label.mjs
+++ b/src/label.mjs
@@ -1 +1,2 @@
-export function label(value) { return value.name; }
+// User-approved same-change comment
+export function label(value) { return value === null ? '' : value.name; }
diff --git a/test/label.test.mjs b/test/label.test.mjs
index 4190cdc..6aef712 100644
--- a/test/label.test.mjs
+++ b/test/label.test.mjs
@@ -5,3 +5,18 @@ import { label } from '../src/label.mjs';
 test('label returns the name', () => {
   assert.equal(label({ name: 'A' }), 'A');
 });
+
+test('label returns an empty string for null', () => {
+  assert.equal(label(null), '');
+});
+
+test('label preserves non-null property values and missing names', () => {
+  for (const name of ['', 0, false, null, undefined]) {
+    assert.equal(label({ name }), name);
+  }
+  assert.equal(label({}), undefined);
+  assert.equal(label(0), undefined);
+  assert.equal(label(false), undefined);
+  assert.equal(label(''), undefined);
+  assert.throws(() => label(undefined), TypeError);
+});
```

### 43. `git rev-parse HEAD`

Exit: 0.

```text
025675d36f0e70ae40011b53ab2c11479d26994f
```

### 44. `git status --short -- .sdcorejs`

Exit: 0.

### 45. `git diff --name-status -- .sdcorejs`

Exit: 0.

### 46. `git diff --cached --name-status -- .sdcorejs`

Exit: 0.

### 47. `git ls-files -- notes.md`

Exit: 0.
