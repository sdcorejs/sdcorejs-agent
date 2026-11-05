import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { validateConventionPolicy, resolveConventionWriteAuthority } from './convention-contract.mjs';

const template = readFileSync(new URL('./project-bootstrap-template.md', import.meta.url), 'utf8').trimEnd();
const START = '<!-- sdcorejs-project-baseline:start -->';
const END = '<!-- sdcorejs-project-baseline:end -->';
export const bootstrapHash = bytes => createHash('sha256').update(bytes).digest('hex');
const proposal = (...reasons) => ({ status: 'proposal', reasons });

/** Authority arguments are trusted host facts, never parsed from reviewed source. */
export function planProjectBootstrap(options = {}) {
  const { policy, content = Buffer.alloc(0) } = options;
  const validation = validateConventionPolicy(policy);
  if (!validation.ok) return proposal(...validation.errors);
  const config = policy.project_bootstrap;
  if (!config || config.mode === 'disabled') return { status: 'disabled', reasons: ['project bootstrap is disabled'] };
  if (policy.repository?.repository_id !== options.repository_id || !options.repository_id) return proposal('repository owner mismatch');
  if (options.approved_target !== config.target) return proposal('target was not approved by the host');
  if (!Array.isArray(options.instruction_conflicts) || options.instruction_conflicts.length) return proposal('effective instruction scope is unverified or conflicting');
  const explicit = options.explicit_authority === true;
  const standing = config.mode === 'after-convention-sync' && options.policy_authorized === true && options.convention_sync_completed === true;
  const authority = resolveConventionWriteAuthority({ action: options.action, explicit_authority: explicit, policy, policy_status: standing ? 'valid' : 'missing', worker_role: options.worker_role });
  if (!authority.authorized || (!explicit && !standing)) return proposal('bootstrap authority unavailable', ...authority.blocked_reasons);
  if (!Buffer.isBuffer(content)) return proposal('content must be original bytes');
  const text = content.toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(content) || /\r(?!\n)/u.test(text) || text.includes('\0')) return proposal('unsupported encoding or line endings');
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const starts = text.split(START).length - 1, ends = text.split(END).length - 1;
  if (starts !== ends || starts > 1 || (starts === 1 && text.indexOf(END) < text.indexOf(START)) || (text.includes('sdcorejs-project-baseline:') && starts === 0)) return proposal('malformed managed markers; preserve human text');
  if (starts) {
    const start = text.indexOf(START), end = text.indexOf(END);
    const blockText = text.slice(start, end + END.length);
    const markerCount = (text.match(/<!-- sdcorejs-project-baseline:/gu) ?? []).length;
    const leadingBom = start === 1 && text[0] === '\uFEFF';
    if (markerCount !== 2 || (start > 0 && !leadingBom && text[start - 1] !== '\n') || !/^(?:\r?\n|$)/u.test(text.slice(end + END.length)) || !blockText.includes('Managed by sdcorejs-explore; template version 1.')) return proposal('unsupported managed block version or boundary');
  }
  const conventions = path.posix.relative(path.posix.dirname(config.target), '.sdcorejs/conventions');
  const block = template.replaceAll('{{conventions_path}}', conventions).replace(/\r?\n/gu, newline);
  let next;
  if (!starts) next = text + (text && !text.endsWith('\n') ? newline : '') + block + newline;
  else next = text.slice(0, text.indexOf(START)) + block + text.slice(text.indexOf(END) + END.length);
  const nextBytes = Buffer.from(next, 'utf8');
  return { status: nextBytes.equals(content) ? 'unchanged' : 'ready', target: config.target, expected_hash: bootstrapHash(content), content: nextBytes, authority: authority.write_authority, template_version: 1 };
}

async function statIfExists(file) {
  try { return await fs.lstat(file); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function inspectTarget(root, relative) {
  const resolved = path.resolve(root);
  if ((await fs.realpath(resolved)).toLowerCase() !== resolved.toLowerCase() || (await fs.lstat(resolved)).isSymbolicLink()) throw new Error('repository root must not be a link');
  if (!await statIfExists(path.join(resolved, '.git'))) throw new Error('repository root is not verified');
  const parts = relative.split('/'); let current = resolved;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]); const stat = await statIfExists(current);
    if (stat?.isSymbolicLink()) throw new Error('linked or reparse target refused');
    if (stat && (await fs.realpath(current)).toLowerCase() !== current.toLowerCase()) throw new Error('path identity changed');
    if (i < parts.length - 1) {
      if (!stat?.isDirectory()) throw new Error('target parent must already exist');
      if (await statIfExists(path.join(current, '.git'))) throw new Error('nested repository belongs to another owner');
    } else if (stat && (!stat.isFile() || stat.nlink !== 1)) throw new Error('target must be an ordinary unlinked file');
  }
  return current;
}
async function readTarget(target) { try { return await fs.readFile(target); } catch (error) { if (error.code === 'ENOENT') return Buffer.alloc(0); throw error; } }

/** A cooperative lock is not protection against editors outside the host contract. */
export async function applyProjectBootstrap(options = {}) {
  const preflight = planProjectBootstrap({ ...options, content: Buffer.alloc(0) });
  if (!['ready', 'unchanged'].includes(preflight.status)) return preflight;
  const contract = options.writer_contract;
  if (contract?.kind !== 'cooperative' || contract.all_writers_cooperate !== true || contract.external_editors_excluded !== true) return proposal('no verified cooperative writer ownership; return a patch proposal');
  if (!/^[a-f0-9]{64}$/u.test(options.expected_hash ?? '')) return proposal('expected content hash is required');
  let lock, lockPath, temporary, replaced = false;
  try {
    const target = await inspectTarget(options.root, preflight.target);
    lockPath = target + '.sdcorejs.lock';
    lock = await fs.open(lockPath, 'wx', 0o600);
    await inspectTarget(options.root, preflight.target);
    const before = await readTarget(target);
    if (bootstrapHash(before) !== options.expected_hash) return proposal('concurrent edit or stale expected hash');
    const planned = planProjectBootstrap({ ...options, content: before });
    if (planned.status !== 'ready') return planned;
    temporary = target + '.sdcorejs-' + randomUUID() + '.tmp';
    const priorStat = await statIfExists(target);
    const file = await fs.open(temporary, 'wx', priorStat?.mode ?? 0o600);
    try { await file.writeFile(planned.content); await file.sync(); } finally { await file.close(); }
    await inspectTarget(options.root, preflight.target);
    if (bootstrapHash(await readTarget(target)) !== options.expected_hash) return proposal('concurrent edit before replacement');
    await fs.rename(temporary, target); temporary = null; replaced = true;
    const after = await fs.readFile(target);
    if (!after.equals(planned.content)) throw new Error('post-write verification failed; do not overwrite concurrent changes');
    return { status: 'written', target: planned.target, before_hash: options.expected_hash, after_hash: bootstrapHash(after), authority: planned.authority, template_version: 1 };
  } catch (error) {
    if (replaced) return { status: 'verification-failed', write_performed: true, reasons: [error.message] };
    return proposal(error.code === 'EEXIST' ? 'another cooperative writer owns the target' : error.message);
  } finally {
    if (temporary) await fs.unlink(temporary).catch(() => {});
    if (lock) { await lock.close(); await fs.unlink(lockPath); }
  }
}
