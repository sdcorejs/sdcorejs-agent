import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, symlinkSync, unlinkSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as simplify from '../../_refs/simplify/simplify-contract.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import { documentedSimplifyContext, simplifyFixture, sourcePath, originalSource, simplifiedSource, owner } from './support/simplify-contract-fixture.mjs';

import {
  evaluateSimplifyContract,
  protectedSimplifySurfaces,
} from '../../_refs/simplify/simplify-contract.mjs';

function contract(overrides = {}) {
  const revision = 'a'.repeat(40);
  return {
    schema_version: 1,
    action: 'apply-explicit-scope',
    invocation: 'approved-plan',
    artifact_identity: {
      owner_repository_id: 'github.com/acme/module-a',
      owner_module_id: 'module-a',
      execution_host_repository_id: 'github.com/acme/portal',
    },
    current_repository_id: 'github.com/acme/module-a',
    source_revision: revision,
    approved_plan_step: {
      step_id: 'simplify-module-a',
      owner_repository_id: 'github.com/acme/module-a',
      allowed_paths: ['src/module-a'],
    },
    baseline: { result: 'PASSED' },
    scope: {
      files: [{ path: 'src/module-a/format.ts', surfaces: [] }],
    },
    passes: [
      {
        pass: 1,
        changed_paths: ['src/module-a/format.ts'],
        verification_result: 'PASSED',
        reverted: false,
      },
    ],
    behavior_evidence: {
      before: { command: 'npm test -- format', result: 'PASSED' },
      after: {
        command: 'npm test -- format',
        result: 'PASSED',
        source_revision: revision,
      },
    },
    simplify_repair_recursion_depth: 1,
    ...overrides,
  };
}

test('case-simplify-hardening-ac-002 document payload is the executable schema', () => {
  const context = documentedSimplifyContext();
  assert.equal(context.phase, 'preflight');
  assert.deepEqual(context.verification.after, []);
  assert.equal(context.preflight_ref, null);
});

test('case-simplify-hardening-ac-003 before-only authority then actual focused verification', async t => {
  const f = await simplifyFixture(t);
  const pre = f.preflight();
  assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  assert.notEqual(pre.status, 'verified');
  const post = f.finish(pre);
  assert.equal(post.status, 'verified', JSON.stringify(post));
  assert.equal(post.write_authorized, false);
  assert.equal(post.context.verification.behavior_verification, 'covered-by-current-tests');
  assert.deepEqual(post.context.result.files_changed, [sourcePath]);
  assert.equal(simplify.evaluateSimplifyConsumer(post.context, { ...f.runtime, consumer: 'sdcorejs-ship' }).status, 'verified');
});

for (const [name, mutate] of [
  ['empty', c => { c.scope.requested = []; c.scope.eligible_files = []; c.scope.eligible_hunks = []; }],
  ['outside user authority', c => { c.scope.requested = ['src/other.mjs']; c.scope.eligible_files = ['src/other.mjs']; c.scope.eligible_hunks[0].path = 'src/other.mjs'; }],
  ['self-approved expansion', c => { c.scope.expansions = [{ path: 'src/other.mjs', approved: true }]; }],
  ['untrusted plan step', c => { c.invocation = 'approved-plan'; c.approved_plan_step = { step_id: 'fake', owner_repository_id: c.artifact_identity.owner_repository_id, allowed_paths: [sourcePath] }; }],
]) {
  test(`case-simplify-hardening-ac-004 scope rejects ${name}`, async t => {
    const f = await simplifyFixture(t); mutate(f.context);
    assert.equal(f.preflight().write_authorized, false);
  });
}

for (const target of ['../outside.mjs', 'src/../../outside.mjs', '/tmp/outside.mjs', 'C:/outside.mjs', 'C:outside.mjs', '\\\\server\\share\\outside.mjs', 'src\\value.mjs', 'src/value.mjs:stream']) {
  test(`case-simplify-hardening-ac-005 reject unsafe path ${target}`, async t => {
    const f = await simplifyFixture(t);
    f.context.scope.requested = [target]; f.context.scope.eligible_files = [target];
    f.context.scope.eligible_hunks[0].path = target;
    assert.equal(f.preflight().write_authorized, false);
  });
}

test('case-simplify-hardening-ac-005 root, nested Git root and junction containment', async t => {
  const f = await simplifyFixture(t), other = await simplifyFixture(t);
  f.context.target_root = other.root;
  assert.equal(f.preflight().write_authorized, false);
  f.context.target_root = f.root;
  symlinkSync(other.root, path.join(f.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  f.context.scope.eligible_files = ['linked/src/value.mjs']; f.context.scope.requested = ['linked/src/value.mjs'];
  f.context.scope.eligible_hunks[0].path = 'linked/src/value.mjs';
  assert.equal(f.preflight().write_authorized, false);
  unlinkSync(path.join(f.root, 'linked'));
  mkdirSync(path.join(f.root, 'src/.git'));
  f.context.scope.eligible_files = [sourcePath]; f.context.scope.requested = [sourcePath];
  f.context.scope.eligible_hunks[0].path = sourcePath;
  assert.equal(f.preflight().write_authorized, false);
});

for (const hidden of ['src/other.mjs', 'package.json', 'codex/skills/generated.mjs', 'build/generated.mjs', 'test/oracle.mjs']) {
  test(`case-simplify-hardening-ac-004 actual omitted write: ${hidden}`, async t => {
    const f = await simplifyFixture(t); const pre = f.preflight();
    assert.equal(pre.write_authorized, true);
    f.write(hidden, 'export const hidden = true;\n');
    const post = structuredClone(f.context);
    post.phase = 'postflight'; post.preflight_ref = pre.preflight_ref; post.passes = f.session.ledger();
    const result = simplify.evaluateSimplifyPostflight(post, f.runtime);
    assert.equal(result.status, 'blocked');
    assert.ok(result.actual_changed_paths.includes(hidden), JSON.stringify(result));
  });
}

test('case-simplify-hardening-ac-004 guarded edits reject outside hunks and preserve dirty user content', async t => {
  const f = await simplifyFixture(t, { setup: ({ write }) => write('notes.txt', 'user-owned\n') });
  const pre = f.preflight();
  assert.throws(() => f.session.applyEdits(pre.preflight_ref, [{ path: 'notes.txt', content: 'overwritten' }]), /scope|protected/u);
  assert.equal(f.finish(pre).status, 'verified');
  const g = await simplifyFixture(t, { session: { user_scope: [{ path: sourcePath, start_line: 2, end_line: 3 }] } });
  g.context.scope.eligible_hunks = [{ path: sourcePath, start_line: 2, end_line: 3 }];
  const restricted = g.preflight();
  assert.equal(restricted.write_authorized, true, JSON.stringify(restricted));
  assert.throws(() => g.session.applyEdits(restricted.preflight_ref, [{ path: sourcePath, content: originalSource.replace('value(input)', 'other(input)') }]), /hunk/u);
});

test('case-simplify-hardening-ac-006 missing oracle and blank commands never grant Apply', async t => {
  const f = await simplifyFixture(t, { noBaseline: true });
  assert.equal(f.preflight().write_authorized, false);
  for (const command of [[], [''], ['   '], undefined]) {
    assert.throws(() => f.session.runVerification({ ...f.command, command }), /command/u);
  }
  const g = await simplifyFixture(t, { session: { verify_preservation: null } });
  assert.equal(g.preflight().write_authorized, false);
});

test('case-simplify-hardening-ac-007 same HEAD changed bytes invalidates evidence and authority', async t => {
  const f = await simplifyFixture(t); const pre = f.preflight(); const head = f.context.source_revision;
  f.write(sourcePath, simplifiedSource);
  assert.equal(f.git('rev-parse', 'HEAD').trim(), head);
  assert.throws(() => f.session.applyEdits(pre.preflight_ref, [{ path: sourcePath, content: originalSource }]), /stale/u);
  assert.equal(f.preflight().write_authorized, false);
});

test('case-simplify-hardening-ac-008 Analyze detects hidden source edits without a ledger', async t => {
  const f = await simplifyFixture(t); f.context.action = 'analyze-explicit-scope';
  const pre = f.preflight(); assert.equal(pre.write_authorized, false); assert.equal(pre.status, 'analyzed');
  f.write(sourcePath, simplifiedSource);
  const post = { ...f.context, phase: 'postflight', preflight_ref: pre.preflight_ref, passes: [] };
  assert.equal(simplify.evaluateSimplifyPostflight(post, f.runtime).status, 'blocked');
});

test('case-simplify-hardening-ac-009 failed pass requires actual rollback; repair ends simplify', async t => {
  const f = await simplifyFixture(t); const pre = f.preflight();
  const failed = f.finish(pre, [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
  assert.equal(failed.status, 'blocked');
  const fake = structuredClone(failed.context); fake.passes[0].reverted = true;
  assert.equal(simplify.evaluateSimplifyPostflight(fake, f.runtime).status, 'blocked');
  assert.equal(f.preflight().write_authorized, false);
  f.write(sourcePath, originalSource);
  const rollback = structuredClone(failed.context); rollback.passes = f.session.ledger();
  rollback.verification.after = f.context.verification.before;
  assert.equal(simplify.evaluateSimplifyPostflight(rollback, f.runtime).status, 'blocked', 'old baseline receipts cannot pretend to be rerun after rollback');
  rollback.passes = f.session.ledger();
  rollback.verification.after = [f.session.runVerification(f.command)];
  assert.equal(simplify.evaluateSimplifyPostflight(rollback, f.runtime).context.result.status, 'reverted');
  f.session.recordRepair();
  f.context.baseline.snapshot = f.session.captureSnapshot(); f.context.passes = [];
  f.context.verification.before = [f.session.runVerification(f.command)];
  assert.equal(f.preflight().write_authorized, false);
});

test('case-simplify-hardening-ac-009 omitted ledger cannot reset pass cap', async t => {
  const f = await simplifyFixture(t);
  let result = f.finish(f.preflight());
  for (const pass of [2, 3]) {
    Object.assign(f.context, result.context, { phase: 'preflight', preflight_ref: null });
    f.context.scope.eligible_hunks = [{ path: sourcePath, start_line: 1, end_line: pass === 2 ? 3 : 4 }];
    f.context.baseline.snapshot = f.session.captureSnapshot();
    f.context.verification.before = [f.session.runVerification(f.command)];
    f.context.verification.after = [];
    const authorization = f.preflight();
    if (pass === 2) {
      assert.equal(authorization.write_authorized, true, JSON.stringify(authorization));
      result = f.finish(authorization, [{ path: sourcePath, content: originalSource }]);
      assert.equal(result.status, 'verified', JSON.stringify(result));
    } else {
      assert.equal(authorization.write_authorized, false);
      f.context.passes = [];
      assert.equal(f.preflight().write_authorized, false);
    }
  }
});

test('case-simplify-hardening-ac-009 completed pass cannot clear a later failed pass', async t => {
  const f = await simplifyFixture(t);
  const first = f.finish(f.preflight());
  assert.equal(first.status, 'verified');
  Object.assign(f.context, structuredClone(first.context), { phase: 'preflight', preflight_ref: null });
  f.context.scope.eligible_hunks = [{ path: sourcePath, start_line: 1, end_line: 3 }];
  f.context.baseline.snapshot = f.session.captureSnapshot();
  f.context.verification.before = [f.session.runVerification(f.command)];
  f.context.verification.after = [];
  const failed = f.finish(f.preflight(), [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
  assert.equal(failed.status, 'blocked');
  // A passing fix is not the exact checkpoint rollback required for pass two.
  f.write(sourcePath, simplifiedSource.replace('+ 1', '+ 1 + 0'));
  const replay = structuredClone(first.context);
  replay.passes = f.session.ledger();
  replay.verification.after = [f.session.runVerification(f.command)];
  const history = f.session.ledger();
  assert.equal(simplify.evaluateSimplifyPostflight(replay, f.runtime).status, 'blocked');
  assert.deepEqual(f.session.ledger(), history, 'completed pass replay cannot rewrite history');
  assert.equal(simplify.evaluateSimplifyConsumer(failed.context, { ...f.runtime, consumer: 'sdcorejs-repair-loop' }).status, 'blocked');
});

test('case-simplify-hardening-ac-010 stale postflight and protected literal changes block consumers', async t => {
  const f = await simplifyFixture(t); const result = f.finish(f.preflight());
  f.write(sourcePath, originalSource);
  for (const consumer of ['sdcorejs-test', 'sdcorejs-review', 'sdcorejs-repair-loop', 'sdcorejs-ship', 'sdcorejs-git']) {
    const verdict = simplify.evaluateSimplifyConsumer(result.context, { ...f.runtime, consumer });
    assert.equal(verdict.evidence_current, false, consumer);
  }
  const g = await simplifyFixture(t);
  const drift = g.finish(g.preflight(), [{ path: sourcePath, content: simplifiedSource.replace('return input', 'const label = "changed";\n  return input') }]);
  assert.equal(drift.status, 'blocked');
});

function approvedFixturePlan(revision, allowed) {
  const step = { step_id: 'simplify-source', owner_repository_id: owner, allowed_paths: allowed, prohibited_paths: [] };
  const artifact = createApprovedArtifact({ metadata: {
    schema_version: 1, artifact_id: 'fixture-approved-plan', artifact_kind: 'plan', contract_id: 'simplify-fixture',
    requirement_id: 'fixture', change_ref: 'fixture', track: 'workflow', stack_profile: 'node-general',
    owner_repository_id: owner, owner_repository_role: 'standalone', owner_module_id: null,
    parent_repository_id: null, parent_references: [], approval_source: 'fixture-user-approval', approved_by: 'fixture-user',
    approved_at: '2026-09-22T00:00:00.000Z', repository_relative_path: '.sdcorejs/plans/fixture.md', source_revision: revision,
    allowed_paths: ['src/**'], prohibited_paths: [], supersedes: null,
  }, body: JSON.stringify({ steps: [step] }) });
  return { artifact, parents: [], approval_hash: artifact.metadata.approval_hash, step_id: step.step_id,
    resolve_step: ({ artifact: loaded, step_id: id }) => JSON.parse(loaded.body).steps.find(item => item.step_id === id) };
}

test('case-simplify-hardening-ac-004 approved artifact scope intersects user source scope', async t => {
  const f = await simplifyFixture(t, { session: ({ revision }) => ({ approved_plan: approvedFixturePlan(revision, ['src/other.mjs']) }) });
  assert.match(f.preflight().blockers.join(' '), /plan scope/u);
  const g = await simplifyFixture(t, { session: ({ revision }) => ({ approved_plan: approvedFixturePlan(revision, ['src/**']) }) });
  assert.equal(g.finish(g.preflight()).status, 'verified');
});

test('case-simplify-hardening-ac-006 a command that writes source cannot certify it', async t => {
  const mutatingCommand = { command: [process.execPath, '-e', "require('node:fs').appendFileSync('src/value.mjs', '// mutated\\n')"], cwd: '.', scope: [{ path: sourcePath, start_line: 1, end_line: 4 }] };
  const f = await simplifyFixture(t, { noBaseline: true, session: { verification_commands: [mutatingCommand] } });
  const receipt = f.session.runVerification(mutatingCommand);
  const artifact = f.session.evidenceArtifacts().find(a => a.metadata.approval_hash === receipt.approval_hash);
  const body = JSON.parse(artifact.body);
  assert.equal(body.exit_code, 0);
  assert.equal(body.result, 'failed');
  assert.equal(body.content_stable, false);
  f.context.verification.before = [receipt];
  f.context.baseline.snapshot = f.session.captureSnapshot();
  assert.equal(f.preflight().write_authorized, false);
});

test('case-simplify-hardening-ac-007 forged sessions and foreign snapshot receipts are rejected', async t => {
  const f = await simplifyFixture(t), g = await simplifyFixture(t);
  assert.equal(simplify.evaluateSimplifyPreflight(f.context, { session: { id: f.session.id } }).write_authorized, false);
  f.context.baseline.snapshot = g.session.captureSnapshot();
  assert.equal(f.preflight().write_authorized, false);
  const { createSimplifyEvidenceSession } = await import('../../_refs/simplify/repository-evidence.mjs');
  assert.throws(() => createSimplifyEvidenceSession({ root: f.root, repository_id: owner, change_ref: f.context.artifact_context.change_ref }), /history cannot be reset/u);
});

for (const kind of ['delete', 'rename', 'staged', 'untracked']) {
  test(`case-simplify-hardening-ac-004 snapshot detects omitted ${kind} change`, async t => {
    const f = await simplifyFixture(t), authorization = f.preflight();
    if (kind === 'delete' || kind === 'rename') unlinkSync(path.join(f.root, sourcePath));
    if (kind === 'rename') f.write('src/renamed.mjs', originalSource);
    if (kind === 'staged') { f.write(sourcePath, simplifiedSource); f.git('add', sourcePath); }
    if (kind === 'untracked') f.write('src/new.mjs', 'export const added = true;\n');
    const c = { ...f.context, phase: 'postflight', preflight_ref: authorization.preflight_ref, passes: f.session.ledger() };
    const result = simplify.evaluateSimplifyPostflight(c, f.runtime);
    assert.equal(result.status, 'blocked');
    assert.ok(result.actual_changed_paths.length);
  });
}

test('case-simplify-hardening-ac-004 dirty selected source remains user-owned by default', async t => {
  const f = await simplifyFixture(t, { setup: ({ write }) => write(sourcePath, originalSource + '// user-owned\n') });
  assert.match(f.preflight().blockers.join(' '), /ownership/u);
});

test('case-simplify-hardening-ac-009 protected classification and declared cap cannot be waived', async t => {
  const f = await simplifyFixture(t, { session: { classify_source: () => ({ kind: 'executable', hunks: [{ path: sourcePath, start_line: 1, end_line: 4 }], protected_surfaces: ['approval-checks'] }) } });
  assert.match(f.preflight().blockers.join(' '), /protected/u);
  f.context.limits.max_passes = 3;
  assert.match(f.preflight().blockers.join(' '), /caps/u);
});

test('case-simplify-hardening-ac-004 current-diff hunks preserve adjacent user changes', async t => {
  const selected = [{ path: sourcePath, start_line: 2, end_line: 2 }];
  const f = await simplifyFixture(t, {
    setup: ({ write }) => write(sourcePath, originalSource.replace('input + 1', '1 + input') + '// user-owned\n'),
    session: { workflow_hunks: selected, user_owned_hunks: [{ path: sourcePath, start_line: 5, end_line: 5 }] },
  });
  f.context.action = 'apply-current-diff'; f.context.scope.eligible_hunks = selected;
  const authorization = f.preflight();
  assert.equal(authorization.write_authorized, true, JSON.stringify(authorization));
  assert.throws(() => f.session.applyEdits(authorization.preflight_ref, [{ path: sourcePath, content: originalSource }]), /hunk/u);
  const result = f.finish(authorization, [{ path: sourcePath, content: originalSource + '// user-owned\n' }]);
  assert.equal(result.status, 'verified', JSON.stringify(result));
  assert.match(readFileSync(path.join(f.root, sourcePath), 'utf8'), /user-owned/u);
});

test('case-simplify-hardening-ac-009 actual hunk cap is enforced before any edit', async t => {
  const content = originalSource + Array.from({ length: 22 }, (_, i) => `const local${i} = ${i};\n\n`).join('');
  const range = [{ path: sourcePath, start_line: 1, end_line: 48 }];
  const f = await simplifyFixture(t, {
    initial: ({ write }) => write(sourcePath, content),
    session: ({ command }) => ({ user_scope: range, classify_source: () => ({ kind: 'executable', hunks: range, protected_surfaces: [] }), verification_commands: [{ ...command, scope: range }] }),
  });
  f.context.scope.eligible_hunks = range;
  const pre = f.preflight(); assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  const candidate = content.replace(/(const local\d+ = \d+);/gu, '$1 + 0;');
  assert.throws(() => f.session.applyEdits(pre.preflight_ref, [{ path: sourcePath, content: candidate }]), /hunk cap/u);
  assert.equal(readFileSync(path.join(f.root, sourcePath), 'utf8'), content);
});

test('case-simplify-hardening-ac-009 rejected actual hunk cap is retained after rollback', async t => {
  const content = originalSource + Array.from({ length: 22 }, (_, i) => `const local${i} = ${i};\n\n`).join('');
  const range = [{ path: sourcePath, start_line: 1, end_line: 48 }];
  const f = await simplifyFixture(t, {
    initial: ({ write }) => write(sourcePath, content),
    session: ({ command }) => ({ user_scope: range, classify_source: () => ({ kind: 'executable', hunks: range, protected_surfaces: [] }), verification_commands: [{ ...command, scope: range }] }),
  });
  f.context.scope.eligible_hunks = range;
  const pre = f.preflight(); assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  f.write(sourcePath, content.replace(/(const local\d+ = \d+);/gu, '$1 + 0;'));
  const post = { ...structuredClone(f.context), phase: 'postflight', preflight_ref: pre.preflight_ref, passes: f.session.ledger() };
  post.verification.after = [f.session.runVerification(f.command)];
  const failed = simplify.evaluateSimplifyPostflight(post, f.runtime);
  assert.equal(failed.status, 'blocked');
  assert.equal(f.session.ledger()[0].hunks.length, 22, 'scope rejection must not erase observed hunks');
  f.write(sourcePath, content);
  const rollback = structuredClone(failed.context);
  rollback.verification.after = [f.session.runVerification(f.command)];
  const restored = simplify.evaluateSimplifyPostflight(rollback, f.runtime);
  assert.equal(restored.context.result.status, 'reverted', JSON.stringify(restored));
  assert.equal(f.session.ledger()[0].hunks.length, 22);
  Object.assign(f.context, restored.context, { phase: 'preflight', preflight_ref: null });
  f.context.baseline.snapshot = f.session.captureSnapshot();
  f.context.verification.before = [f.session.runVerification(f.command)];
  assert.match(f.preflight().blockers.join(' '), /hunk cap exhausted/u);
});

for (const kind of ['binary-hunks', 'unobservable-snapshot']) {
  test(`case-simplify-hardening-ac-009 unknown failed hunk history cannot become zero cost: ${kind}`, async t => {
    const f = await simplifyFixture(t), pre = f.preflight();
    assert.equal(pre.write_authorized, true, JSON.stringify(pre));
    const link = path.join(f.root, 'unobservable-link');
    if (kind === 'binary-hunks') f.write(sourcePath, originalSource + '\0');
    else symlinkSync(f.root, link, process.platform === 'win32' ? 'junction' : 'dir');
    const post = { ...structuredClone(f.context), phase: 'postflight', preflight_ref: pre.preflight_ref, passes: f.session.ledger() };
    const failed = simplify.evaluateSimplifyPostflight(post, f.runtime);
    assert.equal(failed.status, 'blocked');
    assert.equal(f.session.ledger()[0].verification_result, 'failed');
    if (kind === 'binary-hunks') f.write(sourcePath, originalSource);
    else unlinkSync(link);
    post.passes = f.session.ledger();
    post.verification.after = [f.session.runVerification(f.command)];
    const restored = simplify.evaluateSimplifyPostflight(post, f.runtime);
    assert.equal(restored.context.result.status, 'reverted', JSON.stringify(restored));
    Object.assign(f.context, restored.context, { phase: 'preflight', preflight_ref: null });
    f.context.baseline.snapshot = f.session.captureSnapshot();
    f.context.verification.before = [f.session.runVerification(f.command)];
    assert.match(f.preflight().blockers.join(' '), /hunk history is unproven/u);
  });
}

test('case-simplify-hardening-ac-004 a later pass cannot reuse shifted user-owned line coordinates', async t => {
  const f = await simplifyFixture(t, { session: { user_scope: [{ path: sourcePath, start_line: 2, end_line: 3 }], user_owned_hunks: [{ path: sourcePath, start_line: 4, end_line: 4 }] } });
  f.context.scope.eligible_hunks = [{ path: sourcePath, start_line: 2, end_line: 3 }];
  const first = f.finish(f.preflight());
  assert.equal(first.status, 'verified', JSON.stringify(first));
  Object.assign(f.context, first.context, { phase: 'preflight', preflight_ref: null });
  f.context.baseline.snapshot = f.session.captureSnapshot(); f.context.verification.before = [f.session.runVerification(f.command)]; f.context.verification.after = [];
  assert.match(f.preflight().blockers.join(' '), /hunk coordinates changed/u);
});

test('case-simplify-hardening-ac-009 five per pass and eight total files are hard limits', async t => {
  const files = [sourcePath, ...Array.from({ length: 8 }, (_, i) => `src/helper${i}.mjs`)];
  const ranges = files.map(file => ({ path: file, start_line: 1, end_line: 4 }));
  const f = await simplifyFixture(t, {
    initial: ({ write }) => {
      for (const file of files) write(file, originalSource);
      write('oracle.mjs', `import assert from 'node:assert/strict';\nfor (const file of ${JSON.stringify(files)}) { const {value} = await import('./' + file); for (const n of [-1,0,8]) assert.equal(value(n), n + 1); }\n`);
    },
    session: ({ command }) => ({ user_scope: ranges, classify_source: () => ({ kind: 'executable', hunks: ranges, protected_surfaces: [] }), verification_commands: [{ ...command, scope: ranges }] }),
  });
  const select = selected => { f.context.scope.requested = selected; f.context.scope.eligible_files = selected; f.context.scope.eligible_hunks = ranges.filter(h => selected.includes(h.path)); };
  select(files.slice(0, 6));
  assert.match(f.preflight().blockers.join(' '), /file\/hunk cap/u);
  select(files.slice(0, 5));
  const first = f.finish(f.preflight(), files.slice(0, 5).map(file => ({ path: file, content: simplifiedSource })));
  assert.equal(first.status, 'verified', JSON.stringify(first));
  Object.assign(f.context, first.context, { phase: 'preflight', preflight_ref: null });
  f.context.baseline.snapshot = f.session.captureSnapshot(); f.context.verification.before = [f.session.runVerification(f.command)]; f.context.verification.after = [];
  select(files.slice(5));
  assert.match(f.preflight().blockers.join(' '), /total file cap/u);
  select(files.slice(5, 8));
  const last = f.finish(f.preflight(), files.slice(5, 8).map(file => ({ path: file, content: simplifiedSource })));
  assert.equal(last.status, 'verified', JSON.stringify(last));
});

test('every critical simplify surface is protected', () => {
  for (const surface of protectedSimplifySurfaces) {
    const result = evaluateSimplifyContract(
      contract({
        scope: {
          files: [{ path: 'src/module-a/security.ts', surfaces: [surface] }],
        },
      }),
    );
    assert.equal(result.write_authorized, false, surface);
    assert.match(result.blockers.join(' '), /protected simplify surface/iu);
  }
});

test('legacy evidence is read-only and cannot authorize writes', () => {
  const result = evaluateSimplifyContract(contract());
  assert.equal(result.write_authorized, false);
  assert.notEqual(result.status, 'verified');
  assert.equal(result.owner_repository_id, 'github.com/acme/module-a');
});

test('simplify enforces two passes and rollback of a failed pass', () => {
  const failed = evaluateSimplifyContract(
    contract({
      passes: [
        {
          pass: 1,
          changed_paths: ['src/module-a/format.ts'],
          verification_result: 'FAILED',
          reverted: false,
        },
      ],
    }),
  );
  assert.match(failed.blockers.join(' '), /not rolled back/iu);

  const tooMany = evaluateSimplifyContract(
    contract({
      passes: [1, 2, 3].map((pass) => ({
        pass,
        changed_paths: ['src/module-a/format.ts'],
        verification_result: 'PASSED',
        reverted: false,
      })),
    }),
  );
  assert.match(tooMany.blockers.join(' '), /pass cap exceeded/iu);
});

test('analyze mode is read-only and generated mirrors are excluded', () => {
  const analyze = evaluateSimplifyContract(
    contract({
      action: 'analyze-explicit-scope',
      passes: [
        {
          pass: 1,
          changed_paths: ['src/module-a/format.ts'],
          verification_result: 'PASSED',
        },
      ],
    }),
  );
  assert.match(analyze.blockers.join(' '), /analyze mode must remain read-only/iu);

  const mirror = evaluateSimplifyContract(
    contract({
      scope: {
        files: [{ path: 'codex/skills/sdcorejs-test/SKILL.md', surfaces: [] }],
      },
    }),
  );
  assert.match(mirror.blockers.join(' '), /generated mirror/iu);
});

test('cross-root writes and simplify/repair recursion are denied', () => {
  const crossRoot = evaluateSimplifyContract(
    contract({ current_repository_id: 'github.com/acme/portal' }),
  );
  assert.match(crossRoot.blockers.join(' '), /outside the semantic owner/iu);

  const recursion = evaluateSimplifyContract(
    contract({ simplify_repair_recursion_depth: 2 }),
  );
  assert.match(recursion.blockers.join(' '), /recursion is forbidden/iu);
});

test('public behavior changes return to spec/plan and line count is not a goal', () => {
  const behavior = evaluateSimplifyContract(
    contract({ public_behavior_change: true }),
  );
  assert.equal(behavior.status, 'planning-handoff');
  assert.match(behavior.blockers.join(' '), /spec\/plan revision/iu);

  const lineCount = evaluateSimplifyContract(contract({ goal: 'line-count-only' }));
  assert.match(lineCount.blockers.join(' '), /line count cannot be the sole/iu);
});

// Keep the original adversarial v1 payloads as compatibility regressions. The
// document-driven v2 suite below exercises actual observation and execution.
for (const [name, mutate] of [
  ['empty scope with write', c => { c.scope.files = []; }],
  ['write outside declared scope', c => { c.passes[0].changed_paths = ['src/other.ts']; }],
  ['write outside plan scope', c => { c.approved_plan_step.allowed_paths = ['other']; }],
  ['hidden generated write', c => { c.actual_changed_paths = ['codex/skills/generated.ts']; }],
  ['hidden protected write', c => { c.actual_changed_paths = ['package.json']; }],
  ['traversal', c => { c.scope.files[0].path = '../outside.ts'; }],
  ['nested traversal', c => { c.scope.files[0].path = 'src/../../outside.ts'; }],
  ['absolute path', c => { c.scope.files[0].path = '/outside.ts'; }],
  ['other Git root', c => { c.target_root = '/another-repo'; }],
  ['symlink claim', c => { c.scope.files[0].path = 'link/outside.ts'; }],
  ['missing commands', c => { delete c.behavior_evidence.before.command; delete c.behavior_evidence.after.command; }],
  ['empty commands', c => { c.behavior_evidence.before.command = ''; c.behavior_evidence.after.command = ''; }],
  ['blank commands', c => { c.behavior_evidence.before.command = ' '; c.behavior_evidence.after.command = ' '; }],
  ['same HEAD different content', c => { c.source_fingerprint = 'changed'; c.behavior_evidence.after.source_fingerprint = 'old'; }],
  ['Analyze hidden write', c => { c.action = 'analyze-explicit-scope'; c.passes = []; c.actual_changed_paths = ['src/module-a/format.ts']; }],
  ['lowercase failed pass', c => { c.passes[0].verification_result = 'failed'; }],
  ['pass id beyond cap', c => { c.passes[0].pass = 3; }],
  ['reset repair depth', c => { c.simplify_repair_recursion_depth = 0; c.workflow_history = ['simplify', 'repair', 'simplify']; }],
]) {
  test(`case-simplify-hardening-ac-001 legacy regression: ${name}`, () => {
    const c = contract();
    mutate(c);
    const result = evaluateSimplifyContract(c);
    assert.equal(result.write_authorized, false, JSON.stringify(result));
    assert.notEqual(result.status, 'verified');
  });
}
