/**
 * No-op update-checker hook for Halotec Code (local-first fork).
 *
 * Upstream 1code checked `cdn.21st.dev` for updates via electron-updater.
 * The local fork does not contact any update server; updates are
 * distributed out-of-band. The hook is preserved so existing UI bindings
 * compile and render, but every action is a no-op and the state stays
 * permanently `idle` (no update available).
 */

import { useCallback } from "react"
import { useAtom } from "jotai"
import { updateStateAtom, type UpdateState } from "../atoms"

const NO_UPDATE: UpdateState = { status: "idle" }

export function useUpdateChecker() {
  const [, setState] = useAtom(updateStateAtom)

  // No event subscription: there is no update server to receive events from.
  // The atom is forced to `idle` once on mount.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setState(NO_UPDATE)
  }

  const checkForUpdates = useCallback(() => {
    setState(NO_UPDATE)
  }, [setState])

  const downloadUpdate = useCallback(() => {
    // no-op
  }, [])

  const installUpdate = useCallback(() => {
    // no-op
  }, [])

  const dismissUpdate = useCallback(() => {
    setState(NO_UPDATE)
  }, [setState])

  return {
    state: NO_UPDATE,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
    dismissUpdate,
  }
}

export function clearDismissedUpdate() {
  // no-op
}

export function clearDismissedVersion(_version: string) {
  // no-op
}
