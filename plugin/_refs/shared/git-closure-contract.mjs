import { verifyApprovedArtifact } from './approved-artifact.mjs';

const REVISION = /^[a-f0-9]{40}$/u;
const LEGACY_SINGLETON =
  /^\.sdcorejs\/(?:tasks\/)?current-session\.md$/iu;
const INCLUDED_CLASSIFICATIONS = new Set([
  'required_with_change',
  'shared_owned',
  'conditional',
  'source',
]);

function normalizePath(value) {
  return String(value ?? '').replaceAll('\\', '/').replace(/^\.\/+/u, '');
}

function validRelativePath(value) {
  return (
    value.length > 0 &&
    !value.startsWith('/') &&
    !/^[A-Za-z]:\//u.test(value) &&
    !value.split('/').includes('..')
  );
}

function pushUnique(target, value) {
  if (!target.includes(value)) target.push(value);
}

function verifyRepositoryArtifacts(repository, blockers) {
  const verifiedByPath = new Map();
  for (const artifact of repository.approved_artifacts ?? []) {
    try {
      const verified = verifyApprovedArtifact(artifact);
      const path = normalizePath(
        verified.metadata.repository_relative_path,
      );
      if (verified.metadata.owner_repository_id !== repository.repository_id) {
        blockers.push(`approved artifact has wrong repository owner: ${path}`);
      }
      if (verified.metadata.contract_id !== repository.active_contract_id) {
        blockers.push(`approved artifact has inactive contract identity: ${path}`);
      }
      if (verified.metadata.source_revision !== repository.source_revision) {
        blockers.push(`approved artifact is stale for current source: ${path}`);
      }
      verifiedByPath.set(path, verified);
    } catch (error) {
      blockers.push(
        `approved artifact verification failed: ${error?.message ?? String(error)}`,
      );
    }
  }
  return verifiedByPath;
}

function validateRepositoryIdentity(repository, contract, blockers) {
  if (!repository.repository_id) blockers.push('repository_id is required');
  if (!repository.git_root) blockers.push('git_root is required at runtime');
  if (repository.thread_id !== contract.active_thread_id) {
    blockers.push('repository is bound to a different thread');
  }
  if (repository.worktree_id !== contract.active_worktree_id) {
    blockers.push('repository is bound to a different worktree');
  }
  if (!repository.active_contract_id) {
    blockers.push('active_contract_id is required');
  }
  if (!repository.active_plan_id) blockers.push('active_plan_id is required');
  if (!REVISION.test(repository.source_revision ?? '')) {
    blockers.push('source_revision must be a lowercase 40-character Git revision');
  }
  if (repository.evidence?.source_revision !== repository.source_revision) {
    blockers.push('source evidence is stale');
  }
  if (
    repository.role === 'module' &&
    repository.portal_pinned_revision !== repository.source_revision
  ) {
    blockers.push('portal/module revision map is stale');
  }
}

function planRepositoryClosure(repository, contract) {
  const blockers = [];
  const includedPaths = [];
  const excludedPaths = [];
  const decisions = [];
  validateRepositoryIdentity(repository, contract, blockers);
  const verifiedArtifacts = verifyRepositoryArtifacts(repository, blockers);
  const exactPaths = new Set(
    (repository.plan_exact_paths ?? []).map(normalizePath),
  );
  const seenPaths = new Set();

  for (const rawEntry of repository.changed_entries ?? []) {
    const entry = {
      ...rawEntry,
      path: normalizePath(rawEntry.path),
    };
    const reasons = [];
    let include = true;
    seenPaths.add(entry.path);

    if (!validRelativePath(entry.path)) {
      include = false;
      reasons.push('path is not repository-relative');
      pushUnique(blockers, `invalid repository-relative path: ${entry.path}`);
    }
    if (LEGACY_SINGLETON.test(entry.path)) {
      include = false;
      reasons.push('legacy singleton session artifact is prohibited');
      pushUnique(blockers, `prohibited singleton session artifact: ${entry.path}`);
    }
    if (entry.secret === true) {
      include = false;
      reasons.push('suspected secret');
      pushUnique(blockers, `suspected secret must not be staged: ${entry.path}`);
    }
    if (entry.thread_id !== repository.thread_id) {
      include = false;
      reasons.push('owned by another thread');
    }
    if (entry.worktree_id !== repository.worktree_id) {
      include = false;
      reasons.push('owned by another worktree');
    }
    if (entry.owner_repository_id !== repository.repository_id) {
      include = false;
      reasons.push('owned by another repository');
    }
    if (
      entry.nested_repository_id &&
      entry.kind !== 'gitlink'
    ) {
      include = false;
      reasons.push('nested repository content belongs to a child closure');
    }
    if (entry.kind === 'gitlink') {
      if (
        entry.gitlink_update_approved !== true ||
        entry.approved_plan_id !== repository.active_plan_id
      ) {
        include = false;
        reasons.push('gitlink update is not explicitly approved by the active plan');
      }
    }
    if (entry.kind === 'artifact') {
      const verified = verifiedArtifacts.get(entry.path);
      if (!verified) {
        include = false;
        reasons.push('artifact lacks a verified approval hash');
        pushUnique(blockers, `unverified workflow artifact: ${entry.path}`);
      } else if (
        entry.approval_hash !== verified.approval_hash ||
        entry.artifact_id !== verified.metadata.artifact_id
      ) {
        include = false;
        reasons.push('artifact identity or approval hash does not match');
        pushUnique(blockers, `mutated workflow artifact: ${entry.path}`);
      }
    }
    if (entry.evidence_source_revision !== repository.source_revision) {
      include = false;
      reasons.push('entry evidence is stale');
      pushUnique(blockers, `stale entry evidence: ${entry.path}`);
    }
    if (['local_only', 'unrelated'].includes(entry.classification)) {
      include = false;
      reasons.push(`${entry.classification} changes are excluded`);
    } else if (!INCLUDED_CLASSIFICATIONS.has(entry.classification)) {
      include = false;
      reasons.push('classification is unknown');
      pushUnique(blockers, `unknown closure classification: ${entry.path}`);
    }
    if (
      entry.kind !== 'artifact' &&
      entry.kind !== 'gitlink' &&
      !exactPaths.has(entry.path)
    ) {
      include = false;
      reasons.push('path is outside the active plan exact file list');
    }

    if (include) {
      includedPaths.push(entry.path);
      decisions.push({ path: entry.path, decision: 'include', reasons: [] });
    } else {
      excludedPaths.push(entry.path);
      decisions.push({ path: entry.path, decision: 'exclude', reasons });
    }
  }

  for (const requiredPath of exactPaths) {
    if (!seenPaths.has(requiredPath)) {
      pushUnique(blockers, `active plan path is missing from closure: ${requiredPath}`);
    }
  }

  const uniqueIncludedPaths = [...new Set(includedPaths)].sort();
  const uniqueExcludedPaths = [...new Set(excludedPaths)].sort();
  return {
    repository_id: repository.repository_id,
    repository_role: repository.role,
    git_root: repository.git_root,
    thread_id: repository.thread_id,
    worktree_id: repository.worktree_id,
    source_revision: repository.source_revision,
    active_contract_id: repository.active_contract_id,
    active_plan_id: repository.active_plan_id,
    status: blockers.length === 0 ? 'complete' : 'blocked',
    blockers,
    included_paths: uniqueIncludedPaths,
    excluded_paths: uniqueExcludedPaths,
    decisions,
    staging_commands: uniqueIncludedPaths.map((path) => [
      'git',
      'add',
      '--',
      path,
    ]),
  };
}

export function planRepositoryLocalClosures(contract) {
  if (contract?.schema_version !== 1) {
    throw new TypeError('git closure schema_version must be 1');
  }
  if (!contract.active_thread_id || !contract.active_worktree_id) {
    throw new TypeError('active thread and worktree identities are required');
  }
  if (!Array.isArray(contract.repositories) || contract.repositories.length === 0) {
    throw new TypeError('repositories must be a non-empty array');
  }
  const identities = contract.repositories.map(
    ({ repository_id: repositoryId }) => repositoryId,
  );
  if (new Set(identities).size !== identities.length) {
    throw new TypeError('repository closures must have unique repository identities');
  }
  const closures = contract.repositories.map((repository) =>
    planRepositoryClosure(repository, contract),
  );
  return {
    schema_version: 1,
    active_thread_id: contract.active_thread_id,
    active_worktree_id: contract.active_worktree_id,
    status: closures.every(({ status }) => status === 'complete')
      ? 'complete'
      : 'blocked',
    closures,
    commit_units: closures.map((closure) => ({
      repository_id: closure.repository_id,
      git_root: closure.git_root,
      included_paths: closure.included_paths,
      independent_commit_required: true,
    })),
  };
}
