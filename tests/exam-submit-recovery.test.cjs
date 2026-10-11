const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup({ failures = [], expires = 3600, storageFails = false, hungSession = false } = {}) {
  const storage = new Map();
  const calls = [];
  let refreshes = 0;
  let reads = 0;
  const session = { expires_at: Date.now() / 1000 + expires };
  const dependencies = {
    '@/lib/supabase/client': { createClient: () => ({ auth: {
      getSession: async () => { reads++; if (hungSession) return new Promise(() => {}); return { data: { session }, error: null }; },
      refreshSession: async () => { refreshes++; return { data: { session }, error: null }; },
    } }) },
    '@/lib/api/client': { apiClient: { post: async (url, payload, options) => {
      calls.push({ url, payload, backedUp: storage.has('exam-submit:v1:attempt-1'), signal: options.signal });
      const error = failures.shift();
      if (error) throw error;
      return { success: true, attemptId: 'attempt-1', score: 8 };
    } } },
  };
  const scope = {
    exports: {}, console: { error() {} }, AbortSignal,
    setTimeout: (fn, ms) => ms === 15_000 && !hungSession ? 0 : setTimeout(fn, 0), clearTimeout,
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => { if (storageFails) throw new Error('quota'); storage.set(key, value); },
      removeItem: (key) => storage.delete(key),
    },
    require: (name) => dependencies[name] ?? require(name),
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/exam/submit/client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return { ...scope.exports, calls, storage, counts: () => ({ refreshes, reads }) };
}
const answers = { multipleChoice: ['A'], trueFalse: [['Đ', '', '', 'S']], shortAnswer: [['-', '2', '.', '5']] };
const error = (status) => Object.assign(new Error('request failed'), { status });

test('401 and lost network response refresh and retry with a persisted, unchanged payload', async () => {
  const api = setup({ failures: [error(401), new TypeError('Failed to fetch')] });
  await api.submitExamWithRecovery('attempt-1', answers, 'timeout');
  assert.equal(api.calls.length, 3);
  assert.deepEqual(api.counts(), { refreshes: 2, reads: 3 });
  assert.ok(api.calls.every(c => c.backedUp && c.signal && JSON.stringify(c.payload.answers) === JSON.stringify(answers)));
  assert.equal(api.storage.size, 0);
});

test('timeout and 503 stop after two retries and retain a recoverable draft', async () => {
  const api = setup({ failures: [new DOMException('timeout', 'TimeoutError'), error(503), error(503)] });
  await assert.rejects(api.submitExamWithRecovery('attempt-1', answers, 'manual'));
  assert.equal(api.calls.length, 3);
  assert.equal(JSON.stringify(api.readExamDraft('attempt-1')), JSON.stringify(answers));
});

test('400 and 403 do not refresh or retry', async () => {
  for (const status of [400, 403]) {
    const api = setup({ failures: [error(status)] });
    await assert.rejects(api.submitExamWithRecovery('attempt-1', answers, 'manual'));
    assert.equal(api.calls.length, 1);
    assert.equal(api.counts().refreshes, 0);
    assert.equal(api.storage.size, 1);
  }
});

test('near-expiry session refreshes before sending; storage failure does not block submission', async () => {
  const api = setup({ expires: 10, storageFails: true });
  await api.submitExamWithRecovery('attempt-1', answers, 'manual');
  assert.equal(api.counts().refreshes, 1);
  assert.equal(api.calls.length, 1);
});

test('malformed backup is ignored', () => {
  const api = setup();
  api.storage.set('exam-submit:v1:attempt-1', '{broken');
  assert.equal(api.readExamDraft('attempt-1'), undefined);
});

test('a stalled auth lock has a deadline and preserves the answers without sending stale cookies', async () => {
  const api = setup({ hungSession: true });
  await assert.rejects(api.submitExamWithRecovery('attempt-1', answers, 'manual'), { name: 'TimeoutError' });
  assert.equal(api.calls.length, 0);
  assert.equal(api.counts().reads, 3);
  assert.equal(JSON.stringify(api.readExamDraft('attempt-1')), JSON.stringify(answers));
});
