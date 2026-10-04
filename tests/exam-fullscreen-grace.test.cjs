const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup(enabled = true) {
  let now = 0;
  let cleanup;
  let effectMounted = false;
  let stateIndex = 0;
  const state = [];
  const timers = new Map();
  let nextTimer = 0;
  let submissions = 0;
  const document = new EventTarget();
  document.fullscreenElement = {};
  const window = new EventTarget();
  window.setInterval = (callback) => { timers.set(++nextTimer, callback); return nextTimer; };
  window.clearInterval = (id) => timers.delete(id);
  window.addEventListener('force-submit', () => submissions++);
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = value; }];
    },
    useEffect(effect) {
      if (!effectMounted) { effectMounted = true; cleanup = effect(); }
    },
  };
  const scope = { exports: {}, Event, document, window, Date: { now: () => now }, require: () => react };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('components/exams/use-fullscreen-grace.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, scope);
  function render() { stateIndex = 0; return scope.exports.useFullscreenGrace(enabled, 'attempt-1'); }
  render();
  return {
    render,
    get seconds() { return state[0]; },
    get failed() { return state[1]; },
    get submissions() { return submissions; },
    get timers() { return timers.size; },
    fullscreen(active) { document.fullscreenElement = active ? {} : null; document.dispatchEvent(new Event('fullscreenchange')); },
    advance(ms, tick = true) { now += ms; if (tick) [...timers.values()].forEach(callback => callback()); },
    visible() { document.dispatchEvent(new Event('visibilitychange')); },
    event(name) { window.dispatchEvent(new Event(name)); },
    cleanup() { cleanup?.(); },
  };
}

test('exit warns for 30 seconds and submits once at the deadline', () => {
  const app = setup();
  app.fullscreen(false);
  assert.equal(app.seconds, 30);
  assert.equal(app.submissions, 0);
  app.advance(29001);
  assert.equal(app.seconds, 1);
  assert.equal(app.submissions, 0);
  app.advance(999);
  assert.equal(app.seconds, 0);
  assert.equal(app.submissions, 1);
  assert.equal(app.timers, 0);
  app.fullscreen(false);
  app.advance(60000);
  assert.equal(app.submissions, 1);
});

test('returning before the deadline cancels; the next exit gets a new grace period', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(20000);
  app.fullscreen(true);
  assert.equal(app.seconds, null);
  assert.equal(app.timers, 0);
  app.advance(60000);
  assert.equal(app.submissions, 0);
  app.fullscreen(false);
  assert.equal(app.seconds, 30);
  app.advance(30000);
  assert.equal(app.submissions, 1);
});

test('duplicate exit events do not extend the deadline', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(15000);
  app.fullscreen(false);
  assert.equal(app.seconds, 15);
  assert.equal(app.timers, 1);
  app.advance(15000);
  assert.equal(app.submissions, 1);
});

test('background throttling does not grant extra time when the tab returns', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(45000, false);
  app.visible();
  assert.equal(app.seconds, 0);
  assert.equal(app.submissions, 1);
});

test('returning to fullscreen after the deadline still submits', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(30000, false);
  app.fullscreen(true);
  assert.equal(app.seconds, 0);
  assert.equal(app.submissions, 1);
});

test('successful manual/timeout submission cancels the warning before exiting fullscreen', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(10000);
  app.event('submit-success');
  assert.equal(app.seconds, null);
  assert.equal(app.timers, 0);
  app.fullscreen(false);
  app.advance(30000);
  assert.equal(app.submissions, 0);
});

test('failed automatic submission can be retried without allowing continued work', () => {
  const app = setup();
  app.fullscreen(false);
  app.advance(30000);
  app.event('submit-error');
  assert.equal(app.failed, true);
  app.fullscreen(true);
  assert.equal(app.seconds, 0);
  app.render().retrySubmit();
  assert.equal(app.failed, false);
  assert.equal(app.submissions, 2);
  app.event('submit-success');
  assert.equal(app.seconds, null);
});

test('review/inactive mode and unmounted guards never submit', () => {
  const disabled = setup(false);
  disabled.fullscreen(false);
  disabled.advance(60000);
  assert.equal(disabled.seconds, null);
  assert.equal(disabled.submissions, 0);
  const app = setup();
  app.fullscreen(false);
  app.cleanup();
  app.fullscreen(false);
  app.advance(60000);
  assert.equal(app.timers, 0);
  assert.equal(app.submissions, 0);
});
