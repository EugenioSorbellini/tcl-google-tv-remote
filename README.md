# Remote Card for TCL Google TV

[![Coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2FEugenioSorbellini%2Ftcl-google-tv-remote%2Fbadges%2Fcoverage.json)](https://github.com/EugenioSorbellini/tcl-google-tv-remote/actions/workflows/validate.yml)

A Home Assistant dashboard card that looks and works like the TCL Google TV voice remote (RC833A). It is designed for TCL TVs; set `variant: google_tv` for other Google TV and Android TV devices.

<img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/screenshot.png" alt="The remote card in a Home Assistant dashboard popup, with the TV Voice Bridge microphone in the centre" width="320">

The card is up to 400 px wide and tightens on shorter phone screens, down to 320 × 568 without scrolling:

<table>
  <tr>
    <td align="center" valign="bottom"><img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/desktop.png" alt="The remote card on a desktop screen" width="200"><br><sub>Desktop</sub></td>
    <td align="center" valign="bottom"><img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/phone.png" alt="The remote card on a 390 × 844 phone screen" width="179"><br><sub>390 × 844</sub></td>
    <td align="center" valign="bottom"><img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/phone-compact.png" alt="The remote card on a 360 × 740 phone screen" width="164"><br><sub>360 × 740</sub></td>
    <td align="center" valign="bottom"><img src="https://raw.githubusercontent.com/EugenioSorbellini/tcl-google-tv-remote/main/docs/phone-short.png" alt="The remote card on a 320 × 568 phone screen" width="144"><br><sub>320 × 568</sub></td>
  </tr>
</table>

## Requirements

- Home Assistant **2026.10.2** or later, with the **Android TV Remote** integration set up and paired.
- [Universal Remote Card](https://github.com/Nerwyn/universal-remote-card), installed first from HACS. It sends the commands; this card provides the layout.
- Optional: [TV Voice Bridge](https://github.com/EugenioSorbellini/tv-voice-bridge) for the microphone. Without it, the microphone spot stays empty.

## Installation

[![Open your Home Assistant instance and open this repository in HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=EugenioSorbellini&repository=tcl-google-tv-remote&category=plugin)

1. Click the button above, or in HACS add `https://github.com/EugenioSorbellini/tcl-google-tv-remote` as a custom repository (category **Dashboard**). Then download **Remote Card for TCL Google TV**.
2. Refresh the browser and add the card from the card picker, or use the YAML below.

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
| `media_player_id` | none | The matching `media_player.*` entity. |
| `variant` | `tcl` | `tcl` or `google_tv`. Sets what the Live TV button does. |
| `live_tv_source` | none | A custom app link for the Live TV button, overriding `variant`. |
| `microphone` | `true` | `false` hides the TV Voice Bridge microphone. |
| `microphone_activation` | `hold` | `hold`: talk while pressed. `toggle`: press once to start, again to send. |
| `custom_actions` | none | Universal Remote Card actions that replace built-in buttons with the same `name`. |

### Live TV button

With `tcl`, a tap opens `app://com.tcl.tv/tune`, the TCL TV app's tuner; the generic `TV` key did nothing on a TCL C-series TV. With `google_tv`, a tap sends the `TV` key. A hold sends `GUIDE` in both. If your TCL model uses a different TV app, set `live_tv_source`.

### Changing buttons

Override a button by its name: `volume_mute`, `power`, `n0`–`n9`, `volume_up`, `volume_down`, `circlepad`, `channel_up`, `channel_down`, `back`, `home`, `settings`, `tv`, `netflix`, `primevideo`, `disney`, `youtube`, `keyboard`, `rewind`, `play_pause` or `fast_forward`. The override replaces the whole button; the layout itself is fixed.

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

See Universal Remote Card's documentation for the action format. Keyboard input needs the Android TV Remote integration's IME option.

### In a Bubble Card popup

With [Bubble Card](https://github.com/Clooos/Bubble-Card) (tested with v3.4.2), add both cards to the same view and open the popup from any button:

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
  width_desktop: 520px
  cards:
    - type: custom:tcl-google-tv-remote
      remote_id: remote.living_room_tv
      media_player_id: media_player.living_room_tv
```

## Language

Button labels and messages follow your Home Assistant language (English and Italian; others fall back to English).

## Development

```sh
npm run check
npm test
npm run coverage
npm ci && npx playwright install chromium-headless-shell
npm run test:browser
npm run screenshots
```

`npm test` uses a minimal DOM stand-in; `npm run coverage` runs it with coverage for the README badge. `npm run test:browser` renders the card on Universal Remote Card (`URC_REF=latest`, `main` or a release tag) in headless Chromium and checks every button's command. `npm run screenshots` updates the images in `docs/`. None of them need Home Assistant; before a release, also check the card in a real dashboard at desktop and phone sizes.

To release, update the version in `tcl-google-tv-remote.js`, `package.json` and `CHANGELOG.md`, then publish a GitHub release tagged `vX.Y.Z`.

## License

MIT. TCL, Google TV, Netflix, Prime Video, Disney+ and YouTube are trademarks of their respective owners. This project is not affiliated with or endorsed by them.
