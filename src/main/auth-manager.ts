/**
 * auth-manager.ts — shim for Halotec Code (US-006).
 *
 * Upstream 1code implemented cloud auth here (token exchange, refresh,
 * cookie management against 21st.dev). Halotec Code is local-first:
 * the real implementation now lives in lib/auth/local-auth-service.ts.
 *
 * This file re-exports LocalAuthService under the original AuthManager
 * names so the 15+ existing import sites compile unchanged.
 *
 * Option A from the US-006 design spec: shim re-export, no consumer
 * rewrites.
 */

export {
  LocalAuthService as AuthManager,
  initLocalAuthService as initAuthManager,
  getLocalAuthService as getAuthManager,
  type LocalAuthUser as AuthUser,
  type LocalAuthData as AuthData,
} from "./lib/auth/local-auth-service"
