import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runCleanupCli } from '../../_refs/cleanup/cli.mjs';
import { createCleanupOfferState, resolveCleanupOffer, coordinateCleanupOffer } from '../../_refs/cleanup/offer-policy.mjs';
import { coordinateResourceCleanup, evaluateTaskCompletion } from '../../_refs/cleanup/resource-lifecycle.mjs';
import { auditResources } from '../../_refs/cleanup/resource-audit.mjs';
import { cleanupFingerprint } from '../../_refs/cleanup/cleanup-contract.mjs';
import { approvePostMergePlan } from '../../_refs/cleanup/post-merge.mjs';
import { dispatchPrompt, loadSkillPack } from './support/skill-pack-runner.mjs';

const sha = 'a'.repeat(40), target = 'b'.repeat(40);
const repo = path.resolve('resource-fixture');
const state = () => createCleanupOfferState({ scope_id: 'resource-test' });
function completed() {
  const binding = { task_id: 't1', repository_id: path.join(repo, '.git'), source_sha: sha };
  return { ...binding, verification: { ...binding, result: 'PASSED', evidence: 'Current verification receipt.' },
    review: { ...binding, result: 'PASSED', evidence: 'Current review receipt.' },
    durable: { ...binding, finalized: true, evidence: 'Artifact closure complete.' },
    unresolved: [], disposition: 'completed' };
}
function snapshot() {
  return { repository: { root: repo, common_dir: path.join(repo, '.git'), target_ref: 'refs/heads/main', target_sha: target, protected_refs: ['refs/heads/main'] },
    task: { id: 't1', status: 'completed', source_sha: sha, durable_finalized: true },
    merge: { kind: 'ancestry', source_sha: sha, target_ref: 'refs/heads/main', target_sha: target, source_is_ancestor: true, evidence: 'Current ancestry observation.' },
    resources: [{ kind: 'branch', identity: 'refs/heads/task', ownership: { task_id: 't1', created_by_task: true, evidence: 'Original creation receipt.' },
      producer: { state: 'quiescent', evidence: 'All participants idle.' }, recovery: { strategy: 'recreate', evidence: 'Merged source retained.' }, unknowns: [],
      state: { sha, checked_out_paths: [], is_protected: false, symbolic_target: null } }] };
}
const coordinate = (extra = {}) => coordinateResourceCleanup({ event: 'task-finished', completion: completed(), snapshot: snapshot(), state: state(), ...extra });

test('completion needs current verification, review, durable closure and no unresolved work', () => {
  assert.equal(evaluateTaskCompletion(completed()).status, 'completed');
  for (const key of ['verification', 'review', 'durable']) {
    const evidence = completed(); evidence[key].source_sha = target;
    assert.equal(evaluateTaskCompletion(evidence).status, 'incomplete', key);
  }
  for (const disposition of ['failed', 'interrupted', 'cancelled', 'deferred', 'unknown']) {
    assert.equal(evaluateTaskCompletion({ ...completed(), disposition }).status, 'incomplete');
  }
  assert.equal(evaluateTaskCompletion({ ...completed(), unresolved: ['Manual acceptance pending.'] }).status, 'incomplete');
  assert.equal(evaluateTaskCompletion({ disposition: 'completed' }).status, 'incomplete');
  for (const unknown of [null, false, [], 'done']) {
    assert.equal(evaluateTaskCompletion(unknown).status, 'incomplete');
    assert.equal(coordinate({ completion: unknown }).status, 'incomplete');
  }
});

test('completed and merged work automatically yields a bounded resource analysis offer', () => {
  const result = coordinate();
  assert.equal(result.status, 'offered');
  assert.equal(result.offer.analysis_only, true);
  assert.equal(result.offer.mutation_allowed, false);
  assert.deepEqual(result.offer.scope.resources, [{ kind: 'branch', identity: 'refs/heads/task' }]);
  assert.equal(result.plan.actions[0].status, 'ready');
  assert.equal(result.completion.status, 'completed');
});

test('lifecycle-assess CLI invokes the coordinator read-only with exact root binding', async t => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-lifecycle-cli-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const input = path.join(base, 'trusted-context.json');
  await writeFile(input, JSON.stringify({ event: 'task-finished', completion: completed(), snapshot: snapshot(), state: state() }));
  const result = await runCleanupCli(['lifecycle-assess', '--root', repo, '--input', input]);
  assert.equal(result.status, 'offered');
  assert.equal(result.mutation_authorized, false);
  assert.equal(result.offer.analysis_only, true);
  await assert.rejects(runCleanupCli(['lifecycle-assess', '--root', base, '--input', input]), /RESOURCE_LIFECYCLE_ROOT_MISMATCH/u);
  await assert.rejects(runCleanupCli(['lifecycle-assess', '--root', repo, '--input', input, '--scope', 'dist']), /INVALID_ARGUMENTS/u);
});

test('commit, push and PR creation do not establish completion or merge', () => {
  for (const event of ['commit-created', 'push-completed', 'pr-created']) {
    assert.equal(coordinate({ event }).status, 'pending-merge');
  }
  const data = snapshot(); data.merge.source_is_ancestor = false;
  assert.equal(coordinate({ snapshot: data }).status, 'pending-merge');
  data.merge.source_is_ancestor = true; data.merge.source_sha = target;
  assert.equal(coordinate({ snapshot: data }).status, 'pending-merge');
});

test('task and source identities cannot be replaced by another completed task', () => {
  for (const change of [{ task_id: 'other' }, { source_sha: target }]) {
    const result = coordinate({ completion: { ...completed(), ...change } });
    assert.equal(result.status, 'incomplete');
    assert.equal(result.completion.status, 'incomplete');
  }
});

test('completion rejects another task or repository even when the source commit matches', () => {
  for (const key of ['verification', 'review', 'durable']) {
    for (const field of ['task_id', 'repository_id']) {
      const completion = completed(); completion[key][field] = 'different-owner';
      assert.equal(coordinate({ completion }).status, 'incomplete', `${key}.${field}`);
    }
  }
});

test('an audit-only assessment cannot attest to a different repository task', () => {
  const audit = { schema_version: 1, kind: 'resource-audit',
    repository: { root: path.join(repo, 'other'), common_dir: path.join(repo, 'other', '.git') },
    observation_id: 'repo-other-observation', mutation_authorized: false,
    findings: [{ kind: 'worktree', identity: path.join(repo, 'other', 'legacy'), status: 'review' }] };
  const result = coordinateResourceCleanup({ event: 'session-resume', completion: completed(), audit, state: state() });
  assert.equal(result.completion.status, 'incomplete');
  assert.ok(result.completion.blockers.includes('task-result-binding-mismatch'));
  assert.equal(result.status, 'offered');
  assert.equal(result.mutation_authorized, false);
});

test('resource and file offers share one pending/decline/session suppression state', () => {
  const first = coordinate();
  assert.equal(coordinate({ state: first.state }).status, 'pending');
  const accepted = resolveCleanupOffer({ state: first.state, offer_id: first.offer.offer_id, response: '1' });
  assert.equal(accepted.analysis_authority.action, 'resource-audit');
  assert.equal(accepted.mutation_allowed, false);
  assert.equal(coordinate({ state: accepted.state }).status, 'suppressed');
  const disabled = resolveCleanupOffer({ state: first.state, offer_id: first.offer.offer_id, response: '3' });
  assert.equal(coordinateCleanupOffer({ state: disabled.state }).status, 'suppressed');
  assert.equal(coordinate({ worker_role: 'worker' }).status, 'findings-only');
});

test('previous exact approval is reused without a second question; drift is held', () => {
  const first = coordinate();
  const approval = approvePostMergePlan(first.plan, { source: 'conversation', authority: 'post-merge-resources', decision: 'approve', action_ids: first.plan.actions.map(a => a.id) });
  assert.equal(coordinate({ approval }).status, 'authorized');
  const data = snapshot(); data.resources[0].state.sha = target;
  const changed = coordinate({ snapshot: data, approval });
  assert.equal(changed.authorized_action_ids.length, 0);
  assert.notEqual(changed.status, 'authorized');
});

test('partially approved resources retain authorization and still offer uncovered resources', () => {
  const data = snapshot(); data.resources.push({ ...structuredClone(data.resources[0]), identity: 'refs/heads/second-task' });
  const first = coordinate({ snapshot: data });
  const approval = approvePostMergePlan(first.plan, { source: 'conversation', authority: 'post-merge-resources', decision: 'approve', action_ids: [first.plan.actions[0].id] });
  const result = coordinate({ snapshot: data, approval });
  assert.equal(result.authorized_action_ids.length, 1);
  assert.equal(result.status, 'offered');
  assert.deepEqual(result.offer.scope.resources, [{ kind: 'branch', identity: 'refs/heads/second-task' }]);
});

test('mixed file/resource signals across repositories keep a valid shared pending state', () => {
  const result = coordinateCleanupOffer({ state: state(), boundary: { phase: 'after-primary-result' },
    signals: [{ source: 'sdcorejs-explore', significant: true, category: 'output', scope: { repository_id: 'z', paths: ['dist'] },
      observed_state: { fingerprint: 'current' }, unknowns: [], reason_to_offer: 'Finished output.',
      evidence: [{ kind: 'producer-finished', confirmed: true, detail: 'Producer done.', paths: ['dist'] }] }],
    resource_signals: [{ source: 'sdcorejs-cleanup', significant: true, category: 'legacy-resources', scope: { repository_id: 'a', resources: [{ kind: 'branch', identity: 'refs/heads/old' }] },
      observed_state: { fingerprint: 'current' }, unknowns: [], reason_to_offer: 'Legacy branch.',
      evidence: [{ kind: 'resource-observation', confirmed: true, detail: 'Current metadata.' }] }] });
  assert.equal(result.status, 'offered');
  assert.equal(resolveCleanupOffer({ state: result.state, offer_id: result.offer.offer_id, response: '2' }).status, 'declined');
});

test('legacy proposal preserves held reasons, partial coverage and measured storage', () => {
  const audit = { schema_version: 1, kind: 'resource-audit', repository: { root: repo, common_dir: path.join(repo, '.git') },
    mutation_authorized: false, coverage: 'partial', issues: ['measurement-budget-exhausted'], observation_id: cleanupFingerprint('partial'), findings: [
      { kind: 'worktree', identity: path.resolve('old-tree'), status: 'review', reasons: ['ownership-unknown'], storage: [{ logical_bytes: 12, coverage: 'partial' }] },
      { kind: 'worktree', identity: repo, status: 'held', reasons: ['current-worktree'] }] };
  const result = coordinateResourceCleanup({ event: 'project-adoption', state: state(), audit });
  assert.deepEqual(result.resource_report, audit);
  assert.deepEqual(result.offer.resource_report, audit);
});

test('first adoption and later session can offer legacy review without task provenance', () => {
  const audit = { schema_version: 1, kind: 'resource-audit', repository: { root: repo, common_dir: path.join(repo, '.git') },
    mutation_authorized: false, coverage: 'complete', findings: [{ kind: 'worktree', identity: path.resolve('legacy-tree'), status: 'review',
      reasons: ['merge-observed', 'ownership-unknown', 'activity-unknown'], logical_bytes: 1234 }], observation_id: cleanupFingerprint('legacy') };
  for (const event of ['project-adoption', 'session-resume']) {
    const result = coordinateResourceCleanup({ event, audit, state: state() });
    assert.equal(result.status, 'offered');
    assert.equal(result.offer.mutation_allowed, false);
    assert.equal(result.plan, null);
    const declined = resolveCleanupOffer({ state: result.state, offer_id: result.offer.offer_id, response: '2' });
    assert.equal(coordinateResourceCleanup({ event, audit, state: declined.state }).status, 'suppressed');
  }
});

test('legacy held findings, malformed evidence and unsafe boundaries never become disposal authority', () => {
  assert.equal(coordinate({ event: 'debug-root-cause' }).status, 'deferred');
  assert.equal(coordinateResourceCleanup({ event: 'session-resume', state: state() }).status, 'observation-needed');
  const first = coordinate();
  const changed = snapshot(); changed.resources[0].ownership.created_by_task = false;
  assert.equal(coordinate({ snapshot: changed }).plan.actions[0].status, 'held');
  assert.equal(first.mutation_authorized, false);
});

async function fixture(t) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-resource-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'main'); await mkdir(root);
  const git = (...argv) => execFileSync('git', ['-C', root, ...argv], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-b', 'main'); git('config', 'user.email', 'fixture@example.invalid'); git('config', 'user.name', 'Fixture');
  await writeFile(path.join(root, 'README'), 'source'); git('add', 'README'); git('commit', '-m', 'fixture');
  const tree = path.join(base, 'old tree'); git('worktree', 'add', '-b', 'old-task', tree);
  await mkdir(path.join(tree, 'node_modules')); await writeFile(path.join(tree, 'node_modules', 'payload'), 'cache');
  git('config', 'core.fsmonitor', 'false');
  return { base, root, tree, git };
}

test('real legacy Git audit works without .sdcorejs and preserves all files and refs', async t => {
  const { root, tree, git } = await fixture(t);
  await writeFile(path.join(tree, '.gitignore'), 'node_modules/\n');
  // Keep the legacy tree clean while preserving ignored dependency bytes.
  execFileSync('git', ['-C', tree, 'add', '.gitignore']); execFileSync('git', ['-C', tree, 'commit', '-m', 'ignore dependencies']);
  git('merge', '--ff-only', 'old-task');
  const before = git('show-ref');
  const report = await auditResources({ root, target_ref: 'refs/heads/main', measure: true });
  const candidate = report.findings.find(f => f.kind === 'worktree' && f.identity === tree);
  assert.equal(report.mutation_authorized, false);
  assert.equal(candidate.status, 'review');
  assert.equal(candidate.ownership, 'unknown');
  assert.ok(candidate.reasons.includes('activity-unknown'));
  assert.equal(candidate.storage[0].logical_bytes, 5);
  assert.equal(candidate.storage[0].coverage, 'complete');
  assert.equal(git('show-ref'), before);
  assert.equal(await readFile(path.join(tree, 'node_modules', 'payload'), 'utf8'), 'cache');
  assert.equal(report.findings.find(f => f.identity === root).status, 'held');
});

test('dirty, locked and unmerged registered worktrees are retained', async t => {
  const { root, tree, git } = await fixture(t);
  git('worktree', 'lock', tree);
  const report = await auditResources({ root, target_ref: 'refs/heads/main' });
  const finding = report.findings.find(f => f.identity === tree);
  assert.equal(finding.status, 'held');
  assert.ok(finding.reasons.includes('locked'));
  assert.ok(finding.reasons.includes('dirty-or-untracked'));
});

test('measurement is bounded and never follows a dependency symlink', async t => {
  const { root, tree } = await fixture(t);
  const elsewhere = path.join(root, 'private'); await mkdir(elsewhere); await writeFile(path.join(elsewhere, 'secret'), 'private');
  await symlink(elsewhere, path.join(tree, 'node_modules', 'external'), 'dir');
  const result = await auditResources({ root, target_ref: 'refs/heads/main', measure: true, max_entries: 1 });
  assert.equal(result.coverage, 'partial');
  const finding = result.findings.find(f => f.identity === tree);
  assert.equal(finding.storage[0].coverage, 'partial');
  assert.equal(await readFile(path.join(elsewhere, 'secret'), 'utf8'), 'private');
});

test('metadata audit never executes Git clean/process/fsmonitor hooks', async t => {
  const { root, tree, git } = await fixture(t);
  const sentinel = path.join(root, 'hook-executed');
  const hook = path.join(root, 'filter.mjs');
  await writeFile(hook, `import { writeFileSync } from 'node:fs'; writeFileSync(${JSON.stringify(sentinel)}, 'executed'); process.stdin.pipe(process.stdout);`);
  await writeFile(path.join(tree, '.gitattributes'), 'README filter=unsafe\n');
  git('config', 'filter.unsafe.clean', `node "${hook}"`);
  git('config', 'core.fsmonitor', `node "${hook}"`);
  await writeFile(path.join(tree, 'README'), 'sourcE');
  const result = await auditResources({ root, target_ref: 'refs/heads/main' });
  assert.equal(result.findings.find(f => f.identity === tree).status, 'held');
  await assert.rejects(access(sentinel), { code: 'ENOENT' });
});

test('staged modifications are retained by metadata comparison', async t => {
  const { root, tree } = await fixture(t);
  await writeFile(path.join(tree, 'README'), 'staged source');
  execFileSync('git', ['-C', tree, 'add', 'README']);
  const result = await auditResources({ root, target_ref: 'refs/heads/main' });
  assert.ok(result.findings.find(f => f.identity === tree).reasons.includes('dirty-or-untracked'));
});

test('a registered worktree replaced by an unrelated repository is not scanned', async t => {
  const { root, tree } = await fixture(t);
  await rm(tree, { recursive: true }); await mkdir(tree);
  execFileSync('git', ['-C', tree, 'init', '-b', 'other']);
  await mkdir(path.join(tree, 'node_modules')); await writeFile(path.join(tree, 'node_modules', 'unrelated'), 'private');
  const result = await auditResources({ root, target_ref: 'refs/heads/main', measure: true });
  const replaced = result.findings.find(f => f.identity === tree);
  assert.equal(replaced.status, 'held');
  assert.deepEqual(replaced.storage, []);
});

test('failed worktree metadata observations make coverage partial', async t => {
  const { root, tree } = await fixture(t);
  const index = execFileSync('git', ['-C', tree, 'rev-parse', '--path-format=absolute', '--git-path', 'index'], { encoding: 'utf8' }).trim();
  await writeFile(index, 'invalid fixture index');
  const report = await auditResources({ root, target_ref: 'refs/heads/main', measure: true });
  assert.equal(report.coverage, 'partial');
  assert.ok(report.issues.includes('worktree-observation-incomplete'));
  const finding = report.findings.find(f => f.identity === tree);
  assert.equal(finding.status, 'held');
  assert.deepEqual(finding.storage, []);
});

test('worktree and branch count budgets disclose incomplete coverage', async t => {
  const { root } = await fixture(t);
  const report = await auditResources({ root, target_ref: 'refs/heads/main', max_worktrees: 1, max_branches: 1 });
  assert.equal(report.coverage, 'partial');
  assert.ok(report.issues.includes('worktree-count-budget-exhausted'));
  assert.ok(report.issues.includes('branch-count-budget-exhausted'));
});

test('linked roots and malformed/duplicate CLI switches cannot widen audit scope', async t => {
  const { root, base } = await fixture(t); const alias = path.join(base, 'alias'); await symlink(root, alias, 'dir');
  await assert.rejects(auditResources({ root: alias, target_ref: 'refs/heads/main' }), /EXACT_PHYSICAL_GIT_ROOT_REQUIRED/u);
  for (const extra of [['--root', root], ['--measure', 'yes'], ['--max-entries', '-1'], ['--scope', '..'], ['--out', root]]) {
    await assert.rejects(runCleanupCli(['resource-audit', '--root', root, '--target', 'refs/heads/main', ...extra]));
  }
});

test('resource audit requires an exact Git root, target, budgets and Docker scope', async t => {
  const { root } = await fixture(t);
  await assert.rejects(auditResources({ root }), /EXPLICIT_TARGET_REF_REQUIRED/u);
  await assert.rejects(auditResources({ root: path.join(root, 'node_modules'), target_ref: 'refs/heads/main' }));
  await assert.rejects(auditResources({ root, target_ref: '--all' }), /EXPLICIT_TARGET_REF_REQUIRED/u);
  await assert.rejects(auditResources({ root, target_ref: 'refs/heads/main', max_entries: 0 }), /INVALID_AUDIT_BUDGET/u);
  await assert.rejects(auditResources({ root, target_ref: 'refs/heads/main', docker_context: 'default' }), /DOCKER_REPOSITORY_SCOPE_REQUIRED/u);
  const result = await runCleanupCli(['resource-audit', '--root', root, '--target', 'refs/heads/main']);
  assert.equal(result.kind, 'resource-audit');
  assert.equal(result.measurement, 'metadata-only');
});

test('resource review prompts route to cleanup while implementation, tests and Git retain their owners', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  for (const prompt of ['Audit old worktrees and unused Docker resources in this repository.', 'Inspect legacy worktrees after upgrading the skill pack.']) {
    assert.equal(dispatchPrompt(pack, prompt)?.name, 'sdcorejs-cleanup', prompt);
  }
  for (const [prompt, owner] of [['Review the cleanup implementation for security.', 'sdcorejs-review'], ['Write E2E tests for legacy worktree audits.', 'sdcorejs-test'], ['Create a PR for the current changes.', 'sdcorejs-git']]) {
    assert.equal(dispatchPrompt(pack, prompt)?.name, owner, prompt);
  }
});

test('offline live-benchmark fixtures and grader reject unsupported completion and stale/reused tickets', {
  skip: !process.env.SDCOREJS_CLEANUP_PYTHON && 'Select an existing absolute SDCOREJS_CLEANUP_PYTHON for offline benchmark controls.',
}, async t => {
  const python = process.env.SDCOREJS_CLEANUP_PYTHON;
  assert.ok(path.isAbsolute(python));
  const base = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-benchmark-controls-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const file = path.join(base, 'fixtures.json');
  const output = execFileSync(process.execPath, ['authoring/evals/cleanup-lifecycle/benchmark-fixtures.mjs'], {
    cwd: new URL('../..', import.meta.url), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await writeFile(file, output);
  const controls = execFileSync(python, ['-B', 'authoring/evals/cleanup-lifecycle/protocol-benchmark.py', '--fixtures', file, '--self-test'], {
    cwd: new URL('../..', import.meta.url), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, OPENAI_API_KEY: 'offline-invalid-sentinel', openai_api_key: '' },
  });
  assert.deepEqual(JSON.parse(controls), { grader_controls: 52, status: 'passed' });
});
