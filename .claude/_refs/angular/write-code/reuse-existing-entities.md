> **Reference for the `sdcorejs-angular` orchestrator.** Loaded before generating
> or extending any Angular model, interface, type, service, store, repository, or
> API client for an entity or a related entity.

# Reuse Existing Entities and Services

## Purpose

Generate Angular code that integrates with the existing codebase first. API docs,
PRDs, screenshots, Figma/image notes, and business descriptions describe the new
contract; the codebase decides which model/service/entity already exists, where
code belongs, and what must be reused or minimally extended.

## When to load

Load this reference before:

- Creating or extending `<entity>.model.ts`, interfaces, DTOs, types, stores,
  repositories, API clients, or services.
- Adding fields that reference another domain entity.
- Adding select/filter/detail hydration for a related entity.
- Parsing an API/PRD/image/schema that mentions related entities.

## Discovery workflow

1. Identify the primary entity and every related entity from the request/source
   artifact. Example: `Order` may relate to `Customer`, `Product`, `Payment`,
   `Address`, and `Shipment`.
2. Search the target project before creating anything. Use multiple variants:
   - Files: `<entity>.model.ts`, `<entity>.interface.ts`, `<entity>.dto.ts`,
     `<entity>.type.ts`, `<entity>.service.ts`, `<entity>-api.service.ts`,
     `<entity>.repository.ts`, `<entity>.store.ts`.
   - Symbols: `<Entity>`, `<Entity>Model`, `<Entity>Dto`, `I<Entity>`,
     `<Entity>Response`, `<Entity>Summary`, `<Entity>Option`,
     `<Entity>BasicInfo`, `<Entity>Service`, `<Entity>ApiService`.
   - Naming variants: kebab-case, camelCase, PascalCase, singular/plural, and
     common domain aliases in the current project.
3. Inspect matching files, barrel exports, imports, and usages before deciding.
4. Record a reuse decision per entity: `reuse`, `extend`, or `create new`.
5. Present a short pre-code summary:
   - Existing model/service/type found and reused.
   - Files that will import those contracts.
   - Existing files that need minimal field/method extension.
   - Truly new files to create.
   - Why no duplicate model/service is being created.

## Reuse rules

- If a matching model/service/type exists, import and reuse it.
- Do not inline an entire related entity inside another model when a model exists.
- Do not create duplicate or near-duplicate types under a different name.
- Add missing fields/methods only when needed and after checking usages.
- Preserve backward compatibility. Prefer optional fields when a new API only
  adds data. Do not rename existing fields without a clear compatibility plan.
- Create a new file only after the search finds no suitable existing contract and
  the target project convention confirms the location/name.

## Relationship modeling

- If the API returns only an id, model the relation as `<entity>Id`; do not assume
  the full object exists.
- If the API returns a nested object, use the existing related model/type when it
  matches the payload.
- If the nested payload is partial, first reuse an existing summary/minimal type
  such as `<Entity>Summary`, `<Entity>Option`, or `<Entity>BasicInfo`.
- If no summary type exists, prefer adding a summary type near the related
  entity model instead of inlining the object inside the primary entity model.
- Use `customer: Customer` only when the API really returns a customer object or
  the UI hydrates it from an existing service. Use `customerId: string` when only
  the relation id is present.

## Service reuse

- When a related entity's data is needed, reuse the existing related service.
- Do not create names like `OrderCustomerService` when `CustomerService` already
  owns suitable customer API logic.
- If the related service exists but lacks a needed method, add the smallest
  compatible method there and check existing usages.
- Create a new service only when no corresponding service exists or the current
  architecture explicitly separates that API boundary.

## Mandatory checklist

- [ ] Primary entity and related entities identified.
- [ ] Existing model/interface/type/dto files and symbols scanned.
- [ ] Existing service/api/repository/store files and symbols scanned.
- [ ] Naming and folder conventions checked.
- [ ] Each entity has a decision: reuse, extend, or create new.
- [ ] No duplicate model/service for the same domain entity.
- [ ] Model relations use imports/reused types instead of inline objects when a
      related entity contract exists.
