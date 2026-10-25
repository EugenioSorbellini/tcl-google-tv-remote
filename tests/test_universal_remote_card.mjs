// Renders the card on the real Universal Remote Card in headless Chromium and presses its buttons.
// URC_REF picks the Universal Remote Card version: latest (default), main, or a release tag.
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const repo = 'Nerwyn/android-tv-card';
const headers = process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const download = async url => {
  const response = await fetch(url, { headers });
  assert.ok(response.ok, `${url}: ${response.status}`);
  return response;
};
let ref = process.env.URC_REF || 'latest';
if (ref === 'latest') ref = (await (await download(`https://api.github.com/repos/${repo}/releases/latest`)).json()).tag_name;
const universalRemoteCard = await (await download(
  `https://raw.githubusercontent.com/${repo}/${ref}/dist/universal-remote-card.min.js`)).text();
const card = await readFile(new URL('../tcl-google-tv-remote.js', import.meta.url), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const files = {
  '/': ['text/html', `<!doctype html><body>
    <script type="module" src="/universal-remote-card.js"></script>
    <script type="module" src="/tcl-google-tv-remote.js"></script></body>`],
  '/universal-remote-card.js': ['text/javascript', universalRemoteCard],
  '/tcl-google-tv-remote.js': ['text/javascript', card],
};
await page.route('http://card.test/**', route => {
  const [contentType, body] = files[new URL(route.request().url()).pathname] || [];
  return body ? route.fulfill({ contentType, body }) : route.fulfill({ status: 404 });
});
await page.goto('http://card.test/');

// A minimal hass that records service calls instead of reaching a TV.
const mount = async config => {
  await page.evaluate(async config => {
    document.body.querySelector('tcl-google-tv-remote')?.remove();
    window.calls = [];
    const state = entity_id => ({ entity_id, state: 'on', attributes: {}, last_changed: '', last_updated: '' });
    const hass = {
      language: config.language || 'en', locale: { language: config.language || 'en' },
      states: { 'remote.tv': state('remote.tv'), 'media_player.tv': state('media_player.tv') },
      entities: { 'remote.tv': { entity_id: 'remote.tv', platform: 'androidtv_remote' } },
      services: {}, user: { id: 'user' }, localize: key => key,
      callService: async (domain, service, data) => { window.calls.push({ domain, service, data }); },
    };
    const element = document.createElement('tcl-google-tv-remote');
    element.setConfig({ remote_id: 'remote.tv', media_player_id: 'media_player.tv', microphone: false, ...config });
    element.hass = hass;
    document.body.append(element);
    await element._ready;
  }, config);
  await page.locator('universal-remote-card #power').waitFor();
};
const button = name => page.locator(`universal-remote-card #${name}`);
const calls = async () => {
  await page.waitForFunction(() => window.calls.length > 0, null, { timeout: 5000 });
  await page.waitForTimeout(100);
  return page.evaluate(() => window.calls.splice(0));
};
const sent = command => [{ domain: 'remote', service: 'send_command', data: { entity_id: 'remote.tv', command } }];
const opened = activity => [{ domain: 'remote', service: 'turn_on', data: { entity_id: 'remote.tv', activity } }];
const tap = async name => { await button(name).click(); return calls(); };
const hold = async name => {
  await button(name).hover();
  await page.mouse.down();
  await page.waitForTimeout(1000);
  await page.mouse.up();
  return calls();
};

// Every button in the layout is rendered and visible.
await mount({});
const names = await page.evaluate(() => document.querySelector('tcl-google-tv-remote')._remote.config.rows.flat());
for (const name of names) {
  const box = await button(name).boundingBox();
  assert.ok(box?.width > 0 && box?.height > 0, `${name} is visible`);
}
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
await page.screenshot({ path: new URL(`../test-results/universal-remote-card-${ref}.png`, import.meta.url).pathname });

// Built-in keys, apps and the TCL Live TV button reach the remote.
assert.deepEqual(await tap('power'), sent('POWER'));
assert.deepEqual(await tap('n5'), sent('5'));
assert.deepEqual(await tap('volume_up'), sent('VOLUME_UP'));
assert.deepEqual(await tap('back'), sent('BACK'));
assert.deepEqual(await tap('circlepad'), sent('DPAD_CENTER'));
assert.deepEqual(await tap('netflix'), opened('netflix://'));
assert.deepEqual(await tap('tv'), opened('app://com.tcl.tv/tune'));
assert.deepEqual(await hold('tv'), sent('GUIDE'));
assert.deepEqual(await tap('play_pause'), sent('MEDIA_PLAY_PAUSE'), 'Universal Remote Card supplies play_pause.');

// The Google TV variant and overrides, including of Universal Remote Card's default buttons.
await mount({
  variant: 'google_tv',
  custom_actions: [{ type: 'button', name: 'play_pause', icon: 'mdi:pause', tap_action: { action: 'key', key: 'MEDIA_PAUSE' } }],
});
assert.deepEqual(await tap('tv'), sent('TV'));
assert.deepEqual(await tap('play_pause'), sent('MEDIA_PAUSE'));

await browser.close();
assert.deepEqual(errors, [], 'No page errors.');
console.log(`Remote Card for TCL Google TV on Universal Remote Card ${ref}: layout and button actions passed.`);
