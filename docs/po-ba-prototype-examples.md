# Explicit Technical Prototype Prompt Examples

Use these prompts to smoke-test the explicit `technical-prototype` profile.
The role of the requester never selects this profile; the prompt must approve
the profile, semantic owner, assumptions, and optional features.

## New Portal Example

```text
Initialize an insurance claims portal technical prototype from this approved
PRD. Explicitly approve `technical-prototype` for the claims module owner plus
`mock-service`, `permission-bypass`, `seed-data`, and the 25-row assumption.
Start from the Core UI starter template and generate only the approved
list/detail/create/update and workflow screens.
```

Expected routing: `sdcorejs-angular` -> `input-analysis.md` ->
`po-ba-prototype.md` -> `init-portal.md` ->
`init-module.md` -> `init-entity.md` -> screen/action refs -> finish gate.
Expected template baseline: render the Core UI starter template through
`init-portal.md` first, then customize the generated portal structure.

## Existing Portal Module Example

```text
In the existing portal, create module-only `contract-management` from this
approved PRD. Explicitly approve `technical-prototype`, the module owner,
`mock-service`, permission bypass, seed data with 25 rows, menu/routes, and the
named list/detail/create/update workflow actions. Keep the existing Core UI
shell instead of creating a second portal.
```

Expected behavior: the module is demoable locally with route/menu entries,
mock-first services, permission bypass status in the final response, and
prototype assumptions ready for stakeholder confirmation.
