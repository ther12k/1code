/**
 * Remote API — no-op stub for the Halotec Code local-first fork.
 *
 * The fork has no remote backend. All collection reads return empty
 * arrays, all writes are no-ops, and sandbox file/diff operations
 * throw a clear "local-only" error so any consumer that does try to
 * fetch a remote sandbox file gets a deterministic failure rather than
 * a hang.
 *
 * Consumers compile and run unchanged — they just see an empty remote
 * backend.
 */

const LOCAL_ONLY = "Halotec Code is a local-only build: remote API is disabled"

export type Team = {
  id: string
  name: string
  slug?: string
}

export type RemoteChat = {
  id: string
  name: string
  sandbox_id: string | null
  meta: {
    repository?: string
    github_repo?: string
    branch?: string | null
    originalSandboxId?: string | null
    isQuickSetup?: boolean
    isPublicImport?: boolean
  } | null
  created_at: string
  updated_at: string
  stats: { fileCount: number; additions: number; deletions: number } | null
}

export type RemoteSubChat = {
  id: string
  name: string
  mode: string
  messages: unknown[]
  stream_id: string | null
  created_at: string
  updated_at: string
}

export type RemoteChatWithSubChats = RemoteChat & {
  subChats: RemoteSubChat[]
}

export const remoteApi = {
  async getTeams(): Promise<Team[]> {
    return []
  },

  async getAgentChats(_teamId: string): Promise<RemoteChat[]> {
    return []
  },

  async getAgentChat(_chatId: string): Promise<RemoteChatWithSubChats> {
    throw new Error(LOCAL_ONLY)
  },

  async getArchivedChats(_teamId: string): Promise<RemoteChat[]> {
    return []
  },

  async archiveChat(_chatId: string): Promise<void> {},

  async archiveChatsBatch(_chatIds: string[]): Promise<{ archivedCount: number }> {
    return { archivedCount: 0 }
  },

  async restoreChat(_chatId: string): Promise<void> {},

  async renameSubChat(_subChatId: string, _name: string): Promise<void> {},

  async renameChat(_chatId: string, _name: string): Promise<void> {},

  async getSandboxDiff(_sandboxId: string): Promise<{ diff: string }> {
    throw new Error(LOCAL_ONLY)
  },

  async getSandboxFile(_sandboxId: string, _path: string): Promise<{ content: string }> {
    throw new Error(LOCAL_ONLY)
  },
}
