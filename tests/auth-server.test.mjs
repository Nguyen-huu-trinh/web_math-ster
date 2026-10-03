import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../lib/auth.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function guards({ user = { id: "current-user" }, role = "STUDENT", active = true, profileMissing = false, authError = null } = {}) {
  const exports = {};
  const profile = profileMissing ? null : { id: user?.id, role, is_active: active };
  const db = {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from(table) {
      assert.equal(table, "profiles");
      return { select: () => ({ eq(column, id) {
        assert.equal(column, "id");
        assert.equal(id, user.id);
        return { maybeSingle: async () => ({ data: profile, error: null }) };
      } }) };
    },
  };
  vm.runInNewContext(code, { exports, require(name) {
    if (name === "server-only") return {};
    if (name === "@/lib/supabase/server") return { createClient: async () => db };
    if (name === "next/navigation") return { redirect: (url) => { throw new Error(`redirect:${url}`); } };
    throw new Error(`Unexpected import in server guard: ${name}`);
  } });
  return exports;
}

test("server guards use the server client and allow the matching roles", async () => {
  assert.equal((await guards().requireStudent()).profile.role, "STUDENT");
  assert.equal((await guards({ role: "TEACHER" }).requireTeacher()).profile.role, "TEACHER");
  assert.equal((await guards({ role: "ADMIN" }).requireTeacher()).profile.role, "ADMIN");
  assert.equal((await guards({ role: "ADMIN" }).requireAdmin()).profile.role, "ADMIN");
});

test("missing or expired authentication and missing profiles redirect to login", async () => {
  for (const options of [{ user: null }, { authError: new Error("expired") }, { profileMissing: true }]) {
    await assert.rejects(guards(options).requireAuth(), /redirect:\/login/);
  }
});

test("wrong roles and inactive accounts remain blocked", async () => {
  await assert.rejects(guards().requireTeacher(), /redirect:\/403/);
  await assert.rejects(guards({ role: "TEACHER" }).requireStudent(), /redirect:\/403/);
  await assert.rejects(guards({ role: "TEACHER" }).requireAdmin(), /redirect:\/403/);
  await assert.rejects(guards({ active: false }).requireStudent(), /redirect:\/403/);
});
