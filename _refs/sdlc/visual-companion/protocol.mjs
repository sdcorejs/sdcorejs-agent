/**
 * Visual Companion protocol contract.
 *
 * This module owns identity, the closed browser-event schema, bounded limits,
 * cursor semantics, redaction, and stable result/error codes. It performs no
 * I/O and starts no process, so every rule here is unit-testable without a
 * browser, a socket, or a temporary directory.
 *
 * Independent implementation. Behavioural inspiration only from the Superpowers
 * brainstorming companion (https://github.com/obra/superpowers, MIT). No source
 * was copied; see `_refs/sdlc/visual-companion/README.md` for the attribution
 * and the list of deliberate divergences.
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const PROTOCOL_VERSION = 1;

/** Stable identifier shape shared by sessions, screens, options and events. */
export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/u;
export const SESSION_ID = /^vc-[0-9a-f]{16}$/u;
export const INSTANCE_ID = /^[0-9a-f]{32}$/u;
export const TOKEN = /^[0-9a-f]{64}$/u;
export const LOCALE = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;

/**
 * Bounded limits. A local companion still has to fail closed: an unbounded
 * body, feedback field, or offline queue is a denial-of-service surface even on
 * loopback, and an unbounded event log silently grows inside the user's repo.
 */
export const LIMITS = Object.freeze({
  max_request_body_bytes: 64 * 1024,
  max_event_bytes: 16 * 1024,
  max_frame_payload_bytes: 64 * 1024,
  max_feedback_characters: 2000,
  max_selected_options: 8,
  max_queued_client_events: 32,
  max_events_per_session: 5000,
  max_event_id_memory: 1000,
  min_reconnect_ms: 500,
  max_reconnect_ms: 15000,
  paused_after_ms: 12000,
  default_idle_timeout_ms: 4 * 60 * 60 * 1000,
  default_lifecycle_check_ms: 60 * 1000,
});

export const EVENT_TYPES = Object.freeze([
  'selection_changed',
  'selection_submitted',
  'feedback',
]);

/**
 * A browser event carries exactly these client-supplied keys. Everything else
 * is server-assigned. An unknown key is rejected rather than ignored so a
 * client cannot smuggle `approved: true`, a workflow gate, or a path.
 */
export const CLIENT_EVENT_KEYS = Object.freeze([
  'schema_version',
  'event_id',
  'session_id',
  'screen_id',
  'screen_revision',
  'event_type',
  'selected_option_ids',
  'feedback',
  'client_timestamp',
]);

export const RESULT_CODES = Object.freeze({
  OK: 'OK',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_STOPPED: 'SESSION_STOPPED',
  SCREEN_PUBLISHED: 'SCREEN_PUBLISHED',
  EVENTS_READ: 'EVENTS_READ',
  WAITING_PUBLISHED: 'WAITING_PUBLISHED',
  CLEANED: 'CLEANED',
});

export const ERROR_CODES = Object.freeze({
  INVALID_ARGUMENTS: 'INVALID_ARGUMENTS',
  INVALID_SCREEN: 'INVALID_SCREEN',
  INVALID_EVENT: 'INVALID_EVENT',
  UNKNOWN_SESSION: 'UNKNOWN_SESSION',
  SESSION_NOT_RUNNING: 'SESSION_NOT_RUNNING',
  SESSION_ALREADY_STOPPED: 'SESSION_ALREADY_STOPPED',
  OWNERSHIP_UNPROVEN: 'OWNERSHIP_UNPROVEN',
  PORT_UNAVAILABLE: 'PORT_UNAVAILABLE',
  EXPLICIT_TOKEN_COLLISION: 'EXPLICIT_TOKEN_COLLISION',
  UNSAFE_HOST: 'UNSAFE_HOST',
  UNSAFE_CONTENT: 'UNSAFE_CONTENT',
  PATH_ESCAPE: 'PATH_ESCAPE',
  STALE_SCREEN: 'STALE_SCREEN',
  CROSS_SESSION: 'CROSS_SESSION',
  REPLAYED_EVENT: 'REPLAYED_EVENT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  RUNTIME_UNAVAILABLE: 'RUNTIME_UNAVAILABLE',
});

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;

export function generateSessionId(random = randomBytes) {
  return `vc-${Buffer.from(random(8)).toString('hex')}`;
}

export function generateInstanceId(random = randomBytes) {
  return Buffer.from(random(16)).toString('hex');
}

/** At least 256 bits of session entropy. */
export function generateToken(random = randomBytes) {
  return Buffer.from(random(32)).toString('hex');
}

export function timingSafeEqualString(left, right) {
  const a = Buffer.from(String(left ?? ''), 'utf8');
  const b = Buffer.from(String(right ?? ''), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Cookie name keys on the bound port so two local sessions cannot collide. */
export function cookieNameForPort(port) {
  return `sdcorejs-visual-companion-${Number(port)}`;
}

export function contentHash(value) {
  return createHash('sha256')
    .update(typeof value === 'string' ? value : Buffer.from(value))
    .digest('hex');
}

/**
 * Redact anything that must never reach a log line, a status result, a durable
 * artifact, or a conversation transcript.
 */
export function redact(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(TOKEN, '[REDACTED]')
    .replace(/([?&](?:key|token)=)[^&\s"']+/giu, '$1[REDACTED]');
}

export function redactObject(value) {
  if (Array.isArray(value)) return value.map(redactObject);
  if (!isObject(value)) return redact(value);
  const result = {};
  for (const [key, entry] of Object.entries(value)) {
    result[key] = /^(?:token|key|url|authenticated_url|cookie)$/iu.test(key)
      ? '[REDACTED]'
      : redactObject(entry);
  }
  return result;
}

/**
 * Validate a raw browser event against the closed schema and the currently
 * published screen.
 *
 * `current` carries the authoritative session/screen/revision/option identity.
 * Trusting the client for any of those would let a stale tab, a second session,
 * or a replayed click be read back as a fresh decision.
 */
export function validateClientEvent(raw, current = {}) {
  const errors = [];
  const fail = (code, detail) => {
    errors.push(detail ? { code, detail } : { code });
  };

  if (!isObject(raw)) {
    return { ok: false, errors: [{ code: ERROR_CODES.INVALID_EVENT, detail: 'event must be an object' }] };
  }
  for (const key of Object.keys(raw)) {
    if (!CLIENT_EVENT_KEYS.includes(key)) {
      fail(ERROR_CODES.INVALID_EVENT, `unknown property: ${key}`);
    }
  }
  if (raw.schema_version !== PROTOCOL_VERSION) {
    fail(ERROR_CODES.INVALID_EVENT, 'schema_version must be 1');
  }
  if (!isText(raw.event_id) || !SAFE_ID.test(raw.event_id)) {
    fail(ERROR_CODES.INVALID_EVENT, 'event_id is invalid');
  }
  if (!EVENT_TYPES.includes(raw.event_type)) {
    fail(ERROR_CODES.INVALID_EVENT, 'event_type is invalid');
  }
  if (raw.client_timestamp !== undefined && !Number.isFinite(Number(raw.client_timestamp))) {
    fail(ERROR_CODES.INVALID_EVENT, 'client_timestamp must be numeric');
  }

  if (raw.session_id !== current.session_id) {
    fail(ERROR_CODES.CROSS_SESSION, 'event does not belong to this session');
  }
  if (raw.screen_id !== current.screen_id) {
    fail(ERROR_CODES.STALE_SCREEN, 'event references another screen');
  } else if (raw.screen_revision !== current.screen_revision) {
    fail(ERROR_CODES.STALE_SCREEN, 'event references an older screen revision');
  }

  const selected = raw.selected_option_ids;
  if (!Array.isArray(selected)) {
    fail(ERROR_CODES.INVALID_EVENT, 'selected_option_ids must be an array');
  } else {
    if (selected.length > LIMITS.max_selected_options) {
      fail(ERROR_CODES.PAYLOAD_TOO_LARGE, 'too many selected options');
    }
    const allowed = new Set(current.option_ids ?? []);
    const seen = new Set();
    for (const id of selected) {
      if (typeof id !== 'string' || !allowed.has(id)) {
        fail(ERROR_CODES.INVALID_EVENT, 'unknown option id');
        continue;
      }
      if (seen.has(id)) fail(ERROR_CODES.INVALID_EVENT, 'duplicate option id');
      seen.add(id);
    }
    if (!current.multi_select && seen.size > 1) {
      fail(ERROR_CODES.INVALID_EVENT, 'single-select screen accepts one option');
    }
    if (raw.event_type === 'selection_submitted' && seen.size === 0) {
      fail(ERROR_CODES.INVALID_EVENT, 'a submitted selection requires an option');
    }
  }

  if (raw.feedback !== undefined && raw.feedback !== null) {
    if (typeof raw.feedback !== 'string') {
      fail(ERROR_CODES.INVALID_EVENT, 'feedback must be text');
    } else if (raw.feedback.length > LIMITS.max_feedback_characters) {
      fail(ERROR_CODES.PAYLOAD_TOO_LARGE, 'feedback exceeds the allowed length');
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    event: {
      schema_version: PROTOCOL_VERSION,
      event_id: raw.event_id,
      session_id: raw.session_id,
      screen_id: raw.screen_id,
      screen_revision: raw.screen_revision,
      event_type: raw.event_type,
      selected_option_ids: [...raw.selected_option_ids],
      feedback: typeof raw.feedback === 'string' ? raw.feedback : null,
      client_timestamp: raw.client_timestamp ?? null,
    },
  };
}

/**
 * Attach server-side trusted metadata. The sequence is authoritative and drives
 * the read cursor, so a client-supplied ordering value is never used.
 */
export function sealEvent(event, { sequence, receivedAt }) {
  return Object.freeze({
    ...event,
    server_sequence: sequence,
    server_timestamp: receivedAt,
    authority: 'supporting-feedback',
  });
}

/**
 * A browser event is design feedback. It can never carry workflow authority, so
 * the authority field is fixed by the server and asserted on read.
 */
export function assertSupportingFeedbackOnly(event) {
  if (event?.authority !== 'supporting-feedback') {
    throw new TypeError('visual companion events are supporting feedback only');
  }
  return event;
}

export function encodeCursor(sequence) {
  const value = Number(sequence);
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError('cursor sequence must be a non-negative integer');
  }
  return `vc1:${value}`;
}

export function decodeCursor(cursor) {
  if (cursor === undefined || cursor === null || cursor === '') return 0;
  const match = /^vc1:(\d+)$/u.exec(String(cursor));
  if (!match) throw new TypeError('cursor is not a visual companion cursor');
  return Number(match[1]);
}

/**
 * Summarize events for the agent. Transient exploration is preserved but kept
 * distinct from an explicit submission, and feedback text is bounded.
 */
export function summarizeEvents(events, { after = null } = {}) {
  const from = decodeCursor(after);
  const fresh = events.filter((event) => event.server_sequence > from);
  for (const event of fresh) assertSupportingFeedbackOnly(event);
  const submissions = fresh.filter((event) => event.event_type === 'selection_submitted');
  const latestSubmission = submissions.at(-1) ?? null;
  const highest = fresh.reduce(
    (max, event) => Math.max(max, event.server_sequence),
    from,
  );
  return {
    authority: 'supporting-feedback',
    cursor: encodeCursor(highest),
    event_count: fresh.length,
    exploration_count: fresh.filter((event) => event.event_type === 'selection_changed').length,
    submission_count: submissions.length,
    latest_submission: latestSubmission
      ? {
          screen_id: latestSubmission.screen_id,
          screen_revision: latestSubmission.screen_revision,
          selected_option_ids: latestSubmission.selected_option_ids,
          server_sequence: latestSubmission.server_sequence,
        }
      : null,
    // The client attaches the feedback field to every event it sends, so one
    // typed comment rides along on each later selection and submission. Collapse
    // consecutive identical text per screen, keeping the latest sequence, or the
    // agent reads one comment as if the user had repeated it.
    feedback: fresh.reduce((collected, event) => {
      if (!isText(event.feedback)) return collected;
      const previous = collected.at(-1);
      if (previous && previous.screen_id === event.screen_id && previous.text === event.feedback) {
        previous.server_sequence = event.server_sequence;
        return collected;
      }
      collected.push({
        screen_id: event.screen_id,
        text: event.feedback,
        server_sequence: event.server_sequence,
      });
      return collected;
    }, []),
    events: fresh.map((event) => ({
      event_type: event.event_type,
      screen_id: event.screen_id,
      screen_revision: event.screen_revision,
      selected_option_ids: event.selected_option_ids,
      server_sequence: event.server_sequence,
    })),
  };
}

/** Loopback-only unless the caller explicitly opts into a routable bind. */
export function resolveBindHost({ host, allowNonLoopback = false } = {}) {
  const requested = host ?? '127.0.0.1';
  const loopback = requested === '127.0.0.1' || requested === '::1' || requested === 'localhost';
  if (loopback) {
    return { ok: true, host: requested, loopback: true, warning: null };
  }
  if (requested === '0.0.0.0' || requested === '::') {
    return {
      ok: false,
      code: ERROR_CODES.UNSAFE_HOST,
      detail: 'refusing to bind every interface; name an explicit host',
    };
  }
  if (!allowNonLoopback) {
    return {
      ok: false,
      code: ERROR_CODES.UNSAFE_HOST,
      detail: 'non-loopback bind requires an explicit opt-in',
    };
  }
  return {
    ok: true,
    host: requested,
    loopback: false,
    warning:
      'The Visual Companion is bound to a non-loopback address over plain HTTP. Anyone who can route to this host and holds the session key can read the screens.',
  };
}

export function securityHeaders(extra = {}) {
  return {
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    ...extra,
  };
}

/**
 * Live CSP. Scripts are restricted to the single hashed client helper, so a
 * screen fragment can never introduce behaviour. Images stay same-origin plus
 * `data:` for inline diagram assets; connections stay same-origin for the
 * WebSocket.
 */
export function contentSecurityPolicy(clientScriptHash) {
  return [
    "default-src 'none'",
    `script-src 'sha256-${clientScriptHash}'`,
    "style-src 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'none'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "worker-src 'none'",
    "manifest-src 'none'",
  ].join('; ');
}

/** Same-origin enforcement for the event channel upgrade. */
export function isAllowedEventOrigin(originHeader, hostHeader) {
  if (originHeader === undefined || originHeader === null || originHeader === '') {
    // A non-browser client sends no Origin. It still had to present the token
    // to reach this point, which is the actual authentication boundary.
    return true;
  }
  if (!isText(hostHeader)) return false;
  return originHeader === `http://${hostHeader}`;
}
