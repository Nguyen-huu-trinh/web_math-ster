const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const scope = { exports: {}, URL, require: name => dependencies[name] ?? require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, scope);
  return scope.exports;
}
const helper = load('lib/exam/drive-preview-url.ts');
const { toDrivePreviewUrl } = helper;
const { CreateExamSchema, UpdateExamSchema } = load('validators/exam.schema.ts', {
  '@/lib/exam/drive-preview-url': helper,
});

test('converts Drive sharing and download links to preview', () => {
  for (const path of ['file/d/abc_123-xyz/view?usp=sharing', 'open?id=abc_123-xyz',
    'uc?export=download&id=abc_123-xyz', 'file/u/0/d/abc_123-xyz/view']) {
    assert.equal(toDrivePreviewUrl(` https://drive.google.com/${path} `),
      'https://drive.google.com/file/d/abc_123-xyz/preview');
  }
});

test('preserves resource keys and already normalized links', () => {
  const preview = 'https://drive.google.com/file/d/abc/preview?resourcekey=key';
  assert.equal(toDrivePreviewUrl(preview), preview);
  assert.equal(toDrivePreviewUrl('https://drive.google.com/file/d/abc/view?resourcekey=key&usp=sharing'), preview);
});

test('leaves other links, folders, and empty values intact', () => {
  for (const url of ['', 'invalid', 'https://example.com/exam.pdf',
    'https://drive.google.com.evil.test/file/d/abc/view', 'https://drive.google.com/drive/folders/abc']) {
    assert.equal(toDrivePreviewUrl(url), url);
  }
});

test('create and update API validation normalize the stored field', () => {
  const input = { exam_file_url: 'https://drive.google.com/file/d/abc/view?usp=sharing' };
  for (const schema of [CreateExamSchema.pick({ exam_file_url: true }), UpdateExamSchema]) {
    assert.equal(schema.parse(input).exam_file_url, 'https://drive.google.com/file/d/abc/preview');
  }
  assert.equal(UpdateExamSchema.parse({ title: 'Updated exam' }).exam_file_url, undefined);
});
