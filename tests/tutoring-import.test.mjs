import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/tutoring/import.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText, { exports, require });
const { tutoringBatch, normalizeImportRows } = exports;
test('Excel template contains twelve valid slots over the next three days', () => {
  const template = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../lib/tutoring/template.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText, { exports: template });
  const rows = template.tutoringTemplateRows('2026-10-31');
  assert.equal(rows.length, 13);
  assert.equal(rows[1][0], '2026-11-01');
  assert.equal(rows[12][0], '2026-11-03');
  assert.equal(tutoringBatch.safeParse(normalizeImportRows(rows, () => null)).success, true);
});
test('single digit hours are padded and validated before ordering and duplicates', () => {
  const row = { slot_date: '2026-10-25', start_time: '1:00', end_time: '2:00', note: '' };
  const parsed = tutoringBatch.parse([row]);
  assert.equal(parsed[0].start_time, '01:00');
  assert.equal(parsed[0].end_time, '02:00');
  const preview = normalizeImportRows([['slot_date','start_time','end_time'], ['2026-10-25',' 1:00 ','2:00']], () => null);
  assert.equal(preview[0].start_time, '01:00');
  assert.equal(preview[0].end_time, '02:00');
  assert.equal(tutoringBatch.safeParse([row, { ...row, start_time: '01:00' }]).success, false);
  assert.equal(tutoringBatch.safeParse([{ ...row, start_time: '9:00', end_time: '10:00' }]).success, true);
  for (const start_time of ['24:00','1:60','1:0','-1:00']) assert.equal(tutoringBatch.safeParse([{ ...row, start_time }]).success, false);
});
test('import normalizes Excel dates, times and Vietnamese text dates', () => {
  const rows = normalizeImportRows([
    ['slot_date','start_time','end_time','note'],
    [46000,20/24,20.5/24,'Zoom'],
    ['25/10/2026','21:00','21:30',''],
  ], () => ({ y: 2026, m: 10, d: 25 }));
  assert.equal(rows[0].slot_date, '2026-10-25');
  assert.equal(rows[0].start_time, '20:00');
  assert.equal(rows[0].end_time, '20:30');
  assert.equal(rows[1].slot_date, '2026-10-25');
  assert.equal(tutoringBatch.safeParse(rows).success, true);
});
test('import rejects missing columns, impossible dates, reversed times, duplicates and oversized batches', () => {
  const row = { slot_date: '2026-10-25', start_time: '20:00', end_time: '20:30', note: '' };
  assert.throws(() => normalizeImportRows([['date'], ['2026-10-25']], () => null), /Thiếu cột/);
  assert.throws(() => normalizeImportRows([['slot_date','start_time'], ['2026-02-30','20:00']], () => null), /Dòng 2/);
  assert.equal(tutoringBatch.safeParse([{ ...row, end_time: '19:00' }]).success, false);
  assert.equal(tutoringBatch.safeParse([row, row]).success, false);
  assert.equal(tutoringBatch.safeParse(Array(501).fill(row)).success, false);
  assert.equal(tutoringBatch.safeParse([]).success, false);
});
