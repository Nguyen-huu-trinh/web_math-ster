import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const id = '11111111-1111-4111-8111-111111111111';
const student = '22222222-2222-4222-8222-222222222222';
function setup(role = 'TEACHER') {
  const calls = [];
  const query = {};
  for (const name of ['delete','update','in','is','or','eq']) query[name] = (...args) => { calls.push([name, ...args]); return query; };
  query.select = async () => ({ data: [{ id }], error: null });
  const db = {
    auth: { getUser: async () => ({ data: { user: { id } } }) },
    rpc: async (name, args) => {
      if (name === 'bulk_tutoring_slots') { calls.push(['rpc', args]); return { data: 1 }; }
      return { data: role };
    },
    from: name => { calls.push(['from', name]); return query; },
  };
  const exports = {};
  const mocks = {
    '@/lib/supabase/server': { createClient: async () => db },
    '@/lib/tutoring/import': {},
    'next/cache': { revalidatePath: () => {} },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../app/actions/tutoring.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText, { exports, require: name => mocks[name] ?? require(name) });
  return { calls, lockMonth: async month => {
    const form = new FormData();
    form.set('operation', 'lock_month'); form.set('month', month);
    return exports.mutateTutoringSlot(form);
  }, run: async (action, entries = [{ id, student_id: student }]) => {
    const form = new FormData();
    form.set('operation','bulk'); form.set('bulk_action',action); form.set('selection',JSON.stringify(entries));
    return exports.mutateTutoringSlot(form);
  } };
}
test('lock month updates all matching slots, preserves bookings and rejects students or invalid months', async () => {
  const teacher = setup();
  assert.equal((await teacher.lockMonth('2026-10')).ok, true);
  const update = teacher.calls.find(call => call[0] === 'update')[1];
  assert.equal(update.is_active, false);
  assert.deepEqual(Object.keys(update), ['is_active']);
  assert.deepEqual(teacher.calls.find(call => call[0] === 'eq'), ['eq', 'month_key', '2026-10']);
  assert.equal(teacher.calls.some(call => call[0] === 'in'), false);
  for (const [role, month] of [['STUDENT','2026-10'], ['TEACHER','2026-13'], ['TEACHER','invalid']]) {
    const subject = setup(role);
    assert.equal((await subject.lockMonth(month)).ok, false);
    assert.equal(subject.calls.length, 0);
  }
});
test('bulk delete and lock send one validated batch RPC', async () => {
  const deletion = setup();
  assert.equal((await deletion.run('delete')).ok, true);
  assert.equal(deletion.calls.length, 1);
  assert.equal(deletion.calls[0][1].p_action, 'delete');
  const lock = setup();
  assert.equal((await lock.run('lock')).ok, true);
  assert.equal(lock.calls[0][1].p_action, 'lock');
});
test('bulk release matches student snapshot; students and invalid batches cannot mutate', async () => {
  const release = setup();
  assert.equal((await release.run('release')).ok, true);
  assert.equal(release.calls[0][1].p_selection[0].student_id, student);
  for (const role of ['STUDENT', null]) {
    const denied = setup(role);
    assert.equal((await denied.run('lock')).ok, false);
    assert.equal(denied.calls.length, 0);
  }
  for (const entries of [[], [{ id: 'invalid', student_id: null }], Array(501).fill({ id, student_id: null })]) {
    const invalid = setup();
    assert.equal((await invalid.run('delete', entries)).ok, false);
    assert.equal(invalid.calls.length, 0);
  }
});
