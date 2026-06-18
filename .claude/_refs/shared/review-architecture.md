# Architecture Review Reference

Use this reference when `sdcorejs-review` detects the `architecture` dimension.
Architecture review is module/feature-level and structural. It catches problems that
do not necessarily break a single file but make the system harder to evolve.

## When to run
- Before merging a feature that adds modules or moves existing ones
- After several similar features ship and duplication or wrong abstractions appear
- When the user asks "architecture review", "audit module", or "is this organized correctly"
- As a periodic health check for a mature codebase

## What to check

### 1. Layering
Every SDCoreJS stack has a layered architecture:

| Layer | angular | nestjs | nextjs |
|---|---|---|---|
| UI / Presentation | components, pages | controllers | app/, components/ |
| Application / Workflow | services that orchestrate | services, use-cases | route handlers, server actions |
| Domain / Pure logic | models, validators | entities, domain services, repositories | lib/, validators, schemas |
| Infrastructure | HTTP client, storage | TypeORM, message queue | DB clients, email, storage |

Rule: inner layers must not know about outer layers. Domain must not import UI.
Domain should not import HTTP clients, storage, ORM clients, or framework requests
directly unless the track reference explicitly allows it.

Suggested probes:
```bash
# Domain importing UI (Critical)
grep -rE "from ['\"].*\b(components|controllers|pages|app/.*page)" src/domain/ src/lib/ 2>/dev/null

# Domain importing infrastructure (Important)
grep -rE "from ['\"].*\b(typeorm|http-client|storage|Express|NextRequest)" src/domain/ src/lib/ 2>/dev/null
```

Severity:
- Critical: domain -> UI imports
- Important: domain -> infrastructure imports that should go through an injected seam
- Minor: UI -> infrastructure direct calls that bypass the application layer

### 2. Circular dependencies
Two files importing each other directly or transitively means the module boundary is
wrong, the files should be one unit, or a shared concept is missing.

Suggested probe:
```bash
npx --yes madge --circular --extensions ts,tsx src/ 2>/dev/null
```

Severity:
- Critical: any cycle in the domain layer
- Important: any cycle in the application layer
- Minor: cycles inside one leaf UI folder when impact is contained

### 3. Module boundaries
Each module should expose one obvious public API. Imports from outside should not
reach into internal files.

Bad:
```typescript
import { PriceCalculator } from '@/modules/billing/services/internal/price-calculator';
```

Good:
```typescript
import { PriceCalculator } from '@/modules/billing';
```

Suggested probes:
- Search for `from '@/.*/internal/'`
- Search for relative imports crossing 3+ directory levels into another module
- Check whether modules have `index.ts` or `public-api.ts` where the track expects one

Severity:
- Important: cross-module imports bypass public API
- Minor: missing public API file where a module already has multiple consumers

### 4. Abstraction leaks
A function signature should not expose its implementation detail.

| Leak | Tighter contract |
|---|---|
| `getUsers(query: SqlQuery)` | `getUsers(filter: UserFilter)` |
| `notify(email: SmtpMessage)` | `notify(to: User, event: DomainEvent)` |
| `save(entity: TypeOrmEntity)` | `save(user: User)` |
| `render(html: string)` | `render(content: Article)` |

Probe type signatures in the domain layer for `Sql*`, `SmtpMessage`, `TypeORM*`,
`Express.Request`, `NextRequest`, concrete client classes, or framework-specific DTOs.

Severity:
- Important: domain types reference infrastructure or framework types
- Minor: helper utilities with leaky params that can be wrapped later

### 5. Wrong-place files
Files in the wrong folder usually mean confused intent or decaying structure.

| Symptom | Likely fix |
|---|---|
| Validator inside `controllers/` | move to domain validators or schemas |
| Business rule inside HTTP middleware | move to a domain/application service |
| Component with DB query inline | extract to service / server action / route handler |
| `utils/everything.ts` with unrelated jobs | split by purpose; identify the missing module |

Check file size, import direction, and whether the folder name matches the file's responsibility.

### 6. Over-engineering / premature abstraction
| Symptom | Severity |
|---|---|
| Generic `BaseService<T>` with one user | Important: delete until the third real user appears |
| Four-layer factory for a simple function | Important: collapse |
| Interface with one implementation that is never mocked | Minor: remove the interface |
| Feature flag that is always true/false | Minor: remove the flag |
| Abstract class never extended | Important: make concrete or delete |

Use a "three uses" check. If a symbol/file is imported in fewer than three places,
ask why the abstraction exists.

### 7. Missing seams
Symptoms:
- One service mutates global cache, sends email, writes to DB, and calls another service in one function
- Every controller repeats the same 50-line `try/catch` error mapping
- Adding a provider requires touching many unrelated files

Severity:
- Important: god-functions/classes over roughly 200 LoC or with more than five responsibilities
- Minor: repeated boilerplate that should become a decorator, middleware, wrapper, or helper

### 8. Drift from documented conventions
If `CLAUDE.md`, `AGENTS.md`, or `_refs/` define a convention, code that does not
follow it is architectural drift.

Probe: compare convention usage count against files in scope. A ratio below 80%
usually deserves a drift finding, unless the convention is new.

### 9. Test architecture
Compare tests against `_refs/shared/testing-philosophy.md`.

Severity:
- Important: unit tests covering integration concerns, such as mocked DB tests asserting SQL behaviour
- Important: e2e tests for pure-logic edge cases that should be unit tests
- Critical: no e2e coverage for the feature's primary user flow when the feature is user-facing

### 10. Documentation entropy
- README or module docs describe old behaviour, not current code: Minor
- TODO/FIXME without date or owner: Minor; move durable follow-up to auto-task-tracker
- Comments explain "what" instead of "why": Minor/cosmetic unless misleading

## Output additions
When using this reference, add an "Architectural recommendations" section after
the standard severity tables:

```markdown
## Architectural recommendations
- <module extraction / boundary cleanup / abstraction retirement / seam to introduce>
```

## Rules
- Run automated probes before manual review.
- Acknowledge strengths; architecture review should not be all-negative.
- Cite `file:line` for every finding.
- Use Critical / Important / Minor severity criteria consistently.
- Recommend scoped fixes. Do not propose a big-bang rewrite.
- Stay in scope; do not audit unrelated modules.
