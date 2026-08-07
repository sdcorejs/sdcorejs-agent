# Visual Companion

The visual companion is an optional decision aid for spatial or visual choices.
It does not replace the main conversation, an approval gate, or the approved
spec and plan.

A browser click is design feedback. It can never approve a spec, plan,
implementation, dependency, permission, commit, push, or destructive action.

## When To Offer

Offer it just in time when seeing alternatives materially improves the next
decision: layout, navigation, visual hierarchy, screen flow, wireframe,
before/after UX, diagram topology, or another spatial relationship.

Keep requirements, scope, business rules, API design, data modeling, test
strategy, acceptance criteria, naming, and implementation sequencing in text
unless a diagram is necessary to understand a spatial relationship. A UI topic
is not automatically a visual decision.

Do not repeat an offer after the user declines unless a new and materially
different visual decision appears.

## Surface Selection

Visual and non-visual decisions use separate priority ladders. Resolve the
surface from `_refs/harness/capability-contract.json`; a preference never
overrides a capability.

For a spatial or visual decision:

1. Live companion session when `live_visual_companion` and
   `persistent_local_process` are both `supported`, and the user consented to
   local runtime writes.
2. A typed native visual surface when `visual_surface` is `supported`.
3. `_refs/sdlc/static-visual-composer.mjs` with
   `_refs/sdlc/visual-screen.schema.json` when `static_html_artifact` is
   `supported`.
4. Numbered Markdown.

For every other decision, and for every approval regardless of subject, follow
`_refs/shared/user-choice-prompt.md`: native structured choice when supported,
otherwise numbered Markdown. An approval never reaches a visual surface.

Capability `unknown` never authorizes a surface. Always include the renderer's
numbered Markdown fallback, on every surface, so the decision survives a browser
that never opens.

## Consent Boundary

A live session is two separate side effects, and each needs its own explicit
confirmation:

- **Local runtime writes.** The session writes under the execution host's
  `.sdcorejs/tmp/visual-companion/`. Confirm this before starting a session.
  Without that confirmation the ladder starts at the static composer.
- **Browser auto-open.** Launching a browser is a visible action on the user's
  machine. It requires `browser_auto_open` to be `supported` and its own
  confirmation. Without it, present the session URL and let the user open it.

Never start a session as a side effect of another decision, and never bundle
either confirmation into an unrelated approval.

## Session Lifecycle

`_refs/sdlc/visual-companion/cli.mjs` is the only entry point. Every command
prints one JSON object and exits non-zero on failure.

```text
node _refs/sdlc/visual-companion/cli.mjs start   --project-root <root> [--locale <tag>] [--messages-file <path>] [--owner-pid <pid>] [--open]
node _refs/sdlc/visual-companion/cli.mjs status  --project-root <root> --session <id> [--reveal-url]
node _refs/sdlc/visual-companion/cli.mjs publish --project-root <root> --session <id> --screen-file <path>
node _refs/sdlc/visual-companion/cli.mjs events  --project-root <root> --session <id> [--after <cursor>]
node _refs/sdlc/visual-companion/cli.mjs waiting --project-root <root> --session <id>
node _refs/sdlc/visual-companion/cli.mjs stop    --project-root <root> --session <id>
node _refs/sdlc/visual-companion/cli.mjs cleanup --project-root <root> [--session <id>] [--all]
```

`publish` also accepts the screen on standard input when `--screen-file` is
omitted. `start` additionally accepts `--host`, `--port`,
`--allow-non-loopback`, `--idle-timeout-ms`, and `--start-timeout-ms`;
`cleanup` accepts `--max-age-ms` and `--force`; `stop` accepts `--instance`.

Pass `--owner-pid` with the process that owns the brainstorming turn. The server
then exits when that process does. Without it the only backstop is the idle
timeout, which defaults to four hours, so repeated starts leave background
servers holding ports until then. `cleanup` removes stopped sessions, but it
deliberately keeps a running one, so an orphan must be stopped by session id.

A non-English `--locale` requires `--messages-file` with a complete localized
bundle. A partly translated surface is worse than an English one, because the
user cannot tell which labels are authoritative. `start` validates the pair
before it binds a port and fails with `INVALID_ARGUMENTS`, so a missing bundle
can never produce a started session that fails on every render.

`events` returns the read summary at the top level of its result:
`authority`, `cursor`, `event_count`, `exploration_count`, `submission_count`,
`latest_submission`, `feedback`, `events`, and the authoritative `current`
screen identity.

Ordinary flow:

1. `start` once per visual thread. Keep the returned `session_id`. Present the
   authenticated URL only to the user; never place it in a durable artifact.
2. `publish` one screen per decision, then ask the user to review it and reply
   in the main conversation.
3. `events --after <cursor>` to read what the browser reported. Carry the
   returned `cursor` into the next read so a prior click is never reprocessed
   as current intent.
4. `waiting` when the conversation moves back to text, so a stale decision does
   not stay on screen.
5. `stop` when the visual thread is finished. `cleanup` reclaims stopped
   sessions; it never removes a running one unless the caller names it and
   forces it.

Failure is never fatal to the turn. On any non-zero exit, state what failed,
drop to the next surface on the ladder, and continue the decision in text.

Stable codes: `SESSION_STARTED`, `SCREEN_PUBLISHED`, `EVENTS_READ`,
`WAITING_PUBLISHED`, `SESSION_STOPPED`, `CLEANED`, and the error codes
`INVALID_ARGUMENTS`, `INVALID_SCREEN`, `INVALID_EVENT`, `UNKNOWN_SESSION`,
`SESSION_NOT_RUNNING`, `SESSION_ALREADY_STOPPED`, `OWNERSHIP_UNPROVEN`,
`PORT_UNAVAILABLE`, `UNSAFE_HOST`, `UNSAFE_CONTENT`, `PATH_ESCAPE`,
`STALE_SCREEN`, `CROSS_SESSION`, `REPLAYED_EVENT`, `PAYLOAD_TOO_LARGE`,
`RUNTIME_UNAVAILABLE`.

## Screen Contract

One screen model serves the live surface, the static artifact, and the Markdown
fallback. It is defined by `_refs/sdlc/visual-companion/screen.mjs` and
published as `_refs/sdlc/visual-screen.schema.json`.

- One decision per screen.
- Two to four options.
- Use `single_select`, `multi_select`, `comparison`, or `wireframe`.
- Include the question, criteria, option summary, best-when guidance,
  trade-off, preview metadata, recommendation, and fallback prompt.
- An option may carry one optional `preview`: `wireframe`, `svg`, `image`,
  `flow`, or `table`. A preview describes what to show; it never carries
  behaviour.
- Author screen values in the user's language. Pass the matching runtime locale
  and a complete localized renderer-message bundle for non-English output.
- Screens are rejected at publication rather than sanitized. Script, event
  handler attributes, `javascript:` URLs, embedded or navigational elements,
  remote references, and unsafe SVG are refused as `UNSAFE_CONTENT` or
  `INVALID_SCREEN`.

The static composer returns a self-contained local HTML string. It does not
write a durable artifact. Save output only when the user requests it, then apply
`_refs/shared/artifact-lifecycle.md` and classify temporary/generated output
appropriately.

## Event Contract

Browser events are validated against a closed schema and bound to the current
session, screen, and revision. The server assigns the sequence and the
`authority: supporting-feedback` field, and the read path asserts it.

- A click against a superseded screen is refused as `STALE_SCREEN`.
- A click from another session is refused as `CROSS_SESSION`.
- A repeated event id is refused as `REPLAYED_EVENT`.
- Publishing a new screen invalidates prior exploration, because those clicks
  answered a different question.

Written feedback in the main conversation always wins over any native or visual
state.

## Runtime And Artifact Boundary

`.sdcorejs/tmp/visual-companion/**` is conversation-local runtime state. It is
`local_only` under `_refs/shared/artifact-lifecycle.md`, never staged, never
committed, never read back as project context, and never promoted to a Product
or Design artifact. When the execution host cannot hold local runtime state, the
runtime root falls back to an OS temporary directory rather than failing the
turn.

Tokens, authenticated URLs, ports, process ids, and raw events never enter a
durable spec, plan, or design artifact. To keep a selected mockup, hand the
confirmed result to `sdcorejs-design`; never promote the session directory.

The runtime binds loopback by default, authenticates every resource and every
event connection, pins its one browser client by CSP hash, and refuses a
non-loopback bind without an explicit opt-in. See
`_refs/sdlc/visual-companion/README.md` for the full security model, the
transport rationale, and the attribution notice.

## Approval Boundary

A selection is design feedback, not implementation approval. Summarize the
chosen direction in the main conversation, convert it to testable acceptance
criteria, and preserve the normal spec and plan approval gates. No workflow step
may depend on a click event or on a running server.
