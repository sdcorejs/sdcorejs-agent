import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { closeSync, cpSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { containsHunk, simplifyPatchHunks, simplifyScopeHash } from '../../../_refs/simplify/scope-evidence.mjs';
import { evaluateSimplifyContract } from '../../../_refs/simplify/simplify-contract.mjs';
import { contract, otherHead } from '../../../test/e2e/support/simplify-contract.mjs';

function applyToBatches(sizes) {
  let next = 0;
  return contract({invocation: 'direct'}, sizes.map(size =>
    Array.from({length: size}, () => `src/order-${++next}.mjs`)
  ));
}

function expectBlocked(input, reason) {
  const result = evaluateSimplifyContract(input);
  assert.equal(result.write_authorized, false, JSON.stringify(result));
  assert.equal(result.status, 'blocked');
  assert.ok(result.blockers.some(blocker => reason.test(blocker)), JSON.stringify(result));
}

test('five files per pass and eight distinct files total are within scope', () => {
  assert.equal(evaluateSimplifyContract(applyToBatches([5, 3])).status, 'verified');
});

test('the same five files in a second pass count once toward the total', () => {
  const input = applyToBatches([5]);
  input.passes.push({ ...input.passes[0], pass: 2 });
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
});

test('a single six-file pass must be split', () => expectBlocked(applyToBatches([6]), /pass.*file|file.*pass/i));
test('nine distinct files require a new scope decision', () => expectBlocked(applyToBatches([5, 4]), /total.*file|file.*total/i));

test('the before run must belong to the declared baseline', () => {
  const input = applyToBatches([1]);
  input.behavior_evidence.before.source_revision = otherHead;
  expectBlocked(input, /before.*revision|revision.*before/i);
});

test('an explicit baseline may precede the final revision', () => {
  const input = applyToBatches([1]);
  input.source_revision = otherHead;
  input.behavior_evidence.after.source_revision = otherHead;
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
});

test('a previous diff at the same HEAD cannot attest the final code', () => {
  const input = applyToBatches([1]);
  input.behavior_evidence.after.diff_scope_hash = input.baseline.diff_scope_hash;
  expectBlocked(input, /after.*(diff|snapshot)|(diff|snapshot).*after/i);
});

test('an old receipt without a scope snapshot requires a fresh run', () => {
  const input = applyToBatches([1]);
  delete input.behavior_evidence.before.diff_scope_hash;
  expectBlocked(input, /before.*(diff|snapshot)|(diff|snapshot).*before/i);
});

test('a zero-exit command verifies only the caller assertion that actually passed', t => {
  const root = mkdtempSync(join(tmpdir(), 'simplify-caller-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  cpSync(new URL('./consumer/', import.meta.url), root, {recursive: true});
  const path = 'src/imports/invoice.mjs';
  const source = join(root, path);
  const testFile = 'test/invoice.test.mjs';
  const assertion = 'imports an invoice without an order';
  const skipped = 'postponed invoice case';
  const expected = '{"invoice":"I-1"}';
  writeFileSync(join(root, testFile), `\ntest.skip('${skipped}', () => {});\n`, {flag: 'a'});
  const env = {...process.env};
  delete env.NODE_TEST_CONTEXT;

  function execute(tool, args) {
    const output = join(root, 'run-output');
    const fd = openSync(output, 'w');
    try {
      const run = spawnSync(tool, args, {cwd: root, env, stdio: ['ignore', fd, 'inherit']});
      assert.ifError(run.error);
      assert.equal(run.status, 0, readFileSync(output, 'utf8'));
      return {command: [tool, ...args].join(' '), exit_code: run.status, stdout: readFileSync(output, 'utf8')};
    } finally {
      closeSync(fd);
    }
  }

  execute('git', ['init', '--quiet']);
  execute('git', ['add', '--', 'src', 'test']);
  execute('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'baseline']);
  const head = execute('git', ['rev-parse', 'HEAD']).stdout.trim();
  const digest = () => simplifyScopeHash([{path, content: readFileSync(source)}]);
  function observe() {
    const common = {kind: 'behavior', assertion, result: 'PASSED', covered_paths: [path],
      source_revision: head, diff_scope_hash: digest()};
    function runTests(pattern, selected = assertion) {
      const {command, exit_code, stdout} = execute(process.execPath,
        ['--test-reporter=tap', '--test-name-pattern', pattern, testFile]);
      const passed = Number(/^# pass (\d+)$/m.exec(stdout)?.[1]);
      assert.ok(Number.isSafeInteger(passed), stdout);
      const passedIds = [...stdout.matchAll(/^ok \d+ - (.+)$/gm)]
        .map(match => match[1]).filter(name => !name.includes(' # '));
      assert.equal(passedIds.length, passed, stdout);
      return {...common, assertion: selected, command, exit_code, executed_tests: passed,
        passed_assertions: passedIds};
    }
    const probe = execute(process.execPath, ['--input-type=module', '-e',
      `import {readInvoice} from './${path}'; console.log(JSON.stringify({assertion: ${JSON.stringify(assertion)}, observed: JSON.stringify(readInvoice({invoice:"I-1"}))}));`]);
    return {
      matched: runTests('without an order'),
      empty: runTests('missing test name'),
      unrelated: runTests('billing'),
      skipped: runTests('postponed|billing', skipped),
      direct: {...common, command: probe.command, exit_code: probe.exit_code,
        caller_probe: {...JSON.parse(probe.stdout), expected}},
    };
  }

  const before = observe();
  writeFileSync(source, 'export function readInvoice(row) {\n  const invoice = row.invoice;\n  return { invoice };\n}\n');
  const after = observe();
  const patch = execute('git', ['diff', '--no-ext-diff', '--no-textconv', '--no-color', '-U0', '--', path]);
  const input = contract({invocation: 'direct', source_revision: head, final_diff_scope_hash: digest()}, [[path]]);
  input.baseline = {HEAD: head, result: 'PASSED', diff_scope_hash: before.matched.diff_scope_hash};
  input.passes[0].hunks = simplifyPatchHunks(path, patch.stdout);
  for (const [name, status] of Object.entries({
    matched: 'verified', direct: 'verified', empty: 'blocked', unrelated: 'blocked', skipped: 'blocked',
  })) {
    input.behavior_evidence = {before: before[name], after: after[name]};
    const result = evaluateSimplifyContract(input);
    assert.equal(result.status, status, name);
    assert.equal(result.write_authorized, status === 'verified', name);
  }
});

test('twenty separate hunks fit, the next one needs a narrower scope', () => {
  const input = applyToBatches([1]);
  const path = input.scope.files[0].path;
  input.passes[0].hunks = Array.from({length: 20}, (_, i) => ({path, start: i * 4 + 1, count: 1}));
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
  input.passes[0].hunks.push({path, start: 81, count: 1});
  expectBlocked(input, /hunk.*limit|hunk.*cap/i);
});

test('a different hunk of a selected file is outside a bounded edit', () => {
  const input = applyToBatches([1]);
  input.action = 'apply-current-diff';
  input.scope.files[0].allowed_hunks = [{start: 1, count: 1}];
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
  input.passes[0].hunks[0].start = 2;
  expectBlocked(input, /hunk.*outside|outside.*hunk/i);
});

test('old file-only pass evidence needs observed hunks before verification', () => {
  const input = applyToBatches([1]);
  delete input.passes[0].hunks;
  expectBlocked(input, /hunk/i);
});

test('a file-only legacy selection can finish a current-diff run without edits', () => {
  const input = contract({action: 'apply-current-diff', passes: [], behavior_evidence: null});
  delete input.baseline.diff_scope_hash;
  delete input.final_diff_scope_hash;
  const result = evaluateSimplifyContract(input);
  assert.equal(result.status, 'unchanged');
  assert.equal(result.write_authorized, false);
});

test('analyze mode rejects observed edit hunks even when the path list is empty', () => {
  const input = contract({action: 'analyze-current-diff'});
  input.passes[0].changed_paths = [];
  expectBlocked(input, /read-only/);
});

test('snapshots bind normalized paths, raw bytes and explicit absence', () => {
  const existing = {path: 'src/a', content: Buffer.from([0, 255])};
  const missing = {path: 'src/b', content: null};
  const digest = simplifyScopeHash([existing, missing]);
  assert.equal(simplifyScopeHash([missing, {...existing, path: '.\\src\\a'}]), digest);
  for (const edited of [{...missing, content: Buffer.alloc(0)}, {...missing, path: 'src/c'}]) {
    assert.notEqual(simplifyScopeHash([existing, edited]), digest);
  }
  assert.notEqual(simplifyScopeHash([{...existing, content: Buffer.from([0, 254])}, missing]), digest);
  assert.throws(() => simplifyScopeHash([existing, {...existing, path: './src/a'}]), /duplicate/);
  assert.throws(() => simplifyScopeHash([{path: '../a', content: null}]));
  assert.throws(() => simplifyScopeHash([{path: 'src/a'}]));
});

test('a genuine Git diff supplies zero-context ranges for additions, deletions and a same-file escape', t => {
  const root = mkdtempSync(join(tmpdir(), 'simplify-patch-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const original = join(root, 'original');
  const candidate = join(root, 'candidate');
  const input = applyToBatches([1]);
  const path = input.scope.files[0].path;
  function inspect(left, right) {
    writeFileSync(original, left);
    writeFileSync(candidate, right);
    const run = spawnSync('git', ['-c', 'color.ui=false', 'diff', '--no-index', '--no-ext-diff',
      '--no-textconv', '--unified=0', '--inter-hunk-context=0', '--', original, candidate], {encoding: 'utf8'});
    assert.equal(run.status, 1, run.error?.message || run.stderr);
    return run.stdout;
  }
  const initial = 'a\nb\nc\nd\ne\n';
  const patch = inspect(initial, 'A\nb\nc\nd\nE\n');
  const hunks = simplifyPatchHunks(path, patch);
  assert.deepEqual(hunks, [{path, start: 1, count: 1}, {path, start: 5, count: 1}]);
  input.action = 'apply-current-diff';
  input.scope.files[0].allowed_hunks = [{start: 1, count: 1}];
  input.passes[0].hunks = hunks;
  expectBlocked(input, /hunk outside/);
  assert.deepEqual(simplifyPatchHunks(path, inspect('', 'new')), [{path, start: 0, count: 0}]);
  assert.deepEqual(simplifyPatchHunks(path, inspect('old', '')), [{path, start: 1, count: 1}]);
  assert.throws(() => simplifyPatchHunks(path, patch + patch), /single-file/);
  assert.throws(() => simplifyPatchHunks(path, patch.slice(0, patch.lastIndexOf('+E'))), /incomplete/);
  assert.throws(() => simplifyPatchHunks(path, inspect(Buffer.from([0, 1]), Buffer.from([0, 2]))));
  assert.equal(containsHunk({start: 0, count: 0}, {start: 0, count: 0}), true);
  assert.equal(containsHunk({start: 0, count: 0}, {start: 1, count: 1}), false);
  const current = 'keep\ninnocent\n';
  // A line removed by the task leaves a gap in the pre-Simplify worktree.
  input.scope.files[0].allowed_hunks = simplifyPatchHunks(path, inspect('keep\nremoved\ninnocent\n', current), 'new');
  assert.deepEqual(input.scope.files[0].allowed_hunks, [{path, start: 1, count: 0}]);
  input.passes[0].hunks = simplifyPatchHunks(path, inspect(current, 'keep\nchanged\n'));
  expectBlocked(input, /hunk outside/);
  // A line added by the task is a real line the refactor may edit.
  input.scope.files[0].allowed_hunks = simplifyPatchHunks(path, inspect('innocent\n', current), 'new');
  input.passes[0].hunks = simplifyPatchHunks(path, inspect(current, 'KEEP\ninnocent\n'));
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
  assert.throws(() => simplifyPatchHunks(path, patch, 'unknown'));
});

test('each distinct old-side range counts once across two passes, even after a rollback', () => {
  const input = applyToBatches([1]);
  const [first] = input.passes;
  const path = first.changed_paths[0];
  first.hunks = Array.from({length: 20}, (_, i) => ({path, start: 2 * i + 1, count: 1}));
  input.passes.push({...first, pass: 2, reverted: true, verification_result: 'FAILED',
    changed_paths: ['./' + path], hunks: [{path, start: 1, count: 1}]});
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
  input.passes[1].hunks[0].start = 41;
  expectBlocked(input, /hunk limit/);
});

test('full rollback binds the final receipt to restored bytes and grants no write', () => {
  const input = applyToBatches([1]);
  Object.assign(input.passes[0], {reverted: true, verification_result: 'FAILED'});
  expectBlocked(input, /rollback.*snapshot/);
  input.behavior_evidence.after.diff_scope_hash = input.final_diff_scope_hash = input.baseline.diff_scope_hash;
  const result = evaluateSimplifyContract(input);
  assert.equal(result.status, 'reverted');
  assert.equal(result.write_authorized, false);
});
