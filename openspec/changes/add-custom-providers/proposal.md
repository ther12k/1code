# Change: add-custom-providers

## Why
Users on air-gapped, proxied, or data-residency-constrained networks cannot
route Claude or Codex traffic through the public Anthropic / OpenAI endpoints.
They need a way to point both code paths at their own LLM gateway — e.g.
9router at `https://9router.halotec.my.id/v1`, OpenRouter, LiteLLM, or a
self-hosted vLLM instance. The existing Override Model UI is Claude-only,
doesn't store credentials securely, and has no /v1/models probe.

## What Changes
- **NEW** SQLite table `custom_providers` (id, name, type, base_url,
  api_key_encrypted, default_model, models_json, enabled, timestamps)
- **NEW** tRPC router `customProviders` with `list`, `get`, `create`,
  `update`, `delete`, `testConnection`
- **NEW** UI section "Custom Providers" in Preferences sidebar (between
  Models and Skills) — Add form, list with Test button, Delete with confirm
- **MODIFIED** Claude chat subscription accepts optional `customProviderId`;
  when set and `type === "anthropic"`, decrypts the key and injects
  `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` into the SDK env
- **MODIFIED** Codex chat subscription accepts optional `customProviderId`;
  when set and `type === "openai"`, injects `OPENAI_BASE_URL` +
  `OPENAI_API_KEY` into the bundled Codex CLI subprocess env
- **NEW** `resolveCustomProvider(id)` helper exported from the custom
  providers router; returns decrypted credentials or `null` for callers
  in the Claude and Codex routers
- **MODIFIED** `electron.vite.config.ts` already includes the
  `shikijsThemeFallback` plugin (pre-existing dependency quirk — see ADR 0001)

## Impact
- Affected specs: `custom-providers` (new), `claude-chat`,
  `codex-chat`
- Affected code:
  - `src/main/lib/db/schema/index.ts` (add table)
  - `drizzle/0008_custom_providers.sql` (migration)
  - `src/main/lib/trpc/routers/custom-providers.ts` (new)
  - `src/main/lib/trpc/routers/index.ts` (mount router)
  - `src/main/lib/trpc/routers/claude.ts` (customProviderId param,
    resolve + env injection)
  - `src/main/lib/trpc/routers/codex.ts` (customProviderId param,
    resolve + env injection — schema added in US-020; full env
    injection pending US-020 completion)
  - `src/renderer/components/dialogs/settings-tabs/agents-custom-providers-tab.tsx` (new)
  - `src/renderer/features/settings/settings-sidebar.tsx` (new tab entry)
  - `src/renderer/features/settings/settings-content.tsx` (route tab)
  - `src/renderer/lib/atoms/index.ts` (add `custom-providers` to SettingsTab)
- Backwards compatibility: the existing `Override Model` UI (per-chat
  `customConfig` input) continues to work unchanged. New
  `customProviderId` is a strictly additional input field.
