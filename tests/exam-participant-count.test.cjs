const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function repository(exams, attempts, failure) {
  const client = { from(table) {
    let from = 0, to = Infinity;
    let submittedOnly = false;
    const query = {
      select() { return this; }, is() { return this; },
      in(_field, ids) { assert.deepEqual([...ids], exams.map(e => e.id)); return this; },
      not(field, op, value) {
        assert.equal(field, 'submitted_at');
        assert.equal(op, 'is'); assert.equal(value, null);
        submittedOnly = true; return this;
      },
      order() { return this; },
      range(start, end) { from = start; to = end; return this; },
      then(resolve, reject) {
        const rows = table === 'exams' ? exams : attempts.filter(a => !submittedOnly || a.submitted_at != null).slice(from, to + 1);
        return Promise.resolve({ data: rows, error: table === 'exam_attempts' ? failure : null }).then(resolve, reject);
      },
    };
    return query;
  } };
  const scope = { exports: {}, require(name) {
    if (name === '@/lib/supabase/server') return { createClient: async () => client };
    if (name === '@/lib/supabase/admin') return { adminClient: {} };
    throw new Error(name);
  } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('repositories/exam.repository.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return scope.exports.examRepository;
}

test('counts distinct submitted students per exam across pages', async () => {
  const attempts = Array.from({ length: 1001 }, () => ({ exam_id: 'a', student_id: 'one', submitted_at: '2026-11-02' }));
  attempts.push(
    { exam_id: 'a', student_id: 'two', submitted_at: '2026-11-02' },
    { exam_id: 'b', student_id: 'one', submitted_at: '2026-11-02' },
    { exam_id: 'b', student_id: 'draft', submitted_at: null },
  );
  const result = await repository([{ id: 'a' }, { id: 'b' }, { id: 'c' }], attempts).getAll();
  assert.deepEqual(Array.from(result, e => e.submitted_count), [2, 1, 0]);
});

test('propagates counting errors instead of displaying incorrect zero totals', async () => {
  const error = new Error('Read failed');
  await assert.rejects(repository([{ id: 'a' }], [], error).getAll(), /Read failed/);
});

test('handles an empty exam list', async () => {
  assert.equal((await repository([], []).getAll()).length, 0);
});
