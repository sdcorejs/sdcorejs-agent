---
name: sdcorejs-review-performance-nestjs
description: Use to audit a NestJS backend against `review/performance/budget.md` thresholds — N+1 queries, missing indexes, slow migrations, connection pool sizing, payload size, memory leaks, blocking I/O in main thread. Outputs Critical/Important/Minor findings with query plans + file:line. Triggers - "BE chậm", "API timeout", "N+1 query", "DB query slow", "memory leak nestjs", "connection pool full", or invocation pre-release. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Performance (NestJS)

## Purpose
NestJS performance bottlenecks are almost always one of: N+1 queries, missing indexes, unbounded result sets, sync I/O in the event loop, or connection pool exhaustion. This skill audits against the budget + provides probes for each.

## When invoked
- Pre-release perf gate
- User says "BE chậm", "API timeout", "N+1", "query slow"
- After load test reveals p95 / p99 regression

## Probe suite

### Probe 1 — N+1 query detection

Enable query logging in test mode and count queries per endpoint:

```typescript
// test/perf-probe.ts
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

let queryCount = 0;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const ds = module.get(DataSource);
  ds.driver.afterConnect = () => {
    ds.driver.connection.logger = {
      logQuery: () => { queryCount++; },
      // … other no-ops
    };
  };
});

afterEach(() => {
  console.log(`Queries in last test: ${queryCount}`);
  queryCount = 0;
});

// In tests, assert query count:
it('list endpoint: ≤ 3 queries (paged list)', async () => {
  await request(app).get('/api/product?page=1').expect(200);
  expect(queryCount).toBeLessThanOrEqual(3);
});
```

Severity:
- Critical: any list endpoint > N+1 (e.g. 1 query for the list + 1 per row for related entity = N+1)
- Important: write endpoint with > 5 queries (probably missing batch)

### Probe 2 — Index audit

```bash
# Find columns referenced in WHERE clauses without indexes
psql "$DATABASE_URL" -c "
SELECT schemaname, tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
"

# Cross-reference with @Index() decorators in entities
grep -rnE "@Index" src/**/*.entity.ts | head
```

For each `WHERE foo = ?` in a hot query path, verify `foo` is indexed. Common omissions:
- Foreign-key columns without explicit index (TypeORM creates FK constraint but not always index)
- `status` / `type` enum columns used in filtering
- `createdAt` / `updatedAt` for sorting

Severity: Critical per missing index on hot path.

### Probe 3 — Slow queries (pg_stat_statements)

```bash
psql "$DATABASE_URL" -c "
SELECT
  substring(query, 1, 80) AS query,
  calls,
  ROUND(mean_exec_time::numeric, 1) AS mean_ms,
  ROUND(max_exec_time::numeric, 1) AS max_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;
"
```

Severity:
- Critical: any query > 200 ms mean
- Important: any query > 50 ms mean called > 100 times/min

### Probe 4 — Migration safety on large tables

```bash
# Find recent migrations
ls src/migrations/ | sort | tail -5

# For each, inspect for risky patterns
grep -nE "ADD COLUMN|ALTER COLUMN|DROP COLUMN|CREATE INDEX" src/migrations/*.ts | head
```

Risky patterns:
- `ADD COLUMN NOT NULL` without default → rewrites whole table
- `ALTER COLUMN TYPE` → table lock + rewrite
- `CREATE INDEX` without `CONCURRENTLY` → table lock

Severity: Critical per risky migration without strategy doc.

### Probe 5 — Connection pool

```bash
# Inspect typeorm config
grep -nE "(pool|maxConnections|extra)" src/config/database.config.ts ormconfig.ts 2>/dev/null
```

Targets:
- `max: 10–25` for medium API (each PG connection ~ 10 MB memory)
- `idleTimeoutMillis: 30000`
- `connectionTimeoutMillis: 5000`

If `max` not set, defaults to 10 in `pg` driver → can be too low under burst.

Severity: Important if `max` not set.

### Probe 6 — Payload size & response time (autocannon)

```bash
# p50/p95/p99 sample on representative endpoint
npx --yes autocannon -d 30 -c 10 -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/product/search"
```

Targets (from budget):
- p50 ≤ 150 ms uncached
- p95 ≤ 400 ms
- p99 ≤ 800 ms

### Probe 7 — Response payload size

```bash
# Sample response size for list endpoints
curl -s "$API_URL/api/product/search" -H "Authorization: Bearer $TOKEN" | wc -c
# Compare against page size — should be < page_size * ~1 KB per row
```

Severity:
- Important: list endpoint returning > 100 KB per page (entity leak via missing DTO mapping)
- Critical: any endpoint > 1 MB response (pagination missing)

### Probe 8 — Memory leak (long-running)

```bash
# Sample RSS over 24h load test
pid=$(pgrep -f "node.*dist/main.js")
while sleep 60; do
  echo "$(date +%s) $(ps -o rss= -p $pid)"
done > /tmp/rss-24h.log

# Plot or check growth
awk 'NR==1{first=$2} END{print "growth:", $2-first, "KB over", NR, "samples"}' /tmp/rss-24h.log
```

Severity:
- Critical: growth > 30% over 24h with steady load (leak confirmed)
- Important: growth > 10% (suspicious — investigate event emitters / subscriptions not cleaned up)

### Probe 9 — Sync I/O / blocking calls

```bash
# Synchronous fs / crypto in request path
grep -rnE "(readFileSync|writeFileSync|execSync|pbkdf2Sync)" src/ | head
# Each occurrence blocks the event loop — measure cost in microbench
```

Severity: Critical for any sync call inside a controller / service handler.

### Probe 10 — JSON parsing of huge bodies

```bash
# Check global body-parser limit
grep -nE "bodyParser|json\(\{" src/main.ts src/app.module.ts 2>/dev/null
```

Default Express `express.json()` is 100 KB. If endpoints accept larger payloads, the limit must be raised explicitly.

Severity: Minor if not handled but no large-body endpoint exists.

## Output

```markdown
# Performance Audit (NestJS) — <api> — <date>

## Endpoint latency summary (autocannon, 30s, 10 VU)
| Endpoint | p50 | p95 | p99 | Budget | Status |
|---|---|---|---|---|---|
| GET /api/product/search | 87ms | 320ms | 580ms | p95 ≤ 400ms | ✓ |
| POST /api/order | 240ms | 1200ms | 2400ms | p95 ≤ 400ms | ❌ |

## DB hotspots (pg_stat_statements)
1. SELECT FROM product LEFT JOIN category … — 320 ms mean, 15k calls (N+1?)
2. UPDATE order SET status = … — 95 ms mean

## Findings

### Critical
| # | Probe | Issue | Fix |
|---|---|---|---|
| C-1 | N+1 | `GET /api/order/:id/items` issues 1 + N queries to category | Add `.leftJoinAndSelect('category')` to the base query |
| C-2 | Index | `WHERE status = 'PENDING'` on order table — no index | `CREATE INDEX CONCURRENTLY ON order(status) WHERE status = 'PENDING'` (partial index) |

### Important
...

### Minor
...
```

## Rules

### MUST DO
- Run probes against a production-like environment (staging or local production build) — NOT `npm run start:dev`
- Always include p50, p95, p99 — averages hide tail latency
- Cite the budget threshold next to each measurement
- For N+1, include the query count assertion in the test that prevents regression
- Capture query plans (`EXPLAIN ANALYZE`) for any Critical query finding

### MUST NOT
- Trust dev mode — TypeORM logs everything, NestJS has dev middleware that adds overhead
- Skip the warmup before measuring — first 5s of load are misleading
- Audit memory in dev mode — HMR retains stale closures
- Optimise without measurement — premature optimization wastes time

## Anti-patterns
- **`relations: ['everything']`** on every find — joins exploding into Cartesian products
- **No pagination on list endpoints** — list returns 50k rows when 25 was needed
- **`@Cron` jobs running heavy queries during business hours** — schedule for low-traffic window
- **Single connection for migrations + app traffic** — migration locks block all reads
- **`await Promise.all([100 things])` against the DB** — exhausts connection pool; batch instead
- **Synchronous JSON.stringify on huge objects** — blocks event loop; stream instead

## Cross-references
- Budget thresholds: `review/performance/budget.md`
- Code review (correctness): `review/code/nestjs`
- Architecture (structural perf): `review/architecture`
- Repair loop: `orchestration/repair-loop`
- Verification: `orchestration/verify-before-done`

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
