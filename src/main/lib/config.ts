/**
 * Shared configuration for the desktop app
 */
import { app } from "electron"

const IS_DEV = !!process.env.ELECTRON_RENDERER_URL

/**
 * Local-first build: API base URL resolves to localhost only.
 * Packaged apps have no upstream backend; the value is a sentinel
 * ("") so any straggling fetch call that accidentally hits it fails
 * fast at the network layer instead of leaking to a remote host.
 */
export function getApiUrl(): string {
  if (app.isPackaged) {
    return ""
  }
  return import.meta.env.MAIN_VITE_API_URL || ""
}

/**
 * Check if running in development mode
 */
export function isDev(): boolean {
  return IS_DEV
}
