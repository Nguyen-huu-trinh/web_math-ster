const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

test('PDF/video titles include course prefix for new and existing notifications', async () => {
 const db = new PGlite();
 try {
 await db.exec(`
 create role anon; create role authenticated;
 create schema auth;
 create function auth.uid() returns uuid language sql as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;
 create table profiles(id uuid,role text,is_active boolean);
 insert into profiles values(auth.uid(),'TEACHER',true);
 create table courses(id uuid primary key,name text);
 create table chapters(id uuid primary key,course_id uuid);
 create table lessons(id uuid primary key,chapter_id uuid,title text);
 create table lesson_contents(id uuid primary key,lesson_id uuid,title text,type text);
 create table notifications(id uuid default gen_random_uuid() primary key,title text,content text,type text,subtype text,link text,request_id uuid);
 create unique index notifications_request_unique on notifications(request_id) where request_id is not null;
 insert into courses values('00000000-0000-0000-0000-000000000002',' Khóa S - Nền tảng - Toán ');
 insert into chapters values('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000002');
 insert into lessons values('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000003','Hàm số');
 insert into lesson_contents values('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000004','Bài giảng','VIDEO');
 insert into notifications(title,content,type,subtype,link) values
 ('Hàm số','Đã thêm PDF','LESSON_MATERIAL','PDF','/courses/00000000-0000-0000-0000-000000000002/lessons/00000000-0000-0000-0000-000000000004'),
 ('Hàm số','Legacy','LESSON_MATERIAL','VIDEO','/courses?courseId=00000000-0000-0000-0000-000000000002&lessonId=00000000-0000-0000-0000-000000000004'),
 ('Exam','Keep','EXAM','PERIODIC','/exams/1');
 `);
 const migration = fs.readFileSync('supabase/migrations/202610300001_notification_material_course_prefix.sql','utf8');
 await db.exec(migration);
 await db.exec(migration);
 const old = (await db.query('select title,content from notifications order by content')).rows;
 assert.equal(old.filter(n=>n.title==='Khóa S - Hàm số').length,2);
 assert.ok(old.some(n=>n.title==='Exam' && n.content==='Keep'));
 for (const [name,type,update,expected] of [
  ['Khóa S - Nền tảng','VIDEO',false,'Khóa S - Hàm số'],
  ['  Toán nâng cao  ','PDF',true,'Toán nâng cao - Hàm số'],
  ['Khóa S - Nền tảng','EXAM',false,'Hàm số'],
 ]) {
 await db.query('update courses set name=$1',[name]);
 await db.query('update lesson_contents set type=$1',[type]);
 const request = (await db.query('select gen_random_uuid() as id')).rows[0].id;
 await db.query("select publish_material_notification('00000000-0000-0000-0000-000000000005',$1,$2)",[request,update]);
 await db.query("select publish_material_notification('00000000-0000-0000-0000-000000000005',$1,$2)",[request,update]);
 const rows = (await db.query('select title,content from notifications where request_id=$1',[request])).rows;
 assert.equal(rows.length,1);
 assert.equal(rows[0].title,expected);
 assert.ok(rows[0].content.startsWith(update?'Đã cập nhật ':'Đã thêm '));
 }
 } finally { await db.close(); }
});
