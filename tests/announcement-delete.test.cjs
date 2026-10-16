const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(forbidden = false) {
  let cleared;
  const builder = {
    update(values) { cleared = values; return this; },
    eq(column, id) { assert.equal(column, 'id'); assert.equal(id, 'announcement-id'); return this; },
    select() { return this; },
    async maybeSingle() { return { data: { id: 'announcement-id' }, error: null }; },
  };
  const context = { exports: {}, Date, require(name) {
    if (name === 'next/server') return { NextResponse: { json: (body, opts) => ({ body, status: opts.status }) } };
    if (name === 'zod') return { z: { string: () => ({ uuid() { return this; } }), object: () => ({ parse: (v) => v }) } };
    if (name === '@/lib/auth/teacher') return { requireTeacher: async () => { if (forbidden) throw Object.assign(new Error('Forbidden'), { status: 403 }); } };
    if (name === '@/lib/supabase/admin') return { adminClient: { from(table) { assert.equal(table, 'announcements'); return builder; }, rpc() { throw new Error('Delete must not publish'); } } };
    if (name === '@/lib/api/api-response') return { success: (body) => ({ status: 200, body }) };
    if (name === '@/lib/api/handle-error') return { handleError: () => ({ status: 500 }) };
    if (name === '@/services/announcement.service') return {};
    throw new Error(name);
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/announcement/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { run: () => context.exports.DELETE({ json: async () => ({ id: 'announcement-id' }) }), get cleared() { return cleared; } };
}

test('delete clears announcement without publishing a navigation notification', async () => {
  const s = setup();
  assert.equal((await s.run()).status, 200);
  assert.equal(s.cleared.title, '');
  assert.equal(s.cleared.content, '');
  assert.equal(s.cleared.is_active, undefined);
});
test('unauthorized users cannot clear announcement', async () => {
  const s = setup(true);
  assert.equal((await s.run()).status, 403);
  assert.equal(s.cleared, undefined);
});
