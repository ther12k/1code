# Capability: custom-providers

## Purpose
Let users route Claude and Codex traffic through user-controlled LLM gateways
that expose OpenAI- or Anthropic-compatible APIs, instead of the public
first-party endpoints.

## ADDED Requirements

### Requirement: Provider Storage
The system SHALL persist user-defined custom providers in a `custom_providers`
SQLite table with the following columns:
- `id` (text, primary key)
- `name` (text, non-empty)
- `type` (text, non-empty, ∈ {"anthropic", "openai"})
- `base_url` (text, non-empty, valid URL)
- `api_key_encrypted` (text, non-empty, base64 of Electron safeStorage ciphertext)
- `default_model` (text, nullable)
- `models_json` (text, JSON array of model id strings)
- `enabled` (boolean, default true)
- `created_at` and `updated_at` (timestamps)

The api_key SHALL be encrypted with Electron `safeStorage` before write and
ONLY decrypted at the moment the provider is resolved for an outbound
request. The renderer SHALL NOT receive the decrypted key.

### Requirement: Provider CRUD
The system SHALL expose a tRPC router `customProviders` with these procedures:
- `list()` — returns all providers as PublicProvider objects
  (no decrypted key; `hasApiKey: boolean` flag instead)
- `get({id})` — returns one provider by id, or null
- `create(input)` — validates input, encrypts apiKey, persists, returns
  PublicProvider
- `update({id, ...patch})` — partial update; only re-encrypts if a new
  apiKey is supplied
- `delete({id})` — removes the row
- `testConnection({id})` — fetches `${baseUrl}/v1/models` with both
  `x-api-key` and `Authorization: Bearer` headers, returns
  `{ok, models[], error?}`. On success, persists discovered models to
  `models_json`.

### Requirement: Claude Routing
When the Claude chat subscription procedure receives `customProviderId`:
1. The router SHALL resolve the provider via `resolveCustomProvider(id)`.
2. If `type === "anthropic"`, the router SHALL inject
   `ANTHROPIC_BASE_URL` (provider.baseUrl) and `ANTHROPIC_AUTH_TOKEN`
   (decrypted provider.apiKey) into the Claude SDK subprocess env.
3. If `type !== "anthropic"`, the router SHALL emit a warning message to
   the chat stream and skip injection.
4. Precedence: `offline (Ollama) > customProvider > explicit customConfig`.

### Requirement: Codex Routing
When the Codex chat subscription procedure receives `customProviderId`:
1. The router SHALL resolve the provider via `resolveCustomProvider(id)`.
2. If `type === "openai"`, the router SHALL inject `OPENAI_BASE_URL`
   and `OPENAI_API_KEY` into the bundled Codex CLI subprocess env.
3. If `type !== "openai"`, the router SHALL skip injection.

### Requirement: UI
The system SHALL provide a "Custom Providers" sidebar entry in Preferences,
positioned between Models and Skills. The tab SHALL:
- List all configured providers with: name, type badge, baseUrl, default
  model (if set), discovered model count
- Provide an Add form with fields: Name, Protocol dropdown (OpenAI or
  Anthropic), Base URL, API Key (password), Default model (optional)
- Provide a Test button per provider that calls `testConnection` and
  displays the result inline
- Provide a Delete button per provider with a confirmation dialog
- Show the discovered model list as an expandable disclosure under each
  provider after a successful test

### Requirement: Security
- API keys SHALL be stored encrypted with Electron `safeStorage`
- The renderer SHALL never receive the raw key; the list/get procedures
  SHALL return `hasApiKey: boolean` instead of the key value
- The `resolveCustomProvider` helper is internal-only (not exposed via
  tRPC) and decrypts only at the call site in the Claude / Codex routers
