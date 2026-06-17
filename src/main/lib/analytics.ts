/**
 * No-op analytics stub for Halotec Code (local-first fork).
 *
 * Upstream 1code used PostHog for telemetry. This module preserves the
 * public surface so existing callers compile and run unchanged, but
 * every call is a no-op. No data leaves the machine.
 */

// Renderer + Main shared state (intentionally a no-op).
let currentUserId: string | null = null

export function setOptOut(_optedOut: boolean): void {
  // no-op: there is no analytics provider to opt out of
}

export function setSubscriptionPlan(_plan: string): void {
  // no-op
}

export function setConnectionMethod(_method: string): void {
  // no-op
}

export async function initAnalytics(): Promise<void> {
  // no-op
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
  // Keep track of the last identified user locally for diagnostics only.
  currentUserId = userId
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export function reset(): void {
  currentUserId = null
}

export async function shutdown(): Promise<void> {
  // no-op
}

// ============================================================================
// Event helpers — all no-ops
// ============================================================================

export function trackAppOpened(): void {
  // no-op
}

export function trackAuthCompleted(_userId: string, _email?: string): void {
  // no-op
}

export function trackProjectOpened(_project: {
  id: string
  name: string
  path?: string
}): void {
  // no-op
}

export function trackWorkspaceCreated(_workspace: {
  id: string
  name: string
  projectId: string
}): void {
  // no-op
}

export function trackWorkspaceArchived(_workspaceId: string): void {
  // no-op
}

export function trackWorkspaceDeleted(_workspaceId: string): void {
  // no-op
}

export function trackMessageSent(_data: {
  workspaceId: string
  messageLength: number
  mode: "plan" | "agent"
}): void {
  // no-op
}

export function trackPRCreated(_data: {
  workspaceId: string
  prNumber: number
  prUrl: string
}): void {
  // no-op
}

export function trackCommitCreated(_data: {
  workspaceId: string
  branch: string
}): void {
  // no-op
}

export function trackSubChatCreated(_data: {
  workspaceId: string
  parentChatId: string
}): void {
  // no-op
}
