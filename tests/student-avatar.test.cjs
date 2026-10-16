const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const scope = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/avatar.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, scope);
const { getAvatarUrl, getStudentAvatarUrl } = scope.exports;

test("student avatar accepts all supported Google Drive link formats", () => {
  for (const link of [
    "https://drive.google.com/file/d/photo_123/view?usp=sharing",
    "https://drive.google.com/file/u/0/d/photo_123/view",
    "https://drive.google.com/open?id=photo_123",
    "https://drive.google.com/uc?export=view&id=photo_123",
    "https://drive.google.com/thumbnail?id=photo_123&sz=w400",
    "  https://drive.google.com/file/d/photo_123/view  ",
  ]) {
    assert.equal(getStudentAvatarUrl(link), "https://drive.google.com/thumbnail?id=photo_123&sz=w512");
  }
});

test("Drive resource keys survive thumbnail normalization", () => {
  const link = getStudentAvatarUrl("https://drive.google.com/file/d/photo_123/view?resourcekey=access_key");
  assert.equal(new URL(link).searchParams.get("resourcekey"), "access_key");
});

test("direct, local and signed image links remain unchanged", () => {
  for (const link of ["/images/avatar.png", "https://images.example.com/a.jpg?token=secret", "https://drive.google.com.example.com/open?id=photo_123"]) {
    assert.equal(getStudentAvatarUrl(link), link);
  }
});

test("empty avatars use initials in student views and retain sidebar placeholder", () => {
  for (const link of [undefined, null, "", "   "]) {
    assert.equal(getStudentAvatarUrl(link), undefined);
    assert.equal(getAvatarUrl(link), "/placeholder.svg");
  }
});
