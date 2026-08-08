/**
 * Visual Companion path resolution and filesystem containment.
 *
 * Runtime state is conversation-local. It lives under the execution host's
 * `.sdcorejs/tmp/`, which is already gitignored and already classified
 * `local_only` by the artifact lifecycle, so a companion session can never be
 * mistaken for a durable Product or Design artifact.
 */

import { lstatSync, mkdirSync, realpathSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ERROR_CODES, SESSION_ID } from './protocol.mjs';
import { ASSET_EXTENSION, ASSET_NAME } from './screen.mjs';

export const RUNTIME_ROOT_SEGMENTS = Object.freeze(['.sdcorejs', 'tmp', 'visual-companion']);
export const ALLOWED_ASSET_EXTENSIONS = Object.freeze(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);

/**
 * Resolve the runtime root for a project.
 *
 * Falls back to an OS temporary directory when the execution host cannot hold
 * local runtime state, so the companion still works in a read-only or
 * non-repository checkout instead of failing the whole brainstorming turn.
 */
export function runtimeRootCandidates({ projectRoot, tmpdir = os.tmpdir() } = {}) {
  const candidates = [];
  if (projectRoot) {
    candidates.push({ root: path.resolve(projectRoot, ...RUNTIME_ROOT_SEGMENTS), location: 'project' });
  }
  candidates.push({ root: path.join(tmpdir, 'sdcorejs-visual-companion'), location: 'os-temp' });
  return candidates;
}

export function resolveRuntimeRoot({ projectRoot, tmpdir = os.tmpdir(), ensure = true } = {}) {
  const candidates = runtimeRootCandidates({ projectRoot, tmpdir });

  for (const candidate of candidates) {
    if (!ensure) return candidate;
    try {
      mkdirSync(candidate.root, { recursive: true, mode: 0o700 });
      return candidate;
    } catch {
      // Try the next candidate rather than failing the brainstorming turn.
    }
  }
  throw new Error('unable to create a Visual Companion runtime root');
}

/** Session paths inside an already-resolved runtime root. */
export function sessionPathsIn({ root, location, sessionId }) {
  if (!SESSION_ID.test(sessionId ?? '')) {
    throw new TypeError('sessionId must be a Visual Companion session identifier');
  }
  const sessionDir = path.join(root, 'sessions', sessionId);
  return {
    location,
    runtimeRoot: root,
    sessionDir,
    contentDir: path.join(sessionDir, 'content'),
    stateDir: path.join(sessionDir, 'state'),
    serverInfoFile: path.join(sessionDir, 'state', 'server-info.json'),
    eventsFile: path.join(sessionDir, 'state', 'events.jsonl'),
    stoppedFile: path.join(sessionDir, 'state', 'stopped.json'),
  };
}

export function resolveSessionPaths({ projectRoot, sessionId, tmpdir = os.tmpdir(), ensure = true } = {}) {
  if (!SESSION_ID.test(sessionId ?? '')) {
    throw new TypeError('sessionId must be a Visual Companion session identifier');
  }
  const { root, location } = resolveRuntimeRoot({ projectRoot, tmpdir, ensure });
  const paths = sessionPathsIn({ root, location, sessionId });
  if (ensure) {
    mkdirSync(paths.contentDir, { recursive: true, mode: 0o700 });
    mkdirSync(paths.stateDir, { recursive: true, mode: 0o700 });
  }
  return paths;
}

/**
 * Resolve a requested asset name inside the session content directory.
 *
 * Containment is proven, not assumed: the name must be in the current screen's
 * allowlist, must be a plain regular file, must not be a link, and its real
 * path must sit under the real content directory. Anything else is a 404 rather
 * than a diagnostic, so probing learns nothing.
 */
export function resolveContainedAsset(contentDir, requestedName, allowedNames = []) {
  const name = String(requestedName ?? '');
  if (!name || name.includes('/') || name.includes('\\') || name.includes('\0')) {
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }
  if (name.startsWith('.') || name.includes('..')) {
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }
  if (!ASSET_NAME.test(name) || !ASSET_EXTENSION.test(name)) {
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }
  if (!allowedNames.includes(name)) {
    // Only assets the current screen actually references are reachable, so the
    // content directory is not a general file server.
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }

  const candidate = path.join(contentDir, name);
  let realContentDir;
  let realCandidate;
  try {
    const link = lstatSync(candidate);
    if (link.isSymbolicLink() || !link.isFile()) return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
    // A hardlinked file can alias content outside the directory. Reject it
    // where the platform reports link counts.
    if (typeof link.nlink === 'number' && link.nlink > 1) {
      return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
    }
    realContentDir = realpathSync(contentDir);
    realCandidate = realpathSync(candidate);
    if (!statSync(realCandidate).isFile()) return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  } catch {
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }
  if (realCandidate !== path.join(realContentDir, name)) {
    return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  }
  return { ok: true, path: realCandidate, extension: path.extname(realCandidate).toLowerCase() };
}
