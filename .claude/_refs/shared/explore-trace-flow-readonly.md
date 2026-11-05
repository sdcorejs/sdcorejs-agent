# Explore: trace-flow-readonly

## `trace-flow-readonly`

Trace actual code paths, not assumed conventions:

1. Start from the explicit user-provided entrypoint if present.
2. If no entrypoint is provided, infer candidates and ask for selection when
   ambiguous.
3. For frontend-to-backend traces, map UI action -> route/client call -> API
   endpoint -> service/domain/data layer -> response/render/update.
4. For backend traces, map controller/handler -> guards/middleware/pipes/
   interceptors -> service/domain -> persistence/integration -> response/error
   path.
5. For Next.js, distinguish app router/pages router, server/client components,
   route handlers, server actions, caching, and runtime only when detected.
6. For Angular and NestJS, apply Core UI or SDCoreJS rules only when the
   `stack_profile` evidence supports them.

Do not write diagrams or files unless the user explicitly asks.
