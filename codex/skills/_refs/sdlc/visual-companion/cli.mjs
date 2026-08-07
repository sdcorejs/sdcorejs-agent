#!/usr/bin/env node

/**
 * Visual Companion command line.
 *
 * This is the only entry point a skill drives. Every command prints exactly one
 * JSON object on stdout and exits non-zero on failure, so a caller never has to
 * parse prose to learn what happened.
 *
 * `start` detaches a session server that outlives this process; the remaining
 * commands are short-lived clients that talk to it over its own authenticated
 * admin endpoints. The session key travels to the detached server through a
 * stdin pipe rather than argv or the environment, because both of those are
 * readable from a process listing.
 *
 * Independent implementation. Behavioural inspiration only from the Superpowers
 * brainstorming companion (https://github.com/obra/superpowers, MIT). No source
 * was copied; see `_refs/sdlc/visual-companion/README.md`.
 */

import { spawn } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  ERROR_CODES,
  INSTANCE_ID,
  LIMITS,
  PROTOCOL_VERSION,
  RESULT_CODES,
  SESSION_ID,
  TOKEN,
  decodeCursor,
  generateInstanceId,
  generateSessionId,
  generateToken,
  redactObject,
  resolveBindHost,
  summarizeEvents,
} from './protocol.mjs';
import { openInBrowser } from './launcher.mjs';
import { resolveRuntime } from './renderer.mjs';
import { resolveSessionPaths, runtimeRootCandidates, sessionPathsIn } from './paths.mjs';
import { validateVisualScreen } from './screen.mjs';
import { createCompanionServer } from './server.mjs';

const SELF = fileURLToPath(import.meta.url);

export const COMMANDS = Object.freeze([
  'start',
  'status',
  'publish',
  'events',
  'waiting',
  'stop',
  'cleanup',
]);

/** Flags that never take a value, so `--open --port 0` parses unambiguously. */
const BOOLEAN_FLAGS = new Set([
  'open',
  'no-open',
  'allow-non-loopback',
  'reveal-url',
  'force',
  'all',
  'help',
]);

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;
const DEFAULT_START_TIMEOUT_MS = 15000;
const DEFAULT_CLEANUP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function parseArguments(argv) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const name = token.slice(2);
    if (name.length === 0) {
      return { ok: false, detail: 'bare -- is not a supported argument' };
    }
    if (BOOLEAN_FLAGS.has(name)) {
      flags[name] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      return { ok: false, detail: `--${name} requires a value` };
    }
    index += 1;
    flags[name] = value;
  }
  return { ok: true, command: positional[0] ?? null, positional: positional.slice(1), flags };
}

function fail(code, detail, extra = {}) {
  return { ok: false, code, detail, ...extra };
}

function succeed(code, payload = {}) {
  return { ok: true, code, ...payload };
}

function readJsonFile(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function writeAtomicJson(target, value) {
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, target);
}

function numberFlag(flags, name, fallback) {
  if (!Object.hasOwn(flags, name)) return { ok: true, value: fallback };
  const value = Number(flags[name]);
  if (!Number.isFinite(value) || value < 0) {
    return { ok: false, detail: `--${name} must be a non-negative number` };
  }
  return { ok: true, value };
}

function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

/**
 * Read a session's `server-info.json`.
 *
 * A malformed or foreign record is an unknown session rather than a partially
 * trusted one: acting on half of it is how a stale file ends up authenticating
 * against an unrelated port.
 */
export function loadSessionInfo({ projectRoot, sessionId, tmpdir = os.tmpdir() }) {
  if (!SESSION_ID.test(sessionId ?? '')) {
    return fail(ERROR_CODES.INVALID_ARGUMENTS, 'session id is not a Visual Companion session');
  }
  // A session may live under the project or under the OS temporary fallback.
  // Resolving only the preferred root would report a running session as
  // unknown whenever the project could not hold local runtime state.
  const paths = runtimeRootCandidates({ projectRoot, tmpdir })
    .map((candidate) => sessionPathsIn({ ...candidate, sessionId }))
    .find((candidate) => existsSync(candidate.serverInfoFile));
  if (!paths) {
    return fail(ERROR_CODES.UNKNOWN_SESSION, 'no server record for this session', {
      session_id: sessionId,
    });
  }
  let info;
  try {
    info = readJsonFile(paths.serverInfoFile);
  } catch (error) {
    return fail(ERROR_CODES.UNKNOWN_SESSION, `unreadable server record: ${String(error?.message ?? error)}`);
  }
  if (
    info?.session_id !== sessionId ||
    !INSTANCE_ID.test(info?.instance_id ?? '') ||
    !TOKEN.test(info?.token ?? '') ||
    !Number.isInteger(info?.port)
  ) {
    return fail(ERROR_CODES.UNKNOWN_SESSION, 'server record does not describe this session');
  }
  return { ok: true, info, paths };
}

/** One authenticated admin call against a running session server. */
export function adminRequest({
  info,
  method,
  pathname,
  body = null,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}) {
  return new Promise((resolve) => {
    const payload = body === null ? null : Buffer.from(JSON.stringify(body), 'utf8');
    const headers = { Accept: 'application/json' };
    if (payload) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = String(payload.length);
    }
    const target = httpRequest(
      {
        host: info.host,
        port: info.port,
        method,
        path: `${pathname}?key=${info.token}`,
        headers,
        timeout: timeoutMs,
      },
      (response) => {
        const chunks = [];
        let size = 0;
        response.on('data', (chunk) => {
          size += chunk.length;
          if (size > MAX_RESPONSE_BYTES) {
            response.destroy();
            resolve(fail(ERROR_CODES.PAYLOAD_TOO_LARGE, 'admin response exceeded the allowed size'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let parsed;
          try {
            parsed = JSON.parse(text || '{}');
          } catch {
            resolve(fail(ERROR_CODES.RUNTIME_UNAVAILABLE, 'admin response was not JSON'));
            return;
          }
          resolve({ ok: true, status: response.statusCode ?? 0, body: parsed });
        });
      },
    );
    target.on('timeout', () => {
      target.destroy();
      resolve(fail(ERROR_CODES.RUNTIME_UNAVAILABLE, 'the session server did not answer in time'));
    });
    target.on('error', (error) => {
      resolve(fail(ERROR_CODES.RUNTIME_UNAVAILABLE, `session server unreachable: ${String(error?.message ?? error)}`));
    });
    if (payload) target.write(payload);
    target.end();
  });
}

function authenticatedUrl(info) {
  const host = info.host.includes(':') ? `[${info.host}]` : info.host;
  return `http://${host}:${info.port}/?key=${info.token}`;
}

function redactedUrl(info) {
  const host = info.host.includes(':') ? `[${info.host}]` : info.host;
  return `http://${host}:${info.port}/?key=[REDACTED]`;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    process.stdin.on('data', (chunk) => {
      size += chunk.length;
      if (size > LIMITS.max_request_body_bytes) {
        process.stdin.destroy();
        reject(new Error('input exceeded the allowed size'));
        return;
      }
      chunks.push(chunk);
    });
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

async function readScreenInput(flags) {
  if (Object.hasOwn(flags, 'screen-file')) {
    try {
      return { ok: true, value: readJsonFile(path.resolve(String(flags['screen-file']))) };
    } catch (error) {
      return { ok: false, detail: `unreadable screen file: ${String(error?.message ?? error)}` };
    }
  }
  if (process.stdin.isTTY) {
    return { ok: false, detail: 'provide the screen through --screen-file or standard input' };
  }
  try {
    const text = await readStdin();
    if (text.trim().length === 0) return { ok: false, detail: 'no screen was supplied' };
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, detail: `unreadable screen input: ${String(error?.message ?? error)}` };
  }
}

function readMessageBundle(flags) {
  if (!Object.hasOwn(flags, 'messages-file')) return { ok: true, value: null };
  try {
    return { ok: true, value: readJsonFile(path.resolve(String(flags['messages-file']))) };
  } catch (error) {
    return { ok: false, detail: `unreadable messages file: ${String(error?.message ?? error)}` };
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForStartOutcome(paths, timeoutMs) {
  const errorFile = path.join(paths.stateDir, 'start-error.json');
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (existsSync(paths.serverInfoFile)) return { ok: true };
    if (existsSync(errorFile)) {
      try {
        const record = readJsonFile(errorFile);
        return { ok: false, code: record.code ?? ERROR_CODES.RUNTIME_UNAVAILABLE, detail: record.detail ?? 'the session server failed to start' };
      } catch {
        return { ok: false, code: ERROR_CODES.RUNTIME_UNAVAILABLE, detail: 'the session server failed to start' };
      }
    }
    if (Date.now() >= deadline) {
      return { ok: false, code: ERROR_CODES.RUNTIME_UNAVAILABLE, detail: 'the session server did not become ready in time' };
    }
    await sleep(25);
  }
}

function removeSessionDirectory(runtimeRoot, sessionDir) {
  // Containment is proven before any recursive delete: a session directory must
  // sit directly under this runtime root's `sessions/` and must carry a real
  // session name, so a crafted or stale record can never point the delete at an
  // unrelated tree.
  const sessionsRoot = path.resolve(runtimeRoot, 'sessions');
  const resolved = path.resolve(sessionDir);
  if (path.dirname(resolved) !== sessionsRoot) return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  if (!SESSION_ID.test(path.basename(resolved))) return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  try {
    if (lstatSync(resolved).isSymbolicLink()) return { ok: false, code: ERROR_CODES.PATH_ESCAPE };
  } catch {
    return { ok: false, code: ERROR_CODES.UNKNOWN_SESSION };
  }
  try {
    rmSync(resolved, { recursive: true, force: true });
  } catch (error) {
    // A directory a dying server still holds open is reported, never thrown:
    // failing to reclaim local state must not turn into a misleading error for
    // the command the caller actually ran.
    return { ok: false, code: ERROR_CODES.RUNTIME_UNAVAILABLE, detail: String(error?.message ?? error) };
  }
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Commands                                                                    */
/* -------------------------------------------------------------------------- */

async function commandStart(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const bind = resolveBindHost({
    host: flags.host ? String(flags.host) : undefined,
    allowNonLoopback: flags['allow-non-loopback'] === true,
  });
  if (!bind.ok) return fail(bind.code, bind.detail);

  const port = numberFlag(flags, 'port', 0);
  if (!port.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, port.detail);
  const idleTimeout = numberFlag(flags, 'idle-timeout-ms', LIMITS.default_idle_timeout_ms);
  if (!idleTimeout.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, idleTimeout.detail);
  const lifecycleCheck = numberFlag(flags, 'lifecycle-check-ms', LIMITS.default_lifecycle_check_ms);
  if (!lifecycleCheck.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, lifecycleCheck.detail);
  const ownerPid = numberFlag(flags, 'owner-pid', null);
  if (!ownerPid.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, ownerPid.detail);
  const startTimeout = numberFlag(flags, 'start-timeout-ms', DEFAULT_START_TIMEOUT_MS);
  if (!startTimeout.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, startTimeout.detail);
  const messages = readMessageBundle(flags);
  if (!messages.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, messages.detail);

  // Resolve the locale and message bundle before binding anything. A
  // non-English locale needs a complete bundle, and that used to surface only
  // when the browser requested the first screen, which left a started session
  // that failed on every render.
  const locale = flags.locale ? String(flags.locale) : 'en';
  try {
    resolveRuntime({ locale, messages: messages.value });
  } catch (error) {
    return fail(ERROR_CODES.INVALID_ARGUMENTS, String(error?.message ?? error));
  }

  const sessionId = generateSessionId();
  const instanceId = generateInstanceId();
  const token = generateToken();

  let paths;
  try {
    paths = resolveSessionPaths({ projectRoot, sessionId });
  } catch (error) {
    return fail(ERROR_CODES.RUNTIME_UNAVAILABLE, String(error?.message ?? error));
  }

  const config = {
    session_id: sessionId,
    instance_id: instanceId,
    token,
    host: bind.host,
    port: port.value,
    content_dir: paths.contentDir,
    state_dir: paths.stateDir,
    server_info_file: paths.serverInfoFile,
    locale,
    messages: messages.value,
    owner_pid: ownerPid.value,
    idle_timeout_ms: idleTimeout.value,
    lifecycle_check_ms: lifecycleCheck.value,
    runtime_root: paths.runtimeRoot,
    location: paths.location,
  };

  let child;
  try {
    child = spawn(process.execPath, [SELF, 'serve'], {
      detached: true,
      stdio: ['pipe', 'ignore', 'ignore'],
      windowsHide: true,
    });
  } catch (error) {
    return fail(ERROR_CODES.RUNTIME_UNAVAILABLE, `unable to start a session server: ${String(error?.message ?? error)}`);
  }
  child.on('error', () => {});
  child.stdin.on('error', () => {});
  child.stdin.end(JSON.stringify(config));
  child.unref();

  const outcome = await waitForStartOutcome(paths, startTimeout.value);
  if (!outcome.ok) {
    removeSessionDirectory(paths.runtimeRoot, paths.sessionDir);
    return fail(outcome.code, outcome.detail);
  }

  const loaded = loadSessionInfo({ projectRoot, sessionId });
  if (!loaded.ok) return loaded;
  const probe = await adminRequest({ info: loaded.info, method: 'GET', pathname: '/admin/status' });
  if (!probe.ok) return probe;
  if (probe.status !== 200 || probe.body?.ok !== true) {
    return fail(ERROR_CODES.RUNTIME_UNAVAILABLE, 'the session server refused its own status probe');
  }

  const url = authenticatedUrl(loaded.info);
  // Auto-open is opt-in. Launching a browser is a visible side effect on the
  // user's machine, so the caller has to have asked for it.
  const browser = openInBrowser(url, {
    enabled: flags.open === true && flags['no-open'] !== true,
  });

  return succeed(RESULT_CODES.SESSION_STARTED, {
    session_id: sessionId,
    instance_id: instanceId,
    protocol_version: PROTOCOL_VERSION,
    host: loaded.info.host,
    port: loaded.info.port,
    pid: loaded.info.pid,
    runtime_root_location: loaded.info.location,
    authenticated_url: url,
    display_url: redactedUrl(loaded.info),
    loopback: bind.loopback,
    security_warning: bind.warning,
    browser,
    status: probe.body.status,
  });
}

async function commandStatus(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const loaded = loadSessionInfo({ projectRoot, sessionId: String(flags.session ?? '') });
  if (!loaded.ok) return loaded;
  const response = await adminRequest({ info: loaded.info, method: 'GET', pathname: '/admin/status' });
  if (!response.ok) {
    return fail(ERROR_CODES.SESSION_NOT_RUNNING, response.detail, {
      session_id: loaded.info.session_id,
      process_alive: processAlive(loaded.info.pid),
      stopped: existsSync(loaded.paths.stoppedFile),
    });
  }
  if (response.status !== 200 || response.body?.ok !== true) {
    return fail(ERROR_CODES.SESSION_NOT_RUNNING, 'the session server did not report a status');
  }
  const payload = {
    session_id: loaded.info.session_id,
    protocol_version: PROTOCOL_VERSION,
    runtime_root_location: loaded.info.location,
    display_url: redactedUrl(loaded.info),
    status: response.body.status,
  };
  if (flags['reveal-url'] === true) payload.authenticated_url = authenticatedUrl(loaded.info);
  return succeed(RESULT_CODES.OK, payload);
}

async function commandPublish(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const loaded = loadSessionInfo({ projectRoot, sessionId: String(flags.session ?? '') });
  if (!loaded.ok) return loaded;
  const screen = await readScreenInput(flags);
  if (!screen.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, screen.detail);

  // Validate before the round trip so an authoring mistake reports every error
  // at once instead of the first one the server happens to hit.
  const errors = validateVisualScreen(screen.value);
  if (errors.length > 0) {
    return fail(ERROR_CODES.INVALID_SCREEN, 'the screen is not publishable', { errors });
  }

  const response = await adminRequest({
    info: loaded.info,
    method: 'POST',
    pathname: '/admin/publish',
    body: { screen: screen.value },
  });
  if (!response.ok) return response;
  if (response.status !== 200 || response.body?.ok !== true) {
    return fail(response.body?.code ?? ERROR_CODES.INVALID_SCREEN, response.body?.detail ?? 'the server rejected the screen');
  }
  return succeed(RESULT_CODES.SCREEN_PUBLISHED, {
    session_id: loaded.info.session_id,
    published: response.body.published,
  });
}

async function commandWaiting(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const loaded = loadSessionInfo({ projectRoot, sessionId: String(flags.session ?? '') });
  if (!loaded.ok) return loaded;
  const response = await adminRequest({
    info: loaded.info,
    method: 'POST',
    pathname: '/admin/waiting',
    body: {},
  });
  if (!response.ok) return response;
  if (response.status !== 200 || response.body?.ok !== true) {
    return fail(response.body?.code ?? ERROR_CODES.RUNTIME_UNAVAILABLE, 'the server refused the waiting screen');
  }
  return succeed(RESULT_CODES.WAITING_PUBLISHED, {
    session_id: loaded.info.session_id,
    published: response.body.published,
  });
}

async function commandEvents(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const loaded = loadSessionInfo({ projectRoot, sessionId: String(flags.session ?? '') });
  if (!loaded.ok) return loaded;
  let after = null;
  if (Object.hasOwn(flags, 'after')) {
    try {
      decodeCursor(String(flags.after));
      after = String(flags.after);
    } catch (error) {
      return fail(ERROR_CODES.INVALID_ARGUMENTS, String(error?.message ?? error));
    }
  }
  const response = await adminRequest({ info: loaded.info, method: 'GET', pathname: '/admin/events' });
  if (!response.ok) return response;
  if (response.status !== 200 || response.body?.ok !== true) {
    return fail(ERROR_CODES.RUNTIME_UNAVAILABLE, 'the server did not return the event log');
  }
  let summary;
  try {
    summary = summarizeEvents(response.body.events ?? [], { after });
  } catch (error) {
    return fail(ERROR_CODES.INVALID_EVENT, String(error?.message ?? error));
  }
  return succeed(RESULT_CODES.EVENTS_READ, {
    session_id: loaded.info.session_id,
    current: response.body.current,
    ...summary,
  });
}

async function commandStop(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const loaded = loadSessionInfo({ projectRoot, sessionId: String(flags.session ?? '') });
  if (!loaded.ok) return loaded;
  const instanceId = Object.hasOwn(flags, 'instance') ? String(flags.instance) : loaded.info.instance_id;
  if (!INSTANCE_ID.test(instanceId)) {
    return fail(ERROR_CODES.INVALID_ARGUMENTS, 'instance id is malformed');
  }
  const response = await adminRequest({
    info: loaded.info,
    method: 'POST',
    pathname: '/admin/stop',
    body: { instance_id: instanceId },
  });
  if (!response.ok) {
    if (existsSync(loaded.paths.stoppedFile) || !processAlive(loaded.info.pid)) {
      return fail(ERROR_CODES.SESSION_ALREADY_STOPPED, 'this session is no longer running', {
        session_id: loaded.info.session_id,
      });
    }
    return response;
  }
  if (response.status === 403) {
    return fail(ERROR_CODES.OWNERSHIP_UNPROVEN, 'the supplied instance id does not own this session');
  }
  if (response.status !== 200 || response.body?.ok !== true) {
    return fail(response.body?.code ?? ERROR_CODES.RUNTIME_UNAVAILABLE, 'the server refused the stop request');
  }
  return succeed(RESULT_CODES.SESSION_STOPPED, { session_id: loaded.info.session_id });
}

function commandCleanup(flags) {
  const projectRoot = path.resolve(String(flags['project-root'] ?? process.cwd()));
  const maxAge = numberFlag(flags, 'max-age-ms', DEFAULT_CLEANUP_MAX_AGE_MS);
  if (!maxAge.ok) return fail(ERROR_CODES.INVALID_ARGUMENTS, maxAge.detail);

  const requested = Object.hasOwn(flags, 'session') ? String(flags.session) : null;
  if (requested !== null && !SESSION_ID.test(requested)) {
    return fail(ERROR_CODES.INVALID_ARGUMENTS, 'session id is not a Visual Companion session');
  }

  const removed = [];
  const retained = [];
  const scanned = [];
  for (const { root: runtimeRoot, location } of runtimeRootCandidates({ projectRoot })) {
    const sessionsRoot = path.join(runtimeRoot, 'sessions');
    if (!existsSync(sessionsRoot)) continue;
    scanned.push(location);
    for (const name of readdirSync(sessionsRoot)) {
      if (!SESSION_ID.test(name)) continue;
      if (requested !== null && name !== requested) continue;
      const sessionDir = path.join(sessionsRoot, name);
      let info = null;
      try {
        info = readJsonFile(path.join(sessionDir, 'state', 'server-info.json'));
      } catch {
        info = null;
      }
      const stopped = existsSync(path.join(sessionDir, 'state', 'stopped.json'));
      const alive = info !== null && !stopped && processAlive(info.pid);
      let age = Number.POSITIVE_INFINITY;
      try {
        age = Date.now() - statSync(sessionDir).mtimeMs;
      } catch {
        age = Number.POSITIVE_INFINITY;
      }
      const expired = age > maxAge.value;
      const targeted = requested !== null;
      // A live session is only removed when the caller named it and forced the
      // removal. Reaping a running companion out from under a user mid-decision
      // is worse than leaving a directory behind.
      if (alive && !(targeted && flags.force === true)) {
        retained.push({ session_id: name, location, reason: 'running' });
        continue;
      }
      if (!alive && !expired && !targeted && flags.all !== true) {
        retained.push({ session_id: name, location, reason: 'within the retention window' });
        continue;
      }
      const result = removeSessionDirectory(runtimeRoot, sessionDir);
      if (result.ok) removed.push({ session_id: name, location });
      else retained.push({ session_id: name, location, reason: result.code });
    }
  }

  return succeed(RESULT_CODES.CLEANED, {
    scanned_locations: scanned,
    removed,
    retained,
  });
}

/* -------------------------------------------------------------------------- */
/* Detached server process                                                     */
/* -------------------------------------------------------------------------- */

async function runDetachedServer() {
  let config;
  try {
    config = JSON.parse(await readStdin());
  } catch {
    process.exitCode = 1;
    return;
  }
  const stateDir = String(config.state_dir);
  const recordFailure = (code, detail) => {
    try {
      mkdirSync(stateDir, { recursive: true, mode: 0o700 });
      writeAtomicJson(path.join(stateDir, 'start-error.json'), { code, detail });
    } catch {
      // The parent falls back to its readiness timeout.
    }
    process.exitCode = 1;
  };

  let session;
  try {
    session = createCompanionServer({
      sessionId: config.session_id,
      instanceId: config.instance_id,
      token: config.token,
      host: config.host,
      port: config.port,
      contentDir: config.content_dir,
      stateDir,
      locale: config.locale ?? 'en',
      messages: config.messages ?? null,
      ownerPid: config.owner_pid ?? null,
      idleTimeoutMs: config.idle_timeout_ms ?? LIMITS.default_idle_timeout_ms,
      lifecycleCheckMs: config.lifecycle_check_ms ?? LIMITS.default_lifecycle_check_ms,
    });
  } catch (error) {
    recordFailure(ERROR_CODES.RUNTIME_UNAVAILABLE, String(error?.message ?? error));
    return;
  }

  let boundPort;
  try {
    boundPort = await session.listen(config.port, config.host);
  } catch (error) {
    recordFailure(
      error?.code === 'EADDRINUSE' ? ERROR_CODES.PORT_UNAVAILABLE : ERROR_CODES.RUNTIME_UNAVAILABLE,
      String(error?.message ?? error),
    );
    return;
  }

  session.startLifecycleWatchdog();
  try {
    writeAtomicJson(String(config.server_info_file), {
      schema_version: 1,
      protocol_version: PROTOCOL_VERSION,
      session_id: config.session_id,
      instance_id: config.instance_id,
      token: config.token,
      host: config.host,
      port: boundPort,
      pid: process.pid,
      location: config.location ?? 'project',
      runtime_root: config.runtime_root ?? null,
      started_at: Date.now(),
    });
  } catch (error) {
    session.shutdown('unable to record server info');
    recordFailure(ERROR_CODES.RUNTIME_UNAVAILABLE, String(error?.message ?? error));
    return;
  }

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => session.shutdown(`received ${signal}`));
  }
}

/* -------------------------------------------------------------------------- */
/* Dispatch                                                                    */
/* -------------------------------------------------------------------------- */

export async function runCommand(command, flags) {
  switch (command) {
    case 'start':
      return commandStart(flags);
    case 'status':
      return commandStatus(flags);
    case 'publish':
      return commandPublish(flags);
    case 'waiting':
      return commandWaiting(flags);
    case 'events':
      return commandEvents(flags);
    case 'stop':
      return commandStop(flags);
    case 'cleanup':
      return commandCleanup(flags);
    default:
      return fail(ERROR_CODES.INVALID_ARGUMENTS, `unknown command: ${String(command)}`, {
        commands: [...COMMANDS],
      });
  }
}

function emit(result) {
  // Redaction is applied on the way out so no command can leak a session key
  // through a field that was added later. `start` re-attaches the one URL the
  // caller genuinely needs, and `status` only when the caller asked for it.
  const authenticated = result.authenticated_url;
  const safe = redactObject(result);
  if (typeof authenticated === 'string') safe.authenticated_url = authenticated;
  process.stdout.write(`${JSON.stringify(safe)}\n`);
  process.exitCode = result.ok === true ? 0 : 1;
}

async function main(argv) {
  if (argv[0] === 'serve') {
    await runDetachedServer();
    return;
  }
  const parsed = parseArguments(argv);
  if (!parsed.ok) {
    emit(fail(ERROR_CODES.INVALID_ARGUMENTS, parsed.detail, { commands: [...COMMANDS] }));
    return;
  }
  if (parsed.command === null || parsed.flags.help === true) {
    emit(fail(ERROR_CODES.INVALID_ARGUMENTS, 'a command is required', { commands: [...COMMANDS] }));
    return;
  }
  emit(await runCommand(parsed.command, parsed.flags));
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === pathToFileURL(SELF).href;

if (isDirectRun) {
  await main(process.argv.slice(2)).catch((error) => {
    emit(fail(ERROR_CODES.RUNTIME_UNAVAILABLE, String(error?.message ?? error)));
  });
}
