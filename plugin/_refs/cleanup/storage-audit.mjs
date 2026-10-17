import { execFile } from 'node:child_process';
import { lstat, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const helper = fileURLToPath(new URL('./storage_inventory.py', import.meta.url));
const samePath = (left, right) => process.platform === 'win32' ? left.toLowerCase() === right.toLowerCase() : left === right;
function within(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

async function reportTarget(root, output) {
  if (!path.isAbsolute(output) || within(root, output)) throw new Error('REPORT_OUTSIDE_ANALYSIS_ROOT_REQUIRED');
  let current = path.dirname(output);
  while (true) {
    const stat = await lstat(current);
    if (!stat.isDirectory() || stat.isSymbolicLink() || !samePath(current, await realpath(current))) throw new Error('UNSAFE_REPORT_PARENT');
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
  const physicalRoot = await realpath(root);
  const physicalOutput = path.join(await realpath(path.dirname(output)), path.basename(output));
  if (within(physicalRoot, physicalOutput)) throw new Error('REPORT_OUTSIDE_ANALYSIS_ROOT_REQUIRED');
  try { await lstat(output); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw new Error('REPORT_ALREADY_EXISTS');
}

/** Metadata inventory only. Its output is deliberately not a cleanup action/approval plan. */
export async function runStorageAudit(argv) {
  const options = { excludes: [] };
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1];
    if (!value || !['--root', '--python', '--exclude', '--max-seconds', '--out'].includes(flag)) throw new Error('INVALID_ARGUMENTS');
    if (flag === '--exclude') options.excludes.push(value);
    else {
      const key = flag.slice(2);
      if (Object.hasOwn(options, key)) throw new Error('DUPLICATE_ARGUMENT');
      options[key] = value;
    }
  }
  if (!options.root || !path.isAbsolute(options.root)) throw new Error('ABSOLUTE_ANALYSIS_ROOT_REQUIRED');
  if (!options.python || !path.isAbsolute(options.python) || options.python.includes('\0')) throw new Error('ABSOLUTE_PYTHON_REQUIRED');
  const root = path.resolve(options.root);
  const executable = await realpath(options.python);
  if (!(await lstat(executable)).isFile()) throw new Error('PYTHON_NOT_EXECUTABLE');
  for (const exclude of options.excludes) {
    if (!path.isAbsolute(exclude) || !within(root, path.resolve(exclude)) || samePath(root, path.resolve(exclude))) throw new Error('EXCLUDE_OUTSIDE_ANALYSIS_ROOT');
  }
  if (options['max-seconds'] !== undefined && (!Number.isFinite(Number(options['max-seconds'])) || Number(options['max-seconds']) < 0)) throw new Error('INVALID_SCAN_BUDGET');
  if (options.out) await reportTarget(root, options.out);
  const args = ['-I', '-S', '-B', helper, '--root', root];
  for (const exclude of options.excludes) args.push('--exclude', exclude);
  if (options['max-seconds'] !== undefined) args.push('--max-seconds', options['max-seconds']);
  // No implicit timeout or content-hashing/file-count cap. Partition large scans
  // or request a budget explicitly; a killed process never supplies a complete result.
  const pending = exec(executable, args, { windowsHide: true, maxBuffer: 128 * 1024 * 1024 });
  pending.child.stderr.on('data', chunk => process.stderr.write(chunk));
  const { stdout } = await pending;
  const result = { ...JSON.parse(stdout), schema_version: 1, kind: 'storage-audit', mutation_authorized: false };
  if (options.out) {
    await reportTarget(root, options.out);
    await writeFile(options.out, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' });
  }
  return result;
}
