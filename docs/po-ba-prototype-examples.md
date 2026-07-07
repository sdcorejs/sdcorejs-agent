# PO/BA Prototype Prompt Examples

Use these prompts to smoke-test `sdcorejs-angular` PO/BA Prototype Portal Mode.
They are source examples only; runtime responses should still localize to the
user's language.

## New Portal Example

```text
Initialize a PO/BA insurance claims portal demo from this PRD. There is no
API/backend/design yet. Use PO/BA prototype mode, disable permission for the
starter portal, start from the Core UI starter template, create module `claims`,
generate list/detail/create/update and workflow screens, keep services
mock-first, and seed 25 realistic rows for the main claims listing.
```

Expected routing: `sdcorejs-angular` -> `input-analysis.md` ->
`po-ba-prototype.md` -> `init-portal.md` -> `admin-screens.md` ->
`init-module.md` -> `init-entity.md` -> screen/action refs -> finish gate.
Expected template baseline: render the Core UI starter template through
`init-portal.md` first, then customize the generated portal structure.

## Existing Portal Module Example

```text
In the existing portal, create module-only `contract-management` from this PRD.
No API/backend is available. Use mock-first service mode, bypass permission for
prototype review, keep the existing Core UI shell instead of creating a second
portal, generate navigable menu/routes plus list/detail/create/update workflow
actions, and seed 25 realistic rows for each primary listing.
```

Expected behavior: the module is demoable locally with route/menu entries,
mock-first services, permission bypass status in the final response, and
prototype assumptions ready for PO/BA confirmation.
