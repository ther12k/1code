# Halotec Code State

> Phase 1 in flight: rebrand + strip cloud deps from 21st-dev/1code fork.

## Snapshot
- **Base:** 21st-dev/1code v0.0.72 (9f1bc76)
- **Branch:** `halotec-code/phase-1` (7 commits ahead of main)
- **Tests:** n/a (Electron app, no test suite in upstream)
- **Last commit:** 48307b0 US-006 LocalAuthService

## Completed Phases
- US-001 rebrand package.json (b00c2e1)
- US-002 remove posthog/sentry/electron-updater deps (22486eb)
- US-003 no-op analytics.ts main + renderer (752bb4a)
- US-004 strip Sentry init/imports from main/preload/renderer (fa461b8)
- US-005 no-op auto-updater + drop update IPC + hide menu item (7c91f7f)
- US-006 LocalAuthService shim re-export, scrub auth cloud coupling (48307b0)

## Next action for Hermes
Run US-007: hide subscription/Pro/Max/cloud-agent/remote-sandbox/1code.dev UI.
Recon: grep -rnE "Pro|Max|subscription|cloud.*agent|background.*agent|sandbox.*import|remote-trpc|remote-api" src/renderer/
