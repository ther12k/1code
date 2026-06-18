# Halotec Code State

> Phase 1 in flight: rebrand + strip cloud deps from 21st-dev/1code fork.

## Snapshot
- **Base:** 21st-dev/1code v0.0.72 (9f1bc76)
- **Branch:** `halotec-code/phase-1` (10 commits ahead of main)
- **Tests:** n/a (Electron app, no test suite in upstream)
- **Last commit:** 5a7275d US-009 install tsgo + build pipeline validates

## Completed Phases
- US-001 rebrand package.json (b00c2e1)
- US-002 remove posthog/sentry/electron-updater deps (22486eb)
- US-003 no-op analytics.ts main + renderer (752bb4a)
- US-004 strip Sentry init/imports from main/preload/renderer (fa461f8)
- US-005 no-op auto-updater + drop update IPC + hide menu item (7c91f7f)
- US-006 LocalAuthService shim re-export, scrub auth cloud coupling (48307b0)
- US-007 stub remote-trpc + remote-api as no-op for local-only (7c0a563)
- US-008 rg sweep: 0 hits in src/ + package.json + CONTRIBUTING (955e0a1)
- US-009 install tsgo devDep + validate bun install + ts:check + build (5a7275d)

## Next action for Hermes
Run US-010: rewrite README.md as a local-first narrative. Must include a "Local-first / removed cloud features" section listing telemetry / Sentry / auto-update / cloud auth / Pro-Max-subscription / background cloud agents / hosted API. Must note where local data is stored (userData, ~/.halotec-code). Will also close the 7 remaining rg hits in README.md (US-008 deferred this to US-010).
