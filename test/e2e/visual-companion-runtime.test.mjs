/**
 * Visual Companion runtime contract.
 *
 * Eight categories, one per behavioural surface: protocol, screen model,
 * rendering, transport framing, server security, event lifecycle, command
 * line, and process lifecycle. Server-level tests bind an in-process server on
 * an ephemeral port; command-line tests drive the real detached process so the
 * published contract is exercised end to end.
 */

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  CLIENT_EVENT_KEYS,
  ERROR_CODES,
  EVENT_TYPES,
  LIMITS,
  PROTOCOL_VERSION,
  RESULT_CODES,
  SESSION_ID,
  assertSupportingFeedbackOnly,
  contentSecurityPolicy,
  cookieNameForPort,
  decodeCursor,
  encodeCursor,
  generateInstanceId,
  generateSessionId,
  generateToken,
  isAllowedEventOrigin,
  redactObject,
  resolveBindHost,
  sealEvent,
  securityHeaders,
  summarizeEvents,
  timingSafeEqualString,
  validateClientEvent,
} from '../../_refs/sdlc/visual-companion/protocol.mjs';
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  validateInlineSvg,
  validateVisualScreen,
} from '../../_refs/sdlc/visual-companion/screen.mjs';
import {
  renderLiveDocument,
  renderPausedDocument,
  renderWaitingDocument,
} from '../../_refs/sdlc/visual-companion/live-document.mjs';
import { CLIENT_SCRIPT, CLIENT_SCRIPT_HASH } from '../../_refs/sdlc/visual-companion/client-script.mjs';
import {
  computeAcceptKey,
  createCompanionServer,
  decodeFrame,
  encodeFrame,
} from '../../_refs/sdlc/visual-companion/server.mjs';
import {
  RUNTIME_ROOT_SEGMENTS,
  resolveContainedAsset,
  resolveRuntimeRoot,
  resolveSessionPaths,
  runtimeRootCandidates,
} from '../../_refs/sdlc/visual-companion/paths.mjs';
import {
  LAUNCH_REASONS,
  isLaunchableUrl,
  openInBrowser,
  resolveLaunchCommand,
} from '../../_refs/sdlc/visual-companion/launcher.mjs';
import { COMMANDS, parseArguments, runCommand } from '../../_refs/sdlc/visual-companion/cli.mjs';
import { connectCompanionClient } from './helpers/visual-companion-client.mjs';

const CLI = path.resolve('_refs/sdlc/visual-companion/cli.mjs');

const screen = (overrides = {}) => ({
  schema_version: 1,
  screen_id: 'layout',
  type: 'single_select',
  question: 'Which layout reads more clearly?',
  criteria: ['Scanability'],
  options: [
    {
      id: 'sidebar',
      label: 'Sidebar',
      summary: 'Persistent left navigation.',
      best_when: 'Many sections.',
      tradeoff: 'Less horizontal room.',
      preview_asset: 'sidebar.svg',
      preview: {
        kind: 'wireframe',
        caption: 'Sidebar layout',
        regions: [
          { label: 'Nav', area: 'sidebar', span: 3 },
          { label: 'Content', area: 'main', span: 9 },
        ],
      },
    },
    {
      id: 'topbar',
      label: 'Top bar',
      summary: 'Horizontal navigation.',
      best_when: 'Few sections.',
      tradeoff: 'Truncates on narrow screens.',
      preview_asset: 'topbar.svg',
    },
  ],
  recommendation: 'sidebar',
  fallback_prompt: 'Reply 1 for Sidebar or 2 for Top bar.',
  ...overrides,
});

async function withSession(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-'));
  const sessionId = generateSessionId();
  const instanceId = generateInstanceId();
  const token = generateToken();
  const paths = resolveSessionPaths({ projectRoot: root, sessionId });
  const session = createCompanionServer({
    sessionId,
    instanceId,
    token,
    host: '127.0.0.1',
    port: 0,
    contentDir: paths.contentDir,
    stateDir: paths.stateDir,
  });
  const port = await session.listen(0, '127.0.0.1');
  const context = { root, sessionId, instanceId, token, port, paths, session };
  context.url = (pathname, query = `?key=${token}`) => `http://127.0.0.1:${port}${pathname}${query}`;
  try {
    return await run(context);
  } finally {
    session.shutdown('test complete');
    await rm(root, { recursive: true, force: true });
  }
}

/**
 * Drive the published command line.
 *
 * Standard input is always closed. A command that reads a screen from stdin
 * would otherwise wait forever on a pipe the test never ends.
 */
function cli(args, { input = '' } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      try {
        resolve({ exitCode: code ?? 0, result: JSON.parse(stdout), stderr });
      } catch (error) {
        reject(new Error(`unparsable CLI output (exit ${code}): ${stdout || stderr}\n${error.message}`));
      }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

/* 1. Protocol ------------------------------------------------------------- */

test('protocol: identity, limits, cursor, redaction, and codes are closed and stable', () => {
  assert.equal(PROTOCOL_VERSION, 1);
  assert.ok(SESSION_ID.test(generateSessionId()));
  assert.equal(generateToken().length, 64, 'at least 256 bits of session entropy');
  assert.equal(timingSafeEqualString('abc', 'abc'), true);
  assert.equal(timingSafeEqualString('abc', 'abd'), false);
  assert.equal(timingSafeEqualString('abc', 'abcd'), false, 'length mismatch never throws');
  assert.equal(cookieNameForPort(4321), 'sdcorejs-visual-companion-4321');

  assert.deepEqual([...CLIENT_EVENT_KEYS].sort(), [
    'client_timestamp', 'event_id', 'event_type', 'feedback', 'schema_version',
    'screen_id', 'screen_revision', 'selected_option_ids', 'session_id',
  ]);
  assert.deepEqual([...EVENT_TYPES], ['selection_changed', 'selection_submitted', 'feedback']);
  for (const limit of Object.values(LIMITS)) assert.ok(Number.isFinite(limit) && limit > 0);

  assert.equal(decodeCursor(encodeCursor(7)), 7);
  assert.equal(decodeCursor(null), 0);
  assert.throws(() => decodeCursor('7'), /not a visual companion cursor/);
  assert.throws(() => encodeCursor(-1), /non-negative integer/);

  const token = generateToken();
  const redacted = redactObject({
    token,
    url: `http://127.0.0.1:1/?key=${token}`,
    display_url: `http://127.0.0.1:1/?key=${token}`,
    nested: { cookie: 'x', safe: 'kept' },
  });
  assert.equal(redacted.token, '[REDACTED]');
  assert.equal(redacted.url, '[REDACTED]');
  assert.equal(redacted.display_url, 'http://127.0.0.1:1/?key=[REDACTED]');
  assert.equal(redacted.nested.cookie, '[REDACTED]');
  assert.equal(redacted.nested.safe, 'kept');

  assert.equal(resolveBindHost({}).host, '127.0.0.1');
  assert.equal(resolveBindHost({}).loopback, true);
  assert.equal(resolveBindHost({ host: '0.0.0.0', allowNonLoopback: true }).code, ERROR_CODES.UNSAFE_HOST);
  assert.equal(resolveBindHost({ host: '10.0.0.5' }).code, ERROR_CODES.UNSAFE_HOST);
  const routable = resolveBindHost({ host: '10.0.0.5', allowNonLoopback: true });
  assert.equal(routable.ok, true);
  assert.match(routable.warning, /non-loopback/);

  const headers = securityHeaders();
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['Cache-Control'], 'no-store');
  const csp = contentSecurityPolicy('HASH');
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /script-src 'sha256-HASH'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /unsafe-eval|'unsafe-inline'\s*;\s*script/);

  assert.equal(isAllowedEventOrigin(undefined, 'x'), true, 'a non-browser client sends no Origin');
  assert.equal(isAllowedEventOrigin('http://127.0.0.1:9', '127.0.0.1:9'), true);
  assert.equal(isAllowedEventOrigin('http://evil.test', '127.0.0.1:9'), false);

  assert.ok(Object.values(RESULT_CODES).includes('SESSION_STARTED'));
  assert.ok(Object.values(ERROR_CODES).includes('OWNERSHIP_UNPROVEN'));
});

/* 2. Screen model --------------------------------------------------------- */

test('screen model: cardinality, previews, and unsafe content fail closed', () => {
  assert.deepEqual(validateVisualScreen(screen()), []);
  assert.equal(MIN_OPTIONS, 2);
  assert.equal(MAX_OPTIONS, 4);

  const extra = (id) => ({
    id, label: id, summary: 's', best_when: 'b', tradeoff: 't', preview_asset: `${id}.svg`,
  });
  const four = screen({ options: [...screen().options, extra('hybrid'), extra('staged')] });
  assert.deepEqual(validateVisualScreen(four), []);
  const five = screen({ options: [...four.options, extra('manual')] });
  assert.match(validateVisualScreen(five).join('\n'), /2 to 4 options/);
  assert.match(validateVisualScreen(screen({ options: [screen().options[0]] })).join('\n'), /2 to 4 options/);
  assert.match(validateVisualScreen(screen({ recommendation: 'nope' })).join('\n'), /reference an option id/);
  assert.match(validateVisualScreen({ ...screen(), html: '<b>x</b>' }).join('\n'), /unknown properties/);

  const withPreview = (preview) => screen({
    options: [{ ...screen().options[0], preview }, screen().options[1]],
  });
  assert.match(validateVisualScreen(withPreview({ kind: 'nope' })).join('\n'), /kind is invalid/);
  assert.match(
    validateVisualScreen(withPreview({ kind: 'image', asset: '../escape.png', alt: 'x' })).join('\n'),
    /contained local asset name/,
  );
  assert.match(
    validateVisualScreen(withPreview({ kind: 'image', asset: 'ok.exe', alt: 'x' })).join('\n'),
    /allowed image extension/,
  );
  assert.match(
    validateVisualScreen(withPreview({
      kind: 'flow',
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      edges: [{ from: 'a', to: 'missing' }],
    })).join('\n'),
    /not a declared node/,
  );

  for (const unsafe of [
    '<svg><script>alert(1)</script></svg>',
    '<svg onload="alert(1)"></svg>',
    '<svg><foreignObject></foreignObject></svg>',
    '<svg><image href="https://evil.test/x.png"/></svg>',
    '<svg><a href="javascript:alert(1)"></a></svg>',
    '<svg><style>@import url(x)</style></svg>',
  ]) {
    assert.ok(validateInlineSvg(unsafe).length > 0, `${unsafe} is rejected`);
  }
  assert.deepEqual(validateInlineSvg('<svg viewBox="0 0 2 2"><rect width="1" height="1"/></svg>'), []);
});

/* 3. Rendering ------------------------------------------------------------ */

test('rendering: the CSP hash pins the served client and every surface keeps a Markdown fallback', () => {
  const live = renderLiveDocument(screen(), { locale: 'en', sessionId: 'vc-0123456789abcdef', screenRevision: 3 });
  const inline = /<script>([\s\S]*)<\/script>/u.exec(live);
  assert.ok(inline, 'the live document carries exactly one inline client');
  assert.equal((live.match(/<script\b/gu) ?? []).length, 1);
  assert.equal(createHash('sha256').update(inline[1]).digest('base64'), CLIENT_SCRIPT_HASH);
  assert.equal(inline[1], CLIENT_SCRIPT, 'the served bytes are the hashed bytes');
  // The policy travels in a meta tag, so its quotes arrive HTML-escaped.
  assert.ok(
    live.includes(`script-src &#39;sha256-${CLIENT_SCRIPT_HASH}&#39;`),
    'the served policy names the served hash',
  );

  assert.match(live, /data-screen-revision="3"/);
  assert.match(live, /data-preview-kind="wireframe"/);
  assert.match(live, /Your selection is design feedback/);
  assert.match(live, /<pre>## Which layout reads more clearly\?/);
  assert.doesNotMatch(live, /https?:\/\/(?!sdcorejs\.local)/, 'no remote destination');

  for (const document of [renderWaitingDocument({}), renderPausedDocument({})]) {
    assert.ok(document.includes('default-src &#39;none&#39;'));
    assert.ok(document.includes(`sha256-${CLIENT_SCRIPT_HASH}`));
    assert.equal((document.match(/<script\b/gu) ?? []).length, 1);
  }
  assert.match(renderWaitingDocument({}), /Waiting for the next visual decision/);
  assert.match(renderPausedDocument({}), /Visual Companion paused/);

  const hostile = screen({
    question: '<img src=x onerror=alert(1)>',
    options: [
      { ...screen().options[0], preview: undefined, label: '<script>alert(1)</script>' },
      screen().options[1],
    ],
  });
  const escaped = renderLiveDocument(hostile, { locale: 'en', sessionId: 'vc-0123456789abcdef', screenRevision: 1 });
  assert.doesNotMatch(escaped, /<img|onerror=/iu);
  assert.match(escaped, /&lt;script/u);
  assert.equal((escaped.match(/<script\b/gu) ?? []).length, 1, 'hostile content adds no script element');

  assert.throws(
    () => renderLiveDocument(screen(), { locale: 'vi', sessionId: 'vc-0123456789abcdef', screenRevision: 1 }),
    /complete localized message bundle/u,
    'a half-translated screen is refused rather than shipped',
  );
});

/* 4. Transport framing ---------------------------------------------------- */

test('transport: RFC 6455 framing round-trips, requires masking, and bounds payloads', () => {
  assert.equal(
    computeAcceptKey('dGhlIHNhbXBsZSBub25jZQ=='),
    's3pPLMBiTxaQ9kYGzzhZRbK+xOo=',
    'the documented RFC 6455 handshake vector',
  );

  const mask = Buffer.from([1, 2, 3, 4]);
  const maskedClientFrame = (payload) => {
    const body = Buffer.from(payload, 'utf8');
    const masked = Buffer.alloc(body.length);
    for (let index = 0; index < body.length; index += 1) masked[index] = body[index] ^ mask[index % 4];
    let header;
    if (body.length < 126) header = Buffer.from([0x81, 0x80 | body.length]);
    else {
      header = Buffer.alloc(4);
      header[0] = 0x81;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(body.length, 2);
    }
    return Buffer.concat([header, mask, masked]);
  };

  const short = decodeFrame(maskedClientFrame('hi'));
  assert.equal(short.payload.toString('utf8'), 'hi');
  assert.equal(short.bytesConsumed, 8);

  const long = 'x'.repeat(700);
  const extended = decodeFrame(maskedClientFrame(long));
  assert.equal(extended.payload.toString('utf8'), long);

  assert.equal(decodeFrame(Buffer.from([0x81])), null, 'a partial frame waits for more bytes');
  assert.throws(() => decodeFrame(Buffer.from([0x81, 0x02, 0x61, 0x62])), /must be masked/u);
  const oversized = Buffer.alloc(10);
  oversized[0] = 0x81;
  oversized[1] = 0x80 | 127;
  oversized.writeBigUInt64BE(BigInt(LIMITS.max_frame_payload_bytes + 1), 2);
  assert.throws(() => decodeFrame(oversized), /exceeds the allowed size/u);

  const server = encodeFrame(0x01, Buffer.from('pong'));
  assert.equal(server[0], 0x81);
  assert.equal(server[1] & 0x80, 0, 'server frames are never masked');
  assert.equal(server.subarray(2).toString('utf8'), 'pong');
  assert.equal(encodeFrame(0x01, Buffer.alloc(300))[1], 126, 'a 16-bit length is used past 125 bytes');
});

/* 5. Server security ------------------------------------------------------ */

test('server security: every surface is authenticated, contained, and ownership-proven', async () => {
  await withSession(async (context) => {
    const anonymous = await fetch(context.url('/', ''));
    assert.equal(anonymous.status, 403);
    assert.match(await anonymous.text(), /Session key required/u);

    const wrongKey = await fetch(context.url('/', `?key=${'0'.repeat(64)}`));
    assert.equal(wrongKey.status, 403);

    const authorized = await fetch(context.url('/'));
    assert.equal(authorized.status, 200);
    assert.match(
      authorized.headers.get('set-cookie') ?? '',
      new RegExp(`${cookieNameForPort(context.port)}=[0-9a-f]{64}; HttpOnly; SameSite=Strict`),
    );
    assert.match(authorized.headers.get('content-security-policy') ?? '', /default-src 'none'/u);
    assert.equal(authorized.headers.get('x-frame-options'), 'DENY');
    assert.equal(authorized.headers.get('cache-control'), 'no-store');

    context.session.publishScreen(screen());
    for (const probe of ['../state/server-info.json', 'state/server-info.json', 'missing.png', '.hidden.png']) {
      const response = await fetch(context.url(`/assets/${encodeURIComponent(probe)}`));
      assert.equal(response.status, 404, `${probe} is not reachable`);
    }
    await writeFile(path.join(context.paths.contentDir, 'unreferenced.png'), 'x');
    assert.equal((await fetch(context.url('/assets/unreferenced.png'))).status, 404);

    const stopRefused = await fetch(context.url('/admin/stop'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instance_id: 'f'.repeat(32) }),
    });
    assert.equal(stopRefused.status, 403);
    assert.equal((await stopRefused.json()).code, ERROR_CODES.OWNERSHIP_UNPROVEN);
    assert.equal(context.session.stopped, false, 'a mismatched instance never terminates the process');

    // An oversized body is cut off rather than buffered. The server destroys
    // the request, so the caller sees a refusal or a dropped connection; both
    // mean the body was never accepted.
    const oversized = await fetch(context.url('/admin/publish'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen: screen({ question: 'q'.repeat(LIMITS.max_request_body_bytes) }) }),
      signal: AbortSignal.timeout(1500),
    }).then((response) => response.status, () => 'refused');
    assert.ok([413, 400, 'refused'].includes(oversized), `oversized publish was ${oversized}`);
    assert.equal(context.session.status().screen_id, 'layout', 'the oversized screen never replaced the current one');

    const badScreen = await fetch(context.url('/admin/publish'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen: { schema_version: 1 } }),
    });
    assert.equal(badScreen.status, 400);
    assert.equal((await badScreen.json()).code, ERROR_CODES.INVALID_SCREEN);

    const refused = await connectCompanionClient({ port: context.port, token: 'x'.repeat(64) })
      .then(() => null, (error) => error);
    assert.ok(refused, 'an unauthenticated event channel is refused');
    const crossOrigin = await connectCompanionClient({
      port: context.port,
      token: context.token,
      origin: 'http://evil.test',
    }).then(() => null, (error) => error);
    assert.ok(crossOrigin, 'a cross-origin event channel is refused');
  });
});

test('server security: contained asset resolution refuses traversal, links, and unlisted names', async () => {
  await withSession(async (context) => {
    await writeFile(path.join(context.paths.contentDir, 'ok.png'), 'x');
    assert.equal(resolveContainedAsset(context.paths.contentDir, 'ok.png', ['ok.png']).ok, true);
    for (const [name, allowed] of [
      ['ok.png', []],
      ['../ok.png', ['../ok.png']],
      ['sub/ok.png', ['sub/ok.png']],
      ['ok.exe', ['ok.exe']],
      ['.env.png', ['.env.png']],
      ['missing.png', ['missing.png']],
    ]) {
      const result = resolveContainedAsset(context.paths.contentDir, name, allowed);
      assert.equal(result.ok, false, `${name} is refused`);
      assert.equal(result.code, ERROR_CODES.PATH_ESCAPE, `${name} reports no detail beyond refusal`);
    }
  });
});

/* 6. Event lifecycle ------------------------------------------------------ */

test('event lifecycle: server-owned identity rejects stale, foreign, and replayed clicks', () => {
  const current = {
    session_id: 'vc-0123456789abcdef',
    screen_id: 'layout',
    screen_revision: 2,
    option_ids: ['sidebar', 'topbar'],
    multi_select: false,
  };
  const base = {
    schema_version: 1,
    event_id: 'e1',
    session_id: current.session_id,
    screen_id: 'layout',
    screen_revision: 2,
    event_type: 'selection_submitted',
    selected_option_ids: ['sidebar'],
    feedback: null,
    client_timestamp: 1,
  };
  assert.equal(validateClientEvent(base, current).ok, true);

  const codeFor = (raw) => validateClientEvent(raw, current).errors.map(({ code }) => code);
  assert.ok(codeFor({ ...base, screen_revision: 1 }).includes(ERROR_CODES.STALE_SCREEN));
  assert.ok(codeFor({ ...base, screen_id: 'other' }).includes(ERROR_CODES.STALE_SCREEN));
  assert.ok(codeFor({ ...base, session_id: 'vc-ffffffffffffffff' }).includes(ERROR_CODES.CROSS_SESSION));
  assert.ok(codeFor({ ...base, approved: true }).includes(ERROR_CODES.INVALID_EVENT));
  assert.ok(codeFor({ ...base, selected_option_ids: ['sidebar', 'topbar'] }).includes(ERROR_CODES.INVALID_EVENT));
  assert.ok(codeFor({ ...base, selected_option_ids: ['unknown'] }).includes(ERROR_CODES.INVALID_EVENT));
  assert.ok(codeFor({ ...base, selected_option_ids: [] }).includes(ERROR_CODES.INVALID_EVENT));
  assert.ok(codeFor({ ...base, feedback: 'x'.repeat(LIMITS.max_feedback_characters + 1) })
    .includes(ERROR_CODES.PAYLOAD_TOO_LARGE));
  assert.ok(codeFor({
    ...base,
    selected_option_ids: Array.from({ length: LIMITS.max_selected_options + 1 }, () => 'sidebar'),
  }).includes(ERROR_CODES.PAYLOAD_TOO_LARGE));

  const sealed = sealEvent(validateClientEvent(base, current).event, { sequence: 4, receivedAt: 10 });
  assert.equal(sealed.authority, 'supporting-feedback');
  assert.equal(sealed.server_sequence, 4);
  assert.throws(
    () => assertSupportingFeedbackOnly({ ...sealed, authority: 'approval' }),
    /supporting feedback only/u,
    'no read path may treat a click as approval',
  );

  const summary = summarizeEvents([
    sealEvent({ ...base, event_id: 'a', event_type: 'selection_changed' }, { sequence: 1, receivedAt: 1 }),
    sealEvent({ ...base, event_id: 'b', feedback: 'looks good' }, { sequence: 2, receivedAt: 2 }),
  ]);
  assert.equal(summary.authority, 'supporting-feedback');
  assert.equal(summary.event_count, 2);
  assert.equal(summary.exploration_count, 1);
  assert.equal(summary.submission_count, 1);
  assert.equal(summary.latest_submission.selected_option_ids[0], 'sidebar');
  assert.equal(summary.feedback[0].text, 'looks good');
  assert.equal(summary.cursor, encodeCursor(2));
  assert.equal(summarizeEvents([], { after: summary.cursor }).event_count, 0);
});

test('event lifecycle: the live channel assigns sequence, pushes reload, and suppresses replay', async () => {
  await withSession(async (context) => {
    context.session.publishScreen(screen());
    const client = await connectCompanionClient({ port: context.port, token: context.token });
    try {
      const send = (overrides) => client.send({
        schema_version: 1,
        event_id: 'evt-1',
        session_id: context.sessionId,
        screen_id: 'layout',
        screen_revision: 1,
        event_type: 'selection_submitted',
        selected_option_ids: ['sidebar'],
        feedback: null,
        client_timestamp: 1,
        ...overrides,
      });

      send({});
      const accepted = await client.waitFor((message) => message.type === 'event-accepted');
      assert.equal(accepted.server_sequence, 1);

      send({});
      const replayed = await client.waitFor(
        (message) => message.type === 'event-rejected' && message.code === ERROR_CODES.REPLAYED_EVENT,
      );
      assert.equal(replayed.code, ERROR_CODES.REPLAYED_EVENT);

      send({ event_id: 'evt-2', session_id: 'vc-ffffffffffffffff' });
      await client.waitFor(
        (message) => message.type === 'event-rejected' && message.code === ERROR_CODES.CROSS_SESSION,
      );

      // Publishing a new screen invalidates prior exploration, so a click that
      // answered the previous question can never read back as current intent.
      context.session.publishScreen(screen({ screen_id: 'navigation' }));
      const reload = await client.waitFor((message) => message.type === 'reload' && message.screen_revision === 2);
      assert.equal(reload.screen_id, 'navigation');
      send({ event_id: 'evt-3' });
      await client.waitFor(
        (message) => message.type === 'event-rejected' && message.code === ERROR_CODES.STALE_SCREEN,
      );

      const events = context.session.acceptEvent({
        schema_version: 1,
        event_id: 'evt-4',
        session_id: context.sessionId,
        screen_id: 'navigation',
        screen_revision: 2,
        event_type: 'selection_changed',
        selected_option_ids: ['topbar'],
        feedback: null,
        client_timestamp: 2,
      });
      assert.equal(events.ok, true);
      assert.equal(events.event.server_sequence, 2);

      const log = await readFile(context.paths.eventsFile, 'utf8');
      const persisted = log.trim().split('\n').map((line) => JSON.parse(line));
      assert.equal(persisted.length, 2);
      for (const entry of persisted) assert.equal(entry.authority, 'supporting-feedback');

      const afterFirst = summarizeEvents(persisted, { after: encodeCursor(1) });
      assert.equal(afterFirst.event_count, 1, 'the cursor suppresses an already-read click');
      assert.equal(afterFirst.events[0].screen_id, 'navigation');
    } finally {
      client.close();
    }
  });
});

/* 7. Command line --------------------------------------------------------- */

test('command line: the full session lifecycle is machine readable and fails non-zero', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-cli-'));
  const screenFile = path.join(root, 'screen.json');
  await writeFile(screenFile, JSON.stringify(screen()));
  let sessionId = null;
  try {
    const started = await cli(['start', '--project-root', root]);
    assert.equal(started.exitCode, 0);
    assert.equal(started.result.ok, true);
    assert.equal(started.result.code, RESULT_CODES.SESSION_STARTED);
    assert.ok(SESSION_ID.test(started.result.session_id));
    sessionId = started.result.session_id;
    assert.match(started.result.authenticated_url, /^http:\/\/127\.0\.0\.1:\d+\/\?key=[0-9a-f]{64}$/u);
    assert.match(started.result.display_url, /\?key=\[REDACTED\]$/u);
    assert.equal(started.result.browser.opened, false, 'auto-open is opt-in');
    assert.equal(started.result.loopback, true);
    assert.equal(started.result.security_warning, null);

    const status = await cli(['status', '--project-root', root, '--session', sessionId]);
    assert.equal(status.result.ok, true);
    assert.equal(status.result.status.running, true);
    assert.equal(status.result.status.waiting, true);
    assert.equal(
      JSON.stringify(status.result).includes(started.result.authenticated_url.split('key=')[1]),
      false,
      'status never leaks the session key without an explicit request',
    );
    const revealed = await cli(['status', '--project-root', root, '--session', sessionId, '--reveal-url']);
    assert.equal(revealed.result.authenticated_url, started.result.authenticated_url);

    const published = await cli(['publish', '--project-root', root, '--session', sessionId, '--screen-file', screenFile]);
    assert.equal(published.result.code, RESULT_CODES.SCREEN_PUBLISHED);
    assert.equal(published.result.published.screen_revision, 1);
    assert.deepEqual(published.result.published.option_ids, ['sidebar', 'topbar']);

    const piped = await cli(
      ['publish', '--project-root', root, '--session', sessionId],
      { input: JSON.stringify(screen({ screen_id: 'navigation' })) },
    );
    assert.equal(piped.result.published.screen_revision, 2);

    const rejected = await cli(
      ['publish', '--project-root', root, '--session', sessionId],
      { input: JSON.stringify({ schema_version: 1, screen_id: 'x' }) },
    );
    assert.equal(rejected.exitCode, 1);
    assert.equal(rejected.result.code, ERROR_CODES.INVALID_SCREEN);
    assert.ok(rejected.result.errors.length > 0, 'every authoring error is reported at once');

    const events = await cli(['events', '--project-root', root, '--session', sessionId]);
    assert.equal(events.result.code, RESULT_CODES.EVENTS_READ);
    assert.equal(events.result.authority, 'supporting-feedback');
    assert.equal(events.result.event_count, 0);
    assert.equal(events.result.current.screen_id, 'navigation');
    assert.equal(events.result.cursor, encodeCursor(0));
    const waiting = await cli(['waiting', '--project-root', root, '--session', sessionId]);
    assert.equal(waiting.result.code, RESULT_CODES.WAITING_PUBLISHED);
    assert.equal(waiting.result.published.waiting, true);

    // Argument and lookup failures need no subprocess: the spawned cases above
    // already prove the published stdout-plus-exit-code contract, and a host
    // near its process limit should not pay for the same proof repeatedly.
    assert.equal(
      (await runCommand('events', { 'project-root': root, session: sessionId, after: '9' })).code,
      ERROR_CODES.INVALID_ARGUMENTS,
    );
    assert.equal(
      (await runCommand('status', { 'project-root': root, session: 'vc-ffffffffffffffff' })).code,
      ERROR_CODES.UNKNOWN_SESSION,
    );
    assert.equal(
      (await runCommand('status', { 'project-root': root, session: 'not-a-session' })).code,
      ERROR_CODES.INVALID_ARGUMENTS,
    );
    assert.deepEqual((await runCommand('bogus', {})).commands, [...COMMANDS]);
    assert.deepEqual([...COMMANDS], [
      'start', 'status', 'publish', 'events', 'waiting', 'stop', 'cleanup',
    ]);
    assert.equal(parseArguments(['status', '--session']).ok, false);
    assert.match(parseArguments(['status', '--session']).detail, /requires a value/);
    assert.equal(parseArguments(['status', '--session', 'x']).command, 'status');
    assert.equal(parseArguments(['start', '--open']).flags.open, true);

    const wrongInstance = await cli([
      'stop', '--project-root', root, '--session', sessionId, '--instance', '0'.repeat(32),
    ]);
    assert.equal(wrongInstance.exitCode, 1);
    assert.equal(wrongInstance.result.code, ERROR_CODES.OWNERSHIP_UNPROVEN);

    const stopped = await cli(['stop', '--project-root', root, '--session', sessionId]);
    assert.equal(stopped.result.code, RESULT_CODES.SESSION_STOPPED);
    const stoppedAgain = await cli(['stop', '--project-root', root, '--session', sessionId]);
    assert.equal(stoppedAgain.exitCode, 1);
    assert.equal(stoppedAgain.result.code, ERROR_CODES.SESSION_ALREADY_STOPPED);

    const sessionDir = path.join(root, ...RUNTIME_ROOT_SEGMENTS, 'sessions', sessionId);
    assert.equal(existsSync(sessionDir), true);
    const cleaned = await cli(['cleanup', '--project-root', root, '--session', sessionId]);
    assert.equal(cleaned.result.code, RESULT_CODES.CLEANED);
    assert.deepEqual(cleaned.result.removed.map(({ session_id: id }) => id), [sessionId]);
    assert.equal(existsSync(sessionDir), false);
  } finally {
    if (sessionId) await cli(['stop', '--project-root', root, '--session', sessionId]).catch(() => {});
    await rm(root, { recursive: true, force: true });
  }
});

test('command line: an unsafe bind or a taken port fails before a session exists', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-bind-'));
  let sessionId = null;
  try {
    // These refusals happen before anything is spawned, so they run in-process.
    // Paying for a subprocess per argument-validation case would add real cost
    // on a host already near its process limit without proving anything the
    // end-to-end lifecycle test does not already prove.
    for (const [flags, code] of [
      [{ host: '0.0.0.0', 'allow-non-loopback': true }, ERROR_CODES.UNSAFE_HOST],
      [{ host: '10.0.0.5' }, ERROR_CODES.UNSAFE_HOST],
      [{ port: 'not-a-port' }, ERROR_CODES.INVALID_ARGUMENTS],
      [{ port: '-1' }, ERROR_CODES.INVALID_ARGUMENTS],
      [{ 'messages-file': path.join(root, 'missing.json') }, ERROR_CODES.INVALID_ARGUMENTS],
    ]) {
      const refused = await runCommand('start', { 'project-root': root, ...flags });
      assert.equal(refused.ok, false, `start ${JSON.stringify(flags)} is refused`);
      assert.equal(refused.code, code);
    }
    assert.equal(
      existsSync(path.join(root, ...RUNTIME_ROOT_SEGMENTS, 'sessions')),
      false,
      'a refused bind leaves no session directory behind',
    );

    const started = await cli(['start', '--project-root', root]);
    assert.equal(started.result.ok, true);
    sessionId = started.result.session_id;

    // The detached server reports why it could not bind, and the parent removes
    // the half-created session rather than leaving an unusable directory.
    const conflict = await cli(['start', '--project-root', root, '--port', String(started.result.port)]);
    assert.equal(conflict.exitCode, 1);
    assert.equal(conflict.result.code, ERROR_CODES.PORT_UNAVAILABLE);
    const sessionsRoot = path.join(root, ...RUNTIME_ROOT_SEGMENTS, 'sessions');
    const withServerRecord = (await readdir(sessionsRoot))
      .filter((name) => existsSync(path.join(sessionsRoot, name, 'state', 'server-info.json')))
      .sort();
    assert.deepEqual(
      withServerRecord,
      [sessionId],
      'only the session that actually bound became a real session',
    );
  } finally {
    if (sessionId) await cli(['stop', '--project-root', root, '--session', sessionId]).catch(() => {});
    await rm(root, { recursive: true, force: true });
  }
});

test('command line: cleanup keeps a running session and never leaves the runtime root', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-clean-'));
  let sessionId = null;
  try {
    const started = await cli(['start', '--project-root', root]);
    sessionId = started.result.session_id;
    const sessionsRoot = path.join(root, ...RUNTIME_ROOT_SEGMENTS, 'sessions');
    await mkdir(path.join(sessionsRoot, 'not-a-session'), { recursive: true });
    await writeFile(path.join(root, 'keep-me.txt'), 'untouched');

    const cleaned = await cli(['cleanup', '--project-root', root, '--all']);
    assert.equal(cleaned.result.ok, true);
    assert.deepEqual(cleaned.result.removed, [], 'a running session is retained');
    assert.deepEqual(
      cleaned.result.retained.map(({ session_id: id, reason }) => [id, reason]),
      [[sessionId, 'running']],
    );
    assert.equal(existsSync(path.join(sessionsRoot, 'not-a-session')), true, 'unknown names are ignored, not deleted');
    assert.equal(existsSync(path.join(root, 'keep-me.txt')), true);

    const forced = await cli(['cleanup', '--project-root', root, '--session', sessionId, '--force']);
    assert.deepEqual(forced.result.removed.map(({ session_id: id }) => id), [sessionId]);
    assert.equal(existsSync(path.join(sessionsRoot, sessionId)), false);
    assert.equal(existsSync(path.join(root, 'keep-me.txt')), true);
    sessionId = null;
  } finally {
    if (sessionId) await cli(['stop', '--project-root', root, '--session', sessionId]).catch(() => {});
    await rm(root, { recursive: true, force: true });
  }
});

/* 8. Process lifecycle and launcher --------------------------------------- */

test('process lifecycle: runtime roots fall back and the watchdog reaps an orphaned session', async () => {
  const projectRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-root-'));
  const fakeTmp = await mkdtemp(path.join(tmpdir(), 'sdcorejs-vc-tmp-'));
  try {
    const candidates = runtimeRootCandidates({ projectRoot, tmpdir: fakeTmp });
    assert.equal(candidates.length, 2);
    assert.equal(candidates[0].location, 'project');
    assert.equal(candidates[0].root, path.resolve(projectRoot, ...RUNTIME_ROOT_SEGMENTS));
    assert.equal(candidates[1].location, 'os-temp');
    assert.equal(candidates[1].root, path.join(fakeTmp, 'sdcorejs-visual-companion'));

    const resolved = resolveRuntimeRoot({ projectRoot, tmpdir: fakeTmp });
    assert.equal(resolved.location, 'project');
    // With no project root the companion still runs rather than failing a turn.
    assert.equal(resolveRuntimeRoot({ tmpdir: fakeTmp }).location, 'os-temp');
    assert.throws(
      () => resolveSessionPaths({ projectRoot, sessionId: 'nope' }),
      /Visual Companion session identifier/u,
    );

    const sessionId = generateSessionId();
    const paths = resolveSessionPaths({ projectRoot, sessionId });
    let clock = 0;
    const session = createCompanionServer({
      sessionId,
      instanceId: generateInstanceId(),
      token: generateToken(),
      host: '127.0.0.1',
      port: 0,
      contentDir: paths.contentDir,
      stateDir: paths.stateDir,
      idleTimeoutMs: 50,
      lifecycleCheckMs: 5,
      now: () => clock,
    });
    await session.listen(0, '127.0.0.1');
    session.startLifecycleWatchdog();
    assert.equal(session.stopped, false);
    clock = 10_000;
    await new Promise((resolve) => {
      setTimeout(resolve, 120);
    });
    assert.equal(session.stopped, true, 'an idle session shuts itself down');
    assert.equal(existsSync(paths.stoppedFile), true, 'the tombstone lets a reconnecting tab show paused');
    const tombstone = JSON.parse(await readFile(paths.stoppedFile, 'utf8'));
    assert.equal(tombstone.reason, 'idle timeout');
    assert.equal(tombstone.session_id, sessionId);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
    await rm(fakeTmp, { recursive: true, force: true });
  }
});

test('launcher: auto-open is opt-in, shell-free, and refuses anything but a plain http URL', () => {
  const url = 'http://127.0.0.1:5173/?key=abc&next=1';
  assert.equal(isLaunchableUrl(url), true);
  for (const unsafe of [
    '',
    'file:///etc/passwd',
    'javascript:alert(1)',
    '-http://127.0.0.1/',
    'http://127.0.0.1/ x',
    `http://127.0.0.1/?key=${'a'.repeat(2100)}`,
  ]) {
    assert.equal(isLaunchableUrl(unsafe), false, `${unsafe} is refused`);
  }

  assert.deepEqual(resolveLaunchCommand(url, 'darwin'), { command: 'open', args: [url] });
  assert.deepEqual(resolveLaunchCommand(url, 'linux'), { command: 'xdg-open', args: [url] });
  const windows = resolveLaunchCommand(url, 'win32');
  assert.equal(windows.command, 'rundll32.exe');
  assert.deepEqual(windows.args, ['url.dll,FileProtocolHandler', url]);
  assert.equal(resolveLaunchCommand(url, 'plan9'), null);

  const calls = [];
  const spawn = (command, args, options) => {
    calls.push({ command, args, options });
    return { on() {}, unref() {} };
  };
  assert.deepEqual(openInBrowser(url, { enabled: false, spawn }), {
    opened: false,
    reason: LAUNCH_REASONS.DISABLED,
    command: null,
  });
  assert.equal(calls.length, 0, 'a disabled launcher starts no process');

  const launched = openInBrowser(url, { platform: 'linux', spawn });
  assert.equal(launched.opened, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.shell, undefined, 'the URL never reaches a shell');
  assert.equal(calls[0].options.detached, true);
  assert.deepEqual(calls[0].args, [url]);

  assert.equal(openInBrowser('javascript:alert(1)', { platform: 'linux', spawn }).reason, LAUNCH_REASONS.UNSAFE_URL);
  assert.equal(openInBrowser(url, { platform: 'plan9', spawn }).reason, LAUNCH_REASONS.UNSUPPORTED_PLATFORM);
  assert.equal(
    openInBrowser(url, {
      platform: 'linux',
      spawn: () => {
        throw new Error('no launcher');
      },
    }).reason,
    LAUNCH_REASONS.SPAWN_FAILED,
    'a missing platform launcher is reported, never thrown',
  );
});
