/**
 * API base URL. Empty string uses same-origin (Vite dev proxy to backend).
 * Override with `VITE_API_URL` for explicit hosts (e.g. production API).
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "";
}
