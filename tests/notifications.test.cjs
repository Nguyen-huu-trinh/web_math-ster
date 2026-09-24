const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function setup(userId = 'student-a', writeError = null) {
  let cache = { items: [{ id: 'one', is_read: false }, { id: 'two', is_read: true }, { id: 'three', is_read: false }], unreadCount: 8 };
  let options, mutation, written, invalidated;
  const context = { exports: {}, require: (name) => {
    if (name === '@/providers/auth-provider') return { useAuth: () => ({ user: userId ? { id: userId } : null }) };
    if (name === '@/lib/supabase/client') return { createClient: () => ({ rpc: async () => ({ data: cache, error: null }), from: (table) => { assert.equal(table, 'notification_reads'); return { upsert: async (rows, config) => { written = { rows, config }; return { error: writeError }; } }; } }) };
    if (name === '@tanstack/react-query') return {
      useQuery: (opts) => { options = opts; return { data: cache }; },
      useQueryClient: () => ({ setQueryData: (key, updater) => { assert.equal(key[1], userId ?? undefined); cache = updater(cache); }, invalidateQueries: (opts) => { invalidated = opts; } }),
      useMutation: (opts) => { mutation = opts; return { isPending: false, mutateAsync: async (ids) => { await opts.mutationFn(ids); opts.onSuccess(undefined, ids); } }; },
    };
    throw new Error(name);
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('hooks/use-notifications.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
  const hook = context.exports.useNotifications();
  return { hook, get cache() { return cache; }, get written() { return written; }, get options() { return options; }, get invalidated() { return invalidated; } };
}
test('feed is bounded server RPC and cache is keyed by auth user', async () => {
 const s = setup(); assert.equal(s.options.queryKey[1], 'student-a'); assert.equal(s.options.staleTime, 60000); assert.equal((await s.options.queryFn()).unreadCount, 8);
 assert.equal(setup(null).options.enabled, false);
});
test('read persists own user id and repeated read does not decrement twice', async () => {
 const s = setup(); await s.hook.markAsRead('one'); assert.equal(s.written.rows[0].user_id,'student-a'); assert.equal(s.written.config.ignoreDuplicates,true); assert.equal(s.cache.unreadCount,7);
 await s.hook.markAsRead('one'); assert.equal(s.cache.unreadCount,7); assert.equal(s.invalidated.refetchType,'none');
});
test('read all only marks currently displayed unread entries', async () => {
 const s = setup(); await s.hook.markAllAsRead(); assert.equal(s.written.rows.length,2); assert(s.cache.items.every(x=>x.is_read)); assert.equal(s.cache.unreadCount,6);
});
test('failed persistence leaves unread cache unchanged', async () => {
 const s = setup('student-a',new Error('offline')); await assert.rejects(s.hook.markAsRead('one'),/offline/); assert.equal(s.cache.unreadCount,8); assert.equal(s.cache.items[0].is_read,false);
});
