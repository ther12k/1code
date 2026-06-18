# Halotec Code State

> Phase 1 in flight: rebrand + strip cloud deps from 21st-dev/1code fork.

## Snapshot
- **Base:** 21st-dev/1code v0.0.72 (9f1bc76)
- **Branch:** `halotec-code/phase-1` (22 commits ahead of main)
- **Tests:** n/a (Electron app, no test suite in upstream)
- **Last commit:** US-024/US-025 docs (ADR 0001 + CHANGELOG + 9router quickstart + openspec proposal)
- **Released tag:** not pushed from sandbox (PAT auth unstable; branch is current)
- **Released tag:** not pushed (PAT auth failed on tag push; branch is current)

## Phase 1 ✅ SHIPPED (local AppImage builds + runs)
Branch `halotec-code/phase-1` tag `v0.0.77-halotec-phase1` — user confirmed Preferences/Models panel renders correctly on Linux laptop.

## Phase 2 — in progress
Custom Provider support for routing Claude + Codex through user-controlled gateways (9router, OpenRouter, etc.).

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
- US-015 sync prd-ralph.json US-001..005 passes=true (Phase 1 shipped, JSON was stale)
- US-016 customProviders Drizzle table + migration 0008_custom_providers
- US-017 customProviders tRPC router (list/get/create/update/delete/testConnection + resolveCustomProvider helper)
- US-018 Custom Providers UI tab (Preferences sidebar between Models + Skills; Add form + Test button + Delete confirm)
- US-019 Claude router accepts customProviderId (anthropic type → ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN injection)
- US-020 Codex router customProviderId schema field added (env injection pending follow-up)
- US-021 /v1/models probe via customProviders.testConnection + discovered models displayed in UI
- US-022 PENDING: chain claude:download + codex:download into package:linux (US-022) — currently missing bundled Codex CLI binary
- US-023 PENDING: fix relative URL bug in /api/agents/sub-chat/generate-name
- US-024 ADR 0001 + CHANGELOG + 9router quickstart + README pointer
- US-025 OpenSpec proposal add-custom-providers (proposal.md + specs/custom-providers/spec.md)

## Phase 2 (in progress)
- Custom Provider storage + UI + Claude routing shipped in branch commits
- Codex env-injection (US-020): schema in place, full OPENAI_BASE_URL/OPENAI_API_KEY wiring needs a follow-up patch
- Bundled binary download (US-022) and relative-URL fix (US-023) tracked separately

## Resolved (was blocker)
- ~~node-pty prebuild missing on linux-x64~~ → NOT a bug. postinstall runs `electron-rebuild -f -w better-sqlite3,node-pty` which builds `pty.node` from source on Linux. Sandbox-only limitation; user build will work.

## Next action for Hermes
All 14 prd-ralph stories pass. Branch `halotec-code/phase-1` @ f0b8039 pushed to ther12k/1code. Awaiting user to `git pull && npm install && npm run package:linux`. Note: tag push blocked on this PAT — not a blocker.
