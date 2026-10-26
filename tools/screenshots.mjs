// Renders the card on the real Universal Remote Card in headless Chromium at each supported screen size
// and saves the README screenshots to docs/. URC_REF picks the Universal Remote Card version, as in the tests.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
const mdi = await (await download('https://cdn.jsdelivr.net/npm/@mdi/js@7.4.47/mdi.js')).text();

// Stand-ins for Home Assistant's ha-icon, drawing Material Design Icons, and md-ripple, which takes no space.
const haIcon = `import * as paths from '/mdi.js';
customElements.define('md-ripple', class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host { display: none; }</style>'; }
});
customElements.define('ha-icon', class extends HTMLElement {
  static get observedAttributes() { return ['icon']; }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host { display: inline-flex; align-items: center;'
      + ' justify-content: center; width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px);'
      + ' vertical-align: middle; fill: currentColor; } svg { width: 100%; height: 100%; }</style>'
      + '<svg viewBox="0 0 24 24"><path></path></svg>';
  }
  get icon() { return this.getAttribute('icon'); }
  set icon(icon) { this.setAttribute('icon', icon); }
  attributeChangedCallback() {
    const name = 'mdi' + (this.icon || '').replace(/^mdi:/, '').replace(/(^|-)(\\w)/g, (_, __, c) => c.toUpperCase());
    this.shadowRoot.querySelector('path').setAttribute('d', paths[name] || '');
  }
});`;

// A stand-in for TV Voice Bridge's tv-voice-card with the parts the remote styles, so the microphone shows.
const voiceCard = `customElements.define('tv-voice-card', class extends HTMLElement {
  static get stylingVersion() { return 1; }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = '<div part="card"><button part="button">'
      + '<span part="icon"></span><span part="label">Microphone</span></button></div>';
  }
  setConfig() {}
  set hass(hass) {}
});`;

// The viewport picks the layout; the card is up to 400 px wide inside a popup with 16 px padding.
const sizes = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'phone-compact', width: 360, height: 740 },
  { name: 'phone-short', width: 320, height: 568 },
];

const browser = await chromium.launch();
for (const { name, width, height } of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const files = {
    '/': ['text/html', `<!doctype html><body style="margin: 0; padding: 16px; font-family: Roboto, sans-serif">
      <script type="module" src="/ha-icon.js"></script>
      <script type="module" src="/voice-card.js"></script>
      <script type="module" src="/universal-remote-card.js"></script>
      <script type="module" src="/tcl-google-tv-remote.js"></script></body>`],
    '/mdi.js': ['text/javascript', mdi],
    '/ha-icon.js': ['text/javascript', haIcon],
    '/voice-card.js': ['text/javascript', voiceCard],
    '/universal-remote-card.js': ['text/javascript', universalRemoteCard],
    '/tcl-google-tv-remote.js': ['text/javascript', card],
  };
  await page.route('http://card.test/**', route => {
    const [contentType, body] = files[new URL(route.request().url()).pathname] || [];
    return body ? route.fulfill({ contentType, body }) : route.fulfill({ status: 404 });
  });
  await page.goto('http://card.test/');
  await page.evaluate(async () => {
    const state = entity_id => ({ entity_id, state: 'on', attributes: {}, last_changed: '', last_updated: '' });
    const element = document.createElement('tcl-google-tv-remote');
    element.setConfig({ remote_id: 'remote.tv', media_player_id: 'media_player.tv' });
    element.hass = {
      language: 'en', locale: { language: 'en' },
      states: { 'remote.tv': state('remote.tv'), 'media_player.tv': state('media_player.tv') },
      entities: { 'remote.tv': { entity_id: 'remote.tv', platform: 'androidtv_remote' } },
      services: {}, user: { id: 'user' }, localize: key => key, callService: async () => {},
    };
    document.body.append(element);
    await element._ready;
    await element._microphone;
  });
  await page.locator('universal-remote-card #power').waitFor();
  await page.waitForTimeout(500);
  const remote = page.locator('tcl-google-tv-remote');
  const box = await remote.boundingBox();
  assert.ok(box.y + box.height <= height, `${name}: the card fits the ${width} × ${height} screen`);
  await remote.screenshot({ path: new URL(`../docs/${name}.png`, import.meta.url).pathname, omitBackground: true });
  assert.deepEqual(errors, [], `${name}: no page errors`);
  console.log(`${name} (${width} × ${height}): card ${Math.round(box.width)} × ${Math.round(box.height)} px`);
  await page.close();
}
await browser.close();
