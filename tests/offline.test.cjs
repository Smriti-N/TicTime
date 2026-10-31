const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

function worker() {
  const handlers = {};
  const entries = new Map();
  const removed = [];
  let claimed = false;
  const scope = 'http://localhost/TicTime/';
  const context = vm.createContext({ URL,
    self: { location: { origin: 'http://localhost' }, registration: { scope },
      clients: { async claim() { claimed = true; } },
      addEventListener(name, callback) { handlers[name] = callback; } },
    caches: {
      async keys() { return ['tictime-v0', 'tictime-v1', 'other-app']; },
      async delete(name) { removed.push(name); },
      async open() { return {
        async addAll(files) { files.forEach(file => {
          const body = fs.readFileSync(path.join(root, file));
          entries.set(new URL(file, scope).href, body);
        }); },
        async match(request) {
          const url = new URL(typeof request === 'string' ? request : request.url, scope);
          url.search = '';
          return entries.get(url.href);
        },
      }; },
    },
    fetch: async () => { throw new Error('Network offline'); },
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), context);
  return { entries, removed, claimed: () => claimed,
    async lifecycle(name) { let done; handlers[name]({ waitUntil(promise) { done = promise; } }); await done; },
    async request(url, mode = 'cors', method = 'GET') {
      let response;
      handlers.fetch({ request: { url, mode, method }, respondWith(promise) { response = promise; } });
      return response;
    } };
}

test('manifest contains standalone launch metadata and two valid PNG sizes', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.ok(manifest.name && manifest.theme_color);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './index.html');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}`);
    const data = fs.readFileSync(path.join(root, icon.src));
    assert.equal(data.readUInt32BE(16), size);
    assert.equal(data.readUInt32BE(20), size);
  }
});

test('install caches all app files and offline navigation and scripts load', async () => {
  const app = worker();
  await app.lifecycle('install');
  assert.equal(app.entries.size, 8);
  const page = await app.request('http://localhost/TicTime/index.html?reload=1', 'navigate');
  assert.match(page.toString(), /TicTime/);
  for (const file of ['game.js', 'ui.js', 'main.js']) {
    const response = await app.request(`http://localhost/TicTime/js/${file}?version=1`);
    assert.ok(response.length > 0);
  }
});

test('activation deletes only obsolete TicTime caches and claims clients', async () => {
  const app = worker();
  await app.lifecycle('activate');
  assert.deepEqual(app.removed, ['tictime-v0']);
  assert.equal(app.claimed(), true);
});

test('worker leaves external requests, other apps and non-GET requests alone', async () => {
  const app = worker();
  assert.equal(await app.request('https://fonts.googleapis.com/css2'), undefined);
  assert.equal(await app.request('http://localhost/other/index.html', 'navigate'), undefined);
  assert.equal(await app.request('http://localhost/TicTime/data', 'cors', 'POST'), undefined);
});
