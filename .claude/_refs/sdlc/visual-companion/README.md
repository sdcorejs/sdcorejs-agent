# Visual Companion Runtime

Local, authenticated, browser-based decision surface for
`sdcorejs-brainstorming`. It is a presentation and feedback channel, never a
second workflow engine: a browser click is design feedback and can never
approve a spec, plan, implementation, dependency, permission, commit, push, or
any destructive action.

## Attribution

The interaction model is inspired by the Superpowers brainstorming visual
companion (<https://github.com/obra/superpowers>, MIT, inspected at version
6.2.0). This runtime is an independent implementation written against
`node:` built-ins; no Superpowers source was copied, and no Superpowers or
Prime Radiant branding, imagery, product naming, or telemetry is reproduced.

Deliberate divergences from that reference:

| Area | Reference behaviour | Here |
|---|---|---|
| Screen input | Agent writes raw HTML files into a watched directory | Agent publishes a validated structured screen through an authenticated admin endpoint |
| Publish confirmation | `fs.watch` picks the file up asynchronously | `publish` returns only after the server adopted the screen and assigned its revision |
| Screen revision | Implicit newest-mtime | Server-owned monotonic revision, which is what makes stale-event rejection possible |
| Event validation | Any JSON with a `choice` field is appended | Closed versioned schema, session/screen/revision/option binding, cardinality, dedup, size limits |
| Event reading | Whole file re-read; cleared on new screen | Server-assigned sequence plus an opaque cursor so a turn never reprocesses prior clicks |
| Session scope | One fixed directory | Per-session directories with independent tokens and ports |
| CSP | `frame-ancestors 'none'` | `default-src 'none'` with the client pinned by sha256 hash |
| Branding | Remote logo image fetched at render time | Local text only; no network destination other than the companion origin |

## Transport

An RFC 6455 WebSocket on the same authenticated origin as the HTTP surface,
implemented directly on `node:http`'s `upgrade` event.

Chosen over Server-Sent Events plus POST because one bidirectional connection
delivers reload push *and* browser-to-agent events with a single authentication
path, a single reconnect state machine, and a single origin check. SSE+POST
would need two channels, two auth surfaces, and separate queue handling for the
POST direction. The framing needed here is small, and it is exercised directly
by `test/e2e/helpers/visual-companion-client.mjs`, which is a Node-built-in
client, so the choice costs no runtime and no test dependency.

Zero runtime dependencies. Node 18+ built-ins only.

## Layout

| File | Responsibility |
|---|---|
| `protocol.mjs` | Identity, closed event schema, limits, cursor, redaction, result/error codes, CSP and header policy. Pure; no I/O. |
| `screen.mjs` | The single screen model shared by live, static, and Markdown surfaces, plus the safe-content validator. |
| `renderer.mjs` | Preview blocks, option markup, localized message bundle, Markdown fallback. |
| `live-document.mjs` | Full live documents: decision, waiting, paused. |
| `client-script.mjs` | The one fixed browser client, exported with its sha256 hash so the CSP and the served bytes cannot drift. |
| `server.mjs` | HTTP + WebSocket session server, admin endpoints, lifecycle watchdog. |
| `paths.mjs` | Session path resolution and filesystem containment. |

## Session storage

```text
<execution-host-root>/.sdcorejs/tmp/visual-companion/sessions/<session-id>/
  content/    published screens and their local assets
  state/      server-info.json, events.jsonl, stopped.json
```

`.sdcorejs/tmp/**` is already gitignored and already classified
`diagnostic-local` / `commit_policy: never` / `local_only` by
`_refs/shared/artifact-lifecycle.md`, so runtime state can never be staged or
mistaken for a durable Product or Design artifact. When the execution host
cannot hold local runtime state, the runtime root falls back to an OS temporary
directory rather than failing the brainstorming turn.

Tokens, authenticated URLs, ports, PIDs, and raw events never enter a durable
spec, plan, or design artifact. To keep a selected mockup, hand the confirmed
result to `sdcorejs-design`; never promote the session directory.

## Security model

- At least 256 bits of session entropy; every HTTP resource and every event
  connection is authenticated; comparisons are timing-safe.
- The key bootstraps into a port-scoped `HttpOnly; SameSite=Strict` cookie and
  leaves the visible URL.
- Loopback by default. A non-loopback bind requires an explicit opt-in and
  returns a security warning; `0.0.0.0` is refused outright.
- Token authentication is the DNS-rebinding defence; the event channel also
  enforces same-origin when the browser sends `Origin`.
- Assets resolve only to names the current screen references, and only after
  the real path is proven contained, non-symlink, non-hardlinked, and
  MIME-allowlisted. State files are never reachable through the content route.
- Screens carry no behaviour. Scripts, event-handler attributes, `javascript:`
  URLs, embedded/navigational elements, remote references, and unsafe SVG are
  rejected at publication rather than sanitized.
- Bounded request bodies, event size, feedback length, frame payloads, offline
  queue, retained event IDs, and retained events.
- Stop requires a matching per-start instance identity, so stale process
  metadata can never terminate an unrelated process.

No telemetry, no remote fonts, scripts, images, or CDNs. The only network
destination the browser surface uses is the companion's own origin.
