// TCL Google TV Remote: a physical-style TCL Google TV remote built on Universal Remote Card.
// The optional microphone is TV Voice Bridge's tv-voice-card; recording and delivery belong to it.
export const VERSION = '0.1.0';

const translations = {
  en: {
    volume_mute: 'Mute', power: 'Power', volume_up: 'Volume +', volume_down: 'Volume −',
    channel_up: 'Channel +', channel_down: 'Channel −', back: 'Back', home: 'Home',
    settings: 'Settings', tv: 'Live TV', keyboard: 'Keyboard',
    loading: 'Loading remote…',
    remote_missing: 'Cannot load the remote. Install Universal Remote Card and reload the page.',
    microphone_update: 'Update TV Voice Bridge to v1.0.0 or later to use the microphone.',
  },
  it: {
    volume_mute: 'Muto', power: 'Accensione', volume_up: 'Volume +', volume_down: 'Volume −',
    channel_up: 'Canale +', channel_down: 'Canale −', back: 'Indietro', home: 'Home',
    settings: 'Impostazioni', tv: 'TV in diretta', keyboard: 'Tastiera',
    loading: 'Caricamento telecomando…',
    remote_missing: 'Impossibile caricare il telecomando. Installa Universal Remote Card e ricarica la pagina.',
    microphone_update: 'Aggiorna TV Voice Bridge alla v1.0.0 o successiva per usare il microfono.',
  },
};

const languageOf = hass => {
  const language = (hass?.locale?.language || hass?.language || 'en').split('-')[0];
  return language in translations ? language : 'en';
};

// The grid positions in remoteStyles and the microphone offset depend on these rows.
const rows = [
  ['volume_mute', 'power'],
  ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n0'],
  ['volume_up', 'volume_down', 'circlepad', 'channel_up', 'channel_down'],
  ['back', 'home'],
  ['settings', 'tv'],
  ['netflix', 'primevideo', 'disney', 'youtube'],
  ['keyboard', 'rewind', 'play_pause', 'fast_forward'],
];

const circlepadStyles = `
:host(remote-circlepad) {
  display: block;
  width: var(--tv-remote-pad, 176px);
  height: var(--tv-remote-pad, 176px);
  max-width: 100%;
  --icon-color: #f4f5f5;
  --icon-size: 26px;
  --center-button-relative-size: 42%;
}
.circlepad {
  background: #303738;
  outline: 2px solid #101415;
  box-shadow: inset 0 2px 2px #ffffff24, 0 2px 3px #0008;
}
#center::part(button) {
  background: linear-gradient(145deg, #3b4243, #2e3536);
  outline: 2px solid #101415;
  box-shadow: inset 0 2px 2px #ffffff26, 0 2px 3px #0008;
}
#center::part(label) { font: 500 15px Roboto, sans-serif; color: #f4f5f5; }
.direction::part(icon) { opacity: .55; }
`;

// Dimensions inherit from the variables in hostStyles, including the compact phone layout.
const remoteStyles = `
ha-card {
  display: grid;
  grid-template-columns: var(--tv-remote-rocker-width, 64px) minmax(0, 1fr)
    var(--tv-remote-rocker-width, 64px);
  grid-template-rows: var(--tv-remote-button, 52px) var(--tv-remote-keypad-height, 94px)
    var(--tv-remote-nav-height, 176px)
    var(--tv-remote-button, 52px) var(--tv-remote-button, 52px)
    var(--tv-remote-app, 56px) var(--tv-remote-footer, 48px);
  gap: var(--tv-remote-gap, 12px) var(--tv-remote-edge, 12px);
  box-sizing: border-box;
  width: 100%;
  padding: var(--tv-remote-padding-top, 16px) var(--tv-remote-edge, 12px) var(--tv-remote-padding-bottom, 16px);
  border: 1px solid #727777;
  border-radius: 28px;
  background: linear-gradient(105deg, #464c4d, #3b4142 55%, #43494a);
  box-shadow: inset 1px 1px 2px #ffffff40, inset -1px -1px 2px #0007,
    0 10px 28px #0003;
  color: #f4f5f5;
  --primary-text-color: #f4f5f5;
  --secondary-text-color: #c3c9ca;
  --md-ripple-hover-color: #fff;
  --md-ripple-pressed-color: #fff;
  --icon-color: #f4f5f5;
  --icon-size: 28px;
}
.row { display: contents; }
remote-button {
  width: var(--tv-remote-button, 52px);
  height: var(--tv-remote-button, 52px);
  place-self: center;
  border-radius: 999px;
}
remote-button::part(button) {
  border: 2px solid #111617;
  border-radius: inherit;
  background: linear-gradient(145deg, #414849, #303738);
  box-shadow: inset 0 1px 2px #ffffff24, 0 2px 2px #0006;
}
remote-button::part(label) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
remote-button:focus-visible { outline: 3px solid #8ab4f8; outline-offset: 3px; }
#volume_mute, #back, #settings {
  width: var(--tv-remote-oval-width, 92px);
  justify-self: start;
}
#power, #home, #tv {
  width: var(--tv-remote-oval-width, 92px);
  justify-self: end;
}
#volume_mute { grid-area: 1 / 1; }
#volume_mute::part(icon) { color: #f4f5f5; }
#power { grid-area: 1 / 3; }
#power::part(icon) { color: #ff373e; }
#circlepad { grid-area: 3 / 2; place-self: center; }
#back { grid-area: 4 / 1; }
#home { grid-area: 4 / 3; }
#settings { grid-area: 5 / 1; }
#tv { grid-area: 5 / 3; }
#volume_up, #volume_down, #channel_up, #channel_down {
  height: var(--tv-remote-rocker-half, 68px);
  width: var(--tv-remote-rocker-width, 64px);
  --icon-size: 32px;
}
#volume_up, #channel_up { align-self: center; translate: 0 -50%; border-radius: 30px 30px 0 0; }
#volume_down, #channel_down { align-self: center; translate: 0 50%; border-radius: 0 0 30px 30px; }
#volume_up::part(button), #channel_up::part(button) { border-bottom: 0; }
#volume_down::part(button), #channel_down::part(button) { border-top: 0; }
#volume_up { grid-area: 3 / 1; }
#volume_down { grid-area: 3 / 1; }
#channel_up { grid-area: 3 / 3; }
#channel_down { grid-area: 3 / 3; }
#volume_up::after, #channel_up::after {
  position: absolute;
  top: -12px;
  font: 500 10px Roboto, sans-serif;
  letter-spacing: 1px;
  color: #e3e7e7;
}
#volume_up::after { content: "VOL"; }
#channel_up::after { content: "CH"; }
#row-6 {
  display: grid;
  grid-area: 6 / 1 / 7 / -1;
  grid-template-columns: repeat(4, minmax(44px, 1fr));
  gap: 8px;
  padding: 0;
  justify-content: space-between;
}
#netflix, #primevideo, #youtube, #disney {
  width: 100%;
  height: var(--tv-remote-app, 56px);
}
#netflix::part(button), #primevideo::part(button), #youtube::part(button), #disney::part(button) {
  background: #fff;
  border-color: #151a1b;
  box-shadow: inset 0 1px 2px #fff, 0 2px 3px #0006;
}
#netflix::part(label), #primevideo::part(label), #disney::part(label) {
  position: static;
  width: auto;
  height: auto;
  clip-path: none;
  margin: 0;
  line-height: .95;
}
#netflix::part(label) { color: #d70b18; font: 700 11px "Arial Narrow", sans-serif; }
#primevideo::part(label) { color: #007da5; font: 700 15px/0.95 Arial, sans-serif; }
#disney::part(label) { color: #102655; font: italic 700 12px Georgia, serif; }
#youtube::part(icon) { color: #f00009; --icon-size: 30px; }
#row-7 {
  display: grid;
  grid-area: 7 / 1 / 8 / -1;
  grid-template-columns: repeat(4, minmax(44px, 1fr));
  gap: 8px;
  padding: 0;
  justify-content: center;
}
#row-7 remote-button {
  width: 100%;
  height: var(--tv-remote-footer, 48px);
  --icon-size: 25px;
}
#row-2 {
  display: grid;
  grid-area: 2 / 1 / 3 / -1;
  grid-template-columns: repeat(5, minmax(44px, 1fr));
  grid-template-rows: repeat(2, 44px);
  gap: var(--tv-remote-keypad-gap, 6px) clamp(4px, 1.5cqi, 6px);
  padding: 0;
  justify-content: space-between;
}
#row-2 remote-button { width: 100%; height: 44px; }
#row-2 remote-button::part(label) {
  position: static;
  width: auto;
  height: auto;
  clip-path: none;
  margin: 0;
  color: #f4f5f5;
  font: 500 20px Roboto, sans-serif;
}
@media (max-width: 600px) and (max-height: 620px) {
  #circlepad { --center-button-relative-size: 46%; }
  #netflix::part(label) { font-size: 9px; }
  #primevideo::part(label) { font-size: 13px; }
  #volume_up::after, #channel_up::after { top: 3px; font-size: 8px; }
  #volume_up::part(icon), #channel_up::part(icon) { translate: 0 4px; }
}
`;

const hostStyles = `
:host {
  display: block; width: min(400px, 100%); margin: 0 auto;
  container-type: inline-size;
  --tv-remote-edge: clamp(8px, 3cqi, 12px);
  --tv-remote-rocker-width: clamp(56px, 16cqi, 64px);
  --tv-remote-pad: clamp(112px, calc(100cqi - 2 * var(--tv-remote-rocker-width)
    - 4 * var(--tv-remote-edge) - 2px), 176px);
  --tv-remote-nav-height: max(var(--tv-remote-pad), calc(2 * var(--tv-remote-rocker-half) + 12px));
  --tv-remote-keypad-gap: 6px;
  --tv-remote-keypad-height: calc(88px + var(--tv-remote-keypad-gap));
  --tv-remote-oval-width: clamp(64px, 23cqi, 92px);
  --tv-remote-button: 52px;
  --tv-remote-gap: 12px;
  --tv-remote-padding-top: 16px;
  --tv-remote-padding-bottom: 16px;
  --tv-remote-rocker-half: clamp(56px, 18cqi, 68px);
  --tv-remote-app: 56px;
  --tv-remote-mic: 60px;
  --tv-remote-footer: 48px;
}
.shell { position: relative; }
.notice { margin: 12px 6px 0; color: var(--secondary-text-color); text-align: center; }
tv-voice-card::part(card) { position: static; padding: 0; background: none; }
tv-voice-card::part(button) {
  position: absolute; left: 50%; transform: translateX(-50%);
  top: calc(var(--tv-remote-padding-top) + 2 * var(--tv-remote-button)
    + var(--tv-remote-keypad-height) + var(--tv-remote-nav-height)
    + 3.5 * var(--tv-remote-gap) - var(--tv-remote-mic) / 2);
  width: var(--tv-remote-oval-width); height: var(--tv-remote-mic);
  min-height: 0; padding: 0; border-radius: 999px;
  border: 2px solid #111617; color: #f4f5f5;
  background: linear-gradient(145deg, #414849, #303738);
  box-shadow: inset 0 1px 2px #ffffff24, 0 2px 3px #0008;
  z-index: 1;
}
tv-voice-card::part(label) {
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%);
}
tv-voice-card:not([data-state="recording"]):not([data-state="sending"])::part(icon) { visibility: hidden; }
tv-voice-card:not([data-state="recording"]):not([data-state="sending"])::part(button) {
  background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2040%22%3E%3Crect%20x%3D%2211%22%20y%3D%222%22%20width%3D%2210%22%20height%3D%2223%22%20rx%3D%225%22%20fill%3D%22%234285f4%22%2F%3E%3Cpath%20d%3D%22M5%2018v4a11%2011%200%200%200%2011%2011v-5a6%206%200%200%201-6-6v-4z%22%20fill%3D%22%23fbbc05%22%2F%3E%3Cpath%20d%3D%22M27%2018v4a11%2011%200%200%201-11%2011v-5a6%206%200%200%200%206-6v-4z%22%20fill%3D%22%23ea4335%22%2F%3E%3Cpath%20d%3D%22M13.5%2031h5v7h-5z%22%20fill%3D%22%2334a853%22%2F%3E%3C%2Fsvg%3E"), linear-gradient(145deg, #414849, #303738);
  background-position: center; background-repeat: no-repeat; background-size: 23px 29px, auto;
}
tv-voice-card[data-state="recording"]::part(button) { background: #c62832; }
tv-voice-card::part(button):focus-visible { outline: 3px solid #8ab4f8; outline-offset: 3px; }
tv-voice-card::part(status) { margin: 12px 6px 0; }
tv-voice-card::part(hint) {
  position: absolute; width: 1px; height: 1px; min-height: 0;
  margin: 0; overflow: hidden; clip-path: inset(50%);
}
tv-voice-card::part(meter) { margin-top: 12px; }
@media (max-width: 600px) and (max-height: 780px) {
  :host {
    --tv-remote-pad: clamp(112px, min(calc(100cqi - 2 * var(--tv-remote-rocker-width)
      - 4 * var(--tv-remote-edge) - 2px), calc(100dvh - 540px)), 176px);
    --tv-remote-rocker-half: clamp(52px, 18cqi, 64px);
    --tv-remote-button: 48px;
    --tv-remote-gap: 6px;
    --tv-remote-padding-top: 8px;
    --tv-remote-padding-bottom: 8px;
    --tv-remote-app: 52px;
    --tv-remote-mic: 56px;
    --tv-remote-footer: 44px;
  }
}
@media (max-width: 600px) and (max-height: 620px) {
  :host {
    --tv-remote-pad: 96px;
    --tv-remote-rocker-half: 48px;
    --tv-remote-keypad-gap: 4px;
    --tv-remote-button: 44px;
    --tv-remote-gap: 3px;
    --tv-remote-padding-top: 4px;
    --tv-remote-padding-bottom: 4px;
    --tv-remote-app: 44px;
    --tv-remote-mic: 52px;
    --tv-remote-nav-height: max(var(--tv-remote-pad), calc(2 * var(--tv-remote-rocker-half)));
  }
}
`;

const key = (name, icon, label, keyName, repeat = false) => ({
  type: 'button', name, icon, label,
  tap_action: { action: 'key', key: keyName },
  ...(repeat ? { hold_action: { action: 'repeat' } } : {}),
});
const app = (name, icon, label, source) => ({
  type: 'button', name, icon, label, tap_action: { action: 'source', source },
});
const direction = (icon, keyName) => ({
  icon, tap_action: { action: 'key', key: keyName }, hold_action: { action: 'repeat' },
});

// Live TV tap actions per variant; live_tv_source overrides either one.
const liveTv = {
  // Read from the TCL TV app's intent filters; opens the broadcast tuner directly.
  tcl: { action: 'source', source: 'app://com.tcl.tv/tune' },
  google_tv: { action: 'key', key: 'TV' },
};

function builtInActions(t, liveTvAction) {
  const digits = [...'0123456789'].map(digit => key(`n${digit}`, '', digit, digit));
  return [
    ...digits,
    key('volume_mute', 'mdi:volume-off', t.volume_mute, 'MUTE'),
    key('power', 'mdi:power', t.power, 'POWER'),
    key('volume_up', 'mdi:plus', t.volume_up, 'VOLUME_UP', true),
    key('volume_down', 'mdi:minus', t.volume_down, 'VOLUME_DOWN', true),
    key('channel_up', 'mdi:chevron-up', t.channel_up, 'CHANNEL_UP'),
    key('channel_down', 'mdi:chevron-down', t.channel_down, 'CHANNEL_DOWN'),
    key('back', 'mdi:arrow-left', t.back, 'BACK'),
    key('home', 'mdi:home', t.home, 'HOME'),
    key('settings', 'mdi:cog', t.settings, 'SETTINGS'),
    {
      type: 'button', name: 'tv', icon: 'mdi:television-classic', label: t.tv,
      tap_action: liveTvAction,
      hold_action: { action: 'key', key: 'GUIDE' },
    },
    {
      type: 'circlepad', name: 'circlepad', label: 'OK',
      tap_action: { action: 'key', key: 'DPAD_CENTER' },
      up: direction('mdi:chevron-up', 'DPAD_UP'),
      down: direction('mdi:chevron-down', 'DPAD_DOWN'),
      left: direction('mdi:chevron-left', 'DPAD_LEFT'),
      right: direction('mdi:chevron-right', 'DPAD_RIGHT'),
      styles: circlepadStyles,
    },
    app('netflix', '', 'NETFLIX', 'netflix://'),
    app('primevideo', '', 'prime\nvideo', 'https://app.primevideo.com'),
    app('disney', '', 'Disney+', 'https://www.disneyplus.com'),
    app('youtube', 'mdi:youtube', 'YouTube', 'https://www.youtube.com'),
    { type: 'button', name: 'keyboard', icon: 'mdi:keyboard', label: t.keyboard, tap_action: { action: 'keyboard' } },
  ];
}

const entityPattern = domain => new RegExp(`^${domain}\\.[a-z0-9_]+$`);

class TCLGoogleTVRemote extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${hostStyles}</style><div class="shell"></div>`;
    this._shell = this.shadowRoot.querySelector('.shell');
    this._generation = 0;
  }

  static getStubConfig(hass) {
    const remote = Object.keys(hass?.states || {}).find(id => id.startsWith('remote.'));
    return { type: 'custom:tcl-google-tv-remote', remote_id: remote || 'remote.living_room_tv' };
  }

  setConfig(config) {
    if (!entityPattern('remote').test(config?.remote_id || '')) {
      throw new Error('Set remote_id to an Android TV Remote entity, such as remote.living_room_tv.');
    }
    if (config.media_player_id && !entityPattern('media_player').test(config.media_player_id)) {
      throw new Error('media_player_id must be a media_player entity.');
    }
    if (config.variant && !(config.variant in liveTv)) {
      throw new Error('variant must be tcl or google_tv.');
    }
    if (config.microphone_activation && !['hold', 'toggle'].includes(config.microphone_activation)) {
      throw new Error('microphone_activation must be hold or toggle.');
    }
    if (config.custom_actions && (!Array.isArray(config.custom_actions) ||
        config.custom_actions.some(action => typeof action?.name !== 'string'))) {
      throw new Error('custom_actions must be a list of actions, each with a name.');
    }
    this._config = {
      ...config,
      variant: config.variant || 'tcl',
      microphone: config.microphone !== false,
      microphone_activation: config.microphone_activation || 'hold',
    };
    const generation = ++this._generation;
    this._remote = this._voice = undefined;
    this._shell.replaceChildren(this._notice(this._t().loading));
    this._ready = this._compose(generation);
  }

  _t() { return translations[languageOf(this._hass)]; }

  _notice(text) {
    const notice = document.createElement('p');
    notice.className = 'notice';
    notice.setAttribute('role', 'status');
    notice.textContent = text;
    return notice;
  }

  _remoteConfig() {
    const overrides = new Map(this._config.custom_actions?.map(action => [action.name, action]));
    const actions = builtInActions(this._t(), this._config.live_tv_source
      ? { action: 'source', source: this._config.live_tv_source } : liveTv[this._config.variant])
      .map(action => overrides.get(action.name) || action);
    return {
      type: 'custom:universal-remote-card',
      platform: 'Android TV',
      remote_id: this._config.remote_id,
      ...(this._config.media_player_id ? { media_player_id: this._config.media_player_id } : {}),
      rows,
      custom_actions: actions,
      styles: remoteStyles,
    };
  }

  async _compose(generation) {
    const missing = setTimeout(() => {
      if (generation === this._generation) this._shell.replaceChildren(this._notice(this._t().remote_missing));
    }, 10000);
    await customElements.whenDefined('universal-remote-card');
    clearTimeout(missing);
    if (generation !== this._generation) return;
    const remote = document.createElement('universal-remote-card');
    this._language = languageOf(this._hass);
    remote.setConfig(this._remoteConfig());
    if (this._hass) remote.hass = this._hass;
    this._shell.replaceChildren(remote);
    this._remote = remote;
    if (this._config.microphone) this._microphone = this._attachMicrophone(generation);
  }

  // TV Voice Bridge is optional: the microphone slot stays empty until its card is registered.
  async _attachMicrophone(generation) {
    await customElements.whenDefined('tv-voice-card');
    if (generation !== this._generation) return;
    if (customElements.get('tv-voice-card').stylingVersion !== 1) {
      this._shell.append(this._notice(this._t().microphone_update));
      return;
    }
    const voice = document.createElement('tv-voice-card');
    voice.setConfig({
      type: 'custom:tv-voice-card', entity: this._config.remote_id,
      activation: this._config.microphone_activation,
    });
    if (this._hass) voice.hass = this._hass;
    this._shell.append(voice);
    this._voice = voice;
  }

  set hass(hass) {
    this._hass = hass;
    if (this._remote && languageOf(hass) !== this._language) {
      this._language = languageOf(hass);
      this._remote.setConfig(this._remoteConfig());
    }
    if (this._remote) this._remote.hass = hass;
    if (this._voice) this._voice.hass = hass;
  }

  getCardSize() { return 10; }
}

if (!customElements.get('tcl-google-tv-remote')) {
  customElements.define('tcl-google-tv-remote', TCLGoogleTVRemote);
  if (typeof window !== 'undefined') (window.customCards ||= []).push({
    type: 'tcl-google-tv-remote',
    name: 'TCL Google TV Remote',
    description: 'A physical-style TCL Google TV remote, also for other Google TV devices, with an optional TV Voice Bridge microphone.',
  });
}
