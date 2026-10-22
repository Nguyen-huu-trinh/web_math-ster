const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText, { exports, Error, console: { error() {} }, require: key => mocks[key] ?? require(key) });
  return exports;
}
const id = '11111111-1111-4111-8111-111111111111';
const { HttpError } = load('lib/api/http-error.ts');
function setup({ role = 'STUDENT', missing = false, lookupError = null, authError = null, denied = false } = {}) {
  const calls = [];
  const query = {
    select: () => query,
    eq: (key, value) => { calls.push(['eq', key, value]); return query; },
    maybeSingle: async () => ({ data: missing ? null : { id, role }, error: lookupError }),
  };
  const admin = {
    from: table => { calls.push(['from', table]); return query; },
    auth: { admin: { deleteUser: async (...args) => { calls.push(['deleteUser', ...args]); return { error: authError }; } } },
  };
  const helper = load('services/delete-student-account.ts', {
    '@/lib/supabase/admin': { adminClient: admin },
    '@/lib/auth/require-role': { requireRole: async () => { if (denied) throw new HttpError(403, 'Forbidden'); } },
    '@/lib/auth/roles': { UserRole: { TEACHER: 'TEACHER' } },
    '@/lib/api/http-error': { HttpError },
  });
  return { calls, run: helper.deleteStudentAccount };
}
test('hard delete uses Auth Admin and never deletes profile first', async () => {
  const subject = setup();
  await subject.run(id);
  assert.deepEqual(subject.calls, [['from', 'profiles'], ['eq', 'id', id], ['deleteUser', id, false]]);
});
test('teacher repository delete delegates to account deletion instead of deleting profiles', async () => {
  let target;
  const { teacherStudentRepository } = load('repositories/teacher-student.repository.ts', {
    '@/lib/supabase/server': { createClient: async () => { throw new Error('Profile deletion must not run'); } },
    '@/services/delete-student-account': { deleteStudentAccount: async studentId => { target = studentId; } },
  });
  await teacherStudentRepository.delete(id);
  assert.equal(target, id);
});
test('nonteachers, invalid IDs, missing profiles, teachers and admins cannot be deleted', async () => {
  for (const [options, target, status] of [
    [{ denied: true }, id, 403], [{}, 'invalid', 400], [{ missing: true }, id, 404],
    [{ role: 'TEACHER' }, id, 403], [{ role: 'ADMIN' }, id, 403],
  ]) {
    const subject = setup(options);
    await assert.rejects(subject.run(target), error => error.status === status);
    assert.equal(subject.calls.some(call => call[0] === 'deleteUser'), false);
  }
});
test('lookup and Auth failures report failure without a separate profile deletion', async () => {
  const lookup = setup({ lookupError: { message: 'db failed' } });
  await assert.rejects(lookup.run(id), error => error.status === 500);
  assert.equal(lookup.calls.some(call => call[0] === 'deleteUser'), false);
  const auth = setup({ authError: { code: 'unexpected_failure', status: 500 } });
  await assert.rejects(auth.run(id), /Hồ sơ chưa bị xóa/);
  assert.equal(auth.calls.filter(call => call[0] === 'deleteUser').length, 1);
});
test('DELETE returns correct error statuses and rejects nonteachers before service call', async () => {
  for (const status of [403, 404, 500]) {
    let called = false;
    const { DELETE } = load('app/api/teachers/students/[studentId]/route.ts', {
      '@/lib/auth/roles': { UserRole: { TEACHER: 'TEACHER' } },
      '@/lib/auth/require-role': { requireRole: async () => { if (status === 403) throw new HttpError(403, 'Forbidden'); } },
      '@/validators/teacher-student.schema': {},
      '@/services/teacher-student.service': { teacherStudentService: { delete: async () => { called = true; throw new HttpError(status, 'Failure'); } } },
      'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    });
    const response = await DELETE({}, { params: Promise.resolve({ studentId: id }) });
    assert.equal(response.status, status);
    assert.equal(called, status !== 403);
  }
});
test('existing profile FK cascades from auth.users and rolls back blocked deletions', async () => {
  const { PGlite } = require('@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec("create schema auth; create table auth.users(id uuid primary key); create type public.user_role as enum ('ADMIN','TEACHER','STUDENT');");
    const sql = fs.readFileSync('supabase/migrations/202607190001_initial_schema.sql','utf8');
    await db.exec(sql.match(/create table if not exists public\.profiles\s*\([\s\S]*?\);/i)[0]);
    await db.exec(`insert into auth.users values ('${id}'); insert into profiles(id,student_code,full_name,email) values ('${id}','MS1','An','an@example.com');`);
    await db.exec('create table protected_records(student_id uuid references profiles(id))');
    await db.query('insert into protected_records values ($1)', [id]);
    await assert.rejects(db.query('delete from auth.users where id = $1', [id]), /foreign key/);
    assert.equal((await db.query('select id from profiles where id = $1', [id])).rows.length, 1);
    assert.equal((await db.query('select id from auth.users where id = $1', [id])).rows.length, 1);
    await db.exec('delete from protected_records');
    await db.query('delete from auth.users where id = $1', [id]);
    assert.equal((await db.query('select id from profiles where id = $1', [id])).rows.length, 0);
  } finally { await db.close(); }
});
