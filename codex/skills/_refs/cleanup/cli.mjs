import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { scanCleanup, freezeCleanupPlan, applyCleanupPlan, restoreCleanup } from './cleanup-engine.mjs';

/** Portable harness entrypoint. Analysis is default; mutations require exact supplied authority. */
export async function runCleanupCli(argv) {
  const mode = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'analyze';
  const args = mode === argv[0] ? argv.slice(1) : argv;
  if (!['analyze', 'plan', 'apply', 'restore', 'task-tail-cleanup'].includes(mode)) throw new Error('UNKNOWN_CLEANUP_MODE');
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
