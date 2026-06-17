/**
 * No-op auto-updater for Halotec Code (local-first fork).
 *
 * Upstream 1code used `electron-updater` against `cdn.21st.dev` for in-app
 * updates. This module preserves the public surface so existing callers
 * in main/index.ts compile and run unchanged, but every function is a
 * no-op. No HTTP traffic is generated, no IPC handlers are registered.
 *
 * Distribution is expected to happen out-of-band (internal package
 * repository) per Halotec Code's release process.
 */

import type { BrowserWindow } from "electron"

let updateChannel: "latest" | "beta" = "latest"

export async function initAutoUpdater(
  _getWindows: () => BrowserWindow[],
): Promise<void> {
  // no-op
}

export async function checkForUpdates(_force = false): Promise<void> {
  // no-op: no remote update server
}

export async function downloadUpdate(): Promise<void> {
  // no-op
}

export function setupFocusUpdateCheck(
  _getWindows: () => BrowserWindow[],
): void {
  // no-op
}

export function getUpdateChannel(): "latest" | "beta" {
  return updateChannel
}

export function setUpdateChannel(channel: "latest" | "beta"): void {
  updateChannel = channel
}
