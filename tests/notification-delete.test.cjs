const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(forbidden = false, exists = true) {
  const calls = [];
  const builder = {
    delete() { calls.push('delete'); return this; },
    eq(column, id) { calls.push([column, id]); return this; },
    select() { return this; },
    async maybeSingle() { return { data: exists ? { id: 'deleted' } : null, error: null }; },
  };
  const context = { exports: {}, require(name) {
    if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } };
    if (name === '@/lib/auth/roles') return { UserRole: { TEACHER: 'TEACHER' } };
    if (name === '@/lib/auth/require-role') return { requireRole: async (roles) => {
      assert.deepEqual(Array.from(roles), ['TEACHER']);
      if (forbidden) throw Object.assign(new Error('Forbidden'), { status: 403 });
    } };
    if (name === '@/lib/supabase/admin') return { adminClient: { from(table) { assert.equal(table, 'notifications'); return builder; } } };
    if (name === '@/lib/api/handle-error') return { handleError: () => ({ status: 500 }) };
    throw new Error(name);
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/notifications/[id]/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context);
  return { calls, run: (id = '12345678-1234-1234-1234-123456789012') => context.exports.DELETE({}, { params: Promise.resolve({ id }) }) };
}

test('non-teacher cannot delete notifications', async () => {
  const s = setup(true);
  assert.equal((await s.run()).status, 403);
  assert.equal(s.calls.length, 0);
});
test('teacher deletes only the selected notification', async () => {
  const s = setup();
  assert.equal((await s.run()).status, 200);
  assert.equal(s.calls[1][0], 'id');
  assert.equal(s.calls[1][1], '12345678-1234-1234-1234-123456789012');
});
test('invalid ids are rejected before touching data', async () => {
  const s = setup();
  assert.equal((await s.run('invalid')).status, 400);
  assert.equal(s.calls.length, 0);
});
test('missing notification returns 404', async () => {
  assert.equal((await setup(false, false).run()).status, 404);
});
