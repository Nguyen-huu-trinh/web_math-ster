const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const migration=fs.readFileSync('supabase/migrations/202611020001_remove_profile_points_and_code_attendance.sql','utf8');
async function fixture(){
 const db=new PGlite();
 await db.exec(`create role authenticated; create role service_role; create role anon;
 create schema auth; create function auth.role() returns text language sql as $$select 'service_role'::text$$;
 create table profiles(id uuid primary key, points integer, is_active boolean default true, full_name text);
 create table exam_attempts(id uuid primary key, exam_id uuid, student_id uuid, score numeric, is_passed boolean, updated_at timestamptz);
 create table attendance(id integer primary key, code text);
 create view v_dotrau_students as select id,points from profiles order by points desc;
 create function adjust_student_points(uuid,integer) returns void language sql as $$update profiles set points=points+$2 where id=$1$$;
 create function submit_attendance(text,text) returns integer language plpgsql as $$begin return 10; end;$$;
 create function create_attendance_session(text) returns void language sql as $$insert into attendance values(1,$1)$$;
 create function lock_negative_points() returns trigger language plpgsql as $$begin if new.points<0 then new.is_active=false; end if; return new; end;$$;
 create trigger lock_negative_points before update on profiles for each row execute function lock_negative_points();
 create function normalize_profile_name() returns trigger language plpgsql as $$begin new.full_name=trim(new.full_name); return new; end;$$;
 create trigger normalize_profile_name before update on profiles for each row execute function normalize_profile_name();
 insert into profiles values('11111111-1111-4111-8111-111111111111',-30,false,'An');`);
 return db;
}
test('migration removes code attendance, points and HP locking while preserving profile updates',async()=>{
 const db=await fixture();
 try{
  await db.exec(migration);
  await db.exec(migration); // safe on an installation where the legacy objects are absent
  assert.equal((await db.query("select column_name from information_schema.columns where table_name='profiles' and column_name='points'")).rows.length,0);
  assert.equal((await db.query("select to_regclass('public.attendance') as relation")).rows[0].relation,null);
  assert.equal((await db.query("select to_regclass('public.v_dotrau_students') as relation")).rows[0].relation,null);
  assert.equal((await db.query("select proname from pg_proc where proname in ('adjust_student_points','submit_attendance','create_attendance_session','lock_negative_points')")).rows.length,0);
  assert.equal((await db.query('select is_active from profiles')).rows[0].is_active,false);
  await db.exec("update profiles set is_active=true,full_name='  An  '");
  assert.deepEqual((await db.query('select is_active,full_name from profiles')).rows,[{is_active:true,full_name:'An'}]);
 }finally{await db.close();}
});
test('unexpected dependencies abort the migration without deleting unrelated views',async()=>{
 const db=await fixture();
 try{
  await db.exec('create view custom_profile_report as select points from profiles');
  await assert.rejects(db.exec(migration),/depend/);
  await db.exec('rollback');
  assert.equal((await db.query('select points from profiles')).rows[0].points,-30);
  assert.equal((await db.query('select points from custom_profile_report')).rows[0].points,-30);
  assert.notEqual((await db.query("select to_regclass('attendance') as relation")).rows[0].relation,null);
 }finally{await db.close();}
});
