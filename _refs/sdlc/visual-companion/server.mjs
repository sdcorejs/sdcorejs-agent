/**
 * Visual Companion session server.
 *
 * A single authenticated loopback HTTP origin serves the browser surface and,
 * on the same port, an RFC 6455 WebSocket for reload push and browser events.
 *
 * Divergence from the Superpowers companion that inspired this: screens are
 * published through an authenticated admin endpoint rather than a filesystem
 * watcher. `publish` therefore returns only after the server has adopted the
 * screen and assigned its revision, which removes a publish/observe race and
 * avoids `fs.watch` platform differences. It also lets the server own screen
 * revision, which is what makes stale-event rejection possible at all.
 */

import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ERROR_CODES,
  LIMITS,
  contentSecurityPolicy,
  cookieNameForPort,
  isAllowedEventOrigin,
  redact,
  securityHeaders,
  sealEvent,
  timingSafeEqualString,
  validateClientEvent,
} from './protocol.mjs';
import {
  assertValidScreen,
  isMultiSelect,
  optionIds,
  referencedAssets,
} from './screen.mjs';
import { renderLiveDocument, renderPausedDocument, renderWaitingDocument } from './live-document.mjs';
import { CLIENT_SCRIPT_HASH } from './client-script.mjs';
import { resolveContainedAsset } from './paths.mjs';

const OPCODES = Object.freeze({ TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0a });
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const MIME_TYPES = Object.freeze({
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
});

export function computeAcceptKey(clientKey) {
  return createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}

export function encodeFrame(opcode, payload) {
  const length = payload.length;
  let header;
  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }
  header[0] = 0x80 | opcode;
  return Buffer.concat([header, payload]);
}

export function decodeFrame(buffer) {
  if (buffer.length < 2) return null;
  const opcode = buffer[0] & 0x0f;
  const masked = (buffer[1] & 0x80) !== 0;
  let payloadLength = buffer[1] & 0x7f;
  let offset = 2;
  if (!masked) throw new Error('client frames must be masked');
  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    const extended = buffer.readBigUInt64BE(2);
    if (extended > BigInt(LIMITS.max_frame_payload_bytes)) {
      throw new Error('frame payload exceeds the allowed size');
    }
    payloadLength = Number(extended);
    offset = 10;
  }
  if (payloadLength > LIMITS.max_frame_payload_bytes) {
    throw new Error('frame payload exceeds the allowed size');
  }
  const dataOffset = offset + 4;
  const total = dataOffset + payloadLength;
  if (buffer.length < total) return null;
  const mask = buffer.subarray(offset, dataOffset);
  const data = Buffer.alloc(payloadLength);
  for (let index = 0; index < payloadLength; index += 1) {
    data[index] = buffer[dataOffset + index] ^ mask[index % 4];
  }
  return { opcode, payload: data, bytesConsumed: total };
}

function writeAtomic(target, contents) {
  const temporary = `${target}.${process.pid}.tmp`;
  writeFileSync(temporary, contents, { mode: 0o600 });
  renameSync(temporary, target);
}

/**
 * Start a companion session server.
 *
 * The caller owns host resolution and token generation; this function only
 * binds, authenticates, and serves. Keeping policy out of the server is what
 * lets the protocol rules be unit-tested without a socket.
 */
export function createCompanionServer({
  sessionId,
  instanceId,
  token,
  host,
  port,
  contentDir,
  stateDir,
  locale = 'en',
  messages = null,
  ownerPid = null,
  idleTimeoutMs = LIMITS.default_idle_timeout_ms,
  lifecycleCheckMs = LIMITS.default_lifecycle_check_ms,
  now = () => Date.now(),
} = {}) {
  mkdirSync(contentDir, { recursive: true, mode: 0o700 });
  mkdirSync(stateDir, { recursive: true, mode: 0o700 });

  const eventsFile = path.join(stateDir, 'events.jsonl');
  const runtime = { locale, messages };

  const state = {
    boundPort: port,
    cookieName: cookieNameForPort(port),
    screen: null,
    screenRevision: 0,
    waiting: true,
    sequence: 0,
    seenEventIds: [],
    events: [],
    lastActivity: now(),
    stopped: false,
    stopReason: null,
  };

  const clients = new Set();

  const touch = () => {
    state.lastActivity = now();
  };

  function isAuthorized(request) {
    const url = request.url ?? '/';
    const queryIndex = url.indexOf('?');
    if (queryIndex >= 0) {
      const key = new URLSearchParams(url.slice(queryIndex + 1)).get('key');
      if (key !== null) return timingSafeEqualString(key, token);
    }
    const header = request.headers.cookie;
    if (!header) return false;
    for (const part of header.split(';')) {
      const eq = part.indexOf('=');
      if (eq < 0) continue;
      if (part.slice(0, eq).trim() !== state.cookieName) continue;
      return timingSafeEqualString(part.slice(eq + 1).trim(), token);
    }
    return false;
  }

  function baseHeaders(extra = {}) {
    return securityHeaders({
      'Content-Security-Policy': contentSecurityPolicy(CLIENT_SCRIPT_HASH),
      ...extra,
    });
  }

  function sendJson(response, status, payload) {
    const body = JSON.stringify(payload);
    response.writeHead(status, baseHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
    response.end(body);
  }

  function sendHtml(response, status, html) {
    response.writeHead(status, baseHeaders({ 'Content-Type': 'text/html; charset=utf-8' }));
    response.end(html);
  }

  function currentIdentity() {
    return {
      session_id: sessionId,
      screen_id: state.screen?.screen_id ?? null,
      screen_revision: state.screenRevision,
      option_ids: state.screen ? optionIds(state.screen) : [],
      multi_select: state.screen ? isMultiSelect(state.screen) : false,
    };
  }

  function broadcast(message) {
    const frame = encodeFrame(OPCODES.TEXT, Buffer.from(JSON.stringify(message)));
    for (const socket of clients) {
      try {
        socket.write(frame);
      } catch {
        clients.delete(socket);
      }
    }
  }

  function persistEvent(sealed) {
    state.events.push(sealed);
    if (state.events.length > LIMITS.max_events_per_session) state.events.shift();
    try {
      writeFileSync(eventsFile, `${JSON.stringify(sealed)}\n`, { flag: 'a', mode: 0o600 });
    } catch {
      // The in-memory log remains authoritative for the admin read path.
    }
  }

  function acceptEvent(raw) {
    const identity = currentIdentity();
    if (!identity.screen_id) {
      return { ok: false, errors: [{ code: ERROR_CODES.STALE_SCREEN, detail: 'no screen is published' }] };
    }
    const validation = validateClientEvent(raw, identity);
    if (!validation.ok) return validation;
    if (state.seenEventIds.includes(validation.event.event_id)) {
      return { ok: false, errors: [{ code: ERROR_CODES.REPLAYED_EVENT, detail: 'event_id already accepted' }] };
    }
    state.seenEventIds.push(validation.event.event_id);
    if (state.seenEventIds.length > LIMITS.max_event_id_memory) state.seenEventIds.shift();
    state.sequence += 1;
    const sealed = sealEvent(validation.event, { sequence: state.sequence, receivedAt: now() });
    persistEvent(sealed);
    return { ok: true, event: sealed };
  }

  function publishScreen(screen) {
    assertValidScreen(screen);
    state.screen = screen;
    state.screenRevision += 1;
    state.waiting = false;
    // A new screen invalidates prior exploration: those clicks answered a
    // different question, so they must not be replayed as current intent.
    state.seenEventIds = [];
    const target = path.join(contentDir, `${screen.screen_id}.r${state.screenRevision}.json`);
    writeAtomic(target, `${JSON.stringify(screen, null, 2)}\n`);
    touch();
    broadcast({ type: 'reload', screen_id: screen.screen_id, screen_revision: state.screenRevision });
    return {
      screen_id: screen.screen_id,
      screen_revision: state.screenRevision,
      option_ids: optionIds(screen),
      assets: referencedAssets(screen),
      path: target,
    };
  }

  function publishWaiting() {
    state.screen = null;
    state.screenRevision += 1;
    state.waiting = true;
    state.seenEventIds = [];
    touch();
    broadcast({ type: 'reload', screen_id: null, screen_revision: state.screenRevision });
    return { screen_revision: state.screenRevision, waiting: true };
  }

  function status() {
    return {
      session_id: sessionId,
      instance_id: instanceId,
      running: !state.stopped,
      waiting: state.waiting,
      port: state.boundPort,
      host,
      screen_id: state.screen?.screen_id ?? null,
      screen_revision: state.screenRevision,
      connected_clients: clients.size,
      event_count: state.events.length,
      idle_timeout_ms: idleTimeoutMs,
      last_activity: state.lastActivity,
    };
  }

  function handleAdmin(request, response, pathname) {
    if (pathname === '/admin/status' && request.method === 'GET') {
      sendJson(response, 200, { ok: true, status: status() });
      return true;
    }
    if (pathname === '/admin/events' && request.method === 'GET') {
      sendJson(response, 200, { ok: true, events: state.events, current: currentIdentity() });
      return true;
    }
    if (request.method !== 'POST') return false;

    let body = '';
    let tooLarge = false;
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > LIMITS.max_request_body_bytes) {
        tooLarge = true;
        request.destroy();
      }
    });
    request.on('end', () => {
      if (tooLarge) {
        sendJson(response, 413, { ok: false, code: ERROR_CODES.PAYLOAD_TOO_LARGE });
        return;
      }
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        sendJson(response, 400, { ok: false, code: ERROR_CODES.INVALID_ARGUMENTS });
        return;
      }
      try {
        if (pathname === '/admin/publish') {
          sendJson(response, 200, { ok: true, published: publishScreen(payload.screen) });
          return;
        }
        if (pathname === '/admin/waiting') {
          sendJson(response, 200, { ok: true, published: publishWaiting() });
          return;
        }
        if (pathname === '/admin/stop') {
          if (payload.instance_id !== instanceId) {
            sendJson(response, 403, { ok: false, code: ERROR_CODES.OWNERSHIP_UNPROVEN });
            return;
          }
          sendJson(response, 200, { ok: true, stopped: true });
          setImmediate(() => shutdown('explicit stop'));
          return;
        }
        sendJson(response, 404, { ok: false, code: ERROR_CODES.INVALID_ARGUMENTS });
      } catch (error) {
        sendJson(response, 400, {
          ok: false,
          code: ERROR_CODES.INVALID_SCREEN,
          detail: String(error?.message ?? error),
        });
      }
    });
    return true;
  }

  /**
   * Error boundary for the request path.
   *
   * `createServer`'s handler runs synchronously, so any throw below it becomes
   * an unhandled exception and takes the whole session down with it. A render
   * failure must degrade one response, never kill a live companion the user is
   * mid-decision on.
   */
  function handleRequest(request, response) {
    try {
      routeRequest(request, response);
    } catch (error) {
      if (!response.headersSent) {
        response.writeHead(500, baseHeaders({ 'Content-Type': 'application/json; charset=utf-8' }));
      }
      response.end(
        JSON.stringify({
          ok: false,
          code: ERROR_CODES.RUNTIME_UNAVAILABLE,
          detail: redact(String(error?.message ?? error)),
        }),
      );
    }
  }

  function routeRequest(request, response) {
    if (!isAuthorized(request)) {
      response.writeHead(403, baseHeaders({ 'Content-Type': 'text/html; charset=utf-8' }));
      response.end(
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Session key required</title></head>' +
          '<body><h1>Session key required</h1><p>Open the complete URL the agent provided, including its key parameter.</p></body></html>',
      );
      return;
    }
    touch();

    const url = request.url ?? '/';
    const queryIndex = url.indexOf('?');
    const pathname = queryIndex >= 0 ? url.slice(0, queryIndex) : url;
    const keyFromQuery =
      queryIndex >= 0 ? new URLSearchParams(url.slice(queryIndex + 1)).get('key') : null;

    if (pathname.startsWith('/admin/')) {
      if (handleAdmin(request, response, pathname)) return;
      sendJson(response, 404, { ok: false, code: ERROR_CODES.INVALID_ARGUMENTS });
      return;
    }

    // Mirror the key into a port-scoped HttpOnly cookie so subresources and the
    // WebSocket authenticate without the key staying in the visible URL.
    response.setHeader(
      'Set-Cookie',
      `${state.cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/`,
    );

    if (request.method === 'GET' && pathname === '/' && keyFromQuery !== null) {
      sendHtml(
        response,
        200,
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Opening Visual Companion</title>' +
          `<meta http-equiv="refresh" content="0; url=/"></head><body><p>Opening the Visual Companion...</p>` +
          '<noscript><a href="/">Continue</a></noscript></body></html>',
      );
      return;
    }

    if (request.method === 'GET' && pathname === '/') {
      const document = state.stopped
        ? renderPausedDocument(runtime)
        : state.waiting || !state.screen
          ? renderWaitingDocument(runtime)
          : renderLiveDocument(state.screen, {
              ...runtime,
              sessionId,
              screenRevision: state.screenRevision,
            });
      sendHtml(response, 200, document);
      return;
    }

    if (request.method === 'GET' && pathname.startsWith('/assets/')) {
      const allowed = state.screen ? referencedAssets(state.screen) : [];
      const resolved = resolveContainedAsset(contentDir, decodeURIComponent(pathname.slice(8)), allowed);
      if (!resolved.ok) {
        response.writeHead(404, baseHeaders());
        response.end('Not found');
        return;
      }
      response.writeHead(
        200,
        baseHeaders({ 'Content-Type': MIME_TYPES[resolved.extension] ?? 'application/octet-stream' }),
      );
      response.end(readFileSync(resolved.path));
      return;
    }

    response.writeHead(404, baseHeaders());
    response.end('Not found');
  }

  function handleUpgrade(request, socket) {
    if (!isAuthorized(request) || !isAllowedEventOrigin(request.headers.origin, request.headers.host)) {
      socket.destroy();
      return;
    }
    const key = request.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${computeAcceptKey(key)}\r\n\r\n`,
    );
    clients.add(socket);
    touch();

    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > LIMITS.max_frame_payload_bytes * 2) {
        socket.destroy();
        clients.delete(socket);
        return;
      }
      for (;;) {
        let frame;
        try {
          frame = decodeFrame(buffer);
        } catch {
          socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
          clients.delete(socket);
          return;
        }
        if (!frame) break;
        buffer = buffer.subarray(frame.bytesConsumed);
        if (frame.opcode === OPCODES.TEXT) {
          touch();
          if (frame.payload.length > LIMITS.max_event_bytes) {
            socket.write(
              encodeFrame(
                OPCODES.TEXT,
                Buffer.from(JSON.stringify({ type: 'event-rejected', code: ERROR_CODES.PAYLOAD_TOO_LARGE })),
              ),
            );
            continue;
          }
          let raw;
          try {
            raw = JSON.parse(frame.payload.toString('utf8'));
          } catch {
            socket.write(
              encodeFrame(
                OPCODES.TEXT,
                Buffer.from(JSON.stringify({ type: 'event-rejected', code: ERROR_CODES.INVALID_EVENT })),
              ),
            );
            continue;
          }
          const result = acceptEvent(raw);
          socket.write(
            encodeFrame(
              OPCODES.TEXT,
              Buffer.from(
                JSON.stringify(
                  result.ok
                    ? { type: 'event-accepted', event_id: result.event.event_id, server_sequence: result.event.server_sequence }
                    : { type: 'event-rejected', code: result.errors[0].code, detail: result.errors[0].detail ?? null },
                ),
              ),
            ),
          );
        } else if (frame.opcode === OPCODES.CLOSE) {
          socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
          clients.delete(socket);
          return;
        } else if (frame.opcode === OPCODES.PING) {
          socket.write(encodeFrame(OPCODES.PONG, frame.payload));
        } else if (frame.opcode !== OPCODES.PONG) {
          const close = Buffer.alloc(2);
          close.writeUInt16BE(1003);
          socket.end(encodeFrame(OPCODES.CLOSE, close));
          clients.delete(socket);
          return;
        }
      }
    });
    socket.on('close', () => clients.delete(socket));
    socket.on('error', () => clients.delete(socket));
  }

  const server = createServer(handleRequest);
  server.on('upgrade', handleUpgrade);

  let lifecycleTimer = null;

  function shutdown(reason) {
    if (state.stopped) return;
    state.stopped = true;
    state.stopReason = reason;
    if (lifecycleTimer) clearInterval(lifecycleTimer);
    try {
      writeAtomic(
        path.join(stateDir, 'stopped.json'),
        `${JSON.stringify({ reason, session_id: sessionId, stopped_at: now() })}\n`,
      );
    } catch {
      // Best effort: the caller already has the stop result.
    }
    for (const socket of clients) {
      try {
        socket.destroy();
      } catch {
        // already gone
      }
    }
    clients.clear();
    server.close();
  }

  function ownerAlive() {
    if (!ownerPid) return true;
    try {
      process.kill(ownerPid, 0);
      return true;
    } catch (error) {
      return error?.code === 'EPERM';
    }
  }

  function startLifecycleWatchdog() {
    lifecycleTimer = setInterval(() => {
      if (!ownerAlive()) shutdown('owner process exited');
      else if (now() - state.lastActivity > idleTimeoutMs) shutdown('idle timeout');
    }, lifecycleCheckMs);
    if (typeof lifecycleTimer.unref === 'function') lifecycleTimer.unref();
  }

  return {
    server,
    startLifecycleWatchdog,
    shutdown,
    status,
    publishScreen,
    publishWaiting,
    acceptEvent,
    currentIdentity,
    listen(boundPort, boundHost) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(boundPort, boundHost, () => {
          state.boundPort = server.address().port;
          state.cookieName = cookieNameForPort(state.boundPort);
          resolve(state.boundPort);
        });
      });
    },
    get boundPort() {
      return state.boundPort;
    },
    get cookieName() {
      return state.cookieName;
    },
    get stopped() {
      return state.stopped;
    },
  };
}

export { OPCODES };
