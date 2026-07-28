# Visual Companion

The visual companion is an optional decision aid for spatial or visual choices.
It does not replace the main conversation, an approval gate, or the approved
spec and plan.

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

Follow `_refs/shared/user-choice-prompt.md`:

1. Use native structured choice when its capability is `supported`.
2. For a spatial or visual decision, use a typed native visual surface only
   when its capability is `supported`.
3. Otherwise use `_refs/sdlc/static-visual-composer.mjs` with
   `_refs/sdlc/visual-screen.schema.json` when a static HTML artifact is
   supported.
4. Always include the renderer's numbered Markdown fallback.

Capability `unknown` never authorizes a native surface. No workflow may depend
on click events or a running server.

## Static Screen Contract

- One decision per screen.
- Exactly two or three options.
- Use `single_select`, `multi_select`, `comparison`, or `wireframe`.
- Include the question, criteria, option summary, best-when guidance,
  trade-off, preview metadata, recommendation, and fallback prompt.
- Author screen values in the user's language. Pass the matching runtime locale
  and a complete localized renderer-message bundle for non-English output.
- Treat preview assets as escaped metadata only; never inject arbitrary HTML.
- Ask the user to copy the structured selection or reply in the main
  conversation.

The static composer returns a self-contained local HTML string. It does not
write a durable artifact. Save output only when the user requests it, then apply
`_refs/shared/artifact-lifecycle.md` and classify temporary/generated output
appropriately.

## Approval Boundary

Written feedback in the main conversation wins over any native or visual state.
A selection is design feedback, not implementation approval. Summarize the
chosen direction in the main conversation, convert it to testable acceptance
criteria, and preserve the normal spec and plan approval gates.

## Future Runtime Boundary

A future local server or event bridge is intentionally out of scope. If added
later, it must bind locally by default, use an unguessable session token,
authenticate every event, validate the same closed screen schema, escape all
content, reject replay and cross-session events, use restrictive origin/CSP
controls, avoid telemetry and remote dependencies, reconnect without losing the
Markdown fallback, and never translate a visual event into implementation
approval. Do not add a partial server, socket, reconnect loop, or unauthenticated
event bridge to the static composer.
