import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  CLEANUP_ACTIONS, CLEANUP_RISKS, CLEANUP_RUNTIME_ROOT, cleanupFingerprint, cleanupPath,
  isCleanupRuntimePath, approveCleanupPlan, approveCleanupPolicy, approveCleanupRestore,
  validateCleanupPlan, cleanupActionAuthorized,
} from '../../_refs/cleanup/cleanup-contract.mjs';

const CONTENT = `sha256:${'a'.repeat(64)}`;
const ROOT = path.resolve('isolated-contract-fixture');
const TASK = Object.freeze({ id: 'contract-task', status: 'completed', durable_finalized: true });

function action(overrides = {}) {
  return {
    id: 'cleanup-1', path: '.sdcorejs/tmp/task/output.html', action: 'delete', destination: null,
    classification: 'reproducible-output', risk: 'LOW', certainty: 'supported',
    impact: 'bounded local artifact', recoverability: 'reproducible', lifecycle: 'local_only',
    reasons: ['finished reproducible task output'], evidence: ['fixture producer declaration'], unknowns: [],
    fingerprint: CONTENT, state_fingerprint: cleanupFingerprint({ size: 8, ino: 1 }), bytes: 8,
    owner: 'contract-producer', protected: false, task_owned: true, reproducible: true,
    producer_finished: true, needed_for_evidence: false,
    restore_strategy: 'irreversible-approved-reproducible-delete', verification: ['exact-state', 'affected-checks'],
    ...overrides,
  };
}

function plan(actions = [action()], overrides = {}) {
  const state = { root_id: ROOT, scope: ['.sdcorejs/tmp/task'], reference_scope: [], inventory: [], directories: [], blocked: [], references: [], reference_directories: [], reference_blocked: [], git: { revision: null, records: [], tracked: [], submodules: [] }, evidence: {}, task: TASK };
  state.fingerprint = cleanupFingerprint(state);
  const payload = { schema_version: 1, root_id: ROOT, scope: ['.sdcorejs/tmp/task'], reference_scope: [], task: TASK, evidence: {}, state, actions, ...overrides };
  return { ...payload, plan_id: cleanupFingerprint(payload) };
}

function approval(value, overrides = {}) {
  return approveCleanupPlan(value, { source: 'conversation', decision: 'approve', authority: 'mutation', action_ids: value.actions.filter((item) => !['keep', 'review'].includes(item.action)).map((item) => item.id), ...overrides });
}

function policy(value, overrides = {}) {
  return approveCleanupPolicy({ root_id: value.root_id, task_id: value.task.id, paths: value.actions.map((item) => item.path), source: 'conversation', decision: 'approve', ...overrides });
}

test('stable identities ignore object key order but bind array order, action semantics and relevant state', () => {
  assert.equal(cleanupFingerprint({ x: 1, nested: { a: 2, b: 3 } }), cleanupFingerprint({ nested: { b: 3, a: 2 }, x: 1 }));
  assert.notEqual(cleanupFingerprint({ paths: ['a', 'b'] }), cleanupFingerprint({ paths: ['b', 'a'] }));
  const initial = plan();
  assert.equal(validateCleanupPlan(initial), true);
  assert.notEqual(plan([action({ action: 'quarantine' })]).plan_id, initial.plan_id);
  assert.notEqual(plan([action({ fingerprint: `sha256:${'b'.repeat(64)}` })]).plan_id, initial.plan_id);
  assert.notEqual(plan(undefined, { evidence: { owner: 'another' } }).plan_id, initial.plan_id);
});

test('exact paths reject traversal, shell wildcards, aliases and Windows reserved names', () => {
  const unsafe = ['', '.', './file', '..', '../file', '/tmp/file', 'C:/tmp/file', 'C:file', '\\\\server\\file', 'a\\file', 'a//file', 'a/../file', 'a/./file', 'a/', 'file*', 'file?', 'file:stream', 'a/CON', 'a/com1.txt', 'a/nul.json', 'a/file.', 'a/file ', 'a/\0file'];
  for (const value of unsafe) assert.throws(() => cleanupPath(value), /UNSAFE_PATH/u, value);
  for (const value of ['.sdcorejs/tmp/task/preview.html', 'assets/brand alpha/logo.png', 'docs/valid-name.md']) assert.equal(cleanupPath(value), value);
});

test('runtime quarantine recognition uses a complete path boundary', () => {
  assert.equal(isCleanupRuntimePath(CLEANUP_RUNTIME_ROOT), true);
  assert.equal(isCleanupRuntimePath(`${CLEANUP_RUNTIME_ROOT}/writer.lock`), true);
  assert.equal(isCleanupRuntimePath(`${CLEANUP_RUNTIME_ROOT}-other/file`), false);
  assert.equal(isCleanupRuntimePath(`other/${CLEANUP_RUNTIME_ROOT}`), false);
});

test('analysis, discovery, silence and declined choices cannot create mutation or standing task authority', () => {
  const value = plan();
  const bad = [
    {}, { source: 'conversation', decision: 'approve', authority: 'analysis' },
    { source: 'explore', decision: 'approve', authority: 'mutation' },
    { source: 'conversation', decision: 'decline', authority: 'mutation' },
  ];
  for (const item of bad) assert.throws(() => approveCleanupPlan(value, item), /MUTATION_AUTHORITY_REQUIRED/u);
  assert.throws(() => approveCleanupPolicy({ root_id: ROOT, task_id: TASK.id, paths: [value.actions[0].path] }), /TASK_POLICY_AUTHORITY_REQUIRED/u);
  assert.throws(() => approveCleanupPolicy({ root_id: ROOT, task_id: TASK.id, paths: [value.actions[0].path], source: 'conversation', decision: 'decline' }), /TASK_POLICY_AUTHORITY_REQUIRED/u);
});

test('mutation approvals bind exact action identities, root, plan, file state and action set', () => {
  const value = plan([action(), action({ id: 'cleanup-2', path: '.sdcorejs/tmp/task/second.html' })]);
  const granted = approval(value);
  assert.ok(value.actions.every((item) => cleanupActionAuthorized({ plan: value, action: item, approval: granted })));
  assert.throws(() => approval(value, { action_ids: ['cleanup-1', 'not-in-plan'] }), /APPROVAL_SCOPE_MISMATCH/u);
  assert.throws(() => approval(value, { action_ids: ['cleanup-1', 'cleanup-1'] }), /MUTATION_AUTHORITY_REQUIRED/u);
  for (const change of [{ plan_id: 'different' }, { root_id: 'other' }, { state_fingerprint: 'stale' }, { actions_fingerprint: 'different' }, { authority: 'analysis' }]) {
    assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], approval: { ...granted, ...change } }), false);
  }
  const partial = approval(value, { action_ids: ['cleanup-1'] });
  assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], approval: partial }), true);
  assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[1], approval: partial }), false);
});

test('MEDIUM requires exact bounded approval and HIGH requires a file or approved atomic group', () => {
  const medium = plan([action({ risk: 'MEDIUM', task_owned: false })]);
  assert.equal(cleanupActionAuthorized({ plan: medium, action: medium.actions[0], policy: policy(medium) }), false);
  assert.equal(cleanupActionAuthorized({ plan: medium, action: medium.actions[0], approval: approval(medium) }), true);
  const high = plan([action({ risk: 'HIGH' }), action({ id: 'cleanup-2', path: 'assets/second.png', risk: 'HIGH' })]);
  assert.equal(cleanupActionAuthorized({ plan: high, action: high.actions[0], approval: approval(high) }), false);
  assert.equal(cleanupActionAuthorized({ plan: high, action: high.actions[0], approval: approval(high, { action_ids: ['cleanup-1'] }) }), true);
  const atomic = approval(high, { atomic_group: high.plan_id });
  assert.ok(high.actions.every((item) => cleanupActionAuthorized({ plan: high, action: item, approval: atomic })));
  assert.equal(cleanupActionAuthorized({ plan: high, action: high.actions[0], approval: approval(high, { atomic_group: 'another-plan' }) }), false);
});

test('unknown evidence, protected paths and BLOCKED risk cannot be overridden by mutation approval', () => {
  for (const changes of [{ risk: 'BLOCKED' }, { unknowns: ['owner is unknown'], risk: 'MEDIUM' }, { protected: true, risk: 'HIGH' }]) {
    const value = plan([action(changes)]);
    assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], approval: approval(value) }), false);
    assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], policy: policy(value) }), false);
  }
});

test('standing task authority requires exact paths, complete task tail and qualifying LOW ownership', () => {
  const value = plan();
  const granted = policy(value);
  assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], policy: granted }), true);
  for (const changes of [{ task_owned: false }, { reproducible: false }, { producer_finished: false }, { needed_for_evidence: true }, { risk: 'MEDIUM' }]) {
    const changed = plan([action(changes)]);
    assert.equal(cleanupActionAuthorized({ plan: changed, action: changed.actions[0], policy: granted }), false);
  }
  for (const task of [{ ...TASK, status: 'failed' }, { ...TASK, durable_finalized: false }, { ...TASK, id: 'other' }]) {
    const changed = plan(undefined, { task });
    assert.equal(cleanupActionAuthorized({ plan: changed, action: changed.actions[0], policy: granted }), false);
  }
  for (const changes of [{ root_id: 'other' }, { task_id: 'other' }, { paths: ['.sdcorejs/tmp/task/other.html'] }, { actions: ['quarantine'] }]) {
    assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], policy: policy(value, changes) }), false);
  }
  const tampered = { ...granted, paths: [...granted.paths, 'new.html'] };
  assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], policy: tampered }), false);
  assert.throws(() => policy(value, { paths: ['.sdcorejs/tmp/*'] }), /UNSAFE_PATH/u);
  assert.throws(() => policy(value, { actions: ['archive'] }), /TASK_POLICY_AUTHORITY_REQUIRED/u);
});

test('plan identity rejects in-place changes, invalid actions and duplicate file identities', () => {
  const value = plan();
  const changed = structuredClone(value); changed.actions[0].action = 'quarantine';
  assert.throws(() => validateCleanupPlan(changed), /PLAN_IDENTITY_CHANGED/u);
  assert.throws(() => validateCleanupPlan(plan([action({ action: 'purge-wildcard' })])), /INVALID_ACTION/u);
  assert.throws(() => validateCleanupPlan(plan([action(), action({ id: 'cleanup-2' })])), /INVALID_ACTION/u);
  assert.throws(() => validateCleanupPlan(plan([action(), action({ path: 'different.html' })])), /INVALID_ACTION/u);
});

test('restore authorization is a separate receipt-bound decision', () => {
  const receipt = { receipt_id: cleanupFingerprint({ isolated: true }), root_id: ROOT };
  assert.throws(() => approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'mutation' }), /RESTORE_AUTHORITY_REQUIRED/u);
  assert.throws(() => approveCleanupRestore(receipt, { source: 'conversation', decision: 'decline', authority: 'restore' }), /RESTORE_AUTHORITY_REQUIRED/u);
  assert.deepEqual(approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' }), { authority: 'restore', source: 'conversation', receipt_id: receipt.receipt_id, root_id: ROOT });
});

test('unrecognized risk values fail closed instead of inheriting MEDIUM approval behavior', () => {
  for (const risk of ['UNKNOWN', 'medium', 'AUTO', null, undefined]) {
    const value = plan([action({ risk })]);
    assert.equal(cleanupActionAuthorized({ plan: value, action: value.actions[0], approval: approval(value) }), false, String(risk));
  }
  assert.deepEqual(CLEANUP_RISKS, ['LOW', 'MEDIUM', 'HIGH', 'BLOCKED']);
  assert.deepEqual(CLEANUP_ACTIONS, ['keep', 'review', 'quarantine', 'archive', 'delete']);
});

test('frozen destructive actions require content, state, ownership, restore and verification evidence', () => {
  for (const field of ['fingerprint', 'state_fingerprint', 'owner', 'restore_strategy', 'verification', 'reasons', 'evidence', 'unknowns']) {
    const item = action(); delete item[field];
    assert.throws(() => validateCleanupPlan(plan([item])), { message: /^INVALID_(?:ACTION|PLAN|FROZEN_ACTION)$/u }, field);
  }
});

test('a matching action ID cannot authorize substituted paths, operation or evidence outside the frozen action', () => {
  const value = plan();
  const granted = approval(value);
  for (const change of [{ path: 'unapproved-user-content.html' }, { action: 'quarantine' }, { fingerprint: `sha256:${'b'.repeat(64)}` }, { state_fingerprint: 'stale-file-state' }]) {
    assert.equal(cleanupActionAuthorized({ plan: value, action: { ...value.actions[0], ...change }, approval: granted }), false);
  }
});
