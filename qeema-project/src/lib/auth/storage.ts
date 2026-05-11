import { TOKEN_KEY, USER_KEY } from "@/lib/constants";
import type { UserPublic } from "@/types/models";

/** JWT access token persisted for Axios + route guards. */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): UserPublic | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserPublic;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserPublic): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Clears JWT and cached user (logout + 401 handling). */
export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
