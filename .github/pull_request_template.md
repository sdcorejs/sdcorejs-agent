## Summary

- <!-- Summarize the user-visible change and affected areas. -->

## Validation

- [ ] `npm run check:text-hygiene`
- [ ] `npm run check:skills`
- [ ] `npm run test:e2e`
- [ ] `npm run check:skills:ps` when sync behavior or Windows compatibility changes
- [ ] `npm audit --omit=dev` when dependency or CI posture changes
- [ ] `cd site && npm ci && npm audit --omit=dev && npm run build` when site files or site dependencies change

## Generated Mirrors

- [ ] I edited canonical sources, not generated mirrors, or the mirror-only diff is intentionally generated.
- [ ] I ran `npm run sync:skills` when changing `skills/**`, `_refs/**`, `AGENTS.md`, or mirror generation.

## Release Evidence

- [ ] Release notes mention CI, Full E2E, and real-agent transcript evidence when this PR is part of an adopted release.
