import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { scanCleanup, freezeCleanupPlan, applyCleanupPlan, restoreCleanup } from './cleanup-engine.mjs';
import { runStorageAudit } from './storage-audit.mjs';
import path from 'node:path';
import { planPostMergeCleanup } from './post-merge.mjs';
import { auditResources, parseResourceAuditArgs } from './resource-audit.mjs';
import { coordinateResourceCleanup } from './resource-lifecycle.mjs';
import { planWorkspaceBatch, applyWorkspaceBatch } from './workspace-batch.mjs';

/** Portable harness entrypoint. Analysis is default; mutations require exact supplied authority. */
export async function runCleanupCli(argv) {
  const mode = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'analyze';
  const args = mode === argv[0] ? argv.slice(1) : argv;
  if (mode === 'storage-audit') return runStorageAudit(args);
  if (mode === 'resource-audit') return auditResources(parseResourceAuditArgs(args));
  if (!['analyze', 'plan', 'apply', 'restore', 'task-tail-cleanup', 'post-merge-cleanup', 'lifecycle-assess', 'workspace-plan', 'workspace-apply'].includes(mode)) throw new Error('UNKNOWN_CLEANUP_MODE');
  const options = { scope: [], reference_scope: [] };
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index], value = args[index + 1];
    if (!value || !['--root', '--scope', '--reference-scope', '--input'].includes(flag)) throw new Error('INVALID_ARGUMENTS');
    if (flag === '--scope') options.scope.push(value);
    else if (flag === '--reference-scope') options.reference_scope.push(value);
    else options[flag.slice(2)] = value;
  }
  if (!options.root) throw new Error('EXPLICIT_ROOT_REQUIRED');
  const input = options.input ? JSON.parse(await readFile(options.input, 'utf8')) : {};
  if (mode === 'workspace-plan' || mode === 'workspace-apply') {
    if (!options.input || !path.isAbsolute(options.root) || options.scope.length || options.reference_scope.length) throw new Error('INVALID_ARGUMENTS');
    const root = path.resolve(options.root);
    return mode === 'workspace-plan' ? planWorkspaceBatch({ ...input, root }) : applyWorkspaceBatch({ ...input, root });
  }
  if (mode === 'lifecycle-assess') {
    if (!options.input || options.scope.length || options.reference_scope.length) throw new Error('INVALID_ARGUMENTS');
    const roots = [input.repository?.root, input.snapshot?.repository?.root, input.audit?.repository?.root].filter(value => value !== undefined);
    if (!roots.length || roots.some(value => typeof value !== 'string' || value !== path.resolve(options.root))) throw new Error('RESOURCE_LIFECYCLE_ROOT_MISMATCH');
    return coordinateResourceCleanup(input);
  }
  if (mode === 'post-merge-cleanup') {
    if (!options.input || options.scope.length || options.reference_scope.length) throw new Error('INVALID_ARGUMENTS');
    if (path.resolve(options.root) !== input.repository?.root) throw new Error('POST_MERGE_ROOT_MISMATCH');
    return planPostMergeCleanup(input);
  }
  if (mode === 'analyze') {
    const analysis = await scanCleanup({ ...input, ...options });
    return { ...analysis, findings: analysis.findings.map(({ path, classification, risk, certainty, reasons, unknowns, protected: protectedPath, fingerprint }) => ({ path, classification, risk, certainty, reasons, unknowns, protected: protectedPath, fingerprint })) };
  }
  if (mode === 'plan') return freezeCleanupPlan(await scanCleanup({ ...input, ...options }), {
    actions: input.actions ?? [], ...(input.posix_boundary ? { posix_boundary: input.posix_boundary } : {}),
  });
  if (mode === 'restore') return restoreCleanup({ ...input, root: options.root });
  if (mode === 'task-tail-cleanup' && !input.policy) throw new Error('TASK_POLICY_AUTHORITY_REQUIRED');
  return applyCleanupPlan({ ...input, root: options.root,
    ...(mode === 'task-tail-cleanup' ? { approval: null } : {}) });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  runCleanupCli(process.argv.slice(2)).then((result) => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (['blocked', 'partial'].includes(result.status)) process.exitCode = 1;
  }).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
