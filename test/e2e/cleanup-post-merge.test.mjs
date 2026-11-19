import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { cleanupFingerprint } from '../../_refs/cleanup/cleanup-contract.mjs';
import { runCleanupCli } from '../../_refs/cleanup/cli.mjs';
import { planPostMergeCleanup, approvePostMergePlan, revalidatePostMergeAction } from '../../_refs/cleanup/post-merge.mjs';
import { dispatchPrompt, loadSkillPack } from './support/skill-pack-runner.mjs';

const exec = promisify(execFile);
const sha = 'a'.repeat(40), target = 'b'.repeat(40), container = 'c'.repeat(64);
const root = path.resolve('post-merge-fixture');
const sibling = path.resolve('post-merge-task-fixture');
const fp = cleanupFingerprint({ inventory: 'reviewed fixture' });

function fixture() {
  const owned = { ownership: { task_id: 'task-1', created_by_task: true, evidence: 'Task creation receipt.' },
    producer: { state: 'quiescent', evidence: 'All producers and consumers finished.' },
    recovery: { strategy: 'recreate', evidence: 'Merged source and reproducible output; no unique evidence.' }, unknowns: [] };
  return {
    repository: { root, common_dir: path.join(root, '.git'), target_ref: 'refs/heads/main', target_sha: target,
      protected_refs: ['refs/heads/main', 'refs/heads/release'] },
    task: { id: 'task-1', status: 'completed', durable_finalized: true, source_sha: sha },
    merge: { kind: 'ancestry', source_sha: sha, target_ref: 'refs/heads/main', target_sha: target,
      source_is_ancestor: true, evidence: 'Current git merge-base --is-ancestor exit 0.' },
    resources: [
      { kind: 'worktree', identity: sibling, ...structuredClone(owned), state: {
        physical_path: sibling, head_sha: sha, branch_ref: 'refs/heads/task-worktree', is_primary: false, is_current: false,
        locked: false, dirty: false, untracked: false, submodules: false, nested_repositories: false,
        contains_needed_evidence: false, boundary_verified: true,
        inventory: { coverage: 'complete', fingerprint: fp, disposal_reviewed: true },
      } },
      { kind: 'branch', identity: 'refs/heads/task-1', ...structuredClone(owned),
        state: { sha, checked_out_paths: [], is_protected: false, symbolic_target: null } },
      { kind: 'docker-container', identity: container, ...structuredClone(owned), state: {
        status: 'exited', mounts_reviewed: true, writable_layer_disposable: true, consumers: [],
        labels: { 'io.sdcorejs.task-id': 'task-1' },
      } },
      { kind: 'docker-image', identity: `sha256:${'d'.repeat(64)}`, ...structuredClone(owned), state: {
        containers: [], shared: false, references_reviewed: true, labels: { 'io.sdcorejs.task-id': 'task-1' },
      } },
    ],
    docker: { context: 'task-context', daemon_id: 'fixture-daemon', endpoint_fingerprint: fp },
  };
}

const grant = (plan, ids = plan.actions.filter(a => a.status === 'ready').map(a => a.id)) => approvePostMergePlan(plan, {
  source: 'conversation', decision: 'approve', authority: 'post-merge-resources', action_ids: ids,
});

test('post-merge planning is read-only and produces exact native argv without force/prune', () => {
  const snapshot = fixture(), before = structuredClone(snapshot);
  const plan = planPostMergeCleanup(snapshot);
  assert.deepEqual(snapshot, before);
  assert.equal(plan.mutation_authorized, false);
  assert.equal(plan.status, 'planned');
  assert.equal(plan.actions.length, 4);
  assert.deepEqual(plan.actions[0].command, ['git', '-C', root, 'worktree', 'remove', '--', sibling]);
  assert.deepEqual(plan.actions[1].command, ['git', '-C', root, 'update-ref', '--no-deref', '-d', 'refs/heads/task-1', sha]);
  assert.deepEqual(plan.actions[2].command, ['docker', '--context', 'task-context', 'container', 'rm', container]);
  for (const action of plan.actions) assert.ok(!action.command.some(v => ['--force', '-f', '-v', 'prune'].includes(v)));
});

test('incomplete, failed, interrupted, closed-only and unmerged tasks never become disposal authority', () => {
  for (const mutate of [
    s => { s.task.status = 'failed'; }, s => { s.task.status = 'interrupted'; },
    s => { s.task.durable_finalized = false; }, s => { s.merge.source_is_ancestor = false; },
    s => { s.merge = { kind: 'provider', state: 'closed' }; },
    s => { s.merge.source_sha = target; }, s => { s.merge.target_sha = sha; },
    s => { s.repository.protected_refs = []; },
  ]) {
    const s = fixture(); mutate(s);
    const plan = planPostMergeCleanup(s);
    assert.equal(plan.status, 'blocked');
    assert.ok(plan.actions.every(a => a.status === 'held' && a.command === null));
  }
});

test('squash/rebase needs provider evidence bound to the exact source and reachable merge result', () => {
  const s = fixture();
  s.merge = { kind: 'provider', source_sha: sha, target_ref: s.repository.target_ref, target_sha: target,
    state: 'merged', merge_sha: 'e'.repeat(40), merge_is_ancestor: true,
    evidence: 'Provider PR receipt and current target ancestry probe.', receipt: {
      source: 'provider', repository: s.repository.common_dir, task_id: s.task.id,
      source_sha: sha, target_ref: s.repository.target_ref, merge_sha: 'e'.repeat(40), reference: 'PR-42',
    } };
  assert.equal(planPostMergeCleanup(s).status, 'planned');
  for (const key of ['source_sha', 'target_ref', 'merge_sha', 'repository', 'task_id', 'reference']) {
    const changed = structuredClone(s); changed.merge.receipt[key] = 'other';
    // An arbitrary reference string is allowed; absence is not.
    if (key === 'reference') changed.merge.receipt[key] = '';
    assert.equal(planPostMergeCleanup(changed).status, 'blocked', key);
  }
  s.merge.merge_is_ancestor = false;
  assert.equal(planPostMergeCleanup(s).status, 'blocked');
});

test('dirty, locked, active, unknown and evidence-bearing worktrees stay held despite disk pressure', () => {
  for (const change of [
    { dirty: true }, { untracked: true }, { locked: true }, { is_current: true }, { is_primary: true },
    { submodules: true }, { nested_repositories: true }, { contains_needed_evidence: true },
    { boundary_verified: false }, { physical_path: root }, { head_sha: target },
    { inventory: { coverage: 'partial', fingerprint: fp, disposal_reviewed: true } },
    { inventory: { coverage: 'complete', fingerprint: fp, disposal_reviewed: false } },
  ]) {
    const s = fixture(); Object.assign(s.resources[0].state, change);
    const a = planPostMergeCleanup(s).actions[0];
    assert.equal(a.status, 'held', JSON.stringify(change)); assert.equal(a.command, null);
  }
  for (const mutate of [
    r => { r.ownership.created_by_task = false; }, r => { r.ownership.task_id = 'other'; },
    r => { r.ownership.evidence = ''; }, r => { r.producer.state = 'running'; },
    r => { r.unknowns.push('Ignored diagnostics not reviewed.'); }, r => { r.recovery.evidence = ''; },
  ]) {
    const s = fixture(); mutate(s.resources[0]);
    assert.equal(planPostMergeCleanup(s).actions[0].status, 'held');
  }
});

test('branch deletion holds protected refs, remote refs, moved tips and every checked-out branch', () => {
  for (const change of [
    { identity: 'refs/heads/main' }, { identity: 'refs/heads/release' }, { identity: 'refs/remotes/origin/task' },
    { identity: 'refs/heads/../main' }, { state: { sha: target } },
    { state: { checked_out_paths: [sibling] } }, { state: { is_protected: true } },
  ]) {
    const s = fixture(), r = s.resources[1];
    if (change.identity) r.identity = change.identity;
    if (change.state) Object.assign(r.state, change.state);
    assert.equal(planPostMergeCleanup(s).actions[1].status, 'held', JSON.stringify(change));
  }
  const s = fixture(); s.resources[0].state.branch_ref = s.resources[1].identity;
  assert.equal(planPostMergeCleanup(s).actions[1].status, 'held', 'Contradictory empty checkout list cannot override a planned worktree.');
  s.resources[0].identity = root; s.resources[0].state.physical_path = root;
  assert.equal(planPostMergeCleanup(s).actions[0].status, 'held', 'Never remove the integration checkout.');
});

test('duplicate or overlapping resource identities cannot become recursive deletion authority', () => {
  const s = fixture(); s.resources.push(structuredClone(s.resources[0]));
  assert.throws(() => planPostMergeCleanup(s), /POST_MERGE_DUPLICATE_RESOURCE/u);
  s.resources.at(-1).identity = path.join(sibling, 'nested');
  s.resources.at(-1).state.physical_path = s.resources.at(-1).identity;
  const plan = planPostMergeCleanup(s);
  assert.equal(plan.actions[0].status, 'held'); assert.equal(plan.actions.at(-1).status, 'held');
});

test('task refs require observed direct-ref identity and reject symbolic or unknown targets', () => {
  const snapshot = fixture(), plan = planPostMergeCleanup(snapshot), approval = grant(plan);
  assert.equal(plan.actions[1].status, 'ready');
  for (const symbolic_target of ['refs/heads/main', 'refs/heads/another-task', '', false, undefined]) {
    const current = structuredClone(snapshot);
    current.resources[1].state.symbolic_target = symbolic_target;
    const fresh = planPostMergeCleanup(current), action = fresh.actions[1];
    assert.equal(action.status, 'held', String(symbolic_target));
    assert.equal(action.command, null);
    assert.throws(() => revalidatePostMergeAction({ plan, action_id: plan.actions[1].id, approval, current }), /POST_MERGE_STATE_CHANGED/u);
  }
});

test('unknown or malformed resource state is held without discarding independent ready actions', () => {
  for (const kind of ['branch', 'worktree', 'docker-container', 'docker-image']) {
    for (const state of [null, undefined, [], false, 0, 'unknown']) {
      const snapshot = fixture();
      const unknown = snapshot.resources.find(resource => resource.kind === kind);
      const ready = snapshot.resources.find(resource => resource.kind === (kind === 'branch' ? 'docker-image' : 'branch'));
      unknown.state = state;
      snapshot.resources = [ready, unknown];
      const plan = planPostMergeCleanup(snapshot);
      assert.equal(plan.status, 'partial', `${kind}: ${JSON.stringify(state)}`);
      assert.equal(plan.actions[0].status, 'ready');
      assert.equal(plan.actions[1].status, 'held');
      assert.equal(plan.actions[1].command, null);
      assert.ok(plan.actions[1].blockers.includes('resource-state-unknown'));
      const command = revalidatePostMergeAction({ plan, action_id: plan.actions[0].id, approval: grant(plan), current: snapshot });
      assert.deepEqual(command, plan.actions[0].command);
    }
  }
});

test('Docker keeps running/shared/unowned resources and all volumes, global caches and standalone dependencies', () => {
  for (const [index, change] of [
    [2, { status: 'running' }], [2, { labels: {} }], [2, { mounts_reviewed: false }],
    [2, { writable_layer_disposable: false }], [2, { consumers: ['another-task'] }],
    [3, { containers: [container] }], [3, { shared: true }], [3, { references_reviewed: false }],
  ]) {
    const s = fixture(); Object.assign(s.resources[index].state, change);
    assert.equal(planPostMergeCleanup(s).actions[index].status, 'held');
  }
  for (const kind of ['docker-volume', 'docker-build-cache', 'dependency-tree', 'global-cache']) {
    const s = fixture(); s.resources[0].kind = kind;
    assert.equal(planPostMergeCleanup(s).actions[0].status, 'held');
  }
  const s = fixture(); delete s.docker;
  assert.equal(planPostMergeCleanup(s).actions[2].status, 'held');
  assert.equal(planPostMergeCleanup(s).actions[0].status, 'ready');
});

test('approval requires exact resource authority and immediate fresh state; drift cannot reuse it', () => {
  const s = fixture(), plan = planPostMergeCleanup(s), approval = grant(plan, [plan.actions[0].id]);
  const check = (current = s, supplied = approval, value = plan) => revalidatePostMergeAction({
    plan: value, action_id: plan.actions[0].id, approval: supplied, current,
  });
  assert.deepEqual(check(), plan.actions[0].command);
  for (const authority of ['analysis', 'mutation', 'task-tail-low', undefined]) {
    assert.throws(() => approvePostMergePlan(plan, { source: 'conversation', decision: 'approve', authority,
      action_ids: [plan.actions[0].id] }), /POST_MERGE_AUTHORITY_REQUIRED/u);
  }
  assert.throws(() => check(s, null), /POST_MERGE_AUTHORITY_REQUIRED/u);
  assert.throws(() => revalidatePostMergeAction({ plan, action_id: plan.actions[1].id, approval, current: s }), /POST_MERGE_AUTHORITY_REQUIRED/u);
  for (const mutate of [
    v => { v.resources[0].state.inventory.fingerprint = cleanupFingerprint('new ignored output'); },
    v => { v.resources[0].state.dirty = true; }, v => { v.task.source_sha = target; },
    v => { v.repository.common_dir += '-other'; }, v => { v.merge.source_is_ancestor = false; },
  ]) {
    const current = structuredClone(s); mutate(current);
    assert.throws(() => check(current), /POST_MERGE_STATE_CHANGED/u);
  }
  const tampered = structuredClone(plan); tampered.actions[0].command.push('--force');
  assert.throws(() => check(s, approval, tampered), /POST_MERGE_PLAN_CHANGED/u);
  assert.throws(() => grant(plan, ['unknown']), /POST_MERGE_APPROVAL_SCOPE/u);
  const changed = structuredClone(s); changed.docker.daemon_id = 'other';
  const dockerApproval = grant(plan);
  assert.throws(() => revalidatePostMergeAction({ plan, action_id: plan.actions[2].id,
    approval: dockerApproval, current: changed }), /POST_MERGE_STATE_CHANGED/u);
});

test('CLI exposes read-only post-merge planning and refuses scope widening or snapshot/root mismatch', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-post-merge-input-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'snapshot.json');
  await writeFile(input, JSON.stringify(fixture()));
  assert.equal((await runCleanupCli(['post-merge-cleanup', '--root', root, '--input', input])).status, 'planned');
  await assert.rejects(runCleanupCli(['post-merge-cleanup', '--root', dir, '--input', input]), /POST_MERGE_ROOT_MISMATCH/u);
  await assert.rejects(runCleanupCli(['post-merge-cleanup', '--root', root, '--input', input, '--scope', '*']), /INVALID_ARGUMENTS/u);
  assert.deepEqual(JSON.parse(await readFile(input, 'utf8')), fixture());
});

test('native Git removes an approved merged worktree including node_modules, then conditionally deletes its branch', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-post-merge-git-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const repo = path.join(dir, 'repo'), wt = path.join(dir, 'task');
  await mkdir(repo);
  const git = async (...args) => (await exec('git', ['-C', repo, ...args], { env: { ...process.env,
    GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' } })).stdout.trim();
  await git('init', '-b', 'main');
  await writeFile(path.join(repo, '.gitignore'), 'node_modules/\n');
  await git('add', '.gitignore'); await git('commit', '-m', 'Fixture baseline');
  const base = await git('rev-parse', 'HEAD');
  await git('worktree', 'add', '-b', 'task-1', wt);
  await writeFile(path.join(wt, 'feature.txt'), 'Finished task result.');
  await git('-C', wt, 'add', 'feature.txt'); await git('-C', wt, 'commit', '-m', 'Fixture task result');
  await mkdir(path.join(wt, 'node_modules')); await writeFile(path.join(wt, 'node_modules', 'fixture'), 'reproducible fixture');
  const head = await git('rev-parse', 'refs/heads/task-1');
  await assert.rejects(git('merge-base', '--is-ancestor', head, 'main'));
  await git('merge', '--ff-only', 'task-1');
  await git('merge-base', '--is-ancestor', head, 'main');
  const s = fixture();
  s.repository = { ...s.repository, root: repo, common_dir: path.join(repo, '.git'), target_sha: head };
  s.task.source_sha = head; s.merge.source_sha = head; s.merge.target_sha = head;
  s.resources = s.resources.slice(0, 2);
  Object.assign(s.resources[0], { identity: wt }); Object.assign(s.resources[0].state, { physical_path: wt, head_sha: head, branch_ref: 'refs/heads/task-1' });
  Object.assign(s.resources[1].state, { sha: head, checked_out_paths: [wt] });
  // The fixture owner reviewed its only ignored file, and all writes are awaited.
  const first = planPostMergeCleanup(s);
  assert.equal(first.actions[1].status, 'held');
  const command = revalidatePostMergeAction({ plan: first, action_id: first.actions[0].id, approval: grant(first), current: s });
  // Native Git also refuses tracked/untracked changes even if the caller's observation were stale.
  await writeFile(path.join(wt, 'unique.txt'), 'Preserve this user work.');
  await assert.rejects(exec(command[0], command.slice(1)));
  assert.equal(await readFile(path.join(wt, 'unique.txt'), 'utf8'), 'Preserve this user work.');
  await rm(path.join(wt, 'unique.txt'));
  await exec(command[0], command.slice(1));
  await assert.rejects(access(wt), { code: 'ENOENT' });
  assert.doesNotMatch(await git('worktree', 'list', '--porcelain'), /branch refs\/heads\/task-1/u);
  s.resources = [s.resources[1]]; s.resources[0].state.checked_out_paths = [];
  const second = planPostMergeCleanup(s), a = second.actions[0];
  const deleteCommand = revalidatePostMergeAction({ plan: second, action_id: a.id, approval: grant(second), current: s });
  await git('update-ref', 'refs/heads/task-1', base, head);
  await assert.rejects(exec(deleteCommand[0], deleteCommand.slice(1)));
  assert.equal(await git('rev-parse', 'refs/heads/task-1'), base);
  await git('update-ref', 'refs/heads/task-1', head, base);
  await exec(deleteCommand[0], deleteCommand.slice(1));
  await assert.rejects(git('rev-parse', '--verify', 'refs/heads/task-1'));
  assert.equal(await git('rev-parse', 'main'), head);
});

test('native no-deref deletion preserves protected main if a task ref becomes symbolic after validation', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-post-merge-symref-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const git = async (...args) => (await exec('git', ['-C', dir, ...args], { env: { ...process.env,
    GIT_CONFIG_GLOBAL: os.devNull, GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
    GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' } })).stdout.trim();
  await git('init', '-b', 'main');
  await git('commit', '--allow-empty', '-m', 'Disposable direct-ref fixture');
  const head = await git('rev-parse', 'HEAD');
  await git('branch', 'task-1');
  const snapshot = fixture();
  snapshot.repository = { ...snapshot.repository, root: dir, common_dir: path.join(dir, '.git'), target_sha: head };
  snapshot.task.source_sha = head;
  Object.assign(snapshot.merge, { source_sha: head, target_sha: head });
  snapshot.resources = [snapshot.resources[1]];
  snapshot.resources[0].state.sha = head;
  const plan = planPostMergeCleanup(snapshot), action = plan.actions[0];
  const command = revalidatePostMergeAction({ plan, action_id: action.id, approval: grant(plan), current: snapshot });
  // Deliberately violate the cooperative window to verify the native defense.
  await git('symbolic-ref', 'refs/heads/task-1', 'refs/heads/main');
  const observed = structuredClone(snapshot);
  observed.resources[0].state.symbolic_target = await git('symbolic-ref', '-q', 'refs/heads/task-1');
  assert.equal(planPostMergeCleanup(observed).actions[0].status, 'held');
  await exec(command[0], command.slice(1));
  assert.equal(await git('rev-parse', '--verify', 'refs/heads/main'), head);
  await assert.rejects(git('symbolic-ref', '-q', 'refs/heads/task-1'));
  assert.equal(await git('symbolic-ref', 'HEAD'), 'refs/heads/main');
});

test('post-merge resource prompts route to cleanup while Git creation, test teardown and review keep their owners', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  for (const prompt of [
    'Clean up task worktrees and local branches after merge.',
    'Remove node_modules and Docker resources after the task is merged.',
    'Dọn dẹp worktree, branch và Docker sau khi task đã merge.',
    'Delete the merged task branch.',
    'Disk is full; force cleanup of all worktrees even if the task failed.',
  ]) assert.equal(dispatchPrompt(pack, prompt)?.name, 'sdcorejs-cleanup', prompt);
  for (const [prompt, expected] of [
    ['Create an isolated worktree for this task.', 'sdcorejs-git'],
    ['Write integration tests for Docker teardown.', 'sdcorejs-test'],
    ['Review the security of the post-merge cleanup implementation.', 'sdcorejs-review'],
  ]) assert.equal(dispatchPrompt(pack, prompt)?.name, expected, prompt);
});
