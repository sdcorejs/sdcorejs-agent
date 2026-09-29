import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, symlinkSync, unlinkSync, readFileSync, renameSync } from 'node:fs';
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
    // Audit repair A1: links are now observable metadata, so an unobservable
    // snapshot is modelled by making the Git root itself unavailable.
    const gitDir = path.join(f.root, '.git'), hiddenGitDir = path.join(f.root, '.git-unavailable');
    if (kind === 'binary-hunks') f.write(sourcePath, originalSource + '\0');
    else renameSync(gitDir, hiddenGitDir);
    const post = { ...structuredClone(f.context), phase: 'postflight', preflight_ref: pre.preflight_ref, passes: f.session.ledger() };
    const failed = simplify.evaluateSimplifyPostflight(post, f.runtime);
    assert.equal(failed.status, 'blocked');
    assert.equal(f.session.ledger()[0].verification_result, 'failed');
    if (kind === 'binary-hunks') f.write(sourcePath, originalSource);
    else renameSync(hiddenGitDir, gitDir);
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

// ---------------------------------------------------------------------------
// Audit repair (audit-findings-repair-20260928): simplify evidence and the
// canonical host runner. Regression-first cases for IF-1/S-1..S-7.
// ---------------------------------------------------------------------------
import { linkSync as repairLinkSync, mkdtempSync as repairMkdtemp, realpathSync as repairRealpath, rmSync as repairRm, writeFileSync as repairWrite, readFileSync as repairRead } from 'node:fs';
import { spawnSync as repairSpawn, execFileSync as repairExec } from 'node:child_process';
import { createHash as repairHash } from 'node:crypto';
import { tmpdir as repairTmp } from 'node:os';
import { fileURLToPath as repairFileUrl } from 'node:url';
import { stringify as repairStringify } from 'yaml';

const repairJunction = (target, link) => symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
function repairOutside(t, prefix = 'repair-outside-') {
  const root = repairMkdtemp(path.join(repairTmp(), prefix));
  t.after(() => {
    assert.equal(repairRealpath.native(path.dirname(root)), repairRealpath.native(repairTmp()));
    assert.ok(path.basename(root).startsWith(prefix));
    repairRm(root, { recursive: true, force: true });
  });
  return root;
}
const repairAnalyzeClaims = context => {
  context.verification.git_diff_check = 'passed';
  context.verification.behavior_verification = 'covered-by-current-tests';
  for (const key of Object.keys(context.preserved_surfaces)) context.preserved_surfaces[key] = 'verified';
};

// AC-001 / AC-003 (session part) -----------------------------------------------
test('case-repair-observer-real-repo: a simplify session starts beside ignored output and ignored links', async t => {
  const outside = repairOutside(t);
  const f = await simplifyFixture(t, { setup: ({ root, write }) => {
    write('build/cache.bin', 'x'.repeat(4096)); repairJunction(outside, path.join(root, 'build/link'));
  } });
  const pre = f.preflight();
  assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  assert.equal(f.finish(pre).status, 'verified');
});

test('case-repair-symlink-scope: a session scope under a junction stays blocked while outside links are metadata', async t => {
  const outside = repairOutside(t);
  const f = await simplifyFixture(t, { setup: ({ root }) => repairJunction(outside, path.join(root, 'linked')) });
  f.context.scope.eligible_files = ['linked/src/value.mjs']; f.context.scope.requested = ['linked/src/value.mjs'];
  f.context.scope.eligible_hunks = [{ path: 'linked/src/value.mjs', start_line: 1, end_line: 4 }];
  const result = f.preflight();
  assert.equal(result.write_authorized, false);
  assert.match(result.blockers.join(' '), /symlink/u);
});

// AC-002 (session part) -----------------------------------------------------------
test('case-repair-volatile-paths: verification may rewrite a declared cache; edits and drift outside windows are blocked', async t => {
  // The ignored parent directory exists before the host starts; only build/cache/** is declared volatile.
  const writerSetup = ({ write }) => { write('build/.keep', ''); write('writer.mjs', "import { mkdirSync, writeFileSync } from 'node:fs';\nimport './oracle.mjs';\nmkdirSync('build/cache', { recursive: true });\nwriteFileSync('build/cache/run.json', String(process.hrtime.bigint()));\n"); };
  const session = ({ hunks }) => ({ verification_commands: [{ command: [process.execPath, 'writer.mjs'], cwd: '.', scope: hunks }], volatile_paths: ['build/cache/**'] });
  const f = await simplifyFixture(t, { setup: writerSetup, session });
  const pre = f.preflight();
  assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  assert.throws(() => f.session.applyEdits(pre.preflight_ref, [{ path: 'build/cache/run.json', content: '{}' }]), /scope|protected|volatile/u);
  assert.equal(f.finish(pre).status, 'verified');
  const g = await simplifyFixture(t, { setup: writerSetup, session });
  g.write('build/cache/run.json', 'outside a window');
  const drift = g.preflight();
  assert.equal(drift.write_authorized, false);
  assert.match(drift.blockers.join(' '), /volatile path changed outside a host command window/u);
});

// AC-007 / S-2 ----------------------------------------------------------------------
test('case-repair-analyze-honest: Analyze never carries verified status for checks it did not run', async t => {
  const f = await simplifyFixture(t); f.context.action = 'analyze-explicit-scope';
  repairAnalyzeClaims(f.context);
  const pre = f.preflight();
  assert.equal(pre.status, 'analyzed', JSON.stringify(pre));
  const post = { ...structuredClone(f.context), phase: 'postflight', preflight_ref: pre.preflight_ref, passes: [] };
  const result = simplify.evaluateSimplifyPostflight(post, f.runtime);
  assert.equal(result.status, 'analyzed', JSON.stringify(result));
  assert.equal(result.context.verification.git_diff_check, 'not-run');
  assert.equal(result.context.verification.behavior_verification, 'not-verified');
  assert.ok(Object.values(result.context.preserved_surfaces).every(value => value === 'pending'), JSON.stringify(result.context.preserved_surfaces));
  const consumed = simplify.evaluateSimplifyConsumer(result.context, { ...f.runtime, consumer: 'sdcorejs-ship' });
  assert.equal(consumed.analysis_current, true);
  assert.equal(consumed.verification_current, false, 'Analyze is never current verification');
  const foreign = await simplifyFixture(t);
  const forged = structuredClone(post); forged.verification.before = [foreign.session.runVerification(foreign.command)];
  assert.equal(simplify.evaluateSimplifyPostflight(forged, f.runtime).status, 'blocked', 'evidence refs must resolve in this session');
});

// AC-008 / S-3 ----------------------------------------------------------------------
test('case-repair-diff-check-scope: existing whitespace outside the pass never blocks; whitespace the pass adds does', async t => {
  const dirtyDocs = { initial: ({ write }) => write('docs.md', 'clean\n'), setup: ({ write }) => write('docs.md', 'dirty trailing   \n') };
  const f = await simplifyFixture(t, dirtyDocs);
  const verified = f.finish(f.preflight());
  assert.equal(verified.status, 'verified', JSON.stringify(verified.blockers));
  assert.equal(verified.context.verification.git_diff_check, 'passed');
  const g = await simplifyFixture(t, dirtyDocs);
  const trailing = g.finish(g.preflight(), [{ path: sourcePath, content: simplifiedSource.replace('return input + 1;', 'return input + 1;   ') }]);
  assert.equal(trailing.status, 'blocked');
  assert.match(trailing.blockers.join(' '), /whitespace/u);
  const crlf = originalSource.replaceAll('\n', '\r\n');
  const h = await simplifyFixture(t, { initial: ({ write }) => write(sourcePath, crlf), setup: ({ write }) => write('docs.md', 'dirty trailing   \n') });
  const kept = h.finish(h.preflight(), [{ path: sourcePath, content: simplifiedSource.replaceAll('\n', '\r\n') }]);
  assert.equal(kept.status, 'verified', `CRLF line endings are not reported as pass whitespace: ${JSON.stringify(kept.blockers)}`);
});

// AC-009 / S-5, D-005 -----------------------------------------------------------------
test('case-repair-scoped-rollback: restoring the pass paths reverts while concurrent unrelated edits are preserved and listed', async t => {
  const f = await simplifyFixture(t); const pre = f.preflight();
  const failed = f.finish(pre, [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
  assert.equal(failed.status, 'blocked');
  // An unrelated, non-protected source edit made concurrently by the user.
  f.write('src/notes.mjs', 'export const note = 1;\n');
  f.write(sourcePath, originalSource);
  const rollback = structuredClone(failed.context); rollback.passes = f.session.ledger();
  rollback.verification.after = [f.session.runVerification(f.command)];
  const reverted = simplify.evaluateSimplifyPostflight(rollback, f.runtime);
  assert.equal(reverted.context.result.status, 'reverted', JSON.stringify(reverted.blockers));
  assert.deepEqual(reverted.context.result.concurrent_changes, ['src/notes.mjs']);
  assert.equal(repairRead(path.join(f.root, 'src/notes.mjs'), 'utf8'), 'export const note = 1;\n', 'concurrent edits are preserved');
  for (const [name, touch] of [['pass path', g => g.write(sourcePath, `${originalSource}// concurrent\n`)], ['protected path', g => g.write('package.json', '{"type":"module","private":true}\n')]]) {
    const g = await simplifyFixture(t); const gpre = g.preflight();
    const gfailed = g.finish(gpre, [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
    g.write(sourcePath, originalSource); touch(g);
    const attempt = structuredClone(gfailed.context); attempt.passes = g.session.ledger();
    attempt.verification.after = [g.session.runVerification(g.command)];
    assert.notEqual(simplify.evaluateSimplifyPostflight(attempt, g.runtime).context?.result?.status, 'reverted', `a concurrent change on the ${name} blocks rollback`);
  }
});

// AC-010 / S-6 --------------------------------------------------------------------
test('case-repair-hardlink-target: a write target with more than one link is refused before any byte is written', async t => {
  const outside = repairOutside(t);
  const alias = path.join(outside, 'alias.mjs');
  const f = await simplifyFixture(t, { setup: ({ root }) => repairLinkSync(path.join(root, sourcePath), alias) });
  const pre = f.preflight();
  assert.equal(pre.write_authorized, true, JSON.stringify(pre));
  assert.throws(() => f.session.applyEdits(pre.preflight_ref, [{ path: sourcePath, content: simplifiedSource }]), /hard link|link count/u);
  assert.equal(repairRead(alias, 'utf8'), originalSource, 'the linked file outside the root is untouched');
});

// AC-011 / S-7, D-004: canonical host runner in its own process ------------------------
const repairRunnerPath = repairFileUrl(new URL('../../_refs/simplify/host-runner.mjs', import.meta.url));
const repairSurfaces = ['return_values', 'output_shape', 'public_exports', 'public_types', 'public_API_and_signatures',
  'routes_status_errors_validation_order', 'side_effects_and_order', 'async_concurrency_transaction', 'retry_timeout_cache',
  'auth_permissions_tenant_approval', 'persistence_and_query', 'rendering_DOM_accessibility', 'telemetry_and_audit',
  'strings_and_prompts', 'framework_metadata', 'dependencies_and_config'];
const repairRunnerOwner = 'github.com/example/runner-fixture';
const repairSha = text => `sha256:${repairHash('sha256').update(text).digest('hex')}`;

function repairWriteSnapshot(root, artifact) {
  const { approval_hash: approvalHash, ...rest } = artifact.metadata;
  const file = path.join(root, artifact.metadata.repository_relative_path);
  mkdirSync(path.dirname(file), { recursive: true });
  repairWrite(file, `---\n${repairStringify(rest, { lineWidth: 80 })}approval_hash: ${approvalHash}\n---\n${artifact.body}`);
}

function repairRunnerRepository(t, { oracleImport = '', crlf = false, volatilePaths = [], oracleWritesCache = false, fakePackage = false, concurrentAppend = false, extraFiles = {} } = {}) {
  const root = repairOutside(t, 'repair-runner-');
  const write = (file, content) => { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); repairWrite(path.join(root, file), content); };
  // A CRLF working tree with core.autocrlf=true stores LF blobs (the Git for Windows default).
  write('src/value.mjs', crlf ? originalSource.replaceAll('\n', '\r\n') : originalSource);
  write('oracle.mjs', "import assert from 'node:assert/strict';\nimport {value} from './src/value.mjs';\nfor (const x of [-1,0,1,8]) assert.equal(value(x), x + 1);\n" +
    (oracleWritesCache ? "import {mkdirSync, writeFileSync} from 'node:fs';\nmkdirSync('build/cache', {recursive: true}); writeFileSync('build/cache/run.txt', String(process.hrtime.bigint()));\n" : '') +
    // A concurrent actor edits the pass path while the second verification runs.
    (concurrentAppend ? "import {appendFileSync, existsSync, mkdirSync as makeDir, readFileSync, writeFileSync as put} from 'node:fs';\nmakeDir('build', {recursive: true});\nconst count = existsSync('build/count.txt') ? Number(readFileSync('build/count.txt', 'utf8')) + 1 : 1;\nput('build/count.txt', String(count));\nif (count === 2) appendFileSync('src/value.mjs', '// concurrent\\n');\n" : ''));
  write('package.json', '{"type":"module"}\n');
  write('.gitignore', fakePackage ? 'build/\nnode_modules/\n' : 'build/\n');
  // The command window may rewrite only the declared cache; its parent directory exists beforehand.
  if (oracleWritesCache) write('build/.keep', '');
  // An installed, untracked package that a trusted oracle must never be able to load.
  if (fakePackage) {
    write('node_modules/evil-oracle/package.json', '{"name":"evil-oracle","version":"1.0.0","type":"module","exports":"./index.mjs"}\n');
    write('node_modules/evil-oracle/index.mjs', 'export default {};\nexport function parse() { return null; }\n');
  }
  write('oracles/classify.mjs', `${oracleImport}export function classify_source({ path, content }) {\n  const lines = content.toString('utf8').replace(/\\n$/u, '').split('\\n').length;\n  return path.startsWith('src/') ? { kind: 'executable', hunks: [{ path, start_line: 1, end_line: lines }], protected_surfaces: [] } : { kind: 'protected', hunks: [], protected_surfaces: ['all'] };\n}\n`);
  write('oracles/preserve.mjs', `const SURFACES = ${JSON.stringify(repairSurfaces)};\nexport function verify_preservation({ before, after }) {\n  const signature = text => String(text ?? '').match(/export function value\\(input\\)/u)?.[0];\n  const ok = Object.keys(after).every(file => signature(before[file]) === signature(after[file]));\n  return Object.fromEntries(SURFACES.map(surface => [surface, { status: ok ? 'verified' : 'blocked', reason: 'Fixture signature guard plus the executed oracle.' }]));\n}\n`);
  // Further tracked files, such as a decoy module whose literal name differs from what Node loads.
  for (const [file, content] of Object.entries(extraFiles)) write(file, content);
  const git = (...args) => repairExec('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
  git('init', '--quiet'); git('config', 'core.autocrlf', crlf ? 'true' : 'false'); git('add', '.');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'runner fixture');
  const revision = git('rev-parse', 'HEAD').trim();
  const base = { schema_version: 1, contract_id: 'runner-fixture', requirement_id: 'R-001', change_ref: 'runner-fixture', track: 'workflow',
    stack_profile: 'node-general', owner_repository_id: repairRunnerOwner, owner_repository_role: 'standalone', owner_module_id: null,
    parent_repository_id: null, source_revision: revision, approval_source: 'explicit-user-choice', approved_by: 'fixture-user',
    approved_at: '2026-09-28T00:00:00.000Z', supersedes: null };
  const spec = createApprovedArtifact({ metadata: { ...base, artifact_id: 'spec-runner-fixture-r1', artifact_kind: 'spec', parent_references: [],
    repository_relative_path: '.sdcorejs/specs/workflow/runner-fixture.md' }, body: '# Runner fixture spec\n' });
  const step = { step_id: 'simplify-src', owner_repository_id: repairRunnerOwner, allowed_paths: ['src/value.mjs'], prohibited_paths: [],
    verification_commands: [{ command: [process.execPath, 'oracle.mjs'], cwd: '.', scope: [{ path: 'src/value.mjs', start_line: 1, end_line: 4 }] }],
    oracles: { classify_source: 'oracles/classify.mjs#classify_source', verify_preservation: 'oracles/preserve.mjs#verify_preservation' } };
  const policy = { schema_version: 1, steps: [step] };
  const finishPolicy = { schema_version: 1, scope_fingerprint: repairSha(JSON.stringify(['src/value.mjs'])), test_strategy: 'regression-first',
    required_phases: ['baseline', 'verify', 'branch-ready'], decisions: {}, hooks: [], volatile_paths: volatilePaths };
  const plan = createApprovedArtifact({ metadata: { ...base, artifact_id: 'plan-runner-fixture-r1', artifact_kind: 'plan',
    parent_references: [{ repository_id: repairRunnerOwner, artifact_id: spec.metadata.artifact_id, artifact_kind: 'spec', revision, approval_hash: spec.metadata.approval_hash }],
    repository_relative_path: '.sdcorejs/plans/workflow/runner-fixture.md', allowed_paths: ['src/value.mjs'], prohibited_paths: [] },
    body: `# Runner fixture plan\n\n\`\`\`simplify-host-policy\n${JSON.stringify(policy)}\n\`\`\`\n\n\`\`\`finish-policy\n${JSON.stringify(finishPolicy)}\n\`\`\`\n` });
  repairWriteSnapshot(root, spec); repairWriteSnapshot(root, plan);
  const authority = {
    schema_version: 1, root, repository_id: repairRunnerOwner, change_ref: 'runner-fixture',
    plan: { path: plan.metadata.repository_relative_path, approval_hash: plan.metadata.approval_hash },
    parents: [{ path: spec.metadata.repository_relative_path, approval_hash: spec.metadata.approval_hash }],
    step_id: 'simplify-src', scope: { files: ['src/value.mjs'], hunks: [{ path: 'src/value.mjs', start_line: 1, end_line: 4 }] },
    workflow_hunks: [], user_owned_hunks: [], anchor: { kind: 'head' }, prior_receipts: [], repaired: false,
  };
  return { root, write, git, authority, spec, plan, revision };
}

function repairRunRunner(t, fixture, authority, request) {
  const dir = repairOutside(t, 'repair-runner-io-');
  const authorityFile = path.join(dir, 'authority.json'), requestFile = path.join(dir, 'request.json');
  repairWrite(authorityFile, JSON.stringify(authority)); repairWrite(requestFile, JSON.stringify(request));
  // A rollback pass runs verification three times; slow hosts need more than two minutes.
  const result = repairSpawn(process.execPath, [repairRunnerPath, '--authority', authorityFile, '--request', requestFile],
    { cwd: fixture.root, encoding: 'utf8', windowsHide: true, timeout: 600000 });
  if (result.error) throw result.error;
  let output = null;
  try { output = JSON.parse(result.stdout); } catch { output = null; }
  return { status: result.status, output, stderr: result.stderr };
}
const repairApply = (content = simplifiedSource, extra = {}) => ({ schema_version: 1, action: 'apply-explicit-scope', edits: [{ path: 'src/value.mjs', content }], ...extra });
const repairExpected = fixture => ({ path: fixture.authority.plan.path, approval_hash: fixture.authority.plan.approval_hash, parents: fixture.authority.parents, step_id: 'simplify-src', root: fixture.root });

test('case-repair-host-runner: one runner process completes a pass; a separate consumer recomputes before accepting', async t => {
  const fixture = repairRunnerRepository(t);
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.equal(run.status, 0, `${run.stderr}\n${JSON.stringify(run.output)}`);
  const { receipt, simplify_context: context } = run.output;
  assert.equal(receipt.kind, 'simplify-host-receipt:v1');
  assert.equal(receipt.status, 'verified');
  assert.deepEqual(receipt.pass_paths, ['src/value.mjs']);
  assert.equal(receipt.anchor.kind, 'head');
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), simplifiedSource);
  assert.equal(context.host_kind, 'runner');
  const accepted = simplify.evaluateSimplifyConsumer(context, { host_receipt: receipt, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' });
  assert.equal(accepted.status, 'verified', JSON.stringify(accepted));
  assert.equal(accepted.verification_current, true);
  const tampered = structuredClone(receipt); tampered.after['src/value.mjs'] = `sha256:${'0'.repeat(64)}`;
  assert.notEqual(simplify.evaluateSimplifyConsumer(context, { host_receipt: tampered, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' }).status, 'verified', 'a modified receipt is rejected');
  const widened = structuredClone(receipt); widened.pass_paths.push('package.json');
  widened.before['package.json'] = repairSha(repairRead(path.join(fixture.root, 'package.json'))); widened.after['package.json'] = widened.before['package.json'];
  assert.notEqual(simplify.evaluateSimplifyConsumer(context, { host_receipt: widened, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' }).status, 'verified', 'a forged receipt widening scope is rejected');
  fixture.write('src/value.mjs', `${simplifiedSource}// edited after the runner\n`);
  assert.notEqual(simplify.evaluateSimplifyConsumer(context, { host_receipt: receipt, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' }).status, 'verified', 'content changed after the runner is not current');
});

test('case-repair-host-runner: requests cannot carry authority and the plan identity must match the host-issued hash', async t => {
  const fixture = repairRunnerRepository(t);
  for (const smuggled of [{ plan: fixture.authority.plan }, { approval_hash: fixture.authority.plan.approval_hash }, { workflow_hunks: fixture.authority.scope.hunks },
    { verification_commands: [] }, { anchor: { kind: 'head' } }, { prior_receipts: [] }]) {
    const run = repairRunRunner(t, fixture, fixture.authority, repairApply(simplifiedSource, smuggled));
    assert.notEqual(run.status, 0, JSON.stringify(smuggled));
    assert.match(run.output?.receipt?.blockers?.join(' ') ?? run.stderr, /authority/u, JSON.stringify(smuggled));
  }
  const wrongHash = structuredClone(fixture.authority); wrongHash.plan.approval_hash = fixture.spec.metadata.approval_hash;
  const rejected = repairRunRunner(t, fixture, wrongHash, repairApply());
  assert.notEqual(rejected.status, 0);
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), originalSource, 'no write without matching plan authority');
});

test('case-repair-host-runner: the receipt chain carries caps across invocations and a reset chain is refused', async t => {
  const fixture = repairRunnerRepository(t);
  const first = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.equal(first.status, 0, JSON.stringify(first.output));
  const reset = repairRunRunner(t, fixture, fixture.authority, repairApply(originalSource));
  assert.notEqual(reset.status, 0, 'omitting the prior receipt cannot reset the chain');
  assert.match(reset.output.receipt.blockers.join(' '), /anchor|chain/u);
  // The host re-resolves the scope for the current three-line content before the second pass.
  const chained = structuredClone(fixture.authority); chained.prior_receipts = [first.output.receipt];
  chained.scope.hunks = [{ path: 'src/value.mjs', start_line: 1, end_line: 3 }];
  const second = repairRunRunner(t, fixture, chained, repairApply(originalSource));
  assert.equal(second.status, 0, JSON.stringify(second.output));
  const third = structuredClone(fixture.authority); third.prior_receipts = [first.output.receipt, second.output.receipt];
  const capped = repairRunRunner(t, fixture, third, repairApply());
  assert.notEqual(capped.status, 0);
  assert.match(capped.output.receipt.blockers.join(' '), /pass cap/u);
  const repaired = structuredClone(chained); repaired.repaired = true;
  assert.notEqual(repairRunRunner(t, fixture, repaired, repairApply()).status, 0, 'repair closes the chain');
});

test('case-repair-host-runner: an oracle that imports a package is not trusted and Apply is refused', async t => {
  const fixture = repairRunnerRepository(t, { oracleImport: "import 'yaml';\n" });
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.notEqual(run.status, 0);
  assert.match(run.output.receipt.blockers.join(' '), /oracle/u);
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), originalSource);
});

// Review follow-up (repair selected by the user) --------------------------------
test('case-repair-untracked-ownership: a host-snapshot pass on a file that is not in HEAD still needs proven ownership', async t => {
  const fixture = repairRunnerRepository(t);
  const { revalidateSimplifyHostReceipt } = await import('../../_refs/simplify/repository-evidence.mjs');
  const oldText = 'export function extra(input) {\n  const result = input * 2;\n  return result;\n}\n';
  const newText = 'export function extra(input) {\n  return input * 2;\n}\n';
  fixture.write('src/extra.mjs', newText);
  const classify_source = ({ path: file, content }) => ({ kind: 'executable', hunks: [{ path: file, start_line: 1, end_line: content.toString().split('\n').length }], protected_surfaces: [] });
  const verify_preservation = () => Object.fromEntries(repairSurfaces.map(surface => [surface, { status: 'verified', reason: 'Fixture.' }]));
  const base = { root: fixture.root, repository_id: repairRunnerOwner, change_ref: 'runner-fixture', run_verification: false,
    receipt: { schema_version: 1, kind: 'simplify-host-receipt:v1', repository_id: repairRunnerOwner, change_ref: 'runner-fixture',
      plan: { approval_hash: fixture.plan.metadata.approval_hash, step_id: 'simplify-extra' }, status: 'verified', pass_paths: ['src/extra.mjs'],
      before: { 'src/extra.mjs': repairSha(oldText) }, after: { 'src/extra.mjs': repairSha(newText) } },
    anchor: { kind: 'host-snapshot', snapshot: { bytes: { 'src/extra.mjs': Buffer.from(oldText) } } },
    authority: { plan: { approval_hash: fixture.plan.metadata.approval_hash }, step: { step_id: 'simplify-extra', allowed_paths: ['src/extra.mjs'], prohibited_paths: [] },
      commands: [], oracles: { classify_source, verify_preservation } },
    requested_scope: { files: ['src/extra.mjs'], hunks: [{ path: 'src/extra.mjs', start_line: 1, end_line: 5 }] } };
  const owned = revalidateSimplifyHostReceipt({ ...base, workflow_hunks: [{ path: 'src/extra.mjs', start_line: 1, end_line: 5 }], user_owned_hunks: [{ path: 'src/extra.mjs', start_line: 1, end_line: 5 }] });
  assert.equal(owned.verified, false, JSON.stringify(owned));
  assert.match(owned.blockers.join(' '), /user-owned/u);
  const unproven = revalidateSimplifyHostReceipt({ ...base, workflow_hunks: [], user_owned_hunks: [] });
  assert.equal(unproven.verified, false, JSON.stringify(unproven));
  assert.match(unproven.blockers.join(' '), /ownership is unproven/u);
});

test('case-repair-runner-rollback: the chain hunk budget is checked before Apply and no write survives a refused pass', async t => {
  const fixture = repairRunnerRepository(t);
  const prior = { schema_version: 1, kind: 'simplify-host-receipt:v1', repository_id: repairRunnerOwner, change_ref: 'runner-fixture',
    plan: { path: fixture.authority.plan.path, approval_hash: fixture.authority.plan.approval_hash, step_id: 'simplify-src' },
    status: 'verified', pass_paths: ['src/value.mjs'], before: { 'src/value.mjs': repairSha(originalSource) }, after: { 'src/value.mjs': repairSha(originalSource) }, hunks: 19 };
  const authority = structuredClone(fixture.authority); authority.prior_receipts = [prior];
  // Two separate hunks: comments on the first and the last line.
  const twoHunks = originalSource.replace('export function value(input) {', 'export function value(input) { // entry').replace(/\}\n$/u, '} // exit\n');
  const run = repairRunRunner(t, fixture, authority, repairApply(twoHunks));
  assert.notEqual(run.status, 0, JSON.stringify(run.output));
  assert.match(run.output.receipt.blockers.join(' '), /hunk cap/u);
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), originalSource, 'no write survives a refused or failed pass');
});

test('case-repair-filtered-blob: head anchors compare filtered HEAD content, so autocrlf work trees are not blocked', async t => {
  const fixture = repairRunnerRepository(t, { crlf: true });
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply(simplifiedSource.replaceAll('\n', '\r\n')));
  assert.equal(run.status, 0, JSON.stringify(run.output?.receipt));
  const accepted = simplify.evaluateSimplifyConsumer(run.output.simplify_context, { host_receipt: run.output.receipt, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' });
  assert.equal(accepted.status, 'verified', JSON.stringify(accepted));
});

test('case-repair-runner-fingerprint: another-process consumers report the same source identity as host sessions', async t => {
  const fixture = repairRunnerRepository(t);
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.equal(run.status, 0, JSON.stringify(run.output?.receipt));
  const accepted = simplify.evaluateSimplifyConsumer(run.output.simplify_context, { host_receipt: run.output.receipt, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' });
  assert.equal(accepted.status, 'verified', JSON.stringify(accepted));
  const { captureRepository } = await import('../../_refs/shared/repository-observation.mjs');
  const observed = captureRepository({ root: repairRealpath.native(fixture.root), owner: repairRunnerOwner, volatile: [], guarded: [] });
  assert.equal(accepted.owner_repository_id, repairRunnerOwner);
  assert.equal(accepted.source_fingerprint, observed.stable_fingerprint);
});

test('case-repair-oracle-imports: evasive package imports make the oracle untrusted', async t => {
  const { loadSimplifyHostAuthority } = await import('../../_refs/simplify/host-runner.mjs');
  assert.equal(loadSimplifyHostAuthority(repairRunnerRepository(t, { fakePackage: true }).authority).oracles.available, true, 'control: a clean oracle loads');
  for (const oracleImport of ['import x from"evil-oracle";\n', "/**/import 'evil-oracle';\n", "import{parse}from'evil-oracle';\n", "export{parse}from'evil-oracle';\n",
    "import {createRequire} from 'node:module';\nconst load = createRequire(import.meta.url); load('evil-oracle');\n"]) {
    const fixture = repairRunnerRepository(t, { oracleImport, fakePackage: true });
    assert.equal(loadSimplifyHostAuthority(fixture.authority).oracles.available, false, oracleImport);
  }
});

test('case-repair-direct-analyze: a direct fix without a plan step can Analyze through the runner but never Apply', async t => {
  const fixture = repairRunnerRepository(t);
  const direct = { schema_version: 1, root: fixture.root, repository_id: repairRunnerOwner, change_ref: 'runner-fixture',
    scope: fixture.authority.scope, workflow_hunks: [], user_owned_hunks: [], anchor: { kind: 'head' }, prior_receipts: [], repaired: false };
  const analyzed = repairRunRunner(t, fixture, direct, { schema_version: 1, action: 'analyze-explicit-scope' });
  assert.equal(analyzed.status, 0, JSON.stringify(analyzed.output?.receipt));
  assert.equal(analyzed.output.receipt.status, 'analyzed');
  assert.equal(analyzed.output.simplify_context.approved_plan_step, null);
  const applied = repairRunRunner(t, fixture, direct, repairApply());
  assert.notEqual(applied.status, 0);
  assert.match(applied.output.receipt.blockers.join(' '), /Analyze/u);
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), originalSource);
});

test('case-repair-oracle-rollback: a concurrent change to an oracle module blocks the scoped rollback', async t => {
  const g = await simplifyFixture(t, { session: { oracle_paths: ['oracles/preserve.mjs'] } });
  const failed = g.finish(g.preflight(), [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
  assert.equal(failed.status, 'blocked');
  g.write(sourcePath, originalSource); g.write('oracles/preserve.mjs', 'export const tampered = true;\n');
  const attempt = structuredClone(failed.context); attempt.passes = g.session.ledger();
  attempt.verification.after = [g.session.runVerification(g.command)];
  const result = simplify.evaluateSimplifyPostflight(attempt, g.runtime);
  assert.notEqual(result.context?.result?.status, 'reverted', JSON.stringify(result.blockers));
  assert.match(result.blockers.join(' '), /oracle/u);
});

test('case-repair-consumer-window: another-process revalidation runs its commands inside the shared host ledger', async t => {
  const fixture = repairRunnerRepository(t, { volatilePaths: ['build/cache/**'], oracleWritesCache: true });
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.equal(run.status, 0, JSON.stringify(run.output?.receipt));
  const { captureRepository, registerVolatileLedger, assertVolatileLedger } = await import('../../_refs/shared/repository-observation.mjs');
  const root = repairRealpath.native(fixture.root);
  const observe = () => captureRepository({ root, owner: repairRunnerOwner, volatile: ['build/cache/**'], guarded: [] });
  const ledger = registerVolatileLedger({ root, change_ref: 'runner-fixture', volatile_paths: ['build/cache/**'], snapshot: observe() });
  const accepted = simplify.evaluateSimplifyConsumer(run.output.simplify_context, { host_receipt: run.output.receipt, expected_plan: repairExpected(fixture), consumer: 'sdcorejs-ship' });
  assert.equal(accepted.status, 'verified', JSON.stringify(accepted));
  assert.doesNotThrow(() => assertVolatileLedger(ledger, observe()), 'the consumer command window recorded its cache writes');
});

// Second review follow-up (repair selected by the user) ---------------------------
test('case-repair-rollback-conflict: a concurrent edit to a pass path blocks the runner rollback and is never overwritten', async t => {
  // Control: without a concurrent edit, a failing pass is rolled back to its checkpoint.
  const clean = repairRunnerRepository(t);
  const reverted = repairRunRunner(t, clean, clean.authority, repairApply(simplifiedSource.replace('+ 1', '+ 2')));
  assert.equal(reverted.output?.receipt?.status, 'reverted', JSON.stringify(reverted.output?.receipt));
  assert.equal(reverted.output.receipt.after['src/value.mjs'], reverted.output.receipt.before['src/value.mjs']);
  assert.equal(repairRead(path.join(clean.root, 'src/value.mjs'), 'utf8'), originalSource);
  const fixture = repairRunnerRepository(t, { volatilePaths: ['build/**'], concurrentAppend: true });
  const run = repairRunRunner(t, fixture, fixture.authority, repairApply());
  assert.notEqual(run.status, 0, JSON.stringify(run.output?.receipt));
  assert.match(run.output.receipt.blockers.join(' '), /concurrent change/u);
  assert.equal(repairRead(path.join(fixture.root, 'src/value.mjs'), 'utf8'), `${simplifiedSource}// concurrent\n`, 'the concurrent edit survives');
  // The refused rollback still names the pass paths and hashes that need host attention.
  assert.deepEqual(run.output.receipt.pass_paths, ['src/value.mjs'], JSON.stringify(run.output.receipt));
  assert.equal(run.output.receipt.before['src/value.mjs'], repairSha(originalSource));
  assert.equal(run.output.receipt.after['src/value.mjs'], repairSha(`${simplifiedSource}// concurrent\n`));
  // User-approved extra round: it also keeps the postflight failure that triggered the rollback.
  assert.ok(run.output.receipt.blockers.some(message => !/concurrent change/u.test(message)), JSON.stringify(run.output.receipt.blockers));
});

// Third review follow-up (repair selected by the user) ----------------------------
test('case-repair-oracle-specifier: a specifier that Node resolves to another file than the checked one is untrusted', async t => {
  const { loadSimplifyHostAuthority } = await import('../../_refs/simplify/host-runner.mjs');
  // The tracked decoy carries the literal name; Node decodes %68 and drops #decoy, so it loads oracles/helper.mjs.
  for (const [specifier, decoy] of [['./%68elper.mjs', 'oracles/%68elper.mjs'], ['./helper.mjs#decoy', 'oracles/helper.mjs#decoy']]) {
    const fixture = repairRunnerRepository(t, { oracleImport: `import {tag} from '${specifier}';\n`, extraFiles: { [decoy]: "export const tag = 'decoy';\n" } });
    fixture.write('oracles/helper.mjs', "export const tag = 'untracked';\n");
    assert.equal(loadSimplifyHostAuthority(fixture.authority).oracles.available, false, specifier);
  }
});

// User-approved extra round beyond the repair-loop limit ---------------------------
test('case-repair-oracle-pathspec: a bracketed oracle path is checked literally, not as a Git glob', async t => {
  const { loadSimplifyHostAuthority } = await import('../../_refs/simplify/host-runner.mjs');
  // The tracked oracles/i.mjs matches the glob [id].mjs, while Node loads the literal, untracked oracles/[id].mjs.
  const fixture = repairRunnerRepository(t, { oracleImport: "import {tag} from './[id].mjs';\n", extraFiles: { 'oracles/i.mjs': "export const tag = 'tracked';\n" } });
  fixture.write('oracles/[id].mjs', "export const tag = 'untracked';\n");
  assert.equal(loadSimplifyHostAuthority(fixture.authority).oracles.available, false);
});

test('case-repair-oracle-commonjs: only ES module files join the oracle closure and crypto engines are refused', async t => {
  const { loadSimplifyHostAuthority } = await import('../../_refs/simplify/host-runner.mjs');
  // Controls: a tracked .mjs helper and a crypto hash stay trusted.
  const control = repairRunnerRepository(t, { oracleImport: "import {tag} from './helper.mjs';\nimport {createHash} from 'node:crypto';\n",
    extraFiles: { 'oracles/helper.mjs': "export const tag = 'ok';\n" } });
  assert.equal(loadSimplifyHostAuthority(control.authority).oracles.available, true, 'control');
  // A CommonJS helper reaches the module wrapper's require through arguments, without a refused token.
  const cjs = repairRunnerRepository(t, { oracleImport: "import helper from './helper.cjs';\n",
    extraFiles: { 'oracles/helper.cjs': "const load = arguments[1];\nexports.platform = load('node:os').platform();\n" } });
  assert.equal(loadSimplifyHostAuthority(cjs.authority).oracles.available, false, 'CommonJS helper');
  const engine = repairRunnerRepository(t, { oracleImport: "import {setEngine} from 'node:crypto';\n" });
  assert.equal(loadSimplifyHostAuthority(engine.authority).oracles.available, false, 'crypto engine loader');
});

test('case-repair-session-outcome-composite: a rolled-back second session pass does not hide the simplified first pass', async t => {
  const f = await simplifyFixture(t);
  const first = f.finish(f.preflight());
  assert.equal(first.status, 'verified', JSON.stringify(first.blockers));
  // The second pass starts from the simplified content (three lines), fails and is rolled back.
  f.context.scope.eligible_hunks = [{ path: sourcePath, start_line: 1, end_line: 3 }];
  f.context.passes = f.session.ledger(); f.context.baseline.snapshot = f.session.captureSnapshot();
  f.context.verification.before = [f.session.runVerification(f.command)];
  const failed = f.finish(f.preflight(), [{ path: sourcePath, content: simplifiedSource.replace('+ 1', '+ 2') }]);
  assert.equal(failed.status, 'blocked');
  f.write(sourcePath, simplifiedSource);
  const rollback = structuredClone(failed.context); rollback.passes = f.session.ledger();
  rollback.verification.after = [f.session.runVerification(f.command)];
  const reverted = simplify.evaluateSimplifyPostflight(rollback, f.runtime);
  assert.equal(reverted.context?.result?.status, 'reverted', JSON.stringify(reverted.blockers));
  const consumed = simplify.evaluateSimplifyConsumer(reverted.context, { ...f.runtime, consumer: 'sdcorejs-test' });
  assert.equal(consumed.outcome, 'simplified', `simplified code in the tree is never reported as reverted: ${JSON.stringify(consumed)}`);
});

test('case-repair-reverted-outcome: a reverted receipt must restore its before-state and the outcome follows the composite diff', async t => {
  const fixture = repairRunnerRepository(t);
  const { revalidateSimplifyHostReceipt } = await import('../../_refs/simplify/repository-evidence.mjs');
  fixture.write('src/value.mjs', simplifiedSource);
  const identity = { schema_version: 1, kind: 'simplify-host-receipt:v1', repository_id: repairRunnerOwner, change_ref: 'runner-fixture',
    plan: { approval_hash: fixture.plan.metadata.approval_hash, step_id: 'simplify-src' }, pass_paths: ['src/value.mjs'] };
  const classify_source = ({ path: file, content }) => ({ kind: 'executable', hunks: [{ path: file, start_line: 1, end_line: content.toString().split('\n').length }], protected_surfaces: [] });
  const verify_preservation = () => Object.fromEntries(repairSurfaces.map(surface => [surface, { status: 'verified', reason: 'Fixture.' }]));
  const input = (receipt, chain = []) => ({ root: fixture.root, repository_id: repairRunnerOwner, change_ref: 'runner-fixture', run_verification: false, receipt, chain,
    anchor: { kind: 'head' }, authority: { plan: { approval_hash: fixture.plan.metadata.approval_hash }, step: { step_id: 'simplify-src', allowed_paths: ['src/value.mjs'], prohibited_paths: [] },
      commands: [], oracles: { classify_source, verify_preservation } }, requested_scope: { files: ['src/value.mjs'], hunks: [{ path: 'src/value.mjs', start_line: 1, end_line: 4 }] } });
  const changedReverted = revalidateSimplifyHostReceipt(input({ ...identity, status: 'reverted', before: { 'src/value.mjs': repairSha(originalSource) }, after: { 'src/value.mjs': repairSha(simplifiedSource) } }));
  assert.equal(changedReverted.verified, false, JSON.stringify(changedReverted));
  assert.match(changedReverted.blockers.join(' '), /reverted/u);
  const chained = revalidateSimplifyHostReceipt(input({ ...identity, status: 'reverted', before: { 'src/value.mjs': repairSha(simplifiedSource) }, after: { 'src/value.mjs': repairSha(simplifiedSource) } },
    [{ ...identity, status: 'verified', before: { 'src/value.mjs': repairSha(originalSource) }, after: { 'src/value.mjs': repairSha(simplifiedSource) } }]));
  assert.equal(chained.verified, true, JSON.stringify(chained));
  assert.equal(chained.outcome, 'simplified', 'simplified code in the tree is never reported as reverted');
  // The runner refuses to build a new pass on the same forged reverted receipt.
  const { runSimplifyHostPass } = await import('../../_refs/simplify/host-runner.mjs');
  const forged = await runSimplifyHostPass({ ...fixture.authority, prior_receipts: [{ ...identity, status: 'reverted',
    before: { 'src/value.mjs': repairSha(originalSource) }, after: { 'src/value.mjs': repairSha(simplifiedSource) } }] }, repairApply());
  assert.equal(forged.receipt.status, 'blocked', JSON.stringify(forged.receipt));
  assert.match(forged.receipt.blockers.join(' '), /reverted receipt/u);
});

test('case-repair-oracle-builtins: only pure built-ins are trusted and computed code loading is refused', async t => {
  const { loadSimplifyHostAuthority } = await import('../../_refs/simplify/host-runner.mjs');
  assert.equal(loadSimplifyHostAuthority(repairRunnerRepository(t, { oracleImport: "import assert from 'node:assert/strict';\n" }).authority).oracles.available, true,
    'control: a pure built-in stays trusted');
  for (const oracleImport of ["import {Session} from 'node:inspector/promises';\n", "import {run} from 'node:test';\n", "import p from 'node:process';\n",
    'const build = (...args) => Reflect.construct(Function, args);\n', "const hidden = globalThis['ev' + 'al'];\n",
    // Escapes spell a refused identifier or property name without its token.
    'const hidden = \\u0070rocess;\n', "const key = '\\x63onstructor';\n"]) {
    assert.equal(loadSimplifyHostAuthority(repairRunnerRepository(t, { oracleImport }).authority).oracles.available, false, oracleImport);
  }
});

test('case-repair-outcome-source: the session consumer reports the host-held outcome, not the payload status', async t => {
  const f = await simplifyFixture(t);
  const result = f.finish(f.preflight());
  assert.equal(result.status, 'verified', JSON.stringify(result.blockers));
  const tampered = structuredClone(result.context); tampered.result.status = 'unchanged';
  const consumed = simplify.evaluateSimplifyConsumer(tampered, { ...f.runtime, consumer: 'sdcorejs-test' });
  assert.equal(consumed.outcome, 'simplified', JSON.stringify(consumed));
});
