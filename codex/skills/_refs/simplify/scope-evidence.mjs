import { createHash } from 'node:crypto';
import { normalizeRepositoryPath } from '../orchestration/execution-contract.mjs';

// The caller supplies the selected files' raw bytes, with null for a missing file.
export function simplifyScopeHash(files) {
  const entries = new Map();
  for (const { path, content } of files) {
    const name = normalizeRepositoryPath(path);
    if (entries.has(name)) throw new TypeError('duplicate simplify snapshot path');
    if (content !== null && !(content instanceof Uint8Array)) {
      throw new TypeError('a simplify snapshot needs file bytes or explicit absence');
    }
    entries.set(name, content === null ? null : createHash('sha256').update(content).digest('hex'));
  }
  const ordered = [...entries.keys()].sort().map(name => [name, entries.get(name)]);
  return createHash('sha256').update(JSON.stringify(ordered)).digest('hex');
}

export function validHunk(range) {
  return Number.isSafeInteger(range?.start) && Number.isSafeInteger(range?.count) &&
    range.count >= 0 && range.start >= (range.count === 0 ? 0 : 1) &&
    Number.isSafeInteger(range.start + range.count);
}

export function containsHunk(allowed, observed) {
  if (!validHunk(allowed) || !validHunk(observed)) return false;
  if (allowed.count === 0) return observed.count === 0 && observed.start === allowed.start;
  return observed.start >= allowed.start &&
    observed.start + Math.max(1, observed.count) <= allowed.start + allowed.count;
}

// The task diff ends at the pre-Simplify tree; the first pass starts there.
// Retain the requested side in that shared coordinate system.
export function simplifyPatchHunks(path, patch, side = 'old') {
  if (side !== 'old' && side !== 'new') throw new TypeError('expected old or new side');
  const name = normalizeRepositoryPath(path);
  const lines = patch.split('\n');
  const hunks = [];
  let headerSeen = false;
  let oldLines = 0;
  let newLines = 0;
  for (const line of lines) {
    if (line.startsWith('diff --git ')) {
      if (headerSeen || hunks.length) throw new Error('expected a single-file patch');
      headerSeen = true;
      continue;
    }
    if (/^(?:old mode|new mode|rename |copy |Binary files |GIT binary patch)/u.test(line)) {
      throw new Error('non-text or metadata change needs separate scope');
    }
    if (line.startsWith('@@')) {
      if (!headerSeen || oldLines || newLines) throw new Error('incomplete simplify hunk');
      const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(?: |$)/u.exec(line);
      if (!m) throw new Error('invalid simplify hunk header');
      oldLines = Number(m[2] ?? 1);
      newLines = Number(m[4] ?? 1);
      const original = { path: name, start: Number(m[1]), count: oldLines };
      const candidate = { path: name, start: Number(m[3]), count: newLines };
      if (!validHunk(original) || !validHunk(candidate) || !(oldLines || newLines)) {
        throw new Error('invalid simplify hunk range');
      }
      hunks.push(side === 'old' ? original : candidate);
    } else if (hunks.length && line !== '' && !line.startsWith('\\ No newline at end of file')) {
      if (line.startsWith('-') && oldLines > 0) oldLines--;
      else if (line.startsWith('+') && newLines > 0) newLines--;
      else throw new Error('expected a complete zero-context simplify patch');
    }
  }
  if (!hunks.length || oldLines || newLines) throw new Error('missing or incomplete simplify hunks');
  return hunks;
}
