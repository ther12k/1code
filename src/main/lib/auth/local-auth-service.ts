/**
 * LocalAuthService — local-first replacement for upstream AuthManager.
 *
 * Halotec Code does not contact any remote auth server. This service
 * preserves the AuthManager public surface (class + singleton helpers)
 * so consumers compile and run unchanged, but every method is a no-op
 * or returns a stable local identity. No HTTP, no token exchange, no
 * refresh, no cookie domain.
 */

import type { BrowserWindow } from "electron"

export interface LocalAuthUser {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
  username: string | null
}

export interface LocalAuthData {
  token: string
  refreshToken: string
  expiresAt: string
  user: LocalAuthUser
}

const DEFAULT_USER: LocalAuthUser = {
  id: "local-user",
  email: "local@halotec.code",
  name: "Local User",
  imageUrl: null,
  username: "local-user",
}

// ~ year 2099; no practical expiration
const FAR_FUTURE_ISO = "2099-12-31T00:00:00.000Z"

export interface LocalAuthOptions {
  email?: string
  name?: string | null
}

/**
 * Drop-in replacement for upstream AuthManager. All network-coupled
 * methods are no-ops or return local data; the class shape is preserved
 * so existing imports of `AuthManager` / `getAuthManager()` keep working.
 */
export class LocalAuthService {
  private readonly user: LocalAuthUser
  private readonly authData: LocalAuthData
  private onTokenRefreshCb?: (d: LocalAuthData) => void

  constructor(opts: LocalAuthOptions = {}) {
    this.user = {
      ...DEFAULT_USER,
      email: opts.email ?? DEFAULT_USER.email,
      name: opts.name !== undefined ? opts.name : DEFAULT_USER.name,
    }
    this.authData = {
      token: "halotec-local-token",
      refreshToken: "halotec-local-refresh",
      expiresAt: FAR_FUTURE_ISO,
      user: this.user,
    }
  }

  // Mirrored AuthManager surface ------------------------------------------

  /** Always authenticated as the local user. */
  isAuthenticated(): boolean {
    return true
  }

  /** Returns the stable local user. */
  getUser(): LocalAuthUser {
    return this.user
  }

  /** Returns the stable local auth data. */
  getAuth(): LocalAuthData {
    return this.authData
  }

  /** Resolves to the local token. No refresh, no HTTP. */
  async getValidToken(): Promise<string | null> {
    return this.authData.token
  }

  /** No-op refresh; resolves true. */
  async refresh(): Promise<boolean> {
    if (this.onTokenRefreshCb) {
      try {
        this.onTokenRefreshCb(this.authData)
      } catch {
        // ignore consumer errors
      }
    }
    return true
  }

  /** No-op code exchange; returns local data. Kept for deep-link compat. */
  async exchangeCode(_code: string): Promise<LocalAuthData> {
    return this.authData
  }

  /** No-op. The browser auth flow does not exist in Halotec Code. */
  startAuthFlow(_mainWindow: BrowserWindow | null): void {
    // no-op
  }

  /** No-op. Local user cannot be logged out. */
  logout(): void {
    // no-op
  }

  /** Updates the in-memory name only (not persisted). */
  async updateUser(updates: { name?: string }): Promise<LocalAuthUser> {
    if (updates.name !== undefined) {
      this.user.name = updates.name
    }
    return this.user
  }

  /** Returns a synthetic local plan. No HTTP. */
  async fetchUserPlan(): Promise<{
    email: string
    plan: "local"
    status: "active"
  }> {
    return { email: this.user.email, plan: "local", status: "active" }
  }

  /** Stored for parity; never invoked automatically (no refresh timer). */
  setOnTokenRefresh(cb: (d: LocalAuthData) => void): void {
    this.onTokenRefreshCb = cb
  }
}

// Singleton parity with upstream auth-manager.ts ---------------------------

let instance: LocalAuthService | null = null

export function initLocalAuthService(
  opts?: LocalAuthOptions,
): LocalAuthService {
  if (!instance) {
    instance = new LocalAuthService(opts)
  }
  return instance
}

export function getLocalAuthService(): LocalAuthService | null {
  return instance
}
