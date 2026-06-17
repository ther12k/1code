/**
 * No-op analytics stub for Halotec Code (local-first fork).
 *
 * Upstream 1code used PostHog JS SDK for renderer-side telemetry. This
 * module preserves the public surface so existing callers compile and
 * run unchanged, but every call is a no-op. No data leaves the machine.
 */

let currentUserId: string | null = null
let initialized = false

export async function initAnalytics(): Promise<void> {
  initialized = true
}

export function capture(
  _eventName: string,
  _properties?: Record<string, any>,
): void {
  // no-op
}

export function identify(
  userId: string,
  _traits?: Record<string, any>,
): void {
  currentUserId = userId
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export function reset(): void {
  currentUserId = null
}

export function shutdown(): void {
  initialized = false
}

// Renderer-specific event helpers
export function trackMessageSent(_data: {
  workspaceId: string
  messageLength: number
  mode: "plan" | "agent"
}): void {
  // no-op
}
