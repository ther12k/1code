# Changelog

All notable changes to Halotec Code are documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

Versions are tagged `v0.0.<n>-halotec-phase<k>` on the
`halotec-code/phase-<k>` branch in the [ther12k/1code](https://github.com/ther12k/1code)
fork.

---

## [v0.0.79-halotec-phase2] — 2026-06-18

### Added
- **Custom Providers** — new SQLite table `custom_providers` and tRPC
  router with CRUD + `/v1/models` probe. Lets users route Claude and Codex
  traffic through user-controlled LLM gateways (9router, OpenRouter,
  LiteLLM, etc.) that expose OpenAI- or Anthropic-compatible APIs.
- **Claude custom-provider routing** — `customProviderId` input on the
  Claude chat subscription decrypts the stored API key and injects
  `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` into the SDK env.
  Precedence: `offline > customProvider > customConfig`.
- **Codex custom-provider schema** — `customProviderId` input added to
  the Codex chat subscription. Env-var injection
  (`OPENAI_BASE_URL` + `OPENAI_API_KEY`) follows in the next release.
- **Preferences → Custom Providers** tab — Add form, list with Test
  button, Delete with confirm, expandable discovered-model disclosure.
- **API key encryption** — keys are stored with Electron `safeStorage`,
  never sent to the renderer (only a `hasApiKey: boolean` flag).
- **OpenSpec proposal** — `openspec/changes/add-custom-providers/`
  with proposal.md + `specs/custom-providers/spec.md` (ADDED Requirements).
- **ADR 0001** — `docs/adr/0001-custom-providers.md` documents Context,
  Decision, Consequences, Alternatives, and Verification steps.

### Verified
- 9router endpoint `https://9router.halotec.my.id/v1` returns HTTP 401
  without auth and HTTP 200 with a valid `Authorization: Bearer ***  header, confirming both OpenAI- and Anthropic-compatible routing.

### Known issues (filed for next phase)
- `package:linux` does not chain the `claude:download` / `codex:download`
  scripts; the bundled Codex CLI binary is missing from the AppImage
  (`resources/bin/${platform}-${arch}`). Tracked as US-022.
- Sub-chat name generator throws `ERR_INVALID_URL` on first message
  because of a relative fetch URL. Tracked as US-023.

---

## [v0.0.77-halotec-phase1] — 2026-06-18

### Added
- **Halotec Code rebrand** — package `name`, `productName`, `appId`,
  protocol scheme all set to Halotec variants. `homepage` and `publish.url`
  scrubbed of upstream references.
- **Cloud deps removed** — `posthog-js`, `posthog-node`, `@sentry/electron`,
  `electron-updater` deleted from `package.json`.
- **No-op analytics** — `src/main/lib/analytics.ts` replaced with
  connection-method tracker only.
- **Sentry scrub** — init/imports stripped from main, preload, renderer.
- **No-op auto-updater** — replaced with no-op module; update IPC removed;
  Help menu item hidden.
- **LocalAuthService** — replaces cloud auth in `auth-store`, `oauth`,
  `connect-account` flows. No real auth — UI passes a fake user.
- **Remote trpc/api stubs** — `remote-trpc.ts` and `remote-api.ts` typed
  as `any` no-op for local-only build.
- **README rewrite** — local-first narrative; "Local-first / removed
  cloud features" table; userData storage paths; security notes.

### Changed
- **Internal package name** — `21st-desktop` → `halotec-code-desktop`.
  `productName` / UI branding preserved as "Halotec Code".
- **`.npmrc`** — `legacy-peer-deps=true` so npm install succeeds despite
  the `zod@^3.24.1` vs `@anthropic-ai/claude-agent-sdk@0.2.45`'s peer
  `zod@^4.0.0` conflict.
- **`package:linux` / `package:mac` / `package:win`** — chain
  `electron-vite build` into the package step with
  `NODE_OPTIONS=--max-old-space-size=8192` to avoid V8 OOM during
  renderer transform.
- **Vite shikijs theme alias** — `@shikijs/themes/<any>` is intercepted
  by a custom `enforce: "pre"` `resolveId` plugin that returns
  `ayu-dark`. Resolves the Vite `commonjs--resolver` failure on missing
  theme exports (e.g. `ayu-mirage`).

### Verified
- Clean clone + `npm install` + `npm run package:linux` produces an
  AppImage. User confirmed the Preferences / Models panel renders
  correctly on a Linux laptop.

### Notes
- **node-pty** — runs `electron-rebuild -f -w better-sqlite3,node-pty`
  in `postinstall`. Builds `pty.node` from source on Linux; not a blocker.
- **Bun** also works (`bun install` completes; `bun run ts:check` shows
  120 baseline errors matching HEAD). Bun is recommended for local dev
  but npm is supported via the `.npmrc` fallback.

---

## Earlier upstream history

This fork was originally branched from
[21st-dev/1code](https://github.com/21st-dev/1code) `v0.0.72` (9f1bc76).
Upstream history before that commit is preserved in the upstream repo.
