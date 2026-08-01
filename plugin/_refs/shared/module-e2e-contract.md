# Module-owned E2E discovery and evidence

This contract is loaded by `sdcorejs-test` when repository topology contains
modules or nested Git roots. The module that owns a behavior also owns its E2E
tests, fixtures, page objects, selectors, persona references, and data
setup/cleanup contract. Portal code may deterministically discover, invoke, and
aggregate a module suite; it never copies that suite into the portal.

Each module publishes a versioned manifest validated by
`module-e2e-contract.mjs`. An available suite declares its runner, argument-array
command, repository-relative cwd/config/evidence/test paths, capabilities,
logical persona IDs, and module-owned data contract. `not-applicable` and
`uninitialized` require a reason. Credential values and durable storage state
are forbidden.

Current full-E2E evidence records the owner repository, source fingerprint,
portal SHA, module SHA, portal-pinned module SHA, artifact hashes, actual
argument-array command, and `evidence_class: full-e2e`. Revision mismatch makes
evidence `mismatched`; missing/invalid manifests and uninitialized checkouts are
`NOT RUN`. `SKIPPED`, `NOT RUN`, and `NOT APPLICABLE` remain distinct from
`PASSED`.

Evidence IDs include the module ID plus repository-relative evidence path, so
two modules may safely use the same artifact filename. Golden, container,
live-agent, supplemental-smoke, unit, and full-E2E evidence remain separate
classes and cannot substitute for one another.
