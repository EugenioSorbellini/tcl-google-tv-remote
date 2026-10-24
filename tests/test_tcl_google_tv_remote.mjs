import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const waiting = new Map();
let voiceVersion = 1;
let timers = [];
class Element {
  constructor() { this.children = []; }
  replaceChildren(...children) {
    this.children.forEach(child => child.disconnectedCallback?.());
    this.children = children;
  }
  append(child) { this.children.push(child); }
  setAttribute(name, value) { this[name] = value; }
}
class Base {
  attachShadow() {
    this.shell = new Element();
    this.shadowRoot = { querySelector: () => this.shell };
  }
}
class Voice extends Element {
  static get stylingVersion() { return voiceVersion; }
  setConfig(config) { this.config = config; }
  disconnectedCallback() { this.cancelled = true; }
}
class Remote extends Element { setConfig(config) { this.config = config; } }
const registry = new Map();
const define = (name, cls) => {
  registry.set(name, cls);
  waiting.get(name)?.forEach(resolve => resolve(cls));
  waiting.delete(name);
};
globalThis.HTMLElement = Base;
globalThis.customElements = {
  get: name => registry.get(name), define,
  whenDefined: name => registry.has(name) ? Promise.resolve(registry.get(name))
    : new Promise(resolve => waiting.set(name, [...(waiting.get(name) || []), resolve])),
};
globalThis.document = { createElement: name => new (registry.get(name) || Element)() };
globalThis.setTimeout = callback => timers.push(callback);
globalThis.clearTimeout = () => {};
const source = await readFile(new URL('../tcl-google-tv-remote.js', import.meta.url), 'utf8');
await import(`data:text/javascript,${encodeURIComponent(source)}`);
const Card = registry.get('tcl-google-tv-remote');
const tick = () => new Promise(resolve => setImmediate(resolve));
const action = (card, name) => card._remote.config.custom_actions.find(item => item.name === name);

// Universal Remote Card loading late shows a hint, then still composes.
const card = new Card();
card.setConfig({ remote_id: 'remote.living_room' });
assert.match(card.shell.children[0].textContent, /Loading remote/);
timers.forEach(callback => callback());
timers = [];
assert.match(card.shell.children[0].textContent, /Install Universal Remote Card/);
define('universal-remote-card', Remote);
await card._ready;
assert.equal(card.shell.children.length, 1, 'The remote works without TV Voice Bridge.');
assert.equal(card._remote.config.remote_id, 'remote.living_room');
assert.ok(!('media_player_id' in card._remote.config));
assert.equal(card._remote.config.platform, 'Android TV');
assert.deepEqual(action(card, 'tv').tap_action, { action: 'source', source: 'app://com.tcl.tv/tune' }, 'TCL is the default.');
assert.deepEqual(action(card, 'tv').hold_action, { action: 'key', key: 'GUIDE' });
assert.equal(action(card, 'back').label, 'Back');

// The microphone joins once TV Voice Bridge registers its card.
const hass = { language: 'en', states: {} };
card.hass = hass;
define('tv-voice-card', Voice);
await card._microphone;
assert.equal(card.shell.children.length, 2);
assert.deepEqual(card._voice.config, { type: 'custom:tv-voice-card', entity: 'remote.living_room', activation: 'hold' });
assert.equal(card._voice.hass, hass);
assert.equal(card._remote.hass, hass);

// Reconfiguring disconnects the previous microphone so recording is cancelled.
const voice = card._voice;
card.setConfig({
  remote_id: 'remote.tv', media_player_id: 'media_player.tv', microphone_activation: 'toggle',
  variant: 'google_tv',
  custom_actions: [{ type: 'button', name: 'netflix', icon: 'mdi:netflix', tap_action: { action: 'source', source: 'x://' } }],
});
assert.ok(voice.cancelled);
await card._ready;
await card._microphone;
assert.equal(card._remote.config.media_player_id, 'media_player.tv');
assert.deepEqual(action(card, 'tv').tap_action, { action: 'key', key: 'TV' });
card.setConfig({ ...card._config, live_tv_source: 'app://example.tv/live' });
await card._ready;
await card._microphone;
assert.deepEqual(action(card, 'tv').tap_action, { action: 'source', source: 'app://example.tv/live' });
assert.equal(action(card, 'netflix').icon, 'mdi:netflix', 'custom_actions replace built-ins by name.');
assert.equal(card._remote.config.custom_actions.filter(item => item.name === 'netflix').length, 1);
assert.equal(card._voice.config.activation, 'toggle');

// A language change rebuilds the accessible labels.
card.hass = { language: 'it' };
assert.equal(action(card, 'back').label, 'Indietro');
const remoteConfig = card._remote.config;
card.hass = { language: 'it' };
assert.equal(card._remote.config, remoteConfig, 'Ordinary state updates do not rebuild the remote.');
card.hass = { language: 'fr' };
assert.equal(action(card, 'back').label, 'Back', 'Unsupported languages fall back to English.');

// microphone: false keeps TV Voice Bridge out of the card.
card.setConfig({ remote_id: 'remote.tv', microphone: false });
await card._ready;
await tick();
assert.equal(card.shell.children.length, 1);
assert.equal(card._voice, undefined);

// An outdated microphone module is reported without breaking the remote.
voiceVersion = undefined;
card.hass = { language: 'en' };
card.setConfig({ remote_id: 'remote.tv' });
await card._ready;
await card._microphone;
assert.equal(card.shell.children[0], card._remote);
assert.match(card.shell.children[1].textContent, /Update TV Voice Bridge/);
voiceVersion = 1;

// A stale configuration must not replace the latest target once dependencies load.
registry.delete('universal-remote-card');
card.setConfig({ remote_id: 'remote.old' });
const stale = card._ready;
card.setConfig({ remote_id: 'remote.new' });
define('universal-remote-card', Remote);
await stale;
await card._ready;
await card._microphone;
assert.equal(card._remote.config.remote_id, 'remote.new');
assert.equal(card._voice.config.entity, 'remote.new');
assert.equal(card.shell.children.length, 2);

for (const config of [{}, { remote_id: 'media_player.tv' }, { remote_id: 'remote.tv', media_player_id: 'remote.tv' },
  { remote_id: 'remote.tv', microphone_activation: 'invalid' }, { remote_id: 'remote.tv', variant: 'roku' }, { remote_id: 'remote.tv', custom_actions: [{}] }]) {
  assert.throws(() => card.setConfig(config));
}
assert.deepEqual(Card.getStubConfig({ states: { 'light.a': {}, 'remote.tv': {} } }),
  { type: 'custom:tcl-google-tv-remote', remote_id: 'remote.tv' });
console.log('TCL Google TV Remote: composition, optional microphone, TCL/Google TV variants, overrides, localization, races and validation passed.');
