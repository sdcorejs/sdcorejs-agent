import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { SummaryCache } from '../../src/storage/summary-cache';
import { MemoryStorageArea } from '../helpers/memory-storage-area';

describe('public cache presence contract', () => {
  it('observes expiry at the exact boundary and preserves a different URL', async () => {
    const storage = new MemoryStorageArea();
    let now = 100;
    const cache = new SummaryCache(storage, {now:() => now, ttlMs:10});
    expectTypeOf(cache.has).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(cache.has).returns.toEqualTypeOf<Promise<boolean>>();
    const summary = {bullets:['One','Two','Three']} as const;
    expect(await cache.has('a')).toBe(false);
    await cache.set('a', summary);
    now = 105;
    await cache.set('b', summary);
    expect(await cache.has('a')).toBe(true);
    now = 110;
    expect(await cache.has('a')).toBe(false);
    expect(storage.values.size).toBe(1);
    expect(await cache.has('b')).toBe(true);
  });
  it('evicts invalid stored data and propagates storage errors', async () => {
    const storage = new MemoryStorageArea();
    const cache = new SummaryCache(storage);
    await cache.set('a', {bullets:['One','Two','Three']});
    const key = [...storage.values.keys()][0]!;
    storage.values.set(key, {summary:{bullets:[]}, expiresAt:Date.now()+60_000});
    expect(await cache.has('a')).toBe(false);
    expect(storage.values.has(key)).toBe(false);
    vi.spyOn(storage, 'get').mockRejectedValueOnce(new Error('storage unavailable'));
    await expect(cache.has('a')).rejects.toThrow('storage unavailable');
  });
});
