import { spawn } from 'node:child_process';
import { readFile, lstat, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CLEANUP_POSIX_FENCE, cleanupFingerprint, cleanupPath, validateCleanupPosixBoundary, validateCleanupMaintenance } from './cleanup-contract.mjs';

const helper = fileURLToPath(new URL('./safe-file-operation.py', import.meta.url));
const sessions = new WeakMap();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const supported = () => ['linux', 'darwin'].includes(process.platform);
const errorResult = code => ({ errors: [{ code, path: null }] });

async function trustedPython(executable) {
  if (!supported()) throw new Error('POSIX_PLATFORM_UNSUPPORTED');
  if (typeof executable !== 'string' || !path.isAbsolute(executable) || executable.includes('\0')) throw new Error('ABSOLUTE_PYTHON_REQUIRED');
  for (const key of ['LD_PRELOAD', 'LD_LIBRARY_PATH', 'DYLD_INSERT_LIBRARIES', 'DYLD_LIBRARY_PATH']) {
    if (process.env[key]) throw new Error('POSIX_EXECUTION_ENVIRONMENT_UNSAFE');
  }
  executable = await realpath(executable);
  let current = executable;
  while (true) {
    const stat = await lstat(current);
    if (stat.isSymbolicLink() || ![0, process.geteuid()].includes(stat.uid) || stat.mode & 0o022) throw new Error('UNTRUSTED_PYTHON_PATH');
    if (current === executable && (!stat.isFile() || !(stat.mode & 0o111))) throw new Error('PYTHON_NOT_EXECUTABLE');
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
  return { executable, sha256: hash(await readFile(executable)) };
}

/** A single helper process owns the stable lock across every operation. */
function connection(executable, root) {
  const argv = ['-I', '-S', '-B', helper];
  const actual_command = [executable, ...argv];
  const child = spawn(executable, argv, { cwd: root, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  let buffer = '', pending = null, ended = false, errorBytes = 0;
  const reject = code => {
    if (pending) { clearTimeout(pending.timer); const item = pending; pending = null; item.reject(new Error(code)); }
  };
  child.on('error', () => { ended = true; reject('POSIX_HELPER_UNAVAILABLE'); });
  child.on('close', () => { ended = true; reject('POSIX_HELPER_INTERRUPTED'); });
  child.stderr.on('data', chunk => { errorBytes += chunk.length; if (errorBytes > 1024 * 1024) { child.kill('SIGKILL'); reject('POSIX_HELPER_OUTPUT_LIMIT'); } });
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    buffer += chunk;
    if (Buffer.byteLength(buffer) > 1024 * 1024) { child.kill('SIGKILL'); reject('POSIX_HELPER_OUTPUT_LIMIT'); return; }
    const newline = buffer.indexOf('\n'); if (newline < 0) return;
    const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
    if (!pending || buffer.trim()) { child.kill('SIGKILL'); reject('INVALID_POSIX_RESULT'); return; }
    const item = pending; pending = null; clearTimeout(item.timer);
    try { item.resolve(JSON.parse(line)); } catch { child.kill('SIGKILL'); item.reject(new Error('INVALID_POSIX_RESULT')); }
  });
  return { actual_command,
    request(value) {
      if (ended || pending) return Promise.reject(new Error('POSIX_SESSION_UNAVAILABLE'));
      const line = JSON.stringify(value) + '\n';
      if (Buffer.byteLength(line) > 1024 * 1024) return Promise.reject(new Error('POSIX_REQUEST_LIMIT'));
      return new Promise((resolve, rejectRequest) => {
        const timer = setTimeout(() => { child.kill('SIGKILL'); reject('POSIX_HELPER_TIMEOUT'); }, 30_000);
        pending = { resolve, reject: rejectRequest, timer };
        child.stdin.write(line, error => { if (error) reject('POSIX_HELPER_INTERRUPTED'); });
      });
    },
    end() { child.stdin.end(); },
    abort() { child.kill('SIGKILL'); reject('POSIX_HELPER_INTERRUPTED'); },
  };
}

export async function inspectCleanupPosixCapabilities({ root, python } = {}) {
  let channel;
  try {
    const interpreter = await trustedPython(python);
    channel = connection(interpreter.executable, root);
    const result = await channel.request({ operation: 'probe', root });
    channel.end();
    if (!result?.supported) return { ...result, supported: false, actual_command: channel.actual_command };
    if (result.helper_sha256 !== hash(await readFile(helper)) || result.python?.executable !== interpreter.executable
      || !/^3\.(?:11|12|13|14)\.\d+$/u.test(result.python?.version ?? '')) throw new Error('POSIX_CAPABILITY_IDENTITY_CHANGED');
    return { ...result, python: { ...result.python, sha256: interpreter.sha256 }, actual_command: channel.actual_command };
  } catch (error) { channel?.abort(); return { supported: false, ...errorResult(error.message), actual_command: channel?.actual_command ?? [] }; }
}

export async function acquirePosixCleanupWriter({ root, root_state, identity, posix_boundary, maintenance, operations } = {}) {
  let channel;
  try {
    if (!/^sha256:v1:[a-f0-9]{64}$/u.test(identity ?? '')) throw new Error('INVALID_WRITER_IDENTITY');
    validateCleanupPosixBoundary(posix_boundary, root);
    validateCleanupMaintenance(posix_boundary.maintenance, maintenance);
    const python = await trustedPython(posix_boundary.python.executable);
    if (python.executable !== posix_boundary.python.executable || python.sha256 !== posix_boundary.python.sha256
      || hash(await readFile(helper)) !== posix_boundary.helper_sha256) throw new Error('POSIX_RUNTIME_IDENTITY_CHANGED');
    channel = connection(python.executable, root);
    const result = await channel.request({ operation: 'writer', root, root_state, identity, posix_boundary, maintenance, operations });
    if (result?.lock_verified !== true || result.path !== CLEANUP_POSIX_FENCE || !Array.isArray(result.errors) || result.errors.length) {
      channel.abort(); return { ...result, lock_verified: false, path: CLEANUP_POSIX_FENCE, actual_command: channel.actual_command };
    }
    const lock = { ...result, actual_command: channel.actual_command };
    sessions.set(lock, { channel, root, operations: structuredClone(operations), maintenance: structuredClone(maintenance) });
    return lock;
  } catch (error) { channel?.abort(); return { lock_created: false, lock_verified: false, path: CLEANUP_POSIX_FENCE, ...errorResult(error.message), actual_command: channel?.actual_command ?? [] }; }
}

export async function performPosixFileOperation({ root, writer, source, destination = null, fingerprint, state, remove_source = true, transaction, maintenance } = {}) {
  const failed = (code, extra = {}) => ({ source_removed: false, copy_created: false, copy_verified: false, destination: null, fingerprint: null, allocated_bytes: null, ...errorResult(code), ...extra });
  const session = sessions.get(writer);
  if (!session || session.root !== root) return failed('POSIX_WRITER_REQUIRED');
  try {
    cleanupPath(source); if (destination !== null) cleanupPath(destination);
    validateCleanupMaintenance(session.maintenance, maintenance);
    if (remove_source !== true) throw new Error('POSIX_COPY_ONLY_UNSUPPORTED');
    const action = { source, destination, fingerprint, state, remove_source, transaction };
    if (!session.operations.some(expected => cleanupFingerprint(expected) === cleanupFingerprint(action))) throw new Error('OPERATION_SCOPE_CHANGED');
    const result = await session.channel.request({ operation: 'mutate', action, maintenance });
    if (!result || typeof result.source_removed !== 'boolean' || typeof result.copy_created !== 'boolean'
      || typeof result.copy_verified !== 'boolean' || !Array.isArray(result.errors)
      || result.errors.some(error => typeof error?.code !== 'string') || typeof result.partial !== 'boolean'
      || !result.transaction || result.transaction.capture_path !== transaction.capture || result.transaction.journal !== transaction.journal
      || typeof result.transaction.source_captured !== 'boolean' || typeof result.transaction.contract_breach !== 'boolean'
      || !['present','absent','occupied','unknown'].includes(result.transaction.active_path_state)
      || result.copy_created && result.destination !== destination
      || result.copy_verified && (!result.copy_created || result.fingerprint !== fingerprint || !result.destination_state)
      || result.source_removed && (destination !== null && !result.copy_verified || !result.transaction.source_captured || result.transaction.capture_retained)
      || !result.errors.length && (!result.source_removed || result.partial || result.transaction.phase !== 'VERIFIED')
      || result.allocated_bytes !== null && (!Number.isSafeInteger(result.allocated_bytes) || result.allocated_bytes < 0)) throw new Error('INVALID_POSIX_RESULT');
    return { ...result, actual_command: session.channel.actual_command };
  } catch (error) {
    session.channel.abort();
    return failed(error.message, { source_removed: null, copy_created: null, destination, partial: true,
      transaction: { phase: 'UNKNOWN', journal: transaction?.journal, capture_path: transaction?.capture, source_captured: null,
        active_path_state: 'unknown', capture_retained: null, contract_breach: null }, actual_command: session.channel.actual_command });
  }
}

export async function releasePosixCleanupWriter({ writer, maintenance } = {}) {
  const session = sessions.get(writer);
  if (!session) return { released: false, ...errorResult('POSIX_WRITER_REQUIRED') };
  sessions.delete(writer);
  try {
    validateCleanupMaintenance(session.maintenance, maintenance);
    const result = await session.channel.request({ operation: 'release', maintenance });
    session.channel.end();
    if (result?.released !== true || result.lock_inode_retained !== true || !Array.isArray(result.errors) || result.errors.length) throw new Error('POSIX_WRITER_RELEASE_FAILED');
    return { ...result, actual_command: session.channel.actual_command };
  } catch (error) { session.channel.abort(); return { released: false, ...errorResult(error.message), actual_command: session.channel.actual_command }; }
}
