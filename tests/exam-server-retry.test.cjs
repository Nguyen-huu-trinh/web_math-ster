const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function retryHelper() {
  let refreshes = 0;
  let reads = 0;
  const client = { auth: {
    getSession: async () => { reads++; return { error: null }; },
    refreshSession: async () => { refreshes++; return { error: null }; },
  } };
  const scope = { exports: {}, setTimeout: fn => fn(), require: () => ({ createClient: async () => client }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/exam/submit/server-retry.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return { ...scope.exports, counts: () => ({ refreshes, reads }) };
}

test('server write retries JWT rejection with refresh, then a network failure', async () => {
  const helper = retryHelper();
  let calls = 0;
  const result = await helper.withSubmitRetry(async () => {
    calls++;
    if (calls === 1) return { data: null, error: { message: 'JWT expired', code: 'PGRST301' }, status: 401 };
    if (calls === 2) throw new TypeError('fetch failed');
    return { data: 'saved', error: null, status: 200 };
  });
  assert.equal(result.data, 'saved');
  assert.equal(calls, 3);
  assert.deepEqual(helper.counts(), { refreshes: 1, reads: 3 });
});

test('server retry preserves permission errors and stops after three transient failures', async () => {
  for (const status of [403, 503]) {
    const helper = retryHelper();
    let calls = 0;
    await assert.rejects(helper.withSubmitRetry(async () => {
      calls++;
      return { error: { message: 'rejected', code: 'test' }, status };
    }), /rejected/);
    assert.equal(calls, status === 403 ? 1 : 3);
  }
});
