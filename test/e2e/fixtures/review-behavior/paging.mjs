// Synthetic data source. Continuation is authoritative; totals can be stale.
export function createPageSource(count, options = {}) {
  const { clamp = Infinity, failPage, cursor = false } = options;
  const total = Object.hasOwn(options, 'total') ? options.total : count;
  const rows = Array.from({ length: count }, (_, id) => ({ id }));
  return async ({ page = 1, pageSize, after, signal }) => {
    signal?.throwIfAborted();
    if (page === failPage) throw new Error('later page failed');
    const size = Math.min(pageSize, clamp);
    const start = cursor ? Number(after ?? 0) : (page - 1) * size;
    const items = rows.slice(start, start + size);
    const next = start + items.length;
    return { items, total, hasMore: next < count, nextCursor: next < count ? String(next) : null };
  };
}

export async function loadCustomers(source) {
  return (await source({ page: 1, pageSize: 1000 })).items;
}

const CUSTOMER_LIMIT = 1000;
export async function loadConfiguredCustomers(source, config = { pageSize: CUSTOMER_LIMIT }) {
  return (await source({ page: 1, pageSize: config.pageSize })).items;
}
export function createBoundedDomainSource(count) {
  if (count > 1000) throw new RangeError('domain cardinality exceeded');
  return createPageSource(count);
}
export async function visibleCustomerPage(source, page) {
  const result = await source({ page, pageSize: 20 });
  return { items: result.items, nextPage: result.hasMore ? page + 1 : null };
}
export async function customerCount(aggregateEndpoint) { return (await aggregateEndpoint()).count; }

export async function collectCustomers(source, { signal, cursor = false, maxPages = 10000 } = {}) {
  const items = [], seen = new Set(), cursors = new Set();
  // This synthetic API contract returns a snapshot in ascending numeric ID order.
  let after, previousId = -Infinity;
  for (let page = 1; page <= maxPages; page++) {
    signal?.throwIfAborted();
    const result = await source({ page, pageSize: 1000, after, signal });
    signal?.throwIfAborted();
    if (!Array.isArray(result.items) || typeof result.hasMore !== 'boolean') throw new Error('completion evidence missing');
    for (const item of result.items) {
      if (seen.has(item.id)) throw new Error('unstable ordering or duplicate record');
      if (item.id <= previousId) throw new Error('unstable ordering');
      previousId = item.id;
      seen.add(item.id); items.push(item);
    }
    if (!result.hasMore) return items;
    if (result.items.length === 0) throw new Error('continuation without progress');
    if (cursor) {
      if (!result.nextCursor || cursors.has(result.nextCursor)) throw new Error('invalid cursor progress');
      after = result.nextCursor; cursors.add(after);
    }
  }
  throw new Error('completion budget exceeded');
}

export async function customerPreview(source) {
  return { items: (await source({ page: 1, pageSize: 20 })).items, truncated: true };
}
