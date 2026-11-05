# Explore: code-map-readonly

## `code-map-readonly`

First decide whether targeted reads already answer the question. Do not create
a code map for a few named files, a known entrypoint, or a relationship
answerable from `rg`, manifests, routes, or module config.

Use a scoped map for cross-module/package/layer work, impact or ownership
analysis, composition hosts, frontend-to-persistence traces, unclear dependency
direction, or a large repository where sequential reads would be wasteful.

Return the bounded `code_context` node/edge contract from
`_refs/shared/project-context.md`. Every node and edge cites repository-relative
path evidence. Do not persist the map.

When the repository already has a dependency graph, language/LSP index, or
build graph:

- detect it from config, scripts, or documented tooling;
- use only a documented read-only scoped query;
- do not install or download a tool;
- record provider evidence and limitations;
- classify any generated provider cache as `local_only`;
- keep current code/config as the higher source of truth.

Do not generate, embed, auto-refresh, or commit a repository-wide codegraph.
`code-map-write-approved` may persist only the explicitly approved task-scoped
map under its semantic owner repository. Missing owner repositories block; a
portal is not a fallback for a module-owned map.
