import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/tutoring/cache.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, { exports });
const { tutoringCache } = exports;

test('fresh bookings reuse cache; users and months stay isolated; invalidation fetches new data', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let calls = 0;
  const options = (user, month) => ({
    queryKey: tutoringCache.key(user, month),
    staleTime: tutoringCache.staleTime,
    queryFn: async () => [{ revision: ++calls }],
  });
  try {
    const first = await client.fetchQuery(options('alice', '2026-10'));
    assert.deepEqual(await client.fetchQuery(options('alice', '2026-10')), first);
    assert.equal(calls, 1);
    await client.fetchQuery(options('bob', '2026-10'));
    await client.fetchQuery(options('alice', '2026-11'));
    assert.equal(calls, 3);
    await client.invalidateQueries({ queryKey: ['tutoring-slots', 'alice'] });
    const updated = await client.fetchQuery(options('alice', '2026-10'));
    assert.equal(updated[0].revision, 4);
    await client.fetchQuery(options('bob', '2026-10'));
    assert.equal(calls, 4);
  } finally { client.clear(); }
});
