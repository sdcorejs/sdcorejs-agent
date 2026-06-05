# Review-Performance Knowledge — NestJS

> Track-specific probes loaded on demand by `sdcorejs-review-performance` when the
> project is a NestJS backend (`nest-cli.json` + `@nestjs/*`), AFTER the cross-track
> budget in `_refs/shared/review-performance.md`. Not a dispatchable skill — no
> frontmatter. Output format owned by the parent skill. All numeric budget thresholds
> (API-response, DB-query, memory) live in the shared ref; frontend budgets (bundle,
> Core Web Vitals) do not apply to a NestJS API.

NestJS performance bottlenecks are almost always one of: N+1 queries, missing indexes, unbounded result sets, sync I/O in the event loop, or connection-pool exhaustion. Audit against the shared budget + these probes. Run against a production-like environment (staging or local production build), NOT `npm run start:dev`, and warm up before measuring.

## NS-P1: N+1 query detection

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
- **Critical**: any list endpoint > N+1 (e.g. 1 query for the list + 1 per row for related entity = N+1)
- **Important**: write endpoint with > 5 queries (probably missing batch)

## NS-P2: Index audit

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

Severity: **Critical** per missing index on hot path.

## NS-P3: Slow queries (pg_stat_statements)

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
- **Critical**: any query > 200 ms mean
- **Important**: any query > 50 ms mean called > 100 times/min

Capture `EXPLAIN ANALYZE` for any Critical query finding.

## NS-P4: Migration safety on large tables

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

Severity: **Critical** per risky migration without strategy doc.

## NS-P5: Connection pool

```bash
# Inspect typeorm config
grep -nE "(pool|maxConnections|extra)" src/config/database.config.ts ormconfig.ts 2>/dev/null
```

Targets:
- `max: 10–25` for medium API (each PG connection ~ 10 MB memory)
- `idleTimeoutMillis: 30000`
- `connectionTimeoutMillis: 5000`

If `max` not set, defaults to 10 in `pg` driver → can be too low under burst.

Severity: **Important** if `max` not set.

## NS-P6: Payload size & response time (autocannon)

```bash
# p50/p95/p99 sample on representative endpoint
npx --yes autocannon -d 30 -c 10 -H "Authorization: Bearer $TEST_TOKEN" "$API_URL/api/product/search"
```

Targets (from budget):
- p50 ≤ 150 ms uncached
- p95 ≤ 400 ms
- p99 ≤ 800 ms

## NS-P7: Response payload size

```bash
# Sample response size for list endpoints
curl -s "$API_URL/api/product/search" -H "Authorization: Bearer $TOKEN" | wc -c
# Compare against page size — should be < page_size * ~1 KB per row
```

Severity:
- **Important**: list endpoint returning > 100 KB per page (entity leak via missing DTO mapping)
- **Critical**: any endpoint > 1 MB response (pagination missing)

## NS-P8: Memory leak (long-running)

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
- **Critical**: growth > 30% over 24h with steady load (leak confirmed)
- **Important**: growth > 10% (suspicious — investigate event emitters / subscriptions not cleaned up)

## NS-P9: Sync I/O / blocking calls

```bash
# Synchronous fs / crypto in request path
grep -rnE "(readFileSync|writeFileSync|execSync|pbkdf2Sync)" src/ | head
# Each occurrence blocks the event loop — measure cost in microbench
```

Severity: **Critical** for any sync call inside a controller / service handler.

## NS-P10: JSON parsing of huge bodies

```bash
# Check global body-parser limit
grep -nE "bodyParser|json\(\{" src/main.ts src/app.module.ts 2>/dev/null
```

Default Express `express.json()` is 100 KB. If endpoints accept larger payloads, the limit must be raised explicitly.

Severity: **Minor** if not handled but no large-body endpoint exists.

## Manual audit (cannot automate)
- [ ] Capture `EXPLAIN ANALYZE` query plans for every Critical query finding
- [ ] For each N+1 fix, add the query-count assertion to the test so it can't regress
- [ ] Run against a production-like env, after warmup (first 5 s of load are misleading)
- [ ] Re-measure after fixing the top 3 — don't optimise without measurement

## Anti-patterns
- **`relations: ['everything']`** on every find — joins exploding into Cartesian products
- **No pagination on list endpoints** — list returns 50k rows when 25 was needed
- **`@Cron` jobs running heavy queries during business hours** — schedule for low-traffic window
- **Single connection for migrations + app traffic** — migration locks block all reads
- **`await Promise.all([100 things])` against the DB** — exhausts connection pool; batch instead
- **Synchronous `JSON.stringify` on huge objects** — blocks event loop; stream instead
- **Trusting dev mode** — TypeORM logs everything, NestJS dev middleware adds overhead; audit memory in dev = HMR stale closures

## Cross-references
- Budget thresholds: `_refs/shared/review-performance.md`
- Code review (correctness): `sdcorejs-review-code` · Architecture (structural perf): `sdcorejs-review-architecture`
- Repair loop: `orchestration/repair-loop` · Verification: `orchestration/verify-before-done`
