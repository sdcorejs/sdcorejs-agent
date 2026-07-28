# Static Visual Composer

The composer renders a closed, typed visual-decision screen as a deterministic HTML string. It is a static aid for a decision in the main conversation, not a runtime application.

Use validateVisualScreen before rendering, renderStaticVisualScreen for self-contained HTML, renderMarkdownFallback for the equivalent text-only representation, and formatCopiedResponse for the stable main-conversation payload.

The schema and validator reject unknown properties and invalid identifiers. Authored values are escaped before they reach HTML, attributes, or Markdown. preview_asset is display-only metadata; it is not loaded, fetched, or treated as executable content.

Every rendered screen visibly includes its Markdown fallback. Its sole fixed inline script supplies keyboard selection, optional feedback, and copy handling. Clipboard failure exposes a selectable local response. Rendering returns strings and objects only; it does not create or modify files.

## Runtime localization

Keep the reusable schema and composer source in English. At runtime, author the
screen fields in the user's language and pass a valid BCP 47-style `locale`.
For a non-English locale, also pass a complete `messages` bundle for the fixed
renderer chrome, accessibility labels, status announcements, and Markdown
headings. The same bundle drives HTML and Markdown so the two fallbacks cannot
silently diverge.

The message bundle is runtime-only and is not added to the durable screen
schema. Every message is treated as untrusted text and escaped before use.
Messages are exposed to the fixed interaction script only through escaped data
attributes; authored strings are never interpolated into executable source.
English remains the deterministic default when no locale is supplied.

## Runtime boundary

No local server, WebSocket, authentication token, reconnect loop, or event bridge is part of this composer. A future full runtime would need a separate threat model covering origin isolation, authentication, replay protection, CSRF, session lifecycle, reconnect behavior, and cleanup before it can be designed or implemented.
