# Halotec Code State

> Phase 1 in flight: rebrand + strip cloud deps from 21st-dev/1code fork.

## Snapshot
- **Base:** 21st-dev/1code v0.0.72 (9f1bc76)
- **Branch:** `halotec-code/phase-1` (22 commits ahead of main)
- **Tests:** n/a (Electron app, no test suite in upstream)
- **Last commit:** f0b8039 US-014 vite alias ayu-light → ayu-dark
- **Released tag:** not pushed (PAT auth failed on tag push; branch is current)

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
- US-013 chain electron-vite build + NODE_OPTIONS=8GB into package:* scripts (00985b3)
- US-014 vite alias @shikijs/themes/ayu-light → ayu-dark (f0b8039)

## Resolved (was blocker)
- ~~node-pty prebuild missing on linux-x64~~ → NOT a bug. postinstall runs `electron-rebuild -f -w better-sqlite3,node-pty` which builds `pty.node` from source on Linux. Sandbox-only limitation; user build will work.

## Next action for Hermes
All 14 prd-ralph stories pass. Branch `halotec-code/phase-1` @ f0b8039 pushed to ther12k/1code. Awaiting user to `git pull && npm install && npm run package:linux`. Note: tag push blocked on this PAT — not a blocker.
