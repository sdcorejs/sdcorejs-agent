# Screen Archetype Consistency

Use only for comparable screens in the requested scope. Identify an accepted
exemplar by path, purpose, permission model and data volume; a nearby screen is
observed evidence, not automatically a rule. Compare responsibilities rather
than enforcing identical markup or component counts.

| Archetype | Inspect |
|---|---|
| List | server paging/filter/sort, URL or state restoration, loading/empty/error/retry, selection across pages, accessible row actions |
| Detail | direct navigation, read permission, owner/tenant boundary, loading/not-found/denied/error, refresh after mutation |
| Form | validation parity, dirty/leave behavior, submit disabling, duplicate submission, error mapping, success refresh |
| Action | visibility vs server permission, confirmation when needed, pending/error state, idempotence and post-action invalidation |

Trace route -> screen -> service -> endpoint for list/detail/form/actions.
Build a compact matrix with operation, UI condition, effective server guard,
permission/owner/tenant rule and denial test. UI hiding cannot prove server
authorization. Check alternate entrypoints, deep links and direct HTTP calls.
Compare equivalent operations; list and delete can legitimately require
different permissions. Global/inherited guards count when their coverage and
metadata precedence are verified.

Report a mismatch with both source locators, expected contract, failure trigger,
impact and smallest proving test. Source-only evidence cannot establish rendered
layout, accessibility or interaction success; say what remains unobserved.
Accepted kiosk/read-only/legacy variants are controls, not missing CRUD features.
Keep subjective preferences advisory. Use the existing UI/UX and consistency
finding contracts when applicable, without a second blocker for the same cause.
