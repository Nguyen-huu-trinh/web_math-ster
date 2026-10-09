import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  vm.runInNewContext(code, { exports, require: (id) => mocks[id] ?? require(id), console });
  return exports;
}
const schemas = load('../validators/course.schema.ts');
const id = '11111111-1111-4111-8111-111111111111';
function route(role = 'TEACHER', result = { id }) {
  const calls = [];
  const service = Object.fromEntries(['getAll','getById','update','delete'].map(name => [name, async (...args) => {
    calls.push([name,...args]); return result;
  }]));
  const handlers = load('../app/api/courses/[id]/route.ts', {
    '@/validators/course.schema': schemas,
    '@/services/course.service': { courseService: service },
    '@/lib/auth/roles': { UserRole: { TEACHER: 'TEACHER', STUDENT: 'STUDENT' } },
    '@/lib/auth/require-role': { requireRole: async (allowed) => {
      if (!allowed.includes(role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
      return { role, id };
    } },
    'next/server': { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) } }
  });
  return { ...handlers, calls };
}
const context = { params: Promise.resolve({ id }) };
const request = body => ({ json: async () => body });
test('course validation allows empty thumbnail, validates order, strips unsafe fields', () => {
  assert.equal(schemas.CreateCourseSchema.parse({ name: 'Math', thumbnail_url: '' }).course_order, 0);
  for (const course_order of [-1, 1.2, 2147483648, '2', null]) {
    assert.equal(schemas.CreateCourseSchema.safeParse({ name: 'Math', course_order }).success, false);
  }
  assert.equal(schemas.UpdateCourseSchema.parse({ name: 'Math' }).course_order, undefined);
  assert.equal(schemas.UpdateCourseSchema.parse({ course_order: 3, deleted_at: 'x' }).deleted_at, undefined);
});
test('teacher PUT updates target course and order; DELETE returns JSON success', async () => {
  const r = route();
  assert.equal((await r.PUT(request({ name: 'Math', course_order: 2 }), context)).status, 200);
  assert.equal(r.calls[0][1], id);
  assert.equal(r.calls[0][2].course_order, 2);
  assert.equal((await r.DELETE({}, context)).body.success, true);
  assert.equal(r.calls[1][0], 'delete');
});
test('student mutations are forbidden before touching data', async () => {
  const r = route('STUDENT');
  assert.equal((await r.PUT(request({ name: 'Math' }), context)).status, 403);
  assert.equal((await r.DELETE({}, context)).status, 403);
  assert.equal(r.calls.length, 0);
});
test('invalid updates and IDs return 400; missing courses return 404', async () => {
  const r = route();
  for (const body of [{ course_order: -1 }, {}, { deleted_at: 'x' }]) {
    assert.equal((await r.PUT(request(body), context)).status, 400);
  }
  assert.equal((await r.DELETE({}, { params: Promise.resolve({ id: 'bad' }) })).status, 400);
  assert.equal(r.calls.length, 0);
  const missing = route('TEACHER', null);
  assert.equal((await missing.PUT(request({ name: 'Math' }), context)).status, 404);
  assert.equal((await missing.DELETE({}, context)).status, 404);
});
test('migration preserves existing courses, sorts positions and enforces teacher writes', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('app.user_id', true), '')::uuid $$;
      create table profiles(id uuid primary key, role text);
      insert into profiles values ('${id}', 'TEACHER'), ('22222222-2222-4222-8222-222222222222', 'STUDENT');
      create table courses(id integer primary key, name text, created_at timestamptz default now(), deleted_at timestamptz);
      insert into courses(id,name) values (1,'First'), (2,'Second');
      alter table courses enable row level security;
      create policy courses_select on courses for select to authenticated using(true);
      grant usage on schema public,auth to authenticated;
      grant select on profiles to authenticated;
      grant select,insert,update on courses to authenticated;
    `);
    await db.exec(readFileSync(new URL('../supabase/migrations/202610100001_course_order_and_teacher_write.sql', import.meta.url), 'utf8'));
    assert.deepEqual((await db.query('select course_order from courses order by id')).rows.map(x => x.course_order), [0,0]);
    await db.exec(`set role authenticated; set app.user_id = '${id}'; update courses set course_order=2 where id=1; insert into courses(id,name,course_order) values(3,'Third',1);`);
    assert.deepEqual((await db.query('select id from courses order by course_order,created_at,id')).rows.map(x => x.id), [2,3,1]);
    await assert.rejects(db.exec('update courses set course_order=-1 where id=1'));
    await db.exec(`update courses set deleted_at=now() where id=1; set app.user_id='22222222-2222-4222-8222-222222222222';`);
    assert.equal((await db.query('update courses set course_order=9 where id=2 returning id')).rows.length, 0);
    await assert.rejects(db.exec("insert into courses(id,name) values(4,'Blocked')"));
    assert.deepEqual((await db.query('select id from courses where deleted_at is null order by course_order,created_at,id')).rows.map(x => x.id), [2,3]);
  } finally { await db.close(); }
});
