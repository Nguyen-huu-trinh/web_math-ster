const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const studentId = "11111111-1111-4111-8111-111111111111";

function route({ forbidden = false, missing = false, lookupError = null, authError = null } = {}) {
  const updates = [];
  const filters = [];
  const query = {
    select() { return query; },
    eq(...args) { filters.push(args); return query; },
    is(...args) { filters.push(args); return query; },
    async maybeSingle() { return { data: missing ? null : { id: studentId }, error: lookupError }; },
  };
  const dependencies = {
    "@/lib/auth/roles": { UserRole: { TEACHER: "TEACHER" } },
    "@/lib/auth/require-role": { requireRole: async (roles) => {
      assert.deepEqual(Array.from(roles), ["TEACHER"]);
      if (forbidden) throw Object.assign(new Error("Forbidden"), { status: 403 });
    } },
    "@/lib/supabase/server": { createClient: async () => ({ from: (table) => {
      assert.equal(table, "profiles"); return query;
    } }) },
    "@/lib/supabase/admin": { adminClient: { auth: { admin: { updateUserById: async (id, values) => {
      updates.push({ id, values: JSON.parse(JSON.stringify(values)) });
      return { error: authError };
    } } } } },
  };
  const scope = { exports: {}, require: (name) => dependencies[name] ?? require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("app/api/teachers/students/[studentId]/reset-password/route.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return { ...scope.exports, updates, filters };
}

test("teacher resets a visible undeleted student to the fixed password", async () => {
  const api = route();
  const result = await api.POST({ json: async () => ({ password: "other" }) }, { params: Promise.resolve({ studentId }) });
  assert.equal(result.status, 200);
  assert.deepEqual(api.updates, [{ id: studentId, values: { password: "123456" } }]);
  assert.deepEqual(api.filters, [["id", studentId], ["role", "STUDENT"], ["deleted_at", null]]);
});

test("nonteachers cannot reset passwords", async () => {
  const api = route({ forbidden: true });
  const result = await api.POST({}, { params: Promise.resolve({ studentId }) });
  assert.equal(result.status, 403);
  assert.equal(api.updates.length, 0);
  assert.equal(api.filters.length, 0);
});

test("missing, deleted, or invisible profiles cannot reach admin password updates", async () => {
  const api = route({ missing: true });
  assert.equal((await api.POST({}, { params: Promise.resolve({ studentId }) })).status, 404);
  assert.equal(api.updates.length, 0);
});

test("invalid student IDs cannot reach admin password updates", async () => {
  const api = route();
  assert.equal((await api.POST({}, { params: Promise.resolve({ studentId: "invalid" }) })).status, 400);
  assert.equal(api.updates.length, 0);
});

test("database and auth failures are reported without success or internal errors", async () => {
  for (const options of [{ lookupError: new Error("internal detail") }, { authError: new Error("internal detail") }]) {
    const api = route(options);
    const result = await api.POST({}, { params: Promise.resolve({ studentId }) });
    assert.equal(result.status, 500);
    const body = await result.json();
    assert.ok(body.error);
    assert.equal(body.success, undefined);
    assert.ok(!body.error.includes("internal detail"));
  }
});
