import { getApiBaseUrl } from "./config/env";

export const TOKEN_KEY = "qeema_admin_token";
export const USER_KEY = "qeema_admin_user";

/** Socket.io URL: explicit API host, else current origin (Vite proxy). */
export function getSocketUrl(): string {
  const base = getApiBaseUrl();
  return base.length > 0 ? base : window.location.origin;
}
