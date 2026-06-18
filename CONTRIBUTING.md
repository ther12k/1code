# Contributing to Halotec Code

## Building from Source

Prerequisites: Bun, Python, Xcode Command Line Tools (macOS)

```bash
bun install
bun run dev      # Development with hot reload
bun run build    # Production build
bun run package:mac  # Create distributable
```

## Local-First Fork

This is the **local-first fork** of [1Code](https://github.com/21st-dev/1code)
maintained by Halotec. It does not contact any remote backend, telemetry
service, or update server. All cloud-only features from the upstream build
have been removed or stubbed (see the README "Removed cloud features"
section for the full list).

For the upstream hosted build with cloud sync, Pro/Max tiers, background
agents, and the auto-updater, see the upstream project.

## Removed Cloud Features

The following upstream features are intentionally absent in this fork:

- Cloud authentication (token exchange, refresh)
- Posthog / Sentry telemetry
- In-app auto-updates
- Subscription billing (Pro / Max)
- Background cloud agents
- Remote sandbox imports
- Hosted API task UI

Any code paths that previously called these backends are now local-only
stubs that no-op or return safe empty defaults.

## Analytics & Telemetry

Analytics (PostHog) and error tracking (Sentry) are **not present** in
this fork. The analytics modules have been replaced with no-op exports
and the Sentry init code has been stripped from the main, preload, and
renderer entry points.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR
