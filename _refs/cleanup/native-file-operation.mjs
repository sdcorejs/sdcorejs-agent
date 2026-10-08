import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cleanupPath } from './cleanup-contract.mjs';
import { acquirePosixCleanupWriter, performPosixFileOperation, releasePosixCleanupWriter } from './posix-file-operation.mjs';

const exec = promisify(execFile);
const helper = fileURLToPath(new URL('./safe-file-operation.ps1', import.meta.url));
const stateKeys = ['size', 'mtime', 'ctime', 'ino', 'dev', 'mode', 'nlink'];
const wireNumbers = (values) => { const bytes = Buffer.alloc(values.length * 8); values.forEach((value, index) => bytes.writeDoubleLE(value, index * 8)); return bytes.toString('base64'); };
const failure = (code, source, extra = {}) => ({ source_removed: false, copy_created: false,
  copy_verified: false, destination: null, fingerprint: null, allocated_bytes: null,
  errors: [{ code, path: source ?? null }], ...extra });

/**
 * Mutations use pinned Windows handles, never a checked path followed by unlink.
 * The caller supplies the approved content hash and full observed source stat.
 * A failed copy is retained and reported; no existing destination is overwritten.
 */
export async function performSafeFileOperation(options = {}) {
  if (process.platform !== 'win32') return performPosixFileOperation(options);
  const { root, root_state, source, destination = null, fingerprint, state, remove_source = true } = options;
  try {
    cleanupPath(source);
    if (destination !== null) cleanupPath(destination);
    if (typeof root !== 'string' || !root || root.includes('\0') || !/^sha256:[a-f0-9]{64}$/u.test(fingerprint ?? '')
      || typeof remove_source !== 'boolean' || (!remove_source && destination === null)
      || !root_state || ['ino', 'dev'].some((key) => typeof root_state[key] !== 'number' || !Number.isFinite(root_state[key]))
      || !state || stateKeys.some((key) => typeof state[key] !== 'number' || !Number.isFinite(state[key]))
      || !Number.isSafeInteger(state.size) || state.size < 0 || state.nlink !== 1) throw new Error('INVALID_NATIVE_OPERATION');
    if (destination && source.toLowerCase() === destination.toLowerCase()) throw new Error('INVALID_DESTINATION');
  } catch (error) { return failure(error.message, source); }
  if (process.platform !== 'win32') return failure('NATIVE_ATOMIC_MUTATION_UNAVAILABLE', source);
  const systemRoot = process.env.SystemRoot;
  if (!systemRoot || !/^[a-z]:\\/iu.test(systemRoot)) return failure('NATIVE_HELPER_UNAVAILABLE', source);
  const executable = path.win32.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  // Preserve observed doubles exactly across Windows PowerShell's JSON parser.
  const input = Buffer.from(JSON.stringify({ root, root_state, source, destination, fingerprint, state, remove_source,
    expected_wire: wireNumbers(stateKeys.map((key) => state[key])), root_wire: wireNumbers([root_state.ino, root_state.dev]) }), 'utf8').toString('base64');
  const argv = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', helper, '-InputBase64', input];
  const actual_command = [executable, ...argv];
  let result;
  try {
    const { stdout } = await exec(executable, argv, { windowsHide: true, maxBuffer: 1024 * 1024 });
    result = JSON.parse(stdout.trim());
    if (!result || typeof result.source_removed !== 'boolean' || typeof result.copy_created !== 'boolean'
      || typeof result.copy_verified !== 'boolean' || !Array.isArray(result.errors)
      || result.errors.some((error) => !error || typeof error.code !== 'string')
      || (result.copy_created && result.destination !== destination)
      || (result.copy_verified && (!result.copy_created || result.fingerprint !== fingerprint))
      || (result.source_removed && (!remove_source || (destination !== null && !result.copy_verified)))
      || (!result.errors.length && (!result.source_removed && remove_source || destination !== null && !result.copy_verified))
      || (result.allocated_bytes !== null && (!Number.isSafeInteger(result.allocated_bytes) || result.allocated_bytes < 0))) throw new Error('INVALID_NATIVE_RESULT');
  } catch (error) {
    // An interrupted helper can have created a recovery copy. Unknown is explicit.
    return failure(error.message === 'INVALID_NATIVE_RESULT' ? error.message : 'NATIVE_HELPER_FAILED', source,
      { source_removed: null, copy_created: null, copy_verified: false, destination, actual_command });
  }
  return { ...result, actual_command };
}

/** Reserve the one cleanup writer path using the same relative native handles. */
export async function acquireSafeCleanupWriter(options = {}) {
  if (process.platform !== 'win32') return acquirePosixCleanupWriter(options);
  const { root, root_state, identity } = options;
  const writerPath = '.sdcorejs/tmp/cleanup-runtime/writer.lock';
  const failed = (code, extra = {}) => ({ lock_created: false, path: writerPath, fingerprint: null, state: null,
    errors: [{ code, path: writerPath }], ...extra });
  if (typeof root !== 'string' || !root || root.includes('\0') || !root_state
    || ['ino', 'dev'].some((key) => typeof root_state[key] !== 'number' || !Number.isFinite(root_state[key]))
    || !/^sha256:v1:[a-f0-9]{64}$/u.test(identity ?? '')) return failed('INVALID_WRITER_IDENTITY');
  if (process.platform !== 'win32') return failed('NATIVE_ATOMIC_MUTATION_UNAVAILABLE');
  const systemRoot = process.env.SystemRoot;
  if (!systemRoot || !/^[a-z]:\\/iu.test(systemRoot)) return failed('NATIVE_HELPER_UNAVAILABLE');
  const executable = path.win32.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const input = Buffer.from(JSON.stringify({ operation: 'writer', root, root_state, identity,
    root_wire: wireNumbers([root_state.ino, root_state.dev]) }), 'utf8').toString('base64');
  const argv = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', helper, '-InputBase64', input];
  const actual_command = [executable, ...argv];
  try {
    const { stdout } = await exec(executable, argv, { windowsHide: true, maxBuffer: 1024 * 1024 });
    const result = JSON.parse(stdout.trim());
    if (!result || typeof result.copy_created !== 'boolean' || typeof result.copy_verified !== 'boolean'
      || result.source_removed !== false || !Array.isArray(result.errors)
      || result.errors.some((error) => !error || typeof error.code !== 'string')
      || (result.copy_created && result.destination !== writerPath)
      || (result.copy_verified && (!result.copy_created || !/^sha256:[a-f0-9]{64}$/u.test(result.fingerprint ?? '')
        || stateKeys.some((key) => typeof result.destination_state?.[key] !== 'number' || !Number.isFinite(result.destination_state[key]))))
      || (!result.errors.length && !result.copy_verified)) throw new Error('INVALID_NATIVE_RESULT');
    return { lock_created: result.copy_created, lock_verified: result.copy_verified, path: writerPath,
      fingerprint: result.fingerprint, state: result.destination_state, errors: result.errors, actual_command };
  } catch (error) {
    return failed(error.message === 'INVALID_NATIVE_RESULT' ? error.message : 'NATIVE_HELPER_FAILED',
      { lock_created: null, actual_command });
  }
}

/** POSIX keeps the advisory lock inode; Windows deletes only its pinned owned handle. */
export async function releaseSafeCleanupWriter({ root, root_state, writer, maintenance } = {}) {
  if (process.platform !== 'win32') return releasePosixCleanupWriter({ writer, maintenance });
  const result = await performSafeFileOperation({ root, root_state, source: writer.path, fingerprint: writer.fingerprint, state: writer.state });
  return { ...result, released: result.source_removed === true && result.errors.length === 0 };
}
