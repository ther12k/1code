/**
 * auth-manager.ts — shim for Halotec Code (US-006).
 *
 * Local-first fork: real implementation lives in
 * lib/auth/local-auth-service.ts. This file re-exports LocalAuthService
 * under the original AuthManager names so the existing import sites
 * compile unchanged.
 */

export {
  LocalAuthService as AuthManager,
  initLocalAuthService as initAuthManager,
  getLocalAuthService as getAuthManager,
  type LocalAuthUser as AuthUser,
  type LocalAuthData as AuthData,
} from "./lib/auth/local-auth-service"
