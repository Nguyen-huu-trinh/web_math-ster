const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const output = ts.transpileModule(fs.readFileSync('lib/notification-link.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {}, URL };
vm.runInNewContext(output, context);
const resolve = (link, type = 'LESSON_MATERIAL') => context.exports.notificationLink({ type, link });

test('announcements use their safe link or fall back to the dashboard', () => {
  for (const link of [null, '', '/dashboard', '//example.com', 'https://example.com']) {
    assert.equal(resolve(link, 'ANNOUNCEMENT'), '/dashboard');
  }
  assert.equal(resolve('/dashboard?announcement=1', 'ANNOUNCEMENT'), '/dashboard?announcement=1');
});

test('legacy material notification opens its lesson player', () => {
  assert.equal(resolve('/courses?courseId=course-1&chapterId=chapter-2&lessonId=lesson-3'), '/courses/course-1/lessons/lesson-3');
});
test('direct links and notifications without lesson IDs remain unchanged', () => {
  for (const link of ['/courses/course-1/lessons/lesson-3', '/courses?courseId=course-1&chapterId=chapter-2']) {
    assert.equal(resolve(link), link);
  }
  assert.equal(resolve('/student-exams/open/exam-1', 'EXAM'), '/student-exams/open/exam-1');
});
test('external and malformed navigation is rejected', () => {
  for (const link of ['https://example.com', '//example.com', '/\\example.com', '/\n/example.com', 'javascript:alert(1)']) {
    assert.equal(resolve(link), '/dashboard');
  }
});
