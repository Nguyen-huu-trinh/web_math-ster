const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX }
  }).outputText, { exports, console, ...mocks.__globals, require: name => mocks[name] ?? require(name) });
  return exports;
}
test('concurrent user checks share a request without caching a completed identity', async () => {
  let resolve, calls = 0;
  const { authService } = load('services/auth.service.ts', {
    '@/lib/supabase/client': { createClient: () => ({ auth: { getUser: () => {
      calls++; return new Promise(done => { resolve = done; });
    } } }) },
  });
  const first = authService.getUser();
  const second = authService.getUser();
  assert.equal(calls, 1);
  resolve({ data: { user: { id: 'alice' } } });
  assert.equal((await first).id, 'alice');
  assert.equal((await second).id, 'alice');
  const third = authService.getUser();
  assert.equal(calls, 2);
  resolve({ data: { user: null } });
  assert.equal(await third, null);
});
test('grading batches result_details once and keeps score calculation', async () => {
  const calls = [];
  const db = { from(table) {
    const query = {
      select: () => query,
      eq: async () => table === 'student_answers' ? { data: Array.from({ length: 30 }, (_, i) => ({
        question_id: `q${i}`, questions: { question_type: 'MULTIPLE_CHOICE', score: 1 }, answers: { is_correct: true },
      })) } : { error: null },
      insert: async rows => { calls.push(['insert', table, rows]); return { error: null }; },
      update: values => { calls.push(['update', table, values]); return query; },
    };
    return query;
  } };
  const { gradingService } = load('services/grading.service.ts', { '@/lib/supabase/server': { createClient: async () => db } });
  assert.equal((await gradingService.gradeAttempt('attempt')).score, 30);
  assert.equal(calls.filter(call => call[0] === 'insert').length, 1);
  assert.equal(calls[0][2].length, 30);
  assert.equal(calls[1][2].score, 30);
});
test('Presence only connects for a signed-in user and removes its channel once', () => {
  for (const user of [null, { id: 'alice' }]) {
    let effect, channels = 0, removed = 0;
    const channel = { on: () => channel, subscribe: () => channel };
    const { PresenceProvider } = load('providers/presence-provider.tsx', {
      react: { createContext: () => ({ Provider: () => null }), useContext() {}, useState: () => [1, () => {}], useEffect: fn => { effect = fn; } },
      '@/providers/auth-provider': { useAuth: () => ({ user }) },
      '@/lib/supabase/client': { createClient: () => ({ channel: () => { channels++; return channel; }, removeChannel: () => { removed++; } }) },
    });
    PresenceProvider({ children: null });
    const cleanup = effect();
    assert.equal(channels, user ? 1 : 0);
    cleanup?.();
    assert.equal(removed, user ? 1 : 0);
  }
  assert.equal(fs.readFileSync('providers/auth-provider.tsx','utf8').includes('mathster-online-users'), false);
});
test('error summaries retain essentials without serializing payloads or stack traces', () => {
  const { summarizeLogError } = load('lib/logging.ts');
  const result = JSON.parse(JSON.stringify(summarizeLogError('request failed', {
    message: 'x'.repeat(1000), code: '42501', status: 403,
    payload: { token: 'secret', rows: Array(1000).fill('data') }, stack: 'private',
  })));
  assert.deepEqual(Object.keys(result[1]).sort(), ['code','message','status']);
  assert.equal(result[1].message.length, 300);
  assert.equal(JSON.stringify(result).includes('secret'), false);
});
test('regrade service sends bounded batches instead of requests per attempt', async () => {
  const batches = [];
  const exam = { id: 'exam', question_config: {}, exam_type: 'CUSTOM', category: 'PERIODIC' };
  const { examService } = load('services/exam.service.ts', {
    '@/repositories/exam.repository': { examRepository: { updateAnswerKey: async () => exam } },
    '@/repositories/student-exam.repository': { studentExamRepository: { getSubmittedAttemptsForRegrade: async () => Array.from({ length: 1001 }, (_, i) => ({ id: `attempt-${i}`, student_id: 'student', score: 4, is_passed: false, answers: {} })) } },
    '@/lib/exam/regrade': { regradeAttempt: input => ({ attemptId: input.attemptId, studentId: input.studentId, oldScore: 4, newScore: 8, oldPassed: false, newPassed: true, pointCorrection: 100 }) },
    '@/lib/supabase/admin': { adminClient: { rpc: async (name, args) => { assert.equal(name, 'apply_exam_regrades'); batches.push(args); return { error: null }; } } },
  });
  assert.equal(await examService.updateAnswerKey('exam', {}), exam);
  assert.deepEqual(batches.map(batch => batch.p_rows.length), [500, 500, 1]);
  assert.equal(batches[0].p_rows[0].point_correction, 100);
});
test('dirty star sync backs off failed automatic retries and stops offline requests', async () => {
  let now = 1000, online = true, calls = 0, interval, effect;
  const { useStarSync } = load('lib/flashcards/use-star-sync.ts', {
    react: { useRef: value => ({ current: value }), useState: () => ['saved', () => {}], useCallback: fn => fn, useEffect: fn => { effect = fn; } },
    '@/app/actions/flashcards': { updateCardStars: async () => { calls++; return { ok: false }; } },
    __globals: {
      navigator: { get onLine() { return online; } }, Date: { now: () => now },
      setTimeout: () => 1, clearTimeout() {}, setInterval: fn => { interval = fn; return 1; }, clearInterval() {},
      document: { addEventListener() {}, removeEventListener() {} }, window: { addEventListener() {}, removeEventListener() {} },
    },
  });
  const sync = useStarSync('deck'); effect();
  interval(); assert.equal(calls, 0);
  sync.enqueue('card', true); await sync.flush(); assert.equal(calls, 1);
  now += 9000; interval(); assert.equal(calls, 1);
  now += 1000; interval(); await new Promise(setImmediate); assert.equal(calls, 2);
  now += 10000; interval(); assert.equal(calls, 2);
  online = false; now += 20000; interval(); await new Promise(setImmediate); assert.equal(calls, 2);
});
test('batch regrade commits score and HP together; stale retries roll back', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const db = new PGlite();
  const exam = '11111111-1111-4111-8111-111111111111';
  const student = '22222222-2222-4222-8222-222222222222';
  const attempt = '33333333-3333-4333-8333-333333333333';
  try {
    await db.exec(`create role authenticated; create role service_role; create role anon;
      create schema auth; create function auth.role() returns text language sql as
      $$ select current_setting('request.jwt.claim.role',true) $$;
      grant usage on schema auth to authenticated,service_role;
      create table profiles(id uuid primary key,points integer);
      create table exam_attempts(id uuid primary key,exam_id uuid,student_id uuid,score numeric,is_passed boolean,updated_at timestamptz);
      create function adjust_student_points(p_student_id uuid,p_delta integer) returns void language sql as
      $$ update profiles set points = points + p_delta where id = p_student_id $$;
      grant all on profiles,exam_attempts to service_role;
      insert into profiles values ('${student}',10);
      insert into exam_attempts values ('${attempt}','${exam}','${student}',4,false,now());`);
    await db.exec(fs.readFileSync('supabase/migrations/202610220005_batch_exam_regrades.sql','utf8'));
    const rows = JSON.stringify([{ attempt_id: attempt, student_id: student, old_score: 4, new_score: 8, old_passed: false, new_passed: true, point_correction: 100 }]);
    await db.exec("select set_config('request.jwt.claim.role','authenticated',false); set role authenticated");
    await assert.rejects(db.query('select apply_exam_regrades($1,$2::jsonb)', [exam, rows]), /Service role required/);
    await db.exec("reset role; select set_config('request.jwt.claim.role','service_role',false); set role service_role");
    assert.equal((await db.query('select apply_exam_regrades($1,$2::jsonb) as count', [exam, rows])).rows[0].count, 1);
    assert.equal((await db.query('select points from profiles')).rows[0].points, 110);
    await assert.rejects(db.query('select apply_exam_regrades($1,$2::jsonb)', [exam, rows]), /Attempt changed/);
    assert.equal((await db.query('select points from profiles')).rows[0].points, 110);
    const duplicate = JSON.stringify(Array(2).fill({ attempt_id: attempt, student_id: student, old_score: 8, new_score: 9, old_passed: true, new_passed: true, point_correction: 5 }));
    await assert.rejects(db.query('select apply_exam_regrades($1,$2::jsonb)', [exam, duplicate]), /Attempt changed/);
    assert.equal(Number((await db.query('select score from exam_attempts')).rows[0].score), 8);
    assert.equal((await db.query('select points from profiles')).rows[0].points, 110);
  } finally { await db.close(); }
});
