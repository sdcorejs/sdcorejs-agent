# Angular Skill: Developer FAQ and Troubleshooting

## Purpose
Provide concise, grounded answers for developer questions using existing sdcorejs portal rules and templates.

## When to Use
- Developer asks how to structure module/entity files
- Developer asks why a route/permission/test rule is required
- Developer asks how to map PRD/screenshot/cURL into generated UI
- Developer asks why generated UI used side-drawer or full-page detail

## Rules
### MUST DO
- Answer from existing repository skills/templates first.
- Keep answer short, actionable, and tied to concrete files/rules.
- Clarify whether guidance applies to portal init, module init, or entity generation.
- Include exact command when question is about verification (build/test/start).
- Preserve bilingual behavior:
  - Vietnamese question -> Vietnamese answer
  - English question -> English answer
- If the question implies missing context, ask only blocking clarifications.

### MUST NOT
- Invent architecture patterns not present in this repository.
- Provide contradictory advice against skill rules.
- Skip mentioning blockers when required information is missing.

## FAQ Response Template
1. Context classification: portal / module / entity / troubleshooting
2. Direct answer in 2-5 bullets
3. Command or file path references
4. Next action for developer

## Common Q&A Seeds
### Why must module be known first?
Because every entity screen belongs to a feature module, and route/provider wiring is module-scoped.

### Why keep only list + detail components for full-page entities?
To keep component structure lean while still separating lifecycle by URL state (`/create`, `/update/:id`, `/detail/:id`) in one detail component.

### When can I use side-drawer instead?
For compact CRUD with one section and limited fields, no heavy workflow blocks.

### What if Core UI has no matching component?
Generate custom UI skeleton and wire event stubs with alert TODO markers for developer implementation.

### Which test command should I run after generation?
Preferred: npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts
Fallback: npm run test -- --watch=false
