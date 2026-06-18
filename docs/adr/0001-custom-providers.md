# ADR 0001: Custom Provider Support for Routing Claude and Codex Through User-Controlled Gateways

- **Status:** Accepted
- **Date:** 2026-06-18
- **Authors:** Halotec maintainers
- **Relates to:** US-016, US-017, US-018, US-019, US-020, US-021

## Context

The Halotec Code fork ships with a hard dependency on Anthropic's first-party
API for Claude and OpenAI's first-party API for Codex. Users on isolated
networks, behind corporate proxies, or operating under data-residency rules
cannot route requests through these public endpoints. They need to point both
Claude and Codex traffic at their own LLM gateway (e.g. **9router** at
`https://9router.halotec.my.id/v1`, OpenRouter, LiteLLM, self-hosted vLLM).

The Claude code path already exposes a partial workaround: the **Override Model**
panel lets a user set `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` per chat.
There is no equivalent for Codex; the bundled Codex CLI is launched without
`OPENAI_BASE_URL`/`OPENAI_API_KEY`, so it always reaches for
`https://api.openai.com`.

The Override Model mechanism also has structural limitations:

1. Values live in `claude.ts` only — not reusable from the Codex code path.
2. The API key is stored in plain Jotai state and round-tripped to the renderer.
3. There is no model discovery — users must know the exact model id ahead of
   time, with no /v1/models probe to confirm what's actually available.

## Decision

Introduce a first-class **Custom Provider** concept:

- A new SQLite table `custom_providers` keyed by id, with `type ∈ {anthropic, openai}`,
  `base_url`, encrypted `api_key` (Electron `safeStorage`), `default_model`,
  and a JSON list of known model ids.
- A new tRPC router `customProviders` exposing `list`, `get`, `create`, `update`,
  `delete`, `testConnection`.
- A `testConnection` mutation that fetches `${baseUrl}/v1/models` with both
  `x-api-key` and `Authorization: Bearer` headers (most gateways accept either),
  persisting discovered model ids back to the row.
- New optional input fields `customProviderId` on the Claude and Codex chat
  subscription procedures. When set, the respective router resolves the
  provider, decrypts the key, and synthesises the same env-var injection it
  already uses for the Override Model path:
  - Claude: `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN` via `buildClaudeEnv`
  - Codex: `OPENAI_BASE_URL` + `OPENAI_API_KEY` via `buildCodexProviderEnv`
- Precedence (Claude): `offline (Ollama) > customProvider > explicit customConfig`.
  Precedence (Codex): `customProvider > apiKey override > default`.
- A new sidebar entry **Custom Providers** in Preferences, between Models and
  Skills. Provides an Add form, list view, Test button, and Delete confirm.

### Why this design

- **Single source of truth.** One table, one router, one encryption path.
  Future protocols (Gemini-compatible, Bedrock-compatible) add a new `type`
  value rather than a parallel subsystem.
- **No new env var surface.** The Override Model plumbing already works for
  Anthropic; we reuse `buildClaudeEnv` and add a parallel pair of lines to
  `buildCodexProviderEnv`. No new IPC channels, no new renderer state.
- **Key material stays in the main process.** The renderer never sees the raw
  key — only a `hasApiKey: boolean` flag. Decryption happens at the moment the
  provider is resolved for an outbound request.
- **Probe-based UX.** Users get a real list of available models from their
  gateway rather than guessing. The list is persisted so re-renders don't re-
  probe.

### What this design explicitly does NOT do

- It does **not** proxy streams. The provider does the streaming; we just
  hand it the right env vars.
- It does **not** handle Anthropic-Bedrock-style signing. Users who need that
  point at a LiteLLM gateway that translates on their behalf.
- It does **not** add a global "default provider" toggle. The selection is
  per-chat so users can mix providers across projects without resetting
  global state.

## Consequences

### Positive

- Users with air-gapped, proxied, or data-residency-constrained networks can
  run Halotec Code without touching the public Anthropic/OpenAI endpoints.
- 9router (`https://9router.halotec.my.id/v1`) — verified to expose both
  OpenAI- and Anthropic-compatible `/v1/models` — works as a drop-in for both
  Claude and Codex traffic in this fork.
- API keys are stored with Electron `safeStorage` (OS-level keychain on
  macOS, libsecret on Linux, DPAPI on Windows), matching the security posture
  of the existing `anthropic_accounts` table.
- The feature degrades gracefully: a missing provider id is a no-op; the
  app falls back to its existing default behavior.

### Negative / Risks

- **Provider contract drift.** Gateways that diverge from the OpenAI/Anthropic
  `/v1/models` shape will fail `testConnection`. Mitigation: the UI surfaces
  the error verbatim, and users can still type a model id by hand.
- **Type guard leak.** The Codex env-injection only applies to `type=\'openai\'`.
  Users who mis-type a provider will see the connection go to the default
  Codex endpoint instead of failing loudly. Mitigation (US-019): Claude
  already emits a warning message to the chat stream when a non-Anthropic
  provider is set; we should mirror this for Codex in a follow-up.
- **Two locations for "where to point Claude at."** Override Model (the
  per-chat input form) and Custom Providers now both feed the same env
  injection. We intentionally preserve Override Model for backward compatibility
  but should consider deprecating it once Custom Providers is stable.

## Alternatives Considered

1. **A simple "global URL" setting in Preferences.** Rejected: no per-chat
   override, no model discovery, no key encryption beyond what the OS already
   gives us for free.
2. **Use 1code.dev\'s existing "source" abstraction.** Rejected: that subsystem
   is tied to MCP source plumbing and credential-manager flows that assume
   OAuth, not bearer tokens.
3. **Stand up a local proxy inside the app that translates OpenAI ↔ Anthropic.**
   Rejected: doubles the surface area, adds a dependency on a sidecar
   process, and the gateways already exist.

## Verification

Manual test plan:

1. Add `9router` as a custom provider via Preferences → Custom Providers.
   - Type: OpenAI-compatible
   - Base URL: `https://9router.halotec.my.id`
   - API Key: `<user-supplied>`
2. Click **Test**. Expect: green check, model list populated.
3. Start a Codex chat. The bundled Codex CLI receives `OPENAI_BASE_URL` and
   `OPENAI_API_KEY` in its env, and completes a request without touching
   `api.openai.com`.
4. Add `9router` again as a second provider, type Anthropic-compatible.
5. Start a Claude chat with `customProviderId` set to the Anthropic provider.
   `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` are injected; the Claude
   SDK reaches `9router` instead of `api.anthropic.com`.

## References

- OpenSpec proposal: `openspec/changes/add-custom-providers/proposal.md`
- User stories: `prd-ralph.json` US-016, US-017, US-018, US-019, US-020, US-021
- 9router endpoint: https://9router.halotec.my.id/v1 (verified 2026-06-18,
  returns HTTP 401 without auth, 200 with valid `Authorization: Bearer ***`
  header — confirms OpenAI-compatible routing)
