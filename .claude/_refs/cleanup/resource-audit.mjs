import { execFile } from 'node:child_process';
import { lstat, opendir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { cleanupFingerprint, isCleanupRuntimePath } from './cleanup-contract.mjs';

const exec = promisify(execFile);
const text = value => typeof value === 'string' && value.trim().length > 0 && !/[\0\r\n]/u.test(value);
const ref = value => text(value) && /^refs\/(?:heads|remotes)\//u.test(value) &&
  !/[\x00-\x20\x7f~^:?*\[\\]/u.test(value) && !value.includes('..') && !value.includes('@{');
const within = (root, child) => { const relative = path.relative(root, child); return relative === '' || !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`); };
const stores = ['node_modules', '.next', '.angular/cache', '.turbo', 'dist', 'build', 'coverage'];

function parseWorktrees(stdout) {
  return stdout.split('\0\0').filter(Boolean).map(block => Object.fromEntries(block.split('\0').filter(Boolean).map(line => {
    const at = line.indexOf(' '); return at < 0 ? [line, true] : [line.slice(0, at), line.slice(at + 1)];
  })));
}

async function physicalDirectory(directory) {
  const info = await lstat(directory);
  return info.isDirectory() && !info.isSymbolicLink() && await realpath(directory) === directory;
}

async function trackedMetadataChanged(root, output, budget) {
  let remaining = output;
  while (remaining.length) {
    if (Date.now() >= budget.deadline) throw new Error('AUDIT_BUDGET_EXHAUSTED');
    const separator = remaining.indexOf('\0');
    if (separator < 0) return true;
    const header = remaining.slice(0, separator).match(/^(\d{6}) ([a-f0-9]{40,64}) ([0-3])\t([\s\S]+)$/u);
    remaining = remaining.slice(separator + 1);
    const cached = remaining.match(/^  ctime: (\d+):(\d+)\n  mtime: (\d+):(\d+)\n  dev: \d+\tino: \d+\n  uid: \d+\tgid: \d+\n  size: (\d+)\tflags: ([a-f0-9]+)\n/u);
    if (!header || !cached || header[3] !== '0' || !['100644', '100755'].includes(header[1]) || cached[6] !== '0') return true;
    remaining = remaining.slice(cached[0].length);
    const relative = header[4];
    if (path.isAbsolute(relative) || relative.split(/[\\/]/u).some(part => part === '..' || part === '.git')) return true;
    const file = path.resolve(root, relative);
    if (!within(root, file)) return true;
    // Only stat the tracked path; never hash or normalize its contents. Both
    // status and ls-files --modified may invoke configured clean/process filters.
    let parent = path.dirname(file);
    while (parent !== root) {
      if (!await physicalDirectory(parent)) return true;
      parent = path.dirname(parent);
    }
    try {
      const info = await lstat(file, { bigint: true });
      if (!info.isFile() || info.size !== BigInt(cached[5]) ||
        info.ctimeNs !== BigInt(cached[1]) * 1000000000n + BigInt(cached[2]) ||
        info.mtimeNs !== BigInt(cached[3]) * 1000000000n + BigInt(cached[4])) return true;
    } catch { return true; }
  }
  return false;
}

async function readGitMetadata(directory, args, budget) {
  const remaining = budget.deadline - Date.now();
  if (remaining <= 0) throw new Error('AUDIT_BUDGET_EXHAUSTED');
  const { stdout } = await exec('git', ['--no-optional-locks', '--no-replace-objects',
    '-c', 'core.fsmonitor=false', '-c', 'core.untrackedCache=false', '-c', 'submodule.recurse=false',
    '-C', directory, ...args], { encoding: 'utf8', timeout: remaining, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  return stdout;
}

async function localGitChanges(root, git, budget, { ignoreCleanupRuntime = false } = {}) {
  const cached = await git(root, ['ls-files', '--stage', '--debug', '-z']);
  const untracked = await git(root, ['ls-files', '--others', '--exclude-standard', '-z',
    ...(!ignoreCleanupRuntime ? ['--directory', '--no-empty-directory'] : [])]);
  const staged = await git(root, ['diff-index', '--cached', '--name-only', '--no-ext-diff', '--no-textconv', 'HEAD', '--']);
  const hasUntracked = ignoreCleanupRuntime ? untracked.split('\0').some(file => file && !isCleanupRuntimePath(file)) : Boolean(untracked);
  return Boolean(hasUntracked || staged || await trackedMetadataChanged(root, cached, budget));
}

/** Conservative metadata observation without invoking repository clean filters. */
export async function observeLocalRepository(root, deadline, options = {}) {
  const budget = { deadline };
  const git = (directory, args) => readGitMetadata(directory, args, budget);
  try {
    if (!await physicalDirectory(root)) return 'state-unknown';
    const marker = await lstat(path.join(root, '.git'));
    if (marker.isFile()) return 'worktree-or-external-git-metadata';
    if (!marker.isDirectory() || marker.isSymbolicLink() || !await physicalDirectory(path.join(root, '.git'))) return 'state-unknown';
    if (path.relative(root, (await git(root, ['rev-parse', '--show-toplevel'])).trim()) !== '') return 'state-unknown';
    return await localGitChanges(root, git, budget, options) ? 'dirty-or-untracked' : 'no-local-changes-observed';
  } catch { return 'state-unknown'; }
}

async function measureStore(root, relative, budget) {
  const target = path.join(root, ...relative.split('/'));
  if (Date.now() >= budget.deadline) return { path: target, coverage: 'partial', logical_bytes: 0, reasons: ['measurement-budget-exhausted'] };
  // Validate each configured parent too; .angular/cache may otherwise follow .angular.
  let parent = root;
  for (const part of relative.split('/')) {
    parent = path.join(parent, part);
    try {
      const info = await lstat(parent);
      if (info.isSymbolicLink() || !info.isDirectory() || await realpath(parent) !== parent) {
        return { path: target, coverage: 'partial', logical_bytes: 0, reasons: ['linked-or-nondirectory-store-retained'] };
      }
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      return { path: target, coverage: 'partial', logical_bytes: 0, reasons: ['store-unreadable'] };
    }
  }
  const result = { path: target, coverage: 'complete', logical_bytes: 0, files: 0, reasons: [] };
  const pending = [target];
  while (pending.length) {
    if (budget.entries >= budget.max || Date.now() >= budget.deadline) { result.reasons.push('measurement-budget-exhausted'); break; }
    const directory = pending.pop();
    try {
      if (!await physicalDirectory(directory)) { result.reasons.push('linked-or-changed-directory'); continue; }
      const entries = await opendir(directory);
      for await (const entry of entries) {
        if (budget.entries >= budget.max || Date.now() >= budget.deadline) { result.reasons.push('measurement-budget-exhausted'); break; }
        budget.entries += 1;
        if (entry.name === '.git') { result.reasons.push('nested-git-metadata-retained'); continue; }
        const file = path.join(directory, entry.name);
        const info = await lstat(file);
        if (info.isSymbolicLink()) { result.reasons.push('link-not-followed'); continue; }
        if (info.isDirectory()) pending.push(file);
        else if (info.isFile()) { result.logical_bytes += info.size; result.files += 1; }
        else result.reasons.push('special-file-retained');
      }
    } catch { result.reasons.push('unreadable-or-changed-directory'); }
    if (result.reasons.includes('measurement-budget-exhausted')) break;
  }
  result.reasons = [...new Set(result.reasons)];
  if (result.reasons.length) result.coverage = 'partial';
  return result;
}

/** Metadata only; no fetch, hooks, content reads, daemon start, process control or mutation plan. */
export async function auditResources({ root, target_ref: targetRef, measure = false, max_entries: maxEntries = 10000,
  max_worktrees: maxWorktrees = 32, max_branches: maxBranches = 256, max_seconds: maxSeconds = 15,
  docker_context: dockerContext, repository_id: repositoryId } = {}) {
  if (!text(root) || !path.isAbsolute(root) || path.normalize(root) !== root || !await physicalDirectory(root)) throw new Error('EXACT_PHYSICAL_GIT_ROOT_REQUIRED');
  if (!ref(targetRef)) throw new Error('EXPLICIT_TARGET_REF_REQUIRED');
  if (typeof measure !== 'boolean' || ![maxEntries, maxWorktrees, maxBranches].every(value => Number.isSafeInteger(value) && value > 0) ||
    !Number.isFinite(maxSeconds) || maxSeconds <= 0 || maxSeconds > 300) throw new Error('INVALID_AUDIT_BUDGET');
  if (dockerContext !== undefined && (!text(dockerContext) || !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/u.test(dockerContext) ||
    !text(repositoryId) || repositoryId.length > 512)) throw new Error('DOCKER_REPOSITORY_SCOPE_REQUIRED');
  const budget = { entries: 0, max: maxEntries, deadline: Date.now() + maxSeconds * 1000 };
  const issues = [], findings = [];
  const git = (directory, args) => readGitMetadata(directory, args, budget);
  if ((await git(root, ['rev-parse', '--show-toplevel'])).trim() !== root) throw new Error('EXACT_PHYSICAL_GIT_ROOT_REQUIRED');
  const commonDir = (await git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir'])).trim();
  const targetSha = (await git(root, ['rev-parse', '--verify', '--end-of-options', `${targetRef}^{commit}`])).trim();
  const worktrees = parseWorktrees(await git(root, ['worktree', 'list', '--porcelain', '-z']));
  const merged = async source => {
    if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u.test(source ?? '')) return 'unknown';
    try { await git(root, ['merge-base', '--is-ancestor', source, targetSha]); return 'observed'; }
    catch (error) {
      if (error.code !== 1) issues.push('merge-observation-incomplete');
      return error.code === 1 ? 'unmerged' : 'unknown';
    }
  };
  if (worktrees.length > maxWorktrees) issues.push('worktree-count-budget-exhausted');
  for (const entry of worktrees.slice(0, maxWorktrees)) {
    const identity = entry.worktree;
    const finding = { kind: 'worktree', identity, status: 'held', ownership: 'unknown', activity: 'unknown',
      reasons: ['ownership-unknown', 'activity-unknown'], head_sha: entry.HEAD ?? null, branch_ref: entry.branch ?? null, storage: [] };
    findings.push(finding);
    if (!text(identity) || !path.isAbsolute(identity)) { finding.reasons.push('unsafe-path'); continue; }
    if (identity === worktrees[0]?.worktree) finding.reasons.push('primary-worktree');
    if (identity === root || within(identity, process.cwd())) finding.reasons.push('current-worktree');
    if (Object.hasOwn(entry, 'locked')) finding.reasons.push('locked');
    if (Object.hasOwn(entry, 'prunable')) finding.reasons.push('prunable-metadata-requires-review');
    const targetLocal = targetRef.replace(/^refs\/remotes\/[^/]+\//u, 'refs/heads/');
    if (entry.branch === targetRef || entry.branch === targetLocal || /^refs\/heads\/(?:main|master|develop|release(?:\/.*)?)$/u.test(entry.branch ?? '')) finding.reasons.push('protected-or-target-branch');
    let physical = false, associated = false;
    try {
      physical = await physicalDirectory(identity);
      if (!physical) finding.reasons.push('linked-or-missing-worktree');
      else {
        associated = (await git(identity, ['rev-parse', '--path-format=absolute', '--git-common-dir'])).trim() === commonDir &&
          (await git(identity, ['rev-parse', 'HEAD'])).trim() === entry.HEAD;
        if (!associated) finding.reasons.push('worktree-identity-changed');
        else {
          if (await localGitChanges(identity, git, budget)) finding.reasons.push('dirty-or-untracked');
        }
      }
    } catch { finding.reasons.push('worktree-state-unknown'); associated = false; issues.push('worktree-observation-incomplete'); }
    const mergeState = await merged(entry.HEAD); finding.merge = mergeState;
    finding.reasons.push(mergeState === 'observed' ? 'merge-observed' : `merge-${mergeState}`);
    if (physical && associated && measure) {
      for (const relative of stores) {
        const measurement = await measureStore(identity, relative, budget);
        if (measurement) finding.storage.push(measurement);
      }
    }
    if (finding.storage.some(store => store.coverage !== 'complete')) issues.push('storage-measurement-incomplete');
    if (finding.reasons.every(reason => ['ownership-unknown', 'activity-unknown', 'merge-observed'].includes(reason))) finding.status = 'review';
  }
  try {
    const branchOutput = await git(root, ['for-each-ref', '--format=%(refname)%00%(objectname)%00%(symref)', 'refs/heads/']);
    const branches = branchOutput.trimEnd().split('\n').filter(Boolean);
    if (branches.length > maxBranches) issues.push('branch-count-budget-exhausted');
    for (const line of branches.slice(0, maxBranches)) {
      const [identity, sourceSha, symbolicTarget] = line.split('\0');
      const reasons = ['ownership-unknown', 'activity-unknown'];
      if (identity === targetRef || identity === targetRef.replace(/^refs\/remotes\/[^/]+\//u, 'refs/heads/') ||
        /^refs\/heads\/(?:main|master|develop|release(?:\/.*)?)$/u.test(identity)) reasons.push('protected-or-target-branch');
      if (worktrees.some(tree => tree.branch === identity)) reasons.push('checked-out');
      if (symbolicTarget) reasons.push('symbolic-ref');
      const mergeState = await merged(sourceSha); reasons.push(mergeState === 'observed' ? 'merge-observed' : `merge-${mergeState}`);
      findings.push({ kind: 'branch', identity, status: reasons.length === 3 && mergeState === 'observed' ? 'review' : 'held',
        ownership: 'unknown', activity: 'unknown', source_sha: sourceSha, merge: mergeState, reasons });
    }
  } catch { issues.push('branch-observation-incomplete'); }
  let docker = null;
  if (dockerContext) {
    docker = { context: dockerContext, repository_id: repositoryId, status: 'unknown' };
    const runDocker = async args => {
      const remaining = budget.deadline - Date.now(); if (remaining <= 0) throw new Error('AUDIT_BUDGET_EXHAUSTED');
      return (await exec('docker', ['--context', dockerContext, ...args], { encoding: 'utf8', timeout: remaining, maxBuffer: 1024 * 1024, windowsHide: true })).stdout.trim();
    };
    try {
      docker.daemon_id = JSON.parse(await runDocker(['info', '--format', '{{json .ID}}']));
      const label = `label=io.sdcorejs.repository-id=${repositoryId}`;
      for (const kind of ['container', 'image', 'volume']) {
        const list = kind === 'container' ? ['container', 'ls', '--all', '--no-trunc', '--filter', label, '--format', '{{.ID}}']
          : kind === 'image' ? ['image', 'ls', '--all', '--no-trunc', '--quiet', '--filter', label] : ['volume', 'ls', '--quiet', '--filter', label];
        const identities = [...new Set((await runDocker(list)).split('\n').filter(Boolean))];
        if (identities.length > maxBranches) issues.push('docker-count-budget-exhausted');
        for (const identity of identities.slice(0, maxBranches)) {
          if (!(kind === 'container' ? /^[a-f0-9]{64}$/u : kind === 'image' ? /^sha256:[a-f0-9]{64}$/u : /^[A-Za-z0-9][A-Za-z0-9_.-]*$/u).test(identity)) { issues.push('docker-identity-unknown'); continue; }
          const reasons = ['ownership-unknown', 'activity-unknown', 'unique-data-and-consumers-require-review'];
          let status = 'review', observedStatus = null;
          if (kind === 'container') {
            observedStatus = await runDocker(['container', 'inspect', '--format', '{{.State.Status}}', identity]);
            if (!['created', 'exited'].includes(observedStatus)) { status = 'held'; reasons.push('container-active-or-unknown'); }
          } else if (kind === 'image' && await runDocker(['container', 'ls', '--all', '--filter', `ancestor=${identity}`, '--format', '{{.ID}}'])) {
            status = 'held'; reasons.push('image-has-consumers');
          } else if (kind === 'volume') { status = 'held'; reasons.push('volume-removal-unsupported'); }
          findings.push({ kind: `docker-${kind}`, identity, status, observed_status: observedStatus, ownership: 'unknown', activity: 'unknown', reasons });
        }
      }
      docker.status = 'observed';
    } catch { issues.push('docker-unavailable-or-incomplete'); }
  }
  // A moving target is stale evidence, never a license to infer completion.
  try {
    if ((await git(root, ['rev-parse', '--verify', '--end-of-options', `${targetRef}^{commit}`])).trim() !== targetSha) {
      issues.push('target-moved-during-audit');
      for (const finding of findings) { finding.status = 'held'; finding.reasons.push('target-moved-during-audit'); }
    }
  } catch { issues.push('target-revalidation-unavailable'); for (const finding of findings) finding.status = 'held'; }
  const result = { schema_version: 1, kind: 'resource-audit', repository: { root, common_dir: commonDir, target_ref: targetRef, target_sha: targetSha },
    measurement: measure ? 'bounded-logical-bytes' : 'metadata-only', size_basis: 'Logical file sizes; partial values are lower bounds, not reclaimed or physical bytes.',
    coverage: issues.length ? 'partial' : 'complete', issues: [...new Set(issues)], mutation_authorized: false, findings, docker,
    limitations: ['Git association does not prove task creation or inactivity.', 'Local refs are not fetched; provider merge proof may be needed for squash/rebase.',
      'Metadata can change during observation; revalidate separately before an approved mutation.'] };
  return { ...result, observation_id: cleanupFingerprint(result) };
}

export function parseResourceAuditArgs(args) {
  const options = {};
  const flags = { '--root': 'root', '--target': 'target_ref', '--measure': 'measure', '--max-entries': 'max_entries',
    '--max-worktrees': 'max_worktrees', '--max-branches': 'max_branches', '--max-seconds': 'max_seconds', '--docker-context': 'docker_context', '--repository-id': 'repository_id' };
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1], key = flags[flag];
    if (!key || !text(value) || Object.hasOwn(options, key)) throw new Error('INVALID_ARGUMENTS');
    if (key === 'measure') { if (!['true', 'false'].includes(value)) throw new Error('INVALID_ARGUMENTS'); options[key] = value === 'true'; }
    else options[key] = key.startsWith('max_') ? Number(value) : value;
  }
  return options;
}
