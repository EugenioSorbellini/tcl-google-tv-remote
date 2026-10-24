# Changelog

## 0.1.0 — unreleased

- First standalone release, extracted from a Home Assistant installation's local TV remote card.
- Physical TCL RC833A-style layout built on Universal Remote Card, with the layout, styles and actions built in.
- `variant: tcl` (default) opens the TCL broadcast tuner from Live TV; `variant: google_tv` sends the Android `TV` key. `live_tv_source` overrides both.
- Optional TV Voice Bridge microphone (styling interface v1), added when its card is registered; `microphone: false` hides it.
- `custom_actions` replace built-in buttons by name.
- English and Italian labels and messages.
