const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function route(forbidden = false) {
 let called;
 const scope = { exports: {}, require: (name) => {
  if(name==='@/lib/auth/teacher') return {requireTeacher:async()=>{if(forbidden)throw Object.assign(new Error('Forbidden'),{status:403});}};
  if(name==='@/lib/supabase/server') return {createClient:async()=>({rpc:async(name,args)=>{called={name,args};return {data:'notification',error:null};}})};
  return require(name);
 }};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/notifications/material/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,scope);
 return {post:scope.exports.POST,get called(){return called;}};
}
const body={resourceId:'123e4567-e89b-42d3-a456-426614174000',requestId:'123e4567-e89b-42d3-a456-426614174001'};
test('create defaults to added action',async()=>{const r=route();await r.post({json:async()=>body});assert.equal(r.called.args.is_update,false);});
test('update explicitly publishes updated action',async()=>{const r=route();await r.post({json:async()=>({...body,isUpdate:true})});assert.equal(r.called.args.is_update,true);});
test('invalid update flag is rejected',async()=>{const r=route();const response=await r.post({json:async()=>({...body,isUpdate:'true'})});assert.equal(response.status,400);assert.equal(r.called,undefined);});
test('student cannot publish',async()=>{const r=route(true);const response=await r.post({json:async()=>body});assert.equal(response.status,403);assert.equal(r.called,undefined);});
test('invalid IDs do not invoke publication',async()=>{const r=route();const response=await r.post({json:async()=>({resourceId:'bad'})});assert.equal(response.status,400);assert.equal(r.called,undefined);});
test('teacher publishes using persisted resource and idempotency key',async()=>{const r=route();const response=await r.post({json:async()=>({...body,title:'forged',content:'forged'})});assert.equal(response.status,200);assert.equal(r.called.name,'publish_material_notification');assert.equal(r.called.args.resource_id,body.resourceId);assert.equal(r.called.args.submission_id,body.requestId);assert.equal(r.called.args.title,undefined);});
