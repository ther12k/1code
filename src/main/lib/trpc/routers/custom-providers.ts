import { eq } from "drizzle-orm"
import { safeStorage } from "electron"
import { z } from "zod"
import { customProviders, getDatabase } from "../../db"
import { publicProcedure, router } from "../index"

/**
 * Encrypt token using Electron's safeStorage.
 * Returns base64 so we can store it in a TEXT column.
 */
function encryptKey(key: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    console.warn(
      "[CustomProviders] Encryption not available, storing as base64 fallback",
    )
    return Buffer.from(key).toString("base64")
  }
  return safeStorage.encryptString(key).toString("base64")
}

/**
 * Decrypt token from base64 safeStorage ciphertext.
 */
function decryptKey(encrypted: string): string {
  if (!safeStorage.isEncryptionAvailable()) {
    return Buffer.from(encrypted, "base64").toString("utf-8")
  }
  return safeStorage.decryptString(Buffer.from(encrypted, "base64"))
}

const providerType = z.enum(["anthropic", "openai"])

const inputSchema = z.object({
  name: z.string().min(1).max(100),
  type: providerType,
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  defaultModel: z.string().optional(),
  modelsJson: z.array(z.string()).optional(),
  enabled: z.boolean().optional().default(true),
})

/** Provider row returned by list/get — never includes the raw key. */
type PublicProvider = {
  id: string
  name: string
  type: "anthropic" | "openai"
  baseUrl: string
  hasApiKey: boolean
  defaultModel: string | null
  models: string[]
  enabled: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

function toPublic(row: typeof customProviders.$inferSelect): PublicProvider {
  let models: string[] = []
  try {
    const parsed = JSON.parse(row.modelsJson ?? "[]")
    if (Array.isArray(parsed)) models = parsed.filter((m) => typeof m === "string")
  } catch {
    // ignore malformed JSON; treat as empty
  }
  return {
    id: row.id,
    name: row.name,
    type: row.type as "anthropic" | "openai",
    baseUrl: row.baseUrl,
    hasApiKey: Boolean(row.apiKeyEncrypted),
    defaultModel: row.defaultModel,
    models,
    enabled: row.enabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/**
 * Resolve a custom provider id into its decrypted credentials.
 * Returns null when the id is missing or the provider is disabled.
 * Used internally by claude/codex routers — never exposed via tRPC.
 */
export async function resolveCustomProvider(id: string | null | undefined) {
  if (!id) return null
  const db = getDatabase()
  const rows = await db
    .select()
    .from(customProviders)
    .where(eq(customProviders.id, id))
    .limit(1)
  const row = rows[0]
  if (!row || !row.enabled) return null
  return {
    id: row.id,
    name: row.name,
    type: row.type as "anthropic" | "openai",
    baseUrl: row.baseUrl,
    apiKey: decryptKey(row.apiKeyEncrypted),
    defaultModel: row.defaultModel,
  }
}

/**
 * Build the absolute /v1/models URL for a provider.
 * Strips trailing slashes from baseUrl before appending.
 */
export function modelsUrlFor(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "")
  return `${trimmed}/v1/models`
}

/**
 * Probe /v1/models on the custom provider to verify connectivity +
 * discover available models. Accepts both OpenAI-style {data:[{id}]}
 * and Anthropic-style {data:[{id}]} payloads (same shape).
 */
export async function probeProvider(opts: {
  baseUrl: string
  apiKey: string
  type: "anthropic" | "openai"
}): Promise<{ ok: boolean; models: string[]; error?: string }> {
  const url = modelsUrlFor(opts.baseUrl)
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        // Anthropic uses x-api-key; OpenAI uses Authorization: Bearer.
        // Send both — most gateways accept either.
        "x-api-key": opts.apiKey,
        Authorization: `Bearer ${opts.apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      return {
        ok: false,
        models: [],
        error: `HTTP ${res.status} ${res.statusText}`,
      }
    }
    const body = (await res.json()) as { data?: Array<{ id?: string }> }
    const models = (body.data ?? [])
      .map((m) => m.id)
      .filter((id): id is string => typeof id === "string")
    return { ok: true, models }
  } catch (err) {
    return {
      ok: false,
      models: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export const customProvidersRouter = router({
  list: publicProcedure.query(async () => {
    const db = getDatabase()
    const rows = await db.select().from(customProviders)
    return rows.map(toPublic)
  }),

  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase()
      const rows = await db
        .select()
        .from(customProviders)
        .where(eq(customProviders.id, input.id))
        .limit(1)
      const row = rows[0]
      return row ? toPublic(row) : null
    }),

  create: publicProcedure
    .input(inputSchema)
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const encrypted = encryptKey(input.apiKey)
      const inserted = await db
        .insert(customProviders)
        .values({
          name: input.name,
          type: input.type,
          baseUrl: input.baseUrl,
          apiKeyEncrypted: encrypted,
          defaultModel: input.defaultModel ?? null,
          modelsJson: JSON.stringify(input.modelsJson ?? []),
          enabled: input.enabled ?? true,
        })
        .returning()
      return toPublic(inserted[0])
    }),

  update: publicProcedure
    .input(
      inputSchema.partial().extend({ id: z.string() }),
    )
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const { id, apiKey, modelsJson, ...rest } = input
      const updates: Record<string, unknown> = { ...rest, updatedAt: new Date() }
      if (apiKey) updates.apiKeyEncrypted = encryptKey(apiKey)
      if (modelsJson) updates.modelsJson = JSON.stringify(modelsJson)
      const updated = await db
        .update(customProviders)
        .set(updates)
        .where(eq(customProviders.id, id))
        .returning()
      return updated[0] ? toPublic(updated[0]) : null
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      await db.delete(customProviders).where(eq(customProviders.id, input.id))
      return { id: input.id, deleted: true }
    }),

  testConnection: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const rows = await db
        .select()
        .from(customProviders)
        .where(eq(customProviders.id, input.id))
        .limit(1)
      const row = rows[0]
      if (!row) return { ok: false, models: [], error: "Provider not found" }
      const result = await probeProvider({
        baseUrl: row.baseUrl,
        apiKey: decryptKey(row.apiKeyEncrypted),
        type: row.type as "anthropic" | "openai",
      })
      // Persist discovered models so the UI can show them
      if (result.ok && result.models.length > 0) {
        await db
          .update(customProviders)
          .set({ modelsJson: JSON.stringify(result.models), updatedAt: new Date() })
          .where(eq(customProviders.id, input.id))
      }
      return result
    }),
})
