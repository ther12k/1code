# Halotec Code

Local-first fork of [1Code](https://github.com/21st-dev/1code) by 21st.dev.
Desktop UI for running Claude Code and Codex coding agents on your own
machine, with all cloud-only features removed.

> **Custom Providers** (Phase 2): route Claude and Codex through your own
> LLM gateway — see [9router Quickstart](docs/9router-quickstart.md) or
> [ADR 0001](docs/adr/0001-custom-providers.md). Verified endpoint:
> `https://9router.halotec.my.id/v1`.
>
> See [`CHANGELOG.md`](CHANGELOG.md) for release notes and
> `openspec/changes/add-custom-providers/` for the formal proposal.

## What this fork does

- Runs Claude Code and Codex in isolated local git worktrees
- Visual UI for diffs, file viewing, terminal, and git operations
- BYOK (bring your own API keys) for Claude / OpenAI / custom providers
- MCP server management and a local plugin marketplace
- Plan mode with markdown preview, extended thinking, sub-agents
- Skills, slash commands, file mentions, message queue, voice input
- Local-only data — nothing leaves your machine unless an external
  tool (git remote, npm publish, etc.) makes it leave

## Local-first / removed cloud features

The upstream 1Code build talks to several cloud services. **This fork
does not.** Every cloud-only feature has been either removed entirely
or replaced with a local-only stub:

| Removed feature | Upstream behavior | This fork |
|---|---|---|
| Telemetry (Posthog) | Sent client analytics to Posthog | No-op `analytics.ts`; no Posthog import |
| Error tracking (Sentry) | Sent errors to Sentry via `@sentry/electron` | All Sentry init/imports stripped |
| In-app auto-updates (`electron-updater`) | Checked `cdn.21st.dev` on launch | No-op `auto-updater.ts`; no IPC for updates; "Check for Updates" menu hidden |
| Cloud auth (token exchange, refresh) | OAuth flow against 21st.dev | Local `LocalAuthService` (always-signed-in local identity) |
| Pro / Max subscription gating | Gates automations + background agents behind `subscription.type !== "free"` | Subscription check returns `{ type: "free" }`; no paid gating |
| Background cloud agents | Cloud sandboxes running when laptop sleeps | Stub `remote-trpc.ts` + `remote-api.ts` return empty; no background agents |
| Hosted API task UI (`POST /api/v1/tasks`) | curl-able remote API for firing agents | Not present — `1code.dev` external links removed |
| Hosted changelog / help links | `1code.dev/agents/changelog`, Discord support | Removed — UI components keep their shell but `openExternal` calls are no-ops |

The app's CSP (`src/renderer/index.html`) drops `*.posthog.com` and
`*.21st.dev` from `script-src` and `connect-src` — no third-party
network requests are permitted at the browser level.

## Where your data lives

All persistent state is stored on the local filesystem under Electron's
`app.getPath('userData')`, which resolves per-platform:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/id.halotec.code/` |
| Linux | `~/.config/id.halotec.code/` |
| Windows | `%APPDATA%\id.halotec.code\` |

Inside that directory:

- `local.db` — SQLite database (Drizzle schema in `src/main/lib/db/schema/`)
- `Cache/`, `Code Cache/`, `GPUCache/` — Chromium caches
- `Preferences`, `Local State` — Electron preferences
- `IndexedDB/` — renderer-side persistent storage (if used)

Additional state:

- **Git worktrees** — created on demand inside the repos you point the app at
- **Claude Code / Codex binaries** — downloaded into the app's `resources/bin/` on first build
- **Voice transcripts** — stored in SQLite `local.db` (no cloud transcription)
- **No remote backups.** If you delete `id.halotec.code/`, all local
  state is gone. Back up this directory if you need to preserve chats.

There is no remote backup, no cloud sync, and no account-based recovery.
A fresh install starts with a blank local database.

## Installation

### Build from source

Prerequisites: Bun, Python 3.11, Xcode Command Line Tools (macOS)

```bash
bun install
bun run claude:download  # Download Claude binary (required for agent functionality)
bun run codex:download   # Download Codex binary (required for agent functionality)
bun run build
bun run package:mac  # or package:win, package:linux
```

> **Important:** `claude:download` and `codex:download` download the agent
> binaries that the app launches when you start a chat. Without them,
> the app builds but agent functionality won't work.
>
> **Python note:** Python 3.11 is recommended for the native module
> rebuild step (`electron-rebuild`). On Python 3.12+, ensure `setuptools`
> is installed (`pip install setuptools`).

### Distribution

This fork is distributed out-of-band from an internal package
repository — there is no public download page, no auto-update channel,
and no hosted release artifacts. See your Halotec operator for the
current release artifact and signature.

## Development

```bash
bun install
bun run claude:download  # First time only
bun run codex:download   # First time only
bun run dev
```

Other useful commands:

```bash
bun run ts:check   # TypeScript via tsgo (requires @typescript/native-preview devDep)
bun run build      # Production build (electron-vite)
bun run package:mac
```

## Security notes

- The app's CSP blocks third-party scripts and connections except `unpkg.com` (used for some Markdown rendering) and `localhost` (dev server).
- Main process IPC validates message origins against `['localhost', '127.0.0.1']` only.
- Local auth is a stub — there is no real authentication. Do not run the app on a multi-user system without OS-level access controls.
- Voice transcription requires `OPENAI_API_KEY` in the environment; the app does not transcribe via any other service.
- No telemetry, no remote error reporting, no auto-update calls.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the local-first contribution
guide. The fork is maintained by Halotec; PRs against the upstream
21st-dev/1code repo are the right venue for changes that should apply
to both.

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details. Upstream
copyright 21st.dev is preserved in the file history; modifications
for the Halotec fork are documented in the git log on the
`halotec-code/phase-1` branch.

## Upstream

[github.com/21st-dev/1code](https://github.com/21st-dev/1code) — the
hosted, cloud-enabled version with Pro/Max tiers, background agents,
and a public API. This fork is built from `v0.0.72` and stripped of
those capabilities.
