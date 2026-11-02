import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/tutoring/cancellation.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, { exports });
const { isTutoringCancellationLocked, TUTORING_CANCELLATION_MESSAGE } = exports;

test('cancellation locks inclusively at seven days using Vietnam slot time', () => {
  const slot = { slot_date: '2026-11-10', start_time: '10:00:00' };
  const deadline = Date.parse('2026-11-03T10:00:00+07:00');
  assert.equal(isTutoringCancellationLocked(slot, deadline - 1), false);
  assert.equal(isTutoringCancellationLocked(slot, deadline), true);
  assert.equal(isTutoringCancellationLocked(slot, deadline + 1), true);
  assert.equal(isTutoringCancellationLocked(slot, Date.parse('2026-11-10T11:00:00+07:00')), true);
});

test('RPC rejects near-date cancellations and preserves bookings; teachers can still release them', async () => {
  const db = new PGlite();
  const student = '22222222-2222-4222-8222-222222222222';
  const teacher = '11111111-1111-4111-8111-111111111111';
  const other = '33333333-3333-4333-8333-333333333333';
  const actor = async id => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec('set role authenticated');
  };
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated,service_role;
      create table profiles(id uuid primary key,role text,full_name text,is_active boolean default true,deleted_at timestamptz);
      insert into profiles(id,role) values ('${student}','STUDENT'),('${teacher}','TEACHER'),('${other}','STUDENT');`);
    await db.exec(readFileSync(new URL('../supabase/migrations/202610220001_tutoring_slots.sql', import.meta.url), 'utf8'));
    await db.exec(readFileSync(new URL('../supabase/migrations/202611020002_tutoring_cancellation_deadline.sql', import.meta.url), 'utf8'));
    for (const [interval, blocked] of [['8 days',false],['7 days 1 minute',false],['7 days',true],['6 days',true],['1 hour',true],['-1 hour',true]]) {
      await actor(teacher);
      const { rows: [slot] } = await db.query(`insert into tutoring_slots(slot_date,start_time,student_id,booked_at)
        select t::date,t::time,$1,now() from
        (select (clock_timestamp() at time zone 'Asia/Ho_Chi_Minh') + $2::interval as t) x returning id`, [student, interval]);
      await actor(other);
      await assert.rejects(db.query('select cancel_tutoring_slot($1)',[slot.id]), /Không thể hủy/);
      await actor(student);
      if (blocked) {
        await assert.rejects(db.query('select cancel_tutoring_slot($1)',[slot.id]), error => error.message === TUTORING_CANCELLATION_MESSAGE);
        assert.equal((await db.query('select student_id,booked_at from tutoring_slots where id=$1',[slot.id])).rows[0].student_id,student);
      } else {
        await db.query('select cancel_tutoring_slot($1)',[slot.id]);
      }
      await actor(teacher);
      if (blocked) {
        await db.query('update tutoring_slots set student_id=null,booked_at=null where id=$1',[slot.id]);
      }
      assert.deepEqual((await db.query('select student_id,booked_at from tutoring_slots where id=$1',[slot.id])).rows[0],{student_id:null,booked_at:null});
      await db.query('delete from tutoring_slots where id=$1',[slot.id]);
    }
  } finally { await db.close(); }
});
