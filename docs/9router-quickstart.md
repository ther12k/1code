# 9router Quickstart for Halotec Code

9router is a Halotec-operated LLM gateway that exposes both
**OpenAI-compatible** and **Anthropic-compatible** endpoints under the
same base URL. Verified endpoint:

```
https://9router.halotec.my.id/v1
```

Returns `HTTP 401` without auth and `HTTP 200` with a valid
`Authorization: Bearer ***  header — confirming OpenAI-compatible routing.

This guide shows how to point both Claude and Codex traffic at 9router
through the **Custom Providers** feature.

## 1. Add 9router for Codex (OpenAI-compatible)

1. Open **Preferences → Custom Providers** (sidebar, between Models and Skills).
2. Click **Add provider**.
3. Fill the form:
   - **Name**: `9router`
   - **Protocol**: `OpenAI-compatible`
   - **Base URL**: `https://9router.halotec.my.id`
   - **API Key**: your 9router-issued key (starts with `sk-…`)
   - **Default model**: leave blank, or set to a known 9router model id
4. Click **Save**.
5. Click **Test** next to the new row. You should see a green checkmark
   and a list of available models.

When you start a Codex chat, the bundled Codex CLI receives:

```
OPENAI_BASE_URL=https://9router.halotec.my.id/v1
OPENAI_API_KEY=<your-key>
```

in its subprocess environment. Requests no longer go to
`https://api.openai.com`.

## 2. Add 9router for Claude (Anthropic-compatible)

Repeat the form, but choose **Protocol: Anthropic-compatible** for the
second provider. You can use the same base URL — 9router dispatches by
request shape (Anthropic `/v1/messages` vs OpenAI `/v1/chat/completions`).

When the Claude chat subscription procedure receives `customProviderId`:

- The router resolves the provider and decrypts the stored key.
- It injects `ANTHROPIC_BASE_URL=https://9router.halotec.my.id` and
  `ANTHROPIC_AUTH_TOKEN=<your-key>` into the Claude SDK env.
- Requests reach 9router instead of `https://api.anthropic.com`.

If you accidentally select the wrong protocol, the chat stream emits a
warning message (for Claude) and the call falls back to defaults rather
than failing silently.

## 3. Storage and security

- API keys live in the SQLite database under
  `<userData>/data/agents.db` → `custom_providers.api_key_encrypted`.
- Encryption uses Electron `safeStorage`: Keychain on macOS, libsecret
  on Linux, DPAPI on Windows.
- The renderer never sees the raw key — only a boolean indicating
  whether one is stored.
- The key is decrypted in the main process at the moment the provider
  is resolved for an outbound request.

## 4. Troubleshooting

### "Test" returns HTTP 401
Your API key is wrong, expired, or not yet provisioned in 9router. Check
the 9router admin panel and try again.

### "Test" returns HTTP 404
The base URL is wrong. Make sure the trailing path is **not** included
in the field — enter `https://9router.halotec.my.id`, not
`https://9router.halotec.my.id/v1`. The app appends `/v1/models`
automatically.

### Codex chat still hits `api.openai.com`
The Codex env-injection wires `OPENAI_BASE_URL` and `OPENAI_API_KEY` only
when the provider is `type === "openai"` and the chat subscription
procedure receives `customProviderId`. If your UI isn't sending that
field yet (US-020 still finishing), the Override Model panel in the
Models tab does NOT affect Codex — Codex uses its own dedicated path.

### Models list is empty after Test
The provider returned no `data[].id` entries. You can still type a
model id manually in the Codex chat, or run `curl -H "Authorization:
Bearer $KEY" https://9router.halotec.my.id/v1/models` from the terminal
to see what 9router advertises.

## 5. Where to find more

- **Architecture decision record**: `docs/adr/0001-custom-providers.md`
- **OpenSpec proposal**: `openspec/changes/add-custom-providers/proposal.md`
- **Spec deltas**: `openspec/changes/add-custom-providers/specs/custom-providers/spec.md`
- **Phase 2 release notes**: `CHANGELOG.md` v0.0.79 entry
