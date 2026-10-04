const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const scope = { exports: {}, console, require: (name) => dependencies[name] ?? require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  return scope.exports;
}

// Model a pending React render: setters enqueue work instead of running it immediately.
// Submission reads answersRef before that render, as a timeout/fullscreen event can do.
function deferredReact() {
  const pending = [];
  return {
    useState(initial) {
      let value = typeof initial === 'function' ? initial() : initial;
      return [value, (next) => pending.push(() => {
        value = typeof next === 'function' ? next(value) : next;
      })];
    },
    useRef: (current) => ({ current }),
    useCallback: (fn) => fn,
    flush: () => { while (pending.length) pending.shift()(); },
  };
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const config = { multipleChoice: 2, trueFalse: 1, shortAnswer: 1 };
const { QueryClient } = require('@tanstack/react-query');
const { queryKeys } = load('lib/react-query/query-keys.ts');

test('submission refreshes a fresh inactive exam list for manual and automatic submits', async () => {
  for (const reason of ['manual', 'timeout', 'fullscreen_exit']) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
    const key = queryKeys.student.myExams();
    let completed = false;
    let reads = 0;
    let success = false;
    try {
      await client.fetchQuery({ queryKey: key, staleTime: 600000, queryFn: async () => {
        reads++;
        return [{ id: 'exam-1', inProgress: !completed, canRetake: completed, lastAttemptId: completed ? 'attempt-1' : null }];
      } });
      const { useExamSubmit } = load('components/exams/answer-sheet/use-exam-submit.ts', {
        react: deferredReact(),
        '@tanstack/react-query': { useQueryClient: () => client },
        '@/lib/react-query/query-keys': { queryKeys },
        '@/lib/api/client': { apiClient: { post: async () => {
          completed = true;
          return { success: true, attemptId: 'attempt-1', reason };
        } } },
      });
      const { submit } = useExamSubmit({ attemptId: 'attempt-1', onSuccess: () => { success = true; } });
      await submit({ multipleChoice: [], trueFalse: [], shortAnswer: [] }, reason);
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(success, true);
      assert.equal(reads, 2);
      assert.deepEqual(client.getQueryData(key), [{ id: 'exam-1', inProgress: false, canRetake: true, lastAttemptId: 'attempt-1' }]);
    } finally { client.clear(); }
  }
});

test('failed submission leaves the cached exam state unchanged', async () => {
  let invalidations = 0;
  let success = false;
  let failure = false;
  const { useExamSubmit } = load('components/exams/answer-sheet/use-exam-submit.ts', {
    react: deferredReact(),
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => { invalidations++; } }) },
    '@/lib/react-query/query-keys': { queryKeys },
    '@/lib/api/client': { apiClient: { post: async () => { throw new Error('offline'); } } },
  });
  const { submit } = useExamSubmit({ attemptId: 'attempt-1', onSuccess: () => { success = true; }, onError: () => { failure = true; } });
  await assert.rejects(submit({ multipleChoice: [], trueFalse: [], shortAnswer: [] }), /offline/);
  assert.equal(invalidations, 0);
  assert.equal(success, false);
  assert.equal(failure, true);
});

function answersHook(savedAnswers) {
  const react = deferredReact();
  const { useExamAnswers } = load('components/exams/answer-sheet/use-exam-answers.ts', { react });
  return { hook: useExamAnswers({ config, savedAnswers }), react };
}

test('latest selections are available for submission before the next React render', () => {
  const { hook, react } = answersHook();
  hook.chooseMultipleChoice(0, 'C');
  hook.chooseMultipleChoice(1, 'B');
  ['Đ', 'S', 'Đ', 'S'].forEach((value, i) => hook.chooseTrueFalse(0, i, value));
  ['-', '2', '.', '5'].forEach((value, i) => hook.chooseShortAnswer(0, i, value));
  const expected = { multipleChoice: ['C', 'B'], trueFalse: [['Đ', 'S', 'Đ', 'S']], shortAnswer: [['-', '2', '.', '5']] };
  assert.deepEqual(plain(hook.answersRef.current), expected);
  react.flush();
  assert.deepEqual(plain(hook.answersRef.current), expected);
});

test('toggle and OMR clear preserve indices, blank cells and saved answers', () => {
  const saved = { multipleChoice: ['A', 'D'], trueFalse: [['Đ', 'S', '', 'Đ']], shortAnswer: [['-', '2', '.', '5']] };
  const original = plain(saved);
  const { hook, react } = answersHook(saved);
  hook.chooseMultipleChoice(0, 'A');
  hook.chooseTrueFalse(0, 1, 'S');
  for (let i = 0; i < 4; i++) hook.chooseShortAnswer(0, i, '');
  hook.chooseShortAnswer(0, 2, '0');
  assert.deepEqual(plain(hook.answersRef.current), {
    multipleChoice: ['', 'D'], trueFalse: [['Đ', '', '', 'Đ']], shortAnswer: [['', '', '0', '']],
  });
  react.flush();
  assert.deepEqual(saved, original);
});

test('submit sends the unchanged matrix contract and uses the server score', async () => {
  const { hook } = answersHook();
  hook.chooseMultipleChoice(0, 'C');
  hook.chooseMultipleChoice(1, 'B');
  ['Đ', 'S', 'Đ', 'S'].forEach((value, i) => hook.chooseTrueFalse(0, i, value));
  ['-', '2', '.', '5'].forEach((value, i) => hook.chooseShortAnswer(0, i, value));
  const expected = { multipleChoice: ['C', 'B'], trueFalse: [['Đ', 'S', 'Đ', 'S']], shortAnswer: [['-', '2', '.', '5']] };
  let request;
  let received;
  const serverResult = { success: true, score: 7.25, isPassed: true };
  const { useExamSubmit } = load('components/exams/answer-sheet/use-exam-submit.ts', {
    react: deferredReact(),
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: async () => {} }) },
    '@/lib/react-query/query-keys': load('lib/react-query/query-keys.ts'),
    '@/lib/api/client': { apiClient: { post: async (url, body) => {
      request = { url, body: plain(body) };
      return serverResult;
    } } },
  });
  const { submit } = useExamSubmit({ attemptId: 'attempt-1', onSuccess: result => { received = result; } });
  await submit(hook.answersRef.current, 'timeout');
  assert.equal(request.url, '/api/students/attempts/attempt-1/submit');
  assert.deepEqual(request.body, { answers: expected, reason: 'timeout' });
  assert.equal(received, serverResult);

  // Read-only compatibility check against the existing backend; no backend code is changed.
  const { normalizeExamAnswersByConfig } = load('lib/exam/normalize-answers.ts');
  const normalized = normalizeExamAnswersByConfig(request.body.answers, config);
  assert.deepEqual(plain(normalized), expected);
  const { gradeCustom } = load('lib/exam/grading/custom.ts');
  const { gradeTHPT } = load('lib/exam/grading/thpt.ts');
  const input = { answers: normalized, answerKey: { ...expected, shortAnswer: ['-2.5'] }, questionConfig: config, passingScore: 5 };
  assert.equal(gradeCustom(input).score, 10);
  assert.equal(gradeTHPT(input).score, 2);
});
