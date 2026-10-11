const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

test('middleware forwards rotated cookies to the handler and browser with cache headers', async () => {
  const jar = () => {
    const values = new Map();
    return {
      set(name, value, options) {
        if (typeof name === 'object') values.set(name.name, name);
        else values.set(name, { name, value, ...options });
      },
      getAll: () => [...values.values()],
    };
  };
  const request = { cookies: jar() };
  request.cookies.set('sb-auth-token', 'old');
  const scope = {
    exports: {}, Headers, process: { env: {} },
    require: name => name === 'next/server' ? {
      NextResponse: { next: ({ request }) => ({ request, headers: new Headers(), cookies: jar() }) },
    } : {
      createServerClient: (_url, _key, { cookies }) => ({ auth: { getUser: async () => {
        assert.equal(cookies.getAll()[0].value, 'old');
        cookies.setAll([{ name: 'sb-auth-token', value: 'new', options: { httpOnly: false, path: '/' } }], {
          'Cache-Control': 'private, no-store', Expires: '0', Pragma: 'no-cache',
        });
        cookies.setAll([{ name: 'sb-auth-token.1', value: 'chunk', options: { path: '/' } }], {});
        return { data: { user: { id: 'student' } }, error: null };
      } } }),
    },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/supabase/middleware.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  const response = await scope.exports.updateSession(request);
  assert.equal(request.cookies.getAll()[0].value, 'new');
  assert.equal(response.cookies.getAll().length, 2);
  assert.equal(response.cookies.getAll()[0].value, 'new');
  assert.equal(response.cookies.getAll()[0].path, '/');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Pragma'), 'no-cache');
});
