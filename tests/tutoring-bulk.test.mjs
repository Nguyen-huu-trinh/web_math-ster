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
  for (const name of ['delete','update','in','is','or']) query[name] = (...args) => { calls.push([name, ...args]); return query; };
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
  return { calls, run: async (action, entries = [{ id, student_id: student }]) => {
    const form = new FormData();
    form.set('operation','bulk'); form.set('bulk_action',action); form.set('selection',JSON.stringify(entries));
    return exports.mutateTutoringSlot(form);
  } };
}
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
