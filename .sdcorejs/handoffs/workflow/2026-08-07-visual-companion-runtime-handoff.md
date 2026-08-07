---
schema_version: 1
artifact_id: handoff:visual-companion-runtime
artifact_kind: handoff
change_ref: visual-companion-runtime
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-brainstorming
status: partial
---

# Handoff - Visual Companion live runtime

Transfer note for continuing this work on another machine. The runtime core is
implemented and verified; the workflow integration is not started. The feature
is currently **inert**: working code with no caller.

## What exists and is verified

Seven new canonical files under `_refs/sdlc/visual-companion/` (1553 lines) plus
one test helper.

| File | Lines | Responsibility |
|---|---|---|
| `protocol.mjs` | 411 | Identity, closed event schema, limits, cursor, redaction, result/error codes, CSP and header policy. Pure, no I/O. |
| `screen.mjs` | 288 | Single screen model for live/static/Markdown. Safe-content validator. |
| `renderer.mjs` | 270 | Preview blocks, option markup, localized messages, Markdown fallback. |
| `live-document.mjs` | 152 | Live decision, waiting, and paused documents. |
| `client-script.mjs` | 221 | The one fixed browser client, exported with its sha256 hash. |
| `server.mjs` | 603 | HTTP + RFC 6455 WebSocket session server, admin endpoints, lifecycle watchdog. |
| `paths.mjs` | 113 | Session paths and filesystem containment. |
| `test/e2e/helpers/visual-companion-client.mjs` | 168 | Node-built-in WebSocket client for tests. |

Zero runtime dependencies. Node 18+ built-ins only.

### Verified behaviour

A 12-step deterministic end-to-end scenario was executed and passed:
unauthenticated request rejected with 403; screen published with a
server-assigned revision; real wireframe and flow previews rendered; event
channel connected; selection accepted with a server sequence; event read back
with correct screen/revision/option identity; second screen published; existing
connection received the reload push; an event from the previous screen rejected
as `STALE_SCREEN`; waiting screen published; stop with a mismatched instance id
refused as `OWNERSHIP_UNPROVEN`; stop with the owned instance id succeeded.
Cursor replay suppression and `authority: supporting-feedback` on every event
were also confirmed.

Repository gates at handoff time: `check:skills`, `check:text-hygiene`,
`check:executable-references`, `build:site`, and `git diff --check` all exit 0.
`npm test` is 382 tests, 381 pass, 0 fail, 1 pre-existing platform skip.

## What is NOT done

Phases 2 (CLI), 5, 6, 7, 8, 10, 11, and 12 of the original request.

1. **No CLI.** `cli.mjs` does not exist. There is no
   `start/status/publish/events/waiting/stop/cleanup` entry point, so a skill
   cannot drive the runtime yet.
2. **Harness untouched.** `_refs/harness/runtime-policy.mjs` still returns
   native structured choice before any visual surface, which is the specific
   reason a visual decision never reaches a companion. No `visual.session.*`
   actions and no `live_visual_companion` / `visual_event_bridge` /
   `persistent_local_process` / `browser_auto_open` capabilities exist.
   `capability-contract.json`, the four adapters, the five generated manifests,
   and the behavioural sentinels are unchanged.
3. **Brainstorming unchanged.** `skills/shared/sdlc/01-brainstorming.md:233`
   still reads `Do not start or invent a local server/event bridge.` and
   `_refs/sdlc/visual-companion.md:62-70` still declares a runtime server out of
   scope. Both statements are now false and must be rewritten.
4. **Lifecycle boundary missing.** `.sdcorejs/tmp/visual-companion/**` is
   covered incidentally by the existing `.sdcorejs/tmp/` ignore and the
   `\.sdcorejs/(?:cache|caches|tmp|temp|...)/` local-only pattern, but there is
   no explicit rule, no `local_runtime_writes_allowed_after_consent` boundary in
   `project-context.md`, and no test asserting it.
5. **No tests.** Only the WebSocket client helper was written. Zero of the
   required assertions across the eight test categories exist, and there is no
   `test:e2e:visual-companion` script.
6. **No browser auto-open** and no cross-platform launcher.
7. **Static composer not migrated.** `_refs/sdlc/static-visual-composer.mjs`
   still carries its own copy of the screen schema. Two schemas now coexist,
   which the request explicitly forbids. It must delegate to `screen.mjs`.
8. **No documentation updates** to README, CLAUDE, AGENTS, TESTING, VALIDATION,
   or TROUBLESHOOTING.

## Decisions already made - do not relitigate without reason

- **Transport: raw RFC 6455 WebSocket** on the same authenticated origin.
  Chosen over SSE+POST because one bidirectional connection gives reload push
  and browser events with a single auth path, one reconnect state machine, and
  one origin check. Rationale recorded in
  `_refs/sdlc/visual-companion/README.md`.
- **Publish through an authenticated admin endpoint, not a filesystem watcher.**
  This is a deliberate divergence from the Superpowers reference. It removes a
  publish/observe race, avoids `fs.watch` platform differences, and lets the
  server own the screen revision, which is what makes stale-event rejection
  possible at all.
- **Client inlined, not linked.** A CSP hash-source only authorizes an external
  script when it also carries subresource integrity, so inlining is what lets
  `script-src 'sha256-...'` be the single gate on executable behaviour.
- **Screens carry no behaviour.** Unsafe fragments are rejected at publication
  rather than sanitized, so an authoring bug surfaces instead of silently
  degrading.
- **Events are `supporting-feedback` by server assignment** and asserted on
  read, so a browser click can never encode workflow approval.

## Attribution constraint

Behavioural inspiration only from Superpowers 6.2.0 (MIT,
<https://github.com/obra/superpowers>). No source was copied. The reference
implementation fetches a remote brand image at render time; this runtime must
stay free of remote assets and telemetry. The divergence table in the runtime
README must stay accurate as the work continues.

## Recommended next steps, in order

1. Write `cli.mjs` with machine-readable JSON output, stable result/error codes,
   non-zero exit on failure, and deterministic path resolution. This unblocks
   everything else.
2. Migrate `static-visual-composer.mjs` to delegate to `screen.mjs` and update
   `test/e2e/static-visual-composer.test.mjs`. Note the option cardinality
   changed from 2-3 to 2-4, so that test will need updating.
3. Rework `runtime-policy.mjs` with separate visual and non-visual priorities,
   then add the new actions and capabilities across the contract, the four
   adapters, and the generated manifests.
4. Rewrite the brainstorming Optional Visual Companion section and
   `_refs/sdlc/visual-companion.md` as an executable workflow contract, and
   remove the two now-false prohibitions.
5. Add the lifecycle and project-context boundary plus its test.
6. Write the test suites and register `test:e2e:visual-companion` in
   `test:e2e:repository`.
7. Update documentation, regenerate mirrors, run the full gate set.

## Known gotchas hit during this work

- `scripts/sync-skills.mjs` validates that every `_refs/...` path mentioned in
  prose resolves. A reference to a file that does not exist yet fails
  `sync:skills`. Write the file or omit the reference.
- Adding files under `_refs/` changes the `source_roots` and
  `entrypoint_contract` fingerprints in `.sdcorejs/summary.md`, which fails
  `production-readiness-contract.test.mjs`. Recompute with
  `computeProjectFingerprints` and update the summary.
- `check:text-hygiene` rejects non-ASCII identifiers in source. Keep runtime
  source English and ASCII.
- Adding prose to canonical refs shifts the communication-economy byte totals
  and fails `communication-economy.test.mjs` until the `VALIDATION.md` report
  rows are regenerated from `npm run report:communication-economy`.

## Blockers

None technical. The remaining work is scope, not obstruction.
