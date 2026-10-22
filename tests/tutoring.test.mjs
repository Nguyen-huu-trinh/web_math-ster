import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const teacher = '11111111-1111-4111-8111-111111111111';
const alice = '22222222-2222-4222-8222-222222222222';
const bob = '33333333-3333-4333-8333-333333333333';
const migration = readFileSync(new URL('../supabase/migrations/202610220001_tutoring_slots.sql', import.meta.url), 'utf8');

test('tutoring migration: grants, RLS, privacy, monthly limits and booking lifecycle', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth to authenticated, service_role;
      grant execute on function auth.uid() to authenticated, service_role;
      create table public.profiles (id uuid primary key, role text, full_name text, student_code text,
        is_active boolean default true, deleted_at timestamptz);
      insert into profiles(id, role, full_name) values
        ('${teacher}', 'TEACHER', 'Teacher'), ('${alice}', 'STUDENT', 'Alice'), ('${bob}', 'STUDENT', 'Bob');
    `);
    await db.exec(migration);
    await db.exec(readFileSync(new URL('../supabase/migrations/202610220002_tutoring_teacher_list.sql', import.meta.url), 'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202610220003_tutoring_bulk.sql', import.meta.url), 'utf8'));
    const permissions = (await db.query(`select
      has_table_privilege('authenticated','public.tutoring_slots','SELECT,INSERT,UPDATE,DELETE') as table_access,
      has_function_privilege('service_role','public.book_tutoring_slot(uuid)','EXECUTE') as rpc_access`)).rows[0];
    assert.equal(permissions.table_access, true);
    assert.equal(permissions.rpc_access, true);
    const actor = async id => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
      await db.exec('set role authenticated');
    };
    await actor(teacher);
    const { rows: slots } = await db.query(`insert into tutoring_slots(slot_date,start_time)
      values ('2099-06-01','10:00'),('2099-06-02','10:00'),('2099-07-01','10:00') returning id, month_key`);
    assert.equal(slots[0].month_key, '2099-06');
    await assert.rejects(db.exec("insert into tutoring_slots(slot_date,start_time) values ('2099-06-05','10:00'),('2099-06-01','10:00')"), /unique/i);
    assert.equal((await db.query("select id from tutoring_slots where slot_date = '2099-06-05'")).rows.length, 0);
    await assert.rejects(db.exec("insert into tutoring_slots(slot_date,start_time) values ('2099-06-01','10:00')"), /unique/i);
    await assert.rejects(db.exec("insert into tutoring_slots(slot_date,start_time,end_time) values ('2099-06-03','10:00','09:00')"), /check/i);
    await actor(alice);
    await assert.rejects(db.query("select bulk_tutoring_slots('lock', $1::jsonb)", [JSON.stringify([{ id: slots[0].id, student_id: null }])]), /Chỉ giáo viên/);
    await assert.rejects(db.query("select teacher_tutoring_slots('2099-06')"), /Chỉ giáo viên/);
    await assert.rejects(db.exec("insert into tutoring_slots(slot_date,start_time) values ('2099-06-04','10:00')"), /row-level security/i);
    await db.query('select book_tutoring_slot($1)', [slots[0].id]);
    await assert.rejects(db.query('select book_tutoring_slot($1)', [slots[1].id]), /một ca trong tháng/);
    await db.query('select book_tutoring_slot($1)', [slots[2].id]);
    await actor(bob);
    const list = (await db.query("select * from list_tutoring_slots('2099-06')")).rows;
    assert.equal(list[0].is_booked, true);
    assert.equal(list[0].student_id, null);
    assert.equal(list[0].student_name, null);
    assert.equal((await db.query('select * from tutoring_slots')).rows.length, 0);
    await assert.rejects(db.query('select book_tutoring_slot($1)', [slots[0].id]), /Ca đã/);
    await assert.rejects(db.query('select cancel_tutoring_slot($1)', [slots[0].id]), /Không thể hủy/);
    assert.equal((await db.query('update tutoring_slots set student_id = $1 where id = $2 returning id', [bob, slots[0].id])).rows.length, 0);
    await actor(alice);
    await db.query('select cancel_tutoring_slot($1)', [slots[0].id]);
    await db.query('select book_tutoring_slot($1)', [slots[1].id]);
    await actor(teacher);
    const teacherList = (await db.query("select * from list_tutoring_slots('2099-06')")).rows;
    assert.equal(teacherList[1].student_name, 'Alice');
    await db.exec('begin');
    const selection = JSON.stringify([{ id: slots[0].id, student_id: null }, { id: slots[1].id, student_id: alice }]);
    assert.equal((await db.query("select bulk_tutoring_slots('lock', $1::jsonb) as count", [selection])).rows[0].count, 2);
    assert.equal((await db.query("select bulk_tutoring_slots('release', $1::jsonb) as count", [JSON.stringify([{ id: slots[1].id, student_id: bob }])])).rows[0].count, 0);
    assert.equal((await db.query("select bulk_tutoring_slots('delete', $1::jsonb) as count", [selection])).rows[0].count, 1);
    assert.equal((await db.query("select bulk_tutoring_slots('release', $1::jsonb) as count", [selection])).rows[0].count, 1);
    assert.equal((await db.query("select bulk_tutoring_slots('delete', $1::jsonb) as count", [selection])).rows[0].count, 1);
    await db.exec('rollback');
    assert.equal((await db.query("select teacher_tutoring_slots('2099-06') as slots")).rows[0].slots[1].student_name, 'Alice');
    await assert.rejects(db.query('select book_tutoring_slot($1)', [slots[0].id]), /Chỉ học sinh/);
    await db.query('update tutoring_slots set is_active = false where id = $1', [slots[0].id]);
    const past = (await db.query("insert into tutoring_slots(slot_date,start_time) values ('2000-01-01','10:00') returning id")).rows[0];
    await actor(bob);
    await assert.rejects(db.query('select book_tutoring_slot($1)', [slots[0].id]), /Ca đã/);
    await assert.rejects(db.query('select book_tutoring_slot($1)', [past.id]), /Ca đã/);
    await assert.rejects(db.query("select * from list_tutoring_slots('2099-99')"), /Tháng không hợp lệ/);
    await db.exec('reset role');
    await db.exec(`update profiles set is_active = false where id = '${bob}'`);
    await actor(bob);
    await assert.rejects(db.query("select * from list_tutoring_slots('2099-06')"), /Không có quyền/);
    await db.exec('reset role');
    await db.query('delete from profiles where id = $1', [alice]);
    assert.equal((await db.query('select student_id from tutoring_slots where id = $1', [slots[1].id])).rows[0].student_id, null);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.query("select * from list_tutoring_slots('2099-06')"), /permission denied/);
    await assert.rejects(db.query('select * from tutoring_slots'), /permission denied/);
  } finally {
    await db.close();
  }
});
