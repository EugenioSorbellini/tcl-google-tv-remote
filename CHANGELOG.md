# Changelog

## 0.1.3 — 2026-10-25

- Fix `custom_actions` overrides for `rewind`, `play_pause` and `fast_forward`, which were silently ignored.
- A `custom_actions` entry with an unknown button name is now a configuration error instead of doing nothing.
- `variant` no longer accepts JavaScript object keys such as `constructor`, and `live_tv_source` must be a non-empty link.
- CI renders the card on the real Universal Remote Card (latest release and main) in headless Chromium and presses its buttons, and repeats this weekly.

## 0.1.2 — 2026-10-24

- Rename the card to "Remote Card for TCL Google TV" in HACS, the card picker and the README, so the name reads as compatibility rather than an official TCL or Google product. The card type, file name and repository are unchanged, so existing dashboards keep working.

## 0.1.1 — 2026-10-24

- Add a screenshot to the README, linked by absolute URL so it also renders in the HACS README view. HACS validation now runs all checks, including the README image check.
- No card changes.

## 0.1.0 — 2026-10-24

- First standalone release, extracted from a Home Assistant installation's local TV remote card.
- Physical TCL RC833A-style layout built on Universal Remote Card, with the layout, styles and actions built in.
- `variant: tcl` (default) opens the TCL broadcast tuner from Live TV; `variant: google_tv` sends the Android `TV` key. `live_tv_source` overrides both.
- Optional TV Voice Bridge microphone (styling interface v1), added when its card is registered; `microphone: false` hides it.
- `custom_actions` replace built-in buttons by name.
- English and Italian labels and messages.
