# Halotec Code State

> Phase 1 in flight: rebrand + strip cloud deps from 21st-dev/1code fork.

## Snapshot
- **Base:** 21st-dev/1code v0.0.72 (9f1bc76)
- **Branch:** `halotec-code/phase-1` (16 commits ahead of main)
- **Tests:** n/a (Electron app, no test suite in upstream)
- **Last commit:** 80b9939 US-011 package rename
- **Released tag:** `v0.0.73-halotec-phase1` (pushed to ther12k/1code)

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
- US-010 README local-first rewrite: removed-cloud-features table + userData paths (2cfaecc)
- US-011 package.json name 21st-desktop → halotec-code-desktop (80b9939)
- US-012 .npmrc legacy-peer-deps=true for npm users (02eea2e)

## Resolved (was blocker)
- ~~node-pty prebuild missing on linux-x64~~ → NOT a bug. postinstall runs `electron-rebuild -f -w better-sqlite3,node-pty` which builds `pty.node` from source on Linux. Sandbox-only limitation; user build will work.

## Next action for Hermes
All 12 prd-ralph stories pass. Branch + tag `v0.0.74-halotec-phase1` pushed to ther12k/1code fork. Sandbox verified: bun 1.3.14 + npm both install clean, postinstall + electron-rebuild + ts:check all baseline (120 errors). Awaiting user build + GUI verify on laptop.
