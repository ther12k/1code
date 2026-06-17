/**
 * No-op tRPC client stub (Halotec Code local-only fork).
 *
 * The Halotec Code fork does not contact 21st.dev / 1code.dev. All remote
 * queries return empty / safe defaults, all remote mutations are no-ops.
 * Consumers compile and run unchanged — they just see an empty remote
 * backend (no Pro/Max/subscription data, no remote sandbox chats, no
 * automations, no remote GitHub/Linear integrations).
 *
 * Return types are intentionally `any` to preserve the consumer-side
 * shape that the upstream tRPC client provided. This is a stub — the
 * runtime values are empty/safe, not the upstream real values.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type NoOpQuery = { query: (...args: any[]) => Promise<any> }
type NoOpMutation = { mutate: (...args: any[]) => Promise<any> }

const noopQuery = (value: any = null): NoOpQuery => ({
  query: async () => value,
})
const noopList = (value: any[] = []): NoOpQuery => ({
  query: async () => value,
})
const noopMutation = (value: any = undefined): NoOpMutation => ({
  mutate: async () => value,
})

export const remoteTrpc = {
  agents: {
    archiveChat: noopMutation(),
    archiveChatsBatch: noopMutation({ archivedCount: 0 }),
    getAgentChat: noopQuery(),
    getAgentChats: noopList([]),
    // Subscription is the one query consumers actually inspect — return
    // { type: "free" } so paid-plan UI gates stay closed in non-dev builds.
    getAgentsSubscription: noopQuery({ type: "free" }),
    getArchivedChats: noopList([]),
    renameChat: noopMutation(),
    renameSubChat: noopMutation(),
    restoreChat: noopMutation(),
  },
  automations: {
    createAutomation: noopMutation(),
    deleteAutomation: noopMutation(),
    getAutomation: noopQuery(),
    getInboxChats: noopList([]),
    getInboxUnreadCount: noopQuery({ count: 0 }),
    listAutomations: noopList([]),
    listExecutions: noopList([]),
    markAllInboxItemsRead: noopMutation(),
    markInboxItemRead: noopMutation(),
    updateAutomation: noopMutation(),
  },
  github: {
    getConnectionStatus: noopQuery({ connected: false }),
  },
  linear: {
    getIntegration: noopQuery(),
  },
  teams: {
    getUserTeams: noopList([]),
  },
}
