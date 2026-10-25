# Remote Card for TCL Google TV

A Home Assistant dashboard card that looks and works like the TCL Google TV voice remote (RC833A): mute/power, a 0–9 keypad, the navigation wheel with OK, joined volume and channel rockers, Back/Home, Settings/Live TV, a central microphone, Netflix/Prime Video/Disney+/YouTube shortcuts, and a keyboard/playback row.

It is designed for TCL TVs first. Set `variant: google_tv` to use it with other Google TV and Android TV devices.

<img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/screenshot.png" alt="The remote card in a Home Assistant dashboard popup, with the TV Voice Bridge microphone in the centre" width="320">

The card adapts between phone and desktop sizes (up to 400 px wide) and fits short phone screens such as 320 × 568 without scrolling. It works well inside a [Bubble Card](https://github.com/Clooos/Bubble-Card) popup.

## Requirements

- Home Assistant **2026.10.2 or later** with the **Android TV Remote** integration configured and paired.
- [Universal Remote Card](https://github.com/Nerwyn/universal-remote-card) installed from HACS. This card provides the layout and styling; Universal Remote Card sends the commands.
- Optional: [TV Voice Bridge](https://github.com/EugenioSorbellini/tv-voice-bridge) **v1.0.0 or later** (v1.2.2 or later recommended on Home Assistant 2026.10.3+) for the microphone button. Without it, the remote works and the microphone spot stays empty.

HACS cannot install dashboard-card dependencies automatically, so install Universal Remote Card first.

## Installation with HACS

1. In HACS, add `https://github.com/EugenioSorbellini/tcl-google-tv-remote` as a **custom repository**, category **Dashboard**.
2. Download **Remote Card for TCL Google TV**. HACS registers the dashboard resource.
3. Refresh the browser, then add **Remote Card for TCL Google TV** from the card picker or use the YAML below.

For a manual installation, copy `tcl-google-tv-remote.js` to `/config/www/` and add `/local/tcl-google-tv-remote.js` as a JavaScript module dashboard resource.

## Configuration

```yaml
type: custom:tcl-google-tv-remote
remote_id: remote.living_room_tv
media_player_id: media_player.living_room_tv
```

| Option | Default | Description |
|---|---|---|
| `remote_id` | required | The Android TV Remote `remote.*` entity. The microphone uses the same TV. |
| `media_player_id` | none | The matching `media_player.*` entity, passed to Universal Remote Card. |
| `variant` | `tcl` | `tcl` or `google_tv`. Selects what the Live TV button does (see below). |
| `live_tv_source` | none | A custom app link for the Live TV button, overriding `variant`. |
| `microphone` | `true` | Set to `false` to hide the TV Voice Bridge microphone. |
| `microphone_activation` | `hold` | `hold` to talk while held, or `toggle` to press once to start and again to send. |
| `custom_actions` | none | Universal Remote Card actions that replace built-in buttons with the same `name`. |

### Live TV button

| Variant | Tap | Hold |
|---|---|---|
| `tcl` | Opens `app://com.tcl.tv/tune`, the TCL TV app's broadcast tuner | Sends `GUIDE` (programme guide) |
| `google_tv` | Sends the Android `TV` key | Sends `GUIDE` |

The TCL link comes from the TCL TV app's own intent filters and opened live channels directly on a TCL C-series TV. The generic `TV` key did nothing on that model, which is why `tcl` uses the app link. Other TCL models may use a different TV app; use `live_tv_source` if the default does not work.

### Changing buttons

Button names are `volume_mute`, `power`, `n0`–`n9`, `volume_up`, `volume_down`, `circlepad`, `channel_up`, `channel_down`, `back`, `home`, `settings`, `tv`, `netflix`, `primevideo`, `disney`, `youtube`, `keyboard`, `rewind`, `play_pause` and `fast_forward`. The layout is fixed, because the microphone is positioned from it. To change what a button does, override it by name:

```yaml
type: custom:tcl-google-tv-remote
remote_id: remote.living_room_tv
custom_actions:
  - type: button
    name: disney
    icon: mdi:television-play
    label: RaiPlay
    tap_action:
      action: source
      source: https://www.raiplay.it
```

An override replaces the whole built-in button, including its icon and label. A name that isn't in the list above is reported as a configuration error. See Universal Remote Card's documentation for the action format.

Keyboard input requires the Android TV Remote integration's IME option. App shortcuts and key behaviour depend on the TV and its installed apps.

### In a Bubble Card popup

With [Bubble Card](https://github.com/Clooos/Bubble-Card) installed, put the remote in a popup and open it from any button that navigates to the popup's hash. This example was tested with Bubble Card v3.4.2:

```yaml
- type: button
  name: Remote
  icon: mdi:remote-tv
  tap_action:
    action: navigate
    navigation_path: "#tv-remote"
- type: custom:bubble-card
  card_type: pop-up
  hash: "#tv-remote"
  name: Living room TV
  icon: mdi:remote-tv
  popup_mode: adaptive-dialog
  popup_style: home-assistant
  width_desktop: 520px
  close_by_clicking_outside: true
  slide_to_close: header
  cards:
    - type: custom:tcl-google-tv-remote
      remote_id: remote.living_room_tv
      media_player_id: media_player.living_room_tv
```

Both cards go in the same view's `cards` list. The popup options other than `card_type`, `hash` and `cards` are optional; see Bubble Card's documentation.

## Language

Accessible button labels and card messages follow the Home Assistant user's language. English and Italian are included; other languages fall back to English. The microphone localizes itself.

## Development

```sh
npm run check
npm test
npm ci && npx playwright install chromium-headless-shell
npm run test:browser
```

`npm test` uses a minimal DOM stand-in. `npm run test:browser` downloads Universal Remote Card (`URC_REF=latest` by default, or `main` or a release tag), renders the card on it in headless Chromium with a stand-in `hass`, and checks that every button is shown and sends the expected command. It saves a screenshot to `test-results/`. Neither needs Home Assistant. Before a release, also check the card visually in a Home Assistant popup and full-page view at desktop and phone sizes.

To release, update `VERSION` in `tcl-google-tv-remote.js`, `package.json` and `CHANGELOG.md`, then publish a GitHub release tagged `vX.Y.Z`. The release workflow checks that the tag matches.

## License

MIT. TCL, Google TV, Netflix, Prime Video, Disney+ and YouTube are trademarks of their respective owners. This project is not affiliated with or endorsed by them.
